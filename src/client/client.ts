import { GameState } from '../server/game/pong.js'
import { CanvasRenderer } from './render/render2D.js'

// import io from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js'
import type { Socket } from "socket.io-client/build/esm/socket";
// Declare "io" as a global function returning a Socket instance
declare const io: (url: string, opts?: any) => Socket;

const socket = io('http://localhost:3001', {
    autoConnect: false,
});

/* function handleKeyEvent(event: KeyboardEvent): void
{
    const key = event.key;

    console.log("keyevent called");
    if ((key === 'w' || key === 's')
        || (key === 'ArrowUp' || key === 'ArrowDown'))
    {
        socket.emit('handleKeyEvent', event.key, event.type);
    }
} */

/* 
export function getLocalScreen(app: HTMLElement): HTMLElement
{
    console.log('Pvp screen load');
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'flex gap-6 p-4 justify-center items-start w-full h-full';

    function msg_box(container: HTMLDivElement, message: string)
    {
        console.log(message);
        const div: HTMLDivElement = document.createElement('div');
        div.textContent = message;
        div.className = 'absolute top-4 left-4';
        container.appendChild(div);
    };
    socket.on("connect", () => {
        msg_box(container, `you connected to socket with id: ${socket.id}`);
    });

    const form: HTMLFormElement = document.createElement('form');
    form.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';

    const input1: HTMLInputElement = document.createElement('input');
    input1.className = 'w-full px-4 py-2 rounded';
    input1.placeholder = 'Player 1 name';
    input1.required = true;

    const input2: HTMLInputElement = document.createElement('input');
    input2.className = 'w-full px-4 py-2 rounded';
    input2.placeholder = 'Player 2 name';
    input2.required = true;

    const startBtn: HTMLButtonElement = document.createElement('button');
    startBtn.type = 'submit';
    startBtn.textContent = 'Start Game';
    startBtn.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';

    form.append(input1, input2, startBtn);
    container.appendChild(form);

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 1000;
    canvas.height = 600;
    canvas.className = 'mt-28 hidden mx-auto rounded-lg';
    container.appendChild(canvas);

    //Username validation into game
    form.addEventListener('submit', (e: Event) => {
        e.preventDefault();

        const name1: string = input1.value.trim();
        const name2: string = input2.value.trim();

        if (!name1 || !name2)
        {
            alert('Please enter both player names.');
            return;
        }

        //Launching game
        canvas.classList.remove('hidden');
        form.classList.add('hidden');

        initLocalGame(canvas, name1, name2);
    });

    return (container);
}
 */
async function initLocalGame(canvas: HTMLCanvasElement, name1: string, name2: string)
{
    const container = document.getElementById('pong-game-container')!;

    socket.on('error', (message: string) => {
        console.error(`error : ${message}`);
    });

    // socket.emit('initLocal', name1, name2);

    const responseStart = await fetch('http://localhost:3001/api/game/create-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: [name1, name2] })
    });
    const initData = await responseStart.json();
    if (!responseStart.ok)
    {
        console.error('error: ', responseStart.status, initData.error);
        return;
    }
    socket.emit('joinRoom', initData.roomId);

    socket.on('gameStart', (roomIndex: number) => {
        const renderer: CanvasRenderer = new CanvasRenderer(canvas);

        socket.on('gameState', (gameState: GameState) => {
            renderer.render(gameState, name1, name2);
        });
        console.log(`client ${roomIndex}`);
        async function handleKeyEvent(event: KeyboardEvent)
        {
            const key = event.key;
        
            console.log("keyevent called");
            if ((key === 'w' || key === 's')
                || (key === 'ArrowUp' || key === 'ArrowDown'))
            {
                // socket.emit('handleKeyEvent', event.key, event.type);
                const response = await fetch('http://localhost:3001/api/game/move', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        roomId: roomIndex,
                        playerSide: 0,
                        key: key,
                        type: event.type,
                        mode: 'local'
                    })
                });
                if (!response.ok)
                    console.error('error: ', response.status);
            }
        }
        
        document.addEventListener('keydown', handleKeyEvent);
        document.addEventListener('keyup', handleKeyEvent);

        socket.on('gameOver', () => {
            document.removeEventListener('keydown', handleKeyEvent);
            document.removeEventListener('keyup', handleKeyEvent);
            
            const div = document.createElement('div');
            div.textContent = 'Game Over';
            div.className = 'mt-8 text-white rounded text-5xl shadow-lg';
            container.insertBefore(div, canvas);
        });
    });
}
/* 
export function getMultiplayerScreen(app: HTMLElement): HTMLElement
{
    console.log('Multi screen load');
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'flex gap-6 p-4 justify-center items-start w-full h-full';

    function msg_box(container: HTMLDivElement, message: string)
    {
        console.log(message);
        const div: HTMLDivElement = document.createElement('div');
        div.textContent = message;
        div.className = 'absolute top-4 left-4';
        container.appendChild(div);
    };

    socket.on("connect", () => {
        msg_box(container, `you connected to socket with id: ${socket.id}`);
    });

    const form: HTMLFormElement = document.createElement('form');
    form.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';

    const input1: HTMLInputElement = document.createElement('input');
    input1.className = 'w-full px-4 py-2 rounded';
    input1.placeholder = 'Player name';
    input1.required = true;

    const startBtn: HTMLButtonElement = document.createElement('button');
    startBtn.type = 'submit';
    startBtn.textContent = 'Start Game';
    startBtn.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';

    form.append(input1, startBtn);
    container.appendChild(form);

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 1000;
    canvas.height = 600;
    canvas.className = 'mt-28 hidden mx-auto rounded-lg';
    container.appendChild(canvas);

    //Username validation into game
    form.addEventListener('submit', (e: Event) => {
        e.preventDefault();

        const name1: string = input1.value.trim();

        if (!name1)
        {
            alert('Please enter a player name.');
            return;
        }

        //Launching game
        canvas.classList.remove('hidden');
        form.classList.add('hidden');

        initMultiGame(canvas, name1);
    });

    return (container);
} */

async function initMultiGame(canvas: HTMLCanvasElement, name: string)
{
    const container = document.getElementById('pong-game-container')!;

        socket.on('error', (message: string) => {
            console.error(`error : ${message}`);
        });

        const initData: {roomIndex: number,
                        playerSide: number,
        } = await socket.emitWithAck('initMultiplayer', name);

        if (initData.playerSide === 2)
            socket.emit('gameReady', initData.roomIndex);

        socket.on('gameStart', (name1: string, name2: string) => {
            const renderer: CanvasRenderer = new CanvasRenderer(canvas);

            socket.on('gameState', (gameState: GameState) => {
                renderer.render(gameState, name1, name2);
            });

            async function handleKeyEvent(event: KeyboardEvent)
            {
                const key = event.key;
            
                console.log("keyevent called");
                if ((key === 'w' || key === 's')
                    || (key === 'ArrowUp' || key === 'ArrowDown'))
                {
                    // socket.emit('handleKeyEvent', event.key, event.type);
                    const response = await fetch('http://localhost:3001/api/game/move', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomId: initData.roomIndex,
                            playerSide: initData.playerSide,
                            key: key,
                            type: event.type,
                            mode: 'multi'
                        })
                    });
                    if (!response.ok)
                        console.error('error: ', response.status);
                }
            }

            document.addEventListener('keydown', handleKeyEvent);
            document.addEventListener('keyup', handleKeyEvent);

            socket.on('gameOver', () => {
                document.removeEventListener('keydown', handleKeyEvent);
                document.removeEventListener('keyup', handleKeyEvent);
            
                const div = document.createElement('div');
                div.textContent = 'Game Over';
                div.className = 'mt-8 text-white rounded text-5xl shadow-lg';
                container.insertBefore(div, canvas);
            });
        });
}

export function getAllScreen(): HTMLElement
{
    console.log('All screen load');
    const container: HTMLDivElement = document.createElement('div');
    container.id = 'pong-game-container';
    container.className = 'flex flex-col gap-8 p-4 justify-start items-center w-full h-screen relative';

    function msg_box(container: HTMLDivElement, message: string)
    {
        console.log(message);
        const div: HTMLDivElement = document.createElement('div');
        div.textContent = message;
        div.className = 'w-full';
        container.appendChild(div);
    };

    socket.on("connect", () => {
        msg_box(container, `you connected to socket with id: ${socket.id}`);
        console.log(`you connected id: ${socket.id}`);
    });
    socket.on('connect_error', (err: Error) => {
        console.error('connection error :', err.message);
        msg_box(container, `connection error`);
    });
    socket.io.on('reconnect_attempt', () => {
        console.log('reconnection attempt...');
        msg_box(container, 'reconnection attempt...');
    });
    socket.connect();


    const formlocal: HTMLFormElement = document.createElement('form');
    formlocal.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';

    const input1local: HTMLInputElement = document.createElement('input');
    input1local.className = 'w-full px-4 py-2 rounded';
    input1local.placeholder = 'Player 1 name';
    input1local.required = true;

    const input2local: HTMLInputElement = document.createElement('input');
    input2local.className = 'w-full px-4 py-2 rounded';
    input2local.placeholder = 'Player 2 name';
    input2local.required = true;

    const startBtnlocal: HTMLButtonElement = document.createElement('button');
    startBtnlocal.type = 'submit';
    startBtnlocal.textContent = 'Start Local';
    startBtnlocal.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';

    const formmulti: HTMLFormElement = document.createElement('form');
    formmulti.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';

    const input1multi: HTMLInputElement = document.createElement('input');
    input1multi.className = 'w-full px-4 py-2 rounded';
    input1multi.placeholder = 'Player name';
    input1multi.required = true;

    const startBtnmulti: HTMLButtonElement = document.createElement('button');
    startBtnmulti.type = 'submit';
    startBtnmulti.textContent = 'Start Multi';
    startBtnmulti.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';

    formmulti.append(input1multi, startBtnmulti);
    formlocal.append(input1local, input2local, startBtnlocal);
    container.append(formlocal, formmulti);

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 1000;
    canvas.height = 600;
    canvas.className = 'hidden mx-auto rounded-lg';
    container.appendChild(canvas);

    formlocal.addEventListener('submit', (e: Event) => {
        e.preventDefault();

        const name1: string = input1local.value.trim();
        const name2: string = input2local.value.trim();

        if (!name1 || !name2)
        {
            alert('Please enter both player names.');
            return;
        }

        //Launching game
        canvas.classList.remove('hidden');
        formlocal.classList.add('hidden');
        formmulti.classList.add('hidden');

        initLocalGame(canvas, name1, name2);
    });

    formmulti.addEventListener('submit', (e: Event) => {
        e.preventDefault();

        const name1: string = input1multi.value.trim();

        if (!name1)
        {
            alert('Please enter a player name.');
            return;
        }

        //Launching game
        canvas.classList.remove('hidden');
        formlocal.classList.add('hidden');
        formmulti.classList.add('hidden');

        initMultiGame(canvas, name1);
    });
    return (container);
}
