"""校園參觀預約儲存層：MySQL 優先；離線展示沿用 campus_store.json。跟 campus/dorm_store.py 同一套做法。"""
import json

from .common import deps, store, next_id

TABLE_SQL = """
CREATE TABLE IF NOT EXISTS visit_bookings (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 date date NOT NULL,
 slot varchar(30) NOT NULL,
 party_size int NOT NULL DEFAULT 1,
 contact_name varchar(50) NOT NULL,
 contact_phone varchar(30) NOT NULL,
 note varchar(300) DEFAULT NULL,
 booked_by_key varchar(100) DEFAULT NULL,
 booked_by_role varchar(10) DEFAULT NULL,
 status varchar(10) NOT NULL DEFAULT '待確認',
 created_at datetime NOT NULL,
 KEY idx_date_slot (date, slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校園參觀預約'
"""
FIELDS = ('date', 'slot', 'party_size', 'contact_name', 'contact_phone', 'note',
          'booked_by_key', 'booked_by_role', 'status', 'created_at')


def use_db():
    return deps.fetch_db_rows('SELECT COUNT(*) AS n FROM visit_bookings') is not None


def _decode(row):
    item = dict(row)
    item['date'] = str(item['date'])
    item['created_at'] = str(item['created_at'])[:19]
    return item


def all_bookings():
    if use_db():
        return [_decode(r) for r in deps.fetch_db_rows('SELECT * FROM visit_bookings ORDER BY date, slot, id') or []]
    # 回傳複本，呼叫端改動不會直接動到 store 裡的原始資料，跟 MySQL 模式回傳新字典的行為一致
    return json.loads(json.dumps(store.section('visit_bookings', list)))


def insert_booking(fields):
    if use_db():
        result = deps.db_execute(
            'INSERT INTO visit_bookings (' + ', '.join(FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(FIELDS)) + ')',
            tuple(fields[k] for k in FIELDS))
        if result is None:
            raise ConnectionError('校園參觀資料庫寫入失敗')
        return {**fields, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('visit_bookings', list)
        saved = {**fields, 'id': next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


def update_booking(booking_id, patch):
    if use_db():
        keys = list(patch.keys())
        result = deps.db_execute(
            'UPDATE visit_bookings SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE id=%s',
            tuple(patch[k] for k in keys) + (booking_id,))
        if result is None:
            raise ConnectionError('校園參觀資料庫寫入失敗')
        return next((b for b in all_bookings() if b['id'] == booking_id), None)
    with store.lock:
        items = store.section('visit_bookings', list)
        target = next((b for b in items if b['id'] == booking_id), None)
        if not target:
            return None
        target.update(patch)
        store.save()
        return dict(target)
