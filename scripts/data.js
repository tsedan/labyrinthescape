// GAMESTATE
let gameState = "MENU";
let menu;
let game;
let peer;

// IMAGES
let wallImg;
let wall40Img;
let wall60Img;
let wall80Img;
let wall100Img;

// MENU
const validCharacters = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";

// P2P
let allConnections = [];
const prefix = "hUntErsmAzEgAmE";
const myID = validCharacters.split('').sort(() => { return 0.5 - Math.random() }).join('').substring(0, 6);
let isHost = false;
let playerPos = {};
let allPlayers;

// VIEWPORT
const desiredFPS = 30;
const scale = 120;
const lightBrightness = 1800;

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
