"""示範班級資料 (T15)：在 seed_data.py 之後執行，產生資管科六個班的虛構學生。

    python seed_classes.py            # 寫入 MySQL
    python seed_classes.py --dry-run  # 只印出會產生什麼，不連資料庫

班級 (115 學年第 1 學期)：
    資管一忠 9 人 (115 入學)、資管二忠 9 人 (114)、資管三忠 9 人 (113)、資管四忠 9 人 (112)
    資管五忠 28 人、資管五孝 10 人 (111 入學)
學號：入學年 + 5 (五專) + 34 (資管科) + 序號；忠班 101 起、孝班 201 起，例如 111534101

注意：
- 全部都是虛構的人 (名字隨機組合)。收入別、身心障礙、成績、缺曠都屬敏感個資，不要放真實同學的資料。
- 班上已經有的學生 (例如 seed_data.py 的王小明，或自己手動加的) 不會被改動，也算進班級人數。
- 固定亂數種子，每個人跑出來的資料都一樣；重複執行只會更新本程式產生的學生。
- 每位產生的學生都有登入帳號：帳號 = 學號，密碼 123456。
"""
import random
import sys
from datetime import date, timedelta

DEPT_ID = "CS"
CURRENT_YEAR = 115
SEED = 20261012
PASSWORD_HASH_123456 = "pbkdf2:sha256:1000000$1pZH4zsCrzpTUDpY$56c22c83158361bc754b4c140e89c0812713d8c5b1277ffd02fe410f12c6149c"
CLASS_PASSWORD = "ukn2026"

# (班級, 入學年, 序號起點, 目標人數)
CLASSES = [
    ("資管一忠", 115, 101, 9),
    ("資管二忠", 114, 101, 9),
    ("資管三忠", 113, 101, 9),
    ("資管四忠", 112, 101, 9),
    ("資管五忠", 111, 101, 28),
    ("資管五孝", 111, 201, 10),
]

# 舊示範資料的「資管四孝」→ 依規劃四年級只有忠班，改為資管五孝；導師林志明
RENAMES = [("資管四孝", "資管五孝")]
EXTRA_TEACHERS = [("teacher2", "林志明 老師", "資管五孝")]

# 補兩門 114-2 的選修課，讓每學期至少兩門課 (學業預警才算得出一半)
EXTRA_COURSES = [
    ("CS305", "系統分析與設計", 3, "CS201", 0, "專業選修", DEPT_ID, "大四上", "需求訪談、UML、系統規格書撰寫。"),
    ("CS306", "行動應用程式開發", 3, "CS102", 0, "專業選修", DEPT_ID, "大四下", "Android / Flutter 行動 App 開發與上架。"),
]
# 第 k 個學期修的課 (k = 0 是入學第一學期)
SEMESTER_COURSES = [
    ["CS101", "EN101", "GE101"], ["CS102", "EN102"], ["CS201", "GE102"], ["CS202", "GE103"],
    ["CS301", "CS303"], ["CS302", "CS304"], ["CS401", "CS305"], ["CS402", "CS306"],
]
COURSE_NAMES = {"CS101": "計算機概論", "CS102": "程式設計(一)", "CS201": "資料結構", "CS202": "物件導向程式設計",
                "CS301": "演算法分析", "CS302": "資料庫系統概論", "CS303": "網頁前後端開發實務", "CS304": "雲端運算與虛擬化",
                "CS401": "畢業專題研討(一)", "CS402": "畢業專題研討(二)", "CS305": "系統分析與設計", "CS306": "行動應用程式開發",
                "EN101": "基礎英文(一)", "EN102": "基礎英文(二)", "GE101": "大學之道與校園倫理",
                "GE102": "跨領域思維與創新科技", "GE103": "環境永續與社會責任"}
# 這學期 (115-1) 缺曠紀錄用的課 (名稱要和 course_map 一致，扣考門檻才會用正確學分)
ATTEND_COURSES = {
    1: ["計算機概論", "基礎英文(一)", "大學之道與校園倫理"],
    2: ["資料結構", "跨領域思維與創新科技"],
    3: ["演算法分析", "網頁前後端開發實務"],
    4: ["資料庫系統概論", "雲端運算與虛擬化"],
    5: ["資料庫系統概論", "物件導向程式設計", "基礎英文(二)", "跨領域思維與創新科技"],
}

# 資管五忠：每一列是一位要產生的學生 (由上往下取用，班上原本的人越多、取用越少)
#   identity：身分別 (逗號分隔可多個)；study：good 優秀 / normal 一般 / retake 需重補修 / two_one 學業要注意 (不及格超過一半)
#   attend：full 全勤 / normal 偶爾遲到請假 / warning 快扣考 / banned 已扣考 / absent 幾乎沒來
FIVE_ZHONG = [
    {"identity": "低收入戶", "study": "normal", "attend": "normal"},
    {"identity": "中低收入戶", "study": "retake", "attend": "normal"},
    {"identity": "中低收入戶", "study": "good", "attend": "full"},
    {"identity": "身心障礙", "study": "normal", "attend": "normal"},
    {"identity": "原住民", "study": "good", "attend": "full"},
    {"identity": "新住民子女", "study": "normal", "attend": "full"},
    {"identity": None, "study": "retake", "attend": "warning"},
    {"identity": None, "study": "retake", "attend": "normal"},
    {"identity": None, "study": "retake", "attend": "normal"},
    {"identity": None, "study": "two_one", "attend": "banned"},
    {"identity": None, "study": "two_one", "attend": "warning"},
    {"identity": None, "study": "two_one", "attend": "absent"},
    {"identity": None, "study": "good", "attend": "full"},
    {"identity": None, "study": "good", "attend": "full"},
    {"identity": None, "study": "good", "attend": "full"},
    {"identity": None, "study": "good", "attend": "full"},
    {"identity": None, "study": "normal", "attend": "full"},
] + [{"identity": None, "study": "normal", "attend": "normal"}] * 11

# 其他班：少量混合，教職員切換班級、年級廣播時看得出差別
OTHER_MIX = [
    {"identity": "中低收入戶", "study": "normal", "attend": "normal"},
    {"identity": None, "study": "retake", "attend": "warning"},
    {"identity": None, "study": "good", "attend": "full"},
    {"identity": None, "study": "good", "attend": "full"},
    {"identity": None, "study": "two_one", "attend": "normal"},
] + [{"identity": None, "study": "normal", "attend": "normal"}] * 10

SURNAMES = list("陳林黃張李王吳劉蔡楊許鄭謝洪郭邱曾廖賴徐周葉蘇莊呂江何蕭羅高潘簡朱鍾彭游詹胡施沈余盧梁趙顏柯翁魏孫戴")
GIVEN = list("宇翔庭瑄嘉恩承睿芷涵品妤柏彥俊傑子晴思妍語彤冠廷宥均詠晨佳穎昱辰怡君家豪育誠欣妮亭萱志明宗翰雅婷浩然秉宏郁婷建宏筱涵")


def school_days(start, end):
    d, out = start, []
    while d <= end:
        if d.weekday() < 5:
            out.append(d.isoformat())
        d += timedelta(days=1)
    return out


SEMESTER_DAYS = school_days(date(2026, 9, 14), date(2026, 10, 9))  # 115-1 第 1～4 週


def make_name(rng, used):
    while True:
        name = rng.choice(SURNAMES) + rng.choice(GIVEN) + rng.choice(GIVEN)
        if name not in used and name[1] != name[2]:
            used.add(name)
            return name


def make_grades(rng, sid, year, study):
    """回傳 [(student_id, course_id, semester, score, is_passed)]：已結束的學期 (115-1 之前)"""
    done = 2 * (CURRENT_YEAR - year)
    rows = []
    retake_k = rng.randrange(0, done - 1) if study == "retake" and done >= 2 else None
    for k in range(done):
        semester = f"{year + k // 2}-{k % 2 + 1}"
        courses = SEMESTER_COURSES[k]
        fail_one = (study == "two_one" and k == done - 1)
        for i, cid in enumerate(courses):
            base = {"good": 88, "normal": 76, "retake": 70, "two_one": 66}[study]
            score = max(30, min(99, round(rng.gauss(base, 6), 1)))
            passed = True
            if (retake_k == k and i == 0) or (fail_one and i == 0):
                score, passed = round(rng.uniform(35, 57), 1), False
            elif score < 60:
                score = 60.0 + rng.randint(0, 5)
            rows.append((sid, cid, semester, score, 1 if passed else 0))
    return rows


def make_attendance(rng, sid, grade, attend):
    """回傳 [(student_id, date, course_name, type)]：115-1 這學期到目前為止"""
    courses = ATTEND_COURSES[grade]
    rows = []
    def pick_days(n):
        return sorted(rng.sample(SEMESTER_DAYS, n))
    if attend == "normal":
        for d in pick_days(rng.randint(0, 3)):
            rows.append((sid, d, rng.choice(courses), rng.choice(["遲到", "遲到", "病假", "曠課"])))
    elif attend == "warning":   # 一門 3 學分課曠 4 次 = 12 小時，達扣考門檻 18 小時的 2/3
        rows += [(sid, d, courses[0], "曠課") for d in pick_days(4)]
        rows += [(sid, d, courses[-1], "遲到") for d in pick_days(2)]
    elif attend == "banned":    # 一門 3 學分課曠 6 次 = 18 小時，已扣考
        rows += [(sid, d, courses[0], "曠課") for d in pick_days(6)]
        rows += [(sid, d, courses[1], "曠課") for d in pick_days(2)]
    elif attend == "absent":    # 幾乎沒來：每門課都曠很多
        for c in courses:
            rows += [(sid, d, c, "曠課") for d in pick_days(min(7, len(SEMESTER_DAYS)))]
    return rows


# ---------------------------------------------------------------------
# T18 證照、比賽、作品、幹部、獎懲 (全部虛構)
#   證照、比賽、作品寫進 certificates (kind = 證照 / 競賽 / 作品)，file_name 標成 SEED_MARK 方便重跑時清掉
#   幹部、獎懲寫進 student_records (需先執行 init_db.py 建表)
# ---------------------------------------------------------------------
SEED_MARK = "seed_classes.py"
TODAY = date(2026, 10, 10)  # 示範資料的「今天」(與缺曠紀錄同一週)

# (證照名稱, 發證單位, 最低年級)
CERT_POOL = [
    ("丙級電腦軟體應用技術士", "勞動部勞動力發展署技能檢定中心", 1),
    ("丙級網頁設計技術士", "勞動部勞動力發展署技能檢定中心", 2),
    ("丙級電腦硬體裝修技術士", "勞動部勞動力發展署技能檢定中心", 2),
    ("乙級電腦軟體應用技術士", "勞動部勞動力發展署技能檢定中心", 4),
    ("TQC 文書處理（Word）", "財團法人中華民國電腦技能基金會", 1),
    ("TQC 電子試算表（Excel）", "財團法人中華民國電腦技能基金會", 1),
    ("TQC 程式語言（Python）", "財團法人中華民國電腦技能基金會", 3),
    ("全民英檢初級", "財團法人語言訓練測驗中心", 2),
    ("多益測驗 600 分", "忠欣股份有限公司", 4),
]
# (比賽名稱, 主辦單位, 最低年級, 層級：校內 / 全國)
CONTEST_POOL = [
    ("校內程式設計競賽", "康寧大學資訊管理科", 1, "校內"),
    ("校內英文單字比賽", "康寧大學語言中心", 1, "校內"),
    ("校內簡報競賽", "康寧大學學務處", 2, "校內"),
    ("全國技藝競賽 資訊技術類", "教育部國民及學前教育署", 2, "全國"),
    ("全國大專校院資訊應用服務創新競賽", "教育部", 4, "全國"),
    ("全國專科學校專題實作競賽", "教育部技術及職業教育司", 5, "全國"),
]
AWARDS = ["第一名", "第二名", "第三名", "佳作", "入圍決賽", "參賽"]
WORK_POOL = [
    ("班級網站製作", "用 HTML、CSS 做的班級介紹網站", 2),
    ("校園失物招領 App", "課堂期末專案，可以拍照登記失物", 3),
    ("畢業專題：校園選課小幫手", "畢業專題，幫同學檢查衝堂與擋修", 5),
    ("畢業專題：社團活動報名系統", "畢業專題，社團線上報名與點名", 5),
]
POSITIONS = ["班長", "副班長", "學藝股長", "總務股長", "風紀股長", "衛生股長", "康樂股長", "資訊股長"]
GOOD_DEEDS = ["擔任志工服務認真", "協助校慶活動", "協助新生訓練", "熱心公務", "拾金不昧"]
MINOR_FAULTS = ["上課使用手機經勸導未改善", "服儀不整經勸導未改善", "未依規定時間繳交班級資料"]


def _date_in(rng, year, half):
    """學年 year 的上 (1) 或下 (2) 學期中隨機一天 (西元)"""
    y = year + 1911
    start = date(y, 9, 15) if half == 1 else date(y + 1, 2, 20)
    last = min(start + timedelta(days=110), TODAY)  # 這學期的日期不超過今天
    return (start + timedelta(days=rng.randint(0, max(0, (last - start).days)))).isoformat()


def make_achievements(sid, year, grade, study, attend):
    """一位學生的證照、比賽、作品 (certificates 列) 與獎懲 (student_records 列)"""
    rng = random.Random(f"{SEED}-achieve-{sid}")
    certs, records = [], []
    done = max(1, 2 * (grade - 1))  # 已經讀完幾學期 (一年級算 1，才有機會考第一張)

    def when():
        k = rng.randrange(done)
        return year + k // 2, k % 2 + 1

    # 證照：年級越高越多，成績好的多一張，成績差的少一張
    n = {1: 0, 2: 1, 3: 1, 4: 2, 5: 2}[grade] + rng.randint(0, 1) + (study == "good") - (study == "two_one")
    pool = [c for c in CERT_POOL if c[2] <= grade]
    for name, org, _ in rng.sample(pool, max(0, min(n, len(pool)))):
        y, h = when()
        certs.append({"kind": "證照", "name": name, "issuer": org, "number": f"{y}-{rng.randint(100000, 999999)}",
                      "issue_date": _date_in(rng, y, h), "award": None, "description": None, "status": "已通過"})
    # 比賽：大約一半的人參加過
    if rng.random() < (0.75 if study == "good" else 0.4):
        pool = [c for c in CONTEST_POOL if c[2] <= grade]
        for name, org, _, level in rng.sample(pool, min(len(pool), rng.choice([1, 1, 2]))):
            y, h = when()
            award = rng.choice(AWARDS[:4] if study == "good" else AWARDS)
            d = _date_in(rng, y, h)
            certs.append({"kind": "競賽", "name": name, "issuer": org, "number": None, "issue_date": d,
                          "award": award, "description": None, "status": "已通過"})
            if award in ("第一名", "第二名", "第三名"):
                big = level == "全國"
                records.append(("獎懲", "小功" if big else "嘉獎", 1 if big else 2 if award == "第一名" else 1,
                                f"參加{name}獲得{award}，為校爭光", f"{y}-{h}", d))
    # 作品
    if grade >= 2 and rng.random() < 0.35:
        pool = [w for w in WORK_POOL if w[2] <= grade and (w[2] < 5 or grade == 5)]
        name, desc, _ = rng.choice(pool)
        y, h = when()
        certs.append({"kind": "作品", "name": name, "issuer": "", "number": None, "issue_date": _date_in(rng, y, h),
                      "award": None, "description": desc, "status": "已通過"})
    # 這學期剛上傳、還沒審核的 (讓班導有東西可以審)
    if rng.random() < 0.15:
        name, org, _ = rng.choice([c for c in CERT_POOL if c[2] <= grade])
        certs.append({"kind": "證照", "name": name, "issuer": org, "number": f"{CURRENT_YEAR}-{rng.randint(100000, 999999)}",
                      "issue_date": "2026-10-03", "award": None, "description": None, "status": "待審核"})
    # 獎懲：好人好事、小過錯、曠課
    if rng.random() < 0.3:
        y, h = when()
        records.append(("獎懲", "嘉獎", 1, rng.choice(GOOD_DEEDS), f"{y}-{h}", _date_in(rng, y, h)))
    if rng.random() < 0.12:
        y, h = when()
        records.append(("獎懲", "申誡", 1, rng.choice(MINOR_FAULTS), f"{y}-{h}", _date_in(rng, y, h)))
    if attend in ("banned", "absent"):
        records.append(("獎懲", "小過" if attend == "absent" else "申誡", 1 if attend == "banned" else 2,
                        "無故曠課累計達規定節數", f"{CURRENT_YEAR}-1", "2026-10-08"))
    return certs, records


def assign_positions(class_name, grade, members):
    """members：[(學號, study, attend)]。這學期 (115-1) 的班級幹部與課程小老師；上學期當幹部的記一次嘉獎"""
    rng = random.Random(f"{SEED}-cadre-{class_name}")
    ok = [m for m in members if m[2] in ("full", "normal")]
    rng.shuffle(ok)
    rows = []
    for title, (sid, _, _) in zip(POSITIONS, ok):
        rows.append((sid, "幹部", title, 1, None, f"{CURRENT_YEAR}-1", "2026-09-14"))
    good = [m for m in ok if m[1] in ("good", "normal")]
    for course, (sid, _, _) in zip(ATTEND_COURSES[grade], rng.sample(good, min(len(good), len(ATTEND_COURSES[grade])))):
        rows.append((sid, "幹部", "課程小老師", 1, course, f"{CURRENT_YEAR}-1", "2026-09-14"))
    if grade >= 2:  # 上學期 (114-2) 的幹部 + 期末嘉獎
        rng.shuffle(ok)
        for title, (sid, _, _) in zip(POSITIONS[:4], ok):
            rows.append((sid, "幹部", title, 1, None, f"{CURRENT_YEAR - 1}-2", "2026-02-23"))
            rows.append((sid, "獎懲", "嘉獎", rng.choice([1, 2]), f"擔任{title}認真負責", f"{CURRENT_YEAR - 1}-2", "2026-06-19"))
    return rows


def plan(existing):
    """existing：{學號: {"full_name", "class_name"}} 資料庫裡已有的學生。回傳要寫入的資料"""
    rng = random.Random(SEED)
    used_names = set()  # 名字只依亂數種子決定，不受資料庫內容影響，重跑才認得出自己產生的學生
    out = {"students": [], "profiles": [], "grades": [], "attendance": [], "summary": [], "certs": [], "records": []}
    for class_name, year, start, target in CLASSES:
        grade = CURRENT_YEAR - year + 1
        # 名字與身分先依座號固定好，班上已有其他人佔用的座號就跳過
        slots = []
        for seat in range(start, start + 60):
            sid = f"{year}534{seat}"
            name = make_name(rng, used_names)
            slots.append((sid, name))
        ours = {sid for sid, _ in slots}
        legacy = [sid for sid, s in existing.items()
                  if s["class_name"] == class_name and not (sid in ours and s["full_name"] == dict(slots)[sid])]
        need = max(0, target - len(legacy))
        mix = FIVE_ZHONG if class_name == "資管五忠" else OTHER_MIX
        chosen = [(sid, name) for sid, name in slots
                  if sid not in existing or existing[sid]["full_name"] == name][:need]
        crng = random.Random(f"{SEED}-{class_name}")
        members = []
        for i, (sid, name) in enumerate(chosen):
            p = mix[i % len(mix)]
            out["students"].append((sid, name, DEPT_ID, year, class_name, f"09{crng.randint(10, 99)}-{crng.randint(100, 999)}-{crng.randint(100, 999)}"))
            grades = make_grades(crng, sid, year, p["study"])
            scores = [g[3] for g in grades]
            gpa = round(max(0.0, min(4.0, (sum(scores) / len(scores) - 55) / 10)), 2) if scores else None
            conduct = {"absent": 72, "banned": 78}.get(p["attend"], crng.randint(82, 92))
            out["profiles"].append((grade, gpa, conduct, p["identity"], sid))
            out["grades"] += grades
            out["attendance"] += make_attendance(crng, sid, grade, p["attend"])
            out["summary"].append((class_name, sid, name, p["identity"] or "", p["study"], p["attend"]))
            members.append((sid, p["study"], p["attend"]))
            certs, records = make_achievements(sid, year, grade, p["study"], p["attend"])
            out["certs"] += [(sid, c) for c in certs]
            out["records"] += [(sid, *r) for r in records]
        out["records"] += assign_positions(class_name, grade, members)
        out.setdefault("class_counts", []).append((class_name, len(legacy), len(chosen)))
    return out


def write_achievements(cur, ids, data):
    """證照、比賽、作品 → certificates；幹部、獎懲 → student_records。表或欄位還沒建好就略過並提示"""
    if not ids:
        return
    marks = ",".join(["%s"] * len(ids))
    try:
        cur.execute(f"DELETE FROM `certificates` WHERE `student_id` IN ({marks}) AND `file_name` = %s", (*ids, SEED_MARK))
        cur.executemany("""INSERT INTO `certificates` (`student_id`, `kind`, `cert_name`, `issuing_org`, `cert_number`, `issue_date`,
            `award`, `description`, `attachments`, `review_status`, `reviewer`, `reviewed_at`, `file_name`)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, '[]', %s, %s, %s, %s)""",
            [(sid, c["kind"], c["name"], c["issuer"], c["number"], c["issue_date"], c["award"], c["description"], c["status"],
              "示範資料" if c["status"] == "已通過" else None, c["issue_date"] if c["status"] == "已通過" else None, SEED_MARK)
             for sid, c in data["certs"]])
    except Exception as e:
        print(f"   (略過證照與比賽：{e}；請先執行 python init_db.py)")
    try:
        cur.execute(f"DELETE FROM `student_records` WHERE `student_id` IN ({marks})", ids)
        cur.executemany("""INSERT INTO `student_records` (`student_id`, `kind`, `item`, `count`, `reason`, `semester`, `record_date`)
            VALUES (%s, %s, %s, %s, %s, %s, %s)""", data["records"])
    except Exception as e:
        print(f"   (略過獎懲與幹部：{e}；請先執行 python init_db.py)")


def write(conn, data):
    cur = conn.cursor()
    cur.executemany("""INSERT IGNORE INTO `course_map` (`course_id`, `course_name`, `credits`, `prerequisite_id`, `is_required`,
        `course_type`, `dept_id`, `semester_suggest`, `description`) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""", EXTRA_COURSES)
    for old, new in RENAMES:
        for sql in ("UPDATE `students` SET `class_name` = %s WHERE `class_name` = %s",
                    "UPDATE `users` SET `advised_class` = %s WHERE `advised_class` = %s",
                    "UPDATE `class_schedule` SET `class_name` = %s WHERE `class_name` = %s",
                    "UPDATE `announcements` SET `target_class` = %s WHERE `target_class` = %s",
                    "UPDATE `assignments` SET `class_name` = %s WHERE `class_name` = %s",
                    "UPDATE `class_groups` SET `class_name` = %s WHERE `class_name` = %s"):
            try:
                cur.execute(sql, (new, old))
            except Exception as e:  # 表還沒建立或新名稱已存在：略過
                print(f"   (略過 {sql.split('`')[1]}：{e})")
    cur.executemany("""INSERT INTO `students` (`student_id`, `full_name`, `dept_id`, `admission_year`, `class_name`, `parent_phone`)
        VALUES (%s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE `class_name` = VALUES(`class_name`), `admission_year` = VALUES(`admission_year`)""",
                    data["students"])
    cur.executemany("UPDATE `students` SET `grade_level` = %s, `gpa` = %s, `conduct_score` = %s, `identity_type` = %s WHERE `student_id` = %s",
                    data["profiles"])
    ids = [s[0] for s in data["students"]]
    if ids:
        marks = ",".join(["%s"] * len(ids))
        cur.execute(f"DELETE FROM `student_credits` WHERE `student_id` IN ({marks})", ids)
        cur.execute(f"DELETE FROM `attendance_records` WHERE `student_id` IN ({marks})", ids)
    cur.executemany("INSERT INTO `student_credits` (`student_id`, `course_id`, `semester`, `score`, `is_passed`) VALUES (%s, %s, %s, %s, %s)",
                    data["grades"])
    cur.executemany("INSERT INTO `attendance_records` (`student_id`, `date`, `course_name`, `type`, `notified`) VALUES (%s, %s, %s, %s, 1)",
                    data["attendance"])
    write_achievements(cur, ids, data)
    cur.executemany("""INSERT IGNORE INTO `users` (`username`, `password_hash`, `role`, `student_id`, `full_name`, `advised_class`)
        VALUES (%s, %s, '學生', %s, %s, NULL)""", [(s[0], PASSWORD_HASH_123456, s[0], s[1]) for s in data["students"]])
    cur.executemany("""INSERT IGNORE INTO `users` (`username`, `password_hash`, `role`, `student_id`, `full_name`, `advised_class`)
        VALUES (%s, %s, '老師', NULL, %s, %s)""", [(u, PASSWORD_HASH_123456, n, c) for u, n, c in EXTRA_TEACHERS])
    try:
        from werkzeug.security import generate_password_hash
        pw = generate_password_hash(CLASS_PASSWORD)
        cur.executemany("INSERT IGNORE INTO `class_groups` (`class_name`, `password_hash`, `created_by`) VALUES (%s, %s, '系統')",
                        [(c[0], pw) for c in CLASSES])
    except Exception as e:
        print(f"   (略過 class_groups：{e})")
    conn.commit()
    cur.close()


def main():
    dry = "--dry-run" in sys.argv
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    conn = None
    existing = {}
    if not dry:
        import mysql.connector
        from seed_data import DB_CONFIG
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor(dictionary=True)
        for old, new in RENAMES:
            cur.execute("UPDATE `students` SET `class_name` = %s WHERE `class_name` = %s", (new, old))
        cur.execute("SELECT student_id, full_name, class_name FROM students")
        existing = {r["student_id"]: r for r in cur.fetchall()}
        cur.close()
    data = plan(existing)
    print("=" * 60)
    print("🏫 示範班級資料" + (" (只預覽，不寫入)" if dry else ""))
    for class_name, legacy, new in data["class_counts"]:
        print(f"   {class_name}：原本 {legacy} 人 + 產生 {new} 人 = {legacy + new} 人")
    print(f"   成績 {len(data['grades'])} 筆、缺曠 {len(data['attendance'])} 筆")
    kinds = [c["kind"] for _, c in data["certs"]]
    items = [r[2] for r in data["records"]]
    print(f"   證照 {kinds.count('證照')} 筆、比賽 {kinds.count('競賽')} 筆、作品 {kinds.count('作品')} 筆、"
          f"幹部 {sum(1 for r in data['records'] if r[1] == '幹部')} 筆 (小老師 {items.count('課程小老師')})、"
          f"獎懲 {sum(1 for r in data['records'] if r[1] == '獎懲')} 筆")
    if dry:
        label = {"good": "成績好", "normal": "", "retake": "需重補修", "two_one": "學業要注意",
                 "full": "全勤", "warning": "快扣考", "banned": "已扣考", "absent": "幾乎沒來"}
        for c, sid, name, ident, study, attend in data["summary"]:
            if c == "資管五忠":
                print(f"   {sid} {name} {ident} {label[study]} {label[attend]}".rstrip())
        return
    write(conn, data)
    conn.close()
    print("✅ 完成。學生帳號 = 學號，密碼 123456；五孝導師帳號 teacher2 / 123456")


if __name__ == "__main__":
    main()
