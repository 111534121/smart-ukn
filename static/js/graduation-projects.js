'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let user, teachers = [], stages = [];
  async function api(path, options) {
    const response = await fetch(path, options);
    const result = await response.json();
    if (!response.ok || result.status !== 'success') throw new Error(result.message || '操作失敗');
    return result;
  }
  function json(data, method = 'POST') { return {method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)}; }
  function message(value) { $('message').textContent = value; }
  function stageCard(team, stage) {
    const row = team.submissions.find(s => s.stage === stage);
    const state = row?.status || '尚未上傳';
    const student = user.role === '學生';
    const canUpload = student && team.teacher_username && (!row || row.status === '退回修改') &&
      (stage === '提案' || team.submissions.some(s => s.stage === stages[stages.indexOf(stage)-1] && s.status === '已核准'));
    return `<div class="stage ${state === '待審核' ? 'pending' : ''}"><strong>${esc(stage)}</strong><p>${esc(state)}</p>${row ? `<a href="/api/campus/graduation-projects/submissions/${row.id}/file">下載 ${esc(row.file_name)}</a>` : ''}${row?.review_note ? `<p class="muted">老師意見：${esc(row.review_note)}</p>` : ''}${canUpload ? `<form class="stageForm" data-stage="${esc(stage)}"><label>上傳 PDF（最多 15 MB）<input type="file" name="file" accept=".pdf" required></label><div class="actions"><button>送交審核</button></div></form>` : ''}${user.role === '科助' && state === '待審核' ? `<div class="actions"><button class="secondary" data-action="remind" data-submission="${row.id}">提醒指導老師</button><span class="muted small">送審 ${esc(row.submitted_at)} · ${row.opened_at ? '老師已開啟' : '老師未開啟'}</span></div>` : ''}</div>`;
  }
  function teamCard(team) {
    const isLeader = user.role === '學生' && team.leader_id === user.student_id;
    const pref = team.preferences.map(name => teachers.find(t => t.username === name)?.full_name || name).join(' → ');
    const options = teachers.map(t => `<option value="${esc(t.username)}">${esc(t.full_name)}</option>`).join('');
    return `<article class="card" data-team="${team.id}"><p class="eyebrow">小組 #${team.id}</p><h2>${esc(team.title)}</h2><p>隊員：${team.members.map(m => esc(m.full_name)).join('、')}</p>${user.role === '學生' ? `<p>邀請隊友加入碼：<strong>${esc(team.join_code)}</strong></p>` : ''}<div class="status-panel"><strong>指導老師：${esc(teachers.find(t => t.username === team.teacher_username)?.full_name || (team.teacher_username ? team.teacher_username : '尚未媒合'))}</strong><p>志願序：${esc(pref || '尚未填寫')}</p></div>${isLeader && !team.teacher_username ? `<form class="preferenceForm"><p class="muted small">請依志願順序選擇老師；未選的志願留空。</p><div class="grid"><label>第一志願<select name="first" required><option value="">請選擇</option>${options}</select></label><label>第二志願<select name="second"><option value="">不填</option>${options}</select></label><label>第三志願<select name="third"><option value="">不填</option>${options}</select></label></div><div class="actions"><button>儲存志願序</button></div></form>` : ''}<h3>分階段成果</h3><div class="stage-grid">${stages.map(stage => stageCard(team,stage)).join('')}</div></article>`;
  }
  async function load() {
    const result = await api('/api/campus/graduation-projects');
    teachers = result.teachers; stages = result.stages;
    $('teamList').innerHTML = result.data.length ? result.data.map(teamCard).join('') : '<p class="card muted">目前沒有專題小組。</p>';
    if (user.role === '學生') $('studentTools').hidden = result.data.length > 0;
    if (user.role === '科助' || user.role === '管理員') {
      const teams = result.data;
      const unassigned = teams.filter(t => !t.teacher_username).length;
      const overdue = teams.flatMap(t => t.submissions).filter(s => s.status === '待審核' && Date.now() - new Date(s.submitted_at.replace(' ','T')) >= 7*86400000).length;
      $('assistantStats').innerHTML = `<div class="stat">專題小組<strong>${teams.length}</strong><small>資管科</small></div><div class="stat">尚未媒合<strong>${unassigned}</strong><small>請檢查志願序</small></div><div class="stat">待老師審核<strong>${teams.flatMap(t=>t.submissions).filter(s=>s.status==='待審核').length}</strong><small>提案／期中／期末</small></div><div class="stat">逾 7 天<strong>${overdue}</strong><small>可升級提醒</small></div>`;
    }
  }
  async function loadTeacherTasks() {
    if (user.role !== '老師') return;
    const result = await api('/api/campus/graduation-projects/teacher-tasks');
    $('pendingCount').textContent = result.pending_count;
    $('teacherTasks').innerHTML = result.data.length ? result.data.map(t => `<div class="teacher-task ${t.status === '待審核' ? 'pending' : ''}" data-submission="${t.id}"><strong>${esc(t.team_title)} · ${esc(t.stage)}</strong><p class="muted small">${esc(t.status)} · 送審 ${esc(t.submitted_at)}${t.last_reminder_at ? ` · 最近提醒 ${esc(t.last_reminder_at)}` : ''}</p><a href="/api/campus/graduation-projects/submissions/${t.id}/file">查看 PDF</a>${t.status === '待審核' ? '<div class="actions"><button data-action="approve">核准</button><button class="secondary" data-action="return">退回修改</button></div>' : ''}</div>`).join('') : '<p class="muted">目前沒有待審文件。</p>';
  }
  async function init() {
    const auth = await api('/api/auth/me'); user = auth.user;
    if (!user) throw new Error('請先登入');
    $('role').textContent = user.role;
    if (user.role === '學生') { $('studentTools').hidden = false; $('title').textContent = '我的畢業專題'; $('intro').textContent = '建立小組、邀請隊友、填導師志願並追蹤三階段審核。'; }
    else if (user.role === '科助' || user.role === '管理員') { $('assistantTools').hidden = false; $('title').textContent = '資管科專題管理'; $('intro').textContent = '依志願序媒合導師，掌握文件送審與逾期提醒。'; }
    else if (user.role === '老師') { $('teacherTools').hidden = false; $('title').textContent = '我的指導專題'; $('intro').textContent = '提案、期中與期末文件集中審核。'; }
    await load(); await loadTeacherTasks();
  }
  $('createTeam').addEventListener('submit', async event => { event.preventDefault(); try { const result = await api('/api/campus/graduation-projects', json({title:event.target.elements.namedItem('title').value.trim()})); message(result.message); await load(); } catch(e) { message(e.message); } });
  $('joinTeam').addEventListener('submit', async event => { event.preventDefault(); try { const result = await api('/api/campus/graduation-projects/join', json({join_code:event.target.elements.namedItem('join_code').value.trim()})); message(result.message); await load(); } catch(e) { message(e.message); } });
  $('matchButton').addEventListener('click', async () => { try { const result = await api('/api/campus/graduation-projects/match',{method:'POST'}); message(result.message); await load(); } catch(e) { message(e.message); } });
  $('teamList').addEventListener('submit', async event => {
    const team = event.target.closest('[data-team]'); if (!team) return; event.preventDefault();
    try {
      if (event.target.matches('.preferenceForm')) {
        const form = event.target; const ranking = ['first','second','third'].map(name => form.elements.namedItem(name).value).filter(Boolean);
        const result = await api(`/api/campus/graduation-projects/${team.dataset.team}/preferences`,json({ranking},'PUT'));
        message(result.message);
      } else if (event.target.matches('.stageForm')) {
        const result = await api(`/api/campus/graduation-projects/${team.dataset.team}/submissions/${encodeURIComponent(event.target.dataset.stage)}`,{method:'POST',body:new FormData(event.target)});
        message(result.message);
      }
      await load();
    } catch(e) { message(e.message); }
  });
  $('teamList').addEventListener('click', async event => { const button = event.target.closest('[data-action="remind"]'); if (!button) return; try { const result = await api(`/api/campus/graduation-projects/submissions/${button.dataset.submission}/remind`,{method:'POST'}); message(result.message); await load(); } catch(e) { message(e.message); } });
  $('teacherTasks').addEventListener('click', async event => { const button = event.target.closest('[data-action]'); if (!button) return; const decision = button.dataset.action === 'approve' ? '已核准' : '退回修改'; const note = decision === '退回修改' ? prompt('請填寫修改意見') : ''; if (decision === '退回修改' && note === null) return; try { const result = await api(`/api/campus/graduation-projects/submissions/${button.closest('[data-submission]').dataset.submission}/review`,json({decision,note})); message(result.message); await loadTeacherTasks(); await load(); } catch(e) { message(e.message); } });
  init().catch(e => { message(e.message); $('teamList').textContent = ''; });
})();
