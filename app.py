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
import threading
import time
from io import StringIO
from datetime import datetime, timedelta
from attendance.sources import MemoryAttendanceSource, MySQLAttendanceSource, VALID_TYPES as ATTENDANCE_TYPES
from attendance.policy import summarize_attendance
from attendance.notify import send_pending_notifications, get_mailer
from dashboard.sources import MemoryDashboardSource, MySQLDashboardSource
from dashboard.summary import build_dashboard
from dashboard import demo_data as dashboard_demo
from scholarship_demo import DEMO_SCHOLARSHIPS, DEMO_SCHOLARSHIP_PROFILES

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
# 登入時勾選「記住我」：30 天內不用再登入 (session.permanent)
app.permanent_session_lifetime = timedelta(days=30)
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_REFRESH_EACH_REQUEST"] = True

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

# MySQL 連不上時，Windows 每次試連本機關閉的連接埠要等約 2 秒；
# 失敗後 DB_RETRY_SECONDS 內不再重試，直接用示範資料，避免每支 API 都卡 2 秒以上
DB_RETRY_SECONDS = 30
_db_unavailable_until = 0.0

def get_db_connection():
    """嘗試取得 MySQL 連線，若失敗回傳 None 以供示範模式無縫接管"""
    global _db_unavailable_until
    if time.monotonic() < _db_unavailable_until:
        return None
    try:
        conn = mysql.connector.connect(**DB_CONFIG, connection_timeout=3)
        if conn.is_connected():
            return conn
    except Exception:
        pass
    _db_unavailable_until = time.monotonic() + DB_RETRY_SECONDS
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
# 修改紀錄 (audit_logs)：後台每次新增/修改/刪除都留下誰、何時、改了什麼 (R5)
# ==========================================

DEMO_AUDIT_LOGS = []  # 示範模式下的修改紀錄 (MySQL 連不上時使用)
_audit_log_seq = 0

def write_audit_log(table_name, record_id, action, before=None, after=None):
    global _audit_log_seq
    changed_by = session.get("full_name") or session.get("username") or "未登入"
    role = session.get("role") or "訪客"

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO audit_logs (table_name, record_id, action, changed_by, changed_by_role, before_json, after_json) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (
                    table_name, str(record_id), action, changed_by, role,
                    json.dumps(before, ensure_ascii=False, default=str) if before is not None else None,
                    json.dumps(after, ensure_ascii=False, default=str) if after is not None else None
                )
            )
            conn.commit()
            cursor.close()
            conn.close()
            return
        except Exception:
            if conn: conn.close()

    _audit_log_seq += 1
    DEMO_AUDIT_LOGS.append({
        "log_id": _audit_log_seq,
        "table_name": table_name,
        "record_id": str(record_id),
        "action": action,
        "changed_by": changed_by,
        "changed_by_role": role,
        # 存複本，避免之後原資料被修改時連帶改到紀錄
        "before_json": json.loads(json.dumps(before, default=str)) if before is not None else None,
        "after_json": json.loads(json.dumps(after, default=str)) if after is not None else None,
        "changed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

# ==========================================
# 2. 示範模式 3NF 資料引擎 (Demo Fallback Storage)
#    保證即使 MySQL 離線也能 100% 完整展示！
# ==========================================

GRADUATION_CREDIT_THRESHOLD = 220  # 五專畢業學分
GRADUATION_CERT_REQUIREMENT = 2

DEMO_DEPARTMENTS = [
    # 護理健康學院
    {"dept_id": "LTC", "dept_name": "長期照護學系", "college_name": "護理健康學院"},
    {"dept_id": "ECE", "dept_name": "嬰幼兒保育學系", "college_name": "護理健康學院"},
    {"dept_id": "NUR", "dept_name": "護理科（五專）", "college_name": "護理健康學院"},
    {"dept_id": "OPT", "dept_name": "視光科（五專）", "college_name": "護理健康學院"},
    # 商業資訊學院
    {"dept_id": "BA", "dept_name": "企業管理學系（科）", "college_name": "商業資訊學院"},
    {"dept_id": "CS", "dept_name": "資訊管理科（五專）", "college_name": "商業資訊學院"},
    {"dept_id": "ANI", "dept_name": "數位影視動畫科（五專）", "college_name": "商業資訊學院"},
    {"dept_id": "ENG", "dept_name": "應用外語科（五專）", "college_name": "商業資訊學院"}
]

DEMO_STUDENTS = [
    {"student_id": "S112001", "full_name": "王小明", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管四忠", "parent_phone": "0912-345-678"},
    {"student_id": "S112002", "full_name": "李美華", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管四忠", "parent_phone": "0922-333-444"},
    {"student_id": "S112003", "full_name": "張建華", "dept_id": "NUR", "dept_name": "護理科（五專）", "admission_year": 112, "class_name": "護理四忠", "parent_phone": "0933-555-666"},
    {"student_id": "S112004", "full_name": "陳冠宇", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管四孝", "parent_phone": "0955-222-111"},
    {"student_id": "S112005", "full_name": "林雨潔", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管四忠", "parent_phone": "0966-777-888"}
]

_DEMO_PW_123456 = "pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c"
_DEMO_PW_ADMIN123 = "pbkdf2:sha256:1000000$2XQfvmmn75wVJUKc$59cac19325e7e89df728fdc0ee86208fc0ae12ab71fc630fbaa890f2f919d14c"

DEMO_USERS = [
    {"user_id": 1, "username": "student1", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112001", "full_name": "王小明"},
    {"user_id": 2, "username": "student2", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112002", "full_name": "李美華"},
    {"user_id": 3, "username": "parent1", "password_hash": _DEMO_PW_123456, "role": "家長", "student_id": "S112001", "full_name": "王大明 (小明家長)"},
    {"user_id": 4, "username": "staff1", "password_hash": _DEMO_PW_123456, "role": "教職員", "student_id": None, "full_name": "周立威 (教務處職員)"},
    {"user_id": 6, "username": "teacher1", "password_hash": _DEMO_PW_123456, "role": "老師", "student_id": None, "full_name": "陳雅婷 老師", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "advised_class": "資管四忠"},
    {"user_id": 5, "username": "admin", "password_hash": _DEMO_PW_ADMIN123, "role": "管理員", "student_id": None, "full_name": "系統超級管理員"},
    # 示範學號登入帳號 (密碼 123456，與 seed_data.py 一致)
    {"user_id": 7, "username": "S112004", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112004", "full_name": "陳冠宇"},
    {"user_id": 8, "username": "S112005", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112005", "full_name": "林雨潔"}
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
        "content": "本校各科系必修課程若訂有先修科目限制（例如：程式設計(一) 為 資料結構 之先修科目），學生該先修科目未達及格標準（60 分）者，電腦選課系統將自動擋修，不得修習後續先修關聯課程，需待先修科目重修及格後始得修習。",
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
    {"course_id": "EN101", "course_name": "基礎英文(一)", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "共同必修", "dept_id": "CS", "semester_suggest": "大一上", "description": "大一基礎外語聽說讀寫與實用生活英語。"},
    {"course_id": "EN102", "course_name": "基礎英文(二)", "credits": 2, "prerequisite_id": "EN101", "prerequisite_name": "基礎英文(一)", "is_required": 1, "course_type": "共同必修", "dept_id": "CS", "semester_suggest": "大一下", "description": "進階商用英文與學術閱讀報告寫作。"},
    {"course_id": "GE101", "course_name": "大學之道與校園倫理", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 0, "course_type": "通識教育", "dept_id": "CS", "semester_suggest": "大一上", "description": "校園生活適應、生命教育、學術誠信與職場倫理。"},
    {"course_id": "GE102", "course_name": "跨領域思維與創新科技", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 0, "course_type": "通識教育", "dept_id": "CS", "semester_suggest": "大二上", "description": "人工智慧生活應用、設計思考與數位轉型思維。"},
    {"course_id": "GE103", "course_name": "環境永續與社會責任", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 0, "course_type": "通識教育", "dept_id": "CS", "semester_suggest": "大二下", "description": "ESG 永續發展目標、生態保育與社會公益實踐。"}
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
    {"credit_id": 13, "student_id": "S112004", "course_id": "EN101", "semester": "112-1", "score": 80.00, "is_passed": 1},
    {"credit_id": 14, "student_id": "S112004", "course_id": "CS202", "semester": "113-2", "score": 79.00, "is_passed": 1},
    {"credit_id": 15, "student_id": "S112004", "course_id": "GE101", "semester": "112-1", "score": 86.00, "is_passed": 1},
    {"credit_id": 16, "student_id": "S112005", "course_id": "CS101", "semester": "112-1", "score": 76.00, "is_passed": 1},
    {"credit_id": 17, "student_id": "S112005", "course_id": "CS102", "semester": "112-2", "score": 68.00, "is_passed": 1},
    {"credit_id": 18, "student_id": "S112005", "course_id": "CS201", "semester": "113-1", "score": 48.00, "is_passed": 0},
    {"credit_id": 19, "student_id": "S112005", "course_id": "EN101", "semester": "112-1", "score": 81.00, "is_passed": 1},
    {"credit_id": 20, "student_id": "S112005", "course_id": "GE101", "semester": "112-1", "score": 88.00, "is_passed": 1}
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
            "送請班級導師及科主任簽章",
            "於第12週五前送交教務處課務組核備"
        ],
        "required_docs": "停修申請單紙本、歷年成績單正本",
        "office_hours": "週一至週五 08:30 - 17:00",
        "office_location": "康寧樓 2 樓 A201 (課務組)",
        "contact_phone": "02-2632-1181 分機 310, 312",
        "form_download_url": "/forms/course_withdraw_form.pdf",
        "system_url": "http://talk.ukn.edu.tw/class_redi/class.php",
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
        "system_url": "https://ec.ukn.edu.tw/AskLeave/login.aspx",
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
        "system_url": "http://203.71.63.13/academic/",
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
            "核對科專業必修、選修與通識學分缺口",
            "確認英文畢業門檻與專題通過證明",
            "至科辦公室請科主任初審簽章",
            "送交教務處註冊組進行畢業資格決審"
        ],
        "required_docs": "歷年成績單正本、畢業學分預審表、外語通過證明",
        "office_hours": "週一至週五 08:30 - 17:00",
        "office_location": "康寧樓 2 樓 A202 (註冊組)",
        "contact_phone": "02-2632-1181 分機 321, 322",
        "form_download_url": "/forms/graduation_audit_form.pdf",
        "system_url": "http://203.71.63.13/academic/",
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
        "system_url": "https://oes3.ukn.edu.tw/~license/",
        "deadline_week_info": "每學期第 1-5 週",
        "related_kb_id": 5,
        "audience": "學生"
    }
]

# 申辦流程勾選進度 (對應 checklist_progress 資料表；{學號: {item_id: [已完成的 step_index]}})
DEMO_CHECKLIST_PROGRESS = {
    "S112001": {1: [0, 1], 3: [0]},
    "S112005": {1: [0]}
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

# 搜尋紀錄 (對應 search_logs 資料表；MySQL 離線時新紀錄存於記憶體)
# 範例紀錄以啟動時間往前推算，讓後台「本週搜尋次數 / 未命中率」有示範數據
_demo_log_seed = [
    ("棄修", 1), ("機車通行證申請", 0), ("英文抵免", 1), ("病假", 1), ("宿舍門禁時間", 0),
    ("擋修", 1), ("棄修", 1), ("機車通行證申請", 0), ("退費手續", 0), ("二一", 1),
    ("英文抵免", 1), ("病假", 1)
]
DEMO_SEARCH_LOGS = [
    {"id": i + 1, "query": q, "matched": m,
     "created_at": (datetime.now() - timedelta(minutes=15 * (len(_demo_log_seed) - i))).strftime("%Y-%m-%d %H:%M:%S")}
    for i, (q, m) in enumerate(_demo_log_seed)
]

DEMO_PRIVACY_SETTINGS = {
    "S112001": {"parent_alert_consent": 1, "advisor_alert_consent": 1},
    "S112002": {"parent_alert_consent": 0, "advisor_alert_consent": 1},
    "S112004": {"parent_alert_consent": 1, "advisor_alert_consent": 1}
}

DEMO_GRADUATION_REQUIREMENTS = {
    "CS": {
        "dept_id": "CS",
        "total_credits_req": 220,
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
        "title": "115-1 學期課程停修申請",
        "category": "教務處課務組",
        "semester_week": 11,
        "start_date": "2026-10-01",
        "end_date": "2026-10-18",
        "applies_to_role": "學生",
        "applies_to_dept": "CS",
        "related_system_url": "http://talk.ukn.edu.tw/class_redi/class.php",
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
        "related_system_url": "http://203.71.63.13/academic/",
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
        "related_system_url": "http://203.71.63.13/academic/",
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
        "related_system_url": "http://203.71.63.13/academic/",
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
        "related_system_url": "http://talk.ukn.edu.tw/class_redi/class.php",
        "description": "先修科目不及格需重修者，可預先登記暑期課程開班意願。",
        "status_badge": "尚未開放",
        "countdown_days": 20,
        "is_urgent": False
    }
]

# 學期校曆事項 (對應 academic_calendar 資料表，內容與 init_db.py 範例一致)
DEMO_ACADEMIC_CALENDAR = [
    {"id": 1, "event_name": "加退選", "start_date": "2026-09-14", "end_date": "2026-09-25", "category": "教務", "related_checklist_id": None},
    {"id": 2, "event_name": "學雜費繳費期限", "start_date": "2026-09-01", "end_date": "2026-09-30", "category": "繳費", "related_checklist_id": None},
    {"id": 3, "event_name": "獎助學金申請期限", "start_date": "2026-09-21", "end_date": "2026-10-16", "category": "獎助", "related_checklist_id": None},
    {"id": 4, "event_name": "停修申請", "start_date": "2026-10-01", "end_date": "2026-10-16", "category": "教務", "related_checklist_id": 1},
    {"id": 5, "event_name": "教學意見調查開放期間", "start_date": "2026-12-14", "end_date": "2027-01-15", "category": "教務", "related_checklist_id": None}
]

# 模擬缺曠課紀錄 (對應 attendance_records 資料表，內容與 seed_data.py 一致)
DEMO_ATTENDANCE_RECORDS = [
    {"id": 1, "student_id": "S112001", "date": "2026-09-14", "course_name": "程式設計(一)", "type": "曠課", "notified": True},
    {"id": 2, "student_id": "S112001", "date": "2026-09-15", "course_name": "基礎英文(二)", "type": "遲到", "notified": True},
    {"id": 3, "student_id": "S112001", "date": "2026-09-16", "course_name": "程式設計(一)", "type": "曠課", "notified": True},
    {"id": 4, "student_id": "S112001", "date": "2026-09-18", "course_name": "跨領域思維與創新科技", "type": "病假", "notified": True},
    {"id": 5, "student_id": "S112001", "date": "2026-09-21", "course_name": "程式設計(一)", "type": "曠課", "notified": False},
    {"id": 6, "student_id": "S112001", "date": "2026-09-23", "course_name": "程式設計(一)", "type": "曠課", "notified": False},
    {"id": 7, "student_id": "S112002", "date": "2026-09-16", "course_name": "資料庫系統概論", "type": "病假", "notified": True},
    {"id": 8, "student_id": "S112005", "date": "2026-09-15", "course_name": "資料結構", "type": "曠課", "notified": False},
    {"id": 9, "student_id": "S112005", "date": "2026-09-17", "course_name": "物件導向程式設計", "type": "遲到", "notified": False}
]

DEMO_CERTIFICATES = [
    {"cert_id": 1, "student_id": "S112001", "cert_name": "丙級電腦硬體裝修技術士", "issuing_org": "勞動部勞動力發展署", "cert_number": "113-CS-004521", "theory_score": 82.00, "practical_score": 88.00, "cert_status": "及格發證", "issue_date": "2026-06-20"},
    {"cert_id": 2, "student_id": "S112001", "cert_name": "乙級電腦軟體應用技術士", "issuing_org": "勞動部勞動力發展署", "cert_number": "114-CS-008912", "theory_score": 86.50, "practical_score": 92.00, "cert_status": "及格發證", "issue_date": "2026-08-15"},
    {"cert_id": 3, "student_id": "S112002", "cert_name": "TQC+ 網頁設計工程師", "issuing_org": "財團法人中華民國電腦技能基金會", "cert_number": "TQC-WD-22310", "theory_score": 78.00, "practical_score": 85.00, "cert_status": "及格發證", "issue_date": "2026-07-05"},
    {"cert_id": 4, "student_id": "S112004", "cert_name": "丙級電腦硬體裝修技術士", "issuing_org": "勞動部勞動力發展署", "cert_number": "113-CS-004588", "theory_score": 90.00, "practical_score": 86.00, "cert_status": "及格發證", "issue_date": "2026-06-20"},
    {"cert_id": 5, "student_id": "S112004", "cert_name": "乙級電腦軟體應用技術士", "issuing_org": "勞動部勞動力發展署", "cert_number": "114-CS-009010", "theory_score": 88.00, "practical_score": 90.00, "cert_status": "及格發證", "issue_date": "2026-08-15"}
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
            # 可用帳號或學號登入；學號只比對學生身分 (家長帳號也綁學號，不可用學號登入家長)
            sql = """
                SELECT u.*, s.dept_id, s.class_name, d.dept_name
                FROM users u
                LEFT JOIN students s ON u.student_id = s.student_id
                LEFT JOIN departments d ON s.dept_id = d.dept_id
                WHERE u.username = %s OR (u.student_id = %s AND u.role = '學生')
                ORDER BY u.username = %s DESC
                LIMIT 1
            """
            cursor.execute(sql, (username, username, username))
            candidate = cursor.fetchone()
            cursor.close()
            conn.close()
            if candidate and check_password_hash(candidate["password_hash"], password):
                user_record = candidate
        except Exception:
            if conn: conn.close()

    if not user_record:
        for u in sorted(DEMO_USERS, key=lambda x: x["username"] != username):
            is_login_name = u["username"] == username or (u.get("student_id") == username.upper() and u["role"] == "學生")
            if is_login_name and check_password_hash(u["password_hash"], password):
                user_record = dict(u)
                if u.get("student_id"):
                    stu = next((s for s in DEMO_STUDENTS if s["student_id"] == u["student_id"]), None)
                    if stu:
                        user_record["dept_id"] = stu["dept_id"]
                        user_record["class_name"] = stu["class_name"]
                        user_record["dept_name"] = stu.get("dept_name", "資訊管理科（五專）")
                break

    if user_record:
        session.clear()
        session.permanent = data.get("remember", True) is not False
        session["user_id"] = user_record["user_id"]
        session["username"] = user_record["username"]
        session["role"] = user_record["role"]
        session["full_name"] = user_record["full_name"]
        session["student_id"] = user_record.get("student_id")
        session["dept_id"] = user_record.get("dept_id", "CS")
        session["dept_name"] = user_record.get("dept_name", "資訊管理科（五專）")
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
                "dept_name": user_record.get("dept_name", "資訊管理科（五專）"),
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
                "dept_name": session.get("dept_name", "資訊管理科（五專）"),
                "class_name": session.get("class_name", ""),
                "advised_class": session.get("advised_class")
            }
        }), 200
    return jsonify({"status": "success", "is_authenticated": False, "user": None}), 200

# ==========================================
# 5. 校曆連動與期限雷達 API (功能 2)
# ==========================================

# 各學期第 1 週的週一 (依校曆公告維護)；未列出的學期以 9/14、2/22 所在週估算
SEMESTER_START_DATES = {
    (115, 1): "2026-09-14",
    (115, 2): "2027-02-22",
}

def current_academic_term(today):
    """民國學年度與學期：8 月起為新學年上學期，2~7 月為下學期 (1 月仍屬上學期)"""
    if today.month >= 8:
        year, semester = today.year - 1911, 1
    elif today.month == 1:
        year, semester = today.year - 1912, 1
    else:
        year, semester = today.year - 1912, 2
    start_str = SEMESTER_START_DATES.get((year, semester))
    if start_str:
        start = datetime.strptime(start_str, "%Y-%m-%d").date()
    else:
        anchor = datetime(year + 1911, 9, 14).date() if semester == 1 else datetime(year + 1912, 2, 22).date()
        start = anchor - timedelta(days=anchor.weekday())
    week = max(1, (today - start).days // 7 + 1)
    return {
        "academic_year": year,
        "semester": semester,
        "week": week,
        "name": f"{year} 學年度第 {semester} 學期"
    }

@app.route("/api/calendar/current-week", methods=["GET"])
def get_current_week():
    """回傳當前學期、當週校曆週次與重要辦理事項"""
    now = datetime.now()
    term = current_academic_term(now.date())
    return jsonify({
        "status": "success",
        "academic_year": term["academic_year"],
        "semester": term["semester"],
        "semester_name": term["name"],
        "current_week": term["week"],
        "current_date": now.strftime("%Y-%m-%d"),
        "active_highlights": [
            {"title": "課程停修申請", "badge": "本週受理中 (剩 3 天)", "office": "課務組", "url": "/#tab-checklist", "is_urgent": True},
            {"title": "期中預警評量", "badge": "輔導進行中 (剩 5 天)", "office": "學務處", "url": "/#tab-warning", "is_urgent": True},
            {"title": "大四學分預審", "badge": "審查中 (剩 35 天)", "office": "註冊組", "url": "/#tab-graduation", "is_urgent": False}
        ]
    }), 200

def normalize_deadline_row(row):
    """MySQL 的 date 欄位轉成 YYYY-MM-DD；不轉的話 Flask 會輸出 'Tue, 01 Sep 2026 00:00:00 GMT'，前台無法判斷截止日"""
    item = dict(row)
    for key in ("start_date", "end_date"):
        if hasattr(item.get(key), "isoformat"):
            item[key] = item[key].isoformat()
    return item

@app.route("/api/deadlines", methods=["GET", "POST"])
def manage_deadlines():
    if request.method == "GET":
        rows = fetch_db_rows("SELECT * FROM deadlines ORDER BY end_date ASC")
        if rows is None:
            return jsonify({"status": "success", "data": DEMO_DEADLINES}), 200
        return jsonify({"status": "success", "data": [normalize_deadline_row(r) for r in rows]}), 200

    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    end_date = str(data.get("end_date", "")).strip()
    start_date = str(data.get("start_date") or datetime.now().strftime("%Y-%m-%d")).strip()
    if not title or not end_date:
        return jsonify({"status": "error", "message": "標題與截止日為必填"}), 400
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
        semester_week = int(data.get("semester_week", 11))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "日期格式須為 YYYY-MM-DD，週次須為數字"}), 400
    if end_date < start_date:
        return jsonify({"status": "error", "message": "截止日不可早於開始日"}), 400

    # applies_to_dept 有外鍵對應 departments，「全校」要存 NULL，不能存 'all'
    dept = data.get("applies_to_dept") or None
    item = {
        "title": title,
        "category": data.get("category", "課務組"),
        "semester_week": semester_week,
        "start_date": start_date,
        "end_date": end_date,
        "applies_to_role": data.get("applies_to_role", "all"),
        "applies_to_dept": None if dept == "all" else dept,
        "related_system_url": data.get("related_system_url", ""),
        "description": data.get("description", ""),
        "status_badge": "進行中"
    }
    try:
        result = db_execute(
            "INSERT INTO deadlines (title, category, semester_week, start_date, end_date, applies_to_role, applies_to_dept, "
            "related_system_url, description, status_badge) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            tuple(item.values())
        )
    except Exception as e:
        return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
    if result:
        item = {"deadline_id": result["lastrowid"], **item}
    else:
        item = {"deadline_id": max([d["deadline_id"] for d in DEMO_DEADLINES], default=0) + 1, **item}
        DEMO_DEADLINES.append(item)
    write_audit_log("deadlines", item["deadline_id"], "新增", after=item)
    return jsonify({"status": "success", "message": "期限項目新增成功！", "data": item}), 201

# ---------- 學期校曆事項 (academic_calendar) ----------

CALENDAR_UPCOMING_DAYS = 14

def normalize_calendar_row(row):
    """MySQL 回傳的 date 物件轉為 YYYY-MM-DD 字串，與示範資料格式一致"""
    item = dict(row)
    for key in ("start_date", "end_date"):
        if hasattr(item.get(key), "isoformat"):
            item[key] = item[key].isoformat()
    return item

def fetch_calendar_events():
    """優先讀取 MySQL，離線或查詢失敗時改用示範資料"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM academic_calendar ORDER BY start_date ASC, id ASC")
            rows = [normalize_calendar_row(r) for r in cursor.fetchall()]
            cursor.close()
            conn.close()
            return rows
        except Exception:
            conn.close()
    return sorted(DEMO_ACADEMIC_CALENDAR, key=lambda e: (e["start_date"], e["id"]))

def parse_calendar_payload(data):
    """驗證校曆事項欄位，回傳 (item, 錯誤訊息)"""
    event_name = str(data.get("event_name", "")).strip()
    category = str(data.get("category", "")).strip() or "教務"
    if not event_name:
        return None, "事項名稱為必填"
    try:
        start = datetime.strptime(str(data.get("start_date", "")), "%Y-%m-%d").date()
        end = datetime.strptime(str(data.get("end_date", "")), "%Y-%m-%d").date()
    except ValueError:
        return None, "開始與結束日期為必填，格式為 YYYY-MM-DD"
    if end < start:
        return None, "結束日期不可早於開始日期"
    related = data.get("related_checklist_id")
    if related in (None, "", "null"):
        related = None
    else:
        try:
            related = int(related)
        except (TypeError, ValueError):
            return None, "關聯申辦流程 ID 格式錯誤"
    return {
        "event_name": event_name,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "category": category,
        "related_checklist_id": related
    }, None

@app.route("/api/calendar/now", methods=["GET"])
def get_calendar_now():
    """回傳今天進行中、以及 14 天內即將開始的校曆事項與剩餘天數 (可用 ?date=YYYY-MM-DD 模擬日期)"""
    try:
        today = datetime.strptime(request.args["date"], "%Y-%m-%d").date() if request.args.get("date") else datetime.now().date()
    except ValueError:
        return jsonify({"status": "error", "message": "date 格式須為 YYYY-MM-DD"}), 400

    ongoing, upcoming = [], []
    for event in fetch_calendar_events():
        start = datetime.strptime(event["start_date"], "%Y-%m-%d").date()
        end = datetime.strptime(event["end_date"], "%Y-%m-%d").date()
        if start <= today <= end:
            # days_left = 0 代表今天截止
            ongoing.append({**event, "days_left": (end - today).days})
        elif today < start <= today + timedelta(days=CALENDAR_UPCOMING_DAYS):
            upcoming.append({**event, "days_until_start": (start - today).days, "days_left": (end - today).days})

    ongoing.sort(key=lambda e: e["days_left"])
    upcoming.sort(key=lambda e: e["days_until_start"])
    return jsonify({
        "status": "success",
        "today": today.isoformat(),
        "ongoing": ongoing,
        "upcoming": upcoming
    }), 200

@app.route("/api/academic-calendar", methods=["GET", "POST"])
def manage_academic_calendar():
    global DEMO_ACADEMIC_CALENDAR
    if request.method == "GET":
        return jsonify({"status": "success", "data": fetch_calendar_events()}), 200

    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    item, error = parse_calendar_payload(request.get_json(silent=True) or {})
    if error:
        return jsonify({"status": "error", "message": error}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO academic_calendar (event_name, start_date, end_date, category, related_checklist_id) VALUES (%s, %s, %s, %s, %s)",
                (item["event_name"], item["start_date"], item["end_date"], item["category"], item["related_checklist_id"])
            )
            conn.commit()
            item = {"id": cursor.lastrowid, **item}
            cursor.close()
            conn.close()
            write_audit_log("academic_calendar", item["id"], "新增", after=item)
            return jsonify({"status": "success", "message": "校曆事項新增成功！", "data": item}), 201
        except Exception as e:
            conn.close()
            return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500

    item = {"id": max([e["id"] for e in DEMO_ACADEMIC_CALENDAR], default=0) + 1, **item}
    DEMO_ACADEMIC_CALENDAR.append(item)
    write_audit_log("academic_calendar", item["id"], "新增", after=item)
    return jsonify({"status": "success", "message": "校曆事項新增成功！", "data": item}), 201

@app.route("/api/academic-calendar/<int:event_id>", methods=["PUT", "DELETE"])
@role_required("管理員", "教職員")
def update_or_delete_academic_calendar(event_id):
    global DEMO_ACADEMIC_CALENDAR
    item = None
    if request.method == "PUT":
        item, error = parse_calendar_payload(request.get_json(silent=True) or {})
        if error:
            return jsonify({"status": "error", "message": error}), 400

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM academic_calendar WHERE id = %s", (event_id,))
            before = cursor.fetchone()
            before = normalize_calendar_row(before) if before else None
            cursor.close()
            cursor = conn.cursor()
            if request.method == "DELETE":
                cursor.execute("DELETE FROM academic_calendar WHERE id = %s", (event_id,))
            else:
                cursor.execute(
                    "UPDATE academic_calendar SET event_name = %s, start_date = %s, end_date = %s, category = %s, related_checklist_id = %s WHERE id = %s",
                    (item["event_name"], item["start_date"], item["end_date"], item["category"], item["related_checklist_id"], event_id)
                )
            conn.commit()
            # UPDATE 內容未變時 rowcount 也是 0，因此另外確認資料是否存在
            cursor.execute("SELECT COUNT(*) FROM academic_calendar WHERE id = %s", (event_id,))
            exists = cursor.fetchone()[0] > 0
            cursor.close()
            conn.close()
        except Exception as e:
            conn.close()
            return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
        if request.method == "DELETE":
            if before:
                write_audit_log("academic_calendar", event_id, "刪除", before=before)
            return jsonify({"status": "success", "message": "校曆事項已刪除！"}), 200
        if not exists:
            return jsonify({"status": "error", "message": "找不到該校曆事項"}), 404
        write_audit_log("academic_calendar", event_id, "修改", before=before, after={"id": event_id, **item})
        return jsonify({"status": "success", "message": "校曆事項更新成功！", "data": {"id": event_id, **item}}), 200

    target = next((e for e in DEMO_ACADEMIC_CALENDAR if e["id"] == event_id), None)
    if not target:
        return jsonify({"status": "error", "message": "找不到該校曆事項"}), 404
    if request.method == "DELETE":
        DEMO_ACADEMIC_CALENDAR.remove(target)
        write_audit_log("academic_calendar", event_id, "刪除", before=target)
        return jsonify({"status": "success", "message": "校曆事項已刪除！"}), 200
    before = dict(target)
    target.update(item)
    write_audit_log("academic_calendar", event_id, "修改", before=before, after=target)
    return jsonify({"status": "success", "message": "校曆事項更新成功！", "data": target}), 200

# ==========================================
# 6. 規章搜尋、滿意度反饋與未命中成長庫 API (功能 4)
# ==========================================

def log_search(query, matched):
    """每次搜尋寫一筆 search_logs；MySQL 離線或寫入失敗時存於記憶體"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO search_logs (query, matched) VALUES (%s, %s)", (query[:255], 1 if matched else 0))
            conn.commit()
            cursor.close()
            conn.close()
            return
        except Exception:
            conn.close()
    DEMO_SEARCH_LOGS.append({
        "id": max([l["id"] for l in DEMO_SEARCH_LOGS], default=0) + 1,
        "query": query,
        "matched": 1 if matched else 0,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

def fetch_db_rows(sql, params=()):
    """執行查詢並回傳 dict 列表；MySQL 離線或查詢失敗時回傳 None，由呼叫端改用示範資料計算"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception:
        conn.close()
        return None

def db_execute(sql, params=()):
    """執行寫入 SQL：MySQL 離線時回傳 None，由呼叫端改寫示範資料；SQL 執行失敗則拋出例外，不悄悄退回示範資料"""
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        conn.commit()
        result = {"lastrowid": cursor.lastrowid, "rowcount": cursor.rowcount}
        cursor.close()
        return result
    finally:
        conn.close()

def record_unmatched_query(query_text):
    """查無結果的關鍵字累計搜尋次數 (unmatched_queries.query_text 為 UNIQUE)；MySQL 離線時存於記憶體"""
    try:
        if db_execute(
            "INSERT INTO unmatched_queries (query_text) VALUES (%s) "
            "ON DUPLICATE KEY UPDATE search_count = search_count + 1, last_searched_at = CURRENT_TIMESTAMP",
            (query_text[:255],)
        ) is not None:
            return
    except Exception as e:
        # 記錄失敗不影響學生看到搜尋結果
        print(f"⚠️ 未命中關鍵字寫入失敗：{e}")
        return
    existing = next((u for u in DEMO_UNMATCHED_QUERIES if u["query_text"] == query_text), None)
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if existing:
        existing["search_count"] += 1
        existing["last_searched_at"] = now
    else:
        DEMO_UNMATCHED_QUERIES.append({
            "query_id": max([u["query_id"] for u in DEMO_UNMATCHED_QUERIES], default=0) + 1,
            "query_text": query_text,
            "search_count": 1,
            "status": "待處理",
            "resolved_term": None,
            "last_searched_at": now
        })

def load_unmatched_queries():
    rows = fetch_db_rows("SELECT * FROM unmatched_queries ORDER BY search_count DESC, last_searched_at DESC")
    if rows is None:
        return sorted(DEMO_UNMATCHED_QUERIES, key=lambda x: x["search_count"], reverse=True)
    for r in rows:
        for key in ("first_searched_at", "last_searched_at"):
            if hasattr(r.get(key), "strftime"):
                r[key] = r[key].strftime("%Y-%m-%d %H:%M:%S")
    return rows

@app.route("/api/search", methods=["POST"])
def search_knowledge():
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
    checklists = load_checklists()

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
        log_search(user_query, True)
        related_chk = next((c for c in checklists if c.get("related_kb_id") == best_match["id"] or best_match.get("keyword", "") in c["business_name"]), None)

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
    log_search(user_query, False)
    record_unmatched_query(user_query)

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

@app.route("/api/feedback", methods=["POST"])
@app.route("/api/search/feedback", methods=["POST"])  # 舊路徑保留相容
def submit_search_feedback():
    """接收學生對搜尋結果的評價 👍/👎，寫入 search_feedback；MySQL 離線時存於記憶體"""
    global DEMO_SEARCH_FEEDBACK
    data = request.get_json(silent=True) or {}
    query_text = str(data.get("query", data.get("query_text", ""))).strip()
    rule_id = data.get("rule_id", data.get("kb_id"))
    helpful_raw = data.get("helpful", data.get("is_helpful"))
    comment = str(data.get("comment", "")).strip()

    if not query_text:
        return jsonify({"status": "error", "message": "query 為必填"}), 400
    if helpful_raw not in (0, 1, True, False, "0", "1", "true", "false"):
        return jsonify({"status": "error", "message": "helpful 須為是/否"}), 400
    is_helpful = 1 if helpful_raw in (1, True, "1", "true") else 0
    try:
        rule_id = int(rule_id) if rule_id not in (None, "") else None
    except (TypeError, ValueError):
        rule_id = None

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO search_feedback (kb_id, query_text, is_helpful, comment) VALUES (%s, %s, %s, %s)", (rule_id, query_text[:255], is_helpful, comment))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "message": "感謝您的評價與回饋！這將幫助系統更加完善。"}), 201
        except Exception:
            conn.close()

    DEMO_SEARCH_FEEDBACK.append({
        "feedback_id": max([f["feedback_id"] for f in DEMO_SEARCH_FEEDBACK], default=0) + 1,
        "kb_id": rule_id,
        "query_text": query_text,
        "is_helpful": is_helpful,
        "comment": comment,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    return jsonify({"status": "success", "message": "感謝您的評價與回饋！這將幫助系統更加完善。"}), 201

@app.route("/api/admin/missed-queries", methods=["GET"])
@role_required("管理員", "教職員")
def get_missed_queries():
    """學生找不到的問題：查無結果的關鍵字 + 被按 👎 的查詢，依總次數排序"""
    unmatched = fetch_db_rows("SELECT query, COUNT(*) AS cnt, MAX(created_at) AS last_at FROM search_logs WHERE matched = 0 GROUP BY query")
    unhelpful = fetch_db_rows("SELECT query_text AS query, COUNT(*) AS cnt, MAX(created_at) AS last_at FROM search_feedback WHERE is_helpful = 0 GROUP BY query_text")

    def aggregate(rows, key):
        result = {}
        for r in rows:
            entry = result.setdefault(r[key], {"cnt": 0, "last_at": ""})
            entry["cnt"] += 1
            entry["last_at"] = max(entry["last_at"], r["created_at"])
        return [{"query": q, **v} for q, v in result.items()]

    if unmatched is None:
        unmatched = aggregate([l for l in DEMO_SEARCH_LOGS if not l["matched"]], "query")
    if unhelpful is None:
        unhelpful = aggregate([f for f in DEMO_SEARCH_FEEDBACK if not f["is_helpful"]], "query_text")

    merged = {}
    for source, field in ((unmatched, "unmatched_count"), (unhelpful, "unhelpful_count")):
        for r in source:
            item = merged.setdefault(r["query"], {"query": r["query"], "unmatched_count": 0, "unhelpful_count": 0, "last_at": ""})
            item[field] += int(r["cnt"])
            item["last_at"] = max(item["last_at"], str(r["last_at"] or ""))

    items = sorted(merged.values(), key=lambda x: (x["unmatched_count"] + x["unhelpful_count"], x["last_at"]), reverse=True)
    for item in items:
        item["total_count"] = item["unmatched_count"] + item["unhelpful_count"]
    return jsonify({"status": "success", "data": items}), 200

@app.route("/api/admin/search-stats", methods=["GET"])
@role_required("管理員", "教職員")
def get_search_stats():
    """本週 (週一 00:00 起) 搜尋次數與未命中率"""
    now = datetime.now()
    week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    rows = fetch_db_rows(
        "SELECT COUNT(*) AS total, COALESCE(SUM(matched = 0), 0) AS unmatched FROM search_logs WHERE created_at >= %s",
        (week_start,)
    )
    if rows is not None:
        total, unmatched = int(rows[0]["total"]), int(rows[0]["unmatched"])
    else:
        week_logs = [l for l in DEMO_SEARCH_LOGS if l["created_at"] >= week_start.strftime("%Y-%m-%d %H:%M:%S")]
        total = len(week_logs)
        unmatched = sum(1 for l in week_logs if not l["matched"])
    return jsonify({
        "status": "success",
        "week_start": week_start.strftime("%Y-%m-%d"),
        "week_search_count": total,
        "week_unmatched_count": unmatched,
        # 本週尚無搜尋時未命中率為 null，前端顯示「—」
        "unmatched_rate": round(unmatched / total * 100, 1) if total else None
    }), 200

@app.route("/api/admin/unmatched-queries", methods=["GET"])
@role_required("管理員", "教職員")
def get_unmatched_queries():
    """後台查看學生搜了但找不到的關鍵字 (功能 4)"""
    return jsonify({"status": "success", "data": load_unmatched_queries()}), 200

@app.route("/api/admin/unmatched-queries/convert-synonym", methods=["POST"])
@role_required("管理員", "教職員")
def convert_unmatched_to_synonym():
    """管理員一鍵將未命中關鍵字轉為同義詞 (功能 4 閉環)"""
    data = request.get_json(silent=True) or {}
    user_keyword = str(data.get("user_keyword", "")).strip()
    official_term = str(data.get("official_term", "")).strip()
    try:
        query_id = int(data.get("query_id")) if data.get("query_id") not in (None, "") else None
        category_id = int(data.get("category_id", 1))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "query_id 與分類必須是數字"}), 400

    if not user_keyword or not official_term:
        return jsonify({"status": "error", "message": "搜尋關鍵字與官方標準名稱為必填"}), 400

    try:
        # 1. 加入同義詞庫
        add_synonym(user_keyword, official_term, category_id)
        # 2. 標記未命中記錄為已處理
        result = db_execute(
            "UPDATE unmatched_queries SET status = '已轉同義詞', resolved_term = %s WHERE query_text = %s OR query_id = %s",
            (official_term[:100], user_keyword, query_id)
        )
    except Exception as e:
        return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
    if result is None:
        for u in DEMO_UNMATCHED_QUERIES:
            if u["query_text"] == user_keyword or u.get("query_id") == query_id:
                u["status"] = "已轉同義詞"
                u["resolved_term"] = official_term

    return jsonify({"status": "success", "message": f"成功將「{user_keyword}」轉換為同義詞「{official_term}」！詞庫已即時更新。"}), 200

@app.route("/api/admin/audit-logs", methods=["GET"])
@role_required("管理員", "教職員")
def get_audit_logs():
    """後台修改紀錄：誰在何時新增/修改/刪除了規章、同義詞、期限、申辦流程、連結 (R5)"""
    rows = fetch_db_rows("SELECT * FROM audit_logs ORDER BY changed_at DESC, log_id DESC LIMIT 200")
    if rows is None:
        rows = sorted(DEMO_AUDIT_LOGS, key=lambda x: x["log_id"], reverse=True)[:200]
    else:
        for r in rows:
            r["changed_at"] = str(r["changed_at"])
            for key in ("before_json", "after_json"):
                if isinstance(r.get(key), str):
                    try: r[key] = json.loads(r[key])
                    except Exception: pass
    table_filter = request.args.get("table_name")
    if table_filter:
        rows = [r for r in rows if r.get("table_name") == table_filter]
    return jsonify({"status": "success", "data": rows}), 200

@app.route("/api/admin/search-feedback/stats", methods=["GET"])
@role_required("管理員", "教職員")
def get_search_feedback_stats():
    """後台搜尋滿意度統計 (功能 4)"""
    feedbacks = fetch_db_rows("SELECT * FROM search_feedback")
    if feedbacks is None:
        feedbacks = DEMO_SEARCH_FEEDBACK
    else:
        for f in feedbacks:
            f["created_at"] = str(f["created_at"])
    total = len(feedbacks)
    helpful_count = sum(1 for f in feedbacks if f["is_helpful"] == 1)
    unhelpful_count = total - helpful_count
    rate = round((helpful_count / total * 100), 1) if total > 0 else 100.0
    return jsonify({
        "status": "success",
        "total_feedback": total,
        "helpful_count": helpful_count,
        "unhelpful_count": unhelpful_count,
        "satisfaction_rate": rate,
        "recent_feedbacks": sorted(feedbacks, key=lambda x: x.get("created_at", ""), reverse=True)[:10]
    }), 200

# ==========================================
# 7. 個人化課程地圖、擋修修復與骨牌被當試算 (功能 1 & 功能 5)
# ==========================================

COURSE_MAP_SQL = """
    SELECT c.course_id, c.course_name, c.credits, c.prerequisite_id, c.is_required,
           c.course_type, c.dept_id, c.semester_suggest, c.description,
           p.course_name as prerequisite_name
    FROM course_map c
    LEFT JOIN course_map p ON c.prerequisite_id = p.course_id
    ORDER BY c.course_id ASC
"""

def load_course_map():
    """課程地圖：有連 MySQL 時讀 course_map，離線或資料表為空時回退 DEMO_COURSES"""
    rows = fetch_db_rows(COURSE_MAP_SQL)
    return rows if rows else DEMO_COURSES

def load_student_credits(student_id):
    """學生成績：有連 MySQL 時讀 student_credits，離線時回退 DEMO_STUDENT_CREDITS"""
    rows = fetch_db_rows(
        "SELECT course_id, semester, score, is_passed FROM student_credits WHERE student_id = %s ORDER BY semester ASC",
        (student_id,)
    )
    if rows is None:
        return [c for c in DEMO_STUDENT_CREDITS if c["student_id"] == student_id]
    # DECIMAL 轉 float 以便輸出 JSON
    return [{**r, "score": float(r["score"]) if r["score"] is not None else None} for r in rows]

def current_student_id():
    """登入的學生 (或綁定子女的家長) 學號；未登入或其他身分回傳 None"""
    if session.get("role") in ("學生", "家長"):
        return session.get("student_id")
    return None

def summarize_credits(credit_records):
    """整理成績：同一科重修時以最近一次成績為準，任何一次及格即視為通過"""
    passed, latest = set(), {}
    for r in credit_records:
        latest[r["course_id"]] = r
        if r["is_passed"]:
            passed.add(r["course_id"])
    failed = {cid for cid in latest if cid not in passed}
    return passed, failed, latest

@app.route("/api/courses", methods=["GET"])
def get_all_courses():
    """取得完整課程地圖（優先讀取 MySQL，離線回退 DEMO_COURSES）"""
    return jsonify({"status": "success", "data": load_course_map()}), 200

@app.route("/api/courses/check", methods=["POST", "GET"])
def check_courses_prerequisites():
    """先修擋修檢核：
    - GET：登入學生自動從 student_credits 帶入成績
    - POST：未登入的手動模擬模式，由前端傳入 passed_course_ids
    """
    courses = load_course_map()
    failed_ids, latest = set(), {}
    student = None

    if request.method == "POST":
        mode = "manual"
        data = request.get_json(silent=True) or {}
        passed_ids = {str(cid) for cid in data.get("passed_course_ids", [])}
    else:
        student_id = current_student_id()
        if not student_id:
            return jsonify({"status": "error", "message": "請先登入學生帳號，或改用手動模擬模式"}), 401
        mode = "student"
        passed_ids, failed_ids, latest = summarize_credits(load_student_credits(student_id))
        student = {"student_id": student_id, "full_name": session.get("full_name", ""), "dept_name": session.get("dept_name", "")}

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

        if is_passed:
            status = "passed"
        elif cid in failed_ids:
            status = "failed"
        elif not can_take:
            status = "blocked"
        else:
            status = "eligible"

        record = latest.get(cid)
        evaluated.append({
            **c,
            "is_passed": is_passed,
            "can_take": can_take,
            "is_blocked": not can_take and not is_passed,
            "missing_prerequisite": missing_prereq,
            "status": status,
            "score": record["score"] if record else None,
            "semester_taken": record["semester"] if record else None
        })

    return jsonify({
        "status": "success",
        "mode": mode,
        "student": student,
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
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "error", "message": "請先登入學生帳號"}), 401
    student = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id),
                   {"student_id": student_id, "full_name": session.get("full_name", ""), "dept_name": session.get("dept_name", "")})

    courses = load_course_map()
    credit_records = load_student_credits(student_id)
    passed_ids, failed_ids, latest = summarize_credits(credit_records)
    course_map_dict = {c["course_id"]: c for c in courses}

    passed_courses = []
    failed_courses = []
    blocked_courses = []
    eligible_next_courses = []

    for c in courses:
        cid = c["course_id"]
        pre_id = c.get("prerequisite_id")

        if cid in passed_ids:
            rec = latest.get(cid)
            passed_courses.append({
                **c,
                "score": rec.get("score") if rec else None,
                "semester": rec.get("semester") if rec else None
            })
        elif pre_id and pre_id not in passed_ids:
            blocked_courses.append({
                **c,
                "blocked_by_id": pre_id,
                "blocked_by_name": course_map_dict.get(pre_id, {}).get("course_name", pre_id),
                "reason": f"先修科目【{course_map_dict.get(pre_id, {}).get('course_name', pre_id)}】未通過，系統自動擋修"
            })
        elif cid not in failed_ids:
            eligible_next_courses.append(c)

    for cid in failed_ids:
        f = latest[cid]
        c_info = course_map_dict.get(cid, {})
        # 尋找因這門課被當而連帶被擋的科目
        downstream = [c["course_name"] for c in courses if c.get("prerequisite_id") == cid]
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

    courses = load_course_map()
    course_dict = {c["course_id"]: c for c in courses}
    target_course = course_dict.get(target_id)
    if not target_course:
        return jsonify({"status": "error", "message": "查無此課程"}), 404

    # 遞迴找出所有骨牌下游連鎖被擋科目
    cascade_blocked = []
    queue = [target_id]
    visited = set()

    while queue:
        curr = queue.pop(0)
        for c in courses:
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
            f"2. 於下學期開學初向科辦登記暑期重修開班調查。",
            f"3. 調整選課計畫，優先確保先修鏈樞紐【{target_course['course_name']}】及格通過。"
        ]
    }), 200

# ==========================================
# 8. 畢業學分預審與門檻細拆 API (功能 5)
# ==========================================

@app.route("/api/student/graduation-audit", methods=["GET"])
def get_graduation_audit():
    """畢業學分預審：拆解總學分 220、必修、選修、通識、英文門檻與專題缺口 (功能 5)"""
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
                "category": "科專業必修",
                "required": dept_req["major_required_req"],
                "earned": major_req_earned,
                "remaining": max(0, dept_req["major_required_req"] - major_req_earned),
                "is_met": major_req_earned >= dept_req["major_required_req"],
                "icon": "📘"
            },
            {
                "category": "科專業選修",
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
# 8b. 畢業門檻儀表板 API (學分進度環、證照門檻、同屆證照統計)
#     /api/student/graduation/dashboard、/api/student/graduation/export.csv、/api/teacher/class-summary
#     五專畢業學分 220、專業證照畢業門檻 2 張
# ==========================================

def _resolve_graduation_target_student(role, session_student_id, requested_id):
    """解析可查詢的學號，避免用 ?student_id= 查到別人的資料：學生/家長只能看自己，教職員/老師/管理員需指定學號"""
    if role == "學生":
        return session_student_id, None
    if role == "家長":
        if requested_id and requested_id != session_student_id:
            return None, ("無權查詢非本人子女之學生資料", 403)
        return session_student_id, None
    if role in ("教職員", "管理員", "老師"):
        if not requested_id:
            return None, ("請提供欲查詢之學號 (student_id)", 400)
        return requested_id, None
    return None, ("此身分無權查詢畢業門檻儀表板", 403)

def _load_student_info(student_id):
    rows = fetch_db_rows("""
        SELECT s.student_id, s.full_name, s.dept_id, s.admission_year, s.class_name, d.dept_name
        FROM students s JOIN departments d ON s.dept_id = d.dept_id WHERE s.student_id = %s
    """, (student_id,))
    if rows:
        return rows[0]
    return next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), None)

def _load_cohort(admission_year):
    """同屆 (同入學學年度) 學號與證照紀錄"""
    ids = fetch_db_rows("SELECT student_id FROM students WHERE admission_year = %s", (admission_year,))
    certs = fetch_db_rows("""
        SELECT c.student_id, c.cert_name, c.issue_date
        FROM certificates c JOIN students s ON c.student_id = s.student_id
        WHERE s.admission_year = %s ORDER BY c.issue_date DESC
    """, (admission_year,))
    if ids is None or certs is None:
        ids = [{"student_id": s["student_id"]} for s in DEMO_STUDENTS if s["admission_year"] == admission_year]
        cohort_ids = {r["student_id"] for r in ids}
        certs = [c for c in DEMO_CERTIFICATES if c["student_id"] in cohort_ids]
    certs = [{**c, "issue_date": str(c.get("issue_date") or "")} for c in certs]
    return {r["student_id"] for r in ids}, certs

def _load_dept_requirements(dept_id):
    rows = fetch_db_rows("SELECT * FROM graduation_requirements WHERE dept_id = %s", (dept_id,))
    if rows:
        return rows[0]
    return DEMO_GRADUATION_REQUIREMENTS.get(dept_id, DEMO_GRADUATION_REQUIREMENTS["CS"])

def _compute_graduation_dashboard(student_id):
    """單一學生的畢業學分/證照達成度、各類學分細拆，並與同屆比較證照；查無學生回傳 None"""
    student = _load_student_info(student_id)
    if not student:
        return None

    course_by_id = {c["course_id"]: c for c in load_course_map()}
    passed_ids, _, _ = summarize_credits(load_student_credits(student_id))
    passed_courses = [course_by_id[cid] for cid in passed_ids if cid in course_by_id]
    earned = sum(int(c["credits"]) for c in passed_courses)

    cohort_ids, cohort_certs = _load_cohort(student["admission_year"])
    cohort_size = len(cohort_ids)
    own_certs = [c for c in cohort_certs if c["student_id"] == student_id]
    own_cert_names = {c["cert_name"] for c in own_certs}

    certs_by_student, holders_by_cert = {}, {}
    for c in cohort_certs:
        certs_by_student.setdefault(c["student_id"], set()).add(c["cert_name"])
        holders_by_cert.setdefault(c["cert_name"], set()).add(c["student_id"])
    with_1plus = sum(1 for names in certs_by_student.values() if names)
    meeting_threshold = sum(1 for names in certs_by_student.values() if len(names) >= GRADUATION_CERT_REQUIREMENT)
    pct = lambda n: round(n / cohort_size * 100, 1) if cohort_size else 0

    # 各類學分細拆 (科專業必修/選修、通識與共同必修)，門檻取自該科畢業學分標準
    req = _load_dept_requirements(student["dept_id"])
    def category(name, required, types):
        got = sum(int(c["credits"]) for c in passed_courses if c.get("course_type") in types)
        return {"category": name, "required": int(required), "earned": got,
                "remaining": max(0, int(required) - got), "is_met": got >= int(required)}
    breakdown = [
        category("科專業必修", req["major_required_req"], ("專業必修",)),
        category("科專業選修", req["major_elective_req"], ("專業選修",)),
        category("通識與共同必修", req["general_req"], ("通識教育", "共同必修")),
    ]

    threshold = int(req.get("total_credits_req") or GRADUATION_CREDIT_THRESHOLD)
    meets_credits = earned >= threshold
    meets_certs = len(own_cert_names) >= GRADUATION_CERT_REQUIREMENT
    return {
        "student": {k: student.get(k) for k in ("student_id", "full_name", "dept_name", "admission_year", "class_name")},
        "credits": {
            "earned": earned,
            "threshold": threshold,
            "remaining": max(0, threshold - earned),
            "progress_percent": round(min(100, earned / threshold * 100), 1),
            "meets_requirement": meets_credits,
            "breakdown": breakdown,
            "english_threshold_name": req.get("english_threshold_name", "")
        },
        "certificates": {
            "owned_count": len(own_cert_names),
            "required": GRADUATION_CERT_REQUIREMENT,
            "meets_requirement": meets_certs,
            "list": own_certs
        },
        "overall_meets_graduation_requirement": meets_credits and meets_certs,
        "cohort": {
            "admission_year": student["admission_year"],
            "cohort_size": cohort_size,
            "students_with_1plus_cert": with_1plus,
            "percent_1plus_cert": pct(with_1plus),
            "students_meeting_cert_threshold": meeting_threshold,
            "percent_meeting_cert_threshold": pct(meeting_threshold),
            "cert_breakdown": sorted(
                [{"cert_name": name, "holder_count": len(h), "percent_of_cohort": pct(len(h))} for name, h in holders_by_cert.items()],
                key=lambda x: (-x["holder_count"], x["cert_name"])
            )
        }
    }

def _graduation_target_or_error():
    target, err = _resolve_graduation_target_student(session.get("role"), session.get("student_id"), request.args.get("student_id", "").strip() or None)
    if err:
        return None, (jsonify({"status": "error", "message": err[0]}), err[1])
    result = _compute_graduation_dashboard(target)
    if result is None:
        return None, (jsonify({"status": "error", "message": "查無此學號之學生資料"}), 404)
    return result, None

@app.route("/api/student/graduation/dashboard", methods=["GET"])
@login_required
def student_graduation_dashboard():
    result, error = _graduation_target_or_error()
    if error:
        return error
    return jsonify({"status": "success", **result}), 200

@app.route("/api/student/graduation/export.csv", methods=["GET"])
@login_required
def export_graduation_dashboard_csv():
    """畢業門檻儀表板匯出 CSV (UTF-8 BOM，Excel 可直接開啟)"""
    result, error = _graduation_target_or_error()
    if error:
        return error
    stu, credits, certs, cohort = result["student"], result["credits"], result["certificates"], result["cohort"]
    buf = StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Smart UKN 畢業門檻儀表板匯出報表"])
    writer.writerow(["產出時間", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow([])
    writer.writerow(["項目", "數值"])
    for label, value in [
        ("學號", stu["student_id"]), ("姓名", stu["full_name"]), ("科系", stu["dept_name"]),
        ("入學學年度", stu["admission_year"]), ("班級", stu["class_name"]),
        ("已獲學分", credits["earned"]), ("畢業學分門檻", credits["threshold"]), ("尚缺學分", credits["remaining"]),
        ("學分達成率(%)", credits["progress_percent"]),
        ("已取得證照數", certs["owned_count"]), ("畢業門檻證照數", certs["required"]),
        ("是否達成證照門檻", "是" if certs["meets_requirement"] else "否"),
        ("是否達成畢業條件", "是" if result["overall_meets_graduation_requirement"] else "否"),
    ]:
        writer.writerow([label, value])
    writer.writerow([])
    writer.writerow(["學分類別", "已修", "門檻", "尚缺"])
    for b in credits["breakdown"]:
        writer.writerow([b["category"], b["earned"], b["required"], b["remaining"]])
    writer.writerow([])
    writer.writerow(["同屆統計", ""])
    writer.writerow(["同屆人數", cohort["cohort_size"]])
    writer.writerow(["同屆至少 1 張證照人數", cohort["students_with_1plus_cert"]])
    writer.writerow(["同屆達成雙證照門檻人數", cohort["students_meeting_cert_threshold"]])
    writer.writerow([])
    writer.writerow(["證照名稱", "本屆持有人數", "占本屆比例(%)"])
    for c in cohort["cert_breakdown"]:
        writer.writerow([c["cert_name"], c["holder_count"], c["percent_of_cohort"]])

    response = make_response(buf.getvalue().encode("utf-8-sig"))
    response.headers["Content-Type"] = "text/csv; charset=utf-8"
    response.headers["Content-Disposition"] = f"attachment; filename=\"graduation_dashboard_{stu['student_id']}.csv\""
    return response

def _get_class_student_ids(class_name):
    rows = fetch_db_rows("SELECT student_id FROM students WHERE class_name = %s ORDER BY student_id", (class_name,))
    if rows:
        return [r["student_id"] for r in rows]
    return [s["student_id"] for s in DEMO_STUDENTS if s["class_name"] == class_name]

@app.route("/api/teacher/class-summary", methods=["GET"])
@role_required("老師", "教職員", "管理員")
def teacher_class_summary():
    """導師班級總表：老師預設看自己帶的班，教職員/管理員可用 ?class_name= 指定班級"""
    class_name = request.args.get("class_name") or session.get("advised_class")
    if not class_name:
        return jsonify({"status": "error", "message": "請提供欲查詢之班級名稱 (class_name)"}), 400
    student_ids = _get_class_student_ids(class_name)
    if not student_ids:
        return jsonify({"status": "error", "message": f"查無「{class_name}」班級的學生資料"}), 404
    students = []
    for sid in student_ids:
        data = _compute_graduation_dashboard(sid)
        if not data:
            continue
        students.append({
            "student_id": sid,
            "full_name": data["student"]["full_name"],
            "credits_earned": data["credits"]["earned"],
            "credits_threshold": data["credits"]["threshold"],
            "certs_owned": data["certificates"]["owned_count"],
            "certs_required": data["certificates"]["required"],
            "overall_meets_graduation_requirement": data["overall_meets_graduation_requirement"]
        })
    return jsonify({"status": "success", "class_name": class_name, "students": students}), 200

# ==========================================
# 9. 申辦進度保存 API (功能 3: 我的申辦進度)
# ==========================================

def load_checklists():
    """申辦流程清單：有連 MySQL 時讀 checklist_items，離線時回退 DEMO_CHECKLISTS"""
    rows = fetch_db_rows("SELECT * FROM checklist_items ORDER BY item_id ASC")
    if not rows:
        return DEMO_CHECKLISTS
    for r in rows:
        if isinstance(r.get("steps_json"), str):
            try: r["steps_json"] = json.loads(r["steps_json"])
            except Exception: r["steps_json"] = [r["steps_json"]]
    return rows

def load_checklist_progress(student_id):
    """回傳 {item_id: [已完成的 step_index]}；MySQL 離線時讀記憶體"""
    rows = fetch_db_rows(
        "SELECT item_id, step_index FROM checklist_progress WHERE student_id = %s AND done = 1 ORDER BY item_id, step_index",
        (student_id,)
    )
    if rows is None:
        return {item_id: sorted(steps) for item_id, steps in DEMO_CHECKLIST_PROGRESS.get(student_id, {}).items() if steps}
    progress = {}
    for r in rows:
        progress.setdefault(r["item_id"], []).append(r["step_index"])
    return progress

def save_checklist_step(student_id, item_id, step_index, done):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO checklist_progress (student_id, item_id, step_index, done) VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE done = VALUES(done)
            """, (student_id, item_id, step_index, 1 if done else 0))
            conn.commit()
            cursor.close()
            conn.close()
            return
        except Exception:
            conn.close()
    steps = set(DEMO_CHECKLIST_PROGRESS.setdefault(student_id, {}).get(item_id, []))
    if done:
        steps.add(step_index)
    else:
        steps.discard(step_index)
    DEMO_CHECKLIST_PROGRESS[student_id][item_id] = sorted(steps)

@app.route("/api/checklist/progress", methods=["GET", "POST"])
def manage_checklist_progress():
    """登入學生的申辦步驟勾選進度 (checklist_progress)；未登入時不保存"""
    student_id = current_student_id()

    if request.method == "GET":
        if not student_id:
            return jsonify({"status": "success", "is_authenticated": False, "progress": {}}), 200
        return jsonify({"status": "success", "is_authenticated": True, "student_id": student_id, "progress": load_checklist_progress(student_id)}), 200

    # 只有學生本人可以勾選 (家長僅能查看)
    if not student_id or session.get("role") != "學生":
        return jsonify({"status": "error", "message": "請先以學生帳號登入，勾選進度才會保存"}), 401

    data = request.get_json(silent=True) or {}
    try:
        item_id = int(data.get("item_id"))
        step_index = int(data.get("step_index"))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "item_id 與 step_index 須為數字"}), 400
    done = data.get("done", data.get("is_completed", True)) in (True, 1, "1", "true")

    checklist = next((c for c in load_checklists() if c["item_id"] == item_id), None)
    if not checklist:
        return jsonify({"status": "error", "message": "找不到該申辦流程"}), 404
    if not 0 <= step_index < len(checklist.get("steps_json") or []):
        return jsonify({"status": "error", "message": "步驟編號超出範圍"}), 400

    save_checklist_step(student_id, item_id, step_index, done)
    return jsonify({
        "status": "success",
        "message": "申辦進度已儲存！下次登入仍會保留。",
        "progress": load_checklist_progress(student_id).get(item_id, [])
    }), 200

@app.route("/api/student/my-applications", methods=["GET"])
def get_my_applications():
    """取得登入學生已開始辦理的申辦流程與完成度 (首頁「我進行中的申辦」)"""
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "success", "requires_login": True, "data": []}), 200

    progress = load_checklist_progress(student_id)
    applications = []
    for chk in load_checklists():
        done_steps = progress.get(chk["item_id"], [])
        steps = chk.get("steps_json") or []
        if not done_steps or not steps:
            continue
        next_index = next((i for i in range(len(steps)) if i not in done_steps), None)
        applications.append({
            "item_id": chk["item_id"],
            "business_name": chk["business_name"],
            "category_name": chk.get("category_name", ""),
            "office_location": chk.get("office_location", ""),
            "contact_phone": chk.get("contact_phone", ""),
            "total_steps": len(steps),
            "completed_steps_count": len(done_steps),
            "completed_steps": done_steps,
            "progress_percent": round(len(done_steps) / len(steps) * 100),
            "is_completed": next_index is None,
            "next_step": steps[next_index] if next_index is not None else None
        })

    # 進行中的排前面，已全數完成的排後面
    applications.sort(key=lambda a: (a["is_completed"], -a["progress_percent"]))
    return jsonify({"status": "success", "requires_login": False, "data": applications}), 200

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
    if request.method == "GET":
        return jsonify({"status": "success", "data": load_checklists()}), 200

    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    data = request.get_json(silent=True) or {}
    item = {
        "category_id": int(data.get("category_id", 1)),
        "category_name": data.get("category_name", "課務組"),
        "business_name": str(data.get("business_name", "")).strip(),
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
    if not item["business_name"]:
        return jsonify({"status": "error", "message": "申辦項目名稱為必填"}), 400
    try:
        result = db_execute(
            "INSERT INTO checklist_items (category_id, category_name, business_name, steps_json, required_docs, office_hours, "
            "office_location, contact_phone, form_download_url, system_url, deadline_week_info, related_kb_id, audience) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (item["category_id"], item["category_name"], item["business_name"], json.dumps(item["steps_json"], ensure_ascii=False),
             item["required_docs"], item["office_hours"], item["office_location"], item["contact_phone"], item["form_download_url"],
             item["system_url"], item["deadline_week_info"], item["related_kb_id"], item["audience"])
        )
    except Exception as e:
        return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
    if result:
        item = {"item_id": result["lastrowid"], **item}
    else:
        item = {"item_id": max([c["item_id"] for c in DEMO_CHECKLISTS], default=0) + 1, **item}
        DEMO_CHECKLISTS.append(item)
    write_audit_log("checklist_items", item["item_id"], "新增", after=item)
    return jsonify({"status": "success", "message": "申辦指引流程新增成功！", "data": item}), 201

def load_synonyms():
    """同義詞：有連 MySQL 時讀 synonym_dictionary，離線時回退 DEMO_SYNONYMS"""
    rows = fetch_db_rows("SELECT * FROM synonym_dictionary ORDER BY synonym_id ASC")
    return rows if rows is not None else DEMO_SYNONYMS

def add_synonym(user_keyword, official_term, category_id):
    """新增同義詞並留修改紀錄，回傳新增的資料；資料庫寫入失敗時拋出例外"""
    item = {"category_id": category_id, "user_keyword": user_keyword, "official_term": official_term}
    result = db_execute(
        "INSERT INTO synonym_dictionary (category_id, user_keyword, official_term) VALUES (%s, %s, %s)",
        (category_id, user_keyword, official_term)
    )
    if result:
        item = {"synonym_id": result["lastrowid"], **item}
    else:
        item = {"synonym_id": max([s["synonym_id"] for s in DEMO_SYNONYMS], default=0) + 1, **item}
        DEMO_SYNONYMS.append(item)
    write_audit_log("synonym_dictionary", item["synonym_id"], "新增", after=item)
    return item

@app.route("/api/synonyms", methods=["GET", "POST"])
def manage_synonyms():
    if request.method == "GET":
        return jsonify({"status": "success", "data": load_synonyms()}), 200

    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    data = request.get_json(silent=True) or {}
    uk = str(data.get("user_keyword", "")).strip()
    ot = str(data.get("official_term", "")).strip()
    cid = int(data.get("category_id", 1))
    if not uk or not ot:
        return jsonify({"status": "error", "message": "俗稱關鍵字與官方標準名稱為必填"}), 400
    try:
        item = add_synonym(uk, ot, cid)
    except Exception as e:
        return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
    return jsonify({"status": "success", "message": "同義詞新增成功！", "id": item["synonym_id"]}), 201

@app.route("/api/synonyms/<int:synonym_id>", methods=["DELETE"])
@role_required("管理員", "教職員")
def delete_synonym(synonym_id):
    global DEMO_SYNONYMS
    target = next((s for s in load_synonyms() if s["synonym_id"] == synonym_id), None)
    if not target:
        return jsonify({"status": "error", "message": "找不到該同義詞"}), 404
    try:
        result = db_execute("DELETE FROM synonym_dictionary WHERE synonym_id = %s", (synonym_id,))
    except Exception as e:
        return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
    if result is None:
        DEMO_SYNONYMS = [s for s in DEMO_SYNONYMS if s["synonym_id"] != synonym_id]
    write_audit_log("synonym_dictionary", synonym_id, "刪除", before=target)
    return jsonify({"status": "success", "message": "同義詞刪除成功！"}), 200

# ==========================================
# 12. 規章知識庫維護與健康狀態 API
# ==========================================

def load_rules():
    """校規條文：有連 MySQL 時讀 knowledge_base (帶出分類名稱)，離線時回退 DEMO_KNOWLEDGE_BASE"""
    rows = fetch_db_rows(
        "SELECT k.*, c.category_name FROM knowledge_base k "
        "LEFT JOIN knowledge_categories c ON k.category_id = c.category_id ORDER BY k.id ASC")
    return rows if rows is not None else DEMO_KNOWLEDGE_BASE

def parse_rule_payload(data, current=None):
    """校規條文欄位：修改時沒傳的欄位沿用原值，回傳 (item, 錯誤訊息)"""
    current = current or {}
    try:
        category_id = int(data.get("category_id", current.get("category_id", 1)))
        page = int(data.get("page", current.get("page", 1)) or 1)
    except (TypeError, ValueError):
        return None, "分類與頁碼必須是數字"
    category = next((c for c in DEMO_CATEGORIES if c["category_id"] == category_id), None)
    if not category:
        return None, "分類不存在"
    item = {
        "category_id": category_id,
        "category_name": category["category_name"],
        "subcategory": str(data.get("subcategory", current.get("subcategory", "")) or "規章辦法").strip(),
        "keyword": str(data.get("keyword", current.get("keyword", ""))).strip(),
        "official_term": str(data.get("official_term", current.get("official_term", ""))).strip(),
        "content": str(data.get("content", current.get("content", ""))).strip(),
        "doc_name": str(data.get("doc_name", current.get("doc_name", "")) or "康寧大學法規.pdf").strip(),
        "page": page,
        "url": str(data.get("url", current.get("url", "")) or "https://www.ukn.edu.tw").strip()
    }
    if not item["keyword"] or not item["content"]:
        return None, "關鍵字與條文內容為必填"
    return item, None

RULE_DB_COLUMNS = ("category_id", "subcategory", "keyword", "official_term", "content", "doc_name", "page", "url")

@app.route("/api/rules", methods=["GET", "POST"])
def manage_rules():
    if request.method == "GET":
        return jsonify({"status": "success", "data": load_rules()}), 200

    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    item, error = parse_rule_payload(request.get_json(silent=True) or {})
    if error:
        return jsonify({"status": "error", "message": error}), 400
    try:
        result = db_execute(
            f"INSERT INTO knowledge_base ({', '.join(RULE_DB_COLUMNS)}) VALUES ({', '.join(['%s'] * len(RULE_DB_COLUMNS))})",
            tuple(item[c] for c in RULE_DB_COLUMNS)
        )
    except Exception as e:
        return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
    if result:
        item = {"id": result["lastrowid"], **item}
    else:
        item = {"id": max([r["id"] for r in DEMO_KNOWLEDGE_BASE], default=0) + 1, **item}
        DEMO_KNOWLEDGE_BASE.append(item)
    write_audit_log("knowledge_base", item["id"], "新增", after=item)
    return jsonify({"status": "success", "message": "校規條文新增成功！", "data": item}), 201

@app.route("/api/rules/<int:rule_id>", methods=["PUT", "DELETE"])
@role_required("管理員", "教職員")
def update_or_delete_rule(rule_id):
    global DEMO_KNOWLEDGE_BASE
    target = next((r for r in load_rules() if r["id"] == rule_id), None)
    if not target:
        return jsonify({"status": "error", "message": "找不到該條文"}), 404
    before = dict(target)

    if request.method == "DELETE":
        try:
            result = db_execute("DELETE FROM knowledge_base WHERE id = %s", (rule_id,))
        except Exception as e:
            return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
        if result is None:
            DEMO_KNOWLEDGE_BASE = [r for r in DEMO_KNOWLEDGE_BASE if r["id"] != rule_id]
        write_audit_log("knowledge_base", rule_id, "刪除", before=before)
        return jsonify({"status": "success", "message": "條文已成功刪除！"}), 200

    item, error = parse_rule_payload(request.get_json(silent=True) or {}, current=target)
    if error:
        return jsonify({"status": "error", "message": error}), 400
    try:
        result = db_execute(
            f"UPDATE knowledge_base SET {', '.join(f'{c} = %s' for c in RULE_DB_COLUMNS)} WHERE id = %s",
            tuple(item[c] for c in RULE_DB_COLUMNS) + (rule_id,)
        )
    except Exception as e:
        return jsonify({"status": "error", "message": f"資料庫寫入失敗：{e}"}), 500
    if result is None:
        target.update(item)
    item = {"id": rule_id, **item}
    write_audit_log("knowledge_base", rule_id, "修改", before=before, after=item)
    return jsonify({"status": "success", "message": "條文更新成功！", "data": item}), 200

# ==========================================
# 13. 學生專區統一入口連結 API (/api/links)
#     連結網址集中存放於 links.json，後台可新增/修改/刪除
# ==========================================

LINKS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "links.json")
links_lock = threading.Lock()

def load_quick_links():
    if not os.path.exists(LINKS_FILE):
        return {"categories": [], "links": []}
    with open(LINKS_FILE, encoding="utf-8") as f:
        return json.load(f)

def save_quick_links(data):
    # 先寫暫存檔再取代，避免寫到一半中斷導致設定檔損毀
    tmp_path = LINKS_FILE + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, LINKS_FILE)

def parse_link_payload(data, categories):
    """驗證連結欄位，回傳 (item, 錯誤訊息)"""
    title = str(data.get("title", "")).strip()
    url = str(data.get("url", "")).strip() or "#"
    category = str(data.get("category", "")).strip()
    if not title:
        return None, "連結名稱為必填"
    if category not in {c["key"] for c in categories}:
        return None, "分類不存在"
    # 僅允許 http(s) 或尚未設定的 "#"，避免 javascript: 等危險網址
    if url != "#" and not url.lower().startswith(("http://", "https://")):
        return None, "網址必須以 http:// 或 https:// 開頭，尚未確定請填 #"
    return {
        "category": category,
        "title": title,
        "description": str(data.get("description", "")).strip(),
        "url": url,
        "group": str(data.get("group", "")).strip(),
        "todo": str(data.get("todo", "")).strip()
    }, None

@app.route("/api/links", methods=["GET", "POST"])
def manage_quick_links():
    if request.method == "GET":
        data = load_quick_links()
        return jsonify({"status": "success", "categories": data["categories"], "data": data["links"]}), 200
    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    with links_lock:
        data = load_quick_links()
        item, error = parse_link_payload(request.get_json(silent=True) or {}, data["categories"])
        if error:
            return jsonify({"status": "error", "message": error}), 400
        item = {"id": max([l["id"] for l in data["links"]], default=0) + 1, **item}
        data["links"].append(item)
        save_quick_links(data)
    write_audit_log("links", item["id"], "新增", after=item)
    return jsonify({"status": "success", "message": "連結新增成功！", "data": item}), 201

@app.route("/api/links/<int:link_id>", methods=["PUT", "DELETE"])
@role_required("管理員", "教職員")
def update_or_delete_quick_link(link_id):
    with links_lock:
        data = load_quick_links()
        target = next((l for l in data["links"] if l["id"] == link_id), None)
        if not target:
            return jsonify({"status": "error", "message": "找不到該連結"}), 404
        if request.method == "DELETE":
            data["links"].remove(target)
            save_quick_links(data)
            write_audit_log("links", link_id, "刪除", before=target)
            return jsonify({"status": "success", "message": "連結已刪除！"}), 200
        item, error = parse_link_payload(request.get_json(silent=True) or {}, data["categories"])
        if error:
            return jsonify({"status": "error", "message": error}), 400
        before = dict(target)
        target.update(item)
        save_quick_links(data)
    write_audit_log("links", link_id, "修改", before=before, after=target)
    return jsonify({"status": "success", "message": "連結更新成功！", "data": target}), 200

# ==========================================
# 11h. 獎助學金資格比對 (/api/scholarships/match)
#      依登入學生的年級、科系、GPA、操行、身分別與前學期成績逐筆比對。
#      - 不符合：硬性條件 (年級、科系、身分別) 不符，本來就不是適用對象
#      - 部分符合：硬性條件都符合，只差成績類門檻 (GPA、操行、前學期無不及格)
#      家長可查看子女的比對結果，但個人條件只顯示符合／不符合，不顯示具體數值。
# ==========================================

SCHOLARSHIP_URGENT_DAYS = 7

def _num(value):
    """DECIMAL / 字串轉 float，None 保持 None"""
    return float(value) if value not in (None, "") else None

def _split_list(value):
    return [x.strip() for x in str(value or "").split(",") if x.strip()]

def _date_str(value):
    return value.strftime("%Y-%m-%d") if hasattr(value, "strftime") else value

def load_scholarships():
    rows = fetch_db_rows("SELECT * FROM scholarships ORDER BY deadline ASC")
    if rows is None:
        rows = DEMO_SCHOLARSHIPS
    return [{**r, "deadline": _date_str(r["deadline"]), "min_gpa": _num(r.get("min_gpa")),
             "min_conduct": _num(r.get("min_conduct"))} for r in rows]

def load_scholarship_profile(student_id, today):
    """比對用的學生資料：年級、科系、GPA、操行、身分別"""
    rows = fetch_db_rows("""
        SELECT student_id, full_name, dept_id, admission_year, grade_level, gpa, conduct_score, identity_type
        FROM students WHERE student_id = %s
    """, (student_id,))
    if rows:
        profile = dict(rows[0])
    else:
        student = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), None)
        if not student:
            return None
        profile = {k: student.get(k) for k in ("student_id", "full_name", "dept_id", "admission_year")}
        profile.update(DEMO_SCHOLARSHIP_PROFILES.get(student_id, {}))
    # 年級另外存放 (休學、延修會讓年級與入學年不一致)；沒填時才由入學學年度推算
    if profile.get("grade_level") is None and profile.get("admission_year"):
        profile["grade_level"] = current_academic_term(today)["academic_year"] - profile["admission_year"] + 1
    profile["gpa"] = _num(profile.get("gpa"))
    profile["conduct_score"] = _num(profile.get("conduct_score"))
    return profile

def latest_semester_fails(student_id):
    """回傳 (最近一學期, 該學期不及格科目數)；沒有成績紀錄回傳 (None, 0)"""
    rows = fetch_db_rows("SELECT semester, is_passed FROM student_credits WHERE student_id = %s", (student_id,))
    if rows is None:
        rows = [c for c in DEMO_STUDENT_CREDITS if c["student_id"] == student_id]
    if not rows:
        return None, 0
    latest = max(r["semester"] for r in rows)
    return latest, sum(1 for r in rows if r["semester"] == latest and not r["is_passed"])

def department_names():
    rows = fetch_db_rows("SELECT dept_id, dept_name FROM departments") or DEMO_DEPARTMENTS
    return {r["dept_id"]: r["dept_name"] for r in rows}

def _fmt(value):
    return int(value) if float(value).is_integer() else value

def evaluate_scholarship(sch, profile, fail_info, dept_names, today, redact_personal):
    """逐項比對條件；redact_personal=True (家長) 時個人條件不回傳具體數值"""
    checks = []

    def add(item, passed, reason, hard, personal):
        checks.append({
            "item": item,
            "passed": passed,
            "hard": hard,
            # 家長只看得到符合／不符合；個人條件的詳細原因 (含數值) 不回傳
            "reason": None if passed or (personal and redact_personal) else reason
        })

    grade = profile.get("grade_level")
    if sch.get("min_grade") or sch.get("max_grade"):
        lo, hi = sch.get("min_grade") or 1, sch.get("max_grade") or 5
        add("年級", grade is not None and lo <= grade <= hi, f"限 {lo}～{hi} 年級，你目前 {grade} 年級", True, False)

    allowed = _split_list(sch.get("departments"))
    if allowed:
        names = "、".join(dept_names.get(d, d) for d in allowed)
        add("科系", profile.get("dept_id") in allowed, f"限 {names} 學生申請", True, False)

    identities = _split_list(sch.get("identity_required"))
    if identities:
        mine = _split_list(profile.get("identity_type"))
        add("身分別", bool(set(identities) & set(mine)), f"限 {'、'.join(identities)} 身分申請", True, True)

    if sch.get("min_gpa") is not None:
        gpa = profile.get("gpa")
        add("GPA", gpa is not None and gpa >= sch["min_gpa"],
            f"GPA 需 {_fmt(sch['min_gpa'])}，你目前 {gpa if gpa is not None else '無資料'}", False, True)

    if sch.get("min_conduct") is not None:
        conduct = profile.get("conduct_score")
        add("操行成績", conduct is not None and conduct >= sch["min_conduct"],
            f"操行成績需 {_fmt(sch['min_conduct'])} 分，你目前 {_fmt(conduct) if conduct is not None else '無資料'} 分", False, True)

    if sch.get("no_fail_required"):
        semester, fails = fail_info
        add("前學期無不及格", fails == 0, f"需前學期無不及格科目，你在 {semester} 學期有 {fails} 科不及格", False, True)

    failed = [c for c in checks if not c["passed"]]
    if not failed:
        status = "符合"
    elif any(c["hard"] for c in failed):
        status = "不符合"
    else:
        status = "部分符合"

    days_left = (datetime.strptime(sch["deadline"], "%Y-%m-%d").date() - today).days
    return {
        "id": sch["id"],
        "name": sch["name"],
        "provider": sch.get("provider"),
        "amount": sch.get("amount"),
        "deadline": sch["deadline"],
        "days_left": days_left,
        "is_urgent": 0 <= days_left <= SCHOLARSHIP_URGENT_DAYS,
        "apply_url": sch.get("apply_url"),
        "announcement_url": sch.get("announcement_url"),
        "description": sch.get("description"),
        "status": status,
        "checks": [{k: c[k] for k in ("item", "passed", "reason")} for c in checks],
        # 不符合的條件；家長看不到個人條件的原因時以「XX：不符合」表示
        "missing": [c["reason"] or f"{c['item']}：不符合" for c in failed]
    }

@app.route("/api/scholarships/match", methods=["GET"])
def match_scholarships():
    """依登入學生 (家長為其子女) 的資料逐筆比對獎助學金資格；可用 ?date=YYYY-MM-DD 模擬日期"""
    if "username" not in session:
        return jsonify({"status": "error", "message": "請先登入"}), 401
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "error", "message": "獎助學金資格比對僅限學生本人與家長使用"}), 403
    try:
        today = datetime.strptime(request.args["date"], "%Y-%m-%d").date() if request.args.get("date") else datetime.now().date()
    except ValueError:
        return jsonify({"status": "error", "message": "date 格式須為 YYYY-MM-DD"}), 400

    profile = load_scholarship_profile(student_id, today)
    if not profile:
        return jsonify({"status": "error", "message": "查無學生資料"}), 404

    is_parent = session.get("role") == "家長"
    fail_info = latest_semester_fails(student_id)
    dept_names = department_names()
    results = [evaluate_scholarship(s, profile, fail_info, dept_names, today, is_parent) for s in load_scholarships()]
    results.sort(key=lambda r: r["deadline"])

    open_items = [r for r in results if r["days_left"] >= 0]
    eligible = [r for r in open_items if r["status"] == "符合"]
    partial = [r for r in open_items if r["status"] == "部分符合"]
    return jsonify({
        "status": "success",
        "today": today.isoformat(),
        "viewer_role": session.get("role"),
        "can_apply": not is_parent,   # 家長只能查看，不能操作申請
        "student": {"student_id": student_id, "full_name": profile.get("full_name")},
        "summary": {
            "eligible_count": len(eligible),
            "partial_count": len(partial),
            "nearest_deadline_days": eligible[0]["days_left"] if eligible else None,
            "nearest_deadline_name": eligible[0]["name"] if eligible else None
        },
        "eligible": eligible,
        "partial": partial,
        "ineligible": [r for r in open_items if r["status"] == "不符合"],
        # 已截止的不列入符合清單，另外放在已截止區
        "expired": [r for r in results if r["days_left"] < 0]
    }), 200

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
        "rules_count": len(load_rules()),
        "synonyms_count": len(load_synonyms()),
        "checklists_count": len(load_checklists()),
        "courses_count": len(DEMO_COURSES),
        "unmatched_count": len(load_unmatched_queries()),
        "feedback_count": len(DEMO_SEARCH_FEEDBACK),
        "mode": "mysql" if is_db_available() else "demo"
    }), 200

# ==========================================
# 14. 缺曠課紀錄與通知 API (學校尚未提供 API，先以模擬資料展示)
#     資料讀寫都透過 attendance.sources 的 AttendanceSource；
#     學校提供 API 後只需修改 get_attendance_source() 回傳的來源
# ==========================================

DEMO_ATTENDANCE_SOURCE = MemoryAttendanceSource(DEMO_ATTENDANCE_RECORDS)

def get_attendance_source():
    """資料來源切換點：MySQL 可用且已建表時讀 attendance_records，否則使用記憶體示範資料"""
    source = MySQLAttendanceSource(get_db_connection)
    return source if source.is_available() else DEMO_ATTENDANCE_SOURCE

def list_students():
    return fetch_db_rows("SELECT student_id, full_name FROM students ORDER BY student_id") or \
        [{"student_id": s["student_id"], "full_name": s["full_name"]} for s in DEMO_STUDENTS]

def course_weekly_hours():
    """{課程名稱: 每週授課時數}，以學分數計"""
    return {c["course_name"]: c["credits"] for c in load_course_map()}

@app.route("/api/student/attendance", methods=["GET"])
def get_my_attendance():
    """登入學生 (或家長) 的缺曠課摘要與扣考警告"""
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "error", "message": "請先登入學生帳號"}), 401
    records = get_attendance_source().list_records(student_id)
    summary = summarize_attendance(records, course_weekly_hours())
    return jsonify({
        "status": "success",
        "student_id": student_id,
        **summary,
        "recent_records": [{k: r[k] for k in ("date", "course_name", "type")} for r in records[:5]]
    }), 200

@app.route("/api/admin/attendance", methods=["GET", "POST"])
@role_required("管理員", "教職員")
def manage_attendance_records():
    source = get_attendance_source()
    if request.method == "GET":
        records = source.list_records()
        return jsonify({
            "status": "success",
            "source": source.name,
            "notify_mode": get_mailer().mode,
            "pending_count": sum(1 for r in records if not r["notified"]),
            "data": records,
            "students": list_students(),
            "course_names": sorted(course_weekly_hours().keys()),
            "types": list(ATTENDANCE_TYPES)
        }), 200

    # POST：模擬新增一筆缺曠紀錄 (展示用)
    data = request.get_json(silent=True) or {}
    student_id = str(data.get("student_id", "")).strip()
    course_name = str(data.get("course_name", "")).strip()
    record_type = str(data.get("type", "")).strip()
    record_date = str(data.get("date", "")).strip() or datetime.now().strftime("%Y-%m-%d")
    if not student_id or not course_name:
        return jsonify({"status": "error", "message": "學號與課程名稱為必填"}), 400
    if student_id not in {s["student_id"] for s in list_students()}:
        return jsonify({"status": "error", "message": "查無此學號"}), 400
    if record_type not in ATTENDANCE_TYPES:
        return jsonify({"status": "error", "message": f"類別須為 {'/'.join(ATTENDANCE_TYPES)}"}), 400
    try:
        datetime.strptime(record_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"status": "error", "message": "日期格式須為 YYYY-MM-DD"}), 400
    try:
        record = source.add_record(student_id, record_date, course_name, record_type)
    except Exception as e:
        return jsonify({"status": "error", "message": f"新增失敗：{e}"}), 500
    return jsonify({"status": "success", "message": "已新增模擬缺曠紀錄 (尚未通知)", "data": record}), 201

@app.route("/api/admin/attendance/notify", methods=["POST"])
@role_required("管理員", "教職員")
def notify_attendance_now():
    """立即寄出所有未通知紀錄的通知信 (未設定 SMTP 時印在終端機)"""
    result = send_pending_notifications(get_attendance_source())
    if result["students_notified"] == 0 and not result["failed"]:
        message = "目前沒有需要通知的新紀錄"
    else:
        where = "已寄出" if result["mode"] == "smtp" else "demo 模式：已印在伺服器終端機"
        message = f"{where}，共通知 {result['students_notified']} 位學生（{result['records_notified']} 筆紀錄）"
        if result["failed"]:
            message += f"；{len(result['failed'])} 位寄送失敗，下次會重試"
    return jsonify({"status": "success", "message": message, **result}), 200

# ==========================================
# 15. 個人化儀表板 API：今日課表、未讀公告、待繳作業、請假狀態、缺曠摘要
#     資料讀寫都透過 dashboard.sources 的 DashboardSource；
#     學校提供教務/數位學習/請假系統 API 後只需修改 get_dashboard_source()
# ==========================================

DEMO_DASHBOARD_SOURCE = MemoryDashboardSource(
    dashboard_demo.DEMO_CLASS_SCHEDULE,
    dashboard_demo.DEMO_ANNOUNCEMENTS,
    dashboard_demo.DEMO_ANNOUNCEMENT_READS,
    dashboard_demo.DEMO_ASSIGNMENTS,
    dashboard_demo.DEMO_ASSIGNMENT_SUBMISSIONS,
    dashboard_demo.DEMO_LEAVE_REQUESTS
)

def get_dashboard_source():
    """資料來源切換點：MySQL 可用且已建表時讀資料庫，否則使用記憶體示範資料"""
    source = MySQLDashboardSource(get_db_connection)
    return source if source.is_available() else DEMO_DASHBOARD_SOURCE

def student_class_name(student_id):
    rows = fetch_db_rows("SELECT class_name FROM students WHERE student_id = %s", (student_id,))
    if rows:
        return rows[0]["class_name"]
    stu = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), None)
    return stu["class_name"] if stu else session.get("class_name", "")

def parse_dashboard_now():
    """預設為現在時間；可用 ?date=YYYY-MM-DD&time=HH:MM 指定時間 (展示不同時段用)，格式錯誤回傳 None"""
    now = datetime.now()
    date_arg = request.args.get("date", "").strip() or now.strftime("%Y-%m-%d")
    time_arg = request.args.get("time", "").strip() or now.strftime("%H:%M")
    try:
        return datetime.strptime(f"{date_arg} {time_arg}", "%Y-%m-%d %H:%M")
    except ValueError:
        return None

@app.route("/api/student/dashboard", methods=["GET"])
def get_student_dashboard():
    """登入學生 (或家長) 的今日儀表板"""
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "error", "message": "請先登入學生帳號"}), 401
    now = parse_dashboard_now()
    if not now:
        return jsonify({"status": "error", "message": "日期時間格式須為 date=YYYY-MM-DD、time=HH:MM"}), 400

    source = get_dashboard_source()
    class_name = student_class_name(student_id)
    data = build_dashboard(source, class_name, student_id, now)

    attendance = summarize_attendance(get_attendance_source().list_records(student_id), course_weekly_hours())
    data["attendance"] = {
        "totals": attendance["totals"],
        "warning_count": sum(1 for c in attendance["courses"] if c["level"] == "warning"),
        "banned_count": sum(1 for c in attendance["courses"] if c["level"] == "banned")
    }
    return jsonify({
        "status": "success",
        "source": source.name,
        "student_id": student_id,
        "class_name": class_name,
        # 家長可檢視但不可代為標記已讀
        "can_mark_read": session.get("role") == "學生",
        **data
    }), 200

@app.route("/api/student/announcements/<int:announcement_id>/read", methods=["POST"])
@role_required("學生")
def mark_announcement_read(announcement_id):
    try:
        found = get_dashboard_source().mark_announcement_read(session.get("student_id"), announcement_id)
    except Exception as e:
        return jsonify({"status": "error", "message": f"更新失敗：{e}"}), 500
    if not found:
        return jsonify({"status": "error", "message": "找不到該公告"}), 404
    return jsonify({"status": "success"}), 200

# ==========================================
# 13. 校園生活新功能 (campus 套件)：行事曆月曆、選課檢查、證照審核、科上通知、論壇、租借、天氣、桌寵…
# ==========================================

import campus
from types import SimpleNamespace

campus.init_app(app, SimpleNamespace(
    fetch_db_rows=fetch_db_rows,
    fetch_calendar_events=fetch_calendar_events,
    load_course_map=load_course_map,
    load_student_credits=load_student_credits,
    summarize_credits=summarize_credits,
    get_dashboard_source=get_dashboard_source,
    save_uploaded_file=save_uploaded_file,
    graduation_threshold=GRADUATION_CREDIT_THRESHOLD,
    students=DEMO_STUDENTS,
    checklists=DEMO_CHECKLISTS,
    deadlines=DEMO_DEADLINES,
    knowledge_base=DEMO_KNOWLEDGE_BASE,
    synonyms=DEMO_SYNONYMS,
    categories=DEMO_CATEGORIES,
    certificates=DEMO_CERTIFICATES,
    class_schedule=dashboard_demo.DEMO_CLASS_SCHEDULE,
))

# ==========================================
# 14. 伺服器主入口
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