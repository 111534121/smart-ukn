# -*- coding: utf-8 -*-
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('smart_ukn.sql', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()

# Let's check table rows count in smart_ukn.sql
import re
table_inserts = {}
current_table = None

for line in lines:
    m = re.match(r'INSERT INTO `([^`]+)`', line)
    if m:
        current_table = m.group(1)
        table_inserts[current_table] = table_inserts.get(current_table, 0)
    elif current_table and line.strip().startswith('('):
        table_inserts[current_table] += 1
    elif current_table and line.strip().endswith(';'):
        current_table = None

print("=== Tables with data in smart_ukn.sql ===")
for t, c in sorted(table_inserts.items()):
    print(f"  {t:<28}: {c} rows")

