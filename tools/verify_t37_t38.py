"""Real MySQL acceptance against an isolated copy, never business database writes."""
import copy
from datetime import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import app as application
from campus.common import store
from applications_conduct_schema import upgrade

def main():
    config = dict(application.DB_CONFIG)
    assert config['host'] in ('localhost', '127.0.0.1')
    source = application.get_db_connection()
    assert source is not None, 'MySQL offline'
    stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    name = 'smart_ukn_t37t38_' + stamp
    assert re.fullmatch(r'smart_ukn_t37t38_\d{8}_\d{6}', name)
    out = ROOT / 'db_backups' / name
    out.mkdir(parents=True, exist_ok=False)
    env = dict(os.environ, MYSQL_PWD=config['password'])
    common = ['--no-defaults', '--host=' + config['host'], '--port=' + str(config['port']), '--user=' + config['user'], '--default-character-set=utf8mb4']
    dump = subprocess.check_output([r'C:\xampp\mysql\bin\mysqldump.exe', *common, '--single-transaction', '--hex-blob', config['database']], env=env)
    assert not re.search(rb'(?im)^\s*(USE\s|CREATE\s+DATABASE)', dump)
    (out / 'source_backup.sql').write_bytes(dump)
    with source.cursor() as cursor:
        cursor.execute('CREATE DATABASE `' + name + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    source.close()
    subprocess.run([r'C:\xampp\mysql\bin\mysql.exe', *common, name], input=dump, env=env, check=True)
    application.DB_CONFIG = {**config, 'database': name}
    application._db_unavailable_until = 0
    connection = application.get_db_connection()
    assert connection is not None
    added = upgrade(connection)
    assert upgrade(connection) == []
    from integration_schema import upgrade as upgrade_integration
    upgrade_integration(connection, store.path)
    connection.close()
    store.data = copy.deepcopy(store.data)
    store.path = str(out / 'campus_store.json')
    store.data['admin_offices'] = {'dorm_demo': '學生事務處／住宿管理', 'staff1': '教務處'}
    store.save()
    class NoMail:
        mode = 'test'
        def send(self, *args):
            return True
    application.get_mailer = lambda: NoMail()
    application.app.config['TESTING'] = True
    client = application.app.test_client()
    checks = []
    def check(label, condition):
        assert condition, label
        checks.append(label)
    def login(user):
        check('login ' + user, client.post('/api/auth/login', json={'username': user, 'password': 'admin123' if user == 'admin' else '123456'}).status_code == 200)
    def query(sql, args=()):
        return application.fetch_db_rows(sql, args)
    check('isolated DB selected', query('SELECT DATABASE() AS name')[0]['name'] == name)
    login('student1')
    payload = {'semester': 'QA-' + stamp, 'room_type': '四人房', 'commute_minutes': 60, 'emergency_phone': '0900000000'}
    response = client.post('/api/campus/dorm/apply', json=payload)
    check('student dorm application', response.status_code == 200)
    first = response.get_json()['data']['id']
    login('student2')
    second = client.post('/api/campus/dorm/apply', json=payload).get_json()['data']['id']
    login('dorm_demo')
    for item in (first, second):
        for _ in range(2):
            check('advance dorm stage', client.post(f'/api/campus/dorm/applications/{item}', json={'action': 'advance'}).status_code == 200)
    check('allocation needs bed', client.post(f'/api/campus/dorm/applications/{first}', json={'action': 'advance'}).status_code == 400)
    check('bed allocated', client.post(f'/api/campus/dorm/applications/{first}', json={'action': 'advance', 'bed': 'QA-S305-2'}).status_code == 200)
    check('duplicate bed denied case-insensitively', client.post(f'/api/campus/dorm/applications/{second}', json={'action': 'advance', 'bed': 'qa-s305-2'}).status_code == 409)
    check('mysql bed persisted', query('SELECT bed FROM dorm_applications WHERE id=%s', (first,))[0]['bed'] == 'QA-S305-2')
    for user in ('teacher1', 'student1', 'parent1'):
        login(user)
        check(user + ' cannot review dorm', client.post(f'/api/campus/dorm/applications/{first}', json={'action': 'advance'}).status_code == 403)
    login('student1')
    fields = {'phone': '0900000000', 'semester': '115-1', 'course_code': 'QA001', 'course_name': 'QA測試課程', 'credits': '3', 'teacher': '測試老師', 'reason': '隔離驗收'}
    # Existing test data is retained; remove only this cloned student's old applications.
    application.db_execute('DELETE FROM online_applications WHERE student_id=%s', ('S112001',))
    response = client.post('/api/applications', json={'item_id': 1, 'fields': fields})
    check('online application persisted', response.status_code == 201)
    aid = response.get_json()['data']['id']
    check('application uses MySQL', bool(query('SELECT id FROM online_applications WHERE id=%s', (aid,))))
    login('teacher1')
    check('teacher sees application', any(item['id'] == aid for item in client.get('/api/applications/review').get_json()['data']))
    for _ in range(3):
        check('teacher signs own class', client.post(f'/api/applications/{aid}/review', json={'action': 'approve'}).status_code == 200)
    check('teacher cannot sign staff stage', client.post(f'/api/applications/{aid}/review', json={'action': 'approve'}).status_code == 404)
    login('staff1')
    check('staff completes application', client.post(f'/api/applications/{aid}/review', json={'action': 'approve'}).get_json()['data']['status'] == '已完成')
    check('mysql final status persisted', query('SELECT status FROM online_applications WHERE id=%s', (aid,))[0]['status'] == '已完成')
    login('teacher1')
    check('teacher own-class conduct', client.get('/api/conduct/students/S112001').status_code == 200)
    check('teacher cross-class denied', client.get('/api/conduct/students/S112004').status_code == 403)
    check('conduct evaluation write', client.put('/api/conduct/evaluations/S112001/115-1', json={'advisor_adjust': 2, 'comment': 'QA隔離驗收'}).status_code == 200)
    check('conduct evaluation persisted', float(query('SELECT advisor_adjust FROM conduct_evaluations WHERE student_id=%s AND semester=%s', ('S112001','115-1'))[0]['advisor_adjust']) == 2)
    login('student1')
    check('student cannot query others conduct', client.get('/api/conduct/students/S112004').status_code == 403)
    login('staff1')
    check('staff conduct query', client.get('/api/conduct/students/S112001').status_code == 200)
    doc = client.get('/forms/course_withdraw_form?download=doc&example=1')
    check('Word download status', doc.status_code == 200 and doc.mimetype == 'application/msword')
    (out / 'course_withdraw_example.doc').write_bytes(doc.data)
    report = {'database': name, 'source_database_unchanged': config['database'], 'tables_added_in_clone': added,
              'passed': len(checks), 'checks': checks, 'private_dir': str(out.relative_to(ROOT)),
              'external_notifications_sent': False, 'scope': 'isolated MySQL API flows; UI/Word checked separately'}
    public = ROOT / 'evidence/t37t38_20261022'
    public.mkdir(parents=True, exist_ok=True)
    (public / 'mysql_acceptance.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))

if __name__ == '__main__':
    main()
