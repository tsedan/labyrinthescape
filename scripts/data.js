let m;

let player;
let walls;
let exit;
let powerups;
let minimap;
let backMaze;
let font;
let connectID;

let inStartScreen = true;

const desiredFPS = 30;

const scale = 120;

const numberOfMazes = 3;
const mazeStartWidth = 12;
const mazeStartHeight = 20;
const holeProbability = 0.02;
const powerUpNum = 6;

let minimapScale = scale / 20;

let mazesStarted = 0;

const lightBrightness = 1800;

const friction = 9;
const maxSpeed = 20;

const viewRadius = scale * 2.5;
const circularApprox = 1.35;

const gameColors = {
    player: '#ff5252',
    back: '#f7f1e3',
    power: '#34ace0',
    start: '#33d9b2',
    end: '#ffb142',
    wall: '#000000',
    minimapBack: '#d1ccc0'
}
