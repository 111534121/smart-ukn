"""行政服務線上化：宿舍床位申請與進度、總務處報帳 / 成果報告檢查、獎助學金資格自我檢核、
申辦資料自評表、常用功能置頂設定。
"""
from datetime import date, datetime
from functools import wraps

from flask import Blueprint, request, session

from . import dorm_store
from .common import deps, error, ok, require, store, next_id, now_str, current_user, user_key, STAFF_ROLES

bp = Blueprint("campus_services", __name__)


# ---------- 常用功能置頂 ----------

DEFAULT_PINNED = ["calendar", "course-plan", "rules", "notices"]
STAFF_DEFAULT_PINNED = ["my-schedule", "notices", "graduation", "certs", "calendar"]  # 老師、教職員、管理員


def _prefs_db():
    """MySQL 的 user_preferences 有 pinned_features 欄位就存 MySQL (T10)；第一次使用時搬入 JSON 舊資料"""
    if deps.fetch_db_rows("SELECT pinned_features FROM user_preferences LIMIT 1") is None:
        return False
    flags = store.data.setdefault("migrated_to_mysql", {})
    if not flags.get("prefs"):
        with store.lock:
            for key, value in (store.data.get("prefs") or {}).items():
                if key.startswith("user:"):
                    names = [key[5:]]
                else:  # 學生用學號當鍵：找出這個學號的登入帳號
                    names = [r["username"] for r in deps.fetch_db_rows(
                        "SELECT username FROM users WHERE student_id = %s", (key,)) or []]
                for name in names:
                    deps.db_execute("INSERT INTO user_preferences (username, pinned_features) VALUES (%s, %s) "
                                    "ON DUPLICATE KEY UPDATE pinned_features = VALUES(pinned_features)",
                                    (name, ",".join(value.get("pinned") or [])))
            flags["prefs"] = True
            store.save()
    return True


@bp.route("/api/campus/prefs", methods=["GET", "PUT"])
@require()
def prefs():
    u = current_user()
    default = STAFF_DEFAULT_PINNED if u["role"] in STAFF_ROLES else DEFAULT_PINNED
    data = (request.get_json(silent=True) or {}) if request.method == "PUT" else {}
    if "session_tour_dismiss" in data:
        # 只存在登入 session，不寫資料庫：共用示範帳號有人暫時關掉導覽，不會害別人也再也看不到，
        # 登出 (session.clear()) 後這個設定就會消失，跟真正「看過/跳過」(tour_seen，永久) 是分開的兩件事
        session["tour_dismissed"] = bool(data["session_tour_dismiss"])
    session_dismissed = bool(session.get("tour_dismissed"))

    if _prefs_db():
        if request.method == "PUT":
            # 置頂與網站導覽分開存不會互相蓋掉：只更新有送來的欄位
            if "pinned" in data:
                pinned = [str(p)[:40] for p in data.get("pinned", [])][:12]
                deps.db_execute("INSERT INTO user_preferences (username, pinned_features) VALUES (%s, %s) "
                                "ON DUPLICATE KEY UPDATE pinned_features = VALUES(pinned_features)",
                                (u["username"], ",".join(pinned)))
            if "tour_seen" in data:
                deps.db_execute("INSERT INTO user_preferences (username, tour_seen) VALUES (%s, %s) "
                                "ON DUPLICATE KEY UPDATE tour_seen = VALUES(tour_seen)",
                                (u["username"], 1 if data["tour_seen"] else 0))
        rows = deps.fetch_db_rows("SELECT pinned_features, tour_seen FROM user_preferences WHERE username = %s", (u["username"],)) or []
        saved = rows[0]["pinned_features"] if rows else None
        tour_seen = bool(rows[0]["tour_seen"]) if rows else False
        return ok(data={"pinned": saved.split(",") if saved else ([] if saved == "" else list(default)),
                        "tour_seen": tour_seen, "session_tour_dismissed": session_dismissed})
    key = user_key()
    with store.lock:
        all_prefs = store.section("prefs", dict)
        default = STAFF_DEFAULT_PINNED if current_user()["role"] in STAFF_ROLES else DEFAULT_PINNED
        mine = all_prefs.setdefault(key, {"pinned": list(default)})
        if request.method == "PUT":
            # 只更新有送來的欄位，置頂與網站導覽分開存不會互相蓋掉
            if "pinned" in data:
                mine["pinned"] = [str(p)[:40] for p in data["pinned"] or []][:12]
            if "tour_seen" in data:
                mine["tour_seen"] = bool(data["tour_seen"])
            store.save()
    # tour_seen：這個帳號是否看過 (或跳過) 網站導覽；新帳號第一次登入時為 False，前端會自動開始導覽
    return ok(data={**mine, "tour_seen": bool(mine.get("tour_seen")), "session_tour_dismissed": session_dismissed})


# ---------- 表單下載：隨時查詢 + 常用表單 ----------

MAX_FAVORITE_FORMS = 20
# 學生找表單常用的說法 (表單名稱裡沒有這些字)
FORM_KEYWORDS = {
    "course_withdraw_form": "棄選 退選 不想修 停修",
    "leave_application_form": "病假 事假 喪假 公假 心理假 生理假 缺課 曠課",
    "english_waiver_form": "英文 多益 托福 全民英檢 英檢 外語 免修 抵免",
    "graduation_audit_form": "畢業 學分 預審 審查 畢業門檻",
    "certificate_reward_form": "證照 比賽 競賽 獎金 獎勵 補助 乙級",
}


def _all_forms():
    """申辦流程有附表單的都列出來 (本站範本可線上填寫、下載 Word、看填寫範例)"""
    from applications.forms import FORMS, form_code_from_url
    from .calendar_ext import load_checklists
    forms = []
    for c in load_checklists():
        url = c.get("form_download_url") or ""
        if not url:
            continue
        code = form_code_from_url(url) or url
        tpl = FORMS.get(code)
        forms.append({
            "code": code,
            "title": tpl["title"] if tpl else c["business_name"],
            "business_name": c["business_name"],
            "office": c.get("category_name") or "",
            "office_location": c.get("office_location") or "",
            "deadline": c.get("deadline_week_info") or "",
            "checklist_id": c["item_id"],
            "keywords": FORM_KEYWORDS.get(code, ""),
            "url": url,
            "word_url": f"{url}?download=doc" if tpl else "",
            "example_url": f"{url}?example=1" if tpl else "",
        })
    return forms


# 【功能：表單下載】表單名稱、業務、處室、口語關鍵字裡找查詢字；三個字以上可錯一個字
def _form_matches(form, q):
    text = " ".join(str(form[k]) for k in ("title", "business_name", "office", "keywords")).lower()
    q = q.lower()
    # 三個字以上打錯一個字也找得到 (例如「畢業審查」找到畢業學分資格預審)；兩個字以內要完全符合
    chars = set(q)
    return q in text or (len(chars) >= 3 and sum(ch in text for ch in chars) >= len(chars) - 1)


def _favorite_forms(u):
    if not u:
        return []
    rows = deps.fetch_db_rows("SELECT favorite_forms FROM user_preferences WHERE username = %s", (u["username"],))
    if rows is not None:
        return [c for c in (rows[0]["favorite_forms"] or "").split(",") if c] if rows else []
    return list((store.data.get("favorite_forms") or {}).get(user_key(), []))


# 【功能：表單下載】列出全部表單，登入者的常用表單排最前面
@bp.route("/api/campus/forms", methods=["GET"])
def forms_list():
    """?q=關鍵字；登入後回傳自己的常用表單 (常用的排前面)"""
    q = request.args.get("q", "").strip()[:30]
    u = current_user()
    favorites = _favorite_forms(u)
    items = [{**f, "is_favorite": f["code"] in favorites} for f in _all_forms() if not q or _form_matches(f, q)]
    items.sort(key=lambda f: (not f["is_favorite"], favorites.index(f["code"]) if f["is_favorite"] else 0, f["title"]))
    return ok(data=items, favorites=favorites, logged_in=bool(u))


@bp.route("/api/campus/forms/favorites", methods=["PUT"])
@require()
def forms_favorites():
    """body：{"code": 表單代碼, "favorite": true/false}"""
    data = request.get_json(silent=True) or {}
    code = str(data.get("code") or "")
    if code not in {f["code"] for f in _all_forms()}:
        return error("找不到這張表單")
    u = current_user()
    favorites = [c for c in _favorite_forms(u) if c != code]
    if data.get("favorite"):
        if len(favorites) >= MAX_FAVORITE_FORMS:
            return error(f"常用表單最多 {MAX_FAVORITE_FORMS} 張，請先移除幾張")
        favorites.append(code)
    saved = None
    try:
        saved = deps.db_execute("INSERT INTO user_preferences (username, favorite_forms) VALUES (%s, %s) "
                                "ON DUPLICATE KEY UPDATE favorite_forms = VALUES(favorite_forms)",
                                (u["username"], ",".join(favorites)))
    except Exception:
        saved = None  # 舊資料庫沒有 favorite_forms 欄位 (未重跑 init_db.py)：改存 JSON
    if saved is None:
        with store.lock:
            store.section("favorite_forms", dict)[user_key()] = favorites
            store.save()
    return ok(message="已加入常用表單" if data.get("favorite") else "已從常用表單移除", favorites=favorites)


# ---------- 申辦資料自評表 (準備好的文件打勾) ----------

@bp.route("/api/campus/checklist-docs", methods=["GET", "POST"])
@require()
def checklist_docs():
    key = user_key()
    with store.lock:
        all_docs = store.section("checklist_docs", dict)
        mine = all_docs.setdefault(key, {})
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            try:
                item = str(int(data.get("item_id", 0)))
                idx = int(data.get("doc_index", -1))
            except (TypeError, ValueError):
                return error("item_id 或 doc_index 格式錯誤")
            if idx < 0:
                return error("doc_index 錯誤")
            done = set(mine.get(item, []))
            if data.get("done"):
                done.add(idx)
            else:
                done.discard(idx)
            mine[item] = sorted(done)
            store.save()
    return ok(data=mine)


# ---------- 宿舍床位申請 ----------

DORM_STAGES = ["已送件", "資格審查", "床位排序", "床位分配", "繳交住宿費", "完成入住"]
DORM_NEXT_ACTION = {
    0: "等待宿舍服務台審查資料（約 3 個工作天）",
    1: "資格審查中，若需補件會通知你",
    2: "依通勤距離與身分排序中，結果將在截止後一週公告",
    3: "已分配床位，請確認床號後繳費",
    4: "請於期限內到出納組或線上繳交住宿費",
    5: "已完成，入住當天請攜帶學生證到宿舍服務台報到",
}


def can_manage_dorm(user):
    """只有資料庫裡真的查到這個帳號、且角色不符時才否決；查無此帳號 (例如 dorm_demo 這類示範
    帳號沒有寫進 MySQL users 表) 就相信登入當下 session 已經確認過的角色/旗標，不要連帶判定沒有權限"""
    if user.get("role") == "管理員": return True
    if user.get("role") == "住宿管理員":
        rows = deps.fetch_db_rows("SELECT role FROM users WHERE username=%s", (user.get("username"),))
        return rows[0]["role"] == "住宿管理員" if rows else True
    if user.get("role") != "教職員": return False
    rows = deps.fetch_db_rows("SELECT role, can_manage_dorm FROM users WHERE username=%s", (user.get("username"),))
    if rows:
        return bool(rows[0].get("role") == "教職員" and rows[0].get("can_manage_dorm"))
    return bool(user.get("can_manage_dorm"))


def dorm_manager_required(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if not can_manage_dorm(current_user()):
            return error("此帳號沒有宿舍管理權限", 403)
        return fn(*args, **kwargs)
    return wrapped


def dorm_apps():
    return dorm_store.all_applications()


# 宿舍床位總表 (示範資料)：分配床位時行政人員用點的，不用自己手key床號
DORM_ROOMS = [
    {"room": "S305", "room_type": "四人房", "beds": 4},
    {"room": "S306", "room_type": "四人房", "beds": 4},
    {"room": "S307", "room_type": "六人房", "beds": 6},
    {"room": "S308", "room_type": "六人房", "beds": 6},
    {"room": "S405", "room_type": "四人房", "beds": 4},
    {"room": "S406", "room_type": "四人房", "beds": 4},
    {"room": "S407", "room_type": "六人房", "beds": 6},
    {"room": "S408", "room_type": "六人房", "beds": 6},
]


def dorm_bed_catalog():
    """全部床位代碼，附上目前是不是已經被「進行中」或「已完成」的申請占用"""
    occupied = {a["bed"]: {"student_name": a["student_name"], "student_id": a["student_id"]}
                for a in dorm_apps() if a.get("bed") and a["status"] in ("進行中", "已完成")}
    beds = []
    for r in DORM_ROOMS:
        for i in range(1, r["beds"] + 1):
            code = f"{r['room']}-{i}"
            beds.append({"bed": code, "room": r["room"], "room_type": r["room_type"],
                         "occupied": code in occupied, "occupied_by": occupied.get(code)})
    return beds


@bp.route("/api/campus/dorm/beds", methods=["GET"])
@require("管理員", "教職員", "住宿管理員")
@dorm_manager_required
def dorm_beds():
    return ok(data=dorm_bed_catalog())


@bp.route("/api/campus/dorm/mine", methods=["GET"])
@require("學生", "家長")
def dorm_mine():
    key = current_user()["student_id"]
    apps = [a for a in dorm_apps() if a["student_id"] == key]
    apps.sort(key=lambda a: a["created_at"], reverse=True)
    return ok(data=[{**a, "stages": DORM_STAGES, "next_action": DORM_NEXT_ACTION.get(a["stage"], "") if a["status"] == "進行中" else a.get("note", "")}
                    for a in apps])


@bp.route("/api/campus/dorm/apply", methods=["POST"])
@require("學生")
def dorm_apply():
    u = current_user()
    data = request.get_json(silent=True) or {}
    semester = str(data.get("semester", "")).strip() or "115-2"
    if len(semester) > 20:
        return error("學期名稱最多 20 字")
    room_type = data.get("room_type") if data.get("room_type") in ("四人房", "六人房", "不限") else None
    try:
        commute = int(data.get("commute_minutes", 0))
    except (TypeError, ValueError):
        commute = 0
    missing = [label for label, v in (("房型", room_type), ("通勤時間", 0 < commute <= 1440), ("緊急聯絡人電話", data.get("emergency_phone")))
               if not v]
    if len(str(data.get("emergency_phone") or "").strip()) > 20:
        return error("緊急聯絡電話最多 20 字")
    if missing:
        return error(f"還沒填：{'、'.join(missing)}")
    with store.lock:
        apps = dorm_apps()
        if any(a["student_id"] == u["student_id"] and a["semester"] == semester and a["status"] != "已取消" for a in apps):
            return error(f"{semester} 學期已經申請過了", 409)
        item = {"student_id": u["student_id"], "student_name": u["full_name"], "semester": semester,
                "room_type": room_type, "commute_minutes": commute, "special_needs": str(data.get("special_needs", ""))[:200],
                "emergency_phone": str(data.get("emergency_phone", ""))[:20], "stage": 0, "status": "進行中",
                "bed": "", "note": "", "history": [{"stage": 0, "at": now_str(), "note": "線上送件"}], "created_at": now_str()}
        try:
            item = dorm_store.insert(item)
        except ValueError as exc:
            return error(str(exc), 409)
    deps.write_audit_log("dorm_applications", item["id"], "新增", after={"student_id": item["student_id"], "semester": semester, "stage": 0})
    return ok(message="已送出宿舍申請，可隨時回來查看進度", data=item)


@bp.route("/api/campus/dorm/applications", methods=["GET"])
@require("管理員", "教職員", "住宿管理員")
@dorm_manager_required
def dorm_all():
    return ok(data=sorted(dorm_apps(), key=lambda a: (-a["commute_minutes"], a["created_at"])), stages=DORM_STAGES)


@bp.route("/api/campus/dorm/applications/<int:app_id>", methods=["POST"])
@require("管理員", "教職員", "住宿管理員")
@dorm_manager_required
def dorm_update(app_id):
    data = request.get_json(silent=True) or {}
    if data.get("action") not in ("advance", "reject"):
        return error("請選擇推進或不通過")
    if data.get("action") == "reject" and not str(data.get("note") or "").strip():
        return error("不通過請填寫原因")
    with store.lock:
        a = next((x for x in dorm_apps() if x["id"] == app_id), None)
        if not a:
            return error("找不到申請", 404)
        if a["status"] != "進行中":
            return error("此申請已結案，無法重複審核", 409)
        previous_stage = a["stage"]
        if data["action"] == "advance" and previous_stage >= 2 and not (str(data.get("bed") or "").strip() or a.get("bed")):
            return error("分配床位前請填寫床號")
        snap = lambda: {"name": a.get("student_name"), "student_id": a.get("student_id"), "status": a.get("status"),
                        "stage": DORM_STAGES[a["stage"]] if isinstance(a.get("stage"), int) and a["stage"] < len(DORM_STAGES) else a.get("stage"),
                        "bed": a.get("bed")}
        before = snap()
        if data.get("action") == "reject":
            a["status"], a["note"] = "未通過", str(data.get("note", ""))[:200]
        else:
            a["stage"] = min(len(DORM_STAGES) - 1, a["stage"] + 1)
            if data.get("bed"):
                a["bed"] = str(data["bed"])[:20]
            if a["stage"] == len(DORM_STAGES) - 1:
                a["status"] = "已完成"
        a["history"].append({"stage": a["stage"], "at": now_str(), "note": str(data.get("note", ""))[:200],
                             "status": a["status"], "reviewed_by": current_user()["username"]})
        if not dorm_store.save_review(a, previous_stage):
            return error("資料已由其他人處理，請重新載入", 409)
    deps.write_audit_log("dorm_applications", app_id, "修改", before=before, after={**snap(), "note": str(data.get("note", ""))[:200]})
    return ok(data=a)


# ---------- 總務處：報帳與成果報告 ----------

# 學生負責的社團 / 計畫 (示範)：報帳截止日與應繳成果報告次數
DEMO_PROJECTS = [
    {"project_id": "P01", "owner": "S112001", "name": "資管科學會 115-1 迎新活動", "budget": 15000,
     "reimburse_deadline": "2026-10-30", "reports_required": 2},
    {"project_id": "P02", "owner": "S112001", "name": "程式設計讀書會 (教學卓越補助)", "budget": 6000,
     "reimburse_deadline": "2026-12-15", "reports_required": 4},
    {"project_id": "P03", "owner": "S112002", "name": "熱舞社 校慶表演", "budget": 8000,
     "reimburse_deadline": "2026-11-20", "reports_required": 1},
]

FORM_FIELDS = {
    "報帳": [("activity", "活動名稱"), ("amount", "報帳金額"), ("invoice_count", "發票 / 收據張數"),
            ("invoice_date", "最早一張發票日期"), ("payee", "受款人 (帳戶戶名)"), ("attachments", "發票照片或掃描檔")],
    "成果報告": [("activity", "活動名稱"), ("held_date", "活動日期"), ("participants", "參加人數"),
               ("summary", "活動成果摘要 (100 字以上)"), ("attachments", "活動照片 (至少 2 張)")],
}
INVOICE_MAX_DAYS = 60  # 發票開立後多久內要報帳 (依總務處規定調整)


def affairs_submissions():
    return store.section("affairs_submissions", list)


def check_form(kind, fields, project):
    missing, warnings = [], []
    for key, label in FORM_FIELDS[kind]:
        v = fields.get(key)
        if v in (None, "", 0, []):
            missing.append(label)
    if kind == "成果報告" and len(str(fields.get("summary", ""))) < 100 and fields.get("summary"):
        missing.append("活動成果摘要還不到 100 字")
    if kind == "成果報告" and isinstance(fields.get("attachments"), int) and 0 < fields["attachments"] < 2:
        missing.append("活動照片至少 2 張")
    if kind == "報帳":
        try:
            amount = float(fields.get("amount") or 0)
            spent = sum(float(s["fields"].get("amount") or 0) for s in affairs_submissions()
                        if s["project_id"] == project["project_id"] and s["kind"] == "報帳" and s["status"] != "退件")
            if amount + spent > project["budget"]:
                warnings.append(f"累計報帳 {amount + spent:.0f} 元超過核定經費 {project['budget']} 元")
        except ValueError:
            missing.append("報帳金額格式錯誤")
        if fields.get("invoice_date"):
            try:
                days = (date.today() - datetime.strptime(fields["invoice_date"], "%Y-%m-%d").date()).days
                if days > INVOICE_MAX_DAYS:
                    warnings.append(f"發票已開立 {days} 天，超過 {INVOICE_MAX_DAYS} 天可能無法核銷")
            except ValueError:
                missing.append("發票日期格式錯誤")
        left = (datetime.strptime(project["reimburse_deadline"], "%Y-%m-%d").date() - date.today()).days
        if left < 0:
            warnings.append("已超過報帳截止日，請先洽總務處")
    return missing, warnings


def project_status(p):
    subs = [s for s in affairs_submissions() if s["project_id"] == p["project_id"]]
    reports = sum(1 for s in subs if s["kind"] == "成果報告" and s["status"] != "退件")
    spent = sum(float(s["fields"].get("amount") or 0) for s in subs if s["kind"] == "報帳" and s["status"] != "退件")
    left = (datetime.strptime(p["reimburse_deadline"], "%Y-%m-%d").date() - date.today()).days
    return {**p, "days_left": left, "reports_submitted": reports, "reports_met": reports >= p["reports_required"],
            "spent": spent, "submissions": sorted(subs, key=lambda s: s["created_at"], reverse=True)}


@bp.route("/api/campus/affairs/mine", methods=["GET"])
@require("學生")
def affairs_mine():
    sid = current_user()["student_id"]
    return ok(projects=[project_status(p) for p in DEMO_PROJECTS if p["owner"] == sid],
              fields={k: [{"key": a, "label": b} for a, b in v] for k, v in FORM_FIELDS.items()},
              invoice_max_days=INVOICE_MAX_DAYS)


@bp.route("/api/campus/affairs/check", methods=["POST"])
@require("學生")
def affairs_check():
    data = request.get_json(silent=True) or {}
    kind = data.get("kind")
    project = next((p for p in DEMO_PROJECTS if p["project_id"] == data.get("project_id")
                    and p["owner"] == current_user()["student_id"]), None)
    if kind not in FORM_FIELDS or not project:
        return error("請選擇計畫與表單類型")
    missing, warnings = check_form(kind, data.get("fields") or {}, project)
    return ok(complete=not missing, missing=missing, warnings=warnings)


@bp.route("/api/campus/affairs/submit", methods=["POST"])
@require("學生")
def affairs_submit():
    u = current_user()
    form = request.form
    kind = form.get("kind")
    project = next((p for p in DEMO_PROJECTS if p["project_id"] == form.get("project_id") and p["owner"] == u["student_id"]), None)
    if kind not in FORM_FIELDS or not project:
        return error("請選擇計畫與表單類型")
    saved = []
    for f in request.files.getlist("files")[:10]:
        if f and f.filename:
            url, original, ftype = deps.save_uploaded_file(f, prefix=f"affairs_{u['student_id']}")
            if not url:
                return error(f"檔案格式不支援：{f.filename}")
            saved.append({"url": url, "name": original, "type": ftype})
    fields = {key: form.get(key, "").strip() for key, _ in FORM_FIELDS[kind] if key != "attachments"}
    fields["attachments"] = len(saved)
    missing, warnings = check_form(kind, fields, project)
    if missing:
        return error(f"資料還沒填完整：{'、'.join(missing)}")
    with store.lock:
        subs = affairs_submissions()
        item = {"id": next_id(subs), "project_id": project["project_id"], "kind": kind, "fields": fields, "files": saved,
                "warnings": warnings, "status": "總務處審核中", "submitted_by": u["full_name"], "created_at": now_str()}
        subs.append(item)
        store.save()
    return ok(message=f"{kind}已線上送出", data=item)


# ---------- 獎助學金資格自我檢核 ----------

# 示範資料：請依生輔組實際公告修改。category 僅供前台分類篩選：校內／市府／就業／升學／出國。
# 市府／就業／升學／出國四筆為政府既有計畫的示範條目，金額與期限請以各主辦機關最新公告為準，
# 本系統不提供線上申請連結，僅作為「有這個管道」的提醒，實際申請請洽對應單位或研發處實習就業組。
SCHOLARSHIPS = [
    {"id": "SCH01", "name": "校內學業優秀獎學金", "category": "校內", "amount": "5,000 元", "deadline": "2026-10-16", "office": "學務處生輔組",
     "criteria": [{"id": "avg", "text": "前一學期學業平均 80 分以上", "auto": "avg_80"},
                  {"id": "conduct", "text": "前一學期未受記過以上處分"},
                  {"id": "credits", "text": "前一學期修習 12 學分以上"}]},
    {"id": "SCH02", "name": "清寒助學金", "category": "校內", "amount": "10,000 元", "deadline": "2026-10-16", "office": "學務處生輔組",
     "criteria": [{"id": "income", "text": "家庭年所得 70 萬元以下"},
                  {"id": "avg", "text": "前一學期學業平均 60 分以上", "auto": "avg_60"},
                  {"id": "other", "text": "本學期未領取其他政府助學金"}]},
    {"id": "SCH03", "name": "專業證照獎勵金", "category": "校內", "amount": "3,000 – 10,000 元", "deadline": "2026-10-09", "office": "研發處實習就業組",
     "criteria": [{"id": "cert", "text": "在學期間取得乙級以上技術士或國際認證", "auto": "has_cert"},
                  {"id": "first", "text": "同一張證照未曾申請過獎勵"}]},
    {"id": "SCH04", "name": "工讀助學金", "category": "校內", "amount": "時薪 190 元", "deadline": "2026-10-02", "office": "學務處生輔組",
     "criteria": [{"id": "time", "text": "每週可排 4 小時以上工讀時段"},
                  {"id": "avg", "text": "前一學期沒有不及格科目", "auto": "no_warning"}]},
    {"id": "SCH05", "name": "臺北市希望助學金", "category": "市府", "amount": "依核定金額發給（參考金額，依公告為準）", "deadline": "2026-10-20", "office": "臺北市政府社會局（可洽學務處生輔組協助）",
     "criteria": [{"id": "residence", "text": "學生本人或監護人設籍臺北市"},
                  {"id": "need", "text": "符合低收入戶、中低收入戶或特殊境遇家庭等經濟弱勢資格"},
                  {"id": "enrolled", "text": "現為在學學生，無休學"}]},
    {"id": "SCH06", "name": "勞動部青年就業讚計畫", "category": "就業", "amount": "依穩定就業情形核發獎勵金（依公告為準）", "deadline": "2026-11-30", "office": "勞動部勞動力發展署（可洽研發處實習就業組）",
     "criteria": [{"id": "grad", "text": "應屆畢業或畢業未滿 1 年"},
                  {"id": "match", "text": "經公立就業服務機構媒合並受僱"},
                  {"id": "stay", "text": "於同一雇主連續在職達規定月數"}]},
    {"id": "SCH07", "name": "青年教育與就業儲蓄帳戶方案", "category": "升學", "amount": "每月定額存款＋政府相對提撥（依公告為準）", "deadline": "2026-12-31", "office": "教育部青年發展署",
     "criteria": [{"id": "age", "text": "高中職畢業或在學應屆畢業，15–20 歲"},
                  {"id": "plan", "text": "規劃以體驗學習銜接未來升學或就業方向"}]},
    {"id": "SCH08", "name": "教育部學海飛颺獎學金（海外研修）", "category": "出國", "amount": "依研修期間核給（參考金額，依公告為準）", "deadline": "2026-09-15", "office": "教育部國際及兩岸教育司（可洽研發處國際交流窗口）",
     "criteria": [{"id": "grade", "text": "大二以上在學學生，學業成績達一定標準"},
                  {"id": "school", "text": "已取得國外姊妹校或合作學校研修名額"},
                  {"id": "plan", "text": "完成研修計畫書並經系所推薦"}]},
]


def auto_answers(student_id):
    records = deps.load_student_credits(student_id)
    if records:
        last_sem = max(r["semester"] for r in records)
        scores = [r["score"] for r in records if r["semester"] == last_sem and r["score"] is not None]
    else:
        scores = []
    avg = round(sum(scores) / len(scores), 1) if scores else None
    has_cert = any(c["student_id"] == student_id and ("乙級" in c["cert_name"] or "甲級" in c["cert_name"]) for c in deps.certificates)
    failed = [r for r in records if not r["is_passed"]]
    return {
        "avg": avg,
        "avg_80": avg is not None and avg >= 80,
        "avg_60": avg is not None and avg >= 60,
        "has_cert": has_cert,
        "no_warning": len(failed) == 0,
    }


@bp.route("/api/campus/scholarships", methods=["GET"])
def scholarships():
    u = current_user()
    auto = auto_answers(u["student_id"]) if u and u.get("student_id") else None
    today = date.today().isoformat()
    items = []
    for s in SCHOLARSHIPS:
        crit = []
        for c in s["criteria"]:
            val = auto.get(c["auto"]) if auto and c.get("auto") else None
            crit.append({**c, "auto_value": val})
        items.append({**s, "criteria": crit, "expired": s["deadline"] < today})
    return ok(data=items, auto=auto, is_demo=True)
