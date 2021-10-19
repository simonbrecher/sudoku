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

    private static readonly MAX_TRIES_SOLUTION = 1000;
    private static readonly MAX_TRIES_TASK = 1000;

    private static readonly STATS = {
        solutionTries: 0,
        taskTries: 0,
    };

    private static setDefault = (() => {
        SudokuBuilder.default();
    })();

    public static build(): ISudoku | null {
        let sudoku = new Sudoku(
            this._size,
            this._isRectangular,
            this._rectangleWidth,
            this._rectangleHeight,
            this._isDiagonal, this._isVX, this._vxSum,
        );

        sudoku.isFinished = false;
        sudoku.hasSolution = false;

        this.STATS.taskTries = 0;
        this.STATS.solutionTries = 0;
        let isTaskSuccess = this.getTask(sudoku);
        console.log(this.STATS, Utils.getPrompterNum(sudoku.task));

        sudoku.isFinished = true;

        if (isTaskSuccess) {
            return sudoku;
        } else {
            return null;
        }
    }

    private static getTask(parent: ISudoku): boolean {
        let isTaskSuccess = false;
        let taskTries = 0;

        while (taskTries < this.MAX_TRIES_TASK && ! isTaskSuccess) {
            let isSolutionSuccess = this.getSolution(parent);

            if (isSolutionSuccess) {
                let task = this.getTaskTry(parent);

                if (task === null) {
                    taskTries ++;
                } else {
                    parent.task = task;
                    isTaskSuccess = true;
                }
            } else {
                taskTries ++;
            }
        }

        this.STATS.taskTries += taskTries;

        if (! isTaskSuccess) {
            console.log("!! Unable to create task in " + this.MAX_TRIES_TASK.toString() + " tries.");
        }

        return isTaskSuccess;
    }

    private static getSolution(parent: ISudoku): boolean {
        parent.hasSolution = false;

        let isSolutionSuccess = false;
        let solutionTries = 0;

        while (solutionTries < this.MAX_TRIES_SOLUTION && ! isSolutionSuccess) {
            let solution = this.getSolutionTry(parent);

            if (solution === null) {
                solutionTries ++;
            } else {
                parent.solution = solution;
                isSolutionSuccess = true;
            }
        }

        this.STATS.solutionTries += solutionTries;

        if (! isSolutionSuccess) {
            console.log("Unable to create solution in " + this.MAX_TRIES_SOLUTION.toString() + " tries.");
        }

        parent.hasSolution = true;

        return isSolutionSuccess;
    }

    private static getSolutionTry(parent: ISudoku): number[][] | null {
        let solution = Utils.createEmptyBoard(parent);
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                let possible = solution[y][x];
                if (possible === 0) {
                    return null;
                }

                if (Utils.countBits32(possible) !== 1) {
                    solution[y][x] = Utils.chooseRandomBit(possible);
                    solution = Solver.solve(solution, parent);
                }
            }
        }

        if (! Solver.checkSolution(solution, parent)) {
            return null;
        }

        return solution;
    }

    private static getTaskTry(parent: ISudoku): number[][] | null {
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
                return null;
            }
        }

        if (parent.isVX) {
            if (Utils.hasPrompterInSum(task, parent)) {
                return null;
            }
        }

        return task;
    }

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

    public static vxSum(isVX: boolean, vxSum: [number, string][] | null): void {
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
}