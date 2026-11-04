"""智慧重補修推薦：正常、衝堂、無課可選、多個班別、已在課表，以及通知資料與 API 權限"""
import pytest

import retake
from retake import logic

COURSES = {
    "CS102": {"course_id": "CS102", "course_name": "程式設計(一)", "credits": 3, "course_type": "專業必修", "is_required": 1},
    "CS201": {"course_id": "CS201", "course_name": "資料結構", "credits": 3, "course_type": "專業必修", "is_required": 1, "prerequisite_id": "CS102"},
    "GE102": {"course_id": "GE102", "course_name": "生命教育", "credits": 2, "course_type": "通識教育", "is_required": 0},
    "MA101": {"course_id": "MA101", "course_name": "微積分", "credits": 2, "course_type": "共同必修", "is_required": 1},
}


def row(class_name, weekday, start, end, course_name, student_id=None, teacher="老師"):
    return {"class_name": class_name, "student_id": student_id, "weekday": weekday,
            "period_start": start, "period_end": end, "course_name": course_name, "classroom": "A301", "teacher": teacher}


# 學生在「資管五忠」：週一 1-3、週二 3-5、週三 6-7 有課
MY_CLASS = [
    row("資管五忠", 1, 1, 3, "資料庫系統"),
    row("資管五忠", 2, 3, 5, "網頁設計"),
    row("資管五忠", 3, 6, 7, "班會"),
]


def failed(*course_ids):
    return [{"course_id": c, "semester": "113-1", "score": 50, "is_passed": 0} for c in course_ids]


def result_of(results, course_id):
    return next(r for r in results if r["course_id"] == course_id)


def test_needs_retake_ignores_courses_passed_later():
    records = failed("CS102", "GE102") + [{"course_id": "CS102", "semester": "114-1", "score": 70, "is_passed": 1}]
    items = logic.needs_retake(records, COURSES)
    assert [i["course_id"] for i in items] == ["GE102"]


def test_needs_retake_lists_blocked_courses():
    item = logic.needs_retake(failed("CS102"), COURSES)[0]
    assert item["course_name"] == "程式設計(一)" and item["blocks"] == ["資料結構"]


def test_normal_case_recommends_section_without_conflict():
    """正常：另一班週四開，不衝堂 → 有班別可選並標成推薦"""
    schedule = MY_CLASS + [row("資管五孝", 4, 2, 4, "程式設計(一)")]
    r = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")[0]
    assert r["status"] == logic.AVAILABLE
    sec = r["sections"][0]
    assert sec["class_name"] == "資管五孝" and sec["ok"] and sec["recommended"]
    assert sec["extra_days"] == 1  # 週四原本沒課
    assert "推薦 資管五孝" in r["message"]


def test_overlap_on_boundary_period_is_conflict():
    """第 3-5 節 與 第 5-6 節 撞在第 5 節"""
    a = {"weekday": 2, "period_start": 3, "period_end": 5}
    assert logic.overlaps(a, {"weekday": 2, "period_start": 5, "period_end": 6})
    assert not logic.overlaps(a, {"weekday": 2, "period_start": 6, "period_end": 7})
    assert not logic.overlaps(a, {"weekday": 3, "period_start": 3, "period_end": 5})


def test_all_sections_conflict():
    """衝堂：兩個班別都撞課 → 全部衝堂，並說明撞到哪門課"""
    schedule = MY_CLASS + [
        row("資管五孝", 1, 2, 3, "程式設計(一)"),   # 撞週一 資料庫系統
        row("資管四忠", 2, 5, 6, "程式設計(一)"),   # 撞週二第 5 節 網頁設計
    ]
    r = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")[0]
    assert r["status"] == logic.ALL_CONFLICT
    assert not any(s["ok"] or s["recommended"] for s in r["sections"])
    conflicts = {s["class_name"]: s["conflicts"] for s in r["sections"]}
    assert conflicts["資管五孝"][0]["course_name"] == "資料庫系統"
    assert conflicts["資管四忠"][0] == {"course_name": "網頁設計", "slot": "週二 第 3-5 節", "at": "週二 第 5 節"}
    assert "都跟你的課衝堂" in r["message"]


def test_section_conflicts_if_any_meeting_conflicts():
    """一個班別一週上兩天：只要其中一天衝堂，這個班別就不能選"""
    schedule = MY_CLASS + [row("資管五孝", 4, 1, 2, "程式設計(一)"), row("資管五孝", 2, 4, 4, "程式設計(一)")]
    sec = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")[0]["sections"][0]
    assert not sec["ok"] and len(sec["meetings"]) == 2 and sec["meetings"][0]["slot"] == "週二 第 4 節"


def test_self_study_time_is_free_but_school_assembly_is_not():
    """自習/班週會是空堂可以拿來重補修；週三下午校部週會、社團活動照樣算衝堂"""
    schedule = [
        row("資管五忠", 1, 3, 8, "自習/班週會"),
        row("資管五忠", 3, 5, 6, "校部週會"),
        row("資管五忠", 3, 7, 8, "社團活動"),
        row("資管五孝", 1, 5, 6, "程式設計(一)"),   # 在週一自習時段 → 可以修
        row("資管四忠", 3, 6, 7, "程式設計(一)"),   # 撞週三下午 → 衝堂
    ]
    r = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")[0]
    sections = {s["class_name"]: s for s in r["sections"]}
    assert r["status"] == logic.AVAILABLE and sections["資管五孝"]["recommended"]
    assert sections["資管五孝"]["ok"] and sections["資管五孝"]["extra_days"] == 0
    assert sections["資管五孝"]["uses_free_time"] == ["週一 第 5-6 節"]
    assert not sections["資管四忠"]["ok"]
    assert {c["course_name"] for c in sections["資管四忠"]["conflicts"]} == {"校部週會", "社團活動"}


def test_prerequisite_not_passed_blocks_retake():
    """先修科目沒過 → 擋修，不列班別，直接提醒 (而不是直接跳出推薦結果)"""
    schedule = MY_CLASS + [row("資管五孝", 4, 2, 4, "資料結構")]
    r = logic.recommend(logic.needs_retake(failed("CS201"), COURSES), schedule, "資管五忠", "S1",
                        courses=COURSES, passed_ids=set())[0]
    assert r["status"] == logic.PREREQ_BLOCKED
    assert r["sections"] == []
    assert "程式設計(一)" in r["message"]


def test_prerequisite_passed_allows_normal_recommendation():
    """先修科目已經過 → 不受擋修影響，照常比對班別"""
    schedule = MY_CLASS + [row("資管五孝", 4, 2, 4, "資料結構")]
    r = logic.recommend(logic.needs_retake(failed("CS201"), COURSES), schedule, "資管五忠", "S1",
                        courses=COURSES, passed_ids={"CS102"})[0]
    assert r["status"] == logic.AVAILABLE


def test_class_meeting_period_counts_as_free_time():
    """班會跟自習一樣算空堂，重補修班排在那個時段不算衝堂"""
    schedule = MY_CLASS + [row("資管五孝", 3, 6, 7, "程式設計(一)")]  # 撞到週三「班會」節次
    r = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")[0]
    assert r["status"] == logic.AVAILABLE
    assert r["sections"][0]["ok"]
    assert r["sections"][0]["uses_free_time"] == ["週三 第 6-7 節"]


def test_not_offered():
    """無課可選：這學期沒有任何班級開微積分"""
    r = logic.recommend(logic.needs_retake(failed("MA101"), COURSES), MY_CLASS, "資管五忠", "S1")[0]
    assert r["status"] == logic.NOT_OFFERED and r["sections"] == []
    assert "暑修" in r["message"]


def test_multiple_sections_ranked():
    """同科多個班別：不衝堂優先，再來是不用多到校的；衝堂的排最後"""
    schedule = MY_CLASS + [
        row("資管四忠", 1, 2, 2, "程式設計(一)"),   # 衝堂
        row("資管五孝", 5, 1, 2, "程式設計(一)"),   # 不衝堂，但要多跑週五
        row("資管三忠", 3, 1, 2, "程式設計(一)"),   # 不衝堂，週三本來就有課
    ]
    r = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")[0]
    assert [s["class_name"] for s in r["sections"]] == ["資管三忠", "資管五孝", "資管四忠"]
    assert [s["recommended"] for s in r["sections"]] == [True, False, False]
    assert "有 2 個班別不會跟你的課衝堂" in r["message"] and "另有 1 個班別會衝堂" in r["message"]


def test_already_in_timetable_by_personal_enrollment():
    """已加選重修 (個人課表有這門課) → 已在課表，不再列其他班別、也不通知"""
    schedule = MY_CLASS + [row(None, 4, 6, 7, "程式設計 (一)", student_id="S1"), row("資管五孝", 5, 1, 2, "程式設計(一)")]
    results = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")
    assert results[0]["status"] == logic.ARRANGED and results[0]["sections"] == []
    assert logic.build_notifications("S1", results) == []


def test_personal_courses_count_for_conflicts():
    """個人加選的其他課也算在既有課表裡"""
    schedule = MY_CLASS + [row(None, 4, 2, 3, "統計學", student_id="S1"), row("資管五孝", 4, 3, 4, "程式設計(一)")]
    r = logic.recommend(logic.needs_retake(failed("CS102"), COURSES), schedule, "資管五忠", "S1")[0]
    assert r["status"] == logic.ALL_CONFLICT and r["sections"][0]["conflicts"][0]["course_name"] == "統計學"


def test_results_sorted_by_urgency_and_notifications():
    schedule = MY_CLASS + [row("資管五孝", 1, 1, 1, "程式設計(一)"), row("資管五孝", 4, 1, 2, "生命教育")]
    results = logic.recommend(logic.needs_retake(failed("CS102", "GE102", "MA101"), COURSES), schedule, "資管五忠", "S1")
    assert [r["status"] for r in results] == [logic.ALL_CONFLICT, logic.AVAILABLE, logic.NOT_OFFERED]
    notes = logic.build_notifications("S1", results)
    assert [n["course_id"] for n in notes] == ["CS102", "GE102", "MA101"]
    assert notes[1] == {
        "student_id": "S1", "type": "retake", "key": "retake:S1:GE102:available", "course_id": "GE102",
        "course_name": "生命教育", "status": "available", "title": "重補修：生命教育 有班別可選",
        "body": results[1]["message"], "link": "/?retake=GE102#retake",
    }


# ---------- API (示範模式) ----------

def test_api_requires_student(client, login):
    assert client.get("/api/student/retake-recommendations").status_code == 401
    login("teacher1")
    assert client.get("/api/student/retake-recommendations").status_code == 403


def test_api_student_demo(client, login):
    """示範資料：王小明 程式設計(二) 沒過，已在個人課表加選重修"""
    login("student1")
    data = client.get("/api/student/retake-recommendations").get_json()
    assert data["student"]["student_id"] == "S112001"
    r = data["data"][0]
    assert r["course_id"] == "CS102" and r["status"] == "arranged"
    assert data["notifications"] == []
    # 畫面一進來先看自己現在的課表 (見 static/js/retake.js)
    assert isinstance(data["schedule"], list) and data["schedule"]


def test_api_uses_session_and_parent_can_view(client, login, monkeypatch):
    schedule = MY_CLASS + [row("資管五孝", 4, 2, 4, "程式設計(二)")]
    monkeypatch.setattr(retake.deps, "load_schedule", lambda: schedule)
    monkeypatch.setattr(retake.deps, "load_student", lambda sid: {"student_id": sid, "class_name": "資管五忠"})
    login("parent1")  # 家長綁定 S112001
    data = client.get("/api/student/retake-recommendations?student_id=S112005").get_json()
    assert data["student"]["student_id"] == "S112001"  # 學號一律取自 session，網址參數無效
    assert data["data"][0]["status"] == "available"
    assert data["notifications"][0]["link"] == "/?retake=CS102#retake"


def test_notifications_for_helper(monkeypatch):
    monkeypatch.setattr(retake.deps, "load_schedule", lambda: MY_CLASS)
    monkeypatch.setattr(retake.deps, "load_student", lambda sid: {"student_id": sid, "class_name": "資管五忠"} if sid == "S112001" else None)
    notes = retake.notifications_for("S112001")
    assert notes and notes[0]["status"] == "not_offered"
    assert retake.notifications_for("NOPE") == []
