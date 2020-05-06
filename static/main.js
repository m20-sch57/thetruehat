Array.prototype.last = function() {
    console.assert(this.length >= 1, 
        "Try to get last element of empty array");
    return this[this.length - 1];
}

const PORT = 5000;

const DELAY_TIME = 3000;
const DELAY_COLORS = ["forestgreen", "goldenrod", "red"];
const EXPLANATION_TIME = 20000;
const AFTERMATH_TIME = 3000;
const SPEAKER_READY = "Я готов объяснять";
const LISTENER_READY = "Я готов отгадывать";


const TIME_SYNC_DELTA = 1200000;


let delta = 0;

function getTime() {
    return performance.now() + delta;
}

async function getDelta() {
    let zero = performance.now();
    time = (await (await fetch("http://zadachi.mccme.ru/misc/time/getTime.cgi")).json()).time;
    let now = performance.now();
    delta = time + (now - zero) / 2 - now;
}

async function maintainDelta() {
    setTimeout(maintainDelta, TIME_SYNC_DELTA);
    getDelta();
    console.log((new Date).getTime() - getTime());
}

function animate({startTime, timing, draw, duration, stopCondition}) {
    // Largely taken from https://learn.javascript.ru
    timing = timing || (time => time);
    stopCondition = stopCondition || (() => false)
    return new Promise(function(resolve) {
        let start = startTime;
        requestAnimationFrame(function animate() {
            time = getTime();
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            let progress = timing(timeFraction);

            draw(progress);

            if (stopCondition()) {
                return;
            }

            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            } else {
                return resolve();
            }
        });
    })
}

function timeFromSeconds(sec) {
    let min = Math.floor(sec / 60);
    sec -= 60 * min;
    if (sec < 10) sec = "0" + String(sec);
    if (min < 10) min = "0" + String(min);
    return `${min}:${sec}`
}

function aftermathTimeFormat(msec) {
    let sec = Math.floor(msec / 10);
    msec -= 10 * sec;
    return `${sec}.${msec}`;
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
    // console.log("Hide", id);
}

function show(id) {
    el(id).style.display = "";
    // console.log("Show", id);
}

function disable(id) {
    el(id).setAttribute("disabled", "");
}

function enable(id) {
    el(id).removeAttribute("disabled");
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

function template(templateName, data) {
    switch (templateName) {
    case "preparationPage_user":
        let div = document.createElement("div");
        div.innerText = data.username;
        div.classList.add("user-item");
        div.setAttribute("id", `user_${data.username}`);
        return div;
    case "resultPage_results":
        let elem = document.createElement("tr");
        let username = document.createElement("td");
        username.innerText = data.username;
        let scoreExplained = document.createElement("td");
        scoreExplained.innerText = data.scoreExplained;
        let scoreGuessed = document.createElement("td");
        scoreGuessed.innerText = data.scoreGuessed;
        let score = document.createElement("td");
        score.innerText = data.scoreGuessed + data.scoreGuessed;
        score.classList.add("sum");
        elem.appendChild(username);
        elem.appendChild(scoreExplained);
        elem.appendChild(scoreGuessed);
        elem.appendChild(score);
        return elem;
    }
}

class App {
    constructor() {
        this.debug = true;

        this.socket = io.connect(`http://${document.domain}:${PORT}`);

        this.pageLog = [];
        this.myUsername = "";
        this.myRole = "";
        this.setKey(readLocationHash());
        this.roundId = 0;

        this.checkClipboard();

        this.setDOMEventListeners();
        this.setSocketioEventListeners();

        if (this.myRoomKey != "") {
            this.showPage("joinPage");
        } else {
            this.showPage("mainPage");
        }
    }

    emit(event, data) {
        this.socket.emit(event, data);
        if (this.debug) {
            console.log(event, data);
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
        this.emit("cLeaveRoom");
        while (this.pageLog.length > 0 && ["preparationPage", "gamePage"].indexOf(
            this.pageLog.last()) != -1) {
            hide(this.pageLog.pop());
        }
        if (this.pageLog.length == 0) this.pageLog = ["mainPage"];
        show(this.pageLog.last());

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
        value = value.toUpperCase();
        this.myRoomKey = value
        location.hash = value
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
            disable("joinPage_pasteKey")
        }
        if (!(navigator.clipboard && navigator.clipboard.writeText)) {
            disable("preparationPage_copyKey");
            disable("preparationPage_copyLink");
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
                this.emit("cJoinRoom", 
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
            enable("gamePage_listenerReadyButton");
            el("gamePage_listenerReadyButton").innerText = 
                LISTENER_READY
            enable("gamePage_speakerReadyButton");
            el("gamePage_speakerReadyButton").innerText = 
                SPEAKER_READY
            switch (this.myUsername) {
            case data.listener:
                show("gamePage_listenerReadyBox");
                this.myRole = "listener";
                break;
            case data.speaker:
                show("gamePage_speakerReadyBox");
                this.myRole = "speaker";
                break;
            default:
                this.myRole = "observer";
                break;
            }
            show("gamePage_speakerListener");
            el("gamePage_speaker").innerText = data.speaker;
            el("gamePage_listener").innerText = data.listener;
            break;
        case "explanation":
            let roundId = this.roundId;
            setTimeout(() => {
                if (this.myRole == "") {
                    console.log("WARN: empty role");
                    return;
                }
                this.hideAllGameActions()
                switch (this.myRole) {
                case "speaker":
                    show("gamePage_explanationDelayBox");
                    this.animateDelay(data.startTime - DELAY_TIME, roundId)
                    .then(() => {
                        hide("gamePage_explanationDelayBox");
                        show("gamePage_explanationBox");
                        this.animateTimer(data.startTime, roundId)
                        .then(() => {
                            this.animateAftermath(data.startTime + 
                                EXPLANATION_TIME, roundId);
                        })
                    })
                    break;
                case "listener":
                    show("gamePage_explanationDelayBox");
                    this.animateDelay(data.startTime - DELAY_TIME, roundId)
                    .then(() => {
                        hide("gamePage_explanationDelayBox");
                        show("gamePage_speakerListener");
                        show("gamePage_observerBox");
                        show("gamePage_observerTimer");
                        this.animateTimer(data.startTime, roundId)
                        .then(() => {
                            this.animateAftermath(data.startTime + 
                                EXPLANATION_TIME, roundId);
                        })
                    })
                    break;
                case "observer":
                    show("gamePage_speakerListener");
                    this.animateDelay(data.startTime - DELAY_TIME, roundId)
                    .then(() => {
                        show("gamePage_speakerListener");
                        show("gamePage_observerBox");
                        show("gamePage_observerTimer");
                        this.animateTimer(data.startTime, roundId)
                        .then(() => {
                            this.animateAftermath(data.startTime + 
                                EXPLANATION_TIME, roundId);
                        })
                    })
                    break;
                }

            }, data.startTime - getTime() - DELAY_TIME);
            break;
        }
    }

    animateDelay(startTime, roundId) {
        let _this = this;
        return animate({
            startTime,
            duration: DELAY_TIME,
            draw: (progress) => {
                el("gamePage_explanationDelayTimer").innerText = 
                    Math.floor((1 - progress) / 1000 * DELAY_TIME) + 1;
                el("gamePage_explanationDelayTimer").style.background = 
                    DELAY_COLORS[Math.floor(progress * DELAY_COLORS.length)]
            },
            stopCondition: () => {
                return _this.roundId != roundId;
            }
        })
    }

    animateTimer(startTime, roundId) {
        el("gamePage_explanationTimer").classList.remove("timer-aftermath");
        el("gamePage_observerTimer").classList.remove("timer-aftermath");
        let _this = this;
        let animation = animate({
            startTime,
            duration: EXPLANATION_TIME,
            draw: (progress) => {
                let time = timeFromSeconds(Math.floor((1 - progress) / 
                    1000 * EXPLANATION_TIME) + 1);
                el("gamePage_explanationTimer").innerText = time;
                el("gamePage_observerTimer").innerText = time;
            },
            stopCondition: () => {
                return _this.roundId != roundId;
            }
        })
        return animation.then(() => {
            el("gamePage_explanationTimer").innerText = "00:00";
            el("gamePage_observerTimer").innerText = "00:00";
        })
    }

    animateAftermath(startTime, roundId) {
        let _this = this;
        el("gamePage_explanationTimer").classList.add("timer-aftermath");
        el("gamePage_observerTimer").classList.add("timer-aftermath");
        let animation =  animate({
            startTime,
            duration: AFTERMATH_TIME,
            draw: (progress) => {
                let msec = (Math.floor((1 - progress) / 
                    100 * AFTERMATH_TIME) + 1);
                let time = aftermathTimeFormat(msec);
                el("gamePage_explanationTimer").innerText = time;
                el("gamePage_observerTimer").innerText = time;
            },
            stopCondition: () => {
                return _this.roundId != roundId;
            }
        })
        return animation.then(() => {
            el("gamePage_explanationTimer").innerText = "0";
            el("gamePage_observerTimer").innerText = "0";
        })
    }

    hideAllGameActions() {
        hide("gamePage_speakerListener");
        hide("gamePage_speakerReadyBox");
        hide("gamePage_listenerReadyBox");
        hide("gamePage_observerBox");
        hide("gamePage_explanationBox");
        hide("gamePage_observerTimer");
        hide("gamePage_explanationDelayBox");
    }

    listenerReady() {
        this.emit("cListenerReady");
        disable("gamePage_listenerReadyButton");
        el("gamePage_listenerReadyButton").innerText = "Подожди напарника"
    }

    speakerReady() {
        this.emit("cSpeakerReady");
        disable("gamePage_speakerReadyButton");
        el("gamePage_speakerReadyButton").innerText = "Подожди напарника"
    }

    showResults(results) {
        this.showPage("resultsPage");
        results.forEach((result) => {
            el("resultPage_results").appendChild(template(
                "resultPage_results", result));
        })
    }

    setSocketioEventListeners() {
        let _this = this;

        if (this.debug) {
            let events = ["sPlayerJoined", "sPlayerLeft", "sFailure",
            "sYouJoined", "sGameStarted", "sExplanationStarted",
            "sExplanationEnded", "sNextTurn", "sNewWord", 
            "sWordExplanationEnded", "sWordsToEdit", "sGameEnded"];
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
            if (data.playerList.filter(user => user.online).length > 1) {
                enable("preparationPage_start")
            } else {
                disable("preparationPage_start")
            }
        })
        this.socket.on("sPlayerLeft", function(data) {
            _this.setPlayers(data.playerList.filter(user => user.online)
                .map(user => user.username), data.host);
            _this.showStartAction(data.host);
            if (data.playerList.filter(user => user.online).length > 1) {
                enable("preparationPage_start")
            } else {
                disable("preparationPage_start")
            }
        })
        this.socket.on("sYouJoined", function(data) {
            switch (data.state) {
            case "wait":
                _this.setPlayers(data.playerList.filter(user => user.online)
                    .map(user => user.username), data.host);
                _this.showStartAction(data.host);
                _this.showPage("preparationPage");
                if (data.playerList.filter(user => user.online).length > 1) {
                    enable("preparationPage_start")
                } else {
                    disable("preparationPage_start")
                }
                break;
            case "play":
                el("gamePage_speaker").innerText = data.speaker;
                el("gamePage_listener").innerText = data.listener;
                el("gamePage_wordsCnt").innerText = data.wordsCount;
                el("gamePage_title").innerText = _this.myUsername;
                el("gamePage_explanationWord").innerText = data.word;
                _this.myRole = (data.speaker == _this.myUsername) ? "speaker" :
                    (data.listener == _this.myUsername) ? "listener" : 
                    "observer";
                _this.setGameState(data.substate, data);
                _this.showPage("gamePage");
                break;
            }
        })
        this.socket.on("sGameStarted", function(data) {    
            el("gamePage_wordsCnt").innerText = data.wordsCount;
            el("gamePage_title").innerText = _this.myUsername;
            _this.setGameState("wait", data)
            _this.showPage("gamePage");
        })
        this.socket.on("sExplanationStarted", function(data) {
            _this.setGameState("explanation", data);
        })
        this.socket.on("sNewWord", function(data) {
            el("gamePage_explanationWord").innerText = data.word;
        })
        this.socket.on("sWordsToEdit", function(data) {
            _this.emit("cWordsEdited", data);
        })
        this.socket.on("sNextTurn", function(data) {
            _this.setGameState("wait", data);
            _this.roundId += 1;
        })
        this.socket.on("sWordExplanationEnded", function(data) {
            el("gamePage_wordsCnt").innerText = data.wordsCount;
        })
        this.socket.on("sExplanationEnded", function(data) {
            el("gamePage_wordsCnt").innerText = data.wordsCount;
        })
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
        this.socket.on("sGameEnded", function(data) {
            _this.showResults(data.results);
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
        el("preparationPage_viewRules").onclick = () => 
            this.showPage('rulesPage');
        el("preparationPage_goBack").onclick = () => this.leaveRoom();
        el("preparationPage_start").onclick = () => this.emit("cStartGame");
        el("preparationPage_copyKey").onclick = () => this.copyKey();
        el("preparationPage_copyLink").onclick = () => this.copyLink();
        el("gamePage_listenerReadyButton").onclick = () => 
            this.listenerReady();
        el("gamePage_speakerReadyButton").onclick = () => 
        this.speakerReady();
        el("gamePage_explanationSuccess").onclick = () => this.emit(
            "cEndWordExplanation", {"cause": "explained"});
        el("gamePage_explanationFailed").onclick = () => this.emit(
            "cEndWordExplanation", {"cause": "notExplained"});
        el("gamePage_explanationMistake").onclick = () => this.emit(
            "cEndWordExplanation", {"cause": "mistake"});
        el("gamePage_goBack").onclick = () => this.leaveRoom();
        el("gamePage_viewRules").onclick = () => this.showPage("rulesPage");
    }
}

let app;
window.onload = function() {
    maintainDelta().then(function () {
        app = new App()
    });
}
