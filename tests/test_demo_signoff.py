"""Version-bound approvals, private certificates and public privacy-preserving verification."""
from base64 import b64decode
from hashlib import sha256
from io import BytesIO
from copy import deepcopy
from pathlib import Path
import pytest
from campus import admin_cases, demo_signoff

BASE='/api/campus/admin-cases'

def create(client,login):
    login('student1')
    r=client.post(BASE,json={'kind':'成績單申請','title':'【示範】簽核驗收','detail':'虛構申請，不含真實成績','answers':{'申請用途':'示範獎學金','申請份數':'1','領取方式':'櫃檯示範'}})
    assert r.status_code==200,r.get_json()
    item=r.get_json()['data']
    login('admin','admin123')
    r=client.post(f"{BASE}/{item['id']}",json={'action':'start','revision':item['revision']})
    assert r.status_code==200
    return r.get_json()['data']

def act(client,item,action,**extra):
    return client.post(f"{BASE}/{item['id']}",json={'action':action,'revision':item['revision'],**extra})

def approve(client,item,action):
    r=act(client,item,action,checked_steps=item['workflow'][item['workflow_index']]['checks'],note='【示範】核對完成',signoff_confirmed=True,review_digest=item['review_digest'])
    assert r.status_code==200,r.get_json()
    return r.get_json()['data']

def finish(client,item):
    item=approve(client,item,'advance')
    item=act(client,item,'start').get_json()['data']
    return approve(client,item,'complete')

def test_confirmation_and_version_binding(client,login):
    item=create(client,login)
    kwargs={'checked_steps':item['workflow'][0]['checks'],'note':'核對完成'}
    assert act(client,item,'advance',**kwargs).status_code==400
    assert act(client,item,'advance',signoff_confirmed=True,review_digest='wrong',**kwargs).status_code==400
    assert client.get(f"{BASE}/{item['id']}/certificate.pdf").status_code==404
    item=finish(client,item)
    assert item['certificate']['integrity_ok']
    assert len(item['signoffs'])==2
    assert all('snapshot' not in s for s in item['signoffs'])
    assert 'pdf_base64' not in str(item['certificate'])
    assert item['signoffs'][1]['previous_sha256']==item['signoffs'][0]['record_sha256']
    assert act(client,item,'complete',**kwargs).status_code==409


def test_pdf_download_qr_public_privacy_and_tamper(client,login):
    item=finish(client,create(client,login))
    cert=item['certificate'];cid=item['id']
    assert cert['serial'].endswith(f'{cid:06d}')
    login('student2')
    assert client.get(cert['download_url']).status_code==404
    assert client.get(cert['qr_url']).status_code==404
    login('student1')
    pdf=client.get(cert['download_url'])
    assert pdf.status_code==200 and pdf.data.startswith(b'%PDF')
    assert sha256(pdf.data).hexdigest()==cert['pdf_sha256']
    from pypdf import PdfReader
    text=''.join(p.extract_text() for p in PdfReader(BytesIO(pdf.data)).pages)
    assert cert['serial'] in text
    assert '非學校正式證明' in text
    assert '成績單申請審核完成證明' in text
    assert client.get(cert['qr_url']).mimetype=='image/svg+xml'
    client.post('/api/auth/logout')
    verified=client.get(cert['verification_path'])
    assert verified.status_code==200
    html=verified.get_data(as_text=True)
    assert cert['serial'] in html
    assert '王小明' not in html and 'S112001' not in html and '示範獎學金' not in html
    assert 'no-store' in verified.headers['Cache-Control']
    assert client.get('/verify/demo-documents/'+'0'*32).status_code==404
    stored=next(c for c in admin_cases.cases() if c['id']==cid)
    assert demo_signoff.integrity(stored)
    stored['answers']['申請用途']='篡改'
    assert client.get(cert['verification_path']).status_code==409
    login('student1')
    assert client.get(cert['download_url']).status_code==409


def test_signoff_and_pdf_bytes_tampering_fail_closed(client,login):
    item=finish(client,create(client,login))
    saved=next(c for c in admin_cases.cases() if c['id']==item['id'])
    original=deepcopy(saved)
    saved['signoffs'][0]['actor_name']='冒名'
    assert not demo_signoff.integrity(saved)
    saved.clear();saved.update(deepcopy(original))
    saved['certificate']['pdf_base64']='YWR1bHRlcmF0ZWQ='
    assert not demo_signoff.integrity(saved)
    saved.clear();saved.update(deepcopy(original))
    saved['certificate']['manifest']['serial']='FAKE'
    assert not demo_signoff.integrity(saved)


def test_unique_serials_and_local_url_not_host_header(client,login):
    first=finish(client,create(client,login))
    second=finish(client,create(client,login))
    assert first['certificate']['serial']!=second['certificate']['serial']
    assert first['certificate']['verification_path']!=second['certificate']['verification_path']
    assert first['certificate']['verification_url'].startswith('http://127.0.0.1:8014/')


def test_correction_preserves_original_and_requires_authorized_confirmation(client,login):
    item=finish(client,create(client,login))
    original=item['certificate']
    saved=next(c for c in admin_cases.cases() if c['id']==item['id'])
    pdf_before=saved['certificate']['pdf_base64']
    path=f"{BASE}/{item['id']}/certificate/reissue"
    request={'revision':item['revision'],'note':'更正示範版面','signoff_confirmed':True,'review_digest':item['review_digest']}
    login('student1')
    assert client.post(path,json=request).status_code==403
    login('admin','admin123')
    assert client.post(path,json={**request,'signoff_confirmed':False}).status_code==400
    r=client.post(path,json=request)
    assert r.status_code==200,r.get_json()
    updated=r.get_json()['data']
    assert updated['certificate']['serial']==original['serial']
    assert updated['certificate']['version']==2 and updated['certificate']['integrity_ok']
    assert len(updated['certificate_versions'])==1
    assert 'pdf_base64' not in str(updated['certificate_versions'])
    assert saved['certificate_versions'][0]['certificate']['pdf_base64']==pdf_before
    client.post('/api/auth/logout')
    prior=client.get(original['verification_path'])
    assert prior.status_code==200 and '已由新版取代' in prior.get_data(as_text=True)
    assert client.get(updated['certificate']['verification_path']).status_code==200
