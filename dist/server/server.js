import { Server } from "socket.io";
import { PongGame } from './game/pong.js';
import Fastify from 'fastify';
import cors from '@fastify/cors';
export const io = new Server(3001, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    },
});
const fastify = Fastify();
fastify.register(cors, {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
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
            GameRooms.delete(room.id);
            console.log(`server: game ended`);
        }
    }, 1000 / targetFPS);
}
io.on('connection', client_socket => {
    console.log("server: connection ", client_socket.id);
    let room = undefined;
    let playerSide = -1;
    client_socket.on('joinRoom', (roomId) => {
        room = GameRooms.get(`Game Room ID local ${roomId}`);
        if (!room) {
            client_socket.emit('error', 'room not found');
            return;
        }
        client_socket.join(room.id);
        console.log("server: game starts in 2 seconds ...");
        setTimeout(() => {
            io.to(room.id).emit('gameStart', room.index);
            gameLoop(room);
        }, 2000);
    });
    /*     client_socket.on('initLocal', (name1: string, name2: string) => {
            const game: PongGame = new PongGame();
    
            room = {
                game: game,
                playercount: 2,
                id: `Game Room ID local ${localcount}`,
                index: localcount,
            };
            GameRooms.set(room.id, room);
            client_socket.join(room.id);
            
            localcount++;
            playerSide = 0;
    
            game.player1.name = name1;
            game.player2.name = name2;
    
            console.log("server: game starts in 2 seconds ...");
            setTimeout( () => {
                io.to(room!.id).emit('gameStart', room!.index);
                gameLoop(room!);
            }, 2000);
        });
     */
    client_socket.on('initMultiplayer', (name, ackCallback) => {
        room = GameRooms.get(`Game Room ID ${roomcount}`);
        if (!room) {
            const newGame = new PongGame();
            room = {
                game: newGame,
                playercount: 0,
                id: `Game Room ID ${roomcount}`,
                index: roomcount,
            };
            GameRooms.set(room.id, room);
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
        ackCallback({ roomIndex: room.index, playerSide });
    });
    client_socket.on('gameReady', (roomIndex) => {
        if (!room) {
            client_socket.emit('error', 'room not found');
            return;
        }
        console.log("server: game starts in 2 seconds ...");
        setTimeout(() => {
            io.to(room.id).emit('gameStart', room.game.player1.name, room.game.player2.name);
            gameLoop(room);
        }, 2000);
    });
    /*     client_socket.on('handleKeyEvent', (key: string, type: string) => {
            if (!room)
            {
                client_socket.emit('error', 'room not found');
                return;
            }
            if (type === 'keydown')
                room.game.handleKeyDown(key, playerSide);
            else if (type === 'keyup')
                room.game.handleKeyUp(key, playerSide);
        }); */
    client_socket.on('disconnect', () => {
        console.log("server: disconnection ", client_socket.id);
        if (room) {
            room.playercount -= 1;
            console.log(`server: disconnect client: ${client_socket.id} in room: ${room.index}`);
            io.to(room.id).emit('gameOver');
            clearInterval(room.intervalID);
            io.in(room.id).disconnectSockets();
            GameRooms.delete(room.id);
        }
    });
});
fastify.post('/api/game/move', (req, reply) => {
    const { roomId, playerSide, key, type, mode } = req.body;
    const str = mode === 'multi' ? 'Game Room ID ' : 'Game Room ID local ';
    const validSide = mode === 'multi' ? [1, 2] : [0];
    const room = GameRooms.get(str + `${roomId}`);
    if (!room)
        return reply.code(404).send({ error: 'room not found' });
    else if (!validSide.includes(playerSide))
        return reply.code(401).send({ error: 'player not found' });
    else if (key !== 'ArrowUp' && key !== 'ArrowDown'
        && key !== 'w' && key !== 's')
        return reply.code(402).send({ error: 'incorrect key input' });
    if (type === 'keydown')
        room.game.handleKeyDown(key, playerSide);
    else if (type === 'keyup')
        room.game.handleKeyUp(key, playerSide);
    else
        return reply.code(400).send({ error: 'incorrect key press type event' });
    return reply.send({ message: 'REST API: movement applied' });
});
fastify.get('/api/game/state', (req, reply) => {
    const str = req.query.mode === 'multi' ? 'Game Room ID ' : 'Game Room ID local ';
    const room = GameRooms.get(str + `${req.query.roomId}`);
    if (!room)
        return reply.code(404).send({ error: 'room not found' });
    return reply.send(room.game.serialize());
});
fastify.post('/api/game/create-game', (req, reply) => {
    const p1 = req.body.players[0];
    const p2 = req.body.players[1];
    if (!p1 || !p2)
        return reply.code(400).send({ error: "Player's names are missing" });
    const game = new PongGame();
    game.player1.name = p1;
    game.player2.name = p2;
    const room = {
        game: game,
        playercount: 2,
        id: `Game Room ID local ${localcount}`,
        index: localcount
    };
    localcount++;
    GameRooms.set(room.id, room);
    return reply.send({ message: 'REST API: game created', roomId: room.index });
});
fastify.post('/api/game/end', (req, reply) => {
    const str = req.body.mode === 'multi' ? 'Game Room ID ' : 'Game Room ID local ';
    const room = GameRooms.get(str + `${req.body.roomId}`);
    if (!room)
        return reply.code(400).send({ error: 'room not found' });
    clearInterval(room.intervalID);
    room.game.ended = true;
    room.playercount -= 1;
    io.to(room.id).emit('gameOver');
    io.in(room.id).disconnectSockets();
    GameRooms.delete(room.id);
    return reply.send({ message: 'REST API: game over' });
});
fastify.listen({ port: 3002 }, (error, address) => {
    if (error) {
        console.error('error: fastify, ', error);
        process.exit(1);
    }
    console.log(`API REST started on ${address}`);
});
