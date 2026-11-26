"""完整跨角色驗收：處室轉派 → 補件 → 重新送審 → 結案與資料隔離。"""
from datetime import timedelta
from io import BytesIO
import json

import pytest

from campus import admin_cases as module

BASE = '/api/campus/admin-cases'


def create(client, login, kind='學籍與成績'):
    login('student1')
    result = client.post(BASE, data={'kind': kind, 'title': '在學證明申請', 'detail': '請協助確認申請資料',
                                     'files': (BytesIO(b'original evidence'), 'document.txt')})
    assert result.status_code == 200, result.get_json()
    return result.get_json()['data']


def act(client, item, action, **kwargs):
    return client.post(f"{BASE}/{item['id']}", json={'action': action, 'revision': item['revision'], **kwargs})


def configure(client, login):
    login('admin', 'admin123')
    result = client.put(BASE + '/config', json={'members': {'staff1': '教務處', 'demo_office_general': '總務處',
                                                           'dorm_demo': '學生事務處／住宿管理'}})
    assert result.status_code == 200


def test_transfer_supplement_resubmit_and_complete(client, login):
    configure(client, login)
    item = create(client, login)
    case_id = item['id']
    assert item['office'] == '教務處'
    login('staff1')
    assert any(a['key'] == f'admin-case-{case_id}' for a in client.get('/api/staff/alerts').get_json()['data'])
    result = act(client, item, 'assign', office='總務處', assignee='demo_office_general', note='確認為總務業務，請協助')
    assert result.status_code == 200
    item = result.get_json()['data']
    assert item['assignee'] == 'demo_office_general'
    assert client.get(f'{BASE}/{case_id}').status_code == 404
    assert not client.get(BASE).get_json()['data']
    assert not any(a['key'] == f'admin-case-{case_id}' for a in client.get('/api/staff/alerts').get_json()['data'])
    login('demo_office_general')
    item = act(client, item, 'start').get_json()['data']
    due = (module.today() + timedelta(days=3)).isoformat()
    result = act(client, item, 'supplement', requirements=['簽名申請表', '收據'], due_date=due, note='原文件缺簽名與收據')
    assert result.status_code == 200, result.get_json()
    item = result.get_json()['data']
    assert item['status'] == '待補件'
    assert client.get(BASE).get_json()['counts']['待補件'] == 1
    login('student1')
    assert client.get(f'{BASE}/{case_id}').get_json()['data']['requirements'] == ['簽名申請表', '收據']
    assert act(client, item, 'resubmit', checked=['簽名申請表'], note='已補').status_code == 400
    result = client.post(f'{BASE}/{case_id}', data={'action': 'resubmit', 'revision': str(item['revision']),
                        'checked': ['簽名申請表', '收據'], 'note': '已簽名並補交收據',
                        'files': (BytesIO(b'supplement evidence'), 'receipt.txt')})
    assert result.status_code == 200, result.get_json()
    item = result.get_json()['data']
    assert item['status'] == '重新送審' and len(item['files']) == 2
    assert item['supplements'][0]['note'] == '已簽名並補交收據'
    assert act(client, item, 'resubmit', checked=item['requirements'], note='重送').status_code == 409
    login('demo_office_general')
    assert any(a['key'] == f'admin-case-{case_id}' for a in client.get('/api/staff/alerts').get_json()['data'])
    item = act(client, item, 'start').get_json()['data']
    result = act(client, item, 'complete', note='文件完整，已完成辦理')
    assert result.status_code == 200
    item = result.get_json()['data']
    assert item['status'] == '已完成'
    assert [h['action'] for h in item['history']] == ['送出申請', '分派／轉交案件', '受理案件', '要求補件', '補件重新送審', '受理案件', '完成案件']
    assert not any(a['key'] == f'admin-case-{case_id}' for a in client.get('/api/staff/alerts').get_json()['data'])
    login('student1')
    assert client.get(f'{BASE}/{case_id}').get_json()['data']['status'] == '已完成'


def test_supplement_notification_is_private_and_due_reminder_is_idempotent(client, login):
    configure(client, login)
    item = create(client, login)
    login('staff1')
    item = act(client, item, 'start').get_json()['data']
    due = (module.today() + timedelta(days=1)).isoformat()
    item = act(client, item, 'supplement', requirements=['證明文件照片'], due_date=due,
               note='缺少可辨識的照片').get_json()['data']
    login('student1')
    notices = client.get(BASE + '/notifications').get_json()['data']
    assert {n['title'] for n in notices} == {'行政案件需要補件', '行政案件補件期限提醒'}
    assert all(n['case_id'] == item['id'] for n in notices)
    assert len(client.get(BASE + '/notifications').get_json()['data']) == 2
    login('student2')
    assert client.get(BASE + '/notifications').get_json()['data'] == []


def test_certificate_receipt_without_photo_requests_three_day_supplement(client, login):
    login('student1')
    answers = {'資料類別（實習／證照／其他）': '證照', '資料名稱': '軟體證照',
               '學年學期': '115-1', '聯絡方式': '站內通知'}
    response = client.post(BASE, data={'kind': '資訊管理科（五專）資料收件',
        'title': '證照文件繳交', 'detail': '申請收件', 'answers': json.dumps(answers, ensure_ascii=False)})
    assert response.status_code == 200, response.get_json()
    case = response.get_json()['data']
    assert case['status'] == '待補件'
    assert case['requirements'] == ['證照正本照片或 PDF']
    assert case['due_date'] == (module.today() + timedelta(days=3)).isoformat()
    assert any(n['case_id'] == case['id'] for n in client.get(BASE + '/notifications').get_json()['data'])


@pytest.mark.parametrize('username', ['student2', 'parent1', 'teacher1', 'dorm_demo'])
def test_private_cases_and_attachments(client, login, username):
    item = create(client, login)
    url = f"{BASE}/{item['id']}/files/{item['files'][0]['id']}"
    assert client.get(url).data == b'original evidence'
    login(username)
    expected = 403 if username in ('parent1', 'teacher1') else 404
    assert client.get(f"{BASE}/{item['id']}").status_code == expected
    assert client.get(url).status_code == expected
    if username in ('student2', 'dorm_demo'):
        assert client.get(BASE).get_json()['data'] == []


def test_assignment_validation_and_revocation(client, login):
    configure(client, login)
    item = create(client, login)
    login('staff1')
    assert client.put(BASE + '/config', json={'members': {}}).status_code == 403
    assert act(client, item, 'assign', office='總務處', assignee='staff1', note='轉派').status_code == 400
    assert act(client, item, 'assign', office='不存在', note='轉派').status_code == 400
    login('admin', 'admin123')
    assert client.put(BASE + '/config', json={'members': {'fake': '教務處'}}).status_code == 400
    assert client.put(BASE + '/config', json={'members': {'dorm_demo': '總務處'}}).status_code == 400
    assert client.put(BASE + '/config', json={'members': {}}).status_code == 200
    login('staff1')
    assert client.get(f"{BASE}/{item['id']}").status_code == 404
    assert act(client, item, 'start').status_code == 404


def test_state_validation_stale_revision_and_persistence(client, login):
    item = create(client, login)
    assert act(client, item, 'start').status_code == 403
    login('staff1')
    assert act(client, item, 'complete', note='完成').status_code == 409
    assert act(client, item, 'supplement', requirements=[], due_date=module.today().isoformat(), note='補件').status_code == 400
    assert act(client, item, 'supplement', requirements=['文件'], due_date='invalid', note='補件').status_code == 400
    old = item
    item = act(client, item, 'start').get_json()['data']
    assert act(client, old, 'reject', note='舊版本覆寫').status_code == 409
    assert act(client, item, 'reject', note='').status_code == 409
    item = act(client, item, 'reject', note='不符合申請資格').get_json()['data']
    assert act(client, item, 'assign', office='總務處', note='不應修改').status_code == 409
    saved = module.store._load()['admin_cases'][0]
    assert saved['status'] == '已退件' and len(saved['history']) == 3


def test_upload_rejection_and_anonymous_access(client, login):
    assert client.get(BASE).status_code == 401
    assert client.get('/admin-workbench').status_code == 401
    login('student1')
    for content, name in [(b'bad', 'program.exe'), (b'', 'empty.txt'), (b'x' * (module.MAX_FILE + 1), 'large.pdf')]:
        response = client.post(BASE, data={'kind':'學籍與成績', 'title':'測試', 'detail':'說明', 'files':(BytesIO(content), name)})
        assert response.status_code == 400
    assert not client.get(BASE).get_json()['data']
    response = client.get('/admin-workbench')
    assert response.status_code == 302 and response.headers['Location'] == '/#admin-cases'
    assert client.get('/admin-workbench?embedded=1').status_code == 200
    assert client.get('/css/admin-workbench.css').status_code == 200
    assert client.get('/js/admin-workbench.js').status_code == 200


def test_overdue_and_student_scope(client, login):
    item = create(client, login)
    with module.store.lock:
        module.cases()[0]['due_date'] = (module.today() - timedelta(days=1)).isoformat()
    assert client.get(BASE).get_json()['data'][0]['overdue']
    login('student2')
    assert act(client, item, 'resubmit', checked=[], note='冒用').status_code == 404
def test_mysql_case_update_rejects_stale_revision(monkeypatch):
    from campus import admin_case_store
    from campus.common import deps
    monkeypatch.setattr(admin_case_store, 'use_db', lambda: True)
    writes = []
    monkeypatch.setattr(deps, 'db_execute', lambda sql, params: writes.append((sql, params)) or {'rowcount': 0})
    item = {'id': 17, 'revision': 3, 'office': '教務處', 'status': '處理中'}
    assert admin_case_store.update(item, 2) is False
    assert 'WHERE id=%s AND revision=%s' in writes[0][0]
    assert writes[0][1][-2:] == (17, 2)
