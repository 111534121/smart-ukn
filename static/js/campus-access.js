/* Public homepage sharing only. Never include account names, query strings or private page URLs. */
let publicSiteConfig = null;
let lineOaConfig = null;
let pendingCampusInstall = null;
const CAMPUS_ACCESS_USED_KEY = 'campus_access_used';
function collapseCampusAccess() {
    document.getElementById('campusAccessSection').classList.add('collapsed');
    document.getElementById('campusAccessFab').hidden = false;
    try { localStorage.setItem(CAMPUS_ACCESS_USED_KEY, '1'); } catch (e) { /* 無痕模式 */ }
}
function expandCampusAccess() {
    document.getElementById('campusAccessSection').classList.remove('collapsed');
    document.getElementById('campusAccessFab').hidden = true;
}
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingCampusInstall = event;
    const button = document.getElementById('campusInstall');
    if (button) button.textContent = '加入手機主畫面';
});
window.addEventListener('appinstalled', () => {
    pendingCampusInstall = null;
    const button = document.getElementById('campusInstall');
    if (button) button.textContent = '已加入主畫面';
});
function showCampusAccessDialog(title, html) {
    document.getElementById('campusAccessTitle').textContent = title;
    document.getElementById('campusAccessBody').innerHTML = html;
    document.getElementById('campusAccessDialog').showModal();
}
async function loadCampusSharing() {
    const status = document.getElementById('campusAccessStatus');
    publicSiteConfig = null;
    document.getElementById('campusQr').disabled = true;
    document.getElementById('campusCopy').disabled = true;
    document.getElementById('campusLine').hidden = true;
    try {
        const config = await api('/api/public-site');
        publicSiteConfig = config.ready && config.public_url ? config : null;
        ['campusQr','campusCopy','campusLine'].forEach(id => {
            const element = document.getElementById(id);
            if (id === 'campusLine') {
                element.hidden = !publicSiteConfig;
                if (publicSiteConfig) element.href = config.line_url;
            } else element.disabled = !publicSiteConfig;
        });
        status.textContent = publicSiteConfig ? '掃碼、分享，或加入主畫面，下次更快回到校園。' : '目前為網站預覽；公開網址設定完成後，即可使用 QR Code、LINE 分享與複製連結。';
        document.getElementById('campusAccessRetry').hidden = true;
    } catch {
        publicSiteConfig = null;
        status.textContent = '分享資訊暫時無法載入，請稍後再試。';
        document.getElementById('campusAccessRetry').hidden = false;
    }
}
function showCampusQr() {
    if (!publicSiteConfig) return;
    showCampusAccessDialog('掃碼開啟校園智慧官網', `<p>用另一支手機掃描，即可開啟網站首頁。</p><img class="campus-qr" src="/api/public-site/qr.svg" alt="校園智慧官網公開網址 QR Code" width="240" height="240"><p class="campus-public-url">${escapeHtml(publicSiteConfig.public_url)}</p><a class="campus-access-button" href="/api/public-site/qr.svg" download="smart-ukn-qr.svg">下載 QR Code</a><p class="campus-access-note">QR Code 僅包含公開首頁網址，不含登入資訊或個人資料。</p>`);
}
async function loadLineOa() {
    const link = document.getElementById('campusLineOa');
    try {
        const config = await api('/api/line/oa');
        lineOaConfig = config.ready ? config : null;
    } catch { lineOaConfig = null; }
    link.hidden = !lineOaConfig;
    if (lineOaConfig) link.href = lineOaConfig.add_friend_url;
}
async function copyCampusUrl() {
    if (!publicSiteConfig) return;
    try {
        await navigator.clipboard.writeText(publicSiteConfig.public_url);
        document.getElementById('campusAccessStatus').textContent = '已複製公開首頁網址，可以貼到 LINE 或簡報。';
    } catch {
        showCampusAccessDialog('複製網站連結', `<p>長按或選取下方網址後複製。</p><input class="campus-url-input" readonly aria-label="公開首頁網址" value="${escapeHtml(publicSiteConfig.public_url)}">`);
    }
}
async function installCampusHome() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (standalone) {
        showCampusAccessDialog('已從主畫面開啟', '<p>你已經在使用校園智慧官網的主畫面捷徑。</p>');
        collapseCampusAccess();
        return;
    }
    if (pendingCampusInstall) {
        const prompt = pendingCampusInstall;
        pendingCampusInstall = null;
        try {
            await prompt.prompt();
            const result = await prompt.userChoice;
            document.getElementById('campusAccessStatus').textContent = result.outcome === 'accepted' ? '已接受加入主畫面，請依瀏覽器提示完成。' : '已取消加入，仍可隨時透過網址開啟。';
            collapseCampusAccess();
            return;
        } catch { /* Fall back to manual browser instructions. */ }
    }
    const ua = navigator.userAgent || '';
    const inLine = /Line\//i.test(ua);
    const isApple = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let html = '<p>這是校園智慧官網的主畫面捷徑，無須到應用程式商店下載。</p>';
    if (inLine) html += '<p><strong>你正在 LINE 內開啟網站。</strong>請先點選右上角選單，選擇使用外部瀏覽器開啟，再依下方步驟操作。</p>';
    html += isApple ? '<ol><li>使用 Safari 開啟網站。</li><li>點選「分享」按鈕。</li><li>選擇「加入主畫面」，再點「加入」。</li></ol>' : '<ol><li>在 Chrome 或 Edge 開啟網站。</li><li>點選瀏覽器選單。</li><li>選擇「加入主畫面」或「安裝應用程式」，依畫面提示完成。</li></ol>';
    html += '<p class="campus-access-note">各版本瀏覽器的選單名稱可能不同。個人服務仍需登入，離線時無法查詢即時資料。</p>';
    showCampusAccessDialog('加入手機主畫面', html);
    collapseCampusAccess();
}
function initCampusAccess() {
    document.getElementById('campusQr').addEventListener('click', showCampusQr);
    document.getElementById('campusCopy').addEventListener('click', copyCampusUrl);
    document.getElementById('campusInstall').addEventListener('click', installCampusHome);
    document.getElementById('campusAccessRetry').addEventListener('click', loadCampusSharing);
    document.getElementById('campusAccessDialog').addEventListener('click', event => {
        if (event.target === event.currentTarget) event.currentTarget.close();
    });
    document.getElementById('campusAccessFab').addEventListener('click', expandCampusAccess);
    let usedBefore = false;
    try { usedBefore = localStorage.getItem(CAMPUS_ACCESS_USED_KEY) === '1'; } catch (e) { /* 無痕模式 */ }
    if (usedBefore) collapseCampusAccess();
    loadCampusSharing();
    loadLineOa();
}
