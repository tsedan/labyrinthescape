class Menu {
    constructor() {
        this.state = "CLIENTMODE";
        this.currentMenu = new MenuOptions("HUNTER'S MAZE", "use w, s, and enter to navigate the menus", [
            "CREATE PARTY",
            "JOIN PARTY"
        ], this.enterHandler);
    }

    enterHandler(data) {
        gameState = "GAME";
    }

    handleKey(code, key) {
        this.currentMenu.handleKey(code, key);
    }

    draw() {
        this.currentMenu.draw();
    }
}

class MenuPrompt {
    constructor(header, subtitle, placeholder, enterHandler) {
        this.header = header;
        this.subtitle = subtitle;
        this.placeholder = placeholder;
        this.input = "";
        this.enterHandler = enterHandler;
        this.maxBackspaceDelay = 15;
        this.backspaceDelay = this.maxBackspaceDelay;
    }

    handleKey(code, key) {
        if (code == 8 && this.input != "") {
            this.input = this.input.substring(0,this.input.length-1);
            this.backspaceDelay = this.maxBackspaceDelay;
        }

        if (code == 13)
            this.enterHandler(this.input);

        if (validCharacters.includes(key)) this.input += key;
    }

    draw() {
        if (keyIsDown(8)) {
            this.backspaceDelay--;
            if (this.backspaceDelay < 0) {
                this.backspaceDelay = 1;
                this.input = this.input.substring(0,this.input.length-1);
            }
        }

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
        if (this.input == "") {
            fill(140);
            text(this.placeholder, right - pad, bottom - pad);
        } else {
            text(this.input, right - pad, bottom - pad);
        }
    }
}

class MenuOptions {
    constructor(header, subtitle, options, enterHandler) {
        this.header = header;
        this.subtitle = subtitle;
        this.options = options;
        this.currentOption = 0;
        this.enterHandler = enterHandler;
    }

    handleKey(code, key) {
        switch (code) {
            case 87: //W
                this.currentOption++;
                this.currentOption %= this.options.length;
                break;
            case 83: //S
                this.currentOption--;
                if (this.currentOption < 0) this.currentOption = this.options.length-1;
                break
            case 13: //ENTER
                this.enterHandler(this.currentOption);
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
