"""教師專長查詢的純邏輯：關鍵字擴充 (同義詞) 與比對評分，不碰資料庫與 Flask。"""
import re

# 領域分類 (前台篩選用)；教師可屬於多個領域
FIELDS = (
    "資訊科技", "人工智慧與資料分析", "資訊安全與網路", "數位媒體與動畫",
    "護理與健康照護", "長期照護", "幼兒教育與保育", "視光與眼科保健",
    "企業管理與行銷", "語言與外語教學", "通識與人文社會",
)

# 學生常用說法 → 專長標籤的寫法；查詢時一併比對
SYNONYMS = {
    "ai": ["人工智慧", "機器學習", "深度學習"],
    "人工智慧": ["機器學習", "深度學習"],
    "大數據": ["資料分析", "資料探勘"],
    "數據": ["資料分析", "統計"],
    "資安": ["資訊安全", "網路安全", "滲透測試"],
    "駭客": ["資訊安全", "滲透測試"],
    "app": ["行動應用"],
    "手機": ["行動應用"],
    "網頁": ["網頁開發", "前端"],
    "網站": ["網頁開發"],
    "資料庫": ["sql", "資料庫設計"],
    "長照": ["長期照護", "老人護理"],
    "老人": ["老人護理", "長期照護"],
    "英文": ["英語", "多益", "商務英文"],
    "托福": ["英語"],
    "行銷": ["電子商務", "企業管理"],
    "統計": ["統計學", "研究方法"],
    "專題": [],
}

MAX_TAG_LEN = 30
MAX_TAGS = 12


def split_tags(value):
    """「機器學習, Python、學習分析」→ ['機器學習', 'Python', '學習分析']"""
    parts = re.split(r"[,，、;；\n]+", str(value or ""))
    seen, tags = set(), []
    for p in parts:
        t = p.strip()[:MAX_TAG_LEN]
        if t and t.lower() not in seen:
            seen.add(t.lower())
            tags.append(t)
    return tags[:MAX_TAGS]


def expand_terms(query):
    """查詢字串 → [(詞, 是否為同義詞擴充)]"""
    terms = []
    for token in re.split(r"[\s,，、]+", str(query or "").strip().lower()):
        if not token:
            continue
        terms.append((token, False))
        for key, extra in SYNONYMS.items():
            if key == token or (len(key) >= 2 and key in token):
                terms.extend((e.lower(), True) for e in extra)
    # 去除重複，原始詞優先
    seen, result = set(), []
    for t, expanded in terms:
        if t not in seen:
            seen.add(t)
            result.append((t, expanded))
    return result


def score_profile(profile, terms):
    """回傳 (分數, 命中的專長標籤)；分數 0 代表不相關"""
    if not terms:
        return 1, []
    name = profile["name"].lower()
    tags = [t.lower() for t in profile["expertise"]]
    fields = [f.lower() for f in profile["fields"]]
    summary = (profile.get("research_summary") or "").lower()
    courses = " ".join(profile.get("courses", [])).lower()

    score, matched = 0, []
    for term, expanded in terms:
        weight = 0.6 if expanded else 1.0
        if term == name or term in name:
            score += 100 * weight
        for original, tag in zip(profile["expertise"], tags):
            if term == tag:
                score += 60 * weight
                matched.append(original)
            elif term in tag or (len(tag) >= 2 and tag in term):
                score += 40 * weight
                matched.append(original)
        if any(term in f for f in fields):
            score += 30 * weight
        if term in courses:
            score += 20 * weight
        if term in summary:
            score += 15 * weight
    return round(score, 1), list(dict.fromkeys(matched))
