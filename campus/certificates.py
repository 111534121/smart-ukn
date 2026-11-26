"""證照、比賽獎狀與作品集上傳：專業證照經班導初審、行政複審後才算數。

資料存放 (T10)：
- MySQL 的 certificates 已有 review_status 欄位 (執行 init_db.py) → 上傳與審核都存在 certificates 表，
  畢業門檻直接讀同一張表 (只算 kind='證照' 且 review_status='已通過')
- 連不上 MySQL 或還沒補欄位 → 退回 data/campus_store.json (示範模式)，
  通過審核的證照同步加入記憶體的 deps.certificates
- 第一次連上 MySQL 時，自動把 campus_store.json 裡學生上傳的紀錄搬進 certificates
"""
import json

from flask import Blueprint, request

from .common import deps, error, ok, require, store, next_id, now_str, current_user, find_student, all_students

bp = Blueprint("campus_certs", __name__)

KINDS = ("證照", "競賽", "作品")
MAX_FILES = 4

# 可抵免學分的證照門檻：對應校規法規知識庫「語言證照抵免辦法」的既有條文，
# match_keywords 命中其一即視為持有該類證照；之後若有更多抵免規則，照同樣格式往下加即可。
CERT_EXEMPTION_RULES = [
    {
        "id": "toeic550", "match_keywords": ["多益", "TOEIC"], "label": "多益 (TOEIC) 550 分以上",
        "exempts_course": "基礎英文(一)、基礎英文(二)", "credits": 4, "office": "教務處註冊組",
        "note": "通過全民英檢中高級、多益 550 分以上或同等國際英語檢定標準者，得申請抵免。",
    },
    {
        "id": "gept_mid", "match_keywords": ["全民英檢", "GEPT"], "label": "全民英檢 (GEPT) 中高級複試通過",
        "exempts_course": "基礎英文(一)、基礎英文(二)", "credits": 4, "office": "教務處註冊組",
        "note": "通過全民英檢中高級、多益 550 分以上或同等國際英語檢定標準者，得申請抵免。",
    },
]


# 示範模式的比賽與作品：(學號, 類別, 名稱, 主辦單位, 日期, 名次, 說明)
DEMO_CONTESTS_AND_WORKS = [
    ("S112001", "競賽", "校內程式設計競賽", "康寧大學資訊管理科", "2026-05-20", "第二名", ""),
    ("S112002", "競賽", "全國技藝競賽 資訊技術類", "教育部國民及學前教育署", "2026-05-15", "佳作", ""),
    ("S112002", "作品", "校園失物招領 App", "", "2026-06-10", "", "課堂期末專案，可以拍照登記失物"),
    ("S112005", "競賽", "校內英文單字比賽", "康寧大學語言中心", "2026-04-22", "第一名", ""),
]


def exemption_reminder(student_id):
    """回傳這位學生「還沒有，但考到可以抵免學分」的證照清單；已持有同一條規則的證照就不再提醒"""
    held = [i["name"] for i in submissions() if i["student_id"] == student_id and i["status"] == "已通過"]
    reminders = []
    for rule in CERT_EXEMPTION_RULES:
        already = any(kw in name for name in held for kw in rule["match_keywords"])
        if not already:
            reminders.append({k: v for k, v in rule.items() if k != "match_keywords"})
    return reminders


# =====================================================================
# 資料存取：MySQL 有欄位就用 MySQL，否則用 campus_store.json
# =====================================================================

def use_db():
    if deps.fetch_db_rows("SELECT review_status, advisor_reviewer FROM certificates LIMIT 1") is None:
        return False
    _import_json_once()
    return True


def _row_to_item(r):
    try:
        files = json.loads(r.get("attachments") or "[]")
    except ValueError:
        files = []
    return {
        "id": r["cert_id"], "student_id": r["student_id"], "student_name": r.get("full_name") or "",
        "class_name": r.get("class_name") or "", "admission_year": r.get("admission_year"),
        "kind": r.get("kind") or "證照", "name": r["cert_name"], "issuer": r.get("issuing_org") or "",
        "number": r.get("cert_number") or "", "issue_date": str(r.get("issue_date") or "")[:10],
        "award": r.get("award") or "", "description": r.get("description") or "", "files": files,
        "status": r.get("review_status") or "已通過", "reviewer": r.get("reviewer") or "",
        "review_note": r.get("review_note") or "", "advisor_reviewer": r.get("advisor_reviewer") or "",
        "advisor_note": r.get("advisor_note") or "", "advisor_reviewed_at": str(r.get("advisor_reviewed_at") or "")[:19],
        "created_at": str(r.get("created_at") or "")[:19],
        "reviewed_at": str(r.get("reviewed_at") or "")[:19],
    }


def _insert_db(item):
    res = deps.db_execute(
        "INSERT INTO certificates (student_id, kind, cert_name, issuing_org, cert_number, issue_date, award, description, "
        "attachments, review_status, reviewer, review_note, reviewed_at, advisor_reviewer, advisor_note, advisor_reviewed_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (item["student_id"], item["kind"], item["name"], item.get("issuer") or "", item.get("number") or None,
         item.get("issue_date") or None, item.get("award") or None, item.get("description") or None,
         json.dumps(item.get("files") or [], ensure_ascii=False), item["status"], item.get("reviewer") or None,
         item.get("review_note") or None, item.get("reviewed_at") or None,
         item.get("advisor_reviewer") or None, item.get("advisor_note") or None,
         item.get("advisor_reviewed_at") or None))
    return res["lastrowid"]


def _import_json_once():
    """campus_store.json 裡學生上傳的紀錄 (不含「系統匯入」的既有證照) 搬進 MySQL，只做一次"""
    flags = store.data.setdefault("migrated_to_mysql", {})
    if flags.get("cert_submissions"):
        return
    with store.lock:
        for item in store.data.get("cert_submissions") or []:
            if item.get("reviewer") == "系統匯入":
                continue
            _insert_db(item)
        flags["cert_submissions"] = True
        store.save()


def submissions():
    """全部的上傳紀錄 (含系統匯入的既有證照)，格式與 JSON 版相同"""
    if use_db():
        rows = deps.fetch_db_rows(
            "SELECT c.*, s.full_name, s.class_name, s.admission_year FROM certificates c "
            "LEFT JOIN students s ON c.student_id = s.student_id ORDER BY c.cert_id") or []
        return [_row_to_item(r) for r in rows]
    return _json_submissions()


def add_submission(item):
    """item 不含 id；回傳含 id 的完整資料"""
    if use_db():
        new_id = _insert_db(item)
        return next(i for i in submissions() if i["id"] == new_id)
    with store.lock:
        items = _json_submissions()
        full = {"id": next_id(items), **item}
        items.append(full)
        store.save()
    return full


def remove_submission(item_id):
    if use_db():
        deps.db_execute("DELETE FROM certificates WHERE cert_id = %s", (item_id,))
        return
    with store.lock:
        items = _json_submissions()
        items[:] = [i for i in items if i["id"] != item_id]
        store.save()


def save_review(item_id, status, reviewer, note, *, expected_status, advisor=False):
    reviewed_at = now_str()
    if use_db():
        fields = ("advisor_reviewer = %s, advisor_note = %s, advisor_reviewed_at = %s" if advisor else
                  "reviewer = %s, review_note = %s, reviewed_at = %s")
        result = deps.db_execute(f"UPDATE certificates SET review_status = %s, {fields} "
                                 "WHERE cert_id = %s AND review_status = %s",
                                 (status, reviewer, note or None, reviewed_at, item_id, expected_status))
        if not result or result.get('rowcount') != 1:
            return None
        return next(i for i in submissions() if i["id"] == item_id)
    with store.lock:
        item = next(i for i in _json_submissions() if i["id"] == item_id)
        if item['status'] != expected_status:
            return None
        if advisor:
            item.update(status=status, advisor_reviewer=reviewer, advisor_note=note,
                        advisor_reviewed_at=reviewed_at)
        else:
            item.update(status=status, reviewer=reviewer, review_note=note, reviewed_at=reviewed_at)
        store.save()
    return item


def _json_submissions():
    def seed():
        # 既有證照資料視為已審核通過
        items = []
        for c in deps.certificates:
            stu = find_student(c["student_id"]) or {}
            items.append({
                "id": len(items) + 1, "student_id": c["student_id"], "student_name": stu.get("full_name", ""),
                "class_name": stu.get("class_name", ""), "admission_year": stu.get("admission_year"),
                "kind": "證照", "name": c["cert_name"], "issuer": c.get("issuing_org", ""),
                "number": c.get("cert_number", ""), "issue_date": c.get("issue_date", ""), "award": "",
                "description": "", "files": [], "status": "已通過", "reviewer": "系統匯入", "review_note": "",
                "created_at": f"{c.get('issue_date', '')} 00:00:00", "reviewed_at": now_str(),
            })
        # 示範用的比賽與作品 (虛構)
        for sid, kind, name, issuer, issue_date, award, desc in DEMO_CONTESTS_AND_WORKS:
            stu = find_student(sid) or {}
            items.append({
                "id": len(items) + 1, "student_id": sid, "student_name": stu.get("full_name", ""),
                "class_name": stu.get("class_name", ""), "admission_year": stu.get("admission_year"),
                "kind": kind, "name": name, "issuer": issuer, "number": "", "issue_date": issue_date, "award": award,
                "description": desc, "files": [], "status": "已通過", "reviewer": "系統匯入", "review_note": "",
                "created_at": f"{issue_date} 00:00:00", "reviewed_at": now_str(),
            })
        return items
    return store.section("cert_submissions", seed)


def sync_to_graduation(item):
    """示範模式：審核通過的證照加入畢業門檻計算用的記憶體資料 (MySQL 模式讀同一張表，不需要同步)"""
    if item["kind"] != "證照" or item["status"] != "已通過" or use_db():
        return
    if any(c["student_id"] == item["student_id"] and c["cert_name"] == item["name"] for c in deps.certificates):
        return
    deps.certificates.append({
        "cert_id": max((c["cert_id"] for c in deps.certificates), default=0) + 1,
        "student_id": item["student_id"], "cert_name": item["name"], "issuing_org": item["issuer"],
        "cert_number": item["number"], "theory_score": None, "practical_score": None,
        "cert_status": "及格發證", "issue_date": item["issue_date"],
    })


def init_sync():
    for item in submissions():
        sync_to_graduation(item)


def can_review(u, item):
    if u["role"] in ("管理員", "教職員", "處室承辦"):
        from .office_permissions import can_review as office_can_review
        return office_can_review(u, 'certificates')
    if u['role'] == '科助':
        student = find_student(item['student_id']) or {}
        return bool(u.get('dept_id')) and u['dept_id'] == student.get('dept_id')
    return u["role"] == "老師" and u.get("advised_class") and u["advised_class"] == item["class_name"]


@bp.route("/api/campus/certs/mine", methods=["GET"])
@require("學生", "家長")
def my_certs():
    sid = current_user()["student_id"]
    items = [i for i in submissions() if i["student_id"] == sid]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ok(data=items)


@bp.route("/api/campus/certs", methods=["POST"])
@require("學生")
def create_cert():
    u = current_user()
    form = request.form
    kind = form.get("kind", "證照")
    name = form.get("name", "").strip()[:80]
    if kind not in KINDS:
        return error("類別只能是證照、競賽或作品")
    if not name:
        return error("請填寫名稱")
    files = request.files.getlist("files")[:MAX_FILES]
    saved = []
    for f in files:
        if not f or not f.filename:
            continue
        url, original, ftype = deps.save_uploaded_file(f, prefix=f"cert_{u['student_id']}")
        if not url:
            return error(f"檔案格式不支援：{f.filename}（僅限 PDF、PNG、JPG、WEBP）")
        saved.append({"url": url, "name": original, "type": ftype})
    if kind != "作品" and not saved:
        return error("請上傳證書或獎狀的照片 / PDF，班導才能確認")
    stu = find_student(u["student_id"]) or {}
    item = add_submission({
            "student_id": u["student_id"], "student_name": u["full_name"],
            "class_name": stu.get("class_name") or u["class_name"], "admission_year": stu.get("admission_year"),
            "kind": kind, "name": name, "issuer": form.get("issuer", "").strip()[:80],
            "number": form.get("number", "").strip()[:50], "issue_date": form.get("issue_date", "").strip()[:10],
            "award": form.get("award", "").strip()[:60], "description": form.get("description", "").strip()[:500],
            "files": saved, "status": "待審核", "reviewer": "", "review_note": "", "created_at": now_str(),
            "reviewed_at": "",
    })
    return ok(message="已送出，專業證照須先由班導初審，再由行政／科助複審", data=item)


@bp.route("/api/campus/certs/<int:item_id>", methods=["DELETE"])
@require("學生")
def delete_cert(item_id):
    u = current_user()
    item = next((i for i in submissions() if i["id"] == item_id), None)
    if not item or item["student_id"] != u["student_id"]:
        return error("找不到這筆資料", 404)
    if item["status"] == "已通過":
        return error("已通過審核的紀錄不能自行刪除，請洽班導", 403)
    remove_submission(item_id)
    return ok(message="已刪除")


@bp.route("/api/campus/certs/review", methods=["GET"])
@require("老師", "教職員", "處室承辦", "科助", "管理員")
def review_list():
    u = current_user()
    from .office_permissions import can_review as office_can_review
    if u['role'] in ('教職員', '處室承辦') and not office_can_review(u, 'certificates'):
        return error("此處室沒有證照審核權限", 403)
    status = request.args.get("status") or ('待審核' if u['role'] == '老師' else '待複審')
    items = [i for i in submissions() if can_review(u, i) and (status == "全部" or i["status"] == status)]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    scope = (u.get('advised_class') if u['role'] == '老師' else
             u.get('dept_id') if u['role'] == '科助' else '所屬處室' if u['role'] in ('教職員', '處室承辦') else '全校')
    return ok(data=items, scope=scope)


@bp.route("/api/campus/certs/<int:item_id>/review", methods=["POST"])
@require("老師", "教職員", "處室承辦", "科助", "管理員")
def review(item_id):
    u = current_user()
    from .office_permissions import can_review as office_can_review
    if u['role'] in ('教職員', '處室承辦') and not office_can_review(u, 'certificates'):
        return error("此處室沒有證照審核權限", 403)
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    if action not in ("approve", "reject"):
        return error("action 只能是 approve 或 reject")
    note = str(data.get("note", "")).strip()[:200]
    if action == "reject" and not note:
        return error("退回時請寫下原因，學生才知道要補什麼")
    item = next((i for i in submissions() if i["id"] == item_id), None)
    if not item:
        return error("找不到這筆資料", 404)
    if not can_review(u, item):
        return error("沒有此學生或處室的證照審核權限", 403)
    advisor = u['role'] == '老師'
    expected = '待審核' if advisor or item['kind'] != '證照' else '待複審'
    if item['kind'] == '證照' and not advisor and item['status'] == '待審核':
        return error('此證照尚待班導初審', 409)
    if item['status'] != expected:
        return error('案件狀態已變更，請重新整理', 409)
    if item['kind'] == '證照' and not advisor and action == 'approve' and (not item.get('issuer') or not item.get('number')):
        return error('複審前須確認發照機構與證照字號')
    before = {"name": item.get("name"), "student_id": item.get("student_id"), "status": item["status"]}
    next_status = ('待複審' if advisor and item['kind'] == '證照' else '已通過') if action == 'approve' else '已退回'
    item = save_review(item_id, next_status, u["full_name"], note, expected_status=expected,
                       advisor=advisor and item['kind'] == '證照')
    if not item:
        return error('案件狀態已變更，請重新整理', 409)
    deps.write_audit_log("certificates", item_id, "修改", before=before,
                         after={**before, "status": item["status"], "review_note": note})
    sync_to_graduation(item)
    message = ('初審通過，待行政／科助複審' if next_status == '待複審' else
               '複審通過' if next_status == '已通過' and item['kind'] == '證照' else
               '已確認' if action == 'approve' else '已退回')
    return ok(message=message, data=item)


@bp.route('/api/campus/certs/review/batch', methods=['POST'])
@require('老師')
def advisor_batch_review():
    body = request.get_json(silent=True) or {}
    ids = body.get('ids')
    if not isinstance(ids, list) or not 1 <= len(ids) <= 30 or any(not isinstance(i, int) for i in ids) or len(set(ids)) != len(ids):
        return error('請選擇 1 至 30 筆不重複的證照')
    note = str(body.get('note') or '已確認學生證照與學習方向，請行政複審。').strip()[:200]
    u = current_user()
    pending = {i['id']: i for i in submissions() if i['id'] in ids}
    if any(i not in pending or pending[i]['kind'] != '證照' or pending[i]['status'] != '待審核' or
           not can_review(u, pending[i]) for i in ids):
        return error('部分證照已變更或不屬於您的導師班，請重新整理', 409)
    reviewed = []
    for item_id in ids:
        item = save_review(item_id, '待複審', u['full_name'], note, expected_status='待審核', advisor=True)
        if item:
            reviewed.append(item_id)
            deps.write_audit_log('certificates', item_id, '初審',
                                 before={'status': '待審核'}, after={'status': '待複審', 'advisor': u['full_name']})
    return ok(reviewed=reviewed, message=f'已初審 {len(reviewed)} 筆，待行政／科助複審')


@bp.route("/api/campus/certs/exemption-reminder", methods=["GET"])
@require("學生")
def exemption_reminder_route():
    """提醒：現在有管道可以考、考到能申請學分抵免的證照（只列出還沒持有的）"""
    sid = current_user()["student_id"]
    return ok(data=exemption_reminder(sid))


@bp.route("/api/campus/certs/stats", methods=["GET"])
def stats():
    """同年級 (同一入學年度) 各證照的持有人數；只計算已通過審核的"""
    u = current_user()
    year = request.args.get("admission_year", type=int)
    if not year and u and u.get("student_id"):
        year = (find_student(u["student_id"]) or {}).get("admission_year")
    students = [s for s in all_students() if not year or s.get("admission_year") == year]
    sids = {s["student_id"] for s in students}
    approved = [i for i in submissions() if i["status"] == "已通過" and i["student_id"] in sids]
    per_cert = {}
    for kind in KINDS:
        per_cert[kind] = {}
    for i in approved:
        per_cert[i["kind"]].setdefault(i["name"], set()).add(i["student_id"])
    mine = set()
    if u and u.get("student_id"):
        mine = {i["name"] for i in approved if i["student_id"] == u["student_id"]}
    total = len(sids)

    def rows(kind):
        return sorted(({"name": n, "holders": len(s), "percent": round(len(s) / total * 100, 1) if total else 0,
                        "mine": n in mine} for n, s in per_cert[kind].items()), key=lambda r: -r["holders"])

    return ok(admission_year=year, cohort_size=total, certificates=rows("證照"), competitions=rows("競賽"),
              pending_count=sum(1 for i in submissions() if i["status"] in ("待審核", "待複審") and i["student_id"] in sids))
