"""
老師章 / 承辦人章：老師與行政人員線上核准時蓋的個人印章

- 預設：系統依姓名自動刻一顆紅色方章 (例如「彭賓鈺印」)，不用設定就能蓋
- 也可以上傳自己的印章圖 (PNG / JPG，1 MB 以內，建議去背)
- 或用手機手寫簽名：電腦上顯示 QR code / 網址，手機打開後在螢幕上簽名，簽好就當成自己的章
  (data/seals/sign_tokens.json 存一次性的簽名連結)
- 存放方式：圖檔放在 data/seals/ (不在 static 底下，不能用網址直接打開)，
  data/seals/index.json 記「哪個帳號目前用哪個檔」。不用資料庫。
- 換章時舊檔不刪：已經蓋好的申請表要一直顯示「當時蓋的那顆章」
"""
import hashlib
import json
import os
import re
import secrets

from markupsafe import Markup, escape
from werkzeug.utils import secure_filename

SEAL_MAX_KB = 1024
SIGN_LINK_MINUTES = 10
SEAL_SIGNATURES = {"png": b"\x89PNG", "jpg": b"\xff\xd8\xff", "jpeg": b"\xff\xd8\xff"}


def seal_text(display_name):
    """「彭賓鈺 老師」「周立威 (研發處)」→「彭賓鈺」"""
    name = re.split(r"[\s(（]", str(display_name or "").strip(), maxsplit=1)[0]
    return name[:4] or "承辦人"


def name_seal_svg(display_name, size=92):
    """依姓名自動刻的紅色方章。三個字：右行「姓、名1」、左行「名2、印」；兩個字：右行兩字、左行「之印」"""
    name = seal_text(display_name)
    if len(name) == 3:
        right, left = name[:2], name[2] + "印"
    elif len(name) == 2:
        right, left = name, "之印"
    elif len(name) == 4:
        right, left = name[:2], name[2:]
    else:
        right, left = name + "印", ""
    chars = []
    if left:
        for col, text in ((72, right), (38, left)):
            for row, ch in enumerate(text):
                chars.append(f'<text x="{col}" y="{50 + row * 36}" font-size="32">{escape(ch)}</text>')
    else:
        fs = 30 if len(right) <= 3 else 20
        chars.append(f'<text x="55" y="66" font-size="{fs}">{escape(right)}</text>')
    return Markup(
        f'<svg class="seal" width="{size}" height="{size}" viewBox="0 0 110 110" role="img" aria-label="{escape(name)}的印章">'
        '<rect x="5" y="5" width="100" height="100" rx="6" fill="none" stroke="#c41d1d" stroke-width="6"/>'
        '<g fill="#c41d1d" font-weight="700" text-anchor="middle" '
        'font-family="DFKai-SB, BiauKai, KaiTi, \'標楷體\', serif">' + "".join(chars) + "</g></svg>")


class SealStore:
    """data/seals/index.json：{帳號: 目前使用的圖檔名}"""

    def __init__(self, folder):
        self.folder = folder

    @property
    def index_path(self):
        return os.path.join(self.folder, "index.json")

    def _load(self):
        try:
            with open(self.index_path, encoding="utf-8") as fh:
                return json.load(fh)
        except (OSError, ValueError):
            return {}

    def _save(self, data):
        os.makedirs(self.folder, exist_ok=True)
        tmp = self.index_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=1)
        os.replace(tmp, self.index_path)

    def current(self, username):
        """目前使用的圖檔名；沒上傳 (或檔案不見了) 回 None，代表用系統刻的章"""
        stored = self._load().get(username)
        return stored if stored and os.path.isfile(os.path.join(self.folder, stored)) else None

    def save(self, username, filename, data, prefix="seal"):
        """回傳 (錯誤訊息, 檔名)；prefix = seal (上傳的印章圖) 或 sig (手機手寫簽名)"""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in SEAL_SIGNATURES:
            return "印章圖只能是 PNG 或 JPG", None
        if not data:
            return "檔案是空的", None
        if len(data) > SEAL_MAX_KB * 1024:
            return f"印章圖要在 {SEAL_MAX_KB // 1024} MB 以內（目前 {len(data) / 1024 / 1024:.1f} MB）", None
        if not data.startswith(SEAL_SIGNATURES[ext]):
            return f"檔案內容不是真的 {ext.upper()} 圖片", None
        os.makedirs(self.folder, exist_ok=True)
        stored = f"{prefix}_{secure_filename(username) or 'user'}_{hashlib.sha256(data).hexdigest()[:12]}.{ext}"
        with open(os.path.join(self.folder, stored), "wb") as fh:
            fh.write(data)
        index = self._load()
        index[username] = stored
        self._save(index)
        return None, stored

    def reset(self, username):
        """改回系統刻的章 (舊圖檔保留，已蓋過的申請表照樣顯示)"""
        index = self._load()
        if index.pop(username, None) is not None:
            self._save(index)

    def path_of(self, stored):
        if not stored or stored != os.path.basename(stored):
            return None
        path = os.path.join(self.folder, stored)
        return path if os.path.isfile(path) else None

    # ---- 手機簽名連結：電腦上產生 QR code，手機不用登入就能簽；10 分鐘內有效、只能用一次 ----

    @property
    def tokens_path(self):
        return os.path.join(self.folder, "sign_tokens.json")

    def _load_tokens(self):
        try:
            with open(self.tokens_path, encoding="utf-8") as fh:
                return json.load(fh)
        except (OSError, ValueError):
            return {}

    def _save_tokens(self, data):
        os.makedirs(self.folder, exist_ok=True)
        tmp = self.tokens_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False)
        os.replace(tmp, self.tokens_path)

    def new_sign_token(self, username, display_name, now, minutes=SIGN_LINK_MINUTES):
        token = secrets.token_urlsafe(18)
        tokens = {k: v for k, v in self._load_tokens().items() if v["expires"] > now}  # 順便清掉過期的
        tokens[token] = {"username": username, "name": display_name, "expires": now + minutes * 60, "used": False}
        self._save_tokens(tokens)
        return token, tokens[token]

    def sign_token(self, token, now):
        """有效 (沒過期、沒用過) 才回傳；格式不對直接 None"""
        if not token or len(token) > 64:
            return None
        info = self._load_tokens().get(token)
        return info if info and not info["used"] and info["expires"] > now else None

    def token_info(self, token):
        return self._load_tokens().get(token) if token and len(token) <= 64 else None

    def use_sign_token(self, token):
        tokens = self._load_tokens()
        if token in tokens:
            tokens[token]["used"] = True
            self._save_tokens(tokens)
