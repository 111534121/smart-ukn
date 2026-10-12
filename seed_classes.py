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

# 補兩門 114-2 的選修課，讓每學期至少兩門課 (二一預警才算得出 1/2)
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
#   identity：身分別 (逗號分隔可多個)；study：good 優秀 / normal 一般 / retake 需重補修 / two_one 二一預警
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


def plan(existing):
    """existing：{學號: {"full_name", "class_name"}} 資料庫裡已有的學生。回傳要寫入的資料"""
    rng = random.Random(SEED)
    used_names = set()  # 名字只依亂數種子決定，不受資料庫內容影響，重跑才認得出自己產生的學生
    out = {"students": [], "profiles": [], "grades": [], "attendance": [], "summary": []}
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
        out.setdefault("class_counts", []).append((class_name, len(legacy), len(chosen)))
    return out


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
    if dry:
        label = {"good": "成績好", "normal": "", "retake": "需重補修", "two_one": "二一預警",
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
