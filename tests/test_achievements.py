"""投稿、科助審核、公開排序與附件權限。"""
from io import BytesIO


def submit(client, title, day):
    return client.post('/api/campus/achievements', data={
        'kind': '競賽', 'contest_name': title, 'award': '第一名', 'award_date': day,
        'description': '測試成果', 'file': (BytesIO(b'%PDF-1.4\nproof'), 'proof.pdf')},
        content_type='multipart/form-data')


def test_student_to_assistant_to_public(client, login):
    login('student1')
    first = submit(client, '較早比賽', '2026-01-15')
    later = submit(client, '近期比賽', '2026-10-20')
    assert first.status_code == later.status_code == 200
    first_id = first.get_json()['data']['id']
    later_id = later.get_json()['data']['id']
    assert client.get('/api/campus/achievements').get_json()['data'] == []
    assert client.get(f'/api/campus/achievements/{first_id}/file').status_code == 200
    login('demo_assistant_cs')
    queue = client.get('/api/campus/achievements/review')
    assert queue.status_code == 200
    assert len(queue.get_json()['data']) == 2
    assert client.post(f'/api/campus/achievements/{first_id}/review', json={'action': '發布'}).status_code == 200
    assert client.post(f'/api/campus/achievements/{later_id}/review', json={'action': '發布'}).status_code == 200
    public = client.get('/api/campus/achievements').get_json()['data']
    assert [r['contest_name'] for r in public] == ['近期比賽', '較早比賽']
    assert all(r['updated_at'] and r['award_date'] for r in public)
    assert len(client.get('/api/campus/achievements?year=2026').get_json()['data']) == 2
    changed = client.put(f'/api/campus/achievements/{first_id}', json={
        'contest_name': '較早比賽（更正）', 'award': '特優', 'award_date': '2026-01-15',
        'description': '科助查證後更新'})
    assert changed.status_code == 200
    assert changed.get_json()['data']['award'] == '特優'
    assert client.post(f'/api/campus/achievements/{first_id}/review', json={'action': '退回'}).status_code == 409


def test_other_student_cannot_read_evidence(client, login):
    login('student1')
    item_id = submit(client, '佐證權限', '2026-10-20').get_json()['data']['id']
    login('student2')
    assert client.get(f'/api/campus/achievements/{item_id}/file').status_code == 403
