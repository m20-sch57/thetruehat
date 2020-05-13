Array.prototype.last = function() {
    console.assert(this.length >= 1, 
        "Attempt to get last element of empty array");
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

function animate({startTime, timing, draw, duration, stopCondition}) {
    // Largely taken from https://learn.javascript.ru
    timing = timing || (time => time);
    stopCondition = stopCondition || (() => false)
    return new Promise(function(resolve) {
        let start = startTime;
        requestAnimationFrame(function animate() {
            time = timeSync.getTime();
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

function el(id) {   
    return document.getElementById(id);
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

function readLocationHash() {
    console.log(location);
    if (location.hash == "") return "";
    return decodeURIComponent(location.hash.slice(1));
}

function explanationTimeFormat(sec) {
    let min = Math.floor(sec / 60);
    sec -= 60 * min;
    if (sec < 10) sec = "0" + String(sec);
    if (min < 10) min = "0" + String(min);
    return `${min}:${sec}`;
}

function aftermathTimeFormat(msec) {
    let sec = Math.floor(msec / 10);
    msec -= 10 * sec;
    return `${sec}.${msec}`;
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

class TimeSync {
    constructor(syncInterval) {
        this.syncInterval = syncInterval;
        this.delta = 0;
        this.maintainDelta();
    }

    getTime() {
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            return (new Date).getTime();
        } else {
            return performance.now() + this.delta;
        }
    }

    async getDelta() {
        let zero = performance.now();
        let time = (await (await fetch("http://zadachi.mccme.ru/misc/time/getTime.cgi")).json()).time;
        let now = performance.now();
        this.delta = time + (now - zero) / 2 - now;
    }    

    async maintainDelta() {
        setTimeout(() => this.maintainDelta(), this.syncInterval);
        this.getDelta();
        console.log("New time delta:", this.delta);
    }
}

class Template {
    static user({username}) {
        let elem = document.createElement("div");
        elem.innerText = username;
        elem.classList.add("user-item");
        elem.setAttribute("id", `user_${username}`);
        return elem;
    }

    static result({username, scoreExplained, scoreGuessed}) {
        let elem = document.createElement("tr");
        let eUsername = document.createElement("td");
        eUsername.innerText = username;
        let eScoreExplained = document.createElement("td");
        eScoreExplained.innerText = scoreExplained;
        let eScoreGuessed = document.createElement("td");
        eScoreGuessed.innerText = scoreGuessed;
        let eScore = document.createElement("td");
        eScore.innerText = scoreGuessed + scoreExplained;
        eScore.classList.add("sum");
        elem.appendChild(eUsername);
        elem.appendChild(eScoreExplained);
        elem.appendChild(eScoreGuessed);
        elem.appendChild(eScore);
        return elem;
    }

    static editWord({word, wordState}) {
        let elem = document.createElement("div");
        elem.classList.add("edit-item");
        elem.setAttribute("id", `editPage_word_${word}`);
        let eWord = document.createElement("h1");
        eWord.classList.add("word");
        eWord.innerText = word;
        let eExplained = document.createElement("button");
        eExplained.classList.add("small-white-button");
        eExplained.classList.add("explained");
        eExplained.innerText = "объяснил";
        eExplained.setAttribute("id", `editPage_${word}_explained`);
        let eNotExplained = document.createElement("button");
        eNotExplained.classList.add("small-white-button");
        eNotExplained.classList.add("not-explained");
        eNotExplained.innerText = "не объяснил";
        eNotExplained.setAttribute("id", `editPage_${word}_notExplained`);
        let eMistake = document.createElement("button");
        eMistake.classList.add("small-white-button");
        eMistake.classList.add("mistake");
        eMistake.innerText = "ошибка";
        eMistake.setAttribute("id", `editPage_${word}_mistake`);
        elem.appendChild(eWord);
        elem.appendChild(eExplained);
        elem.appendChild(eNotExplained);
        elem.appendChild(eMistake);
        let selected = {
            "explained": eExplained,
            "notExplained": eNotExplained,
            "mistake": eMistake
        }[wordState];
        selected.classList.add("selected");
        return elem;
    }
}

class Sound {
    constructor () {
        this.currentSound = false;
    }

    killSound() {
        if (this.currentSound) {
            this.currentSound.pause();
            this.currentSound = false;
        }
    }

    playSound(sound, startTime) {
        this.currentSound = el(sound);
        if (timeSync.getTime() < startTime) {
            setTimeout(() => {
                this.killSound();
                this.currentSound.play();
            }, startTime - timeSync.getTime());
        } else if (timeSync.getTime() - startTime < 
                this.currentSound.duration * 1000){
            this.currentSound.currentTime = (timeSync.getTime() - startTime) / 
                1000;
            this.currentSound.play();
        }
    }
}

let Pages = {
    _visibleElements: [],
    _pageLog: [],

    main: ["mainPage"],
    join: ["joinPage"],
    rules: ["rulesPage"],
    preparation: ["preparationPage"],
    wait: {
        observer: ["gamePage", "gamePage_speakerListener"],
        speaker: ["gamePage", "gamePage_speakerListener",
            "gamePage_speakerReadyBox"],
        listener: ["gamePage", "gamePage_speakerListener",
            "gamePage_listenerReadyBox"],
    },
    delay: ["gamePage", "gamePage_explanationDelayBox"],
    explanation: {
        observer: ["gamePage", "gamePage_speakerListener",
            "gamePage_observerBox"],
        speaker: ["gamePage", "gamePage_explanationBox"],
        listener: ["gamePage", "gamePage_speakerListener",
            "gamePage_observerBox"],
    },
    edit: {
        default: ["gamePage", "gamePage_speakerListener"],
        speaker: ["editPage"],
    },
    results: ["resultsPage"],

    getPage: function (page) {
        if (page instanceof Array) {
            return page
        } else {
            return this.getPage(page.default);
        }
    },

    hidePage: function () {
        if (this._pageLog.length >= 1) {
            this._pageLog.last().forEach((elemId) => {
                hide(elemId);
            })
        }
    },

    showPage: function (page) {
        page.forEach((elemId) => {
            show(elemId);
        })
    },

    go: function (page) {
        page = this.getPage(page);
        console.log("go:", page);
        this.hidePage();
        this.showPage(page);
        this._pageLog.push(page);
    },

    goBack: function () {
        console.log("goBack");
        this.hidePage();
        this._pageLog.pop();
        if (this._pageLog.length >= 1) {
            this.showPage(this._pageLog.last());
        } else {
            this._pageLog = [this.main];
            this.showPage(this.main);
        }
    },

    leave: function () {
        this.hidePage();
        this._pageLog = [];
        this.go(this.join);
    },
}

class App {
    constructor() {
        this.debug = true;

        this.socket = io.connect(`http://${document.domain}:${PORT}`);

        // this.pageLog = [];
        this.myUsername = "";
        this.myRole = "";
        this.setKey(readLocationHash());
        this.roundId = 0;

        this.checkClipboard();

        this.setDOMEventListeners();
        this.setSocketioEventListeners();

        if (this.myRoomKey != "") {
            Pages.go(Pages.join);
        } else {
            Pages.go(Pages.main);
        }

        this.sound = new Sound();
    }

    emit(event, data) {
        this.socket.emit(event, data);
        if (this.debug) {
            console.log(event, data);
        }
    }

    leaveRoom() {
        this.roundId = -1;
        this.emit("cLeaveRoom");
        Pages.leave();
    }

    setPlayers(usernames, host) {
        el("preparationPage_users").innerHTML = "";
        el("preparationPage_playersCnt").innerText = 
            `${usernames.length} ${wordPlayers(usernames.length)}`;
        let _this = this;
        usernames.forEach(username => _this.addPlayer(username));
        if (host) {
            el(`user_${host}`).classList.add("host");
        }
    }

    addPlayer(username) {
        el("preparationPage_users").appendChild(
            Template.user({"username": username}));
        if (username == this.myUsername) {
            el(`user_${username}`).classList.add("you");
        }
    }

    setMyUsername(username) {
        this.myUsername = username;
    }

    setKey(value) {
        value = value.toUpperCase();
        this.myRoomKey = value;
        location.hash = value;
        el("joinPage_inputKey").value = this.myRoomKey;
        el("preparationPage_title").innerText = this.myRoomKey;
    }

    setWord(word) {
        el("gamePage_explanationWord").innerText = word;
        this.sizeWord();
    }   

    sizeWord() {
        let eWord = el("gamePage_explanationWord");
        let eWordParent = el("gamePage_explanationBox");
        if (!eWord.innerText) {
            return;
        }
        let baseWidth = 15;
        eWord.style["font-size"] = `${baseWidth}px`
        let wordWidth = eWord.getBoundingClientRect().width;
        let parentWidth = eWordParent.getBoundingClientRect().width;
        eWord.style["font-size"] = `${Math.min(40, 
            baseWidth * parentWidth / wordWidth)}px`;
    }

    generateKey() {
        fetch("/getFreeKey")
            .then(response => response.json())
            .then(result => el("joinPage_inputKey").value = result.key);
    }

    copyKey() {
        navigator.clipboard.writeText(this.myRoomKey);
    }

    copyLink() {
        navigator.clipboard.writeText(`http://${document.domain}:${PORT}/#${
            this.myRoomKey}`);
    }

    pasteKey() {
        navigator.clipboard.readText().then(clipText => {
            el("joinPage_inputKey").value = clipText;
        })
    }

    checkClipboard() {
        if (!(navigator.clipboard && navigator.clipboard.readText)) {
            disable("joinPage_pasteKey");
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
        if (data.speaker) {
            el("gamePage_speaker").innerText = data.speaker;
            el("gamePage_listener").innerText = data.listener;
            this.myRole = (data.listener == this.myUsername) ? "listener" :
                (data.speaker == this.myUsername) ? "speaker" : "observer";
        }
        switch(state) {
        case "wait":
            el("gamePage_wordsCnt").innerText = data.wordsCount;
            enable("gamePage_listenerReadyButton");
            el("gamePage_listenerReadyButton").innerText = LISTENER_READY;
            enable("gamePage_speakerReadyButton");
            el("gamePage_speakerReadyButton").innerText = SPEAKER_READY;
            Pages.go(Pages.wait[this.myRole]);
            break;
        case "explanation":
            let roundId = this.roundId;
            setTimeout(() => {
                if (this.myRole == "") {
                    console.log("WARN: empty role");
                    return;
                }
                if (this.roundId == roundId) {
                    Pages.go(Pages.delay);
                }
                this.animateDelay(data.startTime - DELAY_TIME, roundId)
                .then(() => {
                    if (this.roundId == roundId) {
                        Pages.go(Pages.explanation[this.myRole]);
                        if (data.word) {
                            this.setWord(data.word);
                        } else {
                            this.sizeWord();
                        }
                        this.animateTimer(data.startTime, roundId)
                        .then(() => {
                            this.animateAftermath(data.startTime + 
                                EXPLANATION_TIME, roundId);
                        })
                    }
                })

            }, data.startTime - timeSync.getTime() - DELAY_TIME);
            break;
        case "edit":
            if (data.editWords) {
                Pages.go(Pages.edit.speaker);
                this.wordStates = {}
                el("editPage_list").innerHTML = "";
                el("editPage_wordsCnt").innerText = data.editWords.length;
                data.editWords.forEach((wordObj) => {
                    this.wordStates[wordObj.word] = wordObj.wordState;
                    el("editPage_list").appendChild(Template.editWord(wordObj));
                    el(`editPage_${wordObj.word}_explained`).onclick = 
                            () => this.changeWordState(wordObj.word, "explained");
                    el(`editPage_${wordObj.word}_notExplained`).onclick = 
                            () => this.changeWordState(wordObj.word, "notExplained");
                    el(`editPage_${wordObj.word}_mistake`).onclick = 
                            () => this.changeWordState(wordObj.word, "mistake");
                });
            } else {
                Pages.go(Pages.edit);
            }
            break;
        }
    }

    animateDelay(startTime, roundId) {
        let _this = this;
        // this.sound.playSound("delayTimer", startTime);
        return animate({
            startTime,
            duration: DELAY_TIME,
            draw: (progress) => {
                el("gamePage_explanationDelayTimer").innerText = 
                    Math.floor((1 - progress) / 1000 * DELAY_TIME) + 1;
                el("gamePage_explanationDelayTimer").style.background = 
                    DELAY_COLORS[Math.floor(progress * DELAY_COLORS.length)];
            },
            stopCondition: () => {
                // if (_this.roundId != roundId) {
                //     this.sound.killSound();
                // }
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
                let time = explanationTimeFormat(Math.floor((1 - progress) / 
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

    listenerReady() {
        this.emit("cListenerReady");
        disable("gamePage_listenerReadyButton");
        el("gamePage_listenerReadyButton").innerText = "Подожди напарника";
    }

    speakerReady() {
        this.emit("cSpeakerReady");
        disable("gamePage_speakerReadyButton");
        el("gamePage_speakerReadyButton").innerText = "Подожди напарника";
    }

    showResults(results) {
        el("resultPage_results").innerHTML = "";
        results.forEach((result) => {
            el("resultPage_results").appendChild(Template.result(result));
        })
    }

    changeWordState(word, newState) {
        el(`editPage_${word}_${this.wordStates[word]}`).classList.remove(
            "selected");
        el(`editPage_${word}_${newState}`).classList.add("selected");
        this.wordStates[word] = newState;
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
                enable("preparationPage_start");
            } else {
                disable("preparationPage_start");
            }
        })
        this.socket.on("sPlayerLeft", function(data) {
            _this.setPlayers(data.playerList.filter(user => user.online)
                .map(user => user.username), data.host);
            _this.showStartAction(data.host);
            if (data.playerList.filter(user => user.online).length > 1) {
                enable("preparationPage_start");
            } else {
                disable("preparationPage_start");
            }
        })
        this.socket.on("sYouJoined", function(data) {
            switch (data.state) {
            case "wait":
                _this.setPlayers(data.playerList.filter(user => user.online)
                    .map(user => user.username), data.host);
                _this.showStartAction(data.host);
                Pages.go(Pages.preparation);
                if (data.playerList.filter(user => user.online).length > 1) {
                    enable("preparationPage_start");
                } else {
                    disable("preparationPage_start");
                }
                break;
            case "play":
                _this.roundId = 0;
                el("gamePage_speaker").innerText = data.speaker;
                el("gamePage_listener").innerText = data.listener;
                el("gamePage_wordsCnt").innerText = data.wordsCount;
                el("gamePage_title").innerText = _this.myUsername;
                _this.myRole = (data.speaker == _this.myUsername) ? "speaker" :
                    (data.listener == _this.myUsername) ? "listener" : 
                    "observer";
                _this.setGameState(data.substate, data);
                break;
            }
        })
        this.socket.on("sGameStarted", function(data) {    
            el("gamePage_wordsCnt").innerText = data.wordsCount;
            el("gamePage_title").innerText = _this.myUsername;
            _this.setGameState("wait", data);
        })
        this.socket.on("sExplanationStarted", function(data) {
            _this.setGameState("explanation", data);
        })
        this.socket.on("sNewWord", function(data) {
            _this.setWord(data.word);
        })
        this.socket.on("sWordsToEdit", function(data) {
            Pages.go(Pages.edit.speaker)
            _this.wordStates = {}
            el("editPage_list").innerHTML = "";
            el("editPage_wordsCnt").innerText = data.editWords.length;
            data.editWords.forEach((wordObj) => {
                _this.wordStates[wordObj.word] = wordObj.wordState;
                el("editPage_list").appendChild(Template.editWord(wordObj));
                el(`editPage_${wordObj.word}_explained`).onclick = 
                        () => _this.changeWordState(wordObj.word, "explained");
                el(`editPage_${wordObj.word}_notExplained`).onclick = 
                        () => _this.changeWordState(wordObj.word, "notExplained");
                el(`editPage_${wordObj.word}_mistake`).onclick = 
                        () => _this.changeWordState(wordObj.word, "mistake");
            });
        })
        this.socket.on("sNextTurn", function(data) {
            _this.setGameState("wait", data);
        })
        this.socket.on("sWordExplanationEnded", function(data) {
            el("gamePage_wordsCnt").innerText = data.wordsCount;
        })
        this.socket.on("sExplanationEnded", function(data) {
            _this.roundId += 1;
            Pages.go(Pages.edit);
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
            Pages.go(Pages.results);
            _this.showResults(data.results);
        })
    }

    setDOMEventListeners() {
        el("mainPage_createRoom").onclick = () => {
            this.generateKey();
            Pages.go(Pages.join);
        }
        el("mainPage_joinRoom").onclick = () => {
            el("joinPage_inputKey").value = this.myRoomKey;
            Pages.go(Pages.join);
        }
        el("mainPage_viewRules").onclick = () => Pages.go(Pages.rules);
        el("joinPage_goBack").onclick = () => Pages.goBack();
        el("joinPage_viewRules").onclick = () => Pages.go(Pages.rules);
        el("joinPage_pasteKey").onclick = () => this.pasteKey();
        el("joinPage_generateKey").onclick = () => this.generateKey();
        el("joinPage_go").onclick = () => {
            this.setKey(el("joinPage_inputKey").value);
            this.setMyUsername(el("joinPage_inputName").value);
            this.enterRoom();
        }
        el("rulesPage_goBack").onclick = () => Pages.goBack();
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
        el("gamePage_viewRules").onclick = () => Pages.go(Pages.rules);
        el("editPage_confirm").onclick = () => this.emit("cWordsEdited", 
            {"editWords": Object.keys(this.wordStates).map(x => 
                {return{
                    "word": x, 
                    "wordState": this.wordStates[x],
                }})
            });
        el("editPage_viewRules").onclick = () => Pages.go(Pages.rules);
        el("editPage_goBack").onclick = () => this.leaveRoom();
        el("resultsPage_goBack").onclick = () => this.leaveRoom();
        el("resultsPage_viewRules").onclick = () => Pages.go(Pages.rules);
        el("resultsPage_newGame").onclick = () => {
            this.generateKey();
            Pages.go(Pages.join);
        }
    }
}

timeSync = new TimeSync(TIME_SYNC_DELTA);
let app;
window.onload = function() {
    app = new App();
}
