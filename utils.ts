class Utils {
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

    public static binaryToShift(binary: number) {
        if (binary === 0) {
            throw "Utils->binaryToValue - NO BITS";
        }
        if (this.countBits32(binary) !== 1) {
            throw "Utils->binaryToValue - MULTIPLE BITS";
        }
        let value = 0;
        while (binary !== 1) {
            binary >>= 1;
            value += 1;
        }
        return value;
    }

    public static shuffle(arr: any[]): any[] {
        for (let i = 0; i < arr.length; i++) {
            let randomNumber = Math.floor(Math.random() * (arr.length - i)) + i;
            let a = arr[i];
            arr[i] = arr[randomNumber];
            arr[randomNumber] = a;
        }

        return arr;
    }

    public static getUnknownOrderTask(parent: ISudoku): number[][] {
        let arr: number[][] = [];
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                arr.push([x, y]);
            }
        }
        return this.shuffle(arr);
    }

    public static getUnknownOrderSideTask(parent: ISudoku): number[][] {
        let arr: number[][] = [];
        for (let dir = 0; dir < 4; dir++) {
            for (let position = 0; position < parent.size; position++) {
                arr.push([dir, position]);
            }
        }
        return this.shuffle(arr);
    }

    public static getUnknownOrderOrthogonalTask(parent: ISudoku): number[][] {
        let arr: number[][] = [];
        for (let y = 0; y < parent.size; y++) {
            for (let x = 0; x < parent.size; x++) {
                if (x !== parent.size) {
                    arr.push([x, y, 0]);
                }
                if (y !== parent.size) {
                    arr.push([x, y, 1]);
                }
            }
        }
        return this.shuffle(arr);
    }

    public static deepcopyArray1d(board: number[][]): number[][] {
        let copied = [];
        for (let i = 0; i < board.length; i++) {
            copied.push(board[i]);
        }
        return copied;
    }

    public static deepcopyArray2d(board: number[][]): number[][] {
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

    public static deepcopy(value: any): any {
        if (typeof value === "object" && value !== null) {
            let output = [];
            for (let i = 0; i < value.length; i++) {
                output.push(this.deepcopy(value[i]));
            }
            return output;
        } else {
            return value;
        }
    }

    public static createArray1d(size: number, value: any): any[] {
        let arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(value);
        }

        return arr;
    }

    public static createArray2d(width: number, height: number, value: any): any[][] {
        let arr = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push(value);
            }
            arr.push(row);
        }

        return arr;
    }

    public static createArray3d(width: number, height: number, third: number, value: any): any[][][] {
        let arr = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                let column = [];
                for (let z = 0; z < third; z++) {
                    column.push(value);
                }
                row.push(column);
            }
            arr.push(row);
        }

        return arr;
    }
}