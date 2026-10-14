"""學生表現紀錄 (T18)：獎懲 (嘉獎、小功、大功、申誡、小過、大過) 與幹部 (班長、小老師…)。

誰可以看：
- 學生、家長：只看自己 (家長看綁定的子女)
- 班導：在「學生個人總覽」看自己導師班的學生；教職員、管理員可看全校
- 班導：可以設定自己導師班這學期的幹部與課程小老師 (教職員、管理員可設定任何班級)
獎懲目前只提供查詢；資料由學務處或 seed_classes.py 寫入。

資料存放：
- MySQL 已建立 student_records (執行 init_db.py) → 讀 MySQL
- 還沒建表或連不上 → data/campus_store.json (示範模式，第一次使用時放入下方 DEMO_RECORDS)
"""
from datetime import date

from flask import Blueprint, request

from .common import all_students, current_user, deps, error, next_id, ok, require, store
from .counseling import scope_class, student_in_scope

bp = Blueprint("campus_records", __name__)

KINDS = ("獎懲", "幹部")
REWARDS = ("嘉獎", "小功", "大功")
PUNISHMENTS = ("申誡", "小過", "大過")
CLASS_POSITIONS = ("班長", "副班長", "學藝股長", "總務股長", "風紀股長", "衛生股長", "康樂股長", "資訊股長")
TUTOR = "課程小老師"
POSITIONS = CLASS_POSITIONS + (TUTOR,)
CADRE_ROLES = ("老師", "教職員", "管理員")


def current_semester(today=None):
    """學期代碼：8 月～隔年 1 月為上學期 (-1)，2～7 月為下學期 (-2)，例如 2026-10 → 115-1"""
    d = today or date.today()
    if d.month >= 8:
        return f"{d.year - 1911}-1"
    if d.month == 1:
        return f"{d.year - 1912}-1"
    return f"{d.year - 1912}-2"

# 示範模式資料 (對應 app.py 的 DEMO_STUDENTS)；全部是虛構的
DEMO_RECORDS = [
    {"id": 1, "student_id": "S112001", "kind": "幹部", "item": "班長", "count": 1, "reason": "", "semester": "115-1", "record_date": "2026-09-14"},
    {"id": 2, "student_id": "S112001", "kind": "獎懲", "item": "嘉獎", "count": 2, "reason": "擔任班長認真負責", "semester": "114-2", "record_date": "2026-06-20"},
    {"id": 3, "student_id": "S112001", "kind": "獎懲", "item": "申誡", "count": 1, "reason": "上課使用手機經勸導未改善", "semester": "115-1", "record_date": "2026-10-02"},
    {"id": 4, "student_id": "S112002", "kind": "幹部", "item": "課程小老師", "count": 1, "reason": "程式設計(一)", "semester": "115-1", "record_date": "2026-09-14"},
    {"id": 5, "student_id": "S112002", "kind": "獎懲", "item": "小功", "count": 1, "reason": "參加全國技藝競賽獲獎，為校爭光", "semester": "114-2", "record_date": "2026-05-28"},
    {"id": 6, "student_id": "S112005", "kind": "幹部", "item": "學藝股長", "count": 1, "reason": "", "semester": "115-1", "record_date": "2026-09-14"},
    {"id": 7, "student_id": "S112005", "kind": "獎懲", "item": "嘉獎", "count": 1, "reason": "協助新生訓練", "semester": "115-1", "record_date": "2026-09-05"},
    {"id": 8, "student_id": "S112004", "kind": "獎懲", "item": "小過", "count": 1, "reason": "無故曠課累計達規定節數", "semester": "114-2", "record_date": "2026-06-10"},
]


def use_db():
    return deps.fetch_db_rows("SELECT COUNT(*) AS n FROM student_records") is not None


def _json_items():
    return store.section("student_records", lambda: [dict(r) for r in DEMO_RECORDS])


def load_records(student_ids):
    """學生的表現紀錄 (新到舊)；student_ids 可以是一個學號或學號清單"""
    ids = [student_ids] if isinstance(student_ids, str) else list(student_ids)
    if not ids:
        return []
    if use_db():
        marks = ",".join(["%s"] * len(ids))
        rows = deps.fetch_db_rows(
            "SELECT record_id AS id, student_id, kind, item, `count`, reason, semester, record_date "
            f"FROM student_records WHERE student_id IN ({marks}) ORDER BY record_date DESC, record_id DESC", tuple(ids)) or []
        return [{**r, "record_date": str(r.get("record_date") or "")[:10], "reason": r.get("reason") or ""} for r in rows]
    items = [dict(r) for r in _json_items() if r["student_id"] in ids]
    items.sort(key=lambda r: (r["record_date"], r["id"]), reverse=True)
    return items


def add_cadre(student_id, item, reason, semester):
    record = {"student_id": student_id, "kind": "幹部", "item": item, "count": 1, "reason": reason or "",
              "semester": semester, "record_date": date.today().isoformat()}
    if use_db():
        res = deps.db_execute(
            "INSERT INTO student_records (student_id, kind, item, `count`, reason, semester, record_date) VALUES (%s, '幹部', %s, 1, %s, %s, %s)",
            (student_id, item, reason or None, semester, record["record_date"]))
        return {"id": res["lastrowid"], **record}
    with store.lock:
        items = _json_items()
        full = {"id": next_id(items), **record}
        items.append(full)
        store.save()
    return full


def find_record(record_id):
    if use_db():
        rows = deps.fetch_db_rows("SELECT record_id AS id, student_id, kind, item, reason, semester FROM student_records WHERE record_id = %s", (record_id,))
        return rows[0] if rows else None
    return next((dict(r) for r in _json_items() if r["id"] == record_id), None)


def delete_record(record_id):
    if use_db():
        deps.db_execute("DELETE FROM student_records WHERE record_id = %s", (record_id,))
        return
    with store.lock:
        items = _json_items()
        items[:] = [r for r in items if r["id"] != record_id]
        store.save()


def summarize(items):
    """獎懲各幾次、現任幹部"""
    totals = {name: 0 for name in REWARDS + PUNISHMENTS}
    for r in items:
        if r["kind"] == "獎懲" and r["item"] in totals:
            totals[r["item"]] += int(r.get("count") or 1)
    latest = max((r["semester"] for r in items if r["kind"] == "幹部"), default="")
    return {
        "totals": totals,
        "rewards": sum(totals[n] for n in REWARDS),
        "punishments": sum(totals[n] for n in PUNISHMENTS),
        "positions": [r["item"] + (f"（{r['reason']}）" if r["reason"] else "") for r in items
                      if r["kind"] == "幹部" and r["semester"] == latest],
    }


def profile(student_id):
    items = load_records(student_id)
    return {**summarize(items), "data": items}


def _audit(action, record):
    try:
        deps.write_audit_log("student_records", record["id"], action,
                             **({"after": record} if action == "新增" else {"before": record}))
    except Exception:
        pass


@bp.route("/api/campus/records/cadres", methods=["GET"])
@require(*CADRE_ROLES)
def class_cadres():
    """某班這學期的幹部與小老師；班導只能看自己的導師班"""
    u = current_user()
    class_name, classes = scope_class(u, request.args.get("class_name"))
    if class_name is None:
        return error("老師僅能設定自己的導師班", 403) if classes else error("您目前沒有導師班", 404)
    semester = current_semester()
    students = [{"student_id": s["student_id"], "full_name": s["full_name"]}
                for s in all_students() if s.get("class_name") == class_name]
    names = {s["student_id"]: s["full_name"] for s in students}
    cadres = [{**r, "full_name": names.get(r["student_id"], r["student_id"])}
              for r in load_records(list(names)) if r["kind"] == "幹部" and r["semester"] == semester]
    return ok(class_name=class_name, classes=classes, semester=semester, positions=list(CLASS_POSITIONS),
              students=students, cadres=sorted(cadres, key=lambda r: (POSITIONS.index(r["item"]) if r["item"] in POSITIONS else 99, r["reason"])))


@bp.route("/api/campus/records/cadres", methods=["POST"])
@require(*CADRE_ROLES)
def set_cadre():
    """指定幹部：{student_id, item, reason}。班級幹部每個職位只有一人，換人時自動取代；小老師要填科目，同一科只有一位"""
    u = current_user()
    data = request.get_json(silent=True) or {}
    student_id = str(data.get("student_id", "")).strip()
    item = str(data.get("item", "")).strip()
    reason = str(data.get("reason", "")).strip()[:50]
    if item not in POSITIONS:
        return error(f"職位只能是：{'、'.join(POSITIONS)}")
    if item == TUTOR and not reason:
        return error("小老師請填寫負責的科目")
    if not student_id:
        return error("請選擇學生")
    student = student_in_scope(u, student_id)
    if not student:
        exists = any(s["student_id"] == student_id for s in all_students())
        return error("只能設定自己導師班的學生", 403) if exists else error("查無此學生", 404)
    semester = current_semester()
    classmates = [s["student_id"] for s in all_students() if s.get("class_name") == student.get("class_name")]
    replaced = [r for r in load_records(classmates) if r["kind"] == "幹部" and r["semester"] == semester and r["item"] == item
                and (item != TUTOR or r["reason"] == reason)]
    for r in replaced:
        delete_record(r["id"])
        _audit("刪除", r)
    record = add_cadre(student_id, item, reason if item == TUTOR else "", semester)
    _audit("新增", record)
    title = f"{reason}小老師" if item == TUTOR else item
    return ok(message=f"已設定 {student['full_name']} 為{title}", data=record)


@bp.route("/api/campus/records/<int:record_id>", methods=["DELETE"])
@require(*CADRE_ROLES)
def remove_cadre(record_id):
    """取消幹部；獎懲由學務處管理，不能從這裡刪"""
    u = current_user()
    record = find_record(record_id)
    if not record or record["kind"] != "幹部" or not student_in_scope(u, record["student_id"]):
        return error("找不到這筆幹部紀錄，或不是你導師班的學生", 404)
    delete_record(record_id)
    _audit("刪除", record)
    return ok(message="已取消")


@bp.route("/api/campus/records/mine", methods=["GET"])
@require("學生", "家長")
def my_records():
    """學生看自己的獎懲與幹部；家長看綁定的子女"""
    return ok(**profile(current_user()["student_id"]))
