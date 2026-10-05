# R3 規章搜尋 測試紀錄

> ✅ **2026-10-05 更新**：下方「最後更新日期缺失」已修復（`knowledge_base` 新增 `updated_at` 欄位，API 回應新增 `last_updated`），複測結果見 `evidence/README.md`。以下保留原始測試紀錄作為修復前對照。

測試時間：115-10-05 11:42:05
（註：第一次測試因 PowerShell 終端機編碼問題，中文關鍵字誤送成亂碼，已改用明確 UTF-8 bytes 編碼重測，以下為修正後的正確結果）

## 正常測試：搜尋關鍵字「棄修」（口語用詞，非官方名稱）
- API：POST /api/search  Body: {"query":"棄修"}
- HTTP 狀態碼：200
- 回應內容：
```json
{
  "all_matches": [
    {
      "category_id": 1,
      "category_name": "\u6559\u52d9\u5b78\u5247\u8207\u9078\u8ab2",
      "content": "\u5b78\u751f\u65bc\u52a0\u9000\u9078\u622a\u6b62\u5f8c\uff0c\u56e0\u7279\u6b8a\u539f\u56e0\u7121\u6cd5\u7e7c\u7e8c\u4fee\u7fd2\u67d0\u9580\u8ab2\u7a0b\uff0c\u5f97\u65bc\u5b78\u671f\u7b2c 10-12 \u9031\u7533\u8acb\u505c\u4fee\uff08\u6bcf\u5b78\u671f\u4ee5 2 \u79d1\u70ba\u9650\uff09\u3002\u505c\u4fee\u8ab2\u7a0b\u4ecd\u9808\u767b\u8a18\u65bc\u6b77\u5e74\u6210\u7e3e\u55ae\uff0c\u4f46\u6210\u7e3e\u6b04\u8a3b\u8a18\u300c\u505c\u4fee\u300d\uff0c\u4e0d\u8a08\u5165\u8a72\u5b78\u671f\u5b78\u5206\u6578\u8a08\u7b97\uff0c\u4e14\u505c\u4fee\u5f8c\u5b78\u5206\u6578\u4e0d\u5f97\u4f4e\u65bc\u8a72\u5b78\u671f\u6700\u4f4e\u61c9\u4fee\u5b78\u5206\u3002",
      "doc_name": "\u5eb7\u5be7\u5927\u5b78\u5b78\u751f\u5b78\u5247.pdf",
      "id": 1,
      "keyword": "\u68c4\u4fee",
      "official_term": "\u505c\u4fee",
      "page": 12,
      "subcategory": "\u9078\u8ab2\u8207\u505c\u4fee",
      "url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw"
    }
  ],
  "answer": "\u5b78\u751f\u65bc\u52a0\u9000\u9078\u622a\u6b62\u5f8c\uff0c\u56e0\u7279\u6b8a\u539f\u56e0\u7121\u6cd5\u7e7c\u7e8c\u4fee\u7fd2\u67d0\u9580\u8ab2\u7a0b\uff0c\u5f97\u65bc\u5b78\u671f\u7b2c 10-12 \u9031\u7533\u8acb\u505c\u4fee\uff08\u6bcf\u5b78\u671f\u4ee5 2 \u79d1\u70ba\u9650\uff09\u3002\u505c\u4fee\u8ab2\u7a0b\u4ecd\u9808\u767b\u8a18\u65bc\u6b77\u5e74\u6210\u7e3e\u55ae\uff0c\u4f46\u6210\u7e3e\u6b04\u8a3b\u8a18\u300c\u505c\u4fee\u300d\uff0c\u4e0d\u8a08\u5165\u8a72\u5b78\u671f\u5b78\u5206\u6578\u8a08\u7b97\uff0c\u4e14\u505c\u4fee\u5f8c\u5b78\u5206\u6578\u4e0d\u5f97\u4f4e\u65bc\u8a72\u5b78\u671f\u6700\u4f4e\u61c9\u4fee\u5b78\u5206\u3002",
  "category_name": "\u6559\u52d9\u5b78\u5247\u8207\u9078\u8ab2",
  "checklist": [
    "\u81f3\u6821\u52d9\u8cc7\u8a0a\u7cfb\u7d71\u767b\u5165\u300e\u505c\u4fee\u7533\u8acb\u8868\u300f",
    "\u5217\u5370\u7d19\u672c\u505c\u4fee\u7533\u8acb\u55ae",
    "\u89aa\u81ea\u9001\u8acb\u4efb\u8ab2\u6559\u5e2b\u7c3d\u7ae0\u540c\u610f",
    "\u9001\u8acb\u73ed\u7d1a\u5c0e\u5e2b\u53ca\u79d1\u4e3b\u4efb\u7c3d\u7ae0",
    "\u65bc\u7b2c12\u9031\u4e94\u524d\u9001\u4ea4\u6559\u52d9\u8655\u8ab2\u52d9\u7d44\u6838\u5099"
  ],
  "is_synonym_matched": true,
  "kb_id": 1,
  "matched": true,
  "official_term": "\u505c\u4fee",
  "page_num": 12,
  "related_checklist": {
    "audience": "\u5b78\u751f",
    "business_name": "\u5b78\u751f\u8ab2\u7a0b\u505c\u4fee\uff08\u68c4\u4fee\uff09\u7533\u8acb",
    "category_id": 1,
    "category_name": "\u8ab2\u52d9\u7d44",
    "contact_phone": "02-2632-1181 \u5206\u6a5f 310, 312",
    "deadline_week_info": "\u7b2c 10-12 \u9031 (\u672c\u9031\u53d7\u7406\u4e2d)",
    "form_download_url": "/forms/course_withdraw_form.pdf",
    "item_id": 1,
    "office_hours": "\u9031\u4e00\u81f3\u9031\u4e94 08:30 - 17:00",
    "office_location": "\u5eb7\u5be7\u6a13 2 \u6a13 A201 (\u8ab2\u52d9\u7d44)",
    "related_kb_id": 1,
    "required_docs": "\u505c\u4fee\u7533\u8acb\u55ae\u7d19\u672c\u3001\u6b77\u5e74\u6210\u7e3e\u55ae\u6b63\u672c",
    "steps_json": [
      "\u81f3\u6821\u52d9\u8cc7\u8a0a\u7cfb\u7d71\u767b\u5165\u300e\u505c\u4fee\u7533\u8acb\u8868\u300f",
      "\u5217\u5370\u7d19\u672c\u505c\u4fee\u7533\u8acb\u55ae",
      "\u89aa\u81ea\u9001\u8acb\u4efb\u8ab2\u6559\u5e2b\u7c3d\u7ae0\u540c\u610f",
      "\u9001\u8acb\u73ed\u7d1a\u5c0e\u5e2b\u53ca\u79d1\u4e3b\u4efb\u7c3d\u7ae0",
      "\u65bc\u7b2c12\u9031\u4e94\u524d\u9001\u4ea4\u6559\u52d9\u8655\u8ab2\u52d9\u7d44\u6838\u5099"
    ],
    "system_url": "https://sys.ukn.edu.tw/cos_withdraw"
  },
  "search_term": "\u505c\u4fee",
  "source_doc": "\u5eb7\u5be7\u5927\u5b78\u5b78\u751f\u5b78\u5247.pdf",
  "source_url": "https://www.ukn.edu.tw/p/412-1000-381.php?Lang=zh-tw",
  "status": "success",
  "subcategory": "\u9078\u8ab2\u8207\u505c\u4fee"
}

```

## 異常測試：空白關鍵字
- API：POST /api/search  Body: {"query":""}
- HTTP 狀態碼：400
- 回應內容：
```

```

## 結果
- ✅ 正常測試通過：輸入口語用詞「棄修」，系統透過同義詞字典自動對應官方名稱「停修」(is_synonym_matched: true)，並回傳：
  - 官方名稱：停修
  - 來源：source_doc（康寧大學學生學則.pdf）、source_url（官方網址）、page_num（頁碼 12）
  - 辦理流程：checklist / elated_checklist（完整步驟、應備文件、受理時間、承辦地點、聯絡分機）
  - 既有系統入口：elated_checklist.system_url
- ✅ 異常測試通過：空白關鍵字回傳 HTTP 400，未回傳無意義結果。
- ⚠️ **發現缺口：規章回答沒有顯示「最後更新日期」**。檢查 knowledge_base 資料表結構 (smart_ukn.sql) 及本次 API 回應，皆找不到 updated_at 或任何日期欄位。目前系統**無法**讓使用者知道這則規章是什麼時候更新的，不符合交付前檢查「每個規章回答都能說明來源與最後更新日期」的要求。
- 判定：**R3 部分通過**——搜尋與來源追溯功能正常，但「最後更新日期」缺失，見下方未完成項目說明。
