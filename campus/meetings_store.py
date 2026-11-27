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
 invite_code varchar(20) NOT NULL,
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


# ---------- 會議留痕：會中文字討論、誰有進會議室、會議紀錄與保存期限 ----------
# meeting_messages    會議裡的文字討論 (誰、什麼時候、說了什麼)
# meeting_attendance  按下「加入視訊」的紀錄 = 實際出席的人 (第一次 / 最後一次進入時間、進入次數)
# meeting_records     會議紀錄 (主持人寫)、保存幾個月；過了保存期限，上面三種資料一起刪除

MESSAGES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS meeting_messages (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 meeting_id int NOT NULL,
 sender_key varchar(100) NOT NULL,
 sender_name varchar(50) NOT NULL,
 content varchar(500) NOT NULL,
 created_at datetime NOT NULL,
 KEY idx_meeting (meeting_id, id),
 CONSTRAINT fk_meeting_message FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='線上會議文字討論'
"""
ATTENDANCE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS meeting_attendance (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 meeting_id int NOT NULL,
 member_key varchar(100) NOT NULL,
 display_name varchar(50) NOT NULL,
 first_joined_at datetime NOT NULL,
 last_joined_at datetime NOT NULL,
 join_count int NOT NULL DEFAULT 1,
 UNIQUE KEY uq_meeting_attendee (meeting_id, member_key),
 CONSTRAINT fk_meeting_attendance FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='線上會議出席紀錄'
"""
RECORDS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS meeting_records (
 meeting_id int NOT NULL PRIMARY KEY,
 minutes text,
 keep_months int NOT NULL DEFAULT 12 COMMENT '保存幾個月 (3 / 6 / 12)',
 updated_by varchar(50) DEFAULT NULL,
 updated_at datetime DEFAULT NULL,
 CONSTRAINT fk_meeting_record FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='線上會議紀錄與保存期限'
"""
LOG_TABLES_SQL = (MESSAGES_TABLE_SQL, ATTENDANCE_TABLE_SQL, RECORDS_TABLE_SQL)
_log_tables_ready = False


def use_log_db():
    """會議存在 MySQL 時，留痕也存 MySQL；三張表還沒建就自動建立 (不用重跑 init_db.py)"""
    global _log_tables_ready
    if not use_db():
        return False
    if not _log_tables_ready:
        for sql in LOG_TABLES_SQL:
            deps.db_execute(sql)
        _log_tables_ready = True
    return True


def list_messages(meeting_id, after_id=0):
    if use_log_db():
        rows = deps.fetch_db_rows('SELECT * FROM meeting_messages WHERE meeting_id = %s AND id > %s ORDER BY id',
                                  (meeting_id, after_id)) or []
        return [{**r, 'created_at': str(r['created_at'])[:19]} for r in rows]
    return [dict(m) for m in store.section('meeting_messages', list) if m['meeting_id'] == meeting_id and m['id'] > after_id]


def add_message(fields):
    """fields：{meeting_id, sender_key, sender_name, content, created_at}"""
    if use_log_db():
        keys = ('meeting_id', 'sender_key', 'sender_name', 'content', 'created_at')
        result = deps.db_execute('INSERT INTO meeting_messages (' + ', '.join(keys) + ') VALUES (%s, %s, %s, %s, %s)',
                                 tuple(fields[k] for k in keys))
        if result is None:
            raise ConnectionError('會議資料庫寫入失敗')
        return {**fields, 'id': result['lastrowid']}
    with store.lock:
        items = store.section('meeting_messages', list)
        saved = {**fields, 'id': next_id(items)}
        items.append(saved)
        store.save()
        return dict(saved)


def record_attendance(meeting_id, member_key, display_name, when):
    """按一次「加入視訊」記一次；同一個人重複進出只更新最後進入時間與次數"""
    if use_log_db():
        deps.db_execute('INSERT INTO meeting_attendance (meeting_id, member_key, display_name, first_joined_at, last_joined_at) '
                        'VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE last_joined_at = VALUES(last_joined_at), '
                        'join_count = join_count + 1', (meeting_id, member_key, display_name, when, when))
        return
    with store.lock:
        items = store.section('meeting_attendance', list)
        row = next((a for a in items if a['meeting_id'] == meeting_id and a['member_key'] == member_key), None)
        if row:
            row.update(last_joined_at=when, join_count=row['join_count'] + 1)
        else:
            items.append({'id': next_id(items), 'meeting_id': meeting_id, 'member_key': member_key, 'display_name': display_name,
                          'first_joined_at': when, 'last_joined_at': when, 'join_count': 1})
        store.save()


def list_attendance(meeting_id):
    if use_log_db():
        rows = deps.fetch_db_rows('SELECT * FROM meeting_attendance WHERE meeting_id = %s ORDER BY first_joined_at',
                                  (meeting_id,)) or []
        return [{**r, 'first_joined_at': str(r['first_joined_at'])[:19], 'last_joined_at': str(r['last_joined_at'])[:19]}
                for r in rows]
    return sorted((dict(a) for a in store.section('meeting_attendance', list) if a['meeting_id'] == meeting_id),
                  key=lambda a: a['first_joined_at'])


def get_record(meeting_id):
    """{minutes, keep_months, updated_by, updated_at}；還沒寫過回傳 None"""
    if use_log_db():
        rows = deps.fetch_db_rows('SELECT * FROM meeting_records WHERE meeting_id = %s', (meeting_id,)) or []
        return {**rows[0], 'updated_at': str(rows[0]['updated_at'] or '')[:19]} if rows else None
    row = store.section('meeting_records', dict).get(str(meeting_id))
    return dict(row) if row else None


def save_record(meeting_id, minutes, keep_months, updated_by, updated_at):
    if use_log_db():
        if deps.db_execute('INSERT INTO meeting_records (meeting_id, minutes, keep_months, updated_by, updated_at) '
                           'VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE minutes = VALUES(minutes), '
                           'keep_months = VALUES(keep_months), updated_by = VALUES(updated_by), updated_at = VALUES(updated_at)',
                           (meeting_id, minutes, keep_months, updated_by, updated_at)) is None:
            raise ConnectionError('會議資料庫寫入失敗')
        return
    with store.lock:
        store.section('meeting_records', dict)[str(meeting_id)] = {
            'meeting_id': meeting_id, 'minutes': minutes, 'keep_months': keep_months,
            'updated_by': updated_by, 'updated_at': updated_at}
        store.save()


def purge_logs(meeting_id, keep_months, when):
    """保存期限到了：刪掉這場會議的討論、出席與會議紀錄內容。
    meeting_records 留一列 (minutes 清空、updated_by = 系統)，之後看得出「已過保存期限、已刪除」，期限也不會被重算"""
    if use_log_db():
        for table in ('meeting_messages', 'meeting_attendance'):
            deps.db_execute(f'DELETE FROM {table} WHERE meeting_id = %s', (meeting_id,))
    else:
        with store.lock:
            for key in ('meeting_messages', 'meeting_attendance'):
                items = store.section(key, list)
                items[:] = [x for x in items if x['meeting_id'] != meeting_id]
            store.save()
    save_record(meeting_id, None, keep_months, PURGED_BY, when)


PURGED_BY = '系統 (已過保存期限)'
