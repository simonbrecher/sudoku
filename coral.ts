class Coral implements ICoral {
    public readonly width: number;
    public readonly height: number;
    public readonly isSorted: boolean;

    private _task: (number[] | null)[][]; // 0 - right; 1 - down
    private _solution: number[][]; // 1 - empty, 2 - full
    private _board: number[][]; // empty board

    public get task(): (number[] | null)[][] {
        let task = [];
        for (let i = 0; i < this._task.length; i++) {
            let row = [];
            for (let j = 0; j < this._task[i].length; j++) {
                if (this._task[i][j] === null) {
                    row.push(null);
                } else {
                    let field = [];
                    // @ts-ignore
                    for (let k = 0; k < this._task[i][j].length; k++) {
                        // @ts-ignore
                        field.push(this._task[i][j][k]);
                    }
                    row.push(field);
                }
            }
            task.push(row);
        }

        return task;
    }

    public set task(task: (number[] | null)[][]) {
        this._task = task;
    }

    public get solution(): number[][] {
        return Utils.deepcopyArray2d(this._solution);
    }

    public set solution(solution: number[][]) {
        this._solution = solution;
    }

    public get board(): number[][] {
        return Utils.deepcopyArray2d(this._board);
    }

    public set board(board: number[][]) {
        this._board = board;
    }

    constructor(width: number, height: number, isSorted: boolean, solution: number[][]) {
        this.width = width;
        this.height = height;
        this.isSorted = isSorted;

        this._solution = solution;
        this._task = this.getTask(this._solution);
        this._board = this.getBoard();
    }

    private getTask(solution: number[][]): number[][][] {
        let task = [[], []];
        for (let y = 0; y < this.height; y++) {
            let add = this.getLineTask(0, y, 1, 0, this.width, solution);
            // @ts-ignore
            task[0].push(add);
        }
        for (let x = 0; x < this.width; x++) {
            let add = this.getLineTask(x, 0, 0, 1, this.height, solution);
            // @ts-ignore
            task[1].push(add);
        }

        return task;
    }

    private getBoard(): number[][] {
        let board = [];
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(3);
            }
            board.push(row);
        }

        return board;
    }

    private getLineTask(startX: number, startY: number, moveX: number, moveY: number, length: number, board: number[][]): number[] {
        let task = [];
        let partLength = 0;
        for (let i = 0; i < length; i++) {
            let x = startX + moveX * i;
            let y = startY + moveY * i;
            if (board[y][x] === 2) {
                partLength ++;
            } else if (board[y][x] === 1) {
                if (partLength !== 0) {
                    task.push(partLength);
                    partLength = 0;
                }
            } else {
                throw "Coral->getLineTask - UNKNOWN VALUE";
            }
        }
        if (partLength !== 0) {
            task.push(partLength);
        }

        if (this.isSorted) {
            return task.sort();
        }

        return task;
    }
}