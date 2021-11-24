function main(): void {
    console.log("Hello world");

    // // Basic sudoku and variants
    // SudokuBuilder.rectangular(true, 3, 3); // basic sudoku
    // // SudokuBuilder.size(9); // without rectangles
    // // SudokuBuilder.diagonal(true); // add diagonal
    // // SudokuBuilder.kropki(true); // kropki
    // // SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]); SudokuBuilder.prompterNum(null, 3); // vx
    //
    // Renderer.perPage(2, 3);
    // for (let i = 0; i < 6; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         Renderer.render(sudoku.task, sudoku);
    //     }
    // }

    // ---

    // // Easy as abc
    // SudokuBuilder.size(6);
    // SudokuBuilder.abc(true, 3);
    //
    // Renderer.perPage(3, 4);
    // for (let i = 0; i < 72; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         // Renderer.render(sudoku?.solution, sudoku);
    //         Renderer.render(sudoku?.board, sudoku);
    //     }
    // }
    // SudokuBuilder.abc(true, 4);
    // for (let i = 0; i < 24; i++) {
    //     let sudoku = SudokuBuilder.build();
    //     if (sudoku !== null) {
    //         // Renderer.render(sudoku?.solution, sudoku);
    //         Renderer.render(sudoku?.board, sudoku);
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
    // CoralGenerator.typeTapa();
    // CoralGenerator.doLog = true;
    // // CoralGenerator.typeTapa();
    // // CoralGenerator.typeSlitherlink();
    // let then = (new Date).getTime();
    // let coral = CoralGenerator.createCoral(60, 60);
    // let now = (new Date).getTime();
    // console.log(now - then + "ms");
    // CoralGenerator.render(coral);

    // ---

    // Coral
    CoralBuilder.main();
    // CoralSolver.main();
}