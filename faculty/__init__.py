"""
教師專長查詢 (領域專長查詢系統)

- 依專長關鍵字 (含同義詞，例如 AI → 人工智慧、機器學習)、領域、科別、是否可指導專題找老師
- 辦公室、分機、目前是否上課沿用校園地圖的老師辦公室名錄 (campus.facilities.published_teachers) 與課表
- 老師可以修改自己的專長與簡介；管理員、教職員可新增 / 修改 / 刪除所有老師的資料
- is_public = 0 的資料不會出現在前台查詢

app.py 呼叫 faculty.init_app(app, deps) 註冊；deps 提供 fetch_db_rows、db_execute、write_audit_log。
"""
from datetime import datetime
from types import SimpleNamespace

from flask import Blueprint, jsonify, request, session

from campus.facilities import CAMPUS_BUILDINGS, load_schedule, published_teachers, teacher_status
from .logic import FIELDS, expand_terms, score_profile, split_tags

bp = Blueprint("faculty", __name__)
deps = SimpleNamespace()

ADMIN_ROLES = ("管理員", "系統管理員", "教職員", "內容管理人員", "處室承辦", "科助")
EDITABLE_BY_TEACHER = ("expertise", "fields", "research_summary", "accepts_projects", "email")
PROFILE_FIELDS = ("name", "title", "dept_name", "email", "fields", "expertise", "research_summary", "accepts_projects", "is_public")

# 康寧大學官網 (ukn.edu.tw) 各系科公開真實專任師資資料；正式上線可由後台「教師專長」持續維護
DEMO_PROFILES = [
    # 資訊管理科
    {"id": 1, "name": "彭賓鈺", "title": "專任教師", "dept_name": "資訊管理科", "email": "mis@g.ukn.edu.tw",
     "fields": "資訊科技,人工智慧與資料分析", "expertise": "應用數學,統計分析,統計學,資料結構,演算法,微積分,資料分析",
     "research_summary": "專長於應用數學、統計分析、資料結構與演算法，教授統計學與商務智慧數據分析。", "accepts_projects": 1, "is_public": 1},
    {"id": 2, "name": "周建羽", "title": "講師兼代理主任", "dept_name": "資訊管理科", "email": "beckchou@ukn.edu.tw",
     "fields": "資訊科技,人工智慧與資料分析", "expertise": "數據分析,資料分析,實務專題,商務智慧",
     "research_summary": "資訊管理科代理主任，專長於數據分析與實務專題指導。", "accepts_projects": 1, "is_public": 1},
    {"id": 3, "name": "謝樹明", "title": "專任教師", "dept_name": "資訊管理科", "email": "stanleyh@ukn.edu.tw",
     "fields": "資訊科技,人工智慧與資料分析", "expertise": "機器學習,資料探勘,資訊檢索,演算法,資料結構,離散數學",
     "research_summary": "專長於資料探勘、資訊檢索、演算法與機器學習，教授 AI 應用精準管理等課程。", "accepts_projects": 1, "is_public": 1},
    {"id": 4, "name": "嚴竹華", "title": "專任教師", "dept_name": "資訊管理科", "email": "echoyan@ukn.edu.tw",
     "fields": "資訊科技,企業管理與行銷", "expertise": "網頁應用程式應用,網頁開發,企業管理,行銷管理,人際溝通,財務,經濟",
     "research_summary": "專長於網頁應用程式應用、企業管理、行銷管理與財務經濟分析。", "accepts_projects": 1, "is_public": 1},
    {"id": 5, "name": "朱錦文", "title": "專任教師", "dept_name": "資訊管理科", "email": "winnie@ukn.edu.tw",
     "fields": "資訊科技,企業管理與行銷", "expertise": "資訊管理,網路行銷,電子商務,資料庫設計,財務會計",
     "research_summary": "專長於資訊管理、網路行銷、電子商務與財務會計應用。", "accepts_projects": 1, "is_public": 1},
    {"id": 6, "name": "益西曲珍", "title": "專任教師", "dept_name": "資訊管理科", "email": "amy0718@ukn.edu.tw",
     "fields": "企業管理與行銷,資訊科技", "expertise": "人力資源,行銷及產業分析,投資管理",
     "research_summary": "專長於人力資源、行銷及產業分析，教授投資管理等商管實務課程。", "accepts_projects": 1, "is_public": 1},
    {"id": 7, "name": "李栢松", "title": "專任教師兼資訊組組長", "dept_name": "資訊管理科", "email": "jacklee521@ukn.edu.tw",
     "fields": "通識與人文社會,資訊安全與網路", "expertise": "資訊安全,網路安全,國際關係,國際事務,全球化趨勢與發展",
     "research_summary": "兼任資訊組組長，專長於國際事務、全球化趨勢與校園資訊安全網路架構。", "accepts_projects": 1, "is_public": 1},
    {"id": 8, "name": "楊景琦", "title": "專任教師", "dept_name": "資訊管理科", "email": "mis@g.ukn.edu.tw",
     "fields": "通識與人文社會", "expertise": "中國文學,唐宋詩詞,實用中文,現代小說",
     "research_summary": "專長於中國文學、唐宋詩詞、實用中文與現代小說賞析。", "accepts_projects": 0, "is_public": 1},
    # 護理科
    {"id": 9, "name": "葉美玉", "title": "教授兼學院院長、科主任", "dept_name": "護理科", "email": "yehdiana@g.ukn.edu.tw",
     "fields": "護理與健康照護", "expertise": "護理人文教育,護病溝通,病人教育,精神心理衛生護理,成癮醫學",
     "research_summary": "護理健康學院院長兼護理科主任，專長於護理人文教育、賦能護病溝通與精神心理衛生護理。", "accepts_projects": 1, "is_public": 1},
    {"id": 10, "name": "劉璧瑜", "title": "副教授兼副主任", "dept_name": "護理科", "email": "n4889159@g.ukn.edu.tw",
     "fields": "護理與健康照護", "expertise": "解剖生理學,微生物學,神經科學",
     "research_summary": "護理科副主任，專長於解剖生理學、微生物學與神經科學教學。", "accepts_projects": 1, "is_public": 1},
    {"id": 11, "name": "呂莉婷", "title": "副教授", "dept_name": "護理科", "email": "ltlu@ukn.edu.tw",
     "fields": "護理與健康照護,長期照護", "expertise": "基本護理學,社區護理學,長期照護,老人護理學,失智症照護",
     "research_summary": "專長於基本護理學、社區護理學、長期照護、老人護理與失智症照護。", "accepts_projects": 1, "is_public": 1},
    {"id": 12, "name": "嚴惠宇", "title": "副教授", "dept_name": "護理科", "email": "hyan@ukn.edu.tw",
     "fields": "護理與健康照護", "expertise": "內外科護理,神經外科護理,護理教育,課程發展與設計",
     "research_summary": "專長於內外科護理、神經外科護理、飲食障礙照護與護理課程設計。", "accepts_projects": 1, "is_public": 1},
    {"id": 13, "name": "林宛萱", "title": "助理教授兼實習組長", "dept_name": "護理科", "email": "manyaaqq@g.ukn.edu.tw",
     "fields": "護理與健康照護", "expertise": "社區護理學,綜合護理學,臨床實習指導",
     "research_summary": "兼任護理科實習組長，專長於社區護理學與綜合護理學。", "accepts_projects": 0, "is_public": 1},
    {"id": 14, "name": "王凱立", "title": "副教授", "dept_name": "護理科", "email": "kellywang@ukn.edu.tw",
     "fields": "護理與健康照護", "expertise": "解剖生理學,微生物免疫學,病理學,內分泌學,醫學檢驗",
     "research_summary": "專長於解剖生理學、微生物免疫學、病理學與醫學檢驗。", "accepts_projects": 1, "is_public": 1},
    # 應用外語科
    {"id": 15, "name": "李惠瀅", "title": "助理教授兼主任", "dept_name": "應用外語科", "email": "hylee@ukn.edu.tw",
     "fields": "語言與外語教學", "expertise": "語言學,翻譯學,英語閱讀與寫作,外語教學",
     "research_summary": "應用外語科暨外語中心主任，專長於語言學、翻譯學與外語教學。", "accepts_projects": 1, "is_public": 1},
    {"id": 16, "name": "李智偉", "title": "講師兼副主任", "dept_name": "應用外語科", "email": "albert@ukn.edu.tw",
     "fields": "語言與外語教學", "expertise": "英語文教學,多益,英語字彙與閱讀,基礎英文法",
     "research_summary": "應用外語科副主任，美國南加州大學英語教學碩士，專長於英語文教學與閱讀寫作。", "accepts_projects": 1, "is_public": 1},
    {"id": 17, "name": "蔡明杰", "title": "助理教授兼海外實習組組長", "dept_name": "應用外語科", "email": "jasonakira@ukn.edu.tw",
     "fields": "語言與外語教學", "expertise": "日本語教育,日語語法,日語談話分析",
     "research_summary": "日本東北大學博士，專長於日本語教育、日語語法與海外實習輔導。", "accepts_projects": 1, "is_public": 1},
    {"id": 18, "name": "陳琇娟", "title": "副教授", "dept_name": "應用外語科", "email": "hcchen@ukn.edu.tw",
     "fields": "語言與外語教學", "expertise": "英語教學,英語字彙與閱讀,英文文法與習作",
     "research_summary": "專長於英語教學、英語字彙閱讀與文法寫作指導。", "accepts_projects": 1, "is_public": 1},
    {"id": 19, "name": "洪信惠", "title": "助理教授", "dept_name": "應用外語科", "email": "shinhye@g.ukn.edu.tw",
     "fields": "語言與外語教學", "expertise": "韓語教學,韓國大眾文化研究",
     "research_summary": "專長於韓語教學與韓國大眾文化研究。", "accepts_projects": 1, "is_public": 1},
    # 通識教育中心
    {"id": 20, "name": "李金瑛", "title": "副教授兼通識中心主任", "dept_name": "通識教育中心", "email": "cylee@ukn.edu.tw",
     "fields": "語言與外語教學,通識與人文社會", "expertise": "英語教學,英語閱讀與指導,英文寫作,新聞英文,跨文化研究",
     "research_summary": "通識教育中心主任，專長於英語教學、新聞英文與跨文化研究。", "accepts_projects": 1, "is_public": 1},
    {"id": 21, "name": "傅木龍", "title": "助理教授兼主任秘書", "dept_name": "通識教育中心", "email": "",
     "fields": "通識與人文社會", "expertise": "生命教育,教育心理學,正向心理學,品德教育,班級經營,公民教育",
     "research_summary": "專長於教育心理學、正向心理學、生命教育、品德與公民教育。", "accepts_projects": 1, "is_public": 1},
    {"id": 22, "name": "蔡維岳", "title": "專任教師", "dept_name": "通識教育中心", "email": "",
     "fields": "語言與外語教學,通識與人文社會", "expertise": "英文教學,通識外語,實用英文",
     "research_summary": "通識教育中心外語教師，教授進階分類通識外語類（英文）課程。", "accepts_projects": 0, "is_public": 1},
    # 企業管理學系
    {"id": 23, "name": "鍾珮珊", "title": "副教授兼主任", "dept_name": "企業管理學系", "email": "coral@ukn.edu.tw",
     "fields": "企業管理與行銷", "expertise": "人力資源管理,教育訓練,組織行為",
     "research_summary": "企業管理科主任，專長於人力資源管理、教育訓練與組織行為。", "accepts_projects": 1, "is_public": 1},
    {"id": 24, "name": "連章宸", "title": "副教授", "dept_name": "企業管理學系", "email": "",
     "fields": "企業管理與行銷", "expertise": "行銷管理,電子商務,顧客關係管理,健康產業管理",
     "research_summary": "專長於行銷管理、電子商務、顧客關係管理與健康產業管理。", "accepts_projects": 1, "is_public": 1},
    {"id": 25, "name": "陳乃禎", "title": "助理教授", "dept_name": "企業管理學系", "email": "",
     "fields": "企業管理與行銷,人工智慧與資料分析,資訊科技", "expertise": "量化分析與研究,AI應用,數位學習,電腦軟體應用,組織理論",
     "research_summary": "專長於量化分析、數位學習、AI 應用與組織理論研究。", "accepts_projects": 1, "is_public": 1},
    # 數位影視動畫科
    {"id": 26, "name": "藍靜義", "title": "助理教授兼科主任", "dept_name": "數位影視動畫科", "email": "chingyi@ukn.edu.tw",
     "fields": "數位媒體與動畫", "expertise": "視覺設計,繪畫,攝影,品牌形象包裝設計",
     "research_summary": "數位影視動畫科主任，專長於設計、繪畫、攝影與品牌形象包裝設計。", "accepts_projects": 1, "is_public": 1},
    {"id": 27, "name": "楊士央", "title": "副教授", "dept_name": "數位影視動畫科", "email": "shihyang@ukn.edu.tw",
     "fields": "數位媒體與動畫,資訊科技", "expertise": "動畫教育,Web技術,網頁開發,媒體與互動設計",
     "research_summary": "專長於動畫教育、Web 網頁技術與數位媒體互動設計。", "accepts_projects": 1, "is_public": 1},
    {"id": 28, "name": "王英龢", "title": "助理教授兼副主任", "dept_name": "數位影視動畫科", "email": "",
     "fields": "數位媒體與動畫", "expertise": "3D動畫製作,2D電腦動畫,分鏡設計,角色造型設計,影視特效,AR情境製作",
     "research_summary": "數位影視動畫科副主任，專長於 2D/3D 電腦動畫、分鏡角色設計與 AR 情境製作。", "accepts_projects": 1, "is_public": 1},
    # 嬰幼兒保育學系
    {"id": 29, "name": "陳慧玲", "title": "副教授兼系主任", "dept_name": "嬰幼兒保育學系", "email": "hlchen@ukn.edu.tw",
     "fields": "幼兒教育與保育", "expertise": "幼兒教育,幼兒發展,幼兒健康與安全,嬰兒托育實務",
     "research_summary": "嬰幼兒保育學系主任，專長於幼兒教育、幼兒發展與嬰兒托育實務。", "accepts_projects": 1, "is_public": 1},
    {"id": 30, "name": "武藍蕙", "title": "副教授", "dept_name": "嬰幼兒保育學系", "email": "nicolewu@ukn.edu.tw",
     "fields": "幼兒教育與保育", "expertise": "幼兒教育,課程與教學,教保環境規劃,幼兒園教材教法",
     "research_summary": "專長於幼兒教育課程教學、師資培育倫理與教保環境規劃。", "accepts_projects": 1, "is_public": 1},
    # 視光科
    {"id": 31, "name": "林蔚荏", "title": "助理教授級專技兼科主任", "dept_name": "視光科", "email": "opt@ukn.edu.tw",
     "fields": "視光與眼科保健", "expertise": "配鏡學,低視力學,視覺光學,視光學",
     "research_summary": "視光科主任，專長於配鏡學、低視力學與視覺光學。", "accepts_projects": 1, "is_public": 1},
    {"id": 32, "name": "江彥穎", "title": "助理教授", "dept_name": "視光科", "email": "opt@ukn.edu.tw",
     "fields": "視光與眼科保健", "expertise": "雙眼視覺,臨床視光,隱形眼鏡,近視控制,乾眼症",
     "research_summary": "國防醫學院生命科學博士，專長於雙眼視覺、臨床視光、隱形眼鏡與近視控制研究。", "accepts_projects": 1, "is_public": 1},
    # 長期照護學系
    {"id": 33, "name": "陳秀珍", "title": "教授兼系主任、商資學院院長", "dept_name": "長期照護學系", "email": "sjchen@ukn.edu.tw",
     "fields": "長期照護,護理與健康照護", "expertise": "長期照護,應用醫學研究,健康促進,另類輔療",
     "research_summary": "長期照護學系主任兼商業資訊學院院長，專長於長期照護、健康促進與應用醫學研究。", "accepts_projects": 1, "is_public": 1},
    {"id": 34, "name": "李劭懷", "title": "助理教授", "dept_name": "長期照護學系", "email": "ltc@ukn.edu.tw",
     "fields": "長期照護", "expertise": "長期照護,失智症照顧,銀髮產業,長照保險,長照科技",
     "research_summary": "專長於長期照護、失智症照顧、銀髮產業與長照科技創新應用。", "accepts_projects": 1, "is_public": 1},
]


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def _error(message, code=400):
    return jsonify({"status": "error", "message": message}), code


def load_profiles():
    rows = deps.fetch_db_rows("SELECT * FROM faculty_profiles ORDER BY dept_name, id")
    rows = [dict(r) for r in (DEMO_PROFILES if rows is None else rows)]
    for r in rows:
        if isinstance(r.get("updated_at"), datetime):
            r["updated_at"] = r["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
    return rows


def _norm_name(name):
    raw = str(name or "").strip()
    return raw.replace("老師", "").strip() or raw


def _decorate(profile, schedule, now, offices):
    """加上專長 list、辦公室與目前狀態、授課課程"""
    p = {**profile, "expertise": split_tags(profile.get("expertise")), "fields": split_tags(profile.get("fields")),
         "accepts_projects": bool(profile.get("accepts_projects")), "is_public": bool(profile.get("is_public"))}
    pkey = _norm_name(profile.get("name"))
    listed = next((t for t in offices if _norm_name(t.get("name")) == pkey), None)
    office = listed if listed and listed["office"] else None
    p["courses"] = sorted({s["course_name"] for s in schedule if _norm_name(s.get("teacher")) == pkey})
    p["photo_url"] = listed["photo_url"] if listed else ""
    if office:
        buildings = {b["code"]: b["name"] for b in CAMPUS_BUILDINGS}
        p["office"] = {"room": office["office"], "building": buildings.get(office["building"], ""), "ext": office["ext"],
                       "office_hours": office["office_hours"]}
        p["status"] = teacher_status(office, schedule, now)
    else:
        p["office"], p["status"] = None, None
    return p


def _teacher_name():
    """登入老師在專長資料中的姓名 (帳號姓名「彭賓鈺 老師」去掉稱謂)"""
    return str(session.get("full_name") or "").replace("老師", "").strip()


# 【功能：教師專長查詢】專長資料 + 老師名錄 + 課表合在一起，依分數排序；沒有專長資料的老師也列出
@bp.route("/api/faculty", methods=["GET"])
def search_faculty():
    """?q=關鍵字&field=領域&dept=科別&projects=1 (只看可指導專題)"""
    q = request.args.get("q", "").strip()[:50]
    field = request.args.get("field", "").strip()
    dept = request.args.get("dept", "").strip()
    projects_only = request.args.get("projects") == "1"
    terms = expand_terms(q)
    schedule = load_schedule()
    now = datetime.now()

    offices = published_teachers(schedule)
    all_profiles = load_profiles()
    # 嚴格依正規化姓名去重，避免同一位老師重複出現（同時保留原始顯示姓名）
    seen_names, unique_profiles, stubs = set(), [], []
    for p in all_profiles:
        raw = str(p.get("name") or "").strip()
        key = _norm_name(raw)
        if not raw or key in seen_names:
            continue
        seen_names.add(key)
        unique_profiles.append({**p, "name": raw})
    # 老師辦公室名錄或課表上有、但還沒建立專長資料的老師也要列出 (專長留白，可依姓名、授課課程找到)
    for t in offices:
        raw = str(t.get("name") or "").strip()
        key = _norm_name(raw)
        if not raw or key in seen_names:
            continue
        seen_names.add(key)
        stubs.append({"id": None, "name": raw, "title": (t["title"] or "").split("/")[0].strip(),
                      "dept_name": t["dept"] or t["unit"] or "科別尚未登錄", "email": t["email"], "fields": "", "expertise": "",
                      "research_summary": "", "accepts_projects": 0, "is_public": 1, "profile_missing": True})
    profiles = [_decorate(p, schedule, now, offices) for p in unique_profiles + stubs if p.get("is_public")]
    results = []
    for p in profiles:
        if field and field not in p["fields"]:
            continue
        if dept and p["dept_name"] != dept:
            continue
        if projects_only and not p["accepts_projects"]:
            continue
        score, matched = score_profile(p, terms)
        if score > 0:
            results.append({**p, "score": score, "matched_tags": matched})
    results.sort(key=lambda p: (-p["score"], p["dept_name"], p["name"]))

    return jsonify({
        "status": "success",
        "query": q,
        "expanded_terms": [t for t, expanded in terms if expanded],
        "fields": [{"name": f, "count": sum(1 for p in profiles if f in p["fields"])} for f in FIELDS],
        "depts": sorted({p["dept_name"] for p in profiles}),
        "my_name": _teacher_name() if session.get("role") == "老師" else None,
        "data": results,
    }), 200


def _parse_profile(data, partial_keys=None):
    """檢查欄位；partial_keys 有值時只處理這些欄位 (老師修改自己的資料)"""
    keys = partial_keys or PROFILE_FIELDS
    out = {}
    if "name" in keys:
        out["name"] = str(data.get("name", "")).strip()[:50]
        if not out["name"]:
            return None, "請填寫老師姓名"
    if "title" in keys:
        out["title"] = str(data.get("title", "")).strip()[:50] or None
    if "dept_name" in keys:
        out["dept_name"] = str(data.get("dept_name", "")).strip()[:100]
        if not out["dept_name"]:
            return None, "請填寫所屬科別"
    if "email" in keys:
        out["email"] = str(data.get("email", "")).strip()[:100]
        if out["email"] and "@" not in out["email"]:
            return None, "Email 格式不正確"
    if "fields" in keys:
        fields = split_tags(",".join(data["fields"]) if isinstance(data.get("fields"), list) else data.get("fields"))
        unknown = [f for f in fields if f not in FIELDS]
        if unknown:
            return None, f"未知的領域：{'、'.join(unknown)}"
        out["fields"] = ",".join(fields)
    if "expertise" in keys:
        tags = split_tags(",".join(data["expertise"]) if isinstance(data.get("expertise"), list) else data.get("expertise"))
        if not tags:
            return None, "請至少填寫一項專長"
        out["expertise"] = ",".join(tags)
    if "research_summary" in keys:
        out["research_summary"] = str(data.get("research_summary", "")).strip()[:500]
    if "accepts_projects" in keys:
        out["accepts_projects"] = 1 if data.get("accepts_projects") in (True, 1, "1", "true") else 0
    if "is_public" in keys:
        out["is_public"] = 1 if data.get("is_public", True) in (True, 1, "1", "true") else 0
    return out, None


def _save(profile_id, fields, before):
    sets = ", ".join(f"{k} = %s" for k in fields)
    if deps.db_execute(f"UPDATE faculty_profiles SET {sets} WHERE id = %s", (*fields.values(), profile_id)) is None:
        next(p for p in DEMO_PROFILES if p["id"] == profile_id).update(fields)
    deps.write_audit_log("faculty_profiles", profile_id, "修改",
                         before={k: before.get(k) for k in fields}, after=fields)


@bp.route("/api/faculty/me", methods=["GET", "PUT"])
def my_profile():
    """老師查看 / 修改自己的專長 (姓名、科別、是否公開由後台維護)"""
    if session.get("role") != "老師":
        return _error("只有老師可以編輯自己的專長資料", 403)
    name = _teacher_name()
    mine = next((p for p in load_profiles() if p["name"] == name), None)
    if not mine:
        return _error("後台尚未建立你的專長資料，請聯絡教務處", 404)
    if request.method == "PUT":
        fields, problem = _parse_profile(request.get_json(silent=True) or {}, EDITABLE_BY_TEACHER)
        if problem:
            return _error(problem)
        _save(mine["id"], fields, mine)
        mine = {**mine, **fields}
    return jsonify({"status": "success", "fields_available": list(FIELDS),
                    "data": {**mine, "expertise": split_tags(mine["expertise"]), "fields": split_tags(mine["fields"])}}), 200


# ---------- 後台 ----------

def _require_admin():
    if "username" not in session:
        return _error("請先登入系統", 401)
    if session.get("role") not in ADMIN_ROLES:
        return _error("權限不足，僅限管理員或教職員", 403)
    return None


@bp.route("/api/admin/faculty", methods=["GET", "POST"])
def admin_faculty():
    denied = _require_admin()
    if denied:
        return denied
    profiles = load_profiles()
    if request.method == "GET":
        return jsonify({"status": "success", "fields_available": list(FIELDS),
                        "office_names": [t["name"] for t in published_teachers()], "data": profiles}), 200

    fields, problem = _parse_profile(request.get_json(silent=True) or {})
    if problem:
        return _error(problem)
    if any(p["name"] == fields["name"] for p in profiles):
        return _error("已有同名老師的資料")
    saved = deps.db_execute(
        f"INSERT INTO faculty_profiles ({', '.join(PROFILE_FIELDS)}) VALUES ({', '.join(['%s'] * len(PROFILE_FIELDS))})",
        tuple(fields[k] for k in PROFILE_FIELDS))
    if saved is None:
        new_id = max((p["id"] for p in DEMO_PROFILES), default=0) + 1
        DEMO_PROFILES.append({"id": new_id, **fields})
    else:
        new_id = saved["lastrowid"]
    deps.write_audit_log("faculty_profiles", new_id, "新增", after=fields)
    return jsonify({"status": "success", "message": "已新增老師專長資料", "id": new_id}), 201


@bp.route("/api/admin/faculty/<int:profile_id>", methods=["PUT", "DELETE"])
def admin_faculty_item(profile_id):
    denied = _require_admin()
    if denied:
        return denied
    profiles = load_profiles()
    before = next((p for p in profiles if p["id"] == profile_id), None)
    if not before:
        return _error("找不到該筆資料", 404)

    if request.method == "DELETE":
        if deps.db_execute("DELETE FROM faculty_profiles WHERE id = %s", (profile_id,)) is None:
            DEMO_PROFILES[:] = [p for p in DEMO_PROFILES if p["id"] != profile_id]
        deps.write_audit_log("faculty_profiles", profile_id, "刪除", before=before)
        return jsonify({"status": "success", "message": "已刪除"}), 200

    fields, problem = _parse_profile(request.get_json(silent=True) or {})
    if problem:
        return _error(problem)
    if any(p["name"] == fields["name"] and p["id"] != profile_id for p in profiles):
        return _error("已有同名老師的資料")
    _save(profile_id, fields, before)
    return jsonify({"status": "success", "message": "已更新"}), 200
