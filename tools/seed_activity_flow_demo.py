"""透過正在運行的本機網站建立可操作的學生／訪客活動示範，不發送廣播。"""
import json
from datetime import date, timedelta
from http.cookiejar import CookieJar
from urllib.request import HTTPCookieProcessor, Request, build_opener
from uuid import uuid4


BASE = 'http://127.0.0.1:8000'
TITLE = '【流程示範】資管科機器人體驗賽'


def main():
    opener = build_opener(HTTPCookieProcessor(CookieJar()))

    def call(path, data=None, content_type='application/json'):
        body = None if data is None else data if isinstance(data, bytes) else json.dumps(data).encode()
        headers = {'Content-Type': content_type} if body is not None else {}
        with opener.open(Request(BASE + path, data=body, headers=headers), timeout=15) as response:
            return json.load(response)

    login = call('/api/auth/login', {'username': 'demo_assistant_cs', 'password': '123456'})
    assert login['status'] == 'success', login
    existing = next((r for r in call('/api/campus/activity-campaigns')['data']
                     if r['title'] == TITLE and r['event_date'] >= date.today().isoformat()), None)
    if existing:
        print(f"示範活動已存在：#{existing['id']}，地點 {existing.get('location', '待公告')}")
        return
    day = date.today() + timedelta(days=14)
    deadline = date.today() + timedelta(days=7)
    brief = (f'{TITLE}\n此為操作示範，非學校正式比賽。\n'
             f'日期：{day} 13:30\n地點：示範資訊教室（虛構場地）\n'
             '名額：2 人，學生與已登記訪客共用；額滿後依序候補。\n'
             '費用：免費。請使用測試資料報名。\n').encode('utf-8-sig')
    boundary = uuid4().hex
    fields = {'kind': '比賽', 'title': TITLE, 'description': '示範完整流程：建立、學生與訪客報名、名額同步、QR Code 簽到。非正式活動。',
              'target_type': '班級', 'target': '資管五忠', 'event_date': day.isoformat(),
              'event_time': '13:30', 'location': '示範資訊教室（虛構場地）',
              'reply_deadline': deadline.isoformat(), 'capacity': '2', 'fee_mode': '免費',
              'visitor_allowed': 'on'}
    parts = []
    for key, value in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode())
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="attachment"; filename="activity-demo-brief.txt"\r\nContent-Type: text/plain\r\n\r\n'.encode() + brief + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    result = call('/api/campus/activity-campaigns', b''.join(parts), f'multipart/form-data; boundary={boundary}')
    assert result['status'] == 'success', result
    print(f"示範活動已建立：#{result['data']['id']}；報名期限 {deadline}；未發送廣播。")


if __name__ == '__main__':
    main()
