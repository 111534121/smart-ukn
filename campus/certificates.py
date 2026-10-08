"""證照、比賽獎狀與作品集上傳：學生上傳 → 班導確認後才算數 → 同年級持有人數統計。

通過審核的證照會同步加入畢業門檻儀表板使用的證照資料 (deps.certificates)。
"""
from flask import Blueprint, request

from .common import deps, error, ok, require, store, next_id, now_str, current_user, find_student, all_students

bp = Blueprint("campus_certs", __name__)

KINDS = ("證照", "競賽", "作品")
MAX_FILES = 4

# 可抵免學分的證照門檻：對應校規法規知識庫「語言證照抵免辦法」的既有條文，
# match_keywords 命中其一即視為持有該類證照；之後若有更多抵免規則，照同樣格式往下加即可。
CERT_EXEMPTION_RULES = [
    {
        "id": "toeic550", "match_keywords": ["多益", "TOEIC"], "label": "多益 (TOEIC) 550 分以上",
        "exempts_course": "基礎英文(一)、基礎英文(二)", "credits": 4, "office": "教務處註冊組",
        "note": "通過全民英檢中高級、多益 550 分以上或同等國際英語檢定標準者，得申請抵免。",
    },
    {
        "id": "gept_mid", "match_keywords": ["全民英檢", "GEPT"], "label": "全民英檢 (GEPT) 中高級複試通過",
        "exempts_course": "基礎英文(一)、基礎英文(二)", "credits": 4, "office": "教務處註冊組",
        "note": "通過全民英檢中高級、多益 550 分以上或同等國際英語檢定標準者，得申請抵免。",
    },
]


def exemption_reminder(student_id):
    """回傳這位學生「還沒有，但考到可以抵免學分」的證照清單；已持有同一條規則的證照就不再提醒"""
    held = [i["name"] for i in submissions() if i["student_id"] == student_id and i["status"] == "已通過"]
    reminders = []
    for rule in CERT_EXEMPTION_RULES:
        already = any(kw in name for name in held for kw in rule["match_keywords"])
        if not already:
            reminders.append({k: v for k, v in rule.items() if k != "match_keywords"})
    return reminders


def submissions():
    def seed():
        # 既有證照資料視為已審核通過
        items = []
        for c in deps.certificates:
            stu = find_student(c["student_id"]) or {}
            items.append({
                "id": len(items) + 1, "student_id": c["student_id"], "student_name": stu.get("full_name", ""),
                "class_name": stu.get("class_name", ""), "admission_year": stu.get("admission_year"),
                "kind": "證照", "name": c["cert_name"], "issuer": c.get("issuing_org", ""),
                "number": c.get("cert_number", ""), "issue_date": c.get("issue_date", ""), "award": "",
                "description": "", "files": [], "status": "已通過", "reviewer": "系統匯入", "review_note": "",
                "created_at": f"{c.get('issue_date', '')} 00:00:00", "reviewed_at": now_str(),
            })
        return items
    return store.section("cert_submissions", seed)


def sync_to_graduation(item):
    """審核通過的證照加入畢業門檻計算用的資料 (記憶體示範資料)"""
    if item["kind"] != "證照" or item["status"] != "已通過":
        return
    if any(c["student_id"] == item["student_id"] and c["cert_name"] == item["name"] for c in deps.certificates):
        return
    deps.certificates.append({
        "cert_id": max((c["cert_id"] for c in deps.certificates), default=0) + 1,
        "student_id": item["student_id"], "cert_name": item["name"], "issuing_org": item["issuer"],
        "cert_number": item["number"], "theory_score": None, "practical_score": None,
        "cert_status": "及格發證", "issue_date": item["issue_date"],
    })


def init_sync():
    for item in submissions():
        sync_to_graduation(item)


def can_review(u, item):
    if u["role"] in ("管理員", "教職員"):
        return True
    return u["role"] == "老師" and u.get("advised_class") and u["advised_class"] == item["class_name"]


@bp.route("/api/campus/certs/mine", methods=["GET"])
@require("學生", "家長")
def my_certs():
    sid = current_user()["student_id"]
    items = [i for i in submissions() if i["student_id"] == sid]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ok(data=items)


@bp.route("/api/campus/certs", methods=["POST"])
@require("學生")
def create_cert():
    u = current_user()
    form = request.form
    kind = form.get("kind", "證照")
    name = form.get("name", "").strip()[:80]
    if kind not in KINDS:
        return error("類別只能是證照、競賽或作品")
    if not name:
        return error("請填寫名稱")
    files = request.files.getlist("files")[:MAX_FILES]
    saved = []
    for f in files:
        if not f or not f.filename:
            continue
        url, original, ftype = deps.save_uploaded_file(f, prefix=f"cert_{u['student_id']}")
        if not url:
            return error(f"檔案格式不支援：{f.filename}（僅限 PDF、PNG、JPG、WEBP）")
        saved.append({"url": url, "name": original, "type": ftype})
    if kind != "作品" and not saved:
        return error("請上傳證書或獎狀的照片 / PDF，班導才能確認")
    stu = find_student(u["student_id"]) or {}
    with store.lock:
        items = submissions()
        item = {
            "id": next_id(items), "student_id": u["student_id"], "student_name": u["full_name"],
            "class_name": stu.get("class_name") or u["class_name"], "admission_year": stu.get("admission_year"),
            "kind": kind, "name": name, "issuer": form.get("issuer", "").strip()[:80],
            "number": form.get("number", "").strip()[:60], "issue_date": form.get("issue_date", "").strip()[:10],
            "award": form.get("award", "").strip()[:60], "description": form.get("description", "").strip()[:500],
            "files": saved, "status": "待審核", "reviewer": "", "review_note": "", "created_at": now_str(),
            "reviewed_at": "",
        }
        items.append(item)
        store.save()
    return ok(message="已送出，等班導確認後就會列入紀錄", data=item)


@bp.route("/api/campus/certs/<int:item_id>", methods=["DELETE"])
@require("學生")
def delete_cert(item_id):
    u = current_user()
    with store.lock:
        items = submissions()
        item = next((i for i in items if i["id"] == item_id), None)
        if not item or item["student_id"] != u["student_id"]:
            return error("找不到這筆資料", 404)
        if item["status"] == "已通過":
            return error("已通過審核的紀錄不能自行刪除，請洽班導", 403)
        items.remove(item)
        store.save()
    return ok(message="已刪除")


@bp.route("/api/campus/certs/review", methods=["GET"])
@require("老師", "教職員", "管理員")
def review_list():
    u = current_user()
    status = request.args.get("status", "待審核")
    items = [i for i in submissions() if can_review(u, i) and (status == "全部" or i["status"] == status)]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ok(data=items, scope=u.get("advised_class") if u["role"] == "老師" else "全校")


@bp.route("/api/campus/certs/<int:item_id>/review", methods=["POST"])
@require("老師", "教職員", "管理員")
def review(item_id):
    u = current_user()
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    if action not in ("approve", "reject"):
        return error("action 只能是 approve 或 reject")
    note = str(data.get("note", "")).strip()[:200]
    if action == "reject" and not note:
        return error("退回時請寫下原因，學生才知道要補什麼")
    with store.lock:
        item = next((i for i in submissions() if i["id"] == item_id), None)
        if not item:
            return error("找不到這筆資料", 404)
        if not can_review(u, item):
            return error("只有該班導師可以確認", 403)
        before = {"name": item.get("name"), "student_id": item.get("student_id"), "status": item["status"]}
        item["status"] = "已通過" if action == "approve" else "已退回"
        item["reviewer"] = u["full_name"]
        item["review_note"] = note
        item["reviewed_at"] = now_str()
        store.save()
    deps.write_audit_log("cert_submissions", item_id, "修改", before=before,
                         after={**before, "status": item["status"], "review_note": note})
    sync_to_graduation(item)
    return ok(message="已確認" if action == "approve" else "已退回", data=item)


@bp.route("/api/campus/certs/exemption-reminder", methods=["GET"])
@require("學生")
def exemption_reminder_route():
    """提醒：現在有管道可以考、考到能申請學分抵免的證照（只列出還沒持有的）"""
    sid = current_user()["student_id"]
    return ok(data=exemption_reminder(sid))


@bp.route("/api/campus/certs/stats", methods=["GET"])
def stats():
    """同年級 (同一入學年度) 各證照的持有人數；只計算已通過審核的"""
    u = current_user()
    year = request.args.get("admission_year", type=int)
    if not year and u and u.get("student_id"):
        year = (find_student(u["student_id"]) or {}).get("admission_year")
    students = [s for s in all_students() if not year or s.get("admission_year") == year]
    sids = {s["student_id"] for s in students}
    approved = [i for i in submissions() if i["status"] == "已通過" and i["student_id"] in sids]
    per_cert = {}
    for kind in KINDS:
        per_cert[kind] = {}
    for i in approved:
        per_cert[i["kind"]].setdefault(i["name"], set()).add(i["student_id"])
    mine = set()
    if u and u.get("student_id"):
        mine = {i["name"] for i in approved if i["student_id"] == u["student_id"]}
    total = len(sids)

    def rows(kind):
        return sorted(({"name": n, "holders": len(s), "percent": round(len(s) / total * 100, 1) if total else 0,
                        "mine": n in mine} for n, s in per_cert[kind].items()), key=lambda r: -r["holders"])

    return ok(admission_year=year, cohort_size=total, certificates=rows("證照"), competitions=rows("競賽"),
              pending_count=sum(1 for i in submissions() if i["status"] == "待審核" and i["student_id"] in sids))
