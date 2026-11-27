"""選課規劃檢查：學分夠不夠 (五專畢業 220 學分) 與撞修 (上課時間衝突、重複修習、先修未過)。

開課時段 (COURSE_OFFERINGS) 為示範資料，正式上線時改接教務系統的開課資料。
"""
from flask import Blueprint, request

from .common import deps, error, ok, current_user, require, store, now_str

bp = Blueprint("campus_courses", __name__)

WEEKDAYS = ["", "一", "二", "三", "四", "五", "六", "日"]

# 每學期修課學分上下限：資管科修業科目表「教務相關規定」五專 4-5 年級為 12-28 學分 (1-3 年級為 20-32 學分)
SEMESTER_MIN_CREDITS = 12
SEMESTER_MAX_CREDITS = 28
SEMESTERS_TOTAL = 10  # 五專共 10 學期

# 下學期 (115-2) 開課時段 (示範)：同一門課可能有多個班別。
# 只列資管科修業科目表排在「下學期」的課；時段、老師、教室為示範值
COURSE_OFFERINGS = [
    {"offering_id": "CS102-A", "course_id": "CS102", "weekday": 1, "period_start": 6, "period_end": 8, "teacher": "朱錦文", "classroom": "A303"},
    {"offering_id": "CS102-B", "course_id": "CS102", "weekday": 4, "period_start": 6, "period_end": 8, "teacher": "朱錦文", "classroom": "A303"},
    {"offering_id": "CS301-A", "course_id": "CS301", "weekday": 3, "period_start": 6, "period_end": 8, "teacher": "謝樹明", "classroom": "A302"},
    {"offering_id": "CS302-A", "course_id": "CS302", "weekday": 3, "period_start": 3, "period_end": 5, "teacher": "彭賓鈺", "classroom": "A402"},
    {"offering_id": "CS303-A", "course_id": "CS303", "weekday": 2, "period_start": 4, "period_end": 6, "teacher": "嚴竹華", "classroom": "A305 電腦教室"},
    {"offering_id": "CS304-A", "course_id": "CS304", "weekday": 5, "period_start": 1, "period_end": 3, "teacher": "嚴竹華", "classroom": "A305 電腦教室"},
    {"offering_id": "CS401-A", "course_id": "CS401", "weekday": 5, "period_start": 6, "period_end": 7, "teacher": "彭賓鈺", "classroom": "A301"},
    {"offering_id": "EN102-A", "course_id": "EN102", "weekday": 2, "period_start": 1, "period_end": 2, "teacher": "李智偉", "classroom": "L201"},
    {"offering_id": "EN102-B", "course_id": "EN102", "weekday": 3, "period_start": 3, "period_end": 4, "teacher": "李智偉", "classroom": "L202"},
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
    """開課清單；登入學生 / 家長每門課帶 blocked (已及格、擋修的原因)，前端標紅色並不能勾選。
    未登入時 blocked 一律 None，passed_course_ids 由前端依使用者勾的「已通過的課」自己判斷"""
    passed, _, from_record = student_passed_ids()
    data = [{**o, "blocked": block_reason(o, passed) if from_record else None} for o in offerings_with_course()]
    return ok(data=data, min_credits=SEMESTER_MIN_CREDITS, max_credits=SEMESTER_MAX_CREDITS,
              passed_course_ids=sorted(passed) if from_record else None)


# ---------- 儲存選課 (學生本人)：存在 data/campus_store.json 的 course_plans，不用改資料庫 ----------
# {學號: {"offering_ids": [...], "saved_at": "YYYY-MM-DD HH:MM"}}

@bp.route("/api/campus/course-plan/mine", methods=["GET"])
@require("學生", "家長")
def my_plan():
    """學生自己、家長看子女儲存過的選課；沒存過回傳 offering_ids = None"""
    saved = store.section("course_plans", dict).get(current_user()["student_id"])
    return ok(offering_ids=(saved or {}).get("offering_ids"), saved_at=(saved or {}).get("saved_at"))


@bp.route("/api/campus/course-plan/mine", methods=["PUT"])
@require("學生")
def save_my_plan():
    """儲存前再檢查一次：有擋修、已及格、衝堂、同一門課兩班、超過學分上限就不給存"""
    ids = [str(x) for x in (request.get_json(silent=True) or {}).get("offering_ids") or []]
    if not ids:
        return error("請至少選擇一門課")
    passed, failed, _ = student_passed_ids()
    result, message = evaluate_plan(ids, passed, failed)
    if message:
        return error(message)
    errors = [i for i in result["issues"] if i["level"] == "error"]
    if errors:
        return error("還有問題沒解決，不能儲存：" + "；".join(i["message"] for i in errors))
    sid = current_user()["student_id"]
    saved = {"offering_ids": [o["offering_id"] for o in result["chosen"]], "saved_at": now_str()[:16]}
    with store.lock:
        store.section("course_plans", dict)[sid] = saved
        store.save()
    credits = result["credits"]["selected_total"]
    return ok(message=f"選課已選填成功！共 {len(saved['offering_ids'])} 門、{credits} 學分", **saved)


def block_reason(o, passed):
    """這門課現在能不能選：已及格、先修未過 (擋修) 回傳原因，可以選回傳 None"""
    if o["course_id"] in passed:
        return f"已經及格，不用再修"
    pre = o.get("prerequisite_id")
    if pre and pre not in passed:
        return f"擋修：需先通過「{o.get('prerequisite_name') or pre}」"
    return None


@bp.route("/api/campus/course-plan/check", methods=["POST"])
def check_plan():
    """檢查選課清單。登入學生自動帶入已修成績；未登入可傳 passed_course_ids 模擬。"""
    data = request.get_json(silent=True) or {}
    chosen_ids = [str(x) for x in data.get("offering_ids", [])]
    if not chosen_ids:
        return error("請至少選擇一門課")
    passed, failed, from_record = student_passed_ids()
    if passed is None:
        passed = {str(x) for x in data.get("passed_course_ids", [])}
    result, message = evaluate_plan(chosen_ids, passed, failed)
    if message:
        return error(message)
    return ok(from_record=from_record, **result)


def evaluate_plan(chosen_ids, passed, failed):
    """回傳 (檢查結果, None) 或 (None, 錯誤訊息)；check 與儲存共用"""
    by_id = {o["offering_id"]: o for o in offerings_with_course()}
    unknown = [i for i in chosen_ids if i not in by_id]
    if unknown:
        return None, f"找不到開課代碼：{', '.join(unknown)}"
    chosen = [by_id[i] for i in dict.fromkeys(chosen_ids)]

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

    return dict(
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
    ), None
