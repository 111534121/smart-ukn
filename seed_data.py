import json
import mysql.connector
import os
import sys
from werkzeug.security import generate_password_hash
from dashboard import demo_data as dashboard_demo
from scholarship_demo import DEMO_SCHOLARSHIPS, DEMO_SCHOLARSHIP_PROFILES
from anniversary import DEMO_EVENTS as DEMO_ANNIVERSARY_EVENTS
from faculty import DEMO_PROFILES as DEMO_FACULTY_PROFILES
from applications import DEMO_APPLICATIONS
from conduct import DEMO_RECORDS as DEMO_CONDUCT_RECORDS, DEMO_EVALUATIONS as DEMO_CONDUCT_EVALUATIONS

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    try: sys.stderr.reconfigure(encoding='utf-8')
    except Exception: pass

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "smart_ukn"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "charset": "utf8mb4"
}

def seed_data():
    print("=" * 60)
    print("🌱 Smart UKN 3NF 完整測試資料匯入程序 (seed_data)")
    print("=" * 60)
    
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. 寫入系所 (以學校公告之科系清單為準；已存在的舊名稱一併更新)
        cursor.execute("""
            INSERT INTO `departments` (`dept_id`, `dept_name`, `college_name`) VALUES
            ('LTC', '長期照護學系', '護理健康學院'),
            ('ECE', '嬰幼兒保育學系', '護理健康學院'),
            ('NUR', '護理科（五專）', '護理健康學院'),
            ('OPT', '視光科（五專）', '護理健康學院'),
            ('BA', '企業管理學系（科）', '商業資訊學院'),
            ('CS', '資訊管理科（五專）', '商業資訊學院'),
            ('ANI', '數位影視動畫科（五專）', '商業資訊學院'),
            ('ENG', '應用外語科（五專）', '商業資訊學院')
            ON DUPLICATE KEY UPDATE `dept_name` = VALUES(`dept_name`), `college_name` = VALUES(`college_name`)
        """)

        # 2. 寫入學生主檔 (已存在的學生一併更新班級名稱)
        cursor.execute("""
            INSERT INTO `students` (`student_id`, `full_name`, `dept_id`, `admission_year`, `class_name`, `parent_phone`) VALUES
            ('S112001', '王小明', 'CS', 112, '資管五忠', '0912-345-678'),
            ('S112002', '李美華', 'CS', 112, '資管五忠', '0922-333-444'),
            ('S112003', '張建華', 'NUR', 112, '護理四忠', '0933-555-666'),
            ('S112004', '陳冠宇', 'CS', 112, '資管四孝', '0955-222-111'),
            ('S112005', '林雨潔', 'CS', 112, '資管五忠', '0966-777-888')
            ON DUPLICATE KEY UPDATE `dept_id` = VALUES(`dept_id`), `class_name` = VALUES(`class_name`)
        """)

        # 3. 寫入使用者帳號 (示範用：密碼皆為 123456 / admin 為 admin123)
        #    學生可用帳號或學號登入；S112004、S112005 為示範學號登入帳號
        student_pw = generate_password_hash("123456")
        admin_pw = generate_password_hash("admin123")
        cursor.executemany("""
            INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `role`, `student_id`, `full_name`, `advised_class`)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, [
            (1, 'student1', student_pw, '學生', 'S112001', '王小明', None),
            (2, 'student2', student_pw, '學生', 'S112002', '李美華', None),
            (3, 'parent1', student_pw, '家長', 'S112001', '王大明 (小明家長)', None),
            (4, 'staff1', student_pw, '教職員', None, '周立威 (教務處職員)', None),
            (5, 'admin', admin_pw, '管理員', None, '系統超級管理員', None),
            (6, 'teacher1', student_pw, '老師', None, '彭賓鈺 老師', '資管五忠'),
            (7, 'S112004', student_pw, '學生', 'S112004', '陳冠宇', None),
            (8, 'S112005', student_pw, '學生', 'S112005', '林雨潔', None),
            (9, 'parent2', student_pw, '家長', 'S112002', '李建國 (美華家長)', None),
        ])

        # 4. 寫入完整課程地圖與先修擋修鏈
        cursor.execute("""
            INSERT IGNORE INTO `course_map` (`course_id`, `course_name`, `credits`, `prerequisite_id`, `is_required`, `course_type`, `dept_id`, `semester_suggest`, `description`) VALUES
            ('CS101', '計算機概論', 3, NULL, 1, '專業必修', 'CS', '大一上', '計算機科學基礎、電腦架構、二進位運算、作業系統與網路概論。'),
            ('CS102', '程式設計(一)', 3, 'CS101', 1, '專業必修', 'CS', '大一下', 'Python 與 C 語言基礎邏輯、變數、迴圈、陣列與函式設計。'),
            ('CS201', '資料結構', 3, 'CS102', 1, '專業必修', 'CS', '大二上', '陣列、鏈結串列、堆疊、佇列、二元樹、圖形演算法與搜尋排序。'),
            ('CS202', '物件導向程式設計', 3, 'CS102', 1, '專業必修', 'CS', '大二下', '類別、封裝、繼承、多型、Java/C++ 實作與 GUI 設計。'),
            ('CS301', '演算法分析', 3, 'CS201', 1, '專業必修', 'CS', '大三上', '時間複雜度、分治演算法、貪婪演算法、動態規劃與 NP 問題。'),
            ('CS302', '資料庫系統概論', 3, 'CS201', 1, '專業必修', 'CS', '大三上', '關聯式資料庫、SQL 查詢最佳化、3NF 正規化與 MySQL/PostgreSQL 實務。'),
            ('CS303', '網頁前後端開發實務', 3, 'CS102', 0, '專業選修', 'CS', '大三上', 'HTML5/Tailwind/FastAPI/Flask 全端系統整合與 REST API。'),
            ('CS304', '雲端運算與虛擬化', 3, 'CS101', 0, '專業選修', 'CS', '大三下', 'Docker 容器化、Kubernetes、AWS 與微服務架構實戰。'),
            ('CS401', '畢業專題研討(一)', 3, 'CS302', 1, '專業必修', 'CS', '大四上', '綜合資訊系統開發、專題實作、系統架構設計與成果展覽。'),
            ('CS402', '畢業專題研討(二)', 3, 'CS401', 1, '專業必修', 'CS', '大四下', '畢業專題成果報告撰寫、系統部署與校外競賽發表。'),
            ('EN101', '基礎英文(一)', 2, NULL, 1, '共同必修', 'CS', '大一上', '大一基礎外語聽說讀寫與實用生活英語。'),
            ('EN102', '基礎英文(二)', 2, 'EN101', 1, '共同必修', 'CS', '大一下', '進階商用英文與學術閱讀報告寫作。'),
            ('GE101', '大學之道與校園倫理', 2, NULL, 0, '通識教育', 'CS', '大一上', '校園生活適應、生命教育、學術誠信與職場倫理。'),
            ('GE102', '跨領域思維與創新科技', 2, NULL, 0, '通識教育', 'CS', '大二上', '人工智慧生活應用、設計思考與數位轉型思維。'),
            ('GE103', '環境永續與社會責任', 2, NULL, 0, '通識教育', 'CS', '大二下', 'ESG 永續發展目標、生態保育與社會公益實踐。')
        """)

        # 5. 寫入學生成績與學分
        cursor.execute("""
            INSERT IGNORE INTO `student_credits` (`credit_id`, `student_id`, `course_id`, `semester`, `score`, `is_passed`) VALUES
            (1, 'S112001', 'CS101', '112-1', 85.00, 1),
            (2, 'S112001', 'CS102', '112-2', 55.00, 0),
            (3, 'S112001', 'EN101', '112-1', 78.00, 1),
            (4, 'S112001', 'GE101', '112-1', 82.00, 1),
            (5, 'S112002', 'CS101', '112-1', 92.50, 1),
            (6, 'S112002', 'CS102', '112-2', 88.00, 1),
            (7, 'S112002', 'CS201', '113-1', 85.00, 1),
            (8, 'S112002', 'EN101', '112-1', 80.00, 1),
            (9, 'S112002', 'GE101', '112-1', 90.00, 1),
            (10, 'S112004', 'CS101', '112-1', 88.00, 1),
            (11, 'S112004', 'CS102', '112-2', 91.00, 1),
            (12, 'S112004', 'CS201', '113-1', 84.00, 1),
            (13, 'S112004', 'EN101', '112-1', 80.00, 1),
            (14, 'S112004', 'CS202', '113-2', 79.00, 1),
            (15, 'S112004', 'GE101', '112-1', 86.00, 1),
            (16, 'S112005', 'CS101', '112-1', 76.00, 1),
            (17, 'S112005', 'CS102', '112-2', 68.00, 1),
            (18, 'S112005', 'CS201', '113-1', 48.00, 0),
            (19, 'S112005', 'EN101', '112-1', 81.00, 1),
            (20, 'S112005', 'GE101', '112-1', 88.00, 1)
        """)

        # 6. 寫入規章大類
        cursor.execute("""
            INSERT IGNORE INTO `knowledge_categories` (`category_id`, `category_name`, `icon`, `sort_order`) VALUES
            (1, '教務學則與選課', '📖', 1),
            (2, '學務生輔與請假', '📝', 2),
            (3, '證照抵免與獎助', '🏆', 3),
            (4, '總務校園與設施', '🏢', 4)
        """)

        # 7. 寫入知識庫條文
        cursor.execute("""
            INSERT IGNORE INTO `knowledge_base` (`id`, `category_id`, `subcategory`, `keyword`, `official_term`, `content`, `doc_name`, `page`, `url`) VALUES
            (1, 1, '選課與停修', '棄修', '停修', '學生於加退選截止後，因特殊原因無法繼續修習某門課程，得於學期第 10-12 週申請停修（每學期以 2 科為限）。停修課程仍須登記於歷年成績單，但成績欄註記「停修」，不計入該學期學分數計算，且停修後學分數不得低於該學期最低應修學分。', '康寧大學學生學則.pdf', 12, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
            (2, 2, '出缺勤請假', '病假', '學生請假規定', '學生因病無法到校上課，應於請假日當日起 3 日內（含例假日）登入校務系統提出線上請假申請，並檢附健保特約醫療院所開立之就醫證明或診斷書，經導師核准後始完成請假手續。', '康寧大學學生請假規則.pdf', 5, 'https://www.ukn.edu.tw/p/412-1000-382.php?Lang=zh-tw'),
            (3, 3, '語言證照抵免', '英文抵免', '語言證照抵免', '學生取得多益測驗 (TOEIC) 550 分以上、全民英檢 (GEPT) 中級複試通過或同等級國際外語證照者，得於每學期開學後至加退選截止前，檢附成績單正本與影本至通識教育中心申請抵免大一共同外語「基礎英文(一)」及「基礎英文(二)」共 4 學分。', '康寧大學共同外語學分抵免辦法.pdf', 3, 'https://www.ukn.edu.tw/p/412-1000-383.php?Lang=zh-tw'),
            (4, 1, '擋修與先修', '擋修', '先修科目未通過', '本校各科系必修課程若訂有先修科目限制（例如：程式設計(一) 為 資料結構 之先修科目），學生該先修科目未達及格標準（60 分）者，電腦選課系統將自動擋修，不得修習後續先修關聯課程，需待先修科目重修及格後始得修習。', '康寧大學課程選修要點.pdf', 8, 'https://www.ukn.edu.tw/p/412-1000-384.php?Lang=zh-tw'),
            (5, 3, '專業證照獎勵', '證照補助', '學生取得專業證照獎勵辦法', '學生在學期間取得教育部認可之乙級以上技術士證照或國際專業原廠認證，每張最高可申請新台幣 3,000 至 10,000 元獎勵金。申請期間為每學期第 1 至 5 週，請至研發處實習就業組辦理。', '康寧大學學生專業證照獎勵要點.pdf', 2, 'https://www.ukn.edu.tw/p/412-1000-385.php?Lang=zh-tw')
        """)

        # 8. 寫入同義詞對照庫
        cursor.execute("""
            INSERT IGNORE INTO `synonym_dictionary` (`synonym_id`, `category_id`, `user_keyword`, `official_term`) VALUES
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
        """)

        # 9. 寫入行政申辦流程指引 (含處室位置、分機、表單下載與規章關聯)
        cursor.execute("""
            INSERT IGNORE INTO `checklist_items` (`item_id`, `category_id`, `category_name`, `business_name`, `steps_json`, `required_docs`, `office_hours`, `office_location`, `contact_phone`, `form_download_url`, `system_url`, `deadline_week_info`, `related_kb_id`, `audience`) VALUES
            (1, 1, '課務組', '課程停修申請', 
             '[\"至校務資訊系統登入『停修申請表』\", \"列印紙本停修申請單\", \"親自送請任課教師簽章同意\", \"送請班級導師及科主任簽章\", \"於第12週五前送交教務處課務組核備\"]', 
             '停修申請單紙本、歷年成績單正本', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A201 (課務組)', '02-2632-1181 分機 310, 312', '/forms/course_withdraw_form', 'http://talk.ukn.edu.tw/class_redi/class.php', '第 10-12 週 (本週受理中)', 1, '學生'),
            
            (2, 2, '生輔組', '學生請假申請 (病假/事假)', 
             '[\"登入學生資訊系統填寫請假單\", \"上傳就醫證明或相關佐證文件圖檔\", \"送出後通知導師進行線上簽核\", \"請假超過3日由生輔組組長複核\", \"系統顯示審核通過即完成登錄\"]', 
             '健保特約就醫證明、就診收據影本', '週一至週五 08:00 - 17:30', '行政大樓 1 樓 學務處生輔組', '02-2632-1181 分機 211', '/forms/leave_application_form', 'https://ec.ukn.edu.tw/AskLeave/login.aspx', '請假日當日起 3 日內', 2, '學生'),
            
            (3, 3, '通識中心', '外語證照免修與學分抵免', 
             '[\"填寫通識外語抵免申請表\", \"備妥多益/英檢/雅思成績單正本及影本各一份\", \"送交通識教育中心辦公室查驗正本\", \"教務處課務組複審學分折抵\", \"次學期初於歷年成績單確認抵免註記\"]', 
             '外語檢定成績單正本、影本、抵免申請書', '週一至週五 09:00 - 16:30', '卓越樓 3 樓 C305 (通識教育中心)', '02-2632-1181 分機 520, 521', '/forms/english_waiver_form', 'http://203.71.63.13/academic/', '開學前至加退選截止 (已截止)', 3, '學生'),
             
            (4, 1, '註冊組', '學士班畢業學分資格預審', 
             '[\"登入畢業審查系統列印學分檢核表\", \"核對科專業必修、選修與通識學分缺口\", \"確認英文畢業門檻與專題通過證明\", \"至科辦公室請科主任初審簽章\", \"送交教務處註冊組進行畢業資格決審\"]', 
             '歷年成績單正本、畢業學分預審表、外語通過證明', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A202 (註冊組)', '02-2632-1181 分機 321, 322', '/forms/graduation_audit_form', 'http://203.71.63.13/academic/', '大四第 8-16 週 (進行中)', 4, '學生'),
             
            (5, 3, '研發處', '專業證照與競賽獲獎獎勵金申請', 
             '[\"登入研發處證照獎勵申請平台\", \"填寫證照/競賽名稱、證書字號與發證單位\", \"上傳證書正反面與郵局存摺封面圖檔\", \"列印紙本印領清冊並親筆簽名\", \"送交研發處實習就業組審核並撥款\"]', 
             '證照證書影本、郵局存摺封面影本、印領清冊', '週一至週五 09:00 - 17:00', '圖資大樓 2 樓 研發處實習就業組', '02-2632-1181 分機 612', '/forms/certificate_reward_form', 'https://oes3.ukn.edu.tw/~license/', '每學期第 1-5 週', 5, '學生')
        """)

        # 11. 寫入未命中關鍵字種子 (功能 4: 詞庫自動成長)
        cursor.execute("""
            INSERT IGNORE INTO `unmatched_queries` (`query_id`, `query_text`, `search_count`, `status`, `resolved_term`) VALUES
            (1, '退費手續', 14, '待處理', NULL),
            (2, '兵役緩徵', 9, '待處理', NULL),
            (3, '宿舍門禁時間', 18, '待處理', NULL),
            (4, '機車通行證申請', 22, '待處理', NULL),
            (5, '轉系規定', 7, '待處理', NULL)
        """)

        # 12. 寫入搜尋結果滿意度評價 (功能 4)
        cursor.execute("""
            INSERT IGNORE INTO `search_feedback` (`feedback_id`, `kb_id`, `query_text`, `is_helpful`, `comment`) VALUES
            (1, 1, '棄修', 1, '流程很清楚，知道要去課務組了！'),
            (2, 4, '擋修', 1, '終於知道為什麼不能選資料結構了'),
            (3, 3, '英文抵免', 1, '感謝提供多益 550 分門檻資訊'),
            (4, 2, '病假', 0, '希望能直接線上送假單，不想跑流程')
        """)

        # 13. 寫入學生個資授權同意設定 (功能 6: 個資隱私保護)
        cursor.execute("""
            INSERT IGNORE INTO `student_privacy_settings` (`setting_id`, `student_id`, `parent_alert_consent`, `advisor_alert_consent`) VALUES
            (1, 'S112001', 1, 1),
            (2, 'S112002', 0, 1),
            (3, 'S112004', 1, 1)
        """)

        # 14. 寫入系所畢業門檻標準 (功能 5: 畢業學分預審)
        cursor.execute("""
            INSERT IGNORE INTO `graduation_requirements` (`req_id`, `dept_id`, `total_credits_req`, `major_required_req`, `major_elective_req`, `general_req`, `english_threshold_name`, `ethics_req`, `project_req`) VALUES
            (1, 'CS', 220, 60, 30, 28, '多益測驗 550 分以上 或 通過進階實用英語檢定', 2, 6),
            (2, 'NUR', 220, 75, 25, 28, '通過護理師國家考試門檻檢定', 2, 4),
            (3, 'ENG', 220, 55, 35, 28, '多益測驗 750 分以上 或 雅思 6.0 以上', 2, 6)
        """)

        # 15. 寫入跨系統校曆雷達與期限 (功能 2: 校曆連動雷達)
        cursor.execute("""
            INSERT IGNORE INTO `deadlines` (`deadline_id`, `title`, `category`, `semester_week`, `start_date`, `end_date`, `applies_to_role`, `applies_to_dept`, `related_system_url`, `description`, `status_badge`) VALUES
            (1, '115-1 學期課程停修申請', '教務處課務組', 11, '2026-10-01', '2026-10-18', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '學期第 10-12 週開放停修申請，每人以 2 科為限，須完成導師與主任簽章。', '進行中 (剩 3 天)'),
            (2, '期中預警評量與導師學習輔導訪談', '學務處/教務處', 11, '2026-10-05', '2026-10-20', '學生,老師,家長', 'CS', 'http://203.71.63.13/academic/', '期中成績不及格達 1/2 者列入預警，導師將安排個別學習輔導與座談。', '進行中 (剩 5 天)'),
            (3, '大四應屆畢業生學分資格預審', '教務處註冊組', 11, '2026-09-15', '2026-11-30', '學生', 'CS', 'http://203.71.63.13/academic/', '大四學生請至註冊組核對必選修、通識與外語門檻缺口。', '進行中 (剩 35 天)'),
            (4, '共同外語與證照學分抵免申請', '通識教育中心', 3, '2026-09-01', '2026-09-15', '學生', NULL,'http://203.71.63.13/academic/', '大一共同外語抵免申請已截止，逾期者請於下學期初辦理。', '已截止'),
            (5, '暑期重補修意願登記與開班調查', '教務處課務組', 14, '2026-11-01', '2026-11-20', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '先修科目不及格需重修者，可預先登記暑期課程開班意願。', '尚未開放')
        """)

        # 16. 寫入申辦流程勾選進度 checklist_progress (與 app.py 的 DEMO_CHECKLIST_PROGRESS 一致)
        try:
            cursor.execute("""
                INSERT IGNORE INTO `checklist_progress` (`student_id`, `item_id`, `step_index`, `done`) VALUES
                ('S112001', 1, 0, 1),
                ('S112001', 1, 1, 1),
                ('S112001', 3, 0, 1),
                ('S112005', 1, 0, 1)
            """)
        except mysql.connector.Error:
            print("⚠️ 尚未建立 checklist_progress，請先執行 init_db.py")

        # 17. 寫入模擬缺曠課紀錄 attendance_records (與 app.py 的 DEMO_ATTENDANCE_RECORDS 一致)
        try:
            cursor.execute("""
                INSERT IGNORE INTO `attendance_records` (`id`, `student_id`, `date`, `course_name`, `type`, `notified`) VALUES
                (1, 'S112001', '2026-09-14', '程式設計(一)', '曠課', 1),
                (2, 'S112001', '2026-09-15', '基礎英文(二)', '遲到', 1),
                (3, 'S112001', '2026-09-16', '程式設計(一)', '曠課', 1),
                (4, 'S112001', '2026-09-18', '跨領域思維與創新科技', '病假', 1),
                (5, 'S112001', '2026-09-21', '程式設計(一)', '曠課', 0),
                (6, 'S112001', '2026-09-23', '程式設計(一)', '曠課', 0),
                (7, 'S112002', '2026-09-16', '資料庫系統概論', '病假', 1),
                (8, 'S112005', '2026-09-15', '資料結構', '曠課', 0),
                (9, 'S112005', '2026-09-17', '物件導向程式設計', '遲到', 0)
            """)
        except mysql.connector.Error:
            print("⚠️ 尚未建立 attendance_records，請先執行 init_db.py")

        # 17a. 科系名稱修正：舊版資料庫的 INSERT IGNORE 不會覆蓋，這裡把舊名稱與已移除的科系一併更新
        try:
            cursor.execute("UPDATE `course_map` SET `dept_id` = 'CS' WHERE `dept_id` = 'GEN'")
            cursor.execute("DELETE FROM `graduation_requirements` WHERE `dept_id` = 'GEN'")
            cursor.execute("DELETE FROM `departments` WHERE `dept_id` NOT IN ('LTC', 'ECE', 'NUR', 'OPT', 'BA', 'CS', 'ANI', 'ENG')")
            for old, new in [('資科二甲', '資管五忠'), ('資科二乙', '資管四孝'), ('護理二乙', '護理四忠')]:
                cursor.execute("UPDATE `users` SET `advised_class` = %s WHERE `advised_class` = %s", (new, old))
            for old, new in [('送請系所導師及系主任簽章', '送請班級導師及科主任簽章'),
                             ('核對系專業必修', '核對科專業必修'),
                             ('至系辦公室請系主任初審簽章', '至科辦公室請科主任初審簽章')]:
                cursor.execute("UPDATE `checklist_items` SET `steps_json` = REPLACE(`steps_json`, %s, %s)", (old, new))
            cursor.execute("UPDATE `knowledge_base` SET `content` = REPLACE(`content`, '本校各系所必修課程', '本校各科系必修課程')")
            for old, new in [('資訊科技與應用學系', '資訊管理科（五專）'), ('護理學系', '護理科（五專）'), ('應用外語學系', '應用外語科（五專）')]:
                cursor.execute("UPDATE `visitor_logs` SET `target_dept` = %s WHERE `target_dept` = %s", (new, old))
            # 五專畢業學分為 220 (舊版資料為大學部 128)
            cursor.execute("UPDATE `graduation_requirements` SET `total_credits_req` = 220 WHERE `total_credits_req` <> 220")
            cursor.execute("UPDATE `deadlines` SET `title` = '115-1 學期課程停修申請' WHERE `title` = '113-1 學期課程停修申請'")
        except mysql.connector.Error as err:
            print(f"⚠️ 科系名稱修正未完成：{err}")

        # 17b. 系統入口改成 links.json 中對應的康寧官方系統 (舊版為不存在的 sys.ukn.edu.tw 示意網址)
        try:
            for old, new in [('https://sys.ukn.edu.tw/cos_withdraw', 'http://talk.ukn.edu.tw/class_redi/class.php'),
                             ('https://sys.ukn.edu.tw/summer_courses', 'http://talk.ukn.edu.tw/class_redi/class.php'),
                             ('https://sys.ukn.edu.tw/student_leave', 'https://ec.ukn.edu.tw/AskLeave/login.aspx'),
                             ('https://sys.ukn.edu.tw/credit_waive', 'http://203.71.63.13/academic/'),
                             ('https://sys.ukn.edu.tw/grad_audit', 'http://203.71.63.13/academic/'),
                             ('https://sys.ukn.edu.tw/early_warning', 'http://203.71.63.13/academic/'),
                             ('https://sys.ukn.edu.tw/cert_reward', 'https://oes3.ukn.edu.tw/~license/')]:
                cursor.execute("UPDATE `deadlines` SET `related_system_url` = %s WHERE `related_system_url` = %s", (new, old))
                cursor.execute("UPDATE `checklist_items` SET `system_url` = %s WHERE `system_url` = %s", (new, old))
        except mysql.connector.Error as err:
            print(f"⚠️ 系統入口網址更新未完成：{err}")

        # 17c. 學生證照 (與 app.py 的 DEMO_CERTIFICATES 一致，供畢業門檻儀表板的同屆證照統計)
        try:
            cursor.execute("""
                INSERT IGNORE INTO `certificates` (`cert_id`, `student_id`, `cert_name`, `issuing_org`, `cert_number`, `theory_score`, `practical_score`, `cert_status`, `issue_date`) VALUES
                (1, 'S112001', '丙級電腦硬體裝修技術士', '勞動部勞動力發展署', '113-CS-004521', 82.00, 88.00, '及格發證', '2026-06-20'),
                (2, 'S112001', '乙級電腦軟體應用技術士', '勞動部勞動力發展署', '114-CS-008912', 86.50, 92.00, '及格發證', '2026-08-15'),
                (3, 'S112002', 'TQC+ 網頁設計工程師', '財團法人中華民國電腦技能基金會', 'TQC-WD-22310', 78.00, 85.00, '及格發證', '2026-07-05'),
                (4, 'S112004', '丙級電腦硬體裝修技術士', '勞動部勞動力發展署', '113-CS-004588', 90.00, 86.00, '及格發證', '2026-06-20'),
                (5, 'S112004', '乙級電腦軟體應用技術士', '勞動部勞動力發展署', '114-CS-009010', 88.00, 90.00, '及格發證', '2026-08-15')
            """)
        except mysql.connector.Error:
            print("⚠️ 尚未建立 certificates，請先執行 init_db.py")

        # 17b. 個人化儀表板示範資料 (直接取用 dashboard/demo_data.py，與示範模式一致)
        try:
            d = dashboard_demo
            cursor.executemany("""
                INSERT IGNORE INTO `class_schedule` (`id`, `class_name`, `student_id`, `weekday`, `period_start`, `period_end`, `course_name`, `classroom`, `teacher`)
                VALUES (%(id)s, %(class_name)s, %(student_id)s, %(weekday)s, %(period_start)s, %(period_end)s, %(course_name)s, %(classroom)s, %(teacher)s)
            """, d.DEMO_CLASS_SCHEDULE)
            cursor.executemany("""
                INSERT IGNORE INTO `announcements` (`id`, `title`, `content`, `office`, `publish_date`, `target_class`, `url`)
                VALUES (%(id)s, %(title)s, %(content)s, %(office)s, %(publish_date)s, %(target_class)s, %(url)s)
            """, d.DEMO_ANNOUNCEMENTS)
            cursor.executemany("""
                INSERT IGNORE INTO `announcement_reads` (`student_id`, `announcement_id`) VALUES (%(student_id)s, %(announcement_id)s)
            """, d.DEMO_ANNOUNCEMENT_READS)
            cursor.executemany("""
                INSERT IGNORE INTO `assignments` (`id`, `class_name`, `student_id`, `course_name`, `title`, `due_at`, `url`)
                VALUES (%(id)s, %(class_name)s, %(student_id)s, %(course_name)s, %(title)s, %(due_at)s, %(url)s)
            """, d.DEMO_ASSIGNMENTS)
            cursor.executemany("""
                INSERT IGNORE INTO `assignment_submissions` (`student_id`, `assignment_id`) VALUES (%(student_id)s, %(assignment_id)s)
            """, d.DEMO_ASSIGNMENT_SUBMISSIONS)
            cursor.executemany("""
                INSERT IGNORE INTO `leave_requests` (`id`, `student_id`, `leave_type`, `start_date`, `end_date`, `periods`, `reason`, `status`, `review_note`, `submitted_at`)
                VALUES (%(id)s, %(student_id)s, %(leave_type)s, %(start_date)s, %(end_date)s, %(periods)s, %(reason)s, %(status)s, %(review_note)s, %(submitted_at)s)
            """, d.DEMO_LEAVE_REQUESTS)
        except mysql.connector.Error:
            print("⚠️ 尚未建立儀表板資料表 (class_schedule 等)，請先執行 init_db.py")

        # 18. 校曆事項連結申辦流程 (init_db.py 建表時 checklist_items 可能尚未有資料)
        try:
            cursor.execute("UPDATE `academic_calendar` SET `related_checklist_id` = 1 WHERE `id` = 4 AND `related_checklist_id` IS NULL")
        except mysql.connector.Error:
            print("⚠️ 尚未建立 academic_calendar，請先執行 init_db.py")

        # 19. 獎助學金示範資料 (學生年級/GPA/操行/身分別與 app.py 的 DEMO_SCHOLARSHIP_PROFILES 一致)
        try:
            for student_id, p in DEMO_SCHOLARSHIP_PROFILES.items():
                cursor.execute(
                    "UPDATE `students` SET `grade_level` = %s, `gpa` = %s, `conduct_score` = %s, `identity_type` = %s WHERE `student_id` = %s",
                    (p["grade_level"], p["gpa"], p["conduct_score"], p["identity_type"], student_id))
            cursor.executemany("""
                INSERT INTO `scholarships` (`id`, `name`, `provider`, `amount`, `deadline`, `apply_url`, `announcement_url`, `description`,
                    `min_grade`, `max_grade`, `departments`, `min_gpa`, `min_conduct`, `identity_required`, `no_fail_required`)
                VALUES (%(id)s, %(name)s, %(provider)s, %(amount)s, %(deadline)s, %(apply_url)s, %(announcement_url)s, %(description)s,
                    %(min_grade)s, %(max_grade)s, %(departments)s, %(min_gpa)s, %(min_conduct)s, %(identity_required)s, %(no_fail_required)s)
                ON DUPLICATE KEY UPDATE `apply_url` = VALUES(`apply_url`), `announcement_url` = VALUES(`announcement_url`)
            """, DEMO_SCHOLARSHIPS)
        except mysql.connector.Error:
            print("⚠️ 尚未建立 scholarships 或 students 新欄位，請先執行 init_db.py")

        # 20. 校慶跑馬燈範例活動 (日期為示範值，請到後台「校慶跑馬燈」改成實際校慶日期；不預先放入祝福)
        try:
            cursor.executemany("""
                INSERT IGNORE INTO `anniversary_events` (`id`, `name_zh`, `name_en`, `name_ja`, `start_date`, `end_date`, `announce_days`, `require_approval`, `is_enabled`)
                VALUES (%(id)s, %(name_zh)s, %(name_en)s, %(name_ja)s, %(start_date)s, %(end_date)s, %(announce_days)s, %(require_approval)s, %(is_enabled)s)
            """, DEMO_ANNIVERSARY_EVENTS)
        except mysql.connector.Error:
            print("⚠️ 尚未建立 anniversary_events，請先執行 init_db.py")

        # 21. 教師專長示範資料 (與校園地圖示範老師同名)
        try:
            cursor.executemany("""
                INSERT IGNORE INTO `faculty_profiles` (`id`, `name`, `title`, `dept_name`, `email`, `fields`, `expertise`, `research_summary`, `accepts_projects`, `is_public`)
                VALUES (%(id)s, %(name)s, %(title)s, %(dept_name)s, %(email)s, %(fields)s, %(expertise)s, %(research_summary)s, %(accepts_projects)s, %(is_public)s)
            """, DEMO_FACULTY_PROFILES)
        except mysql.connector.Error:
            print("⚠️ 尚未建立 faculty_profiles，請先執行 init_db.py")

        # 22. 10/08 修正：示範班級「資管四忠」改為「資管五忠」，導師陳雅婷改為彭賓鈺
        #     (INSERT IGNORE 不會覆蓋已存在的資料，舊資料庫在這裡更新；每張表分開執行，缺表不影響其他表)
        renames = [
            ("UPDATE `students` SET `class_name` = '資管五忠' WHERE `class_name` = '資管四忠'", ()),
            ("UPDATE `users` SET `advised_class` = '資管五忠' WHERE `advised_class` = '資管四忠'", ()),
            ("UPDATE `users` SET `full_name` = '彭賓鈺 老師' WHERE `username` = 'teacher1'", ()),
            ("UPDATE `class_schedule` SET `class_name` = '資管五忠' WHERE `class_name` = '資管四忠'", ()),
            ("UPDATE `class_schedule` SET `teacher` = '彭賓鈺' WHERE `teacher` = '陳雅婷'", ()),
            ("UPDATE `announcements` SET `target_class` = '資管五忠' WHERE `target_class` = '資管四忠'", ()),
            ("UPDATE `assignments` SET `class_name` = '資管五忠' WHERE `class_name` = '資管四忠'", ()),
            ("UPDATE `faculty_profiles` SET `name` = '彭賓鈺' WHERE `name` = '陳雅婷'", ()),
        ]
        for sql, params in renames:
            try:
                cursor.execute(sql, params)
            except mysql.connector.Error as err:
                print(f"⚠️ 班級 / 導師名稱修正略過：{err}")
        # 22. 線上申辦示範 (與 applications 套件的 DEMO_APPLICATIONS 一致：一張跑到導師簽核、一張已完成)
        try:
            cursor.executemany("""
                INSERT IGNORE INTO `online_applications` (`id`, `student_id`, `item_id`, `form_code`, `business_name`, `fields_json`,
                    `stages_json`, `current_stage`, `status`, `history_json`, `submitted_at`)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, [(a["id"], a["student_id"], a["item_id"], a["form_code"], a["business_name"],
                   json.dumps(a["fields"], ensure_ascii=False), json.dumps(a["stages"], ensure_ascii=False),
                   a["current_stage"], a["status"], json.dumps(a["history"], ensure_ascii=False), a["submitted_at"])
                  for a in DEMO_APPLICATIONS])
        except mysql.connector.Error:
            print("⚠️ 尚未建立 online_applications，請先執行 init_db.py")

        # 23. 操行示範 (與 conduct 套件一致；114-2 分數與獎助學金示範的操行成績相同)
        try:
            cursor.executemany("""
                INSERT IGNORE INTO `conduct_records` (`id`, `student_id`, `semester`, `record_date`, `type`, `count`, `reason`, `recorded_by`)
                VALUES (%(id)s, %(student_id)s, %(semester)s, %(record_date)s, %(type)s, %(count)s, %(reason)s, %(recorded_by)s)
            """, DEMO_CONDUCT_RECORDS)
            cursor.executemany("""
                INSERT IGNORE INTO `conduct_evaluations` (`student_id`, `semester`, `advisor_adjust`, `comment`, `evaluated_by`)
                VALUES (%s, %s, %s, %s, %s)
            """, [(sid, sem, e["advisor_adjust"], e["comment"], e["evaluated_by"]) for (sid, sem), e in DEMO_CONDUCT_EVALUATIONS.items()])
        except mysql.connector.Error:
            print("⚠️ 尚未建立 conduct_records / conduct_evaluations，請先執行 init_db.py")

        conn.commit()
        print("🎉 完整測試資料（含 7 大升級功能模組）匯入成功！")

    except mysql.connector.Error as err:
        print(f"❌ 資料匯入失敗: {err}")
    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()

if __name__ == "__main__":
    seed_data()
