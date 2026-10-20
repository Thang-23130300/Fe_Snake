import { snake } from "./Core/Snake.js";
import { food } from "./Core/Food.js";
import { level1 } from "./Levels/Level1.js";
import {DIRECTIONS} from "./Config.js";

const snakeT = new snake();
const foodT = new food();
const level1T = new level1();

snakeT.body = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
];

snakeT.direction = DIRECTIONS.RIGHT;
snakeT.nextDirection = DIRECTIONS.RIGHT;

foodT.position = { x: 6, y: 5 };

level1T.countFood = 19;
level1T.targetFood = 20;

const result = level1T.update(snakeT, foodT);

console.log("status:", result);
console.log("countFood:", level1T.countFood);
console.log("length:", snakeT.body.length);
console.log("body:", snakeT.body);