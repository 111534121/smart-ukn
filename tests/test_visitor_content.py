"""訪客/新生參考用的公開內容：科系介紹與常見問題，不需要登入即可查詢。"""


def test_faq_is_public(client):
    res = client.get("/api/faq")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) > 0
    assert all({"category", "q", "a"} <= set(item) for item in data)


def test_departments_is_public_with_intro(client):
    res = client.get("/api/departments")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) == 8
    cs = next(d for d in data if d["dept_id"] == "CS")
    assert cs["intro"]
    assert isinstance(cs["highlights"], list) and len(cs["highlights"]) > 0
    assert isinstance(cs["careers"], list) and len(cs["careers"]) > 0
