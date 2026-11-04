// 全站共用的欄位驗證小工具：帳號/學號類欄位擋中文輸入，驗證錯誤時標紅並顯示哪一欄錯了。
//
// 用法：
//   1. <input id="xxx"> 旁邊放一個 <p id="xxx-err" class="field-error-text"></p> 顯示該欄錯誤訊息
//      (CSS class 定義在各頁面的 <style>：紅框 field-error-input、紅字 field-error-text)
//   2. 帳號/學號類欄位載入時呼叫 restrictAccountInput('xxx')，輸入時即時擋掉中文/全形字元
//   3. 送出前驗證：valid ? clearFieldError('xxx') : setFieldError('xxx', '請輸入帳號')
//   4. 多個欄位一起清掉：clearFieldErrors(['xxx', 'yyy'])

// 帳號/學號只接受半形英數字、底線、點、連字號 (例如 student1、S112001、dorm_demo)
const ACCOUNT_CHARS_PATTERN = /[^A-Za-z0-9_.-]/g;

function restrictAccountInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
        const cleaned = el.value.replace(ACCOUNT_CHARS_PATTERN, '');
        if (cleaned !== el.value) el.value = cleaned;
    });
}

function setFieldError(id, message) {
    const el = document.getElementById(id);
    const errEl = document.getElementById(`${id}-err`);
    if (el) el.classList.add('field-error-input');
    if (errEl) { errEl.textContent = message || ''; errEl.classList.add('show'); }
}

function clearFieldError(id) {
    const el = document.getElementById(id);
    const errEl = document.getElementById(`${id}-err`);
    if (el) el.classList.remove('field-error-input');
    if (errEl) { errEl.textContent = ''; errEl.classList.remove('show'); }
}

function clearFieldErrors(ids) {
    ids.forEach(clearFieldError);
}
