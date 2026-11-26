"""管理員上傳校規 PDF，擷取可搜尋的頁面文字。影像掃描件需先做 OCR。"""
from datetime import datetime
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, request, send_file
from pypdf import PdfReader

from .common import current_user, deps, error, ok, require, store

bp = Blueprint('knowledge_documents', __name__)
MAX_FILE = 15 * 1024 * 1024


def documents():
    return store.section('knowledge_documents', list)


def folder():
    return Path(store.path).parent / 'knowledge_documents'


def search_records():
    return [{'id': f"pdf-{doc['id']}-{page['page']}", 'keyword': doc['title'],
             'official_term': doc['title'], 'content': page['text'], 'subcategory': doc['kind'],
             'category_name': '上傳文件', 'doc_name': doc['file_name'], 'page': page['page'],
             'url': doc.get('source_url') or f"/api/admin/knowledge-documents/{doc['id']}/file",
             'local_url': f"/api/admin/knowledge-documents/{doc['id']}/file",
             'updated_at': doc['updated_at']}
            for doc in documents() for page in doc['pages']]


def extract_pdf(file):
    if not file or not file.filename.lower().endswith('.pdf'):
        raise ValueError('請上傳 PDF')
    content = file.read(MAX_FILE + 1)
    if not content or len(content) > MAX_FILE:
        raise ValueError('PDF 須有內容且不超過 15 MB')
    try:
        reader = PdfReader(BytesIO(content))
        if reader.is_encrypted or len(reader.pages) > 100:
            raise ValueError('不支援加密或超過 100 頁的 PDF')
        pages = [{'page': i, 'text': (page.extract_text() or '').strip()[:6000]}
                 for i, page in enumerate(reader.pages, 1)]
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError('PDF 無法讀取') from exc
    pages = [page for page in pages if page['text']]
    if not pages:
        raise ValueError('PDF 沒有可擷取的文字，請先使用 OCR')
    return file.filename.replace('\\', '/').split('/')[-1][:150], content, pages


@bp.route('/admin-knowledge-documents')
@require('管理員')
def page():
    return current_app.send_static_file('admin-knowledge-documents.html')


@bp.route('/api/admin/knowledge-documents', methods=['GET', 'POST'])
@require('管理員')
def collection():
    if request.method == 'GET':
        return ok(data=[{k: v for k, v in doc.items() if k != 'pages'} | {'page_count': len(doc['pages'])}
                        for doc in documents()])
    title = request.form.get('title', '').strip()[:100]
    kind = request.form.get('kind', '校規')
    if not title or kind not in ('校規', '表單', '招生', '課務'):
        return error('請填文件名稱與類型')
    try:
        name, content, pages = extract_pdf(request.files.get('file'))
    except ValueError as exc:
        return error(str(exc))
    with store.lock:
        ident = uuid4().hex
        folder().mkdir(parents=True, exist_ok=True)
        (folder() / ident).write_bytes(content)
        item = {'id': ident, 'title': title, 'kind': kind, 'file_name': name,
                'pages': pages, 'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'updated_by': current_user()['username']}
        documents().append(item)
        store.save()
    deps.write_audit_log('knowledge_documents', ident, '新增', after={'title': title, 'pages': len(pages)})
    return ok(data={'id': ident, 'page_count': len(pages)}, message='PDF 文字已加入搜尋')


@bp.route('/api/admin/knowledge-documents/<document_id>', methods=['POST'])
@require('管理員')
def update(document_id):
    title = request.form.get('title', '').strip()[:100]
    kind = request.form.get('kind', '校規')
    if not title or kind not in ('校規', '表單', '招生', '課務'):
        return error('請填文件名稱與類型')
    try:
        name, content, pages = extract_pdf(request.files.get('file'))
    except ValueError as exc:
        return error(str(exc))
    with store.lock:
        item = next((doc for doc in documents() if doc['id'] == document_id), None)
        if not item:
            return error('找不到文件', 404)
        before = {'title': item['title'], 'page_count': len(item['pages'])}
        (folder() / document_id).write_bytes(content)
        item.update(title=title, kind=kind, file_name=name, pages=pages,
                    updated_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), updated_by=current_user()['username'])
        store.save()
    deps.write_audit_log('knowledge_documents', document_id, '修改', before=before,
                         after={'title': title, 'page_count': len(pages)})
    return ok(data={'id': document_id, 'page_count': len(pages)}, message='PDF 文字已更新')


@bp.route('/api/admin/knowledge-documents/<document_id>/file')
def download(document_id):
    item = next((doc for doc in documents() if doc['id'] == document_id), None)
    path = folder() / document_id if item else None
    if not path or not path.is_file():
        return error('找不到文件', 404)
    response = send_file(BytesIO(path.read_bytes()), download_name=item['file_name'],
                         mimetype='application/pdf', as_attachment=True)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response
