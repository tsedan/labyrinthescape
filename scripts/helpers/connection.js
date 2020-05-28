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
        console.log("THE GAME IS OVER, MONSTER WINS");
        gameState = "MENU";
        menu.state = "GAMEOVER";
        menu.currentMenu = new MenuOptions(...(isMonster ? winMenu : loseMenu), ["PARTY MEMBERS:"].concat(Object.values(idToName)));

        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('monsterwin');
            }
        }

        return;
    }
    if (finishedPlayers.length == 0) return;
    if (finishedPlayers.length == Object.keys(playerPos).length - deadPlayers.length - 1) {
        mazesStarted++;
        if (mazesStarted == numberOfMazes) {
            console.log("THE GAME IS OVER, PLAYERS WIN");
            gameState = "MENU";
            menu.state = "GAMEOVER";
            menu.currentMenu = new MenuOptions(...(!isMonster ? winMenu : loseMenu), ["PARTY MEMBERS:"].concat(Object.values(idToName)));

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

function connectionHost() {
    peer.on('connection', function (conn) {
        isHost = true;
        allConnections.push(conn);

        conn.on('open', function () {
            conn.send('starthandshake');

            conn.on('data', function (data) {
                let splitData = data.split(',');
                switch (splitData[0]) {
                    case 'pos':
                        playerPos[conn.peer].position.x = +splitData[1];
                        playerPos[conn.peer].position.y = +splitData[2];
                        break;
                    case 'name':
                        idToName[conn.peer] = splitData[1];
                        menu.state = "CLIENTMODE";
                        menu.eventHandler("CREATE PARTY");

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
                        powerups[pID].sprite.position.x = +splitData[2];
                        powerups[pID].sprite.position.y = +splitData[3];
                        powerups[pID].sprite.velocity.x = +splitData[4];
                        powerups[pID].sprite.velocity.y = +splitData[5];

                        if (['Boot', 'Torch'].includes(powerups[pID].constructor.name)) {
                            powerups[pID].timeAvailable = +splitData[6];
                        }

                        sendPowerupDroppedInfo(data);
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
        let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
        playerPos[conn.peer] = otherPlayer;

        menu.state = "CLIENTMODE";
        menu.eventHandler("CREATE PARTY");
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
            allConnections[0].send('pos,' + player.position.x + ',' + player.position.y);
        }
    } else if (isHost) {
        for (let c in allConnections) {
            if (allConnections[c] && allConnections[c].open) {
                allConnections[c].send('pos,' + peer.id + ',' + player.position.x + ',' + player.position.y);
                for (let c2 in allConnections) {
                    if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                        let peerID = allConnections[c2].peer;
                        allConnections[c].send('pos,' + peerID + ',' + playerPos[peerID].position.x + ',' + playerPos[peerID].position.y);
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
