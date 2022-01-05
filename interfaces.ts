interface ISudoku {
    size: number;
    isRectangular: boolean; rectangleWidth: number | null; rectangleHeight: number | null;
    isDiagonal: boolean;
    isVX: boolean; vxSum: [number, string][] | null;
    isKropki: boolean;
    isABC: boolean; abcNumber: number | null; abcSpaceNumber: number | null;
    isKingMove: boolean;
    isKnightMove: boolean;

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

interface ISlitherlink {
    width: number;
    height: number;

    coral: number[][];
    task: (number | null)[][];
    squares: boolean[][][];
    crosses: boolean[][][];

    updateArrays: () => void;
    countAllPossible: () => number;
    countSolutions: () => number;
    getLines: () => number[][][];
    countPrompters: () => number;
    setTask: (inputTask: string[]) => void;
    deleteTask: () => void;

    renderCount: () => void;
    render: (isSolved: boolean, isEmpty: boolean) => void;
}

interface IConfigSlitherlink {
    width: number;
    height: number;
    topBorder: boolean;
    leftBorder: boolean;

    task: (number | null)[][];
    squares: boolean[][][];
    crosses: boolean[][][];

    updateArrays: () => void;
    countAllPossible: () => number;
    countSolutions: () => number;
    hasNoLoop: () => boolean;
    getLines: () => number[][][];
    countPrompters: () => number;
    countPossible: (possible: boolean[]) => number;
    copy: () => IConfigSlitherlink;
    setLine: (direction: 0 | 1, x: number, y: number, value: number) => void;
    setAllLines: (lines: number[][][]) => void;

    renderCount: () => void;
    render: (isEmpty: boolean) => void;
}