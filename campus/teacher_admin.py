"""後台「老師辦公室」：新增 / 修改 / 刪除老師名錄與照片，管理員審核教職員送出的異動。

- 管理員：新增、修改、刪除直接生效，也負責核准 / 退回教職員送出的異動
- 教職員：新增、修改、刪除都先變成「待審核」，核准後才會出現在學生端「老師辦公室與目前狀態」
資料存取見 teachers_store.py。
"""
import os
import re

from flask import Blueprint, request

from . import teachers_store as db
from .common import deps, error, ok, require, current_user, now_str
from .facilities import CAMPUS_BUILDINGS, TEACHER_OFFICES, load_schedule

bp = Blueprint("campus_teacher_admin", __name__)

PHOTO_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
PHOTO_MAX_BYTES = 3 * 1024 * 1024
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _parse(data):
    """檢查表單欄位，回傳 (fields, 錯誤訊息)"""
    text = lambda key, limit: str(data.get(key) or "").strip()[:limit]
    fields = {"name": text("name", 50), "title": text("title", 50), "dept": text("dept", 100), "unit": text("unit", 100),
              "office": text("office", 20).upper(), "building": text("building", 10), "ext": text("ext", 30),
              "email": text("email", 100), "photo_url": text("photo_url", 255)}
    if not fields["name"]:
        return None, "請填寫老師姓名"
    if not fields["dept"] and not fields["unit"]:
        return None, "所屬科系與服務單位至少填一項"
    if fields["email"] and "@" not in fields["email"]:
        return None, "Email 格式不正確"
    if fields["building"] and fields["building"] not in {b["code"] for b in CAMPUS_BUILDINGS}:
        return None, "請從清單選擇辦公室所在大樓"
    if fields["photo_url"] and not re.fullmatch(r"/uploads/teacher_[\w.-]+", fields["photo_url"]):
        return None, "照片請用上傳按鈕上傳"
    try:
        floor = data.get("floor")
        fields["floor"] = int(floor) if floor not in (None, "") else None
    except (TypeError, ValueError):
        return None, "樓層請填數字"
    # 沒填樓層時，用辦公室代碼推算 (A410 → 4 樓)
    if fields["floor"] is None and re.fullmatch(r"[A-Z]\d{3,4}", fields["office"]):
        fields["floor"] = int(fields["office"][1])

    hours = []
    for oh in data.get("office_hours") or []:
        try:
            weekday, start, end = int(oh["weekday"]), str(oh["start"]), str(oh["end"])
        except (KeyError, TypeError, ValueError):
            return None, "可以找老師的時間格式不正確"
        if not 1 <= weekday <= 7 or not TIME_RE.match(start) or not TIME_RE.match(end) or start >= end:
            return None, "可以找老師的時間：請選星期並填寫正確的開始與結束時間"
        hours.append({"weekday": weekday, "start": start, "end": end})
    fields["office_hours"] = sorted(hours, key=lambda o: (o["weekday"], o["start"]))[:10]
    return fields, None


def _find(teacher_id):
    return next((t for t in db.all_teachers(TEACHER_OFFICES) if t["id"] == teacher_id), None)


def _name_taken(name, except_id=None):
    for t in db.all_teachers(TEACHER_OFFICES):
        if t["id"] == except_id:
            continue
        if t["name"] == name or (t.get("pending_data") or {}).get("name") == name:
            return True
    return False


def _reviewer_meta():
    u = current_user()
    return {"reviewed_by": u["full_name"] or u["username"], "reviewed_at": now_str(), "updated_at": now_str()}


@bp.route("/api/admin/teachers", methods=["GET"])
@require("管理員", "教職員")
def list_teachers():
    items = db.all_teachers(TEACHER_OFFICES)
    listed = {t["name"] for t in items}
    unlisted = sorted({s["teacher"] for s in load_schedule() if s.get("teacher") and s["teacher"] not in listed})
    return ok(data=items, my_role=current_user()["role"], unlisted_teachers=unlisted,
              buildings=[{"code": b["code"], "name": b["name"]} for b in CAMPUS_BUILDINGS],
              units=sorted({t["unit"] for t in items if t["unit"]}), depts=sorted({t["dept"] for t in items if t["dept"]}))


@bp.route("/api/admin/teachers", methods=["POST"])
@require("管理員", "教職員")
def create_teacher():
    fields, problem = _parse(request.get_json(silent=True) or {})
    if problem:
        return error(problem)
    if _name_taken(fields["name"]):
        return error("已有同名老師的資料")
    u = current_user()
    now = now_str()
    meta = {"submitted_by": u["full_name"] or u["username"], "created_at": now, "updated_at": now}
    if u["role"] in ("管理員", "系統管理員"):
        meta.update(is_published=1, status="已核准", **_reviewer_meta())
    else:
        meta.update(is_published=0, status="待審核", pending_action="新增")
    saved = db.insert_teacher({**fields, **meta})
    deps.write_audit_log("teacher_directory", saved["id"], "新增", after=fields)
    return ok(message="已新增並上線" if u["role"] in ("管理員", "系統管理員") else "已送出，等管理員審核後才會出現在學生端", id=saved["id"])


# 【功能：老師辦公室審核】教職員修改已上線的資料 → 存進 pending_data 等審核，學生仍看到舊資料
@bp.route("/api/admin/teachers/<int:teacher_id>", methods=["PUT"])
@require("管理員", "系統管理員", "教職員")
def update_teacher(teacher_id):
    before = _find(teacher_id)
    if not before:
        return error("找不到該筆資料", 404)
    fields, problem = _parse(request.get_json(silent=True) or {})
    if problem:
        return error(problem)
    if _name_taken(fields["name"], teacher_id):
        return error("已有同名老師的資料")
    u = current_user()
    if u["role"] in ("管理員", "系統管理員"):
        db.update_teacher(teacher_id, {**fields, "updated_at": now_str()})
        message = "已更新"
    elif not before["is_published"]:
        # 還沒上線的新增申請 (含被退回的)：直接改內容，重新送審
        db.update_teacher(teacher_id, {**fields, "status": "待審核", "pending_action": "新增", "review_note": None,
                                       "submitted_by": u["full_name"] or u["username"], "updated_at": now_str()})
        message = "已更新並重新送審"
    else:
        db.update_teacher(teacher_id, {"pending_action": "修改", "pending_data": fields, "status": "待審核",
                                       "submitted_by": u["full_name"] or u["username"], "review_note": None,
                                       "updated_at": now_str()})
        message = "已送出修改，管理員核准前學生仍看到原本的資料"
    deps.write_audit_log("teacher_directory", teacher_id, "修改",
                         before={k: before.get(k) for k in fields}, after=fields)
    return ok(message=message)


@bp.route("/api/admin/teachers/<int:teacher_id>", methods=["DELETE"])
@require("管理員", "系統管理員", "教職員")
def delete_teacher(teacher_id):
    before = _find(teacher_id)
    if not before:
        return error("找不到該筆資料", 404)
    u = current_user()
    if u["role"] in ("管理員", "系統管理員") or not before["is_published"]:
        db.delete_teacher(teacher_id)
        deps.write_audit_log("teacher_directory", teacher_id, "刪除", before={k: before.get(k) for k in db.PROFILE_FIELDS})
        return ok(message="已刪除")
    db.update_teacher(teacher_id, {"pending_action": "刪除", "pending_data": None, "status": "待審核",
                                   "submitted_by": u["full_name"] or u["username"], "review_note": None,
                                   "updated_at": now_str()})
    deps.write_audit_log("teacher_directory", teacher_id, "申請刪除", before={"name": before["name"]})
    return ok(message="已送出刪除申請，等管理員審核")


# 【功能：老師辦公室審核】管理員核准：新增上線 / 套用修改 / 刪除；退回要寫原因
@bp.route("/api/admin/teachers/<int:teacher_id>/review", methods=["POST"])
@require("管理員", "系統管理員")
def review_teacher(teacher_id):
    item = _find(teacher_id)
    if not item:
        return error("找不到該筆資料", 404)
    if item["status"] != "待審核" or not item.get("pending_action"):
        return error("這筆資料沒有待審核的異動")
    data = request.get_json(silent=True) or {}
    decision = data.get("decision")
    note = str(data.get("note") or "").strip()[:200]
    action = item["pending_action"]
    if decision == "退回":
        if not note:
            return error("退回請填寫原因，讓送出的人知道要改什麼")
        db.update_teacher(teacher_id, {"status": "退回", "pending_action": None, "pending_data": None,
                                       "review_note": f"{action}申請退回：{note}", **_reviewer_meta()})
        deps.write_audit_log("teacher_directory", teacher_id, "審核退回", after={"action": action, "note": note})
        return ok(message="已退回")
    if decision != "核准":
        return error("請選擇核准或退回")

    if action == "刪除":
        db.delete_teacher(teacher_id)
        deps.write_audit_log("teacher_directory", teacher_id, "審核核准", before={"name": item["name"]}, after={"action": "刪除"})
        return ok(message="已核准刪除")
    patch = {"status": "已核准", "is_published": 1, "pending_action": None, "pending_data": None,
             "review_note": note or None, **_reviewer_meta()}
    if action == "修改":
        patch.update(item.get("pending_data") or {})
    db.update_teacher(teacher_id, patch)
    deps.write_audit_log("teacher_directory", teacher_id, "審核核准", after={"action": action})
    return ok(message="已核准，學生端已更新")


@bp.route("/api/admin/teachers/photo", methods=["POST"])
@require("管理員", "教職員")
def upload_photo():
    file_obj = request.files.get("photo")
    if not file_obj or not file_obj.filename:
        return error("請選擇照片")
    ext = file_obj.filename.rsplit(".", 1)[-1].lower() if "." in file_obj.filename else ""
    if ext not in PHOTO_EXTENSIONS:
        return error("照片請用 JPG、PNG 或 WebP 格式")
    file_obj.stream.seek(0, os.SEEK_END)
    size = file_obj.stream.tell()
    file_obj.stream.seek(0)
    if size > PHOTO_MAX_BYTES:
        return error("照片請小於 3 MB")
    head = file_obj.stream.read(12)
    file_obj.stream.seek(0)
    is_image = head.startswith(b"\xff\xd8\xff") or head.startswith(b"\x89PNG") or (head[:4] == b"RIFF" and head[8:12] == b"WEBP")
    if not is_image:
        return error("檔案內容不是圖片")
    url, _, _ = deps.save_uploaded_file(file_obj, prefix="teacher")
    if not url:
        return error("照片上傳失敗")
    return ok(url=url)
