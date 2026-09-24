"""
畢業缺課檢核：把學生的及格成績對照該屆修業科目表 (curriculum/<dept_id>_<入學年>.json)

- 每筆及格成績依課名分配到必修項目 (課名完全相同 / aliases 優先，其次 contains 關鍵字最長者)，
  學分填滿該項目後溢出的才算選修；同名必修出現兩次 (例如院定與專業必修的管理學) 依序填入
- 沒分配到必修的及格課程算選修：科內選修全計，跨科選修最多 cross_dept_elective_cap 學分
- 本學期課表上的課視為修課中
純函式，不碰資料庫與 Flask。
"""
import json
import os
import re

CURRICULUM_DIR = os.path.dirname(os.path.abspath(__file__))


def load_curriculum(dept_id, admission_year):
    path = os.path.join(CURRICULUM_DIR, f"{dept_id}_{admission_year}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def normalize(name):
    name = (name or "").replace("（", "(").replace("）", ")")
    return re.sub(r"[\s\-─－]", "", name).upper()


def _match_length(req, name):
    """課名符合此必修項目時回傳比對長度 (完全相同給最高分)，不符合回傳 0"""
    n = normalize(name)
    if n in {normalize(req["name"])} | {normalize(a) for a in req.get("aliases", [])}:
        return 1000
    return max((len(k) for k in req.get("contains", []) if normalize(k) in n), default=0)


def _best_requirement(reqs, name, need_room):
    """找最符合的必修項目；need_room 為 True 時只找還沒修滿的"""
    best, best_len = None, 0
    for r in reqs:
        length = _match_length(r, name)
        if length > best_len and (not need_room or not _is_complete(r)):
            best, best_len = r, length
    return best


def _is_complete(r):
    if r["credits"] == 0:
        return r["passes"] >= r.get("min_passes", 1)
    return r["earned"] >= r["credits"]


def audit(curriculum, passed_courses, current_courses, current_term):
    """
    passed_courses：[{course_name, credits, semester}] 及格的修課紀錄
    current_courses：本學期課表上的課名
    current_term：目前學期 "115-1"
    """
    reqs = [{**r, "earned": 0, "passes": 0, "matched": []} for r in curriculum["required"]]
    elective_names = {normalize(e["name"]): e for e in curriculum.get("electives", [])}
    in_dept_electives, cross_dept_electives = [], []

    for c in sorted(passed_courses, key=lambda c: c["semester"]):
        req = _best_requirement(reqs, c["course_name"], need_room=True)
        if req:
            req["earned"] += c["credits"]
            req["passes"] += 1
            req["matched"].append({"course_name": c["course_name"], "semester": c["semester"], "credits": c["credits"]})
        elif c["credits"] > 0 and not _best_requirement(reqs, c["course_name"], need_room=False):
            target = in_dept_electives if normalize(c["course_name"]) in elective_names else cross_dept_electives
            target.append({"course_name": c["course_name"], "semester": c["semester"], "credits": c["credits"]})

    skip = [normalize(s) for s in curriculum.get("non_credit_activities", [])]
    current = [n for n in dict.fromkeys(current_courses) if not any(s in normalize(n) for s in skip)]
    elective_in_progress = []
    for name in current:
        req = _best_requirement(reqs, name, need_room=True)
        if req:
            req["in_progress"] = True
        elif not _best_requirement(reqs, name, need_room=False):
            e = elective_names.get(normalize(name))
            elective_in_progress.append({"course_name": name, "credits": e["credits"] if e else None, "cross_dept": e is None})

    for r in reqs:
        if _is_complete(r):
            r["status"] = "passed"
        elif r.get("in_progress"):
            r["status"] = "in_progress"
        elif r["term"] >= current_term:
            r["status"] = "planned"
        else:
            r["status"] = "missing"
        r["remaining"] = max(0, r["credits"] - r["earned"])

    cap = curriculum.get("cross_dept_elective_cap", 0)
    in_dept = sum(e["credits"] for e in in_dept_electives)
    cross = sum(e["credits"] for e in cross_dept_electives)
    elective_earned = in_dept + min(cross, cap)
    required_earned = sum(min(r["earned"], r["credits"]) for r in reqs)

    categories = {}
    for r in reqs:
        cat = categories.setdefault(r["category"], {"category": r["category"], "credits": 0, "earned": 0, "done": 0, "count": 0})
        cat["credits"] += r["credits"]
        cat["earned"] += min(r["earned"], r["credits"])
        cat["count"] += 1
        cat["done"] += r["status"] == "passed"

    return {
        "title": curriculum["title"],
        "source_url": curriculum.get("source_url"),
        "current_term": current_term,
        "total": {"required": curriculum["total_credits"], "earned": required_earned + elective_earned},
        "required": {"required": curriculum["required_credits"], "earned": required_earned},
        "elective": {
            "required": curriculum["elective_credits"], "earned": elective_earned,
            "in_dept": in_dept_electives, "cross_dept": cross_dept_electives,
            "cross_dept_earned": cross, "cross_dept_cap": cap, "in_progress": elective_in_progress,
        },
        "categories": list(categories.values()),
        "requirements": [{k: r[k] for k in ("category", "name", "credits", "term", "earned", "remaining", "status", "matched")} for r in reqs],
    }
