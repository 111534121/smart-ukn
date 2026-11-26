'use strict';
(() => {
    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const active = row => ['待受理','處理中','待補件','重新送審'].includes(row.status);
    const $ = id => document.getElementById(id);
    let selected = null;
    let selectedClass = '';
    let assistantView = new URLSearchParams(location.search).get('assistant') === 'classes' ? 'classes' : 'home';
    let loading = false;
    async function call(url, options) {
        const response = await fetch(url, options);
        const body = await response.json();
        if (!response.ok || body.status !== 'success') throw new Error(body.message || '讀取失敗');
        return body;
    }
    const json = data => ({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    function notice(text, error=false) {
        const box = $('assistantHomeMessage');
        if (box) { box.textContent = text; box.className = `text-sm ${error ? 'text-rose-700' : 'text-ukn-800'}`; }
    }
    function caseList(rows) {
        return rows.length ? rows.map(c => `<button type="button" data-assistant-case="${Number(c.id)}" class="w-full text-left rounded-lg border ${c.overdue ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'} p-3 hover:border-ukn-500"><span class="font-semibold text-slate-900">#${Number(c.id)} ${esc(c.title)}</span><span class="block text-xs text-slate-600 mt-1">${esc(c.status)} · ${esc(c.student_name)} · 期限 ${esc(c.due_date)}${c.overdue ? ' · 已逾期' : ''}</span></button>`).join('') : '<p class="text-sm text-slate-500">目前沒有本科案件。</p>';
    }
    function projectList(teams) {
        return teams.length ? teams.map(t => {
            const pending = t.submissions.filter(s => s.status === '待審核');
            return `<article class="rounded-lg border ${pending.length ? 'border-amber-300 bg-amber-50' : 'border-slate-200'} p-3"><strong>${esc(t.title)}</strong><p class="text-xs text-slate-600 mt-1">指導老師：${esc(t.teacher_username || '尚未媒合')} · ${t.members.length} 位組員</p>${pending.map(s => `<div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm"><span>${esc(s.stage)}待審 · ${s.opened_at ? '老師已開啟' : '老師尚未開啟'} · ${esc(s.submitted_at.slice(0,10))}</span><button type="button" data-project-remind="${Number(s.id)}" class="text-ukn-800 font-semibold border border-ukn-300 rounded px-2 py-1">提醒老師</button></div>`).join('') || '<p class="text-xs text-slate-500 mt-2">目前無待審文件</p>'}</article>`;
        }).join('') : '<p class="text-sm text-slate-500">目前沒有專題小組。</p>';
    }
    function activityList(items) {
        return items.length ? items.map(c => {
            const waiting = c.approval_summary?.unopened + c.approval_summary?.opened_pending || 0;
            return `<article class="rounded-lg border border-slate-200 p-3"><strong>${esc(c.title)}</strong><p class="text-xs text-slate-600 mt-1">${esc(c.event_date)} · 正取 ${Number(c.confirmed_count || 0)} · 候補 ${Number(c.waitlist_count || 0)} · 老師待審 ${waiting}</p>${c.fee_mode === '付費' ? '<p class="text-xs text-amber-800 mt-1">付費設定：金流尚未開放，不會收款。</p>' : ''}${waiting ? `<button type="button" data-activity-remind="${Number(c.id)}" class="text-sm text-ukn-800 font-semibold mt-2">提醒待審老師 →</button>` : ''}</article>`;
        }).join('') : '<p class="text-sm text-slate-500">目前沒有本科活動。</p>';
    }
    function graduationTable(rows) {
        rows = rows.filter(row => row.year === 5);
        const query = ($('assistantGraduationSearch')?.value || '').trim().toLowerCase();
        const filter = $('assistantGraduationFilter')?.value || 'all';
        const visible = rows.filter(row => {
            const matched = `${row.student_id} ${row.full_name} ${row.class_name}`.toLowerCase().includes(query);
            return matched && (filter === 'all' || filter === 'follow-up' && row.missing.length || row.project_status === filter);
        });
        $('assistantGraduationCount').textContent = `顯示 ${visible.length} / ${rows.length} 人`;
        $('assistantGraduationTable').innerHTML = visible.length ? `<table class="w-full min-w-[860px] text-sm text-left"><thead class="bg-slate-50 text-slate-700"><tr><th class="p-3">學生</th><th class="p-3">學分</th><th class="p-3">證照</th><th class="p-3">專題</th><th class="p-3">實習</th><th class="p-3">待追蹤事項</th></tr></thead><tbody>${visible.map(row => `<tr class="border-t border-slate-100 align-top"><td class="p-3"><strong>${esc(row.full_name)}</strong><span class="block text-xs text-slate-500">${esc(row.student_id)} · ${esc(row.class_name)}</span></td><td class="p-3">${Number(row.credits_earned)} / ${Number(row.credits_target)}</td><td class="p-3">${Number(row.certificates_approved)} / ${Number(row.certificates_target)}</td><td class="p-3">${esc(row.project_status)}</td><td class="p-3 text-slate-600">${esc(row.internship_status)}</td><td class="p-3 ${row.missing.length ? 'text-amber-800' : 'text-slate-600'}">${row.missing.length ? row.missing.map(esc).join('、') : '依現有資料無缺項'}</td></tr>`).join('')}</tbody></table>` : '<p class="p-4 text-sm text-slate-500">沒有符合條件的學生。</p>';
    }
    function renderClassOverview(data) {
        const root = $('assistantClassOverview');
        if (!root) return;
        const classes = data?.classes || [];
        const rows = data?.data || [];
        const query = ($('assistantClassSearch')?.value || '').trim().toLowerCase();
        $('assistantClassCards').innerHTML = classes.map(c => `<button type="button" data-class="${esc(c.class_name)}" class="text-left rounded-lg border ${selectedClass === c.class_name ? 'border-ukn-600 bg-ukn-50' : 'border-slate-200 bg-white'} p-3"><strong class="block">${esc(c.class_name)}</strong><span class="text-xs text-slate-600">${c.students} 人 · 出缺勤需注意 ${c.attendance_attention} · 未通過科目 ${c.failed_students} · 待審假單 ${c.pending_leave}</span></button>`).join('');
        const visible = rows.filter(r => (!selectedClass || r.class_name === selectedClass) && `${r.full_name} ${r.student_id} ${r.class_name} ${r.failed_courses.map(c=>c.course_name).join(' ')}`.toLowerCase().includes(query));
        $('assistantClassCount').textContent = `顯示 ${visible.length} / ${rows.length} 人`;
        $('assistantClassStudents').innerHTML = visible.length ? `<div class="overflow-x-auto"><table class="w-full min-w-[680px] text-sm text-left"><thead class="bg-slate-50"><tr><th class="p-3">學生／班級</th><th class="p-3">出缺勤</th><th class="p-3">待審假單</th><th class="p-3">未通過科目</th><th class="p-3">年級適用事項</th></tr></thead><tbody>${visible.map(r => `<tr class="border-t align-top"><td class="p-3"><strong>${esc(r.full_name)}</strong><span class="block text-xs text-slate-500">${esc(r.student_id)} · ${esc(r.class_name)}</span></td><td class="p-3">曠 ${r.attendance.absent} · 遲 ${r.attendance.late} · 病 ${r.attendance.sick}<span class="block text-xs ${r.attendance.level === 'ok' ? 'text-slate-500' : 'text-amber-700'}">${r.attendance.level === 'ok' ? '目前無扣考預警' : '扣考預警，須人工核對'}</span></td><td class="p-3">${r.pending_leave}</td><td class="p-3">${r.failed_courses.length ? r.failed_courses.map(c => `${esc(c.course_name)}${c.score == null ? '' : `（${Number(c.score)}分）`}`).join('、') : r.grades_available ? '目前無未通過科目' : '成績待匯入'}</td><td class="p-3">${r.year >= 5 ? '實習、專題、畢業審查' : r.year === 4 ? '專題規劃' : '基礎課程與出缺勤'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="p-4 text-sm text-slate-500">沒有符合條件的學生。</p>';
    }
    function showAssistantView(box) {
        const classes = assistantView === 'classes';
        for (const id of ['assistantClassOverview','assistantGraduationSection']) box.querySelector(`#${id}`)?.classList.toggle('hidden', !classes);
        box.querySelector('#assistantHomeDashboard')?.classList.toggle('hidden', classes);
        box.querySelector('#assistantHomeExtras')?.classList.toggle('hidden', classes);
        box.querySelectorAll('[data-assistant-view]').forEach(button => {
            const activeView = button.dataset.assistantView === assistantView;
            button.setAttribute('aria-current', activeView ? 'page' : 'false');
            button.classList.toggle('bg-ukn-800', activeView);
            button.classList.toggle('text-white', activeView);
            button.classList.toggle('border-ukn-800', activeView);
        });
    }
    function renderAdmissions(data) {
        const list = $('assistantAdmissionsList');
        if (!list) return;
        const rows = data?.data || [];
        const summary = data?.summary || {};
        $('assistantAdmissionsSummary').textContent = `待回覆 ${summary['待回覆'] || 0} · 處理中 ${summary['處理中'] || 0} · 已轉介 ${summary['已轉介'] || 0} · 已完成 ${summary['已完成'] || 0}`;
        list.innerHTML = rows.length ? rows.map(row => `<article class="rounded-lg border border-slate-200 p-4 space-y-2"><div class="flex flex-wrap justify-between gap-2"><strong>${esc(row.topic)}</strong><span class="text-sm text-ukn-800">${esc(row.status)}</span></div><p class="text-sm text-slate-600">${esc(row.contact)} · ${esc(row.channel)} · ${esc(row.created_at)}</p><p class="text-sm whitespace-pre-wrap">${esc(row.question)}</p><form data-admission-id="${Number(row.id)}" class="flex flex-wrap gap-2"><label class="sr-only" for="admission-status-${Number(row.id)}">處理狀態</label><select id="admission-status-${Number(row.id)}" name="status" class="border rounded p-2 text-sm">${['待回覆','處理中','已轉介','已完成'].map(status => `<option${status === row.status ? ' selected' : ''}>${status}</option>`).join('')}</select><label class="sr-only" for="admission-note-${Number(row.id)}">處理紀錄</label><input id="admission-note-${Number(row.id)}" name="note" value="${esc(row.note)}" placeholder="處理紀錄或轉介單位" maxlength="2000" class="border rounded p-2 text-sm flex-1 min-w-[200px]"><button class="bg-ukn-800 text-white rounded px-3 py-2 text-sm">儲存處理紀錄</button></form></article>`).join('') : '<p class="text-sm text-slate-500">目前沒有招生諮詢紀錄。</p>';
    }
    async function loadAssistantAdmissions() {
        const root = $('tab-admissions');
        if (!root || currentUser.role !== '科助' || currentUser.office !== '資訊管理科（五專）／科辦公室') return;
        const list = $('assistantAdmissionsList');
        list.innerHTML = '<p class="text-sm text-slate-500">正在讀取招生諮詢…</p>';
        try { renderAdmissions(await call('/api/campus/assistant/admissions')); }
        catch (error) { list.innerHTML = `<p class="text-sm text-rose-700">${esc(error.message)}</p>`; }
        if (root.dataset.eventsReady) return;
        root.dataset.eventsReady = '1';
        root.addEventListener('submit', async event => {
            const form = event.target;
            if (!form.matches('#assistantAdmissionForm,[data-admission-id]')) return;
            event.preventDefault();
            const button = form.querySelector('button');
            button.disabled = true;
            try {
                const fields = Object.fromEntries(new FormData(form));
                if (form.id === 'assistantAdmissionForm') {
                    await call('/api/campus/assistant/admissions', json(fields));
                    form.reset();
                } else {
                    await call(`/api/campus/assistant/admissions/${form.dataset.admissionId}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
                }
                renderAdmissions(await call('/api/campus/assistant/admissions'));
                toast('招生諮詢紀錄已儲存');
            } catch (error) { toast(error.message, 'error'); }
            finally { if (button.isConnected) button.disabled = false; }
        });
    }
    tabLoaders['tab-admissions'] = loadAssistantAdmissions;
    function renderCase(c) {
        selected = c;
        const step = c.workflow?.[c.workflow_index];
        const last = !step || c.workflow_index === c.workflow.length - 1;
        const actions = c.can_act && active(c) ? `<div class="mt-4 space-y-3">${['待受理','重新送審'].includes(c.status) ? '<button type="button" data-case-start class="bg-ukn-800 text-white rounded px-4 py-2">受理並由我承辦</button>' : ''}<form id="assistantCaseForm" class="space-y-3"><label class="block text-sm font-semibold">辦理動作<select name="action" class="block border rounded p-2 w-full mt-1"><option value="supplement">要求補件</option>${c.status === '處理中' ? `<option value="${last ? 'complete' : 'advance'}">${last ? '完成結案' : '完成本步驟，送下一關'}</option><option value="reject">退件結案</option>` : ''}</select></label><label class="block text-sm">應補資料（補件時每行一項）<textarea name="requirements" rows="2" class="block border rounded p-2 w-full mt-1"></textarea></label><label class="block text-sm">補件期限<input type="date" name="due_date" value="${esc(c.due_date)}" class="block border rounded p-2 w-full mt-1"></label>${step && c.status === '處理中' ? `<fieldset class="border rounded p-3"><legend class="font-semibold">${esc(step.name)}檢核</legend>${step.checks.map(text => `<label class="block text-sm mt-2"><input type="checkbox" name="checked_step" value="${esc(text)}"> ${esc(text)}</label>`).join('')}</fieldset>` : ''}${c.signoff_required ? '<label class="block text-sm"><input type="checkbox" name="signoff_confirmed"> 我已核對本版本資料並留下線上簽核紀錄</label>' : ''}<label class="block text-sm">辦理說明<textarea name="note" rows="2" maxlength="2000" required class="block border rounded p-2 w-full mt-1"></textarea></label><button class="bg-ukn-800 text-white rounded px-4 py-2">確認執行</button></form></div>` : '';
        $('assistantCaseDetail').innerHTML = `<div class="flex flex-wrap justify-between gap-2"><h3 class="font-bold text-lg">#${Number(c.id)} ${esc(c.title)}</h3><span class="text-sm text-ukn-800">${esc(c.status)}</span></div><p class="text-sm text-slate-600 mt-2">${esc(c.student_name)} · ${esc(c.office)} · 期限 ${esc(c.due_date)}</p><p class="mt-3 whitespace-pre-wrap">${esc(c.detail)}</p>${Object.entries(c.answers || {}).length ? `<dl class="mt-3 text-sm">${Object.entries(c.answers).map(([key,value]) => `<div class="py-1"><dt class="font-semibold">${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>` : ''}${c.files?.length ? `<div class="mt-3 text-sm">附件：${c.files.map(f => `<a class="text-ukn-800 underline mr-3" href="/api/campus/admin-cases/${c.id}/files/${encodeURIComponent(f.id)}">${esc(f.name)}</a>`).join('')}</div>` : ''}${actions}`;
        $('assistantCaseDetail').classList.remove('hidden');
        $('assistantCaseDetail').scrollIntoView({behavior:'smooth',block:'nearest'});
    }
    async function loadAssistantHome() {
        if (loading) return;
        loading = true;
        const box = $('staffHome');
        $('tab-home')?.classList.add('assistant-home-mode');
        $('heroSection')?.classList.add('hidden');
        box.classList.remove('hidden');
        box.innerHTML = '<p class="text-sm text-slate-500">正在整理本科工作…</p>';
        const cs = currentUser.office === '資訊管理科（五專）／科辦公室';
        const requests = [call('/api/campus/admin-cases'),call('/api/campus/activity-campaigns'),
            call('/api/campus/office-resources'),call('/api/campus/assistant/students')];
        if (cs) requests.push(call('/api/campus/graduation-projects'), call('/api/campus/assistant/graduation-roster'), call('/api/campus/assistant/classes'));
        requests.push(call(`/api/campus/calendar/month?year=${new Date().getFullYear()}&month=${new Date().getMonth()+1}`));
        const results = await Promise.allSettled(requests);
        const value = index => results[index].status === 'fulfilled' ? results[index].value.data || [] : [];
        const cases = value(0).filter(c => c.office === currentUser.office);
        const activities = value(1);
        const documents = value(2).filter(r => r.office === currentUser.office);
        const students = value(3);
        const projects = cs ? value(4) : [];
        const graduation = cs && results[5].status === 'fulfilled' ? results[5].value : null;
        const classData = cs && results[6].status === 'fulfilled' ? results[6].value : null;
        const calendarIndex = cs ? 7 : 4;
        const calendar = results[calendarIndex].status === 'fulfilled' ? results[calendarIndex].value : null;
        const errorNames = results.map((result,index) => result.status === 'rejected' ? ['案件','活動','文件','學生',...(cs ? ['專題','畢業進度','全科班級'] : []),'行事曆'][index] : null).filter(Boolean);
        const today = calendar?.today || new Date().toISOString().slice(0,10);
        const upcoming = (calendar?.events || []).filter(e => e.end_date >= today).sort((a,b) => a.start_date.localeCompare(b.start_date)).slice(0,6);
        const todos = [...cases.filter(active).map(c => ({title:c.title, detail:`${c.status} · 期限 ${c.due_date}`, urgent:c.overdue})),
            ...projects.flatMap(t => t.submissions.filter(s => s.status === '待審核').map(s => ({title:`專題待審：${t.title}`,detail:s.stage || '待老師審核',urgent:false})))];
        box.innerHTML = `<section class="rounded-xl border border-ukn-200 bg-white p-5 sm:p-6"><div class="flex flex-wrap justify-between gap-3"><div><p class="text-xs font-bold tracking-widest text-ukn-700">科助 · 校務首頁</p><h1 class="ukn-title text-2xl font-bold text-ukn-900 mt-1">${esc(currentUser.office || '科辦公室')}工作區</h1><p class="text-sm text-slate-600 mt-2">${esc(currentUser.full_name)} · 本科學生 ${students.length} 人</p></div><button type="button" data-assistant-refresh class="border border-ukn-300 text-ukn-800 rounded px-3 py-2 self-start">重新整理</button></div><p id="assistantHomeMessage" class="text-sm text-rose-700 mt-2" role="status">${errorNames.length ? `部分資料暫時無法讀取：${esc(errorNames.join('、'))}` : ''}</p></section>
        ${cs ? `<nav class="flex flex-wrap gap-2" aria-label="科助工作區"><a href="/?assistant=home" data-assistant-view="home" class="rounded-lg px-4 py-2 font-semibold border">首頁 · 行事曆與待辦</a><a href="/?assistant=classes" data-assistant-view="classes" class="rounded-lg px-4 py-2 font-semibold border">查看全科 · ${students.length} 位學生</a></nav>` : ''}
        <section id="assistantHomeDashboard" class="grid lg:grid-cols-2 gap-4"><div class="rounded-xl border border-ukn-200 bg-white p-5"><div class="flex items-center justify-between gap-2"><h2 class="font-bold text-lg">近期行事曆</h2><button type="button" data-assistant-calendar class="text-sm font-semibold text-ukn-800 underline">查看完整行事曆 →</button></div><div class="mt-3 space-y-2">${upcoming.length ? upcoming.map(e => `<div class="border-l-4 border-ukn-400 bg-slate-50 rounded-r p-3"><strong class="text-sm">${esc(e.title)}</strong><p class="text-xs text-slate-600 mt-1">${esc(e.start_date)}${e.end_date !== e.start_date ? ` 至 ${esc(e.end_date)}` : ''} · ${esc(e.category || '行事曆')}</p></div>`).join('') : '<p class="text-sm text-slate-500">近期沒有行事曆事項。</p>'}</div></div><div class="rounded-xl border border-ukn-200 bg-white p-5"><h2 class="font-bold text-lg">待辦事項</h2><p class="text-sm text-slate-600 mt-1">${todos.length} 件需要處理</p><div class="mt-3 space-y-2">${todos.length ? todos.slice(0,6).map(t => `<div class="rounded-lg border ${t.urgent ? 'border-rose-300 bg-rose-50' : 'border-slate-200'} p-3"><strong class="text-sm">${esc(t.title)}</strong><p class="text-xs text-slate-600 mt-1">${esc(t.detail)}${t.urgent ? ' · 已逾期' : ''}</p></div>`).join('') : '<p class="text-sm text-slate-500">目前沒有待辦事項。</p>'}</div></div></section>

        ${cs ? `<section id="assistantClassOverview" class="rounded-xl border border-ukn-200 bg-white p-5 space-y-3"><div><p class="text-xs font-bold text-ukn-700">全科學生工作區</p><h2 class="font-bold text-lg">先看班級，再處理學生</h2><p class="text-sm text-slate-600">一至三年級先看出缺勤、請假與未通過科目；四年級加入專題規劃；五年級再看實習與畢業審查。</p></div><div id="assistantClassCards" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2"></div><div class="flex flex-wrap items-center gap-2"><label for="assistantClassSearch" class="sr-only">搜尋本科學生</label><input id="assistantClassSearch" type="search" placeholder="搜尋姓名、學號、班級或未通過科目" class="border rounded p-2 text-sm flex-1 min-w-[220px]"><button type="button" data-class="" class="text-sm border border-ukn-300 rounded px-3 py-2">全部班級</button><span id="assistantClassCount" class="text-xs text-slate-500"></span></div><div id="assistantClassStudents" class="border rounded-lg"></div><p class="text-xs text-slate-500">${esc(classData?.note || '資料暫時無法讀取。')}</p></section>` : ''}
        ${cs ? '<section class="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3"><div><h2 class="font-bold text-lg">資管科成果與榮譽</h2><p class="text-sm text-slate-700">審核投稿、發布成果，查看久未更新的分類。</p></div><button type="button" onclick="switchTab(\'tab-achievements\')" class="font-semibold text-ukn-800 underline">查看待審核成果 →</button></section>' : ''}
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">${[['本科待辦',cases.filter(active).length],['已逾期',cases.filter(c=>c.overdue).length],['活動與比賽',activities.length],[cs ? '專題待審' : '本科文件',cs ? projects.flatMap(t=>t.submissions).filter(s=>s.status==='待審核').length : documents.length]].map(([label,n]) => `<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-sm text-slate-600">${esc(label)}</p><strong class="text-2xl text-ukn-900">${n}</strong></div>`).join('')}</section>
        <section class="grid lg:grid-cols-2 gap-4"><div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3"><div class="flex justify-between gap-2"><h2 class="font-bold text-lg">行政案件 · 本科</h2><span class="text-sm text-slate-500">直接在首頁辦理</span></div><div class="space-y-2">${caseList(cases)}</div></div><div id="assistantCaseDetail" class="hidden bg-white rounded-xl border border-ukn-300 p-5"></div></section>
        <section class="grid lg:grid-cols-2 gap-4"><div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3"><div class="flex justify-between gap-2"><h2 class="font-bold text-lg">活動與比賽</h2><a href="/activities" class="text-sm text-ukn-800 font-semibold">建立活動 →</a></div>${activityList(activities)}</div>${cs ? `<div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3"><div class="flex justify-between gap-2"><h2 class="font-bold text-lg">畢業專題進度</h2><a href="/graduation-projects" class="text-sm text-ukn-800 font-semibold">媒合與查看全部 →</a></div>${projectList(projects)}</div>` : `<div class="bg-white rounded-xl border border-slate-200 p-5 space-y-3"><h2 class="font-bold text-lg">本科 SOP 與表單</h2><p class="text-sm text-slate-600">已上傳 ${documents.length} 份文件。</p></div>`}</section>
        ${cs ? `<details id="assistantGraduationSection" class="bg-white rounded-xl border border-slate-200 p-5 space-y-3"><summary class="font-bold text-lg cursor-pointer">五年級畢業進度 · 需追蹤 ${Number(graduation?.summary?.needs_follow_up || 0)} 人</summary><div class="flex flex-wrap justify-between gap-3 mt-4"><div><p class="text-sm text-slate-600">僅五年級進入畢業審查；一至三年級不列專題或實習缺項。</p><p class="text-sm text-slate-600">專題待老師審核 ${Number(graduation?.summary?.project_pending_review || 0)} 人</p></div><a href="/api/campus/assistant/graduation-roster.csv" class="border border-ukn-300 text-ukn-800 rounded px-3 py-2 self-start text-sm font-semibold">下載 CSV</a></div><p class="text-xs text-amber-800 rounded bg-amber-50 p-3">${esc(graduation?.rule_note || '畢業進度尚未能讀取；請重新整理。')}本表僅供追蹤，不代表正式畢業資格審定。</p><div class="flex flex-wrap gap-2"><label class="sr-only" for="assistantGraduationSearch">搜尋學生</label><input id="assistantGraduationSearch" type="search" placeholder="搜尋五年級學生" class="border rounded p-2 text-sm min-w-[220px]"><label class="sr-only" for="assistantGraduationFilter">篩選進度</label><select id="assistantGraduationFilter" class="border rounded p-2 text-sm"><option value="all">全部學生</option><option value="follow-up">需追蹤</option><option value="待老師審核">專題待老師審核</option><option value="未組隊">專題未組隊</option></select><span id="assistantGraduationCount" class="text-xs text-slate-500 self-center"></span></div><div id="assistantGraduationTable" class="overflow-x-auto border rounded-lg"></div></details>` : ''}
        <section class="bg-white rounded-xl border border-slate-200 p-5"><h2 class="font-bold text-lg">本科 SOP 與表單範例</h2><div class="grid sm:grid-cols-2 gap-3 mt-3"><div class="space-y-2">${documents.map(r => `<a class="block text-sm text-ukn-800 underline" href="/api/campus/office-resources/${Number(r.id)}/file">${esc(r.kind)} · ${esc(r.title)}（第 ${Number(r.version)} 版）</a>`).join('') || '<p class="text-sm text-slate-500">尚無文件。</p>'}</div><form id="assistantResourceForm" class="space-y-2"><label class="block text-sm">文件名稱<input name="title" required maxlength="100" class="block w-full border rounded p-2 mt-1"></label><label class="block text-sm">類型<select name="kind" class="block w-full border rounded p-2 mt-1"><option>SOP</option><option>表單範例</option></select></label><label class="block text-sm">檔案<input name="file" type="file" required accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" class="block w-full text-sm mt-1"></label><button class="bg-ukn-800 text-white rounded px-4 py-2">上傳本科文件</button></form></div></section>`;
        if (cs) {
            if (!selectedClass) selectedClass = classData?.classes?.[0]?.class_name || '';
            box.querySelector('#assistantClassOverview').after(box.querySelector('#assistantGraduationSection'));
            renderClassOverview(classData);
            box.querySelector('#assistantClassSearch').addEventListener('input', () => renderClassOverview(classData));
            graduationTable(graduation?.data || []);
            box.querySelector('#assistantGraduationSearch').addEventListener('input', () => graduationTable(graduation?.data || []));
            box.querySelector('#assistantGraduationFilter').addEventListener('change', () => graduationTable(graduation?.data || []));
            const extras = document.createElement('details');
            extras.id = 'assistantHomeExtras';
            extras.className = 'rounded-xl border border-slate-200 bg-white p-4 space-y-4';
            const summary = document.createElement('summary');
            summary.className = 'cursor-pointer font-semibold text-ukn-900';
            summary.textContent = '其他科務工具：成果、案件、活動、專題與表單';
            extras.append(summary);
            while (box.querySelector('#assistantGraduationSection').nextElementSibling) extras.append(box.querySelector('#assistantGraduationSection').nextElementSibling);
            box.append(extras);
        }
        showAssistantView(box);
        box.onclick = async event => {
            if (event.target.closest('[data-assistant-view]')) return;
            if (event.target.closest('[data-assistant-calendar]')) { switchTab('tab-calendar'); return; }
            const classButton = event.target.closest('[data-class]');
            if (classButton) { selectedClass = classButton.dataset.class; renderClassOverview(classData); return; }
            const refresh = event.target.closest('[data-assistant-refresh]');
            const caseButton = event.target.closest('[data-assistant-case]');
            const activityButton = event.target.closest('[data-activity-remind]');
            const projectButton = event.target.closest('[data-project-remind]');
            const startButton = event.target.closest('[data-case-start]');
            try {
                if (refresh) { await loadAssistantHome(); return; }
                if (caseButton) { renderCase((await call(`/api/campus/admin-cases/${caseButton.dataset.assistantCase}`)).data); return; }
                if (startButton && selected) { await call(`/api/campus/admin-cases/${selected.id}`,json({action:'start',revision:selected.revision})); await loadAssistantHome(); return; }
                if (activityButton) { const response = await call(`/api/campus/activity-campaigns/${activityButton.dataset.activityRemind}/approvals/remind-pending`,{method:'POST'}); notice(response.message); return; }
                if (projectButton) { const response = await call(`/api/campus/graduation-projects/submissions/${projectButton.dataset.projectRemind}/remind`,{method:'POST'}); notice(response.message); return; }
            } catch(error) { notice(error.message,true); }
        };
        box.onsubmit = async event => {
            if (!event.target.matches('#assistantCaseForm,#assistantResourceForm')) return;
            event.preventDefault();
            const form = event.target;
            const submit = form.querySelector('button[type="submit"],button:not([type])');
            if (submit) submit.disabled = true;
            try {
                if (form.id === 'assistantResourceForm') {
                    const response = await call('/api/campus/office-resources',{method:'POST',body:new FormData(form)});
                    await loadAssistantHome(); notice(response.message); return;
                }
                if (!selected) return;
                const fd = new FormData(form);
                const action = fd.get('action');
                if (action === 'reject' && !confirm('確定要退件結案嗎？')) return;
                const data = {action,revision:selected.revision,note:String(fd.get('note')||'')};
                if (action === 'supplement') Object.assign(data,{requirements:String(fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean),due_date:fd.get('due_date')});
                if (['advance','complete'].includes(action)) {
                    data.checked_steps = fd.getAll('checked_step');
                    if (selected.signoff_required) Object.assign(data,{signoff_confirmed:fd.has('signoff_confirmed'),review_digest:selected.review_digest});
                }
                const response = await call(`/api/campus/admin-cases/${selected.id}`,json(data));
                await loadAssistantHome(); notice(response.message);
            } catch(error) { notice(error.message,true); }
            finally { if (submit?.isConnected) submit.disabled = false; }
        };
        loading = false;
    }
    window.loadAssistantHome = loadAssistantHome;
})();

