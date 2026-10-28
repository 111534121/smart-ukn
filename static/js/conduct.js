// 我的操行：學生 / 家長看每學期操行成績與計算明細；導師填導師評分、生輔組 (教職員/管理員) 登錄獎懲。
// 依賴 campus-shell.js (api、tabLoaders、toast、loginPrompt、isStaff) 與 index.html (currentUser、escapeHtml)。

let cdData = null;          // 目前顯示的學生操行資料 (/api/conduct/...)
let cdSemester = null;      // 目前選的學期
let cdStudentId = null;     // 老師 / 教職員查詢中的學號

const CD_GRADE_TONE = { '優': 'bg-emerald-600', '甲': 'bg-ukn-700', '乙': 'bg-amber-500', '丙': 'bg-orange-600', '丁': 'bg-rose-700' };
const cdSigned = n => (n > 0 ? `+${n}` : `${n}`);

async function loadConduct() {
    const body = document.getElementById('conductBody');
    if (currentUser.role === '訪客') { body.innerHTML = loginPrompt('操行成績需要登入學生帳號才看得到。'); return; }
    if (['學生', '家長'].includes(currentUser.role)) {
        try { cdData = await api('/api/conduct/me'); } catch (e) { body.innerHTML = `<p class="text-sm text-rose-700">${escapeHtml(e.message)}</p>`; return; }
        cdSemester = cdData.current_semester;
        body.innerHTML = '<div id="cdReport"></div>';
        cdRender();
        return;
    }
    // 老師、教職員、管理員：先選學生
    let students = [];
    try { students = (await api('/api/conduct/students')).data; } catch (e) { body.innerHTML = `<p class="text-sm text-rose-700">${escapeHtml(e.message)}</p>`; return; }
    body.innerHTML = `
        <label class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span class="font-semibold text-slate-700">查看學生</span>
            <select id="cdStudentPick" class="border border-slate-300 rounded px-2 py-1.5 bg-white min-w-[14rem]">
                <option value="">${currentUser.role === '老師' ? '選擇導師班學生…' : '選擇學生…'}</option>
                ${students.map(s => `<option value="${escapeHtml(s.student_id)}">${escapeHtml(s.student_id)} ${escapeHtml(s.full_name)}</option>`).join('')}
            </select>
        </label>
        <div id="cdReport" class="mt-5"></div>`;
    document.getElementById('cdStudentPick').addEventListener('change', e => e.target.value && cdLoadStudent(e.target.value));
}

async function cdLoadStudent(studentId) {
    cdStudentId = studentId;
    try {
        cdData = await api(`/api/conduct/students/${encodeURIComponent(studentId)}`);
        cdSemester = cdSemester && cdData.data.some(s => s.semester === cdSemester) ? cdSemester : cdData.current_semester;
        cdRender();
    } catch (e) { toast(e.message, 'error'); }
}

function cdSelect(semester) { cdSemester = semester; cdRender(); }

function cdRender() {
    const box = document.getElementById('cdReport');
    const sem = cdData.data.find(s => s.semester === cdSemester) || cdData.data[0];
    if (!sem) { box.innerHTML = '<p class="text-sm text-slate-500">尚無操行資料。</p>'; return; }
    const r = cdData.rules;
    const total = sem.breakdown;
    box.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside class="space-y-2">
                <h3 class="text-xs font-bold text-slate-600">${escapeHtml(cdData.student.full_name || '')} 的各學期操行</h3>
                <ul class="space-y-1.5">
                    ${cdData.data.map(s => `
                        <li><button type="button" onclick="cdSelect('${escapeHtml(s.semester)}')" class="w-full text-left rounded border px-3 py-2 transition ${s.semester === sem.semester ? 'border-ukn-500 bg-ukn-50' : 'border-slate-200 hover:border-ukn-300'}">
                            <span class="flex items-center justify-between gap-2">
                                <span class="text-sm font-semibold text-slate-900">${escapeHtml(s.semester)} 學期</span>
                                <span class="text-sm font-bold tabular-nums">${s.score}</span>
                            </span>
                            <span class="block mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><span class="block h-full ${CD_GRADE_TONE[s.grade]}" style="width:${s.score}%"></span></span>
                            <span class="block text-[11px] text-slate-500 mt-0.5">${s.is_current ? '本學期 · 暫定' : '已定案'} · ${escapeHtml(s.grade)}等</span>
                        </button></li>`).join('')}
                </ul>
            </aside>
            <div class="lg:col-span-3 space-y-5">
                <div class="flex flex-wrap items-center gap-4 rounded border border-slate-200 p-4">
                    <div class="w-20 h-20 rounded-full ${CD_GRADE_TONE[sem.grade]} text-white flex flex-col items-center justify-center shrink-0">
                        <span class="text-2xl font-bold leading-none tabular-nums">${sem.score}</span>
                        <span class="text-[11px] mt-1">${escapeHtml(sem.grade)}等</span>
                    </div>
                    <div class="space-y-1 min-w-0">
                        <div class="font-bold text-slate-900">${escapeHtml(sem.semester)} 學期操行成績 ${sem.is_current ? '<span class="text-xs font-normal text-amber-700">（暫定，期末定案）</span>' : ''}</div>
                        <div class="text-xs ${sem.passed ? 'text-emerald-700' : 'text-rose-700 font-semibold'}">${sem.passed ? `已達及格標準 ${r.pass_score} 分` : `低於及格標準 ${r.pass_score} 分，請盡快與導師、生輔組聯繫`}</div>
                        ${sem.evaluation?.comment ? `<div class="text-xs text-slate-600">導師評語：「${escapeHtml(sem.evaluation.comment)}」${sem.evaluation.evaluated_by ? ` — ${escapeHtml(sem.evaluation.evaluated_by)}` : ''}</div>` : ''}
                    </div>
                </div>

                <div class="space-y-2">
                    <h3 class="text-xs font-bold text-slate-600">分數怎麼算出來的</h3>
                    <div class="flex flex-wrap items-stretch gap-2 text-sm">
                        ${total.map((b, i) => `
                            ${i > 0 ? '<span class="self-center text-slate-400">+</span>' : ''}
                            <div class="rounded border px-3 py-2 text-center min-w-[5.5rem] ${b.points < 0 ? 'border-rose-200 bg-rose-50' : b.points > 0 && i > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}">
                                <div class="text-[11px] text-slate-500">${escapeHtml(b.label)}</div>
                                <div class="font-bold tabular-nums ${b.points < 0 ? 'text-rose-700' : 'text-slate-900'}">${i === 0 ? b.points : cdSigned(b.points)}</div>
                                ${b.pending ? '<div class="text-[10px] text-amber-700">導師尚未評分</div>' : ''}
                            </div>`).join('')}
                        <span class="self-center text-slate-400">=</span>
                        <div class="rounded border-2 border-ukn-600 px-3 py-2 text-center min-w-[5.5rem]">
                            <div class="text-[11px] text-slate-500">操行成績</div>
                            <div class="font-bold text-ukn-800 tabular-nums">${sem.score}</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="rounded border border-slate-200 p-4 space-y-2">
                        <h3 class="text-xs font-bold text-slate-600">獎懲紀錄</h3>
                        <div class="flex flex-wrap gap-1.5 text-[11px]">
                            ${Object.entries(sem.merit_summary).map(([t, n]) => `<span class="rounded px-2 py-0.5 border ${n ? (r.merit_points[t] > 0 ? 'border-emerald-300 text-emerald-800 bg-emerald-50' : 'border-rose-300 text-rose-800 bg-rose-50') : 'border-slate-200 text-slate-400'}">${t} ${n}</span>`).join('')}
                        </div>
                        <ul class="divide-y divide-slate-100 text-sm">
                            ${sem.merits.length ? sem.merits.map(m => `
                                <li class="py-2 flex items-start justify-between gap-2">
                                    <div class="min-w-0">
                                        <div><span class="text-xs font-bold ${m.points > 0 ? 'text-emerald-700' : 'text-rose-700'}">${escapeHtml(m.type)} ${m.count} 次</span> <span class="text-[11px] text-slate-400">${escapeHtml(m.record_date)}</span></div>
                                        <div class="text-xs text-slate-600">${escapeHtml(m.reason)}</div>
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        <span class="text-xs font-bold tabular-nums ${m.points > 0 ? 'text-emerald-700' : 'text-rose-700'}">${cdSigned(m.points)}</span>
                                        ${cdData.can_record ? `<button type="button" onclick="cdDeleteRecord(${Number(m.id)})" class="text-[11px] text-slate-400 hover:text-rose-700" aria-label="刪除這筆獎懲">刪除</button>` : ''}
                                    </div>
                                </li>`).join('') : '<li class="py-2 text-xs text-slate-400">這學期沒有獎懲紀錄。</li>'}
                        </ul>
                    </div>
                    <div class="rounded border border-slate-200 p-4 space-y-2">
                        <h3 class="text-xs font-bold text-slate-600">缺曠扣分</h3>
                        <div class="text-[11px] text-slate-500">曠課每節 −${r.attendance_deduct['曠課']}、遲到每次 −${r.attendance_deduct['遲到']}；請假核准的不扣分。</div>
                        <ul class="divide-y divide-slate-100 text-sm">
                            ${sem.attendance.items.length ? sem.attendance.items.map(a => `
                                <li class="py-1.5 flex justify-between gap-2 text-xs">
                                    <span><span class="${a.type === '曠課' ? 'text-rose-700 font-semibold' : 'text-amber-700'}">${escapeHtml(a.type)}</span> ${escapeHtml(a.date)} · ${escapeHtml(a.course_name)}</span>
                                    <span class="tabular-nums text-rose-700">${a.points}</span>
                                </li>`).join('') : '<li class="py-2 text-xs text-slate-400">這學期沒有曠課或遲到，很棒！</li>'}
                        </ul>
                    </div>
                </div>

                ${cdTips(sem)}
                ${cdManageForms(sem)}

                <details class="text-xs text-slate-600 rounded border border-slate-200 p-3">
                    <summary class="cursor-pointer font-semibold text-ukn-700">操行成績計算規則</summary>
                    <ul class="list-disc pl-5 mt-2 space-y-1">
                        <li>基本分 ${r.base_score} 分，導師依平時表現加減 −${r.advisor_range} 到 +${r.advisor_range} 分。</li>
                        <li>獎懲：${Object.entries(r.merit_points).map(([t, p]) => `${t} ${cdSigned(p)}`).join('、')}（每次）。</li>
                        <li>缺曠：曠課每節 −${r.attendance_deduct['曠課']}、遲到每次 −${r.attendance_deduct['遲到']}。</li>
                        <li>等第：${r.grades.map(g => `${g.label} ${g.min} 分以上`).join('、')}；${r.pass_score} 分以上及格。最高 100 分、最低 0 分。</li>
                        <li>實際規定以本校「學生操行成績評量辦法」為準。</li>
                    </ul>
                </details>
            </div>
        </div>`;
    document.getElementById('cdEvalForm')?.addEventListener('submit', cdSaveEvaluation);
    document.getElementById('cdRecordForm')?.addEventListener('submit', cdAddRecord);
}

function cdTips(sem) {
    if (cdStudentId) return '';
    const tips = [];
    const penalties = sem.merits.filter(m => m.points < 0);
    if (penalties.length) tips.push('有警告或小過時，可以到學務處生輔組 (行政大樓 1 樓，分機 464、412) 詢問「愛校服務銷過」，銷過後不再扣分。');
    if (sem.attendance.counts['曠課'] >= 3) tips.push(`這學期已曠課 ${sem.attendance.counts['曠課']} 節，生病或有事記得在 3 日內線上請假，請過假就不會被扣操行。`);
    if (sem.is_current && sem.breakdown.find(b => b.key === 'advisor').pending) tips.push('導師評分通常在期末給，現在的分數還沒加上這一項。');
    return tips.length ? `<div class="rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">${tips.map(t => `<div>💡 ${escapeHtml(t)}</div>`).join('')}</div>` : '';
}

function cdManageForms(sem) {
    if (!cdData.can_evaluate && !cdData.can_record) return '';
    const ev = sem.evaluation || {};
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${cdData.can_evaluate ? `
            <form id="cdEvalForm" class="rounded border border-ukn-200 bg-ukn-50/40 p-4 space-y-2 text-sm">
                <h3 class="text-xs font-bold text-ukn-900">導師評分（${escapeHtml(sem.semester)} 學期）</h3>
                <label class="block space-y-1"><span class="text-xs text-slate-600">加減分 (−${cdData.rules.advisor_range} ~ +${cdData.rules.advisor_range})</span>
                    <input name="advisor_adjust" type="number" step="0.5" min="-${cdData.rules.advisor_range}" max="${cdData.rules.advisor_range}" value="${ev.advisor_adjust ?? 0}" required class="w-full border border-slate-300 rounded px-2 py-1.5"></label>
                <label class="block space-y-1"><span class="text-xs text-slate-600">評語 (學生看得到)</span>
                    <input name="comment" maxlength="255" value="${escapeHtml(ev.comment || '')}" class="w-full border border-slate-300 rounded px-2 py-1.5"></label>
                <button class="bg-ukn-800 hover:bg-ukn-900 text-white text-xs font-bold rounded px-3 py-1.5">儲存導師評分</button>
            </form>` : ''}
            ${cdData.can_record ? `
            <form id="cdRecordForm" class="rounded border border-slate-200 p-4 space-y-2 text-sm">
                <h3 class="text-xs font-bold text-slate-700">登錄獎懲（生輔組）</h3>
                <div class="grid grid-cols-3 gap-2">
                    <select name="type" class="border border-slate-300 rounded px-2 py-1.5 bg-white">${Object.keys(cdData.rules.merit_points).map(t => `<option>${t}</option>`).join('')}</select>
                    <select name="count" class="border border-slate-300 rounded px-2 py-1.5 bg-white"><option value="1">1 次</option><option value="2">2 次</option><option value="3">3 次</option></select>
                    <input name="record_date" type="date" value="${new Date().toISOString().slice(0, 10)}" class="border border-slate-300 rounded px-2 py-1.5">
                </div>
                <input name="reason" maxlength="200" required placeholder="事由，例如：協助校慶活動場佈" class="w-full border border-slate-300 rounded px-2 py-1.5">
                <button class="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded px-3 py-1.5">登錄</button>
            </form>` : ''}
        </div>`;
}

async function cdSaveEvaluation(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    try {
        cdData = await api(`/api/conduct/evaluations/${encodeURIComponent(cdStudentId)}/${encodeURIComponent(cdSemester)}`, { method: 'PUT', json: f });
        toast(cdData.message);
        cdRender();
    } catch (ex) { toast(ex.message, 'error'); }
}

async function cdAddRecord(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target).entries());
    try {
        cdData = await api('/api/conduct/records', { json: { ...f, student_id: cdStudentId } });
        toast(cdData.message);
        cdRender();
    } catch (ex) { toast(ex.message, 'error'); }
}

async function cdDeleteRecord(id) {
    if (!confirm('確定要刪除這筆獎懲嗎？')) return;
    try {
        cdData = await api(`/api/conduct/records/${id}`, { method: 'DELETE' });
        toast(cdData.message);
        cdRender();
    } catch (ex) { toast(ex.message, 'error'); }
}

tabLoaders['tab-conduct'] = loadConduct;
