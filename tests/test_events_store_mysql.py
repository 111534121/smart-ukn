"""活動報名儲存層走 MySQL 的那條路徑：不需要真的連資料庫，模擬 deps.fetch_db_rows/db_execute 來驗證 SQL 邏輯正確。"""
from campus import events_store
from campus.common import deps


def _force_db(monkeypatch):
    monkeypatch.setattr(events_store, "use_db", lambda: True)


def test_insert_event_uses_lastrowid(monkeypatch):
    _force_db(monkeypatch)
    captured = {}

    def execute(sql, params):
        captured["sql"], captured["params"] = sql, params
        return {"lastrowid": 42, "rowcount": 1}

    monkeypatch.setattr(deps, "db_execute", execute)
    item = events_store.insert_event({
        "title": "測試活動", "description": "", "image_url": "", "location": "測試地點",
        "event_date": "2026-11-01", "event_time": "", "registration_deadline": "2026-10-31",
        "capacity": 10, "cancelled": 0, "created_by": "staff1", "created_at": "2026-10-22 10:00:00",
    })
    assert item["id"] == 42
    assert "INSERT INTO events" in captured["sql"]
    assert captured["params"][0] == "測試活動"


def test_insert_event_raises_when_db_execute_fails(monkeypatch):
    _force_db(monkeypatch)
    monkeypatch.setattr(deps, "db_execute", lambda sql, params: None)
    try:
        events_store.insert_event({
            "title": "x", "description": "", "image_url": "", "location": "x",
            "event_date": "2026-11-01", "event_time": "", "registration_deadline": "2026-10-31",
            "capacity": 1, "cancelled": 0, "created_by": "staff1", "created_at": "2026-10-22 10:00:00",
        })
        assert False, "should have raised"
    except ConnectionError:
        pass


def test_update_registration_builds_dynamic_set_clause(monkeypatch):
    _force_db(monkeypatch)
    captured = {}

    def execute(sql, params):
        captured["sql"], captured["params"] = sql, params
        return {"lastrowid": None, "rowcount": 1}

    monkeypatch.setattr(deps, "db_execute", execute)
    monkeypatch.setattr(deps, "fetch_db_rows", lambda sql, params=(): [
        {"id": 7, "event_id": 1, "student_id": "S112001", "full_name": "王小明", "email": "a@b.com",
         "phone": "", "age": 20, "note": "", "status": "已取消", "checkin_code": "abc",
         "registered_by_key": "S112001", "registered_by_role": "學生",
         "created_at": "2026-10-22 10:00:00", "cancelled_at": "2026-10-22 11:00:00",
         "checked_in": 0, "checked_in_at": None, "reminded": 0,
         "rating": None, "feedback_comment": None, "feedback_at": None},
    ])
    updated = events_store.update_registration(7, {"status": "已取消", "cancelled_at": "2026-10-22 11:00:00"})
    assert "UPDATE event_registrations SET status=%s, cancelled_at=%s WHERE id=%s" == captured["sql"]
    assert captured["params"] == ("已取消", "2026-10-22 11:00:00", 7)
    assert updated["status"] == "已取消"
    assert updated["checked_in"] is False  # tinyint 0 解碼回 Python bool


def test_delete_registration_returns_none_when_not_found(monkeypatch):
    _force_db(monkeypatch)
    monkeypatch.setattr(deps, "fetch_db_rows", lambda sql, params=(): [])
    assert events_store.delete_registration(999) is None


def test_use_db_false_when_table_missing(monkeypatch):
    monkeypatch.setattr(deps, "fetch_db_rows", lambda sql, params=(): None)
    assert events_store.use_db() is False
