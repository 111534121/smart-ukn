# -*- coding: utf-8 -*-
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('smart_ukn.sql', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.splitlines()
print(f"Total lines in smart_ukn.sql: {len(lines)}")

# 1. Search for \ufffd (replacement character)
mojibake_lines = []
for idx, line in enumerate(lines, 1):
    if '\ufffd' in line:
        mojibake_lines.append((idx, line[:100]))

print(f"Lines with \\ufffd: {len(mojibake_lines)}")
for m in mojibake_lines:
    print(f"  Line {m[0]}: {m[1]}")

# 2. Search for \u unicode escapes
unicode_escape_lines = []
for idx, line in enumerate(lines, 1):
    if re.search(r'\\u[0-9a-fA-F]{4}', line):
        unicode_escape_lines.append((idx, line[:100]))

print(f"Lines with \\u unicode escape sequences: {len(unicode_escape_lines)}")
for u in unicode_escape_lines:
    print(f"  Line {u[0]}: {u[1]}")

# 3. Check users table definition and inserts
print("\n--- Users Table in smart_ukn.sql ---")
in_users = False
for idx, line in enumerate(lines, 1):
    if 'CREATE TABLE `users`' in line:
        in_users = True
    if in_users:
        print(f"{idx}: {line}")
        if line.endswith(';') and ('INSERT INTO' not in line):
            in_users = False
            break

for idx, line in enumerate(lines, 1):
    if 'INSERT INTO `users`' in line:
        for offset in range(15):
            if idx + offset < len(lines):
                print(f"{idx+offset}: {lines[idx+offset-1]}")
                if lines[idx+offset-1].strip().endswith(';'):
                    break
        break

