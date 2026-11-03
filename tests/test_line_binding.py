"""LINE 帳號綁定與「我的常用功能」：代碼綁定流程、LIFF 端讀寫常用功能、跟網站端共用同一份資料。

verify_line_id_token 實際會打 LINE 官方 API，測試一律 monkeypatch 成假驗證結果，
避免測試連外網，也讓測試能模擬「驗證成功／失敗」兩種情況。
"""
from campus import line_binding


def _fake_verify(line_user_id):
    def verify(id_token):
        return line_user_id if id_token == "good-token" else None
    return verify


def test_bind_start_requires_login(client):
    res = client.post("/api/line/bind/start")
    assert res.status_code == 401


def test_bind_confirm_rejects_bad_token(client, login, monkeypatch):
    login("student1")
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify("U" + "0" * 32))
    res = client.post("/api/line/bind/confirm", json={"code": code, "id_token": "bad-token"})
    assert res.status_code == 401


def test_bind_confirm_rejects_unknown_code(client, login, monkeypatch):
    login("student1")
    client.post("/api/line/bind/start")
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify("U" + "0" * 32))
    res = client.post("/api/line/bind/confirm", json={"code": "000000", "id_token": "good-token"})
    assert res.status_code == 400


def test_full_bind_then_read_and_write_menu(client, login, monkeypatch):
    login("student1")
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    line_user_id = "U" + "1" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(line_user_id))

    confirm = client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})
    assert confirm.status_code == 200, confirm.get_json()
    assert confirm.get_json()["data"]["username"] == "student1"

    # 代碼只能用一次
    again = client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})
    assert again.status_code == 400

    menu = client.get("/api/line/menu", headers={"X-Line-Id-Token": "good-token"})
    assert menu.status_code == 200
    body = menu.get_json()["data"]
    assert body["bound"] is True
    assert body["username"] == "student1"
    assert isinstance(body["pinned"], list)

    update = client.put("/api/line/menu", json={"pinned": ["events", "calendar"]},
                        headers={"X-Line-Id-Token": "good-token"})
    assert update.status_code == 200
    assert update.get_json()["data"]["pinned"] == ["events", "calendar"]

    # 網站端讀到的置頂跟 LINE 端寫入的是同一份資料
    web_prefs = client.get("/api/campus/prefs").get_json()["data"]
    assert web_prefs["pinned"] == ["events", "calendar"]


def test_menu_without_binding_reports_unbound(client, monkeypatch):
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify("U" + "2" * 32))
    res = client.get("/api/line/menu", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 200
    assert res.get_json()["data"]["bound"] is False


def test_unbind_removes_binding(client, login, monkeypatch):
    login("student1")
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    line_user_id = "U" + "3" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(line_user_id))
    client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})

    unbind = client.post("/api/line/unbind", json={"id_token": "good-token"})
    assert unbind.status_code == 200

    menu = client.get("/api/line/menu", headers={"X-Line-Id-Token": "good-token"})
    assert menu.get_json()["data"]["bound"] is False


def test_rebinding_moves_username_to_new_line_user(client, login, monkeypatch):
    """同一個帳號重新取代碼綁定到新的 LINE 帳號：舊的 LINE user id 不會再對到這個帳號。"""
    login("student1")
    code1 = client.post("/api/line/bind/start").get_json()["data"]["code"]
    first_line_user = "U" + "4" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(first_line_user))
    client.post("/api/line/bind/confirm", json={"code": code1, "id_token": "good-token"})

    code2 = client.post("/api/line/bind/start").get_json()["data"]["code"]
    second_line_user = "U" + "5" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(second_line_user))
    client.post("/api/line/bind/confirm", json={"code": code2, "id_token": "good-token"})

    assert line_binding.username_for_line_user(second_line_user) == "student1"
    assert line_binding.username_for_line_user(first_line_user) is None


def test_oa_info_not_ready_without_env(client, monkeypatch):
    monkeypatch.delenv("LINE_OA_ID", raising=False)
    res = client.get("/api/line/oa")
    assert res.status_code == 200
    assert res.get_json()["data"]["ready"] is False


def test_oa_info_and_qr_with_env(client, monkeypatch):
    monkeypatch.setenv("LINE_OA_ID", "@096fewkp")
    info = client.get("/api/line/oa").get_json()["data"]
    assert info["ready"] is True
    assert info["add_friend_url"] == "https://line.me/R/ti/p/@096fewkp"

    qr = client.get("/api/line/oa-qr.svg")
    assert qr.status_code == 200
    assert qr.mimetype == "image/svg+xml"
