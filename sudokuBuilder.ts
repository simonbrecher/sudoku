class SudokuBuilder {
    private static _size: number;
    private static _isRectangular: boolean;
    private static _rectangleWidth: number | null;
    private static _rectangleHeight: number | null;
    private static _isDiagonal: boolean;
    private static _isVX: boolean;
    private static _vxSum: [number, string][] | null;
    private static _prompterNumMin: number | null;
    private static _prompterNumMax: number | null;
    private static _isKropki: boolean;
    private static _isMinusOne: boolean;
    private static _isInequality: boolean;
    private static _isABC: boolean;
    private static _abcNumber: number | null;
    private static _isKingMove: boolean;
    private static _isKnightMove: boolean;

    private static readonly MAX_TRIES_SOLUTION = 1000;
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
        this._isVX = false;
        this._vxSum = null;
        this._prompterNumMin = null;
        this._prompterNumMax = null;
        this._isKropki = false;
        this._isABC = false;
        this._abcNumber = null;
        this._isKingMove = false;
        this._isKnightMove = false;
    }

    private static removeVariation(): void {
        this._isVX = false;
        this._vxSum = null;
        this._isKropki = false;
        this._isABC = false;
        this._abcNumber = null;
        this._isMinusOne = false;
        this._isInequality = false;
    }

    public static build(): ISudoku | null {
        let sudoku = new Sudoku(
            this._size,
            this._isRectangular,
            this._rectangleWidth,
            this._rectangleHeight,
            this._isDiagonal,
            this._isVX,
            this._vxSum,
            this._isKropki,
            this._isMinusOne,
            this._isInequality,
            this._isABC,
            this._abcNumber,
            this._isKingMove,
            this._isKnightMove,
        );

        sudoku.isFinished = false;
        sudoku.hasSolution = false;

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

    private static getAbcTask(parent: ISudoku): number[][] | null {
        let solution = parent.solution;

        let task = [];
        for (let dir = 0; dir < 4; dir++) {
            let directionTask = [];
            for (let position = 0; position < parent.size; position++) {
                let startX, startY, moveX, moveY;
                [[startX, startY], [moveX, moveY]] = Utils.getAbcDirection(dir, position, parent);

                let first = 1;
                for (let i = 0; i < parent.size; i++) {
                    let square = solution[startY + i * moveY][startX + i * moveX];
                    if (square !== 1) {
                        first = square;
                        break;
                    }
                }
                directionTask.push(first);
            }
            task.push(directionTask);
        }

        parent.task = task;
        if (Utils.getExtraNum(Solver.solve(parent.board, parent)) > 0) {
            if (this.STATS.isSolutionTriesEnd()) {
                this.STATS.restartSolutionTries();
                this.STATS.addTaskTries();
            } else {
                this.STATS.addSolutionTries();
            }
            return null;
        }

        let taskSolution = parent.task;
        let unknownOrder = Utils.getUnknownOrder(parent);

        for (let i = 0; i < unknownOrder.length; i++) {
            let dir, position;
            [dir, position] = unknownOrder[i];

            task[dir][position] = 0;

            parent.task = task;

            let numberOfSolutions = Solver.countSolutions(Solver.solve(parent.board, parent), parent);

            if (numberOfSolutions > 1) {
                task[dir][position] = taskSolution[dir][position];
            } else if (numberOfSolutions === 0) {
                console.log(parent.solution);
                throw "TASK ERROR";
            }
        }

        parent.task = task;
        return task;
    }

    private static getTask(parent: ISudoku): boolean {
        let isTaskSuccess = false;

        while (! this.STATS.isTaskTriesEnd() && ! isTaskSuccess) {
            let isSolutionSuccess = this.getSolution(parent);

            if (isSolutionSuccess) {
                let task = this.getTaskTry(parent);

                if (task !== null) {
                    parent.task = task;
                    isTaskSuccess = true;
                }
            }
        }

        if (! isTaskSuccess) {
            console.log("!! Unable to create task in " + this.MAX_TRIES_TASK.toString() + " tries.");
        }

        return isTaskSuccess;
    }

    private static getSolution(parent: ISudoku): boolean {
        parent.hasSolution = false;

        let isSolutionSuccess = false;
        while (! this.STATS.isSolutionTriesEnd() && ! isSolutionSuccess) {
            let solution = this.getSolutionTry(parent);

            if (solution !== null) {
                parent.solution = solution;
                isSolutionSuccess = true;
            }
        }

        parent.hasSolution = true;

        if (parent.isABC) {
            if (! Utils.checkAbcSolutionUnambiguity(parent.solution, parent)) {
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

        if (parent.isABC && parent.abcNumber !== null) {
            for (let y = 0; y < parent.size; y++) {
                for (let x = 0; x < parent.size; x++) {
                    if (solution[y][x] > 1 << parent.abcNumber) {
                        solution[y][x] = 1;
                    }
                }
            }
        }

        return solution;
    }

    private static getTaskTry(parent: ISudoku): number[][] | null {
        if (parent.isABC) {
            return this.getAbcTask(parent);
        }

        let task = parent.solution;
        let solution = parent.solution;

        let unknownOrder = Utils.getUnknownOrder(parent);

        for (let i = 0; i < unknownOrder.length; i++) {
            let x, y;
            [x, y] = unknownOrder[i];

            task[y][x] = (1 << parent.size) - 1;

            let numberOfSolutions = Solver.countSolutions(Solver.solve(task, parent), parent);
            if (numberOfSolutions > 1) {
                task[y][x] = solution[y][x];
            } else if (numberOfSolutions === 0) {
                console.log(parent.solution);
                throw "TASK ERROR";
            }

            if (this._prompterNumMin !== null) {
                if (Utils.getPrompterNum(task) <= this._prompterNumMin) {
                    return task;
                }
            }
        }

        if (this._prompterNumMax !== null) {
            if (Utils.getPrompterNum(task) >= this._prompterNumMax) {
                this.STATS.addTaskTries();
                return null;
            }
        }

        if (parent.isVX) {
            if (Utils.hasPrompterInSum(task, parent)) {
                this.STATS.addTaskTries();
                return null;
            }
        }

        return task;
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
        } else if (! isRectangular) {
            this._isRectangular = false;
            this._rectangleWidth = null;
            this._rectangleHeight = null;
        }
    }

    public static diagonal(isDiagonal: boolean): void {
        this._isDiagonal = isDiagonal;
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

        this._isMinusOne = true;
    }

    public static inequality(isInequality: boolean): void {
        this.removeVariation();

        this._isInequality = isInequality;
    }

    public static abc(isABC: boolean, abcNumber: number | null): void {
        this.removeVariation();

        if (isABC && abcNumber !== null) {
            this._isABC = true;
            this._abcNumber = abcNumber;
        } else {
            this._isABC = false;
            this._abcNumber = null;
        }
    }

    public static pieceMoves(isKingMove: boolean, isKnightMove: boolean): void {
        this._isKingMove = isKingMove;
        this._isKnightMove = isKnightMove;
    }
}