// 教師專長查詢：關鍵字 (含同義詞)、領域、科別、可指導專題篩選；老師可編輯自己的專長。
// 依賴 campus-shell.js (api、tabLoaders、openModal、toast…)、dept-scope.js (deptPref) 與 index.html (currentUser、escapeHtml)。

const facultyState = { q: '', field: '', dept: '', projects: false, initialized: false };
let facultySearchTimer = null;
let facultyLastData = null;

const FACULTY_STATUS_TONE = {
    '上課中': 'bg-amber-50 border-amber-200 text-amber-900',
    '可以找老師': 'bg-emerald-50 border-emerald-200 text-emerald-800',
    '沒有課': 'bg-sky-50 border-sky-200 text-sky-800',
    '非上班時間': 'bg-slate-50 border-slate-200 text-slate-500'
};

function renderFacultyShell() {
    document.getElementById('facultyBody').innerHTML = `
        <div class="flex flex-col md:flex-row gap-2">
            <label class="flex-1 relative">
                <span class="sr-only">搜尋專長或老師姓名</span>
                <input id="facultyQuery" type="search" maxlength="50" placeholder="例如：AI、網頁、資安、長照、多益、統計"
                    class="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ukn-500">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </label>
            <select id="facultyDept" aria-label="科別" class="border border-slate-300 rounded px-2 py-2 text-sm bg-white"><option value="">全部科別</option></select>
            <label class="flex items-center gap-1.5 text-sm text-slate-700 whitespace-nowrap px-1">
                <input id="facultyProjects" type="checkbox" class="accent-ukn-700"> 只看可指導專題
            </label>
        </div>
        <div id="facultyFields" class="flex flex-wrap gap-1.5" role="group" aria-label="依領域篩選"></div>
        <p id="facultySummary" class="text-xs text-slate-500" role="status"></p>
        <div id="facultyResults" class="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>`;
    const input = document.getElementById('facultyQuery');
    input.addEventListener('input', () => {
        clearTimeout(facultySearchTimer);
        facultySearchTimer = setTimeout(() => { facultyState.q = input.value.trim(); searchFaculty(); }, 300);
    });
    document.getElementById('facultyDept').addEventListener('change', e => { facultyState.dept = e.target.value; searchFaculty(); });
    document.getElementById('facultyProjects').addEventListener('change', e => { facultyState.projects = e.target.checked; searchFaculty(); });
}

async function loadFaculty() {
    if (!document.getElementById('facultyQuery')) renderFacultyShell();
    document.getElementById('facultyEditMineBtn').classList.toggle('hidden', currentUser.role !== '老師');
    await searchFaculty();
}

// 【功能：教師專長查詢】畫面：關鍵字、領域、科別篩選後呼叫 /api/faculty
async function searchFaculty() {
    const params = new URLSearchParams();
    if (facultyState.q) params.set('q', facultyState.q);
    if (facultyState.field) params.set('field', facultyState.field);
    if (facultyState.dept) params.set('dept', facultyState.dept);
    if (facultyState.projects) params.set('projects', '1');
    const results = document.getElementById('facultyResults');
    try {
        const data = await api(`/api/faculty?${params}`);
        facultyLastData = data;
        // 第一次載入：「只看本科」時預設篩選本科老師
        if (!facultyState.initialized) {
            facultyState.initialized = true;
            const mine = deptPref && deptPref.content_scope === 'mine' && deptPref.dept_name
                ? data.depts.find(d => deptPref.dept_name.includes(d) || d.includes(shortDeptName(deptPref.dept_name))) : null;
            document.getElementById('facultyDept').innerHTML = '<option value="">全部科別</option>' +
                data.depts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
            if (mine) {
                facultyState.dept = mine;
                document.getElementById('facultyDept').value = mine;
                return searchFaculty();
            }
        }
        renderFacultyFields(data.fields);
        renderFacultyResults(data);
    } catch (e) {
        results.innerHTML = `<div class="text-sm text-rose-700">${escapeHtml(e.message)}</div>`;
    }
}

function renderFacultyFields(fields) {
    document.getElementById('facultyFields').innerHTML = fields.filter(f => f.count).map(f => {
        const on = facultyState.field === f.name;
        return `<button type="button" aria-pressed="${on}" onclick="toggleFacultyField('${escapeHtml(f.name)}')"
            class="text-xs rounded-full border px-2.5 py-1 transition ${on ? 'bg-ukn-800 border-ukn-800 text-white' : 'border-slate-300 text-slate-700 hover:border-ukn-500'}">
            ${escapeHtml(f.name)} <span class="opacity-70">${f.count}</span></button>`;
    }).join('');
}

function toggleFacultyField(name) {
    facultyState.field = facultyState.field === name ? '' : name;
    searchFaculty();
}

function renderFacultyResults(data) {
    const summary = document.getElementById('facultySummary');
    const parts = [`找到 ${data.data.length} 位老師`];
    if (data.expanded_terms.length) parts.push(`也一併找了：${data.expanded_terms.join('、')}`);
    summary.textContent = parts.join('，');

    document.getElementById('facultyResults').innerHTML = data.data.length ? data.data.map(t => {
        const matched = new Set(t.matched_tags);
        const status = t.status ? `<span class="text-[11px] border rounded px-1.5 py-0.5 whitespace-nowrap ${FACULTY_STATUS_TONE[t.status.state] || ''}" title="${escapeHtml(t.status.detail)}">${escapeHtml(t.status.state)}</span>` : '';
        return `
            <article class="rounded border border-slate-200 p-4 space-y-2.5 ${t.name === data.my_name ? 'ring-2 ring-ukn-200' : ''}">
                <div class="flex items-start justify-between gap-2">
                    ${t.photo_url ? `<img src="${escapeHtml(t.photo_url)}" alt="${escapeHtml(t.name)} 老師的照片" loading="lazy" class="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0">` : ''}
                    <div class="flex-1">
                        <h3 class="font-bold text-slate-900">${escapeHtml(t.name)} <span class="text-xs font-normal text-slate-500">${escapeHtml(t.title || '')}</span></h3>
                        <div class="text-xs text-slate-500">${escapeHtml(t.dept_name)}</div>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        ${status}
                        ${t.profile_missing ? '' : t.accepts_projects ? '<span class="text-[11px] text-emerald-700 font-semibold whitespace-nowrap">✓ 可指導專題</span>' : '<span class="text-[11px] text-slate-400 whitespace-nowrap">目前不收專題生</span>'}
                    </div>
                </div>
                ${t.profile_missing ? '<p class="text-[11px] text-slate-400">老師的專長資料尚未建立，可以先看授課課程或直接聯絡老師。</p>' : ''}
                <div class="flex flex-wrap gap-1">${t.expertise.map(x => `<span class="text-[11px] rounded px-1.5 py-0.5 ${matched.has(x) ? 'bg-accent-500 text-white font-semibold' : 'bg-ukn-50 text-ukn-800'}">${escapeHtml(x)}</span>`).join('')}</div>
                ${t.research_summary ? `<p class="text-xs text-slate-700 leading-relaxed">${escapeHtml(t.research_summary)}</p>` : ''}
                ${t.courses.length ? `<p class="text-[11px] text-slate-500">授課：${t.courses.map(escapeHtml).join('、')}</p>` : ''}
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                    ${t.office ? `<span>📍 ${escapeHtml(t.office.building)} ${escapeHtml(t.office.room)}</span><span>☎️ ${escapeHtml(t.office.ext)}</span>` : ''}
                    ${t.email ? `<a href="mailto:${escapeHtml(t.email)}" class="text-ukn-700 hover:underline">✉️ ${escapeHtml(t.email)}</a>` : ''}
                    ${t.status ? `<span class="text-slate-400">${escapeHtml(t.status.detail)}</span>` : ''}
                    ${t.office ? `<button type="button" onclick="switchTab('tab-map')" class="ml-auto text-ukn-700 font-semibold hover:underline">在地圖上找 ➔</button>` : ''}
                </div>
            </article>`;
    }).join('') : `<div class="lg:col-span-2 p-6 text-center text-sm text-slate-500 bg-slate-50 rounded border border-slate-200">
            找不到符合的老師。可以換個說法（例如「資料分析」改成「統計」），或清除領域篩選。</div>`;
}

async function openMyFacultyProfile() {
    let mine;
    try { mine = await api('/api/faculty/me'); } catch (e) { toast(e.message, 'error'); return; }
    const p = mine.data;
    openModal('編輯我的專長', `
        <form onsubmit="saveMyFacultyProfile(event)" class="space-y-3">
            <fieldset><legend class="text-xs font-semibold text-slate-600 mb-1">領域 (可複選)</legend>
                <div class="grid grid-cols-2 gap-1">${mine.fields_available.map(f => `
                    <label class="flex items-center gap-1.5 text-xs"><input type="checkbox" name="fields" value="${escapeHtml(f)}" ${p.fields.includes(f) ? 'checked' : ''}> ${escapeHtml(f)}</label>`).join('')}</div>
            </fieldset>
            <label class="block space-y-1"><span class="block text-xs font-semibold text-slate-600">專長關鍵字 (用逗號或頓號分隔，最多 12 項)</span>
                <input name="expertise" required value="${escapeHtml(p.expertise.join('、'))}" class="w-full border border-slate-300 rounded px-3 py-2"></label>
            <label class="block space-y-1"><span class="block text-xs font-semibold text-slate-600">研究與指導方向簡介</span>
                <textarea name="research_summary" maxlength="500" rows="3" class="w-full border border-slate-300 rounded px-3 py-2">${escapeHtml(p.research_summary || '')}</textarea></label>
            <label class="block space-y-1"><span class="block text-xs font-semibold text-slate-600">聯絡 Email (選填)</span>
                <input name="email" type="email" maxlength="100" value="${escapeHtml(p.email || '')}" class="w-full border border-slate-300 rounded px-3 py-2"></label>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="accepts_projects" ${p.accepts_projects ? 'checked' : ''}> 目前可指導專題</label>
            <p class="text-[11px] text-slate-500">姓名、科別與是否公開由教務處在後台維護。</p>
            <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2">儲存</button>
        </form>`);
}

async function saveMyFacultyProfile(event) {
    event.preventDefault();
    const f = new FormData(event.target);
    try {
        await api('/api/faculty/me', { method: 'PUT', json: {
            fields: f.getAll('fields'), expertise: f.get('expertise'), research_summary: f.get('research_summary'),
            email: f.get('email'), accepts_projects: f.get('accepts_projects') === 'on' } });
        closeModal();
        toast('已更新你的專長資料');
        searchFaculty();
    } catch (e) { toast(e.message, 'error'); }
}

tabLoaders['tab-faculty'] = loadFaculty;
