"""只補建資管科科助示範登入；不改既有帳號的密碼或資料。"""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import app

USERNAME = 'demo_assistant_cs'
NAME = '資訊管理科（五專）科助'
ROLES = ('學生', '家長', '教職員', '老師', '管理員', '訪客', '處室承辦', '科助', '住宿管理員')


def main():
    connection = app.get_db_connection()
    if not connection:
        raise RuntimeError('MySQL 未連線；未修改任何資料')
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute('SELECT COLUMN_TYPE FROM information_schema.COLUMNS '
                       'WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s AND COLUMN_NAME=%s',
                       ('users', 'role'))
        column = cursor.fetchone()
        if not column:
            raise RuntimeError('找不到 users.role；未新增帳號')
        cursor.execute('SELECT username, role, full_name FROM users WHERE username=%s', (USERNAME,))
        existing = cursor.fetchone()
        if existing:
            if existing['role'] != '科助' or existing['full_name'] != NAME:
                raise RuntimeError('同名帳號已存在且身分不同；未修改帳號')
            print('資管科科助帳號已存在，未更改密碼')
            return
        if "'科助'" not in column['COLUMN_TYPE']:
            values = ','.join("'" + role + "'" for role in ROLES)
            cursor.execute(f'ALTER TABLE users MODIFY role enum({values}) NOT NULL')
        cursor.execute('INSERT INTO users (username, password_hash, role, full_name) '
                       'VALUES (%s, %s, %s, %s)',
                       (USERNAME, app._DEMO_PW_123456, '科助', NAME))
        connection.commit()
        print('資管科科助測試帳號已補建')
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()
        connection.close()


if __name__ == '__main__':
    main()
