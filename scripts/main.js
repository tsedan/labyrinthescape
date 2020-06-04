function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(desiredFPS);
    imageMode(CENTER);
    angleMode(DEGREES);
    noSmooth();

    assetsLoaded = 0;
    totalAssets = (101 / lightingInterval) * 3;

    let imgPrefix = 'assets/wall/Wall';
    for (let i = 0; i <= 100; i += lightingInterval)
        wallImages.push(loadImage(imgPrefix + i + '.png', img => { assetsLoaded++; }));

    imgPrefix = 'assets/floor/Floor';
    for (let i = 0; i <= 100; i += lightingInterval)
        floorImages.push(loadImage(imgPrefix + i + '.png', img => { assetsLoaded++; }));

    imgPrefix = 'assets/torch/Torch';
    for (let i = 0; i <= 100; i += lightingInterval)
        torchImages.push(loadImage(imgPrefix + i + '.png', img => { assetsLoaded++; }));

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
