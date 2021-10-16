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
    size: (size: number) => (void);
    rectangular: (isRectangular: boolean, rectangleWidth: number | null, rectangleHeight: number | null) => (void);
    diagonal: (isDiagonal: boolean) => (void);
    vx: (isVx: boolean, vxSum: [number, string][]) => (void);
    prompterNum: (minimal: number | null, maximal: number | null) => (void);

    build: () => (ISudoku);
}

interface ISudoku {
    size: number;
    isRectangular: boolean; rectangleWidth: number | null; rectangleHeight: number | null;
    isDiagonal: boolean;
    isVX: boolean; vxSum: [number, string][] | null;

    solution: IBoard; task: IBoard; board: IBoard;
}