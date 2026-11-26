"""Import verified UKN public PDFs downloaded from the university website.

The PDF fonts do not expose usable Unicode to pypdf. Only manually verified,
page-specific excerpts are indexed; the original PDF remains downloadable.
"""
from datetime import datetime
from pathlib import Path
import hashlib

from pypdf import PdfReader

from campus.common import store
from campus.knowledge_documents import documents, folder, MAX_FILE

DOWNLOADS = Path.home() / 'Downloads'
SOURCES = (
    {
        'id': 'official-ukn-115-two-year', 'download': '450-1001-4968,c1.php',
        'file_name': '康寧大學115學年度二專在職專班招生簡章.pdf',
        'title': '115學年度二專在職專班招生簡章', 'kind': '招生',
        'source_url': 'https://recruit.ukn.edu.tw/p/450-1001-4968,c1.php?Lang=zh-tw',
        'pages': [{'page': 9, 'text': '康寧大學115學年度二專在職專班招生。二專在職專班修業年限：視光科三年，嬰幼兒保育科二年。二專在職專班上課時間：視光科週一至週五擇1日及週日1日，嬰幼兒保育科週六、週日。前揭上課時間、課程皆以實際課表為準。'}],
    },
    {
        'id': 'official-ukn-115-five-year', 'download': '450-1001-42081,c0.php',
        'file_name': '康寧大學115學年度五專完全免試入學招生簡章.pdf',
        'title': '115學年度五專完全免試入學招生簡章', 'kind': '招生',
        'source_url': 'https://recruit.ukn.edu.tw/p/450-1001-42081,c0.php?Lang=zh-tw',
        'pages': [{'page': 5, 'text': '康寧大學115學年度五專完全免試入學單獨招生。資訊管理科（臺北校區）招生名額23名，修業年限5年。'}],
    },
    {
        'id': 'official-ukn-114-im-curriculum', 'download': '800645289.pdf',
        'file_name': '資管科114年度入學五專修業科目表.pdf',
        'title': '資管科114年度入學五專修業科目表', 'kind': '課務',
        'source_url': 'https://im.ukn.edu.tw/var/file/28/1028/img/519/800645289.pdf',
        'pages': [{'page': 1, 'text': '資管科114年度入學五專修業科目表。畢業學分請依原檔核對；目前未完成可靠的表格文字擷取。'}],
    },
)


def main():
    prepared = []
    for source in SOURCES:
        path = DOWNLOADS / source['download']
        content = path.read_bytes()
        if not content.startswith(b'%PDF') or len(content) > MAX_FILE:
            raise ValueError(f"不是可匯入的 PDF：{path.name}")
        reader = PdfReader(path)
        if reader.is_encrypted or len(reader.pages) < max(page['page'] for page in source['pages']):
            raise ValueError(f"頁數不符：{path.name}")
        prepared.append((source, content, len(reader.pages)))
    with store.lock:
        folder().mkdir(parents=True, exist_ok=True)
        items = documents()
        for source, content, pdf_page_count in prepared:
            existing = next((doc for doc in items if doc['id'] == source['id']), None)
            digest = hashlib.sha256(content).hexdigest()
            if existing:
                if existing.get('sha256') != digest:
                    raise RuntimeError(f"官網文件內容已變動，請人工檢查：{source['title']}")
                if existing.get('updated_by') == 'official_import_20261109':
                    existing['pages'] = source['pages']
                    existing['pdf_page_count'] = pdf_page_count
                print(f"已存在：{source['title']}")
                continue
            (folder() / source['id']).write_bytes(content)
            items.append({key: value for key, value in source.items() if key != 'download'} |
                         {'sha256': digest, 'pdf_page_count': pdf_page_count,
                          'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                          'updated_by': 'official_import_20261109'})
            print(f"已匯入：{source['title']}（{len(source['pages'])} 個已核對頁面）")
        store.save()


if __name__ == '__main__':
    main()
