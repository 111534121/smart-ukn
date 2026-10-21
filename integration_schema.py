"""增量建立宿舍申請表並搬移舊 JSON；不重建其他資料表。"""
import json
from pathlib import Path
from campus.dorm_store import CREATE_TABLE_SQL, FIELDS


def upgrade_columns(cursor):
    for table, column, definition in (
        ('attendance_records', 'hours', 'decimal(7,2) DEFAULT NULL'),
        ('attendance_records', 'exam_policy', "varchar(20) NOT NULL DEFAULT 'ordinary'"),
        ('course_map', 'semester_hours', 'decimal(8,2) DEFAULT NULL'),
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
        upgrade_columns(cursor)
        legacy = json.loads(Path(legacy_path).read_text(encoding='utf-8')) if Path(legacy_path).exists() else {}
        migrated = 0
        for item in legacy.get('dorm_applications', []):
            cursor.execute('SELECT id FROM dorm_applications WHERE student_id=%s AND semester=%s', (item['student_id'], item['semester']))
            if cursor.fetchone():
                continue
            values = {**item, 'history_json': json.dumps(item.get('history', []), ensure_ascii=False)}
            cursor.execute('INSERT INTO dorm_applications (id, ' + ', '.join(FIELDS) + ') VALUES (' + ', '.join(['%s']*(len(FIELDS)+1)) + ')', (item['id'], *(values[k] for k in FIELDS)))
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
        print(f'宿舍申請表已就緒，搬移 {count} 筆舊紀錄；原始 JSON 保留。')
    finally:
        connection.close()
