function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    newMaze();
}

function draw() {
    background(gameColors.wall);

    if (mazesStarted > numberOfMazes) return;

    camera.position.x = player.position.x;
    camera.position.y = player.position.y;

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

    camera.off();
    createMask();
    minimap.draw();
}
