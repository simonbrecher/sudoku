/**
 * This function is no longer executed.
 */
function main(): void {
    console.log("Hello world");

    // Regular sudoku
    SudokuBuilder.rectangular(true, 3, 3);
    let sudoku1 = SudokuBuilder.build();
    Renderer.render(sudoku1?.task, sudoku1);

    // Different sizes
    SudokuBuilder.rectangular(true, 3, 2);
    let sudoku1x = SudokuBuilder.build();
    Renderer.render(sudoku1x?.task, sudoku1x);

    // Sudoku without rectangles
    SudokuBuilder.size(8);
    let sudoku2 = SudokuBuilder.build();
    Renderer.render(sudoku2?.task, sudoku2);

    // Diagonal sudoku
    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.diagonal(true);
    let sudoku3 = SudokuBuilder.build();
    SudokuBuilder.diagonal(false);
    Renderer.render(sudoku3?.task, sudoku3);

    // Kropki sudoku
    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.kropki(true);
    let sudoku4 = SudokuBuilder.build();
    SudokuBuilder.kropki(false);
    Renderer.render(sudoku4?.task, sudoku4);

    // VX sudoku
    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.vxSum(true, [[5, "V"], [10, "X"]]);
    let sudoku5 = SudokuBuilder.build();
    SudokuBuilder.vxSum(false);
    Renderer.render(sudoku5?.task, sudoku5);

    // Sudoku by difficulty
    SudokuBuilder.rectangular(true, 3, 3);
    let points;
    SudokuBuilder.setDoPrint(false);
    let minPoints = 7;
    let maxPoints = 10;
    let tries = 128;
    let sudoku6
    [sudoku6, points] = SudokuEvaluator.build(minPoints, maxPoints, tries); // 2 = easy, 7 = hard
    Renderer.render(sudoku6?.task, sudoku6);
    SudokuBuilder.setDoPrint(true);

    // Sudoku with more prompters
    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.prompterNum(55, null); // minimum, maximum
    let sudoku7 = SudokuBuilder.build();
    SudokuBuilder.prompterNum(null, null);
    Renderer.render(sudoku7?.task, sudoku7);

    // Sudoku solution
    SudokuBuilder.rectangular(true, 3, 3);
    let sudoku8 = SudokuBuilder.build();
    Renderer.render(sudoku8?.solution, sudoku8);

    // Easy as abc
    SudokuBuilder.size(6);
    SudokuBuilder.abc(true, 3);
    let sudoku9 = SudokuBuilder.build();
    SudokuBuilder.rectangular(true, 3, 3);
    SudokuBuilder.abc(false, null);
    Renderer.render(sudoku9?.board, sudoku9); // FOR ABC IS BOARD NOT TASK !!

    Renderer.breakPage();

    // One page of tasks, one page of solutions
    let sudokus = [];
    SudokuBuilder.rectangular(true, 3, 3);
    Renderer.perPage(2, 3); // number of sudoku in row, number of sudoku in column
    for (let i = 0; i < 6; i++) {
        let sudokuOne = SudokuBuilder.build();
        sudokus.push(sudokuOne);
    }
    for (let i = 0; i < 6; i++) {
        Renderer.render(sudokus[i]?.task, sudokus[i]);
    }
    for (let i = 0; i < 6; i++) {
        Renderer.render(sudokus[i]?.solution, sudokus[i]);
    }
}