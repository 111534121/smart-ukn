"""
校慶跑馬燈的純邏輯 (不碰資料庫與 Flask，方便測試)：
顯示期間判斷、三語系官方文字、匿名祝福內容檢查。
"""
import re
from datetime import date, timedelta

LANGS = ("zh", "en", "ja")
WISH_MAX_LEN = 60
WISH_MIN_LEN = 2

# 匿名祝福審核狀態 (與 anniversary_wishes.status enum 一致)
WISH_PENDING, WISH_VISIBLE, WISH_HIDDEN = "待審核", "顯示中", "已隱藏"
WISH_STATUSES = (WISH_PENDING, WISH_VISIBLE, WISH_HIDDEN)

TEXTS = {
    "zh": {
        "countdown": "🎉 {name}倒數 {days} 天！（{date}）",
        "tomorrow": "🎉 明天就是{name}，歡迎回校同歡！",
        "today": "🎉 {name}今天登場，歡迎回校同歡！",
        "ongoing": "🎉 {name}熱烈進行中，活動至 {end}！",
        "wish": "匿名祝福",
    },
    "en": {
        "countdown": "🎉 {days} days until {name} ({date})!",
        "tomorrow": "🎉 {name} is tomorrow. Come celebrate with us!",
        "today": "🎉 {name} is today. Come celebrate with us!",
        "ongoing": "🎉 {name} is under way until {end}!",
        "wish": "Anonymous wish",
    },
    "ja": {
        "countdown": "🎉 {name}まであと{days}日！（{date}）",
        "tomorrow": "🎉 明日は{name}！ぜひお越しください！",
        "today": "🎉 本日{name}開催！ぜひお越しください！",
        "ongoing": "🎉 {name}開催中！（{end}まで）",
        "wish": "匿名メッセージ",
    },
}

# 不當字詞 (簡易過濾，最終仍以後台審核為準)；可依需要增補
BLOCKED_WORDS = ("幹你", "操你", "靠北", "白痴", "智障", "去死", "fuck", "shit", "bitch")
URL_PATTERN = re.compile(r"(https?://|www\.|\.(com|net|org|tw|io|xyz)\b)", re.IGNORECASE)


def normalize_lang(lang):
    lang = (lang or "").lower()[:2]
    return lang if lang in LANGS else "zh"


def to_date(value):
    return value if isinstance(value, date) else date.fromisoformat(str(value)[:10])


def display_window(event):
    """(開始顯示日, 最後顯示日)：校慶前 announce_days 天開始，校慶最後一天結束"""
    start = to_date(event["start_date"])
    return start - timedelta(days=int(event.get("announce_days") or 30)), to_date(event["end_date"])


def is_active(event, today):
    if not event.get("is_enabled"):
        return False
    first, last = display_window(event)
    return first <= today <= last


def pick_active_event(events, today):
    """多個校慶活動同時在期間內時，取最先開始的"""
    active = [e for e in events if is_active(e, today)]
    return min(active, key=lambda e: to_date(e["start_date"])) if active else None


def event_name(event, lang):
    # 沒填外語名稱時退回中文
    return event.get(f"name_{lang}") or event["name_zh"]


def official_text(event, today, lang):
    t = TEXTS[lang]
    name = event_name(event, lang)
    start, end = to_date(event["start_date"]), to_date(event["end_date"])
    days = (start - today).days
    if days > 1:
        return "countdown", days, t["countdown"].format(name=name, days=days, date=start.strftime("%Y/%m/%d"))
    if days == 1:
        return "countdown", days, t["tomorrow"].format(name=name)
    if today == start:
        return "ongoing", 0, t["today"].format(name=name)
    return "ongoing", 0, t["ongoing"].format(name=name, end=end.strftime("%m/%d"))


MESSAGES = {
    "zh": {
        "too_short": f"祝福內容至少 {WISH_MIN_LEN} 個字",
        "too_long": f"祝福內容最多 {WISH_MAX_LEN} 個字",
        "url": "祝福內容不能包含網址",
        "blocked": "祝福內容含有不適當的字詞",
        "inactive": "目前不在校慶祝福期間",
        "rate_limited": "送出太頻繁了，請稍後再試",
        "thanks_pending": "感謝你的祝福！審核通過後就會出現在跑馬燈上",
        "thanks_visible": "感謝你的祝福！已出現在跑馬燈上",
    },
    "en": {
        "too_short": f"Please write at least {WISH_MIN_LEN} characters",
        "too_long": f"Please keep it within {WISH_MAX_LEN} characters",
        "url": "Links are not allowed",
        "blocked": "Your message contains inappropriate words",
        "inactive": "Anniversary wishes are not open right now",
        "rate_limited": "Too many messages. Please try again later",
        "thanks_pending": "Thank you! Your wish will appear after review",
        "thanks_visible": "Thank you! Your wish is now on the banner",
    },
    "ja": {
        "too_short": f"{WISH_MIN_LEN}文字以上で入力してください",
        "too_long": f"{WISH_MAX_LEN}文字以内で入力してください",
        "url": "URLは入力できません",
        "blocked": "不適切な言葉が含まれています",
        "inactive": "現在はメッセージ受付期間外です",
        "rate_limited": "送信が多すぎます。しばらくしてからお試しください",
        "thanks_pending": "ありがとうございます！確認後に表示されます",
        "thanks_visible": "ありがとうございます！メッセージが表示されました",
    },
}


def clean_wish(message):
    """整理並檢查祝福內容，回傳 (內容, 錯誤代碼)；錯誤代碼為 None 代表可以送出 (代碼對應 MESSAGES)"""
    text = re.sub(r"[\x00-\x1f\x7f]", "", str(message or ""))
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) < WISH_MIN_LEN:
        return text, "too_short"
    if len(text) > WISH_MAX_LEN:
        return text, "too_long"
    if URL_PATTERN.search(text):
        return text, "url"
    lowered = text.lower()
    if any(w in lowered for w in BLOCKED_WORDS):
        return text, "blocked"
    return text, None
