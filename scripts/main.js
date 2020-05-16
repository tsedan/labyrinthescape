function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(60);
    newMaze();
}

function draw() {
    background(gameColors.wall);

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
    drawSprites(powerups);

    drawSprite(exit);
    drawSprite(start);
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
