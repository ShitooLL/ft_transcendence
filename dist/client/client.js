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
import io from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';
const socket = io('http://localhost:3001');
function handleKeyEvent(event) {
    const key = event.key;
    if ((key === 'w' || key === 's')
        || (key === 'ArrowUp' || key === 'ArrowDown')) {
        socket.emit('handleKeyEvent', event.key, event.type);
    }
}
export function getLocalScreen(app) {
    console.log('Pvp screen load');
    const container = document.createElement('div');
    container.className = 'flex gap-6 p-4 justify-center items-start w-full h-full';
    function msg_box(container, message) {
        console.log(message);
        const div = document.createElement('div');
        div.textContent = message;
        container.appendChild(div);
    }
    ;
    socket.on("connect", () => {
        msg_box(container, `you connected to socket with id: ${socket.id}`);
    });
    const form = document.createElement('form');
    form.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';
    const input1 = document.createElement('input');
    input1.className = 'w-full px-4 py-2 rounded';
    input1.placeholder = 'Player 1 name';
    input1.required = true;
    const input2 = document.createElement('input');
    input2.className = 'w-full px-4 py-2 rounded';
    input2.placeholder = 'Player 2 name';
    input2.required = true;
    const startBtn = document.createElement('button');
    startBtn.type = 'submit';
    startBtn.textContent = 'Start Game';
    startBtn.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';
    form.append(input1, input2, startBtn);
    container.appendChild(form);
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 1000;
    canvas.height = 600;
    canvas.className = 'mt-28 hidden mx-auto rounded-lg';
    container.appendChild(canvas);
    //Username validation into game
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name1 = input1.value.trim();
        const name2 = input2.value.trim();
        if (!name1 || !name2) {
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
function initLocalGame(canvas, name1, name2) {
    socket.on('error', (message) => {
        console.error(`error : ${message}`);
    });
    socket.emit('initLocal', name1, name2);
    socket.on('gameStart', (roomIndex) => {
        const renderer = new CanvasRenderer(canvas);
        socket.on('gameState', (gameState) => {
            renderer.render(gameState);
        });
        document.addEventListener('keydown', handleKeyEvent);
        document.addEventListener('keyup', handleKeyEvent);
        socket.on('gameOver', () => {
            document.removeEventListener('keydown', handleKeyEvent);
            document.removeEventListener('keyup', handleKeyEvent);
        });
    });
}
export function getMultiplayerScreen(app) {
    console.log('Multi screen load');
    const container = document.createElement('div');
    container.className = 'flex gap-6 p-4 justify-center items-start w-full h-full';
    function msg_box(container, message) {
        console.log(message);
        const div = document.createElement('div');
        div.textContent = message;
        container.appendChild(div);
    }
    ;
    socket.on("connect", () => {
        msg_box(container, `you connected to socket with id: ${socket.id}`);
    });
    const form = document.createElement('form');
    form.className = 'flex gap-4 justify-center items-center max-w-md max-h-md text-black';
    const input1 = document.createElement('input');
    input1.className = 'w-full px-4 py-2 rounded';
    input1.placeholder = 'Player 1 name';
    input1.required = true;
    const startBtn = document.createElement('button');
    startBtn.type = 'submit';
    startBtn.textContent = 'Start Game';
    startBtn.className = 'bg-white px-6 py-2 rounded font-semibold hover:bg-gray-300';
    form.append(input1, startBtn);
    container.appendChild(form);
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 1000;
    canvas.height = 600;
    canvas.className = 'mt-28 hidden mx-auto rounded-lg';
    container.appendChild(canvas);
    //Username validation into game
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name1 = input1.value.trim();
        if (!name1) {
            alert('Please enter a player name.');
            return;
        }
        //Launching game
        canvas.classList.remove('hidden');
        form.classList.add('hidden');
        initMultiGame(canvas, name1);
    });
    return (container);
}
const initMultiGame = (canvas, name) => __awaiter(void 0, void 0, void 0, function* () {
    socket.on('error', (message) => {
        console.error(`error : ${message}`);
    });
    const initData = yield socket.emitWithAck('initMultiplayer', name);
    if (initData.playerSide === 2)
        socket.emit('gameReady', initData.roomIndex);
    socket.on('gameStart', (nameOpponent) => {
        const renderer = new CanvasRenderer(canvas);
        socket.on('gameState', (gameState) => {
            renderer.render(gameState);
        });
        document.addEventListener('keydown', handleKeyEvent);
        document.addEventListener('keyup', handleKeyEvent);
        socket.on('gameOver', () => {
            document.removeEventListener('keydown', handleKeyEvent);
            document.removeEventListener('keyup', handleKeyEvent);
        });
    });
});
