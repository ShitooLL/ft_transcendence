export class Ball
{
    x: number = 400;
    y: number = 300;
    vx: number = 10;
    vy: number = 10;
    radius: number = 10;

    update(): void
    {
        this.x += this.vx;
        this.y += this.vy;
    }

    reset(): void
    {
        this.x = 400;
        this.y = 300;
        this.vx = -this.vx;                                 //ball start goes to winner of round
        this.vy = this.vy * (Math.random() > 0.5 ? 1 : -1); //random Y value, ball goes up or down
        console.log("Game reset");
    }
}