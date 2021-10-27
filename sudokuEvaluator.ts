class SudokuEvaluator {
    private static solveFreeCycle(board: number[][], parent: ISudoku): number[][] {
        if (parent.rectangleHeight === null || parent.rectangleWidth === null) {
            return board;
        }

        let blockOneNumbers = Utils.getEmptyArray2d(3, parent.size); // row, column, rectangle
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                blockOneNumbers[0][y] |= board[y][x];
                blockOneNumbers[1][x] |= board[y][x];
                let index = Math.floor(y / parent.rectangleHeight) * parent.rectangleHeight + Math.floor(x / parent.rectangleWidth);
                blockOneNumbers[2][index] |= board[y][x];
            }
        }

        let isBlockOneTwo = [];
        for (let block = 0; block < 3; block++) { // row, column, rectangle
            let blockArray = [];
            for (let position = 0; position < parent.size; position++) {
                let blockNumbersCount = Utils.countBits32(blockOneNumbers[block][position]);
                blockArray.push(blockNumbersCount === parent.size - 1 || blockNumbersCount === parent.size - 2);
            }
            isBlockOneTwo.push(blockArray);
        }

        for (let block = 0; block < 3; block++) {
            for (let y = 0; y < parent.size; y++) {
                for (let x = 0; x < parent.size; x++) {
                    if (board[y][x] === 0) {
                        let index = Math.floor(y / parent.rectangleHeight) * parent.rectangleHeight + Math.floor(x / parent.rectangleWidth);
                        if (isBlockOneTwo[0][y] || isBlockOneTwo[1][x] || isBlockOneTwo[2][index]) {
                            let inBlocks = blockOneNumbers[0][y] | blockOneNumbers[1][x] | blockOneNumbers[2][index];
                            let square = (1 << parent.size) - 1 & ~ inBlocks;
                            let squareBitCount = Utils.countBits32(square);
                            if (squareBitCount === 0) {
                                throw "SudokuEvaluator->solveFreeCycle - 0";
                            } else if (squareBitCount === 1) {
                                board[y][x] = square;
                            }
                        }
                    }
                }
            }
        }

        return board;
    }

    private static getPrompterNum(board: number[][], parent: ISudoku): number {
        let total = 0;
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (board[y][x] !== 0) {
                    total ++;
                }
            }
        }

        return total;
    }

    private static solveFree(board: number[][], parent: ISudoku): number[][] {
        let lastExtraNum = -1;
        let extraNum = Utils.getExtraNum(board);

        // Renderer.zeroSymbol = " ";
        // Renderer.render(board, parent, null, "red");
        // Renderer.zeroSymbol = "?";

        while (lastExtraNum !== extraNum) {
            lastExtraNum = extraNum;
            board = this.solveFreeCycle(board, parent);

            extraNum = this.getPrompterNum(board, parent);

            // Renderer.zeroSymbol = " ";
            // Renderer.render(board, parent, null, "red");
            // Renderer.zeroSymbol = "?";
        }

        return board;
    }

    private static solveExpensive(board: number[][], parent: ISudoku): [number[][], number] {
        let solved = this.convertBoardToZeros(Solver.solveCycleEvaluate(this.convertBoardFromZeros(board, parent), parent), parent);

        let possible = []; // [x, y, number][]
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (board[y][x] === 0 && solved[y][x] !== 0) {
                    possible.push([x, y, solved[y][x]]);
                }
            }
        }

        if (possible.length === 0) {
            throw "SudoukuEvaluator->solveExpensive - CAN NOT SOLVE ANYTHING"
        }

        let point = 1 / possible.length;

        let randomNumber = Math.floor(Math.random() * possible.length);
        let x, y, number;
        [x, y, number] = possible[randomNumber];

        board[y][x] = number;

        return [board, point];
    }

    private static solve(board: number[][], parent: ISudoku): number {
        let points = 0;
        while (this.getPrompterNum(board, parent) !== parent.size * parent.size) {
            board = this.solveFree(board, parent);

            if (this.getPrompterNum(board, parent) === parent.size * parent.size) {
                return points;
            }

            let point;
            [board, point] = this.solveExpensive(board, parent);
            points += point;
        }

        return points;
    }

    private static convertBoardToZeros(inputBoard: number[][], parent: ISudoku): number[][] {
        let board = [];
        for (let y = 0; y < parent.size; y++) {
            let row = [];
            for (let x = 0; x < parent.size; x++) {
                if (Utils.countBits32(inputBoard[y][x]) === 1) {
                    row.push(inputBoard[y][x]);
                } else {
                    row.push(0);
                }
            }
            board.push(row);
        }

        return board;
    }

    private static convertBoardFromZeros(inputBoard: number[][], parent: ISudoku): number[][] {
        let board = [];
        for (let y = 0; y < parent.size; y++) {
            let row = [];
            for (let x = 0; x < parent.size; x++) {
                if (Utils.countBits32(inputBoard[y][x]) === 1) {
                    row.push(inputBoard[y][x]);
                } else {
                    row.push((1 << parent.size) - 1);
                }
            }
            board.push(row);
        }

        return board;
    }

    public static evaluate(inputBoard: number[][], parent: ISudoku, tries: number = 1): number {
        if (! parent.isRectangular || parent.isDiagonal || parent.isVX || parent.isKropki || parent.isABC) {
            throw "SudokuEvaluator->evaluate - CAN NOT EVALUATE VARIATIONS";
        }

        let totalPoints = 0;
        for (let i = 0; i < tries; i++) {
            let board = this.convertBoardToZeros(inputBoard, parent);
            let points = this.solve(board, parent);
            totalPoints += points;
        }

        return totalPoints / tries;
    }

    public static build(minPoints: number, maxPoints: number, tries: number): [ISudoku, number] {
        let points = -1;
        let sudoku;

        console.log("Difficulty: " + minPoints + " - " + maxPoints);
        while (points < minPoints || points > maxPoints || ! sudoku) {
            console.log("tries");
            sudoku = SudokuBuilder.build();

            if (sudoku !== null) {
                for (let i = 1; i <= tries; i*=2) {
                    points = SudokuEvaluator.evaluate(sudoku.task, sudoku, i);
                    if (points < minPoints || points > maxPoints) {
                        break;
                    }
                }
            }
        }
        console.log(points);

        return [sudoku, points];
    }
}