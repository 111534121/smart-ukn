// 教師智慧工作台：只顯示有實際流程的功能，AI 內容一律由教師確認。
(function () {
    const root = () => document.getElementById('teacherSmartBody');
    const safe = value => escapeHtml(String(value ?? ''));
    const endpoint = '/api/campus/teacher-smart';
    const panel = (title, content) => `<section class="rounded border border-slate-200 p-4 space-y-3"><h3 class="font-bold text-ukn-800">${title}</h3>${content}</section>`;
    const button = (text, tab) => `<button type="button" data-smart-tab="${tab}" class="rounded border border-ukn-300 px-3 py-2 text-sm text-ukn-800">${text}</button>`;

    async function refreshSessions() {
        const target = document.getElementById('smartSessions');
        const rows = (await api(endpoint + '/attendance-sessions')).data;
        target.innerHTML = rows.length ? rows.map(row => `<div class="border-b py-2 text-sm">
            <strong>${safe(row.class_name)}</strong> · ${safe(row.started_at.replace('T', ' '))} · 已到 ${row.checked_in} 人
            ${row.code ? `<div><img class="w-40 h-40" alt="學生掃描點名 QR Code" src="${endpoint}/attendance-sessions/${row.id}/qr.svg"><span class="text-xs">有效至 ${safe(row.expires_at.replace('T', ' '))}</span></div>` : '<span class="text-slate-500">已過期</span>'}
            <button type="button" data-smart-session="${row.id}" class="text-ukn-800 underline">查看名單</button></div>`).join('') : '<p class="text-sm text-slate-500">尚無點名紀錄。</p>';
    }

    async function refreshOffice() {
        const target = document.getElementById('smartOfficeList');
        const rows = (await api(endpoint + '/office-slots')).data;
        target.innerHTML = rows.length ? rows.map(row => `<div class="border-b py-2 text-sm">${safe(row.starts_at.replace('T', ' '))} · ${row.minutes} 分鐘 · ${safe(row.location)} · ${safe(row.teacher_name)}
            ${row.student_id ? `<strong>已預約：${safe(row.student_name)}</strong> <a class="text-ukn-800 underline" href="${endpoint}/office-slots/${row.id}/calendar.ics">下載行事曆</a>` : currentUser.role === '學生' ? `<button type="button" data-smart-book="${row.id}" class="text-ukn-800 underline">預約</button>` : '<span>開放中</span>'}</div>`).join('') : '<p class="text-sm text-slate-500">目前沒有開放時段。</p>';
    }

    async function refreshTopics() {
        const target = document.getElementById('smartTopics');
        if (!target) return;
        const rows = (await api(endpoint + '/topic-analysis')).data;
        target.innerHTML = rows.length ? rows.map(row => `<p class="text-sm border-b py-1">${safe(row.topic)}：答錯 ${row.wrong} / ${row.total}，錯誤率 <strong>${row.error_rate}%</strong>${row.error_rate >= 60 ? ' · 建議安排複習' : ''}</p>`).join('') : '<p class="text-sm text-slate-500">尚無題目弱點資料。</p>';
    }

    async function refreshReviews() {
        const target = document.getElementById('smartReviewCenter');
        if (!target || currentUser.role !== '老師') return;
        const [leaveResult, certResult, projectResult] = await Promise.allSettled([
            api('/api/leave-requests/review?status=待審核'),
            api('/api/campus/certs/review?status=待審核'),
            api('/api/campus/graduation-projects/teacher-tasks'),
        ]);
        const leaves = leaveResult.status === 'fulfilled' ? leaveResult.value.data : [];
        const certs = certResult.status === 'fulfilled' ? certResult.value.data : [];
        const projects = projectResult.status === 'fulfilled' ? projectResult.value.data.filter(row => row.status === '待審核') : [];
        const failure = [leaveResult, certResult].some(r => r.status === 'rejected') ? '<p class="text-rose-700 text-sm">部分待審清單載入失敗，請重新整理。</p>' : '';
        const row = (kind, id, heading, detail, actions) => `<article class="rounded border border-slate-200 p-3 space-y-2"><div class="font-semibold">${safe(heading)}</div><p class="text-xs text-slate-600">${safe(detail)}</p>${actions ? `<label class="block text-xs">審核意見<input data-review-note="${kind}-${id}" maxlength="500" class="block w-full rounded border p-2 text-sm" placeholder="退回時請填原因"></label><div class="flex flex-wrap gap-2">${actions}</div>` : ''}</article>`;
        const action = (kind, id, decision, label, tone) => `<button type="button" data-review-kind="${kind}" data-review-id="${id}" data-review-decision="${decision}" class="rounded px-3 py-1.5 text-xs ${tone}">${label}</button>`;
        const leaveHtml = leaves.length ? leaves.map(r => row('leave', r.id, `${r.full_name} · ${r.leave_type}`,
            `${r.start_date} 至 ${r.end_date} · ${r.reason || ''}`,
            action('leave', r.id, 'approve', '核准', 'bg-emerald-700 text-white') +
            action('leave', r.id, 'reject', '退回', 'border border-rose-300 text-rose-700'))).join('') : '<p class="text-sm text-slate-500">目前沒有待審假單。</p>';
        const certRows = certs.map(r => `<div class="flex gap-2">${r.kind === '證照' ? `<input type="checkbox" class="smart-review-cert-check" value="${Number(r.id)}" aria-label="選取 ${safe(r.student_name)} 的證照">` : ''}${row('cert', r.id, `${r.student_name} · ${r.name}`,
            `${r.kind} · ${r.issuer || '未填機構'} · 證號 ${r.number || '未填'}`,
            action('cert', r.id, 'approve', r.kind === '證照' ? '初審通過' : '通過', 'bg-emerald-700 text-white') +
            action('cert', r.id, 'reject', '退回', 'border border-rose-300 text-rose-700'))}</div>`).join('');
        const batch = certs.some(r => r.kind === '證照') ? '<button type="button" id="smartBatchCert" class="rounded bg-ukn-800 px-3 py-2 text-xs text-white">批次初審選取證照</button>' : '';
        const projectHtml = projects.length ? projects.map(r => row('project', r.id, `${r.team_title} · ${r.stage}`,
            `送件 ${r.submitted_at}`,
            action('project', r.id, 'approve', '核准', 'bg-emerald-700 text-white') +
            action('project', r.id, 'reject', '退回修改', 'border border-rose-300 text-rose-700'))).join('') : '<p class="text-sm text-slate-500">目前沒有待審專題文件。</p>';
        target.innerHTML = `<div class="flex flex-wrap justify-between gap-2"><div><h3 class="text-lg font-bold text-ukn-900">待審核中心</h3><p class="text-sm text-slate-600">假單 ${leaves.length} · 證照與競賽初審 ${certs.length} · 專題文件 ${projects.length}</p></div><div class="flex flex-wrap gap-2"><button type="button" onclick="document.getElementById('homeAppReview')?.scrollIntoView({behavior:'smooth'})" class="rounded border px-3 py-2 text-sm">線上申辦審核 ↓</button><button type="button" id="smartRefreshReviews" class="rounded border px-3 py-2 text-sm">更新待辦</button></div></div>${failure}
            <div class="grid gap-4 lg:grid-cols-3">${panel('假單', leaveHtml)}${panel('證照與競賽初審', batch + (certRows || '<p class="text-sm text-slate-500">目前沒有待審證照或競賽成果。</p>'))}${panel('專題文件', projectHtml)}</div>`;
    }

    function teacherView() {
        const applicationReview = document.getElementById('homeAppReview');
        const teacherTab = document.getElementById('tab-teacher-smart');
        if (applicationReview && teacherTab && applicationReview.parentElement !== teacherTab) teacherTab.appendChild(applicationReview);
        root().innerHTML = `<section id="smartReviewCenter" class="mb-5 rounded border border-ukn-200 bg-ukn-50 p-4 space-y-3"><p class="text-sm">讀取待審核項目中…</p></section><div class="grid gap-4 lg:grid-cols-2">
            ${panel('1. 快速點名與缺曠預警', `<p class="text-sm text-slate-600">產生 10 分鐘有效的 QR Code；學生在校務首頁掃描簽到。缺曠風險沿用導師班資料。</p>
                <button type="button" id="smartCreateAttendance" class="rounded bg-ukn-800 px-3 py-2 text-white text-sm">開始導師班點名</button>${button('查看出缺勤預警', 'tab-classattend')}<div id="smartSessions"></div><div id="smartSessionDetail" class="text-sm"></div>`)}
            ${panel('2. AI 導師關懷', `<p class="text-sm text-slate-600">把筆記整理成草稿。請勿輸入未經授權的敏感個資；生成內容不會自動寫入關懷紀錄。</p>
                <textarea id="smartCounselText" rows="3" maxlength="12000" class="w-full rounded border p-2" placeholder="輸入晤談筆記（至少 12 字）"></textarea>
                <button type="button" data-smart-ai="counseling" class="rounded bg-ukn-800 px-3 py-2 text-white text-sm">整理關懷草稿</button>${button('查看需關懷學生', 'tab-myclass')}${button('填寫關懷紀錄', 'tab-counseling')}`)}
            ${panel('3. 學習成效與邊緣生', `<p class="text-sm text-slate-600">導師班風險沿用已有成績與出缺勤資料，未授權的學業資料維持遮蔽。可輸入測驗各觀念答錯人數，立即看弱點比例。</p>
                ${button('查看導師班風險排序', 'tab-myclass')}${button('查看出缺勤門檻', 'tab-classattend')}
                <form id="smartTopicForm" class="flex flex-wrap gap-2"><input name="topic" required maxlength="80" placeholder="觀念／章節" class="rounded border p-2 text-sm"><input name="wrong" type="number" min="0" required placeholder="答錯人數" class="w-24 rounded border p-2 text-sm"><input name="total" type="number" min="1" required placeholder="總人數" class="w-24 rounded border p-2 text-sm"><button class="rounded bg-ukn-800 px-3 py-2 text-white text-sm">計算弱點</button></form><div id="smartTopics"></div>`)}
            ${panel('4. AI 教學與出題助手', `<p class="text-sm text-slate-600">貼上講義文字或上傳文字型 PDF／PPTX（10 MB 內）；題目、卡片與評語都是草稿，老師確認後使用。</p>
                <textarea id="smartTeachingText" rows="3" maxlength="12000" class="w-full rounded border p-2" placeholder="講義或作業內容（至少 12 字）"></textarea>
                <input id="smartTeachingFile" type="file" accept=".pdf,.pptx,application/pdf" class="block text-sm"><div class="flex flex-wrap gap-2">
                <button type="button" data-smart-ai="quiz" class="rounded border px-3 py-2 text-sm">產生題目</button>
                <button type="button" data-smart-ai="flashcards" class="rounded border px-3 py-2 text-sm">產生重點卡</button>
                <button type="button" data-smart-ai="feedback" class="rounded border px-3 py-2 text-sm">產生評語草稿</button></div>`)}
            ${panel('5. 智慧行政與審核', `<p class="text-sm text-slate-600">沿用現有待辦、請假與證照審核。班導初審專業證照後由行政／科助複審。衝堂與異常模式提示須取得完整課表及歷史紀錄。</p>
                ${button('打開待辦通知', 'tab-home')}${button('查看證照初審', 'tab-certs')}<a class="inline-block rounded border border-ukn-300 px-3 py-2 text-sm text-ukn-800" href="${endpoint}/portfolio.csv">匯出教師歷程草稿 CSV</a>`)}
            ${panel('6. Office Hour 與班級溝通', `<p class="text-sm text-slate-600">開放導師班預約時段，預約後可下載行事曆檔。需回條的班級通知會在期限前一天對未回覆學生發送一次站內提醒。</p>
                <form id="smartOfficeForm" class="flex flex-wrap gap-2"><input type="datetime-local" name="starts_at" required class="rounded border p-2 text-sm"><select name="minutes" class="rounded border p-2 text-sm"><option value="15">15 分鐘</option><option value="30" selected>30 分鐘</option><option value="60">60 分鐘</option></select><input name="location" maxlength="100" placeholder="地點" class="rounded border p-2 text-sm"><button class="rounded bg-ukn-800 px-3 py-2 text-white text-sm">開放時段</button></form>
                <div id="smartOfficeList"></div>${button('發送班級通知', 'tab-notices')}`)}
        </div><section class="mt-4 rounded border border-slate-200 p-4"><h3 class="font-bold">AI 草稿（可複製編修）</h3><textarea id="smartDraft" rows="8" class="mt-2 w-full rounded border p-2 text-sm" placeholder="產生後會顯示在這裡；系統不會自動送出或評分。"></textarea></section>`;
        refreshSessions().catch(showError);
        refreshOffice().catch(showError);
        refreshTopics().catch(showError);
        refreshReviews().catch(showError);
        if (applicationReview && typeof loadAppReview === 'function') loadAppReview();
    }

    function studentView() {
        root().innerHTML = `<div class="grid gap-4 md:grid-cols-2">
            ${panel('課堂 QR 簽到', `<p class="text-sm text-slate-600">掃描老師投影的 QR Code，或輸入當堂點名碼。</p><form id="smartCheckinForm" class="flex gap-2"><input name="code" required class="rounded border p-2" placeholder="點名碼"><button class="rounded bg-ukn-800 px-3 py-2 text-white">簽到</button></form>`)}
            ${panel('預約導師 Office Hour', '<div id="smartOfficeList"></div>')}
        </div>`;
        refreshOffice().catch(showError);
        const code = new URLSearchParams(location.search).get('teacher_checkin');
        if (code) root().querySelector('[name="code"]').value = code;
    }

    function showError(error) { toast(error.message || String(error)); }

    window.loadTeacherSmart = function () {
        if (!root()) return;
        if (currentUser.role === '老師') teacherView();
        else if (currentUser.role === '學生') studentView();
        else root().textContent = '此功能限老師與學生使用。';
    };

    document.addEventListener('click', async event => {
        if (!event.target.closest('#tab-teacher-smart')) return;
        const tab = event.target.closest('[data-smart-tab]');
        if (tab) { switchTab(tab.dataset.smartTab); return; }
        const session = event.target.closest('[data-smart-session]');
        if (session) {
            try {
                const rows = (await api(endpoint + '/attendance-sessions/' + session.dataset.smartSession)).data.students;
                document.getElementById('smartSessionDetail').innerHTML = rows.map(r => `<p>${safe(r.full_name)} · ${r.present ? '已到' : '未簽到'}</p>`).join('');
            } catch (error) { showError(error); }
        }
        if (event.target.id === 'smartRefreshReviews') { refreshReviews().catch(showError); return; }
        if (event.target.id === 'smartBatchCert') {
            const ids = [...document.querySelectorAll('.smart-review-cert-check:checked')].map(el => Number(el.value));
            if (!ids.length) { toast('請先選取證照'); return; }
            event.target.disabled = true;
            try { const result = await api('/api/campus/certs/review/batch', { json: { ids } }); toast(result.message); await refreshReviews(); }
            catch (error) { showError(error); } finally { event.target.disabled = false; }
            return;
        }
        const review = event.target.closest('[data-review-kind]');
        if (review) {
            const kind = review.dataset.reviewKind, id = Number(review.dataset.reviewId), decision = review.dataset.reviewDecision;
            const note = document.querySelector(`[data-review-note="${kind}-${id}"]`)?.value.trim() || '';
            if (decision === 'reject' && !note) { toast('退回時請填寫原因'); return; }
            review.disabled = true;
            try {
                const route = kind === 'leave' ? `/api/leave-requests/${id}/review` : kind === 'cert' ? `/api/campus/certs/${id}/review` : `/api/campus/graduation-projects/submissions/${id}/review`;
                const payload = kind === 'leave' ? { status: decision === 'approve' ? '已核准' : '已退回', review_note: note } : kind === 'cert' ? { action: decision, note } : { decision: decision === 'approve' ? '已核准' : '退回修改', note };
                const result = await api(route, { json: payload }); toast(result.message); await refreshReviews();
            } catch (error) { showError(error); } finally { review.disabled = false; }
            return;
        }
        if (event.target.id === 'smartCreateAttendance') {
            event.target.disabled = true;
            try { await api(endpoint + '/attendance-sessions', { json: {} }); await refreshSessions(); }
            catch (error) { showError(error); } finally { event.target.disabled = false; }
        }
        const book = event.target.closest('[data-smart-book]');
        if (book) {
            book.disabled = true;
            try { await api(endpoint + '/office-slots/' + book.dataset.smartBook + '/book', { json: {} }); await refreshOffice(); toast('預約成功'); }
            catch (error) { showError(error); } finally { book.disabled = false; }
        }
        const aiButton = event.target.closest('[data-smart-ai]');
        if (aiButton) {
            const kind = aiButton.dataset.smartAi;
            const form = new FormData();
            form.set('kind', kind);
            form.set('text', document.getElementById(kind === 'counseling' ? 'smartCounselText' : 'smartTeachingText').value);
            const file = document.getElementById('smartTeachingFile')?.files[0];
            if (kind !== 'counseling' && file) form.set('file', file);
            aiButton.disabled = true;
            try { const data = await api(endpoint + '/ai-draft', { method: 'POST', body: form }); document.getElementById('smartDraft').value = data.draft; toast('草稿已產生，請確認內容'); }
            catch (error) { showError(error); } finally { aiButton.disabled = false; }
        }
    });

    document.addEventListener('submit', async event => {
        if (event.target.id === 'smartOfficeForm') {
            event.preventDefault(); const submit = event.target.querySelector('button'); submit.disabled = true;
            const values = new FormData(event.target);
            try { await api(endpoint + '/office-slots', { json: { starts_at: values.get('starts_at'), minutes: Number(values.get('minutes')), location: values.get('location') } }); await refreshOffice(); toast('已開放預約'); }
            catch (error) { showError(error); } finally { submit.disabled = false; }
        }
        if (event.target.id === 'smartTopicForm') {
            event.preventDefault(); const submit = event.target.querySelector('button'); submit.disabled = true;
            const values = new FormData(event.target);
            try { await api(endpoint + '/topic-analysis', { json: { topic: values.get('topic'), wrong: values.get('wrong'), total: values.get('total') } }); await refreshTopics(); toast('已更新弱點分析'); }
            catch (error) { showError(error); } finally { submit.disabled = false; }
        }
        if (event.target.id === 'smartCheckinForm') {
            event.preventDefault(); const submit = event.target.querySelector('button'); submit.disabled = true;
            try { await api(endpoint + '/attendance-checkin', { json: { code: new FormData(event.target).get('code') } }); toast('已完成簽到'); }
            catch (error) { showError(error); } finally { submit.disabled = false; }
        }
    });
})();
