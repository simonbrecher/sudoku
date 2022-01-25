class Solver {
    public static print = false;

    private static readonly kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    private static readonly knightMoves = [[-2, -1], [-1, -2], [-2, 1], [-1, 2], [2, -1], [1, -2], [2, 1], [1, 2]];

    public static getAbcFirstValue(dir: number, position: number, task: number[][]): number {
        return task[dir][position];
    }

    public static getAbcLastValue(dir: number, position: number, task: number[][]): number {
        return task[dir ^ 1][position];
    }

    public static getAbcMiddleValue(dir: number, position: number, task: number[][], parent: ISudoku): number {
        if (parent.abcNumber === null) {
            throw "Utils->getAbcMiddle - parent.abcNumber === null";
        }
        return (1 << parent.abcNumber + 1) - 2 & ~ this.getAbcFirstValue(dir, position, task) & ~ this.getAbcLastValue(dir, position, task);
    }

    public static getSideDirection(dir: number, position: number, parent: ISudoku): number[][] {
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

    private static solveAbcOneInSquare(board: number[][], parent: ISudoku): number[][] {
        if (parent.abcSpaceNumber === null) {
            return board;
        }
        for (let y = 0; y < parent.size; y++) {
            let rowOne = 0;
            let spaceCount = 0;
            for (let x = 0; x < parent.size; x++) {
                // console.log(board, y, x);
                if (board[y][x] === 1) {
                    spaceCount ++;
                } else if (Utils.countBits32(board[y][x]) === 1) {
                    rowOne |= board[y][x];
                }
            }
            let notRemove = (spaceCount < parent.abcSpaceNumber) ? (~ rowOne) : (~ (rowOne | 1));
            for (let x = 0; x < parent.size; x++) {
                if (Utils.countBits32(board[y][x]) !== 1) {
                    board[y][x] &= notRemove;
                }
            }
        }
        for (let x = 0; x < parent.size; x++) {
            let columnOne = 0;
            let spaceCount = 0;
            for (let y = 0; y < parent.size; y++) {
                if (board[y][x] === 1) {
                    spaceCount ++;
                } else if (Utils.countBits32(board[y][x]) === 1) {
                    columnOne |= board[y][x];
                }
            }
            let notRemove = (spaceCount < parent.abcSpaceNumber) ? (~ columnOne) : (~ (columnOne | 1));
            for (let y = 0; y < parent.size; y++) {
                if (Utils.countBits32(board[y][x]) !== 1) {
                    board[y][x] &= notRemove;
                }
            }
        }

        return board;
    }

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

    private static solveAbcPrompterBoth(board: number[][], parent: ISudoku, task: number[][], dir: number, position: number): number[][] {
        if (parent.abcNumber === null) {
            return board;
        }

        let firstValue = this.getAbcFirstValue(dir, position, task);
        let middleValue = this.getAbcMiddleValue(dir, position, task, parent);
        let lastValue = this.getAbcLastValue(dir, position, task);
        let startX, startY, moveX, moveY;
        [[startX, startY], [moveX, moveY]] = this.getSideDirection(dir, position, parent);
        let firstFound = false;
        let middleNotFound = middleValue;
        let middleFoundCount = 0;
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
            } else {
                middleNotFound &= ~ (board[y][x]);
                if ((board[y][x] & middleValue) !== 0) {
                    middleFoundCount ++;
                }
                board[y][x] &= ~ lastValue;
            }
            if (firstFound && middleNotFound === 0 && middleFoundCount >= parent.abcNumber - 2) {
                break;
            }
        }

        return board;
    }

    private static solveAbcPrompterFirst(board: number[][], parent: ISudoku, task: number[][], dir: number, position: number): number[][] {
        if (parent.abcNumber === null || parent.abcSpaceNumber === null) {
            return board;
        }

        let firstValue = this.getAbcFirstValue(dir, position, task);
        let middleValue = this.getAbcMiddleValue(dir, position, task, parent);
        let startX, startY, moveX, moveY;
        [[startX, startY], [moveX, moveY]] = this.getSideDirection(dir, position, parent);
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
            } else if (middleFound || i > parent.abcSpaceNumber) {
                board[y][x] &= middleValue | 1;
            } else if ((board[y][x] & middleValue) !== 0 && Utils.countBits32(board[y][x]) === 1) {
                middleFound = true;
            }
        }

        return board;
    }

    private static solveAbcPrompter(board: number[][], parent: ISudoku): number[][] {
        let task = parent.sideTask;
        if (task !== null) {
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
        }

        return board;
    }

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

        if (parent.isKingMove || parent.isKnightMove) {
            board = this.solveChessMoves(board, parent);
        }

        if (this.print) {
            Renderer.render(board, parent, null, "red");
        }

        return board;
    }

    private static checkSkyscraperCount(inputBoard: number[], task: number, task2: number | null, depth: number): boolean {
        let board = [];
        for (let i = 0; i < inputBoard.length; i++) {
            if (Utils.countBits32(inputBoard[i]) === 1) {
                board.push(Utils.binaryToShift(inputBoard[i]) + 1);
            } else {
                board.push(null);
            }
        }

        let visibleCount = 0;
        let highest = 0;
        for (let i = 0; i < depth; i++) {
            // @ts-ignore
            if (board[i] > highest) {
                visibleCount ++;
                // @ts-ignore
                highest = board[i];
            }
        }
        let higherNumbersCount = board.length - highest;

        // console.log(inputBoard, visibleCount, task, higherNumbersCount);
        if (visibleCount > task || visibleCount === task && higherNumbersCount > 0 || visibleCount + higherNumbersCount < task) {
            return false;
        }

        if (depth === board.length && task2 !== null) {
            let backwardVisibleCount = 0;
            let backwardHighest = 0;
            for (let i = depth - 1; i >= 0; i--) {
                // @ts-ignore
                if (board[i] > backwardHighest) {
                    backwardVisibleCount ++;
                    // @ts-ignore
                    backwardHighest = board[i];
                }
            }

            if (backwardVisibleCount !== task2) {
                return false;
            }
        }

        return true;
    }

    private static solveSkyscraperPrompterFast(board: number[][], parent: ISudoku): number[][] {
        let task = parent.sideTask;
        if (task !== null) {
            for (let dir = 0; dir < 4; dir++) {
                for (let position = 0; position < parent.size; position++) {
                    let firstValue = task[dir][position];
                    if (firstValue !== 0) {
                        let startX, startY, moveX, moveY;
                        [[startX, startY], [moveX, moveY]] = this.getSideDirection(dir, position, parent);
                        for (let i = 0; i < parent.size; i++) {
                            board[startY + i * moveY][startX + i * moveX] &= (1 << parent.size - firstValue + 1 + i) - 1;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static isBruteforceSkyscraperRedundant(board: number[], possibleAdd: number[], possible: number[], depth: number): boolean {
        let canBePossible = [];
        for (let i = 0; i < board.length; i++) {
            canBePossible.push(board[i]);
            if (i < depth) {
                canBePossible[i] &= possibleAdd[i];
            }
        }

        for (let i = 0; i < board.length; i++) {
            if ((canBePossible[i] & ~ possible[i]) !== 0) {
                return false;
            }
        }

        return true;
    }

    private static bruteforceSkyscraperPrompter(board: number[], isUsed: boolean[], task: number, task2: number | null, depth: number, possibleAdd: number[], possible: number[]): number[] {
        if (depth === board.length) {
            if (this.checkSkyscraperCount(possibleAdd, task, task2, depth)) {
                for (let i = 0; i < possible.length; i++) {
                    possible[i] |= possibleAdd[i];
                }
            }

            return possible;
        }

        if (! this.checkSkyscraperCount(possibleAdd, task, task2, depth)) {
            return possible;
        }

        if (this.isBruteforceSkyscraperRedundant(board, possibleAdd, possible, depth)) {
            return possible;
        }

        for (let shift = 0; shift < board.length; shift++) {
            if (! isUsed[shift] && (1 << shift & board[depth]) !== 0) {
                possibleAdd[depth] = 1 << shift;
                isUsed[shift] = true;

                possible = this.bruteforceSkyscraperPrompter(board, isUsed, task, task2, depth + 1, possibleAdd, possible);

                possibleAdd[depth] = 0;
                isUsed[shift] = false;
            }
        }

        return possible;
    }

    private static solveSkyscraperPrompter(board: number[][], parent: ISudoku): number[][] {
        let task = parent.sideTask;
        if (task !== null) {
            for (let dir = 0; dir < 4; dir++) {
                for (let position = 0; position < parent.size; position++) {
                    let firstValue = task[dir][position];
                    let secondValue = task[dir ^ 1][position];
                    if (firstValue !== 0) {
                        if (secondValue === 0) {
                            // @ts-ignore
                            secondValue = null;
                        }
                        let startX, startY, moveX, moveY;
                        [[startX, startY], [moveX, moveY]] = this.getSideDirection(dir, position, parent);
                        let board2 = [];
                        let possibleAdd = [];
                        let possible = [];
                        let isUsed = [];
                        for (let i = 0; i < parent.size; i++) {
                            board2.push(board[startY + i * moveY][startX + i * moveX]);
                            possibleAdd.push(0);
                            possible.push(0);
                            isUsed.push(false);
                        }
                        let previous = Utils.deepcopy(board2);
                        board2 = this.bruteforceSkyscraperPrompter(board2, isUsed, firstValue, secondValue, 0, possibleAdd, possible);
                        for (let i = 0; i < parent.size; i++) {
                            board[startY + i * moveY][startX + i * moveX] &= board2[i];
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveLineOneInSquare(board: number[][], parent: ISudoku): number[][] {
        for (let y = 0; y < parent.size; y++) {
            let rowOne = 0;
            for (let x = 0; x < parent.size; x++) {
                if (Utils.countBits32(board[y][x]) === 1) {
                    rowOne |= board[y][x];
                }
            }
            let notRowOne = ~ rowOne;
            for (let x = 0; x < parent.size; x++) {
                if (Utils.countBits32(board[y][x]) !== 1) {
                    board[y][x] &= notRowOne;
                }
            }
        }
        for (let x = 0; x < parent.size; x++) {
            let columnOne = 0;
            for (let y = 0; y < parent.size; y++) {
                if (Utils.countBits32(board[y][x]) === 1) {
                    columnOne |= board[y][x];
                }
            }
            let notColumnOne = ~ columnOne;
            for (let y = 0; y < parent.size; y++) {
                if (Utils.countBits32(board[y][x]) !== 1) {
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

        for (let rectangleY = 0; rectangleY < parent.size; rectangleY+=parent.rectangleHeight) {
            for (let rectangleX = 0; rectangleX < parent.size; rectangleX+=parent.rectangleWidth) {
                let rectangleOne = 0;
                for (let relativeY = 0; relativeY < parent.rectangleHeight; relativeY++) {
                    for (let relativeX = 0; relativeX < parent.rectangleWidth; relativeX++) {
                        if (Utils.countBits32(board[rectangleY + relativeY][rectangleX + relativeX]) === 1) {
                            rectangleOne |= board[rectangleY + relativeY][rectangleX + relativeX];
                        }
                    }
                }
                let notRectangleOne = ~ rectangleOne;
                for (let relativeY = 0; relativeY < parent.rectangleHeight; relativeY++) {
                    for (let relativeX = 0; relativeX < parent.rectangleWidth; relativeX++) {
                        if (Utils.countBits32(board[rectangleY + relativeY][rectangleX + relativeX]) !== 1) {
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

    private static solveIrregularOneInSquare(board: number[][], parent: ISudoku): number[][] {
        for (let i = 0; i < parent.size; i++) {
            let rowOne = 0;
            for (let j = 0; j < parent.size; j++) {
                // @ts-ignore
                let x = parent.irregularGroups[i][j][0];
                // @ts-ignore
                let y = parent.irregularGroups[i][j][1];
                if (Utils.countBits32(board[y][x]) === 1) {
                    rowOne |= board[y][x];
                }
            }
            let notRowOne = ~ rowOne;
            for (let j = 0; j < parent.size; j++) {
                // @ts-ignore
                let x = parent.irregularGroups[i][j][0];
                // @ts-ignore
                let y = parent.irregularGroups[i][j][1];
                if (Utils.countBits32(board[y][x]) !== 1) {
                    board[y][x] &= notRowOne;
                }
            }
        }

        return board;
    }

    private static solveIrregularOnlyInSquare(board: number[][], parent: ISudoku): number[][] {
        for (let i = 0; i < parent.size; i++) {
            let rowOne = 0;
            let rowMultiple = 0;
            for (let j = 0; j < parent.size; j++) {
                // @ts-ignore
                let x = parent.irregularGroups[i][j][0];
                // @ts-ignore
                let y = parent.irregularGroups[i][j][1];
                rowMultiple |= rowOne & board[y][x];
                rowOne |= board[y][x];
                rowOne &= ~ rowMultiple;
            }
            for (let j = 0; j < parent.size; j++) {
                // @ts-ignore
                let x = parent.irregularGroups[i][j][0];
                // @ts-ignore
                let y = parent.irregularGroups[i][j][1];
                if ((board[y][x] & rowOne) !== 0) {
                    board[y][x] &= rowOne;
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
        let solutionValues = parent.getSolutionValues();
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

    private static solveVxOutSum(board: number[][], parent: ISudoku): number[][] {
        let solutionValues = parent.getSolutionValues();
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size - 1; x++) {
                let sum = solutionValues[y][x] + solutionValues[y][x + 1];
                if (parent.getVxSumName(sum) === null) {
                    if (Utils.countBits32(board[y][x]) === 1) {
                        let sums = parent.getVxSumValues();
                        for (let i = 0; i < sums.length; i++) {
                            board[y][x + 1] &= ~ (1 << sums[i] - solutionValues[y][x] - 1);
                        }
                    }
                    if (Utils.countBits32(board[y][x + 1]) === 1) {
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

    private static solveMinusOneSquare(x1: number, y1: number, x2: number, y2: number, board: number[][], parent: ISudoku): number[][] {
        if (Math.abs(Utils.binaryToShift(parent.solution[y1][x1]) - Utils.binaryToShift(parent.solution[y2][x2])) === 1) {
            board[y2][x2] &= board[y1][x1] << 1 | board[y1][x1] >>> 1;
        } else if (Utils.countBits32(board[y1][x1]) === 1) {
            board[y2][x2] &= ~ (board[y1][x1] << 1 & board[y1][x1] >>> 1);
        }

        return board;
    }

    private static solveMinusOne(board: number[][], parent: ISudoku): number[][] {
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (x !== parent.size - 1) {
                    board = this.solveMinusOneSquare(x, y, x + 1, y, board, parent);
                    board = this.solveMinusOneSquare(x + 1, y, x, y, board, parent);
                }
                if (y !== parent.size - 1) {
                    board = this.solveMinusOneSquare(x, y, x, y + 1, board, parent);
                    board = this.solveMinusOneSquare(x, y + 1, x, y, board, parent);
                }
            }
        }

        return board;
    }

    private static solveInequalityOneSquare(x1: number, y1: number, x2: number, y2: number, board: number[][], parent: ISudoku): number[][] {
        if (parent.solution[y1][x1] < parent.solution[y2][x2]) {
            board[y2][x2] &= ~ ((board[y1][x1] ^ (board[y1][x1] - 1)) >> 1);
        } else {
            let reversed = Utils.reverseBits32(board[y1][x1]);
            board[y2][x2] &= ~ Utils.reverseBits32((reversed ^ (reversed - 1)) >> 1);
        }

        return board;
    }

    private static solveInequality(board: number[][], parent: ISudoku): number[][] {
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (x !== parent.size - 1) {
                    board = this.solveInequalityOneSquare(x, y, x + 1, y, board, parent);
                    board = this.solveInequalityOneSquare(x + 1, y, x, y, board, parent);
                }
                if (y !== parent.size - 1) {
                    board = this.solveInequalityOneSquare(x, y, x, y + 1, board, parent);
                    board = this.solveInequalityOneSquare(x, y + 1, x, y, board, parent);
                }
            }
        }

        return board;
    }

    private static getSameBlocks(parent: ISudoku): number[][][] {
        let sameBlocks = [];

        let sameRows = [];
        let sameColumns = [];
        for (let y = 0; y < parent.size; y++) {
            let sameRowsLine = [];
            let sameColumnsLine = [];
            for (let x = 0; x < parent.size; x++) {
                sameRowsLine.push(y);
                sameColumnsLine.push(x);
            }
            sameRows.push(sameRowsLine);
            sameColumns.push(sameColumnsLine);
        }
        sameBlocks.push(sameRows);
        sameBlocks.push(sameColumns);

        if (parent.isRectangular) {
            let sameRectangles = [];
            for (let y = 0; y < parent.size; y++) {
                let row = [];
                for (let x = 0; x < parent.size; x++) {
                    // @ts-ignore
                    row.push(y - y % parent.rectangleHeight + Math.floor(x / parent.rectangleWidth));
                }
                sameRectangles.push(row);
            }
            sameBlocks.push(sameRectangles);
        }

        if (parent.isIrregular) {
            let sameIrregular = Utils.createArray2d(parent.size, parent.size, -1);
            for (let i = 0; i < parent.size; i++) {
                for (let j = 0; j < parent.size; j++) {
                    // @ts-ignore
                    let x = parent.irregularGroups[i][j][0];
                    // @ts-ignore
                    let y = parent.irregularGroups[i][j][1];
                    sameIrregular[y][x] = i;
                }
            }
            sameBlocks.push(sameIrregular);
        }

        return sameBlocks;
    }

    private static isInSameBlock(x1: number, y1: number, x2: number, y2: number, sameBlocks: number[][][]): boolean {
        for (let i = 0; i < sameBlocks.length; i++) {
            if (sameBlocks[i][y1][x1] === sameBlocks[i][y2][x2]) {
                return true;
            }
        }

        return false;
    }

    private static bruteforceKillerGroupRecursion(
        group: number[][], sum: number, board: number[][], sameBlocks: number[][][], parent: ISudoku,
        depth: number, possible: number[], possibleAdd: number[],
    ): number[] {
        if (depth === group.length) {
            let total = 0;
            for (let i = 0; i < possibleAdd.length; i++) {
                total += Utils.binaryToShift(possibleAdd[i]) + 1;
            }
            if (total === sum) {
                for (let i = 0; i < possible.length; i++) {
                    possible[i] |= possibleAdd[i];
                }
            }

            return possible;
        }

        let x = group[depth][0];
        let y = group[depth][1];
        for (let shift = 0; shift < parent.size; shift++) {
            let binary = 1 << shift;
            let isOk = true;
            if ((board[y][x] & binary) === 0) {
                isOk = false;
            }
            for (let i = 0; i < depth; i++) {
                if (this.isInSameBlock(x, y, group[i][0], group[i][1], sameBlocks)) {
                    if (board[y][x] === possibleAdd[i]) {
                        isOk = false;
                        break;
                    }
                }
            }
            if (isOk) {
                possibleAdd[depth] = binary;

                possible = this.bruteforceKillerGroupRecursion(group, sum, board, sameBlocks, parent, depth + 1, possible, possibleAdd);

                possibleAdd[depth] = 0;
            }
        }

        return possible;
    }

    private static solveKiller(board: number[][], parent: ISudoku): number[][] {
        let sameBlocks = this.getSameBlocks(parent);

        // @ts-ignore
        for (let i = 0; i < parent.killerGroups.length; i++) {
            // @ts-ignore
            let group = parent.killerGroups[i];

            let possible = [];
            let possibleAdd = [];
            for (let i = 0; i < group.length; i++) {
                possible.push(0);
                possibleAdd.push(0);
            }
            // @ts-ignore
            possible = this.bruteforceKillerGroupRecursion(group, parent.killerSums[i], board, sameBlocks, parent, 0, possible, possibleAdd);

            for (let j = 0; j < group.length; j++) {
                board[group[j][1]][group[j][0]] &= possible[j];
            }
        }

        return board;
    }

    private static solveChessMoves(board: number[][], parent: ISudoku): number[][] {
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (Utils.countBits32(board[y][x]) === 1 && ! (board[y][x] === 1 && parent.isABC)) {
                    let notRemove = ~ board[y][x];
                    if (parent.isKingMove) {
                        for (let i = 0; i < this.kingMoves.length; i++) {
                            let newX = x + this.kingMoves[i][0];
                            let newY = y + this.kingMoves[i][1];
                            if (newX >= 0 && newX < parent.size && newY >= 0 && newY < parent.size) {
                                board[newY][newX] &= notRemove;
                            }
                        }
                    }
                    if (parent.isKnightMove) {
                        for (let i = 0; i < this.knightMoves.length; i++) {
                            let newX = x + this.knightMoves[i][0];
                            let newY = y + this.knightMoves[i][1];
                            if (newX >= 0 && newX < parent.size && newY >= 0 && newY < parent.size) {
                                board[newY][newX] &= notRemove;
                            }
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveCycle(board: number[][], parent: ISudoku): number[][] {
        if (parent.isABC && parent.hasSolution) {
            return this.solveCycleAbc(board, parent);
        }

        let extraOnStart = Utils.getExtraNum(board);

        if (parent.isSkyscraper && parent.hasSolution) {
            board = this.solveSkyscraperPrompterFast(board, parent);
        }

        board = this.solveLineOneInSquare(board, parent);
        board = this.solveLineOnlyInSquare(board, parent);
        if (parent.isRectangular) {
            board = this.solveRectangleOneInSquare(board, parent);
            board = this.solveRectangleOnlyInSquare(board, parent);
        }
        if (parent.isIrregular) {
            board = this.solveIrregularOneInSquare(board, parent);
            board = this.solveIrregularOnlyInSquare(board, parent);
        }
        if (parent.isDiagonal) {
            board = this.solveDiagonalOneInSquare(board, parent);
            board = this.solveDiagonalOnlyInSquare(board, parent);
        }
        if (parent.isVX && parent.hasSolution) {
            board = this.solveVxInSum(board, parent);
            board = this.solveVxOutSum(board, parent);
        }
        if (parent.isKingMove || parent.isKnightMove) {
            board = this.solveChessMoves(board, parent);
        }
        if (parent.isMinusOne && parent.hasSolution) {
            board = this.solveMinusOne(board, parent);
        }

        if (parent.isInequality && parent.hasSolution) {
            board = this.solveInequality(board, parent);
        }

        if (parent.isKiller && parent.hasSolution) {
            board = this.solveKiller(board, parent);
        }

        if (parent.isSkyscraper && parent.hasSolution) {
            if (extraOnStart === Utils.getExtraNum(board)) {
                board = this.solveSkyscraperPrompter(board, parent);
            }
        }

        return board;
    }

    public static solve(inputBoard: number[][], parent: ISudoku): number[][] {
        if (parent.isKropki && parent.hasSolution) {
            return Utils.deepcopyArray2d(parent.solution);
        }

        let board = Utils.deepcopyArray2d(inputBoard);

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
        if (parent.isIrregular) {
            for (let i = 0; i < parent.size; i++) {
                let row = 0;
                for (let j = 0; j < parent.size; j++) {
                    // @ts-ignore
                    let x = parent.irregularGroups[i][j][0];
                    // @ts-ignore
                    let y = parent.irregularGroups[i][j][1];
                    row |= board[y][x];
                }
                if (row !== (1 << parent.size) - 1) {
                    return false;
                }
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

    public static solveCycleEvaluate(board: number[][], parent: ISudoku): number[][] {
        board = this.solveLineOneInSquare(board, parent);
        board = this.solveRectangleOneInSquare(board, parent);
        board = this.solveLineOnlyInSquare(board, parent);
        board = this.solveRectangleOnlyInSquare(board, parent);

        return board;
    }
}