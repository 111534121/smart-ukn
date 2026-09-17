import mysql.connector

try:
    # 建立資料庫連線
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root1234"  # 你的 Root 密碼
    )

    if conn.is_connected():
        print("\n" + "="*40)
        print("🎉【校園智慧服務平台】VS Code 與 MySQL 連線成功！")
        print("="*40 + "\n")
        
        # 關閉連線
        conn.close()

except Exception as e:
    print("\n❌ 連線失敗，錯誤訊息：", e)
    