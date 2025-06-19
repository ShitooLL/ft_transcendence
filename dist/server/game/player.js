export class Player {
    constructor(x, y) {
        this.name = '';
        this.x = 0;
        this.y = 0;
        this.width = 8;
        this.height = 80;
        this.speed = 10;
        this.direction = 0; // -1 for up, 1 for down, 0 for stationary
        this.x = x;
        this.y = y;
    }
    update(canvasHeight) {
        this.y += this.direction * this.speed;
        this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
    }
}
