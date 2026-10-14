"""導生關懷紀錄 (T14)：班導記錄和學生晤談的內容與後續追蹤，期末可匯出成導師輔導紀錄。

誰可以用：
- 班導 (老師)：只能看、記自己導師班 (users.advised_class) 的學生
- 教職員 (行政人員)、管理員：全校，可依班級切換
- 學生、家長：不能看 (內容屬個人隱私)
修改 / 刪除：只有寫這筆紀錄的人；管理員可以改任何一筆

資料存放：
- MySQL 已建立 counseling_records (執行 init_db.py) → 存在 MySQL
- 還沒建表或連不上 → 退回 data/campus_store.json (示範模式)
修改紀錄 (audit_logs) 只記誰、哪位學生、主題，不記晤談內容
"""
import csv
import io
from datetime import date
from urllib.parse import quote

from flask import Blueprint, make_response, request

from .common import all_students, current_user, deps, error, next_id, now_str, ok, require, store

bp = Blueprint("campus_counseling", __name__)

COUNSEL_ROLES = ("老師", "教職員", "管理員")
SCHOOL_WIDE_ROLES = ("教職員", "管理員")
METHODS = ("面談", "電話", "線上", "家長聯繫")
TOPICS = ("學業", "出缺勤", "生活", "生涯", "家庭", "身心", "其他")
FIELDS = ("student_id", "talk_date", "method", "topic", "content", "follow_up", "follow_up_note", "follow_up_done")


# =====================================================================
# 資料存取：MySQL 有表就用 MySQL，否則用 campus_store.json
# =====================================================================

def use_db():
    return deps.fetch_db_rows("SELECT COUNT(*) AS n FROM counseling_records") is not None


def _row(r):
    return {**r, "talk_date": str(r.get("talk_date") or "")[:10],
            "follow_up": bool(r.get("follow_up")), "follow_up_done": bool(r.get("follow_up_done")),
            "created_at": str(r.get("created_at") or "")[:19], "updated_at": str(r.get("updated_at") or "")[:19]}


def load_records(student_ids=None):
    if use_db():
        if student_ids is not None and not student_ids:
            return []
        sql = "SELECT * FROM counseling_records"
        params = ()
        if student_ids is not None:
            sql += " WHERE student_id IN (%s)" % ",".join(["%s"] * len(student_ids))
            params = tuple(student_ids)
        rows = deps.fetch_db_rows(sql + " ORDER BY talk_date DESC, id DESC", params) or []
        return [_row(r) for r in rows]
    items = store.section("counseling", list)
    items = [i for i in items if student_ids is None or i["student_id"] in student_ids]
    return [_row(i) for i in sorted(items, key=lambda i: (i["talk_date"], i["id"]), reverse=True)]


def find_record(record_id):
    if use_db():
        rows = deps.fetch_db_rows("SELECT * FROM counseling_records WHERE id = %s", (record_id,))
        return _row(rows[0]) if rows else None
    return next((_row(i) for i in store.section("counseling", list) if i["id"] == record_id), None)


def insert_record(item):
    if use_db():
        res = deps.db_execute(
            "INSERT INTO counseling_records (student_id, class_name, talk_date, method, topic, content, follow_up, "
            "follow_up_note, follow_up_done, counselor_username, counselor_name) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (item["student_id"], item["class_name"], item["talk_date"], item["method"], item["topic"], item["content"],
             int(item["follow_up"]), item["follow_up_note"], int(item["follow_up_done"]),
             item["counselor_username"], item["counselor_name"]))
        return find_record(res["lastrowid"])
    with store.lock:
        items = store.section("counseling", list)
        full = {"id": next_id(items), **item, "created_at": now_str(), "updated_at": now_str()}
        items.append(full)
        store.save()
    return _row(full)


def update_record(record_id, changes):
    if use_db():
        sets = ", ".join(f"{k} = %s" for k in changes)
        values = [int(v) if isinstance(v, bool) else v for v in changes.values()]
        deps.db_execute(f"UPDATE counseling_records SET {sets} WHERE id = %s", (*values, record_id))
        return find_record(record_id)
    with store.lock:
        target = next(i for i in store.section("counseling", list) if i["id"] == record_id)
        target.update(changes, updated_at=now_str())
        store.save()
        return _row(target)


def delete_record(record_id):
    if use_db():
        deps.db_execute("DELETE FROM counseling_records WHERE id = %s", (record_id,))
        return
    with store.lock:
        items = store.section("counseling", list)
        items[:] = [i for i in items if i["id"] != record_id]
        store.save()


# =====================================================================
# 權限：班導只看導師班；教職員、管理員全校
# =====================================================================

def class_names():
    return sorted({s["class_name"] for s in all_students() if s.get("class_name")})


def scope_class(u, requested):
    """回傳 (班級, 可選班級清單)；班導指定別班回傳 (None, ...)"""
    if u["role"] == "老師":
        mine = u.get("advised_class")
        if requested and requested != mine:
            return None, [mine] if mine else []
        return mine, [mine] if mine else []
    classes = class_names()
    return (requested or (classes[0] if classes else None)), classes


def student_in_scope(u, student_id):
    """這位學生是不是使用者可以記錄的對象；是的話回傳學生資料"""
    student = next((s for s in all_students() if s["student_id"] == student_id), None)
    if not student:
        return None
    if u["role"] in SCHOOL_WIDE_ROLES:
        return student
    if u["role"] == "老師" and student.get("class_name") and student["class_name"] == u.get("advised_class"):
        return student
    return None


def can_edit(u, record):
    return u["role"] == "管理員" or record["counselor_username"] == u["username"]


def clean(data, partial=False):
    """檢查表單；回傳 (欄位, 錯誤訊息)"""
    out = {}
    if not partial or "talk_date" in data:
        talk_date = str(data.get("talk_date") or "").strip()[:10] or date.today().isoformat()
        try:
            date.fromisoformat(talk_date)
        except ValueError:
            return None, "日期格式須為 YYYY-MM-DD"
        out["talk_date"] = talk_date
    if not partial or "method" in data:
        out["method"] = data.get("method") if data.get("method") in METHODS else "面談"
    if not partial or "topic" in data:
        out["topic"] = data.get("topic") if data.get("topic") in TOPICS else "其他"
    if not partial or "content" in data:
        content = str(data.get("content") or "").strip()[:2000]
        if not content:
            return None, "請輸入關懷內容"
        out["content"] = content
    if not partial or "follow_up" in data:
        out["follow_up"] = bool(data.get("follow_up"))
    if not partial or "follow_up_note" in data:
        out["follow_up_note"] = str(data.get("follow_up_note") or "").strip()[:200]
    if not partial or "follow_up_done" in data:
        out["follow_up_done"] = bool(data.get("follow_up_done"))
    return out, None


def audit_summary(record):
    """修改紀錄只留誰、哪位學生、主題，不留晤談內容"""
    return {k: record[k] for k in ("student_id", "talk_date", "method", "topic", "follow_up", "follow_up_done")}


# =====================================================================
# API
# =====================================================================

@bp.route("/api/campus/counseling", methods=["GET"])
@require(*COUNSEL_ROLES)
def list_counseling():
    """某班的學生名單 (每人晤談次數、最近一次、待追蹤) 與紀錄；?student_id= 只看一位"""
    u = current_user()
    class_name, classes = scope_class(u, request.args.get("class_name"))
    if class_name is None:
        if classes:
            return error("老師僅能查看自己的導師班", 403)
        return error("您目前沒有導師班", 404)
    students = [s for s in all_students() if s.get("class_name") == class_name]
    ids = [s["student_id"] for s in students]
    records = load_records(ids)
    roster = []
    for s in students:
        mine = [r for r in records if r["student_id"] == s["student_id"]]
        roster.append({"student_id": s["student_id"], "full_name": s["full_name"], "count": len(mine),
                       "last_date": mine[0]["talk_date"] if mine else "",
                       "pending": sum(1 for r in mine if r["follow_up"] and not r["follow_up_done"])})
    only = request.args.get("student_id")
    shown = [r for r in records if not only or r["student_id"] == only]
    names = {s["student_id"]: s["full_name"] for s in students}
    return ok(class_name=class_name, classes=classes, methods=list(METHODS), topics=list(TOPICS),
              summary={"student_count": len(students), "record_count": len(records),
                       "cared": sum(1 for x in roster if x["count"]),
                       "pending": sum(x["pending"] for x in roster)},
              students=roster,
              data=[{**r, "full_name": names.get(r["student_id"], r["student_id"]), "can_edit": can_edit(u, r)} for r in shown])


@bp.route("/api/campus/counseling", methods=["POST"])
@require(*COUNSEL_ROLES)
def create_counseling():
    u = current_user()
    data = request.get_json(silent=True) or {}
    student_id = str(data.get("student_id") or "").strip()
    if not student_id:
        return error("請選擇學生")
    if not any(s["student_id"] == student_id for s in all_students()):
        return error("查無此學號", 404)
    student = student_in_scope(u, student_id)
    if not student:
        return error("只能記錄自己導師班的學生", 403)
    fields, msg = clean(data)
    if msg:
        return error(msg)
    record = insert_record({**fields, "student_id": student["student_id"], "class_name": student.get("class_name") or "",
                            "counselor_username": u["username"], "counselor_name": u["full_name"]})
    deps.write_audit_log("counseling_records", record["id"], "新增", after=audit_summary(record))
    return ok(message=f"已記錄與 {student['full_name']} 的關懷紀錄", data=record)


@bp.route("/api/campus/counseling/<int:record_id>", methods=["PUT", "DELETE"])
@require(*COUNSEL_ROLES)
def edit_counseling(record_id):
    u = current_user()
    record = find_record(record_id)
    if not record or not student_in_scope(u, record["student_id"]):
        return error("找不到這筆紀錄", 404)
    if not can_edit(u, record):
        return error("只能修改自己寫的紀錄", 403)
    if request.method == "DELETE":
        delete_record(record_id)
        deps.write_audit_log("counseling_records", record_id, "刪除", before=audit_summary(record))
        return ok(message="已刪除")
    fields, msg = clean(request.get_json(silent=True) or {}, partial=True)
    if msg:
        return error(msg)
    if not fields:
        return error("沒有要修改的內容")
    updated = update_record(record_id, fields)
    deps.write_audit_log("counseling_records", record_id, "修改", before=audit_summary(record), after=audit_summary(updated))
    return ok(message="已更新", data=updated)


@bp.route("/api/campus/counseling/export.csv", methods=["GET"])
@require(*COUNSEL_ROLES)
def export_counseling():
    """匯出全班晤談紀錄 (UTF-8 BOM，Excel 可直接開啟)，期末交導師輔導紀錄用"""
    u = current_user()
    class_name, _ = scope_class(u, request.args.get("class_name"))
    if not class_name:
        return error("老師僅能匯出自己的導師班", 403)
    students = {s["student_id"]: s["full_name"] for s in all_students() if s.get("class_name") == class_name}
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["日期", "學號", "姓名", "方式", "主題", "關懷內容", "需要追蹤", "追蹤事項", "已追蹤完成", "記錄人"])
    for r in sorted(load_records(list(students)), key=lambda r: (r["talk_date"], r["id"])):
        writer.writerow([r["talk_date"], r["student_id"], students.get(r["student_id"], ""), r["method"], r["topic"],
                         r["content"], "是" if r["follow_up"] else "", r["follow_up_note"],
                         "是" if r["follow_up_done"] else "", r["counselor_name"]])
    deps.write_audit_log("counseling_records", class_name, "匯出", after={"class_name": class_name})
    response = make_response(buf.getvalue().encode("utf-8-sig"))
    response.headers["Content-Type"] = "text/csv; charset=utf-8"
    filename = f"導生關懷紀錄_{class_name}.csv"
    response.headers["Content-Disposition"] = f"attachment; filename=\"counseling.csv\"; filename*=UTF-8''{quote(filename)}"
    return response
