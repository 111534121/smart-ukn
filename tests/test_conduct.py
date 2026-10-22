"""我的操行：計算明細、權限 (學生/家長看本人、導師看導師班、生輔組登錄獎懲)"""
import copy

import pytest

import conduct


@pytest.fixture(autouse=True)
def fresh_conduct(monkeypatch):
    monkeypatch.setattr(conduct, "DEMO_RECORDS", copy.deepcopy(conduct.DEMO_RECORDS))
    monkeypatch.setattr(conduct, "DEMO_EVALUATIONS", copy.deepcopy(conduct.DEMO_EVALUATIONS))
    monkeypatch.setattr(conduct.deps, "current_semester", lambda: "115-1")
    monkeypatch.setattr(conduct, "DEMO_SETTINGS", {})


def semester(data, sem):
    return next(s for s in data["data"] if s["semester"] == sem)


def test_student_sees_breakdown(client, login):
    login("student1")
    data = client.get("/api/conduct/me").get_json()
    last = semester(data, "114-2")
    assert last["score"] == 86 and last["grade"] == "甲"  # 82 + 導師 2 + 嘉獎 2
    now = semester(data, "115-1")
    points = {b["key"]: b["points"] for b in now["breakdown"]}
    # 嘉獎 1 − 警告 1；示範缺曠 4 節曠課 (−2) + 1 次遲到 (−0.1)
    assert points == {"base": 82, "advisor": 0, "merits": 0, "attendance": -2.1}
    assert now["score"] == 79.9 and now["grade"] == "乙" and now["is_current"]
    assert data["can_record"] is False and data["can_evaluate"] is False


def test_parent_sees_child_but_others_need_student_id(client, login):
    login("parent1")
    assert client.get("/api/conduct/me").get_json()["student"]["student_id"] == "S112001"
    client.post("/api/auth/logout")
    login("teacher1")
    assert client.get("/api/conduct/me").status_code == 403


def test_teacher_evaluates_own_class_only(client, login):
    login("teacher1")  # 資管四忠
    res = client.put("/api/conduct/evaluations/S112001/115-1", json={"advisor_adjust": 3, "comment": "進步很多"})
    assert res.status_code == 200 and semester(res.get_json(), "115-1")["score"] == 82.9
    assert client.put("/api/conduct/evaluations/S112001/115-1", json={"advisor_adjust": 8}).status_code == 400
    assert client.put("/api/conduct/evaluations/S112004/115-1", json={"advisor_adjust": 1}).status_code == 403  # 資管四孝
    assert client.post("/api/conduct/records", json={"student_id": "S112001", "type": "嘉獎", "reason": "x"}).status_code == 403


def test_staff_records_and_deletes_merit(client, login):
    login("staff1")
    res = client.post("/api/conduct/records", json={"student_id": "S112002", "type": "大功", "count": 1,
                                                    "record_date": "2026-10-05", "reason": "見義勇為"})
    assert res.status_code == 201
    now = semester(res.get_json(), "115-1")
    record = next(m for m in now["merits"] if m["type"] == "大功")
    assert record["points"] == 9
    assert client.post("/api/conduct/records", json={"student_id": "S112002", "type": "嘉獎"}).status_code == 400  # 沒寫事由
    res = client.delete(f"/api/conduct/records/{record['id']}")
    assert all(m["type"] != "大功" for m in semester(res.get_json(), "115-1")["merits"])


def rules_with(**changes):
    rules = copy.deepcopy(conduct.DEFAULT_RULES)
    rules.update(changes)
    return rules


def test_settings_staff_only(client, login):
    assert client.get("/api/admin/conduct-settings").status_code == 401
    login("teacher1")
    assert client.get("/api/admin/conduct-settings").status_code == 403
    client.post("/api/auth/logout")
    login("staff1")
    data = client.get("/api/admin/conduct-settings").get_json()
    assert data["rules"]["is_default"] and data["rules"]["pass_score"] == 60


def test_pass_score_change_regrades_and_preview_does_not_save(client, login):
    login("staff1")
    # 本學期王小明 79.9；及格分數改成 80 → 變不及格
    preview = client.post("/api/admin/conduct-settings/preview", json=rules_with(pass_score=80)).get_json()["impact"]
    hit = next(c for c in preview["items"] if c["student_id"] == "S112001" and c["semester"] == "115-1")
    assert hit["before"]["passed"] and not hit["after"]["passed"]
    assert client.get("/api/admin/conduct-settings").get_json()["rules"]["pass_score"] == 60  # 預覽不儲存

    res = client.put("/api/admin/conduct-settings", json=rules_with(pass_score=80, base_score=85)).get_json()
    assert res["rules"]["pass_score"] == 80 and not res["rules"]["is_default"]
    client.post("/api/auth/logout")
    login("student1")
    now = next(s for s in client.get("/api/conduct/me").get_json()["data"] if s["semester"] == "115-1")
    assert now["score"] == 82.9 and now["passed"] is True  # 基本分 85 − 2.1


def test_merit_points_and_grade_validation(client, login):
    login("staff1")
    bad_merit = rules_with(merit_points={**conduct.DEFAULT_RULES["merit_points"], "小過": 3})
    assert "懲處" in client.put("/api/admin/conduct-settings", json=bad_merit).get_json()["message"]
    no_zero = rules_with(grades=[{"min": 60, "label": "及格"}])
    assert client.put("/api/admin/conduct-settings", json=no_zero).status_code == 400
    two_grades = rules_with(grades=[{"min": 0, "label": "不及格"}, {"min": 70, "label": "及格"}])
    res = client.put("/api/admin/conduct-settings", json=two_grades).get_json()
    assert [g["label"] for g in res["rules"]["grades"]] == ["及格", "不及格"]  # 依分數排序
    reset = client.put("/api/admin/conduct-settings", json={"reset": True}).get_json()
    assert reset["rules"]["grades"] == conduct.DEFAULT_RULES["grades"]
