class Sudoku implements ISudoku {
    public readonly size: number;
    public readonly isRectangular: boolean;
    public readonly rectangleWidth: number | null;
    public readonly rectangleHeight: number | null;
    public readonly isIrregular: boolean;
    public irregularGroups: number[][][] | null;
    public readonly isDiagonal: boolean;
    public readonly isLetters: boolean;
    public letters: string[];
    public readonly isVX: boolean;
    public readonly vxSum: [number, string][] | null;
    public readonly isKropki: boolean;
    public readonly isMinusOne: boolean;
    public readonly isMinusOneDirection: boolean;
    public readonly isInequality: boolean;
    public readonly isKiller: boolean;
    public readonly isKillerUnchained: boolean;
    public killerGroups: number[][][] | null;
    public killerSums: number[] | null;
    public killerUnchainedGroups: number[][] | null; // x, y, sum
    public killerUnchainedBoard: number[][][] | null;
    public killerUnchainedIsKnown: boolean[] | null;
    public readonly isRoman: boolean;
    public readonly isSlovak: boolean;
    public readonly isABC: boolean;
    public readonly valueNumber: number | null;
    public readonly spaceNumber: number | null;
    public readonly isSkyscraper: boolean;
    public readonly isKingMove: boolean;
    public readonly isKnightMove: boolean;

    public solution: number[][];
    public task: number[][]; // [y][x]
    public board: number[][];

    public sideTask: number[][] | null; // abc / skyscraper - [row first, row last, column first, column last][position] ; empty -> 0
    public orthogonalTask: (number | null)[][][] | null; // roman intersection - [y][x][right, bottom]
    public extraTask: (number[] | null)[][] | null; // slovak sums - [y][x][sum, amount]

    public isFinished: boolean = false;
    public hasSolution: boolean = false;

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

    public getRomanIntersectionName(intersection: number): string {
        return ["0", "I", "II", "III", "V", "VI", "VII", "VIII", "X", "XI"][intersection];
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
                sum += Utils.binaryToShift(this.solution[position[1]][position[0]]) + 1;
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

    private getKillerUnchainedGroups(): number[][] {
        // @ts-ignore
        let killerBoard = GroupGenerator.groupsToBoard(this.killerGroups, this.size, this.size);
        // @ts-ignore
        let killerAlreadyAdded = Utils.createArray1d(this.killerGroups.length, false);
        // @ts-ignore
        let killerUnchainedGroups = Utils.createArray1d(this.killerGroups.length, null);
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (! killerAlreadyAdded[killerBoard[y][x]]) {
                    killerAlreadyAdded[killerBoard[y][x]] = true;
                    killerUnchainedGroups[killerBoard[y][x]] = [x, y];
                }
            }
        }

        return killerUnchainedGroups;
    }

    public refreshKillerGroups(groupSizes: number[]): void {
        this.killerGroups = GroupGenerator.boardToGroups(GroupGenerator.build(this.size, this.size, groupSizes), this.size, this.size);
        if (this.isKillerUnchained) {
            this.killerUnchainedGroups = this.getKillerUnchainedGroups();
        }
    }

    public refreshKillerUnchainedOnStartSolve(): void {
        // @ts-ignore
        let groupNumber = this.killerGroups.length;

        this.killerUnchainedBoard = Utils.createArray2d(this.size, this.size, null);
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.killerUnchainedBoard[y][x] = Utils.getFullBitArray(groupNumber);
            }
        }
        // @ts-ignore
        this.killerUnchainedIsKnown = Utils.createArray1d(this.killerGroups.length, false);
    }

    private getAbcSideTask(): number[][] {
        let sideTask = [];
        for (let dir = 0; dir < 4; dir++) {
            let directionTask = [];
            for (let position = 0; position < this.size; position++) {
                let startX, startY, moveX, moveY;
                [[startX, startY], [moveX, moveY]] = Solver.getSideDirection(dir, position, this);

                let first = 1;
                for (let i = 0; i < this.size; i++) {
                    let square = this.solution[startY + i * moveY][startX + i * moveX];
                    if (square !== 1) {
                        first = square;
                        break;
                    }
                }
                directionTask.push(first);
            }
            sideTask.push(directionTask);
        }

        return sideTask;
    }

    private getSkyscraperSideTask(): number[][] {
        let sideTask = [];
        for (let dir = 0; dir < 4; dir++) {
            let directionTask = [];
            for (let position = 0; position < this.size; position++) {
                let startX, startY, moveX, moveY;
                [[startX, startY], [moveX, moveY]] = Solver.getSideDirection(dir, position, this);

                let visibleCount = 0;
                let lastVisible = 0;
                for (let i = 0; i < this.size; i++) {
                    let square = this.solution[startY + i * moveY][startX + i * moveX];
                    if (square > lastVisible) {
                        visibleCount ++;
                        lastVisible = square;
                    }
                }
                directionTask.push(visibleCount);
            }
            sideTask.push(directionTask);
        }

        return sideTask;
    }

    public getSolutionValues() {
        let solutionValues = [];
        for (let y = 0; y < this.size; y++) {
            let row = [];
            for (let x = 0; x < this.size; x++) {
                row.push(Utils.binaryToShift(this.solution[y][x]) + 1);
            }
            solutionValues.push(row);
        }
        return solutionValues;
    }

    public hasPrompterInVxSum(): boolean {
        let solutionValues = this.getSolutionValues();
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (Utils.countBits32(this.task[y][x]) === 1) {
                    if (x !== 0) {
                        if (this.getVxSumName(solutionValues[y][x] + solutionValues[y][x - 1]) !== null) {
                            return true;
                        }
                    }
                    if (x !== this.size - 1) {
                        if (this.getVxSumName(solutionValues[y][x] + solutionValues[y][x + 1]) !== null) {
                            return true;
                        }
                    }
                    if (y !== 0) {
                        if (this.getVxSumName(solutionValues[y][x] + solutionValues[y - 1][x]) !== null) {
                            return true;
                        }
                    }
                    if (y !== this.size - 1) {
                        if (this.getVxSumName(solutionValues[y][x] + solutionValues[y + 1][x]) !== null) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    // input binary, output value (XVII (number of bits for count of letter))
    public getRomanIntersection(binary1: number, binary2: number): number {
        let value1 = Utils.binaryToShift(binary1) + 1;
        let value2 = Utils.binaryToShift(binary2) + 1;
        return (value1 >> 2 & value2 >> 2) << 2 | Math.min(value1 & 3, value2 & 3);
    }

    private getRomanOrthogonalTask(): (number | null)[][][] {
        let orthogonalTask = Utils.createArray3d(this.size, this.size, 2, null);
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (x !== this.size - 1) {
                    orthogonalTask[y][x][0] = this.getRomanIntersection(this.solution[y][x], this.solution[y][x + 1]);
                }
                if (y !== this.size - 1) {
                    orthogonalTask[y][x][1] = this.getRomanIntersection(this.solution[y][x], this.solution[y + 1][x]);
                }
            }
        }

        return orthogonalTask;
    }

    private getSlovakExtraTask(): (number[] | null)[][] {
        let extraTask = Utils.createArray2d(this.size, this.size, null);
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.solution[y][x] === 1) {
                    let sum = 0;
                    let amount = 0;
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        for (let dirX = -1; dirX <= 1; dirX++) {
                            if ((dirX !== 0) !== (dirY !== 0)) {
                                let newX = x + dirX;
                                let newY = y + dirY;
                                let binary = 1;
                                if (newX >= 0 && newX < this.size && newY >= 0 && newY < this.size) {
                                    binary = this.solution[newY][newX];
                                }
                                if (binary !== 1) {
                                    sum += Utils.binaryToShift(binary);
                                    amount ++;
                                }
                            }
                        }
                    }
                    extraTask[y][x] = [sum, amount];
                }
            }
        }

        return extraTask;
    }

    public solutionAdded(): void {
        this.hasSolution = true;

        if (this.isABC && this.valueNumber !== null) {
            this.sideTask = this.getAbcSideTask();
            this.board = Utils.createArray2d(this.size, this.size, (1 << this.valueNumber + 1) - 1);
            this.task = Utils.createArray2d(this.size, this.size, (1 << this.valueNumber + 1) - 1);
        } else if (this.isSkyscraper) {
            this.sideTask = this.getSkyscraperSideTask();
        } else if (this.isRoman) {
            this.orthogonalTask = this.getRomanOrthogonalTask();
        } else if (this.isSlovak) {
            this.extraTask = this.getSlovakExtraTask();
        }
    }

    public hasTaskAllValues(task: number[][]): boolean {
        let total = 0;
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (Utils.countBits32(task[y][x]) === 1) {
                    total |= task[y][x];
                }
            }
        }

        return Utils.countBits32(total) === this.size;
    }

    constructor(
        size: number,
        isRectangular: boolean,
        isIrregular: boolean,
        rectangleWidth: number | null,
        rectangleHeight: number | null,
        isDiagonal: boolean,
        isLetters: boolean,
        letters: string[],
        isVX: boolean,
        vxSum: [number, string][] | null,
        isKropki: boolean,
        isMinusOne: boolean,
        isMinusOneDirection: boolean,
        isInequality: boolean,
        isKiller: boolean,
        isKillerUnchained: boolean,
        killerGroupSizes: number[] | null,
        isRoman: boolean,
        isSlovak: boolean,
        isABC: boolean,
        valueNumber: number | null,
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

        this.isLetters = isLetters;
        this.letters = Utils.shuffle(letters);

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
        this.isMinusOneDirection = isMinusOneDirection;
        this.isInequality = isInequality;

        this.isRoman = isRoman;

        this.valueNumber = null;
        this.spaceNumber = null;

        if (isSlovak && valueNumber !== null) {
            this.isSlovak = true;
            this.valueNumber = valueNumber;
            this.spaceNumber = size - valueNumber;
        } else {
            this.isSlovak = false;
        }

        if (isABC && valueNumber !== null) {
            this.isABC = true;
            this.valueNumber = valueNumber;
            this.spaceNumber = size - valueNumber;
        } else {
            this.isABC = false;
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

        this.solution = Utils.createEmptyBoard(this);

        if (isKiller && killerGroupSizes !== null) {
            this.isKiller = true;
            this.isKillerUnchained = false;
            this.killerGroups = GroupGenerator.boardToGroups(GroupGenerator.build(this.size, this.size, killerGroupSizes), this.size, this.size);
            this.killerUnchainedGroups = null;
            this.killerSums = null;
        } else if (isKillerUnchained && killerGroupSizes !== null) {
            this.isKillerUnchained = true;
            this.isKiller = false;
            this.killerGroups = GroupGenerator.boardToGroups(GroupGenerator.build(this.size, this.size, killerGroupSizes), this.size, this.size);
            this.killerUnchainedGroups = this.getKillerUnchainedGroups();
            this.killerSums = null;
        } else {
            this.killerUnchainedGroups = null;
            this.isKiller = false;
            this.isKillerUnchained = false;
            this.killerGroups = null;
            this.killerSums = null;
        }

        this.killerUnchainedBoard = null;
        this.killerUnchainedIsKnown = null;

        this.task = Utils.createEmptyBoard(this);
        this.board = Utils.createEmptyBoard(this, true);

        this.sideTask = null;
        this.orthogonalTask = null;
        this.extraTask = null;
    }
}