"""資管科科助畢業進度表：資料整合、下載及跨科權限。"""

from campus.common import store


def test_roster_tracks_existing_data_and_exports_csv(client, login):
    store.data['graduation_project_teams'] = [
        {'id': 1, 'member_ids': ['S112001'], 'teacher_username': 'teacher1'}]
    store.data['graduation_project_submissions'] = [
        {'id': 1, 'team_id': 1, 'stage': '提案', 'status': '待審核'}]
    login('demo_assistant_cs')
    response = client.get('/api/campus/assistant/graduation-roster')
    assert response.status_code == 200, response.get_json()
    body = response.get_json()
    row = next(item for item in body['data'] if item['student_id'] == 'S112001')
    assert row['project_status'] == '待老師審核'
    assert row['credits_target'] > 0
    assert row['internship_status'] == '待確認'
    assert body['summary']['project_pending_review'] >= 1
    assert '正式' in body['rule_note']
    exported = client.get('/api/campus/assistant/graduation-roster.csv')
    assert exported.status_code == 200
    assert exported.data.startswith(b'\xef\xbb\xbf')
    assert 'S112001' in exported.data.decode('utf-8-sig')


def test_roster_restricts_other_departments_and_students(client, login):
    login('demo_assistant_nur')
    assert client.get('/api/campus/assistant/graduation-roster').status_code == 403
    assert client.get('/api/campus/assistant/graduation-roster.csv').status_code == 403
    login('student1')
    assert client.get('/api/campus/assistant/graduation-roster').status_code == 403
