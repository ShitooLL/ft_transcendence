import { GameState } from '../server/game/pong.js'
import { CanvasRenderer } from './render/render2D.js'

import io from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js'

const socket = io('http://localhost:3001');


export function getPongScreen(app: HTMLElement): HTMLElement
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
    canvas.width = 800;
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

        socket.emit('playersNameInput', name1, name2);

        const renderer: CanvasRenderer = new CanvasRenderer(canvas);
         
        socket.on('gameState', (gameState: GameState) => {
            renderer.render(gameState);
        });
        
        function handleKeyEvent(event: KeyboardEvent): void
        {
            const key = event.key;

            if (key === 'w' || key === 's'
                || key === 'ArrowUp' || key === 'ArrowDown')
            {
                console.log("socket emit in key");
                socket.emit('handleKeyEvent', key, event.type);
            }
        }
        document.addEventListener('keydown', handleKeyEvent);
        document.addEventListener('keyup', handleKeyEvent);

        socket.on('gameOver', () => {
            document.removeEventListener('keydown', handleKeyEvent);
            document.removeEventListener('keyup', handleKeyEvent);
            app.innerHTML = '';
            app.appendChild(getPongScreen(app));
        });
    });

    return (container);
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
    canvas.width = 800;
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
                        playerSide: number
        } = await socket.emitWithAck('initMultiplayer', name);

        console.log(`playeside: ${initData.playerSide}, roomid: ${initData.roomIndex}`);

        if (initData.playerSide === 2)
            socket.emit('gameReady', initData.roomIndex);

        socket.on('gameStart', () => {
            const renderer: CanvasRenderer = new CanvasRenderer(canvas);
            console.log('2');

            socket.on('gameState', (gameState: GameState) => {
                renderer.render(gameState);
            });

            function handleKeyEvent(event: KeyboardEvent): void
            {
                const key = event.key;
                console.log(`client ${initData.playerSide}: emit handlekey function`);
                console.log(`playeside: ${initData.playerSide}, roomid: ${initData.roomIndex}`);
                if (((key === 'w' || key === 's') && initData.playerSide === 1)
                    || ((key === 'ArrowUp' || key === 'ArrowDown') && initData.playerSide === 2))
                {
                    socket.emit('handleKeyEvent', event.key, event.type, initData.roomIndex);
                }
            }
            document.addEventListener('keydown', handleKeyEvent);
            document.addEventListener('keyup', handleKeyEvent);

            socket.on('gameOver', () => {
                document.removeEventListener('keydown', handleKeyEvent);
                document.removeEventListener('keyup', handleKeyEvent);
            });
        });
}
