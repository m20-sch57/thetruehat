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
            el(this.pageLog.last()).style.display = "none";
        }
        el(page).style.display = "";
        this.pageLog.push(page);
    }

    goBack() {
        el(this.pageLog.pop()).style.display = "none";
        if (this.pageLog.length == 0) this.pageLog = ["mainPage"];
        el(this.pageLog.last()).style.display = "";
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

    setSocketioEventListeners() {
        let _this = this;

        if (this.debug) {
            this.socket.on("sPlayerJoined", function(data) {
                console.log("sPlayerJoined", data);
            })
            this.socket.on("sPlayerLeft", function(data) {
                console.log("sPlayerLeft", data);
            })
            this.socket.on("sNewHost", function(data) {
                console.log("sNewHost", data);
            })
            this.socket.on("sFailure", function(data) {
                console.log("sFailure", data);
            })
            this.socket.on("sYouJoined", function(data) {
                console.log("sYouJoined", data);
            })
            this.socket.on("sGameStarted", function(data) {
                console.log("sGameStarted", data);
            })
        }

        this.socket.on("sPlayerJoined", function(data) {
            _this.setPlayers(data.playerList.filter(user => user.online)
                .map(user => user.username), data.host);
            if (data.host != _this.myUsername) {
                el("preparationPage_start").style.display = "none";
            } else {
                el("preparationPage_start").style.display = "";
            }
        })
        this.socket.on("sPlayerLeft", function(data) {
            _this.setPlayers(data.playerList.filter(user => user.online)
                .map(user => user.username), data.host);
            if (data.host != _this.myUsername) {
                el("preparationPage_start").style.display = "none";
            } else {
                el("preparationPage_start").style.display = "";
            }
        })
        this.socket.on("sYouJoined", function(data) {
            switch (data.state) {
                case "wait":
                    _this.setPlayers(data.playerList.filter(user => user.online)
                        .map(user => user.username), data.host);
                    if (data.host != _this.myUsername) {
                        el("preparationPage_start").style.display = "none";
                    } else {
                        el("preparationPage_start").style.display = "";
                    }
                    _this.showPage("preparationPage");
                    break;
            }
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