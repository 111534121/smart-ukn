# -*- coding: utf-8 -*-
"""
clean_database.py
執行校務系統資料庫正規化整頓與資料清洗：
1. 清理 users 表中的測試髒資料 (sys_admin_2, test_staff_ok, testu123)
2. 清除管理員 admin 的 office 欄位 (移除多餘的圖書資訊中心，還原為全局系統管理員)
3. 清除所有學生 (role='學生') 與家長 (role='家長') 的 office 欄位 (學生與家長不應有處室，科系由 students 關聯)
4. 清理 students 表中的假資料 S999999 及相關關聯
5. 同步 SQLite 與 MySQL 兩套資料庫，使結構清爽、資料易懂
"""

import os
import sys
import sqlite3

sys.stdout.reconfigure(encoding='utf-8')

SQLITE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'smart_ukn.sqlite3')

def clean_sqlite():
    if not os.path.exists(SQLITE_PATH):
        print(f"[SQLite] 檔案不存在: {SQLITE_PATH}")
        return

    conn = sqlite3.connect(SQLITE_PATH)
    cur = conn.cursor()
    print("\n=== 開始清洗 SQLite 資料庫 ===")

    # 1. 刪除測試帳號與假資料
    test_usernames = ['sys_admin_2', 'test_staff_ok', 'testu123']
    for u in test_usernames:
        cur.execute("DELETE FROM users WHERE username = ?", (u,))
        print(f"[SQLite] 刪除測試帳號: {u} ({cur.rowcount} 筆)")

    # 2. 刪除學生表假資料 S999999
    cur.execute("DELETE FROM students WHERE student_id = 'S999999'")
    print(f"[SQLite] 刪除測試學號 S999999 ({cur.rowcount} 筆)")
    cur.execute("DELETE FROM student_credits WHERE student_id = 'S999999'")
    cur.execute("DELETE FROM attendance_records WHERE student_id = 'S999999'")
    cur.execute("DELETE FROM student_records WHERE student_id = 'S999999'")

    # 3. 清理 admin 帳號：office 清空，角色標準化為「系統管理員」，姓名標準化為「系統管理員」
    cur.execute("""
        UPDATE users 
        SET role = '系統管理員', full_name = '系統管理員', office = NULL, permissions = '查看,建立,修改,帳號管理,權限設定'
        WHERE username = 'admin'
    """)
    print(f"[SQLite] 重設 admin 帳號為純粹系統管理員 (清空 office，移除非必要處室)")

    # 4. 清理學生與家長的 office 欄位
    cur.execute("UPDATE users SET office = NULL WHERE role IN ('學生', '家長')")
    print(f"[SQLite] 清理學生與家長之 office 欄位 ({cur.rowcount} 筆)")

    # 5. 確保示範內容管理員帳號 cms_manager_1 結構清晰
    cur.execute("""
        UPDATE users 
        SET full_name = '內容管理專員', role = '內容管理人員', office = '圖書資訊中心', permissions = '查看,建立,修改'
        WHERE username = 'cms_manager_1'
    """)

    conn.commit()

    # 顯示清理後的 users
    print("\n[SQLite] 清理後使用者清單:")
    cur.execute("SELECT user_id, username, role, student_id, full_name, office, is_active FROM users ORDER BY user_id")
    for r in cur.fetchall():
        print(f"  ID:{r[0]:<3} 帳號:{r[1]:<14} 角色:{r[2]:<8} 姓名:{r[3] or '-':<10} 姓名:{r[4]:<16} 處室:{r[5] or '(無)':<10}")

    conn.close()


def clean_mysql():
    try:
        import app
        conn = app.get_db_connection()
        if not conn:
            print("\n[MySQL] 未連線至 MySQL，略過。")
            return

        cur = conn.cursor(dictionary=True)
        print("\n=== 開始清洗 MySQL 資料庫 ===")

        # 1. 刪除測試帳號
        test_usernames = ['sys_admin_2', 'test_staff_ok', 'testu123']
        for u in test_usernames:
            cur.execute("DELETE FROM users WHERE username = %s", (u,))
            print(f"[MySQL] 刪除測試帳號: {u} ({cur.rowcount} 筆)")

        # 2. 刪除假學生 S999999
        cur.execute("DELETE FROM students WHERE student_id = 'S999999'")
        print(f"[MySQL] 刪除測試學號 S999999 ({cur.rowcount} 筆)")

        # 3. 清理 admin 帳號
        cur.execute("""
            UPDATE users 
            SET role = '管理員', full_name = '系統管理員', office = NULL
            WHERE username = 'admin'
        """)
        print(f"[MySQL] 重設 admin 帳號為純粹系統管理員 (清空 office)")

        # 4. 清理學生與家長之 office
        cur.execute("UPDATE users SET office = NULL WHERE role IN ('學生', '家長')")
        print(f"[MySQL] 清理學生與家長之 office 欄位 ({cur.rowcount} 筆)")

        conn.commit()
        conn.close()
        print("[MySQL] 清理完成！")
    except Exception as e:
        print(f"[MySQL] 清理過程發生錯誤: {e}")


if __name__ == '__main__':
    clean_sqlite()
    clean_mysql()
    print("\n資料庫整理與清洗完成！")

