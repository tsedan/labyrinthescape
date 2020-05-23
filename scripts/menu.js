class Menu {
    constructor() {
        this.state = "CLIENTMODE";
        this.currentMenu = new MenuOptions("HUNTER'S MAZE", "use w, s, and enter to navigate the menus", [
            "CREATE PARTY",
            "JOIN PARTY",
            "SET NAME"
        ], []);
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
                this.currentMenu = new MenuPrompt("JOIN PARTY", "ask your party leader for the party id", "ENTER PARTY ID", 6);

            } else if (data == "SET NAME") {
                this.state = "SETNAME";
                this.currentMenu = new MenuPrompt("SET NAME", "choose a name that will be visible to all players", "ENTER USERNAME", 15);
            }

        } else if (this.state == "CREATEPARTY") {

            if (data == "READY TO START") {
                gameState = "GAME";
                mazeSeed = Date.now();

                game = new Game();
                console.log(idToName)

                for (let c in allConnections) {
                    if (allConnections[c] && allConnections[c].open) {
                        allConnections[c].send('id,' + peer.id);
                        for (let c2 in allConnections) {
                            if (allConnections[c2] && allConnections[c2].open && allConnections[c] != allConnections[c2]) {
                                allConnections[c].send('id,' + allConnections[c2].peer);
                            }
                        }
                        allConnections[c].send('start,' + mazeSeed);
                    }
                }

            } else {
                this.state = "CLIENTMODE";
                this.currentMenu = new MenuOptions("HUNTER'S MAZE", "use w, s, and enter to navigate the menus", [
                    "CREATE PARTY",
                    "JOIN PARTY",
                    "SET NAME"
                ], []);
            }

        } else if (this.state == "JOINPARTY") {
            for (let c in allConnections)
                if (allConnections[c]) allConnections[c].close();

            let conn = peer.connect(prefix + data);

            this.state = "WAITROOM";
            this.currentMenu = new MenuAlert('Room Joined', 'ask the host to start the game once all players are in');

            conn.on('open', function () {
                allConnections.push(conn);
                conn.send('name,' + idToName[prefix + myID]);
            });

            conn.on('data', function (data) {
                let splitData = data.split(",");
                if (splitData[0] == 'start') {
                    gameState = "GAME";

                    mazeSeed = +splitData[1];
                    game = new Game();
                }

                if (splitData[0] == 'pos') {
                    let pID = splitData[1];
                    let pX = +splitData[2];
                    let pY = +splitData[3];
                    playerPos[pID].position.x = pX;
                    playerPos[pID].position.y = pY;
                }

                if (splitData[0] == 'id') {
                    let otherPlayer = genObj(0, 0, scale / 2, scale / 2, gameColors.player);
                    playerPos[splitData[1]] = otherPlayer;
                }

            });
        } else if (this.state == "SETNAME") {
            idToName[prefix + myID] = data;
            this.state = "CLIENTMODE";
            this.currentMenu = new MenuOptions("HUNTER'S MAZE", "use w, s, and enter to navigate the menus", [
                "CREATE PARTY",
                "JOIN PARTY",
                "SET NAME"
            ], []);
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
