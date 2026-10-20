import { DIRECTIONS } from "./Config.js";
import { Snake } from "./Core/Snake.js";
import { Food } from "./Core/Food.js";
import { Level1 } from "./Levels/Level1.js";
import { Renderer } from "./UI/Renderer.js";

const snakeT = new Snake();
const foodT = new Food();
const level1T = new Level1();
const renderer = new Renderer();

let gameStatus = "ready";
let gameLoop = null;
let speed = 200;
let directionChanged = false;

snakeT.reset();
foodT.spawn(snakeT.body);
renderer.render(snakeT, foodT, level1T, gameStatus);

function startGame(level1, snake, food) {
    if (gameStatus !== "ready" && gameStatus !== "paused") {
        return;
    }
    if (gameLoop !== null) {
        return;
    }
    gameStatus = "playing";
    directionChanged = false;
    renderer.render(snake, food, level1, gameStatus);
    gameLoop = setInterval(() => {play(level1, snake, food);}, speed);
}

function play(level1, snake, food) {
    if (gameStatus !== "playing") {
        return;
    }
    const status = level1.update(snake, food);
    gameStatus = status;
    directionChanged = false;
    renderer.render(snake, food, level1, gameStatus);
    console.log("Status:", gameStatus);
    console.log("Snake head:", snake.body[0]);
    if (status === "win" || status === "gameover") {
        stopGameLoop();
        console.log(status === "win" ? "YOU WIN!" : "GAME OVER!");
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

function resumeGame(level1, snake, food) {
    if (gameStatus !== "paused") {
        return;
    }
    startGame(level1, snake, food);
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

document.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;
    if (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT" || activeElement.tagName === "TEXTAREA") {
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
    if (gameStatus !== "playing") {
        return;
    }
    const keyMap = {
        ArrowUp: DIRECTIONS.UP,
        ArrowDown: DIRECTIONS.DOWN,
        ArrowLeft: DIRECTIONS.LEFT,
        ArrowRight: DIRECTIONS.RIGHT
    };
    const newDirection = keyMap[event.key];
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

document.getElementById("start-btn")
    .addEventListener("click", () => {
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

document.getElementById("pause-btn")
    .addEventListener("click", () => {
        if (gameStatus === "playing") {
            pauseGame();
        } else if (gameStatus === "paused") {
            resumeGame(level1T, snakeT, foodT);
        }
    });

document.getElementById("restart-btn")
    .addEventListener("click", () => {
        try {
            restartGame();
        } catch (error) {
            alert(error.message);
        }
    });

function getGameSettings() {
    const level = Number(document.getElementById("level-select").value);
    const length = Number(document.getElementById("snake-length").value);
    const selectedSpeed = Number(document.getElementById("game-speed").value);
    if (!Number.isInteger(length) || length < 3 || length > 10) {
        throw new Error("Snake length must be between 3 and 10");
    }
    if (!Number.isInteger(selectedSpeed) ||
        selectedSpeed < 50 || selectedSpeed > 300) {
        throw new Error("Speed must be between 50 and 300ms");
    }
    return {level, length, speed: selectedSpeed};
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