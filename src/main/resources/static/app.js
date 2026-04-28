const API = 'http://localhost:8080';
let currentUser = null;
let allComplaints = [];
let myComplaints = [];
let selectedComplaintId = null;

// ==================== AUTH ====================
function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
}
function showRegister() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

async function handleRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    if (!name || !email || !password) return showToast('Please fill all fields', 'error');
    toggleBtnLoading('register-btn', true);
    try {
        const res = await fetch(API + '/auth/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Registration failed'); }
        const user = await res.json();
        showToast('Account created! Please login.', 'success');
        showLogin();
        document.getElementById('login-email').value = email;
    } catch (e) { showToast(e.message, 'error'); }
    toggleBtnLoading('register-btn', false);
}

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showToast('Please fill all fields', 'error');
    toggleBtnLoading('login-btn', true);
    try {
        const res = await fetch(API + '/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Login failed'); }
        // Get user details by fetching via register endpoint workaround - store in session
        // Since we don't have a /users/me endpoint, we'll store email-based info
        const regRes = await fetch(API + '/auth/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: '', email, password, role: 'USER' })
        }).catch(() => null);
        // Try to find user from complaints or use email
        currentUser = { email, password, name: email.split('@')[0], role: 'USER', id: null };
        // Try getting user ID from a test register (will fail if exists, that's ok)
        localStorage.setItem('user', JSON.stringify(currentUser));
        showToast('Login successful!', 'success');
        showDashboard();
    } catch (e) { showToast(e.message, 'error'); }
    toggleBtnLoading('login-btn', false);
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('user');
    document.getElementById('dashboard-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
    showToast('Logged out', 'info');
}

// ==================== DASHBOARD ====================
function showDashboard() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    document.getElementById('user-name-display').textContent = currentUser.name;
    document.getElementById('user-role-display').textContent = currentUser.role;
    document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const res = await fetch(API + '/complaints');
        allComplaints = await res.json();
        // Filter my complaints by userId if available
        myComplaints = currentUser.id
            ? allComplaints.filter(c => c.userId === currentUser.id)
            : allComplaints;
        updateStats();
        renderRecentTable(allComplaints.slice(0, 10));
        renderMyComplaints(myComplaints);
        renderAllComplaints(allComplaints);
    } catch (e) { showToast('Failed to load data: ' + e.message, 'error'); }
}

function updateStats() {
    document.getElementById('stat-total').textContent = allComplaints.length;
    document.getElementById('stat-open').textContent = allComplaints.filter(c => c.status === 'OPEN').length;
    document.getElementById('stat-progress').textContent = allComplaints.filter(c => c.status === 'IN_PROGRESS').length;
    document.getElementById('stat-resolved').textContent = allComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    // Animate numbers
    document.querySelectorAll('.stat-number').forEach(el => {
        el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeUp .4s ease';
    });
}

// ==================== RENDER FUNCTIONS ====================
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusBadge(status) {
    const s = (status || 'OPEN').toLowerCase();
    return `<span class="badge badge-${s}">${status}</span>`;
}

function getCategoryEmoji(cat) {
    const map = { MAINTENANCE: '🔧', ELECTRICAL: '⚡', PLUMBING: '🚰', CLEANLINESS: '🧹', SECURITY: '🔒', NETWORK: '🌐', TESTING: '🧪', OTHER: '📦' };
    return map[cat] || '📋';
}

function renderRecentTable(complaints) {
    const tbody = document.getElementById('recent-tbody');
    const empty = document.getElementById('recent-empty');
    if (!complaints.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    tbody.innerHTML = complaints.map(c => `
        <tr>
            <td><strong>${escHtml(c.title)}</strong></td>
            <td><span class="category-tag">${getCategoryEmoji(c.category)} ${c.category || 'N/A'}</span></td>
            <td>${getStatusBadge(c.status)}</td>
            <td style="color:var(--text3)">${formatDate(c.createdAt)}</td>
            <td><button class="action-btn" onclick="openStatusModal('${c.id}','${escHtml(c.title)}','${c.status}')">Update</button></td>
        </tr>
    `).join('');
}

function renderMyComplaints(complaints) {
    const grid = document.getElementById('my-complaints-grid');
    const empty = document.getElementById('my-empty');
    if (!complaints.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    grid.innerHTML = complaints.map(c => `
        <div class="complaint-card">
            <div class="complaint-card-header">
                <span class="complaint-card-title">${escHtml(c.title)}</span>
                ${getStatusBadge(c.status)}
            </div>
            <div class="complaint-card-body">${escHtml(c.description || '')}</div>
            <div class="complaint-card-footer">
                <span class="complaint-card-meta">${formatDate(c.createdAt)}</span>
                <span class="category-tag">${getCategoryEmoji(c.category)} ${c.category || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function renderAllComplaints(complaints) {
    const tbody = document.getElementById('all-tbody');
    const empty = document.getElementById('all-empty');
    if (!complaints.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    tbody.innerHTML = complaints.map(c => `
        <tr>
            <td><strong>${escHtml(c.title)}</strong></td>
            <td><span class="category-tag">${getCategoryEmoji(c.category)} ${c.category || 'N/A'}</span></td>
            <td style="font-size:.78rem;color:var(--text3)">${c.userId ? c.userId.substring(0, 8) + '...' : '-'}</td>
            <td>${getStatusBadge(c.status)}</td>
            <td style="color:var(--text3)">${formatDate(c.createdAt)}</td>
            <td><button class="action-btn" onclick="openStatusModal('${c.id}','${escHtml(c.title)}','${c.status}')">Update</button></td>
        </tr>
    `).join('');
}

function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ==================== TABS ====================
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    const titles = { 'dashboard': 'Dashboard', 'complaints': 'My Complaints', 'new-complaint': 'New Complaint', 'all-complaints': 'All Complaints' };
    document.getElementById('page-title').textContent = titles[tab] || 'Dashboard';
    const navMap = { 'dashboard': 'nav-dashboard', 'complaints': 'nav-complaints', 'new-complaint': 'nav-new', 'all-complaints': 'nav-all' };
    const navEl = document.getElementById(navMap[tab]);
    if (navEl) navEl.classList.add('active');
    if (tab === 'dashboard' || tab === 'complaints' || tab === 'all-complaints') loadDashboardData();
}

// ==================== CREATE COMPLAINT ====================
async function submitComplaint() {
    const title = document.getElementById('complaint-title').value.trim();
    const category = document.getElementById('complaint-category').value;
    const description = document.getElementById('complaint-desc').value.trim();
    if (!title || !category || !description) return showToast('Please fill all fields', 'error');
    toggleBtnLoading('submit-complaint-btn', true);
    try {
        const res = await fetch(API + '/complaints', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, description, userId: currentUser.id || 'anonymous' })
        });
        if (!res.ok) throw new Error('Failed to create complaint');
        await res.json();
        showToast('Complaint submitted successfully!', 'success');
        document.getElementById('complaint-title').value = '';
        document.getElementById('complaint-category').value = '';
        document.getElementById('complaint-desc').value = '';
        switchTab('dashboard');
    } catch (e) { showToast(e.message, 'error'); }
    toggleBtnLoading('submit-complaint-btn', false);
}

// ==================== STATUS UPDATE ====================
function openStatusModal(id, title, currentStatus) {
    selectedComplaintId = id;
    document.getElementById('modal-complaint-title').textContent = 'Complaint: ' + title;
    document.getElementById('new-status').value = currentStatus;
    document.getElementById('status-modal').classList.add('active');
}
function closeStatusModal() { document.getElementById('status-modal').classList.remove('active'); }
function closeModal(e) { if (e.target === e.currentTarget) closeStatusModal(); }

async function updateComplaintStatus() {
    const status = document.getElementById('new-status').value;
    try {
        const res = await fetch(API + '/complaints/' + selectedComplaintId + '/status?status=' + status, { method: 'PUT' });
        if (!res.ok) throw new Error('Failed to update');
        showToast('Status updated to ' + status, 'success');
        closeStatusModal();
        loadDashboardData();
    } catch (e) { showToast(e.message, 'error'); }
}

// ==================== FILTERS ====================
function filterMyComplaints(status) {
    updateFilterBtns(event.target);
    const filtered = status === 'ALL' ? myComplaints : myComplaints.filter(c => c.status === status);
    renderMyComplaints(filtered);
}
function filterAllComplaints(status) {
    updateFilterBtns(event.target);
    const filtered = status === 'ALL' ? allComplaints : allComplaints.filter(c => c.status === status);
    renderAllComplaints(filtered);
}
function updateFilterBtns(activeBtn) {
    activeBtn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

// ==================== SEARCH ====================
function handleSearch() {
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    if (!q) { renderRecentTable(allComplaints.slice(0, 10)); renderAllComplaints(allComplaints); return; }
    const filtered = allComplaints.filter(c =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q)
    );
    renderRecentTable(filtered);
    renderAllComplaints(filtered);
}

// ==================== SIDEBAR ====================
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

// ==================== TOAST ====================
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = 'all .3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ==================== UTILS ====================
function toggleBtnLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.querySelector('.btn-text').style.display = loading ? 'none' : '';
    btn.querySelector('.btn-loader').style.display = loading ? 'inline-block' : 'none';
    btn.disabled = loading;
}

// ==================== INIT ====================
(function init() {
    const saved = localStorage.getItem('user');
    if (saved) {
        try { currentUser = JSON.parse(saved); showDashboard(); } catch(e) { localStorage.removeItem('user'); }
    }
})();
