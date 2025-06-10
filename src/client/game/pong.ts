import { Player } from "./player.js";
import { Ball } from "./ball.js";

export class PongGame
{
    canvasHeight: number = 600;
    canvasLength: number = 800;
    readonly player1: Player; 
    readonly player2: Player;
    readonly ball: Ball = new Ball();

    score1: number = 0;
    score2: number = 0;

    ended:boolean = false;

    constructor(name1: string, name2:string)
    {
        this.player1 = new Player(30, 250, name1);
        this.player2 = new Player(760, 250, name2);
    }

    update(): void
    {
        if (this.ended)
            return;
        
        this.ball.update();
        this.player1.update(this.canvasHeight);
        this.player2.update(this.canvasHeight);

        //Wall collision
        if (this.ball.y - this.ball.radius <=  0 /* CANVAS_TOP_HEIGHT */)
        {
            this.ball.vy = Math.abs(this.ball.vy);
            console.log("Collide top wall");
        }
        else if (this.ball.y + this.ball.radius >= this.canvasHeight)
        {
            this.ball.vy = -Math.abs(this.ball.vy);
            console.log("Collide bot wall");
        }

        //Player collision
        if (this.collidesPaddle(this.player1))
            this.ball.vx = Math.abs(this.ball.vx);
        else if (this.collidesPaddle(this.player2))
            this.ball.vx = -Math.abs(this.ball.vx);

        //Score
        if (this.ball.x < 0)
        {
            this.score2++;
            this.checkEnd();
            this.ball.reset();
        }
        else if (this.ball.x > this.canvasLength)
        {
            this.score1++;
            this.checkEnd();
            this.ball.reset();
        }
    }

    isInRange(min: number, max: number, nb: number): boolean
    {
        return (nb >= min && nb <= max);
    }

    collidesPaddle(p: Player): boolean
    {
        if ((this.isInRange(p.y, p.y + p.height, this.ball.y - (this.ball.radius / 1.25))
        || this.isInRange(p.y, p.y + p.height, this.ball.y + (this.ball.radius / 1.25))))
        {
            if (this.isInRange(p.x, p.x + p.width, this.ball.x - this.ball.radius))
            {
                console.log("Player 1 hit ball.");
                return true;
            }
            else if (this.isInRange(p.x, p.x + p.width, this.ball.x + this.ball.radius))
            {
                console.log("Player 2 hit ball.");
                return true;
            }
        }
        return false;
    }

/*     handleKeyEvent(event: KeyboardEvent): void
    {
        const key = event.key;

        if (key === 'w' || key === 's'
            || key === 'ArrowUp' || key === 'ArrowDown')
            this.socket.emit('handleKeyEvent', key, event.type);
    } */

    handleKeyDown(event: KeyboardEvent): void
    {
        const key = event.key;

        if (key === 'w')
            this.player1.direction = -1;
        if (key === 's')
            this.player1.direction = 1;
        if (key === 'ArrowUp')
            this.player2.direction = -1;
        if (key === 'ArrowDown')
            this.player2.direction = 1;
        console.log("down pressed\n");
    }

    handleKeyUp(event: KeyboardEvent): void
    {
        const key = event.key;

        if (['w', 's'].indexOf(key) !== -1)
            this.player1.direction = 0;
        if (['ArrowUp', 'ArrowDown'].indexOf(key) !== -1)
            this.player2.direction = 0;
        console.log("up pressed\n");
    }

    checkEnd(): void
    {
        if (this.score1 > 2 || this.score2 > 2)
            this.ended = true;
    }
}