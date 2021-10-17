class Sudoku implements ISudoku {
    public readonly size: number;
    public readonly isRectangular: boolean;
    public readonly rectangleWidth: number | null;
    public readonly rectangleHeight: number | null;
    public readonly isDiagonal: boolean;
    public readonly isVX: boolean;
    public readonly vxSum: [number, string][] | null;

    private _solution: number[][];
    private _task: number[][];
    private _board: number[][];

    public get solution(): number[][] {
        return this.copyBoard(this._solution);
    }

    public set solution(solution: number[][]) {
        this._solution = solution;
    }

    public get task(): number[][] {
        return this.copyBoard(this._task);
    }

    public set task(task: number[][]) {
        this._task = task;
    }

    public get board(): number[][] {
        return this.copyBoard(this._board);
    }

    public set board(board: number[][]) {
        this._board = board;
    }

    constructor(
        size: number,
        isRectangular: boolean,
        rectangleWidth: number | null,
        rectangleHeight: number | null,
        isDiagonal: boolean,
        isVX: boolean,
        vxSum: [number, string][] | null,
    ) {
        this.isRectangular = isRectangular;

        if (isRectangular) {
            if (rectangleWidth === null || rectangleHeight === null) {
                throw "IS_RECTANGULAR === true and (RECTANGLE_WIDTH === null or RECTANGLE_HEIGHT === null)"
            } else {
                this.size = rectangleWidth * rectangleHeight;
                this.rectangleWidth = rectangleWidth;
                this.rectangleHeight = rectangleHeight;
            };
        } else {
            this.size = size;
            this.rectangleWidth = null;
            this.rectangleHeight = null;
        }

        this.isDiagonal = isDiagonal;

        this.isVX = isVX;

        if (isVX) {
            if (vxSum === null) {
                throw "IS_VX === true and VX_SUM === null"
            } else {
                this.vxSum = vxSum;
            }
        } else {
            this.vxSum = null;
        }

        this._solution = this.createEmptyBoard();
        this._task = this.createEmptyBoard();
        this._board = this.createEmptyBoard();
    }

    private createEmptyBoard(): number[][] {
        let board = [];
        for (let y = 0; y < this.size; y++) {
            let row = [];
            for (let x = 0; x < this.size; x++) {
                row.push((1 << this.size) - 1);
            }
            board.push(row);
        }
        return board;
    }

    private copyBoard(board: number[][]): number[][] {
        let copied = [];
        for (let y = 0; y < this.size; y++) {
            let row = [];
            for (let x = 0; x < this.size; x++) {
                row.push(board[y][x]);
            }
            copied.push(row);
        }
        return copied;
    }
}