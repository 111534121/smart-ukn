// 我的科系與顯示範圍 (分系)：上方工具列「🏫」按鈕、登入後第一次確認科系、轉系時可修改。
// 選「只看公開與本科資訊」後，期限、行事曆、課程地圖等 API 會帶 ?scope=mine 過濾。
// 依賴 campus-shell.js (api、openModal、closeModal、toast、tabLoaders、loadedTabs) 與 index.html (currentUser、escapeHtml)。

let deptPref = null;
const DEPT_PROMPT_KEY = 'ukn-dept-prompted';

function withScope(url) {
    if (!deptPref || deptPref.content_scope !== 'mine') return url;
    return url + (url.includes('?') ? '&' : '?') + 'scope=mine';
}

function shortDeptName(name) {
    return String(name || '').replace(/（.*?）|\(.*?\)/g, '');
}

function renderDeptScopeButton() {
    const text = document.getElementById('deptScopeText');
    if (!text || !deptPref) return;
    text.textContent = deptPref.dept_id
        ? `${shortDeptName(deptPref.dept_name)}${deptPref.content_scope === 'mine' ? '・只看本科' : ''}`
        : '選擇科系';
}

async function loadDeptPref() {
    try {
        deptPref = await api('/api/me/preferences');
    } catch (e) {
        deptPref = null;
    }
    renderDeptScopeButton();
    return deptPref;
}

function openDeptScopeDialog({ firstTime = false } = {}) {
    if (!deptPref) return;
    const colleges = [...new Set(deptPref.departments.map(d => d.college_name))];
    const isStudentSide = ['學生', '家長'].includes(currentUser.role);
    openModal(firstTime ? '確認你的科系' : '我的科系與顯示範圍', `
        <form onsubmit="saveDeptScope(event)" class="space-y-4">
            ${firstTime ? `<p class="text-xs text-slate-600">登入後網站會依你的科系顯示相關的期限、課程與獎學金。${deptPref.official_dept_name ? `學籍資料顯示你是 <strong>${escapeHtml(deptPref.official_dept_name)}</strong>，正確的話直接按「確認」即可。` : ''}</p>` : ''}
            <label class="block space-y-1">
                <span class="block text-xs font-semibold text-slate-600">我的科系</span>
                <select name="dept_id" class="w-full border border-slate-300 rounded px-3 py-2 bg-white">
                    <option value="">（不指定科系）</option>
                    ${colleges.map(c => `<optgroup label="${escapeHtml(c)}">
                        ${deptPref.departments.filter(d => d.college_name === c).map(d =>
                            `<option value="${escapeHtml(d.dept_id)}" ${d.dept_id === deptPref.dept_id ? 'selected' : ''}>${escapeHtml(d.dept_name)}</option>`).join('')}
                    </optgroup>`).join('')}
                </select>
            </label>
            ${isStudentSide && deptPref.official_dept_name ? `<p class="text-[11px] text-slate-500">轉系或想先看其他科的資訊可以直接改。這裡只影響網站顯示的內容，學分、畢業門檻仍以註冊組的學籍資料（${escapeHtml(deptPref.official_dept_name)}）為準。</p>` : ''}
            <fieldset class="space-y-2">
                <legend class="text-xs font-semibold text-slate-600 mb-1">顯示範圍</legend>
                <label class="flex items-start gap-2 border border-slate-200 rounded p-2.5 cursor-pointer has-[:checked]:border-ukn-500 has-[:checked]:bg-ukn-50">
                    <input type="radio" name="content_scope" value="all" ${deptPref.content_scope !== 'mine' ? 'checked' : ''} class="mt-0.5">
                    <span><span class="block font-semibold text-sm">顯示全部資訊</span><span class="block text-[11px] text-slate-500">各科系的期限、課程都看得到</span></span>
                </label>
                <label class="flex items-start gap-2 border border-slate-200 rounded p-2.5 cursor-pointer has-[:checked]:border-ukn-500 has-[:checked]:bg-ukn-50">
                    <input type="radio" name="content_scope" value="mine" ${deptPref.content_scope === 'mine' ? 'checked' : ''} class="mt-0.5">
                    <span><span class="block font-semibold text-sm">只看公開資訊與本科資訊</span><span class="block text-[11px] text-slate-500">隱藏其他科系專屬的期限、課程與獎學金，全校公告一樣會顯示</span></span>
                </label>
            </fieldset>
            <p class="text-[11px] text-slate-400">${deptPref.stored_in === 'account' ? '設定會存在你的帳號，換裝置登入也一樣。' : '未登入時設定只保留到關閉瀏覽器為止。'}</p>
            <p id="deptScopeError" class="hidden text-xs text-rose-700"></p>
            <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2">${firstTime ? '確認' : '儲存'}</button>
        </form>`);
}

async function saveDeptScope(event) {
    event.preventDefault();
    const f = new FormData(event.target);
    const err = document.getElementById('deptScopeError');
    try {
        deptPref = await api('/api/me/preferences', { method: 'PUT', json: {
            dept_id: f.get('dept_id') || null, content_scope: f.get('content_scope') } });
    } catch (e) {
        err.textContent = e.message;
        err.classList.remove('hidden');
        return;
    }
    markDeptPrompted();
    closeModal();
    renderDeptScopeButton();
    toast(deptPref.content_scope === 'mine' ? `已切換為只看公開與${shortDeptName(deptPref.dept_name)}的資訊` : '已顯示全部資訊');
    refreshScopedContent();
}

// 顯示範圍改變後，重新載入有依科系過濾的內容
function refreshScopedContent() {
    if (typeof loadDeadlines === 'function') loadDeadlines();
    if (typeof loadHomeUpcoming === 'function') loadHomeUpcoming();
    if (typeof refreshCalendar === 'function') refreshCalendar();
    ['tab-plan', 'tab-map'].forEach(tab => loadedTabs.delete(tab));
    if (typeof facultyState !== 'undefined') { facultyState.initialized = false; facultyState.dept = ''; }
    if (tabLoaders[currentTabId] && !loadedTabs.has(currentTabId)) {
        loadedTabs.add(currentTabId);
        Promise.resolve(tabLoaders[currentTabId]()).catch(e => console.error(e));
    }
}

function deptPromptKey() {
    return `${DEPT_PROMPT_KEY}:${currentUser.username || ''}`;
}

function markDeptPrompted() {
    try { localStorage.setItem(deptPromptKey(), '1'); } catch (e) { /* 無痕模式 */ }
}

// 登入時分系：已登入、還沒存過設定、這台裝置也還沒問過時，請使用者確認一次科系
function maybePromptDept() {
    if (!deptPref || deptPref.is_saved || !isLoggedIn() || currentUser.role === '訪客') return;
    try { if (localStorage.getItem(deptPromptKey())) return; } catch (e) { return; }
    markDeptPrompted();
    openDeptScopeDialog({ firstTime: true });
}
