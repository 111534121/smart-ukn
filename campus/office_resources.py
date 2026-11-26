"""各處室可維護的公開 SOP 與表單範例。"""
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, request, send_file

from .common import current_user, deps, error, next_id, now_str, ok, require, store
from .admin_cases import assignments, assistant_departments, offices
from .office_catalog import DEPARTMENTS, canonical

bp = Blueprint('office_resources', __name__)
EXTENSIONS = {'.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'}
MAX_FILE = 10 * 1024 * 1024
EDIT_ROLES = ('管理員', '教職員', '處室承辦', '科助')


def resources():
    return store.section('office_resources', list)


def folder():
    return Path(store.path).parent / 'office_resource_files'


def my_office(user):
    office = canonical(assignments().get(user['username']))
    if user['role'] == '科助':
        code = assistant_departments().get(user['username'])
        name = next((name for key, name in DEPARTMENTS if key == code), None)
        return office if name and office == name + '／科辦公室' else None
    return office if user['role'] in EDIT_ROLES else None


def may_edit(user, office):
    return user['role'] == '管理員' or my_office(user) == office


def upload():
    file = request.files.get('file')
    if not file or not file.filename:
        return None
    name = file.filename.replace('\\', '/').split('/')[-1][:150]
    if Path(name).suffix.lower() not in EXTENSIONS:
        raise ValueError('僅支援 PDF、DOCX、XLSX 或圖片')
    content = file.read(MAX_FILE + 1)
    if not content or len(content) > MAX_FILE:
        raise ValueError('檔案須有內容且不超過 10 MB')
    meta = {'id': uuid4().hex, 'name': name, 'size': len(content)}
    folder().mkdir(parents=True, exist_ok=True)
    (folder() / meta['id']).write_bytes(content)
    return meta


@bp.route('/api/campus/office-resources', methods=['GET', 'POST'])
@require('學生', *EDIT_ROLES)
def collection():
    user = current_user()
    if request.method == 'GET':
        office = request.args.get('office', '').strip()
        return ok(data=[r for r in resources() if not office or r['office'] == office])
    if user['role'] not in EDIT_ROLES:
        return error('沒有上傳權限', 403)
    office = request.form.get('office', '').strip() if user['role'] == '管理員' else my_office(user)
    title = request.form.get('title', '').strip()[:100]
    kind = request.form.get('kind', '')
    description = request.form.get('description', '').strip()[:500]
    if office not in offices() or not may_edit(user, office):
        return error('只能維護所屬處室的文件', 403)
    if not title or kind not in ('SOP', '表單範例'):
        return error('請填文件名稱與類型')
    try:
        meta = upload()
    except ValueError as exc:
        return error(str(exc))
    if not meta:
        return error('請上傳檔案')
    with store.lock:
        rows = resources()
        item = {'id': next_id(rows), 'office': office, 'title': title, 'kind': kind,
                'description': description, 'file': meta, 'updated_by': user['username'],
                'updated_at': now_str(), 'version': 1}
        rows.append(item)
        store.save()
    deps.write_audit_log('office_resources', item['id'], '新增', after=item)
    return ok(data=item, message='文件已上傳')


@bp.route('/api/campus/office-resources/<int:resource_id>', methods=['POST'])
@require(*EDIT_ROLES)
def update(resource_id):
    user = current_user()
    with store.lock:
        item = next((r for r in resources() if r['id'] == resource_id), None)
        if not item:
            return error('找不到文件', 404)
        if not may_edit(user, item['office']):
            return error('只能維護所屬處室的文件', 403)
        title = request.form.get('title', item['title']).strip()[:100]
        kind = request.form.get('kind', item['kind'])
        if not title or kind not in ('SOP', '表單範例'):
            return error('請填文件名稱與類型')
        try:
            meta = upload()
        except ValueError as exc:
            return error(str(exc))
        before = dict(item)
        item.update(title=title, kind=kind, description=request.form.get('description', item['description']).strip()[:500],
                    file=meta or item['file'], updated_by=user['username'], updated_at=now_str(), version=item['version'] + 1)
        store.save()
    deps.write_audit_log('office_resources', resource_id, '修改', before=before, after=item)
    return ok(data=item, message='文件已更新')


@bp.route('/api/campus/office-resources/<int:resource_id>/file')
@require('學生', *EDIT_ROLES)
def download(resource_id):
    item = next((r for r in resources() if r['id'] == resource_id), None)
    path = folder() / item['file']['id'] if item else None
    if not path or not path.is_file():
        return error('找不到檔案', 404)
    response = send_file(BytesIO(path.read_bytes()), as_attachment=True,
                         download_name=item['file']['name'], mimetype='application/octet-stream')
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
