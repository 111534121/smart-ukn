"""
智慧重補修推薦 (/api/student/retake-recommendations)

- 從學生歷年成績 (student_credits) 找出需要重補修的科目
- 對照當學期課表 (class_schedule) 中其他班級開的同名課程，比對學生既有課表排除衝堂
- 回傳每科的狀態 (已在課表 / 有班別可選 / 全部衝堂 / 未開課) 與可選班別，以及通知中心要用的資料

比對邏輯在 retake/logic.py (純函式)；通知串接用 notifications_for(student_id)。
app.py 呼叫 retake.init_app(app, deps) 註冊；deps 提供 load_course_map、load_student_credits、
load_schedule、load_student、current_semester；推播 (/api/admin/notify/retake) 另需
list_students、get_mailer、campus_email、already_notified、mark_notified。
"""
from types import SimpleNamespace

from flask import Blueprint, jsonify, request, session

from .logic import STATUS_LABELS, build_notifications, my_schedule, needs_retake, passed_course_ids, recommend

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
    credit_records = deps.load_student_credits(student_id)
    failed = needs_retake(credit_records, courses)
    schedule_rows = deps.load_schedule()
    results = recommend(failed, schedule_rows, student.get("class_name"), student_id,
                        courses=courses, passed_ids=passed_course_ids(credit_records))
    counts = {status: sum(r["status"] == status for r in results) for status in STATUS_LABELS}
    # 畫面一進來先看自己現在的課表，再看下面的重補修推薦 (見 static/js/retake.js)
    schedule = sorted(my_schedule(schedule_rows, student.get("class_name"), student_id),
                      key=lambda s: (s["weekday"], s["period_start"]))
    return {"student": {k: student.get(k) for k in ("student_id", "full_name", "class_name", "dept_name")},
            "semester": deps.current_semester(), "summary": counts, "data": results, "schedule": schedule}


def notifications_for(student_id):
    """通知中心串接用：回傳這位學生需要通知的重補修項目 (格式見 logic.build_notifications)"""
    report = recommendations_for(student_id)
    return build_notifications(student_id, report["data"]) if report else []


NOTIFY_SUBJECT = "【康寧大學】重補修推薦通知"


# 【功能：重補修推薦】推播：管理員一鍵跑「讀成績與課表 → 推薦結果 → 寄通知」，同一科同一狀態只通知一次
@bp.route("/api/admin/notify/retake", methods=["POST"])
def notify_retake():
    """管理員/教職員觸發。body {"dry_run": true} 只回傳會通知誰，不寄信也不記錄。

    信件只說有幾科、請登入查看，不寫成績；ref_key 用 build_notifications 的 key
    (學號:課程:狀態)，狀態改變 (例如從全部衝堂變成有班可選) 會再通知一次。
    """
    if "username" not in session:
        return _error("請先登入", 401)
    if session.get("role") not in ("管理員", "教職員"):
        return _error("僅限管理員或教職員操作", 403)
    dry_run = bool((request.get_json(silent=True) or {}).get("dry_run"))
    mailer = deps.get_mailer()
    students, failed, sent = [], [], 0
    for s in deps.list_students():
        sid = s["student_id"]
        notes = notifications_for(sid)
        new = [n for n in notes if not deps.already_notified(sid, "retake", n["key"], "student")]
        if not notes:
            continue
        students.append({"student_id": sid, "full_name": s.get("full_name"), "class_name": s.get("class_name"),
                         "total": len(notes), "new": len(new),
                         "items": [{"course_name": n["course_name"], "status": n["status"], "is_new": n in new} for n in notes]})
        if dry_run or not new:
            continue
        body = (f"系統比對你的成績與本學期課表，有 {len(new)} 科重補修有新的安排建議"
                f"（{'、'.join(n['course_name'] for n in new)}）。請登入系統「重補修推薦」查看可選班別與衝堂情形。")
        try:
            mailer.send(deps.campus_email(sid), NOTIFY_SUBJECT, body)
        except Exception as e:
            failed.append({"student_id": sid, "error": str(e)})
            continue
        for n in new:
            deps.mark_notified(sid, "retake", n["key"], "student")
        sent += 1
    pending = sum(1 for x in students if x["new"])
    if dry_run:
        message = f"預覽：{len(students)} 位學生有重補修項目，其中 {pending} 位有新的項目會收到通知"
    elif not sent and not failed:
        message = "目前沒有需要通知的新項目"
    else:
        where = "已寄出" if mailer.mode == "smtp" else "demo 模式：已印在伺服器終端機"
        message = f"{where}，重補修通知 {sent} 封" + (f"；{len(failed)} 封寄送失敗" if failed else "")
    return jsonify({"status": "success", "message": message, "dry_run": dry_run, "sent": sent,
                    "failed": failed, "students": students, "notify_mode": mailer.mode}), 200


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
