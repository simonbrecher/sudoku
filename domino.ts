class Domino implements IDomino {
    public readonly size: number;
    public readonly width: number;
    public readonly height: number;

    public readonly task: number[][];
    public readonly board: number[][][]; // [y][x][right, bottom] - joined 2, not joined 1
    public readonly solution: number[][][];

    constructor(size: number, width: number, height: number) {
        if (width * height !== size * (size + 1)) {
            throw "Domino->constructor - WRONG WIDTH AND HEIGHT";
        }

        this.size = size;
        this.width = width;
        this.height = height;

        let groupBoard = this.createGroupBoard();
        this.solution = this.createSolution(groupBoard);
        this.task = this.createTask(groupBoard);
        this.board = Utils.createArray3d(this.width, this.height, 2, 3);
    }

    private createGroupBoard(): number[][] {
        let sizes = [];
        for (let i = 0; i < Math.floor(this.size * (this.size + 1) / 2); i++) {
            sizes.push(2);
        }
        return GroupGenerator.build(this.width, this.height, sizes);
    }

    private createSolution(groupBoard: number[][]): number[][][] {
        let solution = Utils.createArray3d(this.width, this.height, 2, 0);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x !== this.width - 1) {
                    if (groupBoard[y][x] == groupBoard[y][x + 1]) {
                        solution[y][x][0] = 2;
                    } else {
                        solution[y][x][0] = 1;
                    }
                }
                if (y !== this.height - 1) {
                    if (groupBoard[y][x] == groupBoard[y + 1][x]) {
                        solution[y][x][1] = 2;
                    } else {
                        solution[y][x][1] = 1;
                    }
                }
            }
        }

        return solution;
    }

    private createTask(groupBoard: number[][]): number[][] {
        let dominos = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = i; j < this.size; j++) {
                if (Math.random() < 0.5) {
                    dominos.push([i, j]);
                } else {
                    dominos.push([j, i]);
                }
            }
        }
        dominos = Utils.shuffle(dominos);

        let task = Utils.createArray2d(this.width, this.height, -1);
        let dominoId = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x !== this.width - 1) {
                    if (groupBoard[y][x] == groupBoard[y][x + 1]) {
                        task[y][x] = dominos[dominoId][0];
                        task[y][x + 1] = dominos[dominoId][1];
                        dominoId ++;
                    }
                }
                if (y !== this.height - 1) {
                    if (groupBoard[y][x] == groupBoard[y + 1][x]) {
                        task[y][x] = dominos[dominoId][0];
                        task[y + 1][x] = dominos[dominoId][1];
                        dominoId ++;
                    }
                }
            }
        }

        return task;
    }

    public render(board: number[][][]): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        pageWrapper?.appendChild(wrapper);

        let boardTable = document.createElement("table");
        wrapper?.appendChild(boardTable);
        boardTable.classList.add("domino-table");

        for (let y = 0; y < this.height; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < this.width; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                squareDiv.textContent += this.task[y][x].toString();

                if (x === 0) {
                    column.classList.add("border-left");
                }
                if (x === this.width - 1) {
                    column.classList.add("border-right");
                }
                if (y === 0) {
                    column.classList.add("border-top");
                }
                if (y === this.height - 1) {
                    column.classList.add("border-bottom");
                }
                if (x !== 0) {
                    if (board[y][x - 1][0] === 1) {
                        column.classList.add("border-left");
                    } else if (board[y][x - 1][0] === 2) {
                        column.classList.add("border-left-none");
                    } else if (board[y][x - 1][0] === 0) {
                        column.classList.add("border-left-red");
                    }
                }
                if (x !== this.width - 1) {
                    if (board[y][x][0] === 1) {
                        column.classList.add("border-right");
                    } else if (board[y][x][0] === 2) {
                        column.classList.add("border-right-none");
                    } else if (board[y][x][0] === 0) {
                        column.classList.add("border-right-right");
                    }
                }
                if (y !== 0) {
                    if (board[y - 1][x][1] === 1) {
                        column.classList.add("border-top");
                    } else if (board[y - 1][x][1] === 2) {
                        column.classList.add("border-top-none");
                    } else if (board[y - 1][x][1] === 0) {
                        column.classList.add("border-top-red");
                    }
                }
                if (y !== this.height - 1) {
                    if (board[y][x][1] === 1) {
                        column.classList.add("border-bottom");
                    } else if (board[y][x][1] === 2) {
                        column.classList.add("border-bottom-none");
                    } else if (board[y][x][1] === 0) {
                        column.classList.add("border-bottom-red");
                    }
                }
            }
        }
    }
}