'use strict';
(() => {
    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const $ = id => document.getElementById(id);
    const stages = ['待媒合','洽談中','已媒合','實習中','已完成'];
    const contracts = ['未收到','待確認','已收件','已轉交'];
    const journals = ['未開始','待繳交','待檢查','已確認'];
    const categories = ['資訊技術','行銷與設計','行政與客服','商管與會計','教育與培訓','旅遊服務','待補充'];
    const options = (items, current) => items.map(item => `<option${item === current ? ' selected' : ''}>${item}</option>`).join('');
    async function call(url, options) {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error(response.status === 404
                ? '實習資料服務尚未載入，請重新啟動網站程式後重新整理。'
                : '網站暫時無法提供實習資料，請稍後重試。');
        }
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data.message || '讀取失敗');
        return data;
    }
    const json = data => ({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    let historyRows = [];
    const isAssistant = () => currentUser.role === '科助' && currentUser.office === '資訊管理科（五專）／科辦公室';
    function renderHistory() {
        const year = $('internshipHistoryYear').value;
        const category = $('internshipHistoryCategory').value;
        const query = $('internshipHistorySearch').value.trim().toLowerCase();
        const rows = historyRows.filter(row => (!year || String(row.year) === year) &&
            (!category || (row.categories || []).includes(category)) &&
            (!query || [row.name, ...(row.roles || []).flatMap(role => [role.title, role.details])].join(' ').toLowerCase().includes(query)));
        $('internshipHistorySummary').textContent = `顯示 ${rows.length} 間歷年廠商；資料為當年紀錄，職務及名額每年可能不同。`;
        $('internshipHistoryList').innerHTML = rows.length ? rows.map(row => `<article class="rounded-lg border border-slate-200 p-4">
            <p class="text-xs font-semibold text-ukn-700">${esc(row.year)} 學年度</p>
            <h3 class="font-bold text-lg mt-1">${esc(row.name)}</h3>
            <p class="flex flex-wrap gap-1 mt-2">${(row.categories || []).map(category => `<span class="rounded-full bg-blue-50 text-ukn-800 px-2 py-1 text-xs">${esc(category)}</span>`).join('')}</p>
            <div class="mt-3 space-y-2">${(row.roles || []).map(role => `<details class="rounded bg-slate-50 p-3 text-sm"><summary class="font-semibold cursor-pointer">${esc(role.title)}</summary><p class="whitespace-pre-wrap mt-2 text-slate-700">${esc(role.details || '原資料未提供詳細工作內容')}</p></details>`).join('') || '<p class="text-sm text-slate-500">原資料未提供職務內容，請向科辦確認。</p>'}</div>
            <div class="rounded bg-amber-50 p-3 mt-3 text-sm"><strong>工作介紹範例</strong><p class="whitespace-pre-wrap mt-1">${esc(row.description)}</p></div>
            <div class="rounded bg-emerald-50 p-3 mt-2 text-sm"><strong>給學弟妹的準備提醒</strong><p class="whitespace-pre-wrap mt-1">${esc(row.advice)}</p></div>
            ${(row.shares || []).map(share => `<div class="rounded border border-emerald-200 p-3 mt-2 text-sm"><strong>${share.demo ? '【示範分享】' : ''}${esc(share.name)}</strong><p class="mt-1 whitespace-pre-wrap">工作內容：${esc(share.work_description)}</p><p class="mt-1 whitespace-pre-wrap">經驗與提醒：${esc(share.advice)}</p></div>`).join('')}
            ${row.source_url ? `<a class="text-sm text-ukn-800 underline inline-block mt-3" href="${esc(row.source_url)}" target="_blank" rel="noopener">查看原始資料</a>` : ''}
            ${isAssistant() ? `<form data-company="${esc(row.name)}" data-year="${Number(row.year)}" class="border-t mt-3 pt-3 space-y-2 text-sm"><fieldset><legend class="font-medium">科助維護領域分類（可複選）</legend><div class="flex flex-wrap gap-x-3 gap-y-1 mt-1">${categories.map(category => `<label class="inline-flex items-center gap-1"><input type="checkbox" name="categories" value="${esc(category)}" ${(row.categories || []).includes(category) ? 'checked' : ''}> ${esc(category)}</label>`).join('')}</div></fieldset><button class="bg-ukn-800 text-white rounded px-3 py-2">儲存分類</button></form>` : ''}
        </article>`).join('') : '<p class="text-sm text-slate-500">找不到符合條件的歷年廠商。</p>';
    }
    async function loadHistory() {
        const result = await call('/api/campus/internship-history');
        historyRows = result.data || [];
        const years = [...new Set(historyRows.map(row => row.year))].sort((a,b) => b-a);
        const selected = $('internshipHistoryYear').value || (years.includes(114) ? '114' : String(years[0] || ''));
        $('internshipHistoryYear').innerHTML = years.map(year => `<option value="${year}">${year} 學年度</option>`).join('');
        $('internshipHistoryYear').value = selected;
        const selectedCategory = $('internshipHistoryCategory').value;
        $('internshipHistoryCategory').innerHTML = '<option value="">全部分類</option>' + categories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join('');
        $('internshipHistoryCategory').value = selectedCategory;
        $('internshipShareYear').innerHTML = years.map(year => `<option value="${year}">${year} 學年度</option>`).join('');
        $('internshipShareCompany').innerHTML = '<option value="">請選擇廠商</option>' +
            historyRows.filter(row => row.year === years[0]).map(row => `<option value="${esc(row.name)}">${esc(row.name)}</option>`).join('');
        renderHistory();
    }
    function message(text, error=false) {
        const box = $('internshipMessage');
        box.textContent = text;
        box.className = `text-sm mt-2 ${error ? 'text-rose-700' : 'text-ukn-800'}`;
    }
    async function loadInternships() {
        $('internshipAssistantPanel').classList.toggle('hidden', !isAssistant());
        $('internshipCompanyCreateForm').classList.toggle('hidden', !isAssistant());
        $('internshipStudentShareForm').classList.toggle('hidden', currentUser.role !== '學生');
        try { await loadHistory(); }
        catch (error) { $('internshipHistoryList').innerHTML = `<p class="text-sm text-rose-700">${esc(error.message)}</p>`; }
        if (!isAssistant()) return;
        const root = $('tab-internships');
        try {
            const response = await call('/api/campus/assistant/internships');
            const rows = response.data || [];
            const placed = new Set(rows.map(row => row.student_id));
            $('internshipStudentSelect').innerHTML = `<option value="">請選擇學生</option>${(response.students || []).filter(s => !placed.has(s.student_id)).map(s => `<option value="${esc(s.student_id)}">${esc(s.full_name)} · ${esc(s.class_name)} · ${esc(s.student_id)}</option>`).join('')}`;
            $('internshipSummary').textContent = `已建 ${rows.length} 筆 · 待媒合 ${rows.filter(r => r.stage === '待媒合').length} 筆 · 待確認合約 ${rows.filter(r => ['未收到','待確認'].includes(r.contract_status)).length} 筆`;
            $('internshipList').innerHTML = rows.length ? rows.map(row => `<article class="rounded-lg border border-slate-200 p-4 space-y-3">
                <div class="flex flex-wrap justify-between gap-2"><div><h3 class="font-bold">${esc(row.student_name)} · ${esc(row.class_name)}</h3><p class="text-sm text-slate-600">${esc(row.student_id)} · ${esc(row.company)}</p></div><span class="text-sm font-semibold text-ukn-800">${esc(row.stage)}</span></div>
                <form data-internship-update="${Number(row.id)}" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <label>媒合進度<select name="stage" class="block w-full border rounded p-2 mt-1">${options(stages,row.stage)}</select></label>
                    <label>合約狀態<select name="contract_status" class="block w-full border rounded p-2 mt-1">${options(contracts,row.contract_status)}</select></label>
                    <label>週記狀態<select name="journal_status" class="block w-full border rounded p-2 mt-1">${options(journals,row.journal_status)}</select></label>
                    <label>指導老師<input name="teacher" value="${esc(row.teacher)}" maxlength="100" class="block w-full border rounded p-2 mt-1"></label>
                    <label>老師訪視日期<input type="date" name="visit_date" value="${esc(row.visit_date)}" class="block w-full border rounded p-2 mt-1"></label>
                    <label class="sm:col-span-2 lg:col-span-3">行政備註<textarea name="note" maxlength="2000" rows="2" class="block w-full border rounded p-2 mt-1">${esc(row.note)}</textarea></label>
                    <button class="bg-ukn-800 text-white rounded px-3 py-2 justify-self-start">儲存進度</button>
                </form>
                <div class="grid lg:grid-cols-2 gap-3 border-t pt-3"><div><h4 class="font-semibold text-sm">合約與佐證資料</h4><form data-internship-file="${Number(row.id)}" class="flex flex-wrap gap-2 mt-2"><input type="file" name="file" required accept=".pdf,.jpg,.jpeg,.png,.docx" class="text-sm max-w-full"><button class="border border-ukn-400 rounded px-3 py-1 text-sm">上傳</button></form><div class="mt-2 text-sm">${(row.files || []).map(file => `<a class="block text-ukn-800 underline" href="/api/campus/assistant/internships/${Number(row.id)}/files/${encodeURIComponent(file.id)}">${esc(file.name)}</a>`).join('') || '尚未上傳檔案'}</div></div>
                <div><h4 class="font-semibold text-sm">三方聯繫紀錄</h4><form data-internship-contact="${Number(row.id)}" class="flex flex-wrap gap-2 mt-2"><select name="party" class="border rounded p-2 text-sm"><option>學生</option><option>實習單位</option><option>指導老師</option></select><input name="note" required maxlength="1000" placeholder="記錄聯繫結果或下一步" class="border rounded p-2 text-sm flex-1 min-w-[170px]"><button class="border border-ukn-400 rounded px-3 py-1 text-sm">新增</button></form><div class="mt-2 space-y-1 text-sm">${(row.contacts || []).slice().reverse().map(c => `<p class="rounded bg-slate-50 p-2">${esc(c.at)} · ${esc(c.party)}：${esc(c.note)}</p>`).join('') || '尚無聯繫紀錄'}</div></div></div>
            </article>`).join('') : '<p class="text-sm text-slate-500">目前沒有五年級實習紀錄，請先建立一筆。</p>';
            const reviews = await call('/api/campus/assistant/internship-shares');
            const pendingShares = (reviews.data || []).filter(row => row.status === '待審核');
            $('internshipShareReviewList').innerHTML = pendingShares.length ? pendingShares.map(row => `<article class="rounded border p-3 text-sm"><strong>${esc(row.student_name)} · ${esc(row.company)}</strong><p class="mt-1 whitespace-pre-wrap">工作內容：${esc(row.work_description)}</p><p class="mt-1 whitespace-pre-wrap">提醒：${esc(row.advice)}</p><div class="flex gap-2 mt-2"><button data-share-id="${Number(row.id)}" data-share-status="已發布" class="bg-ukn-800 text-white rounded px-3 py-2">確認發布</button><button data-share-id="${Number(row.id)}" data-share-status="已退回" class="border rounded px-3 py-2">退回</button></div></article>`).join('') : '<p class="text-sm text-slate-500">目前沒有待確認分享。</p>';
            if (!root.dataset.eventsReady) {
                root.dataset.eventsReady = '1';
                root.addEventListener('click', async event => {
                    const button = event.target.closest('[data-share-id]');
                    if (!button) return;
                    try {
                        await call(`/api/campus/assistant/internship-shares/${button.dataset.shareId}`, {
                            method:'PATCH',headers:{'Content-Type':'application/json'},
                            body:JSON.stringify({status:button.dataset.shareStatus})});
                        await loadInternships();
                        message('分享審核已儲存');
                    } catch (error) { message(error.message, true); }
                });
                root.addEventListener('submit', async event => {
                    const form = event.target;
                    if (form.id === 'internshipCompanyCreateForm') {
                        event.preventDefault();
                        try {
                            await call('/api/campus/assistant/internship-companies', json(Object.fromEntries(new FormData(form))));
                            form.reset();
                            await loadHistory();
                            message('歷年廠商已新增');
                        } catch (error) { message(error.message, true); }
                        return;
                    }
                    if (form.matches('[data-company]')) {
                        event.preventDefault();
                        try {
                            await call(`/api/campus/assistant/internship-companies/${form.dataset.year}/${encodeURIComponent(form.dataset.company)}`, {
                                method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({
                                    ...Object.fromEntries(new FormData(form)),
                                    categories: new FormData(form).getAll('categories')})});
                            await loadHistory();
                            message('廠商資料已儲存');
                        } catch (error) { message(error.message, true); }
                        return;
                    }
                    if (!form.matches('#internshipCreateForm,[data-internship-update],[data-internship-file],[data-internship-contact]')) return;
                    event.preventDefault();
                    const button = form.querySelector('button');
                    button.disabled = true;
                    try {
                        if (form.id === 'internshipCreateForm') await call('/api/campus/assistant/internships', json(Object.fromEntries(new FormData(form))));
                        else if (form.dataset.internshipUpdate) await call(`/api/campus/assistant/internships/${form.dataset.internshipUpdate}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
                        else if (form.dataset.internshipContact) await call(`/api/campus/assistant/internships/${form.dataset.internshipContact}/contacts`, json(Object.fromEntries(new FormData(form))));
                        else await call(`/api/campus/assistant/internships/${form.dataset.internshipFile}/files`, {method:'POST',body:new FormData(form)});
                        await loadInternships();
                        message('實習紀錄已儲存');
                    } catch (error) { message(error.message, true); }
                    finally { if (button.isConnected) button.disabled = false; }
                });
            }
        } catch (error) {
            $('internshipList').innerHTML = `<p class="text-sm text-rose-700">${esc(error.message)}</p>`;
        }
    }
    if (!$('tab-internships').dataset.historyEventsReady) {
        $('tab-internships').dataset.historyEventsReady = '1';
        $('internshipHistoryYear').addEventListener('change', renderHistory);
        $('internshipHistoryCategory').addEventListener('change', renderHistory);
        $('internshipHistorySearch').addEventListener('input', renderHistory);
        $('internshipStudentShareForm').addEventListener('submit', async event => {
            event.preventDefault();
            const form = event.currentTarget;
            try {
                await call('/api/campus/internship-history/shares', json(Object.fromEntries(new FormData(form))));
                form.reset();
                $('internshipShareMessage').textContent = '分享已送交科助確認，發布後學弟妹就能看到。';
            } catch (error) { $('internshipShareMessage').textContent = error.message; }
        });
        $('internshipShareYear').addEventListener('change', () => {
            const year = $('internshipShareYear').value;
            $('internshipShareCompany').innerHTML = '<option value="">請選擇廠商</option>' +
                historyRows.filter(row => String(row.year) === year).map(row => `<option value="${esc(row.name)}">${esc(row.name)}</option>`).join('');
        });
    }
    tabLoaders['tab-internships'] = loadInternships;
})();
