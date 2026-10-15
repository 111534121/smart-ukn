"""輸入防呆補強：空間借用人數、申辦指引/同義詞類別 ID、緊急聯絡電話格式。"""
import datetime


def _next_weekday():
    d = datetime.date.today() + datetime.timedelta(days=1)
    while d.isoweekday() > 5:
        d += datetime.timedelta(days=1)
    return d.isoformat()


def test_book_room_rejects_non_numeric_people(client, login):
    login("student1")
    res = client.post("/api/campus/rooms/book", json={
        "room_id": "D201", "date": _next_weekday(), "period_start": 1, "period_end": 1,
        "purpose": "討論", "people": "約5人",
    })
    assert res.status_code == 400
    assert "人數" in res.get_json()["message"]


def test_manage_checklists_rejects_non_numeric_category_id(client, login):
    login("admin", "admin123")
    res = client.post("/api/checklists", json={"business_name": "測試申辦項目", "category_id": "abc"})
    assert res.status_code == 400


def test_manage_synonyms_rejects_non_numeric_category_id(client, login):
    login("admin", "admin123")
    res = client.post("/api/synonyms", json={"user_keyword": "測試詞", "official_term": "正式名稱", "category_id": "abc"})
    assert res.status_code == 400


def test_emergency_contact_rejects_bad_phone(client, login):
    login("student1")
    res = client.put("/api/student/emergency-contact", json={"parent_phone": "打我手機"})
    assert res.status_code == 400
    assert "電話" in res.get_json()["message"]


def test_emergency_contact_accepts_valid_phone(client, login):
    login("student1")
    res = client.put("/api/student/emergency-contact", json={"parent_phone": "0912-345-678"})
    assert res.status_code == 200
