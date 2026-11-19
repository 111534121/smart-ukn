"""月曆：國定假日 (自動抓取)、學校行事曆 (校曆 + 官網 Google 日曆同步)、申辦期限、個人行程。

- 國定假日：抓 ruyut/TaiwanCalendar (整理自行政院人事行政總處辦公日曆表)，快取在 data/holidays_<年>.json；
  連不上網路時改用內建的 2026 年資料。
- 學校行事曆：康寧官網行事曆頁嵌入的公開 Google 日曆 (UKN_CALENDAR_ICS 可改網址)，
  由管理員在後台按「同步」或呼叫 POST /api/campus/calendar/sync 匯入。
"""
import json
import os
import re
import urllib.request
from datetime import date, datetime, timedelta

from flask import Blueprint, request

from preferences import scope_filter

from .common import DATA_DIR, deps, error, ok, require, store, next_id, now_str, user_key, current_user, all_students, STAFF_ROLES

bp = Blueprint("campus_calendar", __name__)

HOLIDAY_URL = "https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/{year}.json"
UKN_ICS_URL = os.getenv(
    "UKN_CALENDAR_ICS",
    "https://calendar.google.com/calendar/ical/ukncalendar%40g.ukn.edu.tw/public/basic.ics")

# 連不上網路時的備援 (2026 年國定假日與補假)
BUILTIN_HOLIDAYS = {
    2026: [
        ("20260101", "開國紀念日"), ("20260215", "小年夜"), ("20260216", "農曆除夕"), ("20260217", "春節"),
        ("20260218", "春節"), ("20260219", "春節"), ("20260220", "補假"), ("20260227", "補假"),
        ("20260228", "和平紀念日"), ("20260403", "補假"), ("20260404", "兒童節"), ("20260405", "清明節"),
        ("20260406", "補假"), ("20260501", "勞動節"), ("20260619", "端午節"), ("20260925", "中秋節"),
        ("20260928", "孔子誕辰紀念日/教師節"), ("20261009", "補假"), ("20261010", "國慶日"),
        ("20261025", "臺灣光復暨金門古寧頭大捷紀念日"), ("20261026", "補假"), ("20261225", "行憲紀念日"),
    ]
}

_holiday_cache = {}


def _iso(yyyymmdd):
    return f"{yyyymmdd[:4]}-{yyyymmdd[4:6]}-{yyyymmdd[6:8]}"


def load_holidays(year):
    """回傳 {YYYY-MM-DD: {"name", "is_holiday"}}，只含有說明的日子 (國定假日、補假、補班)"""
    if year in _holiday_cache:
        return _holiday_cache[year]
    cache_path = os.path.join(DATA_DIR, f"holidays_{year}.json")
    rows = None
    try:
        with open(cache_path, encoding="utf-8") as f:
            rows = json.load(f)
    except (OSError, ValueError):
        try:
            with urllib.request.urlopen(HOLIDAY_URL.format(year=year), timeout=8) as resp:
                rows = json.loads(resp.read().decode("utf-8"))
            os.makedirs(DATA_DIR, exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(rows, f, ensure_ascii=False)
        except Exception:
            rows = None

    result = {}
    if rows:
        for r in rows:
            if r.get("description"):
                result[_iso(r["date"])] = {"name": r["description"], "is_holiday": bool(r.get("isHoliday"))}
    else:
        for d, name in BUILTIN_HOLIDAYS.get(year, []):
            result[_iso(d)] = {"name": name, "is_holiday": True}
    _holiday_cache[year] = result
    return result


# ---------- 官網 Google 日曆 (iCal) 同步 ----------

def parse_ics(text):
    """解析 iCal 的 VEVENT，回傳 [{uid, title, start_date, end_date}]；DATE 型態的 DTEND 為不含當天"""
    lines = []
    for raw in text.splitlines():
        if raw.startswith((" ", "\t")) and lines:
            lines[-1] += raw[1:]
        else:
            lines.append(raw)
    events, cur = [], None
    for line in lines:
        if line == "BEGIN:VEVENT":
            cur = {}
        elif line == "END:VEVENT" and cur is not None:
            if cur.get("start") and cur.get("title"):
                start = cur["start"]
                end = cur.get("end") or start
                if cur.get("end_is_date") and end > start:
                    end = end - timedelta(days=1)
                events.append({"uid": cur.get("uid", ""), "title": cur["title"],
                               "start_date": start.isoformat(), "end_date": max(start, end).isoformat()})
            cur = None
        elif cur is not None and ":" in line:
            key, value = line.split(":", 1)
            name = key.split(";")[0]
            if name in ("DTSTART", "DTEND"):
                m = re.match(r"(\d{8})", value)
                if m:
                    d = datetime.strptime(m.group(1), "%Y%m%d").date()
                    if name == "DTSTART":
                        cur["start"] = d
                    else:
                        cur["end"] = d
                        cur["end_is_date"] = "VALUE=DATE" in key or len(value) == 8
            elif name == "SUMMARY":
                cur["title"] = value.replace("\\,", ",").replace("\\n", " ").strip()
            elif name == "UID":
                cur["uid"] = value
    return events


def guess_category(title):
    for words, cat in ((("考試", "期中考", "期末考"), "考試"), (("放假", "補假", "停課", "假期"), "放假"),
                       (("繳費", "學雜費"), "繳費"), (("申請", "截止", "登記", "加退選", "選課"), "申辦")):
        if any(w in title for w in words):
            return cat
    return "活動"


@bp.route("/api/campus/calendar/sync", methods=["POST"])
@require("管理員", "教職員")
def sync_ukn_calendar():
    try:
        with urllib.request.urlopen(UKN_ICS_URL, timeout=20) as resp:
            events = parse_ics(resp.read().decode("utf-8"))
    except Exception as e:
        return error(f"無法連線到學校行事曆：{e}", 502)
    with store.lock:
        store.data["ukn_ics_events"] = [{**e, "category": guess_category(e["title"])} for e in events]
        store.data["ukn_ics_synced_at"] = now_str()
        store.save()
    latest = max((e["end_date"] for e in events), default=None)
    return ok(message=f"已同步 {len(events)} 筆學校行事曆事項", count=len(events), latest_date=latest)


# ---------- 申辦所需資料 (點開事項時顯示) ----------

def load_checklists():
    rows = deps.fetch_db_rows("SELECT * FROM checklist_items ORDER BY item_id ASC")
    items = rows if rows else deps.checklists
    result = []
    for r in items:
        r = dict(r)
        if isinstance(r.get("steps_json"), str):
            try:
                r["steps_json"] = json.loads(r["steps_json"])
            except ValueError:
                r["steps_json"] = [r["steps_json"]]
        result.append(r)
    return result


def _core_words(text):
    """去掉常見字尾，取出事項名稱的關鍵詞 (例如『停修申請』→『停修』)"""
    text = re.sub(r"[（(].*?[)）]", "", text)
    for suffix in ("申請期限", "申請", "期限", "登記", "手續"):
        text = text.replace(suffix, "")
    return text.strip()


def match_checklist(title, related_id, checklists):
    if related_id:
        found = next((c for c in checklists if c["item_id"] == related_id), None)
        if found:
            return found
    core = _core_words(title)
    if len(core) < 2:
        return None
    return next((c for c in checklists if core in c["business_name"] or _core_words(c["business_name"]) in title), None)


def checklist_detail(c):
    if not c:
        return None
    return {
        "item_id": c["item_id"],
        "business_name": c["business_name"],
        "office": c.get("category_name", ""),
        "office_location": c.get("office_location", ""),
        "office_hours": c.get("office_hours", ""),
        "contact_phone": c.get("contact_phone", ""),
        "required_docs": [d.strip() for d in re.split(r"[、,，;；]", c.get("required_docs") or "") if d.strip()],
        "steps": c.get("steps_json") or [],
        "form_download_url": c.get("form_download_url") or "",
        "system_url": c.get("system_url") or "",
    }


# ---------- 月曆資料 ----------

def _to_date(value):
    if isinstance(value, date):
        return value
    return datetime.strptime(str(value)[:10], "%Y-%m-%d").date()


def load_deadlines():
    rows = deps.fetch_db_rows("SELECT * FROM deadlines ORDER BY end_date ASC")
    return rows if rows else deps.deadlines


def my_events_bucket(key):
    events = store.section("my_events", dict)
    return events.setdefault(key, [])


# ---------- 個人行程的資料存取 (T10)：academic_calendar 有 owner_key 欄位就存 MySQL ----------
#   owner_key 為 NULL 的是全校校曆；有值的是個人行程 (學號或 user:帳號，和 user_key() 相同)

def _events_db():
    if deps.fetch_db_rows("SELECT owner_key FROM academic_calendar LIMIT 1") is None:
        return False
    flags = store.data.setdefault("migrated_to_mysql", {})
    if not flags.get("my_events"):
        with store.lock:
            for key, items in (store.data.get("my_events") or {}).items():
                for ev in items:
                    _insert_event(key, ev)
            flags["my_events"] = True
            store.save()
    return True


def _insert_event(key, ev):
    res = deps.db_execute(
        "INSERT INTO academic_calendar (event_name, start_date, end_date, category, owner_key, note, source) "
        "VALUES (%s, %s, %s, '個人', %s, %s, %s)",
        (ev["title"], ev["start_date"], ev["end_date"], key, ev.get("note") or None, ev.get("source") or None))
    return res["lastrowid"]


def list_my_events(key):
    """[{id, title, start_date, end_date, note, source, created_at}]"""
    if not key:
        return []
    if _events_db():
        rows = deps.fetch_db_rows("SELECT * FROM academic_calendar WHERE owner_key = %s ORDER BY start_date, id", (key,)) or []
        return [{"id": r["id"], "title": r["event_name"], "start_date": str(r["start_date"])[:10],
                 "end_date": str(r["end_date"])[:10], "note": r.get("note") or "", "source": r.get("source") or "",
                 "created_at": ""} for r in rows]
    return list(store.data.get("my_events", {}).get(key, []))


def add_event(key, ev):
    if _events_db():
        return {"id": _insert_event(key, ev), **ev}
    with store.lock:
        bucket = my_events_bucket(key)
        item = {"id": next_id(bucket), **ev}
        bucket.append(item)
        store.save()
    return item


def remove_event(key, event_id):
    """回傳是否有刪到 (只能刪自己的行程)"""
    if _events_db():
        if not deps.fetch_db_rows("SELECT id FROM academic_calendar WHERE id = %s AND owner_key = %s", (event_id, key)):
            return False
        deps.db_execute("DELETE FROM academic_calendar WHERE id = %s AND owner_key = %s", (event_id, key))
        return True
    with store.lock:
        bucket = my_events_bucket(key)
        target = next((e for e in bucket if e["id"] == event_id), None)
        if not target:
            return False
        bucket.remove(target)
        store.save()
    return True


def _role_allowed(applies_to_role, role):
    """期限的適用身分 ('all' 或「學生,老師」這種清單)"""
    if not applies_to_role or str(applies_to_role).strip().lower() == "all":
        return True
    return role in [r.strip() for r in str(applies_to_role).split(",")]


# 學生才需要注意的校曆類別：老師 / 行政人員的行事曆不顯示
STUDENT_ONLY_CATEGORIES = ("繳費", "獎助")


def staff_events(u, overlaps, today):
    """老師 / 行政人員自己的「班務」：自己發的科上通知期限、導師班學生請假"""
    from .messaging import load_notices  # 避免循環匯入
    events = []
    for n in load_notices(sender_username=u["username"]):
        if not n.get("due_date"):
            continue
        d = _to_date(n["due_date"])
        if overlaps(d, d):
            read, total = len(n["read_by"]), len(n["recipients"])
            events.append({"key": f"notice-{n['id']}", "type": "class", "title": f"通知期限：{n['title']}",
                           "category": "班務", "start_date": d.isoformat(), "end_date": d.isoformat(), "expired": d < today,
                           "detail": {"note": f"{n['class_name']} · {'整班' if n['whole_class'] else '個別通知'}\n已讀 {read} / {total} 人",
                                      "goto": {"tab": "tab-notices", "label": "前往科上通知"}}})
    advised = u.get("advised_class") if u["role"] == "老師" else None
    if advised:
        names = {s["student_id"]: s["full_name"] for s in all_students() if s.get("class_name") == advised}
        for r in deps.get_dashboard_source().list_leave_requests_for_review(list(names), None):
            if r.get("status") not in ("待審核", "已核准"):
                continue
            s, e = _to_date(r["start_date"]), _to_date(r.get("end_date") or r["start_date"])
            if overlaps(s, e):
                events.append({"key": f"leave-{r['id']}", "type": "class",
                               "title": f"{names.get(r['student_id'], r['student_id'])} {r.get('leave_type', '請假')}" + ("（待審核）" if r["status"] == "待審核" else ""),
                               "category": "班務", "start_date": s.isoformat(), "end_date": e.isoformat(), "expired": e < today,
                               "detail": {"note": f"{advised} · {r['status']}\n節次：{r.get('periods') or '全天'}\n事由：{r.get('reason') or '—'}",
                                          "goto": {"tab": "tab-home", "label": "前往請假審核"}}})
    return events


def meeting_events(u, overlaps, today):
    """我主持或受邀的線上會議 (排定、已取消)，標在會議那天"""
    from . import meetings_store
    from .meetings import _parse_time
    me = user_key()
    members = meetings_store.all_members()
    events = []
    for m in meetings_store.all_meetings():
        mine = [x for x in members if x["meeting_id"] == m["id"]]
        if m["host_key"] != me and not any(x["member_key"] == me for x in mine):
            continue
        start = _parse_time(m["start_at"])
        if not start:
            continue
        d = start.date()
        if not overlaps(d, d):
            continue
        end = start + timedelta(minutes=m["duration_min"])
        cancelled = m["status"] == "已取消"
        host = "我" if m["host_key"] == me else m["host_name"]
        events.append({"key": f"meeting-{m['id']}", "type": "meeting", "category": "會議",
                       "title": f"🎥 {start:%H:%M} {m['title']}" + ("（已取消）" if cancelled else ""),
                       "start_date": d.isoformat(), "end_date": d.isoformat(), "expired": cancelled or d < today,
                       "detail": {"note": f"時間：{start:%H:%M}–{end:%H:%M}（{m['duration_min']} 分鐘）\n主持人：{host}\n參加人數：{len(mine) + 1} 人"
                                          + (f"\n說明：{m['description']}" if m.get("description") else ""),
                                  "goto": {"tab": "tab-meetings", "label": "前往線上會議"}}})
    return events


def notice_events(u, overlaps, today):
    """學生 / 家長收到的班級通知：標在發出那天；有期限的另外在期限那天標一次"""
    from .messaging import load_notices
    sid = u.get("student_id")
    if u["role"] not in ("學生", "家長") or not sid:
        return []
    events = []
    for n in load_notices(student_id=sid):
        unread = sid not in n["read_by"]
        note = f"{n.get('sender', '')}{'（未讀）' if unread else ''}\n{(n.get('content') or '')[:200]}"
        goto = {"tab": "tab-notices", "label": "前往班級通知"}
        sent = _to_date(str(n.get("created_at") or "")[:10]) if n.get("created_at") else None
        if sent and overlaps(sent, sent):
            events.append({"key": f"notice-{n['id']}", "type": "notice", "category": "通知",
                           "title": f"📣 {n['title']}", "start_date": sent.isoformat(), "end_date": sent.isoformat(),
                           "expired": False, "detail": {"note": note, "goto": goto}})
        if n.get("due_date"):
            due = _to_date(n["due_date"])
            if overlaps(due, due):
                events.append({"key": f"notice-{n['id']}-due", "type": "notice", "category": "通知",
                               "title": f"📣 期限：{n['title']}", "start_date": due.isoformat(), "end_date": due.isoformat(),
                               "expired": due < today, "detail": {"note": note, "goto": goto}})
    return events


@bp.route("/api/campus/calendar/month", methods=["GET"])
def calendar_month():
    """某月份的所有事項 (含前後週，方便畫整張月曆)。?year=2026&month=10"""
    today = datetime.now().date()
    try:
        year = int(request.args.get("year", today.year))
        month = int(request.args.get("month", today.month))
        first = date(year, month, 1)
    except ValueError:
        return error("year / month 格式錯誤")
    # 月曆畫面從該月第一天所在週的週日開始，共 6 週
    grid_start = first - timedelta(days=(first.weekday() + 1) % 7)
    grid_end = grid_start + timedelta(days=41)

    def overlaps(s, e):
        return s <= grid_end and e >= grid_start

    checklists = load_checklists()
    events = []
    u = current_user()
    is_staff = bool(u) and u["role"] in STAFF_ROLES  # 老師 / 行政人員看自己的行事曆，不看學生的申辦期限

    for ev in deps.fetch_calendar_events():
        s, e = _to_date(ev["start_date"]), _to_date(ev["end_date"])
        category = ev.get("category") or guess_category(ev["event_name"])
        if is_staff and category in STUDENT_ONLY_CATEGORIES:
            continue
        if overlaps(s, e):
            chk = match_checklist(ev["event_name"], ev.get("related_checklist_id"), checklists)
            events.append({"key": f"school-{ev['id']}", "type": "school", "title": ev["event_name"],
                           "category": category,
                           "start_date": s.isoformat(), "end_date": e.isoformat(), "expired": e < today,
                           "detail": {"checklist": checklist_detail(chk)}})

    for dl in scope_filter(load_deadlines(), lambda d: [d["applies_to_dept"]] if d.get("applies_to_dept") else []):
        if is_staff and not _role_allowed(dl.get("applies_to_role"), u["role"]):
            continue
        s = _to_date(dl.get("start_date") or dl["end_date"])
        e = _to_date(dl["end_date"])
        if overlaps(s, e):
            chk = match_checklist(dl["title"], None, checklists)
            events.append({"key": f"deadline-{dl['deadline_id']}", "type": "deadline", "title": dl["title"],
                           "category": "申辦", "start_date": s.isoformat(), "end_date": e.isoformat(),
                           "expired": e < today,
                           "detail": {"office": dl.get("category", ""), "description": dl.get("description", ""),
                                      "system_url": dl.get("related_system_url", ""),
                                      "checklist": checklist_detail(chk)}})

    for ev in store.data.get("ukn_ics_events", []):
        s, e = _to_date(ev["start_date"]), _to_date(ev["end_date"])
        if is_staff and ev.get("category", "活動") in STUDENT_ONLY_CATEGORIES:
            continue
        if overlaps(s, e):
            events.append({"key": f"ukn-{ev['uid'][:24]}", "type": "school", "title": ev["title"],
                           "category": ev.get("category", "活動"), "start_date": s.isoformat(),
                           "end_date": e.isoformat(), "expired": e < today, "source": "康寧官網行事曆",
                           "detail": {"checklist": checklist_detail(match_checklist(ev["title"], None, checklists))}})

    key = user_key()
    if key:
        for ev in list_my_events(key):
            s, e = _to_date(ev["start_date"]), _to_date(ev["end_date"])
            if overlaps(s, e):
                events.append({"key": f"my-{ev['id']}", "id": ev["id"], "type": "personal", "title": ev["title"],
                               "category": "個人", "start_date": s.isoformat(), "end_date": e.isoformat(),
                               "expired": e < today, "detail": {"note": ev.get("note", ""), "source": ev.get("source", "")}})

    if is_staff:
        for ev in events:
            ev["detail"].pop("checklist", None)  # 學生的「要準備什麼、怎麼辦」說明
        events += staff_events(u, overlaps, today)
    if u:
        events += meeting_events(u, overlaps, today)
        events += notice_events(u, overlaps, today)

    holidays = {}
    for y in {grid_start.year, grid_end.year}:
        for d, h in load_holidays(y).items():
            if grid_start.isoformat() <= d <= grid_end.isoformat():
                holidays[d] = h

    events.sort(key=lambda x: (x["start_date"], x["end_date"]))
    return ok(year=year, month=month, today=today.isoformat(), grid_start=grid_start.isoformat(),
              grid_end=grid_end.isoformat(), holidays=holidays, events=events,
              ukn_synced_at=store.data.get("ukn_ics_synced_at"))


@bp.route("/api/campus/my-events", methods=["POST"])
@require()
def add_my_event():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()[:80]
    try:
        start = _to_date(data.get("start_date", ""))
        end = _to_date(data.get("end_date") or data.get("start_date", ""))
    except ValueError:
        return error("日期格式須為 YYYY-MM-DD")
    if not title:
        return error("請輸入行程名稱")
    if end < start:
        return error("結束日期不可早於開始日期")
    key = user_key()
    source = str(data.get("source", ""))[:60]
    if source and any(e.get("source") == source for e in list_my_events(key)):
        return error("這則公告已經加入過你的月曆了", 409)
    item = add_event(key, {"title": title, "start_date": start.isoformat(), "end_date": end.isoformat(),
                           "note": str(data.get("note", ""))[:300], "source": source, "created_at": now_str()})
    return ok(message="已加入我的月曆", data=item)


@bp.route("/api/campus/my-events/<int:event_id>", methods=["DELETE"])
@require()
def delete_my_event(event_id):
    if not remove_event(user_key(), event_id):
        return error("找不到這個行程", 404)
    return ok(message="已從月曆移除")


# ---------- 公告：列表 + 推測日期，方便一鍵加入月曆 ----------

DATE_IN_TEXT = re.compile(r"(\d{1,2})/(\d{1,2})")


def guess_announcement_date(title, publish_date):
    """從標題抓『9/25』這類日期；抓不到就回傳 None。年份以公告日期推算 (跨年時往後推一年)"""
    m = DATE_IN_TEXT.search(title or "")
    if not m:
        return None
    pub = _to_date(publish_date)
    try:
        d = date(pub.year, int(m.group(1)), int(m.group(2)))
    except ValueError:
        return None
    if d < pub - timedelta(days=60):
        d = date(pub.year + 1, d.month, d.day)
    return d.isoformat()


@bp.route("/api/campus/announcements", methods=["GET"])
def list_announcements():
    u = current_user()
    student_id = u["student_id"] if u and u["role"] in ("學生", "家長") else None
    class_name = u["class_name"] if u and u["role"] == "學生" else None
    try:
        rows = deps.get_dashboard_source().list_announcements(class_name, student_id)
    except Exception:
        rows = []
    added = set()
    if user_key():
        added = {e.get("source") for e in list_my_events(user_key())}
    items = []
    for a in rows:
        a = dict(a)
        for k in ("publish_date",):
            if hasattr(a.get(k), "isoformat"):
                a[k] = a[k].isoformat()
        a["publish_date"] = str(a.get("publish_date", ""))[:10]
        a["suggested_date"] = guess_announcement_date(a.get("title"), a["publish_date"])
        a["in_my_calendar"] = f"announcement-{a['id']}" in added
        items.append(a)
    items.sort(key=lambda x: x["publish_date"], reverse=True)
    return ok(data=items)
