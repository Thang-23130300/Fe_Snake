import { BOARD_CONFIG } from "../Config.js";

export class Renderer {
    constructor() {
        this.board = document.getElementById("game-board");
        this.score = document.getElementById("score");
        this.status = document.getElementById("status");

        this.cells = [];

        this.createBoard();
    }

    createBoard() {
        this.board.style.gridTemplateColumns =
            `repeat(${BOARD_CONFIG.WIDTH}, 25px)`;

        this.board.style.gridTemplateRows =
            `repeat(${BOARD_CONFIG.HEIGHT}, 25px)`;

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

    render(snake, food, level, gameStatus) {
        this.clearBoard();

        this.renderFood(food);
        this.renderSnake(snake);

        this.score.textContent =
            `Food: ${level.countFood} / ${level.targetFood}`;

        this.status.textContent = gameStatus;
    }

    clearBoard() {
        for (const cell of this.cells) {
            cell.className = "cell";
        }
    }

    renderSnake(snake) {
        snake.body.forEach((segment, index) => {
            const cell = this.getCell(segment.x, segment.y);

            if (!cell) return;

            cell.classList.add("snake");

            if (index === 0) {
                cell.classList.add("snake-head");
            }
        });
    }

    renderFood(food) {
        if (!food.position) return;

        const { x, y } = food.position;

        const cell = this.getCell(x, y);

        if (cell) {
            cell.classList.add("food");
        }
    }
}