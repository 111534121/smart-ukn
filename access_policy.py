"""Explicit capabilities for the two administration roles; no implicit staff inheritance."""
from flask import request, session
CONTENT_RULES = frozenset({
    '/api/rules', '/api/rules/<int:rule_id>', '/api/checklists', '/api/synonyms',
    '/api/synonyms/<int:synonym_id>', '/api/links', '/api/links/<int:link_id>',
    '/api/deadlines', '/api/academic-calendar', '/api/academic-calendar/<int:event_id>',
    '/api/admin/knowledge-documents', '/api/admin/knowledge-documents/<document_id>',
    '/admin-knowledge-documents', '/api/admin/school-calendar/sync',
})
SYSTEM_RULES = frozenset({'/api/admin/self-check', '/api/admin/audit-logs',
                          '/api/admin/visitor-logs', '/api/admin/visitor-logs/export.csv',
                          '/api/management/accounts', '/api/management/accounts/<int:user_id>/reset-password'})

def role_allowed(allowed):
    role = session.get('role')
    if role in allowed:
        return True
    rule = request.url_rule.rule if request.url_rule else ''
    if role == '內容管理員':
        return rule in CONTENT_RULES and bool({'管理員', '教職員'} & set(allowed))
    if role == '系統管理員':
        return rule in SYSTEM_RULES and '管理員' in allowed
    return False

PUBLIC_READ_RULES = frozenset({'/', '/login', '/api/auth/me', '/api/rules', '/api/checklists',
    '/api/categories', '/api/synonyms', '/api/links', '/api/departments', '/api/faq',
    '/api/health', '/api/stats', '/api/deadlines', '/api/academic-calendar',
    '/api/admissions-consultation/ask',
    '/api/school-calendar', '/api/courses', '/api/calendar/current-week', '/api/calendar/now'})

def install_guard(app):
    @app.before_request
    def separate_management_roles():
        role = session.get('role')
        if role not in ('系統管理員', '內容管理員') or not request.url_rule:
            return None
        rule = request.url_rule.rule
        if request.endpoint == 'static' or rule in ('/management', '/api/auth/logout', '/api/auth/login'):
            return None
        if (request.method in ('GET', 'HEAD') and (rule in PUBLIC_READ_RULES or rule == '/api/admin/knowledge-documents/<document_id>/file')) or rule == '/api/admissions-consultation/ask':
            return None
        allowed = CONTENT_RULES if role == '內容管理員' else SYSTEM_RULES
        if rule not in allowed:
            from flask import jsonify
            return jsonify(status='error', message='此操作不在您的管理權限範圍內'), 403
