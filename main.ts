function tournamentSudokuSmall(taskNum: number, solutionNum: number): void {
    Renderer.perPage(2, 3);

    SudokuBuilder.rectangular(true, 3, 2);
    let sudoku1 = SudokuBuilder.build();
    let sudoku2 = SudokuBuilder.build();
    let sudoku3 = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    let sudokuDiagonal1 = SudokuBuilder.build();
    let sudokuDiagonal2 = SudokuBuilder.build();

    SudokuBuilder.diagonal(false);
    SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    let sudokuVx1 = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    let sudokuVxDiagonal = SudokuBuilder.build();

    SudokuBuilder.vxSum(false);
    SudokuBuilder.size(5);
    SudokuBuilder.diagonal(false);
    let noRectangle = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    let noRectangleDiagonal = SudokuBuilder.build();

    SudokuBuilder.rectangular(true, 3, 2);
    SudokuBuilder.kropki(true);
    SudokuBuilder.diagonal(false);
    let sudokuKropki = SudokuBuilder.build();

    SudokuBuilder.kropki(false);
    SudokuBuilder.diagonal(false);

    for (let i = 0; i < taskNum; i++) {
        Renderer.render(sudoku1?.task, sudoku1);
        Renderer.render(sudoku2?.task, sudoku2);
        Renderer.render(sudoku3?.task, sudoku3);
        Renderer.render(sudokuDiagonal1?.task, sudokuDiagonal1);
        Renderer.render(sudokuDiagonal2?.task, sudokuDiagonal2);
        Renderer.render(sudokuVx1?.task, sudokuVx1);
        Renderer.render(sudokuVxDiagonal?.task, sudokuVxDiagonal);
        Renderer.render(noRectangle?.task, noRectangle);
        Renderer.render(noRectangleDiagonal?.task, noRectangleDiagonal);
        Renderer.render(sudokuKropki?.task, sudokuKropki);

        Renderer.breakPage();
    }

    for (let i = 0; i < solutionNum; i++) {
        Renderer.render(sudoku1?.solution, sudoku1);
        Renderer.render(sudoku2?.solution, sudoku2);
        Renderer.render(sudoku3?.solution, sudoku3);
        Renderer.render(sudokuDiagonal1?.solution, sudokuDiagonal1);
        Renderer.render(sudokuDiagonal2?.solution, sudokuDiagonal2);
        Renderer.render(sudokuVx1?.solution, sudokuVx1);
        Renderer.render(sudokuVxDiagonal?.solution, sudokuVxDiagonal);
        Renderer.render(noRectangle?.solution, noRectangle);
        Renderer.render(noRectangleDiagonal?.solution, noRectangleDiagonal);
        Renderer.render(sudokuKropki?.solution, sudokuKropki);

        Renderer.breakPage();
    }
}

function tournamentSudokuBig(taskNum: number, solutionNum: number): void {
    Renderer.perPage(2, 3);

    SudokuBuilder.prompterNum(25, null);
    SudokuBuilder.rectangular(true, 3, 3);
    let sudoku1 = SudokuBuilder.build();
    let sudoku2 = SudokuBuilder.build();

    SudokuBuilder.prompterNum(23, null);
    SudokuBuilder.diagonal(true);
    let sudokuDiagonal1 = SudokuBuilder.build();

    SudokuBuilder.prompterNum(null, null);
    SudokuBuilder.diagonal(false);
    SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    let sudokuVx1 = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    let sudokuVxDiagonal = SudokuBuilder.build();

    SudokuBuilder.vxSum(false);
    SudokuBuilder.size(7);
    SudokuBuilder.diagonal(false);
    let noRectangle = SudokuBuilder.build();

    SudokuBuilder.diagonal(true);
    let noRectangleDiagonal = SudokuBuilder.build();

    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.kropki(true);
    SudokuBuilder.diagonal(false);
    let sudokuKropki = SudokuBuilder.build();

    SudokuBuilder.kropki(false);
    SudokuBuilder.diagonal(false);

    for (let i = 0; i < taskNum; i++) {
        Renderer.render(sudoku1?.task, sudoku1);
        Renderer.render(sudoku2?.task, sudoku2);
        Renderer.render(sudokuDiagonal1?.task, sudokuDiagonal1);
        Renderer.render(sudokuVx1?.task, sudokuVx1);
        Renderer.render(sudokuVxDiagonal?.task, sudokuVxDiagonal);
        Renderer.render(noRectangle?.task, noRectangle);
        Renderer.render(noRectangleDiagonal?.task, noRectangleDiagonal);
        Renderer.render(sudokuKropki?.task, sudokuKropki);

        Renderer.breakPage();
    }

    for (let i = 0; i < solutionNum; i++) {
        Renderer.render(sudoku1?.solution, sudoku1);
        Renderer.render(sudoku2?.solution, sudoku2);
        Renderer.render(sudokuDiagonal1?.solution, sudokuDiagonal1);
        Renderer.render(sudokuVx1?.solution, sudokuVx1);
        Renderer.render(sudokuVxDiagonal?.solution, sudokuVxDiagonal);
        Renderer.render(noRectangle?.solution, noRectangle);
        Renderer.render(noRectangleDiagonal?.solution, noRectangleDiagonal);
        Renderer.render(sudokuKropki?.solution, sudokuKropki);

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
    SudokuBuilder.abc(true, 2);
    let abc1 = SudokuBuilder.build();
    SudokuBuilder.size(5);
    SudokuBuilder.abc(true, 3);
    let abc2 = SudokuBuilder.build();

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

    Renderer.perPage(2, 3);
    SudokuBuilder.size(6);
    SudokuBuilder.abc(true, 4);
    let abc1 = SudokuBuilder.build();
    SudokuBuilder.size(7);
    SudokuBuilder.abc(true, 3);
    let abc2 = SudokuBuilder.build();

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

    // // tournament(3, 1);
    //
    // // Basic sudoku and variants
    // SudokuBuilder.rectangular(true, 3, 2); // basic sudoku
    // // SudokuBuilder.size(9); // without rectangles
    // // SudokuBuilder.diagonal(true); // add diagonal
    // // SudokuBuilder.kropki(true); // kropki
    // SudokuBuilder.minusOne(true); // show all squares with difference of 1
    // // SudokuBuilder.inequality(true); // show all inequalities
    // // SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]); SudokuBuilder.prompterNum(null, 3); // vx
    // // SudokuBuilder.pieceMoves(true, false); // king move
    // // SudokuBuilder.pieceMoves(false, true); // knight move
    //
    // Renderer.perPage(3, 4);
    // for (let i = 0; i < 12; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         Renderer.render(sudoku.task, sudoku);
    //         // Renderer.render(sudoku.solution, sudoku);
    //     }
    // }


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

    // Tapa
    // TapaBuilder.main();
    // TapaSolver.main();
    // TapaPuzzleBuilder.main();

    // ---

    // Slitherlink
    // Slitherlink.main();
    // SlitherlinkSolver.main();
    // SlitherlinkBuilder.main();
    // ConfigSlitherlinkBuilder.main();

    // ---

    // Group generator
    GroupGenerator.main();
}