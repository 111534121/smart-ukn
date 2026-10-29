"""扣考門檻預警：依 115/04 公告學則，非正式扣考名單。
專科班第17條／大學第11條。一般缺曠課達1/3；公假、重大傷病假及核准排除情形需核對適用條件。
缺少實際時數或課程總時數時，沿用舊資料估算並明確標記，不當成正式判定。
"""
from collections import OrderedDict
from decimal import Decimal, InvalidOperation

SEMESTER_WEEKS = 18
EXAM_BAN_RATIO = 1 / 3
WARNING_RATIO = 2 / 3  # 系統提早提醒的產品設定，非校規門檻。
DEFAULT_WEEKLY_HOURS = 3
POLICY_SOURCE = 'https://daa.ukn.edu.tw/p/406-1021-42550,r11.php?Lang=zh-tw'


def _number(value):
    try:
        number = Decimal(str(value))
        return number if number.is_finite() and number > 0 else None
    except (InvalidOperation, ValueError, TypeError):
        return None


def _round(value):
    return int(value) if value == int(value) else round(float(value), 2)


def record_semester(record):
    if record.get('semester'): return record['semester']
    try:
        from datetime import date
        day = date.fromisoformat(str(record['date'])[:10])
        year = day.year - 1911 if day.month >= 8 else day.year - 1912
        return f"{year}-{1 if day.month >= 8 or day.month == 1 else 2}"
    except (ValueError, KeyError):
        return None


# 【功能：缺曠扣考提醒】每科缺曠時數 ÷ 全學期時數：達 1/3 扣考 (公假、重大傷病 1/2)，達門檻的 2/3 先提醒
def summarize_attendance(records, weekly_hours_by_course, semester_hours_by_course=None, semester=None):
    semester_hours_by_course = semester_hours_by_course or {}
    courses = OrderedDict()
    if semester:
        records = [r for r in records if record_semester(r) == semester]
    for r in sorted(records, key=lambda x: x['course_name']):
        weekly = _number(weekly_hours_by_course.get(r['course_name'])) or Decimal(DEFAULT_WEEKLY_HOURS)
        total = _number(semester_hours_by_course.get(r['course_name']))
        c = courses.setdefault(r['course_name'], {
            'course_name': r['course_name'], 'weekly_hours': _round(weekly),
            'absent_count': 0, 'late_count': 0, 'sick_count': 0, 'leave_count': 0,
            '_absent': Decimal(0), '_counted': Decimal(0), '_half': Decimal(0), '_ordinary': Decimal(0),
            '_total': total or weekly * SEMESTER_WEEKS,
            'estimated': total is None, 'manual_review': False,
        })
        kind = r['type']
        if kind == '遲到':
            c['late_count'] += 1
            continue
        if kind == '曠課': c['absent_count'] += 1
        elif kind == '病假': c['sick_count'] += 1
        else: c['leave_count'] += 1
        hours = _number(r.get('hours'))
        if hours is None:
            hours = weekly; c['estimated'] = True
        policy = r.get('exam_policy') or 'ordinary'
        # 排除與延長門檻須由有權限資料提供者明確確認，不從病名／文字推測。
        if policy == 'exempt':
            continue
        if policy == 'manual' or (kind in ('公假', '重大傷病假', '產假') and policy == 'ordinary'):
            c['manual_review'] = True
        c['_counted'] += hours
        if kind == '曠課': c['_absent'] += hours
        if policy == 'half': c['_half'] += hours
        else: c['_ordinary'] += hours
    rank = {'ok': 0, 'warning': 1, 'banned': 2}
    overall = 'ok'
    for c in courses.values():
        # 混合假別的適用方式交由校方確認；不擅自放寬所有缺曠課。
        if c['_half'] and c['_ordinary']: c['manual_review'] = True
        denominator = 2 if c['_half'] and not c['_ordinary'] else 3
        total, counted = c['_total'], c['_counted']
        threshold = total / Decimal(denominator)
        # 交叉相乘避免三分之一的浮點邊界誤判。
        if counted * denominator >= total: level = 'banned'
        elif counted * denominator * 3 >= total * 2: level = 'warning'
        else: level = 'ok'
        c.update(absent_hours=_round(c['_absent']), counted_hours=_round(counted),
                 leave_hours=_round(counted-c['_absent']), semester_hours=_round(total),
                 exam_ban_threshold_hours=_round(threshold), remaining_hours=_round(max(Decimal(0), threshold-counted)),
                 threshold_ratio=f'1/{denominator}', level=level,
                 calculation_basis='estimated' if c['estimated'] else 'recorded_hours',
                 official_decision=False, policy_source=POLICY_SOURCE)
        for key in [k for k in c if k.startswith('_')]: del c[key]
        if rank[level] > rank[overall]: overall=level
    return {'overall_level': overall,
            'totals': {'曠課': sum(c['absent_count'] for c in courses.values()),
                       '遲到': sum(c['late_count'] for c in courses.values()), '病假': sum(c['sick_count'] for c in courses.values())},
            'policy_source': POLICY_SOURCE, 'official_decision': False,
            'courses': sorted(courses.values(), key=lambda c: (-rank[c['level']], -c['counted_hours']))}
