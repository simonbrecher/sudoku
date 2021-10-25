function main(): void {
    console.log("Hello world");

    // SudokuBuilder.rectangular(true, 6, 4);
    // SudokuBuilder.diagonal(true);
    // // SudokuBuilder.prompterNum(null, 3);
    // // SudokuBuilder.diagonal(true);
    // // SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    // let sudoku = SudokuBuilder.build();
    //
    // if (sudoku !== null) {
    //     Renderer.render(sudoku.task, sudoku);
    // }

    // ---

    SudokuBuilder.size(6);
    SudokuBuilder.abc(true, 3);

    Renderer.perPage(3, 4);
    for (let i = 0; i < 72; i++) {
        let sudoku = SudokuBuilder.build();
        if (sudoku !== null) {
            // Renderer.render(sudoku?.solution, sudoku);
            Renderer.render(sudoku?.board, sudoku);
        }
    }
    SudokuBuilder.abc(true, 4);
    for (let i = 0; i < 24; i++) {
        let sudoku = SudokuBuilder.build();
        if (sudoku !== null) {
            // Renderer.render(sudoku?.solution, sudoku);
            Renderer.render(sudoku?.board, sudoku);
        }
    }
}