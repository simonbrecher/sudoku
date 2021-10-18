function main(): void {
    console.log("Hello world");

    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.prompterNum(25);
    // SudokuBuilder.diagonal(true);
    let sudoku = SudokuBuilder.build();

    if (sudoku !== null) {
        console.log(sudoku.solution);
        console.log(sudoku.task);
    }
}