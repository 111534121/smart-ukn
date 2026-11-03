from datetime import datetime

from dashboard.summary import summarize_schedule


def row(name, start, end):
    return {"weekday": 2, "period_start": start, "period_end": end,
            "course_name": name, "classroom": "A301", "teacher": "示範教師", "student_id": None}


def test_overlapping_classes_are_marked_for_review():
    result = summarize_schedule([
        row("資料結構", 3, 5), row("統計學", 3, 4), row("英文", 1, 2)
    ], datetime(2026, 11, 3, 9, 0))
    by_name = {item["course_name"]: item for item in result["classes"]}
    assert by_name["資料結構"]["conflicts"] == ["統計學"]
    assert by_name["統計學"]["conflicts"] == ["資料結構"]
    assert by_name["英文"]["conflicts"] == []


def test_adjacent_periods_are_not_a_conflict():
    result = summarize_schedule([row("英文", 1, 2), row("統計學", 3, 4)],
                                datetime(2026, 11, 3, 9, 0))
    assert all(not item["conflicts"] for item in result["classes"])
