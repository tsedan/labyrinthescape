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
let mainMenu;
let nameMenu;
let joinMenu, connMenu, waitMenu;
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
const peerConfig = {
    secure: true,
    host: 'labyrinth-escape.herokuapp.com',
    port: 443
};

// VIEWPORT
const desiredFPS = 30;
const scale = 120;
let maxRenderDist = 4;
const uiPadding = 30;

// PLAYER
let player;
const friction = 9;
let maxSpeed = 20;
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

const numberOfMazes = 2;
const mazeStartWidth = 10;
const mazeStartHeight = 10;
const holeProbability = 0.02;
const powerUpNum = 6;

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

function initMenus() {
    mainMenu = [
        "MAINMENU", "MAIN MENU", "use [up], [down] and [enter] to navigate the menus",
        [
            new MenuOption("CREATE PARTY"),
            new MenuOption("JOIN PARTY"),
            new MenuOption("CHANGE NAME")
        ]
    ];

    nameMenu = [
        "NAMEMENU", "SET YOUR USERNAME", "your username will be displayed to others in your party",
        [
            new MenuPrompt("TYPE YOUR USERNAME", maxUsernameLength),
            new MenuOption("BACK")
        ]
    ];

    joinMenu = [
        "JOINMENU", "JOIN A PARTY", "ask your party leader for the party id",
        [
            new MenuPrompt("TYPE THE PARTY ID", idLength),
            new MenuOption("BACK")
        ]
    ];
    connMenu = [
        "CONNMENU", "Awaiting Host", "please wait for the party connection to initialize", []
    ];
    waitMenu = [
        "WAITMENU", "AWAITING GAME START", "ask the party leader to start once everyone's joined", []
    ];

    hostMenu = [
        "HOSTMENU", "ID: myID, nmPlP", "share this party id with your friends",
        [
            new MenuOption("START"),
            new MenuOption("CONFIG"),
            new MenuOption("BACK")
        ]
    ];
    modeMenu = [
        "MODEMENU", hostMenu[1], "change the game's settings",
        [
            new MenuOption("BACK")
        ]
    ];

    winMenu = [
        "OVERMENU", "YOU WON!", "flex on your friends, or go for another round",
        [
            new MenuOption("PLAY AGAIN"),
            new MenuOption("CONTINUE")
        ]
    ];
    loseMenu = [
        winMenu[0], "YOU LOST...", "remember, you can always play another round", winMenu[3]
    ];
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
    maxRenderDist = 4;
    player = null;
    maxSpeed = 20;
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
