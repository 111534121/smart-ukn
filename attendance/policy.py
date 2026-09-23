"""
缺曠課扣考判定規則 (與資料來源無關)

依《學生扣考與出勤規定》：一學期中某科曠課時數達該科授課總時數三分之一以上者，
該科目不得參加期末考試 (扣考)。遲到與病假不計入扣考時數，僅列出供學生參考。

假設 (學校規定若不同，調整下方常數即可)：
  - 每學期 18 週
  - 每門課每週授課時數 = 學分數；查不到課程時以 3 小時計
  - 每筆「曠課」紀錄代表缺席該課程一次 (一週的授課時數)
"""
from collections import OrderedDict

SEMESTER_WEEKS = 18
EXAM_BAN_RATIO = 1 / 3      # 曠課時數達授課總時數 1/3 即扣考
WARNING_RATIO = 2 / 3       # 達扣考門檻的 2/3 時提前警告
DEFAULT_WEEKLY_HOURS = 3


def _round(value):
    return int(value) if float(value).is_integer() else round(value, 1)


def summarize_attendance(records, weekly_hours_by_course):
    """
    records：AttendanceSource 回傳的紀錄列表
    weekly_hours_by_course：{課程名稱: 每週授課時數}
    回傳每科統計與整體狀態 (ok / warning / banned)
    """
    courses = OrderedDict()
    for r in sorted(records, key=lambda x: x["course_name"]):
        weekly_hours = weekly_hours_by_course.get(r["course_name"], DEFAULT_WEEKLY_HOURS)
        c = courses.setdefault(r["course_name"], {
            "course_name": r["course_name"],
            "weekly_hours": weekly_hours,
            "absent_count": 0,
            "late_count": 0,
            "sick_count": 0
        })
        if r["type"] == "曠課":
            c["absent_count"] += 1
        elif r["type"] == "遲到":
            c["late_count"] += 1
        elif r["type"] == "病假":
            c["sick_count"] += 1

    level_rank = {"ok": 0, "warning": 1, "banned": 2}
    overall = "ok"
    for c in courses.values():
        threshold = c["weekly_hours"] * SEMESTER_WEEKS * EXAM_BAN_RATIO
        absent_hours = c["absent_count"] * c["weekly_hours"]
        if absent_hours >= threshold:
            level = "banned"
        elif absent_hours >= threshold * WARNING_RATIO:
            level = "warning"
        else:
            level = "ok"
        c.update({
            "absent_hours": _round(absent_hours),
            "exam_ban_threshold_hours": _round(threshold),
            "remaining_hours": _round(max(0, threshold - absent_hours)),
            "level": level
        })
        if level_rank[level] > level_rank[overall]:
            overall = level

    return {
        "overall_level": overall,
        "totals": {
            "曠課": sum(c["absent_count"] for c in courses.values()),
            "遲到": sum(c["late_count"] for c in courses.values()),
            "病假": sum(c["sick_count"] for c in courses.values())
        },
        # 風險高的科目排前面
        "courses": sorted(courses.values(), key=lambda c: (-level_rank[c["level"]], -c["absent_hours"]))
    }
