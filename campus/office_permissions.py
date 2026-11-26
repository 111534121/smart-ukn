"""舊有審核功能的示範處室分工；正式權責由學校確認後調整。"""

REVIEW_OFFICES = {
    'leave': {'學生事務處／生活輔導組'},
    'certificates': {'教務處／註冊組'},
    'room_bookings': {'總務處／事務組'},
}


def can_review(user, task):
    if user.get('role') == '管理員':
        return True
    if user.get('role') not in ('教職員', '處室承辦'):
        return False
    from .admin_cases import assignments
    from .office_catalog import canonical
    return canonical(assignments().get(user.get('username'))) in REVIEW_OFFICES[task]
