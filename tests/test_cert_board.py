"""證照牆：便利貼位置自己排、只能存自己的證照"""


def my_ids(client):
    return [i["id"] for i in client.get("/api/campus/certs/mine").get_json()["data"]]


def test_board_saves_positions_and_clamps(client, login):
    login("student1")
    ids = my_ids(client)
    assert ids, "示範資料裡王小明要有證照或比賽紀錄"
    assert client.get("/api/campus/certs/board").get_json()["layout"] == {}

    first = str(ids[0])
    res = client.put("/api/campus/certs/board", json={"positions": {first: {"x": 1.7, "y": -3, "z": 2}}})
    assert res.status_code == 200
    assert res.get_json()["layout"][first] == {"x": 1.0, "y": 0.0, "z": 2}  # 超出範圍會被拉回牆內
    assert client.get("/api/campus/certs/board").get_json()["layout"][first]["x"] == 1.0

    assert client.put("/api/campus/certs/board", json={"positions": {first: {"x": "左邊", "y": 0}}}).status_code == 400
    assert client.put("/api/campus/certs/board", json={"positions": []}).status_code == 400


def test_board_ignores_other_students_certs(client, login):
    login("student2")
    others = [i["id"] for i in client.get("/api/campus/certs/mine").get_json()["data"]]
    client.post("/api/auth/logout")
    login("student1")
    mine = set(my_ids(client))
    foreign = next(i for i in others if i not in mine)
    res = client.put("/api/campus/certs/board", json={"positions": {str(foreign): {"x": 0.5, "y": 0.5}}})
    assert res.status_code == 200 and res.get_json()["layout"] == {}


def test_board_is_students_only(client, login):
    assert client.get("/api/campus/certs/board").status_code == 401
    login("parent1")
    assert client.get("/api/campus/certs/board").status_code == 403
