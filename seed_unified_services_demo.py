"""Local-only unified service demo. Stop the preview before running; no notifications."""
import json
from datetime import timedelta
from io import BytesIO
from pathlib import Path
import app
from campus.common import store
from campus import admin_cases

TAG = '【整合示範】'
CLIENTS = {}

def client(username):
    if username not in CLIENTS:
        c = app.app.test_client()
        response = c.post('/api/auth/login', json={'username':username,'password':'admin123' if username=='admin' else '123456'})
        assert response.status_code == 200, response.get_json()
        CLIENTS[username] = c
    return CLIENTS[username]

def main():
    app.get_db_connection = lambda: None
    specs = client('student1').get('/api/campus/admin-cases/config').get_json()['workflows']
    report = []
    for kind, target_state, reviewer in [('請假申請','待受理','demo_office_student'),('成績單申請','待補件','demo_office_academic'),('場地借用','處理中','demo_office_general'),('設備報修申請','已完成','demo_office_general')]:
        title = TAG + kind + '｜共用入口流程體驗'
        existing = next((c for c in store.data.get('admin_cases',[]) if c['title']==title and c.get('applicant_username')=='student1'),None)
        if existing:
            report.append({'id':existing['id'],'kind':kind,'status':existing['status'],'preserved':True})
            continue
        spec = specs[kind]
        day = (admin_cases.today()+timedelta(days=7)).isoformat()
        values = {'假別':'事假','開始日期':day,'結束日期':day,'請假原因':'【示範】參與虛構的校園工作坊',
                  '申請用途':'【示範】獎學金資格查核','申請份數':'1','領取方式':'教務處櫃檯領取（示範）',
                  '使用場地':'【示範】資訊教室 A101','使用時段':'13:20–15:00','活動用途':'【示範】智慧官網操作練習',
                  '設備位置':'【示範】資訊教室 A101','故障情形':'【示範】投影設備無法開機，請勿真實派工'}
        r = client('student1').post('/api/campus/admin-cases',json={'kind':kind,'title':title,'detail':'虛構示範資料，僅供體驗申請、補件與下一步，不代表正式申請。','answers':{field:values[field] for field in spec['fields']}})
        assert r.status_code == 200, r.get_json()
        item = r.get_json()['data']
        # Existing demo assignments are preserved; admin is the fallback reviewer.
        actor = reviewer if store.data.get('admin_offices',{}).get(reviewer)==spec['office'] else 'admin'
        def act(action, **extra):
            nonlocal item
            r = client(actor).post(f"/api/campus/admin-cases/{item['id']}",json={'action':action,'revision':item['revision'],**extra})
            assert r.status_code == 200, r.get_json()
            item = r.get_json()['data']
        if target_state != '待受理': act('start')
        if target_state in ('待補件','已完成'):
            act('supplement',requirements=['請補充申請用途與可聯絡時段'],due_date=(admin_cases.today()+timedelta(days=4)).isoformat(),note='【示範】用途與聯絡時段需補充，請在學生端補件。')
        if target_state == '已完成':
            r = client('student1').post(f"/api/campus/admin-cases/{item['id']}",data={'action':'resubmit','revision':str(item['revision']),'checked':'請補充申請用途與可聯絡時段','note':'【示範】供課堂教學使用，週三下午可聯絡；不需真實派工。','files':(BytesIO('虛構補件內容，僅供專題驗收。'.encode()),'demo-supplement.txt')})
            assert r.status_code == 200, r.get_json()
            item = r.get_json()['data']
            for index, step in enumerate(item['workflow']):
                act('start')
                act('advance' if index<len(item['workflow'])-1 else 'complete',checked_steps=step['checks'],note='【示範】'+('已確認資料，轉下一關。' if index<len(item['workflow'])-1 else '模擬修繕與驗收完成，設備恢復使用；未執行實際派工。'))
        final = client('student1').get(f"/api/campus/admin-cases/{item['id']}").get_json()['data']
        assert final['status'] == target_state
        report.append({'id':item['id'],'kind':kind,'status':final['status'],'next_action':final['progress']['next_action'],'history':[h['action'] for h in final['history']]})
    Path('evidence/unified-services-demo.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))

if __name__ == '__main__': main()
