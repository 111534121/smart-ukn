"""預約校園參觀：訪客/家長可預約，承辦單位可確認或取消，時段有名額上限。"""
from datetime import date, timedelta

import app as app_module


def _next_weekday(days_ahead=7):
    d = date.today() + timedelta(days=days_ahead)
    while d.isoweekday() > 5:
        d += timedelta(days=1)
    return d.isoformat()


def _register_visitor(client, name="訪客甲", phone="0911000111"):
    res = client.post("/api/visitor/register", json={
        "visitor_name": name, "phone": phone, "school_from": "測試高中", "purpose": "參觀校園",
    })
    assert res.status_code == 201, res.get_json()


def test_visitor_can_book_and_cancel_own_visit(client):
    _register_visitor(client)
    day = _next_weekday()
    res = client.post("/api/campus/visits", json={
        "date": day, "slot": "上午 09:30-11:00", "party_size": 2, "contact_phone": "0911000111",
    })
    assert res.status_code == 200, res.get_json()
    visit_id = res.get_json()["data"]["id"]

    mine = client.get("/api/campus/visits").get_json()["data"]
    assert any(v["id"] == visit_id for v in mine)

    cancel = client.post(f"/api/campus/visits/{visit_id}", json={"action": "cancel"})
    assert cancel.status_code == 200
    assert cancel.get_json()["data"]["status"] == "已取消"


def test_cannot_book_weekend_or_past_date(client):
    _register_visitor(client)
    past = (date.today() - timedelta(days=1)).isoformat()
    assert client.post("/api/campus/visits", json={
        "date": past, "slot": "上午 09:30-11:00", "contact_phone": "0911000111",
    }).status_code == 400

    d = date.today() + timedelta(days=3)
    while d.isoweekday() <= 5:
        d += timedelta(days=1)
    assert d.isoweekday() > 5
    res = client.post("/api/campus/visits", json={
        "date": d.isoformat(), "slot": "上午 09:30-11:00", "contact_phone": "0911000111",
    })
    assert res.status_code == 400
    assert "週末" in res.get_json()["message"]


def test_slot_capacity_is_enforced(client):
    day = _next_weekday(14)
    for i in range(3):
        c = app_module.app.test_client()
        _register_visitor(c, name=f"訪客{i}", phone=f"091100022{i}")
        res = c.post("/api/campus/visits", json={
            "date": day, "slot": "下午 14:00-15:30", "contact_phone": f"091100022{i}",
        })
        assert res.status_code == 200, res.get_json()

    overflow_client = app_module.app.test_client()
    _register_visitor(overflow_client, name="訪客滿額", phone="0911009999")
    res = overflow_client.post("/api/campus/visits", json={
        "date": day, "slot": "下午 14:00-15:30", "contact_phone": "0911009999",
    })
    assert res.status_code == 409

    slots = overflow_client.get(f"/api/campus/visits/slots?date={day}").get_json()["data"]
    afternoon = next(s for s in slots if s["slot"] == "下午 14:00-15:30")
    assert afternoon["full"] is True and afternoon["booked"] == 3


def test_only_staff_can_confirm_visit(client, login):
    _register_visitor(client)
    day = _next_weekday()
    visit_id = client.post("/api/campus/visits", json={
        "date": day, "slot": "上午 09:30-11:00", "contact_phone": "0911000111",
    }).get_json()["data"]["id"]

    # 訪客自己不能核准
    assert client.post(f"/api/campus/visits/{visit_id}", json={"action": "confirm"}).status_code == 403

    login("admin", "admin123")
    res = client.post(f"/api/campus/visits/{visit_id}", json={"action": "confirm"})
    assert res.status_code == 200
    assert res.get_json()["data"]["status"] == "已確認"
