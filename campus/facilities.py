"""校園空間：教室租借、櫃子租借、校園地圖 (新生找教室)、老師辦公室與目前是否上課、人流分析。

建築物、教室、辦公室與櫃子為示範資料；請依學校實際配置修改 CAMPUS_BUILDINGS / ROOMS / TEACHER_OFFICES。

教室租借與櫃子租借的預約紀錄交給 campus/facilities_store.py：有 MySQL 表時走資料庫，
連不上或還沒建表則退回 data/campus_store.json。
"""
import random
from datetime import datetime, date, timedelta

from flask import Blueprint, request

from . import facilities_store as db
from .common import deps, error, ok, require, store, now_str, current_user, user_key

bp = Blueprint("campus_facilities", __name__)

PERIODS = {1: ("08:10", "09:00"), 2: ("09:10", "10:00"), 3: ("10:10", "11:00"), 4: ("11:10", "12:00"),
           5: ("13:10", "14:00"), 6: ("14:10", "15:00"), 7: ("15:10", "16:00"), 8: ("16:10", "17:00"),
           9: ("17:10", "18:00")}

# 校園地圖 (示意圖座標，畫布 100 x 70)
CAMPUS_BUILDINGS = [
    {"code": "A", "name": "康寧樓", "x": 8, "y": 10, "w": 26, "h": 16, "floors": 5, "desc": "資管科教室、電腦教室、教務處課務組與註冊組 (2F)"},
    {"code": "G", "name": "卓越樓", "x": 40, "y": 8, "w": 22, "h": 14, "floors": 4, "desc": "通識課教室、通識教育中心 (3F)"},
    {"code": "L", "name": "語言大樓", "x": 68, "y": 8, "w": 22, "h": 12, "floors": 3, "desc": "外語教室、語言自學中心"},
    {"code": "N", "name": "護理大樓", "x": 8, "y": 34, "w": 24, "h": 16, "floors": 5, "desc": "護理科教室、技術教室"},
    {"code": "B", "name": "行政大樓", "x": 40, "y": 30, "w": 20, "h": 12, "floors": 3, "desc": "學務處生輔組 (1F)、總務處、宿舍輔導"},
    {"code": "D", "name": "圖資大樓", "x": 66, "y": 28, "w": 24, "h": 16, "floors": 4, "desc": "圖書館、研發處實習就業組 (2F)、資圖討論室"},
    {"code": "C", "name": "學生餐廳", "x": 40, "y": 48, "w": 18, "h": 10, "floors": 1, "desc": "學餐、便利商店、影印中心"},
    {"code": "S", "name": "學生宿舍", "x": 66, "y": 50, "w": 24, "h": 12, "floors": 8, "desc": "男女宿舍、宿舍服務台"},
    {"code": "P", "name": "操場 / 體育館", "x": 8, "y": 54, "w": 26, "h": 12, "floors": 1, "desc": "體育課、社團活動"},
]
GATE = {"name": "校門口 (康寧路三段75巷)", "x": 50, "y": 68}

ROOMS = [
    {"room_id": "A301", "building": "A", "floor": 3, "name": "A301 普通教室", "capacity": 60, "equipment": ["投影機", "麥克風"], "managed_by": "資管科辦公室", "apply_at": "康寧樓 3 樓 A310 科辦", "rentable": True},
    {"room_id": "A302", "building": "A", "floor": 3, "name": "A302 普通教室", "capacity": 50, "equipment": ["投影機"], "managed_by": "資管科辦公室", "apply_at": "康寧樓 3 樓 A310 科辦", "rentable": True},
    {"room_id": "A303", "building": "A", "floor": 3, "name": "A303 普通教室", "capacity": 45, "equipment": ["投影機"], "managed_by": "資管科辦公室", "apply_at": "康寧樓 3 樓 A310 科辦", "rentable": True},
    {"room_id": "A305", "building": "A", "floor": 3, "name": "A305 電腦教室", "capacity": 48, "equipment": ["電腦 48 台", "廣播教學系統"], "managed_by": "資管科辦公室", "apply_at": "康寧樓 3 樓 A310 科辦", "rentable": True},
    {"room_id": "A402", "building": "A", "floor": 4, "name": "A402 階梯教室", "capacity": 120, "equipment": ["投影機", "音響"], "managed_by": "教務處課務組", "apply_at": "康寧樓 2 樓 A201 課務組", "rentable": True},
    {"room_id": "D201", "building": "D", "floor": 2, "name": "資圖 D201 討論室", "capacity": 8, "equipment": ["白板", "大螢幕"], "managed_by": "圖資中心", "apply_at": "圖資大樓 1 樓服務台", "rentable": True},
    {"room_id": "D202", "building": "D", "floor": 2, "name": "資圖 D202 討論室", "capacity": 8, "equipment": ["白板"], "managed_by": "圖資中心", "apply_at": "圖資大樓 1 樓服務台", "rentable": True},
    {"room_id": "D301", "building": "D", "floor": 3, "name": "資圖 D301 多媒體室", "capacity": 30, "equipment": ["投影機", "錄影設備"], "managed_by": "圖資中心", "apply_at": "圖資大樓 1 樓服務台", "rentable": True},
    {"room_id": "G101", "building": "G", "floor": 1, "name": "G101 通識教室", "capacity": 80, "equipment": ["投影機"], "managed_by": "通識教育中心", "apply_at": "卓越樓 3 樓 C305", "rentable": True},
    {"room_id": "G203", "building": "G", "floor": 2, "name": "G203 通識教室", "capacity": 60, "equipment": ["投影機"], "managed_by": "通識教育中心", "apply_at": "卓越樓 3 樓 C305", "rentable": True},
    {"room_id": "L201", "building": "L", "floor": 2, "name": "L201 語言教室", "capacity": 40, "equipment": ["語言教學系統"], "managed_by": "應外科", "apply_at": "語言大樓 1 樓應外科辦", "rentable": False},
    {"room_id": "N201", "building": "N", "floor": 2, "name": "N201 護理教室", "capacity": 60, "equipment": ["投影機"], "managed_by": "護理科", "apply_at": "護理大樓 1 樓護理科辦", "rentable": False},
    {"room_id": "N105", "building": "N", "floor": 1, "name": "N105 技術教室", "capacity": 30, "equipment": ["模擬病床"], "managed_by": "護理科", "apply_at": "護理大樓 1 樓護理科辦", "rentable": False},
]

OFFICES = [
    {"name": "教務處課務組", "building": "A", "location": "康寧樓 2 樓 A201", "phone": "分機 310, 312"},
    {"name": "教務處註冊組", "building": "A", "location": "康寧樓 2 樓 A202", "phone": "分機 321, 322"},
    {"name": "學務處生活輔導組", "building": "B", "location": "行政大樓 1 樓", "phone": "分機 211, 212"},
    {"name": "總務處", "building": "B", "location": "行政大樓 2 樓", "phone": "分機 410"},
    {"name": "通識教育中心", "building": "G", "location": "卓越樓 3 樓 C305", "phone": "分機 520, 521"},
    {"name": "研發處實習就業組", "building": "D", "location": "圖資大樓 2 樓", "phone": "分機 612"},
    {"name": "宿舍服務台", "building": "S", "location": "學生宿舍 1 樓", "phone": "分機 250"},
]

TEACHER_OFFICES = [
    {"name": "彭賓鈺", "title": "副教授 / 資管五忠導師", "dept": "資訊管理科", "office": "A410", "building": "A", "floor": 4, "ext": "分機 361", "email": "", "office_hours": [{"weekday": 2, "start": "13:10", "end": "15:00"}, {"weekday": 4, "start": "10:10", "end": "12:00"}]},
    {"name": "林志明", "title": "助理教授", "dept": "資訊管理科", "office": "A411", "building": "A", "floor": 4, "ext": "分機 362", "email": "", "office_hours": [{"weekday": 3, "start": "13:10", "end": "15:00"}]},
    {"name": "吳建宏", "title": "講師", "dept": "資訊管理科", "office": "A412", "building": "A", "floor": 4, "ext": "分機 363", "email": "", "office_hours": [{"weekday": 1, "start": "13:10", "end": "15:00"}]},
    {"name": "張文華", "title": "講師", "dept": "資訊管理科", "office": "A413", "building": "A", "floor": 4, "ext": "分機 364", "email": "", "office_hours": [{"weekday": 5, "start": "10:10", "end": "12:00"}]},
    {"name": "黃淑芬", "title": "副教授", "dept": "通識教育中心", "office": "G305", "building": "G", "floor": 3, "ext": "分機 522", "email": "", "office_hours": [{"weekday": 2, "start": "10:10", "end": "12:00"}]},
    {"name": "李佩珊", "title": "助理教授", "dept": "通識教育中心", "office": "G306", "building": "G", "floor": 3, "ext": "分機 523", "email": "", "office_hours": [{"weekday": 4, "start": "13:10", "end": "15:00"}]},
    {"name": "Amy Chen", "title": "講師", "dept": "應用外語科", "office": "L105", "building": "L", "floor": 1, "ext": "分機 541", "email": "", "office_hours": [{"weekday": 1, "start": "10:10", "end": "12:00"}]},
    {"name": "許美玲", "title": "副教授", "dept": "護理科", "office": "N310", "building": "N", "floor": 3, "ext": "分機 461", "email": "", "office_hours": [{"weekday": 5, "start": "13:10", "end": "15:00"}]},
    {"name": "蔡宗翰", "title": "助理教授", "dept": "護理科", "office": "N311", "building": "N", "floor": 3, "ext": "分機 462", "email": "", "office_hours": [{"weekday": 3, "start": "10:10", "end": "12:00"}]},
    {"name": "鄭如君", "title": "講師", "dept": "護理科", "office": "N312", "building": "N", "floor": 3, "ext": "分機 463", "email": "", "office_hours": [{"weekday": 2, "start": "15:10", "end": "17:00"}]},
]

LOCKER_AREAS = [
    {"area": "康寧樓 1F 走廊", "building": "A", "rows": 4, "cols": 10, "fee": 300},
    {"area": "圖資大樓 B1", "building": "D", "rows": 3, "cols": 8, "fee": 200},
]
LOCKER_HOLD_DAYS = 3  # 線上保留後需在幾天內到現場繳費


def parse_now():
    try:
        if request.args.get("at"):
            return datetime.strptime(request.args["at"], "%Y-%m-%d %H:%M")
    except ValueError:
        pass
    return datetime.now()


def load_schedule():
    rows = deps.fetch_db_rows("SELECT * FROM class_schedule")
    return rows if rows else deps.class_schedule


def period_at(t):
    hm = t.strftime("%H:%M")
    for p, (s, e) in PERIODS.items():
        if s <= hm <= e:
            return p
    return None


def room_code(classroom):
    return str(classroom).split(" ")[0]


# ---------- 校園地圖 ----------

@bp.route("/api/campus/map", methods=["GET"])
def campus_map():
    return ok(buildings=CAMPUS_BUILDINGS, gate=GATE, rooms=ROOMS, offices=OFFICES,
              teachers=[{k: t[k] for k in ("name", "office", "building", "floor", "dept")} for t in TEACHER_OFFICES])


@bp.route("/api/campus/map/find", methods=["GET"])
def find_place():
    """輸入教室代碼 (A301)、處室或老師名字，回傳在哪棟幾樓"""
    q = request.args.get("q", "").strip().upper()
    if not q:
        return error("請輸入教室、處室或老師")
    b = {x["code"]: x for x in CAMPUS_BUILDINGS}
    results = []
    for r in ROOMS:
        if q in r["room_id"].upper() or q in r["name"].upper():
            results.append({"type": "教室", "name": r["name"], "where": f"{b[r['building']]['name']} {r['floor']} 樓", "building": r["building"]})
    for o in OFFICES:
        if q in o["name"].upper():
            results.append({"type": "處室", "name": o["name"], "where": o["location"], "building": o["building"]})
    for t in TEACHER_OFFICES:
        if q in t["name"].upper():
            results.append({"type": "老師", "name": f"{t['name']} 老師", "where": f"{b[t['building']]['name']} {t['office']}", "building": t["building"]})
    if not results and len(q) >= 2 and q[0] in b and q[1:].isdigit():
        # 沒登錄的教室代碼，以『A402 = A 棟 4 樓』規則推算
        results.append({"type": "教室", "name": q, "where": f"{b[q[0]]['name']} {q[1]} 樓 (依教室代碼推算)", "building": q[0]})
    return ok(data=results)


# ---------- 老師辦公室與目前狀態 ----------

def teacher_status(t, schedule, now):
    wd = now.isoweekday()
    p = period_at(now)
    classes = sorted([s for s in schedule if s["teacher"] == t["name"] and s["weekday"] == wd],
                     key=lambda s: s["period_start"])
    hm = now.strftime("%H:%M")
    if p:
        cur = next((s for s in classes if s["period_start"] <= p <= s["period_end"]), None)
        if cur:
            return {"state": "上課中", "detail": f"{cur['course_name']} @ {cur['classroom']}，{PERIODS[cur['period_end']][1]} 下課"}
    for oh in t["office_hours"]:
        if oh["weekday"] == wd and oh["start"] <= hm <= oh["end"]:
            return {"state": "可以找老師", "detail": f"在 {t['office']} 辦公室，到 {oh['end']}"}
    nxt = next((s for s in classes if PERIODS[s["period_start"]][0] > hm), None)
    if wd > 5 or hm > "18:00" or hm < "08:00":
        return {"state": "非上班時間", "detail": "可以先寄信預約"}
    if nxt:
        return {"state": "沒有課", "detail": f"下一堂 {PERIODS[nxt['period_start']][0]} {nxt['course_name']} @ {nxt['classroom']}"}
    return {"state": "沒有課", "detail": "今天已沒有課，可能在辦公室"}


@bp.route("/api/campus/teachers", methods=["GET"])
def teachers():
    now = parse_now()
    schedule = load_schedule()
    b = {x["code"]: x["name"] for x in CAMPUS_BUILDINGS}
    result = []
    for t in TEACHER_OFFICES:
        timetable = sorted(({"weekday": s["weekday"], "period_start": s["period_start"], "period_end": s["period_end"],
                             "course_name": s["course_name"], "classroom": s["classroom"],
                             "class_name": s.get("class_name") or "重補修"}
                            for s in schedule if s["teacher"] == t["name"]),
                           key=lambda s: (s["weekday"], s["period_start"]))
        result.append({**t, "building_name": b.get(t["building"], ""), "status": teacher_status(t, schedule, now),
                       "timetable": timetable})
    return ok(now=now.strftime("%Y-%m-%d %H:%M"), data=result, periods=PERIODS)


# ---------- 教室租借 ----------

def bookings():
    return db.all_bookings()


@bp.route("/api/campus/rooms", methods=["GET"])
def rooms_availability():
    """某天每間教室每一節的狀態：class (排課) / booked (已借) / pending (審核中) / free"""
    try:
        day = datetime.strptime(request.args.get("date", ""), "%Y-%m-%d").date()
    except ValueError:
        day = date.today()
    schedule = load_schedule()
    wd = day.isoweekday()
    result = []
    for r in ROOMS:
        slots = {}
        for p in PERIODS:
            slots[p] = {"state": "free"}
        for s in schedule:
            if room_code(s["classroom"]) == r["room_id"] and s["weekday"] == wd:
                for p in range(s["period_start"], s["period_end"] + 1):
                    slots[p] = {"state": "class", "label": s["course_name"]}
        for bk in bookings():
            if bk["room_id"] == r["room_id"] and bk["date"] == day.isoformat() and bk["status"] in ("審核中", "已核准"):
                for p in range(bk["period_start"], bk["period_end"] + 1):
                    slots[p] = {"state": "booked" if bk["status"] == "已核准" else "pending", "label": bk["purpose"]}
        if wd > 5:
            slots = {p: {"state": "closed"} for p in PERIODS}
        result.append({**r, "slots": slots})
    return ok(date=day.isoformat(), weekday=wd, periods=PERIODS, data=result)


@bp.route("/api/campus/rooms/book", methods=["POST"])
@require()
def book_room():
    u = current_user()
    data = request.get_json(silent=True) or {}
    room = next((r for r in ROOMS if r["room_id"] == data.get("room_id")), None)
    if not room:
        return error("找不到教室", 404)
    if not room["rentable"]:
        return error(f"這間教室不開放線上借用，請洽 {room['managed_by']}（{room['apply_at']}）")
    try:
        day = datetime.strptime(str(data.get("date", "")), "%Y-%m-%d").date()
        ps, pe = int(data.get("period_start")), int(data.get("period_end", data.get("period_start")))
        people = int(data.get("people") or 1)
    except (TypeError, ValueError):
        return error("請選擇日期與節次，人數請填數字")
    if day < date.today():
        return error("不能借過去的日期")
    if ps not in PERIODS or pe not in PERIODS or pe < ps:
        return error("節次錯誤")
    purpose = str(data.get("purpose", "")).strip()[:80]
    if not purpose:
        return error("請填寫借用用途")
    if people > room["capacity"]:
        return error(f"人數超過教室容量 ({room['capacity']} 人)")
    wd = day.isoweekday()
    if wd > 5:
        return error("週末不開放借用")
    for s in load_schedule():
        if room_code(s["classroom"]) == room["room_id"] and s["weekday"] == wd and s["period_start"] <= pe and ps <= s["period_end"]:
            return error(f"該時段有排課：{s['course_name']}")
    with store.lock:
        items = bookings()
        for bk in items:
            if bk["room_id"] == room["room_id"] and bk["date"] == day.isoformat() and bk["status"] in ("審核中", "已核准") \
                    and bk["period_start"] <= pe and ps <= bk["period_end"]:
                return error("該時段已被借用或正在審核中", 409)
        item = db.insert_booking({
            "room_id": room["room_id"], "room_name": room["name"], "date": day.isoformat(),
            "period_start": ps, "period_end": pe, "purpose": purpose, "people": people,
            "applicant": u["full_name"], "applicant_key": user_key(), "contact": str(data.get("contact", ""))[:60],
            "status": "審核中", "managed_by": room["managed_by"], "review_note": "", "created_at": now_str(),
        })
    return ok(message=f"已送出借用申請，{room['managed_by']}審核後會通知你", data=item)


@bp.route("/api/campus/rooms/bookings", methods=["GET"])
@require()
def my_bookings():
    u = current_user()
    if request.args.get("scope") == "all" and u["role"] in ("管理員", "教職員"):
        items = bookings()
    else:
        items = [b for b in bookings() if b["applicant_key"] == user_key()]
    return ok(data=sorted(items, key=lambda x: (x["date"], x["period_start"]), reverse=True))


@bp.route("/api/campus/rooms/bookings/<int:booking_id>", methods=["POST"])
@require()
def update_booking(booking_id):
    u = current_user()
    action = (request.get_json(silent=True) or {}).get("action")
    with store.lock:
        bk = next((b for b in bookings() if b["id"] == booking_id), None)
        if not bk:
            return error("找不到申請", 404)
        before = {"room_name": bk.get("room_name"), "date": bk.get("date"), "applicant": bk.get("applicant"), "status": bk.get("status")}
        if action == "cancel" and bk["applicant_key"] == user_key():
            patch = {"status": "已取消"}
        elif action in ("approve", "reject") and u["role"] in ("管理員", "教職員"):
            patch = {"status": "已核准" if action == "approve" else "未核准",
                     "review_note": str((request.get_json(silent=True) or {}).get("note", ""))[:100]}
        else:
            return error("沒有權限", 403)
        bk = db.update_booking(booking_id, patch)
    deps.write_audit_log("room_bookings", booking_id, "修改", before=before,
                         after={**before, "status": bk["status"], "review_note": bk.get("review_note", "")})
    return ok(message=f"狀態已更新為「{bk['status']}」", data=bk)


# ---------- 櫃子租借 ----------

def lockers():
    return db.all_lockers(LOCKER_AREAS)


def expire_holds(items):
    """過期的保留中格位釋放；items 是已經抓到的清單，過期的會立刻寫回儲存層並同步更新這份清單"""
    changed = False
    limit = (datetime.now() - timedelta(days=LOCKER_HOLD_DAYS)).strftime("%Y-%m-%d %H:%M:%S")
    for lk in items:
        if lk["status"] == "保留中" and lk["reserved_at"] and lk["reserved_at"] < limit:
            db.update_locker(lk["locker_id"], {"status": "可租借", "holder_key": None, "reserved_at": None})
            lk.update(status="可租借", holder_key=None, reserved_at=None)
            changed = True
    return changed


@bp.route("/api/campus/lockers", methods=["GET"])
def list_lockers():
    key = user_key()
    with store.lock:
        items = lockers()
        expire_holds(items)
    areas = []
    for a in LOCKER_AREAS:
        cells = [{"locker_id": lk["locker_id"], "row": lk["row"], "col": lk["col"],
                  "status": "我的" if key and lk["holder_key"] == key else lk["status"]}
                 for lk in items if lk["area"] == a["area"]]
        areas.append({**a, "cells": cells, "free": sum(1 for c in cells if c["status"] == "可租借")})
    mine = next((lk for lk in items if key and lk["holder_key"] == key), None)
    if mine:
        deadline = (datetime.strptime(mine["reserved_at"], "%Y-%m-%d %H:%M:%S") + timedelta(days=LOCKER_HOLD_DAYS)).strftime("%m/%d %H:%M") if mine["reserved_at"] else ""
        mine = {**mine, "pay_deadline": deadline, "pay_at": "總務處出納組（行政大樓 2 樓）"}
    return ok(areas=areas, mine=mine, hold_days=LOCKER_HOLD_DAYS)


@bp.route("/api/campus/lockers/<locker_id>/reserve", methods=["POST"])
@require("學生")
def reserve_locker(locker_id):
    key = user_key()
    with store.lock:
        items = lockers()
        expire_holds(items)
        if any(lk["holder_key"] == key for lk in items):
            return error("每人限租一格，請先取消原本的格子", 409)
        lk = next((x for x in items if x["locker_id"] == locker_id), None)
        if not lk:
            return error("找不到這一格", 404)
        if lk["status"] != "可租借":
            return error("這一格已經被租走了，請選別格", 409)
        db.update_locker(locker_id, {"status": "保留中", "holder_key": key, "reserved_at": now_str()})
    return ok(message=f"已幫你保留 {locker_id}，請在 {LOCKER_HOLD_DAYS} 天內到總務處出納組繳費 {lk['fee']} 元完成租借")


@bp.route("/api/campus/lockers/<locker_id>/cancel", methods=["POST"])
@require("學生")
def cancel_locker(locker_id):
    key = user_key()
    with store.lock:
        lk = next((x for x in lockers() if x["locker_id"] == locker_id and x["holder_key"] == key), None)
        if not lk:
            return error("找不到你的保留", 404)
        if lk["status"] == "已租用":
            return error("已繳費的櫃子請到總務處辦理退租", 403)
        db.update_locker(locker_id, {"status": "可租借", "holder_key": None, "reserved_at": None})
    return ok(message="已取消保留")


@bp.route("/api/campus/lockers/admin", methods=["GET"])
@require("管理員", "教職員")
def lockers_admin():
    """保留中 (待繳費) 與租用中的櫃子，含保留人學號，供總務處現場收費時確認"""
    with store.lock:
        items = lockers()
        expire_holds(items)
    rows = []
    for lk in items:
        if lk["holder_key"]:
            deadline = ""
            if lk["reserved_at"]:
                deadline = (datetime.strptime(lk["reserved_at"], "%Y-%m-%d %H:%M:%S") + timedelta(days=LOCKER_HOLD_DAYS)).strftime("%Y-%m-%d %H:%M")
            rows.append({"locker_id": lk["locker_id"], "area": lk["area"], "fee": lk["fee"], "status": lk["status"],
                         "holder": lk["holder_key"], "reserved_at": lk["reserved_at"], "pay_deadline": deadline})
    rows.sort(key=lambda r: (r["status"] != "保留中", r["locker_id"]))
    return ok(data=rows, hold_days=LOCKER_HOLD_DAYS)


@bp.route("/api/campus/lockers/<locker_id>/paid", methods=["POST"])
@require("管理員", "教職員")
def locker_paid(locker_id):
    with store.lock:
        lk = next((x for x in lockers() if x["locker_id"] == locker_id), None)
        if not lk or lk["status"] != "保留中":
            return error("這一格不是保留中", 404)
        before = {"locker_id": locker_id, "holder": lk.get("holder_key"), "status": lk["status"]}
        db.update_locker(locker_id, {"status": "已租用", "reserved_at": None})
    deps.write_audit_log("lockers", locker_id, "修改", before=before, after={**before, "status": "已租用"})
    return ok(message=f"{locker_id} 已完成繳費")


# ---------- 人流分析 (模擬) ----------

CROWD_PLACES = [
    {"place": "學生餐廳", "base": [5, 10, 15, 25, 95, 70, 30, 20, 35, 45, 20, 10], "tip": "11:40 前或 12:40 後去比較不用排隊"},
    {"place": "圖書館", "base": [5, 20, 30, 35, 40, 60, 55, 50, 45, 30, 25, 15], "tip": "上午人最少，適合找座位讀書"},
    {"place": "康寧樓電梯", "base": [30, 90, 40, 85, 45, 80, 40, 85, 40, 60, 20, 10], "tip": "整點前 10 分鐘 (下課) 最擠，可以改走樓梯"},
    {"place": "影印中心", "base": [5, 30, 25, 20, 60, 40, 30, 25, 20, 15, 10, 5], "tip": "期中期末前一週會大排長龍，建議提早印"},
]
CROWD_HOURS = list(range(8, 20))


@bp.route("/api/campus/crowd", methods=["GET"])
def crowd():
    """依排課時間推估的人潮指數 (0-100)。示範資料；可改接門禁、Wi-Fi 連線數或學餐刷卡資料。"""
    now = parse_now()
    wd = now.isoweekday()
    schedule = load_schedule()
    class_blocks = sum(1 for s in schedule if s["weekday"] == wd)
    factor = 0.3 if wd > 5 else 0.8 + min(0.4, class_blocks / 40)
    rnd = random.Random(now.strftime("%Y%m%d"))
    result = []
    for p in CROWD_PLACES:
        levels = [max(0, min(100, round(v * factor + rnd.randint(-5, 5)))) for v in p["base"]]
        idx = now.hour - CROWD_HOURS[0]
        current = levels[idx] if 0 <= idx < len(levels) else 0
        future = [(h, l) for h, l in zip(CROWD_HOURS, levels) if h >= now.hour]
        best = min(future, key=lambda x: x[1]) if future else None
        result.append({"place": p["place"], "hours": CROWD_HOURS, "levels": levels, "current": current,
                       "best_hour": best[0] if best else None, "tip": p["tip"]})
    return ok(now=now.strftime("%Y-%m-%d %H:%M"), weekday=wd, data=result, simulated=True)
