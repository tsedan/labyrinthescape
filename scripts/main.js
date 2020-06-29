function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(desiredFPS);
    imageMode(CENTER);
    angleMode(DEGREES);
    noSmooth();

    for (let i = 1; i <= numTutorialPages; i++) {
        tutorialPages.push(loadImage("assets/tutorial/" + i + ".png"));
    }

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

    fontSizeRatio = round((windowWidth / fontDefaultWidth)*100)/100;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    fontSizeRatio = round((windowWidth / fontDefaultWidth)*100)/100;
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
