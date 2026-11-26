'use strict';
(() => {
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const displayTitle = value => String(value ?? '').replace(/^【示範資料】\s*/, '');
async function call(url, options) { const r = await fetch(url, options); const data = await r.json(); if (!r.ok || data.status !== 'success') throw Error(data.message || '操作失敗'); return data; }
function show(msg, bad=false) { $('message').textContent = msg; $('message').className = bad ? 'error' : ''; }
function card(r, status=false) { return `<article class="entry"><span class="tag">${esc(r.kind)}</span> <strong>${esc(displayTitle(r.contest_name))}</strong><div>${esc(r.award)}</div><div class="muted">得獎日期：${esc(r.award_date)} · 最後更新：${esc((r.updated_at || '').slice(0,10))}${status ? ' · '+esc(r.status) : ''}</div>${r.description ? `<p>${esc(r.description)}</p>` : ''}</article>`; }
async function publicLoad() { const year = $('year').value; const data = await call('/api/campus/achievements'+(year ? `?year=${encodeURIComponent(year)}` : '')); $('year').innerHTML = '<option value="">全部年度</option>'+data.years.map(y => `<option value="${esc(y)}">${esc(y)} 年</option>`).join(''); $('year').value=year; $('publicList').innerHTML=data.data.length ? data.data.map(r=>card(r)).join('') : '<p class="muted">目前尚無已發布成果。</p>'; }
async function privateLoad(role) {
    if (role === '科助') {
        const data = await call('/api/campus/achievements/review');
        const pending = data.data.filter(r => r.status === '待審核');
        const published = data.data.filter(r => r.status === '已發布').sort((a,b) => b.award_date.localeCompare(a.award_date));
        $('reviewList').innerHTML = pending.length ? pending.map(r => `<article class="entry">${card(r,true)}<a href="/api/campus/achievements/${r.id}/file">下載佐證資料</a><label>審核備註<input id="note-${r.id}" maxlength="1000"></label><div class="actions"><button data-id="${r.id}" data-action="發布">確認發布</button><button class="danger" data-id="${r.id}" data-action="退回">退回</button></div></article>`).join('') : '<p class="muted">目前沒有待審核成果。</p>';
        $('reminders').innerHTML = data.reminders.length ? data.reminders.map(r => `<p class="notice">${esc(r.kind)}：${r.last_updated ? '最後更新 '+esc(r.last_updated)+'，已超過 180 天' : '尚無已發布紀錄'}，請確認是否有新成果。</p>`).join('') : '<p class="muted">所有分類都有近期更新。</p>';
        $('publishedManage').innerHTML = published.length ? published.map(r => `<form class="entry manage" data-id="${r.id}"><label>名稱<input name="contest_name" maxlength="120" required value="${esc(r.contest_name)}"></label><label>獎項<input name="award" maxlength="120" required value="${esc(r.award)}"></label><label>得獎日期<input name="award_date" type="date" required value="${esc(r.award_date)}"></label><label>說明<textarea name="description" maxlength="2000">${esc(r.description)}</textarea></label><div class="muted">最後更新：${esc(r.updated_at.slice(0,10))}</div><button>儲存更新</button></form>`).join('') : '<p class="muted">目前沒有已發布成果。</p>';
    } else if (['學生','老師'].includes(role)) {
        const data = await call('/api/campus/achievements/mine');
        $('mineList').innerHTML = data.data.length ? data.data.slice().reverse().map(r => card(r,true)).join('') : '<p class="muted">尚無投稿。</p>';
    }
}
let role='';
async function refresh() { try { await publicLoad(); if(role) await privateLoad(role); } catch(e) { show(e.message,true); } }
$('year').addEventListener('change',refresh);
$('submitForm').addEventListener('submit',async e=>{e.preventDefault();try { await call('/api/campus/achievements',{method:'POST',body:new FormData(e.currentTarget)}); e.currentTarget.reset(); show('投稿已送出，等待科助審核。'); await refresh(); } catch(error) { show(error.message,true); }});
$('reviewList').addEventListener('click',async e=>{const b=e.target.closest('button[data-id]');if(!b)return;try { await call(`/api/campus/achievements/${b.dataset.id}/review`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:b.dataset.action,note:$(`note-${b.dataset.id}`).value})}); show('審核結果已儲存。'); await refresh(); window.refreshAchievementPreview?.(); } catch(error) { show(error.message,true); }});
$('publishedManage').addEventListener('submit', async e => { e.preventDefault(); const form=e.target; try { await call(`/api/campus/achievements/${form.dataset.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))}); show('成果已更新。'); await refresh(); window.refreshAchievementPreview?.(); } catch(error) { show(error.message,true); } });
(async()=>{try{const me=await call('/api/auth/me');if(me.is_authenticated){role=me.user.role;$('submitPanel').hidden=!['學生','老師'].includes(role);$('reviewPanel').hidden=role!=='科助';}await refresh();}catch(e){show(e.message,true);}})();
})();
