"""獎助學金示範資料：app.py 離線示範模式與 seed_data.py 匯入 MySQL 共用同一份"""

# GPA、操行、身分別屬敏感個資，不放進 DEMO_STUDENTS (其他 API 會整筆回傳學生資料)，只在獎助學金比對中使用
DEMO_SCHOLARSHIP_PROFILES = {
    "S112001": {"grade_level": 4, "gpa": 3.35, "conduct_score": 86, "identity_type": "中低收入戶"},
    "S112002": {"grade_level": 4, "gpa": 3.62, "conduct_score": 88, "identity_type": None},
    "S112003": {"grade_level": 4, "gpa": 3.1, "conduct_score": 85, "identity_type": "原住民"},
    "S112004": {"grade_level": 4, "gpa": 3.85, "conduct_score": 90, "identity_type": None},
    "S112005": {"grade_level": 4, "gpa": 3.2, "conduct_score": 86, "identity_type": "低收入戶"}
}

# 網址取自學校官網「學生專區」(2026-09-24 查核)
SA_SCHOLARSHIP_NEWS = "https://sa.ukn.edu.tw/p/412-1003-4377.php?Lang=zh-tw"   # 學務處獎助學金訊息
REMIT_APPLY = "https://ec2.ukn.edu.tw/WebRemit/login.aspx"                      # 學雜費減免暨弱勢助學金申請

# 示範資料 (與 seed_data.py 一致)。apply_url 為 None 代表沒有線上申請系統，依公告方式申請
DEMO_SCHOLARSHIPS = [
    {"id": 1, "name": "書卷獎（學業優異獎學金）", "provider": "校內", "amount": 5000, "deadline": "2026-10-15",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "各班前學期學業成績優異者，依排名核發。", "min_grade": 2, "max_grade": 5, "departments": None,
     "min_gpa": 3.5, "min_conduct": 80, "identity_required": None, "no_fail_required": 1},
    {"id": 2, "name": "清寒助學金", "provider": "校內", "amount": 10000, "deadline": "2026-09-28",
     "apply_url": REMIT_APPLY, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "協助家境清寒學生安心就學，需檢附低收入戶或中低收入戶證明。", "min_grade": None, "max_grade": None, "departments": None,
     "min_gpa": None, "min_conduct": 70, "identity_required": "低收入戶,中低收入戶", "no_fail_required": 0},
    {"id": 3, "name": "原住民族學生獎助學金", "provider": "校外", "amount": 15000, "deadline": "2026-10-31",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "原住民族委員會補助原住民族學生就學。", "min_grade": None, "max_grade": None, "departments": None,
     "min_gpa": 2.5, "min_conduct": None, "identity_required": "原住民", "no_fail_required": 0},
    {"id": 4, "name": "身心障礙學生獎助學金", "provider": "校外", "amount": 12000, "deadline": "2026-11-15",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "教育部補助持有身心障礙證明之學生。", "min_grade": None, "max_grade": None, "departments": None,
     "min_gpa": None, "min_conduct": None, "identity_required": "身心障礙", "no_fail_required": 0},
    {"id": 5, "name": "資訊管理科專題研究獎學金", "provider": "校內", "amount": 8000, "deadline": "2026-10-05",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "鼓勵高年級學生投入專題研究，需檢附專題計畫書。", "min_grade": 3, "max_grade": 5, "departments": "CS",
     "min_gpa": 3.0, "min_conduct": None, "identity_required": None, "no_fail_required": 0},
    {"id": 6, "name": "產學合作企業獎學金", "provider": "校外", "amount": 20000, "deadline": "2026-09-30",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "產學合作企業提供資訊管理科學生申請，錄取者可優先參加企業實習。", "min_grade": 1, "max_grade": 5, "departments": "CS",
     "min_gpa": 3.3, "min_conduct": 85, "identity_required": None, "no_fail_required": 1},
    {"id": 7, "name": "弱勢學生助學金", "provider": "校外", "amount": 8000, "deadline": "2026-10-20",
     "apply_url": REMIT_APPLY, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "教育部大專校院弱勢學生助學計畫，符合任一身分即可申請。", "min_grade": None, "max_grade": None, "departments": None,
     "min_gpa": None, "min_conduct": None, "identity_required": "低收入戶,中低收入戶,原住民,身心障礙", "no_fail_required": 0},
    {"id": 8, "name": "護理科實習獎學金", "provider": "校內", "amount": 5000, "deadline": "2026-10-10",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "補助護理科學生臨床實習期間交通與生活支出。", "min_grade": 2, "max_grade": 5, "departments": "NUR",
     "min_gpa": None, "min_conduct": 80, "identity_required": None, "no_fail_required": 0},
    {"id": 9, "name": "學海飛颺（出國研修）", "provider": "校外", "amount": 50000, "deadline": "2026-09-15",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "教育部補助學生赴國外研修一學期。", "min_grade": 2, "max_grade": 5, "departments": None,
     "min_gpa": 3.0, "min_conduct": None, "identity_required": None, "no_fail_required": 0},
    {"id": 10, "name": "品德楷模獎學金", "provider": "校內", "amount": 3000, "deadline": "2026-11-30",
     "apply_url": None, "announcement_url": SA_SCHOLARSHIP_NEWS,
     "description": "表揚操行表現優良、熱心服務的學生。", "min_grade": None, "max_grade": None, "departments": None,
     "min_gpa": 3.0, "min_conduct": 88, "identity_required": None, "no_fail_required": 1}
]
