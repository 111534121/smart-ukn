"""只建立住宿管理的虛構示範資料；重跑不覆寫既有案件。"""
from datetime import timedelta
import json

import app
from campus import admin_cases, services

TAG = '【宿舍示範】'
SEMESTER = '宿舍示範115-2'
BASE = '/api/campus/admin-cases'


def main():
    if app.is_db_available():
        raise RuntimeError('此工具只用於本機示範模式，避免寫入正式資料庫')
    clients = {}

    def client(username):
        if username not in clients:
            c = app.app.test_client()
            response = c.post('/api/auth/login', json={'username': username, 'password': '123456', 'remember': False})
            if response.status_code != 200:
                raise RuntimeError(f'{username} 示範登入失敗')
            clients[username] = c
        return clients[username]

    def api(username, method, path, body=None):
        response = client(username).open(path, method=method, json=body)
        if response.status_code != 200:
            raise RuntimeError(f'{username} {path}: {response.get_json()}')
        return response.get_json()

    config = api('dorm_demo', 'GET', BASE + '/config')
    if config['office'] != '學生事務處／住宿管理':
        raise RuntimeError('dorm_demo 尚未指派到住宿管理單位')

    added = []
    for username, room, minutes, needs, advance in [
        ('student1', '四人房', 75, TAG + '通勤較遠，待審核資格', False),
        ('student2', '六人房', 50, TAG + '資料已核對，待後續床位排序', True),
    ]:
        current = api(username, 'GET', '/api/campus/dorm/mine')['data']
        if any(item['semester'] == SEMESTER for item in current):
            continue
        item = api(username, 'POST', '/api/campus/dorm/apply', {
            'semester': SEMESTER, 'room_type': room, 'commute_minutes': minutes,
            'emergency_phone': '0000000000', 'special_needs': needs,
        })['data']
        if advance:
            api('dorm_demo', 'POST', f"/api/campus/dorm/applications/{item['id']}",
                {'action': 'advance', 'note': TAG + '資格資料已核對'})
        added.append('宿舍申請：' + username)

    existing = {case['title'] for case in api('dorm_demo', 'GET', BASE)['data']}
    examples = [
        ('student1', '住宿異動申請', TAG + '換房申請｜待受理',
         {'目前宿舍與房號': '示範 S305', '申請事項（入住／換房／退宿）': '換房',
          '希望生效日期': '115 學年度第 2 學期', '異動原因': '示範：生活作息調整'}, 'waiting'),
        ('student2', '住宿設備報修', TAG + '房間冷氣報修｜處理中',
         {'宿舍與房號': '示範 S308', '設備種類': '冷氣',
          '故障情形': '示範：無法啟動', '可進入維修時段': '平日 14:00–17:00'}, 'processing'),
        ('student1', '住宿異動申請', TAG + '退宿申請｜待補件',
         {'目前宿舍與房號': '示範 S305', '申請事項（入住／換房／退宿）': '退宿',
          '希望生效日期': '115 學年度第 2 學期末', '異動原因': '示範：學期末退宿'}, 'supplement'),
    ]
    for username, kind, title, answers, state in examples:
        if title in existing:
            continue
        item = api(username, 'POST', BASE, {
            'kind': kind, 'title': title, 'detail': '虛構資料，供宿舍行政人員練習受理、補件與結案。',
            'answers': answers,
        })['data']
        if state != 'waiting':
            item = api('dorm_demo', 'POST', f"{BASE}/{item['id']}",
                       {'action': 'start', 'revision': item['revision']})['data']
        if state == 'supplement':
            api('dorm_demo', 'POST', f"{BASE}/{item['id']}", {
                'action': 'supplement', 'revision': item['revision'],
                'requirements': ['請補充預計退宿日期與鑰匙繳回方式'],
                'due_date': (admin_cases.today() + timedelta(days=5)).isoformat(),
                'note': TAG + '請補齊退宿資訊',
            })
        added.append('行政案件：' + title)

    alerts = api('dorm_demo', 'GET', '/api/staff/alerts')['data']
    if any(item['type'] not in ('宿舍', '行政案件') for item in alerts):
        raise RuntimeError('宿舍工作台出現其他單位待辦')
    summary = {'added': added, 'dorm_applications': len(services.dorm_apps()),
               'dorm_admin_cases': len(api('dorm_demo', 'GET', BASE)['data']),
               'dorm_todos': len(alerts)}
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return summary


if __name__ == '__main__':
    main()
