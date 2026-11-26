'use strict';
(() => {
    const box = document.getElementById('achievementPreview');
    if (!box) return;
    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const displayTitle = value => String(value ?? '').replace(/^【示範資料】\s*/, '');
    function load() { return fetch('/api/campus/achievements').then(response => response.json()).then(result => {
        const rows = result.data || [];
        box.innerHTML = rows.length ? rows.slice(0,3).map(row => `<button type="button" onclick="switchTab('tab-achievements')" class="block text-left rounded-lg border border-slate-200 p-3 hover:border-amber-400"><strong class="block text-slate-900">${esc(displayTitle(row.contest_name))}</strong><span>${esc(row.award)}</span><span class="block text-xs mt-1">得獎日期 ${esc(row.award_date)}</span></button>`).join('') : '<p>目前尚無已發布成果。</p>';
    }).catch(() => { box.textContent = '成果暫時無法載入。'; }); }
    window.refreshAchievementPreview = load;
    load();
})();
