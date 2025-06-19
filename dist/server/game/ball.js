export class Ball {
    constructor(canvasLength, canvasHeight) {
        this.vx = 6;
        this.vy = 6;
        this.length = 8;
        this.x = (canvasLength / 2) - (this.length / 2);
        this.y = (canvasHeight / 2) - (this.length / 2);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    reset(canvasLength, canvasHeight) {
        console.log("game reset");
        this.x = (canvasLength / 2) - (this.length / 2);
        this.y = (canvasHeight / 2) - (this.length / 2);
        this.vx = -this.vx; //ball start goes to winner of round
        this.vy = this.vy * (Math.random() > 0.5 ? 1 : -1); //random Y value, ball goes up or down
    }
}
