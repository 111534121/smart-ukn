"""LINE 帳號綁定與「我的常用功能」：讓已登入網站的使用者把自己的帳號跟 LINE 綁在一起，
之後在 LINE LIFF 頁面可以直接看/改常用功能，不用在 LIFF 裡重新輸入帳密。

綁定流程 (不接受瀏覽器自己宣稱的 LINE user id，一律要經過 LINE 官方驗證)：
1. 使用者先登入網站，呼叫 POST /api/line/bind/start 取得一組 6 碼代碼 (5 分鐘內有效)。
2. 使用者在 LINE 選單打開「設定常用功能」LIFF 頁面；頁面用 liff.getIDToken() 取得 LINE 簽過名
   的身分權杖，把代碼和權杖一起送到 POST /api/line/bind/confirm。
3. 伺服器呼叫 LINE 官方的 /oauth2/v2.1/verify，確認權杖真的是 LINE 核發、對象是我們的 LIFF
   (client_id 必須等於 LIFF ID 開頭的 channel id)，驗證通過才拿得到裡面的 LINE user id (sub)。

之後 LIFF 頁面每次打開都附上目前的 liff.getIDToken()，伺服器每次都重新驗證，
找得到對應的帳號才讀寫得到常用功能；沒有「誰都可以丟一個 user id 就看到別人設定」的問題。
"""
import json
import os
import random
import time
import urllib.error
import urllib.parse
import urllib.request
from io import BytesIO

import qrcode
from qrcode.image.svg import SvgPathFillImage
from flask import Blueprint, Response, request

from .common import current_user, deps, error, ok, require, store
from .services import get_pinned, set_pinned


bp = Blueprint("line_binding", __name__)

BIND_CODE_TTL = 300  # 5 分鐘


def _role_for_username(username):
    rows = deps.fetch_db_rows("SELECT role FROM users WHERE username = %s", (username,))
    if rows is not None:
        return rows[0]["role"] if rows else None
    user = next((u for u in (deps.users or []) if u["username"] == username), None)
    return user["role"] if user else None


def _student_id_for_username(username):
    rows = deps.fetch_db_rows("SELECT student_id FROM users WHERE username = %s", (username,))
    if rows is not None:
        return rows[0]["student_id"] if rows else None
    user = next((u for u in (deps.users or []) if u["username"] == username), None)
    return user.get("student_id") if user else None


def _liff_channel_id():
    liff_id = os.getenv("LINE_LIFF_ID", "")
    return liff_id.split("-")[0] if "-" in liff_id else ""


def verify_line_id_token(id_token):
    """回傳驗證過的 LINE user id (sub)；驗證失敗或未設定 LIFF ID 時回傳 None。"""
    channel_id = _liff_channel_id()
    if not id_token or not channel_id:
        return None
    payload = urllib.parse.urlencode({"id_token": id_token, "client_id": channel_id}).encode()
    req = urllib.request.Request("https://api.line.me/oauth2/v2.1/verify", data=payload, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (OSError, urllib.error.HTTPError, ValueError):
        return None
    return data.get("sub")


def _bindings():
    return store.section("line_bindings", dict)  # line_user_id -> username


def username_for_line_user(line_user_id):
    with store.lock:
        return _bindings().get(line_user_id)


def _id_token_from_request():
    return request.headers.get("X-Line-Id-Token") or (request.get_json(silent=True) or {}).get("id_token") or ""


@bp.route("/api/line/bind/start", methods=["POST"])
@require()
def bind_start():
    u = current_user()
    username = u["username"]
    with store.lock:
        codes = store.section("line_bind_codes", dict)
        now = time.time()
        # 清掉這個人的舊代碼和過期代碼，一次只有一組有效代碼
        for old in [c for c, v in codes.items() if v["username"] == username or v["expires"] < now]:
            del codes[old]
        code = f"{random.randint(0, 999999):06d}"
        while code in codes:
            code = f"{random.randint(0, 999999):06d}"
        codes[code] = {"username": username, "expires": now + BIND_CODE_TTL}
        store.save()
        already_bound = any(name == username for name in _bindings().values())
    return ok(data={"code": code, "expires_in": BIND_CODE_TTL, "already_bound": already_bound})


@bp.route("/api/line/bind/confirm", methods=["POST"])
def bind_confirm():
    data = request.get_json(silent=True) or {}
    code = str(data.get("code") or "").strip()
    line_user_id = verify_line_id_token(str(data.get("id_token") or ""))
    if not line_user_id:
        return error("LINE 驗證失敗，請從 LINE 選單重新打開這個頁面", 401)
    with store.lock:
        codes = store.section("line_bind_codes", dict)
        entry = codes.get(code)
        if not entry or entry["expires"] < time.time():
            return error("代碼已過期，請回網站重新取得代碼", 400)
        username = entry["username"]
        del codes[code]
        bindings = _bindings()
        for old_line_user in [lu for lu, name in bindings.items() if name == username]:
            del bindings[old_line_user]  # 一個帳號只保留最新綁定的那個 LINE 帳號
        bindings[line_user_id] = username
        store.save()
    return ok(message="已綁定帳號", data={"username": username})


@bp.route("/api/line/unbind", methods=["POST"])
def unbind():
    data = request.get_json(silent=True) or {}
    line_user_id = verify_line_id_token(str(data.get("id_token") or ""))
    if not line_user_id:
        return error("LINE 驗證失敗", 401)
    with store.lock:
        _bindings().pop(line_user_id, None)
        store.save()
    return ok(message="已解除綁定")


@bp.route("/api/line/menu", methods=["GET", "PUT"])
def line_menu():
    """LIFF 頁面專用：帶 X-Line-Id-Token 標頭 (或 body.id_token) 呼叫，不需要網站登入 session。"""
    line_user_id = verify_line_id_token(_id_token_from_request())
    if not line_user_id:
        return error("LINE 驗證失敗，請從 LINE 選單重新打開這個頁面", 401)
    username = username_for_line_user(line_user_id)
    if not username:
        return ok(data={"bound": False})
    role = _role_for_username(username)
    if request.method == "PUT":
        data = request.get_json(silent=True) or {}
        pinned = set_pinned(username, data.get("pinned", []))
        return ok(message="已更新常用功能", data={"bound": True, "username": username, "role": role, "pinned": pinned})
    return ok(data={"bound": True, "username": username, "role": role, "pinned": get_pinned(username, role)})


@bp.route("/api/line/schedule", methods=["GET"])
def line_schedule():
    """LIFF「我的課表」頁面專用：帶 X-Line-Id-Token 標頭呼叫，綁定過的學生直接看自己本學期課表。"""
    line_user_id = verify_line_id_token(_id_token_from_request())
    if not line_user_id:
        return error("LINE 驗證失敗，請從 LINE 選單重新打開這個頁面", 401)
    username = username_for_line_user(line_user_id)
    if not username:
        return ok(data={"bound": False})
    student_id = _student_id_for_username(username)
    if not student_id:
        return error("這個帳號沒有綁定學號，無法查詢課表", 403)
    from retake import recommendations_for  # 延後匯入，避免跟 retake 互相匯入造成循環
    report = recommendations_for(student_id)
    if not report:
        return error("查無學生資料", 404)
    return ok(data={"bound": True, "username": username, "student": report["student"],
                    "semester": report["semester"], "schedule": report["schedule"]})


@bp.route("/api/line/notices", methods=["GET"])
def line_notices():
    """LIFF「我的公告」頁面專用：帶 X-Line-Id-Token 標頭呼叫，綁定過的學生直接看自己的班級通知。"""
    line_user_id = verify_line_id_token(_id_token_from_request())
    if not line_user_id:
        return error("LINE 驗證失敗，請從 LINE 選單重新打開這個頁面", 401)
    username = username_for_line_user(line_user_id)
    if not username:
        return ok(data={"bound": False})
    student_id = _student_id_for_username(username)
    if not student_id:
        return error("這個帳號沒有綁定學號，無法查詢公告", 403)
    from .messaging import load_notices  # 延後匯入，避免跟 messaging 互相匯入造成循環
    items = [{k: v for k, v in n.items() if k not in ("recipients", "read_by", "sender_username", "replies")}
             | {"is_read": student_id in n["read_by"], "my_reply": n.get("replies", {}).get(student_id)}
             for n in load_notices(student_id=student_id)]
    return ok(data={"bound": True, "username": username, "items": items,
                     "unread_count": sum(1 for i in items if not i["is_read"])})


# ---------- LINE 官方帳號加好友：QR Code 與連結，公開資訊，不含任何登入狀態 ----------

def _oa_id():
    raw = os.getenv("LINE_OA_ID", "").strip().lstrip("@")
    return raw or None


@bp.route("/api/line/oa", methods=["GET"])
def line_oa():
    oa_id = _oa_id()
    url = f"https://line.me/R/ti/p/@{oa_id}" if oa_id else None
    return ok(data={"ready": bool(oa_id), "add_friend_url": url,
                    "qr_url": "/api/line/oa-qr.svg" if oa_id else None})


@bp.route("/api/line/oa-qr.svg", methods=["GET"])
def line_oa_qr():
    oa_id = _oa_id()
    if not oa_id:
        return error("LINE 官方帳號尚未設定", 409)
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=4)
    qr.add_data(f"https://line.me/R/ti/p/@{oa_id}")
    qr.make(fit=True)
    output = BytesIO()
    qr.make_image(image_factory=SvgPathFillImage).save(output)
    response = Response(output.getvalue(), mimetype="image/svg+xml")
    response.headers["Cache-Control"] = "no-store"
    response.headers["Content-Disposition"] = 'inline; filename="smart-ukn-line-oa-qr.svg"'
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response
