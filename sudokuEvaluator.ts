/**
 * Class used for determining difficulty of (only 3x3 classic) sudoku.task
 * !! IT MUST BE SOLVABLE BY Solver.solve() (You should call method Sudokubuilder.build(), or check with Solver.countSolutions() === 1 )
 *
 * Unlike Solver.solve() (or the Sudoku class itself), it does not save, which numbers can be in each square.
 * It only remembers the number, if there can be only a single number in a square, otherwise it thinks that any number can be there.
 *
 * It evaluates Sudoku difficulty by a number (higher = harder)
 *
 * For adding number to block, where there are 1 or 2 unknown squares, it is given 0 difficulty points.
 * If no block has 1 or 2 squares are present, it calls Solver.solveEvaluator() to adds squares which can be solved with 1 rule.
 * It then fills (only) one square from solved squares and gives 1/n difficulty points. (n = number of solvable squares)
 *
 * For allowing as little given digits as possible (around 21-24)
 * Difficulty 2 = easy
 * Difficulty 8 = hard
 * It might take long time to create sudoku with difficulty outside this range.
 *
 * Three people solved same sudokus with specific difficulties (average of 100 evaluations) on time:
 *
 *  Difficulty:                                             Average:
 *      1.5:            5:13        3:34        6:37        5:08
 *      2.2:            6:28        5:23        7:29        6:26
 *      3.6:            6:03        5:30        7:06        6:13
 *      5.6:            13:15       9:57        10:45       11:19
 *      8.4:            8:35        9:25        14:10       10:43
 *      11.2:           13:30       14:55       13:13       13:52
 *
 * Note: Everybody solved all sudokus at once, first the easies and last harders. Everybody had no warm-up sudoku solving before.
 *
 * Thanks Filip Brecher and Benjamin Verner for helping with evaluating difficulties (as humans).
 */
class SudokuEvaluator {
    /**
     * If number can be filled in and it is in block with 1 or 2 spaces, it is filled and no difficulty points are given for this.
     *
     * It first counts, which numbers can be in each block. (row/column/square)
     * Then it counts, which blocks have 1 or 2 spaces.
     * Then it looks at all squares and checks, which squares are in blocks, with all but one number.
     * If only one number is missing from the 3 blocks, it must be on this square. -> Fills it.
     *
     * But here it must check, if only one or more numbers are missing from all of the 3 blocks, that a square is in.
     */
    private static solveFreeCycle(board: number[][], parent: ISudoku): number[][] {
        if (parent.rectangleHeight === null || parent.rectangleWidth === null) {
            return board;
        }

        /**
         * find which numbers are already be in each row/column/rectangle
         * dimensions: 3 x sudoku.size
         */
        let blockOneNumbers = Utils.getEmptyArray2d(3, parent.size); // row, column, rectangle
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                blockOneNumbers[0][y] |= board[y][x]; // number in row with coordinate y
                blockOneNumbers[1][x] |= board[y][x]; // number in column with coordinate x
                let index = Math.floor(y / parent.rectangleHeight) * parent.rectangleHeight + Math.floor(x / parent.rectangleWidth);
                blockOneNumbers[2][index] |= board[y][x]; // number in rectangle with coordinates ~ index
            }
        }

        let isBlockOneTwo = []; // if in this block are 1/2 spaces
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
                        if (isBlockOneTwo[0][y] || isBlockOneTwo[1][x] || isBlockOneTwo[2][index]) { // this square is in block with 1/2 spaces
                            let inBlocks = blockOneNumbers[0][y] | blockOneNumbers[1][x] | blockOneNumbers[2][index]; // all numbers from all blocks
                            let square = (1 << parent.size) - 1 & ~ inBlocks; // remove from square all numbers, which are in squares in same block
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

    /**
     * Count number of known digits.
     */
    private static getGivenDigitCount(board: number[][], parent: ISudoku): number {
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

    /**
     * Call SudokuEvaluator.solveFreeCycle(), until it no longer can change anything.
     */
    private static solveFree(board: number[][], parent: ISudoku): number[][] {
        let lastExtraNum = -1;
        let extraNum = Utils.getExtraDigitsCount(board);

        while (lastExtraNum !== extraNum) {
            lastExtraNum = extraNum;
            board = this.solveFreeCycle(board, parent);

            extraNum = this.getGivenDigitCount(board, parent);
        }

        return board;
    }

    /**
     * Apply rules, that give difficulty points.
     *
     * Call Solver.solveCycleEvaluate() and save output as different array.
     * Solver.solveCycleEvaluate fills squares, which can be solved in 1 rule.
     *
     * Then count how many squares were filled.
     */
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

    /**
     * Evaluate difficulty and give difficulty points. (average of 1)
     */
    private static solve(board: number[][], parent: ISudoku): number {
        let points = 0;
        while (this.getGivenDigitCount(board, parent) !== parent.size * parent.size) {
            board = this.solveFree(board, parent);

            if (this.getGivenDigitCount(board, parent) === parent.size * parent.size) {
                return points;
            }

            let point;
            [board, point] = this.solveExpensive(board, parent);
            points += point;
        }

        return points;
    }

    /**
     * Instead of binary representations of squares, which can have multiple numbers, there will be 0.
     * @param inputBoard        2d array of binary representations of squares
     * @param parent            Sudoku object
     * @return                  inputBoard, but squares with multiple possible numbers will be represented as 0
     */
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

    /**
     * Instead of zeros, there will be binary representations of squares, where can be all numbers
     * @param inputBoard        2d array of binary representations of squares, but 0 represents squares with all possible numbers
     * @param parent            Sudoku object
     * @return                  2d array of binary representations of squares in standard representation
     */
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

    /**
     * Give sudoku difficulty points. (higher = harder)
     *
     * It will evaluate the sudoku multiple tries and average the result.
     *
     * @param inputBoard    sudoku.task
     * @param parent        sudoku object
     * @param tries         Maximal number of tries
     */
    public static evaluate(inputBoard: number[][], parent: ISudoku, tries: number = 1): number {
        if (! parent.isRectangular || parent.isDiagonal || parent.isVX || parent.isKropki || parent.isABC) {
            throw "SudokuEvaluator->evaluate - CAN NOT EVALUATE VARIANTS";
        }

        let totalPoints = 0;
        for (let i = 0; i < tries; i++) {
            let board = this.convertBoardToZeros(inputBoard, parent);
            let points = this.solve(board, parent);
            totalPoints += points;
        }

        return totalPoints / tries;
    }

    /**
     * Create sudoku with minimal and maximal difficulty.
     *
     * It repeatedly creates sudokus, and returns sudoku, which satisfies difficulty requirements.
     *
     * After creating sudoku, first evaluate it only once. If it does not satisfy difficulty requirements, start from beginning.
     * Repeatedly multiply number of evaluating by 2, until it reaches limit. If sudoku does not satisfy required difficulty start from beginning.
     * (It is faster than start by evaluating the maximal number of times from beginning.)
     *
     * @param minPoints     Minimal required difficulty points
     * @param maxPoints     Maximal required difficulty points
     * @param tries         Maximal number of tries (difficulty is averaged)
     * @return              Sudoku object
     */
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