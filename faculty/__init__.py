"""
教師專長查詢 (領域專長查詢系統)

- 依專長關鍵字 (含同義詞，例如 AI → 人工智慧、機器學習)、領域、科別、是否可指導專題找老師
- 辦公室、分機、目前是否上課沿用校園地圖的老師辦公室名錄 (campus.facilities.published_teachers) 與課表
- 老師可以修改自己的專長與簡介；管理員、教職員可新增 / 修改 / 刪除所有老師的資料
- is_public = 0 的資料不會出現在前台查詢

app.py 呼叫 faculty.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、write_audit_log。
"""
from datetime import datetime
from types import SimpleNamespace

from flask import Blueprint, jsonify, request, session

from campus.facilities import CAMPUS_BUILDINGS, load_schedule, published_teachers, teacher_status
from .logic import FIELDS, expand_terms, score_profile, split_tags

bp = Blueprint("faculty", __name__)
deps = SimpleNamespace()

ADMIN_ROLES = ("管理員", "系統管理員", "教職員")
EDITABLE_BY_TEACHER = ("expertise", "fields", "research_summary", "accepts_projects", "email")
PROFILE_FIELDS = ("name", "title", "dept_name", "email", "fields", "expertise", "research_summary", "accepts_projects", "is_public")

# 示範資料 (與校園地圖的示範老師同名)；正式上線請由後台「教師專長」維護
DEMO_PROFILES = [
    {"id": 1, "name": "彭賓鈺", "title": "副教授", "dept_name": "資訊管理科", "email": "",
     "fields": "資訊科技,人工智慧與資料分析", "expertise": "機器學習,資料探勘,Python,學習分析",
     "research_summary": "運用機器學習分析學生學習歷程，預測學習落後並提供早期輔導建議。", "accepts_projects": 1, "is_public": 1},
    {"id": 2, "name": "林志明", "title": "助理教授", "dept_name": "資訊管理科", "email": "",
     "fields": "資訊安全與網路", "expertise": "資訊安全,網路安全,滲透測試,雲端運算,Linux",
     "research_summary": "校園網路安全檢測與雲端服務架構，帶領學生參加資安競賽。", "accepts_projects": 1, "is_public": 1},
    {"id": 3, "name": "吳建宏", "title": "講師", "dept_name": "資訊管理科", "email": "",
     "fields": "資訊科技,數位媒體與動畫", "expertise": "網頁開發,前端,行動應用,UI/UX",
     "research_summary": "響應式網站與行動應用程式設計，重視使用者體驗與無障礙設計。", "accepts_projects": 1, "is_public": 1},
    {"id": 4, "name": "張文華", "title": "講師", "dept_name": "資訊管理科", "email": "",
     "fields": "資訊科技,企業管理與行銷", "expertise": "資料庫設計,SQL,ERP,電子商務",
     "research_summary": "企業資源規劃系統導入與電子商務平台資料庫設計。", "accepts_projects": 0, "is_public": 1},
    {"id": 5, "name": "黃淑芬", "title": "副教授", "dept_name": "通識教育中心", "email": "",
     "fields": "通識與人文社會", "expertise": "生命教育,倫理學,服務學習",
     "research_summary": "生命教育與醫護倫理課程設計，推動社區服務學習。", "accepts_projects": 1, "is_public": 1},
    {"id": 6, "name": "李佩珊", "title": "助理教授", "dept_name": "通識教育中心", "email": "",
     "fields": "通識與人文社會,人工智慧與資料分析", "expertise": "統計學,研究方法,問卷設計,資料分析",
     "research_summary": "健康行為調查的問卷設計與統計分析，可協助專題的研究方法與數據處理。", "accepts_projects": 1, "is_public": 1},
    {"id": 7, "name": "Amy Chen", "title": "講師", "dept_name": "應用外語科", "email": "",
     "fields": "語言與外語教學", "expertise": "英語會話,多益,商務英文",
     "research_summary": "多益與商務英語教學，指導英語簡報與口說競賽。", "accepts_projects": 1, "is_public": 1},
    {"id": 8, "name": "許美玲", "title": "副教授", "dept_name": "護理科", "email": "",
     "fields": "護理與健康照護,長期照護", "expertise": "長期照護,老人護理,社區衛生",
     "research_summary": "社區長者健康促進與長照服務品質，與在地長照據點合作實習。", "accepts_projects": 1, "is_public": 1},
    {"id": 9, "name": "蔡宗翰", "title": "助理教授", "dept_name": "護理科", "email": "",
     "fields": "護理與健康照護,資訊科技", "expertise": "重症護理,護理資訊,模擬教學",
     "research_summary": "以情境模擬與數位工具輔助護理技術教學。", "accepts_projects": 1, "is_public": 1},
    {"id": 10, "name": "鄭如君", "title": "講師", "dept_name": "護理科", "email": "",
     "fields": "護理與健康照護,幼兒教育與保育", "expertise": "婦兒護理,母嬰照護,衛教設計",
     "research_summary": "母嬰照護衛教教材設計與親職教育。", "accepts_projects": 0, "is_public": 1},
]


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def load_profiles():
    rows = deps.fetch_db_rows("SELECT * FROM faculty_profiles ORDER BY dept_name, id")
    rows = [dict(r) for r in (DEMO_PROFILES if rows is None else rows)]
    for r in rows:
        if isinstance(r.get("updated_at"), datetime):
            r["updated_at"] = r["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
    return rows


def _decorate(profile, schedule, now, offices):
    """加上專長 list、辦公室與目前狀態、授課課程"""
    p = {**profile, "expertise": split_tags(profile.get("expertise")), "fields": split_tags(profile.get("fields")),
         "accepts_projects": bool(profile.get("accepts_projects")), "is_public": bool(profile.get("is_public"))}
    listed = next((t for t in offices if t["name"] == profile["name"]), None)
    office = listed if listed and listed["office"] else None
    p["courses"] = sorted({s["course_name"] for s in schedule if s.get("teacher") == profile["name"]})
    p["photo_url"] = listed["photo_url"] if listed else ""
    if office:
        buildings = {b["code"]: b["name"] for b in CAMPUS_BUILDINGS}
        p["office"] = {"room": office["office"], "building": buildings.get(office["building"], ""), "ext": office["ext"],
                       "office_hours": office["office_hours"]}
        p["status"] = teacher_status(office, schedule, now)
    else:
        p["office"], p["status"] = None, None
    return p


def _teacher_name():
    """登入老師在專長資料中的姓名 (帳號姓名「彭賓鈺 老師」去掉稱謂)"""
    return str(session.get("full_name") or "").replace("老師", "").strip()


# 【功能：教師專長查詢】專長資料 + 老師名錄 + 課表合在一起，依分數排序；沒有專長資料的老師也列出
@bp.route("/api/faculty", methods=["GET"])
def search_faculty():
    """?q=關鍵字&field=領域&dept=科別&projects=1 (只看可指導專題)"""
    q = request.args.get("q", "").strip()[:50]
    field = request.args.get("field", "").strip()
    dept = request.args.get("dept", "").strip()
    projects_only = request.args.get("projects") == "1"
    terms = expand_terms(q)
    schedule = load_schedule()
    now = datetime.now()

    offices = published_teachers(schedule)
    all_profiles = load_profiles()
    # 老師辦公室名錄或課表上有、但還沒建立專長資料的老師也要列出 (專長留白，可依姓名、授課課程找到)
    known = {p["name"] for p in all_profiles}
    stubs = [{"id": None, "name": t["name"], "title": (t["title"] or "").split("/")[0].strip(),
              "dept_name": t["dept"] or t["unit"] or "科別尚未登錄", "email": t["email"], "fields": "", "expertise": "",
              "research_summary": "", "accepts_projects": 0, "is_public": 1, "profile_missing": True}
             for t in offices if t["name"] not in known]
    profiles = [_decorate(p, schedule, now, offices) for p in all_profiles + stubs if p.get("is_public")]
    results = []
    for p in profiles:
        if field and field not in p["fields"]:
            continue
        if dept and p["dept_name"] != dept:
            continue
        if projects_only and not p["accepts_projects"]:
            continue
        score, matched = score_profile(p, terms)
        if score > 0:
            results.append({**p, "score": score, "matched_tags": matched})
    results.sort(key=lambda p: (-p["score"], p["dept_name"], p["name"]))

    return jsonify({
        "status": "success",
        "query": q,
        "expanded_terms": [t for t, expanded in terms if expanded],
        "fields": [{"name": f, "count": sum(1 for p in profiles if f in p["fields"])} for f in FIELDS],
        "depts": sorted({p["dept_name"] for p in profiles}),
        "my_name": _teacher_name() if session.get("role") == "老師" else None,
        "data": results,
    }), 200


def _parse_profile(data, partial_keys=None):
    """檢查欄位；partial_keys 有值時只處理這些欄位 (老師修改自己的資料)"""
    keys = partial_keys or PROFILE_FIELDS
    out = {}
    if "name" in keys:
        out["name"] = str(data.get("name", "")).strip()[:50]
        if not out["name"]:
            return None, "請填寫老師姓名"
    if "title" in keys:
        out["title"] = str(data.get("title", "")).strip()[:50] or None
    if "dept_name" in keys:
        out["dept_name"] = str(data.get("dept_name", "")).strip()[:100]
        if not out["dept_name"]:
            return None, "請填寫所屬科別"
    if "email" in keys:
        out["email"] = str(data.get("email", "")).strip()[:100]
        if out["email"] and "@" not in out["email"]:
            return None, "Email 格式不正確"
    if "fields" in keys:
        fields = split_tags(",".join(data["fields"]) if isinstance(data.get("fields"), list) else data.get("fields"))
        unknown = [f for f in fields if f not in FIELDS]
        if unknown:
            return None, f"未知的領域：{'、'.join(unknown)}"
        out["fields"] = ",".join(fields)
    if "expertise" in keys:
        tags = split_tags(",".join(data["expertise"]) if isinstance(data.get("expertise"), list) else data.get("expertise"))
        if not tags:
            return None, "請至少填寫一項專長"
        out["expertise"] = ",".join(tags)
    if "research_summary" in keys:
        out["research_summary"] = str(data.get("research_summary", "")).strip()[:500]
    if "accepts_projects" in keys:
        out["accepts_projects"] = 1 if data.get("accepts_projects") in (True, 1, "1", "true") else 0
    if "is_public" in keys:
        out["is_public"] = 1 if data.get("is_public", True) in (True, 1, "1", "true") else 0
    return out, None


def _save(profile_id, fields, before):
    sets = ", ".join(f"{k} = %s" for k in fields)
    if deps.db_execute(f"UPDATE faculty_profiles SET {sets} WHERE id = %s", (*fields.values(), profile_id)) is None:
        next(p for p in DEMO_PROFILES if p["id"] == profile_id).update(fields)
    deps.write_audit_log("faculty_profiles", profile_id, "修改",
                         before={k: before.get(k) for k in fields}, after=fields)


@bp.route("/api/faculty/me", methods=["GET", "PUT"])
def my_profile():
    """老師查看 / 修改自己的專長 (姓名、科別、是否公開由後台維護)"""
    if session.get("role") != "老師":
        return _error("只有老師可以編輯自己的專長資料", 403)
    name = _teacher_name()
    mine = next((p for p in load_profiles() if p["name"] == name), None)
    if not mine:
        return _error("後台尚未建立你的專長資料，請聯絡教務處", 404)
    if request.method == "PUT":
        fields, problem = _parse_profile(request.get_json(silent=True) or {}, EDITABLE_BY_TEACHER)
        if problem:
            return _error(problem)
        _save(mine["id"], fields, mine)
        mine = {**mine, **fields}
    return jsonify({"status": "success", "fields_available": list(FIELDS),
                    "data": {**mine, "expertise": split_tags(mine["expertise"]), "fields": split_tags(mine["fields"])}}), 200


# ---------- 後台 ----------

def _require_admin():
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in ADMIN_ROLES:
        return _error("權限不足，僅限管理員或教職員", 403)
    return None


@bp.route("/api/admin/faculty", methods=["GET", "POST"])
def admin_faculty():
    denied = _require_admin()
    if denied:
        return denied
    profiles = load_profiles()
    if request.method == "GET":
        return jsonify({"status": "success", "fields_available": list(FIELDS),
                        "office_names": [t["name"] for t in published_teachers()], "data": profiles}), 200

    fields, problem = _parse_profile(request.get_json(silent=True) or {})
    if problem:
        return _error(problem)
    if any(p["name"] == fields["name"] for p in profiles):
        return _error("已有同名老師的資料")
    saved = deps.db_execute(
        f"INSERT INTO faculty_profiles ({', '.join(PROFILE_FIELDS)}) VALUES ({', '.join(['%s'] * len(PROFILE_FIELDS))})",
        tuple(fields[k] for k in PROFILE_FIELDS))
    if saved is None:
        new_id = max((p["id"] for p in DEMO_PROFILES), default=0) + 1
        DEMO_PROFILES.append({"id": new_id, **fields})
    else:
        new_id = saved["lastrowid"]
    deps.write_audit_log("faculty_profiles", new_id, "新增", after=fields)
    return jsonify({"status": "success", "message": "已新增老師專長資料", "id": new_id}), 201


@bp.route("/api/admin/faculty/<int:profile_id>", methods=["PUT", "DELETE"])
def admin_faculty_item(profile_id):
    denied = _require_admin()
    if denied:
        return denied
    profiles = load_profiles()
    before = next((p for p in profiles if p["id"] == profile_id), None)
    if not before:
        return _error("找不到該筆資料", 404)

    if request.method == "DELETE":
        if deps.db_execute("DELETE FROM faculty_profiles WHERE id = %s", (profile_id,)) is None:
            DEMO_PROFILES[:] = [p for p in DEMO_PROFILES if p["id"] != profile_id]
        deps.write_audit_log("faculty_profiles", profile_id, "刪除", before=before)
        return jsonify({"status": "success", "message": "已刪除"}), 200

    fields, problem = _parse_profile(request.get_json(silent=True) or {})
    if problem:
        return _error(problem)
    if any(p["name"] == fields["name"] and p["id"] != profile_id for p in profiles):
        return _error("已有同名老師的資料")
    _save(profile_id, fields, before)
    return jsonify({"status": "success", "message": "已更新"}), 200
