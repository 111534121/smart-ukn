"""建立/重建 Smart UKN LINE 官方帳號的圖文選單 (Rich Menu)。

⚠️ 這支程式會動到正式帳號正在使用中的圖文選單，預設不會真的呼叫 LINE API：
   - 不加 --yes：只印出每個選單會建立的區域/動作，方便核對座標對不對，不連線。
   - 加 --yes：才會真的連線刪掉舊的 ukn-main / ukn-student / ukn-visitor alias 並重建。
   執行前務必先用 --yes 以外的方式確認輸出內容跟現在線上的選單一致，再加 --yes 執行，
   避免把正常運作中的選單蓋成錯的。

座標是用實際的三張選單圖片 (line_assets/richmenu-*.jpg, 2500x1686) 量測出來的：
   標題列高 150px，內容兩排各 693px，底部列高 150px (150+693+693+150=1686)；
   三欄寬度約略平分 (834/833/833)。子選單左上角 (0,0,450,150) 是「回主選單」熱區。
   這是用圖片量出來的最佳估計，正式執行前建議先用 GET /v2/bot/richmenu/list 比對
   現在線上的區域設定，避免跟實際已上線的版本有落差。

用法：
    python tools/setup_richmenu.py                # 預覽，不連線
    python tools/setup_richmenu.py --yes           # 真的建立/取代

環境變數：
    LINE_CHANNEL_ACCESS_TOKEN  必填，只能放在伺服器環境變數，不要寫進程式或提交到 Git
    LINE_LIFF_ID                「設定常用功能」那一格要連去的 LIFF ID (預設用已知的
                                 2012266647-el203x6g)
    LINE_DEMO_HOME_URL           圖文選單裡「demo 首頁」那幾格要連去的網址
    LINE_STUDENT_SCHEDULE_URL    「課表查詢」要連去的網址 (line-student.html 的完整網址)
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")  # Windows 預設主控台編碼 (cp950) 印不出中文/全形符號

API = "https://api.line.me"
API_DATA = "https://api-data.line.me"  # 上傳/下載二進位內容 (圖文選單圖片等) 用這個主機，不是 api.line.me
ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "line_assets")

W, H = 2500, 1686
HEADER_H = 150
ROW_H = 693          # 150 + 693 + 693 + 150 = 1686
COL_X = [0, 834, 1667]
COL_W = [834, 833, 833]
BACK_BUTTON = {"x": 0, "y": 0, "width": 450, "height": HEADER_H}


def area(x, y, width, height, action):
    return {"bounds": {"x": x, "y": y, "width": width, "height": height}, "action": action}


def grid_cell(row, col, action):
    y = HEADER_H + row * ROW_H
    return area(COL_X[col], y, COL_W[col], ROW_H, action)


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
    schedule_url = os.getenv("LINE_STUDENT_SCHEDULE_URL", demo_home)

    main = {
        "size": {"width": W, "height": H}, "selected": True, "name": "ukn-main",
        "chatBarText": "選單", "alias": "ukn-main",
        "image": os.path.join(ASSETS_DIR, "richmenu-main.jpg"),
        "areas": [
            area(0, 0, 1250, H, switch_action("ukn-student", "學生・老師專區")),
            area(1250, 0, 1250, H, switch_action("ukn-visitor", "訪客・家長專區")),
        ],
    }

    student = {
        "size": {"width": W, "height": H}, "selected": False, "name": "ukn-student",
        "chatBarText": "學生・老師專區", "alias": "ukn-student",
        "image": os.path.join(ASSETS_DIR, "richmenu-student.jpg"),
        "areas": [
            area(**BACK_BUTTON, action=switch_action("ukn-main", "回主選單")),
            grid_cell(0, 0, uri_action("課表查詢", schedule_url)),
            grid_cell(0, 1, uri_action("活動報名", demo_home)),
            grid_cell(0, 2, uri_action("最新公告", demo_home)),
            grid_cell(1, 0, uri_action("AI 客服", demo_home)),
            grid_cell(1, 1, uri_action("我的常用功能", demo_home)),
            grid_cell(1, 2, uri_action("設定常用功能", f"https://liff.line.me/{liff_id}")),
        ],
    }

    visitor = {
        "size": {"width": W, "height": H}, "selected": False, "name": "ukn-visitor",
        "chatBarText": "訪客・家長專區", "alias": "ukn-visitor",
        "image": os.path.join(ASSETS_DIR, "richmenu-visitor.jpg"),
        "areas": [
            area(**BACK_BUTTON, action=switch_action("ukn-main", "回主選單")),
            grid_cell(0, 0, message_action("參觀須知", "訪客")),
            grid_cell(0, 1, message_action("交通資訊", "交通資訊")),
            grid_cell(0, 2, message_action("聯絡我們", "聯絡我們")),
            grid_cell(1, 0, message_action("校園行事曆", "行事曆")),
            grid_cell(1, 1, uri_action("最新公告", demo_home)),
            grid_cell(1, 2, uri_action("AI 客服", demo_home)),
        ],
    }
    return [main, student, visitor]


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
