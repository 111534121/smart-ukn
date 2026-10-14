"""
從 Moodle 抓作業 (mod_assign) 與繳交狀態，轉成儀表板 assignments 的格式，並併入儀表板資料來源。

同一位學生 CACHE_SECONDS 內重複開儀表板直接用快取，避免每次都打 Moodle。
"""
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta

from dashboard.sources import DashboardSource
from .client import MoodleClient, MoodleError

CACHE_SECONDS = 180
# 截止超過這麼多天的作業不再查繳交狀態 (儀表板也只顯示逾期 7 天內的)
PAST_DUE_DAYS = 8
STATUS_WORKERS = 6

_cache = {}
_cache_lock = threading.Lock()


def short_course_name(fullname):
    """康寧 Moodle 課程全名「1151_統計學-五專資訊管理科-2年A班-彭賓鈺」只取課名「統計學」"""
    m = re.match(r"^\d{3,4}_(.+?)-", fullname or "")
    return m.group(1) if m else (fullname or "")


def _is_submitted(status):
    """繳交狀態：已送出，或老師已評分 (紙本/離線作業) 都視為完成；草稿不算"""
    attempt = status.get("lastattempt") or {}
    submission = attempt.get("submission") or attempt.get("teamsubmission") or {}
    return submission.get("status") == "submitted" or attempt.get("gradingstatus") == "graded"


def fetch_assignments(client, now):
    """回傳 [{id, course_name, title, due_at, url, submitted, source}]；有截止日且未過期太久的作業才列入"""
    data = client.call("mod_assign_get_assignments")
    since = (now - timedelta(days=PAST_DUE_DAYS)).timestamp()
    items = []
    for course in data.get("courses", []):
        for a in course.get("assignments", []):
            if not a.get("duedate") or a["duedate"] < since:
                continue
            items.append({
                "assign_id": a["id"],
                "id": f"moodle-{a['id']}",
                "class_name": None,
                "student_id": None,
                "course_name": short_course_name(course.get("fullname") or course.get("shortname")),
                "title": a.get("name", ""),
                "due_at": datetime.fromtimestamp(a["duedate"]).strftime("%Y-%m-%d %H:%M"),
                "url": f"{client.base_url}/mod/assign/view.php?id={a['cmid']}" if a.get("cmid") else "#",
                "source": "moodle",
            })

    def status_of(item):
        return _is_submitted(client.call("mod_assign_get_submission_status", assignid=item["assign_id"]))

    with ThreadPoolExecutor(max_workers=STATUS_WORKERS) as pool:
        for item, submitted in zip(items, pool.map(status_of, items)):
            item["submitted"] = submitted
            del item["assign_id"]
    return sorted(items, key=lambda i: i["due_at"])


def get_cached_assignments(student_id, base_url, token, now, force=False):
    """回傳 (items, synced_at, error)；Moodle 暫時連不上時沿用上次成功的資料並附上錯誤訊息"""
    with _cache_lock:
        cached = _cache.get(student_id)
    if cached and not force and time.time() - cached["at"] < CACHE_SECONDS and not cached["error"]:
        return cached["items"], cached["synced_at"], None
    try:
        items = fetch_assignments(MoodleClient(base_url, token), now)
        entry = {"items": items, "synced_at": datetime.now().strftime("%Y-%m-%d %H:%M"), "error": None, "at": time.time()}
    except MoodleError as e:
        previous = cached or {"items": [], "synced_at": None}
        entry = {"items": previous["items"], "synced_at": previous["synced_at"], "error": e, "at": time.time()}
    with _cache_lock:
        _cache[student_id] = entry
    return entry["items"], entry["synced_at"], entry["error"]


def clear_cache(student_id):
    with _cache_lock:
        _cache.pop(student_id, None)


class MoodleMergedSource(DashboardSource):
    """在原本的儀表板資料來源上，把 Moodle 作業併入 list_assignments，其他資料照舊"""

    def __init__(self, base, moodle_items):
        self._base = base
        self._moodle_items = moodle_items
        self.name = base.name

    def list_schedule(self, class_name, student_id):
        return self._base.list_schedule(class_name, student_id)

    def list_announcements(self, class_name, student_id):
        return self._base.list_announcements(class_name, student_id)

    def mark_announcement_read(self, student_id, announcement_id):
        return self._base.mark_announcement_read(student_id, announcement_id)

    def list_assignments(self, class_name, student_id):
        rows = self._base.list_assignments(class_name, student_id) + self._moodle_items
        return sorted(rows, key=lambda r: r["due_at"])

    def list_leave_requests(self, student_id):
        return self._base.list_leave_requests(student_id)
