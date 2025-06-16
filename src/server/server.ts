import { Server } from "socket.io";
import { PongGame } from './game/pong.js'

export const io = new Server(3001, {
    cors:
    {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    },
});

const targetFPS: number = 60;
let roomcount: number = 1;

interface GameRoom
{
    game: PongGame;
    playercount: number;
    id: string;
}

const GameRooms: Map<number, GameRoom> = new Map();

function gameLoop(game: PongGame, roomid: string): void
{
    const intervalID: NodeJS.Timeout = setInterval( () => {
        game.update();
        const gameState = game.serialize();
        io.to(roomid).emit('gameState', gameState);
        if (game.ended)
        {
            console.log(`server: game ended`);
            game.ended = false;
            game.score1 = 0;
            game.score2 = 0;
            io.to(roomid).emit('gameOver');
            clearInterval(intervalID);
        }
    }, 1000 / targetFPS );
}

io.on('connection', client_socket => {
    console.log("server:", client_socket.id);

/*     client_socket.on('playersNameInput', (name1: string, name2: string) => {
        game.player1.name = name1;
        game.player2.name = name2;
        console.log(`server: name 1 ${game.player1.name}`);
        console.log(`server: name 2 ${game.player2.name}`);
    }); */

    client_socket.on('initMultiplayer', (name: string, ackCallback) => {

        let room: GameRoom | undefined = GameRooms.get(roomcount);
        if (!room)
        {
            let newGame: PongGame;
            newGame = new PongGame();

            room = {
                game: newGame,
                playercount: 0,
                id: `Game Room ID ${roomcount}`,
            };
            GameRooms.set(roomcount, room);
        }
        let game: PongGame = room.game;
        client_socket.join(room.id);

        const roomIndex: number = roomcount;
        let playerSide: number = 0;

        if (room.playercount === 0)
        {
            game.player1.name = name;
            playerSide = 1;
            room.playercount++;
        }
        else if (room.playercount === 1)
        {
            game.player2.name = name; 
            playerSide = 2;
            room.playercount++;
            roomcount++;
        }
        ackCallback({roomIndex, playerSide});
    });

    client_socket.on('gameReady', (roomIndex: number) => {
        let room: GameRoom | undefined = GameRooms.get(roomIndex);
        if (!room)
        {
            client_socket.emit('error', { message: `room ${roomIndex} not found`});
            return;
        }
        console.log("server: game starts in 2 seconds ...");
        setTimeout( () => {
            io.to(room.id).emit('gameStart');
            gameLoop(room.game, room.id);
        }, 2000);

    });

    client_socket.on('handleKeyEvent', (key: string, type: string, roomIndex: number) => {
        let room: GameRoom | undefined = GameRooms.get(roomIndex);
        if (!room)
        {
            client_socket.emit('error', { message: `room ${roomIndex} not found`});
            return;
        }
        if (type === 'keydown')
        {
            room.game.handleKeyDown(key);
            console.log("server: (down) key pressed");
        }
        else if (type === 'keyup')
        {
            room.game.handleKeyUp(key);
            console.log("server: (up) key released");
        }
    });

});
