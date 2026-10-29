"""T13 班級出缺勤一覽

示範資料 (app.py DEMO_ATTENDANCE_RECORDS)：資管五忠的 S112001 王小明「程式設計(二)」曠課 4 次，風險最高；
teacher1 = 資管五忠班導；staff1 = 教職員 (可切換班級)
"""


def test_homeroom_teacher_sees_own_class_sorted_by_risk(client, login):
    login("teacher1")
    res = client.get("/api/teacher/class-attendance")
    assert res.status_code == 200, res.get_json()
    data = res.get_json()
    assert data["class_name"] == "資管五忠" and data["classes"] == ["資管五忠"]
    first = data["students"][0]
    assert first["student_id"] == "S112001" and first["totals"]["曠課"] == 4
    assert first["level"] in ("warning", "banned") and first["risk_courses"][0]["course_name"] == "程式設計(二)"
    assert data["summary"]["absent_total"] >= 4
    # 依風險排序：後面的人風險不會比前面高
    rank = {"ok": 0, "warning": 1, "banned": 2}
    levels = [rank[s["level"]] for s in data["students"]]
    assert levels == sorted(levels, reverse=True)


def test_homeroom_teacher_cannot_see_other_class(client, login):
    login("teacher1")
    assert client.get("/api/teacher/class-attendance?class_name=資管四孝").status_code == 403


def test_staff_can_switch_class(client, login):
    login("staff1")
    data = client.get("/api/teacher/class-attendance?class_name=資管四孝").get_json()
    assert data["class_name"] == "資管四孝" and "資管五忠" in data["classes"]
    assert {s["student_id"] for s in data["students"]} == {"S112004"}


def test_students_and_parents_blocked(client, login):
    for user in ("student1", "parent1"):
        login(user)
        assert client.get("/api/teacher/class-attendance").status_code == 403
