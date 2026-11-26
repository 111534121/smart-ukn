"""Regression checks for the merged administrator account controls."""

import admin_db
import app as app_module


def _session(client, role, username):
    with client.session_transaction() as session:
        session.clear()
        session.update(username=username, role=role, full_name=username)


def test_role_header_cannot_create_admin_session(monkeypatch, tmp_path):
    monkeypatch.setattr(app_module, "get_db_connection", lambda: None)
    monkeypatch.setattr(admin_db, "_get_mysql_conn", lambda: None)
    monkeypatch.setattr(admin_db, "SQLITE_DB_PATH", str(tmp_path / "admin.sqlite3"))
    admin_db.init_sqlite_schema()
    app_module.app.config["TESTING"] = True
    client = app_module.app.test_client()

    response = client.get("/api/admin/users", headers={"X-Admin-Role": "系統管理員"})
    assert response.status_code == 401

    _session(client, "內容管理人員", "content_admin")
    assert client.get("/api/admin/users").status_code == 403
    assert client.get("/api/admin/departments").status_code == 200


def test_initialization_preserves_existing_accounts(monkeypatch, tmp_path):
    monkeypatch.setattr(app_module, "get_db_connection", lambda: None)
    monkeypatch.setattr(admin_db, "_get_mysql_conn", lambda: None)
    monkeypatch.setattr(admin_db, "SQLITE_DB_PATH", str(tmp_path / "admin.sqlite3"))
    admin_db.init_sqlite_schema()
    admin_db.execute_db(
        "INSERT INTO users (username, password_hash, role, full_name, permissions, is_active) VALUES (%s, %s, %s, %s, %s, %s)",
        ("content_admin", "custom-hash", "內容管理人員", "Content admin", "查看", 0),
    )
    admin_before = admin_db.query_one("SELECT password_hash FROM users WHERE username = %s", ("admin",))

    admin_db.init_sqlite_schema()

    account = admin_db.query_one("SELECT password_hash, is_active FROM users WHERE username = %s", ("content_admin",))
    assert account == {"password_hash": "custom-hash", "is_active": 0}
    assert admin_db.query_one("SELECT password_hash FROM users WHERE username = %s", ("admin",)) == admin_before


def test_content_admin_login_and_permissions_survive_restart(monkeypatch, tmp_path):
    monkeypatch.setattr(app_module, "get_db_connection", lambda: None)
    monkeypatch.setattr(admin_db, "_get_mysql_conn", lambda: None)
    monkeypatch.setattr(admin_db, "SQLITE_DB_PATH", str(tmp_path / "admin.sqlite3"))
    monkeypatch.setitem(app_module.app.config, "TESTING", False)
    admin_db.init_sqlite_schema()
    client = app_module.app.test_client()
    _session(client, "管理員", "admin")

    created = client.post("/api/admin/users", json={
        "username": "content_admin", "password": "safe-demo-password",
        "role": "內容管理人員", "full_name": "內容編輯", "permissions": "查看,建立,修改",
    })
    assert created.status_code == 201
    client.post("/api/auth/logout")
    admin_db.init_sqlite_schema()

    login = client.post("/api/auth/login", json={"username": "content_admin", "password": "safe-demo-password"})
    assert login.status_code == 200
    assert login.get_json()["user"]["role"] == "內容管理人員"
    assert client.get("/api/admin/departments").status_code == 200
    assert client.get("/api/admin/users").status_code == 403
