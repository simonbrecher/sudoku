class Galaxy implements IGalaxy {
    public readonly width: number;
    public readonly height: number;

    public readonly centers: number[][];
    public board: number[][];
    public solution: number[][] | null;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.centers = this.createCenters();
        this.board = Utils.createArray2d(this.width, this.height, (1 << this.centers.length) - 1);

        this.solution = null;

        for (let i = 0; i < 100; i++) {
            let solution = GalaxySolver.solve(this.board, this);
            let solutionCount = GalaxySolver.countSolutions(solution, this);

            if (solutionCount === 1) {
                break;
            }

            let previous = Utils.deepcopyArray2d(this.centers);

            this.removeOverlappingCenters();
            this.addMissingCenters(solution);
            while (this.centers.length >= Math.min(Math.ceil(Math.max(this.width, this.height) * 1.5), 32)) {
                let centerId = Math.floor(Math.random() * this.centers.length);
                this.centers.splice(centerId, 1);
            }
            this.board = Utils.createArray2d(this.width, this.height, (1 << this.centers.length) - 1);

            let changed = false;
            if (previous.length !== this.centers.length) {
                changed = true;
            }
            if (! changed) {
                for (let i = 0; i < this.centers.length; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (this.centers[i][j] !== previous[i][j]) {
                            changed = true;
                        }
                    }
                }
            }
            if (! changed) {
                break;
            }
        }
    }

    private createCenters(): number[][] {
        let centers = [];
        for (let i = 0; i < Math.min(Math.max(this.width, this.height), 31); i++) {
            let offsetX = Math.floor(Math.random() * 2);
            let offsetY = Math.floor(Math.random() * 2);
            let x = Math.floor(Math.random() * (this.width - offsetX));
            let y = Math.floor(Math.random() * (this.height - offsetY));
            centers.push([x, y, offsetX, offsetY]);
        }

        return centers;
    }

    private removeOverlappingCenters(): void {
        let already = Utils.createArray2d(this.width, this.height, false);
        for (let centerId = 0; centerId < this.centers.length; centerId++) {
            let center = this.centers[centerId];
            let isOk = true;
            for (let offsetY = 0; offsetY <= center[3]; offsetY++) {
                for (let offsetX = 0; offsetX <= center[2]; offsetX++) {
                    if (already[center[1] + offsetY][center[0] + offsetX]) {
                        isOk = false;
                    }
                }
            }
            if (isOk) {
                for (let offsetY = 0; offsetY <= center[3]; offsetY++) {
                    for (let offsetX = 0; offsetX <= center[2]; offsetX++) {
                        already[center[1] + offsetY][center[0] + offsetX] = true;
                    }
                }
            } else {
                this.centers.splice(centerId, 1);
                centerId --;
            }
        }

        this.board = Utils.createArray2d(this.width, this.height, (1 << this.centers.length) - 1);
    }

    private addMissingCenters(solution: number[][]): void {
        let missing = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (solution[y][x] === 0) {
                    missing.push([x, y, 0, 0]);
                }
                if (x !== this.width - 1) {
                    if (solution[y][x] === 0 && solution[y][x + 1] === 0) {
                        missing.push([x, y, 1, 0]);
                    }
                }
                if (x !== this.width - 1 && y !== this.height - 1) {
                    if (solution[y][x] === 0 && solution[y + 1][x] === 0) {
                        missing.push([x, y, 0, 1]);
                    }
                }
                if (y !== this.height - 1) {
                    if (solution[y][x] === 0 && solution[y][x + 1] === 0 && solution[y + 1][x] === 0 && solution[y + 1][x + 1] === 0) {
                        missing.push([x, y, 1, 1]);
                    }
                }
            }
        }
        if (missing.length > 0) {
            let randomNumber = Math.floor(Math.random() * missing.length);
            this.centers.push(missing[randomNumber]);
        }

        this.board = Utils.createArray2d(this.width, this.height, (1 << this.centers.length) - 1);
    }

    public render(board: number[][] | null, showSolution: boolean): void {
        if (board === null) {
            return;
        }

        let pageWrapper = document.getElementById("page-wrapper");

        let wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        pageWrapper?.appendChild(wrapper);

        let boardTable = document.createElement("table");
        wrapper?.appendChild(boardTable);
        boardTable.classList.add("galaxy-table");

        let centers = Utils.createArray3d(this.width, this.height, 0, null);
        for (let i = 0; i < this.centers.length; i++) {
            centers[this.centers[i][1]][this.centers[i][0]].push([this.centers[i][2], this.centers[i][3]]);
        }

        for (let y = 0; y < this.height; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < this.width; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                if (board[y][x] === 0 && showSolution) {
                    squareDiv.classList.add("red");
                }
                if (Utils.countBits32(board[y][x]) === 1 && showSolution) {
                    squareDiv.classList.add("green");
                }

                for (let i = 0; i < centers[y][x].length; i++) {
                    let offsetX = centers[y][x][i][0];
                    let offsetY = centers[y][x][i][1];
                    let centerDiv = document.createElement("div");
                    centerDiv.classList.add("center");
                    if (offsetX === 1) {
                        centerDiv.classList.add("offset-x");
                    }
                    if (offsetY === 1) {
                        centerDiv.classList.add("offset-y");
                    }
                    column.appendChild(centerDiv)
                }

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
                if (showSolution) {
                    if (x !== 0) {
                        if ((board[y][x] & board[y][x - 1]) === 0) {
                            column.classList.add("border-left");
                        }
                    }
                    if (x !== this.width - 1) {
                        if ((board[y][x] & board[y][x + 1]) === 0) {
                            column.classList.add("border-right");
                        }
                    }
                    if (y !== 0) {
                        if ((board[y][x] & board[y - 1][x]) === 0) {
                            column.classList.add("border-top");
                        }
                    }
                    if (y !== this.height - 1) {
                        if ((board[y][x] & board[y + 1][x]) === 0) {
                            column.classList.add("border-bottom");
                        }
                    }
                }
            }
        }
    }
}