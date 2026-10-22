import os
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from xml.etree import ElementTree

import pytest
import public_portal


@pytest.fixture(autouse=True)
def no_public_url(monkeypatch):
    monkeypatch.delenv('PUBLIC_SITE_URL', raising=False)
    monkeypatch.delenv('RENDER_EXTERNAL_URL', raising=False)


def test_preview_disables_qr_and_ignores_host(client):
    result = client.get('/api/public-site', headers={'Host': 'attacker.example'}).get_json()
    assert result['ready'] is False
    assert result['public_url'] is None
    assert result['line_url'] is None
    assert client.get('/api/public-site/qr.svg?url=https://attacker.example').status_code == 409


@pytest.mark.parametrize('url', [
    'http://campus.example.edu', 'https://localhost', 'https://127.0.0.1',
    'https://192.168.1.20', 'https://[::1]', 'https://school.local',
    'https://user:pass@campus.example.edu', 'https://campus.example.edu/student',
    'https://campus.example.edu/?token=secret', 'https://campus.example.edu/#private',
    'https://campus.example.edu:8000', 'https://campus.example.edu/\n',
])
def test_reject_nonpublic_or_private_urls(monkeypatch, url):
    monkeypatch.setenv('PUBLIC_SITE_URL', url)
    assert public_portal.public_site_url() is None


def test_canonical_sharing_and_qr_payload(client, monkeypatch):
    monkeypatch.setenv('PUBLIC_SITE_URL', 'https://campus.example.edu')
    captured = []
    original = public_portal.qrcode.QRCode.add_data
    def capture(self, data, *args, **kwargs):
        captured.append(data)
        return original(self, data, *args, **kwargs)
    monkeypatch.setattr(public_portal.qrcode.QRCode, 'add_data', capture)
    with client.session_transaction() as session:
        session['username'] = 'private-account'
    result = client.get('/api/public-site?token=private-token').get_json()
    assert result['public_url'] == 'https://campus.example.edu/'
    text = parse_qs(urlsplit(result['line_url']).query)['text'][0]
    assert text == '校園智慧官網｜Smart UKN\nhttps://campus.example.edu/'
    qr = client.get('/api/public-site/qr.svg?url=https://attacker.example')
    assert qr.status_code == 200
    assert qr.mimetype == 'image/svg+xml'
    assert ElementTree.fromstring(qr.data).tag.endswith('svg')
    assert captured == ['https://campus.example.edu/']
    assert 'no-store' in qr.headers['Cache-Control']


def test_render_url_and_override(monkeypatch):
    monkeypatch.setenv('RENDER_EXTERNAL_URL', 'https://assigned-name.onrender.com')
    assert public_portal.public_site_url() == 'https://assigned-name.onrender.com/'
    monkeypatch.setenv('PUBLIC_SITE_URL', 'https://campus.example.edu/')
    assert public_portal.public_site_url() == 'https://campus.example.edu/'


def test_health_probe_has_no_identity_or_db_dependency(client):
    assert client.get('/healthz').get_json() == {'status': 'ok'}


def test_persistent_bootstrap_seeds_only_once(monkeypatch, tmp_path):
    import wsgi
    monkeypatch.setattr(os, 'environ', os.environ.copy())
    for key in ['CAMPUS_DATA_DIR', 'UPLOAD_DIR', 'FORMS_DIR', 'LINKS_FILE', 'SCHOOL_CALENDAR_FILE']:
        os.environ.pop(key, None)
    monkeypatch.setenv('PERSISTENT_ROOT', str(tmp_path))
    wsgi.prepare_runtime()
    assert Path(os.environ['UPLOAD_DIR']).is_dir()
    assert Path(os.environ['LINKS_FILE']).exists()
    assert not (tmp_path / 'campus' / 'campus_store.json').exists()
    assert not (tmp_path / 'my_data.json').exists()
    Path(os.environ['LINKS_FILE']).write_text('keep-runtime-edits', encoding='utf-8')
    wsgi.prepare_runtime()
    assert Path(os.environ['LINKS_FILE']).read_text(encoding='utf-8') == 'keep-runtime-edits'
