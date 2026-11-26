"""Create the least-privileged public-content demo administrator if absent."""
import app


def main():
    username = 'demo_admissions_admin'
    if not app.is_db_available():
        print('資料庫未連線；示範帳號會使用 app.py 的本機資料。')
        return
    existing = app.fetch_db_rows('SELECT user_id, role, full_name FROM users WHERE username=%s', (username,))
    if existing:
        if existing[0]['role'] != '內容管理員' or existing[0]['full_name'] != '招生與課務知識管理員':
            raise RuntimeError('帳號已存在但身分不符，未覆寫。')
        print('示範帳號已存在，保留原密碼。')
        return
    app.db_execute('INSERT INTO users (username,password_hash,role,full_name,can_manage_dorm) VALUES (%s,%s,%s,%s,%s)',
                   (username, app._DEMO_PW_123456, '內容管理員', '招生與課務知識管理員', 0))
    print('已建立 demo_admissions_admin（內容管理員）。')


if __name__ == '__main__':
    main()
