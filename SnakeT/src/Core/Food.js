import {BOARD_CONFIG} from "../Config.js";
export class food{
    constructor(x, y) {
        this.position = null ;
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