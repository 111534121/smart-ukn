"""Cross-role checks for the teacher workspace."""
from datetime import datetime, timedelta


BASE = '/api/campus/teacher-smart'


def test_attendance_qr_checkin_and_scope(client, login):
    login('teacher1')
    made = client.post(BASE + '/attendance-sessions', json={})
    assert made.status_code == 200, made.get_json()
    item = made.get_json()['data']
    assert item['class_name'] == '資管五忠'
    assert client.get(f"{BASE}/attendance-sessions/{item['id']}/qr.svg").mimetype == 'image/svg+xml'
    login('student1')
    assert client.post(BASE + '/attendance-checkin', json={'code': item['code']}).status_code == 200
    assert client.post(BASE + '/attendance-checkin', json={'code': item['code']}).status_code == 200
    login('teacher1')
    detail = client.get(f"{BASE}/attendance-sessions/{item['id']}").get_json()['data']
    assert sum(s['present'] for s in detail['students']) == 1
    login('S112004')
    assert client.get(f"{BASE}/attendance-sessions/{item['id']}").status_code == 403


def test_attendance_other_class_and_expired(client, login):
    from campus.common import store
    login('teacher1')
    assert client.post(BASE + '/attendance-sessions', json={'class_name': '資管四孝'}).status_code == 403
    item = client.post(BASE + '/attendance-sessions', json={}).get_json()['data']
    store.section('teacher_smart_attendance', list)[0]['expires_at'] = '2020-01-01T00:00:00'
    login('student1')
    assert client.post(BASE + '/attendance-checkin', json={'code': item['code']}).status_code == 409


def test_office_booking_is_single_and_private(client, login):
    login('teacher1')
    starts = (datetime.now() + timedelta(days=2)).replace(second=0, microsecond=0).isoformat(timespec='minutes')
    made = client.post(BASE + '/office-slots', json={'starts_at': starts, 'minutes': 30})
    assert made.status_code == 200, made.get_json()
    slot_id = made.get_json()['data']['id']
    login('student1')
    assert client.post(f'{BASE}/office-slots/{slot_id}/book').status_code == 200
    assert client.post(f'{BASE}/office-slots/{slot_id}/book').status_code == 409
    assert 'BEGIN:VCALENDAR' in client.get(f'{BASE}/office-slots/{slot_id}/calendar.ics').data.decode()
    login('S112004')
    assert client.get(BASE + '/office-slots').get_json()['data'] == []
    login('teacher1')
    assert client.get(BASE + '/office-slots').get_json()['data'][0]['student_id'] == 'S112001'
    assert client.get(BASE + '/portfolio.csv').data.startswith(b'\xef\xbb\xbf')


def test_ai_draft_requires_teacher_and_local_model(client, login, monkeypatch):
    from assistant import ollama
    login('student1')
    assert client.post(BASE + '/ai-draft', data={'kind': 'quiz', 'text': '這是足夠長的講義內容，請出題'}).status_code == 403
    login('teacher1')
    monkeypatch.setattr(ollama, 'chat', lambda *a, **k: '題目草稿')
    result = client.post(BASE + '/ai-draft', data={'kind': 'quiz', 'text': '這是足夠長的講義內容，請出題'})
    assert result.status_code == 200 and result.get_json()['saved'] is False
    assert result.get_json()['draft'] == '題目草稿'
    assert client.post(BASE + '/ai-draft', data={'kind': 'quiz', 'text': 'short'}).status_code == 400


def test_topic_analysis_uses_real_counts(client, login):
    login('teacher1')
    result = client.post(BASE + '/topic-analysis', json={'topic': '第三章資料庫', 'wrong': 7, 'total': 10})
    assert result.status_code == 200
    assert result.get_json()['data']['error_rate'] == 70.0
    assert client.post(BASE + '/topic-analysis', json={'topic': '第三章', 'wrong': 11, 'total': 10}).status_code == 400
    assert client.get(BASE + '/topic-analysis').get_json()['data'][0]['topic'] == '第三章資料庫'
    login('student1')
    assert client.get(BASE + '/topic-analysis').status_code == 403
