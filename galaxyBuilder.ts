class GalaxyBuilder {
    public static build(width: number, height: number): IGalaxy | null {
        let then = (new Date()).getTime();

        for (let i = 0; i < 2000; i++) {
            let galaxy = new Galaxy(width, height);

            let solution = GalaxySolver.solve(galaxy.board, galaxy);
            let solutionCount = GalaxySolver.countSolutions(solution, galaxy);

            if (solutionCount === 1) {
                if (this.isPretty(solution, galaxy)) {
                    galaxy.solution = solution;

                    let now = (new Date()).getTime();
                    console.log(`Galaxy: ${i} ${now - then}ms`);

                    return galaxy;
                }
            }
        }

        let now = (new Date()).getTime();
        console.log(`!! Galaxy: FAIL ${now - then}ms`);

        return null;
    }

    private static isPretty(solution: number[][], galaxy: IGalaxy): boolean {
        let data = [];
        for (let i = 0; i < galaxy.centers.length; i++) {
            data.push([galaxy.width, -1, galaxy.height, -1, 0]);
        }

        for (let y = 0; y < galaxy.height; y++) {
            for (let x = 0; x < galaxy.width; x++) {
                let centerId = Utils.binaryToValue(solution[y][x]) - 1;
                if (x < data[centerId][0]) {
                    data[centerId][0] = x;
                }
                if (x > data[centerId][1]) {
                    data[centerId][1] = x;
                }
                if (y < data[centerId][2]) {
                    data[centerId][2] = y;
                }
                if (y > data[centerId][3]) {
                    data[centerId][3] = y;
                }
                data[centerId][4] ++;
            }
        }

        let isNotRectangular = 0;
        let isOneSize = 0;
        let isBig = 0;
        for (let i = 0; i < data.length; i++) {
            if ((data[i][1] - data[i][0] + 1) * (data[i][3] - data[i][2] + 1) !== data[i][4]) {
                isNotRectangular ++;
            }
            if (data[i][4] === 1) {
                isOneSize ++;
            }
            if (data[i][4] > Math.floor(galaxy.width * galaxy.height / 3)) {
                isBig ++;
            }
        }

        if (isNotRectangular === 0 && Math.random() < 0.7) {
            return false;
        }
        if (isOneSize > Math.ceil(galaxy.centers.length * 0.3) && isNotRectangular === 0 && Math.random() < 0.7) {
            return false;
        }
        if (isBig > 0 && Math.random() < 0.7) {
            return false;
        }

        return true;
    }
}