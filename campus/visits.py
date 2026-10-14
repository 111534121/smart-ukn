"""預約校園參觀：訪客 (未來學生/未來家長) 或家長線上選日期時段預約校園導覽；
承辦單位 (教職員/管理員) 可查看名單、核准或取消。
"""
from datetime import date, datetime

from flask import Blueprint, request

from .common import error, ok, require, store, next_id, now_str, current_user, user_key, STAFF_ROLES

bp = Blueprint("campus_visits", __name__)

SLOTS = ("上午 09:30-11:00", "下午 14:00-15:30")
MAX_PER_SLOT = 3  # 每個時段最多同時接待幾個團
CLOSED_WEEKDAYS = (6, 7)  # 週六、週日不開放 (isoweekday)


def bookings():
    return store.section("visit_bookings", list)


@bp.route("/api/campus/visits/slots", methods=["GET"])
def slots():
    """某天各時段還可以預約的名額；不需要登入即可查詢"""
    try:
        day = datetime.strptime(request.args.get("date", ""), "%Y-%m-%d").date()
    except ValueError:
        return error("請提供日期 (date=YYYY-MM-DD)")
    rows = [b for b in bookings() if b["date"] == day.isoformat() and b["status"] != "已取消"]
    closed = day.isoweekday() in CLOSED_WEEKDAYS or day < date.today()
    data = [{"slot": s, "booked": sum(1 for b in rows if b["slot"] == s), "capacity": MAX_PER_SLOT,
             "full": sum(1 for b in rows if b["slot"] == s) >= MAX_PER_SLOT} for s in SLOTS]
    return ok(date=day.isoformat(), closed=closed, data=data)


@bp.route("/api/campus/visits", methods=["GET", "POST"])
@require()
def visits_route():
    u = current_user()

    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        try:
            day = datetime.strptime(str(data.get("date", "")), "%Y-%m-%d").date()
        except ValueError:
            return error("日期格式須為 YYYY-MM-DD")
        if day < date.today():
            return error("不能預約過去的日期")
        if day.isoweekday() in CLOSED_WEEKDAYS:
            return error("週末不開放校園參觀，請選平日")
        slot = data.get("slot")
        if slot not in SLOTS:
            return error("請選擇時段")
        try:
            party_size = max(1, int(data.get("party_size", 1)))
        except (TypeError, ValueError):
            party_size = 1
        contact_name = str(data.get("contact_name", "")).strip()[:50] or u.get("full_name", "")
        contact_phone = str(data.get("contact_phone", "")).strip()[:30]
        if not contact_phone:
            return error("請填寫聯絡電話")
        note = str(data.get("note", "")).strip()[:300]
        with store.lock:
            items = bookings()
            existing = sum(1 for b in items if b["date"] == day.isoformat() and b["slot"] == slot and b["status"] != "已取消")
            if existing >= MAX_PER_SLOT:
                return error("這個時段預約已滿，請選其他時段", 409)
            item = {"id": next_id(items), "date": day.isoformat(), "slot": slot, "party_size": party_size,
                    "contact_name": contact_name, "contact_phone": contact_phone, "note": note,
                    "booked_by_key": user_key(), "booked_by_role": u["role"], "status": "待確認",
                    "created_at": now_str()}
            items.append(item)
            store.save()
        return ok(message=f"已送出 {day.isoformat()} {slot} 的參觀預約，承辦單位確認後會聯絡您", data=item)

    # GET
    if u["role"] in STAFF_ROLES:
        upcoming = sorted((b for b in bookings() if b["date"] >= date.today().isoformat()),
                          key=lambda b: (b["date"], b["slot"]))
        return ok(data=upcoming, scope="all")
    mine = [b for b in bookings() if b["booked_by_key"] == user_key()]
    mine.sort(key=lambda b: b["date"], reverse=True)
    return ok(data=mine, scope="mine")


@bp.route("/api/campus/visits/<int:visit_id>", methods=["POST"])
@require()
def update_visit(visit_id):
    u = current_user()
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    with store.lock:
        b = next((b for b in bookings() if b["id"] == visit_id), None)
        if not b:
            return error("找不到這筆預約", 404)
        if action == "cancel" and b["booked_by_key"] == user_key():
            b["status"] = "已取消"
        elif action in ("confirm", "cancel") and u["role"] in STAFF_ROLES:
            b["status"] = "已確認" if action == "confirm" else "已取消"
        else:
            return error("沒有權限", 403)
        store.save()
    return ok(message=f"狀態已更新為「{b['status']}」", data=b)
