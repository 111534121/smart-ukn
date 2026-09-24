import mysql.connector
import os
import sys

# 設定 Windows 終端輸出為 UTF-8
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
    "port": int(os.getenv("DB_PORT", 3306)),
    "charset": "utf8mb4"
}

def init_database():
    print("=" * 60)
    print("🚀 Smart UKN 資料庫 3NF 結構初始化程序 (init_db 完整版)")
    print("=" * 60)
    
    conn = None
    cursor = None
    try:
        # 連線至 MySQL 實例
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. 建立資料庫
        cursor.execute("CREATE DATABASE IF NOT EXISTS smart_ukn COLLATE utf8mb4_unicode_ci;")
        cursor.execute("USE smart_ukn;")
        print("✅ 成功連線並選定資料庫: smart_ukn")

        # 2. 建立系所主檔 departments
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `departments` (
              `dept_id` varchar(20) NOT NULL,
              `dept_name` varchar(100) NOT NULL,
              `college_name` varchar(100) NOT NULL,
              PRIMARY KEY (`dept_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 3. 建立學生基本主檔 students (3NF: 不存年齡等推導欄位)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `students` (
              `student_id` varchar(20) NOT NULL,
              `full_name` varchar(50) NOT NULL,
              `dept_id` varchar(20) NOT NULL,
              `admission_year` int(11) NOT NULL,
              `class_name` varchar(50) NOT NULL,
              `parent_phone` varchar(30) DEFAULT NULL,
              PRIMARY KEY (`student_id`),
              KEY `fk_students_dept` (`dept_id`),
              CONSTRAINT `fk_students_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 4. 建立系統使用者 users
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `users` (
              `user_id` int(11) NOT NULL AUTO_INCREMENT,
              `username` varchar(50) NOT NULL,
              `password_hash` varchar(255) NOT NULL,
              `role` enum('學生','家長','教職員','老師','管理員','訪客') NOT NULL,
              `student_id` varchar(20) DEFAULT NULL,
              `full_name` varchar(50) NOT NULL,
              `advised_class` varchar(50) DEFAULT NULL,
              `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`user_id`),
              UNIQUE KEY `uk_username` (`username`),
              KEY `fk_users_student` (`student_id`),
              CONSTRAINT `fk_users_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 5. 建立課程地圖與先修表 course_map
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `course_map` (
              `course_id` varchar(20) NOT NULL,
              `course_name` varchar(100) NOT NULL,
              `credits` int(11) NOT NULL,
              `prerequisite_id` varchar(20) DEFAULT NULL,
              `is_required` tinyint(1) NOT NULL DEFAULT 1,
              `course_type` enum('專業必修','專業選修','通識教育','共同必修') NOT NULL DEFAULT '專業必修',
              `dept_id` varchar(20) NOT NULL DEFAULT 'CS',
              `semester_suggest` varchar(20) DEFAULT '大一上',
              `description` text DEFAULT NULL,
              PRIMARY KEY (`course_id`),
              KEY `fk_course_prereq` (`prerequisite_id`),
              KEY `fk_course_dept` (`dept_id`),
              CONSTRAINT `fk_course_prereq` FOREIGN KEY (`prerequisite_id`) REFERENCES `course_map` (`course_id`) ON DELETE SET NULL,
              CONSTRAINT `fk_course_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 6. 建立學生成績紀錄表 student_credits
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `student_credits` (
              `credit_id` int(11) NOT NULL AUTO_INCREMENT,
              `student_id` varchar(20) NOT NULL,
              `course_id` varchar(20) NOT NULL,
              `semester` varchar(20) NOT NULL,
              `score` decimal(5,2) DEFAULT NULL,
              `is_passed` tinyint(1) NOT NULL,
              PRIMARY KEY (`credit_id`),
              KEY `fk_credits_student` (`student_id`),
              KEY `fk_credits_course` (`course_id`),
              CONSTRAINT `fk_credits_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
              CONSTRAINT `fk_credits_course` FOREIGN KEY (`course_id`) REFERENCES `course_map` (`course_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 6b. 建立學生證照與檢定成績表 certificates
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `certificates` (
              `cert_id` int(11) NOT NULL AUTO_INCREMENT,
              `student_id` varchar(20) NOT NULL,
              `cert_name` varchar(100) NOT NULL,
              `issuing_org` varchar(100) NOT NULL DEFAULT '勞動部勞動力發展署技能檢定中心',
              `cert_number` varchar(50) DEFAULT NULL,
              `theory_score` decimal(5,2) DEFAULT NULL,
              `practical_score` decimal(5,2) DEFAULT NULL,
              `cert_status` varchar(50) DEFAULT '及格發證',
              `verify_url` varchar(255) DEFAULT NULL,
              `file_path` varchar(255) DEFAULT NULL,
              `file_name` varchar(255) DEFAULT NULL,
              `file_type` varchar(20) DEFAULT NULL,
              `issue_date` date NOT NULL,
              `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`cert_id`),
              KEY `fk_cert_student` (`student_id`),
              CONSTRAINT `fk_cert_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 6c. 建立學生競賽獲獎表 competitions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `competitions` (
              `comp_id` int(11) NOT NULL AUTO_INCREMENT,
              `student_id` varchar(20) NOT NULL,
              `competition_name` varchar(150) NOT NULL,
              `award_title` varchar(100) NOT NULL,
              `organizer` varchar(100) DEFAULT '主辦單位',
              `project_name` varchar(150) DEFAULT NULL,
              `award_date` date NOT NULL,
              `file_path` varchar(255) DEFAULT NULL,
              `file_name` varchar(255) DEFAULT NULL,
              `file_type` varchar(20) DEFAULT NULL,
              `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`comp_id`),
              KEY `fk_comp_student` (`student_id`),
              CONSTRAINT `fk_comp_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 7. 建立規章分類表 knowledge_categories
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `knowledge_categories` (
              `category_id` int(11) NOT NULL AUTO_INCREMENT,
              `category_name` varchar(50) NOT NULL,
              `icon` varchar(20) DEFAULT '📚',
              `sort_order` int(11) DEFAULT 1,
              PRIMARY KEY (`category_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 8. 建立校規知識庫 knowledge_base
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `knowledge_base` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `category_id` int(11) NOT NULL,
              `subcategory` varchar(50) NOT NULL,
              `keyword` varchar(255) NOT NULL,
              `official_term` varchar(255) DEFAULT '',
              `content` text NOT NULL,
              `doc_name` varchar(255) NOT NULL,
              `page` int(11) DEFAULT 1,
              `url` varchar(500) NOT NULL,
              PRIMARY KEY (`id`),
              KEY `fk_kb_category` (`category_id`),
              CONSTRAINT `fk_kb_category` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 9. 建立同義詞字典 synonym_dictionary
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `synonym_dictionary` (
              `synonym_id` int(11) NOT NULL AUTO_INCREMENT,
              `category_id` int(11) DEFAULT NULL,
              `user_keyword` varchar(50) NOT NULL,
              `official_term` varchar(50) NOT NULL,
              PRIMARY KEY (`synonym_id`),
              KEY `fk_synonym_cat` (`category_id`),
              CONSTRAINT `fk_synonym_cat` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 10. 建立流程指引清單 checklist_items (含處室位置、分機、表單下載與規章連結)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `checklist_items` (
              `item_id` int(11) NOT NULL AUTO_INCREMENT,
              `category_id` int(11) DEFAULT NULL,
              `category_name` varchar(50) NOT NULL DEFAULT '課務組',
              `business_name` varchar(100) NOT NULL,
              `steps_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
              `required_docs` text DEFAULT NULL,
              `office_hours` varchar(100) DEFAULT '週一至週五 08:30 - 17:00',
              `office_location` varchar(100) DEFAULT '康寧樓 2 樓 A201 (教務處)',
              `contact_phone` varchar(50) DEFAULT '02-2632-1181 分機 310',
              `form_download_url` varchar(300) DEFAULT NULL,
              `system_url` varchar(300) DEFAULT NULL,
              `deadline_week_info` varchar(100) DEFAULT NULL,
              `related_kb_id` int(11) DEFAULT NULL,
              `audience` varchar(20) NOT NULL DEFAULT '學生',
              PRIMARY KEY (`item_id`),
              KEY `fk_chk_cat` (`category_id`),
              CONSTRAINT `fk_chk_cat` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 11. 建立申辦進度保存表 application_progress (功能 3: 我的申辦進度)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `application_progress` (
              `progress_id` int(11) NOT NULL AUTO_INCREMENT,
              `student_id` varchar(20) NOT NULL,
              `item_id` int(11) NOT NULL,
              `step_index` int(11) NOT NULL,
              `step_title` varchar(150) NOT NULL,
              `is_completed` tinyint(1) NOT NULL DEFAULT 0,
              `status_note` varchar(150) DEFAULT '處理中',
              `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (`progress_id`),
              UNIQUE KEY `uk_student_item_step` (`student_id`, `item_id`, `step_index`),
              KEY `fk_prog_student` (`student_id`),
              KEY `fk_prog_item` (`item_id`),
              CONSTRAINT `fk_prog_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
              CONSTRAINT `fk_prog_item` FOREIGN KEY (`item_id`) REFERENCES `checklist_items` (`item_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 12. 建立未命中搜尋紀錄表 unmatched_queries (功能 4: 詞庫自動成長)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `unmatched_queries` (
              `query_id` int(11) NOT NULL AUTO_INCREMENT,
              `query_text` varchar(255) NOT NULL,
              `search_count` int(11) NOT NULL DEFAULT 1,
              `status` enum('待處理', '已轉同義詞', '已建條文', '已忽略') NOT NULL DEFAULT '待處理',
              `resolved_term` varchar(100) DEFAULT NULL,
              `first_searched_at` timestamp NOT NULL DEFAULT current_timestamp(),
              `last_searched_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (`query_id`),
              UNIQUE KEY `uk_query_text` (`query_text`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 13. 建立搜尋結果滿意度反饋表 search_feedback (功能 4: 有幫助/沒幫助)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `search_feedback` (
              `feedback_id` int(11) NOT NULL AUTO_INCREMENT,
              `kb_id` int(11) DEFAULT NULL,
              `query_text` varchar(255) NOT NULL,
              `is_helpful` tinyint(1) NOT NULL,
              `comment` text DEFAULT NULL,
              `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`feedback_id`),
              KEY `fk_fb_kb` (`kb_id`),
              CONSTRAINT `fk_fb_kb` FOREIGN KEY (`kb_id`) REFERENCES `knowledge_base` (`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 14. 建立學生個資預警授權設定表 student_privacy_settings (功能 6: 個資隱私保護)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `student_privacy_settings` (
              `setting_id` int(11) NOT NULL AUTO_INCREMENT,
              `student_id` varchar(20) NOT NULL,
              `parent_alert_consent` tinyint(1) NOT NULL DEFAULT 1,
              `advisor_alert_consent` tinyint(1) NOT NULL DEFAULT 1,
              `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (`setting_id`),
              UNIQUE KEY `uk_privacy_student` (`student_id`),
              CONSTRAINT `fk_privacy_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 15. 建立系所畢業學分門檻標準表 graduation_requirements (功能 5: 畢業學分預審)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `graduation_requirements` (
              `req_id` int(11) NOT NULL AUTO_INCREMENT,
              `dept_id` varchar(20) NOT NULL,
              `total_credits_req` int(11) NOT NULL DEFAULT 128,
              `major_required_req` int(11) NOT NULL DEFAULT 60,
              `major_elective_req` int(11) NOT NULL DEFAULT 30,
              `general_req` int(11) NOT NULL DEFAULT 28,
              `english_threshold_name` varchar(100) NOT NULL DEFAULT '多益 550 分或通過進階英文檢定',
              `ethics_req` int(11) NOT NULL DEFAULT 2,
              `project_req` int(11) NOT NULL DEFAULT 3,
              PRIMARY KEY (`req_id`),
              UNIQUE KEY `uk_grad_dept` (`dept_id`),
              CONSTRAINT `fk_grad_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 16. 建立訪客留痕表 visitor_logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `visitor_logs` (
              `log_id` int(11) NOT NULL AUTO_INCREMENT,
              `visitor_name` varchar(50) NOT NULL,
              `phone` varchar(30) NOT NULL,
              `school_from` varchar(100) NOT NULL,
              `purpose` varchar(100) NOT NULL,
              `target_dept` varchar(100) DEFAULT '資訊管理科（五專）',
              `visited_at` timestamp NOT NULL DEFAULT current_timestamp(),
              `ip_address` varchar(50) DEFAULT '127.0.0.1',
              PRIMARY KEY (`log_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 17. 建立校務服務斷點匿名回報表 friction_reports
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `friction_reports` (
              `report_id` int(11) NOT NULL AUTO_INCREMENT,
              `category` varchar(50) NOT NULL,
              `description` text DEFAULT NULL,
              `page_context` varchar(100) DEFAULT NULL,
              `role_context` varchar(20) DEFAULT NULL,
              `reported_at` timestamp NOT NULL DEFAULT current_timestamp(),
              `ip_address` varchar(50) DEFAULT '127.0.0.1',
              PRIMARY KEY (`report_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 18. 建立跨系統期限雷達表 deadlines (功能 2: 校曆連動雷達)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `deadlines` (
              `deadline_id` int(11) NOT NULL AUTO_INCREMENT,
              `title` varchar(100) NOT NULL,
              `category` varchar(50) NOT NULL,
              `semester_week` int(11) DEFAULT 11,
              `start_date` date DEFAULT NULL,
              `end_date` date NOT NULL,
              `applies_to_role` varchar(20) NOT NULL DEFAULT 'all',
              `applies_to_dept` varchar(20) DEFAULT NULL,
              `related_system_url` varchar(300) DEFAULT NULL,
              `description` text DEFAULT NULL,
              `status_badge` varchar(50) DEFAULT '進行中',
              PRIMARY KEY (`deadline_id`),
              KEY `fk_deadline_dept` (`applies_to_dept`),
              CONSTRAINT `fk_deadline_dept` FOREIGN KEY (`applies_to_dept`) REFERENCES `departments` (`dept_id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 19. 建立學期校曆事項表 academic_calendar (首頁「本週可辦」橫幅)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `academic_calendar` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `event_name` varchar(100) NOT NULL,
              `start_date` date NOT NULL,
              `end_date` date NOT NULL,
              `category` varchar(50) NOT NULL DEFAULT '教務',
              `related_checklist_id` int(11) DEFAULT NULL,
              PRIMARY KEY (`id`),
              KEY `idx_cal_dates` (`start_date`, `end_date`),
              KEY `fk_cal_checklist` (`related_checklist_id`),
              CONSTRAINT `fk_cal_checklist` FOREIGN KEY (`related_checklist_id`) REFERENCES `checklist_items` (`item_id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 20. 建立搜尋紀錄表 search_logs (每次呼叫 /api/search 寫一筆，供未命中率統計)
        #     搜尋回饋沿用第 13 項的 search_feedback (query_text / kb_id / is_helpful)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `search_logs` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `query` varchar(255) NOT NULL,
              `matched` tinyint(1) NOT NULL,
              `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`id`),
              KEY `idx_search_created` (`created_at`),
              KEY `idx_search_matched_query` (`matched`, `query`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 21. 建立申辦流程勾選進度表 checklist_progress (登入學生打勾的步驟，下次登入仍保留)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `checklist_progress` (
              `student_id` varchar(20) NOT NULL,
              `item_id` int(11) NOT NULL,
              `step_index` int(11) NOT NULL,
              `done` tinyint(1) NOT NULL DEFAULT 0,
              PRIMARY KEY (`student_id`, `item_id`, `step_index`),
              KEY `fk_cp_item` (`item_id`),
              CONSTRAINT `fk_cp_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
              CONSTRAINT `fk_cp_item` FOREIGN KEY (`item_id`) REFERENCES `checklist_items` (`item_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 22. 建立缺曠課紀錄表 attendance_records (學校尚無 API，先以本表模擬)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `attendance_records` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `student_id` varchar(20) NOT NULL,
              `date` date NOT NULL,
              `course_name` varchar(100) NOT NULL,
              `type` enum('曠課','遲到','病假') NOT NULL,
              `notified` tinyint(1) NOT NULL DEFAULT 0,
              PRIMARY KEY (`id`),
              KEY `idx_att_student_date` (`student_id`, `date`),
              KEY `idx_att_notified` (`notified`),
              CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 23-28. 個人化儀表板：課表、公告 (含已讀)、作業 (含繳交)、請假
        #        學校尚無對應 API，先以本地資料表模擬；class_name 與 student_id 擇一 (整班 / 個人重補修)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `class_schedule` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `class_name` varchar(50) DEFAULT NULL,
              `student_id` varchar(20) DEFAULT NULL,
              `weekday` tinyint(4) NOT NULL COMMENT '1=週一 … 7=週日',
              `period_start` tinyint(4) NOT NULL,
              `period_end` tinyint(4) NOT NULL,
              `course_name` varchar(100) NOT NULL,
              `classroom` varchar(50) DEFAULT NULL,
              `teacher` varchar(50) DEFAULT NULL,
              PRIMARY KEY (`id`),
              KEY `idx_sched_class` (`class_name`, `weekday`),
              KEY `idx_sched_student` (`student_id`, `weekday`),
              CONSTRAINT `fk_sched_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `announcements` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `title` varchar(200) NOT NULL,
              `content` text DEFAULT NULL,
              `office` varchar(50) NOT NULL,
              `publish_date` date NOT NULL,
              `target_class` varchar(50) DEFAULT NULL COMMENT 'NULL = 全校公告',
              `url` varchar(500) NOT NULL DEFAULT '#',
              PRIMARY KEY (`id`),
              KEY `idx_ann_date` (`publish_date`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `announcement_reads` (
              `student_id` varchar(20) NOT NULL,
              `announcement_id` int(11) NOT NULL,
              `read_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`student_id`, `announcement_id`),
              KEY `fk_ar_ann` (`announcement_id`),
              CONSTRAINT `fk_ar_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
              CONSTRAINT `fk_ar_ann` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `assignments` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `class_name` varchar(50) DEFAULT NULL,
              `student_id` varchar(20) DEFAULT NULL,
              `course_name` varchar(100) NOT NULL,
              `title` varchar(200) NOT NULL,
              `due_at` datetime NOT NULL,
              `url` varchar(500) NOT NULL DEFAULT '#',
              PRIMARY KEY (`id`),
              KEY `idx_asg_class` (`class_name`),
              KEY `idx_asg_student` (`student_id`),
              CONSTRAINT `fk_asg_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `assignment_submissions` (
              `student_id` varchar(20) NOT NULL,
              `assignment_id` int(11) NOT NULL,
              `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`student_id`, `assignment_id`),
              KEY `fk_sub_asg` (`assignment_id`),
              CONSTRAINT `fk_sub_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
              CONSTRAINT `fk_sub_asg` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `leave_requests` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `student_id` varchar(20) NOT NULL,
              `leave_type` enum('病假','事假','公假','喪假','生理假') NOT NULL,
              `start_date` date NOT NULL,
              `end_date` date NOT NULL,
              `periods` varchar(50) DEFAULT NULL COMMENT '節次，例如 3-4',
              `reason` varchar(255) DEFAULT NULL,
              `status` enum('待審核','已核准','已退回') NOT NULL DEFAULT '待審核',
              `review_note` varchar(255) NOT NULL DEFAULT '',
              `submitted_at` datetime NOT NULL,
              PRIMARY KEY (`id`),
              KEY `idx_leave_student` (`student_id`, `submitted_at`),
              CONSTRAINT `fk_leave_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 獎助學金比對：students 補上需要的欄位 (既有資料庫升級用，已存在就略過)
        #   grade_level 另外存放而非由入學年推算，因休學、延修會讓年級與入學年不一致
        #   identity_type 為身分別 (低收入戶、中低收入戶、原住民、身心障礙)，多個以逗號分隔
        for column, definition in (
            ("grade_level", "tinyint(4) DEFAULT NULL"),
            ("gpa", "decimal(3,2) DEFAULT NULL"),
            ("conduct_score", "decimal(5,2) DEFAULT NULL"),
            ("identity_type", "varchar(100) DEFAULT NULL"),
        ):
            cursor.execute("""
                SELECT COUNT(*) FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = %s
            """, (column,))
            if cursor.fetchone()[0] == 0:
                cursor.execute(f"ALTER TABLE `students` ADD COLUMN `{column}` {definition}")
                print(f"✅ students 已新增 {column} 欄位")

        # 獎助學金表 scholarships (含資格條件)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `scholarships` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `name` varchar(100) NOT NULL,
              `provider` enum('校內','校外') NOT NULL DEFAULT '校內',
              `amount` int(11) DEFAULT NULL,
              `deadline` date NOT NULL,
              `apply_url` varchar(300) DEFAULT NULL,
              `announcement_url` varchar(300) DEFAULT NULL,
              `description` text DEFAULT NULL,
              `min_grade` tinyint(4) DEFAULT NULL,
              `max_grade` tinyint(4) DEFAULT NULL,
              `departments` varchar(200) DEFAULT NULL COMMENT '適用科系代碼，逗號分隔；NULL 代表全校',
              `min_gpa` decimal(3,2) DEFAULT NULL,
              `min_conduct` decimal(5,2) DEFAULT NULL,
              `identity_required` varchar(100) DEFAULT NULL COMMENT '符合任一身分即可，逗號分隔；NULL 代表不限',
              `no_fail_required` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否要求前學期無不及格',
              PRIMARY KEY (`id`),
              KEY `idx_scholarship_deadline` (`deadline`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # 校曆範例事項 (與 app.py 的 DEMO_ACADEMIC_CALENDAR 保持一致；
        # related_checklist_id 需等 seed_data.py 匯入 checklist_items 後才有對應，未匯入前先設為 NULL)
        cursor.execute("SELECT COUNT(*) FROM `checklist_items` WHERE `item_id` = 1")
        withdraw_checklist_id = 1 if cursor.fetchone()[0] else None
        cursor.executemany("""
            INSERT IGNORE INTO `academic_calendar` (`id`, `event_name`, `start_date`, `end_date`, `category`, `related_checklist_id`)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, [
            (1, '網路加退選及重補修', '2026-09-14', '2026-09-20', '教務', None),
            (2, '就學貸款申請、學雜費減免收件', '2026-09-14', '2026-09-15', '繳費', None),
            (3, '弱勢助學金、學產基金申請', '2026-09-16', '2026-10-01', '獎助', None),
            (4, '受理棄選（停修）', '2026-11-16', '2026-12-04', '教務', withdraw_checklist_id),
            (5, '網路教學評量填寫', '2026-12-14', '2026-12-20', '教務', None),
        ])

        conn.commit()
        print("🎉 3NF 正規化資料庫共 30 張資料表建立成功！")

    except mysql.connector.Error as err:
        print(f"❌ 資料庫初始化錯誤: {err}")
    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()

if __name__ == "__main__":
    init_database()