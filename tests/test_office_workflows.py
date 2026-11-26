"""各處室獨立流程、逐關權限、流程版本與示範資料驗收。"""
from copy import deepcopy
from datetime import timedelta

from campus import admin_cases as module
from campus import office_catalog as catalog

BASE = '/api/campus/admin-cases'


def configuration(client, login):
    login('admin','admin123')
    result = client.get(BASE+'/config').get_json()
    members = {'staff1':'教務處','dorm_demo':'學生事務處／住宿管理'}
    members.update({a['username']:a['office'] for a in catalog.demo_accounts()})
    assert client.put(BASE+'/config',json={'members':members}).status_code == 200
    return result


def create(client, login, kind='學籍證明申請', username='student1'):
    login(username)
    spec = client.get(BASE+'/config').get_json()['workflows'][kind]
    response = client.post(BASE,json={'kind':kind,'title':'處室流程測試','detail':'虛構測試資料',
                                     'answers':{key:'示範填答' for key in spec['fields']}})
    assert response.status_code == 200, response.get_json()
    return response.get_json()['data']


def act(client, item, action, **extra):
    return client.post(f"{BASE}/{item['id']}",json={'action':action,'revision':item['revision'],**extra})


def test_catalog_distinct_units_and_multiple_people(client, login):
    config = configuration(client,login)
    assert len(config['offices']) == 31
    assert {'會計室','人事室','資訊暨圖書中心','國際暨兩岸事務處'}.issubset(config['offices'])
    for kind, office in [('學籍證明申請（註冊組）','教務處／註冊組'),
                         ('課務異動諮詢（課務組）','教務處／課務組'),
                         ('設備報修申請（事務組）','總務處／事務組'),
                         ('住宿異動申請','學生事務處／住宿管理'),
                         ('資訊管理科（五專）資料收件','資訊管理科（五專）／科辦公室')]:
        assert config['workflows'][kind]['office'] == office
    login('staff1')
    data = client.get(BASE+'/config').get_json()
    assert data['office'] == '教務處'
    assert {'staff1','demo_office_academic'}.issubset({a['username'] for a in data['accounts']})
    assert all(data['members'][a['username']] == '教務處' for a in data['accounts'])


def test_required_fields_and_applicant_role(client,login):
    configuration(client,login)
    login('student1')
    assert client.post(BASE,json={'kind':'學籍證明申請','title':'測試','detail':'說明'}).status_code == 400
    assert client.post(BASE,json={'kind':'教職員在職證明申請','title':'測試','detail':'說明'}).status_code == 403
    response = client.post(BASE,json={'kind':'學籍證明申請','title':'測試','detail':'說明','answers':['不正確']})
    assert response.status_code == 400


def test_one_dorm_account_handles_both_workflows(client, login):
    configuration(client, login)
    item = create(client, login, '住宿異動申請')
    login('dorm_demo')
    config = client.get(BASE+'/config').get_json()
    assert config['office'] == '學生事務處／住宿管理'
    assert client.get(f"{BASE}/{item['id']}").get_json()['data']['can_act']
    assert client.get('/api/campus/dorm/applications').status_code == 200
    assert not any(a['username'] == 'demo_dorm' for a in catalog.demo_accounts())


def test_dorm_repair_student_progress_and_office_scope(client, login):
    configuration(client, login)
    item = create(client, login, '住宿設備報修')
    case_id = item['id']
    assert any(c['id'] == case_id for c in client.get(BASE).get_json()['data'])
    login('student2')
    assert all(c['id'] != case_id for c in client.get(BASE).get_json()['data'])
    assert client.get(f'{BASE}/{case_id}').status_code == 404
    login('staff1')
    assert all(c['id'] != case_id for c in client.get(BASE).get_json()['data'])
    assert client.get(f'{BASE}/{case_id}').status_code == 404
    login('dorm_demo')
    case = client.get(f'{BASE}/{case_id}').get_json()['data']
    assert case['office'] == '學生事務處／住宿管理' and case['can_act']
    started = act(client, case, 'start')
    assert started.status_code == 200
    login('student1')
    student_case = client.get(f'{BASE}/{case_id}').get_json()['data']
    assert student_case['status'] == '處理中'
    assert not student_case['can_act']


def test_dorm_examples_are_visible_and_idempotent():
    import seed_dorm_staff_demo
    first = seed_dorm_staff_demo.main()
    assert len(first['added']) == 5
    assert first['dorm_applications'] == 2
    assert first['dorm_admin_cases'] == 3
    assert first['dorm_todos'] == 3
    second = seed_dorm_staff_demo.main()
    assert second['added'] == []
    assert second['dorm_applications'] == 2
    assert second['dorm_admin_cases'] == 3


def test_checks_no_skipping_and_complete_all_stages(client,login):
    configuration(client,login)
    item = create(client,login)
    login('demo_office_academic')
    item = act(client,item,'start').get_json()['data']
    assert act(client,item,'advance',note='測試',checked_steps=[]).status_code == 400
    assert act(client,item,'complete',note='跳關',checked_steps=item['workflow'][0]['checks']).status_code == 409
    item = act(client,item,'advance',note='第一關完成',checked_steps=item['workflow'][0]['checks']).get_json()['data']
    assert item['workflow_index'] == 1 and item['status'] == '待受理' and not item['assignee']
    assert act(client,item,'complete',note='未受理直接結案').status_code == 409
    item = act(client,item,'start').get_json()['data']
    assert act(client,item,'advance',note='不能越過最後一關',checked_steps=item['workflow'][1]['checks']).status_code == 409
    response = act(client,item,'complete',note='全部步驟確認',checked_steps=item['workflow'][1]['checks'])
    assert response.status_code == 200
    assert response.get_json()['data']['status'] == '已完成'


def test_cross_office_step_routes_and_snapshot(client,login):
    config = configuration(client,login)
    workflow = deepcopy(config['workflows']['學籍證明申請'])
    workflow['steps'][1]['office'] = '會計室'
    assert client.put(BASE+'/config',json={'workflow_name':'跨處室測試','workflow':workflow}).status_code == 200
    item = create(client,login,'跨處室測試')
    login('admin','admin123')
    changed = deepcopy(workflow)
    changed['steps'][1]['office'] = '人事室'
    assert client.put(BASE+'/config',json={'workflow_name':'跨處室測試','workflow':changed}).status_code == 200
    saved = client.get(f"{BASE}/{item['id']}").get_json()['data']
    assert saved['workflow'][1]['office'] == '會計室'
    # 舊案件仍需要未來步驟的處室，不能刪除。
    without_accounting = [name for name in config['offices'] if name != '會計室']
    assert client.put(BASE+'/config',json={'offices':without_accounting}).status_code == 400
    login('staff1')
    item = act(client,item,'start').get_json()['data']
    item = act(client,item,'advance',note='轉交下一關',checked_steps=item['workflow'][0]['checks']).get_json()['data']
    assert item['office'] == '會計室'
    assert client.get(f"{BASE}/{item['id']}").status_code == 404
    login('demo_office_accounting')
    assert client.get(f"{BASE}/{item['id']}").status_code == 200
    login('demo_office_personnel')
    assert client.get(f"{BASE}/{item['id']}").status_code == 404


def test_staff_applicant_can_supplement_but_cannot_review_other_office(client,login):
    configuration(client,login)
    item = create(client,login,'教職員在職證明申請','staff1')
    assert item['is_owner'] and not item['can_act'] and item['student_id'] is None
    assert act(client,item,'start').status_code == 403
    login('demo_office_personnel')
    item = act(client,item,'start').get_json()['data']
    item = act(client,item,'supplement',requirements=['用途說明'],note='請補用途',due_date=(module.today()+timedelta(days=3)).isoformat()).get_json()['data']
    assert act(client,item,'resubmit',note='不是申請人',checked=['用途說明']).status_code == 409
    login('staff1')
    response = act(client,item,'resubmit',note='已補用途說明',checked=['用途說明'])
    assert response.status_code == 200 and response.get_json()['data']['status'] == '重新送審'
    login('demo_office_general')
    assert client.get(f"{BASE}/{item['id']}").status_code == 404


def test_add_office_and_validate_workflow_atomically(client,login):
    config = configuration(client,login)
    names = config['offices'] + ['自訂處室示範']
    assert client.put(BASE+'/config',json={'offices':names}).status_code == 200
    spec = deepcopy(config['workflows']['學籍證明申請'])
    spec['office'] = '自訂處室示範'
    spec['steps'] = [{'name':'資料確認','office':'自訂處室示範','checks':['核對資料']}]
    assert client.put(BASE+'/config',json={'workflow_name':'自訂申辦','workflow':spec}).status_code == 200
    invalid = deepcopy(spec)
    invalid['steps'][0]['office'] = '不存在的處室'
    assert client.put(BASE+'/config',json={'members':{},'workflow_name':'無效申辦','workflow':invalid}).status_code == 400
    data = client.get(BASE+'/config').get_json()
    assert 'staff1' in data['members'] and '無效申辦' not in data['workflows']
    login('staff1')
    assert client.put(BASE+'/config',json={'offices':names+['不應新增']}).status_code == 403


def test_demo_seed_all_units_states_and_idempotence(client,login,capsys):
    import seed_admin_offices_demo
    first = seed_admin_offices_demo.main()
    assert first['offices'] == 31 and first['demo_accounts'] == 31
    assert first['demo_cases'] == 102 and first['overdue'] == 1
    assert all(n > 0 for n in first['states'].values())
    # 模擬使用者已操作示範，重跑不可把結果重設。
    sample = module.cases()[0]
    sample['title'] += ''
    revision = sample['revision']
    second = seed_admin_offices_demo.main()
    assert second['new_cases'] == 0 and second['demo_cases'] == 102
    assert module.cases()[0]['revision'] == revision
