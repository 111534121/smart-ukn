"""老師 / 行政人員的待辦通知 (右上角鈴鐺)：有事要處理時出現，處理完自動消失"""

LEAVE = {"leave_type": "病假", "start_date": "2026-10-20", "end_date": "2026-10-20", "periods": "1-2", "reason": "ALERT-看醫生"}


def alerts(client, login, user):
    login(user)
    return client.get("/api/staff/alerts").get_json()["data"]


def test_homeroom_teacher_sees_pending_leave_until_reviewed(client, login):
    login("student1")
    leave_id = client.post("/api/student/leave-requests", json=LEAVE).get_json()["data"]["id"]
    hit = [a for a in alerts(client, login, "teacher1") if a["key"] == f"leave-{leave_id}"]
    assert hit and hit[0]["type"] == "請假" and "王小明" in hit[0]["title"]
    assert client.post(f"/api/leave-requests/{leave_id}/review", json={"status": "已核准"}).status_code == 200
    assert all(a["key"] != f"leave-{leave_id}" for a in alerts(client, login, "teacher1"))  # 審完就消失


def test_homeroom_teacher_sees_academic_warnings_of_own_class(client, login):
    warn = [a for a in alerts(client, login, "teacher1") if a["type"] == "預警"]
    assert any("王小明" in a["title"] for a in warn)          # 資管五忠、學業很嚴重
    assert all("陳冠宇" not in a["title"] for a in warn)       # 別班的學生不會出現


def test_warning_hidden_when_student_withdraws_advisor_consent(client, login):
    login("student1")
    client.post("/api/student/privacy-consent", json={"parent_alert_consent": 1, "advisor_alert_consent": 0})
    assert all("王小明" not in a["title"] for a in alerts(client, login, "teacher1") if a["type"] == "預警")
    login("student1")
    client.post("/api/student/privacy-consent", json={"parent_alert_consent": 1, "advisor_alert_consent": 1})  # 還原


def test_only_staff_can_read_alerts(client, login):
    assert client.get("/api/staff/alerts").status_code == 401
    login("student1")
    assert client.get("/api/staff/alerts").status_code == 403
    login("staff1")
    assert client.get("/api/staff/alerts").status_code == 200


def test_dorm_account_has_only_dorm_work_and_no_academic_review(client, login):
    login('student1')
    client.post('/api/student/leave-requests', json=LEAVE)
    login('dorm_demo')
    kinds = {item['type'] for item in client.get('/api/staff/alerts').get_json()['data']}
    assert kinds <= {'宿舍', '行政案件'}
    assert client.get('/api/leave-requests/review').status_code == 403
    assert client.get('/api/campus/certs/review').status_code == 403
    assert client.get('/api/campus/rooms/bookings?scope=all').status_code == 403
    assert client.get('/api/campus/dorm/applications').status_code == 200
    assert client.get('/api/auth/me').get_json()['user']['can_manage_dorm']


def test_dorm_demo_is_available_from_login_page(client):
    assert b'dorm_demo' in client.get('/login').data
    response = client.post('/api/auth/login', json={'username':'dorm_demo','password':'123456'})
    assert response.status_code == 200
    assert response.get_json()['user']['workbench_url'] == '/'
    assert response.get_json()['user']['role'] == '住宿管理員'


def test_review_work_is_limited_to_assigned_units(client, login):
    login('admin', 'admin123')
    config = client.get('/api/campus/admin-cases/config').get_json()
    members = dict(config['members'])
    members.update({'demo_group_guidance':'學生事務處／生活輔導組',
                    'demo_group_registration':'教務處／註冊組',
                    'demo_group_affairs':'總務處／事務組'})
    assert client.put('/api/campus/admin-cases/config', json={'members': members}).status_code == 200
    for username, allowed in [('demo_group_guidance', 'leave'),
                              ('demo_group_registration', 'certificates'),
                              ('demo_group_affairs', 'room_bookings')]:
        login(username)
        checks = {'leave': '/api/leave-requests/review',
                  'certificates': '/api/campus/certs/review',
                  'room_bookings': '/api/campus/rooms/bookings?scope=all'}
        for task, path in checks.items():
            assert (client.get(path).status_code == 200) == (task == allowed)
        me = client.get('/api/auth/me').get_json()['user']
        assert me['review_tasks'] == [allowed]
        assert me['office'] == members[username]


def test_dorm_role_uses_the_same_dorm_permissions(client, login):
    login('dorm_demo')
    me = client.get('/api/auth/me').get_json()['user']
    assert me['role'] == '住宿管理員'
    assert me['can_manage_dorm'] and me['office'] == '學生事務處／住宿管理'
    assert client.get('/api/staff/alerts').status_code == 200
    assert client.get('/api/campus/dorm/applications').status_code == 200
    assert client.get('/api/leave-requests/review').status_code == 403
    assert client.get('/api/campus/certs/review').status_code == 403


def test_assistant_does_not_receive_leave_alerts(client, login):
    login('student1')
    client.post('/api/student/leave-requests', json=LEAVE)
    login('demo_assistant_cs')
    assert all(item['type'] != '請假' for item in client.get('/api/staff/alerts').get_json()['data'])


def test_certificate_alert_goes_to_registration_only(client, login, monkeypatch):
    from campus import certificates
    monkeypatch.setattr(certificates, 'submissions', lambda: [{
        'id': 31, 'status': '待審核', 'student_id': 'S112001', 'student_name': '王小明',
        'kind': '證照', 'name': '測試證照', 'class_name': '資管五忠', 'created_at': '2026-10-23 09:00:00'}])
    login('admin', 'admin123')
    members = dict(client.get('/api/campus/admin-cases/config').get_json()['members'])
    members.update({'demo_group_registration': '教務處／註冊組',
                    'demo_group_guidance': '學生事務處／生活輔導組'})
    assert client.put('/api/campus/admin-cases/config', json={'members': members}).status_code == 200
    login('demo_group_registration')
    registration = client.get('/api/staff/alerts').get_json()['data']
    assert any(item['key'] == 'cert-31' for item in registration)
    login('demo_group_guidance')
    guidance = client.get('/api/staff/alerts').get_json()['data']
    assert all(item['key'] != 'cert-31' for item in guidance)
