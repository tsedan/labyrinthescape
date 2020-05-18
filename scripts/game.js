class Game {
    constructor() {
        this.newMaze();
    }

    newMaze() {
        genMaze(mazeStartWidth, mazeStartHeight, holeProbability, powerUpNum, mazeSeed);

        console.log(allPlayers)
    }

    draw() {
        this.sendPositionData();
        background(gameColors.wall);

        if (mazesStarted > numberOfMazes) return;

        camera.position.x = (friction * camera.position.x + player.position.x + windowWidth / 2) / (friction + 1);
        camera.position.y = (friction * camera.position.y + player.position.y + windowHeight / 2) / (friction + 1);

        ambientLight(0);
        spotLight(255, 255, 255, 0, 0, 1500, 0, 0, -1);

        updateVelocities();
        allPlayers.collide(walls);
        player.collide(exit, this.newMaze);
        minimap.update(floor(player.position.x / scale), floor(player.position.y / scale));

        drawSprite(backMaze);
        drawSprites(walls);

        drawSprites(powerups);

        drawSprite(exit);
        drawSprite(start);

        drawSprites(allPlayers);

        camera.off();
        //createMask();
        minimap.draw();
    }

    sendPositionData() {
        if (!isHost && allConnections.length == 1) {
            if (allConnections[0] && allConnections[0].open) {
                allConnections[0].send("PLAYER POSITION DATA," + player.position.x + "," + player.position.y);
            }
        } else if (isHost) {
            for (let c in allConnections) {
                if (allConnections[c] && allConnections[c].open) {
                    allConnections[c].send("PLAYER POSITION DATA," + peer.id + "," + player.position.x + "," + player.position.y);
                    for (let c2 in allConnections) {
                        if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                            let peerID = allConnections[c2].peer;
                            allConnections[c].send("PLAYER POSITION DATA," + peerID + "," + playerPos[peerID].position.x + "," + playerPos[peerID].position.y);
                        }
                    }
                }
            }
        }
    }
}
