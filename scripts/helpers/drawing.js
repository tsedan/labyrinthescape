function drawMenuBackground() {
    const lineSize = scale / 4;
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

function updateVelocities() {
    const a = keyDown('a'), d = keyDown('d'), w = keyDown('w'), s = keyDown('s');

    if (a ? d : !d) {
        player.velocity.x *= friction / (friction + 1);
    } else if (a) {
        player.velocity.x = (friction * player.velocity.x - maxSpeed) / (friction + 1);
        orientation = 180;
    } else if (d) {
        player.velocity.x = (friction * player.velocity.x + maxSpeed) / (friction + 1);
        orientation = 0;
    }

    if (w ? s : !s) {
        player.velocity.y *= friction / (friction + 1);
    } else if (w) {
        player.velocity.y = (friction * player.velocity.y - maxSpeed) / (friction + 1);
        orientation = 270;
    } else if (s) {
        player.velocity.y = (friction * player.velocity.y + maxSpeed) / (friction + 1);
        orientation = 90;
    }
}

function drawBasicMenu(header, subtitle) {
    camera.position.x = windowWidth / 2;
    camera.position.y = windowHeight / 2;
    background(gameColors.wall);

    drawMenuBackground();

    noStroke();
    textFont(font);
    fill(255);

    const bottom = windowHeight;
    const left = 0;
    const pad = 20;

    textAlign(LEFT, BOTTOM);
    textSize(64);
    text(header, left + pad, bottom - pad - 32);
    textSize(32);
    text(subtitle, left + pad, bottom - pad);
}

function drawMaze(pX, pY) {
    const bX = max(pX - maxRenderDist - 1, 0), tX = min(pX + maxRenderDist + 1, m.W);
    const bY = max(pY - maxRenderDist - 1, 0), tY = min(pY + maxRenderDist + 1, m.H);
    for (let i = bY; i < tY; i++) {
        for (let j = bX; j < tX; j++) {
            const locX = (j + 0.5) * scale, locY = (i + 0.5) * scale;
            const hyp = dist(player.position.x, player.position.y, locX, locY);
            const imageArray = (m.grid[i][j] ? wallImages : floorImages);
            const maxHyp = maxRenderDist * scale;
            if (hyp > maxHyp) continue;
            image(imageArray[floor(99 * hyp / maxHyp)], locX, locY, scale, scale);
        }
    }
}


function drawInventory() {
    push();
    noStroke();
    rectMode(CORNER);

    const w = 200;
    const edgeX = 0, edgeY = windowHeight;
    const offset = ((windowHeight < windowWidth) ? windowHeight : windowWidth) / 20;
    const pad = 20;

    const topCorner = edgeX + offset, leftCorner = edgeY - w - offset - pad;

    fill(gameColors.inv);
    // so that it is aligned with the minimap
    rect(topCorner - minimapScale / 2, leftCorner - minimapScale / 2, w + minimapScale, w + minimapScale);

    fill(gameColors.minimap);
    rect(topCorner, leftCorner, w, w);

    if (heldItem && heldItem != null) {
        // draw item sprite
        rectMode(CENTER);
        fill(gameColors.power);
        rect(topCorner + w / 2, leftCorner + w / 2, scale, scale);

        fill(255);
        textAlign(CENTER, CENTER);
        textFont(font);
        textSize(32);
        text("PRESS Q TO DROP", topCorner + w / 2, leftCorner - pad);

        if (['Torch', 'Boot', 'GPS'].includes(heldItem.constructor.name)) {
            // items that are passive for some amount of time
            const weight = 2;
            const barWidth = 20;
            strokeWeight(weight);
            stroke(0);
            fill(gameColors.minimap);
            rect(topCorner + w / 2, leftCorner + w - barWidth, scale, barWidth);
            noStroke();

            let used = heldItem.timeAvailable / heldItem.maxTime;
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
            rect(topCorner + w / 2 - scale / 2 + weight / 2, leftCorner + w - barWidth * 1.5 + weight / 2, used * (scale - weight), barWidth - weight);
        }

        if (['GPS'].includes(heldItem.constructor.name)) {
            // powerups that are one time use
            fill(255)
            textAlign(CENTER, CENTER);
            text("PRESS [SPACE] TO USE", topCorner + w / 2, leftCorner + w + pad);
        }
    }

    pop();
}
