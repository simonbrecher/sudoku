interface ISudoku {
    size: number;
    isRectangular: boolean; rectangleWidth: number | null; rectangleHeight: number | null;
    isDiagonal: boolean;
    isVX: boolean; vxSum: [number, string][] | null;
    isKropki: boolean;
    isABC: boolean; abcNumber: number | null; abcSpaceNumber: number | null;

    isFinished: boolean;
    hasSolution: boolean;

    getVxSumName: (sum: number) => (string | null);
    getVxSumValues: () => (number[]);

    solution: number[][]; task: number[][]; board: number[][];
}

interface ICoral {
    width: number;
    height: number;
    isSorted: boolean;

    task: (number[] | null)[][];
    solution: number[][];
    board: number[][];
}

interface ITapa {
    width: number;
    height: number;

    task: (number[] | null)[][];
    solution: number[][];
    board: number[][];
}