let player;
let walls;
let open;
let exit;

function setup() {
    createCanvas(windowWidth, windowHeight);
    player = createSprite(0, 0, 15, 15);
    newMaze();
}

function draw() {
    background(51);
    checkKeyPress();
    player.collide(walls);
    player.collide(exit, newMaze)



    drawSprites(walls);
    drawSprites(open);
    drawSprite(player);
}

function newMaze() {
    player.position.x = 0;
    player.position.y = 0;

    m = new MazeGenerator(12, 20, 0.02, 5);
    m.generate();

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
                exit = box;
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

    player.position.x = m.start[0] * 25 + 15;
    player.position.y = m.start[1] * 25 + 15;
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