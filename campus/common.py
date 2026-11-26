"""campus 各模組共用：JSON 資料儲存、app.py 注入的相依物件、權限檢查。

新功能 (科上通知、證照、租借、報表…) 的資料存於 data/campus_store.json，
不需要先建 MySQL 資料表就能運作；正式上線時可逐一改寫為資料表。
"""
import json
import os
import threading
import time
from datetime import datetime
from functools import wraps
from types import SimpleNamespace

from flask import jsonify, session
from access_policy import role_allowed

DATA_DIR = os.getenv("CAMPUS_DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"))

# 由 app.py 呼叫 campus.init_app() 時填入 (課程、學生、校曆等既有資料與函式)
deps = SimpleNamespace()


class JsonStore:
    """執行緒安全的 JSON 檔案儲存。用法：
        with store.lock:
            items = store.section("notices", list)
            items.append(...)
            store.save()
    """

    def __init__(self, path):
        self.path = path
        self.lock = threading.RLock()
        self.data = self._load()

    def _load(self):
        try:
            with open(self.path, encoding="utf-8") as f:
                return json.load(f)
        except (OSError, ValueError):
            return {}

    def section(self, key, default_factory):
        with self.lock:
            if key not in self.data:
                self.data[key] = default_factory()
                self.save()
            return self.data[key]

    def save(self):
        with self.lock:
            os.makedirs(os.path.dirname(self.path), exist_ok=True)
            tmp = self.path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=1)
            # Windows 防毒或索引服務可能短暫鎖住目標檔；仍保留原子替換。
            for attempt in range(6):
                try:
                    os.replace(tmp, self.path)
                    break
                except PermissionError:
                    if attempt == 5:
                        raise
                    time.sleep(0.02 * (2 ** attempt))


store = JsonStore(os.path.join(DATA_DIR, "campus_store.json"))


def next_id(items, key="id"):
    return max((i[key] for i in items), default=0) + 1


def now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def ok(**payload):
    return jsonify({"status": "success", **payload}), 200


def current_user():
    """目前登入者；未登入回傳 None"""
    if "username" not in session:
        return None
    return {
        "user_id": session.get("user_id"),
        "username": session.get("username"),
        "role": session.get("role"),
        "full_name": session.get("full_name"),
        "student_id": session.get("student_id"),
        "class_name": session.get("class_name", ""),
        "advised_class": session.get("advised_class"),
        "can_manage_dorm": bool(session.get("can_manage_dorm")),
        "dept_id": session.get("dept_id"),
    }


def user_key():
    """個人資料的儲存鍵：學生用學號，其他身分用帳號"""
    u = current_user()
    if not u:
        return None
    return u["student_id"] if u["role"] == "學生" and u["student_id"] else f"user:{u['username']}"


def require(*roles):
    """需登入；有指定 roles 時只限這些身分"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            u = current_user()
            if not u:
                return error("請先登入系統", 401)
            if (not roles and u["role"] in ("訪客", "內容管理員", "系統管理員")) or (roles and not role_allowed(roles)):
                return error("權限不足，僅限特定身分使用", 403)
            return f(*args, **kwargs)
        wrapper.access_roles = roles
        return wrapper
    return decorator


STAFF_ROLES = ("老師", "教職員", "處室承辦", "科助", "住宿管理員", "管理員")


def find_student(student_id):
    rows = deps.fetch_db_rows(
        "SELECT s.student_id, s.full_name, s.class_name, s.admission_year, s.dept_id FROM students s WHERE s.student_id = %s",
        (student_id,))
    if rows:
        return rows[0]
    return next((s for s in deps.students if s["student_id"] == student_id), None)


def all_students():
    rows = deps.fetch_db_rows("SELECT student_id, full_name, class_name, admission_year, dept_id FROM students ORDER BY student_id")
    return rows if rows else list(deps.students)
