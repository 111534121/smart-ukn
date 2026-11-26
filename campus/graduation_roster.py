"""資管科科助畢業進度總表：沿用現有學分、證照及專題資料。"""
import csv
from io import StringIO

from flask import Blueprint, current_app

from .common import all_students, current_user, deps, error, ok, require, store
from .graduation_projects import cs_assistant, submissions as project_submissions, teams
from .certificates import submissions as certificate_submissions
from .assistant_classes import class_year

bp = Blueprint('graduation_roster', __name__)


def rows():
    # 與學生端的學分邏輯共用課程及重修判定，批次讀取避免每位學生重查全班資料。
    students = sorted((s for s in all_students() if s.get('dept_id') == 'CS'),
                      key=lambda s: (s.get('class_name') or '', s['student_id']))
    course_map = {c['course_id']: c for c in deps.load_course_map()}
    credits = deps.fetch_db_rows(
        'SELECT sc.student_id, sc.course_id, sc.semester, sc.score, sc.is_passed '
        'FROM student_credits sc JOIN students s ON s.student_id=sc.student_id '
        'WHERE s.dept_id=%s ORDER BY sc.semester', ('CS',))
    if credits is None:
        credits = [r for r in deps.demo_student_credits
                   if r['student_id'] in {s['student_id'] for s in students}]
    by_student = {}
    for record in credits:
        by_student.setdefault(record['student_id'], []).append(record)
    certificates = {}
    for record in certificate_submissions():
        if record['kind'] == '證照' and record['status'] == '已通過':
            certificates.setdefault(record['student_id'], set()).add(record['name'])
    by_member = {sid: team for team in teams() for sid in team['member_ids']}
    stages_by_team = {}
    for record in project_submissions():
        stages_by_team.setdefault(record['team_id'], {})[record['stage']] = record['status']
    with store.lock:
        internships = {row['student_id']: dict(row) for row in store.section('cs_internship_placements', list)}
    requirements = deps.load_dept_requirements('CS')
    credit_target = int(requirements.get('total_credits_req') or deps.graduation_threshold)
    cert_target = deps.graduation_cert_requirement
    result = []
    for student in students:
        sid = student['student_id']
        year = class_year(student.get('class_name'), student.get('admission_year'))
        passed, _, _ = deps.summarize_credits(by_student.get(sid, []))
        earned = sum(int(course_map[cid]['credits']) for cid in passed if cid in course_map)
        cert_count = len(certificates.get(sid, set()))
        team = by_member.get(sid)
        stage = stages_by_team.get(team['id'], {}) if team else {}
        if year is not None and year <= 3:
            project_status = '尚未適用'
        elif not team:
            project_status = '未組隊'
        elif stage.get('期末') == '已核准':
            project_status = '期末已核准'
        elif any(value == '待審核' for value in stage.values()):
            project_status = '待老師審核'
        elif any(value == '退回修改' for value in stage.values()):
            project_status = '待修改'
        elif team.get('teacher_username'):
            project_status = '進行中'
        else:
            project_status = '待媒合導師'
        missing = []
        if year == 5:
            if earned < credit_target:
                missing.append(f'學分尚差 {credit_target - earned}')
            if cert_count < cert_target:
                missing.append(f'證照尚差 {cert_target - cert_count}')
            if project_status != '期末已核准':
                missing.append('專題未完成')
        internship = internships.get(sid) if year == 5 else None
        internship_status = (f"{internship['stage']} · 合約{internship['contract_status']}" if internship
                             else '待確認' if year == 5 else '尚未適用')
        result.append({'student_id': sid, 'full_name': student['full_name'],
                       'class_name': student.get('class_name') or '',
                       'admission_year': student.get('admission_year'), 'year': year,
                       'credits_earned': earned, 'credits_target': credit_target,
                       'certificates_approved': cert_count, 'certificates_target': cert_target,
                       'project_status': project_status, 'project_team_id': team['id'] if team else None,
                       'internship_status': internship_status, 'missing': missing,
                       'progress_status': ('尚未進入畢業審查' if year != 5 else
                                           '依現有資料無缺項' if not missing else '需追蹤')})
    return result


@bp.route('/api/campus/assistant/graduation-roster')
@require('科助', '管理員')
def roster():
    if not cs_assistant(current_user()):
        return error('僅資管科科助可查看', 403)
    data = rows()
    return ok(data=data, summary={'students': len(data),
                                   'needs_follow_up': sum(bool(r['missing']) for r in data),
                                   'project_pending_review': sum(r['project_status'] == '待老師審核' for r in data),
                                   'internship_unverified': sum(r['year'] == 5 and r['internship_status'] == '待確認' for r in data)},
              rule_note='學分與證照門檻沿用系統設定，尚待科辦核對正式學年度規定；實習進度為科助追蹤紀錄，正式認定仍須核對學校系統。')


@bp.route('/api/campus/assistant/graduation-roster.csv')
@require('科助', '管理員')
def export():
    if not cs_assistant(current_user()):
        return error('僅資管科科助可下載', 403)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['學號', '姓名', '班級', '入學學年度', '已取得學分', '系統設定學分門檻',
                     '已通過證照', '系統設定證照門檻', '專題進度', '實習資料', '進度提示', '待追蹤事項'])
    for row in rows():
        writer.writerow([row['student_id'], row['full_name'], row['class_name'], row['admission_year'],
                         row['credits_earned'], row['credits_target'], row['certificates_approved'],
                         row['certificates_target'], row['project_status'], row['internship_status'],
                         row['progress_status'], '、'.join(row['missing'])])
    response = current_app.response_class('\ufeff' + output.getvalue(), mimetype='text/csv; charset=utf-8')
    response.headers['Content-Disposition'] = 'attachment; filename="cs-graduation-progress.csv"'
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
