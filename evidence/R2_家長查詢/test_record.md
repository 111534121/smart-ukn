# R2 家長查詢 測試紀錄

> ✅ **2026-10-05 12:05 最終重測**：`parent1` 查詢綁定子女 → 200；嘗試查詢 S112002 → 403。結果與下方一致，無迴歸。

測試時間：115-10-05 11:41:13

## 正常測試：parent1 登入後查詢綁定子女 (王小明 S112001) 的畢業門檻儀表板
- 帳號：parent1
- API：GET /api/student/graduation/dashboard
- HTTP 狀態碼：200
- 回應內容：
```json
{
  "certificates": {
    "list": [
      {
        "cert_name": "\u4e59\u7d1a\u96fb\u8166\u8edf\u9ad4\u61c9\u7528\u6280\u8853\u58eb",
        "issue_date": "2026-08-15",
        "student_id": "S112001"
      },
      {
        "cert_name": "\u4e19\u7d1a\u96fb\u8166\u786c\u9ad4\u88dd\u4fee\u6280\u8853\u58eb",
        "issue_date": "2026-06-20",
        "student_id": "S112001"
      }
    ],
    "meets_requirement": true,
    "owned_count": 2,
    "required": 2
  },
  "cohort": {
    "admission_year": 112,
    "cert_breakdown": [
      {
        "cert_name": "\u4e19\u7d1a\u96fb\u8166\u786c\u9ad4\u88dd\u4fee\u6280\u8853\u58eb",
        "holder_count": 2,
        "percent_of_cohort": 40.0
      },
      {
        "cert_name": "\u4e59\u7d1a\u96fb\u8166\u8edf\u9ad4\u61c9\u7528\u6280\u8853\u58eb",
        "holder_count": 2,
        "percent_of_cohort": 40.0
      },
      {
        "cert_name": "TQC+ \u7db2\u9801\u8a2d\u8a08\u5de5\u7a0b\u5e2b",
        "holder_count": 1,
        "percent_of_cohort": 20.0
      }
    ],
    "cohort_size": 5,
    "percent_1plus_cert": 60.0,
    "percent_meeting_cert_threshold": 40.0,
    "students_meeting_cert_threshold": 2,
    "students_with_1plus_cert": 3
  },
  "credits": {
    "breakdown": [
      {
        "category": "\u79d1\u5c08\u696d\u5fc5\u4fee",
        "earned": 3,
        "is_met": false,
        "remaining": 57,
        "required": 60
      },
      {
        "category": "\u79d1\u5c08\u696d\u9078\u4fee",
        "earned": 0,
        "is_met": false,
        "remaining": 30,
        "required": 30
      },
      {
        "category": "\u901a\u8b58\u8207\u5171\u540c\u5fc5\u4fee",
        "earned": 4,
        "is_met": false,
        "remaining": 24,
        "required": 28
      }
    ],
    "earned": 7,
    "english_threshold_name": "\u591a\u76ca\u6e2c\u9a57 550 \u5206\u4ee5\u4e0a \u6216 \u901a\u904e\u9032\u968e\u5be6\u7528\u82f1\u8a9e\u6aa2\u5b9a",
    "meets_requirement": false,
    "progress_percent": 3.2,
    "remaining": 213,
    "threshold": 220
  },
  "overall_meets_graduation_requirement": false,
  "status": "success",
  "student": {
    "admission_year": 112,
    "class_name": "\u8cc7\u7ba1\u56db\u5fe0",
    "dept_name": "\u8cc7\u8a0a\u7ba1\u7406\u79d1\uff08\u4e94\u5c08\uff09",
    "full_name": "\u738b\u5c0f\u660e",
    "student_id": "S112001"
  }
}

```

## 異常測試：parent1 嘗試指定查詢非綁定子女 (S112002) 的資料
- API：GET /api/student/graduation/dashboard?student_id=S112002
- HTTP 狀態碼：403
- 回應內容：
```

```

## 結果
- ✅ 正常測試通過：`parent1`（王大明，王小明家長）登入後查詢，正確回傳綁定子女 S112001 的畢業門檻儀表板資料。
- ✅ 異常測試通過：`parent1` 嘗試在網址加上 `student_id=S112002` 查詢非綁定子女資料，後端回傳 HTTP 403「無權查詢非本人子女之學生資料」，正確拒絕。
- 判定：**R2 通過**（權限檢查由後端 `_resolve_graduation_target_student()` 執行，非僅前端隱藏）
