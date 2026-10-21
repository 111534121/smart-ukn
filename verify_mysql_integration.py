"""使用獨立 MySQL 驗收資料庫驗證真實建表／寫入；不寫入原業務資料。"""
import json, re
from pathlib import Path
from datetime import datetime
import app as application
from campus.common import store


def main():
    source_config = dict(application.DB_CONFIG)
    source = application.get_db_connection()
    if not source: raise RuntimeError('MySQL offline')
    db_name = 'smart_ukn_verify_' + datetime.now().strftime('%Y%m%d_%H%M%S')
    cursor = source.cursor()
    cursor.execute('SHOW TABLES'); tables = [r[0] for r in cursor.fetchall()]
    schemas = []
    for table in tables:
        if not re.fullmatch(r'[A-Za-z0-9_]+', table): raise RuntimeError('Invalid table name')
        cursor.execute(f'SHOW CREATE TABLE `{table}`'); schemas.append(cursor.fetchone()[1])
    cursor.execute(f'CREATE DATABASE `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    cursor.execute(f'USE `{db_name}`'); cursor.execute('SET FOREIGN_KEY_CHECKS=0')
    for ddl in schemas:
        cursor.execute(ddl.replace('`' + source_config['database'] + '`.', '`' + db_name + '`.'))
    def seed(table, rows):
        cursor.execute(f'DESCRIBE `{table}`'); allowed = {r[0] for r in cursor.fetchall()}
        for row in rows:
            row = {k:v for k,v in row.items() if k in allowed}
            columns = list(row)
            cursor.execute(f'INSERT INTO `{table}` (' + ', '.join(f'`{c}`' for c in columns) + ') VALUES (' + ', '.join(['%s'] * len(columns)) + ')', tuple(row.values()))
    seed('departments', application.DEMO_DEPARTMENTS)
    seed('students', application.DEMO_STUDENTS)
    seed('users', application.DEMO_USERS)
    seed('course_map', application.DEMO_COURSES)
    seed('class_schedule', application.dashboard_demo.DEMO_CLASS_SCHEDULE)
    seed('attendance_records', application.DEMO_ATTENDANCE_RECORDS)
    cursor.execute('SET FOREIGN_KEY_CHECKS=1'); source.commit(); cursor.close(); source.close()
    application.DB_CONFIG = {**source_config, 'database': db_name}
    application._db_unavailable_until = 0
    out = Path('evidence/integration_20261020'); out.mkdir(exist_ok=True)
    store.data = {}; store.path = str(Path('db_backups') / db_name / 'campus_store.json')
    class SilentMailer:
        mode = 'test'
        def send(self, *args): return True
    application.get_mailer = lambda: SilentMailer()
    application.app.config['TESTING'] = True
    client = application.app.test_client()
    checks = []
    def check(label, condition):
        if not condition: raise AssertionError(label)
        checks.append(label)
    def login(username, password='123456'):
        check('登入 ' + username, client.post('/api/auth/login', json={'username': username, 'password': password}).status_code == 200)
    def sql(statement, params=()): return application.fetch_db_rows(statement, params)
    check('獨立資料庫連線', sql('SELECT DATABASE() AS db')[0]['db'] == db_name)
    check('出缺勤使用 MySQL', application.get_attendance_source().name == 'mysql')
    check('請假使用 MySQL', application.get_dashboard_source().name == 'mysql')
    login('teacher1')
    data = client.get('/api/teacher/class-attendance').get_json()
    check('教師出缺勤與預警讀取', data['status'] == 'success' and any(s['level'] in ('warning','banned') for s in data['students']))
    check('教師不能查別班', client.get('/api/teacher/class-attendance?class_name=資管四孝').status_code == 403)
    source_attendance = application.get_attendance_source()
    for _ in range(2):
        source_attendance.add_record('S112001', '2026-10-20', '程式設計(一)', '曠課')
    updated = client.get('/api/teacher/class-attendance').get_json()['students']
    check('MySQL 新增點名後達扣考門檻', next(r for r in updated if r['student_id'] == 'S112001')['level'] == 'banned')
    check('點名新增紀錄確實保存', len(sql("SELECT id FROM attendance_records WHERE student_id='S112001' AND course_name='程式設計(一)' AND type='曠課'")) == 6)

    login('student1')
    leave = client.post('/api/student/leave-requests', json={'leave_type':'事假','start_date':'2026-10-20','end_date':'2026-10-20','periods':'3-4','reason':'獨立資料庫驗收'})
    check('學生假單送出', leave.status_code == 201); lid = leave.get_json()['data']['id']
    login('teacher1')
    check('老師讀到待審假單', any(r['id'] == lid for r in client.get('/api/leave-requests/review').get_json()['data']))
    check('假單核准', client.post(f'/api/leave-requests/{lid}/review',json={'status':'已核准'}).status_code == 200)
    rows = client.get('/api/teacher/class-attendance').get_json()['students']
    check('出缺勤表串接核准假單', any(r['id'] == lid and r['status'] == '已核准' for s in rows if s['student_id'] == 'S112001' for r in s['leaves']['items']))
    check('假單確實寫入 MySQL', sql('SELECT status FROM leave_requests WHERE id=%s',(lid,))[0]['status'] == '已核准')
    targets = client.get('/api/campus/broadcast/targets').get_json()['data']['courses']
    check('教師有授課廣播對象', bool(targets))
    broadcast = client.post('/api/campus/broadcast', json={'target_type':'課程','target':targets[0]['course_name'],'title':'【獨立驗收】課程廣播','content':'只存在驗收資料庫','reply_required':True})
    check('授課廣播成功', broadcast.status_code == 200); notice = broadcast.get_json()['data']
    check('廣播收件名單寫入 MySQL', len(sql('SELECT student_id FROM class_notice_recipients WHERE notice_id=%s',(notice['id'],))) == len(notice['recipients']))
    check('教師不能全校廣播', client.post('/api/campus/broadcast',json={'target_type':'全校','title':'越權','content':'不應建立'}).status_code == 403)
    recipient = next(u for u in application.DEMO_USERS if u['role'] == '學生' and u.get('student_id') in notice['recipients'])
    login(recipient['username'])
    check('廣播學生收件匣可讀取', any(n['id'] == notice['id'] for n in client.get('/api/campus/notices/inbox').get_json()['data']))
    check('一般帳號不能廣播', client.post('/api/campus/broadcast',json={'target_type':'全校','title':'越權','content':'不應建立'}).status_code == 403)

    login('teacher1')
    reminder = client.post('/api/campus/notices', json={'class_name':'資管五忠','recipients':['S112001'],'title':'【獨立驗收】出缺勤一鍵提醒','content':'達門檻預警，請核對正式點名與假單；非正式扣考處分。','priority':'緊急'})
    check('出缺勤一鍵提醒指定學生',reminder.status_code == 200)
    reminder_id = reminder.get_json()['data']['id']
    check('提醒僅寫入指定收件人', [r['student_id'] for r in sql('SELECT student_id FROM class_notice_recipients WHERE notice_id=%s',(reminder_id,))] == ['S112001'])
    login('student1')
    check('學生能收到出缺勤提醒', any(r['id']==reminder_id for r in client.get('/api/campus/notices/inbox').get_json()['data']))
    login('student2')
    check('其他學生不會收到個別提醒',not any(r['id']==reminder_id for r in client.get('/api/campus/notices/inbox').get_json()['data']))
    login('student1')
    dorm = client.post('/api/campus/dorm/apply',json={'semester':'驗收115-1','room_type':'四人房','commute_minutes':60,'emergency_phone':'0000000000'})
    check('宿舍送件成功', dorm.status_code == 200); aid=dorm.get_json()['data']['id']
    for user in ('student1','parent1','teacher1','staff1'):
        login(user)
        check(user + '不能讀取宿舍管理清單',client.get('/api/campus/dorm/applications').status_code == 403)
        check(user + '不能宿舍審核',client.post(f'/api/campus/dorm/applications/{aid}',json={'action':'advance'}).status_code == 403)
    login('dorm_demo')
    check('行政可查看宿舍申請',client.get('/api/campus/dorm/applications').status_code == 200)
    check('行政可審核宿舍',client.post(f'/api/campus/dorm/applications/{aid}',json={'action':'advance','note':'資格驗收'}).status_code == 200)
    stored = sql('SELECT * FROM dorm_applications WHERE id=%s',(aid,))[0]
    check('宿舍進度與審核者確實寫入 MySQL',stored['stage'] == 1 and json.loads(stored['history_json'])[-1]['reviewed_by'] == 'dorm_demo')
    check('宿舍審核有 audit_logs', bool(sql("SELECT log_id FROM audit_logs WHERE table_name='dorm_applications' AND record_id=%s",(str(aid),))))
    check('退回需原因',client.post(f'/api/campus/dorm/applications/{aid}',json={'action':'reject'}).status_code == 400)
    check('行政退回成功',client.post(f'/api/campus/dorm/applications/{aid}',json={'action':'reject','note':'測試結案'}).status_code == 200)
    check('結案不可重複推進',client.post(f'/api/campus/dorm/applications/{aid}',json={'action':'advance'}).status_code == 409)
    login('student1')
    check('學生端可查看審核結果',client.get('/api/campus/dorm/mine').get_json()['data'][0]['status'] == '未通過')
    login('parent1')
    parent_item = client.get('/api/campus/dorm/mine').get_json()['data'][0]
    check('家長端同步相同宿舍審核結果',parent_item['id']==aid and parent_item['status']=='未通過' and parent_item['note']=='測試結案')
    login('parent2')
    check('其他家長不能查看此宿舍申請',not any(r['id']==aid for r in client.get('/api/campus/dorm/mine').get_json()['data']))
    report={'database':db_name,'source_database':source_config['database'],'tables_verified':len(tables),'passed':len(checks),'checks':checks,'retained_for_review':True,'external_notifications_sent':False}
    (out/'mysql_verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'database':db_name,'passed':len(checks),'report':str(out/'mysql_verification.json')},ensure_ascii=False))


if __name__ == '__main__': main()
