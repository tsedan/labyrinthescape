class Game {
    constructor() {
        randomSeed(mazeSeed);
        this.newMaze();
    }

    newMaze() {
        changeScale(correctScale());
        finishedPlayers = [];
        genMaze(mazeStartWidth + mazesStarted * mazeGrow, mazeStartHeight + mazesStarted * mazeGrow, holeProbability, powerUpNum);
        if (isDead) { spectatorMode() } else { normalMode() }

        for (let spr of allPlayers) {
            spr.visible = true;
            for (let dead of deadPlayers)
                if (spr == dead) spr.visible = false;
        }
    }

    update() {
        camera.position.x = (friction * camera.position.x + player.position.x) / (friction + 1);
        camera.position.y = (friction * camera.position.y + player.position.y) / (friction + 1);
        alertTime = Math.max(alertTime - alertRate, 0);

        updateAnimation();
        updateVelocities();

        for (let spr of allPlayers) {
            if (spr != player || !spectating) spr.collide(walls);
            spr.collide(border);
        }

        sendPositionData();

        if (spectating) {
            minimap.updateLoc(floor(player.position.x / scale), floor(player.position.y / scale));

            for (let p in powerups) powerups[p].draw();
        } else {
            player.overlap(monster, die);
            player.collide(exit, exitReached);
            minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

            for (let p in powerups) powerups[p].update();
        }
    }

    draw() {
        background(0);
        if (inEnding) {
            player.velocity.x = 0;
            player.velocity.y = 0;
            currentEndingTime -= deltaTime;
            if (currentEndingTime < renderDecreaseTimings[0]) {
                renderDecreaseTimings.shift();
                maxRenderDist--;

                if (maxRenderDist <= 0) {
                    gameState = "MENU";
                    menu.changeMenu(...endingMenu);
                    return;
                }
            }
        }

        drawMaze(floor(player.position.x / scale), floor(player.position.y / scale));

        if (!inEnding) this.update();

        drawSprite(exit);

        push();
        for (let plr of allPlayers) {
            if (!plr.visible) continue;
            const frame = plr.animation.getFrameImage().frame, plrSize = monster == plr ? scale : scale / 2;
            tint(255 * (1 - (dist(player.position.x, player.position.y, plr.position.x, plr.position.y) / (scale * maxRenderDist))));
            image(plr.animation.spriteSheet.image, plr.position.x, plr.position.y, plrSize, plrSize, frame.x, frame.y, frame.width, frame.height);
        }
        pop();

        textAlign(CENTER, BOTTOM);
        textFont(font);
        textSize(scale / 2);
        for (let k of Object.keys(playerPos)) {
            const plr = playerPos[k]; if (!plr.visible) continue;
            let spriteColorUse = plr == monster ? spriteColor["monster"] : spriteColor[idToSprite[k]];
            fill(lerpColor(color(spriteColorUse), color(0), dist(player.position.x, player.position.y, plr.position.x, plr.position.y) / (scale * maxRenderDist)));
            text(idToName[k], plr.position.x, plr.position.y - plr.height / 2);
        }

        camera.off();

        const alertFillColor = color(255);
        alertFillColor.setAlpha(alertTime);
        fill(alertFillColor);
        textFont(font);
        textAlign(CENTER, TOP);
        textSize(48 * fontSizeRatio);
        text(alertMsg, width / 2, uiPadding);

        minimap.draw();
        drawInventory();
    }
}
