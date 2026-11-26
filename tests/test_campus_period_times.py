"""老師課表與教室借用的節次須和學生課表及校方範例一致。"""
from datetime import datetime

from campus.facilities import PERIODS, period_at
from dashboard.demo_data import PERIOD_TIMES


def test_shared_morning_and_afternoon_periods():
    assert PERIODS is PERIOD_TIMES
    assert [PERIODS[p] for p in range(1, 10)] == [
        ("08:30", "09:20"), ("09:30", "10:20"),
        ("10:30", "11:20"), ("11:30", "12:20"),
        ("13:20", "14:10"), ("14:20", "15:10"),
        ("15:20", "16:10"), ("16:20", "17:10"),
        ("17:20", "18:10"),
    ]


def test_teacher_current_class_uses_correct_period_boundaries():
    assert period_at(datetime(2026, 9, 15, 8, 29)) is None
    assert period_at(datetime(2026, 9, 15, 8, 30)) == 1
    assert period_at(datetime(2026, 9, 15, 12, 20)) == 4
    assert period_at(datetime(2026, 9, 15, 12, 50)) is None
    assert period_at(datetime(2026, 9, 15, 13, 20)) == 5
    assert period_at(datetime(2026, 9, 15, 14, 20)) == 6


def test_teacher_and_room_apis_show_same_periods(client):
    teacher = client.get("/api/campus/teachers").get_json()
    rooms = client.get("/api/campus/rooms?date=2026-09-15").get_json()
    assert teacher["periods"] == rooms["periods"]
    assert teacher["periods"]["5"] == ["13:20", "14:10"]
