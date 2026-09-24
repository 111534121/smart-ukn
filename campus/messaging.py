"""科上通知：老師選班級整班通知，或點開班級只通知個別學生；學生用班級密碼加入班級。"""
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash

from .common import error, ok, require, store, next_id, now_str, current_user, all_students, STAFF_ROLES

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
    data = request.get_json(silent=True) or {}
    password = str(data.get("password", "")).strip()
    if len(password) < 4:
        return error("密碼至少 4 碼")
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
@require("學生")
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
