// 學期學習自評表：每學期一份，1–5 分自評 + 文字反思；草稿自動儲存，可刪除，可與上學期比較。
// 依賴 campus-shell.js (api、tabLoaders、toast、loginPrompt) 與 index.html (currentUser、escapeHtml)。

const SR_AUTOSAVE_MS = 2000;
let srMeta = null;          // 題目、目前學期
let srReviews = [];         // 已存的各學期自評 (新到舊)
let srSemester = null;      // 正在編輯的學期
let srDirty = false;
let srAutosaveTimer = null;

function srPreviousSemesters(current, count) {
    let [year, sem] = current.split('-').map(Number);
    const list = [];
    for (let i = 0; i < count; i++) {
        list.push(`${year}-${sem}`);
        if (sem === 2) sem = 1; else { sem = 2; year -= 1; }
    }
    return list;
}

async function loadSelfReview() {
    const body = document.getElementById('selfReviewBody');
    if (currentUser.role !== '學生') {
        body.innerHTML = currentUser.role === '訪客'
            ? loginPrompt('自評表需要登入學生帳號，內容只有你自己看得到。')
            : '<div class="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded border border-slate-200">自評表僅限學生本人填寫。</div>';
        return;
    }
    try {
        const data = await api('/api/self-review');
        srMeta = data;
        srReviews = data.data;
    } catch (e) {
        body.innerHTML = `<div class="text-sm text-rose-700">${escapeHtml(e.message)}</div>`;
        return;
    }
    body.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside class="space-y-3">
                <h3 class="text-xs font-bold text-slate-600">我的自評</h3>
                <ul id="srSemesterList" class="space-y-1.5"></ul>
                <label class="block text-xs text-slate-600 space-y-1">補填其他學期
                    <select id="srOtherSemester" class="w-full border border-slate-300 rounded px-2 py-1.5 bg-white text-sm"></select>
                </label>
            </aside>
            <div class="lg:col-span-3 space-y-6">
                <form id="srForm" class="space-y-5"></form>
                <div id="srCompare"></div>
            </div>
        </div>`;
    document.getElementById('srOtherSemester').addEventListener('change', e => { if (e.target.value) srOpen(e.target.value); });
    srOpen(srSemester || srMeta.current_semester);
}

function srReviewOf(semester) { return srReviews.find(r => r.semester === semester); }

function srRenderList() {
    const current = srMeta.current_semester;
    const semesters = [...new Set([current, ...srReviews.map(r => r.semester)])];
    document.getElementById('srSemesterList').innerHTML = semesters.map(s => {
        const r = srReviewOf(s);
        const badge = !r ? '<span class="text-slate-400">尚未填寫</span>'
            : r.status === '已完成' ? `<span class="text-emerald-700">已完成${r.average ? ` · 平均 ${r.average}` : ''}</span>`
            : '<span class="text-amber-700">草稿</span>';
        return `<li><button type="button" onclick="srOpen('${s}')" class="w-full text-left rounded border px-3 py-2 text-sm transition ${s === srSemester ? 'border-ukn-500 bg-ukn-50' : 'border-slate-200 hover:border-ukn-300'}">
            <span class="font-semibold text-slate-900">${s} 學期${s === current ? '（本學期）' : ''}</span>
            <span class="block text-[11px]">${badge}</span></button></li>`;
    }).join('');
    const others = srPreviousSemesters(current, 10).filter(s => !semesters.includes(s));
    document.getElementById('srOtherSemester').innerHTML = '<option value="">選擇學期…</option>' + others.map(s => `<option value="${s}">${s} 學期</option>`).join('');
}

async function srOpen(semester) {
    if (srDirty && !(await srFlush())) return;
    srSemester = semester;
    srRenderList();
    srRenderForm(srReviewOf(semester));
    srRenderCompare();
}

function srRenderForm(review) {
    const ratings = review?.ratings || {};
    const reflections = review?.reflections || {};
    const max = srMeta.reflection_max;
    document.getElementById('srForm').innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="font-bold text-slate-900">${srSemester} 學期自評 ${review ? `<span class="text-xs font-normal ${review.status === '已完成' ? 'text-emerald-700' : 'text-amber-700'}">· ${review.status}</span>` : ''}</h3>
            <span id="srSaveState" class="text-[11px] text-slate-500" role="status">${review?.updated_at ? `上次儲存 ${escapeHtml(review.updated_at)}` : '尚未儲存'}</span>
        </div>
        <fieldset class="space-y-2">
            <legend class="text-xs font-bold text-slate-600 mb-1">替自己打分數（1 = 需要加強，5 = 非常好）</legend>
            ${srMeta.rating_items.map(item => `
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 rounded border border-slate-200 px-3 py-2">
                    <div class="sm:w-48 shrink-0"><div class="text-sm font-semibold text-slate-900">${escapeHtml(item.label)}</div><div class="text-[11px] text-slate-500">${escapeHtml(item.hint)}</div></div>
                    <div class="flex gap-1.5" role="radiogroup" aria-label="${escapeHtml(item.label)}">
                        ${[1, 2, 3, 4, 5].map(n => `
                            <label class="cursor-pointer">
                                <input type="radio" name="rating-${item.key}" value="${n}" class="sr-only peer" ${ratings[item.key] === n ? 'checked' : ''}>
                                <span class="inline-flex w-9 h-9 items-center justify-center rounded border border-slate-300 text-sm font-semibold text-slate-600 peer-checked:bg-ukn-800 peer-checked:border-ukn-800 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ukn-500 hover:border-ukn-500">${n}</span>
                            </label>`).join('')}
                    </div>
                </div>`).join('')}
        </fieldset>
        <div class="space-y-3">
            ${srMeta.reflection_items.map(item => `
                <label class="block space-y-1">
                    <span class="flex justify-between text-xs font-bold text-slate-600"><span>${escapeHtml(item.label)}</span><span class="font-normal text-slate-400" data-count-for="${item.key}">${(reflections[item.key] || '').length} / ${max}</span></span>
                    <textarea name="reflection-${item.key}" maxlength="${max}" rows="3" class="w-full border border-slate-300 rounded px-3 py-2 text-sm">${escapeHtml(reflections[item.key] || '')}</textarea>
                </label>`).join('')}
        </div>
        <p id="srError" class="hidden text-xs text-rose-700"></p>
        <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="srSave('已完成')" class="bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-4 py-2 text-sm">完成自評</button>
            <button type="button" onclick="srSave('草稿')" class="border border-slate-300 hover:border-ukn-500 rounded px-4 py-2 text-sm">儲存草稿</button>
            ${review ? '<button type="button" onclick="srDelete()" class="ml-auto text-sm text-rose-700 hover:underline">刪除這份自評</button>' : ''}
        </div>`;
    srDirty = false;
    const form = document.getElementById('srForm');
    form.addEventListener('input', e => {
        if (e.target.tagName === 'TEXTAREA') {
            const key = e.target.name.replace('reflection-', '');
            form.querySelector(`[data-count-for="${key}"]`).textContent = `${e.target.value.length} / ${max}`;
        }
        srMarkDirty();
    });
    form.addEventListener('change', srMarkDirty);
}

function srCollect(status) {
    const form = document.getElementById('srForm');
    const ratings = {}, reflections = {};
    srMeta.rating_items.forEach(i => {
        const checked = form.querySelector(`input[name="rating-${i.key}"]:checked`);
        ratings[i.key] = checked ? Number(checked.value) : null;
    });
    srMeta.reflection_items.forEach(i => { reflections[i.key] = form.querySelector(`[name="reflection-${i.key}"]`).value; });
    return { ratings, reflections, status };
}

function srMarkDirty() {
    srDirty = true;
    document.getElementById('srSaveState').textContent = '有尚未儲存的變更…';
    clearTimeout(srAutosaveTimer);
    // 草稿與尚未填寫的學期自動存草稿；已完成的自評要按按鈕才更新，避免被改回草稿
    const r = srReviewOf(srSemester);
    if (!r || r.status === '草稿') srAutosaveTimer = setTimeout(() => srSave('草稿', { silent: true }), SR_AUTOSAVE_MS);
}

async function srSave(status, { silent = false } = {}) {
    clearTimeout(srAutosaveTimer);
    const err = document.getElementById('srError');
    const semester = srSemester;
    try {
        const res = await api(`/api/self-review/${encodeURIComponent(semester)}`, { method: 'PUT', json: srCollect(status) });
        srReviews = [res.data, ...srReviews.filter(r => r.semester !== semester)];
        srDirty = false;
        err?.classList.add('hidden');
        if (semester !== srSemester) return true;
        if (silent) {
            document.getElementById('srSaveState').textContent = `草稿已自動儲存 ${res.data.updated_at}`;
            srRenderList();
        } else {
            toast(res.message);
            srOpen(semester);
        }
        return true;
    } catch (e) {
        if (err) { err.textContent = e.message; err.classList.remove('hidden'); }
        if (silent) document.getElementById('srSaveState').textContent = '自動儲存失敗，請手動儲存';
        return false;
    }
}

// 切換學期前，把目前的修改存起來 (已完成的自評則詢問)
async function srFlush() {
    const r = srReviewOf(srSemester);
    if (!r || r.status === '草稿') return srSave('草稿', { silent: true });
    return confirm('這份已完成的自評有修改尚未儲存，確定要放棄修改嗎？');
}

async function srDelete() {
    if (!confirm(`確定要刪除 ${srSemester} 學期的自評表嗎？刪除後無法復原。`)) return;
    try {
        const res = await api(`/api/self-review/${encodeURIComponent(srSemester)}`, { method: 'DELETE' });
        srReviews = srReviews.filter(r => r.semester !== srSemester);
        srDirty = false;
        toast(res.message);
        srOpen(srMeta.current_semester);
    } catch (e) { toast(e.message, 'error'); }
}

// 與前一份已填寫的自評比較 (只比較兩份都有填分數的項目)
function srRenderCompare() {
    const box = document.getElementById('srCompare');
    const filled = srReviews.filter(r => r.average !== null);
    const idx = filled.findIndex(r => r.semester === srSemester);
    const cur = filled[idx], prev = idx >= 0 ? filled[idx + 1] : null;
    if (!cur || !prev) { box.innerHTML = ''; return; }
    const arrow = d => d > 0 ? `<span class="text-emerald-700">▲ ${d}</span>` : d < 0 ? `<span class="text-rose-700">▼ ${-d}</span>` : '<span class="text-slate-400">—</span>';
    box.innerHTML = `
        <div class="rounded border border-slate-200 p-4 space-y-2">
            <h3 class="text-sm font-bold text-slate-900">和 ${prev.semester} 學期比較</h3>
            <table class="w-full text-sm">
                <thead><tr class="text-xs text-slate-500 text-left"><th class="py-1 font-semibold">項目</th><th class="py-1 font-semibold text-center">${prev.semester}</th><th class="py-1 font-semibold text-center">${cur.semester}</th><th class="py-1 font-semibold text-center">變化</th></tr></thead>
                <tbody class="divide-y divide-slate-100">
                    ${srMeta.rating_items.map(i => {
                        const a = prev.ratings[i.key], b = cur.ratings[i.key];
                        return `<tr><td class="py-1.5">${escapeHtml(i.label)}</td><td class="text-center">${a ?? '—'}</td><td class="text-center font-semibold">${b ?? '—'}</td>
                            <td class="text-center text-xs">${a && b ? arrow(b - a) : ''}</td></tr>`;
                    }).join('')}
                    <tr class="font-semibold"><td class="py-1.5">平均</td><td class="text-center">${prev.average}</td><td class="text-center">${cur.average}</td><td class="text-center text-xs">${arrow(Math.round((cur.average - prev.average) * 100) / 100)}</td></tr>
                </tbody>
            </table>
        </div>`;
}

window.addEventListener('beforeunload', e => {
    if (srDirty) { e.preventDefault(); e.returnValue = ''; }
});

tabLoaders['tab-selfreview'] = loadSelfReview;
