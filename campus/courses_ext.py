"""選課規劃檢查：學分夠不夠 (五專畢業 220 學分) 與撞修 (上課時間衝突、重複修習、先修未過)。

開課時段 (COURSE_OFFERINGS) 為示範資料，正式上線時改接教務系統的開課資料。
"""
from flask import Blueprint, request

from .common import deps, error, ok, current_user

bp = Blueprint("campus_courses", __name__)

WEEKDAYS = ["", "一", "二", "三", "四", "五", "六", "日"]

# 每學期修課學分上下限：資管科修業科目表「教務相關規定」五專 4-5 年級為 12-28 學分 (1-3 年級為 20-32 學分)
SEMESTER_MIN_CREDITS = 12
SEMESTER_MAX_CREDITS = 28
SEMESTERS_TOTAL = 10  # 五專共 10 學期

# 下學期 (115-2) 開課時段 (示範)：同一門課可能有多個班別。
# 只列資管科修業科目表排在「下學期」的課；時段、老師、教室為示範值
COURSE_OFFERINGS = [
    {"offering_id": "CS102-A", "course_id": "CS102", "weekday": 1, "period_start": 6, "period_end": 8, "teacher": "張文華", "classroom": "A303"},
    {"offering_id": "CS102-B", "course_id": "CS102", "weekday": 4, "period_start": 6, "period_end": 8, "teacher": "張文華", "classroom": "A303"},
    {"offering_id": "CS301-A", "course_id": "CS301", "weekday": 3, "period_start": 6, "period_end": 8, "teacher": "林志明", "classroom": "A302"},
    {"offering_id": "CS302-A", "course_id": "CS302", "weekday": 3, "period_start": 3, "period_end": 5, "teacher": "彭賓鈺", "classroom": "A402"},
    {"offering_id": "CS303-A", "course_id": "CS303", "weekday": 2, "period_start": 4, "period_end": 6, "teacher": "吳建宏", "classroom": "A305 電腦教室"},
    {"offering_id": "CS304-A", "course_id": "CS304", "weekday": 5, "period_start": 1, "period_end": 3, "teacher": "吳建宏", "classroom": "A305 電腦教室"},
    {"offering_id": "CS401-A", "course_id": "CS401", "weekday": 5, "period_start": 6, "period_end": 7, "teacher": "彭賓鈺", "classroom": "A301"},
    {"offering_id": "EN102-A", "course_id": "EN102", "weekday": 2, "period_start": 1, "period_end": 2, "teacher": "Amy Chen", "classroom": "L201"},
    {"offering_id": "EN102-B", "course_id": "EN102", "weekday": 3, "period_start": 3, "period_end": 4, "teacher": "Amy Chen", "classroom": "L202"},
]


def slot_text(o):
    p = f"{o['period_start']}" if o["period_start"] == o["period_end"] else f"{o['period_start']}-{o['period_end']}"
    return f"週{WEEKDAYS[o['weekday']]} 第 {p} 節"


def offerings_with_course():
    courses = {c["course_id"]: c for c in deps.load_course_map()}
    result = []
    for o in COURSE_OFFERINGS:
        c = courses.get(o["course_id"])
        if not c:
            continue
        result.append({**o, "course_name": c["course_name"], "credits": c["credits"],
                       "course_type": c.get("course_type", ""), "is_required": c.get("is_required", 0),
                       "prerequisite_id": c.get("prerequisite_id"), "prerequisite_name": c.get("prerequisite_name"),
                       "slot": slot_text(o)})
    return result


def student_passed_ids():
    u = current_user()
    if u and u["role"] in ("學生", "家長") and u["student_id"]:
        passed, failed, _ = deps.summarize_credits(deps.load_student_credits(u["student_id"]))
        return passed, failed, True
    return None, set(), False


@bp.route("/api/campus/course-plan/offerings", methods=["GET"])
def list_offerings():
    return ok(data=offerings_with_course(), min_credits=SEMESTER_MIN_CREDITS, max_credits=SEMESTER_MAX_CREDITS)


@bp.route("/api/campus/course-plan/check", methods=["POST"])
def check_plan():
    """檢查選課清單。登入學生自動帶入已修成績；未登入可傳 passed_course_ids 模擬。"""
    data = request.get_json(silent=True) or {}
    chosen_ids = [str(x) for x in data.get("offering_ids", [])]
    if not chosen_ids:
        return error("請至少選擇一門課")
    by_id = {o["offering_id"]: o for o in offerings_with_course()}
    unknown = [i for i in chosen_ids if i not in by_id]
    if unknown:
        return error(f"找不到開課代碼：{', '.join(unknown)}")
    chosen = [by_id[i] for i in dict.fromkeys(chosen_ids)]

    passed, failed, from_record = student_passed_ids()
    if passed is None:
        passed = {str(x) for x in data.get("passed_course_ids", [])}

    issues = []
    # 1. 上課時間衝突 (同一天節次重疊)
    for i, a in enumerate(chosen):
        for b in chosen[i + 1:]:
            if a["weekday"] == b["weekday"] and a["period_start"] <= b["period_end"] and b["period_start"] <= a["period_end"]:
                issues.append({"type": "time_conflict", "level": "error", "offering_ids": [a["offering_id"], b["offering_id"]],
                               "message": f"衝堂：{a['course_name']}（{a['slot']}）與 {b['course_name']}（{b['slot']}）時間重疊"})
    # 2. 同一門課選了兩個班
    seen = {}
    for o in chosen:
        if o["course_id"] in seen:
            issues.append({"type": "duplicate_course", "level": "error", "offering_ids": [seen[o["course_id"]], o["offering_id"]],
                           "message": f"重複選課：{o['course_name']} 選了兩個班別，只能保留一班"})
        seen[o["course_id"]] = o["offering_id"]
    # 3. 已經修過且及格 (重複修習學分不採計)
    for o in chosen:
        if o["course_id"] in passed:
            issues.append({"type": "already_passed", "level": "error", "offering_ids": [o["offering_id"]],
                           "message": f"重複修習：{o['course_name']} 已經及格，再修學分不列入畢業學分"})
    # 4. 先修未通過 (擋修)
    for o in chosen:
        pre = o.get("prerequisite_id")
        if pre and pre not in passed and not any(c["course_id"] == pre for c in chosen):
            issues.append({"type": "prerequisite", "level": "error", "offering_ids": [o["offering_id"]],
                           "message": f"擋修：{o['course_name']} 需先通過「{o.get('prerequisite_name') or pre}」"})
        elif pre and pre not in passed:
            issues.append({"type": "prerequisite_same_term", "level": "warn", "offering_ids": [o["offering_id"]],
                           "message": f"{o['course_name']} 的先修課「{o.get('prerequisite_name') or pre}」和它排在同一學期，需先修課及格才可修，請與導師確認"})
    # 5. 重修提醒 (不及格的課有選到是好事)
    retake = [o for o in chosen if o["course_id"] in failed]

    counted = {o["offering_id"] for o in chosen if o["course_id"] not in passed}
    unique_counted = {}
    for o in chosen:
        if o["offering_id"] in counted:
            unique_counted.setdefault(o["course_id"], o)
    planned_credits = sum(o["credits"] for o in unique_counted.values())
    total_selected = sum(o["credits"] for o in chosen)

    if planned_credits < SEMESTER_MIN_CREDITS:
        issues.append({"type": "under_min", "level": "warn", "offering_ids": [],
                       "message": f"本學期可採計 {planned_credits} 學分，低於下限 {SEMESTER_MIN_CREDITS} 學分"})
    if total_selected > SEMESTER_MAX_CREDITS:
        issues.append({"type": "over_max", "level": "error", "offering_ids": [],
                       "message": f"選課共 {total_selected} 學分，超過上限 {SEMESTER_MAX_CREDITS} 學分"})

    threshold = deps.graduation_threshold
    all_courses = {c["course_id"]: c for c in deps.load_course_map()}
    earned = sum(all_courses[c]["credits"] for c in passed if c in all_courses)
    projected = earned + planned_credits
    remaining = max(0, threshold - projected)

    # 評分：以畢業 220 學分為 100 分，加上本學期選課健康度
    progress_score = round(min(100, projected / threshold * 100), 1)
    errors = [i for i in issues if i["level"] == "error"]
    grade = "可以送出" if not errors else "需要調整"

    return ok(
        from_record=from_record,
        chosen=chosen,
        issues=issues,
        retake=[{"offering_id": o["offering_id"], "course_name": o["course_name"]} for o in retake],
        credits={
            "threshold": threshold,
            "earned": earned,
            "planned": planned_credits,
            "selected_total": total_selected,
            "projected": projected,
            "remaining": remaining,
            "progress_score": progress_score,
            "enough": projected >= threshold,
            "min": SEMESTER_MIN_CREDITS,
            "max": SEMESTER_MAX_CREDITS,
            # 以目前規劃的學分數推估還要幾個學期
            "semesters_needed": (-(-remaining // planned_credits) if planned_credits else None) if remaining else 0,
        },
        verdict=grade,
        timetable=[{"offering_id": o["offering_id"], "course_name": o["course_name"], "weekday": o["weekday"],
                    "period_start": o["period_start"], "period_end": o["period_end"], "classroom": o["classroom"],
                    "conflict": any(o["offering_id"] in i["offering_ids"] and i["type"] == "time_conflict" for i in issues)}
                   for o in chosen],
    )
