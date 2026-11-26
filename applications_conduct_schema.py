"""Create only application/conduct tables from the canonical init_db DDL, without reseeding."""
import ast
from pathlib import Path
import re

TABLES = ('online_applications', 'conduct_records', 'conduct_evaluations', 'conduct_settings')

def definitions():
    tree = ast.parse(Path(__file__).with_name('init_db.py').read_text(encoding='utf-8-sig'))
    found = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'execute' and node.args:
            value = node.args[0]
            if isinstance(value, ast.Constant) and isinstance(value.value, str):
                match = re.match(r'\s*CREATE TABLE IF NOT EXISTS `([^`]+)`', value.value)
                if match and match[1] in TABLES:
                    found[match[1]] = value.value
    if set(found) != set(TABLES):
        raise RuntimeError('Canonical application/conduct DDL is incomplete')
    return found

def upgrade(connection):
    ddl = definitions()
    added = []
    cursor = connection.cursor()
    try:
        for table in TABLES:
            cursor.execute('SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s', (table,))
            exists = cursor.fetchone()[0] > 0
            cursor.execute(ddl[table])
            if not exists:
                added.append(table)
        connection.commit()
        return added
    finally:
        cursor.close()

if __name__ == '__main__':
    from app import get_db_connection
    connection = get_db_connection()
    if connection is None:
        raise SystemExit('MySQL offline; no changes made')
    try:
        print('Created tables:', upgrade(connection))
    finally:
        connection.close()
