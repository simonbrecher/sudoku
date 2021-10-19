function main(): void {
    console.log("Hello world");

    SudokuBuilder.rectangular(true, 3, 3);
    // SudokuBuilder.prompterNum(25);
    SudokuBuilder.diagonal(true);
    let sudoku = SudokuBuilder.build();

    if (sudoku !== null) {
        console.log(sudoku.solution);
        console.log(sudoku.task);
    }

    console.log("HERE");

    Renderer.perPage(2, 3);
    for (let i = 0; i < 100; i++) {
        Renderer.render(sudoku?.task, sudoku);0
    }
}