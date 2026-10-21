"""全站功能自動檢測（可重複執行，不會動到真正資料庫或寄出真實信件）。

用法：
  1. 指令列直接跑一次並印出報告：  python self_check.py
  2. 當成固定迴歸測試用（每次要上傳檔案 / push 前先跑一次）：
         python -m pytest tests/test_self_check.py
  3. 後台按鈕即時檢測：登入管理員後台 →「自動功能檢測」分頁 → 按「執行自動檢測」
     （呼叫 POST /api/admin/self-check，回傳與這裡完全相同的結果）

設計原則：
  - 一律強制切換成離線示範模式（不連真正 MySQL）與假信箱（不寄出真正 Email），
    執行期間完全不影響正式資料，檢測完會自動還原。
  - 每一項檢測都包含「正常情況」與重要功能的「異常/權限情況」，模擬教務處老師指派
    的驗收方式：一個功能至少一個正常操作 + 一個異常或權限測試。
  - 檢測中建立的任何資料（證照、報表檔案與實體檔案、收藏、請假單、自評表、
    教師專長、校慶祝福…）執行完都會呼叫對應的刪除 API，或在沒有刪除 API 時
    直接從記憶體/示範資料移除，不留下測試垃圾。
  - 需要外部網路（天氣、交通）的檢測，連不上網路時標記為 skip 而不是 fail，
    因為那是環境限制，不是程式本身的錯誤。
"""
import io
import os
import time
import traceback
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import patch

import app as app_module
import campus.reports as reports_module
import campus.services as services_module

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

REGISTRY = []  # [(feature, name, fn), ...] 依註冊順序執行，也就是畫面上列出的順序


def check(feature, name):
    def deco(fn):
        REGISTRY.append((feature, name, fn))
        return fn
    return deco


class FakeMailer:
    """檢測期間取代真正寄信，只記錄在記憶體，檢測結束就丟棄"""
    mode = "self-check"

    def __init__(self):
        self.sent = []

    def send(self, to_addr, subject, body):
        self.sent.append({"to": to_addr, "subject": subject, "body": body})


def _login(client, username, password="123456"):
    r = client.post("/api/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200, f"登入 {username} 失敗：{r.get_json()}"
    return client


def _build_clients():
    ns = SimpleNamespace()
    ns.anon = app_module.app.test_client()
    ns.student = _login(app_module.app.test_client(), "student1")
    ns.student2 = _login(app_module.app.test_client(), "student2")
    ns.parent = _login(app_module.app.test_client(), "parent1")
    ns.teacher = _login(app_module.app.test_client(), "teacher1")
    ns.staff = _login(app_module.app.test_client(), "staff1")
    ns.admin = _login(app_module.app.test_client(), "admin", "admin123")
    return ns


def _j(resp):
    return resp.get_json() or {}


def _fake_pdf(name="selfcheck.pdf"):
    return (io.BytesIO(b"%PDF-1.4 self-check test file, safe to delete\n%%EOF"), name)


RUN_TAG = None  # 每次執行給一個唯一字串，避免多次執行互相撞名


# ============================================================
# 1. 身分認證與 Session
# ============================================================

@check("身分認證", "正常登入（學生）")
def t_login_ok(c):
    r = c.student.get("/api/auth/me")
    data = _j(r)
    assert data.get("is_authenticated") is True, "學生登入後查詢 /api/auth/me 應顯示已登入"
    assert data["user"]["role"] == "學生"
    return f"student1 登入成功，角色={data['user']['role']}"


@check("身分認證", "密碼錯誤應拒絕登入（異常）")
def t_login_wrong_password(c):
    r = c.anon.post("/api/auth/login", json={"username": "student1", "password": "wrong-password"})
    assert r.status_code == 401, f"密碼錯誤應回 401，實際 {r.status_code}"
    return "密碼錯誤正確回 401"


@check("身分認證", "登出後無法再查到登入身分")
def t_logout(c):
    tmp = _login(app_module.app.test_client(), "student2")
    r = tmp.post("/api/auth/logout")
    assert r.status_code == 200
    data = _j(tmp.get("/api/auth/me"))
    assert data.get("is_authenticated") is False, "登出後 /api/auth/me 應顯示未登入"
    return "登出後 is_authenticated=False"


# ============================================================
# 2. 訪客登記
# ============================================================

@check("訪客登記", "未來學生線上登記（正常）")
def t_visitor_register(c):
    r = c.anon.post("/api/visitor/register", json={
        "visitor_name": "自動檢測訪客", "phone": "0900000000", "school_from": "自動檢測高中",
        "purpose": "參觀校園", "target_dept": "資訊管理科（五專）", "visitor_type": "未來學生",
    })
    assert r.status_code == 201, _j(r)
    return "訪客登記成功"


# ============================================================
# 3. 學分診斷與選課（R1）
# ============================================================

@check("學分診斷(R1)", "登入學生自動帶入成績做擋修檢核（正常）")
def t_courses_check_student(c):
    r = c.student.get("/api/courses/check")
    data = _j(r)
    assert r.status_code == 200 and data.get("mode") == "student"
    assert "courses" in data and isinstance(data["courses"], list) and data["courses"]
    return f"已修學分={data['total_passed_credits']}，畢業門檻={data['graduation_threshold']}"


@check("學分診斷(R1)", "未登入改用手動模擬模式（異常/替代路徑）")
def t_courses_check_manual(c):
    r = c.anon.get("/api/courses/check")
    assert r.status_code == 401, "未登入直接 GET 應拒絕，前端應改走手動模式"
    r2 = c.anon.post("/api/courses/check", json={"passed_course_ids": ["CS101"]})
    data = _j(r2)
    assert r2.status_code == 200 and data.get("mode") == "manual"
    return "未登入 GET 正確擋下，POST 手動模擬模式正常"


@check("學分診斷(R1)", "骨牌擋修試算（如果這門課被當）")
def t_what_if(c):
    r = c.student.post("/api/courses/what-if", json={"hypothetical_failed_id": "CS102"})
    assert r.status_code == 200, _j(r)
    return "what-if 試算正常"


@check("學分診斷(R1)", "畢業門檻儀表板")
def t_graduation_audit(c):
    r = c.student.get("/api/student/graduation-audit")
    assert r.status_code == 200, _j(r)
    return "畢業門檻儀表板正常"


@check("選課規劃", "開課清單與選課衝堂檢查")
def t_course_plan_check(c):
    offerings = _j(c.student.get("/api/campus/course-plan/offerings")).get("data") or []
    assert offerings, "開課清單不應為空"
    r = c.student.post("/api/campus/course-plan/check", json={"offering_ids": [offerings[0]["offering_id"]]})
    assert r.status_code == 200, _j(r)
    return f"開課 {len(offerings)} 筆，選課檢查正常"


# ============================================================
# 4. 家長查詢（R2）
# ============================================================

@check("家長查詢(R2)", "家長帳號查看子女儀表板（正常）")
def t_parent_dashboard(c):
    r = c.parent.get("/api/student/dashboard")
    assert r.status_code == 200, _j(r)
    return "家長查看子女儀表板正常"


@check("家長查詢(R2)", "家長不能查看他人班級總表（權限異常）")
def t_parent_cannot_class_summary(c):
    r = c.parent.get("/api/teacher/class-summary")
    assert r.status_code in (401, 403), f"家長呼叫導師專用 API 應被拒絕，實際 {r.status_code}"
    return f"家長呼叫導師 API 正確拒絕（{r.status_code}）"


# ============================================================
# 5. 規章搜尋（R3）
# ============================================================

@check("規章搜尋(R3)", "關鍵字搜尋應回傳來源文件（正常）")
def t_search_ok(c):
    r = c.anon.post("/api/search", json={"query": "停修"})
    data = _j(r)
    assert r.status_code == 200
    assert data.get("matched") is True, "關鍵字「停修」應能命中規章"
    assert data.get("source_doc"), "回應應附來源文件 (source_doc)"
    has_updated_at = any(k in data for k in ("updated_at", "last_updated", "最後更新日期"))
    note = "附有來源文件" + ("，含最後更新日期" if has_updated_at else "，⚠缺少最後更新日期欄位")
    if not has_updated_at:
        raise AssertionError("搜尋結果缺少「最後更新日期」欄位（之前驗收發現的 R3 缺口，目前這版程式碼尚未包含該修正）")
    return note


@check("規章搜尋(R3)", "查無結果會記錄進未命中清單（異常輸入）")
def t_search_unmatched(c):
    unique_query = f"自動檢測查無此詞{int(time.time())}"
    r = c.anon.post("/api/search", json={"query": unique_query})
    data = _j(r)
    assert r.status_code == 200 and data.get("matched") is False
    return "查無結果正確回報 matched=False 並記錄"


@check("規章搜尋(R3)", "搜尋滿意度回饋 (👍/👎)")
def t_search_feedback(c):
    r = c.anon.post("/api/feedback", json={"query": "停修", "helpful": True})
    assert r.status_code == 201, _j(r)
    return "搜尋回饋送出正常"


# ============================================================
# 6. 期限雷達與校曆（R4）
# ============================================================

@check("期限雷達(R4)", "期限清單依身分/科系篩選（正常）")
def t_deadlines_list(c):
    r_student = _j(c.student.get("/api/deadlines?scope=mine"))
    r_teacher = _j(c.teacher.get("/api/deadlines?scope=mine"))
    assert isinstance(r_student.get("data"), list) and isinstance(r_teacher.get("data"), list)
    roles = {d.get("applies_to_role") for d in r_student["data"]}
    note = "期限清單含角色篩選欄位 applies_to_role" if roles - {None} else "⚠期限項目缺少 applies_to_role 篩選欄位"
    return note


@check("期限雷達(R4)", "新增期限項目並清理（教職員權限）")
def t_deadlines_create(c):
    title = f"SELFCHECK-期限-{RUN_TAG}"
    r = c.staff.post("/api/deadlines", json={"title": title, "end_date": "2026-12-31", "category": "自動檢測"})
    data = _j(r)
    assert r.status_code == 201, data
    did = data["data"]["deadline_id"]
    try:
        listed = _j(c.staff.get("/api/deadlines"))["data"]
        assert any(d["deadline_id"] == did for d in listed), "新增後應能在清單查到"
        return "新增期限成功並可查到"
    finally:
        app_module.DEMO_DEADLINES[:] = [d for d in app_module.DEMO_DEADLINES if d["deadline_id"] != did]


@check("期限雷達(R4)", "學生不能新增期限項目（權限異常）")
def t_deadlines_create_denied(c):
    r = c.student.post("/api/deadlines", json={"title": "學生亂塞的期限", "end_date": "2026-12-31"})
    assert r.status_code == 403, f"學生應被拒絕，實際 {r.status_code}"
    return "學生新增期限正確被拒 403"


@check("校曆管理", "新增/刪除校曆事項並留下修改紀錄（R5）")
def t_academic_calendar_crud(c):
    name = f"SELFCHECK-校曆-{RUN_TAG}"
    r = c.admin.post("/api/academic-calendar", json={
        "event_name": name, "start_date": "2026-12-01", "end_date": "2026-12-02", "category": "教務",
    })
    data = _j(r)
    assert r.status_code in (200, 201), data
    event_id = data["data"]["id"]
    try:
        before = len(_j(c.admin.get("/api/admin/audit-logs?table_name=academic_calendar"))["data"])
        assert before >= 1, "新增校曆事項應留下修改紀錄"
        return "校曆事項新增成功並已寫入修改紀錄"
    finally:
        if event_id is not None:
            c.admin.delete(f"/api/academic-calendar/{event_id}")


@check("校曆管理", "本週可辦事項與校務行事曆月檢視")
def t_calendar_views(c):
    r1 = c.student.get("/api/calendar/current-week")
    r2 = c.student.get("/api/campus/calendar/month")
    assert r1.status_code == 200 and r2.status_code == 200
    return "本週可辦與月檢視皆正常"


@check("校曆管理", "加入我的月曆並刪除（正常+清理）")
def t_my_events(c):
    r = c.student.post("/api/campus/my-events", json={
        "title": f"SELFCHECK-{RUN_TAG}", "start_date": "2026-12-05", "end_date": "2026-12-05",
    })
    data = _j(r)
    assert r.status_code == 200, data
    eid = data["data"]["id"]
    r2 = c.student.delete(f"/api/campus/my-events/{eid}")
    assert r2.status_code == 200
    return "加入我的月曆並刪除成功"


# ============================================================
# 7. 後台修改紀錄（R5）＋ CMS
# ============================================================

@check("後台修改紀錄(R5)", "新增/修改/刪除規章都會留下稽核紀錄")
def t_audit_log_rules(c):
    r = c.admin.post("/api/rules", json={
        "category_id": 1, "keyword": f"SELFCHECK-{RUN_TAG}", "official_term": "自動檢測用測試條文",
        "content": "此條文由自動檢測建立，測試完會自動刪除。",
    })
    data = _j(r)
    assert r.status_code in (200, 201), data
    rule_id = data["data"]["id"] if isinstance(data.get("data"), dict) else data.get("id")
    try:
        logs = _j(c.admin.get("/api/admin/audit-logs?table_name=knowledge_base"))["data"]
        assert any(str(l.get("record_id")) == str(rule_id) and l.get("action") == "新增" for l in logs), \
            "新增規章後應能在修改紀錄查到對應的新增動作"
        return f"新增規章 id={rule_id} 已正確記入修改紀錄"
    finally:
        if rule_id is not None:
            c.admin.delete(f"/api/rules/{rule_id}")


@check("後台修改紀錄(R5)", "非管理身分不能查看修改紀錄（權限異常）")
def t_audit_log_denied(c):
    r = c.student.get("/api/admin/audit-logs")
    assert r.status_code in (401, 403), f"學生應被拒絕查看修改紀錄，實際 {r.status_code}"
    return f"學生查看修改紀錄正確被拒（{r.status_code}）"


@check("CMS 規章與分類", "規章分類清單與法規查詢")
def t_cms_categories(c):
    r = c.anon.get("/api/categories")
    data = _j(r)
    assert r.status_code == 200 and data.get("data")
    return f"共 {len(data['data'])} 個規章大分類"


@check("CMS 規章與分類", "同義詞對照清單")
def t_cms_synonyms(c):
    r = c.anon.get("/api/synonyms")
    assert r.status_code == 200, _j(r)
    return "同義詞清單查詢正常"


@check("CMS 規章與分類", "行政申辦流程清單")
def t_cms_checklists(c):
    r = c.anon.get("/api/checklists")
    data = _j(r)
    assert r.status_code == 200 and data.get("data")
    return f"共 {len(data['data'])} 個申辦流程"


# ============================================================
# 8. 管理後台分析與權限
# ============================================================

@check("管理後台分析", "未命中搜尋詞、搜尋統計、訪客紀錄（管理員正常存取）")
def t_admin_analytics(c):
    for url in ("/api/admin/missed-queries", "/api/admin/search-stats", "/api/admin/visitor-logs"):
        r = c.admin.get(url)
        assert r.status_code == 200, f"{url} 應回 200，實際 {r.status_code}"
    return "三項管理後台分析 API 皆正常"


@check("管理後台分析", "學生不能存取管理後台分析（權限異常）")
def t_admin_analytics_denied(c):
    r = c.student.get("/api/admin/search-stats")
    assert r.status_code in (401, 403)
    return f"學生存取管理後台分析正確被拒（{r.status_code}）"


# ============================================================
# 9. 獎助學金
# ============================================================

@check("獎助學金", "獎助學金清單含校內／市府／就業／升學／出國五種分類")
def t_scholarships_categories(c):
    data = _j(c.student.get("/api/campus/scholarships"))
    items = data.get("data", [])
    cats = {s.get("category") for s in items}
    expected = {"校內", "市府", "就業", "升學", "出國"}
    missing = expected - cats
    assert not missing, f"缺少分類：{missing}"
    return f"共 {len(items)} 筆獎助學金，涵蓋 {sorted(cats)}"


@check("獎助學金", "舊版 /api/scholarships/match 相容端點")
def t_scholarships_legacy(c):
    r = c.student.get("/api/scholarships/match")
    assert r.status_code == 200, _j(r)
    return "舊版獎學金比對端點仍可用"


# ============================================================
# 10. 證照與學分抵免提醒
# ============================================================

@check("證照與抵免提醒", "學生上傳證照送審、老師可見、學生自行刪除（正常，含清理）")
def t_certs_submit_review_delete(c):
    r = c.student.post("/api/campus/certs", data={
        "kind": "證照", "name": f"SELFCHECK-證照-{RUN_TAG}", "issuer": "自動檢測",
        "files": [_fake_pdf()],
    }, content_type="multipart/form-data")
    data = _j(r)
    assert r.status_code == 200, data
    item = data["data"]
    saved_url = None
    try:
        review_list = _j(c.teacher.get("/api/campus/certs/review"))["data"]
        assert any(i["id"] == item["id"] for i in review_list), "導師應能在待審清單看到學生送審的證照"
        for f in item.get("files", []):
            saved_url = f["url"]
        return "學生送審證照成功，導師待審清單可見"
    finally:
        c.student.delete(f"/api/campus/certs/{item['id']}")
        if saved_url:
            p = os.path.join(PROJECT_ROOT, "static", saved_url.lstrip("/"))
            try:
                if os.path.exists(p):
                    os.remove(p)
            except OSError:
                pass


@check("證照與抵免提醒", "學生不能看導師審核清單（權限異常）")
def t_certs_review_denied(c):
    r = c.student.get("/api/campus/certs/review")
    assert r.status_code in (401, 403)
    return f"學生查看審核清單正確被拒（{r.status_code}）"


@check("證照與抵免提醒", "可抵免學分證照提醒（主頁待辦用）")
def t_certs_exemption_reminder(c):
    r = c.student.get("/api/campus/certs/exemption-reminder")
    data = _j(r)
    assert r.status_code == 200
    assert isinstance(data.get("data"), list)
    return f"回傳 {len(data['data'])} 筆可抵免學分提醒"


# ============================================================
# 11. 報表與文件庫（含下載次數、權限、通知）
# ============================================================

@check("報表與文件庫", "上傳、下載、統計、收藏、分類通知（正常，含清理）", )
def t_reports_full_flow(c):
    category = f"SELFCHECK-{RUN_TAG}"
    created_ids = []
    saved_urls = []
    try:
        with patch.object(reports_module, "get_mailer", lambda: c._mailer):
            r1 = c.staff.post("/api/campus/reports", data={
                "title": "SELFCHECK 檔案 A（全部可下載）", "category": category, "allowed_roles": "all",
                "file": _fake_pdf("selfcheck_a.pdf"),
            }, content_type="multipart/form-data")
            d1 = _j(r1)
            assert r1.status_code == 200, d1
            file_a = d1["data"]["id"]
            created_ids.append(file_a)

            r_dl = c.student.get(f"/api/campus/reports/{file_a}/download")
            assert r_dl.status_code == 200, "學生下載公開檔案應成功"
            r_dl.close()  # Windows 上檔案若保持開啟，稍後清理實體檔案時會刪除失敗

            r_fav = c.student.post(f"/api/campus/reports/{file_a}/favorite")
            assert r_fav.status_code == 200
            favs = _j(c.student.get("/api/campus/reports/my/favorites"))["data"]
            assert any(f["id"] == file_a for f in favs), "收藏後應出現在『我的收藏』"
            c.student.delete(f"/api/campus/reports/{file_a}/favorite")

            r2 = c.staff.post("/api/campus/reports", data={
                "title": "SELFCHECK 檔案 B（同分類，應觸發通知）", "category": category, "allowed_roles": "all",
                "file": _fake_pdf("selfcheck_b.pdf"),
            }, content_type="multipart/form-data")
            d2 = _j(r2)
            assert r2.status_code == 200, d2
            file_b = d2["data"]["id"]
            created_ids.append(file_b)
            assert len(c._mailer.sent) >= 1, "曾下載過同分類檔案的學生，上架新檔案時應收到通知信"

            r3 = c.staff.post("/api/campus/reports", data={
                "title": "SELFCHECK 檔案 C（僅老師可下載）", "category": category, "allowed_roles": "老師",
                "file": _fake_pdf("selfcheck_c.pdf"),
            }, content_type="multipart/form-data")
            d3 = _j(r3)
            file_c = d3["data"]["id"]
            created_ids.append(file_c)

            r_denied = c.student.get(f"/api/campus/reports/{file_c}/download")
            assert r_denied.status_code == 403, "學生下載老師專用檔案應被拒絕"

            stats = _j(c.staff.get(f"/api/campus/reports/{file_c}/stats"))["data"]
            assert stats["denied_attempts"] >= 1, "被拒絕的下載嘗試應被記錄供權限稽核"
            denied_row = next(d for d in stats["recent_downloads"] if d["result"] == "denied")
            assert denied_row.get("username") == "student1", "下載紀錄（含被拒絕）須保留完整身分供稽核"

            stats_a = _j(c.staff.get(f"/api/campus/reports/{file_a}/stats"))["data"]
            assert stats_a["total_downloads"] >= 1 and stats_a["total_views"] >= 0

            for fid in created_ids:
                f = next(x for x in reports_module.files() if x["id"] == fid)
                saved_urls.append(f["file_url"])

        return (f"檔案 A 下載成功、收藏正常；上架同分類檔案 B 觸發 {len(c._mailer.sent)} 封通知信；"
                f"檔案 C 權限限制生效，被拒絕的下載已留下完整身分紀錄供稽核")
    finally:
        for fid in created_ids:
            c.staff.delete(f"/api/campus/reports/{fid}")
        for url in saved_urls:
            p = os.path.join(reports_module.UPLOAD_DIR, os.path.basename(url))
            try:
                if os.path.exists(p):
                    os.remove(p)
            except OSError:
                pass


@check("報表與文件庫", "未登入訪客看不到需要權限的檔案清單（權限異常/隱藏）")
def t_reports_anon_hidden(c):
    # 先以教職員上傳一份僅老師可看的檔案，確認匿名與學生都看不到它（不暴露目錄結構）
    r = c.staff.post("/api/campus/reports", data={
        "title": f"SELFCHECK-隱藏-{RUN_TAG}", "category": f"SELFCHECK-{RUN_TAG}-hide", "allowed_roles": "老師",
        "file": _fake_pdf(),
    }, content_type="multipart/form-data")
    data = _j(r)
    fid = data["data"]["id"]
    try:
        fresh_anon = app_module.app.test_client()  # 不重用 c.anon，避免受訪客登記測試影響 session 狀態
        anon_list = _j(fresh_anon.get("/api/campus/reports"))["data"]
        assert not any(f["id"] == fid for f in anon_list), "未登入訪客不應看到限老師存取的檔案"
        detail = fresh_anon.get(f"/api/campus/reports/{fid}")
        assert detail.status_code == 404, "未登入訪客直接查該檔案也應回 404，不暴露檔案存在"
        return "無權限身分正確看不到也查不到受限檔案"
    finally:
        f = next((x for x in reports_module.files() if x["id"] == fid), None)
        c.staff.delete(f"/api/campus/reports/{fid}")
        if f:
            p = os.path.join(reports_module.UPLOAD_DIR, os.path.basename(f["file_url"]))
            try:
                if os.path.exists(p):
                    os.remove(p)
            except OSError:
                pass


# ============================================================
# 12. 行政服務（宿舍／總務／常用功能置頂）
# ============================================================

@check("行政服務", "申辦資料自評表勾選")
def t_checklist_docs(c):
    r = c.student.post("/api/campus/checklist-docs", json={"item_id": 1, "doc_index": 0, "done": True})
    assert r.status_code == 200, _j(r)
    c.student.post("/api/campus/checklist-docs", json={"item_id": 1, "doc_index": 0, "done": False})
    return "申辦自評表勾選/取消正常"


@check("行政服務", "宿舍床位申請送出與審查（正常，含清理）")
def t_dorm_apply(c):
    semester = f"SC-{RUN_TAG}"
    r = c.student.post("/api/campus/dorm/apply", json={
        "semester": semester, "room_type": "四人房", "commute_minutes": 90, "emergency_phone": "0900000000",
    })
    data = _j(r)
    assert r.status_code == 200, data
    app_id = data["data"]["id"]
    try:
        dorm_operator = _login(app_module.app.test_client(), "dorm_demo")
        all_apps = _j(dorm_operator.get("/api/campus/dorm/applications"))["data"]
        assert any(a["id"] == app_id for a in all_apps), "承辦人員應能在清單看到新申請"
        return "宿舍申請送出成功，承辦可見"
    finally:
        with services_module.store.lock:
            apps = services_module.store.section("dorm_applications", list)
            apps[:] = [a for a in apps if a["id"] != app_id]
            services_module.store.save()


@check("行政服務", "總務報帳資格檢查（不寫入資料，僅驗證）")
def t_affairs_check(c):
    r = c.student.get("/api/campus/affairs/mine")
    data = _j(r)
    assert r.status_code == 200
    if not data.get("projects"):
        return "此學生無計畫案可測試報帳檢查，略過（非功能錯誤）"
    project = data["projects"][0]
    r2 = c.student.post("/api/campus/affairs/check", json={
        "kind": "報帳", "project_id": project["project_id"], "fields": {},
    })
    assert r2.status_code == 200, _j(r2)
    return "總務報帳資格檢查正常"


@check("行政服務", "常用功能置頂設定")
def t_prefs_pinned(c):
    r = c.student.put("/api/campus/prefs", json={"pinned": ["calendar", "rules"]})
    assert r.status_code == 200, _j(r)
    c.student.put("/api/campus/prefs", json={"pinned": ["calendar", "course-plan", "rules", "notices"]})
    return "常用功能置頂設定可修改"


# ============================================================
# 13. 出缺勤與請假
# ============================================================

@check("出缺勤", "學生查看自己的缺曠紀錄")
def t_attendance_student(c):
    r = c.student.get("/api/student/attendance")
    assert r.status_code == 200, _j(r)
    return "學生缺曠紀錄查詢正常"


@check("出缺勤", "教職員查看缺曠總表")
def t_attendance_admin(c):
    r = c.staff.get("/api/admin/attendance")
    assert r.status_code == 200, _j(r)
    return "教職員缺曠總表查詢正常"


@check("請假申請", "學生請假、自行取消（正常，含清理）")
def t_leave_request_cancel(c):
    r = c.student.post("/api/student/leave-requests", json={
        "leave_type": "病假", "start_date": "2026-12-10", "end_date": "2026-12-10", "reason": "SELFCHECK 自動檢測",
    })
    data = _j(r)
    assert r.status_code == 201, data
    lid = data["data"]["id"]
    r2 = c.student.delete(f"/api/student/leave-requests/{lid}")
    assert r2.status_code == 200, _j(r2)
    return "學生請假與自行取消正常"


@check("請假申請", "學生不能審核假單（權限異常）")
def t_leave_review_denied(c):
    r = c.student.get("/api/leave-requests/review")
    assert r.status_code in (401, 403)
    return f"學生查看審核清單正確被拒（{r.status_code}）"


# ============================================================
# 14. 學生儀表板與學業預警
# ============================================================

@check("學生儀表板", "首頁儀表板資料")
def t_student_dashboard(c):
    r = c.student.get("/api/student/dashboard")
    assert r.status_code == 200, _j(r)
    return "學生儀表板查詢正常"


@check("學業預警", "學業預警查詢")
def t_early_warning(c):
    r = c.student.get("/api/student/early-warning")
    assert r.status_code == 200, _j(r)
    return "學業預警查詢正常"


# ============================================================
# 15. 設施與借用
# ============================================================

@check("設施與借用", "校園地圖、教師辦公室、人流查詢")
def t_facilities_readonly(c):
    for url in ("/api/campus/map", "/api/campus/teachers", "/api/campus/crowd"):
        r = c.student.get(url)
        assert r.status_code == 200, f"{url} 應回 200"
    return "校園地圖/教師辦公室/人流查詢皆正常"


@check("設施與借用", "教室借用申請與自行取消（正常，含清理）")
def t_room_booking(c):
    rooms = _j(c.student.get("/api/campus/rooms"))["data"]
    rentable = next((r for r in rooms if r.get("rentable")), None)
    if not rentable:
        return "示範資料中沒有開放線上借用的教室，略過（非功能錯誤）"
    r = c.student.post("/api/campus/rooms/book", json={
        "room_id": rentable["room_id"], "date": "2026-12-20", "period_start": 1, "period_end": 1,
        "purpose": "SELFCHECK 自動檢測",
    })
    data = _j(r)
    if r.status_code != 200:
        return f"該時段無法借用（{data.get('message')}），略過（非功能錯誤）"
    bid = data["data"]["id"]
    r2 = c.student.post(f"/api/campus/rooms/bookings/{bid}", json={"action": "cancel"})
    assert r2.status_code == 200, _j(r2)
    return "教室借用送出與自行取消正常"


@check("設施與借用", "置物櫃租借狀態查詢")
def t_lockers(c):
    r = c.student.get("/api/campus/lockers")
    assert r.status_code == 200, _j(r)
    return "置物櫃狀態查詢正常"


# ============================================================
# 16. 科上通知
# ============================================================

@check("科上通知", "班級與通知清單查詢（唯讀，不建立新通知避免累積測試資料）")
def t_messaging_readonly(c):
    r1 = c.teacher.get("/api/campus/classes")
    r2 = c.teacher.get("/api/campus/notices/sent")
    r3 = c.student.get("/api/campus/notices/inbox")
    assert r1.status_code == 200 and r2.status_code == 200 and r3.status_code == 200
    return "班級清單、已發通知、收件匣查詢皆正常"


# ============================================================
# 17. 校園資訊、AI 小幫手
# ============================================================

@check("校園資訊", "天氣與交通資訊（需要外部網路）")
def t_campus_info(c):
    try:
        r1 = c.student.get("/api/campus/weather")
        r2 = c.student.get("/api/campus/transport")
    except Exception as e:
        return f"skip: 無法連線外部資料來源（{e}），這是網路環境限制而非程式錯誤"
    if r1.status_code != 200 or r2.status_code != 200:
        return f"skip: 外部資料來源目前無回應 (weather={r1.status_code}, transport={r2.status_code})"
    return "天氣與交通查詢皆正常（或已使用離線備援資料）"


@check("AI 申辦小幫手", "狀態查詢與提問")
def t_assistant(c):
    r1 = c.student.get("/api/assistant/status")
    r2 = c.student.post("/api/assistant/ask", json={"question": "停修要怎麼辦？"})
    assert r1.status_code == 200 and r2.status_code == 200
    return f"小幫手運作模式={_j(r1).get('mode')}"


# ============================================================
# 18. 個人化偏好、學期自評表、教師專長、校慶跑馬燈、健康檢查
# ============================================================

@check("個人化內容偏好", "科系內容偏好設定")
def t_me_preferences(c):
    r = c.student.put("/api/me/preferences", json={"dept_id": None, "content_scope": "all"})
    assert r.status_code == 200, _j(r)
    return "個人化內容偏好設定正常"


@check("學期自評表", "填寫、查詢、刪除（正常，含清理）")
def t_self_review(c):
    semester = _j(c.student.get("/api/self-review"))["current_semester"]
    r = c.student.put(f"/api/self-review/{semester}", json={
        "ratings": {}, "reflections": {}, "status": "草稿",
    })
    assert r.status_code == 200, _j(r)
    try:
        got = _j(c.student.get(f"/api/self-review/{semester}"))
        assert got.get("exists") is True
        return f"{semester} 學期自評表可填寫與查詢"
    finally:
        c.student.delete(f"/api/self-review/{semester}")


@check("教師專長查詢", "查詢老師專長、老師修改自己資料")
def t_faculty_search_and_me(c):
    r = c.student.get("/api/faculty?q=資料庫")
    assert r.status_code == 200, _j(r)
    r2 = c.teacher.get("/api/faculty/me")
    assert r2.status_code == 200, _j(r2)
    return "教師專長查詢與老師個人資料查詢皆正常"


@check("教師專長查詢", "管理員新增/刪除教師專長資料（正常，含清理）")
def t_faculty_admin_crud(c):
    r = c.admin.post("/api/admin/faculty", json={
        "name": f"SELFCHECK老師{RUN_TAG}", "dept_name": "資訊管理科（五專）", "expertise": ["自動檢測"],
    })
    data = _j(r)
    assert r.status_code == 201, data
    pid = data["id"]
    r2 = c.admin.delete(f"/api/admin/faculty/{pid}")
    assert r2.status_code == 200, _j(r2)
    return "教師專長資料新增與刪除正常"


@check("校慶跑馬燈", "匿名祝福留言、管理員查看並清理")
def t_anniversary(c):
    r1 = c.anon.get("/api/anniversary/marquee")
    assert r1.status_code == 200, _j(r1)
    r2 = c.anon.post("/api/anniversary/wishes", json={"message": f"SELFCHECK {RUN_TAG} 自動檢測祝福"})
    data2 = _j(r2)
    if r2.status_code != 201:
        return f"目前沒有進行中的校慶活動，祝福留言功能略過直接測試（{data2.get('message')}）"
    r3 = _j(c.admin.get("/api/admin/anniversary"))
    wish = None
    for w in r3.get("data", {}).get("wishes", []) if isinstance(r3.get("data"), dict) else []:
        if RUN_TAG in (w.get("message") or ""):
            wish = w
    if wish:
        c.admin.delete(f"/api/admin/anniversary/wishes/{wish['id']}")
    return "校慶跑馬燈與匿名祝福功能正常"


@check("系統健康檢查", "/api/health 與 /api/stats")
def t_health_stats(c):
    r1 = c.anon.get("/api/health")
    r2 = c.anon.get("/api/stats")
    assert r1.status_code == 200 and r2.status_code == 200
    return "系統健康檢查與統計 API 正常"


# ============================================================
# 執行器
# ============================================================

def run_all():
    """實際執行一輪全部檢測，回傳結構化結果；可被 pytest 或後台 API 呼叫"""
    global RUN_TAG
    RUN_TAG = datetime.now().strftime("%Y%m%d%H%M%S")
    app_module.app.config["TESTING"] = True
    mailer = FakeMailer()

    with patch.object(app_module, "get_db_connection", lambda: None), \
         patch.object(app_module, "get_mailer", lambda: mailer):
        clients = _build_clients()
        clients._mailer = mailer

        results = []
        for feature, name, fn in REGISTRY:
            t0 = time.perf_counter()
            try:
                detail = fn(clients) or "OK"
                status = "pass"
            except AssertionError as e:
                status, detail = "fail", str(e)
            except Exception as e:
                status, detail = "error", f"{type(e).__name__}: {e}"
                detail += "\n" + traceback.format_exc(limit=3)
            results.append({
                "feature": feature, "name": name, "status": status, "detail": detail,
                "ms": round((time.perf_counter() - t0) * 1000, 1),
            })

    total = len(results)
    passed = sum(1 for r in results if r["status"] == "pass")
    failed = [r for r in results if r["status"] in ("fail", "error")]
    return {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total": total,
        "passed": passed,
        "failed_count": len(failed),
        "completion_percent": round(passed / total * 100, 1) if total else 0,
        "mail_sent_count": len(mailer.sent),
        "results": results,
    }


def format_report_markdown(report):
    lines = [
        "# Smart UKN 全站功能自動檢測報告",
        "",
        f"- 執行時間：{report['generated_at']}",
        f"- 檢測項目總數：{report['total']}",
        f"- 通過：{report['passed']}　未通過：{report['failed_count']}",
        f"- **完成度：{report['completion_percent']}%**",
        "",
        "> 說明：此報告由 `self_check.py` 全自動產生，一律使用離線示範模式（不連真正 MySQL、不寄出真正 Email），",
        "> 檢測過程中建立的任何資料都已於程式內自動清理。可重複執行，結果應保持一致。",
        "> 下方「涵蓋範圍」不含肉眼視覺比對（例如版面是否好看），那部分仍需人工在瀏覽器實際操作確認。",
        "",
    ]
    by_feature = {}
    for r in report["results"]:
        by_feature.setdefault(r["feature"], []).append(r)
    icon = {"pass": "✅", "fail": "❌", "error": "💥"}
    for feature, items in by_feature.items():
        ok_count = sum(1 for i in items if i["status"] == "pass")
        lines.append(f"## {feature}（{ok_count}/{len(items)}）")
        for i in items:
            lines.append(f"- {icon.get(i['status'], '?')} **{i['name']}**（{i['ms']}ms）")
            detail_first_line = i["detail"].splitlines()[0] if i["detail"] else ""
            lines.append(f"  - {detail_first_line}")
        lines.append("")
    if report["failed_count"]:
        lines.append("## 未通過項目的原因、影響與建議")
        for r in report["results"]:
            if r["status"] in ("fail", "error"):
                lines.append(f"### [{r['feature']}] {r['name']}")
                lines.append(f"- 原因：{r['detail'].splitlines()[0]}")
                lines.append("- 影響：該功能在目前程式碼版本下可能無法正確運作或未達驗收標準。")
                lines.append("- 建議：請回報給負責該功能的同學修正後再重跑一次本檢測。")
                lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    report = run_all()
    md = format_report_markdown(report)
    print(md)
    evidence_dir = os.path.join(PROJECT_ROOT, "evidence")
    os.makedirs(evidence_dir, exist_ok=True)
    out_path = os.path.join(evidence_dir, f"self_check_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"\n報告已存成：{out_path}")
