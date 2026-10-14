// Smart UKN 新功能畫面：行事曆月曆、AI 智慧校規、選課檢查、證照審核、獎助學金、宿舍與總務、
// 教室 / 櫃子租借、校園地圖與老師辦公室、天氣交通、人流、科上通知。
// 依賴 campus-shell.js (api、toast、openModal、tabLoaders…) 與 index.html (currentUser、escapeHtml…)。

const WEEKDAY_TEXT = ['', '一', '二', '三', '四', '五', '六', '日'];
const esc = s => escapeHtml(s);

function campusFeaturesInit() {
    Object.assign(tabLoaders, {
        'tab-calendar': () => calendarShift(0),
        'tab-plan': loadPlan,
        'tab-certs': loadCerts,
        'tab-scholarship': loadScholarships,
        'tab-services': () => { loadDorm(); loadAffairs(); },
        'tab-rent': () => { loadRooms(); loadLockers(); },
        'tab-map': () => { loadMap(); loadTeachers(); },
        'tab-traffic': () => { loadWeatherDetail(); loadTransport(); },
        'tab-crowd': loadCrowd,
        'tab-notices': loadNotices,    });
    setupRuleSuggest();
    loadRulesTree();
    const roomDate = document.getElementById('roomDate');
    roomDate.value = nextWeekday();
    roomDate.addEventListener('change', loadRooms);
    document.getElementById('mapSearch').addEventListener('keydown', e => { if (e.key === 'Enter') findOnMap(); });
    loadChecklistDocState();
}

function nextWeekday() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return isoDate(d);
}

function isoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function statusBadge(text, tone) {
    const tones = { green: 'bg-emerald-50 border-emerald-200 text-emerald-800', amber: 'bg-amber-50 border-amber-200 text-amber-900',
        red: 'bg-rose-50 border-rose-200 text-rose-800', blue: 'bg-ukn-50 border-ukn-200 text-ukn-800', gray: 'bg-slate-100 border-slate-200 text-slate-600' };
    return `<span class="inline-block text-[11px] font-bold border rounded px-1.5 py-0.5 whitespace-nowrap ${tones[tone] || tones.gray}">${esc(text)}</span>`;
}

function fileLinks(files) {
    return (files || []).map(f => f.type === 'image'
        ? `<a href="${esc(f.url)}" target="_blank" rel="noopener"><img src="${esc(f.url)}" alt="${esc(f.name)}" class="w-16 h-16 object-cover rounded border border-slate-200"></a>`
        : `<a href="${esc(f.url)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs border border-slate-300 rounded px-2 py-1 hover:border-ukn-500">📄 ${esc(f.name)}</a>`).join('');
}

// =====================================================================
// 行事曆：月曆
// =====================================================================

let calYear = null, calMonth = null, calData = null;
const CAL_KNOWN = ['申辦', '考試', '繳費', '放假', '活動', '教務', '獎助', '個人'];

function calendarShift(step) {
    if (step === 0 || calYear === null) {
        const n = new Date();
        calYear = n.getFullYear();
        calMonth = n.getMonth() + 1;
    } else {
        calMonth += step;
        if (calMonth < 1) { calMonth = 12; calYear--; }
        if (calMonth > 12) { calMonth = 1; calYear++; }
    }
    refreshCalendar();
}

async function refreshCalendar() {
    if (calYear === null) return;
    document.getElementById('calMonthTitle').textContent = `${calYear} 年 ${calMonth} 月`;
    try {
        calData = await api(withScope(`/api/campus/calendar/month?year=${calYear}&month=${calMonth}`));
        renderCalendar();
    } catch (e) {
        document.getElementById('calGrid').innerHTML = `<div class="col-span-7 bg-white p-6 text-center text-sm text-rose-700">${esc(e.message)}</div>`;
    }
}

function eventsOn(day) {
    return calData.events.filter(e => e.start_date <= day && e.end_date >= day);
}

function eventStatus(e) {
    const today = calData.today;
    if (e.expired) return { text: '已截止', tone: 'gray' };
    if (e.start_date > today) {
        const days = Math.round((new Date(e.start_date) - new Date(today)) / 86400000);
        return { text: `${days} 天後開始`, tone: 'blue' };
    }
    const left = Math.round((new Date(e.end_date) - new Date(today)) / 86400000);
    return left === 0 ? { text: '今天截止', tone: 'red' } : { text: `進行中 · 剩 ${left} 天`, tone: left <= 3 ? 'red' : 'green' };
}

function renderCalendar() {
    const start = new Date(calData.grid_start + 'T00:00:00');
    const cells = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const iso = isoDate(d);
        const inMonth = d.getMonth() + 1 === calMonth;
        const weekend = d.getDay() === 0 || d.getDay() === 6;
        const holiday = calData.holidays[iso];
        const isOff = holiday ? holiday.is_holiday : weekend;
        const evs = eventsOn(iso);
        const chips = evs.slice(0, 3).map(e => {
            const cat = CAL_KNOWN.includes(e.category) ? e.category : '活動';
            return `<button type="button" onclick="event.stopPropagation(); openEventDetail('${esc(e.key)}')"
                class="cal-ev cal-cat-${cat} ${e.expired ? 'expired' : ''} block w-full text-left truncate text-[11px] leading-5 px-1 rounded-sm" title="${esc(e.title)}">${esc(e.title)}</button>`;
        }).join('');
        cells.push(`
            <div role="button" tabindex="0" onclick="openDayDetail('${iso}')" onkeydown="if(event.key==='Enter')openDayDetail('${iso}')"
                class="min-h-[5.5rem] sm:min-h-[7rem] p-1 sm:p-1.5 space-y-0.5 cursor-pointer ${isOff ? 'bg-rose-50/70' : 'bg-white'} ${inMonth ? '' : 'opacity-45'} hover:bg-ukn-50">
                <div class="flex items-center justify-between gap-1">
                    <span class="text-xs font-bold ${iso === calData.today ? 'bg-ukn-800 text-white rounded-full w-6 h-6 flex items-center justify-center' : isOff ? 'text-rose-600' : 'text-slate-700'}">${d.getDate()}</span>
                    ${holiday ? `<span class="text-[10px] truncate ${holiday.is_holiday ? 'text-rose-600 font-semibold' : 'text-slate-500'}" title="${esc(holiday.name)}">${holiday.is_holiday ? esc(holiday.name) : '補班'}</span>` : ''}
                </div>
                <div class="hidden sm:block space-y-0.5">${chips}${evs.length > 3 ? `<div class="text-[10px] text-slate-500 px-1">+${evs.length - 3} 項</div>` : ''}</div>
                <div class="sm:hidden flex flex-wrap gap-0.5">${evs.slice(0, 4).map(e => `<span class="w-1.5 h-1.5 rounded-full ${e.expired ? 'bg-slate-300' : 'bg-accent-500'}"></span>`).join('')}</div>
            </div>`);
    }
    document.getElementById('calGrid').innerHTML = cells.join('');
    document.getElementById('calSourceNote').textContent = '國定假日：行政院人事行政總處辦公日曆表（自動抓取）· 學校事項：校曆與申辦期限'
        + (calData.ukn_synced_at ? `，康寧官網行事曆 ${calData.ukn_synced_at.slice(0, 10)} 同步` : '');
}

function openDayDetail(iso) {
    const evs = eventsOn(iso);
    const holiday = calData.holidays[iso];
    const d = new Date(iso + 'T00:00:00');
    openModal(`${d.getMonth() + 1} 月 ${d.getDate()} 日（${WEEKDAY_TEXT[d.getDay() || 7]}）`, `
        ${holiday ? `<div class="rounded border px-3 py-2 ${holiday.is_holiday ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200'}">${holiday.is_holiday ? '🎌 放假：' : '🏢 補行上班：'}${esc(holiday.name)}</div>` : ''}
        ${evs.length ? evs.map(e => `
            <button type="button" onclick="openEventDetail('${esc(e.key)}')" class="w-full text-left rounded border border-slate-200 px-3 py-2 hover:border-ukn-400 ${e.expired ? 'opacity-60' : ''}">
                <div class="flex items-center justify-between gap-2"><span class="font-semibold ${e.expired ? 'line-through text-slate-500' : 'text-slate-900'}">${esc(e.title)}</span>${statusBadge(eventStatus(e).text, eventStatus(e).tone)}</div>
                <div class="text-[11px] text-slate-500">${mmdd(e.start_date)}${e.end_date !== e.start_date ? ` – ${mmdd(e.end_date)}` : ''} · ${esc(e.category)}</div>
            </button>`).join('') : '<p class="text-slate-500">這天沒有事項。</p>'}
        ${isLoggedIn() ? `<button type="button" onclick="openAddEventModal('${iso}')" class="w-full border border-dashed border-ukn-300 text-ukn-800 rounded py-2 hover:bg-ukn-50">＋ 在這天新增我的行程</button>` : ''}`);
}

function openEventDetail(key) {
    const e = calData.events.find(x => x.key === key);
    if (!e) return;
    const st = eventStatus(e);
    const chk = e.detail?.checklist;
    const range = `${e.start_date.replace(/-/g, '/')}${e.end_date !== e.start_date ? ` – ${e.end_date.replace(/-/g, '/')}` : ''}`;
    let body = `
        <div class="flex flex-wrap items-center gap-2">${statusBadge(st.text, st.tone)} ${statusBadge(e.category, 'blue')} ${e.source ? statusBadge(e.source, 'gray') : ''}</div>
        <div class="text-slate-600">📆 ${range}</div>
        ${e.expired ? '<div class="rounded bg-slate-100 border border-slate-200 px-3 py-2 text-slate-600">此事項已截止。若錯過期限，請直接洽承辦單位詢問補救方式。</div>' : ''}
        ${e.detail?.description ? `<p class="leading-relaxed">${esc(e.detail.description)}</p>` : ''}
        ${e.detail?.note ? `<p class="leading-relaxed whitespace-pre-line">${esc(e.detail.note)}</p>` : ''}`;
    if (chk) {
        body += `
            <div class="rounded border border-ukn-200 bg-ukn-50/50 p-3 space-y-2">
                <div class="font-bold text-ukn-900">📋 申請需要的東西：${esc(chk.business_name)}</div>
                ${chk.required_docs.length ? `<div><div class="text-xs font-semibold text-slate-600">要準備的資料</div><ul class="list-disc pl-5 text-sm">${chk.required_docs.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>` : ''}
                ${chk.steps.length ? `<div><div class="text-xs font-semibold text-slate-600">辦理步驟</div><ol class="list-decimal pl-5 text-sm space-y-0.5">${chk.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}
                <div class="text-xs text-slate-600">📍 ${esc(chk.office)}：${esc(chk.office_location)} · ${esc(chk.contact_phone)}${chk.office_hours ? ` · ${esc(chk.office_hours)}` : ''}</div>
                <div class="flex flex-wrap gap-2 pt-1">
                    ${chk.form_download_url ? `<a href="${esc(chk.form_download_url)}" class="text-xs border border-slate-300 bg-white rounded px-2 py-1 hover:border-ukn-500">下載申請表</a>` : ''}
                    ${chk.system_url ? `<a href="${esc(chk.system_url)}" target="_blank" rel="noopener noreferrer" class="text-xs border border-slate-300 bg-white rounded px-2 py-1 hover:border-ukn-500">線上系統 ↗</a>` : ''}
                    <button type="button" onclick="closeModal(); jumpToChecklist(${Number(chk.item_id)})" class="text-xs bg-ukn-800 text-white rounded px-2 py-1">開始辦理並追蹤進度 ➔</button>
                </div>
            </div>`;
    } else if (e.detail?.system_url) {
        body += `<a href="${esc(e.detail.system_url)}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs border border-slate-300 rounded px-2 py-1">前往線上系統 ↗</a>`;
    }
    if (e.type === 'personal') {
        body += `<button type="button" onclick="deleteMyEvent(${Number(e.id)})" class="text-xs text-rose-700 border border-rose-200 rounded px-2 py-1 hover:bg-rose-50">從我的月曆刪除</button>`;
    }
    openModal(e.title, body);
}

function openAddEventModal(date) {
    if (!isLoggedIn()) { openModal('新增行程', loginPrompt('登入後就能新增自己的行程。')); return; }
    const d = date || calData?.today || isoDate(new Date());
    openModal('新增我的行程', `
        <form onsubmit="submitMyEvent(event)" class="space-y-3">
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">行程名稱</label><input name="title" required maxlength="80" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">開始</label><input type="date" name="start_date" value="${d}" required class="w-full border border-slate-300 rounded px-3 py-2"></div>
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">結束 (選填)</label><input type="date" name="end_date" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            </div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">備註</label><textarea name="note" rows="2" maxlength="300" class="w-full border border-slate-300 rounded px-3 py-2"></textarea></div>
            <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2">新增</button>
        </form>`);
}

async function submitMyEvent(event) {
    event.preventDefault();
    const f = new FormData(event.target);
    try {
        await api('/api/campus/my-events', { json: { title: f.get('title'), start_date: f.get('start_date'), end_date: f.get('end_date') || f.get('start_date'), note: f.get('note') } });
        closeModal();
        toast('已新增到你的月曆');
        refreshCalendar();
        loadHomeUpcoming();
    } catch (e) { toast(e.message, 'error'); }
}

async function deleteMyEvent(id) {
    if (!confirm('確定要刪除這個行程？')) return;
    try {
        await api(`/api/campus/my-events/${id}`, { method: 'DELETE' });
        closeModal();
        toast('已刪除');
        refreshCalendar();
    } catch (e) { toast(e.message, 'error'); }
}

// =====================================================================
// AI 智慧校規：打一個字就有選項、大分類、引導式詢問、完整流程下拉選單
// =====================================================================

let rulesTree = { categories: [], processes: [] };
let suggestItems = [], suggestActive = -1, suggestTimer = null;

function setRulesMode(mode) {
    document.querySelectorAll('[data-rules-mode]').forEach(b => b.classList.toggle('active', b.dataset.rulesMode === mode));
    document.getElementById('rulesModeSearch').classList.toggle('hidden', mode !== 'search');
    document.getElementById('rulesModeGuide').classList.toggle('hidden', mode !== 'guide');
    document.getElementById('rulesModeProcess').classList.toggle('hidden', mode !== 'process');
}

function setupRuleSuggest() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => {
        clearTimeout(suggestTimer);
        suggestTimer = setTimeout(fetchSuggest, 120);
    });
    input.addEventListener('keydown', e => {
        const open = !document.getElementById('ruleSuggestList').classList.contains('hidden');
        if (e.key === 'ArrowDown' && open) { e.preventDefault(); moveSuggest(1); }
        else if (e.key === 'ArrowUp' && open) { e.preventDefault(); moveSuggest(-1); }
        else if (e.key === 'Escape') hideSuggest();
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (open && suggestActive >= 0) pickSuggest(suggestActive); else { hideSuggest(); handleSearch(); }
        }
    });
    input.addEventListener('blur', () => setTimeout(hideSuggest, 150));
}

async function fetchSuggest() {
    const q = document.getElementById('searchInput').value.trim();
    if (!q) { hideSuggest(); return; }
    try { suggestItems = (await api(`/api/campus/rules/suggest?q=${encodeURIComponent(q)}`)).data; } catch (e) { suggestItems = []; }
    suggestActive = -1;
    const list = document.getElementById('ruleSuggestList');
    if (!suggestItems.length) {
        list.innerHTML = `<li class="px-3 py-2 text-xs text-slate-500">沒有「${esc(q)}」開頭的選項，按 Enter 直接搜尋，或改用「我不確定，幫我問」。</li>`;
    } else {
        list.innerHTML = suggestItems.map((s, i) => `
            <li role="option" id="sugg-${i}" onmousedown="event.preventDefault(); pickSuggest(${i})" class="px-3 py-2 cursor-pointer flex items-center justify-between gap-2 hover:bg-ukn-50">
                <span class="text-slate-800">${highlightMatch(s.text, q)}${s.official_term && s.official_term !== s.text ? `<span class="text-[11px] text-slate-500 ml-1">→ ${esc(s.official_term)}</span>` : ''}</span>
                <span class="shrink-0 text-[10px] text-slate-500 border border-slate-200 rounded px-1">${esc(s.kind)}${s.category ? ` · ${esc(s.category)}` : ''}</span>
            </li>`).join('');
    }
    list.classList.remove('hidden');
    document.getElementById('searchInput').setAttribute('aria-expanded', 'true');
}

function highlightMatch(text, q) {
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return `${esc(text.slice(0, i))}<strong class="text-ukn-800">${esc(text.slice(i, i + q.length))}</strong>${esc(text.slice(i + q.length))}`;
}

function moveSuggest(step) {
    if (!suggestItems.length) return;
    suggestActive = (suggestActive + step + suggestItems.length) % suggestItems.length;
    document.querySelectorAll('#ruleSuggestList [role=option]').forEach((li, i) => li.classList.toggle('bg-ukn-50', i === suggestActive));
    document.getElementById('searchInput').setAttribute('aria-activedescendant', `sugg-${suggestActive}`);
}

function hideSuggest() {
    document.getElementById('ruleSuggestList').classList.add('hidden');
    document.getElementById('searchInput').setAttribute('aria-expanded', 'false');
}

function pickSuggest(i) {
    const s = suggestItems[i];
    hideSuggest();
    if (!s) return;
    if (s.checklist_id) {
        setRulesMode('process');
        document.getElementById('processSelect').value = s.checklist_id;
        showProcessDetail(s.checklist_id);
        return;
    }
    const rule = allRules().find(r => r.kb_id === s.kb_id);
    if (rule) { document.getElementById('searchInput').value = s.text; showRuleCard(rule, s.text); }
    else { document.getElementById('searchInput').value = s.official_term || s.text; handleSearch(); }
}

function allRules() { return rulesTree.categories.flatMap(c => c.rules); }

async function loadRulesTree() {
    try { rulesTree = await api('/api/campus/rules/tree'); } catch (e) { return; }
    document.getElementById('ruleCategoryChips').innerHTML = rulesTree.categories.map((c, i) => `
        <button type="button" data-cat-chip="${i}" onclick="showCategory(${i})" class="border border-slate-300 rounded px-3 py-1.5 text-sm hover:border-ukn-500 bg-white">${esc(c.icon)} ${esc(c.name)} <span class="text-[11px] text-slate-400">${c.rules.length}</span></button>`).join('');
    document.getElementById('guideCategory').innerHTML = '<option value="">不確定是哪一類</option>' +
        rulesTree.categories.map(c => `<option value="${esc(c.name)}">${esc(c.icon)} ${esc(c.name)}</option>`).join('');
    const byOffice = {};
    rulesTree.processes.forEach(p => { (byOffice[p.office] = byOffice[p.office] || []).push(p); });
    document.getElementById('processSelect').innerHTML = '<option value="">請選擇…</option>' + Object.entries(byOffice).map(([office, list]) =>
        `<optgroup label="${esc(office)}">${list.map(p => `<option value="${p.item_id}">${esc(p.business_name)}</option>`).join('')}</optgroup>`).join('');
}

function showCategory(i) {
    const c = rulesTree.categories[i];
    document.querySelectorAll('[data-cat-chip]').forEach(b => {
        const on = Number(b.dataset.catChip) === i;
        b.classList.toggle('bg-ukn-800', on); b.classList.toggle('text-white', on); b.classList.toggle('bg-white', !on);
    });
    const box = document.getElementById('ruleCategoryItems');
    box.innerHTML = c.rules.map(r => `
        <button type="button" onclick="showRuleCard(allRules().find(x => x.kb_id === ${Number(r.kb_id)}))" class="text-left rounded border border-slate-200 bg-white px-3 py-2 hover:border-ukn-400">
            <div class="text-sm font-semibold text-slate-900">${esc(r.title)}</div>
            <div class="text-[11px] text-slate-500">${esc(r.subcategory)}${r.checklist ? ' · 有申辦流程' : ''}</div>
        </button>`).join('');
    box.classList.remove('hidden');
}

function showRuleCard(rule, query) {
    if (!rule) return;
    document.getElementById('synonymBadge').classList.add('hidden');
    displayRuleResult({
        rule_id: rule.kb_id, title: rule.title, category_name: rule.category_name,
        office_name: rule.checklist?.office || '', office_phone: rule.checklist?.contact_phone || '',
        content: rule.content, related_checklist_id: rule.checklist?.item_id || null,
        checklist_title: rule.checklist?.business_name || ''
    }, query || rule.title);
    document.getElementById('resultSourceInfo').textContent = `出處：${rule.source_doc || '康寧大學規章'}${rule.source_page ? ` 第 ${rule.source_page} 頁` : ''}`;
    if (rule.checklist) {
        const btn = document.getElementById('jumpChecklistBtn');
        btn.onclick = () => jumpToChecklist(rule.checklist.item_id);
    }
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

let guideState = null;
async function startGuide() {
    const q = document.getElementById('guideInput').value.trim();
    const category = document.getElementById('guideCategory').value;
    const box = document.getElementById('guideDialog');
    if (!q && !category) { toast('請大概描述一下，或先選一個分類', 'error'); return; }
    try {
        const list = (await api(`/api/campus/rules/candidates?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`)).data;
        guideState = { list, idx: 0, q };
        box.innerHTML = q ? `<div class="flex justify-end"><div class="bg-ukn-800 text-white rounded-lg rounded-br-sm px-3 py-2 text-sm max-w-[80%]">${esc(q)}</div></div>` : '';
        renderGuideStep();
    } catch (e) { toast(e.message, 'error'); }
}

function renderGuideStep() {
    const box = document.getElementById('guideDialog');
    box.querySelector('[data-guide-ask]')?.remove();
    const cur = guideState.list[guideState.idx];
    const bubble = document.createElement('div');
    bubble.dataset.guideAsk = '1';
    if (!cur) {
        bubble.innerHTML = `
            <div class="flex gap-2"><span class="text-2xl">🤖</span><div class="bg-slate-100 rounded-lg rounded-tl-sm px-3 py-2 text-sm space-y-2 max-w-[85%]">
                <p>我暫時找不到符合的規定 😥 可以試試：</p>
                <ul class="list-disc pl-5 text-xs space-y-0.5"><li>換個說法再描述一次</li><li>切到「看完整申辦流程」從清單找</li><li>直接詢問承辦處室（課務組分機 310、註冊組分機 321、生輔組分機 211）</li></ul>
                <p class="text-[11px] text-slate-500">你的問題已記錄，管理員會補充到規章資料庫。</p>
            </div></div>`;
        if (guideState.q) api('/api/search', { json: { query: guideState.q } }).catch(() => {});
    } else {
        bubble.innerHTML = `
            <div class="flex gap-2"><span class="text-2xl">🤖</span><div class="bg-slate-100 rounded-lg rounded-tl-sm px-3 py-2 text-sm space-y-2 max-w-[85%]">
                <p>${esc(cur.question)}</p>
                <div class="flex gap-2">
                    <button type="button" onclick="guideAnswer(true)" class="bg-ukn-800 hover:bg-ukn-900 text-white rounded px-3 py-1 text-xs font-bold">是，就是這個</button>
                    <button type="button" onclick="guideAnswer(false)" class="bg-white border border-slate-300 rounded px-3 py-1 text-xs">不是</button>
                </div>
                ${guideState.list.length > 1 ? `<p class="text-[11px] text-slate-500">第 ${guideState.idx + 1} / ${guideState.list.length} 個可能</p>` : ''}
            </div></div>`;
    }
    box.appendChild(bubble);
}

function guideAnswer(yes) {
    const box = document.getElementById('guideDialog');
    const cur = guideState.list[guideState.idx];
    box.querySelector('[data-guide-ask]')?.removeAttribute('data-guide-ask');
    box.querySelectorAll('button').forEach(b => b.disabled = true);
    box.insertAdjacentHTML('beforeend', `<div class="flex justify-end"><div class="bg-ukn-800 text-white rounded-lg rounded-br-sm px-3 py-1.5 text-sm">${yes ? '是' : '不是'}</div></div>`);
    if (yes) {
        box.insertAdjacentHTML('beforeend', `<div class="flex gap-2"><span class="text-2xl">🤖</span><div class="bg-slate-100 rounded-lg rounded-tl-sm px-3 py-2 text-sm">好的！下面是「${esc(cur.title)}」的規定${cur.checklist ? '，以及要準備的資料和辦理流程' : ''} 👇</div></div>`);
        showRuleCard(cur, guideState.q);
        if (cur.checklist) {
            setTimeout(() => {
                document.getElementById('resultAnswerBody').insertAdjacentHTML('afterend', `<div data-guide-process class="mt-3">${processDetailHtml(cur.checklist)}</div>`);
            }, 50);
        }
        return;
    }
    guideState.idx++;
    renderGuideStep();
}

function processDetailHtml(p) {
    return `
        <div class="rounded border border-slate-200 bg-white p-4 space-y-3 text-sm">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="font-bold text-slate-900 text-base">${esc(p.business_name)}</div>
                ${p.deadline ? statusBadge(`期限：${p.deadline}`, 'amber') : ''}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="rounded bg-slate-50 border border-slate-200 p-3">
                    <div class="text-xs font-bold text-slate-600 mb-1">📎 要準備的資料</div>
                    ${p.required_docs.length ? `<ul class="list-disc pl-5 text-xs space-y-0.5">${p.required_docs.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : '<div class="text-xs text-slate-500">不需額外文件</div>'}
                </div>
                <div class="rounded bg-slate-50 border border-slate-200 p-3 text-xs space-y-0.5">
                    <div class="font-bold text-slate-600 mb-1">📍 去哪裡辦</div>
                    <div>${esc(p.office)}：${esc(p.office_location)}</div>
                    <div>${esc(p.office_hours)}</div><div>${esc(p.contact_phone)}</div>
                </div>
            </div>
            <div><div class="text-xs font-bold text-slate-600 mb-1">🪜 詳細流程</div>
                <ol class="space-y-1.5">${p.steps.map((s, i) => `<li class="flex gap-2 text-xs"><span class="shrink-0 w-5 h-5 rounded-full bg-ukn-800 text-white flex items-center justify-center text-[10px] font-bold">${i + 1}</span><span class="pt-0.5">${esc(s)}</span></li>`).join('')}</ol></div>
            <div class="flex flex-wrap gap-2">
                ${p.form_download_url ? `<a href="${esc(p.form_download_url)}" class="text-xs border border-slate-300 rounded px-2.5 py-1.5 hover:border-ukn-500">下載申請表</a>` : ''}
                ${p.system_url ? `<a href="${esc(p.system_url)}" target="_blank" rel="noopener noreferrer" class="text-xs border border-slate-300 rounded px-2.5 py-1.5 hover:border-ukn-500">線上系統 ↗</a>` : ''}
                <button type="button" onclick="showOnMap(${JSON.stringify(p.office_location).replace(/"/g, '&quot;')})" class="text-xs border border-slate-300 rounded px-2.5 py-1.5 hover:border-ukn-500">在地圖上看 🗺️</button>
                <button type="button" onclick="jumpToChecklist(${Number(p.item_id)})" class="text-xs bg-ukn-800 text-white rounded px-2.5 py-1.5 font-bold">開始辦理並追蹤進度 ➔</button>
            </div>
        </div>`;
}

function showProcessDetail(id) {
    const p = rulesTree.processes.find(x => String(x.item_id) === String(id));
    document.getElementById('processDetail').innerHTML = p ? processDetailHtml(p) : '';
}

// 申辦資料自評表 (index.html 的申辦卡片)
let checklistDocState = {};
async function loadChecklistDocState() {
    if (!isLoggedIn()) return;
    try { checklistDocState = (await api('/api/campus/checklist-docs')).data; } catch (e) { checklistDocState = {}; }
    applyChecklistDocState();
}

function applyChecklistDocState() {
    document.querySelectorAll('[data-doc-item]').forEach(el => {
        el.checked = (checklistDocState[el.dataset.docItem] || []).includes(Number(el.dataset.docIndex));
    });
    document.querySelectorAll('[data-doc-summary]').forEach(el => {
        const boxes = document.querySelectorAll(`[data-doc-item="${el.dataset.docSummary}"]`);
        const done = [...boxes].filter(b => b.checked).length;
        el.textContent = boxes.length ? (done === boxes.length ? '✓ 資料都準備好了，可以去辦理了！' : `已準備 ${done} / ${boxes.length} 項`) : '';
        el.className = `text-[11px] ${done === boxes.length && boxes.length ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`;
    });
}

async function toggleDocCheck(el) {
    if (!isLoggedIn()) { el.checked = !el.checked; toast('登入後才能保存準備進度', 'error'); return; }
    try {
        checklistDocState = (await api('/api/campus/checklist-docs', { json: { item_id: Number(el.dataset.docItem), doc_index: Number(el.dataset.docIndex), done: el.checked } })).data;
        applyChecklistDocState();
    } catch (e) { el.checked = !el.checked; toast(e.message, 'error'); }
}

// =====================================================================
// 選課檢查：220 學分與撞修
// =====================================================================

let planOfferings = [], planChosen = new Set(), planManualPassed = new Set(), planCourses = [], planTimer = null;

async function loadPlan() {
    const body = document.getElementById('planBody');
    try {
        const [off, courses] = await Promise.all([api('/api/campus/course-plan/offerings'), api(withScope('/api/courses'))]);
        planOfferings = off.data;
        planCourses = courses.data;
    } catch (e) { body.innerHTML = `<div class="text-rose-700 text-sm">${esc(e.message)}</div>`; return; }
    const groups = {};
    planOfferings.forEach(o => { (groups[o.course_type || '其他'] = groups[o.course_type || '其他'] || []).push(o); });
    body.innerHTML = `
        <div class="lg:col-span-3 space-y-4">
            ${isStudentLoggedIn() ? `<div class="text-xs text-slate-600 bg-ukn-50 border border-ukn-100 rounded px-3 py-2">已自動帶入 ${esc(currentUser.full_name)} 的歷年成績，已及格的課再選會被標出來。</div>`
                : `<details class="rounded border border-slate-200 bg-slate-50 p-3"><summary class="cursor-pointer text-xs font-semibold text-slate-700">未登入：先勾選你已經通過的課（登入學生帳號會自動帶入）</summary>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">${planCourses.map(c => `<label class="text-xs flex items-center gap-1.5"><input type="checkbox" onchange="togglePlanPassed('${esc(c.course_id)}', this.checked)"> ${esc(c.course_name)}</label>`).join('')}</div></details>`}
            ${Object.entries(groups).map(([type, list]) => `
                <div>
                    <div class="text-xs font-bold text-slate-600 mb-1.5">${esc(type)}</div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${list.map(o => `
                            <label id="plan-off-${esc(o.offering_id)}" class="flex items-start gap-2.5 rounded border border-slate-200 bg-white px-3 py-2 cursor-pointer hover:border-ukn-400">
                                <input type="checkbox" class="mt-1" onchange="togglePlanOffering('${esc(o.offering_id)}', this.checked)">
                                <span class="min-w-0">
                                    <span class="block text-sm font-semibold text-slate-900">${esc(o.course_name)} <span class="text-[11px] font-normal text-slate-500">${esc(o.offering_id)} · ${o.credits} 學分</span></span>
                                    <span class="block text-[11px] text-slate-500">${esc(o.slot)} · ${esc(o.classroom)} · ${esc(o.teacher)}${o.prerequisite_name ? ` · 先修：${esc(o.prerequisite_name)}` : ''}</span>
                                    <span data-plan-flag class="block"></span>
                                </span>
                            </label>`).join('')}
                    </div>
                </div>`).join('')}
            <div><div class="text-xs font-bold text-slate-600 mb-1.5">我的課表預覽</div><div id="planTimetable" class="overflow-x-auto"></div></div>
        </div>
        <div class="lg:col-span-2"><div id="planResult" class="lg:sticky lg:top-40 space-y-4">${planEmptyResult()}</div></div>`;
    renderPlanTimetable([]);
}

function planEmptyResult() {
    return '<div class="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">勾選左邊想修的課，這裡會即時顯示學分評分與撞修檢查。</div>';
}

function togglePlanOffering(id, on) { on ? planChosen.add(id) : planChosen.delete(id); schedulePlanCheck(); }
function togglePlanPassed(id, on) { on ? planManualPassed.add(id) : planManualPassed.delete(id); schedulePlanCheck(); }
function schedulePlanCheck() { clearTimeout(planTimer); planTimer = setTimeout(runPlanCheck, 200); }

async function runPlanCheck() {
    document.querySelectorAll('[data-plan-flag]').forEach(el => el.innerHTML = '');
    document.querySelectorAll('[id^="plan-off-"]').forEach(el => el.classList.remove('border-rose-400', 'bg-rose-50/50'));
    if (!planChosen.size) {
        document.getElementById('planResult').innerHTML = planEmptyResult();
        renderPlanTimetable([]);
        return;
    }
    let r;
    try {
        r = await api('/api/campus/course-plan/check', { json: { offering_ids: [...planChosen], passed_course_ids: [...planManualPassed] } });
    } catch (e) { toast(e.message, 'error'); return; }
    const c = r.credits;
    const errors = r.issues.filter(i => i.level === 'error'), warns = r.issues.filter(i => i.level === 'warn');
    r.issues.forEach(i => i.offering_ids.forEach(id => {
        const card = document.getElementById(`plan-off-${id}`);
        if (!card) return;
        if (i.level === 'error') card.classList.add('border-rose-400', 'bg-rose-50/50');
        card.querySelector('[data-plan-flag]').insertAdjacentHTML('beforeend', `<span class="block text-[11px] ${i.level === 'error' ? 'text-rose-700' : 'text-amber-700'} mt-0.5">⚠ ${esc(i.message.split('：')[0])}</span>`);
    }));
    const pct = Math.min(100, c.projected / c.threshold * 100), circ = 2 * Math.PI * 42;
    document.getElementById('planResult').innerHTML = `
        <div class="rounded border ${errors.length ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'} px-4 py-3 flex items-center justify-between gap-2">
            <span class="font-bold ${errors.length ? 'text-rose-800' : 'text-emerald-800'}">${errors.length ? `✕ ${r.verdict}：${errors.length} 個問題` : '✓ ' + r.verdict}</span>
            <span class="text-xs text-slate-600">選了 ${r.chosen.length} 門 · ${c.selected_total} 學分</span>
        </div>
        <div class="rounded border border-slate-200 bg-white p-4 flex items-center gap-4">
            <svg viewBox="0 0 100 100" class="w-28 h-28 shrink-0 -rotate-90" role="img" aria-label="畢業學分進度 ${c.progress_score} 分">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" stroke-width="10"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#8fb0d6" stroke-width="10" stroke-dasharray="${circ * pct / 100} ${circ}"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#003c9d" stroke-width="10" stroke-dasharray="${circ * Math.min(100, c.earned / c.threshold * 100) / 100} ${circ}"/>
            </svg>
            <div class="space-y-1 text-sm">
                <div class="text-xs text-slate-500">學分評分（以 ${c.threshold} 學分為滿分）</div>
                <div class="text-3xl font-bold text-ukn-800 leading-none">${c.progress_score}<span class="text-sm font-normal text-slate-500"> / 100</span></div>
                <div class="text-xs text-slate-600"><span class="inline-block w-2 h-2 rounded-full bg-ukn-700 mr-1"></span>已修及格 ${c.earned} 學分</div>
                <div class="text-xs text-slate-600"><span class="inline-block w-2 h-2 rounded-full bg-ukn-300 mr-1"></span>本學期可採計 +${c.planned} 學分</div>
                <div class="text-xs font-semibold ${c.enough ? 'text-emerald-700' : 'text-slate-800'}">${c.enough ? '✓ 修完就夠畢業學分了' : `還差 ${c.remaining} 學分${c.semesters_needed ? `，照這樣修約需 ${c.semesters_needed} 學期` : ''}`}</div>
            </div>
        </div>
        <div class="rounded border border-slate-200 bg-white p-4 space-y-2">
            <div class="text-xs font-bold text-slate-600">撞修與規定檢查</div>
            ${errors.map(i => `<div class="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded px-2.5 py-1.5">✕ ${esc(i.message)}</div>`).join('')}
            ${warns.map(i => `<div class="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">! ${esc(i.message)}</div>`).join('')}
            ${r.retake.map(o => `<div class="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">✓ 有安排重修：${esc(o.course_name)}</div>`).join('')}
            ${!r.issues.length ? '<div class="text-xs text-emerald-700">沒有衝堂、重複修習或擋修問題 👍</div>' : ''}
            <div class="text-[11px] text-slate-400 pt-1">每學期學分上下限 ${c.min}–${c.max}（請以學則為準）</div>
        </div>`;
    renderPlanTimetable(r.timetable);
}

function renderPlanTimetable(items) {
    const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const cell = (wd, p) => {
        const hits = items.filter(t => t.weekday === wd && t.period_start <= p && t.period_end >= p);
        if (!hits.length) return '<td class="border border-slate-100 h-8"></td>';
        const conflict = hits.length > 1 || hits.some(h => h.conflict);
        return `<td class="border border-slate-100 h-8 px-1 text-[10px] leading-tight ${conflict ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-ukn-100 text-ukn-900'}">${hits.map(h => esc(h.course_name)).join(' / ')}</td>`;
    };
    document.getElementById('planTimetable').innerHTML = `
        <table class="w-full min-w-[520px] table-fixed text-center border-collapse text-xs">
            <thead><tr class="text-slate-500"><th class="w-10"></th>${[1, 2, 3, 4, 5].map(d => `<th class="font-semibold py-1">週${WEEKDAY_TEXT[d]}</th>`).join('')}</tr></thead>
            <tbody>${periods.map(p => `<tr><td class="text-slate-400 text-[10px]">${p}</td>${[1, 2, 3, 4, 5].map(d => cell(d, p)).join('')}</tr>`).join('')}</tbody>
        </table>`;
}

// =====================================================================
// 證照、競賽與作品集
// =====================================================================

async function loadCerts() {
    const body = document.getElementById('certsBody');
    loadCertStats();
    if (!isLoggedIn()) { body.innerHTML = loginPrompt('登入學生帳號即可上傳證照與獎狀。'); return; }
    if (isStaff()) { loadCertReview('待審核'); return; }
    if (currentUser.role === '家長') { body.innerHTML = '<div class="text-sm text-slate-500">家長帳號可在「畢業門檻」查看子女的證照進度。</div>'; return; }
    body.innerHTML = `
        <form onsubmit="submitCert(event)" class="rounded border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">類別</label>
                <select name="kind" onchange="document.getElementById('certAwardRow').classList.toggle('hidden', this.value !== '競賽')" class="w-full border border-slate-300 rounded px-3 py-2 bg-white">
                    <option>證照</option><option>競賽</option><option>作品</option></select></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">名稱 *</label><input name="name" required maxlength="80" placeholder="例如：乙級電腦軟體應用技術士" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">發證 / 主辦單位</label><input name="issuer" maxlength="80" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">取得日期</label><input type="date" name="issue_date" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">證號</label><input name="number" maxlength="60" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div id="certAwardRow" class="hidden"><label class="block text-xs font-semibold text-slate-600 mb-1">名次 / 獎項</label><input name="award" maxlength="60" placeholder="例如：全國第二名" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">說明（作品集可寫作品介紹）</label><textarea name="description" rows="2" maxlength="500" class="w-full border border-slate-300 rounded px-3 py-2"></textarea></div>
            <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">證書 / 獎狀照片或 PDF（最多 4 個，證照與競賽必附）</label><input type="file" name="files" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" class="w-full text-sm"></div>
            <div class="sm:col-span-2 flex items-center justify-between gap-2"><span class="text-[11px] text-slate-500">送出後由班導確認，確認通過才會列入畢業門檻。</span>
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">送出給班導確認</button></div>
        </form>
        <div><h3 class="font-bold text-slate-900 mb-2">我的紀錄</h3><div id="myCertList" class="space-y-2"></div></div>`;
    loadMyCerts();
}

const CERT_TONE = { '已通過': 'green', '待審核': 'amber', '已退回': 'red' };

async function loadMyCerts() {
    try {
        const items = (await api('/api/campus/certs/mine')).data;
        document.getElementById('myCertList').innerHTML = items.length ? items.map(i => `
            <div class="rounded border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2"><span class="text-[11px] text-slate-500 border border-slate-200 rounded px-1">${esc(i.kind)}</span><span class="font-semibold text-slate-900">${esc(i.name)}</span>${statusBadge(i.status, CERT_TONE[i.status])}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">${esc(i.issuer)}${i.issue_date ? ` · ${esc(i.issue_date)}` : ''}${i.award ? ` · ${esc(i.award)}` : ''}${i.reviewer ? ` · 確認：${esc(i.reviewer)}` : ''}</div>
                    ${i.review_note ? `<div class="text-xs text-rose-700 mt-1">班導意見：${esc(i.review_note)}</div>` : ''}
                </div>
                <div class="flex items-center gap-2 flex-wrap">${fileLinks(i.files)}
                    ${i.status !== '已通過' ? `<button type="button" onclick="deleteCert(${Number(i.id)})" class="text-xs text-rose-700 border border-rose-200 rounded px-2 py-1 hover:bg-rose-50">刪除</button>` : ''}</div>
            </div>`).join('') : '<div class="text-sm text-slate-500">還沒有上傳紀錄。</div>';
    } catch (e) { toast(e.message, 'error'); }
}

async function submitCert(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button');
    btn.disabled = true;
    try {
        const res = await fetch('/api/campus/certs', { method: 'POST', body: new FormData(event.target) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast(data.message);
        event.target.reset();
        loadMyCerts();
    } catch (e) { toast(e.message, 'error'); }
    btn.disabled = false;
}

async function deleteCert(id) {
    if (!confirm('確定刪除這筆紀錄？')) return;
    try { await api(`/api/campus/certs/${id}`, { method: 'DELETE' }); toast('已刪除'); loadMyCerts(); }
    catch (e) { toast(e.message, 'error'); }
}

async function loadCertReview(status) {
    const body = document.getElementById('certsBody');
    try {
        const r = await api(`/api/campus/certs/review?status=${encodeURIComponent(status)}`);
        body.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="text-sm text-slate-600">確認範圍：<strong>${esc(r.scope || '—')}</strong></div>
                <div class="flex gap-1 text-xs">${['待審核', '已通過', '已退回', '全部'].map(s => `<button type="button" onclick="loadCertReview('${s}')" class="px-2.5 py-1 rounded border ${s === status ? 'bg-ukn-800 text-white border-ukn-800' : 'border-slate-300'}">${s}</button>`).join('')}</div>
            </div>
            <div class="space-y-3">${r.data.length ? r.data.map(i => `
                <div class="rounded border border-slate-200 p-4 space-y-2">
                    <div class="flex flex-wrap items-center gap-2"><span class="font-bold text-slate-900">${esc(i.student_name)}</span><span class="text-xs text-slate-500">${esc(i.student_id)} · ${esc(i.class_name)}</span>${statusBadge(i.status, CERT_TONE[i.status])}</div>
                    <div class="text-sm"><span class="text-[11px] text-slate-500 border border-slate-200 rounded px-1 mr-1">${esc(i.kind)}</span><strong>${esc(i.name)}</strong> ${esc(i.award)}</div>
                    <div class="text-xs text-slate-500">${esc(i.issuer)} ${i.number ? `· 證號 ${esc(i.number)}` : ''} ${i.issue_date ? `· ${esc(i.issue_date)}` : ''} · 送出 ${esc(i.created_at.slice(0, 16))}</div>
                    ${i.description ? `<p class="text-xs text-slate-700">${esc(i.description)}</p>` : ''}
                    <div class="flex flex-wrap gap-2">${fileLinks(i.files) || '<span class="text-xs text-slate-400">沒有附檔</span>'}</div>
                    ${i.status === '待審核' ? `
                        <div class="flex flex-col sm:flex-row gap-2 pt-1">
                            <input id="certNote-${i.id}" placeholder="退回原因（退回時必填）" class="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm">
                            <button type="button" onclick="reviewCert(${i.id}, 'approve')" class="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded px-4 py-1.5 text-sm">✓ 確認</button>
                            <button type="button" onclick="reviewCert(${i.id}, 'reject')" class="border border-rose-300 text-rose-700 rounded px-4 py-1.5 text-sm hover:bg-rose-50">退回</button>
                        </div>` : i.review_note ? `<div class="text-xs text-slate-500">意見：${esc(i.review_note)}</div>` : ''}
                </div>`).join('') : '<div class="text-sm text-slate-500">目前沒有資料。</div>'}</div>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

async function reviewCert(id, action) {
    const note = document.getElementById(`certNote-${id}`)?.value || '';
    try {
        const r = await api(`/api/campus/certs/${id}/review`, { json: { action, note } });
        toast(r.message);
        loadCertReview('待審核');
        loadCertStats();
    } catch (e) { toast(e.message, 'error'); }
}

async function loadCertStats() {
    const box = document.getElementById('certStatsBody');
    try {
        const r = await api('/api/campus/certs/stats');
        const bars = (rows, label) => rows.length ? `
            <div class="space-y-2.5">${rows.map(b => `
                <div>
                    <div class="flex items-center justify-between text-xs mb-1 gap-2">
                        <span class="font-semibold text-slate-800">${esc(b.name)} ${b.mine ? '<span class="text-[10px] border border-ukn-300 text-ukn-700 px-1.5 rounded font-bold ml-1">我有</span>' : ''}</span>
                        <span class="text-slate-600 whitespace-nowrap">${b.holders} 人 · ${b.percent}%</span>
                    </div>
                    <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden" title="${esc(b.name)}：${b.holders} / ${r.cohort_size} 人">
                        <div class="h-full rounded-full ${b.mine ? 'bg-ukn-700' : 'bg-ukn-300'}" style="width:${Math.max(3, b.percent)}%"></div>
                    </div>
                </div>`).join('')}</div>` : `<div class="text-xs text-slate-500">同年級目前還沒有已確認的${label}紀錄。</div>`;
        box.innerHTML = `
            <p class="text-xs text-slate-500 mb-3">${r.admission_year ? `${r.admission_year} 學年度入學` : '全校'}共 ${r.cohort_size} 人 · 只計算班導已確認的紀錄${r.pending_count ? `（另有 ${r.pending_count} 筆待確認）` : ''}</p>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div><h4 class="text-xs font-bold text-slate-600 mb-2">證照</h4>${bars(r.certificates, '證照')}</div>
                <div><h4 class="text-xs font-bold text-slate-600 mb-2">競賽得獎</h4>${bars(r.competitions, '競賽')}</div>
            </div>`;
    } catch (e) { box.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}
