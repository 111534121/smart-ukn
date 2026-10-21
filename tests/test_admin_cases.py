"""完整跨角色驗收：處室轉派 → 補件 → 重新送審 → 結案與資料隔離。"""
from datetime import timedelta
from io import BytesIO

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
    result = client.put(BASE + '/config', json={'members': {'staff1': '教務處', 'dorm_demo': '總務處'}})
    assert result.status_code == 200


def test_transfer_supplement_resubmit_and_complete(client, login):
    configure(client, login)
    item = create(client, login)
    case_id = item['id']
    assert item['office'] == '教務處'
    login('staff1')
    assert any(a['key'] == f'admin-case-{case_id}' for a in client.get('/api/staff/alerts').get_json()['data'])
    result = act(client, item, 'assign', office='總務處', assignee='dorm_demo', note='確認為總務業務，請協助')
    assert result.status_code == 200
    item = result.get_json()['data']
    assert item['assignee'] == 'dorm_demo'
    assert client.get(f'{BASE}/{case_id}').status_code == 404
    assert not client.get(BASE).get_json()['data']
    assert not any(a['key'] == f'admin-case-{case_id}' for a in client.get('/api/staff/alerts').get_json()['data'])
    login('dorm_demo')
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
    login('dorm_demo')
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
    assert client.get('/admin-workbench').status_code == 200
    assert client.get('/css/admin-workbench.css').status_code == 200
    assert client.get('/js/admin-workbench.js').status_code == 200


def test_overdue_and_student_scope(client, login):
    item = create(client, login)
    with module.store.lock:
        module.cases()[0]['due_date'] = (module.today() - timedelta(days=1)).isoformat()
    assert client.get(BASE).get_json()['data'][0]['overdue']
    login('student2')
    assert act(client, item, 'resubmit', checked=[], note='冒用').status_code == 404
