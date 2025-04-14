const socket = io()

let Name;
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message_area')
let sendButton = document.querySelector('#send-button')

do{
    Name = prompt('Please, Enter your name: ')
}while(!Name)

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
        message: message.trim()
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
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

// RECIEVE

socket.on('message', (msg) => {
    appendMessage(msg, 'incoming')
    scrollToBottom()
})

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}