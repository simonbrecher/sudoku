class Renderer {
    private static readonly PAPER_HEIGHT = 1000;
    private static readonly PAPER_WIDTH = 710;

    private static _pageUsedHeight = 0;
    private static _pageUsedWidth = 0;
    private static _pageLineHeight = 0;

    private static _width: number;
    private static _height: number;
    private static _fontRelativeSize: number;
    private static _vxBoxSizeRelative: number;
    private static _vxBoxFontSizeRelative: number;
    private static _kropkiBoxSizeRelative: number;
    private static _innerFontRelativeSize: number;
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
        this._vxBoxSizeRelative = 0.6;
        this._vxBoxFontSizeRelative = 0.8;
        this._kropkiBoxSizeRelative = 0.2;
        this._innerFontRelativeSize = 0.8;
        this._marginLeft = 5; // 10
        this._marginBottom = 5; // 10
        this._smallBorderWidth = 1;
        this._bigBorderWidth = 3;
        this._maxSquareInnerCount = 4;
    }

    private static getKropkiColor(value1: number, value2: number): "white" | "black" | null {
        let isWhite = value1 - value2 === 1 || value1 - value2 === -1;
        let isBlack = value1 === value2 * 2 || value1 * 2 === value2;

        if (isWhite && isBlack) {
            return Math.random() > 0.5 ? "white" : "black";
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
            let leftMargin = document.createElement("div");
            leftMargin.classList.add("left-margin");
            pageWrapper?.appendChild(leftMargin);
            this._pageUsedHeight = 0;
            this._pageUsedWidth = 0;
            this._pageLineHeight = 0;
        }
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
            return Utils.valueToChar(Utils.binaryToValue(binary), parent);
        }
        if (binary === 0) {
            return this.zeroSymbol;
        }
        let values = [];
        let number = 1;
        while (binary !== 0) {
            if ((binary & 1) === 1) {
                values.push(Utils.valueToChar(number, parent));
            }
            binary >>>= 1;
            number += 1;
        }
        return values;
    }

    private static convertAbcBoard(board: number[][], parent: ISudoku, squareInnerCount: number): (string | string[])[][] {
        let task = parent.task;
        let arr: (string | string[])[][] = [];

        let row = [];
        row.push(" ");
        for (let x = 0; x < parent.size; x++) {
            let add = this.convertBinary(task[2][x], parent, squareInnerCount)
            row.push(add === "?" ? " " : add);
        }
        row.push(" ");
        arr.push(row);

        for (let y = 0; y < board.length; y++) {
            row = [];
            let add = this.convertBinary(task[0][y], parent, squareInnerCount)
            row.push(add === "?" ? " " : add);
            for (let x = 0; x < board[y].length; x++) {
                row.push(this.convertBinary(board[y][x], parent, squareInnerCount));
            }
            add = this.convertBinary(task[1][y], parent, squareInnerCount)
            row.push(add === "?" ? " " : add);
            arr.push(row);
        }

        row = [];
        row.push(" ");
        for (let x = 0; x < parent.size; x++) {
            let add = this.convertBinary(task[3][x], parent, squareInnerCount)
            row.push(add === "?" ? " " : add);
        }
        row.push(" ");
        arr.push(row);

        return arr;
    }

    public static convertBoard(board: number[][], parent: ISudoku, squareInnerCount: number): (string | string[])[][] {
        if (parent.isABC) {
            return this.convertAbcBoard(board, parent, squareInnerCount);
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

    public static render(board: number[][] | null | undefined, parent: ISudoku | null | undefined, unsolved: number[][] | null = null, color: "red" | "green" | null = null): void {
        if (board === null || board === undefined || parent === null || parent === undefined) {
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
        if (parent.isABC) {
            size = parent.size + 2;
        } else {
            size = parent.size;
        }
        for (let y = 0; y < size; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < size; x++) {
                let column = row.insertCell();
                this.addBorderStyle(x, y, column, parent);

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
                if (parent?.isABC && y === 0 && x === 0 && parent.abcNumber !== null) {
                    div.textContent = parent.abcNumber.toString();
                    div.classList.add("square-full");
                    div.classList.add("small-font");
                } else if (typeof renderBoard[y][x] === "string") {
                    div.textContent = renderBoard[y][x].toString();
                    div.classList.add("square-full");
                } else {
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
                if (parent?.isVX) {
                    let solution = parent.solution;
                    if (x !== size - 1) {
                        let sum = Utils.binaryToValue(solution[y][x]) + Utils.binaryToValue(solution[y][x + 1]);
                        if (parent.getVxSumName(sum) !== null) {
                            let div = document.createElement("div");
                            div.textContent = parent.getVxSumName(sum);
                            div.classList.add("orthogonal");
                            div.classList.add("orthogonal-horizontal")
                            column.appendChild(div);
                        }
                    }
                    if (y !== size - 1) {
                        let sum = Utils.binaryToValue(solution[y][x]) + Utils.binaryToValue(solution[y + 1][x]);
                        if (parent.getVxSumName(sum)) {
                            let div = document.createElement("div");
                            div.textContent = parent.getVxSumName(sum);
                            div.classList.add("orthogonal");
                            div.classList.add("orthogonal-vertical")
                            column.appendChild(div);
                        }
                    }
                }
                if (parent?.isKropki) {
                    let solution = parent.solution;
                    if (x !== size - 1) {
                        let color = this.getKropkiColor(Utils.binaryToValue(solution[y][x]), Utils.binaryToValue(solution[y][x + 1]));
                        if (color !== null) {
                            let div = document.createElement("div");
                            div.textContent = " ";
                            div.classList.add("orthogonal");
                            div.classList.add(`orthogonal-${color}`);
                            div.classList.add("orthogonal-horizontal")
                            column.appendChild(div);
                        }
                    }
                    if (y !== size - 1) {
                        let color = this.getKropkiColor(Utils.binaryToValue(solution[y][x]), Utils.binaryToValue(solution[y + 1][x]));
                        if (color !== null) {
                            let div = document.createElement("div");
                            div.textContent = " ";
                            div.classList.add("orthogonal");
                            div.classList.add(`orthogonal-${color}`);
                            div.classList.add("orthogonal-vertical")
                            column.appendChild(div);
                        }
                    }
                }
            }
        }
    }

    public static formatPage(): void {
        let pageWrapper = document.getElementById("page-wrapper");

        if (this._boardCount === 0) {
            let pageBreak = document.createElement("hr");
            pageBreak.classList.add("page-break");
            pageWrapper?.appendChild(pageBreak);
            let leftMargin = document.createElement("div");
            leftMargin.classList.add("left-margin");
            pageWrapper?.appendChild(leftMargin);
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
                let leftMargin = document.createElement("div");
                leftMargin.classList.add("left-margin");
                pageWrapper?.appendChild(leftMargin);
            } else {
                let hr = document.createElement("hr");
                pageWrapper?.appendChild(hr);
                let leftMargin = document.createElement("div");
                leftMargin.classList.add("left-margin");
                pageWrapper?.appendChild(leftMargin);
            }
        }

        this._pageLineHeight = Math.max(this._pageLineHeight, this._height);
        this._pageUsedWidth += this._width;
    }

    public static setStyle(boardNum: number, parent: ISudoku): void {
        let style = document.getElementById("style");
        if (style === null) {
            throw "NO STYLE TAG";
        }

        style.textContent += "\n";

        let squareInnerLinearCount = Math.ceil(Math.sqrt(Math.min(this._maxSquareInnerCount, parent.size)));;

        let size;
        if (parent.isABC) {
            size = parent.size + 2;
        } else {
            size = parent.size;
        }

        let squareFullSize = Math.floor(this._width / size);
        let squareFullFontSize = Math.floor(this._width / size * this._fontRelativeSize);
        let squareInnerSize = Math.floor(squareFullSize / squareInnerLinearCount);
        let squareInnerFontSize = Math.floor(squareFullSize / squareInnerLinearCount * this._innerFontRelativeSize);

        let styles = `width: ${squareFullSize}px; height: ${squareFullSize}px; line-height: ${squareFullSize}px; font-size: ${squareFullFontSize}px;`;
        let styleHtml = `table.board-table-${boardNum} div.square-full { ${styles} }`;
        style.textContent += styleHtml + "\n";

        styleHtml = `table.board-table-${boardNum} { margin-left: ${this._marginLeft}px; margin-bottom: ${this._marginBottom}px; }`;
        style.textContent += styleHtml + "\n";

        styles = `width: ${squareInnerSize}px; height: ${squareInnerSize}px; line-height: ${squareInnerSize}px; font-size: ${squareInnerFontSize}px;`;
        styleHtml = `table.board-table-${boardNum} div.square-inner { ${styles} }`;
        style.textContent += styleHtml + "\n";

        style.textContent += `table.board-table-${boardNum} td { border-width: ${this._smallBorderWidth}px; }\n`;

        style.textContent += `table.board-table-${boardNum} td.border-top { border-top-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table-${boardNum} td.border-bottom { border-bottom-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table-${boardNum} td.border-left { border-left-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table-${boardNum} td.border-right { border-right-width: ${this._bigBorderWidth}px; }\n`;

        if (parent.isVX || parent.isKropki) {
            let orthogonalBoxSize = 0;
            if (parent.isVX) {
                orthogonalBoxSize = Math.floor(squareFullSize * this._vxBoxSizeRelative);
            } else if (parent.isKropki) {
                orthogonalBoxSize = Math.floor(squareFullSize * this._kropkiBoxSizeRelative);
            }
            let orthogonalBoxFontSize = 0;
            if (parent.isVX) {
                orthogonalBoxFontSize = Math.floor(orthogonalBoxSize * this._vxBoxFontSizeRelative);
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
        }

        if (parent.isABC) {
            style.textContent += `table.board-table-${boardNum} div.small-font { font-size: ${squareFullFontSize / 2}px; }\n`;
        }
    }

    public static addBorderStyle(x: number, y: number, column: HTMLElement, parent: ISudoku): void {
        if (parent.isABC) {
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