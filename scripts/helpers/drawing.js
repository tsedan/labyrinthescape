function changeScale(newScale) {
    for (let spr of getSprites()) {
        spr.position.x *= newScale / scale;
        spr.position.y *= newScale / scale;
        spr.velocity.x *= newScale / scale;
        spr.velocity.y *= newScale / scale;
        spr.width *= newScale / scale;
        spr.height *= newScale / scale;
    }
    scale = newScale;

    if (m) minimapScale = (min(windowWidth, windowHeight) * minimapPercent) / max(m.H, m.W);
}

function controlPressed() {
    return keyIsDown(17) || keyIsDown(91) || keyIsDown(224) || keyIsDown(93);
}

function spectatorMode() {
    minimap.revealAll();
    player.visible = false;
    maxRenderDist = trueMaxRenderDist * 4;
    maxSpeed = spectatorMaxSpeed;
    heldItem = null;
    spectating = true;
    changeScale(correctScale() / 2);
}

function normalMode() {
    minimap.reset();
    player.visible = true;
    maxRenderDist = trueMaxRenderDist;
    if (isMonster) maxRenderDist = 6 * trueMaxRenderDist / 4;
    maxSpeed = trueMaxSpeed;
    heldItem = null;
    spectating = false;
    changeScale(correctScale());
}

function drawMenuBackground() {
    const lineSize = originalScale / 4;
    const radius = windowWidth / 2;
    const mX = cos(frameCount / 16) * radius;
    const mY = sin(frameCount / 16) * radius;
    strokeWeight(5);
    stroke(40);

    for (let i = -windowWidth; i < 2 * windowWidth; i += lineSize) {
        for (let j = -windowHeight; j < 2 * windowHeight; j += lineSize) {
            const xLoc = i - mX, yLoc = j - mY;
            if (xLoc >= -lineSize && xLoc <= windowWidth + lineSize && yLoc >= -lineSize && yLoc <= windowHeight + lineSize)
                round(noise(i, j)) ? line(xLoc, yLoc, xLoc + lineSize, yLoc + lineSize) : line(xLoc + lineSize, yLoc, xLoc, yLoc + lineSize);
        }
    }
}

function positiveMod(i, n) {
    return (i % n + n) % n;
}

function updateAnimation() {
    dir = positiveMod(round(player.getDirection() / 90) * 90, 360)

    switch (dir) {
        case 0:
            player.changeAnimation('walk_right');
            break;
        case 90:
            player.changeAnimation('walk_front');
            break;
        case 180:
            player.changeAnimation('walk_left');
            break;
        case 270:
            player.changeAnimation('walk_back');
            break;
    }
}

function updateVelocities() {
    const a = keyDown('a'), d = keyDown('d'), w = keyDown('w'), s = keyDown('s');

    if (a ? d : !d) {
        player.velocity.x *= friction / (friction + 1);
    } else if (a) {
        player.velocity.x = (friction * player.velocity.x - (scale / maxSpeed)) / (friction + 1);
        orientation = 180;
        //player.changeAnimation('walk_left');
    } else if (d) {
        player.velocity.x = (friction * player.velocity.x + (scale / maxSpeed)) / (friction + 1);
        orientation = 0;
        //player.changeAnimation('walk_right');
    }

    if (w ? s : !s) {
        player.velocity.y *= friction / (friction + 1);
    } else if (w) {
        player.velocity.y = (friction * player.velocity.y - (scale / maxSpeed)) / (friction + 1);
        orientation = 270;
        //player.changeAnimation('walk_back');
    } else if (s) {
        player.velocity.y = (friction * player.velocity.y + (scale / maxSpeed)) / (friction + 1);
        orientation = 90;
        //player.changeAnimation('walk_front');
    }
}

function drawBasicMenu(header, subtitle, upper) {
    camera.position.x = windowWidth / 2;
    camera.position.y = windowHeight / 2;
    background(gameColors.wall);

    drawMenuBackground();

    noStroke();
    textFont(font);
    fill(255);

    const bottom = windowHeight;
    const left = 0;

    textAlign(LEFT, BOTTOM);
    textSize(64 * fontSizeRatio);
    text(header, left + uiPadding * fontSizeRatio, bottom - (uiPadding + 32) * fontSizeRatio);
    textSize(32 * fontSizeRatio);
    text(subtitle, left + uiPadding * fontSizeRatio, bottom - uiPadding * fontSizeRatio);

    textAlign(LEFT, TOP);
    textSize(48 * fontSizeRatio);
    for (let i = 0; i < upper.length; i++) {
        text(upper[i], uiPadding * fontSizeRatio, (uiPadding + i * 48) * fontSizeRatio);
    }

    if (menu.state == tutorialMenu[0]) {
        // ratio of pages is 7:5
        const imageHeight = windowHeight * 0.7;
        image(tutorialPages[currentTutorialPage], windowWidth / 2, imageHeight / 2, imageHeight / 5 * 7, imageHeight)
    }
}

function drawMaze(pX, pY) {
    const bX = max(pX - maxRenderDist - 1, 0), tX = min(pX + maxRenderDist + 1, m.W);
    const bY = max(pY - maxRenderDist - 1, 0), tY = min(pY + maxRenderDist + 1, m.H);
    const maxHyp = maxRenderDist * scale;
    for (let i = bY; i < tY; i++) {
        for (let j = bX; j < tX; j++) {
            const locX = (j + 0.5) * scale, locY = (i + 0.5) * scale;
            const hyp = dist(player.position.x, player.position.y, locX, locY);
            if (m.start[0] == i && m.start[1] == j && hyp <= maxHyp) {
                push();
                translate(locX, locY);
                rotate(startRotation);
                image(allAssets.start[floor((100 / lightInt) * (hyp / maxHyp))], 0, 0, scale, scale);
                pop();
            } else {
                const imageArray = (m.grid[i][j] ? allAssets.wall : allAssets.floor);
                if (hyp <= maxHyp) image(imageArray[floor((100 / lightInt) * (hyp / maxHyp))], locX, locY, scale, scale);
            }
        }
    }
}

function drawInventory() {
    push();
    noStroke();
    rectMode(CORNER);

    const w = min(windowWidth, windowHeight) * minimapPercent;
    const edgeX = 0, edgeY = windowHeight;

    const topCorner = edgeX + uiPadding, leftCorner = edgeY - w - uiPadding;

    fill(gameColors.inv);
    rect(topCorner - minimapScale, leftCorner - minimapScale, w + 2 * minimapScale, w + 2 * minimapScale);

    fill(gameColors.minimap);
    rect(topCorner, leftCorner, w, w);

    if (heldItem && heldItem != null) {
        image(allAssets[heldItem.asset][0], topCorner + w / 2, leftCorner + w / 2, w * 0.5, w * 0.5);

        fill(255);
        textAlign(CENTER, CENTER);
        textFont(font);
        textSize(32 * fontSizeRatio);

        if (heldItem.used < 2)
            text("[Q] TO DROP", topCorner + w / 2, leftCorner - uiPadding);

        if (['Torch', 'Boot', 'GPS', 'Hammer'].includes(heldItem.constructor.name)) {
            // items that are passive for some amount of time
            const weight = 2;
            const barWidth = w * 0.1;
            strokeWeight(weight);
            stroke(0);
            fill(gameColors.minimap);
            const width = w * 0.8;
            rectMode(CENTER)
            rect(topCorner + w / 2, leftCorner + w * 0.85, width, barWidth);
            noStroke();

            const used = heldItem.timeAvailable / heldItem.maxTime;
            let inter;
            if (used > 0.5) {
                // green -> yellow, reversed because going opposite
                inter = lerpColor(color(255, 255, 0), color(0, 255, 0), 2 * used - 1);
            } else {
                // yellow -> red, reversed because going opposite
                inter = lerpColor(color(255, 0, 0), color(255, 255, 0), used * 2);
            }

            fill(inter);
            rectMode(CORNER);
            rect(topCorner + w / 2 - width / 2 + weight / 2, leftCorner + w * 0.85 - barWidth / 2 + weight / 2, used * (width - weight), barWidth - weight);
        }

        if (heldItem.used < 2 && ['GPS', 'Flare', 'Hammer', 'ThrowingKnife', 'Boot', 'Torch'].includes(heldItem.constructor.name)) {
            // powerups that are one time use
            fill(255);
            textAlign(CENTER, CENTER);
            text("[SPACE] TO " + heldItem.useVerb, topCorner + w / 2, leftCorner - uiPadding - 32);
        }
    }

    pop();
}
