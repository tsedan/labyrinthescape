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
const mainMenu = ["LABYRINTH ESCAPE", "use w, s, and enter to navigate the menus", [
    "CREATE PARTY",
    "JOIN PARTY",
    "SET NAME"
]];

// P2P
let allConnections = [];
const prefix = "hUntErsmAzEgAmE";
const myID = validCharacters.substring(0, validCharacters.length - 1).split('').sort(() => { return 0.5 - Math.random() }).join('').substring(0, 6);
let isHost = false;
let playerPos = {};
let allPlayers;
let connectedToServer;
let idToName = {};
const peerConfig = {
    secure: true,
    port: 443,
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

// VIEWPORT
const desiredFPS = 30;
const scale = 120;
const maxRenderDist = 4;

// PLAYER
let player;
const friction = 9;
const maxSpeed = 20;

// MAZE
let m;
let walls;
let exit;
let powerups;
let backMaze;
let monster;

let mazeSeed = 100;

const numberOfMazes = 3;
const mazeStartWidth = 12;
const mazeStartHeight = 20;
const holeProbability = 0.02;
const powerUpNum = 6;

let mazesStarted = 0;

// MINIMAP
let minimap;
let minimapScale;

// FONTS
let font;
const widtohei = 5 / 7;

// COLORS
const gameColors = {
    player: '#ff5252',
    back: '#f7f1e3',
    power: '#34ace0',
    start: '#33d9b2',
    end: '#ffb142',
    wall: '#000000',
    minimap: '#d1ccc0'
}
