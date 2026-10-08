def test_requires_login(client):
    assert client.get("/api/student/early-warning").status_code == 401
    assert client.get("/api/student/early-warning?student_id=S112001").status_code == 401


def test_student_sees_own_warning_from_credits(client, login):
    login("student1")
    # 帶別人的學號也只會看到自己的
    data = client.get("/api/student/early-warning?student_id=S112002").get_json()
    assert data["student"]["student_id"] == "S112001"
    # 示範資料：最近學期 112-2 只修程式設計(二) 且不及格
    assert data["semester"] == "112-2"
    assert data["failed_credits"] == data["current_credits"] > 0
    assert data["risk_level"] == "三二預警"
    assert [c["course_id"] for c in data["failed_courses"]] == ["CS102"]
    assert data["advisor_session"] == "建議預約晤談"
    assert data["counselling_office"]["advisor_name"] == "彭賓鈺 老師"


def test_student_without_failures_is_normal(client, login):
    login("student2")
    data = client.get("/api/student/early-warning").get_json()
    assert data["risk_level"] == "正常"
    assert data["failed_courses"] == [] and data["blocked_courses"] == []


def test_teacher_limited_to_advised_class(client, login):
    login("teacher1")
    assert client.get("/api/student/early-warning").status_code == 400
    assert client.get("/api/student/early-warning?student_id=S112001").status_code == 200
    # S112004 在資管四孝，不是 teacher1 的導師班
    assert client.get("/api/student/early-warning?student_id=S112004").status_code == 403


def test_staff_can_query_any_student(client, login):
    login("staff1")
    assert client.get("/api/student/early-warning?student_id=S112004").get_json()["student"]["student_id"] == "S112004"
    assert client.get("/api/student/early-warning?student_id=NOPE").status_code == 404


def test_consent_controls_parent_and_advisor_access(client, login):
    login("student1")
    res = client.post("/api/student/privacy-consent", json={"consent_parent": False, "consent_advisor": True})
    assert res.get_json()["settings"] == {"parent_alert_consent": 0, "advisor_alert_consent": 1}
    assert client.get("/api/student/early-warning").get_json()["consent_parent"] is False

    login("parent1")
    assert client.get("/api/student/early-warning").get_json()["status"] == "consent_restricted"
    # 家長不能替學生改授權
    assert client.post("/api/student/privacy-consent", json={"parent_alert_consent": 1}).status_code == 403

    login("student1")
    client.post("/api/student/privacy-consent", json={"parent_alert_consent": True, "advisor_alert_consent": False})
    login("teacher1")
    assert client.get("/api/student/early-warning?student_id=S112001").get_json()["status"] == "consent_restricted"

    login("parent1")
    assert client.get("/api/student/early-warning").get_json()["status"] == "success"

    login("student1")
    client.post("/api/student/privacy-consent", json={"parent_alert_consent": True, "advisor_alert_consent": True})


def test_privacy_consent_requires_student_login(client):
    assert client.post("/api/student/privacy-consent", json={"parent_alert_consent": 0}).status_code == 401


def test_teacher_class_summary_limited_to_own_class(client, login):
    login("teacher1")
    assert client.get("/api/teacher/class-summary").status_code == 200
    assert client.get("/api/teacher/class-summary?class_name=資管四孝").status_code == 403
