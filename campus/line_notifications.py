"""LINE notification preferences, kept inactive until an official account is connected.

This module deliberately does not accept a LINE user ID from the browser or send messages.
Account linking must use a verified LINE callback after the school creates its channel.
"""
import os
import json
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone

from flask import Blueprint, request

from .common import current_user, error, ok, require, store, user_key

bp = Blueprint("line_notifications", __name__)

TEACHER_EVENTS = ("leave_pending", "care_due")


def channel_ready():
    return bool(os.getenv("LINE_CHANNEL_ACCESS_TOKEN") and os.getenv("LINE_CHANNEL_SECRET"))


def demo_ready(username):
    target = os.getenv("LINE_DEMO_USER_ID", "")
    return (os.getenv("LINE_DEMO_ENABLED") == "1"
            and os.getenv("LINE_DEMO_USERNAME") == username
            and bool(os.getenv("LINE_CHANNEL_ACCESS_TOKEN"))
            and bool(re.fullmatch(r"U[0-9a-fA-F]{32}", target)))


def push_demo_message(target, token):
    payload = {"to": target, "messages": [{"type": "text", "text":
        "【Smart UKN 專題測試】這是假資料通知：老師有 1 張假單待審。請勿據此辦理實際校務。"}]}
    req = urllib.request.Request(
        "https://api.line.me/v2/bot/message/push",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST")
    with urllib.request.urlopen(req, timeout=10) as response:
        return response.status == 200


@bp.route("/api/line/demo-status", methods=["GET"])
@require("老師")
def line_demo_status():
    return ok(ready=demo_ready(current_user()["username"]))


@bp.route("/api/line/demo-send", methods=["POST"])
@require("老師")
def line_demo_send():
    username = current_user()["username"]
    if not demo_ready(username):
        return error("LINE 測試通知尚未設定完成", 503)
    now = datetime.now(timezone.utc).timestamp()
    with store.lock:
        last = float((store.data.get("line_demo_last_send") or {}).get(username, 0))
        if now - last < 60:
            return error("請稍後再試，測試通知每分鐘最多一則", 429)
        # Reserve before the external request so concurrent clicks cannot send duplicates.
        store.section("line_demo_last_send", dict)[username] = now
        store.save()
    try:
        sent = push_demo_message(os.environ["LINE_DEMO_USER_ID"], os.environ["LINE_CHANNEL_ACCESS_TOKEN"])
    except (OSError, urllib.error.HTTPError):
        sent = False
    if not sent:
        return error("LINE 尚未接受測試訊息；請確認帳號設定與好友狀態", 502)
    return ok(message="測試通知已送交 LINE")


def settings_for(key):
    with store.lock:
        saved = dict((store.data.get("line_preferences") or {}).get(key) or {})
    return {"leave_pending": saved.get("leave_pending") is True,
            "care_due": saved.get("care_due") is True}


def claim_delivery(event_key, recipient_key):
    """Reserve one event for one recipient; call only after verified account linking.

    This is a durable deduplication primitive, not proof that LINE received a message.
    The future sender must record delivery result and retry failures separately.
    """
    if not event_key or not recipient_key:
        raise ValueError("event and recipient are required")
    key = f"{recipient_key}:{event_key}"
    with store.lock:
        sent = store.section("line_delivery_claims", dict)
        if key in sent:
            return False
        sent[key] = "reserved"
        store.save()
        return True


@bp.route("/api/line/settings", methods=["GET", "PUT"])
@require("老師")
def line_settings():
    key = user_key()
    if request.method == "PUT":
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or set(data) != set(TEACHER_EVENTS) or any(type(data[name]) is not bool for name in TEACHER_EVENTS):
            return error("請選擇有效的 LINE 通知項目", 400)
        with store.lock:
            store.section("line_preferences", dict)[key] = {name: data[name] for name in TEACHER_EVENTS}
            store.save()
    # A channel credential alone is insufficient: a verified user binding is also required.
    return ok(data={"choices": settings_for(key), "channel_ready": channel_ready(),
                    "connected": False, "active": False,
                    "message": "學校 LINE 官方帳號尚未綁定；目前不會發送通知。"})
