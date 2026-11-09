# -*- coding: utf-8 -*-
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('smart_ukn.sql', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()

# Scan for odd character patterns
patterns = [
    (r'\?{2,}', "連續問號 (亂碼遺留)"),
    (r'[\x00-\x08\x0b\x0c\x0e-\x1f]', "不可見控制字元"),
    (r'NULL,\s*NULL,\s*NULL,\s*NULL', "多重連續空值"),
]

for pat, desc in patterns:
    matches = []
    for idx, l in enumerate(lines, 1):
        if re.search(pat, l):
            matches.append((idx, l[:120]))
    print(f"\nPattern: {desc} (count: {len(matches)})")
    for m in matches[:10]:
        print(f"  Line {m[0]}: {m[1]}")

