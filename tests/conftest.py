"""
測試一律使用示範模式 (記憶體資料)，不連線 MySQL，避免測試資料寫進真正的資料庫。
campus 功能 (科上通知、證照、租借…) 的 data/campus_store.json 也改寫到暫存檔，且不連外網。
執行：python -m pytest
"""
import os
import sys
import urllib.request

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app as app_module  # noqa: E402


@pytest.fixture(autouse=True)
def offline_db(monkeypatch, tmp_path):
    monkeypatch.setattr(app_module, "get_db_connection", lambda *a, **k: None)
    # campus 資料改寫到暫存檔，不動 data/campus_store.json
    from campus.common import store
    # 從空白資料開始 (班級由示範學生自動產生)，結果不受每個人電腦裡的 campus_store.json 影響
    monkeypatch.setattr(store, "data", {})
    monkeypatch.setattr(store, "path", str(tmp_path / "campus_store.json"))

    def no_network(*a, **k):
        raise OSError("測試中不連外網")
    monkeypatch.setattr(urllib.request, "urlopen", no_network)
    # 通知信不寄出也不印在終端機
    sent = []

    class FakeMailer:
        mode = "test"

        def send(self, to_addr, subject, body):
            sent.append((to_addr, subject, body))

    monkeypatch.setattr(app_module, "get_mailer", lambda: FakeMailer())
    # 登入失敗次數限制是模組層級的全域字典，每個測試開始前清空，避免測試之間互相鎖死
    app_module._login_failures.clear()
    from campus import messaging as messaging_module
    messaging_module._join_class_attempts.clear()
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
