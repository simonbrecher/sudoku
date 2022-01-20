class Sudoku implements ISudoku {
    public readonly size: number;
    public readonly isRectangular: boolean;
    public readonly rectangleWidth: number | null;
    public readonly rectangleHeight: number | null;
    public readonly isIrregular: boolean;
    public irregularGroups: number[][][] | null;
    public readonly isDiagonal: boolean;
    public readonly isVX: boolean;
    public readonly vxSum: [number, string][] | null;
    public readonly isKropki: boolean;
    public readonly isMinusOne: boolean;
    public readonly isInequality: boolean;
    public readonly isKiller: boolean;
    public killerGroups: number[][][] | null;
    public killerSums: number[] | null;
    public readonly isABC: boolean;
    public readonly abcNumber: number | null;
    public readonly abcSpaceNumber: number | null;
    public readonly isSkyscraper: boolean;
    public readonly isKingMove: boolean;
    public readonly isKnightMove: boolean;

    private _solution: number[][];
    private _task: number[][]; // sudoku - [y][x]; abc - row first, row last, column first, column last
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

    private getKillerSums(): number[] {
        let sums = [];
        // @ts-ignore
        for (let i = 0; i < this.killerGroups.length; i++) {
            let sum = 0;
            // @ts-ignore
            for (let j = 0; j < this.killerGroups[i].length; j++) {
                // @ts-ignore
                let position = this.killerGroups[i][j];
                sum += Utils.binaryToValue(this._solution[position[1]][position[0]]);
            }
            sums.push(sum);
        }

        return sums;
    }

    public setKillerSums(): void {
        this.killerSums = this.getKillerSums();
    }

    public refreshIrregularGroups(): void {
        let groupSizes = [];
        for (let i = 0; i < this.size; i++) {
            groupSizes.push(this.size);
        }
        this.irregularGroups = GroupGenerator.boardToGroups(GroupGenerator.build(this.size, this.size, groupSizes), this.size, this.size);
    }

    public refreshKillerGroups(groupSizes: number[]): void {
        this.killerGroups = GroupGenerator.boardToGroups(GroupGenerator.build(this.size, this.size, groupSizes), this.size, this.size);
    }

    constructor(
        size: number,
        isRectangular: boolean,
        isIrregular: boolean,
        rectangleWidth: number | null,
        rectangleHeight: number | null,
        isDiagonal: boolean,
        isVX: boolean,
        vxSum: [number, string][] | null,
        isKropki: boolean,
        isMinusOne: boolean,
        isInequality: boolean,
        isKiller: boolean,
        killerGroupSizes: number[] | null,
        isABC: boolean,
        abcNumber: number | null,
        isSkyscraper: boolean,
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

        this.isIrregular = isIrregular;

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

        this.isSkyscraper = isSkyscraper;

        this.isKingMove = isKingMove;
        this.isKnightMove = isKnightMove;

        if (this.isIrregular) {
            let groupSizes = [];
            for (let i = 0; i < this.size; i++) {
                groupSizes.push(this.size);
            }
            this.irregularGroups = GroupGenerator.boardToGroups(GroupGenerator.build(this.size, this.size, groupSizes), this.size, this.size);
        } else {
            this.irregularGroups = null;
        }

        this._solution = Utils.createEmptyBoard(this);

        if (isKiller && killerGroupSizes !== null) {
            this.isKiller = true;
            this.killerGroups = GroupGenerator.boardToGroups(GroupGenerator.build(this.size, this.size, killerGroupSizes), this.size, this.size);
            this.killerSums = null;
        } else {
            this.isKiller = false;
            this.killerGroups = null;
            this.killerSums = null;
        }

        this._task = Utils.createEmptyBoard(this);
        this._board = Utils.createEmptyBoard(this, true);
    }
}