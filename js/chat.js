const socket = io();
var nickName = prompt("請輸入暱稱:");
var room = prompt("請輸入你要進入的房間名稱");
//測試用
// var nickName = "";
// var room = 1;
const joinRoomButton = document.getElementById("room-button");
const roomInput = document.getElementById("room-input");
const messageInput = document.getElementById("message-input");
const form = document.getElementById('chat-input');
const id = socket.id;


//棋子宣告
var playerTurn = "黑"
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var chessRecordSets = [];
var blackChessSets = [];
var whiteChessSets = [];
var notOver = true;
var aiMode = false;
//宣告isBlack, 回合顯示
var isBlack = true;

//如果未輸入暱稱 給予自動生成名字
if(!nickName){
    let string1 = "我愛五子棋"
    let string2 = getRandomNumber();
    nickName = string1 + string2;
}else{
    console.log("沒過");
}

// if(!room){
//     room = -1;
// }

socket.emit('join-room', room,nickName);
socket.on('receive-roomname',(roomName) =>{
    room = roomName;
})

//當視窗被關閉:送出leaveRoom的socket
window.addEventListener('beforeunload', function (event) {
    // 向伺服器端發送離開的訊息
    socket.emit('leaveRoom', { room: room });
});

function getRandomNumber() {
    // 產生一個 1 到 9999 之間的隨機整數
    const randomNumber = Math.floor(Math.random() * 9999) + 1;

    // 將數字格式化為四位數的字串
    const formattedNumber = randomNumber.toString().padStart(4, '0');
    return formattedNumber;
}

socket.on('playerLeft',() => {
    displayMessage("你的對手高歌離席了", "fs-4");
})


//收到對方訊息
socket.on("receive-message", (message,nickName) =>{
    let opponentMessage = `${nickName}: ${message}`
    displayMessage(opponentMessage, "text-left");
})

//滿房
socket.on("roomFull", ()=>{
    console.log("房間滿了");
    room = prompt("房間滿了，請重新輸入你要進入的房間名稱");
    socket.emit('join-room', room);
})


socket.on('startGame',(roomtemp,name) =>{
    room = roomtemp;
    if(roomtemp.indexOf(socket.id) == 1){
        $.toast({
            heading: 'Success',
            text: `已匹配到對手`,
            showHideTransition: 'slide',
            icon: 'success',
            position: 'top-left',
            stack: 5,
        })
        displayMessage("遊戲開始，白子後手", "fs-4");
        isBlack = false;
    }else{
        $.toast({
            heading: 'Success',
            text: `${name}加入了房間`,
            showHideTransition: 'slide',
            icon: 'success',
            position: 'top-left',
            stack: 5,
        })
        displayMessage("遊戲開始，黑子先攻", "fs-4");
    }
})


form.addEventListener("submit", e =>{
    e.preventDefault();
    const message = messageInput.value;
    console.log("訊息成功送出"+message);

    if(message === "")return;
    displayMessage(message, "text-right");
    console.log(message);
    console.log(room);
    console.log(nickName);
    socket.emit("send-message", message, room, nickName);

    messageInput.value = "";
})


//聊天室出現文字
function displayMessage(message, textClass){
    const div = document.createElement("div");
    div.textContent = message;
    div.classList.add(textClass);
    div.classList.add("small");
    document.getElementById("chat-messages").append(div);

}


socket.on("receive-reset",()=>{
    displayMessage("你的對手翻桌了，他超爛", "fs-4");
    drawBoard();
})
const resetbtn = document.getElementById('resetBtn');
resetbtn.addEventListener('click',()=>{
    socket.emit("send-reset",room);
    displayMessage("翻桌仔，你超爛", "fs-4");
    drawBoard();
})

//棋盤繪製(包含重製落子紀錄)
function drawBoard(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);//清空棋盤
    chessRecordSets = [];//落子紀錄重製
    blackChessSets = [];
    whiteChessSets = [];
    refreshRecordUI();
    //繪製棋盤底()  底色=白色(reset)
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#ffffff';
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    
    //繪製棋格
    ctx.strokeStyle = 'black';
    for(let i = 1; i < 16; i ++){
        ctx.beginPath(); //重製路徑
        ctx.moveTo(50, 50 * i);
        ctx.lineTo(750, 50 * i);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(50 * i, 50);
        ctx.lineTo(50 * i, 750);
        ctx.stroke();
    };
    
    //繪製中心點
    ctx.beginPath();
    ctx.arc(400, 400, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.stroke();
    
    
    
}

drawBoard();
//黑白子測試(記得刪掉)
// ctx.beginPath();
// ctx.arc(450, 450, 18, 0, 2 * Math.PI);
// ctx.fillStyle = blackColor;
// ctx.fill();
// ctx.stroke();

// ctx.beginPath();
// ctx.strokeStyle = 'black';
// ctx.arc(500, 500, 18, 0, 2 * Math.PI);
// ctx.fillStyle = whiteColor;
// ctx.fill();
// ctx.stroke();
//測試結束

//繪製黑子function
function drawBlack(xGrid, yGrid){
    var blackColor = ctx.createLinearGradient(xGrid - 25, yGrid - 25, xGrid + 25, yGrid + 25);
    blackColor.addColorStop(0, "white");
    blackColor.addColorStop(0.5, "black");

    ctx.beginPath();
    ctx.arc(xGrid, yGrid, 20, 0, 2 * Math.PI);
    ctx.fillStyle = blackColor;
    ctx.fill();
    ctx.stroke();
}

//繪製白子function
function drawWhite(xGrid, yGrid){
    var whiteColor = ctx.createLinearGradient(xGrid - 25, yGrid - 25, xGrid + 25, yGrid + 25);
    whiteColor.addColorStop(0, "white");
    whiteColor.addColorStop(0.6, "white");
    whiteColor.addColorStop(1, "black");

    ctx.beginPath();
    ctx.arc(xGrid, yGrid, 20, 0, 2 * Math.PI);
    ctx.fillStyle = whiteColor;
    ctx.fill();
    ctx.stroke();
}

//AI回合動作
function aiAction(chessRecordSets, myChessSets, opponentChessSets){
    var scoreBoard = boardScores(chessRecordSets, myChessSets, opponentChessSets);
    return choose(scoreBoard);
}

const vector = [[0,-1],[1, -1],[1, 0],[1,1]];
//產生二維數組 每格依照規則打分return scoreBoard[][];

function printBoard(scoreBoard){//測試boardScores功能(記得刪掉)
    var numRows = scoreBoard.length;
    var numCols = scoreBoard[0].length;
    
    console.log("二维数组内容：");
    console.log("---------------");
    
    for (var i = 0; i < numRows; i++) {
        var rowStr = "|";
        for (var j = 0; j < numCols; j++) {
            rowStr += " " + scoreBoard[i][j] + " |";
        }
        console.log(rowStr);
        console.log("---------------");
    }
}

//AI計算位置分數
function boardScores(chessRecordSets, myChessSets, opponentChessSets){
    var scoreBoard = [];
    for(let i = 0; i < 15 ; i++){ //i = y軸 j = x軸
        // scoreBoard.push([]);
        for(let j = 0; j < 15; j++){
            let score = 0;
            vector.forEach((vec) => {
                let myTemp = comboCount(myChessSets, vec, [i,j]);
                let OpponentTemp = comboCount(opponentChessSets, vec,[i,j]);
                if(hasArray(chessRecordSets, [i,j])){
                    score = -100000000;
                }
                else{
                    if(myTemp >= 5){
                        score += 8000000;
                    }else if(myTemp == 4){
                        score += 15000;
                    }else if(myTemp == 3){
                        score += 800;
                    }else if(myTemp == 2){
                        score += 35
                    }
    
                    if(OpponentTemp >= 5){
                        score += 100000;
                    }else if(OpponentTemp == 4){
                        score += 8000;
                    }else if(OpponentTemp == 3){
                        score += 400;
                    }else if(OpponentTemp == 2){
                        score += 15;
                    }
                }
            });
            // scoreBoard[i].push(score);
            if(score != 0){
                scoreBoard.push([i,j,score]);
            }
        }
    }
    return scoreBoard;
}

//AI決定落子位置 return[x, y];
function choose(scoreBoard){
    if(scoreBoard == []){
        return [8,8];
    }
    
    scoreBoard.sort(function(a,b){
        return b[2] - a[2];
    })
    let highest = 0;
    if(scoreBoard[0][2] - scoreBoard[2][2] < 30){
        highest = Math.floor(Math.random() * 3);
    }
    
    var ans = [scoreBoard[highest][0] , scoreBoard[highest][1]];
    return ans;
}


//重複落子排除
function isCrowded(chessRecord){
    for(let i = 0; i < chessRecordSets.length; i++){
        // console.log(chessRecord +":"+ chessRecordSets[i]); 排除問題用
        var temp = true;
        for(let j = 0; j < 2; j++){
            temp *= chessRecord[j] == chessRecordSets[i][j];    
        }
        if(temp == 1){
            return true;
        }
    }
    return false;
}

//查詢紀錄
function checkRecord(){
    console.clear();
    for(let i = 0; i < chessRecordSets.length; i++){
        var structure = chessRecordSets[i];
        var int1 = structure[0];
        var int2 = structure[1];
        var bool = structure[2];

        console.log("x:", int1, "y:", int2, "顏色:", bool);
    }
}

//更新畫面
function refreshRecordUI(){
    $("#chessRecord").empty();

    $.each(chessRecordSets, function (key, obj) {
        console.log(key);
        console.log(obj)
    var recordText =  obj[0] + " , " + obj[1]  ;
    if(obj[2] == "黑"){
        var $li = $("<li></li>")
                .text(recordText)
                .addClass("list-group-item bg-dark w-50 m-auto btn");
    }else{
        var $li = $("<li></li>")
                    .text(recordText)
                    .addClass("list-group-item bg-light text-dark w-50 m-auto btn");
    }
    $li.appendTo("#chessRecord");
})

}

//從記錄分離出黑/白子 isBlack輸入1 目標為黑子 反之目標為白子


socket.on("receive-winner",(color) =>{
    displayMessage(`你超爛，${color}子勝利`, "fs-4");
})

//新ifEnd function
function ifEnd(sepRecordSet, now, color){
    for(let vec of vector){
        if(comboCount(sepRecordSet, vec, now) >= 5){
            alert(`遊戲結束${color}子勝利`);
            socket.emit('send-winner', color, room);
            return
        };
    }
}

function comboCount(sepRecordSet, vector, now){
    let count = 1;
    let nextTemp = Array.from(now);
    let lastTemp = Array.from(now);
    nextTemp[0] += vector[0];
    nextTemp[1] += vector[1];

    lastTemp[0] -= vector[0];
    lastTemp[1] -= vector[1];
    while(hasArray(sepRecordSet, nextTemp)){
        count++;
        nextTemp[0] += vector[0];
        nextTemp[1] += vector[1];
    }
    while(hasArray(sepRecordSet, lastTemp)){
        count++;
        lastTemp[0] -= vector[0];
        lastTemp[1] -= vector[1];
    }
    
    return count;
}

function hasArray(target, arr){
    for(let [x,y] of target){
        if(x == arr[0] && y == arr[1]){
            return true;
        }
    }
    return false;
}

function unDrawChess(xGrid, yGrid){
    //擦掉
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.fillRect(xGrid-21,yGrid-21,42,42);
    
    if (xGrid <= 750 && yGrid <= 750 && xGrid >= 50  && yGrid >= 50) {
        // 绘制预览效果
        if(yGrid < 100 && xGrid < 100){//左上
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid, yGrid);
            ctx.lineTo(xGrid+21, yGrid);
            ctx.moveTo(xGrid, yGrid);
            ctx.lineTo(xGrid, yGrid+21);
            ctx.stroke();
        }else if(xGrid > 700 && yGrid > 700){//右下
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid-21, yGrid);
            ctx.lineTo(xGrid, yGrid);
            ctx.moveTo(xGrid, yGrid-21);
            ctx.lineTo(xGrid, yGrid);
            ctx.stroke();
        }else if(xGrid > 700 && yGrid < 100){//右上
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid-21, yGrid);
            ctx.lineTo(xGrid, yGrid);
            ctx.moveTo(xGrid, yGrid);
            ctx.lineTo(xGrid, yGrid+21);
            ctx.stroke();
        }else if(xGrid < 100 && yGrid > 700){
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid, yGrid);
            ctx.lineTo(xGrid+21, yGrid);
            ctx.moveTo(xGrid, yGrid-21);
            ctx.lineTo(xGrid, yGrid);
            ctx.stroke();
        }else if(yGrid < 100){//上
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid-21, yGrid);
            ctx.lineTo(xGrid+21, yGrid);
            ctx.moveTo(xGrid, yGrid);
            ctx.lineTo(xGrid, yGrid+21);
            ctx.stroke();
        }else if(yGrid > 700){
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid-21, yGrid);
            ctx.lineTo(xGrid+21, yGrid);
            ctx.moveTo(xGrid, yGrid-21);
            ctx.lineTo(xGrid, yGrid);
            ctx.stroke();
        }else if(xGrid < 100){//左
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid, yGrid);
            ctx.lineTo(xGrid+21, yGrid);
            ctx.moveTo(xGrid, yGrid-21);
            ctx.lineTo(xGrid, yGrid+21);
            ctx.stroke();
        }else if(xGrid > 700){//右
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid-21, yGrid);
            ctx.lineTo(xGrid, yGrid);
            ctx.moveTo(xGrid, yGrid-21);
            ctx.lineTo(xGrid, yGrid+21);
            ctx.stroke();
        }else{
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(xGrid-21, yGrid);
            ctx.lineTo(xGrid+21, yGrid);
            ctx.moveTo(xGrid, yGrid-21);
            ctx.lineTo(xGrid, yGrid+21);
            ctx.stroke();
        }
    
        if(xGrid == 400 && yGrid == 400){
            ctx.beginPath();
            ctx.arc(400, 400, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    } else {
        return
    }

}

var lastX = -1, lastY = -1;
// 落子位置顯示
c.addEventListener('mousemove', event =>{
    var hoverX = event.offsetX + 48;
    var hoverY = event.offsetY + 48;

    var xCoordinate = Math.round((hoverX -100)/50);
    var yCoordinate = Math.round((hoverY -100)/50);  
    
    if(isCrowded([xCoordinate,yCoordinate])){
        return;
    }
    var xGrid = (xCoordinate + 1) * 50;
    var yGrid = (yCoordinate + 1) * 50;
    
    if(xGrid != lastX || yGrid != lastY){
        unDrawChess(lastX, lastY);
        lastX = xGrid;
        lastY = yGrid;
        return;
    }
    
    if(xCoordinate >= 0 && yCoordinate >= 0 && xCoordinate < 15 && yCoordinate < 15){
        if(isBlack){
            drawBlack(xGrid, yGrid);
        }else{
            drawWhite(xGrid, yGrid);
        }
    }
})
//座標測試 X座標公式 : (2*點擊X絕對位置 - 當前視窗寬度)/100 + 7
//        Y座標公式 : (點擊Y絕對位置-100)/50

//收到落子紀錄
socket.on("receive-chessRecord",(record)=>{
    chessRecordSets = record;
    refreshRecordUI();
})

//收到落子
socket.on('receive-chess',(color,xGrid,yGrid)=>{
    if(color == "黑"){
        drawBlack(xGrid, yGrid);
        playerTurn = "白";
    }else{
        drawWhite(xGrid, yGrid);
        playerTurn = "黑";
    }

})
//點擊觸發落子事件
c.addEventListener ('click', event => {
    //被廢除的座標系統: event.clientX (從視窗左上角開始算 滑動視窗後沒辦法正常作用)
    // var clickX = event.clientX;
    // var clickY = event.clientY;
    // var xCoordinate = Math.round((2*clickX - clientWidth)/100 + 7);
    // var clientWidth = window.innerWidth;

    //嘗試offx, y 對座標影響(測試))
    // var offx = event.offsetX;
    // var offy = event.offsetY;


    // //新座標系統測試(成功)
    var clickX = event.offsetX + 48;
    var clickY = event.offsetY + 48;


    //坐標系 Ex: [0, 0],[7, 8]
    var xCoordinate = Math.round((clickX -100)/50);
    var yCoordinate = Math.round((clickY -100)/50);
    // console.log("x:" + xCoordinate + " y:" + yCoordinate);
    
    //Canvas Grid Ex:[450, 450],[900, 550]
    var xGrid = (xCoordinate + 1) * 50;
    var yGrid = (yCoordinate + 1) * 50;
    //繪製棋子


    if(xCoordinate >= 0 && yCoordinate >= 0 && xCoordinate < 15 && yCoordinate < 15){
        //判斷是否重複落子
        
        let temp = [xCoordinate, yCoordinate , (isBlack)?"黑":"白"];

         //判斷是否為玩家回合
        if(isBlack && playerTurn == "白"){
            $.toast({
                heading: '錯誤',
                icon: 'error',
                text: '輪到你了嗎黑色',
                position: 'top-left',
                stack: 5,
            })
            return;
        }else if(!isBlack && playerTurn =="黑"){
            $.toast({
                heading: '錯誤',
                icon: 'error',
                text: '輪到你了嗎白色',
                position: 'top-left',
                stack: 5,
            })
            return;
        }
        
        if(isCrowded(temp)){
            $.toast({
                heading: '錯誤',
                icon: 'error',
                text: '請勿重複落子',
                position: 'top-left',
                stack: 5,
            })
            return;
        } 
       
        
        //紀錄落子資料
        chessRecordSets.push(temp);
        socket.emit("send-chessRecord", chessRecordSets, room);
        
        
        if(isBlack){
            drawBlack(xGrid, yGrid);
            socket.emit("send-chess","黑",xGrid,yGrid,room,);
            ifEnd(blackChessSets, [xCoordinate, yCoordinate],"黑");
            
            blackChessSets.push([xCoordinate, yCoordinate]);                
            //以下目的請見unDrawChess()
            lastX = -1;
            lastY = -1;
            playerTurn = "白";
                
        }else{
                
            drawWhite(xGrid, yGrid);
            socket.emit("send-chess","白",xGrid,yGrid,room);
            ifEnd(whiteChessSets, [xCoordinate, yCoordinate],"白");
            
            whiteChessSets.push([xCoordinate, yCoordinate]);                   
            //以下目的請見unDrawChess()
            lastX = -1;
            lastY = -1;
            playerTurn = "黑";
        }
                
        if(aiMode){
            console.log(whiteChessSets);
            var aiMove = aiAction(chessRecordSets, whiteChessSets, blackChessSets);
            console.log(aiMove);
            printBoard(boardScores(chessRecordSets, whiteChessSets, blackChessSets));
            xGrid = (aiMove[0] + 1 ) * 50;
            yGrid = (aiMove[1] + 1 ) * 50;
            drawWhite(xGrid, yGrid);
            chessRecordSets.push([aiMove[0],aiMove[1],"白"]);
            if(notOver){
                ifEnd(whiteChessSets, [aiMove[0], aiMove[1]],"白");
            }
                whiteChessSets.push([aiMove[0], aiMove[1]]);
                isBlack = true;
        }                    
                    
    }             
    refreshRecordUI();
}
)
