"""
線上申辦與進度追蹤、申請表單下載

- 學生在「行政申請流程」挑一項申辦，線上填表送出 → 依表單的簽核關卡逐關審核 → 完成 (或退回)
- 每一關誰能審：關卡 role 為「老師」時，導師班老師可簽 (教職員/管理員也可代為處理)；「教職員」關卡限教職員/管理員
- 學生、家長看得到每一關目前跑到哪；退回時附上原因，學生可修改後重新送出
- /forms/<code>：可列印的空白表單、?example=1 填寫範例、?download=doc 下載 Word 檔
  舊網址 /forms/xxx.pdf 會轉到新的表單頁；static/forms 內放了真正的檔案時直接下載該檔
- 線上蓋章：每一關核准時蓋電子章 (審核人、時間、驗證碼)，記在 history，然後自動送交下一關的審核人；
  /applications/<id>/signed 是填好內容 + 各關電子章的可列印申請表，/api/applications/stamp/<驗證碼> 可查驗真偽
- 上傳自己的申請表：學生把紙本 / 外部表單拍照或存成 PDF 上傳，自己挑要經過哪幾關 (導師、科主任、各處室…)，
  一樣逐關蓋章。存在同一張 online_applications (item_id = 0、form_code = 'upload')，檔案放 data/application_uploads
- 老師章：核准時蓋的是審核人自己的印章 (系統依姓名刻，或自己上傳的印章圖)，見 seals.py

app.py 呼叫 applications.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、write_audit_log、
load_checklists、load_student、class_student_ids、notify_student、forms_folder、upload_dir、seal_dir。
"""
import calendar
import hashlib
import json
import os
import uuid
from datetime import datetime
from types import SimpleNamespace
from urllib.parse import quote

from flask import Blueprint, jsonify, make_response, redirect, render_template, request, send_from_directory, session
from werkzeug.utils import safe_join, secure_filename

from .forms import COMMON_FIELDS, FORMS, GENERIC_FIELDS, form_code_from_url, stages_for, template_for_item
from .seals import SEAL_MAX_KB, SealStore, name_seal_svg, seal_text

bp = Blueprint("applications", __name__, template_folder="templates")
deps = SimpleNamespace()

STATUS_RUNNING, STATUS_DONE, STATUS_REJECTED, STATUS_WITHDRAWN = "審核中", "已完成", "已退回", "已撤回"
REVIEW_ROLES = ("老師", "教職員", "管理員", "系統管理員")
FIELD_MAX = 300
RETAIN_MONTHS = 3  # 完成 / 退回 / 撤回後保留幾個月 (蓋章申請表、上傳的檔案都看得到)
ROOT =os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---- 上傳自己的申請表 ----
UPLOAD_ITEM_ID, UPLOAD_FORM_CODE = 0, "upload"
UPLOAD_MAX_FILE_MB, UPLOAD_MAX_FILES, UPLOAD_MAX_TOTAL_MB = 5, 3, 15
UPLOAD_SIGNATURES = {"pdf": b"%PDF", "png": b"\x89PNG", "jpg": b"\xff\xd8\xff", "jpeg": b"\xff\xd8\xff"}
UPLOAD_FIELDS = [
    {"key": "title", "label": "申請項目"},
    {"key": "reason", "label": "申請事項說明"},
]
# 學生可以挑的簽章關卡 (依序)；role 決定誰能蓋：老師 = 導師班老師，教職員 = 處室承辦人
ROUTE_OPTIONS = [
    {"key": "advisor", "name": "導師簽章", "icon": "🧑‍🏫", "role": "老師"},
    {"key": "teacher", "name": "任課教師簽章", "icon": "👨‍🏫", "role": "老師"},
    {"key": "chair", "name": "科主任簽章", "icon": "🏫", "role": "老師"},
    {"key": "academic", "name": "教務處課務組", "icon": "🏢", "role": "教職員"},
    {"key": "registry", "name": "教務處註冊組", "icon": "🏢", "role": "教職員"},
    {"key": "student_affairs", "name": "學務處生輔組", "icon": "🏢", "role": "教職員"},
    {"key": "activities", "name": "學務處課外活動組", "icon": "🏢", "role": "教職員"},
    {"key": "general_affairs", "name": "總務處", "icon": "🏢", "role": "教職員"},
    {"key": "research", "name": "研究發展處", "icon": "🏢", "role": "教職員"},
    {"key": "general_edu", "name": "通識教育中心", "icon": "🏢", "role": "教職員"},
    {"key": "cashier", "name": "出納組", "icon": "💰", "role": "教職員"},
]
ROUTE_BY_KEY = {o["key"]: o for o in ROUTE_OPTIONS}
# 學生只要選「要申請什麼」，簽章關卡由系統依申請種類排好，不用自己挑
UPLOAD_TYPES = [
    {"key": "internship", "name": "校外實習申請", "route": ["advisor", "chair", "research"]},
    {"key": "suspend", "name": "休學申請", "route": ["advisor", "chair", "student_affairs", "registry"]},
    {"key": "resume", "name": "復學申請", "route": ["advisor", "registry"]},
    {"key": "transfer", "name": "轉科申請", "route": ["advisor", "chair", "registry"]},
    {"key": "credit_change", "name": "超修 / 減修學分申請", "route": ["advisor", "chair", "academic"]},
    {"key": "cross_class", "name": "跨班 / 跨部選課申請", "route": ["teacher", "chair", "academic"]},
    {"key": "makeup_exam", "name": "補考申請", "route": ["teacher", "academic"]},
    {"key": "gen_ed_credit", "name": "通識課程學分抵免", "route": ["general_edu", "academic"]},
    {"key": "enrollment_cert", "name": "在學證明 / 成績單申請", "route": ["registry"]},
    {"key": "student_card", "name": "學生證補發申請", "route": ["registry", "cashier"]},
    {"key": "tuition_defer", "name": "學雜費緩繳申請", "route": ["advisor", "student_affairs", "cashier"]},
    {"key": "club_event", "name": "社團活動申請", "route": ["activities"]},
    {"key": "venue", "name": "場地 / 器材借用申請", "route": ["activities", "general_affairs"]},
]
UPLOAD_TYPE_BY_KEY = {t["key"]: t for t in UPLOAD_TYPES}

# 上傳前可先下載的空白申請表 (/forms/upload_<key>)：各申請種類要填的欄位、附件
_REASON = {"key": "reason", "label": "申請原因", "long": True, "tip": "寫具體原因，承辦人才看得懂要辦什麼"}
UPLOAD_FORM_FIELDS = {
    "internship": ([{"key": "company", "label": "實習機構名稱", "example": "○○科技股份有限公司"},
                    {"key": "period", "label": "實習期間", "example": "2027-01-18 至 2027-02-19"},
                    {"key": "supervisor", "label": "機構指導人員 / 電話", "example": "李大華 經理 / 02-1234-5678"},
                    {**_REASON, "label": "實習內容", "example": "協助網站前端維護與測試。"}],
                   ["實習機構同意書", "家長同意書"]),
    "suspend": ([{"key": "period", "label": "休學期間", "example": "115 學年度第 2 學期起 1 學期"},
                 {**_REASON, "label": "休學原因", "example": "家庭因素需暫時返家協助。"}],
                ["家長同意書 (未成年者)", "學生證"]),
    "resume": ([{"key": "suspend_period", "label": "原休學期間", "example": "115 學年度第 2 學期"},
                {"key": "resume_term", "label": "復學學期", "example": "116 學年度第 1 學期"},
                {"key": "class_after", "label": "復學後編入班級", "example": "資管三忠"}],
               ["休學證明書"]),
    "transfer": ([{"key": "from_dept", "label": "原就讀科系", "example": "資訊管理科"},
                  {"key": "to_dept", "label": "申請轉入科系", "example": "數位設計科"},
                  {**_REASON, "label": "轉科原因", "example": "對設計領域較有興趣，已修過相關選修課。"}],
                 ["歷年成績單"]),
    "credit_change": ([{"key": "semester", "label": "學年度 / 學期", "example": "115 學年度第 2 學期"},
                       {"key": "change", "label": "超修 / 減修", "example": "超修 3 學分 (共 28 學分)"},
                       {**_REASON, "example": "上學期成績平均 85 分以上，想提早修完畢業學分。"}],
                      ["歷年成績單"]),
    "cross_class": ([{"key": "course", "label": "科目代碼 / 名稱", "example": "CS305 網頁程式設計"},
                     {"key": "class_name", "label": "開課班級", "example": "資管三孝 (進修部)"},
                     {"key": "teacher", "label": "任課教師", "example": "林志明 老師"},
                     {**_REASON, "example": "本班該科時段與重補修衝堂。"}], []),
    "makeup_exam": ([{"key": "course", "label": "科目代碼 / 名稱", "example": "CS201 資料結構"},
                     {"key": "exam", "label": "缺考考試", "example": "期中考 (2026-11-10)"},
                     {**_REASON, "label": "缺考原因", "example": "當天發燒就醫，附診斷證明。"}],
                    ["缺考證明 (就醫證明、公假單等)"]),
    "gen_ed_credit": ([{"key": "orig_course", "label": "原修習課程 / 學分", "example": "○○大學 生命教育 2 學分"},
                       {"key": "score", "label": "原課程成績", "example": "82 分"},
                       {"key": "target", "label": "申請抵免科目", "example": "通識 生命教育 2 學分"}],
                      ["原校成績單", "課程大綱"]),
    "enrollment_cert": ([{"key": "doc", "label": "申請文件", "example": "中文在學證明 2 份、英文成績單 1 份"},
                         {"key": "usage", "label": "用途", "example": "申請獎學金"},
                         {"key": "pickup", "label": "領取方式", "example": "臨櫃自取"}], []),
    "student_card": ([{"key": "cause", "label": "補發原因", "example": "遺失"},
                      {"key": "date", "label": "遺失 / 損壞日期", "example": "2026-11-12"}],
                     ["2 吋證件照 1 張", "補發費用收據"]),
    "tuition_defer": ([{"key": "semester", "label": "學年度 / 學期", "example": "115 學年度第 2 學期"},
                       {"key": "amount", "label": "緩繳金額", "example": "新臺幣 25,000 元"},
                       {"key": "pay_date", "label": "預計繳清日期", "example": "2027-04-30"},
                       {**_REASON, "example": "家中經濟臨時困難，學貸尚在審核中。"}],
                      ["相關證明文件 (如學貸申請證明)"]),
    "club_event": ([{"key": "club", "label": "社團名稱", "example": "資訊研究社"},
                    {"key": "event", "label": "活動名稱", "example": "期末程式黑客松"},
                    {"key": "time", "label": "活動時間 / 地點", "example": "2026-12-12 09:00-17:00 / 資訊大樓 501"},
                    {"key": "people", "label": "預計人數", "example": "40 人"},
                    {**_REASON, "label": "活動內容", "example": "分組實作校園服務小程式，下午成果發表。"}],
                   ["活動企劃書", "經費預算表"]),
    "venue": ([{"key": "place", "label": "借用場地 / 器材", "example": "活動中心 2 樓、無線麥克風 2 支"},
               {"key": "time", "label": "借用時間", "example": "2026-12-12 08:30-17:30"},
               {**_REASON, "label": "借用用途", "example": "資訊研究社期末黑客松。"}],
              []),
}


def upload_form_code(key):
    return f"upload_{key}"


def upload_form_template(code):
    """/forms/upload_<key> 的表單定義 (與 FORMS 同格式)；不是上傳種類回傳 None"""
    key = code[len("upload_"):] if code.startswith("upload_") else None
    t = UPLOAD_TYPE_BY_KEY.get(key)
    if not t:
        return None
    fields, attachments = UPLOAD_FORM_FIELDS.get(key, (GENERIC_FIELDS, []))
    signers = [{"name": ROUTE_BY_KEY[k]["name"], "icon": ROUTE_BY_KEY[k]["icon"], "role": ROUTE_BY_KEY[k]["role"]}
               for k in t["route"]]
    return {"title": t["name"] + ("表" if not t["name"].endswith("表") else ""),
            "office": signers[-1]["name"],
            "intro": "填好後拍照或存成 PDF，回到系統「上傳自己的申請表」送出，各關會線上蓋章。",
            "fields": [{**f, "example": f.get("example", "")} for f in fields],
            "signers": signers, "attachments": attachments,
            "notes": ["簽核欄不用自己找老師蓋，線上送出後系統會依序送到每一關。"]}

# MySQL 離線時的示範資料：王小明一張停修跑到「導師簽核」、一張證照獎勵已完成
DEMO_APPLICATIONS = [
    {"id": 1, "student_id": "S112001", "item_id": 1, "form_code": "course_withdraw_form", "business_name": "學生課程停修（棄修）申請",
     "fields": {"phone": "0912-345-678", "semester": "115 學年度第 1 學期", "course_code": "CS201", "course_name": "資料結構",
                "credits": "3", "teacher": "林志明 老師", "reason": "期中考後評估跟不上進度，擬於下學期重新修習。"},
     "stages": stages_for(FORMS["course_withdraw_form"]), "current_stage": 2, "status": STATUS_RUNNING,
     "history": [{"stage": 0, "action": "送出", "by": "王小明", "note": "", "at": "2026-10-14 09:12"},
                 {"stage": 1, "action": "核准", "by": "林志明 老師", "note": "同意停修，下學期記得重修。", "at": "2026-10-15 13:40"}],
     "submitted_at": "2026-10-14 09:12", "updated_at": "2026-10-15 13:40"},
    {"id": 2, "student_id": "S112001", "item_id": 5, "form_code": "certificate_reward_form", "business_name": "專業證照與競賽獲獎獎勵金申請",
     "fields": {"phone": "0912-345-678", "cert_name": "網頁設計乙級技術士", "cert_no": "113-012345", "issuer": "勞動部勞動力發展署",
                "issued_date": "2026-07-20", "advisor": "陳雅婷 老師", "account": "0001234-0567890"},
     "stages": stages_for(FORMS["certificate_reward_form"]), "current_stage": 4, "status": STATUS_DONE,
     "history": [{"stage": 0, "action": "送出", "by": "王小明", "note": "", "at": "2026-09-08 10:05"},
                 {"stage": 1, "action": "核准", "by": "陳雅婷 老師", "note": "", "at": "2026-09-08 16:20"},
                 {"stage": 2, "action": "核准", "by": "周立威 (研發處)", "note": "", "at": "2026-09-10 11:00"},
                 {"stage": 3, "action": "核准", "by": "出納組", "note": "已撥款 5,000 元", "at": "2026-09-18 09:30"}],
     "submitted_at": "2026-09-08 10:05", "updated_at": "2026-09-18 09:30"},
]


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    if not getattr(deps, "upload_dir", None):
        deps.upload_dir = os.path.join(ROOT, "data", "application_uploads")
    if not getattr(deps, "seal_dir", None):
        deps.seal_dir = os.path.join(ROOT, "data", "seals")
    app.register_blueprint(bp)


def seal_store():
    return SealStore(deps.seal_dir)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def _now():
    return datetime.now().strftime("%Y-%m-%d %H:%M")


# ---------- 資料存取 (MySQL online_applications；離線用 DEMO_APPLICATIONS) ----------

def _row_to_app(row):
    def load(value, default):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except ValueError:
                return default
        return value if value is not None else default
    fmt = lambda v: v.strftime("%Y-%m-%d %H:%M") if isinstance(v, datetime) else v
    return {
        "id": row["id"], "student_id": row["student_id"], "item_id": row["item_id"], "form_code": row.get("form_code"),
        "business_name": row["business_name"], "fields": load(row.get("fields_json", row.get("fields")), {}),
        "stages": load(row.get("stages_json", row.get("stages")), []), "current_stage": int(row["current_stage"]),
        "status": row["status"], "history": load(row.get("history_json", row.get("history")), []),
        "submitted_at": fmt(row["submitted_at"]), "updated_at": fmt(row.get("updated_at")),
    }


def load_applications(student_ids=None):
    """student_ids 為 None 時讀全部"""
    if student_ids is not None and not student_ids:
        return []
    sql, params = "SELECT * FROM online_applications", ()
    if student_ids is not None:
        sql += f" WHERE student_id IN ({', '.join(['%s'] * len(student_ids))})"
        params = tuple(student_ids)
    rows = deps.fetch_db_rows(sql + " ORDER BY submitted_at DESC, id DESC", params)
    if rows is None:
        rows = [a for a in DEMO_APPLICATIONS if student_ids is None or a["student_id"] in student_ids]
        rows = sorted(rows, key=lambda a: (a["submitted_at"], a["id"]), reverse=True)
    return [_row_to_app(r) for r in rows]


def get_application(app_id):
    rows = deps.fetch_db_rows("SELECT * FROM online_applications WHERE id = %s", (app_id,))
    if rows is None:
        rows = [a for a in DEMO_APPLICATIONS if a["id"] == app_id]
    return _row_to_app(rows[0]) if rows else None


def save_transition(app, stage, status, history, expect_stage):
    """只在申請仍停在 expect_stage 且審核中時更新，避免兩個人同時按核准跳兩關；成功回傳 True"""
    history_json = json.dumps(history, ensure_ascii=False)
    result = deps.db_execute(
        "UPDATE online_applications SET current_stage = %s, status = %s, history_json = %s "
        "WHERE id = %s AND current_stage = %s AND status = %s",
        (stage, status, history_json, app["id"], expect_stage, STATUS_RUNNING))
    if result is not None:
        return result["rowcount"] > 0
    demo = next((a for a in DEMO_APPLICATIONS if a["id"] == app["id"]), None)
    if not demo or demo["current_stage"] != expect_stage or demo["status"] != STATUS_RUNNING:
        return False
    demo.update(current_stage=stage, status=status, history=history, updated_at=_now())
    return True


# ---------- 電子章 ----------

def reviewer_label(stage):
    """這一關由誰審 (給「送交下一關」與「等待誰」的提示用)"""
    return {"老師": "導師班老師", "教職員": "處室承辦人"}.get(stage.get("role"), "承辦人")


def stamp_code(app, stage_index, signer, at, seal=None):
    """驗證碼綁申請內容 (上傳的檔案含 SHA-256)、關卡、審核人與用的那顆章：事後被改過就對不上"""
    data = {"id": app["id"], "student_id": app["student_id"], "stage": stage_index,
            "name": app["stages"][stage_index]["name"], "fields": app["fields"], "by": signer, "at": at}
    if seal:  # 加上老師章之前蓋的章沒有這一項，驗證碼照舊
        data["seal"] = seal
    payload = json.dumps(data, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12].upper()


def current_seal():
    """登入者現在的印章：上傳過印章圖就用圖，沒有就用系統依姓名刻的章"""
    image = seal_store().current(session.get("username", ""))
    if image:
        return {"type": "image", "file": image}
    return {"type": "name", "text": seal_text(session.get("full_name") or session.get("username"))}


def make_stamp(app, stage_index, signer, at):
    seal = current_seal()
    return {"name": app["stages"][stage_index]["name"], "by": signer, "role": session.get("role"), "at": at,
            "seal": seal, "code": stamp_code(app, stage_index, signer, at, seal)}


def stamps_of(app):
    """{關卡: 電子章}；同一關退回後重送是新的申請，所以一關只會有一個章"""
    return {h["stage"]: h["stamp"] for h in app["history"] if h.get("stamp")}


def can_view(app, student_class=None):
    """申請人本人、綁定家長、導師班老師、教職員 / 管理員"""
    role = session.get("role")
    if role in ("教職員", "管理員"):
        return True
    if role == "老師":
        return student_class is not None and student_class == session.get("advised_class")
    return role in ("學生", "家長") and session.get("student_id") == app["student_id"]


# ---------- 顯示用整理 ----------

def can_review(app, student_class=None):
    """目前登入者能不能審這張申請目前這一關"""
    role = session.get("role")
    if app["status"] != STATUS_RUNNING or role not in REVIEW_ROLES:
        return False
    stage = app["stages"][app["current_stage"]]
    if role in ("教職員", "管理員", "系統管理員"):
        return True
    return stage.get("role") == "老師" and student_class is not None and student_class == session.get("advised_class")


def describe(app, student=None):
    """補上前端畫進度條要的欄位：每一關的狀態與時間、目前在哪一關、下一步要做什麼"""
    stages, current, status = app["stages"], app["current_stage"], app["status"]
    last_action = {}
    for h in app["history"]:
        last_action[h["stage"]] = h
    steps = []
    for i, st in enumerate(stages):
        if status == STATUS_DONE or i < current:
            state = "done"
        elif i == current:
            state = {STATUS_REJECTED: "rejected", STATUS_WITHDRAWN: "withdrawn"}.get(status, "current")
        else:
            state = "pending"
        h = last_action.get(i)
        steps.append({**st, "state": state, "at": h["at"] if h and state in ("done", "rejected") else None,
                      "by": h["by"] if h and state in ("done", "rejected") else None})
    last = app["history"][-1] if app["history"] else {}
    if status == STATUS_DONE:
        summary = "已全部完成 🎉"
    elif status == STATUS_REJECTED:
        summary = f"在「{stages[current]['name']}」被退回：{last.get('note') or '請洽承辦單位'}"
    elif status == STATUS_WITHDRAWN:
        summary = "已撤回"
    else:
        summary = f"目前在「{stages[current]['name']}」，等待{reviewer_label(stages[current])}蓋章"
    total = len(stages) - 1
    stamps = stamps_of(app)
    finished_at, keep_until = retention(app)
    files = [{"name": f["name"], "size": f["size"], "url": f"/api/applications/{app['id']}/files/{i}"}
             for i, f in enumerate(app["fields"].get("_files") or [])]
    return {
        **app, "fields": {k: v for k, v in app["fields"].items() if not k.startswith("_")}, "files": files,
        "is_upload": app.get("form_code") == UPLOAD_FORM_CODE,
        "route_keys": [s.get("key") for s in stages[1:-1]],
        "steps": steps, "summary": summary, "stamp_count": len(stamps),
        "signed_url": f"/applications/{app['id']}/signed",
        "next_stage": stages[current + 1]["name"] if status == STATUS_RUNNING and current + 1 < len(stages) else None,
        "progress_percent": 100 if status == STATUS_DONE else round(min(current, total) / total * 100),
        "student_name": (student or {}).get("full_name", ""), "class_name": (student or {}).get("class_name", ""),
        "can_withdraw": status == STATUS_RUNNING and session.get("role") == "學生",
        "can_review": can_review(app, (student or {}).get("class_name")),
        "finished_at": finished_at, "keep_until": keep_until.isoformat() if keep_until else None,
        "keep_days_left": (keep_until - datetime.now().date()).days if keep_until else None,
    }


# ---------- 保存期限：完成 (或退回、撤回) 後保留三個月 ----------

def _add_months(d, months):
    y, m = divmod(d.month - 1 + months, 12)
    year, month = d.year + y, m + 1
    last_day = calendar.monthrange(year, month)[1]
    return d.replace(year=year, month=month, day=min(d.day, last_day))


def retention(app):
    """(結束時間, 保存到哪天)；審核中的申請還沒開始算，回傳 (None, None)"""
    if app["status"] == STATUS_RUNNING or not app["history"]:
        return None, None
    finished_at = app["history"][-1]["at"]
    try:
        finished = datetime.strptime(finished_at[:10], "%Y-%m-%d").date()
    except ValueError:
        return finished_at, None
    return finished_at, _add_months(finished, RETAIN_MONTHS)


def is_past_retention(app):
    _, keep_until = retention(app)
    return bool(keep_until) and keep_until < datetime.now().date()


def _retention_error():
    return _error(f"這張申請已超過 {RETAIN_MONTHS} 個月保存期限，資料不再提供查看；需要證明請洽承辦單位", 410)


# ---------- 學生：送出、查看、撤回 ----------

def _find_item(item_id):
    if int(item_id) == 0:
        found = next((c for c in deps.load_checklists() if int(c.get("item_id", -1)) == 0), None)
        if found:
            return found
        return {
            "item_id": 0, "category_id": None, "category_name": "通用申辦",
            "business_name": "自行上傳之申請表件", "form_download_url": "#upload",
            "required_docs": "自行上傳之申請表及相關附件", "steps": ["上傳檔案", "線上送出", "審核"],
        }
    return next((c for c in deps.load_checklists() if int(c["item_id"]) == item_id), None)


@bp.route("/api/applications/form/<int:item_id>", methods=["GET"])
def application_form(item_id):
    """線上申請要填的欄位、簽核關卡 (欄位 example 當提示)"""
    item = _find_item(item_id)
    if not item:
        return _error("找不到該申辦項目", 404)
    code, tpl = template_for_item(item)
    student = deps.load_student(session["student_id"]) if session.get("role") == "學生" and session.get("student_id") else None
    return jsonify({
        "status": "success", "item_id": item_id, "business_name": item["business_name"], "form_code": code,
        "title": tpl["title"], "office": tpl["office"], "intro": tpl["intro"], "attachments": tpl["attachments"],
        "common_fields": COMMON_FIELDS, "fields": tpl["fields"], "stages": stages_for(tpl),
        "prefill": {k: (student or {}).get(k, "") for k in ("student_id", "full_name", "class_name")},
        "form_url": f"/forms/{code}" if code else None,
    }), 200


@bp.route("/api/applications/mine", methods=["GET"])
def my_applications():
    """學生本人 (或綁定的家長) 的所有線上申請與每一關進度"""
    if session.get("role") not in ("學生", "家長") or not session.get("student_id"):
        return jsonify({"status": "success", "requires_login": True, "data": []}), 200
    student_id = session["student_id"]
    student = deps.load_student(student_id)
    apps = [describe(a, student) for a in load_applications([student_id]) if not is_past_retention(a)]
    # 審核中、被退回的排前面
    order = {STATUS_REJECTED: 0, STATUS_RUNNING: 1, STATUS_DONE: 2, STATUS_WITHDRAWN: 3}
    apps.sort(key=lambda a: order.get(a["status"], 9))
    return jsonify({"status": "success", "requires_login": False, "data": apps}), 200


@bp.route("/api/applications", methods=["POST"])
def submit_application():
    if "username" not in session:
        return _error("請先登入學生帳號", 401)
    if session.get("role") != "學生" or not session.get("student_id"):
        return _error("線上申請僅限學生本人送出", 403)
    student_id = session["student_id"]
    data = request.get_json(silent=True) or {}
    form_code_req = str(data.get("form_code", "")).strip().lower()
    raw_item_id = data.get("item_id")
    if raw_item_id is None and form_code_req == "upload":
        item_id = 0
    else:
        try:
            item_id = int(raw_item_id)
        except (TypeError, ValueError):
            return _error("請選擇申辦項目")

    if form_code_req == "upload" or item_id == 0:
        item_id = 0
        item = _find_item(0)
        code = "upload"
        tpl = FORMS["upload"]
    else:
        item = _find_item(item_id)
        if not item:
            return _error("找不到該申辦項目", 404)
        code, tpl = template_for_item(item)

    given = data.get("fields") or {}
    fields, missing = {}, []
    for f in [c for c in COMMON_FIELDS if not c.get("auto")] + tpl["fields"]:
        value = str(given.get(f["key"]) or "").strip()
        if len(value) > FIELD_MAX:
            return _error(f"「{f['label']}」最多 {FIELD_MAX} 字")
        if not value and not f.get("optional"):
            missing.append(f["label"])
        if value:
            fields[f["key"]] = value

    for k, v in given.items():
        if k not in fields and isinstance(v, (str, int, float, bool, list, dict)):
            fields[k] = v

    if missing:
        return _error(f"還沒填：{'、'.join(missing)}")
    if any(a["item_id"] == item_id and a["status"] == STATUS_RUNNING for a in load_applications([student_id])):
        return _error("這個項目已經有一張審核中的申請，請等結果出來或先撤回", 409)

    stages = stages_for(tpl)
    business_name = str(data.get("business_name") or item["business_name"]).strip()
    app_id = insert_application(student_id, item_id, code, business_name, fields, stages)
    app = get_application(app_id)
    return jsonify({"status": "success", "message": f"已線上送出，下一關：{stages[1]['name']}",
                    "data": describe(app, deps.load_student(student_id))}), 201


def insert_application(student_id, item_id, code, business_name, fields, stages):
    """寫進 online_applications (MySQL 離線時寫進 DEMO_APPLICATIONS)，回傳申請編號"""
    now = _now()
    history = [{"stage": 0, "action": "送出", "by": session.get("full_name", ""), "note": "", "at": now}]
    result = deps.db_execute(
        "INSERT INTO online_applications (student_id, item_id, form_code, business_name, fields_json, stages_json, "
        "current_stage, status, history_json, submitted_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())",
        (student_id, item_id, code, business_name, json.dumps(fields, ensure_ascii=False),
         json.dumps(stages, ensure_ascii=False), 1, STATUS_RUNNING, json.dumps(history, ensure_ascii=False)))
    if result is not None:
        app_id = result["lastrowid"]
    else:
        app_id = max((a["id"] for a in DEMO_APPLICATIONS), default=0) + 1
        DEMO_APPLICATIONS.append({"id": app_id, "student_id": student_id, "item_id": item_id, "form_code": code,
                                  "business_name": business_name, "fields": fields, "stages": stages,
                                  "current_stage": 1, "status": STATUS_RUNNING, "history": history,
                                  "submitted_at": now, "updated_at": now})
    deps.write_audit_log("online_applications", app_id, "新增", after={"item_id": item_id, "form_code": code, "status": STATUS_RUNNING})
    return app_id


# ---------- 學生：上傳自己的申請表，選申請種類，關卡由系統排好 ----------

@bp.route("/api/applications/upload-options", methods=["GET"])
def upload_options():
    """上傳申請表時可以選的申請種類 (各自帶好簽章關卡) 與檔案限制"""
    types = [{"key": t["key"], "name": t["name"], "stages": [ROUTE_BY_KEY[k] for k in t["route"]],
              "form_url": f"/forms/{upload_form_code(t['key'])}"} for t in UPLOAD_TYPES]
    return jsonify({"status": "success", "types": types,
                    "limits": {"max_mb": UPLOAD_MAX_FILE_MB, "max_files": UPLOAD_MAX_FILES,
                               "max_total_mb": UPLOAD_MAX_TOTAL_MB, "types": "PDF、JPG、PNG"}}), 200


def check_upload_files(files):
    """回傳 (錯誤訊息, None) 或 (None, [(檔名, 副檔名, 內容), ...])"""
    files = [f for f in files if f and f.filename]
    if not files:
        return "請上傳申請表 (PDF 或照片)", None
    if len(files) > UPLOAD_MAX_FILES:
        return f"最多上傳 {UPLOAD_MAX_FILES} 個檔案", None
    checked = []
    for f in files:
        name = os.path.basename(f.filename)
        ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
        if ext not in UPLOAD_SIGNATURES:
            return f"「{name}」格式不支援，只能上傳 PDF、JPG、PNG", None
        data = f.read()
        if not data:
            return f"「{name}」是空檔案", None
        if len(data) > UPLOAD_MAX_FILE_MB * 1024 * 1024:
            return f"「{name}」超過 {UPLOAD_MAX_FILE_MB} MB（目前 {len(data) / 1024 / 1024:.1f} MB），請壓縮後再上傳", None
        if not data.startswith(UPLOAD_SIGNATURES[ext]):
            return f"「{name}」內容不是真的 {ext.upper()} 檔，請重新存檔後再上傳", None
        checked.append((name, ext, data))
    if sum(len(d) for _, _, d in checked) > UPLOAD_MAX_TOTAL_MB * 1024 * 1024:
        return f"檔案合計超過 {UPLOAD_MAX_TOTAL_MB} MB，請壓縮後再上傳", None
    return None, checked


@bp.route("/api/applications/upload", methods=["POST"])
def submit_upload():
    if "username" not in session:
        return _error("請先登入學生帳號", 401)
    if session.get("role") != "學生" or not session.get("student_id"):
        return _error("上傳申請表僅限學生本人", 403)
    student_id = session["student_id"]
    form = request.form
    kind = UPLOAD_TYPE_BY_KEY.get(str(form.get("type") or "").strip())
    reason = str(form.get("reason") or "").strip()
    phone = str(form.get("phone") or "").strip()
    if not kind:
        return _error("請從下拉選單選要申請的項目")
    title = kind["name"]
    if not phone:
        return _error("請填聯絡電話，處室有問題才找得到你")
    if len(reason) > FIELD_MAX or len(phone) > 30:
        return _error(f"說明最多 {FIELD_MAX} 字")
    route = kind["route"]  # 簽章關卡由申請種類決定，學生不能自己改
    message, checked = check_upload_files(request.files.getlist("files"))
    if message:
        return _error(message)

    os.makedirs(deps.upload_dir, exist_ok=True)
    saved = []
    for name, ext, data in checked:
        stored = f"app_{secure_filename(student_id)}_{datetime.now():%Y%m%d%H%M%S}_{uuid.uuid4().hex[:8]}.{ext}"
        with open(os.path.join(deps.upload_dir, stored), "wb") as fh:
            fh.write(data)
        saved.append({"name": name, "stored": stored, "size": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    fields = {"title": title, "type": kind["key"], "reason": reason, "phone": phone, "_files": saved}
    stages = [{"name": "線上送出", "icon": "📤", "role": "學生"}] + \
             [dict(ROUTE_BY_KEY[k]) for k in route] + [{"name": "完成", "icon": "✅", "role": None}]
    app_id = insert_application(student_id, UPLOAD_ITEM_ID, UPLOAD_FORM_CODE, title, fields, stages)
    return jsonify({"status": "success", "message": f"已上傳並送出，下一關：{stages[1]['name']}",
                    "data": describe(get_application(app_id), deps.load_student(student_id))}), 201


@bp.route("/api/applications/<int:app_id>/files/<int:index>", methods=["GET"])
def download_upload(app_id, index):
    """申請人本人、家長、導師班老師、處室可下載；別人的回 404"""
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in ("學生", "家長") + REVIEW_ROLES:
        return _error("你的身分無法查看申請表", 403)
    app = get_application(app_id)
    student = deps.load_student(app["student_id"]) if app else None
    files = (app or {}).get("fields", {}).get("_files") or []
    if not app or not can_view(app, (student or {}).get("class_name")) or not 0 <= index < len(files):
        return _error("找不到這個檔案", 404)
    if is_past_retention(app):
        return _retention_error()
    f = files[index]
    if not os.path.isfile(os.path.join(deps.upload_dir, f["stored"])):
        return _error("檔案已不存在，請洽承辦單位", 404)
    return send_from_directory(deps.upload_dir, f["stored"], download_name=f["name"])


@bp.route("/api/applications/<int:app_id>/withdraw", methods=["POST"])
def withdraw_application(app_id):
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") != "學生":
        return _error("只有學生本人可以撤回", 403)
    app = get_application(app_id)
    if not app or app["student_id"] != session.get("student_id"):
        return _error("找不到這張申請", 404)
    if app["status"] != STATUS_RUNNING:
        return _error("只能撤回審核中的申請")
    history = app["history"] + [{"stage": app["current_stage"], "action": "撤回", "by": session.get("full_name", ""), "note": "", "at": _now()}]
    if not save_transition(app, app["current_stage"], STATUS_WITHDRAWN, history, app["current_stage"]):
        return _error("申請狀態剛剛有變動，請重新整理", 409)
    deps.write_audit_log("online_applications", app_id, "修改", before={"status": app["status"]}, after={"status": STATUS_WITHDRAWN})
    return jsonify({"status": "success", "message": "已撤回申請"}), 200


# ---------- 老師 / 處室：審核 ----------

@bp.route("/api/applications/review", methods=["GET"])
def review_list():
    """status=pending (預設，輪到我審的) 或 all；老師只看得到導師班學生"""
    role = session.get("role")
    if "username" not in session:
        return _error("請先登入系統", 401)
    if role not in REVIEW_ROLES:
        return _error("權限不足，僅限老師與處室人員", 403)
    student_ids = deps.class_student_ids(session.get("advised_class") or "") if role == "老師" else None
    students = {}
    result = []
    for app in load_applications(student_ids):
        if is_past_retention(app):
            continue
        if app["student_id"] not in students:
            students[app["student_id"]] = deps.load_student(app["student_id"]) or {}
        item = describe(app, students[app["student_id"]])
        if request.args.get("status", "pending") == "pending" and not item["can_review"]:
            continue
        result.append(item)
    return jsonify({"status": "success", "scope": session.get("advised_class") if role == "老師" else "全校", "data": result}), 200


@bp.route("/api/applications/<int:app_id>/review", methods=["POST"])
def review_application(app_id):
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in REVIEW_ROLES:
        return _error("權限不足，僅限老師與處室人員", 403)
    app = get_application(app_id)
    student = deps.load_student(app["student_id"]) if app else None
    if not app or not can_review(app, (student or {}).get("class_name")):
        return _error("找不到這張申請，或目前這一關不是由你審核", 404)
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    note = str(data.get("note") or "").strip()[:200]
    if action not in ("approve", "reject"):
        return _error("action 須為 approve 或 reject")
    if action == "reject" and not note:
        return _error("退回請寫原因，讓學生知道要怎麼補件")

    current = app["current_stage"]
    last_signer = len(app["stages"]) - 2
    if action == "approve":
        stage, status = (current + 1, STATUS_DONE if current >= last_signer else STATUS_RUNNING)
    else:
        stage, status = current, STATUS_REJECTED
    signer, at = session.get("full_name", "") or session.get("username", ""), _now()
    entry = {"stage": current, "action": "核准" if action == "approve" else "退回", "by": signer, "note": note, "at": at}
    if action == "approve":
        entry["stamp"] = make_stamp(app, current, signer, at)  # 核准才蓋章，退回不蓋
    history = app["history"] + [entry]
    if not save_transition(app, stage, status, history, current):
        return _error("這一關剛剛已經有人處理過了，請重新整理", 409)
    deps.write_audit_log("online_applications", app_id, "修改",
                         before={"current_stage": current, "status": app["status"]}, after={"current_stage": stage, "status": status})
    notified = False
    if status in (STATUS_DONE, STATUS_REJECTED):
        notified = deps.notify_student(app["student_id"], f"【康寧大學】線上申辦「{app['business_name']}」{status}")
    if status == STATUS_DONE:
        message = f"已蓋章（驗證碼 {entry['stamp']['code']}），各關都蓋完，整張申請完成"
    elif status == STATUS_REJECTED:
        message = "已退回"
    else:
        nxt = app["stages"][stage]
        message = f"已蓋章（驗證碼 {entry['stamp']['code']}），送交下一關「{nxt['name']}」，等待{reviewer_label(nxt)}審核"
    if notified:
        message += "，已通知學生"
    return jsonify({"status": "success", "message": message, "data": describe(get_application(app_id), student)}), 200


# ---------- 蓋好章的申請表與查驗 ----------

@bp.route("/applications/<int:app_id>/signed", methods=["GET"])
def signed_form(app_id):
    """填好的內容 + 每一關的電子章，可列印 / 存成 PDF"""
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in ("學生", "家長") + REVIEW_ROLES:
        return _error("你的身分無法查看申請表", 403)
    app = get_application(app_id)
    student = deps.load_student(app["student_id"]) if app else None
    if not app or not can_view(app, (student or {}).get("class_name")):
        return _error("找不到這張申請", 404)
    if is_past_retention(app):
        return _retention_error()
    if app["form_code"] == UPLOAD_FORM_CODE:
        tpl = {"title": app["fields"].get("title") or app["business_name"], "office": "", "fields": UPLOAD_FIELDS}
    else:
        tpl = FORMS.get(app["form_code"]) or {"title": app["business_name"], "office": "", "fields": GENERIC_FIELDS}
    known = {f["key"] for f in tpl["fields"]}
    fields = [(f["label"], app["fields"].get(f["key"], "")) for f in tpl["fields"]]
    fields += [(k, v) for k, v in app["fields"].items() if k not in known and k != "phone" and not k.startswith("_") and v]
    approved = {h["stage"]: h for h in app["history"] if h["action"] == "核准"}
    return render_template("application_signed.html", app=describe(app, student), tpl=tpl, fields=fields,
                           student=student or {}, stamps=stamps_of(app), approved=approved,
                           signers=list(enumerate(app["stages"]))[1:-1], name_seal=name_seal_svg)


@bp.route("/applications/<int:app_id>/seal/<int:stage>", methods=["GET"])
def stamp_seal_image(app_id, stage):
    """申請表上某一關蓋的印章圖 (上傳的印章圖才有；系統刻的章直接畫在頁面上)"""
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in ("學生", "家長") + REVIEW_ROLES:
        return _error("你的身分無法查看申請表", 403)
    app = get_application(app_id)
    student = deps.load_student(app["student_id"]) if app else None
    if not app or not can_view(app, (student or {}).get("class_name")):
        return _error("找不到這張申請", 404)
    if is_past_retention(app):
        return _retention_error()
    seal = (stamps_of(app).get(stage) or {}).get("seal") or {}
    path = seal_store().path_of(seal.get("file")) if seal.get("type") == "image" else None
    if not path:
        return _error("這一關沒有印章圖", 404)
    return send_from_directory(deps.seal_dir, os.path.basename(path))


@bp.route("/api/applications/stamp/<code>", methods=["GET"])
def verify_stamp(code):
    """任何人拿到蓋章的申請表都能查；只回傳遮蔽後的姓名，不回傳學號與申請內容"""
    code = code.strip().upper()
    for app in load_applications():
        for stage, stamp in stamps_of(app).items():
            if stamp.get("code") != code:
                continue
            if stamp_code(app, stage, stamp["by"], stamp["at"], stamp.get("seal")) != code:
                return jsonify({"status": "success", "valid": False, "message": "申請內容在蓋章後被變更過，這個章已失效"}), 200
            name = (deps.load_student(app["student_id"]) or {}).get("full_name") or ""
            masked = name[:1] + "○" * max(len(name) - 2, 0) + (name[-1:] if len(name) > 1 else "")
            return jsonify({"status": "success", "valid": True, "business_name": app["business_name"], "stage": stamp["name"],
                            "by": stamp["by"], "at": stamp["at"], "student_name": masked}), 200
    return jsonify({"status": "success", "valid": False, "message": "查無此驗證碼"}), 200


# ---------- 老師 / 行政人員：我的印章 ----------

def _seal_auth():
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in REVIEW_ROLES:
        return _error("只有老師與行政人員有印章", 403)
    return None


@bp.route("/api/seals/mine", methods=["GET"])
def my_seal():
    """目前的印章：上傳過的圖，或系統依姓名刻的章 (svg)"""
    denied = _seal_auth()
    if denied:
        return denied
    seal = current_seal()
    display = session.get("full_name") or session.get("username")
    kind = "name" if seal["type"] == "name" else ("signature" if seal["file"].startswith("sig_") else "image")
    return jsonify({"status": "success", "type": seal["type"], "kind": kind, "name": seal_text(display),
                    "svg": str(name_seal_svg(display, size=120)),
                    "image_url": "/api/seals/mine/image" if seal["type"] == "image" else None,
                    "max_kb": SEAL_MAX_KB}), 200


@bp.route("/api/seals/mine", methods=["POST"])
def upload_my_seal():
    denied = _seal_auth()
    if denied:
        return denied
    f = request.files.get("seal")
    if not f or not f.filename:
        return _error("請選擇印章圖檔")
    message, _ = seal_store().save(session["username"], os.path.basename(f.filename), f.read())
    if message:
        return _error(message)
    return jsonify({"status": "success", "message": "已換成你上傳的印章，之後核准都蓋這顆（之前蓋過的不受影響）"}), 200


@bp.route("/api/seals/mine", methods=["DELETE"])
def reset_my_seal():
    denied = _seal_auth()
    if denied:
        return denied
    seal_store().reset(session["username"])
    return jsonify({"status": "success", "message": "已改回系統依姓名刻的章"}), 200


@bp.route("/api/seals/mine/image", methods=["GET"])
def my_seal_image():
    denied = _seal_auth()
    if denied:
        return denied
    stored = seal_store().current(session["username"])
    if not stored:
        return _error("還沒上傳印章圖", 404)
    return send_from_directory(deps.seal_dir, stored)


# ---------- 手機簽名：掃 QR code 或開網址，在手機上手寫簽名 ----------

def _qr_svg(text):
    import qrcode
    from io import BytesIO
    from qrcode.image.svg import SvgPathFillImage
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=4)
    qr.add_data(text)
    qr.make(fit=True)
    out = BytesIO()
    qr.make_image(image_factory=SvgPathFillImage).save(out)
    return out.getvalue()


def _sign_url(token):
    from campus.meetings import share_base  # 用 127.0.0.1 開網站時換成區網 IP，手機才連得到
    return f"{share_base()}/seal/sign/{token}"


@bp.route("/api/seals/sign-link", methods=["POST"])
def create_sign_link():
    """產生一次性的手機簽名連結 (10 分鐘內有效)"""
    denied = _seal_auth()
    if denied:
        return denied
    now = datetime.now().timestamp()
    token, info = seal_store().new_sign_token(session["username"], session.get("full_name") or session["username"], now)
    return jsonify({"status": "success", "token": token, "url": _sign_url(token),
                    "qr_url": f"/api/seals/sign-link/{token}/qr.svg",
                    "expires_at": datetime.fromtimestamp(info["expires"]).strftime("%H:%M")}), 201


def _own_token(token):
    info = seal_store().token_info(token)
    return info if info and info["username"] == session.get("username") else None


@bp.route("/api/seals/sign-link/<token>/qr.svg", methods=["GET"])
def sign_link_qr(token):
    denied = _seal_auth()
    if denied:
        return denied
    if not _own_token(token):
        return _error("找不到這個簽名連結", 404)
    resp = make_response(_qr_svg(_sign_url(token)))
    resp.headers["Content-Type"] = "image/svg+xml"
    resp.headers["Cache-Control"] = "no-store"
    return resp


@bp.route("/api/seals/sign-link/<token>/status", methods=["GET"])
def sign_link_status(token):
    """電腦端每 2 秒問一次：手機簽好了沒"""
    denied = _seal_auth()
    if denied:
        return denied
    info = _own_token(token)
    if not info:
        return _error("找不到這個簽名連結", 404)
    return jsonify({"status": "success", "signed": info["used"],
                    "expired": not info["used"] and info["expires"] <= datetime.now().timestamp()}), 200


@bp.route("/seal/sign/<token>", methods=["GET"])
def sign_page(token):
    """手機開的簽名頁 (不用登入，連結本身就是通行證)"""
    info = seal_store().sign_token(token, datetime.now().timestamp())
    return render_template("seal_sign.html", token=token, valid=bool(info),
                           name=seal_text((info or {}).get("name")))


@bp.route("/seal/sign/<token>", methods=["POST"])
def submit_signature(token):
    store = seal_store()
    info = store.sign_token(token, datetime.now().timestamp())
    if not info:
        return _error("這個簽名連結已經用過或過期了，請在電腦上重新產生", 410)
    f = request.files.get("signature")
    if not f:
        return _error("沒有收到簽名")
    message, _ = store.save(info["username"], "signature.png", f.read(), prefix="sig")
    if message:
        return _error(message)
    store.use_sign_token(token)
    return jsonify({"status": "success", "message": "簽名已儲存，之後核准時就蓋這個簽名"}), 200


# ---------- 申請表單：可列印、下載 Word、填寫範例 ----------

@bp.route("/forms/<path:filename>")
def form_page(filename):
    # 管理員自行放進 static/forms 的正式檔案 (safe_join 擋掉 ../ 路徑穿越)
    target = safe_join(deps.forms_folder, filename)
    if target and os.path.isfile(target):
        return send_from_directory(deps.forms_folder, filename, as_attachment=True)
    code = filename
    for ext in (".pdf", ".doc", ".docx"):
        if code.endswith(ext):
            code = code[: -len(ext)]
            if code in FORMS:  # 舊網址 /forms/xxx.pdf
                return redirect(f"/forms/{code}", code=302)
    tpl = FORMS.get(code) or upload_form_template(code)
    if not tpl:
        return jsonify({"status": "error", "message": "找不到該表單"}), 404

    example = request.args.get("example") == "1"
    word = request.args.get("download") == "doc"
    item = None if code not in FORMS else next(
        (c for c in deps.load_checklists() if form_code_from_url(c.get("form_download_url")) == code), None)
    tips = [f for f in COMMON_FIELDS + tpl["fields"] if f.get("tip")]
    html = render_template("application_form.html", code=code, form=tpl, common_fields=COMMON_FIELDS, example=example,
                           word=word, tips=tips, tip_no={f["key"]: i + 1 for i, f in enumerate(tips)},
                           stages=stages_for(tpl), item=item, example_date="2026 年 10 月 21 日")
    if not word:
        return html
    filename = f"{tpl['title']}{'_填寫範例' if example else ''}.doc"
    resp = make_response("﻿" + html)
    resp.headers["Content-Type"] = "application/msword; charset=utf-8"
    resp.headers["Content-Disposition"] = f"attachment; filename=\"{code}.doc\"; filename*=UTF-8''{quote(filename)}"
    return resp
