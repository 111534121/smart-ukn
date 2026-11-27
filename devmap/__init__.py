"""
功能對照表 /admin/feature-map (僅管理員)：每個學生端功能 → 呼叫哪些 API → 哪個 Python 函式 (檔案:行號)
→ 讀寫 XAMPP MySQL 哪些資料表 (SQL 所在行號)，以及前端哪一行 JS 呼叫這支 API。

行號不是寫死的：每次開頁面都從目前的程式碼分析，
- 從 Flask 路由找到函式，往下追它呼叫的函式 (最多 DEPTH 層)，在原始碼中找 SQL 的 FROM / JOIN / INSERT INTO / UPDATE / DELETE FROM
- 資料表欄位與說明取自 init_db.py 的 CREATE TABLE；XAMPP 有開時再查實際筆數
- campus 套件的 JSON 儲存 (data/campus_store.json)、上傳檔案 (static/uploads)、離線示範資料 (DEMO_*) 也一併標出

app.py 呼叫 devmap.init_app(app, deps) 註冊；deps 提供 fetch_db_rows。
"""
import inspect
import os
import re
import sys
import textwrap
from collections import defaultdict
from types import SimpleNamespace

from flask import Blueprint, current_app, render_template, session

bp = Blueprint("devmap", __name__, template_folder="templates")
deps = SimpleNamespace()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPTH = 3

# 學生端功能與它用到的 API 路徑 (路徑本身或其下層都算)；tab 對應 static/js/campus-shell.js 的 FEATURES
FEATURES = [
    {"group": "首頁", "icon": "🔑", "name": "登入與訪客登記", "tab": None, "routes": ["/api/auth", "/api/visitor"]},
    {"group": "首頁", "icon": "🏠", "name": "今日儀表板 (課表、公告、作業)", "tab": "tab-home", "routes": ["/api/student/dashboard", "/api/student/announcements"]},
    {"group": "首頁", "icon": "🤒", "name": "線上請假與審核", "tab": "tab-home", "routes": ["/api/student/leave-requests", "/api/leave-requests"]},
    {"group": "首頁", "icon": "🕘", "name": "缺曠課摘要", "tab": "tab-home", "routes": ["/api/student/attendance"]},
    {"group": "首頁", "icon": "🗓️", "name": "本週可辦與申辦期限", "tab": "tab-home", "routes": ["/api/calendar/now", "/api/calendar/current-week", "/api/deadlines"]},
    {"group": "首頁", "icon": "🎉", "name": "校慶跑馬燈與祝福", "tab": "tab-home", "routes": ["/api/anniversary"]},
    {"group": "學習", "icon": "📚", "name": "修業進度與擋修", "tab": "tab-course", "routes": ["/api/courses", "/api/student/courses/personalized", "/api/student/graduation-audit"]},
    {"group": "學習", "icon": "🔁", "name": "重補修推薦", "tab": "tab-retake", "routes": ["/api/student/retake-recommendations"]},
    {"group": "學習", "icon": "🧮", "name": "選課檢查", "tab": "tab-plan", "routes": ["/api/campus/course-plan"]},
    {"group": "學習", "icon": "🎓", "name": "畢業門檻", "tab": "tab-graduation", "routes": ["/api/student/graduation"]},
    {"group": "學習", "icon": "🏅", "name": "證照與競賽成果", "tab": "tab-certs", "routes": ["/api/campus/certs"]},
    {"group": "學習", "icon": "⚠️", "name": "學業預警與個資授權", "tab": "tab-warning", "routes": ["/api/student/early-warning", "/api/student/privacy-consent"]},
    {"group": "學習", "icon": "🎖️", "name": "我的操行 (獎懲、導師評分)", "tab": "tab-conduct", "routes": ["/api/conduct"]},
    {"group": "學習", "icon": "🧑‍🏫", "name": "教師專長查詢", "tab": "tab-faculty", "routes": ["/api/faculty"]},
    {"group": "校務", "icon": "🤖", "name": "AI 申辦小幫手與校規瀏覽", "tab": "tab-assistant", "routes": ["/api/assistant", "/api/campus/rules"]},
    {"group": "校務", "icon": "📝", "name": "行政申請流程 (步驟勾選、準備文件)", "tab": "tab-checklist", "routes": ["/api/checklists", "/api/checklist/progress", "/api/student/my-applications", "/api/campus/checklist-docs"]},
    {"group": "校務", "icon": "📤", "name": "線上申請進度與審核", "tab": "tab-checklist", "routes": ["/api/applications"]},
    {"group": "校務", "icon": "📄", "name": "申請表單下載與填寫範例", "tab": "tab-checklist", "routes": ["/forms"]},
    {"group": "校務", "icon": "📅", "name": "行事曆", "tab": "tab-calendar", "routes": ["/api/campus/calendar", "/api/campus/my-events", "/api/campus/announcements", "/api/academic-calendar"]},
    {"group": "校務", "icon": "💰", "name": "獎助學金檢核", "tab": "tab-scholarship", "routes": ["/api/campus/scholarships", "/api/scholarships/match"]},
    {"group": "校務", "icon": "🏢", "name": "宿舍與總務申請", "tab": "tab-services", "routes": ["/api/campus/dorm", "/api/campus/affairs"]},
    {"group": "校園生活", "icon": "🔑", "name": "教室與櫃子租借", "tab": "tab-rent", "routes": ["/api/campus/rooms", "/api/campus/lockers"]},
    {"group": "校園生活", "icon": "🗺️", "name": "校園地圖與老師辦公室", "tab": "tab-map", "routes": ["/api/campus/map", "/api/campus/teachers"]},
    {"group": "校園生活", "icon": "🚌", "name": "天氣與交通", "tab": "tab-traffic", "routes": ["/api/campus/weather", "/api/campus/transport"]},
    {"group": "校園生活", "icon": "🔗", "name": "購書與常用系統", "tab": "tab-links", "routes": ["/api/links"]},
    {"group": "社群", "icon": "📣", "name": "科上通知", "tab": "tab-notices", "routes": ["/api/campus/notices", "/api/campus/classes"]},
    {"group": "個人設定", "icon": "🏷️", "name": "我的科系與顯示範圍", "tab": None, "routes": ["/api/me/preferences"]},
    {"group": "個人設定", "icon": "📌", "name": "常用功能置頂與網站導覽", "tab": None, "routes": ["/api/campus/prefs"]},
]

# 前端搜尋範圍 (學生端)
FRONTEND_FILES = ["static/index.html", "static/login.html"] + [f"static/js/{n}" for n in sorted(os.listdir(os.path.join(ROOT, "static", "js"))) if n.endswith(".js")] \
    if os.path.isdir(os.path.join(ROOT, "static", "js")) else ["static/index.html"]

SQL_PATTERNS = [
    ("寫", re.compile(r"\b(?:INSERT\s+(?:IGNORE\s+)?INTO|REPLACE\s+INTO|DELETE\s+FROM)\s+`?(\w+)`?")),
    ("寫", re.compile(r"\bUPDATE\s+`?(\w+)`?\s+SET\b")),
    ("讀", re.compile(r"\b(?:FROM|JOIN)\s+`?(\w+)`?")),
]
STORE_RE = re.compile(r"""store\.section\(\s*["'](\w+)["']""")
CALL_RE = re.compile(r"\b([A-Za-z_]\w*)\s*\(")
DEMO_RE = re.compile(r"\b(DEMO_[A-Z0-9_]+)\b")
CONST_RE = re.compile(r"\b([A-Z][A-Z0-9_]{3,})\b")
# 不往下追：權限裝飾器、連線工具、啟動時檢查資料表在不在的 is_available (不是功能真正用到的資料表)
SKIP_CALLS = {"role_required", "login_required", "require", "is_available", "_query", "fetch_db_rows", "db_execute",
              "get_db_connection", "is_db_available"}
CREATE_RE = re.compile(r"CREATE TABLE IF NOT EXISTS `(\w+)` \((.*?)\n\s*\) ENGINE", re.S)
COLUMN_RE = re.compile(r"^\s*`(\w+)`\s+([^\s,]+(?:\([^)]*\))?)(.*?)(?:COMMENT\s+'([^']*)')?,?\s*$")


def init_app(app, app_deps):
    deps.__dict__.update(app_deps.__dict__)
    app.register_blueprint(bp)


def rel(path):
    try:
        return os.path.relpath(path, ROOT).replace("\\", "/")
    except ValueError:
        return path


def vscode_link(relpath, line):
    return "vscode://file/" + os.path.join(ROOT, relpath).replace("\\", "/") + f":{line}"


# ---------- 資料表定義 (init_db.py) ----------

def parse_schema():
    path = os.path.join(ROOT, "init_db.py")
    with open(path, encoding="utf-8") as f:
        text = f.read()
    tables = {}
    for m in CREATE_RE.finditer(text):
        columns = []
        for line in m.group(2).splitlines():
            c = COLUMN_RE.match(line)
            if c:
                columns.append({"name": c.group(1), "type": c.group(2), "comment": c.group(4) or "",
                                "key": "PRIMARY" if f"PRIMARY KEY (`{c.group(1)}`" in m.group(2) else ""})
        fks = re.findall(r"FOREIGN KEY \(`(\w+)`\) REFERENCES `(\w+)`", m.group(2))
        line_no = text.count("\n", 0, m.start()) + 1
        tables[m.group(1)] = {"name": m.group(1), "columns": columns, "foreign_keys": fks,
                              "file": "init_db.py", "line": line_no, "vscode": vscode_link("init_db.py", line_no)}
    return tables


def live_counts(table_names):
    """XAMPP 有開時回傳 {資料表: 筆數}；沒開回傳 None"""
    rows = deps.fetch_db_rows("SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()")
    if rows is None:
        return None
    existing = {r["t"] for r in rows}
    counts = {}
    for name in table_names:
        if name in existing:
            res = deps.fetch_db_rows(f"SELECT COUNT(*) AS n FROM `{name}`")
            counts[name] = res[0]["n"] if res else None
    return counts


# ---------- 程式碼追蹤 ----------

def project_modules():
    mods = []
    for mod in list(sys.modules.values()):
        f = getattr(mod, "__file__", None) or ""
        if f and os.path.abspath(f).startswith(ROOT) and "site-packages" not in f and f"{os.sep}tests{os.sep}" not in f:
            mods.append(mod)
    return mods


def build_index():
    """函式名稱 → 函式 (含 MySQL 版資料來源類別的方法；Memory 版是離線示範不列入)"""
    index = defaultdict(list)
    for mod in project_modules():
        for name, obj in vars(mod).items():
            if getattr(obj, "__module__", None) != mod.__name__:
                continue
            if inspect.isfunction(obj):
                index[name].append(obj)
            # 資料來源只追 MySQL 版 (DashboardSource 等基底類別只有介面、Memory 版是離線示範)
            elif inspect.isclass(obj) and not name.startswith("Memory") and (name.startswith("MySQL") or not name.endswith("Source")):
                for mname, meth in vars(obj).items():
                    if inspect.isfunction(meth):
                        index[mname].append(meth)
    return index


def source_of(func):
    try:
        lines, start = inspect.getsourcelines(func)
        return textwrap.dedent("".join(lines)), start, rel(inspect.getsourcefile(func))
    except (OSError, TypeError):
        return None, 0, None


def constant_source(func, name):
    """模組常數的原始碼行與起始行號 (常數定義到下一個空行為止)"""
    try:
        lines = inspect.getsourcelines(inspect.getmodule(func))[0]
    except (OSError, TypeError):
        return None, 0
    for i, line in enumerate(lines):
        if re.match(rf"{name}\s*=", line):
            end = next((j for j in range(i + 1, len(lines)) if not lines[j].strip()), len(lines))
            return lines[i:end], i + 1
    return None, 0


def trace(view, index):
    """從路由函式往下追：回傳 (經過的函式, 資料表使用處, JSON 儲存區, 是否存上傳檔, 示範資料名稱)"""
    funcs, tables, stores, demos = [], defaultdict(lambda: {"ops": set(), "refs": []}), set(), set()
    uploads = False
    seen = set()

    def scan(lines, start, path, where):
        for i, line in enumerate(lines):
            for op, pattern in SQL_PATTERNS:
                for t in pattern.findall(line):
                    entry = tables[t]
                    entry["ops"].add(op)
                    if not any(r["file"] == path and r["line"] == start + i for r in entry["refs"]):
                        entry["refs"].append({"file": path, "line": start + i, "func": where,
                                              "code": line.strip()[:160], "vscode": vscode_link(path, start + i)})

    def visit(func, depth):
        nonlocal uploads
        key = (getattr(func, "__module__", ""), func.__qualname__)
        if key in seen:
            return
        seen.add(key)
        src, start, path = source_of(func)
        if not src:
            return
        funcs.append({"name": func.__qualname__, "file": path, "line": start, "depth": depth, "vscode": vscode_link(path, start)})
        scan(src.splitlines(), start, path, func.__qualname__)
        # SQL 寫在模組常數 (例如 COURSE_MAP_SQL = \"\"\"SELECT ... FROM course_map\"\"\")
        for const in dict.fromkeys(CONST_RE.findall(src)):
            value = func.__globals__.get(const)
            if isinstance(value, str) and any(p.search(value) for _, p in SQL_PATTERNS):
                lines, line_no = constant_source(func, const)
                if lines:
                    scan(lines, line_no, path, const)
        stores.update(STORE_RE.findall(src))
        demos.update(DEMO_RE.findall(src))
        if "save_uploaded_file(" in src:
            uploads = True
        if depth >= DEPTH:
            return
        own_module = getattr(func, "__module__", "")
        for name in dict.fromkeys(CALL_RE.findall(src)):
            if name == func.__name__ or name in SKIP_CALLS:
                continue
            candidates = index.get(name, [])
            same = [c for c in candidates if c.__module__ == own_module]
            for c in same or candidates:
                visit(c, depth + 1)

    visit(view, 0)
    return funcs, tables, stores, uploads, demos


def rule_regex(rule):
    """Flask 路由 → 在 JS 中找呼叫處的正規式 (<int:id> 對應 ${...} 或實際值)"""
    parts = re.split(r"<[^>]+>", rule)
    body = r"(?:\$\{[^}]+\}|[^'\"`\s/?]+)".join(re.escape(p) for p in parts)
    return re.compile(body + r"(?![\w-]|/[\w$])")


def frontend_refs(rule, files_cache):
    pattern = rule_regex(rule)
    refs = []
    for path, lines in files_cache.items():
        for i, line in enumerate(lines):
            if pattern.search(line) and not line.lstrip().startswith(("<!--", "//", "*")):
                func = None
                for j in range(i, max(-1, i - 250), -1):
                    m = re.search(r"function\s+(\w+)\s*\(", lines[j]) or re.search(r"^\s*(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(", lines[j])
                    if m:
                        func = m.group(1)
                        break
                refs.append({"file": path, "line": i + 1, "func": func, "vscode": vscode_link(path, i + 1)})
    return refs


def build_map():
    app = current_app
    schema = parse_schema()
    index = build_index()
    files_cache = {}
    for path in FRONTEND_FILES:
        try:
            with open(os.path.join(ROOT, path), encoding="utf-8") as f:
                files_cache[path] = f.read().splitlines()
        except OSError as e:
            current_app.logger.warning("功能對照表讀取原始碼檔案失敗 %s：%s", path, e)

    rules = sorted((r for r in app.url_map.iter_rules() if r.endpoint != "static"), key=lambda r: r.rule)
    features, used_by = [], defaultdict(list)
    for feat in FEATURES:
        endpoints, feat_tables, feat_stores, feat_uploads = [], {}, set(), False
        for r in rules:
            if not any(r.rule == p or r.rule.startswith(p + "/") for p in feat["routes"]):
                continue
            view = inspect.unwrap(app.view_functions[r.endpoint])
            funcs, tables, stores, uploads, demos = trace(view, index)
            known = {t: v for t, v in tables.items() if t in schema}
            for t, v in known.items():
                ft = feat_tables.setdefault(t, set())
                ft.update(v["ops"])
            feat_stores.update(stores)
            feat_uploads = feat_uploads or uploads
            endpoints.append({
                "rule": r.rule, "methods": sorted(r.methods - {"HEAD", "OPTIONS"}),
                "main": funcs[0] if funcs else None, "helpers": funcs[1:],
                "tables": [{"name": t, "ops": sorted(v["ops"], reverse=True), "refs": v["refs"]} for t, v in sorted(known.items())],
                "stores": sorted(stores), "uploads": uploads, "demos": sorted(demos),
                "frontend": frontend_refs(r.rule, files_cache),
            })
        for t in feat_tables:
            used_by[t].append(feat["name"])
        features.append({**feat, "endpoints": endpoints,
                         "tables": [{"name": t, "ops": sorted(ops, reverse=True)} for t, ops in sorted(feat_tables.items())],
                         "stores": sorted(feat_stores), "uploads": feat_uploads})

    counts = live_counts(schema.keys())
    tables = [{**t, "used_by": used_by.get(name, []), "rows": (counts or {}).get(name),
               "exists": None if counts is None else name in counts}
              for name, t in sorted(schema.items())]
    return features, tables, counts is not None


@bp.route("/admin/feature-map")
def feature_map():
    if session.get("role") not in ("管理員", "系統管理員"):
        return ("<meta charset='utf-8'><p style='font-family:sans-serif;padding:24px'>功能對照表僅限管理員查看，"
                "請先 <a href='/login'>以管理員帳號登入</a> 後再開啟 /admin/feature-map。</p>"), 401 if "username" not in session else 403
    features, tables, db_online = build_map()
    groups = list(dict.fromkeys(f["group"] for f in features))
    return render_template("feature_map.html", features=features, tables=tables, db_online=db_online, groups=groups,
                           db_name=os.getenv("DB_NAME", "smart_ukn"), root=ROOT.replace("\\", "/"))
