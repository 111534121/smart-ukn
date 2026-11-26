'use strict';
tabLoaders['tab-admin-cases'] = () => {
    const frame = document.getElementById('adminCasesFrame');
    if (!frame || frame.src) return;
    const kind = new URLSearchParams(location.search).get('kind');
    frame.src = '/admin-workbench?embedded=1' + (kind ? '&kind=' + encodeURIComponent(kind) : '');
};
window.addEventListener('message', event => {
    const frame = document.getElementById('adminCasesFrame');
    if (event.origin !== location.origin || event.source !== frame?.contentWindow || event.data?.type !== 'admin-cases-height') return;
    const height = Number(event.data.height);
    if (Number.isFinite(height) && height >= 400 && height <= 30000) frame.style.height = height + 'px';
});
