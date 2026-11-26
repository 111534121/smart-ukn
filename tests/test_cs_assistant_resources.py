from io import BytesIO

from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject


def pdf_with_text(value):
    buffer = BytesIO()
    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    font = DictionaryObject({NameObject('/Type'): NameObject('/Font'),
                             NameObject('/Subtype'): NameObject('/Type1'),
                             NameObject('/BaseFont'): NameObject('/Helvetica')})
    page[NameObject('/Resources')] = DictionaryObject({
        NameObject('/Font'): DictionaryObject({NameObject('/F1'): font})})
    stream = DecodedStreamObject()
    stream.set_data(f'BT /F1 12 Tf 72 720 Td ({value}) Tj ET'.encode('ascii'))
    page[NameObject('/Contents')] = writer._add_object(stream)
    writer.write(buffer)
    buffer.seek(0)
    return buffer


def test_cs_assistant_uploads_own_office_sop(client, login):
    login('demo_assistant_cs')
    roster = client.get('/api/campus/assistant/students').get_json()
    assert roster['dept_id'] == 'CS'
    assert all(student['dept_id'] == 'CS' for student in roster['data'])
    uploaded = client.post('/api/campus/office-resources', data={
        'title': '資管科專題報名 SOP', 'kind': 'SOP', 'description': '示範流程',
        'file': (BytesIO(b'%PDF-1.4 sample'), 'procedure.pdf')}, content_type='multipart/form-data')
    assert uploaded.status_code == 200, uploaded.get_json()
    item = uploaded.get_json()['data']
    assert item['office'] == '資訊管理科（五專）／科辦公室'
    assert client.post('/api/campus/office-resources', data={
        'office': '護理科（五專）／科辦公室', 'title': '跨科文件', 'kind': 'SOP',
        'file': (BytesIO(b'example'), 'cross.pdf')}, content_type='multipart/form-data').get_json()['data']['office'] == item['office']
    login('demo_assistant_nur')
    assert client.post(f"/api/campus/office-resources/{item['id']}", data={'title': '更改標題'}).status_code == 403
    login('student1')
    assert client.get(f"/api/campus/office-resources/{item['id']}/file").data == b'%PDF-1.4 sample'


def test_admin_pdf_text_is_searchable_and_replaceable(client, login):
    login('student1')
    assert client.post('/api/admin/knowledge-documents', data={}).status_code == 403
    login('admin', 'admin123')
    uploaded = client.post('/api/admin/knowledge-documents', data={
        'title': '資管科示範規定', 'kind': '校規',
        'file': (pdf_with_text('quartzrobotics guideline'), 'rule.pdf')}, content_type='multipart/form-data')
    assert uploaded.status_code == 200, uploaded.get_json()
    ident = uploaded.get_json()['data']['id']
    found = client.post('/api/search', json={'query': 'quartzrobotics'}).get_json()
    assert found['matched'] and 'quartzrobotics' in found['answer']
    updated = client.post(f'/api/admin/knowledge-documents/{ident}', data={
        'title': '資管科示範規定', 'kind': '校規',
        'file': (pdf_with_text('silvercircuit guideline'), 'rule-new.pdf')}, content_type='multipart/form-data')
    assert updated.status_code == 200
    assert client.post('/api/search', json={'query': 'silvercircuit'}).get_json()['matched']


def test_course_withdrawal_routes_to_curriculum_unit_not_cs_assistant(client, login):
    login('student1')
    created = client.post('/api/campus/admin-cases', json={
        'kind': '停修申請', 'title': '資料結構停修', 'detail': '示範申請',
        'answers': {'學年學期': '115-1', '課程代碼': 'CS201', '課程名稱': '資料結構', '停修原因': '課業規劃'}})
    assert created.status_code == 200, created.get_json()
    item = created.get_json()['data']
    assert item['office'] == '教務處／課務組'
    login('demo_assistant_cs')
    assert client.get(f"/api/campus/admin-cases/{item['id']}").status_code == 404
    login('admin', 'admin123')
    members = dict(client.get('/api/campus/admin-cases/config').get_json()['members'])
    members['demo_group_curriculum'] = '教務處／課務組'
    assert client.put('/api/campus/admin-cases/config', json={'members': members}).status_code == 200
    login('demo_group_curriculum')
    assert client.get(f"/api/campus/admin-cases/{item['id']}").status_code == 200
