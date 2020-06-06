class Powerup {
    constructor(sprite, asset) {
        this.sprite = sprite;
        this.asset = asset;
        this.useVerb = 'USE';

        this.pickupDelay = 0;
        this.maxPickupDelay = 60;
    }

    draw() {
        this.pickupDelay = max(this.pickupDelay - 1, 0);
        this.sprite.collide(walls, () => {
            if (this.sprite.touching.bottom || this.sprite.touching.top) this.sprite.velocity.y = 0;
            if (this.sprite.touching.left || this.sprite.touching.right) this.sprite.velocity.x = 0;
        });
        const hyp = dist(player.position.x, player.position.y, this.sprite.position.x, this.sprite.position.y);
        const maxHyp = maxRenderDist * scale;
        if (hyp <= maxHyp && this.sprite.visible)
            image(allAssets[this.asset][floor((100 / lightInt) * (hyp / maxHyp))], this.sprite.position.x, this.sprite.position.y, this.sprite.width, this.sprite.height);
    }

    drop() {
        this.sprite.visible = true;
        this.sprite.position.x = player.position.x;
        this.sprite.position.y = player.position.y;

        this.sprite.setSpeed(scale / 5, orientation);
        this.sprite.friction = (friction == 0 ? 0 : 1 / friction);

        this.sendDropInfo();
    }

    sendPickupInfo() {
        if (!isHost && allConnections.length == 1) {
            if (allConnections[0] && allConnections[0].open) {
                allConnections[0].send('poweruppicked,' + this.index);
            }
        } else {
            powerupsInUse.push(this.index);
            sendPowerupUsedInfo(this.index);
        }
    }

    sendDropInfo() {
        let d = ['powerupdropped', this.index, this.sprite.position.x / scale, this.sprite.position.y / scale,
            this.sprite.velocity.x / scale, this.sprite.velocity.y / scale, this.sprite.friction, this.timeAvailable, false].join(',');
        if (!isHost && allConnections.length == 1) {
            if (allConnections[0] && allConnections[0].open) {
                allConnections[0].send(d);
            }
        } else {
            for (let p in powerupsInUse) {
                if (powerupsInUse[p] == this.index) {
                    powerupsInUse.splice(p, 1);
                }
            }
            sendPowerupDroppedInfo(d);
        }
    }

    setIndex() {
        for (let p in powerups) {
            if (powerups[p] == this) {
                this.index = p;
                break;
            }
        }
    }
}

class Boot extends Powerup {
    constructor(sprite, timeAvailable, speedIncrease) {
        super(sprite, "boots");
        this.timeAvailable = timeAvailable;
        this.maxTime = timeAvailable;
        this.speedIncrease = speedIncrease;
        // 0 - never used, 1 - in use, 2 - already used
        this.used = 0;
    }

    startEffect() {
        maxSpeed -= this.speedIncrease;
    }

    removeEffect() {
        maxSpeed += this.speedIncrease;
    }

    draw() {
        super.draw();
    }

    update() {
        this.draw();

        switch (this.used) {
            case 0:
                if (heldItem) break;

                let alreadyInUse = false;

                player.overlap(this.sprite, () => {
                    for (let i in powerupsInUse) {
                        if (powerupsInUse[i] == this.index) {
                            alreadyInUse = true;
                        }
                    }

                    if (!alreadyInUse && this.pickupDelay == 0) {
                        this.pickupDelay = this.maxPickupDelay;
                        this.sprite.visible = false;
                        this.startEffect();
                        this.used = 1;
                        heldItem = this;
                        super.sendPickupInfo();
                    }
                });
                break;

            case 1:
                this.timeAvailable -= deltaTime;
                if (this.timeAvailable < 0) {
                    this.removeEffect();
                    this.used = 2;
                    heldItem = null;
                }

                // q
                if (keyIsDown(81)) {
                    this.removeEffect();
                    this.used = 0;
                    heldItem = null;
                    super.drop();
                }

                break;
        }
    }
}

class Torch extends Powerup {
    constructor(sprite, timeAvailable, renderIncrease) {
        super(sprite, "torch");
        this.timeAvailable = timeAvailable;
        this.maxTime = timeAvailable;
        this.renderIncrease = renderIncrease;
        // 0 - never used, 1 - in use, 2 - already used
        this.used = 0;
    }

    startEffect() {
        maxRenderDist += this.renderIncrease;
    }

    removeEffect() {
        maxRenderDist -= this.renderIncrease;
    }

    draw() {
        super.draw();
    }

    update() {
        this.draw();

        switch (this.used) {
            case 0:
                if (heldItem) break;

                let alreadyInUse = false;

                player.overlap(this.sprite, () => {
                    for (let i in powerupsInUse) {
                        if (powerupsInUse[i] == this.index) {
                            alreadyInUse = true;
                        }
                    }

                    if (!alreadyInUse && this.pickupDelay == 0) {
                        this.pickupDelay = this.maxPickupDelay;
                        this.sprite.visible = false;
                        this.startEffect();
                        this.used = 1;
                        heldItem = this;
                        super.sendPickupInfo();
                    }
                });
                break;

            case 1:
                this.timeAvailable -= deltaTime;
                if (this.timeAvailable < 0) {
                    this.removeEffect();
                    this.used = 2;
                    heldItem = null;
                }

                // q
                if (keyIsDown(81)) {
                    this.removeEffect();
                    this.used = 0;
                    heldItem = null;
                    super.drop();
                }

                break;
        }
    }
}

class GPS extends Powerup {
    constructor(sprite, timeAvailable) {
        super(sprite, "gps");
        this.angle = 0;
        this.chosen = player;

        this.timeAvailable = timeAvailable;
        this.maxTime = timeAvailable;

        this.arrowHeadDist = 120;
        this.arrowInnerDist = 80
        this.arrowWingAngle = Math.PI * 15 / 180;

        // 0 - never used, 1 - in inv, 2 - in use, 3 - already used
        this.used = 0;
    }

    choosePlayer() {
        if (isMonster) {
            let potential = [];
            for (let p of allPlayers) {
                if (p != player && deadPlayers.indexOf(p) == -1) potential.push(p);
            }

            if (potential.length == 0) return;

            this.chosen = potential[Math.floor(Math.random() * potential.length)]

        } else {
            this.chosen = monster;
        }
    }

    setAngle() {
        this.angle = Math.atan2(-(this.chosen.position.y - player.position.y), this.chosen.position.x - player.position.x);
    }

    draw() {
        super.draw();
    }

    update() {
        this.draw();

        switch (this.used) {
            case 0:
                if (heldItem) break;

                let alreadyInUse = false;

                player.overlap(this.sprite, () => {
                    for (let i in powerupsInUse) {
                        if (powerupsInUse[i] == this.index) {
                            alreadyInUse = true;
                        }
                    }

                    if (!alreadyInUse && this.pickupDelay == 0) {
                        this.pickupDelay = this.maxPickupDelay;
                        this.sprite.visible = false;
                        this.used = 1;
                        heldItem = this;
                        super.sendPickupInfo();
                    }
                });
                break;

            case 1:

                // q
                if (keyIsDown(81)) {
                    this.used = 0;
                    heldItem = null;
                    super.drop();
                }

                // space
                if (keyIsDown(32)) {
                    this.used = 2;

                    this.choosePlayer();

                    let d = Math.round(Math.hypot(this.chosen.position.x - player.position.x, this.chosen.position.y - player.position.y) / scale);
                    newAlert("THE " + (this.chosen == monster ? "TRACKED PLAYER" : "MONSTER") + " IS " + d + " UNITS AWAY FROM YOU");
                }

                break;

            case 2:
                this.timeAvailable -= deltaTime;

                this.setAngle();

                fill(255);
                noStroke();
                triangle(
                    player.position.x + Math.cos(this.angle - this.arrowWingAngle) * this.arrowInnerDist,
                    player.position.y - Math.sin(this.angle - this.arrowWingAngle) * this.arrowInnerDist,
                    player.position.x + Math.cos(this.angle + this.arrowWingAngle) * this.arrowInnerDist,
                    player.position.y - Math.sin(this.angle + this.arrowWingAngle) * this.arrowInnerDist,
                    player.position.x + Math.cos(this.angle) * this.arrowHeadDist,
                    player.position.y - Math.sin(this.angle) * this.arrowHeadDist,
                );

                let d = Math.round(Math.hypot(this.chosen.position.x - player.position.x, this.chosen.position.y - player.position.y) / scale);
                alertMsg = "THE " + (this.chosen == monster ? "MONSTER" : "TRACKED PLAYER") + " IS " + d + " UNITS AWAY FROM YOU";
                alertTime = 255;

                if (this.timeAvailable < 0) {
                    this.used = 3;
                    heldItem = null;
                }
        }
    }
}

class Flare extends Powerup {
    constructor(sprite, timeAvailable) {
        super(sprite, "flare");
        this.timeAvailable = timeAvailable;

        // 0 - never used, 1 - in inv, 2 - used
        this.used = 0;
    }

    use() {
        let d = ['flareused', floor(player.position.x / scale), floor(player.position.y / scale), player.shapeColor, this.timeAvailable];

        if (isMonster) {
            let potential = [];
            for (let p of allPlayers) {
                if (p != player && deadPlayers.indexOf(p) == -1) potential.push(p);
            }

            if (potential.length != 0) {
                let chosen = potential[Math.floor(Math.random() * potential.length)]
                d = ['flareused', floor(player.position.x / scale), floor(player.position.y / scale), chosen.shapeColor, this.timeAvailable];

                minimap.flareLocations[d[1] + "," + d[2]] = color(d[3]);
                minimap.flareTimings[d[1] + "," + d[2]] = this.timeAvailable;
                newAlert("A FLARE HAS BEEN USED");
            }
        }

        if (!isHost && allConnections.length == 1) {
            if (allConnections[0] && allConnections[0].open) {
                allConnections[0].send(d.join(','));
            }
        } else {
            minimap.flareLocations[d[1] + "," + d[2]] = color(d[3]);
            minimap.flareTimings[d[1] + "," + d[2]] = this.timeAvailable;
            newAlert("A FLARE HAS BEEN USED");

            sendFlareUsedInfo(d.join(','));
        }
    }

    draw() {
        super.draw();
    }

    update() {
        this.draw();

        switch (this.used) {
            case 0:
                if (heldItem) break;

                let alreadyInUse = false;

                player.overlap(this.sprite, () => {
                    for (let i in powerupsInUse) {
                        if (powerupsInUse[i] == this.index) {
                            alreadyInUse = true;
                        }
                    }

                    if (!alreadyInUse && this.pickupDelay == 0) {
                        this.pickupDelay = this.maxPickupDelay;
                        this.sprite.visible = false;
                        this.used = 1;
                        heldItem = this;
                        super.sendPickupInfo();
                    }
                });
                break;

            case 1:

                // space
                if (keyIsDown(32)) {
                    this.used = 2;
                    this.use();
                    heldItem = null;
                }

                // q
                if (keyIsDown(81)) {
                    this.used = 0;
                    heldItem = null;
                    super.drop();
                }

                break;
        }
    }
}

class Hammer extends Powerup {
    constructor(sprite, timeAvailable) {
        super(sprite, "hammer");

        // number of uses, weird name so inv works
        this.timeAvailable = timeAvailable;
        this.maxTime = timeAvailable;

        // 0 - never used, 1 - in inv, 2 - used
        this.used = 0;
    }

    use() {
        let cX = floor(player.position.x / scale);
        let cY = floor(player.position.y / scale);

        let chosen = null;

        if (orientation == 0 && cX < m.W - 1) chosen = [cX + 1, cY];
        if (orientation == 180 && cX > 0) chosen = [cX - 1, cY];
        if (orientation == 90 && cY < m.H - 1) chosen = [cX, cY + 1];
        if (orientation == 270 && cY > 0) chosen = [cX, cY - 1];

        if (chosen === null || m.grid[chosen[1]][chosen[0]] == 0) return;
        this.timeAvailable--;

        if (!isHost && allConnections.length == 1) {
            if (allConnections[0] && allConnections[0].open) {
                allConnections[0].send("hammerused," + chosen[0] + "," + chosen[1]);
            }
        } else {
            removeWall(chosen);
            sendHammerUsedInfo(chosen);
        }

    }

    draw() {
        super.draw();
    }

    update() {
        this.draw();

        switch (this.used) {
            case 0:
                if (heldItem) break;

                let alreadyInUse = false;

                player.overlap(this.sprite, () => {
                    for (let i in powerupsInUse) {
                        if (powerupsInUse[i] == this.index) {
                            alreadyInUse = true;
                        }
                    }

                    if (!alreadyInUse && this.pickupDelay == 0) {
                        this.pickupDelay = this.maxPickupDelay;
                        this.sprite.visible = false;
                        this.used = 1;
                        heldItem = this;
                        super.sendPickupInfo();
                    }
                });
                break;

            case 1:

                // space
                if (keyIsDown(32)) {
                    this.use();
                    if (this.timeAvailable <= 0) {
                        this.used = 2;
                        heldItem = null;
                    }
                }

                // q
                if (keyIsDown(81)) {
                    this.used = 0;
                    heldItem = null;
                    super.drop();
                }

                break;
        }
    }
}

class ThrowingKnife extends Powerup {
    constructor(sprite) {
        super(sprite, "knife");

        // 0 - never used, 1 - in inv, 2 - being thrown
        this.used = 0;
    }

    use() {
        this.sprite.visible = true;
        this.sprite.position.x = player.position.x;
        this.sprite.position.y = player.position.y;

        if (orientation == 0) this.sprite.position.x += scale / 2
        if (orientation == 180) this.sprite.position.x += -scale / 2
        if (orientation == 90) this.sprite.position.y += scale / 2
        if (orientation == 270) this.sprite.position.y += -scale / 2

        this.sprite.setSpeed(20, orientation);
        this.sprite.friction = 0;

        let d = ['powerupdropped', this.index, this.sprite.position.x / scale, this.sprite.position.y / scale,
            this.sprite.velocity.x / scale, this.sprite.velocity.y / scale, this.sprite.friction, this.timeAvailable, true].join(',');
        if (!isHost && allConnections.length == 1) {
            if (allConnections[0] && allConnections[0].open) {
                allConnections[0].send(d);
            }
        } else {
            for (let p in powerupsInUse) {
                if (powerupsInUse[p] == this.index) {
                    powerupsInUse.splice(p, 1);
                }
            }
            sendPowerupDroppedInfo(d)
        }
    }

    draw() {
        super.draw();
    }

    update() {
        this.draw();

        switch (this.used) {
            case 0:
                if (heldItem) break;

                player.overlap(this.sprite, () => {
                    let alreadyInUse = false;
                    for (let i in powerupsInUse)
                        if (powerupsInUse[i] == this.index)
                            alreadyInUse = true;

                    if (!alreadyInUse) {
                        if (!isMonster) {
                            if (this.pickupDelay == 0) {
                                this.pickupDelay = this.maxPickupDelay;
                                this.sprite.visible = false;
                                this.used = 1;
                                heldItem = this;
                                super.sendPickupInfo();
                            }
                        } else {
                            newAlert("AS THE MONSTER, YOU CANNOT PICK UP A KNIFE");
                        }
                    }
                });
                break;

            case 1:

                // space
                if (keyIsDown(32)) {
                    this.use();
                    this.used = 2;
                    heldItem = null;
                }

                // q
                if (keyIsDown(81)) {
                    this.used = 0;
                    heldItem = null;
                    super.drop();
                }

                break;

            case 2:
                if (this.sprite.getSpeed() < 0.01) this.used = 0;

                player.overlap(this.sprite, () => {
                    let alreadyInUse = false;
                    for (let i in powerupsInUse) {
                        if (powerupsInUse[i] == this.index) {
                            alreadyInUse = true;
                        }
                    }

                    if (!alreadyInUse) {
                        if (isMonster) {
                            this.sprite.setVelocity(0, 0);
                            this.sprite.visible = false;
                            super.sendPickupInfo();
                            this.used = 3;
                            player.position.x = originalMonsterLoc[0];
                            player.position.y = originalMonsterLoc[1];
                            newAlert("YOU'VE BEEN KILLED BY A PLAYER");
                        } else if (this.pickupDelay == 0) {
                            this.pickupDelay = this.maxPickupDelay;
                            this.sprite.setVelocity(0, 0);
                            this.sprite.visible = false;
                            super.sendPickupInfo();
                            this.used = 1;
                            heldItem = this;
                        }
                    }
                });
                break;
        }
    }
}
