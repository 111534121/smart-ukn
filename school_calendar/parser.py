"""把行事曆 PDF 的文字拆成一筆一筆事項

PDF 每一行左邊是週次與月曆格子 (純數字、國字週次)，右邊是「校園記事」，例如：
    9        一       13 14 15 16 17 18 19     9/14-9/20     網路加退選及重補修課程
記事的日期寫法有：
    9/25                單日
    9/14-9/20、9/10~9/11 期間
    8/29-30             結束日省略月份
    11/9-1/08           跨年
    10/07、10/14        同一件事有多天 (拆成多筆)
括號內的日期 (例如「校慶典禮(4/8 日間部補假)」) 是補充說明，不當作新事項。
"""
import re
from datetime import date

# 日期片段：月/日，可接 -、~ 的結束日 (結束日可省略月份)，可用、接多個日期
_DAY = r"\d{1,2}/\d{1,2}"
_RANGE = rf"{_DAY}(?:\s*[-~～]\s*(?:\d{{1,2}}/)?\d{{1,2}})?"
DATE_TOKEN = re.compile(rf"{_RANGE}(?:\s*、\s*{_RANGE})*")

# 表頭與備註：不是事項
_SKIP_LINE = re.compile(r"行事曆|臺教高|校\s*園\s*記\s*事|週\s+星|月\s+次")
_NOTE_START = re.compile(r"^\s*備註")
# 行首的月曆格子與週次 (數字、國字一~二十、年、月)
_GRID_PREFIX = re.compile(r"^[\s\d年月一二三四五六七八九十廿]+")

# 國定假日名稱：PDF 有時只寫節日名稱、沒寫「放假」(例如 4/05 清明節)
HOLIDAY_WORDS = re.compile(r"放假|補假|春節|除夕|小年夜|開國紀念日|和平紀念日|兒童節|清明節|勞動節|端午節|中秋節"
                           r"|教師節|國慶日|光復|行憲紀念日")
# 行事曆旁註：國定假日調整尚未公告，標成「日期待確認」而不是併進事項名稱
TENTATIVE_NOTE = re.compile(r"\(?\s*預定調整放假或補上班待人事行政總處公布確認\s*")
EXAM_WORDS = re.compile(r"期中考試|期末考試|學期考試")
APPLY_WORDS = re.compile(r"申請|截止|加退選|選課|初選|註冊|繳費|減免|評量填寫|棄選|抵免|貸款")
MEETING_WORDS = re.compile(r"會議|委員會")
STUDENT_EVENT_WORDS = re.compile(r"座談會|說明會|大會")


def _find_tokens(line):
    """找出不在括號內的日期片段，回傳 [(start, end, text)]"""
    tokens, depth = [], 0
    depth_at = []
    for ch in line:
        if ch in "(（":
            depth += 1
        depth_at.append(depth)
        if ch in ")）":
            depth = max(0, depth - 1)
    for m in DATE_TOKEN.finditer(line):
        # 日期前一個字若是數字或 /，代表是其他數字的一部分 (例如 1150029623)，略過
        if m.start() > 0 and (line[m.start() - 1].isdigit() or line[m.start() - 1] == "/"):
            continue
        if depth_at[m.start()] == 0:
            tokens.append((m.start(), m.end(), m.group(0)))
    return tokens


def _to_date(academic_year, month, day):
    """學年度從 8 月開始：8~12 月屬民國 academic_year 年，1~7 月屬下一年"""
    year = academic_year + 1911 + (0 if month >= 8 else 1)
    return date(year, month, day)


def _parse_ranges(token, academic_year):
    """「9/14-9/20、9/28」→ [(start, end), ...]"""
    ranges = []
    for part in re.split(r"\s*、\s*", token):
        m = re.match(r"(\d{1,2})/(\d{1,2})(?:\s*[-~～]\s*(?:(\d{1,2})/)?(\d{1,2}))?$", part.strip())
        if not m:
            continue
        sm, sd = int(m.group(1)), int(m.group(2))
        em = int(m.group(3)) if m.group(3) else sm
        ed = int(m.group(4)) if m.group(4) else sd
        try:
            start, end = _to_date(academic_year, sm, sd), _to_date(academic_year, em, ed)
        except ValueError:
            continue
        if end < start:
            continue
        ranges.append((start, end))
    return ranges


def _normalize_dates(line):
    """PDF 排版會在日期中間塞空白：「11 / 11」→「11/11」、「11 / 2 5」→「11/25」"""
    line = re.sub(r"(?<![\d/])(\d{1,2})\s+/\s+(\d)\s(\d)(?=\s)", r"\1/\2\3", line)
    return re.sub(r"(?<![\d/])(\d{1,2})\s+/\s+(\d{1,2})(?![\d/])", r"\1/\2", line)


def _clean(text):
    text = re.sub(r"\s+", " ", text).strip(" ；;，,")
    # 學期代碼被拆開：「11 6 1 學雜費減免」→「1161 學雜費減免」
    text = re.sub(r"(?<![\d/])(\d{2}) (\d) (\d)(?= ?[一-鿿])", r"\1\2\3", text)
    # PDF 排版會在中文字與數字間塞多餘空白：「115    學年度」→「115 學年度」已處理；中文字之間的空白移除
    return re.sub(r"(?<=[一-鿿])\s+(?=[一-鿿])", "", text)


def classify(title):
    """依事項名稱分類：holiday 放假、exam 考試、apply 申請與截止、meeting 行政會議、event 其他活動"""
    # 括號內的補充說明 (例如「校慶典禮(4/8 日間部補假)」) 不影響分類，除非是「(放假一天)」
    without_note = re.sub(r"[(（][^)）]*[)）]", lambda m: m.group(0) if "放假" in m.group(0) else "", title)
    if HOLIDAY_WORDS.search(without_note):
        return "holiday"
    if EXAM_WORDS.search(title):
        return "exam"
    if APPLY_WORDS.search(title):
        return "apply"
    # 一行可能併列多件事，全部都是會議才算行政會議 (學生不需要參加，前台預設隱藏)
    parts = [p for p in re.split(r"、", without_note) if p.strip()]
    if parts and all(MEETING_WORDS.search(p) and not STUDENT_EVENT_WORDS.search(p) for p in parts):
        return "meeting"
    return "event"


def parse_calendar_text(text, academic_year):
    """回傳事項 list：{title, start_date, end_date, category, tentative (日期待人事行政總處確認)}"""
    events = []
    last = None
    for raw in text.splitlines():
        if _NOTE_START.search(raw):
            last = None
            continue
        if not raw.strip() or _SKIP_LINE.search(raw):
            continue
        raw = _normalize_dates(raw)
        tentative = bool(TENTATIVE_NOTE.search(raw))
        raw = TENTATIVE_NOTE.sub(" ", raw)
        tokens = _find_tokens(raw)
        if not tokens:
            # 沒有日期的行：旁註標到上一筆；去掉左側格子後若還有中文字，是上一筆事項的換行
            rest = re.sub(r"^\)|^\(?放假一天\)$", "", _GRID_PREFIX.sub("", raw).strip())
            if last is not None:
                for ev in last:
                    ev["tentative"] = ev["tentative"] or tentative
                    if re.search(r"[一-鿿]{2,}", rest):
                        ev["title"] = _clean(ev["title"] + rest)
            continue
        last = []
        for i, (start, end, token) in enumerate(tokens):
            stop = tokens[i + 1][0] if i + 1 < len(tokens) else len(raw)
            title = _clean(raw[end:stop])
            if not title:
                continue
            for s, e in _parse_ranges(token, academic_year):
                ev = {"title": title, "start_date": s.isoformat(), "end_date": e.isoformat(), "tentative": tentative}
                events.append(ev)
                last.append(ev)
    for ev in events:
        ev["category"] = classify(ev["title"])
    # 同一天同名稱的重複事項只留一筆 (PDF 偶爾重複列出)
    seen, unique = set(), []
    for ev in sorted(events, key=lambda e: (e["start_date"], e["end_date"], e["title"])):
        key = (ev["start_date"], ev["end_date"], ev["title"])
        if key not in seen:
            seen.add(key)
            unique.append(ev)
    return unique
