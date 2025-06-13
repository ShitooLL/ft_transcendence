import { Server } from "socket.io";
import { PongGame } from './game/pong.js'

export const io = new Server(3001, {
    cors:
    {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    },
});

let game: PongGame;
game = new PongGame();
const targetFPS: number = 60;
let playercount = 0;

function gameLoop(client_socket, room): void
{
    const intervalID: NodeJS.Timeout = setInterval( () => {
        game.update();
        const gameState = game.serialize();
        io.emit('gameState', gameState);
        if (game.ended)
        {
            console.log(`server: game ended`);
            game.ended = false;
            game.score1 = 0;
            game.score2 = 0;
            io.emit('gameOver');
            clearInterval(intervalID);
        }
    }, 1000 / targetFPS );
}

io.on('connection', client_socket => {
    console.log("server:", client_socket.id);

    client_socket.on('playersNameInput', (name1: string, name2: string) => {
        game.player1.name = name1;
        game.player2.name = name2;
        console.log(`server: name 1 ${game.player1.name}`);
        console.log(`server: name 2 ${game.player2.name}`);
    });

    client_socket.on('multiplayerName', (name: string, cb) => {
        if (!playercount)
        {
            game.player1.name = name;
            playercount++;
        }
        else
        {
            game.player2.name = name;
            playercount = 0;
            io.emit('gameStart');
        }
        cb(`Your name ${name}, have been registered. Now waiting for players.`);
    });

    client_socket.on('handleKeyEvent', (key: string, type: string) => {
        if (type === 'keydown')
        {
            game.handleKeyDown(key);
            console.log("server: down pressed");
        }
        else if (type === 'keyup')
        {
            game.handleKeyUp(key);
            console.log("server: up pressed");
        }
    });

});
