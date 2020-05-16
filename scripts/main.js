let m;

let player;
let walls;
let open;
let start;
let exit;
let powerups;

let scale = 120;

const numberOfMazes = 3;
const mazeStartWidth = 10;
const mazeStartHeight = 12;

let mazesStarted = 0;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(60);

    newMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, 0.02, 6);
}

function newMaze(w, h, holes, numPowerups) {
    mazesStarted++;
    m = new MazeGenerator(w, h, holes, numPowerups);
    m.generate();

    if (open) open.removeSprites();
    if (walls) walls.removeSprites();
    if (player) player.remove();
    if (exit) exit.remove();

    player = createSprite(m.start[1] * scale + scale / 2, m.start[0] * scale + scale / 2, scale / 2, scale / 2);

    start = createSprite(m.start[1] * scale + scale / 2, m.start[0] * scale + scale / 2, scale, scale);
    start.shapeColor = color(0, 255, 0);

    exit = createSprite(m.end[1] * scale + scale / 2, m.end[0] * scale + scale / 2, scale, scale);
    exit.shapeColor = color(255, 0, 0);

    open = new Group();
    walls = new Group();
    powerups = new Group();

    let singleSquares = new Set();

    for (let i = 0; i < m.grid.length; i++) {
        let rectangleLength = scale;
        let startX = 0;
        let startY = scale * i;
        let colorRect = m.grid[i][0];
        for (let j = 0; j < m.grid[0].length; j++) {
            let isPower = false;
            for (let k of m.powerLocs)
                if (j == k[1] && i == k[0])
                    isPower = true;

            if (isPower) {
                let box = createSprite(scale * j + scale / 2, scale * i + scale / 2, scale, scale);
                box.shapeColor = color(0, 0, 255);
                powerups.add(box)
            }

            if (j < m.grid[0].length - 1) {
                if (m.grid[i][j + 1] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        let box = createSprite(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale);
                        if (colorRect == 1) {
                            box.shapeColor = color(0);
                            walls.add(box)
                        } else {
                            box.shapeColor = color(255);
                            open.add(box)
                        }
                    } else {
                        singleSquares.add(startX + "," + startY)
                    }

                    rectangleLength = scale;
                    startX = scale * (j + 1);
                    colorRect = m.grid[i][j + 1];
                }
            } else {
                if (rectangleLength != scale) {
                    let box = createSprite(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale);
                    if (colorRect == 1) {
                        box.shapeColor = color(0);
                        walls.add(box)
                    } else {
                        box.shapeColor = color(255);
                        open.add(box)
                    }
                } else {
                    singleSquares.add(startX + "," + startY)
                }
            }
        }
    }

    for (let j = 0; j < m.grid[0].length; j++) {
        let rectangleLength = scale;

        let startX = scale * j;
        let startY = 0;
        let colorRect = m.grid[0][j];
        for (let i = 0; i < m.grid.length; i++) {
            if (i < m.grid.length - 1) {
                if (m.grid[i + 1][j] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        let box = createSprite(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength);
                        if (colorRect == 1) {
                            box.shapeColor = color(0);
                            walls.add(box)
                        } else {
                            box.shapeColor = color(255);
                            open.add(box)
                        }
                    } else {
                        if (singleSquares.has(startX + "," + startY)) {
                            let box = createSprite(startX + scale / 2, startY + scale / 2, scale, scale);
                            box.shapeColor = color(0);
                            walls.add(box)
                        }
                    }

                    rectangleLength = scale;
                    startY = scale * (i + 1);
                    colorRect = m.grid[i + 1][j];
                }
            } else {
                if (rectangleLength != scale) {
                    let box = createSprite(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength);

                    if (colorRect == 1) {
                        box.shapeColor = color(0);
                        walls.add(box)
                    } else {
                        box.shapeColor = color(255);
                        open.add(box)
                    }
                } else {
                    if (singleSquares.has(startX + "," + startY)) {
                        let box = createSprite(startX + scale / 2, startY + scale / 2, scale, scale);
                        box.shapeColor = color(0);
                        walls.add(box)
                    }
                }
            }
        }
    }

    const topBox = createSprite(m.W * scale / 2, -scale / 2, m.W * scale, scale);
    topBox.shapeColor = color(0);
    walls.add(topBox);

    const bottomBox = createSprite(m.W * scale / 2, m.H * scale + scale / 2, m.W * scale, scale);
    bottomBox.shapeColor = color(0);
    walls.add(bottomBox);

    const leftBox = createSprite(-scale / 2, m.H * scale / 2, scale, m.H * scale);
    leftBox.shapeColor = color(0);
    walls.add(leftBox);

    const rightBox = createSprite(m.W * scale + scale / 2, m.H * scale / 2, scale, m.H * scale);
    rightBox.shapeColor = color(0);
    walls.add(rightBox);
}

function newMazeAfterFinish() {
    newMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, 0.02, 6);
}

function draw() {
    background(0);

    if (mazesStarted > numberOfMazes) {
        return;
    }

    camera.position.x = ((4 * camera.position.x + player.position.x + windowWidth / 2) / 5);
    camera.position.y = ((4 * camera.position.y + player.position.y + windowHeight / 2) / 5);

    ambientLight(0);
    spotLight(255, 255, 255, 0, 0, 1500, 0, 0, -1);

    updateVelocities();
    player.collide(walls);
    player.collide(exit, newMazeAfterFinish);

    drawSprites(open);
    drawSprites(walls);
    drawSprites(powerups);

    drawSprite(exit);
    drawSprite(start);
    drawSprite(player);
}

function wallFriction() {
    player.velocity.x /= 1.1;
    player.velocity.y /= 1.1;
}

function updateVelocities() {
    let a = keyDown('a'), d = keyDown('d'), w = keyDown('w'), s = keyDown('s');
    if (a ? d : !d) {
        player.velocity.x /= 1.2;
    } else if (a) {
        player.velocity.x = (9 * player.velocity.x - 12) / 10;
    } else if (d) {
        player.velocity.x = (9 * player.velocity.x + 12) / 10;
    }

    if (w ? s : !s) {
        player.velocity.y /= 1.2;
    } else if (w) {
        player.velocity.y = (9 * player.velocity.y - 12) / 10;
    } else if (s) {
        player.velocity.y = (9 * player.velocity.y + 12) / 10;
    }
}