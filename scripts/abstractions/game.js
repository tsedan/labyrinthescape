class Game {
    constructor() {
        randomSeed(mazeSeed);
        this.newMaze();
    }

    newMaze() {
        finishedPlayers = [];
        genMaze(mazeStartWidth, mazeStartHeight, holeProbability, powerUpNum);
        if (isDead) { spectatorMode() } else { normalMode() }
    }

    update() {
        camera.position.x = (friction * camera.position.x + player.position.x) / (friction + 1);
        camera.position.y = (friction * camera.position.y + player.position.y) / (friction + 1);

        alertTime = Math.max(alertTime-alertRate,0);

        updateVelocities();

        for (let spr of allPlayers) {
            if (spr != player || !spectating) spr.collide(walls);
            spr.collide(border);
        }

        if (spectating) {
            minimap.updateLoc(floor(player.position.x / scale), floor(player.position.y / scale));

            for (let p in powerups) powerups[p].draw();
        } else {
            player.overlap(monster, die);
            player.collide(exit, exitReached);
            minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));
            sendPositionData();

            for (let p in powerups) powerups[p].update();
        }
    }

    draw() {
        background(0);

        drawMaze(floor(player.position.x / scale), floor(player.position.y / scale));

        this.update();

        drawSprite(exit);
        drawSprite(start);

        drawSprites(allPlayers);

        textAlign(CENTER, BOTTOM);
        fill(gameColors.player)
        textFont(font);
        textSize(32);
        for (let k of Object.keys(playerPos)) {
            if (!playerPos[k].visible) continue;
            text(idToName[k], playerPos[k].position.x, playerPos[k].position.y - playerPos[k].width / 2 - 10);
        }

        camera.off();

        const alertFillColor = color(255);
        alertFillColor.setAlpha(alertTime);
        fill(alertFillColor);
        textFont(font);
        textAlign(CENTER, TOP);
        textSize(48);
        text(alertMsg, width / 2, uiPadding);

        minimap.draw();
        drawInventory();
    }
}
