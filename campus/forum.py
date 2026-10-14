"""匿名論壇 (表白牆)：前台發文功能已下架 (見commit「移除桌寵與匿名論壇」)。

只保留後台檢舉內容清理：讓管理員/教職員能處理舊資料裡被檢舉的文章 (恢復顯示或刪除)，
刻意不保留發文/按讚/留言/檢舉等寫入端點，避免下架後仍可被直接呼叫 API 匿名發文。
"""
from flask import Blueprint, request

from .common import error, ok, require, store

bp = Blueprint("campus_forum", __name__)


def posts():
    return store.section("forum_posts", list)


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
