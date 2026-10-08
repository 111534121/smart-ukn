"""科上通知完整流程與班導 / 行政人員的管理範圍

示範帳號：teacher1 = 彭賓鈺老師，導師班「資管五忠」(student1 王小明、student2 李美華在這班)
          staff1 = 教務處職員；student1、student2 = 資管五忠學生；S112004 = 資管四孝學生
"""


def send(client, class_name, **extra):
    body = {"class_name": class_name, "title": "繳交實習同意書", "content": "請於週五前交到系辦", "priority": "重要", **extra}
    return client.post("/api/campus/notices", json=body)


def class_names(client):
    return {c["class_name"] for c in client.get("/api/campus/classes").get_json()["data"]}


def test_whole_flow_teacher_to_student(client, login):
    """老師建群組 → 學生用密碼加入 → 老師發通知 → 學生收到未讀 → 點開變已讀 → 老師看到已讀人數"""
    login("teacher1")
    assert client.post("/api/campus/classes", json={"class_name": "專題小組A", "password": "abcd1234"}).status_code == 200
    assert "專題小組A" in class_names(client)

    login("student1")
    wrong = client.post("/api/campus/classes/join", json={"class_name": "專題小組A", "password": "wrong"})
    assert wrong.status_code == 403
    assert client.post("/api/campus/classes/join", json={"class_name": "專題小組A", "password": "abcd1234"}).status_code == 200

    login("teacher1")
    res = send(client, "專題小組A")
    assert res.status_code == 200, res.get_json()
    notice_id = res.get_json()["data"]["id"]

    login("student1")
    inbox = client.get("/api/campus/notices/inbox").get_json()
    mine = next(n for n in inbox["data"] if n["id"] == notice_id)
    assert mine["is_read"] is False and inbox["unread_count"] >= 1
    assert client.post(f"/api/campus/notices/{notice_id}/read").status_code == 200
    inbox = client.get("/api/campus/notices/inbox").get_json()
    assert next(n for n in inbox["data"] if n["id"] == notice_id)["is_read"] is True

    login("teacher1")
    sent = next(n for n in client.get("/api/campus/notices/sent").get_json()["data"] if n["id"] == notice_id)
    assert sent["read_count"] == 1 and sent["total"] == 1 and sent["unread_names"] == []


def test_individual_notice_only_reaches_chosen_student(client, login):
    login("teacher1")
    res = send(client, "資管五忠", recipients=["S112002"])
    assert res.status_code == 200
    notice_id = res.get_json()["data"]["id"]

    login("student2")
    assert any(n["id"] == notice_id for n in client.get("/api/campus/notices/inbox").get_json()["data"])
    login("student1")
    assert all(n["id"] != notice_id for n in client.get("/api/campus/notices/inbox").get_json()["data"])
    # 不是收件人不能標記已讀
    assert client.post(f"/api/campus/notices/{notice_id}/read").status_code == 404


def test_homeroom_teacher_only_manages_own_classes(client, login):
    login("teacher1")
    assert class_names(client) == {"資管五忠"}  # 只看到自己的導師班
    assert send(client, "資管五忠").status_code == 200
    assert send(client, "資管四孝").status_code == 403  # 別班不能發
    pw = client.post("/api/campus/classes/password", json={"class_name": "資管四孝", "password": "hack1234"})
    assert pw.status_code == 403  # 別班密碼不能改


def test_staff_and_admin_manage_whole_school(client, login):
    login("staff1")
    assert {"資管五忠", "資管四孝"} <= class_names(client)
    assert send(client, "資管四孝").status_code == 200
    assert client.post("/api/campus/classes/password", json={"class_name": "資管四孝", "password": "newpass1"}).status_code == 200
    login("admin", "admin123")
    assert send(client, "資管五忠").status_code == 200


def test_students_and_parents_cannot_send(client, login):
    login("student1")
    assert send(client, "資管五忠").status_code == 403
    login("parent1")
    assert send(client, "資管五忠").status_code == 403
