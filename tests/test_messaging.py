"""科上通知：老師只能通知/改密碼自己的導師班；教職員與管理員可以操作任何班級。"""


def test_teacher_can_notify_own_class(client, login):
    login("teacher1")  # advised_class = 資管四忠
    res = client.post("/api/campus/notices", json={
        "class_name": "資管四忠", "title": "期中考公告", "content": "下週三考期中考",
    })
    assert res.status_code == 200, res.get_json()


def test_teacher_cannot_notify_other_class(client, login):
    """teacher1 帶資管四忠，不能通知資管四孝或護理四忠"""
    login("teacher1")
    for other_class in ("資管四孝", "護理四忠"):
        res = client.post("/api/campus/notices", json={
            "class_name": other_class, "title": "亂發的通知", "content": "不應該成功",
        })
        assert res.status_code == 403, f"{other_class}: {res.get_json()}"


def test_teacher_cannot_reset_other_class_password(client, login):
    login("teacher1")
    res = client.post("/api/campus/classes/password", json={"class_name": "資管四孝", "password": "hacked123"})
    assert res.status_code == 403


def test_teacher_can_reset_own_class_password(client, login):
    login("teacher1")
    res = client.post("/api/campus/classes/password", json={"class_name": "資管四忠", "password": "newpass123"})
    assert res.status_code == 200


def test_staff_can_notify_any_class(client, login):
    login("staff1")
    res = client.post("/api/campus/notices", json={
        "class_name": "護理四忠", "title": "全校公告", "content": "教職員可以通知任何班級",
    })
    assert res.status_code == 200, res.get_json()


def test_student_cannot_send_notice(client, login):
    login("student1")
    res = client.post("/api/campus/notices", json={"class_name": "資管四忠", "title": "x", "content": "y"})
    assert res.status_code == 403


def test_parent_can_view_inbox_readonly(client, login):
    login("teacher1")
    client.post("/api/campus/notices", json={"class_name": "資管四忠", "title": "期中考", "content": "下週考試"})
    client.post("/api/auth/logout")

    login("parent1")  # 綁定 S112001，班級資管四忠
    data = client.get("/api/campus/notices/inbox").get_json()
    assert any(n["title"] == "期中考" for n in data["data"])
    # 家長不能標記已讀 (僅學生本人可以)
    notice_id = data["data"][0]["id"]
    assert client.post(f"/api/campus/notices/{notice_id}/read").status_code == 403


def test_parent_message_to_advisor_flow(client, login):
    login("parent1")
    res = client.post("/api/campus/advisor-messages", json={"subject": "請假", "content": "小明這週要請假"})
    assert res.status_code == 200, res.get_json()
    msg_id = res.get_json()["data"]["id"]
    assert res.get_json()["data"]["class_name"] == "資管四忠"

    mine = client.get("/api/campus/advisor-messages").get_json()["data"]
    assert any(m["id"] == msg_id and m["status"] == "待回覆" for m in mine)
    client.post("/api/auth/logout")

    # 別班導師看不到
    login("teacher1")  # advised_class = 資管四忠，正好是本人班級
    teacher_view = client.get("/api/campus/advisor-messages").get_json()["data"]
    assert any(m["id"] == msg_id for m in teacher_view)

    reply = client.post(f"/api/campus/advisor-messages/{msg_id}/reply", json={"reply": "了解，請補假單"})
    assert reply.status_code == 200
    assert reply.get_json()["data"]["status"] == "已回覆"
    client.post("/api/auth/logout")

    login("parent1")
    mine_after = client.get("/api/campus/advisor-messages").get_json()["data"]
    updated = next(m for m in mine_after if m["id"] == msg_id)
    assert updated["reply"] == "了解，請補假單"


def test_only_parent_can_message_advisor(client, login):
    login("student1")
    assert client.post("/api/campus/advisor-messages", json={"subject": "x", "content": "y"}).status_code == 403


def test_staff_sees_all_advisor_messages(client, login):
    login("parent1")  # S112001 在資管四忠
    msg_id = client.post("/api/campus/advisor-messages", json={"subject": "x", "content": "y"}).get_json()["data"]["id"]
    client.post("/api/auth/logout")

    login("staff1")  # 教職員不限班級，可看到全部家長留言
    assert any(m["id"] == msg_id for m in client.get("/api/campus/advisor-messages").get_json()["data"])
