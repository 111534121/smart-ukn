'use strict';
(() => {
    const $ = id => document.getElementById(id);
    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let user, allEvents = [], currentEvent = null, regs = [], editingId = null;

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
        if (button) button.disabled = true;
        try { await work(); } catch (e) { message(e.message, true); }
        finally { if (button) button.disabled = false; }
    }

    function renderEventSelect() {
        const opts = allEvents.map(e =>
            `<option value="${e.id}">${esc(e.title)}（${esc(e.event_date)}）${e.cancelled ? ' · 已取消' : ''}</option>`).join('');
        $('eventSelect').innerHTML = opts || '<option value="">目前沒有任何活動</option>';
        if (currentEvent) $('eventSelect').value = String(currentEvent);
    }

    function renderStats(ev) {
        $('eventStats').hidden = false;
        const rate = ev.attendance_rate === null ? '—' : `${Math.round(ev.attendance_rate * 100)}%`;
        const stats = [['已報名', ev.registered_count, `/ ${ev.capacity} 名額`], ['候補中', ev.waitlist_count, ''],
            ['已簽到', ev.checked_in_count, ''], ['出席率', rate, '']];
        $('eventStats').innerHTML = stats.map(([name, n, suffix]) =>
            `<div class="stat">${name}<b>${esc(n)}<small> ${esc(suffix)}</small></b></div>`).join('');
        $('listScope').textContent = `${ev.event_date} ${ev.event_time || ''} · ${ev.location}`
            + (ev.deadline_passed ? '（報名已截止）' : '') + (ev.event_over ? '（活動已結束）' : '')
            + (ev.cancelled ? '（活動已取消）' : '');
    }

    function renderList() {
        const q = $('search').value.trim().toLowerCase();
        const filtered = regs.filter(r => !q ||
            `${r.full_name} ${r.student_id} ${r.email}`.toLowerCase().includes(q));
        if (!filtered.length) {
            $('regList').innerHTML = '<p class="muted">目前沒有符合條件的報名者。</p>';
            return;
        }
        $('regList').innerHTML = filtered.map(r => `
            <div class="reg-row" data-reg="${r.id}">
                <div class="info">
                    <strong>${esc(r.full_name)}（${esc(r.student_id)}）
                        <span class="badge status-${esc(r.status)}">${esc(r.status)}</span>
                        ${r.checked_in ? '<span class="badge checked-in">已簽到</span>' : ''}
                    </strong>
                    <small>${esc(r.email)}${r.phone ? ' · ' + esc(r.phone) : ''} · ${esc(r.age)} 歲${r.note ? ' · ' + esc(r.note) : ''}</small>
                    <small>報名時間：${esc(r.created_at)}${r.cancelled_at ? ' · 取消時間：' + esc(r.cancelled_at) : ''}</small>
                </div>
                <div class="actions">
                    ${r.status === '已報名' && !r.checked_in ? `<button type="button" data-act="checkin">簽到</button>` : ''}
                    ${r.status !== '已取消' ? `<button type="button" data-act="notify">重寄通知</button>` : ''}
                    ${r.status !== '已取消' ? `<button type="button" data-act="edit">編輯</button>` : ''}
                    ${r.status !== '已取消' ? `<button type="button" data-act="cancel">取消報名</button>` : ''}
                    <button type="button" data-act="delete">刪除</button>
                </div>
            </div>`).join('');
    }

    async function loadEvent(id) {
        currentEvent = id;
        closeEdit();
        if (!id) { $('eventStats').hidden = true; $('regList').innerHTML = '請先選擇活動。'; $('addSection').hidden = true; return; }
        const result = await api(`/api/campus/events/${id}/registrations`);
        regs = result.data;
        renderStats(result.event);
        renderList();
        $('addSection').hidden = false;
    }

    async function refreshAll(keepSelection = true) {
        const result = await api('/api/campus/events');
        allEvents = result.data;
        renderEventSelect();
        const target = keepSelection && currentEvent ? currentEvent : (allEvents[0] && allEvents[0].id);
        if (target) { $('eventSelect').value = String(target); await loadEvent(target); }
        else { currentEvent = null; $('regList').innerHTML = '目前沒有任何活動。'; $('addSection').hidden = true; $('eventStats').hidden = true; }
    }

    function openEdit(reg) {
        editingId = reg.id;
        const form = $('editForm');
        form.student_id.value = reg.student_id;
        form.full_name.value = reg.full_name;
        form.email.value = reg.email;
        form.phone.value = reg.phone || '';
        form.age.value = reg.age;
        form.note.value = reg.note || '';
        $('editPanel').hidden = false;
        $('editPanel').scrollIntoView({behavior: 'smooth', block: 'start'});
    }
    function closeEdit() {
        editingId = null;
        $('editPanel').hidden = true;
        $('editForm').reset();
    }

    function formToFields(form) {
        return {
            student_id: form.student_id.value.trim(), full_name: form.full_name.value.trim(),
            email: form.email.value.trim(), phone: form.phone.value.trim(),
            age: form.age.value, note: form.note.value.trim(),
        };
    }

    async function init() {
        const me = await api('/api/auth/me');
        if (!me.is_authenticated) throw new Error('請先登入系統');
        user = me.user;
        if (!['老師', '教職員', '管理員'].includes(user.role)) throw new Error('僅限老師/教職員/管理員使用此頁面');
        $('identity').textContent = `${user.full_name} · ${user.role}`;
        await refreshAll(false);
    }

    $('refresh').addEventListener('click', e => busy(e.target, async () => { message(''); await refreshAll(); }));
    $('eventSelect').addEventListener('change', e => busy(null, () => loadEvent(Number(e.target.value) || null)));
    $('search').addEventListener('input', renderList);

    $('addForm').addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        busy(form.querySelector('button'), async () => {
            const result = await api(`/api/campus/events/${currentEvent}/registrations`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formToFields(form)),
            });
            form.reset();
            message(result.message);
            await loadEvent(currentEvent);
        });
    });

    $('editCancel').addEventListener('click', closeEdit);
    $('editForm').addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        busy(form.querySelector('button'), async () => {
            const result = await api(`/api/campus/events/${currentEvent}/registrations/${editingId}`, {
                method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formToFields(form)),
            });
            message(result.message);
            closeEdit();
            await loadEvent(currentEvent);
        });
    });

    $('regList').addEventListener('click', e => {
        const button = e.target.closest('[data-act]');
        if (!button) return;
        const row = button.closest('[data-reg]');
        const regId = Number(row.dataset.reg);
        const reg = regs.find(r => r.id === regId);
        const act = button.dataset.act;
        busy(button, async () => {
            if (act === 'checkin') {
                const result = await api(`/api/campus/events/${currentEvent}/checkin`, {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({checkin_code: reg.checkin_code}),
                });
                message(result.message);
            } else if (act === 'notify') {
                const result = await api(`/api/campus/events/${currentEvent}/registrations/${regId}/notify`, {method: 'POST'});
                message(result.message);
            } else if (act === 'edit') {
                openEdit(reg);
                return;
            } else if (act === 'cancel') {
                if (!confirm(`確定要取消 ${reg.full_name} 的報名嗎？`)) return;
                const result = await api(`/api/campus/events/${currentEvent}/registrations/${regId}/cancel`, {method: 'POST'});
                message(result.message);
            } else if (act === 'delete') {
                if (!confirm(`確定要刪除 ${reg.full_name} 的報名紀錄嗎？此動作無法復原。`)) return;
                const result = await api(`/api/campus/events/${currentEvent}/registrations/${regId}`, {method: 'DELETE'});
                message(result.message);
            }
            await loadEvent(currentEvent);
        });
    });

    init().catch(e => { $('regList').textContent = '無法讀取資料，請確認登入身分後重試。'; message(e.message, true); });
})();
