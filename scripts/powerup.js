class Powerup {
    constructor(sprite) {
        this.sprite = sprite;
    }

    draw() {
        //console.log(this.sprite.visible)
        this.sprite.draw();
    }
}

class Boot extends Powerup {
    constructor(sprite, timeAvailable, speedIncrease) {
        super(sprite)
        this.timeAvailable = timeAvailable;
        this.speedIncrease = speedIncrease;
        this.used = false;
    }

    startEffect() {
        maxSpeed += this.speedIncrease;
        this.timeStarted = Date.now();
    }

    update() {
        if (!this.used) {
            player.collide(this.sprite, () => {
                console.log("I COLLIDED WITH THE PLAYER " + this.speedIncrease)
                this.sprite.visible = false;
                this.startEffect();
                this.used = true;
                console.log(maxSpeed)
            })
        } else {
            // happens every time OOPS
            if (Date.now() - this.timeStarted > this.timeAvailable) {
                maxSpeed -= this.speedIncrease;
            }
        }

        super.draw();
    }
}