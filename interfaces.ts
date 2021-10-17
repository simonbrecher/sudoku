interface IRenderer {
    width: number; height: number; // pixels

    render: (a: HTMLElement) => (HTMLElement);
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

    solution: number[][]; task: number[][]; board: number[][];
}