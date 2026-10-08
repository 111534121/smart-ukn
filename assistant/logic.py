"""
AI 申辦小幫手的檢索邏輯 (純函式，不碰資料庫、Flask、Claude)：
把學生的口語問題對應到申辦流程 (checklist_items) 與規章 (knowledge_base)。

中文沒有空白斷詞，所以用三種訊號加總：
1. 同義詞 / 情境詞擴充 (資料庫 synonym_dictionary + 下方 INTENT_HINTS)
2. 擴充後的詞出現在流程名稱、分類、步驟、應備文件的位置加權
3. 問題與流程文字的「兩字詞」重疊數 (去除「怎麼」「需要」這類無意義的詞)
"""
import re

# 學生描述情境的說法 → 學校的正式名稱 (資料庫的同義詞字典會再補充)
INTENT_HINTS = {
    "生病": ["病假", "請假"], "不舒服": ["病假", "請假"], "發燒": ["病假", "請假"], "看醫生": ["病假"],
    "不能來": ["請假"], "沒辦法上課": ["請假"], "缺課": ["請假"], "家裡有事": ["事假", "請假"],
    "不想修": ["停修"], "退選": ["停修"], "跟不上": ["停修"], "棄修": ["停修"],
    "多益": ["外語", "抵免"], "英檢": ["外語", "抵免"], "雅思": ["外語", "抵免"], "免修": ["抵免"],
    "畢業": ["畢業", "學分"], "學分夠不夠": ["畢業", "學分"],
    "證照": ["證照", "獎勵"], "比賽": ["競賽", "獎勵"], "得獎": ["競賽", "獎勵"], "獎金": ["獎勵"],
    "被當": ["重修", "不及格", "擋修"], "不及格": ["擋修"], "擋修": ["先修", "擋修"],
}

STOP_BIGRAMS = {
    "怎麼", "麼辦", "要怎", "請問", "可以", "需要", "什麼", "如果", "我想", "想要", "應該", "一下",
    "要去", "哪裡", "辦理", "申請", "的話", "時候", "我要", "是不", "不是", "有沒", "沒有", "我的",
}

MAX_QUESTION_LEN = 200
MIN_SCORE = 20
TOP_FLOWS, TOP_RULES = 3, 2


def normalize(text):
    return re.sub(r"[\s\W_]+", "", str(text or "").lower())


def bigrams(text):
    t = normalize(text)
    return {t[i:i + 2] for i in range(len(t) - 1)} - STOP_BIGRAMS


def expand_terms(question, synonyms):
    """問題中出現的情境詞 / 同義詞 → 正式名稱 list (保持順序、去重)"""
    q = normalize(question)
    terms = []
    for hint, extra in INTENT_HINTS.items():
        if hint in q:
            terms.extend(extra)
    for user_kw, official in synonyms.items():
        kw = normalize(user_kw)
        if len(kw) >= 2 and kw in q:
            terms.append(official)
    return list(dict.fromkeys(t for t in terms if t))


def _steps_text(flow):
    steps = flow.get("steps_json") or []
    return " ".join(steps) if isinstance(steps, list) else str(steps)


def score_flow(flow, question, terms):
    name = normalize(flow.get("business_name"))
    category = normalize(flow.get("category_name"))
    steps = normalize(_steps_text(flow))
    docs = normalize(flow.get("required_docs"))
    q = normalize(question)
    score = 0
    for term in terms + ([q] if len(q) <= 6 else []):
        t = normalize(term)
        if not t:
            continue
        if t in name or (len(name) >= 2 and name in t):
            score += 50
        if t in category:
            score += 15
        if t in steps:
            score += 10
        if t in docs:
            score += 8
    overlap = bigrams(question) & bigrams(f"{flow.get('business_name')}{_steps_text(flow)}{flow.get('required_docs') or ''}")
    score += min(len(overlap), 10) * 4
    return score


def score_rule(rule, question, terms):
    keyword = normalize(rule.get("keyword"))
    official = normalize(rule.get("official_term"))
    subcat = normalize(rule.get("subcategory"))
    content = normalize(rule.get("content"))
    q = normalize(question)
    score = 0
    for term in terms + [q]:
        t = normalize(term)
        if not t:
            continue
        if keyword and (keyword in t or t in keyword):
            score += 40
        if official and (official in t or t in official):
            score += 30
        if t in subcat:
            score += 15
        if len(t) <= 8 and t in content:
            score += 10
    overlap = bigrams(question) & bigrams(f"{rule.get('keyword')}{rule.get('subcategory')}{rule.get('content')}")
    score += min(len(overlap), 10) * 3
    return score


def retrieve(question, flows, rules, synonyms):
    """回傳 {terms, flows: [(score, flow)], rules: [(score, rule)]}，皆已依分數排序並過濾"""
    terms = expand_terms(question, synonyms)
    scored_rules = sorted(((score_rule(r, question, terms), r) for r in rules), key=lambda x: -x[0])
    scored_rules = [(s, r) for s, r in scored_rules if s >= MIN_SCORE][:TOP_RULES]
    matched_rule_ids = {r.get("id") for _, r in scored_rules}

    scored_flows = []
    for f in flows:
        s = score_flow(f, question, terms)
        if f.get("related_kb_id") in matched_rule_ids:
            s += 30  # 命中的規章有對應的申辦流程
        scored_flows.append((s, f))
    scored_flows = sorted(scored_flows, key=lambda x: -x[0])
    scored_flows = [(s, f) for s, f in scored_flows if s >= MIN_SCORE][:TOP_FLOWS]
    return {"terms": terms, "flows": scored_flows, "rules": scored_rules}


def local_answer(flows, rules):
    """沒有 Claude 時的回答：直接整理檢索結果"""
    if not flows and not rules:
        return "資料庫裡沒有找到相符的申辦流程。可以換個說法再問一次，或直接洽詢下方處室。"
    parts = []
    if flows:
        main = flows[0]
        parts.append(f"你可能要辦理「{main['business_name']}」，由{main.get('category_name') or '承辦單位'}受理"
                     f"（{main.get('office_location') or '地點請洽承辦單位'}，{main.get('contact_phone') or ''}）。")
        if main.get("deadline_week_info"):
            parts.append(f"受理期間：{main['deadline_week_info']}。")
        if len(flows) > 1:
            parts.append("另外也可能和這些有關：" + "、".join(f"「{f['business_name']}」" for f in flows[1:]) + "。")
    if rules:
        parts.append(f"相關規定可參考《{rules[0].get('doc_name')}》。")
    parts.append("詳細步驟與要準備的文件請看下方。")
    return "".join(parts)
