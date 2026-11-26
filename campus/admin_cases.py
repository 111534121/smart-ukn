"""行政案件：處室隔離、補件與重新送審。沿用 campus 的持久化儲存。"""
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
from io import BytesIO
import os
import threading
from pathlib import Path
from urllib.parse import quote
from uuid import uuid4

from flask import Blueprint, current_app, redirect, request, send_file

from .common import current_user, deps, error, next_id, ok, require, store
from . import office_catalog as catalog
from . import admin_case_store, demo_signoff
from .smart_routing import predict as predict_route

bp = Blueprint('admin_cases', __name__)
OFFICES = catalog.OFFICES
KINDS = catalog.LEGACY_KINDS
ACTIVE = ('待受理', '處理中', '待補件', '重新送審')
EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx', '.txt'}
MAX_FILE = 10 * 1024 * 1024
WORK_ROLES = catalog.WORK_ROLES
ACCESS_ROLES = ('學生', *WORK_ROLES)


def today():
    return datetime.now(timezone(timedelta(hours=8))).date()


def stamp():
    return datetime.now(timezone(timedelta(hours=8))).strftime('%Y-%m-%d %H:%M:%S')


def accounts():
    rows = deps.fetch_db_rows("SELECT username, full_name, role FROM users WHERE role IN ('教職員','管理員','處室承辦','科助','住宿管理員')")
    source = rows if rows is not None else deps.users
    return [{k: u.get(k, '') for k in ('username', 'full_name', 'role')}
            for u in source if u['role'] in WORK_ROLES]


def assignments():
    # 示範帳號在未連接校務資料庫時預設隸屬教務處；正式帳號由管理員明確設定。
    with store.lock:
        members = store.section('admin_offices', lambda: {'staff1': '教務處', 'dorm_demo': '學生事務處／住宿管理',
                                                        'demo_assistant_cs': '資訊管理科（五專）／科辦公室'}
                                if deps.fetch_db_rows('SELECT username FROM users LIMIT 1') is None else {})
        if members.get('demo_dorm') == '學生事務處／住宿管理' or members.get('dorm_demo') == '學生事務處':
            members.pop('demo_dorm', None)
            members['dorm_demo'] = '學生事務處／住宿管理'
            store.save()
        return members


def assistant_departments():
    return store.section('admin_assistant_departments',
                         lambda: {'demo_assistant_cs': 'CS'}
                         if deps.fetch_db_rows('SELECT username FROM users LIMIT 1') is None else {})


def cases():
    return admin_case_store.all_cases()


def case_notifications():
    return store.section('admin_case_notifications', list)


def queue_case_notification(item, event):
    """Idempotent in-app event; email is an optional secondary channel."""
    key = f"{item['id']}:{item['revision']}:{event}"
    with store.lock:
        if any(row['key'] == key for row in case_notifications()):
            return False
        title = '行政案件需要補件' if event == 'supplement' else '行政案件補件期限提醒'
        body = ('請補齊：' + '、'.join(item.get('requirements', [])) + '。'
                + '期限：' + item['due_date'] + '。請登入「我的申辦進度」處理。')
        case_notifications().append({'key': key, 'case_id': item['id'], 'recipient': item['applicant_username'],
                                     'student_id': item.get('student_id'), 'title': title, 'body': body,
                                     'due_date': item['due_date'], 'created_at': stamp(), 'read_at': None})
        store.save()
    if os.getenv('SMTP_HOST') and item.get('student_id'):
        try:
            from attendance.notify import campus_email, get_mailer
            get_mailer().send(campus_email(item['student_id']), title,
                              '您有一件行政申請需要補件；請登入校務系統查看清單與期限。')
        except Exception:
            current_app.logger.exception('補件提醒電子郵件寄送失敗；站內通知已保留')
    return True


def dispatch_due_case_reminders():
    """Called by the background worker and on inbox reads; each revision sends once."""
    now = today()
    sent = 0
    for item in cases():
        if item.get('status') != '待補件':
            continue
        try:
            days = (date.fromisoformat(item['due_date']) - now).days
        except (KeyError, ValueError):
            continue
        if days <= 1 and queue_case_notification(item, 'due'):
            sent += 1
    return sent


_reminder_worker_started = False
_reminder_worker_lock = threading.Lock()


def start_reminder_worker(app):
    global _reminder_worker_started
    with _reminder_worker_lock:
        if _reminder_worker_started:
            return
        _reminder_worker_started = True
    def run():
        while True:
            threading.Event().wait(300)
            try:
                with app.app_context():
                    dispatch_due_case_reminders()
            except Exception:
                app.logger.exception('行政案件補件提醒排程失敗')
    threading.Thread(target=run, name='case-reminders', daemon=True).start()


def offices():
    return store.section('admin_office_catalog', lambda: list(OFFICES))


def workflows():
    # 新增的示範流程也要出現在已有處室設定的安裝中；保留管理員編修過的版本。
    return {**catalog.defaults(), **store.section('admin_workflows', catalog.defaults)}


def owns(item, user=None):
    u = user or current_user()
    return (item.get('applicant_username') == u['username'] if item.get('applicant_username')
            else u['role'] == '學生' and item['student_id'] == u['student_id'])


def can_manage(item, user=None):
    u = user or current_user()
    if u['role'] == '住宿管理員':
        return (catalog.canonical(assignments().get(u['username'])) == '學生事務處／住宿管理'
                and catalog.canonical(item['office']) == '學生事務處／住宿管理')
    return u['role'] == '管理員' or (u['role'] in WORK_ROLES and
        catalog.canonical(assignments().get(u['username'])) == catalog.canonical(item['office']))


def is_dorm_staff(user=None):
    u = user or current_user()
    return ((u['role'] == '住宿管理員' and catalog.canonical(assignments().get(u['username'])) == '學生事務處／住宿管理') or
            (u['role'] == '教職員' and bool(u.get('can_manage_dorm'))
             and catalog.canonical(assignments().get(u['username'])) == '學生事務處／住宿管理'))


def visible(item, user=None):
    u = user or current_user()
    return owns(item, u) or can_manage(item, u)


def payload(item):
    result = deepcopy(item)
    result['certificate'] = demo_signoff.summary(item)
    result['certificate_versions'] = [{'serial':v['certificate']['manifest']['serial'],'version':v['certificate']['manifest']['version'],'issued_at':v['certificate']['manifest']['issued_at'],'verification_path':v['certificate']['manifest']['verification_path'],'superseded_at':v['superseded_at']} for v in item.get('certificate_versions',[])]
    result['signoff_required'] = demo_signoff.supported(item)
    result['review_digest'] = demo_signoff.review_digest(item) if result['signoff_required'] else None
    for record in result.get('signoffs', []):
        record.pop('snapshot', None)
    result['overdue'] = item['status'] in ACTIVE and item['due_date'] < today().isoformat()
    result['office'] = catalog.canonical(item['office'])
    result['can_act'] = can_manage(item)
    result['is_owner'] = owns(item)
    result['workflow'] = deepcopy(item.get('workflow', []))
    result['workflow_index'] = item.get('workflow_index', 0)
    workflow = result['workflow']
    index = result['workflow_index']
    step = workflow[index] if 0 <= index < len(workflow) else None
    upcoming = workflow[index + 1] if 0 <= index + 1 < len(workflow) else None
    state = item['status']
    if state == '待補件':
        next_action = '請依補件清單補齊資料，填寫補件說明後重新送審。' if result['is_owner'] else '等待申請人補齊資料並重新送審。'
        responsible = '申請人'
    elif state in ('待受理', '重新送審'):
        next_action = '請受理案件並確認申請資料。' if result['can_act'] else '等待承辦單位受理，目前無須重複送件。'
        responsible = result['office']
    elif state == '處理中':
        next_action = ('完成目前步驟後，送交「' + upcoming['name'] + '」（' + catalog.canonical(upcoming['office']) + '）。') if upcoming else '完成目前步驟檢核後，由承辦人登錄結果並結案。'
        responsible = result['office']
    elif state == '已完成':
        next_action, responsible = ('案件已完成，可下載示範證明並驗證核發狀態。' if result['certificate'] else '案件已完成，可查看處理紀錄與結案結果。'), '已結案'
    elif state == '已退件':
        next_action, responsible = '請查看處理紀錄中的退件原因；如有疑問，洽原承辦單位。', '已結案'
    else:
        next_action, responsible = '請洽承辦單位確認後續處理。', result['office']
    result['progress'] = {'current_office': result['office'], 'current_step': step['name'] if step else state,
                          'responsible': responsible, 'next_action': next_action,
                          'requires_supplement': state == '待補件',
                          'supplement_items': list(item.get('requirements', [])) if state == '待補件' else [],
                          'due_date': item.get('due_date'), 'deadline_kind': '補件期限' if state == '待補件' else '案件處理期限'}
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


def validate_workflow(name, spec, unit_names):
    if not isinstance(name, str) or not name.strip() or len(name) > 60 or not isinstance(spec, dict):
        raise ValueError('請填寫有效的申辦流程名稱')
    if spec.get('office') not in unit_names:
        raise ValueError('流程所屬處室不存在')
    for field, limit in [('fields', 15), ('documents', 15)]:
        values = spec.get(field, [])
        if not isinstance(values, list) or len(values) > limit or any(
                not isinstance(v, str) or not v.strip() or len(v) > 150 for v in values) or len(set(values)) != len(values):
            raise ValueError('必要欄位與應備文件最多各 15 項，不可空白或重複')
    steps = spec.get('steps')
    if not isinstance(steps, list) or not 1 <= len(steps) <= 12:
        raise ValueError('每個流程需有 1 至 12 個步驟')
    for step in steps:
        if not isinstance(step, dict) or not isinstance(step.get('name'), str) or not step['name'].strip() or len(step['name']) > 80 or step.get('office') not in unit_names:
            raise ValueError('每一步驟需有名稱與承辦處室')
        checks = step.get('checks')
        if not isinstance(checks, list) or not 1 <= len(checks) <= 15 or any(not isinstance(v, str) or not v.strip() or len(v) > 150 for v in checks) or len(set(checks)) != len(checks):
            raise ValueError('每一步驟需有 1 至 15 項不重複的檢核事項')
    if steps[0]['office'] != spec['office']:
        raise ValueError('第一個步驟的承辦處室須與流程所屬處室一致')
    if type(spec.get('days')) is not int or not 1 <= spec['days'] <= 90:
        raise ValueError('辦理天數須為 1 至 90 天')
    roles = spec.get('roles')
    if not isinstance(roles, list) or not roles or any(r not in ACCESS_ROLES for r in roles):
        raise ValueError('請選擇可提出申請的身分')
    return {k: deepcopy(spec.get(k, [])) for k in ('office', 'fields', 'documents', 'steps', 'days', 'roles')} | {'is_demo': True}


@bp.route('/admin-workbench')
@require(*ACCESS_ROLES)
def page():
    if request.args.get('embedded') != '1':
        kind = request.args.get('kind', '').strip()
        return redirect('/' + ('?kind=' + quote(kind) if kind else '') + '#admin-cases')
    return current_app.send_static_file('admin-workbench.html')


@bp.route('/api/campus/admin-cases/config', methods=['GET', 'PUT'])
@require(*ACCESS_ROLES)
def config():
    u = current_user()
    if request.method == 'PUT':
        if u['role'] != '管理員':
            return error('僅管理員可設定處室分工', 403)
        data = request.get_json(silent=True)
        with store.lock:
            if not isinstance(data, dict):
                return error('請提供有效設定')
            unit_names = data.get('offices', list(offices()))
            if not isinstance(unit_names, list) or not 1 <= len(unit_names) <= 80 or any(not isinstance(v, str) or not v.strip() or len(v) > 50 for v in unit_names) or len(set(unit_names)) != len(unit_names):
                return error('處室名稱不可重複或空白，最多 80 個處室')
            members = data.get('members', deepcopy(assignments()))
            names = {a['username'] for a in accounts()}
            if not isinstance(members, dict) or any(k not in names or catalog.canonical(v) not in unit_names for k, v in members.items()):
                return error('請使用現有行政帳號與有效處室')
            dorm_names = {a['username'] for a in accounts() if a['role'] == '住宿管理員'}
            if any(name in members and catalog.canonical(members[name]) != '學生事務處／住宿管理' for name in dorm_names):
                return error('住宿管理員只能指派到住宿管理單位')
            configured = deepcopy(workflows())
            assistant_depts = data.get('assistant_departments', deepcopy(assistant_departments()))
            department_ids = {d['dept_id'] for d in deps.departments}
            assistant_names = {a['username'] for a in accounts() if a['role'] == '科助'}
            if not isinstance(assistant_depts, dict) or any(k not in assistant_names or v not in department_ids for k,v in assistant_depts.items()):
                return error('科助帳號必須設定有效的科系')
            if 'workflow' in data:
                try:
                    name = data.get('workflow_name')
                    configured[name] = validate_workflow(name, data['workflow'], unit_names)
                except (ValueError, TypeError) as exc:
                    return error(str(exc))
            referenced = {catalog.canonical(c['office']) for c in cases()}
            referenced.update(s['office'] for c in cases() for s in c.get('workflow', []))
            referenced.update(s['office'] for w in configured.values() for s in w['steps'])
            if not referenced.issubset(set(unit_names)):
                return error('仍有案件或流程使用該處室，無法移除')
            before = {'members': deepcopy(assignments()), 'offices': list(offices())}
            store.data['admin_offices'] = {k: catalog.canonical(v) for k, v in members.items()}
            store.data['admin_office_catalog'] = list(unit_names)
            store.data['admin_workflows'] = configured
            store.data['admin_assistant_departments'] = dict(assistant_depts)
            store.save()
            deps.write_audit_log('admin_offices', 'configuration', '修改', before=before, after=data)
    with store.lock:
        members = {k: catalog.canonical(v) for k, v in assignments().items()}
        configured = deepcopy(workflows())
    people = accounts() if u['role'] in WORK_ROLES else []
    if u['role'] in WORK_ROLES and u['role'] != '管理員':
        people = [a for a in people if members.get(a['username']) == members.get(u['username'])
                  and members.get(u['username'])]
    return ok(offices=list(offices()), kinds={k: v['office'] for k, v in configured.items()}, workflows=configured,
              source=catalog.SOURCE, demo_accounts=catalog.demo_accounts(), office=members.get(u['username']),
              assistant_departments=deepcopy(assistant_departments()) if u['role']=='管理員' else {},
              departments=deps.departments,
              members=members if u['role'] == '管理員' else {a['username']: members.get(a['username']) for a in people},
              accounts=people)


@bp.route('/api/campus/admin-cases/route-preview', methods=['POST'])
@require(*ACCESS_ROLES)
def route_preview():
    data = request.get_json(silent=True) or {}
    title, detail = text(data, 'title', 100), text(data, 'detail', 4000)
    return ok(data=predict_route(title, detail, workflows(), current_user()['role'], current_user().get('dept_id')))


@bp.route('/api/campus/admin-cases/notifications')
@require(*ACCESS_ROLES)
def notifications():
    dispatch_due_case_reminders()
    username = current_user()['username']
    with store.lock:
        rows = [deepcopy(row) for row in case_notifications() if row['recipient'] == username]
    return ok(data=sorted(rows, key=lambda row: row['created_at'], reverse=True))


@bp.route('/api/campus/admin-cases', methods=['GET', 'POST'])
@require(*ACCESS_ROLES)
def collection():
    u = current_user()
    if request.method == 'POST':
        try:
            data = form_data()
            title, detail, kind = text(data, 'title', 100), text(data, 'detail', 4000), text(data, 'kind', 60)
            prediction = predict_route(title, detail, workflows(), u['role'], u.get('dept_id'))
            if not kind and prediction['kind']:
                kind = prediction['kind']
            spec = deepcopy(workflows().get(kind))
            if not title or not detail or (not spec and kind not in KINDS):
                return error('請填寫案件標題、申請說明並選擇類別')
            if u['role'] not in (spec['roles'] if spec else ['學生']):
                return error('此申辦類型不適用目前身分', 403)
            if spec and u['role'] == '學生':
                target_dept = next((code for code,name in catalog.DEPARTMENTS if spec['office'] == name+'／科辦公室'), None)
                if target_dept and u.get('dept_id') != target_dept:
                    return error('科務申辦僅限所屬科系學生提出', 403)
            answers = data.get('answers', {})
            if isinstance(answers, str):
                import json
                answers = json.loads(answers)
            if not isinstance(answers, dict):
                return error('申請欄位格式錯誤')
            required = spec['fields'] if spec else []
            answers = {key: text(answers, key, 1000) for key in required}
            if any(not value for value in answers.values()):
                return error('請填齊此處室流程的必要欄位')
            if kind in ('請假申請', '場地借用'):
                try:
                    start_day = date.fromisoformat(answers.get('開始日期', ''))
                    end_day = date.fromisoformat(answers.get('結束日期', ''))
                except ValueError:
                    return error('請填寫正確的開始與結束日期')
                if end_day < start_day:
                    return error('結束日期不可早於開始日期')
            if kind == '成績單申請':
                copies = answers.get('申請份數', '')
                if not copies.isascii() or not copies.isdigit() or not 1 <= int(copies) <= 20:
                    return error('成績單申請份數須為 1 至 20 份')
            uploads = read_uploads()
            auto_missing = (u['role'] == '學生' and kind.endswith('資料收件')
                            and '證照' in answers.get('資料類別（實習／證照／其他）', '') and not uploads)
        except ValueError as exc:
            return error(str(exc))
        with store.lock:
            office = spec['office'] if spec else KINDS[kind]
            eligible = [name for name, assigned in assignments().items()
                        if catalog.canonical(assigned) == catalog.canonical(office)
                        and any(account['username'] == name for account in accounts())]
            auto_assignee = eligible[0] if len(eligible) == 1 else ''
            item = {'id': 0, 'student_id': u['student_id'], 'student_name': u['full_name'],
                    'title': title, 'detail': detail, 'kind': kind, 'office': office, 'assignee': auto_assignee,
                    'route_prediction': prediction if prediction['kind'] == kind else None,
                    'applicant_username': u['username'], 'applicant_role': u['role'], 'answers': answers,
                    'workflow': deepcopy(spec['steps']) if spec else [], 'workflow_index': 0,
                    'workflow_days': spec['days'] if spec else 7, 'is_demo_workflow': bool(spec and spec.get('is_demo')),
                    'documents': deepcopy(spec['documents']) if spec else [],
                    'status': '待補件' if auto_missing else '待受理',
                    'due_date': (today() + timedelta(days=3 if auto_missing else spec['days'] if spec else 7)).isoformat(),
                    'created_at': stamp(), 'updated_at': stamp(), 'revision': 0,
                    'requirements': ['證照正本照片或 PDF'] if auto_missing else [],
                    'supplements': [], 'history': [], 'files': []}
            save_files(item, uploads)
            history(item, '送出申請', note=('智慧分類：' + prediction['reason'] if prediction['kind'] == kind else '') +
                    ('；自動指派：' + auto_assignee if auto_assignee else ''))
            admin_case_store.insert(item)
            if auto_missing:
                queue_case_notification(item, 'supplement')
        return ok(data=payload(item), message='已建立案件；請於 3 日內補上證照照片或 PDF' if auto_missing else '申請已送交承辦處室')
    with store.lock:
        rows = [payload(c) for c in cases() if visible(c)]
    rows.sort(key=lambda c: (c['status'] not in ACTIVE, not c['overdue'], c['due_date'], c['id']))
    return ok(data=rows, counts={s: sum(c['status'] == s for c in rows) for s in (*ACTIVE, '已完成', '已退件')})


@bp.route('/api/campus/admin-cases/<int:case_id>', methods=['GET', 'POST'])
@require(*ACCESS_ROLES)
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
            applicant = owns(item)
            if not can_manage(item) and action != 'resubmit':
                return error('僅承辦處室可辦理案件', 403)
            if item['status'] not in ACTIVE:
                return error('案件已結案，無法再次修改', 409)
            before = deepcopy(item)
            updated = deepcopy(item)
            if action == 'resubmit':
                if not applicant or item['status'] != '待補件':
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
                updated['due_date'] = (today() + timedelta(days=item.get('workflow_days', 7))).isoformat()
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
                office = catalog.canonical(office)
                if office not in offices() or not note:
                    return error('請選擇處室並填寫分派／轉交說明')
                if assignee and (catalog.canonical(assignments().get(assignee)) != office or assignee not in {a['username'] for a in accounts()}):
                    return error('承辦人必須屬於指定處室')
                updated.update(office=office, assignee=assignee)
                label = '分派／轉交案件'
            elif action in ('advance', 'complete', 'reject'):
                if item['status'] != '處理中' or not note:
                    return error('請先受理案件並填寫辦理結果', 409)
                steps = item.get('workflow', [])
                index = item.get('workflow_index', 0)
                if action != 'reject' and steps:
                    checked = data.get('checked_steps', [])
                    if not isinstance(checked, list) or set(checked) != set(steps[index]['checks']):
                        return error('請完成本步驟的全部檢核事項')
                    if action == 'complete' and index < len(steps) - 1:
                        return error('尚有後續步驟，不可直接結案', 409)
                if action == 'advance':
                    if not steps or index >= len(steps) - 1:
                        return error('已是最後步驟，請使用完成結案', 409)
                    updated.update(workflow_index=index + 1, office=steps[index + 1]['office'],
                                   status='待受理', assignee='',
                                   due_date=(today() + timedelta(days=item.get('workflow_days', 7))).isoformat())
                    label = '完成步驟：' + steps[index]['name']
                    note += '\n下一步：' + steps[index + 1]['name'] + '（' + steps[index + 1]['office'] + '）'
                else:
                    updated['status'] = '已完成' if action == 'complete' else '已退件'
                    label = '完成案件' if action == 'complete' else '退件結案'
            else:
                return error('不支援的操作')
            if action in ('advance', 'complete') and demo_signoff.supported(item):
                demo_signoff.approve(before, updated, data, note)
            history(updated, label, note)
            if action == 'complete' and demo_signoff.supported(updated):
                demo_signoff.issue(updated)
            if not admin_case_store.update(updated, before['revision']):
                return error('案件已由其他人更新，請重新整理後再操作', 409)
            if action == 'supplement':
                queue_case_notification(updated, 'supplement')
            deps.write_audit_log('admin_cases', case_id, label, before=before, after=updated)
            return ok(data=payload(updated), message=label + '成功')
        except (ValueError, TypeError) as exc:
            return error(str(exc) if isinstance(exc, ValueError) else '表單格式錯誤')


@bp.route('/api/campus/admin-cases/<int:case_id>/files/<file_id>')
@require(*ACCESS_ROLES)
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


@bp.route('/api/campus/assistant/students', methods=['GET'])
@require('科助', '管理員')
def assistant_students():
    from .common import all_students
    u = current_user()
    code = (request.args.get('dept_id') if u['role'] == '管理員'
            else assistant_departments().get(u['username']))
    if not code or code not in {d['dept_id'] for d in deps.departments}:
        return error('此科助帳號尚未設定所屬科系', 403)
    if u['role'] == '科助' and request.args.get('dept_id', code) != code:
        return error('只能查看自己科系的學生名單', 403)
    fields = ('student_id', 'full_name', 'class_name', 'dept_id')
    return ok(dept_id=code, data=[{key:s.get(key,'') for key in fields} for s in all_students() if s.get('dept_id') == code])
