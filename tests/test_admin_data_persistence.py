# -*- coding: utf-8 -*-
"""Verification of administrative functions: data persistence and operational correctness."""
import pytest
from app import app
import admin_db
from werkzeug.security import check_password_hash

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_admin_user_crud_and_persistence(client):
    """Test admin creating, querying, updating, and deleting a user, ensuring DB persistence."""
    with client.session_transaction() as sess:
        sess['user_id'] = 5
        sess['username'] = 'admin'
        sess['role'] = '系統管理員'
        sess['full_name'] = '系統管理員'

    test_username = 'test_persistence_user'

    # Clean up before test if exists
    admin_db.execute_db("DELETE FROM audit_logs WHERE record_id = %s", (test_username,))
    admin_db.execute_db("DELETE FROM users WHERE username = %s", (test_username,))

    # 1. Create User via POST /api/admin/users
    create_payload = {
        'username': test_username,
        'role': '教職員',
        'full_name': '測試持久化人員',
        'office': '研發處',
        'permissions': '查看,建立',
        'is_active': 1,
        'password': 'initialPassword123'
    }
    resp = client.post('/api/admin/users', json=create_payload)
    assert resp.status_code == 201, f"Create user failed: {resp.get_json()}"
    data = resp.get_json()
    assert data.get('status') == 'success'
    user_id = data.get('user_id')
    assert user_id is not None

    # 2. Verify User exists in physical database
    db_users = admin_db.query_db("SELECT * FROM users WHERE username = %s", (test_username,))
    assert len(db_users) == 1, "User not found in DB!"
    user_record = db_users[0]
    assert user_record['username'] == test_username
    assert user_record['role'] == '教職員'
    assert user_record['full_name'] == '測試持久化人員'
    assert user_record['office'] == '研發處'
    assert user_record['default_password'] == 'initialPassword123'
    assert check_password_hash(user_record['password_hash'], 'initialPassword123') is True

    # 3. Verify audit log entry
    logs = admin_db.query_db("SELECT * FROM audit_logs WHERE table_name = 'users' AND record_id = %s", (str(user_id),))
    assert len(logs) >= 1, "Audit log not recorded for user creation!"
    assert logs[0]['action'] == '新增'

    # 4. Query Users List and Credential Info via Admin API
    list_resp = client.get('/api/admin/users')
    assert list_resp.status_code == 200
    users_list = list_resp.get_json().get('data', [])
    found = any(u['username'] == test_username and u.get('default_password') == 'initialPassword123' for u in users_list)
    assert found, "Created user not found in admin user list API!"

    cred_resp = client.get(f'/api/admin/users/{user_id}/credential-info')
    assert cred_resp.status_code == 200
    assert cred_resp.get_json().get('data', {}).get('default_password') == 'initialPassword123'

    # 5. Update User via PUT /api/admin/users/<id>
    update_payload = {
        'role': '科助',
        'full_name': '測試持久化人員(更新)',
        'office': '資訊管理科',
        'permissions': '查看,建立,修改',
        'is_active': 1
    }
    upd_resp = client.put(f'/api/admin/users/{user_id}', json=update_payload)
    assert upd_resp.status_code == 200
    assert upd_resp.get_json().get('status') == 'success'

    # Verify updated in DB
    db_user_upd = admin_db.query_db("SELECT * FROM users WHERE user_id = %s", (user_id,))
    assert len(db_user_upd) == 1
    assert db_user_upd[0]['role'] == '科助'
    assert db_user_upd[0]['full_name'] == '測試持久化人員(更新)'
    assert db_user_upd[0]['office'] == '資訊管理科'

    # 6. Reset Password via Admin API
    reset_resp = client.post(f'/api/admin/users/{user_id}/reset-password', json={'new_password': 'newpassword999'})
    assert reset_resp.status_code == 200
    assert reset_resp.get_json().get('status') == 'success'

    # Verify password and default_password in DB
    db_user_reset = admin_db.query_db("SELECT password_hash, default_password FROM users WHERE user_id = %s", (user_id,))
    assert check_password_hash(db_user_reset[0]['password_hash'], 'newpassword999') is True
    assert db_user_reset[0]['default_password'] == 'newpassword999'

    # 7. Delete User (Clean up)
    del_resp = client.delete(f'/api/admin/users/{user_id}')
    assert del_resp.status_code == 200
    assert del_resp.get_json().get('status') == 'success'

    # Verify deleted in DB
    db_user_del = admin_db.query_db("SELECT * FROM users WHERE user_id = %s", (user_id,))
    assert len(db_user_del) == 0

    # Clean up audit logs
    admin_db.execute_db("DELETE FROM audit_logs WHERE record_id = %s", (str(user_id),))

def test_admin_course_and_department_persistence(client):
    """Test admin adding and deleting departments and courses in DB."""
    with client.session_transaction() as sess:
        sess['user_id'] = 5
        sess['username'] = 'admin'
        sess['role'] = '系統管理員'
        sess['full_name'] = '系統管理員'

    test_dept_id = 'TESTD'
    test_course_id = 'TESTC01'

    # Clean up before test
    admin_db.execute_db("DELETE FROM course_map WHERE course_id = %s", (test_course_id,))
    admin_db.execute_db("DELETE FROM departments WHERE dept_id = %s", (test_dept_id,))

    # 1. Create Department
    dept_resp = client.post('/api/admin/departments', json={
        'dept_id': test_dept_id,
        'dept_name': '測試科系',
        'college_name': '民生學院'
    })
    assert dept_resp.status_code == 201

    # Verify department in DB
    db_dept = admin_db.query_db("SELECT * FROM departments WHERE dept_id = %s", (test_dept_id,))
    assert len(db_dept) == 1
    assert db_dept[0]['dept_name'] == '測試科系'
    assert db_dept[0]['college_name'] == '民生學院'

    # 2. Create Course in course_map
    course_resp = client.post('/api/admin/course-map', json={
        'course_id': test_course_id,
        'course_name': '持久化測試課程',
        'dept_id': test_dept_id,
        'credits': 3,
        'semester_hours': 3,
        'course_type': '必修',
        'semester_suggest': '大一上'
    })
    assert course_resp.status_code == 201

    # Verify course in DB
    db_course = admin_db.query_db("SELECT * FROM course_map WHERE course_id = %s", (test_course_id,))
    assert len(db_course) == 1
    assert db_course[0]['course_name'] == '持久化測試課程'

    # 3. Clean up (Delete course then department)
    del_course = client.delete(f'/api/admin/course-map/{test_course_id}')
    assert del_course.status_code == 200

    del_dept = client.delete(f'/api/admin/departments/{test_dept_id}')
    assert del_dept.status_code == 200

    assert len(admin_db.query_db("SELECT * FROM course_map WHERE course_id = %s", (test_course_id,))) == 0
    assert len(admin_db.query_db("SELECT * FROM departments WHERE dept_id = %s", (test_dept_id,))) == 0
