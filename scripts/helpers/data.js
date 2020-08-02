// GAMESTATE
let gameState = "MENU";
let menu;
let game;
let peer;

// IMAGES
const allAssets = { floor: [], wall: [], knife: [], torch: [], gps: [], flare: [], hammer: [], boots: [], start: [], end: [] };
const lightInt = 1;
let assetsLoaded = 0;
const numTutorialPages = 5;
const totalAssets = (101 / lightInt) * Object.keys(allAssets).length + numTutorialPages;
const tutorialPages = []
let currentTutorialPage = 0;

const playerSprites = {
    monster: {}, whitewizard: {}, blackwizard: {}, bluerobe: {}, whiterobe: {},
    darkrobe: {}, whiteknight: {}, blueknight: {}, darkknight: {}, dragon: {}
};

const spriteSize = {
    monster: 39, whitewizard: 16, blackwizard: 16, bluerobe: 16, whiterobe: 16,
    darkrobe: 16, whiteknight: 19, blueknight: 19, darkknight: 19, dragon: 18
};

const spriteColor = {
    monster: "#d24f26", whitewizard: "#ffffff", blackwizard: "#ffffff", bluerobe: "#428cd0", whiterobe: "#ffffff",
    darkrobe: "#ffffff", whiteknight: "#ffffff", blueknight: "#4791df", darkknight: "#a960db", dragon: "#81cbee"
}

let unusedSprites = Object.keys(playerSprites);
let idToSprite = {};

// MENU
const validCharacters = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
const maxUsernameLength = 14;
const connectionFailTime = 5000;
let allowedHostMenuStates;

// P2P
let allConnections = [];
const idLength = 6;
let myID;
for (myID = ''; myID.length < idLength; myID += validCharacters[Math.floor(Math.random() * validCharacters.length)]);
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

let inEnding = false;
const endingTime = 5000;
let renderDecreaseTimings = [];
let currentEndingTime = endingTime;
let endingMenu = null;

let prevPos = [0, 0];

// MAZE
let m;
let walls;
let exit;
let powerups;
let powerupsInUse;
let border;
let monster;
let originalMonsterLoc;

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

let startRotation = null;

// MINIMAP
let minimap;
let minimapScale;
const minimapPercent = 0.3;

// FONTS
let font;
let fontSizeRatio = 1;
let fontDefaultWidth = 1820;

// COLORS
const gameColors = {
    player: '#ff5252',
    monster: '#1f9149',
    back: '#f7f1e3',
    power: '#34ace0',
    start: '#33d9b2',
    end: '#ffb142',
    wall: '#000000',
    minimap: '#d1ccc0',
    inv: '#8c8c89',
}

function resetAllValues() {
    gameState = "MENU";
    game = null;
    finishedPlayers = null;
    deadPlayers = [];
    maxRenderDist = trueMaxRenderDist;
    maxSpeed = trueMaxSpeed;
    isMonster = null;
    heldItem = null;
    orientation = 0;
    isDead = false;
    inEnding = false;
    renderDecreaseTimings = [];
    currentEndingTime = endingTime;
    tempDead = false;
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
    scale = originalScale;
    originalMonsterLoc = [];

    for (let spr of getSprites()) {
        let isPlayer = false;
        for (let p of allPlayers) {
            if (p == spr) {
                isPlayer = true;
            }
        }

        if (!isPlayer)
            spr.remove();
    };
}

function resetConn() {
    for (let spr of getSprites()) spr.remove();
    for (let c of allConnections) { c.close(); }
    allConnections = [];

    playerPos = {};
    const myName = idToName[myID];
    idToName = [];
    idToName[myID] = (myName ? myName : myID);
    isHost = false;

    initMenus();
    menu = new Menu();
    menu.changeMenu(...mainMenu);
    allPlayers = new Group();

    player = genObj(0, 0, scale / 2, scale / 2, gameColors.player);

    allPlayers.add(player);
    playerPos[myID] = player;
}
