// Smart UKN 新功能畫面 (校務申請、校園生活與社群)：獎助學金檢核、宿舍與總務、教室 / 櫃子租借、
// 校園地圖與老師辦公室、天氣交通、人流、科上通知。
// 依賴 campus-shell.js 與 campus-features.js 的共用函式 (api、toast、esc、statusBadge…)。

// =====================================================================
// 獎助學金資格自我檢核
// =====================================================================

let scholarshipData = [];

// 系統自動比對 (/api/scholarships/match)：獎助學金符合資格 Email 推播依這份結果判斷
async function loadScholarshipMatch() {
    const section = document.getElementById('scholarshipMatchSection');
    const body = document.getElementById('scholarshipMatchBody');
    if (!isLoggedIn() || !['學生', '家長'].includes(currentUser.role)) { section.classList.add('hidden'); return; }
    try {
        const r = await api('/api/scholarships/match');
        section.classList.remove('hidden');
        document.getElementById('scholarshipMatchParentNote').classList.toggle('hidden', currentUser.role !== '家長');

        const row = (s) => `
            <div class="rounded border ${s.is_urgent ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'} p-3 space-y-1.5">
                <div class="flex items-start justify-between gap-2">
                    <div class="font-bold text-slate-900 text-sm">${esc(s.name)}</div>
                    ${statusBadge(s.is_urgent ? `${mmdd(s.deadline)} 截止 (剩 ${s.days_left} 天)` : `${mmdd(s.deadline)} 截止`, s.is_urgent ? 'red' : 'amber')}
                </div>
                <div class="text-xs text-slate-500">${esc(s.provider || '')} ${s.amount ? '· ' + esc(s.amount) : ''}</div>
                ${s.missing && s.missing.length ? `<div class="text-xs text-slate-600">${s.missing.map(esc).join('、')}</div>` : ''}
                ${r.can_apply && s.apply_url ? `<a href="${esc(s.apply_url)}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs bg-ukn-800 hover:bg-ukn-900 text-white rounded px-3 py-1.5">前往申請 ↗</a>` : ''}
            </div>`;

        const section_html = (title, items, emptyText) => `
            <div>
                <div class="text-xs font-bold text-slate-500 mb-1.5">${esc(title)}（${items.length}）</div>
                ${items.length ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${items.map(row).join('')}</div>`
                    : `<div class="text-xs text-slate-400">${esc(emptyText)}</div>`}
            </div>`;

        body.innerHTML = section_html('✅ 符合資格', r.eligible, '目前沒有符合資格的項目') +
            section_html('🟡 差一點就符合', r.partial, '沒有部分符合的項目');
    } catch (e) {
        section.classList.add('hidden');
        console.error(e);
    }
}

async function loadScholarships() {
    const body = document.getElementById('scholarshipBody');
    try {
        const r = await api('/api/campus/scholarships');
        scholarshipData = r.data;
        const applyLink = (typeof studentLinksCache !== 'undefined' ? studentLinksCache : []).find(l => l.title.includes('獎助學金線上申請'));
        body.innerHTML = (r.auto?.avg != null ? `<div class="md:col-span-2 text-xs text-slate-600 bg-ukn-50 border border-ukn-100 rounded px-3 py-2">已依你的成績自動判斷部分條件（上學期平均 ${r.auto.avg} 分），其他請自己勾選。</div>` : '') +
            scholarshipData.map((s, si) => `
            <div class="rounded border ${s.expired ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white'} p-4 space-y-3" data-sch="${si}">
                <div class="flex items-start justify-between gap-2">
                    <div><div class="font-bold text-slate-900">${esc(s.name)}</div><div class="text-xs text-slate-500">${esc(s.office)} · ${esc(s.amount)}</div></div>
                    ${s.expired ? statusBadge('已截止', 'gray') : statusBadge(`${mmdd(s.deadline)} 截止`, 'amber')}
                </div>
                <div class="space-y-1.5">${s.criteria.map((c, ci) => `
                    <label class="flex items-start gap-2 text-sm cursor-pointer">
                        <input type="checkbox" data-crit="${ci}" onchange="updateScholarship(${si})" ${c.auto_value ? 'checked' : ''} class="mt-1 h-4 w-4">
                        <span>${esc(c.text)}${c.auto_value != null ? `<span class="text-[10px] ${c.auto_value ? 'text-emerald-700' : 'text-rose-700'} ml-1">（系統判斷：${c.auto_value ? '符合' : '不符合'}）</span>` : ''}</span>
                    </label>`).join('')}</div>
                <div data-sch-result class="text-sm font-semibold"></div>
                ${!s.expired && applyLink && applyLink.url !== '#' ? `<a href="${esc(applyLink.url)}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs bg-ukn-800 text-white rounded px-3 py-1.5">前往線上申請 ↗</a>` : ''}
            </div>`).join('') +
            '<p class="md:col-span-2 text-[11px] text-slate-400">獎助學金項目為示範資料，實際條件與金額以生輔組公告為準。</p>';
        scholarshipData.forEach((_, i) => updateScholarship(i));
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function updateScholarship(i) {
    const card = document.querySelector(`[data-sch="${i}"]`);
    const boxes = [...card.querySelectorAll('[data-crit]')];
    const miss = boxes.filter(b => !b.checked).length;
    const el = card.querySelector('[data-sch-result]');
    el.className = `text-sm font-semibold ${miss ? 'text-amber-800' : 'text-emerald-700'}`;
    el.textContent = miss ? `還有 ${miss} 項條件不符合或還沒確認` : '✓ 條件都符合，可以申請！';
}

// =====================================================================
// 宿舍床位申請與進度
// =====================================================================

async function loadDorm() {
    const body = document.getElementById('dormBody');
    if (!isLoggedIn()) { body.innerHTML = loginPrompt('登入學生帳號即可線上申請宿舍床位。'); return; }
    if (isStaff()) { loadDormAdmin(); return; }
    if (!['學生', '家長'].includes(currentUser.role)) { body.innerHTML = '<div class="text-sm text-slate-500">僅學生本人與家長可以查看。</div>'; return; }
    const isParent = currentUser.role === '家長';
    try {
        const apps = (await api('/api/campus/dorm/mine')).data;
        const active = apps.find(a => a.status !== '已取消');
        const applyForm = isParent ? '' : `
            <details ${active ? '' : 'open'} class="rounded border border-slate-200 bg-slate-50 p-4 mt-4">
                <summary class="cursor-pointer font-semibold text-sm text-slate-800">${active ? '申請其他學期' : '線上申請宿舍床位'}</summary>
                <form onsubmit="submitDorm(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-3">
                    <div><label class="block text-xs font-semibold text-slate-600 mb-1">申請學期</label><input name="semester" value="115-2" class="w-full border border-slate-300 rounded px-3 py-2"></div>
                    <div><label class="block text-xs font-semibold text-slate-600 mb-1">房型 *</label><select name="room_type" class="w-full border border-slate-300 rounded px-3 py-2 bg-white"><option>四人房</option><option>六人房</option><option>不限</option></select></div>
                    <div><label class="block text-xs font-semibold text-slate-600 mb-1">單程通勤時間（分鐘）*</label><input type="number" name="commute_minutes" min="1" required class="w-full border border-slate-300 rounded px-3 py-2"></div>
                    <div><label class="block text-xs font-semibold text-slate-600 mb-1">緊急聯絡人電話 *</label><input name="emergency_phone" required class="w-full border border-slate-300 rounded px-3 py-2"></div>
                    <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">特殊需求（身心障礙、低收入戶等優先資格）</label><textarea name="special_needs" rows="2" class="w-full border border-slate-300 rounded px-3 py-2"></textarea></div>
                    <div class="sm:col-span-2 text-right"><button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">送出申請</button></div>
                </form>
            </details>`;
        body.innerHTML = (active ? dormProgressHtml(active) : (isParent ? '<div class="text-sm text-slate-500">子女目前沒有進行中的宿舍申請。</div>' : '')) + applyForm;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function dormProgressHtml(a) {
    return `
        <div class="rounded border border-slate-200 p-4 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="font-bold text-slate-900">${esc(a.semester)} 學期 · ${esc(a.room_type)}</div>
                ${statusBadge(a.status, a.status === '未通過' ? 'red' : a.status === '已完成' ? 'green' : 'blue')}
            </div>
            <ol class="grid grid-cols-3 sm:grid-cols-6 gap-2">${a.stages.map((s, i) => `
                <li class="text-center space-y-1">
                    <div class="mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < a.stage || a.status === '已完成' ? 'bg-emerald-600 text-white' : i === a.stage && a.status === '進行中' ? 'bg-ukn-800 text-white ring-4 ring-ukn-100' : 'bg-slate-200 text-slate-500'}">${i < a.stage || a.status === '已完成' ? '✓' : i + 1}</div>
                    <div class="text-[11px] ${i === a.stage ? 'font-bold text-ukn-800' : 'text-slate-500'}">${esc(s)}</div>
                </li>`).join('')}</ol>
            <div class="text-sm bg-ukn-50 border border-ukn-100 rounded px-3 py-2">👉 ${esc(a.next_action)}${a.bed ? `（床位：${esc(a.bed)}）` : ''}</div>
            <details class="text-xs text-slate-500"><summary class="cursor-pointer">處理紀錄</summary>
                <ul class="mt-1 space-y-0.5">${a.history.map(h => `<li>${esc(h.at.slice(0, 16))} · ${esc(a.stages[h.stage])}${h.note ? ` · ${esc(h.note)}` : ''}</li>`).join('')}</ul></details>
        </div>`;
}

async function submitDorm(event) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    try { const r = await api('/api/campus/dorm/apply', { json: f }); toast(r.message); loadDorm(); }
    catch (e) { toast(e.message, 'error'); }
}

async function loadDormAdmin() {
    const body = document.getElementById('dormBody');
    try {
        const r = await api('/api/campus/dorm/applications');
        const canEdit = ['管理員', '教職員'].includes(currentUser.role);
        body.innerHTML = r.data.length ? `<div class="overflow-x-auto"><table class="w-full text-sm text-left">
            <thead><tr class="text-xs text-slate-500 bg-slate-50"><th class="p-2">學生</th><th class="p-2">學期 / 房型</th><th class="p-2">通勤</th><th class="p-2">目前進度</th><th class="p-2"></th></tr></thead>
            <tbody class="divide-y divide-slate-100">${r.data.map(a => `<tr>
                <td class="p-2">${esc(a.student_name)}<div class="text-[11px] text-slate-500">${esc(a.student_id)}</div></td>
                <td class="p-2">${esc(a.semester)} · ${esc(a.room_type)}</td><td class="p-2">${a.commute_minutes} 分</td>
                <td class="p-2">${statusBadge(a.status === '進行中' ? r.stages[a.stage] : a.status, a.status === '進行中' ? 'blue' : a.status === '已完成' ? 'green' : 'red')}</td>
                <td class="p-2 text-right whitespace-nowrap">${canEdit && a.status === '進行中' ? `<button type="button" onclick="advanceDorm(${a.id})" class="text-xs bg-ukn-800 text-white rounded px-2 py-1">推進到下一步</button>
                    <button type="button" onclick="advanceDorm(${a.id}, true)" class="text-xs border border-rose-300 text-rose-700 rounded px-2 py-1">不通過</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`
            : '<div class="text-sm text-slate-500">目前沒有宿舍申請。</div>';
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

async function advanceDorm(id, reject = false) {
    const note = prompt(reject ? '不通過原因：' : '備註（選填，分配床位時可填床號，例如：床號 S305-2）：') ?? null;
    if (note === null) return;
    const bed = /床號\s*(\S+)/.exec(note)?.[1] || '';
    try { await api(`/api/campus/dorm/applications/${id}`, { json: { action: reject ? 'reject' : 'advance', note, bed } }); loadDormAdmin(); }
    catch (e) { toast(e.message, 'error'); }
}

// =====================================================================
// 總務處：報帳與成果報告
// =====================================================================

let affairsData = null;

async function loadAffairs() {
    const body = document.getElementById('affairsBody');
    if (currentUser.role !== '學生') { body.innerHTML = isLoggedIn() ? '<div class="text-sm text-slate-500">此功能提供負責社團或計畫經費的學生使用。</div>' : loginPrompt('登入學生帳號即可線上繳交報帳與成果報告。'); return; }
    try {
        affairsData = await api('/api/campus/affairs/mine');
        if (!affairsData.projects.length) { body.innerHTML = '<div class="text-sm text-slate-500">你目前沒有負責的社團活動或計畫經費。</div>'; return; }
        body.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${affairsData.projects.map(p => `
                <div class="rounded border border-slate-200 p-4 space-y-2">
                    <div class="font-bold text-slate-900">${esc(p.name)}</div>
                    <div class="flex flex-wrap gap-2">
                        ${statusBadge(p.days_left < 0 ? '報帳已截止' : `報帳截止 ${mmdd(p.reimburse_deadline)}（剩 ${p.days_left} 天）`, p.days_left < 0 ? 'gray' : p.days_left <= 14 ? 'red' : 'blue')}
                        ${statusBadge(`成果報告 ${p.reports_submitted} / ${p.reports_required} 次`, p.reports_met ? 'green' : 'amber')}
                    </div>
                    <div class="text-xs text-slate-600">已報帳 ${p.spent.toLocaleString()} / 核定 ${p.budget.toLocaleString()} 元</div>
                    <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full ${p.spent > p.budget ? 'bg-rose-600' : 'bg-ukn-600'}" style="width:${Math.min(100, p.spent / p.budget * 100)}%"></div></div>
                    ${p.submissions.length ? `<ul class="text-xs text-slate-600 space-y-0.5 pt-1">${p.submissions.map(s => `<li>${esc(s.created_at.slice(0, 10))} · ${esc(s.kind)} · ${esc(s.status)}</li>`).join('')}</ul>` : ''}
                </div>`).join('')}</div>
            <form id="affairsForm" onsubmit="submitAffairs(event)" class="rounded border border-slate-200 bg-slate-50 p-4 space-y-3 mt-4 text-sm">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label class="block text-xs font-semibold text-slate-600 mb-1">計畫 / 活動</label><select name="project_id" class="w-full border border-slate-300 rounded px-3 py-2 bg-white">${affairsData.projects.map(p => `<option value="${p.project_id}">${esc(p.name)}</option>`).join('')}</select></div>
                    <div><label class="block text-xs font-semibold text-slate-600 mb-1">要繳交</label><select name="kind" onchange="renderAffairsFields(this.value)" class="w-full border border-slate-300 rounded px-3 py-2 bg-white"><option>報帳</option><option>成果報告</option></select></div>
                </div>
                <div id="affairsFields" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
                <div id="affairsCheck"></div>
                <div class="flex flex-wrap justify-end gap-2">
                    <button type="button" onclick="checkAffairs()" class="border border-ukn-300 text-ukn-800 rounded px-4 py-2 font-semibold hover:bg-ukn-50">先幫我檢查有沒有漏填</button>
                    <button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">線上送出</button>
                </div>
            </form>`;
        renderAffairsFields('報帳');
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function renderAffairsFields(kind) {
    const types = { amount: 'number', invoice_count: 'number', participants: 'number', invoice_date: 'date', held_date: 'date' };
    document.getElementById('affairsFields').innerHTML = affairsData.fields[kind].map(f => f.key === 'attachments'
        ? `<div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">${esc(f.label)}</label><input type="file" name="files" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" class="text-sm"></div>`
        : f.key === 'summary'
            ? `<div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">${esc(f.label)}</label><textarea name="${f.key}" rows="3" class="w-full border border-slate-300 rounded px-3 py-2"></textarea></div>`
            : `<div><label class="block text-xs font-semibold text-slate-600 mb-1">${esc(f.label)}</label><input type="${types[f.key] || 'text'}" name="${f.key}" class="w-full border border-slate-300 rounded px-3 py-2"></div>`).join('');
    document.getElementById('affairsCheck').innerHTML = '';
}

async function checkAffairs() {
    const form = document.getElementById('affairsForm');
    const fd = new FormData(form);
    const fields = {};
    for (const [k, v] of fd.entries()) if (k !== 'files' && k !== 'kind' && k !== 'project_id') fields[k] = v;
    fields.attachments = fd.getAll('files').filter(f => f && f.name).length;
    try {
        const r = await api('/api/campus/affairs/check', { json: { kind: fd.get('kind'), project_id: fd.get('project_id'), fields } });
        document.getElementById('affairsCheck').innerHTML = `
            ${r.complete ? '<div class="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">✓ 資料都填齊了，可以送出</div>'
                : `<div class="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded px-3 py-2">還沒填：${r.missing.map(esc).join('、')}</div>`}
            ${r.warnings.map(w => `<div class="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-2">! ${esc(w)}</div>`).join('')}`;
    } catch (e) { toast(e.message, 'error'); }
}

async function submitAffairs(event) {
    event.preventDefault();
    try {
        const res = await fetch('/api/campus/affairs/submit', { method: 'POST', body: new FormData(event.target) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast(data.message);
        loadAffairs();
    } catch (e) { toast(e.message, 'error'); checkAffairs(); }
}

// =====================================================================
// 教室租借
// =====================================================================

let roomsData = null;
const SLOT_STYLE = {
    free: 'bg-white hover:bg-emerald-50 text-emerald-700 cursor-pointer', class: 'bg-slate-100 text-slate-500',
    booked: 'bg-rose-50 text-rose-700', pending: 'bg-amber-50 text-amber-800', closed: 'bg-slate-100 text-slate-400',
};

async function loadRooms() {
    const body = document.getElementById('roomsBody');
    try {
        roomsData = await api(`/api/campus/rooms?date=${document.getElementById('roomDate').value}`);
        const periods = Object.keys(roomsData.periods);
        body.innerHTML = `
            <div class="flex flex-wrap gap-3 text-[11px] text-slate-600">
                <span><span class="inline-block w-3 h-3 border border-slate-300 bg-white align-middle mr-1"></span>空的（點一下就能借）</span>
                <span><span class="inline-block w-3 h-3 bg-slate-200 align-middle mr-1"></span>有課</span>
                <span><span class="inline-block w-3 h-3 bg-amber-100 align-middle mr-1"></span>審核中</span>
                <span><span class="inline-block w-3 h-3 bg-rose-100 align-middle mr-1"></span>已借出</span>
            </div>
            <div class="overflow-x-auto border border-slate-200 rounded">
                <table class="w-full min-w-[760px] table-fixed text-xs border-collapse">
                    <thead><tr class="bg-slate-50 text-slate-500"><th class="text-left p-2 w-44">教室</th>${periods.map(p => `<th class="p-1 font-semibold">第${p}節<div class="font-normal text-[10px]">${roomsData.periods[p][0]}</div></th>`).join('')}</tr></thead>
                    <tbody>${roomsData.data.map(r => `<tr class="border-t border-slate-100">
                        <td class="p-2 align-top"><div class="font-semibold text-slate-900">${esc(r.name)}</div>
                            <div class="text-[10px] text-slate-500">${r.capacity} 人 · ${r.equipment.map(esc).join('、')}</div>
                            <div class="text-[10px] ${r.rentable ? 'text-slate-500' : 'text-amber-700'}">${r.rentable ? `管理：${esc(r.managed_by)}` : `不開放線上借用，洽 ${esc(r.managed_by)}（${esc(r.apply_at)}）`}</div></td>
                        ${periods.map(p => {
                            const s = r.slots[p];
                            const clickable = s.state === 'free' && r.rentable;
                            return `<td class="border-l border-slate-100 p-0.5 text-center"><button type="button" ${clickable ? `onclick="openBookRoom('${esc(r.room_id)}', ${p})"` : 'disabled'}
                                class="w-full h-11 rounded-sm text-[10px] leading-tight px-0.5 ${SLOT_STYLE[s.state]} ${!r.rentable && s.state === 'free' ? 'cursor-not-allowed opacity-60' : ''}" title="${esc(s.label || '')}">${s.state === 'free' ? (r.rentable ? '＋' : '') : esc((s.label || (s.state === 'closed' ? '週末' : '')).slice(0, 8))}</button></td>`;
                        }).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>`;
        loadMyBookings();
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function openBookRoom(roomId, period) {
    if (!isLoggedIn()) { openModal('借用教室', loginPrompt('登入後就能線上借用教室。')); return; }
    const r = roomsData.data.find(x => x.room_id === roomId);
    const periods = Object.keys(roomsData.periods).map(Number).filter(p => p >= period);
    let maxEnd = period;
    for (const p of periods) { if (r.slots[p].state === 'free') maxEnd = p; else break; }
    openModal(`借用 ${r.name}`, `
        <form onsubmit="submitBookRoom(event, '${esc(roomId)}')" class="space-y-3">
            <div class="text-slate-600">${esc(roomsData.date)}（週${WEEKDAY_TEXT[roomsData.weekday]}）· 容量 ${r.capacity} 人 · 審核單位：${esc(r.managed_by)}</div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">從</label><select name="period_start" class="w-full border border-slate-300 rounded px-2 py-2"><option value="${period}">第 ${period} 節 ${roomsData.periods[period][0]}</option></select></div>
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">到</label><select name="period_end" class="w-full border border-slate-300 rounded px-2 py-2">${periods.filter(p => p <= maxEnd).map(p => `<option value="${p}">第 ${p} 節 ${roomsData.periods[p][1]}</option>`).join('')}</select></div>
            </div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">用途 *</label><input name="purpose" required maxlength="80" placeholder="例如：專題小組討論" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">人數</label><input type="number" name="people" min="1" max="${r.capacity}" value="5" class="w-full border border-slate-300 rounded px-3 py-2"></div>
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">聯絡電話</label><input name="contact" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            </div>
            <p class="text-[11px] text-slate-500">送出後由${esc(r.managed_by)}審核；也可以到 ${esc(r.apply_at)} 詢問。</p>
            <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2">送出借用申請</button>
        </form>`);
}

async function submitBookRoom(event, roomId) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    try {
        const r = await api('/api/campus/rooms/book', { json: { ...f, room_id: roomId, date: roomsData.date } });
        closeModal(); toast(r.message); loadRooms();
    } catch (e) { toast(e.message, 'error'); }
}

async function loadMyBookings() {
    const box = document.getElementById('myBookingsBody');
    if (!isLoggedIn()) { box.innerHTML = ''; return; }
    const admin = ['管理員', '教職員'].includes(currentUser.role);
    try {
        const items = (await api(`/api/campus/rooms/bookings${admin ? '?scope=all' : ''}`)).data;
        const tone = { '審核中': 'amber', '已核准': 'green', '未核准': 'red', '已取消': 'gray' };
        box.innerHTML = `<h3 class="font-bold text-slate-900 mb-2 mt-2">${admin ? '所有借用申請' : '我的借用申請'}</h3>` + (items.length ? `<div class="space-y-2">${items.map(b => `
            <div class="rounded border border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div><span class="font-semibold">${esc(b.room_name)}</span> · ${esc(b.date)} 第 ${b.period_start}${b.period_end !== b.period_start ? `-${b.period_end}` : ''} 節 · ${esc(b.purpose)}
                    <div class="text-[11px] text-slate-500">${admin ? `申請人：${esc(b.applicant)} · ` : ''}審核：${esc(b.managed_by)}${b.review_note ? ` · ${esc(b.review_note)}` : ''}</div></div>
                <div class="flex items-center gap-2">${statusBadge(b.status, tone[b.status])}
                    ${b.status === '審核中' && admin ? `<button type="button" onclick="updateBooking(${b.id}, 'approve')" class="text-xs bg-emerald-700 text-white rounded px-2 py-1">核准</button><button type="button" onclick="updateBooking(${b.id}, 'reject')" class="text-xs border border-rose-300 text-rose-700 rounded px-2 py-1">不核准</button>` : ''}
                    ${b.status === '審核中' && !admin ? `<button type="button" onclick="updateBooking(${b.id}, 'cancel')" class="text-xs border border-slate-300 rounded px-2 py-1">取消</button>` : ''}</div>
            </div>`).join('')}</div>` : '<div class="text-xs text-slate-500">還沒有借用紀錄。</div>');
    } catch (e) { box.innerHTML = ''; }
}

async function updateBooking(id, action) {
    try { await api(`/api/campus/rooms/bookings/${id}`, { json: { action } }); loadRooms(); }
    catch (e) { toast(e.message, 'error'); }
}

// =====================================================================
// 櫃子租借
// =====================================================================

async function loadLockers() {
    const body = document.getElementById('lockersBody');
    try {
        const r = await api('/api/campus/lockers');
        const colors = { '可租借': 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 cursor-pointer', '保留中': 'bg-amber-100 border-amber-300 text-amber-800',
            '已租用': 'bg-slate-200 border-slate-300 text-slate-400', '我的': 'bg-ukn-800 border-ukn-800 text-white font-bold' };
        body.innerHTML = (r.mine ? `
            <div class="rounded border border-ukn-200 bg-ukn-50 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2">
                <div>🔑 我的櫃子：<strong>${esc(r.mine.locker_id)}</strong>（${esc(r.mine.area)}）· ${esc(r.mine.status)}
                    ${r.mine.status === '保留中' ? `<div class="text-xs text-slate-600 mt-0.5">請在 <strong>${esc(r.mine.pay_deadline)}</strong> 前到${esc(r.mine.pay_at)}繳費 ${r.mine.fee} 元，逾期會自動釋出。</div>` : ''}</div>
                ${r.mine.status === '保留中' ? `<button type="button" onclick="cancelLocker('${esc(r.mine.locker_id)}')" class="text-xs border border-slate-300 bg-white rounded px-2 py-1">取消保留</button>` : ''}
            </div>` : '') + `
            <div class="flex flex-wrap gap-3 text-[11px] text-slate-600 my-3">
                <span><span class="inline-block w-3 h-3 border border-emerald-300 bg-white align-middle mr-1"></span>可租借</span>
                <span><span class="inline-block w-3 h-3 bg-amber-100 align-middle mr-1"></span>保留中（待繳費）</span>
                <span><span class="inline-block w-3 h-3 bg-slate-200 align-middle mr-1"></span>已租用</span>
                <span><span class="inline-block w-3 h-3 bg-ukn-800 align-middle mr-1"></span>我的</span>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">${r.areas.map(a => `
                <div>
                    <div class="flex items-center justify-between text-sm mb-2"><span class="font-bold text-slate-900">${esc(a.area)}</span><span class="text-xs text-slate-500">剩 ${a.free} 格 · 每學期 ${a.fee} 元</span></div>
                    <div class="grid gap-1" style="grid-template-columns: repeat(${a.cols}, minmax(0, 1fr))">
                        ${a.cells.map(c => `<button type="button" ${c.status === '可租借' ? `onclick="reserveLocker('${esc(c.locker_id)}', ${a.fee})"` : 'disabled'}
                            class="aspect-square rounded-sm border text-[9px] sm:text-[10px] ${colors[c.status]}" title="${esc(c.locker_id)} ${esc(c.status)}">${esc(c.locker_id.slice(1))}</button>`).join('')}
                    </div>
                </div>`).join('')}</div>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

async function reserveLocker(id, fee) {
    if (currentUser.role !== '學生') { openModal('租借櫃子', loginPrompt('請用學生帳號登入後再選格子。')); return; }
    if (!confirm(`要保留 ${id} 嗎？保留後請在期限內到現場繳費 ${fee} 元。`)) return;
    try { const r = await api(`/api/campus/lockers/${id}/reserve`, { method: 'POST' }); toast(r.message); loadLockers(); }
    catch (e) { toast(e.message, 'error'); loadLockers(); }
}

async function cancelLocker(id) {
    if (!confirm('確定取消保留？格子會釋出給其他同學。')) return;
    try { await api(`/api/campus/lockers/${id}/cancel`, { method: 'POST' }); toast('已取消保留'); loadLockers(); }
    catch (e) { toast(e.message, 'error'); }
}

// =====================================================================
// 校園地圖、老師辦公室
// =====================================================================

let mapData = null, mapHighlight = null;

async function loadMap() {
    if (mapData) { renderMap(); return; }
    try { mapData = await api('/api/campus/map'); renderMap(); }
    catch (e) { document.getElementById('mapBody').innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function renderMap(infoHtml) {
    const b = mapData.buildings;
    document.getElementById('mapBody').innerHTML = `
        <div class="lg:col-span-2">
            <svg viewBox="0 0 100 72" class="w-full h-auto rounded border border-slate-200 bg-emerald-50/40" role="img" aria-label="康寧大學校園示意地圖">
                <rect x="0" y="64" width="100" height="8" fill="#e2e8f0"/><text x="3" y="69.5" font-size="2.4" fill="#64748b">康寧路三段75巷</text>
                <path d="M50 64 L50 60" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="1 1"/>
                ${b.map(x => {
                    const on = mapHighlight === x.code;
                    return `<g role="button" tabindex="0" onclick="selectBuilding('${x.code}')" onkeydown="if(event.key==='Enter')selectBuilding('${x.code}')" style="cursor:pointer">
                        <rect x="${x.x}" y="${x.y}" width="${x.w}" height="${x.h}" rx="1.2" fill="${on ? '#ff5511' : '#003c9d'}" fill-opacity="${on ? 0.9 : 0.14}" stroke="${on ? '#c2410c' : '#003c9d'}" stroke-width="${on ? 0.6 : 0.3}"/>
                        <text x="${x.x + x.w / 2}" y="${x.y + x.h / 2 - 0.5}" text-anchor="middle" font-size="2.8" font-weight="700" fill="${on ? '#fff' : '#00295f'}">${esc(x.name)}</text>
                        <text x="${x.x + x.w / 2}" y="${x.y + x.h / 2 + 3}" text-anchor="middle" font-size="2.2" fill="${on ? '#fff' : '#475569'}">${x.code} 棟 · ${x.floors}F</text>
                        ${on ? `<text x="${x.x + x.w / 2}" y="${x.y - 1}" text-anchor="middle" font-size="4">📍</text>` : ''}
                    </g>`;
                }).join('')}
                <circle cx="${mapData.gate.x}" cy="${mapData.gate.y - 5}" r="1.5" fill="#ff5511"/><text x="${mapData.gate.x + 2.5}" y="${mapData.gate.y - 4.3}" font-size="2.3" fill="#9a3412">校門口</text>
            </svg>
            <p class="text-[11px] text-slate-400 mt-1">校園配置示意圖（非實際比例），點建築物可查看裡面有什麼。</p>
        </div>
        <div id="mapInfo" class="space-y-3">${infoHtml || `<div class="text-sm text-slate-500">點地圖上的建築物，或在上方搜尋教室代碼、處室、老師。</div>
            <div class="text-xs text-slate-600 space-y-1"><div class="font-bold">教室代碼怎麼看？</div><div>第一個字母是大樓，第一個數字是樓層：A402 = 康寧樓 (A) 4 樓。</div></div>`}</div>`;
}

function selectBuilding(code) {
    mapHighlight = code;
    const x = mapData.buildings.find(b => b.code === code);
    const rooms = mapData.rooms.filter(r => r.building === code);
    const offices = mapData.offices.filter(o => o.building === code);
    const teachers = mapData.teachers.filter(t => t.building === code);
    renderMap(`
        <div class="rounded border border-accent-500/40 bg-accent-50 p-3"><div class="font-bold text-slate-900">${esc(x.name)}（${x.code} 棟，${x.floors} 層）</div><div class="text-xs text-slate-600 mt-1">${esc(x.desc)}</div></div>
        ${offices.length ? `<div><div class="text-xs font-bold text-slate-600 mb-1">處室</div>${offices.map(o => `<div class="text-sm">${esc(o.name)}<span class="text-xs text-slate-500"> · ${esc(o.location)} · ${esc(o.phone)}</span></div>`).join('')}</div>` : ''}
        ${rooms.length ? `<div><div class="text-xs font-bold text-slate-600 mb-1">教室</div>${rooms.map(r => `<div class="text-sm">${esc(r.name)}<span class="text-xs text-slate-500"> · ${r.floor}F</span></div>`).join('')}</div>` : ''}
        ${teachers.length ? `<div><div class="text-xs font-bold text-slate-600 mb-1">老師研究室</div>${teachers.map(t => `<div class="text-sm">${esc(t.name)} 老師<span class="text-xs text-slate-500"> · ${esc(t.office)}</span></div>`).join('')}</div>` : ''}`);
}

async function findOnMap(text) {
    const q = (text ?? document.getElementById('mapSearch').value).trim();
    if (!q) return;
    if (!mapData) await loadMap();
    try {
        const results = (await api(`/api/campus/map/find?q=${encodeURIComponent(q)}`)).data;
        if (!results.length) { renderMap(`<div class="text-sm text-slate-500">找不到「${esc(q)}」，試試教室代碼（例如 A402）或處室名稱。</div>`); mapHighlight = null; return; }
        mapHighlight = results[0].building;
        renderMap(`<div class="text-xs font-bold text-slate-600">搜尋「${esc(q)}」</div>` + results.map(r => `
            <button type="button" onclick="selectBuilding('${esc(r.building)}')" class="w-full text-left rounded border border-slate-200 px-3 py-2 hover:border-ukn-400">
                <div class="text-sm font-semibold text-slate-900">${esc(r.name)} <span class="text-[10px] text-slate-500 border border-slate-200 rounded px-1">${esc(r.type)}</span></div>
                <div class="text-xs text-slate-600">📍 ${esc(r.where)}</div></button>`).join(''));
    } catch (e) { toast(e.message, 'error'); }
}

// 其他頁面「在地圖上看」：傳入辦公室位置文字，例如「康寧樓 2 樓 A201 (課務組)」
async function showOnMap(locationText) {
    closeModal();
    switchTab('tab-map');
    if (!mapData) await loadMap();
    const b = mapData.buildings.find(x => String(locationText).includes(x.name));
    const code = /([A-Z])\d{3}/.exec(locationText)?.[1];
    document.getElementById('mapSearch').value = locationText;
    if (b) selectBuilding(b.code); else if (code) findOnMap(code + '1'); else findOnMap(locationText);
}

const TEACHER_TONE = { '上課中': 'red', '晤談時間': 'green', '沒有課': 'blue', '非上班時間': 'gray' };

async function loadTeachers() {
    const body = document.getElementById('teachersBody');
    try {
        const r = await api('/api/campus/teachers');
        body.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                <input type="search" placeholder="搜尋老師或科系" oninput="filterTeachers(this.value)" class="border border-slate-300 rounded px-3 py-2 text-sm w-full sm:w-64">
                <span class="text-xs text-slate-500">狀態依課表推算 · ${esc(r.now.slice(5).replace('-', '/'))} 更新 <button type="button" onclick="loadTeachers()" class="text-ukn-700 hover:underline ml-1">重新整理</button></span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">${r.data.map(t => `
                <div class="rounded border border-slate-200 p-4 space-y-2" data-teacher="${esc(t.name + t.dept)}">
                    <div class="flex items-start justify-between gap-2">
                        <div><div class="font-bold text-slate-900">${esc(t.name)} 老師</div><div class="text-xs text-slate-500">${esc(t.dept)} · ${esc(t.title)}</div></div>
                        ${statusBadge(t.status.state, TEACHER_TONE[t.status.state])}
                    </div>
                    <div class="text-xs text-slate-700">${esc(t.status.detail)}</div>
                    <div class="text-xs text-slate-600">🚪 ${esc(t.building_name)} ${esc(t.office)} · ${esc(t.ext)}</div>
                    <div class="text-xs text-slate-600">🕒 晤談時間：${t.office_hours.map(o => `週${WEEKDAY_TEXT[o.weekday]} ${o.start}–${o.end}`).join('、')}</div>
                    <div class="flex gap-2 pt-1">
                        <button type="button" onclick="showTeacherTimetable('${esc(t.name)}')" class="text-xs border border-slate-300 rounded px-2 py-1 hover:border-ukn-500">看課表</button>
                        <button type="button" onclick="showOnMap('${esc(t.building_name)} ${esc(t.office)}')" class="text-xs border border-slate-300 rounded px-2 py-1 hover:border-ukn-500">在地圖上看 🗺️</button>
                    </div>
                </div>`).join('')}</div>
            <p class="text-[11px] text-slate-400 mt-3">老師辦公室、分機與晤談時間為示範資料，請依各科公告更新。</p>`;
        window._teachers = r;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function filterTeachers(q) {
    document.querySelectorAll('[data-teacher]').forEach(el => el.classList.toggle('hidden', !!q && !el.dataset.teacher.includes(q.trim())));
}

function showTeacherTimetable(name) {
    const t = window._teachers.data.find(x => x.name === name);
    const periods = window._teachers.periods;
    const cell = (wd, p) => {
        const c = t.timetable.find(s => s.weekday === wd && s.period_start <= p && s.period_end >= p);
        const oh = t.office_hours.find(o => o.weekday === wd && o.start <= periods[p][0] && o.end >= periods[p][1]);
        return c ? `<td class="border border-slate-100 bg-ukn-100 text-ukn-900 text-[10px] leading-tight p-0.5">${esc(c.course_name)}<div class="text-slate-500">${esc(c.classroom)}</div></td>`
            : oh ? '<td class="border border-slate-100 bg-emerald-50 text-emerald-700 text-[10px]">晤談</td>' : '<td class="border border-slate-100"></td>';
    };
    openModal(`${t.name} 老師的課表`, `
        <div class="overflow-x-auto"><table class="w-full min-w-[420px] table-fixed text-center text-xs border-collapse">
            <thead><tr class="text-slate-500"><th></th>${[1, 2, 3, 4, 5].map(d => `<th class="py-1">週${WEEKDAY_TEXT[d]}</th>`).join('')}</tr></thead>
            <tbody>${Object.keys(periods).map(p => `<tr><td class="text-[10px] text-slate-400 w-12">${p}<div>${periods[p][0]}</div></td>${[1, 2, 3, 4, 5].map(d => cell(d, Number(p))).join('')}</tr>`).join('')}</tbody>
        </table></div>
        <p class="text-xs text-slate-500">藍色是上課時段，綠色是晤談時間，空白代表沒有排課（可能在辦公室 ${esc(t.office)}）。</p>`);
}

// =====================================================================
// 天氣與交通、人流
// =====================================================================

async function loadWeatherDetail() {
    const body = document.getElementById('weatherBody');
    try {
        const w = weatherCache || (await api('/api/campus/weather')).data;
        const c = w.current;
        body.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="rounded bg-gradient-to-br from-ukn-800 to-ukn-600 text-white p-5 space-y-2">
                    <div class="text-xs opacity-80">${esc(w.location)} · ${esc(w.updated_at.slice(5).replace('-', '/'))}</div>
                    <div class="flex items-center gap-3"><span class="text-6xl">${c.icon}</span><div><div class="text-5xl font-bold">${Math.round(c.temp)}°</div><div>${esc(c.text)}</div></div></div>
                    <div class="text-xs opacity-90 grid grid-cols-3 gap-1"><span>體感 ${Math.round(c.feels_like)}°</span><span>濕度 ${c.humidity}%</span><span>風速 ${Math.round(c.wind)} km/h</span></div>
                    <div class="text-xs bg-white/15 rounded px-2 py-1.5">💡 ${esc(w.advice)}</div>
                </div>
                <div class="lg:col-span-2 space-y-4">
                    <div><div class="text-xs font-bold text-slate-600 mb-2">接下來 12 小時</div>
                        <div class="grid grid-cols-6 gap-2">${w.hourly.map(h => `<div class="rounded border border-slate-200 text-center py-2"><div class="text-[11px] text-slate-500">${esc(h.time)}</div><div class="text-xl">${h.icon}</div><div class="text-sm font-bold">${Math.round(h.temp)}°</div><div class="text-[10px] text-ukn-700">☔ ${h.rain_prob ?? '-'}%</div></div>`).join('')}</div></div>
                    <div><div class="text-xs font-bold text-slate-600 mb-2">未來 3 天</div>
                        <div class="grid grid-cols-3 gap-2">${w.daily.map((d, i) => `<div class="rounded border border-slate-200 p-3 text-center"><div class="text-xs text-slate-500">${i === 0 ? '今天' : i === 1 ? '明天' : mmdd(d.date)}</div><div class="text-2xl">${d.icon}</div><div class="text-xs">${esc(d.text)}</div><div class="text-sm font-bold">${Math.round(d.min)}–${Math.round(d.max)}°</div><div class="text-[11px] text-ukn-700">降雨 ${d.rain_prob ?? '-'}%</div></div>`).join('')}</div></div>
                </div>
            </div>
            ${w.cwa ? `<div class="mt-4 text-xs text-slate-600"><div class="font-bold mb-1">中央氣象署 臺北市 36 小時預報</div>${w.cwa.periods.map(p => `<div>${esc(p.start.slice(5, 16))}–${esc(p.end.slice(11, 16))}：${esc(p.text)}，${p.min}–${p.max}°C，降雨 ${p.rain_prob}%，${esc(p.comfort)}</div>`).join('')}</div>` : ''}
            <p class="text-[11px] text-slate-400 mt-3">資料來源：${esc(w.source)}${w.cwa ? '、中央氣象署' : ''}</p>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

async function loadTransport() {
    const body = document.getElementById('transportBody');
    try {
        const r = await api('/api/campus/transport');
        body.innerHTML = `
            <div class="text-sm text-slate-700">📍 ${esc(r.address)}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">${r.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" class="rounded border border-slate-200 px-3 py-2.5 text-sm hover:border-ukn-400 hover:bg-ukn-50 flex justify-between"><span>${esc(l.title)}</span><span class="text-ukn-600">↗</span></a>`).join('')}</div>
            <div class="mt-4">${r.bus ? `
                <div class="text-xs font-bold text-slate-600 mb-2">學校附近公車站即時到站</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${r.bus.map(s => `
                    <div class="rounded border border-slate-200 p-3"><div class="font-semibold text-sm">🚏 ${esc(s.stop)}</div>
                        <ul class="mt-1 space-y-0.5 text-xs">${s.arrivals.length ? s.arrivals.map(a => `<li class="flex justify-between"><span>${esc(a.route)}</span><span class="${a.minutes != null && a.minutes <= 3 ? 'text-rose-700 font-bold' : 'text-slate-600'}">${a.minutes != null ? (a.minutes <= 1 ? '即將進站' : `${a.minutes} 分`) : esc(a.status || '—')}</span></li>`).join('') : `<li class="text-slate-500">行經：${s.routes.map(esc).join('、')}</li>`}</ul></div>`).join('')}</div>`
                : `<div class="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded px-3 py-2">${r.bus_configured ? `公車即時資訊暫時無法取得${r.bus_error ? `（${esc(r.bus_error)}）` : ''}。` : '尚未設定交通部 TDX 帳號，暫時只提供路線查詢連結。管理員申請 TDX 帳號後，設定環境變數 TDX_CLIENT_ID / TDX_CLIENT_SECRET 即可顯示學校附近公車站的即時到站時間。'}</div>`}</div>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

async function loadCrowd() {
    const body = document.getElementById('crowdBody');
    try {
        const r = await api('/api/campus/crowd');
        const hourNow = Number(r.now.slice(11, 13));
        body.innerHTML = r.data.map(p => {
            const level = p.current >= 70 ? ['人很多', 'red'] : p.current >= 40 ? ['普通', 'amber'] : ['人少', 'green'];
            return `
            <div class="rounded border border-slate-200 p-4 space-y-3">
                <div class="flex items-center justify-between"><span class="font-bold text-slate-900">${esc(p.place)}</span>${hourNow >= 8 && hourNow < 20 ? statusBadge(`現在：${level[0]}`, level[1]) : statusBadge('非開放時段', 'gray')}</div>
                <div class="flex items-end gap-1 h-28" role="img" aria-label="${esc(p.place)} 各時段人潮">
                    ${p.levels.map((l, i) => `<div class="flex-1 flex flex-col items-center justify-end h-full" title="${p.hours[i]}:00 人潮指數 ${l}">
                        <div class="w-full rounded-t-sm ${p.hours[i] === hourNow ? 'bg-accent-500' : p.hours[i] === p.best_hour ? 'bg-emerald-500' : 'bg-ukn-300'}" style="height:${Math.max(4, l)}%"></div>
                        <div class="text-[9px] text-slate-500 mt-0.5">${p.hours[i]}</div></div>`).join('')}
                </div>
                <div class="flex flex-wrap gap-3 text-[10px] text-slate-500"><span><span class="inline-block w-2 h-2 bg-accent-500 mr-1"></span>現在</span><span><span class="inline-block w-2 h-2 bg-emerald-500 mr-1"></span>接下來最空</span></div>
                <div class="text-xs text-slate-700">💡 ${esc(p.tip)}${p.best_hour != null ? `；今天接下來 ${p.best_hour}:00 左右最空` : ''}</div>
            </div>`;
        }).join('') + `<p class="md:col-span-2 text-[11px] text-slate-400">${r.simulated ? '目前為依課表推算的模擬數據；接上門禁刷卡、Wi-Fi 連線數或學餐交易資料後即可顯示實際人流。' : ''}</p>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

// =====================================================================
// 科上通知
// =====================================================================

let noticeClasses = [];

function noticeListHtml(inbox, readonly) {
    return `
        <h3 class="font-bold text-slate-900">${readonly ? '子女收到的通知' : '收到的通知'} ${inbox.unread_count ? `<span class="text-xs text-accent-500">(${inbox.unread_count} 則未讀)</span>` : ''}</h3>
        ${inbox.data.length ? inbox.data.map(n => `
            <details class="rounded border ${n.is_read ? 'border-slate-200' : 'border-accent-500/50 bg-accent-50/40'}" ${readonly ? '' : `ontoggle="if(this.open) readNotice(${n.id}, this)"`}>
                <summary class="cursor-pointer list-none px-4 py-3">
                    <div class="flex items-center gap-2 flex-wrap">${n.is_read ? '' : '<span data-dot class="w-2 h-2 rounded-full bg-accent-500"></span>'}
                        ${n.priority !== '一般' ? statusBadge(n.priority, n.priority === '緊急' ? 'red' : 'amber') : ''}
                        <span class="font-semibold text-slate-900">${esc(n.title)}</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">${esc(n.class_name)} · ${esc(n.sender)} · ${esc(n.created_at.slice(5, 16).replace('-', '/'))}${n.whole_class ? '' : ' · 個別通知'}${n.due_date ? ` · 期限 ${mmdd(n.due_date)}` : ''}</div>
                </summary>
                <div class="px-4 pb-4 text-sm text-slate-700 whitespace-pre-line">${esc(n.content)}</div>
            </details>`).join('') : '<div class="text-sm text-slate-500">目前沒有通知。</div>'}`;
}

async function loadNotices() {
    const body = document.getElementById('noticesBody');
    if (!isLoggedIn()) { body.innerHTML = loginPrompt('登入後即可收到或發送科上通知。'); return; }
    if (isStaff()) return loadNoticesTeacher();
    if (currentUser.role === '家長') {
        try {
            const [inbox, msgs] = await Promise.all([api('/api/campus/notices/inbox'), api('/api/campus/advisor-messages')]);
            body.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-2">${noticeListHtml(inbox, true)}
                        <p class="text-xs text-slate-400 pt-2">僅能查看，標記已讀與加入／退出班級請由學生本人操作。</p></div>
                    <div class="space-y-3">
                        <h3 class="font-bold text-slate-900">留言給導師</h3>
                        <form onsubmit="sendAdvisorMessage(event)" class="rounded border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
                            <input name="subject" required maxlength="60" placeholder="主旨" class="w-full border border-slate-300 rounded px-3 py-2">
                            <textarea name="content" required rows="3" maxlength="1000" placeholder="想跟導師說的事" class="w-full border border-slate-300 rounded px-3 py-2"></textarea>
                            <div class="text-right"><button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">送出</button></div>
                        </form>
                        <h3 class="font-bold text-slate-900">留言紀錄</h3>
                        ${msgs.data.length ? msgs.data.map(m => `
                            <div class="rounded border border-slate-200 px-4 py-3 space-y-1.5">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <span class="font-semibold text-slate-900">${esc(m.subject)}</span>
                                    ${statusBadge(m.status, m.status === '待回覆' ? 'amber' : 'green')}
                                </div>
                                <p class="text-sm text-slate-700 whitespace-pre-line">${esc(m.content)}</p>
                                ${m.reply ? `<div class="text-sm bg-ukn-50 border border-ukn-200 rounded px-3 py-2"><span class="text-xs font-bold text-ukn-700">導師回覆：</span>${esc(m.reply)}</div>` : ''}
                            </div>`).join('') : '<div class="text-sm text-slate-500">還沒有留言紀錄。</div>'}
                    </div>
                </div>`;
        } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
        return;
    }
    if (currentUser.role !== '學生') { body.innerHTML = '<div class="text-sm text-slate-500">科上通知提供學生與老師使用。</div>'; return; }
    try {
        const [cls, inbox] = await Promise.all([api('/api/campus/classes'), api('/api/campus/notices/inbox')]);
        noticeClasses = cls.data;
        const joined = noticeClasses.filter(c => c.joined), others = noticeClasses.filter(c => !c.joined);
        body.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-2">${noticeListHtml(inbox, false)}</div>
                <div class="space-y-4">
                    <div class="rounded border border-slate-200 p-4 space-y-2">
                        <h3 class="font-bold text-slate-900 text-sm">我加入的班級</h3>
                        ${joined.length ? joined.map(c => `<div class="flex items-center justify-between text-sm"><span>${esc(c.class_name)} <span class="text-[11px] text-slate-500">${c.member_count} 人</span></span>
                            <button type="button" onclick="leaveClass('${esc(c.class_name)}')" class="text-[11px] text-slate-500 hover:text-rose-700">退出</button></div>`).join('') : '<div class="text-xs text-slate-500">尚未加入任何班級</div>'}
                    </div>
                    <form onsubmit="joinClass(event)" class="rounded border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
                        <h3 class="font-bold text-slate-900 text-sm">用密碼加入班級</h3>
                        <select name="class_name" class="w-full border border-slate-300 rounded px-3 py-2 bg-white">${others.map(c => `<option>${esc(c.class_name)}</option>`).join('')}</select>
                        <input name="password" type="password" required placeholder="老師給的班級密碼" class="w-full border border-slate-300 rounded px-3 py-2">
                        <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2" ${others.length ? '' : 'disabled'}>加入</button>
                    </form>
                </div>
            </div>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

async function sendAdvisorMessage(event) {
    event.preventDefault();
    try {
        const r = await api('/api/campus/advisor-messages', { json: Object.fromEntries(new FormData(event.target)) });
        toast(r.message);
        loadNotices();
    } catch (e) { toast(e.message, 'error'); }
}

async function readNotice(id, el) {
    if (!el.querySelector('[data-dot]')) return;
    el.querySelector('[data-dot]').remove();
    el.classList.remove('border-accent-500/50', 'bg-accent-50/40');
    el.classList.add('border-slate-200');
    try { await api(`/api/campus/notices/${id}/read`, { method: 'POST' }); pollNotices(false); } catch (e) { /* 下次開啟再標記 */ }
}

async function joinClass(event) {
    event.preventDefault();
    try { const r = await api('/api/campus/classes/join', { json: Object.fromEntries(new FormData(event.target)) }); toast(r.message); loadNotices(); }
    catch (e) { toast(e.message, 'error'); }
}

async function leaveClass(name) {
    if (!confirm(`確定退出「${name}」？之後不會再收到這個班級的通知。`)) return;
    try { await api('/api/campus/classes/leave', { json: { class_name: name } }); loadNotices(); } catch (e) { toast(e.message, 'error'); }
}

let noticeSelectedClass = null;
async function loadNoticesTeacher() {
    const body = document.getElementById('noticesBody');
    try {
        const [cls, sent, advisorMsgs] = await Promise.all([api('/api/campus/classes'), api('/api/campus/notices/sent'), api('/api/campus/advisor-messages')]);
        noticeClasses = cls.data;
        noticeSelectedClass = noticeSelectedClass || (noticeClasses.find(c => c.is_advised) || noticeClasses[0])?.class_name;
        body.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div class="space-y-2">
                    <h3 class="font-bold text-slate-900 text-sm">選擇班級</h3>
                    ${noticeClasses.map(c => `<button type="button" onclick="noticeSelectedClass='${esc(c.class_name)}'; loadNoticesTeacher()" class="w-full text-left rounded border px-3 py-2 text-sm ${c.class_name === noticeSelectedClass ? 'border-ukn-700 bg-ukn-50 font-bold text-ukn-900' : 'border-slate-200 hover:border-ukn-300'}">
                        ${esc(c.class_name)}${c.is_advised ? ' <span class="text-[10px] text-accent-500">導師班</span>' : ''}<span class="block text-[11px] font-normal text-slate-500">${c.members.length} 位學生</span></button>`).join('')}
                    <details class="rounded border border-dashed border-slate-300 p-3 text-sm"><summary class="cursor-pointer text-xs font-semibold text-slate-600">＋ 建立班級 / 重設密碼</summary>
                        <form onsubmit="createClass(event)" class="space-y-2 mt-2">
                            <input name="class_name" placeholder="班級名稱" class="w-full border border-slate-300 rounded px-2 py-1.5">
                            <input name="password" placeholder="加入密碼 (至少 4 碼)" class="w-full border border-slate-300 rounded px-2 py-1.5">
                            <div class="flex gap-2"><button class="flex-1 bg-ukn-800 text-white rounded py-1.5 text-xs font-bold">建立新班級</button>
                                <button type="button" onclick="resetClassPassword(this.form)" class="flex-1 border border-slate-300 rounded py-1.5 text-xs">重設所選班級密碼</button></div>
                        </form></details>
                </div>
                <div class="lg:col-span-3 space-y-4">${noticeComposeHtml()}
                    <div><h3 class="font-bold text-slate-900 mb-2">家長留言 ${advisorMsgs.data.filter(m => m.status === '待回覆').length ? `<span class="text-xs text-accent-500">(${advisorMsgs.data.filter(m => m.status === '待回覆').length} 則待回覆)</span>` : ''}</h3>
                        ${advisorMsgs.data.length ? `<div class="space-y-2">${advisorMsgs.data.map(m => `
                            <div class="rounded border ${m.status === '待回覆' ? 'border-accent-500/50 bg-accent-50/30' : 'border-slate-200'} px-4 py-3 space-y-1.5">
                                <div class="flex flex-wrap items-center justify-between gap-2">
                                    <span class="font-semibold text-slate-900">${esc(m.subject)}</span>
                                    ${statusBadge(m.status, m.status === '待回覆' ? 'amber' : 'green')}
                                </div>
                                <div class="text-[11px] text-slate-500">${esc(m.class_name)} · ${esc(m.student_name)}同學家長 ${esc(m.parent_name)} · ${esc(m.created_at.slice(5, 16).replace('-', '/'))}</div>
                                <p class="text-sm text-slate-700 whitespace-pre-line">${esc(m.content)}</p>
                                ${m.reply ? `<div class="text-sm bg-white border border-slate-200 rounded px-3 py-2"><span class="text-xs font-bold text-ukn-700">導師回覆：</span>${esc(m.reply)}</div>`
                                    : `<form onsubmit="replyAdvisorMessage(event, ${m.id})" class="flex gap-2"><input name="reply" required placeholder="回覆家長..." class="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm"><button class="bg-ukn-800 hover:bg-ukn-900 text-white text-xs font-bold rounded px-3">回覆</button></form>`}
                            </div>`).join('')}</div>` : '<div class="text-sm text-slate-500">目前沒有家長留言。</div>'}
                    </div>
                    <div><h3 class="font-bold text-slate-900 mb-2">已發送</h3>
                        ${sent.data.length ? `<div class="space-y-2">${sent.data.map(n => `
                            <details class="rounded border border-slate-200 px-4 py-3"><summary class="cursor-pointer list-none">
                                <div class="flex flex-wrap items-center justify-between gap-2"><span class="font-semibold text-slate-900">${esc(n.title)}</span>
                                    ${statusBadge(`已讀 ${n.read_count} / ${n.total}`, n.read_count === n.total ? 'green' : 'blue')}</div>
                                <div class="text-[11px] text-slate-500">${esc(n.class_name)} · ${n.whole_class ? '整班' : '個別通知'} · ${esc(n.created_at.slice(5, 16).replace('-', '/'))}</div></summary>
                                <p class="text-sm text-slate-700 mt-2 whitespace-pre-line">${esc(n.content)}</p>
                                ${n.unread_names.length ? `<p class="text-xs text-amber-800 mt-2">尚未讀：${n.unread_names.map(esc).join('、')}</p>` : ''}
                            </details>`).join('')}</div>` : '<div class="text-sm text-slate-500">還沒有發送紀錄。</div>'}</div>
                </div>
            </div>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function noticeComposeHtml() {
    const c = noticeClasses.find(x => x.class_name === noticeSelectedClass);
    if (!c) return '<div class="text-sm text-slate-500">請先建立班級。</div>';
    return `
        <form onsubmit="sendNotice(event)" class="rounded border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
            <div class="flex flex-wrap items-center gap-4">
                <span class="font-bold text-slate-900">通知 ${esc(c.class_name)}</span>
                <label class="flex items-center gap-1.5"><input type="radio" name="scope" value="all" checked onchange="document.getElementById('noticeMembers').classList.add('hidden')"> 整班 (${c.members.length} 人)</label>
                <label class="flex items-center gap-1.5"><input type="radio" name="scope" value="some" onchange="document.getElementById('noticeMembers').classList.remove('hidden')"> 只通知個別學生</label>
            </div>
            <div id="noticeMembers" class="hidden grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white border border-slate-200 rounded p-3">
                ${c.members.map(m => `<label class="flex items-center gap-1.5 text-xs"><input type="checkbox" name="recipients" value="${esc(m.student_id)}"> ${esc(m.full_name)}</label>`).join('') || '<span class="text-xs text-slate-500">班上還沒有學生</span>'}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input name="title" required maxlength="80" placeholder="通知標題" class="sm:col-span-2 border border-slate-300 rounded px-3 py-2">
                <select name="priority" class="border border-slate-300 rounded px-3 py-2 bg-white"><option>一般</option><option>重要</option><option>緊急</option></select>
                <input type="date" name="due_date" title="期限（選填）" class="border border-slate-300 rounded px-3 py-2">
            </div>
            <textarea name="content" required rows="3" maxlength="2000" placeholder="通知內容" class="w-full border border-slate-300 rounded px-3 py-2"></textarea>
            <div class="text-right"><button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">發送通知</button></div>
        </form>`;
}

async function sendNotice(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const recipients = fd.get('scope') === 'all' ? 'all' : fd.getAll('recipients');
    if (recipients !== 'all' && !recipients.length) { toast('請勾選要通知的學生', 'error'); return; }
    try {
        const r = await api('/api/campus/notices', { json: { class_name: noticeSelectedClass, recipients, title: fd.get('title'), content: fd.get('content'), priority: fd.get('priority'), due_date: fd.get('due_date') } });
        toast(r.message);
        loadNoticesTeacher();
    } catch (e) { toast(e.message, 'error'); }
}

async function replyAdvisorMessage(event, id) {
    event.preventDefault();
    const reply = event.target.reply.value;
    try { await api(`/api/campus/advisor-messages/${id}/reply`, { json: { reply } }); loadNoticesTeacher(); }
    catch (e) { toast(e.message, 'error'); }
}

async function createClass(event) {
    event.preventDefault();
    try { const r = await api('/api/campus/classes', { json: Object.fromEntries(new FormData(event.target)) }); toast(r.message); loadNoticesTeacher(); }
    catch (e) { toast(e.message, 'error'); }
}

async function resetClassPassword(form) {
    try { const r = await api('/api/campus/classes/password', { json: { class_name: noticeSelectedClass, password: form.password.value } }); toast(`${noticeSelectedClass}：${r.message}`); }
    catch (e) { toast(e.message, 'error'); }
}
