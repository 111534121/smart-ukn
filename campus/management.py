"""Separated management entry; authorization remains enforced by each API."""
import secrets
from flask import Blueprint, redirect, make_response, request, jsonify
from werkzeug.security import generate_password_hash
from .common import require, current_user
bp = Blueprint('management', __name__)
@bp.route('/management')
@require('系統管理員', '內容管理員', '管理員')
def page():
    response = make_response(redirect('/'))
    response.headers['Cache-Control'] = 'no-store'
    return response

@bp.route('/api/management/accounts')
@require('系統管理員', '管理員')
def accounts():
    from app import get_db_connection, DEMO_USERS
    query = request.args.get('q', '').strip()[:80]
    if len(query) < 2:
        return jsonify(status='error', message='請輸入至少 2 個字元'), 400
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            like = f'%{query}%'
            cursor.execute('SELECT user_id, username, role, student_id, full_name FROM users '
                           'WHERE username LIKE %s OR full_name LIKE %s OR student_id LIKE %s '
                           'ORDER BY user_id LIMIT 30', (like, like, like))
            rows = cursor.fetchall()
            cursor.close()
            return jsonify(status='success', data=rows, source='database')
        finally:
            conn.close()
    rows = [{k: u.get(k) for k in ('user_id', 'username', 'role', 'student_id', 'full_name')}
            for u in DEMO_USERS if any(query.lower() in str(u.get(k) or '').lower()
                                       for k in ('username', 'student_id', 'full_name'))][:30]
    return jsonify(status='success', data=rows, source='demo')

@bp.route('/api/management/accounts/<int:user_id>/reset-password', methods=['POST'])
@require('系統管理員', '管理員')
def reset_password(user_id):
    from app import get_db_connection, write_audit_log
    if user_id == current_user()['user_id']:
        return jsonify(status='error', message='無法在此重設自己的密碼'), 400
    conn = get_db_connection()
    if not conn:
        return jsonify(status='error', message='資料庫未連線，無法重設正式帳號密碼'), 503
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT user_id, username, role FROM users WHERE user_id=%s', (user_id,))
        target = cursor.fetchone()
        if not target:
            return jsonify(status='error', message='查無此帳號'), 404
        if target['role'] in ('系統管理員', '管理員'):
            return jsonify(status='error', message='管理員帳號請由本人使用既有驗證流程處理'), 403
        temporary = secrets.token_urlsafe(18)
        cursor.execute('UPDATE users SET password_hash=%s WHERE user_id=%s',
                       (generate_password_hash(temporary), user_id))
        conn.commit()
        write_audit_log('users', user_id, '重設密碼',
                        before={'username': target['username']},
                        after={'username': target['username'], 'password_reset': True})
        response = jsonify(status='success', temporary_password=temporary,
                           message='密碼已重設；臨時密碼只顯示這一次，請安全交給帳號本人。')
        response.headers['Cache-Control'] = 'no-store'
        return response
    finally:
        conn.close()
