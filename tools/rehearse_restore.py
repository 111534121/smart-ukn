"""Rehearse recovery in a new directory/database; never overwrite the live app."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import zipfile
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

def run(*args, **kwargs):
    return subprocess.check_output(args, cwd=ROOT, **kwargs)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mysql', action='store_true')
    args = parser.parse_args()
    stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    out = ROOT / 'db_backups' / ('restore_rehearsal_' + stamp)
    out.mkdir(parents=True, exist_ok=False)
    report = {'date': datetime.now().isoformat(), 'working_tree_untouched': True}
    archive = ROOT / 'evidence/integration_20261020/before_20261020_095020.zip'
    manifest = json.loads((archive.parent / 'before_sha256.json').read_text(encoding='utf-8'))
    restored = out / 'restored_source'
    with zipfile.ZipFile(archive) as source:
        assert source.testzip() is None
        for info in source.infolist():
            destination = (restored / info.filename).resolve()
            assert destination.is_relative_to(restored.resolve())
            if info.is_dir():
                continue
            data = source.read(info)
            assert hashlib.sha256(data).hexdigest() == manifest[info.filename]
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
    assert all(hashlib.sha256((restored / name).read_bytes()).hexdigest() == digest
               for name, digest in manifest.items())
    report['snapshot_files_restored_and_hash_verified'] = len(manifest)
    refs = ['c96d8b3^', '5c5bda8^', '021eefd^', '3a510e3', '69fbafd']
    history = []
    for index, ref in enumerate(refs):
        commit = run('git', 'rev-parse', ref).decode().strip()
        target = out / ('historical_' + str(index) + '.zip')
        run('git', 'archive', '--format=zip', '--output=' + str(target), commit)
        with zipfile.ZipFile(target) as source:
            assert source.testzip() is None
            assert 'app.py' in source.namelist()
            compile(source.read('app.py').decode('utf-8-sig'), 'app.py', 'exec')
        history.append({'ref': ref, 'commit': commit, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
    bundle = out / 'all_history.bundle'
    run('git', 'bundle', 'create', str(bundle), '--all')
    run('git', 'bundle', 'verify', str(bundle), stderr=subprocess.STDOUT)
    report['historical_versions_verified'] = history
    report['git_bundle_verified'] = True
    private = ROOT / 'db_backups/release_20261021'
    old_json = private / 'campus_store_before.json'
    if old_json.exists():
        data = old_json.read_bytes()
        (out / 'campus_store_restored.json').write_bytes(data)
        assert json.loads(data) == json.loads((out / 'campus_store_restored.json').read_bytes())
        report['json_restore_verified'] = True
    if args.mysql:
        import app
        config = app.DB_CONFIG
        assert config['host'] in ('localhost', '127.0.0.1')
        conn = app.get_db_connection()
        assert conn is not None, 'Local MySQL is offline'
        database = 'smart_ukn_restore_' + stamp
        assert re.fullmatch(r'smart_ukn_restore_\d{8}_\d{6}', database)
        cursor = conn.cursor()
        cursor.execute('CREATE DATABASE `' + database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
        backup = private / 'before_upgrade.sql'
        sql = backup.read_bytes()
        assert not re.search(rb'(?im)^\s*(?:USE\s|CREATE\s+DATABASE)', sql), 'Dump changes database scope'
        env = dict(os.environ, MYSQL_PWD=config['password'])
        subprocess.run([r'C:\xampp\mysql\bin\mysql.exe', '--no-defaults', '--host=' + config['host'],
                        '--port=' + str(config['port']), '--user=' + config['user'],
                        '--default-character-set=utf8mb4', database], input=sql, env=env, check=True)
        cursor.execute('USE `' + database + '`')
        cursor.execute('SHOW TABLES')
        tables = [row[0] for row in cursor.fetchall()]
        expected = json.loads((private / 'upgrade_report.json').read_text(encoding='utf-8'))['table_count_before']
        assert len(tables) == expected
        counts = {}
        for table in tables:
            assert re.fullmatch(r'[A-Za-z0-9_]+', table)
            cursor.execute('SELECT COUNT(*) FROM `' + table + '`')
            counts[table] = cursor.fetchone()[0]
        assert counts.get('users', 0) > 0 and counts.get('students', 0) > 0
        from teacher_workbench_schema import upgrade_cursor
        upgrade_cursor(cursor)
        assert upgrade_cursor(cursor) == []
        conn.commit()
        report['mysql_restore'] = {'database': database, 'tables_restored': len(tables),
                                   'row_counts': counts, 'upgrade_replay_passed': True,
                                   'live_database_overwritten': False}
        cursor.close()
        conn.close()
    report['private_artifacts'] = str(out.relative_to(ROOT))
    summary = ROOT / 'evidence/restore_20261022/restore_report.json'
    summary.parent.mkdir(parents=True, exist_ok=True)
    summary.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))

if __name__ == '__main__':
    main()
