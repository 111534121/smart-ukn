# -*- coding: utf-8 -*-
"""
Smart UKN 統一資料庫持久化引擎 (admin_db.py)
支援 MySQL (當有連線時) 與 內嵌式 SQLite 資料庫 (data/smart_ukn.sqlite3，MySQL 離線時自動啟用)。
確保管理員的所有建置、修改、刪除操作均能真正持久化至資料庫檔案，且即時記錄至 audit_logs。
"""

import os
import time
import json
import sqlite3
import threading
from datetime import datetime
# pyrefly: ignore[missing-import]
from werkzeug.security import generate_password_hash
import mysql.connector

# 資料目錄
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
SQLITE_DB_PATH = os.path.join(DATA_DIR, "smart_ukn.sqlite3")
SEALS_DIR = os.path.join(DATA_DIR, "seals")
os.makedirs(SEALS_DIR, exist_ok=True)

_db_lock = threading.Lock()

# 跟 app.py 的 DB_CONFIG 分開獨立一份，不要互相 import：
# admin_db 的 init_mysql_schema() 在模組載入時就會跑，若用 `from app import get_db_connection`
# 回頭跟正在載入 app.py (再載入 admin_core → admin_db) 的流程互相等待，會變成
# "cannot import name 'bp' from partially initialized module 'admin_core'" 的循環 import 錯誤。
_DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "smart_ukn"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "charset": "utf8mb4",
}
_DB_RETRY_SECONDS = 30
_db_unavailable_until = 0.0

def _get_mysql_conn():
    """嘗試取得 MySQL 連線；若失敗回傳 None。連線失敗後 _DB_RETRY_SECONDS 內不再重試，避免每次呼叫都卡著等逾時。"""
    global _db_unavailable_until
    if time.monotonic() < _db_unavailable_until:
        return None
    try:
        conn = mysql.connector.connect(**_DB_CONFIG, connection_timeout=3)
        if conn and conn.is_connected():
            return conn
    except Exception as e:
        print(f"⚠️ admin_db 取得 MySQL 連線失敗，退回 SQLite：{e}")
    _db_unavailable_until = time.monotonic() + _DB_RETRY_SECONDS
    return None

def is_mysql_active():
    conn = _get_mysql_conn()
    if conn:
        try:
            conn.close()
            return True
        except Exception as e:
            print(f"⚠️ 檢查 MySQL 可用性時關閉連線失敗：{e}")
    return False

def get_sqlite_conn():
    """取得 SQLite 連線並設定 row_factory 為 sqlite3.Row"""
    conn = sqlite3.connect(SQLITE_DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
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
            if mysql_conn:
                try:
                    mysql_conn.close()
                except Exception as close_e:
                    print(f"⚠️ 關閉失敗的 MySQL 連線時又出錯：{close_e}")
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
                    try:
                        s_cur = s_conn.cursor()
                        s_cur.execute(adapt_sql_for_sqlite(sql), params)
                        s_conn.commit()
                    finally:
                        s_conn.close()
            except Exception as e:
                print(f"⚠️ MySQL 寫入成功但同步到 SQLite 失敗，兩邊資料可能不一致：{e}")
            return res
        except Exception as e:
            if mysql_conn:
                try:
                    mysql_conn.close()
                except Exception as close_e:
                    print(f"⚠️ 關閉失敗的 MySQL 連線時又出錯：{close_e}")
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
    except Exception as e:
        print(f"⚠️ 稽核紀錄同步到記憶體 DEMO_AUDIT_LOGS 失敗（資料庫寫入已成功，不影響正式紀錄）：{e}")

def get_user_seal(username):
    """查詢使用者的啟用印章紀錄"""
    return query_one(
        "SELECT * FROM user_seals WHERE username = %s AND is_active = 1",
        (username,)
    )

def save_user_seal(username, seal_filename, original_filename="", file_size=0, mime_type="image/png"):
    """儲存或更新使用者的電子印章記錄並寫入審計軌跡"""
    existing = query_one("SELECT id, username, seal_filename FROM user_seals WHERE username = %s", (username,))
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if existing:
        execute_db(
            "UPDATE user_seals SET seal_filename = %s, original_filename = %s, file_size = %s, mime_type = %s, is_active = 1, updated_at = %s WHERE username = %s",
            (seal_filename, original_filename, file_size, mime_type, now_str, username)
        )
        seal_id = existing["id"]
        log_audit_trail("user_seals", seal_id, "UPDATE", before=existing, after={"username": username, "seal_filename": seal_filename}, changed_by=username)
    else:
        res = execute_db(
            "INSERT INTO user_seals (username, seal_filename, original_filename, file_size, mime_type, is_active, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, 1, %s, %s)",
            (username, seal_filename, original_filename, file_size, mime_type, now_str, now_str)
        )
        seal_id = res.get("lastrowid", 1)
        log_audit_trail("user_seals", seal_id, "INSERT", after={"username": username, "seal_filename": seal_filename}, changed_by=username)
    return seal_id

def init_sqlite_schema():
    """初始化 SQLite 資料表結構與種子資料"""
    with _db_lock:
        conn = get_sqlite_conn()
        try:
            _init_sqlite_schema_internal(conn)
        finally:
            conn.close()

def _init_sqlite_schema_internal(conn):
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
            can_manage_dorm INTEGER DEFAULT 0,
            office TEXT DEFAULT '',
            permissions TEXT DEFAULT '查看,建立,修改',
            is_active INTEGER DEFAULT 1,
            default_password TEXT DEFAULT '123456'
        )
    """)
    for alter_sql in (
        "ALTER TABLE users ADD COLUMN office TEXT DEFAULT ''",
        "ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '查看,建立,修改'",
        "ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1",
        "ALTER TABLE users ADD COLUMN default_password TEXT DEFAULT '123456'",
    ):
        try:
            cur.execute(alter_sql)
        except Exception as e:
            print(f"⚠️ 略過（欄位可能已存在）：{alter_sql} -> {e}")

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

    # 16. checklist_items (行政申辦資訊)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS checklist_items (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER DEFAULT 1,
            category_name TEXT NOT NULL,
            business_name TEXT NOT NULL,
            office_location TEXT DEFAULT '',
            office_hours TEXT DEFAULT '週一至週五 08:30-17:00',
            contact_phone TEXT DEFAULT '',
            required_docs TEXT DEFAULT '',
            steps_json TEXT DEFAULT '[]',
            apply_period TEXT DEFAULT '',
            form_download_url TEXT DEFAULT '#',
            system_url TEXT DEFAULT '',
            deadline_week_info TEXT DEFAULT '',
            related_kb_id INTEGER,
            audience TEXT DEFAULT '學生'
        )
    """)
    for alter_sql in (
        "ALTER TABLE checklist_items ADD COLUMN category_id INTEGER DEFAULT 1",
        "ALTER TABLE checklist_items ADD COLUMN system_url TEXT DEFAULT ''",
        "ALTER TABLE checklist_items ADD COLUMN deadline_week_info TEXT DEFAULT ''",
        "ALTER TABLE checklist_items ADD COLUMN related_kb_id INTEGER",
        "ALTER TABLE checklist_items ADD COLUMN audience TEXT DEFAULT '學生'",
    ):
        try:
            cur.execute(alter_sql)
        except Exception as e:
            print(f"⚠️ 略過（欄位可能已存在）：{alter_sql} -> {e}")

    # 17. deadlines (重要日程與期限)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS deadlines (
            deadline_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT DEFAULT '教務處',
            week_label TEXT DEFAULT '本學期',
            semester_week INTEGER DEFAULT 1,
            start_date TEXT,
            end_date TEXT NOT NULL,
            status_badge TEXT DEFAULT '進行中',
            description TEXT DEFAULT '',
            related_system_url TEXT DEFAULT '',
            applies_to_dept TEXT,
            applies_to_role TEXT DEFAULT 'all'
        )
    """)
    try:
        cur.execute("ALTER TABLE deadlines ADD COLUMN semester_week INTEGER DEFAULT 1")
    except Exception as e:
        print(f"⚠️ 略過（deadlines.semester_week 欄位可能已存在）：{e}")

    # 18. academic_calendar (學期校曆事項)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS academic_calendar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            category TEXT DEFAULT '教務',
            related_checklist_id INTEGER,
            owner_key TEXT,
            note TEXT,
            source TEXT
        )
    """)

    # 19. search_feedback (搜尋滿意度回饋)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS search_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT NOT NULL,
            kb_id INTEGER,
            helpful INTEGER NOT NULL,
            comment TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 20. anniversary_events & anniversary_wishes (校慶跑馬燈公告與祝福)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS anniversary_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL DEFAULT '康寧大學校慶',
            content TEXT NOT NULL DEFAULT '歡迎全校師生共襄盛舉',
            name_zh TEXT DEFAULT '康寧大學校慶',
            name_en TEXT DEFAULT 'UKN Anniversary Celebration',
            name_ja TEXT DEFAULT '康寧大学 創立記念祭',
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            announce_days INTEGER DEFAULT 30,
            require_approval INTEGER DEFAULT 1,
            is_enabled INTEGER DEFAULT 1,
            link_url TEXT DEFAULT '',
            allow_wishes INTEGER DEFAULT 1,
            is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    for alter_sql in (
        "ALTER TABLE anniversary_events ADD COLUMN title TEXT DEFAULT '康寧大學校慶'",
        "ALTER TABLE anniversary_events ADD COLUMN content TEXT DEFAULT '歡迎全校師生共襄盛舉'",
        "ALTER TABLE anniversary_events ADD COLUMN name_zh TEXT DEFAULT ''",
        "ALTER TABLE anniversary_events ADD COLUMN name_en TEXT DEFAULT ''",
        "ALTER TABLE anniversary_events ADD COLUMN name_ja TEXT DEFAULT ''",
        "ALTER TABLE anniversary_events ADD COLUMN announce_days INTEGER DEFAULT 30",
        "ALTER TABLE anniversary_events ADD COLUMN require_approval INTEGER DEFAULT 1",
        "ALTER TABLE anniversary_events ADD COLUMN is_enabled INTEGER DEFAULT 1",
        "ALTER TABLE anniversary_events ADD COLUMN link_url TEXT DEFAULT ''",
        "ALTER TABLE anniversary_events ADD COLUMN allow_wishes INTEGER DEFAULT 1",
        "ALTER TABLE anniversary_events ADD COLUMN is_active INTEGER DEFAULT 1",
        "ALTER TABLE anniversary_events ADD COLUMN sort_order INTEGER DEFAULT 1",
    ):
        try:
            cur.execute(alter_sql)
        except Exception as e:
            print(f"⚠️ 略過（欄位可能已存在）：{alter_sql} -> {e}")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS anniversary_wishes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            nickname TEXT DEFAULT '匿名同學',
            message TEXT NOT NULL,
            lang TEXT DEFAULT 'zh',
            status TEXT DEFAULT '待審核',
            is_approved INTEGER DEFAULT 1,
            ip_hash TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    for alter_sql in (
        "ALTER TABLE anniversary_wishes ADD COLUMN nickname TEXT DEFAULT '匿名同學'",
        "ALTER TABLE anniversary_wishes ADD COLUMN lang TEXT DEFAULT 'zh'",
        "ALTER TABLE anniversary_wishes ADD COLUMN status TEXT DEFAULT '待審核'",
        "ALTER TABLE anniversary_wishes ADD COLUMN is_approved INTEGER DEFAULT 1",
        "ALTER TABLE anniversary_wishes ADD COLUMN ip_hash TEXT DEFAULT ''",
    ):
        try:
            cur.execute(alter_sql)
        except Exception as e:
            print(f"⚠️ 略過（欄位可能已存在）：{alter_sql} -> {e}")

    # 21. user_seals (老師與行政人員電子印章)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_seals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            seal_filename TEXT NOT NULL,
            original_filename TEXT DEFAULT '',
            file_size INTEGER DEFAULT 0,
            mime_type TEXT DEFAULT 'image/png',
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # 檢查是否需要載入種子資料
    cur.execute("SELECT COUNT(*) AS c FROM departments")
    if cur.fetchone()["c"] == 0:
        _seed_sqlite_data(cur, conn)
    else:
        _seed_missing_sqlite_tables(cur, conn)

def _seed_missing_sqlite_tables(cur, conn):
    """若已有主要資料表但缺少部分輔助表資料，自動補齊種子資料"""
    try:
        cur.execute("SELECT COUNT(*) AS c FROM checklist_items")
        if cur.fetchone()["c"] == 0:
            checklist_data = [
                (0, 0, '通用申辦', '自行上傳之申請表件', '["線上下載或填寫申請表件", "上傳文件並填寫申辦資訊", "送出由承辦單位審核"]', '自行上傳之申請表及相關附件', '週一至週五 08:30 - 17:00', '各承辦單位辦公室', '02-2632-1181', '#upload', '', '全學期受理', None, '學生'),
                (1, 1, '課務組', '課程停修申請', '["至校務資訊系統登入『停修申請表』", "列印紙本停修申請單", "親自送請任課教師簽章同意", "送請班級導師及科主任簽章", "於第12週五前送交教務處課務組核備"]', '停修申請單紙本、歷年成績單正本', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A201 (課務組)', '02-2632-1181 分機 310, 312', '/forms/course_withdraw_form', 'http://talk.ukn.edu.tw/class_redi/class.php', '第 10-12 週 (本週受理中)', 1, '學生'),
                (2, 2, '生輔組', '學生請假申請 (病假/事假)', '["登入學生資訊系統填寫請假單", "上傳就醫證明或相關佐證文件圖檔", "送出後通知導師進行線上簽核", "請假超過3日由生輔組組長複核", "系統顯示審核通過即完成登錄"]', '健保特約就醫證明、就診收據影本', '週一至週五 08:00 - 17:30', '行政大樓 1 樓 學務處生輔組', '02-2632-1181 分機 211', '/forms/leave_application_form', 'https://ec.ukn.edu.tw/AskLeave/login.aspx', '請假日當日起 3 日內', 2, '學生'),
                (3, 3, '通識中心', '外語證照免修與學分抵免', '["填寫通識外語抵免申請表", "備妥多益/英檢/雅思成績單正本及影本各一份", "送交通識教育中心辦公室查驗正本", "教務處課務組複審學分折抵", "次學期初於歷年成績單確認抵免註記"]', '外語檢定成績單正本、影本、抵免申請書', '週一至週五 09:00 - 16:30', '卓越樓 3 樓 C305 (通識教育中心)', '02-2632-1181 分機 520, 521', '/forms/english_waiver_form', 'http://203.71.63.13/academic/', '開學前至加退選截止 (已截止)', 3, '學生'),
                (4, 1, '註冊組', '學士班畢業學分資格預審', '["登入畢業審查系統列印學分檢核表", "核對科專業必修、選修與通識學分缺口", "確認英文畢業門檻與專題通過證明", "至科辦公室請科主任初審簽章", "送交教務處註冊組進行畢業資格決審"]', '歷年成績單正本、畢業學分預審表、外語通過證明', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A202 (註冊組)', '02-2632-1181 分機 321, 322', '/forms/graduation_audit_form', 'http://203.71.63.13/academic/', '大四第 8-16 週 (進行中)', 4, '學生'),
                (5, 3, '研發處', '專業證照與競賽獲獎獎勵金申請', '["登入研發處證照獎勵申請平台", "填寫證照/競賽名稱、證書字號與發證單位", "上傳證書正反面與郵局存摺封面圖檔", "列印紙本印領清冊並親筆簽名", "送交研發處實習就業組審核並撥款"]', '證照證書影本、郵局存摺封面影本、印領清冊', '週一至週五 09:00 - 17:00', '圖資大樓 2 樓 研發處實習就業組', '02-2632-1181 分機 612', '/forms/certificate_reward_form', 'https://oes3.ukn.edu.tw/~license/', '每學期第 1-5 週', 5, '學生')
            ]
            cur.executemany("INSERT OR REPLACE INTO checklist_items (item_id, category_id, category_name, business_name, steps_json, required_docs, office_hours, office_location, contact_phone, form_download_url, system_url, deadline_week_info, related_kb_id, audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", checklist_data)
        else:
            cur.execute("SELECT COUNT(*) AS c FROM checklist_items WHERE item_id = 0")
            if cur.fetchone()["c"] == 0:
                cur.execute(
                    "INSERT OR REPLACE INTO checklist_items (item_id, category_id, category_name, business_name, steps_json, required_docs, office_hours, office_location, contact_phone, form_download_url, system_url, deadline_week_info, related_kb_id, audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (0, 0, '通用申辦', '自行上傳之申請表件', '["線上下載或填寫申請表件", "上傳文件並填寫申辦資訊", "送出由承辦單位審核"]', '自行上傳之申請表及相關附件', '週一至週五 08:30 - 17:00', '各承辦單位辦公室', '02-2632-1181', '#upload', '', '全學期受理', None, '學生')
                )
    except Exception as e:
        print(f"⚠️ checklist_items 預設資料寫入失敗：{e}")

    try:
        cur.execute("SELECT COUNT(*) AS c FROM deadlines")
        if cur.fetchone()["c"] == 0:
            deadlines_data = [
                (1, '115-1 學期課程停修申請', '教務處課務組', 11, '2026-10-01', '2026-10-18', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '學期第 10-12 週開放停修申請，每人以 2 科為限，須完成導師與主任簽章。', '進行中 (剩 3 天)'),
                (2, '期中預警評量與導師學習輔導訪談', '學務處/教務處', 11, '2026-10-05', '2026-10-20', '學生,老師,家長', 'CS', 'http://203.71.63.13/academic/', '期中成績不及格達 1/2 者列入預警，導師將安排個別學習輔導與座談。', '進行中 (剩 5 天)'),
                (3, '大四應屆畢業生學分資格預審', '教務處註冊組', 11, '2026-09-15', '2026-11-30', '學生', 'CS', 'http://203.71.63.13/academic/', '大四學生請至註冊組核對必選修、通識與外語門檻缺口。', '進行中 (剩 35 天)'),
                (4, '共同外語與證照學分抵免申請', '通識教育中心', 3, '2026-09-01', '2026-09-15', '學生', None, 'http://203.71.63.13/academic/', '大一共同外語抵免申請已截止，逾期者請於下學期初辦理。', '已截止'),
                (5, '暑期重補修意願登記與開班調查', '教務處課務組', 14, '2026-11-01', '2026-11-20', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '先修科目不及格需重修者，可預先登記暑期課程開班意願。', '尚未開放')
            ]
            cur.executemany("INSERT OR REPLACE INTO deadlines (deadline_id, title, category, semester_week, start_date, end_date, applies_to_role, applies_to_dept, related_system_url, description, status_badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", deadlines_data)
    except Exception as e:
        print(f"⚠️ deadlines 預設資料寫入失敗：{e}")

    try:
        cur.execute("SELECT COUNT(*) AS c FROM academic_calendar")
        if cur.fetchone()["c"] == 0:
            calendar_data = [
                (1, '加退選', '2026-09-14', '2026-09-25', '教務', None, None, None, None),
                (2, '學雜費繳費期限', '2026-09-01', '2026-09-30', '繳費', None, None, None, None),
                (3, '獎助學金申請期限', '2026-09-21', '2026-10-16', '獎助', None, None, None, None),
                (4, '停修申請', '2026-10-01', '2026-10-16', '教務', 1, None, None, None),
                (5, '教學意見調查開放期間', '2026-12-14', '2027-01-15', '教務', None, None, None, None)
            ]
            cur.executemany("INSERT OR REPLACE INTO academic_calendar (id, event_name, start_date, end_date, category, related_checklist_id, owner_key, note, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", calendar_data)
    except Exception as e:
        print(f"⚠️ academic_calendar 預設資料寫入失敗：{e}")

    try:
        cur.execute("SELECT COUNT(*) AS c FROM anniversary_events")
        if cur.fetchone()["c"] == 0:
            anniversary_data = [
                (1, '康寧大學校慶', 'UKN Anniversary Celebration', '康寧大学 創立記念祭', '2026-11-01', '2026-11-01', 30, 1, 1, '康寧大學校慶', '歡迎全校師生共襄盛舉', '', 1, 1, 1)
            ]
            cur.executemany("INSERT OR REPLACE INTO anniversary_events (id, name_zh, name_en, name_ja, start_date, end_date, announce_days, require_approval, is_enabled, title, content, link_url, allow_wishes, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", anniversary_data)
    except Exception as e:
        print(f"⚠️ anniversary_events 預設資料寫入失敗：{e}")

    conn.commit()

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
        (1, 'student1', pw_std, '學生', 'S112001', '王小明', None, 0, '', '查看'),
        (2, 'student2', pw_std, '學生', 'S112002', '李美華', None, 0, '', '查看'),
        (3, 'parent1', pw_std, '家長', 'S112001', '王大明 (王小明家長)', None, 0, '', '查看'),
        (4, 'staff1', pw_std, '教職員', None, '周立威 (教務處課務組)', None, 0, '教務處', '查看,建立,修改'),
        (5, 'admin', pw_adm, '系統管理員', None, '系統總管理員', None, 1, '', '查看,建立,修改,帳號管理,權限設定,系統檢測'),
        (6, 'teacher1', pw_std, '老師', None, '彭賓鈺 老師', '資管五忠', 0, '', '查看'),
        (7, 'S112004', pw_std, '學生', 'S112004', '陳冠宇', None, 0, '', '查看'),
        (8, 'S112005', pw_std, '學生', 'S112005', '林雨潔', None, 0, '', '查看'),
        (9, 'parent2', pw_std, '家長', 'S112002', '李建國 (李美華家長)', None, 0, '', '查看'),
        (10, 'S112003', pw_std, '學生', 'S112003', '張建華', None, 0, '', '查看'),
        (20, 'dorm_demo', pw_std, '教職員', None, '宿舍管理示範員', None, 1, '學生事務處／住宿管理', '查看,建立,修改'),
        (21, 'staff_admin', pw_std, '內容管理人員', None, '林怡君 (校務行政人員)', None, 0, '教務處', '查看,建立,修改')
    ]
    cur.executemany("INSERT OR REPLACE INTO users (user_id, username, password_hash, role, student_id, full_name, advised_class, can_manage_dorm, office, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", users_data)

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
        (1, 'departments', 'CS', 'INSERT', '系統超級管理員', '系統管理員', '127.0.0.1', None, json.dumps({'dept_id': 'CS', 'dept_name': '資訊管理科（五專）'}, ensure_ascii=False), '2026-10-22 10:00:00'),
        (2, 'course_map', 'CS101', 'INSERT', '系統超級管理員', '系統管理員', '127.0.0.1', None, json.dumps({'course_id': 'CS101', 'course_name': '計算機概論', 'credits': 3}, ensure_ascii=False), '2026-10-22 10:05:00'),
        (3, 'graduation_requirements', '1', 'INSERT', '系統超級管理員', '系統管理員', '127.0.0.1', None, json.dumps({'dept_id': 'CS', 'total_credits_req': 128}, ensure_ascii=False), '2026-10-22 10:10:00')
    ]
    cur.executemany("INSERT OR REPLACE INTO audit_logs (log_id, table_name, record_id, action, changed_by, changed_by_role, ip_address, before_json, after_json, changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", audit_init_data)

    # 16. checklist_items
    checklist_data = [
        (0, 0, '通用申辦', '自行上傳之申請表件', '["線上下載或填寫申請表件", "上傳文件並填寫申辦資訊", "送出由承辦單位審核"]', '自行上傳之申請表及相關附件', '週一至週五 08:30 - 17:00', '各承辦單位辦公室', '02-2632-1181', '#upload', '', '全學期受理', None, '學生'),
        (1, 1, '課務組', '課程停修申請', '["至校務資訊系統登入『停修申請表』", "列印紙本停修申請單", "親自送請任課教師簽章同意", "送請班級導師及科主任簽章", "於第12週五前送交教務處課務組核備"]', '停修申請單紙本、歷年成績單正本', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A201 (課務組)', '02-2632-1181 分機 310, 312', '/forms/course_withdraw_form', 'http://talk.ukn.edu.tw/class_redi/class.php', '第 10-12 週 (本週受理中)', 1, '學生'),
        (2, 2, '生輔組', '學生請假申請 (病假/事假)', '["登入學生資訊系統填寫請假單", "上傳就醫證明或相關佐證文件圖檔", "送出後通知導師進行線上簽核", "請假超過3日由生輔組組長複核", "系統顯示審核通過即完成登錄"]', '健保特約就醫證明、就診收據影本', '週一至週五 08:00 - 17:30', '行政大樓 1 樓 學務處生輔組', '02-2632-1181 分機 211', '/forms/leave_application_form', 'https://ec.ukn.edu.tw/AskLeave/login.aspx', '請假日當日起 3 日內', 2, '學生'),
        (3, 3, '通識中心', '外語證照免修與學分抵免', '["填寫通識外語抵免申請表", "備妥多益/英檢/雅思成績單正本及影本各一份", "送交通識教育中心辦公室查驗正本", "教務處課務組複審學分折抵", "次學期初於歷年成績單確認抵免註記"]', '外語檢定成績單正本、影本、抵免申請書', '週一至週五 09:00 - 16:30', '卓越樓 3 樓 C305 (通識教育中心)', '02-2632-1181 分機 520, 521', '/forms/english_waiver_form', 'http://203.71.63.13/academic/', '開學前至加退選截止 (已截止)', 3, '學生'),
        (4, 1, '註冊組', '學士班畢業學分資格預審', '["登入畢業審查系統列印學分檢核表", "核對科專業必修、選修與通識學分缺口", "確認英文畢業門檻與專題通過證明", "至科辦公室請科主任初審簽章", "送交教務處註冊組進行畢業資格決審"]', '歷年成績單正本、畢業學分預審表、外語通過證明', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A202 (註冊組)', '02-2632-1181 分機 321, 322', '/forms/graduation_audit_form', 'http://203.71.63.13/academic/', '大四第 8-16 週 (進行中)', 4, '學生'),
        (5, 3, '研發處', '專業證照與競賽獲獎獎勵金申請', '["登入研發處證照獎勵申請平台", "填寫證照/競賽名稱、證書字號與發證單位", "上傳證書正反面與郵局存摺封面圖檔", "列印紙本印領清冊並親筆簽名", "送交研發處實習就業組審核並撥款"]', '證照證書影本、郵局存摺封面影本、印領清冊', '週一至週五 09:00 - 17:00', '圖資大樓 2 樓 研發處實習就業組', '02-2632-1181 分機 612', '/forms/certificate_reward_form', 'https://oes3.ukn.edu.tw/~license/', '每學期第 1-5 週', 5, '學生')
    ]
    cur.executemany("INSERT OR REPLACE INTO checklist_items (item_id, category_id, category_name, business_name, steps_json, required_docs, office_hours, office_location, contact_phone, form_download_url, system_url, deadline_week_info, related_kb_id, audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", checklist_data)

    # 17. deadlines
    deadlines_data = [
        (1, '115-1 學期課程停修申請', '教務處課務組', 11, '2026-10-01', '2026-10-18', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '學期第 10-12 週開放停修申請，每人以 2 科為限，須完成導師與主任簽章。', '進行中 (剩 3 天)'),
        (2, '期中預警評量與導師學習輔導訪談', '學務處/教務處', 11, '2026-10-05', '2026-10-20', '學生,老師,家長', 'CS', 'http://203.71.63.13/academic/', '期中成績不及格達 1/2 者列入預警，導師將安排個別學習輔導與座談。', '進行中 (剩 5 天)'),
        (3, '大四應屆畢業生學分資格預審', '教務處註冊組', 11, '2026-09-15', '2026-11-30', '學生', 'CS', 'http://203.71.63.13/academic/', '大四學生請至註冊組核對必選修、通識與外語門檻缺口。', '進行中 (剩 35 天)'),
        (4, '共同外語與證照學分抵免申請', '通識教育中心', 3, '2026-09-01', '2026-09-15', '學生', None, 'http://203.71.63.13/academic/', '大一共同外語抵免申請已截止，逾期者請於下學期初辦理。', '已截止'),
        (5, '暑期重補修意願登記與開班調查', '教務處課務組', 14, '2026-11-01', '2026-11-20', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '先修科目不及格需重修者，可預先登記暑期課程開班意願。', '尚未開放')
    ]
    cur.executemany("INSERT OR REPLACE INTO deadlines (deadline_id, title, category, semester_week, start_date, end_date, applies_to_role, applies_to_dept, related_system_url, description, status_badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", deadlines_data)

    # 18. academic_calendar
    calendar_data = [
        (1, '加退選', '2026-09-14', '2026-09-25', '教務', None, None, None, None),
        (2, '學雜費繳費期限', '2026-09-01', '2026-09-30', '繳費', None, None, None, None),
        (3, '獎助學金申請期限', '2026-09-21', '2026-10-16', '獎助', None, None, None, None),
        (4, '停修申請', '2026-10-01', '2026-10-16', '教務', 1, None, None, None),
        (5, '教學意見調查開放期間', '2026-12-14', '2027-01-15', '教務', None, None, None, None)
    ]
    cur.executemany("INSERT OR REPLACE INTO academic_calendar (id, event_name, start_date, end_date, category, related_checklist_id, owner_key, note, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", calendar_data)

    # 19. anniversary_events
    anniversary_data = [
        (1, '康寧大學校慶', 'UKN Anniversary Celebration', '康寧大学 創立記念祭', '2026-11-01', '2026-11-01', 30, 1, 1, '康寧大學校慶', '歡迎全校師生共襄盛舉', '', 1, 1, 1)
    ]
    cur.executemany("INSERT OR REPLACE INTO anniversary_events (id, name_zh, name_en, name_ja, start_date, end_date, announce_days, require_approval, is_enabled, title, content, link_url, allow_wishes, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", anniversary_data)

    conn.commit()


def init_mysql_schema():
    """若 MySQL 可用，只補齊管理帳號所需的資料表欄位。"""
    mysql_conn = _get_mysql_conn()
    if not mysql_conn:
        return
    try:
        cur = mysql_conn.cursor(dictionary=True)
        cur.execute("SHOW COLUMNS FROM users")
        cols = {row["Field"]: row for row in cur.fetchall()}

        # 1. 擴充 role enum
        try:
            cur.execute("""
                ALTER TABLE users
                MODIFY COLUMN role ENUM('學生','家長','教職員','老師','管理員','系統管理員','內容管理人員','處室承辦','科助','住宿管理員','訪客') NOT NULL
            """)
        except Exception as e:
            print(f"⚠️ users.role enum 擴充略過（可能已是最新定義）：{e}")

        # 2. 補齊 office, permissions, is_active 欄位
        if "office" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN office VARCHAR(100) NOT NULL DEFAULT ''")
        if "permissions" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN permissions VARCHAR(255) NOT NULL DEFAULT '查看,建立,修改'")
        if "is_active" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1")
        if "default_password" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN default_password VARCHAR(50) NOT NULL DEFAULT '123456'")

        # 3. 建立 user_seals (老師與行政人員電子印章)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_seals (
                id INT(11) NOT NULL AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL,
                seal_filename VARCHAR(255) NOT NULL,
                original_filename VARCHAR(255) DEFAULT '',
                file_size INT(11) DEFAULT 0,
                mime_type VARCHAR(50) DEFAULT 'image/png',
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uk_user_seal (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)


        mysql_conn.commit()
        cur.close()
    except Exception as e:
        print(f"⚠️ MySQL schema 自動升級略過: {e}")
    finally:
        try:
            mysql_conn.close()
        except Exception as e:
            print(f"⚠️ 關閉 MySQL schema 升級連線失敗：{e}")


# 模組載入時自動初始化 SQLite 與 MySQL 資料表
try:
    init_sqlite_schema()
except Exception as e:
    print(f"⚠️ SQLite 初始化警告: {e}")

try:
    init_mysql_schema()
except Exception as e:
    print(f"⚠️ MySQL 初始化警告: {e}")
