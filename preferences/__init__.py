"""
我的科系與顯示範圍 (分系)

- 每位使用者有一個「我的科系」與顯示範圍：all = 全部資訊、mine = 只看公開 (全校) 資訊 + 本科資訊
- 學生、家長第一次使用時預設為學籍科系；轉系或想看其他科時可自行修改
  (只影響網站顯示，學分與畢業門檻仍以學籍資料為準)
- 一般帳號存在 user_preferences 資料表；未登入與訪客存在 session (關掉瀏覽器就重設)
- 其他 API 呼叫 scope_filter() 過濾資料，前端在網址加上 ?scope=mine 時才會套用，
  後台管理頁面不帶這個參數，所以永遠看得到全部資料

app.py 呼叫 preferences.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、departments (示範資料)。
"""
from types import SimpleNamespace

from flask import Blueprint, jsonify, request, session

bp = Blueprint("preferences", __name__)
deps = SimpleNamespace()

SCOPES = ("all", "mine")
DEMO_PREFS = {}  # MySQL 離線時：{username: {"dept_id": ..., "content_scope": ...}}


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def list_departments():
    rows = deps.fetch_db_rows("SELECT dept_id, dept_name, college_name FROM departments ORDER BY college_name, dept_id")
    return rows if rows else list(deps.departments)


def _has_account():
    """訪客登記的帳號不在 users 資料表，設定只存在 session"""
    return "username" in session and session.get("role") != "訪客"


def official_dept_id():
    """學生、家長的學籍科系；其他身分回傳登入時的科系 (老師) 或 None"""
    student_id = session.get("student_id")
    if student_id:
        rows = deps.fetch_db_rows("SELECT dept_id FROM students WHERE student_id = %s", (student_id,))
        if rows:
            return rows[0]["dept_id"]
        found = next((s for s in deps.students if s["student_id"] == student_id), None)
        if found:
            return found["dept_id"]
    if _has_account():
        return session.get("dept_id")
    return None


def _saved_preference():
    """(設定, 是否已儲存過)"""
    if _has_account():
        username = session["username"]
        rows = deps.fetch_db_rows("SELECT dept_id, content_scope FROM user_preferences WHERE username = %s", (username,))
        if rows is None:
            saved = DEMO_PREFS.get(username)
        else:
            saved = rows[0] if rows else None
    else:
        saved = session.get("preferences")
    return (dict(saved), True) if saved else (None, False)


def current_preference():
    saved, is_saved = _saved_preference()
    official = official_dept_id()
    pref = saved or {"dept_id": official, "content_scope": "all"}
    return {**pref, "official_dept_id": official, "is_saved": is_saved}


def scope_dept():
    """前端帶 ?scope=mine 且使用者有設定科系時，回傳要過濾的科系代碼；否則 None (不過濾)"""
    if request.args.get("scope") != "mine":
        return None
    return current_preference().get("dept_id")


def scope_filter(rows, depts_of):
    """depts_of(row) 回傳該筆適用的科系代碼 list；空 list 或 None 代表全校公開，一律保留"""
    dept = scope_dept()
    if not dept:
        return rows
    return [r for r in rows if not depts_of(r) or dept in depts_of(r)]


@bp.route("/api/me/preferences", methods=["GET", "PUT"])
def preferences():
    departments = list_departments()
    names = {d["dept_id"]: d["dept_name"] for d in departments}

    if request.method == "PUT":
        data = request.get_json(silent=True) or {}
        dept_id = data.get("dept_id") or None
        scope = data.get("content_scope", "all")
        if dept_id is not None and dept_id not in names:
            return jsonify({"status": "error", "message": "查無此科系"}), 400
        if scope not in SCOPES:
            return jsonify({"status": "error", "message": "顯示範圍須為 all 或 mine"}), 400
        if scope == "mine" and not dept_id:
            return jsonify({"status": "error", "message": "要只看本科資訊，請先選擇科系"}), 400

        pref = {"dept_id": dept_id, "content_scope": scope}
        if _has_account():
            saved = deps.db_execute(
                "INSERT INTO user_preferences (username, dept_id, content_scope) VALUES (%s, %s, %s) "
                "ON DUPLICATE KEY UPDATE dept_id = VALUES(dept_id), content_scope = VALUES(content_scope)",
                (session["username"], dept_id, scope))
            if saved is None:
                DEMO_PREFS[session["username"]] = pref
        else:
            session["preferences"] = pref

    pref = current_preference()
    official = pref["official_dept_id"]
    return jsonify({
        "status": "success",
        "dept_id": pref["dept_id"],
        "dept_name": names.get(pref["dept_id"]),
        "content_scope": pref["content_scope"],
        "official_dept_id": official,
        "official_dept_name": names.get(official),
        # 學生改成學籍以外的科系 (例如轉系中)，前端提醒學分仍以學籍為準
        "differs_from_official": bool(official and pref["dept_id"] and official != pref["dept_id"]),
        "is_saved": pref["is_saved"],
        "stored_in": "account" if _has_account() else "session",
        "departments": departments,
    }), 200
