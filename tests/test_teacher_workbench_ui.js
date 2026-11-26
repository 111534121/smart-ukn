// Run with: node tests/test_teacher_workbench_ui.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const elements = new Map();
const openedTabs = [];
const element = id => {
    if (!elements.has(id)) elements.set(id, {innerHTML: '', classList: {add() {}, remove() {}}, scrollIntoView() {}});
    return elements.get(id);
};
const ctx = vm.createContext({
    console, Date, Intl,
    escapeHtml: s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c])),
    currentUser: {role: '老師', full_name: '測試老師', advised_class: '資管五忠'},
    isDormStaff: () => false,
    canReviewTask: () => false,
    document: {getElementById: element},
    switchTab: tab => openedTabs.push(tab),
    counselState: {},
    api: async url => ({'/api/campus/teachers': {data: [], periods: {}}, '/api/staff/alerts': {data: []},
        '/api/teacher/class-overview': null, '/api/campus/counseling': {data: []}, '/api/campus/notices/sent': {data: []}}[url]),
});
for (const name of ['campus-features.js', 'campus-life.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../static/js', name), 'utf8'), ctx);
}
(async () => {
    await ctx.loadStaffHome();
    assert.match(element('staffHome').innerHTML, /老師今日工作台/);
    assert.doesNotMatch(element('staffHome').innerHTML, /傳送測試通知/);
    assert.match(element('staffHome').innerHTML, /目前沒有待處理的事項/);
    assert.doesNotMatch(element('staffHome').innerHTML, /關懷追蹤 · 待處理/);
    assert.doesNotMatch(element('staffHome').innerHTML, /通知回條 · 尚有/);
    ctx.api = async url => url === '/api/line/demo-status' ? {ready: true} : ({'/api/campus/teachers': {data: [], periods: {}}, '/api/staff/alerts': {data: []}, '/api/teacher/class-overview': null, '/api/campus/counseling': {data: []}, '/api/campus/notices/sent': {data: []}}[url]);
    await ctx.loadStaffHome();
    assert.match(element('staffHome').innerHTML, /傳送測試通知/);
    ctx.api = async url => ({'/api/campus/teachers': {data: [], periods: {}}, '/api/staff/alerts': {data: [
        {key:'cert-2', type:'證照', goto:'tab-certs', title:'待審證照', detail:'資管五忠', at:'2026-10-20', due_date:''},
        {key:'care-7', type:'關懷', goto:'tab-counseling', title:'待追蹤學生', detail:'2020-01-01', at:'2020-01-01', due_date:'2020-01-01'},
        {key:'leave-3', type:'請假', goto:'tab-home', title:'<script>假單', detail:'事假', at:'2026-10-21', due_date:''}
    ]}, '/api/teacher/class-overview': null, '/api/campus/counseling': {data: []}, '/api/campus/notices/sent': {data: []}}[url]);
    await ctx.loadStaffHome();
    const todos = element('staffHome').innerHTML;
    const todoList = todos.slice(todos.indexOf('aria-label="待處理事項"'));
    assert.ok(todoList.indexOf('待追蹤學生') < todoList.indexOf('待審證照'));
    assert.match(todos, /前往處理/);
    assert.match(todos, /&lt;script&gt;假單/);
    assert.doesNotMatch(todos, /<script>假單/);
    for (const [key, tab] of [['care-7', 'tab-counseling'], ['cert-2', 'tab-certs'], ['leave-3', 'tab-home']]) {
        ctx.openStaffTodo(vm.runInContext(`staffTodoItems.findIndex(item => item.key === '${key}')`, ctx));
        assert.equal(openedTabs.at(-1), tab);
    }
    ctx.api = async url => ({'/api/campus/teachers': {data: [], periods: {}}, '/api/staff/alerts': {data: Array.from({length: 7}, (_, i) => ({key:`cert-${i}`, type:'證照', goto:'tab-certs', title:`證照 ${i}`, due_date:''}))}, '/api/teacher/class-overview': null, '/api/campus/counseling': {data: []}, '/api/campus/notices/sent': {data: []}}[url]);
    await ctx.loadStaffHome();
    assert.match(element('staffHome').innerHTML, /查看其餘 2 件待辦/);
    assert.equal((element('staffHome').innerHTML.match(/前往處理/g) || []).length, 7);
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
