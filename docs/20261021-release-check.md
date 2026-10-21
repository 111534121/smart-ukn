# 2026-10-21 本機整合驗收

本次整合老師工作台、扣考規則、請假來源與宿舍行政審核、行政案件工作台，以及功能資料表對照頁。保留舊有功能與資料。

## 驗證結果

- 完整 pytest：1685 passed、45 xfailed；報告見 `evidence/merge_20261021_tests.log`。xfailed 為既有標示的預期失敗，不能解讀成所有情境均驗收完成。
- 獨立真實 MySQL 資料庫：57 項檢查通過，涵蓋點名、請假、課程廣播、指定提醒、宿舍審核與學生／家長結果同步；見 `evidence/release_20261021/mysql_verification.json`。
- 實際本機 HTTP 服務：28 項登入、頁面、API 讀取與權限檢查通過；業務資料未寫入測試紀錄。
- 實際配置為本機 3307 埠、smart_ukn 資料庫。已先完整備份，再執行 integration_schema 與 teacher_workbench_schema 的增量檢查；需要的六個工作台欄位已存在，無需新增。既有各表筆數未減少，重跑工作台升級不新增欄位。

## 備份與回復

資料庫備份及本機檢查腳本位於已排除版本控制的 `db_backups/release_20261021/`，包含 `before_upgrade.sql`、JSON 資料與升級報告。可能包含個人資料，不上傳遠端。

回復前先停止本機網站，另備份目前資料，核對目標資料庫，再由資料庫管理者匯入 SQL 備份，並恢復同批 JSON／附件。DDL 不能依靠 SQL transaction rollback 還原；本次未做覆蓋現有資料的回復演練。

## 執行方式與限制

網站入口為 http://127.0.0.1:8000 。變更後重啟原有 Python 服務。可用 `python integration_schema.py` 與 `python teacher_workbench_schema.py` 對已備份的既有 MySQL 執行增量升級；不要以 init_db 重建既有業務資料。

行政案件工作台的案件／處室設定仍保存於 campus_store.json，附件亦在本機私有目錄；多程序或多台機器部署前需改為共享交易式儲存。本次只驗證本機環境，沒有部署遠端主機，也沒有實際發送外部 Email。

扣考功能是依規則計算的預警，不取代校方正式扣考判定；資料不足或需核對特殊假別時保留人工核對提示。
