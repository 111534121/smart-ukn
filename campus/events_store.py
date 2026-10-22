"""活動報名儲存層：MySQL 優先 (events / event_registrations)；離線展示沿用 campus_store.json。

跟 campus/dorm_store.py 同一套做法：有表就走 MySQL，沒有 (或連不上) 就退回 JSON 檔，
路由層 (campus/events.py) 不需要知道資料實際存在哪裡，只呼叫這裡的函式。

報名時「查重複、查名額、寫入」這段的鎖 (store.lock) 由呼叫端 (campus/events.py) 持有，
涵蓋整個檢查到寫入的過程，避免兩人同時報名造成超額——這裡的寫入函式本身另外加鎖
只是為了單獨呼叫時也安全 (RLock 可重入，巢狀加鎖不會卡死)。
"""
import json

from .common import deps, store, next_id

EVENTS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS events (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 title varchar(100) NOT NULL,
 description text,
 image_url varchar(500) DEFAULT NULL,
 location varchar(100) NOT NULL,
 event_date date NOT NULL,
 event_time varchar(5) DEFAULT NULL,
 registration_deadline date NOT NULL,
 capacity int NOT NULL,
 cancelled tinyint(1) NOT NULL DEFAULT 0,
 created_by varchar(50) DEFAULT NULL,
 created_at datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活動報名：活動本身'
"""

REGISTRATIONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS event_registrations (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 event_id int NOT NULL,
 student_id varchar(20) NOT NULL,
 full_name varchar(50) NOT NULL,
 email varchar(100) NOT NULL,
 phone varchar(30) DEFAULT NULL,
 age int NOT NULL,
 note varchar(200) DEFAULT NULL,
 status varchar(10) NOT NULL DEFAULT '已報名',
 checkin_code varchar(64) NOT NULL,
 registered_by_key varchar(100) DEFAULT NULL,
 registered_by_role varchar(10) DEFAULT NULL,
 created_at datetime NOT NULL,
 cancelled_at datetime DEFAULT NULL,
 checked_in tinyint(1) NOT NULL DEFAULT 0,
 checked_in_at datetime DEFAULT NULL,
 reminded tinyint(1) NOT NULL DEFAULT 0,
 rating int DEFAULT NULL,
 feedback_comment varchar(500) DEFAULT NULL,
 feedback_at datetime DEFAULT NULL,
 UNIQUE KEY uq_checkin_code (checkin_code),
 KEY idx_event_status (event_id, status),
 CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活動報名：報名紀錄'
"""

EVENT_FIELDS = ('title', 'description', 'image_url', 'location', 'event_date', 'event_time',
                 'registration_deadline', 'capacity', 'cancelled', 'created_by', 'created_at')
REG_FIELDS = ('event_id', 'student_id', 'full_name', 'email', 'phone', 'age', 'note', 'status',
              'checkin_code', 'registered_by_key', 'registered_by_role', 'created_at', 'cancelled_at',
              'checked_in', 'checked_in_at', 'reminded', 'rating', 'feedback_comment', 'feedback_at')


def use_db():
    return deps.fetch_db_rows('SELECT COUNT(*) AS n FROM events') is not None


def _decode_event(row):
    item = dict(row)
    item['event_date'] = str(item['event_date'])
    item['registration_deadline'] = str(item['registration_deadline'])
    item['created_at'] = str(item['created_at'])[:19]
    item['cancelled'] = bool(item['cancelled'])
    item['event_time'] = item.get('event_time') or ''
    item['description'] = item.get('description') or ''
    item['image_url'] = item.get('image_url') or ''
    return item


def _decode_registration(row):
    item = dict(row)
    item['created_at'] = str(item['created_at'])[:19]
    item['cancelled_at'] = str(item['cancelled_at'])[:19] if item.get('cancelled_at') else None
    item['checked_in_at'] = str(item['checked_in_at'])[:19] if item.get('checked_in_at') else None
    item['feedback_at'] = str(item['feedback_at'])[:19] if item.get('feedback_at') else None
    item['checked_in'] = bool(item['checked_in'])
    item['reminded'] = bool(item['reminded'])
    item['phone'] = item.get('phone') or ''
    item['note'] = item.get('note') or ''
    return item


def all_events():
    if use_db():
        return [_decode_event(r) for r in deps.fetch_db_rows('SELECT * FROM events ORDER BY event_date, id') or []]
    # 回傳複本，呼叫端改動不會直接動到 store 裡的原始資料，跟 MySQL 模式回傳新字典的行為一致
    return json.loads(json.dumps(store.section('events', list)))


def get_event(event_id):
    return next((e for e in all_events() if e['id'] == event_id), None)


def insert_event(fields):
    if use_db():
        result = deps.db_execute(
            'INSERT INTO events (' + ', '.join(EVENT_FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(EVENT_FIELDS)) + ')',
            tuple(fields[k] for k in EVENT_FIELDS))
        if result is None:
            raise ConnectionError('活動資料庫寫入失敗')
        return {**fields, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('events', list)
        saved = {**fields, 'id': next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


def update_event(event_id, patch):
    """通用部分欄位更新；回傳更新後的活動，找不到回傳 None"""
    if not patch:
        return get_event(event_id)
    if use_db():
        keys = list(patch.keys())
        result = deps.db_execute(
            'UPDATE events SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE id=%s',
            tuple(patch[k] for k in keys) + (event_id,))
        if result is None:
            raise ConnectionError('活動資料庫寫入失敗')
        return get_event(event_id)
    with store.lock:
        items = store.section('events', list)
        target = next((e for e in items if e['id'] == event_id), None)
        if not target:
            return None
        target.update(patch)
        store.save()
        return dict(target)


def all_registrations():
    if use_db():
        return [_decode_registration(r) for r in deps.fetch_db_rows('SELECT * FROM event_registrations ORDER BY id') or []]
    return json.loads(json.dumps(store.section('event_registrations', list)))


def get_registration(reg_id):
    return next((r for r in all_registrations() if r['id'] == reg_id), None)


def insert_registration(fields):
    if use_db():
        result = deps.db_execute(
            'INSERT INTO event_registrations (' + ', '.join(REG_FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(REG_FIELDS)) + ')',
            tuple(fields[k] for k in REG_FIELDS))
        if result is None:
            raise ConnectionError('報名資料庫寫入失敗')
        return {**fields, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('event_registrations', list)
        saved = {**fields, 'id': next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


def update_registration(reg_id, patch):
    """通用部分欄位更新 (取消/簽到/編輯/候補轉正取/提醒/評分都走這個)；回傳更新後的報名，找不到回傳 None"""
    if not patch:
        return get_registration(reg_id)
    if use_db():
        keys = list(patch.keys())
        result = deps.db_execute(
            'UPDATE event_registrations SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE id=%s',
            tuple(patch[k] for k in keys) + (reg_id,))
        if result is None:
            raise ConnectionError('報名資料庫寫入失敗')
        return get_registration(reg_id)
    with store.lock:
        items = store.section('event_registrations', list)
        target = next((r for r in items if r['id'] == reg_id), None)
        if not target:
            return None
        target.update(patch)
        store.save()
        return dict(target)


def delete_registration(reg_id):
    """整筆刪除 (跟取消不同)；回傳被刪除的那筆，找不到回傳 None"""
    if use_db():
        target = get_registration(reg_id)
        if not target:
            return None
        result = deps.db_execute('DELETE FROM event_registrations WHERE id=%s', (reg_id,))
        if result is None:
            raise ConnectionError('報名資料庫寫入失敗')
        return target
    with store.lock:
        items = store.section('event_registrations', list)
        target = next((r for r in items if r['id'] == reg_id), None)
        if not target:
            return None
        items.remove(target)
        store.save()
        return dict(target)
