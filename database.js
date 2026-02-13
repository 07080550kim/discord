const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'discord_clone.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                avatar TEXT,
                status TEXT DEFAULT 'Online',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Servers table
        db.run(`
            CREATE TABLE IF NOT EXISTS servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                icon TEXT,
                owner_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            )
        `);

        // Channels table
        db.run(`
            CREATE TABLE IF NOT EXISTS channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                server_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (server_id) REFERENCES servers(id)
            )
        `);

        // Messages table
        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                user_id INTEGER,
                channel_id INTEGER,
                reply_to INTEGER,
                pinned BOOLEAN DEFAULT 0,
                edited BOOLEAN DEFAULT 0,
                deleted BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                edited_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (channel_id) REFERENCES channels(id),
                FOREIGN KEY (reply_to) REFERENCES messages(id)
            )
        `);

        // Direct messages table
        db.run(`
            CREATE TABLE IF NOT EXISTS direct_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                sender_id INTEGER,
                receiver_id INTEGER,
                read BOOLEAN DEFAULT 0,
                reply_to INTEGER,
                edited BOOLEAN DEFAULT 0,
                deleted BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                edited_at DATETIME,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id),
                FOREIGN KEY (reply_to) REFERENCES direct_messages(id)
            )
        `);

        // File uploads table
        db.run(`
            CREATE TABLE IF NOT EXISTS file_uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                filetype TEXT,
                filesize INTEGER,
                user_id INTEGER,
                channel_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (channel_id) REFERENCES channels(id)
            )
        `);

        // Reactions table
        db.run(`
            CREATE TABLE IF NOT EXISTS reactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emoji TEXT NOT NULL,
                message_id INTEGER,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(message_id, user_id, emoji)
            )
        `);

        // Server members table
        db.run(`
            CREATE TABLE IF NOT EXISTS server_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_id INTEGER,
                user_id INTEGER,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (server_id) REFERENCES servers(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(server_id, user_id)
            )
        `);

        // Friends table
        db.run(`
            CREATE TABLE IF NOT EXISTS friends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                friend_id INTEGER,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (friend_id) REFERENCES users(id),
                UNIQUE(user_id, friend_id)
            )
        `);

        // Admin logs table
        db.run(`
            CREATE TABLE IF NOT EXISTS admin_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER,
                action TEXT NOT NULL,
                target_user_id INTEGER,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id),
                FOREIGN KEY (target_user_id) REFERENCES users(id)
            )
        `);

        // Banned users table
        db.run(`
            CREATE TABLE IF NOT EXISTS banned_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                banned_by INTEGER,
                reason TEXT,
                banned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (banned_by) REFERENCES users(id),
                UNIQUE(user_id)
            )
        `);

        // Muted users table
        db.run(`
            CREATE TABLE IF NOT EXISTS muted_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                muted_by INTEGER,
                reason TEXT,
                muted_until DATETIME,
                muted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (muted_by) REFERENCES users(id)
            )
        `);

        // Call logs table
        db.run(`
            CREATE TABLE IF NOT EXISTS call_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                caller_id INTEGER,
                receiver_id INTEGER,
                call_type TEXT,
                duration INTEGER,
                status TEXT,
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ended_at DATETIME,
                FOREIGN KEY (caller_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )
        `);

        // Typing indicators table (temporary storage)
        db.run(`
            CREATE TABLE IF NOT EXISTS typing_indicators (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                channel_id INTEGER,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (channel_id) REFERENCES channels(id),
                UNIQUE(user_id, channel_id)
            )
        `);

        console.log('Database initialized successfully');
    });
}

// User operations
const userDB = {
    create: (username, email, hashedPassword) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.run(sql, [username, email, hashedPassword], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, username, email });
            });
        });
    },

    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            db.get(sql, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, username, email, avatar, status FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    updateStatus: (id, status) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET status = ? WHERE id = ?';
            db.run(sql, [status, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    updateAvatar: (id, avatarUrl) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET avatar = ? WHERE id = ?';
            db.run(sql, [avatarUrl, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    updateUsername: (id, username) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET username = ? WHERE id = ?';
            db.run(sql, [username, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    isAdmin: (username) => {
        return username === '243';
    },

    getAll: () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, username, email, avatar, status FROM users';
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// Message operations
const messageDB = {
    create: (content, userId, channelId, replyTo = null) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO messages (content, user_id, channel_id, reply_to) VALUES (?, ?, ?, ?)';
            db.run(sql, [content, userId, channelId, replyTo], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, content, userId, channelId, replyTo });
            });
        });
    },

    getByChannel: (channelId, limit = 50) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT m.*, u.username, u.avatar,
                       rm.content as reply_content, ru.username as reply_username
                FROM messages m 
                JOIN users u ON m.user_id = u.id 
                LEFT JOIN messages rm ON m.reply_to = rm.id
                LEFT JOIN users ru ON rm.user_id = ru.id
                WHERE m.channel_id = ? AND m.deleted = 0
                ORDER BY m.created_at DESC 
                LIMIT ?
            `;
            db.all(sql, [channelId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.reverse());
            });
        });
    },

    edit: (messageId, newContent, userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE messages SET content = ?, edited = 1, edited_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
            db.run(sql, [newContent, messageId, userId], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    delete: (messageId, userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE messages SET deleted = 1, content = "[Сообщение удалено]" WHERE id = ? AND user_id = ?';
            db.run(sql, [messageId, userId], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    pin: (messageId) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE messages SET pinned = 1 WHERE id = ?';
            db.run(sql, [messageId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    unpin: (messageId) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE messages SET pinned = 0 WHERE id = ?';
            db.run(sql, [messageId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getPinned: (channelId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT m.*, u.username, u.avatar 
                FROM messages m 
                JOIN users u ON m.user_id = u.id 
                WHERE m.channel_id = ? AND m.pinned = 1 AND m.deleted = 0
                ORDER BY m.created_at DESC
            `;
            db.all(sql, [channelId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    search: (channelId, query) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT m.*, u.username, u.avatar 
                FROM messages m 
                JOIN users u ON m.user_id = u.id 
                WHERE m.channel_id = ? AND m.content LIKE ? AND m.deleted = 0
                ORDER BY m.created_at DESC
                LIMIT 50
            `;
            db.all(sql, [channelId, `%${query}%`], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// Direct message operations
const dmDB = {
    create: (content, senderId, receiverId) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO direct_messages (content, sender_id, receiver_id) VALUES (?, ?, ?)';
            db.run(sql, [content, senderId, receiverId], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, content, senderId, receiverId });
            });
        });
    },

    getConversation: (userId1, userId2, limit = 50) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT dm.*, u.username, u.avatar 
                FROM direct_messages dm 
                JOIN users u ON dm.sender_id = u.id 
                WHERE (dm.sender_id = ? AND dm.receiver_id = ?) 
                   OR (dm.sender_id = ? AND dm.receiver_id = ?)
                ORDER BY dm.created_at DESC 
                LIMIT ?
            `;
            db.all(sql, [userId1, userId2, userId2, userId1, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.reverse());
            });
        });
    },

    markAsRead: (messageId) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE direct_messages SET read = 1 WHERE id = ?';
            db.run(sql, [messageId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

// File operations
const fileDB = {
    create: (filename, filepath, filetype, filesize, userId, channelId) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO file_uploads (filename, filepath, filetype, filesize, user_id, channel_id) VALUES (?, ?, ?, ?, ?, ?)';
            db.run(sql, [filename, filepath, filetype, filesize, userId, channelId], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, filename, filepath });
            });
        });
    },

    getByChannel: (channelId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT f.*, u.username 
                FROM file_uploads f 
                JOIN users u ON f.user_id = u.id 
                WHERE f.channel_id = ? 
                ORDER BY f.created_at DESC
            `;
            db.all(sql, [channelId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// Reaction operations
const reactionDB = {
    add: (emoji, messageId, userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT OR IGNORE INTO reactions (emoji, message_id, user_id) VALUES (?, ?, ?)';
            db.run(sql, [emoji, messageId, userId], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, emoji, messageId, userId });
            });
        });
    },

    remove: (emoji, messageId, userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM reactions WHERE emoji = ? AND message_id = ? AND user_id = ?';
            db.run(sql, [emoji, messageId, userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getByMessage: (messageId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT r.emoji, COUNT(*) as count, GROUP_CONCAT(u.username) as users
                FROM reactions r
                JOIN users u ON r.user_id = u.id
                WHERE r.message_id = ?
                GROUP BY r.emoji
            `;
            db.all(sql, [messageId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// Friend operations
const friendDB = {
    sendRequest: (userId, friendId) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT OR IGNORE INTO friends (user_id, friend_id, status) VALUES (?, ?, "pending")';
            db.run(sql, [userId, friendId], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    },

    acceptRequest: (userId, friendId) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Update the request status
                const sql1 = 'UPDATE friends SET status = "accepted" WHERE user_id = ? AND friend_id = ?';
                db.run(sql1, [friendId, userId], (err) => {
                    if (err) return reject(err);
                });

                // Create reverse relationship
                const sql2 = 'INSERT OR IGNORE INTO friends (user_id, friend_id, status) VALUES (?, ?, "accepted")';
                db.run(sql2, [userId, friendId], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    },

    rejectRequest: (userId, friendId) => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM friends WHERE user_id = ? AND friend_id = ?';
            db.run(sql, [friendId, userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    removeFriend: (userId, friendId) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                const sql1 = 'DELETE FROM friends WHERE user_id = ? AND friend_id = ?';
                const sql2 = 'DELETE FROM friends WHERE user_id = ? AND friend_id = ?';
                
                db.run(sql1, [userId, friendId], (err) => {
                    if (err) return reject(err);
                });
                
                db.run(sql2, [friendId, userId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    },

    getFriends: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT u.id, u.username, u.email, u.avatar, u.status, f.status as friendship_status
                FROM friends f
                JOIN users u ON f.friend_id = u.id
                WHERE f.user_id = ? AND f.status = 'accepted'
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getPendingRequests: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT u.id, u.username, u.email, u.avatar, u.status
                FROM friends f
                JOIN users u ON f.user_id = u.id
                WHERE f.friend_id = ? AND f.status = 'pending'
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    checkFriendship: (userId, friendId) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM friends WHERE user_id = ? AND friend_id = ? AND status = "accepted"';
            db.get(sql, [userId, friendId], (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            });
        });
    }
};

// Server operations
const serverDB = {
    create: (name, ownerId) => {
        return new Promise((resolve, reject) => {
            const icon = name.charAt(0).toUpperCase();
            const sql = 'INSERT INTO servers (name, icon, owner_id) VALUES (?, ?, ?)';
            db.run(sql, [name, icon, ownerId], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, icon, ownerId });
            });
        });
    },

    getUserServers: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT s.* FROM servers s
                JOIN server_members sm ON s.id = sm.server_id
                WHERE sm.user_id = ?
                ORDER BY s.created_at ASC
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    addMember: (serverId, userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT OR IGNORE INTO server_members (server_id, user_id) VALUES (?, ?)';
            db.run(sql, [serverId, userId], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getMembers: (serverId) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT u.id, u.username, u.avatar, u.status
                FROM users u
                JOIN server_members sm ON u.id = sm.user_id
                WHERE sm.server_id = ?
            `;
            db.all(sql, [serverId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// Admin operations
const adminDB = {
    logAction: (adminId, action, targetUserId, details) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO admin_logs (admin_id, action, target_user_id, details) VALUES (?, ?, ?, ?)';
            db.run(sql, [adminId, action, targetUserId, details], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    },

    getLogs: (limit = 100) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT al.*, u1.username as admin_username, u2.username as target_username
                FROM admin_logs al
                JOIN users u1 ON al.admin_id = u1.id
                LEFT JOIN users u2 ON al.target_user_id = u2.id
                ORDER BY al.created_at DESC
                LIMIT ?
            `;
            db.all(sql, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    banUser: (userId, bannedBy, reason) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT OR REPLACE INTO banned_users (user_id, banned_by, reason) VALUES (?, ?, ?)';
            db.run(sql, [userId, bannedBy, reason], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    unbanUser: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM banned_users WHERE user_id = ?';
            db.run(sql, [userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    isBanned: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM banned_users WHERE user_id = ?';
            db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            });
        });
    },

    muteUser: (userId, mutedBy, reason, duration) => {
        return new Promise((resolve, reject) => {
            const mutedUntil = new Date(Date.now() + duration * 60000).toISOString();
            const sql = 'INSERT OR REPLACE INTO muted_users (user_id, muted_by, reason, muted_until) VALUES (?, ?, ?, ?)';
            db.run(sql, [userId, mutedBy, reason, mutedUntil], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    unmuteUser: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM muted_users WHERE user_id = ?';
            db.run(sql, [userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    isMuted: (userId) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM muted_users WHERE user_id = ? AND muted_until > datetime("now")';
            db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            });
        });
    },

    getBannedUsers: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT bu.*, u1.username, u2.username as banned_by_username
                FROM banned_users bu
                JOIN users u1 ON bu.user_id = u1.id
                JOIN users u2 ON bu.banned_by = u2.id
                ORDER BY bu.banned_at DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getMutedUsers: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT mu.*, u1.username, u2.username as muted_by_username
                FROM muted_users mu
                JOIN users u1 ON mu.user_id = u1.id
                JOIN users u2 ON mu.muted_by = u2.id
                WHERE mu.muted_until > datetime("now")
                ORDER BY mu.muted_at DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// Call logs operations
const callLogDB = {
    create: (callerId, receiverId, callType) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO call_logs (caller_id, receiver_id, call_type, status) VALUES (?, ?, ?, "initiated")';
            db.run(sql, [callerId, receiverId, callType], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    },

    updateStatus: (callId, status) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE call_logs SET status = ? WHERE id = ?';
            db.run(sql, [status, callId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    endCall: (callId, duration) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE call_logs SET ended_at = CURRENT_TIMESTAMP, duration = ?, status = "completed" WHERE id = ?';
            db.run(sql, [duration, callId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    },

    getHistory: (userId, limit = 50) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT cl.*, 
                       u1.username as caller_username, u1.avatar as caller_avatar,
                       u2.username as receiver_username, u2.avatar as receiver_avatar
                FROM call_logs cl
                JOIN users u1 ON cl.caller_id = u1.id
                JOIN users u2 ON cl.receiver_id = u2.id
                WHERE cl.caller_id = ? OR cl.receiver_id = ?
                ORDER BY cl.started_at DESC
                LIMIT ?
            `;
            db.all(sql, [userId, userId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getAllHistory: (limit = 100) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT cl.*, 
                       u1.username as caller_username,
                       u2.username as receiver_username
                FROM call_logs cl
                JOIN users u1 ON cl.caller_id = u1.id
                JOIN users u2 ON cl.receiver_id = u2.id
                ORDER BY cl.started_at DESC
                LIMIT ?
            `;
            db.all(sql, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = {
    db,
    initializeDatabase,
    userDB,
    messageDB,
    dmDB,
    fileDB,
    reactionDB,
    friendDB,
    serverDB,
    adminDB,
    callLogDB
};