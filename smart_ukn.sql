-- ========================================================
-- Smart UKN 康寧大學智慧校園服務平台 - 資料庫 3NF 正規化 Schema
-- 版本: v3.0 旗艦正規化版 (符合 1NF, 2NF, 3NF 及完整外鍵約束)
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+08:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫: `smart_ukn`
--
CREATE DATABASE IF NOT EXISTS `smart_ukn` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smart_ukn`;

-- --------------------------------------------------------
-- 移除廢棄系統資料表 (論壇、告白牆、遊戲積點) 與現有表重建準備
-- --------------------------------------------------------
DROP TABLE IF EXISTS `forum_posts`;
DROP TABLE IF EXISTS `confession_wall`;
DROP TABLE IF EXISTS `game_points`;

DROP TABLE IF EXISTS `scholarship_conditions`;
DROP TABLE IF EXISTS `counseling_records`;
DROP TABLE IF EXISTS `class_notice_recipients`;
DROP TABLE IF EXISTS `class_notices`;
DROP TABLE IF EXISTS `class_group_members`;
DROP TABLE IF EXISTS `class_groups`;
DROP TABLE IF EXISTS `deadlines`;
DROP TABLE IF EXISTS `friction_reports`;
DROP TABLE IF EXISTS `visitor_logs`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `checklist_items`;
DROP TABLE IF EXISTS `synonym_dictionary`;
DROP TABLE IF EXISTS `knowledge_base`;
DROP TABLE IF EXISTS `knowledge_categories`;
DROP TABLE IF EXISTS `competitions`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `student_credits`;
DROP TABLE IF EXISTS `course_map`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `departments`;

-- --------------------------------------------------------
-- 1. 系所單位資料表 `departments`
-- --------------------------------------------------------
CREATE TABLE `departments` (
  `dept_id` varchar(20) NOT NULL COMMENT '系所代碼 (PK)',
  `dept_name` varchar(100) NOT NULL COMMENT '系所全名',
  `college_name` varchar(100) NOT NULL COMMENT '所屬學院',
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系所與學院主檔';

INSERT INTO `departments` (`dept_id`, `dept_name`, `college_name`) VALUES
('LTC', '長期照護學系', '護理健康學院'),
('ECE', '嬰幼兒保育學系', '護理健康學院'),
('NUR', '護理科（五專）', '護理健康學院'),
('OPT', '視光科（五專）', '護理健康學院'),
('BA', '企業管理學系（科）', '商業資訊學院'),
('CS', '資訊管理科（五專）', '商業資訊學院'),
('ANI', '數位影視動畫科（五專）', '商業資訊學院'),
('ENG', '應用外語科（五專）', '商業資訊學院');

-- --------------------------------------------------------
-- 2. 學生基本資料表 `students` (符合 3NF: 不存可推導的年齡，僅存學籍核心欄位)
-- --------------------------------------------------------
CREATE TABLE `students` (
  `student_id` varchar(20) NOT NULL COMMENT '學號 (PK)',
  `full_name` varchar(50) NOT NULL COMMENT '學生姓名',
  `dept_id` varchar(20) NOT NULL COMMENT '所屬系所 (FK)',
  `admission_year` int(11) NOT NULL COMMENT '入學學年度',
  `class_name` varchar(50) NOT NULL COMMENT '班級名稱',
  `parent_phone` varchar(30) DEFAULT NULL COMMENT '家長聯絡電話',
  PRIMARY KEY (`student_id`),
  KEY `fk_students_dept` (`dept_id`),
  CONSTRAINT `fk_students_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='學生學籍基本資料檔';

INSERT INTO `students` (`student_id`, `full_name`, `dept_id`, `admission_year`, `class_name`, `parent_phone`) VALUES
('S112001', '王小明', 'CS', 112, '資管五忠', '0912-345-678'),
('S112002', '李美華', 'CS', 112, '資管五忠', '0922-333-444'),
('S112003', '張建華', 'NUR', 112, '護理四忠', '0933-555-666'),
('S112004', '陳冠宇', 'CS', 112, '資管四孝', '0955-222-111'),
('S112005', '林雨潔', 'CS', 112, '資管五忠', '0966-777-888');

-- --------------------------------------------------------
-- 3. 系統使用者與登入帳號資料表 `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `can_manage_dorm` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '使用者唯一識別碼 (PK)',
  `username` varchar(50) NOT NULL COMMENT '登入帳號',
  `password_hash` varchar(255) NOT NULL COMMENT '密碼雜湊或測試明碼',
  `role` enum('學生','家長','教職員','老師','管理員','訪客') NOT NULL COMMENT '系統角色',
  `student_id` varchar(20) DEFAULT NULL COMMENT '綁定學號 (FK, 學生或家長關聯用)',
  `full_name` varchar(50) NOT NULL COMMENT '使用者真實姓名/稱謂',
  `advised_class` varchar(50) DEFAULT NULL COMMENT '導師制：該教師擔任導師的班級名稱 (僅老師角色適用)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '註冊/建立時間',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `fk_users_student` (`student_id`),
  CONSTRAINT `fk_users_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統使用者身分與權限表';

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `role`, `student_id`, `full_name`, `advised_class`) VALUES
(1, 'student1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '學生', 'S112001', '王小明', NULL),
(2, 'student2', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '學生', 'S112002', '李美華', NULL),
(3, 'parent1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '家長', 'S112001', '王大明 (小明家長)', NULL),
(4, 'staff1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '教職員', NULL, '周立威 (教務處職員)', NULL),
(5, 'admin', 'pbkdf2:sha256:1000000$2XQfvmmn75wVJUKc$59cac19325e7e89df728fdc0ee86208fc0ae12ab71fc630fbaa890f2f919d14c', '管理員', NULL, '系統超級管理員', NULL),
(6, 'teacher1', 'pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c', '老師', NULL, '彭賓鈺 老師', '資管五忠');

-- --------------------------------------------------------
-- 4. 課程地圖與先修關係表 `course_map`
-- --------------------------------------------------------
CREATE TABLE `course_map` (
  `semester_hours` decimal(8,2) DEFAULT NULL,
  `course_id` varchar(20) NOT NULL COMMENT '課程代碼 (PK)',
  `course_name` varchar(100) NOT NULL COMMENT '課程名稱',
  `credits` int(11) NOT NULL COMMENT '學分數',
  `prerequisite_id` varchar(20) DEFAULT NULL COMMENT '先修科目代碼 (FK 自關聯)',
  `is_required` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否為必修 (1=必修, 0=選修)',
  `dept_id` varchar(20) NOT NULL DEFAULT 'CS' COMMENT '開課系所 (FK)',
  `semester_suggest` varchar(20) DEFAULT '大一上' COMMENT '建議修習學期',
  `description` text DEFAULT NULL COMMENT '課程大綱簡介',
  PRIMARY KEY (`course_id`),
  KEY `fk_course_prereq` (`prerequisite_id`),
  KEY `fk_course_dept` (`dept_id`),
  CONSTRAINT `fk_course_prereq` FOREIGN KEY (`prerequisite_id`) REFERENCES `course_map` (`course_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='課程地圖與先修關係表';

INSERT INTO `course_map` (`course_id`, `course_name`, `credits`, `prerequisite_id`, `is_required`, `dept_id`, `semester_suggest`, `description`) VALUES
('CS101', '計算機概論', 3, NULL, 1, 'CS', '大一上', '計算機科學基礎、電腦架構、作業系統與網路概論。'),
('CS102', '程式設計(一)', 3, 'CS101', 1, 'CS', '大一下', 'Python 與 C 語言基礎邏輯、變數、迴圈與函式設計。'),
('CS201', '資料結構', 3, 'CS102', 1, 'CS', '大二上', '陣列、鏈結串列、堆疊、佇列、樹狀與圖形演算法。'),
('CS202', '物件導向程式設計', 3, 'CS102', 1, 'CS', '大二下', '類別、物件、繼承、多型與 Java/C++ 設計模式。'),
('CS301', '演算法分析', 3, 'CS201', 1, 'CS', '大三上', '時間複雜度、分治法、貪婪演算法、動態規劃。'),
('CS302', '資料庫系統概論', 3, 'CS201', 1, 'CS', '大三上', '關聯式資料庫、SQL 語法、正規化與 MySQL 實作。'),
('CS401', '畢業專題研討', 3, 'CS302', 1, 'CS', '大四上', '綜合資訊系統開發、AI 應用整合與專題展示。'),
('EN101', '基礎英文', 2, NULL, 1, 'CS', '大一上', '大一基礎外語聽說讀寫與學術閱讀。'),
('GE101', '大學之道與倫理', 2, NULL, 0, 'CS', '大一上', '校園生活適應、生命教育與職場倫理。');

-- --------------------------------------------------------
-- 5. 學生成績與學分紀錄表 `student_credits`
-- --------------------------------------------------------
CREATE TABLE `student_credits` (
  `credit_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '成績紀錄唯一碼 (PK)',
  `student_id` varchar(20) NOT NULL COMMENT '學號 (FK)',
  `course_id` varchar(20) NOT NULL COMMENT '課程代碼 (FK)',
  `semester` varchar(20) NOT NULL COMMENT '修課學期 (如 112-1)',
  `score` decimal(5,2) DEFAULT NULL COMMENT '成績分數',
  `is_passed` tinyint(1) NOT NULL COMMENT '是否通過 (1=通過, 0=未通過)',
  PRIMARY KEY (`credit_id`),
  KEY `fk_credits_student` (`student_id`),
  KEY `fk_credits_course` (`course_id`),
  CONSTRAINT `fk_credits_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_credits_course` FOREIGN KEY (`course_id`) REFERENCES `course_map` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='學生成績與學分紀錄表';

INSERT INTO `student_credits` (`credit_id`, `student_id`, `course_id`, `semester`, `score`, `is_passed`) VALUES
(1, 'S112001', 'CS101', '112-1', 85.00, 1),
(2, 'S112001', 'CS102', '112-2', 55.00, 0),
(3, 'S112001', 'EN101', '112-1', 78.00, 1),
(4, 'S112002', 'CS101', '112-1', 92.50, 1),
(5, 'S112002', 'CS102', '112-2', 88.00, 1),
(6, 'S112002', 'GE101', '112-1', 90.00, 1),
(7, 'S112004', 'CS101', '112-1', 88.00, 1),
(8, 'S112004', 'CS102', '112-2', 91.00, 1),
(9, 'S112004', 'CS201', '113-1', 84.00, 1),
(10, 'S112004', 'EN101', '112-1', 80.00, 1),
(11, 'S112005', 'CS101', '112-1', 76.00, 1);

-- --------------------------------------------------------
-- 5b. 學生證照與檢定成績表 `certificates`
-- --------------------------------------------------------
CREATE TABLE `certificates` (
  `cert_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '證照紀錄唯一碼 (PK)',
  `student_id` varchar(20) NOT NULL COMMENT '學號 (FK)',
  `cert_name` varchar(100) NOT NULL COMMENT '證照名稱',
  `issuing_org` varchar(100) NOT NULL DEFAULT '勞動部勞動力發展署技能檢定中心' COMMENT '發證單位',
  `cert_number` varchar(50) DEFAULT NULL COMMENT '證照字號 (選填)',
  `theory_score` decimal(5,2) DEFAULT NULL COMMENT '學科成績 (選填)',
  `practical_score` decimal(5,2) DEFAULT NULL COMMENT '術科成績 (選填)',
  `cert_status` varchar(50) DEFAULT '及格發證' COMMENT '檢定狀態',
  `verify_url` varchar(255) DEFAULT NULL COMMENT '官方查驗連結 (如勞動部)',
  `file_path` varchar(255) DEFAULT NULL COMMENT '證照/成績單檔案路徑 (PDF或圖片)',
  `file_name` varchar(255) DEFAULT NULL COMMENT '原始上傳檔名',
  `file_type` varchar(20) DEFAULT NULL COMMENT '檔案類型 (pdf 或 image)',
  `issue_date` date DEFAULT NULL COMMENT '取得日期',
  `kind` enum('證照','競賽','作品') NOT NULL DEFAULT '證照' COMMENT '學生上傳的類別',
  `review_status` enum('待審核','待複審','已通過','已退回') NOT NULL DEFAULT '已通過' COMMENT '證照經班導初審與行政複審後才列入畢業門檻',
  `advisor_reviewer` varchar(50) DEFAULT NULL,
  `advisor_note` varchar(200) DEFAULT NULL,
  `advisor_reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewer` varchar(50) DEFAULT NULL COMMENT '審核人',
  `review_note` varchar(200) DEFAULT NULL COMMENT '退回原因',
  `reviewed_at` timestamp NULL DEFAULT NULL COMMENT '審核時間',
  `award` varchar(60) DEFAULT NULL COMMENT '競賽名次',
  `description` varchar(500) DEFAULT NULL COMMENT '說明',
  `attachments` text DEFAULT NULL COMMENT '上傳的證書 / 獎狀檔案 (JSON 陣列)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '建立時間',
  PRIMARY KEY (`cert_id`),
  KEY `fk_cert_student` (`student_id`),
  CONSTRAINT `fk_cert_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='學生證照與檢定成績表';

INSERT INTO `certificates` (`cert_id`, `student_id`, `cert_name`, `issuing_org`, `cert_number`, `theory_score`, `practical_score`, `cert_status`, `verify_url`, `file_path`, `file_name`, `file_type`, `issue_date`, `created_at`) VALUES
(1, 'S112001', '丙級電腦硬體裝修技術士', '勞動部勞動力發展署技能檢定中心', '113-CS-004521', 82.00, 88.00, '及格發證', 'https://eservice.wdasec.gov.tw/WWW/C101Q', '/uploads/demo_mol_transcript.pdf', '勞動部技術士技能檢定成績單.pdf', 'pdf', '2026-06-20', '2026-06-25 10:00:00'),
(2, 'S112001', '乙級電腦軟體應用技術士', '勞動部勞動力發展署技能檢定中心', '114-CS-008912', 86.50, 92.00, '及格發證', 'https://eservice.wdasec.gov.tw/WWW/C101Q', '/uploads/demo_mol_cert.svg', '乙級技術士證書正本.svg', 'image', '2026-08-15', '2026-08-20 14:30:00'),
(3, 'S112002', 'TQC+ 網頁設計工程師', '財團法人中華民國電腦技能基金會', 'TQC-WD-22310', 78.00, 85.00, '及格發證', 'https://www.tqc.org.tw/', NULL, NULL, NULL, '2026-07-05', '2026-07-10 09:00:00'),
(4, 'S112004', '丙級電腦硬體裝修技術士', '勞動部勞動力發展署技能檢定中心', '113-CS-004588', 90.00, 86.00, '及格發證', 'https://eservice.wdasec.gov.tw/WWW/C101Q', NULL, NULL, NULL, '2026-06-20', '2026-06-25 10:00:00'),
(5, 'S112004', '乙級電腦軟體應用技術士', '勞動部勞動力發展署技能檢定中心', '114-CS-009010', 88.00, 90.00, '及格發證', 'https://eservice.wdasec.gov.tw/WWW/C101Q', NULL, NULL, NULL, '2026-08-15', '2026-08-20 14:30:00');

-- --------------------------------------------------------
-- 5c. 學生競賽得獎與榮譽獎狀表 `competitions`
-- --------------------------------------------------------
CREATE TABLE `competitions` (
  `comp_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '競賽紀錄唯一碼 (PK)',
  `student_id` varchar(20) NOT NULL COMMENT '學號 (FK)',
  `competition_name` varchar(150) NOT NULL COMMENT '比賽名稱',
  `award_title` varchar(100) NOT NULL COMMENT '獲獎獎項/名次',
  `organizer` varchar(100) DEFAULT '主辦單位' COMMENT '主辦單位',
  `project_name` varchar(150) DEFAULT NULL COMMENT '參賽作品/隊伍',
  `award_date` date NOT NULL COMMENT '得獎日期',
  `file_path` varchar(255) DEFAULT NULL COMMENT '獎狀/得獎照片檔案路徑',
  `file_name` varchar(255) DEFAULT NULL COMMENT '原始上傳檔名',
  `file_type` varchar(20) DEFAULT NULL COMMENT '檔案類型 (pdf 或 image)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '建立時間',
  PRIMARY KEY (`comp_id`),
  KEY `fk_comp_student` (`student_id`),
  CONSTRAINT `fk_comp_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='學生競賽獲獎表';

INSERT INTO `competitions` (`comp_id`, `student_id`, `competition_name`, `award_title`, `organizer`, `project_name`, `award_date`, `file_path`, `file_name`, `file_type`, `created_at`) VALUES
(1, 'S112001', '2026 全國大專校院智慧校園物聯網創新應用競賽', '第一名 (金獎)', '教育部資訊及科技教育司', 'Smart UKN 智慧校園導引與擋修診斷系統', '2026-05-18', '/uploads/demo_award_cert.pdf', '全國第一名獲獎獎狀.pdf', 'pdf', '2026-05-20 11:00:00');

-- --------------------------------------------------------
-- 6. 規章大分類資料表 `knowledge_categories`
-- --------------------------------------------------------
CREATE TABLE `knowledge_categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '分類代碼 (PK)',
  `category_name` varchar(50) NOT NULL COMMENT '大分類名稱',
  `icon` varchar(20) DEFAULT '📚' COMMENT '顯示圖示',
  `sort_order` int(11) DEFAULT 1 COMMENT '排序權重',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='規章與行政大分類表';

INSERT INTO `knowledge_categories` (`category_id`, `category_name`, `icon`, `sort_order`) VALUES
(1, '選課與學分業務', '📚', 1),
(2, '請假與出勤規定', '📝', 2),
(3, '學籍異動與退學', '🎓', 3),
(4, '校園生活與證件', '💳', 4),
(5, '招生科系與入學', '🏫', 5);

-- --------------------------------------------------------
-- 7. 校規法規知識庫 `knowledge_base`
-- --------------------------------------------------------
CREATE TABLE `knowledge_base` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '條文唯一碼 (PK)',
  `category_id` int(11) NOT NULL COMMENT '所屬大分類 (FK)',
  `subcategory` varchar(50) NOT NULL COMMENT '子項目類別',
  `keyword` varchar(255) NOT NULL COMMENT '檢索關鍵字',
  `official_term` varchar(255) DEFAULT '' COMMENT '官方標準規章名稱',
  `content` text NOT NULL COMMENT '條文內容詳解與解答',
  `doc_name` varchar(255) NOT NULL COMMENT '出處法規檔名',
  `page` int(11) DEFAULT 1 COMMENT '官方規章頁碼',
  `url` varchar(500) NOT NULL COMMENT '規章下載或公告連結',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '最後更新日期',
  PRIMARY KEY (`id`),
  KEY `fk_kb_category` (`category_id`),
  CONSTRAINT `fk_kb_category` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校規與行政問答知識庫';

INSERT INTO `knowledge_base` (`id`, `category_id`, `subcategory`, `keyword`, `official_term`, `content`, `doc_name`, `page`, `url`) VALUES
(1, 1, '停修/棄修手續', '棄修', '停修課程辦理規定', '學生於加退選截止後，因特殊原因無法繼續修習某門課程，得於學期第 10-12 週申請停修（每學期以 2 科為限）。停修課程仍須登記於歷年成績單，但成績欄註記「停修」，不計入該學期學分數計算，且停修後修習學分數不得低於該學期最低應修學分。', '康寧大學學生學則.pdf', 12, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
(2, 1, '外語能力抵免', '英文抵免', '語言證照抵免辦法', '凡通過全民英檢中高級、多益 (TOEIC) 550 分以上或同等國際英語檢定標準者，得於入學第一學期規定期限內，檢附成績單與證書正本向教務處註冊組申請抵免大一英文或通識外語學分。', '康寧大學抵免學分辦法.pdf', 5, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
(3, 2, '學生請假流程', '請假規定', '學生請假辦法', '學生因故不能出席課業活動，須於事前（事假）或事後 3 日內（病假）辦理請假。假別包含公假、事假、病假、喪假及生理假。病假須檢附三日內就醫證明，三天以上須經科主任簽核，均需透過學生教務系統線上完成申請。', '學生請假辦法.pdf', 3, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
(4, 2, '缺課與扣考規定', '曠課扣考', '學生出勤與扣考規定', '學生未經請假或請假未准而缺席者視為曠課。某一科目缺課（含請假及曠課）時數達該科目全學期授課總時數三分之一以上者，該科目不得參加期末考試（即扣考），學期成績以零分計算。', '康寧大學學生學則.pdf', 18, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
(5, 3, '學業二一退學', '二一退學', '學業退學規定', '學士班學生單一學期學業成績不及格科目之學分數，達該學期修習學分總數二分之一者，予以學業警示輔導；若累計達校規規定之學業成績二分之一不及格達兩次者，應予退學處分。', '康寧大學學生學則.pdf', 24, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
(6, 3, '獎懲與申訴', '獎懲辦法', '學生獎懲辦法', '學生之獎勵分為嘉獎、小功、大功；懲處分為申誡、小過、大過、留校察看及退學。學生對於學校所為之懲處認有違法或不當致損害其權益者，得於收到處分通知書之次日起十日內向學生申訴評議委員會提出申訴。', '學生獎懲辦法.pdf', 3, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
(7, 4, '學生證掛失補發', '補發學生證', '學生證遺失補發流程', '學生證遺失時，應即登入學生教務資訊系統辦理線上掛失，並至行政大樓自動繳費機繳納工本費（新台幣 150 元），攜帶繳費收據與身分證明文件至教務處註冊組辦理補發，約 3 個工作天即可領取新卡。', '學生證管理要點.pdf', 2, 'https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw'),
(8, 5, '新生入學與科系', '招生科系', '康寧大學招生科系導覽', '本校設有護理健康學院（長期照護學系、嬰幼兒保育學系、護理科（五專）、視光科（五專））與商業資訊學院（企業管理學系（科）、資訊管理科（五專）、數位影視動畫科（五專）、應用外語科（五專））。提供五專、四技、學士班及碩士班完整升學路徑，提供豐富企業實習與證照輔導資源。', '康寧大學招生簡章.pdf', 1, 'https://www.ukn.edu.tw');

-- --------------------------------------------------------
-- 8. 智慧同義詞字典 `synonym_dictionary`
-- --------------------------------------------------------
CREATE TABLE `synonym_dictionary` (
  `synonym_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '字典唯一碼 (PK)',
  `category_id` int(11) DEFAULT NULL COMMENT '對應分類 (FK)',
  `user_keyword` varchar(50) NOT NULL COMMENT '使用者俗稱/口語',
  `official_term` varchar(50) NOT NULL COMMENT '官方標準用語',
  PRIMARY KEY (`synonym_id`),
  KEY `fk_synonym_cat` (`category_id`),
  CONSTRAINT `fk_synonym_cat` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智慧同義詞字典';

INSERT INTO `synonym_dictionary` (`synonym_id`, `category_id`, `user_keyword`, `official_term`) VALUES
(1, 1, '棄修', '停修課程辦理規定'),
(2, 1, '退選', '停修課程辦理規定'),
(3, 1, '英文免修', '語言證照抵免辦法'),
(4, 1, '英檢抵免', '語言證照抵免辦法'),
(5, 1, '擋修', '先修科目規定'),
(6, 2, '請假', '學生請假辦法'),
(7, 2, '病假怎麼請', '學生請假辦法'),
(8, 2, '缺課', '學生出勤與扣考規定'),
(9, 3, '二一', '學業退學規定'),
(10, 3, '被當掉', '學業退學規定'),
(11, 4, '補辦學生證', '學生證遺失補發流程'),
(12, 4, '卡片遺失', '學生證遺失補發流程');

-- --------------------------------------------------------
-- 9. 行政流程指引清單 `checklist_items`
-- --------------------------------------------------------
CREATE TABLE `checklist_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '清單唯一碼 (PK)',
  `category_id` int(11) DEFAULT NULL COMMENT '所屬分類 (FK)',
  `category_name` varchar(50) NOT NULL DEFAULT '課務組' COMMENT '辦理單位',
  `business_name` varchar(100) NOT NULL COMMENT '行政業務名稱',
  `steps_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '辦理步驟 (JSON 陣列格式)' CHECK (json_valid(`steps_json`)),
  `required_docs` text DEFAULT NULL COMMENT '應備文件說明',
  `office_hours` varchar(100) DEFAULT NULL COMMENT '辦公服務時間',
  `contact_phone` varchar(50) DEFAULT '02-2632-1181 分機 310' COMMENT '處室聯絡分機',
  `audience` varchar(20) NOT NULL DEFAULT '學生' COMMENT '適用對象 (學生/老師)',
  PRIMARY KEY (`item_id`),
  KEY `fk_chk_cat` (`category_id`),
  CONSTRAINT `fk_chk_cat` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行政流程指引清單';

INSERT INTO `checklist_items` (`item_id`, `category_id`, `category_name`, `business_name`, `steps_json`, `required_docs`, `office_hours`, `contact_phone`, `audience`) VALUES
(1, 1, '課務組', '學生課程停修（棄修）申請', '[\"1. 登入學生教務系統填寫停修申請表\", \"2. 列印紙本申請單經授課教師簽名同意\", \"3. 送班級導師及科主任核章\", \"4. 於學期第12週截止日前送教務處課務組審查\"]', '停修申請表（須授課教師簽章）、學生證正本', '週一至週五 08:30 - 17:00', '02-2632-1181 分機 312 (課務組)', '學生'),
(2, 4, '註冊組', '學生證遺失補發申請', '[\"1. 登入教務系統辦理線上卡片掛失\", \"2. 至行政大樓自動繳費機繳交補發工本費 150 元\", \"3. 持繳費收據及身分證明文件至註冊組辦理\", \"4. 3 個工作天後憑收據至註冊組領取新學生證\"]', '身分證或健保卡正本、工本費收據、2吋大頭照電子檔', '週一至週五 09:00 - 16:30', '02-2632-1181 分機 310 (註冊組)', '學生'),
(3, 1, '註冊組', '外語證照 / 學分抵免申請', '[\"1. 確認自身符合抵免資格（多益550分以上或全民英檢中高級）\", \"2. 備妥成績單或證書正本與影本\", \"3. 填寫學分抵免申請表並由所屬科辦初審\", \"4. 開學兩週內送交教務處註冊組複審核定\"]', '語言檢定證書正影本、歷年成績單、抵免申請表', '開學前兩週內 08:30 - 17:00', '02-2632-1181 分機 310 (註冊組)', '學生'),
(4, 2, '學務處', '學生病假與公假線上請假流程', '[\"1. 事假須事前於線上請假系統提出申請\", \"2. 病假須於返校 3 日內登入系統補辦並上傳就醫證明\", \"3. 公假須檢附公函或主辦單位指派公文證明\", \"4. 經導師及系輔導人員線上審核通過即生效\"]', '三日內診斷證明或收據電子檔（病假）、派遣公文（公假）', '線上系統 24 小時開放受理', '02-2632-1181 分機 410 (生輔組)', '學生'),
(5, 1, '課務組', '不及格科目重補修申請', '[\"1. 查詢下學期開課時間表，確認該科目是否開班\", \"2. 於加退選期間至教務系統重新選修該科目（重補修）\", \"3. 若該科目已停開，須洽科辦辦理替代科目認定\", \"4. 選修科目亦可改選其他同學分選修科目以取代學分\"]', '無需另外書面文件；逾加退選期限則需填寫替代科目認定表', '加退選期間依教務處公告時間；平時洽詢 週一至週五 08:30 - 17:00', '02-2632-1181 分機 312 (課務組)', '學生'),
(6, 1, '課務組', '教師調（代）課申請', '[\"1. 登入教師端系統線上填寫調（代）課申請表\", \"2. 敘明異動原因、代課教師與異動堂數\", \"3. 經科主任核章後送教務處課務組備查\", \"4. 至遲於異動日前 3 天完成申請，調代課完成後於系統登錄異動紀錄\"]', '調（代）課申請表（科主任簽核）', '週一至週五 08:30 - 17:00', '02-2632-1181 分機 312 (課務組)', '老師'),
(7, 1, '註冊組', '學生成績登錄與更正申請', '[\"1. 學期成績需於規定期限內至教師成績登錄系統輸入\", \"2. 如需更正已送出之成績，填寫成績更正申請單並經科主任核章\", \"3. 送註冊組於次學期開始前完成更正\", \"4. 更正後成績將重新產出正式成績單\"]', '成績更正申請單（科主任簽章）', '週一至週五 09:00 - 16:30', '02-2632-1181 分機 310 (註冊組)', '老師'),
(8, 2, '學務處', '導師班務通報與期中期末座談', '[\"1. 每學期至少安排一次班會或個別晤談\", \"2. 將學生出缺勤、獎懲及輔導紀錄填寫於導師手冊系統\", \"3. 期中預警名單公告後，需於輔導期內完成受輔導學生之面談紀錄\", \"4. 學期末提交班級輔導總結報告\"]', '導師輔導紀錄表', '線上系統 24 小時開放受理', '02-2632-1181 分機 410 (生輔組)', '老師');

-- --------------------------------------------------------
-- 9b. 修改紀錄表 `audit_logs`
-- --------------------------------------------------------
CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '紀錄唯一碼 (PK)',
  `table_name` varchar(50) NOT NULL COMMENT '被異動的資料表名稱',
  `record_id` varchar(50) NOT NULL COMMENT '被異動的資料主鍵',
  `action` varchar(20) NOT NULL COMMENT '新增/修改/刪除',
  `changed_by` varchar(50) NOT NULL COMMENT '操作者姓名/帳號',
  `changed_by_role` varchar(20) DEFAULT NULL COMMENT '操作者身分',
  `ip_address` varchar(45) DEFAULT NULL COMMENT '操作者電腦 IP',
  `before_json` longtext DEFAULT NULL COMMENT '修改前內容 (JSON)',
  `after_json` longtext DEFAULT NULL COMMENT '修改後內容 (JSON)',
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '異動時間',
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_table_record` (`table_name`, `record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CMS 修改紀錄表';

-- --------------------------------------------------------
-- 10. 訪客/未來學生登記入校留痕表 `visitor_logs`
-- --------------------------------------------------------
CREATE TABLE `visitor_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '留痕紀錄唯一碼 (PK)',
  `visitor_name` varchar(50) NOT NULL COMMENT '訪客姓名/稱謂',
  `phone` varchar(30) NOT NULL COMMENT '訪客聯絡手機',
  `school_from` varchar(100) NOT NULL COMMENT '畢業國中/高中職學校',
  `purpose` varchar(100) NOT NULL COMMENT '來訪目的 (升學諮詢/校園參觀/洽公等)',
  `target_dept` varchar(100) DEFAULT '資訊管理科（五專）' COMMENT '有興趣了解之科系',
  `visited_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '登記來訪時間',
  `ip_address` varchar(50) DEFAULT '127.0.0.1' COMMENT '來源 IP 位址',
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='訪客與未來學生入校留痕紀錄表';

INSERT INTO `visitor_logs` (`log_id`, `visitor_name`, `phone`, `school_from`, `purpose`, `target_dept`, `visited_at`, `ip_address`) VALUES
(1, '陳同學', '0912-888-999', '台北市立南港高中', '升學諮詢與科系探索', '資訊管理科（五專）', '2026-09-08 09:30:00', '127.0.0.1'),
(2, '林家長', '0922-111-222', '新北市立汐止國中', '五專免試入學諮詢', '護理科（五專）', '2026-09-08 10:15:00', '127.0.0.1'),
(3, '黃同學', '0933-777-666', '基隆市立安樂高中', '校園環境參觀', '資訊管理科（五專）', '2026-09-08 11:00:00', '127.0.0.1');

-- --------------------------------------------------------
-- 11. 校務服務斷點匿名回報表 `friction_reports`
-- --------------------------------------------------------
CREATE TABLE `friction_reports` (
  `report_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '回報唯一碼 (PK)',
  `category` varchar(50) NOT NULL COMMENT '卡關類型 (忘記密碼/找不到表單/不知道進度等)',
  `description` text DEFAULT NULL COMMENT '補充說明 (選填)',
  `page_context` varchar(100) DEFAULT NULL COMMENT '發生於哪個功能頁籤',
  `role_context` varchar(20) DEFAULT NULL COMMENT '回報當下身分 (僅供統計，非個資)',
  `reported_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '回報時間',
  `ip_address` varchar(50) DEFAULT '127.0.0.1' COMMENT '來源 IP 位址',
  PRIMARY KEY (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校務服務斷點匿名回報表';

INSERT INTO `friction_reports` (`report_id`, `category`, `description`, `page_context`, `role_context`, `reported_at`, `ip_address`) VALUES
(1, '不知道申請進度或結果', '送出停修申請後不知道現在審核到哪個階段。', 'tab-checklist', '學生', '2026-09-10 14:20:00', '127.0.0.1'),
(2, '忘記密碼', '', 'tab-ai', '訪客', '2026-09-11 09:05:00', '127.0.0.1');

-- --------------------------------------------------------
-- 12. 跨系統期限雷達表 `deadlines`
-- --------------------------------------------------------
CREATE TABLE `deadlines` (
  `deadline_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '期限唯一碼 (PK)',
  `title` varchar(100) NOT NULL COMMENT '期限標題',
  `category` varchar(50) NOT NULL COMMENT '所屬系統 (選課/請假/抵免/獎助學金/教學評量等)',
  `start_date` date DEFAULT NULL COMMENT '開始日期 (選填)',
  `end_date` date NOT NULL COMMENT '截止日期',
  `applies_to_role` varchar(20) NOT NULL DEFAULT 'all' COMMENT '適用身分 (all/學生/家長)',
  `applies_to_dept` varchar(20) DEFAULT NULL COMMENT '適用系所 (NULL=全校)',
  `related_system_url` varchar(300) DEFAULT NULL COMMENT '對應原系統入口連結',
  `description` text DEFAULT NULL COMMENT '補充說明',
  PRIMARY KEY (`deadline_id`),
  KEY `fk_deadline_dept` (`applies_to_dept`),
  CONSTRAINT `fk_deadline_dept` FOREIGN KEY (`applies_to_dept`) REFERENCES `departments` (`dept_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跨系統期限雷達表';

INSERT INTO `deadlines` (`deadline_id`, `title`, `category`, `start_date`, `end_date`, `applies_to_role`, `applies_to_dept`, `related_system_url`, `description`) VALUES
(1, '加退選截止', '選課', '2026-09-14', '2026-09-20', 'all', NULL, 'https://www.ukn.edu.tw/', '逾期未完成加退選者，選課結果將依原排課確定生效。'),
(2, '語言證照學分抵免申請截止', '抵免', NULL, '2026-09-30', '學生', NULL, 'https://www.ukn.edu.tw/', '須檢附證書正影本與歷年成績單向教務處註冊組申請。'),
(3, '書卷獎與學海獎助學金申請截止', '獎助學金', NULL, '2026-10-15', '學生', NULL, 'https://www.ukn.edu.tw/', '依前一學期成績與家庭狀況審核，逾期不受理。'),
(4, '期中學業預警名單公告與輔導期', '學習預警', '2026-11-01', '2026-11-05', 'all', NULL, 'https://www.ukn.edu.tw/', '被列入預警名單者將由導師安排面談，家長可同步關注。'),
(5, '資訊管理科（五專）專題期中審查', '選課', NULL, '2026-11-10', '學生', 'CS', 'https://www.ukn.edu.tw/', '專題小組須完成期中進度報告並提交指導教師審核。'),
(6, '停修（棄修）申請截止（第10-12週）', '選課', '2026-11-09', '2026-11-20', '學生', NULL, 'https://www.ukn.edu.tw/', '逾期不受理，停修後修習學分不得低於最低應修學分。'),
(7, '教學評量填寫期間截止', '教學評量', '2026-12-15', '2026-12-25', '學生', NULL, 'https://www.ukn.edu.tw/', '完成填寫始可查詢學期成績，請於期末考前完成。'),
(8, '導師班務座談會', '教師行政', NULL, '2026-10-15', '老師', NULL, 'https://www.ukn.edu.tw/', '各班導師與學務處生輔組召開期初班務座談，說明本學期預警與輔導重點。'),
(9, '期中教學研討會議', '教師行政', NULL, '2026-11-12', '老師', NULL, 'https://www.ukn.edu.tw/', '全校教師參加，說明期中預警名單與教學評量作業重點。'),
(10, '期中成績繳交截止', '教師行政', NULL, '2026-11-18', '老師', NULL, 'https://www.ukn.edu.tw/', '請於期限內至教師成績登錄系統完成期中成績輸入。'),
(11, '期末成績繳交截止', '教師行政', NULL, '2027-01-15', '老師', NULL, 'https://www.ukn.edu.tw/', '請於期限內至教師成績登錄系統完成期末成績輸入，逾期將影響學生成績單產出。'),
(12, '期中考試週', '考試', '2026-11-23', '2026-11-27', 'all', NULL, 'https://www.ukn.edu.tw/', '期中考試週期間，請留意各科考試時間與地點公告。'),
(13, '期末考試週', '考試', '2027-01-05', '2027-01-09', 'all', NULL, 'https://www.ukn.edu.tw/', '期末考試週期間，請留意各科考試時間與地點公告。');

-- --------------------------------------------------------
-- 13. 獎學金條件表 `scholarship_conditions` (全新建立)
-- --------------------------------------------------------
CREATE TABLE `scholarship_conditions` (
  `scholarship_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '獎學金條件唯一碼 (PK)',
  `scholarship_name` varchar(100) NOT NULL COMMENT '獎學金名稱',
  `academic_score_req` decimal(5,2) DEFAULT NULL COMMENT '學生成績門檻',
  `conduct_score_req` decimal(5,2) DEFAULT NULL COMMENT '操行成績門檻',
  `identity_type` varchar(50) DEFAULT '一般生' COMMENT '身分別 (例如：低收入戶、原住民、一般生等)',
  `amount` int(11) DEFAULT NULL COMMENT '獎學金金額',
  `description` text DEFAULT NULL COMMENT '其他條件說明',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT '建立時間',
  PRIMARY KEY (`scholarship_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='獎學金條件與資格設定表';

INSERT INTO `scholarship_conditions` (`scholarship_id`, `scholarship_name`, `academic_score_req`, `conduct_score_req`, `identity_type`, `amount`, `description`) VALUES
(1, '書卷獎學金', 90.00, 85.00, '一般生', 5000, '前一學期學業成績與操行皆達標者。'),
(2, '清寒助學金', 70.00, 80.00, '低收入戶', 10000, '具備鄉鎮市區公所低收入戶證明文件。'),
(3, '原住民學生助學金', 75.00, 80.00, '原住民', 8000, '具備原住民身分證明，學業成績達標者。');

-- --------------------------------------------------------
-- 14. 科上通知與關懷紀錄系統 (衍生表)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `class_groups` (
  `class_name` varchar(50) NOT NULL COMMENT '班級 / 群組名稱 (PK)',
  `password_hash` varchar(255) NOT NULL COMMENT '加入密碼雜湊',
  `created_by` varchar(50) NOT NULL COMMENT '建立者姓名',
  `created_by_username` varchar(50) DEFAULT NULL COMMENT '建立者帳號 (系統自動建立時為 NULL)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`class_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：班級 / 群組';

CREATE TABLE IF NOT EXISTS `class_group_members` (
  `class_name` varchar(50) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`class_name`, `student_id`),
  KEY `fk_cgm_student` (`student_id`),
  CONSTRAINT `fk_cgm_class` FOREIGN KEY (`class_name`) REFERENCES `class_groups` (`class_name`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cgm_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：班級成員';

CREATE TABLE IF NOT EXISTS `class_notices` (
  `reply_required` tinyint(1) NOT NULL DEFAULT 0,
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`),
  KEY `idx_cn_class` (`class_name`),
  KEY `idx_cn_sender` (`sender_username`),
  CONSTRAINT `fk_cn_class` FOREIGN KEY (`class_name`) REFERENCES `class_groups` (`class_name`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：通知內容';

CREATE TABLE IF NOT EXISTS `class_notice_recipients` (
  `notice_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL COMMENT 'NULL = 尚未讀',
  `reply` varchar(20) DEFAULT NULL,
  `reply_at` datetime DEFAULT NULL,
  PRIMARY KEY (`notice_id`, `student_id`),
  KEY `fk_cnr_student` (`student_id`),
  CONSTRAINT `fk_cnr_notice` FOREIGN KEY (`notice_id`) REFERENCES `class_notices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cnr_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科上通知：收件人與已讀時間';

CREATE TABLE IF NOT EXISTS `counseling_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `class_name` varchar(50) DEFAULT NULL COMMENT '記錄當時學生的班級',
  `talk_date` date NOT NULL COMMENT '晤談日期',
  `method` enum('面談','電話','線上','家長聯繫') NOT NULL DEFAULT '面談',
  `topic` enum('學業','出缺勤','生活','生涯','家庭','身心','其他') NOT NULL DEFAULT '其他',
  `content` text NOT NULL COMMENT '晤談內容 (個人隱私，學生與家長看不到)',
  `follow_up` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = 需要追蹤',
  `follow_up_note` varchar(200) DEFAULT NULL COMMENT '要追蹤什麼',
  `follow_up_done` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = 已追蹤完成',
  `follow_up_date` date DEFAULT NULL,
  `tracking_status` varchar(20) NOT NULL DEFAULT '待聯繫',
  `tracking_result` text DEFAULT NULL,
  `counselor_username` varchar(50) NOT NULL COMMENT '記錄人帳號',
  `counselor_name` varchar(50) NOT NULL COMMENT '記錄人姓名',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_counsel_student` (`student_id`, `talk_date`),
  KEY `idx_counsel_class` (`class_name`),
  CONSTRAINT `fk_counsel_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='導生關懷紀錄 (T14)';


CREATE TABLE IF NOT EXISTS dorm_applications (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 student_id varchar(20) NOT NULL,
 student_name varchar(50) NOT NULL,
 semester varchar(20) NOT NULL,
 room_type varchar(20) NOT NULL,
 commute_minutes int NOT NULL,
 special_needs varchar(200) NOT NULL DEFAULT '',
 emergency_phone varchar(20) NOT NULL,
 stage int NOT NULL DEFAULT 0,
 status varchar(20) NOT NULL DEFAULT '進行中',
 bed varchar(20) NOT NULL DEFAULT '',
 note varchar(200) NOT NULL DEFAULT '',
 history_json longtext NOT NULL,
 created_at datetime NOT NULL,
 UNIQUE KEY uq_dorm_student_semester (student_id, semester),
 CONSTRAINT fk_dorm_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
