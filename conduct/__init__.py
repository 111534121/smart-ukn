"""
我的操行：學生 (與綁定家長) 看自己每學期的操行成績與計算明細

操行成績 = 基本分 + 導師評分 (加減分) + 獎懲 + 缺曠扣分，限制在 0–100 分
- 獎懲 (conduct_records)：生輔組 (教職員/管理員) 登錄
- 導師評分 (conduct_evaluations)：導師班老師或教職員/管理員填寫，期末前尚未給分時以 0 計
- 缺曠扣分：取自缺曠課紀錄 (attendance_records)，依日期歸到學期
本學期分數為暫定，期末導師評分與獎懲確定後才定案。

計分規則 (基本分、獎懲配分、缺曠扣分、導師評分範圍、及格分數、等第門檻) 存在 conduct_settings 資料表，
由生輔組 / 管理員在後台「操行計分規則」調整，不用改程式；資料表沒有設定時使用 DEFAULT_RULES。
規則改了之後所有學生的成績會依新規則重新計算 (成績不另外存)。

app.py 呼叫 conduct.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、write_audit_log、
load_student、list_students、class_student_ids、attendance_records(student_id)、term_of(date 字串 → "115-1")、current_semester()。
"""
import copy
import json
import re
from datetime import date, datetime
from types import SimpleNamespace

from flask import Blueprint, jsonify, request, session

bp = Blueprint("conduct", __name__)
deps = SimpleNamespace()

MERIT_TYPES = ("大功", "小功", "嘉獎", "警告", "小過", "大過")   # 與 conduct_records.type 的 enum 一致
ATTENDANCE_TYPES = ("曠課", "遲到")                              # 會扣操行的缺曠種類；病假等已核准的假不扣分
# 以下數字僅為預設範例，請依學校「學生操行成績評量辦法」在後台調整
DEFAULT_RULES = {
    "base_score": 82,
    "merit_points": {"大功": 9, "小功": 3, "嘉獎": 1, "警告": -1, "小過": -3, "大過": -9},
    "attendance_deduct": {"曠課": 0.5, "遲到": 0.1},
    "advisor_range": 5,
    "pass_score": 60,
    "grades": [{"min": 90, "label": "優"}, {"min": 80, "label": "甲"}, {"min": 70, "label": "乙"},
               {"min": 60, "label": "丙"}, {"min": 0, "label": "丁"}],
}
STAFF_ROLES = ("教職員", "內容管理人員", "處室承辦", "科助", "管理員", "系統管理員")
DEMO_SETTINGS = {}   # MySQL 離線時後台儲存的規則 (空 = 用預設)
SEMESTER_PATTERN = re.compile(r"^(\d{2,3})-([12])$")

# MySQL 離線時的示範資料 (114-2 分數與獎助學金示範的操行成績一致)
DEMO_RECORDS = [
    {"id": 1, "student_id": "S112001", "semester": "114-2", "record_date": "2026-05-20", "type": "嘉獎", "count": 2, "reason": "擔任班級幹部，協助班務表現優良", "recorded_by": "生輔組"},
    {"id": 2, "student_id": "S112001", "semester": "115-1", "record_date": "2026-09-26", "type": "嘉獎", "count": 1, "reason": "協助新生始業式場佈", "recorded_by": "生輔組"},
    {"id": 3, "student_id": "S112001", "semester": "115-1", "record_date": "2026-10-02", "type": "警告", "count": 1, "reason": "上課使用手機，經勸導未改善", "recorded_by": "生輔組"},
    {"id": 4, "student_id": "S112002", "semester": "114-2", "record_date": "2026-04-18", "type": "小功", "count": 1, "reason": "代表學校參加全國技藝競賽獲獎", "recorded_by": "生輔組"},
    {"id": 5, "student_id": "S112004", "semester": "114-2", "record_date": "2026-06-03", "type": "小功", "count": 1, "reason": "擔任系學會幹部，籌辦活動表現優異", "recorded_by": "生輔組"},
    {"id": 6, "student_id": "S112005", "semester": "114-2", "record_date": "2026-03-12", "type": "嘉獎", "count": 2, "reason": "熱心參與志工服務", "recorded_by": "生輔組"},
]
DEMO_EVALUATIONS = {
    ("S112001", "114-2"): {"advisor_adjust": 2, "comment": "熱心服務，擔任副班長盡責", "evaluated_by": "陳雅婷 老師"},
    ("S112002", "114-2"): {"advisor_adjust": 3, "comment": "學習態度積極，樂於幫助同學", "evaluated_by": "陳雅婷 老師"},
    ("S112003", "114-2"): {"advisor_adjust": 3, "comment": "實習表現穩定", "evaluated_by": "護理科導師"},
    ("S112004", "114-2"): {"advisor_adjust": 5, "comment": "品學兼優，領導能力佳", "evaluated_by": "資管四孝導師"},
    ("S112005", "114-2"): {"advisor_adjust": 2, "comment": "待人有禮，出席穩定", "evaluated_by": "陳雅婷 老師"},
}


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def _semester_key(semester):
    m = SEMESTER_PATTERN.match(semester or "")
    return (int(m.group(1)), int(m.group(2))) if m else (0, 0)


def grade_of(score, rules):
    return next((g["label"] for g in rules["grades"] if score >= g["min"]), rules["grades"][-1]["label"])


# ---------- 計分規則 (conduct_settings) ----------

def load_rules():
    """目前生效的計分規則；資料表沒有設定時用 DEFAULT_RULES"""
    rows = deps.fetch_db_rows("SELECT settings_json, updated_by, updated_at FROM conduct_settings WHERE id = 1")
    if rows is None:
        saved, meta = DEMO_SETTINGS.get("rules"), DEMO_SETTINGS.get("meta")
    elif rows:
        try:
            saved = json.loads(rows[0]["settings_json"])
        except ValueError:
            saved = None
        at = rows[0]["updated_at"]
        meta = {"updated_by": rows[0]["updated_by"], "updated_at": at.strftime("%Y-%m-%d %H:%M") if isinstance(at, datetime) else at}
    else:
        saved, meta = None, None
    rules = copy.deepcopy(DEFAULT_RULES)
    if saved:
        # 只取認得的欄位，日後新增規則項目時舊設定仍可用
        for key in ("base_score", "advisor_range", "pass_score", "grades"):
            if key in saved:
                rules[key] = saved[key]
        for key in ("merit_points", "attendance_deduct"):
            rules[key].update({k: v for k, v in (saved.get(key) or {}).items() if k in rules[key]})
    rules["is_default"] = not saved
    rules["updated"] = meta
    return rules


def _number(value, label, low, high):
    try:
        n = round(float(value), 2)
    except (TypeError, ValueError):
        raise ValueError(f"「{label}」須為數字")
    if not low <= n <= high:
        raise ValueError(f"「{label}」須介於 {low} 到 {high}")
    return int(n) if n == int(n) else n


def validate_rules(data):
    """檢查後台送來的規則，回傳整理好的 dict；有錯時丟 ValueError (訊息給使用者看)"""
    rules = {
        "base_score": _number(data.get("base_score"), "基本分", 0, 100),
        "advisor_range": _number(data.get("advisor_range"), "導師評分範圍", 0, 20),
        "pass_score": _number(data.get("pass_score"), "及格分數", 0, 100),
        "merit_points": {}, "attendance_deduct": {},
    }
    merits = data.get("merit_points") or {}
    for t in MERIT_TYPES:
        rules["merit_points"][t] = _number(merits.get(t), f"{t}每次分數", -30, 30)
    for t in MERIT_TYPES[:3]:
        if rules["merit_points"][t] < 0:
            raise ValueError(f"「{t}」是獎勵，分數不能是負的")
    for t in MERIT_TYPES[3:]:
        if rules["merit_points"][t] > 0:
            raise ValueError(f"「{t}」是懲處，分數不能是正的 (請填 0 或負數)")
    deduct = data.get("attendance_deduct") or {}
    for t in ATTENDANCE_TYPES:
        rules["attendance_deduct"][t] = _number(deduct.get(t), f"{t}每節扣分", 0, 10)

    grades = []
    for g in data.get("grades") or []:
        label = str(g.get("label") or "").strip()[:4]
        if not label:
            raise ValueError("等第名稱不能空白")
        grades.append({"min": _number(g.get("min"), f"等第「{label}」最低分", 0, 100), "label": label})
    if not grades:
        raise ValueError("至少要有一個等第")
    grades.sort(key=lambda g: g["min"], reverse=True)
    if len({g["min"] for g in grades}) != len(grades) or len({g["label"] for g in grades}) != len(grades):
        raise ValueError("等第的名稱與最低分不能重複")
    if grades[-1]["min"] != 0:
        raise ValueError("最低的等第門檻須為 0 分，所有分數才會有對應等第")
    rules["grades"] = grades
    return rules


def save_rules(rules):
    by = session.get("full_name") or session.get("username") or ""
    payload = json.dumps(rules, ensure_ascii=False)
    saved = deps.db_execute(
        "INSERT INTO conduct_settings (id, settings_json, updated_by) VALUES (1, %s, %s) "
        "ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json), updated_by = VALUES(updated_by)", (payload, by))
    if saved is None:
        DEMO_SETTINGS.update(rules=copy.deepcopy(rules), meta={"updated_by": by, "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M")})


# ---------- 資料存取 ----------

def load_records(student_id, rules):
    rows = deps.fetch_db_rows(
        "SELECT id, semester, record_date, type, count, reason, recorded_by FROM conduct_records "
        "WHERE student_id = %s ORDER BY record_date DESC, id DESC", (student_id,))
    if rows is None:
        rows = sorted((r for r in DEMO_RECORDS if r["student_id"] == student_id), key=lambda r: (r["record_date"], r["id"]), reverse=True)
    return [{**r, "record_date": r["record_date"].strftime("%Y-%m-%d") if isinstance(r["record_date"], (date, datetime)) else r["record_date"],
             "count": int(r["count"]), "points": round(rules["merit_points"][r["type"]] * int(r["count"]), 2)} for r in rows]


def load_evaluations(student_id):
    rows = deps.fetch_db_rows(
        "SELECT semester, advisor_adjust, comment, evaluated_by FROM conduct_evaluations WHERE student_id = %s", (student_id,))
    if rows is None:
        return {sem: dict(v) for (sid, sem), v in DEMO_EVALUATIONS.items() if sid == student_id}
    return {r["semester"]: {"advisor_adjust": float(r["advisor_adjust"]), "comment": r["comment"] or "", "evaluated_by": r["evaluated_by"] or ""}
            for r in rows}


# ---------- 計算 ----------

def build_report(student_id, rules=None):
    """每學期的操行成績與明細 (新到舊)；本學期一定會列出"""
    rules = rules or load_rules()
    deduct = rules["attendance_deduct"]
    current = deps.current_semester()
    records, evaluations = load_records(student_id, rules), load_evaluations(student_id)
    absences = {}
    for r in deps.attendance_records(student_id):
        if r["type"] in deduct:
            absences.setdefault(deps.term_of(r["date"]), []).append(r)

    semesters = sorted({current, *evaluations, *(r["semester"] for r in records), *absences},
                       key=_semester_key, reverse=True)
    semesters = [s for s in semesters if _semester_key(s) <= _semester_key(current)]
    report = []
    for sem in semesters:
        merits = [r for r in records if r["semester"] == sem]
        merit_total = sum(r["points"] for r in merits)
        ev = evaluations.get(sem)
        advisor = ev["advisor_adjust"] if ev else 0
        att = absences.get(sem, [])
        counts = {t: sum(1 for r in att if r["type"] == t) for t in deduct}
        attendance_total = -round(sum(deduct[t] * n for t, n in counts.items()), 1)
        merit_total = round(merit_total, 2)
        score = round(max(0, min(100, rules["base_score"] + advisor + merit_total + attendance_total)), 1)
        report.append({
            "semester": sem,
            "is_current": sem == current,
            "score": score,
            "grade": grade_of(score, rules),
            "passed": score >= rules["pass_score"],
            "breakdown": [
                {"key": "base", "label": "基本分", "points": rules["base_score"]},
                {"key": "advisor", "label": "導師評分", "points": advisor, "pending": ev is None},
                {"key": "merits", "label": "獎懲", "points": merit_total},
                {"key": "attendance", "label": "缺曠扣分", "points": attendance_total},
            ],
            "evaluation": ev,
            "merits": merits,
            "merit_summary": {t: sum(r["count"] for r in merits if r["type"] == t) for t in MERIT_TYPES},
            "attendance": {"counts": counts,
                           "items": [{"date": r["date"], "course_name": r["course_name"], "type": r["type"],
                                      "points": -deduct[r["type"]]} for r in sorted(att, key=lambda r: r["date"], reverse=True)]},
        })
    return report


# ---------- 權限 ----------

def viewer_student_id():
    """學生 / 家長只能看本人；老師看導師班；教職員、管理員可看全校。回傳 (學號, 錯誤回應)"""
    role = session.get("role")
    if "username" not in session:
        return None, _error("請先登入", 401)
    if role in ("學生", "家長"):
        return session.get("student_id"), None
    return None, _error("此身分請用學號查詢", 403)


def can_manage(student_id, need_staff=False):
    role = session.get("role")
    if role in STAFF_ROLES:
        return True
    if role == "老師" and not need_staff:
        return student_id in deps.class_student_ids(session.get("advised_class") or "")
    return False


def _payload(student_id):
    student = deps.load_student(student_id) or {}
    rules = load_rules()
    return {"status": "success", "student": {k: student.get(k) for k in ("student_id", "full_name", "class_name", "dept_name")},
            "current_semester": deps.current_semester(), "rules": rules, "data": build_report(student_id, rules),
            "can_evaluate": can_manage(student_id), "can_record": can_manage(student_id, need_staff=True)}


def _role_guard(roles, message="權限不足"):
    """先檢查登入與身分，再查學生是否存在；否則未授權的人能從「查無此學生」試出學號"""
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in roles:
        return _error(message, 403)
    return None


# ---------- API ----------

@bp.route("/api/conduct/me", methods=["GET"])
def my_conduct():
    student_id, denied = viewer_student_id()
    if denied:
        return denied
    return jsonify(_payload(student_id)), 200


@bp.route("/api/conduct/students", methods=["GET"])
def manageable_students():
    """老師：導師班學生；教職員/管理員：全校 (給查詢下拉選單用)"""
    denied = _role_guard(("老師", *STAFF_ROLES))
    if denied:
        return denied
    role = session.get("role")
    ids =deps.class_student_ids(session.get("advised_class") or "") if role == "老師" else None
    students = deps.list_students()
    if ids is not None:
        students = [s for s in students if s["student_id"] in ids]
    return jsonify({"status": "success", "data": students}), 200


@bp.route("/api/conduct/students/<student_id>", methods=["GET"])
def student_conduct(student_id):
    denied = _role_guard(("老師", *STAFF_ROLES), "老師只能查看自己導師班的學生")
    if denied:
        return denied
    student_id = student_id.strip().upper()
    if not deps.load_student(student_id):
        return _error("查無此學生", 404)
    if not can_manage(student_id):
        return _error("老師只能查看自己導師班的學生", 403)
    return jsonify(_payload(student_id)), 200


@bp.route("/api/conduct/records", methods=["POST"])
def add_record():
    denied = _role_guard(STAFF_ROLES, "獎懲由生輔組 (教職員、管理員) 登錄")
    if denied:
        return denied
    data = request.get_json(silent=True) or {}
    student_id = str(data.get("student_id") or "").strip().upper()
    if not deps.load_student(student_id):
        return _error("查無此學生", 404)
    if not can_manage(student_id, need_staff=True):
        return _error("獎懲由生輔組 (教職員、管理員) 登錄", 403)
    record_type = data.get("type")
    if record_type not in MERIT_TYPES:
        return _error(f"獎懲種類須為 {'、'.join(MERIT_TYPES)}")
    try:
        count = int(data.get("count") or 1)
        record_date = datetime.strptime(str(data.get("record_date") or date.today().isoformat()), "%Y-%m-%d").date().isoformat()
    except ValueError:
        return _error("次數須為數字、日期格式須為 YYYY-MM-DD")
    if not 1 <= count <= 3:
        return _error("次數須為 1–3 次")
    reason = str(data.get("reason") or "").strip()[:200]
    if not reason:
        return _error("請填寫獎懲事由，學生才看得懂原因")
    semester = deps.term_of(record_date)
    recorded_by = session.get("full_name", "")
    result = deps.db_execute(
        "INSERT INTO conduct_records (student_id, semester, record_date, type, count, reason, recorded_by) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (student_id, semester, record_date, record_type, count, reason, recorded_by))
    if result is not None:
        record_id = result["lastrowid"]
    else:
        record_id = max((r["id"] for r in DEMO_RECORDS), default=0) + 1
        DEMO_RECORDS.append({"id": record_id, "student_id": student_id, "semester": semester, "record_date": record_date,
                             "type": record_type, "count": count, "reason": reason, "recorded_by": recorded_by})
    deps.write_audit_log("conduct_records", record_id, "新增", after={"student_id": student_id, "type": record_type, "count": count, "reason": reason})
    return jsonify({**_payload(student_id), "message": f"已登錄 {record_type} {count} 次 ({semester} 學期)"}), 201


@bp.route("/api/conduct/records/<int:record_id>", methods=["DELETE"])
def delete_record(record_id):
    denied = _role_guard(STAFF_ROLES, "獎懲由生輔組 (教職員、管理員) 管理")
    if denied:
        return denied
    rows = deps.fetch_db_rows("SELECT * FROM conduct_records WHERE id = %s", (record_id,))
    demo = rows is None
    record = (rows or [None])[0] if not demo else next((r for r in DEMO_RECORDS if r["id"] == record_id), None)
    if not record:
        return _error("找不到這筆獎懲", 404)
    if demo:
        DEMO_RECORDS.remove(record)
    else:
        deps.db_execute("DELETE FROM conduct_records WHERE id = %s", (record_id,))
    deps.write_audit_log("conduct_records", record_id, "刪除", before={k: str(v) for k, v in record.items()})
    return jsonify({**_payload(record["student_id"]), "message": "已刪除這筆獎懲"}), 200


@bp.route("/api/conduct/evaluations/<student_id>/<semester>", methods=["PUT"])
def save_evaluation(student_id, semester):
    denied = _role_guard(("老師", *STAFF_ROLES), "導師評分僅限導師班老師或生輔組填寫")
    if denied:
        return denied
    student_id = student_id.strip().upper()
    if not deps.load_student(student_id):
        return _error("查無此學生", 404)
    if not can_manage(student_id):
        return _error("導師評分僅限導師班老師或生輔組填寫", 403)
    if not SEMESTER_PATTERN.match(semester) or _semester_key(semester) > _semester_key(deps.current_semester()):
        return _error("學期格式須為 115-1，且不能是未來學期")
    data = request.get_json(silent=True) or {}
    try:
        adjust = round(float(data.get("advisor_adjust")), 1)
    except (TypeError, ValueError):
        return _error("導師評分須為數字")
    limit = load_rules()["advisor_range"]
    if abs(adjust) > limit:
        return _error(f"導師評分範圍為 -{limit} 到 +{limit} 分")
    comment = str(data.get("comment") or "").strip()[:255]
    by = session.get("full_name", "")
    saved = deps.db_execute(
        "INSERT INTO conduct_evaluations (student_id, semester, advisor_adjust, comment, evaluated_by) VALUES (%s, %s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE advisor_adjust = VALUES(advisor_adjust), comment = VALUES(comment), evaluated_by = VALUES(evaluated_by)",
        (student_id, semester, adjust, comment, by))
    if saved is None:
        DEMO_EVALUATIONS[(student_id, semester)] = {"advisor_adjust": adjust, "comment": comment, "evaluated_by": by}
    deps.write_audit_log("conduct_evaluations", f"{student_id}/{semester}", "修改", after={"advisor_adjust": adjust, "comment": comment})
    return jsonify({**_payload(student_id), "message": f"已儲存 {semester} 學期導師評分"}), 200


# ---------- 後台：計分規則設定 ----------

def compare_rules(old, new):
    """全校學生在舊、新規則下的分數差異 (系統自動比對，不用人工逐筆核對)；只回傳有變化的"""
    changes, total = [], 0
    for s in deps.list_students():
        before = {r["semester"]: r for r in build_report(s["student_id"], old)}
        for r in build_report(s["student_id"], new):
            total += 1
            b = before.get(r["semester"])
            if b and (b["score"] != r["score"] or b["grade"] != r["grade"] or b["passed"] != r["passed"]):
                changes.append({"student_id": s["student_id"], "full_name": s.get("full_name", ""), "semester": r["semester"],
                                "before": {k: b[k] for k in ("score", "grade", "passed")},
                                "after": {k: r[k] for k in ("score", "grade", "passed")}})
    return {"checked": total, "changed": len(changes),
            "grade_changed": sum(1 for c in changes if c["before"]["grade"] != c["after"]["grade"]),
            "pass_changed": sum(1 for c in changes if c["before"]["passed"] != c["after"]["passed"]),
            "items": changes}


def _settings_guard():
    if "username" not in session:
        return _error("請先登入", 401)
    if session.get("role") not in STAFF_ROLES:
        return _error("操行計分規則僅限生輔組 (教職員) 與管理員設定", 403)
    return None


@bp.route("/api/admin/conduct-settings", methods=["GET"])
def get_settings():
    denied = _settings_guard()
    if denied:
        return denied
    return jsonify({"status": "success", "rules": load_rules(), "defaults": DEFAULT_RULES,
                    "merit_types": MERIT_TYPES, "attendance_types": ATTENDANCE_TYPES}), 200


@bp.route("/api/admin/conduct-settings/preview", methods=["POST"])
def preview_settings():
    """不儲存，先看改了之後哪些學生的分數、等第、及格與否會變"""
    denied = _settings_guard()
    if denied:
        return denied
    try:
        new = validate_rules(request.get_json(silent=True) or {})
    except ValueError as e:
        return _error(str(e))
    return jsonify({"status": "success", "impact": compare_rules(load_rules(), new)}), 200


@bp.route("/api/admin/conduct-settings", methods=["PUT"])
def update_settings():
    denied = _settings_guard()
    if denied:
        return denied
    data = request.get_json(silent=True) or {}
    old = load_rules()
    try:
        new = DEFAULT_RULES if data.get("reset") else validate_rules(data)
    except ValueError as e:
        return _error(str(e))
    impact = compare_rules(old, new)
    save_rules(new)
    deps.write_audit_log("conduct_settings", 1, "修改",
                         before={k: v for k, v in old.items() if k in DEFAULT_RULES}, after=new)
    message = "已還原預設計分規則" if data.get("reset") else "計分規則已更新"
    return jsonify({"status": "success", "message": f"{message}，{impact['changed']} 筆學期成績隨之重新計算",
                    "rules": load_rules(), "impact": impact}), 200
