"""老師自行建立活動、廣播、學生回覆與附件權限。"""
from datetime import date, timedelta
from io import BytesIO


def future(days):
    return (date.today() + timedelta(days=days)).isoformat()


def create(client, target='資管五忠', file=True):
    fields = {'title': '機器人比賽', 'description': '請回覆意願並下載報名表',
              'target_type': '班級', 'target': target, 'event_date': future(14),
              'event_time': '13:20', 'reply_deadline': future(7)}
    if file:
        fields['attachment'] = (BytesIO(b'%PDF-1.4 sample'), 'rules.pdf')
    return client.post('/api/campus/activity-campaigns', data=fields, content_type='multipart/form-data')


def test_teacher_creates_broadcasts_and_sees_class_replies(client, login):
    login('teacher1')
    created = create(client)
    assert created.status_code == 200, created.get_json()
    campaign_id = created.get_json()['data']['id']
    assert created.get_json()['data']['recipient_count'] > 0
    assert create(client, '資管四孝', file=False).status_code == 403
    assert client.post(f'/api/campus/activity-campaigns/{campaign_id}/broadcast').status_code == 200

    client.post('/api/auth/logout')
    login('student1')
    listed = client.get('/api/campus/activity-campaigns').get_json()['data']
    assert any(item['id'] == campaign_id for item in listed)
    assert client.get(f'/api/campus/activity-campaigns/{campaign_id}/files/attachment').data == b'%PDF-1.4 sample'
    response = client.post(f'/api/campus/activity-campaigns/{campaign_id}/reply', data={
        'intention': '參加', 'note': '兩人一組', 'file': (BytesIO(b'%PDF-1.4 signed'), 'signup.pdf')},
        content_type='multipart/form-data')
    assert response.status_code == 200, response.get_json()
    assert client.get(f'/api/campus/activity-campaigns/{campaign_id}/replies').status_code == 403
    assert client.get(f'/api/campus/activity-campaigns/{campaign_id}/files/reply-S112001').data == b'%PDF-1.4 signed'
    assert client.get(f'/api/campus/activity-campaigns/{campaign_id}/files/reply-S112002').status_code == 403

    client.post('/api/auth/logout')
    login('teacher1')
    result = client.get(f'/api/campus/activity-campaigns/{campaign_id}/replies').get_json()
    assert result['counts']['參加'] == 1
    assert result['counts']['未回覆'] >= 1
    assert any(row['student_id'] == 'S112001' and row['file']['name'] == 'signup.pdf' for row in result['data'])
    assert client.get(f'/api/campus/activity-campaigns/{campaign_id}/files/reply-S112001').data == b'%PDF-1.4 signed'


def test_activity_target_scope_and_file_validation(client, login):
    login('staff1')
    bad = client.post('/api/campus/activity-campaigns', data={
        'title': '講座', 'description': '說明', 'target_type': '班級', 'target': '資管五忠',
        'event_date': future(14), 'event_time': '10:30', 'reply_deadline': future(7),
        'attachment': (BytesIO(b'unsafe'), 'script.html')}, content_type='multipart/form-data')
    assert bad.status_code == 400
    campaign_id = create(client, file=False).get_json()['data']['id']
    client.post('/api/auth/logout')
    login('S112004')
    assert all(item['id'] != campaign_id for item in client.get('/api/campus/activity-campaigns').get_json()['data'])
    assert client.post(f'/api/campus/activity-campaigns/{campaign_id}/reply', data={'intention': '參加'}).status_code == 404
    assert client.get(f'/api/campus/activity-campaigns/{campaign_id}/files/attachment').status_code == 404


def test_course_campaign_reaches_students_in_each_class(client, login):
    login('teacher1')
    targets = client.get('/api/campus/activity-campaigns/targets').get_json()['data']
    assert {c['name'] for c in targets['courses']} == {'資料庫系統概論'}
    fields = {'title': '專題講座', 'description': '請回覆意願', 'target_type': '課程',
              'target': '資料庫系統概論', 'event_date': future(12),
              'event_time': '09:30', 'reply_deadline': future(6)}
    created = client.post('/api/campus/activity-campaigns', data=fields)
    assert created.status_code == 200
    campaign_id = created.get_json()['data']['id']
    assert client.post(f'/api/campus/activity-campaigns/{campaign_id}/broadcast').status_code == 200
    client.post('/api/auth/logout')
    login('S112004')
    assert any(c['id'] == campaign_id for c in client.get('/api/campus/activity-campaigns').get_json()['data'])


def test_cs_assistant_creates_only_cs_competition(client, login):
    login('demo_assistant_cs')
    targets = client.get('/api/campus/activity-campaigns/targets').get_json()['data']
    assert {c['name'] for c in targets['classes']} == {'資管五忠', '資管四孝'}
    fields = {'kind': '比賽', 'title': '資管科機器人比賽', 'description': '請回覆參加意願',
              'target_type': '班級', 'target': '資管五忠', 'event_date': future(14),
              'event_time': '13:20', 'reply_deadline': future(7)}
    created = client.post('/api/campus/activity-campaigns', data=fields)
    assert created.status_code == 200, created.get_json()
    assert created.get_json()['data']['kind'] == '比賽'
    assert client.post(f"/api/campus/activity-campaigns/{created.get_json()['data']['id']}/broadcast").status_code == 200
    assert client.post('/api/campus/activity-campaigns', data={**fields, 'target': '護理四忠'}).status_code == 403
    login('demo_assistant_nur')
    assert client.get('/api/campus/activity-campaigns').get_json()['data'] == []


def test_assistant_capacity_waitlist_copy_checkin_and_report(client, login):
    login('demo_assistant_cs')
    fields = {'title': '限額講座', 'description': '測試候補', 'target_type': '班級', 'target': '資管五忠',
              'event_date': future(20), 'event_time': '10:00', 'reply_deadline': future(10),
              'capacity': '1', 'grade': '5'}
    created = client.post('/api/campus/activity-campaigns', data=fields).get_json()['data']
    cid = created['id']
    assert client.post(f'/api/campus/activity-campaigns/{cid}/duplicate', json={
        'event_date': future(30), 'reply_deadline': future(25)}).status_code == 200
    login('student1')
    first = client.post(f'/api/campus/activity-campaigns/{cid}/reply', data={'intention': '參加'}).get_json()
    assert first['data']['status'] == '正取'
    login('S112002')
    second = client.post(f'/api/campus/activity-campaigns/{cid}/reply', data={'intention': '參加'}).get_json()
    assert second['data']['status'] == '候補'
    login('student1')
    cancelled = client.post(f'/api/campus/activity-campaigns/{cid}/reply', data={'intention': '不參加'}).get_json()
    assert cancelled['promoted'] == ['S112002']
    login('demo_assistant_cs')
    assert client.post(f'/api/campus/activity-campaigns/{cid}/checkin', json={'student_id': 'S112002'}).status_code == 200
    report = client.get(f'/api/campus/activity-campaigns/{cid}/report.csv')
    assert report.status_code == 200 and b'S112002' in report.data
    login('demo_assistant_nur')
    assert client.get(f'/api/campus/activity-campaigns/{cid}/report.csv').status_code == 404


def test_teacher_review_and_paid_mode_do_not_forge_payment(client, login):
    login('demo_assistant_cs')
    fields = {'title': '教師審核活動', 'description': '請審核', 'target_type': '班級', 'target': '資管五忠',
              'event_date': future(20), 'event_time': '10:00', 'reply_deadline': future(10),
              'fee_mode': '付費', 'fee_amount': '100'}
    cid = client.post('/api/campus/activity-campaigns', data=fields).get_json()['data']['id']
    added = client.post(f'/api/campus/activity-campaigns/{cid}/approvals', json={'teacher_username': 'teacher1'})
    assert added.status_code == 200
    approval_id = added.get_json()['data']['id']
    batch = client.post(f'/api/campus/activity-campaigns/{cid}/approvals/remind-pending')
    assert batch.status_code == 200 and batch.get_json()['count'] == 1
    overview = client.get('/api/campus/activity-campaigns').get_json()['data']
    campaign = next(c for c in overview if c['id'] == cid)
    assert campaign['approval_summary']['unopened'] == 1
    assert campaign['payment_summary']['integration_status'] == '待串接金流'
    assert campaign['payment_summary']['paid_count'] == 0
    assert client.post(f'/api/campus/activity-campaigns/{cid}/approvals/{approval_id}/remind').status_code == 200
    login('teacher1')
    tasks = client.get('/api/campus/activity-campaigns/teacher-tasks').get_json()
    assert any(t['id'] == approval_id and t['opened_at'] for t in tasks['data'])
    assert client.post(f'/api/campus/activity-campaigns/teacher-tasks/{approval_id}', json={'action': '核准'}).status_code == 200
    login('student1')
    assert client.post(f'/api/campus/activity-campaigns/{cid}/reply', data={'intention': '參加'}).status_code == 503


def test_signed_qr_checkin_requires_own_confirmed_registration(client, login):
    from itsdangerous import URLSafeTimedSerializer
    login('demo_assistant_cs')
    cid = create(client, file=False).get_json()['data']['id']
    assert client.get(f'/api/campus/activity-campaigns/{cid}/checkin-qr').status_code == 200
    token = URLSafeTimedSerializer(client.application.secret_key, salt='activity-checkin').dumps(cid)
    login('student1')
    assert client.post(f'/api/campus/activity-campaigns/{cid}/self-checkin', json={'token': token}).status_code == 403
    assert client.post(f'/api/campus/activity-campaigns/{cid}/reply', data={'intention': '參加'}).status_code == 200
    assert client.post(f'/api/campus/activity-campaigns/{cid}/self-checkin', json={'token': token}).status_code == 200
    assert client.post(f'/api/campus/activity-campaigns/{cid}/self-checkin', json={'token': token}).status_code == 409


def test_student_visitor_share_seats_waitlist_and_qr_checkin(client, login):
    from itsdangerous import URLSafeTimedSerializer
    login('demo_assistant_cs')
    created = client.post('/api/campus/activity-campaigns', data={
        'title': '資管科機器人體驗賽', 'description': '學生與訪客共同報名',
        'target_type': '班級', 'target': '資管五忠', 'location': '資訊管理科專題教室',
        'event_date': future(14), 'event_time': '13:30', 'reply_deadline': future(7),
        'capacity': '1', 'visitor_allowed': 'on'})
    assert created.status_code == 200, created.get_json()
    cid = created.get_json()['data']['id']
    assert created.get_json()['data']['location'] == '資訊管理科專題教室'
    login('student1')
    assert client.post(f'/api/campus/activity-campaigns/{cid}/reply', data={'intention': '參加'}).get_json()['data']['status'] == '正取'
    visitor = client.post('/api/visitor/register', json={
        'visitor_name': '示範訪客', 'phone': '0912345678', 'purpose': '參加活動',
        'visitor_type': '一般訪客'})
    assert visitor.status_code == 201, visitor.get_json()
    with client.session_transaction() as session:
        visitor_session = dict(session)
    signed = client.post(f'/api/campus/activity-campaigns/{cid}/visitor-register')
    assert signed.status_code == 200 and signed.get_json()['data']['status'] == '候補'
    assert client.get(f'/api/campus/activity-campaigns/{cid}/files/reply-S112001').status_code == 403
    token = URLSafeTimedSerializer(client.application.secret_key, salt='activity-checkin').dumps(cid)
    assert client.post(f'/api/campus/activity-campaigns/{cid}/self-checkin', json={'token': token}).status_code == 403
    login('student1')
    assert client.post(f'/api/campus/activity-campaigns/{cid}/reply', data={'intention': '不參加'}).status_code == 200
    login('demo_assistant_cs')
    campaign = next(c for c in client.get('/api/campus/activity-campaigns').get_json()['data'] if c['id'] == cid)
    assert campaign['confirmed_count'] == 1 and campaign['waitlist_count'] == 0
    roster = client.get(f'/api/campus/activity-campaigns/{cid}/replies').get_json()['data']
    assert any(r['participant_type'] == '訪客' and r['status'] == '正取' for r in roster)
    with client.session_transaction() as session:
        session.clear()
        session.update(visitor_session)
    assert client.post(f'/api/campus/activity-campaigns/{cid}/self-checkin', json={'token': token}).status_code == 200
    assert client.post(f'/api/campus/activity-campaigns/{cid}/self-checkin', json={'token': token}).status_code == 409
    login('demo_assistant_cs')
    assert '示範訪客' in client.get(f'/api/campus/activity-campaigns/{cid}/report.csv').data.decode('utf-8-sig')
