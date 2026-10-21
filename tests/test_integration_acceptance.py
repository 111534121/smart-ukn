from attendance.policy import summarize_attendance


def test_exam_ban_boundaries_and_nonabsence_types():
    for count, expected in [(3, 'ok'), (4, 'warning'), (5, 'warning'), (6, 'banned')]:
        rows = [{'course_name': '測試課程', 'type': '曠課'} for _ in range(count)]
        rows += [{'course_name': '測試課程', 'type': kind} for kind in ['遲到'] for _ in range(10)]
        result = summarize_attendance(rows, {'測試課程': 3})
        assert result['overall_level'] == expected
        assert result['courses'][0]['absent_hours'] == count * 3
        assert result['courses'][0]['exam_ban_threshold_hours'] == 18


def test_class_attendance_integrates_leave_review(client, login):
    login('student1')
    lid = client.post('/api/student/leave-requests', json={'leave_type': '事假', 'start_date': '2026-10-20', 'end_date': '2026-10-20', 'periods': '3-4', 'reason': '整合測試'}).get_json()['data']['id']
    login('teacher1')
    def mine():
        return next(s for s in client.get('/api/teacher/class-attendance').get_json()['students'] if s['student_id'] == 'S112001')
    before = mine()
    assert any(r['id'] == lid and r['status'] == '待審核' for r in before['leaves']['items'])
    assert client.post(f'/api/leave-requests/{lid}/review', json={'status': '已核准'}).status_code == 200
    after = mine()
    assert any(r['id'] == lid and r['status'] == '已核准' and r['periods'] == '3-4' for r in after['leaves']['items'])
    # The attendance record has no period/course linkage to the leave; do not guess and erase absences.
    assert after['totals'] == before['totals']


def apply(client, semester='驗收學期'):
    return client.post('/api/campus/dorm/apply', json={'semester': semester, 'room_type': '四人房', 'commute_minutes': 60, 'emergency_phone': '0000000000', 'special_needs': '虛構測試資料'})


def test_dorm_admin_only_and_student_scope(client, login):
    login('student1'); r = apply(client); assert r.status_code == 200
    aid = r.get_json()['data']['id']
    for username in ['student1', 'student2', 'parent1', 'teacher1', 'staff1']:
        login(username)
        assert client.get('/api/campus/dorm/applications').status_code == 403
        assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'advance'}).status_code == 403
    login('student2'); assert not client.get('/api/campus/dorm/mine').get_json()['data']
    login('dorm_demo')
    assert client.get('/api/campus/dorm/applications').status_code == 200
    assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'arbitrary'}).status_code == 400
    assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'reject'}).status_code == 400
    assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'reject', 'note': '驗收退回原因'}).status_code == 200
    assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'advance'}).status_code == 409
    login('student1'); item = client.get('/api/campus/dorm/mine').get_json()['data'][0]
    assert item['status'] == '未通過' and item['history'][-1]['reviewed_by'] == 'dorm_demo'


def test_dorm_progress_complete_and_duplicate_block(client, login):
    login('student1'); aid = apply(client).get_json()['data']['id']
    assert apply(client).status_code == 409
    login('admin', 'admin123')
    for stage in range(1, 6):
        r = client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'advance', 'note': '驗收推進', 'bed': 'DEMO-01'})
        assert r.status_code == 200 and r.get_json()['data']['stage'] == stage
    assert r.get_json()['data']['status'] == '已完成'
    assert len(r.get_json()['data']['history']) == 6
    assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'advance'}).status_code == 409


def test_dorm_mysql_review_compare_and_swap(monkeypatch):
    from campus import dorm_store
    from campus.common import deps
    monkeypatch.setattr(dorm_store, 'use_db', lambda: True)
    writes = []
    def execute(sql, params):
        writes.append((sql, params)); return {'rowcount': 0}
    monkeypatch.setattr(deps, 'db_execute', execute)
    assert dorm_store.save_review({'id': 1, 'stage': 2, 'status': '進行中', 'bed': '', 'note': '', 'history': []}, 1) is False
    assert 'AND stage=%s AND status=%s' in writes[0][0]


def test_dorm_requires_bed_before_allocation(client, login):
    login('student1'); aid = apply(client).get_json()['data']['id']
    login('dorm_demo')
    for _ in range(2):
        assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'advance'}).status_code == 200
    assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'advance'}).status_code == 400
    assert client.post(f'/api/campus/dorm/applications/{aid}', json={'action': 'advance', 'bed': 'DEMO-01'}).status_code == 200
