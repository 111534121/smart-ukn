"""線上申辦進度 (送出 → 逐關簽核 → 完成 / 退回) 與申請表單下載"""
import copy
import io

import pytest

import applications


@pytest.fixture(autouse=True)
def fresh_apps(monkeypatch, tmp_path):
    monkeypatch.setattr(applications, "DEMO_APPLICATIONS", copy.deepcopy(applications.DEMO_APPLICATIONS))
    # 上傳的申請表、老師章寫到暫存資料夾，不動 data/
    monkeypatch.setattr(applications.deps, "upload_dir", str(tmp_path / "uploads"))
    monkeypatch.setattr(applications.deps, "seal_dir", str(tmp_path / "seals"))


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


def test_upload_application_form_code_upload_and_item_id_zero(client, login):
    # 測試自主上傳申請表 (item_id: 0, form_code: 'upload')
    login("student2")
    form_res = client.get("/api/applications/form/0")
    assert form_res.status_code == 200
    form_data = form_res.get_json()
    assert form_data["form_code"] == "upload"

    # 送出自訂上傳申請表
    upload_payload = {
        "item_id": 0,
        "form_code": "upload",
        "business_name": "英文能力證明抵免申請",
        "fields": {
            "phone": "0912-345-678",
            "file_url": "/uploads/application_cert_proof.pdf",
            "file_name": "多益證書成績單.pdf",
            "file_size": 204800,
            "description": "已取得多益 750 分證書，申請外語抵免。"
        }
    }
    submit_res = client.post("/api/applications", json=upload_payload)
    assert submit_res.status_code == 201
    app_data = submit_res.get_json()["data"]
    assert app_data["item_id"] == 0
    assert app_data["form_code"] == "upload"
    assert app_data["business_name"] == "英文能力證明抵免申請"
    assert app_data["fields"]["file_url"] == "/uploads/application_cert_proof.pdf"
    assert app_data["fields"]["file_name"] == "多益證書成績單.pdf"

    # 學生在我的申請中可看到這筆
    my_res = client.get("/api/applications/mine")
    assert my_res.status_code == 200
    my_apps = my_res.get_json()["data"]
    upload_app = next(a for a in my_apps if a["id"] == app_data["id"])
    assert upload_app["item_id"] == 0
    assert upload_app["form_code"] == "upload"

    # 教職員 (staff1) 進行審核核准
    client.post("/api/auth/logout")
    login("staff1")
    review_res = client.post(f"/api/applications/{app_data['id']}/review", json={"action": "approve"})
    assert review_res.status_code == 200
    assert review_res.get_json()["data"]["status"] == "已完成"
# ---------- 學生上傳自己的申請表、老師章 ----------

PDF = b"%PDF-1.4 test form"
PNG = b"\x89PNG\r\n\x1a\n fake seal"


def upload(client, type="resume", files=None, **form):
    data = {"type": type, "phone": "0912-000-000", "reason": "寒假實習", **form}
    data["files"] = files if files is not None else [(io.BytesIO(PDF), "實習申請.pdf")]
    return client.post("/api/applications/upload", data=data, content_type="multipart/form-data")


def test_upload_options_list_types_with_fixed_stages(client):
    types = client.get("/api/applications/upload-options").get_json()["types"]
    resume = next(t for t in types if t["key"] == "resume")
    assert resume["name"] == "復學申請" and [s["name"] for s in resume["stages"]] == ["導師簽章", "教務處註冊組"]
    assert all(t["stages"] for t in types)


def test_upload_validates_type_and_files(client, login):
    login("student2")
    assert upload(client, type="").status_code == 400
    assert upload(client, type="no_such").status_code == 400
    res = upload(client, files=[(io.BytesIO(b"MZ fake exe"), "form.pdf")])
    assert res.status_code == 400 and "不是真的 PDF" in res.get_json()["message"]
    assert upload(client, files=[(io.BytesIO(PDF), "a.docx")]).status_code == 400
    assert upload(client, phone="").status_code == 400


def test_student_cannot_pick_own_stages(client, login):
    login("student2")
    res = upload(client, route=["cashier"], title="自己取的名字")  # 舊參數一律忽略
    data = res.get_json()["data"]
    assert res.status_code == 201 and data["business_name"] == "復學申請"
    assert data["route_keys"] == ["advisor", "registry"]


def test_upload_flows_through_chosen_stages_with_personal_seals(client, login):
    login("student2")  # 資管四忠，導師是 teacher1
    res = upload(client)
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert [s["name"] for s in data["steps"]] == ["線上送出", "導師簽章", "教務處註冊組", "完成"]
    assert data["is_upload"] and data["files"][0]["name"] == "實習申請.pdf"
    assert "_files" not in data["fields"]  # 存檔名不外流
    app_id = data["id"]
    assert client.get(data["files"][0]["url"]).data == PDF

    # 老師上傳自己的印章圖，再核准 → 申請表上蓋的是這張圖
    client.post("/api/auth/logout")
    login("teacher1")
    assert client.get("/api/seals/mine").get_json()["type"] == "name"
    bad = client.post("/api/seals/mine", data={"seal": (io.BytesIO(b"not image"), "seal.png")}, content_type="multipart/form-data")
    assert bad.status_code == 400
    ok = client.post("/api/seals/mine", data={"seal": (io.BytesIO(PNG), "seal.png")}, content_type="multipart/form-data")
    assert ok.status_code == 200 and client.get("/api/seals/mine").get_json()["type"] == "image"
    res = client.post(f"/api/applications/{app_id}/review", json={"action": "approve"}).get_json()
    stamp = res["data"]["history"][-1]["stamp"]
    assert stamp["seal"]["type"] == "image" and "教務處註冊組" in res["message"]
    assert client.get(f"/applications/{app_id}/seal/1").data == PNG

    # 換回系統刻的章：已經蓋好的那關仍是原本的圖
    assert client.delete("/api/seals/mine").status_code == 200
    assert client.get(f"/applications/{app_id}/seal/1").data == PNG

    # 行政人員沒上傳過 → 蓋系統依姓名刻的章
    client.post("/api/auth/logout")
    login("staff1")
    res = client.post(f"/api/applications/{app_id}/review", json={"action": "approve"}).get_json()
    assert res["data"]["status"] == "已完成"
    assert res["data"]["history"][-1]["stamp"]["seal"] == {"type": "name", "text": "周立威"}
    html = client.get(f"/applications/{app_id}/signed").get_data(as_text=True)
    assert "復學申請" in html and "實習申請.pdf" in html and "周立威的印章" in html

    # 驗證碼綁著上傳的檔案：檔案被換掉章就失效
    assert client.get(f"/api/applications/stamp/{stamp['code']}").get_json()["valid"]
    target = next(a for a in applications.DEMO_APPLICATIONS if a["id"] == app_id)
    target["fields"]["_files"][0]["sha256"] = "0" * 64
    assert not client.get(f"/api/applications/stamp/{stamp['code']}").get_json()["valid"]


def test_uploaded_file_hidden_from_others(client, login):
    login("student2")
    app_id = upload(client).get_json()["data"]["id"]
    client.post("/api/auth/logout")
    login("student1")
    assert client.get(f"/api/applications/{app_id}/files/0").status_code == 404
    client.post("/api/auth/logout")
    login("parent1")  # 王小明的家長
    assert client.get(f"/api/applications/{app_id}/files/0").status_code == 404


def test_students_have_no_seal(client, login):
    login("student1")
    assert client.get("/api/seals/mine").status_code == 403


def test_name_seal_layout():
    from applications.seals import name_seal_svg, seal_text
    assert seal_text("彭賓鈺 老師") == "彭賓鈺" and seal_text("周立威 (研發處)") == "周立威"
    svg = str(name_seal_svg("<script>"))
    assert "<script>" not in svg  # 姓名有跳脫


# ---------- 手機簽名 ----------

def test_phone_signature_link_flow(client, login):
    login("teacher1")
    link = client.post("/api/seals/sign-link").get_json()
    token = link["token"]
    assert link["url"].endswith(f"/seal/sign/{token}")
    qr = client.get(link["qr_url"])
    assert qr.status_code == 200 and qr.mimetype == "image/svg+xml"
    assert client.get(f"/api/seals/sign-link/{token}/status").get_json()["signed"] is False

    # 手機端：沒登入也能開、能簽
    phone = client.application.test_client()
    page = phone.get(f"/seal/sign/{token}").get_data(as_text=True)
    assert "彭賓鈺，請在下方簽名" in page
    bad = phone.post(f"/seal/sign/{token}", data={"signature": (io.BytesIO(b"not png"), "s.png")}, content_type="multipart/form-data")
    assert bad.status_code == 400  # 不是圖片：連結還能再用
    ok = phone.post(f"/seal/sign/{token}", data={"signature": (io.BytesIO(PNG), "s.png")}, content_type="multipart/form-data")
    assert ok.status_code == 200
    # 只能簽一次
    again = phone.post(f"/seal/sign/{token}", data={"signature": (io.BytesIO(PNG), "s.png")}, content_type="multipart/form-data")
    assert again.status_code == 410 and "用過或過期" in phone.get(f"/seal/sign/{token}").get_data(as_text=True)

    # 電腦端：狀態變成已簽，印章換成手寫簽名，核准時蓋的就是它
    assert client.get(f"/api/seals/sign-link/{token}/status").get_json()["signed"] is True
    seal = client.get("/api/seals/mine").get_json()
    assert seal["kind"] == "signature" and client.get("/api/seals/mine/image").data == PNG


def test_sign_link_belongs_to_creator_and_expires(client, login, monkeypatch):
    login("teacher1")
    token = client.post("/api/seals/sign-link").get_json()["token"]
    client.post("/api/auth/logout")
    login("staff1")
    assert client.get(f"/api/seals/sign-link/{token}/status").status_code == 404  # 別人的連結
    assert client.get(f"/api/seals/sign-link/{token}/qr.svg").status_code == 404
    # 過期
    from applications.seals import SealStore
    store = SealStore(applications.deps.seal_dir)
    tokens = store._load_tokens()
    tokens[token]["expires"] = 0
    store._save_tokens(tokens)
    phone = client.application.test_client()
    assert phone.post(f"/seal/sign/{token}", data={"signature": (io.BytesIO(PNG), "s.png")},
                      content_type="multipart/form-data").status_code == 410
    assert phone.get("/seal/sign/no-such-token").status_code == 200  # 顯示「已過期」頁，不是錯誤頁


# ---------- 保存三個月 ----------

def _finish_upload(client, login):
    login("student2")
    app_id = upload(client, type="enrollment_cert").get_json()["data"]["id"]
    client.post("/api/auth/logout")
    login("staff1")
    client.post(f"/api/applications/{app_id}/review", json={"action": "approve"})
    client.post("/api/auth/logout")
    login("student2")
    return app_id


def test_finished_application_kept_three_months(client, login):
    from datetime import date
    app_id = _finish_upload(client, login)
    mine = next(a for a in client.get("/api/applications/mine").get_json()["data"] if a["id"] == app_id)
    assert mine["status"] == "已完成" and mine["keep_until"] == applications._add_months(date.today(), 3).isoformat()
    assert 89 <= mine["keep_days_left"] <= 92
    assert "保存至" in client.get(f"/applications/{app_id}/signed").get_data(as_text=True)

    # 結束超過三個月：清單看不到，申請表與檔案回 410；章仍可查驗真偽
    target = next(a for a in applications.DEMO_APPLICATIONS if a["id"] == app_id)
    code = target["history"][-1]["stamp"]["code"]
    target["history"][-1]["at"] = "2020-01-01 10:00"
    assert all(a["id"] != app_id for a in client.get("/api/applications/mine").get_json()["data"])
    assert client.get(f"/applications/{app_id}/signed").status_code == 410
    assert client.get(f"/api/applications/{app_id}/files/0").status_code == 410
    assert client.get(f"/api/applications/stamp/{code}").get_json()["valid"]


def test_running_application_has_no_deadline(client, login):
    login("student2")
    data = upload(client).get_json()["data"]
    assert data["keep_until"] is None and data["status"] == "審核中"


def test_add_months_handles_month_end():
    from datetime import date
    assert applications._add_months(date(2026, 11, 30), 3) == date(2027, 2, 28)
    assert applications._add_months(date(2026, 10, 15), 3) == date(2027, 1, 15)
