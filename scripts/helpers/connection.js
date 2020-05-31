function connectionHost() {
    peer.on('connection', function (conn) {
        isHost = true;

        conn.on('open', function () {
            conn.send('starthandshake');

            conn.on('data', function (data) {
                let splitData = data.split(',');
                if (splitData[0] == 'confirmhandshake') {
                    allConnections.push(conn);
                    playerPos[conn.peer] = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                    menu.update();
                }
                if (allConnections.indexOf(conn) == -1) return; //Dont handle events if i havent recieved confirmhandshake
                switch (splitData[0]) {
                    case 'pos':
                        playerPos[conn.peer].position.x = splitData[1] * scale;
                        playerPos[conn.peer].position.y = splitData[2] * scale;
                        break;
                    case 'name':
                        idToName[conn.peer] = splitData[1];
                        menu.update();

                        conn.send("name," + peer.id + "," + idToName[peer.id]);
                        for (let c in allConnections) {

                            if (allConnections[c].peer != conn.peer) {
                                conn.send("name," + allConnections[c].peer + "," + idToName[allConnections[c].peer]);
                                allConnections[c].send("name," + conn.peer + "," + idToName[conn.peer]);
                            }
                        }
                        break;
                    case 'die':
                        playerPos[conn.peer].visible = false;
                        deadPlayers.push(playerPos[conn.peer]);
                        for (let c of allConnections) {
                            if ((c && c.open) && (c.peer != conn.peer)) {
                                c.send('die,' + conn.peer);
                            }
                        }
                        checkMazeCompletion();
                        break;
                    case 'poweruppicked':
                        powerupsInUse.push(+splitData[1]);
                        powerups[+splitData[1]].sprite.visible = false;
                        sendPowerupUsedInfo(+splitData[1]);
                        break;
                    case 'powerupdropped':
                        let pID = +splitData[1];
                        for (let p in powerupsInUse) {
                            if (powerupsInUse[p] == pID) {
                                powerupsInUse.splice(p, 1);
                            }
                        }
                        powerups[pID].sprite.visible = true;
                        powerups[pID].sprite.position.x = splitData[2] * scale;
                        powerups[pID].sprite.position.y = splitData[3] * scale;
                        powerups[pID].sprite.velocity.x = splitData[4] * scale;
                        powerups[pID].sprite.velocity.y = splitData[5] * scale;

                        if (['Boot', 'Torch', 'Hammer'].includes(powerups[pID].constructor.name)) {
                            powerups[pID].timeAvailable = +splitData[6];
                        }

                        sendPowerupDroppedInfo(data);
                        break;
                    case 'flareused':
                        if (!isMonster) {
                            minimap.flareLocations[splitData[1] + "," + splitData[2]] = color(splitData[3]);
                            minimap.flareTimings[splitData[1] + "," + splitData[2]] = splitData[4];
                        }
                        sendFlareUsedInfo(data);
                        break;
                    case 'hammerused':
                        removeWall([+splitData[1], +splitData[2]]);
                        sendHammerUsedInfo([+splitData[1], +splitData[2]]);
                        break;
                    case 'comp':
                        finishedPlayers.push(conn.peer);
                        someoneCompleted(conn.peer);
                        sendCompletionInfo(conn.peer);
                        checkMazeCompletion();
                        break;
                }
            });
        });
    });
}

function connectToHost(id) {
    for (let c of allConnections) c.close();

    let conn = peer.connect(id);

    conn.on('open', () => {
        conn.on('data', (data) => {
            if (data == "starthandshake") {
                allConnections.push(conn);

                menu.changeMenu(...waitMenu);

                conn.send("confirmhandshake");
                conn.send('name,' + idToName[myID]);
            }

            if (allConnections.length == 0) return; //Dont handle events unless we got 'starthandshake'

            let splitData = data.split(",");

            switch (splitData[0]) {
                case 'start':
                    mazeSeed = +splitData[1];
                    monster = playerPos[splitData[2]];
                    isMonster = player == monster;
                    game = new Game();
                    gameState = "GAME";
                    break;
                case 'pos':
                    let pID = splitData[1];
                    playerPos[pID].position.x = splitData[2] * scale;
                    playerPos[pID].position.y = splitData[3] * scale;
                    break;
                case 'name':
                    idToName[splitData[1]] = splitData[2];
                    menu.update();

                    let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                    playerPos[splitData[1]] = otherPlayer;
                    break;
                case 'die':
                    playerPos[splitData[1]].visible = false;
                    deadPlayers.push(playerPos[splitData[1]]);
                    break;
                case 'poweruppicked':
                    powerupsInUse.push(+splitData[1]);
                    powerups[+splitData[1]].sprite.visible = false;
                    break;
                case 'powerupdropped':
                    let powerupID = +splitData[1];
                    for (let p in powerupsInUse) {
                        if (powerupsInUse[p] == powerupID) {
                            powerupsInUse.splice(p, 1);
                        }
                    }

                    powerups[powerupID].sprite.visible = true;
                    powerups[powerupID].sprite.position.x = splitData[2] * scale;
                    powerups[powerupID].sprite.position.y = splitData[3] * scale;
                    powerups[powerupID].sprite.velocity.x = splitData[4] * scale;
                    powerups[powerupID].sprite.velocity.y = splitData[5] * scale;

                    // last arguments will be powerup specific
                    if (['Boot', 'Torch', 'Hammer'].includes(powerups[powerupID].constructor.name)) {
                        powerups[powerupID].timeAvailable = +splitData[6];
                    }
                    break;
                case 'flareused':
                    minimap.flareLocations[splitData[1] + "," + splitData[2]] = color(splitData[3]);
                    minimap.flareTimings[splitData[1] + "," + splitData[2]] = splitData[4];
                    break;
                case 'hammerused':
                    removeWall([+splitData[1], +splitData[2]]);
                    break;
                case 'comp':
                    someoneCompleted(splitData[1]);
                    break;
                case 'nextmaze':
                    game.newMaze();
                    newAlert("MAZE FINISHED, NEXT LEVEL STARTED");
                    break;
                case 'playerwin':
                    changeScale(originalScale);
                    gameState = "MENU";
                    menu.changeMenu(...(!isMonster ? winMenu : loseMenu));
                    break;
                case 'monsterwin':
                    changeScale(originalScale);
                    gameState = "MENU";
                    menu.changeMenu(...(isMonster ? winMenu : loseMenu));
                    break;
            }
        });
    });
}

function exitReached() {
    if (isMonster) {
        newAlert("THE MONSTER CAN'T LEAVE THE MAZE");
        return;
    }

    someoneCompleted(myID);

    if (!isHost && allConnections.length == 1) {
        if (allConnections[0] && allConnections[0].open) {
            allConnections[0].send('comp');
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('comp,' + myID);
            }
        }
        finishedPlayers.push(myID);
        checkMazeCompletion();
    }
}

function checkMazeCompletion() {
    if (deadPlayers.length == Object.keys(playerPos).length - 1) {
        changeScale(originalScale);
        gameState = "MENU";
        menu.changeMenu(...(isMonster ? winMenu : loseMenu));

        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('monsterwin');
            }
        }

        return;
    }
    if (finishedPlayers.length == 0) return;
    if (finishedPlayers.length == Object.keys(playerPos).length - deadPlayers.length - 1) {
        if (mazesStarted == numberOfMazes) {
            changeScale(originalScale);
            gameState = "MENU";
            menu.changeMenu(...(!isMonster ? winMenu : loseMenu));

            for (let c in allConnections) {
                if (allConnections[c] && allConnections[c].open) {
                    allConnections[c].send('playerwin');
                }
            }

            return;
        }
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('nextmaze');
            }
        }
        game.newMaze();
        newAlert("MAZE FINISHED, NEXT LEVEL STARTED");
    }
}

function die() {
    spectatorMode();
    isDead = true;
    deadPlayers.push(player);
    newAlert("YOU DIED AND ENTERED SPECTATOR MODE");

    if (!isHost && allConnections.length == 1) {
        if (allConnections[0] && allConnections[0].open) {
            allConnections[0].send('die');
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('die,' + myID);
            }
        }
        checkMazeCompletion();
    }
}

function initializePeer() {
    peer = new Peer(myID, peerConfig);
    connectedToServer = false;

    peer.on('open', function (id) {
        connectedToServer = true;
        connectionHost();
    });
}

function sendCompletionInfo(id) {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open && allConnections[c].peer != id) {
            allConnections[c].send('comp,' + id);
        }
    }
}

function sendPositionData() {
    if (!isHost && allConnections.length == 1) {
        if (allConnections[0] && allConnections[0].open) {
            allConnections[0].send('pos,' + (player.position.x / scale) + ',' + (player.position.y / scale));
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('pos,' + peer.id + ',' + (player.position.x / scale) + ',' + (player.position.y / scale));
                for (let c2 in allConnections) {
                    if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                        let peerID = allConnections[c2].peer;
                        allConnections[c].send('pos,' + peerID + ',' + (playerPos[peerID].position.x / scale) + ',' + (playerPos[peerID].position.y / scale));
                    }
                }
            }
        }
    }
}

function sendStartInfo() {
    const monsterID = Object.keys(playerPos)[floor(random() * Object.keys(playerPos).length)];
    monster = playerPos[monsterID];
    isMonster = player == monster;

    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send('start,' + mazeSeed + ',' + monsterID);
        }
    }
}

function sendPowerupUsedInfo(pIndex) {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send('poweruppicked,' + pIndex);
        }
    }
}

function sendPowerupDroppedInfo(dataStr) {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send(dataStr);
        }
    }
}

function sendFlareUsedInfo(dataStr) {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open && playerPos[allConnections[c].peer] != monster) {
            allConnections[c].send(dataStr);
        }
    }
}

function sendHammerUsedInfo(chosen) {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send("hammerused," + chosen[0] + "," + chosen[1]);
        }
    }
}
