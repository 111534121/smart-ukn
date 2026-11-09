"""
校慶跑馬燈與匿名祝福

- 校慶前 announce_days 天 (預設 30) 起，網頁最上方出現跑馬燈，校慶最後一天過後自動消失
- 跑馬燈文字支援 中文 / English / 日本語 (?lang=zh|en|ja)
- 期間內任何人都能留下匿名祝福：不需登入，資料庫不存姓名、學號或 IP；
  活動設定 require_approval = 1 時需經後台審核才會顯示
- 後台 (管理員、教職員) 可修改校慶日期與名稱，並審核 / 隱藏 / 刪除祝福

app.py 呼叫 anniversary.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、write_audit_log。
MySQL 離線時資料存在記憶體 (重啟後重設)。
"""
import threading
import time
from collections import deque
from datetime import date, datetime
from types import SimpleNamespace

from flask import Blueprint, jsonify, request, session

from .logic import (
    LANGS, MESSAGES, TEXTS, WISH_HIDDEN, WISH_PENDING, WISH_STATUSES, WISH_VISIBLE,
    clean_wish, display_window, normalize_lang, official_text, pick_active_event,
)

bp = Blueprint("anniversary", __name__)
deps = SimpleNamespace()

ADMIN_ROLES = ("管理員", "系統管理員", "教職員")
MARQUEE_WISH_LIMIT = 30
# 同一來源 10 分鐘內最多送 3 則 (只存在記憶體，不寫入資料庫)
RATE_LIMIT, RATE_WINDOW_SECONDS = 3, 600

# 示範資料：校慶日期請到後台「校慶跑馬燈」改成實際日期
DEMO_EVENTS = [{
    "id": 1, "name_zh": "康寧大學校慶", "name_en": "UKN Anniversary Celebration", "name_ja": "康寧大学 創立記念祭",
    "start_date": "2026-11-01", "end_date": "2026-11-01", "announce_days": 30, "require_approval": 1, "is_enabled": 1,
}]
DEMO_WISHES = []

_rate_lock = threading.Lock()
_recent_posts = {}

EVENT_FIELDS = ("name_zh", "name_en", "name_ja", "start_date", "end_date", "announce_days", "require_approval", "is_enabled")


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def _require_admin():
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in ADMIN_ROLES:
        return _error("權限不足，僅限管理員或教職員", 403)
    return None


def _serialize(row):
    return {k: (v.isoformat(sep=" ") if isinstance(v, datetime) else v.isoformat() if isinstance(v, date) else v)
            for k, v in row.items()}


# ---------- 資料存取 (MySQL 優先，離線時用記憶體) ----------

def load_events():
    rows = deps.fetch_db_rows("SELECT * FROM anniversary_events ORDER BY start_date DESC, id DESC")
    if rows is None:
        return [dict(e) for e in sorted(DEMO_EVENTS, key=lambda e: (e["start_date"], e["id"]), reverse=True)]
    return [_serialize(r) for r in rows]


def load_wishes(event_id, statuses=None, limit=None):
    statuses = statuses or WISH_STATUSES
    placeholders = ", ".join(["%s"] * len(statuses))
    sql = f"SELECT * FROM anniversary_wishes WHERE event_id = %s AND status IN ({placeholders}) ORDER BY created_at DESC, id DESC"
    if limit:
        sql += f" LIMIT {int(limit)}"
    rows = deps.fetch_db_rows(sql, (event_id, *statuses))
    if rows is None:
        rows = sorted((w for w in DEMO_WISHES if w["event_id"] == event_id and w["status"] in statuses),
                      key=lambda w: (w["created_at"], w["id"]), reverse=True)
        return [dict(w) for w in (rows[:limit] if limit else rows)]
    return [_serialize(r) for r in rows]


def add_wish(event_id, message, lang, status):
    saved = deps.db_execute(
        "INSERT INTO anniversary_wishes (event_id, message, lang, status) VALUES (%s, %s, %s, %s)",
        (event_id, message, lang, status))
    if saved is None:
        DEMO_WISHES.append({
            "id": max((w["id"] for w in DEMO_WISHES), default=0) + 1, "event_id": event_id, "message": message,
            "lang": lang, "status": status, "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })


def find_wish(wish_id):
    rows = deps.fetch_db_rows("SELECT * FROM anniversary_wishes WHERE id = %s", (wish_id,))
    if rows is None:
        return next((dict(w) for w in DEMO_WISHES if w["id"] == wish_id), None)
    return _serialize(rows[0]) if rows else None


def _too_many_posts(source):
    now = time.monotonic()
    with _rate_lock:
        recent = _recent_posts.setdefault(source, deque())
        while recent and now - recent[0] > RATE_WINDOW_SECONDS:
            recent.popleft()
        if len(recent) >= RATE_LIMIT:
            return True
        recent.append(now)
        return False


# ---------- 前台 API ----------

@bp.route("/api/anniversary/marquee", methods=["GET"])
def get_marquee():
    """跑馬燈內容：不在顯示期間時 active = false，前端就不顯示"""
    lang = normalize_lang(request.args.get("lang"))
    today = date.today()
    event = pick_active_event(load_events(), today)
    if not event:
        return jsonify({"status": "success", "active": False, "lang": lang}), 200

    phase, days_left, text = official_text(event, today, lang)
    wishes = load_wishes(event["id"], (WISH_VISIBLE,), MARQUEE_WISH_LIMIT)
    return jsonify({
        "status": "success",
        "active": True,
        "lang": lang,
        "langs": list(LANGS),
        "event": {
            "id": event["id"],
            "name": event.get(f"name_{lang}") or event["name_zh"],
            "start_date": event["start_date"],
            "end_date": event["end_date"],
        },
        "phase": phase,
        "days_left": days_left,
        "require_approval": bool(event["require_approval"]),
        "items": [{"type": "official", "text": text}] +
                 [{"type": "wish", "label": TEXTS[lang]["wish"], "text": w["message"]} for w in wishes],
    }), 200


@bp.route("/api/anniversary/wishes", methods=["POST"])
def post_wish():
    """匿名祝福：不需登入，不記錄身分"""
    data = request.get_json(silent=True) or {}
    lang = normalize_lang(data.get("lang"))
    msg = MESSAGES[lang]
    event = pick_active_event(load_events(), date.today())
    if not event:
        return _error(msg["inactive"])
    message, problem = clean_wish(data.get("message"))
    if problem:
        return _error(msg[problem])
    if _too_many_posts(request.remote_addr or "unknown"):
        return _error(msg["rate_limited"], 429)

    status = WISH_PENDING if event["require_approval"] else WISH_VISIBLE
    add_wish(event["id"], message, lang, status)
    return jsonify({
        "status": "success",
        "pending": status == WISH_PENDING,
        "message": msg["thanks_pending"] if status == WISH_PENDING else msg["thanks_visible"],
    }), 201


# ---------- 後台 API ----------

@bp.route("/api/admin/anniversary", methods=["GET"])
def admin_overview():
    denied = _require_admin()
    if denied:
        return denied
    events = load_events()
    today = date.today()
    for e in events:
        first, last = display_window(e)
        e["display_from"], e["display_until"] = first.isoformat(), last.isoformat()
        e["is_showing"] = bool(e["is_enabled"]) and first <= today <= last
    try:
        event_id = int(request.args.get("event_id") or (events[0]["id"] if events else 0))
    except ValueError:
        return _error("event_id 須為數字")
    wishes = load_wishes(event_id) if event_id else []
    return jsonify({
        "status": "success",
        "events": events,
        "event_id": event_id,
        "wishes": wishes,
        "pending_count": sum(1 for w in wishes if w["status"] == WISH_PENDING),
    }), 200


def _parse_event(data):
    """檢查後台送來的校慶設定，回傳 (欄位 dict, 錯誤訊息)"""
    fields = {
        "name_zh": str(data.get("name_zh", "")).strip()[:100],
        "name_en": str(data.get("name_en", "")).strip()[:150] or None,
        "name_ja": str(data.get("name_ja", "")).strip()[:100] or None,
        "start_date": str(data.get("start_date", "")).strip(),
        "end_date": str(data.get("end_date", "")).strip() or str(data.get("start_date", "")).strip(),
        "require_approval": 1 if data.get("require_approval", True) in (True, 1, "1", "true") else 0,
        "is_enabled": 1 if data.get("is_enabled", True) in (True, 1, "1", "true") else 0,
    }
    if not fields["name_zh"]:
        return None, "請填寫校慶名稱 (中文)"
    try:
        start, end = date.fromisoformat(fields["start_date"]), date.fromisoformat(fields["end_date"])
    except ValueError:
        return None, "日期格式須為 YYYY-MM-DD"
    if end < start:
        return None, "結束日期不可早於校慶日期"
    try:
        fields["announce_days"] = int(data.get("announce_days", 30))
    except (TypeError, ValueError):
        return None, "提前顯示天數須為數字"
    if not 1 <= fields["announce_days"] <= 120:
        return None, "提前顯示天數須介於 1 到 120 天"
    return fields, None


@bp.route("/api/admin/anniversary/events", methods=["POST"])
def create_event():
    denied = _require_admin()
    if denied:
        return denied
    fields, problem = _parse_event(request.get_json(silent=True) or {})
    if problem:
        return _error(problem)
    saved = deps.db_execute(
        f"INSERT INTO anniversary_events ({', '.join(EVENT_FIELDS)}) VALUES ({', '.join(['%s'] * len(EVENT_FIELDS))})",
        tuple(fields[k] for k in EVENT_FIELDS))
    if saved is None:
        new_id = max((e["id"] for e in DEMO_EVENTS), default=0) + 1
        DEMO_EVENTS.append({"id": new_id, **fields})
    else:
        new_id = saved["lastrowid"]
    deps.write_audit_log("anniversary_events", new_id, "新增", after=fields)
    return jsonify({"status": "success", "message": "已新增校慶活動", "id": new_id}), 201


@bp.route("/api/admin/anniversary/events/<int:event_id>", methods=["PUT", "DELETE"])
def update_event(event_id):
    denied = _require_admin()
    if denied:
        return denied
    before = next((e for e in load_events() if e["id"] == event_id), None)
    if not before:
        return _error("找不到該校慶活動", 404)

    if request.method == "DELETE":
        if deps.db_execute("DELETE FROM anniversary_events WHERE id = %s", (event_id,)) is None:
            DEMO_EVENTS[:] = [e for e in DEMO_EVENTS if e["id"] != event_id]
            DEMO_WISHES[:] = [w for w in DEMO_WISHES if w["event_id"] != event_id]
        deps.write_audit_log("anniversary_events", event_id, "刪除", before=before)
        return jsonify({"status": "success", "message": "已刪除校慶活動與其祝福"}), 200

    fields, problem = _parse_event(request.get_json(silent=True) or {})
    if problem:
        return _error(problem)
    saved = deps.db_execute(
        f"UPDATE anniversary_events SET {', '.join(f'{k} = %s' for k in EVENT_FIELDS)} WHERE id = %s",
        (*(fields[k] for k in EVENT_FIELDS), event_id))
    if saved is None:
        next(e for e in DEMO_EVENTS if e["id"] == event_id).update(fields)
    deps.write_audit_log("anniversary_events", event_id, "修改",
                         before={k: before.get(k) for k in EVENT_FIELDS}, after=fields)
    return jsonify({"status": "success", "message": "校慶設定已更新"}), 200


@bp.route("/api/admin/anniversary/wishes/<int:wish_id>", methods=["PUT", "DELETE"])
def moderate_wish(wish_id):
    denied = _require_admin()
    if denied:
        return denied
    wish = find_wish(wish_id)
    if not wish:
        return _error("找不到該則祝福", 404)

    if request.method == "DELETE":
        if deps.db_execute("DELETE FROM anniversary_wishes WHERE id = %s", (wish_id,)) is None:
            DEMO_WISHES[:] = [w for w in DEMO_WISHES if w["id"] != wish_id]
        deps.write_audit_log("anniversary_wishes", wish_id, "刪除", before={"message": wish["message"], "status": wish["status"]})
        return jsonify({"status": "success", "message": "已刪除"}), 200

    status = str((request.get_json(silent=True) or {}).get("status", ""))
    if status not in (WISH_VISIBLE, WISH_HIDDEN):
        return _error(f"狀態須為 {WISH_VISIBLE} 或 {WISH_HIDDEN}")
    if deps.db_execute("UPDATE anniversary_wishes SET status = %s WHERE id = %s", (status, wish_id)) is None:
        next(w for w in DEMO_WISHES if w["id"] == wish_id)["status"] = status
    deps.write_audit_log("anniversary_wishes", wish_id, "修改",
                         before={"message": wish["message"], "status": wish["status"]}, after={"status": status})
    return jsonify({"status": "success", "message": f"已設為{status}"}), 200
