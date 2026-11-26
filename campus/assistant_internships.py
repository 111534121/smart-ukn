"""資管科五年級實習媒合與行政追蹤。正式合約與校務系統仍由承辦單位核定。"""
import os
import json
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, request, send_file

from .assistant_classes import class_year
from .common import DATA_DIR, all_students, current_user, error, find_student, next_id, now_str, ok, require, store
from .graduation_projects import cs_assistant

bp = Blueprint('assistant_internships', __name__)
STAGES = ('待媒合', '洽談中', '已媒合', '實習中', '已完成')
CONTRACT = ('未收到', '待確認', '已收件', '已轉交')
JOURNAL = ('未開始', '待繳交', '待檢查', '已確認')
ALLOWED_EXT = {'.pdf', '.jpg', '.jpeg', '.png', '.docx'}
MAX_FILE = 10 * 1024 * 1024
CATEGORIES = ('資訊技術', '行銷與設計', '行政與客服', '商管與會計', '教育與培訓', '旅遊服務', '待補充')
HISTORY_CATEGORIES = {
    '114001': ['商管與會計', '資訊技術'],
    '114002': ['行政與客服'],
    '114003': ['資訊技術'],
    '114005': ['行銷與設計'],
    '11406': ['教育與培訓', '行政與客服'],
    '114007': ['資訊技術'],
    '114008': ['資訊技術'],
    '114009': ['資訊技術'],
    '114010': ['資訊技術'],
    '114011': ['資訊技術', '行政與客服'],
    '114012': ['資訊技術'],
    '114013': ['資訊技術'],
    '114014': ['資訊技術', '行銷與設計', '行政與客服'],
    '114015': ['資訊技術'],
    '114016': ['資訊技術'],
    '114017': ['資訊技術'],
    '114018': ['行政與客服'],
    '114019': ['資訊技術', '商管與會計'],
    '114020': ['資訊技術', '商管與會計'],
    '114021': ['行政與客服'],
    '114022': ['資訊技術', '教育與培訓'],
    'roster-rui-shi': ['旅遊服務'],
}
DEMO_ALUMNI = {
    '承心資訊有限公司': '王小明（資管五忠示範學生）',
    '山淬股份有限公司': '李美華（資管五忠示範學生）',
    '巨匠教育集團': '林雨潔（資管五忠示範學生）',
}
DEMO_SHARE_CONTENT = {
    '承心資訊有限公司': (
        '【虛構示範】協助整理功能測試紀錄、描述發現的問題，並參考團隊文件了解專案流程。',
        '【虛構示範】先練習把問題寫清楚，記下重現步驟；面試時可準備一個自己做過的小作品。'),
    '山淬股份有限公司': (
        '【虛構示範】觀察電商資料整理、商品內容製作與行政作業如何分工。',
        '【虛構示範】先確認應徵的是資料、影音還是營運職務，準備對應的作品或試算表範例。'),
    '巨匠教育集團': (
        '【虛構示範】協助課程安排、學員聯繫與課輔行政，了解教育現場的服務流程。',
        '【虛構示範】事先確認輪班時段與課輔工作範圍，練習清楚記錄學員的需求。'),
}
PREPARATION_TIPS = {
    '資訊技術': '面試前可準備程式或維修作品，先確認使用的工具、測試流程及指導方式。',
    '行銷與設計': '可整理設計作品與社群內容範例，先問清楚素材製作、審稿和發布流程。',
    '行政與客服': '可先練習表單整理與溝通紀錄，確認服務時段和常見問題處理方式。',
    '商管與會計': '可複習試算表及帳務基礎，確認資料保密與審核流程。',
    '教育與培訓': '可準備教學或課輔經驗，確認排班、授課支援及學員聯繫方式。',
    '旅遊服務': '可先了解旅遊服務流程，向科辦確認實際職務與工作時段。',
    '待補充': '原資料未提供職務細節，請先向科辦確認工作內容與實習條件。',
}


def permitted():
    return cs_assistant(current_user())


def fifth_year_students():
    return [s for s in all_students() if s.get('dept_id') == 'CS' and class_year(s.get('class_name'), s.get('admission_year')) == 5]


def placements():
    return store.section('cs_internship_placements', list)


def history():
    source = Path(__file__).with_name('internship_history_seed.json')
    seed = json.loads(source.read_text(encoding='utf-8'))
    with store.lock:
        edits = dict(store.section('cs_internship_company_edits', dict))
        added = [dict(row) for row in store.section('cs_internship_companies', list)]
        shares = [dict(row) for row in store.section('cs_internship_alumni_shares', list)
                  if row.get('status') == '已發布']
    companies = []
    for company in seed['companies'] + added:
        row = dict(company)
        row['categories'] = HISTORY_CATEGORIES.get(row['source_id'], row.get('categories', ['待補充']))
        row.update(edits.get(f"{row['year']}:{row['name']}", {}))
        roles = [role for role in row.get('roles', []) if role.get('title')]
        work_summary = '；'.join(role['title'] + '：' + str(role.get('details') or '原資料未提供細節')
                                for role in roles)
        if not row.get('description'):
            row['description'] = ('示範工作介紹（依歷年廠商文件整理）：' + work_summary[:400] +
                                  ('…' if len(work_summary) > 400 else '') + '。實際工作以當年度公告為準。'
                                  if roles else '示範工作介紹：原始名單有此單位，未提供職務細節；請向科辦確認。')
        if not row.get('advice'):
            row['advice'] = '示範提醒（非實際實習心得）：' + PREPARATION_TIPS.get(row['categories'][0], PREPARATION_TIPS['待補充'])
        row['alumni'] = [{'name': DEMO_ALUMNI[row['name']], 'demo': True}] if row['year'] == 114 and row['name'] in DEMO_ALUMNI else []
        row['shares'] = ([{'name': DEMO_ALUMNI[row['name']],
                           'work_description': DEMO_SHARE_CONTENT[row['name']][0],
                           'advice': DEMO_SHARE_CONTENT[row['name']][1], 'demo': True}]
                         if row['year'] == 114 and row['name'] in DEMO_SHARE_CONTENT else [])
        row['shares'] += [{'name': s['student_name'], 'work_description': s['work_description'],
                           'advice': s['advice'], 'demo': False} for s in shares
                          if s['year'] == row['year'] and s['company'] == row['name']]
        companies.append(row)
    return companies


@bp.route('/api/campus/assistant/internship-companies', methods=['POST'])
@require('科助', '管理員')
def add_company():
    if not permitted():
        return error('僅資管科科助可維護廠商資料', 403)
    body = request.get_json(silent=True) or {}
    name = str(body.get('name') or '').strip()
    title = str(body.get('title') or '').strip()
    details = str(body.get('details') or '').strip()
    category = str(body.get('category') or '').strip()
    try:
        year = int(body.get('year'))
    except (TypeError, ValueError):
        return error('請填寫學年度')
    if not name or not title or category not in CATEGORIES or year < 100 or year > 200 or len(name) > 120 or len(title) > 120 or len(details) > 2000:
        return error('請檢查學年度、廠商、職務與工作內容')
    if any(c['year'] == year and c['name'] == name for c in history()):
        return error('該年度已有這間廠商，請直接補充原紀錄')
    row = {'source_id': '', 'year': year, 'name': name,
           'roles': [{'title': title, 'details': details}], 'categories': [category], 'source_url': ''}
    with store.lock:
        store.section('cs_internship_companies', list).append(row)
        store.save()
    return ok(data=row)


@bp.route('/api/campus/internship-history')
@require('學生', '科助', '老師', '管理員')
def internship_history():
    user = current_user()
    if user.get('dept_id') != 'CS' and not cs_assistant(user):
        return error('僅資管科師生與科助可查看', 403)
    return ok(data=history())


@bp.route('/api/campus/internship-history/shares', methods=['POST'])
@require('學生')
def submit_alumni_share():
    user = current_user()
    student = find_student(user.get('student_id'))
    if not student or student.get('dept_id') != 'CS' or class_year(student.get('class_name'), student.get('admission_year')) != 5:
        return error('僅資管科五年級學生可分享實習經驗', 403)
    body = request.get_json(silent=True) or {}
    company = str(body.get('company') or '').strip()
    work_description = str(body.get('work_description') or '').strip()
    advice = str(body.get('advice') or '').strip()
    try:
        year = int(body.get('year'))
    except (TypeError, ValueError):
        return error('請選擇學年度')
    if not any(c['year'] == year and c['name'] == company for c in history()):
        return error('請選擇歷年廠商')
    if not work_description or not advice or len(work_description) > 1000 or len(advice) > 1000:
        return error('請填寫工作介紹與給學弟妹的提醒')
    with store.lock:
        rows = store.section('cs_internship_alumni_shares', list)
        existing = next((r for r in rows if r['student_id'] == student['student_id']
                         and r['company'] == company and r['year'] == year), None)
        values = {'student_name': student['full_name'], 'work_description': work_description,
                  'advice': advice, 'status': '待審核', 'updated_at': now_str()}
        if existing:
            existing.update(values)
            row = existing
        else:
            row = {'id': next_id(rows), 'student_id': student['student_id'],
                   'company': company, 'year': year, **values}
            rows.append(row)
        store.save()
    return ok(data={'id': row['id'], 'status': row['status']})


@bp.route('/api/campus/assistant/internship-shares', methods=['GET'])
@require('科助', '管理員')
def share_review_list():
    if not permitted():
        return error('僅資管科科助可審核', 403)
    with store.lock:
        rows = [dict(r) for r in store.section('cs_internship_alumni_shares', list)]
    return ok(data=rows)


@bp.route('/api/campus/assistant/internship-shares/<int:item_id>', methods=['PATCH'])
@require('科助', '管理員')
def review_share(item_id):
    if not permitted():
        return error('僅資管科科助可審核', 403)
    status = (request.get_json(silent=True) or {}).get('status')
    if status not in ('已發布', '已退回'):
        return error('審核狀態不正確')
    with store.lock:
        row = next((r for r in store.section('cs_internship_alumni_shares', list) if r['id'] == item_id), None)
        if not row:
            return error('找不到分享', 404)
        row['status'] = status
        row['updated_at'] = now_str()
        store.save()
    return ok()


@bp.route('/api/campus/assistant/internship-companies/<int:year>/<path:name>', methods=['PATCH'])
@require('科助', '管理員')
def update_company(year, name):
    if not permitted():
        return error('僅資管科科助可維護廠商資料', 403)
    if not any(c['year'] == year and c['name'] == name for c in history()):
        return error('找不到歷年廠商', 404)
    body = request.get_json(silent=True) or {}
    categories = body.get('categories')
    if not isinstance(categories, list) or not categories or len(categories) > len(CATEGORIES) or any(c not in CATEGORIES for c in categories):
        return error('請選擇有效的廠商分類')
    with store.lock:
        key = f'{year}:{name}'
        edits = store.section('cs_internship_company_edits', dict)
        edits[key] = {**edits.get(key, {}),
                      'categories': list(dict.fromkeys(categories)), 'updated_at': now_str()}
        store.save()
    return ok()


@bp.route('/api/campus/assistant/internships', methods=['GET', 'POST'])
@require('科助', '管理員')
def internships():
    if not permitted():
        return error('僅資管科科助可管理實習紀錄', 403)
    students = fifth_year_students()
    if request.method == 'GET':
        with store.lock:
            data = [dict(row) for row in placements()]
        data.sort(key=lambda row: row['updated_at'], reverse=True)
        return ok(data=data, students=[{'student_id': s['student_id'], 'full_name': s['full_name'], 'class_name': s['class_name']} for s in students])
    body = request.get_json(silent=True) or {}
    student = next((s for s in students if s['student_id'] == str(body.get('student_id') or '').strip()), None)
    if not student:
        return error('只能建立本科五年級學生的實習紀錄')
    company = str(body.get('company') or '').strip()
    teacher = str(body.get('teacher') or '').strip()
    if not company or len(company) > 120 or len(teacher) > 100:
        return error('請填寫實習單位，並檢查欄位長度')
    with store.lock:
        if any(row['student_id'] == student['student_id'] for row in placements()):
            return error('這位學生已有實習紀錄，請更新原紀錄')
        row = {'id': next_id(placements()), 'student_id': student['student_id'],
               'student_name': student['full_name'], 'class_name': student['class_name'],
               'company': company, 'teacher': teacher, 'stage': '待媒合',
               'contract_status': '未收到', 'journal_status': '未開始',
               'visit_date': '', 'note': '', 'files': [], 'contacts': [],
               'created_at': now_str(), 'updated_at': now_str()}
        placements().append(row)
        store.save()
    return ok(data=row)


@bp.route('/api/campus/assistant/internships/<int:item_id>', methods=['PATCH'])
@require('科助', '管理員')
def update_internship(item_id):
    if not permitted():
        return error('僅資管科科助可管理實習紀錄', 403)
    body = request.get_json(silent=True) or {}
    stage = str(body.get('stage') or '').strip()
    contract = str(body.get('contract_status') or '').strip()
    journal = str(body.get('journal_status') or '').strip()
    date = str(body.get('visit_date') or '').strip()
    note = str(body.get('note') or '').strip()
    teacher = str(body.get('teacher') or '').strip()
    if stage not in STAGES or contract not in CONTRACT or journal not in JOURNAL:
        return error('處理狀態不正確')
    if date:
        from datetime import date as date_type
        try:
            if date_type.fromisoformat(date).isoformat() != date:
                raise ValueError()
        except ValueError:
            return error('訪視日期格式須為 YYYY-MM-DD')
    if len(note) > 2000 or len(teacher) > 100:
        return error('欄位內容過長')
    with store.lock:
        row = next((row for row in placements() if row['id'] == item_id), None)
        if row is None:
            return error('找不到實習紀錄', 404)
        row.update(stage=stage, contract_status=contract, journal_status=journal,
                   visit_date=date, note=note, teacher=teacher, updated_at=now_str())
        store.save()
        return ok(data=dict(row))


@bp.route('/api/campus/assistant/internships/<int:item_id>/contacts', methods=['POST'])
@require('科助', '管理員')
def add_contact(item_id):
    if not permitted():
        return error('僅資管科科助可管理實習紀錄', 403)
    body = request.get_json(silent=True) or {}
    party = str(body.get('party') or '').strip()
    note = str(body.get('note') or '').strip()
    if party not in ('學生', '實習單位', '指導老師') or not note or len(note) > 1000:
        return error('請選擇聯繫對象並填寫紀錄')
    with store.lock:
        row = next((row for row in placements() if row['id'] == item_id), None)
        if row is None:
            return error('找不到實習紀錄', 404)
        row['contacts'].append({'party': party, 'note': note, 'at': now_str(), 'by': current_user()['username']})
        row['updated_at'] = now_str()
        store.save()
        return ok(data=dict(row))


@bp.route('/api/campus/assistant/internships/<int:item_id>/files', methods=['POST'])
@require('科助', '管理員')
def upload_contract(item_id):
    if not permitted():
        return error('僅資管科科助可管理實習紀錄', 403)
    file = request.files.get('file')
    if file is None or not file.filename:
        return error('請選擇合約或佐證檔案')
    filename = os.path.basename(file.filename.replace('\\', '/'))
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        return error('僅支援 PDF、JPG、PNG、DOCX')
    content = file.read(MAX_FILE + 1)
    if len(content) > MAX_FILE:
        return error('檔案不得超過 10 MB')
    with store.lock:
        row = next((row for row in placements() if row['id'] == item_id), None)
        if row is None:
            return error('找不到實習紀錄', 404)
        key = uuid4().hex + ext
        folder = Path(DATA_DIR) / 'internship_files'
        folder.mkdir(parents=True, exist_ok=True)
        (folder / key).write_bytes(content)
        entry = {'id': key, 'name': filename[:180], 'uploaded_at': now_str()}
        row['files'].append(entry)
        row['updated_at'] = now_str()
        store.save()
        return ok(data=entry)


@bp.route('/api/campus/assistant/internships/<int:item_id>/files/<file_id>')
@require('科助', '管理員')
def download_contract(item_id, file_id):
    if not permitted():
        return error('僅資管科科助可查看實習檔案', 403)
    with store.lock:
        row = next((row for row in placements() if row['id'] == item_id), None)
        entry = next((f for f in row.get('files', []) if f['id'] == file_id), None) if row else None
    if not entry:
        return error('找不到檔案', 404)
    return send_file(Path(DATA_DIR) / 'internship_files' / entry['id'], as_attachment=True, download_name=entry['name'])
