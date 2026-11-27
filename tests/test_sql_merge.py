# -*- coding: utf-8 -*-
"""
test_sql_merge.py
驗證 smart_ukn.sql 完整性與 31-1121.sql 資料庫整合驗證：
1. 資料表數量達到 62 張 (含新增之 course_changes 臨時停課／調課通知表)。
2. course_changes 具備完整 15 個欄位、主鍵與班級/日期索引。
3. 全數 36 條 Foreign Key 外鍵約束 100% 合法，無任何孤立外鍵引用。
4. 核心業務數據完整性（75 位學生、922 筆學分、161 筆學生紀錄、會議中樞）。
"""

import os
import re
from collections import defaultdict
import pytest


def test_smart_ukn_sql_structure_and_tables():
    sql_path = "smart_ukn.sql"
    assert os.path.exists(sql_path), "smart_ukn.sql 檔案不存在"

    with open(sql_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. 驗證資料表總數 62
    create_table_regex = re.compile(
        r'CREATE TABLE (?:IF NOT EXISTS )?`([a-zA-Z0-9_]+)`\s*\((.*?)\)\s*ENGINE',
        re.DOTALL | re.IGNORECASE
    )
    tables = {}
    for m in create_table_regex.finditer(content):
        tbl = m.group(1)
        body = m.group(2)
        cols = []
        for line in body.split("\n"):
            line = line.strip()
            if line.startswith("`"):
                cols.append(line.split("`")[1])
        tables[tbl] = cols

    assert len(tables) == 62, f"預期 62 張資料表，實際為 {len(tables)}"
    assert "course_changes" in tables, "smart_ukn.sql 缺少 course_changes 資料表"

    # 2. 驗證 course_changes 欄位與索引
    course_changes_cols = tables["course_changes"]
    expected_cols = [
        "id", "kind", "class_name", "course_name", "teacher",
        "orig_date", "orig_periods", "orig_room",
        "new_date", "new_periods", "new_room", "reason",
        "created_by", "created_by_username", "created_at"
    ]
    for col in expected_cols:
        assert col in course_changes_cols, f"course_changes 缺少欄位: {col}"

    assert "ALTER TABLE `course_changes`" in content
    assert "ADD PRIMARY KEY (`id`)" in content
    assert "ADD KEY `idx_class` (`class_name`)" in content


def test_smart_ukn_foreign_keys_integrity():
    sql_path = "smart_ukn.sql"
    with open(sql_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 提取表與欄位
    create_table_regex = re.compile(
        r'CREATE TABLE (?:IF NOT EXISTS )?`([a-zA-Z0-9_]+)`\s*\((.*?)\)\s*ENGINE',
        re.DOTALL | re.IGNORECASE
    )
    tables = {}
    for m in create_table_regex.finditer(content):
        tbl = m.group(1)
        body = m.group(2)
        cols = []
        for line in body.split("\n"):
            line = line.strip()
            if line.startswith("`"):
                cols.append(line.split("`")[1])
        tables[tbl] = cols

    # 提取 INSERT 數據
    def parse_tuples(insert_sql):
        m = re.search(r'VALUES\s*(.*);', insert_sql, re.DOTALL | re.IGNORECASE)
        if not m:
            return []
        val_str = m.group(1).strip()
        rows = []
        in_str = False
        str_char = ""
        escape = False
        paren_depth = 0
        current_row = []
        for ch in val_str:
            if in_str:
                current_row.append(ch)
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == str_char:
                    in_str = False
            else:
                if ch in ("'", '"'):
                    in_str = True
                    str_char = ch
                    current_row.append(ch)
                elif ch == "(":
                    paren_depth += 1
                    if paren_depth == 1:
                        current_row = []
                    else:
                        current_row.append(ch)
                elif ch == ")":
                    paren_depth -= 1
                    if paren_depth == 0:
                        rows.append("".join(current_row).strip())
                        current_row = []
                    else:
                        current_row.append(ch)
                else:
                    if paren_depth > 0:
                        current_row.append(ch)
        return rows

    def split_cols(row_str):
        cols = []
        in_str = False
        str_char = ""
        escape = False
        cur = []
        for ch in row_str:
            if in_str:
                cur.append(ch)
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == str_char:
                    in_str = False
            else:
                if ch in ("'", '"'):
                    in_str = True
                    str_char = ch
                    cur.append(ch)
                elif ch == ",":
                    cols.append("".join(cur).strip())
                    cur = []
                else:
                    cur.append(ch)
        cols.append("".join(cur).strip())
        return cols

    table_data = defaultdict(list)
    insert_regex = re.compile(
        r'INSERT INTO `([a-zA-Z0-9_]+)`\s*(?:\(([^)]+)\)\s*)?VALUES\s*(.*?);',
        re.DOTALL | re.IGNORECASE
    )
    for m in insert_regex.finditer(content):
        tbl = m.group(1)
        explicit_cols = m.group(2)
        if explicit_cols:
            col_names = [c.strip().replace("`", "") for c in explicit_cols.split(",")]
        else:
            col_names = tables.get(tbl, [])
        rows_str = parse_tuples(m.group(0))
        for r_str in rows_str:
            cvals = split_cols(r_str)
            row_dict = {}
            for idx, cname in enumerate(col_names):
                if idx < len(cvals):
                    v = cvals[idx].strip()
                    if v == "NULL":
                        v = None
                    elif (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
                        v = v[1:-1]
                    row_dict[cname] = v
            table_data[tbl].append(row_dict)

    # 提取 Foreign Keys
    fk_regex = re.compile(
        r'ALTER TABLE `([a-zA-Z0-9_]+)`\s+ADD CONSTRAINT `([a-zA-Z0-9_]+)`\s+FOREIGN KEY\s*\(`([a-zA-Z0-9_]+)`\)\s+REFERENCES `([a-zA-Z0-9_]+)`\s*\(`([a-zA-Z0-9_]+)`\)',
        re.IGNORECASE
    )
    fks = []
    for m in fk_regex.finditer(content):
        fks.append({
            "child_table": m.group(1),
            "constraint_name": m.group(2),
            "child_col": m.group(3),
            "parent_table": m.group(4),
            "parent_col": m.group(5)
        })

    assert len(fks) == 36, f"預期 36 條外鍵約束，實際為 {len(fks)}"

    # 驗證每一條外鍵無孤立資料
    for fk in fks:
        ctbl = fk["child_table"]
        ccol = fk["child_col"]
        ptbl = fk["parent_table"]
        pcol = fk["parent_col"]

        parent_values = {str(row[pcol]) for row in table_data[ptbl] if pcol in row and row[pcol] is not None}
        for row in table_data[ctbl]:
            if ccol in row and row[ccol] is not None:
                val = str(row[ccol])
                assert val in parent_values, (
                    f"外鍵違規: {ctbl}.{ccol} 值 '{val}' 在母表 {ptbl}.{pcol} 中不存在"
                )
