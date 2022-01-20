class DominoSolver {
    private static solveDirections(board: number[][][], parent: IDomino): number[][][] {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                let valueLeft = x === 0 ? 1 : board[y][x - 1][0];
                let valueRight = x === parent.width - 1 ? 1 : board[y][x][0];
                let valueTop = y === 0 ? 1 : board[y - 1][x][1];
                let valueBottom = y === parent.height - 1 ? 1 : board[y][x][1];

                if (x !== 0) {
                    if (valueRight === 1 && valueTop === 1 && valueBottom === 1) {
                        board[y][x - 1][0] &= 2;
                    }
                    if (valueRight === 2 || valueTop === 2 || valueBottom === 2) {
                        board[y][x - 1][0] &= 1;
                    }
                }
                if (x !== parent.width - 1) {
                    if (valueLeft === 1 && valueTop === 1 && valueBottom === 1) {
                        board[y][x][0] &= 2;
                    }
                    if (valueLeft === 2 || valueTop === 2 || valueBottom === 2) {
                        board[y][x][0] &= 1;
                    }
                }
                if (y !== 0) {
                    if (valueLeft === 1 && valueRight === 1 && valueBottom === 1) {
                        board[y - 1][x][1] &= 2;
                    }
                    if (valueLeft === 2 || valueRight === 2 || valueBottom === 2) {
                        board[y - 1][x][1] &= 1;
                    }
                }
                if (y !== parent.height - 1) {
                    if (valueLeft === 1 && valueRight === 1 && valueTop === 1) {
                        board[y][x][1] &= 2;
                    }
                    if (valueLeft === 2 || valueRight === 2 || valueTop === 2) {
                        board[y][x][1] &= 1;
                    }
                }
            }
        }

        return board;
    }

    private static getDominoIndex(value1: number, value2: number, parent: IDomino): number {
        let a = Math.min(value1, value2);
        let b = Math.max(value1, value2);
        let line = (parent.size - 1) - (b - a);
        return Math.floor(line * (line + 1) / 2 + a);
    }

    private static solveOnly(board: number[][][], parent: IDomino): number[][][] {
        let dominoCount = [];
        for (let i = 0; i < Math.floor(parent.size * (parent.size + 1) / 2); i++) {
            dominoCount.push(0);
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x !== parent.width - 1) {
                    if ((board[y][x][0] & 2) !== 0) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y][x + 1], parent);
                        dominoCount[index] ++;
                    }
                }
                if (y !== parent.height - 1) {
                    if ((board[y][x][1] & 2) !== 0) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y + 1][x], parent);
                        dominoCount[index] ++;
                    }
                }
            }
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x !== parent.width - 1) {
                    if ((board[y][x][0] & 2) !== 0) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y][x + 1], parent);
                        if (dominoCount[index] === 1) {
                            board[y][x][0] &= 2;
                        }
                    }
                }
                if (y !== parent.height - 1) {
                    if ((board[y][x][1] & 2) !== 0) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y + 1][x], parent);
                        if (dominoCount[index] === 1) {
                            board[y][x][1] &= 2;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveAlready(board: number[][][], parent: IDomino): number[][][] {
        let dominoCount = [];
        for (let i = 0; i < Math.floor(parent.size * (parent.size + 1) / 2); i++) {
            dominoCount.push(0);
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x !== parent.width - 1) {
                    if (board[y][x][0] === 2) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y][x + 1], parent);
                        dominoCount[index] ++;
                    }
                }
                if (y !== parent.height - 1) {
                    if (board[y][x][1] === 2) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y + 1][x], parent);
                        dominoCount[index] ++;
                    }
                }
            }
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x !== parent.width - 1) {
                    if (board[y][x][0] === 3) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y][x + 1], parent);
                        if (dominoCount[index] > 0) {
                            board[y][x][0] &= 1;
                        }
                    }
                }
                if (y !== parent.height - 1) {
                    if (board[y][x][1] === 3) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y + 1][x], parent);
                        if (dominoCount[index] > 0) {
                            board[y][x][1] &= 1;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveCycle(board: number[][][], parent: IDomino): number[][][] {
        // parent.render(board, true);
        board = this.solveDirections(board, parent);
        // parent.render(board, true);
        board = this.solveOnly(board, parent);
        // parent.render(board, true);
        board = this.solveAlready(board, parent);
        // parent.render(board, true);

        return board;
    }

    private static countExtra(board: number[][][], parent: IDomino): number {
        let extra = 0;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x !== parent.width - 1) {
                    extra += Utils.countBits32(board[y][x][0]);
                }
                if (y !== parent.height - 1) {
                    extra += Utils.countBits32(board[y][x][1]);
                }
            }
        }

        return extra;
    }

    private static checkIsCorrect(board: number[][][], parent: IDomino): boolean {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                let openCount = 0;
                if (x !== 0) {
                    if (board[y][x - 1][0] === 2) {
                        openCount ++;
                    }
                }
                if (x !== parent.width - 1) {
                    if (board[y][x][0] === 2) {
                        openCount ++;
                    }
                }
                if (y !== 0) {
                    if (board[y - 1][x][1] === 2) {
                        openCount ++;
                    }
                }
                if (y !== parent.height - 1) {
                    if (board[y][x][1] === 2) {
                        openCount ++;
                    }
                }
                if (openCount !== 1) {
                    return false;
                }
            }
        }

        let already = [];
        for (let i = 0; i < Math.floor(parent.size * (parent.size + 1) / 2); i++) {
            already.push(false);
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x !== parent.width - 1) {
                    if (board[y][x][0] === 2) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y][x + 1], parent);
                        if (already[index]) {
                            return false;
                        }
                        already[index] = true;
                    }
                }
                if (y !== parent.height - 1) {
                    if (board[y][x][1] === 2) {
                        let index = this.getDominoIndex(parent.task[y][x], parent.task[y + 1][x], parent);
                        if (already[index]) {
                            return false;
                        }
                        already[index] = true;
                    }
                }
            }
        }

        for (let i = 0; i < already.length; i++) {
            if (! already[i]) {
                return false;
            }
        }

        return true;
    }

    public static countSolutions(board: number[][][], parent: IDomino): number {
        let isSolved = true;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x !== parent.width - 1) {
                    if (board[y][x][0] === 0) {
                        return 0;
                    } else if (board[y][x][0] === 3) {
                        isSolved = false;
                    }
                }
                if (y !== parent.height - 1) {
                    if (board[y][x][1] === 0) {
                        return 0;
                    } else if (board[y][x][1] === 3) {
                        isSolved = false;
                    }
                }
            }
        }

        if (isSolved) {
            if (! this.checkIsCorrect(board, parent)) {
                return 0;
            }

            return 1;
        } else {
            return 2;
        }
    }

    private static solveOne(inputBoard: number[][][], parent: IDomino): number[][][] {
        let board = Utils.deepcopy(inputBoard);

        let previousExtra = null;
        let extra = this.countExtra(board, parent);
        while (extra !== previousExtra) {
            board = this.solveCycle(board, parent);

            previousExtra = extra;
            extra = this.countExtra(board, parent);
        }

        return board;
    }

    private static findSplit(board: number[][][], parent: IDomino): number[] {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.height; x++) {
                if (x !== parent.width - 1) {
                    if (board[y][x][0] === 3) {
                        return [x, y, 0];
                    }
                }
                if (y !== parent.height - 1) {
                    if (board[y][x][1] === 3) {
                        return [x, y, 1];
                    }
                }
            }
        }

        throw "DominoSolver->findSplit - NO SPLIT FOUND";
    }

    private static splitSolve(board: number[][][], parent: IDomino): number[][][] {

        // Renderer.breakLineForce();
        //
        // parent.render(board, true);

        let solved = this.solveOne(board, parent);

        // parent.render(solved, true);


        let solutionCount = this.countSolutions(solved, parent);

        if (solutionCount === 0) {
            // console.log("RETURN 0");
            return Utils.createArray3d(parent.width, parent.height, 2, 0);
        } else if (solutionCount === 1) {
            // console.log("RETURN 1");
            return solved;
        }

        let splitX, splitY, splitDir;
        [splitX, splitY, splitDir] = this.findSplit(board, parent);

        let boardTotal = Utils.createArray3d(parent.width, parent.height, 2, 0);
        for (let add = 1; add <= 2; add++) {
            let board2 = Utils.deepcopy(solved);
            board2[splitY][splitX][splitDir] &= add;

            board2 = this.splitSolve(board2, parent);

            for (let y = 0; y < parent.height; y++) {
                for (let x = 0; x < parent.width; x++) {
                    for (let dir = 0; dir < 2; dir++) {
                        boardTotal[y][x][dir] |= board2[y][x][dir];
                    }
                }
            }

            let solutionCount = this.countSolutions(boardTotal, parent);

            if (solutionCount > 1) {
                // console.log("RETURN 2");
                return boardTotal;
            }
        }

        // console.log("RETURN NORMAL");
        return boardTotal;
    }

    public static solve(inputBoard: number[][][], parent: IDomino): number[][][] {
        let board = Utils.deepcopy(inputBoard);

        // parent.render(parent.solution, true);

        return this.splitSolve(board, parent);
    }
}