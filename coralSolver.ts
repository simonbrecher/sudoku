class CoralSolver {
    private static MAX_RECURSIONS = 10 * 1000;

    public static recursions = 0;
    public static rowRecursions = 0;

    private static getUpdated(board: number[][], newBoard: number[][]): boolean[][] {
        let updated: boolean[][] = [[], []];
        for (let y = 0; y < board.length; y++) {
            updated[0].push(false);
        }
        for (let x = 0; x < board[0].length; x++) {
            updated[1].push(false);
        }

        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x] !== newBoard[y][x]) {
                    updated[0][y] = true;
                    updated[1][x] = true;
                }
            }
        }

        return updated;
    }

    private static bruteforceLineSortedRecursion(
        maxAmounts: number[], board: number[], next: number[][],
        depth: number, possible: number[], possibleAdd: number[],
    ): number[] {
        this.rowRecursions ++;

        if (depth > board.length) {
            throw "Too deep";
        }

        if (depth === board.length) {
            for (let i = 0; i < board.length; i++) {
                possible[i] |= possibleAdd[i];
            }
            return possible;
        }

        for (let add = 0; add < maxAmounts.length; add++) {
            if (maxAmounts[add] > 0) {
                let isOk = true;
                for (let i = depth; i < depth + add; i++) {
                    if ((board[i] & 2) === 0) {
                        isOk = false;
                    }
                }
                if (depth + add < board.length) {
                    if ((board[depth + add] & 1) === 0) {
                        isOk = false;
                    }
                }

                if (isOk) {
                    for (let side = 0; side < 2; side++) {
                        for (let i = depth; i < depth + add - 1; i++) {
                            if (next[side][i] === 2 && next[side][i + 1] === 2) {
                                isOk = false;
                            }
                        }

                        if (add > 0) {
                            if (depth >= 0) {
                                if (next[side][depth - 1] === 2 && next[side][depth] === 1) {
                                    isOk = false;
                                }
                            }
                            if (depth + add < board.length) {
                                if (next[side][depth + add - 1] === 1 && next[side][depth + add] === 2) {
                                    isOk = false;
                                }
                            }
                        }
                    }
                }

                if (isOk) {
                    maxAmounts[add] --;
                    for (let i = depth; i < depth + add; i++) {
                        possibleAdd[i] = 2;
                    }
                    if (depth + add < board.length) {
                        possibleAdd[depth + add] = 1;
                    }
                    let newDepth = depth + add + (depth + add < board.length ? 1 : 0);

                    possible = this.bruteforceLineSortedRecursion(maxAmounts, board, next, newDepth, possible, possibleAdd);

                    maxAmounts[add] ++;
                    for (let i = depth; i < newDepth; i++) {
                        possibleAdd[depth] = 0;
                    }
                }
            }
        }

        return possible;
    }

    private static bruteforceLineNonsortedRecursion(
        task: number[], board: number[],
        depth: number, spacesLeft: number, taskId: number,
        possible: number[], possibleAdd: number[],
    ): number[] {
        if (depth > board.length) {
            throw "too deep";
        }

        if (depth === board.length) {
            for (let i = 0; i < board.length; i++) {
                possible[i] |= possibleAdd[i];
            }
            return possible;
        }

        if (spacesLeft > 0 && (board[depth] & 1) !== 0) {
            possibleAdd[depth] = 1;
            possible = this.bruteforceLineNonsortedRecursion(task, board, depth + 1, spacesLeft - 1, taskId, possible, possibleAdd);
            possibleAdd[depth] = 0;
        }

        if (taskId !== task.length) {
            let canBeBlock = true;
            for (let i = depth; i < depth + task[taskId]; i++) {
                if ((board[i] & 2) === 0) {
                    canBeBlock = false;
                }
            }
            if (taskId !== task.length - 1) {
                if ((board[depth + task[taskId]] & 1) === 0) {
                    canBeBlock = false;
                }
            }
            if (canBeBlock) {
                let newDepth = depth + task[taskId] + (taskId === task.length - 1 ? 0 : 1);
                for (let i = depth; i < depth + task[taskId]; i++) {
                    possibleAdd[i] = 2;
                }
                if (taskId !== task.length) {
                    possibleAdd[depth + task[taskId]] = 1;
                }
                possible = this.bruteforceLineNonsortedRecursion(task, board, newDepth, spacesLeft, taskId + 1, possible, possibleAdd);
                for (let i = depth; i < depth + task[taskId] + (taskId !== task.length ? 1 : 0); i++) {
                    possibleAdd[i] = 0;
                }
            }
        }

        return possible;
    }

    private static bruteforceLine(task: number[], board: number[], next: number[][], isSorted: boolean): number[] {
        let possible = [];
        let possibleAdd = [];
        for (let i = 0; i < board.length; i++) {
            possible.push(0);
            possibleAdd.push(0);
        }

        let spaceLeft = board.length + 1;
        for (let i = 0; i < task.length; i++) {
            spaceLeft -= task[i] + 1;
        }

        if (isSorted) {
            let maxAmounts = [];
            for (let i = 0; i <= board.length; i++) {
                maxAmounts.push(0);
            }
            maxAmounts[0] = spaceLeft;
            for (let i = 0; i < task.length; i++) {
                maxAmounts[task[i]] ++;
            }

            return this.bruteforceLineSortedRecursion(maxAmounts, board, next, 0, possible, possibleAdd);

        } else {

            possible = this.bruteforceLineNonsortedRecursion(task, board, 0, spaceLeft, 0, possible, possibleAdd);
            return possible;
        }
    }

    private static solveAllLines(board: number[][], task: (number[] | null)[][], updated: boolean[][], parent: ICoral): number[][] {
        for (let y = 0; y < parent.height; y++) {
            if (updated[0][y]) {
                let taskLine = task[0][y];
                if (taskLine !== null) {
                    let boardLine = [];
                    for (let x = 0; x < parent.width; x++) {
                        boardLine.push(board[y][x]);
                    }

                    let next = [];
                    for (let dy = -1; dy <= 1; dy+=2) {
                        let add = [];
                        if (y + dy >= 0 && y + dy < parent.height) {
                            for (let x = 0; x < parent.width; x++) {
                                add.push(board[y + dy][x]);
                            }
                        } else {
                            for (let x = 0; x < parent.width; x++) {
                                add.push(3);
                            }
                        }
                        next.push(add);
                    }

                    boardLine = this.bruteforceLine(taskLine, boardLine, next, parent.isSorted);
                    for (let x = 0; x < parent.width; x++) {
                        board[y][x] = boardLine[x];
                    }
                }
            }
        }
        for (let x = 0; x < parent.width; x++) {
            if (updated[1][x]) {
                let taskLine = task[1][x];
                if (taskLine !== null) {

                    let boardLine = [];
                    for (let y = 0; y < parent.height; y++) {
                        boardLine.push(board[y][x]);
                    }

                    let next = [];
                    for (let dx = -1; dx <= 1; dx+=2) {
                        let add = [];
                        if (x + dx >= 0 && x + dx < parent.width) {
                            for (let y = 0; y < parent.height; y++) {
                                add.push(board[y][x + dx]);
                            }
                        } else {
                            for (let y = 0; y < parent.height; y++) {
                                add.push(3);
                            }
                        }
                        next.push(add);
                    }

                    boardLine = this.bruteforceLine(taskLine, boardLine, next, parent.isSorted);
                    for (let y = 0; y < parent.height; y++) {
                        board[y][x] = boardLine[y];
                    }
                }
            }
        }

        return board;
    }

    private static solveSquares(board: number[][], parent: ICoral): number[][] {
        for (let y = 0; y < parent.height - 1; y++) {
            for (let x = 0; x < parent.width - 1; x++) {
                let countCoral = 0;
                for (let addY = 0; addY < 2; addY ++) {
                    for (let addX = 0; addX < 2; addX++) {
                        if (board[y + addY][x + addX] === 2) {
                            countCoral ++;
                        }
                    }
                }
                if (countCoral === 4) {
                    board[y][x] = 0;
                    return board;
                } else if (countCoral === 3) {
                    for (let addY = 0; addY < 2; addY ++) {
                        for (let addX = 0; addX < 2; addX++) {
                            if (board[y + addY][x + addX] === 3) {
                                board[y + addY][x + addX] = 1;
                            }
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveCycle(board: number[][], task: (number[] | null)[][], updated: boolean[][], parent: ICoral): number[][] {
        board = this.solveAllLines(board, task, updated, parent);
        board = this.solveSquares(board, parent);

        return board;
    }

    private static solve(board: number[][], task: (number[] | null)[][], updated: boolean[][], parent: ICoral): number[][] {
        let isChanged = true;
        let i = 0;
        while (isChanged) {
            i ++;
            let newBoard = this.solveCycle(Utils.deepcopyArray2d(board), task, updated, parent);

            updated = this.getUpdated(board, newBoard);
            isChanged = false;
            for (let dir = 0; dir < 2; dir++) {
                for (let i = 0; i < updated[dir].length; i++) {
                    if (updated[dir][i]) {
                        isChanged = true;
                    }
                }
            }

            board = newBoard;
        }

        return board;
    }

    private static bruteforceRecursion(board: number[][], task: (number[] | null)[][], updated: boolean[][], parent: ICoral): number {
        this.recursions ++;

        if (this.recursions >= this.MAX_RECURSIONS) {
            return 2;
        }

        let solved = this.solve(Utils.deepcopyArray2d(board), task, updated, parent);

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (solved[y][x] === 0) {
                    return 0;
                }
            }
        }

        let addIndex = parent.width * parent.height;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (solved[y][x] === 3) {
                    addIndex = y * parent.width + x;
                    break;
                }
            }
            if (addIndex !== parent.width * parent.height) {
                break;
            }
        }

        if (addIndex === parent.width * parent.height) {
            CoralGenerator.typeCoral();
            let isCorrect = CoralGenerator.checkCoral(solved);
            return isCorrect ? 1 : 0;
        }

        let x = addIndex % parent.width;
        let y = Math.floor(addIndex / parent.width);

        let solutionCount = 0;
        for (let add = 1; add <= 2; add++) {
            if ((solved[y][x] & add) !== 0) {
                solved[y][x] = add;

                updated = this.getUpdated(solved, board);

                solutionCount += this.bruteforceRecursion(solved, task, updated, parent);
                solved[y][x] = 3;
            }

            if (solutionCount > 1) {
                return Math.min(solutionCount, 2);
            }
        }

        return solutionCount;
    }

    public static bruteforce(board: number[][], task: (number[] | null)[][], parent: ICoral): number {
        let updated: boolean[][] = [[], []];
        for (let y = 0; y < parent.height; y++) {
            updated[0].push(true);
        }
        for (let x = 0; x < parent.width; x++) {
            updated[1].push(true);
        }

        let recursions = this.bruteforceRecursion(board, task, updated, parent);
        return this.recursions >= this.MAX_RECURSIONS ? 3 : recursions;
    }

    public static countSolutions(task: (number[] | null)[][], parent: ICoral): number {
        this.recursions = 0;
        this.rowRecursions = 0;
        let solutionCount = this.bruteforce(parent.board, task, parent);
        return solutionCount;
    }

    public static main(): void {
        // let output = this.bruteforceLine([2], [3, 3, 3, 3], [[3, 3, 3, 3], [2, 2, 3, 3]], true);
        // console.log(output);
        // return;

        let width = 15;
        let height = 15;
        let isSorted = true;

        let solution = null;
        CoralGenerator.typeCoral();
        while (solution === null) {
            solution = CoralGenerator.createCoral(width, height);
        }
        let coral = new Coral(width, height, isSorted, solution);
        this.countSolutions(coral.task, coral);
        CoralBuilder.render(coral.task, coral.solution, coral);
    }
}