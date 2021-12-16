class TapaPuzzleBuilder {
    private static width: number;
    private static height: number;
    private static innerWidth: number;
    private static innerHeight: number;
    private static outerWidth: number;
    private static outerHeight: number;

    public static doLog = false;

    public static breakPage() {
        let pageWrapper = document.getElementById("page-wrapper");
        let pageBreak = document.createElement("hr");
        pageBreak.classList.add("page-break-tapa");
        pageWrapper?.appendChild(pageBreak);
    }

    public static breakLine() {
        let pageWrapper = document.getElementById("page-wrapper");
        let pageBreak = document.createElement("hr");
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

                if (x !== 0 && x !== this.width - 1 && y !== 0 && y !== this.height - 1 && lengthX === this.width && lengthY === this.height) {
                    if (x % this.innerWidth === 1) {
                        column.classList.add("border-left");
                    } else if (x % this.innerWidth === 0) {
                        column.classList.add("border-right");
                    }
                    if (y % this.innerHeight === 1) {
                        column.classList.add("border-top");
                    } else if (y % this.innerHeight === 0) {
                        column.classList.add("border-bottom")
                    }
                }

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

    private static printPermutations(permutations: number[], text: any = null): void {
        let print = [];
        for (let i = 0; i < permutations.length; i++) {
            let add = [];
            for (let shift = 0; shift < permutations.length; shift++) {
                if ((permutations[i] & 1 << shift) !== 0) {
                    add.push(shift + 1);
                }
            }
            print.push(add);
        }
        // console.log(text, print);
    }

    private static bigRender(parent: ITapa | null, doBreakPage: boolean): void {
        if (parent === null) {
            return;
        }

        let task = parent.task;
        for (let y = 1; y < parent.height - 1; y++) {
            for (let x = 1; x < parent.width - 1; x++) {
                task[y][x] = null;
            }
        }
        this.render(parent.board, task, parent);

        if (doBreakPage) {
            // this.breakPage();
        } else {
            let pageWrapper = document.getElementById("page-wrapper");
            let hr = document.createElement("hr");
            hr.classList.add("clear");
            pageWrapper?.appendChild(hr);
        }

        let order = [];
        for (let outerY = 0; outerY < this.outerHeight; outerY++) {
            for (let outerX = 0; outerX < this.outerWidth; outerX++) {
                order.push([outerX, outerY]);
            }
        }
        order = Utils.shuffle(order);

        for (let i = 0; i < order.length; i++) {
            let outerX = order[i][0];
            let outerY = order[i][1];
            let startX = 1 + outerX * this.innerWidth;
            let startY = 1 + outerY * this.innerWidth;

            this.render(parent.board, parent.task, parent, true, false, startX, startY, this.innerWidth, this.innerHeight);
        }
    }

    private static premutationsReduce(permutations: number[]): number[] {
        let valueOne = 0;
        for (let i = 0; i < permutations.length; i++) {
            if (Utils.countBits32(permutations[i]) === 1) {
                if ((valueOne & permutations[i]) !== 0) {
                    for (let j = 0; j < permutations.length; j++) {
                        permutations[j] = 0;
                    }
                    return permutations;
                }

                valueOne |= permutations[i];
            }
        }
        let notValueOne = ~ valueOne;
        for (let i = 0; i < permutations.length; i++) {
            if (Utils.countBits32(permutations[i]) !== 1) {
                permutations[i] &= notValueOne;
            }
        }

        valueOne = 0;
        let valueMultiple = 0;
        for (let i = 0; i < permutations.length; i++) {
            valueMultiple |= valueOne & permutations[i];
            valueOne |= permutations[i];
            valueOne &= ~ valueMultiple;
        }
        if (Utils.countBits32(valueOne | valueMultiple) !== permutations.length) {
            for (let j = 0; j < permutations.length; j++) {
                permutations[j] = 0;
            }
            return permutations;
        }
        for (let i = 0; i < permutations.length; i++) {
            if (Utils.countBits32(permutations[i] & valueOne) > 1) {
                for (let j = 0; j < permutations.length; j++) {
                    permutations[j] = 0;
                }
                return permutations;
            } else if ((permutations[i] & valueOne) !== 0) {
                permutations[i] &= valueOne;
            }
        }

        return permutations;
    }

    private static getPermutationTask(
        permutations: number[], parentTask: (number[] | null)[][],
        outerXtask: number, outerYtask: number, outerXboard: number, outerYboard: number
    ): (number[] | null)[][] {
        // console.log(permutations, outerXboard, outerYboard, outerXtask, outerYtask);
        // console.log(parentTask);

        let task = [];
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(null);
            }
            task.push(row);
        }
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    // @ts-ignore
                    task[y][x] = parentTask[y][x]
                }
            }
        }

        let addBoardIndex = outerYboard * this.outerWidth + outerXboard;
        for (let outerY = 0; outerY < this.outerHeight; outerY ++) {
            for (let outerX = 0; outerX < this.outerWidth; outerX ++) {
                let boardIndex = outerY * this.outerWidth + outerX;
                if (Utils.countBits32(permutations[boardIndex]) === 1) {
                    let startX = 1 + outerX * this.innerWidth;
                    let startY = 1 + outerY * this.innerHeight;
                    for (let relativeY = 0; relativeY < this.innerHeight; relativeY++) {
                        for (let relativeX = 0; relativeX < this.innerWidth; relativeX++) {
                            // @ts-ignore
                            task[startY + relativeY][startX + relativeX] = parentTask[startY + relativeY][startX + relativeX]
                        }
                    }
                } else if (boardIndex === addBoardIndex) {
                    let startXboard = 1 + outerXboard * this.innerWidth;
                    let startYboard = 1 + outerYboard * this.innerHeight;
                    let startXtask = 1 + outerXtask * this.innerWidth;
                    let startYtask = 1 + outerYtask * this.innerHeight;
                    for (let relativeY = 0; relativeY < this.innerHeight; relativeY++) {
                        for (let relativeX = 0; relativeX < this.innerWidth; relativeX++) {
                            // @ts-ignore
                            task[startYboard + relativeY][startXboard + relativeX] = parentTask[startYtask + relativeY][startXtask + relativeX]
                        }
                    }
                }
            }
        }

        return task;
    }

    private static permutationTry(permutations: number[], parent: ITapa): number[] {
        for (let outerYtask = 0; outerYtask < this.outerHeight; outerYtask++) {
            for (let outerXtask = 0; outerXtask < this.outerWidth; outerXtask++) {
                let taskIndex = outerYtask * this.outerWidth + outerXtask;
                for (let outerYboard = 0; outerYboard < this.outerHeight; outerYboard++) {
                    for (let outerXboard = 0; outerXboard < this.outerWidth; outerXboard++) {
                        let boardIndex = outerYboard * this.outerWidth + outerXboard;
                        if ((permutations[boardIndex] & 1 << taskIndex) !== 0) {
                            let task = this.getPermutationTask(permutations, parent.task, outerXtask, outerYtask, outerXboard, outerYboard);

                            let solution = TapaSolver.solve(parent.board, task, parent);

                            let solutionCount = TapaSolver.countSolutions(solution, task, parent);
                            if (solutionCount === 0) {
                                // @ts-ignore
                                permutations[boardIndex] &= ~ (1 << taskIndex);
                            }

                            // this.render(solution, task, parent, true, true);
                        }
                    }
                }
            }
        }

        let task = this.getPermutationTask(permutations, parent.task, -1, -1, -1, -1);
        let solution = TapaSolver.solve(parent.board, task, parent);
        if (this.doLog) {
            this.render(solution, task, parent, true, true);
        }

        permutations = this.premutationsReduce(permutations);
        // this.printPermutations(permutations, ">");

        return permutations;
    }

    private static countPermutationValues(permutations: number[]): number {
        let total = 0;
        for (let i = 0; i < permutations.length; i++) {
            total += Utils.countBits32(permutations[i]);
        }

        return total;
    }

    private static permutationTryAll(permutations: number[], parent: ITapa): number {
        let previousPermutationValues = null;
        let permutationsValues = this.countPermutationValues(permutations);

        while (permutationsValues !== previousPermutationValues) {
            permutations = this.permutationTry(permutations, parent);

            previousPermutationValues = permutationsValues;
            permutationsValues = this.countPermutationValues(permutations);

            this.printPermutations(permutations, ">>> --- >>>");
        }

        for (let i = 0; i < permutations.length; i++) {
            if (Utils.countBits32(permutations[i]) === 0) {
                return 0;
            } else if (Utils.countBits32(permutations[i]) > 1) {
                return 2;
            }
        }

        return 1;
    }

    public static build(outerWidth: number, outerHeight: number, innerWidth: number, innerHeight: number): ITapa | null {
        this.outerWidth = outerWidth;
        this.outerHeight = outerHeight;
        this.innerWidth = innerWidth;
        this.innerHeight = innerHeight;
        this.width = 2 + this.outerWidth * this.innerWidth;
        this.height = 2 + this.outerHeight * this.innerHeight;

        let then = (new Date).getTime();

        CoralGenerator.typeTapa();

        let solutionCount = 2;
        let tapa = null;

        while (solutionCount !== 1) {
            tapa = TapaBuilder.build(this.width, this.height);
            if (tapa === null) {
                return null;
            }

            if (this.doLog) {
                this.render(tapa.board, tapa.task, tapa, true, true);
            }

            let permutations = [];
            for (let i = 0; i < this.outerWidth * this.outerHeight; i++) {
                permutations.push((1 << this.outerWidth * this.outerHeight) - 1);
            }

            solutionCount = this.permutationTryAll(permutations, tapa);

            console.log(solutionCount);
        }

        // @ts-ignore
        if (solutionCount === 0) {
            "TapaPuzzle->build - SOLUTION_COUNT === 0";
        }

        let now = (new Date).getTime();
        console.log("Tapa puzzle " + (now - then) +  "ms");

        return tapa;
    }

    public static main(): void {
        // this.doLog = true;
        for (let i = 0; i < 6; i++) {
            let tapa = this.build(2, 2, 3, 3);
            this.bigRender(tapa, true);
            this.breakLine();
        }
        this.breakPage();
        for (let i = 0; i < 3; i++) {
            let tapa = this.build(3, 3, 5, 5);
            this.bigRender(tapa, true);
            this.breakLine();
        }

    }
}