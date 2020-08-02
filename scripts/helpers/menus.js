function initMenus() {
    mainMenu = [
        "MAINMENU", "MAIN MENU", "use [up], [down] and [enter] to navigate the menus",
        [
            new MenuOption("CREATE PARTY", () => { menu.changeMenu(...hostMenu) }),
            new MenuOption("JOIN PARTY", () => { menu.changeMenu(...joinMenu) }),
            new MenuOption("CHANGE NAME", () => { menu.changeMenu(...nameMenu) }),
            new MenuOption("VIEW TUTORIAL", () => { menu.changeMenu(...tutorialMenu) })
        ]
    ];

    kickMenu = [
        "KICKMENU", "KICKED FROM THE PARTY", "you've been kicked by the party leader",
        [
            new MenuOption("DANG IT", () => { menu.changeMenu(...joinMenu) })
        ]
    ];

    tutorialMenu = [
        "TUTORIALMENU", "HOW TO PLAY", "this will cover everything you need to know to play",
        [
            new MenuOption("BACK", () => { menu.changeMenu(...mainMenu) }),
            new MenuOption("PREVIOUS PAGE", () => {
                if (currentTutorialPage > 0) currentTutorialPage--;
                else currentTutorialPage = numTutorialPages - 1;
            }),
            new MenuOption("NEXT PAGE", () => { currentTutorialPage = (currentTutorialPage + 1) % numTutorialPages }),
        ]
    ];

    nameMenu = [
        "NAMEMENU", "SET YOUR USERNAME", "your username will be displayed to others in your party",
        [
            new MenuPrompt("TYPE YOUR USERNAME", maxUsernameLength, validCharacters + ' ', data => {
                if (data != "") {
                    idToName[myID] = data;
                    menu.changeMenu(...mainMenu);
                    sendChangeNameInfo();
                }
            }),
            new MenuOption("BACK", () => { menu.changeMenu(...mainMenu) })
        ]
    ];

    waitingNameMenu = [
        "WAITINGNAMEMENU", nameMenu[1], nameMenu[2],
        [
            new MenuPrompt("TYPE YOUR USERNAME", maxUsernameLength, validCharacters + ' ', data => {
                if (data != "") {
                    idToName[myID] = data;
                    menu.changeMenu(...waitMenu);
                    sendChangeNameInfo();
                }
            }),
            new MenuOption("BACK", () => { menu.changeMenu(...waitMenu) })
        ]
    ]

    startNameMenu = [
        "STARTNAMEMENU", nameMenu[1], nameMenu[2],
        [
            new MenuPrompt("TYPE YOUR USERNAME", maxUsernameLength, validCharacters + ' ', data => {
                if (data != "") {
                    idToName[myID] = data;
                    menu.changeMenu(...mainMenu);
                }
            }),
        ]
    ]

    notSupportedMenu = [
        "NOTSUPPORTEDMENU", "BROWSER UNSUPPORTED", "please switch to a supported browser (chrome recommended)", []
    ]

    joinMenu = [
        "JOINMENU", "JOIN A PARTY", "ask your party leader for the party id",
        [
            new MenuPrompt("TYPE THE PARTY ID", idLength, validCharacters, data => {
                if (data.length == idLength) {
                    connectToHost(data);
                    menu.changeMenu(...connMenu);
                    menu.connectionTimer = connectionFailTime;
                } else {
                    menu.subtitle = "the id must have a length of " + idLength
                }
            }),
            new MenuOption("BACK", () => { menu.changeMenu(...mainMenu) })
        ]
    ];
    connMenu = [
        "CONNMENU", "AWAITING CONNECTION", "please wait for the party connection to initialize", []
    ];

    failMenu = [
        "CONNFAILMENU", "CONNECTION FAILED", "unable to establish connection, please check entered ID", [
            new MenuOption("BACK", () => { menu.changeMenu(...joinMenu) })
        ]
    ];

    disbandMenu = [
        "DISBANDMENU", "HOST DISBANDED PARTY", "the host disbanded your current party", [
            new MenuOption("BACK", () => {
                resetAllValues();
                resetConn();
                menu.changeMenu(...mainMenu);
            })
        ]
    ];

    waitMenu = [
        "WAITMENU", "AWAITING GAME START", "ask the party leader to start once everyone's joined", [
            new MenuOption("CHANGE NAME", () => { menu.changeMenu(...waitingNameMenu) })
        ]
    ];

    hostMenu = [
        "HOSTMENU", "ID: myID, nmPlP", "share this party id with your friends",
        [
            new MenuOption("START", () => {
                if (allConnections.length + 1 >= partySizeMinimum) {
                    mazeSeed = Date.now();
                    sendStartInfo();
                    startGame();
                } else {
                    menu.subtitle = "please invite more players before starting a game";
                }
            }),
            new MenuOption("CONFIG", () => { menu.changeMenu(...modeMenu) }),
            new MenuOption("BACK", () => { menu.changeMenu(...mainMenu) })
        ]
    ];
    modeMenu = [
        "MODEMENU", hostMenu[1], "change the game's settings with [left] and [right]",
        [
            new MenuOption("BACK", () => { menu.changeMenu(...hostMenu) }),
            new MenuSlide(mazeStartWidth, 8, 24, "WIDTH", data => { mazeStartWidth = data }),
            new MenuSlide(mazeStartHeight, 8, 24, "HEIGHT", data => { mazeStartHeight = data }),
            new MenuSlide(numberOfMazes, 1, 7, "QUANTITY", data => { numberOfMazes = data }),
            new MenuSlide(round(10 - (holeProbability * 100)), 0, 10, "DIFFICULTY", data => { holeProbability = (10 - round(data)) / 100; }),
        ]
    ];

    winMenu = [
        "OVERMENU", "YOU WON!", "flex on your friends, or go for another round",
        [
            new MenuOption("PLAY AGAIN", () => {
                resetAllValues();
                for (let s of getSprites()) {
                    s.visible = true;
                    s.width = scale / 2;
                    s.height = scale / 2;
                }

                if (isHost) menu.changeMenu(...hostMenu);
                else menu.changeMenu(...waitMenu);
            }),
            new MenuOption("LEAVE PARTY", () => {
                if (isHost) sendDisbandParty();
                else {
                    if (allConnections[0] && allConnections[0].open)
                        allConnections[0].send('leaving');
                }

                setTimeout(() => {
                    resetAllValues();
                    resetConn();
                }, 1000);
            })
        ]
    ];
    loseMenu = [
        winMenu[0], "YOU LOST...", "remember, you can always play another round", winMenu[3]
    ];


    allowedHostMenuStates = ["MAINMENU", "TUTORIALMENU", "NAMEMENU", "HOSTMENU", "MODEMENU"]
}
