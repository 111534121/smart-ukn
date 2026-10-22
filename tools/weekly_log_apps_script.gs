/**
 * 每週紀錄自動寫入 (貼到試算表的「擴充功能 → Apps Script」)
 *
 * 安裝一次即可：
 *   1. 在試算表選單「擴充功能 → Apps Script」，把這整份貼上取代原本內容
 *   2. 把下面 TOKEN 改成一串只有你知道的密碼 (例如隨便打 20 個英數字)
 *   3. 右上「部署 → 新增部署作業」→ 類型選「網頁應用程式」
 *        執行身分：我 ／ 誰可以存取：所有人 → 部署，第一次會要求授權，按允許
 *   4. 複製「網頁應用程式網址」，和 TOKEN 一起寫進專案 .env：
 *        WEEKLY_LOG_URL=https://script.google.com/macros/s/xxxx/exec
 *        WEEKLY_LOG_TOKEN=你設的密碼
 *
 * 寫入規則 (與 tools/weekly_log.py 的預覽相同)：
 *   - 已經有同一列 (週次、日期、負責人、使用者、功能模組相同) 且「做了什麼」空白 → 只填 做了什麼／完成率／備註
 *   - 否則寫進第一個空白列 (日期到備註都空白，週次空白或相同)
 *   - 都沒有就加在最後
 *   不會覆蓋別人已經填好的內容。
 */
const TOKEN = '請改成你自己的密碼';
const SHEET_GID = 1743771076;
const HEADER = ['週次', '日期', '負責人', '使用者', '功能模組', '做了什麼', '完成率', '備註'];

function doPost(e) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return reply({ ok: false, message: 'token 錯誤' });
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets().find(s => s.getSheetId() === SHEET_GID);
    if (!sheet) return reply({ ok: false, message: '找不到工作表 gid ' + SHEET_GID });

    const values = sheet.getDataRange().getDisplayValues();
    const headerRow = values.findIndex(r => r[0] === HEADER[0] && r[5] === HEADER[5]);
    if (headerRow < 0) return reply({ ok: false, message: '找不到標題列 (週次…備註)' });

    const results = [];
    const used = new Set();
    (body.rows || []).forEach(row => {
      const cells = HEADER.map(h => String(row[h] == null ? '' : row[h]));
      let target = -1, mode = 'append';
      for (let i = headerRow + 1; i < values.length; i++) {
        if (used.has(i)) continue;
        const r = values[i];
        if (r.slice(0, 5).join('\u0001') === cells.slice(0, 5).join('\u0001') && !r[5].trim()) { target = i; mode = 'fill'; break; }
      }
      if (target < 0) {
        for (let i = headerRow + 1; i < values.length; i++) {
          if (used.has(i)) continue;
          const r = values[i];
          if ((r[0] === '' || r[0] === cells[0]) && r.slice(1).every(c => !c.trim())) { target = i; mode = 'empty'; break; }
        }
      }
      if (target < 0) {
        sheet.appendRow(cells);
        results.push({ row: sheet.getLastRow(), mode: 'append', module: cells[4] });
        return;
      }
      used.add(target);
      if (mode === 'fill') sheet.getRange(target + 1, 6, 1, 3).setValues([cells.slice(5)]);
      else sheet.getRange(target + 1, 1, 1, 8).setValues([cells]);
      values[target] = cells;
      results.push({ row: target + 1, mode: mode, module: cells[4] });
    });
    return reply({ ok: true, results: results });
  } catch (err) {
    return reply({ ok: false, message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
