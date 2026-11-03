"""科上通知完整流程與班導 / 行政人員的管理範圍

示範帳號：teacher1 = 彭賓鈺老師，導師班「資管五忠」(student1 王小明、student2 李美華在這班)
          staff1 = 教務處職員；student1、student2 = 資管五忠學生；S112004 = 資管四孝學生
"""


def send(client, class_name, **extra):
    body = {"class_name": class_name, "title": "繳交實習同意書", "content": "請於週五前交到系辦", "priority": "重要", **extra}
    return client.post("/api/campus/notices", json=body)


def class_names(client):
    return {c["class_name"] for c in client.get("/api/campus/classes").get_json()["data"]}


def test_join_class_rate_limited_after_repeated_failures(client, login):
    import campus.messaging as messaging_module

    login("teacher1")
    assert client.post("/api/campus/classes", json={"class_name": "防呆測試班", "password": "abcd1234"}).status_code == 200

    login("student1")
    for _ in range(messaging_module.JOIN_CLASS_RATE_LIMIT):
        res = client.post("/api/campus/classes/join", json={"class_name": "防呆測試班", "password": "wrong"})
        assert res.status_code == 403
    blocked = client.post("/api/campus/classes/join", json={"class_name": "防呆測試班", "password": "wrong"})
    assert blocked.status_code == 429
    # 密碼打對了也一樣先被擋，避免短時間內暴力試完 4 碼密碼
    still_blocked = client.post("/api/campus/classes/join", json={"class_name": "防呆測試班", "password": "abcd1234"})
    assert still_blocked.status_code == 429


def test_whole_flow_teacher_to_student(client, login):
    """老師建群組 → 學生用密碼加入 → 老師發通知 → 學生收到未讀 → 點開變已讀 → 老師看到已讀人數"""
    login("teacher1")
    assert client.post("/api/campus/classes", json={"class_name": "專題小組A", "password": "abcd1234"}).status_code == 200
    assert "專題小組A" in class_names(client)

    login("student1")
    wrong = client.post("/api/campus/classes/join", json={"class_name": "專題小組A", "password": "wrong"})
    assert wrong.status_code == 403
    assert client.post("/api/campus/classes/join", json={"class_name": "專題小組A", "password": "abcd1234"}).status_code == 200

    login("teacher1")
    res = send(client, "專題小組A")
    assert res.status_code == 200, res.get_json()
    notice_id = res.get_json()["data"]["id"]

    login("student1")
    inbox = client.get("/api/campus/notices/inbox").get_json()
    mine = next(n for n in inbox["data"] if n["id"] == notice_id)
    assert mine["is_read"] is False and inbox["unread_count"] >= 1
    assert client.post(f"/api/campus/notices/{notice_id}/read").status_code == 200
    inbox = client.get("/api/campus/notices/inbox").get_json()
    assert next(n for n in inbox["data"] if n["id"] == notice_id)["is_read"] is True

    login("teacher1")
    sent = next(n for n in client.get("/api/campus/notices/sent").get_json()["data"] if n["id"] == notice_id)
    assert sent["read_count"] == 1 and sent["total"] == 1 and sent["unread_names"] == []


def test_individual_notice_only_reaches_chosen_student(client, login):
    login("teacher1")
    res = send(client, "資管五忠", recipients=["S112002"])
    assert res.status_code == 200
    notice_id = res.get_json()["data"]["id"]

    login("student2")
    assert any(n["id"] == notice_id for n in client.get("/api/campus/notices/inbox").get_json()["data"])
    login("student1")
    assert all(n["id"] != notice_id for n in client.get("/api/campus/notices/inbox").get_json()["data"])
    # 不是收件人不能標記已讀
    assert client.post(f"/api/campus/notices/{notice_id}/read").status_code == 404


def test_homeroom_teacher_only_manages_own_classes(client, login):
    login("teacher1")
    assert class_names(client) == {"資管五忠"}  # 只看到自己的導師班
    assert send(client, "資管五忠").status_code == 200
    assert send(client, "資管四孝").status_code == 403  # 別班不能發
    pw = client.post("/api/campus/classes/password", json={"class_name": "資管四孝", "password": "hack1234"})
    assert pw.status_code == 403  # 別班密碼不能改


def test_staff_and_admin_manage_whole_school(client, login):
    login("staff1")
    assert {"資管五忠", "資管四孝"} <= class_names(client)
    assert send(client, "資管四孝").status_code == 200
    assert client.post("/api/campus/classes/password", json={"class_name": "資管四孝", "password": "newpass1"}).status_code == 200
    login("admin", "admin123")
    assert send(client, "資管五忠").status_code == 200


def test_students_and_parents_cannot_send(client, login):
    login("student1")
    assert send(client, "資管五忠").status_code == 403
    login("parent1")
    assert send(client, "資管五忠").status_code == 403


# ---------------- T09 班級／課程廣播 ----------------
# 課表 (dashboard/demo_data.py)：彭賓鈺教資管五忠「統計學」「商務智慧數據分析」、資管四孝「資料庫系統概論」；「藥理學」是護理四忠蔡宗翰的課

def broadcast(client, target_type, target="", **extra):
    body = {"target_type": target_type, "target": target, "title": "期中考教室異動", "content": "改到 E301", **extra}
    return client.post("/api/campus/broadcast", json=body)


def inbox_ids(client):
    return {n["id"] for n in client.get("/api/campus/notices/inbox").get_json()["data"]}


def test_teacher_course_broadcast_reaches_all_classes_of_the_course(client, login):
    login("teacher1")
    targets = client.get("/api/campus/broadcast/targets").get_json()["data"]
    courses = {c["course_name"]: c for c in targets["courses"]}
    # 只有自己任教的課，自習/班週會、校部週會、社團活動、班會 / 導師時間不算
    assert set(courses) == {"統計學", "商務智慧數據分析", "資料庫系統概論"}
    assert targets["school"] is None and targets["departments"] == [] and targets["grades"] == []

    res = broadcast(client, "課程", "資料庫系統概論")
    assert res.status_code == 200, res.get_json()
    notice = res.get_json()["data"]
    assert notice["target_type"] == "課程" and "資管四孝" in notice["target_label"]

    login("S112004")  # 資管四孝的學生收到
    assert notice["id"] in inbox_ids(client)
    login("student1")  # 資管五忠沒有上這門課，收不到
    assert notice["id"] not in inbox_ids(client)

    login("teacher1")
    sent = next(n for n in client.get("/api/campus/notices/sent").get_json()["data"] if n["id"] == notice["id"])
    assert sent["target_type"] == "課程" and sent["total"] == len(notice["recipients"])


def test_teacher_cannot_broadcast_other_courses_or_school(client, login):
    login("teacher1")
    assert broadcast(client, "課程", "藥理學").status_code == 403
    assert broadcast(client, "全校").status_code == 403
    assert broadcast(client, "科系", "CS").status_code == 403
    assert broadcast(client, "年級", "112").status_code == 403


def test_staff_broadcast_school_department_grade(client, login):
    login("staff1")
    targets = client.get("/api/campus/broadcast/targets").get_json()["data"]
    assert targets["school"] and targets["departments"] and targets["grades"]
    assert "藥理學" in {c["course_name"] for c in targets["courses"]}

    school = broadcast(client, "全校")
    assert school.status_code == 200
    dept = broadcast(client, "科系", "CS")
    assert dept.status_code == 200 and dept.get_json()["data"]["target_label"] == "資訊管理科（五專）"
    assert broadcast(client, "年級", "112").status_code == 200
    assert broadcast(client, "課程", "藥理學").status_code == 200
    assert broadcast(client, "科系", "不存在").status_code == 400  # 沒有學生
    assert broadcast(client, "班級", "資管五忠").status_code == 400  # 班級通知走 /api/campus/notices

    login("student1")
    ids = inbox_ids(client)
    assert school.get_json()["data"]["id"] in ids and dept.get_json()["data"]["id"] in ids


def test_students_cannot_broadcast(client, login):
    login("student1")
    assert broadcast(client, "全校").status_code == 403
    assert client.get("/api/campus/broadcast/targets").status_code == 403


def test_roster_students_get_class_notice_without_joining(client, login):
    """學籍上就是資管五忠的學生，不用輸入密碼加入也收得到班級通知 (出缺勤「提醒」就是只發給一位學生)"""
    from campus.common import store
    store.data["classes"] = [{"class_name": "資管五忠", "password_hash": "x", "members": [],
                              "created_by": "系統", "created_by_username": None, "created_at": ""}]
    login("teacher1")
    res = send(client, "資管五忠", recipients=["S112005"])
    assert res.status_code == 200, res.get_json()
    login("S112005")
    assert res.get_json()["data"]["id"] in {n["id"] for n in client.get("/api/campus/notices/inbox").get_json()["data"]}
