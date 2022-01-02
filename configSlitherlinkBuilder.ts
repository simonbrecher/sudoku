class ConfigSlitherlinkBuilder {
    public static breakPage(): void {
        let pageWrapper = document.getElementById("page-wrapper");
        let hr = document.createElement("hr");
        pageWrapper?.appendChild(hr);
        let pageBreak = document.createElement("div");
        pageBreak.classList.add("page-break-configslitherlink");
        pageWrapper?.appendChild(pageBreak);
    }

    private static arePositionsConnected(positions: number[][]): boolean {
        let already = [];
        for (let i = 0; i < positions.length; i++) {
            already.push(false);
        }

        let deck = [0];
        while (deck.length > 0) {
            let positionId = deck.pop();
            // @ts-ignore
            already[positionId] = true;
            // @ts-ignore
            let x = positions[positionId][0];
            // @ts-ignore
            let y = positions[positionId][1];
            for (let newPositionId = 0; newPositionId < positions.length; newPositionId++) {
                let newX = positions[newPositionId][0];
                let newY = positions[newPositionId][1];
                if (Math.abs(newX - x) <= 1 && Math.abs(newY - y) <= 1 && ! already[newPositionId]) {
                    deck.push(newPositionId);
                }
            }
        }

        for (let i = 0; i < already.length; i++) {
            if (already[i] === false) {
                return false;
            }
        }

        return true;
    }

    private static sortPositions(positions: number[][]): void {
        for (let length = 1; length < positions.length; length *= 2) {
            for (let start = 0; start < positions.length - length; start += length * 2) {
                let secondLength = Math.min(length, positions.length - start - length);

                let newArray = [];
                let first = 0;
                let second = 0;
                while (first < length && second < secondLength) {
                    let value1 = positions[start + first];
                    let value2 = positions[start + length + second];
                    if (value1[1] < value2[1] || (value1[1] === value2[1] && value1[0] <= value2[0])) {
                        newArray.push(value1);
                        first ++;
                    } else {
                        newArray.push(value2);
                        second ++;
                    }
                }
                while (first < length) {
                    newArray.push(positions[start + first]);
                    first ++;
                }
                while (second < secondLength) {
                    newArray.push(positions[start + length + second]);
                    second ++;
                }

                for (let i = 0; i < newArray.length; i++) {
                    positions[start + i] = newArray[i];
                }
            }
        }
    }

    private static rotateCenter(positions: number[][]): number[][] {
        let height = 0;
        for (let i = 0; i < positions.length; i++) {
            if (positions[i][1] >= height) {
                height = positions[i][1] + 1;
            }
        }

        let rotated = [];
        for (let i = 0; i < positions.length; i++) {
            rotated.push([height - positions[i][1] - 1, positions[i][0]]);
            if (positions[i].length === 3) {
                rotated[rotated.length - 1].push(positions[i][2]);
            }
        }

        this.sortPositions(rotated);

        return rotated;
    }

    private static rotateAxis(positions: number[][]): number[][] {
        let width = 0;
        for (let i = 0; i < positions.length; i++) {
            if (positions[i][0] >= width) {
                width = positions[i][0] + 1;
            }
        }

        let rotated = [];
        for (let i = 0; i < positions.length; i++) {
            rotated.push([width - positions[i][0] - 1, positions[i][1]]);
            if (positions[i].length === 3) {
                rotated[rotated.length - 1].push(positions[i][2]);
            }
        }

        this.sortPositions(rotated);

        return rotated;
    }

    private static rotateDiagonal(positions: number[][]): number[][] {
        let rotated = [];
        for (let i = 0; i < positions.length; i++) {
            rotated.push([positions[i][1], positions[i][0]]);
            if (positions[i].length === 3) {
                rotated[rotated.length - 1].push(positions[i][2]);
            }
        }

        this.sortPositions(rotated);

        return rotated;
    }

    private static getAllRotations(positions: number[][], topBorder: boolean, leftBorder: boolean): number[][][] {
        let rotations = [];

        if (topBorder && leftBorder) {
            rotations.push(positions);
            rotations.push(this.rotateDiagonal(positions));

        } else if (topBorder) {
            rotations.push(positions);
            rotations.push(this.rotateAxis(positions));

        } else {
            let last = positions;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 4; j++) {
                    rotations.push(last);
                    last = this.rotateCenter(last);
                }
                last = this.rotateDiagonal(last);
            }
        }

        return rotations;
    }

    private static hashPosition(positions: number[][]): number {
        let hash = 0;

        for (let i = 0; i < positions.length; i++) {
            let index = positions[i][1] * positions.length + positions[i][0];
            hash |= 1 << index;
        }

        return hash;
    }

    private static isPositionSymmetryOk(positions: number[][], topBorder: boolean, leftBorder: boolean): boolean {
        let rotations = this.getAllRotations(positions, topBorder, leftBorder);

        for (let i = 0; i < rotations.length; i++) {
            if (this.hashPosition(rotations[i]) < this.hashPosition(positions)) {
                return false;
            }
        }

        return true;
    }

    private static getPositions(
        amount: number, topBorder: boolean, leftBorder: boolean,
        depth: number = 0, start: number = 0, alreadyAdd: number[][] = [], already: number[][][] = []
    ): number[][][] {
        if (depth === amount) {
            let hasZeroX = false;
            let hasZeroY = false;
            for (let i = 0; i < alreadyAdd.length; i++) {
                if (alreadyAdd[i][0] === 0) {
                    hasZeroX = true;
                }
                if (alreadyAdd[i][1] === 0) {
                    hasZeroY = true;
                }
            }

            if (hasZeroX && hasZeroY) {
                if (this.arePositionsConnected(alreadyAdd)) {
                    if (this.isPositionSymmetryOk(alreadyAdd, topBorder, leftBorder)) {
                        already.push(Utils.deepcopyArray2d(alreadyAdd));
                    }
                }
            }
        }

        for (let add = start; add < amount * amount; add++) {
            if (add - start <= amount + 1) {
                let addX = add % amount;
                let addY = Math.floor(add / amount);

                alreadyAdd.push([addX, addY]);

                already = this.getPositions(amount, topBorder, leftBorder, depth + 1, add + 1, alreadyAdd, already);

                alreadyAdd.pop();
            }
        }

        return already;
    }

    private static getAllPositions(amount: number): [ boolean[], number[][][] ][] {
        let positions = [];

        for (let topBorderIndex = 0; topBorderIndex <= 1; topBorderIndex ++) {
            let topBorder = topBorderIndex === 0;
            for (let leftBorderIndex = topBorderIndex; leftBorderIndex <= 1; leftBorderIndex++) {
                let leftBorder = leftBorderIndex === 0;

                // @ts-ignore
                let positionsAdd = this.getPositions(amount, topBorder, leftBorder);
                positions.push([[topBorder, leftBorder], positionsAdd])
            }
        }

        // @ts-ignore
        return positions;
    }

    private static getAllNumberValues(amount: number, depth: number = 0, alreadyAdd: number[] = [], already: number[][] = []): number[][] {
        if (depth === amount) {
            already.push(Utils.deepcopy(alreadyAdd));

            return already;
        }

        for (let add = 1; add <= 3; add++) {
            alreadyAdd.push(add);

            already = this.getAllNumberValues(amount, depth + 1, alreadyAdd, already);

            alreadyAdd.pop();
        }

        return already;
    }

    private static positionToNumberPosition(positions: number[][], numberValues: number[]): number[][] {
        let numberPosition = [];
        for (let i = 0; i < positions.length; i++) {
            numberPosition.push([positions[i][0], positions[i][1], numberValues[i]]);
        }

        return numberPosition;
    }

    private static isNumberPositionsSymmetryOk(numberPositions: number[][], topBorder: boolean, leftBorder: boolean) {
        let rotations = this.getAllRotations(numberPositions, topBorder, leftBorder);

        for (let i = 0; i < rotations.length; i++) {
            let rotation = rotations[i];

            if (this.hashPosition(rotation) === this.hashPosition(numberPositions)) {
                for (let j = 0; j < numberPositions.length; j++) {
                    if (numberPositions[j][2] < rotation[j][2]) {
                        break;
                    } else if (numberPositions[j][2] > rotation[j][2]) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private static getNumberPositions(amount: number, positions: number[][][], topBorder: boolean, leftBorder: boolean): number[][][] {
        let allNumberValues = this.getAllNumberValues(amount);

        let numberPositions = [];

        for (let i = 0; i < positions.length; i++) {
            for (let j = 0; j < allNumberValues.length; j++) {
                let numberPositionsAdd = this.positionToNumberPosition(positions[i], allNumberValues[j]);
                if (this.isNumberPositionsSymmetryOk(numberPositionsAdd, topBorder, leftBorder)) {
                    numberPositions.push(numberPositionsAdd);
                }
            }
        }

        return numberPositions;
    }

    private static getAllNumberPositions(amount: number): [ boolean[], number[][][] ][] {
        let numberPositions = [];

        for (let topBorderIndex = 0; topBorderIndex <= 1; topBorderIndex ++) {
            let topBorder = topBorderIndex === 0;
            for (let leftBorderIndex = topBorderIndex; leftBorderIndex <= 1; leftBorderIndex++) {

                // if (topBorderIndex === 0 || leftBorderIndex === 0) {
                //     continue;
                // }

                let leftBorder = leftBorderIndex === 0;

                // @ts-ignore
                let positions = this.getPositions(amount, topBorder, leftBorder);

                // @ts-ignore
                let numberPositionsAdd = this.getNumberPositions(amount, positions, topBorder, leftBorder);
                numberPositions.push([[topBorder, leftBorder], numberPositionsAdd])
            }
        }

        // @ts-ignore
        return numberPositions;
    }

    private static viewAllPositions(amount: number): void {
        let allPositions = this.getAllPositions(amount);

        let total = 0;

        for (let i = 0; i < allPositions.length; i++) {
            let border = allPositions[i][0];
            let positions = allPositions[i][1];

            for (let j = 0; j < positions.length; j++) {

                total ++;

                let configSlitherlink = new ConfigSlitherlink(border[0], border[1], positions[j]);
                configSlitherlink.render(false);
            }
            this.breakPage();
        }

        console.log("VIEWED", total);
    }

    private static viewAllNumberPositions(amount: number): void {
        let allNumberPositions = this.getAllNumberPositions(amount);

        let total = 0;

        for (let i = 0; i < allNumberPositions.length; i++) {
            let border = allNumberPositions[i][0];
            let numberPositions = allNumberPositions[i][1];

            for (let j = 0; j < numberPositions.length; j++) {

                total ++;

                let configSlitherlink = new ConfigSlitherlink(border[0], border[1], numberPositions[j]);
                configSlitherlink.render(false);
            }
            this.breakPage();
        }

        console.log("VIEWED", total);
    }

    private static areLinesNotEmpty(parent: IConfigSlitherlink): boolean {
        let lines = parent.getLines();
        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines[i].length; j++) {
                for (let k = 0; k < lines[i][j].length; k++) {
                    if (lines[i][j][k] === 1 || lines[i][j][k] === 2) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private static updateLines(commonLines: number[][][], linesAdd: number[][][], topPadding: boolean, leftPadding: boolean): number[][][] {
        for (let i = 0; i < commonLines.length; i++) {
            for (let j = 0; j < commonLines[i].length; j++) {
                for (let k = 0; k < commonLines[i][j].length; k++) {
                    let x = k + (leftPadding ? 1 : 0);
                    let y = j + (topPadding ? 1 : 0);
                    if (y < linesAdd[i].length) {
                        if (x < linesAdd[i][y].length) {
                            commonLines[i][j][k] &= linesAdd[i][y][x];
                        }
                    }
                }
            }
        }

        return commonLines;
    }

    private static doLinesEqual(lines1: number[][][], lines2: number[][][]): boolean {
        for (let i = 0; i < lines1.length; i++) {
            for (let j = 0; j < lines1[i].length; j++) {
                for (let k = 0; k < lines1[i][j].length; k++) {
                    if (lines1[i][j][k] !== lines2[i][j][k]) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private static isNeeded(parent: IConfigSlitherlink, numberPositions: number[][]): boolean {
        let commonLines = ConfigSlitherlinkSolver.getEmptyLines(parent, 3);

        let leftBorder = false;
        for (let topBorderIndex = 0; topBorderIndex <= 1; topBorderIndex++) {
            let topBorder = topBorderIndex === 0;
            if (parent.leftBorder && ! leftBorder || parent.topBorder && ! topBorder) {
                let configSlitherlink: IConfigSlitherlink = new ConfigSlitherlink(topBorder, leftBorder, numberPositions);
                configSlitherlink = ConfigSlitherlinkSolver.solve(configSlitherlink);
                let topPadding = parent.topBorder && ! topBorder;
                let leftPadding = parent.leftBorder && ! leftBorder;
                commonLines = this.updateLines(commonLines, configSlitherlink.getLines(), topPadding, leftPadding);

                // configSlitherlink.render(false);
            }
        }

        for (let i = 0; i < numberPositions.length; i++) {
            let newNumberPositions = [];
            for (let j = 0; j < numberPositions.length; j++) {
                if (j !== i) {
                    newNumberPositions.push(numberPositions[j]);
                }
            }

            let configSlitherlink: IConfigSlitherlink = new ConfigSlitherlink(parent.topBorder, parent.leftBorder, newNumberPositions);
            configSlitherlink = ConfigSlitherlinkSolver.solve(configSlitherlink);
            commonLines = this.updateLines(commonLines, configSlitherlink.getLines(), false, false);
        }

        // this.breakPage();

        // let slitherlink = parent.copy();
        // slitherlink.setAllLines(commonLines);
        // slitherlink.render(false);

        let lines = parent.getLines();

        return ! this.doLinesEqual(commonLines, lines);
    }

    private static viewAllSolved(amount: number) {
        let allNumberPositions = this.getAllNumberPositions(amount);

        let then = (new Date()).getTime();

        let total = 0;
        let viewedTotal = 0;

        for (let i = 0; i < allNumberPositions.length; i++) {
            let border = allNumberPositions[i][0];
            let numberPositions = allNumberPositions[i][1];

            let viewed = 0;

            for (let j = 0; j < numberPositions.length; j++) {
                // console.log(total);

                total ++;

                let configSlitherlink: IConfigSlitherlink = new ConfigSlitherlink(border[0], border[1], numberPositions[j]);
                configSlitherlink = ConfigSlitherlinkSolver.solve(configSlitherlink);
                if (this.areLinesNotEmpty(configSlitherlink)) {
                    if (this.isNeeded(configSlitherlink, numberPositions[j])) {
                        viewed ++;
                        viewedTotal ++;
                        configSlitherlink.render(false);
                    }
                }
            }
            if (viewed !== 0) {
                this.breakPage();
            }
        }
        this.breakPage();

        let now = (new Date()).getTime();

        let time = (now - then) < 10000 ? `${now - then}ms` : `${Math.floor((now - then) / 1000)}s`;

        console.log(`TOTAL ${total} VIEWED ${viewedTotal} TIME ${time}`);
    }

    public static main(): void {
        CoralGenerator.typeSlitherlink();

        // this.viewAllPositions(3);
        // this.viewAllPositions(4);
        // this.viewAllPositions(5);

        // this.viewAllNumberPositions(3);
        // this.viewAllNumberPositions(4);

        this.viewAllSolved(1);
        this.viewAllSolved(2);
        this.viewAllSolved(3);
        this.viewAllSolved(4);

        // let then = (new Date()).getTime();
        // let positions = [[0, 0, 2], [1, 1, 3], [2, 2, 3], [3, 3, 2]];
        // // let positions = [[0, 0, 2]];
        // let configSlitherlink: IConfigSlitherlink = new ConfigSlitherlink(true, true, positions);
        // configSlitherlink =  ConfigSlitherlinkSolver.solve(configSlitherlink);
        // console.log(this.isNeeded(configSlitherlink, positions));
        // configSlitherlink.render(false);
        // let now = (new Date()).getTime();
        // console.log(now - then + "ms");
    }
}