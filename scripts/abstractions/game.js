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

        updateVelocitiesAndAnimation();

        prevPos = [player.position.x, player.position.y];

        for (let spr of allPlayers) {
            if (spr != player || !spectating) spr.collide(walls);
            spr.collide(border);
        }

        sendPositionData();

        if (isHost && !monsterDead) {
            allPlayers.overlap(monster, (spr1, _spr2) => {
                if (!spr1.visible) return;
                if (spr1 == player) {
                    die();
                } else {
                    spr1.visible = false;
                    deadPlayers.push(spr1);
                }

                let deadID = getKeyByValue(playerPos, spr1);
                if (deadID === undefined) deadID = getKeyByValue(cpus, spr1);

                for (let c of allConnections) {
                    if (c && c.open) {
                        c.send('die,' + deadID);
                    }
                }


                checkMazeCompletion();
            });
        }

        if (spectating) {
            minimap.updateLoc(floor(player.position.x / scale), floor(player.position.y / scale));

            for (let p in powerups) powerups[p].draw();
        } else {
            player.collide(exit, exitReached);
            minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

            for (let p in powerups) powerups[p].update();
        }
    }

    moveCPU(cpuID) {
        let ms = solvers[cpuID];
        if (!ms.withinOne(ms.solution[ms.solution.length - 1], m.end)) {
            let last = ms.solution[ms.solution.length - 1];
            let attract = [last[1] * scale + scale / 2, last[0] * scale + scale / 2];
            cpus[cpuID].attractionPoint(1, attract[0], attract[1]);

            let dist = Math.hypot(attract[0] - cpus[cpuID].position.x, attract[1] - cpus[cpuID].position.y);

            if (dist < scale) {
                ms.step();
            }
        } else {
            cpus[cpuID].attractionPoint(1, m.end[1] * scale + scale / 2, m.end[0] * scale + scale / 2);
            cpus[cpuID].collide(exit, cpuExit);
        }

        cpus[cpuID].limitSpeed(scale / trueMaxSpeed);
    }

    draw() {
        background(0);

        if (isHost) {
            for (let key of Object.keys(cpus)) {
                if (!finishedPlayers.includes(key)) this.moveCPU(key);
            }
        }

        if (isMonster && monsterDead) {
            camera.off();
            const alertFillColor = color(255);
            fill(alertFillColor);
            textFont(font);
            textAlign(CENTER, TOP);
            textSize(48 * fontSizeRatio);
            text("YOU WERE KILLED BY A PLAYER", width / 2, uiPadding);
            text("YOU WILL RESPAWN SOON", width / 2, uiPadding + 48 * fontSizeRatio);

            currentMonsterDeadTime -= deltaTime;
            if (currentMonsterDeadTime <= 0) {
                currentMonsterDeadTime = monsterDeadTime;
                monsterDead = false;
                sendMonsterState();
            }
            return;
        }

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

        for (let k of Object.keys(cpus)) {
            const plr = cpus[k]; if (!plr.visible) continue;
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
