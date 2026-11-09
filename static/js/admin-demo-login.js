// 僅協助填入明確的示範帳號，不會自動登入或儲存密碼。
(() => {
    const name = new URLSearchParams(location.search).get('demo');
    if (name && (/^(demo_office|demo_assistant)_[a-z]+$/.test(name) || ['student1','student2','staff1','dorm_demo'].includes(name))) {
        document.getElementById('mUsername').value = name;
        document.getElementById('mPassword').value = '123456';
        document.getElementById('mRemember').checked = false;
    }
})();
