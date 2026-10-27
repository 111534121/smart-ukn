# -*- coding: utf-8 -*-
"""
Smart UKN 統一資料庫持久化引擎 (admin_db.py)
支援 MySQL (當有連線時) 與 內嵌式 SQLite 資料庫 (data/smart_ukn.sqlite3，MySQL 離線時自動啟用)。
確保管理員的所有建置、修改、刪除操作均能真正持久化至資料庫檔案，且即時記錄至 audit_logs。
"""

import os
import json
import sqlite3
import threading
from datetime import datetime
from werkzeug.security import generate_password_hash

# 資料目錄
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
SQLITE_DB_PATH = os.path.join(DATA_DIR, "smart_ukn.sqlite3")

_db_lock = threading.Lock()

def _get_mysql_conn():
    """嘗試取得 MySQL 連線；若失敗回傳 None"""
    try:
        from app import get_db_connection
        conn = get_db_connection()
        if conn and conn.is_connected():
            return conn
    except Exception:
        pass
    return None

def is_mysql_active():
    conn = _get_mysql_conn()
    if conn:
        try:
            conn.close()
            return True
        except Exception:
            pass
    return False

def get_sqlite_conn():
    """取得 SQLite 連線並設定 row_factory 為 sqlite3.Row"""
    conn = sqlite3.connect(SQLITE_DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def adapt_sql_for_sqlite(sql):
    """將 MySQL 風格的 %s 轉換為 SQLite 的 ?"""
    # 簡單將 %s 替換為 ?
    return sql.replace("%s", "?")

def query_db(sql, params=()):
    """
    執行 SELECT 查詢並回傳 dict 列表。
    優先使用 MySQL，若 MySQL 離線則使用 SQLite。
    """
    mysql_conn = _get_mysql_conn()
    if mysql_conn:
        try:
            cursor = mysql_conn.cursor(dictionary=True)
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            cursor.close()
            mysql_conn.close()
            return rows
        except Exception as e:
            try: mysql_conn.close()
            except Exception: pass
            print(f"⚠️ MySQL 查詢失敗，切換至 SQLite: {e}")

    # SQLite 備援
    with _db_lock:
        conn = get_sqlite_conn()
        try:
            cursor = conn.cursor()
            sqlite_sql = adapt_sql_for_sqlite(sql)
            cursor.execute(sqlite_sql, params)
            rows = [dict(row) for row in cursor.fetchall()]
            cursor.close()
            return rows
        finally:
            conn.close()

def query_one(sql, params=()):
    """執行 SELECT 查詢並回傳單筆 dict，查無結果回傳 None"""
    rows = query_db(sql, params)
    return rows[0] if rows else None

def execute_db(sql, params=()):
    """
    執行 INSERT, UPDATE, DELETE 操作。
    若 MySQL 可用則寫入 MySQL，同時亦可鏡像至 SQLite。
    若 MySQL 離線則寫入 SQLite。
    回傳 dict: {"lastrowid": id, "rowcount": count}
    """
    mysql_conn = _get_mysql_conn()
    if mysql_conn:
        try:
            cursor = mysql_conn.cursor()
            cursor.execute(sql, params)
            mysql_conn.commit()
            res = {"lastrowid": cursor.lastrowid, "rowcount": cursor.rowcount}
            cursor.close()
            mysql_conn.close()
            # 異步或順便同步進 SQLite (保持雙軌同步)
            try:
                with _db_lock:
                    s_conn = get_sqlite_conn()
                    s_cur = s_conn.cursor()
                    s_cur.execute(adapt_sql_for_sqlite(sql), params)
                    s_conn.commit()
                    s_conn.close()
            except Exception:
                pass
            return res
        except Exception as e:
            try: mysql_conn.close()
            except Exception: pass
            print(f"⚠️ MySQL 寫入失敗，改用 SQLite: {e}")

    # SQLite 寫入
    with _db_lock:
        conn = get_sqlite_conn()
        try:
            cursor = conn.cursor()
            sqlite_sql = adapt_sql_for_sqlite(sql)
            cursor.execute(sqlite_sql, params)
            conn.commit()
            res = {"lastrowid": cursor.lastrowid, "rowcount": cursor.rowcount}
            cursor.close()
            return res
        finally:
            conn.close()

def log_audit_trail(table_name, record_id, action, before=None, after=None, changed_by=None, role=None, ip=None):
    """
    自動記錄異動軌跡至 audit_logs 資料表。
    包含操作者、身分、IP、異動前 JSON 與異動後 JSON。
    """
    changed_by = changed_by or "系統管理員"
    role = role or "管理員"
    ip = ip or "127.0.0.1"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    before_str = json.dumps(before, ensure_ascii=False, default=str) if before is not None else None
    after_str = json.dumps(after, ensure_ascii=False, default=str) if after is not None else None

    sql = """
        INSERT INTO audit_logs (table_name, record_id, action, changed_by, changed_by_role, ip_address, before_json, after_json, changed_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    execute_db(sql, (table_name, str(record_id), action, changed_by, role, ip, before_str, after_str, now_str))

    # 同時同步至 app.DEMO_AUDIT_LOGS 以防離線測試需讀取記憶體
    try:
        from app import DEMO_AUDIT_LOGS
        DEMO_AUDIT_LOGS.insert(0, {
            "log_id": len(DEMO_AUDIT_LOGS) + 1,
            "table_name": table_name,
            "record_id": str(record_id),
            "action": action,
            "changed_by": changed_by,
            "changed_by_role": role,
            "ip_address": ip,
            "before_json": before,
            "after_json": after,
            "changed_at": now_str
        })
    except Exception:
        pass

def init_sqlite_schema():
    """初始化 SQLite 資料表結構與種子資料"""
    with _db_lock:
        conn = get_sqlite_conn()
        cur = conn.cursor()

        # 1. departments
        cur.execute("""
            CREATE TABLE IF NOT EXISTS departments (
                dept_id TEXT PRIMARY KEY,
                dept_name TEXT NOT NULL,
                college_name TEXT NOT NULL
            )
        """)

        # 2. students
        cur.execute("""
            CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                dept_id TEXT NOT NULL,
                admission_year INTEGER NOT NULL,
                class_name TEXT NOT NULL,
                parent_phone TEXT,
                grade_level INTEGER,
                gpa REAL,
                conduct_score REAL,
                identity_type TEXT
            )
        """)

        # 3. users
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                student_id TEXT,
                full_name TEXT NOT NULL,
                advised_class TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                can_manage_dorm INTEGER DEFAULT 0
            )
        """)

        # 4. course_map
        cur.execute("""
            CREATE TABLE IF NOT EXISTS course_map (
                course_id TEXT PRIMARY KEY,
                course_name TEXT NOT NULL,
                credits INTEGER NOT NULL,
                prerequisite_id TEXT,
                is_required INTEGER NOT NULL DEFAULT 1,
                course_type TEXT NOT NULL DEFAULT '專業必修',
                dept_id TEXT NOT NULL DEFAULT 'CS',
                semester_suggest TEXT DEFAULT '大一上',
                description TEXT,
                semester_hours REAL
            )
        """)

        # 5. graduation_requirements
        cur.execute("""
            CREATE TABLE IF NOT EXISTS graduation_requirements (
                req_id INTEGER PRIMARY KEY AUTOINCREMENT,
                dept_id TEXT NOT NULL,
                total_credits_req INTEGER NOT NULL DEFAULT 128,
                major_required_req INTEGER NOT NULL DEFAULT 60,
                major_elective_req INTEGER NOT NULL DEFAULT 30,
                general_req INTEGER NOT NULL DEFAULT 28,
                english_threshold_name TEXT NOT NULL DEFAULT '多益 550 分或通過進階英文檢定',
                ethics_req INTEGER NOT NULL DEFAULT 2,
                project_req INTEGER NOT NULL DEFAULT 3
            )
        """)

        # 6. knowledge_categories
        cur.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_categories (
                category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_name TEXT NOT NULL,
                icon TEXT DEFAULT '📖',
                sort_order INTEGER DEFAULT 1
            )
        """)

        # 7. knowledge_base
        cur.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_base (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                subcategory TEXT NOT NULL,
                keyword TEXT NOT NULL,
                official_term TEXT DEFAULT '',
                content TEXT NOT NULL,
                doc_name TEXT NOT NULL,
                page INTEGER DEFAULT 1,
                url TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 8. synonym_dictionary
        cur.execute("""
            CREATE TABLE IF NOT EXISTS synonym_dictionary (
                synonym_id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER,
                user_keyword TEXT NOT NULL,
                official_term TEXT NOT NULL
            )
        """)

        # 9. audit_logs
        cur.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                action TEXT NOT NULL,
                changed_by TEXT NOT NULL,
                changed_by_role TEXT,
                ip_address TEXT,
                before_json TEXT,
                after_json TEXT,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 10. search_logs
        cur.execute("""
            CREATE TABLE IF NOT EXISTS search_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                matched INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 11. unmatched_queries
        cur.execute("""
            CREATE TABLE IF NOT EXISTS unmatched_queries (
                query_id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text TEXT UNIQUE NOT NULL,
                search_count INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT '待處理',
                resolved_term TEXT,
                first_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 12. visitor_logs
        cur.execute("""
            CREATE TABLE IF NOT EXISTS visitor_logs (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                visitor_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                school_from TEXT NOT NULL,
                purpose TEXT NOT NULL,
                target_dept TEXT DEFAULT '資訊管理科（五專）',
                visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT DEFAULT '127.0.0.1'
            )
        """)

        # 13. student_credits
        cur.execute("""
            CREATE TABLE IF NOT EXISTS student_credits (
                credit_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                course_id TEXT NOT NULL,
                semester TEXT NOT NULL,
                score REAL,
                is_passed INTEGER NOT NULL
            )
        """)

        # 14. attendance_records
        cur.execute("""
            CREATE TABLE IF NOT EXISTS attendance_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                date TEXT NOT NULL,
                course_name TEXT NOT NULL,
                type TEXT NOT NULL,
                notified INTEGER NOT NULL DEFAULT 0,
                hours REAL,
                exam_policy TEXT NOT NULL DEFAULT 'ordinary'
            )
        """)

        # 15. student_records
        cur.execute("""
            CREATE TABLE IF NOT EXISTS student_records (
                record_id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                kind TEXT NOT NULL,
                item TEXT NOT NULL,
                count INTEGER NOT NULL DEFAULT 1,
                reason TEXT,
                semester TEXT NOT NULL,
                record_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()

        # 檢查是否需要載入種子資料
        cur.execute("SELECT COUNT(*) AS c FROM departments")
        if cur.fetchone()["c"] == 0:
            _seed_sqlite_data(cur, conn)

        conn.close()

def _seed_sqlite_data(cur, conn):
    """填入康寧大學完整初始資料"""
    # 1. departments
    departments_data = [
        ('CS', '資訊管理科（五專）', '商業資訊學院'),
        ('BA', '企業管理學系（科）', '商業資訊學院'),
        ('ANI', '數位影視動畫科（五專）', '商業資訊學院'),
        ('ENG', '應用外語科（五專）', '商業資訊學院'),
        ('NUR', '護理科（五專）', '護理健康學院'),
        ('OPT', '視光科（五專）', '護理健康學院'),
        ('ECE', '嬰幼兒保育學系', '護理健康學院'),
        ('LTC', '長期照護學系', '護理健康學院')
    ]
    cur.executemany("INSERT OR REPLACE INTO departments (dept_id, dept_name, college_name) VALUES (?, ?, ?)", departments_data)

    # 2. students
    students_data = [
        ('S112001', '王小明', 'CS', 112, '資管五忠', '0912-345-678', 5, 3.82, 88.0, '一般生'),
        ('S112002', '李美華', 'CS', 112, '資管五忠', '0922-333-444', 5, 3.95, 92.0, '一般生'),
        ('S112003', '張建華', 'NUR', 112, '護理四忠', '0933-555-666', 4, 3.45, 85.0, '原住民學生'),
        ('S112004', '陳冠宇', 'CS', 112, '資管四孝', '0955-222-111', 4, 3.70, 80.0, '一般生'),
        ('S112005', '林雨潔', 'CS', 112, '資管五忠', '0966-777-888', 5, 3.20, 86.0, '低收入戶學生')
    ]
    cur.executemany("INSERT OR REPLACE INTO students (student_id, full_name, dept_id, admission_year, class_name, parent_phone, grade_level, gpa, conduct_score, identity_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", students_data)

    # 3. users
    pw_std = generate_password_hash("123456")
    pw_adm = generate_password_hash("admin123")
    users_data = [
        (1, 'student1', pw_std, '學生', 'S112001', '王小明', None, 0),
        (2, 'student2', pw_std, '學生', 'S112002', '李美華', None, 0),
        (3, 'parent1', pw_std, '家長', 'S112001', '王大明 (小明家長)', None, 0),
        (4, 'staff1', pw_std, '教職員', None, '周立威 (教務處職員)', None, 0),
        (5, 'admin', pw_adm, '管理員', None, '系統超級管理員', None, 1),
        (6, 'teacher1', pw_std, '老師', None, '彭賓鈺 老師', '資管五忠', 0),
        (7, 'S112004', pw_std, '學生', 'S112004', '陳冠宇', None, 0),
        (8, 'S112005', pw_std, '學生', 'S112005', '林雨潔', None, 0),
        (9, 'parent2', pw_std, '家長', 'S112002', '李建國 (美華家長)', None, 0),
        (20, 'dorm_demo', pw_std, '教職員', None, '宿舍管理示範員', None, 1)
    ]
    cur.executemany("INSERT OR REPLACE INTO users (user_id, username, password_hash, role, student_id, full_name, advised_class, can_manage_dorm) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", users_data)

    # 4. course_map
    courses_data = [
        ('CS101', '計算機概論', 3, None, 1, '專業必修', 'CS', '大一上', '計算機科學基礎、電腦架構、二進位運算、作業系統與網路概論。', 3.0),
        ('CS102', '程式設計(一)', 3, 'CS101', 1, '專業必修', 'CS', '大一下', 'Python 與 C 語言基礎邏輯、變數、迴圈、陣列與函式設計。', 3.0),
        ('CS201', '資料結構', 3, 'CS102', 1, '專業必修', 'CS', '大二上', '陣列、鏈結串列、堆疊、佇列、二元樹、圖形演算法與搜尋排序。', 3.0),
        ('CS202', '物件導向程式設計', 3, 'CS102', 1, '專業必修', 'CS', '大二下', '類別、封裝、繼承、多型、Java/C++ 實作與 GUI 設計。', 3.0),
        ('CS301', '演算法分析', 3, 'CS201', 1, '專業必修', 'CS', '大三上', '時間複雜度、分治演算法、貪婪演算法、動態規劃與 NP 問題。', 3.0),
        ('CS302', '資料庫系統概論', 3, 'CS201', 1, '專業必修', 'CS', '大三上', '關聯式資料庫、SQL 查詢最佳化、3NF 正規化與 MySQL/PostgreSQL 實務。', 3.0),
        ('CS303', '網頁前後端開發實務', 3, 'CS102', 0, '專業選修', 'CS', '大三上', 'HTML5/Tailwind/FastAPI/Flask 全端系統整合與 REST API。', 3.0),
        ('CS304', '雲端運算與虛擬化', 3, 'CS101', 0, '專業選修', 'CS', '大三下', 'Docker 容器化、Kubernetes、AWS 與微服務架構實戰。', 3.0),
        ('CS401', '畢業專題研討(一)', 3, 'CS302', 1, '專業必修', 'CS', '大四上', '綜合資訊系統開發、專題實作、系統架構設計與成果展覽。', 3.0),
        ('CS402', '畢業專題研討(二)', 3, 'CS401', 1, '專業必修', 'CS', '大四下', '畢業專題成果報告撰寫、系統部署與校外競賽發表。', 3.0),
        ('EN101', '基礎英文(一)', 2, None, 1, '共同必修', 'CS', '大一上', '大一基礎外語聽說讀寫與實用生活英語。', 2.0),
        ('EN102', '基礎英文(二)', 2, 'EN101', 1, '共同必修', 'CS', '大一下', '進階商用英文與學術閱讀報告寫作。', 2.0),
        ('GE101', '大學之道與校園倫理', 2, None, 0, '通識教育', 'CS', '大一上', '校園生活適應、生命教育、學術誠信與職場倫理。', 2.0),
        ('GE102', '跨領域思維與創新科技', 2, None, 0, '通識教育', 'CS', '大二上', '人工智慧生活應用、設計思考與數位轉型思維。', 2.0),
        ('GE103', '環境永續與社會責任', 2, None, 0, '通識教育', 'CS', '大二下', 'ESG 永續發展目標、生態保育與社會公益實踐。', 2.0)
    ]
    cur.executemany("INSERT OR REPLACE INTO course_map (course_id, course_name, credits, prerequisite_id, is_required, course_type, dept_id, semester_suggest, description, semester_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", courses_data)

    # 5. graduation_requirements
    grad_data = [
        (1, 'CS', 128, 60, 30, 28, '多益 550 分或通過進階英文檢定', 2, 3),
        (2, 'BA', 128, 58, 32, 28, '多益 500 分或同等語文檢定證明', 2, 3),
        (3, 'NUR', 135, 75, 25, 25, '通過基本護理師國考模擬測驗', 2, 2),
        (4, 'LTC', 128, 62, 28, 28, '取得照顧服務員單一級證照', 2, 2),
        (5, 'ANI', 128, 55, 35, 28, '通過畢業動畫作品展演評審', 2, 3),
        (6, 'ENG', 128, 56, 34, 28, '多益 750 分或全民英檢中高級', 2, 3),
        (7, 'OPT', 132, 70, 26, 26, '通過驗光師國考實作測驗', 2, 2),
        (8, 'ECE', 128, 60, 30, 28, '取得合格保母人員證照或教保員資格', 2, 2)
    ]
    cur.executemany("INSERT OR REPLACE INTO graduation_requirements (req_id, dept_id, total_credits_req, major_required_req, major_elective_req, general_req, english_threshold_name, ethics_req, project_req) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", grad_data)

    # 6. knowledge_categories
    cats_data = [
        (1, '教務學則與選課', '📖', 1),
        (2, '學務生輔與請假', '📝', 2),
        (3, '證照抵免與獎助', '🏆', 3),
        (4, '總務校園與設施', '🏢', 4)
    ]
    cur.executemany("INSERT OR REPLACE INTO knowledge_categories (category_id, category_name, icon, sort_order) VALUES (?, ?, ?, ?)", cats_data)

    # 7. knowledge_base
    kb_data = [
        (1, 1, '選課與停修', '棄修', '停修', '學生於加退選截止後，因特殊原因無法繼續修習某門課程，得於學期第 10-12 週申請停修（每學期以 2 科為限）。停修課程仍須登記於歷年成績單，但成績欄註記「停修」，不計入該學期學分數計算，且停修後學分數不得低於該學期最低應修學分。', '康寧大學學生學則.pdf', 12, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
        (2, 2, '出缺勤請假', '病假', '學生請假規定', '學生因病無法到校上課，應於請假日當日起 3 日內（含例假日）登入校務系統提出線上請假申請，並檢附健保特約醫療院所開立之就醫證明或診斷書，經導師核准後始完成請假手續。', '康寧大學學生請假規則.pdf', 5, 'https://www.ukn.edu.tw/p/412-1000-382.php?Lang=zh-tw'),
        (3, 3, '語言證照抵免', '英文抵免', '語言證照抵免', '學生取得多益測驗 (TOEIC) 550 分以上、全民英檢 (GEPT) 中級複試通過或同等級國際外語證照者，得於每學期開學後至加退選截止前，檢附成績單正本與影本至通識教育中心申請抵免大一共同外語「基礎英文(一)」及「基礎英文(二)」共 4 學分。', '康寧大學共同外語學分抵免辦法.pdf', 3, 'https://www.ukn.edu.tw/p/412-1000-383.php?Lang=zh-tw'),
        (4, 1, '擋修與先修', '擋修', '先修科目未通過', '本校各科系必修課程若訂有先修科目限制（例如：程式設計(一) 為 資料結構 之先修科目），學生該先修科目未達及格標準（60 分）者，電腦選課系統將自動擋修，不得修習後續先修關聯課程，需待先修科目重修及格後始得修習。', '康寧大學課程選修要點.pdf', 8, 'https://www.ukn.edu.tw/p/412-1000-384.php?Lang=zh-tw'),
        (5, 3, '專業證照獎勵', '證照補助', '學生取得專業證照獎勵辦法', '學生在學期間取得教育部認可之乙級以上技術士證照或國際專業原廠認證，每張最高可申請新台幣 3,000 至 10,000 元獎勵金。申請期間為每學期第 1 至 5 週，請至研發處實習就業組辦理。', '康寧大學學生專業證照獎勵要點.pdf', 2, 'https://www.ukn.edu.tw/p/412-1000-385.php?Lang=zh-tw')
    ]
    cur.executemany("INSERT OR REPLACE INTO knowledge_base (id, category_id, subcategory, keyword, official_term, content, doc_name, page, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", kb_data)

    # 8. synonym_dictionary
    synonyms_data = [
        (1, 1, '棄修', '停修'),
        (2, 1, '退選', '停修'),
        (3, 1, '不要修了', '停修'),
        (4, 1, '擋修', '先修科目未通過'),
        (5, 1, '先修沒過', '先修科目未通過'),
        (6, 3, '英文抵免', '語言證照抵免'),
        (7, 3, '英檢抵免', '語言證照抵免'),
        (8, 3, '多益抵免', '語言證照抵免'),
        (9, 2, '事假', '學生請假規定'),
        (10, 2, '公假', '學生請假規定'),
        (11, 2, '喪假', '學生請假規定'),
        (12, 3, '證照錢', '學生取得專業證照獎勵辦法'),
        (13, 1, '二一', '學業成績退學規定'),
        (14, 1, '暑修', '暑期開班授課規定')
    ]
    cur.executemany("INSERT OR REPLACE INTO synonym_dictionary (synonym_id, category_id, user_keyword, official_term) VALUES (?, ?, ?, ?)", synonyms_data)

    # 9. unmatched_queries
    unmatched_data = [
        (1, '退費手續', 14, '待處理', None),
        (2, '兵役緩徵', 9, '待處理', None),
        (3, '宿舍門禁時間', 18, '待處理', None),
        (4, '機車通行證申請', 22, '待處理', None),
        (5, '轉系規定', 7, '待處理', None)
    ]
    cur.executemany("INSERT OR REPLACE INTO unmatched_queries (query_id, query_text, search_count, status, resolved_term) VALUES (?, ?, ?, ?, ?)", unmatched_data)

    # 10. search_logs
    search_logs_data = [
        (1, '棄修', 1),
        (2, '擋修', 1),
        (3, '病假', 1),
        (4, '退費手續', 0),
        (5, '英文抵免', 1),
        (6, '宿舍門禁時間', 0),
        (7, '多益抵免', 1),
        (8, '機車通行證申請', 0)
    ]
    cur.executemany("INSERT OR REPLACE INTO search_logs (id, query, matched) VALUES (?, ?, ?)", search_logs_data)

    # 11. visitor_logs
    visitor_data = [
        (1, '林志明', '0911-222-333', '內湖高中', '五專免試入學諮詢', '資訊管理科（五專）', '127.0.0.1'),
        (2, '陳曉君', '0922-444-555', '南港高工', '四技二專甄選訪校', '數位影視動畫科（五專）', '127.0.0.1'),
        (3, '張宏宇', '0933-666-777', '新北高中', '轉學考規章諮詢', '企業管理學系（科）', '127.0.0.1')
    ]
    cur.executemany("INSERT OR REPLACE INTO visitor_logs (log_id, visitor_name, phone, school_from, purpose, target_dept, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)", visitor_data)

    # 12. student_credits
    credits_data = [
        (1, 'S112001', 'CS101', '112-1', 85.0, 1),
        (2, 'S112001', 'CS102', '112-2', 55.0, 0),
        (3, 'S112001', 'EN101', '112-1', 78.0, 1),
        (4, 'S112001', 'GE101', '112-1', 82.0, 1),
        (5, 'S112002', 'CS101', '112-1', 92.5, 1),
        (6, 'S112002', 'CS102', '112-2', 88.0, 1),
        (7, 'S112002', 'CS201', '113-1', 85.0, 1),
        (8, 'S112002', 'EN101', '112-1', 80.0, 1),
        (9, 'S112002', 'GE101', '112-1', 90.0, 1),
        (10, 'S112004', 'CS101', '112-1', 88.0, 1),
        (11, 'S112004', 'CS102', '112-2', 91.0, 1),
        (12, 'S112004', 'CS201', '113-1', 84.0, 1),
        (13, 'S112004', 'EN101', '112-1', 80.0, 1),
        (14, 'S112004', 'CS202', '113-2', 79.0, 1),
        (15, 'S112004', 'GE101', '112-1', 86.0, 1),
        (16, 'S112005', 'CS101', '112-1', 76.0, 1),
        (17, 'S112005', 'CS102', '112-2', 68.0, 1),
        (18, 'S112005', 'CS201', '113-1', 48.0, 0),
        (19, 'S112005', 'EN101', '112-1', 81.0, 1),
        (20, 'S112005', 'GE101', '112-1', 88.0, 1)
    ]
    cur.executemany("INSERT OR REPLACE INTO student_credits (credit_id, student_id, course_id, semester, score, is_passed) VALUES (?, ?, ?, ?, ?, ?)", credits_data)

    # 13. attendance_records
    attendance_data = [
        (1, 'S112001', '2026-10-15', '資料結構', '曠課', 1, 2.0, 'ordinary'),
        (2, 'S112001', '2026-10-18', '程式設計(一)', '病假', 1, 3.0, 'ordinary'),
        (3, 'S112002', '2026-10-12', '演算法分析', '遲到', 0, 1.0, 'ordinary'),
        (4, 'S112004', '2026-10-14', '基礎英文(一)', '事假', 1, 2.0, 'ordinary'),
        (5, 'S112005', '2026-10-19', '資料庫系統概論', '曠課', 1, 3.0, 'ordinary')
    ]
    cur.executemany("INSERT OR REPLACE INTO attendance_records (id, student_id, date, course_name, type, notified, hours, exam_policy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", attendance_data)

    # 14. student_records
    records_data = [
        (1, 'S112001', '幹部', '班長', 1, '擔任 115-1 班級幹部認真盡責', '115-1', '2026-09-14'),
        (2, 'S112001', '獎懲', '嘉獎', 2, '協助班級校慶進場活動表現優異', '114-2', '2026-06-20'),
        (3, 'S112001', '獎懲', '申誡', 1, '上課使用手機經多次勸導未改善', '115-1', '2026-10-02'),
        (4, 'S112002', '幹部', '課程小老師', 1, '程式設計(一) 課程小老師協助同儕輔導', '115-1', '2026-09-14'),
        (5, 'S112002', '獎懲', '小功', 1, '代表學校參加全國技藝競賽榮獲優勝，為校爭光', '114-2', '2026-05-28'),
        (6, 'S112005', '幹部', '學藝股長', 1, '負責班級學藝宣導事務', '115-1', '2026-09-14'),
        (7, 'S112005', '獎懲', '嘉獎', 1, '熱心協助新生始業輔導訓練', '115-1', '2026-09-05'),
        (8, 'S112004', '獎懲', '小過', 1, '學期無故曠課累計達規定警戒節數', '114-2', '2026-06-10')
    ]
    cur.executemany("INSERT OR REPLACE INTO student_records (record_id, student_id, kind, item, count, reason, semester, record_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", records_data)

    # 15. audit_logs
    audit_init_data = [
        (1, 'departments', 'CS', 'INSERT', '系統超級管理員', '管理員', '127.0.0.1', None, json.dumps({'dept_id': 'CS', 'dept_name': '資訊管理科（五專）'}), '2026-10-22 10:00:00'),
        (2, 'course_map', 'CS101', 'INSERT', '系統超級管理員', '管理員', '127.0.0.1', None, json.dumps({'course_id': 'CS101', 'course_name': '計算機概論', 'credits': 3}), '2026-10-22 10:05:00'),
        (3, 'graduation_requirements', '1', 'INSERT', '系統超級管理員', '管理員', '127.0.0.1', None, json.dumps({'dept_id': 'CS', 'total_credits_req': 128}), '2026-10-22 10:10:00')
    ]
    cur.executemany("INSERT OR REPLACE INTO audit_logs (log_id, table_name, record_id, action, changed_by, changed_by_role, ip_address, before_json, after_json, changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", audit_init_data)

    conn.commit()

# 模組載入時自動初始化 SQLite 資料表
init_sqlite_schema()
