// Smart UKN 新功能畫面 (校務申請、校園生活與社群)：獎助學金檢核、宿舍與總務、教室 / 櫃子租借、
// 校園地圖與老師辦公室、天氣交通、班級通知。
// 依賴 campus-shell.js 與 campus-features.js 的共用函式 (api、toast、esc、statusBadge…)。

// =====================================================================
// 獎助學金資格自我檢核
// =====================================================================

let scholarshipData = [];
let scholarshipAuto = null;
let scholarshipCategory = '';

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
                ${s.status !== '不符合' ? `<div class="flex flex-wrap gap-x-3 text-xs">
                    <a href="/scholarship/${Number(s.id)}/form-template" target="_blank" rel="noopener" class="text-ukn-700 hover:underline">📄 下載申請表範本</a>
                    <a href="/scholarship/${Number(s.id)}/form-template?mode=sample" target="_blank" rel="noopener" class="text-ukn-700 hover:underline">看填寫範例（含示範印章）</a>
                </div>` : ''}
                ${r.can_apply && s.status === '符合' ? schApplyForm(s) : ''}
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

// ---------- 線上申請：上傳文件 → 審核 → 電子章核定通知 (scholarship_apply 套件) ----------

const SCH_MAX_MB = 5, SCH_MAX_FILES = 5, SCH_MAX_TOTAL_MB = 15;
const SCH_STATUS_TONE = { '審核中': 'blue', '已核准': 'green', '已退回': 'red', '已撤回': 'gray' };
const schSize = b => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

function schApplyForm(s) {
    return `
        <details class="rounded border border-ukn-200 bg-ukn-50/40">
            <summary class="cursor-pointer select-none px-3 py-1.5 text-xs font-bold text-ukn-800">📎 在系統線上申請（上傳證明文件）</summary>
            <form onsubmit="submitScholarshipApply(event, ${Number(s.id)})" class="p-3 space-y-2 text-xs">
                <div class="text-slate-600">需要檢附：${(s.required_docs || []).map(esc).join('、')}</div>
                <input type="file" name="files" multiple required accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" class="block w-full text-xs">
                <div class="text-[11px] text-slate-500">PDF、JPG、PNG，每個檔案 ${SCH_MAX_MB} MB 以內，最多 ${SCH_MAX_FILES} 個，合計 ${SCH_MAX_TOTAL_MB} MB 以內</div>
                <input name="note" maxlength="300" placeholder="備註（選填）" class="w-full border border-slate-300 rounded px-2 py-1.5">
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-3 py-1.5">送出申請</button>
            </form>
        </details>`;
}

async function submitScholarshipApply(e, schId) {
    e.preventDefault();
    const form = e.target;
    const files = [...form.files.files];
    // 先在瀏覽器擋一次，免得等上傳完才知道太大；後端還會再檢查
    if (files.length > SCH_MAX_FILES) return toast(`最多上傳 ${SCH_MAX_FILES} 個檔案`, 'error');
    const big = files.find(f => f.size > SCH_MAX_MB * 1048576);
    if (big) return toast(`「${big.name}」超過 ${SCH_MAX_MB} MB（目前 ${schSize(big.size)}），請壓縮後再上傳`, 'error');
    const total = files.reduce((n, f) => n + f.size, 0);
    if (total > SCH_MAX_TOTAL_MB * 1048576) return toast(`檔案合計超過 ${SCH_MAX_TOTAL_MB} MB（目前 ${schSize(total)}），請壓縮或分開送件`, 'error');
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = '上傳中…';
    try {
        const r = await api(`/api/scholarships/${schId}/apply`, { method: 'POST', body: new FormData(form) });
        toast(r.message);
        form.closest('details').open = false;
        form.reset();
        loadScholarshipApps();
    } catch (err) { toast(err.message, 'error'); }
    btn.disabled = false;
    btn.textContent = '送出申請';
}

function schAppCard(a, staff) {
    const files = a.files.map(f => `<a href="${esc(f.url)}" target="_blank" rel="noopener" class="block text-ukn-700 hover:underline">📄 ${esc(f.name)} <span class="text-slate-400">${schSize(f.size)}</span></a>`).join('');
    const stamp = a.stamp ? `<div class="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">🔴 已蓋電子章：${esc(a.stamp.no)} · 驗證碼 <span class="font-mono">${esc(a.stamp.code)}</span></div>` : '';
    const actions = staff && a.status === '審核中' ? `
        <div class="flex flex-wrap gap-2 pt-1">
            <input id="schReviewNote${a.id}" maxlength="200" placeholder="審核意見（退回必填）" class="flex-1 min-w-[12rem] border border-slate-300 rounded px-2 py-1.5 text-xs">
            <button onclick="reviewScholarshipApp(${a.id}, 'approve')" class="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded px-3 py-1.5">核准並蓋章</button>
            <button onclick="reviewScholarshipApp(${a.id}, 'reject')" class="text-xs bg-rose-700 hover:bg-rose-800 text-white font-bold rounded px-3 py-1.5">退回</button>
        </div>` : '';
    return `
        <div class="rounded border border-slate-200 p-3 space-y-2">
            <div class="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <div class="font-bold text-sm text-slate-900">${esc(a.scholarship_name)}</div>
                    <div class="text-[11px] text-slate-500">${staff ? `${esc(a.student_id)} ${esc(a.student_name)} ${esc(a.class_name)} · ` : ''}送出 ${esc(a.submitted_at.slice(0, 16))}</div>
                </div>
                ${statusBadge(a.status, SCH_STATUS_TONE[a.status] || 'gray')}
            </div>
            <div class="text-xs space-y-0.5">${files}</div>
            ${a.note ? `<div class="text-xs text-slate-600">學生備註：${esc(a.note)}</div>` : ''}
            ${a.review_note ? `<div class="text-xs ${a.status === '已退回' ? 'text-rose-700' : 'text-slate-600'}">審核意見：${esc(a.review_note)}（${esc(a.reviewer)}）</div>` : ''}
            ${stamp}
            <div class="flex flex-wrap gap-2">
                ${a.certificate_url ? `<a href="${esc(a.certificate_url)}" target="_blank" rel="noopener" class="text-xs bg-ukn-800 hover:bg-ukn-900 text-white rounded px-3 py-1.5">下載核定通知（電子章）</a>` : ''}
                ${!staff && a.status === '審核中' && currentUser.role === '學生' ? `<button onclick="withdrawScholarshipApp(${a.id})" class="text-xs border border-slate-300 hover:bg-slate-50 rounded px-3 py-1.5">撤回</button>` : ''}
            </div>
            ${actions}
        </div>`;
}

// 學生/家長：自己的申請；教職員/管理員：待審核清單
async function loadScholarshipApps() {
    const section = document.getElementById('scholarshipAppsSection');
    const body = document.getElementById('scholarshipAppsBody');
    const staff = isStaff();
    if (!isLoggedIn() || !(staff || ['學生', '家長'].includes(currentUser.role))) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');
    if (staff) {
        document.getElementById('scholarshipAppsTitle').textContent = '📎 獎助學金送件審核';
        document.getElementById('scholarshipAppsHint').textContent = '確認文件無誤後按「核准並蓋章」，系統會產生核定字號與電子章驗證碼並通知學生；退回請寫原因。';
    }
    try {
        const r = await api(staff ? '/api/admin/scholarship-applications' : '/api/scholarships/applications/mine');
        body.innerHTML = r.data.length ? r.data.map(a => schAppCard(a, staff)).join('')
            : `<div class="text-xs text-slate-400">${staff ? '目前沒有待審核的申請' : '還沒有送出申請；在上方「符合資格」的項目可以直接線上申請。'}</div>`;
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

async function reviewScholarshipApp(id, action) {
    const note = document.getElementById(`schReviewNote${id}`)?.value || '';
    if (action === 'approve' && !confirm('確定核准並蓋上電子章？核准後無法撤銷。')) return;
    try { toast((await api(`/api/admin/scholarship-applications/${id}/review`, { json: { action, note } })).message); loadScholarshipApps(); }
    catch (e) { toast(e.message, 'error'); }
}

async function withdrawScholarshipApp(id) {
    if (!confirm('確定撤回這張申請？')) return;
    try { toast((await api(`/api/scholarships/applications/${id}/withdraw`, { json: {} })).message); loadScholarshipApps(); }
    catch (e) { toast(e.message, 'error'); }
}

async function loadScholarships() {
    const body = document.getElementById('scholarshipBody');
    try {
        const r = await api('/api/campus/scholarships');
        scholarshipData = r.data;
        scholarshipAuto = r.auto;
        renderScholarships();
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function filterScholarshipCategory(cat) {
    scholarshipCategory = cat;
    renderScholarships();
}

function renderScholarships() {
    const body = document.getElementById('scholarshipBody');
    const cats = [...new Set(scholarshipData.map(s => s.category).filter(Boolean))];
    const shown = scholarshipCategory ? scholarshipData.filter(s => s.category === scholarshipCategory) : scholarshipData;
    const catBar = cats.length ? `<div class="md:col-span-2 flex flex-wrap items-center gap-1.5 mb-1">
        <button type="button" onclick="filterScholarshipCategory('')" class="text-xs font-bold px-3 py-1.5 rounded-full ${!scholarshipCategory ? 'bg-ukn-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">全部</button>
        ${cats.map(c => `<button type="button" onclick="filterScholarshipCategory('${esc(c)}')" class="text-xs font-bold px-3 py-1.5 rounded-full ${scholarshipCategory === c ? 'bg-ukn-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">${esc(c)}</button>`).join('')}
        </div>` : '';
    const applyLink = (typeof studentLinksCache !== 'undefined' ? studentLinksCache : []).find(l => l.title.includes('獎助學金線上申請'));
    body.innerHTML = catBar + (scholarshipAuto?.avg != null ? `<div class="md:col-span-2 text-xs text-slate-600 bg-ukn-50 border border-ukn-100 rounded px-3 py-2">已依你的成績自動判斷部分條件（上學期平均 ${scholarshipAuto.avg} 分），其他請自己勾選。</div>` : '') +
        shown.map(s => `
        <div class="rounded border ${s.expired ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white'} p-4 space-y-3" data-sch="${s.id}" id="sch-card-${esc(s.id)}">
            <div class="flex items-start justify-between gap-2">
                <div><div class="font-bold text-slate-900">${esc(s.name)}${s.category ? ` <span class="text-[10px] font-normal text-ukn-700 border border-ukn-200 rounded-full px-2 py-0.5 ml-1">${esc(s.category)}</span>` : ''}</div><div class="text-xs text-slate-500">${esc(s.office)} · ${esc(s.amount)}</div></div>
                <div class="flex flex-col items-end gap-1.5 shrink-0">
                    ${s.expired ? statusBadge('已截止', 'gray') : statusBadge(`${mmdd(s.deadline)} 截止`, 'amber')}
                    <span data-sch-fav>${scholarshipFavButton(s)}</span>
                </div>
            </div>
            <div class="space-y-1.5">${s.criteria.map((c, ci) => `
                <label class="flex items-start gap-2 text-sm cursor-pointer">
                    <input type="checkbox" data-crit="${ci}" onchange="updateScholarship('${s.id}')" ${c.auto_value ? 'checked' : ''} class="mt-1 h-4 w-4">
                    <span>${esc(c.text)}${c.auto_value != null ? `<span class="text-[10px] ${c.auto_value ? 'text-emerald-700' : 'text-rose-700'} ml-1">（系統判斷：${c.auto_value ? '符合' : '不符合'}）</span>` : ''}</span>
                </label>`).join('')}</div>
            <div data-sch-result class="text-sm font-semibold"></div>
            ${(s.prepare || []).length ? `<div class="text-xs text-slate-600"><span class="font-semibold text-slate-700">📋 要準備：</span>${s.prepare.map(esc).join('、')}</div>` : ''}
            ${!s.expired && applyLink && applyLink.url !== '#' ? `<a href="${esc(applyLink.url)}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs bg-ukn-800 text-white rounded px-3 py-1.5">前往線上申請 ↗</a>` : ''}
        </div>`).join('') +
        '<p class="md:col-span-2 text-[11px] text-slate-400">獎助學金項目為示範資料，實際條件與金額以生輔組或各主辦機關最新公告為準。</p>';
    shown.forEach(s => updateScholarship(s.id));
}

// 收藏 (只有學生本人)：收藏後貼在證照牆，首頁「必做事項」提醒要準備的文件；已截止的只能取消、不能新收藏
function scholarshipFavButton(s) {
    if (currentUser?.role !== '學生' || (s.expired && !s.favorited)) return '';
    return s.favorited
        ? `<button type="button" onclick="toggleScholarshipFav('${esc(s.id)}', false)" aria-pressed="true" class="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-2 py-1 hover:bg-amber-200">★ 已收藏</button>`
        : `<button type="button" onclick="toggleScholarshipFav('${esc(s.id)}', true)" aria-pressed="false" class="text-xs font-bold text-slate-600 border border-slate-300 rounded px-2 py-1 hover:border-amber-400 hover:text-amber-800">☆ 收藏</button>`;
}

async function toggleScholarshipFav(id, on) {
    try {
        const r = await api(`/api/campus/scholarships/${encodeURIComponent(id)}/favorite`, { json: { on } });
        toast(r.message);
    } catch (e) { toast(e.message, 'error'); return; }
    if (!on && typeof closeModal === 'function') closeModal();
    // 三個地方一起更新：獎助學金檢核卡片、證照牆、首頁必做事項
    // 只換收藏按鈕，不重畫整張卡片，學生已經勾的條件不會被清掉
    const s = scholarshipData.find(x => x.id === id);
    if (s) {
        s.favorited = on;
        const slot = document.querySelector(`[data-sch="${CSS.escape(id)}"] [data-sch-fav]`);
        if (slot) slot.innerHTML = scholarshipFavButton(s);
    }
    if (document.getElementById('certBoard') && typeof renderCertBoard === 'function')
        renderCertBoard(certBoardItems.filter(it => !it.sch));
    if (typeof loadScholarshipFavsForHome === 'function') loadScholarshipFavsForHome();
}

function updateScholarship(id) {
    const card = document.querySelector(`[data-sch="${id}"]`);
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
    if (isStaff()) {
        if (currentUser.role === '管理員' || (currentUser.role === '教職員' && currentUser.can_manage_dorm)) loadDormAdmin();
        else body.innerHTML = '<div class="text-sm text-slate-500">宿舍管理僅限行政人員與管理員。</div>';
        return;
    }
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
                <ul class="mt-1 space-y-0.5">${a.history.map(h => `<li>${esc(h.at.slice(0, 16))} · ${esc(h.status === '未通過' ? h.status : a.stages[h.stage])}${h.reviewed_by ? ' · ' + esc(h.reviewed_by) : ''}${h.note ? ` · ${esc(h.note)}` : ''}</li>`).join('')}</ul></details>
        </div>`;
}

async function submitDorm(event) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    try { const r = await api('/api/campus/dorm/apply', { json: f }); toast(r.message); loadDorm(); }
    catch (e) { toast(e.message, 'error'); }
}

let dormApps = [];
let dormStages = [];
let dormOpenId = null;
let dormOpenKind = null; // 'detail' | 'advance' | 'reject'
const DORM_REJECT_REASONS = ['資格不符合申請條件', '緊急聯絡人資料不齊全', '本學期名額已滿', '文件需要補件'];

async function loadDormAdmin() {
    const body = document.getElementById('dormBody');
    try {
        const r = await api('/api/campus/dorm/applications');
        dormApps = r.data; dormStages = r.stages;
        dormOpenId = null; dormOpenKind = null; dormSelectedBed = '';
        const canEdit = currentUser.role === '管理員' || (currentUser.role === '教職員' && currentUser.can_manage_dorm);
        body.innerHTML = r.data.length ? `<div class="overflow-x-auto"><table class="w-full text-sm text-left">
            <thead><tr class="text-xs text-slate-500 bg-slate-50"><th class="p-2">學生</th><th class="p-2">學期 / 房型</th><th class="p-2">通勤</th><th class="p-2">目前進度</th><th class="p-2"></th></tr></thead>
            <tbody class="divide-y divide-slate-100">${r.data.map(a => `<tr>
                <td class="p-2">${esc(a.student_name)}<div class="text-[11px] text-slate-500">${esc(a.student_id)}</div></td>
                <td class="p-2">${esc(a.semester)} · ${esc(a.room_type)}</td><td class="p-2">${a.commute_minutes} 分</td>
                <td class="p-2">${statusBadge(a.status === '進行中' ? r.stages[a.stage] : a.status, a.status === '進行中' ? 'blue' : a.status === '已完成' ? 'green' : 'red')}</td>
                <td class="p-2 text-right whitespace-nowrap space-x-1">
                    <button type="button" onclick="toggleDormExtra(${a.id}, 'detail')" class="text-xs border border-slate-300 text-slate-700 rounded px-2 py-1">詳情</button>
                    ${canEdit && a.status === '進行中' ? `<button type="button" onclick="toggleDormExtra(${a.id}, 'advance')" class="text-xs bg-ukn-800 text-white rounded px-2 py-1">推進到下一步</button>
                    <button type="button" onclick="toggleDormExtra(${a.id}, 'reject')" class="text-xs border border-rose-300 text-rose-700 rounded px-2 py-1">不通過</button>` : ''}
                </td></tr>
                <tr id="dormExtra-${a.id}"></tr>`).join('')}</tbody></table></div>`
            : '<div class="text-sm text-slate-500">目前沒有宿舍申請。</div>';
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

let dormSelectedBed = '';
let dormBedCatalog = null; // 第一次點「推進」才抓，之後快取

// 詳情／推進／不通過 共用一個展開列，點同一顆按鈕關閉、點別顆換內容，同時間只開一個
async function toggleDormExtra(id, kind) {
    const wasOpenSame = dormOpenId === id && dormOpenKind === kind;
    document.querySelectorAll('[id^="dormExtra-"]').forEach(tr => { tr.innerHTML = ''; });
    dormOpenId = null; dormOpenKind = null;
    if (wasOpenSame) return;
    const a = dormApps.find(x => x.id === id);
    const tr = document.getElementById(`dormExtra-${id}`);
    if (!a || !tr) return;
    dormOpenId = id; dormOpenKind = kind;
    if (kind === 'detail') {
        tr.innerHTML = `<td colspan="5" class="bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
            <div><strong>緊急聯絡電話：</strong>${esc(a.emergency_phone || '未填寫')}</div>
            <div><strong>特殊需求：</strong>${esc(a.special_needs || '無')}</div>
            ${a.bed ? `<div><strong>已分配床位：</strong>${esc(a.bed)}</div>` : ''}
            <div><strong>處理紀錄：</strong>
                <ul class="mt-1 space-y-0.5">${(a.history || []).map(h => `<li>${esc((h.at || '').slice(0, 16))} · ${esc(h.status === '未通過' ? h.status : (dormStages[h.stage] || ''))}${h.reviewed_by ? ' · ' + esc(h.reviewed_by) : ''}${h.note ? ' · ' + esc(h.note) : ''}</li>`).join('') || '<li>尚無紀錄</li>'}</ul>
            </div></td>`;
        return;
    }
    const reject = kind === 'reject';
    if (reject) {
        tr.innerHTML = `<td colspan="5" class="bg-rose-50 p-3">
            <form onsubmit="submitDormAction(event, ${id}, true)" class="space-y-2 text-sm">
                <div class="flex flex-wrap gap-1.5">${DORM_REJECT_REASONS.map(r => `<button type="button" onclick="this.closest('form').note.value='${esc(r)}'" class="text-xs border border-rose-300 bg-white text-rose-700 rounded-full px-2.5 py-1 hover:bg-rose-100">點選帶入：${esc(r)}</button>`).join('')}</div>
                <textarea name="note" required rows="2" placeholder="不通過原因（可點上面快速帶入，或自己輸入）" class="w-full border border-rose-300 rounded px-2 py-1.5"></textarea>
                <div class="text-right space-x-2">
                    <button type="button" onclick="toggleDormExtra(${id}, 'reject')" class="text-xs text-slate-500">取消</button>
                    <button class="text-xs bg-rose-700 text-white rounded px-3 py-1.5">確定不通過</button>
                </div>
            </form></td>`;
        return;
    }
    dormSelectedBed = a.bed || '';
    tr.innerHTML = `<td colspan="5" class="bg-ukn-50 p-3 text-sm">讀取床位總表…</td>`;
    if (!dormBedCatalog) {
        try { dormBedCatalog = (await api('/api/campus/dorm/beds')).data; }
        catch (e) { tr.innerHTML = `<td colspan="5" class="bg-ukn-50 p-3 text-xs text-rose-700">${esc(e.message)}</td>`; return; }
    }
    if (dormOpenId !== id || dormOpenKind !== 'advance') return; // 讀取時使用者點了別的
    renderDormAdvanceForm(id, a);
}

function renderDormAdvanceForm(id, a) {
    const tr = document.getElementById(`dormExtra-${id}`);
    if (!tr) return;
    const byRoom = {};
    dormBedCatalog.forEach(b => (byRoom[b.room] = byRoom[b.room] || []).push(b));
    const bedGrid = Object.entries(byRoom).map(([room, beds]) => `
        <div class="mb-2">
            <div class="text-[11px] text-slate-500 mb-1">${esc(room)}（${esc(beds[0].room_type)}）${beds[0].room_type === a.room_type ? ' <span class="text-ukn-700 font-semibold">· 符合申請房型</span>' : ''}</div>
            <div class="flex flex-wrap gap-1.5">${beds.map(b => {
                const selected = b.bed === dormSelectedBed;
                const disabled = b.occupied && !selected;
                return `<button type="button" ${disabled ? 'disabled' : ''} onclick="selectDormBed(${id}, '${b.bed}')"
                    title="${b.occupied ? '已住：' + esc(b.occupied_by?.student_name || '') : '可分配'}"
                    class="text-xs rounded px-2.5 py-1.5 border ${selected ? 'bg-ukn-800 text-white border-ukn-800' : disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-300 hover:border-ukn-500 hover:text-ukn-800'}">${esc(b.bed)}</button>`;
            }).join('')}</div>
        </div>`).join('');
    tr.innerHTML = `<td colspan="5" class="bg-ukn-50 p-3">
        <form onsubmit="submitDormAction(event, ${id}, false)" class="space-y-2 text-sm">
            <div class="text-xs text-slate-600 mb-1">床位號碼（選填，分配床位時點選即可，不用自己打字）</div>
            ${bedGrid}
            <div class="text-xs text-slate-600">已選床位：<span class="font-semibold text-ukn-800">${dormSelectedBed ? esc(dormSelectedBed) : '尚未選擇'}</span>
                ${dormSelectedBed ? `<button type="button" onclick="selectDormBed(${id}, '')" class="text-slate-400 hover:text-slate-600 ml-1">清除</button>` : ''}</div>
            <label class="block"><span class="text-xs text-slate-600">備註（選填）</span>
                <textarea name="note" rows="2" class="w-full border border-ukn-200 rounded px-2 py-1.5 mt-0.5"></textarea></label>
            <div class="text-right space-x-2">
                <button type="button" onclick="toggleDormExtra(${id}, 'advance')" class="text-xs text-slate-500">取消</button>
                <button class="text-xs bg-ukn-800 text-white rounded px-3 py-1.5">確定推進</button>
            </div>
        </form></td>`;
}

function selectDormBed(id, bed) {
    dormSelectedBed = bed;
    const a = dormApps.find(x => x.id === id);
    renderDormAdvanceForm(id, a);
}

async function submitDormAction(event, id, reject) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    const note = (f.note || '').trim();
    if (reject && !note) { toast('不通過請填寫原因', 'error'); return; }
    try {
        await api(`/api/campus/dorm/applications/${id}`, { json: { action: reject ? 'reject' : 'advance', note, bed: reject ? '' : dormSelectedBed } });
        dormBedCatalog = null; // 占用狀態變了，下次打開重新抓
        loadDormAdmin();
    } catch (e) { toast(e.message, 'error'); }
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
                    ${r.mine.status === '保留中' ? `<div class="text-xs text-slate-600 mt-0.5">請在 <strong>${esc(r.mine.pay_deadline)}</strong> 前到${esc(r.mine.pay_at)}繳費 ${r.mine.fee} 元，超過期限沒繳費，櫃子會自動取消。</div>` : ''}</div>
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
                <rect x="0" y="64" width="100" height="8" fill="#e2e8f0"/><text x="3" y="69.5" font-size="2.4" fill="#64748b">康寧路三段十五巷</text>
                <text x="43" y="24.5" font-size="2" fill="#64748b" font-weight="700">康寧大道</text>
                <path d="M2 42 L2 64" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="1 1"/>
                ${b.map(x => {
                    const on = mapHighlight === x.code;
                    const sub = x.floors >= 2 ? `${x.code} 棟 · ${x.floors}F` : '戶外空間';
                    return `<g role="button" tabindex="0" onclick="selectBuilding('${x.code}')" onkeydown="if(event.key==='Enter')selectBuilding('${x.code}')" style="cursor:pointer">
                        <rect x="${x.x}" y="${x.y}" width="${x.w}" height="${x.h}" rx="1.2" fill="${on ? '#ff5511' : '#003c9d'}" fill-opacity="${on ? 0.9 : 0.14}" stroke="${on ? '#c2410c' : '#003c9d'}" stroke-width="${on ? 0.6 : 0.3}"/>
                        <text x="${x.x + x.w / 2}" y="${x.y + x.h / 2 - 0.5}" text-anchor="middle" font-size="2.3" font-weight="700" fill="${on ? '#fff' : '#00295f'}">${esc(x.name)}</text>
                        <text x="${x.x + x.w / 2}" y="${x.y + x.h / 2 + 2.6}" text-anchor="middle" font-size="1.9" fill="${on ? '#fff' : '#475569'}">${sub}</text>
                        ${on ? `<text x="${x.x + x.w / 2}" y="${x.y - 1}" text-anchor="middle" font-size="4">📍</text>` : ''}
                    </g>`;
                }).join('')}
                <circle cx="${mapData.gate.x}" cy="${mapData.gate.y}" r="1.5" fill="#ff5511"/><text x="${mapData.gate.x + 2.5}" y="${mapData.gate.y + 0.8}" font-size="2.3" fill="#9a3412">${esc(mapData.gate.name.split('(')[0].trim())}</text>
            </svg>
            <p class="text-[11px] text-slate-400 mt-1">校園配置示意圖（非實際比例），點建築物可查看裡面有什麼。</p>
        </div>
        <div id="mapInfo" class="space-y-3">${infoHtml || `<div class="text-sm text-slate-500">點地圖上的建築物，或在上方搜尋教室代碼、處室、老師。</div>
            <div class="text-xs text-slate-600 space-y-1"><div class="font-bold">教室代碼怎麼看？</div><div>第一個字母是大樓，第一個數字是樓層：A402 = 第一教學大樓 (A) 4 樓。</div></div>`}</div>`;
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
        ${rooms.length ? `<div><div class="text-xs font-bold text-slate-600 mb-1">教室</div>${rooms.map(r => `<div class="text-sm">${esc(r.name)}<span class="text-xs text-slate-500"> · ${r.floor}F${r.desc ? ` · ${esc(r.desc)}` : ''}</span></div>`).join('')}</div>` : ''}
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

// 其他頁面「在地圖上看」：傳入辦公室位置文字，例如「行政大樓 2 樓 教務處 (課程與教學組)」
async function showOnMap(locationText) {
    closeModal();
    switchTab('tab-map');
    if (!mapData) await loadMap();
    const b = mapData.buildings.find(x => String(locationText).includes(x.name));
    const code = /([A-Z])\d{3}/.exec(locationText)?.[1];
    document.getElementById('mapSearch').value = locationText;
    if (b) selectBuilding(b.code); else if (code) findOnMap(code + '1'); else findOnMap(locationText);
}

const TEACHER_TONE = { '上課中': 'red', '可以找老師': 'green', '沒有課': 'blue', '非上班時間': 'gray' };

function teacherAvatar(t) {
    return t.photo_url
        ? `<img src="${esc(t.photo_url)}" alt="${esc(t.name)} 老師的照片" loading="lazy" class="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0">`
        : `<div class="w-14 h-14 rounded-full bg-ukn-50 border border-ukn-100 text-ukn-800 font-bold text-lg flex items-center justify-center shrink-0" aria-hidden="true">${esc(t.name.slice(0, 1))}</div>`;
}

// 【功能：老師辦公室與目前狀態（整合教師專長查詢）】同時載入 /api/campus/teachers（課表、即時狀態、服務單位、可找時間）與 /api/faculty（專長、領域、可指導專題）
async function loadTeachers() {
    const body = document.getElementById('teachersBody');
    if (!body) return;
    try {
        window._teachers = await api('/api/campus/teachers');
    } catch (e) {
        if (!window._teachers) window._teachers = null;
    }
    if (typeof loadFaculty === 'function') {
        await loadFaculty();
    } else if (!window._teachers) {
        body.innerHTML = '<div class="text-sm text-rose-700">老師資料載入失敗，請稍後再試。</div>';
    }
}

function showTeacherTimetable(name) {
    const t = window._teachers?.data?.find(x => x.name === name);
    if (!t) { toast('尚無該老師的課表資料', 'error'); return; }
    const periods = window._teachers.periods;
    const cell = (wd, p) => {
        const c = t.timetable.find(s => s.weekday === wd && s.period_start <= p && s.period_end >= p);
        const oh = t.office_hours.find(o => o.weekday === wd && o.start <= periods[p][0] && o.end >= periods[p][1]);
        return c ? `<td class="border border-slate-100 bg-ukn-100 text-ukn-900 text-[10px] leading-tight p-0.5">${esc(c.course_name)}<div class="text-slate-500">${esc(c.classroom)}</div></td>`
            : oh ? '<td class="border border-slate-100 bg-emerald-50 text-emerald-700 text-[10px]">可找</td>' : '<td class="border border-slate-100"></td>';
    };
    openModal(`${t.name} 老師的課表`, `
        <div class="overflow-x-auto"><table class="w-full min-w-[420px] table-fixed text-center text-xs border-collapse">
            <thead><tr class="text-slate-500"><th></th>${[1, 2, 3, 4, 5].map(d => `<th class="py-1">週${WEEKDAY_TEXT[d]}</th>`).join('')}</tr></thead>
            <tbody>${Object.keys(periods).map(p => `<tr><td class="text-[10px] text-slate-400 w-12">${p}<div>${periods[p][0]}</div></td>${[1, 2, 3, 4, 5].map(d => cell(d, Number(p))).join('')}</tr>`).join('')}</tbody>
        </table></div>
        <p class="text-xs text-slate-500">藍色是上課時段，綠色是可以找老師的時間，空白代表沒有排課（可能在${t.office ? `辦公室 ${esc(t.office)}` : '辦公室'}）。</p>`);
}

// =====================================================================
// 天氣與交通
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

// =====================================================================
// 班級通知
// =====================================================================

let noticeClasses = [];

function noticeListHtml(inbox, readonly) {
    return `
        <h3 class="font-bold text-slate-900">${readonly ? '子女收到的通知' : '收到的通知'} ${inbox.unread_count ? `<span class="text-xs text-accent-500">(${inbox.unread_count} 則未讀)</span>` : ''}</h3>
        ${inbox.data.length ? inbox.data.map(n => `
            <details id="notice-item-${Number(n.id)}" class="rounded border ${PRIORITY_STYLE[n.priority]?.bar || ''} ${n.is_read ? 'border-slate-200' : 'border-accent-500/50 bg-accent-50/40'}" ${readonly ? '' : `ontoggle="if(this.open) readNotice(${n.id}, this)"`}>
                <summary class="cursor-pointer list-none px-4 py-3">
                    <div class="flex items-center gap-2 flex-wrap">${n.is_read ? '' : '<span data-dot class="w-2 h-2 rounded-full bg-accent-500"></span>'}
                        ${priorityBadge(n.priority)}
                        <span class="font-semibold text-slate-900">${esc(n.title)}</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">${noticeTargetText(n)} · ${esc(n.sender)} · ${esc(n.created_at.slice(5, 16).replace('-', '/'))}${n.whole_class ? '' : ' · 個別通知'}${n.due_date ? ` · 期限 ${mmdd(n.due_date)}` : ''}</div>
                </summary>
                <div class="px-4 pb-4 text-sm text-slate-700 whitespace-pre-line">${esc(n.content)}</div>${noticeReplyHtml(n, readonly)}
            </details>`).join('') : '<div class="text-sm text-slate-500">目前沒有通知。</div>'}`;
}

async function loadNotices() {
    const body = document.getElementById('noticesBody');
    if (!isLoggedIn()) { body.innerHTML = loginPrompt('登入後即可收到或發送班級通知。'); return; }
    if (isStaff()) return loadNoticesTeacher();
    if (currentUser.role === '家長') {
        try {
            const [inbox, msgs, changes] = await Promise.all([api('/api/campus/notices/inbox'), api('/api/campus/advisor-messages'),
                api('/api/campus/course-changes').catch(() => ({ data: [] }))]);
            body.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-2">${courseChangesHtml(changes.data, false)}${noticeListHtml(inbox, true)}
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
    if (currentUser.role !== '學生') { body.innerHTML = '<div class="text-sm text-slate-500">班級通知提供學生與老師使用。</div>'; return; }
    try {
        const [cls, inbox, changes] = await Promise.all([api('/api/campus/classes'), api('/api/campus/notices/inbox'),
            api('/api/campus/course-changes').catch(() => ({ data: [] }))]);
        noticeClasses = cls.data;
        const joined = noticeClasses.filter(c => c.joined), others = noticeClasses.filter(c => !c.joined);
        body.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-2">${courseChangesHtml(changes.data, true)}${noticeListHtml(inbox, false)}</div>
                <div class="space-y-4">
                    <div class="rounded border border-slate-200 p-4 space-y-2">
                        <h3 class="font-bold text-slate-900 text-sm">我加入的班級</h3>
                        ${joined.length ? joined.map(c => `<div class="flex items-center justify-between text-sm"><span>${esc(c.class_name)} <span class="text-[11px] text-slate-500">${c.member_count} 人</span></span>
                            ${c.is_own_class ? '<span class="text-[11px] text-slate-400">我的班級</span>' : `<button type="button" onclick="leaveClass('${esc(c.class_name)}')" class="text-[11px] text-slate-500 hover:text-rose-700">退出</button>`}</div>`).join('') : '<div class="text-xs text-slate-500">尚未加入任何班級</div>'}
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

// ---------- 臨時停課／調課：原時段 → 補課 / 調課後時段，一鍵加入行事曆 ----------

function courseChangeWhen(day, periods, room) {
    const wd = '日一二三四五六'[new Date(`${day}T00:00`).getDay()];
    return `${mmdd(day)}（${wd}）第 ${esc(periods)} 節${room ? ` ${esc(room)}` : ''}`;
}

// 【功能：停調課通知】班級通知頁上方的停調課卡片；學生可一鍵加入行事曆，家長只能看
function courseChangesHtml(items, canAdd) {
    if (!items || !items.length) return '';
    const upcoming = items.filter(c => !c.is_past), past = items.filter(c => c.is_past);
    const card = c => `
        <article class="rounded border ${c.is_past ? 'border-slate-200 opacity-70' : 'border-rose-200 bg-rose-50/40'} px-4 py-3 space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
                <span class="inline-block text-[11px] font-bold rounded px-1.5 py-0.5 ${c.kind === '停課' ? 'bg-rose-600' : 'bg-amber-500'} text-white">${c.kind === '停課' ? '🚫 停課' : '🔁 調課'}</span>
                <span class="font-semibold text-slate-900">${esc(c.course_name)}</span>
                <span class="text-[11px] text-slate-500">${esc(c.class_name)}${c.teacher ? ` · ${esc(c.teacher)}` : ''}</span>
            </div>
            <div class="text-sm text-slate-700 grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5">
                <span class="text-slate-500">原本</span><span class="${c.is_past ? '' : 'line-through decoration-rose-400'}">${courseChangeWhen(c.orig_date, c.orig_periods, c.orig_room)}</span>
                ${c.new_date ? `<span class="text-slate-500">${c.kind === '停課' ? '補課' : '改到'}</span><span class="font-semibold text-slate-900">${courseChangeWhen(c.new_date, c.new_periods, c.new_room)}</span>`
                    : '<span class="text-slate-500">補課</span><span class="text-slate-500">暫無補課，老師另行通知</span>'}
            </div>
            ${c.reason ? `<p class="text-xs text-slate-600">原因：${esc(c.reason)}</p>` : ''}
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span class="text-[11px] text-slate-400">${esc(c.created_by)} · ${esc(c.created_at.slice(5, 16).replace('-', '/'))} 發布</span>
                ${!canAdd || c.is_past ? '' : c.in_calendar ? '<span class="text-xs text-emerald-700 font-semibold">✅ 已在我的行事曆</span>'
                    : `<button type="button" onclick="addCourseChangeToCalendar(${c.id}, this)" class="bg-ukn-800 hover:bg-ukn-900 text-white text-xs font-bold rounded px-3 py-1.5">📅 加入我的行事曆</button>`}
            </div>
        </article>`;
    return `
        <section class="space-y-2 mb-4">
            <h3 class="font-bold text-slate-900 text-sm">臨時停課／調課${upcoming.length ? `<span class="ml-1 text-rose-700">（${upcoming.length}）</span>` : ''}</h3>
            ${upcoming.map(card).join('') || '<div class="text-xs text-slate-500">近期沒有停課或調課。</div>'}
            ${past.length ? `<details><summary class="text-xs text-slate-500 cursor-pointer">已過的停調課（${past.length}）</summary><div class="space-y-2 mt-2">${past.map(card).join('')}</div></details>` : ''}
        </section>`;
}

// 老師／教職員／管理員發布停課或調課，同時送出一則緊急班級通知
function courseChangeComposeHtml() {
    if (!courseChangeClasses.length) return '<div class="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">課表上沒有您任教或帶班的班級，無法發布停調課。</div>';
    return `
        <form onsubmit="createCourseChange(event)" class="rounded border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select name="kind" required class="border border-slate-300 rounded px-3 py-2 bg-white">
                    <option value="">停課或調課？</option>
                    <option value="停課">🚫 停課</option>
                    <option value="調課">🔁 調課</option>
                </select>
                <select name="class_name" required class="border border-slate-300 rounded px-3 py-2 bg-white">
                    ${courseChangeClasses.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
                </select>
            </div>
            <input name="course_name" required maxlength="100" placeholder="課程名稱" class="w-full border border-slate-300 rounded px-3 py-2">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-3 text-xs font-semibold text-slate-600">原本上課時段</div>
                <input type="date" name="orig_date" required class="border border-slate-300 rounded px-3 py-2">
                <input name="orig_periods" required placeholder="節次，例如 3 或 3-4" class="border border-slate-300 rounded px-3 py-2">
                <input name="orig_room" placeholder="教室（選填）" class="border border-slate-300 rounded px-3 py-2">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-3 text-xs font-semibold text-slate-600">調課／補課時段（停課沒有補課可留空）</div>
                <input type="date" name="new_date" class="border border-slate-300 rounded px-3 py-2">
                <input name="new_periods" placeholder="節次，例如 3 或 3-4" class="border border-slate-300 rounded px-3 py-2">
                <input name="new_room" placeholder="教室（選填）" class="border border-slate-300 rounded px-3 py-2">
            </div>
            <input name="reason" maxlength="200" placeholder="原因（選填，例如研習、天候）" class="w-full border border-slate-300 rounded px-3 py-2">
            <p class="text-[11px] text-slate-500">送出後會立即以「緊急」優先級通知該班全部學生，並顯示在學生「班級通知」頁的停課／調課卡片。</p>
            <div class="text-right"><button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">發布</button></div>
        </form>`;
}

async function createCourseChange(event) {
    event.preventDefault();
    try {
        const r = await api('/api/campus/course-changes', { json: Object.fromEntries(new FormData(event.target)) });
        toast(r.message);
        event.target.reset();
    } catch (e) { toast(e.message, 'error'); }
}

async function addCourseChangeToCalendar(id, btn) {
    btn.disabled = true;
    try {
        const r = await api(`/api/campus/course-changes/${id}/calendar`, { json: {} });
        toast(r.message);
        btn.outerHTML = '<span class="text-xs text-emerald-700 font-semibold">✅ 已在我的行事曆</span>';
        if (typeof refreshCalendar === 'function') refreshCalendar();
    } catch (e) {
        btn.disabled = false;
        toast(e.message, e.status === 409 ? 'info' : 'error');
    }
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

// 通知等級：一般 (灰)、重要 (橘)、緊急 (紅)
const PRIORITY_STYLE = {
    '一般': { hint: '一般提醒，例如帶課本、繳回條', on: 'bg-slate-600 border-slate-600 text-white', off: 'border-slate-300 text-slate-700 hover:bg-slate-100', bar: '' },
    '重要': { hint: '有期限要處理，例如繳交資料、報名', on: 'bg-amber-500 border-amber-500 text-white', off: 'border-amber-300 text-amber-800 hover:bg-amber-50', bar: 'border-l-4 !border-l-amber-500' },
    '緊急': { hint: '要馬上知道，例如停課、教室臨時異動', on: 'bg-rose-600 border-rose-600 text-white', off: 'border-rose-300 text-rose-700 hover:bg-rose-50', bar: 'border-l-4 !border-l-rose-600' },
};

function priorityBadge(priority) {
    if (priority === '緊急') return '<span class="inline-block text-[11px] font-bold rounded px-1.5 py-0.5 bg-rose-600 text-white whitespace-nowrap">🚨 緊急</span>';
    if (priority === '重要') return '<span class="inline-block text-[11px] font-bold rounded px-1.5 py-0.5 bg-amber-500 text-white whitespace-nowrap">⚠️ 重要</span>';
    return '';
}

function priorityPickerHtml() {
    return `<div class="space-y-1">
        <div class="flex flex-wrap items-center gap-2"><span class="text-xs font-semibold text-slate-600">通知等級</span>
            ${Object.keys(PRIORITY_STYLE).map(p => `
                <label class="cursor-pointer"><input type="radio" name="priority" value="${p}" class="sr-only" ${p === '一般' ? 'checked' : ''} onchange="pickPriority(this)">
                    <span data-priority="${p}" class="inline-block border rounded-full px-3 py-1 text-xs font-bold ${p === '一般' ? PRIORITY_STYLE[p].on : PRIORITY_STYLE[p].off}">${p === '緊急' ? '🚨 ' : p === '重要' ? '⚠️ ' : ''}${p}</span></label>`).join('')}
        </div>
        <p data-priority-hint class="text-[11px] text-slate-500">${PRIORITY_STYLE['一般'].hint}</p>
    </div>`;
}

function pickPriority(input) {
    const form = input.form;
    form.querySelectorAll('[data-priority]').forEach(el => {
        const st = PRIORITY_STYLE[el.dataset.priority];
        el.className = `inline-block border rounded-full px-3 py-1 text-xs font-bold ${el.dataset.priority === input.value ? st.on : st.off}`;
    });
    form.querySelector('[data-priority-hint]').textContent = PRIORITY_STYLE[input.value].hint;
}

// 通知對象說明：班級通知顯示班級；廣播顯示「課程廣播：資料庫系統概論（資管五忠）」
function noticeTargetText(n) {
    const type = n.target_type || '班級';
    const label = esc(n.target_label || n.class_name || '');
    return type === '班級' ? label : `<span class="text-ukn-800 font-semibold">${type === '全校' ? '全校廣播' : `${type}廣播：${label}`}</span>`;
}

let noticeSelectedClass = null;
let noticeMode = 'class';      // 'class' = 班級通知；'broadcast' = 課程／科系／年級／全校廣播；'course-change' = 發布停課／調課
let broadcastTargets = null;
let courseChangeClasses = [];
async function loadNoticesTeacher() {
    const body = document.getElementById('noticesBody');
    try {
        const [cls, sent, targets, advisorMsgs, changeClasses] = await Promise.all([api('/api/campus/classes'), api('/api/campus/notices/sent'), api('/api/campus/broadcast/targets'), api('/api/campus/advisor-messages'), api('/api/campus/course-changes/classes')]);
        noticeClasses = cls.data;
        broadcastTargets = targets.data;
        courseChangeClasses = changeClasses.data;
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
                <div class="lg:col-span-3 space-y-4">
                    <div class="inline-flex rounded border border-slate-300 overflow-hidden text-sm" role="tablist">
                        <button type="button" onclick="noticeMode='class'; loadNoticesTeacher()" class="px-4 py-1.5 ${noticeMode === 'class' ? 'bg-ukn-800 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-50'}">發給班級</button>
                        <button type="button" onclick="noticeMode='broadcast'; loadNoticesTeacher()" class="px-4 py-1.5 border-l border-slate-300 ${noticeMode === 'broadcast' ? 'bg-ukn-800 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-50'}">${broadcastTargets.school !== null ? '課程／全校廣播' : '課程廣播'}</button>
                        <button type="button" onclick="noticeMode='course-change'; loadNoticesTeacher()" class="px-4 py-1.5 border-l border-slate-300 ${noticeMode === 'course-change' ? 'bg-ukn-800 text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-50'}">停課／調課</button>
                    </div>
                    ${noticeMode === 'broadcast' ? broadcastComposeHtml() : noticeMode === 'course-change' ? courseChangeComposeHtml() : noticeComposeHtml()}
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
                                <div class="flex flex-wrap items-center justify-between gap-2"><span class="flex items-center gap-2">${priorityBadge(n.priority)}<span class="font-semibold text-slate-900">${esc(n.title)}</span></span>
                                    ${statusBadge(`已讀 ${n.read_count} / ${n.total}`, n.read_count === n.total ? 'green' : 'blue')}</div>
                                <div class="text-[11px] text-slate-500">${noticeTargetText(n)} · ${n.target_type !== '班級' ? `${n.total} 位學生` : (n.whole_class ? '整班' : '個別通知')} · 發送：<span class="font-semibold text-slate-700">${esc(n.sender || '—')}</span> · ${esc(n.created_at.slice(5, 16).replace('-', '/'))}</div></summary>
                                <p class="text-sm text-slate-700 mt-2 whitespace-pre-line">${esc(n.content)}</p>
                                ${sentReplyHtml(n)}
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
                <input name="title" required maxlength="80" placeholder="通知標題" class="sm:col-span-3 border border-slate-300 rounded px-3 py-2">
                <input type="date" name="due_date" title="期限（選填）" class="border border-slate-300 rounded px-3 py-2">
            </div>
            <textarea name="content" required rows="3" maxlength="2000" placeholder="通知內容" class="w-full border border-slate-300 rounded px-3 py-2"></textarea>
            ${priorityPickerHtml()}
            <label class="flex items-center gap-2"><input type="checkbox" name="reply_required">需要學生回條（收到／會參加／無法參加／需要協助；期限同上方日期）</label>
            <div class="text-right"><button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">發送通知</button></div>
        </form>`;
}

// 廣播：班導只有自己任教的課程；教職員 (行政人員) 另有科系、年級、全校
function broadcastComposeHtml() {
    const t = broadcastTargets || { courses: [], departments: [], grades: [], school: null };
    const opt = (type, value, text, count) => `<option value="${esc(type)}|${esc(value)}">${esc(text)} (${count} 人)</option>`;
    const groups = [];
    if (t.school !== null) groups.push(`<optgroup label="全校">${opt('全校', '', '全校學生', t.school)}</optgroup>`);
    if (t.departments.length) groups.push(`<optgroup label="科系">${t.departments.map(d => opt('科系', d.dept_id, d.dept_name, d.count)).join('')}</optgroup>`);
    if (t.grades.length) groups.push(`<optgroup label="年級">${t.grades.map(g => opt('年級', g.year, g.label, g.count)).join('')}</optgroup>`);
    if (t.courses.length) groups.push(`<optgroup label="課程">${t.courses.map(c => opt('課程', c.course_name, `${c.course_name}${c.classes.length ? `（${c.classes.join('、')}）` : ''}`, c.count)).join('')}</optgroup>`);
    if (!groups.length) return '<div class="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">課表上沒有您任教的課程，目前無法使用課程廣播；導師班請用「班級通知」。</div>';
    return `
        <form onsubmit="sendBroadcast(event)" class="rounded border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
            <div class="flex flex-wrap items-center gap-3">
                <span class="font-bold text-slate-900">廣播給</span>
                <select name="target" class="flex-1 min-w-[12rem] border border-slate-300 rounded px-3 py-2 bg-white">${groups.join('')}</select>
            </div>
            <p class="text-[11px] text-slate-500">${t.school !== null ? '可廣播給任何課程、科系、年級或全校。' : '只列出課表上您任教的課程，修課學生都會收到。'}</p>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input name="title" required maxlength="80" placeholder="通知標題" class="sm:col-span-3 border border-slate-300 rounded px-3 py-2">
                <input type="date" name="due_date" title="期限（選填）" class="border border-slate-300 rounded px-3 py-2">
            </div>
            <textarea name="content" required rows="3" maxlength="2000" placeholder="通知內容" class="w-full border border-slate-300 rounded px-3 py-2"></textarea>
            ${priorityPickerHtml()}
            <label class="flex items-center gap-2"><input type="checkbox" name="reply_required">需要學生回條（收到／會參加／無法參加／需要協助；期限同上方日期）</label>
            <div class="text-right"><button class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2">發送廣播</button></div>
        </form>`;
}

// ---------- 活動報名 (學生/家長/教職員自助報名與查看；報名者管理後台在 /admin/events) ----------

let eventsList = [];
let myEventsList = [];
let eventsOpenRegisterId = null; // 目前展開「我要報名」表單的活動 id
let eventsFeedbackOpenId = null; // 目前展開「活動回饋」表單的活動 id
let eventsCancelConfirm = null;  // {eventId, regId} 目前正在確認要不要取消

async function loadEvents() {
    // 活動列表不用登入就能看 (體驗營要讓還沒登記的訪客也看得到)；只有「我的報名」跟實際送出報名才需要身分
    const body = document.getElementById('eventsBody');
    const q = document.getElementById('eventsSearch').value.trim();
    const openOnly = document.getElementById('eventsOpenOnly').checked;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (openOnly) params.set('open_only', '1');
    document.getElementById('eventsCreateBtn').classList.toggle('hidden', !['管理員', '教職員', '老師'].includes(currentUser.role));
    try {
        const listRes = await api(`/api/campus/events?${params.toString()}`);
        eventsList = listRes.data;
        // currentUser.username 才代表真的有 session (含訪客登記後的免密碼 session)；isLoggedIn() 會把訪客也算未登入，這裡不能用
        myEventsList = currentUser.username ? (await api('/api/campus/events/mine')).data : [];
        renderEventsList();
        renderMyEvents();
        maybeAutoOpenPendingEventRegister();
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

// 完全沒有 session 時點「我要報名」：記住要報哪場活動，導去訪客登記 (免密碼)，登記完成會自動帶回來這裡並展開報名表單
function goRegisterEventAsVisitor(id) {
    sessionStorage.setItem('pendingEventRegisterId', String(id));
    location.href = '/login.html?returnTo=' + encodeURIComponent('/#tab-events');
}

function maybeAutoOpenPendingEventRegister() {
    const pendingId = sessionStorage.getItem('pendingEventRegisterId');
    if (!pendingId) return;
    sessionStorage.removeItem('pendingEventRegisterId');
    if (!currentUser.username) return;
    const id = Number(pendingId);
    if (eventsList.some(e => e.id === id)) {
        eventsOpenRegisterId = id;
        renderEventsList();
        restrictAccountInput('eventRegStudentId');
    }
}

function eventFormFieldsHtml(e) {
    e = e || {};
    return `
        <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">活動名稱 *</label><input name="title" required maxlength="100" value="${esc(e.title || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div><label class="block text-xs font-semibold text-slate-600 mb-1">活動日期 *</label><input type="date" name="event_date" required value="${esc(e.event_date || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div><label class="block text-xs font-semibold text-slate-600 mb-1">活動時間</label><input type="time" name="event_time" value="${esc(e.event_time || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div><label class="block text-xs font-semibold text-slate-600 mb-1">報名截止日 *</label><input type="date" name="registration_deadline" required value="${esc(e.registration_deadline || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div><label class="block text-xs font-semibold text-slate-600 mb-1">名額 *</label><input type="number" name="capacity" required min="1" value="${e.capacity || 30}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">活動地點 *</label><input name="location" required maxlength="100" value="${esc(e.location || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">資格限定／報名對象（選填）</label><input name="eligibility" maxlength="200" placeholder="留空＝不限身分皆可報名；例如：限資訊管理科學生" value="${esc(e.eligibility || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">活動效益／加分說明（選填）</label><input name="benefit" maxlength="200" placeholder="例如：筆試 70 分以上可登記為 CCAC 證照加分項目" value="${esc(e.benefit || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
        <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">活動說明</label><textarea name="description" rows="3" maxlength="2000" class="w-full border border-slate-300 rounded px-3 py-2">${esc(e.description || '')}</textarea></div>`;
}

function openCreateEventModal() {
    openModal('新增活動', `
        <form onsubmit="submitCreateEvent(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            ${eventFormFieldsHtml()}
            <div class="sm:col-span-2 flex justify-end gap-2 pt-1">
                <button type="button" onclick="closeModal()" class="text-sm text-slate-500 px-3 py-2">取消</button>
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white text-sm font-bold rounded px-4 py-2">建立活動</button>
            </div>
        </form>`);
}

function openEditEventModal(id) {
    const e = eventsList.find(x => x.id === id);
    if (!e) return;
    openModal('編輯活動', `
        <form onsubmit="submitEditEvent(event, ${id})" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            ${eventFormFieldsHtml(e)}
            <div class="sm:col-span-2 flex justify-end gap-2 pt-1">
                <button type="button" onclick="closeModal()" class="text-sm text-slate-500 px-3 py-2">取消</button>
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white text-sm font-bold rounded px-4 py-2">儲存修改</button>
            </div>
        </form>`);
}

async function submitCreateEvent(event) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    try {
        await api('/api/campus/events', { method: 'POST', json: f });
        toast('活動已建立');
        closeModal();
        loadEvents();
    } catch (e) { toast(e.message, 'error'); }
}

async function submitEditEvent(event, id) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    try {
        await api(`/api/campus/events/${id}`, { method: 'PUT', json: f });
        toast('活動已更新');
        closeModal();
        loadEvents();
    } catch (e) { toast(e.message, 'error'); }
}

async function openEventRegistrationsModal(id, title) {
    const statusTone = { '已報名': 'green', '候補中': 'amber', '已取消': 'gray' };
    openModal(`${title}－報名名單`, '<div class="text-sm text-slate-500">載入中…</div>', true);
    try {
        const r = await api(`/api/campus/events/${id}/registrations`);
        const items = r.data;
        const bySchool = r.by_school || [];
        const schoolStatsHtml = bySchool.length ? `
            <div class="rounded border border-slate-200 p-3 text-xs">
                <div class="font-bold text-slate-700 mb-1.5">生源學校統計</div>
                <div class="flex flex-wrap gap-1.5">${bySchool.map(([school, n]) =>
                    `<span class="inline-flex items-center gap-1 bg-slate-100 rounded px-2 py-1">${esc(school)} <b>${n}</b></span>`).join('')}</div>
            </div>` : '';
        const checkinHtml = `
            <form onsubmit="submitEventCheckin(event, ${id})" class="rounded border border-ukn-200 bg-ukn-50 p-3 flex flex-wrap items-end gap-2 text-sm">
                <div class="flex-1 min-w-[160px]"><label class="block text-xs font-semibold text-slate-600 mb-1">核票／簽到（貼上或掃描簽到代碼）</label>
                    <input id="eventCheckinCode" name="code" required placeholder="簽到代碼" class="w-full border border-slate-300 rounded px-3 py-2"></div>
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white text-sm font-bold rounded px-4 py-2">核對簽到</button>
                <span id="eventCheckinResult" class="text-xs w-full"></span>
            </form>`;
        const groupImportHtml = eventGroupImportHtml(id, title);
        if (!items.length) {
            openModal(`${title}－報名名單`, `${checkinHtml}${groupImportHtml}<div class="text-sm text-slate-500">目前還沒有人報名。</div>`, true);
            return;
        }
        const rowsHtml = items.map(x => `
            <tr class="border-b border-slate-100">
                <td class="py-1.5 pr-3">${esc(x.student_id)}</td>
                <td class="py-1.5 pr-3">${esc(x.full_name)}</td>
                <td class="py-1.5 pr-3">${esc(x.email)}</td>
                <td class="py-1.5 pr-3">${esc(x.phone || '-')}</td>
                <td class="py-1.5 pr-3">${esc(x.school_from || '-')}</td>
                <td class="py-1.5 pr-3">${statusBadge(x.status, statusTone[x.status] || 'gray')}</td>
                <td class="py-1.5">${x.status === '已取消' ? '-' : (x.checked_in ? statusBadge('已簽到', 'green') : statusBadge('未簽到', 'gray'))}</td>
            </tr>`).join('');
        openModal(`${title}－報名名單（共 ${items.length} 筆）`, `
            <div class="space-y-3">
                ${schoolStatsHtml}
                ${checkinHtml}
                ${groupImportHtml}
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead><tr class="border-b border-slate-200 text-xs text-slate-500">
                            <th class="py-1.5 pr-3 font-semibold">學號</th><th class="py-1.5 pr-3 font-semibold">姓名</th>
                            <th class="py-1.5 pr-3 font-semibold">Email</th><th class="py-1.5 pr-3 font-semibold">電話</th>
                            <th class="py-1.5 pr-3 font-semibold">生源學校</th>
                            <th class="py-1.5 pr-3 font-semibold">狀態</th><th class="py-1.5 font-semibold">簽到</th>
                        </tr></thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
            </div>`, true);
    } catch (e) {
        openModal(`${title}－報名名單`, `<div class="text-sm text-rose-700">${esc(e.message)}</div>`, true);
    }
}

async function submitEventCheckin(event, id) {
    event.preventDefault();
    const code = document.getElementById('eventCheckinCode').value.trim();
    const resultEl = document.getElementById('eventCheckinResult');
    try {
        const r = await api(`/api/campus/events/${id}/checkin`, { method: 'POST', json: { checkin_code: code } });
        resultEl.textContent = `✅ ${r.message}`;
        resultEl.className = 'text-xs w-full text-green-700 font-semibold';
        document.getElementById('eventCheckinCode').value = '';
    } catch (e) {
        resultEl.textContent = `⚠ ${e.message}`;
        resultEl.className = 'text-xs w-full text-rose-700 font-semibold';
    }
}

// ---------- 團體名單匯入 (教職員/管理員)：貼上多人名單 → 預覽 → 逐筆送進既有的代登記 API，
// 容量/候補/格式驗證都沿用 /registrations 既有邏輯，不另外重寫一份 ----------
let eventGroupPreview = [];

function eventGroupImportHtml(id, title) {
    return `
        <details class="rounded border border-slate-200 p-3 text-sm">
            <summary class="font-bold text-slate-700 cursor-pointer">團體報名（貼上名單）</summary>
            <div class="mt-2 space-y-2">
                <p class="text-xs text-slate-500">每行一人，用逗號分隔：姓名,Email,電話(選填),年齡,學號(選填，沒有就自動產生)</p>
                <textarea id="eventGroupText" rows="4" placeholder="王小明,wang@example.com,0912345678,18&#10;林小美,lin@example.com,,17" class="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono"></textarea>
                <div class="flex gap-2">
                    <button type="button" onclick="previewEventGroupImport()" class="text-sm border border-ukn-700 text-ukn-700 rounded px-3 py-1.5 font-semibold">預覽</button>
                    <button type="button" id="eventGroupSubmitBtn" onclick="submitEventGroupImport(${id}, '${esc(title)}')" class="hidden text-sm bg-ukn-800 hover:bg-ukn-900 text-white rounded px-3 py-1.5 font-semibold">確認送出</button>
                </div>
                <div id="eventGroupPreviewBody"></div>
            </div>
        </details>`;
}

function parseEventGroupLines(text) {
    return text.split('\n').map(line => line.trim()).filter(Boolean).map((line, i) => {
        const [full_name = '', email = '', phone = '', age = '', student_id = ''] = line.split(',').map(s => s.trim());
        const errs = [];
        if (!full_name) errs.push('缺姓名');
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.push('Email 格式錯誤');
        if (phone && phone.replace(/\D/g, '').length < 7) errs.push('電話格式錯誤');
        const ageNum = Number(age);
        if (!age || !Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) errs.push('年齡需為 1-120');
        return { student_id: student_id || `GROUP-${Date.now().toString(36)}-${i}`, full_name, email, phone, age: ageNum, note: '團體報名匯入', errs };
    });
}

function previewEventGroupImport() {
    eventGroupPreview = parseEventGroupLines(document.getElementById('eventGroupText').value);
    renderEventGroupPreview();
}

function eventGroupResultLabel(p) {
    if (p.status === 'ok') return '<span class="text-green-700">✅ 成功</span>';
    if (p.status === 'waitlist') return '<span class="text-amber-700">候補</span>';
    if (p.status === 'fail') return `<span class="text-rose-700">❌ ${esc(p.failMsg || '失敗')}</span>`;
    return p.errs.length ? `<span class="text-rose-700">${esc(p.errs.join('、'))}</span>` : '待送出';
}

function renderEventGroupPreview() {
    const body = document.getElementById('eventGroupPreviewBody');
    const btn = document.getElementById('eventGroupSubmitBtn');
    if (!eventGroupPreview.length) { body.innerHTML = ''; btn.classList.add('hidden'); return; }
    body.innerHTML = `<div class="overflow-x-auto"><table class="w-full text-xs text-left">
        <thead><tr class="text-slate-500"><th class="py-1 pr-2">姓名</th><th class="py-1 pr-2">Email</th><th class="py-1 pr-2">電話</th><th class="py-1 pr-2">年齡</th><th class="py-1 pr-2">結果</th></tr></thead>
        <tbody>${eventGroupPreview.map(p => `
            <tr class="border-b border-slate-100 ${p.errs.length && !p.status ? 'bg-rose-50' : ''}">
                <td class="py-1 pr-2">${esc(p.full_name || '-')}</td>
                <td class="py-1 pr-2">${esc(p.email || '-')}</td>
                <td class="py-1 pr-2">${esc(p.phone || '-')}</td>
                <td class="py-1 pr-2">${esc(String(p.age || '-'))}</td>
                <td class="py-1 pr-2">${eventGroupResultLabel(p)}</td>
            </tr>`).join('')}</tbody></table></div>`;
    btn.classList.toggle('hidden', !eventGroupPreview.some(p => !p.errs.length && !p.status));
}

async function submitEventGroupImport(id, title) {
    const btn = document.getElementById('eventGroupSubmitBtn');
    btn.disabled = true;
    for (const p of eventGroupPreview) {
        if (p.errs.length || p.status) continue;
        try {
            const r = await api(`/api/campus/events/${id}/registrations`, { method: 'POST', json: {
                student_id: p.student_id, full_name: p.full_name, email: p.email, phone: p.phone, age: p.age, note: p.note,
            } });
            p.status = (r.data && r.data.status === '候補中') ? 'waitlist' : 'ok';
        } catch (e) {
            p.status = 'fail';
            p.failMsg = e.message;
        }
        renderEventGroupPreview();
    }
    btn.disabled = false;
    toast('團體報名已送出，請檢查每一行的結果');
    loadEvents();
    openEventRegistrationsModal(id, title);
}

function renderEventsList() {
    const body = document.getElementById('eventsBody');
    if (!eventsList.length) { body.innerHTML = '<div class="text-sm text-slate-500">目前沒有符合條件的活動。</div>'; return; }
    body.innerHTML = eventsList.map(eventCardHtml).join('');
}

function eventCardHtml(e) {
    const myReg = myEventsList.find(r => r.event_id === e.id && r.status !== '已取消');
    const isStaff = ['管理員', '教職員', '老師'].includes(currentUser.role);
    let actionHtml;
    if (e.cancelled) actionHtml = statusBadge('活動已取消', 'red');
    else if (myReg) actionHtml = statusBadge(myReg.status === '候補中' ? '已候補' : '已報名', myReg.status === '候補中' ? 'amber' : 'green');
    else if (!e.can_register) actionHtml = statusBadge(e.event_over ? '活動已結束' : '報名已截止', 'gray');
    else if (eventsOpenRegisterId !== e.id) {
        const label = e.is_full ? '我要候補' : '我要報名';
        const onclick = currentUser.username ? `toggleEventRegister(${e.id})` : `goRegisterEventAsVisitor(${e.id})`;
        actionHtml = `<button type="button" onclick="${onclick}" class="bg-ukn-800 hover:bg-ukn-900 text-white text-sm font-bold rounded px-4 py-2">${label}</button>`;
    }
    else actionHtml = '';
    return `
        <div class="rounded border border-slate-200 p-4 space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <div class="font-bold text-slate-900">${esc(e.title)}${isStaff ? ` <button type="button" onclick="openEditEventModal(${e.id})" class="text-xs text-ukn-700 hover:underline font-normal ml-1">編輯</button> <button type="button" onclick="openEventRegistrationsModal(${e.id}, '${esc(e.title)}')" class="text-xs text-ukn-700 hover:underline font-normal ml-1">報名名單 (${e.registered_count}${e.waitlist_count ? `+${e.waitlist_count}候補` : ''})</button>` : ''}</div>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${e.eligibility ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5">👥 ${esc(e.eligibility)}</span>` : ''}
                        ${e.benefit ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">🏅 ${esc(e.benefit)}</span>` : ''}
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">📅 ${esc(e.event_date)} ${esc(e.event_time || '')} · 📍 ${esc(e.location)}
                        <button type="button" onclick="showOnMap('${esc(e.location)}')" class="text-ukn-700 hover:underline font-semibold ml-1">看地圖</button>
                        · <button type="button" onclick="switchTab('tab-traffic')" class="text-ukn-700 hover:underline font-semibold">交通指引</button>
                    </div>
                    ${e.description ? `<p class="text-sm text-slate-600 mt-2 whitespace-pre-line">${esc(e.description)}</p>` : ''}
                    <div class="text-[11px] text-slate-400 mt-1">報名截止 ${esc(e.registration_deadline)} · 名額 ${e.registered_count}/${e.capacity}${e.waitlist_count ? `（候補 ${e.waitlist_count} 人）` : ''}</div>
                </div>
                <div class="shrink-0">${actionHtml}</div>
            </div>
            ${eventsOpenRegisterId === e.id ? eventRegisterFormHtml(e) : ''}
        </div>`;
}

function toggleEventRegister(id) {
    eventsOpenRegisterId = eventsOpenRegisterId === id ? null : id;
    renderEventsList();
}

function eventRegisterFormHtml(e) {
    const u = currentUser;
    return `
        <form onsubmit="submitEventRegister(event, ${e.id})" class="rounded border border-ukn-200 bg-ukn-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">學號 *</label><input name="student_id" required maxlength="20" value="${esc(u.student_id || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">姓名 *</label><input name="full_name" required maxlength="50" value="${esc(u.full_name || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">Email *</label><input type="email" name="email" required maxlength="100" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">聯絡電話</label><input name="phone" maxlength="30" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">年齡 *</label><input type="number" name="age" required min="1" max="120" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div class="sm:col-span-2"><label class="block text-xs font-semibold text-slate-600 mb-1">備註</label><input name="note" maxlength="200" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div class="sm:col-span-2 flex justify-end gap-2">
                <button type="button" onclick="toggleEventRegister(${e.id})" class="text-sm text-slate-500 px-3 py-2">再想想</button>
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white text-sm font-bold rounded px-4 py-2">送出報名</button>
            </div>
        </form>`;
}

async function submitEventRegister(event, id) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    try {
        const r = await api(`/api/campus/events/${id}/register`, { method: 'POST', json: f });
        toast(r.message, r.data.notified === false ? 'error' : 'ok');
        eventsOpenRegisterId = null;
        loadEvents();
    } catch (e) { toast(e.message, 'error'); }
}

function renderMyEvents() {
    const body = document.getElementById('myEventsBody');
    if (!myEventsList.length) { body.innerHTML = '<div class="text-sm text-slate-500">目前沒有報名紀錄。</div>'; return; }
    body.innerHTML = myEventsList.map(myEventRowHtml).join('');
}

function myEventRowHtml(r) {
    const statusTone = r.status === '已取消' ? 'gray' : r.status === '候補中' ? 'amber' : 'green';
    const notifyHtml = r.status === '已取消' ? '' :
        r.notified ? statusBadge(`✉ 通知信已寄出${r.notified_at ? ' · ' + esc(r.notified_at.slice(0, 16)) : ''}`, 'blue')
                   : statusBadge('⚠ 通知信寄送失敗，請確認信箱或聯絡承辦單位', 'red');
    const canCancel = r.status !== '已取消' && !r.event_over && !r.event_cancelled;
    const canFeedback = r.event_over && r.status !== '已取消' && !r.event_cancelled;
    const canShowQr = r.status === '已報名' && !r.event_over && !r.event_cancelled;
    const isConfirming = eventsCancelConfirm && eventsCancelConfirm.regId === r.id;
    let actionsHtml = '';
    if (isConfirming) {
        actionsHtml = `
            <span class="text-xs text-rose-700">確定要取消這筆報名嗎？</span>
            <button type="button" onclick="cancelCancelConfirm()" class="text-xs text-slate-500 px-2 py-1">再想想</button>
            <button type="button" onclick="confirmCancelEventReg(${r.event_id}, ${r.id})" class="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded px-3 py-1">確定取消</button>`;
    } else {
        if (canCancel) actionsHtml += `<button type="button" onclick="startCancelEventReg(${r.event_id}, ${r.id})" class="text-xs text-rose-700 hover:underline px-2 py-1">取消報名</button>`;
        if (canFeedback) actionsHtml += r.rating ? statusBadge(`已評分 ${r.rating} ★`, 'blue') : `<button type="button" onclick="toggleEventFeedback(${r.event_id})" class="text-xs text-ukn-700 hover:underline px-2 py-1">活動回饋</button>`;
    }
    return `
        <div class="rounded border border-slate-200 p-3 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span class="font-bold text-slate-900">${esc(r.event_title)}</span>
                    <span class="text-xs text-slate-500 ml-2">📅 ${esc(r.event_date)} ${esc(r.event_time || '')} · 📍 ${esc(r.event_location)}</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${r.event_eligibility ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5">👥 ${esc(r.event_eligibility)}</span>` : ''}
                        ${r.event_benefit ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">🏅 ${esc(r.event_benefit)}</span>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">${statusBadge(r.event_cancelled ? '活動已取消' : r.status, r.event_cancelled ? 'red' : statusTone)}${notifyHtml}</div>
            </div>
            <div class="flex items-center justify-end gap-1 flex-wrap">${actionsHtml}</div>
            ${eventsFeedbackOpenId === r.event_id ? eventFeedbackFormHtml(r.event_id) : ''}
            ${canShowQr ? `
                <details class="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                    <summary class="cursor-pointer text-xs font-semibold text-ukn-700">現場簽到 QR Code</summary>
                    <div class="mt-2 flex items-center gap-3">
                        <img loading="lazy" src="/api/campus/events/${r.event_id}/registrations/${r.id}/qr.svg" alt="簽到 QR Code" class="w-28 h-28 bg-white border border-slate-200 rounded p-1">
                        <p class="text-xs text-slate-500">活動現場出示這個 QR Code 給工作人員掃描即可完成簽到，不用再排隊找名字。</p>
                    </div>
                </details>` : ''}
        </div>`;
}

function startCancelEventReg(eventId, regId) {
    eventsCancelConfirm = { eventId, regId };
    renderMyEvents();
}

function cancelCancelConfirm() {
    eventsCancelConfirm = null;
    renderMyEvents();
}

async function confirmCancelEventReg(eventId, regId) {
    try {
        const r = await api(`/api/campus/events/${eventId}/registrations/${regId}/cancel`, { method: 'POST' });
        toast(r.message);
        eventsCancelConfirm = null;
        loadEvents();
    } catch (e) { toast(e.message, 'error'); }
}

function toggleEventFeedback(eventId) {
    eventsFeedbackOpenId = eventsFeedbackOpenId === eventId ? null : eventId;
    renderMyEvents();
}

function eventFeedbackFormHtml(eventId) {
    return `
        <form onsubmit="submitEventFeedback(event, ${eventId})" class="rounded border border-slate-200 bg-slate-50 p-3 space-y-2 text-sm">
            <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-slate-600">評分 *</label>
                <select name="rating" required class="border border-slate-300 rounded px-2 py-1 bg-white">
                    <option value="">請選擇</option>
                    ${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</option>`).join('')}
                </select>
            </div>
            <textarea name="comment" rows="2" maxlength="500" placeholder="想說的話（選填）" class="w-full border border-slate-300 rounded px-3 py-2"></textarea>
            <div class="text-right"><button class="bg-ukn-800 hover:bg-ukn-900 text-white text-xs font-bold rounded px-4 py-2">送出評分</button></div>
        </form>`;
}

async function submitEventFeedback(event, eventId) {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.target));
    try {
        const r = await api(`/api/campus/events/${eventId}/feedback`, { method: 'POST', json: f });
        toast(r.message);
        eventsFeedbackOpenId = null;
        loadEvents();
    } catch (e) { toast(e.message, 'error'); }
}

async function sendBroadcast(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const [target_type, ...rest] = String(fd.get('target') || '').split('|');
    const option = event.target.target.selectedOptions[0];
    if (target_type === '全校' && !confirm(`確定要發給${option ? option.textContent : '全校學生'}？`)) return;
    try {
        const r = await api('/api/campus/broadcast', { json: { target_type, target: rest.join('|'), title: fd.get('title'), content: fd.get('content'), priority: fd.get('priority'), due_date: fd.get('due_date'), reply_required: fd.get('reply_required') === 'on' } });
        toast(r.message);
        loadNoticesTeacher();
    } catch (e) { toast(e.message, 'error'); }
}

async function sendNotice(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const recipients = fd.get('scope') === 'all' ? 'all' : fd.getAll('recipients');
    if (recipients !== 'all' && !recipients.length) { toast('請勾選要通知的學生', 'error'); return; }
    try {
        const r = await api('/api/campus/notices', { json: { class_name: noticeSelectedClass, recipients, title: fd.get('title'), content: fd.get('content'), priority: fd.get('priority'), due_date: fd.get('due_date'), reply_required: fd.get('reply_required') === 'on' } });
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


function noticeReplyHtml(n, readonly) {
    if (!n.reply_required) return '';
    const expired = n.due_date && n.due_date < new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Taipei'}).format(new Date());
    return `<div class="px-4 pb-4 text-sm space-y-2"><p class="font-semibold">回條：${n.my_reply ? esc(n.my_reply.reply) + ' · ' + esc(n.my_reply.reply_at) : '尚未回覆'}</p>
        ${readonly ? '' : expired ? '<p class="text-slate-500">回條已截止</p>' : `<form onsubmit="submitNoticeReply(event, ${n.id})" class="flex flex-wrap gap-2">
        <select name="reply" aria-label="回條內容" class="border rounded px-3 py-2">${['收到', '會參加', '無法參加', '需要協助'].map(v => `<option ${n.my_reply?.reply === v ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="bg-ukn-800 text-white rounded px-3 py-2">${n.my_reply ? '更新回條' : '送出回條'}</button></form>`}</div>`;
}

function sentReplyHtml(n) {
    if (!n.reply_required) return '';
    return `<div class="mt-3 rounded bg-slate-50 p-3 text-sm space-y-2"><b>回條 ${n.reply_count} / ${n.total}</b>
        ${n.due_date ? `<span class="ml-2 text-xs">期限 ${esc(n.due_date)}</span>` : ''}
        <p class="text-amber-800">未回覆：${n.pending_reply_names.map(esc).join('、') || '無'}</p>
        <ul>${n.reply_details.map(r => `<li>${esc(r.full_name)}（${esc(r.student_id)}）：${esc(r.reply)} · ${esc(r.reply_at)}</li>`).join('')}</ul>
        ${n.pending_reply_names.length ? `<button type="button" onclick="remindNotice(${n.id}, this)" class="border border-ukn-300 rounded px-3 py-1 text-ukn-800">只提醒未回覆學生</button>` : ''}</div>`;
}

async function submitNoticeReply(event, id) {
    event.preventDefault();
    const button = event.target.querySelector('button');
    button.disabled = true;
    try {
        const r = await api(`/api/campus/notices/${id}/reply`, {json: {reply: new FormData(event.target).get('reply')}});
        toast(r.message); await loadNotices(); pollNotices(false);
    } catch (e) { toast(e.message, 'error'); }
    finally { button.disabled = false; }
}

async function remindNotice(id, button) {
    button.disabled = true;
    try { const r = await api(`/api/campus/notices/${id}/remind`, {method: 'POST'}); toast(r.message); await loadNoticesTeacher(); }
    catch (e) { toast(e.message, 'error'); }
    finally { button.disabled = false; }
}
