import app as app_module


def test_login_with_student_id_and_logout(client):
    res = client.post("/api/auth/login", json={"username": "S112001", "password": "123456"})
    assert res.status_code == 200
    assert res.get_json()["user"]["role"] == "學生"
    assert client.get("/api/auth/me").get_json()["is_authenticated"] is True
    client.post("/api/auth/logout")
    assert client.get("/api/auth/me").get_json()["is_authenticated"] is False


def test_login_wrong_password(client):
    res = client.post("/api/auth/login", json={"username": "student1", "password": "wrong"})
    assert res.status_code == 401


def test_login_username_is_case_insensitive(client):
    res = client.post("/api/auth/login", json={"username": "STUDENT1", "password": "123456"})
    assert res.status_code == 200, res.get_json()
    assert res.get_json()["user"]["username"] == "student1"


def test_login_blank_or_missing_fields(client):
    assert client.post("/api/auth/login", json={"username": "", "password": "123456"}).status_code == 400
    assert client.post("/api/auth/login", json={"username": "student1", "password": "  "}).status_code == 400
    assert client.post("/api/auth/login", json={}).status_code == 400


def test_login_rate_limited_after_repeated_failures(client):
    for _ in range(app_module.LOGIN_RATE_LIMIT):
        res = client.post("/api/auth/login", json={"username": "student1", "password": "wrong"})
        assert res.status_code == 401
    blocked = client.post("/api/auth/login", json={"username": "student1", "password": "wrong"})
    assert blocked.status_code == 429
    # 密碼打對了也一樣先被擋，不會因為這次是對的就放行
    still_blocked = client.post("/api/auth/login", json={"username": "student1", "password": "123456"})
    assert still_blocked.status_code == 429


def test_login_success_clears_failure_count(client):
    client.post("/api/auth/login", json={"username": "student1", "password": "wrong"})
    client.post("/api/auth/login", json={"username": "student1", "password": "wrong"})
    ok = client.post("/api/auth/login", json={"username": "student1", "password": "123456"})
    assert ok.status_code == 200
    # 成功登入後失敗次數會歸零，之後再連續失敗要能重新累計到上限才會被擋
    for _ in range(app_module.LOGIN_RATE_LIMIT):
        res = client.post("/api/auth/login", json={"username": "student1", "password": "wrong"})
        assert res.status_code == 401
    assert client.post("/api/auth/login", json={"username": "student1", "password": "wrong"}).status_code == 429


def test_visitor_register_creates_visitor_session(client):
    res = client.post("/api/visitor/register", json={
        "visitor_name": "測試訪客", "phone": "0912345678", "school_from": "南港高中",
        "purpose": "升學諮詢與科系探索", "visitor_type": "未來家長"
    })
    assert res.status_code == 201
    user = client.get("/api/auth/me").get_json()["user"]
    assert user["role"] == "訪客"
    assert "未來家長" in user["full_name"]
    # 前端要依身份顯示不同首頁內容，/api/auth/me 要能拿到 visitor_type 跟原始姓名
    assert user["visitor_type"] == "未來家長"
    assert user["visitor_name"] == "測試訪客"
    row = next(v for v in app_module.DEMO_VISITOR_LOGS if v["visitor_name"] == "測試訪客")
    assert row["visitor_type"] == "未來家長"


def test_visitor_register_defaults_to_prospective_student(client):
    res = client.post("/api/visitor/register", json={
        "visitor_name": "沒填身份", "phone": "0911111111", "school_from": "南港高中", "purpose": "校園參觀"
    })
    assert res.status_code == 201
    user = client.get("/api/auth/me").get_json()["user"]
    assert user["visitor_type"] == "未來學生"


def test_anonymous_user_has_no_visitor_type(client):
    """沒登記過的使用者 (純瀏覽) 不應該被當成已登記的訪客顯示客製化首頁內容"""
    data = client.get("/api/auth/me").get_json()
    assert data["is_authenticated"] is False


def test_visitor_register_rejects_bad_phone(client):
    res = client.post("/api/visitor/register", json={
        "visitor_name": "亂填電話", "phone": "abc", "school_from": "南港高中", "purpose": "參觀校園",
    })
    assert res.status_code == 400
    assert "手機號碼" in res.get_json()["message"]


def test_visitor_register_requires_fields(client):
    assert client.post("/api/visitor/register", json={"visitor_name": "x"}).status_code == 400


def test_admin_visitor_logs_masks_phone_and_export_is_audited(client, login):
    client.post("/api/visitor/register", json={
        "visitor_name": "匯出測試", "phone": "0987-654-321", "school_from": "安樂高中", "purpose": "校園環境參觀"
    })
    login("admin", "admin123")
    data = client.get("/api/admin/visitor-logs?days=7").get_json()
    row = next(v for v in data["data"] if v["visitor_name"] == "匯出測試")
    assert row["phone"] == "0987-***-321"
    assert data["total"] >= 1 and data["by_purpose"]

    csv_res = client.get("/api/admin/visitor-logs/export.csv?days=7")
    assert csv_res.status_code == 200
    assert "0987-654-321" in csv_res.get_data(as_text=True)
    assert any(l["table_name"] == "visitor_logs" and l["action"] == "匯出" for l in app_module.DEMO_AUDIT_LOGS)


def test_visitor_logs_require_staff(client, login):
    assert client.get("/api/admin/visitor-logs").status_code == 401
    login("student1")
    assert client.get("/api/admin/visitor-logs").status_code == 403


def test_forms_block_path_traversal(client):
    assert client.get("/forms/..%2Fapp.py").status_code == 404
    assert client.get("/forms/notes.txt").status_code == 404
    assert client.get("/forms/leave_application_form.pdf").status_code == 200
