/**
 * Class for saving settings for creating new sudokus and creating sudoku objects.
 *
 * First it creates solution. (for abc it creates solutions same way as regular sudoku, after that it changes multiple numbers to spaces)
 *      It sets first square with multiple possible values to random one of them.
 *      Then it calls Solver.solve(). (without it it can make sudoku up to 4x4, but with it it can make 5x5 (has 625 squares) in seconds.)
 *      Repeat previous two.
 *      If solution is incorrect, start again. (For sudoku of regular sizes, it does not have to do it many times.)
 *
 * Then from solution it creates task.
 *      Try to remove each prompter in random order.
 *      If after removing a prompter, the sudoku is unsolvable, return it back.
 */
class SudokuBuilder {
    private static _size: number; // width, height of puzzle
    private static _isRectangular: boolean; // true = every number must be exactly once in each of rectangle
    private static _rectangleWidth: number | null; // width of rectangle (and number of rectangles in y direction)
    private static _rectangleHeight: number | null; // height of rectangle (and number of rectangles in x direction)
    private static _isDiagonal: boolean; // true = every number must be exactly once in each of two diagonals
    private static _isVX: boolean; // true = VX variation
    private static _vxSum: [number, string][] | null; // specification of VX - sum and character (default: [[5, "V"], [10, "X"]])
    private static _prompterNumMin: number | null; // minimal number of prompters (does not work for kropki and abc)
    private static _prompterNumMax: number | null; // maximal number of prompters (does not work for kropki and abc)
    private static _isKropki: boolean; // true = kropki variation
    private static _isABC: boolean; // true = abc variation
    private static _abcNumber: number | null; // number of letters in abc

    /**
     * First the SudokuBuilder tries to create solution for sudoku. This is how many times it tries for one task.
     * (If it fails to create solution MAX_TRIES_SOLUTION times, it counts as failing creating task once.)
     * (After one SudokuBuilder.build() it tries to create solution maximally MAX_TRIES_SOLUTION*MAX_TRIES_TASK times.)
     *
     * Creating solution for "normal-setting" sudoku fails around once per SudokuBuilder.build()
     * This will only make trouble if you try to create sudoku with non standard requirements.
     */
    private static readonly MAX_TRIES_SOLUTION = 1000;
    /**
     * After a solution is created, it tries to create a task.
     * Creating task can be failed by not being able to have a low amount prompters or because big abc can not be solved with all prompters.
     *
     * If creating task is failed MAX_TRIES_TASK times, it SudokuBuilder.build() returns null and a warning is written to console.
     */
    private static readonly MAX_TRIES_TASK = 300;

    /**
     * Keeps track of how many times was failed to create solution or task.
     */
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

    /**
     * @param doPrint       true = after creating sudoku, print hwo many times was creating task or solution failed
     */
    public static setDoPrint(doPrint: boolean): void {
        this.STATS.doPrint = doPrint;
    }

    /**
     * Instead of static constructor.
     */
    private static setDefault = (() => {
        SudokuBuilder.default();
    })();

    /**
     * Set default value for all settings. (For creating sudoku.)
     */
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
    }

    /**
     * Set sudoku to have no special variation. (Only for variations that are not compatible together)
     */
    private static removeVariation(): void {
        this._isVX = false;
        this._vxSum = null;
        this._isKropki = false;
        this._isABC = false;
        this._abcNumber = null;
    }

    /**
     * Create sudoku.
     *
     * @return      ISudoku | null (if it fails)
     */
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
            this._isABC,
            this._abcNumber,
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

    /**
     * From solution, create task for abc.
     *
     * It first counts first visible letters from all directions.
     * If abc is unsolvable with them, return null.
     * Then it repeatedly tries to remove a prompter. If it is not solvable without it, returns it back.
     *
     * @return      sudoku.task | null
     */
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

    /**
     * From solution, create task for non-abc.
     *
     * Call SudokuBuilder.getTaskTry() multiple times. If it fails every time, return null
     *
     * @return      true = task was successfully created
     */
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

    /**
     * Create solution. Set solution to Sudoku object, if it succeeds.
     *
     * Call SudokuBuilder.getSolutionTry() multiple times.
     *
     * @return      true = successfully created solution
     */
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

    /**
     * Create solution.
     *
     * Start with board, where every number can be everywhere.
     * Find first square with multiple possible numbers. Set it to random of them.
     * Call Solver.solve() to remove possible numbers, which can not be somewhere. (This greatly improves change of success.)
     * Repeat previous two.
     *
     * In the end, check if sudoku is valid. If not, return null.
     *
     * @return      sudoku.solution | null (if it fails)
     */
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

    /**
     * Create task for non-abc from solution.
     *
     * Remove prompters in random order.
     * If it is unsolvable, give the prompter back.
     *
     * If task does not satisfy the requirements (mainly maximum number of prompters), return null.
     */
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
                if (Utils.getPrompterNum(task) < this._prompterNumMin) {
                    return task;
                }
            }
        }

        if (this._prompterNumMax !== null) {
            if (Utils.getPrompterNum(task) > this._prompterNumMax) {
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

    /**
     * Set size of sudoku. Sudoku will automatically not have any rectangles.
     * @param size      Width, height of sudoku.
     */
    public static size(size: number): void {
        this._size = size;
        this._isRectangular = false;
        this._rectangleWidth = null;
        this._rectangleHeight = null;
    }

    /**
     * Set: Does sudoku have rectangles, where every number is once? Size of rectangles.
     */
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

    /**
     * Set: Is sudoku diagonal?
     */
    public static diagonal(isDiagonal: boolean): void {
        this._isDiagonal = isDiagonal;
    }

    /**
     * Set: Is sudoku VX variation?
     * @param isVX      is VX variation
     * @param vxSum     sums and their character (default [[5, "V"], ["X", 10]])
     */
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

    /**
     * Set minimal and maximal number of propmter.
     * @param prompterNumMin        Minimal number of prompter, null = not limited
     * @param prompterNumMax        Maximal number of prompter, null = not limited
     */
    public static prompterNum(prompterNumMin: number | null = null, prompterNumMax: number | null = null): void {
        if (prompterNumMin !== null && prompterNumMax !== null) {
            if (prompterNumMin > prompterNumMax) {
                throw "SudokuBuilder->prompterNum - PROMPTER_NUM_MIN > PROMPTER_NUM_MAX";
            }
        }
        this._prompterNumMin = prompterNumMin;
        this._prompterNumMax = prompterNumMax;
    }

    /**
     * Set: Is sudoku kropki variant?
     */
    public static kropki(isKropki: boolean): void {
        this.removeVariation();

        this._isKropki = isKropki;
    }

    /**
     * Set: Is abc variant?
     * @param isABC         is abc variant?
     * @param abcNumber     number of letters in each row/column
     */
    public static abc(isABC: boolean, abcNumber: number | null): void {
        if (isABC && abcNumber !== null) {
            this._isABC = true;
            this._abcNumber = abcNumber;
        } else {
            this._isABC = false;
            this._abcNumber = null;
        }
    }
}