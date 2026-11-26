"""招生諮詢只能由資管科科助管理，並能記錄處理進度。"""


def test_admission_inquiry_lifecycle(client, login, monkeypatch):
    from campus import assistant_admissions

    class MemoryStore:
        def __init__(self):
            from threading import RLock
            self.lock = RLock()
            self.data = {}

        def section(self, name, factory):
            return self.data.setdefault(name, factory())

        def save(self):
            pass

    monkeypatch.setattr(assistant_admissions, 'store', MemoryStore())
    login('demo_assistant_cs')
    created = client.post('/api/campus/assistant/admissions', json={
        'contact': '王家長', 'channel': '電話', 'topic': '科系參訪', 'question': '想了解參訪時間'})
    assert created.status_code == 200
    item_id = created.get_json()['data']['id']
    updated = client.patch(f'/api/campus/assistant/admissions/{item_id}', json={
        'status': '已轉介', 'note': '轉交招生中心確認時段'})
    assert updated.status_code == 200
    assert client.get('/api/campus/assistant/admissions').get_json()['summary']['已轉介'] == 1
    login('student1')
    assert client.get('/api/campus/assistant/admissions').status_code == 403
    assert client.patch(f'/api/campus/assistant/admissions/{item_id}', json={'status': '已完成'}).status_code == 403
