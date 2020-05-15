class Minimap {
    constructor(m) {
        this.m = m;
        this.pointsVisited = [];
        this.currX = this.m.start[0];
        this.currY = this.m.start[1];

        // this.mapNodes = new Group();
        // for (let i = 0; i < m.grid.length; i++) {
        //     for (let j = 0; j < m.grid[0].length; j++) {
        //         let box = createSprite(i * 10, j * 10, 10, 10);
        //         let isPower = false;
        //         for (let k of m.powerLocs)
        //             if (j == k[1] && i == k[0])
        //                 isPower = true;

        //         if (m.grid[i][j] == 0 && !isPower && !(j == m.start[1] && i == m.start[0]) && !(j == m.end[1] && i == m.end[0])) {
        //             box.shapeColor = color(255);
        //             //box.hide();
        //             this.mapNodes.add(box);
        //         }
        //     }
        // }
    }

    update(row, col) {
        this.currX = row;
        this.currY = col;
        for (let i in this.pointsVisited) {
            if (this.pointsVisited[i][0] == row && this.pointsVisited[i][1] == col) return;
        }
        this.pointsVisited.push([row, col]);
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
        rect(camera.position.x - width / 6, camera.position.y - height / 3, scale * this.m.grid.length / 25, scale * this.m.grid[0].length / 25);

        fill(0);
        rect(camera.position.x - width / 6 + scale * 0.05, camera.position.y - height / 3 + scale * 0.05, scale * 0.94 * this.m.grid.length / 25, scale * 0.9 * this.m.grid[0].length / 25);

        let w = scale * 0.94 * this.m.grid.length / 25 / this.m.grid.length;
        let h = scale * 0.9 * this.m.grid[0].length / 25 / this.m.grid[0].length;

        for (let p in this.pointsVisited) {
            if (this.currX == this.pointsVisited[p][0] && this.currY == this.pointsVisited[p][1]) {
                fill(255, 0, 0);
            } else {
                fill(255);
            }
            rect(camera.position.x - width / 6 + scale * 0.05 + w * this.pointsVisited[p][0], camera.position.y - height / 3 + scale * 0.05 + h * this.pointsVisited[p][1], w, h);
        }

        pop();
    }
}
