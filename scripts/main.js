function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(desiredFPS);
    imageMode(CENTER);
    angleMode(DEGREES);
    noSmooth();

    for (let key of Object.keys(allAssets))
        for (let i = 0; i <= 100; i += lightingInterval)
            allAssets[key].push(loadImage("assets/" + key + "/opaque" + i + '.png', img => { assetsLoaded++; }));

    resetGame();
    initializePeer();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (gameState == "GAME") {
        if (spectating) changeScale(correctScale()/2);
        else changeScale(correctScale());
    }
}

function draw() {
    if (assetsLoaded < totalAssets || !connectedToServer) {
        const percentLoaded = floor(100 * assetsLoaded / totalAssets);
        drawBasicMenu('Loading...', (percentLoaded == 100 ? 'Awaiting Server Connection' : 'Loading Assets: ' + percentLoaded + '%'), []);
    } else {
        switch (gameState) {
            case "MENU":
                menu.draw();
                break;
            case "GAME":
                game.draw();
                break;
        }
    }
}

function keyPressed() {
    switch (gameState) {
        case "MENU":
            menu.handleKey(keyCode, key);
    }

    return false;
}
