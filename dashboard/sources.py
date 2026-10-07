"""
儀表板資料來源層 (Data Source Layer)

課表、公告、作業、請假四種資料都經過 DashboardSource 介面，summary.py 與 Flask API
不直接碰資料庫。學校日後提供教務系統、數位學習平台或請假系統的 API 時，
新增一個實作本介面的類別，並在 app.py 的 get_dashboard_source() 改為回傳它即可。

各方法回傳 dict 列表，日期欄位一律為字串 ("YYYY-MM-DD" 或 "YYYY-MM-DD HH:MM")。
"""
from datetime import date, datetime


class DashboardSource:
    """儀表板資料來源介面"""

    name = "base"

    def list_schedule(self, class_name, student_id):
        """整班課表 + 該生個人加選 (重補修)"""
        raise NotImplementedError

    def list_announcements(self, class_name, student_id):
        """全校與該班公告 (新到舊)，每筆含 is_read"""
        raise NotImplementedError

    def mark_announcement_read(self, student_id, announcement_id):
        """標記公告為已讀；公告不存在回傳 False"""
        raise NotImplementedError

    def list_assignments(self, class_name, student_id):
        """整班與個人作業 (依截止時間排序)，每筆含 submitted"""
        raise NotImplementedError

    def list_leave_requests(self, student_id):
        """該生請假紀錄 (新到舊)"""
        raise NotImplementedError

    def add_leave_request(self, student_id, leave_type, start_date, end_date, periods, reason):
        """新增一筆待審核假單，回傳新紀錄"""
        raise NotImplementedError

    def get_leave_request(self, leave_id):
        """單筆假單；不存在回傳 None"""
        raise NotImplementedError

    def list_leave_requests_for_review(self, student_ids=None, status=None):
        """審核用清單：student_ids 為 None 代表全校；status 為 None 代表不限狀態 (新到舊)"""
        raise NotImplementedError

    def review_leave_request(self, leave_id, status, review_note):
        """審核待審核的假單；假單不是待審核狀態時回傳 False (避免重複審核)"""
        raise NotImplementedError

    def cancel_leave_request(self, leave_id, student_id):
        """學生撤回自己尚未審核的假單；回傳是否撤回成功"""
        raise NotImplementedError


LEAVE_PENDING = "待審核"


def _fmt(value, with_time=False):
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M" if with_time else "%Y-%m-%d")
    if isinstance(value, date):
        return value.strftime("%Y-%m-%d")
    return value


def _for_student(row, class_name, student_id):
    return (row.get("class_name") and row["class_name"] == class_name) or \
        (row.get("student_id") and row["student_id"] == student_id)


class MemoryDashboardSource(DashboardSource):
    """示範模式：資料存於記憶體 (MySQL 離線時使用，重啟後已讀狀態會重設)"""

    name = "memory"

    def __init__(self, schedule, announcements, reads, assignments, submissions, leave_requests):
        self._schedule = schedule
        self._announcements = announcements
        self._reads = reads
        self._assignments = assignments
        self._submissions = submissions
        self._leave_requests = leave_requests

    def list_schedule(self, class_name, student_id):
        rows = [dict(r) for r in self._schedule if _for_student(r, class_name, student_id)]
        return sorted(rows, key=lambda r: (r["weekday"], r["period_start"]))

    def list_announcements(self, class_name, student_id):
        read_ids = {r["announcement_id"] for r in self._reads if r["student_id"] == student_id}
        rows = [
            {**a, "is_read": a["id"] in read_ids}
            for a in self._announcements
            if a["target_class"] is None or a["target_class"] == class_name
        ]
        return sorted(rows, key=lambda a: (a["publish_date"], a["id"]), reverse=True)

    def mark_announcement_read(self, student_id, announcement_id):
        if not any(a["id"] == announcement_id for a in self._announcements):
            return False
        if not any(r["student_id"] == student_id and r["announcement_id"] == announcement_id for r in self._reads):
            self._reads.append({"student_id": student_id, "announcement_id": announcement_id})
        return True

    def list_assignments(self, class_name, student_id):
        done_ids = {s["assignment_id"] for s in self._submissions if s["student_id"] == student_id}
        rows = [
            {**a, "submitted": a["id"] in done_ids}
            for a in self._assignments
            if _for_student(a, class_name, student_id)
        ]
        return sorted(rows, key=lambda a: a["due_at"])

    def list_leave_requests(self, student_id):
        rows = [dict(r) for r in self._leave_requests if r["student_id"] == student_id]
        return sorted(rows, key=lambda r: r["submitted_at"], reverse=True)

    def add_leave_request(self, student_id, leave_type, start_date, end_date, periods, reason):
        record = {
            "id": max((r["id"] for r in self._leave_requests), default=0) + 1,
            "student_id": student_id, "leave_type": leave_type, "start_date": start_date, "end_date": end_date,
            "periods": periods, "reason": reason, "status": LEAVE_PENDING, "review_note": "",
            "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        self._leave_requests.append(record)
        return dict(record)

    def get_leave_request(self, leave_id):
        row = next((r for r in self._leave_requests if r["id"] == leave_id), None)
        return dict(row) if row else None

    def list_leave_requests_for_review(self, student_ids=None, status=None):
        rows = [dict(r) for r in self._leave_requests
                if (student_ids is None or r["student_id"] in student_ids) and (status is None or r["status"] == status)]
        return sorted(rows, key=lambda r: r["submitted_at"], reverse=True)

    def review_leave_request(self, leave_id, status, review_note):
        row = next((r for r in self._leave_requests if r["id"] == leave_id), None)
        if not row or row["status"] != LEAVE_PENDING:
            return False
        row.update(status=status, review_note=review_note)
        return True

    def cancel_leave_request(self, leave_id, student_id):
        row = next((r for r in self._leave_requests
                    if r["id"] == leave_id and r["student_id"] == student_id and r["status"] == LEAVE_PENDING), None)
        if not row:
            return False
        self._leave_requests.remove(row)
        return True


class MySQLDashboardSource(DashboardSource):
    """讀寫 MySQL 的 class_schedule / announcements / assignments / leave_requests 等資料表；
    connect 為回傳連線 (或 None) 的函式"""

    name = "mysql"

    def __init__(self, connect):
        self._connect = connect

    def is_available(self):
        """MySQL 可連線且儀表板資料表已建立"""
        try:
            self._query("SELECT 1 FROM class_schedule LIMIT 1")
            self._query("SELECT 1 FROM leave_requests LIMIT 1")
            return True
        except Exception:
            return False

    def _query(self, sql, params=(), write=False):
        conn = self._connect()
        if not conn:
            raise ConnectionError("MySQL 無法連線")
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, params)
            if write:
                conn.commit()
                result = cursor.rowcount
            else:
                result = cursor.fetchall()
            cursor.close()
            return result
        finally:
            conn.close()

    def list_schedule(self, class_name, student_id):
        return self._query("""
            SELECT id, class_name, student_id, weekday, period_start, period_end, course_name, classroom, teacher
            FROM class_schedule
            WHERE class_name = %s OR student_id = %s
            ORDER BY weekday, period_start
        """, (class_name, student_id))

    def list_announcements(self, class_name, student_id):
        rows = self._query("""
            SELECT a.id, a.title, a.content, a.office, a.publish_date, a.target_class, a.url,
                   (r.announcement_id IS NOT NULL) AS is_read
            FROM announcements a
            LEFT JOIN announcement_reads r ON r.announcement_id = a.id AND r.student_id = %s
            WHERE a.target_class IS NULL OR a.target_class = %s
            ORDER BY a.publish_date DESC, a.id DESC
        """, (student_id, class_name))
        return [{**r, "publish_date": _fmt(r["publish_date"]), "is_read": bool(r["is_read"])} for r in rows]

    def mark_announcement_read(self, student_id, announcement_id):
        if not self._query("SELECT id FROM announcements WHERE id = %s", (announcement_id,)):
            return False
        self._query(
            "INSERT IGNORE INTO announcement_reads (student_id, announcement_id) VALUES (%s, %s)",
            (student_id, announcement_id), write=True
        )
        return True

    def list_assignments(self, class_name, student_id):
        rows = self._query("""
            SELECT a.id, a.class_name, a.student_id, a.course_name, a.title, a.due_at, a.url,
                   (s.assignment_id IS NOT NULL) AS submitted
            FROM assignments a
            LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = %s
            WHERE a.class_name = %s OR a.student_id = %s
            ORDER BY a.due_at
        """, (student_id, class_name, student_id))
        return [{**r, "due_at": _fmt(r["due_at"], with_time=True), "submitted": bool(r["submitted"])} for r in rows]

    _LEAVE_COLUMNS = "id, student_id, leave_type, start_date, end_date, periods, reason, status, review_note, submitted_at"

    @staticmethod
    def _leave_row(r):
        return {
            **r,
            "start_date": _fmt(r["start_date"]),
            "end_date": _fmt(r["end_date"]),
            "submitted_at": _fmt(r["submitted_at"], with_time=True)
        }

    def list_leave_requests(self, student_id):
        rows = self._query(f"""
            SELECT {self._LEAVE_COLUMNS}
            FROM leave_requests
            WHERE student_id = %s
            ORDER BY submitted_at DESC
        """, (student_id,))
        return [self._leave_row(r) for r in rows]

    def add_leave_request(self, student_id, leave_type, start_date, end_date, periods, reason):
        conn = self._connect()
        if not conn:
            raise ConnectionError("MySQL 無法連線")
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, periods, reason, status, submitted_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            """, (student_id, leave_type, start_date, end_date, periods, reason, LEAVE_PENDING))
            conn.commit()
            new_id = cursor.lastrowid
            cursor.close()
        finally:
            conn.close()
        return self.get_leave_request(new_id)

    def get_leave_request(self, leave_id):
        rows = self._query(f"SELECT {self._LEAVE_COLUMNS} FROM leave_requests WHERE id = %s", (leave_id,))
        return self._leave_row(rows[0]) if rows else None

    def list_leave_requests_for_review(self, student_ids=None, status=None):
        if student_ids is not None and not student_ids:
            return []
        where, params = [], []
        if student_ids is not None:
            where.append(f"student_id IN ({', '.join(['%s'] * len(student_ids))})")
            params.extend(student_ids)
        if status is not None:
            where.append("status = %s")
            params.append(status)
        rows = self._query(f"""
            SELECT {self._LEAVE_COLUMNS} FROM leave_requests
            {'WHERE ' + ' AND '.join(where) if where else ''}
            ORDER BY submitted_at DESC
        """, tuple(params))
        return [self._leave_row(r) for r in rows]

    def review_leave_request(self, leave_id, status, review_note):
        # WHERE status = 待審核：兩位審核者同時送出時只有第一位生效
        return self._query(
            "UPDATE leave_requests SET status = %s, review_note = %s WHERE id = %s AND status = %s",
            (status, review_note, leave_id, LEAVE_PENDING), write=True
        ) == 1

    def cancel_leave_request(self, leave_id, student_id):
        return self._query(
            "DELETE FROM leave_requests WHERE id = %s AND student_id = %s AND status = %s",
            (leave_id, student_id, LEAVE_PENDING), write=True
        ) == 1
