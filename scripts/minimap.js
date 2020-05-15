class Minimap {
    constructor(m) {
        this.m = m;
        this.pointsVisited = new Set();
        this.currX = this.m.start[0];
        this.currY = this.m.start[1];
    }

    update(row, col) {
        this.currX = row;
        this.currY = col;

        this.pointsVisited.add(row + "," + col);
    }

    draw() {

        //Draw my boys

        //Translate everyone to the corner
        push();
        noLights();
        noStroke();

        rectMode(CORNER);
        // HARDCODED TRASH FIX THIS PLS
        fill(51);
        rect(camera.position.x - scale / 2 - scale * this.m.grid.length / 25, camera.position.y - scale / 2 - scale * this.m.grid[0].length / 25, scale * this.m.grid.length / 25, scale * this.m.grid[0].length / 25);

        fill(0);
        rect(camera.position.x - scale / 2 - scale * this.m.grid.length / 25 + scale * 0.05, camera.position.y - scale / 2.25 - scale * this.m.grid[0].length / 25, scale * 0.94 * this.m.grid.length / 25, scale * 0.90 * this.m.grid[0].length / 25);


        let w = scale * 0.94 * this.m.grid.length / 25 / this.m.grid.length;
        let h = scale * 0.9 * this.m.grid[0].length / 25 / this.m.grid[0].length;

        for (let it = this.pointsVisited.values(), val = null; val = it.next().value;) {
            let square = val.split(",");
            let squareX = +square[0];
            let squareY = +square[1];
            if (this.currX == squareX && this.currY == squareY) {
                fill(255, 0, 0);
            } else {
                fill(255);
            }
            rect(camera.position.x - scale / 2 - scale * this.m.grid.length / 25 + scale * 0.05 + w * squareX, camera.position.y - scale / 2.25 - scale * this.m.grid[0].length / 25 + h * squareY, w, h);

        }

        pop();
    }
}
