import copy
from datetime import date

import pytest

import anniversary
from anniversary import logic

EVENT = {"id": 1, "name_zh": "康寧大學校慶", "name_en": "UKN Anniversary", "name_ja": None,
         "start_date": "2026-11-01", "end_date": "2026-11-02", "announce_days": 30, "require_approval": 1, "is_enabled": 1}


@pytest.fixture(autouse=True)
def fresh_state(monkeypatch):
    monkeypatch.setattr(anniversary, "DEMO_EVENTS", [copy.deepcopy(EVENT)])
    monkeypatch.setattr(anniversary, "DEMO_WISHES", [])
    monkeypatch.setattr(anniversary, "_recent_posts", {})


def freeze_today(monkeypatch, day):
    class FrozenDate(date):
        @classmethod
        def today(cls):
            return day
    monkeypatch.setattr(anniversary, "date", FrozenDate)


# ---------- 純邏輯 ----------

@pytest.mark.parametrize("day, shown", [
    (date(2026, 10, 1), False),   # 前 31 天：還沒開始
    (date(2026, 10, 2), True),    # 前 30 天：開始顯示
    (date(2026, 11, 2), True),    # 最後一天
    (date(2026, 11, 3), False),   # 結束隔天自動消失
])
def test_display_window(day, shown):
    assert logic.is_active(EVENT, day) is shown


def test_disabled_event_never_shows():
    assert not logic.is_active({**EVENT, "is_enabled": 0}, date(2026, 11, 1))


def test_official_text_in_three_languages():
    assert logic.official_text(EVENT, date(2026, 10, 22), "zh")[2] == "🎉 康寧大學校慶倒數 10 天！（2026/11/01）"
    assert "10 days until UKN Anniversary" in logic.official_text(EVENT, date(2026, 10, 22), "en")[2]
    # 沒填日文名稱時退回中文名稱
    assert "康寧大學校慶まであと10日" in logic.official_text(EVENT, date(2026, 10, 22), "ja")[2]
    assert logic.official_text(EVENT, date(2026, 10, 31), "zh")[2].startswith("🎉 明天就是")
    assert logic.official_text(EVENT, date(2026, 11, 1), "en")[0] == "ongoing"
    assert "11/02" in logic.official_text(EVENT, date(2026, 11, 2), "zh")[2]


@pytest.mark.parametrize("text, code", [
    ("a", "too_short"),
    ("字" * 61, "too_long"),
    ("看這裡 https://spam.example", "url"),
    ("加我 www.spam", "url"),
    ("你是白痴", "blocked"),
    ("  生日\n快樂  ", None),
])
def test_clean_wish(text, code):
    assert logic.clean_wish(text)[1] == code


def test_unknown_lang_falls_back_to_chinese():
    assert logic.normalize_lang("fr") == "zh"
    assert logic.normalize_lang("EN-us") == "en"


# ---------- API ----------

def test_marquee_hidden_outside_window(client, monkeypatch):
    freeze_today(monkeypatch, date(2026, 9, 1))
    assert client.get("/api/anniversary/marquee").get_json()["active"] is False
    freeze_today(monkeypatch, date(2026, 11, 3))
    assert client.get("/api/anniversary/marquee").get_json()["active"] is False


def test_marquee_countdown_in_english(client, monkeypatch):
    freeze_today(monkeypatch, date(2026, 10, 22))
    data = client.get("/api/anniversary/marquee?lang=en").get_json()
    assert data["active"] is True and data["days_left"] == 10
    assert data["items"][0]["text"].startswith("🎉 10 days until UKN Anniversary")


def test_anonymous_wish_needs_approval_then_shows(client, login, monkeypatch):
    freeze_today(monkeypatch, date(2026, 10, 22))
    res = client.post("/api/anniversary/wishes", json={"message": "康寧生日快樂！", "lang": "zh"})
    assert res.status_code == 201 and res.get_json()["pending"] is True
    # 不記錄任何身分資料
    assert set(anniversary.DEMO_WISHES[0]) == {"id", "event_id", "message", "lang", "status", "created_at"}
    assert len(client.get("/api/anniversary/marquee").get_json()["items"]) == 1

    login("admin", "admin123")
    wish_id = anniversary.DEMO_WISHES[0]["id"]
    assert client.put(f"/api/admin/anniversary/wishes/{wish_id}", json={"status": "顯示中"}).status_code == 200
    items = client.get("/api/anniversary/marquee?lang=ja").get_json()["items"]
    assert items[1] == {"type": "wish", "label": "匿名メッセージ", "text": "康寧生日快樂！"}

    assert client.put(f"/api/admin/anniversary/wishes/{wish_id}", json={"status": "已隱藏"}).status_code == 200
    assert len(client.get("/api/anniversary/marquee").get_json()["items"]) == 1


def test_wish_shows_immediately_without_approval(client, monkeypatch):
    anniversary.DEMO_EVENTS[0]["require_approval"] = 0
    freeze_today(monkeypatch, date(2026, 10, 22))
    assert client.post("/api/anniversary/wishes", json={"message": "五十歲生日快樂"}).get_json()["pending"] is False
    assert client.get("/api/anniversary/marquee").get_json()["items"][1]["text"] == "五十歲生日快樂"


def test_wish_rejected_outside_window_and_translated(client, monkeypatch):
    freeze_today(monkeypatch, date(2026, 12, 1))
    res = client.post("/api/anniversary/wishes", json={"message": "Happy birthday", "lang": "en"})
    assert res.status_code == 400
    assert res.get_json()["message"] == "Anniversary wishes are not open right now"


def test_wish_rate_limited(client, monkeypatch):
    freeze_today(monkeypatch, date(2026, 10, 22))
    codes = [client.post("/api/anniversary/wishes", json={"message": f"祝福 {i}"}).status_code for i in range(4)]
    assert codes == [201, 201, 201, 429]


def test_admin_updates_event_and_is_audited(client, login, monkeypatch):
    import app as app_module
    freeze_today(monkeypatch, date(2026, 10, 22))
    login("staff1")
    body = {**EVENT, "start_date": "2026-12-20", "end_date": "2026-12-20", "announce_days": 30}
    assert client.put("/api/admin/anniversary/events/1", json=body).status_code == 200
    # 改到 12/20 後，10/22 還不到顯示期間
    assert client.get("/api/anniversary/marquee").get_json()["active"] is False
    overview = client.get("/api/admin/anniversary").get_json()
    assert overview["events"][0]["display_from"] == "2026-11-20"
    assert any(l["table_name"] == "anniversary_events" and l["action"] == "修改" for l in app_module.DEMO_AUDIT_LOGS)


def test_admin_event_validation_and_permissions(client, login):
    assert client.get("/api/admin/anniversary").status_code == 401
    login("student1")
    assert client.get("/api/admin/anniversary").status_code == 403
    login("admin", "admin123")
    assert client.post("/api/admin/anniversary/events", json={**EVENT, "name_zh": ""}).status_code == 400
    assert client.post("/api/admin/anniversary/events", json={**EVENT, "end_date": "2026-10-01"}).status_code == 400
    assert client.post("/api/admin/anniversary/events", json={**EVENT, "announce_days": 500}).status_code == 400
    assert client.post("/api/admin/anniversary/events", json=EVENT).status_code == 201
