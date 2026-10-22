-- smart_ukn only. Import into a newly created, empty smart_ukn database.
-- Schema only: no account or application rows.
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `smart_ukn`
--

-- --------------------------------------------------------

--
-- 資料表結構 `academic_calendar`
--

CREATE TABLE `academic_calendar` (
  `id` int(11) NOT NULL,
  `event_name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT '教務',
  `related_checklist_id` int(11) DEFAULT NULL,
  `owner_key` varchar(50) DEFAULT NULL,
  `note` varchar(300) DEFAULT NULL,
  `source` varchar(60) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `anniversary_events`
--

CREATE TABLE `anniversary_events` (
  `id` int(11) NOT NULL,
  `name_zh` varchar(100) NOT NULL,
  `name_en` varchar(150) DEFAULT NULL,
  `name_ja` varchar(100) DEFAULT NULL,
  `start_date` date NOT NULL COMMENT '校慶當天 (多天活動為第一天)',
  `end_date` date NOT NULL COMMENT '最後一天，隔天起不再顯示',
  `announce_days` int(11) NOT NULL DEFAULT 30 COMMENT '提前幾天開始顯示',
  `require_approval` tinyint(1) NOT NULL DEFAULT 1 COMMENT '匿名祝福是否需審核後才顯示',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `anniversary_wishes`
--

CREATE TABLE `anniversary_wishes` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `message` varchar(100) NOT NULL,
  `lang` varchar(5) NOT NULL DEFAULT 'zh',
  `status` enum('待審核','顯示中','已隱藏') NOT NULL DEFAULT '待審核',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text DEFAULT NULL,
  `office` varchar(50) NOT NULL,
  `publish_date` date NOT NULL,
  `target_class` varchar(50) DEFAULT NULL COMMENT 'NULL = 全校公告',
  `url` varchar(500) NOT NULL DEFAULT '#'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `student_id` varchar(20) NOT NULL,
  `announcement_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `course_name` varchar(100) NOT NULL,
  `title` varchar(200) NOT NULL,
  `due_at` datetime NOT NULL,
  `url` varchar(500) NOT NULL DEFAULT '#'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `student_id` varchar(20) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `type` enum('曠課','遲到','病假','事假','公假','重大傷病假','產假') NOT NULL,
  `notified` tinyint(1) NOT NULL DEFAULT 0,
  `hours` decimal(7,2) DEFAULT NULL,
  `exam_policy` varchar(20) NOT NULL DEFAULT 'ordinary'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `audit_logs`
--

CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` varchar(50) NOT NULL,
  `action` varchar(20) NOT NULL,
  `changed_by` varchar(50) NOT NULL,
  `changed_by_role` varchar(20) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `before_json` longtext DEFAULT NULL,
  `after_json` longtext DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `certificates`
--

CREATE TABLE `certificates` (
  `cert_id` int(11) NOT NULL,
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
  `issue_date` date DEFAULT NULL,
  `kind` enum('證照','競賽','作品') NOT NULL DEFAULT '證照',
  `review_status` enum('待審核','已通過','已退回') NOT NULL DEFAULT '已通過',
  `reviewer` varchar(50) DEFAULT NULL,
  `review_note` varchar(200) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `award` varchar(60) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `attachments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `checklist_items`
--

CREATE TABLE `checklist_items` (
  `item_id` int(11) NOT NULL,
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
  `audience` varchar(20) NOT NULL DEFAULT '學生'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `checklist_progress`
--

CREATE TABLE `checklist_progress` (
  `student_id` varchar(20) NOT NULL,
  `item_id` int(11) NOT NULL,
  `step_index` int(11) NOT NULL,
  `done` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `class_groups`
--

CREATE TABLE `class_groups` (
  `class_name` varchar(50) NOT NULL COMMENT '班級 / 群組名稱 (PK)',
  `password_hash` varchar(255) NOT NULL COMMENT '加入密碼雜湊',
  `created_by` varchar(50) NOT NULL COMMENT '建立者姓名',
  `created_by_username` varchar(50) DEFAULT NULL COMMENT '建立者帳號 (系統自動建立時為 NULL)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：班級 / 群組';

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `class_group_members`
--

CREATE TABLE `class_group_members` (
  `class_name` varchar(50) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：班級成員';

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `class_notices`
--

CREATE TABLE `class_notices` (
  `id` int(11) NOT NULL,
  `class_name` varchar(50) DEFAULT NULL COMMENT '班級通知的班級；課程 / 科系 / 年級 / 全校廣播為 NULL',
  `target_type` enum('班級','課程','科系','年級','全校') NOT NULL DEFAULT '班級' COMMENT '通知對象類型',
  `target_label` varchar(100) DEFAULT NULL COMMENT '對象說明，例：資料庫系統概論（資管五忠）、資訊管理科（五專）、全校',
  `whole_class` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = 整班；0 = 只發給個別學生',
  `title` varchar(80) NOT NULL,
  `content` text NOT NULL,
  `priority` enum('一般','重要','緊急') NOT NULL DEFAULT '一般',
  `sender` varchar(50) NOT NULL COMMENT '發送者姓名',
  `sender_username` varchar(50) DEFAULT NULL COMMENT '發送者帳號',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reply_required` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：通知內容';

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `class_notice_recipients`
--

CREATE TABLE `class_notice_recipients` (
  `notice_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL COMMENT 'NULL = 尚未讀',
  `reply` varchar(20) DEFAULT NULL,
  `reply_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：收件人與已讀時間';

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `class_schedule`
--

CREATE TABLE `class_schedule` (
  `id` int(11) NOT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `weekday` tinyint(4) NOT NULL COMMENT '1=週一 … 7=週日',
  `period_start` tinyint(4) NOT NULL,
  `period_end` tinyint(4) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `classroom` varchar(50) DEFAULT NULL,
  `teacher` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `counseling_records`
--

CREATE TABLE `counseling_records` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `class_name` varchar(50) DEFAULT NULL COMMENT '記錄當時學生的班級',
  `talk_date` date NOT NULL COMMENT '晤談日期',
  `method` enum('面談','電話','線上','家長聯繫') NOT NULL DEFAULT '面談',
  `topic` enum('學業','出缺勤','生活','生涯','家庭','身心','其他') NOT NULL DEFAULT '其他',
  `content` text NOT NULL COMMENT '晤談內容 (個人隱私，學生與家長看不到)',
  `follow_up` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = 需要追蹤',
  `follow_up_note` varchar(200) DEFAULT NULL COMMENT '要追蹤什麼',
  `follow_up_done` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = 已追蹤完成',
  `counselor_username` varchar(50) NOT NULL COMMENT '記錄人帳號',
  `counselor_name` varchar(50) NOT NULL COMMENT '記錄人姓名',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `follow_up_date` date DEFAULT NULL,
  `tracking_status` varchar(20) NOT NULL DEFAULT '待聯繫',
  `tracking_result` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='導生關懷紀錄 (T14)';

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `course_map`
--

CREATE TABLE `course_map` (
  `course_id` varchar(20) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `credits` int(11) NOT NULL,
  `prerequisite_id` varchar(20) DEFAULT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 1,
  `course_type` enum('專業必修','專業選修','通識教育','共同必修') NOT NULL DEFAULT '專業必修',
  `dept_id` varchar(20) NOT NULL DEFAULT 'CS',
  `semester_suggest` varchar(20) DEFAULT '大一上',
  `description` text DEFAULT NULL,
  `semester_hours` decimal(8,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `deadlines`
--

CREATE TABLE `deadlines` (
  `deadline_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `semester_week` int(11) DEFAULT 11,
  `start_date` date DEFAULT NULL,
  `end_date` date NOT NULL,
  `applies_to_role` varchar(20) NOT NULL DEFAULT 'all',
  `applies_to_dept` varchar(20) DEFAULT NULL,
  `related_system_url` varchar(300) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status_badge` varchar(50) DEFAULT '進行中'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `departments`
--

CREATE TABLE `departments` (
  `dept_id` varchar(20) NOT NULL,
  `dept_name` varchar(100) NOT NULL,
  `college_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `dorm_applications`
--

CREATE TABLE `dorm_applications` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `student_name` varchar(50) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `room_type` varchar(20) NOT NULL,
  `commute_minutes` int(11) NOT NULL,
  `special_needs` varchar(200) NOT NULL DEFAULT '',
  `emergency_phone` varchar(20) NOT NULL,
  `stage` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT '進行中',
  `bed` varchar(20) NOT NULL DEFAULT '',
  `note` varchar(200) NOT NULL DEFAULT '',
  `history_json` longtext NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `faculty_profiles`
--

CREATE TABLE `faculty_profiles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `dept_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fields` varchar(200) NOT NULL DEFAULT '' COMMENT '領域分類，逗號分隔',
  `expertise` varchar(400) NOT NULL COMMENT '專長關鍵字，逗號分隔',
  `research_summary` text DEFAULT NULL,
  `accepts_projects` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否可指導專題',
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `graduation_requirements`
--

CREATE TABLE `graduation_requirements` (
  `req_id` int(11) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `total_credits_req` int(11) NOT NULL DEFAULT 128,
  `major_required_req` int(11) NOT NULL DEFAULT 60,
  `major_elective_req` int(11) NOT NULL DEFAULT 30,
  `general_req` int(11) NOT NULL DEFAULT 28,
  `english_threshold_name` varchar(100) NOT NULL DEFAULT '多益 550 分或通過進階英文檢定',
  `ethics_req` int(11) NOT NULL DEFAULT 2,
  `project_req` int(11) NOT NULL DEFAULT 3
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `knowledge_base`
--

CREATE TABLE `knowledge_base` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `subcategory` varchar(50) NOT NULL,
  `keyword` varchar(255) NOT NULL,
  `official_term` varchar(255) DEFAULT '',
  `content` text NOT NULL,
  `doc_name` varchar(255) NOT NULL,
  `page` int(11) DEFAULT 1,
  `url` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `knowledge_categories`
--

CREATE TABLE `knowledge_categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `icon` varchar(20) DEFAULT '?',
  `sort_order` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `leave_type` enum('病假','事假','公假','喪假','生理假') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `periods` varchar(50) DEFAULT NULL COMMENT '節次，例如 3-4',
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('待審核','已核准','已退回') NOT NULL DEFAULT '待審核',
  `review_note` varchar(255) NOT NULL DEFAULT '',
  `submitted_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `moodle_links`
--

CREATE TABLE `moodle_links` (
  `student_id` varchar(20) NOT NULL,
  `moodle_username` varchar(100) NOT NULL,
  `moodle_fullname` varchar(100) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `linked_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `scholarships`
--

CREATE TABLE `scholarships` (
  `id` int(11) NOT NULL,
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
  `no_fail_required` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否要求前學期無不及格'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `search_feedback`
--

CREATE TABLE `search_feedback` (
  `feedback_id` int(11) NOT NULL,
  `kb_id` int(11) DEFAULT NULL,
  `query_text` varchar(255) NOT NULL,
  `is_helpful` tinyint(1) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `search_logs`
--

CREATE TABLE `search_logs` (
  `id` int(11) NOT NULL,
  `query` varchar(255) NOT NULL,
  `matched` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `self_reviews`
--

CREATE TABLE `self_reviews` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `semester` varchar(10) NOT NULL COMMENT '學年-學期，例如 115-1',
  `ratings_json` text NOT NULL COMMENT '各項 1-5 分',
  `reflections_json` text NOT NULL COMMENT '文字反思',
  `status` enum('草稿','已完成') NOT NULL DEFAULT '草稿',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `students`
--

CREATE TABLE `students` (
  `student_id` varchar(20) NOT NULL,
  `full_name` varchar(50) NOT NULL,
  `dept_id` varchar(20) NOT NULL,
  `admission_year` int(11) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `parent_phone` varchar(30) DEFAULT NULL,
  `grade_level` tinyint(4) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `conduct_score` decimal(5,2) DEFAULT NULL,
  `identity_type` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `student_credits`
--

CREATE TABLE `student_credits` (
  `credit_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `course_id` varchar(20) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `is_passed` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `student_privacy_settings`
--

CREATE TABLE `student_privacy_settings` (
  `setting_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `parent_alert_consent` tinyint(1) NOT NULL DEFAULT 1,
  `advisor_alert_consent` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `student_records`
--

CREATE TABLE `student_records` (
  `record_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `kind` enum('獎懲','幹部') NOT NULL COMMENT '獎懲 或 幹部',
  `item` varchar(20) NOT NULL COMMENT '獎懲：嘉獎、小功、大功、申誡、小過、大過；幹部：班長、課程小老師…',
  `count` tinyint(4) NOT NULL DEFAULT 1 COMMENT '獎懲次數，例如嘉獎 2 次；幹部固定 1',
  `reason` varchar(200) DEFAULT NULL COMMENT '獎懲事由；小老師填負責的科目',
  `semester` varchar(10) NOT NULL COMMENT '學期，例如 115-1',
  `record_date` date DEFAULT NULL COMMENT '核定或擔任日期',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='學生表現紀錄：獎懲與幹部 (T18)';

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `synonym_dictionary`
--

CREATE TABLE `synonym_dictionary` (
  `synonym_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `user_keyword` varchar(50) NOT NULL,
  `official_term` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `unmatched_queries`
--

CREATE TABLE `unmatched_queries` (
  `query_id` int(11) NOT NULL,
  `query_text` varchar(255) NOT NULL,
  `search_count` int(11) NOT NULL DEFAULT 1,
  `status` enum('待處理','已轉同義詞','已建條文','已忽略') NOT NULL DEFAULT '待處理',
  `resolved_term` varchar(100) DEFAULT NULL,
  `first_searched_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_searched_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('學生','家長','教職員','老師','管理員','訪客') NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `full_name` varchar(50) NOT NULL,
  `advised_class` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `can_manage_dorm` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `user_preferences`
--

CREATE TABLE `user_preferences` (
  `username` varchar(50) NOT NULL,
  `dept_id` varchar(20) DEFAULT NULL,
  `content_scope` enum('all','mine') NOT NULL DEFAULT 'all' COMMENT 'mine = 只看全校公開與本科資訊',
  `pinned_features` varchar(500) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
--


-- --------------------------------------------------------

--
-- 資料表結構 `visitor_logs`
--

CREATE TABLE `visitor_logs` (
  `log_id` int(11) NOT NULL,
  `visitor_name` varchar(50) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `school_from` varchar(100) NOT NULL,
  `purpose` varchar(100) NOT NULL,
  `target_dept` varchar(100) DEFAULT '資訊管理科（五專）',
  `visited_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(50) DEFAULT '127.0.0.1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `academic_calendar`
--
ALTER TABLE `academic_calendar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cal_dates` (`start_date`,`end_date`),
  ADD KEY `fk_cal_checklist` (`related_checklist_id`);

--
-- 資料表索引 `anniversary_events`
--
ALTER TABLE `anniversary_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_anniv_dates` (`start_date`,`end_date`);

--
-- 資料表索引 `anniversary_wishes`
--
ALTER TABLE `anniversary_wishes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wish_event_status` (`event_id`,`status`,`created_at`);

--
-- 資料表索引 `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ann_date` (`publish_date`);

--
-- 資料表索引 `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD PRIMARY KEY (`student_id`,`announcement_id`),
  ADD KEY `fk_ar_ann` (`announcement_id`);

--
-- 資料表索引 `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asg_class` (`class_name`),
  ADD KEY `idx_asg_student` (`student_id`);

--
-- 資料表索引 `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`student_id`,`assignment_id`),
  ADD KEY `fk_sub_asg` (`assignment_id`);

--
-- 資料表索引 `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_att_student_date` (`student_id`,`date`),
  ADD KEY `idx_att_notified` (`notified`);

--
-- 資料表索引 `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_audit_table_record` (`table_name`,`record_id`);

--
-- 資料表索引 `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`cert_id`),
  ADD KEY `fk_cert_student` (`student_id`);

--
-- 資料表索引 `checklist_items`
--
ALTER TABLE `checklist_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `fk_chk_cat` (`category_id`);

--
-- 資料表索引 `checklist_progress`
--
ALTER TABLE `checklist_progress`
  ADD PRIMARY KEY (`student_id`,`item_id`,`step_index`),
  ADD KEY `fk_cp_item` (`item_id`);

--
-- 資料表索引 `class_groups`
--
ALTER TABLE `class_groups`
  ADD PRIMARY KEY (`class_name`);

--
-- 資料表索引 `class_group_members`
--
ALTER TABLE `class_group_members`
  ADD PRIMARY KEY (`class_name`,`student_id`),
  ADD KEY `fk_cgm_student` (`student_id`);

--
-- 資料表索引 `class_notices`
--
ALTER TABLE `class_notices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cn_class` (`class_name`),
  ADD KEY `idx_cn_sender` (`sender_username`);

--
-- 資料表索引 `class_notice_recipients`
--
ALTER TABLE `class_notice_recipients`
  ADD PRIMARY KEY (`notice_id`,`student_id`),
  ADD KEY `fk_cnr_student` (`student_id`);

--
-- 資料表索引 `class_schedule`
--
ALTER TABLE `class_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sched_class` (`class_name`,`weekday`),
  ADD KEY `idx_sched_student` (`student_id`,`weekday`);

--
-- 資料表索引 `counseling_records`
--
ALTER TABLE `counseling_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_counsel_student` (`student_id`,`talk_date`),
  ADD KEY `idx_counsel_class` (`class_name`);

--
-- 資料表索引 `course_map`
--
ALTER TABLE `course_map`
  ADD PRIMARY KEY (`course_id`),
  ADD KEY `fk_course_prereq` (`prerequisite_id`),
  ADD KEY `fk_course_dept` (`dept_id`);

--
-- 資料表索引 `deadlines`
--
ALTER TABLE `deadlines`
  ADD PRIMARY KEY (`deadline_id`),
  ADD KEY `fk_deadline_dept` (`applies_to_dept`);

--
-- 資料表索引 `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`dept_id`);

--
-- 資料表索引 `dorm_applications`
--
ALTER TABLE `dorm_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_dorm_student_semester` (`student_id`,`semester`);

--
-- 資料表索引 `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_faculty_name` (`name`);

--
-- 資料表索引 `graduation_requirements`
--
ALTER TABLE `graduation_requirements`
  ADD PRIMARY KEY (`req_id`),
  ADD UNIQUE KEY `uk_grad_dept` (`dept_id`);

--
-- 資料表索引 `knowledge_base`
--
ALTER TABLE `knowledge_base`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_kb_category` (`category_id`);

--
-- 資料表索引 `knowledge_categories`
--
ALTER TABLE `knowledge_categories`
  ADD PRIMARY KEY (`category_id`);

--
-- 資料表索引 `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leave_student` (`student_id`,`submitted_at`);

--
-- 資料表索引 `moodle_links`
--
ALTER TABLE `moodle_links`
  ADD PRIMARY KEY (`student_id`);

--
-- 資料表索引 `scholarships`
--
ALTER TABLE `scholarships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_scholarship_deadline` (`deadline`);

--
-- 資料表索引 `search_feedback`
--
ALTER TABLE `search_feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `fk_fb_kb` (`kb_id`);

--
-- 資料表索引 `search_logs`
--
ALTER TABLE `search_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_search_created` (`created_at`),
  ADD KEY `idx_search_matched_query` (`matched`,`query`);

--
-- 資料表索引 `self_reviews`
--
ALTER TABLE `self_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_review_student_semester` (`student_id`,`semester`);

--
-- 資料表索引 `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `fk_students_dept` (`dept_id`);

--
-- 資料表索引 `student_credits`
--
ALTER TABLE `student_credits`
  ADD PRIMARY KEY (`credit_id`),
  ADD KEY `fk_credits_student` (`student_id`),
  ADD KEY `fk_credits_course` (`course_id`);

--
-- 資料表索引 `student_privacy_settings`
--
ALTER TABLE `student_privacy_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `uk_privacy_student` (`student_id`);

--
-- 資料表索引 `student_records`
--
ALTER TABLE `student_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `idx_records_student` (`student_id`,`record_date`);

--
-- 資料表索引 `synonym_dictionary`
--
ALTER TABLE `synonym_dictionary`
  ADD PRIMARY KEY (`synonym_id`),
  ADD KEY `fk_synonym_cat` (`category_id`);

--
-- 資料表索引 `unmatched_queries`
--
ALTER TABLE `unmatched_queries`
  ADD PRIMARY KEY (`query_id`),
  ADD UNIQUE KEY `uk_query_text` (`query_text`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uk_username` (`username`),
  ADD KEY `fk_users_student` (`student_id`);

--
-- 資料表索引 `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`username`),
  ADD KEY `fk_pref_dept` (`dept_id`);

--
-- 資料表索引 `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `academic_calendar`
--
ALTER TABLE `academic_calendar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `anniversary_events`
--
ALTER TABLE `anniversary_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `anniversary_wishes`
--
ALTER TABLE `anniversary_wishes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `certificates`
--
ALTER TABLE `certificates`
  MODIFY `cert_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `checklist_items`
--
ALTER TABLE `checklist_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `class_notices`
--
ALTER TABLE `class_notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `class_schedule`
--
ALTER TABLE `class_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `counseling_records`
--
ALTER TABLE `counseling_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `deadlines`
--
ALTER TABLE `deadlines`
  MODIFY `deadline_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `dorm_applications`
--
ALTER TABLE `dorm_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `graduation_requirements`
--
ALTER TABLE `graduation_requirements`
  MODIFY `req_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `knowledge_base`
--
ALTER TABLE `knowledge_base`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `knowledge_categories`
--
ALTER TABLE `knowledge_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `scholarships`
--
ALTER TABLE `scholarships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `search_feedback`
--
ALTER TABLE `search_feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `search_logs`
--
ALTER TABLE `search_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `self_reviews`
--
ALTER TABLE `self_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `student_credits`
--
ALTER TABLE `student_credits`
  MODIFY `credit_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `student_privacy_settings`
--
ALTER TABLE `student_privacy_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `student_records`
--
ALTER TABLE `student_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `synonym_dictionary`
--
ALTER TABLE `synonym_dictionary`
  MODIFY `synonym_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `unmatched_queries`
--
ALTER TABLE `unmatched_queries`
  MODIFY `query_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, ;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `visitor_logs`
--
ALTER TABLE `visitor_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `academic_calendar`
--
ALTER TABLE `academic_calendar`
  ADD CONSTRAINT `fk_cal_checklist` FOREIGN KEY (`related_checklist_id`) REFERENCES `checklist_items` (`item_id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `anniversary_wishes`
--
ALTER TABLE `anniversary_wishes`
  ADD CONSTRAINT `fk_wish_event` FOREIGN KEY (`event_id`) REFERENCES `anniversary_events` (`id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD CONSTRAINT `fk_ar_ann` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ar_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `fk_asg_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `fk_sub_asg` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sub_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `fk_cert_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `checklist_items`
--
ALTER TABLE `checklist_items`
  ADD CONSTRAINT `fk_chk_cat` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `checklist_progress`
--
ALTER TABLE `checklist_progress`
  ADD CONSTRAINT `fk_cp_item` FOREIGN KEY (`item_id`) REFERENCES `checklist_items` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cp_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `class_group_members`
--
ALTER TABLE `class_group_members`
  ADD CONSTRAINT `fk_cgm_class` FOREIGN KEY (`class_name`) REFERENCES `class_groups` (`class_name`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cgm_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `class_notices`
--
ALTER TABLE `class_notices`
  ADD CONSTRAINT `fk_cn_class` FOREIGN KEY (`class_name`) REFERENCES `class_groups` (`class_name`) ON UPDATE CASCADE;

--
-- 資料表的限制式 `class_notice_recipients`
--
ALTER TABLE `class_notice_recipients`
  ADD CONSTRAINT `fk_cnr_notice` FOREIGN KEY (`notice_id`) REFERENCES `class_notices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cnr_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `class_schedule`
--
ALTER TABLE `class_schedule`
  ADD CONSTRAINT `fk_sched_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `counseling_records`
--
ALTER TABLE `counseling_records`
  ADD CONSTRAINT `fk_counsel_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `course_map`
--
ALTER TABLE `course_map`
  ADD CONSTRAINT `fk_course_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_course_prereq` FOREIGN KEY (`prerequisite_id`) REFERENCES `course_map` (`course_id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `deadlines`
--
ALTER TABLE `deadlines`
  ADD CONSTRAINT `fk_deadline_dept` FOREIGN KEY (`applies_to_dept`) REFERENCES `departments` (`dept_id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `dorm_applications`
--
ALTER TABLE `dorm_applications`
  ADD CONSTRAINT `fk_dorm_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON UPDATE CASCADE;

--
-- 資料表的限制式 `graduation_requirements`
--
ALTER TABLE `graduation_requirements`
  ADD CONSTRAINT `fk_grad_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE;

--
-- 資料表的限制式 `knowledge_base`
--
ALTER TABLE `knowledge_base`
  ADD CONSTRAINT `fk_kb_category` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON UPDATE CASCADE;

--
-- 資料表的限制式 `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `fk_leave_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `moodle_links`
--
ALTER TABLE `moodle_links`
  ADD CONSTRAINT `fk_moodle_links_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `search_feedback`
--
ALTER TABLE `search_feedback`
  ADD CONSTRAINT `fk_fb_kb` FOREIGN KEY (`kb_id`) REFERENCES `knowledge_base` (`id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `self_reviews`
--
ALTER TABLE `self_reviews`
  ADD CONSTRAINT `fk_review_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE;

--
-- 資料表的限制式 `student_credits`
--
ALTER TABLE `student_credits`
  ADD CONSTRAINT `fk_credits_course` FOREIGN KEY (`course_id`) REFERENCES `course_map` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_credits_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `student_privacy_settings`
--
ALTER TABLE `student_privacy_settings`
  ADD CONSTRAINT `fk_privacy_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `student_records`
--
ALTER TABLE `student_records`
  ADD CONSTRAINT `fk_records_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `synonym_dictionary`
--
ALTER TABLE `synonym_dictionary`
  ADD CONSTRAINT `fk_synonym_cat` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- 資料表的限制式 `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `fk_pref_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON DELETE SET NULL ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
