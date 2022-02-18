/**
 * Class for creating html tags from Sudoku object. It automatically creates css for and breaks pages.
 *
 * Main funcion is Renderer. render()
 */
class Renderer {
    private static readonly PAPER_HEIGHT = 1000;
    private static readonly PAPER_WIDTH = 710;

    private static _pageUsedHeight = 0;
    private static _pageUsedWidth = 0;
    private static _pageLineHeight = 0;

    private static _width: number; // width of puzzle table in pixels
    private static _height: number; // height of puzzle table in pixels
    private static _fontRelativeSize: number; // size of font relative to square size
    private static _vxBoxSizeRelative: number; // size of box with "V" / "X" for VX sudoku relative to square size
    private static _vxBoxFontSizeRelative: number; // size of font in vx box relative to size of vx box
    private static _kropkiBoxSizeRelative: number; // size of black/white boxes for kropki sudoku relative to square size
    private static _innerFontRelativeSize: number; // relative size in square with multiple numbers (but not all)
    private static _marginLeft: number; // left margin of sudoku table
    private static _marginBottom: number; // bottom maring of sudoku table
    private static _smallBorderWidth: number; // width of regular border
    private static _bigBorderWidth: number; // width of border on sides and between rectangles
    private static _maxSquareInnerCount: number; // maximal number of numbers, which will not appear as empty square

    private static _boardCount: number = 0; // number of created sudokus

    public static zeroSymbol = "?"; // some debug stuff

    // instead of static constructor
    private static setDefault = (() => {
        Renderer.default();
    })();

    /**
     * Set default values
     */
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
        this._maxSquareInnerCount = 9;
    }

    /**
     * Get color of kropki box.
     * @param value1    number in square
     * @param value2    number in square
     * @return          white = difference is 1, black = one is two times bigger, null = else
     */
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

    /**
     * Create pageBreak for printing.
     */
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
     * Convert binary representation of square to string value, which is viewed. (or array if there can be multiple numbers)
     * @param binary                Binary representation of square
     * @param squareInnerCount      Maximal number of numbers, otherwise it is viewed as empty square
     * @return                      String of number(s) in square.
     */
    private static convertBinary(binary: number, parent: ISudoku, squareInnerCount: number): string | string[] {
        let bitCount = Utils.countBits32(binary);
        if (bitCount > squareInnerCount) {
            return " ";
        }
        if (parent.isABC && parent.abcCount !== null) {
            if (binary === (1 << parent.abcCount + 1) - 1) {
                return " ";
            }
        } else {
            if (binary === (1 << parent.size) - 1) {
                return " ";
            }
        }
        if (bitCount === 1) {
            return this.valueToChar(Utils.binaryToValue(binary), parent);
        }
        if (binary === 0) {
            return this.zeroSymbol;
        }
        let values = [];
        let number = 1;
        while (binary !== 0) {
            if ((binary & 1) === 1) {
                values.push(this.valueToChar(number, parent));
            }
            binary >>>= 1;
            number += 1;
        }
        return values;
    }

    /**
     * For abc. Create 2d array with strings, which are what will be visible in table by people.
     */
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

    /**
     * For non-abc. Create 2d array with strings, which are what will be visible in table by people.
     */
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

    /**
     * Create html of sudoku and view it.
     * @param board         2d array with binary representations of squares (sudoku.board / sudoku.task / sudoku.solution)
     * @param parent        Sudoku object
     * @param unsolved      same as board, but if a square has different value, it will be gray
     * @param color         color of background
     */
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
            unsolved = Utils.deepcopyBoard(board);
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
                if (parent?.isABC && y === 0 && x === 0 && parent.abcCount !== null) {
                    div.textContent = parent.abcCount.toString();
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

    /**
     * Do page breaks and update how many space is used by already created sudokus.
     */
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

    /**
     * Create css for one sudoku.
     * @param boardNum      Number of already created sudokus.
     * @param parent        Sudoku object.
     */
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

    /**
     * Add strong borders, where they need to be, for a square.
     * @param x         x coordinate of square
     * @param y         y coordinate of square
     * @param column    <td> of square
     * @param parent    Sudoku object
     */
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

    /**
     * Set size of sudoku table in pixels.
     */
    public static size(size: number): void {
        this._width = size;
        this._height = size;
    }

    /**
     * Set maximum number of sudoku tables on one page.
     * @param xCount        maximum number of sudoku tables in row
     * @param yCount        maximum number of sudoku tables in column
     */
    public static perPage(xCount: number, yCount: number): void {
        let width = Math.floor((this.PAPER_WIDTH - (xCount - 1) * this._marginLeft) / xCount) - 6;
        let height = Math.floor((this.PAPER_HEIGHT - (yCount - 1) * this._marginBottom) / yCount) - 6;
        let size = Math.min(width, height);
        this._width = size;
        this._height = size;
    }
}