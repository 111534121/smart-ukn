// 智慧重補修推薦：沒過的科目 → 本學期其他班開的同名課 → 標出衝堂、推薦不衝堂的班別。
// 通知連結 /?retake=課程代碼#retake 會開到這個分頁並捲到那門課。
// 依賴 campus-shell.js (api、tabLoaders、loginPrompt) 與 index.html (currentUser、escapeHtml)。

const RT_TONE = {
    all_conflict: { badge: 'bg-rose-100 text-rose-800 border-rose-200', card: 'border-rose-200' },
    available: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', card: 'border-emerald-200' },
    not_offered: { badge: 'bg-amber-100 text-amber-800 border-amber-200', card: 'border-amber-200' },
    arranged: { badge: 'bg-slate-100 text-slate-700 border-slate-200', card: 'border-slate-200' },
};

// 【功能：重補修推薦】畫面：呼叫 /api/student/retake-recommendations，依狀態顯示可選班別與衝堂原因
async function loadRetake() {
    const body = document.getElementById('retakeBody');
    if (!['學生', '家長'].includes(currentUser.role)) {
        body.innerHTML = currentUser.role === '訪客'
            ? loginPrompt('重補修推薦需要登入學生帳號，才能比對你的成績與課表。')
            : '<div class="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded border border-slate-200">重補修推薦僅限學生本人與家長查看。</div>';
        return;
    }
    let data;
    try { data = await api('/api/student/retake-recommendations'); } catch (e) {
        body.innerHTML = `<p class="text-sm text-rose-700">${escapeHtml(e.message)}</p>`;
        return;
    }
    if (!data.data.length) {
        body.innerHTML = '<div class="p-6 text-center text-sm text-emerald-800 bg-emerald-50 rounded border border-emerald-200">目前沒有需要重補修的科目，繼續保持！</div>';
        return;
    }
    const s = data.summary;
    const chip = (status, label) => s[status] ? `<span class="rounded border px-2.5 py-1 ${RT_TONE[status].badge}">${label} ${s[status]} 科</span>` : '';
    body.innerHTML = `
        <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="text-slate-600">${escapeHtml(data.semester)} 學期 · ${escapeHtml(data.student.class_name || '')}，共 ${data.data.length} 科需要重補修：</span>
            ${chip('all_conflict', '全部衝堂')}${chip('available', '有班別可選')}${chip('not_offered', '本學期未開課')}${chip('arranged', '已在課表')}
        </div>
        <div class="space-y-4">${data.data.map(rtCourseCard).join('')}</div>
        <p class="text-[11px] text-slate-400">比對方式：同一天、節次有重疊就算衝堂。你的課表包含本班的課與個人加選的課；實際能否加選仍依課務組與選課系統規定。</p>`;
    rtFocusFromLink();
}

function rtCourseCard(c) {
    const tone = RT_TONE[c.status];
    const meta = [c.credits != null ? `${c.credits} 學分` : '', c.course_type, c.is_required ? '必修' : '選修',
                  `${c.failed_semester} 學期${c.score != null ? ` ${c.score} 分` : ''}未通過`].filter(Boolean).join(' · ');
    return `
        <article id="retake-${escapeHtml(c.course_id)}" class="rounded border-2 ${tone.card} p-4 space-y-3 transition-shadow">
            <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                    <h3 class="font-bold text-slate-900">${escapeHtml(c.course_name)} <span class="text-xs font-normal text-slate-400">${escapeHtml(c.course_id)}</span></h3>
                    <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(meta)}</div>
                </div>
                <span class="shrink-0 text-xs font-bold rounded border px-2.5 py-1 ${tone.badge}">${escapeHtml(c.status_label)}</span>
            </div>
            ${rtPrereqCheck(c.prereq)}
            <p class="text-sm text-slate-700">${escapeHtml(c.message)}</p>
            ${c.blocks.length ? `<p class="text-xs text-rose-700">這科沒過會擋修：${c.blocks.map(escapeHtml).join('、')}</p>` : ''}
            ${c.sections.length ? `<details class="rt-sections rounded border border-slate-200">
                <summary class="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-ukn-800 hover:bg-slate-50">查看 ${c.sections.length} 個可選班別與衝堂比對</summary>
                <div class="overflow-x-auto px-3 pb-2"><table class="w-full text-sm">
                <thead><tr class="text-left text-[11px] text-slate-500 border-b border-slate-100">
                    <th class="py-1.5 pr-3 font-semibold">班別</th><th class="py-1.5 pr-3 font-semibold">上課時間</th>
                    <th class="py-1.5 pr-3 font-semibold">老師 / 教室</th><th class="py-1.5 font-semibold">跟你的課表</th></tr></thead>
                <tbody>${c.sections.map(rtSectionRow).join('')}</tbody></table></div></details>` : ''}
        </article>`;
}

// 重補修不直接跳出結果：每一科先顯示擋修檢查，有擋修就提醒，沒有才看班別
function rtPrereqCheck(p) {
    if (!p || !p.has_prerequisite) {
        return '<p class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">✓ 擋修檢查：這門課沒有先修限制</p>';
    }
    if (p.blocked) {
        return `<p class="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 rounded px-2.5 py-1.5">⚠️ 擋修檢查：要先修過「${escapeHtml(p.course_name)}」，你還沒通過，目前不能加選</p>`;
    }
    return `<p class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">✓ 擋修檢查：先修「${escapeHtml(p.course_name)}」已通過，沒有擋修</p>`;
}

function rtSectionRow(sec) {
    const result = sec.ok
        ? `<span class="text-emerald-700 font-semibold">不衝堂</span>${sec.extra_days ? `<span class="block text-[11px] text-slate-500">要多到校 ${sec.extra_days} 天</span>` : '<span class="block text-[11px] text-slate-500">那天本來就有課</span>'}${(sec.uses_free_time || []).length ? `<span class="block text-[11px] text-sky-700">用自習/班會時段上課：${sec.uses_free_time.map(escapeHtml).join('、')}</span>` : ''}`
        : `<span class="text-rose-700 font-semibold">衝堂</span>${sec.conflicts.map(x => `<span class="block text-[11px] text-rose-700">${escapeHtml(x.at)} 撞到「${escapeHtml(x.course_name)}」</span>`).join('')}`;
    return `
        <tr class="border-b border-slate-50 align-top ${sec.recommended ? 'bg-emerald-50/60' : ''}">
            <td class="py-2 pr-3 whitespace-nowrap font-semibold text-slate-800">${escapeHtml(sec.class_name)}${sec.recommended ? ' <span class="ml-1 text-[11px] font-bold text-white bg-emerald-600 rounded px-1.5 py-0.5">推薦</span>' : ''}</td>
            <td class="py-2 pr-3 whitespace-nowrap">${sec.meetings.map(m => `<span class="block">${escapeHtml(m.slot)}</span>`).join('')}</td>
            <td class="py-2 pr-3 text-xs text-slate-600">${escapeHtml(sec.teacher)}<span class="block text-slate-400">${escapeHtml(sec.classroom)}</span></td>
            <td class="py-2">${result}</td>
        </tr>`;
}

// 從通知點進來 (?retake=課程代碼)：捲到那門課並短暫標示
function rtFocusFromLink() {
    const courseId = new URLSearchParams(location.search).get('retake');
    if (!courseId) return;
    const card = document.getElementById(`retake-${courseId}`);
    if (!card) return;
    const details = card.querySelector('details.rt-sections');
    if (details) details.open = true;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('ring-4', 'ring-ukn-300');
    setTimeout(() => card.classList.remove('ring-4', 'ring-ukn-300'), 3000);
}

// 【功能：重補修推薦】通知中心：登入後抓一次推薦結果，把需要處理的科目交給 index.html 的 buildNotifications
async function loadRetakeNotifications() {
    if (typeof notifSources === 'undefined' || !['學生', '家長'].includes(currentUser?.role)) return;
    try {
        notifSources.retake = (await api('/api/student/retake-recommendations')).notifications || [];
        if (typeof renderNotifications === 'function') renderNotifications();
    } catch (e) { /* 查不到成績或離線時就不顯示 */ }
}
setTimeout(loadRetakeNotifications, 2500);

tabLoaders['tab-retake'] = loadRetake;
