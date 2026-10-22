"""Public homepage sharing: encode only the configured canonical URL, never user/session data."""
import ipaddress
import os
from io import BytesIO
from urllib.parse import urlsplit, urlunsplit, quote

from flask import Blueprint, jsonify, Response
import qrcode
from qrcode.image.svg import SvgPathFillImage

bp = Blueprint('public_portal', __name__)


def public_site_url():
    raw = (os.getenv('PUBLIC_SITE_URL') or os.getenv('RENDER_EXTERNAL_URL') or '').strip(' ')
    if len(raw) > 2048:
        return None
    try:
        parsed = urlsplit(raw)
        host = (parsed.hostname or '').lower().rstrip('.')
        if parsed.scheme != 'https' or not host or parsed.username or parsed.password:
            return None
        if parsed.port not in (None, 443) or parsed.path not in ('', '/') or parsed.query or parsed.fragment:
            return None
        if host in ('localhost', 'localhost.localdomain') or host.endswith(('.localhost', '.local', '.internal')) or '.' not in host:
            return None
        try:
            if not ipaddress.ip_address(host).is_global:
                return None
        except ValueError:
            pass
        # Require a DNS hostname or a valid IPv6 literal and reject whitespace/control characters.
        if any(c.isspace() or ord(c) < 32 for c in raw) or '\\' in raw:
            return None
        return urlunsplit(('https', parsed.netloc, '/', '', ''))
    except ValueError:
        return None


@bp.route('/api/public-site', methods=['GET'])
def public_site():
    url = public_site_url()
    text = '校園智慧官網｜Smart UKN\n' + (url or '')
    response = jsonify(status='success', title='校園智慧官網', public_url=url,
                       ready=bool(url), qr_url='/api/public-site/qr.svg' if url else None,
                       line_url='https://line.me/R/share?text=' + quote(text, safe='') if url else None)
    response.headers['Cache-Control'] = 'no-store'
    return response


@bp.route('/api/public-site/qr.svg', methods=['GET'])
def public_site_qr():
    url = public_site_url()
    if not url:
        return jsonify(status='error', message='公開網址尚未設定，請先完成網站上線。'), 409
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    output = BytesIO()
    qr.make_image(image_factory=SvgPathFillImage).save(output)
    response = Response(output.getvalue(), mimetype='image/svg+xml')
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Content-Disposition'] = 'inline; filename="smart-ukn-qr.svg"'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


@bp.get('/healthz')
def healthz():
    # A deployment health probe must not depend on MySQL or expose a session account.
    return jsonify(status='ok'), 200
