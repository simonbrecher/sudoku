class TapaBuilder {
    private static readonly PRINT_WIDTH = 45;
    private static readonly PRINT_HEIGHT = 63;

    public static breakPage() {
        let pageWrapper = document.getElementById("page-wrapper");
        let pageBreak = document.createElement("hr");
        pageBreak.classList.add("page-break-tapa");
        pageWrapper?.appendChild(pageBreak);
    }

    public static render(
        board: number[][], task: (number[] | null)[][], parent: ITapa,
        renderNumbers: boolean = true, renderDebug: boolean = false,
        startX: number = 0, startY: number = 0, lengthX: number = parent.width, lengthY: number = parent.height,
    ): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        pageWrapper?.appendChild(wrapper);

        let boardTable = document.createElement("table");
        wrapper?.appendChild(boardTable);
        boardTable.classList.add("tapa-table");

        // let hr = document.createElement("hr");
        // hr.classList.add("clear");
        // wrapper.appendChild(hr);

        for (let y = startY; y < Math.min(startY + lengthY, parent.height); y++) {
            let row = boardTable.insertRow();

            for (let x = startX; x < Math.min(startX + lengthX, parent.width); x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                let prompter = task[y][x];
                if (prompter !== null && renderNumbers) {
                    // if ((Math.random() < 0.6 || x === 0 || x === parent.width - 1 || y === 0 || y === parent.height) && prompter.length <= 3) {
                        squareDiv.textContent = prompter.join("");
                        // squareDiv.classList.add("red");
                    // }
                } else if (board[y][x] === 1) {
                    // nothing
                } else if (board[y][x] === 2) {
                    squareDiv.textContent = "X";
                    squareDiv.classList.add("black");
                } else if (board[y][x] === 3) {
                    if (renderDebug) {
                        squareDiv.textContent = "?";
                        squareDiv.classList.add("orange");
                    }
                } else {
                    squareDiv.classList.add("red");
                    squareDiv.textContent = "!";
                }
            }
        }
    }

    public static renderBig(board: number[][], task: (number[] | null)[][], parent: ITapa): void {
        for (let y = 0; y < parent.height; y+=this.PRINT_HEIGHT) {
            for (let x = 0; x < parent.width; x+=this.PRINT_WIDTH) {
                if (y !== 0 || x !== 0) {
                    this.breakPage();
                }
                this.render(board, task, parent, true, false, x, y, this.PRINT_WIDTH, this.PRINT_HEIGHT);
            }
        }
    }

    private static getPrompterRandomOrder(task: (number[] | null)[][], parent: ITapa): number[][] {
        let prompters = [];
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (task[y][x] !== null) {
                    prompters.push([x, y]);
                }
            }
        }

        return Utils.shuffle(prompters);
    }

    private static setTaskFirst(parent: ITapa): (number[] | null)[][] {
        let task = parent.task;
        let oldTask = parent.task;

        let order = this.getPrompterRandomOrder(task, parent);

        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                task[y][x] = null;
            }
        }

        for (let i = 0; i < order.length; i++) {
            let removeX = order[i][0];
            let removeY = order[i][1];
            let canBeAdded = true;
            for (let dirY = -1; dirY <= 1; dirY++) {
                for (let dirX = -1; dirX <= 1; dirX++) {
                    if (dirX !== 0 || dirY !== 0) {
                        let newX = removeX + dirX;
                        let newY = removeY + dirY;
                        if (newX >= 0 && newX < parent.width && newY >= 0 && newY < parent.height) {
                            if (task[newY][newX] !== null) {
                                canBeAdded = false;
                            }
                        }
                    }
                }
            }
            if (canBeAdded) {
                task[removeY][removeX] = oldTask[removeY][removeX];
            }
        }

        return task;

        // // this.render(parent.board, task, parent, true, true);
        // // this.render(TapaSolver.solve(parent.board, task, parent), task, parent, true, true);
        //
        // for (let i = 0; i < order.length; i++) {
        //     let solutionCount = TapaSolver.splitSolve(parent.board, task, parent);
        //     console.log(TapaSolver.depths);
        //     console.log("setTaskFirst", solutionCount);
        //     // this.render(parent.board, task, parent);
        //     if (solutionCount === 0) {
        //         throw "TapaBuilder->setTaskFirst - SOLUTION COUNT == 0"
        //     } else if (solutionCount === 1) {
        //         parent.task = task;
        //         return;
        //     }
        //
        //     let removeX = order[i][0];
        //     let removeY = order[i][1];
        //     task[removeY][removeX] = oldTask[removeY][removeX]
        // }
    }

    private static getTask(parent: ITapa): (number[] | null)[][] | null {
        parent.task = this.setTaskFirst(parent);

        if (TapaSolver.splitSolve(parent.board, parent.task, parent) > 1) {
            return null;
        }
        let countUnsolved = TapaSolver.countUnsolvedSquares(TapaSolver.solve(parent.board, parent.task, parent), parent);
        if (countUnsolved < parent.width * parent.height / 2) {
            return null;
        }
        console.log(TapaSolver.countUnsolvedSquares(TapaSolver.solve(parent.board, parent.task, parent), parent));

        let task = parent.task;
        let order = this.getPrompterRandomOrder(task, parent);

        for (let i = 0; i < order.length; i++) {
            let removeX = order[i][0];
            let removeY = order[i][1];

            let removedPrompter = task[removeY][removeX];
            task[removeY][removeX] = null;

            parent.task = task;

            let solutionCount = TapaSolver.countSolutions(TapaSolver.solve(parent.board, task, parent), task, parent);

            // console.log(solutionCount);

            if (solutionCount > 1) {
                let board = TapaSolver.solve(parent.board, task, parent);
                board[removeY][removeX] = 0;
                // this.render(board, task, parent, true, true);
            }

            if (solutionCount === 0) {
                throw "TapaBuilder->getTask SOLUTION_COUNT == 0";
            } else if (solutionCount > 1) {
                task[removeY][removeX] = removedPrompter;
            }

            // console.log(i, order.length);
        }

        return task;
    }

    public static build(width: number, height: number): ITapa | null {
        let then = (new Date).getTime();

        CoralGenerator.typeTapa();
        while (true) {

            let coral = CoralGenerator.build(width, height);
            if (coral !== null) {
                let tapa = new Tapa(width, height, coral);

                // this.render(tapa.board, tapa.task, tapa);
                // this.breakPage();

                let task = this.getTask(tapa);

                if (task !== null) {

                    tapa.task = task;

                    // this.render(tapa.board, tapa.task, tapa);

                    let now = (new Date).getTime();
                    console.log(now - then + "ms");

                    // this.renderBig(tapa.board, tapa.task, tapa);

                    return tapa;

                }
                console.log("NOT");
            }
        }

        return null;
    }

    public static main(): void {
        let then = (new Date).getTime();
        for (let i = 0; i < 24; i++) {
            if (i % 12 == 0) {
                this.breakPage();
            }
            let now = (new Date).getTime();
            console.log(9, i, Math.ceil((now - then) / 1000) + "s");
            this.build(9, 9);
        }
        then = (new Date).getTime();
        for (let i = 0; i < 24; i++) {
            if (i % 12 == 0) {
                this.breakPage();
            }
            let now = (new Date).getTime();
            console.log(10, i, Math.ceil((now - then) / 1000) + "s");
            this.build(10, 10);
        }

        // this.build(10, 10);
        // this.breakPage();
        // for (let i = 0; i < 12; i++) {
        //     let tapa = this.build(20, 20);
        //     if (i % 6 === 0) {
        //         this.breakPage();
        //     }
        //     // @ts-ignore
        //     this.render(tapa.board, tapa.task, tapa);
        // }
        // this.breakPage();
        // this.build(30, 30);
        // this.breakPage();
        // this.build(40, 40);
        // this.breakPage();
        // this.build(50, 50);
        // this.breakPage();
        // this.build(60, 60);
        // this.breakPage();
        // this.build(70, 70);
        // this.breakPage();
        // this.build(80, 80);
        // this.breakPage();
        // this.build(90, 90);
        // this.breakPage();
        // this.build(180, 180);
    }
}