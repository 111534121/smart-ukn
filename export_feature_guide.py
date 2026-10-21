"""Export the teaching guide as a standalone HTML file without runtime data."""
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / 'static'
OUT = ROOT.parent / '分享給同學'


def export():
    html = (STATIC / 'feature-guide.html').read_text(encoding='utf-8-sig')
    css = (STATIC / 'css/feature-guide.css').read_text(encoding='utf-8-sig')
    raw = (STATIC / 'feature-guide-data.js').read_text(encoding='utf-8-sig')
    data = json.loads(raw.removeprefix('window.FEATURE_GUIDE = ').strip().removesuffix(';'))
    script = (STATIC / 'js/feature-guide.js').read_text(encoding='utf-8-sig')
    # Avoid raw-text closing tags terminating the embedded script/style elements.
    payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
    script = re.sub(r'</script', r'<\\/script', script, flags=re.I)
    css = re.sub(r'</style', r'<\\/style', css, flags=re.I)
    html = html.replace('<link rel="stylesheet" href="/css/feature-guide.css">', '<style>\n' + css + '\n</style>')
    html = html.replace('  <script defer src="/feature-guide-data.js"></script>\n', '')
    html = html.replace('  <script defer src="/js/feature-guide.js"></script>\n', '')
    html = html.replace('class="brand" href="/"', 'class="brand" href="#auth"')
    html = html.replace('<a href="/">返回校園首頁 ↗</a>', '<span>單檔分享版 · 可離線瀏覽</span>')
    html = html.replace('</body>', '<script>window.FEATURE_GUIDE = ' + payload + ';</script>\n<script>\n' + script + '\n</script>\n</body>')
    assert not re.search(r'<(?:script|link)\b[^>]*(?:src|href)=["\']/', html)
    OUT.mkdir(exist_ok=True)
    target = OUT / 'Smart-UKN-功能對照說明.html'
    target.write_text(html, encoding='utf-8')
    note = OUT / '使用說明.txt'
    note.write_text('Smart UKN 功能對照說明 — 單檔分享版\n\n'
                    '1. 下載 HTML 檔，用 Chrome、Edge 或其他瀏覽器開啟。\n'
                    '2. 搜尋、分類、架構連線圖及功能詳細說明都已包含在同一檔案中。\n'
                    '3. 不需要 Python、資料庫或啟動網站，也不需要連線到原作者電腦。\n'
                    '4. 手機通訊軟體內建的檔案預覽可能不執行互動功能，請下載後用瀏覽器開啟。\n'
                    '5. 這是功能結構說明，不含實際學生紀錄，也不提供原網站的業務操作。\n'
                    '6. 本檔不會自動更新；程式變更後，需重新匯出分享版。\n', encoding='utf-8-sig')
    archive = OUT / 'Smart-UKN-功能對照說明-分享包.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
        for path in (target, note):
            z.write(path, path.name)
    print(f'HTML: {target}\nZIP: {archive}\nFeatures: {len(data["features"])}; APIs: {data["routeCount"]}')


if __name__ == '__main__':
    export()
