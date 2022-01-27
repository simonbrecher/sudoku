interface ISudoku {
    size: number;
    isRectangular: boolean; rectangleWidth: number | null; rectangleHeight: number | null;
    isIrregular: boolean; irregularGroups: number[][][] | null;
    isDiagonal: boolean;
    isLetters: boolean;
    letters: string[];
    isVX: boolean; vxSum: [number, string][] | null;
    isKropki: boolean;
    isMinusOne: boolean;
    isMinusOneDirection: boolean;
    isInequality: boolean;
    isKiller: boolean;
    isKillerUnchained: boolean;
    killerGroups: number[][][] | null;
    killerSums: number[] | null;
    killerUnchainedGroups: number[][] | null;
    killerUnchainedBoard: number[][][] | null;
    killerUnchainedIsKnown: boolean[] | null;
    isRoman: boolean;
    isSlovak: boolean;
    isABC: boolean;
    valueNumber: number | null; spaceNumber: number | null;
    isSkyscraper: boolean;
    isKingMove: boolean;
    isKnightMove: boolean;

    isFinished: boolean;
    hasSolution: boolean;

    getVxSumName: (sum: number) => (string | null);
    getVxSumValues: () => (number[]);
    getRomanIntersection: (binary1: number, binary2: number) => number;
    getRomanIntersectionName: (intersection: number) => string;
    hasTaskAllValues: (task: number[][]) => boolean;
    setKillerSums: () => (void);
    refreshKillerGroups: (groupSizes: number[]) => (void);
    refreshIrregularGroups: () => (void);
    getSolutionValues: () => number[][];
    hasPrompterInVxSum: () => boolean;
    solutionAdded: () => void;
    refreshKillerUnchainedOnStartSolve: () => void;

    solution: number[][]; task: number[][]; board: number[][];

    sideTask: number[][] | null;
    orthogonalTask: (number | null)[][][] | null;
    extraTask: (number[] | null)[][] | null;
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

interface IStars {
    size: number;
    startCount: number;
    task: number[][];
    board: number[][];

    render: (showStars: boolean) => void;
}

interface IRange {
    width: number;
    height: number;

    isKuromasu: boolean;
    isCave: boolean;

    solution: number[][];
    task: (number | null)[][];
    board: number[][];

    checkSolutionOrthogonal: (solution: number[][]) => boolean;
    countLengthInDirection: (board: number[][], isMax: boolean) => number[][][];
    render: (board: number[][], debug: boolean) => void;
}

interface IGalaxy {
    width: number;
    height: number;

    centers: number[][];
    board: number[][];
    solution: number[][] | null;

    render: (board: number[][] | null, showSolution: boolean) => void;
}

interface IDomino {
    size: number;
    width: number;
    height: number;

    task: number[][];
    board: number[][][];
    solution: number[][][];

    render: (board: number[][][]) => void;
}