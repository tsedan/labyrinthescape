function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(60);

    newMaze();
}

function genMaze(w, h, holes, powerups) {
    mazesStarted++;
    m = new MazeGenerator(w, h, holes, powerups);
    m.generate();

    if (open) open.removeSprites();
    if (walls) walls.removeSprites();
    if (player) player.remove();
    if (exit) exit.remove();

    player = createSprite((m.start[0]+0.5)*scale, (m.start[1]+0.5)*scale, scale/2, scale/2);
    player.shapeColor = color(...gameColors.player);

    open = new Group();
    const back = createSprite(m.H*scale/2, m.W*scale/2, m.H*scale, m.W*scale);
    back.shapeColor = color(...gameColors.back);
    open.add(back);

    walls = new Group();
    for (let i = 0; i < m.H; i++) {
        for (let j = 0; j < m.W; j++) {
            const box = createSprite((i+0.5) * scale, (j+0.5) * scale, scale, scale);
            let isPower = false;
            for (let k of m.powerLocs)
                if (j == k[1] && i == k[0])
                    isPower = true;

            if (isPower) {
                box.shapeColor = color(...gameColors.power);
                open.add(box);
            } else if (j == m.start[1] && i == m.start[0]) {
                box.shapeColor = color(...gameColors.start);
                open.add(box);
            } else if (j == m.end[1] && i == m.end[0]) {
                box.shapeColor = color(...gameColors.end);
                exit = box;
            } else {
                if (m.grid[i][j] == 1) {
                    box.shapeColor = color(...gameColors.wall);
                    walls.add(box);
                } else { box.remove(); }
            }
        }

    }

    const topBox = createSprite(m.H*scale/2, -scale/2, (m.H+2)*scale, scale);
    topBox.shapeColor = color(...gameColors.wall);
    walls.add(topBox);

    const bottomBox = createSprite(m.H*scale/2, (m.W+0.5)*scale, (m.H+2)*scale, scale);
    bottomBox.shapeColor = color(...gameColors.wall);
    walls.add(bottomBox);

    const leftBox = createSprite(-scale/2, m.W*scale/2, scale, m.W*scale);
    leftBox.shapeColor = color(...gameColors.wall);
    walls.add(leftBox);

    const rightBox = createSprite((m.H+0.5)*scale, m.W*scale/2, scale, m.W*scale);
    rightBox.shapeColor = color(...gameColors.wall);
    walls.add(rightBox);

    minimap = new Minimap();
}

function newMaze() {
    genMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, holeProbability, powerUpNum);
}

function draw() {
    background(...gameColors.wall);

    if (mazesStarted > numberOfMazes) return;

    camera.position.x = player.position.x + windowWidth/2;
    camera.position.y = player.position.y + windowHeight/2;

    ambientLight(0);
    spotLight(255, 255, 255, 0, 0, lightBrightness, 0, 0, -1);

    updateVelocities();
    player.collide(walls);
    player.collide(exit, newMaze);
    minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

    drawSprites(open);
    drawSprites(walls);
    drawSprite(exit);
    drawSprite(player);
    minimap.draw();
}

function updateVelocities() {
    let a = keyDown('a'), d = keyDown('d'), w = keyDown('w'), s = keyDown('s');
    if (a ? d : !d) {
        player.velocity.x *= playerFriction / (playerFriction + 1);
    } else if (a) {
        player.velocity.x = (playerFriction * player.velocity.x - playerMaxSpeed) / (playerFriction + 1);
    } else if (d) {
        player.velocity.x = (playerFriction * player.velocity.x + playerMaxSpeed) / (playerFriction + 1);
    }

    if (w ? s : !s) {
        player.velocity.y *= playerFriction / (playerFriction + 1);
    } else if (w) {
        player.velocity.y = (playerFriction * player.velocity.y - playerMaxSpeed) / (playerFriction + 1);
    } else if (s) {
        player.velocity.y = (playerFriction * player.velocity.y + playerMaxSpeed) / (playerFriction + 1);
    }
}
