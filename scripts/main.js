function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(desiredFPS);
    newMaze();
}

function draw() {
    background(gameColors.back);

    if (mazesStarted > numberOfMazes) return;

    camera.position.x = (friction * camera.position.x + player.position.x + windowWidth/2) / (friction + 1);
    camera.position.y = (friction * camera.position.y + player.position.y + windowHeight/2) / (friction + 1);

    // camera.position.x = (friction * camera.position.x + player.position.x) / (friction + 1);
    // camera.position.y = (friction * camera.position.y + player.position.y) / (friction + 1);

    updateVelocities();
    player.collide(walls);
    player.collide(exit, newMaze);
    minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

    drawSprites(walls);
    drawSprites(powerups);

    drawSprite(exit);
    drawSprite(start);
    drawSprite(player);

    camera.off();
    //createMask();
    minimap.draw();
}
