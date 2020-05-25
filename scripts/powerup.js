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
        switch (this.used) {
            case 0:
                if (heldItem) break;

                player.overlap(this.sprite, () => {
                    console.log("picking up boots " + this.timeAvailable)
                    this.sprite.visible = false;
                    this.startEffect();
                    this.used = 1;
                    heldItem = this;
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

        super.draw();
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
        switch (this.used) {
            case 0:
                if (heldItem) break;

                player.overlap(this.sprite, () => {
                    console.log("picking up torch " + this.timeAvailable)
                    this.sprite.visible = false;
                    this.startEffect();
                    this.used = 1;
                    heldItem = this;
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

        super.draw();
    }
}