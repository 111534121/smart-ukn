"""線上會議 (類似 Google Meet)：建立會議、邀請指定的人或整班、邀請碼加入，視訊用 Jitsi Meet。

- 學生、老師、教職員、管理員都可以開會議；學生只能邀請個人，老師可以邀請自己任教或導師班的班級，教職員 / 管理員可以邀請任何班級
- 每場會議有一組邀請碼，傳給別人輸入就能加入 (主持人可關閉)
- 受邀的人在通知中心會看到邀請 (前端讀 GET /api/campus/meetings 的 invited 項目)
- 視訊：預設在新分頁開 meet.jit.si 的會議室 (公開伺服器嵌在其他網站只能用 5 分鐘，主持人也要登入)；
  學校架了自己的 Jitsi 伺服器時設定 JITSI_DOMAIN=網域、JITSI_EMBED=1，就會直接嵌在網站裡
- 會議室名稱是隨機字串，只有會議成員從這裡拿得到連結
"""
import os
import re
import secrets
from datetime import datetime, timedelta

from flask import Blueprint, request

from . import meetings_store as db
from .common import deps, error, ok, require, current_user, user_key, now_str, all_students, STAFF_ROLES
from .messaging import _plain_name, load_schedule, find_class, member_ids, roster_ids

bp = Blueprint("campus_meetings", __name__)

CREATOR_ROLES = ("學生", "老師", "教職員", "管理員")
CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 去掉容易看錯的 0/O、1/I
MAX_INVITEES = 300
EARLY_JOIN_MINUTES = 15  # 開始前幾分鐘可以進會議室


def jitsi_config():
    return {"domain": os.getenv("JITSI_DOMAIN", "meet.jit.si"), "embed": os.getenv("JITSI_EMBED") == "1"}


def _people():
    """{成員代碼: {name, desc}}：學生用學號、其他身分用 user:帳號"""
    people = {s["student_id"]: {"name": s["full_name"], "desc": f"{s.get('class_name') or ''} {s['student_id']}".strip()}
              for s in all_students()}
    rows = deps.fetch_db_rows("SELECT username, full_name, role FROM users WHERE role IN ('老師', '教職員', '管理員')")
    for u in rows if rows is not None else [u for u in deps.users if u["role"] in STAFF_ROLES]:
        people[f"user:{u['username']}"] = {"name": u["full_name"], "desc": u["role"]}
    return people


# 【功能：線上會議】誰可以邀請哪些班：老師 = 自己任教 + 導師班，教職員 / 管理員 = 全部，學生不能整班邀請
def invitable_classes(u):
    """老師：課表上自己教的班 + 導師班；教職員、管理員：全部班級；學生：不能整班邀請"""
    if u["role"] in ("教職員", "管理員"):
        return sorted({s["class_name"] for s in all_students() if s.get("class_name")})
    if u["role"] == "老師":
        name = _plain_name(u["full_name"])
        classes = {r["class_name"] for r in load_schedule() if r.get("class_name") and r.get("teacher") == name}
        if u.get("advised_class"):
            classes.add(u["advised_class"])
        return sorted(classes)
    return []


def class_member_keys(class_name):
    cls = find_class(class_name)
    return member_ids(cls) if cls else sorted(roster_ids(class_name))


def _new_code(existing):
    while True:
        code = "".join(secrets.choice(CODE_CHARS) for _ in range(8))
        if code not in existing:
            return code


def _parse_time(text):
    try:
        return datetime.strptime(str(text).replace("T", " ")[:16], "%Y-%m-%d %H:%M")
    except ValueError:
        return None


def _find(meeting_id):
    return next((m for m in db.all_meetings() if m["id"] == meeting_id), None)


def _check_invitees(keys, classes, u):
    """回傳錯誤訊息；沒問題回傳 None"""
    bad = [c for c in classes if c not in set(invitable_classes(u))]
    if bad:
        return f"你不能邀請這些班級：{'、'.join(bad)}"
    people = _people()
    unknown = [k for k in keys if k not in people]
    if unknown:
        return f"找不到這些人：{'、'.join(unknown[:5])}"
    return None


# 【功能：線上會議】個人 + 整班展開成成員名單 (班級 → 學號)，已經在會議裡的人不重複加入
def _invite(meeting, keys, classes, u):
    """把個人與班級加進會議，回傳 (新增人數, 錯誤訊息)"""
    problem = _check_invitees(keys, classes, u)
    if problem:
        return 0, problem
    people = _people()
    members, now = [], now_str()
    for k in keys:
        members.append({"meeting_id": meeting["id"], "member_key": k, "display_name": people[k]["name"],
                        "source": "邀請", "invited_by": u["full_name"], "created_at": now})
    for c in classes:
        for k in class_member_keys(c):
            members.append({"meeting_id": meeting["id"], "member_key": k, "display_name": people.get(k, {}).get("name", k),
                            "source": "班級", "invited_by": u["full_name"], "created_at": now})
    host = meeting["host_key"]
    members = [m for m in members if m["member_key"] != host]
    if len({m["member_key"] for m in members}) > MAX_INVITEES:
        return 0, f"一次最多邀請 {MAX_INVITEES} 人"
    return db.add_members(members), None


# 【功能：線上會議】依「我」是主持人還是成員決定回傳內容：只有主持人看得到邀請碼和成員名單
def _describe(m, me, members, now):
    start = _parse_time(m["start_at"])
    end = start + timedelta(minutes=m["duration_min"])
    mine = next((x for x in members if x["member_key"] == me), None)
    is_host = m["host_key"] == me
    cfg = jitsi_config()
    item = {k: m[k] for k in ("id", "title", "description", "host_name", "host_role", "start_at", "duration_min", "status", "allow_code_join")}
    item.update({
        "end_at": end.strftime("%Y-%m-%d %H:%M"),
        "is_host": is_host,
        "joined_by": "主持人" if is_host else (mine["source"] if mine else ""),
        "invited_by": mine["invited_by"] if mine else "",
        "invited_at": mine["created_at"] if mine else "",
        "member_count": len(members) + 1,
        "is_past": now > end,
        "is_open": m["status"] == "排定" and start - timedelta(minutes=EARLY_JOIN_MINUTES) <= now <= end,
    })
    if is_host:
        item["invite_code"] = m["invite_code"]
        item["members"] = [{"key": x["member_key"], "name": x["display_name"], "source": x["source"]} for x in members]
    if m["status"] == "排定":
        item["join_url"] = f"https://{cfg['domain']}/{m['room_name']}"
    return item


@bp.route("/api/campus/meetings", methods=["GET"])
@require()
def my_meetings():
    me, u, now = user_key(), current_user(), datetime.now()
    members = db.all_members()
    result = []
    for m in db.all_meetings():
        mine = [x for x in members if x["meeting_id"] == m["id"]]
        if m["host_key"] == me or any(x["member_key"] == me for x in mine):
            result.append(_describe(m, me, mine, now))
    upcoming = sorted([x for x in result if not x["is_past"]], key=lambda x: x["start_at"])
    past = sorted([x for x in result if x["is_past"]], key=lambda x: x["start_at"], reverse=True)[:20]
    return ok(data=upcoming + past, now=now.strftime("%Y-%m-%d %H:%M"), jitsi=jitsi_config(),
              can_create=u["role"] in CREATOR_ROLES, invitable_classes=invitable_classes(u))


@bp.route("/api/campus/meetings/people", methods=["GET"])
@require(*CREATOR_ROLES)
def search_people():
    """輸入姓名或學號找人邀請 (最多 10 筆)"""
    q = request.args.get("q", "").strip()[:20]
    if not q:
        return ok(data=[])
    me = user_key()
    hits = [{"key": k, **p} for k, p in _people().items() if k != me and (q in p["name"] or q.upper() in k.upper())]
    return ok(data=sorted(hits, key=lambda p: (not p["name"].startswith(q), p["name"]))[:10])


@bp.route("/api/campus/meetings", methods=["POST"])
@require(*CREATOR_ROLES)
def create_meeting():
    data = request.get_json(silent=True) or {}
    u = current_user()
    title = str(data.get("title") or "").strip()[:80]
    if not title:
        return error("請輸入會議名稱")
    start = _parse_time(data.get("start_at"))
    if not start:
        return error("請選擇開始時間")
    if start < datetime.now() - timedelta(minutes=30):
        return error("開始時間不能是過去的時間")
    try:
        duration = int(data.get("duration_min") or 60)
    except (TypeError, ValueError):
        return error("會議長度請填分鐘數")
    if not 15 <= duration <= 240:
        return error("會議長度要在 15 到 240 分鐘之間")
    keys = [str(k) for k in data.get("invitees") or []][:MAX_INVITEES]
    classes = [str(c) for c in data.get("classes") or []][:20]
    problem = _check_invitees(keys, classes, u)
    if problem:
        return error(problem)

    existing_codes = {m["invite_code"] for m in db.all_meetings()}
    meeting = db.insert_meeting({
        "title": title, "description": str(data.get("description") or "").strip()[:500], "host_key": user_key(),
        "host_name": u["full_name"], "host_role": u["role"], "start_at": start.strftime("%Y-%m-%d %H:%M"),
        "duration_min": duration, "room_name": f"UKN-{secrets.token_hex(10)}", "invite_code": _new_code(existing_codes),
        "allow_code_join": data.get("allow_code_join", True) not in (False, 0, "0", "false"), "status": "排定",
        "created_at": now_str()})
    added, _ = _invite(meeting, keys, classes, u)
    deps.write_audit_log("meetings", meeting["id"], "新增", after={"title": title, "start_at": meeting["start_at"], "invited": added})
    return ok(message=f"已建立會議，邀請了 {added} 人", id=meeting["id"], invite_code=meeting["invite_code"])


@bp.route("/api/campus/meetings/<int:meeting_id>/invite", methods=["POST"])
@require(*CREATOR_ROLES)
def invite_more(meeting_id):
    m = _find(meeting_id)
    if not m:
        return error("找不到這場會議", 404)
    if m["host_key"] != user_key():
        return error("只有主持人可以邀請", 403)
    if m["status"] != "排定":
        return error("會議已取消")
    data = request.get_json(silent=True) or {}
    added, problem = _invite(m, [str(k) for k in data.get("invitees") or []][:MAX_INVITEES],
                             [str(c) for c in data.get("classes") or []][:20], current_user())
    if problem:
        return error(problem)
    return ok(message=f"已邀請 {added} 人" if added else "這些人都已經在會議裡了")


# 【功能：線上會議】輸入邀請碼 → 比對 invite_code，檢查會議沒取消、沒結束、主持人沒關閉邀請碼後加入
@bp.route("/api/campus/meetings/join", methods=["POST"])
@require()
def join_by_code():
    code = re.sub(r"[\s-]", "", str((request.get_json(silent=True) or {}).get("code") or "")).upper()[:12]
    m = next((x for x in db.all_meetings() if x["invite_code"] == code), None) if code else None
    if not m or m["status"] != "排定":
        return error("邀請碼不正確，或會議已取消", 404)
    if not m["allow_code_join"]:
        return error("這場會議只限受邀的人參加，請主持人邀請你", 403)
    end = _parse_time(m["start_at"]) + timedelta(minutes=m["duration_min"])
    if datetime.now() > end:
        return error("會議已經結束")
    u, me = current_user(), user_key()
    if m["host_key"] == me:
        return ok(message="你是這場會議的主持人", id=m["id"])
    db.add_members([{"meeting_id": m["id"], "member_key": me, "display_name": u["full_name"], "source": "邀請碼",
                     "invited_by": m["host_name"], "created_at": now_str()}])
    return ok(message=f"已加入「{m['title']}」", id=m["id"])


@bp.route("/api/campus/meetings/<int:meeting_id>/cancel", methods=["POST"])
@require()
def cancel_meeting(meeting_id):
    m = _find(meeting_id)
    if not m:
        return error("找不到這場會議", 404)
    if m["host_key"] != user_key():
        return error("只有主持人可以取消會議", 403)
    db.update_meeting(meeting_id, {"status": "已取消"})
    deps.write_audit_log("meetings", meeting_id, "修改", before={"status": m["status"]}, after={"status": "已取消"})
    return ok(message="已取消會議，成員會在會議列表看到「已取消」")


@bp.route("/api/campus/meetings/<int:meeting_id>/leave", methods=["POST"])
@require()
def leave_meeting(meeting_id):
    m = _find(meeting_id)
    if not m:
        return error("找不到這場會議", 404)
    if m["host_key"] == user_key():
        return error("主持人不能退出，要結束請按「取消會議」")
    db.remove_member(meeting_id, user_key())
    return ok(message="已退出會議")
