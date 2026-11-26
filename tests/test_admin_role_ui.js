// Run with: node tests/test_admin_role_ui.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('static/js/campus-shell.js', 'utf8');
function featuresFor(user) {
    const ctx = vm.createContext({
        currentUser: user,
        document: {addEventListener() {}, querySelectorAll: () => [], getElementById: () => null},
        window: {addEventListener() {}},
    });
    vm.runInContext(source, ctx);
    vm.runInContext('applyStaffView()', ctx);
    return vm.runInContext('FEATURES.map(f => f.key)', ctx);
}

const dorm = featuresFor({role: '住宿管理員', can_manage_dorm: true, office: '學生事務處／住宿管理'});
assert.ok(dorm.includes('services'));
assert.ok(!dorm.includes('certs'));
assert.ok(!dorm.includes('my-class'));
assert.ok(!dorm.includes('conduct'));

const assistant = featuresFor({role: '科助', office: '資訊管理科（五專）／科辦公室', review_tasks: []});
assert.ok(!assistant.includes('conduct'));
assert.ok(assistant.includes('activities'));

const registration = featuresFor({role: '處室承辦', office: '教務處／註冊組', review_tasks: ['certificates']});
assert.ok(registration.includes('certs'));
assert.ok(!registration.includes('services'));
assert.ok(!registration.includes('my-class'));
assert.ok(!registration.includes('conduct'));

const teacher = featuresFor({role: '老師', advised_class: '資管五忠'});
assert.ok(!teacher.includes('conduct'));

const student = featuresFor({role: '學生'});
assert.ok(student.includes('conduct'));

const guidance = featuresFor({role: '處室承辦', office: '學生事務處／生活輔導組', review_tasks: ['leave']});
assert.ok(!guidance.includes('certs'));
assert.ok(!guidance.includes('services'));
console.log('行政角色首頁功能篩選通過。');
