"""匿名論壇 (表白牆)：需登入才能發文 (防洗版)，但文章與留言都不存帳號。

每篇文章只存一個『作者驗證碼』= HMAC(伺服器金鑰, 文章隨機鹽 + 帳號)，
用來讓作者本人刪文；不同文章的驗證碼互相無法關聯，API 與後台都不會回傳作者身分。
"""
import hashlib
import hmac
import os
import secrets

from flask import Blueprint, request, current_app

from .common import error, ok, require, store, next_id, now_str, current_user

bp = Blueprint("campus_forum", __name__)

BOARDS = ("表白", "心情", "問問題", "失物招領", "校園建議")
HIDE_AFTER_REPORTS = 3
BLOCKED_WORDS = ("幹你", "去死", "白癡", "智障")  # 可再擴充


def posts():
    return store.section("forum_posts", list)


def _token(salt, username):
    key = (os.getenv("FORUM_SECRET") or current_app.secret_key or "forum").encode()
    return hmac.new(key, f"{salt}:{username}".encode(), hashlib.sha256).hexdigest()


def _is_author(item):
    u = current_user()
    return bool(u) and hmac.compare_digest(item["author_token"], _token(item["salt"], u["username"]))


def _clean(text, limit):
    text = str(text or "").strip()[:limit]
    for w in BLOCKED_WORDS:
        text = text.replace(w, "＊" * len(w))
    return text


def _alias(salt):
    """每篇文章給一個隨機暱稱，同一篇裡的作者回覆會顯示『原 PO』"""
    return f"匿名康寧人 #{salt[:4].upper()}"


def public_post(p, with_comments=False):
    u = current_user()
    data = {
        "id": p["id"], "board": p["board"], "content": p["content"], "alias": _alias(p["salt"]),
        "created_at": p["created_at"], "like_count": len(p["likes"]),
        "liked": bool(u) and _token(p["salt"], u["username"]) in p["likes"],
        "comment_count": len([c for c in p["comments"] if not c.get("hidden")]),
        "is_mine": _is_author(p),
    }
    if with_comments:
        data["comments"] = [{"id": c["id"], "content": c["content"], "created_at": c["created_at"],
                             "is_op": hmac.compare_digest(c["author_token"], p["author_token"]),
                             "is_mine": bool(u) and hmac.compare_digest(c["author_token"], _token(p["salt"], u["username"]))}
                            for c in p["comments"] if not c.get("hidden")]
    return data


@bp.route("/api/campus/forum/posts", methods=["GET"])
def list_posts():
    board = request.args.get("board")
    items = [p for p in posts() if not p.get("hidden") and (not board or p["board"] == board)]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ok(boards=BOARDS, data=[public_post(p) for p in items[:100]])


@bp.route("/api/campus/forum/posts/<int:post_id>", methods=["GET"])
def get_post(post_id):
    p = next((p for p in posts() if p["id"] == post_id and not p.get("hidden")), None)
    if not p:
        return error("文章不存在或已被隱藏", 404)
    return ok(data=public_post(p, with_comments=True))


@bp.route("/api/campus/forum/posts", methods=["POST"])
@require()
def create_post():
    data = request.get_json(silent=True) or {}
    board = data.get("board") if data.get("board") in BOARDS else "心情"
    content = _clean(data.get("content"), 1000)
    if len(content) < 2:
        return error("內容至少 2 個字")
    salt = secrets.token_hex(8)
    with store.lock:
        items = posts()
        item = {"id": next_id(items), "board": board, "content": content, "salt": salt,
                "author_token": _token(salt, current_user()["username"]), "likes": [], "reports": [],
                "comments": [], "hidden": False, "created_at": now_str()}
        items.append(item)
        store.save()
    return ok(message="已匿名發佈", data=public_post(item))


@bp.route("/api/campus/forum/posts/<int:post_id>", methods=["DELETE"])
@require()
def delete_post(post_id):
    with store.lock:
        p = next((p for p in posts() if p["id"] == post_id), None)
        if not p:
            return error("文章不存在", 404)
        if not _is_author(p) and current_user()["role"] != "管理員":
            return error("只能刪除自己的文章", 403)
        posts().remove(p)
        store.save()
    return ok(message="已刪除")


@bp.route("/api/campus/forum/posts/<int:post_id>/like", methods=["POST"])
@require()
def toggle_like(post_id):
    with store.lock:
        p = next((p for p in posts() if p["id"] == post_id and not p.get("hidden")), None)
        if not p:
            return error("文章不存在", 404)
        t = _token(p["salt"], current_user()["username"])
        if t in p["likes"]:
            p["likes"].remove(t)
        else:
            p["likes"].append(t)
        store.save()
    return ok(like_count=len(p["likes"]), liked=t in p["likes"])


@bp.route("/api/campus/forum/posts/<int:post_id>/comments", methods=["POST"])
@require()
def add_comment(post_id):
    content = _clean((request.get_json(silent=True) or {}).get("content"), 300)
    if not content:
        return error("請輸入留言")
    with store.lock:
        p = next((p for p in posts() if p["id"] == post_id and not p.get("hidden")), None)
        if not p:
            return error("文章不存在", 404)
        p["comments"].append({"id": next_id(p["comments"]), "content": content,
                              "author_token": _token(p["salt"], current_user()["username"]),
                              "reports": [], "created_at": now_str()})
        store.save()
    return ok(data=public_post(p, with_comments=True))


@bp.route("/api/campus/forum/posts/<int:post_id>/report", methods=["POST"])
@require()
def report_post(post_id):
    with store.lock:
        p = next((p for p in posts() if p["id"] == post_id), None)
        if not p:
            return error("文章不存在", 404)
        t = _token(p["salt"], "report:" + current_user()["username"])
        if t not in p["reports"]:
            p["reports"].append(t)
        if len(p["reports"]) >= HIDE_AFTER_REPORTS:
            p["hidden"] = True
        store.save()
    return ok(message="已檢舉，累積多人檢舉的文章會自動隱藏等待管理員處理")


@bp.route("/api/campus/forum/moderation", methods=["GET"])
@require("管理員", "教職員")
def moderation():
    """被檢舉的文章 (不含任何作者資訊)"""
    items = [{"id": p["id"], "board": p["board"], "content": p["content"], "report_count": len(p["reports"]),
              "hidden": p.get("hidden", False), "created_at": p["created_at"]}
             for p in posts() if p["reports"]]
    return ok(data=sorted(items, key=lambda x: -x["report_count"]))


@bp.route("/api/campus/forum/moderation/<int:post_id>", methods=["POST"])
@require("管理員", "教職員")
def moderate(post_id):
    action = (request.get_json(silent=True) or {}).get("action")
    with store.lock:
        p = next((p for p in posts() if p["id"] == post_id), None)
        if not p:
            return error("文章不存在", 404)
        if action == "restore":
            p["hidden"], p["reports"] = False, []
        elif action == "delete":
            posts().remove(p)
        else:
            return error("action 只能是 restore 或 delete")
        store.save()
    return ok(message="已處理")
