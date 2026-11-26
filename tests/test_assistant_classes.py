"""科助只能看本科班級，並以年級分開畢業事項。"""


def test_assistant_class_overview(client, login, monkeypatch):
    login('demo_assistant_cs')
    from campus import assistant_classes, graduation_roster
    from campus.common import all_students
    students = all_students() + [{'student_id': 'FIRST_YEAR_TEST', 'full_name': '一年級測試生',
                                  'class_name': '資管一忠', 'admission_year': 115, 'dept_id': 'CS'}]
    monkeypatch.setattr(assistant_classes, 'all_students', lambda: students)
    monkeypatch.setattr(graduation_roster, 'all_students', lambda: students)
    response = client.get('/api/campus/assistant/classes')
    assert response.status_code == 200
    body = response.get_json()
    assert body['total_students'] == len(body['data'])
    assert body['classes']
    assert all(row['class_name'].startswith('資管') for row in body['data'])
    assert all('failed_courses' in row and 'attendance' in row for row in body['data'])
    first_year = next(row for row in body['data'] if row['year'] == 1)
    roster = client.get('/api/campus/assistant/graduation-roster').get_json()['data']
    first_progress = next(row for row in roster if row['student_id'] == first_year['student_id'])
    assert first_progress['project_status'] == '尚未適用'
    assert first_progress['internship_status'] == '尚未適用'
    assert '專題未完成' not in first_progress['missing']
    one_class = body['classes'][0]['class_name']
    filtered = client.get('/api/campus/assistant/classes', query_string={'class_name': one_class})
    assert filtered.status_code == 200
    assert all(row['class_name'] == one_class for row in filtered.get_json()['data'])
    assert client.get('/api/campus/assistant/classes', query_string={'class_name': '護理一忠'}).status_code == 403


def test_student_cannot_read_department_overview(client, login):
    login('student1')
    assert client.get('/api/campus/assistant/classes').status_code == 403
