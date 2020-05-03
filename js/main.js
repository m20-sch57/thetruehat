Array.prototype.last = function() {
    console.assert(this.length >= 1, 
        "Try to get last element of empty array");
    return this[this.length - 1];
}

function el(id) {
    return document.getElementById(id);
}

function readLocationHash() {
    if (location.hash == "") return "";
    return decodeURIComponent(location.hash.slice(1));
}

function deleteNode(node) {
    node.parentNode.removeChild(node);
}

function hide(id) {
    el(id).style.display = "none";
}

function show(id) {
    el(id).style.display = "";
}

function wordPlayers(playersCounter) {
    let word;
    if ([11, 12, 13, 14].indexOf(playersCounter % 100) != -1) {
        word = "игроков";
    } else if (playersCounter % 10 == 1) {
        word = "игрок";
    } else if ([2, 3, 4].indexOf(playersCounter % 10) != -1) {
        word = "игрока";
    } else {
        word = "игроков";
    }
    return word;
}

function template(templateName, arg) {
    switch (templateName) {
        case "preparationPage_user":
            let div = document.createElement("div");
            div.innerText = arg.username;
            div.classList.add("user-item");
            div.setAttribute("id", `user_${arg.username}`);
            return div;
            break;
    }
}

class App {
    constructor() {
        this.debug = true;

        this.socket = io.connect(`http://${document.domain}:5000`);

        this.pageLog = [];
        this.myUsername = "";
        this.setKey(readLocationHash());

        this.checkClipboard();

        this.setDOMEventListeners();
        this.setSocketioEventListeners();

        if (this.myRoomKey != "") {
            this.showPage("joinPage");
        } else {
            this.showPage("mainPage");
        }
    }

    showPage(page) {
        if (this.pageLog.length >= 1) {
            hide(this.pageLog.last());
        }
        el(page).style.display = "";
        this.pageLog.push(page);
    }

    goBack() {
        hide(this.pageLog.pop());
        if (this.pageLog.length == 0) this.pageLog = ["mainPage"];
        show(this.pageLog.last());
    }

    leaveRoom() {
        this.socket.emit("cLeaveRoom");
        this.goBack();
    }

    setPlayers(usernames, host) {
        el("preparationPage_users").innerHTML = "";
        el("preparationPage_playersCnt").innerText = 
            `${usernames.length} ${wordPlayers(usernames.length)}`;
        let _this = this;
        usernames.forEach(username => _this.addPlayer(username))
        if (host) {
            el(`user_${host}`).classList.add("host");
        }
    }

    addPlayer(username) {
        el("preparationPage_users").appendChild(
            template("preparationPage_user", {"username": username}));
        if (username == this.myUsername) {
            el(`user_${username}`).classList.add("you");
        }
    }

    // removePlayer(username) {
    //     deleteNode(el(`user_${username}`));
    // }

    setMyUsername(username) {
        this.myUsername = username;
    }

    setKey(value) {
        this.myRoomKey = value.toUpperCase();
        location.hash = value;
        el("joinPage_inputKey").value = this.myRoomKey;
        el("preparationPage_title").innerText = this.myRoomKey;
    }

    generateKey() {
        fetch("/getFreeKey")
            .then(response => response.json())
            .then(result => el("joinPage_inputKey").value = result.key)
    }

    copyKey() {
        navigator.clipboard.writeText(this.myRoomKey);
    }

    copyLink() {
        navigator.clipboard.writeText(`http://${document.domain}:5000/#${
            this.myRoomKey}`);
    }

    pasteKey() {
        navigator.clipboard.readText().then(clipText => {
            el("joinPage_inputKey").value = clipText;
        })
    }

    checkClipboard() {
        if (!(navigator.clipboard && navigator.clipboard.readText)) {
            // el("joinPage_pasteKey").style.display = "none";
            el("joinPage_pasteKey").setAttribute("disabled", "");
        }
    }

    showStartAction(host) {
        if (host != this.myUsername) {
            hide("preparationPage_start");
            show("preparationPage_startLabel");
        } else {
            show("preparationPage_start");
            hide("preparationPage_startLabel");
        }
    }

    enterRoom() {
        if (this.myRoomKey == "") {
            console.log("Empty room key");
            return;
        }
        fetch(`/getRoomInfo?key=${this.myRoomKey}`)
        .then(response => response.json())
        .then(result => {
            if (!result.success) {
                console.log("Invalid room key");
                return;
            };
            switch(result.state) {
                case "wait":
                case "play":
                    this.socket.emit("cJoinRoom", 
                        {"username": this.myUsername, 
                         "key": this.myRoomKey
                    });
                    break; 
                case "end":
                    console.log("Results in MVP-next.");
                    break;
            }
        })
    }

    setGameState(state, data) {
        switch(state) {
            case "wait":
                this.hideAllGameActions()
                switch (this.myUsername) {
                    case data.listener:
                        show("gamePage_listenerReadyBox");
                        break;
                    case data.speaker:
                        show("gamePage_speakerReadyBox");
                        break;
                    default:
                        show("gamePage_observerReadyBox");
                        break;
                }
                show("gamePage_fromTo");
                el("gamePage_from").innerText = data.speaker;
                el("gamePage_to").innerText = data.listener;
                break;
        }
    }

    hideAllGameActions() {
        hide("gamePage_fromTo");
        hide("gamePage_speakerReadyBox");
        hide("gamePage_listenerReadyBox");
        hide("gamePage_observerReadyBox");
        hide("gamePage_observerBox");
        hide("gamePage_explanationBox");
    }

    setSocketioEventListeners() {
        let _this = this;

        if (this.debug) {
            let events = ["sPlayerJoined", "sPlayerLeft", "sFailure",
            "sYouJoined", "sGameStarted", "sExplanationStarted",
            "sExplanationEnded", "sNextTurn", "sNewWord", "sWordExplanationEnded",
            "sWordsToEdit", "sGameEnded"];
            events.forEach((event) => {
                _this.socket.on(event, function(data) {
                    console.log(event, data);
                })
            })
        }

        this.socket.on("sPlayerJoined", function(data) {
            _this.setPlayers(data.playerList.filter(user => user.online)
                .map(user => user.username), data.host);
            _this.showStartAction(data.host);
        })
        this.socket.on("sPlayerLeft", function(data) {
            _this.setPlayers(data.playerList.filter(user => user.online)
                .map(user => user.username), data.host);
            _this.showStartAction(data.host);
        })
        this.socket.on("sYouJoined", function(data) {
            switch (data.state) {
                case "wait":
                    _this.setPlayers(data.playerList.filter(user => user.online)
                        .map(user => user.username), data.host);
                    _this.showStartAction(data.host);
                    _this.showPage("preparationPage");
                    break;
            }
        })
        this.socket.on("sGameStarted", function(data) {
            _this.setGameState("wait", {
                "speaker": data.from,
                "listener": data.to
            })
            _this.showPage("gamePage");
        })
    }

    setDOMEventListeners() {
        el("mainPage_createRoom").onclick = () => {
            this.generateKey();
            this.showPage('joinPage');
        }
        el("mainPage_joinRoom").onclick = () => {
            el("joinPage_inputKey").value = this.myRoomKey;
            this.showPage('joinPage');
        }
        el("mainPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("joinPage_goBack").onclick = () => this.goBack();
        el("joinPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("joinPage_pasteKey").onclick = () => this.pasteKey();
        el("joinPage_generateKey").onclick = () => this.generateKey();
        el("joinPage_go").onclick = () => {
            this.setKey(el("joinPage_inputKey").value);
            this.setMyUsername(el("joinPage_inputName").value);
            this.enterRoom();
        }
        el("rulesPage_goBack").onclick = () => this.goBack();
        el("preparationPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("preparationPage_goBack").onclick = () => this.leaveRoom();
        el("preparationPage_start").onclick = () => this.socket.emit("cStartGame");
        el("preparationPage_copyKey").onclick = () => this.copyKey();
        el("preparationPage_copyLink").onclick = () => this.copyLink();
    }
}

let app;
window.onload = function() {
    app = new App();
}
