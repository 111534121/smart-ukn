"""Acceptance probes for the screenshot's five requirements; does not alter live data."""
from datetime import datetime
import pytest
import app as app_module
from campus import courses_ext


def test_selected_course_conflict_duplicate_and_retake_recognition(client,login):
    login('student1')
    response=client.get('/api/campus/course-plan/offerings')
    assert response.status_code==200
    offered=response.get_json()['data']
    assert any(o['offering_id']=='CS102-A' for o in offered)
    assert any(o['offering_id']=='CS102-B' for o in offered)
    r=client.post('/api/campus/course-plan/check',json={'offering_ids':['CS201-A','CS303-A']})
    assert r.status_code==200 and any(i['type']=='time_conflict' for i in r.get_json()['issues'])
    r=client.post('/api/campus/course-plan/check',json={'offering_ids':['CS102-A','CS102-B']})
    assert any(i['type']=='duplicate_course' for i in r.get_json()['issues'])
    assert r.get_json()['retake']


def test_scholarship_sources_reason_and_expiry(client,login):
    login('student1')
    d=client.get('/api/scholarships/match?date=2026-10-01').get_json()
    results=d['eligible']+d['partial']+d['ineligible']+d['expired']
    assert results
    assert all(r.get('announcement_url') for r in results)
    assert any(r.get('missing') for r in results)
    assert all(r['days_left']<0 for r in d['expired'])
    assert all(r['days_left']>=0 for r in d['eligible'])

@pytest.mark.parametrize('decision',['已核准','已退回'])
def test_leave_student_progress_agrees_with_teacher_decision(client,login,decision):
    login('student1')
    r=client.post('/api/student/leave-requests',json={'leave_type':'事假','start_date':'2026-11-03','end_date':'2026-11-03','periods':'3-4','reason':'示範驗收'})
    assert r.status_code==201
    lid=r.get_json()['data']['id']
    login('teacher1')
    r=client.post(f'/api/leave-requests/{lid}/review',json={'status':decision,'review_note':'示範審核結果'})
    assert r.status_code==200
    login('student1')
    d=client.get('/api/student/dashboard?date=2026-11-03&time=10:00').get_json()
    item=next(r for r in d['leave']['items'] if r['id']==lid)
    assert item['status']==decision


def test_content_change_saved_and_student_cannot_modify(client,login,monkeypatch):
    from copy import deepcopy
    monkeypatch.setattr(app_module,'DEMO_KNOWLEDGE_BASE',deepcopy(app_module.DEMO_KNOWLEDGE_BASE))
    login('staff1')
    original=client.get('/api/rules').get_json()['data'][0]
    rid=original['id']
    r=client.put(f'/api/rules/{rid}',json={'content':'【隔離驗收】CMS 修改後的內容'})
    assert r.status_code==200,r.get_json()
    login('student1')
    saved=next(r for r in client.get('/api/rules').get_json()['data'] if r['id']==rid)
    assert saved['content']=='【隔離驗收】CMS 修改後的內容'
    assert client.put(f'/api/rules/{rid}',json={'content':'越權嘗試'}).status_code==403
    assert client.get('/api/admin/audit-logs').status_code==403
    unchanged=next(r for r in client.get('/api/rules').get_json()['data'] if r['id']==rid)
    assert unchanged['content']==saved['content']
