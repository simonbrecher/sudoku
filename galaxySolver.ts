class GalaxySolver {
    private static solveNextToCenter(board: number[][], parent: IGalaxy): number[][] {
        for (let i = 0; i < parent.centers.length; i++) {
            let centerX, centerY, centerOffsetX, centerOffsetY;
            [centerX, centerY, centerOffsetX, centerOffsetY] = parent.centers[i];
            for (let offsetX = 0; offsetX <= centerOffsetX; offsetX++) {
                for (let offsetY = 0; offsetY <= centerOffsetY; offsetY++) {
                    board[centerY + offsetY][centerX + offsetX] &= 1 << i;
                }
            }
        }

        return board;
    }

    private static countOpposite(x: number, y: number, center: number[]): number[] {
        let newX = 2 * center[0] - x + center[2];
        let newY = 2 * center[1] - y + center[3];
        return [newX, newY];
    }

    private static solveCanBeOpposite(board: number[][], parent: IGalaxy): number[][] {
        for (let centerId = 0; centerId < parent.centers.length; centerId++) {
            for (let y = 0; y < parent.height; y++) {
                for (let x = 0; x < parent.width; x++) {
                    if ((board[y][x] & 1 << centerId) !== 0) {
                        let newX, newY;
                        [newX, newY] = this.countOpposite(x, y, parent.centers[centerId]);
                        let canBe = newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height;
                        if (canBe) {
                            if ((board[newY][newX] & 1 << centerId) === 0) {
                                canBe = false;
                            }
                        }
                        if (! canBe) {
                            board[y][x] &= ~ (1 << centerId);
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveMustBeOpposite(board: number[][], parent: IGalaxy): number[][] {
        for (let centerId = 0; centerId < parent.centers.length; centerId++) {
            for (let y = 0; y < parent.height; y++) {
                for (let x = 0; x < parent.width; x++) {
                    if (board[y][x] === 1 << centerId) {
                        let newX, newY;
                        [newX, newY] = this.countOpposite(x, y, parent.centers[centerId]);
                        if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                            board[newY][newX] &= 1 << centerId;
                        }
                    }
                }
            }
        }

        return board;
    }

    private static solveOrthogonal(board: number[][], parent: IGalaxy): number[][] {
        let newBoard = Utils.createArray2d(parent.width, parent.height, 0);

        for (let centerId = 0; centerId < parent.centers.length; centerId++) {
            let center = parent.centers[centerId];
            let deck = [[center[0], center[1]]];
            while (deck.length > 0) {
                let removed = deck.pop();
                // @ts-ignore
                let removedX = removed[0];
                // @ts-ignore
                let removedY = removed[1];
                if ((newBoard[removedY][removedX] & 1 << centerId) === 0 && (board[removedY][removedX] & 1 << centerId) !== 0) {
                    newBoard[removedY][removedX] |= 1 << centerId;
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        for (let dirX = -1; dirX <= 1; dirX++) {
                            if ((dirX === 0) !== (dirY === 0)) {
                                let newX = removedX + dirX;
                                let newY = removedY + dirY;
                                if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                                    deck.push([newX, newY]);
                                }
                            }
                        }
                    }
                }
            }
        }

        return newBoard;
    }

    private static solveCycle(board: number[][], parent: IGalaxy): number[][] {
        board = this.solveNextToCenter(board, parent);
        board = this.solveCanBeOpposite(board, parent);
        board = this.solveMustBeOpposite(board, parent);
        board = this.solveOrthogonal(board, parent);

        return board;
    }

    private static countExtra(board: number[][], parent: IGalaxy): number {
        let extra = 0;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                extra += Utils.countBits32(board[y][x]) - 1;
            }
        }

        return extra;
    }

    public static countSolutions(board: number[][], parent: IGalaxy): number {
        let isSolved = true;
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (board[y][x] === 0) {
                    return 0;
                } else if (Utils.countBits32(board[y][x]) > 1) {
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

    public static solve(inputBoard: number[][], parent: IGalaxy): number[][] {
        let board = Utils.deepcopyArray2d(inputBoard);

        let extraPrevious = null;
        let extra = this.countExtra(board, parent);

        while (extra !== extraPrevious) {
            board = this.solveCycle(board, parent);

            extraPrevious = extra;
            extra = this.countExtra(board, parent);
        }

        return board;
    }
}