"""增量建立宿舍與行政案件資料表並搬移舊 JSON；不重建其他資料表。"""
import json
from pathlib import Path
from campus.dorm_store import CREATE_TABLE_SQL, FIELDS
from campus.admin_case_store import CREATE_TABLE_SQL as ADMIN_CASE_TABLE_SQL


def upgrade_columns(cursor):
    cursor.execute("ALTER TABLE users MODIFY role enum('學生','家長','教職員','老師','管理員','訪客','處室承辦','科助','住宿管理員','系統管理員','內容管理員') NOT NULL")
    for table, column, definition in (
        ('attendance_records', 'hours', 'decimal(7,2) DEFAULT NULL'),
        ('attendance_records', 'exam_policy', "varchar(20) NOT NULL DEFAULT 'ordinary'"),
        ('course_map', 'semester_hours', 'decimal(8,2) DEFAULT NULL'),
        ('class_schedule', 'activity_type', "varchar(20) NOT NULL DEFAULT 'class'"),
        ('class_schedule', 'allow_retake_overlap', 'tinyint(1) NOT NULL DEFAULT 0'),
        ('users', 'can_manage_dorm', 'tinyint(1) NOT NULL DEFAULT 0'),
    ):
        cursor.execute('SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s AND COLUMN_NAME=%s', (table,column))
        if (lambda row: row['n'] if isinstance(row, dict) else row[0])(cursor.fetchone()) == 0:
            cursor.execute(f'ALTER TABLE `{table}` ADD COLUMN `{column}` {definition}')
    cursor.execute("ALTER TABLE attendance_records MODIFY type enum('曠課','遲到','病假','事假','公假','重大傷病假','產假') NOT NULL")


def upgrade(connection, legacy_path):
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(CREATE_TABLE_SQL)
        cursor.execute(ADMIN_CASE_TABLE_SQL)
        upgrade_columns(cursor)
        legacy = json.loads(Path(legacy_path).read_text(encoding='utf-8')) if Path(legacy_path).exists() else {}
        migrated = 0
        for item in legacy.get('dorm_applications', []):
            cursor.execute('SELECT id FROM dorm_applications WHERE student_id=%s AND semester=%s', (item['student_id'], item['semester']))
            if cursor.fetchone():
                continue
            values = {**item, 'history_json': json.dumps(item.get('history', []), ensure_ascii=False)}
            # JSON IDs and database IDs may belong to different applications.
            # Preserve both records, letting MySQL assign a new ID on collision.
            cursor.execute('SELECT id FROM dorm_applications WHERE id=%s', (item['id'],))
            collision = cursor.fetchone() is not None
            columns = FIELDS if collision else ('id', *FIELDS)
            params = tuple(values[k] for k in FIELDS) if collision else (item['id'], *(values[k] for k in FIELDS))
            cursor.execute('INSERT INTO dorm_applications (' + ', '.join(columns) + ') VALUES (' + ', '.join(['%s'] * len(columns)) + ')', params)
            migrated += 1
        for item in legacy.get('admin_cases', []):
            cursor.execute('SELECT id FROM admin_cases WHERE id=%s', (item['id'],))
            if cursor.fetchone():
                continue
            cursor.execute('INSERT INTO admin_cases (id, revision, office, applicant_username, status, payload_json) VALUES (%s,%s,%s,%s,%s,%s)',
                           (item['id'], item.get('revision', 0), item['office'], item.get('applicant_username', ''),
                            item['status'], json.dumps(item, ensure_ascii=False)))
            migrated += 1
        connection.commit()
        return migrated
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()


if __name__ == '__main__':
    from app import get_db_connection
    from campus.common import store
    connection = get_db_connection()
    if connection is None:
        raise SystemExit('MySQL 未連線，沒有變更資料。')
    try:
        count = upgrade(connection, store.path)
        print(f'宿舍與行政案件資料表已就緒，搬移 {count} 筆舊紀錄；原始 JSON 保留。')
    finally:
        connection.close()
