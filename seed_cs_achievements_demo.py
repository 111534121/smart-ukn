"""建立資管科成果與榮譽的虛構示範資料；重跑不會重複新增。"""
from datetime import datetime
from pathlib import Path
from shutil import copy2
from uuid import uuid4

from pypdf import PdfWriter

from campus.common import next_id, store


SAMPLES = [
    ('競賽', '【示範資料】智慧校園應用創意競賽', '特優', '2026-10-18',
     '虛構的展示案例：團隊以校園服務流程為題提出系統原型，不代表真實得獎。'),
    ('證照', '【示範資料】電腦軟體應用乙級檢定', '通過檢定', '2026-09-12',
     '虛構的展示案例：呈現證照成果的發布方式，不代表任何學生實際取得證照。'),
    ('競賽', '【示範資料】資訊服務創新提案競賽', '佳作', '2026-06-20',
     '虛構的展示案例：以資料整理與服務設計為主題。'),
    ('專題', '【示範資料】校園行事曆與待辦整合專題', '專題成果展示', '2026-05-28',
     '虛構的展示案例：呈現專題簡介與更新日期。'),
    ('證照', '【示範資料】電腦硬體裝修丙級檢定', '通過檢定', '2025-11-22',
     '虛構的展示案例：供歷年成果篩選使用。'),
    ('競賽', '【示範資料】跨域資訊應用競賽', '優選', '2025-05-16',
     '虛構的展示案例：供歷年成果排序使用。'),
]
PENDING = ('競賽', '【示範資料】互動科技作品競賽', '入圍', '2026-10-25',
           '虛構的待審核投稿，科助可演示查看佐證與發布流程。')


def main():
    path = Path(store.path)
    if path.exists():
        backup = path.with_name(path.stem + '.before-achievements-demo.json')
        if not backup.exists():
            copy2(path, backup)
    now = datetime.now().astimezone().isoformat(timespec='seconds')
    with store.lock:
        rows = store.section('cs_achievements', list)
        existing = {r.get('contest_name') for r in rows}
        added = 0
        for kind, title, award, day, description in SAMPLES:
            if title in existing:
                continue
            rows.append(dict(id=next_id(rows), dept_id='CS', kind=kind,
                             contest_name=title, award=award, award_date=day,
                             description=description, status='已發布',
                             created_by='demo_student', created_at=now,
                             updated_at=now, published_at=now,
                             reviewed_by='demo_assistant_cs',
                             review_note='虛構示範資料', file_id='', file_suffix='',
                             file_name=''))
            added += 1
        if PENDING[1] not in existing:
            file_id = uuid4().hex
            folder = path.parent / 'achievement_files'
            folder.mkdir(parents=True, exist_ok=True)
            writer = PdfWriter()
            writer.add_blank_page(width=595, height=842)
            with (folder / (file_id + '.pdf')).open('wb') as output:
                writer.write(output)
            kind, title, award, day, description = PENDING
            rows.append(dict(id=next_id(rows), dept_id='CS', kind=kind,
                             contest_name=title, award=award, award_date=day,
                             description=description, status='待審核',
                             created_by='demo_student', created_at=now,
                             updated_at=now, published_at=None,
                             reviewed_by=None, review_note='',
                             file_id=file_id, file_suffix='.pdf',
                             file_name='示範佐證.pdf'))
            added += 1
        store.save()
    print(f'已加入 {added} 筆示範成果；目前共有 {len(rows)} 筆。')


if __name__ == '__main__':
    main()
