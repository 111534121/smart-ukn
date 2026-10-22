"""報表／文件庫儲存層：MySQL 優先；離線展示沿用 campus_store.json。跟 campus/dorm_store.py 同一套做法。"""
import json

from .common import deps, store, next_id

FILES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS report_files (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 title varchar(100) NOT NULL,
 category varchar(50) NOT NULL,
 description varchar(500) DEFAULT NULL,
 file_url varchar(255) NOT NULL,
 file_name varchar(255) NOT NULL,
 file_type varchar(20) DEFAULT NULL,
 allowed_roles varchar(100) NOT NULL,
 uploaded_by varchar(50) NOT NULL,
 uploaded_by_username varchar(50) NOT NULL,
 uploaded_at datetime NOT NULL,
 download_count int NOT NULL DEFAULT 0,
 KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：檔案'
"""
VIEW_LOGS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS report_view_logs (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 file_id int NOT NULL,
 role varchar(10) NOT NULL,
 viewed_at datetime NOT NULL,
 KEY idx_rvl_file (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：瀏覽紀錄 (不存帳號)'
"""
DOWNLOAD_LOGS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS report_download_logs (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 file_id int NOT NULL,
 username varchar(50) DEFAULT NULL,
 student_id varchar(20) DEFAULT NULL,
 role varchar(10) NOT NULL,
 result varchar(10) NOT NULL,
 downloaded_at datetime NOT NULL,
 KEY idx_rdl_file (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：下載稽核紀錄'
"""
FAVORITES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS report_favorites (
 id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
 file_id int NOT NULL,
 user_key varchar(100) NOT NULL,
 username varchar(50) DEFAULT NULL,
 student_id varchar(20) DEFAULT NULL,
 created_at datetime NOT NULL,
 UNIQUE KEY uq_file_user (file_id, user_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='報表與文件庫：收藏'
"""
FILE_FIELDS = ('title', 'category', 'description', 'file_url', 'file_name', 'file_type',
               'allowed_roles', 'uploaded_by', 'uploaded_by_username', 'uploaded_at', 'download_count')
VIEW_LOG_FIELDS = ('file_id', 'role', 'viewed_at')
DOWNLOAD_LOG_FIELDS = ('file_id', 'username', 'student_id', 'role', 'result', 'downloaded_at')
FAVORITE_FIELDS = ('file_id', 'user_key', 'username', 'student_id', 'created_at')


def use_db():
    return deps.fetch_db_rows('SELECT COUNT(*) AS n FROM report_files') is not None


def _decode_file(row):
    item = dict(row)
    item['allowed_roles'] = item['allowed_roles'].split(',') if item['allowed_roles'] else ['all']
    item['uploaded_at'] = str(item['uploaded_at'])[:19]
    return item


def _decode_time(row, key):
    item = dict(row)
    item[key] = str(item[key])[:19]
    return item


def all_files():
    if use_db():
        return [_decode_file(r) for r in deps.fetch_db_rows('SELECT * FROM report_files ORDER BY id') or []]
    return json.loads(json.dumps(store.section('report_files', list)))


def insert_file(fields):
    fields = {**fields, 'allowed_roles': ','.join(fields['allowed_roles'])}
    if use_db():
        result = deps.db_execute(
            'INSERT INTO report_files (' + ', '.join(FILE_FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(FILE_FIELDS)) + ')',
            tuple(fields[k] for k in FILE_FIELDS))
        if result is None:
            raise ConnectionError('報表資料庫寫入失敗')
        return _decode_file({**fields, 'id': result['lastrowid']})
    with store.lock:
        items = store.section('report_files', list)
        saved = {**fields, 'id': next_id(items), 'allowed_roles': fields['allowed_roles'].split(',')}
        items.append(saved)
        store.save()
        return dict(saved)


def update_file(file_id, patch):
    if use_db():
        keys = list(patch.keys())
        result = deps.db_execute(
            'UPDATE report_files SET ' + ', '.join(f'{k}=%s' for k in keys) + ' WHERE id=%s',
            tuple(patch[k] for k in keys) + (file_id,))
        if result is None:
            raise ConnectionError('報表資料庫寫入失敗')
        return next((f for f in all_files() if f['id'] == file_id), None)
    with store.lock:
        items = store.section('report_files', list)
        target = next((f for f in items if f['id'] == file_id), None)
        if not target:
            return None
        target.update(patch)
        store.save()
        return dict(target)


def delete_file(file_id):
    if use_db():
        target = next((f for f in all_files() if f['id'] == file_id), None)
        if not target:
            return None
        result = deps.db_execute('DELETE FROM report_files WHERE id=%s', (file_id,))
        if result is None:
            raise ConnectionError('報表資料庫寫入失敗')
        return target
    with store.lock:
        items = store.section('report_files', list)
        target = next((f for f in items if f['id'] == file_id), None)
        if not target:
            return None
        items.remove(target)
        store.save()
        return dict(target)


def all_view_logs():
    if use_db():
        return [_decode_time(r, 'viewed_at') for r in deps.fetch_db_rows('SELECT * FROM report_view_logs ORDER BY id') or []]
    return json.loads(json.dumps(store.section('report_view_logs', list)))


def add_view_log(fields):
    if use_db():
        result = deps.db_execute(
            'INSERT INTO report_view_logs (' + ', '.join(VIEW_LOG_FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(VIEW_LOG_FIELDS)) + ')',
            tuple(fields[k] for k in VIEW_LOG_FIELDS))
        if result is None:
            raise ConnectionError('瀏覽紀錄資料庫寫入失敗')
        return
    with store.lock:
        items = store.section('report_view_logs', list)
        items.append({**fields, 'id': next_id(items)})
        store.save()


def all_download_logs():
    if use_db():
        return [_decode_time(r, 'downloaded_at') for r in deps.fetch_db_rows('SELECT * FROM report_download_logs ORDER BY id') or []]
    return json.loads(json.dumps(store.section('report_download_logs', list)))


def add_download_log(fields):
    if use_db():
        result = deps.db_execute(
            'INSERT INTO report_download_logs (' + ', '.join(DOWNLOAD_LOG_FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(DOWNLOAD_LOG_FIELDS)) + ')',
            tuple(fields[k] for k in DOWNLOAD_LOG_FIELDS))
        if result is None:
            raise ConnectionError('下載紀錄資料庫寫入失敗')
        return
    with store.lock:
        items = store.section('report_download_logs', list)
        items.append({**fields, 'id': next_id(items)})
        store.save()


def all_favorites():
    if use_db():
        return [_decode_time(r, 'created_at') for r in deps.fetch_db_rows('SELECT * FROM report_favorites ORDER BY id') or []]
    return json.loads(json.dumps(store.section('report_favorites', list)))


def add_favorite(fields):
    if use_db():
        try:
            result = deps.db_execute(
                'INSERT INTO report_favorites (' + ', '.join(FAVORITE_FIELDS) + ') VALUES (' + ', '.join(['%s'] * len(FAVORITE_FIELDS)) + ')',
                tuple(fields[k] for k in FAVORITE_FIELDS))
        except Exception as exc:
            if getattr(exc, 'errno', None) == 1062:  # 已收藏過，當成冪等成功
                return
            raise
        if result is None:
            raise ConnectionError('收藏資料庫寫入失敗')
        return
    with store.lock:
        items = store.section('report_favorites', list)
        items.append({**fields, 'id': next_id(items)})
        store.save()


def remove_favorite(file_id, user_key):
    if use_db():
        result = deps.db_execute('DELETE FROM report_favorites WHERE file_id=%s AND user_key=%s', (file_id, user_key))
        if result is None:
            raise ConnectionError('收藏資料庫寫入失敗')
        return
    with store.lock:
        items = store.section('report_favorites', list)
        target = next((f for f in items if f['file_id'] == file_id and f['user_key'] == user_key), None)
        if target:
            items.remove(target)
            store.save()
