"""報表／文件庫：管理員上傳檔案（公告、表單、活動海報、規章 PDF…），依身分限制誰能下載。

安全與隱私設計重點：
- 下載一律先做伺服器端權限檢查，檔案不會被未授權身分直接存取到。
- 瀏覽紀錄 (report_view_logs) 只記身分別與時間，不存使用者帳號/姓名，避免留下完整個人瀏覽足跡。
- 下載紀錄 (report_download_logs) 需要留存「誰下載了什麼」以供權限稽核與安全追蹤，因此會記帳號、角色；
  不論成功或被拒絕都會記一筆，方便事後稽查異常存取嘗試。
- 使用者曾下載或收藏過的分類，若上傳新的同分類檔案，會自動寄信通知（用學號/帳號比對同分類的歷史紀錄）。

資料存取交給 campus/reports_store.py：有 MySQL 表時走資料庫，連不上或還沒建表則退回 data/campus_store.json。
"""
import os

from flask import Blueprint, request, send_from_directory

from . import reports_store as db
from .common import deps, error, ok, require, store, now_str, current_user, user_key, STAFF_ROLES
from attendance.notify import get_mailer, campus_email

bp = Blueprint("campus_reports", __name__)

VALID_ROLES = ("學生", "家長", "老師", "教職員", "管理員")
MANAGE_ROLES = STAFF_ROLES  # 老師、教職員、管理員皆可上傳管理；下方個別路由視需要再收斂
# save_uploaded_file() 一律存到 <project_root>/static/uploads，URL 固定回傳 /uploads/<檔名>
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "uploads")


def files():
    return db.all_files()


def view_logs():
    return db.all_view_logs()


def download_logs():
    return db.all_download_logs()


def favorites():
    return db.all_favorites()


def _can_access(allowed_roles, user):
    """'all' 對所有人開放（含未登入）；否則需登入且角色在允許清單內"""
    if not allowed_roles or "all" in allowed_roles:
        return True
    return bool(user) and user["role"] in allowed_roles


def _is_favorited(file_id, uk):
    return bool(uk) and any(f["file_id"] == file_id and f["user_key"] == uk for f in favorites())


def _public_file(f, user):
    uk = user_key()
    return {
        "id": f["id"], "title": f["title"], "category": f["category"], "description": f.get("description", ""),
        "file_name": f["file_name"], "file_type": f["file_type"], "allowed_roles": f["allowed_roles"],
        "uploaded_by": f["uploaded_by"], "uploaded_at": f["uploaded_at"],
        "download_count": f.get("download_count", 0),
        "is_favorited": _is_favorited(f["id"], uk),
    }


@bp.route("/api/campus/reports/categories", methods=["GET"])
def list_categories():
    cats = sorted({f["category"] for f in files()})
    return ok(data=cats)


@bp.route("/api/campus/reports", methods=["GET"])
def list_files():
    """只回傳目前身分可存取的檔案；無權限的項目連存在都不顯示，避免暴露目錄結構"""
    u = current_user()
    category = request.args.get("category")
    items = [f for f in files() if _can_access(f["allowed_roles"], u)]
    if category:
        items = [f for f in items if f["category"] == category]
    items.sort(key=lambda x: x["uploaded_at"], reverse=True)
    return ok(data=[_public_file(f, u) for f in items])


@bp.route("/api/campus/reports/my/favorites", methods=["GET"])
@require()
def my_favorites():
    uk = user_key()
    my_ids = {fav["file_id"] for fav in favorites() if fav["user_key"] == uk}
    u = current_user()
    items = [f for f in files() if f["id"] in my_ids and _can_access(f["allowed_roles"], u)]
    items.sort(key=lambda x: x["uploaded_at"], reverse=True)
    return ok(data=[_public_file(f, u) for f in items])


@bp.route("/api/campus/reports/<int:file_id>", methods=["GET"])
def get_file(file_id):
    u = current_user()
    f = next((f for f in files() if f["id"] == file_id), None)
    if not f or not _can_access(f["allowed_roles"], u):
        return error("檔案不存在或您無權查看", 404)
    # 瀏覽紀錄：只記角色與時間，不記帳號/姓名
    db.add_view_log({"file_id": file_id, "role": u["role"] if u else "訪客", "viewed_at": now_str()})
    return ok(data=_public_file(f, u))


@bp.route("/api/campus/reports", methods=["POST"])
@require(*MANAGE_ROLES)
def upload_file():
    u = current_user()
    title = str(request.form.get("title", "")).strip()
    category = str(request.form.get("category", "")).strip()
    description = str(request.form.get("description", "")).strip()
    roles_raw = request.form.get("allowed_roles", "all")
    allowed_roles = ["all"] if roles_raw == "all" else [r for r in roles_raw.split(",") if r.strip() in VALID_ROLES]
    if not allowed_roles:
        allowed_roles = ["all"]
    if not title or not category:
        return error("請填寫標題與分類")

    upload = request.files.get("file")
    if not upload or not upload.filename:
        return error("請選擇要上傳的檔案")
    file_url, original_name, file_type = deps.save_uploaded_file(upload, prefix="report")
    if not file_url:
        return error("檔案格式不支援（僅限 PDF、PNG、JPG、WEBP）")

    item = db.insert_file({
        "title": title, "category": category, "description": description,
        "file_url": file_url, "file_name": original_name, "file_type": file_type,
        "allowed_roles": allowed_roles, "uploaded_by": u["full_name"] or u["username"],
        "uploaded_by_username": u["username"], "uploaded_at": now_str(), "download_count": 0,
    })

    deps.write_audit_log("report_files", item["id"], "新增", before=None, after=item)
    notified = notify_category_watchers(category, item, exclude_username=u["username"])
    return ok(message=f"上傳成功！已通知 {notified} 位曾下載／收藏同分類檔案的使用者", data=_public_file(item, u))


@bp.route("/api/campus/reports/<int:file_id>", methods=["DELETE"])
@require(*MANAGE_ROLES)
def delete_file(file_id):
    f = db.delete_file(file_id)
    if not f:
        return error("檔案不存在", 404)
    deps.write_audit_log("report_files", file_id, "刪除", before=f, after=None)
    return ok(message="已刪除")


@bp.route("/api/campus/reports/<int:file_id>/download", methods=["GET"])
def download_file(file_id):
    u = current_user()
    f = next((f for f in files() if f["id"] == file_id), None)
    if not f:
        return error("檔案不存在", 404)

    allowed = _can_access(f["allowed_roles"], u)
    # 不論成功或被拒絕都留下紀錄，供權限稽核；拒絕時不洩漏檔案是否存在以外的資訊
    db.add_download_log({
        "file_id": file_id, "username": u["username"] if u else None, "student_id": u.get("student_id") if u else None,
        "role": u["role"] if u else "訪客", "result": "success" if allowed else "denied", "downloaded_at": now_str(),
    })
    if allowed:
        db.update_file(file_id, {"download_count": f.get("download_count", 0) + 1})

    if not allowed:
        return error("您的身分無權下載此檔案", 403)

    name = os.path.basename(f["file_url"])
    return send_from_directory(UPLOAD_DIR, name, as_attachment=True, download_name=f["file_name"])


@bp.route("/api/campus/reports/<int:file_id>/favorite", methods=["POST"])
@require()
def add_favorite(file_id):
    u = current_user()
    f = next((f for f in files() if f["id"] == file_id), None)
    if not f or not _can_access(f["allowed_roles"], u):
        return error("檔案不存在或您無權查看", 404)
    uk = user_key()
    with store.lock:
        if not _is_favorited(file_id, uk):
            db.add_favorite({"file_id": file_id, "user_key": uk, "username": u["username"],
                              "student_id": u.get("student_id"), "created_at": now_str()})
    return ok(message="已加入收藏")


@bp.route("/api/campus/reports/<int:file_id>/favorite", methods=["DELETE"])
@require()
def remove_favorite(file_id):
    db.remove_favorite(file_id, user_key())
    return ok(message="已取消收藏")


@bp.route("/api/campus/reports/<int:file_id>/stats", methods=["GET"])
@require(*MANAGE_ROLES)
def file_stats(file_id):
    """下載次數統計分析與完整存取紀錄（含被拒絕的嘗試），僅限管理身分查看"""
    f = next((f for f in files() if f["id"] == file_id), None)
    if not f:
        return error("檔案不存在", 404)
    dl = [d for d in download_logs() if d["file_id"] == file_id]
    vw = [v for v in view_logs() if v["file_id"] == file_id]
    by_role = {}
    for d in dl:
        if d["result"] == "success":
            by_role[d["role"]] = by_role.get(d["role"], 0) + 1
    denied = [d for d in dl if d["result"] == "denied"]
    return ok(data={
        "file": _public_file(f, current_user()),
        "total_downloads": sum(1 for d in dl if d["result"] == "success"),
        "total_views": len(vw),
        "downloads_by_role": by_role,
        "denied_attempts": len(denied),
        "recent_downloads": sorted(dl, key=lambda x: x["downloaded_at"], reverse=True)[:30],
        "favorite_count": sum(1 for fv in favorites() if fv["file_id"] == file_id),
    })


def notify_category_watchers(category, new_file, exclude_username=None):
    """對同分類有下載或收藏紀錄的使用者寄信通知有新檔案上架；寄送失敗略過不中斷，回傳成功通知人數"""
    same_category_ids = {f["id"] for f in files() if f["category"] == category and f["id"] != new_file["id"]}
    if not same_category_ids:
        return 0

    recipients = {}  # username -> student_id (用來組信箱)
    for d in download_logs():
        if d["file_id"] in same_category_ids and d["result"] == "success" and d.get("username"):
            recipients[d["username"]] = d.get("student_id")
    for fav in favorites():
        if fav["file_id"] in same_category_ids and fav.get("username"):
            recipients[fav["username"]] = fav.get("student_id")
    recipients.pop(exclude_username, None)
    if not recipients:
        return 0

    mailer = get_mailer()
    subject = f"【康寧大學】您關注的「{category}」分類有新資料上架"
    body = f"您先前下載或收藏過「{category}」分類的檔案，現在有新資料上架：\n\n{new_file['title']}\n{new_file.get('description', '')}\n\n請登入系統查看與下載。"
    sent = 0
    for username, student_id in recipients.items():
        try:
            mailer.send(campus_email(student_id or username), subject, body)
            sent += 1
        except Exception:
            continue
    return sent
