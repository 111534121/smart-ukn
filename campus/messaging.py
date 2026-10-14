"""科上通知：老師選班級整班通知，或點開班級只通知個別學生；學生用班級密碼加入班級。
也提供家長留言給導師的管道 (advisor_messages)。
"""
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash

from .common import error, ok, require, store, next_id, now_str, current_user, all_students, find_student, STAFF_ROLES

bp = Blueprint("campus_messaging", __name__)

DEFAULT_CLASS_PASSWORD = "ukn2026"  # 示範用；老師可在「科上通知」重設


def classes():
    def seed():
        names = sorted({s["class_name"] for s in all_students() if s.get("class_name")})
        return [{"class_name": n, "password_hash": generate_password_hash(DEFAULT_CLASS_PASSWORD),
                 "members": sorted(s["student_id"] for s in all_students() if s.get("class_name") == n),
                 "created_by": "系統", "created_at": now_str()} for n in names]
    return store.section("classes", seed)


def notices():
    return store.section("notices", list)


def student_names():
    return {s["student_id"]: s["full_name"] for s in all_students()}


def my_class_names(student_id):
    return [c["class_name"] for c in classes() if student_id in c["members"]]


@bp.route("/api/campus/classes", methods=["GET"])
@require()
def list_classes():
    u = current_user()
    names = student_names()
    if u["role"] in STAFF_ROLES:
        return ok(data=[{"class_name": c["class_name"], "is_advised": c["class_name"] == u.get("advised_class"),
                         "members": [{"student_id": s, "full_name": names.get(s, s)} for s in c["members"]]}
                        for c in classes()])
    sid = u["student_id"]
    return ok(data=[{"class_name": c["class_name"], "member_count": len(c["members"]), "joined": sid in c["members"]}
                    for c in classes()])


@bp.route("/api/campus/classes", methods=["POST"])
@require(*STAFF_ROLES)
def create_class():
    data = request.get_json(silent=True) or {}
    name = str(data.get("class_name", "")).strip()[:30]
    password = str(data.get("password", "")).strip()
    if not name or len(password) < 4:
        return error("請輸入班級名稱與至少 4 碼的加入密碼")
    with store.lock:
        if any(c["class_name"] == name for c in classes()):
            return error("已有同名班級", 409)
        classes().append({"class_name": name, "password_hash": generate_password_hash(password), "members": [],
                          "created_by": current_user()["full_name"], "created_at": now_str()})
        store.save()
    return ok(message=f"已建立「{name}」，請把密碼告訴學生")


@bp.route("/api/campus/classes/password", methods=["POST"])
@require(*STAFF_ROLES)
def reset_password():
    u = current_user()
    data = request.get_json(silent=True) or {}
    password = str(data.get("password", "")).strip()
    if len(password) < 4:
        return error("密碼至少 4 碼")
    if u["role"] == "老師" and u.get("advised_class") != data.get("class_name"):
        return error("只能重設自己導師班的加入密碼", 403)
    with store.lock:
        target = next((c for c in classes() if c["class_name"] == data.get("class_name")), None)
        if not target:
            return error("找不到班級", 404)
        target["password_hash"] = generate_password_hash(password)
        store.save()
    return ok(message="已更新加入密碼")


@bp.route("/api/campus/classes/join", methods=["POST"])
@require("學生")
def join_class():
    data = request.get_json(silent=True) or {}
    sid = current_user()["student_id"]
    with store.lock:
        target = next((c for c in classes() if c["class_name"] == data.get("class_name")), None)
        if not target:
            return error("找不到班級", 404)
        if not check_password_hash(target["password_hash"], str(data.get("password", ""))):
            return error("密碼錯誤，請向老師確認", 403)
        if sid not in target["members"]:
            target["members"].append(sid)
            store.save()
    return ok(message=f"已加入「{target['class_name']}」，之後會收到這個班級的通知")


@bp.route("/api/campus/classes/leave", methods=["POST"])
@require("學生")
def leave_class():
    data = request.get_json(silent=True) or {}
    sid = current_user()["student_id"]
    with store.lock:
        target = next((c for c in classes() if c["class_name"] == data.get("class_name")), None)
        if target and sid in target["members"]:
            target["members"].remove(sid)
            store.save()
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
    target = next((c for c in classes() if c["class_name"] == class_name), None)
    if not target:
        return error("請選擇班級", 404)
    if u["role"] == "老師" and u.get("advised_class") != class_name:
        return error("只能通知自己的導師班", 403)
    recipients = data.get("recipients") or "all"
    if recipients == "all":
        recipient_ids = list(target["members"])
    else:
        recipient_ids = [s for s in recipients if s in target["members"]]
    if not recipient_ids:
        return error("這個班級沒有可以通知的學生")
    with store.lock:
        items = notices()
        item = {"id": next_id(items), "class_name": class_name, "whole_class": recipients == "all",
                "recipients": recipient_ids, "read_by": [], "title": title, "content": content,
                "priority": priority, "sender": u["full_name"], "sender_username": u["username"],
                "due_date": str(data.get("due_date", "") or "")[:10], "created_at": now_str()}
        items.append(item)
        store.save()
    who = "整班" if item["whole_class"] else f"{len(recipient_ids)} 位學生"
    return ok(message=f"已通知 {class_name} {who}", data=item)


@bp.route("/api/campus/notices/sent", methods=["GET"])
@require(*STAFF_ROLES)
def sent():
    u = current_user()
    names = student_names()
    items = [n for n in notices() if n["sender_username"] == u["username"] or u["role"] == "管理員"]
    result = [{**n, "read_count": len(n["read_by"]), "total": len(n["recipients"]),
               "unread_names": [names.get(s, s) for s in n["recipients"] if s not in n["read_by"]]}
              for n in sorted(items, key=lambda x: x["created_at"], reverse=True)]
    return ok(data=result)


@bp.route("/api/campus/notices/inbox", methods=["GET"])
@require("學生", "家長")
def inbox():
    sid = current_user()["student_id"]
    items = [{k: v for k, v in n.items() if k not in ("recipients", "read_by", "sender_username")}
             | {"is_read": sid in n["read_by"]}
             for n in notices() if sid in n["recipients"]]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ok(data=items, unread_count=sum(1 for i in items if not i["is_read"]))


@bp.route("/api/campus/notices/<int:notice_id>/read", methods=["POST"])
@require("學生")
def mark_read(notice_id):
    sid = current_user()["student_id"]
    with store.lock:
        n = next((n for n in notices() if n["id"] == notice_id), None)
        if not n or sid not in n["recipients"]:
            return error("找不到通知", 404)
        if sid not in n["read_by"]:
            n["read_by"].append(sid)
            store.save()
    return ok()


# ---------- 家長留言給導師 ----------

def advisor_messages():
    return store.section("advisor_messages", list)


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
        with store.lock:
            items = advisor_messages()
            item = {"id": next_id(items), "student_id": u["student_id"], "student_name": stu.get("full_name", ""),
                    "class_name": class_name, "parent_username": u["username"], "parent_name": u["full_name"],
                    "subject": subject, "content": content, "status": "待回覆", "reply": "", "replied_by": "",
                    "replied_at": "", "created_at": now_str()}
            items.append(item)
            store.save()
        return ok(message="已送出，導師確認後會回覆", data=item)

    # GET：家長只看自己留言；老師只看自己導師班；教職員/管理員看全部
    if u["role"] == "家長":
        items = [m for m in advisor_messages() if m["student_id"] == u["student_id"]]
    elif u["role"] == "老師":
        items = [m for m in advisor_messages() if m["class_name"] == u.get("advised_class")]
    elif u["role"] in ("教職員", "管理員"):
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
        m["reply"] = reply
        m["replied_by"] = u["full_name"]
        m["replied_at"] = now_str()
        m["status"] = "已回覆"
        store.save()
    return ok(message="已回覆", data=m)
