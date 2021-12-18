class CoralGenerator {
    private static WIDTH: number;
    private static HEIGHT: number;

    public static START_CHANCE_FULL: number;
    public static CHANCE_FILL_ORTHOGONAL: number;
    public static CHANCE_REMOVE_SQUARE: number;

    public static RULE_ORTHOGONAL: number; // 2 bits : full-empty ; 1 - must be ; 0 - does not have to be
    public static RULE_ORTHOGONAL_DIAGONAL: number; // 2 bits : full-empty ; can orthogonality be diagonally?
    public static RULE_ORTHOGONAL_EDGE: number; // 2 bits : full-empty ; can orthogonality be by edge?
    public static RULE_SQUARE: number; // 2 bits : full-empty ; if 1 : do not allow 2*2 box

    public static doLog = false;

    public static areRulesSet = false;

    // for coral (fast up to 100x100)
    public static typeCoral(): void {
        this.START_CHANCE_FULL = 0.5;
        this.CHANCE_FILL_ORTHOGONAL = 0.8;
        this.CHANCE_REMOVE_SQUARE = 1;

        this.RULE_ORTHOGONAL = 3;
        this.RULE_ORTHOGONAL_DIAGONAL = 0;
        this.RULE_ORTHOGONAL_EDGE = 1;
        this.RULE_SQUARE = 2;

        this.areRulesSet = true;
    }

    // for tapa (fast up to 100x100)
    public static typeTapa(): void {
        this.START_CHANCE_FULL = 0.3;
        this.CHANCE_FILL_ORTHOGONAL = 0.9;
        this.CHANCE_REMOVE_SQUARE = 1;

        this.RULE_ORTHOGONAL = 3;
        this.RULE_ORTHOGONAL_DIAGONAL = 1;
        this.RULE_ORTHOGONAL_EDGE = 1;
        this.RULE_SQUARE = 2;

        this.areRulesSet = true;
    }

    // for slitherlink (fast up to 100x100)
    public static typeSlitherlink(): void {
        this.START_CHANCE_FULL = 0.5;
        this.CHANCE_FILL_ORTHOGONAL = 0.7;
        this.CHANCE_REMOVE_SQUARE = 1;

        this.RULE_ORTHOGONAL = 3;
        this.RULE_ORTHOGONAL_DIAGONAL = 0;
        this.RULE_ORTHOGONAL_EDGE = 1;
        this.RULE_SQUARE = 0;

        this.areRulesSet = true;
    }

    private static MAX_CHANGE_TRIES = 5000;
    private static MAX_NEW_TRIES = 20;

    public static render(coral: number[][] | null, previous: number[][] | null = null, color: "black" | "red" = "black"): void {
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

                if (previous !== null) {
                    if (coral[y][x] !== previous[y][x]) {
                        squareDiv.textContent = "~";
                    }
                }

                if (coral[y][x] === 1) {
                    // squareDiv.textContent = "-";
                } else if (coral[y][x] === 2) {
                    squareDiv.classList.add(color);
                    // squareDiv.textContent = "X";
                } else if (coral[y][x] === 3) {
                    squareDiv.textContent = "?";
                } else {
                    squareDiv.textContent = "!";
                }
            }
        }
    }

    private static renderPriority(coral: number[][], priority: boolean[][]): void {
        let previous = [];
        for (let y = 0; y < this.HEIGHT; y++) {
            let row = [];
            for (let x = 0; x < this.WIDTH; x++) {
                if (priority[y][x]) {
                    row.push(coral[y][x] ^ 3);
                } else {
                    row.push(coral[y][x]);
                }
            }
            previous.push(row);
        }

        this.render(coral, previous, "red");
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

    private static getOrthogonal(coral: number[][], coralConst: 1 | 2): number[][] {
        let height = coral.length;
        let width = coral[0].length;

        let isDiagonal = (this.RULE_ORTHOGONAL_DIAGONAL & coralConst) !== 0;

        let orthogonal = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push(-1);
            }
            orthogonal.push(row);
        }

        let orthogonalPartId = 0;
        for (let startY = 0; startY < height; startY++) {
            for (let startX = 0; startX < width; startX++) {
                if (orthogonal[startY][startX] === -1 && coral[startY][startX] === coralConst) {
                    let deck = [[startX, startY]];
                    while (deck.length > 0) {
                        let x, y;
                        // @ts-ignore
                        [x, y] = deck.pop();
                        if (orthogonal[y][x] === -1 && coral[y][x] === coralConst) {
                            orthogonal[y][x] = orthogonalPartId;
                            for (let dirY = -1; dirY <= 1; dirY++) {
                                for (let dirX = -1; dirX <= 1; dirX++) {
                                    if ((dirX !== 0 || dirY !== 0) && (dirX === 0 || dirY === 0 || isDiagonal)) {
                                        let newX = x + dirX;
                                        let newY = y + dirY;
                                        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                                            deck.push([newX, newY]);
                                        }
                                    }
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
        let height = orthogonal.length;
        let width = orthogonal[0].length;

        let max = -1;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                max = Math.max(max, orthogonal[y][x]);
            }
        }

        return max + 1;
    }

    private static repairSmallCoral(coral: number[][], coralConst: 1 | 2): number[][] {
        let orthogonal = this.getOrthogonal(coral, coralConst);
        if ((this.RULE_ORTHOGONAL_EDGE & coralConst) !== 0) {
            orthogonal = this.getOrthogonalOnSides(orthogonal);
        }
        let countOrthogonal = this.countOrthogonal(orthogonal);

        let isDiagonal = (this.RULE_ORTHOGONAL_DIAGONAL & coralConst) !== 0;

        if (countOrthogonal > 1) {
            let sizes = [];
            for (let i = 0; i < countOrthogonal; i++) {
                sizes.push(0);
            }

            for (let y = 0; y < this.HEIGHT; y++) {
                for (let x = 0; x < this.WIDTH; x++) {
                    if (orthogonal[y][x] !== -1) {
                        sizes[orthogonal[y][x]] ++;
                    }
                }
            }

            let minIndex = 0;
            let minSize = this.WIDTH * this.HEIGHT;
            for (let i = 0; i < countOrthogonal; i++) {
                if (sizes[i] < minSize) {
                    minIndex = i;
                    minSize = sizes[i];
                }
            }

            let nextToMin = [];
            for (let y = 0; y < this.HEIGHT; y++) {
                for (let x = 0; x < this.WIDTH; x++) {
                    if (orthogonal[y][x] === -1) {
                        let isAlready = false;
                        for (let dirY = -1; dirY <= 1; dirY++) {
                            for (let dirX = -1; dirX <= 1; dirX++) {
                                if ((dirX !== 0 || dirY !== 0) && (dirX === 0 || dirY === 0 || isDiagonal)) {
                                    let newX = x + dirX;
                                    let newY = y + dirY;
                                    if (newX >= 0 && newX < this.WIDTH && newY >= 0 && newY < this.HEIGHT) {
                                        if (orthogonal[newY][newX] === minIndex && ! isAlready) {
                                            nextToMin.push([x, y]);
                                            isAlready = true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let randomNum = Math.floor(Math.random() * nextToMin.length);
            let addPos = nextToMin[randomNum];
            coral[addPos[1]][addPos[0]] ^= 3;
        }

        return coral;
    }

    private static getPriorityOne(square: number[][], coralConst: 1 | 2): boolean {
        return this.countOrthogonal(this.getOrthogonal(square, coralConst)) <= 1;
    }

    private static getPriority(coral: number[][]): boolean[][] {
        let priority: boolean[][] = [];
        for (let y = 0; y < this.HEIGHT; y++) {
            let row = [];
            for (let x = 0; x < this.WIDTH; x++) {
                // if ((this.RULE_ORTHOGONAL & coral[y][x]) !== 0 && (this.RULE_ORTHOGONAL_DIAGONAL & coral[y][x]) === 0) {
                if (this.RULE_ORTHOGONAL_DIAGONAL === 0) {
                    let square = [];
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        let row = [];
                        for (let dirX = -1; dirX <= 1; dirX++) {
                            let newX = x + dirX;
                            let newY = y + dirY;
                            if (newX < 0 || newX >= this.WIDTH || newY < 0 || newY >= this.HEIGHT) {
                                row.push(0);
                            } else {
                                row.push(coral[newY][newX]);
                            }
                        }
                        square.push(row);
                    }

                    // @ts-ignore
                    let before = this.getPriorityOne(square, coral[y][x]);

                    square[1][1] ^= 3;

                    // @ts-ignore
                    let after = this.getPriorityOne(square, coral[y][x]);

                    row.push(! before || after);
                } else {
                    row.push(true);
                }
            }

            priority.push(row);
        }

        return priority;
    }

    private static repairOrthogonality(coral: number[][], coralConst: 1 | 2): number[][] {
        let spaceConst = coralConst ^ 3;
        let isDiagonal = (this.RULE_ORTHOGONAL_DIAGONAL & coralConst) !== 0;

        let orthogonal = this.getOrthogonal(coral, coralConst);
        if ((this.RULE_ORTHOGONAL_EDGE & coralConst) !== 0) {
            orthogonal = this.getOrthogonalOnSides(orthogonal);
        }
        let countOrthogonal = this.countOrthogonal(orthogonal);

        let priority = this.getPriority(coral);

        let betweenPriority = [];
        let betweenNormal = [];
        for (let i = 0; i < countOrthogonal; i++) {
            betweenPriority.push([]);
            betweenNormal.push([]);
        }

        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                if (coral[y][x] === spaceConst) {
                    let nextTo = new Set();
                    for (let dirY = -1; dirY <= 1; dirY++) {
                        for (let dirX = -1; dirX <= 1; dirX++) {
                            if ((dirX !== 0 || dirY !== 0) && (dirX === 0 || dirY === 0 || isDiagonal)) {
                                let newX = x + dirX;
                                let newY = y + dirY;
                                if (newX >= 0 && newX < this.WIDTH && newY >= 0 && newY < this.HEIGHT) {
                                    if (coral[newY][newX] === coralConst) {
                                        nextTo.add(orthogonal[newY][newX]);
                                    }
                                }
                            }
                        }
                    }
                    if (nextTo.size >= 2) {
                        // @ts-ignore
                        let nextToArray = Array.from(nextTo);
                        for (let i = 0; i < nextToArray.length; i++) {
                            if (priority[y][x]) {
                                // @ts-ignore
                                betweenPriority[nextToArray[i]].push([x, y]);
                            } else {
                                // @ts-ignore
                                betweenNormal[nextToArray[i]].push([x, y]);
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < countOrthogonal; i++) {
            if (Math.random() < this.CHANCE_FILL_ORTHOGONAL) {
                if (betweenPriority[i].length > 0) {
                    let randomNumber = Math.floor(Math.random() * betweenPriority[i].length);
                    let chosen = betweenPriority[i][randomNumber];
                    coral[chosen[1]][chosen[0]] ^= 3;
                } else if (betweenNormal[i].length > 0) {
                    let randomNumber = Math.floor(Math.random() * betweenNormal[i].length);
                    let chosen = betweenNormal[i][randomNumber];
                    coral[chosen[1]][chosen[0]] ^= 3;
                }
            }
        }

        return coral;
    }

    private static repairSquare(coral: number[][]): number[][] {
        for (let y = 0; y < this.HEIGHT - 1; y++) {
            for (let x = 0; x < this.WIDTH - 1; x++) {
                let value = coral[y][x] & coral[y][x + 1] & coral[y + 1][x] & coral[y + 1][x + 1];
                if (((value & this.RULE_SQUARE) !== 0 && Math.random() < this.CHANCE_REMOVE_SQUARE)) {
                    let relativeX = Math.floor(Math.random() * 2);
                    let relativeY = Math.floor(Math.random() * 2);
                    coral[y + relativeY][x + relativeX] ^= 3;
                }
            }
        }

        return coral;
    }

    private static repairAll(coral: number[][]): number[][] {
        for (let coralConst = 1; coralConst <= 2; coralConst++) {
            if ((this.RULE_ORTHOGONAL & coralConst) !== 0) {
                // @ts-ignore
                coral = this.repairSmallCoral(coral, coralConst);
            }
        }
        for (let coralConst = 1; coralConst <= 2; coralConst++) {
            if ((this.RULE_ORTHOGONAL & coralConst) !== 0) {
                // @ts-ignore
                coral = this.repairOrthogonality(coral, coralConst);
            }
        }

        if (this.RULE_SQUARE !== 0) {
            coral = this.repairSquare(coral);
        }

        return coral;
    }

    public static checkCoral(coral: number[][]): boolean {
        for (let coralConst = 1; coralConst <= 2; coralConst++) {
            if ((this.RULE_ORTHOGONAL & coralConst) !== 0) {
                if ((this.RULE_ORTHOGONAL_EDGE & coralConst) !== 0) {
                    // @ts-ignore
                    if (this.countOrthogonal(this.getOrthogonalOnSides(this.getOrthogonal(coral, coralConst))) !== 1) {
                        return false;
                    }
                } else {
                    // @ts-ignore
                    if (this.countOrthogonal(this.getOrthogonal(coral, coralConst)) !== 1) {
                        return false;
                    }
                }
            }
        }

        if (this.RULE_SQUARE) {
            for (let y = 0; y < this.HEIGHT - 1; y++) {
                for (let x = 0; x < this.WIDTH - 1; x++) {
                    let value = coral[y][x] & coral[y][x + 1] & coral[y + 1][x] & coral[y + 1][x + 1];
                    if ((value & this.RULE_SQUARE) !== 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private static checkRules(): void {
        if (! this.areRulesSet) {
            throw "CoralGenerator->checkRules - RULES ARE NOT SET";
        }
    }

    private static checkIsCoralEverywhere(coral: number[][]): boolean {
        for (let y = 0; y < this.HEIGHT; y++) {
            let hasCoral = false;
            for (let x = 0; x < this.WIDTH; x++) {
                if (coral[y][x] === 2) {
                    hasCoral = true;
                }
            }
            if (!hasCoral) {
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

    public static build(width: number, height: number, doCheckEverywhere: boolean = true): number[][] | null{
        this.checkRules();

        this.WIDTH = width;
        this.HEIGHT = height;

        let coral;
        for (let i = 0; i < this.MAX_NEW_TRIES; i++) {
            coral = this.createRandomCoral();

            for (let j = 0; j < this.MAX_CHANGE_TRIES; j++) {
                let previous = Utils.deepcopyArray2d(coral);

                if (this.checkCoral(coral)) {
                    let isOk = true;
                    if (doCheckEverywhere) {
                        if (! this.checkIsCoralEverywhere(coral)) {
                            isOk = false;
                        }
                    }
                    if (isOk) {
                        if (this.doLog) {
                            console.log(i + " " + j + " " + "(" + (i * this.MAX_CHANGE_TRIES + j).toString() + ")");
                        }
                        return coral;
                    }
                }

                coral = this.repairAll(coral);

                // this.render(coral, previous);
                // this.renderPriority(coral, this.getPriority(coral));
            }
        }

        return null;
    }
}