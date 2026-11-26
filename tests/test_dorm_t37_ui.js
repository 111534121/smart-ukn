// Run with: node tests/test_dorm_t37_ui.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let modal = '';
const sent = [];
const ctx = vm.createContext({
    console,
    currentUser: {role: '教職員', can_manage_dorm: true},
    document: {getElementById: () => ({innerHTML: ''})},
    esc: value => String(value ?? '').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
    openModal: (_title, html) => { modal = html; },
    closeModal: () => {},
    toast: () => {},
    api: async (url, options) => { sent.push({url, options}); return {data: []}; },
});
vm.runInContext(fs.readFileSync('static/js/campus-life.js', 'utf8'), ctx);
vm.runInContext("dormAdminApps = [{id: 5, status: '進行中', stage: 2, bed: '', student_name: '<學生>', semester: '115-2', room_type: '四人房'}]", ctx);
ctx.advanceDorm(5);
assert.match(modal, /分配床號/);
assert.match(modal, /name="bed"[^>]*required/);
assert.match(modal, /&lt;學生&gt;/);
assert.doesNotMatch(modal, /<學生>/);
const links = decodeURIComponent(vm.runInContext('dormServiceLinks', ctx));
assert.match(links, /住宿設備報修/);
assert.match(links, /住宿異動申請/);
const button = {disabled: false};
const event = {preventDefault() {}, target: {elements: {note: {value: '已確認'}, bed: {value: 'S305-2'}}, querySelector: () => button}};
ctx.submitDormReview(event, 5, false).then(() => {
    assert.equal(sent[0].url, '/api/campus/dorm/applications/5');
    assert.equal(sent[0].options.json.bed, 'S305-2');
    assert.equal(button.disabled, false);
    console.log('T37 宿舍報修入口、床號表單與審核送出檢查通過。');
}).catch(error => { console.error(error); process.exitCode = 1; });
