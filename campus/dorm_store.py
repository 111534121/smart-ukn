"""宿舍申請儲存：MySQL 優先；離線展示沿用 campus_store.json。"""
import json
from .common import deps, store, next_id

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS dorm_applications (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 student_id varchar(20) NOT NULL,
 student_name varchar(50) NOT NULL,
 semester varchar(20) NOT NULL,
 room_type varchar(20) NOT NULL,
 commute_minutes int NOT NULL,
 special_needs varchar(200) NOT NULL DEFAULT '',
 emergency_phone varchar(20) NOT NULL,
 stage int NOT NULL DEFAULT 0,
 status varchar(20) NOT NULL DEFAULT '進行中',
 bed varchar(20) NOT NULL DEFAULT '',
 note varchar(200) NOT NULL DEFAULT '',
 history_json longtext NOT NULL,
 created_at datetime NOT NULL,
 UNIQUE KEY uq_dorm_student_semester (student_id, semester),
 CONSTRAINT fk_dorm_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""
FIELDS = ('student_id', 'student_name', 'semester', 'room_type', 'commute_minutes', 'special_needs',
          'emergency_phone', 'stage', 'status', 'bed', 'note', 'history_json', 'created_at')


def use_db():
    return deps.fetch_db_rows('SELECT COUNT(*) AS n FROM dorm_applications') is not None


def decode(row):
    item = dict(row)
    item['history'] = json.loads(item.pop('history_json'))
    item['created_at'] = str(item['created_at'])[:19]
    return item


def all_applications():
    if use_db():
        return [decode(r) for r in deps.fetch_db_rows('SELECT * FROM dorm_applications ORDER BY id DESC') or []]
    # A copy keeps uncommitted changes out of the shared store.
    return json.loads(json.dumps(store.section('dorm_applications', list)))


def insert(item):
    if use_db():
        values = {**item, 'history_json': json.dumps(item['history'], ensure_ascii=False)}
        try:
            result = deps.db_execute('INSERT INTO dorm_applications (' + ', '.join(FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(FIELDS)) + ')', tuple(values[k] for k in FIELDS))
        except Exception as exc:
            if getattr(exc, 'errno', None) == 1062:
                raise ValueError('這個學期已經申請過了') from exc
            raise
        if result is None:
            raise ConnectionError('宿舍資料庫寫入失敗')
        return {**item, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('dorm_applications', list)
        if any(a['student_id'] == item['student_id'] and a['semester'] == item['semester'] for a in items):
            raise ValueError('這個學期已經申請過了')
        saved = {**item, 'id': next_id(items)}
        items.append(saved); store.save()
        return saved


def save_review(item, previous_stage):
    if use_db():
        result = deps.db_execute('UPDATE dorm_applications SET stage=%s, status=%s, bed=%s, note=%s, history_json=%s WHERE id=%s AND stage=%s AND status=%s',
            (item['stage'], item['status'], item['bed'], item['note'], json.dumps(item['history'], ensure_ascii=False), item['id'], previous_stage, '進行中'))
        if result is None:
            raise ConnectionError('宿舍資料庫寫入失敗')
        return result['rowcount'] == 1
    with store.lock:
        items = store.section('dorm_applications', list)
        target = next((a for a in items if a['id'] == item['id']), None)
        if not target or target['status'] != '進行中' or target['stage'] != previous_stage:
            return False
        target.update(item); store.save()
        return True
