"""
獎助學金：資格比對 (差一點符合) → 線上申請上傳文件 → 生輔組審核 → 核准蓋電子章 → 查驗

示範模式 (conftest 讓 MySQL 離線)：student2 (S112002) 符合「品德楷模獎學金」(id 10)，
student1 (S112001) 操行差 2 分且前學期 1 科不及格 → 部分符合。
"""
import io
from datetime import date

import pytest

import app as app_module
import scholarship_apply

SCH_ID = 10
PDF = b"%PDF-1.4\n" + b"0" * 100
PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 100


@pytest.fixture(autouse=True)
def isolated(monkeypatch, tmp_path):
    notified = []
    monkeypatch.setattr(scholarship_apply.deps, "upload_dir", str(tmp_path / "uploads"))
    monkeypatch.setattr(scholarship_apply.deps, "notify_student", lambda sid, subject: notified.append((sid, subject)) or True)
    scholarship_apply.DEMO_APPLICATIONS.clear()
    yield notified
    scholarship_apply.DEMO_APPLICATIONS.clear()


def upload(client, *files, sch_id=SCH_ID, note=""):
    data = {"files": [(io.BytesIO(content), name) for name, content in files], "note": note}
    return client.post(f"/api/scholarships/{sch_id}/apply", data=data, content_type="multipart/form-data")


# ---------- 資格比對：差一點符合 ----------

SCH = {"id": 1, "name": "測試獎學金", "deadline": "2099-12-31", "min_gpa": 3.5, "min_conduct": 85, "no_fail_required": 1}
BASE = {"grade_level": 2, "dept_id": "CS", "gpa": 3.6, "conduct_score": 90}


def evaluate(profile=None, fails=0, sch=None):
    return app_module.evaluate_scholarship(sch or SCH, {**BASE, **(profile or {})}, ("113-1", fails), {}, date(2026, 11, 9), False)


@pytest.mark.parametrize("profile, fails, expected", [
    ({}, 0, "符合"),
    ({"gpa": 3.2}, 0, "部分符合"),           # 剛好差 0.3 (浮點數 3.5-3.2 要 round 才會 <= 0.3)
    ({"gpa": 3.1}, 0, "不符合"),             # 差 0.4，差太多
    ({"conduct_score": 82}, 0, "部分符合"),   # 差 3 分
    ({"conduct_score": 81}, 0, "不符合"),
    ({}, 1, "部分符合"),                     # 前學期 1 科不及格
    ({}, 2, "不符合"),
    ({"gpa": 3.3, "conduct_score": 83}, 1, "部分符合"),  # 每一項都只差一點
    ({"gpa": 3.3, "conduct_score": 70}, 0, "不符合"),    # 有一項差很多就不算
    ({"gpa": None}, 0, "不符合"),            # 沒有成績資料不算差一點
])
def test_near_match(profile, fails, expected):
    assert evaluate(profile, fails)["status"] == expected


def test_hard_condition_never_partial():
    sch = {**SCH, "departments": "NUR"}
    assert evaluate({"gpa": 3.4}, sch=sch)["status"] == "不符合"


def test_gap_shown_in_reason():
    missing = evaluate({"gpa": 3.3})["missing"]
    assert any("還差 0.2" in m for m in missing)


def test_demo_students(client, login):
    login("student1")
    assert [x["id"] for x in client.get("/api/scholarships/match").get_json()["partial"]] == [SCH_ID]
    client.post("/api/auth/logout")
    login("student2")
    assert [x["id"] for x in client.get("/api/scholarships/match").get_json()["eligible"]] == [SCH_ID]


# ---------- 上傳文件與大小限制 ----------

def test_partial_student_cannot_apply(client, login):
    login("student1")
    res = upload(client, ("a.pdf", PDF))
    assert res.status_code == 400 and "不符合" in res.get_json()["message"]


@pytest.mark.parametrize("files, message", [
    ([], "至少上傳 1 個"),
    ([("a.exe", b"MZ")], "格式不支援"),
    ([("fake.pdf", b"MZ\x90\x00 not a pdf")], "不是真的 PDF"),
    ([("empty.pdf", b"")], "空檔案"),
    ([("big.pdf", b"%PDF" + b"0" * (5 * 1024 * 1024))], "超過 5 MB"),
    ([(f"{i}.pdf", PDF) for i in range(6)], "最多上傳 5 個"),
    ([(f"{i}.pdf", b"%PDF" + b"0" * (4 * 1024 * 1024)) for i in range(4)], "合計超過 15 MB"),
])
def test_upload_rejected(client, login, files, message):
    login("student2")
    res = upload(client, *files)
    assert res.status_code == 400 and message in res.get_json()["message"]
    assert not scholarship_apply.DEMO_APPLICATIONS


def test_per_file_and_total_limits_fit_request_limit():
    assert scholarship_apply.MAX_TOTAL_MB * 1024 * 1024 < app_module.app.config["MAX_CONTENT_LENGTH"]


def test_apply_stores_files_outside_static(client, login, tmp_path):
    login("student2")
    res = upload(client, ("成績單.pdf", PDF), ("低收證明.png", PNG), note="謝謝")
    assert res.status_code == 201, res.get_json()
    data = res.get_json()["data"]
    assert data["status"] == "審核中" and len(data["files"]) == 2
    assert "stored" not in data["files"][0]  # 不回傳存放檔名
    assert len(list((tmp_path / "uploads").iterdir())) == 2
    assert client.get(data["files"][0]["url"]).data == PDF
    # 同一項不能重複送件
    assert upload(client, ("a.pdf", PDF)).status_code == 409


def test_other_student_cannot_download(client, login):
    login("student2")
    url = upload(client, ("a.pdf", PDF)).get_json()["data"]["files"][0]["url"]
    client.post("/api/auth/logout")
    login("student1")
    assert client.get(url).status_code == 404


# ---------- 審核、電子章、查驗 ----------

def submit_and_login_staff(client, login):
    login("student2")
    app_id = upload(client, ("a.pdf", PDF)).get_json()["data"]["id"]
    client.post("/api/auth/logout")
    login("staff1")  # 生輔組承辦 (教職員)
    return app_id


def review(client, app_id, action, note=""):
    return client.post(f"/api/admin/scholarship-applications/{app_id}/review", json={"action": action, "note": note})


def test_reject_needs_reason(client, login, isolated):
    app_id = submit_and_login_staff(client, login)
    assert review(client, app_id, "reject").status_code == 400
    res = review(client, app_id, "reject", "缺成績單")
    assert res.status_code == 200 and res.get_json()["data"]["stamp"] is None
    assert isolated == [("S112002", "【康寧大學】獎助學金「品德楷模獎學金」申請已退回")]
    # 退回後可以重新送件
    client.post("/api/auth/logout")
    login("student2")
    assert upload(client, ("b.pdf", PDF)).status_code == 201


def test_approve_stamps_and_verifies(client, login, isolated):
    app_id = submit_and_login_staff(client, login)
    assert [a["id"] for a in client.get("/api/admin/scholarship-applications").get_json()["data"]] == [app_id]
    res = review(client, app_id, "approve")
    assert res.status_code == 200
    stamp = res.get_json()["data"]["stamp"]
    assert stamp["no"].startswith("康大學輔字第") and len(stamp["code"]) == 16
    assert isolated[-1][1].endswith("申請已核准")
    # 不能再核准一次
    assert review(client, app_id, "approve").status_code == 409

    cert = client.get(f"/scholarship/applications/{app_id}/certificate")
    assert cert.status_code == 200 and stamp["code"] in cert.get_data(as_text=True)

    client.post("/api/auth/logout")
    check = client.get(f"/api/scholarships/stamp/{stamp['code'].lower()}").get_json()  # 不用登入、不分大小寫
    assert check["valid"] and check["no"] == stamp["no"]
    assert "S112002" not in str(check) and "○" in check["student_name"]

    # 核准後檔案被換掉 → 驗證碼對不上
    scholarship_apply.DEMO_APPLICATIONS[0]["files"][0]["sha256"] = "0" * 64
    assert not client.get(f"/api/scholarships/stamp/{stamp['code']}").get_json()["valid"]


def test_certificate_only_after_approval(client, login):
    app_id = submit_and_login_staff(client, login)
    assert client.get(f"/scholarship/applications/{app_id}/certificate").status_code == 404


# ---------- 申請表範本 ----------

def test_form_template_needs_login(client):
    assert client.get(f"/scholarship/{SCH_ID}/form-template").status_code == 401


def test_form_template_blank_prefills_own_data(client, login):
    login("student2")
    html = client.get(f"/scholarship/{SCH_ID}/form-template").get_data(as_text=True)
    assert "品德楷模獎學金" in html and "S112002" in html
    assert "示範章・僅供參考" not in html and "王小明" not in html


def test_form_template_sample_has_demo_stamp_and_fake_data(client, login):
    login("student2")
    res = client.get(f"/scholarship/{SCH_ID}/form-template?mode=sample")
    html = res.get_data(as_text=True)
    assert res.status_code == 200
    assert "示範章・僅供參考" in html and "王小明" in html
    assert "S112002" not in html  # 範例不放真實學生資料
    assert "核准後" in html       # 說明電子章只在審核通過後才有


def test_form_template_unknown_scholarship(client, login):
    login("student2")
    assert client.get("/scholarship/99999/form-template").status_code == 404


def test_withdraw(client, login):
    login("student2")
    app_id = upload(client, ("a.pdf", PDF)).get_json()["data"]["id"]
    assert client.post(f"/api/scholarships/applications/{app_id}/withdraw", json={}).status_code == 200
    assert client.post(f"/api/scholarships/applications/{app_id}/withdraw", json={}).status_code == 400
    assert client.get("/api/scholarships/applications/mine").get_json()["data"][0]["status"] == "已撤回"
