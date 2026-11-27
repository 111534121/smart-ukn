"""臨時停課／調課通知：學生看得到自己班的停調課，一鍵加入個人行事曆"""
from datetime import date, timedelta


def _changes(client):
    res = client.get("/api/campus/course-changes")
    assert res.status_code == 200, res.get_json()
    return res.get_json()["data"]


def _my_event_titles(client, day):
    d = date.fromisoformat(day)
    events = client.get(f"/api/campus/calendar/month?year={d.year}&month={d.month}").get_json()["events"]
    return {e["title"] for e in events if e["type"] == "personal" and e["start_date"] == day}


def test_student_sees_own_class_changes(client, login):
    login("student1")  # 資管五忠，示範資料有統計學停課、AI應用精準管理調課
    items = _changes(client)
    kinds = {c["course_name"]: c for c in items}
    assert kinds["統計學"]["kind"] == "停課" and kinds["AI應用精準管理"]["kind"] == "調課"
    assert all(not c["is_past"] and not c["in_calendar"] for c in items)
    assert "停課，補課" in kinds["統計學"]["summary"] and "調到" in kinds["AI應用精準管理"]["summary"]

    client.post("/api/auth/logout")
    login("S112004")  # 資管四孝
    assert _changes(client) == []


def test_roster_class_counts_without_class_group(client, login):
    """班級群組裡還沒有資管五忠 (舊的 campus_store.json)：照學籍班級也看得到"""
    from campus.common import store
    store.data["classes"] = []
    login("student1")
    assert {c["course_name"] for c in _changes(client)} == {"統計學", "AI應用精準管理"}


def test_add_to_calendar_once(client, login):
    login("student1")
    c = next(x for x in _changes(client) if x["kind"] == "調課")
    res = client.post(f"/api/campus/course-changes/{c['id']}/calendar")
    assert res.status_code == 200 and res.get_json()["added"] == 2
    assert client.post(f"/api/campus/course-changes/{c['id']}/calendar").status_code == 409
    assert any(t.startswith("🚫 調課（原時段不上課）：AI應用精準管理") for t in _my_event_titles(client, c["orig_date"]))
    assert "🔁 調課：AI應用精準管理 第 5-7 節 C3050" in _my_event_titles(client, c["new_date"])
    assert next(x for x in _changes(client) if x["id"] == c["id"])["in_calendar"] is True
    # 別班的停調課加不進來
    assert client.post("/api/campus/course-changes/999/calendar").status_code == 404


def test_classes_endpoint_matches_what_teacher_can_publish_to(client, login):
    """發布表單的班級下拉選單要跟後端實際接受的班級一致，不然選了也會被 403 擋下"""
    assert client.get("/api/campus/course-changes/classes").status_code == 401

    login("student1")
    assert client.get("/api/campus/course-changes/classes").status_code == 403
    client.post("/api/auth/logout")

    login("teacher1")  # 導師班 資管五忠
    res = client.get("/api/campus/course-changes/classes")
    assert res.status_code == 200
    classes = res.get_json()["data"]
    assert "資管五忠" in classes
    assert "護理四忠" not in classes  # 不是自己任教或導師班，不該出現在可選清單
    client.post("/api/auth/logout")

    login("admin", "admin123")
    assert "護理四忠" in client.get("/api/campus/course-changes/classes").get_json()["data"]  # 教職員/管理員看全部


def test_teacher_publishes_and_class_is_notified(client, login):
    day = (date.today() + timedelta(days=3)).isoformat()
    login("teacher1")  # 導師班 資管五忠
    assert client.post("/api/campus/course-changes", json={
        "kind": "調課", "class_name": "資管五忠", "course_name": "投資管理", "orig_date": day, "orig_periods": "2-4",
    }).status_code == 400  # 調課一定要有新時段
    assert client.post("/api/campus/course-changes", json={
        "kind": "停課", "class_name": "護理四忠", "course_name": "護理學", "orig_date": day, "orig_periods": "1-3",
    }).status_code == 403  # 不是自己任教或導師班
    assert client.post("/api/campus/course-changes", json={
        "kind": "停課", "class_name": "資管五忠", "course_name": "投資管理", "orig_date": day, "orig_periods": "9-3",
    }).status_code == 400
    res = client.post("/api/campus/course-changes", json={
        "kind": "停課", "class_name": "資管五忠", "course_name": "投資管理", "orig_date": day, "orig_periods": "2-4",
        "orig_room": "C4110", "reason": "颱風停課"})
    assert res.status_code == 200, res.get_json()

    client.post("/api/auth/logout")
    login("student1")
    mine = next(c for c in _changes(client) if c["course_name"] == "投資管理")
    assert mine["new_date"] == "" and "暫無補課" in mine["summary"]
    inbox = client.get("/api/campus/notices/inbox").get_json()["data"]
    assert any(n["title"] == "停課通知：投資管理" and n["priority"] == "緊急" for n in inbox)
    assert client.post(f"/api/campus/course-changes/{mine['id']}/calendar").get_json()["added"] == 1
