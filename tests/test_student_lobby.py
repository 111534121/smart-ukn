"""Mobile lobby: actual day semantics, ownership, source labels and partial errors."""
from datetime import datetime
from campus import student_lobby as lobby
from campus.common import store


def test_only_student_own_data_and_today_after_last_class(client,login,monkeypatch):
    assert client.get('/api/student/lobby').status_code==401
    login('teacher1')
    assert client.get('/api/student/lobby').status_code==403
    login('student1')
    monkeypatch.setattr(lobby,'local_now',lambda:datetime(2026,10,29,20,0))
    store.data['admin_cases']=[{'id':1,'applicant_username':'student1','student_id':'S112001','kind':'成績單申請','status':'待補件','office':'教務處','due_date':'2026-10-29'}, {'id':2,'applicant_username':'student2','student_id':'S112002','kind':'別人的機密申請','status':'待補件','office':'教務處','due_date':'2026-10-29'}, {'id':3,'applicant_username':'student1','student_id':'S112001','kind':'設備報修','status':'已完成','office':'總務處','due_date':'2026-10-29'}]
    r=client.get('/api/student/lobby?student_id=S112002')
    assert r.status_code==200 and 'no-store' in r.headers['Cache-Control']
    d=r.get_json()['data']
    assert d['date']=='2026-10-29' and d['class_name']=='資管五忠'
    assert len(d['schedule'])==2 and all(row['status']=='done' for row in d['schedule'])
    assert '自習' in d['schedule'][1]['course_name']
    assert d['schedule'][0]['course_name']=='物件導向程式設計'
    assert '別人的機密申請' not in r.get_data(as_text=True)
    assert any(t.get('case_id')==1 for t in d['tasks'])
    assert not any(t.get('case_id') in (2,3) for t in d['tasks'])
    assert d['demo_transit']['mode']=='demo'
    assert '非真實' in d['demo_transit']['notice']


def test_weekend_no_classes_and_no_invented_tasks(client,login,monkeypatch):
    login('student1')
    monkeypatch.setattr(lobby,'local_now',lambda:datetime(2026,11,1,10,0))
    data=client.get('/api/student/lobby').get_json()['data']
    assert data['schedule']==[]
    assert data['tasks']==[]


def test_source_failure_keeps_case_tasks(client,login,monkeypatch):
    login('student1')
    def broken():raise OSError('offline')
    monkeypatch.setattr(lobby.deps,'get_dashboard_source',broken)
    store.data['admin_cases']=[{'id':4,'applicant_username':'student1','student_id':'S112001','kind':'請假申請','status':'待補件','office':'學生事務處','due_date':'2026-10-20'}]
    data=client.get('/api/student/lobby').get_json()['data']
    assert data['errors']['schedule']
    assert data['tasks'][0]['case_id']==4
    assert data['demo_transit'] is None


def test_project_tasks_scoped_and_waiting_review_not_student_action(client,login):
    login('student1')
    store.data['graduation_project_teams']=[{'id':1,'title':'自己的專題','member_ids':['S112001'],'teacher_username':'teacher1'}, {'id':2,'title':'別人的專題','member_ids':['S112002'],'teacher_username':None}]
    store.data['graduation_project_submissions']=[{'team_id':1,'stage':'提案','status':'待審核'}]
    d=client.get('/api/student/lobby').get_json()['data']
    assert not any(t['type']=='專題' for t in d['tasks'])
    store.data['graduation_project_submissions'][0]['status']='退回修改'
    d=client.get('/api/student/lobby').get_json()['data']
    tasks=[t for t in d['tasks'] if t['type']=='專題']
    assert len(tasks)==1 and tasks[0]['title']=='專題：提案修正後重送'
    assert tasks[0]['detail']=='自己的專題' and tasks[0]['due_date'] is None
