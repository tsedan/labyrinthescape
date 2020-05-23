function drawMenuBackground() {
    const lineSize = scale / 4;
    const radius = scale;
    angleMode(DEGREES);
    const mX = cos(frameCount)*radius;
    const mY = sin(frameCount)*radius;

    for (let i = -windowWidth; i < 2*windowWidth; i += lineSize) {
        for (let j = -windowHeight; j < 2*windowHeight; j += lineSize) {
            stroke(40);
            strokeWeight(5);
            round(noise(i, j)) ? line(i - mX, j - mY, i - mX + lineSize, j - mY + lineSize) : line(i - mX + lineSize, j - mY, i - mX, j - mY + lineSize);
        }
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
