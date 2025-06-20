import { Server } from "socket.io";
import { PongGame } from './game/pong.js';
export const io = new Server(3001, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    },
});
const GameRooms = new Map();
let roomcount = 1;
let localcount = 1;
const targetFPS = 30;
function gameLoop(room) {
    room.intervalID = setInterval(() => {
        room.game.update();
        const gameState = room.game.serialize();
        io.to(room.id).emit('gameState', gameState);
        if (room.game.ended || room.playercount !== 2) {
            io.to(room.id).emit('gameOver');
            clearInterval(room.intervalID);
            io.in(room.id).disconnectSockets();
            if (GameRooms.get(room.index)) {
                console.log("delete room in map");
                GameRooms.delete(room.index);
            }
            console.log(`server: game ended`);
        }
    }, 1000 / targetFPS);
}
io.on('connection', client_socket => {
    console.log("server: connection ", client_socket.id);
    let room = undefined;
    let playerSide = -1;
    client_socket.on('initLocal', (name1, name2) => {
        let game;
        game = new PongGame();
        room = {
            game: game,
            playercount: 2,
            id: `Game Room ID local ${localcount}`,
            index: localcount,
            intervalID: undefined,
        };
        localcount++;
        client_socket.join(room.id);
        playerSide = 0;
        game.player1.name = name1;
        game.player2.name = name2;
        console.log("server: game starts in 2 seconds ...");
        setTimeout(() => {
            io.to(room.id).emit('gameStart');
            gameLoop(room);
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
                intervalID: undefined,
            };
            GameRooms.set(roomcount, room);
        }
        client_socket.join(room.id);
        if (room.playercount === 0) {
            room.game.player1.name = name;
            playerSide = 1;
            room.playercount++;
        }
        else if (room.playercount === 1) {
            room.game.player2.name = name;
            playerSide = 2;
            room.playercount++;
            roomcount++;
        }
        ackCallback({ index: room.index, playerSide });
    });
    client_socket.on('gameReady', (roomIndex) => {
        if (!room) {
            client_socket.emit('error', { message: `room ${roomIndex} not found` });
            return;
        }
        console.log("server: game starts in 2 seconds ...");
        setTimeout(() => {
            io.to(room.id).emit('gameStart', room.game.player1.name, room.game.player2.name);
            gameLoop(room);
        }, 2000);
    });
    client_socket.on('handleKeyEvent', (key, type) => {
        if (!room) {
            client_socket.emit('error', { message: `room not found` });
            return;
        }
        if (type === 'keydown')
            room.game.handleKeyDown(key, playerSide);
        else if (type === 'keyup')
            room.game.handleKeyUp(key, playerSide);
    });
    client_socket.on('disconnect', () => {
        console.log("server: disconnection ", client_socket.id);
        if (room) {
            room.playercount -= 1;
            console.log(`server: disconnect client: ${client_socket.id} in room: ${room.index}`);
            io.to(room.id).emit('gameOver');
            clearInterval(room.intervalID);
            io.in(room.id).disconnectSockets();
            if (GameRooms.get(room.index))
                GameRooms.delete(room.index);
        }
    });
});
