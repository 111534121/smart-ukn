"""
把自己的真實資料 (my_data.json) 匯入 MySQL，取代示範資料。

用法：
    1. 複製 my_data.example.json 為 my_data.json，填入自己的資料 (my_data.json 已列入 .gitignore，不會推上 GitHub)
    2. 先執行過 init_db.py 與 seed_data.py
    3. python import_my_data.py            (或 python import_my_data.py 其他檔名.json)

規則：
    - student / account 必填；其他區塊沒寫就不動資料庫裡原本的資料
    - 有寫的區塊會「整批取代」：先刪掉這位學生原本的資料再寫入，所以可以改完 JSON 重複執行
    - schedule 視為整個班級的課表，會連同示範資料裡同班級的課表一起取代
    - assignments 會連同示範資料裡同班級的作業一起取代
    - 全部在同一個交易內完成，任何一筆錯誤都不會寫入
"""
import json
import os
import sys

import mysql.connector
from werkzeug.security import generate_password_hash

from dashboard.demo_data import PERIOD_TIMES

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "smart_ukn"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "charset": "utf8mb4"
}

PASS_SCORE = 60
COURSE_TYPES = ("專業必修", "專業選修", "通識教育", "共同必修")
ATTENDANCE_TYPES = ("曠課", "遲到", "病假")
LEAVE_TYPES = ("病假", "事假", "公假", "喪假", "生理假")
LEAVE_STATUSES = ("待審核", "已核准", "已退回")


class DataError(Exception):
    pass


def require(item, keys, where):
    missing = [k for k in keys if item.get(k) in (None, "")]
    if missing:
        raise DataError(f"{where} 缺少欄位：{', '.join(missing)}")


def validate(data):
    require(data.get("student", {}), ("student_id", "full_name", "dept_id", "admission_year", "class_name"), "student")
    require(data.get("account", {}), ("username", "password"), "account")
    if data.get("parent_account"):
        require(data["parent_account"], ("username", "password", "full_name"), "parent_account")
    for i, c in enumerate(data.get("courses", []), 1):
        require(c, ("course_id", "course_name", "credits", "course_type"), f"courses 第 {i} 筆")
        if c["course_type"] not in COURSE_TYPES:
            raise DataError(f"courses 第 {i} 筆 course_type 只能是：{'、'.join(COURSE_TYPES)}")
    for i, c in enumerate(data.get("credits", []), 1):
        require(c, ("course_id", "semester", "score"), f"credits 第 {i} 筆")
    for i, s in enumerate(data.get("schedule", []), 1):
        require(s, ("weekday", "period_start", "period_end", "course_name"), f"schedule 第 {i} 筆")
        if not 1 <= int(s["weekday"]) <= 7:
            raise DataError(f"schedule 第 {i} 筆 weekday 要是 1 (週一) ~ 7 (週日)")
        if s["period_start"] not in PERIOD_TIMES or s["period_end"] not in PERIOD_TIMES or s["period_start"] > s["period_end"]:
            raise DataError(f"schedule 第 {i} 筆節次要在 {min(PERIOD_TIMES)} ~ {max(PERIOD_TIMES)} 之間，且開始 ≤ 結束")
    for i, a in enumerate(data.get("assignments", []), 1):
        require(a, ("course_name", "title", "due_at"), f"assignments 第 {i} 筆")
    for i, r in enumerate(data.get("attendance", []), 1):
        require(r, ("date", "course_name", "type"), f"attendance 第 {i} 筆")
        if r["type"] not in ATTENDANCE_TYPES:
            raise DataError(f"attendance 第 {i} 筆 type 只能是：{'、'.join(ATTENDANCE_TYPES)}")
    for i, r in enumerate(data.get("leave_requests", []), 1):
        require(r, ("leave_type", "start_date", "end_date", "submitted_at"), f"leave_requests 第 {i} 筆")
        if r["leave_type"] not in LEAVE_TYPES:
            raise DataError(f"leave_requests 第 {i} 筆 leave_type 只能是：{'、'.join(LEAVE_TYPES)}")
        if r.get("status", "待審核") not in LEAVE_STATUSES:
            raise DataError(f"leave_requests 第 {i} 筆 status 只能是：{'、'.join(LEAVE_STATUSES)}")


def upsert_account(cur, username, password, role, student_id, full_name):
    """帳號已存在就更新密碼與綁定的學號，不存在就新增"""
    cur.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    row = cur.fetchone()
    pw = generate_password_hash(password)
    if row:
        cur.execute("UPDATE users SET password_hash = %s, role = %s, student_id = %s, full_name = %s WHERE user_id = %s",
                    (pw, role, student_id, full_name, row[0]))
    else:
        cur.execute("INSERT INTO users (username, password_hash, role, student_id, full_name) VALUES (%s, %s, %s, %s, %s)",
                    (username, pw, role, student_id, full_name))


def import_data(cur, data):
    st = data["student"]
    sid, cls = st["student_id"], st["class_name"]
    summary = []

    cur.execute("SELECT dept_id FROM departments")
    depts = [r[0] for r in cur.fetchall()]
    if st["dept_id"] not in depts:
        raise DataError(f"student.dept_id「{st['dept_id']}」不存在，可用：{', '.join(depts)}")

    cur.execute("""
        INSERT INTO students (student_id, full_name, dept_id, admission_year, class_name, parent_phone,
                              grade_level, gpa, conduct_score, identity_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), dept_id = VALUES(dept_id),
            admission_year = VALUES(admission_year), class_name = VALUES(class_name), parent_phone = VALUES(parent_phone),
            grade_level = VALUES(grade_level), gpa = VALUES(gpa), conduct_score = VALUES(conduct_score),
            identity_type = VALUES(identity_type)
    """, (sid, st["full_name"], st["dept_id"], st["admission_year"], cls, st.get("parent_phone"),
          st.get("grade_level"), st.get("gpa"), st.get("conduct_score"), st.get("identity_type") or None))
    summary.append(f"學生 {sid} {st['full_name']}（{cls}）")

    acc = data["account"]
    upsert_account(cur, acc["username"], acc["password"], "學生", sid, st["full_name"])
    summary.append(f"學生帳號 {acc['username']}")
    if data.get("parent_account"):
        p = data["parent_account"]
        upsert_account(cur, p["username"], p["password"], "家長", sid, p["full_name"])
        summary.append(f"家長帳號 {p['username']}")

    if "courses" in data:
        for c in data["courses"]:
            cur.execute("""
                INSERT INTO course_map (course_id, course_name, credits, prerequisite_id, is_required, course_type, dept_id, semester_suggest)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE course_name = VALUES(course_name), credits = VALUES(credits),
                    prerequisite_id = VALUES(prerequisite_id), is_required = VALUES(is_required),
                    course_type = VALUES(course_type), dept_id = VALUES(dept_id), semester_suggest = VALUES(semester_suggest)
            """, (c["course_id"], c["course_name"], c["credits"], c.get("prerequisite_id"),
                  1 if c.get("is_required", c["course_type"] in ("專業必修", "共同必修")) else 0,
                  c["course_type"], c.get("dept_id", st["dept_id"]), c.get("semester_suggest")))
        summary.append(f"課程地圖 {len(data['courses'])} 門")

    if "credits" in data:
        cur.execute("SELECT course_id FROM course_map")
        known = {r[0] for r in cur.fetchall()}
        unknown = sorted({c["course_id"] for c in data["credits"]} - known)
        if unknown:
            raise DataError(f"credits 裡的課程代碼不在課程地圖：{', '.join(unknown)}（請先加到 courses 區塊）")
        cur.execute("DELETE FROM student_credits WHERE student_id = %s", (sid,))
        cur.executemany(
            "INSERT INTO student_credits (student_id, course_id, semester, score, is_passed) VALUES (%s, %s, %s, %s, %s)",
            [(sid, c["course_id"], c["semester"], c["score"], 1 if float(c["score"]) >= PASS_SCORE else 0) for c in data["credits"]])
        summary.append(f"修課成績 {len(data['credits'])} 筆")

    if "schedule" in data:
        cur.execute("DELETE FROM class_schedule WHERE class_name = %s OR student_id = %s", (cls, sid))
        cur.executemany("""
            INSERT INTO class_schedule (class_name, student_id, weekday, period_start, period_end, course_name, classroom, teacher)
            VALUES (%s, NULL, %s, %s, %s, %s, %s, %s)
        """, [(cls, s["weekday"], s["period_start"], s["period_end"], s["course_name"], s.get("classroom"), s.get("teacher"))
              for s in data["schedule"]])
        summary.append(f"{cls} 課表 {len(data['schedule'])} 堂")

    if "assignments" in data:
        cur.execute("DELETE FROM assignments WHERE class_name = %s OR student_id = %s", (cls, sid))
        for a in data["assignments"]:
            cur.execute("INSERT INTO assignments (class_name, student_id, course_name, title, due_at, url) VALUES (NULL, %s, %s, %s, %s, %s)",
                        (sid, a["course_name"], a["title"], a["due_at"], a.get("url") or "#"))
            if a.get("submitted"):
                cur.execute("INSERT INTO assignment_submissions (student_id, assignment_id) VALUES (%s, %s)", (sid, cur.lastrowid))
        summary.append(f"作業 {len(data['assignments'])} 份")

    if "attendance" in data:
        cur.execute("DELETE FROM attendance_records WHERE student_id = %s", (sid,))
        cur.executemany("INSERT INTO attendance_records (student_id, date, course_name, type, notified) VALUES (%s, %s, %s, %s, 1)",
                        [(sid, r["date"], r["course_name"], r["type"]) for r in data["attendance"]])
        summary.append(f"缺曠紀錄 {len(data['attendance'])} 筆")

    if "leave_requests" in data:
        cur.execute("DELETE FROM leave_requests WHERE student_id = %s", (sid,))
        cur.executemany("""
            INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, periods, reason, status, review_note, submitted_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, [(sid, r["leave_type"], r["start_date"], r["end_date"], r.get("periods"), r.get("reason"),
               r.get("status", "待審核"), r.get("review_note", ""), r["submitted_at"]) for r in data["leave_requests"]])
        summary.append(f"請假紀錄 {len(data['leave_requests'])} 筆")

    return summary


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "my_data.json"
    if not os.path.exists(path):
        print(f"❌ 找不到 {path}。請先複製 my_data.example.json 為 my_data.json 並填入自己的資料。")
        return 1
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        validate(data)
    except json.JSONDecodeError as e:
        print(f"❌ {path} 格式錯誤：第 {e.lineno} 行第 {e.colno} 個字附近（{e.msg}）")
        return 1
    except DataError as e:
        print(f"❌ {e}")
        return 1

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
    except mysql.connector.Error as e:
        print(f"❌ 無法連線 MySQL (port {DB_CONFIG['port']})：{e}\n   請確認 XAMPP 的 MySQL 已啟動，port 不是 3306 時要設定 DB_PORT。")
        return 1
    cur = conn.cursor()
    try:
        summary = import_data(cur, data)
        conn.commit()
    except (DataError, mysql.connector.Error) as e:
        conn.rollback()
        print(f"❌ 匯入失敗，資料庫沒有任何變更：{e}")
        return 1
    finally:
        cur.close()
        conn.close()

    print("✅ 匯入完成：")
    for line in summary:
        print(f"   • {line}")
    print(f"   用帳號「{data['account']['username']}」登入網站即可看到自己的資料。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
