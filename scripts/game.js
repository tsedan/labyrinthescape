class Game {
    constructor() {
        this.newMaze();
    }

    newMaze() {
        genMaze(mazeStartWidth, mazeStartHeight, holeProbability, powerUpNum, mazeSeed);
    }

    draw() {
        background(gameColors.wall);

        if (mazesStarted > numberOfMazes) return;

        camera.position.x = (friction * camera.position.x + player.position.x + windowWidth / 2) / (friction + 1);
        camera.position.y = (friction * camera.position.y + player.position.y + windowHeight / 2) / (friction + 1);

        ambientLight(0);
        spotLight(255, 255, 255, 0, 0, 1500, 0, 0, -1);

        updateVelocities();
        player.collide(walls);
        player.collide(exit, this.newMaze);
        minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprite(backMaze);
        drawSprites(walls);

        drawSprites(powerups);

        drawSprite(exit);
        drawSprite(start);
        drawSprite(player);


        camera.off();
        //createMask();
        minimap.draw();
    }
}
