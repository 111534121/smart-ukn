from flask import Flask, request, jsonify, session, redirect, send_from_directory
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
from datetime import datetime

# 設定 Windows 終端輸出為 UTF-8
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try: sys.stderr.reconfigure(encoding='utf-8')
    except Exception: pass

# ==========================================
# Smart UKN 康寧大學智慧校園服務平台 - 後端核心 (3NF & Multi-role)
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
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
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
    """嘗試取得 MySQL 連線，若失敗拋出 None 以供示範模式無縫接管"""
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
# 權限控管裝飾器：保護需登入/限定角色的路由
# ==========================================

def login_required(f):
    """限制僅已登入（有 session）之使用者可存取"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "username" not in session:
            return jsonify({"status": "error", "message": "請先登入"}), 401
        return f(*args, **kwargs)
    return wrapper

def role_required(*allowed_roles):
    """限制僅指定角色（如管理員、教職員）可存取"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if "username" not in session:
                return jsonify({"status": "error", "message": "請先登入"}), 401
            if session.get("role") not in allowed_roles:
                return jsonify({"status": "error", "message": "權限不足，僅限特定身分存取"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ==========================================
# 2. 示範模式 3NF 資料引擎 (Demo Fallback Storage)
#    保證即使 MySQL 未啟動也能 100% 完整展示！
# ==========================================

DEMO_DEPARTMENTS = [
    {"dept_id": "CS", "dept_name": "資訊科技與應用學系", "college_name": "創新與管理學院"},
    {"dept_id": "NUR", "dept_name": "護理學系", "college_name": "健康照護學院"},
    {"dept_id": "ENG", "dept_name": "應用外語學系", "college_name": "人文與教育學院"},
    {"dept_id": "GEN", "dept_name": "通識教育中心", "college_name": "全校共同教學單位"}
]

DEMO_STUDENTS = [
    {"student_id": "S112001", "full_name": "王小明", "dept_id": "CS", "dept_name": "資訊科技與應用學系", "admission_year": 112, "class_name": "資科二甲", "parent_phone": "0912-345-678"},
    {"student_id": "S112002", "full_name": "李美華", "dept_id": "CS", "dept_name": "資訊科技與應用學系", "admission_year": 112, "class_name": "資科二甲", "parent_phone": "0922-333-444"},
    {"student_id": "S112003", "full_name": "張建華", "dept_id": "NUR", "dept_name": "護理學系", "admission_year": 112, "class_name": "護理二乙", "parent_phone": "0933-555-666"}
]

# 密碼皆已用 werkzeug 雜湊處理，不再明碼儲存 (原文分別為 123456 / admin123)
_DEMO_PW_123456 = "pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c"
_DEMO_PW_ADMIN123 = "pbkdf2:sha256:1000000$2XQfvmmn75wVJUKc$59cac19325e7e89df728fdc0ee86208fc0ae12ab71fc630fbaa890f2f919d14c"

DEMO_USERS = [
    {"user_id": 1, "username": "student1", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112001", "full_name": "王小明"},
    {"user_id": 2, "username": "student2", "password_hash": _DEMO_PW_123456, "role": "學生", "student_id": "S112002", "full_name": "李美華"},
    {"user_id": 3, "username": "parent1", "password_hash": _DEMO_PW_123456, "role": "家長", "student_id": "S112001", "full_name": "王大明 (小明家長)"},
    {"user_id": 4, "username": "teacher1", "password_hash": _DEMO_PW_123456, "role": "教職員", "student_id": None, "full_name": "周立威 老師"},
    {"user_id": 5, "username": "admin", "password_hash": _DEMO_PW_ADMIN123, "role": "管理員", "student_id": None, "full_name": "系統超級管理員"}
]

DEMO_CATEGORIES = [
    {"category_id": 1, "category_name": "選課與學分業務", "icon": "📚", "subcategories": ["停修/棄修手續", "外語能力抵免", "課程先修規定"]},
    {"category_id": 2, "category_name": "請假與出勤規定", "icon": "📝", "subcategories": ["學生請假流程", "缺課與扣考規定"]},
    {"category_id": 3, "category_name": "學籍異動與退學", "icon": "🎓", "subcategories": ["學業二一退學", "獎懲與申訴"]},
    {"category_id": 4, "category_name": "校園生活與證件", "icon": "💳", "subcategories": ["學生證掛失補發"]},
    {"category_id": 5, "category_name": "招生科系與入學", "icon": "🏫", "subcategories": ["新生入學與科系"]}
]

DEMO_KNOWLEDGE_BASE = [
    {
        "id": 1,
        "category_id": 1,
        "category_name": "選課與學分業務",
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
        "category_id": 1,
        "category_name": "選課與學分業務",
        "subcategory": "外語能力抵免",
        "keyword": "英文抵免",
        "official_term": "語言證照抵免辦法",
        "content": "凡通過全民英檢中高級、多益 (TOEIC) 550 分以上或同等國際英語檢定標準者，得於入學第一學期規定期限內，檢附成績單與證書正本向教務處註冊組申請抵免大一英文或通識外語學分。",
        "doc_name": "康寧大學抵免學分辦法.pdf",
        "page": 5,
        "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    },
    {
        "id": 3,
        "category_id": 2,
        "category_name": "請假與出勤規定",
        "subcategory": "學生請假流程",
        "keyword": "請假規定",
        "official_term": "學生請假辦法",
        "content": "學生因故不能出席課業活動，須於事前（事假）或事後 3 日內（病假）辦理請假。假別包含公假、事假、病假、喪假及生理假。病假須檢附三日內就醫證明，三天以上須經系主任簽核，均需透過學生教務系統線上完成申請。",
        "doc_name": "學生請假辦法.pdf",
        "page": 3,
        "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    },
    {
        "id": 4,
        "category_id": 2,
        "category_name": "請假與出勤規定",
        "subcategory": "缺課與扣考規定",
        "keyword": "曠課扣考",
        "official_term": "學生出勤與扣考規定",
        "content": "學生未經請假或請假未准而缺席者視為曠課。某一科目缺課（含請假及曠課）時數達該科目全學期授課總時數三分之一以上者，該科目不得參加期末考試（即扣考），學期成績以零分計算。",
        "doc_name": "康寧大學學生學則.pdf",
        "page": 18,
        "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    },
    {
        "id": 5,
        "category_id": 3,
        "category_name": "學籍異動與退學",
        "subcategory": "學業二一退學",
        "keyword": "二一退學",
        "official_term": "學業退學規定",
        "content": "學士班學生單一學期學業成績不及格科目之學分數，達該學期修習學分總數二分之一者，予以學業警示輔導；若累計達校規規定之學業成績二分之一不及格達兩次者，應予退學處分。",
        "doc_name": "康寧大學學生學則.pdf",
        "page": 24,
        "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    },
    {
        "id": 6,
        "category_id": 3,
        "category_name": "學籍異動與退學",
        "subcategory": "獎懲與申訴",
        "keyword": "獎懲辦法",
        "official_term": "學生獎懲辦法",
        "content": "學生之獎勵分為嘉獎、小功、大功；懲處分為申誡、小過、大過、留校察看及退學。學生對於學校所為之懲處認有違法或不當致損害其權益者，得於收到處分通知書之次日起十日內向學生申訴評議委員會提出申訴。",
        "doc_name": "學生獎懲辦法.pdf",
        "page": 3,
        "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    },
    {
        "id": 7,
        "category_id": 4,
        "category_name": "校園生活與證件",
        "subcategory": "學生證掛失補發",
        "keyword": "補發學生證",
        "official_term": "學生證遺失補發流程",
        "content": "學生證遺失時，應即登入學生教務資訊系統辦理線上掛失，並至行政大樓自動繳費機繳納工本費（新台幣 150 元），攜帶繳費收據與身分證明文件至教務處註冊組辦理補發，約 3 個工作天即可領取新卡。",
        "doc_name": "學生證管理要點.pdf",
        "page": 2,
        "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    },
    {
        "id": 8,
        "category_id": 5,
        "category_name": "招生科系與入學",
        "subcategory": "新生入學與科系",
        "keyword": "招生科系",
        "official_term": "康寧大學招生系所導覽",
        "content": "本校設有資訊科技與應用學系、護理學系、幼兒保育學系、長期照護學系、應用外語學系等。提供五專、四技、學士班及碩士班完整升學路徑，提供豐富企業實習與證照輔導資源。",
        "doc_name": "康寧大學招生簡章.pdf",
        "page": 1,
        "url": "https://www.ukn.edu.tw"
    }
]

DEMO_SYNONYMS = [
    {"synonym_id": 1, "category_id": 1, "user_keyword": "棄修", "official_term": "停修課程辦理規定"},
    {"synonym_id": 2, "category_id": 1, "user_keyword": "退選", "official_term": "停修課程辦理規定"},
    {"synonym_id": 3, "category_id": 1, "user_keyword": "英文免修", "official_term": "語言證照抵免辦法"},
    {"synonym_id": 4, "category_id": 1, "user_keyword": "英檢抵免", "official_term": "語言證照抵免辦法"},
    {"synonym_id": 5, "category_id": 1, "user_keyword": "擋修", "official_term": "先修科目規定"},
    {"synonym_id": 6, "category_id": 2, "user_keyword": "請假", "official_term": "學生請假辦法"},
    {"synonym_id": 7, "category_id": 2, "user_keyword": "病假怎麼請", "official_term": "學生請假辦法"},
    {"synonym_id": 8, "category_id": 2, "user_keyword": "缺課", "official_term": "學生出勤與扣考規定"},
    {"synonym_id": 9, "category_id": 3, "user_keyword": "二一", "official_term": "學業退學規定"},
    {"synonym_id": 10, "category_id": 3, "user_keyword": "被當掉", "official_term": "學業退學規定"},
    {"synonym_id": 11, "category_id": 4, "user_keyword": "補辦學生證", "official_term": "學生證遺失補發流程"},
    {"synonym_id": 12, "category_id": 4, "user_keyword": "卡片遺失", "official_term": "學生證遺失補發流程"}
]

DEMO_CHECKLISTS = [
    {
        "item_id": 1,
        "category_id": 1,
        "category_name": "課務組",
        "business_name": "學生課程停修（棄修）申請",
        "steps_json": [
            "1. 登入學生教務系統填寫停修申請表",
            "2. 列印紙本申請單經授課教師簽名同意",
            "3. 送所屬系所導師及系主任核章",
            "4. 於學期第12週截止日前送教務處課務組審查"
        ],
        "required_docs": "停修申請表（須任課老師簽章）、學生證正本",
        "office_hours": "週一至週五 08:30 - 17:00 (行政大樓教務處)",
        "contact_phone": "02-2632-1181 分機 312 (課務組)"
    },
    {
        "item_id": 2,
        "category_id": 4,
        "category_name": "註冊組",
        "business_name": "學生證遺失補發申請",
        "steps_json": [
            "1. 登入教務系統辦理線上卡片掛失",
            "2. 至行政大樓自動繳費機繳交補發工本費 150 元",
            "3. 持繳費收據及身分證明文件至註冊組辦理",
            "4. 3 個工作天後憑收據至註冊組領取新學生證"
        ],
        "required_docs": "身分證或健保卡正本、工本費收據、2吋大頭照電子檔",
        "office_hours": "週一至週五 09:00 - 16:30 (行政大樓註冊組)",
        "contact_phone": "02-2632-1181 分機 310 (註冊組)"
    },
    {
        "item_id": 3,
        "category_id": 1,
        "category_name": "註冊組",
        "business_name": "外語證照 / 學分抵免申請",
        "steps_json": [
            "1. 確認自身符合抵免資格（多益550分以上或全民英檢中高級）",
            "2. 備妥成績單或證書正本與影本",
            "3. 填寫學分抵免申請表並由所屬系所初審",
            "4. 開學兩週內送交教務處註冊組複審核定"
        ],
        "required_docs": "語言檢定證書正影本、歷年成績單、學分抵免申請表",
        "office_hours": "開學前兩週內 08:30 - 17:00 (教務處)",
        "contact_phone": "02-2632-1181 分機 310 (註冊組)"
    },
    {
        "item_id": 4,
        "category_id": 2,
        "category_name": "學務處",
        "business_name": "學生病假與公假線上請假流程",
        "steps_json": [
            "1. 事假須事前於線上請假系統提出申請",
            "2. 病假須於返校 3 日內登入系統補辦並上傳就醫證明",
            "3. 公假須檢附公函或主辦單位指派公文證明",
            "4. 經導師及系輔導人員線上審核通過即生效"
        ],
        "required_docs": "三日內診斷證明或收據電子檔（病假）、派遣公文（公假）",
        "office_hours": "線上系統 24 小時開放受理",
        "contact_phone": "02-2632-1181 分機 410 (生輔組)"
    },
    {
        "item_id": 5,
        "category_id": 1,
        "category_name": "課務組",
        "business_name": "不及格科目重補修申請",
        "steps_json": [
            "1. 查詢下學期開課時間表，確認該科目是否開班",
            "2. 於加退選期間至教務系統重新選修該科目（重補修）",
            "3. 若該科目已停開，須洽系所辦理替代科目認定",
            "4. 選修科目亦可改選其他同學分選修科目以取代學分"
        ],
        "required_docs": "無需另外書面文件；逾加退選期限則需填寫替代科目認定表",
        "office_hours": "加退選期間依教務處公告時間；平時洽詢 週一至週五 08:30 - 17:00",
        "contact_phone": "02-2632-1181 分機 312 (課務組)"
    }
]

DEMO_COURSES = [
    {
        "course_id": "CS101",
        "course_name": "計算機概論",
        "credits": 3,
        "prerequisite_id": None,
        "prerequisite_name": None,
        "is_required": 1,
        "dept_id": "CS",
        "semester_suggest": "大一上",
        "description": "計算機科學基礎、電腦架構、作業系統與網路概論。"
    },
    {
        "course_id": "CS102",
        "course_name": "程式設計(一)",
        "credits": 3,
        "prerequisite_id": "CS101",
        "prerequisite_name": "計算機概論",
        "is_required": 1,
        "dept_id": "CS",
        "semester_suggest": "大一下",
        "description": "Python 與 C 語言基礎邏輯、變數、迴圈與函式設計。"
    },
    {
        "course_id": "CS201",
        "course_name": "資料結構",
        "credits": 3,
        "prerequisite_id": "CS102",
        "prerequisite_name": "程式設計(一)",
        "is_required": 1,
        "dept_id": "CS",
        "semester_suggest": "大二上",
        "description": "陣列、鏈結串列、堆疊、佇列、樹狀與圖形演算法。"
    },
    {
        "course_id": "CS202",
        "course_name": "物件導向程式設計",
        "credits": 3,
        "prerequisite_id": "CS102",
        "prerequisite_name": "程式設計(一)",
        "is_required": 1,
        "dept_id": "CS",
        "semester_suggest": "大二下",
        "description": "類別、物件、繼承、多型與 Java/C++ 設計模式。"
    },
    {
        "course_id": "CS301",
        "course_name": "演算法分析",
        "credits": 3,
        "prerequisite_id": "CS201",
        "prerequisite_name": "資料結構",
        "is_required": 1,
        "dept_id": "CS",
        "semester_suggest": "大三上",
        "description": "時間複雜度、分治法、貪婪演算法、動態規劃。"
    },
    {
        "course_id": "CS302",
        "course_name": "資料庫系統概論",
        "credits": 3,
        "prerequisite_id": "CS201",
        "prerequisite_name": "資料結構",
        "is_required": 1,
        "dept_id": "CS",
        "semester_suggest": "大三上",
        "description": "關聯式資料庫、SQL 語法、正規化與 MySQL 實作。"
    },
    {
        "course_id": "CS401",
        "course_name": "畢業專題研討",
        "credits": 3,
        "prerequisite_id": "CS302",
        "prerequisite_name": "資料庫系統概論",
        "is_required": 1,
        "dept_id": "CS",
        "semester_suggest": "大四上",
        "description": "綜合資訊系統開發、AI 應用整合與專題展示。"
    },
    {
        "course_id": "EN101",
        "course_name": "基礎英文",
        "credits": 2,
        "prerequisite_id": None,
        "prerequisite_name": None,
        "is_required": 1,
        "dept_id": "GEN",
        "semester_suggest": "大一上",
        "description": "大一基礎外語聽說讀寫與學術閱讀。"
    },
    {
        "course_id": "GE101",
        "course_name": "大學之道與倫理",
        "credits": 2,
        "prerequisite_id": None,
        "prerequisite_name": None,
        "is_required": 0,
        "dept_id": "GEN",
        "semester_suggest": "大一上",
        "description": "校園生活適應、生命教育與職場倫理。"
    }
]

DEMO_STUDENT_CREDITS = [
    {"credit_id": 1, "student_id": "S112001", "course_id": "CS101", "semester": "112-1", "score": 85.0, "is_passed": 1},
    {"credit_id": 2, "student_id": "S112001", "course_id": "CS102", "semester": "112-2", "score": 55.0, "is_passed": 0}, # 小明程式設計(一)未過
    {"credit_id": 3, "student_id": "S112001", "course_id": "EN101", "semester": "112-1", "score": 78.0, "is_passed": 1},
    {"credit_id": 4, "student_id": "S112002", "course_id": "CS101", "semester": "112-1", "score": 92.5, "is_passed": 1},
    {"credit_id": 5, "student_id": "S112002", "course_id": "CS102", "semester": "112-2", "score": 88.0, "is_passed": 1},
    {"credit_id": 6, "student_id": "S112002", "course_id": "GE101", "semester": "112-1", "score": 90.0, "is_passed": 1}
]

# 學生證照與檢定成績紀錄 (如勞動部技術士技能檢定成績單)
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

DEMO_VISITOR_LOGS = [
    {
        "log_id": 1,
        "visitor_name": "陳同學",
        "phone": "0912-888-999",
        "school_from": "台北市立南港高中",
        "purpose": "升學諮詢與系所探索",
        "target_dept": "資訊科技與應用學系",
        "visited_at": "2026-09-08 09:30:00",
        "ip_address": "127.0.0.1"
    },
    {
        "log_id": 2,
        "visitor_name": "林家長",
        "phone": "0922-111-222",
        "school_from": "新北市立汐止國中",
        "purpose": "五專免試入學諮詢",
        "target_dept": "護理學系",
        "visited_at": "2026-09-08 10:15:00",
        "ip_address": "127.0.0.1"
    }
]

# 校務服務斷點匿名回報 (不收集姓名/學號，僅記錄類型與情境供電算中心統計改善)
DEMO_FRICTION_REPORTS = [
    {
        "report_id": 1,
        "category": "不知道申請進度或結果",
        "description": "送出停修申請後不知道現在審核到哪個階段。",
        "page_context": "tab-checklist",
        "role_context": "學生",
        "reported_at": "2026-09-10 14:20:00",
        "ip_address": "127.0.0.1"
    },
    {
        "report_id": 2,
        "category": "忘記密碼",
        "description": "",
        "page_context": "tab-ai",
        "role_context": "訪客",
        "reported_at": "2026-09-11 09:05:00",
        "ip_address": "127.0.0.1"
    }
]

# 緊急聯絡與各處室分機字典 (安全邊界防呆用)
CAMPUS_CONTACT_DIRECTORY = [
    {"office": "教務處課務組", "phone": "02-2632-1181 分機 312", "scope": "選課、停修、加退選、排課業務"},
    {"office": "教務處註冊組", "phone": "02-2632-1181 分機 310", "scope": "學籍、成績、學分抵免、學生證補發"},
    {"office": "學務處生輔組", "phone": "02-2632-1181 分機 410", "scope": "請假審核、獎懲申訴、宿舍管理"},
    {"office": "電子計算機中心", "phone": "02-2632-1181 分機 510", "scope": "校園網路、學生系統帳號密碼重設"},
    {"office": "招生服務中心", "phone": "02-2632-1181 分機 302", "scope": "升學簡章、五專四技入學諮詢"}
]

# 跨系統期限雷達：把選課/請假/抵免/獎助學金/教學評量等既有系統的期限整合成單一清單
# (校方系統無公開 API 可串接，期限資料由行政單位人工建檔維護)
DEMO_DEADLINES = [
    {"deadline_id": 1, "title": "加退選截止", "category": "選課", "start_date": "2026-09-14", "end_date": "2026-09-20", "applies_to_role": "all", "applies_to_dept": None, "applies_to_dept_name": None, "related_system_url": "https://www.ukn.edu.tw/", "description": "逾期未完成加退選者，選課結果將依原排課確定生效。"},
    {"deadline_id": 2, "title": "語言證照學分抵免申請截止", "category": "抵免", "start_date": None, "end_date": "2026-09-30", "applies_to_role": "學生", "applies_to_dept": None, "applies_to_dept_name": None, "related_system_url": "https://www.ukn.edu.tw/", "description": "須檢附證書正影本與歷年成績單向教務處註冊組申請。"},
    {"deadline_id": 3, "title": "書卷獎與學海獎助學金申請截止", "category": "獎助學金", "start_date": None, "end_date": "2026-10-15", "applies_to_role": "學生", "applies_to_dept": None, "applies_to_dept_name": None, "related_system_url": "https://www.ukn.edu.tw/", "description": "依前一學期成績與家庭狀況審核，逾期不受理。"},
    {"deadline_id": 4, "title": "期中學業預警名單公告與輔導期", "category": "學習預警", "start_date": "2026-11-01", "end_date": "2026-11-05", "applies_to_role": "all", "applies_to_dept": None, "applies_to_dept_name": None, "related_system_url": "https://www.ukn.edu.tw/", "description": "被列入預警名單者將由導師安排面談，家長可同步關注。"},
    {"deadline_id": 5, "title": "資訊科技與應用學系專題期中審查", "category": "選課", "start_date": None, "end_date": "2026-11-10", "applies_to_role": "學生", "applies_to_dept": "CS", "applies_to_dept_name": "資訊科技與應用學系", "related_system_url": "https://www.ukn.edu.tw/", "description": "專題小組須完成期中進度報告並提交指導教師審核。"},
    {"deadline_id": 6, "title": "停修（棄修）申請截止（第10-12週）", "category": "選課", "start_date": "2026-11-09", "end_date": "2026-11-20", "applies_to_role": "學生", "applies_to_dept": None, "applies_to_dept_name": None, "related_system_url": "https://www.ukn.edu.tw/", "description": "逾期不受理，停修後修習學分不得低於最低應修學分。"},
    {"deadline_id": 7, "title": "教學評量填寫期間截止", "category": "教學評量", "start_date": "2026-12-15", "end_date": "2026-12-25", "applies_to_role": "學生", "applies_to_dept": None, "applies_to_dept_name": None, "related_system_url": "https://www.ukn.edu.tw/", "description": "完成填寫始可查詢學期成績，請於期末考前完成。"}
]

# ==========================================
# 3. 前端頁面路由
# ==========================================

@app.route("/")
def index_page():
    return app.send_static_file("index.html")

@app.route("/login")
def login_page():
    return app.send_static_file("login.html")

@app.route("/admin")
def admin_page():
    # 僅管理員/教職員可進入後台，其餘導向登入頁
    if session.get("role") not in ("管理員", "教職員"):
        return redirect("/login")
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
            # 僅用帳號查詢，密碼改在取出後以雜湊比對，避免明碼進 SQL 或被直接比對
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
        # Fallback to Demo Storage
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
        session["user_id"] = user_record["user_id"]
        session["username"] = user_record["username"]
        session["role"] = user_record["role"]
        session["full_name"] = user_record["full_name"]
        session["student_id"] = user_record.get("student_id")
        session["dept_id"] = user_record.get("dept_id")
        session["dept_name"] = user_record.get("dept_name", "資訊科技與應用學系")
        session["class_name"] = user_record.get("class_name", "")

        return jsonify({
            "status": "success",
            "message": f"歡迎登入！{user_record['full_name']} ({user_record['role']})",
            "user": {
                "user_id": user_record["user_id"],
                "username": user_record["username"],
                "role": user_record["role"],
                "full_name": user_record["full_name"],
                "student_id": user_record.get("student_id"),
                "dept_name": user_record.get("dept_name", ""),
                "class_name": user_record.get("class_name", "")
            }
        }), 200

    return jsonify({"status": "error", "message": "帳號或密碼錯誤，請重新確認！"}), 401

@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"status": "success", "message": "已成功登出系統"}), 200

@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    """取得當前使用者身分；未登入時如實回報 is_authenticated: false，
    讓前端能正確顯示登出/訪客狀態，不再偽裝成已登入。"""
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
                "dept_name": session.get("dept_name", ""),
                "class_name": session.get("class_name", "")
            }
        }), 200

    # 未登入：回傳「查詢成功但無使用者」，並非錯誤
    return jsonify({
        "status": "success",
        "is_authenticated": False,
        "user": None
    }), 200

# ==========================================
# 5. 訪客/未來學生快速登記入校留痕 API (/api/visitor/register)
# ==========================================

@app.route("/api/visitor/register", methods=["POST"])
def register_visitor():
    global DEMO_VISITOR_LOGS
    data = request.get_json(silent=True) or {}
    vname = data.get("visitor_name", "").strip()
    phone = data.get("phone", "").strip()
    school = data.get("school_from", "").strip()
    purpose = data.get("purpose", "").strip()
    target_dept = data.get("target_dept", "資訊科技與應用學系").strip()
    ip = request.remote_addr or "127.0.0.1"

    if not vname or not phone or not school or not purpose:
        return jsonify({"status": "error", "message": "姓名、手機號碼、畢業學校與來訪目的為必填欄位！"}), 400

    conn = get_db_connection()
    new_id = None
    if conn:
        try:
            cursor = conn.cursor()
            sql = "INSERT INTO visitor_logs (visitor_name, phone, school_from, purpose, target_dept, ip_address) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (vname, phone, school, purpose, target_dept, ip))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    if not new_id:
        new_id = max([v["log_id"] for v in DEMO_VISITOR_LOGS], default=0) + 1
        DEMO_VISITOR_LOGS.insert(0, {
            "log_id": new_id,
            "visitor_name": vname,
            "phone": phone,
            "school_from": school,
            "purpose": purpose,
            "target_dept": target_dept,
            "visited_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "ip_address": ip
        })

    # 設定訪客 Session
    session["user_id"] = 999000 + new_id
    session["username"] = f"visitor_{new_id}"
    session["role"] = "訪客"
    session["full_name"] = f"{vname} (訪客)"
    session["student_id"] = None
    session["dept_name"] = target_dept
    session["class_name"] = school

    return jsonify({
        "status": "success",
        "message": f"歡迎蒞臨康寧大學，{vname}！系統已完成入校留痕登記。",
        "visitor": {
            "log_id": new_id,
            "visitor_name": vname,
            "role": "訪客",
            "school_from": school,
            "purpose": purpose,
            "target_dept": target_dept
        }
    }), 201

# ==========================================
# 5b. 校務服務斷點匿名回報 API (/api/feedback/report)
#     不需登入、不收集姓名/學號等個資，只記錄卡關類型與情境，
#     供電算中心統計哪個環節最容易讓人卡住。
# ==========================================

FRICTION_CATEGORIES = ["忘記密碼", "找不到申請表單", "不知道申請進度或結果", "不確定辦理期限", "操作介面看不懂", "其他"]

@app.route("/api/feedback/report", methods=["POST"])
def report_friction():
    global DEMO_FRICTION_REPORTS
    data = request.get_json(silent=True) or {}
    category = str(data.get("category", "")).strip()
    description = str(data.get("description", "")).strip()
    page_context = str(data.get("page_context", "")).strip()
    ip = request.remote_addr or "127.0.0.1"

    if category not in FRICTION_CATEGORIES:
        return jsonify({"status": "error", "message": "請選擇有效的卡關類型"}), 400

    # 僅記錄回報當下的身分類別做統計，不等同於個人身分識別
    role_context = session.get("role", "訪客")

    conn = get_db_connection()
    new_id = None
    if conn:
        try:
            cursor = conn.cursor()
            sql = "INSERT INTO friction_reports (category, description, page_context, role_context, ip_address) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql, (category, description, page_context, role_context, ip))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    if not new_id:
        new_id = max([r["report_id"] for r in DEMO_FRICTION_REPORTS], default=0) + 1
        DEMO_FRICTION_REPORTS.insert(0, {
            "report_id": new_id,
            "category": category,
            "description": description,
            "page_context": page_context,
            "role_context": role_context,
            "reported_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "ip_address": ip
        })

    return jsonify({"status": "success", "message": "感謝您的回報，我們會盡快改善此環節！"}), 201

# ==========================================
# 6. 引導式分級下拉選單 API (/api/categories)
# ==========================================

@app.route("/api/categories", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM knowledge_categories ORDER BY sort_order ASC")
            cats = cursor.fetchall()
            
            # 抓取各分類下的子項目
            cursor.execute("SELECT DISTINCT category_id, subcategory FROM knowledge_base ORDER BY id ASC")
            sub_rows = cursor.fetchall()
            cursor.close()
            conn.close()

            sub_map = {}
            for s in sub_rows:
                cid = s["category_id"]
                if cid not in sub_map: sub_map[cid] = []
                sub_map[cid].append(s["subcategory"])

            for c in cats:
                c["subcategories"] = sub_map.get(c["category_id"], [])

            return jsonify({"status": "success", "data": cats}), 200
        except Exception:
            if conn: conn.close()

    return jsonify({"status": "success", "data": DEMO_CATEGORIES}), 200

# ==========================================
# 7. AI 智慧搜尋與安全邊界防呆 API (/api/search)
# ==========================================

@app.route("/api/search", methods=["GET", "POST"])
def search_knowledge():
    if request.method == "GET":
        q = request.args.get("query", "").strip()
        cat_id = request.args.get("category_id", type=int)
        subcat = request.args.get("subcategory", "").strip()
    else:
        data = request.get_json(silent=True) or {}
        q = str(data.get("query", "")).strip()
        cat_id = data.get("category_id")
        subcat = str(data.get("subcategory", "")).strip()

    user_query = q or subcat
    if not user_query and not cat_id:
        return jsonify({"status": "error", "message": "請輸入搜尋關鍵字或選擇分類子項目！"}), 400

    conn = get_db_connection()
    
    # -------------------------------------------------------------
    # 模式 A: MySQL 連線查詢 (含同義詞預處理與安全邊界)
    # -------------------------------------------------------------
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)

            # 1. 同義詞比對 (子字串包含比對，例如句子中包含 "棄修")
            cursor.execute("SELECT user_keyword, official_term FROM synonym_dictionary")
            synonyms_list = cursor.fetchall()
            
            is_synonym = False
            official_term = ""
            search_key = user_query

            for syn in synonyms_list:
                uk = syn["user_keyword"]
                if uk in user_query or user_query in uk:
                    is_synonym = True
                    official_term = syn["official_term"]
                    search_key = official_term
                    break

            # 2. 檢索知識庫
            sql = """
                SELECT k.id, k.category_id, c.category_name, k.subcategory, k.keyword, k.official_term, k.content, k.doc_name, k.page, k.url
                FROM knowledge_base k
                JOIN knowledge_categories c ON k.category_id = c.category_id
                WHERE (k.keyword LIKE %s OR k.official_term LIKE %s OR k.content LIKE %s OR k.subcategory LIKE %s)
            """
            params = [f"%{search_key}%", f"%{search_key}%", f"%{search_key}%", f"%{search_key}%"]

            if cat_id:
                sql += " AND k.category_id = %s"
                params.append(cat_id)
            if subcat:
                sql += " AND k.subcategory LIKE %s"
                params.append(f"%{subcat}%")

            sql += " ORDER BY CASE WHEN k.keyword = %s THEN 1 WHEN k.official_term = %s THEN 2 ELSE 3 END LIMIT 5"
            params.extend([search_key, search_key])

            cursor.execute(sql, tuple(params))
            results = cursor.fetchall()

            # 3. 取得關聯流程步驟
            chk_sql = "SELECT business_name, steps_json, required_docs, office_hours, contact_phone FROM checklist_items WHERE business_name LIKE %s OR category_name LIKE %s LIMIT 1"
            cursor.execute(chk_sql, (f"%{search_key}%", f"%{search_key}%"))
            chk_row = cursor.fetchone()
            
            cursor.close()
            conn.close()

            if results:
                primary = results[0]
                matched_official = official_term or primary.get("official_term") or primary.get("keyword")
                checklist_steps = []
                if chk_row and chk_row.get("steps_json"):
                    try: checklist_steps = json.loads(chk_row["steps_json"])
                    except Exception: checklist_steps = [chk_row["steps_json"]]
                else:
                    checklist_steps = [
                        "確認相關校規與申辦資格",
                        "備妥身分或歷年成績證明文件",
                        "依程序送交系所及教務處審核辦理"
                    ]

                return jsonify({
                    "status": "success",
                    "matched": True,
                    "is_synonym_matched": is_synonym,
                    "official_term": matched_official,
                    "search_term": user_query,
                    "answer": primary["content"],
                    "source_doc": primary["doc_name"],
                    "page_num": primary["page"],
                    "source_url": primary["url"],
                    "checklist": checklist_steps,
                    "required_docs": chk_row.get("required_docs", "依各系所規定") if chk_row else "依各系所規定",
                    "office_hours": chk_row.get("office_hours", "上班日 08:30 - 17:00") if chk_row else "上班日 08:30 - 17:00",
                    "contact_phone": chk_row.get("contact_phone", "02-2632-1181") if chk_row else "02-2632-1181",
                    "all_matches": results
                }), 200

        except Exception as e:
            if conn: conn.close()
            print("MySQL search error, falling back to demo:", e)

    # -------------------------------------------------------------
    # 模式 B: 示範資料庫引擎 (Demo Fallback Engine)
    # -------------------------------------------------------------
    is_synonym = False
    official_term = ""
    target_key = user_query.lower()

    # 查同義詞
    for syn in DEMO_SYNONYMS:
        if syn["user_keyword"].lower() in target_key or target_key in syn["user_keyword"].lower():
            is_synonym = True
            official_term = syn["official_term"]
            target_key = official_term.lower()
            break

    matched = []
    for item in DEMO_KNOWLEDGE_BASE:
        kw = item["keyword"].lower()
        ot = item["official_term"].lower()
        ct = item["content"].lower()
        sc = item["subcategory"].lower()

        # 分類篩選
        if cat_id and item["category_id"] != cat_id:
            continue
        if subcat and subcat.lower() not in sc:
            continue

        if (target_key in kw or target_key in ot or target_key in ct or target_key in sc or
            user_query.lower() in kw or user_query.lower() in ot or user_query.lower() in ct):
            matched.append(item)

    if matched:
        primary = matched[0]
        chk_steps = [
            "登入學生教務系統進行線上申辦",
            "備妥規定期限內之證明文件與申請表單",
            "送交授課教師及相關行政組別審核"
        ]
        contact = "02-2632-1181 分機 310"
        hours = "週一至週五 08:30 - 17:00"
        docs = "依規章檢附相關證明"

        for c in DEMO_CHECKLISTS:
            if target_key in c["business_name"].lower() or (official_term and official_term.lower() in c["business_name"].lower()):
                chk_steps = c["steps_json"]
                contact = c.get("contact_phone", contact)
                hours = c.get("office_hours", hours)
                docs = c.get("required_docs", docs)
                break

        return jsonify({
            "status": "success",
            "matched": True,
            "is_synonym_matched": is_synonym,
            "official_term": official_term or primary.get("official_term", ""),
            "search_term": user_query,
            "answer": primary["content"],
            "source_doc": primary["doc_name"],
            "page_num": primary["page"],
            "source_url": primary["url"],
            "checklist": chk_steps,
            "required_docs": docs,
            "office_hours": hours,
            "contact_phone": contact,
            "all_matches": matched
        }), 200

    # -------------------------------------------------------------
    # 模式 C: 嚴格安全邊界防呆機制 (Strict Safety Fallback Guardrail)
    # 絕不胡言亂語或噴 500 錯誤，提供客氣拒答與各處室分機清單
    # -------------------------------------------------------------
    return jsonify({
        "status": "success",
        "matched": False,
        "is_synonym_matched": False,
        "official_term": "",
        "search_term": user_query,
        "answer": f"抱歉！校務法規資料庫中目前未檢索到與「{user_query}」直接相關的正式規章。本平台嚴格依據學校核定公文作答，絕不自行生成未經證實之規定。建議您使用上方「引導式分類選單」選擇具體業務，或直接洽詢下方相關專責處室。",
        "source_doc": "康寧大學法規專區與處室聯絡導覽",
        "page_num": "-",
        "source_url": "https://www.ukn.edu.tw",
        "contacts_directory": CAMPUS_CONTACT_DIRECTORY,
        "suggested_topics": ["停修課程手續", "外語證照抵免", "學生請假辦法", "補發學生證", "學業退學規定"],
        "checklist": [],
        "all_matches": []
    }), 200

# ==========================================
# 8. 個人化學分與擋修自動診斷 API (/api/student/credits/diagnose)
#    直接透過 Session 學號動態向資料庫撈取成績與先修比對
# ==========================================

@app.route("/api/student/credits/diagnose", methods=["GET"])
@login_required
def diagnose_student_credits():
    # 依角色決定可查詢的學號，避免任何人用 ?student_id= 查到別人的成績 (IDOR)
    role = session.get("role")
    session_student_id = session.get("student_id")
    requested_id = request.args.get("student_id")

    if role == "學生":
        # 學生只能查自己
        target_student_id = session_student_id
    elif role == "家長":
        # 家長只能查自己綁定的子女學號 (users.student_id)，不可指定其他學號
        if requested_id and requested_id != session_student_id:
            return jsonify({"status": "error", "message": "無權查詢非本人子女之學生資料"}), 403
        target_student_id = session_student_id
    elif role in ("教職員", "管理員"):
        # 教職員/管理員可依需要指定學號查詢，但不可省略
        target_student_id = requested_id
        if not target_student_id:
            return jsonify({"status": "error", "message": "請提供欲查詢之學號 (student_id)"}), 400
    else:
        return jsonify({"status": "error", "message": "此身分無權查詢學分資料"}), 403

    if not target_student_id:
        return jsonify({"status": "error", "message": "查無綁定學號，請確認登入身分"}), 400

    conn = get_db_connection()
    passed_ids = set()
    credit_records = []
    student_info = None
    all_courses = []
    retake_checklist = None

    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            # 1. 取得學生資料
            cursor.execute("SELECT s.*, d.dept_name FROM students s JOIN departments d ON s.dept_id = d.dept_id WHERE s.student_id = %s", (target_student_id,))
            student_info = cursor.fetchone()

            # 2. 取得完整修課紀錄。只查「通過」會把已修但不及格的科目
            #    誤當成「尚未修過」，因此須保留成績與通過狀態。
            cursor.execute("SELECT course_id, score, is_passed FROM student_credits WHERE student_id = %s", (target_student_id,))
            credit_records = cursor.fetchall()
            passed_ids = {r["course_id"] for r in credit_records if r.get("is_passed")}

            # 3. 取得所有課程地圖
            cursor.execute("""
                SELECT c.course_id, c.course_name, c.credits, c.prerequisite_id, c.is_required, c.semester_suggest, c.description,
                       p.course_name as prerequisite_name
                FROM course_map c
                LEFT JOIN course_map p ON c.prerequisite_id = p.course_id
                ORDER BY c.course_id ASC
            """)
            all_courses = cursor.fetchall()

            # 4. 取得「重補修」對應的辦理處室資訊，供不及格科目附上求助對象
            cursor.execute("SELECT category_name, business_name, office_hours, contact_phone FROM checklist_items WHERE business_name LIKE %s LIMIT 1", ("%重補修%",))
            retake_checklist = cursor.fetchone()

            cursor.close()
            conn.close()
        except Exception:
            if conn: conn.close()

    if not student_info:
        # Fallback to Demo Data
        student_info = next((s for s in DEMO_STUDENTS if s["student_id"] == target_student_id), DEMO_STUDENTS[0])
        credit_records = [c for c in DEMO_STUDENT_CREDITS if c["student_id"] == target_student_id]
        passed_ids = {c["course_id"] for c in credit_records if c["is_passed"] == 1}
        all_courses = DEMO_COURSES

    if not retake_checklist:
        retake_checklist = next((c for c in DEMO_CHECKLISTS if "重補修" in c["business_name"]), None)

    total_passed_credits = 0
    required_passed_credits = 0
    elective_passed_credits = 0
    evaluated_courses = []
    course_by_id = {c["course_id"]: c for c in all_courses}

    for c in all_courses:
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
            if c["is_required"]:
                required_passed_credits += c["credits"]
            else:
                elective_passed_credits += c["credits"]

        evaluated_courses.append({
            **c,
            "is_passed": is_passed,
            "can_take": can_take,
            "is_blocked": not can_take and not is_passed,
            "missing_prerequisite": missing_prereq
        })

    # 把「未通過」與「尚未修習」分開回傳，供學生與家長清楚辨識。
    failed_courses = []
    for record in credit_records:
        if record.get("is_passed"):
            continue
        course = course_by_id.get(record["course_id"], {})
        is_required_course = bool(course.get("is_required", False))
        # 必修不及格務必儘速重補修；選修則可改選其他科目替代學分
        suggested_action = (
            "建議儘速安排重補修，避免影響必修學分並延誤先修解除"
            if is_required_course else
            "建議下學期重新選讀本科，或改選其他選修科目替代學分"
        )
        failed_courses.append({
            "course_id": record["course_id"],
            "course_name": course.get("course_name", record["course_id"]),
            "credits": course.get("credits", 0),
            "is_required": is_required_course,
            "score": record.get("score"),
            "semester": record.get("semester"),
            "suggested_action": suggested_action,
            "contact_office": (retake_checklist or {}).get("category_name", "課務組"),
            "contact_phone": (retake_checklist or {}).get("contact_phone", "02-2632-1181 分機 312 (課務組)"),
            "office_hours": (retake_checklist or {}).get("office_hours", "週一至週五 08:30 - 17:00")
        })

    failed_required_credits = sum(c["credits"] for c in failed_courses if c["is_required"])
    blocked_courses = [c for c in evaluated_courses if c["is_blocked"]]
    academic_alert = {
        "level": "normal" if not failed_courses else "attention",
        "message": "目前沒有不及格科目，請持續依修課地圖安排課程。" if not failed_courses else f"目前有 {len(failed_courses)} 門未通過科目，其中 {failed_required_credits} 學分為必修；建議優先確認重修與補救課程安排。",
        "failed_required_credits": failed_required_credits,
        "blocked_course_count": len(blocked_courses)
    }

    return jsonify({
        "status": "success",
        "student": student_info,
        "total_passed_credits": total_passed_credits,
        "required_passed_credits": required_passed_credits,
        "elective_passed_credits": elective_passed_credits,
        "failed_courses": failed_courses,
        "academic_alert": academic_alert,
        "graduation_threshold": 128,
        "progress_percent": round(min(100, (total_passed_credits / 128) * 100), 1),
        "courses": evaluated_courses
    }), 200

# ==========================================
# 8b. 跨系統期限雷達 API (/api/deadlines)
#     把選課/請假/抵免/獎助學金/教學評量等既有系統的期限整合成
#     「只屬於我」的清單：依身分與系所過濾，只顯示尚未截止者。
# ==========================================

def _attach_deadline_urgency(rows, today):
    """統一補上剩餘天數與急迫度標記，並把日期物件轉成字串方便前端顯示"""
    result = []
    for r in rows:
        row = dict(r)
        end_date_val = row.get("end_date")
        if isinstance(end_date_val, str):
            end_date_val = datetime.strptime(end_date_val, "%Y-%m-%d").date()
        days_left = (end_date_val - today).days
        row["end_date"] = end_date_val.strftime("%Y-%m-%d")

        start_date_val = row.get("start_date")
        if start_date_val:
            if isinstance(start_date_val, str):
                start_date_val = datetime.strptime(start_date_val, "%Y-%m-%d").date()
            row["start_date"] = start_date_val.strftime("%Y-%m-%d")

        row["days_left"] = days_left
        row["urgency"] = "urgent" if days_left <= 7 else ("soon" if days_left <= 14 else "normal")
        result.append(row)
    result.sort(key=lambda x: x["end_date"])
    return result

@app.route("/api/deadlines", methods=["GET"])
def get_deadlines():
    role = session.get("role", "訪客")
    # 家長要協助追蹤的是「子女」的期限，因此比照學生視角過濾，而非用家長自己的身分篩選
    filter_role = "學生" if role == "家長" else role
    student_dept_id = session.get("dept_id")
    today = datetime.now().date()

    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            sql = """
                SELECT d.*, dept.dept_name AS applies_to_dept_name
                FROM deadlines d
                LEFT JOIN departments dept ON d.applies_to_dept = dept.dept_id
                WHERE d.end_date >= %s
                  AND (d.applies_to_role = 'all' OR d.applies_to_role = %s)
                  AND (d.applies_to_dept IS NULL OR d.applies_to_dept = %s)
                ORDER BY d.end_date ASC
            """
            cursor.execute(sql, (today, filter_role, student_dept_id or ""))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "data": _attach_deadline_urgency(rows, today)}), 200
        except Exception:
            if conn: conn.close()

    demo_rows = [
        d for d in DEMO_DEADLINES
        if datetime.strptime(d["end_date"], "%Y-%m-%d").date() >= today
        and d["applies_to_role"] in ("all", filter_role)
        and (d["applies_to_dept"] is None or d["applies_to_dept"] == student_dept_id)
    ]
    return jsonify({"status": "success", "data": _attach_deadline_urgency(demo_rows, today)}), 200

# ==========================================
# 8c. 學生證照與檢定成績管理 API (/api/certificates)
#     學生自行維護個人證照紀錄 (如勞動部技術士技能檢定成績單)；
#     支援上傳 PDF 檔、證照照片；支援勞動部成績單與官方查驗網站連結。
# ==========================================

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
        elif role in ("教職員", "管理員"):
            target_student_id = requested_id
            if not target_student_id:
                return jsonify({"status": "error", "message": "請提供欲查詢之學號 (student_id)"}), 400
        else:
            return jsonify({"status": "error", "message": "此身分無權查詢證照資料"}), 403

        if not target_student_id:
            return jsonify({"status": "error", "message": "查無綁定學號，請確認登入身分"}), 400

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM certificates WHERE student_id = %s ORDER BY issue_date DESC", (target_student_id,))
                rows = cursor.fetchall()
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

    cert_name = str(data.get("cert_name", "")).strip()
    issuing_org = str(data.get("issuing_org", "")).strip() or "勞動部勞動力發展署技能檢定中心"
    cert_number = str(data.get("cert_number", "")).strip()
    issue_date = str(data.get("issue_date", "")).strip()
    cert_status = str(data.get("cert_status", "")).strip() or "及格發證"
    verify_url = str(data.get("verify_url", "")).strip()
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
        elif role in ("教職員", "管理員"):
            target_student_id = requested_id
            if not target_student_id:
                return jsonify({"status": "error", "message": "請提供欲查詢之學號 (student_id)"}), 400
        else:
            return jsonify({"status": "error", "message": "此身分無權查詢比賽獲獎資料"}), 403

        if not target_student_id:
            return jsonify({"status": "error", "message": "查無綁定學號，請確認登入身分"}), 400

        conn = get_db_connection()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM competitions WHERE student_id = %s ORDER BY award_date DESC", (target_student_id,))
                rows = cursor.fetchall()
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

    competition_name = str(data.get("competition_name", "")).strip()
    award_title = str(data.get("award_title", "")).strip()
    organizer = str(data.get("organizer", "")).strip() or "主辦單位"
    project_name = str(data.get("project_name", "")).strip()
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
# 9. 訪客紀錄與後台數據統計 API (/api/admin/visitors)
# ==========================================

@app.route("/api/admin/visitors", methods=["GET"])
@role_required("管理員", "教職員")
def get_visitor_logs():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM visitor_logs ORDER BY log_id DESC")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "data": rows, "count": len(rows)}), 200
        except Exception:
            if conn: conn.close()

    return jsonify({"status": "success", "data": DEMO_VISITOR_LOGS, "count": len(DEMO_VISITOR_LOGS)}), 200

@app.route("/api/admin/feedback", methods=["GET"])
@role_required("管理員", "教職員")
def get_friction_reports():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM friction_reports ORDER BY report_id DESC")
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "data": rows, "count": len(rows)}), 200
        except Exception:
            if conn: conn.close()

    return jsonify({"status": "success", "data": DEMO_FRICTION_REPORTS, "count": len(DEMO_FRICTION_REPORTS)}), 200

# ==========================================
# 10. 校規知識庫 CRUD API (/api/rules)
# ==========================================

@app.route("/api/rules", methods=["GET", "POST"])
def manage_rules():
    global DEMO_KNOWLEDGE_BASE
    conn = get_db_connection()
    
    if request.method == "GET":
        q = request.args.get("query", "").strip()
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                if q:
                    pat = f"%{q}%"
                    cursor.execute("SELECT * FROM knowledge_base WHERE keyword LIKE %s OR official_term LIKE %s OR content LIKE %s ORDER BY id DESC", (pat, pat, pat))
                else:
                    cursor.execute("SELECT * FROM knowledge_base ORDER BY id DESC")
                rows = cursor.fetchall()
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "data": rows, "count": len(rows)}), 200
            except Exception:
                if conn: conn.close()

        res = DEMO_KNOWLEDGE_BASE
        if q:
            res = [r for r in res if q.lower() in r["keyword"].lower() or q.lower() in r["content"].lower() or q.lower() in r.get("official_term", "").lower()]
        return jsonify({"status": "success", "data": res, "count": len(res)}), 200

    elif request.method == "POST":
        # 新增校規僅限管理員/教職員，查詢 (GET) 則對所有人開放
        if session.get("role") not in ("管理員", "教職員"):
            return jsonify({"status": "error", "message": "權限不足，僅限特定身分存取"}), 403

        data = request.get_json(silent=True) or {}
        cid = int(data.get("category_id", 1))
        subcat = data.get("subcategory", "一般規定").strip()
        kw = data.get("keyword", "").strip()
        ot = data.get("official_term", "").strip()
        ct = data.get("content", "").strip()
        doc = data.get("doc_name", "康寧大學校規.pdf").strip()
        page = int(data.get("page", 1))
        url = data.get("url", "https://www.ukn.edu.tw/").strip()

        if not kw or not ct:
            return jsonify({"detail": "關鍵字與條文內容為必填欄位"}), 400

        if conn:
            try:
                cursor = conn.cursor()
                sql = "INSERT INTO knowledge_base (category_id, subcategory, keyword, official_term, content, doc_name, page, url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                cursor.execute(sql, (cid, subcat, kw, ot, ct, doc, page, url))
                conn.commit()
                new_id = cursor.lastrowid
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "message": "校規新增成功！", "id": new_id}), 201
            except Exception:
                if conn: conn.close()

        new_id = max([r["id"] for r in DEMO_KNOWLEDGE_BASE], default=0) + 1
        new_item = {
            "id": new_id,
            "category_id": cid,
            "category_name": next((c["category_name"] for c in DEMO_CATEGORIES if c["category_id"] == cid), "選課與學分業務"),
            "subcategory": subcat,
            "keyword": kw,
            "official_term": ot,
            "content": ct,
            "doc_name": doc,
            "page": page,
            "url": url
        }
        DEMO_KNOWLEDGE_BASE.insert(0, new_item)
        return jsonify({"status": "success", "message": "校規新增成功 (示範模式)！", "id": new_id}), 201

@app.route("/api/rules/<int:rule_id>", methods=["PUT", "DELETE"])
@role_required("管理員", "教職員")
def update_or_delete_rule(rule_id):
    global DEMO_KNOWLEDGE_BASE
    conn = get_db_connection()

    if request.method == "PUT":
        data = request.get_json(silent=True) or {}
        kw = data.get("keyword", "").strip()
        ot = data.get("official_term", "").strip()
        ct = data.get("content", "").strip()
        doc = data.get("doc_name", "").strip()
        page = int(data.get("page", 1))
        url = data.get("url", "").strip()

        if conn:
            try:
                cursor = conn.cursor()
                sql = "UPDATE knowledge_base SET keyword = %s, official_term = %s, content = %s, doc_name = %s, page = %s, url = %s WHERE id = %s"
                cursor.execute(sql, (kw, ot, ct, doc, page, url, rule_id))
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "message": "條文更新成功！"}), 200
            except Exception:
                if conn: conn.close()

        for r in DEMO_KNOWLEDGE_BASE:
            if r["id"] == rule_id:
                if kw: r["keyword"] = kw
                if ot is not None: r["official_term"] = ot
                if ct: r["content"] = ct
                if doc: r["doc_name"] = doc
                if page: r["page"] = page
                if url: r["url"] = url
                return jsonify({"status": "success", "message": "條文更新成功 (示範模式)！"}), 200

        return jsonify({"detail": "找不到該條文 ID"}), 404

    elif request.method == "DELETE":
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM knowledge_base WHERE id = %s", (rule_id,))
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "message": "條文刪除成功！"}), 200
            except Exception:
                if conn: conn.close()

        DEMO_KNOWLEDGE_BASE = [r for r in DEMO_KNOWLEDGE_BASE if r["id"] != rule_id]
        return jsonify({"status": "success", "message": "條文已自清單刪除！"}), 200

# ==========================================
# 11. 同義詞與流程指引 API (/api/synonyms, /api/checklists)
# ==========================================

@app.route("/api/synonyms", methods=["GET", "POST"])
def manage_synonyms():
    global DEMO_SYNONYMS
    conn = get_db_connection()

    if request.method == "GET":
        if conn:
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT synonym_id, user_keyword, official_term, category_id FROM synonym_dictionary ORDER BY synonym_id ASC")
                rows = cursor.fetchall()
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "data": rows}), 200
            except Exception:
                if conn: conn.close()

        return jsonify({"status": "success", "data": DEMO_SYNONYMS}), 200

    elif request.method == "POST":
        # 新增同義詞僅限管理員/教職員，查詢 (GET) 則對所有人開放
        if session.get("role") not in ("管理員", "教職員"):
            return jsonify({"status": "error", "message": "權限不足，僅限特定身分存取"}), 403

        data = request.get_json(silent=True) or {}
        uk = data.get("user_keyword", "").strip()
        ot = data.get("official_term", "").strip()
        cid = int(data.get("category_id", 1))

        if not uk or not ot:
            return jsonify({"detail": "俗稱關鍵字與官方標準名稱為必填"}), 400

        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute("INSERT INTO synonym_dictionary (user_keyword, official_term, category_id) VALUES (%s, %s, %s)", (uk, ot, cid))
                conn.commit()
                new_id = cursor.lastrowid
                cursor.close()
                conn.close()
                return jsonify({"status": "success", "message": "同義詞新增成功！", "id": new_id}), 201
            except Exception:
                if conn: conn.close()

        new_id = max([s["synonym_id"] for s in DEMO_SYNONYMS], default=0) + 1
        DEMO_SYNONYMS.append({
            "synonym_id": new_id,
            "user_keyword": uk,
            "official_term": ot,
            "category_id": cid
        })
        return jsonify({"status": "success", "message": "同義詞新增成功！", "id": new_id}), 201

@app.route("/api/synonyms/<int:synonym_id>", methods=["DELETE"])
@role_required("管理員", "教職員")
def delete_synonym(synonym_id):
    global DEMO_SYNONYMS
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM synonym_dictionary WHERE synonym_id = %s", (synonym_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "success", "message": "同義詞刪除成功！"}), 200
        except Exception:
            if conn: conn.close()

    DEMO_SYNONYMS = [s for s in DEMO_SYNONYMS if s["synonym_id"] != synonym_id]
    return jsonify({"status": "success", "message": "同義詞刪除成功！"}), 200

@app.route("/api/checklists", methods=["GET"])
def get_checklists():
    conn = get_db_connection()
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

@app.route("/api/courses", methods=["GET"])
def get_courses():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            sql = """
                SELECT c.course_id, c.course_name, c.credits, c.prerequisite_id, c.is_required, c.dept_id, c.semester_suggest, c.description,
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

# ==========================================
# 12. 系統健康與統計 API
# ==========================================

@app.route("/api/health", methods=["GET"])
def health_check():
    db_online = is_db_available()
    return jsonify({
        "status": "online",
        "database": "connected" if db_online else "fallback_demo_mode",
        "db_mode": "MySQL 8.x / MariaDB (3NF Schema)" if db_online else "內建示範資料引擎 (3NF Demo Storage)",
        "session_user": session.get("username", "未登入 (訪客模式)"),
        "message": "Smart UKN 服務運作正常！"
    }), 200

@app.route("/api/stats", methods=["GET"])
def get_stats():
    return jsonify({
        "status": "success",
        "rules_count": len(DEMO_KNOWLEDGE_BASE),
        "synonyms_count": len(DEMO_SYNONYMS),
        "checklists_count": len(DEMO_CHECKLISTS),
        "courses_count": len(DEMO_COURSES),
        "visitors_count": len(DEMO_VISITOR_LOGS),
        "friction_reports_count": len(DEMO_FRICTION_REPORTS),
        "mode": "mysql" if is_db_available() else "demo"
    }), 200

# ==========================================
# 13. 伺服器主入口
# ==========================================

if __name__ == "__main__":
    os.makedirs("static", exist_ok=True)
    print("=" * 65)
    print("🚀 Smart UKN 康寧大學智慧校園服務平台 v3.0 已啟動！")
    print("🌐 學生與師生前台門戶: http://127.0.0.1:8000")
    print("🔑 統一登入與訪客通道: http://127.0.0.1:8000/login")
    print("⚙️ 系統管理員控制台:   http://127.0.0.1:8000/admin")
    print("📋 引導式選單分類 API: http://127.0.0.1:8000/api/categories")
    print("🎓 個人學分診斷 API:  http://127.0.0.1:8000/api/student/credits/diagnose")
    print("=" * 65)

    app.run(host="0.0.0.0", port=8000, debug=True)
