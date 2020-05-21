function preload() {
    font = loadFont('assets/mozart.ttf');

    let imgPrefix = 'assets/wall/Wall';
    let interval = 5;
    for (let i = 0; i <= 100; i += interval)
        wallImages.push(loadImage(imgPrefix + i + '.png'));

    // imgPrefix = 'assets/floor/Floor';
    // interval = 20;
    // for (let i = 0; i <= 100; i += interval)
    //     floorImages.push(loadImage(imgPrefix + i + '.png'));
}

function setup() {
    allPlayers = new Group();
    peer = new Peer(prefix + myID);

    createCanvas(windowWidth, windowHeight);
    frameRate(desiredFPS);
    imageMode(CENTER);
    noSmooth();

    menu = new Menu();

    peer.on('connection', function (conn) {
        isHost = true;
        conn.send('trash data');
        conn.on('data', function (data) {
            let splitData = data.split(",");
            if (splitData[0] == "PLAYER POSITION DATA") {
                playerPos[conn.peer].position.x = +splitData[1];
                playerPos[conn.peer].position.y = +splitData[2];
            }
        });

        let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
        playerPos[conn.peer] = otherPlayer;

        allConnections.push(conn);
        console.log("PARTY CREATE SIDE Connected to " + conn.peer)

        // HACK TO GET THE PLAYER COUNT TO UPDATE PROPERLY
        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {

    switch (gameState) {
        case "MENU":
            menu.draw();
            break;
        case "GAME":
            game.draw();
            break;
    }
}

function keyPressed() {
    switch (gameState) {
        case "MENU":
            menu.handleKey(keyCode, key);
    }

    return false;
}
