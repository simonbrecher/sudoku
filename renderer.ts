class Renderer {
    private static readonly PAPER_HEIGHT = 1000;
    private static readonly PAPER_WIDTH = 710;

    private static _pageUsedHeight = 0;
    private static _pageUsedWidth = 0;
    private static _pageLineHeight = 0;
    public static doFormatPage = true;

    private static _width: number;
    private static _height: number;
    private static _fontRelativeSize: number;
    private static _vxBoxSizeRelative: number;
    private static _vxBoxFontSizeRelative: number;
    private static _typeDiagonalBoxSizeRelative: number;
    private static _typeDiagonalBoxFontSizeRelative: number;
    private static _kropkiBoxSizeRelative: number;
    private static _minusOneBoxSizeRelative: number;
    private static _inequalityBoxFontSizeRelative: number;
    private static _inequalityBoxSizeRelative: number;
    private static _killerSumBoxFontSizeRelative: number;
    private static _killerSumBoxSizeRelative: number;
    private static _innerFontRelativeSize: number;
    private static _romanBoxSizeRelative: number;
    private static _romanBoxFontSizeRelative: number;
    private static _marginLeft: number;
    private static _marginBottom: number;
    private static _smallBorderWidth: number;
    private static _bigBorderWidth: number;
    private static _maxSquareInnerCount: number;

    private static _boardCount: number = 0;

    public static zeroSymbol = "?";

    private static setDefault = (() => {
        Renderer.default();
    })();

    public static default(): void {
        this._width = 310;
        this._height = 310;
        this._fontRelativeSize = 0.7;
        this._vxBoxSizeRelative = 0.4;
        this._vxBoxFontSizeRelative = 1;
        this._kropkiBoxSizeRelative = 0.27;
        this._minusOneBoxSizeRelative = 0.2;
        this._inequalityBoxSizeRelative = 0.45;
        this._inequalityBoxFontSizeRelative = 1;
        this._killerSumBoxSizeRelative = 0.35;
        this._killerSumBoxFontSizeRelative = 1;
        this._typeDiagonalBoxSizeRelative = 0.4;
        this._typeDiagonalBoxFontSizeRelative = 0.9;
        this._innerFontRelativeSize = 0.8;
        this._romanBoxSizeRelative = 0.5;
        this._romanBoxFontSizeRelative = 0.7;
        this._marginLeft = 20; // 10
        this._marginBottom = 20; // 10
        this._smallBorderWidth = 1;
        this._bigBorderWidth = 3;
        this._maxSquareInnerCount = 4;
    }

    private static getKropkiColor(value1: number, value2: number, x: number, y: number, parent: ISudoku): "white" | "black" | null {
        let isWhite = value1 - value2 === 1 || value1 - value2 === -1;
        let isBlack = value1 === value2 * 2 || value1 * 2 === value2;

        if (isWhite && isBlack) {
            let vx1 = Utils.binaryToShift(parent.solution[0][x]);
            let vy1 = Utils.binaryToShift(parent.solution[y][0]);
            let vx2 = Utils.binaryToShift(parent.solution[parent.size - 1][x]);
            let vy2 = Utils.binaryToShift(parent.solution[y][parent.size - 1]);
            let vx = Utils.binaryToShift(parent.solution[vx1][vy2]);
            let vy = Utils.binaryToShift(parent.solution[vy1][vx2]);
            return (Utils.countBits32(vx ^ vy ^ value1)) % 2 === 0 ? "white" : "black";
        } else if (isWhite) {
            return "white";
        } else if (isBlack) {
            return "black";
        }

        return null;
    }

    public static breakPage(): void {
        if (this._pageUsedWidth !== 0 || this._pageUsedHeight !== 0) {
            let pageWrapper = document.getElementById("page-wrapper");
            let pageBreak = document.createElement("hr");
            pageBreak.classList.add("page-break");
            pageWrapper?.appendChild(pageBreak);
            // let leftMargin = document.createElement("div");
            // leftMargin.classList.add("left-margin");
            // pageWrapper?.appendChild(leftMargin);
            this._pageUsedHeight = 0;
            this._pageUsedWidth = 0;
            this._pageLineHeight = 0;
        }
    }

    public static refreshFormatting(): void {
        this._pageUsedHeight = 0;
        this._pageUsedWidth = 0;
        this._pageLineHeight = 0;
    }

    public static breakPageForce(): void {
        let pageWrapper = document.getElementById("page-wrapper");
        let pageBreak = document.createElement("hr");
        pageBreak.classList.add("page-break");
        pageWrapper?.appendChild(pageBreak);
    }

    public static breakLineForce(): void {
        let pageWrapper = document.getElementById("page-wrapper");
        let hr = document.createElement("hr");
        pageWrapper?.appendChild(hr);
    }

    private static shiftToChar(shift: number, parent: ISudoku): string {
        if (parent.isABC) {
            return ["A", "B", "C", "D", "E", "F", "G", "H", "I"][shift];
        }

        if (parent.isRoman) {
            // return ["I", "II", "III", "V", "VI", "VII", "VIII", "X", "XI"][shift];
            return ["1", "2", "3", "5", "6", "7", "8", "0", "9"][shift];
        }

        if (parent.isLetters) {
            return parent.letters[shift];
        }

        return (shift + 1).toString();
    }

    private static convertBinary(binary: number, parent: ISudoku, squareInnerCount: number): string | string[] {
        let bitCount = Utils.countBits32(binary);
        if (bitCount > squareInnerCount) {
            return " ";
        }
        if (parent.isABC && parent.abcNumber !== null) {
            if (binary === (1 << parent.abcNumber + 1) - 1) {
                return " ";
            }
        } else {
            if (binary === (1 << parent.size) - 1) {
                return " ";
            }
        }
        if (bitCount === 1) {
            // return binary.toString();
            return this.shiftToChar(Utils.binaryToShift(binary), parent);
        }
        if (binary === 0) {
            return this.zeroSymbol;
        }
        let values = [];
        let number = 1;
        while (binary !== 0) {
            if ((binary & 1) === 1) {
                values.push(this.shiftToChar(number, parent));
            }
            binary >>>= 1;
            number += 1;
        }
        return values;
    }

    private static getSideCharacter(value: number, parent: ISudoku, squareInnerCount: number): string {
        if (parent.isABC) {
            let add = this.convertBinary(value, parent, squareInnerCount);
            return add === "?" ? " " : add.toString();
        } else if (parent.isSkyscraper) {
            return value !== 0 ? value.toString() : " ";
        } else {
            return "!";
        }
    }

    private static convertSideBoard(board: number[][], parent: ISudoku, squareInnerCount: number): (string | string[])[][] {
        let task = parent.sideTask;
        if (task === null) {
            throw "Renderer->convertSideBoard - SIDE_TASK === NULL"
        }

        let arr: (string | string[])[][] = [];

        let row = [];
        row.push(" ");
        for (let x = 0; x < parent.size; x++) {
            row.push(this.getSideCharacter(task[2][x], parent, squareInnerCount));
        }
        row.push(" ");
        arr.push(row);

        for (let y = 0; y < board.length; y++) {
            row = [];
            row.push(this.getSideCharacter(task[0][y], parent, squareInnerCount));
            for (let x = 0; x < board[y].length; x++) {
                row.push(this.convertBinary(board[y][x], parent, squareInnerCount));
            }
            row.push(this.getSideCharacter(task[1][y], parent, squareInnerCount));
            arr.push(row);
        }

        row = [];
        row.push(" ");
        for (let x = 0; x < parent.size; x++) {
            row.push(this.getSideCharacter(task[3][x], parent, squareInnerCount));
        }
        row.push(" ");
        arr.push(row);

        return arr;
    }

    public static convertBoard(board: number[][], parent: ISudoku, squareInnerCount: number): (string | string[])[][] {
        if (parent.isABC || parent.isSkyscraper) {
            return this.convertSideBoard(board, parent, squareInnerCount);
        }

        let arr: (string | string[])[][] = [];
        for (let y = 0; y < board.length; y++) {
            let row = [];
            for (let x = 0; x < board[y].length; x++) {
                row.push(this.convertBinary(board[y][x], parent, squareInnerCount));
            }
            arr.push(row);
        }

        return arr;
    }

    private static addKillerLine(svg: SVGSVGElement, x1: number, y1: number, x2: number, y2: number): void {
        var line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',`${x1}px`);
        line.setAttribute('y1',`${y1}px`);
        line.setAttribute('x2',`${x2}px`);
        line.setAttribute('y2',`${y2}px`);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-dasharray", "3 1");
        svg.appendChild(line);
    }

    private static addKillerLines(x: number, y: number, column: HTMLElement, killerBoard: number[][], parent: ISudoku): void {
        let isSame = [];
        for (let dirY = -1; dirY <= 1; dirY++) {
            let row = [];
            for (let dirX = -1; dirX <= 1; dirX++) {
                let newX = x + dirX;
                let newY = y + dirY;
                if (newX >= 0 && newX < parent.size && newY >= 0 && newY < parent.size) {
                    row.push(killerBoard[y][x] === killerBoard[newY][newX]);
                } else {
                    row.push(false);
                }
            }
            isSame.push(row);
        }

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            useElem = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        useElem.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#down-arrow');
        svg.appendChild(useElem);

        column.appendChild(svg);

        let size = this.getSquareFullSize(parent);
        let padding = 2;

        if (! isSame[1][0]) {
            this.addKillerLine(svg, padding, isSame[0][1] ? 0 : padding, padding, size - (isSame[2][1] ? 0 : padding));
        }
        if (! isSame[1][2]) {
            this.addKillerLine(svg, size - padding, isSame[0][1] ? 0 : padding, size - padding, size - (isSame[2][1] ? 0 : padding));
        }
        if (! isSame[0][1]) {
            this.addKillerLine(svg, isSame[1][0] ? 0 : padding, padding, size - (isSame[1][2] ? 0 : padding), padding);
        }
        if (! isSame[2][1]) {
            this.addKillerLine(svg, isSame[1][0] ? 0 : padding, size - padding, size - (isSame[1][2] ? 0 : padding), size - padding);
        }
        if (! isSame[0][0] && isSame[0][1] && isSame[1][0]) {
            this.addKillerLine(svg, 0, padding, padding, padding);
            this.addKillerLine(svg, padding, 0, padding, padding);
        }
        if (! isSame[0][2] && isSame[0][1] && isSame[1][2]) {
            this.addKillerLine(svg, size, padding, size - padding, padding);
            this.addKillerLine(svg, size - padding, 0, size - padding, padding);
        }
        if (! isSame[2][0] && isSame[1][0] && isSame[2][1]) {
            this.addKillerLine(svg, 0, size - padding, padding, size - padding);
            this.addKillerLine(svg, padding, size, padding, size - padding);
        }
        if (! isSame[2][2] && isSame[1][2] && isSame[2][1]) {
            this.addKillerLine(svg, size, size - padding, size - padding, size - padding);
            this.addKillerLine(svg, size - padding, size, size - padding, size - padding);
        }
    }

    public static render(board: number[][] | null | undefined, parent: ISudoku | null | undefined, unsolved: number[][] | null = null, color: "red" | "green" | null = null): void {
        if (board === null || board === undefined || parent === null || parent === undefined) {
            return;
        }

        if (! parent.hasSolution) {
            return;
        }

        this.formatPage();

        let pageWrapper = document.getElementById("page-wrapper");

        let boardNum = this._boardCount;
        this._boardCount++;

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("board-table");
        boardTable.classList.add("board-table-" + boardNum.toString());

        if (color === "red") {
            boardTable.classList.add("red");
        }
        if (color === "green") {
            boardTable.classList.add("green");
        }

        this.setStyle(boardNum, parent);

        if (unsolved === null) {
            unsolved = Utils.deepcopyArray2d(board);
        }

        let squareInnerLinearCount = Math.ceil(Math.sqrt(Math.min(this._maxSquareInnerCount, parent.size)));

        let renderBoard = this.convertBoard(board, parent, Math.min(this._maxSquareInnerCount, parent.size));
        let size;
        if (parent.isABC || parent.isSkyscraper) {
            size = parent.size + 2;
        } else {
            size = parent.size;
        }
        let irregularBoard;
        if (parent.isIrregular) {
            // @ts-ignore
            irregularBoard = GroupGenerator.groupsToBoard(parent.irregularGroups, parent.size, parent.size);
        }
        let killerBoard;
        let killerAlreadyAdded;
        if (parent.isKiller) {
            // @ts-ignore
            killerBoard = GroupGenerator.groupsToBoard(parent.killerGroups, parent.size, parent.size);
            killerAlreadyAdded = [];
            // @ts-ignore
            for (let i = 0; i < parent.killerGroups; i++) {
                killerAlreadyAdded.push(false);
            }
        }
        for (let y = 0; y < size; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < size; x++) {
                let column = row.insertCell();
                this.addBorderStyle(x, y, column, irregularBoard, parent);

                let div = document.createElement("div");
                if (size === parent.size) {
                    if (board[y][x] !== unsolved[y][x]) {
                        column.classList.add("unsolved");
                    }
                }
                if (parent.isDiagonal) {
                    if (x === y || x + y + 1 === size) {
                        column.classList.add("diagonal");
                    }
                }
                column.appendChild(div);
                if (parent.isABC && y === 0 && x === 0) {
                    // @ts-ignore
                    div.textContent = parent.abcNumber.toString();
                    div.classList.add("square-full");
                    div.classList.add("small-font");
                } else if ((parent.isABC || parent.isSkyscraper) && (parent.isKingMove || parent.isKnightMove) && x === parent.size + 1 && y === 0) {
                    if (parent.isKingMove) {
                        div.textContent += "K";
                    }
                    if (parent.isKnightMove) {
                        div.textContent += "N";
                    }
                    div.classList.add("square-full");
                    div.classList.add("small-font");
                } else if (typeof renderBoard[y][x] === "string") {
                    div.textContent = renderBoard[y][x].toString();
                    div.classList.add("square-full");
                } else {
                    div.classList.add("square-full");
                    for (let innerY = 0; innerY < squareInnerLinearCount; innerY++) {
                        for (let innerX = 0; innerX < squareInnerLinearCount; innerX++) {
                            let innerId = innerY * squareInnerLinearCount + innerX;
                            let innerDiv = document.createElement("div");
                            div.appendChild(innerDiv);
                            innerDiv.classList.add("square-inner");
                            if (innerId < renderBoard[y][x].length) {
                                innerDiv.innerText = renderBoard[y][x][innerId];
                            } else {
                                innerDiv.innerText = " ";
                            }
                        }
                        if (innerY !== squareInnerLinearCount - 1) {
                            let hr = document.createElement("hr");
                            div.appendChild(hr);
                        }
                    }
                }
                if (parent.isVX) {
                    if (x !== size - 1) {
                        let sum = Utils.binaryToShift(parent.solution[y][x]) + Utils.binaryToShift(parent.solution[y][x + 1]) + 2;
                        if (parent.getVxSumName(sum) !== null) {
                            let div = document.createElement("div");
                            div.textContent = parent.getVxSumName(sum);
                            div.classList.add("orthogonal");
                            div.classList.add("orthogonal-horizontal");
                            column.appendChild(div);
                        }
                    }
                    if (y !== size - 1) {
                        let sum = Utils.binaryToShift(parent.solution[y][x]) + Utils.binaryToShift(parent.solution[y + 1][x]) + 2;
                        if (parent.getVxSumName(sum)) {
                            let div = document.createElement("div");
                            div.textContent = parent.getVxSumName(sum);
                            div.classList.add("orthogonal");
                            div.classList.add("orthogonal-vertical");
                            column.appendChild(div);
                        }
                    }
                }
                if (parent.isKropki) {
                    if (x !== size - 1) {
                        let value1 = Utils.binaryToShift(parent.solution[y][x]) + 1;
                        let value2 = Utils.binaryToShift(parent.solution[y][x + 1]) + 1;
                        let color = this.getKropkiColor(value1, value2, x, y, parent);
                        if (color !== null) {
                            let div = document.createElement("div");
                            div.textContent = " ";
                            div.classList.add("orthogonal");
                            div.classList.add(`orthogonal-${color}`);
                            div.classList.add("orthogonal-horizontal");
                            column.appendChild(div);
                        }
                    }
                    if (y !== size - 1) {
                        let value1 = Utils.binaryToShift(parent.solution[y][x]) + 1;
                        let value2 = Utils.binaryToShift(parent.solution[y + 1][x]) + 1;
                        let color = this.getKropkiColor(value1, value2, x, y, parent);
                        if (color !== null) {
                            let div = document.createElement("div");
                            div.textContent = " ";
                            div.classList.add("orthogonal");
                            div.classList.add(`orthogonal-${color}`);
                            div.classList.add("orthogonal-vertical");
                            column.appendChild(div);
                        }
                    }
                }
                if (parent.isMinusOne && parent.hasSolution) {
                    if (x !== size - 1) {
                        if (Math.abs(Utils.binaryToShift(parent.solution[y][x]) - Utils.binaryToShift(parent.solution[y][x + 1])) === 1) {
                            let div = document.createElement("div");
                            div.textContent = " ";
                            div.classList.add("orthogonal");
                            div.classList.add(`orthogonal-white`);
                            div.classList.add("orthogonal-horizontal");
                            column.appendChild(div);
                        }
                    }
                    if (y !== size - 1) {
                        if (Math.abs(Utils.binaryToShift(parent.solution[y][x]) - Utils.binaryToShift(parent.solution[y + 1][x])) === 1) {
                            let div = document.createElement("div");
                            div.textContent = " ";
                            div.classList.add("orthogonal");
                            div.classList.add(`orthogonal-white`);
                            div.classList.add("orthogonal-vertical");
                            column.appendChild(div);
                        }
                    }
                }
                if (parent.isInequality && parent.hasSolution) {
                    if (x !== size - 1) {let div = document.createElement("div");
                        div.textContent = " ";
                        div.classList.add("orthogonal");
                        div.classList.add("orthogonal-horizontal");
                        div.textContent += parent.solution[y][x] < parent.solution[y][x + 1] ? "<" : ">";
                        column.appendChild(div);
                    }
                    if (y !== size - 1) {
                        let div = document.createElement("div");
                        div.textContent = " ";
                        div.classList.add("orthogonal");
                        div.classList.add("orthogonal-vertical");
                        div.classList.add("orthogonal-rotate");
                        div.textContent += parent.solution[y][x] < parent.solution[y + 1][x] ? "<" : ">";
                        column.appendChild(div);
                    }
                }
                if (parent.isRoman && parent.hasSolution && parent.orthogonalTask !== null) {
                    if (x !== size - 1) {
                        let intersection = parent.orthogonalTask[y][x][0];
                        if (intersection !== null) {
                            let div = document.createElement("div");
                            div.textContent = parent.getRomanIntersectionName(intersection);
                            div.classList.add("orthogonal");
                            div.classList.add("orthogonal-white");
                            div.classList.add("orthogonal-horizontal");
                            column.appendChild(div);
                        }
                    }
                    if (y !== size - 1) {
                        let intersection = parent.orthogonalTask[y][x][1];
                        if (intersection !== null) {
                            let div = document.createElement("div");
                            div.textContent = parent.getRomanIntersectionName(intersection);
                            div.classList.add("orthogonal");
                            div.classList.add("orthogonal-white");
                            div.classList.add("orthogonal-vertical");
                            column.appendChild(div);
                        }
                    }
                }
                if ((parent.isKingMove || parent.isKnightMove) && ! (parent.isABC || parent.isSkyscraper)) {
                    if (x === parent.size - 1 && y === 0) {
                        let chessDiagonal = document.createElement("div");
                        chessDiagonal.classList.add("chess-diagonal");
                        column.appendChild(chessDiagonal);
                        if (parent.isKingMove) {
                            chessDiagonal.textContent += "K";
                        }
                        if (parent.isKnightMove) {
                            chessDiagonal.textContent += "N";
                        }
                    }
                }
                if (parent.isKiller) {
                    // @ts-ignore
                    this.addKillerLines(x, y, column, killerBoard, parent);
                    // @ts-ignore
                    if (! killerAlreadyAdded[killerBoard[y][x]]) {
                        let sumBox = document.createElement("div");
                        sumBox.classList.add("killer-sum");
                        // @ts-ignore
                        sumBox.textContent = parent.killerSums[killerBoard[y][x]];
                        // @ts-ignore
                        killerAlreadyAdded[killerBoard[y][x]] = true;
                        column.appendChild(sumBox);
                    }
                }
            }
        }
    }

    public static formatPage(): void {
        if (! this.doFormatPage) {
            return;
        }

        let pageWrapper = document.getElementById("page-wrapper");

        if (this._boardCount === 0) {
            let pageBreak = document.createElement("hr");
            pageBreak.classList.add("page-break");
            pageWrapper?.appendChild(pageBreak);
            // let leftMargin = document.createElement("div");
            // leftMargin.classList.add("left-margin");
            // pageWrapper?.appendChild(leftMargin);
        }
        if (this._pageUsedWidth + this._width > this.PAPER_WIDTH) {
            this._pageUsedHeight += this._pageLineHeight + this._marginBottom;
            this._pageUsedWidth = 0;

            if (this._pageUsedHeight + this._height > this.PAPER_HEIGHT) {
                this._pageUsedHeight = 0;
                this._pageUsedWidth = 0;
                this._pageLineHeight = 0;
                let pageBreak = document.createElement("hr");
                pageBreak.classList.add("page-break");
                pageWrapper?.appendChild(pageBreak);
                // let leftMargin = document.createElement("div");
                // leftMargin.classList.add("left-margin");
                // pageWrapper?.appendChild(leftMargin);
            } else {
                let hr = document.createElement("hr");
                pageWrapper?.appendChild(hr);
                // let leftMargin = document.createElement("div");
                // leftMargin.classList.add("left-margin");
                // pageWrapper?.appendChild(leftMargin);
            }
        }

        this._pageLineHeight = Math.max(this._pageLineHeight, this._height);
        this._pageUsedWidth += this._width;
    }

    private static getSquareFullSize(parent: ISudoku): number {
        let size;
        if (parent.isABC || parent.isSkyscraper) {
            size = parent.size + 2;
        } else {
            size = parent.size;
        }

        return Math.floor(this._width / size - 1.5);
    }

    public static setStyle(boardNum: number, parent: ISudoku): void {
        let style = document.getElementById("style");
        if (style === null) {
            throw "NO STYLE TAG";
        }

        style.textContent += "\n";

        let squareInnerLinearCount = Math.ceil(Math.sqrt(Math.min(this._maxSquareInnerCount, parent.size)));;

        let squareFullSize = this.getSquareFullSize(parent);
        let squareFullFontSize = Math.floor(squareFullSize * this._fontRelativeSize);
        let squareInnerSize = Math.floor(squareFullSize / squareInnerLinearCount);
        let squareInnerFontSize = Math.floor(squareFullSize / squareInnerLinearCount * this._innerFontRelativeSize);

        let styles = `width: ${squareFullSize}px; height: ${squareFullSize}px; line-height: ${squareFullSize}px; font-size: ${squareFullFontSize}px;`;
        let styleHtml = `table.board-table-${boardNum} div.square-full { ${styles} }`;
        style.textContent += styleHtml + "\n";

        styleHtml = `table.board-table-${boardNum} { margin-right: ${this._marginLeft}px; margin-bottom: ${this._marginBottom}px; }`;
        style.textContent += styleHtml + "\n";

        styles = `width: ${squareInnerSize}px; height: ${squareInnerSize}px; line-height: ${squareInnerSize}px; font-size: ${squareInnerFontSize}px;`;
        styleHtml = `table.board-table-${boardNum} div.square-inner { ${styles} }`;
        style.textContent += styleHtml + "\n";

        style.textContent += `table.board-table-${boardNum} td { border-width: ${this._smallBorderWidth}px; }\n`;

        style.textContent += `table.board-table-${boardNum} td.border-top { border-top-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table-${boardNum} td.border-bottom { border-bottom-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table-${boardNum} td.border-left { border-left-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table-${boardNum} td.border-right { border-right-width: ${this._bigBorderWidth}px; }\n`;

        if (parent.isVX || parent.isKropki || parent.isMinusOne || parent.isInequality || parent.isRoman) {
            let orthogonalBoxSize = 0;
            if (parent.isVX) {
                orthogonalBoxSize = Math.floor(squareFullSize * this._vxBoxSizeRelative);
            } else if (parent.isKropki) {
                orthogonalBoxSize = Math.floor(squareFullSize * this._kropkiBoxSizeRelative);
            } else if (parent.isMinusOne) {
                orthogonalBoxSize = Math.floor(squareFullSize * this._minusOneBoxSizeRelative);
            } else if (parent.isInequality) {
                orthogonalBoxSize = Math.floor(squareFullSize * this._inequalityBoxSizeRelative);
            } else if (parent.isRoman) {
                orthogonalBoxSize = Math.floor(squareFullSize * this._romanBoxSizeRelative);
            }
            let orthogonalBoxFontSize = 0;
            if (parent.isVX) {
                orthogonalBoxFontSize = Math.floor(orthogonalBoxSize * this._vxBoxFontSizeRelative);
            } else if (parent.isInequality) {
                orthogonalBoxFontSize = Math.floor(orthogonalBoxSize * this._inequalityBoxFontSizeRelative);
            } else if (parent.isRoman) {
                orthogonalBoxFontSize = Math.floor(orthogonalBoxSize * this._romanBoxFontSizeRelative);
            }
            styles = `width: ${orthogonalBoxSize}px; height: ${orthogonalBoxSize}px; line-height: ${orthogonalBoxSize}px; font-size: ${orthogonalBoxFontSize}px;`;
            styleHtml = `table.board-table-${boardNum} div.orthogonal { ${styles} }`;
            style.textContent += styleHtml + "\n";

            let vxBoxMarginTop = - (squareFullSize / 2 + orthogonalBoxSize / 2);
            let vxBoxMarginLeft = squareFullSize - orthogonalBoxSize / 2;
            styles = `margin-top: ${vxBoxMarginTop}px; margin-left: ${vxBoxMarginLeft}px;`;
            styleHtml = `table.board-table-${boardNum} div.orthogonal-horizontal { ${styles} }`;
            style.textContent += styleHtml + "\n";

            vxBoxMarginTop = - orthogonalBoxSize / 2;
            vxBoxMarginLeft = squareFullSize / 2 - orthogonalBoxSize / 2;
            styles = `margin-top: ${vxBoxMarginTop}px; margin-left: ${vxBoxMarginLeft}px;`;
            styleHtml = `table.board-table-${boardNum} div.orthogonal-vertical { ${styles} }`;
            style.textContent += styleHtml + "\n";

            if (parent.isRoman) {
                styleHtml = `table.board-table-${boardNum} div.orthogonal-white { border-radius: ${orthogonalBoxSize}px }`;
                style.textContent += styleHtml + "\n";
            }
            if (parent.isKropki) {
                styleHtml = `table.board-table-${boardNum} div.orthogonal-white { border-radius: ${orthogonalBoxSize}px }`;
                style.textContent += styleHtml + "\n";

                styleHtml = `table.board-table-${boardNum} div.orthogonal-black { border-radius: ${orthogonalBoxSize}px }`;
                style.textContent += styleHtml + "\n";
            }
        }

        if (parent.isKropki || parent.isMinusOne) {
            let typeDiagonalBoxSize = Math.floor(squareFullSize * this._typeDiagonalBoxSizeRelative);
            let typeDiagonalFontBoxSize = Math.floor(typeDiagonalBoxSize * this._typeDiagonalBoxFontSizeRelative);
            let typeDiagonalBoxTop = - squareFullSize - typeDiagonalBoxSize / 2;
            let typeDiagonalBoxLeft = - typeDiagonalBoxSize / 2;
            let styles1 = `width: ${typeDiagonalBoxSize}px; height: ${typeDiagonalBoxSize}px; line-height: ${typeDiagonalBoxSize}px; font-size: ${typeDiagonalFontBoxSize}px;`;
            let styles2 = `margin-top: ${typeDiagonalBoxTop}px; margin-left: ${typeDiagonalBoxLeft}px; `;
            styleHtml = `table.board-table-${boardNum} div.type-diagonal { ${styles1}${styles2} }`;
            style.textContent += styleHtml + "\n";
        }

        if (parent.isKiller) {
            styles = `width: ${squareFullSize}px; height: ${squareFullSize}px; margin-top: ${- squareFullSize}px;`;
            style.textContent += `table.board-table-${boardNum} svg { ${styles} }\n`;
            let killerSumBoxSize = Math.floor(squareFullSize * this._killerSumBoxSizeRelative);
            let killerSumBoxFontSize = Math.floor(killerSumBoxSize * this._killerSumBoxFontSizeRelative);
            let styles1 = `width: ${killerSumBoxSize}px; height: ${killerSumBoxSize}px; line-height: ${killerSumBoxSize}px;`;
            let styles2 =  `font-size: ${killerSumBoxFontSize}px; margin-top: ${- squareFullSize}px;`;
            style.textContent += `table.board-table-${boardNum} div.killer-sum { ${styles1} ${styles2} }\n`;
        }

        if (parent.isKingMove || parent.isKnightMove) {
            let chessDiagonalBoxSize = Math.floor(squareFullSize * this._typeDiagonalBoxSizeRelative);
            let chessDiagonalFontBoxSize = Math.floor(chessDiagonalBoxSize * this._typeDiagonalBoxFontSizeRelative);
            let chessDiagonalBoxTop = - squareFullSize - chessDiagonalBoxSize / 2;
            let chessDiagonalBoxLeft = squareFullSize - chessDiagonalBoxSize / 2;
            let styles1 = `width: ${chessDiagonalBoxSize}px; height: ${chessDiagonalBoxSize}px; line-height: ${chessDiagonalBoxSize}px; font-size: ${chessDiagonalFontBoxSize}px;`;
            let styles2 = `margin-top: ${chessDiagonalBoxTop}px; margin-left: ${chessDiagonalBoxLeft}px; `;
            styleHtml = `table.board-table-${boardNum} div.chess-diagonal { ${styles1}${styles2} }`;
            style.textContent += styleHtml + "\n";
        }

        if (parent.isABC || parent.isSkyscraper) {
            style.textContent += `table.board-table-${boardNum} div.small-font { font-size: ${squareFullFontSize / 2}px; }\n`;
        }
    }

    public static addBorderStyle(x: number, y: number, column: HTMLElement, irregularBoard: number[][] | undefined, parent: ISudoku): void {
        if (parent.isABC || parent.isSkyscraper) {
            if (x === 0 || x === parent.size + 1 || y === 0 || y === parent.size + 1) {
                column.classList.add("border-none");
            } else {
                if (x === 1) {
                    column.classList.add("border-left");
                } else if (x === parent.size) {
                    column.classList.add("border-right");
                }
                if (y === 1) {
                    column.classList.add("border-top");
                } else if (y === parent.size) {
                    column.classList.add("border-bottom");
                }
            }

        } else {
            if (x === 0) {
                column.classList.add("border-left");
            } else if (x === parent.size - 1) {
                column.classList.add("border-right");
            }
            if (y === 0) {
                column.classList.add("border-top");
            } else if (y === parent.size - 1) {
                column.classList.add("border-bottom");
            }

            if (parent.isRectangular && parent.rectangleWidth !== null && parent.rectangleHeight !== null) {
                if (x % parent.rectangleWidth === 0) {
                    column.classList.add("border-left");
                } else if (x % parent.rectangleWidth === parent.rectangleWidth - 1) {
                    column.classList.add("border-right");
                }
                if (y % parent.rectangleHeight === 0) {
                    column.classList.add("border-top");
                } else if (y % parent.rectangleHeight === parent.rectangleHeight - 1) {
                    column.classList.add("border-bottom");
                }
            }

            if (parent.isIrregular && irregularBoard !== undefined) {
                if (x !== 0) {
                    if (irregularBoard[y][x] !== irregularBoard[y][x - 1]) {
                        column.classList.add("border-left");
                    }
                }
                if (x !== parent.size - 1) {
                    if (irregularBoard[y][x] !== irregularBoard[y][x + 1]) {
                        column.classList.add("border-right");
                    }
                }
                if (y !== 0) {
                    if (irregularBoard[y][x] !== irregularBoard[y - 1][x]) {
                        column.classList.add("border-top");
                    }
                }
                if (y !== parent.size - 1) {
                    if (irregularBoard[y][x] !== irregularBoard[y + 1][x]) {
                        column.classList.add("border-bottom");
                    }
                }
            }
        }
    }

    public static size(size: number): void {
        this._width = size;
        this._height = size;
    }

    public static perPage(xCount: number, yCount: number): void {
        let width = Math.floor((this.PAPER_WIDTH - (xCount - 1) * this._marginLeft) / xCount) - 6;
        let height = Math.floor((this.PAPER_HEIGHT - (yCount - 1) * this._marginBottom) / yCount) - 6;
        let size = Math.min(width, height);
        this._width = size;
        this._height = size;
    }
}