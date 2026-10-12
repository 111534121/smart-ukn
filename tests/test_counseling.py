"""T14 導生關懷紀錄：teacher1 = 資管五忠班導 (S112001、S112002、S112005)；S112004 = 資管四孝；staff1 = 教職員"""


def add(client, student_id="S112001", **extra):
    body = {"student_id": student_id, "talk_date": "2026-10-12", "method": "面談", "topic": "出缺勤",
            "content": "程式設計曠課較多，說是早上起不來", "follow_up": True, "follow_up_note": "下週確認出席", **extra}
    return client.post("/api/campus/counseling", json=body)


def test_teacher_records_and_follows_up(client, login):
    login("teacher1")
    res = add(client)
    assert res.status_code == 200, res.get_json()
    rid = res.get_json()["data"]["id"]

    data = client.get("/api/campus/counseling").get_json()
    assert data["class_name"] == "資管五忠"
    assert data["summary"]["record_count"] == 1 and data["summary"]["pending"] == 1 and data["summary"]["cared"] == 1
    me = next(s for s in data["students"] if s["student_id"] == "S112001")
    assert me["count"] == 1 and me["pending"] == 1

    assert client.put(f"/api/campus/counseling/{rid}", json={"follow_up_done": True}).status_code == 200
    assert client.get("/api/campus/counseling").get_json()["summary"]["pending"] == 0

    csv_text = client.get("/api/campus/counseling/export.csv").data.decode("utf-8-sig")
    assert "程式設計曠課較多" in csv_text and "王小明" in csv_text

    assert client.delete(f"/api/campus/counseling/{rid}").status_code == 200
    assert client.get("/api/campus/counseling").get_json()["summary"]["record_count"] == 0


def test_teacher_limited_to_own_class(client, login):
    login("teacher1")
    assert add(client, "S112004").status_code == 403
    assert client.get("/api/campus/counseling?class_name=資管四孝").status_code == 403
    assert client.get("/api/campus/counseling/export.csv?class_name=資管四孝").status_code == 403


def test_only_author_can_edit(client, login):
    login("teacher1")
    rid = add(client).get_json()["data"]["id"]
    login("staff1")
    data = client.get("/api/campus/counseling?class_name=資管五忠").get_json()
    assert next(r for r in data["data"] if r["id"] == rid)["can_edit"] is False
    assert client.put(f"/api/campus/counseling/{rid}", json={"content": "改掉"}).status_code == 403
    login("admin", "admin123")
    assert client.put(f"/api/campus/counseling/{rid}", json={"content": "管理員可以改"}).status_code == 200


def test_students_and_parents_cannot_see(client, login):
    for user in ("student1", "parent1"):
        login(user)
        assert client.get("/api/campus/counseling").status_code == 403
        assert add(client).status_code == 403


def test_audit_log_does_not_keep_content(client, login):
    login("teacher1")
    add(client, content="家裡經濟狀況不好，需要轉介獎助學金")
    import app as app_module
    logs = [l for l in app_module.DEMO_AUDIT_LOGS if l.get("table_name") == "counseling_records"] if hasattr(app_module, "DEMO_AUDIT_LOGS") else []
    assert all("家裡經濟" not in str(l) for l in logs)
