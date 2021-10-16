function main(): void {
    console.log("Hello world");

    let sudoku = new Sudoku(9, true, 3, 3, false, false, null);
    console.log(sudoku.solution.board);
}