class Renderer {
    private static readonly PAPER_HEIGHT = 1000;
    private static readonly PAPER_WIDTH = 700;

    private static _pageUsedHeight = 0;
    private static _pageUsedWidth = 0;
    private static _pageLineHeight = 0;

    private static _width: number;
    private static _height: number;
    private static _fontRelativeSize: number;
    private static _innerFontRelativeSize: number;
    private static _marginLeft: number;
    private static _marginBottom: number;
    private static _smallBorderWidth: number;
    private static _bigBorderWidth: number;
    private static _maxSquareInnerCount: number;

    private static _boardCount: number = 0;

    private static setDefault = (() => {
        Renderer.default();
    })();

    public static default(): void {
        this._width = 310;
        this._height = 310;
        this._fontRelativeSize = 0.7;
        this._innerFontRelativeSize = 0.8;
        this._marginLeft = 10;
        this._marginBottom = 10;
        this._smallBorderWidth = 1;
        this._bigBorderWidth = 3;
        this._maxSquareInnerCount = 4;
    }

    public static render(board: number[][] | null | undefined, parent: ISudoku | null | undefined, unsolved: number[][] | null = null): void {
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

        this.setStyle(boardNum, parent);

        if (unsolved === null) {
            unsolved = Utils.deepcopyBoard(board);
        }

        let squareInnerLinearCount = Math.ceil(Math.sqrt(Math.min(this._maxSquareInnerCount, parent.size)));

        let renderBoard = Utils.convertBoard(board, Math.min(this._maxSquareInnerCount, parent.size));
        for (let y = 0; y < parent.size; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < parent.size; x++) {
                let column = row.insertCell();
                this.addBorderStyle(x, y, column, parent);

                let div = document.createElement("div");
                if (board[y][x] !== unsolved[y][x]) {
                    column.classList.add("unsolved");
                }
                if (parent.isDiagonal) {
                    if (x === y || x + y + 1 === parent.size) {
                        column.classList.add("diagonal");
                    }
                }
                column.appendChild(div);
                if (typeof renderBoard[y][x] === "string") {
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
            }
        }
    }

    public static formatPage(): void {
        let pageWrapper = document.getElementById("page-wrapper");

        if (this._boardCount === 0) {
            let pageBreak = document.createElement("hr");
            pageBreak.classList.add("page-break");
            pageWrapper?.appendChild(pageBreak);
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
            } else {
                let hr = document.createElement("hr");
                pageWrapper?.appendChild(hr);
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

        let squareFullSize = Math.floor(this._width / parent.size);
        let squareFullFontSize = Math.floor(this._width / parent.size * this._fontRelativeSize);
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

        style.textContent += `table.board-table td { border-width: ${this._smallBorderWidth}px; }\n`;

        style.textContent += `table.board-table td.border-top { border-top-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table td.border-bottom { border-bottom-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table td.border-left { border-left-width: ${this._bigBorderWidth}px; }\n`;
        style.textContent += `table.board-table td.border-right { border-right-width: ${this._bigBorderWidth}px; }\n`;
    }

    public static addBorderStyle(x: number, y: number, column: HTMLElement, parent: ISudoku): void {
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

    public static size(size: number): void {
        this._width = size;
        this._height = size;
    }

    public static perPage(xCount: number, yCount: number): void {
        let width = Math.floor((this.PAPER_WIDTH - (xCount - 1) * this._marginLeft) / xCount);
        let height = Math.floor((this.PAPER_HEIGHT - (yCount - 1) * this._marginBottom) / yCount);
        let size = Math.min(width, height);
        this._width = size;
        this._height = size;
    }
}