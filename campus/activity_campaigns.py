"""可由老師／行政人員自行建立的班級或課程活動、意願回覆及附件。"""
import csv
import qrcode
from qrcode.image.svg import SvgPathFillImage
from datetime import date, datetime
from io import BytesIO
from io import StringIO
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, redirect, request, send_file
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from .common import STAFF_ROLES, all_students, current_user, deps, error, next_id, now_str, ok, require, store
from . import messaging

bp = Blueprint('activity_campaigns', __name__)
EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx', '.txt'}
MAX_FILE = 10 * 1024 * 1024


def campaigns():
    return store.section('activity_campaigns', list)


def replies():
    return store.section('activity_campaign_replies', list)


def approvals():
    return store.section('activity_campaign_approvals', list)


def visitor_replies():
    return store.section('activity_campaign_visitor_replies', list)


def participants(item):
    return [r for r in replies() if r['campaign_id'] == item['id']] + [
        r for r in visitor_replies() if r['campaign_id'] == item['id']]


def answer_status(item, answer):
    if answer['intention'] != '參加':
        return answer['intention']
    if item.get('fee_mode') == '付費':
        return '待繳費' if answer.get('seat_status') == '正取' else '候補'
    return answer.get('seat_status', '正取')


def promote(item):
    rows = participants(item)
    confirmed = sum(r['intention'] == '參加' and r.get('seat_status', '正取') == '正取' for r in rows)
    waiting = sorted((r for r in rows if r['intention'] == '參加' and r.get('seat_status') == '候補'),
                     key=lambda r: (r.get('joined_at', r['updated_at']), r.get('visitor_key') or r.get('student_id')))
    promoted = []
    while waiting and (not item.get('capacity') or confirmed < item['capacity']):
        row = waiting.pop(0)
        row['seat_status'] = '正取'
        row['updated_at'] = now_str()
        promoted.append(row.get('student_id') or row.get('visitor_key'))
        confirmed += 1
    return promoted


def root():
    return Path(store.path).parent / 'activity_campaign_files'


def read_file(field):
    uploaded = request.files.get(field)
    if not uploaded or not uploaded.filename:
        return None
    name = uploaded.filename.replace('\\', '/').split('/')[-1][:150]
    if Path(name).suffix.lower() not in EXTENSIONS:
        raise ValueError('附件僅支援 PDF、圖片、DOCX、XLSX、TXT')
    content = uploaded.read(MAX_FILE + 1)
    if not content or len(content) > MAX_FILE:
        raise ValueError('附件不可為空，且每個檔案最多 10 MB')
    return {'id': uuid4().hex, 'name': name, 'size': len(content)}, content


def save_file(file):
    if file:
        root().mkdir(parents=True, exist_ok=True)
        (root() / file[0]['id']).write_bytes(file[1])
        return file[0]
    return None


def assistant_student_ids(user):
    """科助僅可通知所屬科系；未設定科系時不授權。"""
    if user['role'] != '科助':
        return None
    from .admin_cases import assistant_departments, assignments
    from .office_catalog import canonical, DEPARTMENTS
    code = assistant_departments().get(user['username'])
    name = next((name for key, name in DEPARTMENTS if key == code), None)
    if not name or canonical(assignments().get(user['username'])) != name + '／科辦公室':
        return set()
    return {s['student_id'] for s in all_students() if s.get('dept_id') == code}


def visible(item, user):
    return user['role'] in STAFF_ROLES and (user['role'] in ('教職員', '管理員') or item['created_by'] == user['username']) \
        or user['role'] == '學生' and user['student_id'] in item['recipients'] \
        or user['role'] == '訪客' and item.get('visitor_allowed', False)


def manager(item, user):
    return user['role'] in ('教職員', '管理員') or user['role'] in ('老師', '處室承辦', '科助') and item['created_by'] == user['username']


def view(item, user):
    data = {k: v for k, v in item.items() if k != 'recipients'}
    data['recipient_count'] = len(item['recipients'])
    rows = participants(item)
    data['reply_count'] = len(rows)
    data['student_reply_count'] = sum(r['campaign_id'] == item['id'] for r in replies())
    data['visitor_count'] = sum(r['intention'] == '參加' for r in visitor_replies()
                                if r['campaign_id'] == item['id'])
    data['confirmed_count'] = sum(r['intention'] == '參加' and r.get('seat_status', '正取') == '正取' for r in rows)
    data['waitlist_count'] = sum(r['intention'] == '參加' and r.get('seat_status') == '候補' for r in rows)
    data['approval_count'] = sum(a['campaign_id'] == item['id'] and a['status'] == '待審核'
                                 for a in approvals()) if manager(item, user) else 0
    if manager(item, user):
        related = [a for a in approvals() if a['campaign_id'] == item['id']]
        data['approval_summary'] = {'unopened': sum(a['status'] == '待審核' and not a['opened_at'] for a in related),
                                    'opened_pending': sum(a['status'] == '待審核' and bool(a['opened_at']) for a in related),
                                    'approved': sum(a['status'] == '核准' for a in related),
                                    'returned': sum(a['status'] == '退回' for a in related)}
        data['payment_summary'] = {'mode': item.get('fee_mode', '免費'), 'amount': item.get('fee_amount', 0),
                                   'paid_count': 0, 'unpaid_count': 0,
                                   'integration_status': '待串接金流' if item.get('fee_mode') == '付費' else '不需收費'}
    if user['role'] == '學生':
        answer = next((r for r in replies() if r['campaign_id'] == item['id'] and r['student_id'] == user['student_id']), None)
        data['my_reply'] = {**answer, 'status': answer_status(item, answer)} if answer else None
    elif user['role'] == '訪客':
        answer = next((r for r in visitor_replies() if r['campaign_id'] == item['id']
                       and r['visitor_key'] == user['username']), None)
        data['my_reply'] = {**answer, 'status': answer_status(item, answer)} if answer else None
    return data


@bp.route('/activities')
def page():
    query = request.query_string.decode('utf-8')
    return redirect('/' + ('?' + query if query else '') + '#activities')


@bp.route('/api/campus/activity-campaigns', methods=['GET'])
@require('學生', '訪客', *STAFF_ROLES)
def list_campaigns():
    user = current_user()
    return ok(data=[view(c, user) for c in campaigns() if visible(c, user)])


@bp.route('/api/campus/activity-campaigns/targets')
@require(*STAFF_ROLES)
def targets():
    user = current_user()
    students = all_students()
    allowed_ids = assistant_student_ids(user)
    if user['role'] == '老師':
        names = [user['advised_class']] if user.get('advised_class') else []
    elif allowed_ids is not None:
        names = sorted({s['class_name'] for s in students if s['student_id'] in allowed_ids and s.get('class_name')})
    else:
        names = sorted({s['class_name'] for s in students if s.get('class_name')})
    courses = messaging.visible_courses(user)
    if allowed_ids is not None:
        courses = {name: info for name, info in messaging.course_table().items()
                   if set(messaging.course_recipients(info)) and set(messaging.course_recipients(info)) <= allowed_ids}
    return ok(data={'classes': [{'name': name, 'count': sum(s.get('class_name') == name for s in students)} for name in names],
                    'courses': [{'name': name, 'count': len(messaging.course_recipients(info))} for name, info in courses.items()]})


@bp.route('/api/campus/activity-campaigns', methods=['POST'])
@require(*STAFF_ROLES)
def create_campaign():
    user = current_user()
    title = request.form.get('title', '').strip()[:100]
    kind = request.form.get('kind', '活動')
    description = request.form.get('description', '').strip()[:2000]
    target_type = request.form.get('target_type', '')
    target = request.form.get('target', '').strip()
    event_date = request.form.get('event_date', '')
    event_time = request.form.get('event_time', '')
    location = request.form.get('location', '').strip()[:100] or '待公告'
    visitor_allowed = request.form.get('visitor_allowed') == 'on'
    deadline = request.form.get('reply_deadline', '')
    excluded = {part.strip().upper() for part in request.form.get('excluded_student_ids', '').replace('，', ',').split(',') if part.strip()}
    if any(len(sid) > 20 for sid in excluded) or len(excluded) > 100:
        return error('排除名單最多 100 筆，每筆學號最多 20 字')
    fee_mode = request.form.get('fee_mode', '免費')
    try:
        fee_amount = int(request.form.get('fee_amount', '0') or 0)
        capacity = int(request.form.get('capacity', '0') or 0)
        grade = int(request.form.get('grade', '0') or 0)
    except ValueError:
        return error('費用、名額與年級須為數字')
    if fee_mode not in ('免費', '付費') or fee_amount < 0 or capacity < 0 or grade < 0 or grade > 7:
        return error('收費與資格設定不正確')
    if fee_mode == '付費' and fee_amount == 0:
        return error('付費活動須設定金額')
    if not title or not description or not location or kind not in ('活動', '比賽') or target_type not in ('班級', '課程'):
        return error('請填活動名稱、地點、說明及對象')
    try:
        event_day = date.fromisoformat(event_date)
        deadline_day = date.fromisoformat(deadline)
        datetime.strptime(event_time, '%H:%M')
    except ValueError:
        return error('請填正確的活動日期、時間與回覆期限')
    if deadline_day > event_day or event_day < date.today():
        return error('回覆期限不可晚於活動日，活動日不可早於今天')
    assistant_ids = assistant_student_ids(user)
    if target_type == '班級':
        allowed = user['role'] in ('教職員', '管理員', '處室承辦') or target == user.get('advised_class') or assistant_ids is not None
        recipients = sorted(s['student_id'] for s in all_students() if s.get('class_name') == target) if allowed else []
    else:
        info = (messaging.course_table() if assistant_ids is not None else messaging.visible_courses(user)).get(target)
        allowed = info is not None
        recipients = messaging.course_recipients(info) if info else []
    if assistant_ids is not None and not set(recipients) <= assistant_ids:
        return error('科助只能通知所屬科系學生', 403)
    if not allowed:
        return error('沒有權限建立此班級或課程的活動', 403)
    if not recipients:
        return error('此對象沒有可通知的學生')
    if grade:
        numeral = '一二三四五六七'[grade - 1]
        recipients = [sid for sid in recipients if any(s['student_id'] == sid and numeral in s.get('class_name', '')
                                                      for s in all_students())]
        if not recipients:
            return error('此年級沒有可通知的學生')
    recipients = [sid for sid in recipients if sid not in excluded]
    if not recipients:
        return error('資格限制後沒有可通知的學生')
    try:
        attachment = read_file('attachment')
    except ValueError as exc:
        return error(str(exc))
    with store.lock:
        file_meta = save_file(attachment)
        items = campaigns()
        item = {'id': next_id(items), 'kind': kind, 'title': title, 'description': description,
                'target_type': target_type, 'target': target, 'recipients': recipients,
                'event_date': event_date, 'event_time': event_time, 'location': location,
                'visitor_allowed': visitor_allowed, 'reply_deadline': deadline,
                'capacity': capacity, 'grade': grade, 'fee_mode': fee_mode, 'fee_amount': fee_amount,
                'excluded_student_ids': sorted(excluded),
                'payment_status': '待串接金流' if fee_mode == '付費' else '不需收費',
                'attachment': file_meta, 'created_by': user['username'], 'created_at': now_str()}
        items.append(item)
        store.save()
    deps.write_audit_log('activity_campaigns', item['id'], '新增', after={'title': title, 'target': target, 'reply_deadline': deadline})
    return ok(data=view(item, user), message='活動已建立')


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/broadcast', methods=['POST'])
@require(*STAFF_ROLES)
def broadcast(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item:
        return error('找不到活動', 404)
    if not manager(item, user):
        return error('無權發送此活動', 403)
    notice = messaging.add_notice({'class_name': item['target'] if item['target_type'] == '班級' else None,
        'target_type': item['target_type'], 'target_label': item['target'], 'whole_class': True,
        'recipients': item['recipients'], 'title': f"活動報名：{item['title']}",
        'content': f"{item['description']}\n活動：{item['event_date']} {item['event_time']}\n回覆期限：{item['reply_deadline']}\n前往活動頁：/#activities",
        'priority': '重要', 'sender': user['full_name'], 'sender_username': user['username'],
        'due_date': item['reply_deadline'], 'reply_required': False})
    deps.write_audit_log('activity_campaigns', campaign_id, '廣播', after={'notice_id': notice['id']})
    return ok(message=f"已通知 {len(item['recipients'])} 位學生", notice_id=notice['id'])


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/reply', methods=['POST'])
@require('學生')
def reply(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id and user['student_id'] in c['recipients']), None)
    if not item:
        return error('找不到可回覆的活動', 404)
    if date.today().isoformat() > item['reply_deadline']:
        return error('回覆期限已過')
    intention = request.form.get('intention')
    if intention not in ('參加', '不參加', '考慮中'):
        return error('請選擇參加意願')
    if intention == '參加' and item.get('fee_mode') == '付費':
        return error('付費報名尚待學校金流服務串接，目前無法收款或保留名額', 503)
    try:
        uploaded = read_file('file')
    except ValueError as exc:
        return error(str(exc))
    with store.lock:
        existing = next((r for r in replies() if r['campaign_id'] == campaign_id and r['student_id'] == user['student_id']), None)
        prior_seat = existing.get('seat_status', '正取') if existing and existing['intention'] == '參加' else None
        if intention == '參加':
            if prior_seat:
                seat = prior_seat
            else:
                occupied = sum(r['intention'] == '參加' and r.get('seat_status', '正取') == '正取'
                               for r in participants(item))
                seat = '候補' if item.get('capacity') and occupied >= item['capacity'] else '正取'
        else:
            seat = None
        file_meta = save_file(uploaded) if uploaded else (existing['file'] if existing else None)
        data = {'campaign_id': campaign_id, 'student_id': user['student_id'], 'student_name': user['full_name'],
                'intention': intention, 'note': request.form.get('note', '').strip()[:500],
                'file': file_meta, 'seat_status': seat, 'checked_in_at': existing.get('checked_in_at') if existing and seat == '正取' else None,
                'joined_at': existing.get('joined_at', now_str()) if existing else now_str(), 'updated_at': now_str()}
        if existing:
            existing.update(data)
        else:
            replies().append(data)
        promoted = promote(item) if prior_seat == '正取' and seat != '正取' else []
        store.save()
    deps.write_audit_log('activity_campaign_replies', f"{campaign_id}:{user['student_id']}", '修改' if existing else '新增',
                         after={'intention': intention, 'file': bool(file_meta)})
    return ok(message='已儲存回覆' + ('，並已遞補下一位候補' if promoted else ''),
              data={**data, 'status': answer_status(item, data)}, promoted=promoted)


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/visitor-register', methods=['POST'])
@require('訪客')
def visitor_register(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id and c.get('visitor_allowed')), None)
    if not item:
        return error('此活動未開放訪客報名', 404)
    if date.today().isoformat() > item['reply_deadline']:
        return error('報名已截止')
    if item.get('fee_mode') == '付費':
        return error('付費報名尚待學校金流服務串接，目前無法收款或保留名額', 503)
    with store.lock:
        if any(r['campaign_id'] == campaign_id and r['visitor_key'] == user['username']
               and r['intention'] == '參加' for r in visitor_replies()):
            return error('您已報名此活動', 409)
        occupied = sum(r['intention'] == '參加' and r.get('seat_status', '正取') == '正取'
                       for r in participants(item))
        row = {'campaign_id': campaign_id, 'visitor_key': user['username'],
               'visitor_name': user['full_name'], 'intention': '參加',
               'seat_status': '候補' if item.get('capacity') and occupied >= item['capacity'] else '正取',
               'checked_in_at': None, 'joined_at': now_str(), 'updated_at': now_str()}
        existing = next((r for r in visitor_replies() if r['campaign_id'] == campaign_id
                         and r['visitor_key'] == user['username']), None)
        if existing:
            existing.update(row)
        else:
            visitor_replies().append(row)
        store.save()
    return ok(data={**row, 'status': row['seat_status']}, message=f"訪客報名成功：{row['seat_status']}")


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/visitor-cancel', methods=['POST'])
@require('訪客')
def visitor_cancel(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id and c.get('visitor_allowed')), None)
    if not item:
        return error('找不到活動', 404)
    with store.lock:
        row = next((r for r in visitor_replies() if r['campaign_id'] == campaign_id
                    and r['visitor_key'] == user['username'] and r['intention'] == '參加'), None)
        if not row:
            return error('沒有有效報名紀錄', 404)
        had_seat = row['seat_status'] == '正取'
        row.update(intention='不參加', seat_status=None, checked_in_at=None, updated_at=now_str())
        promoted = promote(item) if had_seat else []
        store.save()
    return ok(message='已取消報名', promoted=promoted)


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/replies')
@require(*STAFF_ROLES)
def list_replies(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not manager(item, user):
        return error('找不到可管理的活動', 404)
    answers = [r for r in replies() if r['campaign_id'] == campaign_id]
    names = {s['student_id']: s['full_name'] for s in all_students()}
    rows = [{'student_id': sid, 'student_name': names.get(sid, sid),
             **(next((r for r in answers if r['student_id'] == sid), {}) or {'intention': '未回覆'})}
            for sid in item['recipients']]
    for row in rows:
        row['status'] = answer_status(item, row) if row['intention'] != '未回覆' else '未回覆'
        row['participant_type'] = '學生'
    for answer in visitor_replies():
        if answer['campaign_id'] == campaign_id:
            rows.append({**answer, 'student_id': '', 'student_name': answer['visitor_name'],
                         'participant_type': '訪客', 'status': answer_status(item, answer)})
    return ok(data=rows, counts={v: sum(r['intention'] == v for r in rows)
                                  for v in ('參加', '不參加', '考慮中', '未回覆')})


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/duplicate', methods=['POST'])
@require(*STAFF_ROLES)
def duplicate(campaign_id):
    user = current_user()
    original = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not original or not manager(original, user):
        return error('找不到可複製的活動', 404)
    data = request.get_json(silent=True) or {}
    try:
        event_day = date.fromisoformat(data.get('event_date', ''))
        deadline = date.fromisoformat(data.get('reply_deadline', ''))
    except ValueError:
        return error('請設定新活動日期與回覆期限')
    if event_day < date.today() or deadline > event_day:
        return error('日期或回覆期限不正確')
    with store.lock:
        copy = {**original, 'id': next_id(campaigns()), 'title': str(data.get('title') or original['title']).strip()[:100],
                'event_date': event_day.isoformat(), 'reply_deadline': deadline.isoformat(),
                'created_by': user['username'], 'created_at': now_str()}
        campaigns().append(copy)
        store.save()
    deps.write_audit_log('activity_campaigns', copy['id'], '複製', after={'source_id': campaign_id})
    return ok(data=view(copy, user), message='活動已複製，請確認日期後發送通知')


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/approvals', methods=['GET', 'POST'])
@require(*STAFF_ROLES)
def campaign_approvals(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not manager(item, user):
        return error('找不到可管理的活動', 404)
    if request.method == 'GET':
        return ok(data=[a for a in approvals() if a['campaign_id'] == campaign_id])
    username = (request.get_json(silent=True) or {}).get('teacher_username', '').strip()
    teachers = [u for u in deps.users if u['role'] == '老師' and u['username'] == username]
    if not teachers:
        return error('找不到老師帳號')
    if user['role'] == '科助':
        from .admin_cases import assistant_departments
        if teachers[0].get('dept_id') != assistant_departments().get(user['username']):
            return error('只能請所屬科系老師審核', 403)
    with store.lock:
        if any(a['campaign_id'] == campaign_id and a['teacher_username'] == username for a in approvals()):
            return error('已將此活動送給該老師', 409)
        row = {'id': next_id(approvals()), 'campaign_id': campaign_id, 'teacher_username': username,
               'teacher_name': teachers[0]['full_name'], 'status': '待審核', 'opened_at': None,
               'reviewed_at': None, 'reminded_at': None, 'reminder_count': 0, 'created_at': now_str()}
        approvals().append(row)
        store.save()
    return ok(data=row, message='已加入老師待辦事項')


@bp.route('/api/campus/activity-campaigns/teacher-tasks')
@require('老師')
def teacher_tasks():
    user = current_user()
    with store.lock:
        rows = [a for a in approvals() if a['teacher_username'] == user['username']]
        changed = False
        for row in rows:
            if not row['opened_at']:
                row['opened_at'] = now_str()
                changed = True
        if changed:
            store.save()
    titles = {c['id']: c['title'] for c in campaigns()}
    return ok(data=[{**a, 'title': titles.get(a['campaign_id'], '活動')} for a in rows],
              pending_count=sum(a['status'] == '待審核' for a in rows))


@bp.route('/api/campus/activity-campaigns/teacher-tasks/<int:approval_id>', methods=['POST'])
@require('老師')
def review_task(approval_id):
    user = current_user()
    action = (request.get_json(silent=True) or {}).get('action')
    if action not in ('核准', '退回'):
        return error('請選擇核准或退回')
    with store.lock:
        row = next((a for a in approvals() if a['id'] == approval_id and a['teacher_username'] == user['username']), None)
        if not row:
            return error('找不到待辦事項', 404)
        if row['status'] != '待審核':
            return error('此事項已完成', 409)
        row['status'] = action
        row['reviewed_at'] = now_str()
        store.save()
    return ok(data=row, message='已完成審核')


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/approvals/<int:approval_id>/remind', methods=['POST'])
@require(*STAFF_ROLES)
def remind_teacher(campaign_id, approval_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not manager(item, user):
        return error('找不到可管理的活動', 404)
    with store.lock:
        row = next((a for a in approvals() if a['id'] == approval_id and a['campaign_id'] == campaign_id), None)
        if not row or row['status'] != '待審核':
            return error('找不到待審核老師', 404)
        row['reminder_count'] += 1
        row['reminded_at'] = now_str()
        store.save()
    return ok(data=row, message='已更新老師待辦提醒；外部推播、LINE 與 Email 尚未接入')


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/approvals/remind-pending', methods=['POST'])
@require(*STAFF_ROLES)
def remind_pending_teachers(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not manager(item, user):
        return error('找不到可管理的活動', 404)
    with store.lock:
        rows = [a for a in approvals() if a['campaign_id'] == campaign_id and a['status'] == '待審核']
        for row in rows:
            row['reminder_count'] += 1
            row['reminded_at'] = now_str()
        if rows:
            store.save()
    return ok(count=len(rows), message=f'已更新 {len(rows)} 位老師的站內待辦提醒；外部通知尚未接入')


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/checkin', methods=['POST'])
@require(*STAFF_ROLES)
def checkin(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not manager(item, user):
        return error('找不到可管理的活動', 404)
    sid = (request.get_json(silent=True) or {}).get('student_id', '').strip()
    with store.lock:
        row = next((r for r in replies() if r['campaign_id'] == campaign_id and r['student_id'] == sid), None)
        if not row or row['intention'] != '參加' or row.get('seat_status', '正取') != '正取':
            return error('此學生沒有正取報名紀錄', 404)
        if row.get('checked_in_at'):
            return error('此學生已簽到', 409)
        row['checked_in_at'] = now_str()
        store.save()
    return ok(data=row, message='簽到成功')


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/report.csv')
@require(*STAFF_ROLES)
def report(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not manager(item, user):
        return error('找不到可管理的活動', 404)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['身分', '學號', '姓名', '意願', '名額狀態', '簽到時間', '備註', '回覆時間'])
    answers = {r['student_id']: r for r in replies() if r['campaign_id'] == campaign_id}
    names = {s['student_id']: s['full_name'] for s in all_students()}
    for sid in item['recipients']:
        row = answers.get(sid, {})
        writer.writerow(['學生', sid, names.get(sid, sid), row.get('intention', '未回覆'),
                         answer_status(item, row) if row else '未回覆', row.get('checked_in_at') or '',
                         row.get('note', ''), row.get('updated_at', '')])
    for row in visitor_replies():
        if row['campaign_id'] == campaign_id:
            writer.writerow(['訪客', '', row['visitor_name'], row['intention'], answer_status(item, row),
                             row.get('checked_in_at') or '', '', row['updated_at']])
    response = current_app.response_class('\ufeff' + output.getvalue(), mimetype='text/csv; charset=utf-8')
    response.headers['Content-Disposition'] = f'attachment; filename="activity-{campaign_id}-report.csv"'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/checkin-qr')
@require(*STAFF_ROLES)
def checkin_qr(campaign_id):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not manager(item, user):
        return error('找不到可管理的活動', 404)
    token = URLSafeTimedSerializer(current_app.secret_key, salt='activity-checkin').dumps(campaign_id)
    url = request.url_root.rstrip('/') + f'/?checkin={campaign_id}&token={token}#activities'
    buffer = BytesIO()
    qrcode.make(url, image_factory=SvgPathFillImage).save(buffer)
    buffer.seek(0)
    response = send_file(buffer, mimetype='image/svg+xml')
    response.headers['Cache-Control'] = 'no-store'
    return response


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/self-checkin', methods=['POST'])
@require('學生', '訪客')
def self_checkin(campaign_id):
    user = current_user()
    token = (request.get_json(silent=True) or {}).get('token', '')
    try:
        signed_id = URLSafeTimedSerializer(current_app.secret_key, salt='activity-checkin').loads(token, max_age=600)
    except (BadSignature, SignatureExpired):
        return error('簽到 QR Code 已失效，請現場重新取得', 403)
    if signed_id != campaign_id:
        return error('簽到 QR Code 不屬於此活動', 403)
    with store.lock:
        if user['role'] == '訪客':
            row = next((r for r in visitor_replies() if r['campaign_id'] == campaign_id
                        and r['visitor_key'] == user['username']), None)
        else:
            row = next((r for r in replies() if r['campaign_id'] == campaign_id
                        and r['student_id'] == user['student_id']), None)
        if not row or row['intention'] != '參加' or row.get('seat_status', '正取') != '正取':
            return error('沒有此活動的正取資格', 403)
        if row.get('checked_in_at'):
            return error('已完成簽到', 409)
        row['checked_in_at'] = now_str()
        store.save()
    return ok(message='簽到成功', data=row)


@bp.route('/api/campus/activity-campaigns/<int:campaign_id>/files/<kind>')
@require('學生', '訪客', *STAFF_ROLES)
def download(campaign_id, kind):
    user = current_user()
    item = next((c for c in campaigns() if c['id'] == campaign_id), None)
    if not item or not visible(item, user):
        return error('找不到活動檔案', 404)
    if kind == 'attachment':
        meta = item['attachment']
    elif kind.startswith('reply-'):
        sid = kind[6:]
        if user['role'] == '訪客':
            return error('無權下載', 403)
        if user['role'] == '學生' and sid != user['student_id']:
            return error('無權下載', 403)
        if user['role'] in STAFF_ROLES and not manager(item, user):
            return error('無權下載', 403)
        answer = next((r for r in replies() if r['campaign_id'] == campaign_id and r['student_id'] == sid), None)
        meta = answer['file'] if answer else None
    else:
        return error('找不到活動檔案', 404)
    path = root() / meta['id'] if meta else None
    if not path or not path.is_file():
        return error('檔案不存在', 404)
    response = send_file(BytesIO(path.read_bytes()), as_attachment=True,
                         download_name=meta['name'], mimetype='application/octet-stream')
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
