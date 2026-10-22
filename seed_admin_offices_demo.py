"""建立可操作的處室示範。請先停止服務；不改密碼、不覆寫已操作的示範案件。"""
from datetime import timedelta
import json

import app
from campus import admin_cases as cases
from campus import office_catalog as catalog
from campus.common import store

TAG = '【處室示範】'


def main():
    demo_people = catalog.demo_accounts()
    database = app.is_db_available()
    if database:
        legacy = app.fetch_db_rows('SELECT username, full_name FROM users WHERE username=%s', ('demo_dorm',))
        if legacy and legacy[0]['full_name'] == '住宿管理員示範帳號':
            app.db_execute('UPDATE users SET can_manage_dorm=0 WHERE username=%s', ('demo_dorm',))
        for person in demo_people:
            existing = app.fetch_db_rows('SELECT username, role, full_name FROM users WHERE username=%s', (person['username'],))
            if existing:
                if existing[0]['role'] != '教職員' or existing[0]['full_name'] != person['full_name']:
                    raise RuntimeError('示範帳號名稱與既有使用者衝突：' + person['username'])
                if person['username'] == 'dorm_demo':
                    app.db_execute('UPDATE users SET can_manage_dorm=1 WHERE username=%s', ('dorm_demo',))
                continue
            app.db_execute('INSERT INTO users (username,password_hash,role,full_name,can_manage_dorm) VALUES (%s,%s,%s,%s,%s)',
                           (person['username'], app._DEMO_PW_123456, '教職員', person['full_name'],
                            1 if person['username'] == 'dorm_demo' else 0))

    clients = {}
    def client(name):
        if name not in clients:
            c = app.app.test_client()
            response = c.post('/api/auth/login', json={'username':name, 'password':'admin123' if name == 'admin' else '123456', 'remember':False})
            if response.status_code != 200:
                raise RuntimeError('示範登入失敗：' + name)
            clients[name] = c
        return clients[name]

    def api(name, method, path, body=None):
        r = client(name).open(path, method=method, json=body)
        if r.status_code != 200:
            raise RuntimeError(f'{name} {method} {path}: {r.get_json()}')
        return r.get_json()

    base = '/api/campus/admin-cases'
    config = api('admin', 'GET', base + '/config')
    members = dict(config['members'])
    # 僅對本次明確授權的示範帳號設定處室；保留其他真實帳號的分工。
    members.update({'staff1':'教務處', 'dorm_demo':'學生事務處／住宿管理'})
    members.update({p['username']:p['office'] for p in demo_people})
    api('admin', 'PUT', base + '/config', {'members':members})
    existing = api('admin', 'GET', base)['data']
    titles = {c['title'] for c in existing}
    made = []

    def action(name, item, verb, **extra):
        return api(name, 'POST', f"{base}/{item['id']}", {'action':verb,'revision':item['revision'],**extra})['data']

    def scenario(person, kind, label, mode, applicant='student1', answers=None):
        title = TAG + person['office'] + '｜' + label
        if title in titles:
            return
        spec = config['workflows'][kind]
        if '學生' not in spec['roles']:
            applicant = 'staff1'
        item = api(applicant, 'POST', base, {'kind':kind, 'title':title,
            'detail':'虛構示範資料，僅供切換處室、分派、逐關檢核與補件操作，不代表正式申請。',
            'answers':{f:(answers or {}).get(f, '【示範】'+f+'：操作練習用') for f in spec['fields']}})['data']
        reviewer = person['username']
        if mode not in ('waiting', 'overdue'):
            item = action(reviewer, item, 'start')
        if mode in ('supplement', 'resubmit'):
            requested = ['請補充'+spec['fields'][0], '請確認聯絡與交付方式']
            item = action(reviewer, item, 'supplement', requirements=requested,
                          due_date=(cases.today()+timedelta(days=5)).isoformat(), note='【示範】資料尚待補充，可用申請帳號練習補件。')
            if mode == 'resubmit':
                item = action(applicant, item, 'resubmit', checked=requested, note='【示範】已補充申請用途與聯絡方式，請重新審查。')
        elif mode == 'complete':
            while item['workflow_index'] < len(item['workflow'])-1:
                step = item['workflow'][item['workflow_index']]
                item = action(reviewer,item,'advance',checked_steps=step['checks'],note='【示範】本步驟檢核完成。')
                item = action(reviewer,item,'start')
            item = action(reviewer,item,'complete', checked_steps=item['workflow'][-1]['checks'], note='【示範】全部步驟已完成，展示結案與完整紀錄。')
        elif mode == 'reject':
            item = action(reviewer,item,'reject',note='【示範】展示資料不適用時的退件結案，不代表真實資格判斷。')
        if mode == 'overdue':
            with store.lock:
                saved = next(c for c in cases.cases() if c['id'] == item['id'])
                saved['due_date'] = (cases.today()-timedelta(days=1)).isoformat()
                saved['history'].append({'at':cases.stamp(),'actor':'處室示範建立工具','username':'admin',
                    'action':'設定示範逾期日期','note':'僅此新建示範案件設定為昨天到期，供篩選練習。',
                    'status':saved['status'],'office':saved['office'],'assignee':saved['assignee']})
                saved['revision'] += 1
                store.save()
        made.append(item['id'])
        titles.add(title)

    for person in demo_people:
        kind = next(k for k,v in config['workflows'].items() if v['office'] == person['office'])
        # 示範學生只有資訊管理科身分；其他科辦範例由教職員提出，避免跨科系代送。
        for label, mode, applicant in [('待受理：可練習分派', 'waiting','student2'),
                                       ('處理中：可逐關檢核','processing','student1'),
                                       ('待補件：可用申請帳號補交','supplement','student1')]:
            if person.get('type') == 'assistant' and person.get('dept_id') != 'CS':
                applicant = 'staff1'
            scenario(person,kind,label,mode,applicant)
    examples = [
        ('demo_group_registration', '學籍證明申請（註冊組）', '在學證明申請範例', 'waiting', 'student1',
         {'證明種類':'在學證明', '申請用途':'【示範】校外實習', '申請份數':'1', '領取方式':'至註冊組領取'}),
        ('demo_group_curriculum', '課務異動諮詢（課務組）', '課程異動範例', 'processing', 'student1',
         {'學期':'115-1', '課程名稱與代碼':'CS101 計算機概論', '班級':'資管五忠',
          '異動事項':'課程時間調整諮詢', '原因':'【示範】原時段與實習說明會重疊'}),
        ('demo_group_affairs', '設備報修申請（事務組）', '教室設備報修範例', 'waiting', 'student1',
         {'設備位置':'【示範】教學大樓 301', '設備類型':'投影機', '故障情形':'無法顯示畫面',
          '可聯絡時間':'平日 09:00–17:00'}),
        ('dorm_demo', '住宿異動申請', '宿舍換房範例', 'waiting', 'student1',
         {'目前宿舍與房號':'【示範】S305', '申請事項（入住／換房／退宿）':'換房',
          '希望生效日期':'115 學年度第 1 學期', '異動原因':'【示範】生活作息調整'}),
        ('demo_assistant_cs', '資訊管理科（五專）資料收件', '科助證照資料收件範例', 'waiting', 'student1',
         {'資料類別（實習／證照／其他）':'證照', '資料名稱':'【示範】資訊證照影本',
          '學年學期':'115-1', '聯絡方式':'校內訊息'}),
    ]
    by_username = {person['username']: person for person in demo_people}
    for username, kind, label, mode, applicant, answers in examples:
        scenario(by_username[username], kind, label, mode, applicant, answers)
    academic = demo_people[0]
    kind = next(k for k,v in config['workflows'].items() if v['office'] == academic['office'])
    for label,mode in [('重新送審：可再次受理','resubmit'),('已完成：可查看全程紀錄','complete'),('已退件：可查看原因','reject')]:
        scenario(academic,kind,label,mode)
    library = next(p for p in demo_people if p['office'] == '資訊暨圖書中心')
    kind = next(k for k,v in config['workflows'].items() if v['office'] == library['office'])
    scenario(library,kind,'已逾期：可練習催辦篩選','overdue')

    all_rows = api('admin','GET',base)['data']
    demo_rows = [c for c in all_rows if c['title'].startswith(TAG)]
    summary = {'database':'mysql' if database else 'demo', 'offices':len(config['offices']),
               'demo_accounts':len(demo_people), 'new_cases':len(made),'demo_cases':len(demo_rows),
               'states':{s:sum(c['status']==s for c in demo_rows) for s in (*cases.ACTIVE,'已完成','已退件')},
               'overdue':sum(c['overdue'] for c in demo_rows), 'source':catalog.SOURCE}
    print(json.dumps(summary,ensure_ascii=False,indent=2))
    return summary


if __name__ == '__main__':
    main()
