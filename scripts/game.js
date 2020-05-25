class Game {
    constructor() {
        this.newMaze();
    }

    newMaze() {
        genMaze(mazeStartWidth, mazeStartHeight, holeProbability, powerUpNum, mazeSeed);
    }

    draw() {
        if (!isDead) sendPositionData();
        background(0);

        if (mazesStarted > numberOfMazes) return;

        camera.position.x = (friction * camera.position.x + player.position.x) / (friction + 1);
        camera.position.y = (friction * camera.position.y + player.position.y) / (friction + 1);

        updateVelocities();
        for (let spr of allPlayers) {
            if (spr == player && isDead) continue;
            spr.collide(walls);
        }
        player.overlap(monster, die);
        player.collide(exit, this.newMaze);
        if (!isDead || !player.overlap(walls)) minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprite(backMaze);
        drawMaze(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprites(powerups);

        drawSprite(exit);
        drawSprite(start);

        drawSprites(allPlayers);

        textAlign(CENTER, BOTTOM);
        fill(gameColors.player)
        textFont(font);
        textSize(32);
        for (let k of Object.keys(playerPos)) {
            let p = playerPos[k];
            if (!p.visible) continue;
            text(idToName[k], p.position.x, p.position.y - p.width / 2 - 10);
        }

        camera.off();
        minimap.draw();
    }
}
