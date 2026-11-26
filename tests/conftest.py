"""
測試一律使用示範模式 (記憶體資料)，不連線 MySQL，避免測試資料寫進真正的資料庫。
campus 功能 (科上通知、證照、租借…) 的 data/campus_store.json 也改寫到暫存檔，且不連外網。
執行：python -m pytest
"""
import os
import shutil
import sys
import tempfile
import urllib.request

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app as app_module  # noqa: E402
import admin_db  # noqa: E402


@pytest.fixture(scope="session")
def admin_sqlite_template():
    """admin_db 的 SQLite 結構 + 種子資料只需要跑一次 (~0.3 秒)；每個測試都重跑的話，
    乘上三千多個測試會拖到十幾分鐘。整個測試階段 (session) 先建一份範本，每個測試再複製一份快照用。"""
    real_path = admin_db.SQLITE_DB_PATH
    tmp_dir = tempfile.mkdtemp(prefix="admin_sqlite_template_")
    template_path = os.path.join(tmp_dir, "admin_template.sqlite3")
    admin_db.SQLITE_DB_PATH = template_path
    admin_db.init_sqlite_schema()
    admin_db.SQLITE_DB_PATH = real_path
    yield template_path
    shutil.rmtree(tmp_dir, ignore_errors=True)


@pytest.fixture(autouse=True)
def offline_db(monkeypatch, tmp_path, admin_sqlite_template):
    monkeypatch.setattr(app_module, "get_db_connection", lambda *a, **k: None)
    # admin_db 自己有一份獨立的 MySQL 連線 (不透過 app_module.get_db_connection，避免循環 import)，
    # 上面那行擋不到它，要另外擋，不然測試會在本機剛好有開 MySQL 時真的連上去、把測試資料寫進正式資料庫。
    monkeypatch.setattr(admin_db, "_get_mysql_conn", lambda: None)
    admin_path = str(tmp_path / "admin_default.sqlite3")
    shutil.copyfile(admin_sqlite_template, admin_path)  # 從範本複製一份，不用每個測試都重跑一次完整初始化
    monkeypatch.setattr(admin_db, "SQLITE_DB_PATH", admin_path)
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
    # campus/reports.py、campus/events.py 是直接 from attendance.notify import get_mailer，
    # 是各自模組自己的一份參照，patch app_module.get_mailer 影響不到它們，要分別補上，
    # 否則測試觸發到寄信邏輯時會呼叫到真正的 SMTP (若本機 .env 設定了真實帳密)
    from campus import reports as reports_module, events as events_module
    monkeypatch.setattr(reports_module, "get_mailer", lambda: FakeMailer())
    monkeypatch.setattr(events_module, "get_mailer", lambda: FakeMailer())
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
