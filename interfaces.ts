interface IRenderer {
    width: number; height: number; // pixels

    render: (a: HTMLElement) => (HTMLElement);
}

interface ISudoku {
    size: number;
    isRectangular: boolean; rectangleWidth: number | null; rectangleHeight: number | null;
    isDiagonal: boolean;
    isVX: boolean; vxSum: [number, string][] | null;

    isFinished: boolean;
    hasSolution: boolean;

    getVxSumName: (sum: number) => (string | null);
    getVxSumValues: () => (number[]);

    solution: number[][]; task: number[][]; board: number[][];
}