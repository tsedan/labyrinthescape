class Minimap {
    constructor(m) {
        this.back = createSprite(0,0,m.H*10,m.W*10);
        this.back.shapeColor = color(0);

        this.mapNodes = new Group();
        for (let i = 0; i < m.grid.length; i++) {
            for (let j = 0; j < m.grid[0].length; j++) {
                let box = createSprite(i * 10, j * 10, 10, 10);
                let isPower = false;
                for (let k of m.powerLocs)
                    if (j == k[1] && i == k[0])
                        isPower = true;

                if (m.grid[i][j] == 0 && !isPower && !(j == m.start[1] && i == m.start[0]) && !(j == m.end[1] && i == m.end[0])) {
                    box.shapeColor = color(255);
                    //box.hide();
                    this.mapNodes.add(box);
                }
            }
        }
    }

    update(row,col) {
        //Row and Col should be player coords in the maze
        //
    }

    draw() {
        //Draw my boys

        //Translate everyone to the corner
        push();
        noLights();

        drawSprite(this.back);
        drawSprites(this.mapNodes);
        pop();
    }
}
