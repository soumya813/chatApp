const socket = io()

let Name;
let room;
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message_area')
let sendButton = document.querySelector('#send-button')
let notifySound;

// Add after DOMContentLoaded or at the end of the file if needed
window.addEventListener('DOMContentLoaded', () => {
    // Add notification sound element if not present
    if (!document.getElementById('notify-sound')) {
        notifySound = document.createElement('audio');
        notifySound.id = 'notify-sound';
        notifySound.src = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae0b7.mp3';
        notifySound.preload = 'auto';
        notifySound.style.display = 'none';
        document.body.appendChild(notifySound);
    } else {
        notifySound = document.getElementById('notify-sound');
    }
});

do{
    Name = prompt('Please, Enter your name: ')
}while(!Name)
do{
    room = prompt('Enter a room code to join or create:')
}while(!room)

// Join the room on the server
socket.emit('join-room', { room, Name });

// Show room code in the UI
const roomInfo = document.getElementById('room-info');
if (roomInfo) {
    roomInfo.textContent = `Room code: ${room}  |  Share this code with friends to chat privately!`;
}

// Handle Enter key press
textarea.addEventListener('keyup', (e) => {
    if(e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage(textarea.value)
    }
})

// Handle button click
sendButton.addEventListener('click', () => {
    sendMessage(textarea.value)
})

function sendMessage(message){
    if(message.trim().length === 0) return
    let msg = {
        user: Name,
        message: message.trim(),
        timestamp: getTimestamp(),
        room
    }
    //Append
    appendMessage(msg, 'outgoing')
    textarea.value = ''
    scrollToBottom()

    //Send to server

    socket.emit('message', msg)
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div')
    let className = type
    mainDiv.classList.add(className, 'message')

    let markup = `
    <h4>${msg.user}</h4>
    <p>${msg.message}</p>
    <span style="display:block;font-size:12px;color:#888;margin-top:8px;text-align:right;">${msg.timestamp ? msg.timestamp : ''}</span>
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

// RECIEVE

socket.on('message', (msg) => {
    appendMessage(msg, 'incoming')
    scrollToBottom()
    if (notifySound) notifySound.play()
})

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}

// --- Timestamp feature ---
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- Typing indicator ---
let typing = false;
let typingTimeout;
let typingIndicator = document.getElementById('typing-indicator');
if (!typingIndicator) {
    typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.style.height = '18px';
    typingIndicator.style.color = '#888';
    typingIndicator.style.fontSize = '13px';
    typingIndicator.style.padding = '0 0 0 10px';
    typingIndicator.style.marginBottom = '2px';
    messageArea.parentNode.insertBefore(typingIndicator, messageArea.nextSibling);
}

textarea.addEventListener('input', () => {
    if (!typing) {
        typing = true;
        socket.emit('typing', Name);
        typingTimeout = setTimeout(stopTyping, 2000);
    } else {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(stopTyping, 2000);
    }
});
function stopTyping() {
    typing = false;
    socket.emit('stop-typing', Name);
}
socket.on('typing', (user) => {
    if (user !== Name) typingIndicator.textContent = `${user} is typing...`;
});
socket.on('stop-typing', (user) => {
    typingIndicator.textContent = '';
});

// --- Online users list ---
let usersList = document.getElementById('users-list');
if (!usersList) {
    // Add users list bar above message area
    usersList = document.createElement('ul');
    usersList.id = 'users-list';
    usersList.style.display = 'flex';
    usersList.style.gap = '8px';
    usersList.style.listStyle = 'none';
    usersList.style.padding = '6px 16px';
    usersList.style.margin = '0';
    usersList.style.background = '#f8f9fa';
    usersList.style.borderBottom = '1px solid #eee';
    messageArea.parentNode.insertBefore(usersList, messageArea);
}

socket.on('users-list', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        let li = document.createElement('li');
        li.textContent = user;
        li.style.background = '#e0e0e0';
        li.style.color = '#333';
        li.style.padding = '4px 12px';
        li.style.borderRadius = '12px';
        li.style.fontSize = '14px';
        usersList.appendChild(li);
    });
    window._lastUsersList = [...users];
});

// --- Emoji picker ---
let emojiBtn = document.getElementById('emoji-btn');
if (!emojiBtn) {
    emojiBtn = document.createElement('button');
    emojiBtn.id = 'emoji-btn';
    emojiBtn.title = 'Add emoji';
    emojiBtn.textContent = '😊';
    emojiBtn.style.background = 'none';
    emojiBtn.style.border = 'none';
    emojiBtn.style.fontSize = '22px';
    emojiBtn.style.cursor = 'pointer';
    emojiBtn.style.marginRight = '5px';
    sendButton.parentNode.insertBefore(emojiBtn, textarea);
}
emojiBtn.addEventListener('click', () => {
    const emojis = ['😊','😂','😍','😎','👍','🙏','🎉','❤️','🔥','🥳'];
    let picker = document.createElement('div');
    picker.style.position = 'absolute';
    picker.style.bottom = '60px';
    picker.style.left = '10px';
    picker.style.background = '#fff';
    picker.style.border = '1px solid #ccc';
    picker.style.borderRadius = '8px';
    picker.style.padding = '8px';
    picker.style.display = 'flex';
    picker.style.gap = '8px';
    picker.style.zIndex = 1000;
    emojis.forEach(emoji => {
        let btn = document.createElement('button');
        btn.textContent = emoji;
        btn.style.fontSize = '22px';
        btn.style.background = 'none';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            textarea.value += emoji;
            document.body.removeChild(picker);
            textarea.focus();
        };
        picker.appendChild(btn);
    });
    picker.addEventListener('mouseleave', () => {
        if (document.body.contains(picker)) document.body.removeChild(picker);
    });
    document.body.appendChild(picker);
});

// --- Dark mode toggle ---
let darkModeToggle = document.getElementById('dark-mode-toggle');
if (!darkModeToggle) {
    darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.title = 'Toggle dark mode';
    darkModeToggle.textContent = '🌙';
    darkModeToggle.style.marginLeft = '10px';
    darkModeToggle.style.fontSize = '20px';
    darkModeToggle.style.background = 'none';
    darkModeToggle.style.border = 'none';
    darkModeToggle.style.cursor = 'pointer';
    document.querySelector('.brand')?.appendChild(darkModeToggle);
}
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = '☀️';
    } else {
        darkModeToggle.textContent = '🌙';
    }
});
if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}