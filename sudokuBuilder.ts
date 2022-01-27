class SudokuBuilder {
    private static _size: number;
    private static _isRectangular: boolean;
    private static _isIrregular: boolean;
    private static _rectangleWidth: number | null;
    private static _rectangleHeight: number | null;
    private static _isDiagonal: boolean;
    private static _isLetters: boolean;
    private static _letters: string[];
    private static _isVX: boolean;
    private static _vxSum: [number, string][] | null;
    private static _prompterNumMin: number | null;
    private static _prompterNumMax: number | null;
    private static _isKropki: boolean;
    private static _isMinusOne: boolean;
    private static _isMinusOneDirection: boolean;
    private static _isInequality: boolean;
    private static _isKiller: boolean;
    private static _isKillerUnchained: boolean;
    private static _killerGroupSizes: number[] | null;
    private static _isRoman: boolean;
    private static _isABC: boolean;
    private static _isSlovak: boolean;
    private static _valueNumber: number | null;
    private static _isSkyscraper: boolean;
    private static _isKingMove: boolean;
    private static _isKnightMove: boolean;

    private static readonly MAX_TRIES_SOLUTION = 50;
    private static readonly MAX_TRIES_TASK = 300;

    private static readonly STATS = {
        solutionTries: 0,
        taskTries: 0,
        startSolutionTries: 0,
        startTaskTries: 0,
        doPrint: true,
        addSolutionTries: () => {
            SudokuBuilder.STATS.solutionTries ++;
        },
        addTaskTries: () => {
            SudokuBuilder.STATS.taskTries ++;
        },
        isSolutionTriesEnd: () => {
            return SudokuBuilder.STATS.solutionTries - SudokuBuilder.STATS.startSolutionTries >= SudokuBuilder.MAX_TRIES_SOLUTION;
        },
        isTaskTriesEnd: () => {
            return SudokuBuilder.STATS.taskTries - SudokuBuilder.STATS.startTaskTries >= SudokuBuilder.MAX_TRIES_TASK;
        },
        restartSolutionTries: () => {
            SudokuBuilder.STATS.startSolutionTries = SudokuBuilder.STATS.solutionTries;
        },
        restartTaskTries: () => {
            SudokuBuilder.STATS.startTaskTries = SudokuBuilder.STATS.taskTries;
        },
        restart: () => {
            SudokuBuilder.STATS.solutionTries = 0;
            SudokuBuilder.STATS.taskTries = 0;
            SudokuBuilder.STATS.startSolutionTries = 0;
            SudokuBuilder.STATS.startTaskTries = 0;
        },
        print: () => {
            if (SudokuBuilder.STATS.doPrint) {
                console.log("ST: " + SudokuBuilder.STATS.solutionTries + " TT: " + SudokuBuilder.STATS.taskTries);
            }
        }
    };

    public static setDoPrint(doPrint: boolean): void {
        this.STATS.doPrint = doPrint;
    }

    private static setDefault = (() => {
        SudokuBuilder.default();
    })();

    public static default(): void {
        this._size = 9;
        this._isRectangular = true;
        this._rectangleWidth = 3;
        this._rectangleHeight = 3;
        this._isDiagonal = false;
        this._isLetters = false;
        this._letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        this._isVX = false;
        this._vxSum = null;
        this._prompterNumMin = null;
        this._prompterNumMax = null;
        this._isKropki = false;
        this._isMinusOne = false;
        this._isMinusOneDirection = false;
        this._isInequality = false;
        this._isKiller = false;
        this._isKillerUnchained = false;
        this._killerGroupSizes = null;
        this._isSlovak = false;
        this._isABC = false;
        this._valueNumber = null;
        this._isKingMove = false;
        this._isKnightMove = false;
    }

    private static removeVariation(): void {
        this._isVX = false;
        this._vxSum = null;
        this._isKropki = false;
        this._isABC = false;
        this._isSlovak = false;
        this._valueNumber = null;
        this._isSkyscraper = false;
        this._isMinusOne = false;
        this._isMinusOneDirection = false;
        this._isInequality = false;
        this._isKiller = false;
        this._killerGroupSizes = null;
        this._isRoman = false;
    }

    private static getNewSudoku(): ISudoku {
        let sudoku = new Sudoku(
            this._size,
            this._isRectangular,
            this._isIrregular,
            this._rectangleWidth,
            this._rectangleHeight,
            this._isDiagonal,
            this._isLetters,
            this._letters,
            this._isVX,
            this._vxSum,
            this._isKropki,
            this._isMinusOne,
            this._isMinusOneDirection,
            this._isInequality,
            this._isKiller,
            this._isKillerUnchained,
            this._killerGroupSizes,
            this._isRoman,
            this._isSlovak,
            this._isABC,
            this._valueNumber,
            this._isSkyscraper,
            this._isKingMove,
            this._isKnightMove,
        );

        sudoku.isFinished = false;
        sudoku.hasSolution = false;

        return sudoku;
    }

    public static build(): ISudoku | null {
        let sudoku = this.getNewSudoku();

        this.STATS.restart();
        let isTaskSuccess = this.getTask(sudoku);
        this.STATS.print();

        if (sudoku.isABC) {
            sudoku.board = Utils.createEmptyBoard(sudoku);
        }

        sudoku.isFinished = true;

        if (isTaskSuccess) {
            return sudoku;
        } else {
            return null;
        }
    }

    public static checkAbcSolutionUnambiguity(solution: number[][], parent: ISudoku): boolean {
        for (let i = 0; i < 3; i++) {
            let sizeX, sizeY;
            [sizeX, sizeY] = [[2, 2], [2, 3], [3, 2]][i];
            for (let y = 0; y <= parent.size - sizeY; y++) {
                for (let x = 0; x <= parent.size - sizeX; x++) {
                    let possible = 0;
                    let numberCount = 0;
                    for (let relativeY = 0; relativeY < sizeY; relativeY++) {
                        for (let relativeX = 0; relativeX < sizeX; relativeX++) {
                            possible |= solution[y + relativeY][x + relativeX];
                            if (solution[y + relativeY][x + relativeX] !== 1) {
                                numberCount ++;
                            }
                        }
                    }
                    if (Utils.countBits32(possible) === 1 && numberCount >= 2) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private static getSolutionTry(parent: ISudoku): number[][] | null {
        let solution = Utils.createEmptyBoard(parent);
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                let possible = solution[y][x];
                if (possible === 0) {
                    this.STATS.addSolutionTries();
                    return null;
                }

                if (Utils.countBits32(possible) !== 1) {
                    solution[y][x] = Utils.chooseRandomBit(possible);
                    solution = Solver.solve(solution, parent);
                }
            }
        }

        if (! Solver.checkSolution(solution, parent)) {
            this.STATS.addSolutionTries();
            return null;
        }

        if ((parent.isABC || parent.isSlovak) && parent.valueNumber !== null) {
            for (let y = 0; y < parent.size; y++) {
                for (let x = 0; x < parent.size; x++) {
                    if (solution[y][x] > 1 << parent.valueNumber) {
                        solution[y][x] = 1;
                    }
                }
            }
        }

        return solution;
    }

    private static getSolution(parent: ISudoku): boolean {
        parent.hasSolution = false;

        let isSolutionSuccess = false;
        while (! this.STATS.isSolutionTriesEnd() && ! isSolutionSuccess) {
            if (parent.isKiller || parent.isKillerUnchained) {
                if (this.STATS.taskTries % 50 === 0 && this.STATS.taskTries > 0) {
                    // @ts-ignore
                    parent.refreshKillerGroups(this._killerGroupSizes);
                }
            }
            if (parent.isIrregular) {
                if (this.STATS.taskTries % 5 === 0 && this.STATS.taskTries > 0) {
                    // @ts-ignore
                    parent.refreshIrregularGroups();
                }
            }

            let solution = this.getSolutionTry(parent);

            if (solution !== null) {
                parent.solution = solution;

                if (parent.isKiller || parent.isKillerUnchained) {
                    parent.setKillerSums();
                }

                isSolutionSuccess = true;
            }
        }

        parent.solutionAdded();

        if (parent.isABC) {
            if (! this.checkAbcSolutionUnambiguity(parent.solution, parent)) {
                this.STATS.addSolutionTries();
                isSolutionSuccess = false;
            }
        }

        if (this.STATS.isSolutionTriesEnd()) {
            this.STATS.restartSolutionTries();
            this.STATS.addTaskTries();
        }

        return isSolutionSuccess;
    }

    private static reduceSideTask(parent: ISudoku): boolean {
        if (Utils.getExtraNum(Solver.solve(parent.task, parent)) > 0) {
            if (this.STATS.isSolutionTriesEnd()) {
                this.STATS.restartSolutionTries();
                this.STATS.addTaskTries();
            } else {
                this.STATS.addSolutionTries();
            }
            return false;
        }

        // @ts-ignore
        let taskSolution = Utils.deepcopyArray2d(parent.sideTask);
        let unknownOrder = Utils.getUnknownOrderSideTask(parent);

        for (let i = 0; i < unknownOrder.length; i++) {
            let dir, position;
            [dir, position] = unknownOrder[i];

            // @ts-ignore
            parent.sideTask[dir][position] = 0;

            let numberOfSolutions = Solver.countSolutions(Solver.solve(parent.task, parent), parent);

            if (numberOfSolutions > 1) {
                // @ts-ignore
                parent.sideTask[dir][position] = taskSolution[dir][position];
            } else if (numberOfSolutions === 0) {
                console.log(parent.solution);
                Renderer.render(parent.solution, parent);
                throw "TASK ERROR";
            }
        }

        return true;
    }

    private static reduceOrthogonalTask(parent: ISudoku): boolean {
        if (Utils.getExtraNum(Solver.solve(parent.task, parent)) > 0) {
            if (this.STATS.isSolutionTriesEnd()) {
                this.STATS.restartSolutionTries();
                this.STATS.addTaskTries();
            } else {
                this.STATS.addSolutionTries();
            }
            return false;
        }

        let taskSolution = Utils.deepcopy(parent.orthogonalTask);
        let unknownOrder = Utils.getUnknownOrderOrthogonalTask(parent);

        for (let i = 0; i < unknownOrder.length; i++) {
            let x, y, dir;
            [x, y, dir] = unknownOrder[i];

            // @ts-ignore
            parent.orthogonalTask[y][x][dir] = null;

            let numberOfSolutions = Solver.countSolutions(Solver.solve(parent.task, parent), parent);

            if (numberOfSolutions > 1) {
                // @ts-ignore
                parent.orthogonalTask[y][x][dir] = taskSolution[y][x][dir];
            } else if (numberOfSolutions === 0) {
                Renderer.render(parent.solution, parent);
                throw "TASK ERROR";
            }
        }

        return true;
    }

    private static reduceExtraTask(parent: ISudoku): boolean {
        if (Utils.getExtraNum(Solver.solve(parent.task, parent)) > 0) {
            if (this.STATS.isSolutionTriesEnd()) {
                this.STATS.restartSolutionTries();
                this.STATS.addTaskTries();
            } else {
                this.STATS.addSolutionTries();
            }
            return false;
        }

        let taskSolution = Utils.createArray2d(parent.size, parent.size, null);
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                // @ts-ignore
                let prompter = parent.extraTask[y][x];
                if (prompter !== null) {
                    taskSolution[y][x] = Utils.deepcopyArray1d(prompter);
                }
            }
        }
        let unknownOrder = Utils.getUnknownOrderTask(parent);

        for (let i = 0; i < unknownOrder.length; i++) {
            let dir, position;
            [dir, position] = unknownOrder[i];

            // @ts-ignore
            parent.extraTask[dir][position] = null;

            let numberOfSolutions = Solver.countSolutions(Solver.solve(parent.task, parent), parent);

            if (numberOfSolutions > 1) {
                // @ts-ignore
                parent.extraTask[dir][position] = taskSolution[dir][position];
            } else if (numberOfSolutions === 0) {
                console.log(parent.solution);
                Renderer.render(parent.solution, parent);
                throw "TASK ERROR";
            }
        }

        return true;
    }

    private static reduceTask(parent: ISudoku): boolean {
        let task = Utils.deepcopyArray2d(parent.solution);

        // @ts-ignore
        let emptyValue = (1 << parent.size) - 1;
        if (parent.isSlovak && parent.valueNumber !== null) {
            emptyValue = (1 << parent.valueNumber + 1) - 1;
        }

        if (this._prompterNumMax === 0) {
            for (let y = 0; y < parent.size; y++) {
                for (let x = 0; x < parent.size; x++) {
                    task[y][x] = emptyValue;
                }
            }
            parent.task = task;
        }

        let numberOfSolutions = Solver.countSolutions(Solver.solve(task, parent), parent);
        if (numberOfSolutions > 1) {
            this.STATS.addTaskTries();
            return false;
        }

        let unknownOrder = Utils.getUnknownOrderTask(parent);

        for (let i = 0; i < unknownOrder.length; i++) {
            let x, y;
            [x, y] = unknownOrder[i];

            task[y][x] = emptyValue;

            let numberOfSolutions = Solver.countSolutions(Solver.solve(task, parent), parent);
            if (numberOfSolutions > 1) {
                task[y][x] = parent.solution[y][x];
            } else if (numberOfSolutions === 0) {
                Renderer.render(parent.solution, parent);
                throw "TASK ERROR";
            }

            if (this._prompterNumMin !== null) {
                if (Utils.getPrompterNum(task) <= this._prompterNumMin) {
                    parent.task = task;
                    return true;
                }
            }
        }

        if (this._prompterNumMax !== null) {
            if (Utils.getPrompterNum(task) > this._prompterNumMax) {
                this.STATS.addTaskTries();
                return false;
            }
        }

        if (parent.isVX) {
            if (parent.hasPrompterInVxSum()) {
                this.STATS.addTaskTries();
                return false;
            }
        }

        if (parent.isLetters) {
            if (! parent.hasTaskAllValues(task)) {
                this.STATS.addTaskTries();
                return false;
            }
        }

        parent.task = task;
        return true;
    }

    private static getTaskTry(parent: ISudoku): boolean {
        if (parent.isABC || parent.isSkyscraper) {
            parent.task = Utils.deepcopyArray2d(parent.board);
            return this.reduceSideTask(parent);
        }

        if (parent.isRoman) {
            let isTaskSuccess = this.reduceTask(parent);
            if (! isTaskSuccess) {
                return false;
            }
            return this.reduceOrthogonalTask(parent);
        }

        if (parent.isSlovak) {
            let isTaskSuccess = this.reduceTask(parent);
            if (! isTaskSuccess) {
                return false;
            }
            return this.reduceExtraTask(parent);
        }

        return this.reduceTask(parent);
    }

    private static getTask(parent: ISudoku): boolean {
        let isTaskSuccess = false;

        while (! this.STATS.isTaskTriesEnd() && ! isTaskSuccess) {
            let isSolutionSuccess = this.getSolution(parent);

            if (isSolutionSuccess) {
                isTaskSuccess = this.getTaskTry(parent);
            }
        }

        if (! isTaskSuccess) {
            console.log("!! Unable to create task in " + this.MAX_TRIES_TASK.toString() + " tries.");
        }

        return isTaskSuccess;
    }

    public static size(size: number): void {
        this._size = size;
        this._isRectangular = false;
        this._rectangleWidth = null;
        this._rectangleHeight = null;
    }

    public static rectangular(isRectangular: boolean, rectangleWidth: number | null = null, rectangleHeight: number | null = null): void {
        if (isRectangular && rectangleWidth !== null && rectangleHeight !== null) {
            this._isRectangular = true;
            this._rectangleWidth = rectangleWidth;
            this._rectangleHeight = rectangleHeight;
            this._size = rectangleWidth * rectangleHeight;
            this._isIrregular = false;
        } else if (! isRectangular) {
            this._isRectangular = false;
            this._rectangleWidth = null;
            this._rectangleHeight = null;
        }
    }

    public static irregular(isIrregular: boolean): void {
        if (isIrregular) {
            this._isIrregular = true;
            this.rectangular(false, null, null);
        } else {
            this._isIrregular = false;
        }
    }

    public static killer(isKiller: boolean, killerGroupSizeCounts: number[][] | null): void {
        if (isKiller && killerGroupSizeCounts !== null) {
            this.removeVariation();

            let killerGroupSizes = [];
            for (let i = 0; i < killerGroupSizeCounts.length; i++) {
                for (let j = 0; j < killerGroupSizeCounts[i][1]; j++) {
                    killerGroupSizes.push(killerGroupSizeCounts[i][0]);
                }
            }
            this._isKiller = true;
            this._killerGroupSizes = killerGroupSizes;
        } else {
            this._isKiller = false;
            this._killerGroupSizes = null;
        }
    }

    public static killerUnchained(isKillerUnchained: boolean, killerGroupSizeCounts: number[][] | null): void {
        if (isKillerUnchained && killerGroupSizeCounts !== null) {
            this.removeVariation();

            let killerGroupSizes = [];
            for (let i = 0; i < killerGroupSizeCounts.length; i++) {
                for (let j = 0; j < killerGroupSizeCounts[i][1]; j++) {
                    killerGroupSizes.push(killerGroupSizeCounts[i][0]);
                }
            }
            this._isKillerUnchained = true;
            this._killerGroupSizes = killerGroupSizes;
        } else {
            this._isKillerUnchained = false;
            this._killerGroupSizes = null;
        }
    }

    public static diagonal(isDiagonal: boolean): void {
        this._isDiagonal = isDiagonal;
    }

    public static letters(isLetters: boolean, letters: string[] | null): void {
        this._isLetters = isLetters;
        if (letters !== null) {
            this._letters = letters;
        }
    }

    public static vxSum(isVX: boolean, vxSum: [number, string][] | null = null): void {
        this.removeVariation();

        if (isVX && vxSum !== null) {
            this._isVX = true;
            this._vxSum = vxSum;
        } else if (! isVX) {
            this._isVX = false;
            this._vxSum = null;
        }
    }

    public static prompterNum(prompterNumMin: number | null = null, prompterNumMax: number | null = null): void {
        if (prompterNumMin !== null && prompterNumMax !== null) {
            if (prompterNumMin > prompterNumMax) {
                throw "SudokuBuilder->prompterNum - PROMPTER_NUM_MIN > PROMPTER_NUM_MAX";
            }
        }
        this._prompterNumMin = prompterNumMin;
        this._prompterNumMax = prompterNumMax;
    }

    public static kropki(isKropki: boolean): void {
        this.removeVariation();

        this._isKropki = isKropki;
    }

    public static minusOne(isMinusOne: boolean): void {
        this.removeVariation();

        this._isMinusOne = isMinusOne;
    }

    public static minusOneDirection(isMinusOneDirection: boolean): void {
        this.removeVariation();

        this._isMinusOneDirection = isMinusOneDirection;
    }

    public static inequality(isInequality: boolean): void {
        this.removeVariation();

        this._isInequality = isInequality;
    }

    public static roman(isRoman: boolean): void {
        this.removeVariation();

        this._isRoman = isRoman;
    }

    public static abc(isABC: boolean, valueNumber: number | null): void {
        this.removeVariation();

        if (isABC && valueNumber !== null) {
            this._isABC = true;
            this._valueNumber = valueNumber;
        } else {
            this._isABC = false;
            this._valueNumber = null;
        }
    }

    public static slovak(isSlovak: boolean, valueNumber: number | null): void {
        this.removeVariation();

        if (isSlovak && valueNumber !== null) {
            this._isSlovak = true;
            this._valueNumber = valueNumber;
        } else {
            this._isABC = false;
            this._valueNumber = null;
        }
    }

    public static skyscraper(isSkyscraper: boolean): void {
        this.removeVariation();

        this._isSkyscraper = isSkyscraper;
    }

    public static pieceMoves(isKingMove: boolean, isKnightMove: boolean): void {
        this._isKingMove = isKingMove;
        this._isKnightMove = isKnightMove;
    }
}