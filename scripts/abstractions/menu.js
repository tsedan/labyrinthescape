class Menu {
    constructor() { }

    eventHandler() {
        if (this.options.length == 0) return;
        const opt = this.options[this.currOption];
        opt.eventHandler(opt.value);
    }

    changeMenu(state, title, subtitle, options) {
        this.state = state;
        this.title = title;
        this.subtitle = subtitle;
        this.options = options;
        this.currOption = 0;
        this.update();
    }

    update() {
        this.upper = Object.values(idToName);

        if (this.state == hostMenu[0] || this.state == modeMenu[0])
            this.title = hostMenu[1].replace("myID", myID).replace("nmPl", allConnections.length + 1);
    }

    handleKey(code, key) {
        if (this.options.length == 0) return;
        if (code == 38) {
            this.currOption++;
            this.currOption %= this.options.length;
        } else if (code == 40) {
            this.currOption--;
            if (this.currOption < 0) this.currOption = this.options.length - 1;
        } else if (code == 13) {
            this.eventHandler();
        } else if (this.state == hostMenu[0] && code == 67 && controlPressed()) {
            if (navigator.clipboard.writeText) {
                navigator.clipboard.writeText(myID);
                menu.subtitle = 'copied!';
            }
        } else {
            this.options[this.currOption].handleKey(code, key);
        }
    }

    draw() {
        if (this.state == modeMenu[0] && this.currOption > 0 && (keyIsDown(37) || keyIsDown(39))) {
            this.eventHandler();
        }

        if (this.connectionTimer && this.state == connMenu[0]) {
            if (this.connectionTimer > 0)
                this.connectionTimer -= deltaTime;
            else
                this.changeMenu(...failMenu);
        }

        drawBasicMenu(this.title, this.subtitle, this.upper);

        for (let opt in this.options) {
            this.options[opt].draw(windowWidth, windowHeight - opt * 64, this.currOption == opt);
        }
    }
}

class MenuPrompt {
    constructor(placeholder, maxLength, eventHandler) {
        this.value = "";
        this.placeholder = placeholder;

        this.eventHandler = eventHandler;

        this.maxLength = maxLength;
        this.maxBackspaceDelay = 15;
        this.backspaceDelay = this.maxBackspaceDelay;
    }

    handleKey(code, key) {
        if (code == 8 && this.value != "") {
            this.value = this.value.substring(0, this.value.length - 1);
            this.backspaceDelay = this.maxBackspaceDelay;
            return;
        }

        if (code == 67 && controlPressed()) {
            if (navigator.clipboard.writeText) {
                navigator.clipboard.writeText(this.value);
                menu.subtitle = 'copied!';
            }
            return;
        }

        if (code == 86 && controlPressed()) {
            if (navigator.clipboard.readText)
                navigator.clipboard.readText().then(text => { this.value += text.substring(0, this.maxLength - this.value.length) });
            return;
        }

        if (validCharacters.includes(key) && this.value.length < this.maxLength) this.value += key;
    }

    draw(right, bottom, isSelected) {
        if (isSelected && keyIsDown(8)) {
            this.backspaceDelay--;
            if (this.backspaceDelay < 0) {
                this.backspaceDelay = 1;
                this.value = this.value.substring(0, this.value.length - 1);
            }
        }

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        fill(this.value == "" ? 140 : 255);
        text((isSelected ? "> " : "") + (this.value == "" ? this.placeholder : this.value), right - uiPadding, bottom - uiPadding);
    }
}

class MenuOption {
    constructor(value, eventHandler) {
        this.value = value;
        this.eventHandler = eventHandler;
    }

    handleKey(code, key) { }

    draw(right, bottom, isSelected) {
        textAlign(RIGHT, BOTTOM);
        textSize(64);
        fill(255);
        text((isSelected ? "> " : "") + this.value, right - uiPadding, bottom - uiPadding);
    }
}

class MenuSlide {
    constructor(def, minVal, maxVal, label, eventHandler) {
        this.value = def;

        this.eventHandler = eventHandler;

        this.minVal = minVal;
        this.maxVal = maxVal;

        this.label = label;

        this.maxDelay = 15;
        this.leftDelay = this.maxDelay;
        this.rightDelay = this.maxDelay;
    }

    handleKey(code, key) {

        if (code == 37 && this.value > this.minVal) {
            this.value--;
            this.leftDelay = this.maxDelay;
        }

        if (code == 39 && this.value < this.maxVal) {
            this.value++;
            this.rightDelay = this.maxDelay;
        }
    }

    draw(right, bottom, isSelected) {
        if (isSelected && keyIsDown(37) && this.value > this.minVal) {
            this.leftDelay--;
            if (this.leftDelay < 0) {
                this.leftDelay = 1;
                this.value--;
            }
        }

        if (isSelected && keyIsDown(39) && this.value < this.maxVal) {
            this.rightDelay--;
            if (this.rightDelay < 0) {
                this.rightDelay = 1;
                this.value++;
            }
        }

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        fill(255);
        text((isSelected ? "> " : "") + this.label + ": " + this.value, right - uiPadding, bottom - uiPadding);
    }
}
