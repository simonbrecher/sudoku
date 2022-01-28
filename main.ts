function tournamentSudokuSmall(taskNum: number, solutionNum: number): void {
    Renderer.perPage(2, 3);

    SudokuBuilder.rectangular(true, 3, 2);
    let sudoku1 = SudokuBuilder.build();
    let sudoku2 = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    let sudokuDiagonal = SudokuBuilder.build();

    SudokuBuilder.diagonal(false);
    SudokuBuilder.irregular(true);
    let irregularSudoku = SudokuBuilder.build();

    SudokuBuilder.rectangular(true, 3, 2);
    SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    let sudokuVx1 = SudokuBuilder.build();

    SudokuBuilder.vxSum(false);
    SudokuBuilder.size(6);
    SudokuBuilder.diagonal(false);
    let noRectangle = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    let noRectangleDiagonal = SudokuBuilder.build();


    SudokuBuilder.diagonal(false);
    SudokuBuilder.rectangular(true, 3, 2);

    let notUseKropki = Math.floor(Math.random() * 3);

    let kropki, minusOne, inequality;
    if (notUseKropki !== 0) {
        SudokuBuilder.kropki(true);
        kropki = SudokuBuilder.build();
    }
    if (notUseKropki !== 1) {
        SudokuBuilder.minusOne(true);
        SudokuBuilder.size(6);
        minusOne = SudokuBuilder.build();
    }
    if (notUseKropki !== 2) {
        SudokuBuilder.inequality(true);
        SudokuBuilder.size(6);
        inequality = SudokuBuilder.build();
    }

    SudokuBuilder.kropki(false);
    SudokuBuilder.minusOne(false);
    SudokuBuilder.inequality(false);
    SudokuBuilder.rectangular(true, 3, 2);
    SudokuBuilder.prompterNum(null, 0);
    SudokuBuilder.killer(true, [[1, 1], [2, 9], [3, 3], [4, 2]]);
    let killerSudoku = SudokuBuilder.build();

    SudokuBuilder.prompterNum(null, null);
    SudokuBuilder.killer(false, null);
    SudokuBuilder.pieceMoves(true, false);
    let kingSudoku = SudokuBuilder.build();

    SudokuBuilder.pieceMoves(false, true);
    let knightSudoku = SudokuBuilder.build();

    SudokuBuilder.pieceMoves(false, false);

    Renderer.doFormatPage = true;
    for (let i = 0; i < taskNum; i++) {
        Renderer.render(sudoku1?.task, sudoku1);
        Renderer.render(sudoku2?.task, sudoku2);
        Renderer.render(sudokuDiagonal?.task, sudokuDiagonal);
        Renderer.render(irregularSudoku?.task, irregularSudoku);
        Renderer.render(sudokuVx1?.task, sudokuVx1);
        Renderer.render(noRectangle?.task, noRectangle);
        Renderer.render(noRectangleDiagonal?.task, noRectangleDiagonal);
        if (notUseKropki !== 0) {
            Renderer.render(kropki?.task, kropki);
        }
        if (notUseKropki !== 1) {
            Renderer.render(minusOne?.task, minusOne);
        }
        if (notUseKropki !== 2) {
            Renderer.render(inequality?.task, inequality);
        }
        Renderer.render(killerSudoku?.task, killerSudoku);
        Renderer.render(kingSudoku?.task, kingSudoku);
        Renderer.render(knightSudoku?.task, knightSudoku);

        Renderer.breakPage();
    }

    for (let i = 0; i < solutionNum; i++) {
        Renderer.render(sudoku1?.solution, sudoku1);
        Renderer.render(sudoku2?.solution, sudoku2);
        Renderer.render(sudokuDiagonal?.solution, sudokuDiagonal);
        Renderer.render(irregularSudoku?.solution, irregularSudoku);
        Renderer.render(sudokuVx1?.solution, sudokuVx1);
        Renderer.render(noRectangle?.solution, noRectangle);
        Renderer.render(noRectangleDiagonal?.solution, noRectangleDiagonal);
        if (notUseKropki !== 0) {
            Renderer.render(kropki?.solution, kropki);
        }
        if (notUseKropki !== 1) {
            Renderer.render(minusOne?.solution, minusOne);
        }
        if (notUseKropki !== 2) {
            Renderer.render(inequality?.solution, inequality);
        }
        Renderer.render(killerSudoku?.solution, killerSudoku);
        Renderer.render(kingSudoku?.solution, kingSudoku);
        Renderer.render(knightSudoku?.solution, knightSudoku);

        Renderer.breakPage();
    }
}

function tournamentSudokuBig(taskNum: number, solutionNum: number): void {
    Renderer.perPage(2, 3);

    SudokuBuilder.rectangular(true, 4, 2);
    let sudoku1 = SudokuBuilder.build();
    SudokuBuilder.prompterNum(25, null);
    SudokuBuilder.rectangular(true, 3, 3);
    let sudoku2 = SudokuBuilder.build();

    SudokuBuilder.prompterNum(22, null);
    SudokuBuilder.diagonal(true);
    let sudokuDiagonal1 = SudokuBuilder.build();

    SudokuBuilder.diagonal(false);
    SudokuBuilder.prompterNum(24, null);
    SudokuBuilder.irregular(true);
    let irregularSudoku = SudokuBuilder.build();

    SudokuBuilder.prompterNum(null, null);
    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    let sudokuVx1 = SudokuBuilder.build();

    SudokuBuilder.vxSum(false, null);
    SudokuBuilder.size(8);
    SudokuBuilder.prompterNum(27, null);
    let noRectangle = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    SudokuBuilder.prompterNum(22, null);
    let noRectangleDiagonal = SudokuBuilder.build();

    SudokuBuilder.prompterNum(null, null);
    SudokuBuilder.diagonal(false);

    let notKropki = Math.floor(Math.random() * 3);

    let kropki, minusOne, inequality;
    if (notKropki !== 0) {
        SudokuBuilder.rectangular(true, 3, 3);
        SudokuBuilder.kropki(true);
        kropki = SudokuBuilder.build();
    }
    if (notKropki !== 1) {
        SudokuBuilder.size(8);
        SudokuBuilder.minusOne(true);
        minusOne = SudokuBuilder.build();
    }
    if (notKropki !== 2) {
        SudokuBuilder.size(8);
        SudokuBuilder.inequality(true);
        inequality = SudokuBuilder.build();
    }

    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.kropki(false);
    SudokuBuilder.minusOne(false);
    SudokuBuilder.inequality(false);
    SudokuBuilder.prompterNum(null, 0);
    SudokuBuilder.killer(true, [[1, 8], [2, 15], [3, 9], [4, 4]]);
    let killerSudoku = SudokuBuilder.build();

    let randomPieceMoves = Math.floor(Math.random() * 2);

    SudokuBuilder.killer(false, null);
    SudokuBuilder.prompterNum(null, null);
    SudokuBuilder.pieceMoves(randomPieceMoves === 0, randomPieceMoves === 1);
    let piecesSudoku = SudokuBuilder.build();

    SudokuBuilder.pieceMoves(false, false);

    Renderer.doFormatPage = true;
    for (let i = 0; i < taskNum; i++) {
        Renderer.render(sudoku1?.task, sudoku1);
        Renderer.render(sudoku2?.task, sudoku2);
        Renderer.render(sudokuDiagonal1?.task, sudokuDiagonal1);
        Renderer.render(irregularSudoku?.task, irregularSudoku);
        Renderer.render(sudokuVx1?.task, sudokuVx1);
        Renderer.render(noRectangle?.task, noRectangle);
        Renderer.render(noRectangleDiagonal?.task, noRectangleDiagonal);
        if (notKropki !== 0) {
            Renderer.render(kropki?.task, kropki);
        }
        if (notKropki !== 1) {
            Renderer.render(minusOne?.task, minusOne);
        }
        if (notKropki !== 2) {
            Renderer.render(inequality?.task, inequality);
        }
        Renderer.render(killerSudoku?.task, killerSudoku);
        Renderer.render(piecesSudoku?.task, piecesSudoku);

        Renderer.breakPage();
    }

    for (let i = 0; i < solutionNum; i++) {
        Renderer.render(sudoku1?.solution, sudoku1);
        Renderer.render(sudoku2?.solution, sudoku2);
        Renderer.render(sudokuDiagonal1?.solution, sudokuDiagonal1);
        Renderer.render(irregularSudoku?.solution, irregularSudoku);
        Renderer.render(sudokuVx1?.solution, sudokuVx1);
        Renderer.render(noRectangle?.solution, noRectangle);
        Renderer.render(noRectangleDiagonal?.solution, noRectangleDiagonal);
        if (notKropki !== 0) {
            Renderer.render(kropki?.solution, kropki);
        }
        if (notKropki !== 1) {
            Renderer.render(minusOne?.solution, minusOne);
        }
        if (notKropki !== 2) {
            Renderer.render(inequality?.solution, inequality);
        }
        Renderer.render(killerSudoku?.solution, killerSudoku);
        Renderer.render(piecesSudoku?.solution, piecesSudoku);

        Renderer.breakPage();
    }
}

function tournamentLogicSmall(taskNum: number, solutionNum: number): void {
    let mastermind = MastermindBuilder.build(10, 4, 5);

    let coral;
    if (Math.random() < 0.5) {
        coral = CoralBuilder.build(10, 10, false, false);
    } else {
        coral = CoralBuilder.build(9, 9, false, true);
    }
    let coralSorted;
    if (Math.random() < 0.5) {
        coralSorted = CoralBuilder.build(7, 7, true, false);
    } else {
        coralSorted = CoralBuilder.build(6, 6, true, true);
    }
    let stars = null;
    if (Math.random() < 0.5) {
        stars = StarsBuilder.build(5, 1);
    } else {
        while (stars === null) {
            stars = StarsBuilder.build(6, 1);
        }
    }

    let tapa = TapaBuilder.build(7, 7);

    let slitherlink = SlitherlinkBuilder.build(7, 7);

    let range = RangeBuilder.build(5, 4, Math.random() < 0.5 ? "kuromasu" : "cave");

    let domino = DominoBuilder.build(4);

    Renderer.perPage(2, 3);
    SudokuBuilder.size(5);
    let abcSize = Math.floor(Math.random() * 2);
    SudokuBuilder.abc(true, abcSize === 0 ? 2 : 3);
    let abc1 = SudokuBuilder.build();
    let isKing = Math.floor(Math.random() * 2) === 0;
    SudokuBuilder.pieceMoves(isKing, ! isKing);
    SudokuBuilder.abc(true, abcSize === 1 ? 2 : 3);
    let abc2 = SudokuBuilder.build();

    SudokuBuilder.pieceMoves(false, false);
    SudokuBuilder.size(4);
    SudokuBuilder.skyscraper(true);
    let skyscraper = SudokuBuilder.build();

    let galaxy = GalaxyBuilder.build(8, 8);

    Renderer.doFormatPage = false;
    for (let i = 0; i < taskNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind[0], mastermind[1], null);
        stars?.render(stars?.board, false);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coral.task, coral.board, coral);
        // @ts-ignore
        CoralBuilder.render(coralSorted.task, coralSorted.board, coralSorted);
        Renderer.breakLineForce();
        // @ts-ignore
        TapaBuilder.render(tapa.board, tapa.task, tapa);
        slitherlink.render(false, true);
        Renderer.breakLineForce();
        range?.render(range?.board, false);
        domino?.render(domino?.board);
        Renderer.breakPageForce();
        Renderer.breakLineForce();
        Renderer.render(abc1?.task, abc1);
        Renderer.render(abc2?.task, abc2);
        Renderer.breakLineForce();
        Renderer.render(skyscraper?.task, skyscraper);
        galaxy?.render(galaxy?.board, false);

        Renderer.breakPageForce();
    }

    for (let i = 0; i < solutionNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind[0], mastermind[1], mastermind[2]);
        stars?.render(stars?.solution, true);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coral.task, coral.solution, coral);
        // @ts-ignore
        CoralBuilder.render(coralSorted.task, coralSorted.solution, coralSorted);
        Renderer.breakLineForce();
        // @ts-ignore
        TapaBuilder.render(tapa.solution, tapa.task, tapa);
        slitherlink.render(true, false);
        Renderer.breakLineForce();
        range?.render(range?.solution, false);
        domino?.render(domino?.solution);
        Renderer.breakPageForce();
        Renderer.breakLineForce();
        Renderer.render(abc1?.solution, abc1);
        Renderer.render(abc2?.solution, abc2);
        Renderer.breakLineForce();
        Renderer.render(skyscraper?.solution, skyscraper);
        galaxy?.render(galaxy?.solution, true);

        Renderer.breakPageForce();
    }
}

function tournamentLogicBig(taskNum: number, solutionNum: number): void {
    let mastermind = MastermindBuilder.build(12, 6, 6);

    let coral;
    if (Math.random() < 0.5) {
        coral = CoralBuilder.build(14, 10, false, true);
    } else {
        coral = CoralBuilder.build(9, 9, true, false);
    }

    let galaxy = null;
    while (galaxy === null) {
        galaxy = GalaxyBuilder.build(12, 12);
    }

    let isKuromasu = Math.random() < 0.5;
    let range = RangeBuilder.build(isKuromasu ? 7 : 6, 5, isKuromasu ? "kuromasu" : "cave");

    let domino = DominoBuilder.build(5);

    Renderer.perPage(3, 4);
    SudokuBuilder.size(6);
    SudokuBuilder.skyscraper(true);
    let skyscraper = SudokuBuilder.build();

    let stars = null;
    while (stars === null) {
        stars = StarsBuilder.build(9, 2);
    }

    let tapa1 = TapaBuilder.build(10, 10);

    let slitherlink1 = SlitherlinkBuilder.build(10, 10);

    let fourSixFirst = Math.floor(Math.random() * 2);
    let isKing = Math.floor(Math.random() * 2);

    Renderer.perPage(2, 3);
    SudokuBuilder.size(fourSixFirst === 0 ? 6 : 7);
    SudokuBuilder.abc(true, fourSixFirst === 0 ? 4 : 3);
    let abc1 = SudokuBuilder.build();
    SudokuBuilder.size(fourSixFirst === 0 ? 7 : 6);
    SudokuBuilder.abc(true, fourSixFirst === 0 ? 3 : 4);
    SudokuBuilder.pieceMoves(isKing === 1, isKing === 0);
    let abc2 = SudokuBuilder.build();

    SudokuBuilder.abc(false, null);
    SudokuBuilder.pieceMoves(false, false);

    Renderer.doFormatPage = false;
    for (let i = 0; i < taskNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind[0], mastermind[1], null);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coral.task, coral.board, coral);
        Renderer.breakLineForce();
        galaxy.render(galaxy.board, false);
        range?.render(range?.board, false);
        domino?.render(domino?.board);
        Renderer.breakPageForce();
        stars.render(stars.board, false);
        // @ts-ignore
        TapaBuilder.render(tapa1.board, tapa1.task, tapa1);
        slitherlink1.render(false, true);
        Renderer.render(skyscraper?.task, skyscraper);
        Renderer.breakLineForce();
        Renderer.render(abc1?.task, abc1);
        Renderer.render(abc2?.task, abc2);

        Renderer.breakPageForce();
    }

    for (let i = 0; i < solutionNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind[0], mastermind[1], mastermind[2]);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coral.task, coral.solution, coral);
        galaxy.render(galaxy.solution, true);
        range?.render(range?.solution, false);
        domino?.render(domino?.solution);
        Renderer.breakPageForce();
        stars.render(stars.solution, true);
        // @ts-ignore
        TapaBuilder.render(tapa1.solution, tapa1.task, tapa1);
        slitherlink1.render(true, false);
        Renderer.render(skyscraper?.solution, skyscraper);
        Renderer.breakLineForce();
        Renderer.render(abc1?.solution, abc1);
        Renderer.render(abc2?.solution, abc2);

        Renderer.breakPageForce();
    }
}

function tournament(taskNum: number, solutionNum: number): void {
    tournamentSudokuSmall(taskNum, solutionNum);
    tournamentSudokuBig(taskNum, solutionNum);
    tournamentLogicSmall(taskNum, solutionNum);
    tournamentLogicBig(taskNum, solutionNum);
}

function main(): void {
    console.log("Hello world");

    // tournament(2, 1);

    // ---

    // // Basic sudoku and variants
    // SudokuBuilder.rectangular(true, 3, 2); // basic sudoku
    // // SudokuBuilder.size(6); // without rectangles
    // // SudokuBuilder.irregular(true); // irregular blocks
    // // SudokuBuilder.diagonal(true); // add diagonal
    // // SudokuBuilder.letters(true, null);
    // // SudokuBuilder.letters(true, ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"]);
    // // SudokuBuilder.letters(true, ["♔", "♕", "♖", "♗", "♘", "♙", "♚", "♛", "♜"]);
    // // SudokuBuilder.letters(true, ["□", "◯", "◇", "⬠", "⬡", "☆", "⛧", "▱", "△"]);
    // // SudokuBuilder.letters(true, ["♠", "♥", "♦", "♣", "♤", "♡", "♢", "♧", ":)"]);
    // // SudokuBuilder.kropki(true); // kropki
    // // SudokuBuilder.minusOne(true); // show all squares with difference of 1
    // // SudokuBuilder.minusOneDirection(true); // show all squares with difference of 1 and inequality between them
    // // SudokuBuilder.inequality(true); // show all inequalities
    // // SudokuBuilder.prompterNum(null, 0);
    // // SudokuBuilder.killer(true, [[1, 1], [2, 9], [3, 3], [4, 2]]); // killer 3x2 (0 prompter)
    // // SudokuBuilder.killer(true, [[1, 7], [2, 14], [3, 10], [4, 4]]); // killer 3x3 (0 prompter)
    // // SudokuBuilder.killerUnchained(true, [[1, 4], [2, 8], [3, 4], [4, 1]]); // killer unchained 3x2 (0 prompter)
    // // SudokuBuilder.killerUnchained(true, [[1, 14], [2, 14], [3, 9], [4, 3]]); // killer 3x3 (0 prompter)
    // // SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]); SudokuBuilder.prompterNum(null, 3); // vx
    // // SudokuBuilder.roman(true);
    // // SudokuBuilder.pieceMoves(true, false); // king move
    // // SudokuBuilder.pieceMoves(false, true); // knight move
    //
    // Renderer.perPage(2, 3);
    // SudokuBuilder.killerUnchained(true, [[1, 4], [2, 8], [3, 4], [4, 1]]); // killer unchained 3x2 (0 prompter)
    // for (let i = 0; i < 6; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         Renderer.render(sudoku.task, sudoku);
    //         // Renderer.render(sudoku.solution, sudoku);
    //     }
    // }
    //
    // SudokuBuilder.prompterNum(null, 0);
    // SudokuBuilder.rectangular(true, 3, 3); // basic sudoku
    // SudokuBuilder.killerUnchained(true, [[1, 14], [2, 14], [3, 9], [4, 3]]); // killer 3x3 (0 prompter)
    // for (let i = 0; i < 6; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         Renderer.render(sudoku.task, sudoku);
    //         // Renderer.render(sudoku.solution, sudoku);
    //     }
    // }

    // ---

    // // Easy as abc + skyscraper + slovak sums
    // SudokuBuilder.size(8);
    // // SudokuBuilder.abc(true, 2);
    // SudokuBuilder.slovak(true, 5);
    // // SudokuBuilder.skyscraper(true);
    // // SudokuBuilder.pieceMoves(true, false); // king move
    // // SudokuBuilder.pieceMoves(false, true); // knight move
    //
    // Renderer.perPage(2, 3);
    // for (let i = 0; i < 24; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         Renderer.render(sudoku.task, sudoku);
    //         // Renderer.render(sudoku.solution, sudoku);
    //     }
    // }

    // ---

    // // Sudoku with difficulty
    // let tries = [
    //     [0, 1.6],
    //     [1.6, 3],
    //     [3, 5],
    //     [5, 7],
    //     [7, 10],
    //     [10, 100],
    // ];
    //
    // SudokuBuilder.setDoPrint(false);
    // SudokuBuilder.rectangular(true, 3, 3);
    // for (let i = 0; i < tries.length; i++) {
    //     let minPoints, maxPoints;
    //     [minPoints, maxPoints] = tries[i];
    //
    //     let sudoku, points;
    //     [sudoku, points] = SudokuEvaluator.build(minPoints, maxPoints, 128);
    //
    //     if (sudoku) {
    //         Renderer.render(sudoku.task, sudoku);
    //     }
    // }

    // ---

    // // Mastermind
    // MastermindBuilder.main();

    // ---

    // // Coral (structure, not puzzle)
    // // CoralGenerator.typeCoral();
    // CoralGenerator.doLog = true;
    // CoralGenerator.typeTapa();
    // // CoralGenerator.typeSlitherlink();
    // let then, coral, now;
    //
    // let size = [100, 100];
    //
    // then = (new Date).getTime();
    // coral = CoralGenerator.createCoral(size[0], size[1]);
    // now = (new Date).getTime();
    // console.log(now - then + "ms");
    // CoralGenerator.render(coral);

    // ---

    // // Coral
    // CoralBuilder.main();
    // // CoralSolver.main();

    // ---

    // // Tapa
    // TapaBuilder.main();
    // TapaSolver.main();
    // TapaPuzzleBuilder.main();

    // ---

    // // Slitherlink
    // // Slitherlink.main();
    // // SlitherlinkSolver.main();
    // // SlitherlinkBuilder.main();
    // // ConfigSlitherlinkBuilder.main();
    // for (let i = 0; i < 12; i++) {
    //     let slitherlink = SlitherlinkBuilder.build(10, 10);
    //     slitherlink.render(false, true);
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 12; i++) {
    //     let slitherlink = SlitherlinkBuilder.build(10, 10);
    //     slitherlink.render(false, true);
    // }

    // ---

    // // Group generator
    // GroupGenerator.main();

    // ---

    // let board = [[3, 3, 3, 3], [3, 3, 3, 3], [3, 1, 3, 3], [1, 1, 3, 3]];
    // let group = [[0, 0], [0, 1], [1, 0], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3]];
    // let mustBe = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    // let canNotBe = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    // let solutionCount = 0;
    // let added: number[] = [];
    // let starNum = 2;
    // let size = 4;
    // console.log(StarsSolver.bruteforceGroup(board, group, mustBe, canNotBe, solutionCount, added, starNum, size));
    // return;

    // Stars
    StarsSolver.MAX_DEPTH = 3;
    // Renderer.breakPageForce();
    // for (let i = 0; i < 24; i++) {
    //     if (i % 4 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let stars = StarsBuilder.build(5, 1);
    //     stars?.render(false);
    // }
    Renderer.breakPageForce();
    for (let i = 0; i < 12; i++) {
        if (i % 2 === 0) {
            Renderer.breakLineForce();
        }
        if (i % 6 === 0 && i !== 0) {
            Renderer.breakPageForce();
        }
        let stars = StarsBuilder.build(9, 2);
        stars?.render(stars?.board, false);
    }

    // ---

    // // Range
    // for (let i = 0; i < 35; i++) {
    //     let range = RangeBuilder.build(4, 4, "cave");
    //     if (range !== null) {
    //         range.render(range.board, false);
    //     }
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 24; i++) {
    //     let range = RangeBuilder.build(5, 5, "cave");
    //     if (range !== null) {
    //         range.render(range.board, false);
    //     }
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 18; i++) {
    //     let range = RangeBuilder.build(6, 5, "cave");
    //     if (range !== null) {
    //         range.render(range.board, false);
    //     }
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 15; i++) {
    //     let range = RangeBuilder.build(6, 6, "cave");
    //     if (range !== null) {
    //         range.render(range.board, false);
    //     }
    // }

    // ---

    // // Galaxy
    // Renderer.breakPageForce();
    // for (let i = 0; i < 24; i++) {
    //     if (i % 12 === 0 && i !== 0) {
    //         Renderer.breakPageForce();
    //     } else if (i % 3 === 0 && i !== 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let galaxy = GalaxyBuilder.build(7, 7);
    //     if (galaxy !== null) {
    //         galaxy.render(galaxy.board, true);
    //     }
    // }
    // for (let i = 0; i < 12; i++) {
    //     if (i % 6 === 0) {
    //         Renderer.breakPageForce();
    //     } else if (i % 2 === 0 && i !== 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let galaxy = GalaxyBuilder.build(10, 10);
    //     if (galaxy !== null) {
    //         galaxy.render(galaxy.board, true);
    //     }
    // }

    // ---

    // // Domino
    // for (let i = 0; i < 28; i++) {
    //     if (i % 4 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let domino = DominoBuilder.build(4);
    //     if (domino !== null) {
    //         domino.render(domino.board);
    //         // domino.render(domino.solution, true);
    //     }
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 15; i++) {
    //     if (i % 3 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let domino = DominoBuilder.build(5);
    //     if (domino !== null) {
    //         domino.render(domino.board);
    //         // domino.render(domino.solution, true);
    //     }
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 15; i++) {
    //     if (i % 3 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let domino = DominoBuilder.build(6);
    //     if (domino !== null) {
    //         domino.render(domino.board);
    //         // domino.render(domino.solution, true);
    //     }
    // }
}