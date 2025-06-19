import { Server } from "socket.io";
import { PongGame } from './game/pong.js';
export const io = new Server(3001, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    },
});
const GameRooms = new Map();
let roomcount = 1;
const targetFPS = 30;
function gameLoop(room, intervalID) {
    intervalID = setInterval(() => {
        room.game.update();
        const gameState = room.game.serialize();
        io.to(room.id).emit('gameState', gameState);
        if (room.game.ended) {
            console.log(`server: game ended`);
            io.to(room.id).emit('gameOver');
            clearInterval(intervalID);
            io.in(room.id).disconnectSockets();
            GameRooms.delete(room.index);
        }
    }, 1000 / targetFPS);
}
io.on('connection', client_socket => {
    console.log("server: connection ", client_socket.id);
    let intervalID = undefined;
    let room = undefined;
    let playerSide = -1;
    client_socket.on('initLocal', (name1, name2) => {
        let game;
        game = new PongGame();
        room = {
            game: game,
            playercount: 2,
            id: `Game Room ID ${roomcount}`,
            index: roomcount,
        };
        GameRooms.set(roomcount, room);
        roomcount++;
        client_socket.join(room.id);
        playerSide = 0;
        game.player1.name = name1;
        game.player2.name = name2;
        console.log(`server: name 1 ${game.player1.name}`);
        console.log(`server: name 2 ${game.player2.name}`);
        console.log("server: game starts in 2 seconds ...");
        setTimeout(() => {
            io.to(room.id).emit('gameStart', room === null || room === void 0 ? void 0 : room.index);
            gameLoop(room, intervalID);
        }, 2000);
    });
    client_socket.on('initMultiplayer', (name, ackCallback) => {
        room = GameRooms.get(roomcount);
        if (!room) {
            let newGame;
            newGame = new PongGame();
            room = {
                game: newGame,
                playercount: 0,
                id: `Game Room ID ${roomcount}`,
                index: roomcount,
            };
            GameRooms.set(roomcount, room);
        }
        let game = room.game;
        client_socket.join(room.id);
        if (room.playercount === 0) {
            game.player1.name = name;
            playerSide = 1;
            room.playercount++;
        }
        else if (room.playercount === 1) {
            game.player2.name = name;
            playerSide = 2;
            room.playercount++;
            roomcount++;
        }
        ackCallback({ index: room.index, playerSide });
    });
    client_socket.on('gameReady', (roomIndex) => {
        // let room: GameRoom | undefined = GameRooms.get(roomIndex);
        if (!room) {
            client_socket.emit('error', { message: `room ${roomIndex} not found` });
            return;
        }
        let nameOpponent;
        if (playerSide === 1)
            nameOpponent = room.game.player2.name;
        else if (playerSide === 2)
            nameOpponent = room.game.player1.name;
        console.log("server: game starts in 2 seconds ...");
        setTimeout(() => {
            io.to(room.id).emit('gameStart', nameOpponent);
            gameLoop(room, intervalID);
        }, 2000);
    });
    client_socket.on('handleKeyEvent', (key, type) => {
        // let room: GameRoom | undefined = GameRooms.get(roomIndex);
        if (!room) {
            client_socket.emit('error', { message: `room not found` });
            return;
        }
        if (type === 'keydown') {
            room.game.handleKeyDown(key, playerSide);
            // console.log("server: (down) key pressed");
        }
        else if (type === 'keyup') {
            room.game.handleKeyUp(key, playerSide);
            // console.log("server: (up) key released");
        }
    });
    client_socket.on('disconnect', () => {
        console.log("server: disconnection ", client_socket.id);
        if (room)
            room.game.ended = true;
    });
});
