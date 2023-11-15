// 伺服器端程式碼
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

//伺服器端連線


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//當伺服器啟動時宣告rooms物件
const rooms = {};

// 設定根目錄的index為網站首頁
app.use(express.static(path.join(__dirname)));

// 伺服器端路由設定
io.on('connection', socket =>{
    socket.on("send-message", (message, room, nickName) => {
        console.log(message);
        console.log(room);
        console.log(nickName);
        socket.broadcast.to(room).emit('receive-message',message, nickName);
    })

    //當有玩家離開房間
    socket.on('leaveRoom', (data)=> {
        console.log("收到leaveRoom");
        console.log("data="+data);
        console.log("rooms[data]="+rooms[data]);
        
        // 在 rooms 中找到該房間，然後刪除該玩家
        if (rooms[data]) {
            const playerIndex = rooms[data].indexOf(socket.id);
            if (playerIndex !== -1) {
                rooms[data].splice(playerIndex, 1);
                console.log("成功刪除");
                console.log("現有rooms:" + rooms[data]);
            }
        }
        
        // 通知其他玩家有玩家離開了
        io.to(data).emit('playerLeft', { playerId: socket.id });
    });

    socket.on('join-room', (room,nickName) => {
        console.log(!room);
        if (!room) {
            // 如果客戶端未指定房間，則隨機分配一個只有一個人的房間
            var availableRooms = Object.keys(rooms).filter(roomKey => rooms[roomKey].length === 1);
            if (availableRooms.length > 0) {
                room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
            } else {
                // 如果沒有這樣的房間，則創建一個新房間
                room = generateRandomRoomName(); // 自行實現產生隨機房間名稱的函數
                rooms[room] = [];
            }
        }
        console.log(room);
        // 檢查房間是否已滿
        if (rooms[room] && rooms[room].length >= 2) {
            socket.emit('roomFull');
            return;
        }
        
        
        
        // 將玩家加入房間
        socket.join(room);
        
        // 假設此房間是空值 創造一個能hold玩家的位置
        if (!rooms[room]) {
            rooms[room] = [];
        }
        
        // 添加玩家到房間中
        rooms[room].push(socket.id);
        console.log(rooms[room]);
        // 告訴所有房間中的玩家有新玩家加入
        io.to(room).emit('playerJoined', rooms[room],nickName);
        
        // 如果房間已滿，開始遊戲，發送相關事件給客戶端
        if (rooms[room].length === 2) {
            console.log("遊戲開始，房間"+room);
            io.to(room).emit('startGame',rooms[room],nickName,room);
        }
        
    });


    //落子紀錄統整
    socket.on("send-chessRecord",(chessRecordSets, room)=>{
        socket.broadcast.to(room).emit('receive-chessRecord',chessRecordSets);
    })

    //贏家出現
    socket.on("send-winner",(color, room) => {
        socket.broadcast.to(room).emit('receive-winner',color);
    })

    //落子事件
    socket.on("send-chess",(color,xGrid,yGrid,room) => {
        socket.broadcast.to(room).emit('receive-chess',color,xGrid,yGrid);
    })

    //重製棋盤請求
    socket.on("send-reset",(room)=>{
        socket.broadcast.to(room).emit('receive-reset');
    })
});

// 存儲房間和其中的玩家數量


const port = 8080;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

function generateRandomRoomName() {
    // 實現你自己的隨機房間名稱生成邏輯
    // 這只是一個簡單的範例，實際上可能需要更複雜的邏輯
    return 'Room_' + Math.floor(Math.random() * 1000+500);
}