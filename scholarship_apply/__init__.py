"""
獎助學金線上申請：上傳證明文件 → 生輔組審核 → 核准後產生電子章核定通知

- 學生只能申請「符合」且還沒截止的獎學金 (後端重新比對，不信任前端)，同一項不能重複送件
- 文件限 PDF / JPG / PNG，每個檔案 5 MB 以內、最多 5 個、合計 15 MB 以內；會檢查檔頭，改副檔名的檔案會被擋
- 文件存在 data/scholarship_uploads (不在 static 底下，不能用網址直接打開)，
  只有學生本人、綁定家長、教職員/管理員可以下載
- 核准時蓋電子章：核定字號 + 驗證碼 (SHA-256 摘要，綁申請內容與上傳檔案)；
  /scholarship/applications/<id>/certificate 是可列印的核定通知，/api/scholarships/stamp/<驗證碼> 可查驗真偽

app.py 呼叫 scholarship_apply.init_app(app, deps)；deps 提供 fetch_db_rows、db_execute、write_audit_log、
match_for(student_id) → {獎學金 id: 比對結果}、load_scholarships、load_student、notify_student、upload_dir。
/scholarship/<id>/form-template 是申請表範本 (空白表 / 填寫範例 + 示範章)。
"""
import hashlib
import json
import os
import uuid
from datetime import datetime
from types import SimpleNamespace

from flask import Blueprint, abort, jsonify, render_template, request, send_from_directory, session
from werkzeug.utils import secure_filename

bp = Blueprint("scholarship_apply", __name__, template_folder="templates")
deps = SimpleNamespace()

RUNNING, APPROVED, REJECTED, WITHDRAWN = "審核中", "已核准", "已退回", "已撤回"
STAFF = ("管理員", "教職員")
STAMP_OFFICE = "學務處生活輔導組"

MAX_FILE_MB = 5
MAX_FILES = 5
# 合計上限要比 app.py 的 MAX_CONTENT_LENGTH (20 MB) 小，不然 5 個 5 MB 會被 413 擋下、只看到籠統的錯誤訊息
MAX_TOTAL_MB = 15
# 副檔名 → 檔頭；只看副檔名會被「把 .exe 改名成 .pdf」騙過
FILE_SIGNATURES = {"pdf": (b"%PDF",), "png": (b"\x89PNG",), "jpg": (b"\xff\xd8\xff",), "jpeg": (b"\xff\xd8\xff",)}

DEMO_APPLICATIONS = []  # MySQL 離線時暫存在記憶體


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def _now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


# ---------- 需要哪些文件 (依獎學金條件提示) ----------

def required_docs(sch):
    docs = []
    for identity in [x.strip() for x in str(sch.get("identity_required") or "").split(",") if x.strip()]:
        docs.append(f"{identity}證明文件")
    if len(docs) > 1:
        docs = [f"身分證明文件（{'、'.join(d.replace('證明文件', '') for d in docs)} 擇一）"]
    if sch.get("min_gpa") is not None or sch.get("no_fail_required"):
        docs.append("前學期成績單")
    if "計畫書" in str(sch.get("description") or ""):
        docs.append("專題計畫書")
    return docs or ["申請相關證明文件"]


# ---------- 資料存取 (MySQL scholarship_applications；離線用 DEMO_APPLICATIONS) ----------

def _row(r):
    load = lambda v, d: json.loads(v) if isinstance(v, str) else (v if v is not None else d)
    fmt = lambda v: v.strftime("%Y-%m-%d %H:%M:%S") if isinstance(v, datetime) else v
    return {"id": r["id"], "student_id": r["student_id"], "scholarship_id": int(r["scholarship_id"]),
            "scholarship_name": r["scholarship_name"], "status": r["status"],
            "files": load(r.get("files_json", r.get("files")), []), "note": r.get("note") or "",
            "review_note": r.get("review_note") or "", "reviewer": r.get("reviewer") or "",
            "reviewed_at": fmt(r.get("reviewed_at")), "stamp": load(r.get("stamp_json", r.get("stamp")), None),
            "submitted_at": fmt(r["submitted_at"])}


def load_applications(student_id=None):
    sql, params = "SELECT * FROM scholarship_applications", ()
    if student_id:
        sql, params = sql + " WHERE student_id = %s", (student_id,)
    rows = deps.fetch_db_rows(sql + " ORDER BY submitted_at DESC, id DESC", params)
    if rows is None:
        rows = sorted((a for a in DEMO_APPLICATIONS if not student_id or a["student_id"] == student_id),
                      key=lambda a: (a["submitted_at"], a["id"]), reverse=True)
    return [_row(r) for r in rows]


def get_application(app_id):
    rows = deps.fetch_db_rows("SELECT * FROM scholarship_applications WHERE id = %s", (app_id,))
    if rows is None:
        rows = [a for a in DEMO_APPLICATIONS if a["id"] == app_id]
    return _row(rows[0]) if rows else None


def save_status(app, status, expect, **fields):
    """只在狀態仍是 expect 時更新 (兩位承辦同時按核准只會成功一次)"""
    result = deps.db_execute(
        "UPDATE scholarship_applications SET status=%s, review_note=%s, reviewer=%s, reviewed_at=%s, stamp_json=%s "
        "WHERE id=%s AND status=%s",
        (status, fields.get("review_note", ""), fields.get("reviewer", ""), fields.get("reviewed_at"),
         json.dumps(fields["stamp"], ensure_ascii=False) if fields.get("stamp") else None, app["id"], expect))
    if result is not None:
        return result["rowcount"] > 0
    demo = next((a for a in DEMO_APPLICATIONS if a["id"] == app["id"]), None)
    if not demo or demo["status"] != expect:
        return False
    demo.update(status=status, **fields)
    return True


# ---------- 上傳檢查 ----------

def check_files(files):
    """回傳 (錯誤訊息, None) 或 (None, [(檔案物件, 副檔名, 內容), ...])"""
    files = [f for f in files if f and f.filename]
    if not files:
        return "請至少上傳 1 個證明文件", None
    if len(files) > MAX_FILES:
        return f"最多上傳 {MAX_FILES} 個檔案", None
    checked = []
    for f in files:
        name = os.path.basename(f.filename)
        ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
        if ext not in FILE_SIGNATURES:
            return f"「{name}」格式不支援，只能上傳 PDF、JPG、PNG", None
        data = f.read()
        if not data:
            return f"「{name}」是空檔案", None
        if len(data) > MAX_FILE_MB * 1024 * 1024:
            return f"「{name}」超過 {MAX_FILE_MB} MB（目前 {len(data) / 1024 / 1024:.1f} MB），請壓縮或改用較低解析度掃描", None
        if not data.startswith(FILE_SIGNATURES[ext]):
            return f"「{name}」內容不是真的 {ext.upper()} 檔，請重新匯出後再上傳", None
        checked.append((name, ext, data))
    total = sum(len(d) for _, _, d in checked)
    if total > MAX_TOTAL_MB * 1024 * 1024:
        return f"檔案合計超過 {MAX_TOTAL_MB} MB（目前 {total / 1024 / 1024:.1f} MB），請壓縮或分開送件", None
    return None, checked


def store_files(student_id, checked):
    os.makedirs(deps.upload_dir, exist_ok=True)
    saved = []
    for name, ext, data in checked:
        stored = f"sch_{secure_filename(student_id)}_{datetime.now():%Y%m%d%H%M%S}_{uuid.uuid4().hex[:8]}.{ext}"
        with open(os.path.join(deps.upload_dir, stored), "wb") as fh:
            fh.write(data)
        saved.append({"name": name, "stored": stored, "size": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    return saved


# ---------- 電子章 ----------

def make_stamp(app, reviewer, at):
    """核定字號 + 驗證碼：驗證碼由申請內容與每個檔案的 SHA-256 算出，內容被改過就對不上"""
    payload = json.dumps({"id": app["id"], "student_id": app["student_id"], "scholarship_id": app["scholarship_id"],
                          "files": [f["sha256"] for f in app["files"]], "at": at, "office": STAMP_OFFICE},
                         sort_keys=True, ensure_ascii=False)
    return {"no": f"康大學輔字第 {at[:4]}{app['id']:05d} 號", "office": STAMP_OFFICE, "by": reviewer, "at": at,
            "code": hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16].upper()}


def public_view(app, student=None):
    """給前端的資料：檔案不回傳存放檔名"""
    return {**{k: v for k, v in app.items() if k != "files"},
            "files": [{"name": f["name"], "size": f["size"], "url": f"/api/scholarships/applications/{app['id']}/files/{i}"}
                      for i, f in enumerate(app["files"])],
            "certificate_url": f"/scholarship/applications/{app['id']}/certificate" if app["status"] == APPROVED else None,
            "student_name": (student or {}).get("full_name", ""), "class_name": (student or {}).get("class_name", "")}


def _auth(roles):
    """未登入 401、身分不對 403；通過回傳 None"""
    if "username" not in session:
        return _error("請先登入", 401)
    if session.get("role") not in roles:
        return _error("你的身分無法使用這項功能", 403)
    return None


def _can_view(app):
    if session.get("role") in STAFF:
        return True
    return session.get("role") in ("學生", "家長") and session.get("student_id") == app["student_id"]


# ---------- 學生：申請、查看、撤回 ----------

@bp.route("/api/scholarships/<int:sch_id>/apply", methods=["POST"])
def apply(sch_id):
    """multipart/form-data：files (可多個)、note (選填)"""
    if "username" not in session:
        return _error("請先登入學生帳號", 401)
    if session.get("role") != "學生" or not session.get("student_id"):
        return _error("獎助學金只能由學生本人申請", 403)
    student_id = session["student_id"]
    result = deps.match_for(student_id).get(sch_id)
    if not result:
        return _error("找不到這項獎助學金", 404)
    if result["days_left"] < 0:
        return _error("這項獎助學金已經截止")
    if result["status"] != "符合":
        return _error("你目前不符合這項獎助學金的申請資格：" + "、".join(result["missing"]))
    if any(a["scholarship_id"] == sch_id and a["status"] in (RUNNING, APPROVED) for a in load_applications(student_id)):
        return _error("這項獎助學金你已經申請過了，請到「我的申請」查看進度", 409)
    message, checked = check_files(request.files.getlist("files"))
    if message:
        return _error(message)
    note = str(request.form.get("note") or "").strip()[:300]
    files = store_files(student_id, checked)
    now = _now()
    saved = deps.db_execute(
        "INSERT INTO scholarship_applications (student_id, scholarship_id, scholarship_name, status, files_json, note, submitted_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (student_id, sch_id, result["name"], RUNNING, json.dumps(files, ensure_ascii=False), note, now))
    if saved is not None:
        app_id = saved["lastrowid"]
    else:
        app_id = max((a["id"] for a in DEMO_APPLICATIONS), default=0) + 1
        DEMO_APPLICATIONS.append({"id": app_id, "student_id": student_id, "scholarship_id": sch_id,
                                  "scholarship_name": result["name"], "status": RUNNING, "files": files, "note": note,
                                  "review_note": "", "reviewer": "", "reviewed_at": None, "stamp": None, "submitted_at": now})
    deps.write_audit_log("scholarship_applications", app_id, "新增", after={"scholarship_id": sch_id, "files": len(files)})
    return jsonify({"status": "success", "message": f"已送出「{result['name']}」申請，共 {len(files)} 個文件，等待生輔組審核",
                    "data": public_view(get_application(app_id))}), 201


@bp.route("/api/scholarships/applications/mine", methods=["GET"])
def mine():
    denied = _auth(("學生", "家長"))
    if denied:
        return denied
    if not session.get("student_id"):
        return _error("帳號沒有綁定學號", 403)
    return jsonify({"status": "success", "required_docs_limit": {"max_mb": MAX_FILE_MB, "max_files": MAX_FILES, "max_total_mb": MAX_TOTAL_MB},
                    "data": [public_view(a) for a in load_applications(session["student_id"])]}), 200


@bp.route("/api/scholarships/applications/<int:app_id>/withdraw", methods=["POST"])
def withdraw(app_id):
    denied = _auth(("學生",))
    if denied:
        return denied
    app = get_application(app_id)
    if not app or app["student_id"] != session.get("student_id"):
        return _error("找不到這張申請", 404)
    if not save_status(app, WITHDRAWN, RUNNING, review_note="", reviewer="", reviewed_at=None, stamp=None):
        return _error("只能撤回審核中的申請")
    deps.write_audit_log("scholarship_applications", app_id, "修改", before={"status": RUNNING}, after={"status": WITHDRAWN})
    return jsonify({"status": "success", "message": "已撤回申請"}), 200


@bp.route("/api/scholarships/applications/<int:app_id>/files/<int:index>", methods=["GET"])
def download_file(app_id, index):
    denied = _auth(("學生", "家長") + STAFF)
    if denied:
        return denied
    app = get_application(app_id)
    if not app or not _can_view(app) or not 0 <= index < len(app["files"]):
        abort(404)
    f = app["files"][index]
    return send_from_directory(deps.upload_dir, f["stored"], download_name=f["name"])


# ---------- 生輔組：審核、蓋電子章 ----------

@bp.route("/api/admin/scholarship-applications", methods=["GET"])
def review_list():
    denied = _auth(STAFF)
    if denied:
        return denied
    status = request.args.get("status", RUNNING)
    apps = [a for a in load_applications() if status == "all" or a["status"] == status]
    return jsonify({"status": "success", "data": [public_view(a, deps.load_student(a["student_id"])) for a in apps]}), 200


@bp.route("/api/admin/scholarship-applications/<int:app_id>/review", methods=["POST"])
def review(app_id):
    """{"action": "approve" | "reject", "note": "..."}；退回一定要寫原因"""
    denied = _auth(STAFF)
    if denied:
        return denied
    app = get_application(app_id)
    if not app:
        return _error("找不到這張申請", 404)
    data = request.get_json(silent=True) or {}
    action, note = data.get("action"), str(data.get("note") or "").strip()[:200]
    if action not in ("approve", "reject"):
        return _error("action 須為 approve 或 reject")
    if action == "reject" and not note:
        return _error("退回請寫原因，讓學生知道要補什麼文件")
    reviewer, at = session.get("full_name") or session.get("username"), _now()
    status = APPROVED if action == "approve" else REJECTED
    stamp = make_stamp(app, reviewer, at) if action == "approve" else None
    if not save_status(app, status, RUNNING, review_note=note, reviewer=reviewer, reviewed_at=at, stamp=stamp):
        return _error("這張申請已經處理過了，請重新整理", 409)
    deps.write_audit_log("scholarship_applications", app_id, "修改", before={"status": RUNNING},
                         after={"status": status, "stamp_no": (stamp or {}).get("no")})
    notified = deps.notify_student(app["student_id"], f"【康寧大學】獎助學金「{app['scholarship_name']}」申請{status}")
    message = (f"已核准並蓋上電子章（{stamp['no']}）" if stamp else "已退回") + ("，已通知學生" if notified else "")
    return jsonify({"status": "success", "message": message, "data": public_view(get_application(app_id))}), 200


# ---------- 申請表範本 (空白表 / 填寫範例 + 示範印章) ----------

# 填寫範例用的虛構資料；示範章與浮水印都標「範例」，避免被當成真的文件
SAMPLE_STUDENT = {"full_name": "王小明", "student_id": "S000000", "class_name": "資管系二年甲班", "dept_name": "資訊管理系",
                  "phone": "0912-345-678", "email": "s000000@g.ukn.edu.tw", "address": "臺北市內湖區康寧路三段 75 巷 137 號"}


@bp.route("/scholarship/<int:sch_id>/form-template", methods=["GET"])
def form_template(sch_id):
    """?mode=blank (預設，學生登入時帶入自己的基本資料) 或 ?mode=sample (填寫範例 + 示範章)；可列印或存成 PDF"""
    denied = _auth(("學生", "家長") + STAFF)
    if denied:
        return denied
    sch = next((s for s in deps.load_scholarships() if int(s["id"]) == sch_id), None)
    if not sch:
        abort(404)
    sample = request.args.get("mode") == "sample"
    if sample:
        student = SAMPLE_STUDENT
    elif session.get("role") in ("學生", "家長") and session.get("student_id"):
        student = {**(deps.load_student(session["student_id"]) or {}), "student_id": session["student_id"]}
    else:
        student = {}
    return render_template("scholarship_form_template.html", sch=sch, docs=required_docs(sch), sample=sample,
                           student=student, office=STAMP_OFFICE,
                           limits={"max_mb": MAX_FILE_MB, "max_files": MAX_FILES, "max_total_mb": MAX_TOTAL_MB})


# ---------- 核定通知 (電子章) 與查驗 ----------

@bp.route("/scholarship/applications/<int:app_id>/certificate", methods=["GET"])
def certificate(app_id):
    denied = _auth(("學生", "家長") + STAFF)
    if denied:
        return denied
    app = get_application(app_id)
    if not app or not _can_view(app) or app["status"] != APPROVED or not app["stamp"]:
        abort(404)
    student = deps.load_student(app["student_id"]) or {}
    return render_template("scholarship_certificate.html", app=app, stamp=app["stamp"], student=student)


@bp.route("/api/scholarships/stamp/<code>", methods=["GET"])
def verify_stamp(code):
    """任何人拿到核定通知都能查驗；只回傳遮蔽後的姓名，不回傳學號與文件"""
    code = code.strip().upper()
    app = next((a for a in load_applications() if a["status"] == APPROVED and (a["stamp"] or {}).get("code") == code), None)
    if not app or make_stamp(app, app["stamp"]["by"], app["stamp"]["at"])["code"] != code:
        return jsonify({"status": "success", "valid": False, "message": "查無此驗證碼，或文件內容已被變更"}), 200
    name = (deps.load_student(app["student_id"]) or {}).get("full_name") or ""
    masked = name[:1] + "○" * max(len(name) - 2, 0) + (name[-1:] if len(name) > 1 else "")
    return jsonify({"status": "success", "valid": True, "no": app["stamp"]["no"], "office": app["stamp"]["office"],
                    "scholarship_name": app["scholarship_name"], "student_name": masked, "approved_at": app["stamp"]["at"]}), 200
