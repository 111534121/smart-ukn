"""科助實習媒合、文件與權限的基本流程。"""
from io import BytesIO
from threading import RLock


class MemoryStore:
    def __init__(self):
        self.lock = RLock()
        self.data = {}

    def section(self, name, factory):
        return self.data.setdefault(name, factory())

    def save(self):
        pass


def test_internship_lifecycle(client, login, monkeypatch, tmp_path):
    from campus import assistant_internships

    monkeypatch.setattr(assistant_internships, 'store', MemoryStore())
    monkeypatch.setattr(assistant_internships, 'DATA_DIR', str(tmp_path))
    monkeypatch.setattr(assistant_internships, 'fifth_year_students', lambda: [
        {'student_id': 'CS5TEST', 'full_name': '測試學生', 'class_name': '資管五忠'}])
    login('demo_assistant_cs')
    assert client.post('/api/campus/assistant/internships', json={
        'student_id': 'FIRSTYEAR', 'company': '測試單位'}).status_code == 400
    created = client.post('/api/campus/assistant/internships', json={
        'student_id': 'CS5TEST', 'company': '測試單位', 'teacher': '指導老師'})
    assert created.status_code == 200
    item_id = created.get_json()['data']['id']
    assert client.post('/api/campus/assistant/internships', json={
        'student_id': 'CS5TEST', 'company': '重複單位'}).status_code == 400
    updated = client.patch(f'/api/campus/assistant/internships/{item_id}', json={
        'stage': '實習中', 'contract_status': '已收件', 'journal_status': '待檢查',
        'teacher': '指導老師', 'visit_date': '2026-12-10', 'note': '待訪視'})
    assert updated.status_code == 200
    assert client.post(f'/api/campus/assistant/internships/{item_id}/contacts', json={
        'party': '實習單位', 'note': '已確認訪視時間'}).status_code == 200
    upload = client.post(f'/api/campus/assistant/internships/{item_id}/files', data={
        'file': (BytesIO(b'%PDF-1.4 demo'), 'contract.pdf')}, content_type='multipart/form-data')
    assert upload.status_code == 200
    file_id = upload.get_json()['data']['id']
    assert client.get(f'/api/campus/assistant/internships/{item_id}/files/{file_id}').status_code == 200
    listed = client.get('/api/campus/assistant/internships').get_json()['data'][0]
    assert listed['stage'] == '實習中'
    assert len(listed['contacts']) == len(listed['files']) == 1
    login('student1')
    assert client.get('/api/campus/assistant/internships').status_code == 403
    assert client.get(f'/api/campus/assistant/internships/{item_id}/files/{file_id}').status_code == 403


def test_history_keeps_prior_year_separate(client, login, monkeypatch):
    from campus import assistant_internships

    monkeypatch.setattr(assistant_internships, 'store', MemoryStore())
    login('demo_assistant_cs')
    response = client.get('/api/campus/internship-history')
    assert response.status_code == 200
    companies = response.get_json()['data']
    assert len(companies) == 24
    assert {row['year'] for row in companies} == {114}
    assert any(row['name'] == '承心資訊有限公司' and row['alumni'] for row in companies)
    mixed = next(row for row in companies if row['name'] == '山淬股份有限公司')
    assert {'資訊技術', '行銷與設計'} <= set(mixed['categories'])
    changed = client.patch('/api/campus/assistant/internship-companies/114/%E5%B1%B1%E6%B7%AC%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8',
                           json={'description': '電商實習', 'advice': '', 'categories': ['行銷與設計']})
    assert changed.status_code == 200
    assert next(row for row in client.get('/api/campus/internship-history').get_json()['data']
                if row['name'] == '山淬股份有限公司')['categories'] == ['行銷與設計']
    assert client.post('/api/campus/assistant/internship-companies', json={
        'year': 115, 'name': '示範公司', 'title': '行銷助理',
        'details': '社群內容', 'category': '行銷與設計'}).status_code == 200
    assert client.get('/api/campus/assistant/internships').get_json()['data'] == []
    login('student1')
    assert client.get('/api/campus/internship-history').status_code == 200
    submitted = client.post('/api/campus/internship-history/shares', json={
        'year': 114, 'company': '承心資訊有限公司',
        'work_description': '協助測試與整理問題', 'advice': '先熟悉測試紀錄'})
    assert submitted.status_code == 200
    assert all(share['demo'] for share in next(
        row for row in client.get('/api/campus/internship-history').get_json()['data']
        if row['name'] == '承心資訊有限公司')['shares'])
    login('demo_assistant_cs')
    share_id = submitted.get_json()['data']['id']
    assert client.patch(f'/api/campus/assistant/internship-shares/{share_id}',
                        json={'status': '已發布'}).status_code == 200
    assert any(not share['demo'] for share in next(
        row for row in client.get('/api/campus/internship-history').get_json()['data']
        if row['name'] == '承心資訊有限公司')['shares'])
