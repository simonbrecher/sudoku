/**
 * Instances of this class are used to store data for sudoku puzzle. (Both settings and values of squares in solution/task/empty.)
 *
 * Size of sudoku is said as (rectangleWidth x rectangleHeight). Classical sudoku is 3x3. (sudoku.size = 9)
 *
 * Square = the small thing with one number ; rectangle = area with bold border, where each of the numbers is exactly once
 *
 * Binary representation of square: int32
 *      While sudoku is being solved, it is saved, which numbers can be on a square.
 *      Solver uses this and determines when numbers can not be there.
 *      The lowest number in sudoku is on the LB.
 *      1 = this number can be on this square
 *      0 = this number can not be on this square
 *
 *      0b111111111 = all numbers from 1 to 9 can be on this square (empty square in sudoku 3x3)
 *      0b001000000 = only number 7 can be on this square (could be given digits or we solved this square)
 *      0b001010000 = on this square is 5 or 7.
 *      0b000000000 = error (sudoku is not solvable)
 */
class Sudoku implements ISudoku {
    // width and height of puzzle (and for not-abc also number of possible values in square and length of binary representation of square)
    public readonly size: number;
    // true = all numbers in each rectangle must be different (rectangles are 3x3 for classical sudoku)
    public readonly isRectangular: boolean;
    // x size of rectangle (also number of rectangles in y direction)
    public readonly rectangleWidth: number | null;
    // y size of rectangle (also number of rectangles in x direction)
    public readonly rectangleHeight: number | null;
    // true = all numbers in each of 2 diagonals must be different
    public readonly isDiagonal: boolean;
    // vx variant
    public readonly isVX: boolean;
    // sums and their character, they have between them in vx sudoku (default setting is [[5, "V"], [10, "X"])
    public readonly vxSum: [number, string][] | null;
    // kropki variant
    public readonly isKropki: boolean;
    // Easy as abc
    public readonly isABC: boolean;
    // number of letters in "Easy as abc"
    public readonly abcCount: number | null;
    // number of spaces in "Easy as abc" (is calculated from sudoku.size and sudoku.abcNumber)
    public readonly abcSpaceCount: number | null;

    /**
     * 2d array of binary representations of all squares of sudoku. [y][x]
     *
     * Binary representation of square: int32
     *      While sudoku is being solved, it is saved, which numbers can be on a square.
     *      Solver uses this and determines when numbers can not be there.
     *      The lowest number in sudoku is on the LB.
     *      1 = this number can be on this square
     *      0 = this number can not be on this square
     *
     *      0b111111111 = all numbers from 1 to 9 can be on this square (empty square in sudoku 3x3)
     *      0b001000000 = only number 7 can be on this square (could be given digits or we solved this square)
     *      0b001010000 = on this square is 5 or 7.
     *      0b000000000 = error
     *
     *      Yes, it means, we can not have sudoku 6x6, because binary operations work on 32 bits.
     */
    private _solution: number[][];
    /**
     * For sudoku:
     *      2d array of binary representations of squares.
     *      Dimensions: size , size
     *
     * For abc:
     *      first dimension is direction: 0 = first in line, 1 = last in line, 2 = first in column, 3 = last in column
     *      Dimensions: 4, size
     *      (
     *      btw. abc can not have any given digits other than on side, because this variable is used for something else
     *      this feature was removed in main branch, there "easy as abc" and similar puzzles have variable sudoku.sideTask
     *      )
     */
    private _task: number[][];
    // binary representation of squares, which can have all numbers at all places
    private _board: number[][];

    // true iff it have left sudokuBuilder. This variable is not used for anything
    public isFinished: boolean = false;
    /**
     * true iff sudoku already has solution
     * Used while differentiating between (mainly by Solver.solve()) while creating solution and while creating task.
     *
     * For kropki:
     *      While creating solution, the Solver.solve() is used quite often. It needs to work same way as regular sudoku (because solution is same)
     *      Kropki by default has no given digits and task is not required to have single solution (by usually has),
     *          so Solver.solve() always returns sudoku.solution variable (so it is considered solvable)
     *
     * For abc:
     *      While creating solution, the Solver.solve() is used quite often. It needs to work same way as regular sudoku
     *          Because the solution of abc is created by merging multiple numbers from sudoku solution into spaces (there are multiple spaces in row/column)
     *      While creating task, the Sover.solve() needs to solve the board by rules of abc (not sudoku anymore)
     */
    public hasSolution: boolean = false;

    // For deepcopy when get
    public get solution(): number[][] {
        return Utils.deepcopyBoard(this._solution);
    }

    public set solution(solution: number[][]) {
        this._solution = solution;
    }

    // For deepcopy when get
    public get task(): number[][] {
        return Utils.deepcopyBoard(this._task);
    }

    public set task(task: number[][]) {
        this._task = task;
    }

    // For deepcopy when get
    public get board(): number[][] {
        return Utils.deepcopyBoard(this._board);
    }

    public set board(board: number[][]) {
        this._board = board;
    }

    /**
     * Returns defining string for sum of two squares in VX sudoku.
     * Default settings: 5 -> "V", 10 -> "X", other -> null
     * @param sum       sum of values of two squares (you can convert binary representation of square to value by Utils.binaryToValue())
     * @return          5 -> "V", 10 -> "X", other -> null
     */
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

    /**
     * Used by VX sudoku to return list of all sums.
     * In default settings VX sudoku, all pairs of orthogonally adjacent squares with sum of 5 or 10 have "V" or "X" between them.
     * @return      in default VX sudoku [5, 10]
     */
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
        isABC: boolean,
        abcNumber: number | null,
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

        if (isABC && abcNumber !== null) {
            this.isABC = true;
            this.abcCount = abcNumber;
            this.abcSpaceCount = size - abcNumber;
        } else {
            this.isABC = false;
            this.abcCount = null;
            this.abcSpaceCount = null;
        }

        this._solution = Utils.createEmptyBoard(this);
        this._task = Utils.createEmptyBoard(this);
        this._board = Utils.createEmptyBoard(this, true);
    }
}