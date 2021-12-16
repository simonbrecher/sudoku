class Tapa implements ITapa {
    public readonly width: number;
    public readonly height: number;

    private _task: (number[] | null)[][];
    private _solution: number[][];
    private _board: number[][];

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

    constructor(width: number, height: number, coral: number[][]) {
        this.width = width;
        this.height = height;

        this._solution = coral;
        this._board = this.getEmptyBoard();
        this._task = this.getTask(coral);
    }

    private getTask(solution: number[][]): (number[] | null)[][] {
        let directions = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

        let task = [];
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                if (solution[y][x] === 2) {
                    row.push(null);
                } else {
                    let onStart = 0;
                    let lengths = [];
                    for (let dir = 0; dir < 8; dir++) {
                        let newX = x + directions[dir][0];
                        let newY = y + directions[dir][1];

                        let addFull = false;
                        if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                            if (solution[newY][newX] === 2) {
                                addFull = true;
                            }
                        }

                        if (addFull) {
                            if (lengths.length === 0) {
                                onStart ++;
                            } else {
                                lengths[lengths.length - 1] ++;
                            }
                        } else {
                            if (lengths.length === 0) {
                                lengths.push(0);
                            } else {
                                if (lengths[lengths.length - 1] !== 0) {
                                    lengths.push(0);
                                }
                            }
                        }
                    }

                    lengths[lengths.length - 1] += onStart;

                    if (lengths.length > 1) {
                        let newLengths = [];
                        for (let i = 0; i < lengths.length; i++) {
                            if (lengths[i] !== 0) {
                                newLengths.push(lengths[i]);
                            }
                        }
                        lengths = newLengths;
                    }

                    lengths = lengths.sort();

                    row.push(lengths);
                }
            }

            task.push(row);
        }

        return task;
    }

    private getEmptyBoard(): number[][] {
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
}