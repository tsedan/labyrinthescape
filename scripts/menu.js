class Menu {
    constructor() {
        this.state = "CLIENTMODE";
        this.currentMenu = new MenuOptions("HUNTER'S MAZE", "use w, s, and enter to navigate the menus", [
            "CREATE PARTY",
            "JOIN PARTY"
        ]);
    }

    handleKey(code) {
        this.currentMenu.handleKey(code);
    }

    draw() {
        this.currentMenu.draw();
    }
}

class MenuOptions {
    constructor(header, subtitle, options) {
        this.header = header;
        this.subtitle = subtitle;
        this.options = options;
        this.currentOption = 0;
    }

    handleKey(code) {
        switch (code) {
            case 87: //W
                this.currentOption++;
                this.currentOption %= this.options.length;
                break;
            case 83: //S
                this.currentOption--;
                if (this.currentOption < 0) this.currentOption = this.options.length-1;
                break;
            case 13: //ENTER
                gameState = "GAME";
                break;
        }
    }

    draw() {
        background(gameColors.wall);
        noStroke();
        textFont(font);
        fill(255);

        const bottom = height/2;
        const left = -width/2;
        const right = width/2;
        const pad = 20;

        textAlign(LEFT, BOTTOM);
        textSize(64);
        text(this.header, left + pad, bottom - pad - 32);
        textSize(32);
        text(this.subtitle, left + pad, bottom - pad);

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        for (let i = 0; i < this.options.length; i++) {
            text((i == this.currentOption ? "> " : "") + this.options[i], right - pad, bottom - pad - 64*i);
        }
    }
}
