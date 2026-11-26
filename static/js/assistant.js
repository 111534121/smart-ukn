// AI 申辦小幫手：口語提問 → 資料庫找出申辦流程與規章 → (有設定 Claude 時) 由 Claude 整理成回答。
// 依賴 campus-shell.js (api、tabLoaders) 與 index.html (escapeHtml、jumpToChecklist)。

const ASSISTANT_EXAMPLES = ['生病不能去上課怎麼辦', '我想退掉一門跟不上的課', '多益考過可以免修英文嗎', '考到證照可以領獎金嗎', '畢業學分要怎麼審查'];
const ASSISTANT_HISTORY_KEY = 'ukn-assistant-history';
const ASSISTANT_HISTORY_MAX = 10;
let assistantHistory = [];
let assistantBusy = false;

function loadAssistantHistory() {
    try { assistantHistory = JSON.parse(sessionStorage.getItem(ASSISTANT_HISTORY_KEY) || '[]'); } catch (e) { assistantHistory = []; }
}

function saveAssistantHistory() {
    try { sessionStorage.setItem(ASSISTANT_HISTORY_KEY, JSON.stringify(assistantHistory.slice(0, ASSISTANT_HISTORY_MAX))); } catch (e) { /* 無痕模式 */ }
}

async function loadAssistant() {
    loadAssistantHistory();
    let mode = 'local';
    try { mode = (await api('/api/assistant/status')).mode; } catch (e) { /* 預設本機模式 */ }
    document.getElementById('assistantBody').innerHTML = `
        <form id="assistantForm" class="space-y-2">
            <label for="assistantInput" class="sr-only">你的問題</label>
            <div class="flex flex-col sm:flex-row gap-2">
                <textarea id="assistantInput" rows="2" maxlength="200" placeholder="例如：我發燒兩天沒去上課，要怎麼請假？"
                    class="flex-1 border border-slate-300 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ukn-500"></textarea>
                <button id="assistantSubmit" class="sm:self-stretch bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2 text-sm whitespace-nowrap">詢問</button>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
                <span class="text-slate-500">試試看：</span>
                ${ASSISTANT_EXAMPLES.map(q => `<button type="button" class="assistant-example border border-slate-300 rounded-full px-2.5 py-1 hover:border-ukn-500 hover:text-ukn-800">${escapeHtml(q)}</button>`).join('')}
            </div>
            <p class="text-[11px] text-slate-400">${mode === 'claude'
                ? '回答由 Claude 根據學校資料庫整理，步驟與文件以下方列出的資料庫內容為準。'
                : '目前以資料庫關鍵字比對回答 (未啟用 Claude)。'} 正式規定請以各處室公告為準。</p>
        </form>
        <div id="assistantAnswers" class="space-y-4" aria-live="polite"></div>
        <details id="assistantBrowse" class="rounded border border-slate-200">
            <summary class="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-2">
                <span class="font-semibold text-sm text-slate-800">📚 瀏覽全部規章與申辦流程</span>
                <span class="text-xs text-slate-400 transition" id="assistantBrowseArrow">▾</span>
            </summary>
            <div id="assistantBrowseBody" class="px-4 pb-4 text-sm text-slate-500">載入中…</div>
        </details>`;
    const input = document.getElementById('assistantInput');
    document.getElementById('assistantForm').addEventListener('submit', e => { e.preventDefault(); askAssistant(input.value); });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); askAssistant(input.value); }
    });
    document.querySelectorAll('.assistant-example').forEach(b => b.addEventListener('click', () => { input.value = b.textContent; askAssistant(b.textContent); }));
    document.getElementById('assistantBrowse').addEventListener('toggle', loadAssistantBrowseOnce);
    renderAssistantAnswers();
}

// 瀏覽全部規章與申辦流程 (併入自「AI 智慧校規」的 /api/campus/rules/tree 分類瀏覽；
// 不找也能逛，第一次展開才載入，不用先打字)
let assistantBrowseTree = null;
let assistantBrowseLoaded = false;

async function loadAssistantBrowseOnce() {
    if (!document.getElementById('assistantBrowse').open || assistantBrowseLoaded) return;
    assistantBrowseLoaded = true;
    const body = document.getElementById('assistantBrowseBody');
    try {
        assistantBrowseTree = await api('/api/campus/rules/tree');
    } catch (e) {
        body.innerHTML = '<p class="text-rose-600">載入失敗，請稍後再試。</p>';
        return;
    }
    renderAssistantBrowse();
}

function renderAssistantBrowse() {
    const body = document.getElementById('assistantBrowseBody');
    const { categories = [], processes = [] } = assistantBrowseTree || {};
    const byOffice = {};
    processes.forEach(p => { (byOffice[p.office] = byOffice[p.office] || []).push(p); });
    body.innerHTML = `
        <div class="space-y-4">
            <div>
                <div class="text-xs font-bold text-slate-600 mb-2">依分類看規章</div>
                <div class="space-y-2">${categories.map(c => `
                    <details class="rounded border border-slate-200">
                        <summary class="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-slate-800">${escapeHtml(c.icon)} ${escapeHtml(c.name)} <span class="text-[11px] text-slate-400 font-normal">${c.rules.length}</span></summary>
                        <div class="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">${c.rules.map(r => `
                            <button type="button" data-browse-rule="${Number(r.kb_id)}" class="text-left rounded border border-slate-200 bg-white px-3 py-2 hover:border-ukn-400">
                                <div class="text-sm font-semibold text-slate-900">${escapeHtml(r.title)}</div>
                                <div class="text-[11px] text-slate-500">${escapeHtml(r.subcategory || '')}${r.checklist ? ' · 有申辦流程' : ''}</div>
                            </button>`).join('')}</div>
                    </details>`).join('') || '<p class="text-xs text-slate-500">目前沒有規章資料。</p>'}</div>
            </div>
            <div>
                <div class="text-xs font-bold text-slate-600 mb-2">依處室看申辦流程</div>
                <div class="space-y-2">${Object.entries(byOffice).map(([office, list]) => `
                    <details class="rounded border border-slate-200">
                        <summary class="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-slate-800">${escapeHtml(office)} <span class="text-[11px] text-slate-400 font-normal">${list.length}</span></summary>
                        <div class="px-3 pb-3 space-y-2">${list.map(assistantBrowseFlowHtml).join('')}</div>
                    </details>`).join('') || '<p class="text-xs text-slate-500">目前沒有申辦流程資料。</p>'}</div>
            </div>
        </div>
        <div id="assistantBrowseRuleDetail" class="mt-3"></div>`;
    body.querySelectorAll('[data-browse-rule]').forEach(btn => btn.addEventListener('click', () => {
        const rule = categories.flatMap(c => c.rules).find(r => r.kb_id === Number(btn.dataset.browseRule));
        showAssistantBrowseRule(rule);
    }));
}

function showAssistantBrowseRule(rule) {
    if (!rule) return;
    const box = document.getElementById('assistantBrowseRuleDetail');
    box.innerHTML = `
        <div class="rounded border border-ukn-200 bg-ukn-50 p-4 space-y-2 text-sm">
            <div class="font-bold text-slate-900">${escapeHtml(rule.title)} <span class="text-[11px] font-normal text-slate-500">${escapeHtml(rule.category_name || '')}${rule.subcategory ? ` · ${escapeHtml(rule.subcategory)}` : ''}</span></div>
            <p class="text-slate-700 whitespace-pre-line">${escapeHtml(rule.content || '')}</p>
            <p class="text-[11px] text-slate-500">${rule.source_doc ? `出處：${escapeHtml(rule.source_doc)}${rule.source_page ? ` 第 ${escapeHtml(String(rule.source_page))} 頁` : ''}` : ''}
                ${rule.source_url ? ` <a href="${escapeHtml(rule.source_url)}" target="_blank" rel="noopener noreferrer" class="text-ukn-700 hover:underline">原文 ↗</a>` : ''}</p>
            ${rule.checklist ? assistantBrowseFlowHtml(rule.checklist) : ''}
        </div>`;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// tree()/rule_card() 回傳的流程資料形狀 (item_id/business_name/office/office_location/office_hours/
// contact_phone/required_docs[]/steps[]/form_download_url/system_url[/deadline])，跟 /api/assistant/ask
// 回傳給 renderAssistantFlow() 的形狀不同 (那邊是 category_name/deadline_week_info/required_docs 字串)，所以另外寫一個。
function assistantBrowseFlowHtml(p) {
    const links = [
        p.form_download_url ? `<a href="${escapeHtml(p.form_download_url)}" class="text-ukn-700 hover:underline">⬇️ 下載表單</a>` : '',
        p.system_url ? `<a href="${escapeHtml(p.system_url)}" target="_blank" rel="noopener noreferrer" class="text-ukn-700 hover:underline">🔗 線上系統 ↗</a>` : '',
        p.item_id ? `<button type="button" onclick="jumpToChecklist(${Number(p.item_id)})" class="text-ukn-700 hover:underline">📝 開啟流程卡 (可勾選進度)</button>` : ''
    ].filter(Boolean).join('');
    return `
        <details class="rounded border border-slate-200 group">
            <summary class="cursor-pointer list-none px-3 py-2 flex items-center justify-between gap-2">
                <span class="font-semibold text-sm text-slate-900">${escapeHtml(p.business_name)} <span class="text-xs font-normal text-slate-500">${escapeHtml(p.office || '')}</span></span>
                <span class="text-xs text-slate-400 group-open:rotate-180 transition">▾</span>
            </summary>
            <div class="px-3 pb-3 space-y-2 text-sm">
                <ol class="list-decimal pl-5 space-y-1 text-slate-700">${(p.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
                ${p.required_docs && p.required_docs.length ? `<p class="text-xs"><span class="font-semibold text-slate-700">要準備：</span>${p.required_docs.map(escapeHtml).join('、')}</p>` : ''}
                <p class="text-xs text-slate-600">📍 ${escapeHtml(p.office_location || '')}　☎️ ${escapeHtml(p.contact_phone || '')}${p.office_hours ? `　🕘 ${escapeHtml(p.office_hours)}` : ''}</p>
                ${p.deadline ? `<p class="text-xs text-amber-800">⏰ 受理期間：${escapeHtml(p.deadline)}</p>` : ''}
                ${links ? `<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1">${links}</div>` : ''}
            </div>
        </details>`;
}

async function askAssistant(question) {
    question = String(question || '').trim();
    if (!question || assistantBusy) return;
    assistantBusy = true;
    const btn = document.getElementById('assistantSubmit');
    btn.disabled = true;
    btn.textContent = '查詢中…';
    document.getElementById('assistantAnswers').insertAdjacentHTML('afterbegin',
        `<div id="assistantPending" class="rounded border border-slate-200 p-4 text-sm text-slate-500 animate-pulse">正在查詢學校的申辦流程…</div>`);
    try {
        const data = await api('/api/assistant/ask', { json: { question } });
        assistantHistory.unshift(data);
        saveAssistantHistory();
        document.getElementById('assistantInput').value = '';
    } catch (e) {
        assistantHistory.unshift({ question, error: e.message });
    } finally {
        assistantBusy = false;
        btn.disabled = false;
        btn.textContent = '詢問';
        renderAssistantAnswers();
    }
}

function renderAssistantFlow(f, open) {
    const links = [
        f.form_download_url ? `<a href="${escapeHtml(f.form_download_url)}" class="text-ukn-700 hover:underline">⬇️ 下載表單</a>` : '',
        f.system_url ? `<a href="${escapeHtml(f.system_url)}" target="_blank" rel="noopener noreferrer" class="text-ukn-700 hover:underline">🔗 線上系統 ↗</a>` : '',
        f.item_id ? `<button type="button" onclick="jumpToChecklist(${Number(f.item_id)})" class="text-ukn-700 hover:underline">📝 開啟流程卡 (可勾選進度)</button>` : ''
    ].filter(Boolean).join('');
    return `
        <details class="rounded border border-slate-200 group" ${open ? 'open' : ''}>
            <summary class="cursor-pointer list-none px-3 py-2 flex items-center justify-between gap-2">
                <span class="font-semibold text-sm text-slate-900">${escapeHtml(f.business_name)} <span class="text-xs font-normal text-slate-500">${escapeHtml(f.category_name || '')}</span></span>
                <span class="text-xs text-slate-400 group-open:rotate-180 transition">▾</span>
            </summary>
            <div class="px-3 pb-3 space-y-2 text-sm">
                <ol class="list-decimal pl-5 space-y-1 text-slate-700">${f.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
                ${f.required_docs ? `<p class="text-xs"><span class="font-semibold text-slate-700">要準備：</span>${escapeHtml(f.required_docs)}</p>` : ''}
                <p class="text-xs text-slate-600">📍 ${escapeHtml(f.office_location || '')}　☎️ ${escapeHtml(f.contact_phone || '')}${f.office_hours ? `　🕘 ${escapeHtml(f.office_hours)}` : ''}</p>
                ${f.deadline_week_info ? `<p class="text-xs text-amber-800">⏰ 受理期間：${escapeHtml(f.deadline_week_info)}</p>` : ''}
                ${links ? `<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1">${links}</div>` : ''}
            </div>
        </details>`;
}

function renderAssistantAnswers() {
    const box = document.getElementById('assistantAnswers');
    if (!box) return;
    if (!assistantHistory.length) {
        box.innerHTML = '<div class="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded border border-slate-200">輸入你的狀況，或點上方的範例問題試試看。</div>';
        return;
    }
    box.innerHTML = assistantHistory.map((a, i) => {
        if (a.error) {
            return `<article class="rounded border border-rose-200 bg-rose-50 p-4 text-sm"><div class="font-semibold text-slate-900 mb-1">🙋 ${escapeHtml(a.question)}</div><p class="text-rose-700">${escapeHtml(a.error)}</p></article>`;
        }
        return `
            <article class="rounded border ${i === 0 ? 'border-ukn-300' : 'border-slate-200'} p-4 space-y-3">
                <div class="font-semibold text-slate-900">🙋 ${escapeHtml(a.question)}</div>
                <div class="flex gap-2">
                    <span class="text-xl leading-none">🤖</span>
                    <div class="space-y-1 min-w-0">
                        <p class="text-sm text-slate-800 leading-relaxed whitespace-pre-line">${escapeHtml(a.answer)}</p>
                        <p class="text-[11px] text-slate-400">${a.mode === 'claude' ? '由 Claude 依資料庫內容整理' : '資料庫比對結果'}${a.understood_as.length ? `・理解為：${a.understood_as.map(escapeHtml).join('、')}` : ''}</p>
                    </div>
                </div>
                ${a.flows.length ? `<div class="space-y-2"><h3 class="text-xs font-bold text-slate-600">相關申請步驟</h3>${a.flows.map((f, j) => renderAssistantFlow(f, i === 0 && j === 0)).join('')}</div>` : ''}
                ${a.rules.length ? `<div class="space-y-1.5"><h3 class="text-xs font-bold text-slate-600">相關規章</h3>${a.rules.map(r => `
                    <div class="text-xs rounded bg-slate-50 border border-slate-200 px-3 py-2"><span class="font-semibold text-slate-800">${escapeHtml(r.title)}</span>
                        <span class="text-slate-500">《${escapeHtml(r.doc_name || '')}》${r.page ? ` 第 ${escapeHtml(r.page)} 頁` : ''}</span>
                        <p class="text-slate-600 mt-0.5">${escapeHtml(r.excerpt)}</p>
                        ${r.url ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="text-ukn-700 hover:underline">原文 ↗</a>` : ''}</div>`).join('')}</div>` : ''}
                ${a.contacts.length ? `<div class="space-y-1"><h3 class="text-xs font-bold text-slate-600">可以洽詢的處室</h3>${a.contacts.map(c => `
                    <div class="text-xs text-slate-600">${escapeHtml(c.office)}：${escapeHtml(c.location)}，${escapeHtml(c.phone)}（${escapeHtml(c.business)}）</div>`).join('')}
                    <p class="text-[11px] text-slate-400">這個問題已記錄下來，管理員會補上對應的說法。</p></div>` : ''}
            </article>`;
    }).join('');
}

tabLoaders['tab-assistant'] = loadAssistant;
