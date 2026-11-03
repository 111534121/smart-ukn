"""AI 智慧校規：輸入第一個字就跳出選項、大分類瀏覽、『你是不是想問…』引導式詢問、完整流程下拉選單。"""
from flask import Blueprint, request

from .calendar_ext import load_checklists, checklist_detail
from .common import deps, error, ok

bp = Blueprint("campus_rules", __name__)


def load_kb():
    rows = deps.fetch_db_rows(
        "SELECT k.*, c.category_name FROM knowledge_base k LEFT JOIN knowledge_categories c ON k.category_id = c.category_id")
    return rows if rows else deps.knowledge_base


def load_synonyms():
    rows = deps.fetch_db_rows("SELECT user_keyword, official_term FROM synonym_dictionary")
    return rows if rows else deps.synonyms


def related_checklist(rule, checklists):
    return next((c for c in checklists if c.get("related_kb_id") == rule["id"]
                 or (rule.get("keyword") and rule["keyword"] in c["business_name"])), None)


def rule_card(rule, checklists):
    chk = related_checklist(rule, checklists)
    return {
        "kb_id": rule["id"],
        "title": rule.get("official_term") or rule.get("subcategory"),
        "keyword": rule.get("keyword", ""),
        "category_name": rule.get("category_name", ""),
        "subcategory": rule.get("subcategory", ""),
        "content": rule.get("content", ""),
        "source_doc": rule.get("doc_name", ""),
        "source_page": rule.get("page"),
        "source_url": rule.get("url", ""),
        "checklist": checklist_detail(chk),
    }


def _phrases():
    """所有可被建議的詞：口語同義詞、關鍵字、官方名稱、子分類、申辦項目"""
    kb = load_kb()
    by_term = {r.get("official_term"): r for r in kb}
    items = []
    for r in kb:
        for text, kind in ((r.get("keyword"), "關鍵字"), (r.get("official_term"), "規章"), (r.get("subcategory"), "分類")):
            if text:
                items.append({"text": text, "kind": kind, "kb_id": r["id"], "category": r.get("category_name", "")})
    for s in load_synonyms():
        rule = by_term.get(s["official_term"])
        items.append({"text": s["user_keyword"], "kind": "口語", "kb_id": rule["id"] if rule else None,
                      "category": rule.get("category_name", "") if rule else "", "official_term": s["official_term"]})
    for c in load_checklists():
        items.append({"text": c["business_name"], "kind": "申辦流程", "checklist_id": c["item_id"],
                      "category": c.get("category_name", "")})
    return items


# 【功能：AI 智慧校規】打第一個字就跳選項：開頭相同 3 分 > 包含 2 分 > 大部分字都有 1 分
@bp.route("/api/campus/rules/suggest", methods=["GET"])
def suggest():
    """輸入一個字就回傳候選：開頭相同的排前面，其次是包含該字的"""
    q = request.args.get("q", "").strip().lower()
    if not q:
        return ok(data=[])
    scored, seen = [], set()
    for p in _phrases():
        text = p["text"].lower()
        if text in seen:
            continue
        if text.startswith(q):
            score = 3
        elif q in text:
            score = 2
        elif len(q) >= 2 and sum(ch in text for ch in set(q)) >= max(2, len(set(q)) - 1):
            score = 1
        else:
            continue
        seen.add(text)
        scored.append((score, -len(text), p))
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return ok(data=[p for _, _, p in scored[:10]])


# 【功能：AI 智慧校規】把句子拆成「每兩個字」的片段，用來比對學生的描述和規章有多少片段重疊
def _bigrams(text):
    text = "".join(ch for ch in text.lower() if not ch.isspace())
    return {text[i:i + 2] for i in range(len(text) - 1)} | set(text)


# 【功能：AI 智慧校規】②「我不確定，幫我問」：口語詞直接命中 +20 分，再加上兩字片段重疊數，由最像到最不像逐一問「你是不是想問…」
@bp.route("/api/campus/rules/candidates", methods=["GET"])
def candidates():
    """輸入大概的描述，回傳可能的規章 (由最像到最不像)，前端逐一詢問『你是不是想問…？』"""
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    if not q and not category:
        return error("請輸入想查詢的內容或選擇分類")
    kb = load_kb()
    synonyms = load_synonyms()
    checklists = load_checklists()
    qgrams = _bigrams(q) if q else set()
    results = []
    for r in kb:
        if category and r.get("category_name") != category:
            continue
        syn_words = " ".join(s["user_keyword"] for s in synonyms if s["official_term"] == r.get("official_term"))
        haystack = " ".join(str(r.get(k, "")) for k in ("keyword", "official_term", "subcategory", "category_name")) + " " + syn_words
        if q:
            direct = any(w and w in q for w in [r.get("keyword", "")] + syn_words.split())
            overlap = len(qgrams & _bigrams(haystack)) + 0.3 * len(qgrams & _bigrams(r.get("content", "")))
            score = overlap + (20 if direct else 0)
            if score < 1:
                continue
        else:
            score = 0
        card = rule_card(r, checklists)
        card["score"] = round(score, 1)
        card["question"] = f"你是不是想問「{card['title']}」？（{card['subcategory']}）"
        results.append(card)
    results.sort(key=lambda x: x["score"], reverse=True)
    return ok(data=results[:6])


@bp.route("/api/campus/rules/tree", methods=["GET"])
def tree():
    """大分類 → 子分類 → 規章與對應申辦流程；也提供『全部流程』下拉選單的資料"""
    kb = load_kb()
    checklists = load_checklists()
    categories = []
    names = []
    for r in kb:
        if r.get("category_name") and r["category_name"] not in names:
            names.append(r["category_name"])
    icon_of = {c["category_name"]: c.get("icon", "") for c in deps.categories}
    for name in names:
        rules = [rule_card(r, checklists) for r in kb if r.get("category_name") == name]
        categories.append({"name": name, "icon": icon_of.get(name, "📄"), "rules": rules})
    processes = [checklist_detail(c) | {"audience": c.get("audience", ""), "deadline": c.get("deadline_week_info", "")}
                 for c in checklists]
    return ok(categories=categories, processes=processes)
