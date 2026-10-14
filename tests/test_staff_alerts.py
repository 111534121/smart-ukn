"""老師 / 行政人員的待辦通知 (右上角鈴鐺)：有事要處理時出現，處理完自動消失"""

LEAVE = {"leave_type": "病假", "start_date": "2026-10-20", "end_date": "2026-10-20", "periods": "1-2", "reason": "ALERT-看醫生"}


def alerts(client, login, user):
    login(user)
    return client.get("/api/staff/alerts").get_json()["data"]


def test_homeroom_teacher_sees_pending_leave_until_reviewed(client, login):
    login("student1")
    leave_id = client.post("/api/student/leave-requests", json=LEAVE).get_json()["data"]["id"]
    hit = [a for a in alerts(client, login, "teacher1") if a["key"] == f"leave-{leave_id}"]
    assert hit and hit[0]["type"] == "請假" and "王小明" in hit[0]["title"]
    assert client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已核准"}).status_code == 200
    assert all(a["key"] != f"leave-{leave_id}" for a in alerts(client, login, "teacher1"))  # 審完就消失


def test_homeroom_teacher_sees_academic_warnings_of_own_class(client, login):
    warn = [a for a in alerts(client, login, "teacher1") if a["type"] == "預警"]
    assert any("王小明" in a["title"] for a in warn)          # 資管五忠、學業很嚴重
    assert all("陳冠宇" not in a["title"] for a in warn)       # 別班的學生不會出現


def test_warning_hidden_when_student_withdraws_advisor_consent(client, login):
    login("student1")
    client.post("/api/student/privacy-consent", json={"parent_alert_consent": 1, "advisor_alert_consent": 0})
    assert all("王小明" not in a["title"] for a in alerts(client, login, "teacher1") if a["type"] == "預警")
    login("student1")
    client.post("/api/student/privacy-consent", json={"parent_alert_consent": 1, "advisor_alert_consent": 1})  # 還原


def test_only_staff_can_read_alerts(client, login):
    assert client.get("/api/staff/alerts").status_code == 401
    login("student1")
    assert client.get("/api/staff/alerts").status_code == 403
    login("staff1")
    assert client.get("/api/staff/alerts").status_code == 200
