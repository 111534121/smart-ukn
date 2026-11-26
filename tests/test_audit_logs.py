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


def test_online_application_submit_and_signoff_are_queryable(client, login):
    login("student2")
    fields = {"phone": "0912-000-000", "semester": "115-1", "course_code": "CS201",
              "course_name": "資料結構", "credits": "3", "teacher": "林老師", "reason": "跟不上進度"}
    created = client.post("/api/applications", json={"item_id": 1, "fields": fields})
    assert created.status_code == 201
    app_id = created.get_json()["data"]["id"]
    assert client.get("/api/admin/audit-logs").status_code == 403

    client.post("/api/auth/logout")
    login("teacher1")
    assert client.post(f"/api/applications/{app_id}/review", json={"action": "approve"}).status_code == 200

    client.post("/api/auth/logout")
    login("admin", "admin123")
    response = client.get(f"/api/admin/audit-logs?table_name=online_applications&record_id={app_id}")
    assert response.status_code == 200
    entries = response.get_json()["data"]
    assert {row["action"] for row in entries} == {"新增", "修改"}
    assert all(row["table_name"] == "online_applications" and row["record_id"] == str(app_id) for row in entries)
    assert any(row["changed_by_role"] == "學生" for row in entries)
    assert any(row["changed_by_role"] == "老師" for row in entries)
