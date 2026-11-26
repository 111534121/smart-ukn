(() => {
    const form = document.getElementById('admissionsConsultForm');
    if (!form) return;
    const input = document.getElementById('admissionsConsultInput');
    const output = document.getElementById('admissionsConsultResult');
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) return;
        const button = form.querySelector('button');
        button.disabled = true;
        output.textContent = '正在查詢公開文件…';
        try {
            const response = await fetch('/api/admissions-consultation/ask', {
                method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({question})
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || '查詢失敗');
            const sources = (data.sources || []).map(source => `<li><a class="text-ukn-700 underline" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title || source.document)} · ${escape(source.document)} 第 ${escape(source.page)} 頁 ↗</a></li>`).join('');
            output.innerHTML = `<div class="rounded border ${data.matched ? 'border-ukn-200 bg-ukn-50' : 'border-amber-200 bg-amber-50'} p-4 space-y-2"><p class="text-sm whitespace-pre-line">${escape(data.answer)}</p>${sources ? `<p class="text-xs font-semibold">引用文件</p><ul class="text-xs list-disc pl-5">${sources}</ul>` : ''}</div>`;
        } catch (error) {
            output.textContent = error.message;
        } finally {
            button.disabled = false;
        }
    });
})();
