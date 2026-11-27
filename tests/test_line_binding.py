"""LINE 帳號綁定與「我的常用功能」：代碼綁定流程、LIFF 端讀寫常用功能、跟網站端共用同一份資料。

verify_line_id_token 實際會打 LINE 官方 API，測試一律 monkeypatch 成假驗證結果，
避免測試連外網，也讓測試能模擬「驗證成功／失敗」兩種情況。
"""
from campus import line_binding


def test_liff_favorites_page_injects_liff_id(client, monkeypatch):
    """「我的常用功能」LIFF 頁面 (/liff/favorites) 要注入正確的 LIFF ID，跟「設定常用功能」(/liff/menu) 用不同的 LIFF app，
    避免兩個入口混用同一個 ID 導致都顯示設定頁 (過去真的發生過的設定錯誤)"""
    monkeypatch.setenv("LINE_LIFF_ID_FAVORITES", "2012266647-ftqZLpK3")
    monkeypatch.setenv("LINE_LIFF_ID", "2012266647-el203x6g")
    res = client.get("/liff/favorites")
    assert res.status_code == 200
    assert b"2012266647-ftqZLpK3" in res.data
    assert b"__LIFF_ID__" not in res.data


def test_liff_favorites_is_display_only_not_settings_page(client):
    """/liff/favorites 是「顯示已選常用功能」的頁面，不是「設定常用功能」那份 (menu.html)；
    兩者網址跟內容都要不一樣，才不會點兩個入口看到同一頁"""
    favorites = client.get("/liff/favorites").data
    menu = client.get("/liff/menu").data
    assert favorites != menu
    assert "我的常用功能".encode() in favorites


def test_liff_favorites_links_use_hash_catalog_key_not_dom_id(client):
    """常用功能卡片連結要用 #calendar 這種 catalog key，網站的 tabFromHash() 是靠這個找 FEATURES，
    之前錯用 #tab-calendar 這種 DOM id 會找不到對應功能、直接退回首頁 (這裡曾經真的壞過)"""
    html = client.get("/liff/favorites").data.decode("utf-8")
    assert "href=\"/#${f.key}\"" in html
    assert "tab-calendar" not in html
    assert "TAB_OF" not in html


def test_liff_menu_and_favorites_mark_teacher_only_items(client):
    """老師專用項目 (我的課表/我的導師班) 要標記 staffOnly，學生登入時這兩格不該出現在設定常用功能
    或我的常用功能清單裡 (之前學生帳號真的看得到並點得進去)"""
    for path in ("/liff/menu", "/liff/favorites"):
        html = client.get(path).data.decode("utf-8")
        assert "staffOnly: true" in html
        assert "key: 'my-schedule', name: '🗓️ 我的課表（老師）', staffOnly: true" in html
        assert "key: 'my-class', name: '🏫 我的導師班（老師／教職員）', staffOnly: true" in html


def test_liff_menu_shows_pin_limit(client):
    """常用功能最多只能放 12 個是伺服器端的真實限制 (campus/services.py set_pinned)，
    設定頁要明確顯示這個上限，不能悄悄截斷卻不告訴使用者"""
    html = client.get("/liff/menu").data.decode("utf-8")
    assert "MAX_PINNED = 12" in html
    assert "最多只能放" in html


def test_liff_notices_page_injects_liff_id(client, monkeypatch):
    """「我的公告」LIFF 頁面 (/liff/notices) 要注入自己的 LIFF ID，不跟其他 LIFF app 共用"""
    monkeypatch.setenv("LINE_LIFF_ID_NOTICES", "2012266647-testNotice")
    res = client.get("/liff/notices")
    assert res.status_code == 200
    assert b"2012266647-testNotice" in res.data
    assert b"__LIFF_ID__" not in res.data


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
    # PUT 回應也要帶 role，LIFF 頁面存檔後重新渲染才能正確過濾老師專用項目，不能只有 GET 才有
    assert update.get_json()["data"]["role"] == "學生"

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


def test_schedule_requires_valid_token(client):
    res = client.get("/api/line/schedule", headers={"X-Line-Id-Token": "bad-token"})
    assert res.status_code == 401


def test_schedule_unbound_reports_unbound(client, monkeypatch):
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify("U" + "6" * 32))
    res = client.get("/api/line/schedule", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 200
    assert res.get_json()["data"]["bound"] is False


def test_schedule_for_bound_student(client, login, monkeypatch):
    login("student1")
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    line_user_id = "U" + "7" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(line_user_id))
    client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})

    res = client.get("/api/line/schedule", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["bound"] is True
    assert data["username"] == "student1"
    assert data["student"]["student_id"] == "S112001"
    assert isinstance(data["schedule"], list) and data["schedule"]


def test_schedule_for_bound_teacher_shows_own_timetable_not_a_student_schedule(client, login, monkeypatch):
    """老師沒有學號，「我的課表」要是自己的授課課表 (teacher_name/timetable)，不是學生那套 (student/schedule)"""
    login("teacher1")  # 彭賓鈺，示範課表資管五忠「統計學」等課
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    line_user_id = "U" + "8" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(line_user_id))
    client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})

    res = client.get("/api/line/schedule", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["bound"] is True and data["role"] == "老師"
    assert data["teacher_name"] == "彭賓鈺"
    assert isinstance(data["timetable"], list) and data["timetable"]
    assert "student" not in data and "schedule" not in data


def test_notices_requires_valid_token(client):
    res = client.get("/api/line/notices", headers={"X-Line-Id-Token": "bad-token"})
    assert res.status_code == 401


def test_notices_unbound_reports_unbound(client, monkeypatch):
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify("U" + "8" * 32))
    res = client.get("/api/line/notices", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 200
    assert res.get_json()["data"]["bound"] is False


def test_notices_for_bound_student_matches_website_inbox(client, login, monkeypatch):
    """LIFF 端看到的公告要跟網站的 /api/campus/notices/inbox 一致，且標記已讀後兩邊同步"""
    login("teacher1")  # advised_class = 資管五忠，跟 student1 同班
    sent = client.post("/api/campus/notices", json={
        "class_name": "資管五忠", "title": "LIFF 測試公告", "content": "請留意", "priority": "重要",
    })
    assert sent.status_code == 200, sent.get_json()
    client.post("/api/auth/logout")

    login("student1")
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    line_user_id = "U" + "9" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(line_user_id))
    client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})
    client.post("/api/auth/logout")

    res = client.get("/api/line/notices", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["bound"] is True
    assert data["username"] == "student1"
    mine = next(n for n in data["items"] if n["title"] == "LIFF 測試公告")
    assert mine["priority"] == "重要"
    assert mine["is_read"] is False
    assert data["unread_count"] >= 1

    login("student1")
    client.post(f"/api/campus/notices/{mine['id']}/read")
    client.post("/api/auth/logout")

    res2 = client.get("/api/line/notices", headers={"X-Line-Id-Token": "good-token"})
    mine2 = next(n for n in res2.get_json()["data"]["items"] if n["title"] == "LIFF 測試公告")
    assert mine2["is_read"] is True


def test_teacher_notices_shows_sent_class_notices_not_an_error(client, login, monkeypatch):
    """老師沒有學號，「我的公告」對老師來說不是收到的班級通知，而是自己發出去的通知跟已讀狀況，
    不應該走學生那套學號檢查、回一個不相干的 403"""
    login("teacher1")  # 導師班 資管五忠，示範資料有老師發出去的停課/調課通知
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    line_user_id = "U" + "a" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(line_user_id))
    client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})

    res = client.get("/api/line/notices", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["bound"] is True and data["role"] == "老師"
    assert "sent_count" in data and all("recipient_count" in i and "read_count" in i for i in data["items"])


def test_staff_without_student_id_or_teacher_role_gets_clear_error(client, login, monkeypatch):
    """教職員/管理員既沒有學號、也不是老師，沒有「我的公告」可以查，要回清楚的錯誤，不是不相干的資料"""
    login("staff1")
    code = client.post("/api/line/bind/start").get_json()["data"]["code"]
    line_user_id = "U" + "b" * 32
    monkeypatch.setattr(line_binding, "verify_line_id_token", _fake_verify(line_user_id))
    client.post("/api/line/bind/confirm", json={"code": code, "id_token": "good-token"})

    res = client.get("/api/line/notices", headers={"X-Line-Id-Token": "good-token"})
    assert res.status_code == 403
