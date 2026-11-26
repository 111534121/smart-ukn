"""資管科科助招生諮詢紀錄；不代替招生中心的正式入學審查。"""
from flask import Blueprint, request

from .common import current_user, error, next_id, now_str, ok, require, store
from .graduation_projects import cs_assistant

bp = Blueprint('assistant_admissions', __name__)
STATUSES = ('待回覆', '處理中', '已轉介', '已完成')
CHANNELS = ('電話', '現場', '電子郵件', '社群', '其他')


def authorized():
    return cs_assistant(current_user())


@bp.route('/api/campus/assistant/admissions', methods=['GET', 'POST'])
@require('科助', '管理員')
def admissions():
    if not authorized():
        return error('僅資管科科助可管理本科招生諮詢', 403)
    if request.method == 'GET':
        with store.lock:
            rows = [dict(row) for row in store.section('cs_admission_inquiries', list)]
        rows.sort(key=lambda row: row['updated_at'], reverse=True)
        return ok(data=rows, summary={status: sum(row['status'] == status for row in rows) for status in STATUSES})

    body = request.get_json(silent=True) or {}
    topic = str(body.get('topic') or '').strip()
    question = str(body.get('question') or '').strip()
    contact = str(body.get('contact') or '').strip()
    channel = str(body.get('channel') or '').strip()
    if not topic or not question or not contact or channel not in CHANNELS:
        return error('請填寫聯絡稱呼、諮詢管道、主題與問題內容')
    if max(len(contact), len(topic)) > 100 or len(question) > 2000:
        return error('欄位內容過長')
    with store.lock:
        rows = store.section('cs_admission_inquiries', list)
        row = {'id': next_id(rows), 'contact': contact, 'channel': channel,
               'topic': topic, 'question': question, 'status': '待回覆',
               'note': '', 'created_at': now_str(), 'updated_at': now_str(),
               'created_by': current_user()['username']}
        rows.append(row)
        store.save()
    return ok(data=row)


@bp.route('/api/campus/assistant/admissions/<int:item_id>', methods=['PATCH'])
@require('科助', '管理員')
def update_admission(item_id):
    if not authorized():
        return error('僅資管科科助可管理本科招生諮詢', 403)
    body = request.get_json(silent=True) or {}
    status = str(body.get('status') or '').strip()
    note = str(body.get('note') or '').strip()
    if status not in STATUSES or len(note) > 2000:
        return error('處理狀態或紀錄不正確')
    with store.lock:
        row = next((row for row in store.section('cs_admission_inquiries', list) if row['id'] == item_id), None)
        if row is None:
            return error('找不到招生諮詢紀錄', 404)
        row.update(status=status, note=note, updated_at=now_str())
        store.save()
        return ok(data=dict(row))
