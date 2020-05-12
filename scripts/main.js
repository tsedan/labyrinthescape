let m = new MazeGenerator(12, 20, 0.02, 5);
m.generate();
let player;
let walls;
let open;

function setup() {
    createCanvas(windowWidth, windowHeight);

    walls = new Group();
    open = new Group();
    for (let i = 0; i < m.grid.length; i++) {
        for (let j = 0; j < m.grid[0].length; j++) {
            let box = createSprite(i * 25 + 25 / 2, j * 25 + 25 / 2, 25, 25);
            let isPower = false;
            for (let k of m.powerLocs)
                if (j == k[1] && i == k[0])
                    isPower = true;

            if (isPower) {
                box.shapeColor = color(0, 0, 255);
                open.add(box);
            } else if (j == m.start[1] && i == m.start[0]) {
                box.shapeColor = color(0, 255, 0);
                open.add(box);
            } else if (j == m.end[1] && i == m.end[0]) {
                box.shapeColor = color(255, 0, 0);
                open.add(box);
            } else {
                if (m.grid[i][j] == 1) {
                    box.shapeColor = color(0);
                    walls.add(box);
                } else {
                    box.shapeColor = color(255);
                    open.add(box);
                }

            }
        }
    }

    player = createSprite(m.start[0] * 25 + 15, m.start[1] * 25 + 15, 15, 15);
}

function draw() {
    background(51);
    checkKeyPress();
    player.collide(walls);

    drawSprites();
}

function checkKeyPress() {
    if (keyDown('a')) {
        player.position.x -= 4;

    }
    if (keyDown('d')) {
        player.position.x += 4;

    }
    if (keyDown('w')) {
        player.position.y -= 4;

    }
    if (keyDown('s')) {
        player.position.y += 4;

    }
}