"""Create one local demo activity through the existing API; never broadcast."""
from io import BytesIO
import app
from campus.common import store

TITLE = '【專題示範】校園智慧服務體驗工作坊'
BRIEF = '''校園智慧服務體驗工作坊｜示範活動簡章

此為「校園智慧官網」專題操作示範，並非學校正式活動。
活動時間：2026 年 11 月 6 日（五）13:20–15:00
活動地點：示範資訊教室（虛構場地）
活動對象：資管五忠示範班級
回覆期限：2026 年 10 月 30 日
費用：免費；不收費、不蒐集真實個人資料。

活動內容：
13:20–13:40 認識校園智慧官網與常用服務
13:40–14:20 體驗公告分類、行政申請與補件流程
14:20–15:00 分享使用心得

操作方式：
1. 下載本簡章。
2. 在活動卡片選擇「參加／不參加／考慮中」。
3. 備註可填「示範操作」；不需上傳報名表。
4. 點「送出回覆」後可查看自己的回覆結果。

聯絡方式：專題示範窗口（請勿填寫真實電話或身分資料）。
'''

def main():
    app.get_db_connection = lambda: None
    client = app.app.test_client()
    assert client.post('/api/auth/login', json={'username':'teacher1','password':'123456'}).status_code == 200
    existing = [c for c in store.data.get('activity_campaigns', []) if c['title'] == TITLE]
    if existing:
        item = existing[0]
    else:
        response = client.post('/api/campus/activity-campaigns', data={
            'title':TITLE, 'description':'專題示範活動，非正式校務通知。一起體驗公告搜尋、申辦進度與補件流程。可先下載簡章，再選擇參加意願；備註與附件皆可留空。地點為虛構的示範資訊教室，不收費。',
            'target_type':'班級', 'target':'資管五忠', 'event_date':'2026-11-06', 'event_time':'13:20', 'reply_deadline':'2026-10-30',
            'attachment':(BytesIO(BRIEF.encode('utf-8-sig')), '校園智慧服務體驗工作坊_示範簡章.txt'),
        }, content_type='multipart/form-data')
        assert response.status_code == 200, response.get_json()
        item = response.get_json()['data']
    student = app.app.test_client()
    assert student.post('/api/auth/login', json={'username':'student1','password':'123456'}).status_code == 200
    visible = student.get('/api/campus/activity-campaigns').get_json()['data']
    activity = next(c for c in visible if c['id'] == item['id'])
    assert activity['my_reply'] is None, 'Existing reply preserved; do not reset it.'
    downloaded = student.get(f"/api/campus/activity-campaigns/{item['id']}/files/attachment")
    assert downloaded.status_code == 200
    assert '示範活動簡章' in downloaded.data.decode('utf-8-sig')
    print(f"Created/verified demo activity #{item['id']}; student1 can view and download; reply left blank.")

if __name__ == '__main__':
    main()
