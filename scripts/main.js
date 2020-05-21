function preload() {
    font = loadFont('assets/mozart.ttf');
    wallImg = loadImage('assets/Wall.png');
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
