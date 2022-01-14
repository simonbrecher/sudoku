class StarsBuilder {
    public static build(size: number, starsCount: number): IStars | null {
        let then = (new Date()).getTime();

        for (let i = 0; i < 500; i++) {
            let stars = new Stars(size, starsCount);

            let solutionCount = StarsSolver.countSolutions(StarsSolver.solve(stars.board, stars), stars);

            if (solutionCount === 1) {
                let now = (new Date()).getTime();
                console.log(`Stars: ${i} ${now - then}ms`);

                return stars;
            }
        }

        let now = (new Date()).getTime();
        console.log(`!! Stars: FAIL ${now - then}ms`);

        return null;
    }
}