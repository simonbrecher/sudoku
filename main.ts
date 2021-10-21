function main(): void {
    console.log("Hello world");

    SudokuBuilder.rectangular(true, 3, 3);
    // SudokuBuilder.prompterNum(null, 3);
    // SudokuBuilder.diagonal(true);
    SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    // let sudoku = SudokuBuilder.build();

    // if (sudoku !== null) {
    //     console.log(sudoku.solution);
    //     console.log(sudoku.task);
    // }

    console.log("HERE");

    SudokuBuilder.kropki(true);

    Renderer.perPage(2, 3);
    for (let i = 0; i < 24; i++) {
        let sudoku = SudokuBuilder.build();
        Renderer.render(sudoku?.task, sudoku);
        // Renderer.render(sudoku?.solution, sudoku);
    }
}