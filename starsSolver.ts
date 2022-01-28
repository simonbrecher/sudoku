class StarsSolver {
    public static MAX_DEPTH = 3;

    private static solveStarTouch(board: number[][], parent: IStars): number[][] {
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (board[y][x] === 2) {
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        for (let dirX = -1; dirX <= 1; dirX++) {
                            if (dirX !== 0 || dirY !== 0) {
                                let newX = x + dirX;
                                let newY = y + dirY;
                                if (newX >= 0 && newX < parent.size && newY >= 0 && newY < parent.size) {
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

    private static solveGroupCount(board: number[][], task: number[][][], parent: IStars): number[][] {
        for (let groupId = 0; groupId < task.length; groupId++) {
            let counts = [0, 0, 0, 0];
            for (let i = 0; i < task[groupId].length; i++) {
                let x = task[groupId][i][0];
                let y = task[groupId][i][1];
                counts[board[y][x]] ++;
            }

            if (counts[0] > 0 || counts[2] > parent.startCount || counts[2] + counts[3] < parent.startCount) {
                for (let i = 0; i < task[groupId].length; i++) {
                    let x = task[groupId][i][0];
                    let y = task[groupId][i][1];
                    board[y][x] = 0;
                }
            } else if (counts[3] > 0) {
                if (counts[2] === parent.startCount) {
                    for (let i = 0; i < task[groupId].length; i++) {
                        let x = task[groupId][i][0];
                        let y = task[groupId][i][1];
                        if (board[y][x] === 3) {
                            board[y][x] = 1;
                        }
                    }
                }
                if (counts[2] + counts[3] === parent.startCount) {
                    for (let i = 0; i < task[groupId].length; i++) {
                        let x = task[groupId][i][0];
                        let y = task[groupId][i][1];
                        if (board[y][x] === 3) {
                            board[y][x] = 2;
                        }
                    }
                }
            }
        }

        return board;
    }

    public static bruteforceGroup(
        board: number[][], group: number[][], mustBe: number[][], canNotBe: number[][], solutionCount: number, added: number[],
        starNum: number, size: number,
    ): [number[][], number[][], number] {
        if (added.length === starNum) {
            solutionCount ++;
            let alreadyAddedSpaces = new Set();
            for (let i = 0; i < added.length; i++) {
                let addX = group[added[i]][0];
                let addY = group[added[i]][1];
                mustBe[addY][addX] ++;
                for (let dirY = -1; dirY <= 1; dirY++) {
                    for (let dirX = -1; dirX <= 1; dirX++) {
                        if (dirX !== 0 || dirY !== 0) {
                            let newX = addX + dirX;
                            let newY = addY + dirY;
                            if (! alreadyAddedSpaces.has(newY * size + newX)) {
                                if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
                                    canNotBe[newY][newX] ++;
                                    alreadyAddedSpaces.add(newY * size + newX);
                                }
                            }
                        }
                    }
                }
            }

            return [mustBe, canNotBe, solutionCount];
        }

        let addedLast = -1;
        if (added.length > 0) {
            addedLast = added[added.length - 1];
        }
        for (let add = addedLast + 1; add < group.length; add++) {
            let addX = group[add][0];
            let addY = group[add][1];
            let canBeAdded = true;
            if (board[addY][addX] !== 3) {
                canBeAdded = false;
            }
            for (let i = 0; i < added.length; i++) {
                let oldX = group[added[i]][0];
                let oldY = group[added[i]][1];
                if (Math.abs(addX - oldX) <= 1 && Math.abs(addY - oldY) <= 1) {
                    canBeAdded = false;
                    break;
                }
            }

            if (canBeAdded) {
                added.push(add);

                [mustBe, canNotBe, solutionCount] = this.bruteforceGroup(board, group, mustBe, canNotBe, solutionCount, added, starNum, size);

                added.pop();
            }
        }

        return [mustBe, canNotBe, solutionCount];
    }

    private static solveGroups(board: number[][], task: number[][][], parent: IStars): number[][] {
        for (let groupId = 0; groupId < task.length; groupId++) {
            let group = task[groupId];
            let mustBe = Utils.createArray2d(parent.size, parent.size, 0);
            let canNotBe = Utils.createArray2d(parent.size, parent.size, 0);
            let solutionCount = 0;
            let starNum = parent.startCount;
            for (let i = 0; i < group.length; i++) {
                if (board[group[i][1]][group[i][0]] === 2) {
                    starNum --;
                }
            }

            if (starNum > 0) {
                [mustBe, canNotBe, solutionCount] = this.bruteforceGroup(board, group, mustBe, canNotBe, solutionCount, [], starNum, parent.size);

                for (let y = 0; y < parent.size; y++) {
                    for (let x = 0; x < parent.size; x++) {
                        if (mustBe[y][x] === solutionCount) {
                            board[y][x] &= 2;
                        }
                        if (canNotBe[y][x] === solutionCount) {
                            board[y][x] &= 1;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveCycle(board: number[][], task: number[][][], parent: IStars): number[][] {
        board = this.solveStarTouch(board, parent);
        board = this.solveGroupCount(board, task, parent);
        board = this.solveGroups(board, task, parent);

        return board;
    }

    private static countValues(board: number[][], parent: IStars): number {
        let valuesCount = 0;
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                valuesCount += Utils.countBits32(board[y][x]);
            }
        }

        return valuesCount;
    }

    private static getGroupsTask(parent: IStars): number[][][] {
        let task = GroupGenerator.boardToGroups(parent.task, parent.size, parent.size);
        for (let y = 0; y < parent.size; y++) {
            let row = [];
            for (let x = 0; x < parent.size; x++) {
                row.push([x, y]);
            }
            task.push(row);
        }
        for (let x = 0; x < parent.size; x++) {
            let column = [];
            for (let y = 0; y < parent.size; y++) {
                column.push([x, y]);
            }
            task.push(column);
        }

        return task;
    }

    private static findSplit(board: number[][], task: number[][][], parent: IStars): number[] {
        let smallestGroup = 0;
        let smallestSize = parent.size * parent.size;
        for (let i = 0; i < task.length; i++) {
            let groupSize = 0;
            for (let j = 0; j < task[i].length; j++) {
                let x = task[i][j][0];
                let y = task[i][j][1];
                if (board[y][x] === 3) {
                    groupSize ++;
                }
            }
            if (groupSize > 0 && groupSize < smallestSize) {
                smallestGroup = i;
                smallestSize = groupSize;
            }
        }

        for (let i = 0; i < task[smallestGroup].length; i++) {
            let x = task[smallestGroup][i][0];
            let y = task[smallestGroup][i][1];
            if (board[y][x] === 3) {
                return [x, y];
            }
        }

        throw "StarSolver->findSplit - NO SQUARE TO SPLIT";
    }

    private static updateBoard(board: number[][], add: number[][]): number[][] {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                board[i][j] |= add[i][j];
            }
        }

        return board;
    }

    private static splitSolve(inputBoard: number[][], task: number[][][], depth: number, parent: IStars): number[][] {
        let board = Utils.deepcopyArray2d(inputBoard);

        if (depth > this.MAX_DEPTH) {
            return board;
        }

        let previousValuesCount = null;
        let valuesCount = this.countValues(board, parent);
        while (valuesCount !== previousValuesCount) {
            board = this.solveCycle(board, task, parent);

            previousValuesCount = valuesCount;
            valuesCount = this.countValues(board, parent);
        }

        let solutionCount = this.countSolutions(board, parent);
        if (solutionCount === 0) {
            return Utils.createArray2d(parent.size, parent.size, 0);
        } else if (solutionCount === 1) {
            return board;
        }

        let boardTotal = Utils.createArray2d(parent.size, parent.size, 0);
        let split = this.findSplit(board, task, parent);
        for (let add = 1; add <= 2; add++) {
            board[split[1]][split[0]] = add;

            boardTotal = this.updateBoard(boardTotal, this.splitSolve(board, task, depth + 1, parent));

            let solutionCount = this.countSolutions(boardTotal, parent);
            if (solutionCount > 1) {
                return boardTotal;
            }
        }

        return boardTotal;
    }

    public static solve(inputBoard: number[][], parent: IStars): number[][] {
        let board = Utils.deepcopyArray2d(inputBoard);

        let task = this.getGroupsTask(parent);

        board = this.splitSolve(board, task, 0, parent);

        return board;
    }

    public static countSolutions(board: number[][], parent: IStars): number {
        let isSolved = true;
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (board[y][x] === 0) {
                    return 0;
                } else if (board[y][x] === 3) {
                    isSolved = false;
                }
            }
        }
        if (isSolved) {
            return 1;
        } else {
            return 2;
        }
    }
}