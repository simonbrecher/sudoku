class Slitherlink implements ISlitherlink {
    public width: number;
    public height: number;
    public coral: number[][];
    public task: (number | null)[][];
    public squares: boolean[][][];
    public crosses: boolean[][][];

    private lastPrintedSquares: null | boolean[][][] = null;
    private lastPrintedCrosses: null | boolean[][][] = null;

    constructor(width: number, height: number, coral: number[][]) {
        this.width = width;
        this.height = height;
        this.coral = Utils.deepcopyArray2d(coral);
        this.task = this.createTask();
        this.squares = this.createSquares();
        this.crosses = this.createCrosses();
    }

    public updateArrays(): void {
        this.squares = this.createSquares();
        this.crosses = this.createCrosses();
    }

    public removeNumbers(probability: number): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (Math.random() < probability) {
                    this.task[y][x] = null;
                }
            }
        }

        this.updateArrays();
    }

    private getCoralValue(x: number, y: number): number {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.coral[y][x];
        } else {
            return 1;
        }
    }

    private countPossible(possible: boolean[]): number {
        let possibleCount = 0;
        for (let i = 0; i < 16; i++) {
            if (possible[i]) {
                possibleCount ++;
            }
        }

        return possibleCount;
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

    public render(isSolved: boolean, isEmpty: boolean = false): void {
        let lines = null;
        if (isSolved) {
            lines = this.getLines();
        }

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

                if (isSolved && lines !== null) {
                    this.setBorderColor(column, x, y, lines, isEmpty);
                } else {
                    let value = this.coral[y][x];
                    if (value !== this.getCoralValue(x - 1, y)) {
                        column.classList.add("border-left");
                    }
                    if (value !== this.getCoralValue(x + 1, y)) {
                        column.classList.add("border-right");
                    }
                    if (value !== this.getCoralValue(x, y - 1)) {
                        column.classList.add("border-top");
                    }
                    if (value !== this.getCoralValue(x, y + 1)) {
                        column.classList.add("border-bottom");
                    }
                }

                let diagonal = document.createElement("div");
                diagonal.classList.add("diagonal-black");
                diagonal.classList.add("diagonal-black-top-left");
                column.appendChild(diagonal);
                if (x === this.width - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal-black");
                    diagonal2.classList.add("diagonal-black-top-right");
                    column.appendChild(diagonal2);
                }
                if (y === this.height - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal-black");
                    diagonal2.classList.add("diagonal-black-bottom-left");
                    column.appendChild(diagonal2);
                }
                if (x === this.width - 1 && y === this.height - 1) {
                    let diagonal2 = document.createElement("div");
                    diagonal2.classList.add("diagonal-black");
                    diagonal2.classList.add("diagonal-black-bottom-right");
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

    private createTask(): number[][] {
        let task = [];
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                let prompterNumber = 0;
                let inside = this.coral[y][x];
                for (let dirY = -1; dirY <= 1; dirY++) {
                    for (let dirX = -1; dirX <= 1; dirX++) {
                        if ((dirX === 0) !== (dirY === 0)) {
                            if (inside !== this.getCoralValue(x + dirX, y + dirY)) {
                                prompterNumber ++;
                            }
                        }
                    }
                }
                row.push(prompterNumber);
            }
            task.push(row);
        }
        return task;
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
                    } else if (y === 0 && (i & 1 << 0) !== 0 || x === this.width && (i & 1 << 1) !== 0 || y === this.height && (i & 1 << 2) !== 0 || x === 0 && (i & 1 << 3) !== 0) {
                        crosses[y][x][i] = false;
                    }
                }
            }
        }

        return crosses;
    }

    public static main() {
        CoralGenerator.typeSlitherlink();

        let width = 10;
        let height = 10;

        let coral = CoralGenerator.build(width, height);

        if (coral !== null) {
            let slitherlink = new Slitherlink(width, height, coral);
            slitherlink.render(false);
            slitherlink.renderCount();
        }
    }
}