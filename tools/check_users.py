import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app

conn = app.get_db_connection()
if conn:
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT user_id, username, full_name, role, student_id FROM users")
    res = cur.fetchall()
    print(f"Total users in DB: {len(res)}")
    for r in res:
        if '17' in str(r.get('user_id')) or '17' in str(r.get('username')) or '17' in str(r.get('student_id', '')):
            print("Matched user:", r)
    conn.close()
else:
    print("MySQL not connected (running in demo mode). Checking demo data...")
