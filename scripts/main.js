function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(desiredFPS);

    myID = validCharacters.split('').sort(() => { return 0.5-Math.random() }).join('').substring(0,6);
    menu = new Menu();
    game = new Game();
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
