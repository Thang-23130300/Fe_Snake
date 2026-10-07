import {BOARD_CONFIG} from "../config";
export class food{
    constructor(x, y) {
        this.position ={ x: 0, y: 0 } ;
    }
    spawn(snakeBody) {
        while (true) {
            const foodX = Math.floor(Math.random() * BOARD_CONFIG.WIDTH);
            const foodY = Math.floor(Math.random() * BOARD_CONFIG.HEIGHT);
            const isOnSnake = snakeBody.some(segment => segment.x === foodX && segment.y === foodY);
            if (!isOnSnake) {
                this.position = {x: foodX, y: foodY};
                break;
            }
        }
    }
}