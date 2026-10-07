import {BOARD_CONFIG} from "../config";
export class level1{
    getNextHead(head, direction) {
        let nextX = head.x +direction.x;
        let nextY = head.y +direction.y;
        if (nextX > BOARD_CONFIG.WIDTH) nextX = 0 ;
        if (nextY > BOARD_CONFIG.HEIGHT) nextY = 0 ;
        if (nextX < 0 ) nextX = BOARD_CONFIG.WIDTH -1;
        if (nextY < 0 ) nextY = BOARD_CONFIG.HEIGHT -1;
        return {x: nextX, y: nextY};
    }
}