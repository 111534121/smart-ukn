// 表單下載：隨時查詢 (上方工具列「📄 表單」開視窗) + 常用表單 (登入後加星號，常用的排最前面)。
// 同一套畫面也放在「行政申辦」分頁的 #formsFinder。依賴 campus-shell.js (api、openModal、toast、esc)。

const formsFinder = { q: '', timer: null };

function formsFinderShell(prefix) {
    return `
        <div class="space-y-3">
            <label class="block relative">
                <span class="sr-only">搜尋表單</span>
                <input id="${prefix}FormsQuery" type="search" maxlength="30" value="${esc(formsFinder.q)}" placeholder="例如：請假、停修、證照、畢業、英文"
                    oninput="queueFormsSearch('${prefix}', this.value)"
                    class="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ukn-500">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </label>
            <div id="${prefix}FormsList" class="space-y-2" aria-live="polite"><div class="text-xs text-slate-400">載入中…</div></div>
        </div>`;
}

function queueFormsSearch(prefix, value) {
    clearTimeout(formsFinder.timer);
    formsFinder.timer = setTimeout(() => { formsFinder.q = value.trim(); loadFormsList(prefix); }, 250);
}

// 【功能：表單下載】畫面：工具列「📄 表單」視窗與申辦分頁共用，☆ 呼叫 /api/campus/forms/favorites
async function loadFormsList(prefix) {
    const box = document.getElementById(`${prefix}FormsList`);
    if (!box) return;
    try {
        const r = await api(`/api/campus/forms?q=${encodeURIComponent(formsFinder.q)}`);
        box.innerHTML = renderFormsList(r, prefix);
    } catch (e) { box.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function renderFormsList(r, prefix) {
    if (!r.data.length) {
        return `<div class="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded p-4 text-center">找不到「${esc(formsFinder.q)}」相關的表單，換個說法試試，或到「AI 智慧校規查詢」描述你要辦的事。</div>`;
    }
    const favCount = r.data.filter(f => f.is_favorite).length;
    const head = r.logged_in
        ? (favCount ? `<div class="text-xs font-bold text-slate-600">⭐ 我的常用表單（${favCount}）</div>` : '<div class="text-[11px] text-slate-500">按 ☆ 可以把常用的表單加到最上面，下次直接下載。</div>')
        : '<div class="text-[11px] text-slate-500"><a href="/login" class="text-ukn-700 hover:underline">登入</a>後可以把常用的表單加星號，放在最上面。</div>';
    let dividerShown = false;
    return head + r.data.map(f => {
        const divider = r.logged_in && favCount && !f.is_favorite && !dividerShown
            ? (dividerShown = true, '<div class="text-xs font-bold text-slate-600 pt-2">其他表單</div>') : '';
        return `${divider}
            <div class="rounded border ${f.is_favorite ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'} p-3 flex items-start gap-3">
                ${r.logged_in ? `<button type="button" onclick="toggleFavoriteForm('${prefix}', '${esc(f.code)}', ${!f.is_favorite})"
                    class="text-lg leading-none ${f.is_favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}"
                    aria-pressed="${f.is_favorite}" aria-label="${f.is_favorite ? '從常用表單移除' : '加入常用表單'}：${esc(f.title)}" title="${f.is_favorite ? '從常用移除' : '加入常用'}">${f.is_favorite ? '★' : '☆'}</button>` : ''}
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-slate-900">${esc(f.title)}</div>
                    <div class="text-[11px] text-slate-500">${esc(f.business_name)}${f.office ? ` · ${esc(f.office)}` : ''}${f.deadline ? ` · ${esc(f.deadline)}` : ''}</div>
                    <div class="flex flex-wrap gap-2 mt-2 text-xs">
                        <a href="${esc(f.url)}" target="_blank" rel="noopener" class="bg-ukn-800 hover:bg-ukn-900 text-white font-semibold rounded px-2.5 py-1">⬇️ 開啟 / 列印</a>
                        ${f.word_url ? `<a href="${esc(f.word_url)}" class="border border-slate-300 rounded px-2.5 py-1 hover:border-ukn-500">下載 Word</a>` : ''}
                        ${f.example_url ? `<a href="${esc(f.example_url)}" target="_blank" rel="noopener" class="border border-slate-300 rounded px-2.5 py-1 hover:border-ukn-500">看填寫範例</a>` : ''}
                    </div>
                </div>
            </div>`;
    }).join('');
}

async function toggleFavoriteForm(prefix, code, favorite) {
    try {
        const r = await api('/api/campus/forms/favorites', { method: 'PUT', json: { code, favorite } });
        toast(r.message);
        loadFormsList(prefix);
        if (prefix !== 'page') loadFormsList('page');  // 視窗裡改了，申辦分頁的清單也同步
    } catch (e) { toast(e.message, 'error'); }
}

function openFormsFinder() {
    openModal('📄 表單下載', formsFinderShell('modal'));
    loadFormsList('modal');
    setTimeout(() => document.getElementById('modalFormsQuery')?.focus(), 50);
}

function initPageFormsFinder() {
    const host = document.getElementById('formsFinder');
    if (!host || host.dataset.ready) return;
    host.dataset.ready = '1';
    host.innerHTML = formsFinderShell('page');
    loadFormsList('page');
}

document.addEventListener('DOMContentLoaded', initPageFormsFinder);
