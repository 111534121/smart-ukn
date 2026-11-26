import copy
from types import SimpleNamespace
import pytest
import app as app_module
from campus import courses_ext
from campus.common import deps


def test_recommend_actual_schedule_and_self_study(client, login):
    login('student1')
    d=client.get('/api/campus/course-plan/recommendations').get_json()
    cs=next(c for c in d['data'] if c['course_id']=='CS102')
    a,b=cs['options']
    assert not a['available'] and any(i['type']=='schedule_conflict' for i in a['checks'])
    assert b['available'] and any(i['type']=='self_study_exception' for i in b['checks'])
    response=client.post('/api/campus/course-plan/check',json={'offering_ids':['CS102-A'], 'student_id':'S112002','allow_retake_overlap':True}).get_json()
    assert any(i['type']=='schedule_conflict' for i in response['issues'])
    assert response['verdict']=='需要調整'
    d=client.post('/api/campus/course-plan/check',json={'offering_ids':['CS102-B']}).get_json()
    assert any(i['type']=='self_study_exception' for i in d['issues'])
    assert not any(i['type']=='schedule_conflict' for i in d['issues'])


def test_exception_requires_server_approval(client,login,monkeypatch):
    login('student1')
    rows=[{'id':90,'weekday':4,'period_start':6,'period_end':8,'course_name':'自習','activity_type':'self_study','allow_retake_overlap':False}]
    monkeypatch.setattr(deps,'get_dashboard_source',lambda:SimpleNamespace(name='test',list_schedule=lambda *a:rows))
    d=client.post('/api/campus/course-plan/check',json={'offering_ids':['CS102-B'],'allow_retake_overlap':True}).get_json()
    assert any(i['type']=='schedule_conflict' for i in d['issues'])
    monkeypatch.setattr(deps,'get_dashboard_source',lambda:(_ for _ in ()).throw(RuntimeError()))
    assert client.get('/api/campus/course-plan/recommendations').status_code==503
    assert client.post('/api/campus/course-plan/check',json={'offering_ids':['CS102-B']}).status_code==503


@pytest.mark.parametrize('username',['system_admin','content_admin'])
def test_management_role_separation(client,login,monkeypatch,username):
    monkeypatch.setattr(app_module,'DEMO_KNOWLEDGE_BASE',copy.deepcopy(app_module.DEMO_KNOWLEDGE_BASE))
    monkeypatch.setattr(app_module,'DEMO_AUDIT_LOGS',[])
    login(username,'admin123')
    response = client.get('/management')
    assert response.status_code == 302 and response.headers['Location'] == '/'
    row=client.get('/api/rules').get_json()['data'][0]
    r=client.put('/api/rules/'+str(row['id']),json={'content':'隔離驗收內容'})
    if username=='content_admin':
        assert r.status_code==200,r.get_json()
        assert client.get('/api/rules').get_json()['data'][0]['content']=='隔離驗收內容'
        assert app_module.DEMO_AUDIT_LOGS[-1]['changed_by_role']=='內容管理員'
        assert client.get('/api/admin/audit-logs').status_code==403
        assert client.post('/api/admin/self-check').status_code==403
    else:
        assert r.status_code==403
        assert client.get('/api/admin/audit-logs').status_code==200
    assert client.get('/api/teacher/student-profile?student_id=S112001').status_code==403
    assert client.post('/api/leave-requests/1/review',json={'action':'approve'}).status_code==403
    assert client.get('/api/admin/knowledge-documents').status_code==(200 if username=='content_admin' else 403)


def test_non_admin_cannot_open_management(client,login):
    assert client.get('/management').status_code==401
    login('student1')
    assert client.get('/management').status_code==403
