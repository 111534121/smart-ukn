"""被記曠課當天立即通知：新增紀錄就寄信並標記已通知，學生的缺曠摘要帶 id 給通知中心判斷新紀錄"""
import copy
from datetime import date

import pytest

import app as app_module


@pytest.fixture(autouse=True)
def fresh_attendance(monkeypatch):
    # 示範模式的缺曠紀錄是模組層級的記憶體資料，每個測試用一份新的
    src = copy.deepcopy(app_module.DEMO_ATTENDANCE_SOURCE)
    monkeypatch.setattr(app_module, "DEMO_ATTENDANCE_SOURCE", src)
    monkeypatch.setattr(app_module, "get_attendance_source", lambda: src)
    return src


def test_new_absence_emails_student_immediately(client, login, offline_db, fresh_attendance):
    today = date.today().isoformat()
    login("staff1")
    res = client.post("/api/admin/attendance", json={"student_id": "S112001", "date": today,
                                                     "course_name": "程式設計(二)", "type": "曠課", "hours": 2})
    assert res.status_code == 201
    body = res.get_json()
    assert body["notified"] is True and "立即通知學生" in body["message"]
    to, subject, text = offline_db[-1]
    assert to.startswith("s112001@") and"程式設計(二)" in subject and "曠課" in subject and "2 小時" in text
    record = next(r for r in fresh_attendance.list_records("S112001") if r["id"] == body["data"]["id"])
    assert record["notified"]  # 已寄過，不會被批次寄信重複寄

    client.post("/api/auth/logout")
    login("student1")
    recent = client.get("/api/student/attendance").get_json()["recent_records"]
    newest = next(r for r in recent if r["id"] == body["data"]["id"])
    assert newest["type"] == "曠課" and newest["course_name"] == "程式設計(二)"


def test_mail_failure_keeps_record_unnotified(client, login, monkeypatch, fresh_attendance):
    class Broken:
        mode = "smtp"

        def send(self, *a):
            raise OSError("SMTP 連不上")

    monkeypatch.setattr(app_module, "get_mailer", lambda: Broken())
    login("staff1")
    res = client.post("/api/admin/attendance", json={"student_id": "S112001", "course_name": "程式設計(二)", "type": "曠課"})
    assert res.status_code == 201 and res.get_json()["notified"] is False
    record = next(r for r in fresh_attendance.list_records("S112001") if r["id"] == res.get_json()["data"]["id"])
    assert not record["notified"]  # 之後按「立即寄出通知」會補寄
