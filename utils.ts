class Utils {
    public static countBits32(binary: number): number {
        binary -= (binary >>> 1) & 0x55555555;
        binary = (binary & 0x33333333) + ((binary >>> 2) & 0x33333333);
        binary = (binary + (binary >>> 4)) & 0x0F0F0F0F;
        binary += (binary >>> 8);
        binary += (binary >>> 16);
        return binary & 0x3F;
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

    public static getHasOneNumber(board: number[][]): boolean[][] {
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

    public static createEmptyBoard(parent: ISudoku): number[][] {
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

    private static binaryToValue(binary: number) {
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

    private static getSolutionValues(solution: number[][]) {
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
        // let removeFirstBinary = 1 << Math.floor(Math.random() * parent.size);
        let beginning = [];
        let arr: number[][] = [];
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
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
}