"""桌寵：隨機問學校規定或證照題目，答對得積分；給學校意見也能得積分；積分可以幫桌寵換衣服。"""
import random
from datetime import date

from flask import Blueprint, request

from .common import deps, error, ok, require, store, next_id, now_str, current_user, user_key, STAFF_ROLES

bp = Blueprint("campus_pet", __name__)

POINTS_CORRECT = 10
POINTS_FEEDBACK = 20
QUESTIONS_PER_DAY = 5
FEEDBACK_PER_DAY = 1

QUESTIONS = [
    {"id": 1, "topic": "校規", "q": "停修申請在學期第幾週辦理？", "options": ["第 1-3 週", "第 10-12 週", "期末考週", "隨時都可以"], "answer": 1,
     "explain": "停修於學期第 10-12 週申請，每學期以 2 科為限。"},
    {"id": 2, "topic": "校規", "q": "病假要在幾天內線上申請？", "options": ["當天", "3 日內 (含例假日)", "7 日內", "學期結束前"], "answer": 1,
     "explain": "應於請假日當日起 3 日內 (含例假日) 提出並附就醫證明。"},
    {"id": 3, "topic": "校規", "q": "單科曠課時數達授課總時數多少會扣考？", "options": ["1/4", "1/3", "1/2", "2/3"], "answer": 1,
     "explain": "依學則，單科曠課達授課總時數 1/3 即扣考。"},
    {"id": 4, "topic": "校規", "q": "五專畢業需要修滿多少學分？", "options": ["128", "180", "220", "250"], "answer": 2,
     "explain": "五專畢業學分為 220 學分。"},
    {"id": 5, "topic": "校規", "q": "英文抵免需要多益幾分以上？", "options": ["450", "550", "650", "750"], "answer": 1,
     "explain": "多益 550 分以上可申請抵免基礎英文 (一)(二)。"},
    {"id": 6, "topic": "校規", "q": "先修課不及格會發生什麼事？", "options": ["沒影響", "後續課程被擋修", "直接退學", "自動重修"], "answer": 1,
     "explain": "先修課未通過，以它為先修的後續課程會被擋修。"},
    {"id": 7, "topic": "證照", "q": "技術士證照由哪個單位發證？", "options": ["教育部", "勞動部勞動力發展署", "經濟部", "考選部"], "answer": 1,
     "explain": "技術士證由勞動部勞動力發展署核發。"},
    {"id": 8, "topic": "證照", "q": "技術士證照等級由高到低是？", "options": ["丙 > 乙 > 甲", "甲 > 乙 > 丙", "乙 > 甲 > 丙", "沒有分級"], "answer": 1,
     "explain": "甲級最高、乙級次之、丙級為入門。"},
    {"id": 9, "topic": "證照", "q": "資管科畢業需要幾張專業證照？", "options": ["0 張", "1 張", "2 張", "3 張"], "answer": 2,
     "explain": "畢業門檻為 2 張專業證照。"},
    {"id": 10, "topic": "證照", "q": "TQC 證照是由哪個單位辦理？", "options": ["電腦技能基金會", "勞動部", "微軟", "教育部"], "answer": 0,
     "explain": "TQC 由財團法人中華民國電腦技能基金會辦理。"},
    {"id": 11, "topic": "校園", "q": "專業證照獎勵金要到哪裡申請？", "options": ["課務組", "註冊組", "研發處實習就業組", "總務處"], "answer": 2,
     "explain": "證照獎勵金由研發處實習就業組受理。"},
    {"id": 12, "topic": "校園", "q": "停修申請單最後要送到哪裡？", "options": ["生輔組", "教務處課務組", "圖書館", "科辦"], "answer": 1,
     "explain": "停修單完成簽章後送教務處課務組核備。"},
]

OUTFITS = [
    {"id": "none", "name": "原本的樣子", "emoji": "", "price": 0},
    {"id": "cap", "name": "學士帽", "emoji": "🎓", "price": 30},
    {"id": "bow", "name": "蝴蝶結", "emoji": "🎀", "price": 40},
    {"id": "glasses", "name": "書呆眼鏡", "emoji": "👓", "price": 50},
    {"id": "crown", "name": "皇冠", "emoji": "👑", "price": 120},
    {"id": "scarf", "name": "康寧圍巾", "emoji": "🧣", "price": 80},
    {"id": "headphone", "name": "耳機", "emoji": "🎧", "price": 60},
]
PETS = [{"id": "cat", "emoji": "🐱", "name": "寧寧貓"}, {"id": "dog", "emoji": "🐶", "name": "康康狗"},
        {"id": "owl", "emoji": "🦉", "name": "學霸鴞"}]


def pet_state():
    key = user_key()
    all_pets = store.section("pets", dict)
    s = all_pets.setdefault(key, {"pet": "cat", "points": 20, "owned": ["none"], "outfit": "none",
                                  "day": "", "answered": [], "feedback_today": 0, "correct_total": 0})
    today = date.today().isoformat()
    if s["day"] != today:
        s.update(day=today, answered=[], feedback_today=0)
    return s


def public_state(s):
    pet = next((p for p in PETS if p["id"] == s["pet"]), PETS[0])
    outfit = next((o for o in OUTFITS if o["id"] == s["outfit"]), OUTFITS[0])
    return {"pet": pet, "outfit": outfit, "points": s["points"], "owned": s["owned"],
            "questions_left": max(0, QUESTIONS_PER_DAY - len(s["answered"])),
            "feedback_left": max(0, FEEDBACK_PER_DAY - s["feedback_today"]), "correct_total": s["correct_total"],
            "shop": OUTFITS, "pets": PETS}


@bp.route("/api/campus/pet", methods=["GET"])
@require()
def get_pet():
    with store.lock:
        s = pet_state()
        store.save()
    return ok(data=public_state(s))


@bp.route("/api/campus/pet/question", methods=["GET"])
@require()
def question():
    with store.lock:
        s = pet_state()
        if len(s["answered"]) >= QUESTIONS_PER_DAY:
            return ok(data=None, message="今天的題目都答完了，明天再來！")
        pool = [q for q in QUESTIONS if q["id"] not in s["answered"]]
    q = random.choice(pool)
    return ok(data={k: q[k] for k in ("id", "topic", "q", "options")})


@bp.route("/api/campus/pet/answer", methods=["POST"])
@require()
def answer():
    data = request.get_json(silent=True) or {}
    q = next((x for x in QUESTIONS if x["id"] == data.get("id")), None)
    if not q:
        return error("題目不存在", 404)
    with store.lock:
        s = pet_state()
        if q["id"] in s["answered"]:
            return error("這題今天已經答過了", 409)
        if len(s["answered"]) >= QUESTIONS_PER_DAY:
            return error("今天的題目都答完了", 429)
        s["answered"].append(q["id"])
        correct = data.get("choice") == q["answer"]
        if correct:
            s["points"] += POINTS_CORRECT
            s["correct_total"] += 1
        store.save()
    return ok(correct=correct, answer=q["answer"], explain=q["explain"], gained=POINTS_CORRECT if correct else 0,
              data=public_state(s))


@bp.route("/api/campus/pet/feedback", methods=["POST"])
@require()
def feedback():
    content = str((request.get_json(silent=True) or {}).get("content", "")).strip()[:500]
    if len(content) < 10:
        return error("意見至少寫 10 個字，才能幫學校改進喔")
    with store.lock:
        s = pet_state()
        gained = 0
        if s["feedback_today"] < FEEDBACK_PER_DAY:
            s["points"] += POINTS_FEEDBACK
            s["feedback_today"] += 1
            gained = POINTS_FEEDBACK
        items = store.section("school_feedback", list)
        items.append({"id": next_id(items), "content": content, "role": current_user()["role"], "created_at": now_str()})
        store.save()
    msg = f"謝謝你的意見！+{gained} 積分" if gained else "謝謝你的意見！（今天的意見積分已經領過了）"
    return ok(message=msg, gained=gained, data=public_state(s))


@bp.route("/api/campus/pet/buy", methods=["POST"])
@require()
def buy():
    item_id = (request.get_json(silent=True) or {}).get("id")
    outfit = next((o for o in OUTFITS if o["id"] == item_id), None)
    if not outfit:
        return error("沒有這件衣服", 404)
    with store.lock:
        s = pet_state()
        if item_id not in s["owned"]:
            if s["points"] < outfit["price"]:
                return error(f"積分不夠，還差 {outfit['price'] - s['points']} 分")
            s["points"] -= outfit["price"]
            s["owned"].append(item_id)
        s["outfit"] = item_id
        store.save()
    return ok(message=f"換上{outfit['name']}了！", data=public_state(s))


@bp.route("/api/campus/pet/choose", methods=["POST"])
@require()
def choose():
    pet_id = (request.get_json(silent=True) or {}).get("pet")
    if pet_id not in {p["id"] for p in PETS}:
        return error("沒有這隻寵物")
    with store.lock:
        s = pet_state()
        s["pet"] = pet_id
        store.save()
    return ok(data=public_state(s))


@bp.route("/api/campus/feedback", methods=["GET"])
@require(*STAFF_ROLES)
def list_feedback():
    return ok(data=sorted(store.section("school_feedback", list), key=lambda x: x["created_at"], reverse=True))
