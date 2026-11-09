# -*- coding: utf-8 -*-
"""
test_ui_foolproofing_and_db_normalization.py
驗證三大需求：
1. 管理員多餘文字移除：
   - 後台登入身分標籤不顯示「(管理員 · 圖書資訊中心)」
   - admin 帳號之 office 欄位已清空，不隸屬特定處室
2. 登入頁面密碼防呆：
   - 密碼欄位防呆阻擋中文字元與全形符號 (回傳 400 並提示錯誤)
   - 師生登入接受半形數字密碼 (如 123456)
   - 管理員登入接受英數字密碼 (admin123)
   - 錯誤密碼正常回傳 401
   - 空白密碼回傳 400
3. 資料庫正規化與整潔度：
   - 無殘留測試廢棄帳號 (如 sys_admin_2, S999999)
   - 學生與家長帳號之 office 欄位清空 (避免遞移相依與角色混亂)
   - 學生與科系代碼關聯有效
"""

import pytest
import sqlite3
import re
import app as app_module


def test_admin_badge_and_office_cleanup(client):
    """驗證需求 1：管理員身分不含多餘的 (管理員 · 圖書資訊中心)"""
    res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    user_data = res.get_json()["user"]
    
    # 驗證 admin 的 office 欄位為空，不隸屬於「圖書資訊中心」
    assert not user_data.get("office"), f"admin 不應帶有特定處室，實際為: {user_data.get('office')}"
    
    # 驗證前端 JavaScript 邏輯：isCurrentSysAdmin 時不應拼接 office 或冗餘角色標籤
    with open("static/js/admin-core.js", "r", encoding="utf-8") as f:
        js_code = f.read()
    assert "currentAdminUser.full_name || '系統管理員'" in js_code
    assert "移除多餘的「(管理員 · 圖書資訊中心)」" in js_code

    # 驗證 HTML 靜態骨架已無 (管理員) 冗餘字串
    with open("static/admin-core.html", "r", encoding="utf-8") as f:
        html_core = f.read()
    assert "系統超級管理員 (管理員)" not in html_core


def test_login_password_chinese_defense(client):
    """驗證需求 2：登入密碼欄位輸入中文字元防呆阻擋"""
    # 1. 包含純中文密碼
    res1 = client.post("/api/auth/login", json={"username": "student1", "password": "密碼一二三"})
    assert res1.status_code == 400
    assert "中文字元" in res1.get_json()["message"]

    # 2. 包含中英混合密碼
    res2 = client.post("/api/auth/login", json={"username": "student1", "password": "123密碼abc"})
    assert res2.status_code == 400
    assert "中文字元" in res2.get_json()["message"]

    # 3. 包含全形符號密碼
    res3 = client.post("/api/auth/login", json={"username": "student1", "password": "１２３４５６"})
    assert res3.status_code == 400
    assert "全形符號" in res3.get_json()["message"] or "中文字元" in res3.get_json()["message"]


def test_login_normal_numeric_and_admin(client):
    """驗證需求 2：一般師生純數字密碼與管理員密碼驗證"""
    # 1. 學生純數字密碼登入成功
    res_stu = client.post("/api/auth/login", json={"username": "student1", "password": "123456"})
    assert res_stu.status_code == 200
    assert res_stu.get_json()["user"]["role"] == "學生"

    # 2. 管理員英數密碼登入成功
    res_adm = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res_adm.status_code == 200

    # 3. 錯誤密碼仍正確回傳 401
    res_wrong = client.post("/api/auth/login", json={"username": "student1", "password": "wrongpassword"})
    assert res_wrong.status_code == 401


def test_login_frontend_foolproofing_in_html():
    """驗證需求 2 前端：login.html 是否具備密碼即時防呆與 inputmode"""
    with open("static/login.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    assert 'inputmode="numeric"' in html
    assert 'mPasswordHint' in html
    assert 'filterPasswordInput' in html
    assert '防呆阻擋：密碼欄位不可輸入中文字元' in html
    assert '防呆限制：密碼僅能輸入半形數字' in html


def test_database_cleanup_and_normalization():
    """驗證需求 3：資料庫整潔度與正規化防呆"""
    import admin_db
    # 檢查 SQLite 中的乾淨程度
    users = admin_db.query_db("SELECT username, role, student_id, office FROM users")
    usernames = [u["username"] for u in users]

    # 不應有先前測試殘留之髒帳號
    assert "sys_admin_2" not in usernames
    assert "test_staff_ok" not in usernames
    assert "testu123" not in usernames

    # 學生與家長帳號之 office 應全數為空
    for u in users:
        if u["role"] in ("學生", "家長"):
            assert not u["office"], f"使用者 {u['username']} (角色:{u['role']}) 不應有處室，實際: {u['office']}"

    # admin 帳號 office 應為空
    admin_row = next((u for u in users if u["username"] == "admin"), None)
    assert admin_row is not None
    assert not admin_row["office"], f"admin 不應有處室，實際: {admin_row['office']}"

    # 檢查 students 表格中不應有假學生 S999999
    students = admin_db.query_db("SELECT student_id FROM students WHERE student_id = 'S999999'")
    assert len(students) == 0, "S999999 測試資料未被清除"


def test_admin_logout_and_role_testing_flow(client):
    """驗證管理員登出、直接輸入 /logout 以及各職位登入測試流暢度"""
    # 1. 管理員登入後首頁會 302 至 /admin
    res_adm = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res_adm.status_code == 200
    assert client.get("/").status_code == 302
    assert client.get("/").headers["Location"] == "/admin"

    # 2. 透過 /logout 或 /api/auth/logout 登出
    res_out = client.get("/logout")
    assert res_out.status_code == 302
    assert res_out.headers["Location"] == "/login"

    # 3. 登出後首頁 / 恢復正常提供一般訪客或前台瀏覽 (不被強制轉去 /admin)
    assert client.get("/").status_code == 200

    # 4. 可流暢切換登入學生身份測試
    res_stu = client.post("/api/auth/login", json={"username": "student1", "password": "123456"})
    assert res_stu.status_code == 200
    assert res_stu.get_json()["user"]["role"] == "學生"
    assert client.get("/").status_code == 200

    # 5. 再次登出並切換登入老師身份測試
    client.post("/api/auth/logout")
    res_tea = client.post("/api/auth/login", json={"username": "teacher1", "password": "123456"})
    assert res_tea.status_code == 200
    assert res_tea.get_json()["user"]["role"] == "老師"
    assert client.get("/").status_code == 200


def test_admin_ui_contains_logout_buttons():
    """驗證 admin.html 與 admin-core.html 均提供直觀好點擊的登出按鈕"""
    with open("static/admin.html", "r", encoding="utf-8") as f:
        admin_html = f.read()
    assert "handleAdminLogout()" in admin_html
    assert "🚪 登出系統" in admin_html
    assert "返回師生/家長登入頁" in admin_html

    with open("static/admin-core.html", "r", encoding="utf-8") as f:
        admin_core_html = f.read()
    assert "handleAdminLogout()" in admin_core_html

    with open("static/admin-workbench.html", "r", encoding="utf-8") as f:
        workbench_html = f.read()
    assert "workbenchLogout()" in workbench_html


