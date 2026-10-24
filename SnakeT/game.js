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
        this.length = length;
        this.reset(length);
    }

    reset(length = 3) {
        this.length = length;
        this.body = [];
        const startX = Math.max(length , 5);
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
        this.renderFood(foodT);
        this.renderSnake(snakeT);
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
let snakeT;
let foodT;
let currentLevel;
let renderer;

let gameStatus = "ready";
let gameLoop = null;
let speed = 200;
let directionChanged = false;

function startGame(level, snakeT, foodT) {
    if (gameStatus !== "ready" && gameStatus !== "paused") {
        return;
    }
    if (gameLoop !== null) {
        return;
    }
    gameStatus = "playing";
    directionChanged = false;
    renderer.render(snakeT, foodT, level, gameStatus);
    gameLoop = setInterval(() => { play(level, snakeT, foodT); }, speed);
}

function play(level, snakeT, foodT) {
    if (gameStatus !== "playing") {
        return;
    }
    const status = level.update(snakeT, foodT);
    gameStatus = status;
    directionChanged = false;
    renderer.render(snakeT, foodT, level, gameStatus);
    console.log("Status:", gameStatus);
    console.log("Snake head:", snakeT.body[0]);
    if (status === "win" || status === "gameover") {
        stopGameLoop();
        setTimeout(() => {
            if (gameStatus !== status || currentLevel !== level) {
                return;
            }
            if (status === "win") {
                alert("YOU WIN");
            } else {
                alert("GAME OVER");
            }
        }, 50);
        }
}

function pauseGame() {
    if (gameStatus !== "playing") {
        return;
    }
    stopGameLoop();
    gameStatus = "paused";
    renderer.render(snakeT, foodT, currentLevel, gameStatus);
    console.log("Game Paused");
}

function resumeGame(currentLevel, snakeT, foodT) {
    if (gameStatus !== "paused") {
        return;
    }
    startGame(currentLevel, snakeT, foodT);
    console.log("Game Resumed");
}

function restartGame() {
    const settings = getGameSettings();
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
        default:
            throw new Error("Level này chưa được hỗ trợ");
    }
    snakeT.reset(settings.length);
    foodT.spawn(snakeT.body);
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
            button.classList.toggle(
                "active",
                buttonLevel === selectedLevel
            );
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
            if (selectedLevel !== 1 && selectedLevel !== 2) {
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

        const oldDirection = snakeT.direction;
        snakeT.setDirection(newDirection);
        if (snakeT.nextDirection !== oldDirection) {
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
