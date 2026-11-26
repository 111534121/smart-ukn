// 老師辦公室與目前狀態（整合教師專長查詢）：
// 關鍵字 (含同義詞)、領域、科別、服務單位、可指導專題篩選，並整合課表、即時狀態、辦公室位置與地圖定位；老師可編輯自己的專長。
// 依賴 campus-shell.js (api、openModal、toast…)、campus-life.js (teacherAvatar、TEACHER_TONE、showTeacherTimetable、showOnMap、loadTeachers)、dept-scope.js (deptPref) 與 index.html (currentUser、escapeHtml)。

const facultyState = { q: '', field: '', dept: '', unit: '', projects: false, initialized: false };
let facultySearchTimer = null;
let facultyLastData = null;

const FACULTY_STATUS_TONE = {
    '上課中': 'bg-amber-50 border-amber-200 text-amber-900',
    '可以找老師': 'bg-emerald-50 border-emerald-200 text-emerald-800',
    '沒有課': 'bg-sky-50 border-sky-200 text-sky-800',
    '非上班時間': 'bg-slate-50 border-slate-200 text-slate-500'
};

function renderFacultyShell() {
    const host = document.getElementById('teachersBody');
    if (!host) return;
    host.innerHTML = `
        <div class="space-y-3">
            <div class="flex flex-col md:flex-row flex-wrap gap-2">
                <label class="flex-1 min-w-[220px] relative">
                    <span class="sr-only">搜尋老師姓名、專長或授課課程</span>
                    <input id="facultyQuery" type="search" maxlength="50" placeholder="搜尋老師姓名或專長，例如：彭賓鈺、AI、網頁、資安、長照、多益"
                        class="w-full border border-slate-300 rounded px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-ukn-500">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </label>
                <select id="facultyDept" aria-label="依科別篩選" class="border border-slate-300 rounded px-2 py-2 text-sm bg-white"><option value="">全部科別</option></select>
                <select id="teacherUnitFilter" aria-label="依服務單位篩選" class="border border-slate-300 rounded px-2 py-2 text-sm bg-white"><option value="">全部服務單位</option></select>
                <label class="flex items-center gap-1.5 text-sm text-slate-700 whitespace-nowrap px-1">
                    <input id="facultyProjects" type="checkbox" class="accent-ukn-700"> 只看可指導專題
                </label>
            </div>
            <div id="facultyFields" class="flex flex-wrap gap-1.5" role="group" aria-label="依領域篩選"></div>
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <p id="facultySummary" role="status"></p>
                <span id="teacherStatusMeta"></span>
            </div>
            <div id="facultyResults" class="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
            <p class="text-[11px] text-slate-400">老師辦公室、分機、可以找老師的時間與專長資料由學校後台維護，以各科公告為準。</p>
        </div>`;
    const input = document.getElementById('facultyQuery');
    input.value = facultyState.q;
    input.addEventListener('input', () => {
        clearTimeout(facultySearchTimer);
        facultySearchTimer = setTimeout(() => { facultyState.q = input.value.trim(); searchFaculty(); }, 300);
    });
    document.getElementById('facultyDept').addEventListener('change', e => { facultyState.dept = e.target.value; searchFaculty(); });
    document.getElementById('teacherUnitFilter').addEventListener('change', e => {
        facultyState.unit = e.target.value;
        if (facultyLastData) renderFacultyResults(facultyLastData);
        else searchFaculty();
    });
    const projBox = document.getElementById('facultyProjects');
    projBox.checked = facultyState.projects;
    projBox.addEventListener('change', e => { facultyState.projects = e.target.checked; searchFaculty(); });
}

function syncTeacherDirectoryMeta() {
    const unitSel = document.getElementById('teacherUnitFilter');
    const units = window._teachers?.units || [];
    if (unitSel) {
        unitSel.innerHTML = '<option value="">全部服務單位</option>' +
            units.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('');
        unitSel.value = units.includes(facultyState.unit) ? facultyState.unit : '';
        if (unitSel.value !== facultyState.unit) facultyState.unit = '';
    }
    const meta = document.getElementById('teacherStatusMeta');
    if (meta) {
        const nowStr = window._teachers?.now ? window._teachers.now.slice(5).replace('-', '/') : '';
        meta.innerHTML = `${nowStr ? `狀態依課表推算 · ${escapeHtml(nowStr)} 更新 ` : ''}<button type="button" onclick="loadTeachers()" class="text-ukn-700 hover:underline ml-1">重新整理</button>`;
    }
}

async function loadFaculty() {
    if (!document.getElementById('teachersBody')) return;
    if (!document.getElementById('facultyQuery')) renderFacultyShell();
    syncTeacherDirectoryMeta();
    const editBtn = document.getElementById('facultyEditMineBtn');
    if (editBtn) editBtn.classList.toggle('hidden', currentUser.role !== '老師');
    await searchFaculty();
}

// 【功能：老師辦公室與教師專長查詢】畫面：關鍵字、領域、科別、服務單位與專題篩選後呼叫 /api/faculty 並合併 /api/campus/teachers
async function searchFaculty() {
    const params = new URLSearchParams();
    if (facultyState.q) params.set('q', facultyState.q);
    if (facultyState.field) params.set('field', facultyState.field);
    if (facultyState.dept) params.set('dept', facultyState.dept);
    if (facultyState.projects) params.set('projects', '1');
    const results = document.getElementById('facultyResults');
    if (!results) return;
    try {
        const data = await api(`/api/faculty?${params}`);
        facultyLastData = data;
        // 第一次載入：「只看本科」時預設篩選本科老師
        if (!facultyState.initialized) {
            facultyState.initialized = true;
            const mine = deptPref && deptPref.content_scope === 'mine' && deptPref.dept_name
                ? data.depts.find(d => deptPref.dept_name.includes(d) || d.includes(shortDeptName(deptPref.dept_name))) : null;
            const deptSel = document.getElementById('facultyDept');
            deptSel.innerHTML = '<option value="">全部科別</option>' +
                data.depts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
            if (mine) {
                facultyState.dept = mine;
                deptSel.value = mine;
                return searchFaculty();
            }
            deptSel.value = facultyState.dept || '';
        }
        renderFacultyFields(data.fields);
        renderFacultyResults(data);
    } catch (e) {
        results.innerHTML = `<div class="text-sm text-rose-700">${escapeHtml(e.message)}</div>`;
    }
}

function renderFacultyFields(fields) {
    const el = document.getElementById('facultyFields');
    if (!el) return;
    el.innerHTML = fields.filter(f => f.count).map(f => {
        const on = facultyState.field === f.name;
        const safeField = JSON.stringify(f.name).replace(/"/g, '&quot;');
        return `<button type="button" aria-pressed="${on}" onclick="toggleFacultyField(${safeField})"
            class="text-xs rounded-full border px-2.5 py-1 transition ${on ? 'bg-ukn-800 border-ukn-800 text-white' : 'border-slate-300 text-slate-700 hover:border-ukn-500'}">
            ${escapeHtml(f.name)} <span class="opacity-70">${f.count}</span></button>`;
    }).join('');
}

function toggleFacultyField(name) {
    facultyState.field = facultyState.field === name ? '' : name;
    searchFaculty();
}

function normalizeTeacherName(name) {
    const raw = String(name || '').trim();
    return raw.replace(/老師$/u, '').trim() || raw;
}

function renderFacultyResults(data) {
    const dirMap = new Map();
    for (const d of (window._teachers?.data || [])) {
        const k = normalizeTeacherName(d.name);
        if (k && !dirMap.has(k)) dirMap.set(k, d);
    }
    const seen = new Set();
    let items = [];
    for (const t of (data.data || [])) {
        const raw = String(t.name || '').trim();
        const k = normalizeTeacherName(raw);
        if (!raw || seen.has(k)) continue;
        seen.add(k);
        items.push({ ...t, name: raw, _dir: dirMap.get(k) || null });
    }

    if (facultyState.unit) {
        items = items.filter(t => (t._dir?.unit || t.dept_name) === facultyState.unit);
    }

    if (!facultyState.q) {
        items.sort((a, b) => {
            const aOfficial = (a._dir?.registered || !a.profile_missing) ? 0 : 1;
            const bOfficial = (b._dir?.registered || !b.profile_missing) ? 0 : 1;
            if (aOfficial !== bOfficial) return aOfficial - bOfficial;
            return (a.dept_name || '').localeCompare(b.dept_name || '', 'zh-Hant') || (a.name || '').localeCompare(b.name || '', 'zh-Hant');
        });
    }

    const summary = document.getElementById('facultySummary');
    if (summary) {
        const parts = [`共找到 ${items.length} 位老師`];
        if (data.expanded_terms && data.expanded_terms.length) parts.push(`也一併找了：${data.expanded_terms.join('、')}`);
        summary.textContent = parts.join('，');
    }

    const weekdayLabel = wd => (typeof WEEKDAY_TEXT !== 'undefined' && WEEKDAY_TEXT[wd]) ? WEEKDAY_TEXT[wd] : wd;

    document.getElementById('facultyResults').innerHTML = items.length ? items.map(t => {
        const dir = t._dir;
        const matched = new Set(t.matched_tags || []);
        const statusObj = dir?.status || t.status;
        const statusHtml = statusObj
            ? (typeof statusBadge === 'function' && typeof TEACHER_TONE !== 'undefined'
                ? statusBadge(statusObj.state, TEACHER_TONE[statusObj.state])
                : `<span class="text-[11px] border rounded px-1.5 py-0.5 whitespace-nowrap ${FACULTY_STATUS_TONE[statusObj.state] || ''}" title="${escapeHtml(statusObj.detail || '')}">${escapeHtml(statusObj.state)}</span>`)
            : '';
        const photoUrl = dir?.photo_url || t.photo_url || '';
        const avatarHtml = typeof teacherAvatar === 'function'
            ? teacherAvatar({ name: t.name, photo_url: photoUrl })
            : (photoUrl ? `<img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(t.name)} 老師的照片" loading="lazy" class="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0">` : '');
        const deptLabel = dir?.dept || (t.dept_name && t.dept_name !== '科別尚未登錄' ? t.dept_name : '');
        const unitLabel = dir?.unit && dir.unit !== deptLabel ? dir.unit : '';
        const titleLabel = dir?.title || t.title || '';
        const metaLine = [deptLabel, unitLabel, titleLabel].filter(Boolean).map(escapeHtml).join(' · ') || '科系與服務單位尚未登錄';

        const buildingName = dir?.building_name || t.office?.building || '';
        const officeRoom = dir?.office || t.office?.room || '';
        const ext = dir?.ext || t.office?.ext || '';
        const officeHours = (dir?.office_hours && dir.office_hours.length ? dir.office_hours : t.office?.office_hours) || [];
        const email = t.email || dir?.email || '';
        const courses = t.courses || [];
        const hasTimetable = Boolean(dir && window._teachers?.periods);
        const mapLocation = buildingName && officeRoom ? `${buildingName} ${officeRoom}` : (buildingName || officeRoom);
        const safeNameArg = JSON.stringify(t.name).replace(/"/g, '&quot;');
        const safeMapArg = JSON.stringify(mapLocation).replace(/"/g, '&quot;');

        return `
            <article class="rounded border border-slate-200 p-4 space-y-2.5 flex flex-col justify-between ${t.name === data.my_name ? 'ring-2 ring-ukn-200' : ''}" data-teacher-name="${escapeHtml(t.name)}">
                <div class="space-y-2.5">
                    <div class="flex items-start gap-3">
                        ${avatarHtml}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <h3 class="font-bold text-slate-900">${escapeHtml(t.name)} 老師</h3>
                                <div class="flex flex-col items-end gap-1 shrink-0">
                                    ${statusHtml}
                                    ${t.profile_missing ? '' : t.accepts_projects ? '<span class="text-[11px] text-emerald-700 font-semibold whitespace-nowrap">✓ 可指導專題</span>' : '<span class="text-[11px] text-slate-400 whitespace-nowrap">目前不收專題生</span>'}
                                </div>
                            </div>
                            <div class="text-xs text-slate-500 mt-0.5">${metaLine}</div>
                        </div>
                    </div>
                    ${statusObj?.detail ? `<div class="text-xs text-slate-700 bg-slate-50 rounded px-2.5 py-1.5 border border-slate-100">${escapeHtml(statusObj.detail)}</div>` : ''}
                    ${t.expertise.length ? `<div class="flex flex-wrap gap-1">${t.expertise.map(x => `<span class="text-[11px] rounded px-1.5 py-0.5 ${matched.has(x) ? 'bg-accent-500 text-white font-semibold' : 'bg-ukn-50 text-ukn-800'}">${escapeHtml(x)}</span>`).join('')}</div>`
                        : (t.profile_missing ? '<p class="text-[11px] text-slate-400">老師的專長資料尚未建立，可以先看課表或直接聯絡老師。</p>' : '')}
                    ${t.research_summary ? `<p class="text-xs text-slate-700 leading-relaxed">${escapeHtml(t.research_summary)}</p>` : ''}
                    ${courses.length ? `<p class="text-[11px] text-slate-500">📚 授課：${courses.map(escapeHtml).join('、')}</p>` : ''}
                    <div class="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                        ${officeRoom ? `<div>🚪 ${escapeHtml(buildingName)} ${escapeHtml(officeRoom)}${ext ? ` · ☎️ ${escapeHtml(ext)}` : ''}</div>` : '<div class="text-slate-400">🚪 辦公室資料尚未登錄，可以先在課堂上或寄信找老師</div>'}
                        ${officeHours.length ? `<div>🕒 可以找老師的時間：${officeHours.map(o => `週${weekdayLabel(o.weekday)} ${o.start}–${o.end}`).join('、')}</div>` : ''}
                        ${email ? `<a href="mailto:${escapeHtml(email)}" class="inline-block text-ukn-700 hover:underline">✉️ ${escapeHtml(email)}</a>` : ''}
                    </div>
                </div>
                ${(hasTimetable || mapLocation) ? `<div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    ${hasTimetable ? `<button type="button" onclick="showTeacherTimetable(${safeNameArg})" class="text-xs border border-slate-300 rounded px-2.5 py-1 hover:border-ukn-500">🗓️ 看課表</button>` : ''}
                    ${mapLocation ? `<button type="button" onclick="showOnMap(${safeMapArg})" class="text-xs border border-slate-300 rounded px-2.5 py-1 hover:border-ukn-500">在地圖上看 🗺️</button>` : ''}
                </div>` : ''}
            </article>`;
    }).join('') : `<div class="lg:col-span-2 p-6 text-center text-sm text-slate-500 bg-slate-50 rounded border border-slate-200">
            找不到符合的老師。可以換個說法（例如「資料分析」改成「統計」），或清除領域／科別／服務單位篩選。</div>`;
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
