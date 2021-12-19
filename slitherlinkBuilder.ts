class SlitherlinkBuilder {
    private static getOrder(width: number, height: number): number[][] {
        let order = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                order.push([x, y]);
            }
        }

        return Utils.shuffle(order);
    }

    public static build(width: number, height: number): ISlitherlink {
        let then = (new Date).getTime();

        let coral = CoralGenerator.build(width, height);
        //@ts-ignore
        let slitherlink = new Slitherlink(width, height, coral);
        let order = this.getOrder(width, height);

        for (let i = 0; i < order.length; i++) {
            let removeX = order[i][0];
            let removeY = order[i][1];
            let removed = slitherlink.task[removeY][removeX];
            slitherlink.task[removeY][removeX] = null;

            slitherlink.updateArrays();

            SlitherlinkSolver.solve(slitherlink);
            let solutionCount = slitherlink.countSolutions();

            if (solutionCount === 0) {
                throw "SlitherlinkBuilder->build - SOLUTION_COUNT === 0";
            } else if (solutionCount > 1) {
                // slitherlink.render(true);
                slitherlink.task[removeY][removeX] = removed;
            }
        }

        SlitherlinkSolver.solve(slitherlink);

        let now = (new Date).getTime();
        console.log((now - then) + "ms");

        return slitherlink;
    }

    public static main() {
        CoralGenerator.typeSlitherlink();

        for (let i = 0; i < 36; i++) {
            if (i % 6 === 0) {
                TapaBuilder.breakPage();
            }
            let slitherlink = this.build(10, 10);
            slitherlink.render(true, true);
        }
    }
}