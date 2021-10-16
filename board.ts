class Board implements IBoard {
    private readonly _parent: ISudoku | null;
    private _board: number[][];

    private readonly _width: number;
    private readonly _height: number;
    private readonly _valuesNum: number;
    private readonly _emptyValue: number;

    public get parent(): ISudoku | null {
        return this._parent;
    }

    public get board(): number[][] {
        return this.copyBoard();
    }

    public set board(board: number[][]) {
        if (board.length === this._height && board[0].length === this._width) {
            console.log("Board->set->board - WRONG BOARD DIMENSIONS");
        } else {
            this._board = board;
        }
    }

    constructor(parent: ISudoku | null, width: number, height: number, valuesNum: number) {
        if (valuesNum > 32) {
            throw "Board->constructor - VALUES_NUM IS TOO BIG";
        }

        this._parent = parent;
        this._width = width;
        this._height = height;
        this._valuesNum = valuesNum;
        this._emptyValue = (1 << this._valuesNum) - 1;

        this._board = this.getEmptyBoard();
    }

    private getEmptyBoard(): number[][] {
        let board: number[][] = [];
        for (let y = 0; y < this._height; y++) {
            let row = [];
            for (let x = 0; x < this._width; x++) {
                row.push(this._emptyValue);
            }
            board.push(row);
        }
        return board;
    }

    public getPrompterNum(): number {
        let total = 0;
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (Utils.countBits32(this.board[y][x]) === 1) {
                    total++;
                }
            }
        }
        return total;
    }

    public getExtraNum(): number {
        let total = 0;
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                total += Math.max(0, Utils.countBits32(this.board[y][x]) - 1);
            }
        }
        return total;
    }

    private copyBoard(): number[][] {
        let copied = [];
        for (let y = 0; y < this._height; y++) {
            let row = [];
            for (let x = 0; x < this._width; x++) {
                row.push(this._board[y][x]);
            }
            copied.push(row);
        }
        return copied;
    }

    public copy(parent: ISudoku): IBoard {
        let copied = new Board(parent, this._width, this._height, this._valuesNum);
        copied.board = this.copyBoard();
        return copied;
    }
}