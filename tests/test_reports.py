"""報表與文件庫：上傳/下載/收藏/瀏覽統計/同分類上架通知，先前沒有專屬測試檔，這次一併補上。"""
import io


def _upload(client, login, category="公告", title="測試檔案", roles=None):
    login("staff1")
    data = {"title": title, "category": category, "description": "測試說明"}
    if roles:
        data["allowed_roles"] = roles
    data["file"] = (io.BytesIO(b"%PDF-1.4 fake"), "demo.pdf")
    return client.post("/api/campus/reports", data=data, content_type="multipart/form-data")


def test_upload_requires_staff(client, login):
    login("student1")
    res = client.post("/api/campus/reports", data={"title": "x", "category": "x"}, content_type="multipart/form-data")
    assert res.status_code == 403


def test_upload_list_and_role_based_access(client, login):
    res = _upload(client, login, roles="老師,教職員,管理員")
    assert res.status_code == 200, res.get_json()
    file_id = res.get_json()["data"]["id"]

    login("student1")
    visible = client.get("/api/campus/reports").get_json()["data"]
    assert all(f["id"] != file_id for f in visible)  # 學生不在 allowed_roles 裡，看不到

    login("staff1")
    visible = client.get("/api/campus/reports").get_json()["data"]
    assert any(f["id"] == file_id for f in visible)


def test_download_counts_and_denies_unauthorized_role(client, login):
    file_id = _upload(client, login, roles="教職員,管理員").get_json()["data"]["id"]

    login("student1")
    denied = client.get(f"/api/campus/reports/{file_id}/download")
    assert denied.status_code == 403

    login("staff1")
    ok_dl = client.get(f"/api/campus/reports/{file_id}/download")
    assert ok_dl.status_code == 200

    stats = client.get(f"/api/campus/reports/{file_id}/stats").get_json()["data"]
    assert stats["total_downloads"] == 1
    assert stats["denied_attempts"] == 1


def test_favorite_and_unfavorite(client, login):
    file_id = _upload(client, login).get_json()["data"]["id"]
    login("student1")
    assert client.post(f"/api/campus/reports/{file_id}/favorite").status_code == 200
    mine = client.get("/api/campus/reports/my/favorites").get_json()["data"]
    assert any(f["id"] == file_id for f in mine)

    assert client.delete(f"/api/campus/reports/{file_id}/favorite").status_code == 200
    mine = client.get("/api/campus/reports/my/favorites").get_json()["data"]
    assert not any(f["id"] == file_id for f in mine)


def test_notify_category_watchers_on_new_upload(client, login):
    first_id = _upload(client, login, category="獎學金公告", title="第一份公告").get_json()["data"]["id"]
    login("student1")
    client.get(f"/api/campus/reports/{first_id}/download")  # 留下下載紀錄，之後才會被通知

    res = _upload(client, login, category="獎學金公告", title="第二份公告")
    assert res.status_code == 200
    assert "已通知 1 位" in res.get_json()["message"]


def test_delete_file_removes_it(client, login):
    file_id = _upload(client, login).get_json()["data"]["id"]
    login("staff1")
    assert client.delete(f"/api/campus/reports/{file_id}").status_code == 200
    assert client.delete(f"/api/campus/reports/{file_id}").status_code == 404
