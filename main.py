"""
Smart UKN 康寧大學智慧校園服務平台 - 主程式進入點
本專案已全面統一以後端 Flask (app.py) 為核心，支援 3NF 正規化、Session 認證與身分分流。
"""
import sys
import os

if __name__ == "__main__":
    from app import app
    print("=" * 65)
    print("🚀 Smart UKN 專案主入口 (已自動導向 app.py 核心)")
    print("🌐 學生與師生前台門戶: http://127.0.0.1:8000")
    print("🔑 統一登入與訪客通道: http://127.0.0.1:8000/login")
    print("⚙️ 系統管理員控制台:   http://127.0.0.1:8000/admin")
    print("=" * 65)
    app.run(host="0.0.0.0", port=8000, debug=True)