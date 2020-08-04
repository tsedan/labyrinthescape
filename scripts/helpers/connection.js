function connectionHost() {
    peer.on('connection', function (conn) {
        isHost = true;

        conn.on('open', function () {
            conn.on('data', function (data) {
                let splitData = data.split(',');
                if (splitData[0] == 'confirmhandshake') {
                    allConnections.push(conn);
                    playerPos[conn.peer] = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                    allPlayers.add(playerPos[conn.peer]);

                    menu.update();
                }
                if (allConnections.indexOf(conn) == -1) return;
                switch (splitData[0]) {
                    case 'pos':
                        playerPos[conn.peer].position.x = splitData[1] * scale;
                        playerPos[conn.peer].position.y = splitData[2] * scale;
                        playerPos[conn.peer].changeAnimation(splitData[3]);
                        playerPos[conn.peer].animation.playing = splitData[4] == "true";

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
                    case 'changename':
                        idToName[conn.peer] = splitData[1];
                        menu.update();

                        for (let c in allConnections) {
                            if (allConnections[c].peer != conn.peer) {
                                allConnections[c].send("changename," + idToName[conn.peer] + "," + conn.peer);
                            }
                        }
                        break;
                    case 'monsterstate':
                        monsterDead = splitData[1] == 'true';
                        monster.visible = !monsterDead;
                        for (let c in allConnections) {
                            if (allConnections[c].peer != conn.peer) {
                                allConnections[c].send("monsterstate," + monsterDead);
                            }
                        }
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
                        powerups[pID].sprite.position.x = +splitData[2] * scale;
                        powerups[pID].sprite.position.y = +splitData[3] * scale;
                        powerups[pID].sprite.velocity.x = +splitData[4] * scale;
                        powerups[pID].sprite.velocity.y = +splitData[5] * scale;
                        powerups[pID].sprite.friction = +splitData[6];

                        if (splitData[8] == 'true') {
                            powerups[pID].used = 2;
                            powerups[pID].orientationThrown = +splitData[9];
                        }

                        if (['Hammer'].includes(powerups[pID].constructor.name)) {
                            powerups[pID].timeAvailable = +splitData[7];
                        }

                        sendPowerupDroppedInfo(data);
                        break;
                    case 'flareused':
                        if (!isMonster) {
                            minimap.flareLocations[splitData[1] + "," + splitData[2]] = color(splitData[3]);
                            minimap.flareTimings[splitData[1] + "," + splitData[2]] = splitData[4];
                            newAlert("A FLARE HAS BEEN USED");
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
                    case 'leaving':
                        for (let c in allConnections) {
                            if (allConnections[c].peer == conn.peer) {
                                allConnections.splice(c, 1);
                                c--;
                            }
                        }
                        playerPos[conn.peer].remove();
                        delete playerPos[conn.peer];
                        delete idToName[conn.peer];

                        unusedSprites.push(idToSprite[conn.peer])
                        delete idToSprite[conn.peer]
                        conn.close();
                        menu.update();
                        break;
                }
            });

            if (allConnections.length + 1 >= partySizeMaximum) {
                conn.send('refuseconnection,party player cap was reached');
                setTimeout(() => { conn.close() }, 1000);
            } else if (gameState != 'MENU' || !allowedHostMenuStates.includes(menu.state)) {
                conn.send('refuseconnection,host was not in the party creation menu');
                setTimeout(() => { conn.close() }, 1000);
            } else {
                conn.send('starthandshake');
            }
        });
    });
}

function connectToHost(id) {
    for (let c of allConnections) c.close();

    let conn = peer.connect(id);

    conn.on('open', () => {
        conn.on('data', (data) => {
            let splitData = data.split(',');
            if (splitData[0] == 'starthandshake') {
                allConnections.push(conn);

                menu.changeMenu(...waitMenu);

                conn.send('confirmhandshake');
                conn.send('name,' + idToName[myID]);
            }
            if (splitData[0] == 'refuseconnection') {
                menu.changeMenu(...kickMenu);
                menu.subtitle = splitData[1];
                conn.close();
                return;
            }

            if (allConnections.length == 0) return;

            switch (splitData[0]) {
                case 'start':
                    resetAllValues();
                    for (let s of getSprites()) {
                        s.visible = true;
                        s.width = scale / 2;
                        s.height = scale / 2;
                    }

                    mazeSeed = +splitData[1];
                    monster = playerPos[splitData[2]];
                    monster.shapeColor = gameColors.monster;
                    addAnimation(monster, playerSprites['monster']);
                    monster.scale = 1;

                    for (let key of Object.keys(playerPos)) {
                        if (playerPos[key] != monster) {
                            playerPos[key].shapeColor = gameColors.player;
                            addAnimation(playerPos[key], playerSprites[idToSprite[key]]);
                            playerPos[key].scale = 2;
                        }
                    }

                    isMonster = player == monster;
                    mazeStartWidth = +splitData[3];
                    mazeStartHeight = +splitData[4];
                    numberOfMazes = +splitData[5];
                    holeProbability = +splitData[6];
                    startGame();
                    break;
                case 'pos':
                    let pID = splitData[1];
                    playerPos[pID].position.x = splitData[2] * scale;
                    playerPos[pID].position.y = splitData[3] * scale;
                    playerPos[pID].changeAnimation(splitData[4]);
                    playerPos[pID].animation.playing = splitData[5] == "true";
                    break;
                case 'name':
                    idToName[splitData[1]] = splitData[2];

                    let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                    playerPos[splitData[1]] = otherPlayer;
                    allPlayers.add(otherPlayer);

                    menu.update();

                    break;
                case 'animation':
                    idToSprite[splitData[1]] = splitData[2]
                    break;
                case 'changename':
                    idToName[splitData[2]] = splitData[1];
                    menu.update();
                    break;
                case 'monsterstate':
                    monsterDead = splitData[1] == 'true';
                    monster.visible = !monsterDead;
                    break;
                case 'die':
                    if (splitData[1] == myID) {
                        die();
                    } else {
                        playerPos[splitData[1]].visible = false;
                        deadPlayers.push(playerPos[splitData[1]]);
                    }
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
                    powerups[powerupID].sprite.position.x = +splitData[2] * scale;
                    powerups[powerupID].sprite.position.y = +splitData[3] * scale;
                    powerups[powerupID].sprite.velocity.x = +splitData[4] * scale;
                    powerups[powerupID].sprite.velocity.y = +splitData[5] * scale;
                    powerups[powerupID].sprite.friction = +splitData[6];

                    if (splitData[8] == 'true') {
                        powerups[powerupID].used = 2;
                        powerups[powerupID].orientationThrown = +splitData[9];
                    }

                    if (['Boot', 'Torch', 'Hammer'].includes(powerups[powerupID].constructor.name)) {
                        powerups[powerupID].timeAvailable = +splitData[7];
                    }
                    break;
                case 'flareused':
                    minimap.flareLocations[splitData[1] + "," + splitData[2]] = color(splitData[3]);
                    minimap.flareTimings[splitData[1] + "," + splitData[2]] = splitData[4];
                    newAlert("A FLARE HAS BEEN USED");
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
                    startEnding();
                    endingMenu = !isMonster ? winMenu : loseMenu
                    break;
                case 'monsterwin':
                    startEnding();
                    endingMenu = isMonster ? winMenu : loseMenu
                    break;
                case 'disbandparty':
                    menu.changeMenu(...disbandMenu);
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

function startEnding() {
    inEnding = true;
    for (let i = 0; i < endingTime; i += endingTime / maxRenderDist) {
        renderDecreaseTimings.push(i)
    }
    renderDecreaseTimings.reverse();
    changeScale(correctScale());
}

function checkMazeCompletion() {
    if (deadPlayers.length == Object.keys(playerPos).length - 1) {
        startEnding();
        endingMenu = isMonster ? winMenu : loseMenu

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
            startEnding();
            endingMenu = !isMonster ? winMenu : loseMenu

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
            allConnections[0].send('pos,' + (player.position.x / scale) + ',' + (player.position.y / scale) + ',' + player.getAnimationLabel() + ',' + player.animation.playing);
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('pos,' + peer.id + ',' + (player.position.x / scale) + ',' + (player.position.y / scale) + ',' + player.getAnimationLabel()
                    + ',' + player.animation.playing);
                for (let c2 in allConnections) {
                    if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                        let peerID = allConnections[c2].peer;
                        allConnections[c].send('pos,' + peerID + ',' + (playerPos[peerID].position.x / scale) + ',' + (playerPos[peerID].position.y / scale) +
                            ',' + playerPos[peerID].getAnimationLabel() + ',' + playerPos[peerID].animation.playing);
                    }
                }
            }
        }
    }
}

function sendStartInfo() {
    const monsterID = Object.keys(playerPos)[floor(Math.random() * Object.keys(playerPos).length)];
    monster = playerPos[monsterID];
    addAnimation(monster, playerSprites['monster']);
    monster.scale = 1;

    let unusedSprites = Object.keys(playerSprites);
    for (let key of Object.keys(playerPos)) {
        let chosenVal = 'monster';

        if (playerPos[key] != monster) {
            let chosenIndex = null;

            while (chosenVal == 'monster') {
                chosenIndex = Math.floor(Math.random() * unusedSprites.length);
                chosenVal = unusedSprites[chosenIndex];
            }
            unusedSprites.splice(chosenIndex, 1);
        }

        idToSprite[key] = chosenVal;
    }

    for (let c of allConnections) {
        if (c && c.open) {
            c.send('animation,' + peer.id + ',' + idToSprite[peer.id]);
            for (let c2 of allConnections) {
                if (c2 && c2.open) {
                    let peerID = c2.peer;
                    c.send('animation,' + peerID + ',' + idToSprite[peerID]);
                }
            }
        }
    }

    for (let key of Object.keys(playerPos)) {
        if (playerPos[key] != monster) {
            addAnimation(playerPos[key], playerSprites[idToSprite[key]]);
            playerPos[key].scale = 2;
        }
    }

    isMonster = player == monster;

    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send('start,' + mazeSeed + ',' + monsterID + ',' + mazeStartWidth + ',' + mazeStartHeight + ',' + numberOfMazes + ',' + holeProbability);
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

function sendDisbandParty() {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send("disbandparty");
        }
    }
}

function sendChangeNameInfo() {
    for (let c in allConnections) {
        if (allConnections[c] && allConnections[c].open) {
            allConnections[c].send('changename,' + idToName[myID] + ',' + peer.id);
        }
    }
}

function sendMonsterState() {
    if (!isHost && allConnections.length == 1) {
        if (allConnections[0] && allConnections[0].open) {
            allConnections[0].send('monsterstate,' + monsterDead);
        }
    } else if (isHost) {
        for (let c of allConnections) {
            if (c && c.open) {
                c.send('monsterstate,' + monsterDead);
            }
        }
    }
}

function addAnimation(sprite, anim) {
    sprite.addAnimation('walk_front', anim['front']);
    sprite.addAnimation('walk_back', anim['back']);
    sprite.addAnimation('walk_left', anim['left']);
    sprite.addAnimation('walk_right', anim['right']);
    sprite.changeAnimation('walk_front');
}