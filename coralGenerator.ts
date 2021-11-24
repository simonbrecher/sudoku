class CoralGenerator {
    private static WIDTH: number;
    private static HEIGHT: number;

    public static START_CHANCE_FULL: number;
    public static CHANCE_FILL_ORTHOGONAL: number;
    public static CHANCE_FILL_ORTHOGONAL_RANDOM: number;
    public static CHANCE_REMOVE_SQUARE: number;
    public static RULE_ORTHOGONAL: boolean;
    public static RULE_SPACE_ORTHOGONAL: boolean;
    public static RULE_SQUARE: boolean;
    public static RULE_CYCLE: boolean;

    public static doLog = false;

    // for coral (fast up to 15x15)
    public static typeCoral(): void {
        this.START_CHANCE_FULL = 0.5;
        this.CHANCE_FILL_ORTHOGONAL = 0.7;
        this.CHANCE_FILL_ORTHOGONAL_RANDOM = 0.01;
        this.CHANCE_REMOVE_SQUARE = 1;
        this.RULE_ORTHOGONAL = true;
        this.RULE_SPACE_ORTHOGONAL = true;
        this.RULE_SQUARE = true;
        this.RULE_CYCLE = true;
    }

    // for tapa (fast up to 50x50)
    public static typeTapa(): void {
        this.START_CHANCE_FULL = 0.3;
        this.CHANCE_FILL_ORTHOGONAL = 0.7;
        this.CHANCE_FILL_ORTHOGONAL_RANDOM = 0.01;
        this.CHANCE_REMOVE_SQUARE = 1;
        this.RULE_ORTHOGONAL = true;
        this.RULE_SPACE_ORTHOGONAL = false;
        this.RULE_SQUARE = true;
        this.RULE_CYCLE = true;
    }

    // for slitherlink (fast up to 20x20)
    public static typeSlitherlink(): void {
        this.START_CHANCE_FULL = 0.5;
        this.CHANCE_FILL_ORTHOGONAL = 0.7;
        this.CHANCE_FILL_ORTHOGONAL_RANDOM = 0.005;
        // this.CHANCE_REMOVE_SQUARE = 1;
        this.RULE_ORTHOGONAL = true;
        this.RULE_SPACE_ORTHOGONAL = true;
        this.RULE_SQUARE = false;
        this.RULE_CYCLE = false;
    }

    private static MAX_CHANGE_TRIES = 2000;
    private static MAX_NEW_TRIES = 20;

    public static render(coral: number[][] | null): void {
        if (coral === null) {
            console.log("render null");
            return;
        }

        let pageWrapper = document.getElementById("page-wrapper");

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("coral-structure-table");

        for (let y = 0; y < this.HEIGHT; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < this.WIDTH; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                if (coral[y][x] === 1) {
                    // squareDiv.textContent = "-";
                } else if (coral[y][x] === 2) {
                    squareDiv.classList.add("black");
                    // squareDiv.textContent = "X";
                } else if (coral[y][x] === 3) {
                    squareDiv.textContent = "?";
                } else {
                    squareDiv.textContent = "!";
                }
            }
        }
    }

    private static createRandomCoral(): number[][] {
        let coral = [];
        for (let y = 0; y < this.HEIGHT; y++) {
            let row = [];
            for (let x = 0; x < this.WIDTH; x++) {
                row.push((Math.random() < this.START_CHANCE_FULL) ? 2 : 1);
            }
            coral.push(row);
        }

        return coral;
    }

    private static getOrthogonal(coral: number[][], isSpaceFilled: boolean = false): number[][] {
        let coralConst = isSpaceFilled ? 1 : 2;

        let orthogonal = [];
        for (let y = 0; y < this.HEIGHT; y++) {
            let row = [];
            for (let x = 0; x < this.WIDTH; x++) {
                row.push(-1);
            }
            orthogonal.push(row);
        }

        let orthogonalPartId = 0;
        for (let startY = 0; startY < this.HEIGHT; startY++) {
            for (let startX = 0; startX < this.WIDTH; startX++) {
                if (orthogonal[startY][startX] === -1 && coral[startY][startX] === coralConst) {
                    let deck = [[startX, startY]];
                    while (deck.length > 0) {
                        let x, y;
                        // @ts-ignore
                        [x, y] = deck.pop();
                        if (orthogonal[y][x] === -1 && coral[y][x] === coralConst) {
                            orthogonal[y][x] = orthogonalPartId;
                            for (let dir = 0; dir < 4; dir++) {
                                let dirX, dirY;
                                [dirX, dirY] = [[-1, 0], [0, -1], [1, 0], [0, 1]][dir];
                                let newX = x + dirX;
                                let newY = y + dirY;
                                if (newX >= 0 && newX < this.WIDTH && newY >= 0 && newY < this.HEIGHT) {
                                    deck.push([newX, newY]);
                                }
                            }
                        }
                    }
                    orthogonalPartId ++;
                }
            }
        }

        return orthogonal;
    }

    private static getOrthogonalOnSides(orthogonal: number[][]): number[][] {
        let orthogonalNumber = this.countOrthogonal(orthogonal);

        let isAnyOnSide = false;
        let isOnSide = [];
        for (let i = 0; i < orthogonalNumber; i++) {
            isOnSide.push(false);
        }

        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                if (x === 0 || y === 0 || x === this.WIDTH - 1 || y === this.HEIGHT - 1) {
                    if (orthogonal[y][x] !== -1) {
                        isOnSide[orthogonal[y][x]] = true;
                        isAnyOnSide = true;
                    }
                }
            }
        }

        if (! isAnyOnSide) {
            return orthogonal;
        }

        let number = [];
        let index = 1;
        for (let i = 0; i < orthogonalNumber; i++) {
            if (isOnSide[i]) {
                number.push(0);
            } else {
                number.push(index);
                index ++;
            }
        }

        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                if (orthogonal[y][x] !== -1) {
                    orthogonal[y][x] = number[orthogonal[y][x]];
                }
            }
        }

        return orthogonal;
    }

    private static countOrthogonal(orthogonal: number[][]): number {
        let max = -1;
        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                max = Math.max(max, orthogonal[y][x]);
            }
        }

        return max + 1;
    }

    private static repairOrthogonality(coral: number[][], isSpaceFilled: boolean = false): number[][] {
        let coralConst = isSpaceFilled ? 1 : 2;
        let spaceConst = isSpaceFilled ? 2 : 1;

        let orthogonal = this.getOrthogonal(coral, isSpaceFilled);
        if (isSpaceFilled) {
            orthogonal = this.getOrthogonalOnSides(orthogonal);
        }
        let countOrthogonal = this.countOrthogonal(orthogonal);

        let alreadyRepaired = [];
        for (let i = 0; i < countOrthogonal; i++) {
            alreadyRepaired.push(false);
        }

        for (let startY = 0; startY < this.HEIGHT; startY++) {
            for (let startX = 0; startX < this.WIDTH; startX++) {
                if (coral[startY][startX] === spaceConst) {
                    let nextTo = new Set();
                    let nextToNew = new Set();
                    for (let dir = 0; dir < 4; dir++) {
                        let dirX, dirY;
                        [dirX, dirY] = [[-1, 0], [0, -1], [1, 0], [0, 1]][dir];
                        let x = startX + dirX;
                        let y = startY + dirY;
                        if (x >= 0 && x < this.WIDTH && y >= 0 && y < this.HEIGHT) {
                            if (coral[y][x] === coralConst && orthogonal[y][x] !== -1) {
                                nextTo.add(orthogonal[y][x]);
                                if (! alreadyRepaired[orthogonal[y][x]]) {
                                    nextToNew.add(orthogonal[y][x]);
                                }
                            }
                        }
                    }

                    if (nextTo.size >= 2 && nextToNew.size >= 1 && Math.random() <= this.CHANCE_FILL_ORTHOGONAL || Math.random() <= this.CHANCE_FILL_ORTHOGONAL_RANDOM) {
                        coral[startY][startX] = coralConst;
                        // @ts-ignore
                        nextToNew = Array.from(nextToNew);
                        // @ts-ignore
                        for (let i = 0; i < nextToNew.length; i++) {
                            // @ts-ignore
                            alreadyRepaired[nextToNew[i]] = true;
                        }
                    }
                }
            }
        }

        return coral;
    }

    private static repairSquare(coral: number[][]): number[][] {
        for (let y = 0; y < this.HEIGHT - 1; y++) {
            for (let x = 0; x < this.WIDTH - 1; x++) {
                if (coral[y][x] === 2 && coral[y][x + 1] === 2 && coral[y + 1][x] === 2 && coral[y + 1][x + 1] === 2 && Math.random() < this.CHANCE_REMOVE_SQUARE) {
                    let relativeX = Math.floor(Math.random() * 2);
                    let relativeY = Math.floor(Math.random() * 2);
                    coral[y + relativeY][x + relativeX] = 1;
                }
            }
        }

        return coral;
    }

    private static repairCycle(coral: number[][]): number[][] {
        let already = [];
        for (let y = 0; y < this.HEIGHT; y++) {
            let row = [];
            for (let x = 0; x < this.WIDTH; x++) {
                row.push(false);
            }
            already.push(row);
        }

        for (let startY = 0; startY < this.HEIGHT; startY++) {
            for (let startX = 0; startX < this.WIDTH; startX++) {
                if (! already[startY][startX] && coral[startY][startX] === 2) {
                    let deck = [[startX, startY, -1, -1]];
                    while (deck.length > 0) {
                        let x, y, prevX, prevY;
                        // @ts-ignore
                        [x, y, prevX, prevY] = deck.pop();
                        if (coral[y][x] === 2) {
                            if (already[y][x]) {
                                if (prevX !== -1 && prevY !== -1) {
                                    coral[prevY][prevX] = 1;
                                }
                            } else {
                                already[y][x] = true;
                                for (let dir = 0; dir < 4; dir++) {
                                    let dirX, dirY;
                                    [dirX, dirY] = [[-1, 0], [0, -1], [1, 0], [0, 1]][dir];
                                    let newX = x + dirX;
                                    let newY = y + dirY;
                                    if (newX >= 0 && newX < this.WIDTH && newY >= 0 && newY < this.HEIGHT) {
                                        if (coral[newY][newX] === 2) {
                                            if (newX !== prevX || newY !== prevY) {
                                                deck.push([newX, newY, x, y]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return coral;
    }

    private static checkCycle(coral: number[][]): boolean {
        let secondCoral = this.repairCycle(Utils.deepcopyArray2d(coral));

        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                if (coral[y][x] !== secondCoral[y][x]) {
                    return false;
                }
            }
        }

        return true;
    }

    private static repairAll(coral: number[][]): number[][] {
        if (this.RULE_ORTHOGONAL) {
            coral = this.repairOrthogonality(coral);
        }

        if (this.RULE_SPACE_ORTHOGONAL) {
            coral = this.repairOrthogonality(coral, true);
        }

        if (this.RULE_SQUARE) {
            coral = this.repairSquare(coral);
        }

        if (this.RULE_CYCLE) {
            coral = this.repairCycle(coral);
        }

        return coral;
    }

    public static checkCoral(coral: number[][]): boolean {
        if (this.RULE_ORTHOGONAL) {
            if (this.countOrthogonal(this.getOrthogonal(coral)) !== 1) {
                return false;
            }
        }

        if (this.RULE_SPACE_ORTHOGONAL) {
            if (this.countOrthogonal(this.getOrthogonalOnSides(this.getOrthogonal(coral, true))) !== 1) {
                return false;
            }
        }

        if (this.RULE_SQUARE) {
            for (let y = 0; y < this.HEIGHT - 1; y++) {
                for (let x = 0; x < this.WIDTH - 1; x++) {
                    if (coral[y][x] === 2 && coral[y][x + 1] === 2 && coral[y + 1][x] === 2 && coral[y + 1][x + 1] === 2) {
                        return false;
                    }
                }
            }
        }

        if (this.RULE_CYCLE) {
            if (! this.checkCycle(coral)) {
                return false;
            }
        }

        return true;
    }

    private static checkRules(): void {
        if (this.RULE_CYCLE) {
            if (! this.RULE_SQUARE) {
                throw "CoralGenerator->checkRule - RULE_CYCLE REQUIRES RULE_SQUARE";
            }
        }

        if (this.RULE_SPACE_ORTHOGONAL && this.RULE_SQUARE) {
            if (! this.RULE_CYCLE) {
                throw "CoralGenerator->checkRule - RULE_SPACE_ORTHOGONAL + RULE_SQUARE REQUIRES RULE_CYCLE";
            }
        }
    }

    private static checkCoralEverywhere(coral: number[][]): boolean {
        for (let y = 0; y < this.HEIGHT; y++) {
            let hasCoral = false;
            for (let x = 0; x < this.WIDTH; x++) {
                if (coral[y][x] === 2) {
                    hasCoral = true;
                }
            }
            if (! hasCoral) {
                return false;
            }
        }

        for (let x = 0; x < this.WIDTH; x++) {
            let hasCoral = false;
            for (let y = 0; y < this.WIDTH; y++) {
                if (coral[y][x] === 2) {
                    hasCoral = true;
                }
            }
            if (! hasCoral) {
                return false;
            }
        }

        return true;
    }

    public static createCoral(width: number, height: number, doCheckEverywhere: boolean = true): number[][] | null{
        this.checkRules();

        this.WIDTH = width;
        this.HEIGHT = height;

        let coral;
        for (let i = 0; i < this.MAX_NEW_TRIES; i++) {
            coral = this.createRandomCoral();

            for (let j = 0; j < this.MAX_CHANGE_TRIES; j++) {
                coral = this.repairAll(coral);

                if (this.checkCoral(coral)) {
                    if (doCheckEverywhere) {
                        if (! this.checkCoralEverywhere(coral)) {
                            return null;
                        }
                    }
                    if (this.doLog) {
                        console.log(i, j, "(" + (i * this.MAX_CHANGE_TRIES + j).toString() + ")");
                    }
                    return coral;
                }
            }

        }

        return null;
    }
}