"""Professional certificates require advisor review before final office approval."""
from campus import certificates
from campus.common import now_str


def make_cert(sid='S112001', name='乙級軟體應用測試證照'):
    return certificates.add_submission({
        'student_id': sid, 'student_name': '王小明', 'class_name': '資管五忠',
        'admission_year': 112, 'kind': '證照', 'name': name,
        'issuer': '正式發照機構', 'number': 'CERT-111', 'issue_date': '2026-11-10',
        'award': '', 'description': '', 'files': [{'name': 'certificate.pdf', 'url': '/uploads/test.pdf', 'type': 'pdf'}],
        'status': '待審核', 'reviewer': '', 'review_note': '', 'created_at': now_str(), 'reviewed_at': '',
    })


def test_advisor_then_office_final_approval(client, login):
    item = make_cert()
    path = f"/api/campus/certs/{item['id']}/review"
    login('admin', 'admin123')
    assert client.post(path, json={'action': 'approve'}).status_code == 409
    login('teacher1')
    first = client.post(path, json={'action': 'approve', 'note': '符合學生的軟體開發方向'})
    assert first.status_code == 200, first.get_json()
    assert first.get_json()['data']['status'] == '待複審'
    assert first.get_json()['data']['advisor_note'] == '符合學生的軟體開發方向'
    assert client.post(path, json={'action': 'approve'}).status_code == 409
    login('admin', 'admin123')
    final = client.post(path, json={'action': 'approve', 'note': '證號與機構已核對'})
    assert final.status_code == 200, final.get_json()
    assert final.get_json()['data']['status'] == '已通過'
    assert final.get_json()['data']['advisor_note'] == '符合學生的軟體開發方向'
    assert client.post(path, json={'action': 'reject', 'note': '過期畫面'}).status_code == 409


def test_advisor_batch_scope_and_assistant_review(client, login):
    first = make_cert(name='測試證照甲')
    second = make_cert(name='測試證照乙')
    login('teacher1')
    batch = client.post('/api/campus/certs/review/batch', json={'ids': [first['id'], second['id']]})
    assert batch.status_code == 200 and len(batch.get_json()['reviewed']) == 2
    assert client.post('/api/campus/certs/review/batch', json={'ids': [first['id']]}).status_code == 409
    login('demo_assistant_cs')
    listing = client.get('/api/campus/certs/review').get_json()
    assert {x['id'] for x in listing['data']} >= {first['id'], second['id']}
    assert client.post(f"/api/campus/certs/{first['id']}/review", json={'action': 'approve'}).status_code == 200


def test_non_advisor_cannot_first_review(client, login):
    item = make_cert()
    login('staff1')
    assert client.post(f"/api/campus/certs/{item['id']}/review", json={'action': 'approve'}).status_code == 403
    login('teacher1')
    assert client.get('/api/campus/certs/review').get_json()['data'][0]['id'] == item['id']
