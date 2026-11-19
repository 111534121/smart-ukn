"""行事曆標出線上會議與班級通知"""
from datetime import datetime, timedelta


def month_events(client, when):
    res = client.get(f"/api/campus/calendar/month?year={when.year}&month={when.month}")
    assert res.status_code == 200
    return res.get_json()["events"]


def test_meeting_and_notice_marked_on_calendar(client, login):
    start = datetime.now() + timedelta(days=1)
    due = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    login("teacher1")  # 導師班 資管五忠
    meeting = client.post("/api/campus/meetings", json={"title": "專題討論", "start_at": start.strftime("%Y-%m-%d 14:00"),
                                                         "duration_min": 60, "classes": ["資管五忠"]})
    assert meeting.status_code == 200, meeting.get_json()
    notice = client.post("/api/campus/notices", json={"class_name": "資管五忠", "title": "繳交實習資料",
                                                       "content": "請帶身分證影本", "due_date": due})
    assert notice.status_code == 200, notice.get_json()

    # 主持人自己的月曆也有會議
    host = [e for e in month_events(client, start) if e["type"] == "meeting"]
    assert any("專題討論" in e["title"] and e["start_date"] == start.strftime("%Y-%m-%d") for e in host)

    client.post("/api/auth/logout")
    login("student1")  # 資管五忠
    events = month_events(client, start) + month_events(client, datetime.strptime(due, "%Y-%m-%d"))
    meet = next(e for e in events if e["type"] == "meeting")
    assert meet["title"] == "🎥 14:00 專題討論" and meet["category"] == "會議"
    assert "14:00–15:00" in meet["detail"]["note"] and meet["detail"]["goto"]["tab"] == "tab-meetings"
    notices = [e for e in events if e["type"] == "notice" and "繳交實習資料" in e["title"]]
    titles = {e["title"] for e in notices}
    assert "📣 繳交實習資料" in titles and "📣 期限：繳交實習資料" in titles
    assert next(e for e in notices if "期限" in e["title"])["start_date"] == due
    assert "（未讀）" in notices[0]["detail"]["note"]


def test_other_class_does_not_see_them(client, login):
    start = datetime.now() + timedelta(days=1)
    login("teacher1")
    client.post("/api/campus/meetings", json={"title": "只有五忠", "start_at": start.strftime("%Y-%m-%d 10:00"),
                                              "duration_min": 30, "classes": ["資管五忠"]})
    client.post("/api/campus/notices", json={"class_name": "資管五忠", "title": "五忠才有", "content": "內容"})
    client.post("/api/auth/logout")
    login("S112004")  # 資管四孝，不是 teacher1 的導師班
    events = month_events(client, start) + month_events(client, datetime.now())
    assert not any("只有五忠" in e["title"] or "五忠才有" in e["title"] for e in events)


def test_guest_calendar_has_no_personal_marks(client):
    events = month_events(client, datetime.now())
    assert not any(e["type"] in ("meeting", "notice") for e in events)
