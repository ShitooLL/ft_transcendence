import { Player } from "./player.js";
import { Ball } from "./ball.js";
export class PongGame {
    constructor() {
        this.canvasLength = 1000;
        this.canvasHeight = 600;
        this.score1 = 0;
        this.score2 = 0;
        this.ended = false;
        this.player1 = new Player(44, (this.canvasHeight / 2) - 80);
        this.player2 = new Player(this.canvasLength - 44 - 8, (this.canvasHeight / 2) - 80); //(964, 260)
        this.ball = new Ball(this.canvasLength, this.canvasHeight);
    }
    serialize() {
        return { ball: { x: this.ball.x, y: this.ball.y, length: this.ball.length },
            player1: { x: this.player1.x, y: this.player1.y, score: this.score1, width: this.player1.width, height: this.player1.height },
            player2: { x: this.player2.x, y: this.player2.y, score: this.score2, width: this.player2.width, height: this.player2.height }
        };
    }
    update() {
        if (this.ended)
            return;
        //Wall collision
        if (this.ball.y - this.ball.length <= 0 /* CANVAS_TOP_HEIGHT */) {
            this.ball.vy = Math.abs(this.ball.vy);
        }
        else if (this.ball.y + this.ball.length >= this.canvasHeight) {
            this.ball.vy = -Math.abs(this.ball.vy);
        }
        //Player collision
        if (this.collidesPaddle(this.player1)) {
            this.generateRandomSpeed(this.ball);
            this.ball.vx = Math.abs(this.ball.vx);
            console.log("Player 1 hit ball");
        }
        else if (this.collidesPaddle(this.player2)) {
            this.generateRandomSpeed(this.ball);
            this.ball.vx = -Math.abs(this.ball.vx);
            console.log("Player 2 hit ball");
        }
        this.ball.update();
        this.player1.update(this.canvasHeight);
        this.player2.update(this.canvasHeight);
        //Score
        if (this.ball.x < 0) {
            this.score2++;
            this.checkEnd();
            this.ball.reset(this.canvasLength, this.canvasHeight);
        }
        else if (this.ball.x > this.canvasLength) {
            this.score1++;
            this.checkEnd();
            this.ball.reset(this.canvasLength, this.canvasHeight);
        }
    }
    generateRandomSpeed(ball) {
        const speed = [6, 8, 9, 10];
        let neg = 1;
        if (this.ball.vy < 0)
            neg = -neg;
        this.ball.vx = speed[Math.floor(Math.random() * speed.length)];
        this.ball.vy = speed[Math.floor(Math.random() * speed.length)] * neg;
    }
    isInRange(min, max, nb) {
        return (nb >= min && nb <= max);
    }
    collidesPaddle(p) {
        // Check : if ball's sides (left and right) are within paddle's sides
        // && if ball's right side is not behind Player's 2 right side
        // && if ball's left side is not behind Player's 1 left side
        if (this.ball.x <= p.x + p.width && this.ball.x + this.ball.length >= p.x
            && this.ball.x + this.ball.length <= this.player2.x + p.width + (this.ball.length / 4)
            && this.ball.x >= this.player1.x - (this.ball.length / 4)) {
            // Ball's center hit paddle
            if (this.isInRange(p.y, p.y + p.height, this.ball.y + (this.ball.length / 2))) {
                console.log("Middle hit ball");
                this.ball.vy = this.ball.vy * (Math.random() < 0.5 ? -1 : 1);
                return true;
            }
            // Ball's upper hit paddle
            else if (this.isInRange(p.y, p.y + p.height, this.ball.y)) {
                console.log("Upper side hit ball");
                this.ball.vy = Math.abs(this.ball.vy);
                return true;
            }
            // Ball's bottom hit paddle
            else if (this.isInRange(p.y, p.y + p.height, this.ball.y + this.ball.length)) {
                console.log("Bottom side hit ball");
                this.ball.vy = -Math.abs(this.ball.vy);
                return true;
            }
        }
        return false;
    }
    /*
        collidesPaddle(p: Player): boolean
        {
            if ((this.isInRange(p.y, p.y + p.height, this.ball.y - (this.ball.length / 1.25))
            || this.isInRange(p.y, p.y + p.height, this.ball.y + (this.ball.length / 1.25))))
            {
                if (this.isInRange(p.x, p.x + p.width, this.ball.x - this.ball.length))
                {
                    console.log("Player 1 hit ball.");
                    return true;
                }
                else if (this.isInRange(p.x, p.x + p.width, this.ball.x + this.ball.length))
                {
                    console.log("Player 2 hit ball.");
                    return true;
                }
            }
            return false;
        } */
    /*
        collidesPaddle(p: Player): boolean
        {
            const piSur6 = (Math.sqrt(3) / 2) * this.ball.length;
            const piSur4 = (Math.sqrt(2) / 2) * this.ball.length;
            const piSur3 = this.ball.length / 2;
    
            // Outer block: Checking collisions of the left and right sides of the ball.
            if ((this.isInRange(p.y, p.y + p.height, this.ball.y - piSur4)
            || this.isInRange(p.y, p.y + p.height, this.ball.y + piSur4)))
            {
                // left
                if (this.isInRange(p.x, p.x + p.width, this.ball.x - piSur6) && this.ball.vx < 0)
                {
                    console.log("Player 1 hit ball.");
                    return true;
                }
                // right
                else if (this.isInRange(p.x, p.x + p.width, this.ball.x + piSur6)  && this.ball.vx > 0)
                {
                    console.log("Player 2 hit ball.");
                    return true;
                }
            }
            // Inner block: Checking collisions of the upper and bottom sides of the ball.
            // if ((this.isInRange(p.x, p.x + p.width, this.ball.x - piSur6) && this.ball.vx < 0)
            // || (this.isInRange(p.x, p.x + p.width, this.ball.x + piSur6) && this.ball.vx > 0) )
            if (this.isInRange(p.x, p.x + p.width, this.ball.x))
            {
                // console.log(`py: ${p.y}, pylen: ${p.y + p.height}, lineup: ${this.ball.y - this.ball.length}, linebot: ${this.ball.y + this.ball.length} , ball: ${this.ball.y}`);
                // top
                if (this.isInRange(p.y, p.y + p.height, this.ball.y - this.ball.length))
                {
                    console.log("Upper side hit ball (any player)");
                    this.ball.vy = Math.abs(this.ball.vy);
                    return true;
                }
                // bot
                else if (this.isInRange(p.y, p.y + p.height, this.ball.y + this.ball.length))
                {
                    console.log("Bottom side hit ball (any player)");
                    this.ball.vy = -Math.abs(this.ball.vy);
                    return true;
                }
            }
            return false;
        } */
    handleKeyDown(key, playerSide) {
        if (playerSide === 1 || playerSide === 0) {
            if (key === 'w')
                this.player1.direction = -1;
            else if (key === 's')
                this.player1.direction = 1;
        }
        if (playerSide === 2 || playerSide === 0) {
            if (key === 'ArrowUp')
                this.player2.direction = -1;
            else if (key === 'ArrowDown')
                this.player2.direction = 1;
        }
    }
    handleKeyUp(key, playerSide) {
        if (['w', 's'].includes(key) && (playerSide === 1 || playerSide === 0))
            this.player1.direction = 0;
        if (['ArrowUp', 'ArrowDown'].includes(key) && (playerSide === 2 || playerSide === 0))
            this.player2.direction = 0;
    }
    checkEnd() {
        if (this.score1 >= 5 || this.score2 >= 5)
            this.ended = true;
    }
}
