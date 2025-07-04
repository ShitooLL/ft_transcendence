import { Server } from "socket.io";
import { Server as httpServer } from "http";
import { PongGame } from './game/pong.js'
import Fastify from 'fastify';
import cors from '@fastify/cors'

const GameRooms: Map<string, GameRoom> = new Map();

interface userData
{
    sockets: Set<string>;
    isInGame: boolean;
}

const userSocket: Map<number, userData> = new Map();

let roomcount: number = 1;
let localcount: number = 1;
const targetFPS: number = 30;

interface GameRoom
{
    game: PongGame;
    playercount: number;
    id: string;
    index: number;
    intervalID?: NodeJS.Timeout;
}

interface GameResult
{
    draw: boolean;
    winner: string; //User  + alias
    looser: string; //User  + alias
    scoreWinner: number;
    scoreLooser: number;
}

export function initGameServer(httpServer: httpServer)
{
    const io = new Server(httpServer, {
        cors:
        {
            origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        },
    });

function gameLoop(room: GameRoom): void
{
    room.intervalID = setInterval( () => {
        room.game.update();
        const gameState = room.game.serialize();
        io.to(room.id).emit('gameState', gameState);

        if (room.game.ended || room.playercount !== 2)
        {
            io.to(room.id).emit('gameOver');
            clearInterval(room.intervalID);
            io.in(room.id).disconnectSockets();

            // Send GameResult to database

            GameRooms.delete(room.id);
            console.log(`server: game ended`);
        }
    }, 1000 / targetFPS );
}

io.on('connection', client_socket => {
    console.log("server: connection ", client_socket.id);
    let room: GameRoom | undefined = undefined;
    let playerSide: number = -1;
    
    client_socket.on('userSocketRegistering', (userId: number) => {

        if (!userSocket.has(userId))
            userSocket.set(userId, { sockets: new Set(), isInGame: false});

        userSocket.get(userId)?.sockets.add(client_socket.id);
    });

    client_socket.on('joinRoom', (roomId: number) => {

        room = GameRooms.get(`Game Room ID local ${roomId}`);
        if (!room)
        {
            client_socket.emit('error', 'room not found');
            return;
        }
        client_socket.join(room.id);

        console.log("server: game starts in 2 seconds ...");
        setTimeout( () => {
            io.to(room!.id).emit('gameStart', room!.index);
            gameLoop(room!);
        }, 2000);
    });

    client_socket.on('initMultiplayer', (name: string, ackCallback) => {

        room = GameRooms.get(`Game Room ID ${roomcount}`);
        if (!room)
        {
            const newGame: PongGame = new PongGame();

            room = {
                game: newGame,
                playercount: 0,
                id: `Game Room ID ${roomcount}`,
                index: roomcount,
            };
            GameRooms.set(room.id, room);
        }
        client_socket.join(room.id);

        if (room.playercount === 0)
        {
            room.game.player1.name = name;
            playerSide = 1;
            room.playercount++;
        }
        else if (room.playercount === 1)
        {
            room.game.player2.name = name; 
            playerSide = 2;
            room.playercount++;
            roomcount++;
        }
        ackCallback({roomIndex: room.index, playerSide});
    });

    client_socket.on('gameReady', (roomIndex: number) => {
        if (!room)
        {
            client_socket.emit('error', 'room not found');
            return;
        }

        console.log("server: game starts in 2 seconds ...");
        setTimeout( () => {
            io.to(room!.id).emit('gameStart', room!.game.player1.name, room!.game.player2.name);
            gameLoop(room!);
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
        if (room)
        {
            room.playercount -= 1;
            console.log(`server: disconnect client: ${client_socket.id} in room: ${room.index}`);
        }

        userSocket.get(userId)?.sockets.delete(client_socket.id);
        if (userSocket.get(userId)?.sockets.size === 0)
            userSocket.delete(userId);

    });
});

}

const fastify = Fastify();

fastify.register(cors, {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
});


fastify.post<{ Body: { roomId: number, playerSide: 0 | 1 | 2, key: string, type: 'keydown' | 'keyup', mode?: string } }>
    ('/api/game/move', (req, reply) => {
    const { roomId, playerSide, key, type, mode } = req.body;
    const str: string = mode === 'multi' ? 'Game Room ID ' : 'Game Room ID local ';
    const validSide: number[] = mode === 'multi' ? [1,2] : [0];

    const room = GameRooms.get(str + `${roomId}`);
    if (!room)
        return reply.code(401).send({ error: 'room not found' });
    else if (!validSide.includes(playerSide))
        return reply.code(402).send({ error: 'player not found' });
    else if (key !== 'ArrowUp' && key !== 'ArrowDown'
        && key !== 'w' && key !== 's')
        return reply.code(403).send({ error: 'incorrect key input' });

    if (type === 'keydown')
        room.game.handleKeyDown(key, playerSide);
    else if (type === 'keyup')
        room.game.handleKeyUp(key, playerSide);
    else
        return reply.code(403).send({ error: 'incorrect key press type event' });

    return reply.send({ message: 'REST API: movement applied' });
});

fastify.get<{ Querystring: { mode?: string, roomId: number } }>
    ('/api/game/state', (req, reply) => {
    const str = req.query.mode === 'multi' ? 'Game Room ID ' : 'Game Room ID local ';

    const room = GameRooms.get(str + `${req.query.roomId}`);
    if (!room)
        return reply.code(401).send({ error: 'room not found' });

    return reply.send(room.game.serialize());
});

fastify.post<{ Body: { players: [string, string] } }>
    ('/api/game/create-game', (req, reply) => {
    const p1 = req.body.players[0];
    const p2 = req.body.players[1];
    if (!p1 || !p2)
        return reply.code(402).send({ error: "Player's names are missing" });

    const game = new PongGame();
    game.player1.name = p1;
    game.player2.name = p2;

    const room: GameRoom = {
        game: game,
        playercount: 2,
        id: `Game Room ID local ${localcount}`,
        index: localcount
    };
    localcount++;
    GameRooms.set(room.id, room);

    return reply.send({ message: 'REST API: game created', roomId: room.index });
});

fastify.post<{ Body: { mode?: string, roomId: number, } }>
    ('/api/game/end', (req, reply) => {
    const str = req.body.mode === 'multi' ? 'Game Room ID ' : 'Game Room ID local ';

    const room = GameRooms.get(str + `${req.body.roomId}`);
    if (!room)
        return reply.code(401).send({ error: 'room not found' });

    room.game.ended = true;
    return reply.send({ message: 'REST API: game over' });
});

fastify.listen({ port: 3001 }, (error, address) => {
    if (error) {
        console.error('error: fastify, ', error);
        process.exit(1);
    }
    console.log(`API REST started on ${address}`);
});

initGameServer(fastify.server);
