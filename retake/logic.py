"""
智慧重補修推薦的比對邏輯 (純函式，不碰資料庫、Flask)：

1. needs_retake()      從歷年成績找出「沒過、之後也還沒補過」的科目
2. sections_of()       把當學期課表 (class_schedule) 依「班級 + 課名」組成可選的班別；
                       一門課可能一週上兩天，所以一個班別有多個上課時段
3. find_conflicts()    班別的每個時段跟學生既有課表比對：同一天、節次有重疊就是衝堂
4. recommend()         每一科判斷狀態並排序班別，產生學生看得懂的說明

課表沒有課程代碼，只有課名，所以用 normalize_name() 統一全形/半形括號與空白後比對。
"""
import re

WEEKDAYS = ["", "一", "二", "三", "四", "五", "六", "日"]

# 每一科的狀態
PREREQ_BLOCKED = "prereq_blocked"  # 先修科目還沒通過，目前擋修、無法加選這科
ARRANGED = "arranged"          # 已經在學生課表裡 (已加選重補修或本班這學期就有開)
AVAILABLE = "available"        # 有不衝堂的班別可選
ALL_CONFLICT = "all_conflict"  # 有開課，但每個班別都衝堂
NOT_OFFERED = "not_offered"    # 這學期沒有開課

STATUS_LABELS = {
    PREREQ_BLOCKED: "先修科目未通過，目前擋修",
    ARRANGED: "已在你的課表",
    AVAILABLE: "有班別可選",
    ALL_CONFLICT: "全部衝堂",
    NOT_OFFERED: "本學期未開課",
}
# 排序：需要學生處理的放前面；擋修最優先提醒，不然學生選了也修不到
STATUS_ORDER = {PREREQ_BLOCKED: 0, ALL_CONFLICT: 1, AVAILABLE: 2, NOT_OFFERED: 3, ARRANGED: 4}


def normalize_name(name):
    """「程式設計 (一)」與「程式設計(一)」視為同一門課"""
    text = str(name or "").replace("（", "(").replace("）", ")")
    return re.sub(r"\s+", "", text)


def slot_text(weekday, start, end):
    periods = f"{start}" if start == end else f"{start}-{end}"
    return f"週{WEEKDAYS[weekday]} 第 {periods} 節"


# 同一科修過多次時，只要有一次及格就算通過
def passed_course_ids(credit_records):
    return {r["course_id"] for r in credit_records if r.get("is_passed")}


# 【功能：重補修推薦】步驟 1：從歷年成績找出沒過、之後也沒補過的科目
def needs_retake(credit_records, courses):
    """歷年成績 → 需要重補修的科目清單。

    同一科修過多次時，只要有一次及格就算通過；都沒過的才需要重補修，成績取最近一次。
    courses 是課程地圖 (course_id → 課程資料)，用來帶出課名、學分、必選修。
    """
    passed, latest = passed_course_ids(credit_records), {}
    for r in sorted(credit_records, key=lambda r: str(r.get("semester") or "")):
        latest[r["course_id"]] = r
    result = []
    for course_id, r in latest.items():
        if course_id in passed:
            continue
        c = courses.get(course_id) or {}
        result.append({
            "course_id": course_id,
            "course_name": c.get("course_name") or course_id,
            "credits": c.get("credits"),
            "course_type": c.get("course_type", ""),
            "is_required": bool(c.get("is_required")),
            "failed_semester": r.get("semester"),
            "score": r.get("score"),
            # 這科沒過會擋到哪些課 (課程地圖的先修設定)
            "blocks": sorted(x.get("course_name", "") for x in courses.values() if x.get("prerequisite_id") == course_id),
        })
    return result


# 課表上「自習/班會」是空堂，可以拿來重補修；校部週會、社團活動 (週三下午) 不行
FREE_TIME_KEYWORDS = ("自習", "班會")


# 【功能：重補修推薦】課表上的「自習/班會」算空堂，可以拿來重補修 (週三下午的校部週會、社團不算)
def is_free_time(row):
    return any(k in str(row.get("course_name") or "") for k in FREE_TIME_KEYWORDS)


def my_schedule(schedule_rows, class_name, student_id):
    """學生既有課表 = 本班的課 + 個人加選 (重補修) 的課"""
    return [r for r in schedule_rows
            if (class_name and r.get("class_name") == class_name) or (student_id and r.get("student_id") == student_id)]


# 【功能：重補修推薦】步驟 2：本學期還有哪些班開同一門課 (課名統一全形半形後比對)
def sections_of(schedule_rows, course_name):
    """當學期所有開這門課的班別：{班級: [時段, ...]}；個人加選的列不算開課班別"""
    key = normalize_name(course_name)
    sections = {}
    for r in schedule_rows:
        if r.get("class_name") and normalize_name(r.get("course_name")) == key:
            sections.setdefault(r["class_name"], []).append(r)
    return sections


# 【功能：重補修推薦】兩個時段同一天且節次有交集 = 衝堂
def overlaps(a, b):
    """同一天、節次範圍有交集 (例如 第 3-5 節 與 第 5-6 節 撞在第 5 節)"""
    return a["weekday"] == b["weekday"] and a["period_start"] <= b["period_end"] and b["period_start"] <= a["period_end"]


# 【功能：重補修推薦】步驟 3：班別每個時段和學生自己的課表逐一比對，列出撞到哪門課
def find_conflicts(meetings, schedule):
    """班別的每個時段跟既有課表比對，回傳撞到的課 (同一門課只列一次)"""
    hits = []
    for m in meetings:
        for s in schedule:
            if overlaps(m, s):
                hits.append({"course_name": s["course_name"],
                             "slot": slot_text(s["weekday"], s["period_start"], s["period_end"]),
                             "at": slot_text(m["weekday"], max(m["period_start"], s["period_start"]), min(m["period_end"], s["period_end"]))})
    unique = {}
    for h in hits:
        unique.setdefault((h["course_name"], h["slot"]), h)
    return list(unique.values())


def describe_section(class_name, meetings, schedule):
    """schedule 含自習時段：自習不算衝堂，但那天本來就要到校"""
    meetings = sorted(meetings, key=lambda m: (m["weekday"], m["period_start"]))
    conflicts = find_conflicts(meetings, [s for s in schedule if not is_free_time(s)])
    free = [s for s in schedule if is_free_time(s)]
    my_days = {s["weekday"] for s in schedule}
    return {
        "class_name": class_name,
        "teacher": "、".join(dict.fromkeys(m.get("teacher") or "" for m in meetings if m.get("teacher"))),
        "classroom": "、".join(dict.fromkeys(m.get("classroom") or "" for m in meetings if m.get("classroom"))),
        "meetings": [{"weekday": m["weekday"], "period_start": m["period_start"], "period_end": m["period_end"],
                      "slot": slot_text(m["weekday"], m["period_start"], m["period_end"])} for m in meetings],
        "conflicts": conflicts,
        "ok": not conflicts,
        # 用到自己班自習時段的節次 (不算衝堂，提醒學生那節去修課)
        "uses_free_time": [slot_text(m["weekday"], max(m["period_start"], s["period_start"]), min(m["period_end"], s["period_end"]))
                           for m in meetings for s in free if overlaps(m, s)],
        # 要多到校幾天 (那天原本沒課)：越少越好，用來在不衝堂的班別中排推薦順序
        "extra_days": len({m["weekday"] for m in meetings} - my_days),
        "recommended": False,
    }


# 【功能：重補修推薦】步驟 4：決定狀態 (擋修 / 已在課表 / 有班可選 / 全部衝堂 / 未開課)，不衝堂、不用多到校的班排前面
def recommend(failed, schedule_rows, class_name, student_id, courses=None, passed_ids=None):
    """每一科重補修的推薦結果。

    - 先修科目未通過 (擋修)：這門課規定要先修過的科目還沒過，不會列出班別，要先提醒處理
    - 已在課表：本班這學期就有開，或學生已加選 (個人課表有這門課)
    - 有班別可選：列出所有班別，不衝堂的排前面，第一個標成推薦
    - 全部衝堂：列出每個班別撞到哪門課
    - 本學期未開課：提醒下學期或暑修
    """
    courses = courses or {}
    passed_ids = passed_ids or set()
    schedule = my_schedule(schedule_rows, class_name, student_id)
    results = []
    for course in failed:
        key = normalize_name(course["course_name"])
        mine = [s for s in schedule if normalize_name(s["course_name"]) == key]
        others = [s for s in schedule if normalize_name(s["course_name"]) != key]
        sections = [describe_section(cls, meetings, others)
                    for cls, meetings in sections_of(schedule_rows, course["course_name"]).items()
                    if cls != class_name]
        # 不衝堂的優先，再來是不用多到校的天數少的，最後依星期、節次
        sections.sort(key=lambda s: (not s["ok"], s["extra_days"], s["meetings"][0]["weekday"], s["meetings"][0]["period_start"]))

        pre_id = (courses.get(course["course_id"]) or {}).get("prerequisite_id")
        blocked = bool(pre_id) and pre_id not in passed_ids

        if mine:
            status = ARRANGED
            sections = []  # 已經在修，不再列其他班別
            where = "、".join(slot_text(s["weekday"], s["period_start"], s["period_end"]) for s in sorted(mine, key=lambda s: (s["weekday"], s["period_start"])))
            message = f"這門課已經在你本學期的課表裡 ({where})，記得按時上課。"
        elif blocked:
            status = PREREQ_BLOCKED
            sections = []  # 還沒解除擋修，列班別也選不了
            pre_course = courses.get(pre_id) or {}
            pre_name = (courses.get(course["course_id"]) or {}).get("prerequisite_name") or pre_course.get("course_name") or pre_id
            message = f"⚠️ 這門課規定要先修過「{pre_name}」，你還沒通過，目前擋修、無法加選重補修班。請先處理先修科目，或洽課務組確認能不能專案加選。"
        elif not sections:
            status = NOT_OFFERED
            message = "這學期沒有任何班級開這門課。可以留意下學期開課、暑修，或洽課務組詢問其他修課方式。"
        elif any(s["ok"] for s in sections):
            status = AVAILABLE
            sections[0]["recommended"] = True
            ok_count = sum(s["ok"] for s in sections)
            best = sections[0]
            message = (f"有 {ok_count} 個班別不會跟你的課衝堂，推薦 {best['class_name']} "
                       f"({'、'.join(m['slot'] for m in best['meetings'])})"
                       + ("，那天你本來就有課，不用多跑一趟。" if best["extra_days"] == 0 else "。"))
            if ok_count < len(sections):
                message += f"另有 {len(sections) - ok_count} 個班別會衝堂。"
        else:
            status = ALL_CONFLICT
            message = (f"這學期有 {len(sections)} 個班別開課，但都跟你的課衝堂。"
                       "可以洽課務組詢問衝堂加選，或改在暑修、下學期修。")
        results.append({**course, "status": status, "status_label": STATUS_LABELS[status],
                         "message": message, "sections": sections})
    results.sort(key=lambda r: (STATUS_ORDER[r["status"]], not r["is_required"], r["course_name"]))
    return results


def build_notifications(student_id, results):
    """給通知中心用的資料：每一科一則，點進去開到重補修推薦分頁並捲到那門課。

    已在課表的科目不通知；link 由前端 retake.js 解析 (?retake=課程代碼#retake)。
    """
    titles = {
        PREREQ_BLOCKED: "重補修：{name} 先修科目未通過，目前擋修",
        AVAILABLE: "重補修：{name} 有班別可選",
        ALL_CONFLICT: "重補修：{name} 本學期班別都衝堂",
        NOT_OFFERED: "重補修：{name} 本學期未開課",
    }
    notes = []
    for r in results:
        if r["status"] not in titles:
            continue
        notes.append({
            "student_id": student_id,
            "type": "retake",
            "key": f"retake:{student_id}:{r['course_id']}:{r['status']}",
            "course_id": r["course_id"],
            "course_name": r["course_name"],
            "status": r["status"],
            "title": titles[r["status"]].format(name=r["course_name"]),
            "body": r["message"],
            "link": f"/?retake={r['course_id']}#retake",
        })
    return notes
