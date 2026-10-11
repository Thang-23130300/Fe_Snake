import {DIRECTIONS,BOARD_CONFIG } from "../Config.js";

export class Snake{
    constructor(length = 3 ) {
        this.length = length;
        this.reset();
    }
    reset(){
        this.body = [];
        const minX = this.length-1;
        const maxX = BOARD_CONFIG.WIDTH -1;
        const startX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        const startY = Math.floor(Math.random() * (BOARD_CONFIG.HEIGHT))

        for (let i = 0; i < this.length; i++) {
            this.body.push({x : startX -i,y : startY});
        }
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
    }
    setDirection(newDir) {
        const isOpposite =
            (newDir === DIRECTIONS.UP && this.direction === DIRECTIONS.DOWN) ||
            (newDir === DIRECTIONS.DOWN && this.direction === DIRECTIONS.UP) ||
            (newDir === DIRECTIONS.LEFT && this.direction === DIRECTIONS.RIGHT) ||
            (newDir === DIRECTIONS.RIGHT && this.direction === DIRECTIONS.LEFT);
        if (!isOpposite) {
            this.nextDirection = newDir;
        }
    }
    move(nextHead, shouldGrow = false) {
        this.direction = this.nextDirection;
        this.body.unshift(nextHead);
        if(!shouldGrow){
            this.body.pop();
        }
    }
    selfCollision(nextHead, shouldGrow = false) {
        let segmentToCheck
        if(shouldGrow === true){
            segmentToCheck = this.body;
        } else {
            segmentToCheck = this.body.slice(0,-1);
        }
         return segmentToCheck.some(segment => segment.x === nextHead.x && segment.y === nextHead.y);
    }
}