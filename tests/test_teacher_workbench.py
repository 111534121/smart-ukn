from datetime import date, timedelta
from campus.common import store


def send(client, **extra):
    r = client.post('/api/campus/notices', json={'class_name': '資管五忠', 'title': '參訪確認', 'content': '請回覆', 'reply_required': True, **extra})
    assert r.status_code == 200, r.get_json()
    return r.get_json()['data']['id']


def test_read_is_not_reply_and_update_is_not_double_counted(client, login):
    login('teacher1'); nid = send(client)
    login('student1')
    assert client.post(f'/api/campus/notices/{nid}/read').status_code == 200
    login('teacher1')
    n = client.get('/api/campus/notices/sent').get_json()['data'][0]
    assert n['read_count'] == 1 and n['reply_count'] == 0
    login('student1')
    for reply in ('收到', '需要協助'):
        assert client.post(f'/api/campus/notices/{nid}/reply', json={'reply': reply}).status_code == 200
    inbox = client.get('/api/campus/notices/inbox').get_json()['data'][0]
    assert inbox['my_reply']['reply'] == '需要協助'
    assert 'replies' not in inbox and 'recipients' not in inbox
    login('teacher1')
    n = client.get('/api/campus/notices/sent').get_json()['data'][0]
    assert n['reply_count'] == 1 and n['reply_details'][0]['reply'] == '需要協助'
    assert any(a['type'] == '回條' for a in client.get('/api/staff/alerts').get_json()['data'])


def test_reminder_only_reaches_students_without_reply(client, login):
    login('teacher1'); nid = send(client, recipients=['S112001', 'S112002'])
    login('student1'); client.post(f'/api/campus/notices/{nid}/reply', json={'reply': '收到'})
    login('teacher1')
    r = client.post(f'/api/campus/notices/{nid}/remind')
    assert r.status_code == 200 and r.get_json()['count'] == 1
    reminder = store.data['notices'][-1]
    assert reminder['recipients'] == ['S112002'] and not reminder['reply_required']
    login('staff1')
    assert client.post(f'/api/campus/notices/{nid}/remind').status_code == 404


def test_receipt_scope_deadline_and_invalid_reply(client, login):
    login('teacher1'); nid = send(client, recipients=['S112002'])
    login('student1')
    assert client.post(f'/api/campus/notices/{nid}/reply', json={'reply': '收到'}).status_code == 404
    login('parent1')
    assert client.post(f'/api/campus/notices/{nid}/reply', json={'reply': '收到'}).status_code == 403
    login('student2')
    assert client.post(f'/api/campus/notices/{nid}/reply', json={'reply': '其他'}).status_code == 400
    login('teacher1')
    old = send(client, due_date=(date.today() - timedelta(days=1)).isoformat())
    login('student1')
    assert client.post(f'/api/campus/notices/{old}/reply', json={'reply': '收到'}).status_code == 409
    login('teacher1')
    assert client.post(f'/api/campus/notices/{old}/remind').status_code == 409


def test_no_receipt_required_and_all_replied(client, login):
    login('teacher1'); plain = send(client, reply_required=False)
    nid = send(client, recipients=['S112001'])
    login('student1')
    assert client.post(f'/api/campus/notices/{plain}/reply', json={'reply': '收到'}).status_code == 400
    client.post(f'/api/campus/notices/{nid}/reply', json={'reply': '收到'})
    login('teacher1')
    assert client.post(f'/api/campus/notices/{nid}/remind').get_json()['count'] == 0


def test_care_due_date_stages_close_reopen_and_scope(client, login):
    login('teacher1')
    r = client.post('/api/campus/counseling', json={'student_id': 'S112001', 'content': '確認出席', 'follow_up': True, 'follow_up_date': date.today().isoformat(), 'tracking_status': '已聯繫', 'tracking_result': '已安排談話'})
    assert r.status_code == 200, r.get_json()
    rid = r.get_json()['data']['id']
    assert r.get_json()['data']['tracking_status'] == '已聯繫'
    assert any(a['key'] == f'care-{rid}' for a in client.get('/api/staff/alerts').get_json()['data'])
    updated = client.put(f'/api/campus/counseling/{rid}', json={'tracking_status': '已結案', 'tracking_result': '已恢復出席'}).get_json()['data']
    assert updated['follow_up_done'] is True
    assert not any(a['key'] == f'care-{rid}' for a in client.get('/api/staff/alerts').get_json()['data'])
    assert client.put(f'/api/campus/counseling/{rid}', json={'tracking_status': '追蹤中'}).get_json()['data']['follow_up_done'] is False
    assert client.put(f'/api/campus/counseling/{rid}', json={'follow_up_date': '2026-99-99'}).status_code == 400
    assert client.put(f'/api/campus/counseling/{rid}', json={'tracking_status': '不存在'}).status_code == 400
    csv = client.get('/api/campus/counseling/export.csv').data.decode('utf-8-sig')
    assert '追蹤日期' in csv and '已恢復出席' in csv
    login('student1')
    assert client.get('/api/campus/counseling').status_code == 403


def test_legacy_care_defaults_and_db_fields(monkeypatch):
    from campus import counseling, messaging
    monkeypatch.setattr(counseling, 'use_db', lambda: True)
    writes = []
    def execute(sql, params):
        writes.append((sql, params)); return {'lastrowid': 42}
    monkeypatch.setattr(counseling.deps, 'db_execute', execute)
    monkeypatch.setattr(counseling, 'find_record', lambda rid: {'id': rid})
    fields, error = counseling.clean({'content': 'test', 'follow_up_date': '2026-10-22', 'tracking_status': '追蹤中'})
    assert error is None
    counseling.insert_record({**fields, 'student_id': 'S112001', 'class_name': '資管五忠', 'counselor_username': 'teacher1', 'counselor_name': '老師'})
    assert 'follow_up_date' in writes[0][0] and '2026-10-22' in writes[0][1]
    assert counseling._row({'follow_up_done': True})['tracking_status'] == '已結案'
    monkeypatch.setattr(messaging, 'use_db', lambda: True)
    def rows(sql, params=()):
        if 'SELECT n.*' in sql:
            return [{'id': 42, 'whole_class': 1, 'due_date': None, 'created_at': '2026-10-20', 'reply_required': 1}]
        return [{'notice_id': 42, 'student_id': 'S112001', 'read_at': '2026-10-20', 'reply': '收到', 'reply_at': '2026-10-20 10:00:00'}]
    monkeypatch.setattr(messaging.deps, 'fetch_db_rows', rows)
    n = messaging.load_notices(sender_username='teacher1')[0]
    assert n['replies']['S112001']['reply'] == '收到'


def test_schema_upgrade_is_additive_and_repeatable():
    from teacher_workbench_schema import upgrade_cursor
    class Cursor:
        def __init__(self): self.columns = set(); self.key = None; self.statements = []
        def execute(self, sql, params=()):
            self.statements.append(sql)
            if sql.startswith('SELECT'): self.key = params
            else: self.columns.add(self.key)
        def fetchone(self): return (int(self.key in self.columns),)
    cursor = Cursor()
    assert len(upgrade_cursor(cursor)) == 6
    assert upgrade_cursor(cursor) == []
    assert not any('DROP' in sql or 'DELETE' in sql for sql in cursor.statements)


def test_notice_rejects_bad_dates_and_deduplicates_recipients(client, login):
    login('teacher1')
    assert client.post('/api/campus/notices', json={'class_name': '資管五忠', 'title': 'test', 'content': 'test', 'due_date': 'bad'}).status_code == 400
    nid = send(client, recipients=['S112001', 'S112001'])
    n = next(n for n in client.get('/api/campus/notices/sent').get_json()['data'] if n['id'] == nid)
    assert n['total'] == 1


def test_user_seal_upload_and_query(client, login):
    import io, admin_db
    admin_db.execute_db("DELETE FROM user_seals WHERE username = %s", ("teacher1",))
    # 學生無權上傳印章
    login('student1')
    assert client.post('/api/user/seal', data={'seal_file': (io.BytesIO(b'fake-image'), 'seal.png')}).status_code == 403

    # 老師查詢初始印章 (尚未設定)
    login('teacher1')
    res = client.get('/api/user/seal')
    assert res.status_code == 200
    assert not res.get_json()['has_seal']

    # 老師上傳印章圖檔
    upload_res = client.post('/api/user/seal', data={
        'seal_file': (io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR...'), 'my_seal.png')
    }, content_type='multipart/form-data')
    assert upload_res.status_code == 200
    seal_info = upload_res.get_json()['data']
    assert seal_info['username'] == 'teacher1'
    assert 'seal_url' in seal_info

    # 再次查詢印章
    get_res = client.get('/api/user/seal')
    assert get_res.status_code == 200
    assert get_res.get_json()['has_seal']
    assert get_res.get_json()['data']['username'] == 'teacher1'
