"""
缺曠課資料來源層 (Data Source Layer)

所有缺曠課資料的讀寫都經過 AttendanceSource 介面，上層的扣考判定 (policy.py)、
寄信通知 (notify.py) 與 Flask API 都不直接碰資料庫。

學校日後若提供缺曠課 API：
  1. 實作 SchoolApiAttendanceSource 的各個方法 (呼叫學校 API 並轉成下方的紀錄格式)
  2. 在 app.py 的 get_attendance_source() 改為回傳它
其餘程式不需修改。

紀錄格式 (dict)：
  {"id": int, "student_id": str, "date": "YYYY-MM-DD", "course_name": str,
   "type": "曠課" | "遲到" | "病假", "notified": bool}
"""
from datetime import date, datetime

VALID_TYPES = ("曠課", "遲到", "病假")


class AttendanceSource:
    """缺曠課資料來源介面"""

    name = "base"

    def list_records(self, student_id=None):
        """回傳紀錄列表 (依日期新到舊)；student_id 為 None 時回傳全部"""
        raise NotImplementedError

    def list_unnotified(self):
        """回傳尚未寄出通知 (notified = 0) 的紀錄"""
        raise NotImplementedError

    def mark_notified(self, record_ids):
        """將紀錄標記為已通知"""
        raise NotImplementedError

    def add_record(self, student_id, record_date, course_name, record_type):
        """新增一筆紀錄並回傳它 (僅模擬展示用；正式介接學校 API 時通常不支援)"""
        raise NotImplementedError


def _normalize(row):
    item = dict(row)
    if isinstance(item.get("date"), (date, datetime)):
        item["date"] = item["date"].strftime("%Y-%m-%d")
    item["notified"] = bool(item.get("notified"))
    return item


class MemoryAttendanceSource(AttendanceSource):
    """示範模式：紀錄存於記憶體 (MySQL 離線時使用，重啟後新增的紀錄會消失)"""

    name = "memory"

    def __init__(self, records):
        self._records = records

    def list_records(self, student_id=None):
        rows = [r for r in self._records if student_id is None or r["student_id"] == student_id]
        return [_normalize(r) for r in sorted(rows, key=lambda r: (r["date"], r["id"]), reverse=True)]

    def list_unnotified(self):
        return [_normalize(r) for r in self._records if not r["notified"]]

    def mark_notified(self, record_ids):
        ids = set(record_ids)
        for r in self._records:
            if r["id"] in ids:
                r["notified"] = True

    def add_record(self, student_id, record_date, course_name, record_type):
        record = {
            "id": max([r["id"] for r in self._records], default=0) + 1,
            "student_id": student_id,
            "date": record_date,
            "course_name": course_name,
            "type": record_type,
            "notified": False
        }
        self._records.append(record)
        return _normalize(record)


class MySQLAttendanceSource(AttendanceSource):
    """讀寫 MySQL 的 attendance_records 資料表；connect 為回傳連線 (或 None) 的函式"""

    name = "mysql"

    def __init__(self, connect):
        self._connect = connect

    def is_available(self):
        """MySQL 可連線且 attendance_records 已建立"""
        try:
            self._query("SELECT 1 FROM attendance_records LIMIT 1")
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
                result = cursor.lastrowid
            else:
                result = cursor.fetchall()
            cursor.close()
            return result
        finally:
            conn.close()

    def list_records(self, student_id=None):
        sql = "SELECT id, student_id, date, course_name, type, notified FROM attendance_records"
        params = ()
        if student_id is not None:
            sql += " WHERE student_id = %s"
            params = (student_id,)
        sql += " ORDER BY date DESC, id DESC"
        return [_normalize(r) for r in self._query(sql, params)]

    def list_unnotified(self):
        rows = self._query("SELECT id, student_id, date, course_name, type, notified FROM attendance_records WHERE notified = 0")
        return [_normalize(r) for r in rows]

    def mark_notified(self, record_ids):
        if not record_ids:
            return
        placeholders = ", ".join(["%s"] * len(record_ids))
        self._query(f"UPDATE attendance_records SET notified = 1 WHERE id IN ({placeholders})", tuple(record_ids), write=True)

    def add_record(self, student_id, record_date, course_name, record_type):
        new_id = self._query(
            "INSERT INTO attendance_records (student_id, date, course_name, type, notified) VALUES (%s, %s, %s, %s, 0)",
            (student_id, record_date, course_name, record_type),
            write=True
        )
        return {"id": new_id, "student_id": student_id, "date": record_date,
                "course_name": course_name, "type": record_type, "notified": False}


class SchoolApiAttendanceSource(AttendanceSource):
    """
    TODO: 學校提供缺曠課 API 後實作此類別。

    - list_records / list_unnotified：呼叫學校 API，並將回傳欄位轉成本模組的紀錄格式
    - mark_notified：學校 API 通常不會記錄「本系統是否已寄信」，
      可在本地 attendance_records (或另建一張 notified 對照表) 記錄已通知的紀錄編號
    - add_record：正式資料由學校系統產生，維持 NotImplementedError 即可
    """

    name = "school_api"

    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
