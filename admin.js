// Admin Panel Functions
let isAdmin = false;
let selectedUserId = null;

function initializeAdminPanel() {
    // Check if user is admin (username === '243')
    isAdmin = currentUser && currentUser.username === '243';
    
    if (isAdmin) {
        document.getElementById('adminBtn').style.display = 'block';
        document.getElementById('adminBtn').addEventListener('click', showAdminPanel);
        initializeAdminTabs();
        initializeAdminModals();
    }
}

function showAdminPanel() {
    document.getElementById('friendsView').style.display = 'none';
    document.getElementById('chatView').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    
    loadAdminUsers();
}

function initializeAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
            
            // Load data for the tab
            switch(tabName) {
                case 'users':
                    loadAdminUsers();
                    break;
                case 'bans':
                    loadBannedUsers();
                    break;
                case 'mutes':
                    loadMutedUsers();
                    break;
                case 'calls':
                    loadCallHistory();
                    break;
                case 'logs':
                    loadAdminLogs();
                    break;
            }
        });
    });
}

async function loadAdminUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        const usersList = document.getElementById('adminUsersList');
        usersList.innerHTML = users.map(user => `
            <div class="admin-user-card">
                <div class="admin-user-info">
                    <div class="admin-user-avatar">${user.avatar || user.username.charAt(0).toUpperCase()}</div>
                    <div class="admin-user-details">
                        <h4>${user.username}</h4>
                        <p>${user.email} • ${user.status}</p>
                    </div>
                </div>
                <div class="admin-user-actions">
                    <button class="admin-btn-small btn-ban" onclick="showBanModal(${user.id}, '${user.username}')">Бан</button>
                    <button class="admin-btn-small btn-mute" onclick="showMuteModal(${user.id}, '${user.username}')">Мут</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadBannedUsers() {
    try {
        const response = await fetch('/api/admin/banned', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const banned = await response.json();
        
        const list = document.getElementById('adminBannedList');
        list.innerHTML = banned.length ? banned.map(ban => `
            <div class="admin-user-card">
                <div class="admin-user-info">
                    <div class="admin-user-avatar">${ban.username.charAt(0).toUpperCase()}</div>
                    <div class="admin-user-details">
                        <h4>${ban.username}</h4>
                        <p>Забанен: ${ban.banned_by_username} • ${ban.reason}</p>
                    </div>
                </div>
                <div class="admin-user-actions">
                    <button class="admin-btn-small btn-unban" onclick="unbanUser(${ban.user_id})">Разбанить</button>
                </div>
            </div>
        `).join('') : '<p>Нет забаненных пользователей</p>';
    } catch (error) {
        console.error('Error loading banned users:', error);
    }
}

async function loadMutedUsers() {
    try {
        const response = await fetch('/api/admin/muted', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const muted = await response.json();
        
        const list = document.getElementById('adminMutedList');
        list.innerHTML = muted.length ? muted.map(mute => `
            <div class="admin-user-card">
                <div class="admin-user-info">
                    <div class="admin-user-avatar">${mute.username.charAt(0).toUpperCase()}</div>
                    <div class="admin-user-details">
                        <h4>${mute.username}</h4>
                        <p>Замучен до: ${new Date(mute.muted_until).toLocaleString('ru-RU')}</p>
                        <p>${mute.reason}</p>
                    </div>
                </div>
                <div class="admin-user-actions">
                    <button class="admin-btn-small btn-unmute" onclick="unmuteUser(${mute.user_id})">Размутить</button>
                </div>
            </div>
        `).join('') : '<p>Нет замученных пользователей</p>';
    } catch (error) {
        console.error('Error loading muted users:', error);
    }
}

async function loadCallHistory() {
    try {
        const response = await fetch('/api/admin/calls', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const calls = await response.json();
        
        const list = document.getElementById('adminCallsList');
        list.innerHTML = calls.map(call => `
            <div class="admin-call-item">
                <div class="call-time">${new Date(call.started_at).toLocaleString('ru-RU')}</div>
                <div>
                    <strong>${call.caller_username}</strong> → <strong>${call.receiver_username}</strong>
                    <span class="call-status ${call.status}">${call.status}</span>
                </div>
                <div>Тип: ${call.call_type} • Длительность: <span class="call-duration">${formatCallDuration(call.duration || 0)}</span></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading call history:', error);
    }
}

async function loadAdminLogs() {
    try {
        const response = await fetch('/api/admin/logs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const logs = await response.json();
        
        const list = document.getElementById('adminLogsList');
        list.innerHTML = logs.map(log => `
            <div class="admin-log-item">
                <div class="log-time">${new Date(log.created_at).toLocaleString('ru-RU')}</div>
                <div class="log-action">${log.admin_username} → ${log.action} → ${log.target_username || 'N/A'}</div>
                <div class="log-details">${log.details || ''}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

function initializeAdminModals() {
    // Ban modal
    document.getElementById('confirmBan').addEventListener('click', async () => {
        const reason = document.getElementById('banReason').value;
        await banUser(selectedUserId, reason);
        document.getElementById('banModal').style.display = 'none';
    });
    
    document.getElementById('cancelBan').addEventListener('click', () => {
        document.getElementById('banModal').style.display = 'none';
    });
    
    // Mute modal
    document.getElementById('confirmMute').addEventListener('click', async () => {
        const reason = document.getElementById('muteReason').value;
        const duration = parseInt(document.getElementById('muteDuration').value);
        await muteUser(selectedUserId, reason, duration);
        document.getElementById('muteModal').style.display = 'none';
    });
    
    document.getElementById('cancelMute').addEventListener('click', () => {
        document.getElementById('muteModal').style.display = 'none';
    });
}

function showBanModal(userId, username) {
    selectedUserId = userId;
    document.getElementById('banUsername').textContent = `Забанить ${username}?`;
    document.getElementById('banModal').style.display = 'flex';
}

function showMuteModal(userId, username) {
    selectedUserId = userId;
    document.getElementById('muteUsername').textContent = `Замутить ${username}?`;
    document.getElementById('muteModal').style.display = 'flex';
}

async function banUser(userId, reason) {
    try {
        await fetch('/api/admin/ban', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, reason })
        });
        loadAdminUsers();
        loadBannedUsers();
        alert('Пользователь забанен');
    } catch (error) {
        console.error('Error banning user:', error);
        alert('Ошибка при бане пользователя');
    }
}

async function unbanUser(userId) {
    try {
        await fetch('/api/admin/unban', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        loadBannedUsers();
        alert('Пользователь разбанен');
    } catch (error) {
        console.error('Error unbanning user:', error);
        alert('Ошибка при разбане');
    }
}

async function muteUser(userId, reason, duration) {
    try {
        await fetch('/api/admin/mute', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, reason, duration })
        });
        loadAdminUsers();
        loadMutedUsers();
        alert('Пользователь замучен');
    } catch (error) {
        console.error('Error muting user:', error);
        alert('Ошибка при муте');
    }
}

async function unmuteUser(userId) {
    try {
        await fetch('/api/admin/unmute', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        loadMutedUsers();
        alert('Пользователь размучен');
    } catch (error) {
        console.error('Error unmuting user:', error);
        alert('Ошибка при размуте');
    }
}

function formatCallDuration(seconds) {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
