"""Smart UKN 校園生活新功能 (行事曆、選課檢查、證照審核、科上通知、租借、地圖、天氣、桌寵…)。

app.py 最後呼叫 campus.init_app(app, deps) 註冊所有 blueprint；deps 為 app.py 既有的資料與函式。
"""
from . import calendar_ext, certificates, courses_ext, facilities, info, messaging, pet, rules_ext, services
from .common import deps as _deps


def init_app(app, deps):
    _deps.__dict__.update(deps.__dict__)
    for module in (calendar_ext, courses_ext, rules_ext, certificates, messaging,
                   facilities, info, services, pet):
        app.register_blueprint(module.bp)
    with app.app_context():
        certificates.init_sync()