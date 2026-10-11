import { snake } from "./Core/Snake.js";
import { food } from "./Core/Food.js";
import { level1 } from "./Levels/Level1.js";
import {DIRECTIONS} from "./Config.js";

const snakeT = new snake();
const foodT = new food();
const level1T = new level1();
// playing
// snakeT.body = [
//     { x: 4, y: 5 },
//     { x: 3, y: 5 },
//     { x: 2, y: 5 }
// ];
//
// foodT.position = { x: 5, y: 5 };
// console.log("before:", snakeT.body.length);
// const result = level1T.update(snakeT, foodT);
// console.log("status:", result);
// console.log("after:", snakeT.body.length);
// console.log("new food:", foodT.position);

// game over
snakeT.body = [
    { x: 5, y: 5 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 5 },
    { x: 6, y: 6 }
];
snakeT.direction = DIRECTIONS.RIGHT;
snakeT.nextDirection = DIRECTIONS.RIGHT;
foodT.position = { x: 10, y: 10 };
const result = level1T.update(snakeT, foodT);
console.log("status:", result);
console.log("body:", snakeT.body);