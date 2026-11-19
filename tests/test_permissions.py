"""
權限測試矩陣 (permission_matrix.csv) 的自動化測試

執行方式（在專案根目錄，也就是 app.py 所在的資料夾）：
    pip install pytest
    pytest tests/test_permissions.py -v

矩陣格子的意思：
    OK    → 不可以被權限擋下 (狀態碼不是 401 / 403；400、404 都算通過，因為測的是權限不是功能)
    401   → 必須回 401（未登入）
    403   → 必須回 403（已登入但身分不對）
    結尾有 * → 這格是「應該要這樣，但目前程式還沒做到」的已知問題。
              測試會標成 xfail（預期失敗）；等程式修好、這格變成通過時，
              pytest 會報 XPASS 並讓測試失敗，提醒你把 CSV 裡的 * 拿掉。

安全措施：測試期間資料庫連線一律回傳 None（強制走示範資料）、campus 資料寫到暫存檔、
          不改 links.json、不連外網、不寄信、不呼叫 AI，
          所以跑測試不會改到 MySQL 或 data/ 裡的任何資料。
"""
import csv
import json
import os
import sys
import types
import urllib.request

import pytest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)

import app as app_module  # noqa: E402

MATRIX_PATH = os.path.join(HERE, "permission_matrix.csv")
ROLES = ["未登入", "訪客", "學生", "家長", "老師", "教職員", "管理員"]

# 每種身分登入後 session 裡會有的內容（照 app.py 的 auth_login / register_visitor 寫的）
SESSIONS = {
    "未登入": None,
    "訪客": {"user_id": 999001, "username": "visitor_1", "role": "訪客", "visitor_type": "未來學生",
             "full_name": "測試訪客 (未來學生)", "student_id": None, "dept_name": "資訊管理科（五專）", "class_name": ""},
    "學生": {"user_id": 1, "username": "student1", "role": "學生", "full_name": "王小明", "student_id": "S112001",
             "dept_id": "CS", "dept_name": "資訊管理科（五專）", "class_name": "資管五忠", "advised_class": None},
    "家長": {"user_id": 3, "username": "parent1", "role": "家長", "full_name": "王大明 (小明家長)", "student_id": "S112001",
             "dept_id": "CS", "dept_name": "資訊管理科（五專）", "class_name": "資管五忠", "advised_class": None},
    "老師": {"user_id": 6, "username": "teacher1", "role": "老師", "full_name": "彭賓鈺 老師", "student_id": None,
             "dept_id": "CS", "dept_name": "資訊管理科（五專）", "class_name": "", "advised_class": "資管五忠"},
    "教職員": {"user_id": 4, "username": "staff1", "role": "教職員", "full_name": "周立威 (教務處職員)", "student_id": None,
               "dept_id": "CS", "dept_name": "資訊管理科（五專）", "class_name": "", "advised_class": None},
    "管理員": {"user_id": 5, "username": "admin", "role": "管理員", "full_name": "系統超級管理員", "student_id": None,
               "dept_id": "CS", "dept_name": "資訊管理科（五專）", "class_name": "", "advised_class": None},
}


def load_matrix():
    with open(MATRIX_PATH, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


MATRIX = load_matrix()


def build_cases():
    cases = []
    for row in MATRIX:
        for role in ROLES:
            cell = row[role].strip()
            known_issue = cell.endswith("*")
            expected = cell.rstrip("*")
            case_id = f"{row['method']} {row['url']} [{role}]"
            marks = []
            if known_issue:
                reason = f"已知問題：{row['備註'] or '目前行為與預期不同'}"
                marks.append(pytest.mark.xfail(reason=reason, strict=True))
            cases.append(pytest.param(row, role, expected, id=case_id, marks=marks))
    return cases


@pytest.fixture
def client(monkeypatch, tmp_path):
    app_module.app.config["TESTING"] = True
    # 程式錯誤回 500 而不是讓測試當掉：這支只測「有沒有被權限擋下」，功能對不對另外測
    app_module.app.config["PROPAGATE_EXCEPTIONS"] = False
    # 強制示範模式：不連 MySQL，避免測試資料寫進真正的資料庫
    monkeypatch.setattr(app_module, "get_db_connection", lambda *a, **k: None)
    # 管理員核心模組的離線 SQLite 備援也必須寫入測試暫存目錄。
    import admin_db
    monkeypatch.setattr(admin_db, "SQLITE_DB_PATH", str(tmp_path / "admin_core.sqlite3"))
    # 不真的寄缺曠通知信
    monkeypatch.setattr(app_module, "send_pending_notifications",
                        lambda *a, **k: {"students_notified": 0, "records_notified": 0, "failed": [], "mode": "test"})
    # 不改到 links.json
    monkeypatch.setattr(app_module, "save_quick_links", lambda *a, **k: None)
    # 線上申請的上傳檔、老師章與手機簽名連結寫到暫存資料夾，不動 data/
    import applications
    monkeypatch.setattr(applications.deps, "upload_dir", str(tmp_path / "application_uploads"))
    monkeypatch.setattr(applications.deps, "seal_dir", str(tmp_path / "seals"))
    # campus 功能的資料 (科上通知、證照、租借…) 改寫到暫存檔，不動 data/campus_store.json
    from campus.common import store
    # 從空白資料開始 (班級由示範學生自動產生)，結果不受每個人電腦裡的 campus_store.json 影響
    monkeypatch.setattr(store, "data", {})
    monkeypatch.setattr(store, "path", str(tmp_path / "campus_store.json"))
    # 不連外網 (天氣、公車、官網行事曆、國定假日)
    def no_network(*a, **k):
        raise OSError("測試中不連外網")
    monkeypatch.setattr(urllib.request, "urlopen", no_network)
    # 後台「全站自動檢測」只測權限，不真的跑整套檢測
    monkeypatch.setitem(sys.modules, "self_check", types.SimpleNamespace(run_all=lambda: {}))
    # AI 小幫手不呼叫 Claude
    for key in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "ASSISTANT_AI"):
        monkeypatch.delenv(key, raising=False)
    with app_module.app.test_client() as c:
        yield c


@pytest.mark.parametrize("row,role,expected", build_cases())
def test_permission(client, row, role, expected):
    sess = SESSIONS[role]
    with client.session_transaction() as s:
        s.clear()
        if sess:
            s.update(sess)

    method = row["method"]
    kwargs = {}
    if method in ("POST", "PUT"):
        kwargs["json"] = json.loads(row["body"]) if row["body"].strip() else {}
    resp = client.open(row["url"], method=method, **kwargs)

    if expected == "OK":
        assert resp.status_code not in (401, 403), \
            f"{role} 呼叫 {method} {row['url']} 應該可以通過權限檢查，實際回 {resp.status_code}"
    else:
        assert resp.status_code == int(expected), \
            f"{role} 呼叫 {method} {row['url']} 應回 {expected}，實際回 {resp.status_code}"


def test_matrix_covers_every_route():
    """防漏測：app.py 新增任何 API 卻沒寫進矩陣，這個測試就會失敗並列出缺哪些"""
    in_matrix = {(r["method"], r["rule"]) for r in MATRIX}
    missing = []
    for rule in app_module.app.url_map.iter_rules():
        if rule.endpoint == "static":
            continue
        for m in sorted(rule.methods - {"HEAD", "OPTIONS"}):
            if (m, rule.rule) not in in_matrix:
                missing.append(f"{m} {rule.rule}")
    assert not missing, "以下 API 還沒寫進 permission_matrix.csv：\n  " + "\n  ".join(missing)


def test_matrix_has_no_stale_rows():
    """矩陣裡的 API 在 app.py 已經刪掉時提醒你同步刪除那一列"""
    in_app = {(m, r.rule) for r in app_module.app.url_map.iter_rules() for m in r.methods}
    stale = [f"{r['method']} {r['rule']}" for r in MATRIX if (r["method"], r["rule"]) not in in_app]
    assert not stale, "矩陣裡有 app.py 已不存在的 API：\n  " + "\n  ".join(stale)
