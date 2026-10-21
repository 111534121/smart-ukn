// Run with: node tests/test_teacher_workbench_ui.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const elements = new Map();
const element = id => {
    if (!elements.has(id)) elements.set(id, {innerHTML: '', classList: {add() {}, remove() {}}});
    return elements.get(id);
};
const ctx = vm.createContext({
    console, Date, Intl,
    escapeHtml: s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c])),
    currentUser: {role: '老師', full_name: '測試老師', advised_class: '資管五忠'},
    document: {getElementById: element},
    api: async url => ({'/api/campus/teachers': {data: [], periods: {}}, '/api/staff/alerts': {data: []},
        '/api/teacher/class-overview': null, '/api/campus/counseling': {data: []}, '/api/campus/notices/sent': {data: []}}[url]),
});
for (const name of ['campus-features.js', 'campus-life.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../static/js', name), 'utf8'), ctx);
}
(async () => {
    await ctx.loadStaffHome();
    assert.match(element('staffHome').innerHTML, /老師今日工作台/);
    assert.match(element('staffHome').innerHTML, /目前沒有待追蹤事項/);
    assert.match(element('staffHome').innerHTML, /目前沒有待收回條/);
    ctx.api = async () => { throw new Error('測試連線失敗'); };
    await ctx.loadStaffHome();
    assert.match(element('staffHome').innerHTML, /待辦讀取失敗/);
    assert.doesNotMatch(element('staffHome').innerHTML, /目前沒有待處理的事項/);
    const n = {id: 1, reply_required: true, due_date: '2999-01-01', my_reply: {reply: '<img>', reply_at: '2026-10-20'}};
    const readonly = ctx.noticeReplyHtml(n, true);
    assert.match(readonly, /&lt;img&gt;/);
    assert.doesNotMatch(readonly, /<form/);
    assert.match(ctx.noticeReplyHtml(n, false), /更新回條/);
    assert.doesNotMatch(ctx.noticeReplyHtml({...n, due_date: '2000-01-01'}, false), /<form/);
    const html = ctx.staffFollowUpHtml({data: [{id: 1, full_name: '<script>', topic: '學業', tracking_status: '已聯繫', follow_up: true, follow_up_done: false, follow_up_date: '2000-01-01', follow_up_note: '待確認'}]});
    assert.match(html, /已逾期/);
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(ctx.staffFollowUpHtml({data: [{follow_up: true, follow_up_done: true}]}), /查看與處理/);
    console.log('老師工作台畫面產生、錯誤狀態、回條唯讀與截止、追蹤逾期及內容跳脫檢查通過。');
})().catch(e => { console.error(e); process.exitCode = 1; });
