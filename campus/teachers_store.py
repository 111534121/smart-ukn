"""老師辦公室名錄儲存層 (teacher_directory)：MySQL 優先；離線展示沿用 campus_store.json。跟 campus/facilities_store.py 同一套做法。

每筆資料有兩份內容：
- 欄位本身 = 已上線 (is_published = 1) 給學生看的版本
- pending_data = 教職員送出、等管理員審核的修改 (pending_action 為 新增 / 修改 / 刪除)
新增的資料在核准前 is_published = 0，學生看不到。
表第一次建立、資料是空的時候，用 facilities.TEACHER_OFFICES 灌一次示範資料。
"""
import json

from .common import deps, store, next_id, now_str

TABLE_SQL = """
CREATE TABLE IF NOT EXISTS teacher_directory (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name varchar(50) NOT NULL,
 title varchar(50) DEFAULT NULL,
 dept varchar(100) DEFAULT NULL COMMENT '所屬科系',
 unit varchar(100) DEFAULT NULL COMMENT '服務單位',
 office varchar(20) DEFAULT NULL,
 building varchar(10) DEFAULT NULL,
 floor int DEFAULT NULL,
 ext varchar(30) DEFAULT NULL,
 email varchar(100) DEFAULT NULL,
 office_hours text DEFAULT NULL COMMENT 'JSON：[{weekday,start,end}]',
 photo_url varchar(255) DEFAULT NULL,
 is_published tinyint(1) NOT NULL DEFAULT 0,
 status varchar(10) NOT NULL DEFAULT '待審核' COMMENT '已核准 / 待審核 / 退回',
 pending_action varchar(10) DEFAULT NULL,
 pending_data text DEFAULT NULL,
 submitted_by varchar(50) DEFAULT NULL,
 review_note varchar(200) DEFAULT NULL,
 reviewed_by varchar(50) DEFAULT NULL,
 reviewed_at datetime DEFAULT NULL,
 created_at datetime NOT NULL,
 updated_at datetime NOT NULL,
 KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='老師辦公室名錄'
"""
PROFILE_FIELDS = ('name', 'title', 'dept', 'unit', 'office', 'building', 'floor', 'ext', 'email', 'office_hours', 'photo_url')
META_FIELDS = ('is_published', 'status', 'pending_action', 'pending_data', 'submitted_by', 'review_note',
               'reviewed_by', 'reviewed_at', 'created_at', 'updated_at')
ALL_FIELDS = PROFILE_FIELDS + META_FIELDS


def use_db():
    return deps.fetch_db_rows('SELECT COUNT(*) AS n FROM teacher_directory') is not None


def _seed(teacher_offices):
    """示範資料：科系老師的服務單位預設為該科 (若有另外兼任行政中心則以 unit 為準)；通識中心不是科系，只填服務單位"""
    now = now_str()
    items = []
    for i, t in enumerate(teacher_offices, start=1):
        is_dept = t['dept'].endswith('科') or t['dept'].endswith('系')
        items.append({'id': i, 'name': t['name'], 'title': t['title'], 'dept': t['dept'] if is_dept else '',
                      'unit': t.get('unit') or t['dept'], 'office': t['office'], 'building': t['building'], 'floor': t['floor'],
                      'ext': t['ext'], 'email': t.get('email', ''), 'office_hours': t['office_hours'], 'photo_url': '',
                      'is_published': 1, 'status': '已核准', 'pending_action': None, 'pending_data': None,
                      'submitted_by': '系統示範資料', 'review_note': None, 'reviewed_by': None, 'reviewed_at': None,
                      'created_at': now, 'updated_at': now})
    return items


def _decode(row):
    item = dict(row)
    for key in ('office_hours', 'pending_data'):
        if isinstance(item.get(key), str):
            try:
                item[key] = json.loads(item[key])
            except ValueError:
                item[key] = [] if key == 'office_hours' else None
    item['office_hours'] = item.get('office_hours') or []
    for key in ('reviewed_at', 'created_at', 'updated_at'):
        if item.get(key) is not None:
            item[key] = str(item[key])[:19]
    item['is_published'] = bool(item.get('is_published'))
    return item


def _encode(fields):
    out = dict(fields)
    for key in ('office_hours', 'pending_data'):
        if key in out and out[key] is not None and not isinstance(out[key], str):
            out[key] = json.dumps(out[key], ensure_ascii=False)
    if 'is_published' in out:
        out['is_published'] = 1 if out['is_published'] else 0
    return out


def all_teachers(teacher_offices):
    """全部資料 (含待審核)；teacher_offices 用來在表還是空的時候灌示範資料"""
    if use_db():
        rows = deps.fetch_db_rows('SELECT * FROM teacher_directory ORDER BY unit, id') or []
        if not rows:
            for t in _seed(teacher_offices):
                t = _encode({k: v for k, v in t.items() if k != 'id'})
                deps.db_execute('INSERT INTO teacher_directory (' + ', '.join(ALL_FIELDS) + ') VALUES ('
                                + ', '.join(['%s'] * len(ALL_FIELDS)) + ')', tuple(t[k] for k in ALL_FIELDS))
            rows = deps.fetch_db_rows('SELECT * FROM teacher_directory ORDER BY unit, id') or []
        return [_decode(r) for r in rows]
    return json.loads(json.dumps(store.section('teacher_directory', lambda: _seed(teacher_offices))))


def insert_teacher(fields):
    fields = {**{k: None for k in ALL_FIELDS}, **fields}
    if use_db():
        encoded = _encode(fields)
        result = deps.db_execute('INSERT INTO teacher_directory (' + ', '.join(ALL_FIELDS) + ') VALUES ('
                                 + ', '.join(['%s'] * len(ALL_FIELDS)) + ')', tuple(encoded[k] for k in ALL_FIELDS))
        if result is None:
            raise ConnectionError('老師資料庫寫入失敗')
        return {**fields, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('teacher_directory', list)
        saved = {**fields, 'id': next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


def update_teacher(teacher_id, patch):
    if use_db():
        encoded = _encode(patch)
        keys = list(encoded.keys())
        result = deps.db_execute('UPDATE teacher_directory SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE id=%s',
                                 tuple(encoded[k] for k in keys) + (teacher_id,))
        if result is None:
            raise ConnectionError('老師資料庫寫入失敗')
        return True
    with store.lock:
        items = store.section('teacher_directory', list)
        target = next((t for t in items if t['id'] == teacher_id), None)
        if not target:
            return False
        target.update(patch)
        store.save()
        return True


def delete_teacher(teacher_id):
    if use_db():
        if deps.db_execute('DELETE FROM teacher_directory WHERE id=%s', (teacher_id,)) is None:
            raise ConnectionError('老師資料庫寫入失敗')
        return
    with store.lock:
        items = store.section('teacher_directory', list)
        items[:] = [t for t in items if t['id'] != teacher_id]
        store.save()
