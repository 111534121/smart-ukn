# -*- coding: utf-8 -*-
"""
Smart UKN 管理員核心業務與系統稽核藍圖 (admin_core.py)
提供兩大核心支柱完整後端 API：
1. 管理員負責建置與修改：
   - users (系統帳號與權限)
   - departments (科系與學院架構)
   - course_map (全校課程地圖與擋修)
   - graduation_requirements (畢業門檻)
   - knowledge_categories (知識庫主分類、總目錄)
   - synonym_dictionary (搜尋同義詞字典)
2. 負責監控不隨便修改 歷史紀錄與稽核：
   - audit_logs (系統稽核日誌)
   - search_logs (搜尋日誌與效能)
   - unmatched_queries (未匹配紀錄與一鍵轉同義詞)
   - visitor_logs (訪客日誌與匯出)
   - student_credits (歷年成績歷史)
   - attendance_records (出缺勤紀錄歷史)
   - student_records (獎懲與幹部歷史)
"""

import csv
import io
import json
from datetime import datetime
from functools import wraps
from flask import Blueprint, jsonify, request, session, Response
from werkzeug.security import generate_password_hash, check_password_hash

import admin_db

bp = Blueprint("admin_core", __name__)

SYS_ADMIN_ROLES = ("系統管理員", "管理員")
CONTENT_MANAGER_ROLES = ("內容管理人員",)
ALL_ADMIN_ROLES = SYS_ADMIN_ROLES + CONTENT_MANAGER_ROLES
VALID_USER_ROLES = (
    "系統管理員", "管理員", "內容管理人員", "處室承辦", "科助", "住宿管理員", "教職員", "老師", "學生", "家長"
)


def _default_permissions_for_role(role):
    if role in SYS_ADMIN_ROLES:
        return "查看,建立,修改,帳號管理,權限設定,系統檢測"
    if role in CONTENT_MANAGER_ROLES:
        return "查看,建立,修改"
    return "查看"


def _sanitize_permissions(role, perms_raw):
    if isinstance(perms_raw, list):
        perms = [str(p).strip() for p in perms_raw if str(p).strip()]
    elif isinstance(perms_raw, str) and perms_raw.strip():
        perms = [p.strip() for p in perms_raw.split(",") if p.strip()]
    else:
        perms = _default_permissions_for_role(role).split(",")
    # 內容管理人員與非系統管理員絕對不可擁有帳號管理、權限設定或系統檢測
    if role not in SYS_ADMIN_ROLES:
        perms = [p for p in perms if p not in ("帳號管理", "權限設定", "系統檢測")]
    if not perms:
        perms = ["查看"]
    # 去重並維持固定順序
    ordered = []
    for p in ("查看", "建立", "修改", "帳號管理", "權限設定", "系統檢測"):
        if p in perms and p not in ordered:
            ordered.append(p)
    for p in perms:
        if p not in ordered:
            ordered.append(p)
    return ",".join(ordered)


def _get_effective_role():
    """只從已登入的 Session 取得角色；管理員可預覽較低權限。"""
    role = session.get("role")
    header_role = request.headers.get("X-Admin-Role", "").strip()
    if not session.get("username"):
        return None
    if role:
        # 若管理員於後台切換預覽「內容管理人員」視角，以 Header 嚴格降權測試
        if role in SYS_ADMIN_ROLES and header_role == "內容管理人員":
            return "內容管理人員"
        return role
    return None


def _get_current_actor():
    """取得操作者姓名、身分角色與 IP"""
    username = session.get("username")
    full_name = session.get("full_name") or username or "系統管理員"
    role = _get_effective_role() or "系統管理員"
    ip = request.remote_addr or "127.0.0.1"
    return full_name, role, ip


def _check_user_active_and_perms(required_perm=None):
    """檢查登入帳號是否啟用及是否具備指定權限（查看／建立／修改）"""
    username = session.get("username")
    if username:
        row = admin_db.query_one("SELECT is_active, permissions, role FROM users WHERE username = %s", (username,))
        if row:
            if row.get("is_active") is not None and int(row.get("is_active")) == 0:
                return False, "此帳號已停用，請洽系統管理員"
            if required_perm:
                perms_str = row.get("permissions") or _default_permissions_for_role(row.get("role"))
                perms = [p.strip() for p in str(perms_str).split(",") if p.strip()]
                if required_perm not in perms:
                    return False, f"權限不足：您的帳號未開放「{required_perm}」權限"
    return True, None


def admin_required(f):
    """後台共用權限裝飾器（系統管理員與內容管理人員皆可存取，但依 HTTP 方法檢查查看／建立／修改權限）"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        role = _get_effective_role()
        if not role:
            return jsonify({"status": "error", "message": "請先登入後再進行操作"}), 401
        if role not in ALL_ADMIN_ROLES:
            return jsonify({"status": "error", "message": "權限不足，僅限系統管理員或內容管理人員存取"}), 403
        req_perm = "查看"
        if request.method == "POST":
            req_perm = "建立"
        elif request.method in ("PUT", "DELETE"):
            req_perm = "修改"
        ok_perm, err_msg = _check_user_active_and_perms(req_perm)
        if not ok_perm:
            return jsonify({"status": "error", "message": err_msg}), 403
        return f(*args, **kwargs)
    return wrapper


def sys_admin_required(f):
    """系統管理員專用裝飾器：內容管理人員不可管理帳號或修改權限"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        role = _get_effective_role()
        if not role:
            return jsonify({"status": "error", "message": "請先登入後再進行操作"}), 401
        if role not in SYS_ADMIN_ROLES:
            return jsonify({
                "status": "error",
                "message": "權限不足：內容管理人員不能管理帳號或修改權限，此功能僅限「系統管理員」操作"
            }), 403
        ok_perm, err_msg = _check_user_active_and_perms("修改" if request.method != "GET" else "查看")
        if not ok_perm:
            return jsonify({"status": "error", "message": err_msg}), 403
        return f(*args, **kwargs)
    return wrapper


# ==========================================
# 資料庫連線狀態與總覽統計 (/api/admin/db-status)
# ==========================================
@bp.route("/api/admin/db-status", methods=["GET"])
@admin_required
def get_db_status():
    mysql_active = admin_db.is_mysql_active()
    counts = {}
    tables = [
        "users", "departments", "course_map", "graduation_requirements",
        "knowledge_categories", "knowledge_base", "synonym_dictionary",
        "checklist_items", "deadlines", "academic_calendar",
        "audit_logs", "search_logs", "search_feedback",
        "unmatched_queries", "visitor_logs",
        "student_credits", "attendance_records", "student_records",
        "anniversary_events", "anniversary_wishes"
    ]
    for t in tables:
        try:
            r = admin_db.query_one(f"SELECT COUNT(*) AS c FROM {t}")
            counts[t] = r["c"] if r else 0
        except Exception:
            counts[t] = 0

    return jsonify({
        "status": "success",
        "mysql_connected": mysql_active,
        "engine": "MySQL (smart_ukn)" if mysql_active else "SQLite (data/smart_ukn.sqlite3)",
        "sqlite_path": admin_db.SQLITE_DB_PATH,
        "table_counts": counts,
        "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }), 200

# =========================================================================
# 支柱一：管理員負責建置與修改 (Users, Departments, Course Map, Grad, Cat, Synonym)
# =========================================================================

# -------------------------------------------------------------------------
# 1. users（系統帳號與權限 — 僅限系統管理員，內容管理人員不可存取）
# -------------------------------------------------------------------------
@bp.route("/api/admin/users", methods=["GET"])
@sys_admin_required
def list_users():
    role_filter = request.args.get("role")
    status_filter = request.args.get("is_active")
    search = request.args.get("search", "").strip()

    sql = """
        SELECT u.user_id, u.username, u.role, u.student_id, u.full_name,
               u.advised_class, u.can_manage_dorm, u.office, u.permissions,
               u.is_active, u.created_at, u.default_password,
               s.class_name, s.dept_id
        FROM users u
        LEFT JOIN students s ON u.student_id = s.student_id
        WHERE 1=1
    """
    params = []
    if role_filter:
        if role_filter in SYS_ADMIN_ROLES:
            sql += " AND u.role IN ('系統管理員', '管理員')"
        else:
            sql += " AND u.role = %s"
            params.append(role_filter)
    if status_filter in ("0", "1"):
        sql += " AND COALESCE(u.is_active, 1) = %s"
        params.append(int(status_filter))
    if search:
        sql += " AND (u.username LIKE %s OR u.full_name LIKE %s OR COALESCE(u.student_id, '') LIKE %s OR COALESCE(u.office, '') LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw, kw])

    sql += " ORDER BY u.user_id DESC"
    users = admin_db.query_db(sql, tuple(params))
    for u in users:
        u["is_active"] = 1 if u.get("is_active") is None else int(u.get("is_active"))
        u["office"] = u.get("office") or ""
        u["default_password"] = u.get("default_password") or ("admin123" if u.get("role") in SYS_ADMIN_ROLES else "123456")
        u["permissions"] = _sanitize_permissions(u.get("role"), u.get("permissions"))
        # 對齊角色顯示名稱：管理員 -> 系統管理員
        u["role_display"] = "系統管理員" if u.get("role") in SYS_ADMIN_ROLES else u.get("role")
    return jsonify({"status": "success", "data": users, "total": len(users)}), 200

@bp.route("/api/admin/users", methods=["POST"])
@sys_admin_required
def create_user():
    import re
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    role_raw = data.get("role")
    full_name = (data.get("full_name") or "").strip()

    if not username or not full_name:
        return jsonify({"status": "error", "message": "帳號名稱與姓名為必填欄位"}), 400
    if not re.match(r"^[A-Za-z0-9_.\-]{3,50}$", username):
        return jsonify({"status": "error", "message": "帳號格式不正確：請使用 3～50 字元的英數字、底線、點或連字號"}), 400
    if len(full_name) > 50:
        return jsonify({"status": "error", "message": "姓名長度不可超過 50 字元"}), 400

    # 防呆：嚴格檢查身分角色，非空且必須為系統合法角色，拒絕非法角色
    if not role_raw or not str(role_raw).strip():
        return jsonify({"status": "error", "message": "身分角色為必填欄位，請選擇合法的身分角色"}), 400
    role = str(role_raw).strip()
    if role not in VALID_USER_ROLES:
        return jsonify({
            "status": "error",
            "message": f"不支援或非法的身分角色類型：{role}。合法角色為：系統管理員、內容管理人員、處室承辦、科助、住宿管理員、教職員、老師、學生、家長"
        }), 400

    office = (data.get("office") or "").strip()[:100]
    permissions = _sanitize_permissions(role, data.get("permissions"))
    is_active = 0 if data.get("is_active") in (0, "0", False, "false") else 1
    
    # 角色特定防呆：學生與家長強制綁定學號，其餘身分不帶學號
    if role in ("學生", "家長"):
        student_id = (str(data.get("student_id")).strip().upper() or None) if data.get("student_id") is not None else None
        if not student_id:
            return jsonify({"status": "error", "message": f"「{role}」角色必須填寫綁定學號（例如 S112001）"}), 400
        if not re.match(r"^[A-Za-z0-9_\-]{3,20}$", student_id):
            return jsonify({"status": "error", "message": "學號格式不正確：請輸入 3～20 字元的英數字"}), 400
    else:
        student_id = None

    advised_class = (str(data.get("advised_class")).strip() or None) if data.get("advised_class") is not None and role == "老師" else None
    can_manage_dorm = 1 if (data.get("can_manage_dorm") or role == "住宿管理員") else 0

    if not password or len(password) < 8 or len(password) > 100:
        return jsonify({"status": "error", "message": "密碼為必填欄位，長度須為 8～100 字元"}), 400

    # 檢查帳號重疊 (大小寫不敏感)
    existing = admin_db.query_one("SELECT user_id FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
    if existing:
        return jsonify({"status": "error", "message": f"帳號「{username}」已存在，請使用其他帳號"}), 400

    if student_id:
        stu = admin_db.query_one("SELECT student_id FROM students WHERE student_id = %s", (student_id,))
        if not stu:
            admin_db.execute_db("""
                INSERT INTO students (student_id, full_name, dept_id, admission_year, class_name)
                VALUES (%s, %s, %s, %s, %s)
            """, (student_id, full_name if role == "學生" else f"{full_name}之子女", "CS", 112, advised_class or "資管五忠"))

    pw_hash = generate_password_hash(password)
    res = admin_db.execute_db("""
        INSERT INTO users (username, password_hash, role, student_id, full_name, advised_class, can_manage_dorm, office, permissions, is_active, default_password)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (username, pw_hash, role, student_id, full_name, advised_class, can_manage_dorm, office, permissions, is_active, password))

    new_id = res.get("lastrowid") or username
    actor_name, actor_role, actor_ip = _get_current_actor()

    new_dict = {
        "user_id": new_id, "username": username, "role": role,
        "student_id": student_id, "full_name": full_name,
        "office": office, "permissions": permissions, "is_active": is_active,
        "advised_class": advised_class, "can_manage_dorm": can_manage_dorm
    }
    admin_db.log_audit_trail("users", new_id, "新增", None, new_dict, actor_name, actor_role, actor_ip)

    # 同步至 app.DEMO_USERS
    try:
        from app import DEMO_USERS
        demo_id = max([u.get("user_id", 0) for u in DEMO_USERS], default=100) + 1
        DEMO_USERS.append({
            "user_id": demo_id, "username": username, "password_hash": pw_hash,
            "role": role, "student_id": student_id, "full_name": full_name,
            "office": office, "permissions": permissions, "is_active": is_active,
            "can_manage_dorm": bool(can_manage_dorm)
        })
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"已成功建立使用者「{username}」({full_name})", "user_id": new_id, "data": new_dict}), 201

@bp.route("/api/admin/users/<int:user_id>", methods=["PUT"])
@sys_admin_required
def update_user(user_id):
    import re
    data = request.get_json(silent=True) or {}
    before = admin_db.query_one("SELECT user_id, username, role, student_id, full_name, advised_class, can_manage_dorm, office, permissions, is_active FROM users WHERE user_id = %s", (user_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該使用者帳號"}), 404

    if "role" in data:
        role_raw = data.get("role")
        if not role_raw or not str(role_raw).strip():
            return jsonify({"status": "error", "message": "身分角色不可為空白"}), 400
        role_clean = str(role_raw).strip()
        if role_clean not in VALID_USER_ROLES:
            return jsonify({
                "status": "error",
                "message": f"不支援或非法的身分角色類型：{role_clean}。合法角色為：系統管理員、內容管理人員、處室承辦、科助、住宿管理員、教職員、老師、學生、家長"
            }), 400
        role = role_clean
    else:
        role = before["role"]

    full_name = (data.get("full_name") if data.get("full_name") is not None else before["full_name"]).strip()
    if not full_name:
        return jsonify({"status": "error", "message": "姓名不可為空白"}), 400
    if len(full_name) > 50:
        return jsonify({"status": "error", "message": "姓名長度不可超過 50 字元"}), 400

    office = (data.get("office") if data.get("office") is not None else (before.get("office") or "")).strip()[:100]
    raw_perms = data.get("permissions") if data.get("permissions") is not None else before.get("permissions")
    permissions = _sanitize_permissions(role, raw_perms)
    if "is_active" in data and data.get("is_active") is not None:
        is_active = 0 if data.get("is_active") in (0, "0", False, "false") else 1
    else:
        is_active = 1 if before.get("is_active") is None else int(before.get("is_active"))

    is_self = (session.get("username") == before["username"])
    is_root_admin = (before["username"].lower() == "admin")

    # 防呆 1：不可停用主管理員 admin 或目前登入中的管理員自身帳號
    if (is_self or is_root_admin) and is_active == 0:
        return jsonify({"status": "error", "message": "防呆保護：不可停用主管理員或目前正在使用的管理員帳號"}), 400

    # 防呆 2：不可將主管理員 admin 或目前登入中的管理員降權為非系統管理員角色
    if (is_self or is_root_admin) and role not in SYS_ADMIN_ROLES:
        return jsonify({"status": "error", "message": "防呆保護：不可將主管理員或目前登入中的管理員降權為其他角色"}), 400

    # 防呆 3：確保系統至少保留一位啟用中的系統管理員
    if before["role"] in SYS_ADMIN_ROLES and (role not in SYS_ADMIN_ROLES or is_active == 0):
        active_admins = admin_db.query_one(
            "SELECT COUNT(*) AS c FROM users WHERE role IN ('系統管理員', '管理員') AND COALESCE(is_active, 1) = 1 AND user_id != %s",
            (user_id,)
        )
        if not active_admins or active_admins["c"] == 0:
            return jsonify({"status": "error", "message": "防呆保護：系統至少須保留一位啟用中的「系統管理員」"}), 400

    if role in ("學生", "家長"):
        student_id = (str(data.get("student_id")).strip().upper() or None) if "student_id" in data and data.get("student_id") is not None else (before["student_id"] if "student_id" not in data else None)
        if not student_id:
            return jsonify({"status": "error", "message": f"「{role}」角色必須填寫綁定學號（例如 S112001）"}), 400
        if not re.match(r"^[A-Za-z0-9_\-]{3,20}$", student_id):
            return jsonify({"status": "error", "message": "學號格式不正確：請輸入 3～20 字元的英數字"}), 400
    else:
        student_id = None

    advised_class = (str(data.get("advised_class")).strip() or None) if "advised_class" in data and data.get("advised_class") is not None and role == "老師" else (before["advised_class"] if "advised_class" not in data and role == "老師" else None)
    can_manage_dorm = 1 if (data.get("can_manage_dorm") or role == "住宿管理員") else (int(before.get("can_manage_dorm") or 0) if "can_manage_dorm" not in data else 0)

    if student_id:
        stu = admin_db.query_one("SELECT student_id FROM students WHERE student_id = %s", (student_id,))
        if not stu:
            admin_db.execute_db("""
                INSERT INTO students (student_id, full_name, dept_id, admission_year, class_name)
                VALUES (%s, %s, %s, %s, %s)
            """, (student_id, full_name if role == "學生" else f"{full_name}之子女", "CS", 112, advised_class or "資管五忠"))

    password = data.get("password")
    if password and str(password).strip():
        pw_clean = str(password).strip()
        if len(pw_clean) < 8 or len(pw_clean) > 100:
            return jsonify({"status": "error", "message": "新密碼長度須介於 8～100 字元之間"}), 400
        pw_hash = generate_password_hash(pw_clean)
        admin_db.execute_db("""
            UPDATE users SET role = %s, full_name = %s, student_id = %s, advised_class = %s,
                             can_manage_dorm = %s, office = %s, permissions = %s, is_active = %s, password_hash = %s
            WHERE user_id = %s
        """, (role, full_name, student_id, advised_class, can_manage_dorm, office, permissions, is_active, pw_hash, user_id))
    else:
        admin_db.execute_db("""
            UPDATE users SET role = %s, full_name = %s, student_id = %s, advised_class = %s,
                             can_manage_dorm = %s, office = %s, permissions = %s, is_active = %s
            WHERE user_id = %s
        """, (role, full_name, student_id, advised_class, can_manage_dorm, office, permissions, is_active, user_id))

    after = {
        "user_id": user_id, "username": before["username"], "role": role,
        "student_id": student_id, "full_name": full_name,
        "office": office, "permissions": permissions, "is_active": is_active,
        "advised_class": advised_class, "can_manage_dorm": can_manage_dorm
    }
    action_label = "停用帳號" if (before.get("is_active", 1) == 1 and is_active == 0) else ("啟用帳號" if (before.get("is_active", 1) == 0 and is_active == 1) else "修改")
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("users", user_id, action_label, before, after, actor_name, actor_role, actor_ip)

    # 同步至 app.DEMO_USERS
    try:
        from app import DEMO_USERS
        for u in DEMO_USERS:
            if u.get("username") == before["username"]:
                u.update({
                    "role": role, "full_name": full_name, "student_id": student_id,
                    "office": office, "permissions": permissions, "is_active": is_active,
                    "can_manage_dorm": bool(can_manage_dorm)
                })
                if password and str(password).strip():
                    u["password_hash"] = generate_password_hash(str(password).strip())
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"使用者「{before['username']}」資料已更新", "data": after}), 200

@bp.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
@sys_admin_required
def delete_user(user_id):
    before = admin_db.query_one("SELECT user_id, username, role, full_name FROM users WHERE user_id = %s", (user_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該使用者帳號"}), 404

    # 防呆 1：不可刪除主管理員 admin 或目前登入中的管理員帳號
    if session.get("username") == before["username"] or before["username"].lower() == "admin":
        return jsonify({"status": "error", "message": "防呆保護：不可刪除主管理員或目前正在使用的管理員帳號"}), 400

    # 防呆 2：若為管理員角色，確保刪除後仍有至少一位啟用中的系統管理員
    if before["role"] in SYS_ADMIN_ROLES:
        active_admins = admin_db.query_one(
            "SELECT COUNT(*) AS c FROM users WHERE role IN ('系統管理員', '管理員') AND COALESCE(is_active, 1) = 1 AND user_id != %s",
            (user_id,)
        )
        if not active_admins or active_admins["c"] == 0:
            return jsonify({"status": "error", "message": "防呆保護：系統至少須保留一位啟用中的「系統管理員」，無法刪除此帳號"}), 400

    admin_db.execute_db("DELETE FROM users WHERE user_id = %s", (user_id,))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("users", user_id, "DELETE", before, None, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_USERS
        DEMO_USERS[:] = [u for u in DEMO_USERS if u.get("username") != before["username"]]
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"使用者「{before['username']}」已成功刪除"}), 200

# -------------------------------------------------------------------------
# 1b. 帳密查詢與密碼管理功能（僅限系統管理員）
# -------------------------------------------------------------------------
@bp.route("/api/admin/credentials/query", methods=["GET"])
@sys_admin_required
def query_user_credentials():
    """管理員專用帳密查詢功能：查詢帳號、身分、學號、處室及密碼設定狀態（支援預設密碼識別）。"""
    search = request.args.get("search", "").strip()
    role_filter = request.args.get("role", "").strip()
    status_filter = request.args.get("is_active", "").strip()

    sql = """
        SELECT u.user_id, u.username, u.password_hash, u.role, u.student_id, u.full_name,
               u.advised_class, u.can_manage_dorm, u.office, u.permissions,
               u.is_active, u.created_at, u.default_password,
               s.class_name, s.dept_id
        FROM users u
        LEFT JOIN students s ON u.student_id = s.student_id
        WHERE 1=1
    """
    params = []
    if role_filter:
        if role_filter in SYS_ADMIN_ROLES:
            sql += " AND u.role IN ('系統管理員', '管理員')"
        else:
            sql += " AND u.role = %s"
            params.append(role_filter)
    if status_filter in ("0", "1"):
        sql += " AND COALESCE(u.is_active, 1) = %s"
        params.append(int(status_filter))
    if search:
        sql += " AND (u.username LIKE %s OR u.full_name LIKE %s OR COALESCE(u.student_id, '') LIKE %s OR COALESCE(u.office, '') LIKE %s OR COALESCE(s.class_name, '') LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw, kw, kw])

    sql += " ORDER BY u.user_id DESC"
    users = admin_db.query_db(sql, tuple(params))

    result = []
    for u in users:
        pw_hash = u.get("password_hash") or ""
        def_pwd = u.get("default_password")
        if pw_hash and def_pwd and (pw_hash == def_pwd or (pw_hash.startswith("scrypt:") and check_password_hash(pw_hash, def_pwd))):
            pw_status = f"預設密碼 ({def_pwd})"
            is_default = True
            suggested_pwd = def_pwd
        elif pw_hash == "123456" or (pw_hash and pw_hash.startswith("scrypt:") and check_password_hash(pw_hash, "123456")):
            pw_status = "預設密碼 (123456)"
            is_default = True
            suggested_pwd = "123456"
        elif pw_hash in ("admin123", "12345678", "888888") or (pw_hash and pw_hash.startswith("scrypt:") and check_password_hash(pw_hash, "admin123")):
            pw_status = f"預設密碼 ({pw_hash if pw_hash in ('admin123', '12345678', '888888') else 'admin123'})"
            is_default = True
            suggested_pwd = pw_hash if pw_hash in ("admin123", "12345678", "888888") else "admin123"
        elif pw_hash:
            pw_status = f"純數字密碼 ({pw_hash})" if pw_hash.isdigit() else "已自訂密碼 (加密雜湊保護)"
            is_default = False
            suggested_pwd = pw_hash if pw_hash.isdigit() else None
        else:
            pw_status = "未設定密碼"
            is_default = False
            suggested_pwd = None

        role_disp = "系統管理員" if u.get("role") in SYS_ADMIN_ROLES else u.get("role")
        result.append({
            "user_id": u["user_id"],
            "username": u["username"],
            "full_name": u["full_name"],
            "role": u["role"],
            "role_display": role_disp,
            "student_id": u.get("student_id") or "",
            "class_name": u.get("class_name") or "",
            "advised_class": u.get("advised_class") or "",
            "office": u.get("office") or "",
            "is_active": 1 if u.get("is_active") is None else int(u.get("is_active")),
            "default_password": u.get("default_password") or suggested_pwd or ("admin123" if u.get("role") in SYS_ADMIN_ROLES else "123456"),
            "password_status": pw_status,
            "is_default_password": is_default,
            "suggested_password": suggested_pwd,
            "created_at": str(u.get("created_at") or "")[:19]
        })

    return jsonify({"status": "success", "data": result, "total": len(result)}), 200

@bp.route("/api/admin/users/<int:user_id>/reset-password", methods=["POST"])
@sys_admin_required
def reset_user_password(user_id):
    """管理員重設使用者密碼：可選擇一鍵還原預設密碼 (123456 / admin123) 或指定新密碼。"""
    data = request.get_json(silent=True) or {}
    custom_pwd = (data.get("new_password") or "").strip()
    mode = data.get("mode", "custom" if custom_pwd else "default")

    target = admin_db.query_one("SELECT user_id, username, role, full_name, is_active FROM users WHERE user_id = %s", (user_id,))
    if not target:
        return jsonify({"status": "error", "message": "找不到該使用者帳號"}), 404

    if mode == "custom":
        if not custom_pwd:
            return jsonify({"status": "error", "message": "請輸入欲設定的新密碼"}), 400
        if len(custom_pwd) < 8 or len(custom_pwd) > 100:
            return jsonify({"status": "error", "message": "新密碼長度須介於 8～100 字元之間"}), 400
        new_pwd = custom_pwd
    else:
        if target["role"] in SYS_ADMIN_ROLES:
            new_pwd = "admin123"
        else:
            new_pwd = "123456"

    new_hash = generate_password_hash(new_pwd)
    admin_db.execute_db("UPDATE users SET password_hash = %s, default_password = %s WHERE user_id = %s", (new_hash, new_pwd, user_id))

    try:
        from app import DEMO_USERS
        for u in DEMO_USERS:
            if u.get("username") == target["username"]:
                u["password_hash"] = new_hash
                break
    except Exception:
        pass

    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail(
        "users", user_id, "重設密碼",
        {"user_id": user_id, "username": target["username"], "full_name": target["full_name"]},
        {"user_id": user_id, "username": target["username"], "reset_mode": mode},
        actor_name, actor_role, actor_ip
    )

    return jsonify({
        "status": "success",
        "message": f"使用者「{target['username']}」密碼已成功重設為：{new_pwd}",
        "username": target["username"],
        "new_password": new_pwd,
        "is_default": (mode != "custom")
    }), 200

@bp.route("/api/admin/users/<int:user_id>/credential-info", methods=["GET"])
@sys_admin_required
def get_user_credential_info(user_id):
    """查詢單一使用者之帳密資訊詳情"""
    u = admin_db.query_one("""
        SELECT u.user_id, u.username, u.password_hash, u.role, u.student_id, u.full_name,
               u.advised_class, u.can_manage_dorm, u.office, u.permissions,
               u.is_active, u.created_at, u.default_password,
               s.class_name, s.dept_id
        FROM users u
        LEFT JOIN students s ON u.student_id = s.student_id
        WHERE u.user_id = %s
    """, (user_id,))
    if not u:
        return jsonify({"status": "error", "message": "找不到該使用者帳號"}), 404

    pw_hash = u.get("password_hash") or ""
    def_pwd = u.get("default_password")
    if pw_hash and def_pwd and (pw_hash == def_pwd or (pw_hash.startswith("scrypt:") and check_password_hash(pw_hash, def_pwd))):
        pw_status = f"初始預設密碼 ({def_pwd})"
        is_default = True
        suggested_pwd = def_pwd
    elif pw_hash == "123456" or (pw_hash and pw_hash.startswith("scrypt:") and check_password_hash(pw_hash, "123456")):
        pw_status = "預設密碼 (123456)"
        is_default = True
        suggested_pwd = "123456"
    elif pw_hash in ("admin123", "12345678", "888888") or (pw_hash and pw_hash.startswith("scrypt:") and check_password_hash(pw_hash, "admin123")):
        pw_status = f"預設密碼 ({pw_hash if pw_hash in ('admin123', '12345678', '888888') else 'admin123'})"
        is_default = True
        suggested_pwd = pw_hash if pw_hash in ("admin123", "12345678", "888888") else "admin123"
    elif pw_hash:
        pw_status = f"純數字密碼 ({pw_hash})" if pw_hash.isdigit() else "已自訂密碼 (加密雜湊保護)"
        is_default = False
        suggested_pwd = pw_hash if pw_hash.isdigit() else None
    else:
        pw_status = "未設定密碼"
        is_default = False
        suggested_pwd = None

    role_disp = "系統管理員" if u.get("role") in SYS_ADMIN_ROLES else u.get("role")
    return jsonify({
        "status": "success",
        "data": {
            "user_id": u["user_id"],
            "username": u["username"],
            "full_name": u["full_name"],
            "role": u["role"],
            "role_display": role_disp,
            "student_id": u.get("student_id") or "",
            "class_name": u.get("class_name") or "",
            "advised_class": u.get("advised_class") or "",
            "office": u.get("office") or "",
            "is_active": 1 if u.get("is_active") is None else int(u.get("is_active")),
            "default_password": u.get("default_password") or suggested_pwd or ("admin123" if u.get("role") in SYS_ADMIN_ROLES else "123456"),
            "password_status": pw_status,
            "is_default_password": is_default,
            "suggested_password": suggested_pwd,
            "created_at": str(u.get("created_at") or "")[:19]
        }
    }), 200

# -------------------------------------------------------------------------
# 2. departments（科系與學院架構）
# -------------------------------------------------------------------------
@bp.route("/api/admin/departments", methods=["GET"])
@admin_required
def list_departments():
    departments = admin_db.query_db("""
        SELECT d.dept_id, d.dept_name, d.college_name,
               (SELECT COUNT(*) FROM students s WHERE s.dept_id = d.dept_id) AS student_count,
               (SELECT COUNT(*) FROM course_map c WHERE c.dept_id = d.dept_id) AS course_count
        FROM departments d
        ORDER BY d.college_name, d.dept_id
    """)
    return jsonify({"status": "success", "data": departments}), 200

@bp.route("/api/admin/departments", methods=["POST"])
@admin_required
def create_department():
    import re
    data = request.get_json(silent=True) or {}
    dept_id = (data.get("dept_id") or "").strip().upper()
    dept_name = (data.get("dept_name") or "").strip()
    college_name = (data.get("college_name") or "").strip()

    if not dept_id or not dept_name or not college_name:
        return jsonify({"status": "error", "message": "科系代碼、科系名稱與學院名稱皆為必填"}), 400
    if not re.match(r"^[A-Z0-9_]{2,10}$", dept_id):
        return jsonify({"status": "error", "message": "科系代碼格式不正確：請輸入 2～10 字元的大寫英數字（例如 CS、NUR）"}), 400
    if len(dept_name) > 100 or len(college_name) > 100:
        return jsonify({"status": "error", "message": "科系名稱與學院名稱長度不可超過 100 字元"}), 400

    existing = admin_db.query_one("SELECT dept_id FROM departments WHERE dept_id = %s", (dept_id,))
    if existing:
        return jsonify({"status": "error", "message": f"科系代碼「{dept_id}」已存在"}), 400

    dup_name = admin_db.query_one("SELECT dept_id FROM departments WHERE dept_name = %s", (dept_name,))
    if dup_name:
        return jsonify({"status": "error", "message": f"科系名稱「{dept_name}」已存在（代碼：{dup_name['dept_id']}）"}), 400

    admin_db.execute_db("""
        INSERT INTO departments (dept_id, dept_name, college_name)
        VALUES (%s, %s, %s)
    """, (dept_id, dept_name, college_name))

    actor_name, actor_role, actor_ip = _get_current_actor()
    new_dict = {"dept_id": dept_id, "dept_name": dept_name, "college_name": college_name}
    admin_db.log_audit_trail("departments", dept_id, "INSERT", None, new_dict, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_DEPARTMENTS
        DEMO_DEPARTMENTS.append(new_dict)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"已成功新增科系「{dept_name}」({dept_id})", "data": new_dict}), 201

@bp.route("/api/admin/departments/<string:dept_id>", methods=["PUT"])
@admin_required
def update_department(dept_id):
    dept_id = dept_id.strip().upper()
    data = request.get_json(silent=True) or {}
    before = admin_db.query_one("SELECT dept_id, dept_name, college_name FROM departments WHERE dept_id = %s", (dept_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該科系代碼"}), 404

    dept_name = (data.get("dept_name") if data.get("dept_name") is not None else before["dept_name"]).strip()
    college_name = (data.get("college_name") if data.get("college_name") is not None else before["college_name"]).strip()
    if not dept_name or not college_name:
        return jsonify({"status": "error", "message": "科系名稱與學院名稱不可為空白"}), 400
    if len(dept_name) > 100 or len(college_name) > 100:
        return jsonify({"status": "error", "message": "科系名稱與學院名稱長度不可超過 100 字元"}), 400

    dup_name = admin_db.query_one("SELECT dept_id FROM departments WHERE dept_name = %s AND dept_id != %s", (dept_name, dept_id))
    if dup_name:
        return jsonify({"status": "error", "message": f"科系名稱「{dept_name}」已被其他代碼（{dup_name['dept_id']}）使用"}), 400

    admin_db.execute_db("""
        UPDATE departments SET dept_name = %s, college_name = %s WHERE dept_id = %s
    """, (dept_name, college_name, dept_id))

    after = {"dept_id": dept_id, "dept_name": dept_name, "college_name": college_name}
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("departments", dept_id, "UPDATE", before, after, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_DEPARTMENTS
        for d in DEMO_DEPARTMENTS:
            if d.get("dept_id") == dept_id:
                d.update({"dept_name": dept_name, "college_name": college_name})
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"科系「{dept_id}」資料已更新"}), 200

@bp.route("/api/admin/departments/<string:dept_id>", methods=["DELETE"])
@admin_required
def delete_department(dept_id):
    dept_id = dept_id.strip().upper()
    before = admin_db.query_one("SELECT dept_id, dept_name, college_name FROM departments WHERE dept_id = %s", (dept_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該科系代碼"}), 404

    # 關聯檢查
    stu_check = admin_db.query_one("SELECT COUNT(*) AS c FROM students WHERE dept_id = %s", (dept_id,))
    course_check = admin_db.query_one("SELECT COUNT(*) AS c FROM course_map WHERE dept_id = %s", (dept_id,))
    grad_check = admin_db.query_one("SELECT COUNT(*) AS c FROM graduation_requirements WHERE dept_id = %s", (dept_id,))
    s_count = stu_check["c"] if stu_check else 0
    c_count = course_check["c"] if course_check else 0
    g_count = grad_check["c"] if grad_check else 0
    if s_count > 0 or c_count > 0 or g_count > 0:
        return jsonify({
            "status": "error",
            "message": f"防呆保護：無法刪除科系「{before['dept_name']}」，目前仍有 {s_count} 位學生、{c_count} 門課程或 {g_count} 筆畢業門檻綁定此科系，請先解除關聯。"
        }), 400

    admin_db.execute_db("DELETE FROM departments WHERE dept_id = %s", (dept_id,))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("departments", dept_id, "DELETE", before, None, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_DEPARTMENTS
        DEMO_DEPARTMENTS[:] = [d for d in DEMO_DEPARTMENTS if d.get("dept_id") != dept_id]
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"科系「{before['dept_name']}」已成功刪除"}), 200

# -------------------------------------------------------------------------
# 3. course_map（全校課程地圖）
# -------------------------------------------------------------------------
def _has_circular_prerequisite(course_id, prereq_id):
    """檢查若將 course_id 的先修設為 prereq_id，是否會形成循環擋修 (例如 A -> B -> A)"""
    if not prereq_id:
        return False
    if course_id == prereq_id:
        return True
    visited = {course_id}
    curr = prereq_id
    while curr:
        if curr in visited:
            return True
        visited.add(curr)
        row = admin_db.query_one("SELECT prerequisite_id FROM course_map WHERE course_id = %s", (curr,))
        curr = row["prerequisite_id"] if row and row.get("prerequisite_id") else None
    return False

@bp.route("/api/admin/course-map", methods=["GET"])
@admin_required
def list_course_map():
    dept_id = request.args.get("dept_id")
    course_type = request.args.get("course_type")
    search = request.args.get("search", "").strip()

    sql = """
        SELECT c.course_id, c.course_name, c.credits, c.prerequisite_id,
               c.is_required, c.course_type, c.dept_id, c.semester_suggest,
               c.description, c.semester_hours,
               p.course_name AS prerequisite_name,
               d.dept_name, d.college_name
        FROM course_map c
        LEFT JOIN course_map p ON c.prerequisite_id = p.course_id
        LEFT JOIN departments d ON c.dept_id = d.dept_id
        WHERE 1=1
    """
    params = []
    if dept_id:
        sql += " AND c.dept_id = %s"
        params.append(dept_id)
    if course_type:
        sql += " AND c.course_type = %s"
        params.append(course_type)
    if search:
        sql += " AND (c.course_id LIKE %s OR c.course_name LIKE %s OR c.description LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw])

    sql += " ORDER BY c.dept_id, c.semester_suggest, c.course_id"
    courses = admin_db.query_db(sql, tuple(params))
    return jsonify({"status": "success", "data": courses, "total": len(courses)}), 200

@bp.route("/api/admin/course-map", methods=["POST"])
@admin_required
def create_course():
    import re
    data = request.get_json(silent=True) or {}
    course_id = (data.get("course_id") or "").strip().upper()
    course_name = (data.get("course_name") or "").strip()
    try:
        credits = int(data.get("credits") if data.get("credits") is not None else 2)
        semester_hours = float(data.get("semester_hours") if data.get("semester_hours") is not None else credits)
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "學分數與每週時數必須為有效數字"}), 400

    if credits < 0 or credits > 15 or semester_hours < 0 or semester_hours > 20:
        return jsonify({"status": "error", "message": "學分數須介於 0～15 之間，每週時數須介於 0～20 之間"}), 400

    prerequisite_id = (str(data.get("prerequisite_id")).strip().upper() or None) if data.get("prerequisite_id") is not None else None
    is_required = 1 if data.get("is_required", True) else 0
    course_type = (data.get("course_type") or "專業必修").strip()
    dept_id = (data.get("dept_id") or "CS").strip().upper()
    semester_suggest = (data.get("semester_suggest") or "大一上").strip()
    description = (str(data.get("description")).strip() or None) if data.get("description") is not None else None

    if not course_id or not course_name:
        return jsonify({"status": "error", "message": "課程代碼與課程名稱為必填"}), 400
    if not re.match(r"^[A-Z0-9_\-]{2,20}$", course_id):
        return jsonify({"status": "error", "message": "課程代碼格式不正確：請輸入 2～20 字元的大寫英數字（例如 CS101）"}), 400

    existing = admin_db.query_one("SELECT course_id FROM course_map WHERE course_id = %s", (course_id,))
    if existing:
        return jsonify({"status": "error", "message": f"課程代碼「{course_id}」已存在"}), 400

    # 避免自我先修遞迴、循環擋修或不存在的先修科目
    if prerequisite_id:
        if _has_circular_prerequisite(course_id, prerequisite_id):
            return jsonify({"status": "error", "message": "防呆保護：先修科目設定會造成循環擋修（不能將自身或後續關聯課程設為先修科目）"}), 400
        p_row = admin_db.query_one("SELECT course_id FROM course_map WHERE course_id = %s", (prerequisite_id,))
        if not p_row:
            return jsonify({"status": "error", "message": f"找不到指定的先修科目代碼「{prerequisite_id}」"}), 400

    # 確保科系代碼存在，避免外鍵衝突
    dept_row = admin_db.query_one("SELECT dept_id FROM departments WHERE dept_id = %s", (dept_id,))
    if not dept_row:
        admin_db.execute_db("INSERT IGNORE INTO departments (dept_id, dept_name, college_name) VALUES (%s, %s, %s)",
                            (dept_id, f"{dept_id}系", "通用學院"))

    admin_db.execute_db("""
        INSERT INTO course_map (course_id, course_name, credits, prerequisite_id, is_required, course_type, dept_id, semester_suggest, description, semester_hours)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (course_id, course_name, credits, prerequisite_id, is_required, course_type, dept_id, semester_suggest, description, semester_hours))

    new_dict = {
        "course_id": course_id, "course_name": course_name, "credits": credits,
        "prerequisite_id": prerequisite_id, "is_required": is_required,
        "course_type": course_type, "dept_id": dept_id, "semester_suggest": semester_suggest,
        "description": description, "semester_hours": semester_hours
    }
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("course_map", course_id, "INSERT", None, new_dict, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_COURSES
        DEMO_COURSES.append(new_dict)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"已成功新增課程「{course_name}」({course_id})", "data": new_dict}), 201

@bp.route("/api/admin/course-map/<string:course_id>", methods=["PUT"])
@admin_required
def update_course(course_id):
    course_id = course_id.strip().upper()
    data = request.get_json(silent=True) or {}
    before = admin_db.query_one("SELECT * FROM course_map WHERE course_id = %s", (course_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該課程代碼"}), 404

    course_name = (data.get("course_name") if data.get("course_name") is not None else before["course_name"]).strip()
    if not course_name:
        return jsonify({"status": "error", "message": "課程名稱不可為空白"}), 400

    try:
        credits = int(data.get("credits") if data.get("credits") is not None else before["credits"])
        semester_hours = float(data.get("semester_hours") if data.get("semester_hours") is not None else (before.get("semester_hours") or credits))
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "學分數與每週時數必須為有效數字"}), 400

    if credits < 0 or credits > 15 or semester_hours < 0 or semester_hours > 20:
        return jsonify({"status": "error", "message": "學分數須介於 0～15 之間，每週時數須介於 0～20 之間"}), 400

    prerequisite_id = (str(data.get("prerequisite_id")).strip().upper() or None) if "prerequisite_id" in data and data.get("prerequisite_id") is not None else (before["prerequisite_id"] if "prerequisite_id" not in data else None)

    if prerequisite_id:
        if _has_circular_prerequisite(course_id, prerequisite_id):
            return jsonify({"status": "error", "message": "防呆保護：先修科目設定會造成循環擋修（不能將自身或後續關聯課程設為先修科目）"}), 400
        p_row = admin_db.query_one("SELECT course_id FROM course_map WHERE course_id = %s", (prerequisite_id,))
        if not p_row:
            return jsonify({"status": "error", "message": f"找不到指定的先修科目代碼「{prerequisite_id}」"}), 400

    is_required = 1 if data.get("is_required", before["is_required"]) else 0
    course_type = (data.get("course_type") or before["course_type"]).strip()
    dept_id = (data.get("dept_id") or before["dept_id"]).strip().upper()
    semester_suggest = (data.get("semester_suggest") or before["semester_suggest"]).strip()
    description = (str(data.get("description")).strip() or None) if data.get("description") is not None else before.get("description")

    admin_db.execute_db("""
        UPDATE course_map
        SET course_name = %s, credits = %s, prerequisite_id = %s, is_required = %s,
            course_type = %s, dept_id = %s, semester_suggest = %s, description = %s, semester_hours = %s
        WHERE course_id = %s
    """, (course_name, credits, prerequisite_id, is_required, course_type, dept_id, semester_suggest, description, semester_hours, course_id))

    after = {
        "course_id": course_id, "course_name": course_name, "credits": credits,
        "prerequisite_id": prerequisite_id, "is_required": is_required,
        "course_type": course_type, "dept_id": dept_id, "semester_suggest": semester_suggest,
        "description": description, "semester_hours": semester_hours
    }
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("course_map", course_id, "UPDATE", before, after, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_COURSES
        for c in DEMO_COURSES:
            if c.get("course_id") == course_id:
                c.update(after)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"課程「{course_name}」資訊已更新"}), 200

@bp.route("/api/admin/course-map/<string:course_id>", methods=["DELETE"])
@admin_required
def delete_course(course_id):
    course_id = course_id.strip().upper()
    before = admin_db.query_one("SELECT * FROM course_map WHERE course_id = %s", (course_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該課程代碼"}), 404

    # 1. 檢查是否為其他課程的先修科目
    children = admin_db.query_db("SELECT course_id, course_name FROM course_map WHERE prerequisite_id = %s", (course_id,))
    if children:
        child_names = "、".join([f"{c['course_name']}({c['course_id']})" for c in children])
        return jsonify({
            "status": "error",
            "message": f"防呆保護：無法刪除「{before['course_name']}」，此課程被設定為【{child_names}】的先修科目，請先解除其先修擋修關聯。"
        }), 400

    # 2. 檢查是否已有學生歷年修課成績綁定此課程 (防止誤刪課程連帶抹除學生歷史成績)
    cred_check = admin_db.query_one("SELECT COUNT(*) AS c FROM student_credits WHERE course_id = %s", (course_id,))
    if cred_check and cred_check["c"] > 0:
        return jsonify({
            "status": "error",
            "message": f"防呆保護：無法刪除「{before['course_name']}」({course_id})，目前已有 {cred_check['c']} 筆學生歷年修課成績紀錄綁定此課程。"
        }), 400

    admin_db.execute_db("DELETE FROM course_map WHERE course_id = %s", (course_id,))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("course_map", course_id, "DELETE", before, None, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_COURSES
        DEMO_COURSES[:] = [c for c in DEMO_COURSES if c.get("course_id") != course_id]
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"課程「{before['course_name']}」已成功刪除"}), 200

# -------------------------------------------------------------------------
# 4. graduation_requirements（畢業門檻）
# -------------------------------------------------------------------------
def _validate_grad_req_values(data, defaults=None):
    defaults = defaults or {}
    try:
        total_credits = int(data.get("total_credits_req", defaults.get("total_credits_req", 128)))
        major_required = int(data.get("major_required_req", defaults.get("major_required_req", 60)))
        major_elective = int(data.get("major_elective_req", defaults.get("major_elective_req", 30)))
        general_req = int(data.get("general_req", defaults.get("general_req", 28)))
        ethics_req = int(data.get("ethics_req", defaults.get("ethics_req", 2)))
        project_req = int(data.get("project_req", defaults.get("project_req", 3)))
    except (ValueError, TypeError):
        return None, "各類學分門檻必須為有效整數"

    if total_credits < 50 or total_credits > 300:
        return None, "畢業總學分要求須介於 50～300 學分之間"
    if any(x < 0 for x in (major_required, major_elective, general_req, ethics_req, project_req)):
        return None, "學分要求不可為負數"
    if (major_required + major_elective + general_req) > total_credits:
        return None, f"防呆檢查：專業必修({major_required}) + 專業選修({major_elective}) + 通識學分({general_req}) 的加總({major_required + major_elective + general_req}) 不可大於畢業總學分要求({total_credits})"

    english_name = (data.get("english_threshold_name") if data.get("english_threshold_name") is not None else defaults.get("english_threshold_name", "多益 550 分或通過進階英文檢定")).strip()
    if not english_name:
        return None, "語文檢定門檻說明不可為空白"

    return {
        "total_credits_req": total_credits,
        "major_required_req": major_required,
        "major_elective_req": major_elective,
        "general_req": general_req,
        "english_threshold_name": english_name,
        "ethics_req": ethics_req,
        "project_req": project_req
    }, None

@bp.route("/api/admin/graduation-requirements", methods=["GET"])
@admin_required
def list_graduation_requirements():
    reqs = admin_db.query_db("""
        SELECT g.*, d.dept_name, d.college_name
        FROM graduation_requirements g
        LEFT JOIN departments d ON g.dept_id = d.dept_id
        ORDER BY d.college_name, g.dept_id
    """)
    return jsonify({"status": "success", "data": reqs}), 200

@bp.route("/api/admin/graduation-requirements", methods=["POST"])
@admin_required
def create_graduation_requirement():
    data = request.get_json(silent=True) or {}
    dept_id = (data.get("dept_id") or "").strip().upper()
    if not dept_id:
        return jsonify({"status": "error", "message": "必須選擇所屬科系"}), 400

    vals, err = _validate_grad_req_values(data)
    if err:
        return jsonify({"status": "error", "message": err}), 400

    total_credits = vals["total_credits_req"]
    major_required = vals["major_required_req"]
    major_elective = vals["major_elective_req"]
    general_req = vals["general_req"]
    english_name = vals["english_threshold_name"]
    ethics_req = vals["ethics_req"]
    project_req = vals["project_req"]

    existing = admin_db.query_one("SELECT * FROM graduation_requirements WHERE dept_id = %s", (dept_id,))
    if existing:
        req_id = existing["req_id"]
        admin_db.execute_db("""
            UPDATE graduation_requirements
            SET total_credits_req = %s, major_required_req = %s, major_elective_req = %s,
                general_req = %s, english_threshold_name = %s, ethics_req = %s, project_req = %s
            WHERE req_id = %s
        """, (total_credits, major_required, major_elective, general_req, english_name, ethics_req, project_req, req_id))
        after = {"req_id": req_id, "dept_id": dept_id, **vals}
        actor_name, actor_role, actor_ip = _get_current_actor()
        admin_db.log_audit_trail("graduation_requirements", req_id, "UPDATE", existing, after, actor_name, actor_role, actor_ip)
        try:
            from app import DEMO_GRADUATION_REQUIREMENTS
            DEMO_GRADUATION_REQUIREMENTS[dept_id] = after
        except Exception:
            pass
        return jsonify({"status": "success", "message": f"已成功更新科系「{dept_id}」畢業門檻", "req_id": req_id, "data": after}), 200

    res = admin_db.execute_db("""
        INSERT INTO graduation_requirements
        (dept_id, total_credits_req, major_required_req, major_elective_req, general_req, english_threshold_name, ethics_req, project_req)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (dept_id, total_credits, major_required, major_elective, general_req, english_name, ethics_req, project_req))

    new_id = res.get("lastrowid") or 1
    new_dict = {"req_id": new_id, "dept_id": dept_id, **vals}
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("graduation_requirements", new_id, "INSERT", None, new_dict, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_GRADUATION_REQUIREMENTS
        DEMO_GRADUATION_REQUIREMENTS[dept_id] = new_dict
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"已成功設定科系「{dept_id}」畢業門檻", "req_id": new_id, "data": new_dict}), 201

@bp.route("/api/admin/graduation-requirements/<int:req_id>", methods=["PUT"])
@admin_required
def update_graduation_requirement(req_id):
    data = request.get_json(silent=True) or {}
    before = admin_db.query_one("SELECT * FROM graduation_requirements WHERE req_id = %s", (req_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該畢業門檻設定"}), 404

    dept_id = (data.get("dept_id") or before["dept_id"]).strip().upper()
    vals, err = _validate_grad_req_values(data, before)
    if err:
        return jsonify({"status": "error", "message": err}), 400

    admin_db.execute_db("""
        UPDATE graduation_requirements
        SET dept_id = %s, total_credits_req = %s, major_required_req = %s, major_elective_req = %s,
            general_req = %s, english_threshold_name = %s, ethics_req = %s, project_req = %s
        WHERE req_id = %s
    """, (dept_id, vals["total_credits_req"], vals["major_required_req"], vals["major_elective_req"],
          vals["general_req"], vals["english_threshold_name"], vals["ethics_req"], vals["project_req"], req_id))

    after = {"req_id": req_id, "dept_id": dept_id, **vals}
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("graduation_requirements", req_id, "UPDATE", before, after, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_GRADUATION_REQUIREMENTS
        DEMO_GRADUATION_REQUIREMENTS[dept_id] = after
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"科系「{dept_id}」畢業門檻已更新"}), 200

@bp.route("/api/admin/graduation-requirements/<int:req_id>", methods=["DELETE"])
@admin_required
def delete_graduation_requirement(req_id):
    before = admin_db.query_one("SELECT * FROM graduation_requirements WHERE req_id = %s", (req_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該畢業門檻設定"}), 404

    admin_db.execute_db("DELETE FROM graduation_requirements WHERE req_id = %s", (req_id,))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("graduation_requirements", req_id, "DELETE", before, None, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_GRADUATION_REQUIREMENTS
        DEMO_GRADUATION_REQUIREMENTS.pop(before["dept_id"], None)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"科系「{before['dept_id']}」畢業門檻已刪除"}), 200

# -------------------------------------------------------------------------
# 5. knowledge_categories（知識庫主分類、總目錄）
# -------------------------------------------------------------------------
@bp.route("/api/admin/knowledge-categories", methods=["GET"])
@admin_required
def list_knowledge_categories():
    categories = admin_db.query_db("""
        SELECT c.*,
               (SELECT COUNT(*) FROM knowledge_base k WHERE k.category_id = c.category_id) AS article_count,
               (SELECT COUNT(*) FROM synonym_dictionary s WHERE s.category_id = c.category_id) AS synonym_count
        FROM knowledge_categories c
        ORDER BY c.sort_order ASC, c.category_id ASC
    """)
    return jsonify({"status": "success", "data": categories}), 200

@bp.route("/api/admin/knowledge-categories", methods=["POST"])
@admin_required
def create_knowledge_category():
    data = request.get_json(silent=True) or {}
    category_name = (data.get("category_name") or "").strip()
    icon = (data.get("icon") or "📖").strip() or "📖"
    try:
        sort_order = int(data.get("sort_order", 1))
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "選單排序必須為有效整數"}), 400

    if not category_name:
        return jsonify({"status": "error", "message": "主分類名稱為必填"}), 400
    if len(category_name) > 50:
        return jsonify({"status": "error", "message": "主分類名稱不可超過 50 字元"}), 400

    dup = admin_db.query_one("SELECT category_id FROM knowledge_categories WHERE category_name = %s", (category_name,))
    if dup:
        return jsonify({"status": "error", "message": f"主分類名稱「{category_name}」已存在"}), 400

    res = admin_db.execute_db("""
        INSERT INTO knowledge_categories (category_name, icon, sort_order)
        VALUES (%s, %s, %s)
    """, (category_name, icon, sort_order))

    new_id = res.get("lastrowid") or 1
    new_dict = {"category_id": new_id, "category_name": category_name, "icon": icon, "sort_order": sort_order}
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("knowledge_categories", new_id, "INSERT", None, new_dict, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_CATEGORIES
        DEMO_CATEGORIES.append(new_dict)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"已新增規章分類「{category_name}」", "category_id": new_id, "data": new_dict}), 201

@bp.route("/api/admin/knowledge-categories/<int:category_id>", methods=["PUT"])
@admin_required
def update_knowledge_category(category_id):
    data = request.get_json(silent=True) or {}
    before = admin_db.query_one("SELECT * FROM knowledge_categories WHERE category_id = %s", (category_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該規章分類"}), 404

    category_name = (data.get("category_name") if data.get("category_name") is not None else before["category_name"]).strip()
    icon = (data.get("icon") if data.get("icon") is not None else before["icon"]).strip() or "📖"
    try:
        sort_order = int(data.get("sort_order", before["sort_order"]))
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "選單排序必須為有效整數"}), 400

    if not category_name:
        return jsonify({"status": "error", "message": "主分類名稱不可為空白"}), 400
    if len(category_name) > 50:
        return jsonify({"status": "error", "message": "主分類名稱不可超過 50 字元"}), 400

    dup = admin_db.query_one("SELECT category_id FROM knowledge_categories WHERE category_name = %s AND category_id != %s", (category_name, category_id))
    if dup:
        return jsonify({"status": "error", "message": f"主分類名稱「{category_name}」已存在"}), 400

    admin_db.execute_db("""
        UPDATE knowledge_categories SET category_name = %s, icon = %s, sort_order = %s WHERE category_id = %s
    """, (category_name, icon, sort_order, category_id))

    after = {"category_id": category_id, "category_name": category_name, "icon": icon, "sort_order": sort_order}
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("knowledge_categories", category_id, "UPDATE", before, after, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_CATEGORIES
        for c in DEMO_CATEGORIES:
            if c.get("category_id") == category_id:
                c.update(after)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"規章分類「{category_name}」已更新"}), 200

@bp.route("/api/admin/knowledge-categories/<int:category_id>", methods=["DELETE"])
@admin_required
def delete_knowledge_category(category_id):
    before = admin_db.query_one("SELECT * FROM knowledge_categories WHERE category_id = %s", (category_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該規章分類"}), 404

    # 檢查是否有法規文章或同義詞綁定此分類
    kb_check = admin_db.query_one("SELECT COUNT(*) AS c FROM knowledge_base WHERE category_id = %s", (category_id,))
    syn_check = admin_db.query_one("SELECT COUNT(*) AS c FROM synonym_dictionary WHERE category_id = %s", (category_id,))
    kb_cnt = kb_check["c"] if kb_check else 0
    syn_cnt = syn_check["c"] if syn_check else 0
    if kb_cnt > 0 or syn_cnt > 0:
        return jsonify({
            "status": "error",
            "message": f"防呆保護：無法刪除「{before['category_name']}」，目前仍有 {kb_cnt} 篇規章條文與 {syn_cnt} 筆同義詞隸屬於此主分類，請先遷移或刪除關聯項目。"
        }), 400

    admin_db.execute_db("DELETE FROM knowledge_categories WHERE category_id = %s", (category_id,))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("knowledge_categories", category_id, "DELETE", before, None, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_CATEGORIES
        DEMO_CATEGORIES[:] = [c for c in DEMO_CATEGORIES if c.get("category_id") != category_id]
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"規章分類「{before['category_name']}」已成功刪除"}), 200

# -------------------------------------------------------------------------
# 6. synonym_dictionary（搜尋同義詞字典）
# -------------------------------------------------------------------------
@bp.route("/api/admin/synonyms", methods=["GET"])
@admin_required
def list_synonyms():
    category_id = request.args.get("category_id")
    search = request.args.get("search", "").strip()

    sql = """
        SELECT s.synonym_id, s.category_id, s.user_keyword, s.official_term,
               c.category_name, c.icon
        FROM synonym_dictionary s
        LEFT JOIN knowledge_categories c ON s.category_id = c.category_id
        WHERE 1=1
    """
    params = []
    if category_id:
        sql += " AND s.category_id = %s"
        params.append(category_id)
    if search:
        sql += " AND (s.user_keyword LIKE %s OR s.official_term LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw])

    sql += " ORDER BY s.synonym_id DESC"
    synonyms = admin_db.query_db(sql, tuple(params))
    return jsonify({"status": "success", "data": synonyms, "total": len(synonyms)}), 200

@bp.route("/api/admin/synonyms", methods=["POST"])
@admin_required
def create_synonym():
    data = request.get_json(silent=True) or {}
    user_keyword = (data.get("user_keyword") or "").strip()
    official_term = (data.get("official_term") or "").strip()
    category_id = data.get("category_id")
    if category_id:
        try:
            category_id = int(category_id)
            chk = admin_db.query_one("SELECT category_id FROM knowledge_categories WHERE category_id = %s", (category_id,))
            if not chk:
                category_id = None
        except Exception:
            category_id = None

    if not user_keyword or not official_term:
        return jsonify({"status": "error", "message": "日常俗稱與正式條文名稱皆為必填"}), 400
    if user_keyword.lower() == official_term.lower():
        return jsonify({"status": "error", "message": "防呆檢查：日常俗稱與對應的官方標準名稱不可相同"}), 400
    if len(user_keyword) > 50 or len(official_term) > 50:
        return jsonify({"status": "error", "message": "俗稱與標準名稱長度不可超過 50 字元"}), 400

    dup = admin_db.query_one("SELECT synonym_id, official_term FROM synonym_dictionary WHERE LOWER(user_keyword) = LOWER(%s)", (user_keyword,))
    if dup:
        return jsonify({"status": "error", "message": f"口語俗稱「{user_keyword}」已存在（目前已對應至「{dup['official_term']}」）"}), 400

    res = admin_db.execute_db("""
        INSERT INTO synonym_dictionary (user_keyword, official_term, category_id)
        VALUES (%s, %s, %s)
    """, (user_keyword, official_term, category_id))

    new_id = res.get("lastrowid") or 1
    new_dict = {
        "synonym_id": new_id, "user_keyword": user_keyword,
        "official_term": official_term, "category_id": category_id
    }
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("synonym_dictionary", new_id, "INSERT", None, new_dict, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_SYNONYMS
        DEMO_SYNONYMS.append(new_dict)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"已成功新增同義詞「{user_keyword}」→「{official_term}」", "synonym_id": new_id, "data": new_dict}), 201

@bp.route("/api/admin/synonyms/<int:synonym_id>", methods=["PUT"])
@admin_required
def update_synonym(synonym_id):
    data = request.get_json(silent=True) or {}
    before = admin_db.query_one("SELECT * FROM synonym_dictionary WHERE synonym_id = %s", (synonym_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該同義詞項目"}), 404

    user_keyword = (data.get("user_keyword") if data.get("user_keyword") is not None else before["user_keyword"]).strip()
    official_term = (data.get("official_term") if data.get("official_term") is not None else before["official_term"]).strip()
    category_id = data.get("category_id", before["category_id"])
    if category_id:
        try: category_id = int(category_id)
        except Exception: category_id = None

    if not user_keyword or not official_term:
        return jsonify({"status": "error", "message": "日常俗稱與正式條文名稱不可為空白"}), 400
    if user_keyword.lower() == official_term.lower():
        return jsonify({"status": "error", "message": "防呆檢查：日常俗稱與對應的官方標準名稱不可相同"}), 400

    dup = admin_db.query_one("SELECT synonym_id, official_term FROM synonym_dictionary WHERE LOWER(user_keyword) = LOWER(%s) AND synonym_id != %s", (user_keyword, synonym_id))
    if dup:
        return jsonify({"status": "error", "message": f"口語俗稱「{user_keyword}」已存在（目前已對應至「{dup['official_term']}」）"}), 400

    admin_db.execute_db("""
        UPDATE synonym_dictionary SET user_keyword = %s, official_term = %s, category_id = %s WHERE synonym_id = %s
    """, (user_keyword, official_term, category_id, synonym_id))

    after = {"synonym_id": synonym_id, "user_keyword": user_keyword, "official_term": official_term, "category_id": category_id}
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("synonym_dictionary", synonym_id, "UPDATE", before, after, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_SYNONYMS
        for s in DEMO_SYNONYMS:
            if s.get("synonym_id") == synonym_id:
                s.update(after)
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"同義詞「{user_keyword}」已更新"}), 200

@bp.route("/api/admin/synonyms/<int:synonym_id>", methods=["DELETE"])
@admin_required
def delete_synonym(synonym_id):
    before = admin_db.query_one("SELECT * FROM synonym_dictionary WHERE synonym_id = %s", (synonym_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該同義詞項目"}), 404

    admin_db.execute_db("DELETE FROM synonym_dictionary WHERE synonym_id = %s", (synonym_id,))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("synonym_dictionary", synonym_id, "DELETE", before, None, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_SYNONYMS
        DEMO_SYNONYMS[:] = [s for s in DEMO_SYNONYMS if s.get("synonym_id") != synonym_id]
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"同義詞「{before['user_keyword']}」已刪除"}), 200

# =========================================================================
# 支柱二：負責監控不隨便修改 歷史紀錄與稽核
# =========================================================================

# -------------------------------------------------------------------------
# 1. 系統安全稽核日誌 (audit_logs)
# -------------------------------------------------------------------------
@bp.route("/api/admin/core/audit-logs", methods=["GET"])
@bp.route("/api/admin/audit-logs", methods=["GET"])
@admin_required
def list_audit_logs():
    table_filter = request.args.get("table_name")
    action_filter = request.args.get("action")
    changed_by = request.args.get("changed_by", "").strip()
    try:
        limit = max(1, min(500, int(request.args.get("limit", 200))))
    except (ValueError, TypeError):
        limit = 200

    sql = "SELECT * FROM audit_logs WHERE 1=1"
    params = []
    if table_filter:
        sql += " AND table_name = %s"
        params.append(table_filter)
    if action_filter:
        sql += " AND action = %s"
        params.append(action_filter)
    if changed_by:
        sql += " AND changed_by LIKE %s"
        params.append(f"%{changed_by}%")

    sql += " ORDER BY log_id DESC LIMIT %s"
    params.append(limit)

    logs = admin_db.query_db(sql, tuple(params))
    # 解析 JSON
    for r in logs:
        r["changed_at"] = str(r["changed_at"])
        for key in ("before_json", "after_json"):
            if isinstance(r.get(key), str):
                try: r[key] = json.loads(r[key])
                except Exception: pass

    return jsonify({"status": "success", "data": logs, "total": len(logs)}), 200

# -------------------------------------------------------------------------
# 2. 搜尋日誌與效能 (search_logs)
# -------------------------------------------------------------------------
@bp.route("/api/admin/search-logs", methods=["GET"])
@admin_required
def list_search_logs():
    try:
        limit = max(1, min(500, int(request.args.get("limit", 100))))
    except (ValueError, TypeError):
        limit = 100
    search = request.args.get("search", "").strip()

    sql = "SELECT * FROM search_logs WHERE 1=1"
    params = []
    if search:
        sql += " AND query LIKE %s"
        params.append(f"%{search}%")
    sql += " ORDER BY id DESC LIMIT %s"
    params.append(limit)

    logs = admin_db.query_db(sql, tuple(params))

    # 統計指標
    total_row = admin_db.query_one("SELECT COUNT(*) AS total, SUM(CASE WHEN matched = 1 THEN 1 ELSE 0 END) AS matched_count FROM search_logs")
    total = total_row["total"] if total_row else 0
    matched = total_row["matched_count"] if total_row and total_row["matched_count"] else 0
    unmatched = total - matched
    match_rate = round((matched / total * 100), 1) if total > 0 else 100.0

    # 熱門搜尋
    top_queries = admin_db.query_db("""
        SELECT query, COUNT(*) AS count, MAX(created_at) AS last_time,
               SUM(CASE WHEN matched = 1 THEN 1 ELSE 0 END) AS match_success
        FROM search_logs
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
    """)

    return jsonify({
        "status": "success",
        "data": logs,
        "stats": {
            "total_searches": total,
            "matched_count": matched,
            "unmatched_count": unmatched,
            "match_rate": match_rate,
            "top_queries": top_queries
        }
    }), 200

# -------------------------------------------------------------------------
# 3. 未匹配紀錄 (unmatched_queries)
# -------------------------------------------------------------------------
@bp.route("/api/admin/core/unmatched-queries", methods=["GET"])
@bp.route("/api/admin/unmatched-queries", methods=["GET"])
@admin_required
def list_unmatched_queries():
    status = request.args.get("status")
    sql = "SELECT * FROM unmatched_queries WHERE 1=1"
    params = []
    if status:
        sql += " AND status = %s"
        params.append(status)
    sql += " ORDER BY search_count DESC, query_id DESC"
    queries = admin_db.query_db(sql, tuple(params))
    return jsonify({"status": "success", "data": queries, "total": len(queries)}), 200

@bp.route("/api/admin/core/unmatched-queries/convert-synonym", methods=["POST"])
@bp.route("/api/admin/unmatched-queries/convert-synonym", methods=["POST"])
@admin_required
def convert_unmatched_to_synonym():
    data = request.get_json() or {}
    query_id = data.get("query_id")
    user_keyword = data.get("user_keyword", "").strip()
    official_term = data.get("official_term", "").strip()
    category_id = data.get("category_id")
    if category_id:
        try: category_id = int(category_id)
        except Exception: category_id = None

    if not user_keyword or not official_term:
        return jsonify({"status": "error", "message": "俗稱關鍵字與正式條文名稱皆為必填"}), 400
    if len(user_keyword) > 50 or len(official_term) > 50:
        return jsonify({"status": "error", "message": "俗稱關鍵字與正式條文名稱不可超過 50 個字元"}), 400
    if user_keyword.lower() == official_term.lower():
        return jsonify({"status": "error", "message": "防呆攔截：俗稱關鍵字與正式條文名稱不可完全相同（避免自我映射）"}), 400

    # 1. 寫入或更新同義詞字典（防呆：若已存在相同俗稱則直接更新對應正式詞彙）
    dup = admin_db.query_one("SELECT synonym_id FROM synonym_dictionary WHERE LOWER(user_keyword) = LOWER(%s)", (user_keyword,))
    if dup:
        syn_id = dup["synonym_id"]
        admin_db.execute_db("""
            UPDATE synonym_dictionary SET official_term = %s, category_id = %s WHERE synonym_id = %s
        """, (official_term, category_id, syn_id))
    else:
        syn_res = admin_db.execute_db("""
            INSERT INTO synonym_dictionary (user_keyword, official_term, category_id)
            VALUES (%s, %s, %s)
        """, (user_keyword, official_term, category_id))
        syn_id = syn_res.get("lastrowid") or 1

    # 2. 更新 unmatched_queries 狀態為「已轉同義詞」
    if query_id:
        admin_db.execute_db("""
            UPDATE unmatched_queries SET status = '已轉同義詞', resolved_term = %s WHERE query_id = %s
        """, (official_term, query_id))
    else:
        admin_db.execute_db("""
            UPDATE unmatched_queries SET status = '已轉同義詞', resolved_term = %s WHERE query_text = %s
        """, (official_term, user_keyword))

    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail(
        "synonym_dictionary", syn_id, "UPDATE" if dup else "INSERT", None,
        {"user_keyword": user_keyword, "official_term": official_term, "from_unmatched_id": query_id},
        actor_name, actor_role, actor_ip
    )

    try:
        from app import DEMO_SYNONYMS, DEMO_UNMATCHED_QUERIES
        DEMO_SYNONYMS[:] = [s for s in DEMO_SYNONYMS if s.get("synonym_id") != syn_id]
        DEMO_SYNONYMS.append({"synonym_id": syn_id, "user_keyword": user_keyword, "official_term": official_term, "category_id": category_id})
        for u in DEMO_UNMATCHED_QUERIES:
            if u.get("query_id") == query_id or u.get("query_text") == user_keyword:
                u["status"] = "已轉同義詞"
                u["resolved_term"] = official_term
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"成功將「{user_keyword}」轉換為同義詞「{official_term}」！詞庫已即時更新。"}), 200

@bp.route("/api/admin/core/unmatched-queries/<int:query_id>/status", methods=["PUT"])
@bp.route("/api/admin/unmatched-queries/<int:query_id>/status", methods=["PUT"])
@admin_required
def update_unmatched_status(query_id):
    data = request.get_json() or {}
    new_status = data.get("status", "待處理").strip()
    allowed_statuses = {"待處理", "已轉同義詞", "已新增法規", "已忽略"}
    if new_status not in allowed_statuses:
        return jsonify({"status": "error", "message": f"不合法的處理狀態：{new_status}"}), 400
    before = admin_db.query_one("SELECT * FROM unmatched_queries WHERE query_id = %s", (query_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該未匹配關鍵字"}), 404

    admin_db.execute_db("UPDATE unmatched_queries SET status = %s WHERE query_id = %s", (new_status, query_id))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("unmatched_queries", query_id, "UPDATE", before, {"status": new_status}, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_UNMATCHED_QUERIES
        for u in DEMO_UNMATCHED_QUERIES:
            if u.get("query_id") == query_id:
                u["status"] = new_status
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"未匹配詞彙「{before['query_text']}」狀態已更新為「{new_status}」"}), 200

# -------------------------------------------------------------------------
# 4. 訪客登記日誌 (visitor_logs)
# -------------------------------------------------------------------------
@bp.route("/api/admin/core/visitor-logs", methods=["GET"])
@bp.route("/api/admin/visitor-logs", methods=["GET"])
@admin_required
def list_visitor_logs():
    try:
        days = max(1, min(365, int(request.args.get("days", 30))))
    except (ValueError, TypeError):
        days = 30
    search = request.args.get("search", "").strip()

    sql = "SELECT * FROM visitor_logs WHERE 1=1"
    params = []
    if search:
        sql += " AND (visitor_name LIKE %s OR phone LIKE %s OR school_from LIKE %s OR purpose LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw, kw])
    sql += " ORDER BY log_id DESC LIMIT 200"

    logs = admin_db.query_db(sql, tuple(params))
    return jsonify({"status": "success", "data": logs, "total": len(logs)}), 200

@bp.route("/api/admin/core/visitor-logs/export.csv", methods=["GET"])
@bp.route("/api/admin/visitor-logs/export.csv", methods=["GET"])
@admin_required
def export_visitor_logs():
    logs = admin_db.query_db("SELECT * FROM visitor_logs ORDER BY log_id DESC")
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["編號", "訪客姓名", "聯絡電話", "來自學校", "入校/諮詢目的", "諮詢科系", "登記時間", "來源IP"])
    for r in logs:
        writer.writerow([r["log_id"], r["visitor_name"], r["phone"], r["school_from"], r["purpose"], r.get("target_dept", ""), r["visited_at"], r.get("ip_address", "")])

    return Response(
        "\ufeff" + output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ukn_visitors_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

# -------------------------------------------------------------------------
# 5. 學生歷年成績 (student_credits - 具法規佐證效力)
# -------------------------------------------------------------------------
@bp.route("/api/admin/student-credits", methods=["GET"])
@admin_required
def list_student_credits():
    student_id = request.args.get("student_id", "").strip().upper()
    semester = request.args.get("semester", "").strip()
    is_passed = request.args.get("is_passed")
    search = request.args.get("search", "").strip()

    sql = """
        SELECT sc.credit_id, sc.student_id, sc.course_id, sc.semester,
               sc.score, sc.is_passed,
               s.full_name AS student_name, s.class_name,
               c.course_name, c.credits, c.course_type
        FROM student_credits sc
        LEFT JOIN students s ON sc.student_id = s.student_id
        LEFT JOIN course_map c ON sc.course_id = c.course_id
        WHERE 1=1
    """
    params = []
    if student_id:
        sql += " AND sc.student_id = %s"
        params.append(student_id)
    if semester:
        sql += " AND sc.semester = %s"
        params.append(semester)
    if is_passed in ("0", "1"):
        sql += " AND sc.is_passed = %s"
        params.append(int(is_passed))
    if search:
        sql += " AND (sc.student_id LIKE %s OR s.full_name LIKE %s OR sc.course_id LIKE %s OR c.course_name LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw, kw])

    sql += " ORDER BY sc.semester DESC, sc.student_id, sc.course_id"
    records = admin_db.query_db(sql, tuple(params))

    total_taken = len(records)
    total_passed = sum(1 for r in records if r["is_passed"] == 1)
    pass_rate = round(total_passed / total_taken * 100, 1) if total_taken > 0 else 0.0

    return jsonify({
        "status": "success",
        "data": records,
        "total": total_taken,
        "stats": {
            "total_courses": total_taken,
            "passed_courses": total_passed,
            "failed_courses": total_taken - total_passed,
            "pass_rate": pass_rate
        }
    }), 200

# -------------------------------------------------------------------------
# 6. 學生出缺勤紀錄 (attendance_records - 具法規佐證效力)
# -------------------------------------------------------------------------
@bp.route("/api/admin/attendance-records", methods=["GET"])
@admin_required
def list_attendance_records():
    student_id = request.args.get("student_id", "").strip().upper()
    att_type = request.args.get("type", "").strip()
    search = request.args.get("search", "").strip()

    sql = """
        SELECT a.id, a.student_id, a.date, a.course_name, a.type,
               a.notified, a.hours, a.exam_policy,
               s.full_name AS student_name, s.class_name
        FROM attendance_records a
        LEFT JOIN students s ON a.student_id = s.student_id
        WHERE 1=1
    """
    params = []
    if student_id:
        sql += " AND a.student_id = %s"
        params.append(student_id)
    if att_type:
        sql += " AND a.type = %s"
        params.append(att_type)
    if search:
        sql += " AND (a.student_id LIKE %s OR s.full_name LIKE %s OR a.course_name LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw])

    sql += " ORDER BY a.date DESC, a.id DESC"
    records = admin_db.query_db(sql, tuple(params))

    # 假別統計
    type_counts = {}
    for r in records:
        t = r["type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    return jsonify({
        "status": "success",
        "data": records,
        "total": len(records),
        "type_counts": type_counts
    }), 200

# -------------------------------------------------------------------------
# 7. 學生獎懲與幹部 (student_records - 具法規佐證效力)
# -------------------------------------------------------------------------
@bp.route("/api/admin/student-records", methods=["GET"])
@admin_required
def list_student_records():
    student_id = request.args.get("student_id", "").strip().upper()
    kind = request.args.get("kind", "").strip()
    semester = request.args.get("semester", "").strip()
    search = request.args.get("search", "").strip()

    sql = """
        SELECT sr.record_id, sr.student_id, sr.kind, sr.item, sr.count,
               sr.reason, sr.semester, sr.record_date, sr.created_at,
               s.full_name AS student_name, s.class_name, s.dept_id
        FROM student_records sr
        LEFT JOIN students s ON sr.student_id = s.student_id
        WHERE 1=1
    """
    params = []
    if student_id:
        sql += " AND sr.student_id = %s"
        params.append(student_id)
    if kind:
        sql += " AND sr.kind = %s"
        params.append(kind)
    if semester:
        sql += " AND sr.semester = %s"
        params.append(semester)
    if search:
        sql += " AND (sr.student_id LIKE %s OR s.full_name LIKE %s OR sr.item LIKE %s OR sr.reason LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw, kw])

    sql += " ORDER BY sr.record_date DESC, sr.record_id DESC"
    records = admin_db.query_db(sql, tuple(params))

    merit_count = sum(r["count"] for r in records if r["kind"] == "獎懲" and r["item"] in ("嘉獎", "小功", "大功"))
    demerit_count = sum(r["count"] for r in records if r["kind"] == "獎懲" and r["item"] in ("申誡", "小過", "大過"))
    cadre_count = sum(1 for r in records if r["kind"] == "幹部")

    return jsonify({
        "status": "success",
        "data": records,
        "total": len(records),
        "stats": {
            "merit_count": merit_count,
            "demerit_count": demerit_count,
            "cadre_count": cadre_count
        }
    }), 200
