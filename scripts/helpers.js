function updateVelocities() {
    const a = keyDown('a'), d = keyDown('d'), w = keyDown('w'), s = keyDown('s');

    if (a ? d : !d) {
        player.velocity.x *= friction / (friction + 1);
    } else if (a) {
        player.velocity.x = (friction * player.velocity.x - maxSpeed) / (friction + 1);
    } else if (d) {
        player.velocity.x = (friction * player.velocity.x + maxSpeed) / (friction + 1);
    }

    if (w ? s : !s) {
        player.velocity.y *= friction / (friction + 1);
    } else if (w) {
        player.velocity.y = (friction * player.velocity.y - maxSpeed) / (friction + 1);
    } else if (s) {
        player.velocity.y = (friction * player.velocity.y + maxSpeed) / (friction + 1);
    }
}

function genObj(x, y, w, h, c) {
    const box = createSprite(x, y, w, h);
    box.shapeColor = c;
    //box.debug = true;
    return box;
}

function genMaze(w, h, holes, powerups) {
    mazesStarted++;
    m = new MazeGenerator(w, h, holes, powerups);
    m.generate();

    for (let spr of getSprites()) spr.remove();

    player = genObj((m.start[1]+0.5) * scale, (m.start[0]+0.5) * scale, scale / 2, scale / 2, gameColors.player);
    start = genObj((m.start[1]+0.5) * scale, (m.start[0]+0.5) * scale, scale, scale, gameColors.start);
    exit = genObj((m.end[1]+0.5) * scale, (m.end[0]+0.5) * scale, scale, scale, gameColors.end);

    walls = new Group();
    powerups = new Group();

    let singleSquares = new Set();

    for (let i = 0; i < m.grid.length; i++) {
        let rectangleLength = scale;
        let startX = 0, startY = scale * i;
        let colorRect = m.grid[i][0];

        for (let j = 0; j < m.grid[0].length; j++) {
            for (let k of m.powerLocs)
                if (j == k[1] && i == k[0])
                    powerups.add(genObj(scale * j + scale / 2, scale * i + scale / 2, scale, scale, gameColors.power));

            if (j < m.grid[0].length - 1) {
                if (m.grid[i][j + 1] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        if (colorRect == 1)
                            walls.add(genObj(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale, gameColors.wall));
                    } else {
                        singleSquares.add(startX + "," + startY);
                    }

                    rectangleLength = scale;
                    startX = scale * (j + 1);
                    colorRect = m.grid[i][j + 1];
                }
            } else {
                if (rectangleLength != scale) {
                    if (colorRect == 1)
                        walls.add(genObj(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale, gameColors.wall));
                } else {
                    singleSquares.add(startX + "," + startY);
                }
            }
        }
    }

    for (let j = 0; j < m.grid[0].length; j++) {
        let rectangleLength = scale;
        let startX = scale * j, startY = 0;
        let colorRect = m.grid[0][j];

        for (let i = 0; i < m.grid.length; i++) {
            if (i < m.grid.length - 1) {
                if (m.grid[i + 1][j] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        if (colorRect == 1)
                            walls.add(genObj(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength, gameColors.wall));
                    } else {
                        if (singleSquares.has(startX + "," + startY)) {
                            walls.add(genObj(startX + scale / 2, startY + scale / 2, scale, scale, gameColors.wall));
                        }
                    }

                    rectangleLength = scale;
                    startY = scale * (i + 1);
                    colorRect = m.grid[i + 1][j];
                }
            } else {
                if (rectangleLength != scale) {
                    if (colorRect == 1)
                        walls.add(genObj(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength, gameColors.wall));
                } else {
                    if (singleSquares.has(startX + "," + startY)) {
                        walls.add(genObj(startX + scale / 2, startY + scale / 2, scale, scale, gameColors.wall));
                    }
                }
            }
        }
    }

    walls.add(genObj(m.W * scale / 2, -scale / 2, (m.W+2) * scale, scale, gameColors.wall));
    walls.add(genObj(m.W * scale / 2, m.H * scale + scale / 2, (m.W+2) * scale, scale, gameColors.wall));
    walls.add(genObj(-scale / 2, m.H * scale / 2, scale, m.H * scale, gameColors.wall));
    walls.add(genObj(m.W * scale + scale / 2, m.H * scale / 2, scale, m.H * scale, gameColors.wall));

    minimap = new Minimap();
}

function newMaze() {
    genMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, holeProbability, powerUpNum);
}

function createMask() {
    noStroke();
    fill(0)

    beginShape();
    vertex(0, 0);
    vertex(width / 2, 0);
    vertex(width / 2, height / 2 - viewRadius);
    bezierVertex(width / 2 - viewRadius * circularApprox, height / 2 - viewRadius, width / 2 - viewRadius * circularApprox, height / 2 + viewRadius, width / 2, height / 2 + viewRadius);
    vertex(width / 2, height);
    vertex(0, height);
    endShape();

    beginShape();
    vertex(width, 0);
    vertex(width / 2, 0);
    vertex(width / 2, height / 2 - viewRadius);
    bezierVertex(width / 2 + viewRadius * circularApprox, height / 2 - viewRadius, width / 2 + viewRadius * circularApprox, height / 2 + viewRadius, width / 2, height / 2 + viewRadius);
    vertex(width / 2, height);
    vertex(width, height);
    endShape();
}
