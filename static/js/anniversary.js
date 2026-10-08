// 校慶跑馬燈：校慶前一個月起顯示在網頁最上方，校慶結束後自動消失 (由 /api/anniversary/marquee 判斷)
// 可切換 中文 / English / 日本語 (記在瀏覽器)，任何人都能留下匿名祝福
(function () {
    const LANG_KEY = 'ukn-lang';
    const DISMISS_KEY = 'ukn-anniv-dismissed';
    const REFRESH_MS = 5 * 60 * 1000;
    const UI = {
        zh: {
            region: '校慶跑馬燈', lang: '語言', wish: '留下祝福', close: '關閉跑馬燈',
            title: '留下匿名祝福', placeholder: '寫下你對學校的祝福（最多 60 字）',
            anon: '不需登入，不會記錄你的姓名、學號或 IP。', approval: '送出後經審核才會顯示在跑馬燈上。',
            submit: '送出', cancel: '取消', sending: '送出中…', offline: '無法連線，請稍後再試', count: '字'
        },
        en: {
            region: 'Anniversary banner', lang: 'Language', wish: 'Leave a wish', close: 'Close banner',
            title: 'Leave an anonymous wish', placeholder: 'Write your wish for the school (up to 60 characters)',
            anon: 'No login needed. Your name, student ID and IP are not recorded.', approval: 'Wishes appear on the banner after review.',
            submit: 'Send', cancel: 'Cancel', sending: 'Sending…', offline: 'Connection failed. Please try again later', count: 'chars'
        },
        ja: {
            region: '創立記念バナー', lang: '言語', wish: 'メッセージを送る', close: 'バナーを閉じる',
            title: '匿名メッセージを送る', placeholder: '学校へのお祝いメッセージ（60文字以内）',
            anon: 'ログイン不要。氏名・学籍番号・IPは記録されません。', approval: '確認後にバナーに表示されます。',
            submit: '送信', cancel: 'キャンセル', sending: '送信中…', offline: '接続できません。しばらくしてからお試しください', count: '文字'
        }
    };
    const LANG_NAMES = { zh: '中', en: 'EN', ja: '日' };

    const store = {
        get(area, key) { try { return window[area].getItem(key); } catch (e) { return null; } },
        set(area, key, value) { try { window[area].setItem(key, value); } catch (e) { /* 私密瀏覽等情況忽略 */ } }
    };
    let lang = UI[store.get('localStorage', LANG_KEY)] ? store.get('localStorage', LANG_KEY) : 'zh';
    let current = null;

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function injectStyle() {
        if (document.getElementById('annivStyle')) return;
        const style = document.createElement('style');
        style.id = 'annivStyle';
        style.textContent = `
            .anniv-bar { background: #d90000; color: #ffe600; font-weight: 700; display: flex; align-items: center; gap: .5rem; padding: .35rem .75rem; font-size: .875rem; position: relative; z-index: 50; }
            .anniv-viewport { flex: 1; min-width: 0; overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 2%, #000 98%, transparent); }
            .anniv-track { display: inline-flex; white-space: nowrap; animation: anniv-scroll var(--anniv-duration, 40s) linear infinite; }
            .anniv-bar:hover .anniv-track, .anniv-bar:focus-within .anniv-track { animation-play-state: paused; }
            .anniv-item { padding-right: 3rem; }
            .anniv-item .anniv-wish-label { color: #fff; font-weight: 600; font-size: .75rem; border: 1px solid rgba(255,255,255,.6); border-radius: 3px; padding: 0 .3rem; margin-right: .4rem; }
            .anniv-item.is-wish { color: #fff; font-weight: 500; }
            @keyframes anniv-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            @media (prefers-reduced-motion: reduce) {
                .anniv-track { animation: none; }
                .anniv-viewport { overflow-x: auto; mask-image: none; }
            }
            .anniv-btn { background: #ffe600; color: #a40000; border-radius: 4px; padding: .2rem .6rem; font-size: .75rem; font-weight: 700; white-space: nowrap; }
            .anniv-btn:hover { background: #fff; }
            .anniv-lang { background: transparent; color: #ffe600; border: 1px solid rgba(255,230,0,.7); border-radius: 4px; font-size: .75rem; padding: .1rem .2rem; }
            .anniv-lang option { color: #000; }
            .anniv-close { color: #ffe600; font-size: 1.1rem; line-height: 1; padding: 0 .25rem; }
            .anniv-modal { position: fixed; inset: 0; background: rgba(15,23,42,.55); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
            .anniv-dialog { background: #fff; color: #0f172a; border-radius: 6px; width: 100%; max-width: 26rem; padding: 1.25rem; box-shadow: 0 20px 40px rgba(0,0,0,.25); font-size: .875rem; }
            .anniv-dialog textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 4px; padding: .5rem; resize: vertical; min-height: 5rem; }
            .anniv-msg.is-error { color: #be123c; } .anniv-msg.is-ok { color: #047857; }
            @media (max-width: 640px) { .anniv-bar { flex-wrap: wrap; } .anniv-viewport { order: 3; flex-basis: 100%; } }
        `;
        document.head.appendChild(style);
    }

    async function fetchMarquee() {
        const res = await fetch(`/api/anniversary/marquee?lang=${lang}`);
        return res.json();
    }

    function render(data) {
        let bar = document.getElementById('annivBar');
        if (!data.active || store.get('sessionStorage', DISMISS_KEY) === String(data.event.id)) {
            if (bar) bar.remove();
            return;
        }
        const t = UI[lang];
        const items = data.items.map(i => i.type === 'wish'
            ? `<span class="anniv-item is-wish"><span class="anniv-wish-label">${esc(i.label)}</span>${esc(i.text)}</span>`
            : `<span class="anniv-item">${esc(i.text)}</span>`).join('');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'annivBar';
            bar.className = 'anniv-bar';
            bar.setAttribute('role', 'region');
            document.body.prepend(bar);
        }
        bar.setAttribute('lang', lang === 'zh' ? 'zh-TW' : lang);
        bar.setAttribute('aria-label', t.region);
        // 內容複製一份接在後面，捲到一半時無縫重來；複製的那份對螢幕閱讀器隱藏
        bar.innerHTML = `
            <div class="anniv-viewport"><div class="anniv-track"><div>${items}</div><div aria-hidden="true">${items}</div></div></div>
            <select class="anniv-lang" aria-label="${esc(t.lang)}">
                ${Object.keys(UI).map(l => `<option value="${l}" ${l === lang ? 'selected' : ''}>${LANG_NAMES[l]}</option>`).join('')}
            </select>
            <button type="button" class="anniv-btn">${esc(t.wish)}</button>
            <button type="button" class="anniv-close" aria-label="${esc(t.close)}">✕</button>`;
        bar.dataset.requireApproval = data.require_approval ? '1' : '';
        bar.querySelector('.anniv-lang').addEventListener('change', e => setLang(e.target.value));
        bar.querySelector('.anniv-btn').addEventListener('click', openWishDialog);
        bar.querySelector('.anniv-close').addEventListener('click', () => {
            store.set('sessionStorage', DISMISS_KEY, String(data.event.id));
            bar.remove();
        });
        requestAnimationFrame(() => {
            // 內容比畫面短時重複幾次，讓跑馬燈填滿整條、不會同時看到兩段一樣的空隙
            const viewport = bar.querySelector('.anniv-viewport');
            const halves = bar.querySelectorAll('.anniv-track > div');
            const unit = halves[0].scrollWidth;
            const repeat = unit ? Math.min(10, Math.ceil(viewport.clientWidth / unit)) : 1;
            if (repeat > 1) halves.forEach(h => { h.innerHTML = items.repeat(repeat); });
            // 捲動速度固定約每秒 70px，內容多時不會變得太快
            bar.querySelector('.anniv-track').style.setProperty('--anniv-duration', `${Math.max(15, unit * repeat / 70)}s`);
        });
    }

    async function refresh() {
        try {
            const data = await fetchMarquee();
            if (data.status !== 'success') return;
            const key = JSON.stringify([data.active, data.items, lang]);
            if (key === current) return;
            current = key;
            render(data);
        } catch (e) {
            console.warn('校慶跑馬燈載入失敗', e);
        }
    }

    function setLang(next) {
        if (!UI[next]) return;
        lang = next;
        store.set('localStorage', LANG_KEY, next);
        refresh();
    }

    function openWishDialog() {
        const t = UI[lang];
        const needsApproval = document.getElementById('annivBar')?.dataset.requireApproval === '1';
        const modal = document.createElement('div');
        modal.className = 'anniv-modal';
        modal.setAttribute('lang', lang === 'zh' ? 'zh-TW' : lang);
        modal.innerHTML = `
            <form class="anniv-dialog space-y-3" role="dialog" aria-modal="true" aria-labelledby="annivDialogTitle">
                <h2 id="annivDialogTitle" style="font-weight:700;font-size:1rem">🎉 ${esc(t.title)}</h2>
                <textarea maxlength="60" required placeholder="${esc(t.placeholder)}" aria-label="${esc(t.title)}"></textarea>
                <div style="display:flex;justify-content:space-between;font-size:.75rem;color:#64748b">
                    <span>${esc(t.anon)}${needsApproval ? ' ' + esc(t.approval) : ''}</span>
                    <span class="anniv-count" style="white-space:nowrap;margin-left:.5rem">0 / 60 ${esc(t.count)}</span>
                </div>
                <p class="anniv-msg" style="font-size:.75rem" role="status"></p>
                <div style="display:flex;justify-content:flex-end;gap:.5rem">
                    <button type="button" class="anniv-cancel" style="border:1px solid #cbd5e1;border-radius:4px;padding:.35rem .9rem">${esc(t.cancel)}</button>
                    <button type="submit" style="background:#d90000;color:#fff;border-radius:4px;padding:.35rem .9rem;font-weight:700">${esc(t.submit)}</button>
                </div>
            </form>`;
        document.body.appendChild(modal);
        const form = modal.querySelector('form');
        const textarea = modal.querySelector('textarea');
        const msg = modal.querySelector('.anniv-msg');
        const close = () => { modal.remove(); document.removeEventListener('keydown', onKey); };
        const onKey = e => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        modal.addEventListener('click', e => { if (e.target === modal) close(); });
        modal.querySelector('.anniv-cancel').addEventListener('click', close);
        textarea.addEventListener('input', () => {
            modal.querySelector('.anniv-count').textContent = `${textarea.value.length} / 60 ${t.count}`;
        });
        textarea.focus();

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const submit = form.querySelector('[type=submit]');
            submit.disabled = true;
            submit.textContent = t.sending;
            try {
                const res = await fetch('/api/anniversary/wishes', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: textarea.value, lang })
                });
                const data = await res.json();
                msg.textContent = data.message;
                msg.className = `anniv-msg ${res.ok ? 'is-ok' : 'is-error'}`;
                if (res.ok) {
                    textarea.value = '';
                    if (!data.pending) refresh();
                    setTimeout(close, 1800);
                }
            } catch (err) {
                msg.textContent = t.offline;
                msg.className = 'anniv-msg is-error';
            } finally {
                submit.disabled = false;
                submit.textContent = t.submit;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectStyle();
        refresh();
        // 定時更新：審核通過的祝福、倒數天數不用重新整理頁面就會出現
        setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, REFRESH_MS);
    });
})();
