"""資管科畢業專題組隊、媒合、送審與權限。"""
from datetime import datetime, timedelta
from io import BytesIO

from campus.common import store


def make_team(client, login, account='student1', title='智慧校園專題'):
    login(account)
    result = client.post('/api/campus/graduation-projects', json={'title': title})
    assert result.status_code == 200, result.get_json()
    return result.get_json()['data']


def test_student_team_join_preferences_match_and_stage_review(client, login):
    team = make_team(client, login)
    code = team['join_code']
    assert client.post('/api/campus/graduation-projects', json={'title':'重複'}).status_code == 409
    login('student2')
    assert client.post('/api/campus/graduation-projects/join', json={'join_code':code}).status_code == 200
    assert client.put(f"/api/campus/graduation-projects/{team['id']}/preferences",
                      json={'ranking':['teacher1']}).status_code == 403
    login('student1')
    assert client.put(f"/api/campus/graduation-projects/{team['id']}/preferences",
                      json={'ranking':['teacher1','teacher1']}).status_code == 400
    assert client.put(f"/api/campus/graduation-projects/{team['id']}/preferences",
                      json={'ranking':['teacher1']}).status_code == 200
    assert client.post(f"/api/campus/graduation-projects/{team['id']}/submissions/提案",
                       data={'file':(BytesIO(b'%PDF-1.4 sample'),'proposal.pdf')}).status_code == 400
    login('demo_assistant_cs')
    matched = client.post('/api/campus/graduation-projects/match').get_json()
    assert matched['matched'] == [team['id']]
    login('student2')
    sent = client.post(f"/api/campus/graduation-projects/{team['id']}/submissions/提案",
                       data={'file':(BytesIO(b'%PDF-1.4 sample'),'proposal.pdf')})
    assert sent.status_code == 200, sent.get_json()
    sid = sent.get_json()['data']['id']
    assert client.post(f"/api/campus/graduation-projects/{team['id']}/submissions/期中",
                       data={'file':(BytesIO(b'%PDF-1.4 sample'),'mid.pdf')}).status_code == 400
    login('teacher1')
    tasks = client.get('/api/campus/graduation-projects/teacher-tasks').get_json()
    assert tasks['pending_count'] == 1
    assert client.get(f'/api/campus/graduation-projects/submissions/{sid}/file').data == b'%PDF-1.4 sample'
    assert client.post(f'/api/campus/graduation-projects/submissions/{sid}/review',
                       json={'decision':'已核准'}).status_code == 200
    login('student1')
    assert client.post(f"/api/campus/graduation-projects/{team['id']}/submissions/期中",
                       data={'file':(BytesIO(b'%PDF-1.4 mid'),'mid.pdf')}).status_code == 200


def test_scope_capacity_and_reminder_cooldown(client, login):
    team = make_team(client, login)
    with client.session_transaction() as session:
        session['student_id'] = 'S112003'
    assert client.post('/api/campus/graduation-projects/join', json={'join_code':team['join_code']}).status_code == 403
    login('demo_assistant_nur')
    assert client.get('/api/campus/graduation-projects').status_code == 403
    assert client.post('/api/campus/graduation-projects/match').status_code == 403
    login('student1')
    client.put(f"/api/campus/graduation-projects/{team['id']}/preferences", json={'ranking':['teacher1']})
    login('demo_assistant_cs')
    client.post('/api/campus/graduation-projects/match')
    login('student1')
    sid = client.post(f"/api/campus/graduation-projects/{team['id']}/submissions/提案",
                      data={'file':(BytesIO(b'%PDF-1.4 sample'),'proposal.pdf')}).get_json()['data']['id']
    login('demo_assistant_cs')
    assert client.post(f'/api/campus/graduation-projects/submissions/{sid}/remind').status_code == 200
    assert client.post(f'/api/campus/graduation-projects/submissions/{sid}/remind').status_code == 429
    assert store.data['graduation_project_reminders'][0]['channel'] == '站內'
    store.data['graduation_project_submissions'][0]['submitted_at'] = (datetime.now() - timedelta(days=8)).strftime('%Y-%m-%d %H:%M:%S')
    store.data['graduation_project_reminders'].clear()
    overdue = client.post(f'/api/campus/graduation-projects/submissions/{sid}/remind').get_json()
    assert overdue['data']['escalation_due'] is True


def test_teacher_capacity_leaves_fourth_team_unmatched(client, login):
    login('demo_assistant_cs')
    store.data['graduation_project_teams'] = [
        {'id': number, 'title': f'小組 {number}', 'join_code': str(number), 'leader_id': f'S{number}',
         'member_ids': [f'S{number}'], 'preferences': ['teacher1'],
         'teacher_username': None, 'matched_at': None, 'created_at': f'2026-10-0{number} 09:00:00'}
        for number in range(1, 5)]
    result = client.post('/api/campus/graduation-projects/match').get_json()
    assert result['matched'] == [1, 2, 3]
    assert result['unmatched'] == [4]
    assert result['capacity']['teacher1'] == 3
