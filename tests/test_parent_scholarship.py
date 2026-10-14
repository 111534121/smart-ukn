"""獎助學金資格比對 (/api/scholarships/match)：家長可查看子女的比對結果，但個人條件只顯示符合／不符合，
不洩漏成績等具體數值；家長也不能代為操作申請、也只能看到自己綁定的子女。"""


def test_requires_login(client):
    assert client.get("/api/scholarships/match").status_code == 401


def test_requires_student_or_parent(client, login):
    login("teacher1")
    assert client.get("/api/scholarships/match").status_code == 403


def test_student_sees_full_reasons_and_can_apply(client, login):
    login("student1")
    data = client.get("/api/scholarships/match").get_json()
    assert data["can_apply"] is True
    assert data["student"]["student_id"] == "S112001"
    book_award = next(r for r in data["partial"] + data["ineligible"] if r["id"] == 1)
    # 學生自己可以看到具體的 GPA 數字，知道自己差多少
    assert any("GPA 需" in m and "你目前" in m for m in book_award["missing"])


def test_parent_redacts_personal_criteria_and_cannot_apply(client, login):
    login("parent1")
    data = client.get("/api/scholarships/match").get_json()
    # 家長只能看到自己綁定的子女，不能操作申請
    assert data["student"]["student_id"] == "S112001"
    assert data["can_apply"] is False

    book_award = next(r for r in data["partial"] + data["ineligible"] if r["id"] == 1)
    for reason in book_award["missing"]:
        # 個人條件 (GPA、操行、前學期成績) 不得外洩具體數值給家長
        assert "你目前" not in reason
        assert reason.endswith("：不符合")


def test_parent_and_student_see_same_set_of_eligible_scholarships(client, login):
    """符合/不符合的判定結果本身對家長和學生應該一致，只有「原因文字」詳細程度不同"""
    login("student1")
    student_data = client.get("/api/scholarships/match").get_json()
    login("parent1")
    parent_data = client.get("/api/scholarships/match").get_json()

    assert {r["id"] for r in student_data["eligible"]} == {r["id"] for r in parent_data["eligible"]}
    assert {r["id"] for r in student_data["ineligible"]} == {r["id"] for r in parent_data["ineligible"]}
