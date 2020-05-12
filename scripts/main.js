let m;

let player;
let walls;
let open;
let exit;

let scale = 28;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);

    newMaze();

    camera.zoom = 1;
    camera.position.x = (m.H * scale - windowWidth) / 2 + (windowWidth / 2);
    camera.position.y = (m.W * scale - windowHeight) / 2 + (windowHeight / 2);
}

function newMaze() {
    m = new MazeGenerator(12, 20, 0.02, 5);
    m.generate();

    if (open) open.removeSprites();
    if (walls) walls.removeSprites();
    if (player) player.remove();
    if (exit) exit.remove();

    player = createSprite(m.start[0] * scale + scale/2, m.start[1] * scale + scale/2, scale/2, scale/2);

    open = new Group();
    let back = createSprite(m.H*scale/2,m.W*scale/2,m.H*scale,m.W*scale);
    back.shapeColor = color(255);
    open.add(back);

    walls = new Group();
    for (let i = 0; i < m.grid.length; i++) {
        for (let j = 0; j < m.grid[0].length; j++) {
            let box = createSprite(i * scale + scale/2, j * scale + scale/2, scale, scale);
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
                exit = box;
            } else {
                if (m.grid[i][j] == 1) {
                    box.shapeColor = color(0);
                    walls.add(box);
                } else { box.remove(); }
            }
        }
    }
}

function draw() {
    background(51);
    updateVelocities();
    player.collide(walls);
    player.collide(exit, newMaze);

    drawSprites(open);
    drawSprites(walls);
    drawSprite(exit);
    drawSprite(player);
}

function updateVelocities() {
    let a = keyDown('a'), d = keyDown('d'), w = keyDown('w'), s = keyDown('s');
    if (a ? d : !d) {
        player.velocity.x /= 1.5;
    } else if (a) {
        player.velocity.x = (player.velocity.x - 5) / 2;
    } else if (d) {
        player.velocity.x = (player.velocity.x + 5) / 2;
    }

    if (w ? s : !s) {
        player.velocity.y /= 1.5;
    } else if (w) {
        player.velocity.y = (player.velocity.y - 5) / 2;
    } else if (s) {
        player.velocity.y = (player.velocity.y + 5) / 2;
    }
}
