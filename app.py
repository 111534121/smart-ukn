from flask import Flask, request, jsonify, session, redirect, send_from_directory, make_response, Response
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from werkzeug.security import check_password_hash
# pyrefly: ignore [missing-import]
from werkzeug.utils import secure_filename
from functools import wraps
# pyrefly: ignore [missing-import]
import mysql.connector
import os
import sys
import json
import uuid
import csv
from io import StringIO
from datetime import datetime, timedelta

# 設定 Windows 終端輸出為 UTF-8
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try: sys.stderr.reconfigure(encoding='utf-8')
    except Exception: pass

# ==========================================
# Smart UKN 康寧大學智慧校園服務平台 - 後端核心 (3NF & 7 大升級模組)
# ==========================================

app = Flask(
    __name__,
    static_folder="static",
    static_url_path=""
)
app.secret_key = os.getenv("SECRET_KEY", "smart_ukn_secret_session_key_2026")

# 允許跨網域與跨裝置請求，並支援 session cookies
CORS(app, supports_credentials=True)

# 檔案上傳設定 (支援 PDF 檔與證照、比賽照片)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "uploads")
FORMS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "forms")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FORMS_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp", "svg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file_obj, prefix="file"):
    """安全儲存上傳之 PDF 或照片檔案並回傳 (relative_url, original_filename, file_type)"""
    if not file_obj or not file_obj.filename:
        return None, None, None
    raw_name = file_obj.filename
    basename = os.path.basename(raw_name)
    if not allowed_file(basename):
        return None, None, None
    ext = basename.rsplit(".", 1)[1].lower() if "." in basename else ""
    safe_base = secure_filename(basename.rsplit(".", 1)[0]) or prefix
    unique_name = f"{prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.{ext}"
    target_path = os.path.join(UPLOAD_FOLDER, unique_name)
    file_obj.save(target_path)
    file_type = "pdf" if ext == "pdf" else "image"
    relative_url = f"/uploads/{unique_name}"
    return relative_url, basename, file_type

@app.route("/uploads/<path:filename>")
def serve_uploaded_file(filename):
    """安全提供靜態上傳檔案與 PDF 在線預覽"""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/forms/<path:filename>")
def serve_form_file(filename):
    """提供申辦表單下載，若檔案不存在則動態生成示範表單以供下載"""
    target_path = os.path.join(FORMS_FOLDER, filename)
    if not os.path.exists(target_path):
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(f"【康寧大學官方行政申辦表單範本】\n表單代碼：{filename}\n說明：請填妥本表後送交相關處室核章。\n下載時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return send_from_directory(FORMS_FOLDER, filename, as_attachment=True)

# ==========================================
# 1. 資料庫連線配置
# ==========================================

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "smart_ukn"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "charset": "utf8mb4"
}

def get_db_connection():
    """嘗試取得 MySQL 連線，若失敗回傳 None 以供示範模式無縫接管"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except Exception:
        return None
    return None

def is_db_available():
    conn = get_db_connection()
    if conn:
        conn.close()
        return True
    return False

# ==========================================
# 權限控管裝飾器
# ==========================================

def login_required(f):
    """限制僅已登入之使用者存取"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "username" not in session:
            return jsonify({"status": "error", "message": "請先登入系統"}), 401
        return f(*args, **kwargs)
    return wrapper

def role_required(*allowed_roles):
    """限制僅特定身分角色可存取"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if "username" not in session:
                return jsonify({"status": "error", "message": "請先登入系統"}), 401
            if session.get("role") not in allowed_roles:
                return jsonify({"status": "error", "message": "權限不足，僅限特定身分存取"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ==========================================
# 2. 示範模式 3NF 資料引擎 (Demo Fallback Storage)
#    保證即使 MySQL 離線也能 100% 完整展示！
# ==========================================

GRADUATION_CREDIT_THRESHOLD = 128
GRADUATION_CERT_REQUIREMENT = 2

DEMO_DEPARTMENTS = [
    {"dept_id": "CS", "dept_name": "資訊科技與應用學系", "college_name": "創新與管理學院"},
    {"dept_id": "NUR", "dept_name": "護理學系", "college_name": "健康照護學院"},
    {"dept_id": "ENG", "dept_name": "應用外語學系", "college_name": "人文與教育學院"},
    {"dept_id": "GEN", "dept_name": "通識教育中心", "college_name": "全校共同教學單位"}
]

DEMO_STUDENTS = [
    {"student_id": "S112001", "full_name": "王小明", "dept_id": "CS", "dept_name": "資訊科技與應用學系", "admission_year": 112, "class_name": "資科二甲", "parent_phone": "0912-345-678"},
    {"student_id": "S112002", "full_name": "李美華", "dept_id": "CS", "dept_name": "資訊科技與應用學系", "admission_year": 112, "class_name": "資科二甲", "parent_phone": "0922-333-444"},
    {"student_id": "S112003", "full_name": "張建華", "dept_id": "NUR", "dept_name": "護理學系", "admission_year": 112, "class_name": "護理二乙", "parent_phone": "0933-555-666"},
    {"student_id": "S112004", "full_name": "陳冠宇", "dept_id": "CS", "dept_name": "資訊科技與應用學系", "admission_year": 112, "class_name": "資科二乙", "parent_phone": "0955-222-111"},
    {"student_id": "S112005", "full_name": "林雨潔", "dept_id": "CS", "dept_name": "資訊科技與應用學系", "admission_year": 112, "class_name": "資科二甲", "parent_phone": "0966-777-888"}
]

_DEMO_PW_123456 = "pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c"
_DEMO_PW_ADMIN123 = "pbkdf2:sha256:1000000$2XQfvmmn75wVJUKc$59cac19325e7e89df728fdc0ee86208fc0ae12ab71fc630fbaa890f2f919d14c"

DEMO_USERS = [
    {"user_id": 1, "username": "student1", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112001", "full_name": "王小明"},
    {"user_id": 2, "username": "student2", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112002", "full_name": "李美華"},
    {"user_id": 3, "username": "parent1", "password_hash": _DEMO_PW_123456, "role": "家長", "student_id": "S112001", "full_name": "王大明 (小明家長)"},
    {"user_id": 4, "username": "staff1", "password_hash": _DEMO_PW_123456, "role": "教職員", "student_id": None, "full_name": "周立威 (教務處職員)"},
    {"user_id": 6, "username": "teacher1", "password_hash": _DEMO_PW_123456, "role": "老師", "student_id": None, "full_name": "陳雅婷 老師", "dept_id": "CS", "dept_name": "資訊科技與應用學系", "advised_class": "資科二甲"},
    {"user_id": 5, "username": "admin", "password_hash": _DEMO_PW_ADMIN123, "role": "管理員", "student_id": None, "full_name": "系統超級管理員"}
]

DEMO_CATEGORIES = [
    {"category_id": 1, "category_name": "教務學則與選課", "icon": "📖", "sort_order": 1, "subcategories": ["停修/棄修手續", "先修與擋修規定", "畢業學分資格"]},
    {"category_id": 2, "category_name": "學務生輔與請假", "icon": "📝", "sort_order": 2, "subcategories": ["學生請假辦法", "缺課扣考", "學業二一預警"]},
    {"category_id": 3, "category_name": "證照抵免與獎助", "icon": "🏆", "sort_order": 3, "subcategories": ["語言證照抵免", "專業證照獎勵金"]},
    {"category_id": 4, "category_name": "總務校園與設施", "icon": "🏢", "sort_order": 4, "subcategories": ["學生證補發", "停車證申請"]}
]

DEMO_KNOWLEDGE_BASE = [
    {
        "id": 1,
        "category_id": 1,
        "category_name": "教務學則與選課",
        "subcategory": "停修/棄修手續",
        "keyword": "棄修",
        "official_term": "停修課程辦理規定",
        "content": "學生於加退選截止後，因特殊原因無法繼續修習某門課程，得於學期第 10-12 週申請停修（每學期以 2 科為限）。停修課程仍須登記於歷年成績單，但成績欄註記「停修」，不計入該學期學分數計算，且停修後修習學分數不得低於該學期最低應修學分。",
        "doc_name": "康寧大學學生學則.pdf",
        "page": 12,
        "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    },
    {
        "id": 2,
        "category_id": 2,
        "category_name": "學務生輔與請假",
        "subcategory": "學生請假辦法",
        "keyword": "病假",
        "official_term": "學生請假規則",
        "content": "學生因病無法到校上課，應於請假日當日起 3 日內（含例假日）登入校務系統提出線上請假申請，並檢附健保特約醫療院所開立之就醫證明或診斷書，經導師核准後始完成請假手續。",
        "doc_name": "康寧大學學生請假規則.pdf",
        "page": 5,
        "url": "https://www.ukn.edu.tw/p/412-1000-382.php?Lang=zh-tw"
    },
    {
        "id": 3,
        "category_id": 3,
        "category_name": "證照抵免與獎助",
        "subcategory": "語言證照抵免",
        "keyword": "英文抵免",
        "official_term": "語言證照抵免辦法",
        "content": "學生取得多益測驗 (TOEIC) 550 分以上、全民英檢 (GEPT) 中級複試通過或同等級國際外語證照者，得於每學期開學後至加退選截止前，檢附成績單正本與影本至通識教育中心申請抵免大一共同外語「基礎英文(一)」及「基礎英文(二)」共 4 學分。",
        "doc_name": "康寧大學共同外語學分抵免辦法.pdf",
        "page": 3,
        "url": "https://www.ukn.edu.tw/p/412-1000-383.php?Lang=zh-tw"
    },
    {
        "id": 4,
        "category_id": 1,
        "category_name": "教務學則與選課",
        "subcategory": "先修與擋修規定",
        "keyword": "擋修",
        "official_term": "先修科目未通過擋修規定",
        "content": "本校各系所必修課程若訂有先修科目限制（例如：程式設計(一) 為 資料結構 之先修科目），學生該先修科目未達及格標準（60 分）者，電腦選課系統將自動擋修，不得修習後續先修關聯課程，需待先修科目重修及格後始得修習。",
        "doc_name": "康寧大學課程選修要點.pdf",
        "page": 8,
        "url": "https://www.ukn.edu.tw/p/412-1000-384.php?Lang=zh-tw"
    },
    {
        "id": 5,
        "category_id": 3,
        "category_name": "證照抵免與獎助",
        "subcategory": "專業證照獎勵金",
        "keyword": "證照補助",
        "official_term": "學生取得專業證照獎勵辦法",
        "content": "學生在學期間取得教育部認可之乙級以上技術士證照或國際專業原廠認證，每張最高可申請新台幣 3,000 至 10,000 元獎勵金。申請期間為每學期第 1 至 5 週，請至研發處實習就業組辦理。",
        "doc_name": "康寧大學學生專業證照獎勵要點.pdf",
        "page": 2,
        "url": "https://www.ukn.edu.tw/p/412-1000-385.php?Lang=zh-tw"
    }
]

DEMO_SYNONYMS = [
    {"synonym_id": 1, "category_id": 1, "user_keyword": "棄修", "official_term": "停修課程辦理規定"},
    {"synonym_id": 2, "category_id": 1, "user_keyword": "退選", "official_term": "停修課程辦理規定"},
    {"synonym_id": 3, "category_id": 1, "user_keyword": "不要修了", "official_term": "停修課程辦理規定"},
    {"synonym_id": 4, "category_id": 1, "user_keyword": "擋修", "official_term": "先修科目未通過擋修規定"},
    {"synonym_id": 5, "category_id": 1, "user_keyword": "先修沒過", "official_term": "先修科目未通過擋修規定"},
    {"synonym_id": 6, "category_id": 3, "user_keyword": "英文抵免", "official_term": "語言證照抵免辦法"},
    {"synonym_id": 7, "category_id": 3, "user_keyword": "英檢抵免", "official_term": "語言證照抵免辦法"},
    {"synonym_id": 8, "category_id": 3, "user_keyword": "多益抵免", "official_term": "語言證照抵免辦法"},
    {"synonym_id": 9, "category_id": 2, "user_keyword": "病假", "official_term": "學生請假規則"},
    {"synonym_id": 10, "category_id": 2, "user_keyword": "事假", "official_term": "學生請假規則"},
    {"synonym_id": 11, "category_id": 3, "user_keyword": "證照錢", "official_term": "學生取得專業證照獎勵辦法"},
    {"synonym_id": 12, "category_id": 1, "user_keyword": "二一", "official_term": "學業退學規定"},
    {"synonym_id": 13, "category_id": 1, "user_keyword": "暑修", "official_term": "暑期開班授課規定"}
]

DEMO_COURSES = [
    {"course_id": "CS101", "course_name": "計算機概論", "credits": 3, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大一上", "description": "計算機科學基礎、電腦架構、二進位運算、作業系統與網路概論。"},
    {"course_id": "CS102", "course_name": "程式設計(一)", "credits": 3, "prerequisite_id": "CS101", "prerequisite_name": "計算機概論", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大一下", "description": "Python 與 C 語言基礎邏輯、變數、迴圈、陣列與函式設計。"},
    {"course_id": "CS201", "course_name": "資料結構", "credits": 3, "prerequisite_id": "CS102", "prerequisite_name": "程式設計(一)", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大二上", "description": "陣列、鏈結串列、堆疊、佇列、二元樹、圖形演算法與搜尋排序。"},
    {"course_id": "CS202", "course_name": "物件導向程式設計", "credits": 3, "prerequisite_id": "CS102", "prerequisite_name": "程式設計(一)", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大二下", "description": "類別、封裝、繼承、多型、Java/C++ 實作與 GUI 設計。"},
    {"course_id": "CS301", "course_name": "演算法分析", "credits": 3, "prerequisite_id": "CS201", "prerequisite_name": "資料結構", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大三上", "description": "時間複雜度、分治演算法、貪婪演算法、動態規劃與 NP 問題。"},
    {"course_id": "CS302", "course_name": "資料庫系統概論", "credits": 3, "prerequisite_id": "CS201", "prerequisite_name": "資料結構", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大三上", "description": "關聯式資料庫、SQL 查詢最佳化、3NF 正規化與 MySQL/PostgreSQL 實務。"},
    {"course_id": "CS303", "course_name": "網頁前後端開發實務", "credits": 3, "prerequisite_id": "CS102", "prerequisite_name": "程式設計(一)", "is_required": 0, "course_type": "專業選修", "dept_id": "CS", "semester_suggest": "大三上", "description": "HTML5/Tailwind/FastAPI/Flask 全端系統整合與 REST API。"},
    {"course_id": "CS304", "course_name": "雲端運算與虛擬化", "credits": 3, "prerequisite_id": "CS101", "prerequisite_name": "計算機概論", "is_required": 0, "course_type": "專業選修", "dept_id": "CS", "semester_suggest": "大三下", "description": "Docker 容器化、Kubernetes、AWS 與微服務架構實戰。"},
    {"course_id": "CS401", "course_name": "畢業專題研討(一)", "credits": 3, "prerequisite_id": "CS302", "prerequisite_name": "資料庫系統概論", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大四上", "description": "綜合資訊系統開發、專題實作、系統架構設計與成果展覽。"},
    {"course_id": "CS402", "course_name": "畢業專題研討(二)", "credits": 3, "prerequisite_id": "CS401", "prerequisite_name": "畢業專題研討(一)", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "大四下", "description": "畢業專題成果報告撰寫、系統部署與校外競賽發表。"},
    {"course_id": "EN101", "course_name": "基礎英文(一)", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "共同必修", "dept_id": "GEN", "semester_suggest": "大一上", "description": "大一基礎外語聽說讀寫與實用生活英語。"},
    {"course_id": "EN102", "course_name": "基礎英文(二)", "credits": 2, "prerequisite_id": "EN101", "prerequisite_name": "基礎英文(一)", "is_required": 1, "course_type": "共同必修", "dept_id": "GEN", "semester_suggest": "大一下", "description": "進階商用英文與學術閱讀報告寫作。"},
    {"course_id": "GE101", "course_name": "大學之道與校園倫理", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 0, "course_type": "通識教育", "dept_id": "GEN", "semester_suggest": "大一上", "description": "校園生活適應、生命教育、學術誠信與職場倫理。"},
    {"course_id": "GE102", "course_name": "跨領域思維與創新科技", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 0, "course_type": "通識教育", "dept_id": "GEN", "semester_suggest": "大二上", "description": "人工智慧生活應用、設計思考與數位轉型思維。"},
    {"course_id": "GE103", "course_name": "環境永續與社會責任", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 0, "course_type": "通識教育", "dept_id": "GEN", "semester_suggest": "大二下", "description": "ESG 永續發展目標、生態保育與社會公益實踐。"}
]

DEMO_STUDENT_CREDITS = [
    {"credit_id": 1, "student_id": "S112001", "course_id": "CS101", "semester": "112-1", "score": 85.00, "is_passed": 1},
    {"credit_id": 2, "student_id": "S112001", "course_id": "CS102", "semester": "112-2", "score": 55.00, "is_passed": 0},
    {"credit_id": 3, "student_id": "S112001", "course_id": "EN101", "semester": "112-1", "score": 78.00, "is_passed": 1},
    {"credit_id": 4, "student_id": "S112001", "course_id": "GE101", "semester": "112-1", "score": 82.00, "is_passed": 1},
    {"credit_id": 5, "student_id": "S112002", "course_id": "CS101", "semester": "112-1", "score": 92.50, "is_passed": 1},
    {"credit_id": 6, "student_id": "S112002", "course_id": "CS102", "semester": "112-2", "score": 88.00, "is_passed": 1},
    {"credit_id": 7, "student_id": "S112002", "course_id": "CS201", "semester": "113-1", "score": 85.00, "is_passed": 1},
    {"credit_id": 8, "student_id": "S112002", "course_id": "EN101", "semester": "112-1", "score": 80.00, "is_passed": 1},
    {"credit_id": 9, "student_id": "S112002", "course_id": "GE101", "semester": "112-1", "score": 90.00, "is_passed": 1},
    {"credit_id": 10, "student_id": "S112004", "course_id": "CS101", "semester": "112-1", "score": 88.00, "is_passed": 1},
    {"credit_id": 11, "student_id": "S112004", "course_id": "CS102", "semester": "112-2", "score": 91.00, "is_passed": 1},
    {"credit_id": 12, "student_id": "S112004", "course_id": "CS201", "semester": "113-1", "score": 84.00, "is_passed": 1},
    {"credit_id": 13, "student_id": "S112004", "course_id": "EN101", "semester": "112-1", "score": 80.00, "is_passed": 1}
]

DEMO_CHECKLISTS = [
    {
        "item_id": 1,
        "category_id": 1,
        "category_name": "課務組",
        "business_name": "學生課程停修（棄修）申請",
        "steps_json": [
            "至校務資訊系統登入『停修申請表』",
            "列印紙本停修申請單",
            "親自送請任課教師簽章同意",
            "送請系所導師及系主任簽章",
            "於第12週五前送交教務處課務組核備"
        ],
        "required_docs": "停修申請單紙本、歷年成績單正本",
        "office_hours": "週一至週五 08:30 - 17:00",
        "office_location": "康寧樓 2 樓 A201 (課務組)",
        "contact_phone": "02-2632-1181 分機 310, 312",
        "form_download_url": "/forms/course_withdraw_form.pdf",
        "system_url": "https://sys.ukn.edu.tw/cos_withdraw",
        "deadline_week_info": "第 10-12 週 (本週受理中)",
        "related_kb_id": 1,
        "audience": "學生"
    },
    {
        "item_id": 2,
        "category_id": 2,
        "category_name": "生輔組",
        "business_name": "學生請假申請 (病假/事假)",
        "steps_json": [
            "登入學生資訊系統填寫請假單",
            "上傳就醫證明或相關佐證文件圖檔",
            "送出後通知導師進行線上簽核",
            "請假超過3日由生輔組組長複核",
            "系統顯示審核通過即完成登錄"
        ],
        "required_docs": "健保特約就醫證明、就診收據影本",
        "office_hours": "週一至週五 08:00 - 17:30",
        "office_location": "行政大樓 1 樓 學務處生輔組",
        "contact_phone": "02-2632-1181 分機 211",
        "form_download_url": "/forms/leave_application_form.pdf",
        "system_url": "https://sys.ukn.edu.tw/student_leave",
        "deadline_week_info": "請假日當日起 3 日內",
        "related_kb_id": 2,
        "audience": "學生"
    },
    {
        "item_id": 3,
        "category_id": 3,
        "category_name": "通識中心",
        "business_name": "外語證照免修與學分抵免",
        "steps_json": [
            "填寫通識外語抵免申請表",
            "備妥多益/英檢/雅思成績單正本及影本各一份",
            "送交通識教育中心辦公室查驗正本",
            "教務處課務組複審學分折抵",
            "次學期初於歷年成績單確認抵免註記"
        ],
        "required_docs": "外語檢定成績單正本、影本、抵免申請書",
        "office_hours": "週一至週五 09:00 - 16:30",
        "office_location": "卓越樓 3 樓 C305 (通識教育中心)",
        "contact_phone": "02-2632-1181 分機 520, 521",
        "form_download_url": "/forms/english_waiver_form.pdf",
        "system_url": "https://sys.ukn.edu.tw/credit_waive",
        "deadline_week_info": "開學前至加退選截止 (已截止)",
        "related_kb_id": 3,
        "audience": "學生"
    },
    {
        "item_id": 4,
        "category_id": 1,
        "category_name": "註冊組",
        "business_name": "學士班畢業學分資格預審",
        "steps_json": [
            "登入畢業審查系統列印學分檢核表",
            "核對系專業必修、選修與通識學分缺口",
            "確認英文畢業門檻與專題通過證明",
            "至系辦公室請系主任初審簽章",
            "送交教務處註冊組進行畢業資格決審"
        ],
        "required_docs": "歷年成績單正本、畢業學分預審表、外語通過證明",
        "office_hours": "週一至週五 08:30 - 17:00",
        "office_location": "康寧樓 2 樓 A202 (註冊組)",
        "contact_phone": "02-2632-1181 分機 321, 322",
        "form_download_url": "/forms/graduation_audit_form.pdf",
        "system_url": "https://sys.ukn.edu.tw/grad_audit",
        "deadline_week_info": "大四第 8-16 週 (進行中)",
        "related_kb_id": 4,
        "audience": "學生"
    },
    {
        "item_id": 5,
        "category_id": 3,
        "category_name": "研發處",
        "business_name": "專業證照與競賽獲獎獎勵金申請",
        "steps_json": [
            "登入研發處證照獎勵申請平台",
            "填寫證照/競賽名稱、證書字號與發證單位",
            "上傳證書正反面與郵局存摺封面圖檔",
            "列印紙本印領清冊並親筆簽名",
            "送交研發處實習就業組審核並撥款"
        ],
        "required_docs": "證照證書影本、郵局存摺封面影本、印領清冊",
        "office_hours": "週一至週五 09:00 - 17:00",
        "office_location": "圖資大樓 2 樓 研發處實習就業組",
        "contact_phone": "02-2632-1181 分機 612",
        "form_download_url": "/forms/certificate_reward_form.pdf",
        "system_url": "https://sys.ukn.edu.tw/cert_reward",
        "deadline_week_info": "每學期第 1-5 週",
        "related_kb_id": 5,
        "audience": "學生"
    }
]

# 申辦進度持久化 Demo Storage
DEMO_APPLICATION_PROGRESS = {
    "S112001": {
        1: {"completed_steps": [0, 1], "notes": {0: "已於系統線上填單完成", 1: "已列印紙本", 2: "等候任課教師簽章中"}},
        3: {"completed_steps": [0], "notes": {0: "已填寫表單"}}
    }
}

# 未命中搜尋與滿意度 Demo Storage
DEMO_UNMATCHED_QUERIES = [
    {"query_id": 1, "query_text": "退費手續", "search_count": 14, "status": "待處理", "resolved_term": None, "last_searched_at": "2026-09-23 09:40:00"},
    {"query_id": 2, "query_text": "兵役緩徵", "search_count": 9, "status": "待處理", "resolved_term": None, "last_searched_at": "2026-09-22 14:15:00"},
    {"query_id": 3, "query_text": "宿舍門禁時間", "search_count": 18, "status": "待處理", "resolved_term": None, "last_searched_at": "2026-09-23 10:10:00"},
    {"query_id": 4, "query_text": "機車通行證申請", "search_count": 22, "status": "待處理", "resolved_term": None, "last_searched_at": "2026-09-23 08:30:00"},
    {"query_id": 5, "query_text": "轉系規定", "search_count": 7, "status": "待處理", "resolved_term": None, "last_searched_at": "2026-09-21 16:50:00"}
]

DEMO_SEARCH_FEEDBACK = [
    {"feedback_id": 1, "kb_id": 1, "query_text": "棄修", "is_helpful": 1, "comment": "流程很清楚，知道要去課務組了！", "created_at": "2026-09-22 11:20:00"},
    {"feedback_id": 2, "kb_id": 4, "query_text": "擋修", "is_helpful": 1, "comment": "終於知道為什麼不能選資料結構了", "created_at": "2026-09-22 13:45:00"},
    {"feedback_id": 3, "kb_id": 3, "query_text": "英文抵免", "is_helpful": 1, "comment": "感謝提供多益 550 分門檻資訊", "created_at": "2026-09-23 09:10:00"},
    {"feedback_id": 4, "kb_id": 2, "query_text": "病假", "is_helpful": 0, "comment": "希望能直接線上送假單，不想跑流程", "created_at": "2026-09-23 10:05:00"}
]

DEMO_PRIVACY_SETTINGS = {
    "S112001": {"parent_alert_consent": 1, "advisor_alert_consent": 1},
    "S112002": {"parent_alert_consent": 0, "advisor_alert_consent": 1},
    "S112004": {"parent_alert_consent": 1, "advisor_alert_consent": 1}
}

DEMO_GRADUATION_REQUIREMENTS = {
    "CS": {
        "dept_id": "CS",
        "total_credits_req": 128,
        "major_required_req": 60,
        "major_elective_req": 30,
        "general_req": 28,
        "english_threshold_name": "多益測驗 550 分以上 或 通過進階實用英語檢定",
        "ethics_req": 2,
        "project_req": 6
    }
}

DEMO_DEADLINES = [
    {
        "deadline_id": 1,
        "title": "113-1 學期課程停修申請",
        "category": "教務處課務組",
        "semester_week": 11,
        "start_date": "2026-10-01",
        "end_date": "2026-10-18",
        "applies_to_role": "學生",
        "applies_to_dept": "CS",
        "related_system_url": "https://sys.ukn.edu.tw/cos_withdraw",
        "description": "學期第 10-12 週開放停修申請，每人以 2 科為限，須完成任課教師、導師與主任簽章。",
        "status_badge": "進行中 (剩 3 天)",
        "countdown_days": 3,
        "is_urgent": True
    },
    {
        "deadline_id": 2,
        "title": "期中預警評量與導師學習輔導訪談",
        "category": "學務處/教務處",
        "semester_week": 11,
        "start_date": "2026-10-05",
        "end_date": "2026-10-20",
        "applies_to_role": "學生,老師,家長",
        "applies_to_dept": "CS",
        "related_system_url": "https://sys.ukn.edu.tw/early_warning",
        "description": "期中成績不及格達 1/2 者列入預警，導師將安排個別學習輔導與座談。",
        "status_badge": "進行中 (剩 5 天)",
        "countdown_days": 5,
        "is_urgent": True
    },
    {
        "deadline_id": 3,
        "title": "大四應屆畢業生學分資格預審",
        "category": "教務處註冊組",
        "semester_week": 11,
        "start_date": "2026-09-15",
        "end_date": "2026-11-30",
        "applies_to_role": "學生",
        "applies_to_dept": "CS",
        "related_system_url": "https://sys.ukn.edu.tw/grad_audit",
        "description": "大四學生請至註冊組核對必選修、通識與外語門檻缺口。",
        "status_badge": "進行中 (剩 35 天)",
        "countdown_days": 35,
        "is_urgent": False
    },
    {
        "deadline_id": 4,
        "title": "共同外語與證照學分抵免申請",
        "category": "通識教育中心",
        "semester_week": 3,
        "start_date": "2026-09-01",
        "end_date": "2026-09-15",
        "applies_to_role": "學生",
        "applies_to_dept": "all",
        "related_system_url": "https://sys.ukn.edu.tw/credit_waive",
        "description": "大一共同外語抵免申請已截止，逾期者請於下學期初辦理。",
        "status_badge": "已截止",
        "countdown_days": 0,
        "is_urgent": False
    },
    {
        "deadline_id": 5,
        "title": "暑期重補修意願登記與開班調查",
        "category": "教務處課務組",
        "semester_week": 14,
        "start_date": "2026-11-01",
        "end_date": "2026-11-20",
        "applies_to_role": "學生",
        "applies_to_dept": "CS",
        "related_system_url": "https://sys.ukn.edu.tw/summer_courses",
        "description": "先修科目不及格需重修者，可預先登記暑期課程開班意願。",
        "status_badge": "尚未開放",
        "countdown_days": 20,
        "is_urgent": False
    }
]

DEMO_CERTIFICATES = [
    {"cert_id": 1, "student_id": "S112001", "cert_name": "丙級電腦硬體裝修技術士", "issuing_org": "勞動部勞動力發展署", "cert_number": "113-CS-004521", "theory_score": 82.00, "practical_score": 88.00, "cert_status": "及格發證", "issue_date": "2026-06-20"},
    {"cert_id": 2, "student_id": "S112001", "cert_name": "乙級電腦軟體應用技術士", "issuing_org": "勞動部勞動力發展署", "cert_number": "114-CS-008912", "theory_score": 86.50, "practical_score": 92.00, "cert_status": "及格發證", "issue_date": "2026-08-15"}
]

DEMO_COMPETITIONS = []
DEMO_VISITOR_LOGS = []
DEMO_FRICTION_REPORTS = []

CAMPUS_CONTACT_DIRECTORY = [
    {"office": "教務處課務組", "location": "康寧樓 2 樓 A201", "phone": "02-2632-1181 分機 310, 312", "business": "選課、停修、先修擋修、排課"},
    {"office": "教務處註冊組", "location": "康寧樓 2 樓 A202", "phone": "02-2632-1181 分機 321, 322", "business": "學籍、成績單、畢業學分審查、休退學"},
    {"office": "學務處生活輔導組", "location": "行政大樓 1 樓", "phone": "02-2632-1181 分機 211, 212", "business": "學生請假、獎懲、二一輔導、宿舍"},
    {"office": "通識教育中心", "location": "卓越樓 3 樓 C305", "phone": "02-2632-1181 分機 520, 521", "business": "共同外語抵免、通識學分檢核"},
    {"office": "研發處實習就業組", "location": "圖資大樓 2 樓", "phone": "02-2632-1181 分機 612", "business": "專業證照獎勵、校外實習、就業輔導"}
]

# ==========================================
# 3. 靜態網頁與首頁路由
# ==========================================

@app.route("/")
def serve_index():
    return app.send_static_file("index.html")

@app.route("/login")
def serve_login():
    return app.send_static_file("login.html")

@app.route("/admin")
def serve_admin():
    return app.send_static_file("admin.html")

# ==========================================
# 4. 身分認證與 Session 管理 API (/api/auth)
# ==========================================

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()

    if not username or not password:
        return jsonify({"status": "error", "message": "請輸入帳號與密碼"}), 400

    conn = get_db_connection()
    user_record = None

    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            sql = "SELECT u.*, s.dept_id, s.class_name, d.dept_name FROM users u LEFT JOIN students s ON u.student_id = s.student_id LEFT JOIN departments d ON s.dept_id = d.dept_id WHERE u.username = %s LIMIT 1"
            cursor.execute(sql, (username,))
            candidate = cursor.fetchone()
            cursor.close()
            conn.close()
            if candidate and check_password_hash(candidate["password_hash"], password):
                user_record = candidate
        except Exception:
            if conn: conn.close()

    if not user_record:
        for u in DEMO_USERS:
            if u["username"] == username and check_password_hash(u["password_hash"], password):
                user_record = dict(u)
                if u.get("student_id"):
                    stu = next((s for s in DEMO_STUDENTS if s["student_id"] == u["student_id"]), None)
                    if stu:
                        user_record["dept_id"] = stu["dept_id"]
                        user_record["class_name"] = stu["class_name"]
                        user_record["dept_name"] = stu.get("dept_name", "資訊科技與應用學系")
                break

    if user_record:
        session.clear()
        session["user_id"] = user_record["user_id"]
        session["username"] = user_record["username"]
        session["role"] = user_record["role"]
        session["full_name"] = user_record["full_name"]
        session["student_id"] = user_record.get("student_id")
        session["dept_id"] = user_record.get("dept_id", "CS")
        session["dept_name"] = user_record.get("dept_name", "資訊科技與應用學系")
        session["class_name"] = user_record.get("class_name", "")
        session["advised_class"] = user_record.get("advised_class")

        return jsonify({
            "status": "success",
            "message": f"歡迎登入！{user_record['full_name']} ({user_record['role']})",
            "user": {
                "user_id": user_record["user_id"],
                "username": user_record["username"],
                "role": user_record["role"],
                "full_name": user_record["full_name"],
                "student_id": user_record.get("student_id"),
                "dept_name": user_record.get("dept_name", "資訊科技與應用學系"),
                "class_name": user_record.get("class_name", ""),
                "advised_class": user_record.get("advised_class")
            }
        }), 200

    return jsonify({"status": "error", "message": "帳號或密碼錯誤，請重新確認！"}), 401

@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"status": "success", "message": "已成功登出系統"}), 200

@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    if "username" in session:
        return jsonify({
            "status": "success",
            "is_authenticated": True,
            "user": {
                "user_id": session.get("user_id"),
                "username": session.get("username"),
                "role": session.get("role"),
                "full_name": session.get("full_name"),
                "student_id": session.get("student_id"),
                "dept_name": session.get("dept_name", "資訊科技與應用學系"),
                "class_name": session.get("class_name", ""),
                "advised_class": session.get("advised_class")
            }
        }), 200
    return jsonify({"status": "success", "is_authenticated": False, "user": None}), 200

# ==========================================
# 5. 校曆連動與期限雷達 API (功能 2)
# ==========================================

@app.route("/api/calendar/current-week", methods=["GET"])
def get_current_week():
    """回傳當前學期、當週校曆週次與重要辦理事項"""
    now = datetime.now()
    semester_name = "113 學年度第 1 學期"
    current_week = 11  # 當前學期第 11 週
    return jsonify({
        "status": "success",
        "semester_name": semester_name,
        "current_week": current_week,
        "current_date": now.strftime("%Y-%m-%d"),
        "active_highlights": [
            {"title": "課程停修申請", "badge": "本週受理中 (剩 3 天)", "office": "課務組", "url": "/#tab-checklists", "is_urgent": True},
            {"title": "期中預警評量", "badge": "輔導進行中 (剩 5 天)", "office": "學務處", "url": "/#tab-radar", "is_urgent": True},
            {"title": "大四學分預審", "badge": "審查中 (剩 35 天)", "office": "註冊組", "url": "/#tab-courses", "is_urgent": False}
        ]
    }), 200

@app.route("/api/deadlines", methods=["GET", "POST"])
def manage_deadlines():
    global DEMO_DEADLINES
    conn = get_db_connection()
    role = request.args.get("role") or session.get("role", "all")

    if request.method == "GET":
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM deadlines ORDER BY end_date ASC")
                rows = cursor.fetchall()
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "data": rows}), 200
            except Exception:
                if conn: conn.close()
        return jsonify({"status": "success", "data": DEMO_DEADLINES}), 200

    if request.method == "POST":
        if session.get("role") not in ("管理員", "教職員"):
            return jsonify({"status": "error", "message": "權限不足"}), 403
        data = request.get_json(silent=True) or {}
        title = data.get("title", "").strip()
        category = data.get("category", "課務組")
        end_date = data.get("end_date", "")
        if not title or not end_date:
            return jsonify({"status": "error", "message": "標題與截止日為必填"}), 400

        new_id = max([d["deadline_id"] for d in DEMO_DEADLINES], default=0) + 1
        item = {
            "deadline_id": new_id,
            "title": title,
            "category": category,
            "semester_week": int(data.get("semester_week", 11)),
            "start_date": data.get("start_date", datetime.now().strftime("%Y-%m-%d")),
            "end_date": end_date,
            "applies_to_role": data.get("applies_to_role", "all"),
            "applies_to_dept": data.get("applies_to_dept", "all"),
            "related_system_url": data.get("related_system_url", ""),
            "description": data.get("description", ""),
            "status_badge": "進行中"
        }
        DEMO_DEADLINES.append(item)
        return jsonify({"status": "success", "message": "期限項目新增成功！", "data": item}), 201

# ==========================================
# 6. 規章搜尋、滿意度反饋與未命中成長庫 API (功能 4)
# ==========================================

@app.route("/api/search", methods=["POST"])
def search_knowledge():
    global DEMO_UNMATCHED_QUERIES
    data = request.get_json(silent=True) or {}
    user_query = str(data.get("query", "")).strip()

    if len(user_query) < 1:
        return jsonify({"status": "error", "message": "搜尋關鍵字字數不能為空"}), 400

    conn = get_db_connection()
    synonym_map = {}
    kb_records = []

    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT user_keyword, official_term FROM synonym_dictionary")
            for row in cursor.fetchall():
                synonym_map[row["user_keyword"].lower()] = row["official_term"]

            cursor.execute("SELECT k.*, c.category_name FROM knowledge_base k LEFT JOIN knowledge_categories c ON k.category_id = c.category_id")
            kb_records = cursor.fetchall()
            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    if not kb_records:
        synonym_map = {s["user_keyword"].lower(): s["official_term"] for s in DEMO_SYNONYMS}
        kb_records = DEMO_KNOWLEDGE_BASE

    # 1. 查找同義詞
    matched_official = synonym_map.get(user_query.lower())
    is_synonym = matched_official is not None
    search_term = matched_official if is_synonym else user_query

    # 2. 規章比對
    best_match = None
    all_matches = []

    for rule in kb_records:
        kw = rule.get("keyword", "")
        ot = rule.get("official_term", "")
        content = rule.get("content", "")
        subcat = rule.get("subcategory", "")

        score = 0
        if search_term.lower() in kw.lower() or kw.lower() in search_term.lower():
            score += 100
        if ot and (search_term.lower() in ot.lower() or ot.lower() in search_term.lower()):
            score += 90
        if user_query.lower() in kw.lower():
            score += 80
        if search_term.lower() in subcat.lower():
            score += 50
        if search_term.lower() in content.lower():
            score += 30

        if score > 0:
            all_matches.append({"score": score, "rule": rule})

    all_matches.sort(key=lambda x: x["score"], reverse=True)

    if all_matches:
        best_match = all_matches[0]["rule"]
        related_chk = next((c for c in DEMO_CHECKLISTS if c.get("related_kb_id") == best_match["id"] or best_match.get("keyword", "") in c["business_name"]), None)

        return jsonify({
            "status": "success",
            "matched": True,
            "kb_id": best_match["id"],
            "is_synonym_matched": is_synonym,
            "official_term": best_match.get("official_term") or matched_official or "",
            "search_term": search_term,
            "answer": best_match["content"],
            "source_doc": best_match["doc_name"],
            "page_num": best_match.get("page", 1),
            "source_url": best_match.get("url", "https://www.ukn.edu.tw"),
            "category_name": best_match.get("category_name", "教務學則與選課"),
            "subcategory": best_match.get("subcategory", "規章辦法"),
            "related_checklist": related_chk,
            "checklist": related_chk.get("steps_json", []) if related_chk else [],
            "all_matches": [m["rule"] for m in all_matches[:3]]
        }), 200

    # 3. 查無結果：自動記錄至未命中清單 (功能 4 閉環)
    existing_unmatched = next((u for u in DEMO_UNMATCHED_QUERIES if u["query_text"] == user_query), None)
    if existing_unmatched:
        existing_unmatched["search_count"] += 1
        existing_unmatched["last_searched_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    else:
        DEMO_UNMATCHED_QUERIES.append({
            "query_id": max([u["query_id"] for u in DEMO_UNMATCHED_QUERIES], default=0) + 1,
            "query_text": user_query,
            "search_count": 1,
            "status": "待處理",
            "resolved_term": None,
            "last_searched_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify({
        "status": "success",
        "matched": False,
        "is_synonym_matched": False,
        "official_term": "",
        "search_term": user_query,
        "answer": f"抱歉！校規法規資料庫中目前未檢索到與「{user_query}」直接相關的正式規章。本系統已自動將此關鍵字記錄至電算中心詞庫成長清單，管理員將於審核後補齊同義詞或新法規。建議您參考下方處室位置與分機進行洽詢。",
        "source_doc": "康寧大學法規專區與處室聯絡導覽",
        "page_num": "-",
        "source_url": "https://www.ukn.edu.tw",
        "contacts_directory": CAMPUS_CONTACT_DIRECTORY,
        "suggested_topics": ["停修課程", "英文證照抵免", "學生請假", "擋修規定", "二一退學"],
        "checklist": [],
        "all_matches": []
    }), 200

@app.route("/api/search/feedback", methods=["POST"])
def submit_search_feedback():
    """接收學生對搜尋結果的評價 (有幫助 / 沒幫助) (功能 4)"""
    global DEMO_SEARCH_FEEDBACK
    data = request.get_json(silent=True) or {}
    kb_id = data.get("kb_id")
    query_text = str(data.get("query_text", "")).strip()
    is_helpful = 1 if data.get("is_helpful") in (1, True, "1", "true") else 0
    comment = str(data.get("comment", "")).strip()

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO search_feedback (kb_id, query_text, is_helpful, comment) VALUES (%s, %s, %s, %s)", (kb_id, query_text, is_helpful, comment))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    DEMO_SEARCH_FEEDBACK.append({
        "feedback_id": len(DEMO_SEARCH_FEEDBACK) + 1,
        "kb_id": kb_id,
        "query_text": query_text,
        "is_helpful": is_helpful,
        "comment": comment,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    return jsonify({"status": "success", "message": "感謝您的評價與回饋！這將幫助系統更加完善。"}), 201

@app.route("/api/admin/unmatched-queries", methods=["GET"])
@role_required("管理員", "教職員")
def get_unmatched_queries():
    """後台查看學生搜了但找不到的關鍵字 (功能 4)"""
    queries = sorted(DEMO_UNMATCHED_QUERIES, key=lambda x: x["search_count"], reverse=True)
    return jsonify({"status": "success", "data": queries}), 200

@app.route("/api/admin/unmatched-queries/convert-synonym", methods=["POST"])
@role_required("管理員", "教職員")
def convert_unmatched_to_synonym():
    """管理員一鍵將未命中關鍵字轉為同義詞 (功能 4 閉環)"""
    global DEMO_SYNONYMS, DEMO_UNMATCHED_QUERIES
    data = request.get_json(silent=True) or {}
    query_id = data.get("query_id")
    user_keyword = str(data.get("user_keyword", "")).strip()
    official_term = str(data.get("official_term", "")).strip()
    category_id = int(data.get("category_id", 1))

    if not user_keyword or not official_term:
        return jsonify({"status": "error", "message": "搜尋關鍵字與官方標準名稱為必填"}), 400

    # 1. 加入同義詞庫
    new_id = max([s["synonym_id"] for s in DEMO_SYNONYMS], default=0) + 1
    DEMO_SYNONYMS.append({
        "synonym_id": new_id,
        "category_id": category_id,
        "user_keyword": user_keyword,
        "official_term": official_term
    })

    # 2. 標記未命中記錄為已處理
    for u in DEMO_UNMATCHED_QUERIES:
        if u["query_text"] == user_keyword or u.get("query_id") == query_id:
            u["status"] = "已轉同義詞"
            u["resolved_term"] = official_term

    return jsonify({"status": "success", "message": f"成功將「{user_keyword}」轉換為同義詞「{official_term}」！詞庫已即時更新。"}), 200

@app.route("/api/admin/search-feedback/stats", methods=["GET"])
@role_required("管理員", "教職員")
def get_search_feedback_stats():
    """後台搜尋滿意度統計 (功能 4)"""
    total = len(DEMO_SEARCH_FEEDBACK)
    helpful_count = sum(1 for f in DEMO_SEARCH_FEEDBACK if f["is_helpful"] == 1)
    unhelpful_count = total - helpful_count
    rate = round((helpful_count / total * 100), 1) if total > 0 else 100.0
    return jsonify({
        "status": "success",
        "total_feedback": total,
        "helpful_count": helpful_count,
        "unhelpful_count": unhelpful_count,
        "satisfaction_rate": rate,
        "recent_feedbacks": sorted(DEMO_SEARCH_FEEDBACK, key=lambda x: x.get("created_at", ""), reverse=True)[:10]
    }), 200

# ==========================================
# 7. 個人化課程地圖、擋修修復與骨牌被當試算 (功能 1 & 功能 5)
# ==========================================

@app.route("/api/courses", methods=["GET"])
def get_all_courses():
    """取得完整課程地圖（優先讀取 MySQL，離線回退 DEMO_COURSES）"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            sql = """
                SELECT c.course_id, c.course_name, c.credits, c.prerequisite_id, c.is_required, 
                       c.course_type, c.dept_id, c.semester_suggest, c.description,
                       p.course_name as prerequisite_name
                FROM course_map c
                LEFT JOIN course_map p ON c.prerequisite_id = p.course_id
                ORDER BY c.course_id ASC
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "data": rows}), 200
        except Exception:
            if conn: conn.close()

    return jsonify({"status": "success", "data": DEMO_COURSES}), 200

@app.route("/api/courses/check", methods=["POST", "GET"])
def check_courses_prerequisites():
    """修復後的先修擋修檢核 API：讀取真實課程地圖與修課狀態"""
    conn = get_db_connection()
    courses = []

    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            sql = """
                SELECT c.course_id, c.course_name, c.credits, c.prerequisite_id, c.is_required,
                       c.course_type, c.dept_id, c.semester_suggest, c.description,
                       p.course_name as prerequisite_name
                FROM course_map c
                LEFT JOIN course_map p ON c.prerequisite_id = p.course_id
                ORDER BY c.course_id ASC
            """
            cursor.execute(sql)
            courses = cursor.fetchall()
            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    if not courses:
        courses = DEMO_COURSES

    # 取得已修通過的科目列表
    passed_ids = set()
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        passed_ids = set(data.get("passed_course_ids", []))
    else:
        # GET 支援自動以登入者學號查詢
        student_id = request.args.get("student_id") or session.get("student_id") or "S112001"
        credits = [c for c in DEMO_STUDENT_CREDITS if c["student_id"] == student_id]
        passed_ids = {c["course_id"] for c in credits if c["is_passed"] == 1}

    total_passed_credits = 0
    required_passed_credits = 0
    elective_passed_credits = 0
    evaluated = []

    for c in courses:
        cid = c["course_id"]
        is_passed = cid in passed_ids
        pre_id = c.get("prerequisite_id")

        can_take = True
        missing_prereq = None
        if pre_id and pre_id not in passed_ids:
            can_take = False
            missing_prereq = {
                "prerequisite_id": pre_id,
                "prerequisite_name": c.get("prerequisite_name") or pre_id
            }

        if is_passed:
            total_passed_credits += c["credits"]
            if c.get("is_required", 1):
                required_passed_credits += c["credits"]
            else:
                elective_passed_credits += c["credits"]

        evaluated.append({
            **c,
            "is_passed": is_passed,
            "can_take": can_take,
            "is_blocked": not can_take and not is_passed,
            "missing_prerequisite": missing_prereq
        })

    return jsonify({
        "status": "success",
        "total_passed_credits": total_passed_credits,
        "required_passed_credits": required_passed_credits,
        "elective_passed_credits": elective_passed_credits,
        "graduation_threshold": GRADUATION_CREDIT_THRESHOLD,
        "progress_percent": round(min(100, (total_passed_credits / GRADUATION_CREDIT_THRESHOLD) * 100), 1),
        "courses": evaluated
    }), 200

@app.route("/api/student/courses/personalized", methods=["GET"])
def get_personalized_courses():
    """學號登入自動帶入課程地圖（免手動點選，直接顯示被擋哪幾門、下學期能選什麼）(功能 1)"""
    student_id = request.args.get("student_id") or session.get("student_id") or "S112001"
    student = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), DEMO_STUDENTS[0])

    # 撈取成績
    credit_records = [c for c in DEMO_STUDENT_CREDITS if c["student_id"] == student_id]
    passed_ids = {c["course_id"] for c in credit_records if c["is_passed"] == 1}
    failed_records = [c for c in credit_records if c["is_passed"] == 0]
    course_map_dict = {c["course_id"]: c for c in DEMO_COURSES}

    passed_courses = []
    failed_courses = []
    blocked_courses = []
    eligible_next_courses = []

    for c in DEMO_COURSES:
        cid = c["course_id"]
        pre_id = c.get("prerequisite_id")

        if cid in passed_ids:
            rec = next((r for r in credit_records if r["course_id"] == cid), None)
            passed_courses.append({
                **c,
                "score": rec.get("score") if rec else None,
                "semester": rec.get("semester") if rec else None
            })
        else:
            # 尚未修過
            if pre_id and pre_id not in passed_ids:
                # 被擋修
                blocked_courses.append({
                    **c,
                    "blocked_by_id": pre_id,
                    "blocked_by_name": course_map_dict.get(pre_id, {}).get("course_name", pre_id),
                    "reason": f"先修科目【{course_map_dict.get(pre_id, {}).get('course_name', pre_id)}】未通過，系統自動擋修"
                })
            else:
                # 下學期可選！
                eligible_next_courses.append(c)

    for f in failed_records:
        cid = f["course_id"]
        c_info = course_map_dict.get(cid, {})
        # 尋找因這門課被當而連帶被擋的科目
        downstream = [c["course_name"] for c in DEMO_COURSES if c.get("prerequisite_id") == cid]
        failed_courses.append({
            "course_id": cid,
            "course_name": c_info.get("course_name", cid),
            "credits": c_info.get("credits", 3),
            "score": f["score"],
            "semester": f["semester"],
            "is_required": c_info.get("is_required", 1),
            "downstream_blocked": downstream,
            "suggested_action": f"建議下學期或暑期優先安排重修；目前已連帶擋修：{', '.join(downstream)}" if downstream else "建議安排重修以補足必修學分。"
        })

    return jsonify({
        "status": "success",
        "student": student,
        "passed_courses": passed_courses,
        "failed_courses": failed_courses,
        "blocked_courses": blocked_courses,
        "eligible_next_courses": eligible_next_courses,
        "summary": {
            "passed_count": len(passed_courses),
            "failed_count": len(failed_courses),
            "blocked_count": len(blocked_courses),
            "eligible_next_count": len(eligible_next_courses),
            "total_passed_credits": sum(c["credits"] for c in passed_courses)
        }
    }), 200

@app.route("/api/courses/what-if", methods=["POST"])
def what_if_course_failed():
    """「如果這門課被當」骨牌連鎖擋修試算器 (功能 5)"""
    data = request.get_json(silent=True) or {}
    target_id = str(data.get("hypothetical_failed_id", "CS102")).strip()

    course_dict = {c["course_id"]: c for c in DEMO_COURSES}
    target_course = course_dict.get(target_id)
    if not target_course:
        return jsonify({"status": "error", "message": "查無此課程"}), 404

    # 遞迴找出所有骨牌下游連鎖被擋科目
    cascade_blocked = []
    queue = [target_id]
    visited = set()

    while queue:
        curr = queue.pop(0)
        for c in DEMO_COURSES:
            if c.get("prerequisite_id") == curr and c["course_id"] not in visited:
                visited.add(c["course_id"])
                cascade_blocked.append({
                    "course_id": c["course_id"],
                    "course_name": c["course_name"],
                    "credits": c["credits"],
                    "course_type": c.get("course_type", "專業必修"),
                    "semester_suggest": c.get("semester_suggest", "大二上"),
                    "direct_prereq": course_dict.get(curr, {}).get("course_name", curr)
                })
                queue.append(c["course_id"])

    # 評估延畢風險
    has_capstone = any("專題" in c["course_name"] for c in cascade_blocked)
    total_blocked_credits = sum(c["credits"] for c in cascade_blocked)

    if has_capstone or len(cascade_blocked) >= 3:
        risk_level = "極高"
        risk_color = "red"
        impact_summary = f"⚠️ 延畢極高風險！因【{target_course['course_name']}】為核心先修樞紐，若被當將連帶骨牌擋修後續 {len(cascade_blocked)} 門必修（包含大四畢業專題研討），預估延畢 1 年！"
    elif len(cascade_blocked) >= 1:
        risk_level = "中等"
        risk_color = "amber"
        impact_summary = f"⚠️ 擋修風險：將連帶阻擋後續 {len(cascade_blocked)} 門先修科目（{total_blocked_credits} 學分），需於次學年同一學期重修。"
    else:
        risk_level = "低"
        risk_color = "emerald"
        impact_summary = f"ℹ️ 該科目無後續先修綁定，若不及格僅需補足學分，不影響後續課程選修。"

    return jsonify({
        "status": "success",
        "hypothetical_course": target_course,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "total_blocked_credits": total_blocked_credits,
        "cascade_blocked_courses": cascade_blocked,
        "impact_summary": impact_summary,
        "remediation_plan": [
            f"1. 立即於期中退選或停修截止前評估是否辦理停修，避免成績單留下不及格紀錄。",
            f"2. 於下學期開學初向系辦登記暑期重修開班調查。",
            f"3. 調整選課計畫，優先確保先修鏈樞紐【{target_course['course_name']}】及格通過。"
        ]
    }), 200

# ==========================================
# 8. 畢業學分預審與門檻細拆 API (功能 5)
# ==========================================

@app.route("/api/student/graduation-audit", methods=["GET"])
def get_graduation_audit():
    """畢業學分預審：拆解總學分 128、必修、選修、通識、英文門檻與專題缺口 (功能 5)"""
    student_id = request.args.get("student_id") or session.get("student_id") or "S112001"
    student = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), DEMO_STUDENTS[0])
    dept_req = DEMO_GRADUATION_REQUIREMENTS.get(student["dept_id"], DEMO_GRADUATION_REQUIREMENTS["CS"])

    # 統計學分
    credit_records = [c for c in DEMO_STUDENT_CREDITS if c["student_id"] == student_id and c["is_passed"] == 1]
    course_dict = {c["course_id"]: c for c in DEMO_COURSES}

    passed_courses = [course_dict[r["course_id"]] for r in credit_records if r["course_id"] in course_dict]
    total_earned = sum(c["credits"] for c in passed_courses)
    major_req_earned = sum(c["credits"] for c in passed_courses if c.get("course_type") == "專業必修")
    major_elec_earned = sum(c["credits"] for c in passed_courses if c.get("course_type") == "專業選修")
    gen_earned = sum(c["credits"] for c in passed_courses if c.get("course_type") in ("通識教育", "共同必修"))

    # 英文門檻判定（例如通過基礎英文或證照）
    has_english = any("英文" in c["course_name"] for c in passed_courses) or len([c for c in DEMO_CERTIFICATES if c["student_id"] == student_id]) > 0

    return jsonify({
        "status": "success",
        "student": student,
        "graduation_threshold": dept_req["total_credits_req"],
        "total_earned": total_earned,
        "total_remaining": max(0, dept_req["total_credits_req"] - total_earned),
        "overall_progress_percent": round(min(100, (total_earned / dept_req["total_credits_req"]) * 100), 1),
        "breakdown": [
            {
                "category": "系專業必修",
                "required": dept_req["major_required_req"],
                "earned": major_req_earned,
                "remaining": max(0, dept_req["major_required_req"] - major_req_earned),
                "is_met": major_req_earned >= dept_req["major_required_req"],
                "icon": "📘"
            },
            {
                "category": "系專業選修",
                "required": dept_req["major_elective_req"],
                "earned": major_elec_earned,
                "remaining": max(0, dept_req["major_elective_req"] - major_elec_earned),
                "is_met": major_elec_earned >= dept_req["major_elective_req"],
                "icon": "📙"
            },
            {
                "category": "通識與共同必修",
                "required": dept_req["general_req"],
                "earned": gen_earned,
                "remaining": max(0, dept_req["general_req"] - gen_earned),
                "is_met": gen_earned >= dept_req["general_req"],
                "icon": "📗"
            },
            {
                "category": "英文畢業門檻",
                "required": 1,
                "earned": 1 if has_english else 0,
                "remaining": 0 if has_english else 1,
                "is_met": has_english,
                "detail": dept_req["english_threshold_name"],
                "status_text": "已通過 (多益 550 或基礎外語及格)" if has_english else "未通過 (需繳驗證書或修畢進階英文)",
                "icon": "🔤"
            }
        ]
    }), 200

# ==========================================
# 9. 申辦進度保存 API (功能 3: 我的申辦進度)
# ==========================================

@app.route("/api/checklist/progress", methods=["GET", "POST"])
def manage_checklist_progress():
    global DEMO_APPLICATION_PROGRESS
    student_id = session.get("student_id") or request.args.get("student_id") or "S112001"

    if request.method == "GET":
        user_prog = DEMO_APPLICATION_PROGRESS.get(student_id, {})
        return jsonify({"status": "success", "student_id": student_id, "progress": user_prog}), 200

    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        item_id = int(data.get("item_id", 1))
        step_index = int(data.get("step_index", 0))
        is_completed = bool(data.get("is_completed", True))
        status_note = str(data.get("status_note", "處理中")).strip()

        if student_id not in DEMO_APPLICATION_PROGRESS:
            DEMO_APPLICATION_PROGRESS[student_id] = {}
        if item_id not in DEMO_APPLICATION_PROGRESS[student_id]:
            DEMO_APPLICATION_PROGRESS[student_id][item_id] = {"completed_steps": [], "notes": {}}

        completed_steps = set(DEMO_APPLICATION_PROGRESS[student_id][item_id].get("completed_steps", []))
        if is_completed:
            completed_steps.add(step_index)
        else:
            completed_steps.discard(step_index)

        DEMO_APPLICATION_PROGRESS[student_id][item_id]["completed_steps"] = sorted(list(completed_steps))
        DEMO_APPLICATION_PROGRESS[student_id][item_id]["notes"][step_index] = status_note

        return jsonify({
            "status": "success",
            "message": "申辦進度已即時儲存！重新整理或下次登入皆會保留。",
            "progress": DEMO_APPLICATION_PROGRESS[student_id][item_id]
        }), 200

@app.route("/api/student/my-applications", methods=["GET"])
def get_my_applications():
    """取得當前學生的所有進行中申辦業務卡片 (功能 3)"""
    student_id = session.get("student_id") or "S112001"
    user_prog = DEMO_APPLICATION_PROGRESS.get(student_id, {})
    active_apps = []

    for chk in DEMO_CHECKLISTS:
        item_id = chk["item_id"]
        prog = user_prog.get(item_id)
        if prog:
            total_steps = len(chk["steps_json"])
            done_steps = len(prog.get("completed_steps", []))
            percent = round((done_steps / total_steps * 100), 0) if total_steps else 0
            active_apps.append({
                "item_id": item_id,
                "business_name": chk["business_name"],
                "category_name": chk["category_name"],
                "office_location": chk.get("office_location", "康寧樓 2 樓"),
                "contact_phone": chk.get("contact_phone", "02-2632-1181"),
                "form_download_url": chk.get("form_download_url"),
                "total_steps": total_steps,
                "completed_steps_count": done_steps,
                "progress_percent": percent,
                "completed_steps": prog.get("completed_steps", []),
                "current_status": "已全數完成" if percent == 100 else f"進行至第 {done_steps + 1} 步 ({chk['steps_json'][min(done_steps, total_steps-1)]})"
            })

    return jsonify({"status": "success", "data": active_apps}), 200

# ==========================================
# 10. 導師/家長預警通知與個資授權同意 API (功能 6)
# ==========================================

@app.route("/api/student/privacy-consent", methods=["GET", "POST"])
def manage_privacy_consent():
    """管理學生本人對家長/導師預警推播的個資授權 (功能 6)"""
    global DEMO_PRIVACY_SETTINGS
    student_id = session.get("student_id") or "S112001"

    if request.method == "GET":
        settings = DEMO_PRIVACY_SETTINGS.get(student_id, {"parent_alert_consent": 1, "advisor_alert_consent": 1})
        return jsonify({"status": "success", "student_id": student_id, "settings": settings}), 200

    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        parent_consent = 1 if data.get("parent_alert_consent") in (1, True, "1", "true") else 0
        advisor_consent = 1 if data.get("advisor_alert_consent") in (1, True, "1", "true") else 0

        DEMO_PRIVACY_SETTINGS[student_id] = {
            "parent_alert_consent": parent_consent,
            "advisor_alert_consent": advisor_consent
        }

        return jsonify({
            "status": "success",
            "message": "個資授權設定更新成功！依個人資料保護法規定已生效。",
            "settings": DEMO_PRIVACY_SETTINGS[student_id]
        }), 200

@app.route("/api/student/early-warning", methods=["GET"])
def get_student_early_warning():
    """學業二一與擋修風險預警（附帶個資法授權保護）(功能 6)"""
    role = session.get("role", "訪客")
    student_id = request.args.get("student_id") or session.get("student_id") or "S112001"
    student = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), DEMO_STUDENTS[0])

    # 檢查個資授權
    privacy = DEMO_PRIVACY_SETTINGS.get(student_id, {"parent_alert_consent": 1, "advisor_alert_consent": 1})
    if role == "家長" and not privacy.get("parent_alert_consent"):
        return jsonify({
            "status": "consent_restricted",
            "is_authorized": False,
            "message": "⚠️ 學生本人尚未開啟【家長學業預警同步授權】。依《個人資料保護法》及校園隱私政策，系統已保護學業警示明細。請與子女溝通後於學生端開啟授權。",
            "student_name": student["full_name"]
        }), 200

    # 計算預警狀態
    credit_records = [c for c in DEMO_STUDENT_CREDITS if c["student_id"] == student_id]
    failed_courses = [c for c in credit_records if c["is_passed"] == 0]
    total_enrolled_credits = sum(3 for _ in credit_records) or 1
    failed_credits = sum(3 for _ in failed_courses)

    is_half_failed = (failed_credits / total_enrolled_credits) >= 0.5
    is_two_thirds_failed = (failed_credits / total_enrolled_credits) >= 0.66

    warning_level = "normal"
    warning_title = "學業狀況良好"
    warning_details = []

    if is_two_thirds_failed:
        warning_level = "critical"
        warning_title = "🚨 三二退學極高風險預警"
        warning_details.append("本學期不及格學分已達修習總數三分之二，面臨校規退學處分風險。")
    elif is_half_failed or len(failed_courses) >= 1:
        warning_level = "warning"
        warning_title = "⚠️ 二一學業預警與擋修中斷警示"
        warning_details.append(f"本學期目前有 {len(failed_courses)} 門必修科目不及格（程式設計(一) 55分），已連帶造成資料結構擋修。")
        warning_details.append("建議導師儘速安排課後輔導訪談，並協助規劃下學期重補修。")

    return jsonify({
        "status": "success",
        "is_authorized": True,
        "student": student,
        "warning_level": warning_level,
        "warning_title": warning_title,
        "failed_course_count": len(failed_courses),
        "failed_credits": failed_credits,
        "warning_details": warning_details,
        "counselling_office": {
            "office_name": "學務處生輔組 / 資訊系導師室",
            "location": "行政大樓 1 樓 / 專業教室 3 樓",
            "phone": "02-2632-1181 分機 211",
            "advisor_name": "陳雅婷 老師"
        }
    }), 200

# ==========================================
# 11. 同義詞與行政申辦流程 API (功能 7)
# ==========================================

@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify({"status": "success", "data": DEMO_CATEGORIES}), 200

@app.route("/api/checklists", methods=["GET", "POST"])
def manage_checklists():
    global DEMO_CHECKLISTS
    role = session.get("role", "訪客")
    conn = get_db_connection()

    if request.method == "GET":
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM checklist_items ORDER BY item_id ASC")
                rows = cursor.fetchall()
                for r in rows:
                    if isinstance(r.get("steps_json"), str):
                        try: r["steps_json"] = json.loads(r["steps_json"])
                        except Exception: r["steps_json"] = [r["steps_json"]]
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "data": rows}), 200
            except Exception:
                if conn: conn.close()
        return jsonify({"status": "success", "data": DEMO_CHECKLISTS}), 200

    if request.method == "POST":
        if session.get("role") not in ("管理員", "教職員"):
            return jsonify({"status": "error", "message": "權限不足"}), 403
        data = request.get_json(silent=True) or {}
        new_id = max([c["item_id"] for c in DEMO_CHECKLISTS], default=0) + 1
        item = {
            "item_id": new_id,
            "category_id": int(data.get("category_id", 1)),
            "category_name": data.get("category_name", "課務組"),
            "business_name": data.get("business_name", ""),
            "steps_json": data.get("steps_json", []),
            "required_docs": data.get("required_docs", ""),
            "office_hours": data.get("office_hours", "週一至週五 08:30 - 17:00"),
            "office_location": data.get("office_location", "康寧樓 2 樓"),
            "contact_phone": data.get("contact_phone", "02-2632-1181"),
            "form_download_url": data.get("form_download_url", ""),
            "system_url": data.get("system_url", ""),
            "deadline_week_info": data.get("deadline_week_info", ""),
            "related_kb_id": data.get("related_kb_id"),
            "audience": data.get("audience", "學生")
        }
        DEMO_CHECKLISTS.append(item)
        return jsonify({"status": "success", "message": "申辦指引流程新增成功！", "data": item}), 201

@app.route("/api/synonyms", methods=["GET", "POST"])
def manage_synonyms():
    global DEMO_SYNONYMS
    if request.method == "GET":
        return jsonify({"status": "success", "data": DEMO_SYNONYMS}), 200
    if request.method == "POST":
        if session.get("role") not in ("管理員", "教職員"):
            return jsonify({"status": "error", "message": "權限不足"}), 403
        data = request.get_json(silent=True) or {}
        uk = data.get("user_keyword", "").strip()
        ot = data.get("official_term", "").strip()
        cid = int(data.get("category_id", 1))
        if not uk or not ot:
            return jsonify({"status": "error", "message": "俗稱關鍵字與官方標準名稱為必填"}), 400
        new_id = max([s["synonym_id"] for s in DEMO_SYNONYMS], default=0) + 1
        DEMO_SYNONYMS.append({
            "synonym_id": new_id,
            "category_id": cid,
            "user_keyword": uk,
            "official_term": ot
        })
        return jsonify({"status": "success", "message": "同義詞新增成功！", "id": new_id}), 201

@app.route("/api/synonyms/<int:synonym_id>", methods=["DELETE"])
@role_required("管理員", "教職員")
def delete_synonym(synonym_id):
    global DEMO_SYNONYMS
    DEMO_SYNONYMS = [s for s in DEMO_SYNONYMS if s["synonym_id"] != synonym_id]
    return jsonify({"status": "success", "message": "同義詞刪除成功！"}), 200

# ==========================================
# 12. 規章知識庫維護與健康狀態 API
# ==========================================

@app.route("/api/rules", methods=["GET", "POST"])
def manage_rules():
    global DEMO_KNOWLEDGE_BASE
    if request.method == "GET":
        return jsonify({"status": "success", "data": DEMO_KNOWLEDGE_BASE}), 200
    if request.method == "POST":
        if session.get("role") not in ("管理員", "教職員"):
            return jsonify({"status": "error", "message": "權限不足"}), 403
        data = request.get_json(silent=True) or {}
        new_id = max([r["id"] for r in DEMO_KNOWLEDGE_BASE], default=0) + 1
        item = {
            "id": new_id,
            "category_id": int(data.get("category_id", 1)),
            "category_name": data.get("category_name", "教務學則與選課"),
            "subcategory": data.get("subcategory", "規章辦法"),
            "keyword": data.get("keyword", ""),
            "official_term": data.get("official_term", ""),
            "content": data.get("content", ""),
            "doc_name": data.get("doc_name", "康寧大學法規.pdf"),
            "page": int(data.get("page", 1)),
            "url": data.get("url", "https://www.ukn.edu.tw")
        }
        DEMO_KNOWLEDGE_BASE.append(item)
        return jsonify({"status": "success", "message": "校規條文新增成功！", "data": item}), 201

@app.route("/api/rules/<int:rule_id>", methods=["PUT", "DELETE"])
@role_required("管理員", "教職員")
def update_or_delete_rule(rule_id):
    global DEMO_KNOWLEDGE_BASE
    if request.method == "DELETE":
        DEMO_KNOWLEDGE_BASE = [r for r in DEMO_KNOWLEDGE_BASE if r["id"] != rule_id]
        return jsonify({"status": "success", "message": "條文已成功刪除！"}), 200
    if request.method == "PUT":
        data = request.get_json(silent=True) or {}
        for r in DEMO_KNOWLEDGE_BASE:
            if r["id"] == rule_id:
                r.update({
                    "keyword": data.get("keyword", r["keyword"]),
                    "official_term": data.get("official_term", r["official_term"]),
                    "content": data.get("content", r["content"]),
                    "doc_name": data.get("doc_name", r["doc_name"]),
                    "page": int(data.get("page", r["page"])),
                    "url": data.get("url", r["url"])
                })
                return jsonify({"status": "success", "message": "條文更新成功！", "data": r}), 200
        return jsonify({"status": "error", "message": "找不到該條文"}), 404

@app.route("/api/health", methods=["GET"])
def health_check():
    db_online = is_db_available()
    return jsonify({
        "status": "online",
        "database": "connected" if db_online else "fallback_demo_mode",
        "db_mode": "MySQL 8.x / MariaDB (3NF Schema)" if db_online else "內建示範資料引擎 (3NF Demo Storage)",
        "session_user": session.get("username", "未登入 (訪客模式)"),
        "features": {
            "course_map_auto_load": True,
            "calendar_linked_deadlines": True,
            "checklist_persistence": True,
            "search_feedback_loop": True,
            "what_if_failure_sim": True,
            "privacy_consented_early_warning": True,
            "rich_office_navigation": True
        },
        "message": "Smart UKN 7 大核心升級服務運作正常！"
    }), 200

@app.route("/api/stats", methods=["GET"])
def get_stats():
    return jsonify({
        "status": "success",
        "rules_count": len(DEMO_KNOWLEDGE_BASE),
        "synonyms_count": len(DEMO_SYNONYMS),
        "checklists_count": len(DEMO_CHECKLISTS),
        "courses_count": len(DEMO_COURSES),
        "unmatched_count": len(DEMO_UNMATCHED_QUERIES),
        "feedback_count": len(DEMO_SEARCH_FEEDBACK),
        "mode": "mysql" if is_db_available() else "demo"
    }), 200

# ==========================================
# 13. 伺服器主入口
# ==========================================

if __name__ == "__main__":
    os.makedirs("static", exist_ok=True)
    os.makedirs("static/uploads", exist_ok=True)
    os.makedirs("static/forms", exist_ok=True)
    print("=" * 65)
    print("🚀 Smart UKN 康寧大學智慧校園服務平台 (7 大升級模組完成版)")
    print("🌐 前台門戶入口:       http://127.0.0.1:8000")
    print("🔑 統一登入頁面:       http://127.0.0.1:8000/login")
    print("⚙️ 管理員後台控制台:   http://127.0.0.1:8000/admin")
    print("🎓 個人化課程地圖 API: http://127.0.0.1:8000/api/student/courses/personalized")
    print("📅 校曆與可辦雷達 API: http://127.0.0.1:8000/api/calendar/current-week")
    print("💾 申辦進度保存 API:   http://127.0.0.1:8000/api/checklist/progress")
    print("🔍 詞庫自動成長 API:   http://127.0.0.1:8000/api/admin/unmatched-queries")
    print("🎲 骨牌被當試算 API:   http://127.0.0.1:8000/api/courses/what-if")
    print("🛡️ 個資授權預警 API:   http://127.0.0.1:8000/api/student/early-warning")
    print("=" * 65)

    app.run(host="0.0.0.0", port=8000, debug=True)
