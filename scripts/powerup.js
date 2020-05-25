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
        console.log(this.index)
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
        console.log(this.index)
        if (!isHost && allConnections.length == 1) {
            if (allConnections[0] && allConnections[0].open) {
                allConnections[0].send(['powerupdropped', this.index, this.sprite.position.x, this.sprite.position.y,
                    this.sprite.velocity.x, this.sprite.velocity.y, this.timeAvailable].join(','));
            }
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
        this.speedIncrease = speedIncrease;
        // 0 - never used, 1 - in use, 2 - already used
        this.used = 0;
    }

    startEffect() {
        maxSpeed += this.speedIncrease;
        this.timeStarted = Date.now();
    }

    removeEffect() {
        maxSpeed -= this.speedIncrease;
    }

    update() {
        super.draw();

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
                if (Date.now() - this.timeStarted > this.timeAvailable) {
                    console.log("losing my speed increase")
                    this.removeEffect();
                    this.used = 2;
                    heldItem = null;
                }

                // q
                if (keyIsDown(81)) {
                    this.removeEffect();
                    this.timeAvailable = this.timeAvailable - (Date.now() - this.timeStarted);
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
        this.renderIncrease = renderIncrease;
        // 0 - never used, 1 - in use, 2 - already used
        this.used = 0;
    }

    startEffect() {
        maxRenderDist += this.renderIncrease;
        this.timeStarted = Date.now();
    }

    removeEffect() {
        maxRenderDist -= this.renderIncrease;
    }

    update() {
        super.draw();

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
                if (Date.now() - this.timeStarted > this.timeAvailable) {
                    console.log("losing my render increase")
                    this.removeEffect();
                    this.used = 2;
                    heldItem = null;
                }

                // q
                if (keyIsDown(81)) {
                    this.removeEffect();
                    this.timeAvailable = this.timeAvailable - (Date.now() - this.timeStarted);
                    this.used = 0;
                    heldItem = null;
                    super.drop();
                }

                break;
        }
    }
}