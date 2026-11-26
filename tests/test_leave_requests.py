LEAVE = {"leave_type": "病假", "start_date": "2026-10-08", "end_date": "2026-10-08", "periods": "3-4", "reason": "發燒就醫"}


def submit(client, **overrides):
    return client.post("/api/student/leave-requests", json={**LEAVE, **overrides})


def test_submit_validation(client, login):
    login("student1")
    assert submit(client, leave_type="颱風假").status_code == 400
    assert submit(client, start_date="2026/10/08").status_code == 400
    assert submit(client, end_date="2026-10-01").status_code == 400
    assert submit(client, periods="第三節").status_code == 400
    assert submit(client, reason="").status_code == 400
    assert submit(client, end_date="2026-12-31").status_code == 400


def test_only_students_can_submit(client, login):
    assert submit(client).status_code == 401
    login("parent1")
    assert submit(client).status_code == 403


def test_submit_review_and_notify(client, login, offline_db):
    login("student1")
    res = submit(client)
    assert res.status_code == 201
    leave_id = res.get_json()["data"]["id"]
    leave = client.get("/api/student/dashboard").get_json()["leave"]
    assert any(i["id"] == leave_id and i["status"] == "待審核" for i in leave["items"])

    login("teacher1")
    pending = client.get("/api/leave-requests/review").get_json()
    assert any(r["id"] == leave_id and r["full_name"] == "王小明" for r in pending["data"])

    # 退回必須寫原因
    assert client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已退回"}).status_code == 400
    res = client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已核准", "review_note": "早日康復"})
    assert res.status_code == 200
    assert res.get_json()["data"]["status"] == "已核准"
    assert offline_db[-1][0] == "s112001@stu.ukn.edu.tw"
    # 通知信不含假別等個資
    assert "病假" not in offline_db[-1][2]

    # 不能重複審核
    assert client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已退回", "review_note": "x"}).status_code == 409


def test_teacher_cannot_review_other_class(client, login):
    login("S112004")  # 資管四孝，不是 teacher1 的導師班
    leave_id = submit(client).get_json()["data"]["id"]

    login("teacher1")
    assert all(r["student_id"] != "S112004" for r in client.get("/api/leave-requests/review?status=all").get_json()["data"])
    assert client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已核准"}).status_code == 404

    login("staff1")
    assert client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已核准"}).status_code == 403
    login("admin", "admin123")
    assert client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已核准"}).status_code == 200


def test_student_can_cancel_only_own_pending(client, login):
    login("student1")
    leave_id = submit(client).get_json()["data"]["id"]

    login("student2")
    assert client.delete(f"/api/student/leave-requests/{leave_id}").status_code == 400

    login("student1")
    assert client.delete(f"/api/student/leave-requests/{leave_id}").status_code == 200
    assert client.delete(f"/api/student/leave-requests/{leave_id}").status_code == 400


def test_review_requires_staff_role(client, login):
    login("student1")
    assert client.get("/api/leave-requests/review").status_code == 403
