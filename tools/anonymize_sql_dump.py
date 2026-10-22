"""Create an importable, synthetic copy of a Smart UKN SQL dump.

Usage: python tools/anonymize_sql_dump.py private.sql public_demo.sql
The source dump must stay outside Git. All original INSERT values are replaced
or restricted to non-identifying codes, dates, and controlled categories.
"""

from __future__ import annotations

import argparse
import re
from collections import Counter
from pathlib import Path


HEADER = re.compile(r"INSERT INTO `(?P<table>[^`]+)` \((?P<columns>[^\n]+)\) VALUES\s*", re.S)
DATE = re.compile(r"^\d{4}-\d\d-\d\d(?:[ T]\d\d:\d\d(?::\d\d)?)?$|^\d\d:\d\d(?::\d\d)?$")
STUDENT_ID = re.compile(r"^\d{7,12}$")
KEEP_COLUMNS = {
    "action", "applies_to_role", "audience", "category", "cert_status",
    "content_scope", "course_type", "exam_policy", "file_type", "kind",
    "lang", "leave_type", "method", "priority", "review_status", "role",
    "room_type", "semester", "semester_suggest", "source", "status",
    "status_badge", "target_type", "tracking_status", "type", "item",
    "dept_id", "course_id", "prerequisite_id", "owner_key",
}
USERNAME_COLUMNS = {
    "username", "created_by_username", "sender_username", "counselor_username",
    "changed_by", "reviewer", "created_by", "moodle_username",
}
NAME_COLUMNS = {
    "full_name", "student_name", "counselor_name", "moodle_fullname",
    "sender", "teacher",
}
JSON_COLUMNS = {"before_json", "after_json", "history_json", "steps_json", "attachments"}
EMPTY_JSON_ARRAY = {"history_json", "steps_json", "attachments"}


def sql_string(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace("'", "\\'")
    escaped = escaped.replace("\n", "\\n").replace("\r", "\\r")
    return "'" + escaped + "'"


def read_string(literal: str) -> str:
    value = literal[1:-1]
    value = value.replace("\\'", "'").replace("\\\\", "\\")
    return value.replace("''", "'")


def find_statement_end(text: str, start: int) -> int:
    quoted = False
    escaped = False
    pos = start
    while pos < len(text):
        char = text[pos]
        if escaped:
            escaped = False
        elif quoted and char == "\\":
            escaped = True
        elif char == "'":
            if quoted and pos + 1 < len(text) and text[pos + 1] == "'":
                pos += 1
            else:
                quoted = not quoted
        elif char == ";" and not quoted:
            return pos + 1
        pos += 1
    raise ValueError("Unterminated INSERT statement")


def split_sql(text: str) -> list[str]:
    parts = []
    start = 0
    depth = 0
    quoted = False
    escaped = False
    pos = 0
    while pos < len(text):
        char = text[pos]
        if escaped:
            escaped = False
        elif quoted and char == "\\":
            escaped = True
        elif char == "'":
            if quoted and pos + 1 < len(text) and text[pos + 1] == "'":
                pos += 1
            else:
                quoted = not quoted
        elif not quoted:
            if char == "(":
                depth += 1
            elif char == ")":
                depth -= 1
            elif char == "," and depth == 0:
                parts.append(text[start:pos].strip())
                start = pos + 1
        pos += 1
    parts.append(text[start:].strip())
    return parts


class Anonymizer:
    def __init__(self) -> None:
        self.maps: dict[str, dict[str, str]] = {}

    def mapped(self, group: str, original: str, label: str) -> str:
        mapping = self.maps.setdefault(group, {})
        if original not in mapping:
            mapping[original] = label.format(len(mapping) + 1)
        return mapping[original]

    def value(self, table: str, column: str, literal: str) -> str:
        if not literal.startswith("'") or not literal.endswith("'"):
            return literal
        original = read_string(literal)
        if column in JSON_COLUMNS:
            return sql_string("[]" if column in EMPTY_JSON_ARRAY else "{}")
        if column in {"password_hash", "token"}:
            return sql_string("!DISABLED_DEMO_ACCOUNT")
        if column == "student_id":
            return sql_string(self.mapped("student_id", original, "DEMO{:05d}"))
        if column in USERNAME_COLUMNS:
            if STUDENT_ID.fullmatch(original):
                return sql_string(self.mapped("student_id", original, "DEMO{:05d}"))
            return sql_string(self.mapped("username", original, "demo_user_{:04d}"))
        if column in NAME_COLUMNS or (table == "faculty_profiles" and column == "name"):
            return sql_string(self.mapped("name", original, "示範人物{:04d}"))
        if column in {"class_name", "advised_class", "target_class", "target_label"}:
            return sql_string(self.mapped("class", original, "示範班級{:03d}"))
        if column == "course_name":
            return sql_string(self.mapped("course", original, "示範課程{:03d}"))
        if column == "dept_name":
            return sql_string(self.mapped("department", original, "示範系所{:03d}"))
        if column == "category_name":
            return sql_string(self.mapped("category", original, "示範類別{:03d}"))
        if "phone" in column:
            return sql_string(self.mapped("phone", original, "090000{:04d}"))
        if "email" in column:
            return sql_string(self.mapped("email", original, "person{:04d}@example.invalid"))
        if column == "ip_address":
            return sql_string("192.0.2.1")
        if column == "record_id" and STUDENT_ID.fullmatch(original):
            return sql_string(self.mapped("student_id", original, "DEMO{:05d}"))
        if column in {"cert_number", "moodle_username"}:
            return sql_string(self.mapped(column, original, "DEMO-{:05d}"))
        if column.endswith("_url") or column == "url":
            return sql_string("#" if original == "#" else "https://example.invalid/demo")
        if column in {"file_path", "file_name"}:
            return sql_string("demo/sample.txt")
        if column in KEEP_COLUMNS or DATE.fullmatch(original):
            return literal
        if original == "":
            return literal
        return sql_string(self.mapped(column, original, "示範資料{:04d}"))


def transform_insert(statement: str, anonymizer: Anonymizer) -> tuple[str, int, str]:
    match = HEADER.match(statement)
    if not match:
        raise ValueError("Unrecognized INSERT header")
    table = match.group("table")
    columns = re.findall(r"`([^`]+)`", match.group("columns"))
    raw_rows = split_sql(statement[match.end():].rstrip(";\r\n"))
    rows = []
    for raw_row in raw_rows:
        if not raw_row.startswith("(") or not raw_row.endswith(")"):
            raise ValueError(f"Malformed row in {table}")
        values = split_sql(raw_row[1:-1])
        if len(values) != len(columns):
            raise ValueError(f"Column count mismatch in {table}: {len(values)} != {len(columns)}")
        rows.append("(" + ", ".join(anonymizer.value(table, col, val) for col, val in zip(columns, values)) + ")")
    return statement[:match.end()] + ",\n".join(rows) + ";", len(rows), table


def transform(source: str) -> tuple[str, Counter[str]]:
    anonymizer = Anonymizer()
    counts: Counter[str] = Counter()
    output = []
    cursor = 0
    for match in re.finditer(r"^INSERT INTO `", source, re.M):
        if match.start() < cursor:
            continue
        end = find_statement_end(source, match.start())
        output.append(source[cursor:match.start()])
        transformed, row_count, table = transform_insert(source[match.start():end], anonymizer)
        output.append(transformed)
        counts[table] += row_count
        cursor = end
    output.append(source[cursor:])
    result = "".join(output)
    result = result.replace(
        "-- Contains account and application data; share privately.",
        "-- De-identified demo data; no original names, account credentials, or free text.",
    )
    return result, counts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        parser.error("The source and output must differ")
    source = args.source.read_text(encoding="utf-8")
    output, counts = transform(source)
    args.output.write_text(output, encoding="utf-8", newline="\n")
    print(f"Anonymized {sum(counts.values())} rows across {len(counts)} populated tables")


if __name__ == "__main__":
    main()
