// 線上申辦與進度追蹤：學生線上填表送出 → 依關卡逐關簽核，用圖示進度條顯示跑到哪一關；老師 / 處室在首頁審核。
// 依賴 campus-shell.js (api、toast、openModal、closeModal、isStaff) 與 index.html (currentUser、escapeHtml、checklistsCache)。

const APP_STATE_STYLE = {
    done: { circle: 'bg-emerald-600 border-emerald-600 text-white', line: 'bg-emerald-500', label: 'text-emerald-800' },
    current: { circle: 'bg-white border-ukn-600 ring-4 ring-ukn-100 app-pulse', line: 'bg-slate-200', label: 'text-ukn-800 font-bold' },
    rejected: { circle: 'bg-rose-600 border-rose-600 text-white', line: 'bg-slate-200', label: 'text-rose-700 font-bold' },
    withdrawn: { circle: 'bg-slate-300 border-slate-300', line: 'bg-slate-200', label: 'text-slate-500' },
    pending: { circle: 'bg-slate-50 border-slate-200 grayscale opacity-60', line: 'bg-slate-200', label: 'text-slate-400' },
};
const APP_STATUS_BADGE = {
    '審核中': 'bg-ukn-50 text-ukn-800 border-ukn-200',
    '已完成': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    '已退回': 'bg-rose-50 text-rose-800 border-rose-200',
    '已撤回': 'bg-slate-100 text-slate-600 border-slate-200',
};
let onlineAppsCache = [];

// 圖示進度條：每一關一個圓圈，完成 ✓ 綠色、目前這關藍框閃爍、退回 ✕ 紅色、還沒到灰色
function appStepper(app, { compact = false } = {}) {
    const size = compact ? 'w-8 h-8 text-sm' : 'w-11 h-11 text-xl';
    const top = compact ? 'top-4' : 'top-[22px]';
    return `
        <ol class="flex items-start min-w-max sm:min-w-0" aria-label="申請進度">
            ${app.steps.map((s, i) => {
                const st = APP_STATE_STYLE[s.state];
                const prevDone = i > 0 && app.steps[i - 1].state === 'done' && s.state !== 'pending';
                const mark = s.state === 'done' ? '<span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] leading-4 text-center font-bold border border-emerald-300">✓</span>'
                    : s.state === 'rejected' ? '<span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-white text-rose-700 text-[10px] leading-4 text-center font-bold border border-rose-300">✕</span>' : '';
                const stateText = { done: '完成', current: '進行中', rejected: '退回', withdrawn: '已撤回', pending: '尚未開始' }[s.state];
                return `
                <li class="relative flex-1 flex flex-col items-center text-center ${compact ? 'w-14' : 'w-20'} sm:w-auto" aria-label="${escapeHtml(s.name)}：${stateText}">
                    ${i > 0 ? `<span class="absolute ${top} right-1/2 w-full h-1 -translate-y-1/2 rounded ${prevDone ? APP_STATE_STYLE.done.line : 'bg-slate-200'}"></span>` : ''}
                    <span class="relative z-10 ${size} rounded-full border-2 flex items-center justify-center ${st.circle}" title="${escapeHtml(s.name)}：${stateText}">
                        <span aria-hidden="true">${s.icon}</span>${mark}
                    </span>
                    <span class="mt-1.5 ${compact ? 'text-[10px]' : 'text-[11px]'} leading-tight px-0.5 ${st.label}">${escapeHtml(s.name)}</span>
                    ${!compact && s.at ? `<span class="text-[10px] text-slate-400 leading-tight">${escapeHtml(s.at.slice(5))}</span>` : ''}
                    ${!compact && s.state === 'current' ? '<span class="text-[10px] text-ukn-700 leading-tight">⏳ 等待中</span>' : ''}
                </li>`;
            }).join('')}
        </ol>`;
}

function appCard(app, { compact = false, review = false } = {}) {
    const fields = Object.entries(app.fields || {}).filter(([, v]) => v);
    return `
        <article class="bg-white rounded border ${app.status === '已退回' ? 'border-rose-300' : 'border-slate-200'} p-4 space-y-3" id="online-app-${Number(app.id)}">
            <div class="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <div class="font-bold text-slate-900 text-sm">${escapeHtml(app.business_name)}</div>
                    <div class="text-[11px] text-slate-500">${review ? `${escapeHtml(app.student_name)} <span class="font-mono">${escapeHtml(app.student_id)}</span> · ${escapeHtml(app.class_name)} · ` : ''}申請編號 #${Number(app.id)} · ${escapeHtml(app.submitted_at)} 送出</div>
                </div>
                <span class="text-[11px] border rounded px-2 py-0.5 font-semibold ${APP_STATUS_BADGE[app.status] || ''}">${escapeHtml(app.status)} · ${app.progress_percent}%</span>
            </div>
            <div class="overflow-x-auto pb-1">${appStepper(app, { compact })}</div>
            <p class="text-xs ${app.status === '已退回' ? 'text-rose-700 font-semibold' : 'text-slate-600'}">${escapeHtml(app.summary)}</p>
            ${compact ? '' : `
            <details class="text-xs text-slate-600">
                <summary class="cursor-pointer text-ukn-700 font-semibold">申請內容與簽核紀錄</summary>
                <dl class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 mt-2">
                    ${fields.map(([k, v]) => `<dt class="text-slate-500">${escapeHtml(appFieldLabel(app, k))}</dt><dd class="text-slate-800 break-words">${escapeHtml(v)}</dd>`).join('')}
                </dl>
                <ol class="mt-3 border-l-2 border-slate-200 pl-3 space-y-1.5">
                    ${app.history.map(h => `<li><span class="text-slate-400">${escapeHtml(h.at)}</span> ${escapeHtml(app.stages[h.stage]?.name || '')} · <b>${escapeHtml(h.action)}</b> · ${escapeHtml(h.by)}${h.note ? `：${escapeHtml(h.note)}` : ''}</li>`).join('')}
                </ol>
            </details>`}
            <div class="flex flex-wrap gap-2">
                ${app.can_withdraw && !review ? `<button type="button" onclick="withdrawOnlineApp(${Number(app.id)})" class="text-xs border border-slate-300 rounded px-2.5 py-1 hover:border-rose-400 text-slate-600">撤回申請</button>` : ''}
                ${app.status === '已退回' && currentUser.role === '學生' && !review ? `<button type="button" onclick="openApplyModal(${Number(app.item_id)}, ${Number(app.id)})" class="text-xs bg-ukn-800 text-white rounded px-2.5 py-1">修改後重新送出</button>` : ''}
                ${app.form_code && !review ? `<a href="/forms/${encodeURIComponent(app.form_code)}" target="_blank" class="text-xs border border-slate-300 rounded px-2.5 py-1 hover:border-ukn-500">紙本表單</a>` : ''}
            </div>
            ${review && app.can_review ? `
                <div class="flex flex-col sm:flex-row gap-2 border-t border-slate-100 pt-3">
                    <input id="appNote-${Number(app.id)}" maxlength="200" placeholder="意見 (退回時必填)" class="flex-1 text-xs border border-slate-300 rounded px-2 py-1.5">
                    <div class="flex gap-2">
                        <button type="button" onclick="reviewOnlineApp(${Number(app.id)}, 'approve')" class="text-xs font-bold px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white">核准「${escapeHtml(app.stages[app.current_stage].name)}」</button>
                        <button type="button" onclick="reviewOnlineApp(${Number(app.id)}, 'reject')" class="text-xs font-bold px-3 py-1.5 rounded border border-rose-300 text-rose-700 hover:bg-rose-50">退回</button>
                    </div>
                </div>` : ''}
        </article>`;
}

const appFieldLabels = {};
function appFieldLabel(app, key) {
    return appFieldLabels[`${app.item_id}:${key}`] || { phone: '聯絡電話' }[key] || key;
}
function rememberFieldLabels(itemId, fields) {
    fields.forEach(f => { appFieldLabels[`${itemId}:${f.key}`] = f.label; });
}

// ---------- 學生 / 家長：我的線上申請 ----------

async function loadOnlineApps() {
    const box = document.getElementById('onlineAppsList');
    if (!box) return;
    let data;
    try { data = await api('/api/applications/mine'); } catch (e) { box.innerHTML = `<p class="text-xs text-rose-700">${escapeHtml(e.message)}</p>`; return; }
    onlineAppsCache = data.data;
    // 申請內容的欄位名稱 (只在詳細內容展開時用)
    await Promise.all([...new Set(onlineAppsCache.map(a => a.item_id))].map(id =>
        api(`/api/applications/form/${id}`).then(f => rememberFieldLabels(id, [...f.common_fields, ...f.fields])).catch(() => {})));

    if (data.requires_login) {
        box.innerHTML = loginPrompt('登入學生帳號後，可以直接線上送出申請，並隨時看到跑到哪一關。');
    } else if (!onlineAppsCache.length) {
        box.innerHTML = '<div class="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded border border-slate-200">還沒有線上申請。在下方任一申辦項目按「📤 線上申請」就能送出，不用再跑紙本。</div>';
    } else {
        box.innerHTML = onlineAppsCache.map(a => appCard(a)).join('');
    }

    const home = document.getElementById('homeOnlineApps');
    if (home) {
        const active = onlineAppsCache.filter(a => a.status === '審核中' || a.status === '已退回');
        document.getElementById('homeOnlineAppsList').innerHTML = active.map(a => appCard(a, { compact: true })).join('');
        home.classList.toggle('hidden', active.length === 0);
    }
}

async function openApplyModal(itemId, retryOf = null) {
    if (currentUser.role !== '學生') {
        openModal('線上申請', loginPrompt(currentUser.role === '訪客' ? '線上申請需要登入學生帳號。' : '線上申請僅限學生本人送出。'));
        return;
    }
    let f;
    try { f = await api(`/api/applications/form/${itemId}`); } catch (e) { toast(e.message, 'error'); return; }
    rememberFieldLabels(itemId, [...f.common_fields, ...f.fields]);
    const previous = retryOf ? (onlineAppsCache.find(a => a.id === retryOf)?.fields || {}) : {};
    const input = field => {
        const value = escapeHtml(previous[field.key] || '');
        const common = `name="${escapeHtml(field.key)}" maxlength="300" placeholder="例：${escapeHtml(field.example)}" class="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"`;
        return `
            <label class="block space-y-1">
                <span class="text-xs font-semibold text-slate-700">${escapeHtml(field.label)}${field.optional ? ' <span class="font-normal text-slate-400">(選填)</span>' : ' <span class="text-rose-600">*</span>'}</span>
                ${field.long ? `<textarea rows="3" ${common}>${value}</textarea>` : `<input ${common} value="${value}">`}
                ${field.tip ? `<span class="block text-[11px] text-slate-500">💡 ${escapeHtml(field.tip)}</span>` : ''}
            </label>`;
    };
    const flowPreview = { steps: f.stages.map((s, i) => ({ ...s, state: i === 0 ? 'current' : 'pending' })) };
    openModal(`線上申請：${f.business_name}`, `
        <form id="applyForm" class="space-y-4">
            <div class="rounded bg-ukn-50/60 border border-ukn-100 p-3 space-y-2">
                <div class="text-xs font-bold text-ukn-900">送出後會依序經過這些關卡</div>
                <div class="overflow-x-auto">${appStepper(flowPreview, { compact: true })}</div>
            </div>
            ${f.intro ? `<p class="text-xs text-slate-600">${escapeHtml(f.intro)}</p>` : ''}
            <div class="grid grid-cols-3 gap-2 text-xs">
                ${f.common_fields.filter(c => c.auto).map(c => `<div class="rounded bg-slate-50 border border-slate-200 px-2 py-1.5"><div class="text-slate-500">${escapeHtml(c.label)}</div><div class="font-semibold text-slate-900">${escapeHtml(f.prefill[c.key] || '—')}</div></div>`).join('')}
            </div>
            ${f.common_fields.filter(c => !c.auto).map(input).join('')}
            ${f.fields.map(input).join('')}
            ${f.attachments.length ? `<div class="text-xs text-slate-600"><b>紙本 / 正本仍需送到承辦單位：</b>${f.attachments.map(escapeHtml).join('、')}</div>` : ''}
            <p id="applyError" class="hidden text-xs text-rose-700"></p>
            <div class="flex flex-wrap items-center gap-2">
                <button type="submit" class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-4 py-2 text-sm">📤 送出申請</button>
                <button type="button" onclick="fillApplyExample()" class="border border-slate-300 rounded px-3 py-2 text-sm hover:border-ukn-500">帶入範例看看</button>
                ${f.form_url ? `<a href="${escapeHtml(f.form_url)}?example=1" target="_blank" class="ml-auto text-xs text-ukn-700 hover:underline">看紙本填寫範例 ↗</a>` : ''}
            </div>
        </form>`);
    const form = document.getElementById('applyForm');
    form.dataset.example = JSON.stringify(Object.fromEntries([...f.common_fields, ...f.fields].map(x => [x.key, x.example])));
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const fields = Object.fromEntries(new FormData(form).entries());
        const err = document.getElementById('applyError');
        try {
            const res = await api('/api/applications', { json: { item_id: itemId, fields } });
            closeModal();
            toast(res.message);
            await loadOnlineApps();
            document.getElementById(`online-app-${res.data.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (ex) {
            err.textContent = ex.message;
            err.classList.remove('hidden');
        }
    });
}

function fillApplyExample() {
    const form = document.getElementById('applyForm');
    const example = JSON.parse(form.dataset.example || '{}');
    form.querySelectorAll('input[name], textarea[name]').forEach(el => { if (!el.value) el.value = example[el.name] || ''; });
    toast('已帶入範例，記得改成你自己的資料再送出');
}

async function withdrawOnlineApp(id) {
    if (!confirm('確定要撤回這張申請嗎？撤回後要重新送出。')) return;
    try { toast((await api(`/api/applications/${id}/withdraw`, { method: 'POST' })).message); } catch (e) { toast(e.message, 'error'); }
    loadOnlineApps();
}

// ---------- 老師 / 處室：審核 ----------

async function loadAppReview() {
    const section = document.getElementById('homeAppReview');
    if (!section || !isStaff()) return;
    const status = document.getElementById('appReviewFilter').value;
    try {
        const data = await api(`/api/applications/review?status=${status}`);
        section.classList.remove('hidden');
        document.getElementById('appReviewScope').textContent = `審核範圍：${data.scope || '—'}${status === 'pending' ? `，${data.data.length} 張輪到你審` : ''}`;
        document.getElementById('appReviewList').innerHTML = data.data.length
            ? data.data.map(a => appCard(a, { review: true })).join('')
            : '<p class="text-xs text-slate-400">目前沒有符合條件的申請。</p>';
    } catch (e) {
        console.error(e);
    }
}

async function reviewOnlineApp(id, action) {
    const note = document.getElementById(`appNote-${id}`).value.trim();
    try {
        const res = await api(`/api/applications/${id}/review`, { json: { action, note } });
        toast(res.message);
        loadAppReview();
    } catch (e) { toast(e.message, 'error'); }
}
