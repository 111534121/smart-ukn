# R1 學分診斷 測試紀錄
測試時間：115-10-05 11:40:34

## 正常測試：student1 登入後查詢個人化課程地圖
- 帳號：student1
- API：GET /api/student/courses/personalized
- HTTP 狀態碼：200
- 回應內容（節錄 JSON）：
```json
{
  "blocked_courses": [
    {
      "blocked_by_id": "CS102",
      "blocked_by_name": "\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)",
      "course_id": "CS201",
      "course_name": "\u8cc7\u6599\u7d50\u69cb",
      "course_type": "\u5c08\u696d\u5fc5\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "\u9663\u5217\u3001\u93c8\u7d50\u4e32\u5217\u3001\u5806\u758a\u3001\u4f47\u5217\u3001\u4e8c\u5143\u6a39\u3001\u5716\u5f62\u6f14\u7b97\u6cd5\u8207\u641c\u5c0b\u6392\u5e8f\u3002",
      "is_required": 1,
      "prerequisite_id": "CS102",
      "prerequisite_name": "\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)",
      "reason": "\u5148\u4fee\u79d1\u76ee\u3010\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)\u3011\u672a\u901a\u904e\uff0c\u7cfb\u7d71\u81ea\u52d5\u64cb\u4fee",
      "semester_suggest": "\u5927\u4e8c\u4e0a"
    },
    {
      "blocked_by_id": "CS102",
      "blocked_by_name": "\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)",
      "course_id": "CS202",
      "course_name": "\u7269\u4ef6\u5c0e\u5411\u7a0b\u5f0f\u8a2d\u8a08",
      "course_type": "\u5c08\u696d\u5fc5\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "\u985e\u5225\u3001\u5c01\u88dd\u3001\u7e7c\u627f\u3001\u591a\u578b\u3001Java/C++ \u5be6\u4f5c\u8207 GUI \u8a2d\u8a08\u3002",
      "is_required": 1,
      "prerequisite_id": "CS102",
      "prerequisite_name": "\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)",
      "reason": "\u5148\u4fee\u79d1\u76ee\u3010\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)\u3011\u672a\u901a\u904e\uff0c\u7cfb\u7d71\u81ea\u52d5\u64cb\u4fee",
      "semester_suggest": "\u5927\u4e8c\u4e0b"
    },
    {
      "blocked_by_id": "CS201",
      "blocked_by_name": "\u8cc7\u6599\u7d50\u69cb",
      "course_id": "CS301",
      "course_name": "\u6f14\u7b97\u6cd5\u5206\u6790",
      "course_type": "\u5c08\u696d\u5fc5\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "\u6642\u9593\u8907\u96dc\u5ea6\u3001\u5206\u6cbb\u6f14\u7b97\u6cd5\u3001\u8caa\u5a6a\u6f14\u7b97\u6cd5\u3001\u52d5\u614b\u898f\u5283\u8207 NP \u554f\u984c\u3002",
      "is_required": 1,
      "prerequisite_id": "CS201",
      "prerequisite_name": "\u8cc7\u6599\u7d50\u69cb",
      "reason": "\u5148\u4fee\u79d1\u76ee\u3010\u8cc7\u6599\u7d50\u69cb\u3011\u672a\u901a\u904e\uff0c\u7cfb\u7d71\u81ea\u52d5\u64cb\u4fee",
      "semester_suggest": "\u5927\u4e09\u4e0a"
    },
    {
      "blocked_by_id": "CS201",
      "blocked_by_name": "\u8cc7\u6599\u7d50\u69cb",
      "course_id": "CS302",
      "course_name": "\u8cc7\u6599\u5eab\u7cfb\u7d71\u6982\u8ad6",
      "course_type": "\u5c08\u696d\u5fc5\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "\u95dc\u806f\u5f0f\u8cc7\u6599\u5eab\u3001SQL \u67e5\u8a62\u6700\u4f73\u5316\u30013NF \u6b63\u898f\u5316\u8207 MySQL/PostgreSQL \u5be6\u52d9\u3002",
      "is_required": 1,
      "prerequisite_id": "CS201",
      "prerequisite_name": "\u8cc7\u6599\u7d50\u69cb",
      "reason": "\u5148\u4fee\u79d1\u76ee\u3010\u8cc7\u6599\u7d50\u69cb\u3011\u672a\u901a\u904e\uff0c\u7cfb\u7d71\u81ea\u52d5\u64cb\u4fee",
      "semester_suggest": "\u5927\u4e09\u4e0a"
    },
    {
      "blocked_by_id": "CS102",
      "blocked_by_name": "\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)",
      "course_id": "CS303",
      "course_name": "\u7db2\u9801\u524d\u5f8c\u7aef\u958b\u767c\u5be6\u52d9",
      "course_type": "\u5c08\u696d\u9078\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "HTML5/Tailwind/FastAPI/Flask \u5168\u7aef\u7cfb\u7d71\u6574\u5408\u8207 REST API\u3002",
      "is_required": 0,
      "prerequisite_id": "CS102",
      "prerequisite_name": "\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)",
      "reason": "\u5148\u4fee\u79d1\u76ee\u3010\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)\u3011\u672a\u901a\u904e\uff0c\u7cfb\u7d71\u81ea\u52d5\u64cb\u4fee",
      "semester_suggest": "\u5927\u4e09\u4e0a"
    },
    {
      "blocked_by_id": "CS302",
      "blocked_by_name": "\u8cc7\u6599\u5eab\u7cfb\u7d71\u6982\u8ad6",
      "course_id": "CS401",
      "course_name": "\u7562\u696d\u5c08\u984c\u7814\u8a0e(\u4e00)",
      "course_type": "\u5c08\u696d\u5fc5\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "\u7d9c\u5408\u8cc7\u8a0a\u7cfb\u7d71\u958b\u767c\u3001\u5c08\u984c\u5be6\u4f5c\u3001\u7cfb\u7d71\u67b6\u69cb\u8a2d\u8a08\u8207\u6210\u679c\u5c55\u89bd\u3002",
      "is_required": 1,
      "prerequisite_id": "CS302",
      "prerequisite_name": "\u8cc7\u6599\u5eab\u7cfb\u7d71\u6982\u8ad6",
      "reason": "\u5148\u4fee\u79d1\u76ee\u3010\u8cc7\u6599\u5eab\u7cfb\u7d71\u6982\u8ad6\u3011\u672a\u901a\u904e\uff0c\u7cfb\u7d71\u81ea\u52d5\u64cb\u4fee",
      "semester_suggest": "\u5927\u56db\u4e0a"
    },
    {
      "blocked_by_id": "CS401",
      "blocked_by_name": "\u7562\u696d\u5c08\u984c\u7814\u8a0e(\u4e00)",
      "course_id": "CS402",
      "course_name": "\u7562\u696d\u5c08\u984c\u7814\u8a0e(\u4e8c)",
      "course_type": "\u5c08\u696d\u5fc5\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "\u7562\u696d\u5c08\u984c\u6210\u679c\u5831\u544a\u64b0\u5beb\u3001\u7cfb\u7d71\u90e8\u7f72\u8207\u6821\u5916\u7af6\u8cfd\u767c\u8868\u3002",
      "is_required": 1,
      "prerequisite_id": "CS401",
      "prerequisite_name": "\u7562\u696d\u5c08\u984c\u7814\u8a0e(\u4e00)",
      "reason": "\u5148\u4fee\u79d1\u76ee\u3010\u7562\u696d\u5c08\u984c\u7814\u8a0e(\u4e00)\u3011\u672a\u901a\u904e\uff0c\u7cfb\u7d71\u81ea\u52d5\u64cb\u4fee",
      "semester_suggest": "\u5927\u56db\u4e0b"
    }
  ],
  "eligible_next_courses": [
    {
      "course_id": "CS304",
      "course_name": "\u96f2\u7aef\u904b\u7b97\u8207\u865b\u64ec\u5316",
      "course_type": "\u5c08\u696d\u9078\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "Docker \u5bb9\u5668\u5316\u3001Kubernetes\u3001AWS \u8207\u5fae\u670d\u52d9\u67b6\u69cb\u5be6\u6230\u3002",
      "is_required": 0,
      "prerequisite_id": "CS101",
      "prerequisite_name": "\u8a08\u7b97\u6a5f\u6982\u8ad6",
      "semester_suggest": "\u5927\u4e09\u4e0b"
    },
    {
      "course_id": "EN102",
      "course_name": "\u57fa\u790e\u82f1\u6587(\u4e8c)",
      "course_type": "\u5171\u540c\u5fc5\u4fee",
      "credits": 2,
      "dept_id": "CS",
      "description": "\u9032\u968e\u5546\u7528\u82f1\u6587\u8207\u5b78\u8853\u95b1\u8b80\u5831\u544a\u5beb\u4f5c\u3002",
      "is_required": 1,
      "prerequisite_id": "EN101",
      "prerequisite_name": "\u57fa\u790e\u82f1\u6587(\u4e00)",
      "semester_suggest": "\u5927\u4e00\u4e0b"
    },
    {
      "course_id": "GE102",
      "course_name": "\u8de8\u9818\u57df\u601d\u7dad\u8207\u5275\u65b0\u79d1\u6280",
      "course_type": "\u901a\u8b58\u6559\u80b2",
      "credits": 2,
      "dept_id": "CS",
      "description": "\u4eba\u5de5\u667a\u6167\u751f\u6d3b\u61c9\u7528\u3001\u8a2d\u8a08\u601d\u8003\u8207\u6578\u4f4d\u8f49\u578b\u601d\u7dad\u3002",
      "is_required": 0,
      "prerequisite_id": null,
      "prerequisite_name": null,
      "semester_suggest": "\u5927\u4e8c\u4e0a"
    },
    {
      "course_id": "GE103",
      "course_name": "\u74b0\u5883\u6c38\u7e8c\u8207\u793e\u6703\u8cac\u4efb",
      "course_type": "\u901a\u8b58\u6559\u80b2",
      "credits": 2,
      "dept_id": "CS",
      "description": "ESG \u6c38\u7e8c\u767c\u5c55\u76ee\u6a19\u3001\u751f\u614b\u4fdd\u80b2\u8207\u793e\u6703\u516c\u76ca\u5be6\u8e10\u3002",
      "is_required": 0,
      "prerequisite_id": null,
      "prerequisite_name": null,
      "semester_suggest": "\u5927\u4e8c\u4e0b"
    }
  ],
  "failed_courses": [
    {
      "course_id": "CS102",
      "course_name": "\u7a0b\u5f0f\u8a2d\u8a08(\u4e00)",
      "credits": 3,
      "downstream_blocked": [
        "\u8cc7\u6599\u7d50\u69cb",
        "\u7269\u4ef6\u5c0e\u5411\u7a0b\u5f0f\u8a2d\u8a08",
        "\u7db2\u9801\u524d\u5f8c\u7aef\u958b\u767c\u5be6\u52d9"
      ],
      "is_required": 1,
      "score": 55.0,
      "semester": "112-2",
      "suggested_action": "\u5efa\u8b70\u4e0b\u5b78\u671f\u6216\u6691\u671f\u512a\u5148\u5b89\u6392\u91cd\u4fee\uff1b\u76ee\u524d\u5df2\u9023\u5e36\u64cb\u4fee\uff1a\u8cc7\u6599\u7d50\u69cb, \u7269\u4ef6\u5c0e\u5411\u7a0b\u5f0f\u8a2d\u8a08, \u7db2\u9801\u524d\u5f8c\u7aef\u958b\u767c\u5be6\u52d9"
    }
  ],
  "passed_courses": [
    {
      "course_id": "CS101",
      "course_name": "\u8a08\u7b97\u6a5f\u6982\u8ad6",
      "course_type": "\u5c08\u696d\u5fc5\u4fee",
      "credits": 3,
      "dept_id": "CS",
      "description": "\u8a08\u7b97\u6a5f\u79d1\u5b78\u57fa\u790e\u3001\u96fb\u8166\u67b6\u69cb\u3001\u4e8c\u9032\u4f4d\u904b\u7b97\u3001\u4f5c\u696d\u7cfb\u7d71\u8207\u7db2\u8def\u6982\u8ad6\u3002",
      "is_required": 1,
      "prerequisite_id": null,
      "prerequisite_name": null,
      "score": 85.0,
      "semester": "112-1",
      "semester_suggest": "\u5927\u4e00\u4e0a"
    },
    {
      "course_id": "EN101",
      "course_name": "\u57fa\u790e\u82f1\u6587(\u4e00)",
      "course_type": "\u5171\u540c\u5fc5\u4fee",
      "credits": 2,
      "dept_id": "CS",
      "description": "\u5927\u4e00\u57fa\u790e\u5916\u8a9e\u807d\u8aaa\u8b80\u5beb\u8207\u5be6\u7528\u751f\u6d3b\u82f1\u8a9e\u3002",
      "is_required": 1,
      "prerequisite_id": null,
      "prerequisite_name": null,
      "score": 78.0,
      "semester": "112-1",
      "semester_suggest": "\u5927\u4e00\u4e0a"
    },
    {
      "course_id": "GE101",
      "course_name": "\u5927\u5b78\u4e4b\u9053\u8207\u6821\u5712\u502b\u7406",
      "course_type": "\u901a\u8b58\u6559\u80b2",
      "credits": 2,
      "dept_id": "CS",
      "description": "\u6821\u5712\u751f\u6d3b\u9069\u61c9\u3001\u751f\u547d\u6559\u80b2\u3001\u5b78\u8853\u8aa0\u4fe1\u8207\u8077\u5834\u502b\u7406\u3002",
      "is_required": 0,
      "prerequisite_id": null,
      "prerequisite_name": null,
      "score": 82.0,
      "semester": "112-1",
      "semester_suggest": "\u5927\u4e00\u4e0a"
    }
  ],
  "status": "success",
  "student": {
    "admission_year": 112,
    "class_name": "\u8cc7\u7ba1\u56db\u5fe0",
    "dept_id": "CS",
    "dept_name": "\u8cc7\u8a0a\u7ba1\u7406\u79d1\uff08\u4e94\u5c08\uff09",
    "full_name": "\u738b\u5c0f\u660e",
    "parent_phone": "0912-345-678",
    "student_id": "S112001"
  },
  "summary": {
    "blocked_count": 7,
    "eligible_next_count": 4,
    "failed_count": 1,
    "passed_count": 3,
    "total_passed_credits": 7
  }
}

```

## 異常測試：未登入呼叫同一支 API
- API：GET /api/student/courses/personalized（無 session cookie）
- HTTP 狀態碼：401
- 回應內容：
```

```

## 結果
- ✅ 正常測試通過：`student1`（王小明）登入後查詢，`程式設計(一)` (CS102) 顯示於 `failed_courses`，成績 55 分，並列出因此被擋修的下游科目（資料結構、物件導向程式設計、網頁前後端開發實務）；`eligible_next_courses` 另外列出可修讀的科目，`blocked_courses` 列出被擋修科目——**三者分開顯示，符合「能區分不及格／擋修／尚未修習」的驗收要求**。
- ✅ 異常測試通過：未登入呼叫同一支 API，回傳 HTTP 401，未洩漏任何學生資料。
- 判定：**R1 通過**
