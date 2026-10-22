"""從教務處網站抓最新學年度的行事曆 PDF，解析後存成 school_calendar.json

教務處行事曆頁面列出各學年度 PDF (連結文字如「115行事曆」)，取學年度最大的一份。
抓取失敗時不覆蓋舊資料，前台繼續顯示上次成功抓到的內容。
"""
import html
import io
import json
import os
import re
import urllib.parse
import urllib.request
from datetime import datetime

from .parser import parse_calendar_text

CALENDAR_PAGE_URL = "https://daa.ukn.edu.tw/p/412-1021-846.php?Lang=zh-tw"
DATA_FILE = os.getenv("SCHOOL_CALENDAR_FILE", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "school_calendar.json"))
_HEADERS = {"User-Agent": "Mozilla/5.0 (SmartUKN calendar sync)"}


def _fetch(url, timeout=30):
    req = urllib.request.Request(url, headers=_HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def find_latest_pdf(page_url=CALENDAR_PAGE_URL):
    """回傳 (學年度, PDF 網址)；頁面上找不到行事曆 PDF 時丟出 ValueError"""
    page = _fetch(page_url).decode("utf-8", errors="ignore")
    found = []
    for href, text in re.findall(r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', page, re.S | re.I):
        label = html.unescape(re.sub(r"<[^>]+>", "", text))
        m = re.search(r"(\d{3})\s*行事曆", label)
        if m:
            found.append((int(m.group(1)), urllib.parse.urljoin(page_url, html.unescape(href))))
    if not found:
        raise ValueError("教務處行事曆頁面找不到「NNN行事曆」PDF 連結，頁面格式可能已改版")
    return max(found)


def pdf_to_text(pdf_bytes):
    from pypdf import PdfReader  # 只有同步時才需要，未安裝 pypdf 也不影響網站其他功能
    reader = PdfReader(io.BytesIO(pdf_bytes))
    return "\n".join(page.extract_text(extraction_mode="layout") for page in reader.pages)


def sync(page_url=CALENDAR_PAGE_URL):
    """抓取、解析並寫入 school_calendar.json，回傳寫入的資料"""
    academic_year, pdf_url = find_latest_pdf(page_url)
    events = parse_calendar_text(pdf_to_text(_fetch(pdf_url)), academic_year)
    if len(events) < 20:
        # 正常一學年有上百筆；太少代表 PDF 版面變了，保留舊資料比較安全
        raise ValueError(f"只解析出 {len(events)} 筆事項，PDF 版面可能已改變，未更新資料")
    data = {
        "academic_year": academic_year,
        "source_url": pdf_url,
        "source_page": page_url,
        "fetched_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "events": [{"id": i + 1, **ev} for i, ev in enumerate(events)],
    }
    tmp_path = DATA_FILE + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, DATA_FILE)
    return data


def load():
    """讀取已抓取的行事曆；還沒抓過回傳 None"""
    if not os.path.exists(DATA_FILE):
        return None
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


if __name__ == "__main__":
    # 手動更新：python -m school_calendar.sync
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    result = sync()
    print(f"✅ 已更新 {result['academic_year']} 學年度行事曆，共 {len(result['events'])} 筆事項")
    print(f"   來源：{result['source_url']}")
