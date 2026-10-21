"""建立老師／學生操作示範；僅使用既有示範帳號，不覆寫已有示範進度。"""
import json
import urllib.request
import http.cookiejar
from datetime import datetime, timedelta, timezone

BASE = 'http://127.0.0.1:8000'
TAG = '【示範流程】'
TODAY = datetime.now(timezone(timedelta(hours=8))).date()


def session(username):
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def api(path, body=None, method=None):
        request = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
                                         headers={'Content-Type': 'application/json'}, method=method)
        with opener.open(request, timeout=30) as response:
            result = json.load(response)
        if result.get('status') == 'error':
            raise RuntimeError(result.get('message'))
        return result
    api('/api/auth/login', {'username': username, 'password': '123456'})
    return api


def main():
    teacher = session('teacher1')
    if teacher('/api/health').get('database') != 'connected':
        raise RuntimeError('需要 MySQL 正常連線才建立示範，避免寫入不同儲存模式。')
    students = {u: session(u) for u in ('student1', 'student2')}
    existing = teacher('/api/campus/counseling')['data']
    care_cases = [
        ('待聯繫：學習計畫確認', 'S112001', -1, '待聯繫', '確認學生是否需要課程學習資源。', ''),
        ('今日到期：專題進度確認', 'S112002', 0, '已聯繫', '確認專題進度與下一次討論時間。', '已說明專題討論方式，等待確認時間。'),
        ('追蹤中：課程資源使用', 'S112001', 3, '追蹤中', '下次確認課程資源是否合用。', '已提供教材連結，預定再次確認。'),
        ('已結案：生涯活動諮詢', 'S112002', -2, '已結案', '確認活動資訊已收到。', '已確認資訊收到，本筆展示結案。'),
    ]
    care_ids = []
    for label, sid, offset, stage, note, result in care_cases:
        content = f'{TAG}{label}。此為虛構操作情境，不代表學生真實狀況。'
        old = next((r for r in existing if r['content'] == content and r['student_id'] == sid), None)
        if old:
            care_ids.append(old['id']); continue
        r = teacher('/api/campus/counseling', {
            'student_id': sid, 'talk_date': TODAY.isoformat(), 'method': '面談',
            'topic': '生涯' if stage == '已結案' else '學業', 'content': content,
            'follow_up': True, 'follow_up_date': (TODAY + timedelta(days=offset)).isoformat(),
            'follow_up_note': note, 'tracking_status': stage, 'tracking_result': result,
        })
        care_ids.append(r['data']['id'])
    sent = teacher('/api/campus/notices/sent')['data']
    notice_ids = {}
    for key, label in [('pending', '專題討論時間確認（待回覆）'), ('partial', '校園活動參加意願（部分回覆）'), ('complete', '學習資源收件確認（已收齊）')]:
        title = TAG + label
        old = next((n for n in sent if n['title'] == title), None)
        if old:
            notice_ids[key] = old['id']; continue
        r = teacher('/api/campus/notices', {
            'class_name': '資管五忠', 'recipients': ['S112001', 'S112002'],
            'title': title, 'content': '僅供老師與學生操作展示，並非正式活動或行政通知。請展開本通知，選擇回條後送出；期限前可更新回覆。',
            'priority': '一般', 'reply_required': True, 'due_date': (TODAY + timedelta(days=7)).isoformat(),
        })
        nid = notice_ids[key] = r['data']['id']
        if key == 'partial':
            students['student1'](f'/api/campus/notices/{nid}/reply', {'reply': '會參加'})
            students['student2'](f'/api/campus/notices/{nid}/read', {}, 'POST')
        elif key == 'complete':
            students['student1'](f'/api/campus/notices/{nid}/reply', {'reply': '收到'})
            students['student2'](f'/api/campus/notices/{nid}/reply', {'reply': '收到'})
    records = teacher('/api/campus/counseling')['data']
    notices = teacher('/api/campus/notices/sent')['data']
    assert all(any(r['id'] == rid for r in records) for rid in care_ids)
    assert all(any(n['id'] == nid for n in notices) for nid in notice_ids.values())
    print(json.dumps({'care_ids': care_ids, 'notice_ids': notice_ids,
                      'receipts': [{'id': n['id'], 'title': n['title'], 'read': n['read_count'], 'replied': n['reply_count'], 'total': n['total']} for n in notices if n['id'] in notice_ids.values()]}, ensure_ascii=False))


if __name__ == '__main__':
    main()
