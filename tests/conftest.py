"""
測試一律使用示範模式 (記憶體資料)，不連線 MySQL，避免測試資料寫進真正的資料庫。
執行：python -m pytest
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app as app_module  # noqa: E402


@pytest.fixture(autouse=True)
def offline_db(monkeypatch):
    monkeypatch.setattr(app_module, "get_db_connection", lambda: None)
    # 通知信不寄出也不印在終端機
    sent = []

    class FakeMailer:
        mode = "test"

        def send(self, to_addr, subject, body):
            sent.append((to_addr, subject, body))

    monkeypatch.setattr(app_module, "get_mailer", lambda: FakeMailer())
    return sent


@pytest.fixture
def client():
    app_module.app.config["TESTING"] = True
    return app_module.app.test_client()


@pytest.fixture
def login(client):
    def _login(username, password="123456"):
        res = client.post("/api/auth/login", json={"username": username, "password": password})
        assert res.status_code == 200, res.get_json()
        return client
    return _login
