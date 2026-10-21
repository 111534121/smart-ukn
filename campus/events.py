"""活動報名：教職員/管理員開活動，學生/家長/老師報名；名額滿了自動轉候補，
有人取消時自動遞補候補名單並寄信通知。

設計上刻意避開「只憑學號就能查/取消別人報名」的問題：
- 查詢「我的報名」與取消報名都是用登入身分 (user_key()) 比對，不是拿使用者輸入的學號比對，
  所以光知道別人的學號猜不出來、也取消不了別人的報名。
- Email 欄位只用來寄送通知信，不是身分驗證依據。

資料存於 data/campus_store.json (events / event_registrations)，與其他 campus 新功能一致。
"""
import re
import uuid
from datetime import date, timedelta

from flask import Blueprint, request

from .common import deps, error, ok, require, store, next_id, now_str, current_user, user_key, STAFF_ROLES
from attendance.notify import get_mailer

bp = Blueprint("campus_events", __name__)

MIN_AGE, MAX_AGE = 1, 120
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def events():
    return store.section("events", list)


def registrations():
    return store.section("event_registrations", list)


def find_event(event_id):
    return next((e for e in events() if e["id"] == event_id), None)


def clean_event(data, partial=False):
    """檢查活動表單；回傳 (欄位, 錯誤訊息)"""
    out = {}
    if not partial or "title" in data:
        title = str(data.get("title") or "").strip()[:100]
        if not title:
            return None, "活動名稱為必填"
        out["title"] = title
    if not partial or "description" in data:
        out["description"] = str(data.get("description") or "").strip()[:2000]
    if not partial or "image_url" in data:
        out["image_url"] = str(data.get("image_url") or "").strip()[:500]
    if not partial or "location" in data:
        location = str(data.get("location") or "").strip()[:100]
        if not location:
            return None, "活動地點為必填"
        out["location"] = location
    if not partial or "event_date" in data:
        event_date = str(data.get("event_date") or "").strip()
        try:
            date.fromisoformat(event_date)
        except ValueError:
            return None, "活動日期格式須為 YYYY-MM-DD"
        out["event_date"] = event_date
    if not partial or "event_time" in data:
        event_time = str(data.get("event_time") or "").strip()
        if event_time and not TIME_RE.match(event_time):
            return None, "活動時間格式須為 HH:MM"
        out["event_time"] = event_time
    if not partial or "registration_deadline" in data:
        deadline = str(data.get("registration_deadline") or "").strip()
        try:
            date.fromisoformat(deadline)
        except ValueError:
            return None, "報名截止日格式須為 YYYY-MM-DD"
        out["registration_deadline"] = deadline
    if not partial or "capacity" in data:
        try:
            capacity = int(data.get("capacity"))
        except (TypeError, ValueError):
            return None, "名額須為數字"
        if capacity < 1:
            return None, "名額至少要 1 人"
        out["capacity"] = capacity
    return out, None


def clean_registration(data):
    """檢查報名表單；回傳 (欄位, 錯誤訊息)"""
    student_id = str(data.get("student_id") or "").strip().upper()[:20]
    full_name = str(data.get("full_name") or "").strip()[:50]
    email = str(data.get("email") or "").strip()[:100]
    phone = str(data.get("phone") or "").strip()[:30]
    note = str(data.get("note") or "").strip()[:200]
    if not student_id or not full_name:
        return None, "學號與姓名為必填"
    if not EMAIL_RE.match(email):
        return None, "Email 格式不正確"
    # phone 是選填的聯絡電話；有填才檢查格式 (理由同訪客登記/緊急聯絡電話的手機號碼檢查)
    if phone and len(re.sub(r"\D", "", phone)) < 7:
        return None, "電話格式不正確，請確認後重新輸入"
    try:
        age = int(data.get("age"))
    except (TypeError, ValueError):
        return None, "年齡須為數字"
    if age < MIN_AGE or age > MAX_AGE:
        return None, f"年齡請填 {MIN_AGE}-{MAX_AGE} 之間的數字"
    return {"student_id": student_id, "full_name": full_name, "email": email,
            "phone": phone, "note": note, "age": age}, None


def event_view(ev, all_regs):
    """活動 + 即時統計 (報名人數、候補人數、是否已滿、是否已截止/已結束、出席率)"""
    active = [r for r in all_regs if r["event_id"] == ev["id"] and r["status"] != "已取消"]
    confirmed = [r for r in active if r["status"] == "已報名"]
    waitlisted = [r for r in active if r["status"] == "候補中"]
    checked_in = [r for r in confirmed if r.get("checked_in")]
    today = date.today().isoformat()
    deadline_passed = ev["registration_deadline"] < today
    event_over = ev["event_date"] < today
    return {
        **ev,
        "registered_count": len(confirmed),
        "waitlist_count": len(waitlisted),
        "is_full": len(confirmed) >= ev["capacity"],
        "deadline_passed": deadline_passed,
        "event_over": event_over,
        "can_register": not ev.get("cancelled") and not deadline_passed and not event_over,
        "checked_in_count": len(checked_in),
        "attendance_rate": round(len(checked_in) / len(confirmed), 2) if confirmed else None,
    }


def send_mail_safely(to_addr, subject, body):
    """通知信寄送失敗不應該讓報名/取消本身失敗，失敗就略過"""
    try:
        get_mailer().send(to_addr, subject, body)
    except Exception:
        pass


# ---------- 活動本身 (查詢/建立/編輯/取消活動)：建立與編輯限教職員/管理員 ----------

@bp.route("/api/campus/events", methods=["GET"])
@require()
def list_events():
    u = current_user()
    q = (request.args.get("q") or "").strip()
    location = (request.args.get("location") or "").strip()
    date_from = (request.args.get("date_from") or "").strip()
    date_to = (request.args.get("date_to") or "").strip()
    open_only = request.args.get("open_only") == "1"

    items = events()
    if u["role"] not in STAFF_ROLES:
        items = [e for e in items if not e.get("cancelled")]
    if q:
        items = [e for e in items if q in e["title"] or q in e.get("description", "")]
    if location:
        items = [e for e in items if location in e["location"]]
    if date_from:
        items = [e for e in items if e["event_date"] >= date_from]
    if date_to:
        items = [e for e in items if e["event_date"] <= date_to]

    all_regs = registrations()
    views = [event_view(e, all_regs) for e in items]
    if open_only:
        views = [v for v in views if v["can_register"] and not v["is_full"]]
    views.sort(key=lambda v: (v["event_date"], v["id"]))
    return ok(data=views)


@bp.route("/api/campus/events/<int:event_id>", methods=["GET"])
@require()
def get_event(event_id):
    ev = find_event(event_id)
    if not ev:
        return error("找不到該活動", 404)
    all_regs = registrations()
    view = event_view(ev, all_regs)
    view["my_registration"] = next(
        (r for r in all_regs if r["event_id"] == event_id and r["registered_by_key"] == user_key()
         and r["status"] != "已取消"), None)
    return ok(data=view)


@bp.route("/api/campus/events", methods=["POST"])
@require(*STAFF_ROLES)
def create_event():
    data = request.get_json(silent=True) or {}
    item, err = clean_event(data)
    if err:
        return error(err)
    if item["registration_deadline"] > item["event_date"]:
        return error("報名截止日不能晚於活動日期")
    u = current_user()
    with store.lock:
        items = events()
        item = {"id": next_id(items), **item, "cancelled": False,
                "created_by": u["username"], "created_at": now_str()}
        items.append(item)
        store.save()
    deps.write_audit_log("events", item["id"], "新增", after=item)
    return ok(message=f"已新增活動「{item['title']}」", data=item)


@bp.route("/api/campus/events/<int:event_id>", methods=["PUT"])
@require(*STAFF_ROLES)
def update_event(event_id):
    data = request.get_json(silent=True) or {}
    with store.lock:
        ev = find_event(event_id)
        if not ev:
            return error("找不到該活動", 404)
        patch, err = clean_event(data, partial=True)
        if err:
            return error(err)
        merged = {**ev, **patch}
        if merged["registration_deadline"] > merged["event_date"]:
            return error("報名截止日不能晚於活動日期")
        if "capacity" in patch:
            confirmed = sum(1 for r in registrations()
                             if r["event_id"] == event_id and r["status"] == "已報名")
            if patch["capacity"] < confirmed:
                return error(f"目前已有 {confirmed} 人確認報名，名額不能設得比這個人數少")
        before = dict(ev)
        ev.update(patch)
        store.save()
    deps.write_audit_log("events", event_id, "修改", before=before, after=ev)
    return ok(message="活動已更新", data=ev)


@bp.route("/api/campus/events/<int:event_id>", methods=["DELETE"])
@require(*STAFF_ROLES)
def cancel_event(event_id):
    with store.lock:
        ev = find_event(event_id)
        if not ev:
            return error("找不到該活動", 404)
        if ev.get("cancelled"):
            return error("這個活動已經取消過了")
        ev["cancelled"] = True
        store.save()
    deps.write_audit_log("events", event_id, "刪除", before={"cancelled": False}, after={"cancelled": True})
    return ok(message=f"活動「{ev['title']}」已取消")


# ---------- 報名 / 取消報名 (候補名單自動遞補) ----------

@bp.route("/api/campus/events/<int:event_id>/register", methods=["POST"])
@require()
def register_event(event_id):
    u = current_user()
    data = request.get_json(silent=True) or {}
    fields, err = clean_registration(data)
    if err:
        return error(err)

    with store.lock:
        ev = find_event(event_id)
        if not ev or ev.get("cancelled"):
            return error("找不到該活動", 404)
        today = date.today().isoformat()
        if ev["registration_deadline"] < today:
            return error("報名已截止")
        if ev["event_date"] < today:
            return error("活動已結束，無法報名")

        items = registrations()
        # 防呆：同一個學號對同一場活動只能有一筆有效報名，不能重複報名佔用名額
        dup = next((r for r in items if r["event_id"] == event_id and r["student_id"] == fields["student_id"]
                    and r["status"] != "已取消"), None)
        if dup:
            return error("你已經報名過這個活動了", 409)

        # 名額在這裡 (拿到鎖之後) 重新確認一次，避免多人同時送出造成超額
        confirmed = sum(1 for r in items if r["event_id"] == event_id and r["status"] == "已報名")
        status = "已報名" if confirmed < ev["capacity"] else "候補中"
        item = {
            "id": next_id(items), "event_id": event_id, **fields,
            "status": status, "checkin_code": uuid.uuid4().hex,
            "registered_by_key": user_key(), "registered_by_role": u["role"],
            "created_at": now_str(), "cancelled_at": None,
            "checked_in": False, "checked_in_at": None, "reminded": False,
            "rating": None, "feedback_comment": None, "feedback_at": None,
        }
        items.append(item)
        store.save()

    if status == "已報名":
        send_mail_safely(fields["email"], f"【康寧大學】{ev['title']} 報名成功通知",
                          f"{fields['full_name']} 您好：\n\n您已成功報名「{ev['title']}」。\n"
                          f"活動時間：{ev['event_date']} {ev.get('event_time', '')}\n活動地點：{ev['location']}")
        msg = "報名成功！"
    else:
        send_mail_safely(fields["email"], f"【康寧大學】{ev['title']} 已加入候補名單",
                          f"{fields['full_name']} 您好：\n\n「{ev['title']}」目前名額已滿，已將您加入候補名單，"
                          f"若有人取消會自動為您保留名額並寄信通知。")
        msg = "目前名額已滿，已為您加入候補名單"
    return ok(message=msg, data=item)


@bp.route("/api/campus/events/<int:event_id>/registrations/<int:reg_id>/cancel", methods=["POST"])
@require()
def cancel_registration(event_id, reg_id):
    u = current_user()
    promoted = None
    ev = None
    with store.lock:
        ev = find_event(event_id)
        if not ev:
            return error("找不到該活動", 404)
        items = registrations()
        reg = next((r for r in items if r["id"] == reg_id and r["event_id"] == event_id), None)
        if not reg:
            return error("找不到這筆報名紀錄", 404)
        # 取消只能是本人 (用登入身分比對，不是用學號)，或教職員/管理員代為處理
        if reg["registered_by_key"] != user_key() and u["role"] not in STAFF_ROLES:
            return error("沒有權限取消這筆報名", 403)
        if reg["status"] == "已取消":
            return error("這筆報名已經取消過了")

        was_confirmed = reg["status"] == "已報名"
        reg["status"] = "已取消"
        reg["cancelled_at"] = now_str()

        if was_confirmed:
            waiting = sorted((r for r in items if r["event_id"] == event_id and r["status"] == "候補中"),
                              key=lambda r: r["id"])
            if waiting:
                promoted = waiting[0]
                promoted["status"] = "已報名"
        store.save()
        cancelled_email, cancelled_name = reg["email"], reg["full_name"]

    send_mail_safely(cancelled_email, f"【康寧大學】{ev['title']} 已取消報名",
                      f"{cancelled_name} 您好：\n\n您對「{ev['title']}」的報名已經取消。")
    if promoted:
        send_mail_safely(promoted["email"], f"【康寧大學】{ev['title']} 候補轉為正式報名",
                          f"{promoted['full_name']} 您好：\n\n原本候補中的名額已經轉為正式報名成功，"
                          f"請留意「{ev['title']}」的活動時間與地點。")
    return ok(message="已取消報名" + ("，並已通知候補名單中的下一位" if promoted else ""))


# ---------- 現場簽到 (QR Code 掃描用，前端用 checkin_code 產生 QR Code 即可) ----------

@bp.route("/api/campus/events/<int:event_id>/checkin", methods=["POST"])
@require(*STAFF_ROLES)
def checkin(event_id):
    data = request.get_json(silent=True) or {}
    code = str(data.get("checkin_code") or "").strip()[:64]
    if not code:
        return error("請提供簽到代碼")
    with store.lock:
        items = registrations()
        reg = next((r for r in items if r["event_id"] == event_id and r["checkin_code"] == code), None)
        if not reg:
            return error("找不到對應的報名紀錄，請確認 QR Code 是否正確", 404)
        if reg["status"] != "已報名":
            return error("這筆報名目前不是已確認狀態，無法簽到")
        if reg.get("checked_in"):
            return error(f"{reg['full_name']} 已經簽到過了", 409)
        reg["checked_in"] = True
        reg["checked_in_at"] = now_str()
        store.save()
    return ok(message=f"{reg['full_name']} 簽到成功", data=reg)


@bp.route("/api/campus/events/<int:event_id>/registrations", methods=["GET"])
@require(*STAFF_ROLES)
def list_registrations(event_id):
    ev = find_event(event_id)
    if not ev:
        return error("找不到該活動", 404)
    all_regs = registrations()
    items = sorted((r for r in all_regs if r["event_id"] == event_id), key=lambda r: r["id"])
    return ok(data=items, event=event_view(ev, all_regs))


# ---------- 活動前一天提醒信 (教職員/管理員手動觸發批次寄送) ----------

@bp.route("/api/campus/events/send-reminders", methods=["POST"])
@require(*STAFF_ROLES)
def send_reminders():
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    targets = [e for e in events() if e["event_date"] == tomorrow and not e.get("cancelled")]
    sent, failed = 0, 0
    with store.lock:
        items = registrations()
        for ev in targets:
            for r in items:
                if r["event_id"] == ev["id"] and r["status"] == "已報名" and not r.get("reminded"):
                    try:
                        get_mailer().send(
                            r["email"], f"【康寧大學】提醒：{ev['title']} 明天舉行",
                            f"{r['full_name']} 您好：\n\n提醒您，「{ev['title']}」將於明天 "
                            f"{ev['event_date']} {ev.get('event_time', '')} 在 {ev['location']} 舉行，請準時出席。")
                        r["reminded"] = True
                        sent += 1
                    except Exception:
                        failed += 1
        store.save()
    if sent == 0 and failed == 0:
        return ok(message="目前沒有明天要舉行且尚未提醒的活動", sent=0, failed=0)
    return ok(message=f"已寄出 {sent} 封提醒信" + (f"，{failed} 封失敗" if failed else ""), sent=sent, failed=failed)


# ---------- 活動結束後的滿意度評分 ----------

@bp.route("/api/campus/events/<int:event_id>/feedback", methods=["POST"])
@require()
def submit_feedback(event_id):
    data = request.get_json(silent=True) or {}
    try:
        rating = int(data.get("rating"))
    except (TypeError, ValueError):
        return error("評分須為數字")
    if rating < 1 or rating > 5:
        return error("評分請填 1-5")
    comment = str(data.get("comment") or "").strip()[:500]

    with store.lock:
        ev = find_event(event_id)
        if not ev:
            return error("找不到該活動", 404)
        if ev["event_date"] > date.today().isoformat():
            return error("活動尚未結束，還不能評分")
        items = registrations()
        reg = next((r for r in items if r["event_id"] == event_id and r["registered_by_key"] == user_key()
                    and r["status"] != "已取消"), None)
        if not reg:
            return error("查無你在這個活動的報名紀錄", 403)
        reg["rating"] = rating
        reg["feedback_comment"] = comment
        reg["feedback_at"] = now_str()
        store.save()
    return ok(message="感謝您的回饋！")
