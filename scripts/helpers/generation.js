function startGame() {
    game = new Game();
    gameState = "GAME";
    camera.position.x = player.position.x;
    camera.position.y = player.position.y;
    changeScale(correctScale());
    if (isMonster) newAlert("YOU ARE THE MONSTER, HUNT THE PLAYERS!");
    else newAlert("YOU ARE A PLAYER, ESCAPE THE MAZE!");
}

function correctScale() {
    const smallerDim = (windowWidth < windowHeight ? windowWidth : windowHeight);
    return (isMonster ? round(smallerDim / 12) : round(smallerDim / 8));
}

function someoneCompleted(id) {
    if (id == myID) {
        spectatorMode();
        newAlert("YOU EXITED THE MAZE. WAIT FOR YOUR PARTYMATES TO CATCH UP");
    } else {
        playerPos[id].visible = false;
        newAlert(idToName[id] + " COMPLETED THE MAZE!");
    }
}

function cpuCompleted(id) {
    cpus[id].visible = false;
    newAlert(idToName[id] + " COMPLETED THE MAZE!");
}

function newAlert(msg) {
    alertMsg = msg;
    alertTime = alertMaxTime;
}

function genObj(x, y, w, h, c) {
    const box = createSprite(x, y, w, h);
    box.setDefaultCollider();
    box.shapeColor = c;
    return box;
}

function genMaze(w, h, holes, numPowerups) {
    mazesStarted++;
    m = new MazeGenerator(w, h, holes, numPowerups);
    m.generate();

    for (const key of Object.keys(cpus)) {
        solvers[key] = new MazeSolver(m);
    }

    minimapScale = (min(windowWidth, windowHeight) * minimapPercent) / max(m.H, m.W);

    for (const p of allPlayers) {
        p.position.x = (m.start[1] + 0.5) * scale;
        p.position.y = (m.start[0] + 0.5) * scale;
    }

    while (true) {
        let cR = floor(random() * (m.H - 2)) + 1;
        let cC = floor(random() * (m.W - 2)) + 1;
        if (m.grid[cR][cC] == 1) continue;

        let d = Math.hypot(cR - m.start[0], cC - m.start[1])
        if (d < max(m.h, m.w)) continue;

        originalMonsterLoc[0] = (cC + 0.5) * scale;
        originalMonsterLoc[1] = (cR + 0.5) * scale;

        monster.position.x = originalMonsterLoc[0];
        monster.position.y = originalMonsterLoc[1];
        break;
    }

    if (m.start[0] == 0) startRotation = 90;
    else if (m.start[0] == m.H - 1) startRotation = 270;
    else if (m.start[1] == 0) startRotation = 0;
    else startRotation = 180;

    exit = genObj((m.end[1] + 0.5) * scale, (m.end[0] + 0.5) * scale, scale, scale, gameColors.end);

    walls = new Group();

    powerupsInUse = [];

    powerups = [
        new Boot(genObj(0, 0, scale / 2, scale / 2, gameColors.power), 20 * 1000, 1.5),
        new Torch(genObj(0, 0, scale / 2, scale / 2, gameColors.power), 20 * 1000, 2),
        new GPS(genObj(0, 0, scale / 2, scale / 2, gameColors.power), 5 * 1000),
        new Flare(genObj(0, 0, scale / 2, scale / 2, gameColors.power), 10 * 1000),
        new Hammer(genObj(0, 0, scale / 2, scale / 2, gameColors.power), 2),
    ];

    shuffleArray(powerups);
    powerups = powerups.slice(0, m.powerLocs.length - 1);
    powerups.unshift(new ThrowingKnife(genObj(0, 0, scale / 2, scale / 2, gameColors.power)));
    shuffleArray(powerups);

    for (let p in powerups) powerups[p].setIndex(p);

    let singleSquares = new Set();

    for (let i = 0; i < m.grid.length; i++) {
        let rectangleLength = scale;
        let startX = 0, startY = scale * i;
        let colorRect = m.grid[i][0];

        for (let j = 0; j < m.grid[0].length; j++) {
            for (let k in m.powerLocs)
                if (j == m.powerLocs[k][1] && i == m.powerLocs[k][0]) {
                    currP = powerups[k];
                    currP.sprite.position.x = scale * j + scale / 2;
                    currP.sprite.position.y = scale * i + scale / 2;
                }
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

    border = new Group();
    border.add(genObj(m.W * scale / 2, -scale / 2, (m.W + 2) * scale, scale, gameColors.wall));
    border.add(genObj(m.W * scale / 2, m.H * scale + scale / 2, (m.W + 2) * scale, scale, gameColors.wall));
    border.add(genObj(-scale / 2, m.H * scale / 2, scale, m.H * scale, gameColors.wall));
    border.add(genObj(m.W * scale + scale / 2, m.H * scale / 2, scale, m.H * scale, gameColors.wall));

    minimap = new Minimap();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = floor(random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function removeWall(chosen) {
    m.grid[chosen[1]][chosen[0]] = 0;

    for (let s of walls) {
        let tlCorner = [floor((s.position.x - s.width / 2 + 1) / scale), floor((s.position.y - s.height / 2 + 1) / scale)];
        let brCorner = [floor((s.position.x + s.width / 2 - 1) / scale), floor((s.position.y + s.height / 2 - 1) / scale)];

        if (chosen[0] >= tlCorner[0] && chosen[0] <= brCorner[0] &&
            chosen[1] >= tlCorner[1] && chosen[1] <= brCorner[1]) {
            walls.remove(s);

            if (s.width > s.height) {
                let newWidth = (chosen[0] - tlCorner[0]) * scale;
                let newX = tlCorner[0] * scale + newWidth / 2;
                if (newWidth > 0)
                    walls.add(genObj(newX, s.position.y, newWidth, scale, gameColors.wall));

                newWidth = (brCorner[0] - chosen[0]) * scale;
                newX = (brCorner[0] + 1) * scale - newWidth / 2;
                if (newWidth > 0)
                    walls.add(genObj(newX, s.position.y, newWidth, scale, gameColors.wall));
            } else if (s.height > s.width) {
                let newHeight = (chosen[1] - tlCorner[1]) * scale;
                let newY = tlCorner[1] * scale + newHeight / 2;
                if (newHeight > 0)
                    walls.add(genObj(s.position.x, newY, scale, newHeight, gameColors.wall));

                newHeight = (brCorner[1] - chosen[1]) * scale;
                newY = (brCorner[1] + 1) * scale - newHeight / 2;
                if (newHeight > 0)
                    walls.add(genObj(s.position.x, newY, scale, newHeight, gameColors.wall));
            }

        }
    }
}
