"""Receipt reminders target only students who have not replied."""
from datetime import date, timedelta

from campus import messaging


def test_one_day_before_due_once_only(client):
    due = (date.today() + timedelta(days=1)).isoformat()
    notice = messaging.add_notice({
        'class_name': '資管五忠', 'whole_class': False, 'recipients': ['S112001', 'S112002'],
        'title': '校外教學意願', 'content': '請回覆', 'priority': '一般',
        'sender': '彭賓鈺', 'sender_username': 'teacher1', 'due_date': due,
        'reply_required': True, 'replies': {'S112002': {'reply': '參加', 'reply_at': '2026-11-09 12:00:00'}},
    })
    assert messaging.dispatch_due_receipt_reminders() == 1
    assert messaging.dispatch_due_receipt_reminders() == 0
    reminders = [n for n in messaging.load_notices() if n['id'] != notice['id']]
    assert len(reminders) == 1 and reminders[0]['recipients'] == ['S112001']
    assert reminders[0]['reply_required'] is False
