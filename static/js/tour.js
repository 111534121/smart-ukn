// 網站導覽：第一次進站時逐步介紹主要功能，可隨時跳過；頁尾「重新觀看網站導覽」可再看一次。
// 結束 (完成或跳過) 時發出 window 事件 'ukn-tour-finished'。依賴 index.html 的 currentUser。

const TOUR_KEY = 'ukn-site-tour-v1';

// target 依序找第一個「看得到」的元素；都找不到就跳過這一步 (例如手機版沒有大選單、非校慶期間沒有跑馬燈)
const TOUR_STEPS = [
    { title: '歡迎來到康寧大學服務系統 👋', text: '花 30 秒帶你認識常用功能。隨時可以按「跳過導覽」，之後也能從頁尾重新觀看。' },
    { target: ['#megaNav', '#mobileMenuBtn'], title: '功能選單', text: '所有功能分成「學習、校務、校園生活、社群」四大類，滑過或點開就能看到每個功能的說明。' },
    { target: ['#pinnedServices'], title: '常用服務可以置頂', text: '點功能右上角的 ☆ 就能把它釘在最前面，下次打開首頁直接點。' },
    { target: ['#deptScopeBtn'], title: '我的科系', text: '設定科系後，可以選擇「只看公開資訊與本科資訊」，其他科系專屬的期限、課程就不會干擾你。轉系也可以在這裡改。' },
    { target: ['#megaNav [data-group="校務"]', '#mobileMenuBtn'], title: '申請問題小幫手', text: '在「校務」裡。直接用一句話問，例如「生病不能來上課怎麼辦」，就會找出要辦的申請流程、步驟與要帶的文件。' },
    { target: ['#homeDashboard', '#loginLink'], title: () => isTourLoggedIn() ? '你今天的重點' : '登入看個人化資訊',
      text: () => isTourLoggedIn()
          ? '今天的課、待繳作業、未讀公告、請假與缺曠都在這裡；「學習」選單裡還有學期自評表，寫到一半也會幫你存著。'
          : '用學號登入後，可以看到自己的課表、成績預警、請假進度，還能填學期自評表，下次登入都還在。' },
    { target: ['#annivBar'], title: '校慶跑馬燈', text: '校慶期間最上方會出現跑馬燈，可以切換中文 / English / 日本語，也能留下匿名祝福。' },
    { title: '導覽結束 🎉', text: '想再看一次，點頁尾的「重新觀看網站導覽」就可以了。' },
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
    try { localStorage.setItem(TOUR_KEY, result); } catch (e) { /* 無痕模式：下次仍會出現 */ }
    document.removeEventListener('keydown', onTourKey);
    window.removeEventListener('resize', positionTour);
    window.removeEventListener('scroll', positionTour, true);
    tourEls.root.remove();
    tourEls.style.remove();
    tourEls = null;
    window.scrollTo({ top: 0 });
    window.dispatchEvent(new Event('ukn-tour-finished'));
}

// 第一次進站才自動開始；回傳是否已開始
function maybeStartSiteTour() {
    try {
        if (localStorage.getItem(TOUR_KEY)) return false;
    } catch (e) {
        return false; // 無法記住「看過了」的環境 (例如部分無痕模式) 不自動跳出，避免每次都出現
    }
    startSiteTour();
    return true;
}
