import mysql.connector
import os
import sys

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

        # 1. 寫入系所
        cursor.execute("""
            INSERT IGNORE INTO `departments` (`dept_id`, `dept_name`, `college_name`) VALUES
            ('CS', '資訊科技與應用學系', '創新與管理學院'),
            ('NUR', '護理學系', '健康照護學院'),
            ('ENG', '應用外語學系', '人文與教育學院'),
            ('GEN', '通識教育中心', '全校共同教學單位')
        """)

        # 2. 寫入學生主檔
        cursor.execute("""
            INSERT IGNORE INTO `students` (`student_id`, `full_name`, `dept_id`, `admission_year`, `class_name`, `parent_phone`) VALUES
            ('S112001', '王小明', 'CS', 112, '資科二甲', '0912-345-678'),
            ('S112002', '李美華', 'CS', 112, '資科二甲', '0922-333-444'),
            ('S112003', '張建華', 'NUR', 112, '護理二乙', '0933-555-666'),
            ('S112004', '陳冠宇', 'CS', 112, '資科二乙', '0955-222-111'),
            ('S112005', '林雨潔', 'CS', 112, '資科二甲', '0966-777-888')
        """)

        # 3. 寫入使用者帳號 (密碼皆為 123456 / admin 為 admin123)
        cursor.execute("""
            INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `role`, `student_id`, `full_name`, `advised_class`) VALUES
            (1, 'student1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '學生', 'S112001', '王小明', NULL),
            (2, 'student2', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '學生', 'S112002', '李美華', NULL),
            (3, 'parent1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '家長', 'S112001', '王大明 (小明家長)', NULL),
            (4, 'staff1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '教職員', NULL, '周立威 (教務處職員)', NULL),
            (5, 'admin', 'pbkdf2:sha256:1000000$2XQfvmmn75wVJUKc$59cac19325e7e89df728fdc0ee86208fc0ae12ab71fc630fbaa890f2f919d14c', '管理員', NULL, '系統超級管理員', NULL),
            (6, 'teacher1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '老師', NULL, '陳雅婷 老師', '資科二甲')
        """)

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
            ('EN101', '基礎英文(一)', 2, NULL, 1, '共同必修', 'GEN', '大一上', '大一基礎外語聽說讀寫與實用生活英語。'),
            ('EN102', '基礎英文(二)', 2, 'EN101', 1, '共同必修', 'GEN', '大一下', '進階商用英文與學術閱讀報告寫作。'),
            ('GE101', '大學之道與校園倫理', 2, NULL, 0, '通識教育', 'GEN', '大一上', '校園生活適應、生命教育、學術誠信與職場倫理。'),
            ('GE102', '跨領域思維與創新科技', 2, NULL, 0, '通識教育', 'GEN', '大二上', '人工智慧生活應用、設計思考與數位轉型思維。'),
            ('GE103', '環境永續與社會責任', 2, NULL, 0, '通識教育', 'GEN', '大二下', 'ESG 永續發展目標、生態保育與社會公益實踐。')
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
            (13, 'S112004', 'EN101', '112-1', 80.00, 1)
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
            (4, 1, '擋修與先修', '擋修', '先修科目未通過', '本校各系所必修課程若訂有先修科目限制（例如：程式設計(一) 為 資料結構 之先修科目），學生該先修科目未達及格標準（60 分）者，電腦選課系統將自動擋修，不得修習後續先修關聯課程，需待先修科目重修及格後始得修習。', '康寧大學課程選修要點.pdf', 8, 'https://www.ukn.edu.tw/p/412-1000-384.php?Lang=zh-tw'),
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
             '[\"至校務資訊系統登入『停修申請表』\", \"列印紙本停修申請單\", \"親自送請任課教師簽章同意\", \"送請系所導師及系主任簽章\", \"於第12週五前送交教務處課務組核備\"]', 
             '停修申請單紙本、歷年成績單正本', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A201 (課務組)', '02-2632-1181 分機 310, 312', '/forms/course_withdraw_form.pdf', 'https://sys.ukn.edu.tw/cos_withdraw', '第 10-12 週 (本週受理中)', 1, '學生'),
            
            (2, 2, '生輔組', '學生請假申請 (病假/事假)', 
             '[\"登入學生資訊系統填寫請假單\", \"上傳就醫證明或相關佐證文件圖檔\", \"送出後通知導師進行線上簽核\", \"請假超過3日由生輔組組長複核\", \"系統顯示審核通過即完成登錄\"]', 
             '健保特約就醫證明、就診收據影本', '週一至週五 08:00 - 17:30', '行政大樓 1 樓 學務處生輔組', '02-2632-1181 分機 211', '/forms/leave_application_form.pdf', 'https://sys.ukn.edu.tw/student_leave', '請假日當日起 3 日內', 2, '學生'),
            
            (3, 3, '通識中心', '外語證照免修與學分抵免', 
             '[\"填寫通識外語抵免申請表\", \"備妥多益/英檢/雅思成績單正本及影本各一份\", \"送交通識教育中心辦公室查驗正本\", \"教務處課務組複審學分折抵\", \"次學期初於歷年成績單確認抵免註記\"]', 
             '外語檢定成績單正本、影本、抵免申請書', '週一至週五 09:00 - 16:30', '卓越樓 3 樓 C305 (通識教育中心)', '02-2632-1181 分機 520, 521', '/forms/english_waiver_form.pdf', 'https://sys.ukn.edu.tw/credit_waive', '開學前至加退選截止 (已截止)', 3, '學生'),
             
            (4, 1, '註冊組', '學士班畢業學分資格預審', 
             '[\"登入畢業審查系統列印學分檢核表\", \"核對系專業必修、選修與通識學分缺口\", \"確認英文畢業門檻與專題通過證明\", \"至系辦公室請系主任初審簽章\", \"送交教務處註冊組進行畢業資格決審\"]', 
             '歷年成績單正本、畢業學分預審表、外語通過證明', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A202 (註冊組)', '02-2632-1181 分機 321, 322', '/forms/graduation_audit_form.pdf', 'https://sys.ukn.edu.tw/grad_audit', '大四第 8-16 週 (進行中)', 4, '學生'),
             
            (5, 3, '研發處', '專業證照與競賽獲獎獎勵金申請', 
             '[\"登入研發處證照獎勵申請平台\", \"填寫證照/競賽名稱、證書字號與發證單位\", \"上傳證書正反面與郵局存摺封面圖檔\", \"列印紙本印領清冊並親筆簽名\", \"送交研發處實習就業組審核並撥款\"]', 
             '證照證書影本、郵局存摺封面影本、印領清冊', '週一至週五 09:00 - 17:00', '圖資大樓 2 樓 研發處實習就業組', '02-2632-1181 分機 612', '/forms/certificate_reward_form.pdf', 'https://sys.ukn.edu.tw/cert_reward', '每學期第 1-5 週', 5, '學生')
        """)

        # 10. 寫入申辦進度種子 (功能 3: 我的申辦進度)
        cursor.execute("""
            INSERT IGNORE INTO `application_progress` (`progress_id`, `student_id`, `item_id`, `step_index`, `step_title`, `is_completed`, `status_note`) VALUES
            (1, 'S112001', 1, 0, '至校務資訊系統登入『停修申請表』', 1, '已於系統線上填單完成'),
            (2, 'S112001', 1, 1, '列印紙本停修申請單', 1, '已列印紙本'),
            (3, 'S112001', 1, 2, '親自送請任課教師簽章同意', 0, '等候任課教師簽章中'),
            (4, 'S112001', 1, 3, '送請系所導師及系主任簽章', 0, '未完成'),
            (5, 'S112001', 1, 4, '於第12週五前送交教務處課務組核備', 0, '未完成'),
            (6, 'S112001', 3, 0, '填寫通識外語抵免申請表', 1, '已填寫表單')
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
            (1, 'CS', 128, 60, 30, 28, '多益測驗 550 分以上 或 通過進階實用英語檢定', 2, 6),
            (2, 'NUR', 132, 75, 25, 28, '通過護理師國家考試門檻檢定', 2, 4),
            (3, 'ENG', 128, 55, 35, 28, '多益測驗 750 分以上 或 雅思 6.0 以上', 2, 6),
            (4, 'GEN', 128, 60, 30, 28, '基礎外語 4 學分與核心通識通過', 2, 0)
        """)

        # 15. 寫入跨系統校曆雷達與期限 (功能 2: 校曆連動雷達)
        cursor.execute("""
            INSERT IGNORE INTO `deadlines` (`deadline_id`, `title`, `category`, `semester_week`, `start_date`, `end_date`, `applies_to_role`, `applies_to_dept`, `related_system_url`, `description`, `status_badge`) VALUES
            (1, '113-1 學期課程停修申請', '教務處課務組', 11, '2026-10-01', '2026-10-18', '學生', 'CS', 'https://sys.ukn.edu.tw/cos_withdraw', '學期第 10-12 週開放停修申請，每人以 2 科為限，須完成導師與主任簽章。', '進行中 (剩 3 天)'),
            (2, '期中預警評量與導師學習輔導訪談', '學務處/教務處', 11, '2026-10-05', '2026-10-20', '學生,老師,家長', 'CS', 'https://sys.ukn.edu.tw/early_warning', '期中成績不及格達 1/2 者列入預警，導師將安排個別學習輔導與座談。', '進行中 (剩 5 天)'),
            (3, '大四應屆畢業生學分資格預審', '教務處註冊組', 11, '2026-09-15', '2026-11-30', '學生', 'CS', 'https://sys.ukn.edu.tw/grad_audit', '大四學生請至註冊組核對必選修、通識與外語門檻缺口。', '進行中 (剩 35 天)'),
            (4, '共同外語與證照學分抵免申請', '通識教育中心', 3, '2026-09-01', '2026-09-15', '學生', 'all', 'https://sys.ukn.edu.tw/credit_waive', '大一共同外語抵免申請已截止，逾期者請於下學期初辦理。', '已截止'),
            (5, '暑期重補修意願登記與開班調查', '教務處課務組', 14, '2026-11-01', '2026-11-20', '學生', 'CS', 'https://sys.ukn.edu.tw/summer_courses', '先修科目不及格需重修者，可預先登記暑期課程開班意願。', '尚未開放')
        """)

        conn.commit()
        print("🎉 完整測試資料（含 7 大升級功能模組）匯入成功！")

    except mysql.connector.Error as err:
        print(f"❌ 資料匯入失敗: {err}")
    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()

if __name__ == "__main__":
    seed_data()