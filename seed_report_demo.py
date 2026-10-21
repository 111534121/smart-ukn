"""下次報告示範：建立有明確標記的門檻、模擬假單與宿舍案件，不覆寫舊進度。"""
from datetime import datetime, timezone, timedelta
import app
from campus.common import deps

TODAY=datetime.now(timezone(timedelta(hours=8))).date().isoformat()


def main():
    if not app.is_db_available(): raise RuntimeError('MySQL offline')
    class NoExternalMail:
        mode='demo'
        def send(self,*args): return True
    app.get_mailer=lambda: NoExternalMail()
    client=app.app.test_client()
    def login(user,password='123456'):
        r=client.post('/api/auth/login',json={'username':user,'password':password})
        assert r.status_code==200,(user,r.status_code)
    def post(url,body):
        r=client.post(url,json=body)
        assert r.status_code in (200,201),r.get_json()
        return r.get_json()
    conn=app.get_db_connection()
    cases=[('DEMO_RISK_BEFORE','【示範】門檻前17小時',17,'曠課'),('DEMO_RISK_AT','【示範】達門檻18小時',18,'曠課'),('DEMO_RISK_AFTER','【示範】門檻後19小時',19,'曠課'),('DEMO_RISK_SICK','【示範】普通病假18小時',18,'病假')]
    try:
        cur=conn.cursor()
        for cid,name,hours,kind in cases:
            cur.execute('INSERT IGNORE INTO course_map (course_id,course_name,credits,prerequisite_id,is_required,dept_id,semester_suggest,description,semester_hours) VALUES (%s,%s,3,NULL,0,%s,%s,%s,54)',(cid,name,'CS','示範','【示範】假設全學期54小時，僅供扣考門檻展示。'))
        conn.commit()
    finally: conn.close()
    login('admin','admin123')
    for cid,name,hours,kind in cases:
        rows=deps.fetch_db_rows('SELECT id FROM attendance_records WHERE student_id=%s AND course_name=%s',('S112001',name))
        if not rows:
            post('/api/admin/attendance',{'student_id':'S112001','course_name':name,'date':TODAY,'type':kind,'hours':hours,'exam_policy':'ordinary'})
    for user,label,approved in [('student1','【模擬串接】待審事假展示',False),('student2','【模擬串接】已核准事假展示',True)]:
        sid='S112001' if user=='student1' else 'S112002'
        rows=deps.fetch_db_rows('SELECT id FROM leave_requests WHERE student_id=%s AND reason=%s',(sid,label))
        if rows: continue
        login(user)
        leave=post('/api/student/leave-requests',{'leave_type':'事假','start_date':TODAY,'end_date':TODAY,'periods':'3-4','reason':label})['data']
        if approved:
            login('teacher1');post(f"/api/leave-requests/{leave['id']}/review",{'status':'已核准','review_note':'【示範】假單資料讀取驗證'})
    for user,approved in [('student1',True),('student2',False)]:
        login(user)
        current=client.get('/api/campus/dorm/mine').get_json()['data']
        if any(a['semester']=='示範115-1' for a in current): continue
        item=post('/api/campus/dorm/apply',{'semester':'示範115-1','room_type':'四人房','commute_minutes':60,'emergency_phone':'0000000000','special_needs':'【示範】虛構申請，供學生與家長同步展示'})['data']
        login('dorm_demo')
        if approved:
            for _ in range(3):post(f"/api/campus/dorm/applications/{item['id']}",{'action':'advance','note':'【示範】審核與床位分配','bed':'DEMO-S305-2'})
        else:post(f"/api/campus/dorm/applications/{item['id']}",{'action':'reject','note':'【示範】文件未齊，展示不通過結果'})
    print('Saved four measured-hour scenarios, two mock leave requests and two dormitory demonstration cases; no external messages sent.')


if __name__=='__main__': main()
