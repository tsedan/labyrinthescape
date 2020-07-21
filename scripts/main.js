function preload() {
    font = loadFont('assets/mozart.ttf');

    for (let key of Object.keys(playerSprites)) {
        let s = spriteSize[key];
        let player_frames_front = [
            { 'name': 'player_front_walk01', 'frame': { 'x': 0, 'y': 0, 'width': s, 'height': s } },
            { 'name': 'player_front_walk02', 'frame': { 'x': s, 'y': 0, 'width': s, 'height': s } },
        ];

        let player_frames_back = [
            { 'name': 'player_back_walk01', 'frame': { 'x': s * 2, 'y': 0, 'width': s, 'height': s } },
            { 'name': 'player_back_walk02', 'frame': { 'x': 0, 'y': s, 'width': s, 'height': s } },
        ];

        let player_frames_right = [
            { 'name': 'player_right_walk01', 'frame': { 'x': s, 'y': s, 'width': s, 'height': s } },
            { 'name': 'player_right_walk02', 'frame': { 'x': s * 2, 'y': s, 'width': s, 'height': s } },
        ];

        let player_frames_left = [
            { 'name': 'player_left_walk01', 'frame': { 'x': 0, 'y': s * 2, 'width': s, 'height': s } },
            { 'name': 'player_left_walk02', 'frame': { 'x': s, 'y': s * 2, 'width': s, 'height': s } },
        ];

        playerSprites[key]['front'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_front));
        playerSprites[key]['back'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_back));
        playerSprites[key]['left'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_left));
        playerSprites[key]['right'] = loadAnimation(loadSpriteSheet('assets/players/' + key + '.png', player_frames_right));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(desiredFPS);
    imageMode(CENTER);
    angleMode(DEGREES);
    noSmooth();

    for (let i = 1; i <= numTutorialPages; i++)
        tutorialPages.push(loadImage("assets/tutorial/" + i + ".png", img => { assetsLoaded++; }));

    for (let key of Object.keys(allAssets))
        for (let i = 0; i <= 100; i += lightInt)
            allAssets[key].push(loadImage("assets/" + key + "/opaque" + i + '.png', img => { assetsLoaded++; }));

    resetAllValues();
    resetConn();

    if (Modernizr.peerconnection) {
        menu.changeMenu(...startNameMenu);
        initializePeer();
    } else {
        menu.changeMenu(...notSupportedMenu);
    }

    fontSizeRatio = round((windowWidth / fontDefaultWidth) * 100) / 100;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    fontSizeRatio = round((windowWidth / fontDefaultWidth) * 100) / 100;
    if (gameState == "GAME") {
        if (spectating) changeScale(correctScale() / 2);
        else changeScale(correctScale());
    }
}

function draw() {
    if (assetsLoaded < totalAssets || !connectedToServer) {
        const percentLoaded = floor(100 * (assetsLoaded + 1) / (totalAssets + 1));
        const loadString = percentLoaded + '% (' + (assetsLoaded + 1) + '/' + (totalAssets + 1) + ')';
        drawBasicMenu('Loading...', (percentLoaded == 100 ? 'Awaiting Server Connection' : loadString), []);
    } else {
        if (gameState == "MENU") menu.draw();
        else if (gameState == "GAME") game.draw();
    }
}

function keyPressed() {
    switch (gameState) {
        case "MENU":
            menu.handleKey(keyCode, key);
    }

    return false;
}
