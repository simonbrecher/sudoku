class DominoBuilder {
    public static build (size: number, width: number | null = null, height: number | null = null) {
        let then = (new Date()).getTime();

        if (width === null || height === null) {
            width = size + 1;
            height = size;
        }

        for (let i = 0; i < 500; i++) {
            let domino = new Domino(size, width, height);

            let solution = DominoSolver.solve(domino.board, domino);
            let solutionCount = DominoSolver.countSolutions(solution, domino);

            if (solutionCount === 1) {
                let now = (new Date()).getTime();
                console.log(`Domino: ${i} ${now - then}ms`);

                return domino;
            }
        }

        let now = (new Date()).getTime();
        console.log(`!! Domino: FAIL ${now - then}ms`);

        return null;
    }
}