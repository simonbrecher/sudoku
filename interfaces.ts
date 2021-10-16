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
    width: number; height: number; numbers: number;
    board: number[][];
    parent: ISudoku;

    getPrompterNum: () => (number);
    getValuesNum: () => (number);

    copy: () => (IBoard);
}

interface ISudoku {
    rectangleWidth: number; rectangleHeight: number; size: number;
    solution: IBoard; task: IBoard; board: IBoard;
}