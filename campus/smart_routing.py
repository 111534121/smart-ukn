"""Conservative, explainable routing for existing campus case workflows."""
import re

RULES = (
    (('宿舍', '住宿', '床位', '退宿', '換房'), ('住宿異動申請', '住宿生活事項申辦')),
    (('報修', '故障', '冷氣', '熱水器', '設備壞'), ('設備報修申請（事務組）', '設備報修申請')),
    (('成績單', '在學證明', '學籍證明'), ('學籍證明申請（註冊組）', '學籍證明申請')),
    (('課表', '選課', '加退選', '停修', '棄修', '衝堂'), ('課務異動諮詢（課務組）', '課務異動諮詢')),
    (('實習', '證照', '專題', '科務'), ('資訊管理科（五專）資料收件', '資訊管理科（五專）科務申辦')),
)


def predict(title, detail, workflows, role, dept_id=None):
    text = re.sub(r'\s+', '', f'{title} {detail}').lower()
    scores = []
    for words, kinds in RULES:
        hits = [word for word in words if word in text]
        if not hits:
            continue
        for kind in kinds:
            spec = workflows.get(kind)
            if not spec or role not in spec.get('roles', ()):
                continue
            if '資訊管理科' in spec['office'] and dept_id != 'CS':
                continue
            scores.append((len(hits), len(kind), kind, hits))
            break
    if not scores:
        return {'kind': None, 'office': None, 'confidence': 'none', 'reason': '內容未對應到既有申辦流程'}
    scores.sort(reverse=True)
    if len(scores) > 1 and scores[0][0] == scores[1][0]:
        return {'kind': None, 'office': None, 'confidence': 'low', 'reason': '同時符合多個處室，請人工選擇類別'}
    _, _, kind, hits = scores[0]
    return {'kind': kind, 'office': workflows[kind]['office'], 'confidence': 'high',
            'reason': '辨識到「' + '、'.join(hits[:3]) + '」；請送件前確認類別與承辦處室'}
