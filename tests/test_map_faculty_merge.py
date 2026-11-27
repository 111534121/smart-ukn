# -*- coding: utf-8 -*-
"""
test_map_faculty_merge.py
驗證主頁「教師專長查詢」已完整整併至「校園地圖與老師辦公室」下方的「老師辦公室與目前狀態」，
並自「學習」選單與獨立分頁移除，所有角色皆能正常使用無誤。
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_index_html_merged_faculty_into_map_tab():
    html = (ROOT / "static/index.html").read_text(encoding="utf-8")

    # 獨立的 tab-faculty 頁面應已移除
    assert 'id="tab-faculty"' not in html
    assert 'id="facultyBody"' not in html

    # tab-map 中應包含老師辦公室與目前狀態、編輯我的專長按鈕與 teachersBody
    m = re.search(r'<div id="tab-map".*?<!-- 天氣與交通 -->', html, re.S)
    assert m is not None, "找不到 tab-map 區塊"
    tab_map_html = m.group(0)
    assert "老師辦公室與目前狀態" in tab_map_html
    assert 'id="facultyEditMineBtn"' in tab_map_html
    assert 'onclick="openMyFacultyProfile()"' in tab_map_html
    assert 'id="teachersBody"' in tab_map_html


def test_navigation_and_portal_removed_duplicate_faculty_entry():
    shell_js = (ROOT / "static/js/campus-shell.js").read_text(encoding="utf-8")
    portal_js = (ROOT / "static/js/home-portal.js").read_text(encoding="utf-8")
    faculty_js = (ROOT / "static/js/faculty.js").read_text(encoding="utf-8")

    # FEATURES 中不應再有「學習」分組下的教師專長查詢
    assert "key: 'faculty'" not in shell_js
    assert "tab: 'tab-faculty'" not in shell_js

    # 保留校園生活下的校園地圖與老師辦公室，且描述包含專長關鍵字
    assert "key: 'map', tab: 'tab-map', name: '校園地圖與老師辦公室'" in shell_js
    assert "專長" in shell_js

    # 舊連結 #faculty / tab-faculty 應安全重導至 tab-map
    assert "if (tabId === 'tab-faculty') tabId = 'tab-map';" in shell_js
    assert "if (key === 'faculty') return 'tab-map';" in shell_js

    # home-portal.js 的身分導覽不應再引用已移除的 faculty key
    assert "'faculty'" not in portal_js


    # faculty.js 應渲染在 teachersBody 並整合老師辦公室資訊，不再註冊 tab-faculty loader
    assert "document.getElementById('teachersBody')" in faculty_js
    assert "tabLoaders['tab-faculty']" not in faculty_js
    assert "showTeacherTimetable" in faculty_js
    assert "showOnMap" in faculty_js
    assert "teacherUnitFilter" in faculty_js


def test_merged_teacher_and_faculty_apis_for_all_roles(client, login):
    # 未登入（訪客）、學生、老師、家長、教職員、管理員皆可正常取得地圖、老師辦公室與專長查詢資料
    roles = [
        None,
        ("student1", "123456"),
        ("teacher1", "123456"),
        ("parent1", "123456"),
        ("staff1", "123456"),
        ("admin", "admin123"),
    ]
    for cred in roles:
        client.post("/api/auth/logout")
        if cred:
            login(*cred)

        r_map = client.get("/api/campus/map")
        assert r_map.status_code == 200 and r_map.get_json()["buildings"]

        r_teachers = client.get("/api/campus/teachers")
        assert r_teachers.status_code == 200
        t_json = r_teachers.get_json()
        assert t_json["data"] and t_json["periods"] and "now" in t_json

        r_fac = client.get("/api/faculty")
        assert r_fac.status_code == 200
        f_json = r_fac.get_json()
        assert f_json["data"] and f_json["fields"] and f_json["depts"]

        # 老師登入時應帶出 my_name 且可呼叫 /api/faculty/me
        if cred and cred[0] == "teacher1":
            assert f_json["my_name"] == "彭賓鈺"
            assert client.get("/api/faculty/me").status_code == 200
        else:
            assert client.get("/api/faculty/me").status_code == 403


def test_no_duplicate_and_only_real_ukn_teachers(client):
    """確認老師辦公室與教師專長查詢沒有重複老師，且不殘留舊假名，皆為康寧大學官網真實師資。"""
    fake_names = {"陳雅婷", "林志明", "吳建宏", "張文華", "黃淑芬", "李佩珊", "Amy Chen", "許美玲", "蔡宗翰", "鄭如君"}

    teachers = client.get("/api/campus/teachers").get_json()["data"]
    t_names = [t["name"] for t in teachers]
    assert len(t_names) == len(set(t_names)), f"/api/campus/teachers 出現重複老師: {t_names}"
    assert not (set(t_names) & fake_names), f"/api/campus/teachers 殘留假名: {set(t_names) & fake_names}"

    faculty_list = client.get("/api/faculty").get_json()["data"]
    f_names = [t["name"] for t in faculty_list]
    assert len(f_names) == len(set(f_names)), f"/api/faculty 出現重複老師: {f_names}"
    assert not (set(f_names) & fake_names), f"/api/faculty 殘留假名: {set(f_names) & fake_names}"

    # 確認涵蓋康寧大學官網各科系真實教師
    expected_real = {"彭賓鈺", "周建羽", "謝樹明", "嚴竹華", "朱錦文", "益西曲珍", "葉美玉", "李惠瀅", "李金瑛", "鍾珮珊", "藍靜義", "陳慧玲", "林蔚荏", "陳秀珍"}
    assert expected_real <= set(f_names)
    assert expected_real <= set(t_names)

