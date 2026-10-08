// Smart UKN Service Worker：讓網站可加到手機桌面，並在斷線時仍能開啟首頁外殼
// 更新頁面或靜態檔後請遞增版本號，舊快取會在 activate 時清除
const CACHE_VERSION = 'smart-ukn-v9';
const APP_SHELL = [
    '/',
    '/login',
    '/manifest.json',
    '/img/ukn-logo.png',
    '/img/icon-192.png',
    '/img/icon-512.png',
    '/img/hero/campus-gate-2017.jpg',
    '/js/campus-shell.js',
    '/js/campus-features.js',
    '/js/campus-life.js',
    '/js/anniversary.js',
    '/js/dept-scope.js',
    '/js/faculty.js',
    '/js/self-review.js',
    '/js/assistant.js',
    '/js/tour.js'
];

// 點系統通知 (科上通知)：切到已開啟的分頁，沒有就開新視窗
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            const open = list.find(c => new URL(c.url).origin === self.location.origin);
            if (open) return open.navigate(url).then(c => c && c.focus());
            return self.clients.openWindow(url);
        })
    );
});
// 跨網域的樣式與字型：先用快取、背景更新，離線時畫面才不會失去樣式
const CDN_HOSTS = ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // API 含個人資料 (缺曠、成績等)，一律不快取，避免共用裝置上被他人看到
    if (url.origin === self.location.origin && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/'))) return;

    // 頁面：網路優先，離線時退回快取的首頁
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req).then(hit => hit || caches.match('/')))
        );
        return;
    }

    // 本站靜態檔與 CDN：先回快取，同時背景更新
    if (url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname)) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(async cache => {
                const cached = await cache.match(req);
                const network = fetch(req)
                    .then(res => {
                        if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
                        return res;
                    })
                    .catch(() => cached);
                return cached || network;
            })
        );
    }
});
