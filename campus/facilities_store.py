"""教室租借 / 櫃子租借儲存層：MySQL 優先；離線展示沿用 campus_store.json。跟 campus/dorm_store.py 同一套做法。

櫃子有固定的示範格位配置 (LOCKER_AREAS 算出來的)；MySQL 表第一次建立、資料是空的時候，
用跟 JSON 示範模式完全一樣的亂數種子 (Random(42)) 灌一次，兩種模式看到的格位配置會一致。
"""
import json
import random

from .common import deps, store, next_id

BOOKINGS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS room_bookings (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 room_id varchar(20) NOT NULL,
 room_name varchar(50) NOT NULL,
 date date NOT NULL,
 period_start int NOT NULL,
 period_end int NOT NULL,
 purpose varchar(80) NOT NULL,
 people int NOT NULL DEFAULT 1,
 applicant varchar(50) NOT NULL,
 applicant_key varchar(100) DEFAULT NULL,
 contact varchar(60) DEFAULT NULL,
 status varchar(10) NOT NULL DEFAULT '審核中',
 managed_by varchar(50) DEFAULT NULL,
 review_note varchar(100) DEFAULT NULL,
 created_at datetime NOT NULL,
 KEY idx_room_date (room_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教室租借'
"""
LOCKERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS lockers (
 locker_id varchar(20) NOT NULL PRIMARY KEY,
 area varchar(50) NOT NULL,
 row_no int NOT NULL,
 col_no int NOT NULL,
 fee int NOT NULL,
 status varchar(10) NOT NULL DEFAULT '可租借',
 holder_key varchar(100) DEFAULT NULL,
 reserved_at datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='櫃子租借'
"""
BOOKING_FIELDS = ('room_id', 'room_name', 'date', 'period_start', 'period_end', 'purpose', 'people',
                   'applicant', 'applicant_key', 'contact', 'status', 'managed_by', 'review_note', 'created_at')


def use_db():
    return deps.fetch_db_rows('SELECT COUNT(*) AS n FROM room_bookings') is not None


def _decode_booking(row):
    item = dict(row)
    item['date'] = str(item['date'])
    item['created_at'] = str(item['created_at'])[:19]
    return item


def all_bookings():
    if use_db():
        return [_decode_booking(r) for r in deps.fetch_db_rows('SELECT * FROM room_bookings ORDER BY date, period_start') or []]
    return json.loads(json.dumps(store.section('room_bookings', list)))


def insert_booking(fields):
    if use_db():
        result = deps.db_execute(
            'INSERT INTO room_bookings (' + ', '.join(BOOKING_FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(BOOKING_FIELDS)) + ')',
            tuple(fields[k] for k in BOOKING_FIELDS))
        if result is None:
            raise ConnectionError('教室租借資料庫寫入失敗')
        return {**fields, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('room_bookings', list)
        saved = {**fields, 'id': next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


def update_booking(booking_id, patch):
    if use_db():
        keys = list(patch.keys())
        result = deps.db_execute(
            'UPDATE room_bookings SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE id=%s',
            tuple(patch[k] for k in keys) + (booking_id,))
        if result is None:
            raise ConnectionError('教室租借資料庫寫入失敗')
        return next((b for b in all_bookings() if b['id'] == booking_id), None)
    with store.lock:
        items = store.section('room_bookings', list)
        target = next((b for b in items if b['id'] == booking_id), None)
        if not target:
            return None
        target.update(patch)
        store.save()
        return dict(target)


def _seed_lockers(locker_areas):
    rnd = random.Random(42)
    items = []
    for a in locker_areas:
        for r in range(a['rows']):
            for c in range(a['cols']):
                code = f"{a['building']}{len(items) + 1:03d}"
                taken = rnd.random() < 0.35
                items.append({'locker_id': code, 'area': a['area'], 'row': r, 'col': c, 'fee': a['fee'],
                              'status': '已租用' if taken else '可租借', 'holder_key': None, 'reserved_at': None})
    return items


def _decode_locker(row):
    return {'locker_id': row['locker_id'], 'area': row['area'], 'row': row['row_no'], 'col': row['col_no'],
            'fee': row['fee'], 'status': row['status'], 'holder_key': row['holder_key'],
            'reserved_at': str(row['reserved_at'])[:19] if row.get('reserved_at') else None}


def all_lockers(locker_areas):
    """locker_areas 用來在表還是空的時候灌示範格位配置 (只在第一次呼叫、MySQL 可用時發生)"""
    if use_db():
        rows = deps.fetch_db_rows('SELECT * FROM lockers ORDER BY locker_id') or []
        if not rows:
            for lk in _seed_lockers(locker_areas):
                deps.db_execute(
                    'INSERT IGNORE INTO lockers (locker_id, area, row_no, col_no, fee, status, holder_key, reserved_at) '
                    'VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
                    (lk['locker_id'], lk['area'], lk['row'], lk['col'], lk['fee'], lk['status'], lk['holder_key'], lk['reserved_at']))
            rows = deps.fetch_db_rows('SELECT * FROM lockers ORDER BY locker_id') or []
        return [_decode_locker(r) for r in rows]
    return json.loads(json.dumps(store.section('lockers', lambda: _seed_lockers(locker_areas))))


def update_locker(locker_id, patch):
    if use_db():
        column_map = {'status': 'status', 'holder_key': 'holder_key', 'reserved_at': 'reserved_at'}
        keys = [column_map[k] for k in patch]
        result = deps.db_execute(
            'UPDATE lockers SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE locker_id=%s',
            tuple(patch[k] for k in patch) + (locker_id,))
        if result is None:
            raise ConnectionError('櫃子租借資料庫寫入失敗')
        return True
    with store.lock:
        items = store.section('lockers', list)
        target = next((lk for lk in items if lk['locker_id'] == locker_id), None)
        if not target:
            return False
        target.update(patch)
        store.save()
        return True
