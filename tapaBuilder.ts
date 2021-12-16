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

    private static getTask(parent: ITapa): (number[] | null)[][] {
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
        let coral = CoralGenerator.build(width, height);
        if (coral !== null) {
            let tapa = new Tapa(width, height, coral);

            // this.render(tapa.board, tapa.task, tapa);
            // this.breakPage();

            tapa.task = this.getTask(tapa);

            // this.render(tapa.board, tapa.task, tapa);

            let now = (new Date).getTime();
            console.log(now - then +  "ms");

            this.renderBig(tapa.board, tapa.task, tapa);

            return tapa;
        }

        return null;
    }

    public static main(): void {
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
        this.build(9, 9);
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