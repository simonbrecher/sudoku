class ConfigSlitherlinkSolver {
    public static doLog = false;

    public static recursions = 0;

    private static getTwoFromNeighbour(possible: boolean[], first: number, second: number): boolean[] {
        let possibleTwo = [];
        for (let i = 0; i < 4; i++) {
            possibleTwo.push(false);
        }

        for (let i = 0; i < 16; i++) {
            if (possible[i]) {
                let index = (i & 1 << first) << 1 >>> first | (i & 1 << second) >>> second;
                possibleTwo[index] = true;
            }
        }

        return possibleTwo;
    }

    private static solveSquareOrCrosses(x: number, y: number, parent: IConfigSlitherlink, isSquares: boolean): void {
        let width = parent.width;
        let height = parent.height;
        if (isSquares) {
            width ++;
            height ++;
        }
        let neighbourArray = isSquares ? parent.crosses : parent.squares;

        let possible = isSquares ? parent.squares[y][x] : parent.crosses[y][x];
        let possibleNeighbours = [];
        for (let i = 0; i < 4; i++) {
            let realX = x + ((i ^ i >>> 1) & 1);
            let realY = y + (i >>> 1 & 1);
            if (! isSquares) {
                realX --;
                realY --;
            }
            let possibleAdd;
            if (realX >= 0 && realX < width && realY >= 0 && realY < height) {
                possibleAdd = this.getTwoFromNeighbour(neighbourArray[realY][realX], (i + 2) % 4, (i + 1) % 4);
            } else {
                possibleAdd = [];
                for (let i = 0; i < 4; i++) {
                    possibleAdd.push(true);
                }
            }
            possibleNeighbours.push(possibleAdd);
        }

        for (let i = 0; i < 16; i++) {
            if (possible[i]) {
                for (let j = 0; j < 4; j++) {
                    let first = (j - 1 + 4) % 4;
                    let second = j;
                    let squareTwo = (i & 1 << first) << 1 >>> first | (i & 1 << second) >> second;
                    if (! possibleNeighbours[j][squareTwo]) {
                        possible[i] = false;
                    }
                }
            }
        }
    }

    private static solveAll(parent: IConfigSlitherlink): void {
        for (let y = 0; y < parent.height + 1; y++) {
            for (let x = 0; x < parent.width + 1; x++) {
                if (x !== parent.width && y !== parent.height) {
                    this.solveSquareOrCrosses(x, y, parent, true);
                }

                this.solveSquareOrCrosses(x, y, parent, false);
            }
        }
    }

    private static solveOne(parent: IConfigSlitherlink): void {
        let previousMissingCount = null;
        let missingCount = parent.countAllPossible();
        while (missingCount !== previousMissingCount) {
            this.solveAll(parent);

            if (this.doLog) {
                parent.render(false);
                parent.renderCount();
            }

            previousMissingCount = missingCount;
            missingCount = parent.countAllPossible();
        }
    }

    private static findSquareToSplit(parent: IConfigSlitherlink): number[] {
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (parent.task[y][x] !== null) {
                    if (parent.countPossible(parent.squares[y][x]) > 1) {
                        return [x, y];
                    }
                }
            }
        }
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (parent.countPossible(parent.squares[y][x]) > 1) {
                    return [x, y];
                }
            }
        }

        throw "ConfigSlitherlinkSolver->findSquareToSplit - NO SQUARE WITH MULTIPLE POSSIBLE STATES";
    }

    public static getEmptyLines(parent: IConfigSlitherlink, value: number): number[][][] {
        let lines = [[], []];
        for (let y = 0; y < parent.height + 1; y++) {
            let row = [];
            for (let x = 0; x < parent.width; x++) {
                row.push(value);
            }
            // @ts-ignore
            lines[0].push(row);
        }
        for (let y = 0; y < parent.height; y++) {
            let row = [];
            for (let x = 0; x < parent.width + 1; x++) {
                row.push(value);
            }
            // @ts-ignore
            lines[1].push(row);
        }

        return lines;
    }

    private static updateLines(lines: number[][][], linesAdd: number[][][]): number[][][] {
        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i].length; j++) {
                for (let k = 0; k < lines[i][j].length; k++) {
                    lines[i][j][k] |= linesAdd[i][j][k];
                }
            }
        }

        return lines;
    }

    private static splitSolve(parent: IConfigSlitherlink, depth: number = 0): IConfigSlitherlink | null {

        if (this.doLog) {
            if (depth === 0) {
                ConfigSlitherlinkBuilder.breakPage();
                ConfigSlitherlinkBuilder.breakPage();
                parent.render(false);
                parent.renderCount();
            }
        }

        this.solveOne(parent);

        this.recursions ++;

        if (this.doLog) {
            let pageWrapper = document.getElementById("page-wrapper");
            let div = document.createElement("div");
            div.textContent += depth.toString();
            pageWrapper?.appendChild(div);
        }

        let solutionCount = parent.countSolutions();

        // if (solutionCount === 1) {
        //     ConfigSlitherlinkBuilder.breakPage();
        //     parent.render(false);
        //     console.log(solutionCount, parent.hasNoLoop());
        //     throw "END";
        // }

        if (! parent.hasNoLoop()) {
            return null;
        }

        if (solutionCount === 0) {
            return null;
        } else if (solutionCount === 1) {
            return parent;
        } else {
            let splitSquare = this.findSquareToSplit(parent);

            for (let i = 0; i < 16; i++) {
                let value = i;
                if (parent.squares[splitSquare[1]][splitSquare[0]][value]) {

                    if (this.doLog) {
                        ConfigSlitherlinkBuilder.breakPage();
                    }

                    let parent2 = parent.copy();
                    for (let j = 0; j < 16; j++) {
                        if (j !== value) {
                            parent2.squares[splitSquare[1]][splitSquare[0]][j] = false;
                        }
                    }

                    let output = this.splitSolve(parent2, depth + 1);

                    if (output !== null) {
                        return output;
                    }
                }
            }

            return null;
        }
    }

    public static solve(parent: IConfigSlitherlink): IConfigSlitherlink {

        // this.doLog = true;

        this.recursions = 0;

        let minLines = this.getEmptyLines(parent, 0);
        let maxLines = this.getEmptyLines(parent, 3);

        for (let dir = 0; dir < 2; dir++) {
            for (let y = 0; y < minLines[dir].length; y++) {
                for (let x = 0; x < minLines[dir][y].length; x++) {
                        for (let value = 1; value <= 2; value++) {

                        if ((minLines[dir][y][x] & value) === 0) {
                            parent.setAllLines(maxLines);

                            // @ts-ignore
                            parent.setLine(dir, x, y, value);

                            // parent.render(false);

                            let solved = this.splitSolve(parent);

                            if (solved !== null) {
                                minLines = this.updateLines(minLines, solved.getLines());
                            } else {
                                maxLines[dir][y][x] &= ~ value;
                            }
                        }
                    }
                }
            }
        }

        // throw "END";

        if (this.recursions > 10000) {
            console.log(`RECURSIONS ${this.recursions}`);

            parent.setAllLines(minLines);
            parent.render(false);
        }

        // console.log(lines);

        // ConfigSlitherlinkBuilder.breakPage();

        parent.setAllLines(minLines);

        // parent.render(false);

        return parent;
    }
}