-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2026-11-04 07:04:17
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


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
-- 傾印資料表的資料 `academic_calendar`
--

INSERT INTO `academic_calendar` (`id`, `event_name`, `start_date`, `end_date`, `category`, `related_checklist_id`, `owner_key`, `note`, `source`) VALUES
(1, '加退選', '2026-09-14', '2026-09-25', '教務', NULL, NULL, NULL, NULL),
(2, '學雜費繳費期限', '2026-09-01', '2026-09-30', '繳費', NULL, NULL, NULL, NULL),
(3, '獎助學金申請期限', '2026-09-21', '2026-10-16', '獎助', NULL, NULL, NULL, NULL),
(4, '停修申請', '2026-10-01', '2026-10-16', '教務', 1, NULL, NULL, NULL),
(5, '教學意見調查開放期間', '2026-12-14', '2027-01-15', '教務', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `advisor_messages`
--

CREATE TABLE `advisor_messages` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL COMMENT '子女學號',
  `student_name` varchar(50) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `parent_username` varchar(50) NOT NULL,
  `parent_name` varchar(50) DEFAULT NULL,
  `subject` varchar(60) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT '待回覆',
  `reply` varchar(1000) DEFAULT NULL,
  `replied_by` varchar(50) DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家長留言給導師';

--
-- 傾印資料表的資料 `advisor_messages`
--

INSERT INTO `advisor_messages` (`id`, `student_id`, `student_name`, `class_name`, `parent_username`, `parent_name`, `subject`, `content`, `status`, `reply`, `replied_by`, `replied_at`, `created_at`) VALUES
(1, 'S112001', '王小明', '資管四忠', 'parent1', '王大明 (小明家長)', 'live 測試', '測試內容', '已回覆', '教職員回覆內容', '周立威 (教務處職員)', '2026-10-22 03:27:58', '2026-10-22 03:27:56');

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
-- 傾印資料表的資料 `anniversary_events`
--

INSERT INTO `anniversary_events` (`id`, `name_zh`, `name_en`, `name_ja`, `start_date`, `end_date`, `announce_days`, `require_approval`, `is_enabled`) VALUES
(1, '康寧大學校慶', 'UKN Anniversary Celebration', '康寧大学 創立記念祭', '2026-11-01', '2026-11-01', 30, 1, 1);

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
-- 傾印資料表的資料 `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `office`, `publish_date`, `target_class`, `url`) VALUES
(1, '本學期加退選將於 9/25 (五) 17:00 截止', '請同學於截止前至學生教務系統確認選課結果，逾期不再受理加退選。', '註冊組', '2026-09-22', NULL, '#'),
(2, '獎助學金申請開始受理（至 10/16）', '校內外獎助學金即日起開放線上申請，請備妥清寒證明或成績單等相關文件。', '生輔組', '2026-09-21', NULL, '#'),
(3, '9/25 班會地點改至 A402', '因 A301 投影設備維修，本週五班會改於 A402 舉行，請準時出席。', '資管科辦', '2026-09-23', '資管四忠', '#'),
(4, '圖書館利用講習開放報名', '介紹電子資料庫查詢與館際合作服務，參加可認證學習時數 2 小時。', '圖書館', '2026-09-15', NULL, '#'),
(5, '台北校區 A 棟電梯 9/24 停機保養', '9/24 (四) 08:00-12:00 A 棟電梯停機保養，行動不便同學請洽總務處協助。', '總務處', '2026-09-23', NULL, '#'),
(6, '宿舍晚歸登記改為線上辦理', '即日起晚歸、外宿請於學生專區「宿舍晚歸／外宿請假」線上登記，不再受理紙本。', '學務處', '2026-09-10', NULL, '#'),
(7, '實習前健康檢查 10/2 截止繳交', '請於 10/2 前將健康檢查報告繳交至科辦，未繳交者不得參加下學期臨床實習。', '護理科辦', '2026-09-20', '護理四忠', '#');

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
-- 傾印資料表的資料 `announcement_reads`
--

INSERT INTO `announcement_reads` (`student_id`, `announcement_id`, `read_at`) VALUES
('S112001', 4, '2026-10-05 03:54:00'),
('S112001', 6, '2026-10-05 03:54:00'),
('S112002', 1, '2026-10-05 03:54:00'),
('S112002', 2, '2026-10-05 03:54:00'),
('S112002', 4, '2026-10-05 03:54:00');

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
-- 傾印資料表的資料 `assignments`
--

INSERT INTO `assignments` (`id`, `class_name`, `student_id`, `course_name`, `title`, `due_at`, `url`) VALUES
(1, '資管四忠', NULL, '資料結構', '作業一：鏈結串列實作', '2026-09-25 23:59:00', '#'),
(2, '資管四忠', NULL, '資料庫系統概論', 'ER 圖設計報告', '2026-09-30 23:59:00', '#'),
(3, '資管四忠', NULL, '物件導向程式設計', 'Lab 2：類別與封裝', '2026-09-24 12:00:00', '#'),
(4, '資管四忠', NULL, '基礎英文(二)', 'Reading Journal Week 3', '2026-09-22 23:59:00', '#'),
(5, NULL, 'S112001', '程式設計(一)', '重修班：迴圈練習題', '2026-09-28 23:59:00', '#'),
(6, '資管四孝', NULL, '資料結構', '作業一：鏈結串列實作', '2026-09-26 23:59:00', '#'),
(7, '護理四忠', NULL, '藥理學', '常用藥物分類表', '2026-09-29 23:59:00', '#');

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
-- 傾印資料表的資料 `assignment_submissions`
--

INSERT INTO `assignment_submissions` (`student_id`, `assignment_id`, `submitted_at`) VALUES
('S112001', 3, '2026-10-05 03:54:00'),
('S112002', 1, '2026-10-05 03:54:00'),
('S112002', 3, '2026-10-05 03:54:00'),
('S112002', 4, '2026-10-05 03:54:00'),
('S112005', 4, '2026-10-05 03:54:00');

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
-- 傾印資料表的資料 `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `student_id`, `date`, `course_name`, `type`, `notified`, `hours`, `exam_policy`) VALUES
(1, 'S112001', '2026-09-14', '程式設計(一)', '曠課', 1, NULL, 'ordinary'),
(2, 'S112001', '2026-09-15', '基礎英文(二)', '遲到', 1, NULL, 'ordinary'),
(3, 'S112001', '2026-09-16', '程式設計(一)', '曠課', 1, NULL, 'ordinary'),
(4, 'S112001', '2026-09-18', '跨領域思維與創新科技', '病假', 1, NULL, 'ordinary'),
(5, 'S112001', '2026-09-21', '程式設計(一)', '曠課', 0, NULL, 'ordinary'),
(6, 'S112001', '2026-09-23', '程式設計(一)', '曠課', 0, NULL, 'ordinary'),
(7, 'S112002', '2026-09-16', '資料庫系統概論', '病假', 1, NULL, 'ordinary'),
(8, 'S112005', '2026-09-15', '資料結構', '曠課', 0, NULL, 'ordinary'),
(9, 'S112005', '2026-09-17', '物件導向程式設計', '遲到', 0, NULL, 'ordinary');

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
-- 傾印資料表的資料 `audit_logs`
--

INSERT INTO `audit_logs` (`log_id`, `table_name`, `record_id`, `action`, `changed_by`, `changed_by_role`, `ip_address`, `before_json`, `after_json`, `changed_at`) VALUES
(1, 'knowledge_base', '6', '新增', '系統超級管理員', '管理員', NULL, NULL, '{\"id\": 6, \"category_id\": 1, \"category_name\": \"教務學則與選課\", \"subcategory\": \"測試\", \"keyword\": \"QA稽核測試\", \"official_term\": \"QA稽核測試\", \"content\": \"驗證修改紀錄功能\", \"doc_name\": \"QA.pdf\", \"page\": 1, \"url\": \"https://www.ukn.edu.tw/\", \"updated_at\": \"2026-10-05\"}', '2026-10-05 03:55:20'),
(2, 'knowledge_base', '6', '刪除', '系統超級管理員', '管理員', NULL, '{\"id\": 6, \"category_id\": 1, \"category_name\": \"教務學則與選課\", \"subcategory\": \"測試\", \"keyword\": \"QA稽核測試\", \"official_term\": \"QA稽核測試\", \"content\": \"驗證修改紀錄功能\", \"doc_name\": \"QA.pdf\", \"page\": 1, \"url\": \"https://www.ukn.edu.tw/\", \"updated_at\": \"2026-10-05\"}', NULL, '2026-10-05 03:55:20'),
(3, 'knowledge_base', '6', '新增', '系統超級管理員', '管理員', NULL, NULL, '{\"id\": 6, \"category_id\": 1, \"category_name\": \"教務學則與選課\", \"subcategory\": \"複測\", \"keyword\": \"QA複測條文\", \"official_term\": \"QA複測條文\", \"content\": \"複測用\", \"doc_name\": \"QA.pdf\", \"page\": 1, \"url\": \"https://www.ukn.edu.tw/\", \"updated_at\": \"2026-10-05\"}', '2026-10-05 04:05:02'),
(4, 'knowledge_base', '6', '刪除', '系統超級管理員', '管理員', NULL, '{\"id\": 6, \"category_id\": 1, \"category_name\": \"教務學則與選課\", \"subcategory\": \"複測\", \"keyword\": \"QA複測條文\", \"official_term\": \"QA複測條文\", \"content\": \"複測用\", \"doc_name\": \"QA.pdf\", \"page\": 1, \"url\": \"https://www.ukn.edu.tw/\", \"updated_at\": \"2026-10-05\"}', NULL, '2026-10-05 04:05:02'),
(5, 'report_files', '1', '新增', '系統超級管理員', '管理員', NULL, NULL, '{\"id\": 1, \"title\": \"???? 2026\", \"category\": \"??\", \"description\": \"??????????\", \"file_url\": \"/uploads/report_20261008_104515_10c53b.pdf\", \"file_name\": \"qa_report_test.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:45:15\", \"download_count\": 0}', '2026-10-08 02:45:15'),
(6, 'report_files', '1', '刪除', '系統超級管理員', '管理員', NULL, '{\"id\": 1, \"title\": \"???? 2026\", \"category\": \"??\", \"description\": \"??????????\", \"file_url\": \"/uploads/report_20261008_104515_10c53b.pdf\", \"file_name\": \"qa_report_test.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:45:15\", \"download_count\": 0}', NULL, '2026-10-08 02:45:25'),
(7, 'report_files', '1', '新增', '系統超級管理員', '管理員', NULL, NULL, '{\"id\": 1, \"title\": \"測試公告2026\", \"category\": \"校慶\", \"description\": \"驗證報表上傳下載功能\", \"file_url\": \"/uploads/report_20261008_104538_02011d.pdf\", \"file_name\": \"qa_report_test.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:45:38\", \"download_count\": 0}', '2026-10-08 02:45:38'),
(8, 'report_files', '2', '新增', '系統超級管理員', '管理員', NULL, NULL, '{\"id\": 2, \"title\": \"校慶第二波公告\", \"category\": \"校慶\", \"description\": \"測試同分類通知\", \"file_url\": \"/uploads/report_20261008_104603_539031.pdf\", \"file_name\": \"qa_report_test2.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:46:03\", \"download_count\": 0}', '2026-10-08 02:46:03'),
(9, 'report_files', '3', '新增', '系統超級管理員', '管理員', NULL, NULL, '{\"id\": 3, \"title\": \"教師專屬會議資料\", \"category\": \"教務\", \"description\": \"僅限老師下載\", \"file_url\": \"/uploads/report_20261008_104628_edd2a9.pdf\", \"file_name\": \"qa_report_test3.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"老師\", \"教職員\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:46:28\", \"download_count\": 0}', '2026-10-08 02:46:28'),
(10, 'report_files', '1', '刪除', '系統超級管理員', '管理員', NULL, '{\"id\": 1, \"title\": \"測試公告2026\", \"category\": \"校慶\", \"description\": \"驗證報表上傳下載功能\", \"file_url\": \"/uploads/report_20261008_104538_02011d.pdf\", \"file_name\": \"qa_report_test.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:45:38\", \"download_count\": 1}', NULL, '2026-10-08 02:46:45'),
(11, 'report_files', '2', '刪除', '系統超級管理員', '管理員', NULL, '{\"id\": 2, \"title\": \"校慶第二波公告\", \"category\": \"校慶\", \"description\": \"測試同分類通知\", \"file_url\": \"/uploads/report_20261008_104603_539031.pdf\", \"file_name\": \"qa_report_test2.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:46:03\", \"download_count\": 0}', NULL, '2026-10-08 02:46:45'),
(12, 'report_files', '3', '刪除', '系統超級管理員', '管理員', NULL, '{\"id\": 3, \"title\": \"教師專屬會議資料\", \"category\": \"教務\", \"description\": \"僅限老師下載\", \"file_url\": \"/uploads/report_20261008_104628_edd2a9.pdf\", \"file_name\": \"qa_report_test3.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"老師\", \"教職員\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:46:28\", \"download_count\": 1}', NULL, '2026-10-08 02:46:45'),
(13, 'report_files', '1', '新增', '系統超級管理員', '管理員', NULL, NULL, '{\"id\": 1, \"title\": \"最終驗收測試檔案\", \"category\": \"測試\", \"description\": \"確認前後端連動\", \"file_url\": \"/uploads/report_20261008_105517_9b1082.pdf\", \"file_name\": \"qa_final_test.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:55:17\", \"download_count\": 0}', '2026-10-08 02:55:17'),
(14, 'report_files', '1', '刪除', '系統超級管理員', '管理員', NULL, '{\"id\": 1, \"title\": \"最終驗收測試檔案\", \"category\": \"測試\", \"description\": \"確認前後端連動\", \"file_url\": \"/uploads/report_20261008_105517_9b1082.pdf\", \"file_name\": \"qa_final_test.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"系統超級管理員\", \"uploaded_by_username\": \"admin\", \"uploaded_at\": \"2026-10-08 10:55:17\", \"download_count\": 0}', NULL, '2026-10-08 02:55:17'),
(15, 'classes', '???????', '新增', '陳雅婷 老師', '老師', NULL, NULL, '{\"class_name\": \"???????\", \"created_by\": \"陳雅婷 老師\"}', '2026-10-15 02:44:23'),
(16, 'events', '1', '新增', '周立威 (教務處職員)', '教職員', NULL, NULL, '{\"id\": 1, \"title\": \"現場測試活動\", \"description\": \"smoke test\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-10-22\", \"event_time\": \"\", \"registration_deadline\": \"2026-10-21\", \"capacity\": 1, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-21 09:35:57\"}', '2026-10-21 01:35:57'),
(17, 'events', '2', '新增', '周立威 (教務處職員)', '教職員', NULL, NULL, '{\"id\": 2, \"title\": \"現場測試活動\", \"description\": \"smoke test\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-10-22\", \"event_time\": \"\", \"registration_deadline\": \"2026-10-21\", \"capacity\": 1, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-21 09:36:26\"}', '2026-10-21 01:36:26'),
(18, 'events', '3', '新增', '周立威 (教務處職員)', '教職員', NULL, NULL, '{\"id\": 3, \"title\": \"現場測試活動\", \"description\": \"smoke test\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-10-22\", \"event_time\": \"\", \"registration_deadline\": \"2026-10-21\", \"capacity\": 1, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-21 09:36:51\"}', '2026-10-21 01:36:51'),
(19, 'events', '4', '新增', '周立威 (教務處職員)', '教職員', NULL, NULL, '{\"id\": 4, \"title\": \"報名者管理介面測試活動\", \"description\": \"\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-10-23\", \"event_time\": \"\", \"registration_deadline\": \"2026-10-22\", \"capacity\": 1, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-22 10:51:42\"}', '2026-10-22 02:51:42'),
(20, 'event_registrations', '7', '修改', '周立威 (教務處職員)', '教職員', NULL, '{\"id\": 7, \"event_id\": 4, \"student_id\": \"S112001\", \"full_name\": \"王小明\", \"email\": \"liule4854@gmail.com\", \"phone\": \"\", \"note\": \"\", \"age\": 20, \"status\": \"已報名\", \"checkin_code\": \"e914b6ad91dd425b84304823c7b07ac3\", \"registered_by_key\": \"staff:staff1\", \"registered_by_role\": \"教職員\", \"created_at\": \"2026-10-22 10:51:42\", \"cancelled_at\": null, \"checked_in\": false, \"checked_in_at\": null, \"reminded\": false, \"rating\": null, \"feedback_comment\": null, \"feedback_at\": null}', '{\"id\": 7, \"event_id\": 4, \"student_id\": \"S112001\", \"full_name\": \"王小明\", \"email\": \"liule4854@gmail.com\", \"phone\": \"0912345678\", \"note\": \"\", \"age\": 21, \"status\": \"已報名\", \"checkin_code\": \"e914b6ad91dd425b84304823c7b07ac3\", \"registered_by_key\": \"staff:staff1\", \"registered_by_role\": \"教職員\", \"created_at\": \"2026-10-22 10:51:42\", \"cancelled_at\": null, \"checked_in\": false, \"checked_in_at\": null, \"reminded\": false, \"rating\": null, \"feedback_comment\": null, \"feedback_at\": null}', '2026-10-22 02:51:51'),
(21, 'event_registrations', '7', '刪除', '周立威 (教務處職員)', '教職員', NULL, '{\"id\": 7, \"event_id\": 4, \"student_id\": \"S112001\", \"full_name\": \"王小明\", \"email\": \"liule4854@gmail.com\", \"phone\": \"0912345678\", \"note\": \"\", \"age\": 21, \"status\": \"已報名\", \"checkin_code\": \"e914b6ad91dd425b84304823c7b07ac3\", \"registered_by_key\": \"staff:staff1\", \"registered_by_role\": \"教職員\", \"created_at\": \"2026-10-22 10:51:42\", \"cancelled_at\": null, \"checked_in\": true, \"checked_in_at\": \"2026-10-22 10:51:56\", \"reminded\": false, \"rating\": null, \"feedback_comment\": null, \"feedback_at\": null}', NULL, '2026-10-22 02:51:56'),
(22, 'events', '1', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"報名者管理介面測試活動\", \"description\": \"\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-10-23\", \"event_time\": \"\", \"registration_deadline\": \"2026-10-22\", \"capacity\": 1, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-22 11:05:25\", \"id\": 1}', '2026-10-22 03:05:25'),
(23, 'event_registrations', '1', '修改', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"id\": 1, \"event_id\": 1, \"student_id\": \"S112001\", \"full_name\": \"王小明\", \"email\": \"liule4854@gmail.com\", \"phone\": \"\", \"age\": 20, \"note\": \"\", \"status\": \"已報名\", \"checkin_code\": \"b5731f11e99146fea962fba4bf5b6ac7\", \"registered_by_key\": \"staff:staff1\", \"registered_by_role\": \"教職員\", \"created_at\": \"2026-10-22 11:05:25\", \"cancelled_at\": null, \"checked_in\": false, \"checked_in_at\": null, \"reminded\": false, \"rating\": null, \"feedback_comment\": null, \"feedback_at\": null}', '{\"id\": 1, \"event_id\": 1, \"student_id\": \"S112001\", \"full_name\": \"王小明\", \"email\": \"liule4854@gmail.com\", \"phone\": \"0912345678\", \"age\": 21, \"note\": \"\", \"status\": \"已報名\", \"checkin_code\": \"b5731f11e99146fea962fba4bf5b6ac7\", \"registered_by_key\": \"staff:staff1\", \"registered_by_role\": \"教職員\", \"created_at\": \"2026-10-22 11:05:25\", \"cancelled_at\": null, \"checked_in\": false, \"checked_in_at\": null, \"reminded\": false, \"rating\": null, \"feedback_comment\": null, \"feedback_at\": null}', '2026-10-22 03:05:34'),
(24, 'event_registrations', '1', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"id\": 1, \"event_id\": 1, \"student_id\": \"S112001\", \"full_name\": \"王小明\", \"email\": \"liule4854@gmail.com\", \"phone\": \"0912345678\", \"age\": 21, \"note\": \"\", \"status\": \"已報名\", \"checkin_code\": \"b5731f11e99146fea962fba4bf5b6ac7\", \"registered_by_key\": \"staff:staff1\", \"registered_by_role\": \"教職員\", \"created_at\": \"2026-10-22 11:05:25\", \"cancelled_at\": null, \"checked_in\": true, \"checked_in_at\": \"2026-10-22 11:05:39\", \"reminded\": false, \"rating\": null, \"feedback_comment\": null, \"feedback_at\": null}', NULL, '2026-10-22 03:05:39'),
(25, 'room_bookings', '1', '修改', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"room_name\": \"資圖 D201 討論室\", \"date\": \"2026-10-29\", \"applicant\": \"王小明\", \"status\": \"審核中\"}', '{\"room_name\": \"資圖 D201 討論室\", \"date\": \"2026-10-29\", \"applicant\": \"王小明\", \"status\": \"已核准\", \"review_note\": \"\"}', '2026-10-22 03:27:55'),
(26, 'lockers', 'A001', '修改', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"locker_id\": \"A001\", \"holder\": \"S112001\", \"status\": \"保留中\"}', '{\"locker_id\": \"A001\", \"holder\": \"S112001\", \"status\": \"已租用\"}', '2026-10-22 03:27:56'),
(27, 'report_files', '1', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"live 測試檔\", \"category\": \"live測試\", \"description\": \"desc\", \"file_url\": \"/uploads/report_20261022_112758_fa916c.pdf\", \"file_name\": \"demo.pdf\", \"file_type\": \"pdf\", \"allowed_roles\": [\"all\"], \"uploaded_by\": \"周立威 (教務處職員)\", \"uploaded_by_username\": \"staff1\", \"uploaded_at\": \"2026-10-22 11:27:58\", \"download_count\": 0, \"id\": 1}', '2026-10-22 03:27:58'),
(28, 'dorm_applications', '1', '新增', '王小明', '學生', '127.0.0.1', NULL, '{\"student_id\": \"S112001\", \"semester\": \"115-2(live)\", \"stage\": 0}', '2026-10-28 01:00:36'),
(29, 'dorm_applications', '2', '新增', '王小明', '學生', '127.0.0.1', NULL, '{\"student_id\": \"S112001\", \"semester\": \"115-2(confirm)\", \"stage\": 0}', '2026-10-28 01:27:15'),
(30, 'dorm_applications', '1', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"已送件\", \"bed\": \"\"}', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\", \"note\": \"\"}', '2026-10-28 01:27:16'),
(31, 'dorm_applications', '2', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"已送件\", \"bed\": \"\"}', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\", \"note\": \"確認流程\"}', '2026-10-28 01:27:16'),
(32, 'dorm_applications', '2', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\"}', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"床位排序\", \"bed\": \"S306-1\", \"note\": \"床號S306-1\"}', '2026-10-28 01:27:34'),
(33, 'dorm_applications', '2', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"床位排序\", \"bed\": \"S306-1\"}', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"床位分配\", \"bed\": \"S306-1\", \"note\": \"\"}', '2026-10-28 01:27:41'),
(34, 'dorm_applications', '1', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\"}', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"床位排序\", \"bed\": \"\", \"note\": \"\"}', '2026-10-28 01:27:45'),
(35, 'dorm_applications', '2', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"床位分配\", \"bed\": \"S306-1\"}', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"繳交住宿費\", \"bed\": \"S306-1\", \"note\": \"\"}', '2026-10-28 01:27:59'),
(36, 'dorm_applications', '3', '新增', '李美華', '學生', '127.0.0.1', NULL, '{\"student_id\": \"S112002\", \"semester\": \"115-2(ui-check)\", \"stage\": 0}', '2026-10-28 01:34:01'),
(37, 'dorm_applications', '3', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"已送件\", \"bed\": \"\"}', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\", \"note\": \"\"}', '2026-10-28 01:34:01'),
(38, 'dorm_applications', '3', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\"}', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"床位排序\", \"bed\": \"\", \"note\": \"\"}', '2026-10-28 01:34:01'),
(39, 'dorm_applications', '3', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"床位排序\", \"bed\": \"\"}', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"床位分配\", \"bed\": \"S305-2\", \"note\": \"\"}', '2026-10-28 01:34:01'),
(40, 'dorm_applications', '4', '新增', '王小明', '學生', '127.0.0.1', NULL, '{\"student_id\": \"S112001\", \"semester\": \"115-2(reject-chk)\", \"stage\": 0}', '2026-10-28 01:34:41'),
(41, 'dorm_applications', '4', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"進行中\", \"stage\": \"已送件\", \"bed\": \"\"}', '{\"name\": \"王小明\", \"student_id\": \"S112001\", \"status\": \"未通過\", \"stage\": \"已送件\", \"bed\": \"\", \"note\": \"資格不符合申請條件\"}', '2026-10-28 01:34:42'),
(42, 'leave_requests', '2', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"status\": \"待審核\"}', '{\"status\": \"已核准\", \"review_note\": \"\"}', '2026-10-28 01:44:48'),
(43, 'dorm_applications', '5', '新增', '李美華', '學生', '127.0.0.1', NULL, '{\"student_id\": \"S112002\", \"semester\": \"115-2(bedpick)\", \"stage\": 0}', '2026-10-28 01:53:57'),
(44, 'dorm_applications', '5', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"已送件\", \"bed\": \"\"}', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\", \"note\": \"\"}', '2026-10-28 01:53:58'),
(45, 'dorm_applications', '5', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"資格審查\", \"bed\": \"\"}', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"床位排序\", \"bed\": \"\", \"note\": \"\"}', '2026-10-28 01:53:58'),
(46, 'dorm_applications', '5', '修改', '宿舍管理示範員', '教職員', '127.0.0.1', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"床位排序\", \"bed\": \"\"}', '{\"name\": \"李美華\", \"student_id\": \"S112002\", \"status\": \"進行中\", \"stage\": \"床位分配\", \"bed\": \"S307-1\", \"note\": \"\"}', '2026-10-28 01:53:58'),
(47, 'events', '2', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"前端驗證測試活動-請忽略\", \"description\": \"自動化驗證用，驗證完畢會刪除\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"10:00\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 5, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 11:01:42\", \"id\": 2}', '2026-10-28 03:01:42'),
(48, 'events', '2', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"cancelled\": false}', '{\"cancelled\": true}', '2026-10-28 03:01:48'),
(49, 'events', '3', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"QR與回饋驗證測試活動-請忽略\", \"description\": \"\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 5, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 11:26:14\", \"id\": 3}', '2026-10-28 03:26:14'),
(50, 'events', '3', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"cancelled\": false}', '{\"cancelled\": true}', '2026-10-28 03:26:17'),
(51, 'events', '4', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"自訂通知驗證測試活動-請忽略\", \"description\": \"\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 5, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 12:13:27\", \"id\": 4}', '2026-10-28 04:13:27'),
(52, 'event_registrations', '4', '自訂通知', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"subject\": \"活動異動\", \"target\": 5, \"sent\": 0, \"failed\": 1}', '2026-10-28 04:13:30'),
(53, 'event_registrations', '4', '自訂通知', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"subject\": \"活動公告\", \"target\": \"all\", \"sent\": 0, \"failed\": 2}', '2026-10-28 04:13:35'),
(54, 'events', '4', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"cancelled\": false}', '{\"cancelled\": true}', '2026-10-28 04:13:35'),
(55, 'events', '5', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"自訂通知驗證測試活動-請忽略\", \"description\": \"\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 5, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 12:14:22\", \"id\": 5}', '2026-10-28 04:14:22'),
(56, 'event_registrations', '5', '自訂通知', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"subject\": \"活動異動\", \"target\": 7, \"sent\": 0, \"failed\": 1}', '2026-10-28 04:14:30'),
(57, 'event_registrations', '5', '自訂通知', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"subject\": \"活動公告\", \"target\": \"all\", \"sent\": 0, \"failed\": 2}', '2026-10-28 04:14:34'),
(58, 'events', '5', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"cancelled\": false}', '{\"cancelled\": true}', '2026-10-28 04:14:34'),
(59, 'events', '6', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"CRUD驗證測試活動-請忽略\", \"description\": \"測試說明\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 3, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 20:40:14\", \"id\": 6}', '2026-10-28 12:40:14'),
(60, 'events', '6', '修改', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"id\": 6, \"title\": \"CRUD驗證測試活動-請忽略\", \"description\": \"測試說明\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 3, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 20:40:14\"}', '{\"id\": 6, \"title\": \"CRUD驗證測試活動-已改名\", \"description\": \"測試說明\", \"image_url\": \"\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 8, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 20:40:14\"}', '2026-10-28 12:40:16'),
(61, 'events', '6', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"cancelled\": false}', '{\"cancelled\": true}', '2026-10-28 12:40:16'),
(62, 'deadlines', '6', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"deadline_id\": 6, \"title\": \"期限新增UI驗證-請忽略\", \"category\": \"測試單位\", \"semester_week\": 11, \"start_date\": \"2026-10-28\", \"end_date\": \"2026-12-31\", \"applies_to_role\": \"學生\", \"applies_to_dept\": null, \"related_system_url\": \"\", \"description\": \"驗證新增表單\", \"status_badge\": \"進行中\"}', '2026-10-28 13:02:49'),
(63, 'events', '7', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"加分說明驗證測試活動-請忽略\", \"description\": \"\", \"image_url\": \"\", \"benefit\": \"完成並簽到可登記為 CCAC 證照加分項目\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 3, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 21:15:33\", \"id\": 7}', '2026-10-28 13:15:33'),
(64, 'events', '7', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"cancelled\": false}', '{\"cancelled\": true}', '2026-10-28 13:15:35'),
(65, 'events', '8', '新增', '周立威 (教務處職員)', '教職員', '127.0.0.1', NULL, '{\"title\": \"最終驗證測試活動-請忽略\", \"description\": \"\", \"image_url\": \"\", \"benefit\": \"筆試 70 分以上可登記為 CCAC 證照加分項目\", \"eligibility\": \"限資訊管理科學生\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"14:00\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 3, \"cancelled\": 0, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 21:49:36\", \"id\": 8}', '2026-10-28 13:49:36'),
(66, 'events', '8', '修改', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"id\": 8, \"title\": \"最終驗證測試活動-請忽略\", \"description\": \"\", \"image_url\": \"\", \"benefit\": \"筆試 70 分以上可登記為 CCAC 證照加分項目\", \"eligibility\": \"限資訊管理科學生\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"14:00\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 3, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 21:49:36\"}', '{\"id\": 8, \"title\": \"最終驗證測試活動-請忽略\", \"description\": \"\", \"image_url\": \"\", \"benefit\": \"筆試 70 分以上可登記為 CCAC 證照加分項目\", \"eligibility\": \"全校學生皆可報名\", \"location\": \"測試地點\", \"event_date\": \"2026-11-07\", \"event_time\": \"14:00\", \"registration_deadline\": \"2026-11-06\", \"capacity\": 3, \"cancelled\": false, \"created_by\": \"staff1\", \"created_at\": \"2026-10-28 21:49:36\"}', '2026-10-28 13:49:36'),
(67, 'events', '8', '刪除', '周立威 (教務處職員)', '教職員', '127.0.0.1', '{\"cancelled\": false}', '{\"cancelled\": true}', '2026-10-28 13:49:36'),
(68, 'events', '9', '新增', '系統超級管理員', '管理員', '127.0.0.1', NULL, '{\"title\": \"中文打字\", \"description\": \"\", \"image_url\": \"\", \"benefit\": \"30字以上有丙級證照\", \"eligibility\": \"資訊管理科學生\", \"location\": \"C2060\", \"event_date\": \"2026-11-27\", \"event_time\": \"03:00\", \"registration_deadline\": \"2026-11-27\", \"capacity\": 30, \"cancelled\": 0, \"created_by\": \"admin\", \"created_at\": \"2026-10-29 09:36:32\", \"id\": 9}', '2026-10-29 01:36:32'),
(69, 'events', '10', '新增', '陳雅婷 老師', '老師', '127.0.0.1', NULL, '{\"title\": \"英文打字\", \"description\": \"\", \"image_url\": \"\", \"benefit\": \"30字以上有丙級證照\", \"eligibility\": \"資訊管理科學生\", \"location\": \"A\", \"event_date\": \"2026-11-27\", \"event_time\": \"16:10\", \"registration_deadline\": \"2026-11-27\", \"capacity\": 1, \"cancelled\": 0, \"created_by\": \"teacher1\", \"created_at\": \"2026-10-29 10:16:23\", \"id\": 10}', '2026-10-29 02:16:23');

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
-- 傾印資料表的資料 `certificates`
--

INSERT INTO `certificates` (`cert_id`, `student_id`, `cert_name`, `issuing_org`, `cert_number`, `theory_score`, `practical_score`, `cert_status`, `verify_url`, `file_path`, `file_name`, `file_type`, `issue_date`, `kind`, `review_status`, `reviewer`, `review_note`, `reviewed_at`, `award`, `description`, `attachments`, `created_at`) VALUES
(1, 'S112001', '丙級電腦硬體裝修技術士', '勞動部勞動力發展署', '113-CS-004521', 82.00, 88.00, '及格發證', NULL, NULL, NULL, NULL, '2026-06-20', '證照', '已通過', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-05 03:54:00'),
(2, 'S112001', '乙級電腦軟體應用技術士', '勞動部勞動力發展署', '114-CS-008912', 86.50, 92.00, '及格發證', NULL, NULL, NULL, NULL, '2026-08-15', '證照', '已通過', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-05 03:54:00'),
(3, 'S112002', 'TQC+ 網頁設計工程師', '財團法人中華民國電腦技能基金會', 'TQC-WD-22310', 78.00, 85.00, '及格發證', NULL, NULL, NULL, NULL, '2026-07-05', '證照', '已通過', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-05 03:54:00'),
(4, 'S112004', '丙級電腦硬體裝修技術士', '勞動部勞動力發展署', '113-CS-004588', 90.00, 86.00, '及格發證', NULL, NULL, NULL, NULL, '2026-06-20', '證照', '已通過', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-05 03:54:00'),
(5, 'S112004', '乙級電腦軟體應用技術士', '勞動部勞動力發展署', '114-CS-009010', 88.00, 90.00, '及格發證', NULL, NULL, NULL, NULL, '2026-08-15', '證照', '已通過', NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-05 03:54:00');

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
-- 傾印資料表的資料 `checklist_items`
--

INSERT INTO `checklist_items` (`item_id`, `category_id`, `category_name`, `business_name`, `steps_json`, `required_docs`, `office_hours`, `office_location`, `contact_phone`, `form_download_url`, `system_url`, `deadline_week_info`, `related_kb_id`, `audience`) VALUES
(1, 1, '課務組', '課程停修申請', '[\"至校務資訊系統登入『停修申請表』\", \"列印紙本停修申請單\", \"親自送請任課教師簽章同意\", \"送請班級導師及科主任簽章\", \"於第12週五前送交教務處課務組核備\"]', '停修申請單紙本、歷年成績單正本', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A201 (課務組)', '02-2632-1181 分機 310, 312', '/forms/course_withdraw_form', 'http://talk.ukn.edu.tw/class_redi/class.php', '第 10-12 週 (本週受理中)', 1, '學生'),
(2, 2, '生輔組', '學生請假申請 (病假/事假)', '[\"登入學生資訊系統填寫請假單\", \"上傳就醫證明或相關佐證文件圖檔\", \"送出後通知導師進行線上簽核\", \"請假超過3日由生輔組組長複核\", \"系統顯示審核通過即完成登錄\"]', '健保特約就醫證明、就診收據影本', '週一至週五 08:00 - 17:30', '行政大樓 1 樓 學務處生輔組', '02-2632-1181 分機 211', '/forms/leave_application_form', 'https://ec.ukn.edu.tw/AskLeave/login.aspx', '請假日當日起 3 日內', 2, '學生'),
(3, 3, '通識中心', '外語證照免修與學分抵免', '[\"填寫通識外語抵免申請表\", \"備妥多益/英檢/雅思成績單正本及影本各一份\", \"送交通識教育中心辦公室查驗正本\", \"教務處課務組複審學分折抵\", \"次學期初於歷年成績單確認抵免註記\"]', '外語檢定成績單正本、影本、抵免申請書', '週一至週五 09:00 - 16:30', '卓越樓 3 樓 C305 (通識教育中心)', '02-2632-1181 分機 520, 521', '/forms/english_waiver_form', 'http://203.71.63.13/academic/', '開學前至加退選截止 (已截止)', 3, '學生'),
(4, 1, '註冊組', '學士班畢業學分資格預審', '[\"登入畢業審查系統列印學分檢核表\", \"核對科專業必修、選修與通識學分缺口\", \"確認英文畢業門檻與專題通過證明\", \"至科辦公室請科主任初審簽章\", \"送交教務處註冊組進行畢業資格決審\"]', '歷年成績單正本、畢業學分預審表、外語通過證明', '週一至週五 08:30 - 17:00', '康寧樓 2 樓 A202 (註冊組)', '02-2632-1181 分機 321, 322', '/forms/graduation_audit_form', 'http://203.71.63.13/academic/', '大四第 8-16 週 (進行中)', 4, '學生'),
(5, 3, '研發處', '專業證照與競賽獲獎獎勵金申請', '[\"登入研發處證照獎勵申請平台\", \"填寫證照/競賽名稱、證書字號與發證單位\", \"上傳證書正反面與郵局存摺封面圖檔\", \"列印紙本印領清冊並親筆簽名\", \"送交研發處實習就業組審核並撥款\"]', '證照證書影本、郵局存摺封面影本、印領清冊', '週一至週五 09:00 - 17:00', '圖資大樓 2 樓 研發處實習就業組', '02-2632-1181 分機 612', '/forms/certificate_reward_form', 'https://oes3.ukn.edu.tw/~license/', '每學期第 1-5 週', 5, '學生');

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
-- 傾印資料表的資料 `checklist_progress`
--

INSERT INTO `checklist_progress` (`student_id`, `item_id`, `step_index`, `done`) VALUES
('S112001', 1, 0, 1),
('S112001', 1, 1, 1),
('S112001', 3, 0, 1),
('S112005', 1, 0, 1);

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
-- 傾印資料表的資料 `class_groups`
--

INSERT INTO `class_groups` (`class_name`, `password_hash`, `created_by`, `created_by_username`, `created_at`) VALUES
('???????', 'scrypt:32768:8:1$vDmXoNf1E7x2xkpN$5b019d243787ebbef8a89e6e8cdb00dc45ec7f5bd843d12ea7c0b8bb66e5e63b042fa8bf429924c69974b9c0db07df3c2f88fbbd371169fd09c4b1efe1e29e05', '陳雅婷 老師', 'teacher1', '2026-10-22 03:27:57'),
('護理四忠', 'scrypt:32768:8:1$bdkMxceFMS1pviVw$c432ee0f43f38485f70f138cc208b9ee5bf5a95b275642d906583f7367c7fc6cdd6392c3f5237f28b15a02d829dcf27a518d1331629825414b40ee2ede2c8d1e', '系統', NULL, '2026-10-22 03:27:57'),
('資管四孝', 'scrypt:32768:8:1$GDvqmXCmOP1NldNL$5eea2c35b743c52482399e0c43d1a377adaef0fad0a82280810e05ccaa980752af1d60974b2269e341fd159193ae754dab680422cd46c6a79d4fc4bb5360665f', '系統', NULL, '2026-10-22 03:27:57'),
('資管四忠', 'scrypt:32768:8:1$llOMFWIyNO9AynRV$2d8a6ce56c5c2b7e676fcfd794c4670c89ea95501a7ef46b330cd5a4f0ecdf58150f7a30af16d3405b0fcf8d1164bd1ec1365afd99447e753d2afdb9139477d9', '系統', NULL, '2026-10-22 03:27:57');

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
-- 傾印資料表的資料 `class_group_members`
--

INSERT INTO `class_group_members` (`class_name`, `student_id`, `joined_at`) VALUES
('護理四忠', 'S112003', '2026-10-22 03:27:57'),
('資管四孝', 'S112004', '2026-10-22 03:27:57'),
('資管四忠', 'S112001', '2026-10-22 03:27:57'),
('資管四忠', 'S112002', '2026-10-22 03:27:57'),
('資管四忠', 'S112005', '2026-10-22 03:27:57');

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
-- 傾印資料表的資料 `class_notices`
--

INSERT INTO `class_notices` (`id`, `class_name`, `target_type`, `target_label`, `whole_class`, `title`, `content`, `priority`, `sender`, `sender_username`, `due_date`, `created_at`, `reply_required`) VALUES
(1, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 07:59:26', 0),
(2, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 07:59:27', 0),
(3, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 08:00:43', 0),
(4, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 08:00:44', 0),
(5, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 08:01:24', 0),
(6, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 08:01:25', 0),
(7, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 08:38:35', 0),
(8, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 08:38:36', 0),
(9, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 08:40:21', 0),
(10, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 08:40:22', 0),
(11, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 08:43:35', 0),
(12, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 08:43:36', 0),
(13, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 08:44:22', 0),
(14, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 08:44:23', 0),
(15, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 09:51:36', 0),
(16, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 09:51:37', 0),
(17, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 09:53:46', 0),
(18, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 09:53:47', 0),
(19, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 09:55:53', 0),
(20, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 09:55:53', 0),
(21, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 09:57:21', 0),
(22, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 09:57:22', 0),
(23, '資管四忠', '班級', NULL, 1, '期中考', '下週考試', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 09:57:22', 0),
(24, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 15:46:06', 0),
(25, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 15:46:08', 0),
(26, '資管四忠', '班級', NULL, 1, '期中考', '下週考試', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 15:46:08', 0),
(27, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 15:47:39', 0),
(28, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 15:47:40', 0),
(29, '資管四忠', '班級', NULL, 1, '期中考', '下週考試', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 15:47:40', 0),
(30, '資管四忠', '班級', NULL, 1, '期中考公告', '下週三考期中考', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 15:50:20', 0),
(31, '護理四忠', '班級', NULL, 1, '全校公告', '教職員可以通知任何班級', '一般', '周立威 (教務處職員)', 'staff1', NULL, '2026-10-14 15:50:20', 0),
(32, '資管四忠', '班級', NULL, 1, '期中考', '下週考試', '一般', '陳雅婷 老師', 'teacher1', NULL, '2026-10-14 15:50:21', 0);

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
-- 傾印資料表的資料 `class_notice_recipients`
--

INSERT INTO `class_notice_recipients` (`notice_id`, `student_id`, `read_at`, `reply`, `reply_at`) VALUES
(1, 'S112001', NULL, NULL, NULL),
(1, 'S112002', NULL, NULL, NULL),
(1, 'S112005', NULL, NULL, NULL),
(2, 'S112003', NULL, NULL, NULL),
(3, 'S112001', NULL, NULL, NULL),
(3, 'S112002', NULL, NULL, NULL),
(3, 'S112005', NULL, NULL, NULL),
(4, 'S112003', NULL, NULL, NULL),
(5, 'S112001', NULL, NULL, NULL),
(5, 'S112002', NULL, NULL, NULL),
(5, 'S112005', NULL, NULL, NULL),
(6, 'S112003', NULL, NULL, NULL),
(7, 'S112001', NULL, NULL, NULL),
(7, 'S112002', NULL, NULL, NULL),
(7, 'S112005', NULL, NULL, NULL),
(8, 'S112003', NULL, NULL, NULL),
(9, 'S112001', NULL, NULL, NULL),
(9, 'S112002', NULL, NULL, NULL),
(9, 'S112005', NULL, NULL, NULL),
(10, 'S112003', NULL, NULL, NULL),
(11, 'S112001', NULL, NULL, NULL),
(11, 'S112002', NULL, NULL, NULL),
(11, 'S112005', NULL, NULL, NULL),
(12, 'S112003', NULL, NULL, NULL),
(13, 'S112001', NULL, NULL, NULL),
(13, 'S112002', NULL, NULL, NULL),
(13, 'S112005', NULL, NULL, NULL),
(14, 'S112003', NULL, NULL, NULL),
(15, 'S112001', NULL, NULL, NULL),
(15, 'S112002', NULL, NULL, NULL),
(15, 'S112005', NULL, NULL, NULL),
(16, 'S112003', NULL, NULL, NULL),
(17, 'S112001', NULL, NULL, NULL),
(17, 'S112002', NULL, NULL, NULL),
(17, 'S112005', NULL, NULL, NULL),
(18, 'S112003', NULL, NULL, NULL),
(19, 'S112001', NULL, NULL, NULL),
(19, 'S112002', NULL, NULL, NULL),
(19, 'S112005', NULL, NULL, NULL),
(20, 'S112003', NULL, NULL, NULL),
(21, 'S112001', NULL, NULL, NULL),
(21, 'S112002', NULL, NULL, NULL),
(21, 'S112005', NULL, NULL, NULL),
(22, 'S112003', NULL, NULL, NULL),
(23, 'S112001', NULL, NULL, NULL),
(23, 'S112002', NULL, NULL, NULL),
(23, 'S112005', NULL, NULL, NULL),
(24, 'S112001', NULL, NULL, NULL),
(24, 'S112002', NULL, NULL, NULL),
(24, 'S112005', NULL, NULL, NULL),
(25, 'S112003', NULL, NULL, NULL),
(26, 'S112001', NULL, NULL, NULL),
(26, 'S112002', NULL, NULL, NULL),
(26, 'S112005', NULL, NULL, NULL),
(27, 'S112001', NULL, NULL, NULL),
(27, 'S112002', NULL, NULL, NULL),
(27, 'S112005', NULL, NULL, NULL),
(28, 'S112003', NULL, NULL, NULL),
(29, 'S112001', NULL, NULL, NULL),
(29, 'S112002', NULL, NULL, NULL),
(29, 'S112005', NULL, NULL, NULL),
(30, 'S112001', NULL, NULL, NULL),
(30, 'S112002', NULL, NULL, NULL),
(30, 'S112005', NULL, NULL, NULL),
(31, 'S112003', NULL, NULL, NULL),
(32, 'S112001', NULL, NULL, NULL),
(32, 'S112002', NULL, NULL, NULL),
(32, 'S112005', NULL, NULL, NULL);

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
-- 傾印資料表的資料 `class_schedule`
--

INSERT INTO `class_schedule` (`id`, `class_name`, `student_id`, `weekday`, `period_start`, `period_end`, `course_name`, `classroom`, `teacher`) VALUES
(1, '資管四忠', NULL, 1, 3, 4, '環境永續與社會責任', 'G203', '黃淑芬'),
(2, '資管四忠', NULL, 2, 1, 2, '基礎英文(二)', 'L201', 'Amy Chen'),
(3, '資管四忠', NULL, 2, 3, 5, '資料結構', 'A301', '林志明'),
(4, '資管四忠', NULL, 3, 3, 5, '資料庫系統概論', 'A402', '陳雅婷'),
(5, '資管四忠', NULL, 4, 2, 4, '物件導向程式設計', 'A305 電腦教室', '吳建宏'),
(6, '資管四忠', NULL, 5, 3, 4, '跨領域思維與創新科技', 'G101', '李佩珊'),
(7, '資管四忠', NULL, 5, 6, 7, '班會 / 導師時間', 'A301', '陳雅婷'),
(8, NULL, 'S112001', 1, 6, 7, '程式設計(一)', 'A303', '張文華'),
(9, NULL, 'S112001', 3, 6, 6, '程式設計(一)', 'A303', '張文華'),
(10, '資管四孝', NULL, 1, 1, 3, '資料結構', 'A301', '林志明'),
(11, '資管四孝', NULL, 2, 3, 4, '基礎英文(二)', 'L203', 'Amy Chen'),
(12, '資管四孝', NULL, 3, 2, 4, '物件導向程式設計', 'A305 電腦教室', '吳建宏'),
(13, '資管四孝', NULL, 4, 3, 5, '資料庫系統概論', 'A402', '陳雅婷'),
(14, '資管四孝', NULL, 5, 6, 7, '班會 / 導師時間', 'A302', '林志明'),
(15, '護理四忠', NULL, 1, 1, 3, '內外科護理學', 'N201', '許美玲'),
(16, '護理四忠', NULL, 2, 1, 2, '藥理學', 'N203', '蔡宗翰'),
(17, '護理四忠', NULL, 3, 3, 4, '基礎英文(二)', 'L202', 'Amy Chen'),
(18, '護理四忠', NULL, 4, 1, 4, '基本護理學實驗', 'N105 技術教室', '許美玲'),
(19, '護理四忠', NULL, 5, 3, 4, '護理倫理', 'N201', '鄭如君');

-- --------------------------------------------------------

--
-- 資料表結構 `conduct_evaluations`
--

CREATE TABLE `conduct_evaluations` (
  `student_id` varchar(20) NOT NULL,
  `semester` varchar(10) NOT NULL,
  `advisor_adjust` decimal(3,1) NOT NULL DEFAULT 0.0 COMMENT '導師加減分 (-5 ~ +5)',
  `comment` varchar(255) DEFAULT NULL COMMENT '導師評語',
  `evaluated_by` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `conduct_records`
--

CREATE TABLE `conduct_records` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `semester` varchar(10) NOT NULL COMMENT '學年-學期，依 record_date 計算',
  `record_date` date NOT NULL,
  `type` enum('大功','小功','嘉獎','警告','小過','大過') NOT NULL,
  `count` tinyint(4) NOT NULL DEFAULT 1,
  `reason` varchar(200) NOT NULL,
  `recorded_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `conduct_settings`
--

CREATE TABLE `conduct_settings` (
  `id` tinyint(4) NOT NULL DEFAULT 1,
  `settings_json` text NOT NULL COMMENT '基本分、獎懲配分、缺曠扣分、導師評分範圍、及格分數、等第門檻',
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- 傾印資料表的資料 `course_map`
--

INSERT INTO `course_map` (`course_id`, `course_name`, `credits`, `prerequisite_id`, `is_required`, `course_type`, `dept_id`, `semester_suggest`, `description`, `semester_hours`) VALUES
('CS101', '計算機概論', 3, NULL, 1, '專業必修', 'CS', '大一上', '計算機科學基礎、電腦架構、二進位運算、作業系統與網路概論。', NULL),
('CS102', '程式設計(一)', 3, 'CS101', 1, '專業必修', 'CS', '大一下', 'Python 與 C 語言基礎邏輯、變數、迴圈、陣列與函式設計。', NULL),
('CS201', '資料結構', 3, 'CS102', 1, '專業必修', 'CS', '大二上', '陣列、鏈結串列、堆疊、佇列、二元樹、圖形演算法與搜尋排序。', NULL),
('CS202', '物件導向程式設計', 3, 'CS102', 1, '專業必修', 'CS', '大二下', '類別、封裝、繼承、多型、Java/C++ 實作與 GUI 設計。', NULL),
('CS301', '演算法分析', 3, 'CS201', 1, '專業必修', 'CS', '大三上', '時間複雜度、分治演算法、貪婪演算法、動態規劃與 NP 問題。', NULL),
('CS302', '資料庫系統概論', 3, 'CS201', 1, '專業必修', 'CS', '大三上', '關聯式資料庫、SQL 查詢最佳化、3NF 正規化與 MySQL/PostgreSQL 實務。', NULL),
('CS303', '網頁前後端開發實務', 3, 'CS102', 0, '專業選修', 'CS', '大三上', 'HTML5/Tailwind/FastAPI/Flask 全端系統整合與 REST API。', NULL),
('CS304', '雲端運算與虛擬化', 3, 'CS101', 0, '專業選修', 'CS', '大三下', 'Docker 容器化、Kubernetes、AWS 與微服務架構實戰。', NULL),
('CS401', '畢業專題研討(一)', 3, 'CS302', 1, '專業必修', 'CS', '大四上', '綜合資訊系統開發、專題實作、系統架構設計與成果展覽。', NULL),
('CS402', '畢業專題研討(二)', 3, 'CS401', 1, '專業必修', 'CS', '大四下', '畢業專題成果報告撰寫、系統部署與校外競賽發表。', NULL),
('EN101', '基礎英文(一)', 2, NULL, 1, '共同必修', 'CS', '大一上', '大一基礎外語聽說讀寫與實用生活英語。', NULL),
('EN102', '基礎英文(二)', 2, 'EN101', 1, '共同必修', 'CS', '大一下', '進階商用英文與學術閱讀報告寫作。', NULL),
('GE101', '大學之道與校園倫理', 2, NULL, 0, '通識教育', 'CS', '大一上', '校園生活適應、生命教育、學術誠信與職場倫理。', NULL),
('GE102', '跨領域思維與創新科技', 2, NULL, 0, '通識教育', 'CS', '大二上', '人工智慧生活應用、設計思考與數位轉型思維。', NULL),
('GE103', '環境永續與社會責任', 2, NULL, 0, '通識教育', 'CS', '大二下', 'ESG 永續發展目標、生態保育與社會公益實踐。', NULL);

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
-- 傾印資料表的資料 `deadlines`
--

INSERT INTO `deadlines` (`deadline_id`, `title`, `category`, `semester_week`, `start_date`, `end_date`, `applies_to_role`, `applies_to_dept`, `related_system_url`, `description`, `status_badge`) VALUES
(1, '115-1 學期課程停修申請', '教務處課務組', 11, '2026-10-01', '2026-10-18', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '學期第 10-12 週開放停修申請，每人以 2 科為限，須完成導師與主任簽章。', '進行中 (剩 3 天)'),
(2, '期中預警評量與導師學習輔導訪談', '學務處/教務處', 11, '2026-10-05', '2026-10-20', '學生,老師,家長', 'CS', 'http://203.71.63.13/academic/', '期中成績不及格達 1/2 者列入預警，導師將安排個別學習輔導與座談。', '進行中 (剩 5 天)'),
(3, '大四應屆畢業生學分資格預審', '教務處註冊組', 11, '2026-09-15', '2026-11-30', '學生', 'CS', 'http://203.71.63.13/academic/', '大四學生請至註冊組核對必選修、通識與外語門檻缺口。', '進行中 (剩 35 天)'),
(4, '共同外語與證照學分抵免申請', '通識教育中心', 3, '2026-09-01', '2026-09-15', '學生', NULL, 'http://203.71.63.13/academic/', '大一共同外語抵免申請已截止，逾期者請於下學期初辦理。', '已截止'),
(5, '暑期重補修意願登記與開班調查', '教務處課務組', 14, '2026-11-01', '2026-11-20', '學生', 'CS', 'http://talk.ukn.edu.tw/class_redi/class.php', '先修科目不及格需重修者，可預先登記暑期課程開班意願。', '尚未開放');

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
-- 傾印資料表的資料 `departments`
--

INSERT INTO `departments` (`dept_id`, `dept_name`, `college_name`) VALUES
('ANI', '數位影視動畫科（五專）', '商業資訊學院'),
('BA', '企業管理學系（科）', '商業資訊學院'),
('CS', '資訊管理科（五專）', '商業資訊學院'),
('ECE', '嬰幼兒保育學系', '護理健康學院'),
('ENG', '應用外語科（五專）', '商業資訊學院'),
('LTC', '長期照護學系', '護理健康學院'),
('NUR', '護理科（五專）', '護理健康學院'),
('OPT', '視光科（五專）', '護理健康學院');

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
-- 傾印資料表的資料 `dorm_applications`
--

INSERT INTO `dorm_applications` (`id`, `student_id`, `student_name`, `semester`, `room_type`, `commute_minutes`, `special_needs`, `emergency_phone`, `stage`, `status`, `bed`, `note`, `history_json`, `created_at`) VALUES
(1, 'S112001', '王小明', '115-2(live)', '四人房', 30, '', '0912345678', 2, '進行中', '', '', '[{\"stage\": 0, \"at\": \"2026-10-28 09:00:36\", \"note\": \"線上送件\"}, {\"stage\": 1, \"at\": \"2026-10-28 09:27:16\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 2, \"at\": \"2026-10-28 09:27:45\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}]', '2026-10-28 09:00:36'),
(2, 'S112001', '王小明', '115-2(confirm)', '六人房', 45, '', '0911222333', 4, '進行中', 'S306-1', '', '[{\"stage\": 0, \"at\": \"2026-10-28 09:27:15\", \"note\": \"線上送件\"}, {\"stage\": 1, \"at\": \"2026-10-28 09:27:16\", \"note\": \"確認流程\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 2, \"at\": \"2026-10-28 09:27:34\", \"note\": \"床號S306-1\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 3, \"at\": \"2026-10-28 09:27:41\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 4, \"at\": \"2026-10-28 09:27:59\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}]', '2026-10-28 09:27:15'),
(3, 'S112002', '李美華', '115-2(ui-check)', '四人房', 20, '', '0922333444', 3, '進行中', 'S305-2', '', '[{\"stage\": 0, \"at\": \"2026-10-28 09:34:01\", \"note\": \"線上送件\"}, {\"stage\": 1, \"at\": \"2026-10-28 09:34:01\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 2, \"at\": \"2026-10-28 09:34:01\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 3, \"at\": \"2026-10-28 09:34:01\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}]', '2026-10-28 09:34:01'),
(4, 'S112001', '王小明', '115-2(reject-chk)', '六人房', 5, '', '0900000000', 0, '未通過', '', '資格不符合申請條件', '[{\"stage\": 0, \"at\": \"2026-10-28 09:34:41\", \"note\": \"線上送件\"}, {\"stage\": 0, \"at\": \"2026-10-28 09:34:42\", \"note\": \"資格不符合申請條件\", \"status\": \"未通過\", \"reviewed_by\": \"dorm_demo\"}]', '2026-10-28 09:34:41'),
(5, 'S112002', '李美華', '115-2(bedpick)', '六人房', 15, '', '0933000111', 3, '進行中', 'S307-1', '', '[{\"stage\": 0, \"at\": \"2026-10-28 09:53:57\", \"note\": \"線上送件\"}, {\"stage\": 1, \"at\": \"2026-10-28 09:53:58\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 2, \"at\": \"2026-10-28 09:53:58\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}, {\"stage\": 3, \"at\": \"2026-10-28 09:53:58\", \"note\": \"\", \"status\": \"進行中\", \"reviewed_by\": \"dorm_demo\"}]', '2026-10-28 09:53:57');

-- --------------------------------------------------------

--
-- 資料表結構 `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `benefit` varchar(200) DEFAULT NULL,
  `eligibility` varchar(200) DEFAULT NULL,
  `location` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` varchar(5) DEFAULT NULL,
  `registration_deadline` date NOT NULL,
  `capacity` int(11) NOT NULL,
  `cancelled` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活動報名：活動本身';

--
-- 傾印資料表的資料 `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `image_url`, `benefit`, `eligibility`, `location`, `event_date`, `event_time`, `registration_deadline`, `capacity`, `cancelled`, `created_by`, `created_at`) VALUES
(9, '中文打字', '', '', '30字以上有丙級證照', '資訊管理科學生', 'C2060', '2026-11-27', '03:00', '2026-11-27', 30, 0, 'admin', '2026-10-29 09:36:32'),
(10, '英文打字', '', '', '30字以上有丙級證照', '資訊管理科學生', 'A', '2026-11-27', '16:10', '2026-11-27', 1, 0, 'teacher1', '2026-10-29 10:16:23');

-- --------------------------------------------------------

--
-- 資料表結構 `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `full_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `age` int(11) NOT NULL,
  `note` varchar(200) DEFAULT NULL,
  `status` varchar(10) NOT NULL DEFAULT '已報名',
  `checkin_code` varchar(64) NOT NULL,
  `registered_by_key` varchar(100) DEFAULT NULL,
  `registered_by_role` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `checked_in` tinyint(1) NOT NULL DEFAULT 0,
  `checked_in_at` datetime DEFAULT NULL,
  `reminded` tinyint(1) NOT NULL DEFAULT 0,
  `notified` tinyint(1) NOT NULL DEFAULT 0,
  `notified_at` datetime DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `feedback_comment` varchar(500) DEFAULT NULL,
  `feedback_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活動報名：報名紀錄';

--
-- 傾印資料表的資料 `event_registrations`
--

INSERT INTO `event_registrations` (`id`, `event_id`, `student_id`, `full_name`, `email`, `phone`, `age`, `note`, `status`, `checkin_code`, `registered_by_key`, `registered_by_role`, `created_at`, `cancelled_at`, `checked_in`, `checked_in_at`, `reminded`, `notified`, `notified_at`, `rating`, `feedback_comment`, `feedback_at`) VALUES
(11, 9, 'S112001', '王小明', '111534130@stu.ukn.edu.tw', '0956875214', 18, '22', '已取消', 'a37e5c844ffb41a0bc48e8fb8cfd3aea', 'S112001', '學生', '2026-10-29 09:37:41', '2026-10-29 10:02:30', 0, NULL, 0, 0, NULL, NULL, NULL, NULL),
(12, 9, 'S112001', '王小明', '111534130@stu.ukn.edu.tw', '0955587565', 18, '22', '已報名', '3d5ee4ef4dd642b7a70d59e0f9b19149', 'S112001', '學生', '2026-10-29 10:02:58', NULL, 0, NULL, 0, 1, '2026-10-29 10:03:04', NULL, NULL, NULL),
(13, 10, 'S112001', '王小明', '111534130@stu.ukn.edu.tw', '0955587565', 18, '22', '已報名', '6cbb5cd2e9ff49bdb4f1848d148f0ae4', 'S112001', '學生', '2026-10-29 10:16:35', NULL, 0, NULL, 0, 1, '2026-10-29 10:16:40', NULL, NULL, NULL);

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
-- 傾印資料表的資料 `faculty_profiles`
--

INSERT INTO `faculty_profiles` (`id`, `name`, `title`, `dept_name`, `email`, `fields`, `expertise`, `research_summary`, `accepts_projects`, `is_public`, `updated_at`) VALUES
(1, '陳雅婷', '副教授', '資訊管理科', '', '資訊科技,人工智慧與資料分析', '機器學習,資料探勘,Python,學習分析', '運用機器學習分析學生學習歷程，預測學習落後並提供早期輔導建議。', 1, 1, '2026-10-14 07:27:01'),
(2, '林志明', '助理教授', '資訊管理科', '', '資訊安全與網路', '資訊安全,網路安全,滲透測試,雲端運算,Linux', '校園網路安全檢測與雲端服務架構，帶領學生參加資安競賽。', 1, 1, '2026-10-14 07:27:01'),
(3, '吳建宏', '講師', '資訊管理科', '', '資訊科技,數位媒體與動畫', '網頁開發,前端,行動應用,UI/UX', '響應式網站與行動應用程式設計，重視使用者體驗與無障礙設計。', 1, 1, '2026-10-14 07:27:01'),
(4, '張文華', '講師', '資訊管理科', '', '資訊科技,企業管理與行銷', '資料庫設計,SQL,ERP,電子商務', '企業資源規劃系統導入與電子商務平台資料庫設計。', 0, 1, '2026-10-14 07:27:01'),
(5, '黃淑芬', '副教授', '通識教育中心', '', '通識與人文社會', '生命教育,倫理學,服務學習', '生命教育與醫護倫理課程設計，推動社區服務學習。', 1, 1, '2026-10-14 07:27:01'),
(6, '李佩珊', '助理教授', '通識教育中心', '', '通識與人文社會,人工智慧與資料分析', '統計學,研究方法,問卷設計,資料分析', '健康行為調查的問卷設計與統計分析，可協助專題的研究方法與數據處理。', 1, 1, '2026-10-14 07:27:01'),
(7, 'Amy Chen', '講師', '應用外語科', '', '語言與外語教學', '英語會話,多益,商務英文', '多益與商務英語教學，指導英語簡報與口說競賽。', 1, 1, '2026-10-14 07:27:01'),
(8, '許美玲', '副教授', '護理科', '', '護理與健康照護,長期照護', '長期照護,老人護理,社區衛生', '社區長者健康促進與長照服務品質，與在地長照據點合作實習。', 1, 1, '2026-10-14 07:27:01'),
(9, '蔡宗翰', '助理教授', '護理科', '', '護理與健康照護,資訊科技', '重症護理,護理資訊,模擬教學', '以情境模擬與數位工具輔助護理技術教學。', 1, 1, '2026-10-14 07:27:01'),
(10, '鄭如君', '講師', '護理科', '', '護理與健康照護,幼兒教育與保育', '婦兒護理,母嬰照護,衛教設計', '母嬰照護衛教教材設計與親職教育。', 0, 1, '2026-10-14 07:27:01');

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
-- 傾印資料表的資料 `graduation_requirements`
--

INSERT INTO `graduation_requirements` (`req_id`, `dept_id`, `total_credits_req`, `major_required_req`, `major_elective_req`, `general_req`, `english_threshold_name`, `ethics_req`, `project_req`) VALUES
(1, 'CS', 220, 60, 30, 28, '多益測驗 550 分以上 或 通過進階實用英語檢定', 2, 6),
(2, 'NUR', 220, 75, 25, 28, '通過護理師國家考試門檻檢定', 2, 4),
(3, 'ENG', 220, 55, 35, 28, '多益測驗 750 分以上 或 雅思 6.0 以上', 2, 6);

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
  `url` varchar(500) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `knowledge_base`
--

INSERT INTO `knowledge_base` (`id`, `category_id`, `subcategory`, `keyword`, `official_term`, `content`, `doc_name`, `page`, `url`, `updated_at`) VALUES
(1, 1, '選課與停修', '棄修', '停修', '學生於加退選截止後，因特殊原因無法繼續修習某門課程，得於學期第 10-12 週申請停修（每學期以 2 科為限）。停修課程仍須登記於歷年成績單，但成績欄註記「停修」，不計入該學期學分數計算，且停修後學分數不得低於該學期最低應修學分。', '康寧大學學生學則.pdf', 12, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw', '2026-10-05 03:54:00'),
(2, 2, '出缺勤請假', '病假', '學生請假規定', '學生因病無法到校上課，應於請假日當日起 3 日內（含例假日）登入校務系統提出線上請假申請，並檢附健保特約醫療院所開立之就醫證明或診斷書，經導師核准後始完成請假手續。', '康寧大學學生請假規則.pdf', 5, 'https://www.ukn.edu.tw/p/412-1000-382.php?Lang=zh-tw', '2026-10-05 03:54:00'),
(3, 3, '語言證照抵免', '英文抵免', '語言證照抵免', '學生取得多益測驗 (TOEIC) 550 分以上、全民英檢 (GEPT) 中級複試通過或同等級國際外語證照者，得於每學期開學後至加退選截止前，檢附成績單正本與影本至通識教育中心申請抵免大一共同外語「基礎英文(一)」及「基礎英文(二)」共 4 學分。', '康寧大學共同外語學分抵免辦法.pdf', 3, 'https://www.ukn.edu.tw/p/412-1000-383.php?Lang=zh-tw', '2026-10-05 03:54:00'),
(4, 1, '擋修與先修', '擋修', '先修科目未通過', '本校各科系必修課程若訂有先修科目限制（例如：程式設計(一) 為 資料結構 之先修科目），學生該先修科目未達及格標準（60 分）者，電腦選課系統將自動擋修，不得修習後續先修關聯課程，需待先修科目重修及格後始得修習。', '康寧大學課程選修要點.pdf', 8, 'https://www.ukn.edu.tw/p/412-1000-384.php?Lang=zh-tw', '2026-10-05 03:54:00'),
(5, 3, '專業證照獎勵', '證照補助', '學生取得專業證照獎勵辦法', '學生在學期間取得教育部認可之乙級以上技術士證照或國際專業原廠認證，每張最高可申請新台幣 3,000 至 10,000 元獎勵金。申請期間為每學期第 1 至 5 週，請至研發處實習就業組辦理。', '康寧大學學生專業證照獎勵要點.pdf', 2, 'https://www.ukn.edu.tw/p/412-1000-385.php?Lang=zh-tw', '2026-10-05 03:54:00');

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
-- 傾印資料表的資料 `knowledge_categories`
--

INSERT INTO `knowledge_categories` (`category_id`, `category_name`, `icon`, `sort_order`) VALUES
(1, '教務學則與選課', '📖', 1),
(2, '學務生輔與請假', '📝', 2),
(3, '證照抵免與獎助', '🏆', 3),
(4, '總務校園與設施', '🏢', 4);

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
-- 傾印資料表的資料 `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `student_id`, `leave_type`, `start_date`, `end_date`, `periods`, `reason`, `status`, `review_note`, `submitted_at`) VALUES
(1, 'S112001', '病假', '2026-09-18', '2026-09-18', '3-4', '發燒就醫', '已核准', '', '2026-09-18 08:30:00'),
(2, 'S112001', '事假', '2026-09-30', '2026-09-30', '3-5', '家中有事需返鄉', '已核准', '', '2026-09-22 21:10:00'),
(3, 'S112002', '病假', '2026-09-16', '2026-09-16', '3-5', '腸胃炎', '已核准', '', '2026-09-16 07:45:00'),
(4, 'S112005', '事假', '2026-09-22', '2026-09-22', '1-2', '機車故障', '已退回', '請補附相關證明後重新申請', '2026-09-22 09:20:00');

-- --------------------------------------------------------

--
-- 資料表結構 `lockers`
--

CREATE TABLE `lockers` (
  `locker_id` varchar(20) NOT NULL,
  `area` varchar(50) NOT NULL,
  `row_no` int(11) NOT NULL,
  `col_no` int(11) NOT NULL,
  `fee` int(11) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT '可租借',
  `holder_key` varchar(100) DEFAULT NULL,
  `reserved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='櫃子租借';

--
-- 傾印資料表的資料 `lockers`
--

INSERT INTO `lockers` (`locker_id`, `area`, `row_no`, `col_no`, `fee`, `status`, `holder_key`, `reserved_at`) VALUES
('A001', '康寧樓 1F 走廊', 0, 0, 300, '已租用', 'S112001', NULL),
('A002', '康寧樓 1F 走廊', 0, 1, 300, '已租用', NULL, NULL),
('A003', '康寧樓 1F 走廊', 0, 2, 300, '已租用', NULL, NULL),
('A004', '康寧樓 1F 走廊', 0, 3, 300, '已租用', NULL, NULL),
('A005', '康寧樓 1F 走廊', 0, 4, 300, '可租借', NULL, NULL),
('A006', '康寧樓 1F 走廊', 0, 5, 300, '可租借', NULL, NULL),
('A007', '康寧樓 1F 走廊', 0, 6, 300, '可租借', NULL, NULL),
('A008', '康寧樓 1F 走廊', 0, 7, 300, '已租用', NULL, NULL),
('A009', '康寧樓 1F 走廊', 0, 8, 300, '可租借', NULL, NULL),
('A010', '康寧樓 1F 走廊', 0, 9, 300, '已租用', NULL, NULL),
('A011', '康寧樓 1F 走廊', 1, 0, 300, '已租用', NULL, NULL),
('A012', '康寧樓 1F 走廊', 1, 1, 300, '可租借', NULL, NULL),
('A013', '康寧樓 1F 走廊', 1, 2, 300, '已租用', NULL, NULL),
('A014', '康寧樓 1F 走廊', 1, 3, 300, '已租用', NULL, NULL),
('A015', '康寧樓 1F 走廊', 1, 4, 300, '可租借', NULL, NULL),
('A016', '康寧樓 1F 走廊', 1, 5, 300, '可租借', NULL, NULL),
('A017', '康寧樓 1F 走廊', 1, 6, 300, '已租用', NULL, NULL),
('A018', '康寧樓 1F 走廊', 1, 7, 300, '可租借', NULL, NULL),
('A019', '康寧樓 1F 走廊', 1, 8, 300, '可租借', NULL, NULL),
('A020', '康寧樓 1F 走廊', 1, 9, 300, '已租用', NULL, NULL),
('A021', '康寧樓 1F 走廊', 2, 0, 300, '可租借', NULL, NULL),
('A022', '康寧樓 1F 走廊', 2, 1, 300, '可租借', NULL, NULL),
('A023', '康寧樓 1F 走廊', 2, 2, 300, '已租用', NULL, NULL),
('A024', '康寧樓 1F 走廊', 2, 3, 300, '已租用', NULL, NULL),
('A025', '康寧樓 1F 走廊', 2, 4, 300, '可租借', NULL, NULL),
('A026', '康寧樓 1F 走廊', 2, 5, 300, '已租用', NULL, NULL),
('A027', '康寧樓 1F 走廊', 2, 6, 300, '已租用', NULL, NULL),
('A028', '康寧樓 1F 走廊', 2, 7, 300, '已租用', NULL, NULL),
('A029', '康寧樓 1F 走廊', 2, 8, 300, '可租借', NULL, NULL),
('A030', '康寧樓 1F 走廊', 2, 9, 300, '可租借', NULL, NULL),
('A031', '康寧樓 1F 走廊', 3, 0, 300, '可租借', NULL, NULL),
('A032', '康寧樓 1F 走廊', 3, 1, 300, '可租借', NULL, NULL),
('A033', '康寧樓 1F 走廊', 3, 2, 300, '可租借', NULL, NULL),
('A034', '康寧樓 1F 走廊', 3, 3, 300, '可租借', NULL, NULL),
('A035', '康寧樓 1F 走廊', 3, 4, 300, '可租借', NULL, NULL),
('A036', '康寧樓 1F 走廊', 3, 5, 300, '可租借', NULL, NULL),
('A037', '康寧樓 1F 走廊', 3, 6, 300, '可租借', NULL, NULL),
('A038', '康寧樓 1F 走廊', 3, 7, 300, '可租借', NULL, NULL),
('A039', '康寧樓 1F 走廊', 3, 8, 300, '可租借', NULL, NULL),
('A040', '康寧樓 1F 走廊', 3, 9, 300, '可租借', NULL, NULL),
('D041', '圖資大樓 B1', 0, 0, 200, '可租借', NULL, NULL),
('D042', '圖資大樓 B1', 0, 1, 200, '已租用', NULL, NULL),
('D043', '圖資大樓 B1', 0, 2, 200, '已租用', NULL, NULL),
('D044', '圖資大樓 B1', 0, 3, 200, '已租用', NULL, NULL),
('D045', '圖資大樓 B1', 0, 4, 200, '已租用', NULL, NULL),
('D046', '圖資大樓 B1', 0, 5, 200, '已租用', NULL, NULL),
('D047', '圖資大樓 B1', 0, 6, 200, '已租用', NULL, NULL),
('D048', '圖資大樓 B1', 0, 7, 200, '已租用', NULL, NULL),
('D049', '圖資大樓 B1', 1, 0, 200, '可租借', NULL, NULL),
('D050', '圖資大樓 B1', 1, 1, 200, '可租借', NULL, NULL),
('D051', '圖資大樓 B1', 1, 2, 200, '可租借', NULL, NULL),
('D052', '圖資大樓 B1', 1, 3, 200, '已租用', NULL, NULL),
('D053', '圖資大樓 B1', 1, 4, 200, '已租用', NULL, NULL),
('D054', '圖資大樓 B1', 1, 5, 200, '可租借', NULL, NULL),
('D055', '圖資大樓 B1', 1, 6, 200, '可租借', NULL, NULL),
('D056', '圖資大樓 B1', 1, 7, 200, '可租借', NULL, NULL),
('D057', '圖資大樓 B1', 2, 0, 200, '已租用', NULL, NULL),
('D058', '圖資大樓 B1', 2, 1, 200, '可租借', NULL, NULL),
('D059', '圖資大樓 B1', 2, 2, 200, '已租用', NULL, NULL),
('D060', '圖資大樓 B1', 2, 3, 200, '可租借', NULL, NULL),
('D061', '圖資大樓 B1', 2, 4, 200, '可租借', NULL, NULL),
('D062', '圖資大樓 B1', 2, 5, 200, '可租借', NULL, NULL),
('D063', '圖資大樓 B1', 2, 6, 200, '可租借', NULL, NULL),
('D064', '圖資大樓 B1', 2, 7, 200, '可租借', NULL, NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `meetings`
--

CREATE TABLE `meetings` (
  `id` int(11) NOT NULL,
  `title` varchar(80) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `host_key` varchar(100) NOT NULL,
  `host_name` varchar(50) NOT NULL,
  `host_role` varchar(10) NOT NULL,
  `start_at` datetime NOT NULL,
  `duration_min` int(11) NOT NULL DEFAULT 60,
  `room_name` varchar(80) NOT NULL,
  `invite_code` varchar(12) NOT NULL,
  `allow_code_join` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(10) NOT NULL DEFAULT '排定' COMMENT '排定 / 已取消',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='線上會議';

-- --------------------------------------------------------

--
-- 資料表結構 `meeting_members`
--

CREATE TABLE `meeting_members` (
  `id` int(11) NOT NULL,
  `meeting_id` int(11) NOT NULL,
  `member_key` varchar(100) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `source` varchar(10) NOT NULL COMMENT '邀請 / 班級 / 邀請碼',
  `invited_by` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='線上會議成員';

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

-- --------------------------------------------------------

--
-- 資料表結構 `notification_log`
--

CREATE TABLE `notification_log` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `notify_type` varchar(20) NOT NULL COMMENT 'scholarship 或 early_warning',
  `ref_key` varchar(50) NOT NULL COMMENT '獎學金 id，或 early_warning 的 "等級:學期"',
  `recipient_role` varchar(10) NOT NULL COMMENT 'student 或 parent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `notification_log`
--

INSERT INTO `notification_log` (`id`, `student_id`, `notify_type`, `ref_key`, `recipient_role`, `sent_at`) VALUES
(1, 'S112001', 'scholarship', '7', 'student', '2026-10-14 07:41:55'),
(2, 'S112001', 'scholarship', '7', 'parent', '2026-10-14 07:41:55'),
(3, 'S112001', 'early_warning', 'critical:112-2', 'student', '2026-10-14 07:41:55'),
(4, 'S112001', 'early_warning', 'critical:112-2', 'parent', '2026-10-14 07:41:55'),
(5, 'S112002', 'scholarship', '1', 'student', '2026-10-14 07:41:55'),
(6, 'S112002', 'scholarship', '10', 'student', '2026-10-14 07:41:55'),
(7, 'S112003', 'scholarship', '7', 'student', '2026-10-14 07:41:55'),
(8, 'S112003', 'scholarship', '3', 'student', '2026-10-14 07:41:55'),
(9, 'S112004', 'scholarship', '1', 'student', '2026-10-14 07:41:55'),
(10, 'S112004', 'scholarship', '10', 'student', '2026-10-14 07:41:55'),
(11, 'S112005', 'scholarship', '7', 'student', '2026-10-14 07:41:55'),
(12, 'S112005', 'early_warning', 'critical:113-1', 'student', '2026-10-14 07:41:56');

-- --------------------------------------------------------

--
-- 資料表結構 `online_applications`
--

CREATE TABLE `online_applications` (
  `id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `item_id` int(11) NOT NULL COMMENT '對應 checklist_items.item_id',
  `form_code` varchar(60) DEFAULT NULL COMMENT '表單範本代碼，例如 course_withdraw_form',
  `business_name` varchar(200) NOT NULL,
  `fields_json` text NOT NULL COMMENT '學生填的欄位',
  `stages_json` text NOT NULL COMMENT '關卡：送出 → 各簽核 → 完成',
  `current_stage` tinyint(4) NOT NULL DEFAULT 1 COMMENT '目前停在第幾關 (0 = 送出)',
  `status` enum('審核中','已完成','已退回','已撤回') NOT NULL DEFAULT '審核中',
  `history_json` text NOT NULL COMMENT '每一關誰、何時、核准或退回、意見',
  `submitted_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `report_download_logs`
--

CREATE TABLE `report_download_logs` (
  `id` int(11) NOT NULL,
  `file_id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `role` varchar(10) NOT NULL,
  `result` varchar(10) NOT NULL,
  `downloaded_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：下載稽核紀錄';

--
-- 傾印資料表的資料 `report_download_logs`
--

INSERT INTO `report_download_logs` (`id`, `file_id`, `username`, `student_id`, `role`, `result`, `downloaded_at`) VALUES
(1, 1, 'student1', 'S112001', '學生', 'success', '2026-10-22 11:27:58');

-- --------------------------------------------------------

--
-- 資料表結構 `report_favorites`
--

CREATE TABLE `report_favorites` (
  `id` int(11) NOT NULL,
  `file_id` int(11) NOT NULL,
  `user_key` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：收藏';

--
-- 傾印資料表的資料 `report_favorites`
--

INSERT INTO `report_favorites` (`id`, `file_id`, `user_key`, `username`, `student_id`, `created_at`) VALUES
(1, 1, 'S112001', 'student1', 'S112001', '2026-10-22 11:27:58');

-- --------------------------------------------------------

--
-- 資料表結構 `report_files`
--

CREATE TABLE `report_files` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(20) DEFAULT NULL,
  `allowed_roles` varchar(100) NOT NULL,
  `uploaded_by` varchar(50) NOT NULL,
  `uploaded_by_username` varchar(50) NOT NULL,
  `uploaded_at` datetime NOT NULL,
  `download_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：檔案';

--
-- 傾印資料表的資料 `report_files`
--

INSERT INTO `report_files` (`id`, `title`, `category`, `description`, `file_url`, `file_name`, `file_type`, `allowed_roles`, `uploaded_by`, `uploaded_by_username`, `uploaded_at`, `download_count`) VALUES
(1, 'live 測試檔', 'live測試', 'desc', '/uploads/report_20261022_112758_fa916c.pdf', 'demo.pdf', 'pdf', 'all', '周立威 (教務處職員)', 'staff1', '2026-10-22 11:27:58', 1);

-- --------------------------------------------------------

--
-- 資料表結構 `report_view_logs`
--

CREATE TABLE `report_view_logs` (
  `id` int(11) NOT NULL,
  `file_id` int(11) NOT NULL,
  `role` varchar(10) NOT NULL,
  `viewed_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：瀏覽紀錄 (不存帳號)';

-- --------------------------------------------------------

--
-- 資料表結構 `room_bookings`
--

CREATE TABLE `room_bookings` (
  `id` int(11) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `room_name` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `period_start` int(11) NOT NULL,
  `period_end` int(11) NOT NULL,
  `purpose` varchar(80) NOT NULL,
  `people` int(11) NOT NULL DEFAULT 1,
  `applicant` varchar(50) NOT NULL,
  `applicant_key` varchar(100) DEFAULT NULL,
  `contact` varchar(60) DEFAULT NULL,
  `status` varchar(10) NOT NULL DEFAULT '審核中',
  `managed_by` varchar(50) DEFAULT NULL,
  `review_note` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教室租借';

--
-- 傾印資料表的資料 `room_bookings`
--

INSERT INTO `room_bookings` (`id`, `room_id`, `room_name`, `date`, `period_start`, `period_end`, `purpose`, `people`, `applicant`, `applicant_key`, `contact`, `status`, `managed_by`, `review_note`, `created_at`) VALUES
(1, 'D201', '資圖 D201 討論室', '2026-10-29', 1, 1, 'live 測試', 2, '王小明', 'S112001', '', '已核准', '圖資中心', '', '2026-10-22 11:27:55');

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
-- 傾印資料表的資料 `scholarships`
--

INSERT INTO `scholarships` (`id`, `name`, `provider`, `amount`, `deadline`, `apply_url`, `announcement_url`, `description`, `min_grade`, `max_grade`, `departments`, `min_gpa`, `min_conduct`, `identity_required`, `no_fail_required`) VALUES
(1, '書卷獎（學業優異獎學金）', '校內', 5000, '2026-10-15', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '各班前學期學業成績優異者，依排名核發。', 2, 5, NULL, 3.50, 80.00, NULL, 1),
(2, '清寒助學金', '校內', 10000, '2026-09-28', 'https://ec2.ukn.edu.tw/WebRemit/login.aspx', 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '協助家境清寒學生安心就學，需檢附低收入戶或中低收入戶證明。', NULL, NULL, NULL, NULL, 70.00, '低收入戶,中低收入戶', 0),
(3, '原住民族學生獎助學金', '校外', 15000, '2026-10-31', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '原住民族委員會補助原住民族學生就學。', NULL, NULL, NULL, 2.50, NULL, '原住民', 0),
(4, '身心障礙學生獎助學金', '校外', 12000, '2026-11-15', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '教育部補助持有身心障礙證明之學生。', NULL, NULL, NULL, NULL, NULL, '身心障礙', 0),
(5, '資訊管理科專題研究獎學金', '校內', 8000, '2026-10-05', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '鼓勵高年級學生投入專題研究，需檢附專題計畫書。', 3, 5, 'CS', 3.00, NULL, NULL, 0),
(6, '產學合作企業獎學金', '校外', 20000, '2026-09-30', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '產學合作企業提供資訊管理科學生申請，錄取者可優先參加企業實習。', 1, 5, 'CS', 3.30, 85.00, NULL, 1),
(7, '弱勢學生助學金', '校外', 8000, '2026-10-20', 'https://ec2.ukn.edu.tw/WebRemit/login.aspx', 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '教育部大專校院弱勢學生助學計畫，符合任一身分即可申請。', NULL, NULL, NULL, NULL, NULL, '低收入戶,中低收入戶,原住民,身心障礙', 0),
(8, '護理科實習獎學金', '校內', 5000, '2026-10-10', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '補助護理科學生臨床實習期間交通與生活支出。', 2, 5, 'NUR', NULL, 80.00, NULL, 0),
(9, '學海飛颺（出國研修）', '校外', 50000, '2026-09-15', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '教育部補助學生赴國外研修一學期。', 2, 5, NULL, 3.00, NULL, NULL, 0),
(10, '品德楷模獎學金', '校內', 3000, '2026-11-30', NULL, 'https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw', '表揚操行表現優良、熱心服務的學生。', NULL, NULL, NULL, 3.00, 88.00, NULL, 1);

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
-- 傾印資料表的資料 `search_feedback`
--

INSERT INTO `search_feedback` (`feedback_id`, `kb_id`, `query_text`, `is_helpful`, `comment`, `created_at`) VALUES
(1, 1, '棄修', 1, '流程很清楚，知道要去課務組了！', '2026-10-05 03:54:00'),
(2, 4, '擋修', 1, '終於知道為什麼不能選資料結構了', '2026-10-05 03:54:00'),
(3, 3, '英文抵免', 1, '感謝提供多益 550 分門檻資訊', '2026-10-05 03:54:00'),
(4, 2, '病假', 0, '希望能直接線上送假單，不想跑流程', '2026-10-05 03:54:00');

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
-- 傾印資料表的資料 `search_logs`
--

INSERT INTO `search_logs` (`id`, `query`, `matched`, `created_at`) VALUES
(1, '棄修', 1, '2026-10-05 03:54:24'),
(2, '棄修', 1, '2026-10-05 04:05:01'),
(3, '停修', 1, '2026-10-08 03:46:18');

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
-- 傾印資料表的資料 `students`
--

INSERT INTO `students` (`student_id`, `full_name`, `dept_id`, `admission_year`, `class_name`, `parent_phone`, `grade_level`, `gpa`, `conduct_score`, `identity_type`) VALUES
('S112001', '王小明', 'CS', 112, '資管四忠', '0912-345-678', 4, 3.35, 86.00, '中低收入戶'),
('S112002', '李美華', 'CS', 112, '資管四忠', '0922-333-444', 4, 3.62, 88.00, NULL),
('S112003', '張建華', 'NUR', 112, '護理四忠', '0933-555-666', 4, 3.10, 85.00, '原住民'),
('S112004', '陳冠宇', 'CS', 112, '資管四孝', '0955-222-111', 4, 3.85, 90.00, NULL),
('S112005', '林雨潔', 'CS', 112, '資管四忠', '0966-777-888', 4, 3.20, 86.00, '低收入戶');

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
-- 傾印資料表的資料 `student_credits`
--

INSERT INTO `student_credits` (`credit_id`, `student_id`, `course_id`, `semester`, `score`, `is_passed`) VALUES
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
(20, 'S112005', 'GE101', '112-1', 88.00, 1);

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
-- 傾印資料表的資料 `student_privacy_settings`
--

INSERT INTO `student_privacy_settings` (`setting_id`, `student_id`, `parent_alert_consent`, `advisor_alert_consent`, `updated_at`) VALUES
(1, 'S112001', 1, 1, '2026-10-05 03:54:00'),
(2, 'S112002', 0, 1, '2026-10-05 03:54:00'),
(3, 'S112004', 1, 1, '2026-10-05 03:54:00');

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
-- 傾印資料表的資料 `synonym_dictionary`
--

INSERT INTO `synonym_dictionary` (`synonym_id`, `category_id`, `user_keyword`, `official_term`) VALUES
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
(14, 1, '暑修', '暑期開班授課規定');

-- --------------------------------------------------------

--
-- 資料表結構 `teacher_directory`
--

CREATE TABLE `teacher_directory` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `dept` varchar(100) DEFAULT NULL COMMENT '所屬科系',
  `unit` varchar(100) DEFAULT NULL COMMENT '服務單位',
  `office` varchar(20) DEFAULT NULL,
  `building` varchar(10) DEFAULT NULL,
  `floor` int(11) DEFAULT NULL,
  `ext` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `office_hours` text DEFAULT NULL COMMENT 'JSON：[{weekday,start,end}]',
  `photo_url` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(10) NOT NULL DEFAULT '待審核' COMMENT '已核准 / 待審核 / 退回',
  `pending_action` varchar(10) DEFAULT NULL,
  `pending_data` text DEFAULT NULL,
  `submitted_by` varchar(50) DEFAULT NULL,
  `review_note` varchar(200) DEFAULT NULL,
  `reviewed_by` varchar(50) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='老師辦公室名錄';

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
-- 傾印資料表的資料 `unmatched_queries`
--

INSERT INTO `unmatched_queries` (`query_id`, `query_text`, `search_count`, `status`, `resolved_term`, `first_searched_at`, `last_searched_at`) VALUES
(1, '退費手續', 14, '待處理', NULL, '2026-10-05 03:54:00', '2026-10-05 03:54:00'),
(2, '兵役緩徵', 9, '待處理', NULL, '2026-10-05 03:54:00', '2026-10-05 03:54:00'),
(3, '宿舍門禁時間', 18, '待處理', NULL, '2026-10-05 03:54:00', '2026-10-05 03:54:00'),
(4, '機車通行證申請', 22, '待處理', NULL, '2026-10-05 03:54:00', '2026-10-05 03:54:00'),
(5, '轉系規定', 7, '待處理', NULL, '2026-10-05 03:54:00', '2026-10-05 03:54:00');

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('學生','家長','教職員','老師','管理員','系統管理員','內容管理人員','處室承辦','科助','住宿管理員','訪客') NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `full_name` varchar(50) NOT NULL,
  `advised_class` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `can_manage_dorm` tinyint(1) NOT NULL DEFAULT 0,
  `office` varchar(100) NOT NULL DEFAULT '',
  `permissions` varchar(255) NOT NULL DEFAULT '查看,建立,修改',
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `role`, `student_id`, `full_name`, `advised_class`, `created_at`, `can_manage_dorm`, `office`, `permissions`, `is_active`) VALUES
(1, 'student1', 'scrypt:32768:8:1$0PoTz5suhXkSrISn$d3b3204fb3df2627c5025b07d0bff81b8afec259f9ef64424e1c0ca03e1920080c2327e0399f8379f135b69b0842022028a81b49873787da9f7f0366b163a59f', '學生', 'S112001', '王小明', NULL, '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(2, 'student2', 'scrypt:32768:8:1$0PoTz5suhXkSrISn$d3b3204fb3df2627c5025b07d0bff81b8afec259f9ef64424e1c0ca03e1920080c2327e0399f8379f135b69b0842022028a81b49873787da9f7f0366b163a59f', '學生', 'S112002', '李美華', NULL, '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(3, 'parent1', 'scrypt:32768:8:1$0PoTz5suhXkSrISn$d3b3204fb3df2627c5025b07d0bff81b8afec259f9ef64424e1c0ca03e1920080c2327e0399f8379f135b69b0842022028a81b49873787da9f7f0366b163a59f', '家長', 'S112001', '王大明 (小明家長)', NULL, '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(4, 'staff1', 'scrypt:32768:8:1$0PoTz5suhXkSrISn$d3b3204fb3df2627c5025b07d0bff81b8afec259f9ef64424e1c0ca03e1920080c2327e0399f8379f135b69b0842022028a81b49873787da9f7f0366b163a59f', '教職員', NULL, '周立威 (教務處職員)', NULL, '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(5, 'admin', 'scrypt:32768:8:1$gDeUAWdq3GDN2jLa$d6df71da6fab425d1726bb0606344e6391e5d757e7e56a33581e9e7d95444eb6e00b6180ea59ccf73512828dc9ed257b79bc14943d4e08a2fc737db5b1975409', '管理員', NULL, '系統超級管理員', NULL, '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(6, 'teacher1', 'scrypt:32768:8:1$0PoTz5suhXkSrISn$d3b3204fb3df2627c5025b07d0bff81b8afec259f9ef64424e1c0ca03e1920080c2327e0399f8379f135b69b0842022028a81b49873787da9f7f0366b163a59f', '老師', NULL, '陳雅婷 老師', '資管四忠', '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(7, 'S112004', 'scrypt:32768:8:1$0PoTz5suhXkSrISn$d3b3204fb3df2627c5025b07d0bff81b8afec259f9ef64424e1c0ca03e1920080c2327e0399f8379f135b69b0842022028a81b49873787da9f7f0366b163a59f', '學生', 'S112004', '陳冠宇', NULL, '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(8, 'S112005', 'scrypt:32768:8:1$0PoTz5suhXkSrISn$d3b3204fb3df2627c5025b07d0bff81b8afec259f9ef64424e1c0ca03e1920080c2327e0399f8379f135b69b0842022028a81b49873787da9f7f0366b163a59f', '學生', 'S112005', '林雨潔', NULL, '2026-10-05 03:54:00', 0, '', '查看,建立,修改', 1),
(9, 'parent2', 'scrypt:32768:8:1$wNv8FGue9kp3I4hH$0fcc83605082bdec63ce2ea5248788c8edf81e6f762a998bbc9c3ea029dca175b97338c7c8c3a4aa85e4b63fbec3c9d13d3e89c2bba08d6b0dc952dacce09ff6', '家長', 'S112002', '李建國 (美華家長)', NULL, '2026-10-14 07:39:45', 0, '', '查看,建立,修改', 1);

-- --------------------------------------------------------

--
-- 資料表結構 `user_preferences`
--

CREATE TABLE `user_preferences` (
  `username` varchar(50) NOT NULL,
  `dept_id` varchar(20) DEFAULT NULL,
  `content_scope` enum('all','mine') NOT NULL DEFAULT 'all' COMMENT 'mine = 只看全校公開與本科資訊',
  `pinned_features` varchar(500) DEFAULT NULL,
  `tour_seen` tinyint(1) NOT NULL DEFAULT 0,
  `favorite_forms` varchar(500) DEFAULT NULL COMMENT '常用表單代碼，逗號分隔',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `user_preferences`
--

INSERT INTO `user_preferences` (`username`, `dept_id`, `content_scope`, `pinned_features`, `tour_seen`, `favorite_forms`, `updated_at`) VALUES
('admin', NULL, 'all', '', 1, NULL, '2026-10-29 02:14:49'),
('dorm_demo', 'CS', 'all', '', 1, NULL, '2026-10-28 13:06:36'),
('parent1', NULL, 'all', '', 1, NULL, '2026-11-04 05:35:14'),
('S112004', NULL, 'all', NULL, 1, NULL, '2026-10-29 02:58:18'),
('S112005', NULL, 'all', NULL, 1, NULL, '2026-11-04 05:34:53'),
('student1', NULL, 'all', 'calendar,course-plan,warning,my-schedule', 1, NULL, '2026-11-04 05:15:43'),
('student2', NULL, 'all', NULL, 0, NULL, '2026-10-28 12:53:02'),
('teacher1', NULL, 'all', '', 1, NULL, '2026-10-29 02:15:30');

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
  `ip_address` varchar(50) DEFAULT '127.0.0.1',
  `visitor_type` varchar(20) NOT NULL DEFAULT '未來學生' COMMENT '未來學生 或 未來家長'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `visitor_logs`
--

INSERT INTO `visitor_logs` (`log_id`, `visitor_name`, `phone`, `school_from`, `purpose`, `target_dept`, `visited_at`, `ip_address`, `visitor_type`) VALUES
(1, '陳太太', '0911222333', '康寧國小', '參觀校園', '護理科（五專）', '2026-10-14 07:41:43', '127.0.0.1', '未來家長'),
(2, '小明', '0922333444', '大安高工', '了解資管科', '資訊管理科（五專）', '2026-10-14 07:45:35', '127.0.0.1', '未來學生'),
(3, '測試訪客', '0911000111', '測試高中', '了解科系', '資訊管理科（五專）', '2026-10-14 09:54:30', '127.0.0.1', '未來學生'),
(4, '測試訪客2', '0911000222', '測試高中', '了解科系', '資訊管理科（五專）', '2026-10-14 09:55:01', '127.0.0.1', '未來學生');

-- --------------------------------------------------------

--
-- 資料表結構 `visit_bookings`
--

CREATE TABLE `visit_bookings` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `slot` varchar(30) NOT NULL,
  `party_size` int(11) NOT NULL DEFAULT 1,
  `contact_name` varchar(50) NOT NULL,
  `contact_phone` varchar(30) NOT NULL,
  `note` varchar(300) DEFAULT NULL,
  `booked_by_key` varchar(100) DEFAULT NULL,
  `booked_by_role` varchar(10) DEFAULT NULL,
  `status` varchar(10) NOT NULL DEFAULT '待確認',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校園參觀預約';

--
-- 傾印資料表的資料 `visit_bookings`
--

INSERT INTO `visit_bookings` (`id`, `date`, `slot`, `party_size`, `contact_name`, `contact_phone`, `note`, `booked_by_key`, `booked_by_role`, `status`, `created_at`) VALUES
(1, '2026-10-29', '上午 09:30-11:00', 2, '王小明', '0911000111', '', 'S112001', '學生', '已確認', '2026-10-22 11:27:55');

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
-- 資料表索引 `advisor_messages`
--
ALTER TABLE `advisor_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_am_student` (`student_id`),
  ADD KEY `idx_am_class` (`class_name`);

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
-- 資料表索引 `conduct_evaluations`
--
ALTER TABLE `conduct_evaluations`
  ADD PRIMARY KEY (`student_id`,`semester`);

--
-- 資料表索引 `conduct_records`
--
ALTER TABLE `conduct_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conduct_student` (`student_id`,`semester`);

--
-- 資料表索引 `conduct_settings`
--
ALTER TABLE `conduct_settings`
  ADD PRIMARY KEY (`id`);

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
-- 資料表索引 `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_checkin_code` (`checkin_code`),
  ADD KEY `idx_event_status` (`event_id`,`status`);

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
-- 資料表索引 `lockers`
--
ALTER TABLE `lockers`
  ADD PRIMARY KEY (`locker_id`);

--
-- 資料表索引 `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_invite_code` (`invite_code`),
  ADD KEY `idx_start` (`start_at`);

--
-- 資料表索引 `meeting_members`
--
ALTER TABLE `meeting_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_meeting_member` (`meeting_id`,`member_key`),
  ADD KEY `idx_member` (`member_key`);

--
-- 資料表索引 `moodle_links`
--
ALTER TABLE `moodle_links`
  ADD PRIMARY KEY (`student_id`);

--
-- 資料表索引 `notification_log`
--
ALTER TABLE `notification_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_notify` (`student_id`,`notify_type`,`ref_key`,`recipient_role`);

--
-- 資料表索引 `online_applications`
--
ALTER TABLE `online_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_app_student` (`student_id`,`submitted_at`),
  ADD KEY `idx_app_status` (`status`,`current_stage`);

--
-- 資料表索引 `report_download_logs`
--
ALTER TABLE `report_download_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rdl_file` (`file_id`);

--
-- 資料表索引 `report_favorites`
--
ALTER TABLE `report_favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_file_user` (`file_id`,`user_key`);

--
-- 資料表索引 `report_files`
--
ALTER TABLE `report_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`);

--
-- 資料表索引 `report_view_logs`
--
ALTER TABLE `report_view_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rvl_file` (`file_id`);

--
-- 資料表索引 `room_bookings`
--
ALTER TABLE `room_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_room_date` (`room_id`,`date`);

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
-- 資料表索引 `teacher_directory`
--
ALTER TABLE `teacher_directory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

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
-- 資料表索引 `visit_bookings`
--
ALTER TABLE `visit_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_date_slot` (`date`,`slot`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `academic_calendar`
--
ALTER TABLE `academic_calendar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `advisor_messages`
--
ALTER TABLE `advisor_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `anniversary_events`
--
ALTER TABLE `anniversary_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `anniversary_wishes`
--
ALTER TABLE `anniversary_wishes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `certificates`
--
ALTER TABLE `certificates`
  MODIFY `cert_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `checklist_items`
--
ALTER TABLE `checklist_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `class_notices`
--
ALTER TABLE `class_notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `class_schedule`
--
ALTER TABLE `class_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `conduct_records`
--
ALTER TABLE `conduct_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `counseling_records`
--
ALTER TABLE `counseling_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `deadlines`
--
ALTER TABLE `deadlines`
  MODIFY `deadline_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `dorm_applications`
--
ALTER TABLE `dorm_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `graduation_requirements`
--
ALTER TABLE `graduation_requirements`
  MODIFY `req_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `knowledge_base`
--
ALTER TABLE `knowledge_base`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `knowledge_categories`
--
ALTER TABLE `knowledge_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `meeting_members`
--
ALTER TABLE `meeting_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `notification_log`
--
ALTER TABLE `notification_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `online_applications`
--
ALTER TABLE `online_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `report_download_logs`
--
ALTER TABLE `report_download_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `report_favorites`
--
ALTER TABLE `report_favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `report_files`
--
ALTER TABLE `report_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `report_view_logs`
--
ALTER TABLE `report_view_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `room_bookings`
--
ALTER TABLE `room_bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `scholarships`
--
ALTER TABLE `scholarships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `search_feedback`
--
ALTER TABLE `search_feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `search_logs`
--
ALTER TABLE `search_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `self_reviews`
--
ALTER TABLE `self_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `student_credits`
--
ALTER TABLE `student_credits`
  MODIFY `credit_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `student_privacy_settings`
--
ALTER TABLE `student_privacy_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `student_records`
--
ALTER TABLE `student_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `synonym_dictionary`
--
ALTER TABLE `synonym_dictionary`
  MODIFY `synonym_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `teacher_directory`
--
ALTER TABLE `teacher_directory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `unmatched_queries`
--
ALTER TABLE `unmatched_queries`
  MODIFY `query_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `visitor_logs`
--
ALTER TABLE `visitor_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `visit_bookings`
--
ALTER TABLE `visit_bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- 資料表的限制式 `conduct_evaluations`
--
ALTER TABLE `conduct_evaluations`
  ADD CONSTRAINT `fk_conduct_eval_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `conduct_records`
--
ALTER TABLE `conduct_records`
  ADD CONSTRAINT `fk_conduct_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

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
-- 資料表的限制式 `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

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
-- 資料表的限制式 `meeting_members`
--
ALTER TABLE `meeting_members`
  ADD CONSTRAINT `fk_meeting_member` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `moodle_links`
--
ALTER TABLE `moodle_links`
  ADD CONSTRAINT `fk_moodle_links_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `notification_log`
--
ALTER TABLE `notification_log`
  ADD CONSTRAINT `fk_notify_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `online_applications`
--
ALTER TABLE `online_applications`
  ADD CONSTRAINT `fk_app_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
