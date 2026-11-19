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

// 通用後端請求包裝（含寫入防連點鎖定）
let _adminMutatingInFlight = false;
async function adminFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const isMutating = ['POST', 'PUT', 'DELETE'].includes(method);
    if (isMutating) {
        if (_adminMutatingInFlight) {
            showAdminToast('系統正在處理上一筆變更，請勿重複連點', 'error');
            throw new Error('請求處理中');
        }
        _adminMutatingInFlight = true;
    }
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
        if (err.message !== '請求處理中') {
            showAdminToast(err.message, 'error');
        }
        throw err;
    } finally {
        if (isMutating) {
            _adminMutatingInFlight = false;
        }
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

let currentAdminUser = null;

function isCurrentSysAdmin() {
    return ['管理員', '系統管理員'].includes(currentAdminUser?.role);
}

function applyRolePermissionUI() {
    const idBadge = document.getElementById('adminIdentityBadge');
    if (idBadge) {
        if (!currentAdminUser) {
            idBadge.textContent = '尚未登入管理帳號';
        } else if (isCurrentSysAdmin()) {
            // 系統管理員代表全校系統總後台，不需多餘的處室或重複身分標籤 (移除多餘的「(管理員 · 圖書資訊中心)」)
            idBadge.textContent = currentAdminUser.full_name || '系統管理員';
        } else {
            const officeText = currentAdminUser.office ? ` · ${currentAdminUser.office}` : '';
            idBadge.textContent = `${currentAdminUser.full_name} (${currentAdminUser.role}${officeText})`;
        }
        idBadge.className = 'font-bold text-ukn-900';
    }
}

async function handleAdminLogout() {
    if (!confirm('確定要登出管理系統並返回登入頁面嗎？')) return;
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.warn('登出 API 呼叫失敗:', e);
    }
    window.location.href = '/login';
}

async function switchAdminRoleAccount(targetRole = '系統管理員') {
    openAdminLoginModal();
}

function openAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        const uInput = document.getElementById('adminLoginUsername');
        if (uInput && currentAdminUser?.username) {
            uInput.value = currentAdminUser.username;
        }
        modal.classList.remove('hidden');
    }
}

function closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) modal.classList.add('hidden');
}

async function submitAdminLoginModal(event) {
    event.preventDefault();
    const username = (document.getElementById('adminLoginUsername')?.value || '').trim();
    const password = (document.getElementById('adminLoginPassword')?.value || '').trim();
    if (!username || !password) return;
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
            showAdminToast(data.message || '帳號或密碼錯誤', 'error');
            return;
        }
        if (!['管理員', '系統管理員', '內容管理人員'].includes(data.user?.role)) {
            showAdminToast('此帳號沒有管理後台權限', 'error');
            return;
        }
        currentAdminUser = data.user;
        applyRolePermissionUI();
        closeAdminLoginModal();
        showAdminToast(`已登入：${data.user.full_name} (${data.user.role_display || data.user.role})`, 'success');
        if (isCurrentSysAdmin()) {
            loadUsers();
        } else {
            const usersPanel = document.getElementById('panel-users');
            const selfPanel = document.getElementById('panel-selfcheck');
            if ((usersPanel && !usersPanel.classList.contains('hidden')) ||
                (selfPanel && !selfPanel.classList.contains('hidden'))) {
                switchAdminCoreTab('rules');
            }
        }
        refreshDbStatus();
    } catch (e) {
        showAdminToast('登入失敗：' + e.message, 'error');
    }
}

// 一鍵以超級管理員身分就緒
async function quickLoginAsAdmin() {
    openAdminLoginModal();
}

// ==========================================
// 2. 系統帳號與權限 (users - 僅限系統管理員)
// ==========================================
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!isCurrentSysAdmin()) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-rose-600 font-semibold">🔒 權限不足：內容管理人員不能管理帳號或修改權限，此功能僅限「系統管理員」操作。</td></tr>';
        return;
    }

    const role = document.getElementById('filterUserRole')?.value || '';
    const search = document.getElementById('filterUserSearch')?.value || '';

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
            const rawRole = u.role_display || u.role || '';
            const roleDisp = (rawRole === '管理員' || rawRole === '系統管理員')
                ? '系統管理員'
                : ((rawRole === '內容管理人員' || rawRole === '教職員') ? '處室承辦' : rawRole);
            const roleColors = {
                '系統管理員': 'bg-rose-100 text-rose-800 border-rose-300',
                '處室承辦': 'bg-amber-100 text-amber-800 border-amber-300',
                '科助': 'bg-amber-100 text-amber-800 border-amber-300',
                '住宿管理員': 'bg-purple-100 text-purple-800 border-purple-300',
                '老師': 'bg-indigo-100 text-indigo-800 border-indigo-300',
                '學生': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                '家長': 'bg-sky-100 text-sky-800 border-sky-300'
            };
            const isActive = (u.is_active === undefined || u.is_active === null) ? 1 : Number(u.is_active);
            const activeBadge = isActive
                ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">啟用中</span>'
                : '<span class="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">已停用</span>';
            const roleBadge = `<span class="px-2 py-0.5 rounded text-xs border font-semibold whitespace-nowrap ${roleColors[roleDisp] || 'bg-slate-100 text-slate-700'}">${escapeHtml(roleDisp)}</span>`;
            const officeHtml = u.office ? `<span class="text-xs text-slate-500 whitespace-nowrap">· ${escapeHtml(u.office)}</span>` : '';
            const permsArr = String(u.permissions || '查看').split(',').map(s => s.trim()).filter(Boolean);
            const permsBadges = permsArr.map(p => {
                const isSysPerm = ['帳號管理', '權限設定', '系統檢測'].includes(p);
                return `<span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${isSysPerm ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'}">${escapeHtml(p)}</span>`;
            }).join('');
            const dormBadge = u.can_manage_dorm ? '<span class="inline-block bg-purple-100 text-purple-800 text-[11px] px-1.5 py-0.5 rounded border border-purple-200 whitespace-nowrap">宿舍管理</span>' : '';
            const extraInfo = u.advised_class ? `<span class="text-indigo-700 font-medium whitespace-nowrap">導師：${escapeHtml(u.advised_class)}</span>` : (u.student_id ? `<span class="text-emerald-700 font-mono whitespace-nowrap">${escapeHtml(u.student_id)}${u.class_name ? ` (${escapeHtml(u.class_name)})` : ''}</span>` : '<span class="text-slate-300">—</span>');

            const isProtectedAdmin = u.username === 'admin' || (typeof currentAdminUser !== 'undefined' && currentAdminUser && u.username === currentAdminUser.username);
            const protectedBadge = isProtectedAdmin
                ? '<span class="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0" title="主系統管理員與當前登入帳號受系統防呆保護">🛡️ 受保護</span>'
                : '';

            const toggleBtn = isProtectedAdmin
                ? `<button disabled title="防呆保護：不可停用主管理員或自己目前登入的帳號" class="border border-slate-200 text-slate-300 bg-slate-50 px-2 py-1 rounded text-xs font-semibold cursor-not-allowed">停用</button>`
                : (isActive
                    ? `<button onclick="toggleUserActive(${u.user_id}, '${escapeHtml(u.username)}', 0)" class="border border-amber-400 text-amber-800 hover:bg-amber-50 px-2 py-1 rounded text-xs font-semibold">停用</button>`
                    : `<button onclick="toggleUserActive(${u.user_id}, '${escapeHtml(u.username)}', 1)" class="border border-emerald-400 text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded text-xs font-semibold">啟用</button>`);

            const deleteBtn = isProtectedAdmin
                ? `<button disabled title="防呆保護：不可刪除主管理員或自己目前登入的帳號" class="border border-slate-200 text-slate-300 bg-slate-50 px-2 py-1 rounded text-xs font-semibold cursor-not-allowed">刪除</button>`
                : `<button onclick="deleteUser(${u.user_id}, '${escapeHtml(u.username)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2 py-1 rounded text-xs font-semibold">刪除</button>`;

            const defPwd = u.default_password || ((u.role === '系統管理員' || u.role === '管理員') ? 'admin123' : '123456');
            const pwdStatusHtml = (defPwd === '123456' || defPwd === 'admin123')
                ? `<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-xs font-mono font-bold" title="系統預設密碼：${defPwd}">🔑 預設 ${defPwd}</span>`
                : `<span class="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-xs" title="使用者已自訂新密碼 (安全雜湊保護)">🛡️ 自訂密碼</span>`;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100 ${isActive ? '' : 'opacity-60 bg-rose-50/30'}">
                    <td class="p-3 font-mono text-slate-500 whitespace-nowrap">${u.user_id}</td>
                    <td class="p-3 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-slate-900">${escapeHtml(u.username)}</span>
                            ${activeBadge}
                            ${protectedBadge}
                        </div>
                    </td>
                    <td class="p-3 text-slate-800 font-medium whitespace-nowrap">${escapeHtml(u.full_name)}</td>
                    <td class="p-3 whitespace-nowrap">
                        <div class="flex items-center gap-1.5">
                            ${roleBadge}
                            ${officeHtml}
                        </div>
                    </td>
                    <td class="p-3 whitespace-nowrap">${pwdStatusHtml}</td>
                    <td class="p-3 text-xs whitespace-nowrap">
                        <div class="flex items-center gap-1">
                            ${permsBadges}${dormBadge}
                        </div>
                    </td>
                    <td class="p-3 text-xs whitespace-nowrap">${extraInfo}</td>
                    <td class="p-3 text-xs text-slate-400 font-mono whitespace-nowrap">${escapeHtml(String(u.created_at || '').substring(0, 16))}</td>
                    <td class="p-3 text-center space-x-1 whitespace-nowrap">
                        <button onclick="openUserModal('edit', ${u.user_id})" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                        <button onclick="openCredentialQueryForUser('${escapeHtml(u.username)}')" class="border border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded text-xs font-semibold" title="查詢該帳號之密碼與設定狀態">帳密</button>
                        ${toggleBtn}
                        ${deleteBtn}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function onUserRoleSelectChange(roleVal) {
    const isSys = roleVal === '系統管理員' || roleVal === '管理員';
    const isContent = ['內容管理人員', '教職員', '處室承辦', '科助', '住宿管理員'].includes(roleVal);
    const sysCheckboxes = ['mPermAccount', 'mPermPermission', 'mPermSelfCheck'].map(id => document.getElementById(id)).filter(Boolean);
    sysCheckboxes.forEach(cb => {
        cb.disabled = !isSys;
        if (!isSys) cb.checked = false;
        else cb.checked = true;
    });
    const viewCb = document.getElementById('mPermView');
    const createCb = document.getElementById('mPermCreate');
    const editCb = document.getElementById('mPermEdit');
    if (viewCb) viewCb.checked = true;
    if (createCb) createCb.checked = isSys || isContent;
    if (editCb) editCb.checked = isSys || isContent || roleVal === '老師';

    // 防呆提示：當身分為學生或家長時，綁定學號為必填
    const studentIdInput = document.getElementById('mStudentId');
    if (studentIdInput) {
        if (roleVal === '學生' || roleVal === '家長') {
            studentIdInput.required = true;
            studentIdInput.placeholder = '必填：請輸入學號（如 S112001）';
            studentIdInput.classList.add('border-amber-400', 'bg-amber-50/30');
        } else {
            studentIdInput.required = false;
            studentIdInput.placeholder = '例如 S112001（非學生/家長可留空）';
            studentIdInput.classList.remove('border-amber-400', 'bg-amber-50/30');
        }
    }
}

function setModalPermissionsCheckboxes(roleVal, permsStr) {
    const isSys = roleVal === '系統管理員' || roleVal === '管理員';
    const perms = String(permsStr || '').split(',').map(s => s.trim()).filter(Boolean);
    const map = {
        '查看': 'mPermView',
        '建立': 'mPermCreate',
        '修改': 'mPermEdit',
        '帳號管理': 'mPermAccount',
        '權限設定': 'mPermPermission',
        '系統檢測': 'mPermSelfCheck'
    };
    Object.entries(map).forEach(([label, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        const isSysOnly = ['帳號管理', '權限設定', '系統檢測'].includes(label);
        el.disabled = isSysOnly && !isSys;
        el.checked = (!el.disabled) && perms.includes(label);
    });
}

function collectModalPermissions() {
    return [...document.querySelectorAll('input[name="mPermItem"]:checked')].map(el => el.value).join(',');
}

function openUserModal(mode, id = null) {
    if (!isCurrentSysAdmin()) {
        showAdminToast('權限不足：內容管理人員不能管理帳號或修改權限，此功能僅限「系統管理員」操作', 'error');
        return;
    }
    const modal = document.getElementById('userModal');
    if (!modal) return;
    const title = document.getElementById('userModalTitle');
    document.getElementById('userForm').reset();
    document.getElementById('mUserId').value = '';
    const roleSelect = document.getElementById('mRole');
    const activeSelect = document.getElementById('mIsActive');
    if (roleSelect) roleSelect.disabled = false;
    if (activeSelect) activeSelect.disabled = false;

    if (mode === 'add') {
        title.textContent = '新增使用者帳號';
        document.getElementById('mUsername').readOnly = false;
        document.getElementById('mUsername').classList.remove('bg-slate-100');
        document.getElementById('mPasswordHint').textContent = '請設定至少 8 字元的密碼';
        document.getElementById('mRole').value = '內容管理人員';
        document.getElementById('mOffice').value = '';
        document.getElementById('mIsActive').value = '1';
        onUserRoleSelectChange('內容管理人員');
    } else {
        const u = coreDataCache.users.find(x => x.user_id === id);
        if (!u) return;
        const isProtectedAdmin = u.username === 'admin' || (typeof currentAdminUser !== 'undefined' && currentAdminUser && u.username === currentAdminUser.username);
        title.textContent = `編輯帳號與權限：${u.username}${isProtectedAdmin ? ' (🛡️ 系統保護帳號)' : ''}`;
        document.getElementById('mUserId').value = u.user_id;
        document.getElementById('mUsername').value = u.username;
        document.getElementById('mUsername').readOnly = true;
        document.getElementById('mUsername').classList.add('bg-slate-100');
        document.getElementById('mFullName').value = u.full_name;
        const roleVal = (u.role === '管理員' || u.role === '系統管理員')
            ? '系統管理員' : u.role;
        document.getElementById('mRole').value = roleVal;
        document.getElementById('mOffice').value = u.office || '';
        document.getElementById('mIsActive').value = String((u.is_active === undefined || u.is_active === null) ? 1 : Number(u.is_active));
        if (isProtectedAdmin) {
            if (roleSelect) roleSelect.disabled = true;
            if (activeSelect) activeSelect.disabled = true;
        }
        onUserRoleSelectChange(roleVal);
        setModalPermissionsCheckboxes(roleVal, u.permissions || '查看,建立,修改');
        document.getElementById('mStudentId').value = u.student_id || '';
        document.getElementById('mAdvisedClass').value = u.advised_class || '';
        document.getElementById('mCanManageDorm').checked = Boolean(u.can_manage_dorm);
        document.getElementById('mPasswordHint').textContent = '留空表示維持原密碼不變更（新密碼至少 8 字元）';
    }
    modal.classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('userModal')?.classList.add('hidden');
}

async function saveUser(e) {
    e.preventDefault();
    if (!isCurrentSysAdmin()) {
        showAdminToast('權限不足：內容管理人員不能管理帳號或修改權限', 'error');
        return;
    }
    const id = document.getElementById('mUserId').value;
    const username = document.getElementById('mUsername').value.trim();
    const fullName = document.getElementById('mFullName').value.trim();
    const role = document.getElementById('mRole').value;
    const studentId = document.getElementById('mStudentId').value.trim().toUpperCase() || null;
    const password = document.getElementById('mPassword').value.trim();

    const validRoles = ['系統管理員', '內容管理人員', '處室承辦', '科助', '住宿管理員', '教職員', '老師', '學生', '家長'];
    if (!role || !validRoles.includes(role)) {
        showAdminToast('防呆攔截：請選擇合法的身分角色（不可為空白或非法角色）', 'error');
        return;
    }

    if (!/^[A-Za-z0-9_.\-]{3,50}$/.test(username)) {
        showAdminToast('防呆攔截：帳號格式不正確，僅限 3~50 碼英數字、底線(_)、點(.)或連字號(-)', 'error');
        return;
    }
    if (!fullName || fullName.length > 50) {
        showAdminToast('防呆攔截：姓名不可為空且不可超過 50 個字元', 'error');
        return;
    }
    if ((!id && !password) || (password && (password.length < 8 || password.length > 100))) {
        showAdminToast('請設定 8 ~ 100 字元的密碼', 'error');
        return;
    }
    if ((role === '學生' || role === '家長') && !studentId) {
        showAdminToast(`防呆攔截：身分為「${role}」時，必須填寫綁定學號（如 S112001）！`, 'error');
        document.getElementById('mStudentId')?.focus();
        return;
    }
    if (studentId && !/^[A-Za-z0-9_\-]{3,20}$/.test(studentId)) {
        showAdminToast('防呆攔截：學號格式不正確，僅限 3~20 碼英數字（如 S112001）', 'error');
        return;
    }

    const payload = {
        username,
        full_name: fullName,
        role,
        office: document.getElementById('mOffice').value.trim(),
        permissions: collectModalPermissions() || '查看',
        is_active: Number(document.getElementById('mIsActive').value),
        student_id: studentId,
        advised_class: document.getElementById('mAdvisedClass').value.trim() || null,
        can_manage_dorm: document.getElementById('mCanManageDorm').checked
    };
    if (password) payload.password = password;

    try {
        if (id) {
            await adminFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showAdminToast(`使用者「${payload.username}」角色處室與權限已更新`);
        } else {
            await adminFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
            showAdminToast(`已成功建立新使用者「${payload.username}」(${payload.role})`);
        }
        closeUserModal();
        loadUsers();
        refreshDbStatus();
    } catch (e) {
        // error handled by adminFetch
    }
}

async function toggleUserActive(id, username, nextActive) {
    if (!isCurrentSysAdmin()) {
        showAdminToast('權限不足：內容管理人員不能啟用或停用帳號', 'error');
        return;
    }
    if (!nextActive && (username === 'admin' || (currentAdminUser && username === currentAdminUser.username))) {
        showAdminToast('防呆攔截：不可停用主系統管理員或自己目前登入的帳號！', 'error');
        return;
    }
    const actionLabel = nextActive ? '啟用' : '停用';
    if (!confirm(`確定要${actionLabel}帳號「${username}」嗎？`)) return;
    try {
        await adminFetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ is_active: nextActive })
        });
        showAdminToast(`帳號「${username}」已${actionLabel}`);
        loadUsers();
        refreshDbStatus();
    } catch (e) { }
}

async function deleteUser(id, username) {
    if (!isCurrentSysAdmin()) {
        showAdminToast('權限不足：內容管理人員不能刪除帳號', 'error');
        return;
    }
    if (username === 'admin' || (currentAdminUser && username === currentAdminUser.username)) {
        showAdminToast('防呆攔截：不可刪除主系統管理員或自己目前登入的帳號！', 'error');
        return;
    }
    if (!confirm(`確定要刪除使用者「${username}」？\n此動作將留下不可復原的系統稽核日誌。`)) return;
    try {
        await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        showAdminToast(`使用者「${username}」已刪除`);
        loadUsers();
        refreshDbStatus();
    } catch (e) { }
}

// ==========================================
// 2b. 帳密查詢與密碼管理功能 (Credentials Query & Password Reset)
// ==========================================
function openCredentialQueryModal() {
    if (!isCurrentSysAdmin()) {
        showAdminToast('權限不足：內容管理人員不能使用帳密查詢功能，此功能僅限「系統管理員」操作', 'error');
        return;
    }
    const modal = document.getElementById('credentialQueryModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    searchCredentials();
}

function openCredentialQueryForUser(username) {
    if (!isCurrentSysAdmin()) {
        showAdminToast('權限不足：此功能僅限「系統管理員」操作', 'error');
        return;
    }
    const modal = document.getElementById('credentialQueryModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const kwInput = document.getElementById('credSearchKeyword');
    if (kwInput) kwInput.value = username;
    const roleSelect = document.getElementById('credFilterRole');
    if (roleSelect) roleSelect.value = '';
    searchCredentials();
}

function closeCredentialQueryModal() {
    document.getElementById('credentialQueryModal')?.classList.add('hidden');
}

async function searchCredentials() {
    const tbody = document.getElementById('credentialsTableBody');
    if (!tbody) return;

    if (!isCurrentSysAdmin()) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-rose-600 font-semibold">🔒 權限不足：僅限系統管理員可查詢帳密。</td></tr>';
        return;
    }

    const role = document.getElementById('credFilterRole')?.value || '';
    const search = document.getElementById('credSearchKeyword')?.value.trim() || '';

    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">正在查詢帳密資料...</td></tr>';
    try {
        const params = new URLSearchParams();
        if (role) params.set('role', role);
        if (search) params.set('search', search);

        const res = await adminFetch(`/api/admin/credentials/query?${params.toString()}`);
        const list = res.data || [];
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">查無符合條件的帳號資料</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(u => {
            const isDefault = u.is_default_password;
            const pwdBadge = isDefault
                ? `<span class="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded font-mono font-bold border border-emerald-300">🔑 ${escapeHtml(u.password_status)}</span>`
                : `<span class="bg-sky-100 text-sky-800 text-[11px] px-2 py-0.5 rounded font-semibold border border-sky-300">🛡️ ${escapeHtml(u.password_status)}</span>`;

            const isActive = u.is_active === 1;
            const activeBadge = isActive
                ? '<span class="text-emerald-700 font-bold">啟用中</span>'
                : '<span class="text-rose-600 font-bold">已停用</span>';

            const roleColors = {
                '系統管理員': 'bg-rose-100 text-rose-800 border-rose-300',
                '處室承辦': 'bg-amber-100 text-amber-800 border-amber-300',
                '科助': 'bg-amber-100 text-amber-800 border-amber-300',
                '住宿管理員': 'bg-purple-100 text-purple-800 border-purple-300',
                '老師': 'bg-indigo-100 text-indigo-800 border-indigo-300',
                '學生': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                '家長': 'bg-sky-100 text-sky-800 border-sky-300'
            };
            const roleBadge = `<span class="px-2 py-0.5 rounded text-[11px] border font-semibold ${roleColors[u.role_display] || 'bg-slate-100 text-slate-700'}">${escapeHtml(u.role_display)}</span>`;

            const extra = u.student_id
                ? `<span class="font-mono text-emerald-700">${escapeHtml(u.student_id)}${u.class_name ? ` (${escapeHtml(u.class_name)})` : ''}</span>`
                : (u.office ? `<span class="text-slate-600">${escapeHtml(u.office)}</span>` : (u.advised_class ? `導師：${escapeHtml(u.advised_class)}` : '—'));

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-2.5 font-mono text-slate-400">${u.user_id}</td>
                    <td class="p-2.5 font-bold font-mono text-slate-900">${escapeHtml(u.username)}</td>
                    <td class="p-2.5 text-slate-800 font-medium">${escapeHtml(u.full_name)}</td>
                    <td class="p-2.5">${roleBadge}</td>
                    <td class="p-2.5 text-xs">${extra}</td>
                    <td class="p-2.5">${pwdBadge}</td>
                    <td class="p-2.5 text-xs">${activeBadge}</td>
                    <td class="p-2.5 text-center space-x-1 whitespace-nowrap">
                        <button type="button" onclick="quickResetDefaultPassword(${u.user_id}, '${escapeHtml(u.username)}')"
                            class="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-[11px] font-semibold transition" title="還原為系統預設密碼 (123456 / admin123)">還原預設</button>
                        <button type="button" onclick="promptCustomPassword(${u.user_id}, '${escapeHtml(u.username)}')"
                            class="bg-indigo-700 hover:bg-indigo-800 text-white px-2 py-1 rounded text-[11px] font-semibold transition" title="管理者為該帳號指定新密碼">設新密碼</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-rose-600">查詢失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

async function quickResetDefaultPassword(userId, username) {
    if (!confirm(`確定要將使用者「${username}」的密碼重設為系統預設密碼嗎？\n（一般師生預設密碼為 123456；系統管理員為 admin123）`)) return;
    try {
        const res = await adminFetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ mode: 'default' })
        });
        showAdminToast(res.message || `使用者「${username}」密碼已重設為預設密碼`, 'success');
        searchCredentials();
        loadUsers();
    } catch (e) {}
}

async function promptCustomPassword(userId, username) {
    const newPwd = prompt(`請輸入為使用者「${username}」設定的新密碼（長度需 8～100 字元）：`);
    if (newPwd === null) return;
    const cleanPwd = newPwd.trim();
    if (!cleanPwd || cleanPwd.length < 8 || cleanPwd.length > 100) {
        showAdminToast('防呆攔截：新密碼長度須為 8～100 個字元！', 'error');
        return;
    }
    try {
        const res = await adminFetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ mode: 'custom', new_password: cleanPwd })
        });
        showAdminToast(res.message || `使用者「${username}」新密碼已設定`, 'success');
        searchCredentials();
        loadUsers();
    } catch (e) {}
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

        tbody.innerHTML = coreDataCache.departments.map(d => {
            const hasBoundData = (d.student_count || 0) > 0 || (d.course_count || 0) > 0;
            const deleteBtn = hasBoundData
                ? `<button onclick="deleteDepartment('${d.dept_id}', '${escapeHtml(d.dept_name)}')" title="此科系已有 ${d.student_count || 0} 位學生與 ${d.course_count || 0} 門課程，系統防呆將保護不可刪除" class="border border-slate-200 text-slate-400 hover:bg-slate-100 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>`
                : `<button onclick="deleteDepartment('${d.dept_id}', '${escapeHtml(d.dept_name)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>`;
            return `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-3 font-mono font-bold text-ukn-800 text-sm">${escapeHtml(d.dept_id)}</td>
                <td class="p-3 font-bold text-slate-900">${escapeHtml(d.dept_name)}</td>
                <td class="p-3"><span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">${escapeHtml(d.college_name)}</span></td>
                <td class="p-3 font-mono text-emerald-700">${d.student_count || 0} 位學生</td>
                <td class="p-3 font-mono text-indigo-700">${d.course_count || 0} 門課程</td>
                <td class="p-3 text-center space-x-1 whitespace-nowrap">
                    <button onclick="openDeptModal('edit', '${d.dept_id}')" class="bg-ukn-800 hover:bg-ukn-700 text-white px-2.5 py-1 rounded text-xs font-semibold">編輯</button>
                    ${deleteBtn}
                </td>
            </tr>
        `}).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

function updateDeptDropdownOptions(depts) {
    const list = (depts && depts.length > 0) ? depts : (coreDataCache.departments && coreDataCache.departments.length > 0 ? coreDataCache.departments : [
        { dept_id: 'CS', dept_name: '資訊管理科', college_name: '創新資訊學院' },
        { dept_id: 'NURS', dept_name: '護理科', college_name: '健康照顧學院' },
        { dept_id: 'EC', dept_name: '幼兒保育科', college_name: '民生與幼保學院' },
        { dept_id: 'DA', dept_name: '數位應用科', college_name: '創新資訊學院' }
    ]);
    const selectors = ['filterCourseDept', 'mCourseDept', 'mGradDept'];
    selectors.forEach(sId => {
        const el = document.getElementById(sId);
        if (!el) return;
        const currentVal = el.value;
        const isFilter = sId.startsWith('filter');
        el.innerHTML = isFilter ? '<option value="">全校所有科系</option>' : '';
        list.forEach(d => {
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
    const deptName = document.getElementById('mDeptName').value.trim();
    const collegeName = document.getElementById('mCollegeName').value.trim();

    if (!/^[A-Z0-9_]{2,10}$/.test(deptId)) {
        showAdminToast('防呆攔截：系所代碼僅限 2~10 碼英數大寫（如 CS、NURS、IM）', 'error');
        return;
    }
    if (!deptName || !collegeName) {
        showAdminToast('防呆攔截：科系名稱與所屬學院皆不可空白', 'error');
        return;
    }
    if (deptName.length > 50 || collegeName.length > 50) {
        showAdminToast('防呆攔截：科系名稱與學院名稱不可超過 50 個字元', 'error');
        return;
    }

    const payload = {
        dept_id: deptId,
        dept_name: deptName,
        college_name: collegeName
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
    const d = coreDataCache.departments.find(x => x.dept_id === deptId);
    if (d && ((d.student_count || 0) > 0 || (d.course_count || 0) > 0)) {
        showAdminToast(`防呆攔截：科系「${deptName}」下仍有 ${d.student_count || 0} 名學生與 ${d.course_count || 0} 門課程，不可直接刪除！`, 'error');
        return;
    }
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
// 防呆輔助：檢查將 candidatePrereqId 設為 targetCourseId 的先修課是否會形成循環擋修
function wouldCreateCircularPrerequisite(targetCourseId, candidatePrereqId) {
    if (!targetCourseId || !candidatePrereqId) return false;
    if (targetCourseId === candidatePrereqId) return true;
    const visited = new Set([targetCourseId]);
    let curr = candidatePrereqId;
    while (curr) {
        if (visited.has(curr)) return true;
        visited.add(curr);
        const found = coreDataCache.courses.find(x => x.course_id === curr);
        curr = found ? found.prerequisite_id : null;
    }
    return false;
}

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
                <div class="flex items-center gap-1.5 whitespace-nowrap">
                    <span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-300 shrink-0">擋修</span>
                    <span class="font-medium text-slate-800 text-xs">${escapeHtml(c.prerequisite_name || c.prerequisite_id)} (${escapeHtml(c.prerequisite_id)})</span>
                </div>
            ` : '<span class="text-slate-300">無</span>';

            const typePill = c.is_required
                ? `<span class="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-xs whitespace-nowrap">${escapeHtml(c.course_type)} (必修)</span>`
                : `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs whitespace-nowrap">${escapeHtml(c.course_type)} (選修)</span>`;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono font-bold text-ukn-800 whitespace-nowrap">${escapeHtml(c.course_id)}</td>
                    <td class="p-3 cell-wrap">
                        <div class="font-bold text-slate-900">${escapeHtml(c.course_name)}</div>
                        ${c.description ? `<div class="text-[11px] text-slate-500 line-clamp-1">${escapeHtml(c.description)}</div>` : ''}
                    </td>
                    <td class="p-3 text-xs font-mono font-bold text-slate-800 whitespace-nowrap">${c.credits} 學分 / ${c.semester_hours || c.credits} 時</td>
                    <td class="p-3 text-xs whitespace-nowrap">${typePill}</td>
                    <td class="p-3 text-xs whitespace-nowrap"><span class="font-medium text-slate-700">${escapeHtml(c.dept_name || c.dept_id)}</span></td>
                    <td class="p-3 text-xs font-medium text-slate-600 whitespace-nowrap">${escapeHtml(c.semester_suggest || '—')}</td>
                    <td class="p-3 text-xs whitespace-nowrap">${prereqBadge}</td>
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

    // 更新開課系所下拉選單
    const deptSelect = document.getElementById('mCourseDept');
    if (deptSelect && deptSelect.children.length === 0) {
        updateDeptDropdownOptions(coreDataCache.departments);
    }

    // 更新先修課程下拉選單（防呆：排除自身以及會造成循環擋修的下游課程）
    const prereqSelect = document.getElementById('mCoursePrereq');
    prereqSelect.innerHTML = '<option value="">(無先修科目，不設擋修限制)</option>';
    coreDataCache.courses.forEach(c => {
        if (mode === 'edit' && wouldCreateCircularPrerequisite(courseId, c.course_id)) return;
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
    const courseName = document.getElementById('mCourseName').value.trim();
    const credits = parseInt(document.getElementById('mCourseCredits').value, 10);
    const hours = parseFloat(document.getElementById('mCourseHours').value);
    const prereqId = document.getElementById('mCoursePrereq').value.trim() || null;

    if (!/^[A-Z0-9_\-]{2,20}$/.test(courseId)) {
        showAdminToast('防呆攔截：課程代碼格式不正確，僅限 2~20 碼英數大寫（如 CS101、NURS201）', 'error');
        return;
    }
    if (!courseName || courseName.length > 80) {
        showAdminToast('防呆攔截：課程名稱不可為空且不可超過 80 個字元', 'error');
        return;
    }
    if (isNaN(credits) || credits < 0 || credits > 15) {
        showAdminToast('防呆攔截：學分數必須介於 0 ~ 15 學分之間', 'error');
        return;
    }
    if (isNaN(hours) || hours < 0 || hours > 20) {
        showAdminToast('防呆攔截：每週授課時數必須介於 0 ~ 20 小時之間', 'error');
        return;
    }
    if (prereqId && wouldCreateCircularPrerequisite(origId || courseId, prereqId)) {
        showAdminToast('防呆攔截：先修課程不可設定為自己或會造成循環擋修（A ↔ B）的科目！', 'error');
        return;
    }

    const payload = {
        course_id: courseId,
        course_name: courseName,
        credits,
        semester_hours: hours,
        dept_id: document.getElementById('mCourseDept').value,
        course_type: document.getElementById('mCourseType').value,
        is_required: document.getElementById('mCourseIsRequired').value === '1',
        semester_suggest: document.getElementById('mCourseSemester').value.trim(),
        prerequisite_id: prereqId,
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
    const dependentCourses = coreDataCache.courses.filter(x => x.prerequisite_id === courseId);
    if (dependentCourses.length > 0) {
        const names = dependentCourses.map(x => `${x.course_name}(${x.course_id})`).join('、');
        showAdminToast(`防呆攔截：課程「${courseName}」目前被設為【${names}】的先修擋修科目，請先解除擋修關聯後再刪除！`, 'error');
        return;
    }
    if (!confirm(`確定要刪除課程「${courseName}」(${courseId})？\n若有學生歷年成績綁定此課程，將被系統安全防護擋下。`)) return;
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
                <td class="p-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900">${escapeHtml(g.dept_name || g.dept_id)}</span>
                        <span class="text-xs font-mono text-slate-400">(${escapeHtml(g.dept_id)})</span>
                    </div>
                </td>
                <td class="p-3 font-mono font-bold text-emerald-800 text-sm whitespace-nowrap">${g.total_credits_req} 學分</td>
                <td class="p-3 font-mono text-slate-700 text-xs whitespace-nowrap">${g.major_required_req} 學分</td>
                <td class="p-3 font-mono text-slate-700 text-xs whitespace-nowrap">${g.major_elective_req} 學分</td>
                <td class="p-3 font-mono text-slate-700 text-xs whitespace-nowrap">${g.general_req} 學分</td>
                <td class="p-3 text-xs whitespace-nowrap">
                    <span class="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-medium">${escapeHtml(g.english_threshold_name)}</span>
                </td>
                <td class="p-3 font-mono text-xs text-slate-600 whitespace-nowrap">${g.ethics_req} 學分</td>
                <td class="p-3 font-mono text-xs text-slate-600 whitespace-nowrap">${g.project_req} 學分</td>
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
    const totalCredits = parseInt(document.getElementById('mTotalCreditsReq').value, 10);
    const majorReq = parseInt(document.getElementById('mMajorReq').value, 10);
    const majorElec = parseInt(document.getElementById('mMajorElec').value, 10);
    const generalReq = parseInt(document.getElementById('mGeneralReq').value, 10);
    const ethicsReq = parseInt(document.getElementById('mEthicsReq').value, 10);
    const projectReq = parseInt(document.getElementById('mProjectReq').value, 10);

    if (isNaN(totalCredits) || totalCredits < 50 || totalCredits > 300) {
        showAdminToast('防呆攔截：畢業總學分門檻須介於 50 ~ 300 學分之間', 'error');
        return;
    }
    if ([majorReq, majorElec, generalReq, ethicsReq, projectReq].some(v => isNaN(v) || v < 0 || v > 250)) {
        showAdminToast('防呆攔截：各分項學分不可為負數或超過 250 學分', 'error');
        return;
    }
    const subSum = majorReq + majorElec + generalReq;
    if (subSum > totalCredits) {
        showAdminToast(`防呆攔截：專業必修(${majorReq}) + 專業選修(${majorElec}) + 通識(${generalReq}) = ${subSum} 學分，不可超過畢業總學分 (${totalCredits})！`, 'error');
        return;
    }

    const payload = {
        dept_id: document.getElementById('mGradDept').value,
        total_credits_req: totalCredits,
        major_required_req: majorReq,
        major_elective_req: majorElec,
        general_req: generalReq,
        english_threshold_name: document.getElementById('mEnglishThreshold').value.trim(),
        ethics_req: ethicsReq,
        project_req: projectReq
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

        tbody.innerHTML = coreDataCache.categories.map(c => {
            const hasBoundItems = (c.article_count || 0) > 0 || (c.synonym_count || 0) > 0;
            const deleteBtn = hasBoundItems
                ? `<button onclick="deleteCategory(${c.category_id}, '${escapeHtml(c.category_name)}')" title="此分類下有 ${c.article_count || 0} 篇規章與 ${c.synonym_count || 0} 筆同義詞，系統防呆保護中" class="border border-slate-200 text-slate-400 hover:bg-slate-100 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>`
                : `<button onclick="deleteCategory(${c.category_id}, '${escapeHtml(c.category_name)}')" class="border border-rose-300 text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded text-xs font-semibold">刪除</button>`;
            return `
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
                    ${deleteBtn}
                </td>
            </tr>
        `}).join('');
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
    const catName = document.getElementById('mCatName').value.trim();
    const sortOrder = parseInt(document.getElementById('mCatSort').value, 10);

    if (!catName || catName.length > 50) {
        showAdminToast('防呆攔截：主分類名稱不可為空且不可超過 50 個字元', 'error');
        return;
    }
    if (isNaN(sortOrder) || sortOrder < 0 || sortOrder > 999) {
        showAdminToast('防呆攔截：排序權重須為 0 ~ 999 之間的整數', 'error');
        return;
    }

    const payload = {
        category_name: catName,
        icon: document.getElementById('mCatIcon').value.trim() || '📖',
        sort_order: sortOrder
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
    const c = coreDataCache.categories.find(x => x.category_id === catId);
    if (c && ((c.article_count || 0) > 0 || (c.synonym_count || 0) > 0)) {
        showAdminToast(`防呆攔截：分類「${catName}」下仍有 ${c.article_count || 0} 篇規章與 ${c.synonym_count || 0} 筆同義詞，不可直接刪除！`, 'error');
        return;
    }
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
    const id = document.getElementById('mSynId')?.value;
    const userKeyword = (document.getElementById('mSynUserKeyword')?.value || document.getElementById('sKeyword')?.value || '').trim();
    const officialTerm = (document.getElementById('mSynOfficialTerm')?.value || document.getElementById('sOfficial')?.value || '').trim();
    const categoryId = document.getElementById('mSynCategory')?.value || document.getElementById('sCategory')?.value || null;

    if (!userKeyword || !officialTerm) {
        showAdminToast('日常俗稱與官方標準名稱為必填', 'error');
        return;
    }
    if (userKeyword.length > 50 || officialTerm.length > 50) {
        showAdminToast('防呆攔截：俗稱關鍵字與正式條文名稱不可超過 50 個字元', 'error');
        return;
    }
    if (userKeyword.toLowerCase() === officialTerm.toLowerCase()) {
        showAdminToast('防呆攔截：俗稱關鍵字與正式條文名稱不可完全相同（避免自我映射）', 'error');
        return;
    }

    const payload = {
        user_keyword: userKeyword,
        official_term: officialTerm,
        category_id: categoryId
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
        if (typeof loadAdminSynonyms === 'function') await loadAdminSynonyms();
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

        const res = await adminFetch(`/api/admin/core/audit-logs?${params.toString()}`);
        coreDataCache.auditLogs = res.data || [];
        const countSpan = document.getElementById('auditCountBadge');
        if (countSpan) countSpan.textContent = coreDataCache.auditLogs.length;

        if (coreDataCache.auditLogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-400">目前尚無符合條件的稽核紀錄</td></tr>';
            return;
        }

        const tableLabelMap = {
            users: '帳號與權限',
            departments: '科系與學院',
            course_map: '課程與擋修',
            graduation_requirements: '畢業門檻',
            knowledge_categories: '知識庫分類',
            synonym_dictionary: '同義詞對照',
            knowledge_base: '校規條文',
            student_credits: '學生修課成績',
            attendance_records: '出缺勤紀錄',
            student_records: '獎懲與幹部紀錄',
            visitor_logs: '訪客登記',
            checklist_items: '申辦流程',
            deadlines: '重要期限',
            academic_calendar: '校曆事項',
            links: '學生專區連結',
            faculty_profiles: '教師專長',
            conduct_settings: '操行計分規則',
            anniversary_events: '校慶設定',
            anniversary_wishes: '校慶祝福'
        };

        tbody.innerHTML = coreDataCache.auditLogs.map(log => {
            const actionColors = {
                'INSERT': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                'UPDATE': 'bg-sky-100 text-sky-800 border-sky-300',
                'DELETE': 'bg-rose-100 text-rose-800 border-rose-300',
                '新增': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                '修改': 'bg-sky-100 text-sky-800 border-sky-300',
                '刪除': 'bg-rose-100 text-rose-800 border-rose-300'
            };
            const actionLabel = { 'INSERT': '新增', 'UPDATE': '修改', 'DELETE': '刪除' }[log.action] || log.action;
            const actionBadge = `<span class="px-2 py-0.5 rounded text-xs border font-bold whitespace-nowrap ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}">${escapeHtml(actionLabel)}</span>`;
            const tableDisp = tableLabelMap[log.table_name] || log.table_name;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono text-slate-500 text-xs whitespace-nowrap">${log.log_id}</td>
                    <td class="p-3 font-bold text-slate-900 text-xs whitespace-nowrap">${escapeHtml(tableDisp)}</td>
                    <td class="p-3 font-mono text-xs text-indigo-700 whitespace-nowrap">${escapeHtml(log.record_id)}</td>
                    <td class="p-3 whitespace-nowrap">${actionBadge}</td>
                    <td class="p-3 text-xs whitespace-nowrap">
                        <div class="flex items-center gap-1.5">
                            <span class="font-bold text-slate-900">${escapeHtml(log.changed_by)}</span>
                            ${log.changed_by_role ? `<span class="text-slate-400">(${escapeHtml(log.changed_by_role)})</span>` : ''}
                        </div>
                    </td>
                    <td class="p-3 font-mono text-xs text-slate-500 whitespace-nowrap">${escapeHtml(log.ip_address || '127.0.0.1')}</td>
                    <td class="p-3 font-mono text-xs text-slate-400 whitespace-nowrap">${escapeHtml(String(log.changed_at || ''))}</td>
                    <td class="p-3 text-center whitespace-nowrap">
                        <button onclick="showAuditDiffModal(${log.log_id})" class="bg-slate-800 hover:bg-slate-900 text-white text-xs px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                            查看內容
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
// 13. 全校線上會議與歷史紀錄 (meetings)
// ==========================================
async function loadAdminMeetings() {
    const tbody = document.getElementById('adminMeetingsTableBody');
    if (!tbody) return;

    const statusFilter = document.getElementById('adminMtgStatusFilter')?.value || 'all';
    const search = document.getElementById('adminMtgSearch')?.value || '';

    tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">載入全校會議歷史與審查資料中...</td></tr>';

    try {
        const queryParams = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') queryParams.append('status', statusFilter);
        if (search.trim()) queryParams.append('search', search.trim());

        const res = await fetch(`/api/admin/meetings?${queryParams.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.status === 'error') {
            throw new Error(data.message || '無法取得會議資料');
        }

        const stats = data.stats || {};
        if (document.getElementById('adminMtgTotal')) document.getElementById('adminMtgTotal').textContent = stats.total_meetings ?? 0;
        if (document.getElementById('adminMtgUpcoming')) document.getElementById('adminMtgUpcoming').textContent = stats.upcoming_count ?? 0;
        if (document.getElementById('adminMtgOngoing')) document.getElementById('adminMtgOngoing').textContent = stats.ongoing_count ?? 0;
        if (document.getElementById('adminMtgPast')) document.getElementById('adminMtgPast').textContent = stats.past_count ?? 0;
        if (document.getElementById('adminMtgConflict')) document.getElementById('adminMtgConflict').textContent = stats.conflict_count ?? 0;
        if (document.getElementById('adminMtgParticipants')) document.getElementById('adminMtgParticipants').textContent = stats.total_participants ?? 0;

        const meetings = data.data || [];
        if (meetings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">目前沒有符合條件的會議紀錄。</td></tr>';
            return;
        }

        tbody.innerHTML = meetings.map(m => {
            const statusColors = {
                '即將開始': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                '進行中': 'bg-blue-100 text-blue-800 border-blue-300',
                '已結束': 'bg-slate-100 text-slate-700 border-slate-300',
                '已取消': 'bg-rose-100 text-rose-800 border-rose-300'
            };
            const statusBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-semibold border ${statusColors[m.status] || 'bg-slate-100 text-slate-700'}">${escapeHtml(m.status)}</span>`;

            let conflictBadge = '';
            if (m.conflict_detected && m.conflicts && m.conflicts.length > 0) {
                const confNames = m.conflicts.map(c => `與 ID:${c.meeting_id}「${escapeHtml(c.title)}」時段衝突`).join('；');
                conflictBadge = `<div class="mt-1 inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold" title="${confNames}">⚠️ 時段衝突 (${m.conflicts.length}場)</div>`;
            }

            const membersList = (m.members || []).map(mem => {
                const roleBadge = mem.role ? `<span class="text-[10px] text-slate-400 font-normal">(${escapeHtml(mem.role)})</span>` : '';
                return `<span class="inline-block bg-slate-50 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[11px] mr-1 mb-1">${escapeHtml(mem.full_name || mem.username)} ${roleBadge}</span>`;
            }).join('');

            const timeStr = `${escapeHtml(m.start_time || '—')} ~ ${escapeHtml((m.end_time || '').slice(-5)) || ''}`;
            const durationBadge = m.duration ? `<span class="text-[10px] text-slate-400 font-mono">(${m.duration} 分鐘)</span>` : '';

            const cancelBtn = (m.status !== '已取消' && m.status !== '已結束')
                ? `<button onclick="adminCancelMeeting(${m.meeting_id}, '${escapeHtml(m.title)}')" class="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold transition">取消會議</button>`
                : `<span class="text-slate-400 text-xs">—</span>`;

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="p-3 font-mono font-bold text-slate-800">#${m.meeting_id}</td>
                    <td class="p-3">
                        <div class="font-bold text-slate-900 text-xs sm:text-sm">${escapeHtml(m.title)}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(m.description || '無詳細說明')}</div>
                        <div class="mt-1 flex items-center gap-2">
                            <span class="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] px-1.5 py-0.2 rounded font-medium">${escapeHtml(m.type || '視訊會議')}</span>
                            ${m.room_code ? `<span class="text-[10px] text-slate-400 font-mono">房號：${escapeHtml(m.room_code)}</span>` : ''}
                        </div>
                    </td>
                    <td class="p-3">
                        <div class="font-medium text-slate-900">${escapeHtml(m.host_name || m.host_username)}</div>
                        <div class="text-[10px] text-slate-400">${escapeHtml(m.host_role || '')} ${escapeHtml(m.host_dept ? '· ' + m.host_dept : '')}</div>
                    </td>
                    <td class="p-3">
                        <div class="font-mono text-xs text-slate-700 font-medium">${timeStr}</div>
                        <div class="mt-0.5">${durationBadge}</div>
                    </td>
                    <td class="p-3">
                        <div>${statusBadge}</div>
                        ${conflictBadge}
                    </td>
                    <td class="p-3 max-w-xs">
                        <div class="text-[11px] font-semibold text-slate-500 mb-1">出席者 (${(m.members || []).length}人)：</div>
                        <div class="flex flex-wrap">${membersList || '<span class="text-slate-300">尚未登記名冊</span>'}</div>
                    </td>
                    <td class="p-3 text-center whitespace-nowrap">
                        ${cancelBtn}
                    </td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</td></tr>`;
    }
}

async function adminCancelMeeting(meetingId, title) {
    if (!confirm(`確定要以管理員身分強制取消會議「${title}」嗎？\n此操作將同步記錄於系統稽核日誌。`)) return;
    try {
        await adminFetch(`/api/admin/meetings/${meetingId}/cancel`, {
            method: 'POST'
        });
        showAdminToast(`已成功取消會議「${title}」`, 'success');
        loadAdminMeetings();
    } catch (e) {
        // error handled by adminFetch
    }
}

// ==========================================
// 14. 智慧校園 AI 決策與異常預警中樞 (smart_insights)
// ==========================================
async function loadSmartInsights() {
    const overviewBar = document.getElementById('smartRecordsOverviewBar');
    const container = document.getElementById('smartInsightsContainer');
    if (!container) return;

    container.innerHTML = '<div class="p-8 text-center text-slate-400">智慧分析引擎交叉比對全校各系統資料庫中...</div>';

    // 1. 取得全校跨模組歷史紀錄總覽
    try {
        const overviewRes = await fetch('/api/admin/records/overview');
        const overviewData = await overviewRes.json().catch(() => ({}));
        if (overviewData.status === 'success' && overviewData.data && overviewBar) {
            const counts = overviewData.data;
            const items = [
                { label: '全校會議紀錄', count: counts.meetings_count || 0, icon: '📅' },
                { label: '學生缺曠登記', count: counts.attendance_count || 0, icon: '📋' },
                { label: '安全稽核軌跡', count: counts.audit_count || 0, icon: '🛡️' },
                { label: '系統重要通知', count: counts.notices_count || 0, icon: '📢' },
                { label: '空間借用申請', count: counts.bookings_count || 0, icon: '🏫' },
                { label: '宿舍進住申請', count: counts.dorm_apps_count || 0, icon: '🛏️' },
                { label: '校外訪客登記', count: counts.visitor_count || 0, icon: '🚪' }
            ];
            overviewBar.innerHTML = items.map(it => `
                <div class="bg-white border border-slate-200 p-3 rounded-lg shadow-xs flex items-center justify-between">
                    <div>
                        <div class="text-[11px] text-slate-500 font-medium">${it.label}</div>
                        <div class="text-lg font-bold text-slate-900 mt-0.5">${it.count}</div>
                    </div>
                    <div class="text-2xl">${it.icon}</div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Overview fetch failed:', e);
    }

    // 2. 取得智慧洞察卡片
    try {
        const res = await fetch('/api/admin/smart-insights');
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.status === 'error') {
            throw new Error(data.message || '無法取得智慧洞察分析');
        }

        const insights = data.insights || [];
        if (insights.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-slate-400">目前校園各系統運作完全正常，暫無異常預警或優化建議。</div>';
            return;
        }

        const severityStyles = {
            'high': { border: 'border-rose-300', bg: 'bg-rose-50/50', badge: 'bg-rose-100 text-rose-800 border-rose-300', icon: '🚨 高度警戒' },
            'medium': { border: 'border-amber-300', bg: 'bg-amber-50/50', badge: 'bg-amber-100 text-amber-800 border-amber-300', icon: '⚠️ 中度注意' },
            'info': { border: 'border-sky-300', bg: 'bg-sky-50/50', badge: 'bg-sky-100 text-sky-800 border-sky-300', icon: '💡 智慧優化' },
            'low': { border: 'border-slate-300', bg: 'bg-slate-50/50', badge: 'bg-slate-100 text-slate-700 border-slate-300', icon: 'ℹ️ 常規資訊' }
        };

        container.innerHTML = insights.map(ins => {
            const sty = severityStyles[ins.severity] || severityStyles['info'];

            let itemsHtml = '';
            if (ins.category === 'AI 知識庫擴充推薦' && ins.affected_items && ins.affected_items.length > 0) {
                itemsHtml = `
                    <div class="mt-3 bg-white rounded border border-slate-200 divide-y divide-slate-100">
                        ${ins.affected_items.map(item => `
                            <div class="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div>
                                    <span class="font-bold text-slate-900">「${escapeHtml(item.user_query)}」</span>
                                    <span class="text-[11px] text-slate-500 font-mono ml-2">(被搜尋 ${item.search_count} 次)</span>
                                    <div class="text-[11px] text-indigo-700 mt-0.5">
                                        👉 建議映射標準詞：<span class="font-semibold underline">${escapeHtml(item.suggested_official_term)}</span>
                                        <span class="text-slate-400">(${escapeHtml(item.suggested_doc || '')})</span>
                                    </div>
                                </div>
                                <button onclick="adoptSynonymRecommendation(${item.query_id}, '${escapeHtml(item.user_query)}', '${escapeHtml(item.suggested_official_term)}')"
                                    class="shrink-0 bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded font-semibold transition text-xs flex items-center gap-1 shadow-xs">
                                    <span>✨ 一鍵採納為同義詞</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else if (ins.category === '學業擋修風險預警' && ins.affected_items && ins.affected_items.length > 0) {
                itemsHtml = `
                    <div class="mt-3 overflow-x-auto rounded border border-slate-200 bg-white">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-slate-50 text-slate-600 border-b">
                                <tr>
                                    <th class="p-2">學號 / 姓名</th>
                                    <th class="p-2">班級</th>
                                    <th class="p-2 text-rose-700">不及格之先修科目</th>
                                    <th class="p-2 text-slate-800">受阻擋無法修習科目</th>
                                    <th class="p-2 text-right">處理</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${ins.affected_items.map(item => `
                                    <tr>
                                        <td class="p-2 font-mono font-bold text-ukn-800">${escapeHtml(item.student_id)} <span class="font-normal text-slate-700">(${escapeHtml(item.student_name)})</span></td>
                                        <td class="p-2 text-slate-600">${escapeHtml(item.class_name)}</td>
                                        <td class="p-2 font-semibold text-rose-700">${escapeHtml(item.failed_course)}</td>
                                        <td class="p-2 font-semibold text-slate-900">⛔ ${escapeHtml(item.blocked_course)}</td>
                                        <td class="p-2 text-right">
                                            <button onclick="switchAdminCoreTab('coursemap')" class="text-indigo-700 hover:underline">查閱擋修規則</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (ins.category === '出勤扣考警戒預警' && ins.affected_items && ins.affected_items.length > 0) {
                itemsHtml = `
                    <div class="mt-3 overflow-x-auto rounded border border-slate-200 bg-white">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-slate-50 text-slate-600 border-b">
                                <tr>
                                    <th class="p-2">學號 / 姓名</th>
                                    <th class="p-2">班級</th>
                                    <th class="p-2 text-rose-700">累計缺課節數</th>
                                    <th class="p-2 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${ins.affected_items.map(item => `
                                    <tr>
                                        <td class="p-2 font-mono font-bold text-ukn-800">${escapeHtml(item.student_id)} <span class="font-normal text-slate-700">(${escapeHtml(item.name)})</span></td>
                                        <td class="p-2 text-slate-600">${escapeHtml(item.class)}</td>
                                        <td class="p-2 font-bold text-rose-700">${escapeHtml(item.count)}</td>
                                        <td class="p-2 text-right">
                                            <button onclick="switchAdminCoreTab('attendance')" class="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded font-semibold">缺曠預警處理</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (ins.affected_items && ins.affected_items.length > 0) {
                itemsHtml = `
                    <div class="mt-2 text-xs text-slate-600 space-y-1">
                        ${ins.affected_items.map(it => `<div>· ${escapeHtml(it.title || '')} (${escapeHtml(it.host || '')} - ${escapeHtml(it.time || '')})</div>`).join('')}
                    </div>
                `;
            }

            return `
                <div class="p-4 rounded-lg border ${sty.border} ${sty.bg} shadow-xs">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${sty.badge}">${sty.icon}</span>
                            <h4 class="font-bold text-sm sm:text-base text-slate-900">${escapeHtml(ins.title)}</h4>
                        </div>
                        <span class="text-xs font-semibold text-slate-500">分類：${escapeHtml(ins.category)}</span>
                    </div>
                    <div class="text-xs text-slate-700 mt-2 leading-relaxed">
                        ${escapeHtml(ins.summary || '')}
                    </div>
                    ${ins.recommendation ? `
                        <div class="mt-2 text-xs font-semibold text-indigo-900 bg-white/80 p-2.5 rounded border border-indigo-100 flex items-start gap-1.5">
                            <span class="shrink-0 text-base leading-none">🎯</span>
                            <span>智慧決策建議：${escapeHtml(ins.recommendation)}</span>
                        </div>
                    ` : ''}
                    ${itemsHtml}
                </div>
            `;
        }).join('');

    } catch (e) {
        container.innerHTML = `<div class="p-6 text-center text-rose-600">載入失敗：${escapeHtml(e.message)}</div>`;
    }
}

async function adoptSynonymRecommendation(queryId, keyword, officialTerm) {
    if (!confirm(`確定要將學生常見搜尋詞「${keyword}」採納為官方同義詞「${officialTerm}」嗎？\n採納後該未命中問題將標記為已處理，且所有搜尋將立即生效。`)) return;
    try {
        await adminFetch('/api/admin/unmatched-queries/convert-synonym', {
            method: 'POST',
            body: JSON.stringify({
                query_id: queryId,
                user_keyword: keyword,
                official_term: officialTerm,
                category_id: 1
            })
        });

        showAdminToast(`已成功採納！「${keyword}」已加入同義詞對照表`, 'success');
        loadSmartInsights();
    } catch (e) {
        // error handled by adminFetch
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
    // 權限攔截：內容管理人員不能管理帳號或修改權限，亦不可執行系統管理員專屬功能
    if ((tabName === 'users' || tabName === 'selfcheck') && !isCurrentSysAdmin()) {
        showAdminToast('權限不足：內容管理人員不能管理帳號或修改權限，此功能僅限「系統管理員」操作', 'error');
        return;
    }

    const allPanels = [
        'dashboard',
        'users', 'departments', 'coursemap', 'gradreqs', 'categories', 'synonyms', 'rules',
        'audit', 'searchlogs', 'unmatched', 'visitors', 'credits', 'attendance_audit', 'records',
        'missed', 'checklists', 'deadlines', 'feedback', 'links', 'calendar', 'attendance', 'scholarwarn', 'campus', 'faculty', 'conduct', 'anniversary', 'selfcheck',
        'meetings', 'smartinsights'
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
    applyRolePermissionUI();

    const breadcrumbs = {
        'dashboard': ['總覽中心', '系統數據總覽'],
        // 一、校規與搜尋
        'rules': ['校規與搜尋', '校規法規條文'],
        'categories': ['校規與搜尋', '知識庫分類'],
        'synonyms': ['校規與搜尋', '同義詞對照'],
        'unmatched': ['校規與搜尋', '搜尋未命中問題'],
        'missed': ['校規與搜尋', '未命中統計分析'],
        'feedback': ['校規與搜尋', '搜尋回饋'],
        'searchlogs': ['校規與搜尋', '全校搜尋紀錄'],
        // 二、申辦與日程
        'checklists': ['申辦與日程', '申辦資訊與流程'],
        'calendar': ['申辦與日程', '校曆管理'],
        'deadlines': ['申辦與日程', '重要期限管理'],
        'anniversary': ['申辦與日程', '跑馬燈與校慶公告'],
        // 三、公開資訊
        'links': ['公開資訊', '學生專區連結'],
        'departments': ['公開資訊', '科系與學院'],
        'coursemap': ['公開資訊', '全校課程與擋修'],
        'gradreqs': ['公開資訊', '各系畢業門檻'],
        'faculty': ['公開資訊', '教師專長與課表'],
        'campus': ['公開資訊', '空間借用與櫃子繳費'],
        'visitors': ['公開資訊', '校外訪客登記'],
        'conduct': ['公開資訊', '操行計分規則'],
        'credits': ['公開資訊', '學生歷年成績'],
        'attendance_audit': ['公開資訊', '出缺勤紀錄查詢'],
        'attendance': ['公開資訊', '缺曠登記與通知'],
        'records': ['公開資訊', '學生獎懲與幹部'],
        'scholarwarn': ['公開資訊', '學業與獎助預警推播'],
        // 四、系統管理
        'users': ['系統管理', '帳號與權限管理'],
        'audit': ['系統管理', '修改紀錄'],
        'selfcheck': ['系統管理', '系統檢測'],
        // 五、會議與智慧分析
        'meetings': ['校園與行政', '全校線上會議歷史紀錄'],
        'smartinsights': ['智慧中樞', '智慧校園 AI 決策洞察']
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
    else if (tabName === 'calendar') {
        if (typeof loadCalendarEvents === 'function') loadCalendarEvents();
        if (typeof loadSchoolCalendarInfo === 'function') loadSchoolCalendarInfo();
    }
    else if (tabName === 'feedback') { if (typeof loadFeedbackStats === 'function') loadFeedbackStats(); }
    else if (tabName === 'meetings') { loadAdminMeetings(); }
    else if (tabName === 'smartinsights') { loadSmartInsights(); }
}

// 啟動時自動載入核心資料與狀態
async function loadAllCoreAdminData() {
    const allowedAdminRoles = ['管理員', '系統管理員', '內容管理人員'];
    try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json().catch(() => ({}));
        if (!(meData.is_authenticated || meData.authenticated) || !allowedAdminRoles.includes(meData.user?.role)) {
            currentAdminUser = null;
            applyRolePermissionUI();
            openAdminLoginModal();
            return;
        } else {
            currentAdminUser = meData.user;
            applyRolePermissionUI();
        }
    } catch (e) {
        currentAdminUser = null;
        applyRolePermissionUI();
        showAdminToast('無法確認登入狀態，請重新整理後登入', 'error');
        return;
    }
    await refreshDbStatus();
    if (isCurrentSysAdmin()) {
        loadUsers();
    }
    loadDepartments();
    loadCourseMap();
    loadGraduationRequirements();
    loadKnowledgeCategories();
    loadAdminSynonyms();
    loadAuditLogs();
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllCoreAdminData();
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [
                'userModal', 'deptModal', 'courseModal', 'gradReqModal',
                'categoryModal', 'synonymModal', 'auditDiffModal', 'adminLoginModal',
                'ruleModal', 'checklistModal', 'deadlineModal', 'linkModal',
                'calendarModal', 'facultyModal', 'annivModal', 'convertSynonymModal'
            ].forEach(id => {
                const el = document.getElementById(id);
                if (el && !el.classList.contains('hidden')) {
                    el.classList.add('hidden');
                }
            });
        }
    });
});

// 重補修推薦推播：dry_run=true 只列出會通知誰；寄送前再確認一次
async function sendRetakeNotifications(dryRun) {
    if (!dryRun && !confirm('確定寄送重補修推薦通知？已通知過的同一科同一狀態不會重複寄。')) return;
    const box = document.getElementById('retakeNotifyResult');
    const btns = ['btnRetakePreview', 'btnRetakeSend'].map(id => document.getElementById(id));
    btns.forEach(b => { b.disabled = true; });
    box.textContent = '比對中…';
    box.classList.remove('hidden');
    try {
        const res = await fetch('/api/admin/notify/retake', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dry_run: dryRun })
        });
        const data = await res.json();
        let text = data.message || '';
        const label = { prereq_blocked: '擋修', available: '有班可選', all_conflict: '全部衝堂', not_offered: '未開課' };
        (data.students || []).forEach(s => {
            text += `
・${s.student_id} ${s.full_name || ''}（${s.class_name || ''}）：`
                + s.items.map(i => `${i.course_name}[${label[i.status] || i.status}]${i.is_new ? '' : '(已通知過)'}`).join('、');
        });
        (data.failed || []).forEach(f => { text += `
寄送失敗 ${f.student_id}：${f.error}`; });
        box.textContent = text;
    } catch (e) {
        console.error(e);
        box.textContent = '連線失敗，請稍後再試。';
    } finally {
        btns.forEach(b => { b.disabled = false; });
    }
}
