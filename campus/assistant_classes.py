"""資管科科助的全科班級摘要；僅回傳本科學生的必要校務資訊。"""
from collections import defaultdict
from datetime import date

from flask import Blueprint, request

from .common import all_students, current_user, deps, error, ok, require
from .graduation_projects import cs_assistant

bp = Blueprint('assistant_classes', __name__)
YEAR_LABELS = {'一': 1, '二': 2, '三': 3, '四': 4, '五': 5}


def class_year(name, admission_year=None):
    for char in str(name):
        if char in YEAR_LABELS:
            return YEAR_LABELS[char]
    try:
        school_year = date.today().year - 1911 if date.today().month >= 8 else date.today().year - 1912
        return max(1, min(5, school_year - int(admission_year) + 1))
    except (TypeError, ValueError):
        return None


@bp.route('/api/campus/assistant/classes')
@require('科助', '管理員')
def overview():
    if not cs_assistant(current_user()):
        return error('僅資管科科助可查看', 403)
    students = [s for s in all_students() if s.get('dept_id') == 'CS']
    selected = request.args.get('class_name', '').strip()
    classes = sorted({s.get('class_name') or '未分班' for s in students})
    if selected and selected not in classes:
        return error('只能查看本科班級', 403)
    students = [s for s in students if not selected or (s.get('class_name') or '未分班') == selected]
    student_ids = {s['student_id'] for s in students}
    attendance = defaultdict(list)
    for record in deps.attendance_records(None):
        if record.get('student_id') in student_ids:
            attendance[record['student_id']].append(record)
    credit_rows = deps.fetch_db_rows(
        'SELECT sc.student_id, sc.course_id, sc.semester, sc.score, sc.is_passed '
        'FROM student_credits sc JOIN students s ON s.student_id=sc.student_id '
        'WHERE s.dept_id=%s ORDER BY sc.semester', ('CS',))
    if credit_rows is None:
        credit_rows = [r for r in deps.demo_student_credits if r['student_id'] in student_ids]
    credits = defaultdict(list)
    for record in credit_rows:
        if record['student_id'] in student_ids:
            credits[record['student_id']].append(record)
    course_names = {c['course_id']: c['course_name'] for c in deps.load_course_map()}
    leave_rows = deps.leave_requests_for_review(list(student_ids))
    pending_leaves = defaultdict(int)
    for row in leave_rows:
        if row.get('status') == '待審核':
            pending_leaves[row['student_id']] += 1
    rows = []
    for student in students:
        sid = student['student_id']
        summary = deps.attendance_summary(attendance[sid])
        _, failed, latest = deps.summarize_credits(credits[sid])
        failed_courses = [{'course_id': cid, 'course_name': course_names.get(cid, cid),
                           'semester': latest[cid].get('semester'), 'score': latest[cid].get('score')}
                          for cid in sorted(failed)]
        rows.append({'student_id': sid, 'full_name': student['full_name'],
                     'class_name': student.get('class_name') or '未分班',
                     'year': class_year(student.get('class_name'), student.get('admission_year')),
                     'attendance': {'absent': summary['totals']['曠課'], 'late': summary['totals']['遲到'],
                                    'sick': summary['totals']['病假'], 'level': summary['overall_level']},
                     'pending_leave': pending_leaves[sid], 'failed_courses': failed_courses,
                     'grades_available': bool(credits[sid])})
    rank = {'banned': 2, 'warning': 1, 'ok': 0}
    rows.sort(key=lambda r: (r['class_name'], -rank.get(r['attendance']['level'], 0),
                             -r['attendance']['absent'], -len(r['failed_courses']), r['student_id']))
    class_summaries = []
    for name in classes:
        group = [r for r in rows if r['class_name'] == name]
        if selected and name != selected:
            continue
        class_summaries.append({'class_name': name, 'year': group[0]['year'] if group else None,
                                'students': len(group), 'attendance_attention': sum(r['attendance']['level'] != 'ok' for r in group),
                                'failed_students': sum(bool(r['failed_courses']) for r in group),
                                'pending_leave': sum(r['pending_leave'] for r in group)})
    return ok(data=rows, classes=class_summaries, total_students=len(rows),
              note='出缺勤為系統現有紀錄；扣考風險僅供預警。成績顯示仍未通過的科目，無成績資料者標示待匯入。')
