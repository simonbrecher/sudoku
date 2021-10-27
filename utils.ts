class Utils {
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

    public static countBits32(binary: number): number {
        binary -= (binary >>> 1) & 0x55555555;
        binary = (binary & 0x33333333) + ((binary >>> 2) & 0x33333333);
        binary = (binary + (binary >>> 4)) & 0x0F0F0F0F;
        binary += (binary >>> 8);
        binary += (binary >>> 16);
        return binary & 0x3F;
    }

    public static reverseBits32(binary: number): number {
        binary = (binary & 0x55555555) << 1 | (binary & 0xAAAAAAAA) >>> 1;
        binary = (binary & 0x33333333) << 2 | (binary & 0xCCCCCCCC) >>> 2;
        binary = (binary & 0x0F0F0F0F) << 4 | (binary & 0xF0F0F0F0) >>> 4;
        binary = (binary & 0x00FF00FF) << 8 | (binary & 0xFF00FF00) >>> 8;
        binary = (binary & 0x0000FFFF) << 16 | (binary & 0xFFFF0000) >>> 16;

        return binary;
    }

    public static getPrompterNum(board: number[][]): number {
        let total = 0;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                if (this.countBits32(board[y][x]) === 1) {
                    total++;
                }
            }
        }
        return total;
    }

    public static getExtraNum(board: number[][]): number {
        let total = 0;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                total += Math.max(0, this.countBits32(board[y][x]) - 1);
            }
        }
        return total;
    }

    public static getHasOneBit(board: number[][]): boolean[][] {
        let hasOneNumber = [];
        for (let y = 0; y < board.length; y++) {
            let row = [];
            for (let x = 0; x < board[y].length; x++) {
                row.push(this.countBits32(board[y][x]) === 1);
            }
            hasOneNumber.push(row);
        }
        return hasOneNumber;
    }

    public static createEmptyBoard(parent: ISudoku, forceHasSolution: boolean = false): number[][] {
        if (parent.isABC && parent.abcNumber !== null && (parent.hasSolution || forceHasSolution)) {
            let board = [];
            for (let y = 0; y < parent.size; y++) {
                let row = [];
                for (let x = 0; x < parent.size; x++) {
                    row.push((1 << parent.abcNumber + 1) - 1);
                }
                board.push(row);
            }
            return board;
        }
        let board = [];
        for (let y = 0; y < parent.size; y++) {
            let row = [];
            for (let x = 0; x < parent.size; x++) {
                row.push((1 << parent.size) - 1);
            }
            board.push(row);
        }
        return board;
    }

    public static chooseRandomBit(possible: number): number {
        if (possible === 0) {
            throw "Utils->chooseRandomBit - possible is 0";
        }

        let arr = [];
        let bit = 1;
        while (bit <= possible) {
            if ((possible & bit) !== 0) {
                arr.push(bit);
            }
            bit <<= 1;
        }
        let randomNumber = Math.floor(Math.random() * arr.length);
        return arr[randomNumber];
    }

    public static binaryToValue(binary: number) {
        if (binary === 0) {
            throw "Utils->binaryToValue - NO BITS";
        }
        if (this.countBits32(binary) !== 1) {
            throw "Utils->binaryToValue - MULTIPLE BITS";
        }
        let value = 1;
        while (binary !== 1) {
            binary >>= 1;
            value += 1;
        }
        return value;
    }

    public static getSolutionValues(solution: number[][]) {
        let solutionValues = [];
        for (let y = 0; y < solution.length; y++) {
            let row = [];
            for (let x = 0; x < solution[y].length; x++) {
                row.push(this.binaryToValue(solution[y][x]));
            }
            solutionValues.push(row);
        }
        return solutionValues;
    }

    private static shuffle(arr: any[]): any[] {
        return arr.map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    public static getUnknownOrder(parent: ISudoku): number[][] {
        let solution = parent.solution;

        let width, height;
        if (parent.isABC) {
            width = 4;
            height = parent.size;
        } else {
            width = parent.size;
            height = parent.size;
        }

        // let removeFirstBinary = 1 << Math.floor(Math.random() * parent.size);
        let beginning = [];
        let arr: number[][] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (solution === null) {
                    arr.push([x, y]);
                // } else if (solution[y][x] === removeFirstBinary && parent.isRemoveOne) {
                //     beginning.push([x, y]);
                // } else if (isVX && isSquareInVxSum[y][x]) {
                //     beginning.push([x, y]);
                } else {
                    arr.push([x, y]);
                }
            }
        }
        arr = this.shuffle(arr);
        for (let i = 0; i < arr.length; i++) {
            beginning.push(arr[i]);
        }
        return beginning;
    }

    public static deepcopyBoard(board: number[][]): number[][] {
        let copied = [];
        for (let y = 0; y < board.length; y++) {
            let row = [];
            for (let x = 0; x < board[y].length; x++) {
                row.push(board[y][x]);
            }
            copied.push(row);
        }
        return copied;
    }

    public static valueToChar(value: number, parent: ISudoku): string {
        if (parent.isABC) {
            return ["-", "A", "B", "C", "D", "E", "F", "G", "H", "I"][value - 1];
        }

        return value.toString();
    }

    public static hasPrompterInSum(task: number[][], parent: ISudoku): boolean {
        let solutionValues = this.getSolutionValues(parent.solution);
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (this.countBits32(task[y][x]) === 1) {
                    if (x !== 0) {
                        if (parent.getVxSumName(solutionValues[y][x] + solutionValues[y][x - 1]) !== null) {
                            return true;
                        }
                    }
                    if (x !== parent.size - 1) {
                        if (parent.getVxSumName(solutionValues[y][x] + solutionValues[y][x + 1]) !== null) {
                            return true;
                        }
                    }
                    if (y !== 0) {
                        if (parent.getVxSumName(solutionValues[y][x] + solutionValues[y - 1][x]) !== null) {
                            return true;
                        }
                    }
                    if (y !== parent.size - 1) {
                        if (parent.getVxSumName(solutionValues[y][x] + solutionValues[y + 1][x]) !== null) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    public static checkAbcSolutionUnambiguity(solution: number[][], parent: ISudoku): boolean {
        for (let i = 0; i < 3; i++) {
            let sizeX, sizeY;
            [sizeX, sizeY] = [[2, 2], [2, 3], [3, 2]][i];
            for (let y = 0; y <= parent.size - sizeY; y++) {
                for (let x = 0; x <= parent.size - sizeX; x++) {
                    let possible = 0;
                    let numberCount = 0;
                    for (let relativeY = 0; relativeY < sizeY; relativeY++) {
                        for (let relativeX = 0; relativeX < sizeX; relativeX++) {
                            possible |= solution[y + relativeY][x + relativeX];
                            if (solution[y + relativeY][x + relativeX] !== 1) {
                                numberCount ++;
                            }
                        }
                    }
                    if (this.countBits32(possible) === 1 && numberCount >= 2) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    public static getEmptyArray2d(width: number, height: number): number[][] {
        let arr = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push(0);
            }
            arr.push(row);
        }
        return arr;
    }
}