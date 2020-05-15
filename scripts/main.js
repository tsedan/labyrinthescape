let m;

let player;
let walls;
let open;
let exit;
let minimap;

let scale = 120;

const numberOfMazes = 3;
const mazeStartWidth = 12;
const mazeStartHeight = 20;

let mazesStarted = 0;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(60);

    newMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, 0.02, 6);
}

function newMaze(w, h, holes, powerups) {
    mazesStarted++;
    m = new MazeGenerator(w, h, holes, powerups);
    m.generate();

    if (open) open.removeSprites();
    if (walls) walls.removeSprites();
    if (player) player.remove();
    if (exit) exit.remove();

    player = createSprite(m.start[0] * scale + scale / 2, m.start[1] * scale + scale / 2, scale / 2, scale / 2);

    open = new Group();
    let back = createSprite(m.H * scale / 2, m.W * scale / 2, m.H * scale, m.W * scale);
    back.shapeColor = color(255);
    open.add(back);

    walls = new Group();
    for (let i = 0; i < m.grid.length; i++) {
        for (let j = 0; j < m.grid[0].length; j++) {
            let box = createSprite(i * scale + scale / 2, j * scale + scale / 2, scale, scale);
            box.immovable = true;
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

    const topBox = createSprite(m.H*scale/2-1000,-1000,m.H*scale+2000,2000);
    topBox.shapeColor = color(0);
    walls.add(topBox);

    const bottomBox = createSprite(m.H*scale/2-1000,m.W*scale+1000,m.H*scale+2000,2000);
    bottomBox.shapeColor = color(0);
    walls.add(bottomBox);

    const leftBox = createSprite(-1000,m.W*scale/2,2000,m.W*scale);
    leftBox.shapeColor = color(0);
    walls.add(leftBox);

    const rightBox = createSprite(m.H*scale+1000,m.W*scale/2,2000,m.W*scale);
    rightBox.shapeColor = color(0);
    walls.add(rightBox);

    minimap = new Minimap(m);
}

function newMazeAfterFinish() {
    newMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, 0.02, 6);
}

function draw() {
    background(51);

    if (mazesStarted > numberOfMazes) {
        return;
    }

    camera.position.x = ((4 * camera.position.x + player.position.x + windowWidth / 2) / 5);
    camera.position.y = ((4 * camera.position.y + player.position.y + windowHeight / 2) / 5);

    ambientLight(0);
    spotLight(255, 255, 255, 0, 0, 1500, 0, 0, -1);

    updateVelocities();
    player.collide(walls, wallFriction);
    player.collide(exit, newMaze);

    drawSprites(open);
    drawSprites(walls);
    drawSprite(exit);
    drawSprite(player);
    minimap.draw();
}

function wallFriction() {
    player.velocity.x /= 1.8;
    player.velocity.y /= 1.8;
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
