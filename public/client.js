const socket = io()

let Name;
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message_area')
do{
    prompt('Please, Enter your name: ')
}while(!Name)

textarea.addEventListener('keyUp', (e) => {
    if(e.key === 'Enter'){
        sendMessage(e.target.value)
    }
})

function sendMessage(msg){
    let msg = {
        user: Name,
        message: msg
    }

    //Append
    appendMessage(msg, 'outgoing')
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