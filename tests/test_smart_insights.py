# -*- coding: utf-8 -*-
"""
測試智慧校園 AI 決策洞察端點 /api/admin/smart-insights
"""
import pytest
from app import app as flask_app

def test_admin_smart_insights_endpoint():
    with flask_app.test_client() as client:
        with client.session_transaction() as sess:
            sess["username"] = "admin"
            sess["role"] = "系統管理員"

        res = client.get("/api/admin/smart-insights")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        assert "insights" in data
        assert "data" in data
        assert isinstance(data["insights"], list)
        assert len(data["insights"]) > 0
        categories = [ins["category"] for ins in data["insights"]]
        assert "學業擋修風險預警" in categories
        assert "出勤扣考警戒預警" in categories
        assert "AI 知識庫擴充推薦" in categories
