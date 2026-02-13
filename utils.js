// Markdown parser
const parseMarkdown = (text) => {
    if (!text) return '';
    text = text.replace(/&/g, '&').replace(/</g, '&lt;').replace(/>/g, '>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    text = text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    return text;
};

// Notification sounds
const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1f');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Sound error'));
};

// Common emojis
const commonEmojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','👍','👎','👌','✌️','🤞','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🔥','💯','✨','⭐','🌟','💫','🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉'];
