"""建立/重建 Smart UKN LINE 官方帳號的圖文選單 (Rich Menu)。

⚠️ 這支程式會動到正式帳號正在使用中的圖文選單，預設不會真的呼叫 LINE API：
   - 不加 --yes：只印出每個選單會建立的區域/動作，方便核對座標對不對，不連線。
   - 加 --yes：才會真的連線刪掉舊的 alias 並重建。
   執行前務必先用 --yes 以外的方式確認輸出內容跟現在線上的選單一致，再加 --yes 執行，
   避免把正常運作中的選單蓋成錯的。

2026-11-27 改版：選單從「主選單→學生/訪客」兩層，改成「主選單→校內人士/訪客專區→
(校內人士底下再分)學生專區/行政人員專區」三層，共 5 張選單圖 (line_assets/richmenu-*.jpg)。
座標用實際圖片 (2500x1686) 量出來：
   標題列高 155px，內容兩排 (155-845、845-1540)，底部列高 1540-1686=146px。
   三欄版面欄寬 795px，x 起點 25 / 860 / 1690；兩欄版面 (只有 2 個按鈕的列或整頁 2 大塊)
   對半分，各 1250px 寬。子選單左上角 (0,0,620,155) 是「回主選單」熱區，一律直接跳回
   最上層主選單 (不是跳回上一層)，跟圖上「點左上角『回主選單』切換身分」的文字一致。
   這是用圖片量出來的最佳估計，正式執行前建議先用 GET /v2/bot/richmenu/list 比對
   現在線上的區域設定，避免跟實際已上線的版本有落差。

⚠️ line_assets/richmenu-student.jpg 目前是 1329x896 的草稿圖，不是 LINE 要求的 2500x1686，
   還不能真的上傳；下面的欄位座標是照其他已經是正確尺寸的選單量出來的共用版面，等換成正式
   尺寸的圖之後，相對位置理論上會對得上，但建議換圖後仍先用預覽模式核對一次。

用法：
    python tools/setup_richmenu.py                # 預覽，不連線
    python tools/setup_richmenu.py --yes           # 真的建立/取代

環境變數：
    LINE_CHANNEL_ACCESS_TOKEN  必填，只能放在伺服器環境變數，不要寫進程式或提交到 Git
    LINE_LIFF_ID                「設定常用功能」那一格要連去的 LIFF ID (預設用已知的
                                 2012266647-el203x6g)
    LINE_DEMO_HOME_URL           圖文選單裡還沒換成自己網站的項目用的退路網址
    LINE_STUDENT_SCHEDULE_URL    「課表查詢」要連去的網址 (line-student.html 的完整網址)
    LINE_LIFF_ID_FAVORITES      「我的常用功能」那一格要連去的 LIFF ID
    LINE_LIFF_ID_NOTICES        「我的公告」那一格要連去的 LIFF ID (目前學生、行政人員專區
                                 共用同一個 LIFF 頁面；這個頁面查學生公告需要帳號綁學號，
                                 行政人員帳號沒有學號，目前點了會看到「沒有綁定學號」的錯誤，
                                 是已知限制，不是這次改版要解決的範圍)
    PUBLIC_SITE_URL / RENDER_EXTERNAL_URL  自己網站的公開網址 (跟 public_portal.py 共用這組)；
                                 有設定的話「活動報名」「最新公告」「待辦通知」「預約參觀」
                                 會直接連到自己網站對應分頁，本機測試時可以先設成目前的 ngrok 網址
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

from PIL import Image

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None
if load_dotenv:
    load_dotenv()  # 跟 app.py 一樣讀取專案根目錄的 .env；不然直接執行這支腳本看不到 PUBLIC_SITE_URL 等設定，全部會退回 demo_home

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows 預設主控台編碼 (cp950) 印不出中文/全形符號

API = "https://api.line.me"
API_DATA = "https://api-data.line.me"  # 上傳/下載二進位內容 (圖文選單圖片等) 用這個主機，不是 api.line.me
ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "line_assets")

W, H = 2500, 1686
HEADER_H = 155
FOOTER_TOP = 1540
ROW_Y = [HEADER_H, 845]
ROW_H = [845 - HEADER_H, FOOTER_TOP - 845]
COL_X = [25, 860, 1690]
COL_W = [795, 795, 795]
HALF_X = [0, 1250]
HALF_W = 1250
BACK_BUTTON = {"x": 0, "y": 0, "width": 620, "height": HEADER_H}


def area(x, y, width, height, action):
    return {"bounds": {"x": x, "y": y, "width": width, "height": height}, "action": action}


def grid_cell(row, col, action):
    """三欄版面格子 (一列 3 個按鈕時用)"""
    return area(COL_X[col], ROW_Y[row], COL_W[col], ROW_H[row], action)


def half_cell(row, col, action):
    """兩欄版面格子 (一列只有 2 個按鈕時用，寬度對半分)"""
    return area(HALF_X[col], ROW_Y[row], HALF_W, ROW_H[row], action)


def top_half(col, action):
    """整頁只有 2 個大按鈕、沒有上方「回主選單」列的選單 (ukn-main) 用：從最上面到最下面"""
    return area(HALF_X[col], 0, HALF_W, H, action)


def sub_half(col, action):
    """整頁只有 2 個大按鈕、但上面有「回主選單」列的選單 (ukn-insider) 用：避開標題列"""
    return area(HALF_X[col], HEADER_H, HALF_W, FOOTER_TOP - HEADER_H, action)


def switch_action(alias, label):
    return {"type": "richmenuswitch", "label": label, "richMenuAliasId": alias,
            "data": f"switch={alias}"}


def uri_action(label, uri):
    return {"type": "uri", "label": label, "uri": uri}


def message_action(label, text):
    return {"type": "message", "label": label, "text": text}


def build_menus():
    demo_home = os.getenv("LINE_DEMO_HOME_URL", "https://smart-ukn-liff-demo.onrender.com/")
    liff_id = os.getenv("LINE_LIFF_ID", "2012266647-el203x6g")
    # 「課表查詢」「我的常用功能」預設連去我們自己的 LIFF 頁面；還沒設定好對應 LIFF 時退回 demo 首頁
    schedule_liff_id = os.getenv("LINE_LIFF_ID_SCHEDULE", "")
    schedule_url = f"https://liff.line.me/{schedule_liff_id}" if schedule_liff_id else os.getenv("LINE_STUDENT_SCHEDULE_URL", demo_home)
    favorites_liff_id = os.getenv("LINE_LIFF_ID_FAVORITES", "")
    favorites_url = f"https://liff.line.me/{favorites_liff_id}" if favorites_liff_id else demo_home
    notices_liff_id = os.getenv("LINE_LIFF_ID_NOTICES", "")
    notices_url = f"https://liff.line.me/{notices_liff_id}" if notices_liff_id else demo_home
    menu_url = f"https://liff.line.me/{liff_id}"
    # 「活動報名」「最新公告」「待辦通知」「預約參觀」是我們自己網站的分頁，不是 demo_home (隊友的示範網站)；
    # PUBLIC_SITE_URL/RENDER_EXTERNAL_URL 還沒設定時才退回 demo_home
    own_site = (os.getenv("PUBLIC_SITE_URL") or os.getenv("RENDER_EXTERNAL_URL") or "").rstrip("/")
    events_url = f"{own_site}/#events" if own_site else demo_home
    # 連到獨立的 /announcements 頁面 (只顯示公告列表，不是嵌在首頁裡那個還有天氣卡、分頁切換的大區塊)，
    # 不需要登入，一打開就是對的內容，不會有「先看到別的、才跳過去」的感覺
    announcements_url = f"{own_site}/announcements" if own_site else demo_home
    calendar_url = f"{own_site}/#calendar" if own_site else demo_home
    # 「待辦通知」(行政人員) 是首頁 (tab-home) 一打開就看得到的卡片，連回首頁即可
    home_url = own_site if own_site else demo_home
    # 「預約參觀」表單藏在首頁訪客歡迎區塊裡的收合區，用 #visit 讓首頁載入後自動展開並捲過去
    visit_url = f"{own_site}/#visit" if own_site else demo_home

    main = {
        "size": {"width": W, "height": H}, "selected": True, "name": "ukn-main",
        "chatBarText": "選單", "alias": "ukn-main",
        "image": os.path.join(ASSETS_DIR, "richmenu-main.jpg"),
        "areas": [
            top_half(0, switch_action("ukn-insider", "校內人士")),
            top_half(1, switch_action("ukn-visitor", "訪客專區")),
        ],
    }

    insider = {
        "size": {"width": W, "height": H}, "selected": False, "name": "ukn-insider",
        "chatBarText": "校內人士", "alias": "ukn-insider",
        "image": os.path.join(ASSETS_DIR, "richmenu-insider.jpg"),
        "areas": [
            area(**BACK_BUTTON, action=switch_action("ukn-main", "回主選單")),
            sub_half(0, switch_action("ukn-student", "學生專區")),
            sub_half(1, switch_action("ukn-staff", "行政人員專區")),
        ],
    }

    student = {
        "size": {"width": W, "height": H}, "selected": False, "name": "ukn-student",
        "chatBarText": "學生專區", "alias": "ukn-student",
        "image": os.path.join(ASSETS_DIR, "richmenu-student.jpg"),
        "areas": [
            area(**BACK_BUTTON, action=switch_action("ukn-main", "回主選單")),
            grid_cell(0, 0, uri_action("課表查詢", schedule_url)),
            grid_cell(0, 1, uri_action("活動報名", events_url)),
            grid_cell(0, 2, uri_action("我的公告", notices_url)),
            grid_cell(1, 0, uri_action("校園行事曆", calendar_url)),
            grid_cell(1, 1, uri_action("我的常用功能", favorites_url)),
            grid_cell(1, 2, uri_action("設定常用功能", menu_url)),
        ],
    }

    staff = {
        "size": {"width": W, "height": H}, "selected": False, "name": "ukn-staff",
        "chatBarText": "老師・行政人員專區", "alias": "ukn-staff",
        "image": os.path.join(ASSETS_DIR, "richmenu-staff.jpg"),
        "areas": [
            area(**BACK_BUTTON, action=switch_action("ukn-main", "回主選單")),
            grid_cell(0, 0, uri_action("待辦通知", home_url)),
            grid_cell(0, 1, uri_action("我的公告", notices_url)),
            grid_cell(0, 2, uri_action("校園行事曆", calendar_url)),
            half_cell(1, 0, uri_action("我的常用功能", favorites_url)),
            half_cell(1, 1, uri_action("設定常用功能", menu_url)),
        ],
    }

    visitor = {
        "size": {"width": W, "height": H}, "selected": False, "name": "ukn-visitor",
        "chatBarText": "訪客專區", "alias": "ukn-visitor",
        "image": os.path.join(ASSETS_DIR, "richmenu-visitor.jpg"),
        "areas": [
            area(**BACK_BUTTON, action=switch_action("ukn-main", "回主選單")),
            grid_cell(0, 0, message_action("參觀須知", "訪客")),
            grid_cell(0, 1, message_action("交通資訊", "交通資訊")),
            grid_cell(0, 2, message_action("聯絡我們", "聯絡我們")),
            grid_cell(1, 0, message_action("校園行事曆", "行事曆")),
            grid_cell(1, 1, uri_action("最新公告", announcements_url)),
            grid_cell(1, 2, uri_action("預約參觀", visit_url)),
        ],
    }
    return [main, insider, student, staff, visitor]


def _request(token, method, path, body=None, data=None, content_type="application/json", base=API):
    headers = {"Authorization": f"Bearer {token}"}
    if data is not None:
        headers["Content-Type"] = content_type
        payload = data
    else:
        headers["Content-Type"] = "application/json"
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    req = urllib.request.Request(base + path, data=payload, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raise SystemExit(f"LINE API 呼叫失敗 {method} {path}: {e.code} {e.read().decode('utf-8', 'ignore')}")


def delete_existing(token, names):
    aliases = _request(token, "GET", "/v2/bot/richmenu/alias/list").get("aliases", [])
    for a in aliases:
        if a["richMenuAliasId"] in names:
            _request(token, "DELETE", f"/v2/bot/richmenu/alias/{a['richMenuAliasId']}")
    menus = _request(token, "GET", "/v2/bot/richmenu/list").get("richmenus", [])
    for m in menus:
        if m.get("name") in names:
            _request(token, "DELETE", f"/v2/bot/richmenu/{m['richMenuId']}")


def create_menu(token, spec):
    body = {k: v for k, v in spec.items() if k not in ("alias", "image")}
    created = _request(token, "POST", "/v2/bot/richmenu", body=body)
    rich_menu_id = created["richMenuId"]
    ext = os.path.splitext(spec["image"])[1].lstrip(".").lower()
    content_type = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
    with open(spec["image"], "rb") as f:
        image_bytes = f.read()
    _request(token, "POST", f"/v2/bot/richmenu/{rich_menu_id}/content",
             data=image_bytes, content_type=content_type, base=API_DATA)
    return rich_menu_id


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--yes", action="store_true", help="真的連線建立/取代圖文選單 (預設只預覽不連線)")
    args = parser.parse_args()

    menus = build_menus()

    print("即將建立/取代以下圖文選單：\n")
    for spec in menus:
        print(f"[{spec['alias']}] {spec['name']}  圖片={spec['image']}")
        for a in spec["areas"]:
            b = a["bounds"]
            act = a["action"]
            desc = act.get("label", "")
            target = act.get("uri") or act.get("text") or act.get("richMenuAliasId") or ""
            print(f"    ({b['x']:>4},{b['y']:>4}) {b['width']}x{b['height']}  {desc} -> {target}")
        print()

    if not args.yes:
        print("這只是預覽，沒有連線到 LINE。確認無誤後請加 --yes 重新執行才會真的建立。")
        return

    token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
    if not token:
        sys.exit("請先設定環境變數 LINE_CHANNEL_ACCESS_TOKEN")
    for spec in menus:
        if not os.path.isfile(spec["image"]):
            sys.exit(f"找不到圖片檔案：{spec['image']}")
        with Image.open(spec["image"]) as im:
            if im.size != (W, H):
                sys.exit(f"{spec['image']} 尺寸是 {im.size}，LINE 要求 {W}x{H}，請先換成正確尺寸的圖再執行")

    names = {m["name"] for m in menus}
    print("刪除舊的同名圖文選單與 alias…")
    delete_existing(token, {m["alias"] for m in menus})

    ids = {}
    for spec in menus:
        print(f"建立 {spec['name']} 中…")
        ids[spec["name"]] = create_menu(token, spec)

    for spec in menus:
        print(f"設定 alias {spec['alias']} …")
        _request(token, "POST", "/v2/bot/richmenu/alias",
                 body={"richMenuAliasId": spec["alias"], "richMenuId": ids[spec["name"]]})

    print("設定 ukn-main 為預設選單…")
    _request(token, "POST", f"/v2/bot/user/all/richmenu/{ids['ukn-main']}")

    print("完成。")


if __name__ == "__main__":
    main()
