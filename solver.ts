/**
 * Class for solving sudoku puzzles.
 *
 * It uses strategy, where it writes in all squares all numbers, that can be there.
 * After that it repeats removing those numbers by some simple rules.
 * If it can not get to solved state, before being unable to change anything, it determines the puzzle unsolvable.
 *
 * Square = the small stuff with one number ( or letter/space) ; Rectangle = an area where every number must be exactly once
 *
 * Binary representation of square: int32
 *      While sudoku is being solved, one int32 is used to save which numbers can be in one square.
 *      Solver uses this and determines when numbers can not be there.
 *      The lowest number in sudoku (1) is on the least bit.
 *      1 = this number can be on this square
 *      0 = this number can not be on this square
 *
 *      0b111111111 = all numbers from 1 to 9 can be on this square (empty square in sudoku 3x3)
 *      0b001000000 = only number 7 can be on this square (could be given digits or we solved this square)
 *      0b001010000 = on this square is 5 or 7.
 *      0b000000000 = error
 *
 * Main method of this class is Solver.solve(). This method solves a sudoku as much as possible.
 */
class Solver {
    /**
     * Can be used to turn on viewing more information about solving.
     * At this moment true = It will Renderer.render() all states while solving abc.
     */
    public static print = false;

    //          ABC

    /**
     * Gen binary representation of first visible number on side of abc
     * @param dir           0: row from left, 1: row from right, 2: column from top, 3: column from bottom
     * @param position      x/y coordinate of row/column
     * @param task          sudoku.task (the abc version)
     */
    public static getAbcFirstValue(dir: number, position: number, task: number[][]): number {
        return task[dir][position];
    }

    /**
     * Get binary representation of first visible number on the other side of abc
     * @param dir           0: row from left, 1: row from right, 2: column from top, 3: column from bottom
     * @param position      x/y coordinate of row/column
     * @param task          sudoku.task (the abc version)
     */
    public static getAbcLastValue(dir: number, position: number, task: number[][]): number {
        return task[dir ^ 1][position];
    }

    /**
     * Get binary representation of all numbers that are not on first or last visible on any side in row/column
     * @param dir           0: row from left, 1: row from right, 2: column from top, 3: column from bottom
     * @param position      x/y coordinate of row/column
     * @param task          sudoku.task (the abc version)
     */
    public static getAbcMiddleValue(dir: number, position: number, task: number[][], parent: ISudoku): number {
        if (parent.abcCount === null) {
            throw "Utils->getAbcMiddle - parent.abcNumber === null";
        }
        return (1 << parent.abcCount + 1) - 2 & ~ this.getAbcFirstValue(dir, position, task) & ~ this.getAbcLastValue(dir, position, task);
    }

    /**
     * Get data for iterating all squares in one row/column in a specific direction.
     * @param dir           0: row from left, 1: row from right, 2: column from top, 3: column from bottom
     * @param position      x/y coordinate of row/column
     * @return              [[xStart, yStart][xMove, yMove]]
     * if i is order of square in row/column then:
     *      x = xStart + xMove * i
     *      y = yStart + yMove * i
     */
    public static getAbcDirection(dir: number, position: number, parent: ISudoku): number[][] {
        switch (dir) {
            case 0:
                return [[0, position], [1, 0]];
            case 1:
                return [[parent.size - 1, position], [-1, 0]];
            case 2:
                return [[position, 0], [0, 1]];
            case 3:
                return [[position, parent.size - 1], [0, -1]];
            default:
                throw "Utils->getAbcDirection - WRONG DIRECTION ID";
        }
    }

    /**
     * If there can be only one value in square, it can not be anywhere else in row or column.
     */
    private static solveAbcOneInSquare(board: number[][], parent: ISudoku): number[][] {
        if (parent.abcSpaceCount === null) {
            return board;
        }
        let hasOneNumber = Utils.getHasOneBit(board);
        for (let y = 0; y < parent.size; y++) {
            let rowOne = 0;
            let spaceCount = 0;
            for (let x = 0; x < parent.size; x++) {
                // console.log(board, y, x);
                if (board[y][x] === 1) {
                    spaceCount ++;
                } else if (hasOneNumber[y][x]) {
                    rowOne |= board[y][x];
                }
            }
            let notRemove = (spaceCount < parent.abcSpaceCount) ? (~ rowOne) : (~ (rowOne | 1));
            for (let x = 0; x < parent.size; x++) {
                if (! hasOneNumber[y][x]) {
                    board[y][x] &= notRemove;
                }
            }
        }
        hasOneNumber = Utils.getHasOneBit(board);
        for (let x = 0; x < parent.size; x++) {
            let columnOne = 0;
            let spaceCount = 0;
            for (let y = 0; y < parent.size; y++) {
                if (board[y][x] === 1) {
                    spaceCount ++;
                } else if (hasOneNumber[y][x]) {
                    columnOne |= board[y][x];
                }
            }
            let notRemove = (spaceCount < parent.abcSpaceCount) ? (~ columnOne) : (~ (columnOne | 1));
            for (let y = 0; y < parent.size; y++) {
                if (! hasOneNumber[y][x]) {
                    board[y][x] &= notRemove;
                }
            }
        }

        return board;
    }

    /**
     * If a value can be only in one square from all squares in row or column (for spaces it is multiple times),
     * in that square there can not be anything else.
     */
    private static solveAbcOnlyInSquare(board: number[][], parent: ISudoku): number[][] {
        for (let y = 0; y < parent.size; y++) {
            let rowOne = 0;
            let rowMultiple = 0;
            for (let x = 0; x < parent.size; x++) {
                rowMultiple |= rowOne & board[y][x];
                rowOne |= board[y][x];
                rowOne &= ~ rowMultiple;
            }
            rowOne &= ~ 1;
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
            columnOne &= ~ 1;
            for (let y = 0; y < parent.size; y++) {
                if ((board[y][x] & columnOne) !== 0) {
                    board[y][x] &= columnOne;
                }
            }
        }

        return board;
    }

    /**
     * Rule that solves row/column with known first and last visible letters as much as possible.
     * Lets assume that digit "A" is prompter on one side and letter "D" is prompter on other side.
     *
     * Go trough the whole line.
     * Until there can be "A" on a square, there can not be anything else than "A" and "-".
     * Now count until you meet at least one square, where can be "B" and one square where can be "C" and two squares where can be either.
     *      There can not be "C".
     * (This is how this rule works. You do not have to check, that only C is at the end last square, because we call this from all 4 directions.)
     *
     * Examples:
     * A: [-ABC][-ABC][-ABC][-ABC] :C -> [-A][-AB][-ABC][-ABC] -> (now from C to A) -> [-A][-AB][-BC][-C]
     * A: [-A][-A][-BC][-BC][-C] :C -> [-A][-A][-B][-BC][-C]
     *
     * @param task          sudoku.task for abc
     * @param dir           0: rows from left, 1: rows from right, 2: columns from top, 3: columns from bottom
     * @param position      x/y coordinate of row/column
     */
    private static solveAbcPrompterBoth(board: number[][], parent: ISudoku, task: number[][], dir: number, position: number): number[][] {
        if (parent.abcCount === null) {
            return board;
        }

        let firstValue = this.getAbcFirstValue(dir, position, task); // first visible letter
        let middleValue = this.getAbcMiddleValue(dir, position, task, parent); // NOT first or last visible letter
        let lastValue = this.getAbcLastValue(dir, position, task); // last visible letter (first from other side)
        let startX, startY, moveX, moveY;
        [[startX, startY], [moveX, moveY]] = this.getAbcDirection(dir, position, parent);
        let firstFound = false; // until meeting first letter, there can not be anything else than first letter and space
        let middleNotFound = middleValue; // binary representations of all (not first or last) letters that we did not find
        let middleFoundCount = 0; // how many (not first or last) numbers we found (we can count single letter multiple times)
        for (let i = 0; i < parent.size; i++) {
            let x = startX + i * moveX;
            let y = startY + i * moveY;
            if (! firstFound) {
                if ((board[y][x] & firstValue) !== 0) { // we found first letter, there can be first letter or space
                    firstFound = true;
                    board[y][x] &= firstValue | 1;
                } else { // we did not find first letter, there can only be space
                    board[y][x] &= 1;
                }
            } else {
                middleNotFound &= ~ (board[y][x]); // we found (not first or last) letter
                if ((board[y][x] & middleValue) !== 0) {
                    middleFoundCount ++;
                }
                board[y][x] &= ~ lastValue; // there can not be last letter (because other letters wouldn't fit in previous squares)
            }
            if (firstFound && middleNotFound === 0 && middleFoundCount >= parent.abcCount - 2) {
                break;
            }
        }

        return board;
    }

    /**
     * Same as Solver.solveAbcPrompterBoth(), but when last visible letter is unknown.
     */
    private static solveAbcPrompterFirst(board: number[][], parent: ISudoku, task: number[][], dir: number, position: number): number[][] {
        if (parent.abcCount === null || parent.abcSpaceCount === null) {
            return board;
        }

        let firstValue = this.getAbcFirstValue(dir, position, task);
        let middleValue = this.getAbcMiddleValue(dir, position, task, parent);
        let startX, startY, moveX, moveY;
        [[startX, startY], [moveX, moveY]] = this.getAbcDirection(dir, position, parent);
        let firstFound = false;
        let middleFound = false;
        for (let i = 0; i < parent.size; i++) {
            let x = startX + i * moveX;
            let y = startY + i * moveY;
            if (! firstFound) {
                if ((board[y][x] & firstValue) !== 0) {
                    firstFound = true;
                    board[y][x] &= firstValue | 1;
                } else {
                    board[y][x] &= 1;
                }
            } else if (middleFound || i > parent.abcSpaceCount) {
                board[y][x] &= middleValue | 1;
            } else if ((board[y][x] & middleValue) !== 0 && Utils.countBits32(board[y][x]) === 1) {
                middleFound = true;
            }
        }

        return board;
    }

    /**
     * Solve everything we can from knowing first and last visible number.
     *
     * Call Solver.solveAbcPrompterBoth() and Solver.solveAbcPrompterFirst() for all rows and columns in both direction.
     */
    private static solveAbcPrompter(board: number[][], parent: ISudoku): number[][] {
        let task = parent.task;
        for (let dir = 0; dir < 4; dir++) {
            for (let position = 0; position < parent.size; position++) {
                let firstValue = this.getAbcFirstValue(dir, position, task);
                let lastValue = this.getAbcLastValue(dir, position, task);
                if (firstValue !== 0 && lastValue !== 0) {
                    board = this.solveAbcPrompterBoth(board, parent, task, dir, position);
                } else if (firstValue !== 0) {
                    board = this.solveAbcPrompterFirst(board, parent, task, dir, position);
                }
            }
        }

        return board;
    }

    /**
     * Use all rules for solving abc once.
     */
    private static solveCycleAbc(board: number[][], parent: ISudoku): number[][] {

        if (this.print) {
            Renderer.render(board, parent, null, "red");
        }

        board = this.solveAbcOneInSquare(board, parent);

        if (this.print) {
            Renderer.render(board, parent, null, "red");
        }

        board = this.solveAbcOnlyInSquare(board, parent);

        if (this.print) {
            Renderer.render(board, parent, null, "red");
        }

        board = this.solveAbcPrompter(board, parent);

        if (this.print) {
            Renderer.render(board, parent, null, "red");
        }

        return board;
    }

    //          NOT ABC FROM HERE

    /**
     * If there can be only one number in square, it can not be anywhere else in row or column.
     */
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

    /**
     * If in row/column can a number be only in one square, there can not be anything else in that square.
     */
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

    /**
     * If there can be only one number in square, it can not be anywhere else in rectangle.
     */
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

    /**
     * If in a rectangle can a number be only in one square, there can not be anything else in that square.
     */
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

    /**
     * If there can be only one number in square, it can not be anywhere else in a diagonal.
     */
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

    /**
     * If in a diagonal can a number be only in one square, there can not be anything else int that square.
     */
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

    /**
     * In VX sudoku, if there is "V" or "X" between squares, their sum must be 5 or 10.
     *
     * @param first     binary representation of first square
     * @param second    binary representation of its
     * @param sum       sum of numbers in these squares
     * @return          binary representation of second square after applying the rule
     */
    private static solveVxInSumOne(first: number, second: number, sum: number): number {
        return first & (Utils.reverseBits32(second) >>> 32 - sum + 1);
    }

    /**
     * If there is "V" or "X" in two orthogonally adjacent squares, apply rule Solver.solveVxInSumOne().
     */
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

    /**
     * If there is not "V" or "X" between two orthogonally adjacent squares, and one square has known value, the other square can not add to 5 or 10.
     */
    private static solveVxOutSum(board: number[][], parent: ISudoku): number[][] {
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

    /**
     * Apply all rules, which are applied for this sudoku variant, once.
     */
    private static solveCycle(board: number[][], parent: ISudoku): number[][] {
        if (parent.isABC && parent.hasSolution) {
            return this.solveCycleAbc(board, parent);
        }

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
            board = this.solveVxInSum(board, parent);
            board = this.solveVxOutSum(board, parent);
        }

        return board;
    }

    /**
     * Solve sudoku as much as possible. Main method of this class.
     *
     * Repeat solveCycle() until it stops changing board.
     *
     * @param inputBoard        sudoku.task (but for abc it is sudoku.board)
     * @param parent            sudoku object
     */
    public static solve(inputBoard: number[][], parent: ISudoku): number[][] {
        if (parent.isKropki && parent.hasSolution) {
            return parent.solution;
        }

        let board = Utils.deepcopyBoard(inputBoard);

        let lastExtraNum = -1;
        let extraNum = Utils.getExtraDigitsCount(board);
        while (lastExtraNum !== extraNum) {
            lastExtraNum = extraNum;
            board = this.solveCycle(board, parent);

            extraNum = Utils.getExtraDigitsCount(board);
        }

        return board;
    }

    /**
     * Check if solution is correct, because the solving rules do not do that.
     */
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

    /**
     * 0: there is no solution (in one square can not be anything), 1: it is solved, 2: some squares can have multiple values
     */
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

    /**
     * Special solving method for SudokuEvaluator. ONLY FOR CLASSIC SUDOKU 3x3
     *
     * 1.) Start with sudoku, where some squares can have 1 number, and other squares can have all numbers
     * 2.) For all known squares, remove their numbers from squares, that are in same row/column/rectangle
     * 3.) If in a row/column/ractangle can a number be only in one square, remove all other numbers from that square
     *
     * This is used to better simulate how a human solves sudoku, without writing small numbers.
     * SudokuEvaluator will later count, how many squares were possible to be filled with this function,
     * and it will fill (only) one of them for the price of 1/n points of difficulty.
     */
    public static solveCycleEvaluate(board: number[][], parent: ISudoku): number[][] {
        board = this.solveLineOneInSquare(board, parent);
        board = this.solveRectangleOneInSquare(board, parent);
        board = this.solveLineOnlyInSquare(board, parent);
        board = this.solveRectangleOnlyInSquare(board, parent);

        return board;
    }
}