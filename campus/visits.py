"""預約校園參觀：訪客 (未來學生/未來家長) 或家長線上選日期時段預約校園導覽；
承辦單位 (教職員/管理員) 可查看名單、核准或取消。

資料存取交給 campus/visits_store.py：有 MySQL 的 visit_bookings 表時走資料庫，
連不上或還沒建表則退回 data/campus_store.json。
"""
import re
from datetime import date, datetime, timedelta

from flask import Blueprint, request

from . import visits_store as db
from .common import error, ok, require, store, now_str, current_user, user_key, STAFF_ROLES

bp = Blueprint("campus_visits", __name__)

SLOTS = ("上午 09:30-11:00", "下午 14:00-15:30")
MAX_PER_SLOT = 3  # 每個時段最多同時接待幾個團
CLOSED_WEEKDAYS = (6, 7)  # 週六、週日不開放 (isoweekday)
MAX_PARTY_SIZE = 40
MAX_DAYS_AHEAD = 60
PHONE_RE = re.compile(r"^[0-9+\-\s]+$")


def bookings():
    return db.all_bookings()


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
        if day > date.today() + timedelta(days=MAX_DAYS_AHEAD):
            return error(f"只能預約未來 {MAX_DAYS_AHEAD} 天內的日期")
        if day.isoweekday() in CLOSED_WEEKDAYS:
            return error("週末不開放校園參觀，請選平日")
        slot = data.get("slot")
        if slot not in SLOTS:
            return error("請選擇時段")
        try:
            party_size = int(data.get("party_size", 1))
        except (TypeError, ValueError):
            return error("人數須為數字")
        if party_size < 1 or party_size > MAX_PARTY_SIZE:
            return error(f"人數請填 1-{MAX_PARTY_SIZE} 之間的數字")
        contact_name = str(data.get("contact_name", "")).strip()[:50] or u.get("full_name", "")
        contact_phone = str(data.get("contact_phone", "")).strip()[:30]
        digits = re.sub(r"\D", "", contact_phone)
        if not contact_phone or not PHONE_RE.match(contact_phone) or not (8 <= len(digits) <= 15):
            return error("電話格式不正確，請確認後重新輸入")
        note = str(data.get("note", "")).strip()[:300]
        with store.lock:
            items = bookings()
            key = user_key()
            if any(b["date"] == day.isoformat() and b["slot"] == slot and b["status"] != "已取消"
                   and b["booked_by_key"] == key for b in items):
                return error("您已經預約過這個時段了，請勿重複預約", 409)
            existing = sum(1 for b in items if b["date"] == day.isoformat() and b["slot"] == slot and b["status"] != "已取消")
            if existing >= MAX_PER_SLOT:
                return error("這個時段預約已滿，請選其他時段", 409)
            item = db.insert_booking({
                "date": day.isoformat(), "slot": slot, "party_size": party_size,
                "contact_name": contact_name, "contact_phone": contact_phone, "note": note,
                "booked_by_key": user_key(), "booked_by_role": u["role"], "status": "待確認",
                "created_at": now_str(),
            })
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
            new_status = "已取消"
        elif action in ("confirm", "cancel") and u["role"] in STAFF_ROLES:
            new_status = "已確認" if action == "confirm" else "已取消"
        else:
            return error("沒有權限", 403)
        updated = db.update_booking(visit_id, {"status": new_status})
    return ok(message=f"狀態已更新為「{updated['status']}」", data=updated)
