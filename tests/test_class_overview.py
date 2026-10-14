"""T16 我的導師班總覽：teacher1 = 資管五忠班導；staff1 = 教職員"""


def test_teacher_overview_lists_class_with_concerns_first(client, login):
    login("teacher1")
    res = client.get("/api/teacher/class-overview")
    assert res.status_code == 200, res.get_json()
    data = res.get_json()
    assert data["class_name"] == "資管五忠"
    ids = [s["student_id"] for s in data["students"]]
    assert "S112001" in ids and data["summary"]["student_count"] == len(ids)
    first = data["students"][0]
    assert first["attendance"]["level"] != "ok" or first["study"]["level"] in ("warning", "critical")
    for s in data["students"]:
        assert set(s) >= {"attendance", "study", "counseling"}


def test_overview_counts_counseling(client, login):
    login("teacher1")
    client.post("/api/campus/counseling", json={"student_id": "S112002", "content": "聊生涯規劃", "follow_up": True})
    data = client.get("/api/teacher/class-overview").get_json()
    me = next(s for s in data["students"] if s["student_id"] == "S112002")
    assert me["counseling"]["count"] == 1 and me["counseling"]["pending"] == 1
    assert data["summary"]["pending"] >= 1


def test_teacher_cannot_see_other_class_but_staff_can(client, login):
    login("teacher1")
    assert client.get("/api/teacher/class-overview?class_name=資管四孝").status_code == 403
    login("staff1")
    data = client.get("/api/teacher/class-overview?class_name=資管四孝").get_json()
    assert data["class_name"] == "資管四孝" and "資管五忠" in data["classes"]


def test_students_parents_blocked(client, login):
    for user in ("student1", "parent1"):
        login(user)
        assert client.get("/api/teacher/class-overview").status_code == 403
