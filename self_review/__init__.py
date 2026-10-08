"""
學期學習自評表

- 學生每學期一份：6 項 1–5 分自評 + 3 題文字反思
- 可存草稿 (欄位可空)，標記「已完成」時 6 項分數都要填
- 只有學生本人看得到；下次登入仍保留，也可以刪除
- 列表附各學期分數，前端用來跟上學期比較

app.py 呼叫 self_review.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、current_semester (回傳 "115-1")。
"""
import json
import re
from datetime import datetime
from types import SimpleNamespace

from flask import Blueprint, jsonify, request, session

bp = Blueprint("self_review", __name__)
deps = SimpleNamespace()

RATING_ITEMS = [
    {"key": "attitude", "label": "學習態度", "hint": "上課專心、主動發問、課前預習"},
    {"key": "attendance", "label": "出席與準時", "hint": "準時上課、很少缺曠"},
    {"key": "assignments", "label": "作業與報告", "hint": "按時繳交、品質用心"},
    {"key": "skills", "label": "專業能力", "hint": "對本科專業知識與技能的掌握"},
    {"key": "teamwork", "label": "團隊合作", "hint": "分組時溝通、分工、負責"},
    {"key": "time", "label": "時間管理", "hint": "兼顧課業、打工、社團與休息"},
]
REFLECTION_ITEMS = [
    {"key": "gained", "label": "這學期最大的收穫"},
    {"key": "improve", "label": "需要加強的地方"},
    {"key": "goals", "label": "下學期的目標"},
]
RATING_KEYS = [i["key"] for i in RATING_ITEMS]
REFLECTION_KEYS = [i["key"] for i in REFLECTION_ITEMS]
STATUS_DRAFT, STATUS_DONE = "草稿", "已完成"
REFLECTION_MAX = 500
SEMESTER_PATTERN = re.compile(r"^(\d{2,3})-([12])$")

DEMO_REVIEWS = {}  # MySQL 離線時：{(student_id, semester): row}


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def _owner():
    """只有學生本人可以使用；回傳 (學號, 錯誤回應)"""
    if "username" not in session:
        return None, _error("請先登入學生帳號", 401)
    if session.get("role") != "學生" or not session.get("student_id"):
        return None, _error("自評表僅限學生本人使用", 403)
    return session["student_id"], None


def _semester_key(semester):
    m = SEMESTER_PATTERN.match(semester)
    return (int(m.group(1)), int(m.group(2))) if m else None


def _row_to_review(row):
    def load(value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except ValueError:
                return {}
        return value or {}
    ratings, reflections = load(row["ratings_json"]), load(row["reflections_json"])
    scores = [ratings.get(k) for k in RATING_KEYS if ratings.get(k)]
    fmt = lambda v: v.strftime("%Y-%m-%d %H:%M") if isinstance(v, datetime) else v
    return {
        "semester": row["semester"],
        "status": row["status"],
        "ratings": {k: ratings.get(k) for k in RATING_KEYS},
        "reflections": {k: reflections.get(k, "") for k in REFLECTION_KEYS},
        "average": round(sum(scores) / len(scores), 2) if scores else None,
        "created_at": fmt(row.get("created_at")),
        "updated_at": fmt(row.get("updated_at")),
    }


def load_reviews(student_id):
    rows = deps.fetch_db_rows("SELECT * FROM self_reviews WHERE student_id = %s", (student_id,))
    if rows is None:
        rows = [r for (sid, _), r in DEMO_REVIEWS.items() if sid == student_id]
    reviews = [_row_to_review(r) for r in rows]
    return sorted(reviews, key=lambda r: _semester_key(r["semester"]) or (0, 0), reverse=True)


@bp.route("/api/self-review", methods=["GET"])
def list_reviews():
    student_id, denied = _owner()
    if denied:
        return denied
    return jsonify({
        "status": "success",
        "current_semester": deps.current_semester(),
        "rating_items": RATING_ITEMS,
        "reflection_items": REFLECTION_ITEMS,
        "reflection_max": REFLECTION_MAX,
        "data": load_reviews(student_id),
    }), 200


def _parse(data, status):
    ratings_in = data.get("ratings") or {}
    reflections_in = data.get("reflections") or {}
    ratings = {}
    for key in RATING_KEYS:
        value = ratings_in.get(key)
        if value in (None, "", 0):
            ratings[key] = None
            continue
        try:
            value = int(value)
        except (TypeError, ValueError):
            return None, None, "分數須為 1 到 5"
        if not 1 <= value <= 5:
            return None, None, "分數須為 1 到 5"
        ratings[key] = value
    reflections = {}
    for key in REFLECTION_KEYS:
        text = str(reflections_in.get(key) or "").strip()
        if len(text) > REFLECTION_MAX:
            return None, None, f"每題最多 {REFLECTION_MAX} 字"
        reflections[key] = text
    if status == STATUS_DONE and any(v is None for v in ratings.values()):
        missing = [i["label"] for i in RATING_ITEMS if ratings[i["key"]] is None]
        return None, None, f"標記為已完成前，請先填寫：{'、'.join(missing)}"
    return ratings, reflections, None


@bp.route("/api/self-review/<semester>", methods=["GET", "PUT", "DELETE"])
def review(semester):
    student_id, denied = _owner()
    if denied:
        return denied
    key = _semester_key(semester)
    if not key:
        return _error("學期格式須為 學年-學期，例如 115-1")
    if key > _semester_key(deps.current_semester()):
        return _error("不能填寫未來學期的自評")
    existing = next((r for r in load_reviews(student_id) if r["semester"] == semester), None)

    if request.method == "GET":
        return jsonify({"status": "success", "exists": bool(existing), "data": existing}), 200

    if request.method == "DELETE":
        if not existing:
            return _error("這學期還沒有自評表", 404)
        if deps.db_execute("DELETE FROM self_reviews WHERE student_id = %s AND semester = %s", (student_id, semester)) is None:
            DEMO_REVIEWS.pop((student_id, semester), None)
        return jsonify({"status": "success", "message": f"已刪除 {semester} 學期的自評表"}), 200

    data = request.get_json(silent=True) or {}
    status = data.get("status", STATUS_DRAFT)
    if status not in (STATUS_DRAFT, STATUS_DONE):
        return _error(f"狀態須為 {STATUS_DRAFT} 或 {STATUS_DONE}")
    ratings, reflections, problem = _parse(data, status)
    if problem:
        return _error(problem)

    ratings_json = json.dumps(ratings, ensure_ascii=False)
    reflections_json = json.dumps(reflections, ensure_ascii=False)
    saved = deps.db_execute(
        "INSERT INTO self_reviews (student_id, semester, ratings_json, reflections_json, status) VALUES (%s, %s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE ratings_json = VALUES(ratings_json), reflections_json = VALUES(reflections_json), status = VALUES(status)",
        (student_id, semester, ratings_json, reflections_json, status))
    if saved is None:
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        DEMO_REVIEWS[(student_id, semester)] = {
            "semester": semester, "status": status, "ratings_json": ratings_json, "reflections_json": reflections_json,
            "created_at": (existing or {}).get("created_at") or now, "updated_at": now,
        }
    result = next(r for r in load_reviews(student_id) if r["semester"] == semester)
    return jsonify({
        "status": "success",
        "message": "已完成本學期自評 🎉" if status == STATUS_DONE else "草稿已儲存",
        "data": result,
    }), 200
