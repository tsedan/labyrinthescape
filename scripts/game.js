class Game {
    constructor() {
        this.newMaze();
    }

    newMaze() {
        genMaze(mazeStartWidth, mazeStartHeight, holeProbability, powerUpNum, mazeSeed);
    }

    draw() {
        sendPositionData();
        background(0);

        if (mazesStarted > numberOfMazes) return;

        camera.position.x = (friction * camera.position.x + player.position.x) / (friction + 1);
        camera.position.y = (friction * camera.position.y + player.position.y) / (friction + 1);

        updateVelocities();
        allPlayers.collide(walls);
        player.collide(exit, this.newMaze);
        minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprite(backMaze);
        drawMaze(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprites(powerups);

        drawSprite(exit);
        drawSprite(start);

        drawSprites(allPlayers);

        camera.off();
        minimap.draw();
    }
}
