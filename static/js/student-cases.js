'use strict';
(() => {
    const el = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const services = ['請假申請', '成績單申請', '場地借用', '設備報修申請'];
    const label = kind => kind === '設備報修申請' ? '設備報修' : kind;
    const title = c => c.title.startsWith('【處室示範】') ? `${c.kind}（示範案件）` : c.title;
    const nextAction = c => c.status === '處理中' ? '等待承辦審核。' + c.progress.next_action : c.progress.next_action;
    let selectedId = Number(new URLSearchParams(location.search).get('case')) || null, rows = [], workflows = {}, filterReady = false, loading = false;
    async function request(url, options) {
        const response = await fetch(url, options);
        let body;
        try { body = await response.json(); } catch { throw new Error('伺服器回應異常，請稍後再試'); }
        if (!response.ok || body.status === 'error') throw new Error(body.message || '無法載入案件');
        return body;
    }
    const notify = text => { el('studentCasesMessage').textContent = text; };
    function renderList() {
        const kind = el('studentCaseKind').value, status = el('studentCaseStatus').value;
        const shown = rows.filter(c => (!kind || c.kind === kind) && (!status || c.status === status));
        el('studentCaseSummary').textContent = `共 ${rows.length} 件 · 待補件 ${rows.filter(c => c.status === '待補件').length} 件 · 已完成 ${rows.filter(c => c.status === '已完成').length} 件；目前顯示 ${shown.length} 件`;
        el('studentCasesList').innerHTML = shown.length ? shown.map(c => `<button type="button" data-student-case="${c.id}" aria-pressed="${c.id === selectedId}"><strong>#${c.id} ${esc(title(c))}</strong><span>${esc(c.kind)} · ${esc(c.status)} · ${esc(c.office)}</span><span>目前步驟：${esc(c.progress.current_step)}</span><span>下一步：${esc(nextAction(c))}</span></button>`).join('') : '<p>目前沒有符合條件的申請。</p>';
        el('studentCasesList').querySelectorAll('[data-student-case]').forEach(button => button.addEventListener('click', () => openCase(Number(button.dataset.studentCase)).then(() => el('studentCaseDetail').scrollIntoView({behavior:'smooth',block:'start'})).catch(error => notify(error.message))));
    }
    function input(field, index) {
        const id = `studentRequestField${index}`;
        if (field === '假別') return `<label for="${id}">${esc(field)}<select id="${id}" name="field${index}" required><option value="">請選擇</option><option>事假</option><option>病假</option><option>公假</option><option>其他</option></select></label>`;
        if (field === '領取方式') return `<label for="${id}">${esc(field)}<select id="${id}" name="field${index}" required><option value="">請選擇</option><option>教務處櫃檯領取（示範）</option><option>電子檔交付（示範）</option></select></label>`;
        const type = field.includes('日期') ? 'date' : field === '申請份數' ? 'number' : 'text';
        return `<label for="${id}">${esc(field)}<input id="${id}" name="field${index}" type="${type}" ${type === 'number' ? 'min="1" max="20"' : 'maxlength="1000"'} required></label>`;
    }
    function showRequest(kind) {
        const spec = workflows[kind];
        if (!spec || !spec.roles.includes('學生')) { notify('目前無法申請此項服務，請洽承辦單位。'); return; }
        const panel = el('studentRequestPanel'); panel.hidden = false;
        panel.innerHTML = `<form id="studentRequestForm"><h3>${esc(label(kind))}</h3><p>承辦：${esc(spec.office)} · 應備資料：${spec.documents.map(esc).join('、')}</p><div class="service-fields">${spec.fields.map(input).join('')}</div><label>申請說明<textarea name="detail" rows="3" maxlength="4000" required placeholder="請填寫申請需求；示範時請使用虛構內容"></textarea></label><label>附件（選填）<input name="files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.txt"></label><p>最多 5 個附件，每個 10 MB。</p><div class="service-actions"><button type="submit">送出${esc(label(kind))}</button><button type="button" id="studentRequestCancel">取消填寫</button></div></form>`;
        el('studentRequestCancel').addEventListener('click', () => { panel.hidden = true; panel.innerHTML = ''; });
        el('studentRequestForm').addEventListener('submit', async event => {
            event.preventDefault(); const form = event.currentTarget, button = form.querySelector('[type=submit]');
            const answers = Object.fromEntries(spec.fields.map((field, index) => [field, form.elements[`field${index}`].value.trim()]));
            if (answers['開始日期'] && answers['結束日期'] < answers['開始日期']) { notify('結束日期不可早於開始日期。'); return; }
            button.disabled = true;
            try {
                const data = new FormData(); data.set('kind',kind); data.set('title',`${kind}｜線上申辦`); data.set('detail',form.elements.detail.value.trim()); data.set('answers',JSON.stringify(answers));
                for (const file of form.elements.files.files) data.append('files',file);
                const result = await request('/api/campus/admin-cases',{method:'POST',body:data});
                selectedId = result.data.id; el('studentCaseKind').value = ''; el('studentCaseStatus').value = '';
                panel.hidden = true; panel.innerHTML = ''; notify(`申請 #${selectedId} 已送出，下一步：等待${result.data.office}受理。`);
                await window.loadStudentCases(); el('studentCaseDetail').scrollIntoView({behavior:'smooth',block:'start'});
            } catch(error) { notify(error.message); } finally { button.disabled = false; }
        });
        panel.scrollIntoView({behavior:'smooth',block:'start'});
    }
    async function openCase(id) {
        const {data:c} = await request(`/api/campus/admin-cases/${id}`);
        selectedId = c.id; const p = c.progress;
        const track = c.workflow.map((s,index) => `<li class="${index < c.workflow_index || c.status === '已完成' ? 'done' : index === c.workflow_index ? 'current' : ''}">${index + 1}. ${esc(s.name)} · ${index < c.workflow_index || c.status === '已完成' ? '已完成' : index === c.workflow_index ? esc(c.status) : '尚未開始'}</li>`).join('');
        el('studentCaseDetail').innerHTML = `<article aria-label="行政申請詳情"><h3>#${c.id} ${esc(title(c))}</h3><p>目前狀態：<strong>${esc(c.status)}</strong></p><ol class="service-track" aria-label="申辦進度">${track}</ol><p>承辦單位：${esc(p.current_office)} · 目前步驟：${esc(p.current_step)}</p><p>目前由誰處理：${esc(p.responsible)}</p><p><strong>下一步：</strong>${esc(nextAction(c))}</p>${!['已完成','已退件'].includes(c.status) ? `<p>${c.status === '待補件' ? '補件期限' : '辦理期限'}：${esc(c.due_date)}</p>` : ''}<details><summary>查看申請內容與附件</summary><p>${esc(c.detail)}</p><dl>${Object.entries(c.answers || {}).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${(c.files || []).map(f=>`<p><a href="/api/campus/admin-cases/${c.id}/files/${encodeURIComponent(f.id)}">下載 ${esc(f.name)}</a></p>`).join('')}</details>${c.is_owner && c.status === '待補件' ? `<form id="studentSupplementForm"><h4>補件清單</h4>${c.requirements.map(r => `<label class="service-check"><input type="checkbox" name="checked" value="${esc(r)}" required><span>${esc(r)}</span></label>`).join('')}<label>補件說明<textarea name="note" rows="3" maxlength="2000" required></textarea></label><label>補件附件（選填）<input type="file" name="files" multiple accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.txt"></label><p>最多 5 個附件，每個 10 MB。</p><button type="submit">補件完成，重新送審</button></form>` : ''}${window.caseSignoffHtml ? window.caseSignoffHtml(c) : ''}<details><summary>查看處理紀錄與結果</summary>${[...c.history].reverse().map(h => `<div class="service-history"><strong>${esc(h.action)}</strong> · ${esc(h.actor)}<p>${esc(h.note)}</p><small>${esc(h.at)} · ${esc(h.status)}</small></div>`).join('')}</details></article>`;
        const form = el('studentSupplementForm');
        if (form) form.addEventListener('submit', async event => {
            event.preventDefault(); const button = form.querySelector('button'); button.disabled = true;
            try {
                const data = new FormData(form); data.set('action','resubmit'); data.set('revision',c.revision);
                const result = await request(`/api/campus/admin-cases/${c.id}`,{method:'POST',body:data});
                notify(result.message + '，請等待承辦單位受理。'); await window.loadStudentCases();
            } catch(error) { notify(error.message); } finally { button.disabled = false; }
        });
        renderList();
    }
    window.openStudentService = async kind => {
        if (!services.includes(kind)) return;
        switchTab('tab-checklist');
        try {
            if (!workflows[kind]) workflows = (await request('/api/campus/admin-cases/config')).workflows;
            showRequest(kind);
        } catch(error) { notify(error.message); }
    };
    window.openStudentCase = async id => {
        switchTab('tab-checklist');
        try { await openCase(Number(id)); el('studentCaseDetail').scrollIntoView({behavior:'smooth',block:'start'}); }
        catch(error) { notify(error.message); }
    };
    window.loadStudentCases = async () => {
        const section = el('studentCasesSection'); if (!section || loading) return; loading = true;
        try {
            const me = await request('/api/auth/me'); section.hidden = me.user?.role !== '學生';
            if (section.hidden) { el('studentCaseDetail').innerHTML = ''; el('studentRequestPanel').innerHTML = ''; el('studentRequestPanel').hidden = true; selectedId = null; return; }
            const [list, config] = await Promise.all([request('/api/campus/admin-cases'),request('/api/campus/admin-cases/config')]);
            rows = list.data; workflows = config.workflows;
            try {
                const notices = (await request('/api/campus/admin-cases/notifications')).data;
                el('studentCaseNotifications').innerHTML = notices.filter(n => rows.some(c => c.id === n.case_id && c.status === '待補件')).slice(0, 3)
                    .map(n => `<div class="rounded border border-amber-300 bg-amber-50 p-3 mb-2"><strong>${esc(n.title)} · #${n.case_id}</strong><p>${esc(n.body)}</p><button type="button" data-notice-case="${n.case_id}">查看補件清單</button></div>`).join('');
                el('studentCaseNotifications').querySelectorAll('[data-notice-case]').forEach(button => button.addEventListener('click', () => openCase(Number(button.dataset.noticeCase))));
            } catch (error) { el('studentCaseNotifications').textContent = '補件提醒暫時無法載入，案件進度仍可在下方查看。'; }
            el('studentServiceChoices').innerHTML = services.map(kind=>`<button type="button" data-new-service="${esc(kind)}">${esc(label(kind))}<small>${esc(workflows[kind]?.office || '洽承辦單位')}</small></button>`).join('');
            el('studentServiceChoices').querySelectorAll('[data-new-service]').forEach(button=>button.addEventListener('click',()=>showRequest(button.dataset.newService)));
            const chosen = el('studentCaseKind').value;
            el('studentCaseKind').innerHTML = '<option value="">全部類型</option>' + [...new Set([...services,...rows.map(c=>c.kind)])].map(kind=>`<option value="${esc(kind)}">${esc(label(kind))}</option>`).join('');
            el('studentCaseKind').value = chosen;
            if (!filterReady) { el('studentCaseKind').addEventListener('change',renderList); el('studentCaseStatus').addEventListener('change',renderList); filterReady = true; }
            if (selectedId && rows.some(c=>c.id === selectedId)) await openCase(selectedId);
            else { el('studentCaseDetail').innerHTML = ''; renderList(); }
        } catch(error) { notify(error.message); } finally { loading = false; }
    };
})();
