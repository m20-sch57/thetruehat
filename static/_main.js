"use strict"

let app, timeSync;
window.onload = function() {
    if (ENV == PROD) {
        console.log("%c Не лезь сюда, оно сожрёт тебя !", `
            font-size: 100px;
            text-shadow: 2px 0px 0px red, -2px 0px 0px red, 0px 2px 0px red, 0px -2px 0px red,
            2px 2px 0px red, -2px 2px 0px red, -2px 2px 0px red, -2px -2px 0px red;
            `);
    }
    timeSync = new TimeSync(TIME_SYNC_DELTA);
    let _app = new App()
    if (GLOBAL_APP_SCOPE) {
        app = _app;
    }
    _app.debug = DEBUG_OUTPUT;
}

const DELAY_COLORS = [[76, 175, 80], [76, 175, 80], [255, 193, 7], [255, 193, 7], [255, 0, 0], [255, 0, 0]];
// const DELAY_COLORS = [[0, 230, 25], [255, 0, 0]];
const SPEAKER_READY = "Я готов объяснять";
const LISTENER_READY = "Я готов отгадывать";
const EXPLAINED_WORD_STATE = "угадал";
const NOT_EXPLAINED_WORD_STATE = "не угадал";
const MISTAKE_WORD_STATE = "ошибка";
const WORD_MAX_SIZE = 50;

Array.prototype.last = function() {
    console.assert(this.length >= 1,
        "Attempt to get last element of empty array");
    return this[this.length - 1];
}

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
}

function animate({startTime, timing, draw, duration, stopCondition}) {
    // Largely taken from https://learn.javascript.ru
    timing = timing || (time => time);
    stopCondition = stopCondition || (() => false)
    return new Promise(function(resolve) {
        let start = startTime;
        requestAnimationFrame(function animate() {
            let time = timeSync.getTime();
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            let progress = timing(timeFraction);

            draw(progress);

            if (stopCondition()) return;

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

function els(name) {
    return document.getElementsByName(name);
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

function showError(msg) {
    el("failureMsg").innerText = msg;
    show("failure");
}

function hideError() {
    hide("failure");
}

function disable(id) {
    el(id).setAttribute("disabled", "");
}

function enable(id) {
    el(id).removeAttribute("disabled");
}

function readLocationHash() {
    if (location.hash == "") return "";
    return decodeURIComponent(location.hash.slice(1));
}

function minSec(sec) {
    let min = Math.floor(sec / 60);
    sec -= 60 * min;
    if (sec < 10) sec = "0" + String(sec);
    if (min < 10) min = "0" + String(min);
    return `${min}:${sec}`;
}

function secMsec(msec) {
    let sec = Math.floor(msec / 10);
    msec -= 10 * sec;
    return `${sec}.${msec}`;
}

// Делит промежуток от 0 до 1 на n равных частей.
function stairs(x, n) {
    return Math.floor(x * n);
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

function validateNumber(elem) {
    el(elem).oninput = function(event) {
        el(elem).value = el(elem).value.replace(/\D+/g,"");
    }
}

function weightColor(color1, color2, weight) {
    let w1 = weight;
    let w2 = 1 - weight;
    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

function colorGradientRGB(colors) {
    return function(x) {
        if (x == 1) {
            return colors.last();
        }
        let parts = colors.length - 1;
        let partIndex = Math.floor(x * parts);
        let colorLeft = colors[partIndex];
        let colorRight = colors[partIndex + 1];
        let weight = x * parts - partIndex;
        return weightColor(colorRight, colorLeft, weight);
    }
}

class TimeSync {
    constructor(syncInterval) {
        this.syncInterval = syncInterval;
        this.delta = 0;
        this.maintainDelta();
    }

    getTime() {
        return performance.now() + this.delta;
    }

    async getDelta() {
        let response = await fetch("getTime", {"headers": {"X-Client-Timestamp": performance.now()}});
        let now = performance.now();
        this.delta = response.headers.get("X-Server-Timestamp") / 1.0 + (now - response.headers.get("X-Client-Timestamp")) / 2 - now;
    }

    async maintainDelta() {
        setTimeout(() => this.maintainDelta(), this.syncInterval);
        await this.getDelta();
        console.log("New time delta:", this.delta);
        console.log("Diff with local time:", this.getTime() - (new Date()).getTime());
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
        eExplained.innerText = EXPLAINED_WORD_STATE;
        eExplained.setAttribute("id", `editPage_${word}_explained`);
        let eNotExplained = document.createElement("button");
        eNotExplained.classList.add("small-white-button");
        eNotExplained.classList.add("not-explained");
        eNotExplained.innerText = NOT_EXPLAINED_WORD_STATE;
        eNotExplained.setAttribute("id", `editPage_${word}_notExplained`);
        let eMistake = document.createElement("button");
        eMistake.classList.add("small-white-button");
        eMistake.classList.add("mistake");
        eMistake.innerText = MISTAKE_WORD_STATE;
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

    playSound(sound, startTime, stopCondition) {
        startTime = startTime || timeSync.getTime();
        stopCondition = stopCondition || (() => false);
        let shift = el(sound).getAttribute("shift");
        if (shift) startTime += +shift;
        if (timeSync.getTime() < startTime) {
            setTimeout(() => {
                if (stopCondition()) return;
                this.killSound();
                this.currentSound = el(sound);
                this.currentSound.play();
            }, startTime - timeSync.getTime());
        } else if (timeSync.getTime() - startTime <
                el(sound).duration * 1000){
            this.killSound();
            this.currentSound = el(sound);
            this.currentSound.currentTime = (timeSync.getTime() - startTime) /
                1000;
            this.currentSound.play();
        }
    }
}

class Pages {
    constructor(defaultPage) {
        this.defaultPage = defaultPage || [];
        this.pageLog = [];
    }

    hideLastPage() {
        if (this.pageLog.length >= 1) {
            this.pageLog.last().forEach(elem => {
                hide(elem)
            });
        }
    }

    showPage(page) {
        page.forEach(elem =>{
            show(elem);
        })
    }

    go(page) {
        this.hideLastPage();
        this.showPage(page);
        this.pageLog.push(page);
    }

    goBack() {
        this.hideLastPage();
        this.pageLog.pop();
        if (this.pageLog.length >= 1) {
            this.showPage(this.pageLog.last());
        } else {
            this.pageLog = [[this.defaultPage]];
            this.showPage(this.defaultPage);
        }
    }

    clear() {
        this.hideLastPage();
        this.pageLog = [];
    }
}

class Game {
    constructor() {
        this.myUsername = "";
        this.settings = {};
        this.editWords = [];
        this.results = [];
        this.roundId = 0;
        this.inGame = false;
    }

    update(data) {
        if ("speaker" in data) {
            this.speaker = data.speaker;
            this.listener = data.listener;
            if (this.myUsername == this.speaker) {
                this.myRole = "speaker";
            } else if (this.myUsername == this.listener) {
                this.myRole = "listener";
            } else {
                this.myRole = "observer";
            }
        }

        if ("playerList" in data) {
            this.playerList = data.playerList;
            this.players = data.playerList.filter(user => user.online)
                .map(user => user.username);
        }

        if ("wordsCount" in data) {
            this.wordsCount = data.wordsCount;
        }

        if ("host" in data) {
            this.host = data.host;
            this.isHost = (data.host == this.myUsername);
        }

        if ("editWords" in data) {
            this.editWords = data.editWords;
            this.editWordsCount = data.editWords.length;
            this.wordStates = {};
            data.editWords.forEach((word) => {
                this.wordStates[word.word] = word.wordState;
            })
        }

        if ("settings" in data) {
            this.settings = data.settings;
        }

        if ("results" in data) {
            this.results = data.results;
        }

        this.render();
    }

    render() {
        this.renderStuff();
        this.renderPlayersList();
        // this.renderPlayersCnt();
        this.renderHost();
        this.renderEditList();
        this.renderResults();
        this.renderSettings();
    }

    renderSettings() {
        el("gameSettingsPage_delayTimeField").value = this.settings.delayTime/1000;
        el("gameSettingsPage_explanationTimeField").value = this.settings.explanationTime/1000;
        el("gameSettingsPage_aftermathTimeField").value = this.settings.aftermathTime/1000;
        el("gameSettingsPage_wordNumberField").value = this.settings.wordNumber;
        el("gameSettingsPage_strictModeCheckbox").checked = this.settings.strictMode;
        el("gameSettingsPage_dictionaryList").selectedIndex = this.settings.dictionaryId;
    }

    renderResults() {
        el("resultsPage_results").innerHTML = "";
        this.results.forEach((result) => {
            el("resultsPage_results").appendChild(Template.result(result));
        })
    }

    renderEditList() {
        el("gamePage_editListScrollable").innerHTML = "";
        this.editWords.forEach(word => {
            el("gamePage_editListScrollable").appendChild(Template.editWord(word));
            el(`editPage_${word.word}_explained`).onclick =
                    () => this.changeWordState(word.word, "explained");
            el(`editPage_${word.word}_notExplained`).onclick =
                    () => this.changeWordState(word.word, "notExplained");
            el(`editPage_${word.word}_mistake`).onclick =
                    () => this.changeWordState(word.word, "mistake");
        });
        // Fixed bug with padding in Firefox
        let eDiv = document.createElement("div");
        eDiv.style.height = "15px";
        el("gamePage_editListScrollable").appendChild(eDiv);
    }

    renderHost() {
        if (this.host) {
            el(`user_${this.host}`).classList.add("host");
        }
    }

    renderPlayersCnt() {
        el("preparationPage_playersCnt").innerText = `${this.players.length} ${
            wordPlayers(this.players.length)}`;
    }

    renderPlayersList() {
        el("preparationPage_users").innerHTML = "";
        this.players.forEach(username => {
            el("preparationPage_users").appendChild(
                Template.user({"username": username}));
            if (username == this.myUsername) {
                el(`user_${username}`).classList.add("you");
            }
        });
    }

    renderStuff() {
        el("gamePage_speaker").innerText = this.speaker;
        el("gamePage_listener").innerText = this.listener;
        el("gamePage_wordsCnt").innerText = this.wordsCount;
    }

    changeWordState(word, state) {
        el(`editPage_${word}_${this.wordStates[word]}`).classList.remove(
            "selected");
        el(`editPage_${word}_${state}`).classList.add("selected");
        this.wordStates[word] = state;
    }

    editedWordsObject() {
        return {"editWords": Object.keys(this.wordStates)
            .map(x => {
                return {
                    "word": x,
                    "wordState": this.wordStates[x],
                }
            })}
    }

    leave() {
        this.roundId += 1;
        this.inGame = false;
    }
}

class App {
    constructor() {
        this.debug = true;
        this.connected = false;
        this.settings = {};
        this.appLog = [];

        this.socket = io.connect(window.location.origin,
            {"path": window.location.pathname + "socket.io"});
        this.sound = new Sound();
        this.game = new Game();
        this.pages = new Pages(["mainPage"]);
        this.gamePages = new Pages();
        this.helpPages = new Pages();

        this.setKey(readLocationHash());

        this.checkClipboard();
        this.setDOMEventListeners();
        this.setSocketioEventListeners();
        this.loadContent();

        if (this.game.key != "") {
            this.pages.go(["joinPage"]);
        } else {
            this.pages.go(["mainPage"]);
        }
        this.helpPages.go(["helpPage_rulesBox"]);
    }

    log(data, level) {
        level = level || "info";
        this.appLog.push({data,
            "time": timeSync.getTime(),
            "humanTime": (new Date(timeSync.getTime()).toISOString())
        });
        if (this.debug) {
            console[level](data);
        }
    }

    logSignal(event, data) {
        let level = "info";
        if (event == "sFailure") level = "warn";
        this.log({event, data}, level);
    }

    emit(event, data) {
        this.socket.emit(event, data);
        this.logSignal(event, data);
    }

    leaveRoom() {
        this.pages.clear();
        this.pages.go(["joinPage"]);
        this.game.leave();
        this.emit("cLeaveRoom");
    }

    leaveResultsPage() {
        this.game.leave();
        this.pages.clear();
        this.pages.go(["joinPage"]);
    }

    setKey(value) {
        value = value.replace(/\s+/g, "").toUpperCase();
        this.game.key = value;
        location.hash = value;
        el("joinPage_inputKey").value = this.game.key;
        el("preparationPage_title").innerText = this.game.key;
        // el("gameSettingsPage_title").innerText = this.game.key;
    }

    async enterRoom() {
        if (this.game.key == "") {
            this.failedToJoin("Пустой ключ комнаты - низзя");
            return;
        }
        if (this.game.myUsername.trim() == "") {
            this.failedToJoin("Нужно представиться");
            return;
        }
        let data = await (await fetch(`api/getRoomInfo?key=${this.game.key}`)).json();
        if (!data.success) {
            console.log("Invalid room key");
            return;
        };
        if (["wait", "play"].indexOf(data.state) != -1) {
            this.emit("cJoinRoom",
                {"username": this.game.myUsername,
                    "key": this.game.key
            });
        } else if (data.state == "end") {
            console.log("Results in MVP-next.");
        } else {
            console.error("GetRoomInfo. Incorrect state.", data);
        }
    }

    renderPreparationPage() {
        if (this.game.isHost) {
            show("preparationPage_start");
            hide("preparationPage_startLabel");
            show("preparationPage_openSettings");
        } else {
            hide("preparationPage_start");
            show("preparationPage_startLabel");
            hide("preparationPage_openSettings");
        }
        if (this.game.players.length > 1) {
            enable("preparationPage_start");
            hide("preparationPage_startHint");
        } else {
            disable("preparationPage_start");
            show("preparationPage_startHint");
        }
        hide("joinPage_goHint");
    }

    renderWaitPage() {
        enable("gamePage_listenerReadyButton");
        el("gamePage_listenerReadyButton").innerText = LISTENER_READY;
        enable("gamePage_speakerReadyButton");
        el("gamePage_speakerReadyButton").innerText = SPEAKER_READY;

        let page = ["gamePage_speakerListener"];
        if (this.game.myRole == "speaker") {
            page.push("gamePage_speakerReadyBox");
            page.push("gamePage_speakerTitle");
        } else if (this.game.myRole == "listener") {
            page.push("gamePage_listenerReadyBox");
            page.push("gamePage_listenerTitle");
        } else {
            page.push("gamePage_waitTitle");
        }
        this.gamePages.go(page);
    }

    async renderExplanationPage({startTime}) {
        let roundId = this.game.roundId;
        setTimeout(async () => {
            if (this.game.roundId != roundId) return;
            let page = ["gamePage_explanationDelayBox"];
            if (this.game.myRole == "speaker") {
                page.push("gamePage_speakerTitle");
            } else if (this.game.myRole == "listener") {
                page.push("gamePage_listenerTitle");
            } else {
                page.push("gamePage_explanationTitle")
            }
            this.gamePages.go(page);
            await this.animateDelayTimer(startTime -
                this.game.settings.delayTime, roundId);
            if (this.game.roundId != roundId) return;
            if (this.game.myRole == "speaker") {
                this.gamePages.go(["gamePage_explanationBox",
                    "gamePage_speakerTitle"]);
            } else if (this.game.myRole == "listener") {
                this.gamePages.go(["gamePage_speakerListener",
                    "gamePage_observerBox", "gamePage_listenerTitle"]);
            } else {
                this.gamePages.go(["gamePage_speakerListener",
                    "gamePage_observerBox", "gamePage_explanationTitle"]);
            }
            this.sizeWord();
            await this.animateExplanationTimer(startTime, roundId)
            this.animateAftermathTimer(startTime +
                this.game.settings.explanationTime, roundId);

        }, startTime - timeSync.getTime() - this.game.settings.delayTime);
    }

    renderEditPage() {
        if (this.game.myRole == "speaker") {
            this.gamePages.go(["gamePage_editBox", "gamePage_editTitle"]);
            el("gamePage_editListScrollable").scrollTop = 0;
            this.editPageUpdateShadows();
        } else {
            this.gamePages.go(["gamePage_speakerListener", "gamePage_editTitle"]);
            el("gamePage_editConfirm").classList.remove("shadow");
            el("gamePage_editTitle").classList.remove("shadow");
        }
    }

    editPageUpdateShadows() {
        let elem = el("gamePage_editListScrollable");
        if (elem.scrollTop == 0) {
            el("gamePage_editTitle").classList.remove("shadow");
        } else {
            el("gamePage_editTitle").classList.add("shadow");
        }
        if (elem.scrollHeight - elem.scrollTop <= elem.clientHeight + 1) {
            el("gamePage_editConfirm").classList.remove("shadow");
        } else {
            el("gamePage_editConfirm").classList.add("shadow");
        }
    }

    playExplanationSounds({startTime}) {
        let roundId = this.game.roundId;
        let stopCondition = () => roundId != this.game.roundId;
        this.sound.playSound("start", startTime, stopCondition);
        this.sound.playSound("final", startTime +
            this.game.settings.explanationTime, stopCondition);
        this.sound.playSound("final+", startTime +
            this.game.settings.explanationTime +
            this.game.settings.aftermathTime, stopCondition);
        for (let i = 1; i <= Math.floor(this.game.settings.delayTime / 1000); i++) {
            this.sound.playSound("countdown", startTime - 1000 * i, stopCondition);
        }
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
        eWord.style["font-size"] = `${Math.min(WORD_MAX_SIZE,
            baseWidth * parentWidth / wordWidth)}px`;
    }

    async generateKey() {
        let result = await (await fetch("api/getFreeKey")).json();
        el("joinPage_inputKey").value = result.key;
    }

    copyKey() {
        navigator.clipboard.writeText(this.game.key);
    }

    copyLink() {
        navigator.clipboard.writeText(window.location);
    }

    async pasteKey() {
        let clipText = await navigator.clipboard.readText();
        el("joinPage_inputKey").value = clipText;
    }

    checkClipboard() {
        if (!(navigator.clipboard && navigator.clipboard.readText)) {
            disable("joinPage_pasteKey");
        } else {
            navigator.permissions.query({"name": "clipboard-read"})
            .then(result => {
                if (result.state == "denied") {
                    disable("joinPage_pasteKey");
                }
                result.onchange = function() {
                    if (this.state == "denied") {
                        disable("joinPage_pasteKey");
                    }
                }
            }).catch(err => {});
        }
        if (!(navigator.clipboard && navigator.clipboard.writeText)) {
            disable("preparationPage_copyKey");
            disable("preparationPage_copyLink");
        } else {
            navigator.permissions.query({"name": "clipboard-write"})
            .then(result => {
                if (result.state == "denied") {
                    disable("preparationPage_copyKey");
                    disable("preparationPage_copyLink");
                }
                result.onchange = function() {
                    console.log(this.state);
                    if (this.state == "denied") {
                        disable("preparationPage_copyKey");
                        disable("preparationPage_copyLink");
                    }
                }
            }).catch(err => {});
        }
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

    async animateDelayTimer(startTime, roundId) {
        let gradient = colorGradientRGB(DELAY_COLORS);
        await animate({
            startTime,
            duration: this.game.settings.delayTime,
            draw: (progress) => {
                let sec = stairs(1 - progress,
                    this.game.settings.delayTime / 1000) + 1;
                el("gamePage_explanationDelayTimer").innerText = sec;
                el("gamePage_explanationDelayTimer").style.background =
                    `rgb(${gradient(progress).join()})`;
            },
            stopCondition: () => {
                return this.game.roundId != roundId;
            }
        })
    }

    async animateExplanationTimer(startTime, roundId) {
        el("gamePage_explanationTimer").classList.remove("timer-aftermath");
        el("gamePage_observerTimer").classList.remove("timer-aftermath");
        let animation = animate({
            startTime,
            duration: this.game.settings.explanationTime,
            draw: (progress) => {
                let sec = stairs(1 - progress,
                    this.game.settings.explanationTime / 1000) + 1;
                let time = minSec(sec);
                el("gamePage_explanationTimer").innerText = time;
                el("gamePage_observerTimer").innerText = time;
            },
            stopCondition: () => {
                return this.game.roundId != roundId;
            }
        })
        await animation;
        el("gamePage_explanationTimer").innerText = "00:00";
        el("gamePage_observerTimer").innerText = "00:00";
    }

    async animateAftermathTimer(startTime, roundId) {
        el("gamePage_explanationTimer").classList.add("timer-aftermath");
        el("gamePage_observerTimer").classList.add("timer-aftermath");
        let animation =  animate({
            startTime,
            duration: this.game.settings.aftermathTime,
            draw: (progress) => {
                let msec = stairs(1 - progress,
                    this.game.settings.aftermathTime / 100) + 1;
                let time = secMsec(msec);
                el("gamePage_explanationTimer").innerText = time;
                el("gamePage_observerTimer").innerText = time;
            },
            stopCondition: () => {
                return this.game.roundId != roundId;
            }
        })
        await animation;
        el("gamePage_explanationTimer").innerText = "0.0";
        el("gamePage_observerTimer").innerText = "0.0";
    }

    failedToJoin(msg) {
        el("joinPage_goHint").innerText = msg;
        show("joinPage_goHint");
    }

    addBrowserData(result) {
        result.appName = navigator.appName;
        result.appVersion = navigator.appVersion;
        result.cookieEnabled = navigator.cookieEnabled;
        result.platform = navigator.platform;
        result.product = navigator.product;
        result.userAgent = navigator.userAgent;
    }

    buildFeedback(message, collectBrowserData) {
        let result = {};
        if (collectBrowserData) {
            this.addBrowserData(result);
        }
        result.SID = app.socket.id;
        result.version = VERSION;
        result.hash = HASH;
        result.message = message;
        result.appLog = this.appLog;
        return result;
    }

    sendFeedback() {
        let feedbackTextarea = el("feedbackPage_textarea");
        let feedback = this.buildFeedback(feedbackTextarea.value,
            el("feedbackPage_clientInfoCheckbox").checked);
        feedbackTextarea.value = "";
        fetch("feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(feedback)
        });
        this.pages.goBack();
    }

    deactivateHelpOptions() {
        el("helpPage_rulesOption").classList.remove("active");
        el("helpPage_faqOption").classList.remove("active");
        el("helpPage_aboutOption").classList.remove("active");
        el("helpPage_newsOption").classList.remove("active");
    }

    applySettings() {
        let settings = {};
        settings.delayTime = +el("gameSettingsPage_delayTimeField").value*1000;
        settings.explanationTime = +el("gameSettingsPage_explanationTimeField").value*1000;
        settings.aftermathTime = +el("gameSettingsPage_aftermathTimeField").value*1000;
        settings.wordNumber = +el("gameSettingsPage_wordNumberField").value;
        settings.strictMode = el("gameSettingsPage_strictModeCheckbox").checked;
        settings.dictionaryId = el("gameSettingsPage_dictionaryList").selectedIndex;
        localStorage.settings = settings;
        this.emit("cApplySettings", {settings});
    }

    addHint(id) {
        let cls = "active";
        el(id).onclick = () => {
            if (el(id).classList.contains(cls)) {
                el(id).classList.remove(cls);
            } else {
                el(id).classList.add(cls);
                let counter = 0;
                let listener = document.addEventListener("click", () => {
                    if (counter == 1) {
                        document.removeEventListener("click", listener);
                        el(id).classList.remove(cls);
                    }
                    counter += 1;
                });
            }
        }
    }

    setSocketioEventListeners() {
        let events = ["sFailure", "sPlayerJoined", "sPlayerLeft",
        "sYouJoined", "sGameStarted", "sExplanationStarted",
        "sExplanationEnded", "sNextTurn", "sNewWord",
        "sWordExplanationEnded", "sWordsToEdit", "sGameEnded",
        "sNewSettings"];
        events.forEach(event => {
            this.socket.on(event, data =>  {
                this.logSignal(event, data);
            })
        })

        this.socket.on("disconnect", () => {
            this.log("Socketio disconnect", "error");
            this.connected = false;
            setTimeout(() => {
                if (!this.connected) {
                    showError("Нет соединения, перезагрузите страницу");
                }
            }, DISCONNECT_TIMEOUT);
        });
        this.socket.on("reconnect", () => {
            this.log("Socketio reconnect", "warn");
            hideError();
            this.connected = true;
            if (this.game.inGame) {
                this.enterRoom();
            }
        });
        this.socket.on("connect", () => {
            this.log("Socketio connect");
            this.connected = true;
        })

        this.socket.on("sYouJoined", data => {
            this.game.update(data);
            this.game.inGame = true;
            switch (data.state) {
            case "wait":
                this.renderPreparationPage()
                this.pages.go(["preparationPage"]);
                break;
            case "play":
                this.pages.go(["gamePage"]);
                switch(data.substate) {
                case "wait":
                    this.renderWaitPage();
                    break;
                case "explanation":
                    this.setWord(data.word);
                    this.renderExplanationPage(data);
                    this.playExplanationSounds(data);
                    break;
                case "edit":
                    this.renderEditPage()
                    break;
                }
                break;
            case "end":
                this.renderResultsScreen()
                break;
            }
        })
        this.socket.on("sPlayerJoined", data => {
            this.game.update(data);
            this.renderPreparationPage();
        })
        this.socket.on("sPlayerLeft", data => {
            this.game.update(data);
            this.renderPreparationPage()
        })
        this.socket.on("sNewSettings", data => {
            this.game.update(data);
        })
        this.socket.on("sGameStarted", data => {
            this.game.update(data);
            this.renderWaitPage();
            this.pages.go(["gamePage"]);
        })
        this.socket.on("sExplanationStarted", data => {
            this.renderExplanationPage(data);
            this.playExplanationSounds(data);
        })
        this.socket.on("sNewWord", data => {
            this.setWord(data.word);
        })
        this.socket.on("sWordsToEdit", data => {
            //Pages.go(Pages.edit.speaker);
            this.game.update(data);
            this.renderEditPage(data);
        })
        this.socket.on("sNextTurn", data => {
            this.game.update(data);
            this.renderWaitPage();
        })
        this.socket.on("sWordExplanationEnded", data => {
            this.game.update(data);
        })
        this.socket.on("sExplanationEnded", data => {
            this.game.update(data);
            this.game.roundId += 1;
            this.renderEditPage();
        })
        this.socket.on("sGameEnded", data => {
            this.game.update(data);
            this.pages.go(["resultsPage"]);
            this.game.leave();
        })
        this.socket.on("sFailure", data =>  {
            switch(data.code) {
            case 103:
                this.failedToJoin("Ой. Это имя занято :(");
                break;
            case 104:
                this.failedToJoin("Вы точно с таким именем играли?");
                break;
            default:
                showError(data.msg, "code:", data.code);
                setTimeout(hideError, ERROR_TIMEOUT);
                break;
            }
        })
    }

    setDOMEventListeners() {
        el("mainPage_createRoom").onclick = () => {
            this.generateKey();
            this.pages.go(["joinPage"]);
        }
        el("mainPage_joinRoom").onclick = () => {
            el("joinPage_inputKey").value = this.game.key;
            this.pages.go(["joinPage"]);
        }
        el("joinPage_goBack").onclick = () => this.pages.goBack();
        el("joinPage_pasteKey").onclick = () => this.pasteKey();
        el("joinPage_generateKey").onclick = () => this.generateKey();
        el("joinPage_go").onclick = () => {
            this.setKey(el("joinPage_inputKey").value);
            this.game.myUsername = el("joinPage_inputName").value;
            this.enterRoom();
        }
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
        el("gamePage_editConfirm").onclick = () => this.emit("cWordsEdited",
            this.game.editedWordsObject());
        el("resultsPage_goBack").onclick = () => this.leaveResultsPage();
        el("resultsPage_newGame").onclick = () => {
            this.generateKey();
            this.pages.go(["joinPage"]);
        }
        el("helpPage_goBack").onclick = () => this.pages.goBack();
        el("helpPage_rulesOption").onclick = () => {
            this.deactivateHelpOptions();
            el("helpPage_rulesOption").classList.add("active");
            this.helpPages.go(["helpPage_rulesBox"]);
        }
        el("helpPage_faqOption").onclick = () => {
            this.deactivateHelpOptions();
            el("helpPage_faqOption").classList.add("active");
            this.helpPages.go(["helpPage_faqBox"]);
        }
        el("helpPage_aboutOption").onclick = () => {
            this.deactivateHelpOptions();
            el("helpPage_aboutOption").classList.add("active");
            this.helpPages.go(["helpPage_aboutBox"]);
        }
        el("helpPage_newsOption").onclick = () => {
            this.deactivateHelpOptions();
            el("helpPage_newsOption").classList.add("active");
            this.helpPages.go(["helpPage_newsBox"]);
        }
        el("feedbackPage_goBack").onclick = () => this.pages.goBack();
        el("feedbackPage_submit").onclick = () => this.sendFeedback();
        el("failureClose").onclick = hideError;
        el("gamePage_editListScrollable").onscroll = () => this.editPageUpdateShadows();
        el("preparationPage_openSettings").onclick =
            () => this.pages.go(["gameSettingsPage"]);
        el("gameSettingsPage_goBack").onclick = () => this.pages.goBack();
        el("gameSettingsPage_revertButton").onclick = () => {
            this.game.renderSettings();
            this.pages.goBack();
        }
        el("gameSettingsPage_applyButton").onclick = () => {
            this.applySettings();
            this.pages.goBack();
        }

        // Adding settings hint
        let prefixes = ["gameSettingsPage_wordNumber", "gameSettingsPage_delayTime",
            "gameSettingsPage_explanationTime", "gameSettingsPage_aftermathTime",
            "gameSettingsPage_dictionarySelection", "gameSettingsPage_strictMode"]
        for (let idPrefix of prefixes) {
            this.addHint(idPrefix+"Info");
        }

        els("type.number").forEach(it => validateNumber(it.id));
    }

    loadContent() {
        this.loadPages();
        this.loadDictionaries();
        els("helpButton").forEach((it) => it.onclick = () => this.pages.go(["helpPage"]));
        els("feedbackButton").forEach((it) => it.onclick = () => this.pages.go(["feedbackPage"]));
        els("version").forEach((it) => it.innerText = VERSION);
    }

    async loadPages() {
        let loadablePages = [
            {
                "pageFile": "rules.html",
                "pageId": "helpPage_rulesBox"
            },
            {
                "pageFile": "faq.html",
                "pageId": "helpPage_faqBox"
            },
            {
                "pageFile": "about.html",
                "pageId": "helpPage_aboutBox"
            },
            {
                "pageFile": "news.html",
                "pageId": "helpPage_newsBox"
            }
        ];
        for (let page of loadablePages) {
            let response = (await fetch(page["pageFile"])).text();
            let body = await response;
            el(page["pageId"]).innerHTML = body;
        }
    }

    async loadDictionaries() {
        let dictionaries = await (await fetch("api/getDictionaryList")).json();
        el("gameSettingsPage_dictionaryList").innerHTML = "";
        for (let dict of dictionaries.dictionaries) {
            let dictname = `${dict.name["ru"]}, ${dict.wordNumber} слов`;
            el("gameSettingsPage_dictionaryList").innerHTML += `<option>${dictname}</option>`;
        }
    }
}
