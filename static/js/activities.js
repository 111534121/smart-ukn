'use strict';
(() => {
    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let user = null;
    async function api(url, options) {
        const response = await fetch(url, options);
        const body = await response.json();
        if (!response.ok || body.status !== 'success') throw new Error(body.message || '操作失敗');
        return body;
    }
    function message(text) { $('message').textContent = text; }
    function fileLink(id, kind, name) {
        return `<a href="/api/campus/activity-campaigns/${id}/files/${encodeURIComponent(kind)}">📎 ${esc(name)}</a>`;
    }
    function card(c) {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const closed = today > c.reply_deadline;
        const mine = c.my_reply;
        const meta = `<div class="activity-meta"><span>📅 ${esc(c.event_date)} ${esc(c.event_time)}</span><span>📍 ${esc(c.location || '待公告')}</span><span>⏳ 報名至 ${esc(c.reply_deadline)}</span><span>👥 ${esc(c.target_type)}：${esc(c.target)}${c.visitor_allowed ? '、訪客' : ''}</span></div>`;
        if (user.role === '訪客') {
            const mine = c.my_reply;
            return `<article class="card student-card" data-id="${c.id}"><div class="student-content"><h2>${esc(c.kind || '活動')} · ${esc(c.title)}</h2>${meta}<p>${esc(c.description).replace(/\n/g,'<br>')}</p>${c.attachment ? `<p>${fileLink(c.id,'attachment',c.attachment.name)}</p>` : ''}<p>名額：${c.capacity ? `${c.confirmed_count || 0} / ${c.capacity}（候補 ${c.waitlist_count || 0}）` : '不限'}</p><p>我的報名：<strong>${esc(mine?.status || '尚未報名')}</strong>${mine?.checked_in_at ? ` · 已簽到 ${esc(mine.checked_in_at)}` : ''}</p>${c.fee_mode === '付費' ? '<p class="muted">付費報名待金流服務接入，暫不開放。</p>' : closed ? '<p class="muted">報名已截止</p>' : mine?.intention === '參加' ? '<button type="button" data-action="visitor-cancel" class="secondary">取消報名</button>' : '<button type="button" data-action="visitor-register">訪客報名</button>'}</div></article>`;
        }
        if (user.role === '學生') {
            const paid = c.fee_mode === '付費';
            const fee = paid ? `<div class="fee-card"><strong>活動費用 NT$ ${Number(c.fee_amount || 0)}</strong><p>繳費服務尚未開放，現在不會產生繳費代碼，也不會收款或保留付費名額。</p><span class="pill">繳費狀態：尚未開放</span></div>` : '<div class="status-panel"><strong>免費參加</strong><p>送出「參加」後，畫面會顯示正取或候補狀態。</p></div>';
            return `<article class="card student-card" data-id="${c.id}"><div class="student-content"><span class="mobile-step">活動報名 · 第 1 步：確認資訊</span><h2>${esc(c.kind || '活動')} · ${esc(c.title)}</h2>${meta}<p>${esc(c.description).replace(/\n/g,'<br>')}</p>${c.attachment ? `<p>${fileLink(c.id,'attachment',c.attachment.name)}</p>` : ''}<p>名額：${c.capacity ? `${c.confirmed_count || 0} / ${c.capacity}（候補 ${c.waitlist_count || 0}）` : '不限'}${c.grade ? ` · 限 ${c.grade} 年級` : ''}</p>${fee}<div class="status-panel"><strong>我的報名：${esc(mine?.status || mine?.intention || '尚未回覆')}</strong>${mine?.file ? `<p>${fileLink(c.id,`reply-${user.student_id}`,mine.file.name)}</p>` : ''}</div>${closed ? '<p class="muted">報名已截止</p>' : `<form class="replyForm"><span class="mobile-step">第 2 步：回覆意願</span><div class="grid"><label>參加意願<select name="intention" required><option value="" selected disabled>請選擇</option><option value="參加" ${paid ? 'disabled' : ''}>${paid ? '參加（待開放繳費）' : '參加'}</option><option>不參加</option><option>考慮中</option></select></label><label>填好的報名表（選填）<input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.txt"></label></div><label>備註<textarea name="note" maxlength="500">${esc(mine?.note || '')}</textarea></label><div class="actions"><button type="submit">送出報名意願</button></div></form>`}</div></article>`;
        }
        const summary = c.approval_summary || {unopened:0,opened_pending:0,approved:0,returned:0};
        const payment = c.payment_summary || {mode:'免費',paid_count:0,unpaid_count:0,integration_status:'不需收費'};
        return `<article class="card" data-id="${c.id}"><h2>${esc(c.kind || '活動')} · ${esc(c.title)}</h2>${meta}<p>${esc(c.description).replace(/\n/g,'<br>')}</p><div class="grid"><div class="status-panel"><strong>老師審核進度</strong><p>未開啟 ${summary.unopened} · 已讀待審 ${summary.opened_pending} · 已核准 ${summary.approved} · 已退回 ${summary.returned}</p><div class="approval-progress"><i style="width:${summary.approved+summary.returned+summary.unopened+summary.opened_pending ? Math.round((summary.approved+summary.returned)/(summary.approved+summary.returned+summary.unopened+summary.opened_pending)*100) : 0}%"></i></div><button class="secondary" data-action="remind-all" ${summary.unopened+summary.opened_pending ? '' : 'disabled'}>一鍵提醒待審老師</button></div><div class="status-panel ${payment.mode === '付費' ? 'warning' : ''}"><strong>收費進度 · ${esc(payment.mode)}</strong><p>${payment.mode === '付費' ? `設定金額 NT$ ${Number(payment.amount)} · 已付款 ${payment.paid_count} · 待付款 ${payment.unpaid_count}` : '此活動免費，無需對帳。'}</p><p class="small">${esc(payment.integration_status)}</p></div></div><p class="muted">正取 ${c.confirmed_count || 0}${c.capacity ? ` / ${c.capacity}` : ''} · 候補 ${c.waitlist_count || 0} · 訪客報名 ${c.visitor_count || 0} · 學生已回覆 ${c.student_reply_count || 0} / ${c.recipient_count}</p>${c.attachment ? `<p>${fileLink(c.id,'attachment',c.attachment.name)}</p>` : ''}<div class="actions"><button class="secondary" data-action="broadcast">發送校園廣播</button><button class="secondary" data-action="approvals">查看老師明細</button><button class="secondary" data-action="replies">查看報名與簽到</button><button class="secondary" data-action="duplicate">複製活動</button><button class="secondary" data-action="qr">顯示簽到 QR</button><a href="/api/campus/activity-campaigns/${c.id}/report.csv">下載名單 CSV</a></div><div class="replies"></div><div class="approvals"></div><div class="checkinQr"></div></article>`;
    }
    async function load() {
        const result = await api('/api/campus/activity-campaigns');
        $('activityList').innerHTML = result.data.length ? result.data.map(card).join('') : '<p class="card muted">目前沒有活動。</p>';
        if (user.role === '科助') {
            const items = result.data;
            const pending = items.reduce((sum,c) => sum + (c.approval_summary?.unopened || 0) + (c.approval_summary?.opened_pending || 0),0);
            const unopened = items.reduce((sum,c) => sum + (c.approval_summary?.unopened || 0),0);
            const paidWaiting = items.filter(c => c.fee_mode === '付費').length;
            $('assistantDashboard').hidden = false;
            $('assistantStats').innerHTML = `<div class="stat">管理中活動<strong>${items.length}</strong><small>所屬科系活動</small></div><div class="stat">老師待審<strong>${pending}</strong><small>其中 ${unopened} 筆尚未開啟</small></div><div class="stat">收費活動<strong>${paidWaiting}</strong><small>${paidWaiting ? '金流待串接，未開始收款' : '目前無需對帳'}</small></div><div class="stat">報名正取<strong>${items.reduce((sum,c)=>sum+(c.confirmed_count||0),0)}</strong><small>免費活動統計</small></div>`;
        }
    }
    async function loadTeacherTasks() {
        if (user.role !== '老師') return;
        const result = await api('/api/campus/activity-campaigns/teacher-tasks');
        $('teacherTasks').hidden = false;
        $('teacherBadge').textContent = result.pending_count ? `🔴 ${result.pending_count}` : '';
        $('teacherTaskList').innerHTML = result.data.length ? result.data.map(t => `<div class="teacher-task ${t.status === '待審核' ? 'pending' : ''}" data-task="${t.id}"><strong>${t.status === '待審核' ? '🔴 ' : '✓ '}${esc(t.title)}</strong><p class="muted small">${esc(t.status)} · 送審 ${esc(t.created_at)}${t.reminded_at ? ` · 最近提醒 ${esc(t.reminded_at)}` : ''}</p><div class="actions">${t.status === '待審核' ? '<button data-task-action="核准">核准</button><button class="secondary" data-task-action="退回">退回</button>' : ''}</div></div>`).join('') : '<p class="muted">目前沒有審核事項。</p>';
    }
    async function init() {
        const auth = await api('/api/auth/me');
        user = auth.user;
        if (!user || !['學生', '訪客', '老師', '教職員', '處室承辦', '科助', '管理員'].includes(user.role)) { message('請先登入學生、訪客或教職員帳號。'); $('activityList').textContent = ''; return; }
        $('projectLink').hidden = !(user.role === '管理員' || user.dept_name === '資訊管理科（五專）' || user.role === '學生' && String(user.class_name || '').startsWith('資管') || user.role === '科助' && user.office === '資訊管理科（五專）／科辦公室');
        const copy = user.role === '科助' ? [`${user.office || '科助'} · 活動管理`,'掌握老師審核、學生與訪客報名及名額。','科助工作台','我的活動'] : user.role === '老師' ? ['老師待辦與活動','待審事項會優先顯示在下方，完成審核後可查看活動。','老師','活動清單'] : user.role === '學生' ? ['活動報名','查看活動資訊、回覆意願並追蹤自己的名額與繳費狀態。','學生','可報名活動'] : user.role === '訪客' ? ['訪客活動報名','查看開放訪客參加的活動與名額。','訪客','可報名活動'] : ['活動管理','建立活動並查看報名與簽到。',user.role,'活動清單'];
        $('pageTitle').textContent = copy[0]; $('pageIntro').textContent = copy[1]; $('roleChip').textContent = copy[2]; $('listTitle').textContent = copy[3];
        if (['老師', '教職員', '處室承辦', '科助', '管理員'].includes(user.role)) {
            $('createSection').hidden = false;
            const targets = (await api('/api/campus/activity-campaigns/targets')).data;
            $('targetSelect').innerHTML = [...targets.classes.map(t => `<option value="班級|${esc(t.name)}">班級：${esc(t.name)}（${t.count} 人）</option>`),
                ...targets.courses.map(t => `<option value="課程|${esc(t.name)}">課程：${esc(t.name)}（${t.count} 人）</option>`)].join('');
        }
        await load();
        await loadTeacherTasks();
        const params = new URLSearchParams(location.search);
        if (['學生','訪客'].includes(user.role) && params.has('checkin') && params.has('token')) {
            try { const result = await api(`/api/campus/activity-campaigns/${encodeURIComponent(params.get('checkin'))}/self-checkin`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token:params.get('token')})}); message(result.message); await load(); }
            catch (error) { message(error.message); }
            history.replaceState(null, '', '/activities');
        }
    }
    $('createForm').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget, button = form.querySelector('button');
        const data = new FormData(form);
        const [target_type, target] = String(data.get('target')).split('|');
        data.delete('target'); data.set('target_type', target_type); data.set('target', target);
        button.disabled = true;
        try { await api('/api/campus/activity-campaigns', {method:'POST', body:data}); form.reset(); message('活動已建立，可在下方發送校園廣播。'); await load(); }
        catch (error) { message(error.message); } finally { button.disabled = false; }
    });
    $('activityList').addEventListener('submit', async event => {
        if (!event.target.matches('.replyForm')) return;
        event.preventDefault();
        const id = event.target.closest('[data-id]').dataset.id;
        const data = new FormData(event.target);
        try { await api(`/api/campus/activity-campaigns/${id}/reply`, {method:'POST', body:data}); message('回覆已送出'); await load(); }
        catch (error) { message(error.message); }
    });
    $('activityList').addEventListener('click', async event => {
        const action = event.target.dataset.action;
        if (!action) return;
        const article = event.target.closest('[data-id]'), id = article.dataset.id;
        try {
            if (action === 'broadcast') {
                await api(`/api/campus/activity-campaigns/${id}/broadcast`, {method:'POST'});
                message('已發送校園廣播');
            } else if (action === 'replies') {
                const result = await api(`/api/campus/activity-campaigns/${id}/replies`);
                article.querySelector('.replies').innerHTML = `<div class="counts">${Object.entries(result.counts).map(([key, count]) => `<span>${esc(key)} ${count}</span>`).join('')}</div>` +
                    result.data.map(r => `<div class="row"><strong>${esc(r.student_name)}${r.student_id ? `（${esc(r.student_id)}）` : '（訪客）'}</strong> · ${esc(r.status)}${r.note ? ` · ${esc(r.note)}` : ''}${r.file ? ` · ${fileLink(id, `reply-${r.student_id}`, r.file.name)}` : ''}${r.status === '正取' ? ` · ${r.checked_in_at ? '已簽到 ' + esc(r.checked_in_at) : r.student_id ? `<button class="secondary" data-action="checkin" data-student="${esc(r.student_id)}">簽到</button>` : '等待訪客掃描 QR 簽到'}` : ''}</div>`).join('');
            } else if (action === 'visitor-register' || action === 'visitor-cancel') {
                const endpoint = action === 'visitor-register' ? 'visitor-register' : 'visitor-cancel';
                const result = await api(`/api/campus/activity-campaigns/${id}/${endpoint}`, {method:'POST'});
                message(result.message); await load();
            } else if (action === 'duplicate') {
                const event_date = prompt('新活動日期（YYYY-MM-DD）', cDate());
                if (!event_date) return;
                const reply_deadline = prompt('新回覆期限（YYYY-MM-DD）', event_date);
                if (!reply_deadline) return;
                await api(`/api/campus/activity-campaigns/${id}/duplicate`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({event_date, reply_deadline})});
                message('活動已複製；請檢查資料並發送通知。'); await load();
            } else if (action === 'checkin') {
                await api(`/api/campus/activity-campaigns/${id}/checkin`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({student_id:event.target.dataset.student})});
                message('簽到成功');
                event.target.outerHTML = '已簽到';
            } else if (action === 'approvals') {
                const result = await api(`/api/campus/activity-campaigns/${id}/approvals`);
                article.querySelector('.approvals').innerHTML = `<div class="row"><label>加入老師審核（帳號）<input class="teacherName" placeholder="例如 teacher1"></label><button data-action="add-teacher">加入待辦</button></div>` + (result.data.length ? result.data.map(a => `<div class="row approval-line"><span><strong>${esc(a.teacher_name)}</strong> · ${esc(a.status)} · ${a.opened_at ? '已開啟' : '尚未開啟'}${a.reminded_at ? ` · 已提醒 ${a.reminder_count} 次` : ''}</span>${a.status === '待審核' ? ` <button class="secondary" data-action="remind" data-approval="${a.id}">提醒這位老師</button>` : ''}</div>`).join('') : '<p class="muted">尚未指定審核老師。</p>');
            } else if (action === 'add-teacher') {
                const teacher_username = article.querySelector('.teacherName').value.trim();
                await api(`/api/campus/activity-campaigns/${id}/approvals`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({teacher_username})});
                message('已加入老師待辦'); await load();
            } else if (action === 'remind') {
                const result = await api(`/api/campus/activity-campaigns/${id}/approvals/${event.target.dataset.approval}/remind`, {method:'POST'});
                message(result.message);
            } else if (action === 'remind-all') {
                const result = await api(`/api/campus/activity-campaigns/${id}/approvals/remind-pending`, {method:'POST'});
                message(result.message);
                await load();
            } else if (action === 'qr') {
                article.querySelector('.checkinQr').innerHTML = `<div class="row"><p>請投影此 QR Code；正取學生或已登記訪客登入後掃描，10 分鐘內可自行簽到。</p><img alt="現場簽到 QR Code" width="260" height="260" src="/api/campus/activity-campaigns/${id}/checkin-qr?t=${Date.now()}"></div>`;
            }
        } catch (error) { message(error.message); }
    });
    function cDate() { const now = new Date(); now.setDate(now.getDate() + 30); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; }
    $('teacherTaskList').addEventListener('click', async event => {
        const action = event.target.dataset.taskAction;
        if (!action) return;
        try { await api(`/api/campus/activity-campaigns/teacher-tasks/${event.target.closest('[data-task]').dataset.task}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action})}); message('審核已更新'); await loadTeacherTasks(); }
        catch (error) { message(error.message); }
    });
    init().catch(error => { message(error.message); $('activityList').textContent = ''; });
})();
