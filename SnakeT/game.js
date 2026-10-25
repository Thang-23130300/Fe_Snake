// base parameter default
const BOARD_CONFIG = { WIDTH: 17, HEIGHT: 15 };

const SNAKE_LIMIT = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 10,
    MIN_SPEED: 50,
    MAX_SPEED: 300
};

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};
// Snake default
class Snake {
    constructor(length = 3) {
        this.reset(length);
    }
    get length() {
        return this.body.length;
    }

    reset(length = 3,
          startX = Math.max(length, 5),
          startY = Math.floor(BOARD_CONFIG.HEIGHT / 2),
          direction = DIRECTIONS.RIGHT) {
        this.body = [];
        for (let i = 0; i < length; i++) {
            this.body.push({x: startX - direction.x * i, y: startY - direction.y * i});
        }
        this.direction = direction;
        this.nextDirection = direction;
    }

    setDirection(newDirection) {
        if (!newDirection) return;
        // ban turn over
        if (newDirection.x + this.direction.x === 0 && newDirection.y + this.direction.y === 0) {
            return;
        }
        this.nextDirection = newDirection;
    }

    move(nextHead, shouldGrow = false) {
        this.direction = this.nextDirection;
        this.body.unshift(nextHead);
        if (!shouldGrow) {
            this.body.pop();
        }
    }

    selfCollision(nextHead, shouldGrow = false) {
        let segmentToCheck;
        if (shouldGrow === true) {
            segmentToCheck = this.body;
        } else {
            segmentToCheck = this.body.slice(0, -1);
        }
        return segmentToCheck.some(segment => segment.x === nextHead.x && segment.y === nextHead.y);
    }
}

// Food default
// food normal
class Food {
    constructor() {
        this.position = null;
    }

    spawn(snakeBody, blockedCells = []) {
        const availableCells = [];
        for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
            for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
                const isOnSnake = snakeBody.some(segment => segment.x === x && segment.y === y);
                const isBlocked = blockedCells.some(cell => cell.x === x && cell.y === y);
                if (!isOnSnake && !isBlocked) {
                    availableCells.push({ x, y });
                }
            }
        }
        if (availableCells.length === 0) {
            this.position = null;
            return false;
        }
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        this.position = availableCells[randomIndex];
        return true;
    }
}
// special food
class SpecialFood {
    constructor() {
        this.position = null;
        this.type = null;
        this.types = ["speed", "slow", "poison", "peach"];
    }

    spawn(snakeBody, normalFoodPosition) {
        const availableCells = [];

        for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
            for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
                const isOnSnake = snakeBody.some(segment => segment.x === x && segment.y === y);
                const isOnNormalFood = normalFoodPosition !== null && normalFoodPosition.x === x && normalFoodPosition.y === y;
                if (!isOnSnake && !isOnNormalFood) {
                    availableCells.push({ x, y });
                }
            }
        }

        if (availableCells.length === 0) {
            this.position = null;
            this.type = null;
            return false;
        }

        const randomPosition = Math.floor(Math.random() * availableCells.length);
        const randomType = Math.floor(Math.random() * this.types.length);
        this.position = availableCells[randomPosition];
        this.type = this.types[randomType];
        return true;
    }

    clear() {
        this.position = null;
        this.type = null;
    }
}

// Game levels
// 1 : level 1
class Level1 {
    constructor() {
        this.name = "Level 1";
        this.title = "Classic Snake";
        this.description = "Rắn có thể đi xuyên qua các cạnh của bản đồ và xuất hiện ở cạnh đối diện.";
        this.targetFood = 36;
        this.winCondition = `Ăn đủ ${this.targetFood} food để chiến thắng.`;
        this.countFood = 0;
    }

    getNextHead(head, direction) {
        let nextX = head.x + direction.x;
        let nextY = head.y + direction.y;
        if (nextX >= BOARD_CONFIG.WIDTH) nextX = 0;
        if (nextY >= BOARD_CONFIG.HEIGHT) nextY = 0;
        if (nextX < 0) nextX = BOARD_CONFIG.WIDTH - 1;
        if (nextY < 0) nextY = BOARD_CONFIG.HEIGHT - 1;
        return { x: nextX, y: nextY };
    }

    update(snakeT, foodT) {
        const head = snakeT.body[0];
        const nextHead = this.getNextHead(head, snakeT.nextDirection);
        let shouldGrow = false;
        if (nextHead.x === foodT.position.x && nextHead.y === foodT.position.y) {
            shouldGrow = true;
        }
        const isLose = snakeT.selfCollision(nextHead, shouldGrow);
        if (isLose) {
            console.log("Game Over");
            return "gameover";
        } else {
            snakeT.move(nextHead, shouldGrow);
        }
        if (shouldGrow) {
            this.countFood += 1;
            if (this.countFood >= this.targetFood) {
                foodT.position = null ;
                return "win";
            }
            foodT.spawn(snakeT.body);
        }
        return "playing";
    }
}
// level 2
class Level2 {
    constructor() {
        this.name = "Level 2";
        this.title = "Wall Challenge";
        this.description = "Rắn không thể đi xuyên qua các cạnh bản đồ. Va chạm với tường hoặc cắn vào thân sẽ thua.";
        this.targetFood = 36;
        this.winCondition = `Ăn đủ ${this.targetFood} food để chiến thắng.`;
        this.countFood = 0;
    }

    getNextHead(head, direction) {
        return {
            x: head.x + direction.x, y: head.y + direction.y
        };
    }

    wallCollision(nextHead) {
        return (nextHead.x < 0 || nextHead.x >= BOARD_CONFIG.WIDTH || nextHead.y < 0 || nextHead.y >= BOARD_CONFIG.HEIGHT );
    }

    update(snakeT, foodT) {
        const head = snakeT.body[0];
        const nextHead = this.getNextHead(head, snakeT.nextDirection);
        if (this.wallCollision(nextHead)) {
            return "gameover";
        }
        const shouldGrow = nextHead.x === foodT.position.x && nextHead.y === foodT.position.y;
        if (snakeT.selfCollision(nextHead, shouldGrow)) {
            return "gameover";
        }
        snakeT.move(nextHead, shouldGrow);
        if (shouldGrow) {
            this.countFood++;
            if (this.countFood >= this.targetFood) {
                foodT.position = null;
                return "win";
            }
            foodT.spawn(snakeT.body);
        }
        return "playing";
    }
}
// lêvel 3
class Level3 extends Level2 {
    constructor() {
        super();
        this.name = "Level 3";
        this.title = "Special Apple Challenge";
        this.description = "Cứ ăn 5 táo thường sẽ xuất hiện 1 táo đặc biệt.";
        this.targetFood = 36;
        this.winCondition = `Đạt ${this.targetFood} điểm táo để chiến thắng.`;
        this.countFood = 0;
        this.normalFoodEaten = 0;
        // key of level 3
        this.specialFood = new SpecialFood();
        this.activeEffect = null;
    }

    activateEffect(type) {
        if (type !== "speed" && type !== "slow") {
            return;
        }
        this.activeEffect = type;
    }

    getCurrentSpeed(baseSpeed) {
        if (this.activeEffect === "speed") {
            return Math.max(SNAKE_LIMIT.MIN_SPEED, Math.round(baseSpeed * 0.7));
        }
        if (this.activeEffect === "slow") {
            return Math.min(SNAKE_LIMIT.MAX_SPEED, Math.round(baseSpeed * 1.3));
        }
        return baseSpeed;
    }

    update(snakeT, foodT) {
        const head = snakeT.body[0];
        const nextHead = this.getNextHead(head, snakeT.nextDirection);
        if (this.wallCollision(nextHead)) {
            return "gameover";
        }
        const shouldGrow = foodT.position !== null && nextHead.x === foodT.position.x && nextHead.y === foodT.position.y;
        if (snakeT.selfCollision(nextHead, shouldGrow)) {
            return "gameover";
        }
        const specialFood = this.specialFood;
        const eatSpecial = specialFood.position !== null && nextHead.x === specialFood.position.x && nextHead.y === specialFood.position.y;
        if (eatSpecial && specialFood.type === "poison") {
            console.log("Game Over: Poison Apple");
            return "gameover";
        }
        snakeT.move(nextHead, shouldGrow);
        if (eatSpecial) {
            const specialType = specialFood.type;
            if (specialType === "speed" || specialType === "slow") {
                this.activateEffect(specialType);
            } else if (specialType === "peach") {
                this.countFood += 4;
                console.log(`Peach: 4 điểm`);
            }
            specialFood.clear();
        }
        if (shouldGrow) {
            this.countFood += 1;
            this.normalFoodEaten += 1;
        }
        if (this.countFood >= this.targetFood) {
            foodT.position = null;
            this.specialFood.clear();
            return "win";
        }
        if (shouldGrow) {
            const blockedCells = [];
            if (this.specialFood.position !== null) {
                blockedCells.push(this.specialFood.position);
            }
            const spawned = foodT.spawn(snakeT.body, blockedCells);
            if (!spawned) {
                return "win";
            }
            if (this.normalFoodEaten % 5 === 0) {
                this.specialFood.spawn(snakeT.body, foodT.position);
            }
        }
        return "playing";
    }
}
// level 4
class Level4 extends Level3 {
    constructor() {
        super();
        this.name = "Level 4";
        this.title = "Dark Vision";
        this.description = "Bản đồ chìm trong bóng tối. Chỉ vùng 3x3 quanh đầu rắn và các quả táo được chiếu sáng.";
        this.targetFood = 36;
        this.winCondition = `Đạt ${this.targetFood} điểm để chiến thắng.`;
        this.visionRadius = 1;
    }
}
// level 5
class Level5 extends Level2 {
    constructor() {
        super();
        this.name = "Level 5";
        this.title = "Dual Snake";
        this.description = "Điều khiển hai con rắn luân phiên. Mỗi lần ăn táo sẽ đổi lượt.";
        this.targetFood = 36;
        this.countFood = 0;
        this.winCondition = `Hai con rắn ăn tổng cộng ${this.targetFood} táo để chiến thắng.`;
        this.snake1 = new Snake(3);
        this.snake2 = new Snake(3);
        this.resetSnakes(3);
        this.snake1.direction = DIRECTIONS.RIGHT;
        this.snake1.nextDirection = DIRECTIONS.RIGHT;
        this.snake2.direction = DIRECTIONS.LEFT;
        this.snake2.nextDirection = DIRECTIONS.LEFT;
        this.activeSnake = 1;
    }

    getActiveSnake() {
        return this.activeSnake === 1 ? this.snake1 : this.snake2;
    }

    getInactiveSnake() {
        return this.activeSnake === 1 ? this.snake2 : this.snake1;
    }

    getSnakeStatus(snakeId) {
        return this.activeSnake === snakeId ? "playing" : "paused";
    }

    getAllSnakeBodies() {
        return [...this.snake1.body, ...this.snake2.body];
    }

    switchSnake() {
        this.activeSnake = this.activeSnake === 1 ? 2 : 1;
    }

    resetSnakes(length) {
        this.snake1.reset(length, length + 1, 4, DIRECTIONS.RIGHT);
        this.snake2.reset(length, 15 - length, 10, DIRECTIONS.LEFT);
        this.activeSnake = 1;
        this.countFood = 0;
    }

    otherSnakeCollision(nextHead, otherSnake) {
        return otherSnake.body.some(segment => segment.x === nextHead.x && segment.y === nextHead.y);
    }

    update(snakeT, foodT) {
        const activeSnake = this.getActiveSnake();
        const inactiveSnake = this.getInactiveSnake();
        const head = activeSnake.body[0];
        const nextHead = this.getNextHead(head, activeSnake.nextDirection);
        if (this.wallCollision(nextHead)) {
            return "gameover";
        }
        const shouldGrow = foodT.position !== null && nextHead.x === foodT.position.x && nextHead.y === foodT.position.y;
        if (activeSnake.selfCollision(nextHead, shouldGrow)) {
            return "gameover";
        }
        if (this.otherSnakeCollision(nextHead, inactiveSnake)) {
            return "gameover";
        }
        activeSnake.move(nextHead, shouldGrow);
        if (shouldGrow) {
            this.countFood++;
            if (this.countFood >= this.targetFood) {
                foodT.position = null;
                return "win";
            }
            const spawned = foodT.spawn(
                this.getAllSnakeBodies()
            );
            if (!spawned) {
                return "gameover";
            }
            this.switchSnake();
        }
        return "playing";
    }
}
// level 6
class Level6 extends Level2 {
    constructor() {
        super();
        this.name = "Level 6";
        this.title = "Shrinking Arena";
        this.description = "Bản đồ sẽ thu hẹp khi bạn ăn đủ số táo.";
        this.targetFood = 36;
        this.countFood = 0;
        this.winCondition = "Ăn đủ 36 quả táo để chiến thắng.";
        this.boardWidth = BOARD_CONFIG.WIDTH;
        this.boardHeight = BOARD_CONFIG.HEIGHT;
        this.currentStage = 1;
        this.shrinkLevel = 0;
        this.shrinkMilestones = [8, 16, 24];
        this.pendingShrink = false;
        this.pendingShrinkCount = 0;
    }
    getArenaBounds() {
        return {
            minX: this.shrinkLevel, maxX: this.boardWidth - 1 - this.shrinkLevel,
            minY: this.shrinkLevel, maxY: this.boardHeight - 1 - this.shrinkLevel};
    }
    wallCollision(position) {
        const bounds = this.getArenaBounds();
        return (position.x < bounds.minX || position.x > bounds.maxX || position.y < bounds.minY || position.y > bounds.maxY);
    }
    canShrink(snake) {
        const nextShrinkLevel = this.shrinkLevel + 1;
        const bounds = {
            minX: nextShrinkLevel, maxX: this.boardWidth - 1 - nextShrinkLevel,
            minY: nextShrinkLevel, maxY: this.boardHeight - 1 - nextShrinkLevel
        };
        return snake.body.every(segment => {
            return (segment.x >= bounds.minX && segment.x <= bounds.maxX && segment.y >= bounds.minY && segment.y <= bounds.maxY);
        });
    }
    checkShrinkMilestone() {
        if (this.shrinkMilestones.includes(this.countFood)) {
            this.pendingShrinkCount++;
            this.pendingShrink = true;
            console.log(`Shrink milestone reached: ${this.countFood} apples`);
        }
    }
    applyPendingShrink(snake, food) {
        if (this.pendingShrinkCount <= 0) {
            return false;
        }
        if (!this.canShrink(snake)) {
            return false;
        }
        this.shrinkLevel++;
        this.currentStage = this.shrinkLevel + 1;
        this.pendingShrinkCount--;
        this.pendingShrink = this.pendingShrinkCount > 0;
        if (food.position && !this.isInsideArena(food.position)) {
            this.spawnFoodInArena(food, snake);
        }
        console.log(`Arena shrunk to Stage ${this.currentStage}`);
        return true;
    }
    spawnFoodInArena(food, snake) {
        const bounds = this.getArenaBounds();
        const blockedCells = [];
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const outsideArena = x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY;
                if (outsideArena) {
                    blockedCells.push({ x, y });
                }
            }
        }
        return food.spawn(snake.body, blockedCells);
    }
    isInsideArena(position, shrinkLevel = this.shrinkLevel) {
        const minX = shrinkLevel;
        const maxX = this.boardWidth - 1 - shrinkLevel;
        const minY = shrinkLevel;
        const maxY = this.boardHeight - 1 - shrinkLevel;
        return (position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY);
    }
    update(snake, food) {
        const head = snake.body[0];
        const nextHead = this.getNextHead(head, snake.nextDirection);
        if (this.wallCollision(nextHead)) {
            return "gameover";
        }
        const shouldGrow = food.position !== null && nextHead.x === food.position.x && nextHead.y === food.position.y;
        if (snake.selfCollision(nextHead, shouldGrow)) {
            return "gameover";
        }
        snake.move(nextHead, shouldGrow);
        if (shouldGrow) {
            this.countFood++;
            if (this.countFood >= this.targetFood) {
                food.position = null;
                return "win";
            }
            this.checkShrinkMilestone();
        }
        this.applyPendingShrink(snake, food);;
        if (shouldGrow) {
            const spawned = this.spawnFoodInArena(food, snake);
            if (!spawned) {
                return "gameover";
            }
        }
        return "playing";
    }
}
// Render Default
class Renderer {
    constructor() {
        this.board = document.getElementById("game-board");
        this.score = document.getElementById("score");
        this.status = document.getElementById("status");
        this.levelNumber = document.getElementById("level-number");
        this.levelTitle = document.getElementById("level-title");
        this.currentLevel = document.getElementById("current-level");
        this.levelDescription = document.getElementById("level-description");
        this.winCondition = document.getElementById("win-condition");
        this.cells = [];
        this.createBoard();
    }

    createBoard() {
        this.board.style.gridTemplateColumns = `repeat(${BOARD_CONFIG.WIDTH}, 25px)`;
        this.board.style.gridTemplateRows = `repeat(${BOARD_CONFIG.HEIGHT}, 25px)`;
        this.board.innerHTML = "";
        this.cells = [];
        for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
            for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                this.board.appendChild(cell);
                this.cells.push(cell);
            }
        }
    }

    getCell(x, y) {
        const index = y * BOARD_CONFIG.WIDTH + x;
        return this.cells[index];
    }

    render(snakeT, foodT, level, gameStatus) {
        this.clearBoard();
        this.board.classList.toggle("level-2-board", level instanceof Level2);
        this.board.classList.toggle("dark-board", level instanceof Level4);
        this.renderFood(foodT);
        this.renderSpecialFood(level);
        if (level instanceof Level5) {
            this.renderDualSnake(level);
        } else {
            this.renderSnake(snakeT);
        }
        if (level instanceof Level6) {
            this.renderShrinkingWalls(level);
        }
        this.renderDarkness(snakeT, foodT, level);
        this.score.textContent = `Food: ${level.countFood}`;
        this.status.textContent = gameStatus;
        this.renderLevelInfo(level);
    }

    renderLevelInfo(level) {
        this.currentLevel.textContent = level.name;
        this.levelNumber.textContent = level.name;
        this.levelTitle.textContent = level.title;
        this.levelDescription.textContent = level.description;
        this.winCondition.textContent = level.winCondition;
    }

    clearBoard() {
        for (const cell of this.cells) {
            cell.classList.remove("snake", "snake-head", "food",
                "special-food", "special-speed", "special-slow", "special-poison", "special-peach",
                "dark-cell", "visible-cell",
                "snake-1", "snake-2", "active-snake", "paused-snake",
                "shrinking-wall"
            );

        }
    }

    renderSnake(snakeT) {
        snakeT.body.forEach((segment, index) => {const cell = this.getCell(segment.x, segment.y);
            if (!cell) return;
            cell.classList.add("snake");
            if (index === 0) {
                cell.classList.add("snake-head");
            }
        });
    }

    renderFood(foodT) {
        if (!foodT.position) return;
        const { x, y } = foodT.position;
        const cell = this.getCell(x, y);
        if (cell) {
            cell.classList.add("food");
        }
    }
    renderSpecialFood(level) {
        if (!(level instanceof Level3)) {
            return;
        }
        const specialFood = level.specialFood;
        if (specialFood.position === null) {
            return;
        }
        const { x, y } = specialFood.position;
        const cell = this.getCell(x, y);
        if (!cell) {
            return;
        }
        cell.classList.add("special-food");
        cell.classList.add(`special-${specialFood.type}`);
    }
    // key of level 4
    illuminateArea(position, radius = 1) {
        if (!position) {
            return;
        }
        for (let y = position.y - radius; y <= position.y + radius; y++) {
            for (let x = position.x - radius; x <= position.x + radius; x++) {
                if (x < 0 || x >= BOARD_CONFIG.WIDTH || y < 0 || y >= BOARD_CONFIG.HEIGHT) {
                    continue;
                }
                const cell = this.getCell(x, y);
                if (!cell) {
                    continue;
                }
                cell.classList.remove("dark-cell");
                cell.classList.add("visible-cell");
            }
        }
    }
    renderDarkness(snakeT, foodT, level) {
        if (!(level instanceof Level4)) {
            return;
        }
        for (const cell of this.cells) {
            cell.classList.remove("visible-cell");
            cell.classList.add("dark-cell");
        }
        const radius = level.visionRadius;
        this.illuminateArea(snakeT.body[0], radius + 1);
        this.illuminateArea(foodT.position, radius);
        this.illuminateArea(level.specialFood.position, radius);
    }
    renderDualSnake(level) {
        const snakes = [{id: 1, snake: level.snake1}, {id: 2, snake: level.snake2}];
        snakes.forEach(({ id, snake }) => {
            const isActive = level.activeSnake === id;
            snake.body.forEach((segment, index) => {
                const cell = this.getCell(segment.x, segment.y);
                if (!cell) {
                    return;
                }
                cell.classList.add("snake");
                cell.classList.add(`snake-${id}`);
                if (isActive) {
                    cell.classList.add("active-snake");
                } else {
                    cell.classList.add("paused-snake");
                }
                if (index === 0) {
                    cell.classList.add("snake-head");
                }
            });

        });
    }
    renderShrinkingWalls(level) {
        const bounds = level.getArenaBounds();
        for (let y = 0; y < BOARD_CONFIG.HEIGHT; y++) {
            for (let x = 0; x < BOARD_CONFIG.WIDTH; x++) {
                const isWall = x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY;
                if (!isWall) {
                    continue;
                }
                const cell = this.getCell(x, y);
                if (cell) {
                    cell.classList.add("shrinking-wall");
                }
            }
        }
    }
}
//game control
class GameController {
    constructor() {
        this.timer = null;
        this.sessionId = 0;
    }
    schedule(callback, delay) {
        if (this.timer !== null) {
            return false;
        }
        this.timer = setTimeout(() => {this.timer = null;callback();}, delay);
        return true;
    }

    stop() {
        if (this.timer !== null) {clearTimeout(this.timer);
            this.timer = null;
        }
    }

    isRunning() {
        return this.timer !== null;
    }

    start(level, snake, food) {
        if (gameStatus !== "ready" && gameStatus !== "paused") {
            return false;
        }

        if (this.isRunning()) {
            return false;
        }

        gameStatus = "playing";
        directionChanged = false;

        renderer.render(snake, food, level, gameStatus);
        scheduleNextTick(level, snake, food);

        return true;
    }

    pause() {
        if (gameStatus !== "playing") {
            return false;
        }
        this.stop();
        gameStatus = "paused";
        renderer.render(snakeT, foodT, currentLevel, gameStatus);
        return true;
    }

    resume(level, snake, food) {
        if (gameStatus !== "paused") {
            return false;
        }
        return this.start(level, snake, food);
    }

    restart(settings) {
        this.stop();
        this.invalidateSession();
        initializeGame(settings);
    }

    finish(status, level) {
        if (gameStatus !== "playing") {
            return false;
        }
        if (status !== "win" && status !== "gameover") {
            return false;
        }
        this.stop();
        gameStatus = status;
        const finishedSession = this.sessionId;
        setTimeout(() => {
            if (this.sessionId !== finishedSession) {
                return;
            }
            if (gameStatus !== status || currentLevel !== level) {
                return;
            }
            if (status === "win") {
                alert("YOU WIN");
            } else {
                alert("GAME OVER");
            }
        }, 50);
        return true;
    }
    invalidateSession() {
        this.sessionId += 1;
    }
}

// main control
let snakeT;
let foodT;
let currentLevel;
let renderer;

let gameStatus = "ready";
const gameController = new GameController();
let speed = 200;
let directionChanged = false;

function scheduleNextTick(level, snakeT, foodT) {
    let currentSpeed = speed;
    if (level instanceof Level3) {
        currentSpeed = level.getCurrentSpeed(speed);
    }
    gameController.schedule(() => {play(level, snakeT, foodT);}, currentSpeed);
}

function startGame(level, snake, food) {
    return gameController.start(level, snake, food);
}

function play(level, snakeT, foodT) {
    if (gameStatus !== "playing") {
        return;
    }
    const previousActiveSnake = level instanceof Level5 ? level.activeSnake : null;
    const status = level.update(snakeT, foodT);
    if (level instanceof Level5) {
        if (previousActiveSnake !== level.activeSnake) {
            console.log(`Snake ${previousActiveSnake}: PAUSED`);
            console.log(`Snake ${level.activeSnake}: PLAYING`);
        }
    }
    if (status === "win" || status === "gameover") {
        gameController.finish(status, level);
    } else {
        gameStatus = status;
    }
    directionChanged = false;
    renderer.render(snakeT, foodT, level, gameStatus);
    console.log("Status:", gameStatus);
    const controlledSnake = getControlledSnake();
    console.log("Snake head:", controlledSnake ? controlledSnake.body[0] : null);
    if (status === "playing") {
        scheduleNextTick(level, snakeT, foodT);
        return;
    }
}

function pauseGame() {
    const paused = gameController.pause();
    if (paused) {
        console.log("Game Paused");
    }
}

function resumeGame(level, snake, food) {
    const resumed = gameController.resume(level, snake, food);
    if (resumed) {
        console.log("Game Resumed");
    }
}

function restartGame() {
    const settings = getGameSettings();
    gameController.restart(settings);
    document.getElementById("level-select").disabled = false;
    document.getElementById("snake-length").disabled = false;
    document.getElementById("game-speed").disabled = false;
    console.log("Game Restarted");
}

function stopGameLoop() {
    gameController.stop();
}

// Game settings
function getGameSettings() {
    const level = Number(document.getElementById("level-select").value);
    const length = Number(document.getElementById("snake-length").value);
    const selectedSpeed = Number(document.getElementById("game-speed").value);
    if (!Number.isInteger(length) || length < SNAKE_LIMIT.MIN_LENGTH || length > SNAKE_LIMIT.MAX_LENGTH) {
        throw new Error("Snake length must be between 3 and 10");
    }
    if (!Number.isInteger(selectedSpeed) || selectedSpeed < SNAKE_LIMIT.MIN_SPEED || selectedSpeed > SNAKE_LIMIT.MAX_SPEED) {
        throw new Error("Speed must be between 50 and 300ms");
    }
    return { level, length, speed: selectedSpeed };
}

function getControlledSnake() {
    if (!currentLevel) {
        return null;
    }
    if (currentLevel instanceof Level5) {
        return currentLevel.getActiveSnake();
    }
    return snakeT;
}

function initializeGame(settings = getGameSettings()) {
    stopGameLoop();
    speed = settings.speed;
    switch (settings.level) {
        case 1:
            currentLevel = new Level1();
            break;
        case 2:
            currentLevel = new Level2();
            break;
        case 3:
            currentLevel = new Level3();
            break;
        case 4:
            currentLevel = new Level4();
            break;
        case 5:
            currentLevel = new Level5();
            break;
        case 6:
            currentLevel = new Level6();
            break;
        default:
            throw new Error("Level này chưa được hỗ trợ");
    }
    snakeT.reset(settings.length);
    if (currentLevel instanceof Level5) {
        currentLevel.resetSnakes(settings.length);
        foodT.spawn(currentLevel.getAllSnakeBodies());
    } else if (currentLevel instanceof Level6) {
        currentLevel.spawnFoodInArena(foodT, snakeT);
    } else {
        foodT.spawn(snakeT.body);

    }
    gameStatus = "ready";
    directionChanged = false;
    renderer.render(snakeT, foodT, currentLevel, gameStatus);
}

function initGameApp() {
    snakeT = new Snake();
    foodT = new Food();
    renderer = new Renderer();

    const levelSelect = document.getElementById("level-select");
    const levelButtons = document.querySelectorAll(".level-btn");
    const startBtn = document.getElementById("start-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const restartBtn = document.getElementById("restart-btn");
    const snakeLengthSelect = document.getElementById("snake-length");
    const gameSpeedSelect = document.getElementById("game-speed");

    initializeGame();

    function updateLevelButtons() {
        const selectedLevel = Number(levelSelect.value);
        levelButtons.forEach(button => {
            const buttonLevel = Number(button.dataset.level);
            button.classList.toggle("active", buttonLevel === selectedLevel);
        });
    }
    updateLevelButtons();

    levelButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (gameStatus !== "ready") {
                return;
            }
            if (button.disabled) {
                return;
            }
            const selectedLevel = Number(button.dataset.level);
            if (![1, 2, 3, 4, 5, 6].includes(selectedLevel)) {
                return;
            }
            levelSelect.value = String(selectedLevel);
            initializeGame();
            updateLevelButtons();
        });
    });

    //key set
    document.addEventListener("keydown", (event) => {
        const activeElement = document.activeElement;
        if (activeElement &&
            (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT" || activeElement.tagName === "TEXTAREA")) {
            return;
        }

        if (event.code === "Enter") {
            event.preventDefault();
            if (event.repeat) {
                return;
            }
            if (gameStatus === "ready") {
                startBtn.click();
            }
            return;
        }

        if (event.code === "Space") {
            event.preventDefault();
            if (event.repeat) {
                return;
            }
            if (gameStatus === "playing") {
                pauseGame();
            } else if (gameStatus === "paused") {
                resumeGame(currentLevel, snakeT, foodT);
            }
            return;
        }

        if (event.code === "Backspace") {
            event.preventDefault();
            if (event.repeat) {
                return;
            }
            restartBtn.click();
            return;
        }

        if (gameStatus !== "playing") {
            return;
        }

        const keyMap = {
            ArrowUp: DIRECTIONS.UP,
            ArrowDown: DIRECTIONS.DOWN,
            ArrowLeft: DIRECTIONS.LEFT,
            ArrowRight: DIRECTIONS.RIGHT,

            KeyW: DIRECTIONS.UP,
            KeyS: DIRECTIONS.DOWN,
            KeyA: DIRECTIONS.LEFT,
            KeyD: DIRECTIONS.RIGHT
        };

        const newDirection = keyMap[event.code];
        if (newDirection === undefined) {
            return;
        }
        event.preventDefault();
        if (directionChanged) {
            return;
        }
        const controlledSnake = getControlledSnake();
        if (!controlledSnake) {
            return;
        }
        const oldDirection = controlledSnake.direction;
        controlledSnake.setDirection(newDirection);
        if (controlledSnake.nextDirection !== oldDirection) {
            directionChanged = true;
        }
    });

    startBtn.addEventListener("click", () => {
        if (gameStatus !== "ready") {
            return;
        }
        try {
            initializeGame();
            startGame(currentLevel, snakeT, foodT);
            levelSelect.disabled = true;
            snakeLengthSelect.disabled = true;
            gameSpeedSelect.disabled = true;
        } catch (error) {
            alert(error.message);
        }
    });

    pauseBtn.addEventListener("click", () => {
        if (gameStatus === "playing") {
            pauseGame();
        } else if (gameStatus === "paused") {
            resumeGame(currentLevel, snakeT, foodT);
        }
    });

    restartBtn.addEventListener("click", () => {
        try {
            restartGame();
            updateLevelButtons();
        } catch (error) {
            alert(error.message);
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGameApp);
} else {
    initGameApp();
}
