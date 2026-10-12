// Smart UKN 新功能畫面：行事曆月曆、AI 智慧校規、選課檢查、證照審核、獎助學金、宿舍與總務、
// 教室 / 櫃子租借、校園地圖與老師辦公室、天氣交通、人流、班級通知。
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
        'tab-rent': () => {
            loadRooms();
            // 櫃子是學生用的，老師 / 行政人員只看教室借用 (櫃子繳費在後台處理)
            if (isStaff()) document.getElementById('lockersBody').closest('section').classList.add('hidden');
            else loadLockers();
        },
        'tab-map': () => { loadMap(); loadTeachers(); },
        'tab-traffic': () => { loadWeatherDetail(); loadTransport(); },
        'tab-crowd': loadCrowd,
        'tab-notices': loadNotices,
        'tab-myschedule': loadMySchedule,
        'tab-classattend': () => loadClassAttendance(),
        'tab-counseling': () => loadCounseling(),
    });
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
const CAL_KNOWN = ['申辦', '考試', '繳費', '放假', '活動', '教務', '獎助', '個人', '班務'];

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

function setupCalendarLegend() {
    if (!isStaff()) return;
    document.querySelectorAll('[data-cal-student]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[data-cal-staff]').forEach(el => { el.classList.remove('hidden'); el.classList.add('flex'); });
}

async function refreshCalendar() {
    setupCalendarLegend();
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
    document.getElementById('calSourceNote').textContent = '國定假日：行政院人事行政總處辦公日曆表（自動抓取）· 學校事項：' + (isStaff() ? '校曆 · 班務：導師班請假與我發的通知期限' : '校曆與申辦期限')
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
    if (e.detail?.goto) {
        body += `<button type="button" onclick="closeModal(); switchTab('${esc(e.detail.goto.tab)}')" class="text-xs bg-ukn-800 text-white rounded px-2 py-1">${esc(e.detail.goto.label)} ➔</button>`;
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
        <div id="certExemptionReminder"></div>
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
        <details class="rounded border border-amber-200 bg-amber-50 p-4 text-sm">
            <summary class="cursor-pointer font-bold text-amber-900">💡 小提醒：證照可以怎麼寫進自傳／履歷？</summary>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-xs text-amber-900">
                <li>寫出具體分數／級別與取得日期，比只寫證照名稱更有說服力（例如「多益 650 分，2026/10 取得」）。</li>
                <li>搭配一句你實際「用這項技能做過什麼」，例如做過的作業、專題或打工經驗，讓證照跟能力連起來。</li>
                <li>想考自己想要的證照（不一定是班導要求的）也可以上傳在這裡，之後寫自傳、找實習都用得到。</li>
            </ul>
        </details>
        <div><h3 class="font-bold text-slate-900 mb-2">我的紀錄</h3><div id="myCertList" class="space-y-2"></div></div>`;
    loadMyCerts();
    loadCertExemptionReminder();
}

async function loadCertExemptionReminder() {
    const box = document.getElementById('certExemptionReminder');
    if (!box) return;
    try {
        const items = (await api('/api/campus/certs/exemption-reminder')).data;
        if (!items.length) { box.innerHTML = ''; return; }
        box.innerHTML = `<div class="rounded border border-ukn-200 bg-ukn-50 p-4 text-sm space-y-1.5">
            <div class="font-bold text-ukn-900">📣 這些證照現在就有管道可以考，考到還能申請學分抵免：</div>
            ${items.map(r => `<div class="text-xs text-ukn-800">・<strong>${esc(r.label)}</strong> → 可抵免「${esc(r.exempts_course)}」共 ${r.credits} 學分（${esc(r.note)}申請請洽 ${esc(r.office)}）</div>`).join('')}
        </div>`;
    } catch (e) { /* 非必要功能，失敗就不顯示 */ }
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


// =====================================================================
// 我的課表 (老師)：使用 /api/campus/teachers (課表來自 class_schedule、Office Hour 來自教師辦公室資料)
// =====================================================================

async function loadMySchedule() {
    const body = document.getElementById('myScheduleBody');
    try {
        const r = await api('/api/campus/teachers');
        const myName = currentUser.full_name.replace(/\s*老師$/, '');
        const me = r.data.find(t => t.name === myName);
        if (!me) { body.innerHTML = '<div class="text-sm text-slate-500">系統裡還沒有你的授課資料，請洽教務處建立。</div>'; return; }
        const periods = Object.entries(r.periods).map(([p, [s, e]]) => ({ p: Number(p), s, e }));
        const today = new Date().getDay() || 7;
        const days = [1, 2, 3, 4, 5];
        const hours = me.timetable.reduce((n, c) => n + c.period_end - c.period_start + 1, 0);
        const classes = [...new Set(me.timetable.map(c => c.class_name))];
        const isOfficeHour = (d, per) => me.office_hours.some(o => o.weekday === d && o.start <= per.s && per.e <= o.end);
        const stateTone = { '上課中': 'bg-rose-100 text-rose-800', '晤談時間': 'bg-emerald-100 text-emerald-800' }[me.status.state] || 'bg-slate-100 text-slate-700';
        const rows = periods.map(per => `<tr>
            <th class="p-2 text-left align-top whitespace-nowrap bg-slate-50 border border-slate-200"><div class="text-xs font-bold text-slate-700">第 ${per.p} 節</div><div class="text-[10px] text-slate-500">${per.s}–${per.e}</div></th>
            ${days.map(d => {
                const c = me.timetable.find(x => x.weekday === d && x.period_start <= per.p && per.p <= x.period_end);
                if (c && c.period_start !== per.p) return '';
                const todayCls = d === today ? ' bg-ukn-50/40' : '';
                if (c) return `<td rowspan="${c.period_end - c.period_start + 1}" class="p-2 align-top border border-slate-200 bg-ukn-50${todayCls}">
                    <div class="text-sm font-bold text-ukn-900">${esc(c.course_name)}</div>
                    <div class="text-[11px] text-slate-600 mt-0.5">${esc(c.class_name)} · ${esc(c.classroom)}</div></td>`;
                return `<td class="p-2 align-top border border-slate-200${todayCls}">${isOfficeHour(d, per) ? `<span class="text-[11px] text-emerald-700 font-semibold">Office Hour</span><div class="text-[10px] text-slate-500">${esc(me.office)}</div>` : ''}</td>`;
            }).join('')}</tr>`).join('');
        body.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="bg-slate-50 p-3 rounded border border-slate-200"><div class="text-slate-500">現在</div>
                    <div class="mt-1"><span class="font-bold px-2 py-0.5 rounded ${stateTone}">${esc(me.status.state)}</span></div>
                    <div class="text-slate-600 mt-1">${esc(me.status.detail)}</div></div>
                <div class="bg-slate-50 p-3 rounded border border-slate-200"><div class="text-slate-500">本週授課</div>
                    <div class="text-lg font-bold text-slate-800 mt-0.5">${hours} 節 · ${me.timetable.length} 門課</div>
                    <div class="text-slate-600">${classes.map(esc).join('、') || '—'}</div></div>
                <div class="bg-slate-50 p-3 rounded border border-slate-200"><div class="text-slate-500">Office Hour · ${esc(me.office)}</div>
                    ${me.office_hours.map(o => `<div class="text-slate-800 mt-0.5">週${WEEKDAY_TEXT[o.weekday]} ${o.start}–${o.end}</div>`).join('') || '<div class="text-slate-500 mt-0.5">尚未設定</div>'}</div>
            </div>
            <div class="overflow-x-auto"><table class="w-full min-w-[640px] border-collapse text-left">
                <thead><tr><th class="p-2 bg-slate-50 border border-slate-200 w-20"></th>${days.map(d => `<th class="p-2 text-xs text-center border border-slate-200 ${d === today ? 'bg-ukn-800 text-white' : 'bg-slate-50 text-slate-700'}">週${WEEKDAY_TEXT[d]}${d === today ? '（今天）' : ''}</th>`).join('')}</tr></thead>
                <tbody>${rows}</tbody></table></div>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

// =====================================================================
// 班級出缺勤 (T13)：班導看導師班；教職員 / 管理員可切換班級
//   資料：GET /api/teacher/class-attendance；提醒：POST /api/campus/notices (只發給該生)
// =====================================================================

const ATTEND_LEVEL = {
    banned: { text: '已達扣考', badge: 'bg-rose-600 text-white', row: 'bg-rose-50/60' },
    warning: { text: '快扣考', badge: 'bg-amber-500 text-white', row: 'bg-amber-50/50' },
    ok: { text: '正常', badge: 'bg-emerald-100 text-emerald-800', row: '' },
};
let classAttendData = null;

async function loadClassAttendance(className) {
    const body = document.getElementById('classAttendBody');
    body.innerHTML = '<div class="text-sm text-slate-500">讀取中…</div>';
    try {
        const d = await api('/api/teacher/class-attendance' + (className ? `?class_name=${encodeURIComponent(className)}` : ''));
        classAttendData = d;
        document.getElementById('classAttendTitle').textContent = `班級出缺勤：${d.class_name}`;
        const picker = document.getElementById('classAttendPicker');
        picker.classList.toggle('hidden', d.classes.length <= 1);
        picker.innerHTML = d.classes.map(c => `<option ${c === d.class_name ? 'selected' : ''}>${esc(c)}</option>`).join('');
        renderClassAttendance();
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

// 篩選：上方四格可以點；搜尋框打名字或學號
const attendFilter = { kind: 'all', q: '' };
const ATTEND_FILTERS = {
    all: { label: '全部', test: () => true },
    banned: { label: '已達扣考', test: st => st.level === 'banned' },
    warning: { label: '快扣考', test: st => st.level === 'warning' },
    recent: { label: '近 7 天有曠課', test: st => st.recent_absent > 0 },
    absent: { label: '本學期有曠課', test: st => st.totals['曠課'] > 0 },
    full: { label: '全勤', test: st => !st.totals['曠課'] && !st.totals['遲到'] && !st.totals['病假'] },
};

function setAttendFilter(kind) {
    attendFilter.kind = attendFilter.kind === kind ? 'all' : kind;  // 再點一次取消
    renderClassAttendance();
}

function renderClassAttendance() {
    const d = classAttendData, s = d.summary;
    const counts = Object.fromEntries(Object.entries(ATTEND_FILTERS).map(([k, f]) => [k, d.students.filter(f.test).length]));
    const tile = (kind, label, value, tone) => {
        const on = attendFilter.kind === kind;
        return `<button type="button" onclick="setAttendFilter('${kind}')" aria-pressed="${on}"
            class="text-left rounded border p-4 transition ${tone} ${on ? 'ring-2 ring-ukn-700 ring-offset-1' : 'hover:shadow'}">
            <div class="text-xs font-semibold flex justify-between gap-2"><span>${label}</span><span class="font-normal opacity-70">${on ? '✓ 篩選中' : '點一下篩選'}</span></div>
            <div class="text-2xl font-bold mt-1">${value}</div></button>`;
    };
    document.getElementById('classAttendBody').innerHTML = `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            ${tile('banned', '已達扣考', `${s.banned} 人`, s.banned ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-700')}
            ${tile('warning', '快扣考', `${s.warning} 人`, s.warning ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700')}
            ${tile('recent', '近 7 天曠課', `${s.recent_absent} 次 · ${counts.recent} 人`, 'border-slate-200 text-slate-700')}
            ${tile('absent', '本學期曠課', `${s.absent_total} 次 · ${counts.absent} 人`, 'border-slate-200 text-slate-700')}
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <input id="attendSearch" type="search" value="${esc(attendFilter.q)}" placeholder="🔍 搜尋姓名或學號" oninput="attendFilter.q = this.value; renderAttendTable()"
                class="flex-1 min-w-[12rem] border border-slate-300 rounded px-3 py-2 text-sm">
            ${Object.entries(ATTEND_FILTERS).map(([k, f]) => `<button type="button" onclick="setAttendFilter('${k}')"
                class="text-xs font-semibold rounded-full border px-3 py-1.5 ${attendFilter.kind === k ? 'bg-ukn-800 border-ukn-800 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}">${f.label} ${counts[k]}</button>`).join('')}
        </div>
        <div id="attendTable"></div>`;
    renderAttendTable();
}

function renderAttendTable() {
    const d = classAttendData;
    const q = attendFilter.q.trim().toLowerCase();
    const rows = d.students.map((st, i) => [st, i])
        .filter(([st]) => ATTEND_FILTERS[attendFilter.kind].test(st))
        .filter(([st]) => !q || st.full_name.toLowerCase().includes(q) || st.student_id.toLowerCase().includes(q));
    const box = document.getElementById('attendTable');
    if (!d.students.length) { box.innerHTML = '<div class="text-sm text-slate-500">這個班級目前沒有學生資料。</div>'; return; }
    box.innerHTML = `<div class="text-xs text-slate-500 mb-2">顯示 ${rows.length} / ${d.students.length} 位學生</div>` + (rows.length ? `<div class="overflow-x-auto"><table class="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead><tr class="bg-slate-50 text-slate-600 text-xs">
            <th class="p-2 border border-slate-200">學生</th><th class="p-2 border border-slate-200">狀態</th>
            <th class="p-2 border border-slate-200 text-center">曠課</th><th class="p-2 border border-slate-200 text-center">遲到</th><th class="p-2 border border-slate-200 text-center">病假</th>
            <th class="p-2 border border-slate-200">要注意的科目</th><th class="p-2 border border-slate-200">最近紀錄</th><th class="p-2 border border-slate-200"></th></tr></thead>
        <tbody>${rows.map(([st, i]) => {
            const lv = ATTEND_LEVEL[st.level];
            return `<tr class="${lv.row}">
                <td class="p-2 border border-slate-200"><div class="font-semibold text-slate-900">${esc(st.full_name)}</div><div class="text-xs text-slate-500">${esc(st.student_id)}</div></td>
                <td class="p-2 border border-slate-200"><span class="inline-block text-xs font-bold rounded px-2 py-0.5 ${lv.badge}">${lv.text}</span></td>
                <td class="p-2 border border-slate-200 text-center font-bold ${st.totals['曠課'] ? 'text-rose-700' : 'text-slate-400'}">${st.totals['曠課']}${st.recent_absent ? `<div class="text-[11px] font-normal text-rose-700">近 7 天 ${st.recent_absent}</div>` : ''}</td>
                <td class="p-2 border border-slate-200 text-center ${st.totals['遲到'] ? 'text-slate-800' : 'text-slate-400'}">${st.totals['遲到']}</td>
                <td class="p-2 border border-slate-200 text-center ${st.totals['病假'] ? 'text-slate-800' : 'text-slate-400'}">${st.totals['病假']}</td>
                <td class="p-2 border border-slate-200">${st.risk_courses.length ? st.risk_courses.map(c => `<div class="text-xs"><span class="font-semibold">${esc(c.course_name)}</span>：曠 ${c.absent_hours} / ${c.exam_ban_threshold_hours} 小時${c.level === 'banned' ? ' <span class="text-rose-700 font-bold">已扣考</span>' : `，再 ${c.remaining_hours} 小時扣考`}</div>`).join('') : '<span class="text-xs text-slate-400">—</span>'}</td>
                <td class="p-2 border border-slate-200 text-xs text-slate-500">${st.last_date ? mmdd(st.last_date) : '—'}</td>
                <td class="p-2 border border-slate-200 text-right whitespace-nowrap">${st.level !== 'ok' || st.totals['曠課'] ? `<button type="button" onclick="remindAttendance(${i})" class="text-xs font-bold border border-ukn-300 text-ukn-800 hover:bg-ukn-50 rounded px-2.5 py-1">📣 提醒</button>` : ''}
                    <button type="button" onclick="counselFromAttendance(${i})" class="text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded px-2.5 py-1 ml-1">📝 記一筆</button></td>
            </tr>`;
        }).join('')}</tbody></table></div>` : '<div class="text-sm text-slate-500 rounded border border-dashed border-slate-300 p-6 text-center">沒有符合的學生</div>');
}

// 用「班級通知」只發給這位學生；已扣考發緊急，其餘發重要
async function remindAttendance(index) {
    const st = classAttendData.students[index];
    const courses = st.risk_courses.map(c => c.level === 'banned'
        ? `「${c.course_name}」已曠課 ${c.absent_hours} 小時，達到扣考門檻`
        : `「${c.course_name}」已曠課 ${c.absent_hours} 小時，再 ${c.remaining_hours} 小時就會扣考`);
    const content = `${st.full_name} 同學您好：\n${courses.length ? courses.join('；\n') + '。' : `本學期已曠課 ${st.totals['曠課']} 次。`}\n請注意出席；如果是請假，記得盡快補辦假單。有困難可以來找導師談。`;
    if (!confirm(`要用「班級通知」提醒 ${st.full_name} 嗎？\n\n${content}`)) return;
    try {
        const r = await api('/api/campus/notices', { json: {
            class_name: classAttendData.class_name, recipients: [st.student_id], title: '出缺勤提醒',
            content, priority: st.level === 'banned' ? '緊急' : '重要', due_date: '' } });
        toast(`已提醒 ${st.full_name}`);
        return r;
    } catch (e) { toast(e.message, 'error'); }
}

// =====================================================================
// 導生關懷紀錄 (T14)：班導記錄晤談與後續追蹤；教職員 / 管理員可切換班級
//   GET/POST /api/campus/counseling、PUT/DELETE /api/campus/counseling/<id>、匯出 /api/campus/counseling/export.csv
// =====================================================================

const counselState = { className: '', student: '', editing: null, presetTopic: '', data: null };
const TOPIC_TONE = { '學業': 'bg-sky-100 text-sky-800', '出缺勤': 'bg-amber-100 text-amber-900', '生活': 'bg-emerald-100 text-emerald-800',
    '生涯': 'bg-violet-100 text-violet-800', '家庭': 'bg-orange-100 text-orange-800', '身心': 'bg-rose-100 text-rose-800', '其他': 'bg-slate-100 text-slate-700' };

// 從「班級出缺勤」按「記一筆」：直接帶入學生，主題預設出缺勤
function counselFromAttendance(index) {
    const st = classAttendData.students[index];
    Object.assign(counselState, { className: classAttendData.class_name, student: st.student_id, editing: null, presetTopic: '出缺勤' });
    switchTab('tab-counseling');
    loadCounseling(classAttendData.class_name);
}

async function loadCounseling(className) {
    if (className !== undefined) counselState.className = className;
    const body = document.getElementById('counselBody');
    body.innerHTML = '<div class="text-sm text-slate-500">讀取中…</div>';
    try {
        const q = counselState.className ? `?class_name=${encodeURIComponent(counselState.className)}` : '';
        const d = await api('/api/campus/counseling' + q);
        counselState.data = d;
        counselState.className = d.class_name;
        document.getElementById('counselTitle').textContent = `導生關懷紀錄：${d.class_name}`;
        const picker = document.getElementById('counselPicker');
        picker.classList.toggle('hidden', d.classes.length <= 1);
        picker.innerHTML = d.classes.map(c => `<option ${c === d.class_name ? 'selected' : ''}>${esc(c)}</option>`).join('');
        document.getElementById('counselExport').href = `/api/campus/counseling/export.csv?class_name=${encodeURIComponent(d.class_name)}`;
        renderCounseling();
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function renderCounseling() {
    const d = counselState.data, s = d.summary;
    const records = d.data.filter(r => !counselState.student || r.student_id === counselState.student);
    const tile = (label, value, tone) => `<div class="rounded border ${tone} p-4"><div class="text-xs font-semibold">${label}</div><div class="text-2xl font-bold mt-1">${value}</div></div>`;
    const studentBtn = st => {
        const on = st.student_id === counselState.student;
        return `<button type="button" onclick="counselState.student = '${esc(st.student_id)}'; counselState.editing = null; renderCounseling()"
            class="w-full text-left rounded border px-3 py-2 text-sm ${on ? 'border-ukn-700 bg-ukn-50' : 'border-slate-200 hover:border-ukn-300'}">
            <div class="flex items-center justify-between gap-2"><span class="font-semibold text-slate-900">${esc(st.full_name)}</span>
                ${st.pending ? `<span class="text-[11px] font-bold rounded px-1.5 py-0.5 bg-amber-500 text-white">待追蹤 ${st.pending}</span>` : ''}</div>
            <div class="text-xs ${st.count ? 'text-slate-500' : 'text-amber-800'}">${st.count ? `談過 ${st.count} 次 · 最近 ${mmdd(st.last_date)}` : '這學期還沒談過'}</div></button>`;
    };
    document.getElementById('counselBody').innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${tile('已關懷學生', `${s.cared} / ${s.student_count} 位`, s.cared < s.student_count ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-emerald-300 bg-emerald-50 text-emerald-800')}
            ${tile('本學期晤談', `${s.record_count} 次`, 'border-slate-200 text-slate-700')}
            ${tile('待追蹤', `${s.pending} 件`, s.pending ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-700')}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="space-y-2">
                <h3 class="font-bold text-slate-900 text-sm">學生</h3>
                <button type="button" onclick="counselState.student = ''; counselState.editing = null; renderCounseling()" class="w-full text-left rounded border px-3 py-2 text-sm ${counselState.student ? 'border-slate-200 hover:border-ukn-300' : 'border-ukn-700 bg-ukn-50 font-semibold'}">全班</button>
                ${d.students.map(studentBtn).join('') || '<div class="text-sm text-slate-500">這個班級沒有學生資料。</div>'}
            </div>
            <div class="lg:col-span-2 space-y-4">
                ${counselFormHtml()}
                <div class="space-y-2">
                    <h3 class="font-bold text-slate-900">${counselState.student ? `${esc((d.students.find(x => x.student_id === counselState.student) || {}).full_name || '')} 的紀錄` : '全班紀錄'}</h3>
                    ${records.length ? records.map(counselCardHtml).join('') : '<div class="text-sm text-slate-500">還沒有紀錄。</div>'}
                </div>
            </div>
        </div>`;
}

function counselFormHtml() {
    const d = counselState.data;
    const r = counselState.editing ? d.data.find(x => x.id === counselState.editing) : null;
    const sid = r ? r.student_id : counselState.student;
    const topic = r ? r.topic : (counselState.presetTopic || '學業');
    const method = r ? r.method : '面談';
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return `
        <form onsubmit="saveCounseling(event)" class="rounded border ${r ? 'border-ukn-700' : 'border-slate-200'} bg-slate-50 p-4 space-y-3 text-sm">
            <div class="font-bold text-slate-900">${r ? '修改紀錄' : '記一筆晤談'}</div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select name="student_id" required ${r ? 'disabled' : ''} class="border border-slate-300 rounded px-3 py-2 bg-white">
                    <option value="">選擇學生</option>${d.students.map(st => `<option value="${esc(st.student_id)}" ${st.student_id === sid ? 'selected' : ''}>${esc(st.full_name)}</option>`).join('')}</select>
                <input type="date" name="talk_date" value="${r ? r.talk_date : today}" class="border border-slate-300 rounded px-3 py-2">
                <select name="topic" class="border border-slate-300 rounded px-3 py-2 bg-white">${d.topics.map(t => `<option ${t === topic ? 'selected' : ''}>${t}</option>`).join('')}</select>
            </div>
            <div class="flex flex-wrap items-center gap-3"><span class="text-xs font-semibold text-slate-600">方式</span>
                ${d.methods.map(m => `<label class="flex items-center gap-1"><input type="radio" name="method" value="${m}" ${m === method ? 'checked' : ''}> ${m}</label>`).join('')}</div>
            <textarea name="content" required rows="3" maxlength="2000" placeholder="談了什麼、學生的狀況、給了什麼建議" class="w-full border border-slate-300 rounded px-3 py-2">${r ? esc(r.content) : ''}</textarea>
            <div class="flex flex-wrap items-center gap-2">
                <label class="flex items-center gap-1.5 font-semibold text-slate-700"><input type="checkbox" name="follow_up" ${r && r.follow_up ? 'checked' : ''}> 需要追蹤</label>
                <input name="follow_up_note" maxlength="200" value="${r ? esc(r.follow_up_note || '') : ''}" placeholder="要追蹤什麼，例如：下週確認有沒有補請假" class="flex-1 min-w-[12rem] border border-slate-300 rounded px-3 py-1.5">
            </div>
            <div class="flex justify-end gap-2">
                ${r ? '<button type="button" onclick="counselState.editing = null; renderCounseling()" class="border border-slate-300 rounded px-4 py-2">取消</button>' : ''}
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">${r ? '儲存修改' : '儲存紀錄'}</button>
            </div>
        </form>`;
}

function counselCardHtml(r) {
    const follow = r.follow_up
        ? (r.follow_up_done ? `<span class="text-xs text-emerald-700 font-semibold">✓ 已追蹤：${esc(r.follow_up_note || '')}</span>`
            : `<span class="text-xs font-bold text-rose-700">待追蹤：${esc(r.follow_up_note || '（未填）')}</span>
               ${r.can_edit ? `<button type="button" onclick="counselDone(${r.id})" class="text-xs border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded px-2 py-0.5 ml-1">標記完成</button>` : ''}`)
        : '';
    return `<div class="rounded border ${r.follow_up && !r.follow_up_done ? 'border-l-4 border-l-rose-500 border-slate-200' : 'border-slate-200'} px-4 py-3 space-y-1">
        <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="font-bold text-slate-900 text-sm">${esc(r.full_name)}</span>
            <span class="text-slate-500">${esc(r.talk_date)} · ${esc(r.method)}</span>
            <span class="font-bold rounded px-1.5 py-0.5 ${TOPIC_TONE[r.topic] || TOPIC_TONE['其他']}">${esc(r.topic)}</span>
            <span class="text-slate-400 ml-auto">${esc(r.counselor_name)}</span>
        </div>
        <p class="text-sm text-slate-700 whitespace-pre-line">${esc(r.content)}</p>
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div>${follow}</div>
            ${r.can_edit ? `<div class="text-xs"><button type="button" onclick="counselState.editing = ${r.id}; renderCounseling(); document.getElementById('counselBody').scrollIntoView({ behavior: 'smooth' })" class="text-ukn-700 hover:underline">修改</button>
                <button type="button" onclick="deleteCounseling(${r.id})" class="text-slate-500 hover:text-rose-700 ml-2">刪除</button></div>` : ''}
        </div>
    </div>`;
}

async function saveCounseling(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const body = { talk_date: fd.get('talk_date'), method: fd.get('method'), topic: fd.get('topic'), content: fd.get('content'),
        follow_up: fd.get('follow_up') === 'on', follow_up_note: fd.get('follow_up_note') };
    try {
        let r;
        if (counselState.editing) {
            r = await api(`/api/campus/counseling/${counselState.editing}`, { method: 'PUT', json: body });
        } else {
            r = await api('/api/campus/counseling', { json: { ...body, student_id: fd.get('student_id') } });
            counselState.student = fd.get('student_id');
        }
        toast(r.message);
        Object.assign(counselState, { editing: null, presetTopic: '' });
        loadCounseling();
    } catch (e) { toast(e.message, 'error'); }
}

async function counselDone(id) {
    try { await api(`/api/campus/counseling/${id}`, { method: 'PUT', json: { follow_up_done: true } }); toast('已標記追蹤完成'); loadCounseling(); }
    catch (e) { toast(e.message, 'error'); }
}

async function deleteCounseling(id) {
    if (!confirm('確定刪除這筆紀錄？刪除後無法復原。')) return;
    try { await api(`/api/campus/counseling/${id}`, { method: 'DELETE' }); toast('已刪除'); loadCounseling(); }
    catch (e) { toast(e.message, 'error'); }
}
