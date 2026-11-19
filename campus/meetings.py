"""線上會議 (類似 Google Meet)：建立會議、邀請指定的人或整班、邀請碼加入，視訊用 Jitsi Meet。

- 學生、老師、教職員、管理員都可以開會議；學生只能邀請個人，老師可以邀請自己任教或導師班的班級，教職員 / 管理員可以邀請任何班級
- 每場會議有一組邀請碼，傳給別人輸入就能加入 (主持人可關閉)
- 受邀的人在通知中心會看到邀請 (前端讀 GET /api/campus/meetings 的 invited 項目)
- 視訊：預設在新分頁開 meet.ffmuc.net (Freifunk München 的公開 Jitsi 伺服器，不用登入就能開始)；
  meet.jit.si 要有人先用 Google / GitHub 帳號登入當主持人，其他人才進得去，所以不當預設。
  學校架了自己的 Jitsi 伺服器時設定 JITSI_DOMAIN=網域、JITSI_EMBED=1，就會直接嵌在網站裡
- 邀請訊息裡的網址：有設定 PUBLIC_SITE_URL 就用它；主持人用 127.0.0.1 開網站時改用這台電腦的區網 IP，別人才連得到
- 會議室名稱是隨機字串，只有會議成員從這裡拿得到連結
- 會議留痕：成員可以在會議裡文字討論；按「加入視訊」會記出席時間；主持人寫會議紀錄並選保存 3 / 6 / 12 個月，
  過了保存期限 (會議結束時間 + 保存月數) 討論、出席與紀錄內容自動刪除；成員可以下載純文字的會議紀錄當佐證
"""
import calendar
import os
import re
import secrets
import socket
from datetime import datetime, timedelta
from urllib.parse import quote

from flask import Blueprint, Response, request

from public_portal import public_site_url

from . import meetings_store as db
from .common import deps, error, ok, require, current_user, user_key, now_str, all_students, STAFF_ROLES
from .messaging import _plain_name, load_schedule, find_class, member_ids, roster_ids

bp = Blueprint("campus_meetings", __name__)

CREATOR_ROLES = ("學生", "老師", "教職員", "管理員")
CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 去掉容易看錯的 0/O、1/I
MAX_INVITEES = 300
EARLY_JOIN_MINUTES = 15  # 開始前幾分鐘可以進會議室


def jitsi_config():
    return {"domain": os.getenv("JITSI_DOMAIN", "meet.ffmuc.net"), "embed": os.getenv("JITSI_EMBED") == "1"}


def share_base():
    """邀請訊息裡給別人點的網址：用 localhost 開網站時換成區網 IP (同一個 Wi-Fi 的人才連得到)"""
    configured = public_site_url()
    if configured:
        return configured.rstrip("/")
    host, _, port = request.host.partition(":")
    if host in ("127.0.0.1", "localhost", "::1"):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))  # UDP 不會真的送封包，只是讓系統選出對外的網卡
                host = s.getsockname()[0]
        except OSError:
            pass
    # 經過 Cloudflare 等反向代理時，對外其實是 https：以代理送來的 X-Forwarded-Proto 為準
    scheme = request.headers.get("X-Forwarded-Proto", request.scheme).split(",")[0].strip()
    return f"{scheme}://{host}{':' + port if port else ''}"


def _people():
    """{成員代碼: {name, desc}}：學生用學號、其他身分用 user:帳號"""
    people = {s["student_id"]: {"name": s["full_name"], "desc": f"{s.get('class_name') or ''} {s['student_id']}".strip()}
              for s in all_students()}
    rows = deps.fetch_db_rows("SELECT username, full_name, role FROM users WHERE role IN ('老師', '教職員', '管理員', '系統管理員')")
    for u in rows if rows is not None else [u for u in deps.users if u["role"] in STAFF_ROLES]:
        people[f"user:{u['username']}"] = {"name": u["full_name"], "desc": u["role"]}
    return people


# 【功能：線上會議】誰可以邀請哪些班：老師 = 自己任教 + 導師班，教職員 / 管理員 = 全部，學生不能整班邀請
def invitable_classes(u):
    """老師：課表上自己教的班 + 導師班；教職員、管理員：全部班級；學生：不能整班邀請"""
    if u["role"] in ("教職員", "管理員", "系統管理員"):
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
    purge_expired_logs(now)
    members = db.all_members()
    result = []
    for m in db.all_meetings():
        mine = [x for x in members if x["meeting_id"] == m["id"]]
        if m["host_key"] == me or any(x["member_key"] == me for x in mine):
            result.append(_describe(m, me, mine, now))
    upcoming = sorted([x for x in result if not x["is_past"]], key=lambda x: x["start_at"])
    past = sorted([x for x in result if x["is_past"]], key=lambda x: x["start_at"], reverse=True)[:20]
    return ok(data=upcoming + past, now=now.strftime("%Y-%m-%d %H:%M"), jitsi=jitsi_config(), share_base=share_base(),
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


# =====================================================================
# 會議留痕：會中文字討論、出席紀錄 (誰按了「加入視訊」)、會議紀錄，保存 3 / 6 / 12 個月後自動刪除
# =====================================================================

KEEP_MONTH_OPTIONS = (3, 6, 12)
DEFAULT_KEEP_MONTHS = 12
MAX_MESSAGE_LEN = 500
MAX_MINUTES_LEN = 5000


def add_months(dt, months):
    """2026-11-30 + 3 個月 → 2027-02-28 (月底對齊)"""
    total = dt.month - 1 + months
    year, month = dt.year + total // 12, total % 12 + 1
    return dt.replace(year=year, month=month, day=min(dt.day, calendar.monthrange(year, month)[1]))


def _end_of(m):
    return _parse_time(m["start_at"]) + timedelta(minutes=m["duration_min"])


# 【功能：會議留痕】保存期限 = 會議結束時間 + 保存月數；過期就刪掉討論、出席與紀錄內容
def log_state(m, now):
    """回傳 (會議紀錄或 None, 保存月數, 保存到期時間, 是否已過期刪除)；到期但還沒刪的順便刪掉"""
    record = db.get_record(m["id"])
    keep = record["keep_months"] if record else DEFAULT_KEEP_MONTHS
    keep_until = add_months(_end_of(m), keep)
    purged = bool(record) and record.get("updated_by") == db.PURGED_BY
    if not purged and now > keep_until:
        db.purge_logs(m["id"], keep, now.strftime("%Y-%m-%d %H:%M:%S"))
        record, purged = db.get_record(m["id"]), True
    return record, keep, keep_until, purged


def purge_expired_logs(now=None):
    """把所有已過保存期限的會議留痕刪掉 (開會議列表時順便做，不用另外排程)"""
    now = now or datetime.now()
    for m in db.all_meetings():
        if _parse_time(m["start_at"]) and add_months(_end_of(m), 1) < now:  # 結束不到 1 個月的一定還沒到期
            log_state(m, now)


def _member_meeting(meeting_id):
    """回傳 (會議, 我是不是主持人, 錯誤回應)；只有主持人和成員看得到討論與紀錄"""
    m = _find(meeting_id)
    if not m:
        return None, False, error("找不到這場會議", 404)
    me = user_key()
    if m["host_key"] == me:
        return m, True, None
    if not any(x["member_key"] == me for x in db.all_members(meeting_id)):
        return None, False, error("你不是這場會議的成員", 403)
    return m, False, None


def _can_chat(m, now):
    """會議排定中、還沒結束都可以留言；結束或取消後討論只能看不能寫 (保留原樣當佐證)"""
    return m["status"] == "排定" and now <= _end_of(m)


def _message_out(x, me):
    return {"id": x["id"], "sender_name": x["sender_name"], "content": x["content"],
            "created_at": x["created_at"], "is_mine": x["sender_key"] == me}


@bp.route("/api/campus/meetings/<int:meeting_id>/enter", methods=["POST"])
@require()
def enter_meeting(meeting_id):
    """按「加入視訊」時記一筆出席 (第一次進入時間、最後進入時間、進入次數)"""
    m, _, problem = _member_meeting(meeting_id)
    if problem:
        return problem
    now = datetime.now()
    start = _parse_time(m["start_at"])
    if m["status"] != "排定" or not (start - timedelta(minutes=EARLY_JOIN_MINUTES) <= now <= _end_of(m)):
        return error("現在不是會議時間")
    u = current_user()
    db.record_attendance(meeting_id, user_key(), u["full_name"], now.strftime("%Y-%m-%d %H:%M:%S"))
    return ok(join_url=f"https://{jitsi_config()['domain']}/{m['room_name']}")


# 【功能：會議留痕】會中文字討論：成員才能看，排定中可以留言，after 只拿新訊息 (前端每幾秒輪詢)
@bp.route("/api/campus/meetings/<int:meeting_id>/chat", methods=["GET"])
@require()
def meeting_chat(meeting_id):
    m, _, problem = _member_meeting(meeting_id)
    if problem:
        return problem
    now = datetime.now()
    _, _, _, purged = log_state(m, now)
    try:
        after = max(int(request.args.get("after") or 0), 0)
    except ValueError:
        after = 0
    me = user_key()
    return ok(data=[_message_out(x, me) for x in db.list_messages(meeting_id, after)],
              can_post=_can_chat(m, now) and not purged, purged=purged, title=m["title"])


@bp.route("/api/campus/meetings/<int:meeting_id>/chat", methods=["POST"])
@require()
def post_chat(meeting_id):
    m, _, problem = _member_meeting(meeting_id)
    if problem:
        return problem
    if not _can_chat(m, datetime.now()):
        return error("會議已結束或已取消，討論只能查看")
    content = str((request.get_json(silent=True) or {}).get("content") or "").strip()
    if not content:
        return error("請輸入訊息")
    if len(content) > MAX_MESSAGE_LEN:
        return error(f"一則訊息最多 {MAX_MESSAGE_LEN} 字")
    msg = db.add_message({"meeting_id": meeting_id, "sender_key": user_key(), "sender_name": current_user()["full_name"],
                          "content": content, "created_at": now_str()})
    return ok(data=_message_out(msg, user_key()))


def build_record(m, now):
    """會議紀錄全文：會議資訊、受邀名單、實際出席、會議紀錄、文字討論、保存期限"""
    record, keep, keep_until, purged = log_state(m, now)
    members = db.all_members(m["id"])
    attendance = [] if purged else db.list_attendance(m["id"])
    came = {a["member_key"] for a in attendance}
    return {
        "id": m["id"], "title": m["title"], "description": m.get("description") or "", "status": m["status"],
        "host_name": m["host_name"], "host_role": m["host_role"], "start_at": m["start_at"],
        "end_at": _end_of(m).strftime("%Y-%m-%d %H:%M"), "duration_min": m["duration_min"],
        "is_past": now > _end_of(m),
        "invited": [{"name": x["display_name"], "source": x["source"], "attended": x["member_key"] in came} for x in members],
        "attendance": [{"name": a["display_name"], "first_joined_at": a["first_joined_at"], "last_joined_at": a["last_joined_at"],
                        "join_count": a["join_count"], "is_host": a["member_key"] == m["host_key"]} for a in attendance],
        "minutes": "" if purged or not record else (record.get("minutes") or ""),
        "minutes_updated_by": "" if purged or not record else (record.get("updated_by") or ""),
        "minutes_updated_at": "" if purged or not record else (record.get("updated_at") or ""),
        "messages": [] if purged else [_message_out(x, user_key()) for x in db.list_messages(m["id"])],
        "keep_months": keep, "keep_until": keep_until.strftime("%Y-%m-%d"), "purged": purged,
        "keep_options": list(KEEP_MONTH_OPTIONS),
    }


# 【功能：會議留痕】會議紀錄：成員都能看；主持人可以寫紀錄、選保存 3 / 6 / 12 個月
@bp.route("/api/campus/meetings/<int:meeting_id>/record", methods=["GET"])
@require()
def meeting_record(meeting_id):
    m, is_host, problem = _member_meeting(meeting_id)
    if problem:
        return problem
    return ok(data={**build_record(m, datetime.now()), "is_host": is_host})


@bp.route("/api/campus/meetings/<int:meeting_id>/record", methods=["PUT"])
@require()
def save_meeting_record(meeting_id):
    m, is_host, problem = _member_meeting(meeting_id)
    if problem:
        return problem
    if not is_host:
        return error("只有主持人可以寫會議紀錄", 403)
    _, old_keep, _, purged = log_state(m, datetime.now())
    if purged:
        return error("這場會議的紀錄已過保存期限並刪除")
    data = request.get_json(silent=True) or {}
    minutes = str(data.get("minutes") or "").strip()
    if len(minutes) > MAX_MINUTES_LEN:
        return error(f"會議紀錄最多 {MAX_MINUTES_LEN} 字")
    try:
        keep = int(data.get("keep_months") or DEFAULT_KEEP_MONTHS)
    except (TypeError, ValueError):
        keep = 0
    if keep not in KEEP_MONTH_OPTIONS:
        return error("保存期限只能選 3、6 或 12 個月")
    if add_months(_end_of(m), keep) < datetime.now():
        return error(f"會議結束已超過 {keep} 個月，請選更長的保存期限")
    db.save_record(meeting_id, minutes, keep, current_user()["full_name"], now_str())
    deps.write_audit_log("meetings", meeting_id, "修改", before={"keep_months": old_keep},
                         after={"keep_months": keep, "minutes_length": len(minutes)})
    return ok(message=f"已儲存會議紀錄，保存到 {add_months(_end_of(m), keep):%Y-%m-%d}")


def record_text(r):
    """下載用的純文字會議紀錄"""
    lines = [f"會議紀錄：{r['title']}", "",
             f"時間：{r['start_at']} – {r['end_at'][11:]}（{r['duration_min']} 分鐘）" + ("（已取消）" if r["status"] == "已取消" else ""),
             f"主持人：{r['host_name']}（{r['host_role']}）",
             f"保存期限：{r['keep_until']}（會議結束後 {r['keep_months']} 個月）"]
    if r["description"]:
        lines.append(f"說明：{r['description']}")
    if r["purged"]:
        return "\n".join(lines + ["", "這場會議的討論與紀錄已過保存期限並刪除。"]) + "\n"
    lines += ["", f"受邀 {len(r['invited'])} 人，實際出席 {len(r['attendance'])} 人（含主持人）", "", "【出席紀錄】"]
    lines += [f"- {a['name']}{'（主持人）' if a['is_host'] else ''}：{a['first_joined_at'][11:16]} 進入"
              + (f"，共進入 {a['join_count']} 次，最後 {a['last_joined_at'][11:16]}" if a["join_count"] > 1 else "")
              for a in r["attendance"]] or ["（沒有人進入會議室）"]
    absent = [x["name"] for x in r["invited"] if not x["attended"]]
    if absent:
        lines.append(f"未出席：{'、'.join(absent)}")
    lines += ["", "【會議紀錄】", r["minutes"] or "（主持人尚未填寫）"]
    if r["minutes_updated_at"]:
        lines.append(f"（{r['minutes_updated_by']} 於 {r['minutes_updated_at'][:16]} 更新）")
    lines += ["", "【文字討論】"]
    lines += [f"[{x['created_at'][5:16]}] {x['sender_name']}：{x['content']}" for x in r["messages"]] or ["（沒有文字討論）"]
    return "\n".join(lines) + "\n"


@bp.route("/api/campus/meetings/<int:meeting_id>/record/download", methods=["GET"])
@require()
def download_meeting_record(meeting_id):
    m, _, problem = _member_meeting(meeting_id)
    if problem:
        return problem
    text = record_text(build_record(m, datetime.now()))
    filename = quote(f"會議紀錄_{m['title']}_{m['start_at'][:10]}.txt")
    return Response(text.encode("utf-8-sig"), mimetype="text/plain; charset=utf-8",
                    headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"})
