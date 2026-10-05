# R5 CMS 管理 測試紀錄

> ✅ **2026-10-05 更新**：下方「修改紀錄缺失」已修復（新增 `audit_logs` 表 + `/api/admin/audit-logs` + 後台「修改歷程」分頁），複測結果見 `evidence/README.md`。以下保留原始測試紀錄作為修復前對照。

測試時間：2026-10-05 11:55

## 正常測試：管理員新增一筆校規條文
- 帳號：admin
- API：POST /api/rules
- Body：{"category_id":1,"subcategory":"測試","keyword":"QA測試條文","official_term":"QA測試條文","content":"這是一筆由驗收測試新增的條文，用於確認 CMS 新增功能是否正常。","doc_name":"QA測試.pdf","page":1,"url":"https://www.ukn.edu.tw/"}
- HTTP 狀態碼：201
- 回應內容：
```json
{
  "data": {
    "category_id": 1,
    "category_name": "教務學則與選課",
    "content": "這是一筆由驗收測試新增的條文，用於確認 CMS 新增功能是否正常。",
    "doc_name": "QA測試.pdf",
    "id": 6,
    "keyword": "QA測試條文",
    "official_term": "QA測試條文",
    "page": 1,
    "subcategory": "測試",
    "url": "https://www.ukn.edu.tw/"
  },
  "message": "校規條文新增成功！",
  "status": "success"
}
```

## 異常測試：學生嘗試呼叫同一支新增規章 API
- 帳號：student1
- API：POST /api/rules（同樣的 Body）
- HTTP 狀態碼：403
- 回應內容：權限不足，拒絕寫入

## 結果
- ✅ 權限保護通過：新增/修改/刪除規章、同義詞、期限的 API 皆有 `role_required("管理員", "教職員")` 或等效檢查，學生呼叫會被後端拒絕（403），不是只靠前端隱藏按鈕。
- ⚠️ **發現缺口：完全沒有「修改紀錄／版本紀錄」機制**。檢查資料庫目前共 29 張資料表，**沒有任何一張**是用來記錄「誰在何時修改了什麼資料、修改前後內容」的（如 `audit_logs`、`rule_versions` 之類）。app.py 原始碼裡也沒有任何寫入修改紀錄的程式碼。上面這筆 QA 測試新增的條文，系統內**沒有留下「admin 於 2026-10-05 新增了 id=6」這類紀錄**，只是單純寫進 `knowledge_base` 表而已。
- 判定：**R5 部分通過**——「未授權者不得修改」已經做到，但「每次修改有紀錄」完全沒做，見下方未完成項目說明。
