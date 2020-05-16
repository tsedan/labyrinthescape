class Minimap {
    constructor() {
        this.pointsVisited = new Set();
        this.currX = m.start[0];
        this.currY = m.start[1];
    }

    update(row, col) {
        this.currX = row;
        this.currY = col;

        this.pointsVisited.add([row, col]);
    }

    draw() {
        push();
        noLights();
        noStroke();
        rectMode(CORNER);

        const w = minimapScale * m.W;
        const h = minimapScale * m.H;
        const offset = ((windowHeight < windowWidth) ? windowHeight : windowWidth) / 20;

        fill(gameColors.minimapBack);
        rect(camera.position.x - w - minimapScale - offset, camera.position.y - h - minimapScale - offset, w + 2*minimapScale, h + 2*minimapScale);

        fill(gameColors.wall);
        rect(camera.position.x - w - offset, camera.position.y - h - offset, w, h);

        for (let pts = this.pointsVisited.values(), val = []; val = pts.next().value;) {
            (this.currX == val[0] && this.currY == val[1]) ? fill(gameColors.player) : fill(gameColors.back);
            rect(camera.position.x - w + val[0]*minimapScale - offset,camera.position.y - h + val[1]*minimapScale - offset, minimapScale, minimapScale);
        }

        pop();
    }
}
