const socket = io();

const joinRoomButton = document.getElementById("room-button");
const roomInput = document.getElementById("room-input");
const messageInput = document.getElementById("message-input");
const form = document.getElementById('chat-input');

socket.on("connection",() =>{
    displayMessage(`ID:${socket.id} 已連線`);
    socket.emit('custom-event', 10, 'hi' , {a : 'a'});
})

socket.on("receive-message", message =>{
    displayMessage(message, "text-left");
})

form.addEventListener("submit", e =>{
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value;

    if(message === "")return;
    displayMessage(message, "text-right");
    socket.emit("send-message", message, room);

    messageInput.value = "";
})

joinRoomButton.addEventListener("click", () =>{
    const room = roomInput.value;
    socket.emit('join-room', room);
    
})

function displayMessage(message, textClass){
    const div = document.createElement("div");
    div.textContent = message;
    div.classList.add(textClass);
    document.getElementById("chat-messages").append(div);

}