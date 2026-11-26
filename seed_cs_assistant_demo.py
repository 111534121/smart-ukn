"""僅建立資管科科助的離線示範資料；重跑不重複建立。"""
from datetime import date, timedelta
from io import BytesIO
from pathlib import Path
from shutil import copy2

from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject

import app
from campus import office_catalog
from campus.common import store

ACCOUNT = 'demo_assistant_cs'
OFFICE = '資訊管理科（五專）／科辦公室'
TITLE = '【資管科示範】機器人創意比賽'
PAID_TITLE = '【資管科示範】付費研習（繳費尚未開放）'
CASE_TITLE = '【資管科示範】專題資料收件'
SOP_TITLE = '【資管科示範】活動報名作業 SOP'
PROJECT_TITLE = '【資管科示範】智慧校園畢業專題'


def pdf():
    buffer = BytesIO()
    writer = PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    font = DictionaryObject({NameObject('/Type'): NameObject('/Font'),
                             NameObject('/Subtype'): NameObject('/Type1'),
                             NameObject('/BaseFont'): NameObject('/Helvetica')})
    page[NameObject('/Resources')] = DictionaryObject({
        NameObject('/Font'): DictionaryObject({NameObject('/F1'): font})})
    stream = DecodedStreamObject()
    stream.set_data(b'BT /F1 14 Tf 72 720 Td (CS assistant demo SOP - not official) Tj ET')
    page[NameObject('/Contents')] = writer._add_object(stream)
    writer.write(buffer)
    buffer.seek(0)
    return buffer


def client(username, password='123456'):
    browser = app.app.test_client()
    response = browser.post('/api/auth/login', json={'username': username, 'password': password})
    if response.status_code != 200:
        raise RuntimeError(f'{username} 示範登入失敗')
    return browser


def main():
    if app.is_db_available():
        raise RuntimeError('此腳本只供離線示範使用；MySQL 帳號請先執行 seed_admin_offices_demo.py。')
    path = Path(store.path)
    if path.exists():
        backup = path.with_name(path.stem + '.before-cs-assistant-demo.json')
        if not backup.exists():
            copy2(path, backup)
    admin = client('admin', 'admin123')
    config = admin.get('/api/campus/admin-cases/config').get_json()
    members = dict(config['members'])
    members[ACCOUNT] = OFFICE
    departments = dict(config.get('assistant_departments') or {})
    departments[ACCOUNT] = 'CS'
    response = admin.put('/api/campus/admin-cases/config', json={
        'offices': list(dict.fromkeys([*config['offices'], *office_catalog.OFFICES])),
        'members': members, 'assistant_departments': departments})
    if response.status_code != 200:
        raise RuntimeError(response.get_json())

    assistant = client(ACCOUNT)
    if not any(c['title'] == TITLE for c in store.data.get('activity_campaigns', [])):
        response = assistant.post('/api/campus/activity-campaigns', data={
            'kind': '比賽', 'title': TITLE, 'description': '虛構示範比賽；請下載簡章並回覆參加意願，不代表正式公告。',
            'target_type': '班級', 'target': '資管五忠',
            'event_date': (date.today() + timedelta(days=30)).isoformat(), 'event_time': '13:20',
            'reply_deadline': (date.today() + timedelta(days=20)).isoformat(),
            'attachment': (BytesIO('資管科機器人創意比賽\n此為示範簡章，非正式活動。\n'.encode('utf-8-sig')), '資管科示範比賽簡章.txt')},
            content_type='multipart/form-data')
        if response.status_code != 200:
            raise RuntimeError(response.get_json())

    event = next(c for c in store.data['activity_campaigns'] if c['title'] == TITLE)
    if not any(a['campaign_id'] == event['id'] and a['teacher_username'] == 'teacher1'
               for a in store.data.get('activity_campaign_approvals', [])):
        response = assistant.post(f"/api/campus/activity-campaigns/{event['id']}/approvals",
                                  json={'teacher_username': 'teacher1'})
        if response.status_code != 200:
            raise RuntimeError(response.get_json())
    if not any(c['title'] == PAID_TITLE for c in store.data.get('activity_campaigns', [])):
        response = assistant.post('/api/campus/activity-campaigns', data={
            'kind': '活動', 'title': PAID_TITLE,
            'description': '虛構付費畫面示範；尚未開放報名或繳費，不代表正式活動。',
            'target_type': '班級', 'target': '資管五忠',
            'event_date': (date.today() + timedelta(days=40)).isoformat(), 'event_time': '13:20',
            'reply_deadline': (date.today() + timedelta(days=30)).isoformat(),
            'capacity': '20', 'fee_mode': '付費', 'fee_amount': '300'})
        if response.status_code != 200:
            raise RuntimeError(response.get_json())

    if not any(r['title'] == SOP_TITLE for r in store.data.get('office_resources', [])):
        response = assistant.post('/api/campus/office-resources', data={
            'title': SOP_TITLE, 'kind': 'SOP',
            'description': '虛構示範文件；正式作業請以資管科公告為準。',
            'file': (pdf(), 'cs_assistant_demo_sop.pdf')}, content_type='multipart/form-data')
        if response.status_code != 200:
            raise RuntimeError(response.get_json())

    if not any(c['title'] == CASE_TITLE for c in store.data.get('admin_cases', [])):
        student = client('student1')
        kind = '資訊管理科（五專）資料收件'
        spec = student.get('/api/campus/admin-cases/config').get_json()['workflows'][kind]
        response = student.post('/api/campus/admin-cases', json={
            'kind': kind, 'title': CASE_TITLE,
            'detail': '虛構示範資料，供資管科科助練習收件與補件。',
            'answers': {field: '【示範】' + field for field in spec['fields']}})
        if response.status_code != 200:
            raise RuntimeError(response.get_json())
    if not any(t['title'] == PROJECT_TITLE for t in store.data.get('graduation_project_teams', [])):
        student = client('student1')
        response = student.post('/api/campus/graduation-projects', json={'title': PROJECT_TITLE})
        if response.status_code != 200:
            raise RuntimeError(response.get_json())
        team = response.get_json()['data']
        teammate = client('student2')
        response = teammate.post('/api/campus/graduation-projects/join', json={'join_code': team['join_code']})
        if response.status_code != 200:
            raise RuntimeError(response.get_json())
        response = student.put(f"/api/campus/graduation-projects/{team['id']}/preferences",
                               json={'ranking': ['teacher1']})
        if response.status_code != 200:
            raise RuntimeError(response.get_json())
        response = admin.post('/api/campus/graduation-projects/match')
        if response.status_code != 200:
            raise RuntimeError(response.get_json())
        response = student.post(f"/api/campus/graduation-projects/{team['id']}/submissions/提案",
                                data={'file': (pdf(), 'cs_project_demo_proposal.pdf')},
                                content_type='multipart/form-data')
        if response.status_code != 200:
            raise RuntimeError(response.get_json())
    print(f'{ACCOUNT}/123456：資管科科助示範已就緒（活動、SOP、待審案件、畢業專題）。')


if __name__ == '__main__':
    main()
