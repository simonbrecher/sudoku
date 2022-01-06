class Sudoku implements ISudoku {
    public readonly size: number;
    public readonly isRectangular: boolean;
    public readonly rectangleWidth: number | null;
    public readonly rectangleHeight: number | null;
    public readonly isDiagonal: boolean;
    public readonly isVX: boolean;
    public readonly vxSum: [number, string][] | null;
    public readonly isKropki: boolean;
    public readonly isMinusOne: boolean;
    public readonly isInequality: boolean;
    public readonly isABC: boolean;
    public readonly abcNumber: number | null;
    public readonly abcSpaceNumber: number | null;
    public readonly isKingMove: boolean;
    public readonly isKnightMove: boolean;

    private _solution: number[][];
    private _task: number[][]; // sudoku - [y][x]; abc - line first, line last, column first, column last
    private _board: number[][];

    public isFinished: boolean = false;
    public hasSolution: boolean = false;

    public get solution(): number[][] {
        return Utils.deepcopyArray2d(this._solution);
    }

    public set solution(solution: number[][]) {
        this._solution = solution;
    }

    public get task(): number[][] {
        return Utils.deepcopyArray2d(this._task);
    }

    public set task(task: number[][]) {
        this._task = task;
    }

    public get board(): number[][] {
        return Utils.deepcopyArray2d(this._board);
    }

    public set board(board: number[][]) {
        this._board = board;
    }

    public getVxSumName(sum: number): string | null {
        if (! this.isVX || this.vxSum === null) {
            return null;
        }
        for (let i = 0; i < this.vxSum.length; i++) {
            if (this.vxSum[i][0] === sum) {
                return this.vxSum[i][1];
            }
        }
        return null;
    }

    public getVxSumValues(): number[] {
        if (! this.isVX || this.vxSum === null) {
            return [];
        }
        let arr = [];
        for (let i = 0; i < this.vxSum.length; i++) {
            arr.push(this.vxSum[i][0]);
        }
        return arr;
    }

    constructor(
        size: number,
        isRectangular: boolean,
        rectangleWidth: number | null,
        rectangleHeight: number | null,
        isDiagonal: boolean,
        isVX: boolean,
        vxSum: [number, string][] | null,
        isKropki: boolean,
        isMinusOne: boolean,
        isInequality: boolean,
        isABC: boolean,
        abcNumber: number | null,
        isKingMove: boolean,
        isKnightMove: boolean,
    ) {
        this.isRectangular = isRectangular;

        if (isRectangular) {
            if (rectangleWidth === null || rectangleHeight === null) {
                throw "IS_RECTANGULAR === true and (RECTANGLE_WIDTH === null or RECTANGLE_HEIGHT === null)";
            } else {
                this.size = rectangleWidth * rectangleHeight;
                this.rectangleWidth = rectangleWidth;
                this.rectangleHeight = rectangleHeight;
            }
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

        this.isKropki = isKropki;
        this.isMinusOne = isMinusOne;
        this.isInequality = isInequality;

        if (isABC && abcNumber !== null) {
            this.isABC = true;
            this.abcNumber = abcNumber;
            this.abcSpaceNumber = size - abcNumber;
        } else {
            this.isABC = false;
            this.abcNumber = null;
            this.abcSpaceNumber = null;
        }

        this.isKingMove = isKingMove;
        this.isKnightMove = isKnightMove;

        this._solution = Utils.createEmptyBoard(this);
        this._task = Utils.createEmptyBoard(this);
        this._board = Utils.createEmptyBoard(this, true);
    }
}