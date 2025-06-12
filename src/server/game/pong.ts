import { Player } from "./player.js";
import { Ball } from "./ball.js";

export interface GameState 
{
    ball: {x: number, y: number, radius: number};
    player1: {x: number, y: number, score: number, width: number, height: number};
    player2: {x: number, y: number, score: number, width: number, height: number};
}

export class PongGame
{
    canvasHeight: number = 600;
    canvasLength: number = 800;
    readonly player1: Player; 
    readonly player2: Player;
    readonly ball: Ball;

    score1: number = 0;
    score2: number = 0;

    ended:boolean = false;

    constructor()
    {
        this.player1 = new Player(30, 250);
        this.player2 = new Player(760, 250);
        this.ball = new Ball();
    }

    serialize(): GameState
    {
        return { ball: {x: this.ball.x, y: this.ball.y, radius: this.ball.radius},
                player1: {x: this.player1.x, y: this.player1.y, score: this.score1, width: this.player1.width, height: this.player1.height},
                player2: {x: this.player2.x, y: this.player2.y, score: this.score2, width: this.player2.width, height: this.player2.height}
        };
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

    handleKeyDown(key: string): void
    {
        if (key === 'w')
            this.player1.direction = -1;
        if (key === 's')
            this.player1.direction = 1;
        if (key === 'ArrowUp')
            this.player2.direction = -1;
        if (key === 'ArrowDown')
            this.player2.direction = 1;
    }

    handleKeyUp(key: string): void
    {
        if (['w', 's'].indexOf(key) !== -1)
            this.player1.direction = 0;
        if (['ArrowUp', 'ArrowDown'].indexOf(key) !== -1)
            this.player2.direction = 0;
    }

    checkEnd(): void
    {
        if (this.score1 > 2 || this.score2 > 2)
            this.ended = true;
    }
}