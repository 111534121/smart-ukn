"""Traceable demo approvals and private PDF certificates, not legal digital signatures."""
import base64
from copy import deepcopy
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, Response, render_template, send_file
import qrcode
from qrcode.image.svg import SvgPathFillImage

from .common import current_user, error, require
from . import admin_case_store
from public_portal import public_site_url

bp = Blueprint('demo_signoff', __name__)

NOTICE = '本文件為專題展示用途，非學校正式證明。'

def digest(value):
    return sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def supported(item):
    return item.get('kind') == '成績單申請' and item.get('is_demo_workflow') is True

def evidence(item):
    from .admin_cases import upload_root
    result = {k: deepcopy(item.get(k)) for k in ('id','kind','title','detail','student_id','student_name','applicant_username','answers','workflow','workflow_index','revision','status','history','supplements')}
    result['files'] = []
    for meta in item.get('files', []):
        path = upload_root() / meta['id']
        if not path.is_file():
            raise ValueError('案件附件遺失，無法確認審核版本')
        result['files'].append({**meta, 'sha256': sha256(path.read_bytes()).hexdigest()})
    return result

def review_digest(item):
    return digest(evidence(item))

def approve(before, updated, data, note):
    from .admin_cases import assignments, stamp
    if data.get('signoff_confirmed') is not True:
        raise ValueError('請確認已核對本版本資料並同意線上簽核')
    snapshot = evidence(before)
    if data.get('review_digest') != digest(snapshot):
        raise ValueError('待審資料已變更，請重新載入後再簽核')
    actor = current_user()
    record = {'actor_username':actor['username'], 'actor_name':actor['full_name'] or actor['username'],
              'actor_role':actor['role'], 'actor_office':assignments().get(actor['username']) or before['office'],
              'at':stamp(), 'case_revision':before['revision'], 'step_index':before['workflow_index'],
              'step_name':before['workflow'][before['workflow_index']]['name'],
              'outcome':'審核通過', 'note':note, 'checked_steps':deepcopy(data['checked_steps']),
              'snapshot':snapshot, 'snapshot_sha256':digest(snapshot),
              'previous_sha256':(before.get('signoffs') or [{}])[-1].get('record_sha256','')}
    record['record_sha256'] = digest(record)
    updated.setdefault('signoffs', []).append(record)

def valid_signoffs(item):
    previous = ''
    for record in item.get('signoffs', []):
        plain = {k:v for k,v in record.items() if k != 'record_sha256'}
        if record.get('previous_sha256') != previous or digest(plain) != record.get('record_sha256') or digest(record.get('snapshot')) != record.get('snapshot_sha256'):
            return False
        previous = record['record_sha256']
    return bool(previous)

def issue(item, previous=None):
    from .admin_cases import stamp
    if item.get('certificate'):
        raise ValueError('此案件已核發示範證明')
    if not valid_signoffs(item):
        raise ValueError('簽核紀錄完整性檢查未通過')
    issued = stamp()
    token = uuid4().hex
    base = public_site_url() or 'http://127.0.0.1:8014/'
    manifest = {'serial':f"DEMO-KN-{issued[:10].replace('-','')}-{item['id']:06d}", 'version':(previous['manifest']['version']+1 if previous else 1),
                'issued_at':issued, 'office':item['office'], 'case_id':item['id'], 'notice':NOTICE,
                'evidence_sha256':review_digest(item), 'signoffs_sha256':digest(item['signoffs']),
                'verification_url':base.rstrip('/')+'/verify/demo-documents/'+token,
                'verification_path':'/verify/demo-documents/'+token,
                'qr_scope':'public' if public_site_url() else 'local'}
    if previous:
        manifest['serial'] = previous['manifest']['serial']
    manifest_hash = digest(manifest)
    pdf = make_pdf(item, manifest, manifest_hash)
    item['certificate'] = {'manifest':manifest, 'manifest_sha256':manifest_hash,
                           'pdf_sha256':sha256(pdf).hexdigest(), 'pdf_base64':base64.b64encode(pdf).decode()}

def integrity(item):
    try:
        cert = item['certificate']
        return (item['status']=='已完成' and valid_signoffs(item)
                and digest(cert['manifest'])==cert['manifest_sha256']
                and review_digest(item)==cert['manifest']['evidence_sha256']
                and digest(item['signoffs'])==cert['manifest']['signoffs_sha256']
                and sha256(base64.b64decode(cert['pdf_base64'],validate=True)).hexdigest()==cert['pdf_sha256'])
    except (KeyError, ValueError, TypeError):
        return False

def archived_integrity(archive):
    try:
        cert=archive['certificate']
        return (digest(cert['manifest'])==cert['manifest_sha256']
                and digest(archive['evidence'])==cert['manifest']['evidence_sha256']
                and digest(archive['signoffs'])==cert['manifest']['signoffs_sha256']
                and valid_signoffs({'signoffs':archive['signoffs']})
                and sha256(base64.b64decode(cert['pdf_base64'],validate=True)).hexdigest()==cert['pdf_sha256'])
    except (KeyError,ValueError,TypeError):
        return False


def summary(item):
    cert = item.get('certificate')
    if not cert:
        return None
    manifest = cert['manifest']
    return {**manifest, 'manifest_sha256':cert['manifest_sha256'], 'pdf_sha256':cert['pdf_sha256'],
            'integrity_ok':integrity(item), 'download_url':f"/api/campus/admin-cases/{item['id']}/certificate.pdf",
            'qr_url':f"/api/campus/admin-cases/{item['id']}/certificate-qr.svg"}

def make_pdf(item, manifest, manifest_hash):
    # Kept inside the generator so an absent optional PDF dependency cannot break other services.
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import Paragraph
    from reportlab.lib.styles import ParagraphStyle
    from xml.sax.saxutils import escape
    font = 'MSung-Light'
    if font not in pdfmetrics.getRegisteredFontNames():
        font_path = Path('C:/Windows/Fonts/msjh.ttc')
        if font_path.is_file():
            font = 'DemoChinese'
            if font not in pdfmetrics.getRegisteredFontNames():
                pdfmetrics.registerFont(TTFont(font,str(font_path),subfontIndex=0))
        else:
            pdfmetrics.registerFont(UnicodeCIDFont(font))
    out = BytesIO()
    c = canvas.Canvas(out, pagesize=(595.28,841.89), invariant=1)
    c.setTitle('成績單申請審核完成證明（示範）')
    c.setAuthor('校園智慧官網 - 專題示範')
    c.setFillColor(colors.HexColor('#003377')); c.rect(0,759,596,83,fill=1,stroke=0)
    c.setFont(font,18); c.setFillColor(colors.white); c.drawString(40,799,'校園智慧官網')
    c.setFont(font,11); c.drawString(40,776,'可追溯線上簽核 / 專題示範文件')
    style = ParagraphStyle('body',fontName=font,fontSize=11,leading=19,textColor=colors.HexColor('#18324c'))
    def paragraph(text,y,size=11,color=None):
        local = ParagraphStyle('line',parent=style,fontSize=size,leading=size+8,textColor=color or style.textColor)
        p = Paragraph(escape(str(text)),local); _,h=p.wrap(510,1000);p.drawOn(c,42,y-h);return y-h-12
    y=730
    y=paragraph('成績單申請審核完成證明（示範）',y,19)
    for text in [NOTICE,'本證明僅展示申辦審核結果，不含真實成績，非正式成績單。',
                 '文件編號：'+manifest['serial']+' / 版本：'+str(manifest['version']),
                 f"案件：#{item['id']}　申請人：{item['student_name']}（{item['student_id']}）",
                 '核發單位：'+manifest['office']+'　核發時間：'+manifest['issued_at']+'（臺灣時間）',
                 '本文件經「校園智慧官網」示範流程線上審核通過。']:
        y=paragraph(text,y)
    approval = item['signoffs'][-1]
    y=paragraph('本次線上簽核',y,13)
    for text in [f"{approval['at']} / {approval['actor_office']} / {approval['actor_name']}（{approval['actor_username']}）",
                 '審核步驟：'+approval['step_name']+' / '+approval['outcome'],
                 f"核對案件版本：{approval['case_revision']} / 文件版本：{manifest['version']}",
                 '舊有步驟保留原處理紀錄，未追溯補作或回填過去的簽核時間。']:
        y=paragraph(text,y,10)
    qr_buffer=BytesIO();qrcode.make(manifest['verification_url'],box_size=6,border=4).save(qr_buffer,format='PNG')
    c.drawImage(ImageReader(qr_buffer),42,85,width=120,height=120,mask='auto')
    c.setFillColor(colors.HexColor('#18324c'));c.setFont(font,10);c.drawString(178,190,'掃描 QR Code 查詢核發狀態')
    note='本機示範網址；跨裝置掃碼需公開網址。' if manifest['qr_scope']=='local' else '請核對流水號與下載檔案 SHA-256。'
    c.drawString(178,169,note)
    c.drawString(178,148,'本文件使用帳號簽核與摘要校驗，非憑證數位簽章。')
    c.setFont('Helvetica',7);c.drawString(178,126,'Manifest SHA-256:');c.drawString(178,112,manifest_hash[:40]);c.drawString(178,101,manifest_hash[40:])
    c.setFont(font,9);c.setFillColor(colors.HexColor('#52657b'));c.drawString(42,42,NOTICE+'　1 / 1')
    c.showPage();c.save();return out.getvalue()

@bp.route('/api/campus/admin-cases/<int:case_id>/certificate.pdf', methods=['GET'])
@require('學生','教職員','處室承辦','科助','住宿管理員','管理員')
def demo_certificate_pdf(case_id):
    from .admin_cases import cases, visible
    item = next((c for c in cases() if c['id']==case_id and visible(c)),None)
    if not item or not item.get('certificate'):
        return error('找不到可下載的示範證明',404)
    if not integrity(item):
        return error('文件完整性檢查未通過，請洽承辦單位',409)
    cert=item['certificate']
    response=send_file(BytesIO(base64.b64decode(cert['pdf_base64'])),mimetype='application/pdf',as_attachment=True,download_name=cert['manifest']['serial']+'-v'+str(cert['manifest']['version'])+'.pdf')
    response.headers['Cache-Control']='no-store';response.headers['X-Content-Type-Options']='nosniff'
    return response

@bp.route('/api/campus/admin-cases/<int:case_id>/certificate-qr.svg', methods=['GET'])
@require('學生','教職員','處室承辦','科助','住宿管理員','管理員')
def demo_certificate_qr(case_id):
    from .admin_cases import cases, visible
    item = next((c for c in cases() if c['id']==case_id and visible(c)),None)
    if not item or not item.get('certificate'):
        return error('找不到可驗證的示範證明',404)
    if not integrity(item): return error('文件完整性檢查未通過',409)
    buffer=BytesIO();qr=qrcode.QRCode(box_size=6,border=4);qr.add_data(item['certificate']['manifest']['verification_url']);qr.make(fit=True);qr.make_image(image_factory=SvgPathFillImage).save(buffer)
    response=Response(buffer.getvalue(),mimetype='image/svg+xml');response.headers['Cache-Control']='no-store';response.headers['X-Content-Type-Options']='nosniff';return response

@bp.route('/api/campus/admin-cases/<int:case_id>/certificate/reissue', methods=['POST'])
@require('教職員','處室承辦','科助','住宿管理員','管理員')
def demo_certificate_reissue(case_id):
    from .admin_cases import cases, can_manage, form_data, history, payload, stamp, text
    from .common import store, deps, ok
    with store.lock:
        item=next((c for c in cases() if c['id']==case_id and can_manage(c)),None)
        if not item or not supported(item) or item['status']!='已完成' or not item.get('certificate'):
            return error('找不到可更正的示範證明',404)
        try:
            data=form_data()
            if str(data.get('revision'))!=str(item['revision']):
                return error('案件已更新，請重新載入後再操作',409)
            if not integrity(item): return error('原文件完整性檢查未通過，不可更正',409)
            note=text(data,'note')
            if not note: return error('請填寫更正原因')
            before=deepcopy(item)
            updated=deepcopy(item)
            data['checked_steps']=item['workflow'][item['workflow_index']]['checks']
            approve(item,updated,data,'更正版簽核：'+note)
            archive={'certificate':deepcopy(item['certificate']),'evidence':evidence(item),
                     'signoffs':deepcopy(item['signoffs']),'superseded_at':stamp()}
            updated.setdefault('certificate_versions',[]).append(archive)
            previous=updated.pop('certificate')
            history(updated,'示範證明更正版核發',note)
            issue(updated,previous=previous)
            if not admin_case_store.update(updated,item['revision']):
                return error('案件已更新，請重新載入後再操作',409)
            deps.write_audit_log('admin_cases',case_id,'示範證明更正版核發',before=before,after=updated)
            return ok(data=payload(updated),message='更正版已核發，原版本保留')
        except (ValueError,TypeError) as exc:
            return error(str(exc))

@bp.route('/verify/demo-documents/<token>', methods=['GET'])
def demo_certificate_verify(token):
    if len(token)!=32 or any(c not in '0123456789abcdef' for c in token): return error('查無示範文件',404)
    item=None; archive=None; path='/verify/demo-documents/'+token
    for candidate in admin_case_store.all_cases():
        if candidate.get('certificate',{}).get('manifest',{}).get('verification_path')==path:
            item=candidate; break
        prior=next((v for v in candidate.get('certificate_versions',[]) if v['certificate']['manifest']['verification_path']==path),None)
        if prior:
            item=candidate; archive=prior; break
    if not item: return error('查無示範文件',404)
    valid=archived_integrity(archive) if archive else integrity(item)
    cert=archive['certificate'] if archive else item['certificate']
    # Public result intentionally excludes applicant identities, notes and approval snapshots.
    response=Response(render_template('demo_certificate_verify.html',valid=valid,superseded=bool(archive),document=cert['manifest'],pdf_hash=cert['pdf_sha256']),status=200 if valid else 409,mimetype='text/html')
    response.headers.update({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'"})
    return response
