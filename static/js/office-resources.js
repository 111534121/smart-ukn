'use strict';
(() => {
    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let user = null;
    let office = '';
    async function api(url, options) {
        const response = await fetch(url, options);
        const body = await response.json();
        if (!response.ok || body.status !== 'success') throw new Error(body.message || '操作失敗');
        return body;
    }
    async function load() {
        const rows = (await api('/api/campus/office-resources')).data;
        $('resourceList').innerHTML = rows.length ? rows.map(r => `<article class="workflow-summary">
            <h3>${esc(r.office)} · ${esc(r.kind)} · ${esc(r.title)} <small>第 ${Number(r.version)} 版</small></h3>
            <p class="muted">${esc(r.description || '')} · 更新：${esc(r.updated_at)}</p>
            <a href="/api/campus/office-resources/${Number(r.id)}/file">下載 ${esc(r.file.name)}</a>
            ${user.role === '管理員' || r.office === office && ['科助','處室承辦','教職員'].includes(user.role) ?
                `<button type="button" data-update="${Number(r.id)}" data-title="${esc(r.title)}" data-kind="${esc(r.kind)}" data-description="${esc(r.description || '')}">更新文件</button>` : ''}
        </article>`).join('') : '<p class="muted">目前沒有上傳文件。</p>';
    }
    async function init() {
        user = (await api('/api/auth/me')).user;
        if (!user) return;
        office = user.office || '';
        if (user.role === '科助') {
            const roster = await api('/api/campus/assistant/students').catch(() => null);
            $('assistantTools').hidden = false;
            $('assistantScope').textContent = office || '尚未設定所屬科系';
            $('csProjectLink').hidden = office === '資訊管理科（五專）／科辦公室' ? false : true;
            $('assistantRoster').textContent = roster ? `所屬科系 ${roster.data.length} 位學生；活動通知僅能發給此科系。` : '尚未設定科系，請管理員設定後再建立活動。';
        }
        if (['科助', '處室承辦', '教職員', '管理員'].includes(user.role)) {
            $('resourceForm').hidden = false;
            if (user.role === '管理員') {
                const config = await api('/api/campus/admin-cases/config');
                $('resourceOfficeLabel').hidden = false;
                $('resourceOffice').innerHTML = config.offices.map(name => `<option value="${esc(name)}">${esc(name)}</option>`).join('');
            }
        }
        await load();
    }
    $('resourceForm').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector('button[type="submit"]');
        const body = new FormData(form);
        if (user.role !== '管理員') body.delete('office');
        button.disabled = true;
        try {
            await api('/api/campus/office-resources', {method:'POST', body});
            form.reset(); $('resourceMessage').textContent = '文件已上傳'; await load();
        } catch (error) { $('resourceMessage').textContent = error.message; }
        finally { button.disabled = false; }
    });
    $('resourceList').addEventListener('click', async event => {
        const button = event.target.closest('[data-update]');
        if (!button) return;
        const title = prompt('文件名稱', button.dataset.title);
        if (title === null) return;
        const file = document.createElement('input');
        file.type = 'file'; file.accept = '.pdf,.docx,.xlsx,.png,.jpg,.jpeg';
        file.onchange = async () => {
            const body = new FormData();
            body.set('title', title); body.set('kind', button.dataset.kind);
            body.set('description', button.dataset.description); body.set('file', file.files[0]);
            try { await api(`/api/campus/office-resources/${Number(button.dataset.update)}`, {method:'POST', body});
                $('resourceMessage').textContent = '文件已更新'; await load(); }
            catch (error) { $('resourceMessage').textContent = error.message; }
        };
        file.click();
    });
    init().catch(error => { $('resourceMessage').textContent = error.message; });
})();
