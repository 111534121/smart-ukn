"""
學生與 Moodle 帳號的連結 (只存權杖，不存密碼)

MySQL 可用時存在 moodle_links 資料表，否則存在記憶體 (伺服器重開就要重新連結)。
"""
from datetime import datetime

CREATE_TABLE_SQL = """
    CREATE TABLE IF NOT EXISTS `moodle_links` (
      `student_id` varchar(20) NOT NULL,
      `moodle_username` varchar(100) NOT NULL,
      `moodle_fullname` varchar(100) DEFAULT NULL,
      `token` varchar(255) NOT NULL,
      `linked_at` datetime NOT NULL,
      PRIMARY KEY (`student_id`),
      CONSTRAINT `fk_moodle_links_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""


class MoodleLinkStore:
    def __init__(self, connect):
        self._connect = connect
        self._memory = {}
        self._table_ready = False

    def _run(self, sql, params=(), fetch=False):
        """回傳查詢結果；MySQL 無法使用時回傳 None 由呼叫端改用記憶體"""
        conn = self._connect()
        if not conn:
            return None
        try:
            cursor = conn.cursor(dictionary=True)
            if not self._table_ready:
                cursor.execute(CREATE_TABLE_SQL)
                self._table_ready = True
            cursor.execute(sql, params)
            result = cursor.fetchall() if fetch else True
            conn.commit()
            cursor.close()
            return result
        except Exception:
            return None
        finally:
            conn.close()

    def get(self, student_id):
        rows = self._run("SELECT * FROM moodle_links WHERE student_id = %s", (student_id,), fetch=True)
        if rows is None:
            return self._memory.get(student_id)
        return rows[0] if rows else None

    def save(self, student_id, moodle_username, moodle_fullname, token):
        link = {"student_id": student_id, "moodle_username": moodle_username, "moodle_fullname": moodle_fullname,
                "token": token, "linked_at": datetime.now().strftime("%Y-%m-%d %H:%M")}
        ok = self._run("""
            INSERT INTO moodle_links (student_id, moodle_username, moodle_fullname, token, linked_at)
            VALUES (%(student_id)s, %(moodle_username)s, %(moodle_fullname)s, %(token)s, %(linked_at)s)
            ON DUPLICATE KEY UPDATE moodle_username = VALUES(moodle_username), moodle_fullname = VALUES(moodle_fullname),
                token = VALUES(token), linked_at = VALUES(linked_at)
        """, link)
        if ok is None:
            self._memory[student_id] = link

    def delete(self, student_id):
        self._memory.pop(student_id, None)
        self._run("DELETE FROM moodle_links WHERE student_id = %s", (student_id,))
