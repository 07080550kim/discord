// Additional Features for Discord Clone

// Markdown parser
function parseMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Bold **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic *text*
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code `code`
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Mentions @username
    text = text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Notification sound
function playNotificationSound(type = 'message') {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDajzsKElyx6OyrWBQLSKDf8sFuIwUrgc7y2Yk2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsz');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Sound error'));
    } catch (e) {
        console.log('Sound not supported');
    }
}

// Desktop notification
function showDesktopNotification(title, body, icon) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: body, icon: icon || '/favicon.ico' });
            }
        });
    }
}

// Format timestamp
function formatTimestamp(date) {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return messageDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Debounce for typing indicator
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Common emojis
const commonEmojis = [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
    '😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨',
    '😐','😑','😶','😏','😒','🙄','😬','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢',
    '🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️',
    '😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞',
    '😓','😩','😫','🥱','😤','😡','😠','🤬','👍','👎','👌','✌️','🤞','🤟','🤘','🤙',
    '👈','👉','👆','👇','☝️','👋','🤚','🖐️','✋','🖖','👏','🙌','👐','🤲','🤝','🙏',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖',
    '💘','💝','💟','🔥','💯','✨','⭐','🌟','💫','🎉','🎊','🎈','🎁','🏆','🥇','🥈',
    '🥉','🎮','🎯','🎲','🎭','🎨','🎬','🎤','🎧','🎵','🎶','🎹','🎸','🎺','🎻','🥁'
];

// Emoji picker initialization
function initializeEmojiPickerNew() {
    const emojiBtn = document.querySelector('.emoji-btn');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiContent = document.getElementById('emojiPickerContent');
    const emojiSearch = document.getElementById('emojiSearch');
    
    // Populate emoji picker
    emojiContent.innerHTML = commonEmojis.map(emoji => 
        `<div class="emoji-item" data-emoji="${emoji}">${emoji}</div>`
    ).join('');
    
    // Toggle picker
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'flex' : 'none';
    });
    
    // Select emoji
    emojiContent.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-item')) {
            const emoji = e.target.dataset.emoji;
            const messageInput = document.getElementById('messageInput');
            messageInput.value += emoji;
            messageInput.focus();
        }
    });
    
    // Search emojis
    emojiSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.emoji-item').forEach(item => {
            item.style.display = query === '' || item.dataset.emoji.includes(query) ? 'block' : 'none';
        });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
            emojiPicker.style.display = 'none';
        }
    });
}

// Message context menu
let selectedMessageId = null;
let selectedMessageContent = null;

function initializeMessageContextMenu() {
    const contextMenu = document.getElementById('messageContextMenu');
    
    // Show context menu on right click
    document.addEventListener('contextmenu', (e) => {
        const messageEl = e.target.closest('.message');
        if (messageEl && messageEl.dataset.messageId) {
            e.preventDefault();
            selectedMessageId = messageEl.dataset.messageId;
            selectedMessageContent = messageEl.querySelector('.message-text').textContent;
            
            contextMenu.style.display = 'block';
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
        }
    });
    
    // Hide context menu
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
    
    // Context menu actions
    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action) return;
        
        switch(action) {
            case 'reply':
                replyToMessage(selectedMessageId);
                break;
            case 'edit':
                editMessage(selectedMessageId, selectedMessageContent);
                break;
            case 'delete':
                deleteMessage(selectedMessageId);
                break;
            case 'pin':
                pinMessage(selectedMessageId);
                break;
            case 'copy':
                navigator.clipboard.writeText(selectedMessageContent);
                break;
        }
        
        contextMenu.style.display = 'none';
    });
}

// Reply to message
let replyToMessageId = null;

function replyToMessage(messageId) {
    replyToMessageId = messageId;
    const messageInput = document.getElementById('messageInput');
    messageInput.placeholder = `Ответ на сообщение #${messageId}...`;
    messageInput.focus();
}

// Edit message
function editMessage(messageId, content) {
    document.getElementById('editMessageText').value = content;
    document.getElementById('editMessageModal').style.display = 'flex';
    
    document.getElementById('confirmEdit').onclick = async () => {
        const newContent = document.getElementById('editMessageText').value;
        
        try {
            await fetch(`/api/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent })
            });
            
            socket.emit('edit-message', {
                messageId,
                newContent,
                channelId: currentChannel
            });
            
            document.getElementById('editMessageModal').style.display = 'none';
        } catch (error) {
            console.error('Error editing message:', error);
        }
    };
}

// Delete message
function deleteMessage(messageId) {
    if (!confirm('Удалить это сообщение?')) return;
    
    fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
        socket.emit('delete-message', {
            messageId,
            channelId: currentChannel
        });
    }).catch(error => {
        console.error('Error deleting message:', error);
    });
}

// Pin message
function pinMessage(messageId) {
    fetch(`/api/messages/${messageId}/pin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
        socket.emit('pin-message', {
            messageId,
            channelId: currentChannel
        });
        loadPinnedMessages();
    }).catch(error => {
        console.error('Error pinning message:', error);
    });
}

// Load pinned messages
async function loadPinnedMessages() {
    try {
        const response = await fetch(`/api/messages/${currentChannel}/pinned`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pinned = await response.json();
        
        const pinnedBar = document.getElementById('pinnedMessagesBar');
        const pinnedContent = document.getElementById('pinnedContent');
        
        if (pinned.length > 0) {
            pinnedBar.style.display = 'flex';
            pinnedContent.textContent = `${pinned.length} закрепленных сообщений`;
        } else {
            pinnedBar.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading pinned messages:', error);
    }
}

// Typing indicator
let typingTimeout;
const typingUsers = new Set();

function initializeTypingIndicator() {
    const messageInput = document.getElementById('messageInput');
    
    const sendTypingStart = debounce(() => {
        socket.emit('typing-start', { channelId: currentChannel });
    }, 300);
    
    messageInput.addEventListener('input', () => {
        sendTypingStart();
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing-stop', { channelId: currentChannel });
        }, 3000);
    });
    
    messageInput.addEventListener('blur', () => {
        socket.emit('typing-stop', { channelId: currentChannel });
    });
}

// Socket events for typing
function setupTypingEvents() {
    socket.on('user-typing', (data) => {
        if (data.channelId === currentChannel) {
            typingUsers.add(data.userId);
            updateTypingIndicator();
        }
    });
    
    socket.on('user-stop-typing', (data) => {
        typingUsers.delete(data.userId);
        updateTypingIndicator();
    });
}

function updateTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    const usersSpan = document.getElementById('typingUsers');
    
    if (typingUsers.size > 0) {
        const usernames = Array.from(typingUsers).slice(0, 3).join(', ');
        usersSpan.textContent = usernames;
        indicator.style.display = 'block';
    } else {
        indicator.style.display = 'none';
    }
}

// Message search
function initializeMessageSearch() {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    // Toggle search with Ctrl+F
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
            if (searchBar.style.display === 'block') {
                searchInput.focus();
            }
        }
    });
    
    // Search messages
    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        try {
            const response = await fetch(`/api/messages/${currentChannel}/search?q=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const messages = await response.json();
            
            searchResults.innerHTML = messages.map(msg => `
                <div class="search-result-item" data-message-id="${msg.id}">
                    <div class="search-result-author">${msg.username}</div>
                    <div class="search-result-content">${parseMarkdown(msg.content)}</div>
                    <div class="search-result-time">${formatTimestamp(msg.created_at)}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error searching messages:', error);
        }
    }, 500));
}

// Avatar upload
function initializeAvatarUpload() {
    const userAvatar = document.querySelector('.user-avatar');
    const avatarModal = document.getElementById('avatarModal');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    
    userAvatar.addEventListener('click', () => {
        avatarModal.style.display = 'flex';
    });
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('confirmAvatar').addEventListener('click', async () => {
        const file = avatarInput.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        try {
            const response = await fetch('/api/user/avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            
            userAvatar.style.backgroundImage = `url(${data.avatarUrl})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.textContent = '';
            
            avatarModal.style.display = 'none';
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    });
    
    document.getElementById('cancelAvatar').addEventListener('click', () => {
        avatarModal.style.display = 'none';
    });
    
    document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('editMessageModal').style.display = 'none';
    });
}

// Socket event handlers for new features
function setupNewSocketEvents() {
    // Message edited
    socket.on('message-edited', (data) => {
        const messageEl = document.querySelector(`[data-message-id="${data.messageId}"]`);
        if (messageEl) {
            messageEl.querySelector('.message-text').innerHTML = parseMarkdown(data.newContent);
            messageEl.classList.add('edited');
        }
    });
    
    // Message deleted
    socket.on('message-deleted', (data) => {
        const messageEl = document.querySelector(`[data-message-id="${data.messageId}"]`);
        if (messageEl) {
            messageEl.querySelector('.message-text').textContent = '[Сообщение удалено]';
            messageEl.classList.add('deleted');
        }
    });
    
    // Message pinned
    socket.on('message-pinned', (data) => {
        if (data.channelId === currentChannel) {
            loadPinnedMessages();
        }
    });
    
    // Message unpinned
    socket.on('message-unpinned', (data) => {
        if (data.channelId === currentChannel) {
            loadPinnedMessages();
        }
    });
    
    // Error message (e.g., user is muted)
    socket.on('error-message', (data) => {
        alert(data.error);
    });
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Initialize all new features
function initializeAllNewFeatures() {
    initializeEmojiPickerNew();
    initializeMessageContextMenu();
    initializeTypingIndicator();
    initializeMessageSearch();
    initializeAvatarUpload();
    setupTypingEvents();
    setupNewSocketEvents();
    requestNotificationPermission();
    
    // Close pinned bar
    document.getElementById('closePinnedBar').addEventListener('click', () => {
        document.getElementById('pinnedMessagesBar').style.display = 'none';
    });
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseMarkdown,
        playNotificationSound,
        showDesktopNotification,
        formatTimestamp,
        initializeAllNewFeatures
    };
}


// Voice activity detection with custom icons
function setupVoiceActivityIcons() {
    // Update mute button icons
    const muteBtn = document.getElementById('muteBtn');
    const deafenBtn = document.getElementById('deafenBtn');
    
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            muteBtn.classList.toggle('muted');
            const isMuted = muteBtn.classList.contains('muted');
            
            // Update all icon visibility
            const normalIcons = muteBtn.querySelectorAll('.icon-normal');
            const slashedIcons = muteBtn.querySelectorAll('.icon-slashed');
            
            normalIcons.forEach(icon => {
                icon.style.display = isMuted ? 'none' : 'inline';
            });
            
            slashedIcons.forEach(icon => {
                icon.style.display = isMuted ? 'inline' : 'none';
            });
        });
    }
    
    if (deafenBtn) {
        deafenBtn.addEventListener('click', () => {
            deafenBtn.classList.toggle('deafened');
            const isDeafened = deafenBtn.classList.contains('deafened');
            
            const normalIcons = deafenBtn.querySelectorAll('.icon-normal');
            const slashedIcons = deafenBtn.querySelectorAll('.icon-slashed');
            
            normalIcons.forEach(icon => {
                icon.style.display = isDeafened ? 'none' : 'inline';
            });
            
            slashedIcons.forEach(icon => {
                icon.style.display = isDeafened ? 'inline' : 'none';
            });
        });
    }
}

// Voice activity animation
function animateMicActivity(userId, isSpeaking) {
    const userElement = document.querySelector(`[data-user-id="${userId}"]`);
    if (!userElement) return;
    
    if (isSpeaking) {
        userElement.classList.add('speaking');
        
        // Add mic active icon
        const micIcon = userElement.querySelector('.participant-mic');
        if (micIcon) {
            micIcon.style.backgroundImage = 'url(assets/mic-active.png)';
        }
    } else {
        userElement.classList.remove('speaking');
        
        // Restore normal mic icon
        const micIcon = userElement.querySelector('.participant-mic');
        if (micIcon) {
            micIcon.style.backgroundImage = 'url(assets/mic-inactive.png)';
        }
    }
}

// Update call control button with custom icon
function updateCallControlIcon(buttonId, isActive) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (isActive) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
    
    // Special handling for audio button
    if (buttonId === 'toggleAudioBtn') {
        const micIcon = button.querySelector('.mic-icon-active');
        if (micIcon) {
            if (isActive) {
                micIcon.classList.add('speaking');
            } else {
                micIcon.classList.remove('speaking');
                button.classList.add('muted');
            }
        }
    }
}

// Add muted badge to user avatar
function addMutedBadge(userId) {
    const userAvatar = document.querySelector(`[data-user-id="${userId}"] .user-avatar`);
    if (!userAvatar) return;
    
    // Remove existing badge
    const existingBadge = userAvatar.querySelector('.user-muted-badge');
    if (existingBadge) return;
    
    // Add new badge
    const badge = document.createElement('div');
    badge.className = 'user-muted-badge';
    userAvatar.style.position = 'relative';
    userAvatar.appendChild(badge);
}

// Remove muted badge from user avatar
function removeMutedBadge(userId) {
    const badge = document.querySelector(`[data-user-id="${userId}"] .user-muted-badge`);
    if (badge) {
        badge.remove();
    }
}

// Update favicon based on state
function updateFavicon(state) {
    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    
    switch(state) {
        case 'muted':
            favicon.href = 'assets/muted.png';
            break;
        case 'active':
            favicon.href = 'assets/mic-active.png';
            break;
        case 'inactive':
            favicon.href = 'assets/mic-inactive.png';
            break;
        default:
            favicon.href = 'assets/icon.png';
    }
}

// Initialize custom icons
function initializeCustomIcons() {
    setupVoiceActivityIcons();
    
    // Add favicon if not exists
    if (!document.querySelector('link[rel="icon"]')) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = 'assets/icon.png';
        document.head.appendChild(link);
    }
    
    // Listen for voice activity events
    if (typeof socket !== 'undefined') {
        socket.on('user-speaking', (data) => {
            animateMicActivity(data.userId, data.speaking);
        });
        
        socket.on('user-muted', (data) => {
            addMutedBadge(data.userId);
        });
        
        socket.on('user-unmuted', (data) => {
            removeMutedBadge(data.userId);
        });
    }
}

// Add to initialization
if (typeof initializeAllNewFeatures !== 'undefined') {
    const originalInit = initializeAllNewFeatures;
    initializeAllNewFeatures = function() {
        originalInit();
        initializeCustomIcons();
    };
} else {
    // Call directly if not wrapped
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCustomIcons);
    } else {
        initializeCustomIcons();
    }
}
