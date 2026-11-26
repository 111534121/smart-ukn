"""官網規章題庫、表單下載查詢與常用表單、老師辦公室名錄與審核"""
import io

from campus.official_rules import OFFICIAL_RULES, OFFICIAL_SYNONYMS


# ---------- 規章題庫 ----------

def test_rules_have_official_sources_and_unique_terms():
    terms = [r["official_term"] for r in OFFICIAL_RULES]
    assert len(terms) == len(set(terms))
    assert len({r["id"] for r in OFFICIAL_RULES}) == len(OFFICIAL_RULES)
    for r in OFFICIAL_RULES:
        assert r["url"].startswith("https://") and "ukn.edu.tw" in r["url"] and r["page"] >= 1
    # 每個口語詞都要對應到存在的規章，且只對應一題
    words = [w for _, w, _ in OFFICIAL_SYNONYMS]
    assert len(words) == len(set(words))
    assert {t for _, _, t in OFFICIAL_SYNONYMS} <= set(terms)


# ---------- 表單下載 ----------

def test_forms_list_and_search_without_login(client):
    data = client.get("/api/campus/forms").get_json()
    assert data["logged_in"] is False and len(data["data"]) == 5
    assert not any(f["is_favorite"] for f in data["data"])
    titles = lambda q: [f["title"] for f in client.get("/api/campus/forms", query_string={"q": q}).get_json()["data"]]
    assert titles("請假") == ["學生請假單"]  # 兩個字要完全符合，不會因為「申請」的請字誤中停修
    assert titles("英文") == ["通識外語證照免修 / 學分抵免申請書"]  # 用口語關鍵字找得到
    assert titles("畢業審查") == ["畢業學分資格預審表"]  # 三個字以上可錯一字
    assert client.put("/api/campus/forms/favorites", json={"code": "leave_application_form", "favorite": True}).status_code == 401


def test_favorite_forms_listed_first_and_saved_per_account(client, login):
    login("student1")
    res = client.put("/api/campus/forms/favorites", json={"code": "graduation_audit_form", "favorite": True})
    assert res.status_code == 200 and res.get_json()["favorites"] == ["graduation_audit_form"]
    first = client.get("/api/campus/forms").get_json()["data"][0]
    assert first["code"] == "graduation_audit_form" and first["is_favorite"] and first["word_url"].endswith("?download=doc")
    assert client.put("/api/campus/forms/favorites", json={"code": "not_a_form", "favorite": True}).status_code == 400

    login("S112004")  # 別人的常用表單不受影響
    assert client.get("/api/campus/forms").get_json()["favorites"] == []

    login("student1")
    client.put("/api/campus/forms/favorites", json={"code": "graduation_audit_form", "favorite": False})
    assert client.get("/api/campus/forms").get_json()["favorites"] == []


# ---------- 老師辦公室名錄與審核 ----------

def test_teacher_list_includes_teachers_only_in_schedule(client):
    data = client.get("/api/campus/teachers").get_json()
    names = {t["name"]: t for t in data["data"]}
    assert "謝樹明" in names and names["謝樹明"]["registered"] is False  # 只在課表上
    assert names["彭賓鈺"]["registered"] and "資訊管理科" in data["depts"] and "通識教育中心" in data["units"]
    faculty = {t["name"] for t in client.get("/api/faculty").get_json()["data"]}
    assert {"謝樹明", "益西曲珍", "彭賓鈺"} <= faculty  # 教師專長查詢也列出全部老師


def test_staff_changes_need_admin_review(client, login):
    body = {"name": "謝樹明", "title": "講師", "dept": "資訊管理科", "unit": "資訊管理科", "building": "A", "office": "A415",
            "office_hours": [{"weekday": 3, "start": "10:30", "end": "12:20"}]}
    login("staff1")
    new_id = client.post("/api/admin/teachers", json=body).get_json()["id"]
    listed = lambda: {t["name"]: t for t in client.get("/api/campus/teachers").get_json()["data"]}
    assert listed()["謝樹明"]["registered"] is False  # 核准前學生看不到
    assert client.post(f"/api/admin/teachers/{new_id}/review", json={"decision": "核准"}).status_code == 403

    login("admin", "admin123")
    assert client.post(f"/api/admin/teachers/{new_id}/review", json={"decision": "退回"}).status_code == 400  # 退回要寫原因
    assert client.post(f"/api/admin/teachers/{new_id}/review", json={"decision": "核准"}).status_code == 200
    assert listed()["謝樹明"]["office"] == "A415"

    login("staff1")
    client.put(f"/api/admin/teachers/{new_id}", json={**body, "ext": "分機 999"})
    assert listed()["謝樹明"]["ext"] == ""  # 修改審核中，學生仍看到原本的資料
    login("admin", "admin123")
    client.post(f"/api/admin/teachers/{new_id}/review", json={"decision": "核准"})
    assert listed()["謝樹明"]["ext"] == "分機 999"


def test_teacher_photo_upload_checks_file_content(client, login, tmp_path, monkeypatch):
    import app as app_module
    monkeypatch.setattr(app_module, "UPLOAD_FOLDER", str(tmp_path))
    login("staff1")
    fake = client.post("/api/admin/teachers/photo", data={"photo": (io.BytesIO(b"<svg onload=alert(1)>"), "a.png")},
                       content_type="multipart/form-data")
    assert fake.status_code == 400
    png = client.post("/api/admin/teachers/photo", data={"photo": (io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 64), "a.png")},
                      content_type="multipart/form-data")
    assert png.status_code == 200 and png.get_json()["url"].startswith("/uploads/teacher_")
    login("student1")
    assert client.post("/api/admin/teachers/photo", data={}, content_type="multipart/form-data").status_code == 403


# ---------- 線上會議 ----------

def _now_text():
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def test_teacher_meeting_invites_class_and_students_see_it(client, login):
    login("teacher1")
    targets = client.get("/api/campus/meetings").get_json()
    assert "資管五忠" in targets["invitable_classes"] and "護理四忠" not in targets["invitable_classes"]
    # 不能邀請不是自己教的班；檢查失敗時不會留下會議
    bad = client.post("/api/campus/meetings", json={"title": "x", "start_at": _now_text(), "classes": ["護理四忠"]})
    assert bad.status_code == 400 and client.get("/api/campus/meetings").get_json()["data"] == []
    res = client.post("/api/campus/meetings", json={"title": "專題討論", "start_at": _now_text(), "duration_min": 60, "classes": ["資管五忠"]})
    assert res.status_code == 200, res.get_json()
    meeting_id, code = res.get_json()["id"], res.get_json()["invite_code"]
    host_view = client.get("/api/campus/meetings").get_json()["data"][0]
    assert host_view["is_host"] and host_view["invite_code"] == code and host_view["member_count"] > 1

    login("student1")  # 資管五忠
    mine = client.get("/api/campus/meetings").get_json()["data"]
    m = next(x for x in mine if x["id"] == meeting_id)
    assert m["joined_by"] == "班級" and m["is_open"] and m["join_url"].startswith("https://meet.ffmuc.net/UKN-")
    assert "invite_code" not in m and "members" not in m  # 只有主持人看得到邀請碼與成員名單
    assert client.post(f"/api/campus/meetings/{meeting_id}/cancel").status_code == 403

    login("S112004")  # 資管四孝，沒被邀請
    assert all(x["id"] != meeting_id for x in client.get("/api/campus/meetings").get_json()["data"])
    assert client.post("/api/campus/meetings/join", json={"code": code.lower()}).status_code == 200  # 邀請碼不分大小寫
    assert any(x["id"] == meeting_id and x["joined_by"] == "邀請碼" for x in client.get("/api/campus/meetings").get_json()["data"])
    assert client.post("/api/campus/meetings/join", json={"code": "WRONG123"}).status_code == 404

    login("teacher1")
    assert client.post(f"/api/campus/meetings/{meeting_id}/cancel").status_code == 200
    login("student1")
    m = next(x for x in client.get("/api/campus/meetings").get_json()["data"] if x["id"] == meeting_id)
    assert m["status"] == "已取消" and "join_url" not in m


def test_student_meeting_invites_people_only_and_code_can_be_disabled(client, login):
    login("student1")
    assert client.post("/api/campus/meetings", json={"title": "讀書會", "start_at": _now_text(), "classes": ["資管五忠"]}).status_code == 400
    people = client.get("/api/campus/meetings/people", query_string={"q": "陳冠宇"}).get_json()["data"]
    assert people and people[0]["key"] == "S112004"
    res = client.post("/api/campus/meetings", json={"title": "讀書會", "start_at": _now_text(), "invitees": ["S112004"],
                                                    "allow_code_join": False}).get_json()
    login("S112004")
    assert any(x["id"] == res["id"] and x["joined_by"] == "邀請" for x in client.get("/api/campus/meetings").get_json()["data"])
    login("student2")
    assert client.post("/api/campus/meetings/join", json={"code": res["invite_code"]}).status_code == 403
    assert client.post("/api/campus/meetings", json={"title": "過去", "start_at": "2020-01-01 10:00"}).status_code == 400
