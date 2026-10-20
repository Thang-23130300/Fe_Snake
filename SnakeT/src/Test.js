import { DIRECTIONS } from "./Config.js";
import { snake } from "./Core/Snake.js";
import { food } from "./Core/Food.js";
import { level1 } from "./Levels/Level1.js";

function createTestGame() {
    const snakeT = new snake();
    const foodT = new food();
    const level = new level1();
    foodT.spawn(snakeT.body);
    snakeT.reset(3);

    return { snakeT, foodT, level };
}
// Test case 1 normal move
function testNormalMove() {
    const { snakeT, foodT, level } = createTestGame();
    snakeT.body = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    snakeT.direction = DIRECTIONS.RIGHT;
    snakeT.nextDirection = DIRECTIONS.RIGHT;
    foodT.position = { x: 10, y: 10 };
    const status = level.update(snakeT, foodT);
    console.assert(status === "playing", "Normal move: wrong status");
    console.assert(snakeT.body.length === 3, "Normal move: wrong length");
    console.assert(snakeT.body[0].x === 6, "Normal move: wrong start pont");
}
// Test case 2 eat food
function testEatFood() {
    const { snakeT, foodT, level } = createTestGame();
    snakeT.body = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    snakeT.direction = DIRECTIONS.RIGHT;
    snakeT.nextDirection = DIRECTIONS.RIGHT;
    foodT.position = { x: 6, y: 5 };
    const status = level.update(snakeT, foodT);
    console.assert(status === "playing", "Eat food: wrong status");
    console.assert(snakeT.body.length === 4, "Eat food: Snake donot increase body length");
    console.assert(level.countFood === 1, "Eat food: scope donot increase =");
}
// Test case 3 : Self collision
function testSelfCollision() {
    const { snakeT, foodT, level } = createTestGame();
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
    const status = level.update(snakeT, foodT);
    console.assert(status === "gameover", "Self collision: not Game Over");
}
// Test case 4 : win when complete 20 apple
function testWin() {
    const { snakeT, foodT, level } = createTestGame();
    snakeT.body = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    snakeT.direction = DIRECTIONS.RIGHT;
    snakeT.nextDirection = DIRECTIONS.RIGHT;
    level.countFood = 19;
    foodT.position = { x: 6, y: 5 };
    const status = level.update(snakeT, foodT);
    console.assert(status === "win", "Win: not reponse win ");
    console.assert(level.countFood === 20, "Win: scope different 20 ");
}

testNormalMove();
testEatFood();
testSelfCollision();
testWin();

console.log("Đã chạy 4 bài kiểm thử Level 1.");
