"""LINE preparation never sends or exposes another account's preferences."""


def test_teacher_choices_are_private_and_inactive(client, login):
    assert client.get('/api/line/settings').status_code == 401
    login('teacher1')
    initial = client.get('/api/line/settings').get_json()['data']
    assert initial['choices'] == {'leave_pending': False, 'care_due': False}
    assert initial['connected'] is False and initial['active'] is False
    assert client.put('/api/line/settings', json={'leave_pending': 'yes', 'care_due': False}).status_code == 400
    saved = client.put('/api/line/settings', json={'leave_pending': True, 'care_due': False}).get_json()['data']
    assert saved['choices'] == {'leave_pending': True, 'care_due': False}
    assert saved['active'] is False
    client.post('/api/auth/logout')
    login('staff1')
    assert client.get('/api/line/settings').status_code == 403


def test_delivery_claim_is_once_per_recipient_and_event():
    from campus.line_notifications import claim_delivery
    assert claim_delivery('leave-123', 'user:teacher1') is True
    assert claim_delivery('leave-123', 'user:teacher1') is False
    assert claim_delivery('leave-123', 'user:teacher2') is True


def test_demo_send_is_explicit_private_and_rate_limited(client, login, monkeypatch):
    from campus import line_notifications
    monkeypatch.setenv('LINE_DEMO_ENABLED', '1')
    monkeypatch.setenv('LINE_DEMO_USERNAME', 'teacher1')
    monkeypatch.setenv('LINE_DEMO_USER_ID', 'U' + 'a' * 32)
    monkeypatch.setenv('LINE_CHANNEL_ACCESS_TOKEN', 'test-token')
    sent = []
    monkeypatch.setattr(line_notifications, 'push_demo_message', lambda target, token: sent.append((target, token)) or True)
    assert client.post('/api/line/demo-send').status_code == 401
    login('teacher1')
    assert client.get('/api/line/demo-status').get_json()['ready'] is True
    assert client.post('/api/line/demo-send').status_code == 200
    assert sent == [('U' + 'a' * 32, 'test-token')]
    assert client.post('/api/line/demo-send').status_code == 429
    client.post('/api/auth/logout')
    login('staff1')
    assert client.post('/api/line/demo-send').status_code == 403
