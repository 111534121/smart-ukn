'use strict';
let lobbyInitialized = false, lobbyInFlight = null, lobbyGeneration = 0;
const lobbyEl = id => document.getElementById(id);
const lobbyEscape = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function initStudentLobby() {
    const active = currentUser.role === '學生';
    lobbyEl('tab-home').classList.toggle('student-lobby-home',active);
    lobbyEl('studentLobby').hidden = !active;
    if (!active) { lobbyGeneration++; return; }
    lobbyEl('lobbyGreeting').textContent = `${currentUser.full_name || '同學'}，歡迎回來。`;
    if (lobbyInitialized) return;
    lobbyInitialized = true;
    lobbyEl('lobbyServiceButtons').innerHTML = [['請假申請','請假','01'],['成績單申請','成績單','02'],['場地借用','場地借用','03'],['設備報修申請','設備報修','04']].map(([kind,name,number])=>`<button type="button" data-lobby-service="${kind}"><small>${number} / 線上申請</small><strong>${name}</strong><span aria-hidden="true">↗</span></button>`).join('');
    lobbyEl('lobbyRefresh').addEventListener('click',()=>refreshStudentLobby());
    lobbyEl('lobbySearch').addEventListener('click',()=>{lobbyEl('tab-home').classList.add('lobby-search-open');document.querySelector('.portal-welcome').scrollIntoView({behavior:'smooth',block:'start'});lobbyEl('portalQuery').focus({preventScroll:true});});
    lobbyEl('studentLobby').addEventListener('click',async event=>{
        const button=event.target.closest('button');if (!button) return;
        try {
            if (button.dataset.lobbyService) await window.openStudentService(button.dataset.lobbyService);
            if (button.dataset.lobbyCase) await window.openStudentCase(button.dataset.lobbyCase);
            if (button.dataset.lobbyTab) switchTab(button.dataset.lobbyTab);
            if (button.dataset.lobbyRoom) { switchTab('tab-map');lobbyEl('mapSearch').value=button.dataset.lobbyRoom;await findOnMap(button.dataset.lobbyRoom); }
            if (button.dataset.lobbyAssignments) { lobbyEl('tab-home').classList.add('lobby-learning-open');lobbyEl('dashAssignmentCard').scrollIntoView({behavior:'smooth',block:'start'}); }
        } catch(error) { lobbyEl('lobbyUpdated').textContent = '無法開啟服務，請稍後重試。'; }
    });
}
function renderLobbyPersonal(data) {
    const esc=lobbyEscape;
    lobbyEl('lobbyGreeting').textContent=`${data.name}，${data.date} ${data.weekday} · ${data.class_name || '個人服務'}`;
    lobbyEl('lobbyScheduleSource').textContent=data.schedule_source==='memory'?'示範課表':data.schedule_source?'校務資料':'';
    lobbyEl('lobbySchedule').innerHTML=data.errors.schedule ? `<p class="lobby-error">${esc(data.errors.schedule)}，請按更新重試。</p>` : data.schedule.length ? `<ol class="lobby-class-list">${data.schedule.map(c=>`<li class="${c.status==='ongoing'?'is-current':''}"><div class="lobby-time"><strong>${esc(c.start_time)}</strong><span>${esc(c.end_time)}</span></div><div><h3>${esc(c.course_name)}</h3><p>${esc(c.teacher)} · ${c.is_personal?'個人加選／重補修':'班級課程'}</p><button type="button" data-lobby-room="${esc(String(c.classroom || '').match(/[A-Z]\d{3}/)?.[0] || c.classroom)}">${esc(c.classroom || '教室待確認')} · 看地圖 ↗</button><span class="lobby-class-state">${c.status==='done'?'已下課':c.status==='ongoing'?'上課中':'尚未上課'}</span></div></li>`).join('')}</ol>` : '<p class="lobby-empty">今天沒有排課，可查看行事曆安排接下來的行程。</p>';
    lobbyEl('lobbyTodoCount').textContent=`${data.task_count} 項待處理`;
    lobbyEl('lobbyTasks').innerHTML=(data.tasks.length ? `<ul class="lobby-task-list">${data.tasks.slice(0,3).map(t=>`<li><span class="lobby-badge ${t.overdue?'is-overdue':''}">${esc(t.type)}${t.overdue?' · 已逾期':''}</span><h3>${esc(t.title)}</h3><p>${esc(t.detail)}${t.due_date?' · 期限 '+esc(t.due_date):' · 未標示期限'}</p>${t.action==='case'?`<button type="button" data-lobby-case="${Number(t.case_id)}">查看補件與下一步 →</button>`:t.action==='project'?'<a href="/graduation-projects">前往專題處理 →</a>':'<button type="button" data-lobby-assignments="1">查看作業與繳交方式 →</button>'}</li>`).join('')}</ul>` : '<p class="lobby-empty">目前沒有需要你處理的待辦。</p>') + (data.task_count>3?`<p class="lobby-muted">先顯示 3 項優先待辦，其他項目請至申辦或專題頁查看。</p>`:'') + ['cases','projects','assignments'].filter(key=>data.errors[key]).map(key=>`<p class="lobby-error">${esc(data.errors[key])}，清單可能不完整。</p>`).join('');
}
function renderLobbyTransport(transport,personal) {
    const esc=lobbyEscape;
    let rows=[],notice='',mode='暫無資料';
    if (transport.bus_configured) {
        rows=(transport.bus || []).flatMap(s=>s.arrivals.map(a=>({...a,stop:s.stop}))).sort((a,b)=>(a.minutes??9999)-(b.minutes??9999)).slice(0,3);
        mode=rows.length?'TDX 即時資料':'即時資訊暫無資料';
        notice=rows.length?'到站預估可能變動，請以站牌與交通單位資訊為準。':'目前沒有可用到站資訊，請查看官方交通資訊。';
        lobbyEl('lobbyTransportTime').textContent=transport.bus_updated_at?'資料更新：'+transport.bus_updated_at+'（臺灣時間）':'目前無可用的資料更新時間';
    } else if (personal?.demo_transit) {
        rows=personal.demo_transit.arrivals;mode='示範資料 · 非真實班次';notice=personal.demo_transit.notice;
        lobbyEl('lobbyTransportTime').textContent='示範快照讀取於 '+personal.demo_transit.updated_at+'（臺灣時間）';
    } else {
        notice='尚未設定即時公車資料，請使用官方交通查詢。';lobbyEl('lobbyTransportTime').textContent='未連接即時到站資料';
    }
    lobbyEl('lobbyTransportMode').textContent=mode;
    lobbyEl('lobbyTransport').innerHTML=(rows.length?`<ul class="lobby-arrivals">${rows.map(r=>`<li><div><h3>${esc(r.route)}</h3><p>${esc(r.stop)}</p></div><strong>${r.minutes==null?esc(r.status || '暫無預估'):r.minutes===0?'即將到站':`約 ${esc(r.minutes)} 分鐘`}</strong></li>`).join('')}</ul>`:'')+`<p class="lobby-muted">${esc(notice)}</p>`;
}
function refreshStudentLobby() {
    if (currentUser.role!=='學生' || !lobbyInitialized) return Promise.resolve();
    if (lobbyInFlight) return lobbyInFlight;
    const generation=++lobbyGeneration;
    lobbyEl('lobbyUpdated').textContent='正在更新今日資訊…';lobbyEl('lobbyRefresh').disabled=true;
    lobbyInFlight=(async()=>{
        const results=await Promise.allSettled([api('/api/student/lobby'),api('/api/campus/transport')]);
        if (generation!==lobbyGeneration || currentUser.role!=='學生') return;
        const personal=results[0].status==='fulfilled'?results[0].value.data:null;
        if (personal) renderLobbyPersonal(personal);
        else {lobbyEl('lobbySchedule').innerHTML='<p class="lobby-error">今日課表載入失敗，請按更新重試。</p>';lobbyEl('lobbyTasks').innerHTML='<p class="lobby-error">個人待辦載入失敗，請按更新重試。</p>';lobbyEl('lobbyTodoCount').textContent='暫無資料';lobbyEl('lobbyScheduleSource').textContent='';}
        if (results[1].status==='fulfilled') renderLobbyTransport(results[1].value,personal);
        else {lobbyEl('lobbyTransportMode').textContent='載入失敗';lobbyEl('lobbyTransport').innerHTML='<p class="lobby-error">交通資訊暫時無法載入，請按更新重試或查看官方資訊。</p>';lobbyEl('lobbyTransportTime').textContent='未取得最新交通資訊';}
        lobbyEl('lobbyUpdated').textContent=results.some(r=>r.status==='rejected')?'部分資訊未能更新，其餘服務仍可使用。':`已更新 · ${personal?.now || new Date().toLocaleTimeString('zh-TW',{timeZone:'Asia/Taipei'})}（臺灣時間）`;
    })().catch(()=>{lobbyEl('lobbyUpdated').textContent='更新未完成，請稍後重試。';}).finally(()=>{lobbyEl('lobbyRefresh').disabled=false;lobbyInFlight=null;});
    return lobbyInFlight;
}
