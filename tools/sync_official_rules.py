"""把 campus/official_rules.py 的規章知識庫與口語同義詞補進 MySQL (knowledge_base / synonym_dictionary)。

重複執行不會出錯，也不會蓋掉管理員在後台改過或新增的資料：
- 1-5 號只有內容仍是舊版示範文字時才換成官網法規版本
- 其他規章：同名 (official_term) 不存在才新增
- 舊示範同義詞指向已改名的規章時改指新名稱；口語詞不存在才新增
- 申辦流程「畢業學分資格預審」原本對應到擋修 (4 號)，改對應畢業資格 (18 號)

用法：python tools/sync_official_rules.py
"""
import os
import sys

import mysql.connector

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from campus.official_rules import OFFICIAL_RULES, OFFICIAL_SYNONYMS  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "smart_ukn"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "charset": "utf8mb4",
}

# 舊版示範規章的開頭文字 (內容沒有官方出處)
OLD_DEMO_PREFIXES = {
    1: "學生於加退選截止後，因特殊原因無法繼續修習某門課程",
    2: "學生因病無法到校上課，應於請假日當日起 3 日內",
    3: "學生取得多益測驗 (TOEIC) 550 分以上",
    4: ("本校各科系必修課程若訂有先修科目限制", "本校各系所必修課程若訂有先修科目限制"),
    5: "學生在學期間取得教育部認可之乙級以上技術士證照",
}
# 舊示範同義詞指向的規章名稱 → 新名稱
RENAMED_TERMS = {
    "停修": "課程棄選(停修)規定", "停修課程辦理規定": "課程棄選(停修)規定",
    "學生請假規定": "學生請假辦法", "學生請假規則": "學生請假辦法",
    "語言證照抵免": "外語課程學分抵免", "語言證照抵免辦法": "外語課程學分抵免",
    "先修科目未通過": "先修科目規定", "先修科目未通過擋修規定": "先修科目規定",
    "學生取得專業證照獎勵辦法": "學生取得專業證照獎勵",
    "學業成績退學規定": "學期成績不及格處理", "學業退學規定": "學期成績不及格處理",
    "暑期開班授課規定": "重補修與寒暑修規定",
}
KB_FIELDS = ("category_id", "subcategory", "keyword", "official_term", "content", "doc_name", "page", "url")


def main():
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, official_term, content FROM knowledge_base")
    existing = {r["id"]: r for r in cur.fetchall()}
    terms = {r["official_term"] for r in existing.values()}
    replaced = added = 0

    for rule in OFFICIAL_RULES:
        values = tuple(rule[k] for k in KB_FIELDS)
        old = existing.get(rule["id"])
        prefixes = OLD_DEMO_PREFIXES.get(rule["id"], ())
        if isinstance(prefixes, str):
            prefixes = (prefixes,)
        if old and any(str(old["content"]).startswith(p) for p in prefixes):
            cur.execute("UPDATE knowledge_base SET " + ", ".join(f"{k}=%s" for k in KB_FIELDS) + " WHERE id=%s", values + (rule["id"],))
            replaced += 1
        elif rule["official_term"] not in terms:
            if rule["id"] in existing:  # 編號被管理員新增的資料用掉了：改用自動編號
                cur.execute("INSERT INTO knowledge_base (" + ", ".join(KB_FIELDS) + ") VALUES (" + ", ".join(["%s"] * len(KB_FIELDS)) + ")", values)
            else:
                cur.execute("INSERT INTO knowledge_base (id, " + ", ".join(KB_FIELDS) + ") VALUES (" + ", ".join(["%s"] * (len(KB_FIELDS) + 1)) + ")",
                            (rule["id"],) + values)
            added += 1
        terms.add(rule["official_term"])

    for old_term, new_term in RENAMED_TERMS.items():
        cur.execute("UPDATE synonym_dictionary SET official_term = %s WHERE official_term = %s", (new_term, old_term))
    cur.execute("SELECT user_keyword FROM synonym_dictionary")
    words = {r["user_keyword"] for r in cur.fetchall()}
    new_words = 0
    for category_id, word, term in OFFICIAL_SYNONYMS:
        if word not in words:
            cur.execute("INSERT INTO synonym_dictionary (category_id, user_keyword, official_term) VALUES (%s, %s, %s)",
                        (category_id, word, term))
            words.add(word)
            new_words += 1

    cur.execute("UPDATE checklist_items SET related_kb_id = 18 WHERE form_download_url LIKE %s AND related_kb_id = 4",
                ("%graduation_audit_form%",))
    conn.commit()
    print(f"規章：更新舊示範 {replaced} 筆、新增 {added} 筆；同義詞新增 {new_words} 筆")
    conn.close()


if __name__ == "__main__":
    main()
