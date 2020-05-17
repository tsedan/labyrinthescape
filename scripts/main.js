function preload() {
    font = loadFont('assets/mozart.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    frameRate(desiredFPS);
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
            menu.handleKey(keyCode);
    }
}
