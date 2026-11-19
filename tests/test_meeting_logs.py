"""會議留痕：會中文字討論、出席紀錄、會議紀錄與保存期限 (3 / 6 / 12 個月後自動刪除)"""
from datetime import datetime, timedelta

from campus import meetings as meetings_module


def _start_now_meeting(client, login):
    """teacher1 開一場現在就能進入的會議，邀請導師班資管五忠 (含 student1)"""
    login("teacher1")
    res = client.post("/api/campus/meetings", json={"title": "專題進度討論", "start_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                                                     "duration_min": 60, "classes": ["資管五忠"]})
    assert res.status_code == 200, res.get_json()
    return res.get_json()["id"]


def _as(client, login, username):
    client.post("/api/auth/logout")
    login(username)


def test_chat_between_members_only(client, login):
    mid = _start_now_meeting(client, login)
    assert client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "大家好，先報告進度"}).status_code == 200

    _as(client, login, "student1")
    msgs = client.get(f"/api/campus/meetings/{mid}/chat").get_json()
    assert msgs["can_post"] is True
    assert [(m["content"], m["is_mine"]) for m in msgs["data"]] == [("大家好，先報告進度", False)]
    first_id = msgs["data"][0]["id"]
    assert client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "  "}).status_code == 400
    assert client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "x" * 501}).status_code == 400
    assert client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "我這週做完登入頁"}).status_code == 200
    # after 只拿新的
    newer = client.get(f"/api/campus/meetings/{mid}/chat?after={first_id}").get_json()["data"]
    assert [(m["content"], m["is_mine"]) for m in newer] == [("我這週做完登入頁", True)]

    _as(client, login, "S112004")  # 不是成員
    assert client.get(f"/api/campus/meetings/{mid}/chat").status_code == 403
    assert client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "偷看"}).status_code == 403
    assert client.get(f"/api/campus/meetings/{mid}/record").status_code == 403


def test_attendance_minutes_and_download(client, login):
    mid = _start_now_meeting(client, login)
    assert client.post(f"/api/campus/meetings/{mid}/enter").status_code == 200
    client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "下週交初稿"})
    res = client.put(f"/api/campus/meetings/{mid}/record", json={"minutes": "決議：下週五交初稿", "keep_months": 6})
    assert res.status_code == 200, res.get_json()
    assert client.put(f"/api/campus/meetings/{mid}/record", json={"minutes": "x", "keep_months": 2}).status_code == 400

    _as(client, login, "student1")
    client.post(f"/api/campus/meetings/{mid}/enter")
    client.post(f"/api/campus/meetings/{mid}/enter")  # 重進一次只加次數
    assert client.put(f"/api/campus/meetings/{mid}/record", json={"minutes": "改掉"}).status_code == 403
    r = client.get(f"/api/campus/meetings/{mid}/record").get_json()["data"]
    assert r["minutes"] == "決議：下週五交初稿" and r["keep_months"] == 6 and r["is_host"] is False
    names = {a["name"]: a for a in r["attendance"]}
    assert len(names) == 2 and any(a["is_host"] for a in r["attendance"])
    assert max(a["join_count"] for a in r["attendance"]) == 2
    assert any(not x["attended"] for x in r["invited"])  # 班上其他沒進來的同學算未出席
    end = datetime.strptime(r["end_at"], "%Y-%m-%d %H:%M")
    assert r["keep_until"] == meetings_module.add_months(end, 6).strftime("%Y-%m-%d")

    dl = client.get(f"/api/campus/meetings/{mid}/record/download")
    assert dl.status_code == 200 and "attachment" in dl.headers["Content-Disposition"]
    text = dl.data.decode("utf-8-sig")
    assert "決議：下週五交初稿" in text and "下週交初稿" in text and "【出席紀錄】" in text and "未出席：" in text


def test_logs_deleted_after_keep_period(client, login):
    mid = _start_now_meeting(client, login)
    client.post(f"/api/campus/meetings/{mid}/enter")
    client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "要被刪掉的訊息"})
    client.put(f"/api/campus/meetings/{mid}/record", json={"minutes": "紀錄", "keep_months": 3})

    meetings_module.purge_expired_logs(datetime.now() + timedelta(days=60))  # 還沒到 3 個月
    assert client.get(f"/api/campus/meetings/{mid}/record").get_json()["data"]["minutes"] == "紀錄"

    meetings_module.purge_expired_logs(datetime.now() + timedelta(days=100))
    r = client.get(f"/api/campus/meetings/{mid}/record").get_json()["data"]
    assert r["purged"] is True and r["minutes"] == "" and r["messages"] == [] and r["attendance"] == []
    assert r["keep_months"] == 3  # 期限不會被重算成預設 12 個月
    assert client.put(f"/api/campus/meetings/{mid}/record", json={"minutes": "補寫", "keep_months": 12}).status_code == 400


def test_chat_read_only_after_cancel(client, login):
    mid = _start_now_meeting(client, login)
    client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "開會前留言"})
    assert client.post(f"/api/campus/meetings/{mid}/cancel").status_code == 200
    assert client.post(f"/api/campus/meetings/{mid}/chat", json={"content": "取消後"}).status_code == 400
    assert client.post(f"/api/campus/meetings/{mid}/enter").status_code == 400
    chat = client.get(f"/api/campus/meetings/{mid}/chat").get_json()
    assert chat["can_post"] is False and [m["content"] for m in chat["data"]] == ["開會前留言"]


def test_add_months_clamps_month_end():
    assert meetings_module.add_months(datetime(2026, 11, 30, 10, 0), 3) == datetime(2027, 2, 28, 10, 0)
    assert meetings_module.add_months(datetime(2026, 1, 15), 12) == datetime(2027, 1, 15)
