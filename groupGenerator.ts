class GroupGenerator {
    public static render(board: number[][], size: number): void {
        let pageWrapper = document.getElementById("page-wrapper");

        let boardTable = document.createElement("table");
        pageWrapper?.appendChild(boardTable);
        boardTable.classList.add("group-table");

        for (let y = 0; y < size; y++) {
            let row = boardTable.insertRow();

            for (let x = 0; x < size; x++) {
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
                if (x !== size - 1) {
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
                if (y !== size - 1) {
                    if (board[y][x] !== board[y + 1][x]) {
                        column.classList.add("border-bottom");
                    }
                } else {
                    column.classList.add("border-bottom");
                }
            }
        }
    }

    private static renderGroups(groups: number[][][], size: number): void {
        let board = this.groupsToBoard(groups, size);

        this.render(board, size);
    }

    public static groupsToBoard(groups: number[][][], size: number): number[][] {
        let board = Utils.createArray2d(size, size, -1);
        for (let i = 0; i < groups.length; i++) {
            for (let j = 0; j < groups[i].length; j++) {
                board[groups[i][j][1]][groups[i][j][0]] = i;
            }
        }

        return board;
    }

    public static boardToGroups(board: number[][], size: number): number[][][] {
        let groups: number[][][] = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
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

    private static createEmptyBoard(size: number, groupNumber: number): number[][] {
        let groupIndexes = new Set();
        let squares = [];
        let neighbours: number[][] = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                groupIndexes.add(y * size + x);
                squares.push([[x, y]]);
                neighbours.push([]);
                if (x !== 0) {
                    neighbours[y * size + x].push(y * size + x - 1);
                }
                if (x !== size - 1) {
                    neighbours[y * size + x].push(y * size + x + 1);
                }
                if (y !== 0) {
                    neighbours[y * size + x].push((y - 1) * size + x);
                }
                if (y !== size - 1) {
                    neighbours[y * size + x].push((y + 1) * size + x);
                }
            }
        }

        for (let i = 0; i < size * size - groupNumber; i++) {
            // @ts-ignore
            let arr = Array.from(groupIndexes);
            let from = arr[Math.floor(Math.random() * groupIndexes.size)];
            let to = arr[Math.floor(Math.random() * groupIndexes.size)];
            // @ts-ignore
            while (to === from || ! Array.from(neighbours[to]).includes(from)) {
                from = arr[Math.floor(Math.random() * groupIndexes.size)];
                to = arr[Math.floor(Math.random() * groupIndexes.size)];

                let guessMaxSize = Math.ceil(size * size / groupNumber);
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

        let board = Utils.createArray2d(size, size, -1);

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

    private static getCanBeRemoved(groups: number[][][], size: number): boolean[][] {
        let canBeRemoved = Utils.createArray2d(size, size, false);
        let updatedGroups = [];
        for (let i = 0; i < groups.length; i++) {
            updatedGroups.push(true);
        }

        return this.updateCanBeRemoved(canBeRemoved, groups, updatedGroups);
    }

    private static updateCanBeRemoved(canBeRemoved: boolean[][], groups: number[][][], updatedGroups: boolean[]): boolean[][] {
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

        return canBeRemoved;
    }

    private static getGroupBorder(group: number[][], size: number): number[][] {
        let borderRaw = [];
        let already = new Set();
        for (let i = 0; i < group.length; i++) {
            for (let dirY = -1; dirY <= 1; dirY++) {
                for (let dirX = -1; dirX <= 1; dirX++) {
                    if ((dirX === 0) !== (dirY === 0)) {
                        let newX = group[i][0] + dirX;
                        let newY = group[i][1] + dirY;
                        if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
                            if (! already.has(newY * size + newX)) {
                                already.add(newY * size + newX);
                                borderRaw.push([newX, newY]);
                            }
                        }
                    }
                }
            }
        }

        let inside = new Set();
        for (let i = 0; i < group.length; i++) {
            inside.add(group[i][1] * size + group[i][0]);
        }

        let border = [];
        for (let i = 0; i < borderRaw.length; i++) {
            if (! inside.has(borderRaw[i][1] * size + borderRaw[i][0])) {
                border.push(borderRaw[i]);
            }
        }

        return border;
    }

    private static checkGroupSizesInput(size: number, groupSizesInput: number[]): boolean {
        let total = 0;
        for (let i = 0; i < groupSizesInput.length; i++) {
            total += groupSizesInput[i];
        }

        return total === size * size;
    }

    public static build(size: number, groupSizesInput: number[]): number[][] {
        let then = (new Date).getTime();

        if (! this.checkGroupSizesInput(size, groupSizesInput)) {
            throw "GroupGenerator->build - SUM OF GROUP SIZES INPUT IS NOT SIZE * SIZE";
        }

        let groupSizes = Utils.shuffle(Utils.deepcopy(groupSizesInput));

        let board = this.createEmptyBoard(size, groupSizes.length);

        let groups = this.boardToGroups(board, size);

        let isFinished = false;
        let canBeRemoved = this.getCanBeRemoved(groups, size);
        for (let tries = 0; tries < 500; tries++) {

            let updatedGroups = [];
            for (let i = 0; i < groups.length; i++) {
                updatedGroups.push(false);
            }

            for (let smallId = 0; smallId < groups.length; smallId++) {
                if (groups[smallId].length < groupSizes[smallId]) {
                    let border = this.getGroupBorder(groups[smallId], size);
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

            canBeRemoved = this.updateCanBeRemoved(canBeRemoved, groups, updatedGroups);

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
            return this.build(size, groupSizesInput);
        }

        let now = (new Date).getTime();
        // console.log(`${now - then}ms`);

        return board;
    }

    public static main(): void {
        let size = 9;
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

        let board = this.build(size, groupSizes);
        this.render(board, size);
    }
}