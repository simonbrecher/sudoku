class TapaSolver {
    private static solveNumberToEmpty(board: number[][], task: (number[] | null)[][], parent: ITapa): number[][] {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (task[y][x] !== null) {
                    board[y][x] &= 1;
                }
            }
        }

        return board;
    }

    private static solveNumberBruteforceRecursion(
        maxAmounts: number[], board: number[], depth: number, onEnd: number, possible: number[], possibleAdd: number[]
    ): void {
        // console.log("-> ", depth, onEnd, board.length);
        if (depth === board.length - onEnd) {
            // console.log(possible, possibleAdd);
            for (let i = 0; i < board.length; i++) {
                possible[i] |= possibleAdd[i];
            }
        }

        for (let add = 0; add < maxAmounts.length; add++) {
            if (maxAmounts[add] > 0) {
                let isOk = true;
                for (let i = 0; i < add; i++) {
                    if ((board[depth + i] & 2) === 0) {
                        isOk = false;
                        break;
                    }
                }
                if ((board[(depth + add) % board.length] & 1) === 0) {
                    isOk = false;
                }

                if (isOk) {
                    maxAmounts[add] --;
                    for (let i = 0; i < add; i++) {
                        possibleAdd[depth + i] = 2;
                    }
                    possibleAdd[(depth + add) % board.length] = 1;

                    this.solveNumberBruteforceRecursion(maxAmounts, board, depth + add + 1, onEnd, possible, possibleAdd);

                    maxAmounts[add] ++;
                }
            }
        }
    }

    private static solveNumberBruteforce(board: number[], task: number[]): number[] {
        let possible = [];
        let possibleAdd = [];
        let maxAmounts = [];
        for (let i = 0; i < board.length; i++) {
            possible.push(0);
            possibleAdd.push(0);
            maxAmounts.push(0);
        }
        let total = 0;
        for (let i = 0; i < task.length; i++) {
            maxAmounts[task[i]] ++;
            total += task[i] + 1;
        }
        maxAmounts[0] += board.length - total;

        let minOnStart = 0;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === 2) {
                minOnStart ++;
            } else {
                break;
            }
        }
        let minOnEnd = 0;
        for (let i = board.length - 1; i >= 0; i--) {
            if (board[i] === 2) {
                minOnEnd ++;
            } else {
                break;
            }
        }
        let maxOnStart = 0;
        for (let i = 0; i < board.length; i++) {
            if ((board[i] & 2) !== 0) {
                maxOnStart ++;
            } else {
                break;
            }
        }
        let maxOnEnd = 0;
        for (let i = board.length - 1; i >= 0; i--) {
            if ((board[i] & 2) !== 0) {
                maxOnEnd ++;
            } else {
                break;
            }
        }

        // console.log(">>");
        // console.log(board, task);

        for (let onStart = minOnStart; onStart <= Math.min(maxOnStart, task[task.length - 1]); onStart++) {
            for (let onEnd = minOnEnd; onEnd <= Math.min(maxOnEnd, task[task.length - 1] - onStart); onEnd ++) {
                let length = onStart + onEnd;
                if (maxAmounts[length] > 0 && (board[onStart] & 1) !== 0 && (board[board.length - onEnd - 1] & 1) !== 0) {
                    maxAmounts[length] --;

                    for (let i = 0; i < onStart; i++) {
                        possibleAdd[i] = 2;
                    }
                    possibleAdd[onStart] = 1;
                    for (let i = 0; i < onEnd; i++) {
                        possibleAdd[board.length - i - 1] = 2;
                    }
                    possibleAdd[board.length - onEnd - 1] = 1;

                    this.solveNumberBruteforceRecursion(maxAmounts, board, onStart + 1, onEnd, possible, possibleAdd);

                    maxAmounts[length] ++;
                }
            }
        }

        // console.log(possible);

        return possible;
    }

    public static main(): void {
        this.solveNumberBruteforce([1, 3, 3, 3, 3, 3, 3, 3], [3, 3]);
        this.solveNumberBruteforce([1, 3, 3, 3, 3, 3, 3, 3], [2, 3]);
        this.solveNumberBruteforce([3, 3, 3, 1, 3, 3, 3, 2], [5]);
        this.solveNumberBruteforce([3, 3, 3, 1, 3, 3, 3, 3], [5]);
        this.solveNumberBruteforce([3, 3, 2, 1, 3, 3, 3, 3], [5]);
        this.solveNumberBruteforce([3, 3, 3, 3, 2, 3, 3, 3], [2]);
        this.solveNumberBruteforce([3, 3, 3, 3, 3, 3, 3, 3], [7]);
        this.solveNumberBruteforce([3, 3, 1, 3, 3, 3, 3, 3], [7]);
        this.solveNumberBruteforce([3, 3, 3, 3, 3, 3, 3, 3], [0]);
        this.solveNumberBruteforce([3, 3, 3, 2, 3, 3, 3, 3], [0]);
    }

    private static solveNumber(board: number[][], task: (number[] | null)[][], parent: ITapa): number[][] {
        let directions = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                let numberTask = task[y][x];
                if (numberTask !== null) {
                    let numberBoard = [];
                    for (let dir = 0; dir < 8; dir++) {
                        let newX = x + directions[dir][0];
                        let newY = y + directions[dir][1];
                        if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                            numberBoard.push(board[newY][newX]);
                        } else {
                            numberBoard.push(1);
                        }
                    }

                    numberBoard = this.solveNumberBruteforce(numberBoard, numberTask);

                    for (let dir = 0; dir < 8; dir++) {
                        let newX = x + directions[dir][0];
                        let newY = y + directions[dir][1];
                        if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                            board[newY][newX] = numberBoard[dir];
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveBox(board: number[][], parent: ITapa): number[][] {
        for (let y = 0; y < parent.height - 1; y++) {
            for (let x = 0; x < parent.width - 1; x++) {
                let countCoral = 0  ;
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

    private static getOrthogonal(coral: number[][], coralConst: 1 | 2, parent: ITapa): number[][] {
        let isDiagonal = coralConst === 1;

        let orthogonal = [];
        for (let y = 0; y < parent.height; y++) {
            let row = [];
            for (let x = 0; x < parent.width; x++) {
                row.push(-1);
            }
            orthogonal.push(row);
        }

        let orthogonalPartId = 0;
        for (let startY = 0; startY < parent.height; startY++) {
            for (let startX = 0; startX < parent.width; startX++) {
                if (orthogonal[startY][startX] === -1 && coral[startY][startX] === coralConst) {
                    let deck = [[startX, startY]];
                    while (deck.length > 0) {
                        let x, y;
                        // @ts-ignore
                        [x, y] = deck.pop();
                        if (orthogonal[y][x] === -1 && coral[y][x] === coralConst) {
                            orthogonal[y][x] = orthogonalPartId;
                            for (let dirY = -1; dirY <= 1; dirY++) {
                                for (let dirX = -1; dirX <= 1; dirX++) {
                                    if ((dirX !== 0 || dirY !== 0) && (dirX === 0 || dirY === 0 || isDiagonal)) {
                                        let newX = x + dirX;
                                        let newY = y + dirY;
                                        if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                                            deck.push([newX, newY]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    orthogonalPartId ++;
                }
            }
        }

        return orthogonal;
    }

    // on side = -1 ; other color = -1
    private static getOrthogonalOnSides(orthogonal: number[][], parent: ITapa): number[][] {
        let orthogonalNumber = this.countOrthogonal(orthogonal, parent);

        let isAnyOnSide = false;
        let isOnSide = [];
        for (let i = 0; i < orthogonalNumber; i++) {
            isOnSide.push(false);
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (x === 0 || y === 0 || x === parent.width - 1 || y === parent.height - 1) {
                    if (orthogonal[y][x] !== -1) {
                        isOnSide[orthogonal[y][x]] = true;
                        isAnyOnSide = true;
                    }
                }
            }
        }

        if (! isAnyOnSide) {
            return orthogonal;
        }

        let number = [];
        let index = 0;
        for (let i = 0; i < orthogonalNumber; i++) {
            if (isOnSide[i]) {
                number.push(-1);
            } else {
                number.push(index);
                index ++;
            }
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (orthogonal[y][x] !== -1) {
                    orthogonal[y][x] = number[orthogonal[y][x]];
                }
            }
        }

        return orthogonal;
    }

    private static countOrthogonal(orthogonal: number[][], parent: ITapa): number {
        let max = -1;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                max = Math.max(max, orthogonal[y][x]);
            }
        }

        return max + 1;
    }

    // length of border is 0 / 1 / 2
    private static getOrthogonalBorder(coral: number[][], orthogonal: number[][], coralConst: 1 | 2, parent: ITapa): number[][][] {
        let isDiagonal = coralConst === 1;

        let orthogonalCount = this.countOrthogonal(orthogonal, parent);

        let borders = [];
        for (let i = 0; i < orthogonalCount; i++) {
            borders.push([]);
        }

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (orthogonal[y][x] === -1 && coral[y][x] === 3) {
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        for (let dirX = -1; dirX <= 1; dirX++) {
                            if ((dirX !== 0 || dirY !== 0) && (dirX === 0 || dirY === 0 || isDiagonal)) {
                                let newX = x + dirX;
                                let newY = y + dirY;
                                if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                                    let group = orthogonal[newY][newX];
                                    if (group !== -1) {
                                        // console.log(group, "[", x, y, "]")
                                        if (borders[group].length === 0) {
                                            // @ts-ignore
                                            borders[group].push([x, y]);
                                        } else if (borders[group].length === 1) {
                                            if (borders[group][0][0] !== x || borders[group][0][1] !== y) {
                                                // @ts-ignore
                                                borders[group].push([x, y]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return borders;
    }

    private static solveOrthogonal(board: number[][], coralConst: 1 | 2, parent: ITapa): number[][] {
        let orthogonal;
        if (coralConst === 1) {
            orthogonal = this.getOrthogonalOnSides(this.getOrthogonal(board, 2, parent), parent);
        } else {
            orthogonal = this.getOrthogonal(board, 2, parent);
        }
        let countOrthogonal = this.countOrthogonal(orthogonal, parent);

        if (countOrthogonal > 1) {
            let borders = this.getOrthogonalBorder(board, orthogonal, coralConst, parent);

            for (let i = 0; i < borders.length; i++) {
                if (borders[i].length === 1) {
                    board[borders[i][0][1]][borders[i][0][0]] = coralConst;
                }
            }
        }

        return board;
    }

    private static solveAll(board: number[][], task: (number[] | null)[][], parent: ITapa): number[][] {
        board = this.solveNumberToEmpty(board, task, parent);
        board = this.solveNumber(board, task, parent);
        board = this.solveBox(board, parent);
        // board = this.solveOrthogonal(board, 1, parent); // NOT WORKING
        board = this.solveOrthogonal(board, 2, parent);

        return board;
    }

    private static countUnsolvedSquares(board: number[][], parent: ITapa): number {
        let unsolvedSquares = 0;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (board[y][x] === 3) {
                    unsolvedSquares ++;
                }
            }
        }

        return unsolvedSquares;
    }

    public static solve(inputBoard: number[][], task: (number[] | null)[][], parent: ITapa): number[][] {
        let board = Utils.deepcopyArray2d(inputBoard);

        let count = 0;

        let then = (new Date).getTime();

        let unsolvedCountBefore = -1;
        let unsolvedCount = this.countUnsolvedSquares(board, parent);
        while (unsolvedCount !== unsolvedCountBefore) {
            board = this.solveAll(board, task, parent);

            unsolvedCountBefore = unsolvedCount;
            unsolvedCount = this.countUnsolvedSquares(board, parent);

            count ++;
        }

        let now = (new Date).getTime();

        console.log(count, now - then + "ms");

        return board;
    }

    public static countSolutions(solution: number[][], task: (number[] | null)[][], parent: ITapa): number {
        let solvedSolution = this.solve(Utils.deepcopyArray2d(solution), parent.task, parent);

        let orthogonalCountBlack = this.countOrthogonal(this.getOrthogonal(solvedSolution, 2, parent), parent);
        let orthogonalCountWhite = this.countOrthogonal(this.getOrthogonalOnSides(this.getOrthogonal(solvedSolution, 1, parent), parent), parent);

        // TapaBuilder.render(solvedSolution, task, parent, true, true);
        // console.log("orthogonalCount", orthogonalCountBlack, orthogonalCountWhite);

        let isSolved = true;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (solvedSolution[y][x] === 0) {
                    return 0;
                } else if (solvedSolution[y][x] === 3) {
                    isSolved = false;
                }
            }
        }
        if (isSolved) {
            if (orthogonalCountBlack > 1 || orthogonalCountWhite > 1) {
                return 0;
            } else {
                return 1;
            }
        } else {
            return 2;
        }
    }
}