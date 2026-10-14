"""獎學金符合資格／學業預警 Email 推播：家長要檢查授權才會收到信。"""
import pytest

import app as app_module


@pytest.fixture(autouse=True)
def _reset_notification_log():
    """避免測試之間互相影響已通知紀錄與個資授權設定 (皆為模組層級的全域資料)"""
    app_module.DEMO_NOTIFICATION_LOG.clear()
    privacy_snapshot = {k: dict(v) for k, v in app_module.DEMO_PRIVACY_SETTINGS.items()}
    yield
    app_module.DEMO_NOTIFICATION_LOG.clear()
    app_module.DEMO_PRIVACY_SETTINGS.clear()
    app_module.DEMO_PRIVACY_SETTINGS.update(privacy_snapshot)


def test_notify_requires_staff_role(client, login):
    assert client.post("/api/admin/notify/scholarship-warning").status_code == 401
    login("student1")
    assert client.post("/api/admin/notify/scholarship-warning").status_code == 403


def test_notify_sends_to_student_and_consenting_parent(client, login, offline_db):
    login("admin", "admin123")
    res = client.post("/api/admin/notify/scholarship-warning")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"

    recipients = [addr for addr, _subject, _body in offline_db]
    # S112001 的家長 (parent1) 已開啟授權，學生符合獎學金與預警時，兩邊都要收到信
    assert "s112001@stu.ukn.edu.tw" in recipients
    assert "parent1@stu.ukn.edu.tw" in recipients
    # 信件內容不能帶成績等個資，只能請對方登入查看
    for addr, _subject, body in offline_db:
        if addr == "parent1@stu.ukn.edu.tw":
            assert "分" not in body and "GPA" not in body


def test_notify_skips_parent_without_consent(client, login, offline_db):
    """S112002 的家長 (parent2) 尚未開啟『家長預警授權』，即使學生符合獎學金資格也不能寄信給家長"""
    login("admin", "admin123")
    res = client.post("/api/admin/notify/scholarship-warning")
    data = res.get_json()
    assert data["skipped_no_consent"] >= 1

    recipients = [addr for addr, _subject, _body in offline_db]
    assert "s112002@stu.ukn.edu.tw" in recipients  # 學生本人還是會收到
    assert "parent2@stu.ukn.edu.tw" not in recipients  # 家長未授權，不寄


def test_notify_is_idempotent_until_state_changes(client, login, offline_db):
    """同一件事只通知一次；馬上重按一次不應該重複寄信"""
    login("admin", "admin123")
    client.post("/api/admin/notify/scholarship-warning")
    first_count = len(offline_db)
    assert first_count > 0

    res2 = client.post("/api/admin/notify/scholarship-warning")
    assert res2.get_json()["message"] == "目前沒有需要通知的新項目"
    assert len(offline_db) == first_count  # 沒有新寄出的信


def test_consent_toggle_changes_future_notification(client, login, offline_db):
    """學生關掉家長預警授權之後，之前已經通知過的項目不會被追加通知家長 (歷史紀錄不受影響)，
    但之後學生重新開啟授權，且雙方有新的符合項目時，家長才會再收到信。這裡驗證：
    家長原本有授權 → 收到一次 → 學生關閉授權 → 清掉已通知紀錄模擬「出現新符合項目」→ 家長不會再收到信"""
    login("admin", "admin123")
    client.post("/api/admin/notify/scholarship-warning")
    assert any(addr == "parent1@stu.ukn.edu.tw" for addr, _, _ in offline_db)

    # 學生本人關閉家長預警授權
    client.post("/api/auth/logout")
    login("student1")
    r = client.post("/api/student/privacy-consent", json={"parent_alert_consent": False})
    assert r.status_code == 200
    client.post("/api/auth/logout")

    # 模擬出現新的符合項目 (清掉已通知紀錄)，再次寄送
    app_module.DEMO_NOTIFICATION_LOG.clear()
    offline_db.clear()
    login("admin", "admin123")
    client.post("/api/admin/notify/scholarship-warning")
    assert not any(addr == "parent1@stu.ukn.edu.tw" for addr, _, _ in offline_db)
    assert any(addr == "s112001@stu.ukn.edu.tw" for addr, _, _ in offline_db)
