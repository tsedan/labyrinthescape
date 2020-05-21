class Minimap {
    constructor() {
        this.pointsVisited = new Set();
        this.currX = m.start[0];
        this.currY = m.start[1];
    }

    update(row, col) {
        this.currX = row;
        this.currY = col;

        this.pointsVisited.add(row + "," + col);
    }

    draw() {
        push();
        noStroke();
        rectMode(CORNER);

        const w = minimapScale * m.W;
        const h = minimapScale * m.H;
        const edgeX = windowWidth;
        const edgeY = windowHeight;
        const offset = ((windowHeight < windowWidth) ? windowHeight : windowWidth) / 20;

        fill(gameColors.minimap);
        rect(edgeX - w - minimapScale - offset, edgeY - h - minimapScale - offset, w + 2 * minimapScale, h + 2 * minimapScale);

        fill(gameColors.wall);
        rect(edgeX - w - offset, edgeY - h - offset, w, h);

        for (let pts = this.pointsVisited.values(), val = []; val = pts.next().value;) {
            const asArray = val.split(',');
            const valX = parseInt(asArray[0]), valY = parseInt(asArray[1]);
            (this.currX == valX && this.currY == valY) ? fill(gameColors.player) : fill(gameColors.back);
            rect(edgeX - w + valX * minimapScale - offset, edgeY - h + valY * minimapScale - offset, minimapScale, minimapScale);
        }

        pop();
    }
}
