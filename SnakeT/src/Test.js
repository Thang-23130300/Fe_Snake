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

// Test case 5 : Turn left
function testTurnLeft() {
    const { snakeT } = createTestGame();
    // Khi rắn đang đi lên, rẽ trái
    snakeT.direction = DIRECTIONS.UP;
    snakeT.nextDirection = DIRECTIONS.UP;
    snakeT.setDirection(DIRECTIONS.LEFT);
    console.assert(snakeT.nextDirection === DIRECTIONS.LEFT, "Turn left when UP failed");
    // Khi rắn đang đi xuống, rẽ trái
    snakeT.direction = DIRECTIONS.DOWN;
    snakeT.nextDirection = DIRECTIONS.DOWN;
    snakeT.setDirection(DIRECTIONS.LEFT);
    console.assert(snakeT.nextDirection === DIRECTIONS.LEFT, "Turn left when DOWN failed");
}
// Test case 6 : Block opposite direction (không cho quay ngược 180 độ gây Game Over)
function testBlockOppositeDirection() {
    const { snakeT } = createTestGame();
    // Đang sang phải -> nhấn sang trái -> phải giữ nguyên hướng
    snakeT.direction = DIRECTIONS.RIGHT;
    snakeT.nextDirection = DIRECTIONS.RIGHT;
    snakeT.setDirection(DIRECTIONS.LEFT);
    console.assert(snakeT.nextDirection === DIRECTIONS.RIGHT, "Block opposite LEFT when moving RIGHT failed");

    // Đang lên trên -> nhấn xuống dưới -> phải giữ nguyên hướng
    snakeT.direction = DIRECTIONS.UP;
    snakeT.nextDirection = DIRECTIONS.UP;
    snakeT.setDirection(DIRECTIONS.DOWN);
    console.assert(snakeT.nextDirection === DIRECTIONS.UP, "Block opposite DOWN when moving UP failed");

    // Đang sang trái -> nhấn sang phải -> phải giữ nguyên hướng
    snakeT.direction = DIRECTIONS.LEFT;
    snakeT.nextDirection = DIRECTIONS.LEFT;
    snakeT.setDirection(DIRECTIONS.RIGHT);
    console.assert(snakeT.nextDirection === DIRECTIONS.LEFT, "Block opposite RIGHT when moving LEFT failed");

    // Đang xuống dưới -> nhấn lên trên -> phải giữ nguyên hướng
    snakeT.direction = DIRECTIONS.DOWN;
    snakeT.nextDirection = DIRECTIONS.DOWN;
    snakeT.setDirection(DIRECTIONS.UP);
    console.assert(snakeT.nextDirection === DIRECTIONS.DOWN, "Block opposite UP when moving DOWN failed");
}

testNormalMove();
testEatFood();
testSelfCollision();
testWin();
testTurnLeft();
testBlockOppositeDirection();

console.log("Đã chạy thành công tất cả bài kiểm thử Level 1 (bao gồm rẽ trái và chặn đi ngược hướng).");
