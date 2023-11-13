// 伺服器端程式碼
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// 設定根目錄為靜態資源目錄
app.use(express.static(path.join(__dirname)));

// 伺服器端路由等其他設定..
io.on('connection', socket =>{
    socket.on("send-message", (message,room) => {
        if(room === ""){
            socket.broadcast.emit('receive-message',message);
        }else{
            socket.broadcast.to(room).emit('receive-message',message);
        }
    })
    socket.on("join-room",room => {
        socket.join(room);
    })
});

const port = 8080;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});