"""行事曆事項 →「點開後要辦什麼」的對應規則

依事項名稱關鍵字，對應到：
    checklist_id  行政申辦流程 (應備文件、步驟、承辦單位，來自 checklist_items / DEMO_CHECKLISTS)
    link_ids      學生專區連結 (網址來自 links.json，改網址不用改這裡)
    office        承辦單位 (聯絡資訊來自 CAMPUS_CONTACT_DIRECTORY)
    tip           一句提醒
一個事項可以符合多條規則，結果會合併。
"""
import re

ACTION_RULES = [
    {"pattern": r"加退選|重補修|初選|暑修.*選課",
     "link_ids": [2, 15], "office": "教務處課務組",
     "tip": "請在期間內登入網路選課系統完成選課，截止後無法再加選。"},
    {"pattern": r"棄選",
     "checklist_id": 1, "office": "教務處課務組",
     "tip": "棄選（停修）需任課老師、導師及科主任簽章，請預留跑流程的時間。"},
    {"pattern": r"學分抵免",
     "checklist_id": 3, "office": "通識教育中心",
     "tip": "外語證照抵免需在截止日前送出成績單正本與影本。"},
    {"pattern": r"提前畢業",
     "checklist_id": 4, "office": "教務處註冊組"},
    {"pattern": r"弱勢助學金|學雜費減免|學產基金|清寒",
     "link_ids": [7, 6], "office": "學務處生活輔導組",
     "tip": "先看學務處公告確認身分資格與應備證明，再到線上系統填寫申請。"},
    {"pattern": r"就學貸款",
     "link_ids": [6], "office": "學務處生活輔導組"},
    {"pattern": r"休學|退學|轉系|輔系|雙主修|註冊",
     "office": "教務處註冊組"},
    {"pattern": r"教學評量",
     "link_ids": [4],
     "tip": "教學評量填寫完成後才能在期末查詢成績。"},
    {"pattern": r"期中考試|期末考試|學期考試",
     "checklist_id": 2, "link_ids": [15],
     "tip": "考試期間因病缺考需請病假並附就醫證明，才能申請補考。"},
    {"pattern": r"住宿生|離宿|封宿",
     "link_ids": [13], "office": "學務處生活輔導組"},
]

_COMPILED = [(re.compile(r["pattern"]), r) for r in ACTION_RULES]


def match_actions(title):
    """回傳 {checklist_ids, link_ids, offices, tips}，都依規則順序去除重複"""
    result = {"checklist_ids": [], "link_ids": [], "offices": [], "tips": []}
    for regex, rule in _COMPILED:
        if not regex.search(title):
            continue
        for key, value in (("checklist_ids", rule.get("checklist_id")), ("offices", rule.get("office")),
                           ("tips", rule.get("tip"))):
            if value is not None and value not in result[key]:
                result[key].append(value)
        for lid in rule.get("link_ids", []):
            if lid not in result["link_ids"]:
                result["link_ids"].append(lid)
    return result
