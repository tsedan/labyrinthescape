function genMaze(w, h, holes, powerups) {
    mazesStarted++;
    m = new MazeGenerator(w, h, holes, powerups);
    m.generate();

    if (open) open.removeSprites();
    if (walls) walls.removeSprites();
    if (player) player.remove();
    if (exit) exit.remove();

    player = createSprite((m.start[1]+0.5) * scale, (m.start[0]+0.5) * scale, scale / 2, scale / 2);
    player.shapeColor = color(gameColors.player);

    start = createSprite((m.start[1]+0.5) * scale, (m.start[0]+0.5) * scale, scale, scale);
    start.shapeColor = color(gameColors.start);

    exit = createSprite((m.end[1]+0.5) * scale, (m.end[0]+0.5) * scale, scale, scale);
    exit.shapeColor = color(gameColors.end);

    open = new Group();
    walls = new Group();
    powerups = new Group();

    let singleSquares = new Set();

    for (let i = 0; i < m.grid.length; i++) {
        let rectangleLength = scale;
        let startX = 0;
        let startY = scale * i;
        let colorRect = m.grid[i][0];
        for (let j = 0; j < m.grid[0].length; j++) {
            let isPower = false;
            for (let k of m.powerLocs)
                if (j == k[1] && i == k[0])
                    isPower = true;

            if (isPower) {
                let box = createSprite(scale * j + scale / 2, scale * i + scale / 2, scale, scale);
                box.shapeColor = color(gameColors.power);
                powerups.add(box);
            }

            if (j < m.grid[0].length - 1) {
                if (m.grid[i][j + 1] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        let box = createSprite(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale);
                        if (colorRect == 1) {
                            box.shapeColor = color(gameColors.wall);
                            walls.add(box);
                        } else {
                            box.shapeColor = color(gameColors.back);
                            open.add(box);
                        }
                    } else {
                        singleSquares.add(startX + "," + startY)
                    }

                    rectangleLength = scale;
                    startX = scale * (j + 1);
                    colorRect = m.grid[i][j + 1];
                }
            } else {
                if (rectangleLength != scale) {
                    let box = createSprite(startX + rectangleLength / 2, startY + scale / 2, rectangleLength, scale);
                    if (colorRect == 1) {
                        box.shapeColor = color(gameColors.wall);
                        walls.add(box);
                    } else {
                        box.shapeColor = color(gameColors.back);
                        open.add(box);
                    }
                } else {
                    singleSquares.add(startX + "," + startY);
                }
            }
        }

    }

    for (let j = 0; j < m.grid[0].length; j++) {
        let rectangleLength = scale;
        let startX = scale * j;
        let startY = 0;
        let colorRect = m.grid[0][j];
        for (let i = 0; i < m.grid.length; i++) {
            if (i < m.grid.length - 1) {
                if (m.grid[i + 1][j] == m.grid[i][j]) {
                    rectangleLength += scale;
                } else {
                    if (rectangleLength != scale) {
                        let box = createSprite(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength);
                        if (colorRect == 1) {
                            box.shapeColor = color(gameColors.wall);
                            walls.add(box);
                        } else {
                            box.shapeColor = color(gameColors.back);
                            open.add(box);
                        }
                    } else {
                        if (singleSquares.has(startX + "," + startY)) {
                            let box = createSprite(startX + scale / 2, startY + scale / 2, scale, scale);
                            box.shapeColor = color(gameColors.wall);
                            walls.add(box);
                        }
                    }

                    rectangleLength = scale;
                    startY = scale * (i + 1);
                    colorRect = m.grid[i + 1][j];
                }
            } else {
                if (rectangleLength != scale) {
                    let box = createSprite(startX + scale / 2, startY + rectangleLength / 2, scale, rectangleLength);

                    if (colorRect == 1) {
                        box.shapeColor = color(gameColors.wall);
                        walls.add(box);
                    } else {
                        box.shapeColor = color(gameColors.back);
                        open.add(box);
                    }
                } else {
                    if (singleSquares.has(startX + "," + startY)) {
                        let box = createSprite(startX + scale / 2, startY + scale / 2, scale, scale);
                        box.shapeColor = color(gameColors.wall);
                        walls.add(box);
                    }
                }
            }
        }
    }

    const topBox = createSprite(m.W * scale / 2, -scale / 2, m.W * scale, scale);
    topBox.shapeColor = color(gameColors.wall);
    walls.add(topBox);

    const bottomBox = createSprite(m.W * scale / 2, m.H * scale + scale / 2, m.W * scale, scale);
    bottomBox.shapeColor = color(gameColors.wall);
    walls.add(bottomBox);

    const leftBox = createSprite(-scale / 2, m.H * scale / 2, scale, m.H * scale);
    leftBox.shapeColor = color(gameColors.wall);
    walls.add(leftBox);

    const rightBox = createSprite(m.W * scale + scale / 2, m.H * scale / 2, scale, m.H * scale);
    rightBox.shapeColor = color(gameColors.wall);
    walls.add(rightBox);

    minimap = new Minimap();
}

function newMaze() {
    genMaze(mazeStartWidth + mazesStarted * 2, mazeStartHeight + mazesStarted * 2, holeProbability, powerUpNum);
}
