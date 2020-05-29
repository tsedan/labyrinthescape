class Minimap {
    constructor() {
        this.pointsVisited = new Set();
        this.currX = m.start[0];
        this.currY = m.start[1];
        this.flareLocations = {};
        this.flareTimings = {};
    }

    reset() {
        this.pointsVisited = new Set();
    }

    revealAll() {
        for (let i = 0; i < m.H; i++)
            for (let j = 0; j < m.W; j++)
                if (!m.grid[i][j]) this.pointsVisited.add(j + "," + i);
    }

    updateLoc(row, col) {
        this.currX = row;
        this.currY = col;
    }

    update(row, col) {
        this.updateLoc(row, col);
        this.pointsVisited.add(row + "," + col);
    }

    draw() {
        push();
        noStroke();
        rectMode(CORNER);

        const w = minimapScale * m.W, h = minimapScale * m.H;
        const edgeX = windowWidth, edgeY = windowHeight;
        const topCorner = edgeX - w - uiPadding, leftCorner = edgeY - h - uiPadding;

        fill(gameColors.minimap);
        rect(topCorner - minimapScale, leftCorner - minimapScale, w + 2 * minimapScale, h + 2 * minimapScale);

        fill(gameColors.wall);
        rect(topCorner, leftCorner, w, h);

        fill(gameColors.back);
        for (let pts = this.pointsVisited.values(), val = []; val = pts.next().value;) {
            const asArray = val.split(',');
            const valX = parseInt(asArray[0]), valY = parseInt(asArray[1]);
            rect(topCorner + valX * minimapScale, leftCorner + valY * minimapScale, minimapScale, minimapScale);
        }

        fill(gameColors.player);
        rect(topCorner + this.currX * minimapScale, leftCorner + this.currY * minimapScale, minimapScale, minimapScale);

        for (let key of Object.keys(this.flareLocations)) {
            this.flareLocations[key].setAlpha(floor(sin(5 * frameCount) * 255 / 2 + 255 / 2))

            fill(this.flareLocations[key]);
            let s = key.split(',');
            rect(topCorner + parseInt(s[0]) * minimapScale, leftCorner + parseInt(s[1]) * minimapScale, minimapScale, minimapScale);

            this.flareTimings[key] -= deltaTime;

            if (this.flareTimings[key] < 0) {
                delete this.flareLocations[key];
                delete this.flareTimings[key];
            }
        }

        pop();
    }
}
