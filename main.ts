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
        minusOne = SudokuBuilder.build();
    }
    if (notUseKropki !== 2) {
        SudokuBuilder.inequality(true);
        inequality = SudokuBuilder.build();
    }

    SudokuBuilder.kropki(false);
    SudokuBuilder.minusOne(false);
    SudokuBuilder.inequality(false);
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
    SudokuBuilder.prompterNum(23, null);
    SudokuBuilder.irregular(true);
    let irregularSudoku = SudokuBuilder.build();

    SudokuBuilder.prompterNum(null, null);
    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    let sudokuVx1 = SudokuBuilder.build();

    SudokuBuilder.vxSum(false, null);
    SudokuBuilder.size(8);
    SudokuBuilder.prompterNum(26, null);
    let noRectangle = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    SudokuBuilder.prompterNum(21, null);
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
    SudokuBuilder.prompterNum(null, 1);
    SudokuBuilder.killer(true, [[1, 6], [2, 11], [3, 11], [4, 5]]);
    let killerSudoku = SudokuBuilder.build();

    let randomPieceMoves = Math.floor(Math.random() * 2);

    SudokuBuilder.killer(false, null);
    SudokuBuilder.prompterNum(null, null);
    SudokuBuilder.pieceMoves(randomPieceMoves === 0, randomPieceMoves === 1);
    let piecesSudoku = SudokuBuilder.build();

    SudokuBuilder.pieceMoves(false, false);

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
    let mastermind1 = MastermindBuilder.build(10, 4, 5);
    let mastermind2 = MastermindBuilder.build(12, 4, 5);

    let coral = CoralBuilder.build(10, 10, false, false);
    let coralRemoved = CoralBuilder.build(9, 9, false, true);
    let coralSorted = CoralBuilder.build(7, 7, true, false);
    let coralSortedRemoved = CoralBuilder.build(6, 6, true, true);

    let tapa1 = TapaBuilder.build(6, 6);
    let tapa2 = TapaBuilder.build(7, 7);

    let slitherlink1 = SlitherlinkBuilder.build(6, 6);
    let slitherlink2 = SlitherlinkBuilder.build(7, 7);

    Renderer.perPage(2, 3);
    SudokuBuilder.size(5);
    SudokuBuilder.abc(true, Math.random() < 0.5 ? 2 : 3);
    let abc1 = SudokuBuilder.build();
    let isKing = Math.floor(Math.random() * 2) === 0;
    SudokuBuilder.pieceMoves(isKing, ! isKing);
    SudokuBuilder.abc(true, Math.random() < 0.4 ? 2 : 3);
    let abc2 = SudokuBuilder.build();

    SudokuBuilder.pieceMoves(false, false);

    for (let i = 0; i < taskNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind1[0], mastermind1[1], null);
        // @ts-ignore
        MastermindBuilder.render(mastermind2[0], mastermind2[1], null);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coral.task, coral.board, coral);
        // @ts-ignore
        CoralBuilder.render(coralRemoved.task, coralRemoved.board, coralRemoved);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coralSorted.task, coralSorted.board, coralSorted);
        // @ts-ignore
        CoralBuilder.render(coralSortedRemoved.task, coralSortedRemoved.board, coralSortedRemoved);
        Renderer.breakPageForce();
        // @ts-ignore
        TapaBuilder.render(tapa1.board, tapa1.task, tapa1);
        // @ts-ignore
        TapaBuilder.render(tapa2.board, tapa2.task, tapa2);
        Renderer.breakLineForce();
        slitherlink1.render(false, true);
        slitherlink2.render(false, true);
        Renderer.breakLineForce();
        Renderer.render(abc1?.board, abc1);
        Renderer.refreshFormatting();
        Renderer.render(abc2?.board, abc2);

        Renderer.breakPageForce();
    }

    for (let i = 0; i < solutionNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind1[0], mastermind1[1], mastermind1[2]);
        // @ts-ignore
        MastermindBuilder.render(mastermind2[0], mastermind2[1], mastermind2[2]);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coral.task, coral.solution, coral);
        // @ts-ignore
        CoralBuilder.render(coralRemoved.task, coralRemoved.solution, coralRemoved);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coralSorted.task, coralSorted.solution, coralSorted);
        // @ts-ignore
        CoralBuilder.render(coralSortedRemoved.task, coralSortedRemoved.solution, coralSortedRemoved);
        Renderer.breakPageForce();
        // @ts-ignore
        TapaBuilder.render(tapa1.solution, tapa1.task, tapa1);
        // @ts-ignore
        TapaBuilder.render(tapa2.solution, tapa2.task, tapa2);
        Renderer.breakLineForce();
        slitherlink1.render(true, false);
        slitherlink2.render(true, false);
        Renderer.breakLineForce();
        Renderer.render(abc1?.solution, abc1);
        Renderer.refreshFormatting();
        Renderer.render(abc2?.solution, abc2);

        Renderer.breakPageForce();
    }
}

function tournamentLogicBig(taskNum: number, solutionNum: number): void {
    let mastermind = MastermindBuilder.build(12, 6, 6);

    let coralRemoved = CoralBuilder.build(12, 12, false, true);
    let coralSorted = CoralBuilder.build(9, 9, true, false);

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

    for (let i = 0; i < taskNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind[0], mastermind[1], null);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coralRemoved.task, coralRemoved.board, coralRemoved);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coralSorted.task, coralSorted.board, coralSorted);
        Renderer.breakPageForce();
        // @ts-ignore
        TapaBuilder.render(tapa1.board, tapa1.task, tapa1);
        slitherlink1.render(false, true);
        Renderer.breakLineForce();
        Renderer.render(abc1?.board, abc1);
        Renderer.refreshFormatting();
        Renderer.render(abc2?.board, abc2);

        Renderer.breakPageForce();
    }

    for (let i = 0; i < solutionNum; i++) {
        // @ts-ignore
        MastermindBuilder.render(mastermind[0], mastermind[1], mastermind[2]);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coralRemoved.task, coralRemoved.solution, coralRemoved);
        Renderer.breakLineForce();
        // @ts-ignore
        CoralBuilder.render(coralSorted.task, coralSorted.solution, coralSorted);
        Renderer.breakPageForce();
        // @ts-ignore
        TapaBuilder.render(tapa1.solution, tapa1.task, tapa1);
        slitherlink1.render(true, false);
        Renderer.breakLineForce();
        Renderer.render(abc1?.solution, abc1);
        Renderer.refreshFormatting();
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

    // Basic sudoku and variants
    SudokuBuilder.rectangular(true, 3, 3); // basic sudoku
    // SudokuBuilder.size(9); // without rectangles
    // SudokuBuilder.irregular(true); // irregular blocks
    // SudokuBuilder.diagonal(true); // add diagonal
    // SudokuBuilder.kropki(true); // kropki
    // SudokuBuilder.minusOne(true); // show all squares with difference of 1
    // SudokuBuilder.inequality(true); // show all inequalities
    SudokuBuilder.prompterNum(null, 0);
    // SudokuBuilder.killer(true, [[1, 1], [2, 9], [3, 3], [4, 2]]); // killer 3x2 (0 prompter)
    SudokuBuilder.killer(true, [[1, 7], [2, 14], [3, 10], [4, 4]]); // killer 3x3 (0 prompter)
    // SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]); SudokuBuilder.prompterNum(null, 3); // vx
    // SudokuBuilder.pieceMoves(true, false); // king move
    // SudokuBuilder.pieceMoves(false, true); // knight move
    //

    for (let j = 0; j < 1; j++) {

        let then = (new Date()).getTime();

        // SudokuBuilder.size(9);
        Renderer.perPage(2, 3);
        for (let i = 0; i < 10; i++) {
            let sudoku = SudokuBuilder.build();
            if (sudoku !== null) {
                Renderer.render(sudoku.task, sudoku);
                // Renderer.render(sudoku.solution, sudoku);
            }
        }

        let now = (new Date()).getTime();
        console.log(`${now - then}ms`);

    }

    // ---

    // // Easy as abc
    // SudokuBuilder.size(6);
    // SudokuBuilder.abc(true, 3);
    // SudokuBuilder.pieceMoves(true, false); // king move
    // // SudokuBuilder.pieceMoves(false, true); // knight move
    //
    // Renderer.perPage(2, 3);
    // for (let i = 0; i < 6; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         Renderer.render(sudoku?.board, sudoku);
    //         // Renderer.render(sudoku?.solution, sudoku);
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
    // Slitherlink.main();
    // SlitherlinkSolver.main();
    // SlitherlinkBuilder.main();
    // ConfigSlitherlinkBuilder.main();

    // ---

    // // Group generator
    // GroupGenerator.main();

    // ---

    // // Stars
    // Renderer.breakPageForce();
    // for (let i = 0; i < 24; i++) {
    //     if (i % 4 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let stars = StarsBuilder.build(5, 1);
    //     stars?.render(false);
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 15; i++) {
    //     if (i % 3 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let stars = StarsBuilder.build(6, 1);
    //     stars?.render(false);
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 6; i++) {
    //     if (i % 2 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let stars = StarsBuilder.build(9, 2);
    //     stars?.render(false);
    // }
    // Renderer.breakPageForce();
    // for (let i = 0; i < 6; i++) {
    //     if (i % 2 === 0) {
    //         Renderer.breakLineForce();
    //     }
    //     let stars = StarsBuilder.build(10, 2);
    //     stars?.render(false);
    // }
}