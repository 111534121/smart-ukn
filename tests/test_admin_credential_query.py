# -*- coding: utf-8 -*-
"""
管理員帳密查詢功能、角色細分、防呆驗證與後台導向驗證測試
(test_admin_credential_query.py)

驗收目標：
1. 管理員帳密查詢功能 (Credentials Query & Reset)：
   - 系統管理員可查詢帳號清單之帳密狀態 (識別預設密碼 123456/admin123 與自訂密碼)
   - 支援搜尋關鍵字 (帳號、姓名、學號、處室)
   - 系統管理員可執行一鍵還原預設密碼或指定新密碼 (8~100 字元)，防呆且同步稽核日誌
   - 內容管理人員與非管理員禁止存取 (403)
2. 非法角色修正與系統／內容角色細分：
   - 嚴格拒絕空白、未提供或非法角色 (如「訪客」、「超級駭客」)
   - 系統管理員 vs 內容管理人員角色細分：內容管理人員不可擁有帳號管理權限且被嚴格隔離
3. 防呆完整保護：
   - 學生/家長必填合法學號，非學生身分不應帶學號
   - 主管理員與目前登入帳號不可被刪除、停用或降權
   - 帳號、姓名、密碼格式嚴格防呆
4. 管理員直接進後台：
   - 管理員登入時 workbench_url 為 "/admin"
   - 管理員訪問首頁 "/" 自動導向 "/admin"
   - 學生與一般訪客訪問 "/" 正常載入前台，完全不受影響
"""

import pytest
from werkzeug.security import check_password_hash
import admin_db


@pytest.fixture(autouse=True)
def isolate_admin_db(monkeypatch, tmp_path):
    monkeypatch.setattr(admin_db, "SQLITE_DB_PATH", str(tmp_path / "admin_core.sqlite3"))
    admin_db.init_sqlite_schema()


def test_admin_login_redirects_to_backend(client, login):
    """驗證管理員登入後直接進後台 (/admin)，且訪問首頁自動 302 導向後台；學生不受影響"""
    # 1. 管理員登入：workbench_url 為 /admin
    res_admin = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res_admin.status_code == 200
    user_data = res_admin.get_json()["user"]
    assert user_data["workbench_url"] == "/admin"

    # 管理員訪問首頁 "/" 應重定向至 "/admin"
    res_home_admin = client.get("/")
    assert res_home_admin.status_code == 302
    assert res_home_admin.headers.get("Location") in ("/admin", "http://localhost/admin")

    # 登出
    client.post("/api/auth/logout")

    # 2. 學生登入：workbench_url 仍為 "/"
    res_stu = client.post("/api/auth/login", json={"username": "student1", "password": "123456"})
    assert res_stu.status_code == 200
    stu_data = res_stu.get_json()["user"]
    assert stu_data["workbench_url"] == "/"

    # 學生訪問首頁 "/" 正常回傳 200 前台首頁
    res_home_stu = client.get("/")
    assert res_home_stu.status_code == 200

    # 登出
    client.post("/api/auth/logout")

    # 3. 未登入訪客訪問首頁 "/" 正常回傳 200 前台首頁
    res_home_anon = client.get("/")
    assert res_home_anon.status_code == 200


def test_illegal_roles_rejected_on_create_and_update(client, login):
    """驗證非法角色無法新增或修改，修正非法角色仍可新增問題"""
    login("admin", "admin123")

    # 1. 缺少角色或角色空白應拒絕 (400)
    res_no_role = client.post("/api/admin/users", json={
        "username": "test_user_norole", "full_name": "測試人員", "password": "password123"
    })
    assert res_no_role.status_code == 400
    assert "角色" in res_no_role.get_json()["message"]

    res_empty_role = client.post("/api/admin/users", json={
        "username": "test_user_emptyrole", "role": "   ", "full_name": "測試人員", "password": "password123"
    })
    assert res_empty_role.status_code == 400

    # 2. 非法角色「訪客」不得由管理員於 users 新增 (400)
    res_visitor = client.post("/api/admin/users", json={
        "username": "test_visitor_user", "role": "訪客", "full_name": "訪客帳號", "password": "password123"
    })
    assert res_visitor.status_code == 400
    assert "不支援" in res_visitor.get_json()["message"] or "非法" in res_visitor.get_json()["message"]

    # 3. 自創非法角色 (如「超級管理」、「駭客」) 應拒絕 (400)
    res_fake_role = client.post("/api/admin/users", json={
        "username": "test_fake_role", "role": "超級駭客", "full_name": "駭客", "password": "password123"
    })
    assert res_fake_role.status_code == 400

    # 4. 合法角色可成功新增
    res_ok = client.post("/api/admin/users", json={
        "username": "test_staff_ok", "role": "處室承辦", "full_name": "承辦測試", "password": "password123", "office": "教務處"
    })
    assert res_ok.status_code == 201
    new_user_id = res_ok.get_json()["user_id"]

    # 5. 更新時改為非法角色應被擋下 (400)
    res_update_bad = client.put(f"/api/admin/users/{new_user_id}", json={"role": "不存在的角色"})
    assert res_update_bad.status_code == 400

    # 6. 更新為空白角色應被擋下 (400)
    res_update_blank = client.put(f"/api/admin/users/{new_user_id}", json={"role": "  "})
    assert res_update_blank.status_code == 400


def test_system_admin_vs_content_manager_subdivision(client, login):
    """驗證系統管理員與內容管理人員的角色權限細分"""
    login("admin", "admin123")

    # 1. 建立「內容管理人員」
    res_content = client.post("/api/admin/users", json={
        "username": "cms_manager_1",
        "role": "內容管理人員",
        "full_name": "內容編輯專員",
        "password": "password123",
        "office": "圖資處"
    })
    assert res_content.status_code == 201
    content_user = res_content.get_json()["data"]
    # 內容管理人員自動被過濾掉帳號管理與權限設定
    assert "帳號管理" not in content_user["permissions"]
    assert "權限設定" not in content_user["permissions"]

    # 2. 建立「系統管理員」
    res_sys = client.post("/api/admin/users", json={
        "username": "sys_admin_2",
        "role": "系統管理員",
        "full_name": "副系統管理員",
        "password": "password123",
        "office": "電算中心"
    })
    assert res_sys.status_code == 201
    sys_user = res_sys.get_json()["data"]
    assert "帳號管理" in sys_user["permissions"]

    # 3. 內容管理人員登入，不可存取帳號管理 API 或帳密查詢 API (403)
    login("cms_manager_1", "password123")
    res_blocked_users = client.get("/api/admin/users")
    assert res_blocked_users.status_code == 403

    res_blocked_creds = client.get("/api/admin/credentials/query")
    assert res_blocked_creds.status_code == 403

    # 但內容管理人員可存取內容端點 (例如科系清單 200)
    res_depts = client.get("/api/admin/departments")
    assert res_depts.status_code == 200


def test_credential_query_and_password_reset(client, login):
    """驗證管理員帳密查詢功能與密碼重設操作"""
    login("admin", "admin123")

    # 1. 查詢帳密清單
    res_query = client.get("/api/admin/credentials/query")
    assert res_query.status_code == 200
    data = res_query.get_json()["data"]
    assert len(data) > 0

    # 驗證預設密碼識別：student1 密碼為 123456
    stu1 = next((u for u in data if u["username"] == "student1"), None)
    assert stu1 is not None
    assert stu1["is_default_password"] is True
    assert "123456" in stu1["password_status"]

    # 驗證預設密碼識別：admin 密碼為 admin123
    admin_u = next((u for u in data if u["username"] == "admin"), None)
    assert admin_u is not None
    assert admin_u["is_default_password"] is True
    assert "admin123" in admin_u["password_status"]

    # 2. 關鍵字搜尋查詢
    res_search = client.get("/api/admin/credentials/query?search=student1")
    assert res_search.status_code == 200
    search_data = res_search.get_json()["data"]
    assert any(u["username"] == "student1" for u in search_data)

    # 3. 查詢單一使用者帳密詳情
    res_single = client.get(f"/api/admin/users/{stu1['user_id']}/credential-info")
    assert res_single.status_code == 200
    assert res_single.get_json()["data"]["username"] == "student1"

    # 4. 管理員執行自訂重設密碼
    res_reset_custom = client.post(f"/api/admin/users/{stu1['user_id']}/reset-password", json={
        "mode": "custom",
        "new_password": "NewSecret888"
    })
    assert res_reset_custom.status_code == 200
    assert res_reset_custom.get_json()["new_password"] == "NewSecret888"

    # 驗證以新密碼登入
    login("student1", "NewSecret888")
    res_me = client.get("/api/auth/me")
    assert res_me.get_json()["is_authenticated"] is True
    assert res_me.get_json()["user"]["username"] == "student1"

    # 5. 管理員一鍵還原預設密碼
    login("admin", "admin123")
    res_reset_def = client.post(f"/api/admin/users/{stu1['user_id']}/reset-password", json={
        "mode": "default"
    })
    assert res_reset_def.status_code == 200
    assert res_reset_def.get_json()["new_password"] == "123456"

    # 驗證已成功還原為預設密碼 123456
    login("student1", "123456")
    assert client.get("/api/auth/me").get_json()["is_authenticated"] is True


def test_defensive_foolproofing_checks(client, login):
    """驗證各項嚴格防呆機制"""
    login("admin", "admin123")

    # 1. 學生/家長必填學號
    res_stu_no_id = client.post("/api/admin/users", json={
        "username": "stu_without_id", "role": "學生", "full_name": "缺學號學生", "password": "password123"
    })
    assert res_stu_no_id.status_code == 400
    assert "學號" in res_stu_no_id.get_json()["message"]

    # 2. 帳號格式防呆 (含空格或特殊符號)
    res_bad_uname = client.post("/api/admin/users", json={
        "username": "bad uname!@#", "role": "處室承辦", "full_name": "格式錯誤", "password": "password123"
    })
    assert res_bad_uname.status_code == 400

    # 3. 密碼長度防呆 (< 8 字元)
    res_short_pwd = client.post("/api/admin/users", json={
        "username": "user_short_pwd", "role": "處室承辦", "full_name": "密碼太短", "password": "123"
    })
    assert res_short_pwd.status_code == 400
    assert "8～100" in res_short_pwd.get_json()["message"] or "8" in res_short_pwd.get_json()["message"]

    # 4. 主管理員不可被停用或降權
    users_list = client.get("/api/admin/users").get_json()["data"]
    admin_info = next(u for u in users_list if u["username"] == "admin")
    admin_id = admin_info["user_id"]

    res_demote_admin = client.put(f"/api/admin/users/{admin_id}", json={"role": "學生", "student_id": "S999999"})
    assert res_demote_admin.status_code == 400
    assert "防呆保護" in res_demote_admin.get_json()["message"]

    res_disable_admin = client.put(f"/api/admin/users/{admin_id}", json={"is_active": 0})
    assert res_disable_admin.status_code == 400
    assert "防呆保護" in res_disable_admin.get_json()["message"]

    res_del_admin = client.delete(f"/api/admin/users/{admin_id}")
    assert res_del_admin.status_code == 400
    assert "防呆保護" in res_del_admin.get_json()["message"]


def test_student_and_non_admin_features_isolated_and_unaffected(client, login):
    """確保完全未改變管理員以外的東西（例如學生端、成績、請假等）"""
    login("student1", "123456")

    # 1. 學生正常取得個人身分
    me = client.get("/api/auth/me").get_json()
    assert me["is_authenticated"] is True
    assert me["user"]["role"] == "學生"
    assert me["user"]["student_id"] == "S112001"

    # 2. 學生正常取得修業進度與學分
    res_courses = client.get("/api/courses")
    assert res_courses.status_code == 200

    # 3. 學生正常查詢個人通知
    res_inbox = client.get("/api/campus/notices/inbox")
    assert res_inbox.status_code == 200

    # 4. 學生不可存取管理員帳密查詢功能 (401/403 隔離)
    res_hack_cred = client.get("/api/admin/credentials/query")
    assert res_hack_cred.status_code == 403
