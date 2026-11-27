"""一鍵檢查 (T11 系統化測試流程)：push 或開 Pull Request 之前跑一次。

    python check_all.py            完整檢查，報告存到 evidence/check_reports/
    python check_all.py --quick    只跑語法與 pytest (約 15 秒)，平常改程式時用
    python check_all.py --no-report 不存報告 (GitHub 自動檢查用)

檢查項目：
  1. 目前分支與未存檔的修改
  2. Python 語法 (所有 .py 能不能編譯)
  3. JavaScript 語法 (static/ 底下的 .js，電腦有裝 Node.js 才檢查)
  4. 合併前常見錯誤：殘留的衝突標記 (<<<<<<<)、.env 被加入 git、改了網頁卻沒更新 sw.js 快取版本
  5. pytest 自動測試 (tests/ 底下全部)
  6. 全站功能檢測 self_check.py (60 項，--quick 時略過)

全部通過結束碼為 0，有任何失敗為 1 (GitHub 會顯示紅色 ✗)。
一律使用示範資料，不會動到 MySQL，也不會寄出 Email。
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from datetime import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SKIP_DIRS = {".git", "__pycache__", ".pytest_cache", "node_modules", "data", "evidence", ".venv", "venv"}

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def run(cmd, timeout=600):
    p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    return p.returncode, (p.stdout or "") + (p.stderr or "")


def git(*args):
    code, out = run(["git", *args], timeout=30)
    return out.strip() if code == 0 else ""


def files(ext, under=""):
    base = os.path.join(ROOT, under)
    for folder, dirs, names in os.walk(base):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for n in names:
            if n.endswith(ext):
                yield os.path.join(folder, n)


def rel(path):
    return os.path.relpath(path, ROOT).replace("\\", "/")


# ---------------------------------------------------------------------
# 各項檢查：回傳 {"name", "ok": True/False/None(略過), "summary", "details": [...]}
# ---------------------------------------------------------------------

def check_git():
    branch = git("rev-parse", "--abbrev-ref", "HEAD") or "(不是 git 專案)"
    last = git("log", "-1", "--format=%h %s")
    dirty = [l for l in git("status", "--porcelain").splitlines() if l and not l.endswith("my_data.json")]
    details = [f"分支：{branch}", f"最後一次存檔：{last or '—'}"]
    if dirty:
        details.append(f"還沒 commit 的修改 {len(dirty)} 個檔案：" + "、".join(l[3:] for l in dirty[:8]) + ("…" if len(dirty) > 8 else ""))
    return {"name": "分支與存檔狀態", "ok": True, "summary": f"{branch}" + (f"，有 {len(dirty)} 個檔案還沒 commit" if dirty else "，修改都已存檔"),
            "details": details, "warn": bool(dirty)}


def check_python_syntax():
    bad = []
    count = 0
    for path in files(".py"):
        count += 1
        try:
            with open(path, encoding="utf-8") as f:
                compile(f.read(), path, "exec")
        except SyntaxError as e:
            bad.append(f"{rel(path)} 第 {e.lineno} 行：{e.msg}")
        except UnicodeDecodeError:
            bad.append(f"{rel(path)}：不是 UTF-8 編碼")
    return {"name": "Python 語法", "ok": not bad, "summary": f"{count} 個檔案" + ("全部正確" if not bad else f"，{len(bad)} 個有錯"), "details": bad}


def check_js_syntax():
    node = shutil.which("node")
    js = list(files(".js", "static"))
    if not node:
        return {"name": "JavaScript 語法", "ok": None, "summary": "電腦沒有安裝 Node.js，略過", "details": []}
    bad = []
    for path in js:
        code, out = run([node, "--check", path], timeout=60)
        if code:
            first = next((l for l in out.splitlines() if "Error" in l), out.strip().splitlines()[-1] if out.strip() else "")
            bad.append(f"{rel(path)}：{first}")
    return {"name": "JavaScript 語法", "ok": not bad, "summary": f"{len(js)} 個檔案" + ("全部正確" if not bad else f"，{len(bad)} 個有錯"), "details": bad}


def check_merge_hygiene():
    problems = []
    marker = re.compile(r"^(<{7}|>{7}|={7})( |$)", re.M)
    for ext in (".py", ".js", ".html", ".css", ".sql", ".md", ".csv", ".json"):
        for path in files(ext):
            try:
                with open(path, encoding="utf-8") as f:
                    text = f.read()
            except (UnicodeDecodeError, OSError):
                continue
            if marker.search(text) and not path.endswith("check_all.py"):
                problems.append(f"{rel(path)}：還有合併衝突標記 <<<<<<< / >>>>>>>，請先解決衝突")
    tracked = git("ls-files").splitlines()
    for secret in (".env", "data/.secret_key"):
        if secret in tracked:
            problems.append(f"{secret} 被加入 git 了，裡面有密碼或金鑰，請用 git rm --cached {secret} 移除")
    # 改了網頁檔案卻沒更新 sw.js 的 CACHE_VERSION：使用者會一直看到舊畫面
    base = git("merge-base", "HEAD", "origin/main")
    if base:
        changed = git("diff", "--name-only", base, "HEAD").splitlines()
        web = [c for c in changed if c.startswith("static/") and c != "static/sw.js" and c.endswith((".js", ".html", ".css"))]
        if web and "static/sw.js" not in changed:
            problems.append(f"改了 {len(web)} 個網頁檔案 (例如 {web[0]})，但 static/sw.js 的 CACHE_VERSION 沒有加 1，使用者會看到舊畫面")
    return {"name": "合併前常見錯誤", "ok": not problems, "summary": "沒有發現" if not problems else f"{len(problems)} 個問題", "details": problems}


def check_pytest():
    xml_path = os.path.join(tempfile.mkdtemp(), "pytest.xml")
    code, out = run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", f"--junitxml={xml_path}"], timeout=900)
    if not os.path.exists(xml_path):
        tail = "\n".join(out.strip().splitlines()[-15:])
        return {"name": "pytest 自動測試", "ok": False, "summary": "pytest 無法執行 (是不是沒安裝？請執行 pip install -r requirements-dev.txt)", "details": [tail]}
    root = ET.parse(xml_path).getroot()
    per_file, failures = {}, []
    for case in root.iter("testcase"):
        cls = case.get("classname", "")
        fname = cls.split(".")[-1] if cls.startswith("tests.") else cls
        stat = per_file.setdefault(fname, {"passed": 0, "failed": 0, "skipped": 0})
        problem = case.find("failure")
        if problem is None:
            problem = case.find("error")
        skipped = case.find("skipped")
        if problem is not None:
            stat["failed"] += 1
            msg = (problem.get("message") or "").strip().splitlines()
            failures.append(f"{fname} › {case.get('name')}：{msg[0][:200] if msg else '失敗'}")
        elif skipped is not None:
            stat["skipped"] += 1  # 含 xfail (已知問題)
        else:
            stat["passed"] += 1
    passed = sum(s["passed"] for s in per_file.values())
    failed = sum(s["failed"] for s in per_file.values())
    skipped = sum(s["skipped"] for s in per_file.values())
    table = [f"{f}：通過 {s['passed']}" + (f"、失敗 {s['failed']}" if s["failed"] else "") + (f"、已知問題/略過 {s['skipped']}" if s["skipped"] else "")
             for f, s in sorted(per_file.items())]
    return {"name": "pytest 自動測試", "ok": failed == 0 and code in (0, 5),
            "summary": f"通過 {passed}、失敗 {failed}、已知問題/略過 {skipped}", "details": failures or [], "table": table}


def check_self_check():
    code, out = run([sys.executable, "-c", (
        "import json, self_check; r = self_check.run_all(); "
        "print('@@JSON@@' + json.dumps(r, ensure_ascii=False, default=str))")], timeout=600)
    m = re.search(r"^@@JSON@@([^\r\n]*)$", out, re.M)
    if code != 0 or not m:
        tail = "\n".join(out.strip().splitlines()[-15:])
        return {"name": "全站功能檢測", "ok": False, "summary": "self_check.py 執行失敗", "details": [tail]}
    import json
    report = json.loads(m.group(1))
    results = report.get("results") or []
    bad = [f"{r.get('feature')} › {r.get('name')}：{r.get('detail') or r.get('message') or ''}" for r in results if r.get("status") in ("fail", "error")]
    total = len(results)
    passed = sum(1 for r in results if r.get("status") == "pass")
    skipped = sum(1 for r in results if r.get("status") == "skip")
    return {"name": "全站功能檢測", "ok": not bad, "summary": f"{total} 項：通過 {passed}" + (f"、失敗 {len(bad)}" if bad else "") + (f"、略過 {skipped} (需要網路)" if skipped else ""),
            "details": bad}


# ---------------------------------------------------------------------

def icon(r):
    if r["ok"] is None:
        return "⏭️"
    if not r["ok"]:
        return "❌"
    return "⚠️" if r.get("warn") else "✅"


def to_markdown(results, started, seconds):
    failed = [r for r in results if r["ok"] is False]
    lines = [f"# Smart UKN 一鍵檢查報告", "",
             f"- 執行時間：{started:%Y-%m-%d %H:%M:%S}（花了 {seconds:.0f} 秒）",
             f"- 結果：**{'全部通過，可以 push / 開 Pull Request' if not failed else f'{len(failed)} 項沒通過，請先修好再 push'}**", "",
             "| 項目 | 結果 | 說明 |", "| --- | --- | --- |"]
    lines += [f"| {r['name']} | {icon(r)} | {r['summary']} |" for r in results]
    for r in results:
        if r.get("details") or r.get("table"):
            lines += ["", f"## {icon(r)} {r['name']}", ""]
            lines += [f"- {d}" for d in r.get("details", [])]
            if r.get("table"):
                lines += ["", "<details><summary>各測試檔結果</summary>", ""] + [f"- {t}" for t in r["table"]] + ["", "</details>"]
    lines += ["", "---", "此報告由 `check_all.py` 產生，使用示範資料，不會動到 MySQL 或寄出 Email。看不懂的項目請參考 `docs/測試流程.md`。"]
    return "\n".join(lines) + "\n"


def main():
    quick = "--quick" in sys.argv
    save = "--no-report" not in sys.argv
    started, t0 = datetime.now(), time.time()
    steps = [check_git, check_python_syntax, check_js_syntax, check_merge_hygiene, check_pytest]
    if not quick:
        steps.append(check_self_check)
    print("🔍 Smart UKN 一鍵檢查" + ("（快速模式）" if quick else "") + "\n")
    results = []
    for step in steps:
        t = time.time()
        print(f"   檢查中… {step.__doc__ or step.__name__}".rstrip(), end="\r")
        r = step()
        results.append(r)
        print(f"{icon(r)} {r['name']}：{r['summary']}（{time.time() - t:.0f} 秒）" + " " * 10)
        for d in r.get("details", [])[:10]:
            print(f"     · {d}")
    failed = [r for r in results if r["ok"] is False]
    print("\n" + ("🎉 全部通過，可以 push / 開 Pull Request" if not failed else f"⛔ {len(failed)} 項沒通過，請先修好再 push"))
    if save:
        folder = os.path.join(ROOT, "evidence", "check_reports")
        os.makedirs(folder, exist_ok=True)
        branch = re.sub(r'[\\/:*?"<>| ]', "_", git("rev-parse", "--abbrev-ref", "HEAD") or "nogit")
        path = os.path.join(folder, f"檢查報告_{branch}_{started:%Y%m%d_%H%M}.md")
        with open(path, "w", encoding="utf-8") as f:
            f.write(to_markdown(results, started, time.time() - t0))
        print(f"📄 報告：{rel(path)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
