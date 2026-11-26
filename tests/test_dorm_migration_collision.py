import json
from types import SimpleNamespace
import integration_schema

def test_json_id_collision_preserves_database_record_and_assigns_new_id(tmp_path, monkeypatch):
    monkeypatch.setattr(integration_schema, 'upgrade_columns', lambda cursor: None)
    item = dict(id=1, student_id='S112001', student_name='示範學生', semester='115-2',
                room_type='四人房', commute_minutes=60, special_needs='', emergency_phone='0900000000',
                stage=0, status='進行中', bed='', note='', history=[], created_at='2026-10-22 00:00:00')
    source = tmp_path / 'campus_store.json'
    source.write_text(json.dumps({'dorm_applications': [item]}), encoding='utf-8')
    class Cursor:
        result = None
        def __init__(self): self.inserts = []
        def execute(self, sql, params=()):
            if sql.startswith('SELECT id'):
                self.result = {'id': 1} if 'WHERE id=' in sql else None
            if sql.startswith('INSERT INTO dorm_applications'):
                self.inserts.append((sql, params))
        def fetchone(self): return self.result
        def close(self): pass
    cursor = Cursor()
    conn = SimpleNamespace(cursor=lambda **kw: cursor, commit=lambda: None, rollback=lambda: None)
    assert integration_schema.upgrade(conn, source) == 1
    sql, params = cursor.inserts[0]
    assert sql.startswith('INSERT INTO dorm_applications (student_id,')
    assert params[0] == 'S112001'
    assert json.loads(source.read_text(encoding='utf-8'))['dorm_applications'][0]['id'] == 1
