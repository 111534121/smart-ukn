"""T12 被裁撤的功能：匿名論壇 (告白牆)、桌寵 (每日問答、積分、換裝)、意見箱、巨匠電腦合作

後端 API 已刪除 (commit c96d8b3、5c5bda8)。這裡確認：
1. 這些網址都回 404 (不管有沒有登入、什麼身分)
2. 前端網頁不再呼叫它們
之後若有人從舊分支合併，把這些 API 帶回來，測試會失敗提醒。
"""
import os

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REMOVED = [
    ("GET", "/api/campus/forum/posts"),
    ("POST", "/api/campus/forum/posts"),
    ("GET", "/api/campus/forum/posts/1"),
    ("DELETE", "/api/campus/forum/posts/1"),
    ("POST", "/api/campus/forum/posts/1/like"),
    ("POST", "/api/campus/forum/posts/1/comments"),
    ("POST", "/api/campus/forum/posts/1/report"),
    ("GET", "/api/campus/forum/moderation"),
    ("POST", "/api/campus/forum/moderation/1"),
    ("GET", "/api/campus/pet"),
    ("GET", "/api/campus/pet/question"),
    ("POST", "/api/campus/pet/answer"),
    ("POST", "/api/campus/pet/feedback"),
    ("POST", "/api/campus/pet/buy"),
    ("POST", "/api/campus/pet/choose"),
    ("GET", "/api/campus/feedback"),
]


@pytest.mark.parametrize("method,url", REMOVED)
@pytest.mark.parametrize("user", [None, ("student1", "123456"), ("admin", "admin123")])
def test_removed_api_is_gone(client, login, method, url, user):
    if user:
        login(*user)
    res = client.open(url, method=method, json={})
    assert res.status_code in (404, 405), f"{method} {url} 應該已刪除，卻回 {res.status_code}"


def test_frontend_no_longer_calls_removed_api():
    found = []
    for folder, _, files in os.walk(os.path.join(ROOT, "static")):
        for name in files:
            if name.endswith((".html", ".js")):
                path = os.path.join(folder, name)
                with open(path, encoding="utf-8") as f:
                    text = f.read()
                for word in ("/api/campus/forum", "/api/campus/pet", "/api/campus/feedback", "巨匠"):
                    if word in text:
                        found.append(f"{os.path.relpath(path, ROOT)}：{word}")
    assert not found, "前端還在使用被裁撤的功能：" + "、".join(found)
