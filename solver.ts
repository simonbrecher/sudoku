class Solver {
    private static solveLineOneInSquare(board: number[][], parent: ISudoku): number[][] {
        let hasOneNumber = Utils.getHasOneNumber(board);
        for (let y = 0; y < parent.size; y++) {
            let rowOne = 0;
            for (let x = 0; x < parent.size; x++) {
                if (hasOneNumber[y][x]) {
                    rowOne |= board[y][x];
                }
            }
            let notRowOne = ~ rowOne;
            for (let x = 0; x < parent.size; x++) {
                if (! hasOneNumber[y][x]) {
                    board[y][x] &= notRowOne;
                }
            }
        }
        for (let x = 0; x < parent.size; x++) {
            let columnOne = 0;
            for (let y = 0; y < parent.size; y++) {
                if (hasOneNumber[y][x]) {
                    columnOne |= board[y][x];
                }
            }
            let notColumnOne = ~ columnOne;
            for (let y = 0; y < parent.size; y++) {
                if (! hasOneNumber[y][x]) {
                    board[y][x] &= notColumnOne;
                }
            }
        }

        return board;
    }

    private static solveLineOnlyInSquare(board: number[][], parent: ISudoku): number[][] {
        for (let y = 0; y < parent.size; y++) {
            let rowOne = 0;
            let rowMultiple = 0;
            for (let x = 0; x < parent.size; x++) {
                rowMultiple |= rowOne & board[y][x];
                rowOne |= board[y][x];
                rowOne &= ~ rowMultiple;
            }
            for (let x = 0; x < parent.size; x++) {
                if ((board[y][x] & rowOne) !== 0) {
                    board[y][x] &= rowOne;
                }
            }
        }
        for (let x = 0; x < parent.size; x++) {
            let columnOne = 0;
            let columnMultiple = 0;
            for (let y = 0; y < parent.size; y++) {
                columnMultiple |= columnOne & board[y][x];
                columnOne |= board[y][x];
                columnOne &= ~ columnMultiple;
            }
            for (let y = 0; y < parent.size; y++) {
                if ((board[y][x] & columnOne) !== 0) {
                    board[y][x] &= columnOne;
                }
            }
        }

        return board;
    }

    private static solveRectangleOneInSquare(board: number[][], parent: ISudoku): number[][] {
        if (parent.rectangleHeight === null || parent.rectangleWidth === null) {
            return board;
        }

        let hasOneNumber = Utils.getHasOneNumber(board);
        for (let rectangleY = 0; rectangleY < parent.size; rectangleY+=parent.rectangleHeight) {
            for (let rectangleX = 0; rectangleX < parent.size; rectangleX+=parent.rectangleWidth) {
                let rectangleOne = 0;
                for (let relativeY = 0; relativeY < parent.rectangleHeight; relativeY++) {
                    for (let relativeX = 0; relativeX < parent.rectangleWidth; relativeX++) {
                        if (hasOneNumber[rectangleY + relativeY][rectangleX + relativeX]) {
                            rectangleOne |= board[rectangleY + relativeY][rectangleX + relativeX];
                        }
                    }
                }
                let notRectangleOne = ~ rectangleOne;
                for (let relativeY = 0; relativeY < parent.rectangleHeight; relativeY++) {
                    for (let relativeX = 0; relativeX < parent.rectangleWidth; relativeX++) {
                        if (! hasOneNumber[rectangleY + relativeY][rectangleX + relativeX]) {
                            board[rectangleY + relativeY][rectangleX + relativeX] &= notRectangleOne;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveRectangleOnlyInSquare(board: number[][], parent: ISudoku): number[][] {
        if (parent.rectangleHeight === null || parent.rectangleWidth === null) {
            return board;
        }

        for (let rectangleY = 0; rectangleY < parent.size; rectangleY+=parent.rectangleHeight) {
            for (let rectangleX = 0; rectangleX < parent.size; rectangleX+=parent.rectangleWidth) {
                let rectangleOne = 0;
                let rectangleMultiple = 0;
                for (let relativeY = 0; relativeY < parent.rectangleHeight; relativeY++) {
                    for (let relativeX = 0; relativeX < parent.rectangleWidth; relativeX++) {
                        rectangleMultiple |= rectangleOne & board[rectangleY + relativeY][rectangleX + relativeX];
                        rectangleOne |= board[rectangleY + relativeY][rectangleX + relativeX];
                        rectangleOne &= ~ rectangleMultiple;
                    }
                }
                for (let relativeY = 0; relativeY < parent.rectangleHeight; relativeY++) {
                    for (let relativeX = 0; relativeX < parent.rectangleWidth; relativeX++) {
                        if ((board[rectangleY + relativeY][rectangleX + relativeX] & rectangleOne) !== 0) {
                            board[rectangleY + relativeY][rectangleX + relativeX] &= rectangleOne;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveDiagonalOneInSquare(board: number[][], parent: ISudoku): number[][] {
        let hasOneNumber = [];
        let diagonalOne = 0;
        for (let i = 0; i < parent.size; i++) {
            hasOneNumber.push(Utils.countBits32(board[i][i]) === 1);
            if (hasOneNumber[i]) {
                diagonalOne |= board[i][i];
            }
        }
        let notDiagonalOne = ~ diagonalOne;
        for (let i = 0; i < parent.size; i++) {
            if (! hasOneNumber[i]) {
                board[i][i] &= notDiagonalOne;
            }
        }

        hasOneNumber = [];
        diagonalOne = 0;
        for (let i = 0; i < parent.size; i++) {
            hasOneNumber.push(Utils.countBits32(board[i][parent.size - i - 1]) === 1);
            if (hasOneNumber[i]) {
                diagonalOne |= board[i][parent.size - i - 1];
            }
        }
        notDiagonalOne = ~ diagonalOne;
        for (let i = 0; i < parent.size; i++) {
            if (! hasOneNumber[i]) {
                board[i][parent.size - i - 1] &= notDiagonalOne;
            }
        }

        return board;
    }

    private static solveDiagonalOnlyInSquare(board: number[][], parent: ISudoku): number[][] {


        return board;
    }

    private static solveCycle(board: number[][], parent: ISudoku): number[][] {
        board = this.solveLineOneInSquare(board, parent);
        board = this.solveLineOnlyInSquare(board, parent);
        if (parent.isRectangular) {
            board = this.solveRectangleOneInSquare(board, parent);
            board = this.solveRectangleOnlyInSquare(board, parent);
        }
        if (parent.isDiagonal) {
            board = this.solveDiagonalOneInSquare(board, parent);
            board = this.solveDiagonalOnlyInSquare(board, parent);
        }

        return board;
    }

    public static solve(board: number[][], parent: ISudoku): number[][] {
        console.log("SOLVER");

        let lastExtraNum = -1;
        let extraNum = Utils.getExtraNum(board);
        while (lastExtraNum !== extraNum) {
            lastExtraNum = extraNum;
            board = this.solveCycle(board, parent);

            extraNum = Utils.getExtraNum(board);
            console.log(lastExtraNum, extraNum);
        }

        return board;
    }

    public static checkSolution(board: number[][], parent: ISudoku): boolean {
        return Utils.getPrompterNum(board) === parent.size * parent.size;
    }

    public static countSolutions(board: number[][], parent: ISudoku): number {
        return 0; // @todo
    }
}