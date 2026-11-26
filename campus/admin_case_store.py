"""行政案件共用資料庫；離線展示沿用本機資料。"""
import json

from .common import deps, next_id, store

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS admin_cases (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 revision int NOT NULL,
 office varchar(80) NOT NULL,
 applicant_username varchar(100) NOT NULL,
 status varchar(20) NOT NULL,
 payload_json longtext NOT NULL,
 KEY idx_admin_cases_office_status (office, status),
 KEY idx_admin_cases_applicant (applicant_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""


def use_db():
    if deps.fetch_db_rows('SELECT COUNT(*) AS n FROM admin_cases') is not None:
        return True
    if deps.fetch_db_rows('SELECT username FROM users LIMIT 1') is not None:
        raise ConnectionError('行政案件資料表尚未建立，請先執行 integration_schema.py')
    return False


def all_cases():
    if use_db():
        rows = deps.fetch_db_rows('SELECT payload_json FROM admin_cases ORDER BY id')
        if rows is None:
            raise ConnectionError('行政案件資料庫讀取失敗')
        return [json.loads(row['payload_json']) for row in rows]
    return store.section('admin_cases', list)


def insert(item):
    if use_db():
        # MySQL assigns a unique ID across every application process.
        draft = {**item, 'id': 0}
        result = deps.db_execute(
            'INSERT INTO admin_cases (revision, office, applicant_username, status, payload_json) VALUES (%s,%s,%s,%s,%s)',
            (item['revision'], item['office'], item['applicant_username'], item['status'], json.dumps(draft, ensure_ascii=False)))
        if result is None:
            raise ConnectionError('行政案件資料庫寫入失敗')
        item['id'] = result['lastrowid']
        saved = deps.db_execute('UPDATE admin_cases SET payload_json=%s WHERE id=%s',
                                (json.dumps(item, ensure_ascii=False), item['id']))
        if saved is None:
            raise ConnectionError('行政案件資料庫寫入失敗')
        return item
    rows = store.section('admin_cases', list)
    item['id'] = next_id(rows)
    rows.append(item)
    store.save()
    return item


def update(item, old_revision):
    if use_db():
        result = deps.db_execute(
            'UPDATE admin_cases SET revision=%s, office=%s, status=%s, payload_json=%s WHERE id=%s AND revision=%s',
            (item['revision'], item['office'], item['status'], json.dumps(item, ensure_ascii=False), item['id'], old_revision))
        if result is None:
            raise ConnectionError('行政案件資料庫寫入失敗')
        return result['rowcount'] == 1
    rows = store.section('admin_cases', list)
    target = next((row for row in rows if row['id'] == item['id']), None)
    if not target or target['revision'] != old_revision:
        return False
    target.clear()
    target.update(item)
    store.save()
    return True
