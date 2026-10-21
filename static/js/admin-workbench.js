'use strict';
(() => {
    const $ = id => document.getElementById(id);
    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let user, config, rows = [], selected = null;
    const active = c => ['待受理','處理中','待補件','重新送審'].includes(c.status);
    const option = (v, label = v, chosen = '') => `<option value="${esc(v)}" ${v === chosen ? 'selected' : ''}>${esc(label)}</option>`;
    const offices = chosen => config.offices.map(v => option(v, v, chosen)).join('');
    async function api(url, opts = {}) {
        const response = await fetch(url, opts);
        let body;
        try { body = await response.json(); } catch { throw new Error('伺服器回應異常，請稍後重試'); }
        if (!response.ok || body.status === 'error') throw new Error(body.message || '操作失敗');
        return body;
    }
    function message(value, error = false) {
        $('message').textContent = value;
        $('message').className = value ? (error ? 'error' : 'success') : '';
    }
    async function busy(button, work) {
        button.disabled = true;
        try { await work(); } catch (e) { message(e.message, true); }
        finally { button.disabled = false; }
    }
    function renderList() {
        const search = $('search').value.trim().toLowerCase();
        const list = rows.filter(c => (!search || `${c.id} ${c.title} ${c.student_id} ${c.student_name}`.toLowerCase().includes(search))
            && (!$('status').value || c.status === $('status').value)
            && (!$('officeFilter').value || c.office === $('officeFilter').value)
            && (!$('mine').checked || c.assignee === user.username)
            && (!$('overdue').checked || c.overdue));
        $('caseList').innerHTML = list.length ? list.map(c => `<button class="case-row" type="button" data-case="${c.id}"><div><strong>#${c.id} · ${esc(c.title)}</strong><small>${esc(c.student_name)} · ${esc(c.student_id)} · ${esc(c.office)}<br>承辦：${esc(c.assignee || '待分派')} · ${c.status === '待補件' ? '補件' : '辦理'}期限 ${esc(c.due_date)}</small></div><span class="badge ${c.overdue || c.status === '待補件' ? 'warn' : ''}">${esc(c.status)}${c.overdue ? ' · 逾期' : ''}</span></button>`).join('') : '<p class="muted">目前沒有符合條件的案件。</p>';
    }
    async function refresh() {
        const result = await api('/api/campus/admin-cases');
        rows = result.data;
        const stats = [['待處理', rows.filter(c => ['待受理','重新送審'].includes(c.status)).length],
            ['處理中', rows.filter(c => c.status === '處理中').length], ['待補件', rows.filter(c => c.status === '待補件').length],
            ['已逾期', rows.filter(c => c.overdue).length]];
        $('stats').innerHTML = stats.map(([name,n], i) => `<div class="stat ${i === 3 && n ? 'alert' : ''}">${name}<b>${n}<small> 件</small></b></div>`).join('');
        renderList();
        if (selected) {
            if (rows.some(c => c.id === selected.id)) await openCase(selected.id, false);
            else { selected = null; $('detail').hidden = true; }
        }
    }
    async function openCase(id, focus = true) {
        selected = (await api(`/api/campus/admin-cases/${id}`)).data;
        const c = selected, staff = user.role !== '學生';
        const attachments = c.files.map(f => `<li><a href="/api/campus/admin-cases/${c.id}/files/${f.id}">${esc(f.name)}</a> <small>(${Math.ceil(f.size/1024)} KB)</small></li>`).join('');
        let controls = '';
        if (!staff && c.status === '待補件') {
            controls = `<h3>補齊資料後重新送審</h3><form id="resubmitForm">${c.requirements.map(r => `<label class="check"><input type="checkbox" name="checked" value="${esc(r)}" required>${esc(r)}</label>`).join('')}<label>補件說明<textarea name="note" rows="3" maxlength="2000" required></textarea></label><label>補交附件<input type="file" name="files" multiple accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.txt"></label><p class="muted">最多 5 個，每個 10 MB。若要求補交文件，請確認已上傳再勾選完成。</p><button class="primary" type="submit">補件完成，重新送審</button></form>`;
        } else if (staff && active(c)) {
            controls = `<h3>辦理案件</h3><div class="actions">${['待受理','重新送審'].includes(c.status) ? '<button type="button" id="start" class="primary">受理並由我承辦</button>' : ''}</div>
            <form id="actionForm"><label>辦理動作<select name="action" id="action">${c.status !== '待補件' ? '<option value="supplement">要求補件</option>' : ''}<option value="assign">分派／轉交</option>${c.status === '處理中' ? '<option value="complete">完成結案</option><option value="reject">退件結案</option>' : ''}</select></label>
            <div id="supplementFields"><label>應補資料（每行一項，最多 15 項）<textarea id="requirements" rows="3" maxlength="2264"></textarea></label><label>補件期限<input type="date" id="due" value="${esc(c.due_date)}"></label></div>
            <div id="assignFields" hidden class="formgrid"><label>承辦處室<select id="targetOffice">${offices(c.office)}</select></label><label>承辦人<select id="assignee"></select></label></div>
            <label>辦理原因／轉交說明／結案結果<textarea name="note" rows="3" maxlength="2000" required></textarea></label><button class="primary" type="submit">確認執行</button></form>`;
        }
        $('detail').hidden = false;
        $('detail').innerHTML = `<div class="sectionhead"><h2>#${c.id} · ${esc(c.title)}</h2><span class="badge">${esc(c.status)}</span></div><p class="muted">${esc(c.student_name)} · ${esc(c.student_id)}｜${esc(c.office)}｜承辦 ${esc(c.assignee || '待分派')}｜期限 ${esc(c.due_date)}</p><div class="prose">${esc(c.detail)}</div>${attachments ? `<h3>申請與補件附件</h3><ul>${attachments}</ul>` : ''}${c.requirements.length ? `<h3>最近一次應補資料</h3><ul>${c.requirements.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}${controls}<h3>完整處理紀錄</h3><ol class="timeline">${[...c.history].reverse().map(h => `<li><strong>${esc(h.action)}</strong> · ${esc(h.actor)}<p class="prose">${esc(h.note || (h.action === '送出申請' ? '已送出申請' : '已更新案件狀態'))}</p><small>${esc(h.at)} · ${esc(h.office)} · ${esc(h.status)}${h.assignee ? ' · 承辦 '+esc(h.assignee) : ''}</small></li>`).join('')}</ol>`;
        $('start')?.addEventListener('click', e => busy(e.target, () => mutate({action:'start'})));
        $('action')?.addEventListener('change', updateAction);
        $('targetOffice')?.addEventListener('change', renderAssignees);
        if ($('actionForm')) { renderAssignees(); updateAction(); $('actionForm').addEventListener('submit', submitAction); }
        $('resubmitForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            busy(form.querySelector('button'), async () => {
                const body = new FormData(form);
                body.set('action', 'resubmit'); body.set('revision', selected.revision);
                await mutate(body);
            });
        });
        if (focus) { $('detail').scrollIntoView({behavior:'smooth',block:'start'}); $('detail').focus({preventScroll:true}); }
    }
    function updateAction() {
        $('supplementFields').hidden = $('action').value !== 'supplement';
        $('assignFields').hidden = $('action').value !== 'assign';
        $('requirements').required = $('due').required = $('action').value === 'supplement';
    }
    function renderAssignees() {
        const names = config.accounts.filter(a => config.members[a.username] === $('targetOffice').value);
        $('assignee').innerHTML = option('', '交由該處室分派') + names.map(a => option(a.username, `${a.full_name} (${a.username})`, selected.assignee)).join('');
    }
    function submitAction(e) {
        e.preventDefault();
        const form = e.target, action = form.elements.action.value;
        const data = {action, note:form.elements.note.value};
        if (action === 'supplement') Object.assign(data, {requirements:$('requirements').value.split('\n').map(s => s.trim()).filter(Boolean), due_date:$('due').value});
        if (action === 'assign') Object.assign(data, {office:$('targetOffice').value, assignee:$('assignee').value});
        busy(form.querySelector('button'), () => mutate(data));
    }
    async function mutate(data) {
        const opts = {method:'POST'};
        if (data instanceof FormData) opts.body = data;
        else { opts.headers = {'Content-Type':'application/json'}; opts.body = JSON.stringify({...data,revision:selected.revision}); }
        const result = await api(`/api/campus/admin-cases/${selected.id}`, opts);
        message(result.message);
        await refresh();
    }
    async function init() {
        const me = await api('/api/auth/me');
        if (!me.is_authenticated) throw new Error('請先返回校務首頁登入');
        user = me.user;
        config = await api('/api/campus/admin-cases/config');
        const student = user.role === '學生';
        $('identity').textContent = `${user.full_name} · ${user.role}`;
        $('heading').textContent = student ? '我的行政申請' : '行政人員工作台';
        $('intro').textContent = student ? '送出申請、追蹤進度，補齊資料後直接重新送審。' : '先處理待辦，再把每一件申請穩穩往前推進。';
        $('scope').textContent = student ? '僅顯示自己的申請與處理紀錄。' : user.role === '管理員' ? '管理員可查看全處室案件。' : config.office ? `目前顯示 ${config.office} 案件。` : '尚未指定處室，請聯絡管理員設定後再重新整理。';
        $('newRequest').hidden = !student; $('shortcuts').hidden = student; $('legacy').hidden = student;
        $('mine').parentElement.hidden = student;
        $('kind').innerHTML = option('', '請選擇申請類別') + Object.entries(config.kinds).map(([k,v]) => option(k, `${k} → ${v}`)).join('');
        $('officeFilter').innerHTML = option('', '全部處室') + offices();
        $('officeSettings').hidden = user.role !== '管理員';
        if (user.role === '管理員') $('members').innerHTML = config.accounts.map(a => `<label>${esc(a.full_name)} (${esc(a.username)})<select data-member="${esc(a.username)}">${option('', '未指定處室')}${offices(config.members[a.username])}</select></label>`).join('');
        await refresh();
    }
    $('refresh').addEventListener('click', e => busy(e.target, async () => { message(''); await init(); }));
    ['search','status','officeFilter','mine','overdue'].forEach(id => $(id).addEventListener('input', renderList));
    $('caseList').addEventListener('click', e => {
        const button = e.target.closest('[data-case]');
        if (button) busy(button, () => openCase(Number(button.dataset.case)));
    });
    $('createForm').addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        busy(form.querySelector('button'), async () => {
            const result = await api('/api/campus/admin-cases', {method:'POST', body:new FormData(form)});
            form.reset(); message(result.message); await refresh(); await openCase(result.data.id);
        });
    });
    $('settingsForm').addEventListener('submit', e => {
        e.preventDefault();
        busy(e.target.querySelector('button'), async () => {
            const members = {};
            document.querySelectorAll('[data-member]').forEach(el => {if (el.value) members[el.dataset.member] = el.value;});
            await api('/api/campus/admin-cases/config', {method:'PUT', headers:{'Content-Type':'application/json'},body:JSON.stringify({members})});
            message('處室分工已儲存'); await init();
        });
    });
    init().catch(e => { $('caseList').textContent = '無法讀取案件，請確認登入身分後重試。'; message(e.message, true); });
})();
