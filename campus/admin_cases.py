"""行政案件：處室隔離、補件與重新送審。沿用 campus 的持久化儲存。"""
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, request, send_file

from .common import current_user, deps, error, next_id, ok, require, store

bp = Blueprint('admin_cases', __name__)
OFFICES = ['教務處', '學務處', '總務處', '研發處', '秘書室']
KINDS = {'學籍與成績': '教務處', '獎助與學生事務': '學務處',
         '報帳與設備': '總務處', '實習與就業': '研發處', '其他諮詢': '秘書室'}
ACTIVE = ('待受理', '處理中', '待補件', '重新送審')
EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx', '.txt'}
MAX_FILE = 10 * 1024 * 1024


def today():
    return datetime.now(timezone(timedelta(hours=8))).date()


def stamp():
    return datetime.now(timezone(timedelta(hours=8))).strftime('%Y-%m-%d %H:%M:%S')


def accounts():
    rows = deps.fetch_db_rows("SELECT username, full_name, role FROM users WHERE role IN ('教職員', '管理員')")
    source = rows if rows is not None else deps.users
    return [{k: u.get(k, '') for k in ('username', 'full_name', 'role')}
            for u in source if u['role'] in ('教職員', '管理員')]


def assignments():
    # 示範帳號在未連接校務資料庫時預設隸屬教務處；正式帳號由管理員明確設定。
    return store.section('admin_offices', lambda: {'staff1': '教務處'}
                         if deps.fetch_db_rows('SELECT username FROM users LIMIT 1') is None else {})


def cases():
    return store.section('admin_cases', list)


def visible(item, user=None):
    u = user or current_user()
    if u['role'] == '學生':
        return item['student_id'] == u['student_id']
    return u['role'] == '管理員' or (u['role'] == '教職員' and assignments().get(u['username']) == item['office'])


def payload(item):
    result = deepcopy(item)
    result['overdue'] = item['status'] in ACTIVE and item['due_date'] < today().isoformat()
    result['can_act'] = current_user()['role'] in ('教職員', '管理員') and visible(item)
    return result


def history(item, action, note=''):
    u = current_user()
    item['updated_at'] = stamp()
    item['revision'] = item.get('revision', 0) + 1
    item['history'].append({'at': stamp(), 'actor': u['full_name'] or u['username'],
                            'username': u['username'], 'action': action, 'note': note,
                            'status': item['status'], 'office': item['office'], 'assignee': item['assignee']})


def upload_root():
    return Path(store.path).parent / 'admin_case_files'


def read_uploads():
    files = request.files.getlist('files')
    if len(files) > 5:
        raise ValueError('每次最多上傳 5 個檔案')
    result = []
    for f in files:
        if not f.filename:
            continue
        if Path(f.filename).suffix.lower() not in EXTENSIONS:
            raise ValueError('支援 PDF、圖片、DOCX、XLSX 與 TXT 檔案')
        content = f.read(MAX_FILE + 1)
        if not content or len(content) > MAX_FILE:
            raise ValueError('每個檔案須有內容且不超過 10 MB')
        result.append(({'id': uuid4().hex, 'name': f.filename.replace('\\', '/').split('/')[-1][:150],
                        'size': len(content)}, content))
    return result


def save_files(item, uploads):
    upload_root().mkdir(parents=True, exist_ok=True)
    for meta, content in uploads:
        (upload_root() / meta['id']).write_bytes(content)
        item['files'].append(meta)


def form_data():
    data = request.get_json(silent=True) if request.is_json else request.form.to_dict()
    if not isinstance(data, dict):
        raise ValueError('請提供有效的表單資料')
    return data


def text(data, key, maximum=2000):
    value = data.get(key, '')
    if not isinstance(value, str) or len(value) > maximum:
        raise ValueError(f'{key} 格式錯誤或內容過長')
    return value.strip()


@bp.route('/admin-workbench')
@require('學生', '教職員', '管理員')
def page():
    return current_app.send_static_file('admin-workbench.html')


@bp.route('/api/campus/admin-cases/config', methods=['GET', 'PUT'])
@require('學生', '教職員', '管理員')
def config():
    u = current_user()
    if request.method == 'PUT':
        if u['role'] != '管理員':
            return error('僅管理員可設定處室分工', 403)
        data = request.get_json(silent=True)
        members = data.get('members') if isinstance(data, dict) else None
        names = {a['username'] for a in accounts()}
        if not isinstance(members, dict) or any(k not in names or v not in OFFICES for k, v in members.items()):
            return error('請使用現有行政帳號與有效處室')
        with store.lock:
            before = deepcopy(assignments())
            store.data['admin_offices'] = dict(members)
            store.save()
            deps.write_audit_log('admin_offices', 'members', '修改', before=before, after=members)
    with store.lock:
        members = deepcopy(assignments())
    people = accounts() if u['role'] in ('教職員', '管理員') else []
    if u['role'] == '教職員':
        people = [a for a in people if members.get(a['username']) == members.get(u['username'])
                  and members.get(u['username'])]
    return ok(offices=OFFICES, kinds=KINDS, office=members.get(u['username']),
              members=members if u['role'] == '管理員' else {a['username']: members.get(a['username']) for a in people},
              accounts=people)


@bp.route('/api/campus/admin-cases', methods=['GET', 'POST'])
@require('學生', '教職員', '管理員')
def collection():
    u = current_user()
    if request.method == 'POST':
        if u['role'] != '學生':
            return error('僅學生可送出申請', 403)
        try:
            data = form_data()
            title, detail, kind = text(data, 'title', 100), text(data, 'detail', 4000), text(data, 'kind', 30)
            if not title or not detail or kind not in KINDS:
                return error('請填寫案件標題、申請說明並選擇類別')
            uploads = read_uploads()
        except ValueError as exc:
            return error(str(exc))
        with store.lock:
            item = {'id': next_id(cases()), 'student_id': u['student_id'], 'student_name': u['full_name'],
                    'title': title, 'detail': detail, 'kind': kind, 'office': KINDS[kind], 'assignee': '',
                    'status': '待受理', 'due_date': (today() + timedelta(days=7)).isoformat(),
                    'created_at': stamp(), 'updated_at': stamp(), 'revision': 0,
                    'requirements': [], 'supplements': [], 'history': [], 'files': []}
            save_files(item, uploads)
            history(item, '送出申請')
            cases().append(item)
            store.save()
        return ok(data=payload(item), message='申請已送交承辦處室')
    with store.lock:
        rows = [payload(c) for c in cases() if visible(c)]
    rows.sort(key=lambda c: (c['status'] not in ACTIVE, not c['overdue'], c['due_date'], c['id']))
    return ok(data=rows, counts={s: sum(c['status'] == s for c in rows) for s in (*ACTIVE, '已完成', '已退件')})


@bp.route('/api/campus/admin-cases/<int:case_id>', methods=['GET', 'POST'])
@require('學生', '教職員', '管理員')
def case_detail(case_id):
    with store.lock:
        item = next((c for c in cases() if c['id'] == case_id), None)
        if not item or not visible(item):
            return error('找不到案件或無權限查看', 404)
        if request.method == 'GET':
            return ok(data=payload(item))
        try:
            data = form_data()
            if str(data.get('revision')) != str(item['revision']):
                return error('案件已更新，請重新整理後再操作', 409)
            action, note = text(data, 'action', 30), text(data, 'note')
            student = current_user()['role'] == '學生'
            if student and action != 'resubmit':
                return error('學生僅可補件重新送審', 403)
            if item['status'] not in ACTIVE:
                return error('案件已結案，無法再次修改', 409)
            before = deepcopy(item)
            updated = deepcopy(item)
            if action == 'resubmit':
                if not student or item['status'] != '待補件':
                    return error('僅申請學生可對待補件案件重新送審', 409)
                checked = data.get('checked', [])
                if not request.is_json:
                    checked = request.form.getlist('checked')
                if not isinstance(checked, list) or set(checked) != set(item['requirements']):
                    return error('請逐項確認已補齊要求的資料')
                if not note:
                    return error('請填寫補件說明')
                uploads = read_uploads()
                save_files(updated, uploads)
                updated['supplements'].append({'at': stamp(), 'note': note, 'checked': checked,
                                               'files': [m for m, _ in uploads]})
                updated['status'] = '重新送審'
                updated['due_date'] = (today() + timedelta(days=7)).isoformat()
                label = '補件重新送審'
            elif action == 'start':
                if item['status'] not in ('待受理', '重新送審'):
                    return error('目前狀態無法受理', 409)
                updated['status'] = '處理中'
                updated['assignee'] = current_user()['username']
                label = '受理案件'
            elif action == 'supplement':
                if item['status'] not in ('待受理', '處理中', '重新送審'):
                    return error('目前狀態無法要求補件', 409)
                requirements = data.get('requirements')
                if not isinstance(requirements, list) or not 1 <= len(requirements) <= 15 or any(
                        not isinstance(r, str) or not r.strip() or len(r) > 150 for r in requirements):
                    return error('請填寫 1 至 15 項補件資料，每項最多 150 字')
                due = date.fromisoformat(text(data, 'due_date', 10))
                if due < today() or not note:
                    return error('請填寫補件原因，期限不能早於今天')
                updated.update(status='待補件', requirements=list(dict.fromkeys(r.strip() for r in requirements)),
                               due_date=due.isoformat())
                label = '要求補件'
                note += '\n應補資料：' + '、'.join(updated['requirements']) + '\n期限：' + due.isoformat()
            elif action == 'assign':
                office, assignee = text(data, 'office', 30), text(data, 'assignee', 100)
                if office not in OFFICES or not note:
                    return error('請選擇處室並填寫分派／轉交說明')
                if assignee and (assignments().get(assignee) != office or assignee not in {a['username'] for a in accounts()}):
                    return error('承辦人必須屬於指定處室')
                updated.update(office=office, assignee=assignee)
                label = '分派／轉交案件'
            elif action in ('complete', 'reject'):
                if item['status'] != '處理中' or not note:
                    return error('請先受理案件並填寫辦理結果', 409)
                updated['status'] = '已完成' if action == 'complete' else '已退件'
                label = '完成案件' if action == 'complete' else '退件結案'
            else:
                return error('不支援的操作')
            history(updated, label, note)
            item.clear()
            item.update(updated)
            store.save()
            deps.write_audit_log('admin_cases', case_id, label, before=before, after=updated)
            return ok(data=payload(item), message=label + '成功')
        except (ValueError, TypeError) as exc:
            return error(str(exc) if isinstance(exc, ValueError) else '表單格式錯誤')


@bp.route('/api/campus/admin-cases/<int:case_id>/files/<file_id>')
@require('學生', '教職員', '管理員')
def download(case_id, file_id):
    with store.lock:
        item = next((c for c in cases() if c['id'] == case_id and visible(c)), None)
        meta = next((f for f in item['files'] if f['id'] == file_id), None) if item else None
        if not meta:
            return error('找不到檔案', 404)
        path = upload_root() / meta['id']
        if not path.is_file():
            return error('檔案不存在，請聯絡承辦人', 404)
        response = send_file(BytesIO(path.read_bytes()), as_attachment=True,
                             download_name=meta['name'], mimetype='application/octet-stream')
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response
