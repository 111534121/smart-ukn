"""
Moodle Web Service 用戶端 (與 Moodle 手機 App 使用同一個 moodle_mobile_app 服務)

帳號密碼只在 get_token() 送往 Moodle 換取權杖，本系統不保存密碼。
"""
import json
import urllib.error
import urllib.parse
import urllib.request

TIMEOUT_SECONDS = 15
SERVICE = "moodle_mobile_app"


class MoodleError(Exception):
    """code 為 Moodle 回傳的 errorcode (例如 invalidlogin、invalidtoken)，網路錯誤為 network"""

    def __init__(self, message, code=""):
        super().__init__(message)
        self.code = code


def _post(url, fields):
    body = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(url, data=body, headers={"User-Agent": "SmartUKN/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError) as e:
        raise MoodleError(f"無法連線 Moodle：{e}", "network")
    except json.JSONDecodeError:
        raise MoodleError("Moodle 回傳的資料格式無法解析", "badresponse")


def get_token(base_url, username, password):
    """以帳號密碼向 Moodle 換取權杖"""
    data = _post(f"{base_url}/login/token.php", {"username": username, "password": password, "service": SERVICE})
    if data.get("token"):
        return data["token"]
    code = data.get("errorcode", "")
    if code == "invalidlogin":
        raise MoodleError("Moodle 帳號或密碼錯誤", code)
    raise MoodleError(data.get("error") or "無法取得 Moodle 權杖", code)


class MoodleClient:
    def __init__(self, base_url, token):
        self.base_url = base_url.rstrip("/")
        self._token = token

    def call(self, function, **params):
        data = _post(f"{self.base_url}/webservice/rest/server.php",
                     {"wstoken": self._token, "wsfunction": function, "moodlewsrestformat": "json", **params})
        if isinstance(data, dict) and data.get("exception"):
            raise MoodleError(data.get("message") or "Moodle 服務錯誤", data.get("errorcode", ""))
        return data

    def site_info(self):
        return self.call("core_webservice_get_site_info")
