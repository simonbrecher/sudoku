class Stars implements IStars {
    public readonly size: number;
    public readonly startCount: number;
    public task: number[][];
    public board: number[][];
    public solution: number[][];

    constructor(size: number, starCount: number) {
        this.size = size;
        this.startCount = starCount;

        this.task = this.getTask();
        this.board = Utils.createArray2d(this.size, this.size, 3);
        this.solution = StarsSolver.solve(this.board, this);
    }

    private getTask(): number[][] {
        let maxScore = -1;
        let maxBoard = null;
        for (let i = 0; i < 10; i++) {
            let board = GroupGenerator.buildMinMax(this.size, this.size, this.size, Math.floor(this.size / 2), Math.floor(this.size * 3 / 2));
            let score = 0;
            for (let y = 0; y < this.size - 1; y++) {
                for (let x = 0; x < this.size - 1; x++) {
                    if (board[y][x] === board[y][x + 1] && board[y][x] === board[y + 1][x] && board[y][x] === board[y + 1][x + 1]) {
                        score ++;
                    }
                }
            }
            if (score > maxScore) {
                maxScore = score;
                maxBoard = board;
            }
        }

        // @ts-ignore
        return maxBoard;
    }

    public render(board: number[][], showStars: boolean): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("stars-table");

        for (let y = 0; y < this.size; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < this.size; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                if (showStars) {
                    if (board[y][x] === 2) {
                        squareDiv.textContent += "☆";
                    } else if (board[y][x] === 3) {
                        squareDiv.textContent += "?";
                    } else if (board[y][x] === 0) {
                        squareDiv.textContent += "!";
                    }
                }

                if (x !== 0) {
                    if (this.task[y][x] !== this.task[y][x - 1]) {
                        column.classList.add("border-left");
                    }
                } else {
                    column.classList.add("border-left");
                }
                if (x !== this.size - 1) {
                    if (this.task[y][x] !== this.task[y][x + 1]) {
                        column.classList.add("border-right");
                    }
                } else {
                    column.classList.add("border-right");
                }
                if (y !== 0) {
                    if (this.task[y][x] !== this.task[y - 1][x]) {
                        column.classList.add("border-top");
                    }
                } else {
                    column.classList.add("border-top");
                }
                if (y !== this.size - 1) {
                    if (this.task[y][x] !== this.task[y + 1][x]) {
                        column.classList.add("border-bottom");
                    }
                } else {
                    column.classList.add("border-bottom");
                }
            }
        }
    }
}