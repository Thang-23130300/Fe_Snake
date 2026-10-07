import {DIRECTIONS} from "../config";
import {BOARD_CONFIG} from "../config";

export class snake{
    constructor(length = 3 ) {
        this.length = length;
        this.reset();
    }
    reset(){
        this.body = [];
        const startX = parseInt(Math.random() * (BOARD_CONFIG.WIDTH -2));
        const startY = parseInt(Math.random()* (BOARD_CONFIG.HEIGHT -2));

        for (let i = 0; i < this.length; i++) {
            this.body.push({x : startX -i,y : startY});
        }
    }

}