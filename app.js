// 伺服器端程式碼
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const rooms = {};


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// 設定根目錄為靜態資源目錄
app.use(express.static(path.join(__dirname)));

// 伺服器端路由等其他設定..
io.on('connection', socket =>{
    socket.on("send-message", (message, room, nickName) => {
        socket.broadcast.to(room).emit('receive-message',message, nickName);
    })
    // socket.on("join-room",room => {
    //     socket.join(room);
    // })
    socket.on('leaveRoom', function(data) {
        console.log(data);
        const { room } = data;
        
        // 在 rooms 中找到該房間，然後刪除該玩家
        if (rooms[room]) {
            const playerIndex = rooms[room].indexOf(socket.id);
            if (playerIndex !== -1) {
                rooms[room].splice(playerIndex, 1);
            }
        }
        
        // 通知其他玩家有玩家離開了
        io.to(room).emit('playerLeft', { playerId: socket.id });
    });

    socket.on('join-room', (room) => {
        // 檢查房間是否已滿
        if (rooms[room] && rooms[room].length >= 2) {
            socket.emit('roomFull');
            return;
        }

        // 將玩家加入房間
        socket.join(room);

        // 初始化房間的玩家數量
        if (!rooms[room]) {
            rooms[room] = [];
        }

        // 添加玩家到房間中
        rooms[room].push(socket.id);

        // 告訴所有房間中的玩家有新玩家加入
        io.to(room).emit('playerJoined', rooms[room]);

        console.log(rooms[room].length);
        // 如果房間已滿，開始遊戲，發送相關事件給客戶端
        if (rooms[room].length === 2) {
            io.to(room).emit('startGame',rooms[room]);
        }
        
    });

    //落子紀錄統整
    socket.on("send-chessRecord",(chessRecordSets, room)=>{
        socket.broadcast.to(room).emit('receive-chessRecord',chessRecordSets);
    })

    socket.on("send-winner",(color, room) => {
        socket.broadcast.to(room).emit('receive-winner',color);
    })

    socket.on("send-chess",(color,xGrid,yGrid,room) => {
        socket.broadcast.to(room).emit('receive-chess',color,xGrid,yGrid);
    })

    socket.on("send-reset",(room)=>{
        socket.broadcast.to(room).emit('receive-reset');
    })
});

// 存儲房間和其中的玩家數量


const port = 8080;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});