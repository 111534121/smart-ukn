"""Deadline labels from explicit fields or explicit deadline wording; never from a generic event date."""
import re
from datetime import date, datetime, time, timedelta, timezone

TAIPEI = timezone(timedelta(hours=8))
DATE = r'(?:(?P<year>20\d{2})[/-])?(?P<month>\d{1,2})[/-](?P<day>\d{1,2})'
TIME = r'(?:\s*[（(][^）)]{0,8}[）)])?\s*(?P<hour>\d{1,2}):(?P<minute>\d{2})'
UNTIL = re.compile(r'(?:截至|至|截止日期[為：:\s]*)\s*' + DATE + '(?:' + TIME + ')?')
ENDING = re.compile(DATE + '(?:' + TIME + r')?(?:\s*[（(][^）)]{0,8}[）)])?\s*(?:止|截止)')


def deadline_info(item, now=None):
    now = now or datetime.now(TAIPEI)
    if now.tzinfo is None:
        now = now.replace(tzinfo=TAIPEI)
    now = now.astimezone(TAIPEI)
    result = dict(deadline_date=None, deadline_at=None, deadline_source=None,
                  deadline_status='unknown', deadline_label='未標示截止日', days_remaining=None)
    raw = item.get('deadline_at') or item.get('deadline')
    cutoff = None
    try:
        if raw:
            text = raw.isoformat() if hasattr(raw, 'isoformat') else str(raw)
            d = date.fromisoformat(text[:10])
            cutoff = datetime.fromisoformat(text.replace('Z', '+00:00')) if len(text) > 10 else None
            if cutoff:
                cutoff = cutoff.replace(tzinfo=TAIPEI) if cutoff.tzinfo is None else cutoff.astimezone(TAIPEI)
                d = cutoff.date()
            source = '公告截止欄位'
        else:
            title = item.get('title') or ''
            if not re.search(r'截止|截至|申請|受理|報名|登記|繳交|加退選', title):
                return result
            match = UNTIL.search(title) or ENDING.search(title)
            if not match:
                return result
            pub = date.fromisoformat(str(item.get('publish_date', ''))[:10])
            d = date(int(match['year'] or pub.year), int(match['month']), int(match['day']))
            if not match['year'] and d < pub - timedelta(days=60):
                d = date(pub.year + 1, d.month, d.day)
            if match['hour']:
                cutoff = datetime.combine(d, time(int(match['hour']), int(match['minute'])), TAIPEI)
            source = '公告標題（年份依發布日期推算）' if not match['year'] else '公告標題'
    except (ValueError, TypeError):
        return result
    remaining = (d - now.date()).days
    expired = cutoff < now if cutoff else remaining < 0
    status, label = ('expired', '已截止') if expired else ('soon', '即將截止') if remaining <= 7 else ('open', '尚未截止')
    result.update(deadline_date=d.isoformat(), deadline_at=cutoff.isoformat() if cutoff else None,
                  deadline_source=source, deadline_status=status, deadline_label=label, days_remaining=remaining)
    return result
