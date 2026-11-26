"""資訊管理科成果投稿、審核與公開展示。"""
from datetime import date, datetime, timedelta
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, request, send_file
from werkzeug.utils import secure_filename

from .common import current_user, error, find_student, next_id, ok, require, store
from .admin_cases import assistant_departments

bp = Blueprint('achievements', __name__)
KINDS = ('競賽', '證照', '專題', '其他')
EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg'}
MAX_FILE = 10 * 1024 * 1024


def records():
    return store.section('cs_achievements', list)


def now():
    return datetime.now().astimezone().isoformat(timespec='seconds')


def assistant(user):
    if not user or user['role'] != '科助':
        return False
    return assistant_departments().get(user['username']) == 'CS'


def can_submit(user):
    if not user:
        return False
    if user['role'] == '學生':
        student = find_student(user.get('student_id'))
        return bool(student and student.get('dept_id') == 'CS')
    return user['role'] == '老師' and user.get('dept_id') == 'CS'


def public_record(row):
    return {key: row.get(key) for key in ('id', 'kind', 'contest_name', 'award', 'award_date',
            'description', 'published_at', 'updated_at')}


@bp.route('/achievements')
def page():
    return current_app.send_static_file('achievements.html')


@bp.route('/api/campus/achievements', methods=['GET'])
def published():
    year = request.args.get('year', '').strip()
    if year and (not year.isdigit() or len(year) != 4):
        return error('年度格式錯誤')
    with store.lock:
        rows = [public_record(r) for r in records() if r['status'] == '已發布'
                and (not year or r['award_date'].startswith(year))]
        years = sorted({r['award_date'][:4] for r in records() if r['status'] == '已發布'}, reverse=True)
    rows.sort(key=lambda r: (r['award_date'], r['id']), reverse=True)
    return ok(data=rows, years=years)


@bp.route('/api/campus/achievements/mine', methods=['GET'])
@require('學生', '老師')
def mine():
    user = current_user()
    with store.lock:
        return ok(data=[dict(r) for r in records() if r['created_by'] == user['username']])


@bp.route('/api/campus/achievements/review', methods=['GET'])
@require('科助')
def review_list():
    user = current_user()
    if not assistant(user):
        return error('僅限資管科科助', 403)
    with store.lock:
        rows = [dict(r) for r in records()]
    categories = {kind: max((r['updated_at'][:10] for r in rows if r['kind'] == kind and r['status'] == '已發布'), default=None) for kind in KINDS}
    cutoff = (date.today() - timedelta(days=180)).isoformat()
    reminders = [{'kind': kind, 'last_updated': latest} for kind, latest in categories.items() if not latest or latest < cutoff]
    return ok(data=rows, reminders=reminders)


@bp.route('/api/campus/achievements', methods=['POST'])
@require('學生', '老師')
def submit():
    user = current_user()
    if not can_submit(user):
        return error('僅限資管科學生或老師投稿', 403)
    name = str(request.form.get('contest_name') or '').strip()[:120]
    award = str(request.form.get('award') or '').strip()[:120]
    kind = str(request.form.get('kind') or '')
    description = str(request.form.get('description') or '').strip()[:2000]
    award_date = str(request.form.get('award_date') or '')
    try:
        parsed_date = date.fromisoformat(award_date)
    except ValueError:
        return error('請填寫有效得獎日期')
    if not name or not award or kind not in KINDS or parsed_date > date.today():
        return error('請確認比賽名稱、獎項、分類與日期')
    upload = request.files.get('file')
    if not upload or not upload.filename:
        return error('請上傳佐證資料')
    suffix = Path(upload.filename).suffix.lower()
    if suffix not in EXTENSIONS:
        return error('佐證資料僅支援 PDF、PNG、JPG')
    content = upload.read(MAX_FILE + 1)
    if not content or len(content) > MAX_FILE:
        return error('檔案不可空白且不得超過 10 MB')
    file_id = uuid4().hex
    root = Path(store.path).parent / 'achievement_files'
    root.mkdir(parents=True, exist_ok=True)
    (root / (file_id + suffix)).write_bytes(content)
    with store.lock:
        rows = records()
        row = dict(id=next_id(rows), dept_id='CS', kind=kind, contest_name=name, award=award,
                   award_date=award_date, description=description, status='待審核',
                   created_by=user['username'], created_at=now(), updated_at=now(),
                   published_at=None, reviewed_by=None, review_note='',
                   file_id=file_id, file_suffix=suffix,
                   file_name=secure_filename(upload.filename) or 'evidence' + suffix)
        rows.append(row)
        store.save()
    return ok(data={k: row[k] for k in ('id', 'status')})


@bp.route('/api/campus/achievements/<int:item_id>/review', methods=['POST'])
@require('科助')
def review(item_id):
    user = current_user()
    if not assistant(user):
        return error('僅限資管科科助', 403)
    body = request.get_json(silent=True) or {}
    action = body.get('action')
    if action not in ('發布', '退回'):
        return error('無效審核動作')
    with store.lock:
        row = next((r for r in records() if r['id'] == item_id), None)
        if not row:
            return error('找不到成果', 404)
        if row['status'] != '待審核':
            return error('此成果已審核，請重新整理', 409)
        row['status'] = '已發布' if action == '發布' else '已退回'
        row['reviewed_by'] = user['username']
        row['review_note'] = str(body.get('note') or '').strip()[:1000]
        row['updated_at'] = now()
        if action == '發布':
            row['published_at'] = row['updated_at']
        store.save()
    return ok(data={'id': row['id'], 'status': row['status']})


@bp.route('/api/campus/achievements/<int:item_id>', methods=['PUT'])
@require('科助')
def update(item_id):
    user = current_user()
    if not assistant(user):
        return error('僅限資管科科助', 403)
    body = request.get_json(silent=True) or {}
    name = str(body.get('contest_name') or '').strip()[:120]
    award = str(body.get('award') or '').strip()[:120]
    description = str(body.get('description') or '').strip()[:2000]
    award_date = str(body.get('award_date') or '')
    try:
        parsed_date = date.fromisoformat(award_date)
    except ValueError:
        return error('請填寫有效得獎日期')
    if not name or not award or parsed_date > date.today():
        return error('請確認名稱、獎項與日期')
    with store.lock:
        row = next((r for r in records() if r['id'] == item_id), None)
        if not row:
            return error('找不到成果', 404)
        if row['status'] != '已發布':
            return error('只能維護已發布成果', 409)
        row.update(contest_name=name, award=award, award_date=award_date,
                   description=description, updated_at=now())
        store.save()
    return ok(data=public_record(row))


@bp.route('/api/campus/achievements/<int:item_id>/file')
@require('學生', '老師', '科助')
def evidence(item_id):
    user = current_user()
    with store.lock:
        row = next((r for r in records() if r['id'] == item_id), None)
        if not row:
            return error('找不到附件', 404)
        if row['created_by'] != user['username'] and not assistant(user):
            return error('無權查看佐證資料', 403)
        path = Path(store.path).parent / 'achievement_files' / (row['file_id'] + row['file_suffix'])
    if not path.is_file():
        return error('附件不存在', 404)
    return send_file(path, as_attachment=True, download_name=row['file_name'])
