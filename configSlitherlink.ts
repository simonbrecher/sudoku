class ConfigSlitherlink implements IConfigSlitherlink {
    public width: number;
    public height: number;
    public topBorder: boolean;
    public leftBorder: boolean;
    public task: (number | null)[][];

    public squares: boolean[][][];
    public crosses: boolean[][][];

    private lastPrintedSquares: null | boolean[][][] = null;
    private lastPrintedCrosses: null | boolean[][][] = null;

    constructor(topBorder: boolean, leftBorder: boolean, numbers: number[][], minWidth: number = 0, minHeight: number = 0) {
        let width = 0;
        let height = 0;
        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i][0] >= width) {
                width = numbers[i][0] + 1;
            }
            if (numbers[i][1] >= height) {
                height = numbers[i][1] + 1;
            }
        }
        height += topBorder ? 0 : 1;
        width += leftBorder ? 0 : 1;
        this.width = Math.max(width + 1, minWidth);
        this.height = Math.max(height + 1, minHeight);

        this.topBorder = topBorder;
        this.leftBorder = leftBorder;

        this.task = this.createTask(numbers);
        this.squares = this.createSquares();
        this.crosses = this.createCrosses();
    }

    private createBooleanArray(width: number, height: number): boolean[][][] {
        let arr = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                let possibleValues = [];
                for (let i = 0; i < 15; i++) {
                    possibleValues.push(true);
                }
                possibleValues.push(false);
                row.push(possibleValues);
            }
            arr.push(row);
        }

        return arr;
    }

    private createSquares(): boolean[][][] {
        let squares = this.createBooleanArray(this.width, this.height);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                for (let i = 0; i < 16; i++) {
                    let bitCount = Utils.countBits32(i);
                    let prompterNumber = this.task[y][x];
                    if (prompterNumber !== null) {
                        if (bitCount !== prompterNumber) {
                            squares[y][x][i] = false;
                        }
                    }
                }
            }
        }

        return squares;
    }

    private createCrosses(): boolean[][][] {
        let crosses = this.createBooleanArray(this.width + 1, this.height + 1);

        for (let y = 0; y < this.height + 1; y++) {
            for (let x = 0; x < this.width + 1; x++) {
                for (let i = 0; i < 16; i++) {
                    let bitCount = Utils.countBits32(i);
                    if (bitCount !== 0 && bitCount !== 2) {
                        crosses[y][x][i] = false;
                    } else if (y === 0 && (i & 1 << 0) !== 0 && this.topBorder || x === 0 && (i & 1 << 3) !== 0 && this.leftBorder) {
                        crosses[y][x][i] = false;
                    }
                }
            }
        }

        return crosses;
    }

    private createTask(numbers: number[][]): (number | null)[][] {
        let topBorderSpace = this.topBorder ? 0 : 1;
        let leftBorderSpace =  this.leftBorder ? 0 : 1;

        let task = Utils.createArray2d(this.width, this.height, null);

        for (let i = 0; i < numbers.length; i++) {
            task[numbers[i][1] + topBorderSpace][numbers[i][0] + leftBorderSpace] = numbers[i][2] ?? 1;
        }

        return task;
    }

    public updateArrays(): void {
        this.squares = this.createSquares();
        this.crosses = this.createCrosses();
    }

    public countPossible(possible: boolean[]): number {
        let possibleCount = 0;
        for (let i = 0; i < 16; i++) {
            if (possible[i]) {
                possibleCount ++;
            }
        }

        return possibleCount;
    }

    public countPrompters(): number {
        let total = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.task[y][x] !== null) {
                    total ++;
                }
            }
        }

        return total;
    }

    public countAllPossible(): number {
        let total = 0;
        for (let y = 0; y < this.height + 1; y++) {
            for (let x = 0; x < this.width + 1; x++) {
                total += this.countPossible(this.crosses[y][x]);
                if (x !== this.width && y !== this.height) {
                    total += this.countPossible(this.squares[y][x]);
                }
            }
        }

        return total;
    }

    public countSolutions(): number {
        let lines = this.getLines();
        let isSolved = true;
        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i].length; j++) {
                for (let k = 0; k < lines[i][j].length; k++) {
                    let value = lines[i][j][k];
                    if (value === 0) {
                        return 0;
                    } else if (value === 3) {
                        isSolved = false;
                    }
                }
            }
        }
        if (isSolved) {
            return 1;
        } else {
            return 2;
        }
    }

    public hasNoLoop(): boolean {
        let lines = this.getLines();

        let freeSquares = Utils.createArray2d(this.width, this.height, false);
        for (let x = 0; x < this.width; x++) {
            if (lines[0][0][x] !== 2) {
                freeSquares[0][x] = true;
            }
            if (lines[0][this.height][x] !== 2) {
                freeSquares[this.height - 1][x] = true;
            }
        }
        for (let y = 0; y < this.height; y++) {
            if (lines[1][y][0] !== 2) {
                freeSquares[y][0] = true;
            }
            if (lines[1][y][this.width] !== 2) {
                freeSquares[y][this.width - 1] = true;
            }
        }

        for (let startY = 0; startY < this.height; startY++) {
            for (let startX = 0; startX < this.width; startX++) {
                if (! freeSquares[startY][startX]) {

                    let isFree = false;
                    let deck = [[startX, startY]];
                    let already = new Set();
                    while (deck.length > 0) {
                        let removed = deck.pop();

                        // @ts-ignore
                        let removedX = removed[0];
                        // @ts-ignore
                        let removedY = removed[1];
                        let removedIndex = removedY * this.width + removedX;

                        already.add(removedIndex);

                        if (! freeSquares[removedY][removedX]) {

                            freeSquares[removedY][removedX] = true;

                            if (removedX !== 0) {
                                if (lines[1][removedY][removedX] !== 2) {
                                    if (! already.has(removedIndex - 1)) {
                                        if (freeSquares[removedY][removedX - 1]) {
                                            isFree = true;
                                        }
                                        deck.push([removedX - 1, removedY]);
                                    }
                                }
                            }
                            if (removedX !== this.width - 1) {
                                if (lines[1][removedY][removedX + 1] !== 2) {
                                    if (! already.has(removedIndex + 1)) {
                                        if (freeSquares[removedY][removedX + 1]) {
                                            isFree = true;
                                        }
                                        deck.push([removedX + 1, removedY]);
                                    }
                                }
                            }
                            if (removedY !== 0) {
                                if (lines[0][removedY][removedX] !== 2) {
                                    if (! already.has(removedIndex - this.width)) {
                                        if (freeSquares[removedY - 1][removedX]) {
                                            isFree = true;
                                        }
                                        deck.push([removedX, removedY - 1]);
                                    }
                                }
                            }
                            if (removedY !== this.height - 1) {
                                if (lines[0][removedY + 1][removedX] !== 2) {
                                    if (! already.has(removedIndex + this.width)) {
                                        if (freeSquares[removedY + 1][removedX]) {
                                            isFree = true;
                                        }
                                        deck.push([removedX, removedY + 1]);
                                    }
                                }
                            }
                        }
                    }

                    if (! isFree) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private setSquareLineBinary(x: number, y: number, position: number, value: 0 | 1): void {
        for (let i = 0; i < 16; i++) {
            if ((i & 1 << position) !== value << position) {
                this.squares[y][x][i] = false;
            }
        }
    }

    private setLineBinary(direction: 0 | 1, x: number, y: number, value: 0 | 1): void {
        if (direction === 0) {
            if (y !== this.height) {
                this.setSquareLineBinary(x, y, 0, value);
            } else {
                this.setSquareLineBinary(x, this.height - 1, 2, value);
            }
        } else {
            if (x !== this.width) {
                this.setSquareLineBinary(x, y, 3, value);
            } else {
                this.setSquareLineBinary(this.width - 1, y, 1, value);
            }
        }
    }

    public setLine(direction: 0 | 1, x: number, y: number, value: number): void {
        for (let binary = 0; binary <= 1; binary++) {
            if ((value & 1 << (1 ^ binary)) === 0) {
                // @ts-ignore
                this.setLineBinary(direction, x, y, binary);
            }
        }
    }

    public setAllLines(lines: number[][][]): void {
        this.updateArrays();

        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i].length; j++) {
                for (let k = 0; k < lines[i][j].length; k++) {
                    //@ts-ignore
                    this.setLine(i, k, j, lines[i][j][k]);
                }
            }
        }
    }

    private getLinesFromPossible(possible: boolean[]): number[] {
        let lines = [];
        for (let i = 0; i < 4; i++) {
            lines.push(0);
        }

        for (let i = 0; i < 16; i++) {
            if (possible[i]) {
                for (let j = 0; j < 4; j++) {
                    lines[j] |= 1 << (i >> j & 1)
                }
            }
        }

        return lines;
    }

    private andLines(x: number, y: number, value: number, lines: number[][]): void {
        if (x >= 0 && x < lines[0].length && y >= 0 && y < lines.length) {
            lines[y][x] &= value;
        }
    }

    public getLines(): number[][][] {
        let lines: number[][][] = [[], []];
        for (let y = 0; y < this.height + 1; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(3);
            }
            lines[0].push(row);
        }
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width + 1; x++) {
                row.push(3);
            }
            lines[1].push(row);
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let possibleSquare = this.getLinesFromPossible(this.squares[y][x]);
                this.andLines(x, y, possibleSquare[0], lines[0]);
                this.andLines(x + 1, y, possibleSquare[1], lines[1]);
                this.andLines(x, y + 1, possibleSquare[2], lines[0]);
                this.andLines(x, y, possibleSquare[3], lines[1]);
            }
        }
        for (let y = 0; y < this.height + 1; y++) {
            for (let x = 0; x < this.width + 1; x++) {
                let possibleSquare = this.getLinesFromPossible(this.crosses[y][x]);
                this.andLines(x, y - 1, possibleSquare[0], lines[1]);
                this.andLines(x, y, possibleSquare[1], lines[0]);
                this.andLines(x, y, possibleSquare[2], lines[1]);
                this.andLines(x - 1, y, possibleSquare[3], lines[0]);
            }
        }

        return lines;
    }

    public render(isEmpty: boolean): void {
        let lines  = this.getLines();

        let pageWrapper = document.getElementById("page-wrapper");

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("slitherlink-table");

        for (let y = 0; y < this.height; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < this.width; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                let prompter = this.task[y][x];
                if (prompter !== null) {
                    squareDiv.textContent = prompter.toString();
                }

                this.setBorderColor(column, x, y, lines, isEmpty);

                let diagonal = document.createElement("div");
                diagonal.classList.add("diagonal-small");
                diagonal.classList.add("diagonal-small-top-left");
                if (x === 0 && this.leftBorder && y === 0 && this.topBorder) {
                    diagonal.classList.add("diagonal-small-corner");
                } else if ((x === 0 && this.leftBorder) || (y === 0 && this.topBorder)) {
                    diagonal.classList.add("diagonal-small-edge");
                }
                column.appendChild(diagonal);
                if (x === this.width - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal-small");
                    diagonal2.classList.add("diagonal-small-top-right");
                    column.appendChild(diagonal2);
                    if (y === 0 && this.topBorder) {
                        diagonal2.classList.add("diagonal-small-edge");
                    }
                }
                if (y === this.height - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal-small");
                    diagonal2.classList.add("diagonal-small-bottom-left");
                    column.appendChild(diagonal2);
                    if (x === 0 && this.leftBorder) {
                        diagonal2.classList.add("diagonal-small-edge");
                    }
                }
                if (x === this.width - 1 && y === this.height - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal-small");
                    diagonal2.classList.add("diagonal-small-bottom-right");
                    column.appendChild(diagonal2);
                }
            }
        }
    }

    private updateLastPrinted(): void {
        this.lastPrintedSquares = Utils.deepcopy(this.squares);
        this.lastPrintedCrosses = Utils.deepcopy(this.crosses);
    }

    private isLastUpdated(x: number, y: number, isSquares: boolean): boolean {
        let array = isSquares ? this.lastPrintedSquares : this.lastPrintedCrosses;
        let newArray = isSquares ? this.squares : this.crosses;

        if (array === null) {
            return false;
        }

        return this.countPossible(newArray[y][x]) !== this.countPossible(array[y][x]);
    }

    private getColorClass(x: number, y: number, isSquares: boolean): string {
        let newArray = isSquares ? this.squares : this.crosses;
        if (this.countPossible(newArray[y][x]) === 0) {
            return "error";
        } else if (this.isLastUpdated(x, y, isSquares) && this.countPossible(newArray[y][x]) === 1) {
            return "just-solved";
        } else if (this.isLastUpdated(x, y, isSquares)) {
            return "updated";
        } else if (this.countPossible(newArray[y][x]) === 1) {
            return "solved";
        } else {
            return "none";
        }
    }

    private getColorClassForLines(value: number, isEmpty: boolean): string {
        if (isEmpty) {
            return "white";
        }
        switch (value) {
            case 1: {
                return "white";
            }
            case 2: {
                return "black";
            }
            case 3: {
                return "gray";
            }
            default: {
                return "red";
            }
        }
    }

    private setBorderColor(td: HTMLTableDataCellElement, x: number, y: number, lines: number[][][], isEmpty: boolean): void {
        td.classList.add(`border-top-${this.getColorClassForLines(lines[0][y][x], isEmpty)}`);
        td.classList.add(`border-right-${this.getColorClassForLines(lines[1][y][x + 1], isEmpty)}`);
        td.classList.add(`border-bottom-${this.getColorClassForLines(lines[0][y + 1][x], isEmpty)}`);
        td.classList.add(`border-left-${this.getColorClassForLines(lines[1][y][x], isEmpty)}`);
    }

    public renderCount(): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("slitherlink-table");
        boardTable.classList.add("slitherlink-table-strong-border");

        let lines = this.getLines();

        for (let y = 0; y < this.height; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < this.width; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                squareDiv.textContent = this.countPossible(this.squares[y][x]).toString();
                squareDiv.classList.add(this.getColorClass(x, y, true));

                this.setBorderColor(column, x, y, lines, false);

                let diagonal = document.createElement("div");
                diagonal.classList.add("diagonal");
                diagonal.classList.add("diagonal-top-left");
                diagonal.textContent = this.countPossible(this.crosses[y][x]).toString();
                column.appendChild(diagonal);
                diagonal.classList.add(this.getColorClass(x, y, false));
                if (x === this.width - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal");
                    diagonal2.classList.add("diagonal-top-right");
                    diagonal2.textContent = this.countPossible(this.crosses[y][x + 1]).toString();
                    column.appendChild(diagonal2);
                    diagonal2.classList.add(this.getColorClass(x + 1, y, false));
                }
                if (y === this.height - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal");
                    diagonal2.classList.add("diagonal-bottom-left");
                    diagonal2.textContent = this.countPossible(this.crosses[y + 1][x]).toString();
                    column.appendChild(diagonal2);
                    diagonal2.classList.add(this.getColorClass(x, y + 1, false));
                }
                if (x === this.width - 1 && y === this.height - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal");
                    diagonal2.classList.add("diagonal-bottom-right");
                    diagonal2.textContent = this.countPossible(this.crosses[y + 1][x + 1]).toString();
                    column.appendChild(diagonal2);
                    diagonal2.classList.add(this.getColorClass(x + 1, y + 1, false));
                }
            }
        }

        this.updateLastPrinted();
    }

    public copy(): IConfigSlitherlink {
        let slitherlink = new ConfigSlitherlink(this.topBorder, this.leftBorder, [], this.width, this.height);

        slitherlink.task = Utils.deepcopy(this.task);
        slitherlink.squares = Utils.deepcopy(this.squares);
        slitherlink.crosses = Utils.deepcopy(this.crosses);

        return slitherlink;
    }
}