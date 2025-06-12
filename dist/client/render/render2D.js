import io from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';
class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        const context = this.canvas.getContext('2d');
        if (!context)
            throw new Error('Context error');
        this.ctx = context;
    }
    ;
    render(game) {
        this.ctx.clearRect(0, 0, 800, 600);
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillRect(game.player1.x, game.player1.y, game.player1.width, game.player1.height);
        this.ctx.fillRect(game.player2.x, game.player2.y, game.player2.width, game.player2.height);
        this.ctx.font = '28px sans-serif';
        this.ctx.fillText(`${game.player1.score} - ${game.player2.score}`, 380, 50);
    }
    ;
}
export function getPongScreen(app) {
    console.log('Pvp screen load');
    const container = document.createElement('div');
    container.className = 'flex gap-6 p-4 justify-center items-start w-full h-full';
    const socket = io('http://localhost:3001');
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
    canvas.width = 800;
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
        socket.emit('playersNameInput', name1, name2);
        const renderer = new CanvasRenderer(canvas);
        socket.on('gameState', (gameState) => {
            renderer.render(gameState);
        });
        function handleKeyEvent(event) {
            const key = event.key;
            if (key === 'w' || key === 's'
                || key === 'ArrowUp' || key === 'ArrowDown') {
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
