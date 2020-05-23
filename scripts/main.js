function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(desiredFPS);
    imageMode(CENTER);
    noSmooth();

    assetsLoaded = 0;
    totalAssets = (101 / lightingInterval) * 2;

    let imgPrefix = 'assets/wall/Wall';
    for (let i = 0; i <= 100; i += lightingInterval)
        wallImages.push(loadImage(imgPrefix + i + '.png', img => { assetsLoaded++; }));

    imgPrefix = 'assets/floor/Floor';
    for (let i = 0; i <= 100; i += lightingInterval)
        floorImages.push(loadImage(imgPrefix + i + '.png', img => { assetsLoaded++; }));

    idToName[prefix + myID] = myID;
    peer = new Peer(prefix + myID);
    connectedToServer = false;

    peer.on('open', function (id) { connectedToServer = true; });

    peer.on('connection', function (conn) {
        isHost = true;
        conn.send('trash');
        conn.on('data', function (data) {

            let splitData = data.split(",");
            if (splitData[0] == 'pos') {
                playerPos[conn.peer].position.x = +splitData[1];
                playerPos[conn.peer].position.y = +splitData[2];
            } else if (splitData[0] == 'name') {
                idToName[conn.peer] = splitData[1];
                menu.state = "CLIENTMODE";
                menu.eventHandler("CREATE PARTY");
            }
        });

        let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
        playerPos[conn.peer] = otherPlayer;

        allConnections.push(conn);

        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
    });

    allPlayers = new Group();
    menu = new Menu();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    if (assetsLoaded < totalAssets || !connectedToServer) {
        const percentLoaded = floor(100 * assetsLoaded / totalAssets);
        drawBasicMenu('Loading...', (percentLoaded == 100 ? 'Awaiting Server Connection' : 'Loading Assets: ' + percentLoaded + '%'));
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
