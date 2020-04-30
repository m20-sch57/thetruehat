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
        case "waitPage_user":
            let div = document.createElement("div");
            div.innerText = arg.username;
            div.classList.add("user-item");
            div.setAttribute("id", `user_${arg.username}`);
            return div;
    }
}

class App {
    constructor() {
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

    enterRoom() {
        fetch(`/${this.myRoomKey}/getRoomInfo`)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if (!result.success) {
                console.log("Invalid room key");
            };
            switch(result.status) {
                case "wait":
                    this.socket.emit("joinRoom", 
                        {"username": this.myUsername, 
                         "key": this.myRoomKey
                    });
                    break; 
                case "play":
                    this.socket.emit("joinRoom", 
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



    setKey(value) {
        this.myRoomKey = value;
        location.hash = value;
        el("joinPage_inputKey").value = this.myRoomKey;
        el("waitPage_title").value = this.myRoomKey;
    }

    showPage(page) {
        if (this.pageLog.length >= 1) {
            el(this.pageLog.last()).style.display = "none";
        }
        el(page).style.display = "";
        this.pageLog.push(page);

        if (page == "createPage") {
            this.getKey();
        }
    }

    goBack() {
        el(this.pageLog.pop()).style.display = "none";
        if (this.pageLog.length == 0) this.pageLog = ["mainPage"];
        el(this.pageLog.last()).style.display = "";
    }

    leaveRoom() {
        this.socket.emit("leaveRoom");
        this.goBack();
    }

    setPlayers(usernames) {
        el("waitPage_users").innerHTML = "";
        el("waitPage_playersCnt").innerText = 
            `${usernames.length} ${wordPlayers(usernames.length)}`;
        usernames.forEach(addPlayer);
    }

    addPlayer(username) {
        el("waitPage_users").appendChild(
            template("waitPage_user", {"username": username}));
        if (username == this.myUsername) {
            el(`user_${username}`).classList.add("you");
        }
    }

    // removePlayer(username) {
    //     deleteNode(el(`user_${username}`));
    // }

    setRoomHost(username) {
        if (this.roomHost) {
            el(`user_${this.roomHost}`).classList.remove("host");
        }
        this.roomHost = username;
        el(`user_${this.roomHost}`).classList.add("host");
    }

    getKey() {
        fetch("/getFreeKey")
            .then(response => response.json())
            .then(result => el("createPage_key").innerText = result.key)
    }

    copyKey() {
        navigator.clipboard.writeText(el("createPage_key").innerText);
    }

    copyLink() {
        navigator.clipboard.writeText(`http://${document.domain}:5000/#${
            el("createPage_key").innerText}`);
    }

    pasteKey() {
        navigator.clipboard.readText().then(clipText => {
            el("joinPage_inputKey").value = clipText;
        })
    }

    checkClipboard() {
        if (!(navigator.clipboard && navigator.clipboard.writeText)) {
            el("createPage_copyKey").style.display = "none";
            el("createPage_copyLink").style.display = "none";
        }
        if (!(navigator.clipboard && navigator.clipboard.readText)) {
            el("joinPage_pasteKey").style.display = "none";
        }
    }

    setDOMEventListeners() {
        el("mainPage_createRoom").onclick = () => this.showPage('createPage');
        el("mainPage_joinRoom").onclick = () => this.showPage('joinPage');
        el("mainPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("createPage_goBack").onclick = () => this.goBack();
        el("createPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("createPage_copyKey").onclick = () => this.copyKey();
        el("createPage_copyLink").onclick = () => this.copyLink();
        el("joinPage_goBack").onclick = () => this.goBack();
        el("joinPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("joinPage_pasteKey").onclick = () => this.pasteKey();
        el("rulesPage_goBack").onclick = () => this.goBack();
        el("waitPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("waitPage_goBack").onclick = () => this.leaveRoom();
        el("joinPage_go").onclick = () => {
            this.setKey(el("joinPage_inputKey").value);
            this.enterRoom();
        }
        el("createPage_go").onclick = () => {
            this.setKey(el("createPage_key").innerText);
            this.enterRoom();
        };
    }

    setSocketioEventListeners() {
        let _this = this;
        this.socket.on("playerJoined", function(data) {
            _this.setPlayers(data.playerList);
        })
        this.socket.on("playerLeft", function(data) {
            _this.setPlayers(data.playerList);
        })
        this.socket.on("newHost", function(data) {
            _this.setRoomHost(data.username);
        })
        this.socket.on("failure", function(data) {
            console.log(data);
        })
    }
}

window.onload = function() {
    let app = new App();
}