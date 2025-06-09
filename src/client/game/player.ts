export class Player
{
    name: string = '';
    x: number = 0;
    y: number = 0;
    readonly width: number = 10;
    readonly height: number = 100;
    speed: number = 12;
    direction: number = 0;          // -1 for up, 1 for down, 0 for stationary

    constructor(x: number, y: number, name: string)
    {
        this.x = x;
        this.y = y;
        this.name = name;
    }

    update(canvasHeight: number): void
    {
        this.y += this.direction * this.speed;
        this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
    }
}