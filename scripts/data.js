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
let myID;
for (myID = ''; myID.length < 6; myID += validCharacters[Math.floor(Math.random() * (validCharacters.length-1))]);
let isHost = false;
let playerPos = {};
let allPlayers;
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

// PLAYER
let player;
const friction = 9;
let maxSpeed = 20;
let isMonster;
let isDead = false;

// MAZE
let m;
let walls;
let exit;
let powerups;
let monster;

let mazeSeed;

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
