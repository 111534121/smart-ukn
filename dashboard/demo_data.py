"""
儀表板示範資料 (MySQL 離線時使用；seed_data.py 也從這裡匯入，兩邊保持一致)

課表、作業以 class_name (整班) 或 student_id (重補修等個人加選) 指定對象，
其中之一為 None。日期配合 app.py 的 DEMO_ATTENDANCE_RECORDS：
王小明 (S112001) 週一、週三重修程式設計(一)，9/18 週五請病假。
"""

# 節次時間 (節次: (上課, 下課))，依康寧大學作息：每節 50 分鐘、下課 10 分鐘，12:20~13:20 午休
PERIOD_TIMES = {
    1: ("08:30", "09:20"),
    2: ("09:30", "10:20"),
    3: ("10:30", "11:20"),
    4: ("11:30", "12:20"),
    5: ("13:20", "14:10"),
    6: ("14:20", "15:10"),
    7: ("15:20", "16:10"),
    8: ("16:20", "17:10"),
    9: ("17:20", "18:10"),
}

# weekday：1 = 週一 … 7 = 週日
DEMO_CLASS_SCHEDULE = [
    # 資管五忠
    {"id": 1, "class_name": "資管五忠", "student_id": None, "weekday": 1, "period_start": 3, "period_end": 4, "course_name": "環境永續與社會責任", "classroom": "G203", "teacher": "黃淑芬"},
    {"id": 2, "class_name": "資管五忠", "student_id": None, "weekday": 2, "period_start": 1, "period_end": 2, "course_name": "基礎英文(二)", "classroom": "L201", "teacher": "Amy Chen"},
    {"id": 3, "class_name": "資管五忠", "student_id": None, "weekday": 2, "period_start": 3, "period_end": 5, "course_name": "資料結構", "classroom": "A301", "teacher": "林志明"},
    {"id": 4, "class_name": "資管五忠", "student_id": None, "weekday": 3, "period_start": 3, "period_end": 5, "course_name": "資料庫系統概論", "classroom": "A402", "teacher": "彭賓鈺"},
    {"id": 5, "class_name": "資管五忠", "student_id": None, "weekday": 4, "period_start": 2, "period_end": 4, "course_name": "物件導向程式設計", "classroom": "A305 電腦教室", "teacher": "吳建宏"},
    {"id": 6, "class_name": "資管五忠", "student_id": None, "weekday": 5, "period_start": 3, "period_end": 4, "course_name": "跨領域思維與創新科技", "classroom": "G101", "teacher": "李佩珊"},
    {"id": 7, "class_name": "資管五忠", "student_id": None, "weekday": 5, "period_start": 6, "period_end": 7, "course_name": "班會 / 導師時間", "classroom": "A301", "teacher": "彭賓鈺"},
    # 王小明重修
    {"id": 8, "class_name": None, "student_id": "S112001", "weekday": 1, "period_start": 6, "period_end": 7, "course_name": "程式設計(一)", "classroom": "A303", "teacher": "張文華"},
    {"id": 9, "class_name": None, "student_id": "S112001", "weekday": 3, "period_start": 6, "period_end": 6, "course_name": "程式設計(一)", "classroom": "A303", "teacher": "張文華"},
    # 資管四孝
    {"id": 10, "class_name": "資管四孝", "student_id": None, "weekday": 1, "period_start": 1, "period_end": 3, "course_name": "資料結構", "classroom": "A301", "teacher": "林志明"},
    {"id": 11, "class_name": "資管四孝", "student_id": None, "weekday": 2, "period_start": 3, "period_end": 4, "course_name": "基礎英文(二)", "classroom": "L203", "teacher": "Amy Chen"},
    {"id": 12, "class_name": "資管四孝", "student_id": None, "weekday": 3, "period_start": 2, "period_end": 4, "course_name": "物件導向程式設計", "classroom": "A305 電腦教室", "teacher": "吳建宏"},
    {"id": 13, "class_name": "資管四孝", "student_id": None, "weekday": 4, "period_start": 3, "period_end": 5, "course_name": "資料庫系統概論", "classroom": "A402", "teacher": "彭賓鈺"},
    {"id": 14, "class_name": "資管四孝", "student_id": None, "weekday": 5, "period_start": 6, "period_end": 7, "course_name": "班會 / 導師時間", "classroom": "A302", "teacher": "林志明"},
    # 護理四忠
    {"id": 15, "class_name": "護理四忠", "student_id": None, "weekday": 1, "period_start": 1, "period_end": 3, "course_name": "內外科護理學", "classroom": "N201", "teacher": "許美玲"},
    {"id": 16, "class_name": "護理四忠", "student_id": None, "weekday": 2, "period_start": 1, "period_end": 2, "course_name": "藥理學", "classroom": "N203", "teacher": "蔡宗翰"},
    {"id": 17, "class_name": "護理四忠", "student_id": None, "weekday": 3, "period_start": 3, "period_end": 4, "course_name": "基礎英文(二)", "classroom": "L202", "teacher": "Amy Chen"},
    {"id": 18, "class_name": "護理四忠", "student_id": None, "weekday": 4, "period_start": 1, "period_end": 4, "course_name": "基本護理學實驗", "classroom": "N105 技術教室", "teacher": "許美玲"},
    {"id": 19, "class_name": "護理四忠", "student_id": None, "weekday": 5, "period_start": 3, "period_end": 4, "course_name": "護理倫理", "classroom": "N201", "teacher": "鄭如君"},
]

# target_class 為 None 代表全校公告
DEMO_ANNOUNCEMENTS = [
    {"id": 1, "title": "本學期加退選將於 9/25 (五) 17:00 截止", "office": "註冊組", "publish_date": "2026-09-22", "target_class": None, "url": "#",
     "content": "請同學於截止前至學生教務系統確認選課結果，逾期不再受理加退選。"},
    {"id": 2, "title": "獎助學金申請開始受理（至 10/16）", "office": "生輔組", "publish_date": "2026-09-21", "target_class": None, "url": "#",
     "content": "校內外獎助學金即日起開放線上申請，請備妥清寒證明或成績單等相關文件。"},
    {"id": 3, "title": "9/25 班會地點改至 A402", "office": "資管科辦", "publish_date": "2026-09-23", "target_class": "資管五忠", "url": "#",
     "content": "因 A301 投影設備維修，本週五班會改於 A402 舉行，請準時出席。"},
    {"id": 4, "title": "圖書館利用講習開放報名", "office": "圖書館", "publish_date": "2026-09-15", "target_class": None, "url": "#",
     "content": "介紹電子資料庫查詢與館際合作服務，參加可認證學習時數 2 小時。"},
    {"id": 5, "title": "台北校區 A 棟電梯 9/24 停機保養", "office": "總務處", "publish_date": "2026-09-23", "target_class": None, "url": "#",
     "content": "9/24 (四) 08:00-12:00 A 棟電梯停機保養，行動不便同學請洽總務處協助。"},
    {"id": 6, "title": "宿舍晚歸登記改為線上辦理", "office": "學務處", "publish_date": "2026-09-10", "target_class": None, "url": "#",
     "content": "即日起晚歸、外宿請於學生專區「宿舍晚歸／外宿請假」線上登記，不再受理紙本。"},
    {"id": 7, "title": "實習前健康檢查 10/2 截止繳交", "office": "護理科辦", "publish_date": "2026-09-20", "target_class": "護理四忠", "url": "#",
     "content": "請於 10/2 前將健康檢查報告繳交至科辦，未繳交者不得參加下學期臨床實習。"},
]

DEMO_ANNOUNCEMENT_READS = [
    {"student_id": "S112001", "announcement_id": 4},
    {"student_id": "S112001", "announcement_id": 6},
    {"student_id": "S112002", "announcement_id": 1},
    {"student_id": "S112002", "announcement_id": 2},
    {"student_id": "S112002", "announcement_id": 4},
]

DEMO_ASSIGNMENTS = [
    {"id": 1, "class_name": "資管五忠", "student_id": None, "course_name": "資料結構", "title": "作業一：鏈結串列實作", "due_at": "2026-09-25 23:59", "url": "#"},
    {"id": 2, "class_name": "資管五忠", "student_id": None, "course_name": "資料庫系統概論", "title": "ER 圖設計報告", "due_at": "2026-09-30 23:59", "url": "#"},
    {"id": 3, "class_name": "資管五忠", "student_id": None, "course_name": "物件導向程式設計", "title": "Lab 2：類別與封裝", "due_at": "2026-09-24 12:00", "url": "#"},
    {"id": 4, "class_name": "資管五忠", "student_id": None, "course_name": "基礎英文(二)", "title": "Reading Journal Week 3", "due_at": "2026-09-22 23:59", "url": "#"},
    {"id": 5, "class_name": None, "student_id": "S112001", "course_name": "程式設計(一)", "title": "重修班：迴圈練習題", "due_at": "2026-09-28 23:59", "url": "#"},
    {"id": 6, "class_name": "資管四孝", "student_id": None, "course_name": "資料結構", "title": "作業一：鏈結串列實作", "due_at": "2026-09-26 23:59", "url": "#"},
    {"id": 7, "class_name": "護理四忠", "student_id": None, "course_name": "藥理學", "title": "常用藥物分類表", "due_at": "2026-09-29 23:59", "url": "#"},
]

DEMO_ASSIGNMENT_SUBMISSIONS = [
    {"student_id": "S112001", "assignment_id": 3},
    {"student_id": "S112002", "assignment_id": 1},
    {"student_id": "S112002", "assignment_id": 3},
    {"student_id": "S112002", "assignment_id": 4},
    {"student_id": "S112005", "assignment_id": 4},
]

# status：待審核 / 已核准 / 已退回
DEMO_LEAVE_REQUESTS = [
    {"id": 1, "student_id": "S112001", "leave_type": "病假", "start_date": "2026-09-18", "end_date": "2026-09-18", "periods": "3-4", "reason": "發燒就醫", "status": "已核准", "review_note": "", "submitted_at": "2026-09-18 08:30"},
    {"id": 2, "student_id": "S112001", "leave_type": "事假", "start_date": "2026-09-30", "end_date": "2026-09-30", "periods": "3-5", "reason": "家中有事需返鄉", "status": "待審核", "review_note": "", "submitted_at": "2026-09-22 21:10"},
    {"id": 3, "student_id": "S112002", "leave_type": "病假", "start_date": "2026-09-16", "end_date": "2026-09-16", "periods": "3-5", "reason": "腸胃炎", "status": "已核准", "review_note": "", "submitted_at": "2026-09-16 07:45"},
    {"id": 4, "student_id": "S112005", "leave_type": "事假", "start_date": "2026-09-22", "end_date": "2026-09-22", "periods": "1-2", "reason": "機車故障", "status": "已退回", "review_note": "請補附相關證明後重新申請", "submitted_at": "2026-09-22 09:20"},
]
