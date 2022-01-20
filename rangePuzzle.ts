class RangePuzzle implements IRange {
    public readonly width: number;
    public readonly height: number;

    public readonly isKuromasu: boolean;
    public readonly isCave: boolean;

    private readonly kuromasuBlackChance = 0.3;

    public readonly solution: number[][];
    public task: (number | null)[][];
    public readonly board: number[][];

    constructor(width: number, height: number, isKuromasu: boolean, isCave: boolean) {
        this.width = width;
        this.height = height;

        this.isKuromasu = isKuromasu;
        this.isCave = isCave;

        if (this.isKuromasu) {
            this.solution = this.createSolutionKuromasu();
        } else if (this.isCave) {
            CoralGenerator.typeCave();
            let coral = null;
            while (coral === null) {
                coral = CoralGenerator.build(width, height);
            }
            this.solution = coral;
        } else {
            throw "RangePuzzle->constructor IS NOT KUROMASU OR CAVE";
        }
        this.task = this.createTask();
        this.board = Utils.createArray2d(width, height, 3);
    }

    public checkSolutionOrthogonal(solution: number[][]): boolean {
        let already = Utils.createArray2d(this.width, this.height, false);
        let orthogonalCount = 0;
        for (let startY = 0; startY < this.height; startY++) {
            for (let startX = 0; startX < this.width; startX++) {
                if ((solution[startY][startX] & 1) !== 0 && ! already[startY][startX]) {
                    orthogonalCount ++;

                    let deck = [[startX, startY]];
                    while (deck.length > 0) {
                        let removed = deck.pop();
                        // @ts-ignore
                        let removedX = removed[0];
                        // @ts-ignore
                        let removedY = removed[1];
                        if (! already[removedY][removedX]) {
                            already[removedY][removedX] = true;
                            for (let dirY = -1; dirY <= 1; dirY++) {
                                for (let dirX = -1; dirX <= 1; dirX++) {
                                    if ((dirX === 0) !== (dirY === 0)) {
                                        let newX = removedX + dirX;
                                        let newY = removedY + dirY;
                                        if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                                            if ((solution[newY][newX] & 1) !== 0) {
                                                deck.push([newX, newY]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return orthogonalCount === 1;
    }

    private createSolutionKuromasu(): number[][] {
        let solution = Utils.createArray2d(this.width, this.height, 3);
        for (let i = 0; i < Math.ceil(this.width * this.height * this.kuromasuBlackChance); i++) {
            let x = Math.floor(Math.random() * this.width);
            let y = Math.floor(Math.random() * this.height);
            if ((solution[y][x] & 2) !== 0) {
                solution[y][x] &= 2;
                for (let dirX = -1; dirX <= 1; dirX++) {
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        if ((dirX === 0) !== (dirY === 0)) {
                            let newX = x + dirX;
                            let newY = y + dirY;
                            if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                                solution[newY][newX] &= 1;
                            }
                        }
                    }
                }
            }
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (solution[y][x] === 3) {
                    solution[y][x] = 1;
                }
            }
        }

        if (this.checkSolutionOrthogonal(solution)) {
            return solution;
        } else {
            return this.createSolutionKuromasu();
        }
    }

    public countLengthInDirection(board: number[][], isMax: boolean): number[][][] {
        let directionsLengths = [];
        let directions = [
            [0, 0, 0, 1, 1, 0, this.height, this.width],
            [this.width - 1, 0, 0, 1, -1, 0, this.height, this.width],
            [0, 0, 1, 0, 0, 1, this.width, this.height],
            [0, this.height - 1, 1, 0, 0, -1, this.width, this.height],
        ];
        for (let dir = 0; dir < 4; dir++) {
            let startX, startY, moveX1, moveY1, moveX2, moveY2, lineCount, lineLength;
            [startX, startY, moveX1, moveY1, moveX2, moveY2, lineCount, lineLength] = directions[dir];
            let directionLengths = Utils.createArray2d(this.width, this.height, 0);
            for (let i = 0; i < lineCount; i++) {
                let total = 0;
                for (let j = 0; j < lineLength; j++) {
                    let x = startX + i * moveX1 + j * moveX2;
                    let y = startY + i * moveY1 + j * moveY2;
                    if (board[y][x] === 1 || isMax && board[y][x] === 3) {
                        total++;
                    } else {
                        total = 0;
                    }
                    directionLengths[y][x] = total - 1;
                }
            }
            directionsLengths.push(directionLengths);
        }

        return directionsLengths;
    }

    private createTask(): (number | null)[][] {
        let minLength = this.countLengthInDirection(this.solution, false);

        let task = Utils.createArray2d(this.width, this.height, null);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.solution[y][x] !== 2) {
                    task[y][x] = minLength[0][y][x] + minLength[1][y][x] + minLength[2][y][x] + minLength[3][y][x] + 1;
                }
            }
        }

        return task;
    }

    public render(board: number[][], debug: boolean = false): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        pageWrapper?.appendChild(wrapper);

        let boardTable = document.createElement("table");
        wrapper?.appendChild(boardTable);
        boardTable.classList.add("range-table");

        for (let y = 0; y < this.height; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < this.width; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                if (x === 0 && y === 0) {
                    let typeDiagonal = document.createElement("div");
                    typeDiagonal.classList.add("type-diagonal");
                    column.appendChild(typeDiagonal);
                    if (this.isKuromasu) {
                        typeDiagonal.textContent += "K";
                    }
                    if (this.isCave) {
                        typeDiagonal.textContent += "C";
                    }
                }

                let prompter = this.task[y][x];
                if (prompter !== null) {
                    squareDiv.textContent = prompter.toString();
                } else if (board[y][x] === 1) {
                    // nothing
                } else if (board[y][x] === 2) {
                    squareDiv.textContent = "X";
                    squareDiv.classList.add("black");
                } else if (board[y][x] === 3 && debug) {
                    squareDiv.textContent = "?";
                    squareDiv.classList.add("orange");
                } else if (debug) {
                    squareDiv.classList.add("red");
                    squareDiv.textContent = "!";
                }
            }
        }
    }
}