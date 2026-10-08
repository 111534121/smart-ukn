// 報表／文件庫：依身分顯示可下載檔案、收藏、下載次數；教職員/管理員可上傳、刪除、查看下載統計。
// 依賴 campus-shell.js (api、tabLoaders、toast、openModal、closeModal、loginPrompt) 與 index.html (currentUser、escapeHtml、isStaff)。

const RP_ROLES = ['學生', '家長', '老師', '教職員', '管理員'];
let rpFiles = [];
let rpCategories = [];
let rpCategoryFilter = '';

function rpCanManage() { return isLoggedIn() && isStaff(); }

async function loadReports() {
    const body = document.getElementById('reportsBody');
    body.innerHTML = '<div class="text-sm text-slate-400 py-6 text-center">載入中…</div>';
    try {
        const [filesRes, catRes] = await Promise.all([
            api(rpCategoryFilter ? `/api/campus/reports?category=${encodeURIComponent(rpCategoryFilter)}` : '/api/campus/reports'),
            api('/api/campus/reports/categories'),
        ]);
        rpFiles = filesRes.data;
        rpCategories = catRes.data;
    } catch (e) {
        body.innerHTML = `<div class="text-sm text-rose-700">${escapeHtml(e.message)}</div>`;
        return;
    }
    rpRender();
}

function rpCatBtnClass(active) {
    return active ? 'text-xs font-bold px-3 py-1.5 rounded-full bg-ukn-800 text-white'
                  : 'text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200';
}

function rpRender() {
    const body = document.getElementById('reportsBody');
    body.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div class="flex flex-wrap items-center gap-1.5" id="rpCatFilters">
                <button type="button" onclick="rpFilterCategory('')" class="${rpCatBtnClass(!rpCategoryFilter)}">全部</button>
                ${rpCategories.map(c => `<button type="button" onclick="rpFilterCategory('${escapeHtml(c)}')" class="${rpCatBtnClass(rpCategoryFilter === c)}">${escapeHtml(c)}</button>`).join('')}
            </div>
            ${rpCanManage() ? `<button type="button" onclick="rpOpenUploadModal()" class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-4 py-2 text-sm whitespace-nowrap">＋ 上傳檔案</button>` : ''}
        </div>
        <div id="rpList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>`;
    rpRenderList();
}

function rpFileIcon(type) { return type === 'pdf' ? '📄' : '🖼️'; }

function rpRenderList() {
    const list = document.getElementById('rpList');
    if (!rpFiles.length) {
        list.innerHTML = `<div class="col-span-full text-sm text-slate-400 py-8 text-center bg-slate-50 rounded border border-slate-200">目前沒有可查看的檔案。</div>`;
        return;
    }
    list.innerHTML = rpFiles.map(f => `
        <div class="border border-slate-200 rounded p-4 space-y-2.5 hover:border-ukn-300 transition">
            <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-2xl shrink-0">${rpFileIcon(f.file_type)}</span>
                    <div class="min-w-0">
                        <div class="font-bold text-slate-900 text-sm truncate" title="${escapeHtml(f.title)}">${escapeHtml(f.title)}</div>
                        <div class="text-[11px] text-slate-500">${escapeHtml(f.category)} · ${escapeHtml(f.uploaded_at.slice(0, 10))}</div>
                    </div>
                </div>
                ${isLoggedIn() ? `<button type="button" onclick="rpToggleFavorite(${f.id})" class="shrink-0 text-lg leading-none ${f.is_favorited ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}" title="${f.is_favorited ? '取消收藏' : '收藏'}">${f.is_favorited ? '★' : '☆'}</button>` : ''}
            </div>
            ${f.description ? `<p class="text-xs text-slate-600 leading-relaxed line-clamp-2">${escapeHtml(f.description)}</p>` : ''}
            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>下載次數：${f.download_count}</span>
                ${f.allowed_roles.includes('all') ? '<span>所有身分可下載</span>' : `<span title="僅限：${f.allowed_roles.join('、')}">🔒 ${escapeHtml(f.allowed_roles.join('、'))}</span>`}
            </div>
            <div class="flex items-center gap-2 pt-1">
                <a href="/api/campus/reports/${f.id}/download" onclick="rpTrackDownload(${f.id})" class="flex-1 text-center bg-ukn-50 hover:bg-ukn-100 text-ukn-800 font-semibold text-xs rounded py-2 border border-ukn-200">下載</a>
                ${rpCanManage() ? `
                    <button type="button" onclick="rpOpenStats(${f.id})" class="text-xs border border-slate-300 hover:border-ukn-400 rounded px-2.5 py-2" title="下載統計">📊</button>
                    <button type="button" onclick="rpDeleteFile(${f.id})" class="text-xs border border-rose-200 text-rose-700 hover:bg-rose-50 rounded px-2.5 py-2" title="刪除">🗑️</button>` : ''}
            </div>
        </div>`).join('');
}

function rpTrackDownload(id) {
    // 下載次數已由後端 /download 路由記錄；這裡只做前端顯示上的樂觀更新，避免要整頁重新整理才看得到次數變化
    const f = rpFiles.find(x => x.id === id);
    if (f) { f.download_count += 1; rpRenderList(); }
}

function rpFilterCategory(cat) {
    rpCategoryFilter = cat;
    loadReports();
}

async function rpToggleFavorite(id) {
    if (!isLoggedIn()) { openModal('收藏檔案', loginPrompt('登入後就能收藏檔案，有新的同分類資料會寄信通知你。')); return; }
    const f = rpFiles.find(x => x.id === id);
    if (!f) return;
    try {
        await api(`/api/campus/reports/${id}/favorite`, { method: f.is_favorited ? 'DELETE' : 'POST' });
        f.is_favorited = !f.is_favorited;
        rpRenderList();
    } catch (e) { toast(e.message, 'error'); }
}

function rpOpenUploadModal() {
    openModal('上傳檔案', `
        <form onsubmit="rpSubmitUpload(event)" class="space-y-3">
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">標題</label>
                <input name="title" required maxlength="100" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">分類（同分類會一起篩選，也用來通知曾下載/收藏過同分類的人）</label>
                <input name="category" required maxlength="30" list="rpCategoryList" class="w-full border border-slate-300 rounded px-3 py-2">
                <datalist id="rpCategoryList">${rpCategories.map(c => `<option value="${escapeHtml(c)}">`).join('')}</datalist></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">說明（選填）</label>
                <textarea name="description" rows="2" maxlength="300" class="w-full border border-slate-300 rounded px-3 py-2"></textarea></div>
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">檔案（PDF、PNG、JPG、WEBP）</label>
                <input type="file" name="file" required accept=".pdf,.png,.jpg,.jpeg,.webp" class="w-full text-sm"></div>
            <div><span class="block text-xs font-semibold text-slate-600 mb-1">可下載身分</span>
                <label class="flex items-center gap-1.5 text-sm mb-1"><input type="radio" name="scope" value="all" checked onchange="rpToggleRoleBox(false)"> 所有人（含未登入）</label>
                <label class="flex items-center gap-1.5 text-sm"><input type="radio" name="scope" value="limited" onchange="rpToggleRoleBox(true)"> 僅限特定身分</label>
                <div id="rpRoleBox" class="hidden flex flex-wrap gap-2 mt-2 pl-5">
                    ${RP_ROLES.map(r => `<label class="flex items-center gap-1 text-xs border border-slate-200 rounded px-2 py-1"><input type="checkbox" name="roles" value="${r}"> ${r}</label>`).join('')}
                </div>
            </div>
            <p id="rpUploadError" class="hidden text-xs text-rose-700"></p>
            <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2">上傳</button>
        </form>`);
}

function rpToggleRoleBox(show) {
    document.getElementById('rpRoleBox').classList.toggle('hidden', !show);
}

async function rpSubmitUpload(event) {
    event.preventDefault();
    const form = event.target;
    const fd = new FormData(form);
    const scope = fd.get('scope');
    fd.delete('scope');
    if (scope === 'all') {
        fd.set('allowed_roles', 'all');
    } else {
        const roles = [...form.querySelectorAll('input[name="roles"]:checked')].map(c => c.value);
        fd.delete('roles');
        fd.set('allowed_roles', roles.join(','));
    }
    try {
        const res = await api('/api/campus/reports', { method: 'POST', body: fd });
        closeModal();
        toast(res.message);
        loadReports();
    } catch (e) {
        const err = document.getElementById('rpUploadError');
        err.textContent = e.message;
        err.classList.remove('hidden');
    }
}

async function rpDeleteFile(id) {
    const f = rpFiles.find(x => x.id === id);
    if (!confirm(`確定要刪除「${f ? f.title : ''}」嗎？刪除後無法復原。`)) return;
    try {
        const res = await api(`/api/campus/reports/${id}`, { method: 'DELETE' });
        toast(res.message);
        loadReports();
    } catch (e) { toast(e.message, 'error'); }
}

async function rpOpenStats(id) {
    try {
        const res = await api(`/api/campus/reports/${id}/stats`);
        const s = res.data;
        openModal(`下載統計：${s.file.title}`, `
            <div class="grid grid-cols-3 gap-2 text-center mb-4">
                <div class="bg-slate-50 rounded p-3"><div class="text-2xl font-bold text-ukn-800">${s.total_downloads}</div><div class="text-[11px] text-slate-500">成功下載</div></div>
                <div class="bg-slate-50 rounded p-3"><div class="text-2xl font-bold text-slate-700">${s.total_views}</div><div class="text-[11px] text-slate-500">瀏覽次數</div></div>
                <div class="bg-slate-50 rounded p-3"><div class="text-2xl font-bold text-rose-700">${s.denied_attempts}</div><div class="text-[11px] text-slate-500">被拒絕嘗試</div></div>
            </div>
            <div class="text-xs font-bold text-slate-600 mb-1.5">依身分下載次數</div>
            <div class="flex flex-wrap gap-2 mb-4">
                ${Object.entries(s.downloads_by_role).map(([role, n]) => `<span class="text-xs bg-ukn-50 text-ukn-800 border border-ukn-200 rounded-full px-2.5 py-1">${escapeHtml(role)}：${n}</span>`).join('') || '<span class="text-xs text-slate-400">尚無下載紀錄</span>'}
            </div>
            <div class="text-xs font-bold text-slate-600 mb-1.5">最近存取紀錄（含被拒絕）</div>
            <div class="max-h-56 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100">
                ${s.recent_downloads.map(d => `
                    <div class="flex items-center justify-between px-3 py-1.5 text-xs">
                        <span>${escapeHtml(d.username || '訪客')} <span class="text-slate-400">(${escapeHtml(d.role)})</span></span>
                        <span class="${d.result === 'denied' ? 'text-rose-700' : 'text-emerald-700'}">${d.result === 'denied' ? '被拒絕' : '成功'} · ${escapeHtml(d.downloaded_at.slice(5, 16))}</span>
                    </div>`).join('') || '<div class="px-3 py-3 text-xs text-slate-400 text-center">尚無存取紀錄</div>'}
            </div>`);
    } catch (e) { toast(e.message, 'error'); }
}

tabLoaders['tab-reports'] = loadReports;
