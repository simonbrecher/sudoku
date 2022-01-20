class GroupGenerator {
    public static render(board: number[][], width: number, height: number): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("group-table");

        for (let y = 0; y < height; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < width; x++) {
                let column = row.insertCell();

                let squareDiv = document.createElement("div");
                squareDiv.classList.add("square");
                column.appendChild(squareDiv);

                if (board[y][x] === -1) {
                    column.classList.add("empty");
                }

                if (x !== 0) {
                    if (board[y][x] !== board[y][x - 1]) {
                        column.classList.add("border-left");
                    }
                } else {
                    column.classList.add("border-left");
                }
                if (x !== width - 1) {
                    if (board[y][x] !== board[y][x + 1]) {
                        column.classList.add("border-right");
                    }
                } else {
                    column.classList.add("border-right");
                }
                if (y !== 0) {
                    if (board[y][x] !== board[y - 1][x]) {
                        column.classList.add("border-top");
                    }
                } else {
                    column.classList.add("border-top");
                }
                if (y !== height - 1) {
                    if (board[y][x] !== board[y + 1][x]) {
                        column.classList.add("border-bottom");
                    }
                } else {
                    column.classList.add("border-bottom");
                }
            }
        }
    }

    private static renderGroups(groups: number[][][], width: number, height: number): void {
        let board = this.groupsToBoard(groups, width, height);

        this.render(board, width, height);
    }

    public static groupsToBoard(groups: number[][][], width: number, height: number): number[][] {
        let board = Utils.createArray2d(width, height, -1);
        for (let i = 0; i < groups.length; i++) {
            for (let j = 0; j < groups[i].length; j++) {
                board[groups[i][j][1]][groups[i][j][0]] = i;
            }
        }

        return board;
    }

    public static boardToGroups(board: number[][], width: number, height: number): number[][][] {
        let groups: number[][][] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                while (board[y][x] >= groups.length) {
                    groups.push([]);
                }

                if (board[y][x] !== -1) {
                    groups[board[y][x]].push([x, y]);
                }
            }
        }

        return groups;
    }

    private static isGroupConnected(group: number[][]): boolean {
        if (group.length === 0) {
            throw "GroupGenerator->isGroupConnected - GROUP LENGTH === 0"
        }

        let already = [];
        for (let i = 0; i < group.length; i++) {
            already.push(false);
        }

        let deck = [0];
        while (deck.length > 0) {
            let positionId = deck.pop();
            // @ts-ignore
            already[positionId] = true;
            // @ts-ignore
            let x = group[positionId][0];
            // @ts-ignore
            let y = group[positionId][1];
            for (let newPositionId = 0; newPositionId < group.length; newPositionId++) {
                let newX = group[newPositionId][0];
                let newY = group[newPositionId][1];
                let diffX = Math.abs(newX - x);
                let diffY = Math.abs(newY - y);
                if ((diffX === 1 && diffY === 0 || diffX === 0 && diffY === 1) && ! already[newPositionId]) {
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

    private static createEmptyBoard(width: number, height: number, groupNumber: number): number[][] {
        let groupIndexes = new Set();
        let squares = [];
        let neighbours: number[][] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                groupIndexes.add(y * width + x);
                squares.push([[x, y]]);
                neighbours.push([]);
                if (x !== 0) {
                    neighbours[y * width + x].push(y * width + x - 1);
                }
                if (x !== width - 1) {
                    neighbours[y * width + x].push(y * width + x + 1);
                }
                if (y !== 0) {
                    neighbours[y * width + x].push((y - 1) * width + x);
                }
                if (y !== height - 1) {
                    neighbours[y * width + x].push((y + 1) * width + x);
                }
            }
        }

        for (let i = 0; i < width * height - groupNumber; i++) {
            // @ts-ignore
            let arr = Array.from(groupIndexes);
            let from = arr[Math.floor(Math.random() * groupIndexes.size)];
            let to = arr[Math.floor(Math.random() * groupIndexes.size)];
            // @ts-ignore
            while (to === from || ! Array.from(neighbours[to]).includes(from)) {
                from = arr[Math.floor(Math.random() * groupIndexes.size)];
                to = arr[Math.floor(Math.random() * groupIndexes.size)];

                let guessMaxSize = Math.ceil(width * height / groupNumber);
                if (squares[from].length >= guessMaxSize) {
                    from = arr[Math.floor(Math.random() * groupIndexes.size)];
                }
                if (squares[to].length >= guessMaxSize) {
                    to = arr[Math.floor(Math.random() * groupIndexes.size)];
                }
            }

            groupIndexes.delete(from);
            for (let j = 0; j < squares[from].length; j++) {
                squares[to].push(squares[from][j]);
            }
            for (let j = 0; j < neighbours[from].length; j++) {
                if (groupIndexes.has(neighbours[from][j])) {
                    neighbours[to].push(neighbours[from][j]);
                }
            }
        }

        let board = Utils.createArray2d(width, height, -1);

        // @ts-ignore
        let arr = Array.from(groupIndexes);
        for (let i = 0; i < groupIndexes.size; i++) {
            // @ts-ignore
            for (let j = 0; j < squares[arr[i]].length; j++) {
                // @ts-ignore
                let square = squares[arr[i]][j];
                board[square[1]][square[0]] = i;
            }
        }

        return board;
    }

    private static getCanBeRemoved(groups: number[][][], width: number, height: number): boolean[][] {
        let canBeRemoved = Utils.createArray2d(width, height, false);
        let updatedGroups = [];
        for (let i = 0; i < groups.length; i++) {
            updatedGroups.push(true);
        }

        this.updateCanBeRemoved(canBeRemoved, groups, updatedGroups);
        return canBeRemoved;
    }

    private static updateCanBeRemoved(canBeRemoved: boolean[][], groups: number[][][], updatedGroups: boolean[]): void {
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].length > 1 && updatedGroups[i]) {
                for (let j = 0; j < groups[i].length; j++) {
                    let group2 = [];
                    for (let k = 0; k < groups[i].length; k++) {
                        if (k !== j) {
                            group2.push(groups[i][k]);
                        }
                    }

                    if (this.isGroupConnected(group2)) {
                        let removed = groups[i][j];
                        canBeRemoved[removed[1]][removed[0]] = true;
                    }
                }
            }
        }
    }

    private static getGroupBorder(group: number[][], width: number, height: number): number[][] {
        let borderRaw = [];
        let already = new Set();
        for (let i = 0; i < group.length; i++) {
            for (let dirY = -1; dirY <= 1; dirY++) {
                for (let dirX = -1; dirX <= 1; dirX++) {
                    if ((dirX === 0) !== (dirY === 0)) {
                        let newX = group[i][0] + dirX;
                        let newY = group[i][1] + dirY;
                        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                            if (! already.has(newY * width + newX)) {
                                already.add(newY * width + newX);
                                borderRaw.push([newX, newY]);
                            }
                        }
                    }
                }
            }
        }

        let inside = new Set();
        for (let i = 0; i < group.length; i++) {
            inside.add(group[i][1] * width + group[i][0]);
        }

        let border = [];
        for (let i = 0; i < borderRaw.length; i++) {
            if (! inside.has(borderRaw[i][1] * width + borderRaw[i][0])) {
                border.push(borderRaw[i]);
            }
        }

        return border;
    }

    private static checkGroupSizesInput(width: number, height: number, groupSizesInput: number[]): boolean {
        let total = 0;
        for (let i = 0; i < groupSizesInput.length; i++) {
            total += groupSizesInput[i];
        }

        return total === width * height;
    }

    private static update(groups: number[][][], groupSizes: number[], width: number, height: number, canBeRemoved: boolean[][], board: number[][]): void {
        let updatedGroups = [];
        for (let i = 0; i < groups.length; i++) {
            updatedGroups.push(false);
        }

        for (let smallId = 0; smallId < groups.length; smallId++) {
            if (groups[smallId].length < groupSizes[smallId]) {
                let border = this.getGroupBorder(groups[smallId], width, height);
                border = Utils.shuffle(border);

                for (let i = 0; i < border.length; i++) {
                    let removeX = border[i][0];
                    let removeY = border[i][1];
                    if (canBeRemoved[removeY][removeX] && groups[board[removeY][removeX]].length !== 1) {
                        let removeGroup = board[removeY][removeX];
                        groups[smallId].push([removeX, removeY]);
                        updatedGroups[smallId] = true;
                        board[removeY][removeX] = smallId;
                        for (let j = 0; j < groups[removeGroup].length; j++) {
                            if (groups[removeGroup][j][0] === removeX && groups[removeGroup][j][1] === removeY) {
                                groups[removeGroup].splice(j, 1);
                                updatedGroups[removeGroup] = true;
                                break;
                            }
                        }
                        for (let j = 0; j < groups[removeGroup].length; j++) {
                            canBeRemoved[groups[removeGroup][j][1]][groups[removeGroup][j][0]] = false;
                        }
                        for (let j = 0; j < groups[smallId].length; j++) {
                            canBeRemoved[groups[smallId][j][1]][groups[smallId][j][0]] = false;
                        }

                        break;
                    }
                }
            }
        }

        this.updateCanBeRemoved(canBeRemoved, groups, updatedGroups);
    }

    public static build(width: number, height: number, groupSizesInput: number[]): number[][] {
        let then = (new Date).getTime();

        if (! this.checkGroupSizesInput(width, height, groupSizesInput)) {
            throw "GroupGenerator->build - SUM OF GROUP SIZES INPUT IS NOT SIZE * SIZE";
        }

        let groupSizes = Utils.shuffle(Utils.deepcopy(groupSizesInput));
        let board = this.createEmptyBoard(width, height, groupSizes.length);
        let groups = this.boardToGroups(board, width, height);

        let isFinished = false;
        let canBeRemoved = this.getCanBeRemoved(groups, width, height);
        for (let tries = 0; tries < 500; tries++) {
            this.update(groups, groupSizes, width, height, canBeRemoved, board);

            let isOk = true;
            for (let i = 0; i < groups.length; i++) {
                if (groups[i].length !== groupSizes[i]) {
                    isOk = false;
                }
            }
            if (isOk) {
                isFinished = true;
                break;
            }
        }

        if (! isFinished) {
            return this.build(width, height, groupSizesInput);
        }

        let now = (new Date).getTime();
        // console.log(`${now - then}ms`);

        return board;
    }

    public static buildMinMax(width: number, height: number, groupCount: number, minSize: number, maxSize: number): number[][] {
        let then = (new Date).getTime();

        if (minSize * groupCount > width * height || maxSize * groupCount < width * height) {
            throw "GroupGenerator->build - WRONG MIN_SIZE OR MAX_SIZE OR GROUP_COUNT";
        }

        let board = this.createEmptyBoard(width, height, groupCount);
        let groups = this.boardToGroups(board, width, height);

        let isFinished = false;
        let canBeRemoved = this.getCanBeRemoved(groups, width, height);
        for (let tries = 0; tries < 500; tries++) {
            let groupSizes = [];
            for (let i = 0; i < groupCount; i++) {
                groupSizes.push(Math.floor(Math.random() * (maxSize - minSize) + minSize));
            }

            this.update(groups, groupSizes, width, height, canBeRemoved, board);

            let isOk = true;
            for (let i = 0; i < groups.length; i++) {
                if (groups[i].length < minSize || groups[i].length > maxSize) {
                    isOk = false;
                }
            }
            if (isOk) {
                isFinished = true;
                break;
            }
        }

        if (! isFinished) {
            return this.buildMinMax(width, height, groupCount, minSize, maxSize);
        }

        let now = (new Date).getTime();
        // console.log(`${now - then}ms`);

        return board;
    }

    public static main(): void {
        let size = 10;
        let groupSizes = [];
        for (let i = 0; i < size; i++) {
            groupSizes.push(size);
        }
        // for (let i = 0; i < 8; i++) {
        //     groupSizes.push(4);
        // }
        // for (let i = 0; i < 9; i++) {
        //     groupSizes.push(3);
        // }
        // for (let i = 0; i < 11; i++) {
        //     groupSizes.push(2);
        // }

        // let board = this.build(size, size, groupSizes);
        // this.render(board, size, size);

        let maxScore = -1;
        let maxBoard = null;
        for (let i = 0; i < 10; i++) {
            let board = this.buildMinMax(size, size, size, Math.floor(size / 2), Math.floor(size * 3 / 2));
            let score = 0;
            for (let y = 0; y < size - 1; y++) {
                for (let x = 0; x < size - 1; x++) {
                    if (board[y][x] === board[y][x + 1] && board[y][x] === board[y + 1][x] && board[y][x] === board[y + 1][x + 1]) {
                        score ++;
                    }
                }
            }
            if (score > maxScore) {
                maxScore = score;
                maxBoard = board;
            }
        }
        // @ts-ignore
        this.render(maxBoard, width, height);

        // let board = this.buildMinMax(size, size, size, Math.floor(size / 2), Math.floor(size * 3 / 2));
        // this.render(board, size, size);
    }
}