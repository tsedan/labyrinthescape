class Menu {
    constructor() {
        this.state = "CLIENTMODE";
        this.currentMenu = new MenuOptions(...mainMenu, [idToName[myID]]);
    }

    eventHandler(data) {
        if (!data) return;

        if (this.state == "CLIENTMODE") {

            if (data == "CREATE PARTY") {
                this.state = "CREATEPARTY";
                this.currentMenu = new MenuOptions("ID: " + myID + ", " + (allConnections.length + 1) + "P", "share this id with those you want in your party", [
                    "READY TO START",
                    "BACK"
                ], ["PARTY MEMBERS:"].concat(Object.values(idToName)));
            } else if (data == "JOIN PARTY") {
                this.state = "JOINPARTY";
                this.currentMenu = new MenuPrompt("JOIN PARTY", "ask your party leader for the party id", "ENTER PARTY ID", myID.length);
            } else if (data == "SET NAME") {
                this.state = "SETNAME";
                this.currentMenu = new MenuPrompt("SET NAME", "choose a name that will be visible to all players", "ENTER USERNAME", 15);
            }

        } else if (this.state == "CREATEPARTY") {

            if (data == "READY TO START") {
                mazeSeed = Date.now();
                sendStartInfo();
                game = new Game();
                gameState = "GAME";
            } else {
                this.state = "CLIENTMODE";
                this.currentMenu = new MenuOptions(...mainMenu, [idToName[myID]]);
            }

        } else if (this.state == "JOINPARTY") {
            for (let c in allConnections)
                if (allConnections[c]) allConnections[c].close();

            let conn = peer.connect(data);

            this.state = "HANDSHAKING";
            this.currentMenu = new MenuAlert('Connecting to the Party', 'please hold until the line picks up on the other side UwU', []);

            conn.on('open', () => {
                allConnections.push(conn);

                conn.on('data', (data) => {
                    if (data == "starthandshake") {
                        this.state = "WAITROOM";
                        this.currentMenu = new MenuAlert('Room Joined', 'ask the host to start the game once all players are in',
                            ["PARTY MEMBERS:"].concat(Object.values(idToName)));

                        conn.send("confirmhandshake");
                        conn.send('name,' + idToName[myID]);
                    }

                    let splitData = data.split(",");

                    if (splitData[0] == 'start') {
                        mazeSeed = +splitData[1];
                        monster = playerPos[splitData[2]];
                        game = new Game();
                        gameState = "GAME";
                    }

                    if (splitData[0] == 'pos') {
                        let pID = splitData[1];
                        let pX = +splitData[2];
                        let pY = +splitData[3];
                        playerPos[pID].position.x = pX;
                        playerPos[pID].position.y = pY;
                    }

                    if (splitData[0] == 'name') {
                        idToName[splitData[1]] = splitData[2];

                        this.state = "WAITROOM";
                        this.currentMenu = new MenuAlert('Room Joined', 'ask the host to start the game once all players are in',
                            ["PARTY MEMBERS:"].concat(Object.values(idToName)));

                        let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                        playerPos[splitData[1]] = otherPlayer;
                    }

                    if (splitData[0] == 'die') {
                        playerPos[splitData[1]].visible = false;
                    }

                    if (splitData[0] == 'poweruppicked') {
                        console.log(data)
                        powerupsInUse.push(+splitData[1]);
                        powerups[+splitData[1]].sprite.visible = false;
                    }

                    if (splitData[0] == 'powerupdropped') {
                        console.log(data)

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

                        // last arguments will be powerup specific
                        if (['Boot', 'Torch'].includes(powerups[pID].constructor.name)) {
                            powerups[pID].timeAvailable = +splitData[6];
                        }
                    }

                });
            });
        } else if (this.state == "SETNAME") {
            idToName[myID] = data;
            this.state = "CLIENTMODE";
            this.currentMenu = new MenuOptions(...mainMenu, [idToName[myID]]);
        }
    }

    handleKey(code, key) {
        this.eventHandler(this.currentMenu.handleKey(code, key));
    }

    draw() {
        this.currentMenu.draw();
    }
}

class MenuAlert {
    constructor(header, subtitle, upperText) {
        this.header = header;
        this.subtitle = subtitle;
        this.upperText = upperText;
    }

    handleKey() { }

    draw() {
        drawBasicMenu(this.header, this.subtitle);

        textAlign(LEFT, TOP);
        textSize(48);
        const pad = 20;
        for (let i = 0; i < this.upperText.length; i++) {
            text(this.upperText[i], pad, pad + 48 * i);
        }
    }
}

class MenuPrompt {
    constructor(header, subtitle, placeholder, maxLength) {
        this.header = header;
        this.subtitle = subtitle;
        this.placeholder = placeholder;
        this.input = "";
        this.maxLength = maxLength;
        this.maxBackspaceDelay = 15;
        this.backspaceDelay = this.maxBackspaceDelay;
    }

    handleKey(code, key) {
        if (code == 8 && this.input != "") {
            this.input = this.input.substring(0, this.input.length - 1);
            this.backspaceDelay = this.maxBackspaceDelay;
        }

        if (code == 13) return this.input;

        if (validCharacters.includes(key) && this.input.length < this.maxLength) this.input += key;
        return 0;
    }

    draw() {
        if (keyIsDown(8)) {
            this.backspaceDelay--;
            if (this.backspaceDelay < 0) {
                this.backspaceDelay = 1;
                this.input = this.input.substring(0, this.input.length - 1);
            }
        }

        drawBasicMenu(this.header, this.subtitle);

        const bottom = windowHeight;
        const right = windowWidth;
        const pad = 20;

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
    constructor(header, subtitle, options, upperText, enterHandler) {
        this.header = header;
        this.subtitle = subtitle;
        this.options = options;
        this.currentOption = 0;
        this.upperText = upperText;
        this.enterHandler = enterHandler;
    }

    handleKey(code, key) {
        switch (code) {
            case 87: //W
                this.currentOption++;
                this.currentOption %= this.options.length;
                return 0;
            case 83: //S
                this.currentOption--;
                if (this.currentOption < 0) this.currentOption = this.options.length - 1;
                return 0;
            case 13: //ENTER
                return this.options[this.currentOption];
        }
    }

    draw() {
        drawBasicMenu(this.header, this.subtitle);
        const bottom = windowHeight;
        const right = windowWidth;
        const pad = 20;

        textAlign(RIGHT, BOTTOM);
        textSize(64);
        for (let i = 0; i < this.options.length; i++) {
            text((i == this.currentOption ? "> " : "") + this.options[i], right - pad, bottom - pad - 64 * i);
        }

        textAlign(LEFT, TOP);
        textSize(48);
        for (let i = 0; i < this.upperText.length; i++) {
            text(this.upperText[i], pad, pad + 48 * i);
        }
    }
}
