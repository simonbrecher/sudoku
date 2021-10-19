class Solver {
    private static solveLineOneInSquare(board: number[][], parent: ISudoku): number[][] {
        let hasOneNumber = Utils.getHasOneBit(board);
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

        let hasOneNumber = Utils.getHasOneBit(board);
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
        let diagonalOne = 0;
        let diagonalMultiple = 0;
        for (let i = 0; i < parent.size; i++) {
            diagonalMultiple |= diagonalOne & board[i][i];
            diagonalOne |= board[i][i];
            diagonalOne &= ~ diagonalMultiple;
        }
        for (let i = 0; i < parent.size; i++) {
            if ((board[i][i] & diagonalOne) !== 0) {
                board[i][i] &= diagonalOne;
            }
        }

        diagonalOne = 0;
        diagonalMultiple = 0;
        for (let i = 0; i < parent.size; i++) {
            diagonalMultiple |= diagonalOne & board[i][parent.size - i - 1];
            diagonalOne |= board[i][parent.size - i - 1];
            diagonalOne &= ~ diagonalMultiple;
        }
        for (let i = 0; i < parent.size; i++) {
            if ((board[i][parent.size - i - 1] & diagonalOne) !== 0) {
                board[i][parent.size - i - 1] &= diagonalOne;
            }
        }

        return board;
    }

    private static solveVxInSumOne(first: number, second: number, sum: number): number {
        return first & (Utils.reverseBits32(second) >>> 32 - sum + 1);
    }

    private static solveVxInSum(board: number[][], parent: ISudoku): number[][] {
        let solutionValues = Utils.getSolutionValues(parent.solution);
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size - 1; x++) {
                let sum = solutionValues[y][x] + solutionValues[y][x + 1];
                if (parent.getVxSumName(sum) !== null) {
                    board[y][x] = this.solveVxInSumOne(board[y][x], board[y][x + 1], sum);
                    board[y][x + 1] = this.solveVxInSumOne(board[y][x + 1], board[y][x], sum);
                    if ((sum & 1) !== 1) {
                        board[y][x] &= ~ (1 << sum / 2 - 1);
                        board[y][x + 1] &= ~ (1 << sum / 2 - 1);
                    }
                }
            }
        }
        for (let y = 0; y < parent.size - 1; y++) {
            for (let x = 0; x < parent.size; x++) {
                let sum = solutionValues[y][x] + solutionValues[y + 1][x];
                if (parent.getVxSumName(sum) !== null) {
                    board[y][x] = this.solveVxInSumOne(board[y][x], board[y + 1][x], sum);
                    board[y + 1][x] = this.solveVxInSumOne(board[y + 1][x], board[y][x], sum);
                    if ((sum & 1) !== 1) {
                        board[y][x] &= ~ (1 << sum / 2 - 1);
                        board[y + 1][x] &= ~ (1 << sum / 2 - 1);
                    }
                }
            }
        }

        return board;
    }

    public static solveVxOutSum(board: number[][], parent: ISudoku): number[][] {
        let solutionValues = Utils.getSolutionValues(parent.solution);
        let hasOneBit = Utils.getHasOneBit(board);
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size - 1; x++) {
                let sum = solutionValues[y][x] + solutionValues[y][x + 1];
                if (parent.getVxSumName(sum) === null) {
                    if (hasOneBit[y][x]) {
                        let sums = parent.getVxSumValues();
                        for (let i = 0; i < sums.length; i++) {
                            board[y][x + 1] &= ~ (1 << sums[i] - solutionValues[y][x] - 1);
                        }
                    }
                    if (hasOneBit[y][x + 1]) {
                        let sums = parent.getVxSumValues();
                        for (let i = 0; i < sums.length; i++) {
                            board[y][x] &= ~ (1 << sums[i] - solutionValues[y][x + 1] - 1);
                        }
                    }
                }
            }
        }

        return board;
    }

    public static solveCycle(board: number[][], parent: ISudoku): number[][] {
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
        if (parent.isVX && parent.hasSolution) {
            let then = Utils.getExtraNum(board);
            board = this.solveVxInSum(board, parent);
            board = this.solveVxOutSum(board, parent);
            let now = Utils.getExtraNum(board);
            // console.log(now, then);
        }

        return board;
    }

    public static solve(inputBoard: number[][], parent: ISudoku): number[][] {
        let board = Utils.deepcopyBoard(inputBoard);

        let lastExtraNum = -1;
        let extraNum = Utils.getExtraNum(board);
        while (lastExtraNum !== extraNum) {
            lastExtraNum = extraNum;
            board = this.solveCycle(board, parent);

            extraNum = Utils.getExtraNum(board);
        }

        return board;
    }

    public static checkSolution(board: number[][], parent: ISudoku): boolean {
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (Utils.countBits32(board[y][x]) !== 1) {
                    return false;
                }
            }
        }
        for (let y = 0; y < parent.size; y++) {
            let row = 0;
            for (let x = 0; x < parent.size; x++) {
                row |= board[y][x];
            }
            if (row !== (1 << parent.size) - 1) {
                return false;
            }
        }
        for (let x = 0; x < parent.size; x++) {
            let column = 0;
            for (let y = 0; y < parent.size; y++) {
                column |= board[y][x];
            }
            if (column !== (1 << parent.size) - 1) {
                return false;
            }
        }
        if (parent.isRectangular && parent.rectangleHeight !== null && parent.rectangleWidth !== null) {
            for (let squareY = 0; squareY < parent.size; squareY+=parent.rectangleHeight) {
                for (let squareX = 0; squareX < parent.size; squareX+=parent.rectangleWidth) {
                    let rectangle = 0;
                    for (let relativeY = 0; relativeY < parent.rectangleHeight; relativeY++) {
                        for (let relativeX = 0; relativeX < parent.rectangleWidth; relativeX++) {
                            rectangle |= board[squareY + relativeY][squareX + relativeX];
                        }
                    }
                    if (rectangle !== (1 << parent.size) - 1) {
                        return false;
                    }
                }
            }
        }
        if (parent.isDiagonal) {
            let diagonal = 0;
            for (let i = 0; i < parent.size; i++) {
                diagonal |= board[i][i];
            }
            if (diagonal !== (1 << parent.size) - 1) {
                return false;
            }
            diagonal = 0;
            for (let i = 0; i < parent.size; i++) {
                diagonal |= board[i][parent.size - i - 1];
            }
            if (diagonal !== (1 << parent.size) - 1) {
                return false;
            }
        }
        return true;
    }

    public static countSolutions(board: number[][], parent: ISudoku): number {
        let hasMultipleBits = false;
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                let bits = Utils.countBits32(board[y][x]);
                if (bits === 0) {
                    return 0;
                } else if (bits !== 1) {
                    hasMultipleBits = true;
                }
            }
        }
        if (hasMultipleBits) {
            return 2;
        } else {
            return 1;
        }
    }
}