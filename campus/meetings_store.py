"""線上會議儲存層：MySQL 優先；離線展示沿用 campus_store.json。跟 campus/teachers_store.py 同一套做法。

meetings         一場會議 (主持人、時間、Jitsi 會議室名稱、邀請碼)
meeting_members  受邀或用邀請碼加入的人；member_key 學生用學號、其他身分用 user:帳號 (同 common.user_key)
"""
import json

from .common import deps, store, next_id

MEETINGS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS meetings (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 title varchar(80) NOT NULL,
 description varchar(500) DEFAULT NULL,
 host_key varchar(100) NOT NULL,
 host_name varchar(50) NOT NULL,
 host_role varchar(10) NOT NULL,
 start_at datetime NOT NULL,
 duration_min int NOT NULL DEFAULT 60,
 room_name varchar(80) NOT NULL,
 invite_code varchar(12) NOT NULL,
 allow_code_join tinyint(1) NOT NULL DEFAULT 1,
 status varchar(10) NOT NULL DEFAULT '排定' COMMENT '排定 / 已取消',
 created_at datetime NOT NULL,
 UNIQUE KEY uq_invite_code (invite_code),
 KEY idx_start (start_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='線上會議'
"""
MEMBERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS meeting_members (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 meeting_id int NOT NULL,
 member_key varchar(100) NOT NULL,
 display_name varchar(50) NOT NULL,
 source varchar(10) NOT NULL COMMENT '邀請 / 班級 / 邀請碼',
 invited_by varchar(50) DEFAULT NULL,
 created_at datetime NOT NULL,
 UNIQUE KEY uq_meeting_member (meeting_id, member_key),
 KEY idx_member (member_key),
 CONSTRAINT fk_meeting_member FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='線上會議成員'
"""
MEETING_FIELDS = ('title', 'description', 'host_key', 'host_name', 'host_role', 'start_at', 'duration_min',
                  'room_name', 'invite_code', 'allow_code_join', 'status', 'created_at')
MEMBER_FIELDS = ('meeting_id', 'member_key', 'display_name', 'source', 'invited_by', 'created_at')


def use_db():
    return deps.fetch_db_rows('SELECT COUNT(*) AS n FROM meeting_members') is not None


def _decode(row):
    item = dict(row)
    for key in ('start_at', 'created_at'):
        item[key] = str(item[key])[:16] if key == 'start_at' else str(item[key])[:19]
    item['allow_code_join'] = bool(item['allow_code_join'])
    return item


def all_meetings():
    if use_db():
        return [_decode(r) for r in deps.fetch_db_rows('SELECT * FROM meetings ORDER BY start_at') or []]
    return json.loads(json.dumps(store.section('meetings', list)))


def all_members(meeting_id=None):
    if use_db():
        if meeting_id is None:
            rows = deps.fetch_db_rows('SELECT * FROM meeting_members') or []
        else:
            rows = deps.fetch_db_rows('SELECT * FROM meeting_members WHERE meeting_id = %s', (meeting_id,)) or []
        return [{**r, 'created_at': str(r['created_at'])[:19]} for r in rows]
    items = json.loads(json.dumps(store.section('meeting_members', list)))
    return items if meeting_id is None else [m for m in items if m['meeting_id'] == meeting_id]


def insert_meeting(fields):
    if use_db():
        result = deps.db_execute('INSERT INTO meetings (' + ', '.join(MEETING_FIELDS) + ') VALUES ('
                                 + ', '.join(['%s'] * len(MEETING_FIELDS)) + ')',
                                 tuple(int(fields[k]) if k == 'allow_code_join' else fields[k] for k in MEETING_FIELDS))
        if result is None:
            raise ConnectionError('會議資料庫寫入失敗')
        return {**fields, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('meetings', list)
        saved = {**fields, 'id': next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


def update_meeting(meeting_id, patch):
    if use_db():
        keys = list(patch)
        if deps.db_execute('UPDATE meetings SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE id=%s',
                           tuple(patch[k] for k in keys) + (meeting_id,)) is None:
            raise ConnectionError('會議資料庫寫入失敗')
        return
    with store.lock:
        target = next((m for m in store.section('meetings', list) if m['id'] == meeting_id), None)
        if target:
            target.update(patch)
            store.save()


def add_members(members):
    """members：[{meeting_id, member_key, display_name, source, invited_by, created_at}]；已在會議裡的人略過"""
    if not members:
        return 0
    if use_db():
        added = 0
        for m in members:
            result = deps.db_execute('INSERT IGNORE INTO meeting_members (' + ', '.join(MEMBER_FIELDS) + ') VALUES ('
                                     + ', '.join(['%s'] * len(MEMBER_FIELDS)) + ')', tuple(m[k] for k in MEMBER_FIELDS))
            if result is None:
                raise ConnectionError('會議資料庫寫入失敗')
            added += result['rowcount']
        return added
    with store.lock:
        items = store.section('meeting_members', list)
        existing = {(m['meeting_id'], m['member_key']) for m in items}
        added = 0
        for m in members:
            if (m['meeting_id'], m['member_key']) not in existing:
                items.append({**m, 'id': next_id(items)})
                existing.add((m['meeting_id'], m['member_key']))
                added += 1
        store.save()
        return added


def remove_member(meeting_id, member_key):
    if use_db():
        deps.db_execute('DELETE FROM meeting_members WHERE meeting_id = %s AND member_key = %s', (meeting_id, member_key))
        return
    with store.lock:
        items = store.section('meeting_members', list)
        items[:] = [m for m in items if not (m['meeting_id'] == meeting_id and m['member_key'] == member_key)]
        store.save()
