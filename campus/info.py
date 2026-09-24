"""天氣與上學交通。

天氣：預設使用 Open-Meteo (免金鑰)；有設定 CWA_API_KEY 時改用中央氣象署 36 小時預報。
交通：有設定 TDX_CLIENT_ID / TDX_CLIENT_SECRET 時查學校附近公車站牌與到站時間；
      沒設定時提供 Google 地圖大眾運輸路線與臺北市公車動態連結。
"""
import json
import os
import time
import urllib.parse
import urllib.request

from flask import Blueprint

from .common import ok, error

bp = Blueprint("campus_info", __name__)

CAMPUS_LAT = float(os.getenv("CAMPUS_LAT", "25.0726"))
CAMPUS_LON = float(os.getenv("CAMPUS_LON", "121.6075"))
CAMPUS_ADDRESS = "臺北市內湖區康寧路三段75巷137號"
CACHE_SECONDS = 600

_cache = {}

WMO_TEXT = {
    0: ("晴朗", "☀️"), 1: ("大致晴朗", "🌤️"), 2: ("多雲", "⛅"), 3: ("陰天", "☁️"), 45: ("有霧", "🌫️"), 48: ("有霧", "🌫️"),
    51: ("毛毛雨", "🌦️"), 53: ("毛毛雨", "🌦️"), 55: ("毛毛雨", "🌦️"), 61: ("小雨", "🌧️"), 63: ("中雨", "🌧️"),
    65: ("大雨", "🌧️"), 80: ("陣雨", "🌦️"), 81: ("陣雨", "🌧️"), 82: ("強陣雨", "⛈️"), 95: ("雷雨", "⛈️"),
    96: ("雷雨", "⛈️"), 99: ("強雷雨", "⛈️"),
}


def _get_json(url, headers=None, data=None, timeout=10):
    req = urllib.request.Request(url, data=data, headers=headers or {"User-Agent": "smart-ukn/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _cached(key, loader, ttl=CACHE_SECONDS):
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < ttl:
        return hit[1]
    value = loader()
    _cache[key] = (time.time(), value)
    return value


def _advice(temp, rain_prob):
    tips = []
    if rain_prob is not None and rain_prob >= 50:
        tips.append("降雨機率高，記得帶傘")
    elif rain_prob is not None and rain_prob >= 30:
        tips.append("可能會下雨，建議帶把折傘")
    if temp is not None and temp >= 32:
        tips.append("天氣炎熱，多補充水分")
    elif temp is not None and temp <= 15:
        tips.append("天氣偏冷，多穿一件外套")
    return "；".join(tips) or "天氣穩定，適合出門"


def load_open_meteo():
    params = urllib.parse.urlencode({
        "latitude": CAMPUS_LAT, "longitude": CAMPUS_LON, "timezone": "Asia/Taipei", "forecast_days": 3,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
        "hourly": "temperature_2m,precipitation_probability,weather_code",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    })
    d = _get_json(f"https://api.open-meteo.com/v1/forecast?{params}")
    cur = d["current"]
    text, icon = WMO_TEXT.get(cur["weather_code"], ("—", "🌡️"))
    now_hour = cur["time"][:13]
    hours = d["hourly"]
    start = next((i for i, t in enumerate(hours["time"]) if t[:13] >= now_hour), 0)
    hourly = [{"time": hours["time"][i][11:16], "temp": hours["temperature_2m"][i],
               "rain_prob": hours["precipitation_probability"][i],
               "icon": WMO_TEXT.get(hours["weather_code"][i], ("", "🌡️"))[1]}
              for i in range(start, min(start + 12, len(hours["time"])), 2)]
    daily = [{"date": d["daily"]["time"][i], "max": d["daily"]["temperature_2m_max"][i],
              "min": d["daily"]["temperature_2m_min"][i], "rain_prob": d["daily"]["precipitation_probability_max"][i],
              "text": WMO_TEXT.get(d["daily"]["weather_code"][i], ("—", ""))[0],
              "icon": WMO_TEXT.get(d["daily"]["weather_code"][i], ("", "🌡️"))[1]}
             for i in range(len(d["daily"]["time"]))]
    rain_next = max((h["rain_prob"] or 0 for h in hourly[:3]), default=None)
    return {
        "source": "Open-Meteo", "updated_at": cur["time"].replace("T", " "), "location": "康寧大學 (內湖)",
        "current": {"temp": cur["temperature_2m"], "feels_like": cur["apparent_temperature"],
                    "humidity": cur["relative_humidity_2m"], "wind": cur["wind_speed_10m"],
                    "precipitation": cur["precipitation"], "text": text, "icon": icon},
        "hourly": hourly, "daily": daily, "advice": _advice(cur["temperature_2m"], rain_next),
    }


def load_cwa(api_key):
    """中央氣象署一般天氣預報-今明 36 小時 (臺北市)"""
    params = urllib.parse.urlencode({"Authorization": api_key, "locationName": "臺北市"})
    d = _get_json(f"https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?{params}")
    loc = d["records"]["location"][0]
    el = {e["elementName"]: e["time"] for e in loc["weatherElement"]}
    periods = []
    for i in range(len(el["Wx"])):
        periods.append({"start": el["Wx"][i]["startTime"], "end": el["Wx"][i]["endTime"],
                        "text": el["Wx"][i]["parameter"]["parameterName"],
                        "rain_prob": int(el["PoP"][i]["parameter"]["parameterName"]),
                        "min": int(el["MinT"][i]["parameter"]["parameterName"]),
                        "max": int(el["MaxT"][i]["parameter"]["parameterName"]),
                        "comfort": el["CI"][i]["parameter"]["parameterName"]})
    first = periods[0]
    return {"source": "中央氣象署", "location": "臺北市", "periods": periods,
            "advice": _advice(first["max"], first["rain_prob"])}


@bp.route("/api/campus/weather", methods=["GET"])
def weather():
    try:
        data = _cached("weather", load_open_meteo)
    except Exception as e:
        return error(f"天氣資料暫時無法取得：{e}", 502)
    key = os.getenv("CWA_API_KEY")
    if key:
        try:
            data = {**data, "cwa": _cached("cwa", lambda: load_cwa(key))}
        except Exception:
            pass
    return ok(data=data)


# ---------- 交通 ----------

def _tdx_token():
    cid, secret = os.getenv("TDX_CLIENT_ID"), os.getenv("TDX_CLIENT_SECRET")
    if not cid or not secret:
        return None
    body = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid, "client_secret": secret}).encode()
    d = _get_json("https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
                  headers={"Content-Type": "application/x-www-form-urlencoded"}, data=body)
    return d["access_token"]


def load_bus_eta():
    token = _cached("tdx_token", _tdx_token)
    if not token:
        return None
    headers = {"Authorization": f"Bearer {token}", "User-Agent": "smart-ukn/1.0"}
    near = urllib.parse.quote(f"nearby({CAMPUS_LAT},{CAMPUS_LON},400)")
    stations = _get_json(f"https://tdx.transportdata.tw/api/advanced/v2/Bus/Station/NearBy?$spatialFilter={near}&$format=JSON",
                         headers=headers)
    etas = _get_json(f"https://tdx.transportdata.tw/api/advanced/v2/Bus/EstimatedTimeOfArrival/NearBy?$spatialFilter={near}&$format=JSON",
                     headers=headers)
    by_stop = {}
    for e in etas:
        name = e["StopName"]["Zh_tw"]
        by_stop.setdefault(name, []).append({
            "route": e["RouteName"]["Zh_tw"], "direction": e.get("Direction"),
            "minutes": round(e["EstimateTime"] / 60) if e.get("EstimateTime") is not None else None,
            "status": {0: "", 1: "尚未發車", 2: "交管不停靠", 3: "末班車已過", 4: "今日未營運"}.get(e.get("StopStatus"), "")})
    result = []
    for s in stations:
        name = s["StationName"]["Zh_tw"]
        arrivals = sorted(by_stop.get(name, []), key=lambda x: (x["minutes"] is None, x["minutes"] or 0))
        result.append({"stop": name, "routes": sorted({r["RouteName"]["Zh_tw"] for r in s.get("Stops", [])}),
                       "arrivals": arrivals[:8]})
    return result


@bp.route("/api/campus/transport", methods=["GET"])
def transport():
    dest = urllib.parse.quote(f"康寧大學 {CAMPUS_ADDRESS}")
    links = [
        {"title": "Google 地圖：從目前位置搭大眾運輸到學校", "url": f"https://www.google.com/maps/dir/?api=1&destination={dest}&travelmode=transit"},
        {"title": "臺北市公車動態資訊系統", "url": "https://ebus.gov.taipei/"},
        {"title": "臺北捷運 路線與票價查詢", "url": "https://www.metro.taipei/"},
        {"title": "YouBike 微笑單車站點地圖", "url": "https://www.youbike.com.tw/region/taipei/stations/"},
    ]
    bus = None
    bus_error = None
    try:
        bus = _cached("bus_eta", load_bus_eta, ttl=60)
    except Exception as e:
        bus_error = str(e)
    return ok(address=CAMPUS_ADDRESS, lat=CAMPUS_LAT, lon=CAMPUS_LON, links=links, bus=bus,
              bus_configured=bool(os.getenv("TDX_CLIENT_ID")), bus_error=bus_error)
