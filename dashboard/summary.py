"""
今日儀表板摘要：把課表、公告、作業、請假整理成「打開就知道今天要做什麼」的格式。
純函式，不碰資料庫與 Flask，方便測試。
"""
from datetime import datetime, timedelta

from .demo_data import PERIOD_TIMES

WEEKDAY_LABELS = {1: "週一", 2: "週二", 3: "週三", 4: "週四", 5: "週五", 6: "週六", 7: "週日"}
# 逾期多久內的未繳作業仍顯示在儀表板 (提醒補交)
OVERDUE_VISIBLE_DAYS = 7
ANNOUNCEMENT_LIMIT = 6
LEAVE_LIMIT = 5


def _class_item(row, day, now):
    start, _ = PERIOD_TIMES[row["period_start"]]
    _, end = PERIOD_TIMES[row["period_end"]]
    start_at = datetime.strptime(f"{day} {start}", "%Y-%m-%d %H:%M")
    end_at = datetime.strptime(f"{day} {end}", "%Y-%m-%d %H:%M")
    status = "done" if now >= end_at else "ongoing" if now >= start_at else "upcoming"
    return {
        "course_name": row["course_name"],
        "classroom": row.get("classroom") or "",
        "teacher": row.get("teacher") or "",
        "period_start": row["period_start"],
        "period_end": row["period_end"],
        "start_time": start,
        "end_time": end,
        "status": status,
        "is_personal": bool(row.get("student_id")),
    }


def summarize_schedule(schedule_rows, now):
    """今天還有課就顯示今天；今天沒課或都上完了，改顯示下一個有課的日子"""
    for offset in range(8):
        day = now.date() + timedelta(days=offset)
        rows = [r for r in schedule_rows if r["weekday"] == day.isoweekday()]
        if not rows:
            continue
        classes = [_class_item(r, day.strftime("%Y-%m-%d"), now) for r in rows]
        if offset == 0 and all(c["status"] == "done" for c in classes):
            continue
        weekday = WEEKDAY_LABELS[day.isoweekday()]
        label = "今天" if offset == 0 else "明天" if offset == 1 else f"下{weekday}" if day.isoweekday() <= now.isoweekday() else weekday
        return {"label": label, "weekday": weekday, "date": day.strftime("%Y-%m-%d"), "is_today": offset == 0, "classes": classes}
    return {"label": "", "weekday": "", "date": None, "is_today": False, "classes": []}


def summarize_announcements(rows):
    """未讀在前，各自依發布日新到舊"""
    ordered = sorted(rows, key=lambda a: a["is_read"])
    return {
        "unread_count": sum(1 for a in rows if not a["is_read"]),
        "total": len(rows),
        "items": ordered[:ANNOUNCEMENT_LIMIT],
    }


def summarize_assignments(rows, now):
    items = []
    for a in rows:
        if a["submitted"]:
            continue
        due = datetime.strptime(a["due_at"], "%Y-%m-%d %H:%M")
        if due < now - timedelta(days=OVERDUE_VISIBLE_DAYS):
            continue
        hours_left = (due - now).total_seconds() / 3600
        items.append({
            "id": a["id"],
            "course_name": a["course_name"],
            "title": a["title"],
            "due_at": a["due_at"],
            "url": a.get("url") or "#",
            "source": a.get("source", "local"),
            "overdue": hours_left < 0,
            "hours_left": round(hours_left, 1),
        })
    return {
        "pending_count": len(items),
        "overdue_count": sum(1 for i in items if i["overdue"]),
        "due_within_48h": sum(1 for i in items if 0 <= i["hours_left"] <= 48),
        "items": items,
    }


def summarize_leave(rows):
    return {
        "pending_count": sum(1 for r in rows if r["status"] == "待審核"),
        "items": rows[:LEAVE_LIMIT],
    }


def build_dashboard(source, class_name, student_id, now):
    """組合儀表板資料；缺曠摘要沿用 attendance 模組，由呼叫端另外附上"""
    return {
        "now": now.strftime("%Y-%m-%d %H:%M"),
        "weekday": WEEKDAY_LABELS[now.isoweekday()],
        "schedule": summarize_schedule(source.list_schedule(class_name, student_id), now),
        "announcements": summarize_announcements(source.list_announcements(class_name, student_id)),
        "assignments": summarize_assignments(source.list_assignments(class_name, student_id), now),
        "leave": summarize_leave(source.list_leave_requests(student_id)),
    }
