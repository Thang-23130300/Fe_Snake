import {BOARD_CONFIG} from "../Config.js";
export class level1{
    getNextHead(head, direction) {
        let nextX = head.x +direction.x;
        let nextY = head.y +direction.y;
        if (nextX >= BOARD_CONFIG.WIDTH) nextX = 0 ;
        if (nextY >= BOARD_CONFIG.HEIGHT) nextY = 0 ;
        if (nextX < 0 ) nextX = BOARD_CONFIG.WIDTH -1;
        if (nextY < 0 ) nextY = BOARD_CONFIG.HEIGHT -1;
        return {x: nextX, y: nextY};
    }
    update (snake , food) {
        const head = snake.body[0];
        const nextHead = this.getNextHead(head,snake.nextDirection );
        let shouldGrow = false;
        if (nextHead.x == food.position.x && nextHead.y == food.position.y) {
            shouldGrow = true;
        }
        const isLose = snake.selfCollision(nextHead,shouldGrow);
        if (isLose == true) {
            console.log("Game Over");
            return "gameover";
        } else{
            snake.move(nextHead, shouldGrow);
        }
        if (shouldGrow == true) {
            food.spawn(snake.body);
        }
        return "playing";
    }
}