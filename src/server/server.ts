import { Server } from "socket.io";
import { PongGame } from '../client/game/pong.js'

export const io = new Server(8080, {
    cors:
    {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    },
});


const game: PongGame = new PongGame("11", "22");


io.on('connection', client_socket => {
    console.log("server:", client_socket.id);
});

io.on('handleKeyEvent', (key: string, type: string) => {
    if (type === 'keydown')
    {
        game.handleKeyDown(key);
    }
    else if (type === 'keyup')
    {
        game.handleKeyUp(key);
    }
    console.log("server: handleKeyEvent called");
});