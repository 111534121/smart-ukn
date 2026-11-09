"""
智慧重補修推薦 (/api/student/retake-recommendations)

- 從學生歷年成績 (student_credits) 找出需要重補修的科目
- 對照當學期課表 (class_schedule) 中其他班級開的同名課程，比對學生既有課表排除衝堂
- 回傳每科的狀態 (已在課表 / 有班別可選 / 全部衝堂 / 未開課) 與可選班別，以及通知中心要用的資料

比對邏輯在 retake/logic.py (純函式)；通知串接用 notifications_for(student_id)。
app.py 呼叫 retake.init_app(app, deps) 註冊；deps 提供 load_course_map、load_student_credits、
load_schedule、load_student、current_semester。
"""
from types import SimpleNamespace

from flask import Blueprint, jsonify, session

from .logic import STATUS_LABELS, build_notifications, needs_retake, recommend

bp = Blueprint("retake", __name__)
deps = SimpleNamespace()


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def recommendations_for(student_id):
    """某位學生的重補修推薦 (回傳 dict；查無學生時回傳 None)"""
    student = deps.load_student(student_id)
    if not student:
        return None
    courses = {c["course_id"]: c for c in deps.load_course_map()}
    failed = needs_retake(deps.load_student_credits(student_id), courses)
    results = recommend(failed, deps.load_schedule(), student.get("class_name"), student_id)
    counts = {status: sum(r["status"] == status for r in results) for status in STATUS_LABELS}
    return {"student": {k: student.get(k) for k in ("student_id", "full_name", "class_name", "dept_name")},
            "semester": deps.current_semester(), "summary": counts, "data": results}


def notifications_for(student_id):
    """通知中心串接用：回傳這位學生需要通知的重補修項目 (格式見 logic.build_notifications)"""
    report = recommendations_for(student_id)
    return build_notifications(student_id, report["data"]) if report else []


@bp.route("/api/student/retake-recommendations", methods=["GET"])
def my_recommendations():
    """學生本人或家長查看；學號一律取自 session"""
    if "username" not in session:
        return _error("請先登入學生帳號", 401)
    if session.get("role") not in ("學生", "家長") or not session.get("student_id"):
        return _error("重補修推薦僅限學生本人與家長查看", 403)
    student_id = session["student_id"]
    report = recommendations_for(student_id)
    if not report:
        return _error("查無學生資料", 404)
    return jsonify({"status": "success", **report,
                    "notifications": build_notifications(student_id, report["data"])}), 200
