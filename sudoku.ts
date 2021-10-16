class Sudoku implements ISudoku {
    public readonly size: number;
    public readonly isRectangular: boolean;
    public readonly rectangleWidth: number | null;
    public readonly rectangleHeight: number | null;
    public readonly isDiagonal: boolean;
    public readonly isVX: boolean;
    public readonly vxSum: [number, string][] | null;

    private readonly _solution: IBoard;
    private readonly _task: IBoard;
    private readonly _board: IBoard;

    public get solution(): IBoard {
        return this._solution;
    }

    public set solution(solution: IBoard) {
        this._solution.board = solution.board;
    }

    public get task(): IBoard {
        return this._task;
    }

    public set task(task: IBoard) {
        this._task.board = task.board;
    }

    public get board(): IBoard {
        return this._board;
    }

    public set board(board: IBoard) {
        this._board.board = board.board;
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

        this._solution = new Board(this, size, size, size);
        this._task = new Board(this, size, size, size);
        this._board = new Board(this, size, size, size);
    }
}