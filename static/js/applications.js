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
            ${app.keep_until ? `<p class="text-[11px] ${app.keep_days_left <= 14 ? 'text-amber-700 font-semibold' : 'text-slate-500'}">📦 保存到 ${escapeHtml(app.keep_until)}（還有 ${Number(app.keep_days_left)} 天）${app.keep_days_left <= 14 ? '，快到期了，記得先列印或存成 PDF' : ''}</p>` : ''}
            ${compact ? '' : `
            <details class="text-xs text-slate-600">
                <summary class="cursor-pointer text-ukn-700 font-semibold">申請內容與簽核紀錄</summary>
                <dl class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 mt-2">
                    ${fields.map(([k, v]) => `<dt class="text-slate-500">${escapeHtml(appFieldLabel(app, k))}</dt><dd class="text-slate-800 break-words">${escapeHtml(v)}</dd>`).join('')}
                </dl>
                <ol class="mt-3 border-l-2 border-slate-200 pl-3 space-y-1.5">
                    ${app.history.map(h => `<li><span class="text-slate-400">${escapeHtml(h.at)}</span> ${escapeHtml(app.stages[h.stage]?.name || '')} · <b>${escapeHtml(h.action)}</b> · ${escapeHtml(h.by)}${h.note ? `：${escapeHtml(h.note)}` : ''}${h.stamp ? ` <span class="text-rose-700">🔴 已蓋章 <span class="font-mono">${escapeHtml(h.stamp.code)}</span></span>` : ''}</li>`).join('')}
                </ol>
            </details>`}
            ${(app.files || []).length ? `<div class="flex flex-wrap gap-2 text-xs">${app.files.map(f => `<a href="${escapeHtml(f.url)}" target="_blank" rel="noopener" class="border border-slate-300 rounded px-2 py-1 hover:border-ukn-500">📎 ${escapeHtml(f.name)}</a>`).join('')}</div>` : ''}
            <div class="flex flex-wrap gap-2">
                ${app.can_withdraw && !review ? `<button type="button" onclick="withdrawOnlineApp(${Number(app.id)})" class="text-xs border border-slate-300 rounded px-2.5 py-1 hover:border-rose-400 text-slate-600">撤回申請</button>` : ''}
                ${app.status === '已退回' && currentUser.role === '學生' && !review ? `<button type="button" onclick="${app.is_upload ? `openUploadModal(${Number(app.id)})` : `openApplyModal(${Number(app.item_id)}, ${Number(app.id)})`}"class="text-xs bg-ukn-800 text-white rounded px-2.5 py-1">修改後重新送出</button>` : ''}
                ${compact ? '' : `<a href="${escapeHtml(app.signed_url)}" target="_blank" rel="noopener" class="text-xs border border-rose-300 text-rose-800 rounded px-2.5 py-1 hover:bg-rose-50">📄 蓋章申請表${app.stamp_count ? `（已蓋 ${Number(app.stamp_count)} 個章）` : ''}</a>`}
                ${app.form_code && !review ? `<a href="/forms/${encodeURIComponent(app.form_code)}" target="_blank" class="text-xs border border-slate-300 rounded px-2.5 py-1 hover:border-ukn-500">紙本表單</a>` : ''}
            </div>
            ${review && app.can_review ? `
                <div class="flex flex-col sm:flex-row gap-2 border-t border-slate-100 pt-3">
                    <input id="appNote-${Number(app.id)}" maxlength="200" placeholder="意見 / 交辦下一關的話 (退回時必填)" class="flex-1 text-xs border border-slate-300 rounded px-2 py-1.5">
                    <div class="flex gap-2">
                        <button type="button" onclick="reviewOnlineApp(${Number(app.id)}, 'approve', ${escapeHtml(JSON.stringify(app.next_stage || ''))})" class="text-xs font-bold px-3 py-1.5 rounded bg-rose-700 hover:bg-rose-800 text-white">🔴 ${app.next_stage && app.next_stage !== '完成' ? `蓋章並送交「${escapeHtml(app.next_stage)}」` : '蓋章核准（最後一關）'}</button>
                        <button type="button" onclick="reviewOnlineApp(${Number(app.id)}, 'reject')" class="text-xs font-bold px-3 py-1.5 rounded border border-rose-300 text-rose-700 hover:bg-rose-50">退回</button>
                    </div>
                </div>` : ''}
        </article>`;
}

const appFieldLabels = {};
function appFieldLabel(app, key) {
    return appFieldLabels[`${app.item_id}:${key}`] || { phone: '聯絡電話', title: '申請表名稱', reason: '申請事項說明' }[key] || key;
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
    // 通知中心 (index.html 的 buildNotifications)：申請全部蓋完章或被退回時提醒
    if (typeof notifSources !== 'undefined') {
        notifSources.applications = onlineAppsCache;
        if (typeof renderNotifications === 'function') renderNotifications();
    }
    // 申請內容的欄位名稱 (只在詳細內容展開時用)
    // item_id 0 是學生自己上傳的申請表，沒有欄位定義
    await Promise.all([...new Set(onlineAppsCache.map(a => a.item_id))].filter(Boolean).map(id =>
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

// 學生、家長每 2 分鐘重抓一次，老師蓋完最後一關後不用重新整理就會收到通知
setInterval(() => {
    if (['學生', '家長'].includes(currentUser?.role) && document.visibilityState === 'visible') loadOnlineApps();
}, 120000);

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

async function reviewOnlineApp(id, action, nextStage = '') {
    const note = document.getElementById(`appNote-${id}`).value.trim();
    if (action === 'approve' && !confirm(nextStage && nextStage !== '完成'
        ? `確定用你的印章蓋章，並送交下一關「${nextStage}」？蓋章後無法撤銷。`
        : '確定用你的印章蓋章？這是最後一關，蓋完整張申請就完成了，無法撤銷。')) return;
    try {
        const res = await api(`/api/applications/${id}/review`, { json: { action, note } });
        toast(res.message);
        loadAppReview();
    } catch (e) { toast(e.message, 'error'); }
}

// ---------- 學生：上傳自己的申請表，選申請種類，關卡由系統排好 ----------

let uploadOptions = null;

async function openUploadModal(retryOf = null) {
    if (currentUser.role !== '學生') {
        openModal('上傳申請表', loginPrompt(currentUser.role === '訪客' ? '上傳申請表需要登入學生帳號。' : '上傳申請表僅限學生本人。'));
        return;
    }
    try { uploadOptions = uploadOptions || await api('/api/applications/upload-options'); } catch (e) { toast(e.message, 'error'); return; }
    const prev = retryOf ? onlineAppsCache.find(a => a.id === retryOf) : null;
    const lim = uploadOptions.limits;
    openModal(prev ? '修改後重新送出' : '上傳自己的申請表', `
        <form id="uploadForm" class="space-y-4">
            <ol class="text-xs text-slate-600 bg-ukn-50/60 border border-ukn-100 rounded p-3 space-y-1 list-decimal list-inside">
                <li>選要申請什麼，系統會自動排好要給誰蓋章</li>
                <li>沒有紙本表單可以在下方下載空白表填寫，再拍照或存成 PDF 上傳</li>
                <li>送出後每一關線上蓋章，自動送到下一關，不用再拿紙本跑</li>
            </ol>
            <div class="space-y-1">
                <label for="uploadType" class="block text-xs font-semibold text-slate-700">要申請什麼 <span class="text-rose-600">*</span></label>
                <select id="uploadType" name="type" required onchange="refreshUploadRoute()" class="w-full border border-slate-300 rounded px-2 py-1.5 text-sm">
                    <option value="">請選擇申請項目</option>
                    ${uploadOptions.types.map(t => `<option value="${escapeHtml(t.key)}" ${t.key === prev?.fields.type ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('')}
                </select>
                <div class="overflow-x-auto" id="uploadPreview"></div>
            </div>
            <label class="block space-y-1">
                <span class="text-xs font-semibold text-slate-700">聯絡電話 <span class="text-rose-600">*</span></span>
                <input name="phone" maxlength="30" required value="${escapeHtml(prev?.fields.phone || '')}" placeholder="例：0912-345-678" class="w-full border border-slate-300 rounded px-2 py-1.5 text-sm">
            </label>
            <label class="block space-y-1">
                <span class="text-xs font-semibold text-slate-700">申請事項說明 <span class="font-normal text-slate-400">(選填)</span></span>
                <textarea name="reason" rows="2" maxlength="300" placeholder="例：申請寒假到○○公司實習兩個月" class="w-full border border-slate-300 rounded px-2 py-1.5 text-sm">${escapeHtml(prev?.fields.reason || '')}</textarea>
            </label>
            <label class="block space-y-1">
                <span class="text-xs font-semibold text-slate-700">申請表檔案 <span class="text-rose-600">*</span></span>
                <input type="file" name="files" multiple required accept=".pdf,.jpg,.jpeg,.png" class="block w-full text-xs">
                <span class="block text-[11px] text-slate-500">💡 ${escapeHtml(lim.types)}，每個 ${Number(lim.max_mb)} MB 以內，最多 ${Number(lim.max_files)} 個${prev ? '；重新送出要再上傳一次' : ''}</span>
            </label>
            <p id="uploadError" class="hidden text-xs text-rose-700"></p>
            <button type="submit" class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-4 py-2 text-sm">📤 上傳並送出</button>
        </form>`);
    refreshUploadRoute();
    const form = document.getElementById('uploadForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const err = document.getElementById('uploadError');
        try {
            const res = await api('/api/applications/upload', { method: 'POST', body: new FormData(form) });
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

function refreshUploadRoute() {
    // 選了申請項目才顯示會經過哪幾關（唯讀，學生不能改）
    const kind = uploadOptions.types.find(t => t.key === document.getElementById('uploadType').value);
    const box = document.getElementById('uploadPreview');
    if (!kind) { box.innerHTML = ''; return; }
    const steps = [{ name: '線上送出', icon: '📤' }, ...kind.stages, { name: '完成', icon: '✅' }]
        .map((s, i) => ({ ...s, state: i === 0 ? 'current' : 'pending' }));
    const url = escapeHtml(kind.form_url);
    const link = 'inline-flex items-center gap-1 text-xs font-bold border border-ukn-300 text-ukn-800 rounded px-2.5 py-1 hover:bg-ukn-50';
    box.innerHTML = `
        <div class="flex flex-wrap items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
            <span class="text-xs text-slate-700 mr-auto">📄 ${escapeHtml(kind.name)}表</span>
            <a href="${url}" target="_blank" rel="noopener" class="${link}">🖨️ 空白表 (列印 / PDF)</a>
            <a href="${url}?download=doc" class="${link}">⬇️ 下載 Word</a>
            <a href="${url}?example=1" target="_blank" rel="noopener" class="${link}">👀 填寫範例</a>
        </div>
        <div class="text-[11px] text-slate-500 mt-2">送出後會依序經過：</div>${appStepper({ steps }, { compact: true })}`;
}

// ---------- 老師 / 行政人員：我的印章 ----------

async function openSealModal() {
    let seal;
    try { seal = await api('/api/seals/mine'); } catch (e) { toast(e.message, 'error'); return; }
    const preview = seal.image_url
        ? `<img src="${escapeHtml(seal.image_url)}?t=${Date.now()}" alt="我的印章" class="w-28 h-28 object-contain mx-auto">`
        : seal.svg;  // 伺服器產生，姓名已跳脫
    openModal('我的印章', `
        <div class="space-y-4 text-sm">
            <div class="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded border border-slate-200">
                ${preview}
                <div class="text-xs text-slate-600">${{ signature: '目前使用：你的手寫簽名', image: '目前使用：你上傳的印章圖' }[seal.kind] || `目前使用：系統依姓名刻的章（${escapeHtml(seal.name)}）`}</div>
                <button type="button" onclick="openPhoneSignModal()" class="text-xs font-bold border border-ukn-300 text-ukn-800 rounded px-3 py-1.5 hover:bg-ukn-50">📱 改用手機手寫簽名</button>
            </div>
            <p class="text-xs text-slate-600">在「線上申辦審核」按核准時，會在申請表上蓋這顆章，並自動送到下一關，不用再蓋實體章。換章後，之前蓋過的申請表仍保留當時的章。</p>
            <form id="sealForm" class="space-y-2">
                <label class="block text-xs font-semibold text-slate-700">換成自己的印章圖（PNG / JPG，${Math.round(seal.max_kb / 1024)} MB 以內，建議白底或去背）</label>
                <input type="file" name="seal" accept=".png,.jpg,.jpeg" required class="block w-full text-xs">
                <div class="flex flex-wrap gap-2">
                    <button type="submit" class="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded px-3 py-1.5">上傳印章圖</button>
                    ${seal.type === 'image' ? `<button type="button" onclick="resetMySeal()" class="text-xs border border-slate-300 rounded px-3 py-1.5">${seal.kind === 'signature' ? '不用簽名，' : ''}改回系統刻的章</button>` : ''}
                </div>
            </form>
        </div>`);
    document.getElementById('sealForm').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            toast((await api('/api/seals/mine', { method: 'POST', body: new FormData(e.target) })).message);
            openSealModal();
        } catch (ex) { toast(ex.message, 'error'); }
    });
}

// ---------- 手機簽名：顯示 QR code 與網址，手機簽完電腦自動更新 ----------

let signPollTimer = null;

async function openPhoneSignModal() {
    clearInterval(signPollTimer);
    let link;
    try { link = await api('/api/seals/sign-link', { method: 'POST' }); } catch (e) { toast(e.message, 'error'); return; }
    openModal('📱 用手機簽名', `
        <div class="space-y-3 text-sm text-center">
            <p class="text-slate-600">用手機相機掃描 QR code，或在手機上打開下面的網址，在螢幕上手寫簽名。簽好後，核准申請時就蓋這個簽名。</p>
            <img src="${escapeHtml(link.qr_url)}" alt="手機簽名 QR code" class="w-52 h-52 mx-auto border border-slate-200 rounded bg-white">
            <div class="flex items-center gap-2">
                <input id="signLinkUrl" readonly value="${escapeHtml(link.url)}" class="flex-1 min-w-0 text-xs font-mono border border-slate-300 rounded px-2 py-1.5 bg-slate-50" onclick="this.select()">
                <button type="button" onclick="navigator.clipboard?.writeText(document.getElementById('signLinkUrl').value).then(() => toast('已複製網址'))" class="shrink-0 text-xs border border-slate-300 rounded px-2.5 py-1.5 hover:border-ukn-500">複製</button>
            </div>
            <p id="signLinkStatus" class="text-xs text-ukn-800">⏳ 等待手機簽名…（${escapeHtml(link.expires_at)} 前有效，只能簽一次）</p>
            <p class="text-[11px] text-slate-400">手機要和這台電腦連同一個 Wi-Fi；網站上線後用正式網址就沒有這個限制。</p>
        </div>`);
    signPollTimer = setInterval(async () => {
        const statusEl = document.getElementById('signLinkStatus');
        if (!statusEl) { clearInterval(signPollTimer); return; }  // 視窗關掉了
        try {
            const s = await api(`/api/seals/sign-link/${encodeURIComponent(link.token)}/status`);
            if (s.signed) {
                clearInterval(signPollTimer);
                toast('手機簽名已儲存，之後核准都蓋這個簽名');
                openSealModal();
            } else if (s.expired) {
                clearInterval(signPollTimer);
                statusEl.innerHTML = `⌛ 連結已過期。<button type="button" onclick="openPhoneSignModal()" class="underline font-bold">重新產生</button>`;
                statusEl.className = 'text-xs text-amber-700';
            }
        } catch (e) { /* 網路短暫斷線，下次再問 */ }
    }, 2000);
}

async function resetMySeal() {
    try { toast((await api('/api/seals/mine', { method: 'DELETE' })).message); openSealModal(); } catch (e) { toast(e.message, 'error'); }
}
