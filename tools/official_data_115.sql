-- 依康寧大學官網資料修正 smart_ukn 資料庫 (2026-10-27)
--
-- 來源：
--   科系名稱      https://www.ukn.edu.tw/p/412-1000-376.php (學術單位)
--   課程          資管科 112 學年度入學五專修業科目表 https://im.ukn.edu.tw/p/405-1028-609,c82.php
--   行事曆        教務處 115 學年度行事曆 https://daa.ukn.edu.tw/p/412-1021-846.php
--   分機          總務處 臺北校區分機號碼表 (1140617) https://ga.ukn.edu.tw/p/404-1022-40935.php
--   處室位置      114 學年度新生定向手冊 (教務處行政大樓 2 樓、學務處行政大樓 1 樓)
--
-- 只修改「內容仍是舊示範文字」的列 (WHERE 條件帶舊值)，團隊匯入的真實資料 (7 碼課程代碼、111 級學生、
-- class_schedule 80 號以後) 不會被動到；重複執行不會出錯。
-- 執行：mysql -u root smart_ukn < tools/official_data_115.sql   (或在 phpMyAdmin 貼上執行)
-- 執行前建議先備份：mysqldump -u root smart_ukn > smart_ukn_before_official.sql

SET NAMES utf8mb4;
START TRANSACTION;

-- 1. 科系名稱
UPDATE `departments` SET `dept_name` = '企業管理學系（科、所）' WHERE `dept_id` = 'BA' AND `dept_name` = '企業管理學系（科）';

-- 2. 示範課程 (CS101 等內部代碼) 改成修業科目表上的課名、學分與學期
UPDATE `course_map` SET `course_name` = '程式設計(一)', `credits` = 3, `prerequisite_id` = NULL, `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '一年級上', `description` = '程式設計基礎：變數、流程控制、迴圈、陣列與函式。' WHERE `course_id` = 'CS101' AND `course_name` = '計算機概論';
UPDATE `course_map` SET `course_name` = '程式設計(二)', `credits` = 3, `prerequisite_id` = 'CS101', `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '一年級下', `description` = '接續程式設計(一)，練習較完整的程式題目與除錯。' WHERE `course_id` = 'CS102' AND `course_name` = '程式設計(一)';
UPDATE `course_map` SET `credits` = 3, `prerequisite_id` = 'CS102', `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '三年級上', `description` = '陣列、鏈結串列、堆疊、佇列、樹與排序搜尋。' WHERE `course_id` = 'CS201' AND `semester_suggest` = '大二上';
UPDATE `course_map` SET `course_name` = 'JAVA程式語言(一)', `credits` = 3, `prerequisite_id` = 'CS102', `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '三年級上', `description` = 'Java 語法、類別與物件導向基礎。' WHERE `course_id` = 'CS202' AND `course_name` = '物件導向程式設計';
UPDATE `course_map` SET `course_name` = '系統分析與設計', `credits` = 3, `prerequisite_id` = 'CS201', `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '三年級下', `description` = '需求分析、系統規格與 UML 設計。' WHERE `course_id` = 'CS301' AND `course_name` = '演算法分析';
UPDATE `course_map` SET `course_name` = '資料庫管理實務(SQL)', `credits` = 2, `prerequisite_id` = NULL, `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '三年級下', `description` = '關聯式資料庫與 SQL 查詢實作。' WHERE `course_id` = 'CS302' AND `course_name` = '資料庫系統概論';
UPDATE `course_map` SET `course_name` = '動態網頁程式設計', `credits` = 3, `prerequisite_id` = 'CS102', `is_required` = 0, `course_type` = '專業選修', `semester_suggest` = '三年級上', `description` = '資訊軟體開發模組選修：伺服器端網頁程式與資料庫串接。' WHERE `course_id` = 'CS303' AND `course_name` = '網頁前後端開發實務';
UPDATE `course_map` SET `course_name` = '雲端應用', `credits` = 3, `prerequisite_id` = NULL, `is_required` = 0, `course_type` = '專業選修', `semester_suggest` = '五年級下', `description` = '資訊軟體開發模組選修：雲端服務與部署應用。' WHERE `course_id` = 'CS304' AND `course_name` = '雲端運算與虛擬化';
UPDATE `course_map` SET `course_name` = '實務專題(一)', `credits` = 1, `prerequisite_id` = 'CS301', `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '五年級上', `description` = '院定必修：分組完成資訊系統專題。' WHERE `course_id` = 'CS401' AND `course_name` = '畢業專題研討(一)';
UPDATE `course_map` SET `course_name` = '實務專題(二)', `credits` = 1, `prerequisite_id` = 'CS401', `is_required` = 1, `course_type` = '專業必修', `semester_suggest` = '五年級下', `description` = '院定必修：專題成果報告與發表。' WHERE `course_id` = 'CS402' AND `course_name` = '畢業專題研討(二)';
UPDATE `course_map` SET `course_name` = '英文(一)', `prerequisite_id` = NULL, `semester_suggest` = '一年級上', `description` = '一般科目必修：英文聽說讀寫。' WHERE `course_id` = 'EN101' AND `course_name` = '基礎英文(一)';
UPDATE `course_map` SET `course_name` = '英文(二)', `prerequisite_id` = NULL, `semester_suggest` = '一年級下', `description` = '一般科目必修：英文聽說讀寫。' WHERE `course_id` = 'EN102' AND `course_name` = '基礎英文(二)';
UPDATE `course_map` SET `course_name` = '康寧全人教育', `is_required` = 1, `course_type` = '共同必修', `semester_suggest` = '一年級上', `description` = '校定必修。' WHERE `course_id` = 'GE101' AND `course_name` = '大學之道與校園倫理';
UPDATE `course_map` SET `course_name` = '進階分類通識課程國文藝術類', `is_required` = 1, `semester_suggest` = '四年級上', `description` = '進階分類通識必修，實際科目依每學期開課。' WHERE `course_id` = 'GE102' AND `course_name` = '跨領域思維與創新科技';
UPDATE `course_map` SET `course_name` = '進階分類通識課程自然健康類', `is_required` = 1, `semester_suggest` = '四年級上', `description` = '進階分類通識必修，實際科目依每學期開課。' WHERE `course_id` = 'GE103' AND `course_name` = '環境永續與社會責任';

-- 3. 示範成績的學期與修業科目表一致 (資料結構、JAVA 為三年級上 = 114-1)
UPDATE `student_credits` SET `semester` = '114-1' WHERE `credit_id` IN (7, 12, 14, 18) AND `student_id` IN ('S112002', 'S112004', 'S112005') AND `semester` IN ('113-1', '113-2');

-- 4. 畢業學分結構 (資管科 112 學年度：專業必修 117 + 院定 4 = 121、選修 39、一般科目 46 + 進階通識 10 + 校定 4 = 60)
UPDATE `graduation_requirements` SET `major_required_req` = 121, `major_elective_req` = 39, `general_req` = 60, `project_req` = 2 WHERE `dept_id` = 'CS' AND `major_required_req` = 60;

-- 5. 校曆：補上 115-1 其他重要日期 (已有同名同日期的事項就不重複新增)
INSERT INTO `academic_calendar` (`event_name`, `start_date`, `end_date`, `category`, `related_checklist_id`)
SELECT * FROM (
    SELECT '期中考試' AS e, '2026-11-07' AS s, '2026-11-13' AS t, '教務' AS c, NULL AS r UNION ALL
    SELECT '申請下學期轉系(科)、輔系及雙主修', '2026-11-09', '2027-01-08', '教務', NULL UNION ALL
    SELECT '58 週年校慶典禮', '2026-12-12', '2026-12-12', '活動', NULL UNION ALL
    SELECT '下學期課程網路初選', '2026-12-21', '2026-12-27', '教務', NULL UNION ALL
    SELECT '期末考試', '2027-01-09', '2027-01-15', '教務', NULL UNION ALL
    SELECT '寒假開始', '2027-01-18', '2027-01-18', '活動', NULL
) AS n
WHERE NOT EXISTS (SELECT 1 FROM `academic_calendar` a WHERE a.`event_name` = n.e AND a.`start_date` = n.s);

-- 6. 申辦期限：舊的 5 筆示範期限改成行事曆上的日期，並補上 2 筆
UPDATE `deadlines` SET `title` = '115-1 受理棄選（停修）', `category` = '教務處課程與教學組', `semester_week` = 10, `start_date` = '2026-11-16', `end_date` = '2026-12-04', `applies_to_dept` = NULL, `description` = '五專前三年除外。每學期以 2 科為限，須完成任課教師、導師與科主任簽章。', `status_badge` = '依 115 學年度行事曆' WHERE `deadline_id` = 1 AND `title` = '115-1 學期課程停修申請';
UPDATE `deadlines` SET `title` = '115-1 期中考試', `category` = '教務處', `semester_week` = 8, `start_date` = '2026-11-07', `end_date` = '2026-11-13', `applies_to_role` = '學生', `applies_to_dept` = NULL, `description` = '期中考成績於 11/9-11/23 上網登錄。', `status_badge` = '依 115 學年度行事曆' WHERE `deadline_id` = 2 AND `title` = '期中預警評量與導師學習輔導訪談';
UPDATE `deadlines` SET `title` = '申請下學期轉系(科)、輔系及雙主修', `semester_week` = 9, `start_date` = '2026-11-09', `end_date` = '2027-01-08', `applies_to_dept` = NULL, `description` = '1/08 同時為本學期申請休學、退學截止日。', `status_badge` = '依 115 學年度行事曆' WHERE `deadline_id` = 3 AND `title` = '大四應屆畢業生學分資格預審';
UPDATE `deadlines` SET `title` = '學分抵免申請', `category` = '教務處註冊組', `semester_week` = 1, `start_date` = '2026-09-14', `end_date` = '2026-09-14', `description` = '開學日 9/14 截止；115-2 為 2/22 截止。', `status_badge` = '依 115 學年度行事曆' WHERE `deadline_id` = 4 AND `title` = '共同外語與證照學分抵免申請';
UPDATE `deadlines` SET `title` = '115-2 課程網路初選', `category` = '教務處課程與教學組', `semester_week` = 15, `start_date` = '2026-12-21', `end_date` = '2026-12-27', `applies_to_dept` = NULL, `description` = '下學期課程網路初選；加退選及重補修選課為 115-2 開學週 2/22-2/28。', `status_badge` = '依 115 學年度行事曆' WHERE `deadline_id` = 5 AND `title` = '暑期重補修意願登記與開班調查';
INSERT INTO `deadlines` (`title`, `category`, `semester_week`, `start_date`, `end_date`, `applies_to_role`, `applies_to_dept`, `related_system_url`, `description`, `status_badge`)
SELECT * FROM (
    SELECT '網路教學評量填寫' AS t, '教務處' AS c, 14 AS w, '2026-12-14' AS s, '2026-12-20' AS e, '學生' AS r, NULL AS d, 'http://203.71.63.13/academic/' AS u, '請於期限內完成本學期每一門課的教學評量。' AS x, '依 115 學年度行事曆' AS b UNION ALL
    SELECT '弱勢助學金、學產基金、台北市清寒午餐補助申請', '學生事務處', 1, '2026-09-16', '2026-10-01', '學生', NULL, '', '115 學年度申請期間。', '依 115 學年度行事曆'
) AS n
WHERE NOT EXISTS (SELECT 1 FROM `deadlines` x WHERE x.`title` = n.t);

-- 7. 申辦流程的辦公室位置與分機
UPDATE `checklist_items` SET `office_location` = '行政大樓 2 樓 教務處 (課程與教學組)', `contact_phone` = '02-2632-1181 分機 323, 325', `deadline_week_info` = '第 10-12 週 (115-1：11/16-12/4，五專前三年除外)', `steps_json` = REPLACE(`steps_json`, '送交教務處課務組核備', '送交教務處課程與教學組核備') WHERE `item_id` = 1 AND `contact_phone` = '02-2632-1181 分機 310, 312';
UPDATE `checklist_items` SET `contact_phone` = '02-2632-1181 分機 464, 412' WHERE `item_id` = 2 AND `contact_phone` = '02-2632-1181 分機 211';
UPDATE `checklist_items` SET `office_location` = '通識教育中心', `contact_phone` = '02-2632-1181 分機 592, 598', `deadline_week_info` = '開學日截止 (115-1：9/14，已截止)', `steps_json` = REPLACE(`steps_json`, '教務處課務組複審學分折抵', '教務處課程與教學組複審學分折抵') WHERE `item_id` = 3 AND `contact_phone` = '02-2632-1181 分機 520, 521';
UPDATE `checklist_items` SET `office_location` = '行政大樓 2 樓 教務處 (註冊組)', `contact_phone` = '02-2632-1181 分機 324, 312, 313' WHERE `item_id` = 4 AND `contact_phone` = '02-2632-1181 分機 321, 322';
UPDATE `checklist_items` SET `office_location` = '研究發展處 (先送所屬科辦)', `contact_phone` = '02-2632-1181 分機 107, 113', `steps_json` = REPLACE(`steps_json`, '送交研發處實習就業組審核並撥款', '送科辦初審後，由研究發展處審核並撥款') WHERE `item_id` = 5 AND `contact_phone` = '02-2632-1181 分機 612';

-- 8. 規章條文中的課名與承辦單位
UPDATE `knowledge_base` SET `content` = REPLACE(`content`, '申請抵免大一共同外語「基礎英文(一)」及「基礎英文(二)」共 4 學分', '申請抵免一年級「英文(一)」及「英文(二)」共 4 學分') WHERE `id` = 3;
UPDATE `knowledge_base` SET `content` = REPLACE(`content`, '例如：程式設計(一) 為 資料結構 之先修科目', '例如：程式設計(二) 為 資料結構 之先修科目') WHERE `id` = 4;
UPDATE `knowledge_base` SET `content` = REPLACE(`content`, '請至研發處實習就業組辦理。', '先送所屬科系初審，再由研究發展處審核。') WHERE `id` = 5;

-- 9. 示範學生王小明 (S112001) 的重修課與缺曠紀錄跟著改名
UPDATE `class_schedule` SET `course_name` = '程式設計(二)' WHERE `id` IN (8, 9) AND `student_id` = 'S112001' AND `course_name` = '程式設計(一)';
UPDATE `attendance_records` SET `course_name` = '程式設計(二)' WHERE `student_id` = 'S112001' AND `course_name` = '程式設計(一)';
UPDATE `assignments` SET `course_name` = '程式設計(二)', `title` = '重修班：函式練習題' WHERE `id` = 5 AND `student_id` = 'S112001' AND `course_name` = '程式設計(一)';

-- 10. 公告：加退選截止日、助學金期間與中秋節班會
UPDATE `announcements` SET `title` = '網路加退選及重補修選課 9/14-9/20', `office` = '課程與教學組', `publish_date` = '2026-09-11', `content` = '依 115 學年度行事曆，網路加退選及重補修課程為 9/14 (一) 至 9/20 (日)，請於期限內至選課系統確認選課結果。' WHERE `id` = 1 AND `title` = '本學期加退選將於 9/25 (五) 17:00 截止';
UPDATE `announcements` SET `title` = '弱勢助學金、學產基金申請開始受理（9/16-10/01）', `office` = '學務處', `publish_date` = '2026-09-16', `content` = '115 學年度弱勢助學金、學產基金、台北市清寒午餐補助即日起受理至 10/01，請備妥相關證明文件。' WHERE `id` = 2 AND `title` = '獎助學金申請開始受理（至 10/16）';
UPDATE `announcements` SET `title` = '10/2 班會地點改至 A402', `publish_date` = '2026-09-30', `content` = '因 A301 投影設備維修，本週五班會改於 A402 舉行，請準時出席。(9/25 中秋節放假停課)' WHERE `id` = 3 AND `title` = '9/25 班會地點改至 A402';

COMMIT;

-- 11. (選擇性，請與組員確認後再執行) class_schedule 1-7、10-14 號是舊版示範課表 (環境永續與社會責任、基礎英文(二)、
--     資料庫系統概論…)，課名不在資管科修業科目表上，而且和 80-91 號真實的資管五忠課表重疊。確認沒有人在用後可刪除：
-- DELETE FROM `class_schedule` WHERE `id` IN (1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14) AND `class_name` IN ('資管五忠', '資管五孝');
