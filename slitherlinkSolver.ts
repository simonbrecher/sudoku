class SlitherlinkSolver {
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

    private static solveSquareOrCrosses(x: number, y: number, parent: ISlitherlink, isSquares: boolean): void {
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

    private static solveAll(parent: ISlitherlink): void {
        for (let y = 0; y < parent.height + 1; y++) {
            for (let x = 0; x < parent.width + 1; x++) {
                if (x !== parent.width && y !== parent.height) {
                    this.solveSquareOrCrosses(x, y, parent, true);
                }

                this.solveSquareOrCrosses(x, y, parent, false);
            }
        }
    }

    public static solve(parent: ISlitherlink): void {
        let previousMissingCount = null;
        let missingCount = parent.countAllPossible();
        while (missingCount !== previousMissingCount) {
            this.solveAll(parent);
            // parent.renderCount();
            // parent.render(true);

            previousMissingCount = missingCount;
            missingCount = parent.countAllPossible();
        }
    }

    public static main(): void {
        let then = (new Date()).getTime();

        CoralGenerator.typeSlitherlink();

        let width = 10;
        let height = 10;

        let coral = CoralGenerator.build(width, height);

        if (coral !== null) {
            let slitherlink = new Slitherlink(width, height, coral);
            slitherlink.removeNumbers(0.3);
            // slitherlink.render(false);

            this.solve(slitherlink);

            TapaBuilder.breakPage();
            slitherlink.render(true);
            slitherlink.renderCount();
        }

        let now = (new Date()).getTime();
        console.log((now - then) + "ms");
    }
}