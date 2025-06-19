import { GameState } from '../server/game/pong.js'
import { CanvasRenderer } from './render/render2D.js'

import io from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js'

const socket = io('http://localhost:3001');

function handleKeyEvent(event: KeyboardEvent): void
{
    const key = event.key;

    if ((key === 'w' || key === 's')
        || (key === 'ArrowUp' || key === 'ArrowDown'))
    {
        socket.emit('handleKeyEvent', event.key, event.type);
    }
}

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

function initLocalGame(canvas: HTMLCanvasElement, name1: string, name2: string): void
{
    socket.on('error', (message: string) => {
        console.error(`error : ${message}`);
    });

    socket.emit('initLocal', name1, name2);

    socket.on('gameStart', (roomIndex: number) => {
        const renderer: CanvasRenderer = new CanvasRenderer(canvas);

        socket.on('gameState', (gameState: GameState) => {
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
}

const initMultiGame = async(canvas: HTMLCanvasElement, name: string) => {

        socket.on('error', (message: string) => {
            console.error(`error : ${message}`);
        });

        const initData: {roomIndex: number,
                        playerSide: number,
        } = await socket.emitWithAck('initMultiplayer', name);

        if (initData.playerSide === 2)
            socket.emit('gameReady', initData.roomIndex);

        socket.on('gameStart', (nameOpponent: string) => {
            const renderer: CanvasRenderer = new CanvasRenderer(canvas);

            socket.on('gameState', (gameState: GameState) => {
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
