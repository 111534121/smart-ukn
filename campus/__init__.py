"""Smart UKN 校園生活新功能 (行事曆、選課檢查、證照審核、科上通知、租借、地圖、天氣…)。

app.py 最後呼叫 campus.init_app(app, deps) 註冊所有 blueprint；deps 為 app.py 既有的資料與函式。
"""
from . import activity_campaigns, calendar_ext, certificates, counseling, courses_ext, events, facilities, info, messaging, records, reports, rules_ext, services, visits
from .common import deps as _deps
from . import admin_cases, demo_signoff, office_resources, knowledge_documents, graduation_projects, graduation_roster
from . import management, line_notifications, student_lobby
from . import achievements
from . import assistant_classes
from . import assistant_admissions
from . import assistant_internships
from . import admissions_consultation
from . import teacher_smart


def init_app(app, deps):
    _deps.__dict__.update(deps.__dict__)
    for module in (calendar_ext, courses_ext, rules_ext, certificates, messaging, counseling,
                   facilities, info, services, reports, records, visits, admin_cases, demo_signoff, office_resources, knowledge_documents, admissions_consultation, events, activity_campaigns, graduation_projects, graduation_roster, assistant_classes, assistant_admissions, assistant_internships, line_notifications, student_lobby, management, achievements, teacher_smart):
        app.register_blueprint(module.bp)
    with app.app_context():
        certificates.init_sync()
    if not app.config.get('TESTING'):
        admin_cases.start_reminder_worker(app)
        messaging.start_receipt_reminder_worker(app)
