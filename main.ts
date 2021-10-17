function main(): void {
    console.log("Hello world");

    let sudoku = new Sudoku(9, true, 3, 3, true, false, null);
    console.log(sudoku.isDiagonal);

    let solution = sudoku.solution;
    solution[0][0] = 1;
    solution = Solver.solve(solution, sudoku);
    sudoku.solution = solution;

    console.log(sudoku.solution);
}