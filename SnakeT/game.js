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
        this.length = length;
        this.reset(length);
    }

    reset(length = 3) {
        this.body = [];
        const startX = Math.max(length - 1, 5);
        const startY = Math.floor(BOARD_CONFIG.HEIGHT / 2);
        for (let i = 0; i < length; i++) {
            this.body.push({x: startX - i, y: startY});
        }
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
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
class Food {
    constructor() {
        this.position = null;
    }

    spawn(snakeBody) {
        while (true) {
            const foodX = Math.floor(Math.random() * BOARD_CONFIG.WIDTH);
            const foodY = Math.floor(Math.random() * BOARD_CONFIG.HEIGHT);
            const isOnSnake = snakeBody.some(segment => segment.x === foodX && segment.y === foodY);
            if (!isOnSnake) {
                this.position = { x: foodX, y: foodY };
                break;
            }
        }
    }
}

// Game levels
// 1 : level 1
class Level1 {
    constructor() {
        this.name = "Level 1";
        this.title = "Classic Snake";
        this.description = "Rắn có thể đi xuyên qua các cạnh của bản đồ và xuất hiện ở cạnh đối diện.";
        this.targetFood = 20;
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
        if (isLose == true) {
            console.log("Game Over");
            return "gameover";
        } else {
            snakeT.move(nextHead, shouldGrow);
        }
        if (shouldGrow == true) {
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

    render(snakeT, foodT, level1T, gameStatus) {
        this.clearBoard();
        this.renderFood(foodT);
        this.renderSnake(snakeT);
        this.score.textContent = `Food: ${level1T.countFood}`;
        this.status.textContent = gameStatus;
        this.renderLevelInfo(level1T);
    }

    renderLevelInfo(level1T) {
        this.currentLevel.textContent = level1T.name;
        this.levelNumber.textContent = level1T.name;
        this.levelTitle.textContent = level1T.title;
        this.levelDescription.textContent = level1T.description;
        this.winCondition.textContent = level1T.winCondition;
    }

    clearBoard() {
        for (const cell of this.cells) {
            cell.className = "cell";
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
}

// main control
const snake = Snake;
const food = Food;
const level1 = Level1;

let snakeT;
let foodT;
let level1T;
let renderer;

let gameStatus = "ready";
let gameLoop = null;
let speed = 200;
let directionChanged = false;

function startGame(level1T, snakeT, foodT) {
    if (gameStatus !== "ready" && gameStatus !== "paused") {
        return;
    }
    if (gameLoop !== null) {
        return;
    }
    gameStatus = "playing";
    directionChanged = false;
    renderer.render(snakeT, foodT, level1T, gameStatus);
    gameLoop = setInterval(() => { play(level1T, snakeT, foodT); }, speed);
}

function play(level1T, snakeT, foodT) {
    if (gameStatus !== "playing") {
        return;
    }
    const status = level1T.update(snakeT, foodT);
    gameStatus = status;
    directionChanged = false;
    renderer.render(snakeT, foodT, level1T, gameStatus);
    console.log("Status:", gameStatus);
    console.log("Snake head:", snakeT.body[0]);
    if (status === "win" || status === "gameover") {
        stopGameLoop();
        setTimeout(() => {
            if (status === "win") {
                alert("YOU WIN");
            } else {
                alert("GAME OVER");
            }
        }, 100);
        }
}

function pauseGame() {
    if (gameStatus !== "playing") {
        return;
    }
    stopGameLoop();
    gameStatus = "paused";
    renderer.render(snakeT, foodT, level1T, gameStatus);
    console.log("Game Paused");
}

function resumeGame(level1T, snakeT, foodT) {
    if (gameStatus !== "paused") {
        return;
    }
    startGame(level1T, snakeT, foodT);
    console.log("Game Resumed");
}

function restartGame() {
    const settings = getGameSettings();
    if (settings.level !== 1) {
        throw new Error("Level này chưa được hỗ trợ");
    }
    stopGameLoop();
    initializeGame(settings);
    document.getElementById("level-select").disabled = false;
    document.getElementById("snake-length").disabled = false;
    document.getElementById("game-speed").disabled = false;
    console.log("Game Restarted");
}

function stopGameLoop() {
    if (gameLoop !== null) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
}

function getGameSettings() {
    const level = Number(document.getElementById("level-select").value);
    const length = Number(document.getElementById("snake-length").value);
    const selectedSpeed = Number(document.getElementById("game-speed").value);
    if (!Number.isInteger(length) || length < 3 || length > 10) {
        throw new Error("Snake length must be between 3 and 10");
    }
    if (!Number.isInteger(selectedSpeed) || selectedSpeed < 50 || selectedSpeed > 300) {
        throw new Error("Speed must be between 50 and 300ms");
    }
    return { level, length, speed: selectedSpeed };
}

function initializeGame(settings = getGameSettings()) {
    if (settings.level !== 1) {
        throw new Error("Level này chưa được hỗ trợ");
    }
    speed = settings.speed;
    snakeT.reset(settings.length);
    foodT.spawn(snakeT.body);
    level1T.countFood = 0;
    gameStatus = "ready";
    directionChanged = false;
    renderer.render(snakeT, foodT, level1T, gameStatus);
}

function initGameApp() {
    snakeT = new Snake();
    foodT = new Food();
    level1T = new Level1();
    renderer = new Renderer();

    initializeGame();

    // key set
    document.addEventListener("keydown", (event) => {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT" || activeElement.tagName === "TEXTAREA")) {
            return;
        }
        if (event.code === "Enter") {
            event.preventDefault();
            if (event.repeat) {
                return;
            }
            if (gameStatus === "ready") {
                document.getElementById("start-btn").click();
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
                resumeGame(level1T, snakeT, foodT);
            }
            return;
        }

        if (event.code === "Backspace") {
            event.preventDefault();
            if (event.repeat) {
                return;
            }
            document.getElementById("restart-btn").click();
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
            KeyD: DIRECTIONS.RIGHT,
            w: DIRECTIONS.UP,
            s: DIRECTIONS.DOWN,
            a: DIRECTIONS.LEFT,
            d: DIRECTIONS.RIGHT,
            W: DIRECTIONS.UP,
            S: DIRECTIONS.DOWN,
            A: DIRECTIONS.LEFT,
            D: DIRECTIONS.RIGHT
        };

        const newDirection = keyMap[event.key] || keyMap[event.code];
        if (newDirection === undefined) {
            return;
        }

        event.preventDefault();
        if (directionChanged) {
            return;
        }

        const oldDirection = snakeT.direction;
        snakeT.setDirection(newDirection);
        if (snakeT.nextDirection !== oldDirection) {
            directionChanged = true;
        }
    });

    // click set
    document.getElementById("start-btn").addEventListener("click", () => {
        if (gameStatus !== "ready") {
            return;
        }
        try {
            initializeGame();
            startGame(level1T, snakeT, foodT);
            document.getElementById("level-select").disabled = true;
            document.getElementById("snake-length").disabled = true;
            document.getElementById("game-speed").disabled = true;
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById("pause-btn").addEventListener("click", () => {
        if (gameStatus === "playing") {
            pauseGame();
        } else if (gameStatus === "paused") {
            resumeGame(level1T, snakeT, foodT);
        }
    });

    document.getElementById("restart-btn").addEventListener("click", () => {
        try {
            restartGame();
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
