"""選課檢查：會擋的課標出原因、選完可以儲存 (有問題不能存)、家長看得到子女存的選課

student1 王小明：資料結構沒過 → 系統分析與設計 (CS301) 擋修；程式設計(二) 兩班都能選
student2 李美華：程式設計(二) 已及格
"""


def offerings(client):
    return {o["offering_id"]: o for o in client.get("/api/campus/course-plan/offerings").get_json()["data"]}


def save(client, ids):
    return client.put("/api/campus/course-plan/mine", json={"offering_ids": ids})


def test_offerings_carry_block_reasons_for_students(client, login):
    assert all(o["blocked"] is None for o in offerings(client).values())  # 未登入：前端自己判斷

    login("student1")
    off = offerings(client)
    assert off["CS301-A"]["blocked"].startswith("擋修") and "資料結構" in off["CS301-A"]["blocked"]
    assert off["CS102-A"]["blocked"] is None
    client.post("/api/auth/logout")
    login("student2")
    assert offerings(client)["CS102-B"]["blocked"] == "已經及格，不用再修"


def test_save_and_reload_plan(client, login):
    login("student1")
    assert client.get("/api/campus/course-plan/mine").get_json()["offering_ids"] is None
    res = save(client, ["CS102-A", "CS302-A", "EN102-A"])
    assert res.status_code == 200, res.get_json()
    body = res.get_json()
    assert "選填成功" in body["message"] and body["offering_ids"] == ["CS102-A", "CS302-A", "EN102-A"]
    mine = client.get("/api/campus/course-plan/mine").get_json()
    assert mine["offering_ids"] == ["CS102-A", "CS302-A", "EN102-A"] and mine["saved_at"]

    client.post("/api/auth/logout")
    login("parent1")  # 王小明的家長看得到，但不能改
    assert client.get("/api/campus/course-plan/mine").get_json()["offering_ids"] == ["CS102-A", "CS302-A", "EN102-A"]
    assert save(client, ["CS102-A"]).status_code == 403


def test_cannot_save_plan_with_problems(client, login):
    login("student1")
    cases = {
        "擋修": ["CS301-A"],
        "重複選課": ["CS102-A", "CS102-B"],
        "衝堂": ["CS302-A", "EN102-B"],  # 週三 3-5 節 vs 週三 3-4 節
    }
    for word, ids in cases.items():
        res = save(client, ids)
        assert res.status_code == 400 and word in res.get_json()["message"], (word, res.get_json())
    assert save(client, []).status_code == 400
    assert save(client, ["NOPE-A"]).status_code == 400
    assert client.get("/api/campus/course-plan/mine").get_json()["offering_ids"] is None  # 都沒存進去


def test_only_students_save(client, login):
    assert save(client, ["CS102-A"]).status_code == 401
    login("teacher1")
    assert save(client, ["CS102-A"]).status_code == 403
