"""修改紀錄 (audit_logs)：班導、行政人員、學生的重要動作都要留下「誰、何時、哪台電腦 (IP)、改了什麼」"""


def logs(client, login, table):
    login("admin", "admin123")
    data = client.get("/api/admin/audit-logs").get_json()["data"]
    return [l for l in data if l["table_name"] == table]


def test_teacher_notice_is_logged_with_ip(client, login):
    login("teacher1")
    res = client.post("/api/campus/notices", json={"class_name": "資管五忠", "title": "AUDIT-通知測試", "content": "內容"})
    assert res.status_code == 200
    hit = next(l for l in logs(client, login, "notices") if l["after_json"]["title"] == "AUDIT-通知測試")
    assert hit["action"] == "新增" and hit["changed_by"] == "彭賓鈺 老師" and hit["changed_by_role"] == "老師"
    assert hit["ip_address"] == "127.0.0.1"


def test_class_password_reset_is_logged_without_password(client, login):
    login("teacher1")
    assert client.post("/api/campus/classes/password", json={"class_name": "資管五忠", "password": "secret999"}).status_code == 200
    hit = logs(client, login, "classes")[0]
    assert hit["action"] == "修改" and hit["record_id"] == "資管五忠"
    assert "secret999" not in str(hit)  # 密碼本身不能出現在紀錄裡


def test_student_privacy_consent_change_is_logged(client, login):
    login("student1")
    assert client.post("/api/student/privacy-consent", json={"parent_alert_consent": 0, "advisor_alert_consent": 1}).status_code == 200
    hit = logs(client, login, "student_privacy_settings")[0]
    assert hit["record_id"] == "S112001" and hit["changed_by_role"] == "學生"
    assert hit["before_json"]["parent_alert_consent"] == 1 and hit["after_json"]["parent_alert_consent"] == 0
    login("student1")
    client.post("/api/student/privacy-consent", json={"parent_alert_consent": 1, "advisor_alert_consent": 1})  # 還原


def test_staff_adds_attendance_is_logged(client, login):
    login("staff1")
    res = client.post("/api/admin/attendance", json={"student_id": "S112002", "date": "2026-10-08", "course_name": "AUDIT-課程", "type": "遲到"})
    assert res.status_code == 201
    hit = next(l for l in logs(client, login, "attendance_records") if l["after_json"].get("course_name") == "AUDIT-課程")
    assert hit["changed_by_role"] == "教職員" and hit["ip_address"] == "127.0.0.1"
