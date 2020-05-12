let m = new MazeGenerator(10, 10, 0.05, 5);
m.generate();
g = m.grid;

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(51);
    for (let i = 0; i < g.length; i++) {
        for (let j = 0; j < g[0].length; j++) {
            let isPower = false;
            for (let k of m.powerLocs)
                if (j == k[1] && i == k[0])
                    isPower = true;

            if (isPower) {
                fill(0, 0, 255);
            } else if (j == m.start[1] && i == m.start[0]) {
                fill(0, 255, 0);
            } else if (j == m.end[1] && i == m.end[0]) {
                fill(255, 0, 0);
            } else {
                if (g[i][j] == 1) {
                    fill(0);
                } else {
                    fill(255);
                }

            }
            rect(i * 25, j * 25, 25, 25);

        }
    }
}
