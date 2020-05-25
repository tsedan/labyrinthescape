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
        player.overlap(monster, function () {
            if (isMonster) die();
        });
        player.collide(exit, this.newMaze);
        minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprite(backMaze);
        drawMaze(floor(player.position.x / scale), floor(player.position.y / scale));

        for (let p in powerups) {
            powerups[p].update();
        }

        drawSprite(exit);
        drawSprite(start);

        drawSprites(allPlayers);

        textAlign(CENTER, BOTTOM);
        fill(gameColors.player)
        textFont(font);
        textSize(32);
        for (let k of Object.keys(playerPos)) {
            let p = playerPos[k];
            text(idToName[k], p.position.x, p.position.y - p.width / 2 - 10);
        }

        camera.off();
        minimap.draw();
    }
}
