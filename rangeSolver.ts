class RangeSolver {
    private static solveNumberIsEmpty(board: number[][], parent: IRange): number[][] {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (parent.task[y][x] !== null) {
                    board[y][x] &= 1;
                }
            }
        }

        return board;
    }

    private static solveAroundFullIsEmpty(board: number[][], parent: IRange): number[][] {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (board[y][x] === 2) {
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        for (let dirX = -1; dirX <= 1; dirX++) {
                            if ((dirX === 0) !== (dirY === 0)) {
                                let newX = x + dirX;
                                let newY = y + dirY;
                                if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                                    board[newY][newX] &= 1;
                                }
                            }
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveMinMaxLength(board: number[][], parent: IRange): number[][] {
        let allMinimums = parent.countLengthInDirection(board, false);
        let allMaximums = parent.countLengthInDirection(board, true);
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                let prompter = parent.task[y][x];
                if (prompter !== null) {
                    let minimums = [allMinimums[0][y][x], allMinimums[1][y][x], allMinimums[2][y][x], allMinimums[3][y][x]];
                    let maximums = [allMaximums[0][y][x], allMaximums[1][y][x], allMaximums[2][y][x], allMaximums[3][y][x]];
                    let minimumSum = minimums[0] + minimums[1] + minimums[2] + minimums[3];
                    let maximumSum = maximums[0] + maximums[1] + maximums[2] + maximums[3];
                    if (minimumSum > prompter - 1) {
                        board[y][x] = 0;
                    }
                    if (maximumSum < prompter - 1) {
                        board[y][x] = 0;
                    }
                    if (minimumSum === prompter - 1) {
                        if (x - minimums[0] > 0) {
                            board[y][x - minimums[0] - 1] &= 2;
                        }
                        if (x + minimums[1] < parent.width - 1) {
                            board[y][x + minimums[1] + 1] &= 2;
                        }
                        if (y - minimums[2] > 0) {
                            board[y - minimums[2] - 1][x] &= 2;
                        }
                        if (y + minimums[3] < parent.height - 1) {
                            board[y + minimums[3] + 1][x] &= 2;
                        }
                    }
                    let minimum0 = (prompter - 1) - (maximumSum - maximums[0]);
                    for (let i = 1; i <= minimum0; i++) {
                        if (x - i >= 0) {
                            board[y][x - i] &= 1;
                        }
                    }
                    let minimum1 = (prompter - 1) - (maximumSum - maximums[1]);
                    for (let i = 1; i <= minimum1; i++) {
                        if (x + i < parent.width) {
                            board[y][x + i] &= 1;
                        }
                    }
                    let minimum2 = (prompter - 1) - (maximumSum - maximums[2]);
                    for (let i = 1; i <= minimum2; i++) {
                        if (y - i >= 0) {
                            board[y - i][x] &= 1;
                        }
                    }
                    let minimum3 = (prompter - 1) - (maximumSum - maximums[3]);
                    for (let i = 1; i <= minimum3; i++) {
                        if (y + i < parent.height) {
                            board[y + i][x] &= 1;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveCycle(board: number[][], parent: IRange): number[][] {
        board = this.solveNumberIsEmpty(board, parent);
        if (parent.isKuromasu) {
            board = this.solveAroundFullIsEmpty(board, parent);
        }
        board = this.solveMinMaxLength(board, parent);

        return board;
    }

    private static countExtra(board: number[][], parent: IRange): number {
        let extra = 0;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (board[y][x] === 3) {
                    extra ++;
                }
            }
        }

        return extra;
    }

    private static solveOne(board: number[][], parent: IRange): number[][] {
        let previousExtra = null;
        let extra = this.countExtra(board, parent);
        while (extra !== previousExtra) {
            board = this.solveCycle(board, parent);

            previousExtra = extra;
            extra = this.countExtra(board, parent);
        }

        return board;
    }

    public static countSolutions(board: number[][], parent: IRange): number {
        let isSolved = true;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (board[y][x] === 0) {
                    return 0;
                } else if (board[y][x] === 3) {
                    isSolved = false;
                }
            }
        }

        if (isSolved) {
            if (parent.isCave) {
                CoralGenerator.typeCave();
                if (! CoralGenerator.checkCoral(board)) {
                    return 0;
                }
            }

            return 1;
        } else {
            return 2;
        }
    }

    private static findSplit(board: number[][], parent: IRange): number[] {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (board[y][x] === 3) {
                    return [x, y];
                }
            }
        }

        throw "RangeSolver->findSplit - CAN NOT FIND SPLIT";
    }

    private static splitSolve(board: number[][], parent: IRange): number[][] {
        board = this.solveOne(board, parent);

        let countSolutions = this.countSolutions(board, parent);
        if (countSolutions === 0) {
            return Utils.createArray2d(parent.width, parent.height, 0);
        } else if (countSolutions === 1) {
            return board;
        }

        let split = this.findSplit(board, parent);
        let boardTotal = Utils.createArray2d(parent.width, parent.height, 0);
        for (let add = 1; add <= 2; add++) {
            let board2 = Utils.deepcopyArray2d(board);
            board2[split[1]][split[0]] = add;

            let boardAdd = this.splitSolve(board2, parent);
            for (let y = 0; y < parent.height; y++) {
                for (let x = 0; x < parent.width; x++) {
                    boardTotal[y][x] |= boardAdd[y][x];
                }
            }

            let solutionCount = this.countSolutions(boardTotal, parent);
            if (solutionCount > 1) {
                return boardTotal;
            }
        }

        countSolutions = this.countSolutions(boardTotal, parent);
        if (countSolutions === 0) {
            return Utils.createArray2d(parent.width, parent.height, 0);
        }

        return boardTotal;
    }

    public static solve(inputBoard: number[][], parent: IRange): number[][] {
        let board = Utils.deepcopyArray2d(inputBoard);

        board = this.splitSolve(board, parent);

        return board;
    }
}