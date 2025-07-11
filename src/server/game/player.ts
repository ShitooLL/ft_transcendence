export class Player
{
    name: string = '';
    x: number = 0;
    y: number = 0;
    readonly width: number = 8;
    readonly height: number = 80;
    speed: number = 10;
    direction: number = 0;          // -1 for up, 1 for down, 0 for stationary

    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }

    update(canvasHeight: number): void
    {
        this.y += this.direction * this.speed;
        this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
    }
}