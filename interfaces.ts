interface ISolver {
    solve: (sudoku: IBoard) => (IBoard);
    checkSolution: (sudoku: IBoard) => (boolean);
    countTaskSolutions: (sudoku: IBoard) => (number);
}

interface IRenderer {
    width: number; height: number; // pixels

    render: (a: HTMLElement) => (HTMLElement);
}

interface IBoard {
    board: number[][];
    parent: ISudoku | null;

    getPrompterNum: () => (number);
    getExtraNum: () => (number);

    copy: (parent: ISudoku) => (IBoard);
}

interface ISudokuBuilder {
    size: number;
    isRectangular: boolean; rectangleWidth: number; rectangleHeight: number;
    isDiagonal: boolean;
    isVX: boolean; vxSum: [number, string][];
    prompterNumMinimal: number; prompterNumMaximal: number;

    build: () => (ISudoku);
}

interface ISudoku {
    rectangleWidth: number; rectangleHeight: number; size: number;
    solution: IBoard; task: IBoard; board: IBoard;
}