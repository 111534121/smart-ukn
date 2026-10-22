"""
每週紀錄：把 tools/weekly_log_draft.json 的草稿寫進小組 Google 試算表「每週紀錄」，上傳前一定先預覽、要輸入 y 才送出。

    python tools/weekly_log.py            預覽：顯示會寫到第幾列、填入哪些內容 (不會上傳)
    python tools/weekly_log.py push       預覽後詢問，輸入 y 才上傳；成功後草稿標記為已上傳

第一次使用請先安裝 tools/weekly_log_apps_script.gs (檔案開頭有步驟)，並在 .env 設定 WEEKLY_LOG_URL、WEEKLY_LOG_TOKEN。
預覽只讀公開的 CSV，不需要登入；寫入規則與 Apps Script 相同：
    同一列 (週次、日期、負責人、使用者、功能模組) 已存在且「做了什麼」空白 → 只補 做了什麼／完成率／備註
    否則寫入第一個空白列，都沒有就加在最後；不會覆蓋別人填好的內容
"""
import csv
import io
import json
import os
import sys
import urllib.request

SHEET_ID = "145PfeKJG-dTzdt8U9FVOVii6mfSGsAMqlp5FA0Oh2Zw"
SHEET_GID = 1743771076
HEADER = ["週次", "日期", "負責人", "使用者", "功能模組", "做了什麼", "完成率", "備註"]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRAFT = os.path.join(ROOT, "tools", "weekly_log_draft.json")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def load_env():
    """讀專案 .env (KEY=VALUE，# 之後為註解)；已設定的環境變數優先"""
    env = {}
    try:
        with open(os.path.join(ROOT, ".env"), encoding="utf-8") as f:
            for line in f:
                line = line.split(" #")[0].strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except OSError:
        pass
    return {k: os.getenv(k) or env.get(k, "") for k in ("WEEKLY_LOG_URL", "WEEKLY_LOG_TOKEN")}


def fetch_sheet():
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={SHEET_GID}"
    with urllib.request.urlopen(url, timeout=20) as res:
        return list(csv.reader(io.StringIO(res.read().decode("utf-8"))))


def plan(sheet, rows):
    """回傳 [(列號, 模式, 內容)]；模式 fill = 補空白欄、empty = 寫進空白列、append = 加在最後"""
    header_row = next(i for i, r in enumerate(sheet) if r[:1] == ["週次"] and len(r) > 5 and r[5] == "做了什麼")
    padded = [(r + [""] * 8)[:8] for r in sheet]
    used, result, next_append = set(), [], len(sheet) + 1
    for row in rows:
        cells = [str(row.get(h, "")) for h in HEADER]
        target = next((i for i in range(header_row + 1, len(padded)) if i not in used
                       and padded[i][:5] == cells[:5] and not padded[i][5].strip()), None)
        mode = "fill"
        if target is None:
            mode = "empty"
            target = next((i for i in range(header_row + 1, len(padded)) if i not in used
                           and padded[i][0] in ("", cells[0]) and not any(c.strip() for c in padded[i][1:])), None)
        if target is None:
            result.append((next_append, "append", cells))
            next_append += 1
            continue
        used.add(target)
        result.append((target + 1, mode, cells))
    return result


def show(steps):
    label = {"fill": "補上你已建立的列", "empty": "寫入空白列", "append": "新增在最後"}
    for row_no, mode, cells in steps:
        print(f"\n第 {row_no} 列（{label[mode]}）")
        for h, v in zip(HEADER, cells):
            print(f"  {h}：{v}")


def main():
    with open(DRAFT, encoding="utf-8") as f:
        draft = json.load(f)
    rows = [r for r in draft["rows"] if not r.get("_uploaded")]
    if not rows:
        print("草稿沒有尚未上傳的列。")
        return
    steps = plan(fetch_sheet(), rows)
    print(f"預覽：共 {len(steps)} 列，寫入「每週紀錄」(gid {SHEET_GID})")
    show(steps)

    if sys.argv[1:] != ["push"]:
        print("\n(只是預覽，沒有上傳。確認無誤後執行：python tools/weekly_log.py push)")
        return
    env = load_env()
    if not env["WEEKLY_LOG_URL"] or not env["WEEKLY_LOG_TOKEN"]:
        print("\n尚未設定 WEEKLY_LOG_URL / WEEKLY_LOG_TOKEN，請先依 tools/weekly_log_apps_script.gs 開頭的步驟安裝。")
        sys.exit(1)
    if input("\n確定要上傳以上內容嗎？(y/N) ").strip().lower() != "y":
        print("已取消，沒有上傳。")
        return
    payload = json.dumps({"token": env["WEEKLY_LOG_TOKEN"], "rows": [{h: c for h, c in zip(HEADER, cells)} for _, _, cells in steps]}).encode()
    req = urllib.request.Request(env["WEEKLY_LOG_URL"], data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as res:
        result = json.loads(res.read().decode("utf-8"))
    if not result.get("ok"):
        print(f"上傳失敗：{result.get('message')}")
        sys.exit(1)
    for r in result["results"]:
        print(f"已寫入第 {r['row']} 列：{r['module']}")
    for r in rows:
        r["_uploaded"] = True
    with open(DRAFT, "w", encoding="utf-8") as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
