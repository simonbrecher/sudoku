class RangeBuilder {
    private static getRandomOrder(parent: IRange): number[][] {
        let order = [];
        for (let y = 0; y < parent.height; y++) {
            for (let x = 0; x < parent.width; x++) {
                if (parent.task[y][x] !== null) {
                    order.push([x, y]);
                }
            }
        }

        order = Utils.shuffle(order);

        return order;
    }

    public static build(width: number, height: number, type: "kuromasu" | "cave", depth: number = 0): IRange | null {
        let then = (new Date()).getTime();

        let range = new RangePuzzle(width, height, type === "kuromasu", type === "cave");

        let solutionCount = RangeSolver.countSolutions(RangeSolver.solve(range.board, range), range);
        if (solutionCount > 1) {
            return this.build(width, height, type, depth + 1);
        }

        let order = this.getRandomOrder(range);
        for (let i = 0; i < order.length; i++) {
            let removeX = order[i][0];
            let removeY = order[i][1];

            let removed = range.task[removeY][removeX];
            range.task[removeY][removeX] = null;

            let solutionCount = RangeSolver.countSolutions(RangeSolver.solve(range.board, range), range);

            if (solutionCount > 1) {
                range.task[removeY][removeX] = removed;
            }
        }

        let now = (new Date()).getTime();
        if (depth === 0) {
            console.log(`Range: ${now - then}ms`);
        }

        return range;
    }
}