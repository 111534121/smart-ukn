// 線上會議：建立會議、邀請個人或整班、邀請碼加入，視訊用 Jitsi Meet；受邀的會議放進通知中心。
// 依賴 campus-shell.js (api、openModal、toast、esc、isLoggedIn、switchTab) 與 index.html 的 notifSources / renderNotifications。

let meetingData = null;
const meetingInvitees = new Map();  // 成員代碼 → 顯示名稱 (建立表單或「邀請更多」用)
let meetingSearchTimer = null;
const MEETING_NOTIF_POLL_MS = 30000;  // 新邀請最慢 30 秒出現在通知中心與會議列表

function meetingTimeText(m) {
    const d = new Date(m.start_at.replace(' ', 'T'));
    const wd = '日一二三四五六'[d.getDay()];
    return `${m.start_at.slice(5, 10).replace('-', '/')} (${wd}) ${m.start_at.slice(11)}–${m.end_at.slice(11)}`;
}

// 【功能：線上會議】畫面：會議列表、開新會議、邀請碼加入，加入視訊時開 Jitsi 會議室
async function loadMeetings() {
    const body = document.getElementById('meetingsBody');
    if (!isLoggedIn()) {
        body.innerHTML = '<div class="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded p-6 text-center"><a href="/login" class="text-ukn-700 font-semibold hover:underline">登入</a>後就能開會議或用邀請碼加入。</div>';
        document.getElementById('meetingNewBtn').classList.add('hidden');
        return;
    }
    try {
        meetingData = await api('/api/campus/meetings');
        document.getElementById('meetingNewBtn').classList.toggle('hidden', !meetingData.can_create);
        renderMeetings();
        updateMeetingNotifications(meetingData);
    } catch (e) { body.innerHTML = `<div class="text-sm text-rose-700">${esc(e.message)}</div>`; }
}

function renderMeetings() {
    const list = meetingData.data;
    const upcoming = list.filter(m => !m.is_past);
    const past = list.filter(m => m.is_past);
    document.getElementById('meetingsBody').innerHTML = `
        <h3 class="text-sm font-bold text-slate-700 mb-2">即將開始與進行中（${upcoming.length}）</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">${upcoming.map(meetingCard).join('') || '<div class="text-sm text-slate-500">目前沒有會議。按「開新會議」，或輸入別人給你的邀請碼。</div>'}</div>
        ${past.length ? `<details class="mt-5"><summary class="text-sm font-bold text-slate-600 cursor-pointer">已結束的會議（${past.length}）</summary>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">${past.map(meetingCard).join('')}</div></details>` : ''}`;
}

function meetingCard(m) {
    const cancelled = m.status === '已取消';
    const badge = cancelled ? statusBadge('已取消', 'gray') : m.is_past ? statusBadge('已結束', 'gray') : m.is_open ? statusBadge('可以進入', 'green') : statusBadge('已排定', 'blue');
    const joinBtn = cancelled || m.is_past ? '' : m.is_open
        ? `<button type="button" onclick="enterMeeting(${m.id})" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded px-3 py-1.5">🎥 加入視訊</button>`
        : '<span class="text-[11px] text-slate-500">開始前 15 分鐘可以進入</span>';
    const hostTools = m.is_host && !cancelled && !m.is_past ? `
        <div class="rounded bg-slate-50 border border-slate-200 p-2 text-xs flex flex-wrap items-center gap-2">
            ${m.allow_code_join ? `<span>邀請碼 <b class="font-mono tracking-widest text-sm text-slate-900">${esc(m.invite_code)}</b></span>
            <button type="button" onclick="copyMeetingInvite(${m.id})" class="text-ukn-700 font-semibold hover:underline">複製邀請訊息</button>` : '<span class="text-slate-500">只限受邀的人參加 (邀請碼已關閉)</span>'}
            <button type="button" onclick="openInviteMore(${m.id})" class="text-ukn-700 font-semibold hover:underline ml-auto">＋ 邀請更多人</button>
        </div>` : '';
    const members = m.is_host && m.members ? `<details class="text-xs"><summary class="cursor-pointer text-slate-600">成員 ${m.member_count} 人 (含你)</summary>
        <div class="flex flex-wrap gap-1 mt-1">${m.members.map(x => `<span class="bg-slate-100 rounded px-1.5 py-0.5">${esc(x.name)}<span class="text-slate-400"> · ${esc(x.source)}</span></span>`).join('') || '<span class="text-slate-400">還沒有其他人</span>'}</div></details>` : '';
    return `
        <article class="rounded border ${m.is_open && !cancelled ? 'border-emerald-300' : 'border-slate-200'} p-4 space-y-2 ${cancelled || m.is_past ? 'opacity-70' : ''}">
            <div class="flex items-start justify-between gap-2">
                <div><h4 class="font-bold text-slate-900">${esc(m.title)}</h4>
                    <div class="text-xs text-slate-500">🕒 ${esc(meetingTimeText(m))} · ${m.duration_min} 分鐘</div>
                    <div class="text-xs text-slate-500">${m.is_host ? '你是主持人' : `主持人：${esc(m.host_name)}（${esc(m.host_role)}）· ${esc(m.joined_by === '邀請碼' ? '用邀請碼加入' : `${m.invited_by} 邀請你`)}`}</div></div>
                ${badge}
            </div>
            ${m.description ? `<p class="text-xs text-slate-700 whitespace-pre-line">${esc(m.description)}</p>` : ''}
            ${hostTools}
            ${members}
            <div class="flex flex-wrap items-center gap-2 pt-1">
                ${joinBtn}
                ${m.is_host && !cancelled && !m.is_past ? `<button type="button" onclick="cancelMeeting(${m.id})" class="text-xs text-rose-700 hover:underline ml-auto">取消會議</button>` : ''}
                ${!m.is_host && !cancelled && !m.is_past ? `<button type="button" onclick="leaveMeeting(${m.id})" class="text-xs text-slate-500 hover:underline ml-auto">不參加</button>` : ''}
            </div>
        </article>`;
}

function enterMeeting(id) {
    const m = meetingData.data.find(x => x.id === id);
    if (!m || !m.join_url) return;
    const name = encodeURIComponent(JSON.stringify(currentUser.full_name || ''));
    const url = `${m.join_url}#userInfo.displayName=${name}&config.prejoinPageEnabled=true`;
    if (meetingData.jitsi.embed) {
        openModal(`🎥 ${m.title}`, `<iframe src="${esc(url)}" allow="camera; microphone; display-capture; fullscreen; autoplay" class="w-full h-[70vh] rounded border border-slate-200"></iframe>`, true);
    } else {
        window.open(url, '_blank', 'noopener');
        toast('已在新分頁開啟會議室，按「加入會議」就能進去；第一次使用請允許瀏覽器使用攝影機和麥克風');
    }
}

function copyMeetingInvite(id) {
    const m = meetingData.data.find(x => x.id === id);
    const text = `邀請你參加線上會議「${m.title}」\n時間：${meetingTimeText(m)}\n到康寧學生服務系統「線上會議」輸入邀請碼：${m.invite_code}\n${meetingData.share_base || location.origin}/#meetings`;
    navigator.clipboard.writeText(text).then(() => toast('已複製，可以貼到 LINE 或訊息傳給對方'), () => toast(`邀請碼：${m.invite_code}`));
}

// ---------- 建立會議 / 邀請更多 ----------

function inviteeEditorHtml(classes) {
    return `
        <fieldset class="space-y-2"><legend class="text-xs font-semibold text-slate-600 mb-1">邀請誰</legend>
            <div class="relative">
                <input id="meetingPeopleQuery" autocomplete="off" placeholder="輸入姓名或學號找人" oninput="queueMeetingPeopleSearch(this.value)"
                    class="w-full border border-slate-300 rounded px-3 py-2 text-sm">
                <ul id="meetingPeopleResults" class="hidden absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow max-h-56 overflow-y-auto text-sm"></ul>
            </div>
            <div id="meetingInviteeChips" class="flex flex-wrap gap-1"></div>
            ${classes.length ? `<div class="text-xs text-slate-600">或邀請整班 (班上同學都會收到通知)：</div>
                <div class="flex flex-wrap gap-x-4 gap-y-1">${classes.map(c => `<label class="flex items-center gap-1 text-sm"><input type="checkbox" name="meetingClass" value="${esc(c)}"> ${esc(c)}</label>`).join('')}</div>` : ''}
        </fieldset>`;
}

function defaultMeetingStart() {
    const d = new Date(Date.now() + 30 * 60000);
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toggleMeetingForm(show) {
    const box = document.getElementById('meetingForm');
    if (!show) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    meetingInvitees.clear();
    box.classList.remove('hidden');
    box.innerHTML = `
        <form onsubmit="createMeeting(event)" class="rounded border border-ukn-200 bg-ukn-50/30 p-4 space-y-3">
            <div class="flex items-center justify-between"><h3 class="font-bold text-slate-900">開新會議</h3>
                <button type="button" onclick="toggleMeetingForm(false)" class="text-xs text-slate-500 hover:underline">收起</button></div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label class="sm:col-span-3 space-y-1"><span class="block text-xs font-semibold text-slate-600">會議名稱 *</span>
                    <input name="title" required maxlength="80" placeholder="例如：實務專題第 3 次討論" class="w-full border border-slate-300 rounded px-3 py-2 text-sm"></label>
                <label class="space-y-1"><span class="block text-xs font-semibold text-slate-600">開始時間 *</span>
                    <input name="start_at" type="datetime-local" required value="${defaultMeetingStart()}" class="w-full border border-slate-300 rounded px-3 py-2 text-sm"></label>
                <label class="space-y-1"><span class="block text-xs font-semibold text-slate-600">長度</span>
                    <select name="duration_min" class="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white">
                        ${[30, 60, 90, 120, 180].map(n => `<option value="${n}" ${n === 60 ? 'selected' : ''}>${n} 分鐘</option>`).join('')}</select></label>
                <label class="flex items-center gap-2 text-sm sm:pt-6"><input name="allow_code_join" type="checkbox" checked> 拿到邀請碼的人可以加入</label>
                <label class="sm:col-span-3 space-y-1"><span class="block text-xs font-semibold text-slate-600">說明 (選填)</span>
                    <textarea name="description" maxlength="500" rows="2" placeholder="要討論什麼、要先準備什麼" class="w-full border border-slate-300 rounded px-3 py-2 text-sm"></textarea></label>
            </div>
            ${inviteeEditorHtml(meetingData.invitable_classes)}
            <button class="w-full sm:w-auto bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded px-5 py-2 text-sm">建立會議</button>
        </form>`;
}

function queueMeetingPeopleSearch(value) {
    clearTimeout(meetingSearchTimer);
    meetingSearchTimer = setTimeout(async () => {
        const ul = document.getElementById('meetingPeopleResults');
        if (!value.trim()) { ul.classList.add('hidden'); return; }
        try {
            const people = (await api(`/api/campus/meetings/people?q=${encodeURIComponent(value.trim())}`)).data;
            ul.innerHTML = people.map(p => `<li><button type="button" onclick="addMeetingInvitee('${esc(p.key)}', '${esc(p.name)}')" class="w-full text-left px-3 py-1.5 hover:bg-slate-50">${esc(p.name)} <span class="text-xs text-slate-500">${esc(p.desc)}</span></button></li>`).join('')
                || '<li class="px-3 py-1.5 text-xs text-slate-500">找不到這個人</li>';
            ul.classList.remove('hidden');
        } catch (e) { toast(e.message, 'error'); }
    }, 250);
}

function addMeetingInvitee(key, name) {
    meetingInvitees.set(key, name);
    document.getElementById('meetingPeopleResults').classList.add('hidden');
    document.getElementById('meetingPeopleQuery').value = '';
    renderInviteeChips();
}

function renderInviteeChips() {
    document.getElementById('meetingInviteeChips').innerHTML = [...meetingInvitees].map(([k, n]) => `
        <span class="inline-flex items-center gap-1 bg-ukn-50 border border-ukn-200 text-ukn-900 rounded-full px-2 py-0.5 text-xs">${esc(n)}
            <button type="button" onclick="meetingInvitees.delete('${esc(k)}'); renderInviteeChips()" aria-label="移除 ${esc(n)}" class="text-ukn-700">×</button></span>`).join('');
}

function selectedMeetingClasses() {
    return [...document.querySelectorAll('input[name="meetingClass"]:checked')].map(i => i.value);
}

async function createMeeting(event) {
    event.preventDefault();
    const f = new FormData(event.target);
    try {
        const r = await api('/api/campus/meetings', { json: {
            title: f.get('title'), start_at: f.get('start_at'), duration_min: Number(f.get('duration_min')),
            description: f.get('description'), allow_code_join: f.get('allow_code_join') === 'on',
            invitees: [...meetingInvitees.keys()], classes: selectedMeetingClasses() } });
        toggleMeetingForm(false);
        await loadMeetings();
        openModal('會議建立好了', `<div class="space-y-3 text-sm"><p>${esc(r.message)}。受邀的人會在通知中心看到。</p>
            ${f.get('allow_code_join') === 'on' ? `<p>邀請碼：<b class="font-mono text-lg tracking-widest">${esc(r.invite_code)}</b></p>
            <button type="button" onclick="copyMeetingInvite(${r.id})" class="bg-ukn-800 text-white font-bold rounded px-4 py-2">複製邀請訊息</button>` : ''}</div>`);
    } catch (e) { toast(e.message, 'error'); }
}

function openInviteMore(id) {
    meetingInvitees.clear();
    openModal('邀請更多人', `<form onsubmit="inviteMore(event, ${id})" class="space-y-3">${inviteeEditorHtml(meetingData.invitable_classes)}
        <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2">送出邀請</button></form>`);
}

async function inviteMore(event, id) {
    event.preventDefault();
    try {
        const r = await api(`/api/campus/meetings/${id}/invite`, { json: { invitees: [...meetingInvitees.keys()], classes: selectedMeetingClasses() } });
        closeModal();
        toast(r.message);
        loadMeetings();
    } catch (e) { toast(e.message, 'error'); }
}

async function joinMeetingByCode(event) {
    event.preventDefault();
    if (!isLoggedIn()) { location.href = '/login'; return; }
    const input = document.getElementById('meetingCode');
    try {
        const r = await api('/api/campus/meetings/join', { json: { code: input.value } });
        input.value = '';
        toast(r.message);
        loadMeetings();
    } catch (e) { toast(e.message, 'error'); }
}

async function cancelMeeting(id) {
    if (!confirm('確定取消這場會議？成員會看到「已取消」。')) return;
    try { toast((await api(`/api/campus/meetings/${id}/cancel`, { json: {} })).message); loadMeetings(); } catch (e) { toast(e.message, 'error'); }
}

async function leaveMeeting(id) {
    if (!confirm('確定不參加這場會議？之後要參加需要再請主持人邀請或輸入邀請碼。')) return;
    try { toast((await api(`/api/campus/meetings/${id}/leave`, { json: {} })).message); loadMeetings(); } catch (e) { toast(e.message, 'error'); }
}

// ---------- 通知中心：別人邀請我的會議 ----------

// 【功能：線上會議】把受邀的會議交給通知中心 (index.html 的 buildNotifications)
function updateMeetingNotifications(data) {
    if (typeof notifSources === 'undefined') return;
    notifSources.meetings = data;
    if (typeof renderNotifications === 'function') renderNotifications();
}

async function pollMeetingNotifications() {
    if (!isLoggedIn()) return;
    // 正在看會議分頁時連列表一起更新 (別人剛邀請你、剛取消會議，不用重新整理就看得到)
    const onMeetingsTab = !document.getElementById('tab-meetings')?.classList.contains('hidden');
    if (onMeetingsTab && !document.getElementById('meetingForm')?.innerHTML) return loadMeetings();
    try { updateMeetingNotifications(await api('/api/campus/meetings')); } catch (e) { /* 離線時下次再試 */ }
}

// 首頁載入、登入資訊取得後先抓一次，之後每 2 分鐘更新
setTimeout(pollMeetingNotifications, 2500);
setInterval(pollMeetingNotifications, MEETING_NOTIF_POLL_MS);

tabLoaders['tab-meetings'] = loadMeetings;
