"""活動報名：建立活動、報名/候補/自動遞補、取消報名的身分防呆、簽到、提醒信、滿意度評分。"""
import datetime


def _today():
    return datetime.date.today().isoformat()


def _tomorrow():
    return (datetime.date.today() + datetime.timedelta(days=1)).isoformat()


def _create_event(client, login, capacity=5, event_date=None):
    login("staff1")
    event_date = event_date or _tomorrow()
    res = client.post("/api/campus/events", json={
        "title": "系學會迎新茶會", "description": "歡迎新生", "location": "康寧樓 1 樓中廊",
        "event_date": event_date, "registration_deadline": _today(), "capacity": capacity,
    })
    assert res.status_code == 200, res.get_json()
    return res.get_json()["data"]["id"]


def _register(client, login, event_id, username, student_id, age=20):
    login(username)
    return client.post(f"/api/campus/events/{event_id}/register", json={
        "student_id": student_id, "full_name": "測試學生", "email": "test@example.com", "age": age,
    })


def test_create_event_rejects_bad_time_format(client, login):
    login("staff1")
    res = client.post("/api/campus/events", json={
        "title": "x", "location": "x", "event_date": _tomorrow(), "event_time": "下午三點",
        "registration_deadline": _today(), "capacity": 1,
    })
    assert res.status_code == 400
    assert "時間" in res.get_json()["message"]


def test_register_rejects_bad_phone_when_provided(client, login):
    event_id = _create_event(client, login)
    login("student1")
    res = client.post(f"/api/campus/events/{event_id}/register", json={
        "student_id": "S112001", "full_name": "王小明", "email": "test@example.com", "age": 20,
        "phone": "打我手機",
    })
    assert res.status_code == 400
    assert "電話" in res.get_json()["message"]


def test_non_staff_cannot_create_event(client, login):
    login("student1")
    res = client.post("/api/campus/events", json={
        "title": "x", "location": "x", "event_date": _tomorrow(),
        "registration_deadline": _today(), "capacity": 1,
    })
    assert res.status_code == 403


def test_register_rejects_bad_age(client, login):
    event_id = _create_event(client, login)
    bad = _register(client, login, event_id, "student1", "S112001", age=465878)
    assert bad.status_code == 400
    assert "年齡" in bad.get_json()["message"]
    too_young = _register(client, login, event_id, "student1", "S112001", age=0)
    assert too_young.status_code == 400


def test_duplicate_registration_is_blocked(client, login):
    event_id = _create_event(client, login)
    first = _register(client, login, event_id, "student1", "S112001")
    assert first.status_code == 200, first.get_json()
    again = _register(client, login, event_id, "student1", "S112001")
    assert again.status_code == 409


def test_capacity_full_goes_to_waitlist_then_auto_promotes_on_cancel(client, login):
    event_id = _create_event(client, login, capacity=1)

    first = _register(client, login, event_id, "student1", "S112001")
    assert first.status_code == 200
    assert first.get_json()["data"]["status"] == "已報名"
    first_reg_id = first.get_json()["data"]["id"]

    second = _register(client, login, event_id, "student2", "S112002")
    assert second.status_code == 200
    assert second.get_json()["data"]["status"] == "候補中"
    assert "候補" in second.get_json()["message"]

    login("student1")
    detail = client.get(f"/api/campus/events/{event_id}").get_json()["data"]
    assert detail["registered_count"] == 1 and detail["waitlist_count"] == 1 and detail["is_full"] is True

    cancel = client.post(f"/api/campus/events/{event_id}/registrations/{first_reg_id}/cancel")
    assert cancel.status_code == 200, cancel.get_json()
    assert "候補" in cancel.get_json()["message"]

    login("student2")
    mine = client.get(f"/api/campus/events/{event_id}").get_json()["data"]["my_registration"]
    assert mine["status"] == "已報名"  # 候補自動轉正取


def test_cannot_cancel_someone_elses_registration_by_guessing_id(client, login):
    """防呆重點：取消報名要用登入身分比對，光知道別人的報名 id/學號取消不了"""
    event_id = _create_event(client, login)
    res = _register(client, login, event_id, "student1", "S112001")
    reg_id = res.get_json()["data"]["id"]

    login("student2")
    blocked = client.post(f"/api/campus/events/{event_id}/registrations/{reg_id}/cancel")
    assert blocked.status_code == 403


def test_checkin_flow_and_attendance_rate(client, login):
    event_id = _create_event(client, login)
    res = _register(client, login, event_id, "student1", "S112001")
    checkin_code = res.get_json()["data"]["checkin_code"]

    login("staff1")
    ok_checkin = client.post(f"/api/campus/events/{event_id}/checkin", json={"checkin_code": checkin_code})
    assert ok_checkin.status_code == 200, ok_checkin.get_json()

    again = client.post(f"/api/campus/events/{event_id}/checkin", json={"checkin_code": checkin_code})
    assert again.status_code == 409

    detail = client.get(f"/api/campus/events/{event_id}").get_json()["data"]
    assert detail["checked_in_count"] == 1
    assert detail["attendance_rate"] == 1.0


def test_send_reminders_only_for_tomorrows_confirmed_registrations(client, login):
    event_id = _create_event(client, login, event_date=_tomorrow())
    _register(client, login, event_id, "student1", "S112001")

    login("staff1")
    res = client.post("/api/campus/events/send-reminders")
    assert res.status_code == 200
    assert res.get_json()["sent"] == 1

    # 已經提醒過的不會再寄第二次
    again = client.post("/api/campus/events/send-reminders")
    assert again.get_json()["sent"] == 0


def test_feedback_only_allowed_after_event_ends(client, login):
    future_event = _create_event(client, login, event_date=_tomorrow())
    _register(client, login, future_event, "student1", "S112001")
    login("student1")
    too_early = client.post(f"/api/campus/events/{future_event}/feedback", json={"rating": 5, "comment": "好"})
    assert too_early.status_code == 400

    past_event = _create_event(client, login, event_date=_today())
    _register(client, login, past_event, "student1", "S112001")
    login("student1")
    ok_feedback = client.post(f"/api/campus/events/{past_event}/feedback", json={"rating": 5, "comment": "很棒的活動"})
    assert ok_feedback.status_code == 200, ok_feedback.get_json()

    bad_rating = client.post(f"/api/campus/events/{past_event}/feedback", json={"rating": 9})
    assert bad_rating.status_code == 400


def test_search_and_filter_events(client, login):
    event_id = _create_event(client, login, capacity=1)
    login("student1")
    all_events = client.get("/api/campus/events").get_json()["data"]
    assert any(e["id"] == event_id for e in all_events)

    by_keyword = client.get("/api/campus/events?q=迎新").get_json()["data"]
    assert any(e["id"] == event_id for e in by_keyword)

    _register(client, login, event_id, "student1", "S112001")
    open_only = client.get("/api/campus/events?open_only=1").get_json()["data"]
    assert all(e["id"] != event_id for e in open_only)  # 已滿額的活動不會出現在「還有名額」篩選裡
