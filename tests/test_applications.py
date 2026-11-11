"""線上申辦進度 (送出 → 逐關簽核 → 完成 / 退回) 與申請表單下載"""
import copy

import pytest

import applications


@pytest.fixture(autouse=True)
def fresh_apps(monkeypatch):
    monkeypatch.setattr(applications, "DEMO_APPLICATIONS", copy.deepcopy(applications.DEMO_APPLICATIONS))


WITHDRAW_FIELDS = {"phone": "0912-000-000", "semester": "115-1", "course_code": "CS201", "course_name": "資料結構",
                   "credits": "3", "teacher": "林老師", "reason": "跟不上進度"}


def submit(client, item_id=1, fields=None):
    return client.post("/api/applications", json={"item_id": item_id, "fields": fields or WITHDRAW_FIELDS})


def test_form_pages_blank_example_and_word(client):
    blank = client.get("/forms/course_withdraw_form")
    assert blank.status_code == 200 and "學生課程停修申請單" in blank.get_data(as_text=True)
    assert "資料結構" not in blank.get_data(as_text=True)

    example = client.get("/forms/course_withdraw_form?example=1").get_data(as_text=True)
    assert "資料結構" in example and "填寫小提醒" in example

    doc = client.get("/forms/course_withdraw_form?download=doc&example=1")
    assert doc.status_code == 200 and doc.mimetype == "application/msword"
    assert "attachment" in doc.headers["Content-Disposition"]
    assert client.get("/forms/no_such_form").status_code == 404


def test_student_sees_stepper_for_demo_application(client, login):
    login("student1")
    apps = client.get("/api/applications/mine").get_json()["data"]
    withdraw = next(a for a in apps if a["id"] == 1)
    assert [s["state"] for s in withdraw["steps"]] == ["done", "done", "current", "pending", "pending", "pending"]
    assert "導師簽核" in withdraw["summary"]


def test_submit_requires_fields_and_blocks_duplicates(client, login):
    login("student2")
    res = submit(client, fields={"phone": "0912"})
    assert res.status_code == 400 and "停修原因" in res.get_json()["message"]
    res = submit(client)
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert data["current_stage"] == 1 and data["steps"][1]["state"] == "current"
    assert submit(client).status_code == 409  # 同一項目已經有一張審核中


def test_full_approval_flow_with_roles(client, login, offline_db):
    login("student2")  # 資管四忠，導師是 teacher1
    app_id = submit(client).get_json()["data"]["id"]

    client.post("/api/auth/logout")
    login("teacher1")
    pending = client.get("/api/applications/review").get_json()["data"]
    assert any(a["id"] == app_id for a in pending)
    assert client.post(f"/api/applications/{app_id}/review", json={"action": "reject"}).status_code == 400  # 退回要寫原因
    for _ in range(3):  # 任課教師、導師、科主任 (老師關卡)
        assert client.post(f"/api/applications/{app_id}/review", json={"action": "approve"}).status_code == 200
    # 第 4 關是課務組 (教職員)，老師不能審
    assert client.post(f"/api/applications/{app_id}/review", json={"action": "approve"}).status_code == 404

    client.post("/api/auth/logout")
    login("staff1")
    res = client.post(f"/api/applications/{app_id}/review", json={"action": "approve"}).get_json()
    assert res["data"]["status"] == "已完成" and res["data"]["progress_percent"] == 100
    assert offline_db, "完成時要通知學生"


def test_approve_stamps_and_forwards_to_next_reviewer(client, login):
    login("student2")
    app_id = submit(client).get_json()["data"]["id"]
    client.post("/api/auth/logout")
    login("teacher1")
    res = client.post(f"/api/applications/{app_id}/review", json={"action": "approve", "note": "同意"}).get_json()
    assert "已蓋章" in res["message"] and "送交下一關「導師簽核」" in res["message"]
    stamp = res["data"]["history"][-1]["stamp"]
    assert stamp["name"] == "任課教師簽核" and stamp["by"] == "彭賓鈺 老師" and len(stamp["code"]) == 12
    assert res["data"]["stamp_count"] == 1 and res["data"]["next_stage"] == "科主任簽核"
    assert "等待導師班老師蓋章" in res["data"]["summary"]

    html = client.get(f"/applications/{app_id}/signed").get_data(as_text=True)
    assert stamp["code"] in html and "待蓋章" in html and "跟不上進度" in html

    client.post("/api/auth/logout")
    check = client.get(f"/api/applications/stamp/{stamp['code'].lower()}").get_json()  # 不用登入
    assert check["valid"] and check["stage"] == "任課教師簽核" and "○" in check["student_name"]

    # 蓋章後申請內容被改 → 章失效
    target = next(a for a in applications.DEMO_APPLICATIONS if a["id"] == app_id)
    target["fields"]["reason"] = "被偷改"
    assert not client.get(f"/api/applications/stamp/{stamp['code']}").get_json()["valid"]


def test_reject_does_not_stamp(client, login):
    login("student2")
    app_id = submit(client).get_json()["data"]["id"]
    client.post("/api/auth/logout")
    login("staff1")
    res = client.post(f"/api/applications/{app_id}/review", json={"action": "reject", "note": "缺附件"}).get_json()
    assert "stamp" not in res["data"]["history"][-1] and res["data"]["stamp_count"] == 0


def test_signed_form_access(client, login):
    assert client.get("/applications/1/signed").status_code == 401
    login("student2")  # 申請 1 是王小明的
    assert client.get("/applications/1/signed").status_code == 404
    client.post("/api/auth/logout")
    login("student1")
    html = client.get("/applications/1/signed").get_data(as_text=True)
    assert "系統加上電子章前核准" in html  # 舊的示範資料核准時沒有章
    client.post("/api/auth/logout")
    login("parent1")
    assert client.get("/applications/1/signed").status_code == 200


def test_teacher_cannot_review_other_class(client, login):
    applications.DEMO_APPLICATIONS.append({**copy.deepcopy(applications.DEMO_APPLICATIONS[0]), "id": 99, "student_id": "S112004"})
    login("teacher1")  # S112004 是資管四孝，不是 teacher1 的導師班
    assert client.post("/api/applications/99/review", json={"action": "approve"}).status_code == 404
    assert all(a["id"] != 99 for a in client.get("/api/applications/review?status=all").get_json()["data"])


def test_reject_then_withdraw_rules(client, login):
    login("student2")
    app_id = submit(client).get_json()["data"]["id"]
    client.post("/api/auth/logout")
    login("staff1")
    res = client.post(f"/api/applications/{app_id}/review", json={"action": "reject", "note": "成績單沒附"}).get_json()
    assert res["data"]["status"] == "已退回" and res["data"]["steps"][1]["state"] == "rejected"

    client.post("/api/auth/logout")
    login("student2")
    assert client.post(f"/api/applications/{app_id}/withdraw").status_code == 400  # 已退回不能撤回
    assert submit(client).status_code == 201  # 退回後可以重新送出


def test_feature_map_admin_only_and_traces_tables(client, login):
    assert client.get("/admin/feature-map").status_code == 401
    login("student1")
    assert client.get("/admin/feature-map").status_code == 403
    client.post("/api/auth/logout")
    login("admin", "admin123")
    html = client.get("/admin/feature-map").get_data(as_text=True)
    assert "online_applications" in html and "applications/__init__.py" in html
    assert "COURSE_MAP_SQL" in html  # SQL 寫在模組常數也追得到


def test_parent_can_view_but_not_submit(client, login):
    login("parent1")
    assert client.get("/api/applications/mine").get_json()["data"]
    assert submit(client).status_code == 403
