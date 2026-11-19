"""臨時停課／調課通知：學生看到自己班上哪堂課停課、調到哪天哪節哪間教室，一鍵加入個人行事曆。

- 停課：原本的上課時段不上；有補課時另外寫補課日期、節次、教室
- 調課：原本的時段不上，改到新的日期、節次、教室
- 誰收得到：該班學生 (學籍同班 + 用密碼加入班級的人)，以及課表上個別修這門課的學生 (重補修)
- 發布 (POST) 限老師 / 教職員 / 管理員，老師只能發自己任教或導師班；發布時同時送一則「緊急」班級通知，學生的通知中心會跳出來
  (目前只有 API，老師端的發布畫面不在這次範圍內)
- 加入行事曆：寫進個人行程 (calendar_ext 的 my_events / academic_calendar.owner_key)，
  source 記 course-change-<id> (原時段) 與 course-change-<id>-new (補課 / 調課後時段)，不會重複加入
- 資料：MySQL 連得上就存 course_changes 表 (沒有表會自動建立)；連不上用 campus_store.json，並放兩筆示範資料
"""
from datetime import date, timedelta

from flask import Blueprint, request

from .common import deps, error, ok, require, store, next_id, now_str, current_user, user_key, STAFF_ROLES
from .calendar_ext import add_event, list_my_events

bp = Blueprint("campus_course_changes", __name__)

KINDS = ("停課", "調課")
FIELDS = ("kind", "class_name", "course_name", "teacher", "orig_date", "orig_periods", "orig_room",
          "new_date", "new_periods", "new_room", "reason", "created_by", "created_by_username", "created_at")

TABLE_SQL = """
CREATE TABLE IF NOT EXISTS course_changes (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 kind varchar(4) NOT NULL COMMENT '停課 / 調課',
 class_name varchar(50) NOT NULL,
 course_name varchar(100) NOT NULL,
 teacher varchar(50) DEFAULT NULL,
 orig_date date NOT NULL,
 orig_periods varchar(10) NOT NULL COMMENT '節次，例如 3-4',
 orig_room varchar(20) DEFAULT NULL,
 new_date date DEFAULT NULL COMMENT '調課後 / 補課日期；停課沒有補課時為 NULL',
 new_periods varchar(10) DEFAULT NULL,
 new_room varchar(20) DEFAULT NULL,
 reason varchar(200) DEFAULT NULL,
 created_by varchar(50) NOT NULL,
 created_by_username varchar(50) DEFAULT NULL,
 created_at datetime NOT NULL,
 KEY idx_class (class_name),
 KEY idx_orig_date (orig_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='臨時停課／調課通知'
"""
_table_ready = False


# =====================================================================
# 資料存取
# =====================================================================

def use_db():
    global _table_ready
    if deps.fetch_db_rows("SELECT 1 AS ok") is None:
        return False
    if not _table_ready:
        deps.db_execute(TABLE_SQL)
        _table_ready = True
    return True


def _next_weekday(start, weekday):
    """start 之後 (不含當天) 的下一個星期幾；weekday 1 = 週一"""
    days = (weekday - start.isoweekday()) % 7 or 7
    return start + timedelta(days=days)


def demo_changes():
    """示範模式的兩筆資料 (資管五忠，日期跟著今天往後排，展示時一定看得到)"""
    today = date.today()
    tue, thu = _next_weekday(today, 2), _next_weekday(today, 4)
    base = {"class_name": "資管五忠", "created_by": "彭賓鈺 老師", "created_by_username": "teacher1", "created_at": now_str()}
    return [
        {**base, "id": 1, "kind": "停課", "course_name": "統計學", "teacher": "彭賓鈺",
         "orig_date": tue.isoformat(), "orig_periods": "3-4", "orig_room": "C4070",
         "new_date": (thu + timedelta(days=7)).isoformat(), "new_periods": "1-2", "new_room": "C4070",
         "reason": "老師公假出差，下週四第 1-2 節補課"},
        {**base, "id": 2, "kind": "調課", "course_name": "AI應用精準管理", "teacher": "謝樹明",
         "orig_date": (tue + timedelta(days=7)).isoformat(), "orig_periods": "6-8", "orig_room": "C3060",
         "new_date": (thu + timedelta(days=7)).isoformat(), "new_periods": "5-7", "new_room": "C3050",
         "reason": "原教室電腦更新，改到週四並換教室", "created_by": "謝樹明 老師", "created_by_username": None},
    ]


def _decode(row):
    item = dict(row)
    for key in ("orig_date", "new_date"):
        item[key] = str(item[key])[:10] if item.get(key) else ""
    item["created_at"] = str(item["created_at"])[:19]
    return item


def all_changes():
    if use_db():
        return [_decode(r) for r in deps.fetch_db_rows("SELECT * FROM course_changes ORDER BY orig_date, id") or []]
    return [dict(c) for c in store.section("course_changes", demo_changes)]


def insert_change(fields):
    if use_db():
        result = deps.db_execute("INSERT INTO course_changes (" + ", ".join(FIELDS) + ") VALUES ("
                                 + ", ".join(["%s"] * len(FIELDS)) + ")", tuple(fields.get(k) or None for k in FIELDS))
        return {**fields, "id": result["lastrowid"]}
    with store.lock:
        items = store.section("course_changes", demo_changes)
        saved = {**fields, "id": next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


# =====================================================================
# 誰收得到、要加進行事曆的行程
# =====================================================================

def _my_courses(student_id):
    """{(課名, 老師)}：課表上個別修課 (重補修) 的課"""
    from .messaging import load_schedule
    return {(r.get("course_name"), r.get("teacher")) for r in load_schedule() if r.get("student_id") == student_id}


# 【功能：停調課通知】學生看得到的停調課：自己的班 (含加入的班) + 自己個別修的課
def changes_for_student(student_id):
    from .messaging import my_class_names
    classes = set(my_class_names(student_id))
    own = _my_courses(student_id)
    return [c for c in all_changes() if c["class_name"] in classes or (c["course_name"], c.get("teacher")) in own]


def _when(day, periods, room):
    wd = "一二三四五六日"[date.fromisoformat(day).weekday()]
    return f"{day[5:].replace('-', '/')}（{wd}）第 {periods} 節" + (f" {room}" if room else "")


def summary(c):
    """一行說明，例如：統計學 11/24（二）第 3-4 節 C4070 停課，補課 12/03（四）第 1-2 節 C4070"""
    orig = _when(c["orig_date"], c["orig_periods"], c.get("orig_room"))
    if c["kind"] == "調課":
        return f"{c['course_name']} {orig} 調到 {_when(c['new_date'], c['new_periods'], c.get('new_room'))}"
    makeup = f"，補課 {_when(c['new_date'], c['new_periods'], c.get('new_room'))}" if c.get("new_date") else "，暫無補課"
    return f"{c['course_name']} {orig} 停課{makeup}"


def calendar_entries(c):
    """[(source, 行程)]：原時段一筆；有新時段 (補課 / 調課後) 再一筆"""
    note = summary(c) + (f"\n原因：{c['reason']}" if c.get("reason") else "") + f"\n發布：{c['created_by']}"
    first = "停課" if c["kind"] == "停課" else "調課（原時段不上課）"
    entries = [(f"course-change-{c['id']}", {"title": f"🚫 {first}：{c['course_name']} 第 {c['orig_periods']} 節",
                                             "start_date": c["orig_date"], "end_date": c["orig_date"], "note": note})]
    if c.get("new_date"):
        label = "補課" if c["kind"] == "停課" else "調課"
        room = f" {c['new_room']}" if c.get("new_room") else ""
        entries.append((f"course-change-{c['id']}-new", {"title": f"🔁 {label}：{c['course_name']} 第 {c['new_periods']} 節{room}",
                                                          "start_date": c["new_date"], "end_date": c["new_date"], "note": note}))
    return entries


# =====================================================================
# API
# =====================================================================

@bp.route("/api/campus/course-changes", methods=["GET"])
@require("學生", "家長")
def my_course_changes():
    """學生 / 家長：自己班上的停調課，還沒過的排前面；in_calendar = 已經加進我的行事曆"""
    u = current_user()
    today = date.today().isoformat()
    mine = {e.get("source") for e in list_my_events(user_key())}
    items = []
    for c in changes_for_student(u["student_id"]):
        last = max(c["orig_date"], c.get("new_date") or "")
        sources = [s for s, _ in calendar_entries(c)]
        items.append({**{k: c.get(k) or "" for k in ("id", "kind", "class_name", "course_name", "teacher", "orig_date",
                                                     "orig_periods", "orig_room", "new_date", "new_periods", "new_room",
                                                     "reason", "created_by", "created_at")},
                      "summary": summary(c), "is_past": last < today, "in_calendar": all(s in mine for s in sources)})
    upcoming = sorted((x for x in items if not x["is_past"]), key=lambda x: x["orig_date"])
    past = sorted((x for x in items if x["is_past"]), key=lambda x: x["orig_date"], reverse=True)
    return ok(data=upcoming + past, upcoming_count=len(upcoming))


# 【功能：停調課通知】一鍵加入個人行事曆：原時段標「停課」，補課 / 調課後的時段另外一筆，已加過的不重複
@bp.route("/api/campus/course-changes/<int:change_id>/calendar", methods=["POST"])
@require("學生")
def add_change_to_calendar(change_id):
    u = current_user()
    c = next((x for x in changes_for_student(u["student_id"]) if x["id"] == change_id), None)
    if not c:
        return error("找不到這則停調課通知", 404)
    key = user_key()
    mine = {e.get("source") for e in list_my_events(key)}
    added = 0
    for source, ev in calendar_entries(c):
        if source in mine:
            continue
        add_event(key, {**ev, "source": source, "created_at": now_str()})
        added += 1
    if not added:
        return error("已經加入過你的行事曆了", 409)
    return ok(message=f"已加入行事曆（{added} 筆）", added=added)


def _valid_day(value, label, required=True):
    value = str(value or "").strip()
    if not value:
        return ("", None) if not required else (None, f"請選擇{label}")
    try:
        return date.fromisoformat(value).isoformat(), None
    except ValueError:
        return None, f"{label}格式須為 YYYY-MM-DD"


def _valid_periods(value):
    """「3」或「3-4」，節次 1-14"""
    text = str(value or "").replace("–", "-").replace(" ", "")
    parts = text.split("-")
    if not text or len(parts) > 2 or not all(p.isdigit() and 1 <= int(p) <= 14 for p in parts) \
            or (len(parts) == 2 and int(parts[0]) > int(parts[1])):
        return None
    return text


@bp.route("/api/campus/course-changes", methods=["POST"])
@require(*STAFF_ROLES)
def create_course_change():
    """老師 / 行政人員發布停調課 (老師只能發自己任教或導師班)，同時送一則緊急班級通知"""
    from .meetings import invitable_classes
    from .messaging import add_notice, find_class, member_ids, roster_ids
    u = current_user()
    data = request.get_json(silent=True) or {}
    kind = data.get("kind")
    if kind not in KINDS:
        return error("請選擇停課或調課")
    class_name = str(data.get("class_name") or "").strip()
    if class_name not in invitable_classes(u):
        return error("只能發布自己任教或導師班的停調課", 403)
    course = str(data.get("course_name") or "").strip()[:100]
    if not course:
        return error("請輸入課程名稱")
    orig_date, problem = _valid_day(data.get("orig_date"), "原上課日期")
    if problem:
        return error(problem)
    orig_periods = _valid_periods(data.get("orig_periods"))
    if not orig_periods:
        return error("原上課節次請填 1-14，例如 3 或 3-4")
    new_date, problem = _valid_day(data.get("new_date"), "調課 / 補課日期", required=kind == "調課")
    if problem:
        return error(problem)
    new_periods = _valid_periods(data.get("new_periods")) if new_date else ""
    if new_date and not new_periods:
        return error("調課 / 補課節次請填 1-14，例如 3 或 3-4")
    item = insert_change({
        "kind": kind, "class_name": class_name, "course_name": course,
        "teacher": str(data.get("teacher") or u["full_name"].replace("老師", "")).strip()[:50],
        "orig_date": orig_date, "orig_periods": orig_periods, "orig_room": str(data.get("orig_room") or "").strip()[:20],
        "new_date": new_date, "new_periods": new_periods, "new_room": str(data.get("new_room") or "").strip()[:20],
        "reason": str(data.get("reason") or "").strip()[:200], "created_by": u["full_name"],
        "created_by_username": u["username"], "created_at": now_str()})
    cls = find_class(class_name)
    recipients = member_ids(cls) if cls else sorted(roster_ids(class_name))
    if recipients:
        add_notice({"class_name": class_name, "whole_class": True, "recipients": recipients,
                    "title": f"{kind}通知：{course}", "content": summary(item) + (f"\n原因：{item['reason']}" if item["reason"] else "")
                    + "\n可到「班級通知」把停調課加入行事曆。", "priority": "緊急", "sender": u["full_name"],
                    "sender_username": u["username"], "due_date": ""})
    deps.write_audit_log("course_changes", item["id"], "新增", after={k: item[k] for k in ("kind", "class_name", "course_name", "orig_date", "new_date")})
    return ok(message=f"已發布{kind}並通知 {class_name}", data=item)
