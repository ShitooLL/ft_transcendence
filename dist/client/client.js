var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CanvasRenderer } from './render/render2D.js';
let userId = 3;
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
function initLocalGame(canvas, name1, name2) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('pong-game-container');
        socket.on('error', (message) => {
            console.error(`error : ${message}`);
        });
        // socket.emit('initLocal', name1, name2);
        const responseStart = yield fetch('http://localhost:3001/api/game/create-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players: [name1, name2] })
        });
        const initData = yield responseStart.json();
        if (!responseStart.ok) {
            console.error('error: ', responseStart.status, initData.error);
            return;
        }
        socket.emit('joinRoom', initData.roomId);
        socket.on('gameStart', (roomIndex) => {
            const renderer = new CanvasRenderer(canvas);
            socket.on('gameState', (gameState) => {
                renderer.render(gameState, name1, name2);
            });
            console.log(`client ${roomIndex}`);
            function handleKeyEvent(event) {
                return __awaiter(this, void 0, void 0, function* () {
                    const key = event.key;
                    console.log("keyevent called");
                    if ((key === 'w' || key === 's')
                        || (key === 'ArrowUp' || key === 'ArrowDown')) {
                        // socket.emit('handleKeyEvent', event.key, event.type);
                        const response = yield fetch('http://localhost:3001/api/game/move', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
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
                });
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
function initMultiGame(canvas, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById('pong-game-container');
        socket.on('error', (message) => {
            console.error(`error : ${message}`);
        });
        const initData = yield socket.emitWithAck('initMultiplayer', name);
        if (initData.playerSide === 2)
            socket.emit('gameReady', initData.roomIndex);
        socket.on('gameStart', (name1, name2) => {
            const renderer = new CanvasRenderer(canvas);
            socket.on('gameState', (gameState) => {
                renderer.render(gameState, name1, name2);
            });
            function handleKeyEvent(event) {
                return __awaiter(this, void 0, void 0, function* () {
                    const key = event.key;
                    console.log("keyevent called");
                    if ((key === 'w' || key === 's')
                        || (key === 'ArrowUp' || key === 'ArrowDown')) {
                        // socket.emit('handleKeyEvent', event.key, event.type);
                        const response = yield fetch('http://localhost:3001/api/game/move', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
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
                });
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
    });
}
export function getAllScreen() {
    console.log('All screen load');
    const container = document.createElement('div');
    container.id = 'pong-game-container';
    container.className = 'flex flex-col gap-8 p-4 justify-start items-center w-full h-screen relative';
    function msg_box(container, message) {
        console.log(message);
        const div = document.createElement('div');
        div.textContent = message;
        div.className = 'w-full';
        container.appendChild(div);
    }
    ;
    socket.on("connect", () => {
        msg_box(container, `you connected to socket with id: ${socket.id}`);
        console.log(`you connected id: ${socket.id}`);
        socket.emit('userSocketRegistering', userId);
    });
    socket.on('connect_error', (err) => {
        console.error('connection error :', err.message);
        msg_box(container, `connection error`);
    });
    socket.io.on('reconnect_attempt', () => {
        console.log('reconnection attempt...');
        msg_box(container, 'reconnection attempt...');
    });
    socket.connect();
    const formlocal = document.createElement('form');
    formlocal.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';
    const input1local = document.createElement('input');
    input1local.className = 'w-full px-4 py-2 rounded';
    input1local.placeholder = 'Player 1 name';
    input1local.required = true;
    const input2local = document.createElement('input');
    input2local.className = 'w-full px-4 py-2 rounded';
    input2local.placeholder = 'Player 2 name';
    input2local.required = true;
    const startBtnlocal = document.createElement('button');
    startBtnlocal.type = 'submit';
    startBtnlocal.textContent = 'Start Local';
    startBtnlocal.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';
    const formmulti = document.createElement('form');
    formmulti.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';
    const input1multi = document.createElement('input');
    input1multi.className = 'w-full px-4 py-2 rounded';
    input1multi.placeholder = 'Player name';
    input1multi.required = true;
    const startBtnmulti = document.createElement('button');
    startBtnmulti.type = 'submit';
    startBtnmulti.textContent = 'Start Multi';
    startBtnmulti.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';
    formmulti.append(input1multi, startBtnmulti);
    formlocal.append(input1local, input2local, startBtnlocal);
    container.append(formlocal, formmulti);
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 1000;
    canvas.height = 600;
    canvas.className = 'hidden mx-auto rounded-lg';
    container.appendChild(canvas);
    formlocal.addEventListener('submit', (e) => {
        e.preventDefault();
        const name1 = input1local.value.trim();
        const name2 = input2local.value.trim();
        if (!name1 || !name2) {
            alert('Please enter both player names.');
            return;
        }
        //Launching game
        canvas.classList.remove('hidden');
        formlocal.classList.add('hidden');
        formmulti.classList.add('hidden');
        initLocalGame(canvas, name1, name2);
    });
    formmulti.addEventListener('submit', (e) => {
        e.preventDefault();
        const name1 = input1multi.value.trim();
        if (!name1) {
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
