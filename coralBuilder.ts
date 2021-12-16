class CoralBuilder {
    private static readonly MAX_TRIES = 100;

    private static recursions: number;

    public static breakPage() {
        let pageWrapper = document.getElementById("page-wrapper");
        let pageBreak = document.createElement("hr");
        pageBreak.classList.add("page-break");
        pageWrapper?.appendChild(pageBreak);
    }

    public static breakLine() {
        let pageWrapper = document.getElementById("page-wrapper");
        let pageBreak = document.createElement("hr");
        pageWrapper?.appendChild(pageBreak);
    }

    public static render(task: (number[] | null)[][], board: number[][], parent: ICoral, showEmpty: boolean = false): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("coral-table");

        let extraWidth = 0;
        for (let i = 0; i < task[0].length; i++) {
            let newWidth = task[0][i]?.length ?? 0;
            if (newWidth > extraWidth) {
                extraWidth = newWidth;
            }
        }
        let extraHeight = 0;
        for (let i = 0; i < task[1].length; i++) {
            let newHeight = task[1][i]?.length ?? 0;
            if (newHeight > extraHeight) {
                extraHeight = newHeight;
            }
        }

        for (let y = 0; y < parent.height + extraHeight; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < parent.width + extraWidth; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                if (x < extraWidth || y < extraHeight) {
                    column.classList.add("border-none");
                } else {
                    if (x === extraWidth) {
                        column.classList.add("border-left");
                    } else if (x === extraWidth + parent.width - 1) {
                        column.classList.add("border-right");
                    }
                    if (y === extraHeight) {
                        column.classList.add("border-top");
                    } else if (y === extraHeight + parent.height - 1) {
                        column.classList.add("border-bottom");
                    }
                }
                column.appendChild(squareDiv);

                if (x < extraWidth && y < extraHeight) {
                    if (x === extraWidth - 1 && y === extraHeight - 1) {
                        squareDiv.classList.add("text-small");
                        if (parent.isSorted) {
                            squareDiv.textContent = "S";
                        }
                    }
                } else if (x < extraWidth) {
                    let length = task[0][y - extraHeight]?.length ?? 0;
                    let position = extraWidth - x - 1;
                    if (position < length) {
                        // @ts-ignore
                        squareDiv.textContent = task[0][y - extraHeight][length - position - 1];
                    }
                } else if (y < extraHeight) {
                    let length = task[1][x - extraWidth]?.length ?? 0;
                    let position = extraHeight - y - 1;
                    if (position < length) {
                        // @ts-ignore
                        squareDiv.textContent = task[1][x - extraWidth][length - position - 1];
                    }
                } else {
                    if (board[y - extraHeight][x - extraWidth] === 1) {
                        // nothing
                    } else if (board[y - extraHeight][x - extraWidth] === 2) {
                        squareDiv.classList.add("black");
                    } else if (board[y - extraHeight][x - extraWidth] === 3) {
                        if (showEmpty) {
                            squareDiv.textContent = "?";
                        }
                    } else {
                        squareDiv.textContent = "!";
                    }
                }
            }
        }
    }

    private static buildTry(width: number, height: number, isSorted: boolean): ICoral | null {
        CoralGenerator.typeCoral();
        let solution = CoralGenerator.build(width, height);
        return solution !== null ? new Coral(width, height, isSorted, solution): null;
    }

    private static getRandomPrompterOrder(parent: ICoral): number[][] {
        let arr = [];
        for (let y = 0; y < parent.height; y++) {
            arr.push([0, y]);
        }
        for (let x = 0; x < parent.width; x++) {
            arr.push([1, x]);
        }
        return Utils.shuffle(arr);
    }

    private static getTask(parent: ICoral): (number[] | null)[][] {
        let task = parent.task;
        let randomOrder = this.getRandomPrompterOrder(parent);

        for (let i = 0; i < parent.width + parent.height; i++) {
            let removedPosition = randomOrder[i];
            // console.log(removedPosition);
            let removedPrompter = task[removedPosition[0]][removedPosition[1]];

            task[removedPosition[0]][removedPosition[1]] = null;

            let solutionCount = CoralSolver.countSolutions(task, parent);
            // console.log(">", solutionCount, CoralSolver.recursions, CoralSolver.rowRecursions);
            if (solutionCount == 0) {
                throw "CoralBuilder->getTask - SOLUTION COUNT == 0";
            } else if (solutionCount > 1) {
                task[removedPosition[0]][removedPosition[1]] = removedPrompter;
            }
        }

        return task;
    }

    public static build(width: number, height: number, isSorted: boolean, removePrompter: boolean): ICoral | null {
        for (let tries = 0; tries < this.MAX_TRIES; tries ++) {
            this.recursions = 0;

            let coral = this.buildTry(width, height, isSorted);

            if (coral !== null) {
                let solutionCount = CoralSolver.countSolutions(coral.task, coral);
                console.log(">>", solutionCount, CoralSolver.recursions, CoralSolver.rowRecursions);

                if (solutionCount === 1) {
                    if (removePrompter) {
                        coral.task = this.getTask(coral);
                    }
                    return coral;
                }
            }
        }

        return null;
    }

    public static page(amount: [number, number, number], size: [number, number], isSorted: boolean, removePrompter: boolean, showSolution: boolean = false) {
        console.log(size);
        for (let i = 0; i < amount[0]; i++) {
            this.breakPage();
            for (let j = 0; j < amount[1]; j++) {
                this.breakLine();
                for (let k = 0; k < amount[2]; k++) {
                    let coral = this.build(size[0], size[1], isSorted, removePrompter);
                    if (coral !== null) {
                        this.render(coral.task, showSolution ? coral.solution : coral.board, coral);
                    }
                }
            }
        }
    }

    public static main(): void {
        let showSolution = false;
        let isSorted = false;
        let removePromters = false;
        this.page([2, 1, 1], [30, 30], isSorted, removePromters, showSolution)
        // this.page([1, 1, 1], [6, 6], isSorted, removePromters, showSolution);
        // this.page([1, 4, 3], [6, 6], isSorted, removePromters, showSolution);
        // this.page([1, 3, 2], [7, 7], isSorted, removePromters, showSolution);
        // this.page([1, 3, 2], [8, 8], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [10, 10], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [11, 11], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [12, 12], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [13, 13], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [14, 14], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [15, 15], isSorted, removePromters, showSolution);
        // this.page([1, 1, 1], [16, 16], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [17, 17], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [18, 18], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [19, 19], isSorted, removePromters, showSolution);
        // this.page([1, 2, 1], [20, 20], isSorted, removePromters, showSolution);
    }
}