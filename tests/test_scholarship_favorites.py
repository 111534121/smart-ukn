"""收藏獎學金：收藏後貼在證照牆、通知中心提醒要準備的文件"""
from datetime import date

import pytest

from campus import services


class FixedDate(date):
    @classmethod
    def today(cls):
        return cls(2026, 10, 1)  # SCH01 (10/16 截止) 還沒截止，SCH08 (9/15) 已截止


@pytest.fixture(autouse=True)
def fixed_today(monkeypatch):
    monkeypatch.setattr(services, "date", FixedDate)


def sch(client, sid):
    return next(s for s in client.get("/api/campus/scholarships").get_json()["data"] if s["id"] == sid)


def fav(client, sid, on=True):
    return client.post(f"/api/campus/scholarships/{sid}/favorite", json={"on": on})


def test_every_scholarship_lists_documents_to_prepare(client):
    data = client.get("/api/campus/scholarships").get_json()["data"]
    assert all(s["prepare"] for s in data)
    assert all(s["favorited"] is False for s in data)  # 沒登入沒有收藏


def test_student_favorites_and_unfavorites(client, login):
    login("student1")
    assert sch(client, "SCH01")["favorited"] is False
    res = fav(client, "SCH01")
    assert res.status_code == 200 and res.get_json()["favorited"] is True
    s = sch(client, "SCH01")
    assert s["favorited"] and s["days_left"] == 15 and not s["expired"]
    fav(client, "SCH01")  # 重複收藏不會變兩筆
    assert services.favorite_scholarships("S112001").count("SCH01") == 1

    assert fav(client, "SCH01", on=False).status_code == 200
    assert sch(client, "SCH01")["favorited"] is False


def test_cannot_favorite_expired_but_can_remove(client, login):
    login("student1")
    res = fav(client, "SCH08")
    assert res.status_code == 400 and "已經截止" in res.get_json()["message"]
    assert fav(client, "NOPE").status_code == 404


def test_favorites_are_per_student_and_students_only(client, login):
    login("student1")
    fav(client, "SCH02")
    client.post("/api/auth/logout")
    login("student2")
    assert sch(client, "SCH02")["favorited"] is False
    client.post("/api/auth/logout")
    login("parent1")
    assert fav(client, "SCH02").status_code == 403
    assert sch(client, "SCH02")["favorited"] is False  # 家長看不到收藏，但一樣看得到系統判斷
    client.post("/api/auth/logout")
    assert fav(client, "SCH02").status_code == 401


def test_board_keeps_positions_of_favorited_scholarships(client, login):
    login("student1")
    res = client.put("/api/campus/certs/board", json={"positions": {"sch-SCH03": {"x": 0.5, "y": 0.5}}})
    assert res.get_json()["layout"] == {}  # 沒收藏的不能存
    fav(client, "SCH03")
    res = client.put("/api/campus/certs/board", json={"positions": {"sch-SCH03": {"x": 0.5, "y": 0.5, "z": 1}}})
    assert res.get_json()["layout"] == {"sch-SCH03": {"x": 0.5, "y": 0.5, "z": 1}}
