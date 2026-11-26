'use strict';
function initManagementHome(user) {
    const $ = id => document.getElementById(id);
    const contentRole = user.role === '內容管理員';
    $('managementHomeTitle').textContent = `${user.role}工作台`;
    $('managementHomeIntro').textContent = contentRole
        ? '在校務首頁維護公開規章、招生與課務 PDF。'
        : '在校務首頁查詢帳號、檢視修改紀錄與執行系統檢查。';
    $('contentManagement').classList.toggle('hidden', !contentRole);
    $('systemManagement').classList.toggle('hidden', contentRole);
    async function call(url, options = {}) {
        const response = await fetch(url, options);
        const body = await response.json();
        if (!response.ok || body.status === 'error') throw Error(body.message || '操作失敗');
        return body;
    }
    if (contentRole) {
        let rules = [];
        const selected = $('managementRules');
        const showRule = () => { $('managementRuleContent').value = rules.find(r => String(r.id) === selected.value)?.content || ''; };
        call('/api/rules').then(result => {
            rules = result.data;
            selected.replaceChildren(...rules.map(rule => {
                const option = document.createElement('option');
                option.value = rule.id;
                option.textContent = rule.keyword || rule.official_term || rule.id;
                return option;
            }));
            showRule();
        }).catch(error => { $('managementRuleStatus').textContent = error.message; });
        selected.addEventListener('change', showRule);
        $('managementSaveRule').addEventListener('click', async () => {
            try {
                await call('/api/rules/' + encodeURIComponent(selected.value), {
                    method:'PUT', headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({content:$('managementRuleContent').value})
                });
                const row = rules.find(r => String(r.id) === selected.value);
                if (row) row.content = $('managementRuleContent').value;
                $('managementRuleStatus').textContent = '已儲存，並留下修改紀錄。';
            } catch (error) { $('managementRuleStatus').textContent = error.message; }
        });
        const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
        async function loadDocuments() {
            const rows = (await call('/api/admin/knowledge-documents')).data;
            $('managementDocumentList').innerHTML = rows.length ? rows.map(doc =>
                `<div class="py-3"><strong>${esc(doc.title)}</strong> · ${esc(doc.kind)} · 已索引 ${Number(doc.page_count) || 0} 頁<p><a class="text-ukn-800 underline" href="/api/admin/knowledge-documents/${encodeURIComponent(doc.id)}/file">下載 PDF</a></p><button type="button" class="border rounded px-3 py-1" data-replace="${esc(doc.id)}" data-title="${esc(doc.title)}" data-kind="${esc(doc.kind)}">更新 PDF</button></div>`).join('') : '尚無文件。';
        }
        loadDocuments().catch(error => { $('managementDocumentStatus').textContent = error.message; });
        $('managementDocumentForm').addEventListener('submit', async event => {
            event.preventDefault();
            const button = event.target.querySelector('button[type="submit"]');
            button.disabled = true;
            try {
                await call('/api/admin/knowledge-documents', {method:'POST', body:new FormData(event.target)});
                event.target.reset();
                $('managementDocumentStatus').textContent = '已加入搜尋。';
                await loadDocuments();
            } catch (error) { $('managementDocumentStatus').textContent = error.message; }
            finally { button.disabled = false; }
        });
        $('managementDocumentList').addEventListener('click', event => {
            const button = event.target.closest('[data-replace]');
            if (!button) return;
            const input = document.createElement('input');
            input.type = 'file'; input.accept = '.pdf';
            input.onchange = async () => {
                if (!input.files?.length) return;
                const body = new FormData();
                body.set('title', button.dataset.title);
                body.set('kind', button.dataset.kind);
                body.set('file', input.files[0]);
                try {
                    await call('/api/admin/knowledge-documents/' + encodeURIComponent(button.dataset.replace), {method:'POST', body});
                    $('managementDocumentStatus').textContent = 'PDF 已更新。';
                    await loadDocuments();
                } catch (error) { $('managementDocumentStatus').textContent = error.message; }
            };
            input.click();
        });
        return;
    }
    $('managementAccountSearch').addEventListener('click', async () => {
        const results = $('managementAccountResults'), status = $('managementAccountStatus');
        results.replaceChildren(); $('managementResetResult').textContent = '';
        try {
            const result = await call('/api/management/accounts?q=' + encodeURIComponent($('managementAccountQuery').value));
            status.textContent = result.data.length ? `找到 ${result.data.length} 筆${result.source === 'demo' ? '（示範資料）' : ''}` : '查無帳號';
            for (const account of result.data) {
                const row = document.createElement('div');
                row.className = 'border-t py-2';
                const label = document.createElement('span');
                label.textContent = `${account.full_name}｜${account.username}｜${account.role}${account.student_id ? '｜' + account.student_id : ''}`;
                row.append(label);
                if (result.source === 'database' && !['系統管理員','管理員'].includes(account.role)) {
                    const button = document.createElement('button');
                    button.type = 'button'; button.className = 'border rounded px-2 py-1 ml-3'; button.textContent = '重設密碼';
                    button.onclick = async () => {
                        if (!confirm(`確定要重設 ${account.full_name}（${account.username}）的密碼？舊密碼將立即失效。`)) return;
                        try {
                            const reset = await call(`/api/management/accounts/${account.user_id}/reset-password`, {method:'POST'});
                            $('managementResetResult').textContent = `${account.username} 的臨時密碼：${reset.temporary_password}。請立即安全交給本人。`;
                        } catch (error) { $('managementResetResult').textContent = error.message; }
                    };
                    row.append(button);
                }
                results.append(row);
            }
        } catch (error) { status.textContent = error.message; }
    });
    $('managementAccountQuery').addEventListener('keydown', event => { if (event.key === 'Enter') $('managementAccountSearch').click(); });
    async function run(url, options) {
        try { $('managementResult').textContent = JSON.stringify(await call(url, options), null, 2); }
        catch (error) { $('managementResult').textContent = error.message; }
    }
    $('managementAudit').addEventListener('click', () => run('/api/admin/audit-logs'));
    $('managementCheck').addEventListener('click', () => run('/api/admin/self-check', {method:'POST'}));
}
