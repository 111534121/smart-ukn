"""資管科畢業專題：學生組隊、導師志願、科助媒合與分階段審核。"""
from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, request, send_file

from .common import all_students, current_user, deps, error, next_id, now_str, ok, require, store
from .admin_cases import assistant_departments, assignments
from .office_catalog import canonical

bp = Blueprint('graduation_projects', __name__)
STAGES = ('提案', '期中', '期末')
MAX_FILE = 15 * 1024 * 1024
MAX_MEMBERS = 6
MAX_TEAMS_PER_TEACHER = 3


def teams():
    return store.section('graduation_project_teams', list)


def submissions():
    return store.section('graduation_project_submissions', list)


def reminders():
    return store.section('graduation_project_reminders', list)


def file_root():
    return Path(store.path).parent / 'graduation_project_files'


def cs_student(user):
    return user and user['role'] == '學生' and any(
        s['student_id'] == user['student_id'] and s.get('dept_id') == 'CS' for s in all_students())


def cs_assistant(user):
    return user and (user['role'] == '管理員' or user['role'] == '科助'
                     and assistant_departments().get(user['username']) == 'CS'
                     and canonical(assignments().get(user['username'])) == '資訊管理科（五專）／科辦公室')


def cs_teacher(user):
    return user and user['role'] == '老師' and user.get('dept_id') == 'CS'


def teacher_options():
    return [{'username': u['username'], 'full_name': u['full_name']}
            for u in deps.users if u['role'] == '老師' and u.get('dept_id') == 'CS']


def mine(team, user):
    return cs_student(user) and user['student_id'] in team['member_ids']


def manages(team, user):
    return cs_assistant(user) or cs_teacher(user) and team.get('teacher_username') == user['username']


def team_view(team):
    names = {s['student_id']: s['full_name'] for s in all_students()}
    result = dict(team)
    result['members'] = [{'student_id': sid, 'full_name': names.get(sid, sid)} for sid in team['member_ids']]
    result['submissions'] = [{k: v for k, v in row.items() if k != 'file_id'}
                             for row in submissions() if row['team_id'] == team['id']]
    return result


@bp.route('/graduation-projects')
def page():
    return current_app.send_static_file('graduation-projects.html')


@bp.route('/api/campus/graduation-projects', methods=['GET', 'POST'])
@require('學生', '科助', '老師', '管理員')
def collection():
    user = current_user()
    if request.method == 'GET':
        if not (cs_student(user) or cs_assistant(user) or cs_teacher(user)):
            return error('此服務僅供資管科使用', 403)
        visible = [t for t in teams() if mine(t, user) or manages(t, user)]
        return ok(data=[team_view(t) for t in visible], teachers=teacher_options(),
                  teacher_capacity=MAX_TEAMS_PER_TEACHER, stages=STAGES)
    if not cs_student(user):
        return error('僅資管科學生可建立專題小組', 403)
    data = request.get_json(silent=True) or {}
    title = str(data.get('title') or '').strip()[:100]
    if not title:
        return error('請填專題名稱')
    with store.lock:
        if any(user['student_id'] in t['member_ids'] for t in teams()):
            return error('你已加入其他專題小組', 409)
        row = {'id': next_id(teams()), 'title': title, 'join_code': uuid4().hex[:8].upper(),
               'leader_id': user['student_id'], 'member_ids': [user['student_id']],
               'preferences': [], 'teacher_username': None, 'matched_at': None,
               'created_at': now_str()}
        teams().append(row)
        store.save()
    return ok(data=team_view(row), message='小組已建立，將加入碼分享給隊友')


@bp.route('/api/campus/graduation-projects/join', methods=['POST'])
@require('學生')
def join():
    user = current_user()
    if not cs_student(user):
        return error('僅資管科學生可加入小組', 403)
    code = str((request.get_json(silent=True) or {}).get('join_code') or '').strip().upper()
    with store.lock:
        team = next((t for t in teams() if t['join_code'] == code), None)
        if not team:
            return error('找不到小組加入碼', 404)
        if any(user['student_id'] in t['member_ids'] for t in teams()):
            return error('你已加入專題小組', 409)
        if len(team['member_ids']) >= MAX_MEMBERS:
            return error('小組已達人數上限', 409)
        if team.get('teacher_username'):
            return error('此組已完成導師媒合，不能再加入', 409)
        team['member_ids'].append(user['student_id'])
        store.save()
    return ok(data=team_view(team), message='已加入小組')


@bp.route('/api/campus/graduation-projects/<int:team_id>/preferences', methods=['PUT'])
@require('學生')
def preferences(team_id):
    user = current_user()
    data = request.get_json(silent=True) or {}
    ranking = data.get('ranking')
    allowed = {t['username'] for t in teacher_options()}
    if not isinstance(ranking, list) or not ranking or len(ranking) > len(allowed) or len(set(ranking)) != len(ranking) or not set(ranking) <= allowed:
        return error('請依序選擇資管科老師，且不可重複')
    with store.lock:
        team = next((t for t in teams() if t['id'] == team_id), None)
        if not team or team['leader_id'] != user['student_id']:
            return error('只有組長可以送出志願序', 403)
        if team.get('teacher_username'):
            return error('已完成媒合，不能修改志願序', 409)
        team['preferences'] = ranking
        store.save()
    return ok(data=team_view(team), message='志願序已儲存')


@bp.route('/api/campus/graduation-projects/match', methods=['POST'])
@require('科助', '管理員')
def match_teachers():
    user = current_user()
    if not cs_assistant(user):
        return error('僅資管科科助可執行媒合', 403)
    with store.lock:
        counts = {t['username']: sum(team.get('teacher_username') == t['username'] for team in teams())
                  for t in teacher_options()}
        matched = []
        unmatched = []
        for team in sorted(teams(), key=lambda t: (t['created_at'], t['id'])):
            if team.get('teacher_username') or not team['preferences']:
                continue
            selected = next((name for name in team['preferences'] if counts.get(name, MAX_TEAMS_PER_TEACHER) < MAX_TEAMS_PER_TEACHER), None)
            if selected:
                team['teacher_username'] = selected
                team['matched_at'] = now_str()
                counts[selected] += 1
                matched.append(team['id'])
            else:
                unmatched.append(team['id'])
        store.save()
    return ok(matched=matched, unmatched=unmatched, capacity=counts,
              message=f'已媒合 {len(matched)} 組，尚有 {len(unmatched)} 組需人工處理')


@bp.route('/api/campus/graduation-projects/<int:team_id>/submissions/<stage>', methods=['POST'])
@require('學生')
def submit_stage(team_id, stage):
    user = current_user()
    team = next((t for t in teams() if t['id'] == team_id), None)
    if stage not in STAGES or not team or not mine(team, user):
        return error('找不到可提交的專題階段', 404)
    if not team.get('teacher_username'):
        return error('請先完成導師媒合')
    if stage != '提案':
        prior = STAGES[STAGES.index(stage) - 1]
        if not any(s['team_id'] == team_id and s['stage'] == prior and s['status'] == '已核准' for s in submissions()):
            return error('前一階段尚未核准')
    uploaded = request.files.get('file')
    if not uploaded or not uploaded.filename.lower().endswith('.pdf'):
        return error('請上傳 PDF 企劃書')
    content = uploaded.read(MAX_FILE + 1)
    if not content.startswith(b'%PDF-') or len(content) > MAX_FILE:
        return error('PDF 格式不正確或超過 15 MB')
    with store.lock:
        old = next((s for s in submissions() if s['team_id'] == team_id and s['stage'] == stage), None)
        if old and old['status'] in ('待審核', '已核准'):
            return error('此階段已送審或已核准', 409)
        file_id = uuid4().hex
        file_root().mkdir(parents=True, exist_ok=True)
        (file_root() / file_id).write_bytes(content)
        row = {'id': old['id'] if old else next_id(submissions()), 'team_id': team_id,
               'stage': stage, 'status': '待審核', 'file_id': file_id,
               'file_name': Path(uploaded.filename).name[:150], 'submitted_by': user['student_id'],
               'submitted_at': now_str(), 'opened_at': None, 'reviewed_at': None, 'review_note': ''}
        if old:
            old.update(row)
        else:
            submissions().append(row)
        store.save()
    return ok(data={k: v for k, v in row.items() if k != 'file_id'}, message='已送交指導老師站內待辦')


@bp.route('/api/campus/graduation-projects/submissions/<int:submission_id>/file')
@require('學生', '科助', '老師', '管理員')
def download(submission_id):
    user = current_user()
    row = next((s for s in submissions() if s['id'] == submission_id), None)
    team = next((t for t in teams() if row and t['id'] == row['team_id']), None)
    if not team or not (mine(team, user) or manages(team, user)):
        return error('找不到可下載文件', 404)
    path = file_root() / row['file_id']
    if not path.is_file():
        return error('檔案不存在', 404)
    return send_file(BytesIO(path.read_bytes()), as_attachment=True,
                     download_name=row['file_name'], mimetype='application/pdf')


@bp.route('/api/campus/graduation-projects/submissions/<int:submission_id>/review', methods=['POST'])
@require('老師')
def review(submission_id):
    user = current_user()
    data = request.get_json(silent=True) or {}
    decision = data.get('decision')
    if decision not in ('已核准', '退回修改'):
        return error('請選擇核准或退回修改')
    with store.lock:
        row = next((s for s in submissions() if s['id'] == submission_id), None)
        team = next((t for t in teams() if row and t['id'] == row['team_id']), None)
        if not team or team.get('teacher_username') != user['username']:
            return error('只能審核自己指導的小組', 403)
        if row['status'] != '待審核':
            return error('此文件已完成審核', 409)
        row['status'] = decision
        row['reviewed_at'] = now_str()
        row['opened_at'] = row['opened_at'] or now_str()
        row['review_note'] = str(data.get('note') or '').strip()[:500]
        store.save()
    return ok(message='審核結果已儲存')


@bp.route('/api/campus/graduation-projects/teacher-tasks')
@require('老師')
def teacher_tasks():
    user = current_user()
    if not cs_teacher(user):
        return error('僅資管科指導老師可使用', 403)
    with store.lock:
        assigned = {t['id']: t for t in teams() if t.get('teacher_username') == user['username']}
        rows = [s for s in submissions() if s['team_id'] in assigned]
        for row in rows:
            if row['status'] == '待審核' and not row['opened_at']:
                row['opened_at'] = now_str()
        store.save()
    return ok(data=[{'id': s['id'], 'team_id': s['team_id'], 'team_title': assigned[s['team_id']]['title'],
                     'stage': s['stage'], 'status': s['status'], 'submitted_at': s['submitted_at'],
                     'review_note': s['review_note'],
                     'last_reminder_at': next((r['sent_at'] for r in reversed(reminders()) if r['submission_id'] == s['id']), None)}
                    for s in rows],
              pending_count=sum(s['status'] == '待審核' for s in rows))


@bp.route('/api/campus/graduation-projects/submissions/<int:submission_id>/remind', methods=['POST'])
@require('科助', '管理員')
def remind(submission_id):
    user = current_user()
    if not cs_assistant(user):
        return error('僅資管科科助可提醒', 403)
    with store.lock:
        row = next((s for s in submissions() if s['id'] == submission_id and s['status'] == '待審核'), None)
        if not row:
            return error('找不到待審文件', 404)
        latest = next((r for r in reversed(reminders()) if r['submission_id'] == submission_id), None)
        if latest and datetime.fromisoformat(latest['sent_at']) + timedelta(hours=12) > datetime.now():
            return error('同一文件每 12 小時最多提醒一次', 429)
        overdue = datetime.now() - datetime.fromisoformat(row['submitted_at']) >= timedelta(days=7)
        reminder = {'id': next_id(reminders()), 'submission_id': submission_id,
                    'teacher_username': next(t['teacher_username'] for t in teams() if t['id'] == row['team_id']),
                    'sent_at': now_str(), 'escalation_due': overdue, 'channel': '站內'}
        reminders().append(reminder)
        store.save()
    return ok(data=reminder, message='已更新老師站內待辦' + ('；已標記逾 7 天，待系主任聯絡資料設定後可升級通知' if overdue else ''))
