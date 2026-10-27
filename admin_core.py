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
from werkzeug.security import generate_password_hash

import admin_db

bp = Blueprint("admin_core", __name__)

def _get_current_actor():
    """取得操作者姓名、身分角色與 IP"""
    username = session.get("username")
    full_name = session.get("full_name") or username or "系統管理員"
    role = session.get("role") or "管理員"
    ip = request.remote_addr or "127.0.0.1"
    return full_name, role, ip

def admin_required(f):
    """管理員權限保護裝飾器；本機開發或未設定時自動允許，確保無縫使用"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        role = session.get("role")
        # 若已登入且角色為學生或家長，則拒絕
        if role and role in ("學生", "家長"):
            return jsonify({"status": "error", "message": "權限不足，僅限校務管理人員存取"}), 403
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
        "knowledge_categories", "synonym_dictionary", "audit_logs",
        "search_logs", "unmatched_queries", "visitor_logs",
        "student_credits", "attendance_records", "student_records"
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
# 1. users（系統帳號與權限）
# -------------------------------------------------------------------------
@bp.route("/api/admin/users", methods=["GET"])
@admin_required
def list_users():
    role_filter = request.args.get("role")
    search = request.args.get("search", "").strip()

    sql = """
        SELECT u.user_id, u.username, u.role, u.student_id, u.full_name,
               u.advised_class, u.can_manage_dorm, u.created_at,
               s.class_name, s.dept_id
        FROM users u
        LEFT JOIN students s ON u.student_id = s.student_id
        WHERE 1=1
    """
    params = []
    if role_filter:
        sql += " AND u.role = %s"
        params.append(role_filter)
    if search:
        sql += " AND (u.username LIKE %s OR u.full_name LIKE %s OR u.student_id LIKE %s)"
        kw = f"%{search}%"
        params.extend([kw, kw, kw])

    sql += " ORDER BY u.user_id DESC"
    users = admin_db.query_db(sql, tuple(params))
    return jsonify({"status": "success", "data": users, "total": len(users)}), 200

@bp.route("/api/admin/users", methods=["POST"])
@admin_required
def create_user():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "學生").strip()
    full_name = data.get("full_name", "").strip()
    student_id = data.get("student_id", "").strip() or None
    advised_class = data.get("advised_class", "").strip() or None
    can_manage_dorm = 1 if data.get("can_manage_dorm") else 0

    if not username or not full_name:
        return jsonify({"status": "error", "message": "帳號名稱與姓名為必填欄位"}), 400
    if not password:
        password = "default_password_123"

    # 檢查帳號重疊
    existing = admin_db.query_one("SELECT user_id FROM users WHERE username = %s", (username,))
    if existing:
        return jsonify({"status": "error", "message": f"帳號「{username}」已存在，請使用其他帳號"}), 400

    pw_hash = generate_password_hash(password)
    res = admin_db.execute_db("""
        INSERT INTO users (username, password_hash, role, student_id, full_name, advised_class, can_manage_dorm)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (username, pw_hash, role, student_id, full_name, advised_class, can_manage_dorm))

    new_id = res.get("lastrowid") or username
    actor_name, actor_role, actor_ip = _get_current_actor()

    new_dict = {
        "user_id": new_id, "username": username, "role": role,
        "student_id": student_id, "full_name": full_name,
        "advised_class": advised_class, "can_manage_dorm": can_manage_dorm
    }
    admin_db.log_audit_trail("users", new_id, "INSERT", None, new_dict, actor_name, actor_role, actor_ip)

    # 同步至 app.DEMO_USERS
    try:
        from app import DEMO_USERS
        DEMO_USERS.append({"user_id": new_id, "username": username, "password_hash": pw_hash, "role": role, "student_id": student_id, "full_name": full_name, "can_manage_dorm": bool(can_manage_dorm)})
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"已成功建立使用者「{username}」({full_name})", "user_id": new_id}), 201

@bp.route("/api/admin/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    data = request.get_json() or {}
    before = admin_db.query_one("SELECT user_id, username, role, student_id, full_name, advised_class, can_manage_dorm FROM users WHERE user_id = %s", (user_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該使用者帳號"}), 404

    role = data.get("role", before["role"]).strip()
    full_name = data.get("full_name", before["full_name"]).strip()
    student_id = data.get("student_id", before["student_id"])
    if student_id is not None:
        student_id = student_id.strip() or None
    advised_class = data.get("advised_class", before["advised_class"])
    if advised_class is not None:
        advised_class = advised_class.strip() or None
    can_manage_dorm = 1 if data.get("can_manage_dorm") else 0

    password = data.get("password")
    if password and password.strip():
        pw_hash = generate_password_hash(password.strip())
        admin_db.execute_db("""
            UPDATE users SET role = %s, full_name = %s, student_id = %s, advised_class = %s, can_manage_dorm = %s, password_hash = %s
            WHERE user_id = %s
        """, (role, full_name, student_id, advised_class, can_manage_dorm, pw_hash, user_id))
    else:
        admin_db.execute_db("""
            UPDATE users SET role = %s, full_name = %s, student_id = %s, advised_class = %s, can_manage_dorm = %s
            WHERE user_id = %s
        """, (role, full_name, student_id, advised_class, can_manage_dorm, user_id))

    after = {
        "user_id": user_id, "username": before["username"], "role": role,
        "student_id": student_id, "full_name": full_name,
        "advised_class": advised_class, "can_manage_dorm": can_manage_dorm
    }
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("users", user_id, "UPDATE", before, after, actor_name, actor_role, actor_ip)

    # 同步至 app.DEMO_USERS
    try:
        from app import DEMO_USERS
        for u in DEMO_USERS:
            if u.get("user_id") == user_id:
                u.update({"role": role, "full_name": full_name, "student_id": student_id, "can_manage_dorm": bool(can_manage_dorm)})
                if password and password.strip():
                    u["password_hash"] = generate_password_hash(password.strip())
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"使用者「{before['username']}」資料已更新"}), 200

@bp.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    before = admin_db.query_one("SELECT user_id, username, role, full_name FROM users WHERE user_id = %s", (user_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該使用者帳號"}), 404

    # 防呆：避免刪除目前登入的管理者帳號
    if session.get("username") == before["username"]:
        return jsonify({"status": "error", "message": "不可刪除目前正在使用的管理員帳號"}), 400

    admin_db.execute_db("DELETE FROM users WHERE user_id = %s", (user_id,))
    actor_name, actor_role, actor_ip = _get_current_actor()
    admin_db.log_audit_trail("users", user_id, "DELETE", before, None, actor_name, actor_role, actor_ip)

    try:
        from app import DEMO_USERS
        DEMO_USERS[:] = [u for u in DEMO_USERS if u.get("user_id") != user_id]
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"使用者「{before['username']}」已成功刪除"}), 200

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
    data = request.get_json() or {}
    dept_id = data.get("dept_id", "").strip().upper()
    dept_name = data.get("dept_name", "").strip()
    college_name = data.get("college_name", "").strip()

    if not dept_id or not dept_name or not college_name:
        return jsonify({"status": "error", "message": "科系代碼、科系名稱與學院名稱皆為必填"}), 400

    existing = admin_db.query_one("SELECT dept_id FROM departments WHERE dept_id = %s", (dept_id,))
    if existing:
        return jsonify({"status": "error", "message": f"科系代碼「{dept_id}」已存在"}), 400

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
    data = request.get_json() or {}
    before = admin_db.query_one("SELECT dept_id, dept_name, college_name FROM departments WHERE dept_id = %s", (dept_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該科系代碼"}), 404

    dept_name = data.get("dept_name", before["dept_name"]).strip()
    college_name = data.get("college_name", before["college_name"]).strip()

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
    if (stu_check and stu_check["c"] > 0) or (course_check and course_check["c"] > 0):
        s_count = stu_check["c"] if stu_check else 0
        c_count = course_check["c"] if course_check else 0
        return jsonify({
            "status": "error",
            "message": f"無法刪除科系「{before['dept_name']}」：目前仍有 {s_count} 位學生學籍與 {c_count} 門課程綁定此科系。請先遷移關聯資料。"
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
    data = request.get_json() or {}
    course_id = data.get("course_id", "").strip().upper()
    course_name = data.get("course_name", "").strip()
    credits = int(data.get("credits", 2))
    prerequisite_id = data.get("prerequisite_id", "").strip().upper() or None
    is_required = 1 if data.get("is_required", True) else 0
    course_type = data.get("course_type", "專業必修").strip()
    dept_id = data.get("dept_id", "CS").strip().upper()
    semester_suggest = data.get("semester_suggest", "大一上").strip()
    description = data.get("description", "").strip() or None
    semester_hours = float(data.get("semester_hours", credits)) if data.get("semester_hours") else float(credits)

    if not course_id or not course_name:
        return jsonify({"status": "error", "message": "課程代碼與課程名稱為必填"}), 400

    existing = admin_db.query_one("SELECT course_id FROM course_map WHERE course_id = %s", (course_id,))
    if existing:
        return jsonify({"status": "error", "message": f"課程代碼「{course_id}」已存在"}), 400

    # 避免自我先修遞迴
    if prerequisite_id == course_id:
        return jsonify({"status": "error", "message": "課程不能將自身設為先修科目"}), 400

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
    data = request.get_json() or {}
    before = admin_db.query_one("SELECT * FROM course_map WHERE course_id = %s", (course_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該課程代碼"}), 404

    course_name = data.get("course_name", before["course_name"]).strip()
    credits = int(data.get("credits", before["credits"]))
    prerequisite_id = data.get("prerequisite_id")
    if prerequisite_id is not None:
        prerequisite_id = prerequisite_id.strip().upper() or None
    else:
        prerequisite_id = before["prerequisite_id"]

    if prerequisite_id == course_id:
        return jsonify({"status": "error", "message": "課程不能將自身設為先修科目"}), 400

    is_required = 1 if data.get("is_required", before["is_required"]) else 0
    course_type = data.get("course_type", before["course_type"]).strip()
    dept_id = data.get("dept_id", before["dept_id"]).strip().upper()
    semester_suggest = data.get("semester_suggest", before["semester_suggest"]).strip()
    description = data.get("description", before["description"])
    semester_hours = float(data.get("semester_hours", before["semester_hours"] or credits))

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

    # 檢查是否為其他課程的先修科目
    children = admin_db.query_db("SELECT course_id, course_name FROM course_map WHERE prerequisite_id = %s", (course_id,))
    if children:
        child_names = "、".join([f"{c['course_name']}({c['course_id']})" for c in children])
        return jsonify({
            "status": "error",
            "message": f"無法刪除「{before['course_name']}」：此課程被設定為【{child_names}】的先修科目，請先解除其先修擋修關聯。"
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
    data = request.get_json() or {}
    dept_id = data.get("dept_id", "").strip().upper()
    total_credits = int(data.get("total_credits_req", 128))
    major_required = int(data.get("major_required_req", 60))
    major_elective = int(data.get("major_elective_req", 30))
    general_req = int(data.get("general_req", 28))
    english_name = data.get("english_threshold_name", "多益 550 分或通過進階英文檢定").strip()
    ethics_req = int(data.get("ethics_req", 2))
    project_req = int(data.get("project_req", 3))

    if not dept_id:
        return jsonify({"status": "error", "message": "必須選擇所屬科系"}), 400

    existing = admin_db.query_one("SELECT req_id FROM graduation_requirements WHERE dept_id = %s", (dept_id,))
    if existing:
        return jsonify({"status": "error", "message": f"科系「{dept_id}」已設定過畢業門檻，請直接編輯原紀錄"}), 400

    res = admin_db.execute_db("""
        INSERT INTO graduation_requirements
        (dept_id, total_credits_req, major_required_req, major_elective_req, general_req, english_threshold_name, ethics_req, project_req)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (dept_id, total_credits, major_required, major_elective, general_req, english_name, ethics_req, project_req))

    new_id = res.get("lastrowid") or 1
    new_dict = {
        "req_id": new_id, "dept_id": dept_id, "total_credits_req": total_credits,
        "major_required_req": major_required, "major_elective_req": major_elective,
        "general_req": general_req, "english_threshold_name": english_name,
        "ethics_req": ethics_req, "project_req": project_req
    }
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
    data = request.get_json() or {}
    before = admin_db.query_one("SELECT * FROM graduation_requirements WHERE req_id = %s", (req_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該畢業門檻設定"}), 404

    dept_id = data.get("dept_id", before["dept_id"]).strip().upper()
    total_credits = int(data.get("total_credits_req", before["total_credits_req"]))
    major_required = int(data.get("major_required_req", before["major_required_req"]))
    major_elective = int(data.get("major_elective_req", before["major_elective_req"]))
    general_req = int(data.get("general_req", before["general_req"]))
    english_name = data.get("english_threshold_name", before["english_threshold_name"]).strip()
    ethics_req = int(data.get("ethics_req", before["ethics_req"]))
    project_req = int(data.get("project_req", before["project_req"]))

    admin_db.execute_db("""
        UPDATE graduation_requirements
        SET dept_id = %s, total_credits_req = %s, major_required_req = %s, major_elective_req = %s,
            general_req = %s, english_threshold_name = %s, ethics_req = %s, project_req = %s
        WHERE req_id = %s
    """, (dept_id, total_credits, major_required, major_elective, general_req, english_name, ethics_req, project_req, req_id))

    after = {
        "req_id": req_id, "dept_id": dept_id, "total_credits_req": total_credits,
        "major_required_req": major_required, "major_elective_req": major_elective,
        "general_req": general_req, "english_threshold_name": english_name,
        "ethics_req": ethics_req, "project_req": project_req
    }
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
    data = request.get_json() or {}
    category_name = data.get("category_name", "").strip()
    icon = data.get("icon", "📖").strip() or "📖"
    sort_order = int(data.get("sort_order", 1))

    if not category_name:
        return jsonify({"status": "error", "message": "主分類名稱為必填"}), 400

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
    data = request.get_json() or {}
    before = admin_db.query_one("SELECT * FROM knowledge_categories WHERE category_id = %s", (category_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該規章分類"}), 404

    category_name = data.get("category_name", before["category_name"]).strip()
    icon = data.get("icon", before["icon"]).strip()
    sort_order = int(data.get("sort_order", before["sort_order"]))

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

    # 檢查是否有法規文章綁定此分類
    kb_check = admin_db.query_one("SELECT COUNT(*) AS c FROM knowledge_base WHERE category_id = %s", (category_id,))
    if kb_check and kb_check["c"] > 0:
        return jsonify({
            "status": "error",
            "message": f"無法刪除「{before['category_name']}」：目前仍有 {kb_check['c']} 篇規章條文隸屬於此主分類，請先遷移或刪除關聯條文。"
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
    data = request.get_json() or {}
    user_keyword = data.get("user_keyword", "").strip()
    official_term = data.get("official_term", "").strip()
    category_id = data.get("category_id")
    if category_id:
        try: category_id = int(category_id)
        except Exception: category_id = None

    if not user_keyword or not official_term:
        return jsonify({"status": "error", "message": "日常俗稱與正式條文名稱皆為必填"}), 400

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
    data = request.get_json() or {}
    before = admin_db.query_one("SELECT * FROM synonym_dictionary WHERE synonym_id = %s", (synonym_id,))
    if not before:
        return jsonify({"status": "error", "message": "找不到該同義詞項目"}), 404

    user_keyword = data.get("user_keyword", before["user_keyword"]).strip()
    official_term = data.get("official_term", before["official_term"]).strip()
    category_id = data.get("category_id", before["category_id"])
    if category_id:
        try: category_id = int(category_id)
        except Exception: category_id = None

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
@bp.route("/api/admin/audit-logs", methods=["GET"])
@admin_required
def list_audit_logs():
    table_filter = request.args.get("table_name")
    action_filter = request.args.get("action")
    changed_by = request.args.get("changed_by", "").strip()
    limit = int(request.args.get("limit", 200))

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
    limit = int(request.args.get("limit", 100))
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

    # 1. 寫入同義詞字典
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
        "synonym_dictionary", syn_id, "INSERT", None,
        {"user_keyword": user_keyword, "official_term": official_term, "from_unmatched_id": query_id},
        actor_name, actor_role, actor_ip
    )

    try:
        from app import DEMO_SYNONYMS, DEMO_UNMATCHED_QUERIES
        DEMO_SYNONYMS.append({"synonym_id": syn_id, "user_keyword": user_keyword, "official_term": official_term, "category_id": category_id})
        for u in DEMO_UNMATCHED_QUERIES:
            if u.get("query_id") == query_id or u.get("query_text") == user_keyword:
                u["status"] = "已轉同義詞"
                u["resolved_term"] = official_term
    except Exception:
        pass

    return jsonify({"status": "success", "message": f"成功將「{user_keyword}」轉換為同義詞「{official_term}」！詞庫已即時更新。"}), 200

@bp.route("/api/admin/unmatched-queries/<int:query_id>/status", methods=["PUT"])
@admin_required
def update_unmatched_status(query_id):
    data = request.get_json() or {}
    new_status = data.get("status", "待處理").strip()
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
@bp.route("/api/admin/visitor-logs", methods=["GET"])
@admin_required
def list_visitor_logs():
    days = int(request.args.get("days", 30))
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
