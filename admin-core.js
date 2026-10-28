// -*- coding: utf-8 -*-
/**
 * Smart UKN 核心校務管理與系統稽核前端引擎 (admin-core.js)
 * 涵蓋全套 13 張核心資料表之 CRUD 維護與稽核監控
 */

let coreDataCache = {
    users: [],
    departments: [],
    courses: [],
    gradReqs: [],
    categories: [],
    synonyms: [],
    auditLogs: [],
    searchLogs: [],
    unmatched: [],
    studentCredits: [],
    attendance: [],
    studentRecords: []
};

// 輔助函式：逸出 HTML 避免 XSS
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 簡易 Toast 提示
function showAdminToast(msg, type = 'success') {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white font-medium text-xs sm:text-sm transition-opacity duration-300 pointer-events-none';
        document.body.appendChild(toast);
    }
    toast.style.backgroundColor = type === 'success' ? '#059669' : '#dc2626';
    toast.innerHTML = `<div class="flex items-center gap-2"><span>${type === 'success' ? '✅' : '⚠️'}</span><span>${escapeHtml(msg)}</span></div>`;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3200);
}

// 通用後端請求包裝
async function adminFetch(url, options = {}) {
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.status === 'error') {
            throw new Error(data.message || `請求失敗 (${res.status})`);
        }
        return data;
    } catch (err) {
        showAdminToast(err.message, 'error');
        throw err;
    }
}

// ==========================================
// 1. 資料庫狀態與快速身分認證
// ==========================================
async function refreshDbStatus() {
    try {
        const res = await fetch('/api/admin/db-status');
        const data = await res.json();
        if (data.status === 'success') {
            const badge = document.getElementById('dbModeText');
            if (badge) {
                badge.innerHTML = `<strong>${escapeHtml(data.engine)}</strong> <span class="text-[10px] text-slate-400">(${data.table_counts.users || 0}帳號 / ${data.table_counts.course_map || 0}課程 / ${data.table_counts.audit_logs || 0}日誌)</span>`;
            }
            const statUsers = document.getElementById('statUsers');
            if (statUsers) statUsers.textContent = data.table_counts.users || 0;
            const statDepts = document.getElementById('statDepts');
            if (statDepts) statDepts.textContent = data.table_counts.departments || 0;
            const statCourses = document.getElementById('statCourses');
            if (statCourses) statCourses.textContent = data.table_counts.course_map || 0;
            const statAudit = document.getElementById('statAuditCount');
            if (statAudit) statAudit.textContent = data.table_counts.audit_logs || 0;
            const statGradReqs = document.getElementById('statGradReqs');
            if (statGradReqs) statGradReqs.textContent = data.table_counts.graduation_requirements || 0;
            const statCategories = document.getElementById('statCategories');
            if (statCategories) statCategories.textContent = data.table_counts.knowledge_categories || 0;
            const statSynonyms = document.getElementById('statSynonyms');
            if (statSynonyms) statSynonyms.textContent = data.table_counts.synonym_dictionary || 0;
            const statUnmatched = document.getElementById('statUnmatched');
            if (statUnmatched) statUnmatched.textContent = data.table_counts.unmatched_queries || 0;

            const uBadge = document.getElementById('usersCountBadge');
            if (uBadge) uBadge.textContent = data.table_counts.users || 0;
            const dBadge = document.getElementById('deptCountBadge');
            if (dBadge) dBadge.textContent = data.table_counts.departments || 0;
            const cBadge = document.getElementById('courseCountBadge');
            if (cBadge) cBadge.textContent = data.table_counts.course_map || 0;
            const gBadge = document.getElementById('gradReqCountBadge');
            if (gBadge) gBadge.textContent = data.table_counts.graduation_requirements || 0;
            const catBadge = document.getElementById('catCountBadge');
            if (catBadge) catBadge.textContent = data.table_counts.knowledge_categories || 0;
            const sBadge = document.getElementById('synonymCountBadge');
            if (sBadge) sBadge.textContent = data.table_counts.synonym_dictionary || 0;
            const aBadge = document.getElementById('auditCountBadge');
            if (aBadge) aBadge.textContent = data.table_counts.audit_logs || 0;
            const umBadge = document.getElementById('unmatchedBadge');
            if (umBadge) umBadge.textContent = data.table_counts.unmatched_queries || 0;
        }
    } catch (e) {
        console.warn('DB 狀態取得失敗:', e);
    }
}

// 一鍵以超級管理員身分就緒
async function quickLoginAsAdmin() {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const data = await res.json();
        if (data.status === 'success') {
            showAdminToast('已成功切換為超級管理員身分', 'success');
            const idBadge = document.getElementById('adminIdentityBadge');
            if (idBadge) idBadge.textContent = '系統超級管理員 (管理員)';
            loadAllCoreAdminData();
        } else {
            showAdminToast(data.message || '登入失敗', 'error');
        }
    } catch (e) {
        showAdminToast(e.message, 'error');
    }
}

// ==========================================
// 2. 系統帳號與權限 (users)
// ==========================================
async function loadUsers() {
    const role = document.getElementById('filterUserRole')?.value || '';
    const search = document.getElementById('filterUserSearch')?.value || '';
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">載入帳號資料中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (role) params.set('role', role);
        if (search) params.set('search', search);

        const res = await adminFetch(`/api/admin/users?${params.toString()}`);
        coreDataCache.users = res.data || [];
        const countSpan = document.getElementById('usersCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.users.length;

        if (coreDataCache.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">查無符合條件的使用者帳號</td></tr>';
            return;
        }

        tbody.innerHTML = coreDataCache.users.map(u => {
            const roleColors = {
                '管理員': 'bg-rose-100 text-rose-800 border-rose-300',
                '老師': 'bg-indigo-100 text-indigo-800 border-indigo-300',
                '教職員': 'bg-amber-100 text-amber-800 border-amber-300',
                '學生': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                '家長': 'bg-sky-100 text-sky-800 border-sky-300'
            };
            const roleBadge = `<span class="px-2 py-0.5 rounded text-xs border font-medium ${roleColors[u.role] || 'bg-slate-100 text-slate-700'}">${escapeHtml(u.role)}</span>`;
            const dormBadge = u.can_manage_dorm ? '<span class="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded border border-purple-200">宿舍管理權限</span>' : '<span class="text-slate-300">—</span>';
            const extraInfo = u.advised_class ? `<span class="text-indigo-700 font-medium">導師：${escapeHtml(u.advised_class)}</span>` : (u.student_id ? `<span class="text-emerald-700 font-mono">${escapeHtml(u.student_id)}${u.class_name ? ` (${escapeHtml(u.class_name)})` : ''}</span>` : '<span class="text-slate-300">—</span>');

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono text-slate-500">${u.user_id}</td>
                    <td class="p-3 font-bold text-slate-900">${escapeHtml(u.username)}</td>
                    <td class="p-3 text-slate-800 font-medium">${escapeHtml(u.full_name)}</td>
                    <td class="p-3">${roleBadge}</td>
                    <td class="p-3 text-xs">${extraInfo}</td>
                    <td class="p-3 text-xs">${dormBadge}</td>
                    <td class="p-3 text-xs text-slate-400 font-mono">${escapeHtml(String(u.created_at || '').substring(0, 16))}</td>
                    <td class="p-3 text-center space-x-1 whitespace-nowrap">
                        <button onclick="openUserModal('edit', ${u.user_id})" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                        <button onclick="deleteUser(${u.user_id}, '${escapeHtml(u.username)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function openUserModal(mode, id = null) {
    const modal = document.getElementById('userModal');
    if (!modal) return;
    const title = document.getElementById('userModalTitle');
    document.getElementById('userForm').reset();
    document.getElementById('mUserId').value = '';

    if (mode === 'add') {
        title.textContent = '新增系統使用者帳號';
        document.getElementById('mUsername').readOnly = false;
        document.getElementById('mUsername').classList.remove('bg-slate-100');
        document.getElementById('mPasswordHint').textContent = '預設密碼：123456';
    } else {
        const u = coreDataCache.users.find(x => x.user_id === id);
        if (!u) return;
        title.textContent = `編輯使用者：${u.username}`;
        document.getElementById('mUserId').value = u.user_id;
        document.getElementById('mUsername').value = u.username;
        document.getElementById('mUsername').readOnly = true;
        document.getElementById('mUsername').classList.add('bg-slate-100');
        document.getElementById('mFullName').value = u.full_name;
        document.getElementById('mRole').value = u.role;
        document.getElementById('mStudentId').value = u.student_id || '';
        document.getElementById('mAdvisedClass').value = u.advised_class || '';
        document.getElementById('mCanManageDorm').checked = Boolean(u.can_manage_dorm);
        document.getElementById('mPasswordHint').textContent = '留空表示維持原密碼不變更';
    }
    modal.classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('userModal')?.classList.add('hidden');
}

async function saveUser(e) {
    e.preventDefault();
    const id = document.getElementById('mUserId').value;
    const payload = {
        username: document.getElementById('mUsername').value.trim(),
        full_name: document.getElementById('mFullName').value.trim(),
        role: document.getElementById('mRole').value,
        student_id: document.getElementById('mStudentId').value.trim() || null,
        advised_class: document.getElementById('mAdvisedClass').value.trim() || null,
        can_manage_dorm: document.getElementById('mCanManageDorm').checked
    };
    const password = document.getElementById('mPassword').value.trim();
    if (password) payload.password = password;

    try {
        if (id) {
            await adminFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAdminToast(`使用者「${payload.username}」資料已成功更新`);
        } else {
            await adminFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
            showAdminToast(`已成功建立新使用者「${payload.username}」`);
        }
        closeUserModal();
        loadUsers();
        refreshDbStatus();
    } catch (e) {
        // error handled by adminFetch
    }
}

async function deleteUser(id, username) {
    if (!confirm(`確定要刪除使用者「${username}」？\n此動作將留下不可復原的系統稽核日誌。`)) return;
    try {
        await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        showAdminToast(`使用者「${username}」已刪除`);
        loadUsers();
        refreshDbStatus();
    } catch (e) { }
}

// ==========================================
// 3. 科系與學院架構 (departments)
// ==========================================
async function loadDepartments() {
    const tbody = document.getElementById('deptTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-400">載入科系架構中...</td></tr>';
    try {
        const res = await adminFetch('/api/admin/departments');
        coreDataCache.departments = res.data || [];
        const countSpan = document.getElementById('deptCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.departments.length;

        // 同步更新其他下拉選單的科系選項
        updateDeptDropdownOptions(coreDataCache.departments);

        tbody.innerHTML = coreDataCache.departments.map(d => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3 font-mono font-bold text-ukn-800 text-sm">${escapeHtml(d.dept_id)}</td>
                <td class="p-3 font-bold text-slate-900">${escapeHtml(d.dept_name)}</td>
                <td class="p-3"><span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">${escapeHtml(d.college_name)}</span></td>
                <td class="p-3 font-mono text-emerald-700">${d.student_count || 0} 位學生</td>
                <td class="p-3 font-mono text-indigo-700">${d.course_count || 0} 門課程</td>
                <td class="p-3 text-center space-x-1 whitespace-nowrap">
                    <button onclick="openDeptModal('edit', '${d.dept_id}')" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                    <button onclick="deleteDepartment('${d.dept_id}', '${escapeHtml(d.dept_name)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function updateDeptDropdownOptions(depts) {
    const selectors = ['filterCourseDept', 'mCourseDept', 'mGradDept'];
    selectors.forEach(sId => {
        const el = document.getElementById(sId);
        if (!el) return;
        const currentVal = el.value;
        const isFilter = sId.startsWith('filter');
        el.innerHTML = isFilter ? '<option value="">全校所有科系</option>' : '';
        depts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.dept_id;
            opt.textContent = `${d.dept_name} (${d.dept_id}) · ${d.college_name}`;
            el.appendChild(opt);
        });
        if (currentVal) el.value = currentVal;
    });
}

function openDeptModal(mode, deptId = null) {
    const modal = document.getElementById('deptModal');
    if (!modal) return;
    const title = document.getElementById('deptModalTitle');
    document.getElementById('deptForm').reset();
    document.getElementById('mDeptIdOriginal').value = '';

    if (mode === 'add') {
        title.textContent = '新增組織科系主檔代碼';
        document.getElementById('mDeptId').readOnly = false;
        document.getElementById('mDeptId').classList.remove('bg-slate-100');
    } else {
        const d = coreDataCache.departments.find(x => x.dept_id === deptId);
        if (!d) return;
        title.textContent = `編輯科系：${d.dept_name} (${d.dept_id})`;
        document.getElementById('mDeptIdOriginal').value = d.dept_id;
        document.getElementById('mDeptId').value = d.dept_id;
        document.getElementById('mDeptId').readOnly = true;
        document.getElementById('mDeptId').classList.add('bg-slate-100');
        document.getElementById('mDeptName').value = d.dept_name;
        document.getElementById('mCollegeName').value = d.college_name;
    }
    modal.classList.remove('hidden');
}

function closeDeptModal() {
    document.getElementById('deptModal')?.classList.add('hidden');
}

async function saveDepartment(e) {
    e.preventDefault();
    const origId = document.getElementById('mDeptIdOriginal').value;
    const deptId = document.getElementById('mDeptId').value.trim().toUpperCase();
    const payload = {
        dept_id: deptId,
        dept_name: document.getElementById('mDeptName').value.trim(),
        college_name: document.getElementById('mCollegeName').value.trim()
    };

    try {
        if (origId) {
            await adminFetch(`/api/admin/departments/${origId}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAdminToast(`科系「${payload.dept_name}」資訊已更新`);
        } else {
            await adminFetch('/api/admin/departments', { method: 'POST', body: JSON.stringify(payload) });
            showAdminToast(`已成功新增科系「${payload.dept_name}」(${deptId})`);
        }
        closeDeptModal();
        loadDepartments();
        refreshDbStatus();
    } catch (e) { }
}

async function deleteDepartment(deptId, deptName) {
    if (!confirm(`確定要刪除科系「${deptName}」(${deptId})？\n若有學生學籍或課程綁定此科系將被系統安全防護擋下。`)) return;
    try {
        await adminFetch(`/api/admin/departments/${deptId}`, { method: 'DELETE' });
        showAdminToast(`科系「${deptName}」已成功刪除`);
        loadDepartments();
        refreshDbStatus();
    } catch (e) { }
}

// ==========================================
// 4. 全校課程地圖與先修擋修 (course_map)
// ==========================================
async function loadCourseMap() {
    const dept = document.getElementById('filterCourseDept')?.value || '';
    const type = document.getElementById('filterCourseType')?.value || '';
    const search = document.getElementById('filterCourseSearch')?.value || '';
    const tbody = document.getElementById('courseTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">載入全校課程地圖中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (dept) params.set('dept_id', dept);
        if (type) params.set('course_type', type);
        if (search) params.set('search', search);

        const res = await adminFetch(`/api/admin/course-map?${params.toString()}`);
        coreDataCache.courses = res.data || [];
        const countSpan = document.getElementById('courseCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.courses.length;

        if (coreDataCache.courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">查無符合條件的課程</td></tr>';
            return;
        }

        tbody.innerHTML = coreDataCache.courses.map(c => {
            const prereqBadge = c.prerequisite_id ? `
                <div class="flex items-center gap-1.5">
                    <span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-300">擋修先決</span>
                    <span class="font-medium text-slate-800 text-xs">${escapeHtml(c.prerequisite_name || c.prerequisite_id)} (${escapeHtml(c.prerequisite_id)})</span>
                </div>
            ` : '<span class="text-slate-300">無先修擋修</span>';

            const typePill = c.is_required
                ? `<span class="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-xs">${escapeHtml(c.course_type)} (必修)</span>`
                : `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">${escapeHtml(c.course_type)} (選修)</span>`;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono font-bold text-ukn-800">${escapeHtml(c.course_id)}</td>
                    <td class="p-3">
                        <div class="font-bold text-slate-900">${escapeHtml(c.course_name)}</div>
                        ${c.description ? `<div class="text-[11px] text-slate-500 line-clamp-1 max-w-xs">${escapeHtml(c.description)}</div>` : ''}
                    </td>
                    <td class="p-3 text-xs font-mono font-bold text-slate-800">${c.credits} 學分 / ${c.semester_hours || c.credits} 時</td>
                    <td class="p-3 text-xs">${typePill}</td>
                    <td class="p-3 text-xs"><span class="font-medium text-slate-700">${escapeHtml(c.dept_name || c.dept_id)}</span></td>
                    <td class="p-3 text-xs font-medium text-slate-600">${escapeHtml(c.semester_suggest || '—')}</td>
                    <td class="p-3 text-xs">${prereqBadge}</td>
                    <td class="p-3 text-center space-x-1 whitespace-nowrap">
                        <button onclick="openCourseModal('edit', '${c.course_id}')" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                        <button onclick="deleteCourse('${c.course_id}', '${escapeHtml(c.course_name)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function openCourseModal(mode, courseId = null) {
    const modal = document.getElementById('courseModal');
    if (!modal) return;
    const title = document.getElementById('courseModalTitle');
    document.getElementById('courseForm').reset();
    document.getElementById('mCourseIdOriginal').value = '';

    // 更新先修課程下拉選單
    const prereqSelect = document.getElementById('mCoursePrereq');
    prereqSelect.innerHTML = '<option value="">(無先修科目，不設擋修限制)</option>';
    coreDataCache.courses.forEach(c => {
        if (mode === 'edit' && c.course_id === courseId) return; // 不能先修自己
        const opt = document.createElement('option');
        opt.value = c.course_id;
        opt.textContent = `${c.course_name} (${c.course_id}) · ${c.credits}學分`;
        prereqSelect.appendChild(opt);
    });

    if (mode === 'add') {
        title.textContent = '新增全校課程與擋修機制';
        document.getElementById('mCourseId').readOnly = false;
        document.getElementById('mCourseId').classList.remove('bg-slate-100');
    } else {
        const c = coreDataCache.courses.find(x => x.course_id === courseId);
        if (!c) return;
        title.textContent = `編輯課程：${c.course_name} (${c.course_id})`;
        document.getElementById('mCourseIdOriginal').value = c.course_id;
        document.getElementById('mCourseId').value = c.course_id;
        document.getElementById('mCourseId').readOnly = true;
        document.getElementById('mCourseId').classList.add('bg-slate-100');
        document.getElementById('mCourseName').value = c.course_name;
        document.getElementById('mCourseCredits').value = c.credits;
        document.getElementById('mCourseHours').value = c.semester_hours || c.credits;
        document.getElementById('mCourseDept').value = c.dept_id;
        document.getElementById('mCourseType').value = c.course_type;
        document.getElementById('mCourseIsRequired').value = c.is_required ? '1' : '0';
        document.getElementById('mCourseSemester').value = c.semester_suggest || '大一上';
        document.getElementById('mCoursePrereq').value = c.prerequisite_id || '';
        document.getElementById('mCourseDesc').value = c.description || '';
    }
    modal.classList.remove('hidden');
}

function closeCourseModal() {
    document.getElementById('courseModal')?.classList.add('hidden');
}

async function saveCourse(e) {
    e.preventDefault();
    const origId = document.getElementById('mCourseIdOriginal').value;
    const courseId = document.getElementById('mCourseId').value.trim().toUpperCase();
    const payload = {
        course_id: courseId,
        course_name: document.getElementById('mCourseName').value.trim(),
        credits: parseInt(document.getElementById('mCourseCredits').value, 10),
        semester_hours: parseFloat(document.getElementById('mCourseHours').value),
        dept_id: document.getElementById('mCourseDept').value,
        course_type: document.getElementById('mCourseType').value,
        is_required: document.getElementById('mCourseIsRequired').value === '1',
        semester_suggest: document.getElementById('mCourseSemester').value.trim(),
        prerequisite_id: document.getElementById('mCoursePrereq').value.trim() || null,
        description: document.getElementById('mCourseDesc').value.trim() || null
    };

    try {
        if (origId) {
            await adminFetch(`/api/admin/course-map/${origId}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAdminToast(`課程「${payload.course_name}」已更新`);
        } else {
            await adminFetch('/api/admin/course-map', { method: 'POST', body: JSON.stringify(payload) });
            showAdminToast(`已成功新增課程「${payload.course_name}」(${courseId})`);
        }
        closeCourseModal();
        loadCourseMap();
        refreshDbStatus();
    } catch (e) { }
}

async function deleteCourse(courseId, courseName) {
    if (!confirm(`確定要刪除課程「${courseName}」(${courseId})？\n若其他課程將此課程設為先修科目將被系統防護擋下。`)) return;
    try {
        await adminFetch(`/api/admin/course-map/${courseId}`, { method: 'DELETE' });
        showAdminToast(`課程「${courseName}」已成功刪除`);
        loadCourseMap();
        refreshDbStatus();
    } catch (e) { }
}

// ==========================================
// 5. 各系畢業門檻 (graduation_requirements)
// ==========================================
async function loadGraduationRequirements() {
    const tbody = document.getElementById('gradReqTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-slate-400">載入各系畢業門檻中...</td></tr>';
    try {
        const res = await adminFetch('/api/admin/graduation-requirements');
        coreDataCache.gradReqs = res.data || [];
        const countSpan = document.getElementById('gradReqCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.gradReqs.length;

        tbody.innerHTML = coreDataCache.gradReqs.map(g => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3">
                    <div class="font-bold text-slate-900">${escapeHtml(g.dept_name || g.dept_id)}</div>
                    <div class="text-[11px] font-mono text-ukn-700">${escapeHtml(g.dept_id)} · ${escapeHtml(g.college_name || '')}</div>
                </td>
                <td class="p-3 font-mono font-bold text-emerald-800 text-sm">${g.total_credits_req} 學分</td>
                <td class="p-3 font-mono text-slate-700 text-xs">${g.major_required_req} 學分</td>
                <td class="p-3 font-mono text-slate-700 text-xs">${g.major_elective_req} 學分</td>
                <td class="p-3 font-mono text-slate-700 text-xs">${g.general_req} 學分</td>
                <td class="p-3 text-xs">
                    <span class="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-medium">${escapeHtml(g.english_threshold_name)}</span>
                </td>
                <td class="p-3 font-mono text-xs text-slate-600">${g.ethics_req} 學分</td>
                <td class="p-3 font-mono text-xs text-slate-600">${g.project_req} 學分</td>
                <td class="p-3 text-center space-x-1 whitespace-nowrap">
                    <button onclick="openGradReqModal('edit', ${g.req_id})" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                    <button onclick="deleteGradReq(${g.req_id}, '${escapeHtml(g.dept_id)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function openGradReqModal(mode, reqId = null) {
    const modal = document.getElementById('gradReqModal');
    if (!modal) return;
    const title = document.getElementById('gradReqModalTitle');
    document.getElementById('gradReqForm').reset();
    document.getElementById('mReqId').value = '';

    if (mode === 'add') {
        title.textContent = '設定系所畢業學分與證照門檻';
        document.getElementById('mGradDept').disabled = false;
    } else {
        const g = coreDataCache.gradReqs.find(x => x.req_id === reqId);
        if (!g) return;
        title.textContent = `編輯畢業門檻：${g.dept_name || g.dept_id}`;
        document.getElementById('mReqId').value = g.req_id;
        document.getElementById('mGradDept').value = g.dept_id;
        document.getElementById('mGradDept').disabled = true;
        document.getElementById('mTotalCreditsReq').value = g.total_credits_req;
        document.getElementById('mMajorReq').value = g.major_required_req;
        document.getElementById('mMajorElec').value = g.major_elective_req;
        document.getElementById('mGeneralReq').value = g.general_req;
        document.getElementById('mEnglishThreshold').value = g.english_threshold_name;
        document.getElementById('mEthicsReq').value = g.ethics_req;
        document.getElementById('mProjectReq').value = g.project_req;
    }
    modal.classList.remove('hidden');
}

function closeGradReqModal() {
    document.getElementById('gradReqModal')?.classList.add('hidden');
}

async function saveGradReq(e) {
    e.preventDefault();
    const id = document.getElementById('mReqId').value;
    const payload = {
        dept_id: document.getElementById('mGradDept').value,
        total_credits_req: parseInt(document.getElementById('mTotalCreditsReq').value, 10),
        major_required_req: parseInt(document.getElementById('mMajorReq').value, 10),
        major_elective_req: parseInt(document.getElementById('mMajorElec').value, 10),
        general_req: parseInt(document.getElementById('mGeneralReq').value, 10),
        english_threshold_name: document.getElementById('mEnglishThreshold').value.trim(),
        ethics_req: parseInt(document.getElementById('mEthicsReq').value, 10),
        project_req: parseInt(document.getElementById('mProjectReq').value, 10)
    };

    try {
        if (id) {
            await adminFetch(`/api/admin/graduation-requirements/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAdminToast(`科系「${payload.dept_id}」畢業門檻已更新`);
        } else {
            await adminFetch('/api/admin/graduation-requirements', { method: 'POST', body: JSON.stringify(payload) });
            showAdminToast(`已成功設定科系「${payload.dept_id}」畢業門檻`);
        }
        closeGradReqModal();
        loadGraduationRequirements();
        refreshDbStatus();
    } catch (e) { }
}

async function deleteGradReq(reqId, deptId) {
    if (!confirm(`確定要刪除科系「${deptId}」的畢業門檻標準？`)) return;
    try {
        await adminFetch(`/api/admin/graduation-requirements/${reqId}`, { method: 'DELETE' });
        showAdminToast(`科系「${deptId}」畢業門檻已刪除`);
        loadGraduationRequirements();
        refreshDbStatus();
    } catch (e) { }
}

// ==========================================
// 6. 知識庫主分類、總目錄 (knowledge_categories)
// ==========================================
async function loadKnowledgeCategories() {
    const tbody = document.getElementById('catTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-400">載入知識庫大類中...</td></tr>';
    try {
        const res = await adminFetch('/api/admin/knowledge-categories');
        coreDataCache.categories = res.data || [];
        const countSpan = document.getElementById('catCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.categories.length;

        // 同步更新同義詞與規章的新增下拉選單
        updateCategoryDropdowns(coreDataCache.categories);

        tbody.innerHTML = coreDataCache.categories.map(c => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3 font-mono text-slate-500">${c.category_id}</td>
                <td class="p-3 text-2xl text-center w-12">${escapeHtml(c.icon || '📖')}</td>
                <td class="p-3 font-bold text-slate-900">${escapeHtml(c.category_name)}</td>
                <td class="p-3 font-mono font-semibold text-slate-700">${c.sort_order}</td>
                <td class="p-3 text-xs">
                    <span class="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-mono font-medium">${c.article_count || 0} 篇規章</span>
                    <span class="text-slate-400 text-[10px] ml-1">(${c.synonym_count || 0} 同義詞)</span>
                </td>
                <td class="p-3 text-center space-x-1 whitespace-nowrap">
                    <button onclick="openCategoryModal('edit', ${c.category_id})" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                    <button onclick="deleteCategory(${c.category_id}, '${escapeHtml(c.category_name)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function updateCategoryDropdowns(cats) {
    const selects = ['mCategory', 'mSynCategory', 'convCategory'];
    selects.forEach(sId => {
        const el = document.getElementById(sId);
        if (!el) return;
        const currentVal = el.value;
        el.innerHTML = '<option value="">(未分類)</option>';
        cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.category_id;
            opt.textContent = `${c.icon || '📖'} ${c.category_name}`;
            el.appendChild(opt);
        });
        if (currentVal) el.value = currentVal;
    });
}

function openCategoryModal(mode, catId = null) {
    const modal = document.getElementById('categoryModal');
    if (!modal) return;
    const title = document.getElementById('categoryModalTitle');
    document.getElementById('categoryForm').reset();
    document.getElementById('mCategoryId').value = '';

    if (mode === 'add') {
        title.textContent = '新增知識庫最頂層主分類';
        document.getElementById('mCatSort').value = coreDataCache.categories.length + 1;
    } else {
        const c = coreDataCache.categories.find(x => x.category_id === catId);
        if (!c) return;
        title.textContent = `編輯主分類：${c.category_name}`;
        document.getElementById('mCategoryId').value = c.category_id;
        document.getElementById('mCatName').value = c.category_name;
        document.getElementById('mCatIcon').value = c.icon || '📖';
        document.getElementById('mCatSort').value = c.sort_order;
    }
    modal.classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('categoryModal')?.classList.add('hidden');
}

async function saveCategory(e) {
    e.preventDefault();
    const id = document.getElementById('mCategoryId').value;
    const payload = {
        category_name: document.getElementById('mCatName').value.trim(),
        icon: document.getElementById('mCatIcon').value.trim() || '📖',
        sort_order: parseInt(document.getElementById('mCatSort').value, 10)
    };

    try {
        if (id) {
            await adminFetch(`/api/admin/knowledge-categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAdminToast(`主分類「${payload.category_name}」已更新`);
        } else {
            await adminFetch('/api/admin/knowledge-categories', { method: 'POST', body: JSON.stringify(payload) });
            showAdminToast(`已成功新增主分類「${payload.category_name}」`);
        }
        closeCategoryModal();
        loadKnowledgeCategories();
        refreshDbStatus();
    } catch (e) { }
}

async function deleteCategory(catId, catName) {
    if (!confirm(`確定要刪除主分類「${catName}」？\n若分類下仍有條文將無法刪除。`)) return;
    try {
        await adminFetch(`/api/admin/knowledge-categories/${catId}`, { method: 'DELETE' });
        showAdminToast(`主分類「${catName}」已刪除`);
        loadKnowledgeCategories();
        refreshDbStatus();
    } catch (e) { }
}

// ==========================================
// 7. 搜尋同義詞字典 (synonym_dictionary)
// ==========================================
async function loadAdminSynonyms() {
    const search = document.getElementById('filterSynonymSearch')?.value || '';
    const tbody = document.getElementById('synonymTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-400">載入同義詞對照庫中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);

        const res = await adminFetch(`/api/admin/synonyms?${params.toString()}`);
        coreDataCache.synonyms = res.data || [];
        const countSpan = document.getElementById('synonymCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.synonyms.length;

        tbody.innerHTML = coreDataCache.synonyms.map(s => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3 font-mono text-slate-500">${s.synonym_id}</td>
                <td class="p-3 font-bold text-slate-900">
                    <span class="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">${escapeHtml(s.user_keyword)}</span>
                </td>
                <td class="p-3 font-bold text-ukn-800 flex items-center gap-1.5">
                    <span class="text-slate-400 font-normal">→</span>
                    <span class="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">${escapeHtml(s.official_term)}</span>
                </td>
                <td class="p-3 text-xs text-slate-600">
                    ${s.category_name ? `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">${escapeHtml(s.icon || '')} ${escapeHtml(s.category_name)}</span>` : '<span class="text-slate-400">全站通用</span>'}
                </td>
                <td class="p-3 text-center space-x-1 whitespace-nowrap">
                    <button onclick="openSynonymModal('edit', ${s.synonym_id})" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                    <button onclick="deleteSynonym(${s.synonym_id}, '${escapeHtml(s.user_keyword)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function openSynonymModal(mode = 'add', synId = null) {
    const modal = document.getElementById('synonymModal');
    if (!modal) return;
    const title = document.getElementById('synonymModalTitle');
    document.getElementById('synonymForm').reset();
    document.getElementById('mSynId').value = '';

    if (mode === 'add') {
        title.textContent = '新增學生日常俗稱與法規條文同義詞對照';
    } else {
        const s = coreDataCache.synonyms.find(x => x.synonym_id === synId);
        if (!s) return;
        title.textContent = `編輯同義詞：${s.user_keyword} → ${s.official_term}`;
        document.getElementById('mSynId').value = s.synonym_id;
        document.getElementById('mSynUserKeyword').value = s.user_keyword;
        document.getElementById('mSynOfficialTerm').value = s.official_term;
        document.getElementById('mSynCategory').value = s.category_id || '';
    }
    modal.classList.remove('hidden');
}

function closeSynonymModal() {
    document.getElementById('synonymModal')?.classList.add('hidden');
}

async function saveSynonym(e) {
    e.preventDefault();
    const id = document.getElementById('mSynId').value;
    const payload = {
        user_keyword: document.getElementById('mSynUserKeyword').value.trim(),
        official_term: document.getElementById('mSynOfficialTerm').value.trim(),
        category_id: document.getElementById('mSynCategory').value || null
    };

    try {
        if (id) {
            await adminFetch(`/api/admin/synonyms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAdminToast(`同義詞「${payload.user_keyword}」已更新`);
        } else {
            await adminFetch('/api/admin/synonyms', { method: 'POST', body: JSON.stringify(payload) });
            showAdminToast(`已成功新增同義詞「${payload.user_keyword}」→「${payload.official_term}」`);
        }
        closeSynonymModal();
        loadAdminSynonyms();
        refreshDbStatus();
    } catch (e) { }
}

async function deleteSynonym(synId, keyword) {
    if (!confirm(`確定要刪除同義詞「${keyword}」？`)) return;
    try {
        await adminFetch(`/api/admin/synonyms/${synId}`, { method: 'DELETE' });
        showAdminToast(`同義詞「${keyword}」已刪除`);
        loadAdminSynonyms();
        refreshDbStatus();
    } catch (e) { }
}

// ==========================================
// 8. 系統稽核日誌 (audit_logs - 檢視異動與防竄改 Diff)
// ==========================================
async function loadAuditLogs() {
    const tableFilter = document.getElementById('filterAuditTable')?.value || '';
    const actionFilter = document.getElementById('filterAuditAction')?.value || '';
    const changedBy = document.getElementById('filterAuditUser')?.value || '';
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">載入系統稽核異動紀錄中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (tableFilter) params.set('table_name', tableFilter);
        if (actionFilter) params.set('action', actionFilter);
        if (changedBy) params.set('changed_by', changedBy);

        const res = await adminFetch(`/api/admin/audit-logs?${params.toString()}`);
        coreDataCache.auditLogs = res.data || [];
        const countSpan = document.getElementById('auditCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.auditLogs.length;

        if (coreDataCache.auditLogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">目前尚無符合條件的稽核紀錄</td></tr>';
            return;
        }

        tbody.innerHTML = coreDataCache.auditLogs.map(log => {
            const actionColors = {
                'INSERT': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                'UPDATE': 'bg-sky-100 text-sky-800 border-sky-300',
                'DELETE': 'bg-rose-100 text-rose-800 border-rose-300'
            };
            const actionBadge = `<span class="px-2 py-0.5 rounded text-xs border font-bold ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}">${escapeHtml(log.action)}</span>`;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono text-slate-500 text-xs">${log.log_id}</td>
                    <td class="p-3 font-mono font-bold text-slate-900 text-xs">${escapeHtml(log.table_name)}</td>
                    <td class="p-3 font-mono text-xs text-indigo-700">${escapeHtml(log.record_id)}</td>
                    <td class="p-3">${actionBadge}</td>
                    <td class="p-3 text-xs">
                        <div class="font-bold text-slate-900">${escapeHtml(log.changed_by)}</div>
                        <div class="text-[10px] text-slate-400">${escapeHtml(log.changed_by_role || '')}</div>
                    </td>
                    <td class="p-3 font-mono text-xs text-slate-500">${escapeHtml(log.ip_address || '127.0.0.1')}</td>
                    <td class="p-3 font-mono text-xs text-slate-400">${escapeHtml(String(log.changed_at || ''))}</td>
                    <td class="p-3 text-center">
                        <button onclick="showAuditDiffModal(${log.log_id})" class="bg-slate-800 hover:bg-slate-900 text-white text-xs px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                            檢視 Diff 差異
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function showAuditDiffModal(logId) {
    const log = coreDataCache.auditLogs.find(x => x.log_id === logId);
    if (!log) return;
    const modal = document.getElementById('auditDiffModal');
    if (!modal) return;

    document.getElementById('diffModalTitle').textContent = `稽核紀錄 #${log.log_id} · 表：${log.table_name} (鍵：${log.record_id})`;
    document.getElementById('diffMetaInfo').innerHTML = `
        <strong>動作：</strong>${escapeHtml(log.action)} · 
        <strong>操作者：</strong>${escapeHtml(log.changed_by)} (${escapeHtml(log.changed_by_role)}) · 
        <strong>時間：</strong>${escapeHtml(log.changed_at)} · 
        <strong>來源 IP：</strong>${escapeHtml(log.ip_address || '127.0.0.1')}
    `;

    const beforeBox = document.getElementById('diffBeforeJson');
    const afterBox = document.getElementById('diffAfterJson');
    beforeBox.textContent = log.before_json ? JSON.stringify(log.before_json, null, 2) : '(無前版資料 / 新增建置)';
    afterBox.textContent = log.after_json ? JSON.stringify(log.after_json, null, 2) : '(已被永久刪除)';

    modal.classList.remove('hidden');
}

function closeAuditDiffModal() {
    document.getElementById('auditDiffModal')?.classList.add('hidden');
}

// ==========================================
// 9. 全校搜尋日誌與效能 (search_logs)
// ==========================================
async function loadSearchLogs() {
    const search = document.getElementById('filterSearchLogsText')?.value || '';
    const tbody = document.getElementById('searchLogsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-slate-400">載入全校搜尋日誌中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);

        const res = await adminFetch(`/api/admin/search-logs?${params.toString()}`);
        coreDataCache.searchLogs = res.data || [];
        const stats = res.stats || {};

        document.getElementById('statSearchTotal').textContent = stats.total_searches || 0;
        document.getElementById('statSearchMatched').textContent = stats.matched_count || 0;
        document.getElementById('statSearchUnmatched').textContent = stats.unmatched_count || 0;
        document.getElementById('statSearchMatchRate').textContent = `${stats.match_rate || 0}%`;

        // 熱搜榜
        const topBox = document.getElementById('topSearchQueriesBox');
        if (topBox && stats.top_queries) {
            topBox.innerHTML = stats.top_queries.map((q, idx) => `
                <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span class="flex items-center gap-1.5 font-medium text-slate-800">
                        <span class="w-4 h-4 rounded-full ${idx < 3 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'} text-[10px] flex items-center justify-center font-bold">${idx + 1}</span>
                        ${escapeHtml(q.query)}
                    </span>
                    <span class="font-mono text-slate-500">${q.count} 次</span>
                </div>
            `).join('') || '<div class="text-xs text-slate-400">暫無資料</div>';
        }

        tbody.innerHTML = coreDataCache.searchLogs.map(l => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3 font-mono text-slate-500 text-xs">${l.id}</td>
                <td class="p-3 font-bold text-slate-900">${escapeHtml(l.query)}</td>
                <td class="p-3">
                    ${l.matched
                ? '<span class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-300">成功命中</span>'
                : '<span class="bg-rose-100 text-rose-800 text-xs font-semibold px-2 py-0.5 rounded border border-rose-300">查無結果 (未命中)</span>'}
                </td>
                <td class="p-3 font-mono text-xs text-slate-400">${escapeHtml(String(l.created_at || ''))}</td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

// ==========================================
// 10. 學生歷年成績歷史 (student_credits - 具佐證效力)
// ==========================================
async function loadStudentCredits() {
    const sid = document.getElementById('filterCreditStudentId')?.value || '';
    const sem = document.getElementById('filterCreditSemester')?.value || '';
    const isPassed = document.getElementById('filterCreditPassed')?.value || '';
    const search = document.getElementById('filterCreditSearch')?.value || '';
    const tbody = document.getElementById('creditsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">載入學生歷年成績紀錄中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (sid) params.set('student_id', sid);
        if (sem) params.set('semester', sem);
        if (isPassed !== '') params.set('is_passed', isPassed);
        if (search) params.set('search', search);

        const res = await adminFetch(`/api/admin/student-credits?${params.toString()}`);
        coreDataCache.studentCredits = res.data || [];
        const stats = res.stats || {};

        document.getElementById('statCreditTotal').textContent = stats.total_courses || 0;
        document.getElementById('statCreditPassed').textContent = stats.passed_courses || 0;
        document.getElementById('statCreditFailed').textContent = stats.failed_courses || 0;
        document.getElementById('statCreditPassRate').textContent = `${stats.pass_rate || 0}%`;

        if (coreDataCache.studentCredits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">目前尚無符合條件的學生成績檔案</td></tr>';
            return;
        }

        tbody.innerHTML = coreDataCache.studentCredits.map(c => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3 font-mono font-bold text-ukn-800">${escapeHtml(c.student_id)}</td>
                <td class="p-3">
                    <span class="font-bold text-slate-900">${escapeHtml(c.student_name || '')}</span>
                    <span class="text-xs text-slate-400 ml-1">(${escapeHtml(c.class_name || '')})</span>
                </td>
                <td class="p-3 font-mono text-xs text-slate-600">${escapeHtml(c.course_id)}</td>
                <td class="p-3 font-medium text-slate-900">${escapeHtml(c.course_name || c.course_id)}</td>
                <td class="p-3 font-mono text-xs">${c.credits || 0} 學分</td>
                <td class="p-3 font-mono text-xs text-indigo-700">${escapeHtml(c.semester)}</td>
                <td class="p-3 font-mono font-bold ${c.score >= 60 ? 'text-emerald-700' : 'text-rose-700'}">${c.score !== null ? c.score : '—'}</td>
                <td class="p-3">
                    ${c.is_passed
                ? '<span class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-300">修畢通過</span>'
                : '<span class="bg-rose-100 text-rose-800 text-xs font-semibold px-2 py-0.5 rounded border border-rose-300">未達標當掉</span>'}
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

// ==========================================
// 11. 學生出缺勤歷史紀錄 (attendance_records - 具佐證效力)
// ==========================================
async function loadAttendanceRecordsAudit() {
    const sid = document.getElementById('filterAttStudentId')?.value || '';
    const type = document.getElementById('filterAttType')?.value || '';
    const search = document.getElementById('filterAttSearch')?.value || '';
    const tbody = document.getElementById('attTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">載入出缺勤紀錄中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (sid) params.set('student_id', sid);
        if (type) params.set('type', type);
        if (search) params.set('search', search);

        const res = await adminFetch(`/api/admin/attendance-records?${params.toString()}`);
        coreDataCache.attendance = res.data || [];

        const tc = res.type_counts || {};
        document.getElementById('attStatAbsent').textContent = tc['曠課'] || 0;
        document.getElementById('attStatTardy').textContent = tc['遲到'] || 0;
        document.getElementById('attStatSick').textContent = tc['病假'] || 0;
        document.getElementById('attStatOther').textContent = (tc['事假'] || 0) + (tc['公假'] || 0) + (tc['重大傷病假'] || 0) + (tc['產假'] || 0);

        tbody.innerHTML = coreDataCache.attendance.map(a => {
            const typeColor = a.type === '曠課' ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                : (a.type === '遲到' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-800 border-slate-300');
            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono text-slate-500 text-xs">${a.id}</td>
                    <td class="p-3 font-mono font-bold text-ukn-800">${escapeHtml(a.student_id)}</td>
                    <td class="p-3 text-slate-900 font-medium">${escapeHtml(a.student_name || '')} (${escapeHtml(a.class_name || '')})</td>
                    <td class="p-3 font-mono text-xs text-slate-600">${escapeHtml(a.date)}</td>
                    <td class="p-3 font-medium text-slate-900">${escapeHtml(a.course_name)}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded text-xs border ${typeColor}">${escapeHtml(a.type)}</span></td>
                    <td class="p-3 font-mono text-xs">${a.hours || 1} 節</td>
                    <td class="p-3 text-xs text-slate-500">${a.notified ? '✅ 已寄發預警通知' : '未通知'}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

// ==========================================
// 12. 學生獎懲與幹部履歷 (student_records - 具佐證效力)
// ==========================================
async function loadStudentRecordsAudit() {
    const sid = document.getElementById('filterRecStudentId')?.value || '';
    const kind = document.getElementById('filterRecKind')?.value || '';
    const sem = document.getElementById('filterRecSemester')?.value || '';
    const tbody = document.getElementById('recordsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">載入學生獎懲與幹部檔案中...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (sid) params.set('student_id', sid);
        if (kind) params.set('kind', kind);
        if (sem) params.set('semester', sem);

        const res = await adminFetch(`/api/admin/student-records?${params.toString()}`);
        coreDataCache.studentRecords = res.data || [];
        const stats = res.stats || {};

        document.getElementById('statRecMerits').textContent = stats.merit_count || 0;
        document.getElementById('statRecDemerits').textContent = stats.demerit_count || 0;
        document.getElementById('statRecCadres').textContent = stats.cadre_count || 0;

        tbody.innerHTML = coreDataCache.studentRecords.map(r => {
            const kindBadge = r.kind === '獎懲'
                ? '<span class="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded font-semibold border border-amber-300">學生獎懲</span>'
                : '<span class="bg-indigo-100 text-indigo-900 text-xs px-2 py-0.5 rounded font-semibold border border-indigo-300">班級幹部</span>';

            const itemColor = ['嘉獎', '小功', '大功'].includes(r.item) ? 'text-emerald-700 font-bold'
                : (['申誡', '小過', '大過'].includes(r.item) ? 'text-rose-700 font-bold' : 'text-indigo-800 font-bold');

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono text-slate-500 text-xs">${r.record_id}</td>
                    <td class="p-3 font-mono font-bold text-ukn-800">${escapeHtml(r.student_id)}</td>
                    <td class="p-3 text-slate-900 font-medium">${escapeHtml(r.student_name || '')} (${escapeHtml(r.class_name || '')})</td>
                    <td class="p-3">${kindBadge}</td>
                    <td class="p-3 ${itemColor}">${escapeHtml(r.item)} ${r.count > 1 ? `× ${r.count}` : ''}</td>
                    <td class="p-3 text-xs text-slate-700">${escapeHtml(r.reason || '—')}</td>
                    <td class="p-3 font-mono text-xs text-indigo-700">${escapeHtml(r.semester)}</td>
                    <td class="p-3 font-mono text-xs text-slate-400">${escapeHtml(r.record_date || '—')}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

// ==========================================
// 全局側邊欄與分頁切換分派器
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;
    const isClosed = sidebar.classList.contains('-translate-x-full');
    if (isClosed) {
        sidebar.classList.remove('-translate-x-full');
        if (backdrop) backdrop.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        if (backdrop) backdrop.classList.add('hidden');
    }
}

function filterNavItems(query) {
    const q = (query || '').trim().toLowerCase();
    const groups = document.querySelectorAll('.nav-group');
    groups.forEach(group => {
        const buttons = group.querySelectorAll('.nav-btn');
        let visibleCount = 0;
        buttons.forEach(btn => {
            const text = (btn.textContent || '').toLowerCase();
            if (!q || text.includes(q)) {
                btn.classList.remove('hidden');
                visibleCount++;
            } else {
                btn.classList.add('hidden');
            }
        });
        if (visibleCount === 0 && q) {
            group.classList.add('hidden');
        } else {
            group.classList.remove('hidden');
        }
    });
}

function switchAdminCoreTab(tabName) {
    const allPanels = [
        'dashboard',
        'users', 'departments', 'coursemap', 'gradreqs', 'categories', 'synonyms', 'rules',
        'audit', 'searchlogs', 'unmatched', 'visitors', 'credits', 'attendance_audit', 'records',
        'missed', 'checklists', 'deadlines', 'feedback', 'links', 'calendar', 'attendance', 'scholarwarn', 'campus', 'faculty', 'conduct', 'anniversary', 'selfcheck'
    ];

    allPanels.forEach(p => {
        const panelEl = document.getElementById(`panel-${p}`);
        if (panelEl) panelEl.classList.add('hidden');
        const btnEl = document.getElementById(`tabBtn-${p}`);
        if (btnEl) {
            btnEl.className = 'nav-btn w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-ukn-800 transition';
        }
    });

    const activePanel = document.getElementById(`panel-${tabName}`);
    if (activePanel) activePanel.classList.remove('hidden');

    const activeBtn = document.getElementById(`tabBtn-${tabName}`);
    if (activeBtn) {
        activeBtn.className = 'nav-btn w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg bg-ukn-800 text-white shadow-xs transition';
    }

    // 更新動態麵包屑
    const breadcrumbs = {
        'dashboard': ['總覽中心', '儀表總覽'],
        'departments': ['教務與課程', '科系與學院組織'],
        'coursemap': ['教務與課程', '全校課程與擋修'],
        'gradreqs': ['教務與課程', '各系畢業門檻'],
        'rules': ['教務與課程', '校規法規條文'],
        'calendar': ['教務與課程', '校曆與行事曆'],
        'deadlines': ['教務與課程', '重要申辦日程'],
        'conduct': ['教務與課程', '操行獎懲規則'],
        'users': ['學生與學務', '帳號與身分權限'],
        'credits': ['學生與學務', '學生歷年成績歷史'],
        'attendance_audit': ['學生與學務', '出缺勤審查歷史'],
        'attendance': ['學生與學務', '缺曠登記與通知'],
        'records': ['學生與學務', '學生獎懲與幹部履歷'],
        'scholarwarn': ['學生與學務', '學業不及格預警'],
        'checklists': ['學生與學務', '行政申辦處室'],
        'campus': ['校園與行政', '生活、宿舍與設施借用'],
        'faculty': ['校園與行政', '教師專長與課表'],
        'anniversary': ['校園與行政', '校慶公告與跑馬燈'],
        'links': ['校園與行政', '常用校務外部連結'],
        'feedback': ['校園與行政', '搜尋滿意度回饋'],
        'audit': ['稽核與字典', '系統安全稽核日誌'],
        'searchlogs': ['稽核與字典', '全校搜尋日誌與效能'],
        'unmatched': ['稽核與字典', '學生未匹配詞 (待轉字典)'],
        'missed': ['稽核與字典', '提問未命中分析'],
        'synonyms': ['稽核與字典', '搜尋同義詞字典'],
        'categories': ['稽核與字典', '知識庫主分類目錄'],
        'visitors': ['稽核與字典', '校外訪客登記日誌'],
        'selfcheck': ['稽核與字典', '全站自動功能檢測']
    };
    if (breadcrumbs[tabName]) {
        const catEl = document.getElementById('breadcrumbCategory');
        const pageEl = document.getElementById('breadcrumbPage');
        if (catEl) catEl.textContent = breadcrumbs[tabName][0];
        if (pageEl) pageEl.textContent = breadcrumbs[tabName][1];
    }

    // 行動裝置點選後自動收合選單
    if (window.innerWidth < 1024) {
        const sb = document.getElementById('adminSidebar');
        const bd = document.getElementById('sidebarBackdrop');
        if (sb && !sb.classList.contains('-translate-x-full')) {
            sb.classList.add('-translate-x-full');
            if (bd) bd.classList.add('hidden');
        }
    }

    // 依所切換之分頁即時載入最新資料
    if (tabName === 'dashboard') { refreshDbStatus(); }
    else if (tabName === 'users') loadUsers();
    else if (tabName === 'departments') loadDepartments();
    else if (tabName === 'coursemap') loadCourseMap();
    else if (tabName === 'gradreqs') loadGraduationRequirements();
    else if (tabName === 'categories') loadKnowledgeCategories();
    else if (tabName === 'synonyms') loadAdminSynonyms();
    else if (tabName === 'audit') loadAuditLogs();
    else if (tabName === 'searchlogs') loadSearchLogs();
    else if (tabName === 'unmatched') { if (typeof loadUnmatchedQueries === 'function') loadUnmatchedQueries(); }
    else if (tabName === 'visitors') { if (typeof loadVisitorLogs === 'function') loadVisitorLogs(); }
    else if (tabName === 'credits') loadStudentCredits();
    else if (tabName === 'attendance_audit') loadAttendanceRecordsAudit();
    else if (tabName === 'records') loadStudentRecordsAudit();
    else if (tabName === 'rules') { if (typeof loadRules === 'function') loadRules(); }
    else if (tabName === 'anniversary') { if (typeof loadAnniversary === 'function') loadAnniversary(); }
    else if (tabName === 'faculty') { if (typeof loadFacultyAdmin === 'function') loadFacultyAdmin(); }
    else if (tabName === 'conduct') { if (typeof loadConductRules === 'function') loadConductRules(); }
    else if (tabName === 'campus') { if (typeof loadCampusAdmin === 'function') loadCampusAdmin(); }
    else if (tabName === 'checklists') { if (typeof loadChecklists === 'function') loadChecklists(); }
    else if (tabName === 'deadlines') { if (typeof loadDeadlines === 'function') loadDeadlines(); }
    else if (tabName === 'links') { if (typeof loadLinks === 'function') loadLinks(); }
    else if (tabName === 'calendar') { if (typeof loadCalendarEvents === 'function') loadCalendarEvents(); }
    else if (tabName === 'feedback') { if (typeof loadFeedbackStats === 'function') loadFeedbackStats(); }
}

// 啟動時自動載入核心資料與狀態
async function loadAllCoreAdminData() {
    await refreshDbStatus();
    loadUsers();
    loadDepartments();
    loadCourseMap();
    loadGraduationRequirements();
    loadKnowledgeCategories();
    loadAdminSynonyms();
    loadAuditLogs();
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllCoreAdminData();
});
