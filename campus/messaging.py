"""科上通知：老師選班級整班通知，或點開班級只通知個別學生；學生用班級密碼加入班級。

管理範圍 (can_manage)：
- 班導 (老師)：只能管理自己的導師班 (users.advised_class) 與自己建立的班級 / 群組
- 行政人員 (教職員)、管理員：全校任何班級

廣播 (T09 班級／課程廣播)：
- 班導 (老師)：課程廣播 → 課表 (class_schedule.teacher) 上自己教的課，修這門課的學生都會收到
- 教職員 (行政人員)、管理員：任何課程、整個科系、某一年級 (入學年)、全校
- 廣播一樣存在 class_notices，class_name 為 NULL，target_type / target_label 記錄對象

資料存放：
- MySQL 已建立 class_groups 等 4 張表 (執行 init_db.py) → 存在 MySQL，組員共用同一份資料
    class_groups             班級 / 群組、加入密碼 (雜湊)、建立者
    class_group_members      誰加入了哪個班
    class_notices            通知內容、緊急程度、發送者、期限
    class_notice_recipients  每則通知發給誰、什麼時候讀的 (read_at)
- MySQL 連不上或還沒建表 → 退回 data/campus_store.json (示範模式)
- 第一次連上 MySQL 且表是空的：自動把 campus_store.json 裡原有的班級與通知搬進 MySQL

家長留言給導師 (advisor_messages)：家長留言給子女的導師，導師回覆。
"""
from datetime import date, datetime, timedelta, timezone
import threading
import time
from collections import deque
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash

from .common import deps, error, ok, require, store, next_id, now_str, current_user, all_students, find_student, STAFF_ROLES

bp = Blueprint("campus_messaging", __name__)

DEFAULT_CLASS_PASSWORD = "ukn2026"  # 示範用；老師可在「科上通知」重設

# 加入班級防呆：密碼最短只要 4 碼，沒有這層限制的話幾秒鐘就能暴力試完，
# 所以同一個學生 10 分鐘內最多試 10 次 (路由本身已要求登入，用 student_id 當 key)
JOIN_CLASS_RATE_LIMIT, JOIN_CLASS_RATE_WINDOW_SECONDS = 10, 600
_join_class_rate_lock = threading.Lock()
_join_class_attempts = {}

def _join_class_too_many(sid):
    now = time.monotonic()
    with _join_class_rate_lock:
        recent = _join_class_attempts.setdefault(sid, deque())
        while recent and now - recent[0] > JOIN_CLASS_RATE_WINDOW_SECONDS:
            recent.popleft()
        if len(recent) >= JOIN_CLASS_RATE_LIMIT:
            return True
        recent.append(now)
        return False
NOT_YOUR_CLASS = "只能管理自己的導師班或自己建立的班級"


def student_names():
    return {s["student_id"]: s["full_name"] for s in all_students()}


def seed_classes():
    """還沒有任何班級時，依學籍資料的班級自動建立 (成員 = 該班學生)"""
    names = sorted({s["class_name"] for s in all_students() if s.get("class_name")})
    return [{"class_name": n, "password_hash": generate_password_hash(DEFAULT_CLASS_PASSWORD),
             "members": sorted(s["student_id"] for s in all_students() if s.get("class_name") == n),
             "created_by": "系統", "created_by_username": None, "created_at": now_str()} for n in names]


def _fmt_time(value):
    if value is None:
        return ""
    return value.strftime("%Y-%m-%d %H:%M:%S") if hasattr(value, "strftime") else str(value)[:19]


# =====================================================================
# 資料存取層：下面的 route 只呼叫這些函式，不需要知道資料存在 MySQL 還是 JSON
# =====================================================================

def use_db():
    """MySQL 可用且已建立 class_groups 表時回傳 True；第一次使用時把 JSON 舊資料搬進來"""
    rows = deps.fetch_db_rows("SELECT COUNT(*) AS n FROM class_groups")
    if rows is None:
        return False
    if rows[0]["n"] == 0:
        _import_into_db()
    return True


def _import_into_db():
    """MySQL 的表是空的：把 campus_store.json 裡的班級與通知搬進去，學籍上其他班級也自動建立"""
    existing = {r["student_id"] for r in (deps.fetch_db_rows("SELECT student_id FROM students") or [])}
    json_classes = list(store.data.get("classes") or [])
    known = {c["class_name"] for c in json_classes}
    json_classes += [c for c in seed_classes() if c["class_name"] not in known]  # 學籍上有、JSON 裡沒有的班級也補建
    for c in json_classes:
        deps.db_execute(
            "INSERT IGNORE INTO class_groups (class_name, password_hash, created_by, created_by_username) VALUES (%s, %s, %s, %s)",
            (c["class_name"], c["password_hash"], c.get("created_by") or "系統", c.get("created_by_username")))
        for sid in c["members"]:
            if sid in existing:  # 只搬資料庫裡真的有的學生 (外鍵限制)
                deps.db_execute("INSERT IGNORE INTO class_group_members (class_name, student_id) VALUES (%s, %s)",
                                (c["class_name"], sid))
    for n in store.data.get("notices") or []:
        res = deps.db_execute(
            "INSERT INTO class_notices (class_name, target_type, target_label, whole_class, title, content, priority, sender, sender_username, due_date, created_at, reply_required) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (n.get("class_name"), n.get("target_type") or "班級", n.get("target_label"), 1 if n.get("whole_class") else 0,
             n["title"], n["content"], n.get("priority") or "一般",
             n.get("sender") or "", n.get("sender_username"), n.get("due_date") or None, n.get("created_at") or now_str(), int(n.get("reply_required", False))))
        for sid in n["recipients"]:
            if sid in existing:
                deps.db_execute(
                    "INSERT IGNORE INTO class_notice_recipients (notice_id, student_id, read_at, reply, reply_at) VALUES (%s, %s, %s, %s, %s)",
                    (res["lastrowid"], sid, now_str() if sid in n.get("read_by", []) else None,
                     n.get("replies", {}).get(sid, {}).get("reply"), n.get("replies", {}).get(sid, {}).get("reply_at")))


def all_classes():
    """[{class_name, password_hash, members: [學號...], created_by, created_by_username}]"""
    if use_db():
        groups = deps.fetch_db_rows("SELECT * FROM class_groups ORDER BY class_name") or []
        members = deps.fetch_db_rows("SELECT class_name, student_id FROM class_group_members ORDER BY student_id") or []
        return [{**g, "created_at": _fmt_time(g.get("created_at")),
                 "members": [m["student_id"] for m in members if m["class_name"] == g["class_name"]]} for g in groups]
    return store.section("classes", seed_classes)


def find_class(name):
    return next((c for c in all_classes() if c["class_name"] == name), None)


def roster_ids(class_name):
    """學籍上就是這一班的學生 (不用自己輸入密碼加入)"""
    return {s["student_id"] for s in all_students() if s.get("class_name") == class_name}


def member_ids(cls):
    """班級成員 = 學籍上的同班同學 + 用密碼加入的學生 (自建群組只有後者)"""
    return sorted(set(cls["members"]) | roster_ids(cls["class_name"]))


def add_class(name, password_hash, user):
    if use_db():
        deps.db_execute(
            "INSERT INTO class_groups (class_name, password_hash, created_by, created_by_username) VALUES (%s, %s, %s, %s)",
            (name, password_hash, user["full_name"], user["username"]))
        return
    with store.lock:
        all_classes().append({"class_name": name, "password_hash": password_hash, "members": [],
                              "created_by": user["full_name"], "created_by_username": user["username"],
                              "created_at": now_str()})
        store.save()


def set_class_password(name, password_hash):
    if use_db():
        deps.db_execute("UPDATE class_groups SET password_hash = %s WHERE class_name = %s", (password_hash, name))
        return
    with store.lock:
        find_class(name)["password_hash"] = password_hash
        store.save()


def add_member(name, student_id):
    if use_db():
        deps.db_execute("INSERT IGNORE INTO class_group_members (class_name, student_id) VALUES (%s, %s)", (name, student_id))
        return
    with store.lock:
        target = find_class(name)
        if student_id not in target["members"]:
            target["members"].append(student_id)
            store.save()


def remove_member(name, student_id):
    if use_db():
        deps.db_execute("DELETE FROM class_group_members WHERE class_name = %s AND student_id = %s", (name, student_id))
        return
    with store.lock:
        target = find_class(name)
        if target and student_id in target["members"]:
            target["members"].remove(student_id)
            store.save()


def add_notice(item):
    """item 不含 id / created_at；回傳完整的通知 (含 id、created_at、read_by)
    班級通知：class_name = 班級；廣播：class_name = None，target_type / target_label 說明對象"""
    item = {"reply_required": False, "target_type": "班級", "target_label": item.get("class_name"), **item}
    created_at = now_str()
    if use_db():
        res = deps.db_execute(
            "INSERT INTO class_notices (class_name, target_type, target_label, whole_class, title, content, priority, sender, sender_username, due_date, created_at, reply_required) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (item["class_name"], item["target_type"], item["target_label"], 1 if item["whole_class"] else 0,
             item["title"], item["content"], item["priority"],
             item["sender"], item["sender_username"], item["due_date"] or None, created_at, int(item["reply_required"])))
        for sid in item["recipients"]:
            deps.db_execute("INSERT INTO class_notice_recipients (notice_id, student_id) VALUES (%s, %s)", (res["lastrowid"], sid))
        return {"id": res["lastrowid"], **item, "read_by": [], "created_at": created_at}
    with store.lock:
        items = store.section("notices", list)
        full = {"id": next_id(items), **item, "read_by": [], "created_at": created_at}
        items.append(full)
        store.save()
    return full


def load_notices(sender_username=None, student_id=None):
    """取得通知 (含 recipients、read_by)；可依發送者或收件學生篩選"""
    if use_db():
        where, params = [], []
        if sender_username:
            where.append("n.sender_username = %s")
            params.append(sender_username)
        if student_id:
            where.append("n.id IN (SELECT notice_id FROM class_notice_recipients WHERE student_id = %s)")
            params.append(student_id)
        rows = deps.fetch_db_rows(
            "SELECT n.* FROM class_notices n" + (" WHERE " + " AND ".join(where) if where else "") + " ORDER BY n.created_at DESC, n.id DESC",
            tuple(params)) or []
        if not rows:
            return []
        ids = [r["id"] for r in rows]
        recs = deps.fetch_db_rows(
            "SELECT notice_id, student_id, read_at, reply, reply_at FROM class_notice_recipients WHERE notice_id IN (%s)" % ",".join(["%s"] * len(ids)),
            tuple(ids)) or []
        return [{**r, **_target_fields(r), "whole_class": bool(r["whole_class"]), "due_date": str(r["due_date"] or "")[:10],
                 "created_at": _fmt_time(r["created_at"]),
                 "recipients": [x["student_id"] for x in recs if x["notice_id"] == r["id"]],
                 "read_by": [x["student_id"] for x in recs if x["notice_id"] == r["id"] and x["read_at"]],
                 "replies": {x["student_id"]: {"reply": x["reply"], "reply_at": _fmt_time(x["reply_at"])} for x in recs if x["notice_id"] == r["id"] and x["reply"]}} for r in rows]
    items = [{**n, **_target_fields(n)} for n in store.section("notices", list)
             if (not sender_username or n["sender_username"] == sender_username)
             and (not student_id or student_id in n["recipients"])]
    return sorted(items, key=lambda x: x["created_at"], reverse=True)


def _target_fields(n):
    """舊通知沒有 target_type / target_label：視為班級通知，對象就是班級名稱"""
    return {"target_type": n.get("target_type") or "班級", "target_label": n.get("target_label") or n.get("class_name") or ""}


def mark_notice_read(notice_id, student_id):
    """標記已讀；這則通知不是發給這位學生時回傳 False"""
    if use_db():
        rows = deps.fetch_db_rows(
            "SELECT read_at FROM class_notice_recipients WHERE notice_id = %s AND student_id = %s", (notice_id, student_id))
        if not rows:
            return False
        if rows[0]["read_at"] is None:
            deps.db_execute(
                "UPDATE class_notice_recipients SET read_at = CURRENT_TIMESTAMP WHERE notice_id = %s AND student_id = %s",
                (notice_id, student_id))
        return True
    with store.lock:
        n = next((n for n in store.section("notices", list) if n["id"] == notice_id), None)
        if not n or student_id not in n["recipients"]:
            return False
        if student_id not in n["read_by"]:
            n["read_by"].append(student_id)
            store.save()
    return True


# =====================================================================
# 權限
# =====================================================================

def can_manage(user, cls):
    """這位老師 / 行政人員能不能管理這個班級 (看名單、發通知、改密碼)"""
    if user["role"] in ("教職員", "管理員", "系統管理員"):
        return True
    if user["role"] == "老師":
        return cls["class_name"] == user.get("advised_class") or cls.get("created_by_username") == user["username"]
    return False


def my_class_names(student_id):
    return [c["class_name"] for c in all_classes() if student_id in member_ids(c)]


# =====================================================================
# API
# =====================================================================

@bp.route("/api/campus/classes", methods=["GET"])
@require()
def list_classes():
    u = current_user()
    names = student_names()
    classes = all_classes()
    if u["role"] in STAFF_ROLES:
        return ok(data=[{"class_name": c["class_name"], "is_advised": c["class_name"] == u.get("advised_class"),
                         "members": [{"student_id": s, "full_name": names.get(s, s)} for s in member_ids(c)]}
                        for c in classes if can_manage(u, c)])
    sid = u["student_id"]
    return ok(data=[{"class_name": c["class_name"], "member_count": len(member_ids(c)), "joined": sid in member_ids(c),
                     "is_own_class": sid in roster_ids(c["class_name"])}  # 學籍上的班級：不用加入、也不能退出
                    for c in classes])


@bp.route("/api/campus/classes", methods=["POST"])
@require(*STAFF_ROLES)
def create_class():
    data = request.get_json(silent=True) or {}
    name = str(data.get("class_name", "")).strip()[:30]
    password = str(data.get("password", "")).strip()
    if not name or len(password) < 4:
        return error("請輸入班級名稱與至少 4 碼的加入密碼")
    if find_class(name):
        return error("已有同名班級", 409)
    u = current_user()
    add_class(name, generate_password_hash(password), u)
    deps.write_audit_log("classes", name, "新增", after={"class_name": name, "created_by": u["full_name"]})
    return ok(message=f"已建立「{name}」，請把密碼告訴學生")


@bp.route("/api/campus/classes/password", methods=["POST"])
@require(*STAFF_ROLES)
def reset_password():
    u = current_user()
    data = request.get_json(silent=True) or {}
    password = str(data.get("password", "")).strip()
    if len(password) < 4:
        return error("密碼至少 4 碼")
    target = find_class(data.get("class_name"))
    if not target:
        return error("找不到班級", 404)
    if not can_manage(current_user(), target):
        return error(NOT_YOUR_CLASS, 403)
    set_class_password(target["class_name"], generate_password_hash(password))
    # 密碼本身不寫進紀錄，只記「有人重設過」
    deps.write_audit_log("classes", target["class_name"], "修改",
                         before={"class_name": target["class_name"], "password": "（舊密碼）"},
                         after={"class_name": target["class_name"], "password": "（已重設）"})
    return ok(message="已更新加入密碼")


@bp.route("/api/campus/classes/join", methods=["POST"])
@require("學生")
def join_class():
    data = request.get_json(silent=True) or {}
    sid = current_user()["student_id"]
    if _join_class_too_many(sid):
        return error("嘗試次數過多，請 10 分鐘後再試", 429)
    target = find_class(data.get("class_name"))
    if not target:
        return error("找不到班級", 404)
    pwd_in = str(data.get("password", ""))
    pwd_match = (target["password_hash"] == pwd_in)
    if not pwd_match:
        try:
            pwd_match = check_password_hash(target["password_hash"], pwd_in)
        except Exception:
            pwd_match = False
    if not pwd_match:
        return error("密碼錯誤，請向老師確認", 403)
    add_member(target["class_name"], sid)
    return ok(message=f"已加入「{target['class_name']}」，之後會收到這個班級的通知")


@bp.route("/api/campus/classes/leave", methods=["POST"])
@require("學生")
def leave_class():
    data = request.get_json(silent=True) or {}
    remove_member(data.get("class_name"), current_user()["student_id"])
    return ok(message="已退出班級")


@bp.route("/api/campus/notices", methods=["POST"])
@require(*STAFF_ROLES)
def send_notice():
    u = current_user()
    data = request.get_json(silent=True) or {}
    class_name = data.get("class_name")
    title = str(data.get("title", "")).strip()[:80]
    content = str(data.get("content", "")).strip()[:2000]
    priority = data.get("priority") if data.get("priority") in ("一般", "重要", "緊急") else "一般"
    if not title or not content:
        return error("請輸入通知標題與內容")
    due_date = str(data.get("due_date") or "").strip()
    if due_date:
        try:
            if date.fromisoformat(due_date).isoformat() != due_date:
                raise ValueError()
        except ValueError:
            return error("期限格式須為 YYYY-MM-DD")
    target = find_class(class_name)
    if not target:
        return error("請選擇班級", 404)
    if not can_manage(u, target):
        return error(NOT_YOUR_CLASS, 403)
    recipients = data.get("recipients") or "all"
    members = member_ids(target)
    if recipients == "all":
        recipient_ids = members
    else:
        if not isinstance(recipients, list) or any(not isinstance(s, str) for s in recipients):
            return error("收件人須為學號清單")
        recipient_ids = list(dict.fromkeys(s for s in recipients if s in members))
    if not recipient_ids:
        return error("這個班級沒有可以通知的學生")
    item = add_notice({"class_name": class_name, "whole_class": recipients == "all", "recipients": recipient_ids,
                       "title": title, "content": content, "priority": priority, "sender": u["full_name"],
                       "sender_username": u["username"], "due_date": due_date, "reply_required": data.get("reply_required") is True})
    deps.write_audit_log("notices", item["id"], "新增", after={k: item[k] for k in (
        "class_name", "title", "priority", "whole_class", "recipients", "due_date", "content")})
    who = "整班" if item["whole_class"] else f"{len(recipient_ids)} 位學生"
    return ok(message=f"已通知 {class_name} {who}", data=item)


@bp.route("/api/campus/notices/sent", methods=["GET"])
@require(*STAFF_ROLES)
def sent():
    u = current_user()
    names = student_names()
    items = load_notices(sender_username=None if u["role"] in ("管理員", "系統管理員") else u["username"])
    result = [{**n, "read_count": len(n["read_by"]), "total": len(n["recipients"]),
               "unread_names": [names.get(s, s) for s in n["recipients"] if s not in n["read_by"]],
               "reply_count": len(n.get("replies", {})),
               "pending_reply_names": [names.get(s, s) for s in n["recipients"] if s not in n.get("replies", {})],
               "reply_details": [{"student_id": sid, "full_name": names.get(sid, sid), **reply} for sid, reply in n.get("replies", {}).items()]}
              for n in items]
    return ok(data=result)


@bp.route("/api/campus/notices/inbox", methods=["GET"])
@require("學生", "家長")
def inbox():
    sid = current_user()["student_id"]
    items = [{k: v for k, v in n.items() if k not in ("recipients", "read_by", "sender_username", "replies")}
             | {"is_read": sid in n["read_by"], "my_reply": n.get("replies", {}).get(sid)}
             for n in load_notices(student_id=sid)]
    return ok(data=items, unread_count=sum(1 for i in items if not i["is_read"]))


@bp.route("/api/campus/notices/<int:notice_id>/read", methods=["POST"])
@require("學生")
def mark_read(notice_id):
    if not mark_notice_read(notice_id, current_user()["student_id"]):
        return error("找不到通知", 404)
    return ok()


# =====================================================================
# 廣播 (T09)：班導 → 自己教的課程；教職員 (行政人員)、管理員 → 任何課程、科系、年級、全校
# =====================================================================

SCHOOL_WIDE_ROLES = ("教職員", "管理員")
BROADCAST_TYPES = ("課程", "科系", "年級", "全校")
NOT_COURSES = ("導師時間", "週會", "社團", "自習")  # 課表上不是一門課的時段，不列入課程廣播


def _plain_name(full_name):
    """「彭賓鈺 老師」→「彭賓鈺」，用來對課表的 teacher 欄位"""
    return (full_name or "").replace("老師", "").strip()


def load_schedule():
    rows = deps.fetch_db_rows("SELECT class_name, student_id, course_name, teacher FROM class_schedule")
    return rows if rows else list(getattr(deps, "class_schedule", []) or [])


def course_table(teacher=None):
    """{課程名稱: {"classes": {班級...}, "students": {個別修課學號...}, "teachers": {...}}}
    teacher 有值時只列這位老師教的課；導師時間、週會、社團、自習不算課程 (導師班用班級通知)"""
    courses = {}
    for r in load_schedule():
        course = r.get("course_name") or ""
        if not course or any(w in course for w in NOT_COURSES) or (teacher and r.get("teacher") != teacher):
            continue
        c = courses.setdefault(course, {"classes": set(), "students": set(), "teachers": set()})
        if r.get("class_name"):
            c["classes"].add(r["class_name"])
        if r.get("student_id"):
            c["students"].add(r["student_id"])
        if r.get("teacher"):
            c["teachers"].add(r["teacher"])
    return courses


def visible_courses(user):
    """這個人可以廣播的課程：教職員 / 管理員 = 全部；老師 = 課表上自己教的"""
    if user["role"] in SCHOOL_WIDE_ROLES:
        return course_table()
    if user["role"] == "老師":
        name = _plain_name(user["full_name"])
        return course_table(name) if name else {}
    return {}


def course_recipients(info):
    """修這門課的學生 = 開課班級的成員 + 課表上個別修課 (重補修) 的學生"""
    ids = set(info["students"])
    for name in info["classes"]:
        cls = find_class(name)
        ids.update(member_ids(cls) if cls else roster_ids(name))
    return sorted(ids)


def department_names():
    rows = deps.fetch_db_rows("SELECT dept_id, dept_name FROM departments")
    rows = rows if rows else list(getattr(deps, "departments", []) or [])
    return {r["dept_id"]: r["dept_name"] for r in rows}


def resolve_target(user, target_type, target):
    """回傳 (對象說明, 收件學號清單)；沒有權限回傳 (None, None)；找不到對象回傳 (說明, [])"""
    target = str(target or "").strip()
    students = all_students()
    if target_type == "課程":
        info = visible_courses(user).get(target)
        if info is None:
            return None, None
        classes = "、".join(sorted(info["classes"]))
        return (f"{target}（{classes}）" if classes else target), course_recipients(info)
    if user["role"] not in SCHOOL_WIDE_ROLES:
        return None, None
    if target_type == "全校":
        return "全校", sorted(s["student_id"] for s in students)
    if target_type == "科系":
        label = department_names().get(target, target)
        return label, sorted(s["student_id"] for s in students if s.get("dept_id") == target)
    if target_type == "年級":
        return f"{target} 學年入學", sorted(s["student_id"] for s in students if str(s.get("admission_year")) == target)
    return None, None


@bp.route("/api/campus/broadcast/targets", methods=["GET"])
@require(*STAFF_ROLES)
def broadcast_targets():
    """發送介面用：這個人可以廣播的對象與人數"""
    u = current_user()
    courses = [{"course_name": name, "classes": sorted(info["classes"]), "teachers": sorted(info["teachers"]),
                "count": len(course_recipients(info))}
               for name, info in sorted(visible_courses(u).items())]
    data = {"courses": courses, "departments": [], "grades": [], "school": None}
    if u["role"] in SCHOOL_WIDE_ROLES:
        students = all_students()
        names = department_names()
        dept_ids = sorted({s.get("dept_id") for s in students if s.get("dept_id")})
        years = sorted({str(s.get("admission_year")) for s in students if s.get("admission_year")}, reverse=True)
        data["departments"] = [{"dept_id": d, "dept_name": names.get(d, d),
                                "count": sum(1 for s in students if s.get("dept_id") == d)} for d in dept_ids]
        data["grades"] = [{"year": y, "label": f"{y} 學年入學",
                           "count": sum(1 for s in students if str(s.get("admission_year")) == y)} for y in years]
        data["school"] = len(students)
    return ok(data=data)


@bp.route("/api/campus/broadcast", methods=["POST"])
@require(*STAFF_ROLES)
def send_broadcast():
    u = current_user()
    data = request.get_json(silent=True) or {}
    target_type = data.get("target_type")
    title = str(data.get("title", "")).strip()[:80]
    content = str(data.get("content", "")).strip()[:2000]
    priority = data.get("priority") if data.get("priority") in ("一般", "重要", "緊急") else "一般"
    if target_type not in BROADCAST_TYPES:
        return error("請選擇廣播對象 (課程、科系、年級或全校)")
    if not title or not content:
        return error("請輸入通知標題與內容")
    due_date = str(data.get("due_date") or "").strip()
    if due_date:
        try:
            if date.fromisoformat(due_date).isoformat() != due_date:
                raise ValueError()
        except ValueError:
            return error("期限格式須為 YYYY-MM-DD")
    label, recipient_ids = resolve_target(u, target_type, data.get("target"))
    if recipient_ids is None:
        return error("班導只能廣播給自己任教的課程；科系、年級、全校廣播限教職員", 403)
    if not recipient_ids:
        return error("這個對象目前沒有學生可以通知")
    item = add_notice({"class_name": None, "target_type": target_type, "target_label": label[:100],
                       "whole_class": True, "recipients": recipient_ids,
                       "title": title, "content": content, "priority": priority, "sender": u["full_name"],
                       "sender_username": u["username"], "due_date": due_date, "reply_required": data.get("reply_required") is True})
    deps.write_audit_log("notices", item["id"], "新增", after={k: item[k] for k in (
        "target_type", "target_label", "title", "priority", "recipients", "due_date", "content")})
    return ok(message=f"已廣播給「{label}」{len(recipient_ids)} 位學生", data=item)
# ---------- 家長留言給導師 ----------

def advisor_messages():
    if use_db():
        rows = deps.fetch_db_rows("SELECT * FROM advisor_messages ORDER BY created_at DESC, id DESC") or []
        return [{**r, "created_at": _fmt_time(r.get("created_at")), "replied_at": _fmt_time(r.get("replied_at")) or None}
                for r in rows]
    return store.section("advisor_messages", list)


def add_advisor_message(item):
    """item 不含 id/status/reply/replied_by/replied_at/created_at；回傳完整的留言"""
    created_at = now_str()
    full = {**item, "status": "待回覆", "reply": None, "replied_by": None, "replied_at": None, "created_at": created_at}
    if use_db():
        res = deps.db_execute(
            "INSERT INTO advisor_messages (student_id, student_name, class_name, parent_username, parent_name, "
            "subject, content, status, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (item["student_id"], item["student_name"], item["class_name"], item["parent_username"],
             item["parent_name"], item["subject"], item["content"], "待回覆", created_at))
        return {"id": res["lastrowid"], **full}
    with store.lock:
        items = store.section("advisor_messages", list)
        saved = {"id": next_id(items), **full}
        items.append(saved)
        store.save()
        return saved


def reply_to_advisor_message(msg_id, reply, replied_by):
    """回傳更新後的留言，找不到回傳 None (呼叫時要已經持有 store.lock)"""
    replied_at = now_str()
    if use_db():
        result = deps.db_execute(
            "UPDATE advisor_messages SET reply = %s, replied_by = %s, replied_at = %s, status = %s WHERE id = %s",
            (reply, replied_by, replied_at, "已回覆", msg_id))
        if result is None or result["rowcount"] == 0:
            return None
        return next((m for m in advisor_messages() if m["id"] == msg_id), None)
    items = store.section("advisor_messages", list)
    m = next((m for m in items if m["id"] == msg_id), None)
    if not m:
        return None
    m.update(reply=reply, replied_by=replied_by, replied_at=replied_at, status="已回覆")
    store.save()
    return m


@bp.route("/api/campus/advisor-messages", methods=["GET", "POST"])
@require()
def advisor_messages_route():
    u = current_user()

    if request.method == "POST":
        if u["role"] != "家長":
            return error("只有家長可以留言給導師", 403)
        data = request.get_json(silent=True) or {}
        subject = str(data.get("subject", "")).strip()[:60]
        content = str(data.get("content", "")).strip()[:1000]
        if not subject or not content:
            return error("請輸入主旨與內容")
        stu = find_student(u["student_id"]) or {}
        class_name = stu.get("class_name")
        if not class_name:
            return error("查無子女班級資料，請洽教務處")
        item = add_advisor_message({"student_id": u["student_id"], "student_name": stu.get("full_name", ""),
                                     "class_name": class_name, "parent_username": u["username"],
                                     "parent_name": u["full_name"], "subject": subject, "content": content})
        return ok(message="已送出，導師確認後會回覆", data=item)

    # GET：家長只看自己留言；老師只看自己導師班；教職員/管理員看全部
    if u["role"] == "家長":
        items = [m for m in advisor_messages() if m["student_id"] == u["student_id"]]
    elif u["role"] == "老師":
        items = [m for m in advisor_messages() if m["class_name"] == u.get("advised_class")]
    elif u["role"] in ("教職員", "管理員", "系統管理員"):
        items = list(advisor_messages())
    else:
        return error("沒有權限", 403)
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ok(data=items)


@bp.route("/api/campus/advisor-messages/<int:msg_id>/reply", methods=["POST"])
@require("老師", "教職員", "管理員")
def reply_advisor_message(msg_id):
    u = current_user()
    data = request.get_json(silent=True) or {}
    reply = str(data.get("reply", "")).strip()[:1000]
    if not reply:
        return error("請輸入回覆內容")
    with store.lock:
        m = next((m for m in advisor_messages() if m["id"] == msg_id), None)
        if not m:
            return error("找不到這則留言", 404)
        if u["role"] == "老師" and m["class_name"] != u.get("advised_class"):
            return error("只能回覆自己導師班的留言", 403)
        m = reply_to_advisor_message(msg_id, reply, u["full_name"])
    return ok(message="已回覆", data=m)


REPLY_OPTIONS = ("收到", "會參加", "無法參加", "需要協助")


@bp.route("/api/campus/notices/<int:notice_id>/reply", methods=["POST"])
@require("學生")
def reply_notice(notice_id):
    sid = current_user()["student_id"]
    notice = next((n for n in load_notices(student_id=sid) if n["id"] == notice_id), None)
    if not notice:
        return error("找不到通知", 404)
    if not notice.get("reply_required"):
        return error("這則通知不需要回條")
    if notice.get("due_date") and notice["due_date"] < datetime.now(timezone(timedelta(hours=8))).date().isoformat():
        return error("回條已截止", 409)
    reply = (request.get_json(silent=True) or {}).get("reply")
    if reply not in REPLY_OPTIONS:
        return error("請選擇有效的回覆")
    if use_db():
        deps.db_execute("UPDATE class_notice_recipients SET reply = %s, reply_at = CURRENT_TIMESTAMP, read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE notice_id = %s AND student_id = %s", (reply, notice_id, sid))
    else:
        with store.lock:
            target = next(n for n in store.section("notices", list) if n["id"] == notice_id)
            target.setdefault("replies", {})[sid] = {"reply": reply, "reply_at": now_str()}
            if sid not in target["read_by"]:
                target["read_by"].append(sid)
            store.save()
    return ok(message="已送出回條")


@bp.route("/api/campus/notices/<int:notice_id>/remind", methods=["POST"])
@require(*STAFF_ROLES)
def remind_notice(notice_id):
    u = current_user()
    notice = next((n for n in load_notices(sender_username=None if u["role"] in ("管理員", "系統管理員") else u["username"]) if n["id"] == notice_id), None)
    if not notice:
        return error("找不到通知或無權提醒", 404)
    if not notice.get("reply_required"):
        return error("這則通知不需要回條")
    if notice.get("due_date") and notice["due_date"] < datetime.now(timezone(timedelta(hours=8))).date().isoformat():
        return error("回條已截止，無法再提醒", 409)
    pending = [sid for sid in notice["recipients"] if sid not in notice.get("replies", {})]
    if not pending:
        return ok(message="所有學生都已回覆", count=0)
    # Reminder points to the original response; it does not create a second receipt task.
    item = add_notice({"class_name": notice.get("class_name"), "target_type": notice.get("target_type"),
                       "target_label": notice.get("target_label"), "whole_class": False, "recipients": pending,
                       "title": ("回條提醒：" + notice["title"])[:80],
                       "content": f"請至班級通知回覆原通知「{notice['title']}」的回條。", "priority": "重要",
                       "sender": u["full_name"], "sender_username": u["username"], "due_date": notice.get("due_date", "")})
    deps.write_audit_log("notices", item["id"], "提醒", after={"original_notice_id": notice_id, "count": len(pending)})
    return ok(message=f"已提醒 {len(pending)} 位尚未回覆的學生", count=len(pending))
