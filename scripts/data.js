let m;

let player;
let walls;
let open;
let exit;
let minimap;

let scale = 120;

const numberOfMazes = 3;
const mazeStartWidth = 12;
const mazeStartHeight = 20;
const holeProbability = 0.02;
const powerUpNum = 6;

let mazesStarted = 0;

const lightBrightness = 1800;

const playerFriction = 9;
const playerMaxSpeed = 12;

const gameColors = {
    player: [140, 28, 43],
    back: [255],
    power: [0,0,255],
    start: [0,255,0],
    end: [255,0,0],
    wall: [0]
}
