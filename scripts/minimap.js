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
        noStroke();
        rectMode(CORNER);

        const w = minimapScale * m.W;
        const h = minimapScale * m.H;
        const edgeX = camera.position.x + windowWidth/2;
        const edgeY = camera.position.y + windowHeight/2;
        const offset = ((windowHeight < windowWidth) ? windowHeight : windowWidth) / 20;

        fill(gameColors.minimapBack);
        rect(edgeX - w - minimapScale - offset, edgeY - h - minimapScale - offset, w + 2*minimapScale, h + 2*minimapScale);

        fill(gameColors.wall);
        rect(edgeX - w - offset, edgeY - h - offset, w, h);

        for (let pts = this.pointsVisited.values(), val = []; val = pts.next().value;) {
            (this.currX == val[0] && this.currY == val[1]) ? fill(gameColors.player) : fill(gameColors.back);
            rect(edgeX - w + val[0]*minimapScale - offset,edgeY - h + val[1]*minimapScale - offset, minimapScale, minimapScale);
        }

        pop();
    }
}
