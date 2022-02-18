/**
 * Class for globally used and random methods.
 */
class Utils {
    /**
     * Gen binary representation of prompter on side of abc
     * @param dir           0: row from left, 1: row from right, 2: column from top, 3: column from bottom
     * @param position      x/y coordinate of row/column
     * @param task          sudoku.task (the abc version)
     */
    public static getAbcFirstValue(dir: number, position: number, task: number[][]): number {
        return task[dir][position];
    }

    /**
     * Get binary representation of prompter on the other side of abc
     * @param dir           0: row from left, 1: row from right, 2: column from top, 3: column from bottom
     * @param position      x/y coordinate of row/column
     * @param task          sudoku.task (the abc version)
     */
    public static getAbcLastValue(dir: number, position: number, task: number[][]): number {
        return task[dir ^ 1][position];
    }

    /**
     * Get binary representation of all numbers that are not on prompter on any side in row/column
     * @param dir           0: row from left, 1: row from right, 2: column from top, 3: column from bottom
     * @param position      x/y coordinate of row/column
     * @param task          sudoku.task (the abc version)
     */
    public static getAbcMiddleValue(dir: number, position: number, task: number[][], parent: ISudoku): number {
        if (parent.abcNumber === null) {
            throw "Utils->getAbcMiddle - parent.abcNumber === null";
        }
        return (1 << parent.abcNumber + 1) - 2 & ~ this.getAbcFirstValue(dir, position, task) & ~ this.getAbcLastValue(dir, position, task);
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
     * Return number of prompters in task of sudoku.
     * !! ONLY WORKS FOR PROMPTER THAT ARE NOT ON SIDE. IF GENERATING ABC TASK, NUMBER OF PROMPTERS IS ALWAYS 0.
     * @param board     2d array of binary representations of squares.
     * @return          Number of binary representations with one bit with 1.
     */
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

    /**
     * Return number of extra possible numbers on all squares.
     * Returns how many numbers you have to remove to have solved the puzzle.
     * @param board     2d array of binary representations of squares.
     * @return          SUM { ( number of 1 bits ) - 1 }
     */
    public static getExtraNum(board: number[][]): number {
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
     * In sudoku it is used by variations like kropki (or possibly killer)
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
        return arr.map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    /**
     * Get random order in which prompters will be removed from task, while creating task from solution.
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
     * Convert int you get from Utils.valueToChar() to string, which is later displayed on that square.
     *
     * For sudoku it is only a matter of type.
     * For Abc: 1 -> "-", 2 -> "A", 3 -> "B" ...
     */
    public static valueToChar(value: number, parent: ISudoku): string {
        if (parent.isABC) {
            return ["-", "A", "B", "C", "D", "E", "F", "G", "H", "I"][value - 1];
        }

        return value.toString();
    }

    /**
     * Check if VX sudoku has any prompter in square, which has V or X on any of its sides.
     * The reason for this is, that having prompter in square with V or X will ensure, that the other square will have known value.
     * I don't want to allow that.
     * @param task      2d array of binary representations of squares
     * @param parent    Sudoku object
     * @return          true iff any square with V or X is prompter (V and X in default settings, but it can be any sum)
     */
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

    /**
     * Check if it can be easily determined that abc has multiple solutions with all prompters on side.
     *
     * In 2x2 block it can be determined, when abc has multiple solutions:
     *
     * A-   can also be   -A   this is used to reduce number of tries we have to generate solution for abc
     * -A                 A-
     *
     * @param solution      Solution of abc puzzle
     * @param parent        Abc object (Same as Sudoku object)
     */
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