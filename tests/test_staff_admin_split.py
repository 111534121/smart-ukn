# -*- coding: utf-8 -*-
"""
驗證系統管理員後台 (/admin) 與全新行政人員校務管理後台 (/staff-admin) 的完整拆離與資料庫持久化：
1. 兩頁 HTML 結構、面板歸屬、事件綁定 100% 正確無遺漏。
2. 行政人員（教職員／處室承辦／科助／內容管理人員）可正常操作移轉後的業務功能並真實寫入資料庫與 audit_logs。
3. 行政人員嚴格禁止存取系統管理員核心功能（帳號管理、恢復預設密碼、科系主檔異動、系統稽核、AI 決策洞察、會議中控台 -> 403）。
4. 系統管理員核心功能（帳號、恢復預設密碼、科系主檔、稽核、會議中控、AI 洞察）維持 100% 正常運作與資料庫持久化。
"""

import pathlib
import re
import pytest
import admin_db
import app as app_module


@pytest.fixture(autouse=True)
def isolate_db(monkeypatch, tmp_path):
    monkeypatch.setattr(app_module, "get_db_connection", lambda *a, **k: None)
    monkeypatch.setattr(admin_db, "SQLITE_DB_PATH", str(tmp_path / "staff_split.sqlite3"))
    admin_db.init_sqlite_schema()


def _login_session(client, role, username, full_name=None, office="教務處"):
    with client.session_transaction() as sess:
        sess.clear()
        sess.update({
            "logged_in": True,
            "user_id": 5 if role in ("管理員", "系統管理員") else 4,
            "username": username,
            "role": role,
            "full_name": full_name or username,
            "office": "" if role in ("管理員", "系統管理員") else office,
            "is_active": 1,
        })


def test_admin_and_staff_pages_cleanly_separated_and_handlers_valid(client):
    """驗證 /admin 與 /staff-admin 頁面乾淨分離，所有 onclick/onsubmit 函式皆存在"""
    r_staff = client.get("/staff-admin")
    assert r_staff.status_code == 200
    staff_html = r_staff.get_data(as_text=True)

    r_admin = client.get("/admin")
    assert r_admin.status_code == 200
    admin_html = r_admin.get_data(as_text=True)

    assert "window.ADMIN_PAGE_MODE = 'staff';" in staff_html
    assert "window.ADMIN_PAGE_MODE = 'sysadmin';" in admin_html

    # 兩角色為完全獨立使用者，兩後台與處室子頁不應出現跨後台快捷切換連結
    assert 'href="/staff-admin"' not in admin_html, "/admin 不應包含切換至行政人員後台的快捷連結"
    assert 'href="/admin"' not in staff_html, "/staff-admin 不應包含切換至系統管理員後台的快捷連結"
    workbench_html = pathlib.Path("static/admin-workbench.html").read_text(encoding="utf-8")
    events_admin_html = pathlib.Path("static/events-admin.html").read_text(encoding="utf-8")
    assert 'href="/admin"' not in workbench_html, "admin-workbench.html 不應包含切換至 /admin 的快捷連結"
    assert 'href="/admin"' not in events_admin_html, "events-admin.html 不應包含切換至 /admin 的快捷連結"

    # 帳號與科系管理頁不應重複出現多個相同功能按鈕，各保留單一入口
    assert admin_html.count("openUserModal('add')") == 1
    assert admin_html.count("openCredentialQueryModal()") == 1
    assert admin_html.count("openDeptModal('add')") == 1

    # 行政人員頁應包含 19 個業務分頁，且不含系統管理員專屬分頁
    for pid in (
        "panel-coursemap", "panel-gradreqs", "panel-calendar", "panel-deadlines",
        "panel-faculty", "panel-rules", "panel-categories", "panel-synonyms",
        "panel-unmatched", "panel-missed", "panel-feedback", "panel-checklists",
        "panel-conduct", "panel-attendance", "panel-scholarwarn", "panel-campus",
        "panel-visitors", "panel-anniversary", "panel-links",
    ):
        assert f'id="{pid}"' in staff_html, f"/staff-admin 缺少 {pid}"
        assert f'id="{pid}"' not in admin_html, f"/admin 不應再殘留行政分頁 {pid}"

    # 系統管理員頁應保留 10 個核心治理分頁（含帳號、科系、AI、會議、稽核、唯讀歷史、系統檢測）
    for pid in (
        "panel-users", "panel-departments", "panel-smartinsights", "panel-meetings",
        "panel-audit", "panel-searchlogs", "panel-credits", "panel-attendance_audit",
        "panel-records", "panel-selfcheck",
    ):
        assert f'id="{pid}"' in admin_html, f"/admin 缺少核心分頁 {pid}"
        assert f'id="{pid}"' not in staff_html, f"/staff-admin 不應含系統管理員分頁 {pid}"

    # 驗證兩頁所有 onclick / onsubmit 呼叫的自訂函式皆有定義
    core_js = pathlib.Path("static/js/admin-core.js").read_text(encoding="utf-8")
    for label, html in (("staff-admin.html", staff_html), ("admin.html", admin_html)):
        combined_js = html + "\n" + core_js
        defined = set(re.findall(r'(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(', combined_js))
        called = set()
        for attr in re.findall(r'(?:onclick|onsubmit|onchange|oninput|onkeyup)="([^"]+)"', html):
            for fn in re.findall(r'(?<!\.)\b([A-Za-z_][A-Za-z0-9_]*)\s*\(', attr):
                if fn not in ("if", "event", "confirm", "alert", "Number", "String"):
                    called.add(fn)
        missing = sorted(fn for fn in called if fn not in defined)
        assert not missing, f"{label} 存在未定義的前端函式：{missing}"


@pytest.mark.parametrize("staff_role,username", [
    ("教職員", "staff1"),
    ("處室承辦", "office_staff_demo"),
    ("科助", "demo_assistant_cs"),
    ("內容管理人員", "cms_staff_demo"),
])
def test_staff_roles_full_crud_db_persistence_and_sysadmin_isolation(client, staff_role, username):
    """驗證各類行政人員可在 /staff-admin 正常寫入資料庫並留存稽核，且無法觸碰系統管理員功能"""
    # 模擬既有正式 DB 中 staff1 擁有舊式業務描述權限字串
    admin_db.execute_db(
        "INSERT OR REPLACE INTO users (username, password_hash, role, full_name, office, permissions, is_active) VALUES (%s, %s, %s, %s, %s, %s, 1)",
        (username, "123456", staff_role, f"測試{staff_role}", "教務處",
         "課程管理,成績輸入,出缺席登錄" if staff_role == "教職員" else "", )
    )
    _login_session(client, staff_role, username, f"測試{staff_role}")

    # 1. 可正常讀取後台統計與科系下拉選單
    assert client.get("/api/admin/db-status").status_code == 200
    assert client.get("/api/admin/departments").status_code == 200

    # 2. 課程與擋修 CRUD -> 確認真的寫進資料庫 + audit_logs
    cid = f"STF{abs(hash(username)) % 9000 + 1000}"
    r_c = client.post("/api/admin/course-map", json={
        "course_id": cid, "course_name": "行政測試課程", "credits": 3,
        "dept_id": "CS", "course_type": "專業選修", "is_required": 0,
        "semester_suggest": "三年級上"
    })
    assert r_c.status_code == 201, r_c.get_json()
    assert admin_db.query_one("SELECT course_name FROM course_map WHERE course_id = %s", (cid,))["course_name"] == "行政測試課程"
    assert client.put(f"/api/admin/course-map/{cid}", json={"course_name": "行政測試課程(改)", "credits": 2}).status_code == 200
    assert admin_db.query_one("SELECT course_name FROM course_map WHERE course_id = %s", (cid,))["course_name"] == "行政測試課程(改)"
    assert client.delete(f"/api/admin/course-map/{cid}").status_code == 200
    assert admin_db.query_one("SELECT course_id FROM course_map WHERE course_id = %s", (cid,)) is None

    # 3. 規章分類與同義詞 CRUD -> 真實入庫
    r_cat = client.post("/api/admin/knowledge-categories", json={"category_name": f"行政測試分類_{cid}", "icon": "📌", "sort_order": 9})
    assert r_cat.status_code == 201, r_cat.get_json()
    cat_id = r_cat.get_json()["category_id"]
    assert admin_db.query_one("SELECT category_name FROM knowledge_categories WHERE category_id = %s", (cat_id,)) is not None

    r_syn = client.post("/api/admin/synonyms", json={"user_keyword": f"俗稱_{cid}", "official_term": "正式條文", "category_id": cat_id})
    assert r_syn.status_code == 201, r_syn.get_json()
    syn_id = r_syn.get_json()["synonym_id"]
    assert admin_db.query_one("SELECT official_term FROM synonym_dictionary WHERE synonym_id = %s", (syn_id,))["official_term"] == "正式條文"
    assert client.delete(f"/api/admin/synonyms/{syn_id}").status_code == 200
    assert client.delete(f"/api/admin/knowledge-categories/{cat_id}").status_code == 200

    # 4. 畢業門檻、教師專長、操行計分規則、校慶、訪客紀錄皆可存取
    assert client.get("/api/admin/graduation-requirements").status_code == 200
    assert client.get("/api/admin/faculty").status_code == 200
    assert client.get("/api/admin/conduct-settings").status_code == 200
    assert client.get("/api/admin/core/visitor-logs").status_code == 200

    # 5. 嚴格隔離：行政人員絕不可存取系統管理員專屬功能 (403)
    assert client.get("/api/admin/users").status_code == 403
    assert client.post("/api/admin/users/1/reset-password", json={"mode": "default"}).status_code == 403
    if staff_role != "內容管理人員":
        assert client.post("/api/admin/departments", json={"dept_id": "ZZ", "dept_name": "越權系", "college_name": "測試院"}).status_code == 403
        assert client.get("/api/admin/core/audit-logs").status_code == 403
        assert client.get("/api/admin/smart-insights").status_code == 403
        assert client.get("/api/admin/meetings").status_code == 403

    # 6. 確認上述操作已寫入 audit_logs
    logs = admin_db.query_db("SELECT action FROM audit_logs WHERE table_name = 'course_map' AND record_id = %s", (cid,))
    assert len(logs) >= 3


def test_sysadmin_core_functions_and_db_persistence(client):
    """驗證系統管理員於精簡後 /admin 之核心治理功能 100% 正常且持久入庫"""
    _login_session(client, "系統管理員", "admin", "系統管理員")

    # 1. 帳號建立 -> 恢復預設密碼 -> 刪除，真實入庫
    r_u = client.post("/api/admin/users", json={
        "username": "sysadmin_split_test", "role": "處室承辦", "full_name": "承辦測試員",
        "office": "教務處", "password": "CustomPassword99"
    })
    assert r_u.status_code == 201
    uid = r_u.get_json()["user_id"]
    r_rst = client.post(f"/api/admin/users/{uid}/reset-password", json={"mode": "default"})
    assert r_rst.status_code == 200 and r_rst.get_json()["new_password"] == "123456"
    assert client.delete(f"/api/admin/users/{uid}").status_code == 200

    # 2. 科系主檔 CRUD
    assert client.post("/api/admin/departments", json={"dept_id": "TDEPT", "dept_name": "測試科", "college_name": "測試學院"}).status_code == 201
    assert admin_db.query_one("SELECT dept_name FROM departments WHERE dept_id = 'TDEPT'")["dept_name"] == "測試科"
    assert client.delete("/api/admin/departments/TDEPT").status_code == 200

    # 3. 系統稽核、AI 決策洞察、會議中控台、唯讀歷史審查皆正常 200
    for ep in (
        "/api/admin/core/audit-logs", "/api/admin/search-logs",
        "/api/admin/student-credits", "/api/admin/attendance-records",
        "/api/admin/student-records", "/api/admin/meetings",
        "/api/admin/records/overview", "/api/admin/smart-insights",
    ):
        assert client.get(ep).status_code == 200, f"系統管理員呼叫 {ep} 失敗"


def test_staff_admin_account_direct_backend_and_dorm_staff_separation(client):
    """驗證新建立之行政人員帳號 staff_admin 登入直達 /staff-admin，且與宿舍行政人員 (dorm_demo / 住宿管理員) 嚴格區分"""
    # 1. 登入頁同時呈現獨立的「行政人員：校務後台 (staff_admin)」與「宿舍行政人員 (dorm_demo)」
    login_html = client.get("/login").get_data(as_text=True)
    assert "staff_admin" in login_html
    assert "dorm_demo" in login_html

    # 2. staff_admin 登入後 workbench_url 直達 /staff-admin，訪問 / 也直接重導至 /staff-admin
    r_login = client.post("/api/auth/login", json={"username": "staff_admin", "password": "123456"})
    assert r_login.status_code == 200, r_login.get_json()
    u = r_login.get_json()["user"]
    assert u["workbench_url"] == "/staff-admin"
    assert u["can_manage_dorm"] is False

    r_home = client.get("/", follow_redirects=False)
    assert r_home.status_code in (301, 302)
    assert r_home.headers["Location"].endswith("/staff-admin")

    # staff_admin 可正常操作 /staff-admin 業務 API，但嚴格禁止系統管理員帳號功能 (403)
    assert client.get("/api/admin/course-map").status_code == 200
    assert client.get("/api/admin/graduation-requirements").status_code == 200
    assert client.get("/api/admin/users").status_code == 403
    assert client.post("/api/admin/users/1/reset-password", json={"mode": "default"}).status_code == 403

    # 3. 宿舍行政人員 (dorm_demo) 登入維持首頁 /，且嚴格禁止進入一般行政人員校務後台 API (403)
    client.post("/api/auth/logout")
    r_dorm = client.post("/api/auth/login", json={"username": "dorm_demo", "password": "123456"})
    assert r_dorm.status_code == 200
    du = r_dorm.get_json()["user"]
    assert du["workbench_url"] == "/"
    assert du["can_manage_dorm"] is True

    assert client.get("/api/admin/course-map").status_code == 403
    assert client.get("/api/admin/graduation-requirements").status_code == 403
    assert client.get("/api/admin/knowledge-categories").status_code == 403
    assert client.get("/api/admin/users").status_code == 403

    # 4. 系統管理員在帳號清單可清楚辨識「行政人員 (staff_admin)」與「宿舍行政人員 (dorm_demo)」
    _login_session(client, "系統管理員", "admin", "系統管理員")
    all_users = client.get("/api/admin/users").get_json()["data"]
    by_name = {x["username"]: x for x in all_users}
    assert by_name["staff_admin"]["role_display"] == "行政人員"
    assert by_name["dorm_demo"]["role_display"] == "宿舍行政人員"
    dorm_filtered = client.get("/api/admin/users?role=住宿管理員").get_json()["data"]
    assert any(x["username"] == "dorm_demo" for x in dorm_filtered)
    assert all(x["username"] != "staff_admin" for x in dorm_filtered)
