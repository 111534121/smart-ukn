"""T17 學生個人總覽：teacher1 = 資管五忠班導；staff1 = 教職員
S112001、S112002 在資管五忠；S112004 在資管四孝"""

SECTIONS = {"student", "attendance", "study", "graduation", "leaves", "certificates", "counseling"}


def test_teacher_sees_own_student_profile(client, login):
    login("teacher1")
    res = client.get("/api/teacher/student-profile?student_id=S112001")
    assert res.status_code == 200, res.get_json()
    data = res.get_json()
    assert set(data) >= SECTIONS
    assert data["student"]["student_id"] == "S112001"
    assert data["student"]["class_name"] == "資管五忠"
    assert set(data["attendance"]["totals"]) >= {"曠課", "遲到", "病假"}
    assert data["graduation"]["credits_threshold"] > 0
    assert {"pending", "approved", "rejected", "data"} <= set(data["leaves"])
    assert {"approved", "pending", "data"} <= set(data["certificates"])


def test_profile_includes_new_counseling_record(client, login):
    login("teacher1")
    client.post("/api/campus/counseling", json={"student_id": "S112002", "content": "個人總覽測試", "follow_up": True})
    c = client.get("/api/teacher/student-profile?student_id=S112002").get_json()["counseling"]
    assert c["count"] >= 1 and c["pending"] >= 1
    assert any(r["content"] == "個人總覽測試" for r in c["data"])


def test_teacher_cannot_see_other_class_student(client, login):
    login("teacher1")
    assert client.get("/api/teacher/student-profile?student_id=S112004").status_code == 403


def test_staff_can_see_any_student(client, login):
    login("staff1")
    res = client.get("/api/teacher/student-profile?student_id=S112004")
    assert res.status_code == 200
    assert res.get_json()["student"]["class_name"] == "資管四孝"


def test_missing_or_unknown_student(client, login):
    login("teacher1")
    assert client.get("/api/teacher/student-profile").status_code == 400
    assert client.get("/api/teacher/student-profile?student_id=NOPE999").status_code == 404


def test_students_and_parents_blocked(client, login):
    for user in ("student1", "parent1"):
        login(user)
        assert client.get("/api/teacher/student-profile?student_id=S112001").status_code == 403


def test_study_warning_respects_privacy_consent(client, login):
    import app as app_module
    original = app_module.load_privacy_settings
    app_module.load_privacy_settings = lambda sid: {**original(sid), "advisor_alert_consent": False}
    try:
        login("teacher1")
        study = client.get("/api/teacher/student-profile?student_id=S112001").get_json()["study"]
        assert study["warning_level"] == "restricted" and "failed_courses" not in study
    finally:
        app_module.load_privacy_settings = original
