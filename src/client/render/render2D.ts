import { PongGame } from '../game/pong.js'
import io from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js'

class CanvasRenderer {

    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private game: PongGame;

    constructor( canvas: HTMLCanvasElement, game: PongGame) {
        this.canvas = canvas;
        this.game = game;
        const context: CanvasRenderingContext2D | null = this.canvas.getContext('2d');

        if (!context)
            throw new Error('Context error');
        this.ctx = context;
    };

    render(): void
    {    
        const game: PongGame = this.game;
        const ctx: CanvasRenderingContext2D = this.ctx;

        ctx.clearRect(0, 0, 800, 600);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(game.player1.x, game.player1.y, game.player1.width, game.player1.height);
        ctx.fillRect(game.player2.x, game.player2.y, game.player2.width, game.player2.height);

        ctx.font = '28px sans-serif';
        ctx.fillText(`${game.score1} - ${game.score2}`, 380, 50);
    };
}

export function getPongScreen(app: HTMLElement): HTMLElement
{
    console.log('Pvp screen load');
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'flex gap-6 p-4 justify-center items-start w-full h-full';






    const socket = io('http://localhost:8080');

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
      
        const game: PongGame = new PongGame(name1, name2);
        const renderer: CanvasRenderer = new CanvasRenderer(canvas, game);

        document.addEventListener('keydown', (e) => game.handleKeyDown(e.key));
        document.addEventListener('keyup', (e) => game.handleKeyUp(e.key));

        let lastTime: number = 0;
        const targetFPS: number = 60;
        const frameDelay: number = 1000 / targetFPS;

        function gameLoop(currentTime: number)
        {
            const deltaTime: number = currentTime - lastTime;
            if (deltaTime >= frameDelay)
            {
                lastTime = currentTime;
                game.update();
                renderer.render();
            }

            if (game.ended)
            {
                app.innerHTML = '';
                app.appendChild(getPongScreen(app));
            }
            else
                requestAnimationFrame(gameLoop);
        }

        requestAnimationFrame(gameLoop);
    });

    return (container);
}
