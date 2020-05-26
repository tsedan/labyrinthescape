class Powerup {
    constructor(sprite) {
        this.sprite = sprite;
    }

    draw() {
        this.sprite.collide(walls);
        this.sprite.velocity.x *= friction / (friction + 1);
        this.sprite.velocity.y *= friction / (friction + 1);
        drawSprite(this.sprite);
    }

    drop() {
        this.sprite.visible = true;
        this.sprite.position.x = player.position.x;
        this.sprite.position.y = player.position.y;

        if (orientation == 0) this.sprite.position.x += scale / 2
        if (orientation == 180) this.sprite.position.x += -scale / 2
        if (orientation == 90) this.sprite.position.y += scale / 2
        if (orientation == 270) this.sprite.position.y += -scale / 2

        this.sprite.setSpeed(10, orientation);

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
        let d = ['powerupdropped', this.index, this.sprite.position.x, this.sprite.position.y,
            this.sprite.velocity.x, this.sprite.velocity.y, this.timeAvailable].join(',');
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
        super(sprite)
        this.timeAvailable = timeAvailable;
        this.maxTime = timeAvailable;
        this.speedIncrease = speedIncrease;
        // 0 - never used, 1 - in use, 2 - already used
        this.used = 0;
    }

    startEffect() {
        maxSpeed += this.speedIncrease;
    }

    removeEffect() {
        maxSpeed -= this.speedIncrease;
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

                    if (!alreadyInUse) {
                        console.log("picking up boots " + this.timeAvailable)
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
                    console.log("losing my speed increase")
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
        super(sprite)
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

                    if (!alreadyInUse) {
                        console.log("picking up torch " + this.timeAvailable)
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
                    console.log("losing my render increase")
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
