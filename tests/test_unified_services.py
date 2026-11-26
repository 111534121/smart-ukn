"""Four shared services: end-to-end state, file, permissions and revision checks."""
from datetime import timedelta
from io import BytesIO
import pytest
from campus import admin_cases

BASE = '/api/campus/admin-cases'
KINDS = ['請假申請', '成績單申請', '場地借用', '設備報修申請']

def answers_for(kind, spec):
    values = {key: '示範：' + key for key in spec['fields']}
    values.update({k: v for k, v in {'開始日期':'2026-11-02','結束日期':'2026-11-02','申請份數':'1'}.items() if k in values})
    return values

@pytest.mark.parametrize('kind', KINDS)
def test_full_lifecycle_and_ownership(client, login, kind):
    login('student1')
    spec = client.get(BASE+'/config').get_json()['workflows'][kind]
    body = {'kind':kind,'title':'【統一申辦驗收】'+kind,'detail':'虛構資料，不代表正式申請','answers':answers_for(kind,spec)}
    r = client.post(BASE,json=body)
    assert r.status_code == 200, r.get_json()
    item = r.get_json()['data']; cid = item['id']
    assert item['status'] == '待受理'
    assert '等待' in item['progress']['next_action']
    login('student2')
    assert client.get(f'{BASE}/{cid}').status_code == 404
    login('admin','admin123')
    def act(action, **extra):
        nonlocal item
        if kind == '成績單申請' and action in ('advance','complete'):
            extra.update(signoff_confirmed=True,review_digest=item['review_digest'])
        r = client.post(f'{BASE}/{cid}',json={'action':action,'revision':item['revision'],**extra})
        assert r.status_code == 200, r.get_json()
        item = r.get_json()['data']
    act('start')
    act('supplement', requirements=['補充用途說明'], due_date=(admin_cases.today()+timedelta(days=3)).isoformat(),note='示範要求補件')
    assert item['progress']['requires_supplement']
    login('student1')
    r = client.post(f'{BASE}/{cid}',json={'action':'resubmit','revision':item['revision'],'checked':[],'note':'資料未齊'})
    assert r.status_code == 400
    old_revision = item['revision']
    r = client.post(f'{BASE}/{cid}',data={'action':'resubmit','revision':str(item['revision']),'checked':'補充用途說明','note':'示範補充用途', 'files':(BytesIO(b'demo supplement'),'demo.txt')})
    assert r.status_code == 200, r.get_json()
    item = r.get_json()['data']
    assert item['status'] == '重新送審' and not item['progress']['requires_supplement']
    assert client.get(f"{BASE}/{cid}/files/{item['files'][0]['id']}").status_code == 200
    assert client.post(f'{BASE}/{cid}',json={'action':'resubmit','revision':old_revision}).status_code == 409
    login('admin','admin123')
    for index, step in enumerate(item['workflow']):
        act('start')
        act('advance' if index < len(item['workflow'])-1 else 'complete',checked_steps=step['checks'],note='【示範】完成檢核與結果登錄')
    login('student1')
    result = client.get(f'{BASE}/{cid}').get_json()['data']
    assert result['status'] == '已完成'
    assert result['workflow_index'] == len(result['workflow'])-1
    assert result['progress']['responsible'] == '已結案'
    assert '已完成' in result['progress']['next_action']
    assert any(h['action']=='補件重新送審' for h in result['history'])
    assert not result['progress']['supplement_items']

@pytest.mark.parametrize('kind,bad', [('請假申請',{'開始日期':'2026-11-03','結束日期':'2026-11-02'}),('場地借用',{'開始日期':'bad'}),('成績單申請',{'申請份數':'0'})])
def test_invalid_fields_rejected(client,login,kind,bad):
    login('student1')
    spec = client.get(BASE+'/config').get_json()['workflows'][kind]
    answers = {**answers_for(kind,spec),**bad}
    r = client.post(BASE,json={'kind':kind,'title':'無效資料驗收','detail':'test','answers':answers})
    assert r.status_code == 400
