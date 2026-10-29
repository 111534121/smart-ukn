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


def test_staff_can_add_registration_bypassing_deadline(client, login):
    """現場/電話報名：教職員代登記可以不受線上報名截止日限制"""
    event_id = _create_event(client, login, event_date=_tomorrow())
    login("staff1")
    client.put(f"/api/campus/events/{event_id}", json={"registration_deadline": "2000-01-01"})

    res = client.post(f"/api/campus/events/{event_id}/registrations", json={
        "student_id": "S112001", "full_name": "王小明", "email": "test@example.com", "age": 20,
    })
    assert res.status_code == 200, res.get_json()
    assert res.get_json()["data"]["status"] == "已報名"


def test_non_staff_cannot_add_registration_via_admin_endpoint(client, login):
    event_id = _create_event(client, login)
    login("student1")
    res = client.post(f"/api/campus/events/{event_id}/registrations", json={
        "student_id": "S112001", "full_name": "王小明", "email": "test@example.com", "age": 20,
    })
    assert res.status_code == 403


def test_staff_can_edit_registration_and_duplicate_student_id_is_blocked(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]
    _register(client, login, event_id, "student2", "S112002")

    login("staff1")
    fixed = client.put(f"/api/campus/events/{event_id}/registrations/{reg1_id}", json={
        "student_id": "S112001", "full_name": "王小明", "email": "fixed@example.com", "age": 21,
    })
    assert fixed.status_code == 200, fixed.get_json()
    assert fixed.get_json()["data"]["email"] == "fixed@example.com"

    clash = client.put(f"/api/campus/events/{event_id}/registrations/{reg1_id}", json={
        "student_id": "S112002", "full_name": "王小明", "email": "fixed@example.com", "age": 21,
    })
    assert clash.status_code == 409


def test_non_staff_cannot_edit_registration(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]
    login("student1")
    res = client.put(f"/api/campus/events/{event_id}/registrations/{reg1_id}", json={
        "student_id": "S112001", "full_name": "王小明", "email": "test@example.com", "age": 20,
    })
    assert res.status_code == 403


def test_staff_delete_registration_promotes_waitlist(client, login):
    event_id = _create_event(client, login, capacity=1)
    first = _register(client, login, event_id, "student1", "S112001")
    first_reg_id = first.get_json()["data"]["id"]
    _register(client, login, event_id, "student2", "S112002")

    login("staff1")
    res = client.delete(f"/api/campus/events/{event_id}/registrations/{first_reg_id}")
    assert res.status_code == 200, res.get_json()
    assert "候補" in res.get_json()["message"]

    regs = client.get(f"/api/campus/events/{event_id}/registrations").get_json()["data"]
    assert not any(r["id"] == first_reg_id for r in regs)  # 真的從清單移除了，不是改狀態
    assert next(r for r in regs if r["student_id"] == "S112002")["status"] == "已報名"


def test_non_staff_cannot_delete_registration(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]
    login("student1")
    res = client.delete(f"/api/campus/events/{event_id}/registrations/{reg1_id}")
    assert res.status_code == 403


def test_registration_qr_code_visible_to_owner_and_staff_but_not_other_students(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg_id = r1.get_json()["data"]["id"]

    login("student1")
    mine = client.get(f"/api/campus/events/{event_id}/registrations/{reg_id}/qr.svg")
    assert mine.status_code == 200
    assert mine.mimetype == "image/svg+xml"

    login("student2")
    other = client.get(f"/api/campus/events/{event_id}/registrations/{reg_id}/qr.svg")
    assert other.status_code == 403

    login("staff1")
    staff = client.get(f"/api/campus/events/{event_id}/registrations/{reg_id}/qr.svg")
    assert staff.status_code == 200


def test_registration_qr_code_blocked_after_cancel(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg_id = r1.get_json()["data"]["id"]
    login("student1")
    cancel = client.post(f"/api/campus/events/{event_id}/registrations/{reg_id}/cancel")
    assert cancel.status_code == 200, cancel.get_json()
    res = client.get(f"/api/campus/events/{event_id}/registrations/{reg_id}/qr.svg")
    assert res.status_code == 400
    assert "取消" in res.get_json()["message"]


def test_staff_can_resend_notification(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]

    login("staff1")
    res = client.post(f"/api/campus/events/{event_id}/registrations/{reg1_id}/notify")
    assert res.status_code == 200, res.get_json()

    cancel = client.post(f"/api/campus/events/{event_id}/registrations/{reg1_id}/cancel")
    assert cancel.status_code == 200
    after_cancel = client.post(f"/api/campus/events/{event_id}/registrations/{reg1_id}/notify")
    assert after_cancel.status_code == 400


def test_non_staff_cannot_send_custom_notice(client, login):
    event_id = _create_event(client, login)
    login("student1")
    res = client.post(f"/api/campus/events/{event_id}/notify-custom", json={"subject": "x", "body": "x"})
    assert res.status_code == 403


def test_custom_notice_requires_subject_and_body(client, login):
    event_id = _create_event(client, login)
    login("staff1")
    res = client.post(f"/api/campus/events/{event_id}/notify-custom", json={"subject": "", "body": "x"})
    assert res.status_code == 400
    res = client.post(f"/api/campus/events/{event_id}/notify-custom", json={"subject": "x", "body": ""})
    assert res.status_code == 400


def test_custom_notice_to_single_registrant_records_notified(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]
    login("staff1")
    res = client.post(f"/api/campus/events/{event_id}/notify-custom",
                       json={"subject": "活動異動", "body": "地點改到活動中心", "reg_id": reg1_id})
    assert res.status_code == 200, res.get_json()
    assert res.get_json()["sent"] == 1

    reg = next(r for r in client.get(f"/api/campus/events/{event_id}/registrations").get_json()["data"]
               if r["id"] == reg1_id)
    assert reg["notified"] is True
    assert reg["notified_at"]


def test_custom_notice_rejects_cancelled_target(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]
    login("student1")
    client.post(f"/api/campus/events/{event_id}/registrations/{reg1_id}/cancel")
    login("staff1")
    res = client.post(f"/api/campus/events/{event_id}/notify-custom",
                       json={"subject": "x", "body": "x", "reg_id": reg1_id})
    assert res.status_code == 400
    assert "取消" in res.get_json()["message"]


def test_custom_notice_broadcast_to_all_excludes_cancelled(client, login):
    event_id = _create_event(client, login, capacity=5)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]
    _register(client, login, event_id, "student2", "S112002")
    login("student1")
    client.post(f"/api/campus/events/{event_id}/registrations/{reg1_id}/cancel")

    login("staff1")
    res = client.post(f"/api/campus/events/{event_id}/notify-custom",
                       json={"subject": "活動公告", "body": "請提早 10 分鐘到場"})
    assert res.status_code == 200, res.get_json()
    assert res.get_json()["sent"] == 1  # 只剩 student2 還是有效報名


def test_custom_notice_with_no_valid_registrants_errors(client, login):
    event_id = _create_event(client, login)
    login("staff1")
    res = client.post(f"/api/campus/events/{event_id}/notify-custom", json={"subject": "x", "body": "x"})
    assert res.status_code == 400
    assert "沒有有效的報名者" in res.get_json()["message"]


def test_events_admin_page_requires_staff_login(client, login):
    assert client.get("/admin/events").status_code == 401
    login("student1")
    assert client.get("/admin/events").status_code == 403

    login("staff1")
    res = client.get("/admin/events")
    assert res.status_code == 200
    assert b"html" in res.data.lower()


def test_registration_tracks_whether_confirmation_email_actually_sent(client, login):
    event_id = _create_event(client, login)
    res = _register(client, login, event_id, "student1", "S112001")
    assert res.status_code == 200
    assert res.get_json()["data"]["notified"] is True  # 測試用的 FakeMailer 一定寄得出去


def test_registration_marks_not_notified_when_mailer_fails(client, login, monkeypatch):
    import campus.events as events_module

    class FailingMailer:
        def send(self, *a, **k):
            raise RuntimeError("模擬寄信失敗")

    monkeypatch.setattr(events_module, "get_mailer", lambda: FailingMailer())
    event_id = _create_event(client, login)
    res = _register(client, login, event_id, "student1", "S112001")
    assert res.status_code == 200  # 寄信失敗不影響報名本身成功
    assert res.get_json()["data"]["notified"] is False
    assert "失敗" in res.get_json()["message"]


def test_my_registrations_lists_across_events_scoped_to_login_identity(client, login):
    event1 = _create_event(client, login, event_date=_tomorrow())
    event2 = _create_event(client, login, event_date=(datetime.date.today() + datetime.timedelta(days=2)).isoformat())
    _register(client, login, event1, "student1", "S112001")
    _register(client, login, event2, "student1", "S112001")
    _register(client, login, event1, "student2", "S112002")

    login("student1")
    mine = client.get("/api/campus/events/mine").get_json()["data"]
    assert {m["event_id"] for m in mine} == {event1, event2}
    assert all("event_title" in m and "event_date" in m for m in mine)

    login("student2")
    mine2 = client.get("/api/campus/events/mine").get_json()["data"]
    assert {m["event_id"] for m in mine2} == {event1}


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


def test_create_event_success_returns_full_fields(client, login):
    login("staff1")
    res = client.post("/api/campus/events", json={
        "title": "系學會迎新茶會", "description": "歡迎新生", "location": "康寧樓 1 樓中廊",
        "event_date": _tomorrow(), "event_time": "14:00", "registration_deadline": _today(), "capacity": 5,
    })
    assert res.status_code == 200, res.get_json()
    data = res.get_json()["data"]
    assert data["title"] == "系學會迎新茶會" and data["capacity"] == 5 and not data["cancelled"]


def test_event_benefit_note_shows_up_on_listing_and_mine(client, login):
    """活動效益/加分說明 (例如等同於某證照加分)：建立時可填，學生瀏覽活動與「我的報名」都要看得到"""
    event_id = _create_event(client, login)
    login("staff1")
    res = client.put(f"/api/campus/events/{event_id}", json={"benefit": "完成並簽到可登記為 CCAC 證照加分項目"})
    assert res.status_code == 200, res.get_json()
    assert res.get_json()["data"]["benefit"] == "完成並簽到可登記為 CCAC 證照加分項目"

    login("student1")
    listed = next(e for e in client.get("/api/campus/events").get_json()["data"] if e["id"] == event_id)
    assert listed["benefit"] == "完成並簽到可登記為 CCAC 證照加分項目"

    _register(client, login, event_id, "student1", "S112001")
    mine = next(r for r in client.get("/api/campus/events/mine").get_json()["data"] if r["event_id"] == event_id)
    assert mine["event_benefit"] == "完成並簽到可登記為 CCAC 證照加分項目"


def test_event_benefit_note_is_optional_and_defaults_empty(client, login):
    event_id = _create_event(client, login)
    ev = client.get(f"/api/campus/events/{event_id}").get_json()["data"]
    assert ev["benefit"] == ""


def test_event_eligibility_note_shows_up_on_listing_and_mine(client, login):
    """資格限定/報名對象 (例如限資訊管理科學生)：留空代表不限身分皆可報名"""
    event_id = _create_event(client, login)
    login("staff1")
    res = client.put(f"/api/campus/events/{event_id}", json={"eligibility": "限資訊管理科學生"})
    assert res.status_code == 200, res.get_json()
    assert res.get_json()["data"]["eligibility"] == "限資訊管理科學生"

    login("student1")
    listed = next(e for e in client.get("/api/campus/events").get_json()["data"] if e["id"] == event_id)
    assert listed["eligibility"] == "限資訊管理科學生"

    _register(client, login, event_id, "student1", "S112001")
    mine = next(r for r in client.get("/api/campus/events/mine").get_json()["data"] if r["event_id"] == event_id)
    assert mine["event_eligibility"] == "限資訊管理科學生"


def test_event_eligibility_note_is_optional_and_defaults_empty(client, login):
    event_id = _create_event(client, login)
    ev = client.get(f"/api/campus/events/{event_id}").get_json()["data"]
    assert ev["eligibility"] == ""


def test_create_event_rejects_deadline_after_event_date(client, login):
    login("staff1")
    res = client.post("/api/campus/events", json={
        "title": "x", "location": "x", "event_date": _today(),
        "registration_deadline": _tomorrow(), "capacity": 1,
    })
    assert res.status_code == 400
    assert "報名截止日" in res.get_json()["message"]


def test_staff_can_update_event(client, login):
    event_id = _create_event(client, login, capacity=5)
    login("staff1")
    res = client.put(f"/api/campus/events/{event_id}", json={"title": "改名後的活動", "capacity": 10})
    assert res.status_code == 200, res.get_json()
    assert res.get_json()["data"]["title"] == "改名後的活動"
    assert res.get_json()["data"]["capacity"] == 10


def test_update_event_rejects_capacity_below_confirmed_count(client, login):
    event_id = _create_event(client, login, capacity=5)
    _register(client, login, event_id, "student1", "S112001")
    _register(client, login, event_id, "student2", "S112002")
    login("staff1")
    res = client.put(f"/api/campus/events/{event_id}", json={"capacity": 1})
    assert res.status_code == 400
    assert "2 人確認報名" in res.get_json()["message"]


def test_non_staff_cannot_update_event(client, login):
    event_id = _create_event(client, login)
    login("student1")
    res = client.put(f"/api/campus/events/{event_id}", json={"title": "x"})
    assert res.status_code == 403


def test_staff_can_cancel_event_and_notifies_registrants(client, login):
    event_id = _create_event(client, login)
    r1 = _register(client, login, event_id, "student1", "S112001")
    reg1_id = r1.get_json()["data"]["id"]

    login("staff1")
    res = client.delete(f"/api/campus/events/{event_id}")
    assert res.status_code == 200, res.get_json()
    assert "已通知 1/1 位報名者" in res.get_json()["message"]

    reg = next(r for r in client.get(f"/api/campus/events/{event_id}/registrations").get_json()["data"]
               if r["id"] == reg1_id)
    assert reg["notified"] is True  # 測試用的 FakeMailer 一定寄得出去

    ev = client.get(f"/api/campus/events/{event_id}").get_json()["data"]
    assert ev["cancelled"] is True


def test_cannot_cancel_already_cancelled_event(client, login):
    event_id = _create_event(client, login)
    login("staff1")
    client.delete(f"/api/campus/events/{event_id}")
    res = client.delete(f"/api/campus/events/{event_id}")
    assert res.status_code == 400


def test_non_staff_cannot_cancel_event(client, login):
    event_id = _create_event(client, login)
    login("student1")
    res = client.delete(f"/api/campus/events/{event_id}")
    assert res.status_code == 403
