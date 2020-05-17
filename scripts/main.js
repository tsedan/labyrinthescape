function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    peer = new Peer();

    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(desiredFPS);

    //myID = validCharacters.split('').sort(() => { return 0.5 - Math.random() }).join('').substring(0, 6);
    menu = new Menu();

    peer.on('connection', function (conn) {
        conn.on('data', function (data) {
            console.log(data);
        });

        all_connections.push(conn);
        console.log("PARTY CREATE SIDE Connected to " + conn.peer)

        // HACK TO GET THE PLAYER COUNT TO UPDATE PROPERLY
        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
    });
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
