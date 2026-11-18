"""公開校園公告頁面 (/announcements)：給圖文選單等外部連結直接連過來，不需要登入，
跟嵌在首頁裡那個有分頁切換、天氣卡片的區塊是不同東西。
"""


def test_announcements_page_is_public(client):
    res = client.get("/announcements")
    assert res.status_code == 200
    assert "校園公告".encode() in res.data


def test_announcements_page_calls_public_api(client):
    """頁面本身不應該需要登入就能看到內容骨架；真正的公告資料由頁面內 JS 呼叫既有公開 API"""
    page = client.get("/announcements").data.decode("utf-8")
    assert "/api/campus/announcements" in page
    api_res = client.get("/api/campus/announcements")
    assert api_res.status_code == 200
