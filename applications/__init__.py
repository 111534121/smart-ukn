"""
線上申辦與進度追蹤、申請表單下載

- 學生在「行政申請流程」挑一項申辦，線上填表送出 → 依表單的簽核關卡逐關審核 → 完成 (或退回)
- 每一關誰能審：關卡 role 為「老師」時，導師班老師可簽 (教職員/管理員也可代為處理)；「教職員」關卡限教職員/管理員
- 學生、家長看得到每一關目前跑到哪；退回時附上原因，學生可修改後重新送出
- /forms/<code>：可列印的空白表單、?example=1 填寫範例、?download=doc 下載 Word 檔
  舊網址 /forms/xxx.pdf 會轉到新的表單頁；static/forms 內放了真正的檔案時直接下載該檔

app.py 呼叫 applications.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、write_audit_log、
load_checklists、load_student、class_student_ids、notify_student、forms_folder。
"""
import json
import os
from datetime import datetime
from types import SimpleNamespace
from urllib.parse import quote

from flask import Blueprint, jsonify, make_response, redirect, render_template, request, send_from_directory, session
from werkzeug.utils import safe_join

from .forms import COMMON_FIELDS, FORMS, form_code_from_url, stages_for, template_for_item

bp = Blueprint("applications", __name__, template_folder="templates")
deps = SimpleNamespace()

STATUS_RUNNING, STATUS_DONE, STATUS_REJECTED, STATUS_WITHDRAWN = "審核中", "已完成", "已退回", "已撤回"
REVIEW_ROLES = ("老師", "教職員", "管理員")
FIELD_MAX = 300

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
    app.register_blueprint(bp)


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


# ---------- 顯示用整理 ----------

def can_review(app, student_class=None):
    """目前登入者能不能審這張申請目前這一關"""
    role = session.get("role")
    if app["status"] != STATUS_RUNNING or role not in REVIEW_ROLES:
        return False
    stage = app["stages"][app["current_stage"]]
    if role in ("教職員", "管理員"):
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
        summary = f"目前在「{stages[current]['name']}」，等待審核"
    total = len(stages) - 1
    return {
        **app, "steps": steps, "summary": summary,
        "progress_percent": 100 if status == STATUS_DONE else round(min(current, total) / total * 100),
        "student_name": (student or {}).get("full_name", ""), "class_name": (student or {}).get("class_name", ""),
        "can_withdraw": status == STATUS_RUNNING and session.get("role") == "學生",
        "can_review": can_review(app, (student or {}).get("class_name")),
    }


# ---------- 學生：送出、查看、撤回 ----------

def _find_item(item_id):
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
    apps = [describe(a, student) for a in load_applications([student_id])]
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
    try:
        item_id = int(data.get("item_id"))
    except (TypeError, ValueError):
        return _error("請選擇申辦項目")
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
        fields[f["key"]] = value
    if missing:
        return _error(f"還沒填：{'、'.join(missing)}")
    if any(a["item_id"] == item_id and a["status"] == STATUS_RUNNING for a in load_applications([student_id])):
        return _error("這個項目已經有一張審核中的申請，請等結果出來或先撤回", 409)

    stages = stages_for(tpl)
    now = _now()
    history = [{"stage": 0, "action": "送出", "by": session.get("full_name", ""), "note": "", "at": now}]
    result = deps.db_execute(
        "INSERT INTO online_applications (student_id, item_id, form_code, business_name, fields_json, stages_json, "
        "current_stage, status, history_json, submitted_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())",
        (student_id, item_id, code, item["business_name"], json.dumps(fields, ensure_ascii=False),
         json.dumps(stages, ensure_ascii=False), 1, STATUS_RUNNING, json.dumps(history, ensure_ascii=False)))
    if result is not None:
        app_id = result["lastrowid"]
    else:
        app_id = max((a["id"] for a in DEMO_APPLICATIONS), default=0) + 1
        DEMO_APPLICATIONS.append({"id": app_id, "student_id": student_id, "item_id": item_id, "form_code": code,
                                  "business_name": item["business_name"], "fields": fields, "stages": stages,
                                  "current_stage": 1, "status": STATUS_RUNNING, "history": history,
                                  "submitted_at": now, "updated_at": now})
    deps.write_audit_log("online_applications", app_id, "新增", after={"item_id": item_id, "status": STATUS_RUNNING})
    app = get_application(app_id)
    return jsonify({"status": "success", "message": f"已線上送出，下一關：{stages[1]['name']}",
                    "data": describe(app, deps.load_student(student_id))}), 201


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
    history = app["history"] + [{"stage": current, "action": "核准" if action == "approve" else "退回",
                                 "by": session.get("full_name", ""), "note": note, "at": _now()}]
    if not save_transition(app, stage, status, history, current):
        return _error("這一關剛剛已經有人處理過了，請重新整理", 409)
    deps.write_audit_log("online_applications", app_id, "修改",
                         before={"current_stage": current, "status": app["status"]}, after={"current_stage": stage, "status": status})
    notified = False
    if status in (STATUS_DONE, STATUS_REJECTED):
        notified = deps.notify_student(app["student_id"], f"【康寧大學】線上申辦「{app['business_name']}」{status}")
    message = {STATUS_DONE: "已核准，整張申請完成", STATUS_REJECTED: "已退回"}.get(status, f"已核准，移到下一關：{app['stages'][stage]['name']}")
    if notified:
        message += "，已通知學生"
    return jsonify({"status": "success", "message": message, "data": describe(get_application(app_id), student)}), 200


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
    if code not in FORMS:
        return jsonify({"status": "error", "message": "找不到該表單"}), 404

    tpl = FORMS[code]
    example = request.args.get("example") == "1"
    word = request.args.get("download") == "doc"
    item = next((c for c in deps.load_checklists() if form_code_from_url(c.get("form_download_url")) == code), None)
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
