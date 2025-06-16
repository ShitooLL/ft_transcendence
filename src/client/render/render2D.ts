import { GameState } from '../../server/game/pong.js'

export class CanvasRenderer {

    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor( canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context: CanvasRenderingContext2D | null = this.canvas.getContext('2d');
        if (!context)
            throw new Error('Context error');

        this.ctx = context;
    };

    render(game: GameState): void
    {    
        this.ctx.clearRect(0, 0, 800, 600);

        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillRect(game.player1.x, game.player1.y, game.player1.width, game.player1.height);
        this.ctx.fillRect(game.player2.x, game.player2.y, game.player2.width, game.player2.height);

        this.ctx.font = '28px sans-serif';
        this.ctx.fillText(`${game.player1.score} - ${game.player2.score}`, 380, 50);
    };
}
