/* Homepage discovery only: selecting an audience never changes login permissions. */
const PORTAL_AUDIENCES = [
    {id:'student', name:'在校學生', icon:'01', hint:'上課、申辦與學習進度，快速抵達。', keys:['course-plan','calendar','scholarship','rules','meetings','map','links']},
    {id:'parent', name:'家長', icon:'02', hint:'掌握校園消息與學習資訊；個人資料需登入已綁定的家長帳號。', keys:['calendar','graduation','warning','rules','traffic','map']},
    {id:'staff', name:'教職員', icon:'03', hint:'教學、班級與行政服務；可用功能依實際登入權限提供。', keys:['my-schedule','my-class','notices','meetings','calendar','rent','reports']},
    {id:'freshman', name:'準新生', icon:'04', hint:'從認識科系到規劃到校路線，為下一步做好準備。', keys:['faculty','scholarship','traffic','map'], official:true},
    {id:'visitor', name:'訪客', icon:'05', hint:'認識校園、尋找地點，輕鬆安排來訪。', keys:['map','traffic','calendar','faculty'], official:true}
];
let portalAudience = 'student';
let portalCategory = '全部';
let portalSearchSequence = 0;
const PORTAL_CATEGORIES = ['全部','招生','課務','活動','獎助學金','行政'];
function portalNewsCategory(a) {
    if (PORTAL_CATEGORIES.includes(a.category) && a.category !== '全部') return a.category;
    const text = `${a.title || ''} ${a.office || ''}`;
    if (/獎|助學|補助/.test(text)) return '獎助學金';
    if (/招生|入學|新生|甄選/.test(text)) return '招生';
    if (/課|考試|註冊|學分|教務|畢業/.test(text)) return '課務';
    if (/活動|講座|競賽|校慶|研習|講習|運動會/.test(text)) return '活動';
    return '行政';
}
function filterPortalNews(items) {
    return items.filter(a => portalCategory === '全部' || portalNewsCategory(a) === portalCategory)
        .slice().sort((a,b) => String(b.publish_date).localeCompare(String(a.publish_date)));
}
function renderPortalNewsFilters() {
    const wrap = document.getElementById('portalNewsFilters');
    wrap.hidden = newsTab !== 'ann';
    document.getElementById('portalNewsStatus').textContent = newsTab !== 'ann' ? '' : homeNewsError ? '公告載入失敗' : `${filterPortalNews(homeAnnouncements).length} 則公告 · 分類依公告標題與發布單位整理`;
    wrap.innerHTML = PORTAL_CATEGORIES.map(c => `<button type="button" data-category="${c}" aria-pressed="${c === portalCategory}">${c} <span>${homeAnnouncements.filter(a => c === '全部' || portalNewsCategory(a) === c).length}</span></button>`).join('');
}
function portalFeatureButton(f) {
    return `<button type="button" data-portal-tab="${f.tab}"><span aria-hidden="true">${f.icon}</span><span><strong>${escapeHtml(f.name)}</strong><small>${escapeHtml(f.desc)}</small></span><span aria-hidden="true">↗</span></button>`;
}
function selectPortalAudience(id) {
    const audience = PORTAL_AUDIENCES.find(a => a.id === id) || PORTAL_AUDIENCES[0];
    portalAudience = audience.id;
    document.getElementById('portalAudienceButtons').innerHTML = PORTAL_AUDIENCES.map(a => `<button type="button" data-audience="${a.id}" aria-pressed="${a.id === audience.id}"><span>${a.icon}</span>${a.name}<span aria-hidden="true">↗</span></button>`).join('');
    document.getElementById('portalAudienceName').textContent = `${audience.name}，歡迎來到康寧`;
    document.getElementById('portalAudienceHint').textContent = audience.hint;
    const available = audience.keys.map(featureByKey).filter(Boolean);
    document.getElementById('portalAudienceLinks').innerHTML = available.map(f => `<button type="button" data-portal-tab="${f.tab}">${escapeHtml(f.name)} →</button>`).join('') + (audience.official ? '<a href="https://www.ukn.edu.tw" target="_blank" rel="noopener noreferrer">學校官網與招生資訊 ↗</a>' : '') + (!available.length ? '<a href="/login">登入對應身分帳號 →</a>' : '');
    document.getElementById('portalRecommended').innerHTML = (available.length ? available : FEATURES.slice(0,6)).map(portalFeatureButton).join('');
}
function portalSafeUrl(value) {
    try { const u = new URL(value, location.origin); return ['http:','https:'].includes(u.protocol) ? u.href : null; } catch { return null; }
}
async function searchPortal(event) {
    event?.preventDefault();
    const query = document.getElementById('portalQuery').value.trim();
    if (!query) return;
    document.getElementById('portalQuery').blur?.();
    const sequence = ++portalSearchSequence;
    const results = document.getElementById('portalResults');
    const status = document.getElementById('portalSearchStatus');
    const list = document.getElementById('portalResultList');
    results.hidden = false;
    results.setAttribute('aria-busy','true');
    status.textContent = `正在搜尋「${query}」…`;
    list.innerHTML = '';
    const q = query.toLocaleLowerCase();
    const matches = text => String(text || '').toLocaleLowerCase().includes(q);
    // Fetch on demand; never persist search results or personal announcements in browser storage.
    const responses = await Promise.allSettled([
        api('/api/campus/announcements'), api('/api/links'), api('/api/search',{json:{query}})
    ]);
    if (sequence !== portalSearchSequence) return;
    const blocks = [];
    let count = 0;
    const features = FEATURES.filter(f => matches(`${f.name} ${f.desc} ${f.group}`));
    if (features.length) { count += features.length; blocks.push(`<h3>校園服務</h3><div class="portal-recommended">${features.map(portalFeatureButton).join('')}</div>`); }
    if (responses[0].status === 'fulfilled') {
        const announcements = (responses[0].value.data || []).filter(a => matches(`${a.title} ${a.content} ${a.office}`));
        count += announcements.length;
        if (announcements.length) blocks.push('<h3>校園公告</h3>' + announcements.map(a => `<details><summary>${escapeHtml(a.title)}</summary><small>${escapeHtml(a.publish_date)} · ${escapeHtml(a.office)}</small><p>${escapeHtml(a.content || '')}</p></details>`).join(''));
    }
    if (responses[1].status === 'fulfilled') {
        const links = (responses[1].value.data || []).filter(l => matches(`${l.title} ${l.description}`) && l.url && l.url !== '#' && portalSafeUrl(l.url));
        count += links.length;
        if (links.length) blocks.push('<h3>常用系統與連結</h3>' + links.map(l => `<a class="portal-external-result" href="${escapeHtml(portalSafeUrl(l.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.title)} ↗<small>${escapeHtml(l.description || '')}</small></a>`).join(''));
    }
    if (responses[2].status === 'fulfilled' && responses[2].value.matched) {
        const rule = responses[2].value;
        count++;
        blocks.push(`<h3>校規與申辦說明</h3><details open><summary>${escapeHtml(rule.official_term || rule.subcategory || '相關規章')}</summary><p>${escapeHtml(rule.answer)}</p><small>來源：${escapeHtml(rule.source_doc || '校規資料庫')}${rule.last_updated ? ' · 更新：' + escapeHtml(rule.last_updated) : ''}</small></details>`);
    }
    const failed = responses.map((r,i) => r.status === 'rejected' ? ['公告','系統連結','校規'][i] : null).filter(Boolean);
    status.textContent = `${count ? `找到 ${count} 項相關結果` : '找不到相關結果，試試較短的關鍵字，例如「請假」或「獎學金」。'}${failed.length ? `（${failed.join('、')}暫時無法載入，可重新搜尋。）` : ''}`;
    list.innerHTML = blocks.join('');
    results.setAttribute('aria-busy','false');
}
function initHomePortal() {
    if (typeof initCampusAccess === 'function') initCampusAccess();
    document.getElementById('tab-home').classList.toggle('teacher-home', currentUser.role === '老師');
    // 身分導覽只供公開首頁探索；登入後使用自己的服務入口。
    document.querySelector('.portal-audiences').hidden = isLoggedIn();
    const loginLink = document.querySelector('.portal-login');
    if (isLoggedIn()) loginLink.textContent = '切換登入帳號 ↗';
    selectPortalAudience(currentUser.role === '家長' ? 'parent' : isStaff() ? 'staff' : currentUser.role === '訪客' ? 'visitor' : 'student');
    document.getElementById('portalSearchForm').addEventListener('submit', searchPortal);
    document.getElementById('tab-home').addEventListener('click', event => {
        const btn = event.target.closest('button');
        if (!btn) return;
        if (btn.dataset.audience) {
            selectPortalAudience(btn.dataset.audience);
            document.querySelector(`[data-audience="${portalAudience}"]`)?.focus({preventScroll:true});
        }
        if (btn.dataset.portalTab) switchTab(btn.dataset.portalTab);
        if (btn.dataset.category) {
            portalCategory = btn.dataset.category;
            renderHomeNews();
            document.querySelector(`[data-category="${portalCategory}"]`)?.focus({preventScroll:true});
        }
        if (btn.dataset.query) { document.getElementById('portalQuery').value = btn.dataset.query; searchPortal(); }
    });
    document.getElementById('portalSearchClose').addEventListener('click', () => {
        ++portalSearchSequence;
        document.getElementById('portalResults').hidden = true;
        document.getElementById('portalQuery').focus();
    });
}
