/**
 * Class for globally used and random methods.
 */
class Utils {
    /**
     * Count number of 1 bits in int32
     * @param binary    Binary representation of a square.
     * @return          Number of bits with 1.
     */
    public static countBits32(binary: number): number {
        binary -= (binary >>> 1) & 0x55555555;
        binary = (binary & 0x33333333) + ((binary >>> 2) & 0x33333333);
        binary = (binary + (binary >>> 4)) & 0x0F0F0F0F;
        binary += (binary >>> 8);
        binary += (binary >>> 16);
        return binary & 0x3F;
    }

    /**
     * Reverse order of bits in int32
     * @param binary    Binary representation of a square.
     * @return          Bits in reversed order.
     */
    public static reverseBits32(binary: number): number {
        binary = (binary & 0x55555555) << 1 | (binary & 0xAAAAAAAA) >>> 1;
        binary = (binary & 0x33333333) << 2 | (binary & 0xCCCCCCCC) >>> 2;
        binary = (binary & 0x0F0F0F0F) << 4 | (binary & 0xF0F0F0F0) >>> 4;
        binary = (binary & 0x00FF00FF) << 8 | (binary & 0xFF00FF00) >>> 8;
        binary = (binary & 0x0000FFFF) << 16 | (binary & 0xFFFF0000) >>> 16;

        return binary;
    }

    /**
     * Return number of known digits in task of sudoku.
     * !! ONLY WORKS FOR KNOWN DIGITS THAT ARE NOT ON SIDE. IF GENERATING ABC TASK, NUMBER OF GIVEN DIGITS IS ALWAYS 0.
     * @param board     2d array of binary representations of squares.
     * @return          Number of binary representations with one bit with 1.
     */
    public static getKnownDigitsCount(board: number[][]): number {
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

    /**
     * Return number of extra possible numbers on all squares.
     * Returns how many numbers you have to remove to have solved the puzzle.
     * @param board     2d array of binary representations of squares.
     * @return          SUM { ( number of 1 bits ) - 1 }
     */
    public static getExtraDigitsCount(board: number[][]): number {
        let total = 0;
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                total += Math.max(0, this.countBits32(board[y][x]) - 1);
            }
        }
        return total;
    }

    /**
     * Get array saying which squares have only one possible value.
     * @param board     2d array of binary representations of squares.
     * @return          bool[][] saying which squares have one bit with 1.
     */
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

    /**
     * Get 2d array with binary representations of squares, corresponding to puzzle, where all numbers can be on all squares.
     * @param parent            Sudoku object.
     * @param forceHasSolution  ↓
     * When abc solutions is created, it is created as "regular sudoku" solution and then converted to abc solution. (multiple numbers to spaces)
     * Since abc can have multiple spaces in one row/column, it has different number of values of square = different number of 1 bits in binary representation.
     * forceHasSolution == true -> if puzzle is abc, it will have shorter binary representation of square than sudoku, even if it does not have generated solution yet.
     * forceHasSolution == false -> if puzzle is abc, it will have shorter binary representation of square than sudoku, only if solution has already been generated
     */
    public static createEmptyBoard(parent: ISudoku, forceHasSolution: boolean = false): number[][] {
        if (parent.isABC && parent.abcCount !== null && (parent.hasSolution || forceHasSolution)) {
            let board = [];
            for (let y = 0; y < parent.size; y++) {
                let row = [];
                for (let x = 0; x < parent.size; x++) {
                    row.push((1 << parent.abcCount + 1) - 1);
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

    /**
     * Choose random bit with 1 from int32
     * @param possible      Binary representation of a square.
     * @return              Random binary representation of square, which has only one bit with 1 and that bit has 1 in parameter.
     * EXAMPLE: 0b1100 -> 0b0100 OR 0b1000
     */
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

    /**
     * Converts binary representation of a square to number, that it represents.
     *
     * In sudoku it is used by variants like kropki and vx sudoku.
     * It is used also by abc, before converting to letter representation.
     *
     * Sudoku: 0b1 -> 1, 0b10 -> 2, 0b100 -> 3 ...
     * Abc: 0b1 -> 1 (meaning "-"), 0b10 -> 2 (meaning "A"), 0b100 -> 3 (meaning "B") ...
     *
     * @param binary    Binary representation of a square. MUST HAVE ONLY ONE BIT WITH 1.
     * @return          Number in sudoku, which is represented by the binary representation.
     */
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

    /**
     * Converts 2d array of binary representations of squares to 2d array of sudoku numbers, which they represent.
     * @param solution      2d array of binary representations of squares
     * @return              2d array of numbers in sudoku
     */
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

    /**
     * Shuffle and return array.
     */
    private static shuffle(arr: any[]): any[] {
        for (let i = 0; i < arr.length; i++) {
            let randomNumber = Math.floor(Math.random() * (arr.length - i)) + i;
            let a = arr[i];
            arr[i] = arr[randomNumber];
            arr[randomNumber] = a;
        }

        return arr;
    }

    /**
     * Get random order in which given digits will be removed from task, while creating task from solution.
     * @param parent    sudoku object
     * @return          [x, y][] - positions of squares in random order
     */
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

        let beginning = [];
        let arr: number[][] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (solution === null) {
                    arr.push([x, y]);
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

    /**
     * Deepcopy number[][].
     */
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

    /**
     * Create 2d array with zeros by width and size.
     */
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