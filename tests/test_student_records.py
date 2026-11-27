"""T18 獎懲與幹部 (示範模式資料見 campus/records.py)、seed_classes.py 產生的證照比賽與獎懲"""
from datetime import date


def test_student_sees_own_records(client, login):
    login("student1")
    res = client.get("/api/campus/records/mine")
    assert res.status_code == 200, res.get_json()
    data = res.get_json()
    assert data["data"] and all(r["student_id"] == "S112001" for r in data["data"])
    assert data["totals"]["嘉獎"] == 2 and data["totals"]["申誡"] == 1
    assert data["rewards"] == 2 and data["punishments"] == 1
    assert data["positions"] == ["班長"]


def test_parent_sees_child_records(client, login):
    login("parent1")
    data = client.get("/api/campus/records/mine").get_json()
    assert {r["student_id"] for r in data["data"]} == {"S112001"}


def test_staff_cannot_use_mine(client, login):
    for user in ("teacher1", "staff1"):
        login(user)
        assert client.get("/api/campus/records/mine").status_code == 403


def test_teacher_profile_includes_records(client, login):
    login("teacher1")
    rec = client.get("/api/teacher/student-profile?student_id=S112002").get_json()["records"]
    assert any(r["item"] == "課程小老師" for r in rec["data"])
    assert rec["totals"]["小功"] == 1


def test_demo_contests_and_works_show_in_profile(client, login):
    login("teacher1")
    certs = client.get("/api/teacher/student-profile?student_id=S112002").get_json()["certificates"]["data"]
    kinds = {c["kind"] for c in certs}
    assert {"競賽", "作品"} <= kinds


# ---------- seed_classes.py：不連資料庫，只檢查 plan() 產生的內容 ----------

def _plan():
    import seed_classes
    return seed_classes, seed_classes.plan({})


def test_seed_generates_all_kinds():
    _, data = _plan()
    kinds = {c["kind"] for _, c in data["certs"]}
    assert kinds == {"證照", "競賽", "作品"}
    items = {r[2] for r in data["records"]}
    assert {"班長", "課程小老師", "嘉獎"} <= items


def test_seed_dates_not_in_future_and_deterministic():
    seed_classes, data = _plan()
    today = seed_classes.TODAY.isoformat()
    assert max(c["issue_date"] for _, c in data["certs"]) <= today
    assert max(r[6] for r in data["records"]) <= today
    assert seed_classes.plan({})["records"] == data["records"]


def test_seed_one_class_leader_per_class():
    _, data = _plan()
    ids = {s[0]: s[4] for s in data["students"]}
    leaders = [ids[r[0]] for r in data["records"] if r[2] == "班長" and r[5] == "115-1"]
    assert sorted(leaders) == sorted(set(leaders)) and len(leaders) == 6


def test_seed_only_generated_students():
    _, data = _plan()
    ids = {s[0] for s in data["students"]}
    assert {sid for sid, _ in data["certs"]} <= ids
    assert {r[0] for r in data["records"]} <= ids


# ---------- 班導設定幹部與小老師 (T19) ----------

def test_teacher_lists_own_class_cadres(client, login):
    login("teacher1")
    d = client.get("/api/campus/records/cadres").get_json()
    assert d["class_name"] == "資管五忠" and "班長" in d["positions"]
    assert any(c["item"] == "班長" and c["student_id"] == "S112001" for c in d["cadres"])


def test_set_position_replaces_old_holder(client, login):
    login("teacher1")
    res = client.post("/api/campus/records/cadres", json={"student_id": "S112005", "item": "班長"})
    assert res.status_code == 200, res.get_json()
    leaders = [c for c in client.get("/api/campus/records/cadres").get_json()["cadres"] if c["item"] == "班長"]
    assert [c["student_id"] for c in leaders] == ["S112005"]


def test_tutor_needs_course_and_one_per_course(client, login):
    login("teacher1")
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112001", "item": "課程小老師"}).status_code == 400
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112001", "item": "課程小老師", "reason": "資料結構"}).status_code == 403
    client.post("/api/campus/records/cadres", json={"student_id": "S112001", "item": "課程小老師", "reason": "資料庫系統概論"})
    client.post("/api/campus/records/cadres", json={"student_id": "S112005", "item": "課程小老師", "reason": "資料庫系統概論"})
    tutors = [c for c in client.get("/api/campus/records/cadres").get_json()["cadres"]
              if c["item"] == "課程小老師" and c["reason"] == "資料庫系統概論"]
    assert [c["student_id"] for c in tutors] == ["S112005"]


def test_course_teacher_can_set_tutor_in_other_class(client, login):
    login("teacher1")
    courses = client.get("/api/campus/records/course-tutors").get_json()["data"]
    assert {c["class_name"] for c in courses} >= {"資管五忠", "資管四孝"}
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112004", "item": "課程小老師", "reason": "資料庫系統概論"}).status_code == 200
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112004", "item": "班長"}).status_code == 403
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112004", "item": "課程小老師", "reason": "資料結構"}).status_code == 403


def test_teacher_adds_class_specific_cadre_position(client, login):
    login("teacher1")
    path = "/api/campus/records/cadre-positions"
    for invalid in ("環保1股長", "環保123", "環保-股長", "班長"):
        assert client.post(path, json={"class_name": "資管五忠", "position": invalid}).status_code == 400
    assert client.post(path, json={"class_name": "資管四孝", "position": "環保股長"}).status_code == 403
    assert client.post(path, json={"class_name": "不存在的班級", "position": "環保股長"}).status_code == 403
    assert client.post(path, json={"class_name": "資管五忠", "position": "環保股長"}).status_code == 200
    assert client.post(path, json={"class_name": "資管五忠", "position": "環保股長"}).status_code == 400
    assert client.post(path, json={"class_name": "資管五忠", "position": "手機"}).status_code == 400
    assert client.post(path, json={"class_name": "資管五忠", "position": "手機股長"}).status_code == 200
    assert "手機股長" in client.get("/api/campus/records/cadres").get_json()["positions"]
    assert client.post(path, json={"class_name": "資管五忠", "position": "手機股長"}).status_code == 400
    assert "環保股長" in client.get("/api/campus/records/cadres").get_json()["positions"]
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112001", "item": "環保股長"}).status_code == 200
    assert client.delete(path, json={"class_name": "資管五忠", "position": "環保股長"}).status_code == 200
    cadres = client.get("/api/campus/records/cadres").get_json()
    assert "環保股長" not in cadres["positions"]
    assert all(c["item"] != "環保股長" for c in cadres["cadres"])


def test_remove_cadre_but_not_punishment(client, login):
    login("teacher1")
    d = client.get("/api/campus/records/cadres").get_json()
    leader = next(c for c in d["cadres"] if c["item"] == "班長")
    assert client.delete(f"/api/campus/records/{leader['id']}").status_code == 200
    login("student1")
    punish = next(r for r in client.get("/api/campus/records/mine").get_json()["data"] if r["kind"] == "獎懲")
    login("teacher1")
    assert client.delete(f"/api/campus/records/{punish['id']}").status_code == 404


def test_teacher_cannot_set_other_class(client, login):
    login("teacher1")
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112004", "item": "班長"}).status_code == 403
    assert client.get("/api/campus/records/cadres?class_name=資管四孝").status_code == 403
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112001", "item": "校長"}).status_code == 400


def test_students_cannot_set_cadres(client, login):
    login("student1")
    assert client.post("/api/campus/records/cadres", json={"student_id": "S112001", "item": "班長"}).status_code == 403


def test_semester_code():
    from datetime import date
    from campus.records import current_semester
    assert current_semester(date(2026, 10, 14)) == "115-1"
    assert current_semester(date(2027, 1, 10)) == "115-1"
    assert current_semester(date(2027, 3, 1)) == "115-2"
