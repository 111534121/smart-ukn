import os
try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None
if load_dotenv:
    load_dotenv()  # 有安裝 python-dotenv 時讀取專案根目錄的 .env

from flask import Flask, request, jsonify, session, redirect, send_from_directory, make_response, Response
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from werkzeug.security import check_password_hash
# pyrefly: ignore [missing-import]
from werkzeug.utils import secure_filename
from functools import wraps
# pyrefly: ignore [missing-import]
import mysql.connector
import re
import sys
import json
import uuid
import csv
import threading
import time
from collections import deque
from io import StringIO
from datetime import datetime, timedelta
from attendance.sources import MemoryAttendanceSource, MySQLAttendanceSource, VALID_TYPES as ATTENDANCE_TYPES
from attendance.policy import summarize_attendance
from attendance.notify import send_pending_notifications, get_mailer, campus_email
from dashboard.sources import MemoryDashboardSource, MySQLDashboardSource
from dashboard.summary import build_dashboard
from dashboard import demo_data as dashboard_demo
from scholarship_demo import DEMO_SCHOLARSHIPS, DEMO_SCHOLARSHIP_PROFILES
import preferences
from school_calendar import sync as school_calendar_sync
from school_calendar.actions import match_actions as match_calendar_actions
from moodle_sync.client import MoodleClient, MoodleError, get_token as get_moodle_token
from moodle_sync.assignments import MoodleMergedSource, get_cached_assignments, clear_cache as clear_moodle_cache
from moodle_sync.store import MoodleLinkStore
from curriculum.audit import load_curriculum, audit as audit_curriculum

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
def load_secret_key():
    """SECRET_KEY 環境變數優先；未設定時第一次啟動產生隨機金鑰存到 data/.secret_key (已 gitignore)，重啟後登入狀態不會失效"""
    if os.getenv("SECRET_KEY"):
        return os.getenv("SECRET_KEY")
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", ".secret_key")
    try:
        with open(path, encoding="utf-8") as f:
            key = f.read().strip()
        if key:
            return key
    except FileNotFoundError:
        pass
    os.makedirs(os.path.dirname(path), exist_ok=True)
    key = uuid.uuid4().hex + uuid.uuid4().hex
    with open(path, "w", encoding="utf-8") as f:
        f.write(key)
    return key

app.secret_key = load_secret_key()
# 登入時勾選「記住我」：30 天內不用再登入 (session.permanent)
app.permanent_session_lifetime = timedelta(days=30)
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = os.getenv("SESSION_COOKIE_SECURE") == "1"
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_REFRESH_EACH_REQUEST"] = True
# 上傳檔案總大小上限 (20MB)：避免單一請求夾帶過大檔案耗盡記憶體/硬碟 (例如手機掃描 PDF 動輒幾十MB)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024

# 前端與 API 同一個網域時不需要 CORS；另有前端網域時以 CORS_ORIGINS (逗號分隔) 指定，
# 不可開放所有網域攜帶 session cookie，否則任何網站都能以登入者身分呼叫 API
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if CORS_ORIGINS:
    CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

@app.errorhandler(413)
def api_file_too_large(e):
    """上傳檔案總大小超過 MAX_CONTENT_LENGTH 時，API 要回清楚的 JSON 訊息而不是連線直接斷掉"""
    if request.path.startswith("/api/"):
        return jsonify({"status": "error", "message": "上傳檔案太大，請確認檔案大小後再試一次"}), 413
    return e

@app.errorhandler(500)
def api_internal_error(e):
    """API 未預期的錯誤也回 JSON，前端才顯示得出原因，不會只剩「連線失敗 (500)」"""
    if request.path.startswith("/api/"):
        app.logger.error("API 錯誤 %s %s：%s", request.method, request.path, getattr(e, "original_exception", e))
        return jsonify({"status": "error", "message": "伺服器處理時發生錯誤，請稍後再試；若持續發生請通知管理員"}), 500
    return e

# 檔案上傳設定 (支援 PDF 檔與證照、比賽照片)
UPLOAD_FOLDER = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "uploads"))
FORMS_FOLDER = os.getenv("FORMS_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "forms"))
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

# 申辦表單下載 /forms/<code> (可列印、下載 Word、填寫範例)：見 applications 套件

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

def format_updated_at(value):
    """統一把規章的「最後更新日期」轉成 YYYY-MM-DD 字串；MySQL 回傳 datetime/date 物件，示範資料則已是字串"""
    if value is None:
        return None
    if hasattr(value, "strftime"):
        return value.strftime("%Y-%m-%d")
    return str(value)[:10]

# ==========================================
# 權限控管裝飾器
# ==========================================

def login_required(f):
    """限制僅已登入之使用者存取"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "username" not in session:
            return jsonify({"status": "error", "message": "請先登入系統"}), 401
        if session.get("is_active") == 0:
            return jsonify({"status": "error", "message": "此帳號已停用，請洽系統管理員"}), 403
        return f(*args, **kwargs)
    return wrapper

def role_required(*allowed_roles):
    """限制僅特定身分角色可存取"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if "username" not in session:
                return jsonify({"status": "error", "message": "請先登入系統"}), 401
            if session.get("is_active") == 0:
                return jsonify({"status": "error", "message": "此帳號已停用，請洽系統管理員"}), 403
            if session.get("role") not in allowed_roles:
                return jsonify({"status": "error", "message": "權限不足，僅限特定身分存取"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

def write_roles_required(*allowed_roles):
    """GET 公開讀取；POST/PUT/DELETE 等寫入操作限特定身分"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.method not in ("GET", "HEAD", "OPTIONS"):
                if "username" not in session:
                    return jsonify({"status": "error", "message": "請先登入系統"}), 401
                if session.get("is_active") == 0:
                    return jsonify({"status": "error", "message": "此帳號已停用，請洽系統管理員"}), 403
                if session.get("role") not in allowed_roles:
                    return jsonify({"status": "error", "message": "權限不足"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ==========================================
# 修改紀錄 (audit_logs)：後台每次新增/修改/刪除都留下誰、何時、改了什麼 (R5)
# ==========================================

DEMO_AUDIT_LOGS = []  # 示範模式下的修改紀錄 (MySQL 連不上時使用)
_audit_log_seq = 0

def client_ip():
    """發出這次請求的電腦 IP (修改紀錄用)；不在請求中時回傳 None"""
    try:
        return request.remote_addr
    except RuntimeError:
        return None

def write_audit_log(table_name, record_id, action, before=None, after=None):
    """修改紀錄：哪張表、哪一筆、誰 (身分、IP)、什麼時候、改之前 / 改之後的內容 (JSON)"""
    global _audit_log_seq
    changed_by = session.get("full_name") or session.get("username") or "未登入"
    role = session.get("role") or "訪客"
    ip = client_ip()

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            values = (
                table_name, str(record_id), action, changed_by, role,
                json.dumps(before, ensure_ascii=False, default=str) if before is not None else None,
                json.dumps(after, ensure_ascii=False, default=str) if after is not None else None
            )
            try:
                cursor.execute(
                    "INSERT INTO audit_logs (table_name, record_id, action, changed_by, changed_by_role, before_json, after_json, ip_address) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", values + (ip,))
            except Exception:
                # 舊資料庫還沒有 ip_address 欄位 (尚未重跑 init_db.py)：先照舊寫入，不讓紀錄遺失
                cursor.execute(
                    "INSERT INTO audit_logs (table_name, record_id, action, changed_by, changed_by_role, before_json, after_json) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)", values)
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
        "ip_address": ip,
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
    {"dept_id": "BA", "dept_name": "企業管理學系（科、所）", "college_name": "商業資訊學院"},
    {"dept_id": "CS", "dept_name": "資訊管理科（五專）", "college_name": "商業資訊學院"},
    {"dept_id": "ANI", "dept_name": "數位影視動畫科（五專）", "college_name": "商業資訊學院"},
    {"dept_id": "ENG", "dept_name": "應用外語科（五專）", "college_name": "商業資訊學院"}
]

# 科系簡介 (供訪客/新生參考用的一般性介紹，非學校正式招生文宣)；
# 以 dept_id 對應，不存資料庫 — 跟科系主檔分開維護，資料庫連線與否都看得到同一份內容。
# 詳細課程地圖、學分數與最新公告仍以官網招生專區與系所公告為準。
DEPARTMENT_INTRO = {
    "LTC": {
        "intro": "培養具備長期照護專業知能的人才，學習老人與失能者的照護、管理與資源整合。",
        "highlights": ["長期照護概論", "老人服務與照護", "照護機構經營管理", "輔具與居家環境改善"],
        "careers": ["長照機構照護服務員／社工", "居家照顧服務", "照護機構行政管理", "考取照顧服務員等相關證照"],
    },
    "ECE": {
        "intro": "培養嬰幼兒教育與保育專業人才，兼顧教保理論與實務，重視遊戲、課程設計與親職教育。",
        "highlights": ["幼兒發展", "教保課程設計", "嬰幼兒健康與安全", "親職教育與溝通"],
        "careers": ["幼兒園教保員", "托嬰中心保育人員", "早期療育相關服務", "考取幼兒園教師證、保母證照"],
    },
    "NUR": {
        "intro": "培養具備臨床照護能力的護理人才，課程涵蓋基礎醫學、臨床護理與臨床實習。",
        "highlights": ["基本護理學", "內外科護理學", "臨床實習（醫院合作）", "健康評估與衛教"],
        "careers": ["醫院／診所護理師（需通過護理師國考）", "長照機構護理人員", "企業健康管理", "繼續升學攻讀學士學位"],
    },
    "OPT": {
        "intro": "培養驗光與視力保健專業人才，學習眼睛生理構造、驗光技術與隱形眼鏡配戴等實務。",
        "highlights": ["視光學", "驗光學與實習", "隱形眼鏡學", "雙眼視覺與視機能檢查"],
        "careers": ["眼鏡公司驗光人員（需考取驗光人員證照）", "眼科診所視光技術人員", "隱形眼鏡相關產業"],
    },
    "BA": {
        "intro": "培養企業經營管理基礎能力，涵蓋行銷、人資、財務等核心商管知識與實作專題。",
        "highlights": ["管理學", "行銷管理", "人力資源管理", "創業與專題實作"],
        "careers": ["企業行政／人資／行銷企劃", "門市與連鎖業管理", "自行創業", "繼續升學攻讀商管相關學位"],
    },
    "CS": {
        "intro": "結合程式設計與商業管理知識，培養能開發系統、分析資料並理解企業需求的資訊人才。",
        "highlights": ["程式設計（Python/C）", "資料庫系統", "網頁前後端開發", "畢業專題實作"],
        "careers": ["軟體工程師／網頁工程師", "資訊系統維運、技術支援", "資料分析相關職務", "考取 TQC、程式設計等相關證照"],
    },
    "ANI": {
        "intro": "培養動畫、影視後製與數位內容創作人才，課程涵蓋繪圖基礎、2D/3D動畫與剪輯製作。",
        "highlights": ["動畫原理與分鏡", "3D動畫製作", "影視剪輯與特效", "作品集實作"],
        "careers": ["動畫師／繪圖師", "影視後製與剪輯", "遊戲美術相關職務", "自由接案創作者"],
    },
    "ENG": {
        "intro": "強化英語聽說讀寫與跨文化溝通能力，並結合觀光、商務應用情境訓練。",
        "highlights": ["會話與簡報訓練", "商務英文", "觀光與導覽英語", "國際檢定輔導（多益等）"],
        "careers": ["國際業務／商務助理", "觀光旅遊相關產業", "外語補教", "繼續升學攻讀外語相關學位"],
    },
}

DEMO_STUDENTS = [
    {"student_id": "S112001", "full_name": "王小明", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管五忠", "parent_phone": "0912-345-678"},
    {"student_id": "S112002", "full_name": "李美華", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管五忠", "parent_phone": "0922-333-444"},
    {"student_id": "S112003", "full_name": "張建華", "dept_id": "NUR", "dept_name": "護理科（五專）", "admission_year": 112, "class_name": "護理四忠", "parent_phone": "0933-555-666"},
    {"student_id": "S112004", "full_name": "陳冠宇", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管四孝", "parent_phone": "0955-222-111"},
    {"student_id": "S112005", "full_name": "林雨潔", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "admission_year": 112, "class_name": "資管五忠", "parent_phone": "0966-777-888"}
]

_DEMO_PW_123456 = "pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c"
_DEMO_PW_ADMIN123 = "pbkdf2:sha256:1000000$2XQfvmmn75wVJUKc$59cac19325e7e89df728fdc0ee86208fc0ae12ab71fc630fbaa890f2f919d14c"

DEMO_USERS = [
    {"user_id": 20, "username": "dorm_demo", "password_hash": _DEMO_PW_123456, "role": "教職員", "student_id": None, "full_name": "宿舍管理示範員", "can_manage_dorm": True},
    {"user_id": 1, "username": "student1", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112001", "full_name": "王小明"},
    {"user_id": 2, "username": "student2", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112002", "full_name": "李美華"},
    {"user_id": 3, "username": "parent1", "password_hash": _DEMO_PW_123456, "role": "家長", "student_id": "S112001", "full_name": "王大明 (小明家長)"},
    # S112002 尚未開啟家長預警授權 (DEMO_PRIVACY_SETTINGS)，用來示範「家長未授權時系統不會寄信」
    {"user_id": 9, "username": "parent2", "password_hash": _DEMO_PW_123456, "role": "家長", "student_id": "S112002", "full_name": "李建國 (美華家長)"},
    {"user_id": 4, "username": "staff1", "password_hash": _DEMO_PW_123456, "role": "教職員", "student_id": None, "full_name": "周立威 (教務處職員)"},
    {"user_id": 6, "username": "teacher1", "password_hash": _DEMO_PW_123456, "role": "老師", "student_id": None, "full_name": "彭賓鈺 老師", "dept_id": "CS", "dept_name": "資訊管理科（五專）", "advised_class": "資管五忠"},
    {"user_id": 5, "username": "admin", "password_hash": _DEMO_PW_ADMIN123, "role": "管理員", "student_id": None, "full_name": "系統超級管理員"},
    # 示範學號登入帳號 (密碼 123456，與 seed_data.py 一致)
    {"user_id": 7, "username": "S112004", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112004", "full_name": "陳冠宇"},
    {"user_id": 8, "username": "S112005", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112005", "full_name": "林雨潔"}
]

# 虛構的處室操作帳號；正式資料庫需執行 seed_admin_offices_demo.py 才會建立。
from campus.office_catalog import demo_accounts as office_demo_accounts
DEMO_USERS.extend({"user_id": 9100 + i, "username": u['username'], "password_hash": _DEMO_PW_123456,
                   "role": u['role'], "student_id": None, "full_name": u['full_name'],
                   "can_manage_dorm": u['role'] == '住宿管理員'}
                  for i, u in enumerate(office_demo_accounts())
                  if not any(existing['username'] == u['username'] for existing in DEMO_USERS))

DEMO_CATEGORIES = [
    {"category_id": 1, "category_name": "教務學則與選課", "icon": "📖", "sort_order": 1, "subcategories": ["停修/棄修手續", "先修與擋修規定", "畢業學分資格"]},
    {"category_id": 2, "category_name": "學務生輔與請假", "icon": "📝", "sort_order": 2, "subcategories": ["學生請假辦法", "缺課扣考", "學業預警"]},
    {"category_id": 3, "category_name": "證照抵免與獎助", "icon": "🏆", "sort_order": 3, "subcategories": ["語言證照抵免", "專業證照獎勵金"]},
    {"category_id": 4, "category_name": "總務校園與設施", "icon": "🏢", "sort_order": 4, "subcategories": ["學生證補發", "停車證申請"]}
]

# 規章知識庫與口語同義詞：整理自官網正式法規 PDF，見 campus/official_rules.py
from campus.official_rules import OFFICIAL_RULES, OFFICIAL_SYNONYMS

DEMO_KNOWLEDGE_BASE = [dict(r) for r in OFFICIAL_RULES]
for _category in DEMO_CATEGORIES:
    _category["subcategories"] = list(dict.fromkeys(
        r["subcategory"] for r in DEMO_KNOWLEDGE_BASE if r["category_id"] == _category["category_id"]))

DEMO_SYNONYMS = [{"synonym_id": i, "category_id": cat, "user_keyword": word, "official_term": term}
                 for i, (cat, word, term) in enumerate(OFFICIAL_SYNONYMS, start=1)]

# 課名、學分、建議修課學期依資管科「112 學年度入學五專修業科目表」(https://im.ukn.edu.tw/p/405-1028-609,c82.php)；
# 全學年課程 (例如程式設計 6 學分) 拆成上下學期各一門。科目表沒有先修規定，prerequisite_id 為擋修功能的示範設定。
# course_id 為本系統內部代碼 (校務系統的正式科目代碼見資料庫 course_map 中 7 碼的課程)
DEMO_COURSES = [
    {"course_id": "CS101", "course_name": "程式設計(一)", "credits": 3, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "一年級上", "description": "程式設計基礎：變數、流程控制、迴圈、陣列與函式。"},
    {"course_id": "CS102", "course_name": "程式設計(二)", "credits": 3, "prerequisite_id": "CS101", "prerequisite_name": "程式設計(一)", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "一年級下", "description": "接續程式設計(一)，練習較完整的程式題目與除錯。"},
    {"course_id": "CS201", "course_name": "資料結構", "credits": 3, "prerequisite_id": "CS102", "prerequisite_name": "程式設計(二)", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "三年級上", "description": "陣列、鏈結串列、堆疊、佇列、樹與排序搜尋。"},
    {"course_id": "CS202", "course_name": "JAVA程式語言(一)", "credits": 3, "prerequisite_id": "CS102", "prerequisite_name": "程式設計(二)", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "三年級上", "description": "Java 語法、類別與物件導向基礎。"},
    {"course_id": "CS301", "course_name": "系統分析與設計", "credits": 3, "prerequisite_id": "CS201", "prerequisite_name": "資料結構", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "三年級下", "description": "需求分析、系統規格與 UML 設計。"},
    {"course_id": "CS302", "course_name": "資料庫管理實務(SQL)", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "三年級下", "description": "關聯式資料庫與 SQL 查詢實作。"},
    {"course_id": "CS303", "course_name": "動態網頁程式設計", "credits": 3, "prerequisite_id": "CS102", "prerequisite_name": "程式設計(二)", "is_required": 0, "course_type": "專業選修", "dept_id": "CS", "semester_suggest": "三年級上", "description": "資訊軟體開發模組選修：伺服器端網頁程式與資料庫串接。"},
    {"course_id": "CS304", "course_name": "雲端應用", "credits": 3, "prerequisite_id": None, "prerequisite_name": None, "is_required": 0, "course_type": "專業選修", "dept_id": "CS", "semester_suggest": "五年級下", "description": "資訊軟體開發模組選修：雲端服務與部署應用。"},
    {"course_id": "CS401", "course_name": "實務專題(一)", "credits": 1, "prerequisite_id": "CS301", "prerequisite_name": "系統分析與設計", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "五年級上", "description": "院定必修：分組完成資訊系統專題。"},
    {"course_id": "CS402", "course_name": "實務專題(二)", "credits": 1, "prerequisite_id": "CS401", "prerequisite_name": "實務專題(一)", "is_required": 1, "course_type": "專業必修", "dept_id": "CS", "semester_suggest": "五年級下", "description": "院定必修：專題成果報告與發表。"},
    {"course_id": "EN101", "course_name": "英文(一)", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "共同必修", "dept_id": "CS", "semester_suggest": "一年級上", "description": "一般科目必修：英文聽說讀寫。"},
    {"course_id": "EN102", "course_name": "英文(二)", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "共同必修", "dept_id": "CS", "semester_suggest": "一年級下", "description": "一般科目必修：英文聽說讀寫。"},
    {"course_id": "GE101", "course_name": "康寧全人教育", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "共同必修", "dept_id": "CS", "semester_suggest": "一年級上", "description": "校定必修。"},
    {"course_id": "GE102", "course_name": "進階分類通識課程國文藝術類", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "通識教育", "dept_id": "CS", "semester_suggest": "四年級上", "description": "進階分類通識必修，實際科目依每學期開課。"},
    {"course_id": "GE103", "course_name": "進階分類通識課程自然健康類", "credits": 2, "prerequisite_id": None, "prerequisite_name": None, "is_required": 1, "course_type": "通識教育", "dept_id": "CS", "semester_suggest": "四年級上", "description": "進階分類通識必修，實際科目依每學期開課。"}
]

# 成績的學期與上方建議修課學期一致 (112 學年度入學：一年級 = 112、三年級 = 114)
DEMO_STUDENT_CREDITS = [
    {"credit_id": 1, "student_id": "S112001", "course_id": "CS101", "semester": "112-1", "score": 85.00, "is_passed": 1},
    {"credit_id": 2, "student_id": "S112001", "course_id": "CS102", "semester": "112-2", "score": 55.00, "is_passed": 0},
    {"credit_id": 3, "student_id": "S112001", "course_id": "EN101", "semester": "112-1", "score": 78.00, "is_passed": 1},
    {"credit_id": 4, "student_id": "S112001", "course_id": "GE101", "semester": "112-1", "score": 82.00, "is_passed": 1},
    {"credit_id": 5, "student_id": "S112002", "course_id": "CS101", "semester": "112-1", "score": 92.50, "is_passed": 1},
    {"credit_id": 6, "student_id": "S112002", "course_id": "CS102", "semester": "112-2", "score": 88.00, "is_passed": 1},
    {"credit_id": 7, "student_id": "S112002", "course_id": "CS201", "semester": "114-1", "score": 85.00, "is_passed": 1},
    {"credit_id": 8, "student_id": "S112002", "course_id": "EN101", "semester": "112-1", "score": 80.00, "is_passed": 1},
    {"credit_id": 9, "student_id": "S112002", "course_id": "GE101", "semester": "112-1", "score": 90.00, "is_passed": 1},
    {"credit_id": 10, "student_id": "S112004", "course_id": "CS101", "semester": "112-1", "score": 88.00, "is_passed": 1},
    {"credit_id": 11, "student_id": "S112004", "course_id": "CS102", "semester": "112-2", "score": 91.00, "is_passed": 1},
    {"credit_id": 12, "student_id": "S112004", "course_id": "CS201", "semester": "114-1", "score": 84.00, "is_passed": 1},
    {"credit_id": 13, "student_id": "S112004", "course_id": "EN101", "semester": "112-1", "score": 80.00, "is_passed": 1},
    {"credit_id": 14, "student_id": "S112004", "course_id": "CS202", "semester": "114-1", "score": 79.00, "is_passed": 1},
    {"credit_id": 15, "student_id": "S112004", "course_id": "GE101", "semester": "112-1", "score": 86.00, "is_passed": 1},
    {"credit_id": 16, "student_id": "S112005", "course_id": "CS101", "semester": "112-1", "score": 76.00, "is_passed": 1},
    {"credit_id": 17, "student_id": "S112005", "course_id": "CS102", "semester": "112-2", "score": 68.00, "is_passed": 1},
    {"credit_id": 18, "student_id": "S112005", "course_id": "CS201", "semester": "114-1", "score": 48.00, "is_passed": 0},
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
            "於第12週五前送交教務處課程與教學組核備"
        ],
        "required_docs": "停修申請單紙本、歷年成績單正本",
        "office_hours": "週一至週五 08:30 - 17:00",
        "office_location": "行政大樓 2 樓 教務處 (課程與教學組)",
        "contact_phone": "02-2632-1181 分機 323, 325",
        "form_download_url": "/forms/course_withdraw_form",
        "system_url": "http://talk.ukn.edu.tw/class_redi/class.php",
        "deadline_week_info": "第 10-12 週 (115-1：11/16-12/4，五專前三年除外)",
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
        "contact_phone": "02-2632-1181 分機 464, 412",
        "form_download_url": "/forms/leave_application_form",
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
            "教務處課程與教學組複審學分折抵",
            "次學期初於歷年成績單確認抵免註記"
        ],
        "required_docs": "外語檢定成績單正本、影本、抵免申請書",
        "office_hours": "週一至週五 09:00 - 16:30",
        "office_location": "通識教育中心",
        "contact_phone": "02-2632-1181 分機 592, 598",
        "form_download_url": "/forms/english_waiver_form",
        "system_url": "http://203.71.63.13/academic/",
        "deadline_week_info": "開學日截止 (115-1：9/14，已截止)",
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
        "office_location": "行政大樓 2 樓 教務處 (註冊組)",
        "contact_phone": "02-2632-1181 分機 324, 312, 313",
        "form_download_url": "/forms/graduation_audit_form",
        "system_url": "http://203.71.63.13/academic/",
        "deadline_week_info": "大四第 8-16 週 (進行中)",
        "related_kb_id": 18,
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
            "送科辦初審後，由研究發展處審核並撥款"
        ],
        "required_docs": "證照證書影本、郵局存摺封面影本、印領清冊",
        "office_hours": "週一至週五 09:00 - 17:00",
        "office_location": "研究發展處 (先送所屬科辦)",
        "contact_phone": "02-2632-1181 分機 107, 113",
        "form_download_url": "/forms/certificate_reward_form",
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

DEMO_NOTIFICATION_LOG = []  # 示範模式下的獎學金/預警通知寄送紀錄 (MySQL 連不上時使用)

# 依資管科 112 學年度入學五專修業科目表：必修 181 (專業必修 117 + 院定必修 4 + 一般科目 46 + 進階通識 10 + 校定必修 4)、選修 39
DEMO_GRADUATION_REQUIREMENTS = {
    "CS": {
        "dept_id": "CS",
        "total_credits_req": 220,
        "major_required_req": 121,
        "major_elective_req": 39,
        "general_req": 60,
        "english_threshold_name": "多益測驗 550 分以上 或 通過進階實用英語檢定",
        "ethics_req": 2,
        "project_req": 2
    }
}

# 申辦期限：日期依教務處公告之「康寧大學 115 學年度行事曆」(https://daa.ukn.edu.tw/p/412-1021-846.php)
# semester_week 以 115-1 開學日 9/14 為第 1 週推算
_CLASS_SYSTEM_URL = "http://talk.ukn.edu.tw/class_redi/class.php"
_ACADEMIC_SYSTEM_URL = "http://203.71.63.13/academic/"
DEMO_DEADLINES = [
    {"deadline_id": 1, "title": "115-1 受理棄選（停修）", "category": "教務處課程與教學組", "semester_week": 10,
     "start_date": "2026-11-16", "end_date": "2026-12-04", "applies_to_role": "學生", "applies_to_dept": None,
     "related_system_url": _CLASS_SYSTEM_URL, "status_badge": "依 115 學年度行事曆",
     "description": "五專前三年除外。每學期以 2 科為限，須完成任課教師、導師與科主任簽章。"},
    {"deadline_id": 2, "title": "115-1 期中考試", "category": "教務處", "semester_week": 8,
     "start_date": "2026-11-07", "end_date": "2026-11-13", "applies_to_role": "學生", "applies_to_dept": None,
     "related_system_url": _ACADEMIC_SYSTEM_URL, "status_badge": "依 115 學年度行事曆",
     "description": "期中考成績於 11/9-11/23 上網登錄。"},
    {"deadline_id": 3, "title": "申請下學期轉系(科)、輔系及雙主修", "category": "教務處註冊組", "semester_week": 9,
     "start_date": "2026-11-09", "end_date": "2027-01-08", "applies_to_role": "學生", "applies_to_dept": None,
     "related_system_url": _ACADEMIC_SYSTEM_URL, "status_badge": "依 115 學年度行事曆",
     "description": "1/08 同時為本學期申請休學、退學截止日。"},
    {"deadline_id": 4, "title": "網路教學評量填寫", "category": "教務處", "semester_week": 14,
     "start_date": "2026-12-14", "end_date": "2026-12-20", "applies_to_role": "學生", "applies_to_dept": None,
     "related_system_url": _ACADEMIC_SYSTEM_URL, "status_badge": "依 115 學年度行事曆",
     "description": "請於期限內完成本學期每一門課的教學評量。"},
    {"deadline_id": 5, "title": "115-2 課程網路初選", "category": "教務處課程與教學組", "semester_week": 15,
     "start_date": "2026-12-21", "end_date": "2026-12-27", "applies_to_role": "學生", "applies_to_dept": None,
     "related_system_url": _CLASS_SYSTEM_URL, "status_badge": "依 115 學年度行事曆",
     "description": "下學期課程網路初選；加退選及重補修選課為 115-2 開學週 2/22-2/28。"},
    {"deadline_id": 6, "title": "學分抵免申請", "category": "教務處註冊組", "semester_week": 1,
     "start_date": "2026-09-14", "end_date": "2026-09-14", "applies_to_role": "學生", "applies_to_dept": None,
     "related_system_url": _ACADEMIC_SYSTEM_URL, "status_badge": "依 115 學年度行事曆",
     "description": "開學日 9/14 截止；115-2 為 2/22 截止。"},
    {"deadline_id": 7, "title": "弱勢助學金、學產基金、台北市清寒午餐補助申請", "category": "學生事務處", "semester_week": 1,
     "start_date": "2026-09-16", "end_date": "2026-10-01", "applies_to_role": "學生", "applies_to_dept": None,
     "related_system_url": "", "status_badge": "依 115 學年度行事曆",
     "description": "115 學年度申請期間。"},
]

# 學期校曆事項 (對應 academic_calendar 資料表，內容與 init_db.py 範例一致)
# 依「康寧大學 115 學年度行事曆」(教育部 115 年 3 月 19 日臺教高(一)字第 1150029623 號核定)
DEMO_ACADEMIC_CALENDAR = [
    {"id": 1, "event_name": "網路加退選及重補修", "start_date": "2026-09-14", "end_date": "2026-09-20", "category": "教務", "related_checklist_id": None},
    {"id": 2, "event_name": "就學貸款申請、學雜費減免收件", "start_date": "2026-09-14", "end_date": "2026-09-15", "category": "繳費", "related_checklist_id": None},
    {"id": 3, "event_name": "弱勢助學金、學產基金申請", "start_date": "2026-09-16", "end_date": "2026-10-01", "category": "獎助", "related_checklist_id": None},
    {"id": 4, "event_name": "受理棄選（停修）", "start_date": "2026-11-16", "end_date": "2026-12-04", "category": "教務", "related_checklist_id": 1},
    {"id": 5, "event_name": "網路教學評量填寫", "start_date": "2026-12-14", "end_date": "2026-12-20", "category": "教務", "related_checklist_id": None},
    {"id": 6, "event_name": "期中考試", "start_date": "2026-11-07", "end_date": "2026-11-13", "category": "教務", "related_checklist_id": None},
    {"id": 7, "event_name": "申請下學期轉系(科)、輔系及雙主修", "start_date": "2026-11-09", "end_date": "2027-01-08", "category": "教務", "related_checklist_id": None},
    {"id": 8, "event_name": "58 週年校慶典禮", "start_date": "2026-12-12", "end_date": "2026-12-12", "category": "活動", "related_checklist_id": None},
    {"id": 9, "event_name": "下學期課程網路初選", "start_date": "2026-12-21", "end_date": "2026-12-27", "category": "教務", "related_checklist_id": None},
    {"id": 10, "event_name": "期末考試", "start_date": "2027-01-09", "end_date": "2027-01-15", "category": "教務", "related_checklist_id": None},
    {"id": 11, "event_name": "寒假開始", "start_date": "2027-01-18", "end_date": "2027-01-18", "category": "活動", "related_checklist_id": None},
]

# 模擬缺曠課紀錄 (對應 attendance_records 資料表，內容與 seed_data.py 一致)
DEMO_ATTENDANCE_RECORDS = [
    {"id": 1, "student_id": "S112001", "date": "2026-09-14", "course_name": "程式設計(二)", "type": "曠課", "notified": True},
    {"id": 2, "student_id": "S112001", "date": "2026-09-15", "course_name": "PYTHON程式語言", "type": "遲到", "notified": True},
    {"id": 3, "student_id": "S112001", "date": "2026-09-16", "course_name": "程式設計(二)", "type": "曠課", "notified": True},
    {"id": 4, "student_id": "S112001", "date": "2026-09-18", "course_name": "進階分類通識課程國文藝術類", "type": "病假", "notified": True},
    {"id": 5, "student_id": "S112001", "date": "2026-09-21", "course_name": "程式設計(二)", "type": "曠課", "notified": False},
    {"id": 6, "student_id": "S112001", "date": "2026-09-23", "course_name": "程式設計(二)", "type": "曠課", "notified": False},
    {"id": 7, "student_id": "S112002", "date": "2026-09-16", "course_name": "溝通與簡報實務", "type": "病假", "notified": True},
    {"id": 8, "student_id": "S112005", "date": "2026-09-15", "course_name": "PYTHON程式語言", "type": "曠課", "notified": False},
    {"id": 9, "student_id": "S112005", "date": "2026-09-17", "course_name": "行動應用服務開發", "type": "遲到", "notified": False}
]

DEMO_CERTIFICATES = [
    {
        "cert_id": 1,
        "student_id": "S112001",
        "cert_name": "丙級電腦硬體裝修技術士",
        "issuing_org": "勞動部勞動力發展署技能檢定中心",
        "cert_number": "113-CS-004521",
        "theory_score": 82.0,
        "practical_score": 88.0,
        "cert_status": "及格發證",
        "verify_url": "https://eservice.wdasec.gov.tw/WWW/C101Q",
        "file_path": "/uploads/demo_mol_transcript.pdf",
        "file_name": "勞動部技術士技能檢定成績單.pdf",
        "file_type": "pdf",
        "issue_date": "2026-06-20",
        "created_at": "2026-06-25 10:00:00"
    },
    {
        "cert_id": 2,
        "student_id": "S112001",
        "cert_name": "乙級電腦軟體應用技術士",
        "issuing_org": "勞動部勞動力發展署技能檢定中心",
        "cert_number": "114-CS-008912",
        "theory_score": 86.5,
        "practical_score": 92.0,
        "cert_status": "及格發證",
        "verify_url": "https://eservice.wdasec.gov.tw/WWW/C101Q",
        "file_path": "/uploads/demo_mol_cert.svg",
        "file_name": "乙級技術士證書正本.svg",
        "file_type": "image",
        "issue_date": "2026-08-15",
        "created_at": "2026-08-20 14:30:00"
    },
    {
        "cert_id": 3,
        "student_id": "S112002",
        "cert_name": "TQC+ 網頁設計工程師",
        "issuing_org": "財團法人中華民國電腦技能基金會",
        "cert_number": "TQC-WD-22310",
        "theory_score": 78.0,
        "practical_score": 85.0,
        "cert_status": "及格發證",
        "verify_url": "https://www.tqc.org.tw/",
        "file_path": None,
        "file_name": None,
        "file_type": None,
        "issue_date": "2026-07-05",
        "created_at": "2026-07-10 09:00:00"
    },
    {
        "cert_id": 4,
        "student_id": "S112004",
        "cert_name": "丙級電腦硬體裝修技術士",
        "issuing_org": "勞動部勞動力發展署技能檢定中心",
        "cert_number": "113-CS-004588",
        "theory_score": 90.0,
        "practical_score": 86.0,
        "cert_status": "及格發證",
        "verify_url": "https://eservice.wdasec.gov.tw/WWW/C101Q",
        "file_path": None,
        "file_name": None,
        "file_type": None,
        "issue_date": "2026-06-20",
        "created_at": "2026-06-25 10:00:00"
    },
    {
        "cert_id": 5,
        "student_id": "S112004",
        "cert_name": "乙級電腦軟體應用技術士",
        "issuing_org": "勞動部勞動力發展署技能檢定中心",
        "cert_number": "114-CS-009010",
        "theory_score": 88.0,
        "practical_score": 90.0,
        "cert_status": "及格發證",
        "verify_url": "https://eservice.wdasec.gov.tw/WWW/C101Q",
        "file_path": None,
        "file_name": None,
        "file_type": None,
        "issue_date": "2026-08-15",
        "created_at": "2026-08-20 14:30:00"
    }
]

# 學生比賽與獲獎獎狀紀錄
DEMO_COMPETITIONS = [
    {
        "comp_id": 1,
        "student_id": "S112001",
        "competition_name": "2026 全國大專校院智慧校園物聯網創新應用競賽",
        "award_title": "第一名 (金獎)",
        "organizer": "教育部資訊及科技教育司",
        "project_name": "Smart UKN 智慧校園導引與擋修診斷系統",
        "award_date": "2026-05-18",
        "file_path": "/uploads/demo_award_cert.pdf",
        "file_name": "全國第一名獲獎獎狀.pdf",
        "file_type": "pdf",
        "created_at": "2026-05-20 11:00:00"
    },
    {
        "comp_id": 2,
        "student_id": "S112001",
        "competition_name": "第十屆北區大專跨校程式設計黑客松",
        "award_title": "佳作",
        "organizer": "中華民國電腦學會",
        "project_name": "AI 智慧法規檢索助理",
        "award_date": "2026-07-10",
        "file_path": "/uploads/demo_award_photo.svg",
        "file_name": "頒獎典禮受獎現場照片.svg",
        "file_type": "image",
        "created_at": "2026-07-12 16:20:00"
    }
]
DEMO_VISITOR_LOGS = []

# 分機依總務處「康寧大學(臺北校區)分機號碼表」(製表日期 1140617)；教務處、學務處位置依 114 學年度新生定向手冊
# 其他單位的辦公室位置官網未公告，只列單位名稱
CAMPUS_CONTACT_DIRECTORY = [
    {"office": "教務處課程與教學組", "location": "行政大樓 2 樓 教務處", "phone": "02-2632-1181 分機 323, 325", "business": "選課、停修、先修擋修、排課"},
    {"office": "教務處註冊組", "location": "行政大樓 2 樓 教務處", "phone": "02-2632-1181 分機 324, 312, 313", "business": "學籍、成績單、學分抵免、畢業審查、休退學"},
    {"office": "學務處生活輔導組", "location": "行政大樓 1 樓 學務處", "phone": "02-2632-1181 分機 464, 412", "business": "學生請假、獎懲、宿舍"},
    {"office": "學生輔導中心", "location": "行政大樓 1 樓", "phone": "02-2632-1181 分機 432, 442", "business": "心理諮商、學習與生涯輔導"},
    {"office": "通識教育中心", "location": "通識教育中心", "phone": "02-2632-1181 分機 592, 598", "business": "通識課程、外語抵免"},
    {"office": "研究發展處", "location": "研究發展處", "phone": "02-2632-1181 分機 107, 113", "business": "專業證照獎勵 (先送科辦初審)、產學合作"}
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

@app.route("/admin-core")
def serve_admin_core():
    return app.send_static_file("admin-core.html")

@app.route("/liff/menu")
def serve_liff_menu():
    """LINE LIFF「設定常用功能」頁面；LIFF ID 從環境變數注入，避免寫死在前端原始碼裡。"""
    path = os.path.join(app.static_folder, "liff", "menu.html")
    with open(path, encoding="utf-8") as f:
        html = f.read()
    return html.replace("__LIFF_ID__", os.getenv("LINE_LIFF_ID", ""))

@app.route("/liff/schedule")
def serve_liff_schedule():
    """LINE LIFF「我的課表」頁面；LIFF ID 從環境變數注入，避免寫死在前端原始碼裡。"""
    path = os.path.join(app.static_folder, "liff", "schedule.html")
    with open(path, encoding="utf-8") as f:
        html = f.read()
    return html.replace("__LIFF_ID__", os.getenv("LINE_LIFF_ID_SCHEDULE", ""))

@app.route("/liff/favorites")
def serve_liff_favorites():
    """LINE LIFF「我的常用功能」頁面；LIFF ID 從環境變數注入，避免寫死在前端原始碼裡。"""
    path = os.path.join(app.static_folder, "liff", "favorites.html")
    with open(path, encoding="utf-8") as f:
        html = f.read()
    return html.replace("__LIFF_ID__", os.getenv("LINE_LIFF_ID_FAVORITES", ""))

# ==========================================
# 4. 身分認證與 Session 管理 API (/api/auth)
# ==========================================

# 登入防呆：同一個 IP 在 LOGIN_RATE_WINDOW_SECONDS 內連續失敗達 LOGIN_RATE_LIMIT 次就先擋著，
# 不管帳號打對打錯都算一次失敗 (避免被拿來猜哪個帳號存在)；登入成功會清掉這個 IP 的失敗紀錄。
LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_SECONDS = 8, 300
_login_rate_lock = threading.Lock()
_login_failures = {}

def _login_too_many(ip):
    now = time.monotonic()
    with _login_rate_lock:
        recent = _login_failures.setdefault(ip, deque())
        while recent and now - recent[0] > LOGIN_RATE_WINDOW_SECONDS:
            recent.popleft()
        return len(recent) >= LOGIN_RATE_LIMIT

def _record_login_failure(ip):
    with _login_rate_lock:
        _login_failures.setdefault(ip, deque()).append(time.monotonic())

def _clear_login_failures(ip):
    with _login_rate_lock:
        _login_failures.pop(ip, None)

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    ip = request.remote_addr or "unknown"
    if _login_too_many(ip):
        return jsonify({"status": "error", "message": "登入失敗次數過多，請 5 分鐘後再試"}), 429

    data = request.get_json(silent=True) or {}
    # 防呆：trim 頭尾空白、擋超長輸入 (例如貼錯整段文字)，帳號一律用小寫比對避免大小寫鎖死
    username = str(data.get("username", "")).strip()[:100]
    password = str(data.get("password", "")).strip()[:200]
    username_key = username.lower()

    if not username or not password:
        return jsonify({"status": "error", "message": "請輸入帳號與密碼"}), 400

    conn = get_db_connection()
    user_record = None
    found_username_in_db = False

    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            # 可用帳號或學號登入 (大小寫不敏感)；學號只比對學生身分 (家長帳號也綁學號，不可用學號登入家長)
            sql = """
                SELECT u.*, s.dept_id, s.class_name, d.dept_name
                FROM users u
                LEFT JOIN students s ON u.student_id = s.student_id
                LEFT JOIN departments d ON s.dept_id = d.dept_id
                WHERE LOWER(u.username) = %s OR (u.student_id = %s AND u.role = '學生')
                ORDER BY LOWER(u.username) = %s DESC
                LIMIT 1
            """
            cursor.execute(sql, (username_key, username.upper(), username_key))
            candidate = cursor.fetchone()
            cursor.close()
            conn.close()
            if candidate:
                found_username_in_db = True
                if check_password_hash(candidate["password_hash"], password):
                    user_record = candidate
        except Exception:
            if conn: conn.close()

    # MySQL 未找到帳號時，查詢持久化的 SQLite 備援帳號。
    if not user_record and not found_username_in_db and not app.config.get("TESTING"):
        try:
            import admin_db
            candidates = admin_db.query_db(
                "SELECT * FROM users WHERE LOWER(username) = %s OR (student_id = %s AND role = '學生') LIMIT 1",
                (username_key, username.upper()),
            )
            if candidates:
                found_username_in_db = True
                candidate = candidates[0]
                if check_password_hash(candidate["password_hash"], password):
                    user_record = dict(candidate)
                    if candidate.get("student_id"):
                        stu = next((s for s in DEMO_STUDENTS if s["student_id"] == candidate["student_id"]), None)
                        if stu:
                            user_record.setdefault("dept_id", stu["dept_id"])
                            user_record.setdefault("class_name", stu["class_name"])
                            user_record.setdefault("dept_name", stu.get("dept_name", "資訊管理科（五專）"))
        except Exception:
            pass

    if not user_record and not found_username_in_db:
        for u in sorted(DEMO_USERS, key=lambda x: x["username"].lower() != username_key):
            is_login_name = u["username"].lower() == username_key or (u.get("student_id") == username.upper() and u["role"] == "學生")
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
        if user_record.get("is_active") is not None and int(user_record["is_active"]) == 0:
            return jsonify({"status": "error", "message": "此帳號已停用，請洽系統管理員"}), 403
        _clear_login_failures(ip)
        session.clear()
        session.permanent = data.get("remember", True) is not False
        session["user_id"] = user_record["user_id"]
        session["username"] = user_record["username"]
        session["role"] = user_record["role"]
        session["is_active"] = user_record.get("is_active", 1)
        session["permissions"] = user_record.get("permissions")
        session["office"] = user_record.get("office", "")
        session["full_name"] = user_record["full_name"]
        session["student_id"] = user_record.get("student_id")
        session["dept_id"] = user_record.get("dept_id", "CS")
        session["dept_name"] = user_record.get("dept_name", "資訊管理科（五專）")
        session["class_name"] = user_record.get("class_name", "")
        session["advised_class"] = user_record.get("advised_class")
        session["can_manage_dorm"] = bool(user_record.get("can_manage_dorm")) or user_record["role"] == "管理員"

        return jsonify({
            "status": "success",
            "message": f"歡迎登入！{user_record['full_name']} ({user_record['role']})",
            "user": {
                "user_id": user_record["user_id"],
                "username": user_record["username"],
                "role": user_record["role"],
                "permissions": user_record.get("permissions"),
                "office": user_record.get("office", ""),
                "workbench_url": "/admin-workbench" if user_record["role"] in ('處室承辦','科助','住宿管理員') else "/",
                "full_name": user_record["full_name"],
                "student_id": user_record.get("student_id"),
                "dept_name": user_record.get("dept_name", "資訊管理科（五專）"),
                "class_name": user_record.get("class_name", ""),
                "advised_class": user_record.get("advised_class")
            }
        }), 200

    _record_login_failure(ip)
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
                "permissions": session.get("permissions"),
                "office": session.get("office", ""),
                "full_name": session.get("full_name"),
                "student_id": session.get("student_id"),
                "dept_name": session.get("dept_name", "資訊管理科（五專）"),
                "class_name": session.get("class_name", ""),
                "advised_class": session.get("advised_class"),
                "can_manage_dorm": bool(session.get("can_manage_dorm")),
                "visitor_type": session.get("visitor_type"),
                "visitor_name": session.get("visitor_name")
            }
        }), 200
    return jsonify({"status": "success", "is_authenticated": False, "user": None}), 200

@app.route("/api/visitor/register", methods=["POST"])
def register_visitor():
    """訪客/未來學生快速登記 (visitor_logs)，登記後以「訪客」身分進入系統"""
    data = request.get_json(silent=True) or {}
    vname = str(data.get("visitor_name", "")).strip()[:50]
    phone = str(data.get("phone", "")).strip()[:30]
    school = str(data.get("school_from", "")).strip()[:100]
    purpose = str(data.get("purpose", "")).strip()[:100]
    target_dept = str(data.get("target_dept", "")).strip()[:100] or "資訊管理科（五專）"
    visitor_type = data.get("visitor_type") if data.get("visitor_type") in ("未來學生", "未來家長", "一般訪客") else "未來學生"
    ip = request.remote_addr or "127.0.0.1"

    if not vname or not phone or not school or not purpose:
        return jsonify({"status": "error", "message": "姓名、手機號碼、畢業學校與來訪目的為必填欄位！"}), 400
    # 防呆：手機號碼至少要有 7 個數字 (容許 -、空白、+、() 等常見格式)，擋掉「abc」這類明顯打錯的輸入
    if len(re.sub(r"\D", "", phone)) < 7:
        return jsonify({"status": "error", "message": "手機號碼格式不正確，請確認後重新輸入"}), 400

    try:
        saved = db_execute(
            "INSERT INTO visitor_logs (visitor_name, phone, school_from, purpose, target_dept, visitor_type, ip_address) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (vname, phone, school, purpose, target_dept, visitor_type, ip))
    except Exception:
        saved = None
    if saved:
        new_id = saved["lastrowid"]
    else:
        new_id = max((v["log_id"] for v in DEMO_VISITOR_LOGS), default=0) + 1
        DEMO_VISITOR_LOGS.insert(0, {
            "log_id": new_id, "visitor_name": vname, "phone": phone, "school_from": school, "purpose": purpose,
            "target_dept": target_dept, "visitor_type": visitor_type,
            "visited_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "ip_address": ip
        })

    session.clear()
    session["user_id"] = 999000 + new_id
    session["username"] = f"visitor_{new_id}"
    session["role"] = "訪客"
    session["visitor_type"] = visitor_type
    session["visitor_name"] = vname
    session["full_name"] = f"{vname} ({visitor_type})"
    session["student_id"] = None
    session["dept_name"] = target_dept
    session["class_name"] = school

    return jsonify({
        "status": "success",
        "message": f"歡迎蒞臨康寧大學，{vname}！系統已完成入校登記。",
        "visitor": {"log_id": new_id, "visitor_name": vname, "role": "訪客", "visitor_type": visitor_type, "target_dept": target_dept}
    }), 201

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

# 頂部橫條：進行中的申請/考試，以及幾天內要開始的申請、考試、放假
HIGHLIGHT_CATEGORIES = ("apply", "exam", "holiday")
HIGHLIGHT_UPCOMING_DAYS = 7
HIGHLIGHT_URGENT_DAYS = 3
HIGHLIGHT_LIMIT = 4

def calendar_highlights(events, today):
    """從學校行事曆挑出本週要注意的事項，依緊急程度排序"""
    ongoing, upcoming = [], []
    for ev in events:
        if ev["category"] not in HIGHLIGHT_CATEGORIES:
            continue
        start = datetime.strptime(ev["start_date"], "%Y-%m-%d").date()
        end = datetime.strptime(ev["end_date"], "%Y-%m-%d").date()
        days_to_end, days_to_start = (end - today).days, (start - today).days
        if start <= today <= end and ev["category"] != "holiday":
            badge = "今天截止" if days_to_end == 0 else f"進行中・剩 {days_to_end} 天"
            ongoing.append({"id": ev["id"], "title": ev["title"], "category": ev["category"], "badge": badge,
                            "is_urgent": days_to_end <= HIGHLIGHT_URGENT_DAYS, "sort": days_to_end})
        elif 0 < days_to_start <= HIGHLIGHT_UPCOMING_DAYS:
            when = "明天" if days_to_start == 1 else f"{days_to_start} 天後"
            if ev["category"] == "holiday":
                badge = f"{when}放假"
            elif start == end and "截止" in ev["title"]:
                badge = f"{when}截止"
            else:
                badge = f"{when}開始"
            upcoming.append({"id": ev["id"], "title": ev["title"], "category": ev["category"], "badge": badge,
                             "is_urgent": False, "sort": days_to_start})
    ongoing.sort(key=lambda h: h["sort"])
    upcoming.sort(key=lambda h: h["sort"])
    return [{k: v for k, v in h.items() if k != "sort"} for h in (ongoing + upcoming)[:HIGHLIGHT_LIMIT]]

@app.route("/api/calendar/current-week", methods=["GET"])
def get_current_week():
    """回傳當前學期、當週校曆週次與本週要注意的校曆事項 (可用 ?date=YYYY-MM-DD 模擬日期)"""
    try:
        today = datetime.strptime(request.args["date"], "%Y-%m-%d").date() if request.args.get("date") else datetime.now().date()
    except ValueError:
        return jsonify({"status": "error", "message": "date 格式須為 YYYY-MM-DD"}), 400
    term = current_academic_term(today)
    calendar = school_calendar_sync.load()
    return jsonify({
        "status": "success",
        "academic_year": term["academic_year"],
        "semester": term["semester"],
        "semester_name": term["name"],
        "current_week": term["week"],
        "current_date": today.isoformat(),
        "active_highlights": calendar_highlights(calendar["events"], today) if calendar else []
    }), 200

def _deadline_visible_to_role(applies_to_role, viewer_role):
    """判斷某期限項目是否該顯示給目前角色；'all' 或未設定一律顯示，否則須完全比對身分清單，
    避免未登入或不相關身分看到無關期限（R4 角色過濾）"""
    if not applies_to_role or str(applies_to_role).strip().lower() == "all":
        return True
    allowed = [r.strip() for r in str(applies_to_role).split(",") if r.strip()]
    return viewer_role in allowed

def _compute_deadline_status(item, today):
    """依今天日期動態算出期限狀態文字、剩餘天數與是否緊急，取代建立資料當下就寫死存進去的舊文字
    （R4：逾期項目清楚標示，天數不會隨時間經過而失準）"""
    row = dict(item)
    end_date, start_date = row.get("end_date"), row.get("start_date")
    if hasattr(end_date, "isoformat"):
        end_date = end_date.isoformat()
    if hasattr(start_date, "isoformat"):
        start_date = start_date.isoformat()
    row["end_date"], row["start_date"] = end_date, start_date

    try:
        end = datetime.strptime(str(end_date), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return row
    start = None
    if start_date:
        try:
            start = datetime.strptime(str(start_date), "%Y-%m-%d").date()
        except ValueError:
            start = None

    days_left = (end - today).days
    row["countdown_days"] = days_left
    if start and today < start:
        row["status_badge"] = f"尚未開放（{(start - today).days} 天後開始）"
        row["is_urgent"] = False
    elif days_left < 0:
        row["status_badge"] = f"已超過期限 {abs(days_left)} 天"
        row["is_urgent"] = False
    elif days_left == 0:
        row["status_badge"] = "今天截止"
        row["is_urgent"] = True
    else:
        row["status_badge"] = f"進行中（剩 {days_left} 天）"
        row["is_urgent"] = days_left <= 7
    return row

def normalize_deadline_row(row):
    """MySQL 的 date 欄位轉成 YYYY-MM-DD；不轉的話 Flask 會輸出 'Tue, 01 Sep 2026 00:00:00 GMT'，前台無法判斷截止日"""
    item = dict(row)
    for key in ("start_date", "end_date"):
        if hasattr(item.get(key), "isoformat"):
            item[key] = item[key].isoformat()
    return item

@app.route("/api/deadlines", methods=["GET", "POST"])
@write_roles_required("管理員", "教職員")
def manage_deadlines():
    global DEMO_DEADLINES
    if request.method == "GET":
        today = datetime.now().date()
        session_role = session.get("role")
        requested_role = request.args.get("role")
        # 僅管理員/教職員可用 ?role= 預覽其他身分看到的內容；一般使用者一律只依自己登入的身分過濾
        role = requested_role if (requested_role and session_role in ("管理員", "教職員")) else session_role

        rows = fetch_db_rows("SELECT * FROM deadlines ORDER BY end_date ASC")
        rows = DEMO_DEADLINES if rows is None else [normalize_deadline_row(r) for r in rows]
        # ?scope=mine：只留全校與「我的科系」的期限
        rows = preferences.scope_filter(rows, lambda d: [d["applies_to_dept"]] if d.get("applies_to_dept") else [])
        visible = [r for r in rows if _deadline_visible_to_role(r.get("applies_to_role"), role)]
        return jsonify({"status": "success", "data": [_compute_deadline_status(r, today) for r in visible]}), 200

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
    return jsonify({"status": "success", "message": "期限項目新增成功！", "data": _compute_deadline_status(item, datetime.now().date())}), 201

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
            try:  # owner_key 有值的是個人行程 (T10)，不列入全校校曆
                cursor.execute("SELECT * FROM academic_calendar WHERE owner_key IS NULL ORDER BY start_date ASC, id ASC")
            except Exception:  # 還沒執行 init_db.py 補欄位的舊資料庫
                cursor.close()
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
@write_roles_required("管理員", "教職員")
def manage_academic_calendar():
    global DEMO_ACADEMIC_CALENDAR
    if request.method == "GET":
        return jsonify({"status": "success", "data": fetch_calendar_events()}), 200

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
            cursor.execute("SELECT * FROM academic_calendar WHERE id = %s AND owner_key IS NULL", (event_id,))
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
            cursor.execute("SELECT COUNT(*) FROM academic_calendar WHERE id = %s AND owner_key IS NULL", (event_id,))
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

# 【功能：AI 智慧校規】①「我知道要查什麼」：先把口語換成正式名稱 (同義詞)，再依關鍵字/名稱/分類/內文命中給分，取最高分的規章
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
            "last_updated": format_updated_at(best_match.get("updated_at")),
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
        "suggested_topics": ["停修課程", "英文證照抵免", "學生請假", "擋修規定", "學業退學"],
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

@app.route("/api/admin/self-check", methods=["POST"])
@role_required("管理員")
def run_self_check():
    """一鍵執行全站自動檢測 (self_check.py)：強制切換離線示範模式跑完所有功能測試後自動還原，
    回傳每一項功能的測試結果與整體完成度，過程中建立的測試資料會自動清理。"""
    import self_check
    report = self_check.run_all()
    return jsonify({"status": "success", **report}), 200

def load_visitor_logs(days):
    """最近 days 天的訪客登記 (新到舊)；MySQL 離線時讀記憶體"""
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
    rows = fetch_db_rows("SELECT * FROM visitor_logs WHERE visited_at >= %s ORDER BY visited_at DESC, log_id DESC", (since,))
    if rows is None:
        rows = [dict(v) for v in DEMO_VISITOR_LOGS if v["visited_at"] >= since]
    for r in rows:
        r["visited_at"] = str(r["visited_at"])[:19]
    return rows

def mask_phone(phone):
    """列表只顯示手機前 4 碼與末 3 碼，完整號碼需匯出 CSV (會留修改紀錄)"""
    digits = re.sub(r"\D", "", phone or "")
    return f"{digits[:4]}-***-{digits[-3:]}" if len(digits) >= 8 else "***"

def _visitor_days():
    try:
        return min(max(int(request.args.get("days", 30)), 1), 365)
    except ValueError:
        return 30

@app.route("/api/admin/visitor-logs", methods=["GET"])
@role_required("管理員", "教職員")
def get_visitor_logs():
    """訪客登記紀錄與統計 (來訪目的、感興趣科系、每日人數)，供招生與公關參考"""
    days = _visitor_days()
    rows = load_visitor_logs(days)
    count_by = lambda key: sorted(
        ({"name": k, "count": sum(1 for r in rows if r[key] == k)} for k in {r[key] for r in rows}),
        key=lambda x: -x["count"])
    daily = {}
    for r in rows:
        daily[r["visited_at"][:10]] = daily.get(r["visited_at"][:10], 0) + 1
    return jsonify({
        "status": "success",
        "days": days,
        "total": len(rows),
        "by_purpose": count_by("purpose"),
        "by_dept": count_by("target_dept"),
        "by_visitor_type": count_by("visitor_type"),
        "daily": [{"date": d, "count": daily[d]} for d in sorted(daily)],
        "data": [{**{k: r[k] for k in ("log_id", "visitor_name", "school_from", "purpose", "target_dept", "visitor_type", "visited_at")},
                  "phone": mask_phone(r["phone"])} for r in rows]
    }), 200

@app.route("/api/admin/visitor-logs/export.csv", methods=["GET"])
@role_required("管理員", "教職員")
def export_visitor_logs():
    days = _visitor_days()
    rows = load_visitor_logs(days)
    buf = StringIO()
    writer = csv.writer(buf)
    writer.writerow(["編號", "登記時間", "姓名", "手機", "學校", "來訪目的", "感興趣科系", "身分"])
    for r in rows:
        writer.writerow([r["log_id"], r["visited_at"], r["visitor_name"], r["phone"], r["school_from"], r["purpose"], r["target_dept"], r.get("visitor_type", "")])
    # 匯出含完整手機號碼，留下誰在何時匯出的紀錄
    write_audit_log("visitor_logs", f"export-{days}d", "匯出", after={"days": days, "count": len(rows)})
    return Response("﻿" + buf.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=visitor_logs_{datetime.now():%Y%m%d}.csv"})

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

# 全校共同的課程類別，「只看本科」時仍會顯示
PUBLIC_COURSE_TYPES = ("通識教育", "共同必修")

def load_course_map():
    """課程地圖：有連 MySQL 時讀 course_map，離線或資料表為空時回退 DEMO_COURSES"""
    rows = fetch_db_rows(COURSE_MAP_SQL)
    return rows if rows else DEMO_COURSES

# 【功能：修業進度與擋修】讀取學生歷年成績 (student_credits)，後面的擋修、畢業、重補修都用這份資料比對
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

DEMO_COURSE_IDS = {c["course_id"] for c in DEMO_COURSES}

def hide_untaken_demo_courses(courses, taken_ids):
    """用 import_my_data.py 匯入真實成績的學生 (修過示範以外的課) 不列出沒修過的示範課程；
    示範帳號的成績全是示範課程，清單不變"""
    if not set(taken_ids) - DEMO_COURSE_IDS:
        return courses
    return [c for c in courses if c["course_id"] not in DEMO_COURSE_IDS or c["course_id"] in taken_ids]

# 【功能：修業進度與擋修】同一科修多次時：有一次及格就算通過；整理出已通過 / 未通過的課程
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
    """取得完整課程地圖（優先讀取 MySQL，離線回退 DEMO_COURSES）；?scope=mine 時只留通識、共同必修與本科課程"""
    courses = preferences.scope_filter(
        load_course_map(),
        lambda c: [c["dept_id"]] if c.get("dept_id") and c.get("course_type") not in PUBLIC_COURSE_TYPES else [])
    return jsonify({"status": "success", "data": courses}), 200

# 【功能：修業進度與擋修】逐科比對：先修科目 (prerequisite_id) 不在已通過清單 → 標成擋修；同時累加已修學分
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
        courses = hide_untaken_demo_courses(courses, latest)
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

@app.route("/api/student/graduation-audit", methods=["GET"])
def graduation_audit():
    """畢業缺課檢核：依學生入學年度的修業科目表 (curriculum/<dept_id>_<入學年>.json) 比對已通過與修課中的課程；
    沒有該屆修業科目表時回傳 available=False，前端改顯示擋修試算"""
    role = session.get("role")
    if not role:
        return jsonify({"status": "error", "message": "請先登入系統"}), 401
    student_id, err = _resolve_graduation_target_student(role, session.get("student_id"),
                                                         (request.args.get("student_id") or "").strip().upper() or None)
    if err:
        return jsonify({"status": "error", "message": err[0]}), err[1]
    if role == "老師" and not teacher_can_view_student(student_id):
        return jsonify({"status": "error", "message": "老師僅能查詢自己班級學生的資料"}), 403
    rows = fetch_db_rows("SELECT dept_id, admission_year, class_name FROM students WHERE student_id = %s", (student_id,))
    stu = rows[0] if rows else next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), None)
    curriculum = load_curriculum(stu["dept_id"], stu["admission_year"]) if stu else None
    if not curriculum:
        return jsonify({"status": "success", "available": False}), 200

    course_by_id = {c["course_id"]: c for c in load_course_map()}
    passed = [{"course_name": course_by_id[r["course_id"]]["course_name"], "credits": course_by_id[r["course_id"]]["credits"],
               "semester": r["semester"]}
              for r in load_student_credits(student_id) if r["is_passed"] and r["course_id"] in course_by_id]
    current = [c["course_name"] for c in get_dashboard_source().list_schedule(stu["class_name"], student_id)]
    term = current_academic_term(datetime.now().date())
    result = audit_curriculum(curriculum, passed, current, f"{term['academic_year']}-{term['semester']}")
    return jsonify({"status": "success", "available": True, **result}), 200

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
                    "semester_suggest": c.get("semester_suggest") or "後續學期",
                    "direct_prereq": course_dict.get(curr, {}).get("course_name", curr)
                })
                queue.append(c["course_id"])

    # 評估延畢風險
    has_capstone = any("專題" in c["course_name"] for c in cascade_blocked)
    total_blocked_credits = sum(c["credits"] for c in cascade_blocked)

    if has_capstone or len(cascade_blocked) >= 3:
        risk_level = "極高"
        risk_color = "red"
        impact_summary = f"⚠️ 延畢極高風險！因【{target_course['course_name']}】為核心先修樞紐，若被當將連帶骨牌擋修後續 {len(cascade_blocked)} 門必修（包含五年級實務專題），預估延畢 1 年！"
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
        WHERE s.admission_year = %s AND c.kind = '證照' AND c.review_status = '已通過'
        ORDER BY c.issue_date DESC
    """, (admission_year,))
    if certs is None and ids is not None:  # 還沒執行 init_db.py 補欄位 (T10) 的舊資料庫
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

# 【功能：畢業進度】已通過學分、證照張數與畢業門檻 (220 學分、2 張證照) 相比，算出還差多少
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
    """導師班級總表：老師只能看自己帶的班，教職員/管理員可用 ?class_name= 指定班級"""
    class_name = request.args.get("class_name") or session.get("advised_class")
    if session.get("role") == "老師" and class_name != session.get("advised_class"):
        return jsonify({"status": "error", "message": "老師僅能查看自己的導師班"}), 403
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

def _list_class_names():
    rows = fetch_db_rows("SELECT DISTINCT class_name FROM students WHERE class_name IS NOT NULL ORDER BY class_name")
    if rows:
        return [r["class_name"] for r in rows]
    return sorted({s["class_name"] for s in DEMO_STUDENTS if s.get("class_name")})

@app.route("/api/teacher/class-attendance", methods=["GET"])
@role_required("老師", "教職員", "管理員")
def teacher_class_attendance():
    """班級出缺勤一覽 (T13)：班導只能看自己的導師班；教職員/管理員可用 ?class_name= 指定班級
    每位學生：曠課 / 遲到 / 病假次數、扣考風險 (ok / warning / banned)、快扣考的科目、近 7 天曠課、最近一次紀錄"""
    role = session.get("role")
    class_name = request.args.get("class_name") or session.get("advised_class")
    if role == "老師" and class_name != session.get("advised_class"):
        return jsonify({"status": "error", "message": "老師僅能查看自己的導師班"}), 403
    classes = [session.get("advised_class")] if role == "老師" else _list_class_names()
    if not class_name:
        if role == "老師":
            return jsonify({"status": "error", "message": "您目前沒有導師班"}), 404
        class_name = classes[0] if classes else None
    if not class_name:
        return jsonify({"status": "error", "message": "查無班級資料"}), 404

    names = {s["student_id"]: s["full_name"] for s in list_students()}
    hours = course_weekly_hours()
    source = get_attendance_source()
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    rank = {"ok": 0, "warning": 1, "banned": 2}
    students = []
    class_ids = _get_class_student_ids(class_name)
    leave_rows = get_dashboard_source().list_leave_requests_for_review(class_ids, None)
    for sid in class_ids:
        records = source.list_records(sid)
        leaves = [r for r in leave_rows if r["student_id"] == sid]
        summary = summarize_attendance(records, hours, course_semester_hours(), current_attendance_semester())
        students.append({
            "student_id": sid,
            "full_name": names.get(sid, sid),
            "totals": summary["totals"],
            "level": summary["overall_level"],
            "risk_courses": [{k: c[k] for k in ("course_name", "absent_count", "absent_hours", "counted_hours", "estimated", "manual_review", "exam_ban_threshold_hours", "remaining_hours", "level")}
                             for c in summary["courses"] if c["level"] != "ok"],
            "recent_absent": sum(1 for r in records if r["type"] == "曠課" and str(r["date"])[:10] >= week_ago),
            "last_date": max((str(r["date"])[:10] for r in records), default=""),
            "leaves": {"pending": sum(r["status"] == "待審核" for r in leaves),
                       "approved": sum(r["status"] == "已核准" for r in leaves),
                       "rejected": sum(r["status"] == "已退回" for r in leaves),
                       "items": [{k: r.get(k) for k in ("id", "leave_type", "start_date", "end_date", "periods", "status", "review_note")} for r in leaves]},
        })
    students.sort(key=lambda x: (-rank[x["level"]], -x["totals"]["曠課"], x["student_id"]))
    return jsonify({
        "status": "success",
        "class_name": class_name,
        "classes": classes,
        "summary": {
            "student_count": len(students),
            "banned": sum(1 for x in students if x["level"] == "banned"),
            "warning": sum(1 for x in students if x["level"] == "warning"),
            "absent_total": sum(x["totals"]["曠課"] for x in students),
            "recent_absent": sum(x["recent_absent"] for x in students),
        },
        "students": students,
    }), 200

@app.route("/api/teacher/class-overview", methods=["GET"])
@role_required("老師", "教職員", "管理員")
def teacher_class_overview():
    """我的導師班總覽 (T16)：每位學生的出缺勤、學業預警、導生關懷一次看完
    班導只能看自己的導師班；教職員/管理員可用 ?class_name= 切換
    學業預警遵守個資授權：學生沒有授權導師查看時只回傳「沒有開放查看」"""
    from campus import counseling
    role = session.get("role")
    class_name = request.args.get("class_name") or session.get("advised_class")
    if role == "老師" and class_name != session.get("advised_class"):
        return jsonify({"status": "error", "message": "老師僅能查看自己的導師班"}), 403
    classes = [session.get("advised_class")] if role == "老師" else _list_class_names()
    if not class_name:
        if role == "老師":
            return jsonify({"status": "error", "message": "您目前沒有導師班"}), 404
        class_name = classes[0] if classes else None
    if not class_name:
        return jsonify({"status": "error", "message": "查無班級資料"}), 404

    names = {s["student_id"]: s["full_name"] for s in list_students()}
    ids = _get_class_student_ids(class_name)
    hours = course_weekly_hours()
    source = get_attendance_source()
    records = counseling.load_records(ids)
    students = []
    for sid in ids:
        att = summarize_attendance(source.list_records(sid), hours, course_semester_hours(), current_attendance_semester())
        if load_privacy_settings(sid)["advisor_alert_consent"]:
            w = compute_early_warning(sid)
            study = {"risk": w["risk_level"], "level": w["warning_level"], "failed_credits": w["failed_credits"],
                     "current_credits": w["current_credits"], "semester": w["semester"]}
        else:
            study = {"risk": "沒有開放查看", "level": "restricted"}
        mine = [r for r in records if r["student_id"] == sid]
        students.append({
            "student_id": sid, "full_name": names.get(sid, sid),
            "attendance": {"level": att["overall_level"], "absent": att["totals"]["曠課"], "late": att["totals"]["遲到"],
                           "risk_courses": [c["course_name"] for c in att["courses"] if c["level"] != "ok"]},
            "study": study,
            "counseling": {"count": len(mine), "last_date": mine[0]["talk_date"] if mine else "",
                           "pending": sum(1 for r in mine if r["follow_up"] and not r["follow_up_done"])},
        })
    # 需要關心的排前面：已扣考 / 學業很嚴重 / 學業要注意 / 快扣考 / 待追蹤
    def concern(x):
        return -(3 * (x["attendance"]["level"] == "banned") + 3 * (x["study"]["level"] == "critical")
                 + 2 * (x["study"]["level"] == "warning") + 2 * (x["attendance"]["level"] == "warning")
                 + x["counseling"]["pending"])
    students.sort(key=lambda x: (concern(x), x["student_id"]))
    return jsonify({
        "status": "success", "class_name": class_name, "classes": classes,
        "summary": {
            "student_count": len(students),
            "banned": sum(1 for x in students if x["attendance"]["level"] == "banned"),
            "attendance_warning": sum(1 for x in students if x["attendance"]["level"] == "warning"),
            "study_warning": sum(1 for x in students if x["study"]["level"] in ("warning", "critical")),
            "restricted": sum(1 for x in students if x["study"]["level"] == "restricted"),
            "not_talked": sum(1 for x in students if not x["counseling"]["count"]),
            "pending": sum(x["counseling"]["pending"] for x in students),
        },
        "students": students,
    }), 200

def _student_parent_phone(student_id):
    rows = fetch_db_rows("SELECT parent_phone FROM students WHERE student_id = %s", (student_id,))
    if rows:
        return rows[0].get("parent_phone") or ""
    stu = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), None)
    return (stu or {}).get("parent_phone") or ""

@app.route("/api/teacher/student-profile", methods=["GET"])
@role_required("老師", "教職員", "管理員")
def teacher_student_profile():
    """學生個人總覽 (T17)：班導找學生談話前一頁看完一位學生的
    基本資料、出缺勤、學業預警、畢業門檻、請假紀錄、證照與競賽、獎懲與幹部、導生關懷紀錄
    班導只能看自己導師班的學生；教職員/管理員可看全校
    學業預警遵守個資授權：學生沒有授權導師查看時只回傳「沒有開放查看」"""
    from campus import counseling
    from campus import certificates as campus_certs
    from campus import records as campus_records
    student_id = request.args.get("student_id", "").strip()
    if not student_id:
        return jsonify({"status": "error", "message": "請提供學號 (student_id)"}), 400
    info = _load_student_info(student_id)
    if not info:
        return jsonify({"status": "error", "message": "查無此學號之學生資料"}), 404
    if session.get("role") == "老師" and info.get("class_name") != session.get("advised_class"):
        return jsonify({"status": "error", "message": "老師僅能查看自己導師班的學生"}), 403

    # 出缺勤
    att_records = get_attendance_source().list_records(student_id)
    att = summarize_attendance(att_records, course_weekly_hours(), course_semester_hours(), current_attendance_semester())
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    attendance = {
        "level": att["overall_level"],
        "totals": att["totals"],
        "recent_absent": sum(1 for r in att_records if r["type"] == "曠課" and str(r["date"])[:10] >= week_ago),
        "risk_courses": [{k: c[k] for k in ("course_name", "absent_hours", "counted_hours", "estimated", "manual_review", "exam_ban_threshold_hours", "remaining_hours", "level")}
                         for c in att["courses"] if c["level"] != "ok"],
        "recent_records": [{"date": str(r["date"])[:10], "course_name": r.get("course_name", ""), "type": r["type"]}
                           for r in att_records[:10]],
    }

    # 學業預警 (需學生授權)
    if load_privacy_settings(student_id)["advisor_alert_consent"]:
        w = compute_early_warning(student_id)
        study = {k: w[k] for k in ("risk_level", "warning_level", "semester", "current_credits", "failed_credits",
                                   "failed_courses", "blocked_courses", "warning_details", "advisor_session")}
    else:
        study = {"risk_level": "沒有開放查看", "warning_level": "restricted"}

    # 畢業門檻
    grad = _compute_graduation_dashboard(student_id)
    graduation = None
    if grad:
        c, ce = grad["credits"], grad["certificates"]
        graduation = {
            "credits_earned": c["earned"], "credits_threshold": c["threshold"], "credits_remaining": c["remaining"],
            "progress_percent": c["progress_percent"], "breakdown": c["breakdown"],
            "certs_owned": ce["owned_count"], "certs_required": ce["required"],
            "overall_meets": grad["overall_meets_graduation_requirement"],
        }

    # 請假紀錄
    leave_rows = get_dashboard_source().list_leave_requests_for_review([student_id], None)
    leaves = {
        "pending": sum(1 for r in leave_rows if r["status"] == "待審核"),
        "approved": sum(1 for r in leave_rows if r["status"] == "已核准"),
        "rejected": sum(1 for r in leave_rows if r["status"] == "已退回"),
        "data": [{k: r.get(k) for k in ("id", "leave_type", "start_date", "end_date", "periods", "reason", "status", "review_note", "submitted_at")}
                 for r in leave_rows[:10]],
    }
    for item in leaves["data"]:
        for k in ("start_date", "end_date", "submitted_at"):
            if item.get(k) is not None:
                item[k] = str(item[k])[:16 if k == "submitted_at" else 10]

    # 證照、競賽、作品 (含待審核)
    mine = [i for i in campus_certs.submissions() if i["student_id"] == student_id]
    mine.sort(key=lambda i: (i["issue_date"] or i["created_at"]), reverse=True)
    certificates = {
        "approved": sum(1 for i in mine if i["status"] == "已通過"),
        "pending": sum(1 for i in mine if i["status"] == "待審核"),
        "data": [{**{k: i[k] for k in ("id", "kind", "name", "issuer", "issue_date", "award", "status", "review_note")},
                  "files": [{"url": f.get("url"), "name": f.get("name")} for f in (i.get("files") or [])]} for i in mine],
    }

    # 導生關懷紀錄
    talks = counseling.load_records([student_id])
    counseling_info = {
        "count": len(talks),
        "last_date": talks[0]["talk_date"] if talks else "",
        "pending": sum(1 for r in talks if r["follow_up"] and not r["follow_up_done"]),
        "data": [{k: r.get(k) for k in ("id", "talk_date", "method", "topic", "content", "follow_up", "follow_up_done")} for r in talks],
    }

    return jsonify({
        "status": "success",
        "student": {
            "student_id": info["student_id"], "full_name": info["full_name"], "class_name": info.get("class_name", ""),
            "dept_name": info.get("dept_name", ""), "admission_year": info.get("admission_year"),
            "parent_phone": _student_parent_phone(student_id),
        },
        "attendance": attendance,
        "study": study,
        "graduation": graduation,
        "leaves": leaves,
        "certificates": certificates,
        "records": campus_records.profile(student_id),
        "counseling": counseling_info,
    }), 200

# ==========================================
# 9. 申辦進度保存 API (功能 3: 我的申辦進度)
# ==========================================

def load_checklists():
    """申辦流程清單：有連 MySQL 時讀 checklist_items，離線時回退 DEMO_CHECKLISTS"""
    rows = fetch_db_rows("SELECT * FROM checklist_items ORDER BY item_id ASC")
    if rows is None:
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

DEFAULT_PRIVACY_CONSENT = {"parent_alert_consent": 1, "advisor_alert_consent": 1}  # 預設兩項皆同意 (opt-out 而非 opt-in)

def load_privacy_settings(student_id):
    """讀取學生個資授權 (student_privacy_settings)；沒有紀錄時預設兩項皆同意"""
    rows = fetch_db_rows(
        "SELECT parent_alert_consent, advisor_alert_consent FROM student_privacy_settings WHERE student_id = %s",
        (student_id,))
    if rows:
        return {k: int(v) for k, v in rows[0].items()}
    if rows is None:
        return DEMO_PRIVACY_SETTINGS.get(student_id, dict(DEFAULT_PRIVACY_CONSENT))
    return dict(DEFAULT_PRIVACY_CONSENT)

@app.route("/api/student/privacy-consent", methods=["GET", "POST"])
@role_required("學生", "家長")
def manage_privacy_consent():
    """管理學生本人對家長/導師預警推播的個資授權 (功能 6)；家長可查看，只有學生本人可修改"""
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "error", "message": "請先以學生帳號登入"}), 401

    if request.method == "GET":
        return jsonify({"status": "success", "student_id": student_id, "settings": load_privacy_settings(student_id)}), 200

    if request.method == "POST":
        if session.get("role") != "學生":
            return jsonify({"status": "error", "message": "個資授權只能由學生本人修改"}), 403
        data = request.get_json(silent=True) or {}
        consent = lambda *keys: 1 if next((data[k] for k in keys if k in data), 1) in (1, True, "1", "true") else 0
        settings = {
            "parent_alert_consent": consent("parent_alert_consent", "consent_parent"),
            "advisor_alert_consent": consent("advisor_alert_consent", "consent_advisor")
        }
        before = dict(load_privacy_settings(student_id))

        saved = db_execute(
            "INSERT INTO student_privacy_settings (student_id, parent_alert_consent, advisor_alert_consent) VALUES (%s, %s, %s) "
            "ON DUPLICATE KEY UPDATE parent_alert_consent = VALUES(parent_alert_consent), advisor_alert_consent = VALUES(advisor_alert_consent)",
            (student_id, settings["parent_alert_consent"], settings["advisor_alert_consent"]))
        if saved is None:
            DEMO_PRIVACY_SETTINGS[student_id] = settings
        if {k: int(before.get(k, 1)) for k in settings} != settings:
            write_audit_log("student_privacy_settings", student_id, "修改",
                            before={"student_id": student_id, **{k: int(before.get(k, 1)) for k in settings}},
                            after={"student_id": student_id, **settings})

        return jsonify({
            "status": "success",
            "message": "個資授權設定更新成功！依個人資料保護法規定已生效。",
            "settings": settings
        }), 200

@app.route("/api/student/emergency-contact", methods=["GET", "PUT"])
def manage_emergency_contact():
    """緊急聯絡電話 (students.parent_phone)：學生與綁定家長皆可查看／自行更新，不需要經過行政單位"""
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "error", "message": "請先以學生或家長帳號登入"}), 401

    if request.method == "PUT":
        data = request.get_json(silent=True) or {}
        phone = str(data.get("parent_phone", "")).strip()[:30]
        if not phone:
            return jsonify({"status": "error", "message": "請輸入聯絡電話"}), 400
        # 防呆：至少要有 7 個數字 (容許 -、空白、+、() 等常見格式)，理由同訪客登記的手機號碼檢查
        if len(re.sub(r"\D", "", phone)) < 7:
            return jsonify({"status": "error", "message": "聯絡電話格式不正確，請確認後重新輸入"}), 400
        saved = db_execute("UPDATE students SET parent_phone = %s WHERE student_id = %s", (phone, student_id))
        if saved is None:
            stu = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), None)
            if stu:
                stu["parent_phone"] = phone
        return jsonify({"status": "success", "message": "緊急聯絡電話已更新", "parent_phone": phone}), 200

    rows = fetch_db_rows("SELECT parent_phone FROM students WHERE student_id = %s", (student_id,))
    if rows:
        phone = rows[0]["parent_phone"]
    else:
        stu = next((s for s in DEMO_STUDENTS if s["student_id"] == student_id), None)
        phone = stu.get("parent_phone") if stu else None
    return jsonify({"status": "success", "student_id": student_id, "parent_phone": phone or ""}), 200

def find_class_advisor(class_name):
    """班級導師姓名 (users.advised_class)；查無時回傳 None"""
    rows = fetch_db_rows("SELECT full_name FROM users WHERE role = '老師' AND advised_class = %s LIMIT 1", (class_name,))
    if rows:
        return rows[0]["full_name"]
    return next((u["full_name"] for u in DEMO_USERS if u["role"] == "老師" and u.get("advised_class") == class_name), None)

def compute_early_warning(student_id):
    """依最近一學期成績計算學業預警：不及格學分超過修習學分一半為「要注意」、超過三分之二為「很嚴重」；並列出因不及格而擋修的課程"""
    records = load_student_credits(student_id)
    course_by_id = {c["course_id"]: c for c in load_course_map()}
    _, failed_ids, _ = summarize_credits(records)

    current_semester = max((r["semester"] for r in records), default=None)
    current = [r for r in records if r["semester"] == current_semester]
    credits_of = lambda r: int(course_by_id.get(r["course_id"], {}).get("credits") or 0)
    current_credits = sum(credits_of(r) for r in current)
    failed_now = [r for r in current if not r["is_passed"]]
    failed_credits = sum(credits_of(r) for r in failed_now)
    ratio = failed_credits / current_credits if current_credits else 0

    if ratio >= 2 / 3:
        level, risk_level, title = "critical", "很嚴重", "🚨 這學期不及格的學分超過三分之二"
    elif ratio >= 1 / 2:
        level, risk_level, title = "warning", "要注意", "⚠️ 這學期不及格的學分超過一半"
    elif failed_ids:
        level, risk_level, title = "notice", "有科目沒過", "有科目還沒通過，請規劃重補修"
    else:
        level, risk_level, title = "normal", "正常", "學業狀況良好"

    def course_label(cid):
        return course_by_id.get(cid, {}).get("course_name", cid)

    failed_courses = [{
        "course_id": r["course_id"], "course_name": course_label(r["course_id"]),
        "semester": r["semester"], "score": r["score"], "credits": credits_of(r)
    } for r in failed_now]
    blocked_courses = [{
        "course_id": c["course_id"], "course_name": c["course_name"], "blocked_by": course_label(c["prerequisite_id"])
    } for c in course_by_id.values() if c.get("prerequisite_id") in failed_ids]

    details = []
    if failed_courses:
        details.append(f"{current_semester} 學期不及格 {failed_credits} / {current_credits} 學分："
                       + "、".join(f"{c['course_name']} ({c['score']:g} 分)" if c["score"] is not None else c["course_name"] for c in failed_courses))
    if blocked_courses:
        details.append("因先修科目未通過而擋修：" + "、".join(f"{c['course_name']} (需先通過 {c['blocked_by']})" for c in blocked_courses))
    if level in ("warning", "critical"):
        details.append("建議儘速找導師談談，並規劃下學期重補修。")

    return {
        "warning_level": level,
        "risk_level": risk_level,
        "warning_title": title,
        "semester": current_semester,
        "current_credits": current_credits,
        "failed_credits": failed_credits,
        "failed_course_count": len(failed_courses),
        "failed_courses": failed_courses,
        "blocked_courses": blocked_courses,
        "warning_details": details,
        "advisor_session": "建議找導師談談" if level in ("warning", "critical") else "目前不需要"
    }

@app.route("/api/student/early-warning", methods=["GET"])
@login_required
def get_student_early_warning():
    """學業與擋修風險預警（附帶個資法授權保護）(功能 6)
    學生/家長只能看本人 (綁定) 學號；老師只能看自己導師班學生；教職員/管理員可用 ?student_id= 查詢"""
    role = session.get("role")
    if role in ("學生", "家長"):
        student_id = session.get("student_id")
    elif role in ("老師", "教職員", "管理員"):
        student_id = (request.args.get("student_id") or "").strip().upper()
        if not student_id:
            return jsonify({"status": "error", "message": "請提供學號 (student_id)"}), 400
    else:
        return jsonify({"status": "error", "message": "請先登入系統"}), 401

    student = _load_student_info(student_id) if student_id else None
    if not student:
        return jsonify({"status": "error", "message": "查無此學生"}), 404
    if role == "老師" and student["class_name"] != session.get("advised_class"):
        return jsonify({"status": "error", "message": "僅能查看自己導師班的學生"}), 403

    # 檢查個資授權：家長、導師需學生本人同意才能看到明細
    privacy = load_privacy_settings(student_id)
    if (role == "家長" and not privacy["parent_alert_consent"]) or (role == "老師" and not privacy["advisor_alert_consent"]):
        who = "家長" if role == "家長" else "導師"
        return jsonify({
            "status": "consent_restricted",
            "is_authorized": False,
            "message": f"⚠️ 學生本人尚未開啟【{who}學業預警同步授權】。依《個人資料保護法》及校園隱私政策，系統已保護學業警示明細。",
            "student_name": student["full_name"]
        }), 200
    if role == "老師" and not privacy.get("advisor_alert_consent"):
        return jsonify({
            "status": "consent_restricted",
            "is_authorized": False,
            "message": "⚠️ 學生本人尚未開啟【導師學業預警同步授權】，依《個人資料保護法》系統已保護學業警示明細。",
            "student_name": student["full_name"]
        }), 200

    advisor = find_class_advisor(student["class_name"])
    return jsonify({
        "status": "success",
        "is_authorized": True,
        "student": {k: student.get(k) for k in ("student_id", "full_name", "class_name", "dept_name")},
        "consent_parent": bool(privacy["parent_alert_consent"]),
        "consent_advisor": bool(privacy["advisor_alert_consent"]),
        **compute_early_warning(student_id),
        "counselling_office": {
            "office_name": "學務處生輔組",
            "location": "行政大樓 1 樓",
            "phone": "02-2632-1181 分機 464, 412",
            "advisor_name": advisor
        }
    }), 200

# ==========================================
# 11. 同義詞與行政申辦流程 API (功能 7)
# ==========================================

@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify({"status": "success", "data": DEMO_CATEGORIES}), 200

@app.route("/api/checklists", methods=["GET", "POST"])
@write_roles_required("管理員", "教職員")
def manage_checklists():
    if request.method == "GET":
        return jsonify({"status": "success", "data": load_checklists()}), 200

    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    data = request.get_json(silent=True) or {}
    try:
        category_id = int(data.get("category_id", 1))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "類別 ID 格式錯誤"}), 400
    item = {
        "category_id": category_id,
        "category_name": data.get("category_name", "課務組"),
        "business_name": str(data.get("business_name", "")).strip(),
        "steps_json": data.get("steps_json", []),
        "required_docs": data.get("required_docs", ""),
        "office_hours": data.get("office_hours", "週一至週五 08:30 - 17:00"),
        "office_location": data.get("office_location", "行政大樓 2 樓"),
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
@write_roles_required("管理員", "教職員")
def manage_synonyms():
    if request.method == "GET":
        return jsonify({"status": "success", "data": load_synonyms()}), 200

    if session.get("role") not in ("管理員", "教職員"):
        return jsonify({"status": "error", "message": "權限不足"}), 403
    data = request.get_json(silent=True) or {}
    uk = str(data.get("user_keyword", "")).strip()
    ot = str(data.get("official_term", "")).strip()
    try:
        cid = int(data.get("category_id", 1))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "類別 ID 格式錯誤"}), 400
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
@write_roles_required("管理員", "教職員")
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
        item = {"id": result["lastrowid"], **item, "updated_at": datetime.now().strftime("%Y-%m-%d")}
    else:
        item = {"id": max([r["id"] for r in DEMO_KNOWLEDGE_BASE], default=0) + 1, **item,
                "updated_at": datetime.now().strftime("%Y-%m-%d")}
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
    item["updated_at"] = datetime.now().strftime("%Y-%m-%d")
    if result is None:
        target.update(item)
    item = {"id": rule_id, **item}
    write_audit_log("knowledge_base", rule_id, "修改", before=before, after=item)
    return jsonify({"status": "success", "message": "條文更新成功！", "data": item}), 200

# ==========================================
# 13. 學生專區統一入口連結 API (/api/links)
#     連結網址集中存放於 links.json，後台可新增/修改/刪除
# ==========================================

LINKS_FILE = os.getenv("LINKS_FILE", os.path.join(os.path.dirname(os.path.abspath(__file__)), "links.json"))
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
@write_roles_required("管理員", "教職員")
def manage_quick_links():
    if request.method == "GET":
        data = load_quick_links()
        return jsonify({"status": "success", "categories": data["categories"], "data": data["links"]}), 200
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

@app.route("/api/departments", methods=["GET"])
def list_departments_with_intro():
    """科系清單與簡介 (一般性介紹，非正式招生文宣)；不需要登入，給訪客/新生參考用"""
    rows = fetch_db_rows("SELECT dept_id, dept_name, college_name FROM departments ORDER BY college_name, dept_id")
    if rows is None:
        rows = DEMO_DEPARTMENTS
    data = [{**r, **DEPARTMENT_INTRO.get(r["dept_id"], {"intro": "", "highlights": [], "careers": []})} for r in rows]
    return jsonify({"status": "success", "data": data}), 200

# 訪客/新生常見問題 (FAQ)：一般性說明，金額/名額/時程等以官網正式公告與各承辦單位回覆為準
VISITOR_FAQ = [
    {"category": "入學方式", "q": "五專要怎麼考進來？有哪些入學管道？",
     "a": "主要管道有甄選入學、申請入學與獨招等，各管道名額與資格每年公告略有不同，請以官網「招生專區」當年度公告為準，或電洽招生組確認。"},
    {"category": "入學方式", "q": "可以轉系嗎？", "a": "在學期間若想轉系，需在學校公告的申請期間提出，並符合轉入科系的名額與資格條件，請洽教務處註冊組。"},
    {"category": "學費與獎助", "q": "學雜費大概多少？有沒有減免？",
     "a": "學雜費會因科系與學年度公告而不同，實際金額請以註冊繳費通知為準；符合條件可申請學雜費減免、清寒助學金或市府/勞動部等政府補助，入學後可在本系統「獎助學金」頁面看到比對結果。"},
    {"category": "學費與獎助", "q": "有哪些獎學金可以申請？",
     "a": "校內有學業優秀獎學金、清寒助學金、專業證照獎勵金、工讀助學金等；另外還有臺北市希望助學金、勞動部青年就業讚計畫等政府管道，登入學生帳號後系統會自動比對資格。"},
    {"category": "宿舍", "q": "一定要住宿舍嗎？宿舍怎麼申請？",
     "a": "宿舍非強制，有需要可線上申請，床位依通勤距離與身分排序分配；申請與進度查詢需用學生帳號登入「宿舍與總務申請」頁面。"},
    {"category": "宿舍", "q": "宿舍安全與門禁怎麼管理？",
     "a": "校內宿舍設有門禁時間與晚歸登記機制，生活輔導組會協助處理住宿相關生活問題，實際門禁時間與規定請洽宿舍服務台。"},
    {"category": "交通", "q": "學校怎麼去？附近有什麼大眾運輸？",
     "a": "可在本系統登入後查看「天氣與交通」頁面，會顯示學校地址與大眾運輸建議路線；也可以直接用 Google 地圖搜尋學校名稱規劃路線。"},
    {"category": "證照與學分", "q": "有證照可以抵免學分嗎？",
     "a": "目前已開放多益 (TOEIC) 550 分以上、全民英檢中高級複試通過者，可申請抵免基礎英文(一)(二) 共 4 學分，其他抵免規則請洽教務處註冊組或通識教育中心最新公告。"},
    {"category": "聯絡窗口", "q": "有問題要找誰？要怎麼聯絡學校？",
     "a": "可以直接打學校總機 (02)2632-1181，請總機轉接相關單位（招生組、教務處、學務處等），或是先用本系統的 AI 小幫手問問看，常見的校務問題多半能立即得到答案。"},
]

@app.route("/api/faq", methods=["GET"])
def list_visitor_faq():
    """訪客/新生常見問題，不需要登入"""
    return jsonify({"status": "success", "data": VISITOR_FAQ}), 200

def _fmt(value):
    return int(value) if float(value).is_integer() else value

# 【功能：獎助學金資格比對】每個條件 (年級、科系、身分、GPA、操行、前學期不及格) 逐項比對；硬性條件不符 = 不符合，只差成績 = 部分符合
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

# 【功能：獎助學金資格比對】讀取學生資料後，對每一項獎學金呼叫 evaluate_scholarship，依符合程度與截止日排序
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
    scholarships = preferences.scope_filter(load_scholarships(), lambda s: _split_list(s.get("departments")))
    results = [evaluate_scholarship(s, profile, fail_info, dept_names, today, is_parent) for s in scholarships]
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

# ==========================================
# 11i. 獎學金符合資格 / 學業預警 Email 推播 (功能 6 延伸)
#      後台按鈕手動觸發 (比照缺曠通知)，寄給學生本人；家長需本人開啟「家長預警授權」才會一併收到。
#      同一件事 (同一筆獎學金 / 同一次預警等級) 只會通知一次，直到比對結果改變才會再寄一次。
# ==========================================

NOTIFY_SCHOLARSHIP_SUBJECT = "【康寧大學】您有符合資格的獎助學金"
NOTIFY_WARNING_SUBJECT = "【康寧大學】學業預警通知"

def find_parent_account(student_id):
    """該學生綁定的家長帳號 (username/full_name)；查無回傳 None"""
    rows = fetch_db_rows("SELECT username, full_name FROM users WHERE role = '家長' AND student_id = %s LIMIT 1", (student_id,))
    if rows:
        return rows[0]
    return next(({"username": u["username"], "full_name": u["full_name"]} for u in DEMO_USERS
                 if u["role"] == "家長" and u.get("student_id") == student_id), None)

def already_notified(student_id, notify_type, ref_key, recipient_role):
    rows = fetch_db_rows(
        "SELECT 1 FROM notification_log WHERE student_id=%s AND notify_type=%s AND ref_key=%s AND recipient_role=%s",
        (student_id, notify_type, ref_key, recipient_role))
    if rows is not None:
        return bool(rows)
    return any(n["student_id"] == student_id and n["notify_type"] == notify_type
               and n["ref_key"] == ref_key and n["recipient_role"] == recipient_role for n in DEMO_NOTIFICATION_LOG)

def mark_notified(student_id, notify_type, ref_key, recipient_role):
    saved = db_execute(
        "INSERT IGNORE INTO notification_log (student_id, notify_type, ref_key, recipient_role) VALUES (%s, %s, %s, %s)",
        (student_id, notify_type, ref_key, recipient_role))
    if saved is None:
        DEMO_NOTIFICATION_LOG.append({"student_id": student_id, "notify_type": notify_type, "ref_key": ref_key,
                                       "recipient_role": recipient_role, "sent_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")})

def _send_once(mailer, to_addr, subject, body, student_id, kind, failed):
    """寄送失敗不中斷整批流程，記下來讓後台顯示哪幾位失敗"""
    try:
        mailer.send(to_addr, subject, body)
        return True
    except Exception as e:
        failed.append({"student_id": student_id, "type": kind, "error": str(e)})
        return False

def _notify_once(mailer, sid, addr, all_ref_keys, notify_type, recipient_role, subject, body_template, failed):
    """只對『這個人還沒被通知過』的 ref_key 寄一封信 (多筆合併成一封)；全部成功才記錄已通知。
    回傳 1 (有寄出) 或 0 (沒有新項目可通知)，方便外層直接加總計數。"""
    new_keys = [k for k in all_ref_keys if not already_notified(sid, notify_type, k, recipient_role)]
    if not new_keys:
        return 0
    body = body_template.format(n=len(new_keys))
    if not _send_once(mailer, addr, subject, body, sid, notify_type, failed):
        return 0
    for k in new_keys:
        mark_notified(sid, notify_type, k, recipient_role)
    return 1

@app.route("/api/admin/notify/scholarship-warning", methods=["POST"])
@role_required("管理員", "教職員")
def notify_scholarship_and_warning():
    """一鍵比對全校學生目前『符合資格的獎助學金』與『學業預警』，寄信給學生本人；
    家長只有在該學生開啟「家長預警授權」時才會一併收到，且信件內容不含成績等個資，只請登入查看。"""
    today = datetime.now().date()
    dept_names = department_names()
    scholarships = load_scholarships()
    mailer = get_mailer()
    sent = {"scholarship": {"student": 0, "parent": 0}, "early_warning": {"student": 0, "parent": 0}}
    skipped_no_consent = 0
    failed = []

    for s in list_students():
        sid = s["student_id"]
        privacy = load_privacy_settings(sid)
        parent = find_parent_account(sid)
        consent_parent = bool(parent) and bool(privacy["parent_alert_consent"])

        # ---- 獎學金符合資格比對 ----
        profile = load_scholarship_profile(sid, today)
        if profile:
            fail_info = latest_semester_fails(sid)
            eligible_ids = [sch["id"] for sch in scholarships
                             if evaluate_scholarship(sch, profile, fail_info, dept_names, today, False)["status"] == "符合"
                             and (datetime.strptime(sch["deadline"], "%Y-%m-%d").date() - today).days >= 0]
            if eligible_ids:
                sent["scholarship"]["student"] += _notify_once(
                    mailer, sid, campus_email(sid), eligible_ids, "scholarship", "student", NOTIFY_SCHOLARSHIP_SUBJECT,
                    "系統比對到您有 {n} 項新符合資格的獎助學金，請登入系統查看詳情並把握申請期限。", failed)
                if consent_parent:
                    sent["scholarship"]["parent"] += _notify_once(
                        mailer, sid, campus_email(parent["username"]), eligible_ids, "scholarship", "parent", NOTIFY_SCHOLARSHIP_SUBJECT,
                        "系統比對到您子女有 {n} 項新符合資格的獎助學金，建議提醒子女登入系統查看並把握申請期限。", failed)
                elif parent and not privacy["parent_alert_consent"]:
                    skipped_no_consent += 1

        # ---- 學業預警 ----
        warning = compute_early_warning(sid)
        if warning["warning_level"] in ("warning", "critical"):
            ref_keys = [f"{warning['warning_level']}:{warning['semester']}"]
            sent["early_warning"]["student"] += _notify_once(
                mailer, sid, campus_email(sid), ref_keys, "early_warning", "student", NOTIFY_WARNING_SUBJECT,
                "系統偵測到您本學期學業狀況出現警示，請登入系統查看詳情，並儘速與導師預約晤談。", failed)
            if consent_parent:
                sent["early_warning"]["parent"] += _notify_once(
                    mailer, sid, campus_email(parent["username"]), ref_keys, "early_warning", "parent", NOTIFY_WARNING_SUBJECT,
                    "系統偵測到您子女本學期學業狀況出現警示，請登入系統查看詳情，或與導師聯繫了解狀況。", failed)
            elif parent and not privacy["parent_alert_consent"]:
                skipped_no_consent += 1

    total = sum(v for d in sent.values() for v in d.values())
    if total == 0 and not failed:
        message = "目前沒有需要通知的新項目"
    else:
        where = "已寄出" if mailer.mode == "smtp" else "demo 模式：已印在伺服器終端機"
        message = (f"{where}，獎學金通知 學生 {sent['scholarship']['student']} / 家長 {sent['scholarship']['parent']} 封；"
                   f"預警通知 學生 {sent['early_warning']['student']} / 家長 {sent['early_warning']['parent']} 封")
        if skipped_no_consent:
            message += f"；{skipped_no_consent} 位家長因尚未開啟授權而跳過"
        if failed:
            message += f"；{len(failed)} 封寄送失敗"
    return jsonify({"status": "success", "message": message, "sent": sent,
                     "skipped_no_consent": skipped_no_consent, "failed": failed, "notify_mode": mailer.mode}), 200
# 8c. 學生證照與檢定成績管理 API (/api/certificates)
#     學生自行維護個人證照紀錄 (如勞動部技術士技能檢定成績單)；
#     支援上傳 PDF 檔、證照照片；支援勞動部成績單與官方查驗網站連結。
# ==========================================

def teacher_can_view_student(student_id):
    """老師只能查看自己擔任導師班級的學生"""
    advised = session.get("advised_class")
    student = _load_student_info(student_id)
    return bool(advised and student and student.get("class_name") == advised)

def portfolio_row_dates(row):
    """證照／競賽資料列：日期欄位轉成 YYYY-MM-DD 字串"""
    return {k: (v.strftime("%Y-%m-%d %H:%M:%S") if k == "created_at" and hasattr(v, "strftime")
                else _date_str(v)) for k, v in row.items()}

@app.route("/api/certificates", methods=["GET", "POST"])
@login_required
def manage_certificates():
    global DEMO_CERTIFICATES
    role = session.get("role")
    session_student_id = session.get("student_id")

    if request.method == "GET":
        requested_id = request.args.get("student_id")
        if role == "學生":
            target_student_id = session_student_id
        elif role == "家長":
            if requested_id and requested_id != session_student_id:
                return jsonify({"status": "error", "message": "無權查詢非本人子女之證照資料"}), 403
            target_student_id = session_student_id
        elif role in ("教職員", "管理員", "老師"):
            target_student_id = requested_id
            if not target_student_id:
                return jsonify({"status": "error", "message": "請提供欲查詢之學號 (student_id)"}), 400
            if role == "老師" and not teacher_can_view_student(target_student_id):
                return jsonify({"status": "error", "message": "老師僅能查詢自己班級學生的資料"}), 403
        else:
            return jsonify({"status": "error", "message": "此身分無權查詢證照資料"}), 403

        if not target_student_id:
            return jsonify({"status": "error", "message": "查無綁定學號，請確認登入身分"}), 400

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM certificates WHERE student_id = %s ORDER BY issue_date DESC", (target_student_id,))
                rows = [portfolio_row_dates(r) for r in cursor.fetchall()]
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "data": rows}), 200
            except Exception:
                if conn: conn.close()

        rows = [c for c in DEMO_CERTIFICATES if c["student_id"] == target_student_id]
        return jsonify({"status": "success", "data": rows}), 200

    # POST：只有學生本人能新增自己的證照紀錄，不可代填其他學號
    if role != "學生":
        return jsonify({"status": "error", "message": "僅學生本人可新增證照紀錄"}), 403
    if not session_student_id:
        return jsonify({"status": "error", "message": "查無綁定學號，請確認登入身分"}), 400

    # 同時相容 FormData (檔案上傳) 與純 JSON 請求
    if request.content_type and "multipart/form-data" in request.content_type:
        data = request.form
    else:
        data = request.get_json(silent=True) or {}

    # 長度上限對齊資料庫欄位 (varchar(100)/varchar(50)/varchar(255))，避免貼上過長文字時
    # DB 寫入失敗卻被 except 吃掉、誤回「新增成功」但資料其實沒存進去
    cert_name = str(data.get("cert_name", "")).strip()[:100]
    issuing_org = (str(data.get("issuing_org", "")).strip() or "勞動部勞動力發展署技能檢定中心")[:100]
    cert_number = str(data.get("cert_number", "")).strip()[:50]
    issue_date = str(data.get("issue_date", "")).strip()
    cert_status = (str(data.get("cert_status", "")).strip() or "及格發證")[:50]
    verify_url = str(data.get("verify_url", "")).strip()[:255]
    raw_theory = data.get("theory_score")
    raw_practical = data.get("practical_score")

    # 針對勞動部相關證照與成績單，若未指定網址則自動帶入官方即時線上查詢通道
    if not verify_url and ("勞動部" in issuing_org or "技能檢定" in cert_name or "技術士" in cert_name):
        verify_url = "https://eservice.wdasec.gov.tw/WWW/C101Q"

    if not cert_name or not issue_date:
        return jsonify({"status": "error", "message": "證照名稱與取得日期為必填"}), 400

    try:
        theory_score = float(raw_theory) if raw_theory not in (None, "") else None
        practical_score = float(raw_practical) if raw_practical not in (None, "") else None
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "成績須為數字"}), 400

    # 處理上傳檔案 (PDF 檔或照片圖檔)
    file_obj = request.files.get("file") or request.files.get("cert_file")
    file_path, file_name, file_type = save_uploaded_file(file_obj, prefix="cert") if file_obj else (None, None, None)

    conn = get_db_connection()
    new_id = None
    if conn:
        try:
            cursor = conn.cursor()
            # 優先嘗試寫入包含擴充欄位之資料表
            try:
                sql = """
                    INSERT INTO certificates 
                    (student_id, cert_name, issuing_org, cert_number, theory_score, practical_score, issue_date, cert_status, verify_url, file_path, file_name, file_type) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (session_student_id, cert_name, issuing_org, cert_number, theory_score, practical_score, issue_date, cert_status, verify_url, file_path, file_name, file_type))
                conn.commit()
                new_id = cursor.lastrowid
            except Exception:
                # 若尚未擴充欄位則平穩退回基礎欄位
                sql = "INSERT INTO certificates (student_id, cert_name, issuing_org, cert_number, theory_score, practical_score, issue_date) VALUES (%s, %s, %s, %s, %s, %s, %s)"
                cursor.execute(sql, (session_student_id, cert_name, issuing_org, cert_number, theory_score, practical_score, issue_date))
                conn.commit()
                new_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    if not new_id:
        new_id = max([c["cert_id"] for c in DEMO_CERTIFICATES], default=0) + 1

    DEMO_CERTIFICATES.append({
        "cert_id": new_id,
        "student_id": session_student_id,
        "cert_name": cert_name,
        "issuing_org": issuing_org,
        "cert_number": cert_number,
        "theory_score": theory_score,
        "practical_score": practical_score,
        "cert_status": cert_status,
        "verify_url": verify_url,
        "file_path": file_path,
        "file_name": file_name,
        "file_type": file_type,
        "issue_date": issue_date,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    return jsonify({"status": "success", "message": "證照紀錄新增成功！", "id": new_id}), 201

@app.route("/api/certificates/<int:cert_id>", methods=["DELETE"])
@login_required
def delete_certificate(cert_id):
    global DEMO_CERTIFICATES
    role = session.get("role")
    session_student_id = session.get("student_id")

    if role != "學生":
        return jsonify({"status": "error", "message": "僅學生本人可刪除證照紀錄"}), 403

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT student_id, file_path FROM certificates WHERE cert_id = %s", (cert_id,))
            row = cursor.fetchone()
            if not row:
                cursor.close(); conn.close()
                return jsonify({"status": "error", "message": "找不到該筆證照紀錄"}), 404
            if row["student_id"] != session_student_id:
                cursor.close(); conn.close()
                return jsonify({"status": "error", "message": "無權刪除非本人之證照紀錄"}), 403
            cursor.execute("DELETE FROM certificates WHERE cert_id = %s", (cert_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "message": "證照紀錄已刪除！"}), 200
        except Exception:
            if conn: conn.close()

    target = next((c for c in DEMO_CERTIFICATES if c["cert_id"] == cert_id), None)
    if not target:
        return jsonify({"status": "error", "message": "找不到該筆證照紀錄"}), 404
    if target["student_id"] != session_student_id:
        return jsonify({"status": "error", "message": "無權刪除非本人之證照紀錄"}), 403
    DEMO_CERTIFICATES = [c for c in DEMO_CERTIFICATES if c["cert_id"] != cert_id]
    return jsonify({"status": "success", "message": "證照紀錄已刪除！"}), 200

# ==========================================
# 8d. 學生比賽獲獎與榮譽獎狀管理 API (/api/competitions)
#     學生自行維護個人比賽獎狀與現場照片；
#     支援上傳 PDF 檔與比賽照片；與證照功能並存同一個畫面。
# ==========================================

@app.route("/api/competitions", methods=["GET", "POST"])
@login_required
def manage_competitions():
    global DEMO_COMPETITIONS
    role = session.get("role")
    session_student_id = session.get("student_id")

    if request.method == "GET":
        requested_id = request.args.get("student_id")
        if role == "學生":
            target_student_id = session_student_id
        elif role == "家長":
            if requested_id and requested_id != session_student_id:
                return jsonify({"status": "error", "message": "無權查詢非本人子女之比賽獲獎資料"}), 403
            target_student_id = session_student_id
        elif role in ("教職員", "管理員", "老師"):
            target_student_id = requested_id
            if not target_student_id:
                return jsonify({"status": "error", "message": "請提供欲查詢之學號 (student_id)"}), 400
            if role == "老師" and not teacher_can_view_student(target_student_id):
                return jsonify({"status": "error", "message": "老師僅能查詢自己班級學生的資料"}), 403
        else:
            return jsonify({"status": "error", "message": "此身分無權查詢比賽獲獎資料"}), 403

        if not target_student_id:
            return jsonify({"status": "error", "message": "查無綁定學號，請確認登入身分"}), 400

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM competitions WHERE student_id = %s ORDER BY award_date DESC", (target_student_id,))
                rows = [portfolio_row_dates(r) for r in cursor.fetchall()]
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "data": rows}), 200
            except Exception:
                if conn: conn.close()

        rows = [c for c in DEMO_COMPETITIONS if c["student_id"] == target_student_id]
        return jsonify({"status": "success", "data": rows}), 200

    # POST：只有學生本人能新增自己的比賽紀錄
    if role != "學生":
        return jsonify({"status": "error", "message": "僅學生本人可新增比賽獲獎紀錄"}), 403
    if not session_student_id:
        return jsonify({"status": "error", "message": "查無綁定學號，請確認登入身分"}), 400

    if request.content_type and "multipart/form-data" in request.content_type:
        data = request.form
    else:
        data = request.get_json(silent=True) or {}

    # 長度上限對齊資料庫欄位 (varchar(150)/varchar(100))，理由同證照新增那段
    competition_name = str(data.get("competition_name", "")).strip()[:150]
    award_title = str(data.get("award_title", "")).strip()[:100]
    organizer = (str(data.get("organizer", "")).strip() or "主辦單位")[:100]
    project_name = str(data.get("project_name", "")).strip()[:150]
    award_date = str(data.get("award_date", "")).strip()

    if not competition_name or not award_title or not award_date:
        return jsonify({"status": "error", "message": "比賽名稱、獲獎獎項與得獎日期為必填"}), 400

    # 處理上傳檔案 (PDF 獎狀或照片圖檔)
    file_obj = request.files.get("file") or request.files.get("award_file")
    file_path, file_name, file_type = save_uploaded_file(file_obj, prefix="award") if file_obj else (None, None, None)

    conn = get_db_connection()
    new_id = None
    if conn:
        try:
            cursor = conn.cursor()
            sql = """
                INSERT INTO competitions 
                (student_id, competition_name, award_title, organizer, project_name, award_date, file_path, file_name, file_type) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (session_student_id, competition_name, award_title, organizer, project_name, award_date, file_path, file_name, file_type))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    if not new_id:
        new_id = max([c["comp_id"] for c in DEMO_COMPETITIONS], default=0) + 1

    DEMO_COMPETITIONS.append({
        "comp_id": new_id,
        "student_id": session_student_id,
        "competition_name": competition_name,
        "award_title": award_title,
        "organizer": organizer,
        "project_name": project_name,
        "award_date": award_date,
        "file_path": file_path,
        "file_name": file_name,
        "file_type": file_type,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

    return jsonify({"status": "success", "message": "比賽獲獎紀錄新增成功！", "id": new_id}), 201

@app.route("/api/competitions/<int:comp_id>", methods=["DELETE"])
@login_required
def delete_competition(comp_id):
    global DEMO_COMPETITIONS
    role = session.get("role")
    session_student_id = session.get("student_id")

    if role != "學生":
        return jsonify({"status": "error", "message": "僅學生本人可刪除比賽獲獎紀錄"}), 403

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT student_id FROM competitions WHERE comp_id = %s", (comp_id,))
            row = cursor.fetchone()
            if not row:
                cursor.close(); conn.close()
                return jsonify({"status": "error", "message": "找不到該筆比賽紀錄"}), 404
            if row["student_id"] != session_student_id:
                cursor.close(); conn.close()
                return jsonify({"status": "error", "message": "無權刪除非本人之比賽紀錄"}), 403
            cursor.execute("DELETE FROM competitions WHERE comp_id = %s", (comp_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "message": "比賽獲獎紀錄已刪除！"}), 200
        except Exception:
            if conn: conn.close()

    target = next((c for c in DEMO_COMPETITIONS if c["comp_id"] == comp_id), None)
    if not target:
        return jsonify({"status": "error", "message": "找不到該筆比賽紀錄"}), 404
    if target["student_id"] != session_student_id:
        return jsonify({"status": "error", "message": "無權刪除非本人之比賽紀錄"}), 403
    DEMO_COMPETITIONS = [c for c in DEMO_COMPETITIONS if c["comp_id"] != comp_id]
    return jsonify({"status": "success", "message": "比賽獲獎紀錄已刪除！"}), 200

# ==========================================
# 11i. 學校行事曆 (/api/school-calendar)
#      資料由程式從教務處行事曆 PDF 抓取 (school_calendar/sync.py)，存於 school_calendar.json；
#      點開事項時附上對應的申辦流程、系統連結與承辦單位 (school_calendar/actions.py)
# ==========================================

def _calendar_event_detail(ev, today, checklists, links, offices):
    start = datetime.strptime(ev["start_date"], "%Y-%m-%d").date()
    end = datetime.strptime(ev["end_date"], "%Y-%m-%d").date()
    if end < today:
        status = "past"
    elif start <= today:
        status = "ongoing"
    else:
        status = "upcoming"
    actions = match_calendar_actions(ev["title"])
    return {
        **ev,
        "status": status,
        "days_to_end": (end - today).days,
        "days_to_start": (start - today).days,
        "checklists": [
            {k: c.get(k) for k in ("item_id", "business_name", "required_docs", "steps_json", "office_location",
                                   "contact_phone", "office_hours", "form_download_url")}
            for cid in actions["checklist_ids"] for c in checklists if c["item_id"] == cid
        ],
        # 網址未確定 ("#") 的連結不列出，避免點了沒反應
        "links": [{"title": l["title"], "url": l["url"]}
                  for lid in actions["link_ids"] for l in links if l["id"] == lid and l.get("url") not in (None, "", "#")],
        "offices": [o for name in actions["offices"] for o in offices if o["office"] == name],
        "tips": actions["tips"]
    }

@app.route("/api/school-calendar", methods=["GET"])
def get_school_calendar():
    """學年度行事曆 (公開)；可用 ?date=YYYY-MM-DD 模擬今天日期"""
    try:
        today = datetime.strptime(request.args["date"], "%Y-%m-%d").date() if request.args.get("date") else datetime.now().date()
    except ValueError:
        return jsonify({"status": "error", "message": "date 格式須為 YYYY-MM-DD"}), 400
    data = school_calendar_sync.load()
    if not data:
        return jsonify({"status": "error", "message": "尚未抓取學校行事曆，請管理員於後台執行更新"}), 404
    checklists = load_checklists()
    links = load_quick_links().get("links", [])
    events = [_calendar_event_detail(ev, today, checklists, links, CAMPUS_CONTACT_DIRECTORY) for ev in data["events"]]
    return jsonify({
        "status": "success",
        "today": today.isoformat(),
        "academic_year": data["academic_year"],
        "source_url": data["source_url"],
        "fetched_at": data["fetched_at"],
        "events": events
    }), 200

@app.route("/api/admin/school-calendar/sync", methods=["POST"])
@role_required("管理員", "教職員")
def sync_school_calendar():
    """重新從教務處網站抓取最新學年度行事曆 PDF"""
    try:
        data = school_calendar_sync.sync()
    except ImportError:
        return jsonify({"status": "error", "message": "伺服器尚未安裝 pypdf，請執行 pip install pypdf"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": f"抓取失敗，已保留原本的行事曆：{e}"}), 502
    return jsonify({
        "status": "success",
        "message": f"已更新 {data['academic_year']} 學年度行事曆，共 {len(data['events'])} 筆事項",
        "academic_year": data["academic_year"],
        "fetched_at": data["fetched_at"],
        "source_url": data["source_url"]
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

def current_attendance_semester():
    term = current_academic_term(datetime.now().date())
    return f"{term['academic_year']}-{term['semester']}"


def course_semester_hours():
    rows = fetch_db_rows("SELECT course_name, semester_hours FROM course_map WHERE semester_hours IS NOT NULL")
    return {r["course_name"]: r["semester_hours"] for r in rows or []}


@app.route("/api/student/attendance", methods=["GET"])
def get_my_attendance():
    """登入學生 (或家長) 的缺曠課摘要與扣考警告"""
    student_id = current_student_id()
    if not student_id:
        return jsonify({"status": "error", "message": "請先登入學生帳號"}), 401
    records = get_attendance_source().list_records(student_id)
    summary = summarize_attendance(records, course_weekly_hours(), course_semester_hours(), current_attendance_semester())
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
        from decimal import Decimal, InvalidOperation
        hours = data.get("hours")
        if hours not in (None, ""):
            try:
                hours = Decimal(str(hours))
                if not hours.is_finite() or not 0 < hours <= 24: raise ValueError()
                hours = float(hours)
            except (InvalidOperation, ValueError):
                return jsonify({"status": "error", "message": "缺課時數須介於 0 與 24 小時之間"}), 400
        else: hours = None
        exam_policy = data.get("exam_policy", "ordinary")
        if exam_policy not in ("ordinary", "half", "exempt", "manual"):
            return jsonify({"status": "error", "message": "無效的扣考計算分類"}), 400
        record = source.add_record(student_id, record_date, course_name, record_type, hours, exam_policy)
    except Exception as e:
        return jsonify({"status": "error", "message": f"新增失敗：{e}"}), 500
    write_audit_log("attendance_records", record.get("id", student_id), "新增", after=record)
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

# ---------- Moodle 數位學習平台串接 (作業與繳交狀態) ----------
#   學生輸入 Moodle 帳密 → 換成權杖後只存權杖；儀表板開啟時同步 (moodle_sync/assignments.py 有 3 分鐘快取)

MOODLE_URL = os.getenv("MOODLE_URL", "https://moodle.ukn.edu.tw").rstrip("/")
MOODLE_LINKS = MoodleLinkStore(get_db_connection)

def moodle_error_message(error):
    if not error:
        return None
    if error.code == "invalidtoken":
        return "Moodle 連結已失效 (可能改過密碼)，請重新連結"
    if error.code == "network":
        return "暫時連不上 Moodle，顯示的是上次同步的資料"
    return f"Moodle 同步失敗：{error}"

def moodle_status_for(student_id):
    link = MOODLE_LINKS.get(student_id)
    if not link:
        return {"linked": False, "can_link": session.get("role") == "學生"}
    return {"linked": True, "can_link": session.get("role") == "學生",
            "moodle_username": link["moodle_username"], "moodle_fullname": link.get("moodle_fullname")}

@app.route("/api/student/moodle/link", methods=["POST", "DELETE"])
@role_required("學生")
def link_moodle():
    """POST：用 Moodle 帳密換權杖並保存 (不保存密碼)；DELETE：解除連結"""
    student_id = session.get("student_id")
    if request.method == "DELETE":
        MOODLE_LINKS.delete(student_id)
        clear_moodle_cache(student_id)
        return jsonify({"status": "success", "message": "已解除 Moodle 連結"}), 200

    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    if not username or not password:
        return jsonify({"status": "error", "message": "請輸入 Moodle 帳號與密碼"}), 400
    try:
        token = get_moodle_token(MOODLE_URL, username, password)
        info = MoodleClient(MOODLE_URL, token).site_info()
    except MoodleError as e:
        status = 401 if e.code == "invalidlogin" else 502
        return jsonify({"status": "error", "message": str(e)}), status
    MOODLE_LINKS.save(student_id, info.get("username") or username, info.get("fullname"), token)
    clear_moodle_cache(student_id)
    return jsonify({"status": "success", "message": f"已連結 Moodle 帳號：{info.get('fullname') or username}"}), 200

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
    moodle = moodle_status_for(student_id)
    if moodle["linked"]:
        link = MOODLE_LINKS.get(student_id)
        items, synced_at, error = get_cached_assignments(student_id, MOODLE_URL, link["token"], now,
                                                         force=request.args.get("refresh_moodle") == "1")
        source = MoodleMergedSource(source, items)
        moodle.update({"synced_at": synced_at, "count": len(items), "error": moodle_error_message(error)})
    class_name = student_class_name(student_id)
    data = build_dashboard(source, class_name, student_id, now)
    data["moodle"] = moodle

    attendance = summarize_attendance(get_attendance_source().list_records(student_id), course_weekly_hours(), course_semester_hours(), current_attendance_semester())
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
# 15b. 線上請假：學生送出假單 → 導師 (或生輔組教職員) 審核 → 通知學生
#      老師只能審核自己導師班學生的假單；教職員/管理員可審核全校
# ==========================================

LEAVE_TYPES = ("病假", "事假", "公假", "喪假", "生理假")
LEAVE_REVIEW_RESULTS = ("已核准", "已退回")
LEAVE_REVIEW_ROLES = ("老師", "教職員", "管理員")
LEAVE_NOTIFY_SUBJECT = "【康寧大學】請假審核結果通知"
LEAVE_NOTIFY_BODY = "您的請假申請已有審核結果，請登入系統查看"

def reviewable_student_ids():
    """目前登入者可審核的學號；None 代表全校"""
    if session.get("role") == "老師":
        return _get_class_student_ids(session.get("advised_class") or "")
    return None

def notify_leave_result(student_id):
    """通知學生審核結果 (與缺曠通知相同，信件不含假別、日期等個資)；寄送失敗不影響審核"""
    try:
        get_mailer().send(campus_email(student_id), LEAVE_NOTIFY_SUBJECT, LEAVE_NOTIFY_BODY)
        return True
    except Exception:
        return False

@app.route("/api/student/leave-requests", methods=["POST"])
@role_required("學生")
def submit_leave_request():
    data = request.get_json(silent=True) or {}
    leave_type = str(data.get("leave_type", "")).strip()
    start_date = str(data.get("start_date", "")).strip()
    end_date = str(data.get("end_date", "")).strip() or start_date
    periods = str(data.get("periods", "")).strip() or None
    reason = str(data.get("reason", "")).strip()

    if leave_type not in LEAVE_TYPES:
        return jsonify({"status": "error", "message": f"假別須為 {'/'.join(LEAVE_TYPES)}"}), 400
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"status": "error", "message": "日期格式須為 YYYY-MM-DD"}), 400
    if end < start:
        return jsonify({"status": "error", "message": "結束日期不可早於開始日期"}), 400
    if (end - start).days > 30:
        return jsonify({"status": "error", "message": "單次請假不可超過 30 天，長期請假請洽生輔組"}), 400
    if periods and not re.fullmatch(r"\d{1,2}(-\d{1,2})?", periods):
        return jsonify({"status": "error", "message": "節次格式例如 3 或 3-4"}), 400
    if not reason:
        return jsonify({"status": "error", "message": "請填寫請假事由"}), 400

    try:
        record = get_dashboard_source().add_leave_request(
            session["student_id"], leave_type, start_date, end_date, periods, reason[:255])
    except Exception as e:
        return jsonify({"status": "error", "message": f"送出失敗：{e}"}), 500
    return jsonify({"status": "success", "message": "假單已送出，等待導師審核", "data": record}), 201

@app.route("/api/student/leave-requests/<int:leave_id>", methods=["DELETE"])
@role_required("學生")
def cancel_leave_request(leave_id):
    if not get_dashboard_source().cancel_leave_request(leave_id, session["student_id"]):
        return jsonify({"status": "error", "message": "只能撤回自己尚未審核的假單"}), 400
    return jsonify({"status": "success", "message": "假單已撤回"}), 200

@app.route("/api/leave-requests/review", methods=["GET"])
@role_required(*LEAVE_REVIEW_ROLES)
def list_leave_requests_for_review():
    from campus import admin_cases
    if admin_cases.is_dorm_staff():
        return jsonify({"status": "error", "message": "住宿管理帳號不能審核一般假單"}), 403
    status = request.args.get("status", "待審核")
    if status == "all":
        status = None
    elif status not in ("待審核",) + LEAVE_REVIEW_RESULTS:
        return jsonify({"status": "error", "message": "status 須為 待審核/已核准/已退回/all"}), 400
    rows = get_dashboard_source().list_leave_requests_for_review(reviewable_student_ids(), status)
    names = {s["student_id"]: s["full_name"] for s in list_students()}
    return jsonify({
        "status": "success",
        "scope": session.get("advised_class") if session.get("role") == "老師" else "全校",
        "data": [{**r, "full_name": names.get(r["student_id"], "")} for r in rows]
    }), 200

@app.route("/api/leave-requests/<int:leave_id>/review", methods=["POST"])
@role_required(*LEAVE_REVIEW_ROLES)
def review_leave_request(leave_id):
    from campus import admin_cases
    if admin_cases.is_dorm_staff():
        return jsonify({"status": "error", "message": "住宿管理帳號不能審核一般假單"}), 403
    data = request.get_json(silent=True) or {}
    result = str(data.get("status", "")).strip()
    note = str(data.get("review_note", "")).strip()[:255]
    if result not in LEAVE_REVIEW_RESULTS:
        return jsonify({"status": "error", "message": "審核結果須為 已核准 或 已退回"}), 400
    if result == "已退回" and not note:
        return jsonify({"status": "error", "message": "退回假單請填寫原因，讓學生知道如何補件"}), 400

    source = get_dashboard_source()
    record = source.get_leave_request(leave_id)
    allowed = reviewable_student_ids()
    if not record or (allowed is not None and record["student_id"] not in allowed):
        return jsonify({"status": "error", "message": "找不到該假單或無權審核"}), 404
    if not source.review_leave_request(leave_id, result, note):
        return jsonify({"status": "error", "message": "此假單已審核過"}), 409

    write_audit_log("leave_requests", leave_id, "修改", before={"status": record["status"]},
                    after={"status": result, "review_note": note})
    notified = notify_leave_result(record["student_id"])
    return jsonify({
        "status": "success",
        "message": f"假單已{result[1:]}" + ("，已通知學生" if notified else "（通知寄送失敗）"),
        "data": source.get_leave_request(leave_id)
    }), 200

# ==========================================
# 12b. 老師 / 行政人員的待辦通知 (右上角鈴鐺)
#      即時從現有資料計算，不另外建資料表；審核、核准完就自動從清單消失
# ==========================================

@app.route("/api/staff/alerts", methods=["GET"])
@role_required("老師", "教職員", "管理員")
def staff_alerts():
    from campus import admin_cases, certificates, facilities, services
    role, advised = session.get("role"), session.get("advised_class")
    names = {s["student_id"]: s["full_name"] for s in list_students()}
    items = []

    if admin_cases.is_dorm_staff():
        for a in services.dorm_apps():
            if a['status'] == '進行中' and a['stage'] == 0:
                items.append({'key': f"dorm-{a['id']}", 'type': '宿舍', 'goto': 'tab-services',
                              'title': f"{a.get('student_name') or a['student_id']} 送出宿舍申請，等你審查",
                              'detail': f"{a.get('semester', '')} · {a.get('room_type', '')}",
                              'at': str(a.get('created_at', ''))[:16], 'due_date': ''})
        with admin_cases.store.lock:
            for c in admin_cases.cases():
                if c['office'] == '學生事務處／住宿管理' and admin_cases.can_manage(c) and c['status'] in ('待受理', '處理中', '重新送審'):
                    items.append({'key': f"admin-case-{c['id']}", 'type': '行政案件', 'goto': '/admin-workbench',
                                  'title': f"{c['student_name']}：{c['title']}",
                                  'detail': f"{c['office']} · {c['status']} · 期限 {c['due_date']}",
                                  'at': c['updated_at'], 'due_date': c['due_date']})
        return jsonify({"status": "success", "count": len(items), "data": items}), 200

    # 1. 待審核假單 (老師：導師班；行政人員：全校)
    for r in get_dashboard_source().list_leave_requests_for_review(reviewable_student_ids(), "待審核"):
        period = r["start_date"] + (f"～{r['end_date']}" if r.get("end_date") and r["end_date"] != r["start_date"] else "")
        items.append({"key": f"leave-{r['id']}", "type": "請假", "goto": "tab-home",
                      "title": f"{names.get(r['student_id'], r['student_id'])} 申請{r.get('leave_type') or '請假'}，等你審核",
                      "detail": f"{period} · {r.get('reason') or ''}", "at": str(r.get("created_at") or r["start_date"])[:16], "due_date": ""})

    # 2. 待審核證照 (老師：導師班；行政人員：全校)
    viewer = {"role": role, "advised_class": advised}
    for c in certificates.submissions():
        if c["status"] == "待審核" and certificates.can_review(viewer, c):
            items.append({"key": f"cert-{c['id']}", "type": "證照", "goto": "tab-certs",
                          "title": f"{c.get('student_name') or c['student_id']} 上傳{c.get('kind', '證照')}「{c['name']}」，等你確認",
                          "detail": c.get("class_name", ""), "at": str(c.get("created_at", ""))[:16], "due_date": ""})

    # 3. 導師班學業預警 (只有班導；學生沒有授權導師查看時不顯示)
    if role == "老師" and advised:
        from campus.common import all_students  # 含班級欄位 (list_students 只有學號與姓名)
        for s in all_students():
            if s.get("class_name") != advised or not load_privacy_settings(s["student_id"])["advisor_alert_consent"]:
                continue
            w = compute_early_warning(s["student_id"])
            if w["warning_level"] in ("warning", "critical"):
                items.append({"key": f"warning-{s['student_id']}", "type": "預警", "goto": "tab-warning",
                              "title": f"{s['full_name']}：學業{w['risk_level']}，建議找他談談",
                              "detail": f"{w['semester']} 學期不及格 {w['failed_credits']} / {w['current_credits']} 學分", "at": "", "due_date": ""})

    # 待追蹤關懷與未收齊回條沿用原功能的班級、作者範圍。
    from campus import counseling, messaging
    from datetime import date as _date
    today = _date.today().isoformat()
    scoped_ids = [s["student_id"] for s in counseling.all_students()
                  if role != "老師" or (advised and s.get("class_name") == advised)]
    for r in counseling.load_records(scoped_ids):
        if r["follow_up"] and not r["follow_up_done"] and r["follow_up_date"] and r["follow_up_date"] <= today:
            items.append({"key": f"care-{r['id']}", "type": "關懷", "goto": "tab-counseling",
                          "title": f"{names.get(r['student_id'], r['student_id'])}：關懷追蹤到期",
                          "detail": r["follow_up_date"], "at": r["follow_up_date"], "due_date": r["follow_up_date"]})
    for n in messaging.load_notices(sender_username=None if role == "管理員" else session["username"]):
        missing = len(n["recipients"]) - len(n.get("replies", {}))
        if n.get("reply_required") and missing:
            items.append({"key": f"receipt-{n['id']}", "type": "回條", "goto": "tab-notices",
                          "title": f"{n['title']}：{missing} 人尚未回覆",
                          "detail": n.get("due_date") or "未設定期限", "at": n["created_at"], "due_date": n.get("due_date") or ""})

    # 4. 行政人員：教室借用、宿舍申請
    if role in ("教職員", "管理員"):
        for b in facilities.bookings():
            if b["status"] == "審核中":
                items.append({"key": f"booking-{b['id']}", "type": "教室借用", "goto": "/admin",
                              "title": f"{b['applicant']} 借用 {b['room_name']}，等你審核",
                              "detail": f"{b['date']} 第 {b['period_start']}-{b['period_end']} 節 · {b.get('purpose', '')}",
                              "at": str(b.get("created_at", ""))[:16], "due_date": ""})
        for a in (services.dorm_apps() if services.can_manage_dorm({"role": role, "username": session["username"], "can_manage_dorm": session.get("can_manage_dorm")}) else []):
            if a["status"] == "進行中" and a["stage"] == 0:
                items.append({"key": f"dorm-{a['id']}", "type": "宿舍", "goto": "tab-services",
                              "title": f"{a.get('student_name') or a['student_id']} 送出宿舍申請，等你審查",
                              "detail": f"{a.get('semester', '')} · {a.get('room_type', '')}", "at": str(a.get("created_at", ""))[:16], "due_date": ""})

    if role in ("教職員", "管理員"):
        from campus import admin_cases
        with admin_cases.store.lock:
            for c in admin_cases.cases():
                if admin_cases.visible(c) and c['status'] in ('待受理', '處理中', '重新送審'):
                    items.append({'key': f"admin-case-{c['id']}", 'type': '行政案件', 'goto': '/admin-workbench',
                                  'title': f"{c['student_name']}：{c['title']}",
                                  'detail': f"{c['office']} · {c['status']} · 期限 {c['due_date']}", 'at': c['updated_at'], 'due_date': c['due_date']})
    return jsonify({"status": "success", "count": len(items), "data": items}), 200

# ==========================================
# 13. 校園生活新功能 (campus 套件)：行事曆月曆、選課檢查、證照審核、科上通知、租借、天氣、報表…
# ==========================================

import campus
from types import SimpleNamespace

campus.init_app(app, SimpleNamespace(
    users=DEMO_USERS,
    fetch_db_rows=fetch_db_rows,
    db_execute=db_execute,
    fetch_calendar_events=fetch_calendar_events,
    load_course_map=load_course_map,
    load_student_credits=load_student_credits,
    summarize_credits=summarize_credits,
    get_dashboard_source=get_dashboard_source,
    save_uploaded_file=save_uploaded_file,
    write_audit_log=write_audit_log,
    graduation_threshold=GRADUATION_CREDIT_THRESHOLD,
    students=DEMO_STUDENTS,
    checklists=DEMO_CHECKLISTS,
    deadlines=DEMO_DEADLINES,
    knowledge_base=DEMO_KNOWLEDGE_BASE,
    synonyms=DEMO_SYNONYMS,
    categories=DEMO_CATEGORIES,
    certificates=DEMO_CERTIFICATES,
    class_schedule=dashboard_demo.DEMO_CLASS_SCHEDULE,
    departments=DEMO_DEPARTMENTS,
))

# 我的科系與顯示範圍 (preferences 套件；其他 API 以 preferences.scope_filter 過濾)
preferences.init_app(app, SimpleNamespace(
    fetch_db_rows=fetch_db_rows,
    db_execute=db_execute,
    departments=DEMO_DEPARTMENTS,
    students=DEMO_STUDENTS,
))

# 教師專長查詢 (faculty 套件)
import faculty

faculty.init_app(app, SimpleNamespace(
    fetch_db_rows=fetch_db_rows,
    db_execute=db_execute,
    write_audit_log=write_audit_log,
))

# 學期學習自評表 (self_review 套件)
import self_review

self_review.init_app(app, SimpleNamespace(
    fetch_db_rows=fetch_db_rows,
    db_execute=db_execute,
    current_semester=lambda: "{academic_year}-{semester}".format(**current_academic_term(datetime.now().date())),
))

# AI 申辦小幫手 (assistant 套件)：先查資料庫，有設定 Claude 時再由 Claude 整理成口語回答
import assistant

def load_synonyms_for_assistant():
    """同義詞轉成 {口語關鍵字: 官方名稱} 字典，供小幫手比對用；資料來源與其他地方共用 load_synonyms()"""
    return {r["user_keyword"]: r["official_term"] for r in load_synonyms()}

assistant.init_app(app, SimpleNamespace(
    load_checklists=load_checklists,
    load_rules=load_rules,
    load_synonyms=load_synonyms_for_assistant,
    log_search=log_search,
    record_unmatched_query=record_unmatched_query,
    contacts=CAMPUS_CONTACT_DIRECTORY,
))

# 線上申辦與進度追蹤、申請表單 (applications 套件)
import applications

def notify_student(student_id, subject):
    """通知信只說有結果，不含申請內容；寄送失敗不影響審核"""
    try:
        get_mailer().send(campus_email(student_id), subject, "您的線上申辦已有審核結果，請登入系統「行政申請流程」查看")
        return True
    except Exception:
        return False

applications.init_app(app, SimpleNamespace(
    fetch_db_rows=fetch_db_rows,
    db_execute=db_execute,
    write_audit_log=write_audit_log,
    load_checklists=load_checklists,
    load_student=_load_student_info,
    class_student_ids=_get_class_student_ids,
    notify_student=notify_student,
    forms_folder=FORMS_FOLDER,
))

# 我的操行 (conduct 套件)：基本分 + 導師評分 + 獎懲 + 缺曠扣分
import conduct

def term_of(date_str):
    """日期字串 → 所屬學期，例如 2026-10-02 → 115-1"""
    term = current_academic_term(datetime.strptime(str(date_str)[:10], "%Y-%m-%d").date())
    return f"{term['academic_year']}-{term['semester']}"

conduct.init_app(app, SimpleNamespace(
    fetch_db_rows=fetch_db_rows,
    db_execute=db_execute,
    write_audit_log=write_audit_log,
    load_student=_load_student_info,
    list_students=list_students,
    class_student_ids=_get_class_student_ids,
    attendance_records=lambda student_id: get_attendance_source().list_records(student_id),
    term_of=term_of,
    current_semester=lambda: term_of(datetime.now().date().isoformat()),
))

# 智慧重補修推薦 (retake 套件)：沒過的科目 → 當學期其他班開的同名課 → 排除衝堂
import retake

retake.init_app(app, SimpleNamespace(
    load_course_map=load_course_map,
    load_student_credits=load_student_credits,
    load_schedule=lambda: fetch_db_rows("SELECT * FROM class_schedule") or dashboard_demo.DEMO_CLASS_SCHEDULE,
    load_student=_load_student_info,
    current_semester=lambda: term_of(datetime.now().date().isoformat()),
))

# 功能對照表 /admin/feature-map (devmap 套件)：學生功能 → API → 程式碼行號 → XAMPP 資料表
import devmap

devmap.init_app(app, SimpleNamespace(fetch_db_rows=fetch_db_rows))

# 校慶跑馬燈與匿名祝福 (anniversary 套件)
import anniversary

anniversary.init_app(app, SimpleNamespace(
    fetch_db_rows=fetch_db_rows,
    db_execute=db_execute,
    write_audit_log=write_audit_log,
))

# Public sharing and deployment health
from public_portal import bp as public_portal_bp
app.register_blueprint(public_portal_bp)

from admin_core import bp as admin_core_bp
app.register_blueprint(admin_core_bp)

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

    # debug 模式的除錯頁可執行任意程式碼，只在本機開發時以 FLASK_DEBUG=1 開啟
    debug = os.getenv("FLASK_DEBUG") == "1"
    if debug:
        print("⚠️ FLASK_DEBUG=1：除錯模式已開啟，請勿在對外開放的伺服器使用")
    app.run(host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", 8000)), debug=debug)
