// 網站導覽：每個帳號第一次登入時逐步介紹主要功能，可隨時跳過；之後由上方工具列的「🧭 導覽」再看一次。
// 看過與否存在帳號 (/api/campus/prefs 的 tour_seen)，換裝置登入也不會再跳出；未登入與訪客不自動開始。
// 另外還有「這次登入不再顯示」勾選框 (session_tour_dismiss)：只存在登入 session、不寫進帳號資料，
// 登出後會重設，用途是共用的示範帳號不會因為有人暫時關掉導覽，就害別的同學登入同一帳號也看不到。
// 結束 (完成或跳過) 時發出 window 事件 'ukn-tour-finished'。依賴 index.html 的 currentUser、campus-shell.js 的 api。

// target 依序找第一個「看得到」的元素；都找不到就跳過這一步 (例如手機版沒有大選單、非校慶期間沒有跑馬燈)
const TOUR_STEPS = [
    { title: '歡迎來到康寧大學服務系統 👋', text: '花 30 秒帶你認識常用功能。隨時可以按「跳過導覽」，之後也能從上方的「🧭 導覽」重新觀看。' },
    { target: ['#megaNav', '#mobileMenuBtn'], title: '功能選單', text: '所有功能分成「學習、校務、校園生活、社群」四大類，滑過或點開就能看到每個功能的說明。' },
    { target: ['#pinnedServices'], title: '常用服務可以置頂', text: '點功能右上角的 ☆ 就能把它釘在最前面，下次打開首頁直接點。' },
    { target: ['#deptScopeBtn'], title: '我的科系', text: '設定科系後，可以選擇「只看公開資訊與本科資訊」，其他科系專屬的期限、課程就不會干擾你。轉系也可以在這裡改。' },
    { target: ['#megaNav [data-group="校務"]', '#mobileMenuBtn'], title: '申請問題小幫手', text: '在「校務」裡。直接用一句話問，例如「生病不能來上課怎麼辦」，就會找出要辦的申請流程、步驟與要帶的文件。' },
    { target: ['#homeDashboard', '#loginLink'], title: () => isTourLoggedIn() ? '你今天的重點' : '登入看個人化資訊',
      text: () => isTourLoggedIn()
          ? '今天的課、待繳作業、未讀公告、請假與缺曠都在這裡；「學習」選單裡還有重補修推薦和畢業門檻。'
          : '用學號登入後，可以看到自己的課表、成績預警、請假進度，還能線上申請、上傳證照。' },
    { target: ['#annivBar'], title: '校慶跑馬燈', text: '校慶期間最上方會出現跑馬燈，可以切換中文 / English / 日本語，也能留下匿名祝福。' },
    { target: ['#tourReplayBtn'], title: '導覽結束 🎉', text: '想再看一次，點上方這個「🧭 導覽」就可以了。' },
];

window.siteTourActive = false;
let tourIndex = 0;
let tourSteps = [];
let tourEls = null;

function isTourLoggedIn() {
    return typeof currentUser !== 'undefined' && currentUser.role && currentUser.role !== '訪客';
}

function tourValue(v) { return typeof v === 'function' ? v() : v; }

function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
}

function findTourTarget(step) {
    if (!step.target) return null;
    for (const sel of step.target) {
        const el = document.querySelector(sel);
        if (isVisible(el)) return el;
    }
    return undefined; // 有指定目標但都看不到：略過
}

function buildTourElements() {
    const style = document.createElement('style');
    style.textContent = `
        .tour-root { position: fixed; inset: 0; z-index: 80; }
        .tour-dim { position: absolute; inset: 0; background: rgba(15,23,42,.6); }
        .tour-spot { position: absolute; border-radius: 6px; box-shadow: 0 0 0 9999px rgba(15,23,42,.6); outline: 3px solid #f97316; transition: all .25s ease; pointer-events: none; }
        .tour-card { position: absolute; width: min(22rem, calc(100vw - 2rem)); background: #fff; color: #0f172a; border-radius: 8px; padding: 1rem 1.1rem; box-shadow: 0 20px 40px rgba(0,0,0,.3); font-size: .875rem; }
        .tour-card h2 { font-weight: 700; font-size: 1rem; margin-bottom: .35rem; }
        .tour-card p { color: #475569; line-height: 1.6; }
        .tour-actions { display: flex; align-items: center; gap: .5rem; margin-top: .9rem; }
        .tour-actions .tour-count { font-size: .75rem; color: #94a3b8; margin-right: auto; }
        .tour-btn { border-radius: 4px; padding: .35rem .8rem; font-size: .8rem; font-weight: 600; }
        .tour-skip { color: #64748b; } .tour-skip:hover { color: #0f172a; text-decoration: underline; }
        .tour-prev { border: 1px solid #cbd5e1; } .tour-next { background: #003c9d; color: #fff; } .tour-next:hover { background: #002a6e; }
        .tour-nomore { display: flex; align-items: center; gap: .3rem; font-size: .75rem; color: #64748b; cursor: pointer; margin-right: auto; }
        .tour-nomore input { margin: 0; }
        @media (prefers-reduced-motion: reduce) { .tour-spot { transition: none; } }
    `;
    const root = document.createElement('div');
    root.className = 'tour-root';
    root.innerHTML = `
        <div class="tour-dim"></div>
        <div class="tour-spot hidden"></div>
        <div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle" tabindex="-1">
            <h2 id="tourTitle"></h2>
            <p id="tourText"></p>
            <div class="tour-actions">
                <label class="tour-nomore"><input type="checkbox" class="tour-nomore-check"> 這次登入不再顯示</label>
                <span class="tour-count"></span>
                <button type="button" class="tour-btn tour-skip">跳過導覽</button>
                <button type="button" class="tour-btn tour-prev">上一步</button>
                <button type="button" class="tour-btn tour-next">下一步</button>
            </div>
        </div>`;
    document.head.appendChild(style);
    document.body.appendChild(root);
    root.querySelector('.tour-skip').addEventListener('click', () => endSiteTour('skipped'));
    root.querySelector('.tour-prev').addEventListener('click', () => showTourStep(tourIndex - 1, -1));
    root.querySelector('.tour-next').addEventListener('click', () => showTourStep(tourIndex + 1, 1));
    root.querySelector('.tour-nomore-check').addEventListener('change', e => {
        // 勾選就立刻關掉，不用等按下其他按鈕；只存在這次登入 session，登出後重設 (不是永久跳過)
        if (e.target.checked) endSiteTour('dismissed-session');
    });
    return { root, style, dim: root.querySelector('.tour-dim'), spot: root.querySelector('.tour-spot'), card: root.querySelector('.tour-card') };
}

function positionTour() {
    const step = tourSteps[tourIndex];
    if (!step || !tourEls) return;
    const { spot, dim, card } = tourEls;
    const target = step.el;
    const vw = window.innerWidth, vh = window.innerHeight;
    if (!target) {
        spot.classList.add('hidden');
        dim.classList.remove('hidden');
        card.style.left = `${Math.max(16, (vw - card.offsetWidth) / 2)}px`;
        card.style.top = `${Math.max(16, (vh - card.offsetHeight) / 2)}px`;
        return;
    }
    const r = target.getBoundingClientRect();
    const pad = 6;
    dim.classList.add('hidden'); // 改由聚光框的陰影把其他地方變暗
    spot.classList.remove('hidden');
    Object.assign(spot.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    // 卡片優先放在目標下方，空間不夠就放上方，再不夠就貼底
    const below = r.bottom + pad + 12, above = r.top - pad - 12 - card.offsetHeight;
    const top = below + card.offsetHeight <= vh - 8 ? below : above >= 8 ? above : vh - card.offsetHeight - 16;
    const left = Math.min(Math.max(16, r.left), vw - card.offsetWidth - 16);
    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
}

function showTourStep(index, direction = 1) {
    // 找下一個可以顯示的步驟 (目標看不到的跳過)
    while (index >= 0 && index < TOUR_STEPS.length) {
        const el = findTourTarget(TOUR_STEPS[index]);
        if (el !== undefined) {
            tourSteps[index] = { ...TOUR_STEPS[index], el };
            break;
        }
        index += direction;
    }
    if (index >= TOUR_STEPS.length) return endSiteTour('done');
    if (index < 0) return;
    tourIndex = index;
    const step = tourSteps[index];
    if (step.el) step.el.scrollIntoView({ block: 'center', behavior: 'auto' });

    const { card } = tourEls;
    card.querySelector('#tourTitle').textContent = tourValue(step.title);
    card.querySelector('#tourText').textContent = tourValue(step.text);
    card.querySelector('.tour-count').textContent = `${index + 1} / ${TOUR_STEPS.length}`;
    card.querySelector('.tour-prev').classList.toggle('hidden', index === 0);
    const isLast = index === TOUR_STEPS.length - 1;
    card.querySelector('.tour-next').textContent = isLast ? '完成' : '下一步';
    card.querySelector('.tour-skip').classList.toggle('hidden', isLast);
    positionTour();
    card.focus();
}

function onTourKey(e) {
    if (e.key === 'Escape') endSiteTour('skipped');
    else if (e.key === 'ArrowRight') showTourStep(tourIndex + 1, 1);
    else if (e.key === 'ArrowLeft') showTourStep(tourIndex - 1, -1);
}

function startSiteTour() {
    if (window.siteTourActive) return;
    if (typeof switchTab === 'function') switchTab('tab-home');
    window.siteTourActive = true;
    tourSteps = [];
    tourEls = buildTourElements();
    document.addEventListener('keydown', onTourKey);
    window.addEventListener('resize', positionTour);
    window.addEventListener('scroll', positionTour, true);
    showTourStep(0, 1);
}

function endSiteTour(result) {
    if (!window.siteTourActive) return;
    window.siteTourActive = false;
    if (isTourLoggedIn()) {
        // 'dismissed-session'：只關掉這次登入 (勾了「這次登入不再顯示」)，不寫永久的 tour_seen，
        // 這樣共用的示範帳號不會因為有人暫時關掉，就害別的同學登入同一帳號也看不到導覽
        const json = result === 'dismissed-session' ? { session_tour_dismiss: true } : { tour_seen: true };
        api('/api/campus/prefs', { method: 'PUT', json }).catch(() => { /* 存不到就下次登入再出現一次 */ });
    }
    document.removeEventListener('keydown', onTourKey);
    window.removeEventListener('resize', positionTour);
    window.removeEventListener('scroll', positionTour, true);
    tourEls.root.remove();
    tourEls.style.remove();
    tourEls = null;
    window.scrollTo({ top: 0 });
    window.dispatchEvent(new Event('ukn-tour-finished'));
}

// 帳號第一次登入才自動開始；回傳 Promise<是否已開始>
async function maybeStartSiteTour() {
    if (!isTourLoggedIn()) return false;
    try {
        const prefs = (await api('/api/campus/prefs')).data;
        if (prefs.tour_seen || prefs.session_tour_dismissed) return false;
    } catch (e) {
        return false; // 查不到是否看過時不自動跳出，避免每次都出現
    }
    startSiteTour();
    return true;
}
