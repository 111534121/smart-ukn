// Smart UKN 版面外殼：分組大選單 (參考臺大官網)、分頁切換與網址、首頁輪播 / 常用服務置頂 / 公告 / 天氣、
// 科上通知鈴鐺與手機通知、共用小工具 (api / toast / modal)。
// 依賴 index.html 內的 currentUser、escapeHtml、isStudentLoggedIn。

const FEATURE_GROUPS = ['學習', '校務', '校園生活', '社群'];
const FEATURES = [
    { key: 'course', tab: 'tab-course', name: '修業進度與擋修', icon: '📚', group: '學習', desc: '已修學分、未通過科目與擋修連帶影響' },
    { key: 'course-plan', tab: 'tab-plan', name: '選課檢查', icon: '🧮', group: '學習', desc: '220 學分夠不夠、有沒有撞修' },
    { key: 'graduation', tab: 'tab-graduation', name: '畢業門檻', icon: '🎓', group: '學習', desc: '學分與證照門檻一次看' },
    { key: 'certs', tab: 'tab-certs', name: '證照與競賽成果', icon: '🏅', group: '學習', desc: '上傳證照獎狀，班導確認' },
    { key: 'warning', tab: 'tab-warning', name: '學業預警', icon: '⚠️', group: '學習', desc: '二一預警與個資授權' },
    { key: 'self-review', tab: 'tab-selfreview', name: '學期自評表', icon: '📒', group: '學習', desc: '替這學期打分數，下次登入還在' },
    { key: 'faculty', tab: 'tab-faculty', name: '教師專長查詢', icon: '🧑‍🏫', group: '學習', desc: '找專題指導老師、依領域找專長' },
    { key: 'assistant', tab: 'tab-assistant', name: 'AI 申辦小幫手', icon: '🤖', group: '校務', desc: '一句話問要辦什麼、怎麼辦' },
    { key: 'rules', tab: 'tab-ai', name: 'AI 智慧校規', icon: '💬', group: '校務', desc: '打一個字就有選項、引導式詢問' },
    { key: 'checklist', tab: 'tab-checklist', name: '行政申請流程', icon: '📝', group: '校務', desc: '要準備什麼、去哪裡辦' },
    { key: 'calendar', tab: 'tab-calendar', name: '行事曆', icon: '📅', group: '校務', desc: '假日、申辦期限與我的行程' },
    { key: 'scholarship', tab: 'tab-scholarship', name: '獎助學金檢核', icon: '💰', group: '校務', desc: '勾選看看自己符不符合' },
    { key: 'services', tab: 'tab-services', name: '宿舍與總務申請', icon: '🏢', group: '校務', desc: '床位申請進度、報帳檢查' },
    { key: 'reports', tab: 'tab-reports', name: '報表與文件下載', icon: '📄', group: '校務', desc: '公告、表單、活動資料下載' },
    { key: 'rent', tab: 'tab-rent', name: '教室與櫃子租借', icon: '🔑', group: '校園生活', desc: '線上看空教室、點格子租櫃子' },
    { key: 'map', tab: 'tab-map', name: '校園地圖與老師辦公室', icon: '🗺️', group: '校園生活', desc: '找教室、看老師現在有沒有課' },
    { key: 'traffic', tab: 'tab-traffic', name: '天氣與交通', icon: '🚌', group: '校園生活', desc: '目前天氣、預報與上學路線' },
    { key: 'crowd', tab: 'tab-crowd', name: '人流分析', icon: '👥', group: '校園生活', desc: '避開學餐與電梯尖峰' },
    { key: 'links', tab: 'tab-links', name: '學餐、購書與常用系統', icon: '🔗', group: '校園生活', desc: '直接連到要用的系統' },
    { key: 'notices', tab: 'tab-notices', name: '科上通知', icon: '📣', group: '社群', desc: '老師整班或個別通知' },
    { key: 'forum', tab: 'tab-forum', name: '匿名論壇', icon: '💌', group: '社群', desc: '表白牆，完全匿名' },
    { key: 'pet', tab: 'tab-pet', name: '我的桌寵', icon: '🐱', group: '社群', desc: '答題賺積分幫桌寵換裝' },
];
const HOME_TAB = 'tab-home';
const tabLoaders = {};          // 分頁第一次打開時要執行的載入函式 (campus-features.js 註冊)
const loadedTabs = new Set();

function featureByTab(tab) { return FEATURES.find(f => f.tab === tab); }
function featureByKey(key) { return FEATURES.find(f => f.key === key); }
function isLoggedIn() { return currentUser && currentUser.role && currentUser.role !== '訪客'; }
function isStaff() { return ['老師', '教職員', '管理員'].includes(currentUser.role); }

// ---------- 共用小工具 ----------

async function api(url, options = {}) {
    const opts = { ...options };
    if (opts.json !== undefined) {
        opts.method = opts.method || 'POST';
        opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
        opts.body = JSON.stringify(opts.json);
        delete opts.json;
    }
    const res = await fetch(url, opts);
    let data = {};
    try { data = await res.json(); } catch (e) { /* 非 JSON 回應 */ }
    if (!res.ok || data.status === 'error') {
        const err = new Error(data.message || `連線失敗 (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return data;
}

let toastTimer = null;
function toast(message, tone = 'ok') {
    const el = document.getElementById('uiToast');
    el.textContent = message;
    el.className = `fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] text-white text-sm px-4 py-2.5 rounded shadow-lg max-w-[90vw] ${tone === 'error' ? 'bg-rose-700' : 'bg-slate-900'}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

function openModal(title, html) {
    document.getElementById('uiModalTitle').textContent = title;
    document.getElementById('uiModalBody').innerHTML = html;
    document.getElementById('uiModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('uiModal').classList.add('hidden');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMegaPanel(); } });

function loginPrompt(text) {
    return `<div class="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded border border-slate-200">${text}
        <a href="/login" class="text-ukn-700 font-bold hover:underline ml-1">前往登入 ➔</a></div>`;
}

function mmdd(iso) { return String(iso || '').slice(5, 10).replace('-', '/'); }

async function logoutUser() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) { /* 仍導回首頁 */ }
    location.href = '/';
}

// ---------- 選單與分頁 ----------

function renderNav() {
    const nav = document.getElementById('megaNav');
    nav.innerHTML = `<button type="button" class="mega-btn" data-home onclick="switchTab('${HOME_TAB}')">首頁</button>` +
        FEATURE_GROUPS.map(g => `<button type="button" class="mega-btn" data-group="${g}" aria-haspopup="true" aria-expanded="false"
            onclick="toggleMegaPanel('${g}')" onmouseenter="openMegaPanel('${g}')">${g} ▾</button>`).join('');
    nav.addEventListener('mouseleave', e => {
        if (!document.getElementById('megaPanel').contains(e.relatedTarget)) closeMegaPanel();
    });
    document.getElementById('megaPanel').addEventListener('mouseleave', closeMegaPanel);

    document.getElementById('mobileMenu').innerHTML = `
        <div class="px-4 py-3 space-y-4">
            <button type="button" class="mega-link w-full" onclick="switchTab('${HOME_TAB}')">🏠 首頁</button>
            ${FEATURE_GROUPS.map(g => `
                <div>
                    <div class="text-[11px] font-bold text-accent-500 tracking-wider px-3 mb-1">${g}</div>
                    <div class="grid grid-cols-2 gap-1">
                        ${FEATURES.filter(f => f.group === g).map(f => `<button type="button" class="mega-link text-sm" data-tab="${f.tab}" onclick="switchTab('${f.tab}')">${f.icon} ${escapeHtml(f.name)}</button>`).join('')}
                    </div>
                </div>`).join('')}
        </div>`;

    const cols = [['學習', '校務'], ['校園生活'], ['社群']];
    cols.forEach((groups, i) => {
        document.getElementById(`footerCol${i + 1}`).innerHTML = groups.map(g => `
            <div class="font-bold mb-1">${g}</div>
            ${FEATURES.filter(f => f.group === g).map(f => `<button type="button" onclick="switchTab('${f.tab}')" class="block text-white/75 hover:text-white text-xs py-0.5">${escapeHtml(f.name)}</button>`).join('')}`).join('<div class="h-3"></div>');
    });
}

let megaOpenGroup = null;
function openMegaPanel(group) {
    const panel = document.getElementById('megaPanel');
    megaOpenGroup = group;
    const items = FEATURES.filter(f => f.group === group);
    panel.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-2">
            ${items.map(f => `
                <button type="button" class="mega-link text-left" data-tab="${f.tab}" onclick="switchTab('${f.tab}')">
                    <span class="text-2xl">${f.icon}</span>
                    <span><span class="block font-semibold text-sm">${escapeHtml(f.name)}</span><span class="block text-[11px] text-slate-500">${escapeHtml(f.desc)}</span></span>
                </button>`).join('')}
        </div>`;
    panel.classList.remove('hidden');
    document.querySelectorAll('#megaNav [data-group]').forEach(b => {
        b.classList.toggle('open', b.dataset.group === group);
        b.setAttribute('aria-expanded', b.dataset.group === group ? 'true' : 'false');
    });
    highlightNav(currentTabId);
}

function closeMegaPanel() {
    megaOpenGroup = null;
    document.getElementById('megaPanel').classList.add('hidden');
    document.querySelectorAll('#megaNav [data-group]').forEach(b => { b.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); });
}

function toggleMegaPanel(group) {
    if (megaOpenGroup === group) closeMegaPanel(); else openMegaPanel(group);
}

function toggleMobileMenu(force) {
    const menu = document.getElementById('mobileMenu');
    const open = force !== undefined ? force : menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !open);
    document.getElementById('mobileMenuBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
}

function highlightNav(tabId) {
    const f = featureByTab(tabId);
    document.querySelectorAll('#megaNav [data-group]').forEach(b => b.classList.toggle('active', !!f && b.dataset.group === f.group));
    document.querySelector('#megaNav [data-home]')?.classList.toggle('active', tabId === HOME_TAB);
    document.querySelectorAll('[data-tab]').forEach(el => el.classList.toggle('active', el.dataset.tab === tabId));
}

let currentTabId = HOME_TAB;
function switchTab(tabId, { updateHash = true } = {}) {
    const target = document.getElementById(tabId);
    if (!target) return;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    target.classList.remove('hidden');
    currentTabId = tabId;
    highlightNav(tabId);
    closeMegaPanel();
    toggleMobileMenu(false);
    if (updateHash) {
        const f = featureByTab(tabId);
        history.replaceState(null, '', f ? `#${f.key}` : location.pathname);
    }
    document.title = `${featureByTab(tabId)?.name || '首頁'} - 康寧大學 學生學習與校務服務系統`;
    if (tabLoaders[tabId] && !loadedTabs.has(tabId)) {
        loadedTabs.add(tabId);
        Promise.resolve(tabLoaders[tabId]()).catch(err => console.error(err));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function tabFromHash() {
    const key = decodeURIComponent(location.hash.replace('#', ''));
    return featureByKey(key)?.tab || HOME_TAB;
}
window.addEventListener('hashchange', () => switchTab(tabFromHash(), { updateHash: false }));

// ---------- 首頁：主視覺輪播 ----------

// 校園照片取自 Wikimedia Commons (CC 授權，依授權條款須標示作者與授權；已縮小尺寸)
const HERO_PHOTOS = {
    gate2017: { src: '/img/hero/campus-gate-2017.jpg', credit: 'Solomon203', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/wiki/File:Taipei_Campus,_University_of_Kang_Ning_20170806.jpg' },
    gate2016: { src: '/img/hero/campus-gate-2016.jpg', credit: 'Padai', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/wiki/File:Taipei_Campus,_University_of_Kang_Ning_20160925.jpg' },
    gate2012: { src: '/img/hero/campus-gate-2012.jpg', credit: '玄史生', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', source: 'https://commons.wikimedia.org/wiki/File:Kang-Ning_Junior_College_of_Medical_Care_and_Management_20120929.jpg' },
};

// tint：疊在照片上的半透明色 (左深右淺)，讓白字在照片上也看得清楚；pos：照片裁切位置
const HERO_SLIDES = [
    { tab: 'tab-calendar', kicker: '行事曆', title: '假日、申辦期限、我的行程，一張月曆看完', text: '點開事項就知道要準備什麼，已截止的自動變灰。', tint: '0,51,119', photo: 'gate2017', pos: 'center 40%' },
    { tab: 'tab-plan', kicker: '選課檢查', title: '選課前先檢查：學分夠不夠、會不會撞修', text: '以畢業 220 學分試算，衝堂、重複修習、擋修一次抓出來。', tint: '0,29,68', photo: 'gate2012', pos: 'center 55%' },
    { tab: 'tab-certs', kicker: '證照與競賽', title: '證照獎狀線上上傳，班導確認就算數', text: '還能看看同年級有多少人拿到同一張證照。', tint: '124,45,18', photo: 'gate2016', pos: 'center 55%' },
    { tab: 'tab-map', kicker: '新生專區', title: '找教室、找老師，不再迷路', text: '校園地圖搜尋教室代碼，還看得到老師現在有沒有課。', tint: '6,78,59', photo: 'gate2017', pos: 'right 60%' },
];

function heroBackground(s) {
    const p = HERO_PHOTOS[s.photo];
    return `linear-gradient(90deg, rgba(${s.tint},.88) 0%, rgba(${s.tint},.55) 50%, rgba(${s.tint},.15) 100%), url('${p.src}') ${s.pos} / cover no-repeat, rgb(${s.tint})`;
}
let heroIndex = 0, heroTimer = null;

function renderHero() {
    document.getElementById('heroTrack').innerHTML = HERO_SLIDES.map((s, i) => {
        const p = HERO_PHOTOS[s.photo];
        return `
        <div class="hero-slide" style="background:${heroBackground(s)}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${HERO_SLIDES.length}">
            <div class="hero-credit">照片：<a href="${p.source}" target="_blank" rel="noopener noreferrer">${p.credit} / Wikimedia Commons</a>，<a href="${p.licenseUrl}" target="_blank" rel="noopener noreferrer">${p.license}</a></div>
            <div class="max-w-7xl mx-auto w-full px-6 sm:px-10 pb-12 sm:pb-14 space-y-2">
                <div class="inline-block text-xs font-bold bg-accent-500 px-2 py-0.5 rounded">${s.kicker}</div>
                <h2 class="text-xl sm:text-3xl font-bold leading-snug max-w-2xl">${s.title}</h2>
                <p class="text-sm sm:text-base opacity-90 max-w-2xl">${s.text}</p>
                <button type="button" onclick="switchTab('${s.tab}')" class="mt-2 inline-block border border-white/80 hover:bg-white hover:text-ukn-900 text-sm font-semibold px-4 py-1.5 rounded transition">立即使用 ➔</button>
            </div>
        </div>`;
    }).join('');
    document.getElementById('heroDots').innerHTML = HERO_SLIDES.map((_, i) =>
        `<button type="button" class="hero-dot" aria-label="第 ${i + 1} 張" onclick="heroGo(${i}, true)"></button>`).join('');
    heroGo(0, true);
    const hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', () => clearInterval(heroTimer));
    hero.addEventListener('mouseleave', startHeroTimer);
    startHeroTimer();
}

function startHeroTimer() {
    clearInterval(heroTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroTimer = setInterval(() => heroGo(1), 6000);
}

function heroGo(step, absolute = false) {
    heroIndex = absolute ? step : (heroIndex + step + HERO_SLIDES.length) % HERO_SLIDES.length;
    document.getElementById('heroTrack').style.transform = `translateX(-${heroIndex * 100}%)`;
    document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === heroIndex));
}

// ---------- 首頁：常用服務置頂 ----------

let pinnedKeys = [];
const PIN_STORAGE = 'ukn_pinned_services';

async function loadPinned() {
    if (isLoggedIn()) {
        try {
            pinnedKeys = (await api('/api/campus/prefs')).data.pinned;
        } catch (e) { pinnedKeys = []; }
    } else {
        try { pinnedKeys = JSON.parse(localStorage.getItem(PIN_STORAGE) || 'null') || ['calendar', 'rules', 'course-plan', 'map']; }
        catch (e) { pinnedKeys = ['calendar', 'rules', 'course-plan', 'map']; }
    }
    pinnedKeys = pinnedKeys.filter(k => featureByKey(k));
    renderServices();
}

async function togglePin(key, event) {
    event?.stopPropagation();
    pinnedKeys = pinnedKeys.includes(key) ? pinnedKeys.filter(k => k !== key) : [...pinnedKeys, key];
    renderServices();
    if (isLoggedIn()) {
        try { await api('/api/campus/prefs', { method: 'PUT', json: { pinned: pinnedKeys } }); }
        catch (e) { toast('置頂設定儲存失敗：' + e.message, 'error'); }
    } else {
        try { localStorage.setItem(PIN_STORAGE, JSON.stringify(pinnedKeys)); } catch (e) { /* 無痕模式 */ }
    }
}

function serviceTile(f) {
    const on = pinnedKeys.includes(f.key);
    return `
        <div class="relative">
            <button type="button" class="service-tile w-full h-full" onclick="switchTab('${f.tab}')" title="${escapeHtml(f.desc)}">
                <span class="text-2xl">${f.icon}</span>
                <span class="leading-tight">${escapeHtml(f.name)}</span>
            </button>
            <button type="button" class="service-pin ${on ? 'on' : ''}" onclick="togglePin('${f.key}', event)"
                aria-pressed="${on}" aria-label="${on ? '取消置頂' : '置頂'}：${escapeHtml(f.name)}">${on ? '★' : '☆'}</button>
        </div>`;
}

function renderServices() {
    const pinned = pinnedKeys.map(featureByKey).filter(Boolean);
    document.getElementById('pinnedServices').innerHTML = pinned.length
        ? pinned.map(serviceTile).join('')
        : '<div class="col-span-full text-xs text-slate-500 py-2">還沒有置頂的功能，按「顯示全部服務」後點 ☆ 就能加入。</div>';
    document.getElementById('allServicesWrap').innerHTML = FEATURE_GROUPS.map(g => `
        <div>
            <div class="text-xs font-bold text-slate-600 mb-2">${g}</div>
            <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">${FEATURES.filter(f => f.group === g).map(serviceTile).join('')}</div>
        </div>`).join('');
}

function toggleAllServices() {
    const wrap = document.getElementById('allServicesWrap');
    const show = wrap.classList.contains('hidden');
    wrap.classList.toggle('hidden', !show);
    document.getElementById('toggleServicesBtn').textContent = show ? '收合全部服務 ▴' : '顯示全部服務 ▾';
}

// ---------- 首頁：最新公告 / 科上通知 ----------

let homeAnnouncements = [];
let homeNotices = [];
let newsTab = 'ann';

async function loadHomeNews() {
    try { homeAnnouncements = (await api('/api/campus/announcements')).data; } catch (e) { homeAnnouncements = []; }
    renderHomeNews();
}

function switchNewsTab(tab) {
    newsTab = tab;
    document.getElementById('newsTabAnn').classList.toggle('active', tab === 'ann');
    document.getElementById('newsTabNotice').classList.toggle('active', tab === 'notice');
    renderHomeNews();
}

function newsDateBlock(iso) {
    const d = String(iso || '');
    return `<div class="shrink-0 w-14 text-center border-r border-slate-200 pr-3">
        <div class="text-lg font-bold text-ukn-800 leading-none">${d.slice(8, 10)}</div>
        <div class="text-[10px] text-slate-500 mt-1">${d.slice(0, 7).replace('-', '.')}</div></div>`;
}

function renderHomeNews() {
    const list = document.getElementById('homeNewsList');
    if (newsTab === 'notice') {
        if (currentUser.role !== '學生') {
            list.innerHTML = `<li class="px-6 py-6 text-sm text-slate-500">${isStaff() ? '老師可到「科上通知」發送與查看已讀情形。' : '登入學生帳號後，這裡會顯示老師發給你的通知。'}
                <button type="button" onclick="switchTab('tab-notices')" class="text-ukn-700 font-semibold hover:underline ml-1">前往科上通知 ➔</button></li>`;
            return;
        }
        list.innerHTML = homeNotices.length ? homeNotices.slice(0, 6).map(n => `
            <li><button type="button" onclick="switchTab('tab-notices')" class="w-full text-left flex gap-4 px-5 sm:px-6 py-3.5 hover:bg-slate-50">
                ${newsDateBlock(n.created_at)}
                <div class="min-w-0">
                    <div class="text-sm ${n.is_read ? 'text-slate-600' : 'font-bold text-slate-900'}">${n.is_read ? '' : '<span class="inline-block w-2 h-2 rounded-full bg-accent-500 mr-1.5"></span>'}${n.priority !== '一般' ? `<span class="text-[10px] font-bold text-rose-700 border border-rose-300 rounded px-1 mr-1">${escapeHtml(n.priority)}</span>` : ''}${escapeHtml(n.title)}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(n.class_name)} · ${escapeHtml(n.sender)}</div>
                </div></button></li>`).join('')
            : '<li class="px-6 py-6 text-sm text-slate-500">目前沒有科上通知。</li>';
        return;
    }
    list.innerHTML = homeAnnouncements.length ? homeAnnouncements.slice(0, 7).map(a => `
        <li class="flex gap-4 px-5 sm:px-6 py-3.5">
            ${newsDateBlock(a.publish_date)}
            <details class="min-w-0 flex-1 group">
                <summary class="cursor-pointer list-none">
                    <span class="text-sm font-semibold text-slate-900 group-open:text-ukn-800 hover:text-ukn-700">${escapeHtml(a.title)}</span>
                    <span class="block text-[11px] text-slate-500 mt-0.5">${escapeHtml(a.office)}${a.target_class ? ` · ${escapeHtml(a.target_class)}` : ''}</span>
                </summary>
                <p class="text-xs text-slate-700 mt-2 leading-relaxed">${escapeHtml(a.content || '')}</p>
            </details>
            <div class="shrink-0 self-center">
                ${a.in_my_calendar
                    ? '<span class="text-[11px] text-emerald-700 font-semibold">✓ 已在月曆</span>'
                    : `<button type="button" onclick="addAnnouncementToCalendar(${Number(a.id)})" class="text-[11px] border border-ukn-200 text-ukn-800 hover:bg-ukn-50 rounded px-2 py-1 whitespace-nowrap">＋ 加入月曆</button>`}
            </div>
        </li>`).join('')
        : '<li class="px-6 py-6 text-sm text-slate-500">目前沒有公告。</li>';
}

function addAnnouncementToCalendar(id) {
    const a = homeAnnouncements.find(x => x.id === id);
    if (!a) return;
    if (!isLoggedIn()) {
        openModal('加入月曆', loginPrompt('登入後就能把公告加到自己的月曆。'));
        return;
    }
    const date = a.suggested_date || new Date().toISOString().slice(0, 10);
    openModal('把公告加入我的月曆', `
        <form onsubmit="submitAnnouncementEvent(event, ${id})" class="space-y-3">
            <div><label class="block text-xs font-semibold text-slate-600 mb-1">行程名稱</label>
                <input name="title" required maxlength="80" value="${escapeHtml(a.title)}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">日期</label>
                    <input type="date" name="start_date" required value="${date}" class="w-full border border-slate-300 rounded px-3 py-2"></div>
                <div><label class="block text-xs font-semibold text-slate-600 mb-1">結束日期 (選填)</label>
                    <input type="date" name="end_date" class="w-full border border-slate-300 rounded px-3 py-2"></div>
            </div>
            ${a.suggested_date ? `<p class="text-[11px] text-slate-500">已從公告標題抓到日期 ${mmdd(a.suggested_date)}，可自行修改。</p>` : ''}
            <button class="w-full bg-ukn-800 hover:bg-ukn-900 text-white font-bold rounded py-2">加入月曆</button>
        </form>`);
}

async function submitAnnouncementEvent(event, id) {
    event.preventDefault();
    const f = new FormData(event.target);
    const a = homeAnnouncements.find(x => x.id === id);
    try {
        await api('/api/campus/my-events', { json: {
            title: f.get('title'), start_date: f.get('start_date'), end_date: f.get('end_date') || f.get('start_date'),
            note: a?.content || '', source: `announcement-${id}` } });
        closeModal();
        toast('已加入你的月曆');
        if (a) a.in_my_calendar = true;
        renderHomeNews();
        if (typeof refreshCalendar === 'function') refreshCalendar();
    } catch (e) { toast(e.message, 'error'); }
}

// ---------- 首頁：天氣與近期行事曆 ----------

let weatherCache = null;
async function loadWeatherSummary() {
    const card = document.getElementById('homeWeatherCard');
    try {
        weatherCache = (await api('/api/campus/weather')).data;
        const c = weatherCache.current, today = weatherCache.daily[0];
        card.innerHTML = `
            <div class="flex items-center justify-between text-xs opacity-80"><span>康寧大學 · 目前天氣</span><span>${escapeHtml(weatherCache.updated_at.slice(11))} 更新</span></div>
            <div class="flex items-center gap-4">
                <span class="text-5xl">${c.icon}</span>
                <div><div class="text-4xl font-bold leading-none">${Math.round(c.temp)}°</div><div class="text-sm mt-1">${escapeHtml(c.text)} · 體感 ${Math.round(c.feels_like)}°</div></div>
            </div>
            <div class="text-xs opacity-90">今天 ${Math.round(today.min)}–${Math.round(today.max)}°C · 降雨機率 ${today.rain_prob ?? '-'}%</div>
            <div class="text-xs bg-white/15 rounded px-2 py-1.5">💡 ${escapeHtml(weatherCache.advice)}</div>
            <button type="button" onclick="switchTab('tab-traffic')" class="text-xs underline opacity-90">看預報與交通 ➔</button>`;
        const top = document.getElementById('topbarWeather');
        top.innerHTML = `${c.icon} ${Math.round(c.temp)}°C ${escapeHtml(c.text)}`;
        top.classList.remove('hidden');
        top.classList.add('sm:inline-flex');
    } catch (e) {
        card.innerHTML = `<div class="text-xs opacity-80">康寧大學 · 目前天氣</div><div class="text-sm">天氣資料暫時無法取得</div>`;
    }
}

async function loadHomeUpcoming() {
    const list = document.getElementById('homeUpcomingList');
    const now = new Date();
    try {
        const results = await Promise.all([0, 1].map(k => {
            const d = new Date(now.getFullYear(), now.getMonth() + k, 1);
            return api(withScope(`/api/campus/calendar/month?year=${d.getFullYear()}&month=${d.getMonth() + 1}`));
        }));
        const today = results[0].today;
        const seen = new Set();
        const events = results.flatMap(r => r.events).filter(e => !seen.has(e.key) && seen.add(e.key) && e.end_date >= today)
            .sort((a, b) => a.start_date.localeCompare(b.start_date)).slice(0, 6);
        const holidays = Object.entries({ ...results[0].holidays, ...results[1].holidays })
            .filter(([d, h]) => d >= today && h.is_holiday).sort().slice(0, 1);
        list.innerHTML = events.map(e => `
            <li class="flex items-start gap-2.5">
                <span class="shrink-0 text-[11px] font-bold text-ukn-800 bg-ukn-50 border border-ukn-100 rounded px-1.5 py-0.5 mt-0.5">${mmdd(e.start_date)}${e.end_date !== e.start_date ? `–${mmdd(e.end_date)}` : ''}</span>
                <span class="text-slate-700 leading-snug">${escapeHtml(e.title)}${e.start_date <= today ? '<span class="text-[10px] text-accent-500 font-bold ml-1">進行中</span>' : ''}</span>
            </li>`).join('') + holidays.map(([d, h]) => `
            <li class="flex items-start gap-2.5"><span class="shrink-0 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 mt-0.5">${mmdd(d)}</span>
                <span class="text-rose-700">放假：${escapeHtml(h.name)}</span></li>`).join('') || '<li class="text-slate-400 text-xs">近期沒有行事曆事項。</li>';
    } catch (e) {
        list.innerHTML = '<li class="text-slate-400 text-xs">行事曆載入失敗。</li>';
    }
}

// ---------- 科上通知：鈴鐺、輪詢、手機 / 桌面通知 ----------

const NOTIFY_POLL_MS = 90 * 1000;
async function pollNotices(showSystemNotification = true) {
    if (currentUser.role !== '學生') return;
    try {
        const data = await api('/api/campus/notices/inbox');
        const prevIds = new Set(homeNotices.map(n => n.id));
        const fresh = homeNotices.length ? data.data.filter(n => !prevIds.has(n.id) && !n.is_read) : [];
        homeNotices = data.data;
        const count = data.unread_count;
        ['notifyBellCount', 'newsNoticeCount'].forEach(id => {
            const el = document.getElementById(id);
            el.textContent = count;
            el.classList.toggle('hidden', !count);
        });
        if (newsTab === 'notice') renderHomeNews();
        if (showSystemNotification && fresh.length) {
            toast(`📣 新的科上通知：${fresh[0].title}`);
            showSystemNotice(fresh[0]);
        }
    } catch (e) { /* 網路中斷時下次再試 */ }
}

async function showSystemNotice(n) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const reg = await navigator.serviceWorker?.getRegistration();
    const opts = { body: `${n.class_name} · ${n.sender}\n${n.content.slice(0, 80)}`, icon: '/img/icon-192.png', tag: `notice-${n.id}`, data: { url: '/#notices' } };
    if (reg) reg.showNotification(n.title, opts); else new Notification(n.title, opts);
}

async function enablePushNotifications() {
    if (!('Notification' in window)) { toast('這個瀏覽器不支援通知，建議把網站加到手機主畫面後再試', 'error'); return; }
    const result = await Notification.requestPermission();
    if (result === 'granted') {
        toast('已開啟通知，老師發新通知時會提醒你');
        document.getElementById('enablePushBtn').classList.add('hidden');
    } else {
        toast('通知權限被拒絕，可以到瀏覽器設定重新開啟', 'error');
    }
}

// ---------- 首頁：證照可抵免學分提醒 ----------

async function loadHomeCertReminder() {
    if (currentUser.role !== '學生') return;
    try {
        const items = (await api('/api/campus/certs/exemption-reminder')).data;
        if (!items.length) return;
        document.getElementById('homeCertReminderList').innerHTML = items.map(r =>
            `<li>・<strong>${escapeHtml(r.label)}</strong> → 可抵免「${escapeHtml(r.exempts_course)}」${r.credits} 學分</li>`).join('');
        document.getElementById('homeCertReminderCard').classList.remove('hidden');
    } catch (e) { /* 非必要功能，失敗就不顯示 */ }
}

// ---------- 巨匠電腦合作入口 (示範頁面，合作內容尚未正式確認) ----------

function openJuguangModal() {
    openModal('巨匠電腦（東區分校）證照培訓合作', `
        <div class="space-y-4 text-sm">
            <div class="rounded border border-amber-300 bg-amber-50 text-amber-900 text-xs p-3">
                ⚠️ 示範頁面：此合作目前僅為洽談中的示範欄位，<strong>尚未正式確認</strong>。
                實際課程內容、優惠方案與報名網址，請以巨匠電腦正式公告或東區分校櫃檯說明為準，
                在此頁面看到的只是「有哪些證照可能可以考」的參考方向。
            </div>

            <p class="text-slate-600">如果想加強自傳/履歷上的證照項目，或是想衝前面提到的「學分抵免」門檻，可以參考下面幾個方向：</p>

            <ul class="space-y-2">
                <li class="rounded border border-slate-200 p-3">
                    <div class="font-bold text-slate-900">TOEIC 多益密集班</div>
                    <div class="text-xs text-slate-500 mt-0.5">550 分以上可申請抵免「基礎英文(一)(二)」共 4 學分，也是履歷上很常被看的分數。</div>
                </li>
                <li class="rounded border border-slate-200 p-3">
                    <div class="font-bold text-slate-900">TQC / 程式設計相關證照班</div>
                    <div class="text-xs text-slate-500 mt-0.5">適合想在自傳補一筆「實作能力證明」的同學，建議先確認跟系上課程的重疊程度再報名。</div>
                </li>
                <li class="rounded border border-slate-200 p-3">
                    <div class="font-bold text-slate-900">辦公室軟體 / 數位行銷相關證照班</div>
                    <div class="text-xs text-slate-500 mt-0.5">對求職比較看重行政、行銷類工作的同學可能有幫助。</div>
                </li>
            </ul>

            <p class="text-xs text-slate-400">想自己準備、不報名補習班也沒關係——「證照與競賽成果」分頁一樣可以上傳自己考到的證照，班導確認後就會列入紀錄。</p>

            <div class="flex justify-end gap-2 pt-2">
                <button type="button" onclick="closeModal()" class="px-4 py-2 rounded border border-slate-300 text-sm font-semibold hover:bg-slate-50">關閉</button>
                <button type="button" onclick="closeModal(); switchTab('tab-certs');" class="px-4 py-2 rounded bg-ukn-800 hover:bg-ukn-900 text-white text-sm font-semibold">前往「證照與競賽成果」</button>
            </div>
        </div>
    `);
}

// ---------- 桌寵小工具 ----------

let petState = null;
async function loadPetWidget() {
    if (!isLoggedIn()) return;
    try {
        petState = (await api('/api/campus/pet')).data;
        renderPetWidget();
        document.getElementById('petWidget').classList.remove('hidden');
        if (petState.questions_left > 0) {
            setTimeout(() => petSay(`今天還有 ${petState.questions_left} 題可以答，答對 +10 積分！點我開始 ✨`), 4000);
        }
    } catch (e) { /* 桌寵非必要功能 */ }
}

function renderPetWidget() {
    if (!petState) return;
    document.getElementById('petWidgetEmoji').textContent = petState.pet.emoji;
    document.getElementById('petWidgetOutfit').textContent = petState.outfit.emoji;
}

let petBubbleTimer = null;
function petSay(text) {
    const b = document.getElementById('petBubble');
    b.textContent = text;
    b.classList.remove('hidden');
    clearTimeout(petBubbleTimer);
    petBubbleTimer = setTimeout(() => b.classList.add('hidden'), 6000);
}

function petWidgetClick() {
    if (typeof openPetQuiz === 'function') openPetQuiz(); else switchTab('tab-pet');
}

// ---------- 啟動 ----------

function campusInit() {
    renderNav();
    renderHero();
    loadPinned();
    loadHomeNews();
    loadWeatherSummary();
    loadHomeUpcoming();
    if (currentUser.role === '學生') {
        document.getElementById('notifyBellBtn').classList.remove('hidden');
        pollNotices(false);
        setInterval(() => { if (document.visibilityState === 'visible') pollNotices(); }, NOTIFY_POLL_MS);
        if ('Notification' in window && Notification.permission === 'default') {
            document.getElementById('enablePushBtn').classList.remove('hidden');
        }
    }
    if (isLoggedIn()) document.getElementById('calAddBtn').classList.remove('hidden');
    loadPetWidget();
    loadHomeCertReminder();
    if (typeof campusFeaturesInit === 'function') campusFeaturesInit();
    switchTab(tabFromHash(), { updateHash: false });
}
