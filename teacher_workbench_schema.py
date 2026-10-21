"""老師工作台的增量資料庫升級；只補欄位，不重建資料表或匯入示範資料。"""

UPGRADES = (
    ('class_notices', (('reply_required', 'tinyint(1) NOT NULL DEFAULT 0'),)),
    ('class_notice_recipients', (('reply', 'varchar(20) DEFAULT NULL'), ('reply_at', 'datetime DEFAULT NULL'))),
    ('counseling_records', (('follow_up_date', 'date DEFAULT NULL'),
                            ('tracking_status', "varchar(20) NOT NULL DEFAULT '待聯繫'"),
                            ('tracking_result', 'text DEFAULT NULL'))),
)


def upgrade_cursor(cursor):
    changed = []
    for table, columns in UPGRADES:
        for column, definition in columns:
            cursor.execute('SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s', (table, column))
            if cursor.fetchone()[0] == 0:
                cursor.execute(f'ALTER TABLE `{table}` ADD COLUMN `{column}` {definition}')
                changed.append(f'{table}.{column}')
    return changed


if __name__ == '__main__':
    from app import get_db_connection
    connection = get_db_connection()
    if connection is None:
        raise SystemExit('未連上 MySQL，未變更資料庫；請確認現有資料庫連線設定。示範模式不需升級。')
    try:
        with connection.cursor() as cursor:
            changed = upgrade_cursor(cursor)
        connection.commit()
        print(f'老師工作台資料庫已就緒：新增 {len(changed)} 個欄位。')
    finally:
        connection.close()
