export class Ball {
    constructor() {
        this.x = 400;
        this.y = 300;
        this.vx = 10;
        this.vy = 10;
        this.radius = 10;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    reset() {
        this.x = 400;
        this.y = 300;
        this.vx = -this.vx; //ball start goes to winner of round
        this.vy = this.vy * (Math.random() > 0.5 ? 1 : -1); //random Y value, ball goes up or down
        console.log("Game reset");
    }
}
