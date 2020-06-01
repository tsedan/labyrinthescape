// GAMESTATE
let gameState = "MENU";
let menu;
let game;
let peer;

// IMAGES
let wallImages = [];
let floorImages = [];
const lightingInterval = 1;
let assetsLoaded;
let totalAssets;

// MENU
const validCharacters = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM ";
const maxUsernameLength = 10;
const connectionFailTime = 5000;
let mainMenu, nameMenu, waitMenu;
let kickMenu, failMenu;
let joinMenu, connMenu;
let hostMenu, modeMenu;
let winMenu, loseMenu;

// P2P
let allConnections = [];
const idLength = 6;
let myID;
for (myID = ''; myID.length < idLength; myID += validCharacters[Math.floor(Math.random() * (validCharacters.length - 1))]);
let isHost = false;
let playerPos = {};
let finishedPlayers;
let allPlayers;
let deadPlayers = [];
let connectedToServer;
let idToName = {};
const partySizeMinimum = 1;
const partySizeMaximum = 5;
const peerConfig = {
    secure: true,
    host: 'labyrinth-escape.herokuapp.com',
    port: 443
};

// VIEWPORT
const desiredFPS = 30;
const originalScale = 120;
let scale = originalScale;
const trueMaxRenderDist = 4;
let maxRenderDist = trueMaxRenderDist;
const uiPadding = 30;

// PLAYER
let player;
const friction = 9;
const trueMaxSpeed = 6;
const spectatorMaxSpeed = 4;
let maxSpeed = trueMaxSpeed;
let isMonster;
let heldItem = null;
let orientation = 0;
let isDead = false;
let spectating = false;

// MAZE
let m;
let walls;
let exit;
let powerups;
let powerupsInUse;
let border;
let monster;

let mazeSeed;

let numberOfMazes = 3;
let mazeStartWidth = 14;
let mazeStartHeight = 14;
let holeProbability = 0.02;
const powerUpNum = 6;
const mazeGrow = 2;

let mazesStarted = 0;

let alertMsg = '';
let alertTime = 0;
const alertRate = 5;
const alertMaxTime = 855;

// MINIMAP
let minimap;
let minimapScale;

// FONTS
let font;

// COLORS
const gameColors = {
    player: '#ff5252',
    back: '#f7f1e3',
    power: '#34ace0',
    start: '#33d9b2',
    end: '#ffb142',
    wall: '#000000',
    minimap: '#d1ccc0',
    inv: '#8c8c89',
}

function resetAllValues() {
    for (let c of allConnections) c.close();
    for (let spr of getSprites()) spr.remove();

    gameState = "MENU";
    game = null;
    menu = null;
    allConnections = [];
    playerPos = {};
    finishedPlayers = null;
    allPlayers = null;
    deadPlayers = [];
    const myName = idToName[myID];
    idToName = [];
    idToName[myID] = (myName ? myName : myID);
    maxRenderDist = trueMaxRenderDist;
    player = null;
    maxSpeed = trueMaxSpeed;
    isMonster = null;
    heldItem = null;
    orientation = 0;
    isDead = false;
    spectating = false;
    m = null;
    walls = null;
    exit = null;
    powerups = null;
    powerupsInUse = null;
    border = null;
    monster = null;
    mazeSeed = null;
    mazesStarted = 0;
    alertMsg = '';
    alertTime = 0;
    minimap = null;
    minimapScale = null;
    isHost = false;
    scale = originalScale;
}

function resetGame() {
    resetAllValues();
    initMenus();
    menu = new Menu();
    menu.changeMenu(...mainMenu);
    allPlayers = new Group();
    player = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
    allPlayers.add(player);
    playerPos[myID] = player;
}
