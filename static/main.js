"use strict"

let app, timeSync;
window.onload = function() {
    let _app;
    if (ENV == PROD) {
        console.log("%c Не лезь сюда, оно сожрёт тебя !", `
            font-size: 100px;
            text-shadow: 2px 0px 0px red, -2px 0px 0px red, 0px 2px 0px red, 0px -2px 0px red,
            2px 2px 0px red, -2px 2px 0px red, -2px 2px 0px red, -2px -2px 0px red;
            `);
    }
    if (ENV == STAGING) {
        show("stagingMark");
    }
    timeSync = new TimeSync(TIME_SYNC_DELTA);
    i18n=i18n();
    _app = new App()
    if (GLOBAL_APP_SCOPE) {
        app = _app;
    }
    _app.debug = DEBUG_OUTPUT;
}

const DELAY_COLORS = [[76, 175, 80], [76, 175, 80], [255, 193, 7], [255, 193, 7], [255, 0, 0], [255, 0, 0]];
const WORD_MAX_SIZE = 50;
const DICTIONARY_MAX_SIZE = 64 * 1024 * 1024

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

function animate({startTime, timing, draw, duration, stopCondition, onStart, mustCall}) {
    // Partially taken from https://learn.javascript.ru
    timing = timing || (time => time);
    stopCondition = stopCondition || (() => false);
    onStart = onStart || (() => {});
    mustCall = mustCall || false;
    let firstFrame = true;
    return new Promise(function(resolve) {
        let start = startTime;
        requestAnimationFrame(function animate() {
            let time = timeSync.getTime();
            let timeFraction = (time - start) / duration;
            if (timeFraction < 0) {
                requestAnimationFrame(animate);
                return;
            }
            if (timeFraction > 1) {
                timeFraction = 1;
                firstFrame = mustCall;
            }

            if (stopCondition()) return;

            let progress = timing(timeFraction);

            if (firstFrame) {
                firstFrame = false;
                onStart();
            }
            draw(progress);

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

function _(msgid, n) {
    if (n === undefined) {
        return i18n.gettext(msgid);
    } else {
        return i18n.ngettext(msgid, msgid, n);
    }
}

function validateNumber(elemId) {
    let elem = el(elemId);
    let numRegex = /\D+/g;
    elem.oninput = function(event) {
        let caretPosition = elem.selectionStart;
        let newCaretPosition = elem.value.slice(0, caretPosition).replace(numRegex, "").length;
        elem.value = elem.value.replace(numRegex,"");
        elem.selectionStart = newCaretPosition;
        elem.selectionEnd = newCaretPosition;
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

function throttle(fun, cooldownTime) {
    let callTime = performance.now() - cooldownTime;
    return function() {
        let now = performance.now();
        if (now - callTime >= cooldownTime) {
            callTime = now;
            return fun(...arguments)
        }
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
        eExplained.setAttribute("id", `editPage_${word}_explained`);
        eExplained.setAttribute("gt", "");
        eExplained.setAttribute("gt-text", "угадал");
        let eNotExplained = document.createElement("button");
        eNotExplained.classList.add("small-white-button");
        eNotExplained.classList.add("not-explained");
        eNotExplained.setAttribute("id", `editPage_${word}_notExplained`);
        eNotExplained.setAttribute("gt", "");
        eNotExplained.setAttribute("gt-text", "не угадал");
        let eMistake = document.createElement("button");
        eMistake.classList.add("small-white-button");
        eMistake.classList.add("mistake");
        eMistake.setAttribute("id", `editPage_${word}_mistake`);
        eMistake.setAttribute("gt", "");
        eMistake.setAttribute("gt-text", "ошибка");
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
        this.isMuted = false;
        this.volume = 1;
    }

    killSound() {
        if (this.currentSound) {
            this.currentSound.pause();
            this.currentSound = false;
        }
    }

    updateVolume() {
        if (this.currentSound) {
            if (this.isMuted) {
                this.currentSound.volume = 0;
            } else {
                this.currentSound.volume = this.volume;
            }
        }
    }

    setVolume(volume) {
        this.volume = volume;
        this.updateVolume();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolume();
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
                this.updateVolume();
                this.currentSound.play();
            }, startTime - timeSync.getTime());
        } else if (timeSync.getTime() - startTime <
                el(sound).duration * 1000){
            this.killSound();
            this.currentSound = el(sound);
            this.updateVolume();
            this.currentSound.currentTime = (timeSync.getTime() - startTime) /
                1000;
            this.currentSound.play();
        }
    }
}

class Pages {
    constructor({defaultPage, pages}) {
        this.pages = pages;
        this.page = {};
        this.context = "";
        this.leaveStack = [];

        const fun = () => {};
        const pageInterface = {
            els: [],
            classes: [],
            styles: [],
            onEnter: fun,
            onLeave: fun,
            render: fun
        };

        for (let pageName of Object.keys(pages)) {
            if (["default"].indexOf(pageName) != -1) {
                console.error(`Incorrect page name ${pageName}. This name is reserved.`);
                continue;
            }
            if (pageName.startsWith("-")) {
                console.error(`Incorrect page name  ${pageName}`);
                continue;
            }
            if (typeof pages[pageName] == "string") {
                this.pages[pageName] = {els: [pages[pageName]]};
            } else if (Array.isArray(pages[pageName])) {
                this.pages[pageName] = {els: pages[pageName]};
            }
            this.pages[pageName].name = pageName;
            this.pages[pageName] = {...pageInterface, ...this.pages[pageName]}
        }

        for (let pageName of Object.keys(pages)) {
            this["$"+pageName] = {
                replace: () => this.replace(pageName),
                push: () => this.push(pageName)
            }
        }

        this.registerPairedMethod("show", show, "hide", hide);
        this.registerPairedMethod("disable", disable, "enable", enable);
        const addClass = (elemId, _class) => el(elemId).classList.add(_class);
        const removeClass = (elemId, _class) => el(elemId).classList.remove(_class);
        this.registerPairedMethod("addClass", addClass, "removeClass", removeClass);
        const addStyle = (elemId, styleName, value) => el(elemId).style[styleName] = value;
        const removeStyle = (elemId, styleName, _, value) => el(elemId).style[styleName] = value || "";
        this.registerPairedMethod("addStyle", addStyle, "removeStyle", removeStyle);

        this.path = [];
        this.pages.default = this.pages[defaultPage] || {name: "default", ...pageInterface};
        this.push("default");
    }

    pageByName(name) {
        return this.pages[name];
    }

    leaveCurrentPage() {
        this.withContext("leave", () => {
            if (!this.currentPage) return;
            this.currentPage.els.forEach(elem => {
                hide(elem);
            })
            this.currentPage.classes.forEach(([elemId, _class]) => {
                el(elemId).classList.remove(_class);
            })
            this.currentPage.styles.forEach(([elemId, styleName, _, value]) => {
                el(elemId).style[styleName] = value;
            })
            while (this.leaveStack.length != 0) {
                let [method, args] = this.leaveStack.pop();
                method(...args);
            }
            this.currentPage.onLeave();
        });
    }

    go(page) {
        this.withContext("enter", () => {
            page.els.forEach(elem => {
                show(elem);
            })
            page.classes.forEach(([elemId, _class]) => {
                el(elemId).classList.add(_class);
            })
            page.styles.forEach(([elemId, styleName, value]) => {
                el(elemId).style[styleName] = value || "";
            })
            page.render(this.page);
            page.onEnter();
            this.currentPage = page;
        });
    }

    replace(pageName) {
        let page = this.pageByName(pageName);
        this.leaveCurrentPage()
        this.go(page);
    }

    push(pageName) {
        this.replace(pageName);
        this.path.push(pageName);
    }

    goBack() {
        this.leaveCurrentPage();
        this.path.pop();
        let previousPage;
        if (this.path.length == 0) {
            previousPage = this.pages.default
        } else {
            previousPage = this.pageByName(this.path.last());
        }
        this.go(previousPage);
        if (this.path.length == 0) {
            this.path = ["default"];
        }
    }

    clear() {
        this.leaveCurrentPage();
        this.path = [];
        this.currentPage = false;
    }

    withContext(context, f) {
        let currentContext = this.context;
        this.context = context;
        f();
        this.context = currentContext;
    }

    registerPairedMethod(firstMethodName, firstMethod, secondMethodName, secondMethod) {
        this.page[firstMethodName] = (...args) => {
            firstMethod(...args);
            this.leaveStack.push([secondMethod, args]);
        }
        this.page[secondMethodName] = (...args) => {
            secondMethod(...args);
            this.leaveStack.push([firstMethod, args]);
        }
    }
}

class Game {
    constructor(app) {
        this.myUsername = "";
        this.settings = {};
        this.editWords = [];
        this.results = [];
        this.roundId = 0;
        this.timetable = [];
        this.inGame = false;
        this.app = app;
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

        if ("wordsLeft" in data) {
            this.wordsLeft = data.wordsLeft;
        }

        if ("turnsLeft" in data) {
            this.turnsLeft = data.turnsLeft;
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
            this.loadClientSettings();
        }

        if ("results" in data) {
            this.results = data.results;
        }

        if ("nextKey" in data) {
            this.nextKey = data.nextKey;
        }

        if ("timetable" in data) {
            this.timetable = data.timetable;
            this.timetableDepth = this.timetable.length;
            this.turnsCount = this.timetableDepth - 2;
            this.turnsCountCorrect = false;
            for (let i=0; i < this.timetable.length; i++) {
                let pair = this.timetable[i];
                if (pair.speaker == this.myUsername) {
                    this.turnsCount = i-1;
                    this.myNextRole = "speaker";
                    this.turnsCountCorrect = true;
                    break;
                }
                if (pair.listener == this.myUsername) {
                    this.turnsCount = i-1;
                    this.myNextRole = "listener";
                    this.turnsCountCorrect = true;
                    break;
                }
            }
        }

        this.render();
    }

    render() {
        this.renderSpeakerListener();
        this.renderHatCounter();
        this.renderPlayersList();
        // this.renderPlayersCnt();
        this.renderHost();
        this.renderHostActions();
        this.renderStartAction();
        this.renderEditList();
        this.renderResults();
        this.renderSettings();
        this.renderAdditionalStatus();
    }

    loadClientSettings() {
        if (this.settings.wordsetType == "hostDictionary") {
            this.app.dictionaryFileInfo = this.settings.dictionaryFileInfo;
        }
    }

    renderSettings() {
        el("gameSettingsPage_delayTimeField").value = this.settings.delayTime/1000;
        el("gameSettingsPage_explanationTimeField").value = this.settings.explanationTime/1000;
        el("gameSettingsPage_aftermathTimeField").value = this.settings.aftermathTime/1000;
        el("gameSettingsPage_termConditionList").value = this.settings.termCondition;
        el("gameSettingsPage_wordNumberField").value = this.settings.wordNumber || DEFAULT_SETTINGS.wordNumber;
        el("gameSettingsPage_turnNumberField").value = this.settings.turnsNumber || DEFAULT_SETTINGS.turnsNumber;
        el("gameSettingsPage_strictModeCheckbox").checked = this.settings.strictMode;
        if (this.settings.wordsetType == "serverDictionary") {
            el("gameSettingsPage_dictionaryList").selectedIndex = this.settings.dictionaryId
                + DICTIONARY_LIST_EXTRA_OPTIONS.length;
        } else {
            el("gameSettingsPage_dictionaryList").selectedIndex =
                WORDSET_TYPE_DICT[this.settings.wordsetType];
        }
        this.app.updateSettings();
    }

    updateSettingsState() {
        this.loadClientSettings();
        this.renderSettings();
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
        this.app.renderText();
        // Fixed bug with padding in Firefox
        let eDiv = document.createElement("div");
        eDiv.style.height = "30px";
        el("gamePage_editListScrollable").appendChild(eDiv);
    }

    renderHost() {
        if (this.host) {
            el(`user_${this.host}`).classList.add("host");
        }
    }

    renderHostActions() {
        if (this.isHost) {
            show("gamePage_finish");
            show("preparationPage_openSettings");
        } else {
            hide("gamePage_finish");
            hide("preparationPage_openSettings");
        }
    }

    renderStartAction() {
        hide("preparationPage_startGame");
        hide("preparationPage_startWordCollection");
        hide("preparationPage_startHint");
        hide("preparationPage_startLabel");
        if (!this.isHost) {
            show("preparationPage_startLabel");
        } else {
            if (this.settings.wordsetType == "playerWords") {
                show("preparationPage_startWordCollection");
            } else {
                show("preparationPage_startGame");
            }
            if (this.players.length > 1) {
                enable("preparationPage_startGame");
                enable("preparationPage_startWordCollection");
            } else {
                disable("preparationPage_startGame");
                disable("preparationPage_startWordCollection");
                show("preparationPage_startHint");
            }
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
                el(`user_${username}`).setAttribute("you-content",` (${_("ты")})`);
            }
        });
    }

    renderHatCounter() {
        if (this.settings.termCondition == "turns") {
            setHatTitle(this.turnsLeft, this.app.lang, "rounds");
        }
        if (this.settings.termCondition == "words") {
            setHatTitle(this.wordsLeft, this.app.lang, "words");
        }
    }

    renderSpeakerListener() {
        el("gamePage_speaker").innerText = this.speaker;
        el("gamePage_listener").innerText = this.listener;
        el("gamePage_additionalStatusListener").innerText = this.listener;
    }

    renderAdditionalStatus() {
        let count = this.turnsCount;
        let mark = this.turnsCountCorrect;
        el("gamePage_additionalStatus_turnsCounter_counter").innerText =
            `${mark ? "" : ">"}${count} ${_("ход", count)}`
    }

    changeWordState(word, state) {
        el(`editPage_${word}_${this.wordStates[word]}`).classList.remove(
            "selected");
        el(`editPage_${word}_${state}`).classList.add("selected");
        this.wordStates[word] = state;
    }

    editedWordsObject() {
        return {"editWords": this.editWords
            .map(x => {
                return {
                    "word": x.word,
                    "wordState": this.wordStates[x.word],
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
        this._constructor();
    }

    async _constructor() {
        this.debug = true;
        this.connected = false;
        this.settings = {};
        this.appLog = [];

        this.socket = io.connect(window.location.origin,
            {"path": window.location.pathname + "socket.io"});
        this.sound = new Sound();
        this.game = new Game(this);

        this.initPages();
        this.setKey(readLocationHash());
        this.checkClipboard();
        this.setDOMEventListeners();
        this.setSocketioEventListeners();

        if (this.game.key != "") {
            this.pages.$join.push()
        } else {
            this.pages.$main.push()
        }

        if (localStorage.volume && localStorage.volume == "off") {
            this.toggleVolume();
        }

        this.prepareGettext();
        this.loadContent();

        await Promise.all([
            this.loadHat(),
            this.loadTranslations()
        ]);
        if (localStorage.preferredLang) {
            this.setLocale(localStorage.preferredLang);
        } else {
            this.setLocale("ru");
        }
    }

    initPages() {
        this.pages = new Pages({
            defaultPage: "main",
            pages: {
                main: "mainPage",
                join: "joinPage",
                wordCollection: {
                    els: ["wordCollectionPage"],
                    onEnter: () => {
                        show("wordCollectionPage_readyButton");
                        hide("wordCollectionPage_readyHint");
                        enable("wordCollectionPage_textarea");
                        el("wordCollectionPage_textarea").value = "";
                    }
                },
                game: {
                    els: ["gamePage"],
                    onEnter: () => {
                        this.sizeWord();
                    }
                },
                results: "resultsPage",
                settings: "gameSettingsPage",
                feedback: "feedbackPage",
                help: {
                    els: ["helpPage"],
                    onEnter: () => {
                        document.body.style.overflowY = "scroll";
                    },
                    onLeave: () => {
                        document.body.style.overflowY = "";
                    }
                },
                preparation: {
                    els: ["preparationPage"]
                }
            }
        });

        this.helpPages = new Pages({
            defaultPage: "rules",
            pages: {
                rules: {
                    els: ["helpPage_rulesBox"],
                    classes: [["helpPage_rulesOption", "active"]]
                },
                faq: {
                    els: ["helpPage_faqBox"],
                    classes: [["helpPage_faqOption", "active"]]
                },
                about: {
                    els: ["helpPage_aboutBox"],
                    classes: [["helpPage_aboutOption", "active"]]
                },
                news: {
                    els: ["helpPage_newsBox"],
                    classes: [["helpPage_newsOption", "active"]]
                }
            }
        });

        this.gamePages = new Pages({
            pages: {
                wait: {
                    els: ["gamePage_speakerListener"],
                    onEnter: () => {
                        show("gamePage_listenerReadyButton");
                        show("gamePage_speakerReadyButton");
                        hide("gamePage_listenerReady");
                        hide("gamePage_speakerReady");
                    },
                    render: (p) => {
                        p.enable("gamePage_finish");
                        if (this.game.myRole == "speaker") {
                            p.show("gamePage_speakerReadyBox");
                            p.show("gamePage_speakerTitle");
                        } else if (this.game.myRole == "listener") {
                            p.show("gamePage_listenerReadyBox");
                            p.show("gamePage_listenerTitle");
                        } else {
                            p.show("gamePage_waitTitle");
                        }

                        if (this.game.turnsCount == 0) {
                            p.show("gamePage_additionalStatus_nextTurn");
                            if (this.game.myNextRole == "speaker") {
                                p.show("gamePage_additionalStatus_nextTurn_speaker")
                            } else {
                                p.show("gamePage_additionalStatus_nextTurn_listener")
                            }
                        } else if (this.game.turnsCount > 0) {
                            p.show("gamePage_additionalStatus_turnsCounter");
                            if (this.game.myNextRole == "speaker") {
                                p.show("gamePage_additionalStatus_turnsCounter_speaker");
                            } else {
                                p.show("gamePage_additionalStatus_turnsCounter_listener");
                            }
                        }
                    }
                },
                explanationDelay: {
                    els: ["gamePage_explanationDelayBox"],
                    render: (p) => {
                        if (this.game.myRole == "speaker") {
                            p.show("gamePage_speakerTitle");
                        } else if (this.game.myRole == "listener") {
                            p.show("gamePage_listenerTitle");
                        } else {
                            p.show("gamePage_explanationTitle");
                        }
                    }
                },
                explanation: {
                    render: (p) => {
                        if (this.game.myRole == "speaker") {
                            p.show("gamePage_explanationBox");
                            p.show("gamePage_speakerTitle");
                        } else if (this.game.myRole == "listener") {
                            p.show("gamePage_speakerListener");
                            p.show("gamePage_observerBox");
                            p.show("gamePage_listenerTitle");
                        } else {
                            p.show("gamePage_speakerListener");
                            p.show("gamePage_observerBox");
                            p.show("gamePage_explanationTitle");
                        }

                        if (this.game.myRole == "speaker") {
                            p.show("gamePage_additionalStatus_youExplain");
                        } else if (this.game.turnsCount == 0) {
                            p.show("gamePage_additionalStatus_nextTurn");
                            if (this.game.myNextRole == "speaker") {
                                p.show("gamePage_additionalStatus_nextTurn_speaker")
                            } else {
                                p.show("gamePage_additionalStatus_nextTurn_listener")
                            }
                        } else if (this.game.turnsCount > 0) {
                            p.show("gamePage_additionalStatus_turnsCounter");
                            if (this.game.myNextRole == "speaker") {
                                p.show("gamePage_additionalStatus_turnsCounter_speaker");
                            } else {
                                p.show("gamePage_additionalStatus_turnsCounter_listener");
                            }
                        }
                    },
                    onEnter: () => {
                        this.sizeWord();
                    }
                },
                edit: {
                    els: ["gamePage_editTitle"],
                    render: (p) => {
                        hide("gamePage_additionalStatus_youExplain");
                        if (this.game.myRole == "speaker") {
                            p.show("gamePage_editBox");
                        } else {
                            p.show("gamePage_speakerListener")
                        }

                        if (this.game.turnsCount == 0) {
                            p.show("gamePage_additionalStatus_nextTurn");
                            if (this.game.myNextRole == "speaker") {
                                p.show("gamePage_additionalStatus_nextTurn_speaker")
                            } else {
                                p.show("gamePage_additionalStatus_nextTurn_listener")
                            }
                        } else if (this.game.turnsCount > 0) {
                            p.show("gamePage_additionalStatus_turnsCounter");
                            if (this.game.myNextRole == "speaker") {
                                p.show("gamePage_additionalStatus_turnsCounter_speaker");
                            } else {
                                p.show("gamePage_additionalStatus_turnsCounter_listener");
                            }
                        }
                    },
                    onEnter: () => {
                        this.editPageUpdateShadows();
                        el("gamePage_editListScrollable").scrollTop = 0;
                    },
                    onLeave: () => {
                        el("gamePage_editConfirm").classList.remove("shadow");
                        el("gamePage_status").classList.remove("shadow");
                    }
                }
            }
        });
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
        this.pages.$join.push();
        this.game.leave();
        this.emit("cLeaveRoom");
    }

    leaveResultsPage() {
        this.game.leave();
        this.pages.clear();
        this.pages.$join.push();
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
            this.failure({code: 101});
        }
        if (this.game.myUsername.trim() == "") {
            this.failure({code: 102});
        }
        let data = await (await fetch(`api/getRoomInfo?key=${this.game.key}`)).json();
        if (!data.success) {
            console.log("wow")
            console.log("Invalid room key");
            return;
        };
        if (["wait", "play", "prepare"].indexOf(data.state) != -1) {
            this.emit("cJoinRoom",
                {"username": this.game.myUsername,
                    "key": this.game.key,
                    "time_zone_offset": (new Date()).getTimezoneOffset() * (-60000)
            });
        } else if (data.state == "end") {
            console.log("Results in MVP-next.");
        } else {
            console.error("GetRoomInfo. Incorrect state.", data);
        }
    }


    async startExplanation({startTime}) {
        let roundId = this.game.roundId;
        const delayStartTime = startTime - this.game.settings.delayTime;
        const explanationStartTime = startTime;
        const aftermathStartTime = startTime + this.game.settings.explanationTime;
        const delayOnStart = () => this.gamePages.$explanationDelay.push();
        const explanationOnStart = () => this.gamePages.$explanation.push();
        setTimeout(async () => {
            await this.animateDelayTimer({
                startTime: delayStartTime,
                onStart: delayOnStart,
                roundId
            });
            await this.animateExplanationTimer({
                startTime: explanationStartTime,
                onStart: explanationOnStart,
                mustCall: true,
                roundId
            });
            await this.animateAftermathTimer({
                startTime: aftermathStartTime,
                roundId
            });
        }, delayStartTime - timeSync.getTime());
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

    async animateDelayTimer({startTime, roundId, onStart, mustCall}) {
        let gradient = colorGradientRGB(DELAY_COLORS);
        const duration = this.game.settings.delayTime;
        const draw = (progress) => {
            let sec = stairs(1 - progress,
                this.game.settings.delayTime / 1000) + 1;
            el("gamePage_explanationDelayTimer").innerText = sec;
            el("gamePage_explanationDelayTimer").style.background =
                `rgb(${gradient(progress).join()})`;
        }
        const stopCondition = () => {
            return this.game.roundId != roundId;
        }
        await animate({startTime, onStart, draw, duration, stopCondition, mustCall});
    }

    async animateExplanationTimer({startTime, roundId, onStart, mustCall}) {
        el("gamePage_explanationTimer").classList.remove("timer-aftermath");
        el("gamePage_observerTimer").classList.remove("timer-aftermath");
        const duration = this.game.settings.explanationTime;
        const draw = (progress) => {
            let sec = stairs(1 - progress,
                this.game.settings.explanationTime / 1000) + 1;
            let time = minSec(sec);
            el("gamePage_explanationTimer").innerText = time;
            el("gamePage_observerTimer").innerText = time;
        }
        const stopCondition = () => {
            return this.game.roundId != roundId;
        }
        await animate({startTime, onStart, draw, duration, stopCondition, mustCall});
        el("gamePage_explanationTimer").innerText = "00:00";
        el("gamePage_observerTimer").innerText = "00:00";
    }

    async animateAftermathTimer({startTime, roundId, onStart, mustCall}) {
        el("gamePage_explanationTimer").classList.add("timer-aftermath");
        el("gamePage_observerTimer").classList.add("timer-aftermath");
        const duration = this.game.settings.aftermathTime;
        const draw = (progress) => {
            let msec = stairs(1 - progress,
                this.game.settings.aftermathTime / 100) + 1;
            let time = secMsec(msec);
            el("gamePage_explanationTimer").innerText = time;
            el("gamePage_observerTimer").innerText = time;
        }
        const stopCondition = () => {
            return this.game.roundId != roundId;
        }
        await animate({startTime, onStart, draw, duration, stopCondition, mustCall});
        el("gamePage_explanationTimer").innerText = "0.0";
        el("gamePage_observerTimer").innerText = "0.0";
    }

    editPageUpdateShadows() {
        let elem = el("gamePage_editListScrollable");
        if (elem.scrollTop == 0) {
            el("gamePage_status").classList.remove("shadow");
        } else {
            el("gamePage_status").classList.add("shadow");
        }
        if (elem.scrollHeight - elem.scrollTop <= elem.clientHeight + 1) {
            el("gamePage_editConfirm").classList.remove("shadow");
        } else {
            el("gamePage_editConfirm").classList.add("shadow");
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
            if (navigator.permissions) {
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
        }
        if (!(navigator.clipboard && navigator.clipboard.writeText)) {
            disable("preparationPage_copyKey");
            disable("preparationPage_copyLink");
        } else {
            if (navigator.permissions) {
                navigator.permissions.query({"name": "clipboard-write"})
                .then(result => {
                    if (result.state == "denied") {
                        disable("preparationPage_copyKey");
                        disable("preparationPage_copyLink");
                    }
                    result.onchange = function() {
                        if (this.state == "denied") {
                            disable("preparationPage_copyKey");
                            disable("preparationPage_copyLink");
                        }
                    }
                }).catch(err => {});
            }
        }
    }

    listenerReady() {
        this.emit("cListenerReady");
        hide("gamePage_listenerReadyButton");
        show("gamePage_listenerReady");
    }

    speakerReady() {
        this.emit("cSpeakerReady");
        hide("gamePage_speakerReadyButton");
        show("gamePage_speakerReady");
    }

    failure({msg, code}) {
        if (code in ERROR_MSGS) {
            showError(_(ERROR_MSGS[code]));
        } else {
            showError(_(msg));
        }
        setTimeout(hideError, ERROR_TIMEOUT);
    }

    wordsReady() {
        this.emit("cWordsReady", {
            words: this.parseWords()
        });
        hide("wordCollectionPage_readyButton");
        show("wordCollectionPage_readyHint");
        disable("wordCollectionPage_textarea");
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
        result.SID = this.socket.id;
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

    async setLocale(lang) {
        if (this.lang && lang == this.lang) return;
        localStorage.preferredLang = lang;
        this.lang = lang;
        i18n.setLocale(lang);
        this.renderText();
        await this.loadLanguageDependentContent();
        this.game.renderHatCounter();
    }

    prepareGettext() {
        for (let elem of document.querySelectorAll("[gt-text]")) {
            elem.setAttribute("gt-text", elem.innerText.trim());
        }
    }

    renderText() {
        for (let elem of document.querySelectorAll("[gt]")) {
            for (let i=0; i<elem.attributes.length; i++) {
                if (elem.attributes[i].name.startsWith("gt-")) {
                    let attributeName = elem.attributes[i].name.slice(3);
                    let value = _(elem.attributes[i].value);
                    if (attributeName == "text") {
                        elem.innerText = value;
                    } else {
                        elem.setAttribute(attributeName, value);
                    }
                }
            }
        }
    }

    applySettings() {
        let settings = {};
        settings.delayTime = +el("gameSettingsPage_delayTimeField").value*1000;
        settings.explanationTime = +el("gameSettingsPage_explanationTimeField").value*1000;
        settings.aftermathTime = +el("gameSettingsPage_aftermathTimeField").value*1000;
        settings.termCondition = el("gameSettingsPage_termConditionList").value;
        settings.wordsetType = this.getWordsetType();
        if (settings.termCondition == "words" &&
            (settings.wordsetType == "serverDictionary" || settings.wordsetType == "hostDictionary")) {
            settings.wordNumber = +el("gameSettingsPage_wordNumberField").value;
        }
        if (settings.termCondition == "turns") {
            settings.turnsNumber = +el("gameSettingsPage_turnNumberField").value;
        }
        settings.strictMode = el("gameSettingsPage_strictModeCheckbox").checked;
        if (settings.wordsetType == "serverDictionary") {
            settings.dictionaryId = el("gameSettingsPage_dictionaryList").selectedIndex -
                DICTIONARY_LIST_EXTRA_OPTIONS.length;
        }
        if (settings.wordsetType == "hostDictionary") {
            settings.dictionaryFileInfo = this.dictionaryFileInfo;
            if (this.dictionaryFileWords !== undefined) {
                settings.wordset = this.dictionaryFileWords;
            }
        }
        this.emit("cApplySettings", {settings});
    }

    toggleVolume() {
        hide("gamePage_volumeOn");
        hide("gamePage_volumeOff");
        this.sound.toggleMute();
        if (this.sound.isMuted) {
            show("gamePage_volumeOff");
        } else {
            show("gamePage_volumeOn");
        }
        localStorage.volume = this.sound.isMuted ? "off" : "on";
    }

    finishGame() {
        if (!this.game.isHost) {
            console.error(_("Только хост может закончить игру"));
            return;
        }

        if (confirm(_("Вы уверены, что хотите завершить игру?")+ (this.game.state == "wait" ?
            _(" Игра закончится, и вы сможете посмотреть результаты.") :
            _(" Игра закончится в конце текущего раунда.")))) {
            this.emit("cEndGame");
        }
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

    getWordsetType() {
        let dictionaryListId = el("gameSettingsPage_dictionaryList").selectedIndex;
        if (dictionaryListId >= DICTIONARY_LIST_EXTRA_OPTIONS.length) {
            return "serverDictionary";
        } else {
            return DICTIONARY_LIST_EXTRA_OPTIONS[dictionaryListId].wordsetType;
        }
    }

    updateSettings() {
        let elem = el("gameSettingsPage_termConditionList");
        let wordsetType = this.getWordsetType();
        hide("gameSettingsPage_wordNumber");
        hide("gameSettingsPage_turnNumber");
        hide("gameSettingsPage_loadDictionary");
        if (elem.value == "words" &&
            (wordsetType == "serverDictionary" || wordsetType == "hostDictionary")) {
            show("gameSettingsPage_wordNumber");
        }
        if (elem.value == "turns") {
            show("gameSettingsPage_turnNumber");
        }
        if (wordsetType == "hostDictionary") {
            show("gameSettingsPage_loadDictionary");
        } else {
            this.removeSelectedDictionaryFile();
        }
        this.updateDictionaryFileLoaderText();
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
                    showError(_("Нет соединения, перезагрузите страницу"));
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
            this.game.state = data.state == "wait" ? "preparation" :
                data.state == "play" ? data.substate : data.state =="prepare" ?
                "wordCollection" : data.state;
            switch (data.state) {
            case "wait":
                this.pages.$preparation.push();
                break;
            case "prepare":
                this.pages.$wordCollection.push();
                break;
            case "play":
                this.pages.$game.push();
                switch(data.substate) {
                case "wait":
                    this.gamePages.$wait.push();
                    break;
                case "explanation":
                    this.setWord(data.word);
                    this.startExplanation(data);
                    this.playExplanationSounds(data);
                    break;
                case "edit":
                    this.gamePages.$edit.push();
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
        })
        this.socket.on("sPlayerLeft", data => {
            this.game.update(data);
        })
        this.socket.on("sNewSettings", data => {
            this.game.update(data);
        })
        this.socket.on("sWordCollectionStarted", () => {
            this.game.state = "wordCollection";
            this.pages.$wordCollection.push();
        })
        this.socket.on("sGameStarted", data => {
            this.game.state = "wait";
            this.game.update(data);
            this.gamePages.$wait.push();
            this.pages.$game.push();
        })
        this.socket.on("sExplanationStarted", data => {
            this.game.state = "explanation";
            this.startExplanation(data);
            this.playExplanationSounds(data);
        })
        this.socket.on("sNewWord", data => {
            this.setWord(data.word);
        })
        this.socket.on("sWordsToEdit", data => {
            this.game.update(data);
            this.gamePages.$edit.push();
        })
        this.socket.on("sNextTurn", data => {
            this.game.state = "wait";
            this.game.update(data);
            this.gamePages.$wait.push();
        })
        this.socket.on("sWordExplanationEnded", data => {
            this.game.state = "edit";
            this.game.update(data);
        })
        this.socket.on("sExplanationEnded", data => {
            this.game.update(data);
            this.game.roundId += 1;
            this.gamePages.$edit.push();
        })
        this.socket.on("sGameEnded", data => {
            this.game.state = "end";
            this.game.update(data);
            this.game.leave();
            this.pages.$results.push();
        })
        this.socket.on("sFailure", data => {
            this.failure(data);
        })
    }

    validateSettings() {
        if (this.getWordsetType() == "hostDictionary") {
            if (this.dictionaryFileInfo === undefined) {
                showError("Нужно выбрать файл");
                return false;
            }
            if (this.dictionaryFileInfo.wordNumber === undefined) {
                showError("Файл загружается");
                return false;
            }
        }
        return true;
    }

    setDOMEventListeners() {
        el("mainPage_createRoom").onclick = () => {
            this.generateKey();
            this.pages.$join.push();
        }
        el("mainPage_joinRoom").onclick = () => {
            el("joinPage_inputKey").value = this.game.key;
            this.pages.$join.push()
        }
        el("mainPage_ru").onclick = () => this.setLocale("ru");
        el("mainPage_en").onclick = () => this.setLocale("en");

        el("joinPage_goBack").onclick = () => this.pages.goBack();
        el("joinPage_pasteKey").onclick = () => this.pasteKey();
        el("joinPage_generateKey").onclick = () => this.generateKey();
        el("joinPage_go").onclick = () => {
            this.setKey(el("joinPage_inputKey").value);
            this.game.myUsername = el("joinPage_inputName").value;
            this.enterRoom();
        }

        el("preparationPage_goBack").onclick = () => this.leaveRoom();
        el("preparationPage_startGame").onclick = () => {
            this.emit("cStartGame");
        }
        el("preparationPage_startWordCollection").onclick = () => {
            this.emit("cStartWordCollection")
        }
        el("preparationPage_copyKey").onclick = () => this.copyKey();
        el("preparationPage_copyLink").onclick = () => this.copyLink();

        el("gamePage_listenerReadyButton").onclick = () =>
            this.listenerReady();
        el("gamePage_speakerReadyButton").onclick = () =>
            this.speakerReady();
        el("gamePage_explanationSuccess").onclick = throttle(() => {this.emit(
            "cEndWordExplanation", {"cause": "explained"})}, GAME_BUTTON_COOLDOWN_TIME);
        el("gamePage_explanationFailed").onclick = throttle(() => this.emit(
            "cEndWordExplanation", {"cause": "notExplained"}), GAME_BUTTON_COOLDOWN_TIME);
        el("gamePage_explanationMistake").onclick = throttle(() => this.emit(
            "cEndWordExplanation", {"cause": "mistake"}), GAME_BUTTON_COOLDOWN_TIME);
        el("gamePage_goBack").onclick = () => this.leaveRoom();
        el("gamePage_leave").onclick = () => this.leaveRoom();
        el("gamePage_volume").onclick = () => this.toggleVolume();
        el("gamePage_finish").onclick = () => this.finishGame();
        el("gamePage_editConfirm").onclick = () => this.emit("cWordsEdited",
            this.game.editedWordsObject());
        el("gamePage_editListScrollable").onscroll = () => this.editPageUpdateShadows();

        el("gameSettingsPage_goBack").onclick = () => this.pages.goBack();
        el("gameSettingsPage_revertButton").onclick = () => {
            this.game.updateSettingsState();
            this.pages.goBack();
        }
        el("gameSettingsPage_applyButton").onclick = () => {
            if (this.validateSettings()) {
                this.applySettings();
                this.pages.goBack();
            }
        }
        el("gameSettingsPage_termConditionList").onchange = () => {
            this.updateSettings();
        }
        el("gameSettingsPage_dictionaryList").onchange = () => {
            this.updateSettings();
        }

        el("wordCollectionPage_readyButton").onclick = () => {
            this.wordsReady();
        }

        el("preparationPage_openSettings").onclick =
            () => this.pages.$settings.push();

        el("resultsPage_goBack").onclick = () => this.leaveResultsPage();
        el("resultsPage_newGame").onclick = () => {
            this.setKey(this.game.nextKey);
            this.enterRoom();
        }
        el("helpPage_goBack").onclick = () => this.pages.goBack();
        el("helpPage_rulesOption").onclick = () => {
            this.helpPages.$rules.push()
        }
        el("helpPage_faqOption").onclick = () => {
            this.helpPages.$faq.push();
        }
        el("helpPage_aboutOption").onclick = () => {
            this.helpPages.$about.push();
        }
        el("helpPage_newsOption").onclick = () => {
            this.helpPages.$news.push();
        }

        el("feedbackPage_goBack").onclick = () => this.pages.goBack();
        el("feedbackPage_submit").onclick = () => this.sendFeedback();

        el("failureClose").onclick = hideError;

        els("helpButton").forEach((it) => it.onclick = () => this.pages.$help.push());
        els("feedbackButton").forEach((it) => it.onclick = () => this.pages.$feedback.push());
        els("version").forEach((it) => it.innerText = VERSION);

        // Adding settings hint
        let prefixes = [
            "gameSettingsPage_wordNumber",
            "gameSettingsPage_delayTime",
            "gameSettingsPage_explanationTime",
            "gameSettingsPage_aftermathTime",
            "gameSettingsPage_strictMode",
            "gameSettingsPage_turnNumber",
            "gameSettingsPage_loadFile"
        ];
        for (let idPrefix of prefixes) {
            this.addHint(idPrefix+"Info");
        }

        els("type.number").forEach(it => validateNumber(it.id));

        el("gameSettingsPage_loadFileInput").addEventListener('change', () => this.parseDictionaryFile());
    }

    updateDictionaryFileLoaderText() {
        let input = el("gameSettingsPage_loadFileInput");
        let label = el("gameSettingsPage_loadFileLabel");
        if (this.dictionaryFileInfo !== undefined) {
            if (this.dictionaryFileInfo.wordNumber !== undefined) {
                label.innerText = `${this.dictionaryFileInfo.filename}, ${this.dictionaryFileInfo.wordNumber} words`;
            } else {
                label.innerText = `${this.dictionaryFileInfo.filename} (loading...)`
            }
        } else {
            label.innerText = "Файл не выбран";
        }
    }

    loadWordsFromFile(evt) {
        let lines = evt.target.result.split('\n').map(x => x.trim());
        this.dictionaryFileWords = [...new Set(lines.filter(x => x != ""))];
        this.dictionaryFileInfo.wordNumber = this.dictionaryFileWords.length;
        this.updateDictionaryFileLoaderText();
    }

    dictionaryLoadError(evt) {
        showError("Can't open file");
        this.removeSelectedDictionaryFile();
    }

    validateDictionaryFile(file) {
        if (file.type != "" && file.type != "text/plain") {
            showError("You should send a text file");
            return false;
        }
        if (file.size > DICTIONARY_MAX_SIZE) {
            showError("Max dictionary size is 64 MiB");
            return false;
        }
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (evt) => this.loadWordsFromFile(evt);
        reader.onerror = (evt) => this.dictionaryLoadError(evt);
        return true;
    }

    removeSelectedDictionaryFile() {
        el("gameSettingsPage_loadFileInput").value = "";
        delete this.dictionaryFileInfo;
        delete this.dictionaryFileWords;
    }

    parseDictionaryFile() {
        if (el("gameSettingsPage_loadFileInput").files.length) {
            let file = el("gameSettingsPage_loadFileInput").files[0];
            this.dictionaryFileInfo = {
                "filename": file.name
            };
            if (!this.validateDictionaryFile(file)) {
                this.removeSelectedDictionaryFile();
            }
        }
        this.updateDictionaryFileLoaderText();
    }

    parseWords() {
        let wordSeparator = "\n";
        let wordsText = el("wordCollectionPage_textarea").value;
        let words = wordsText.split(wordSeparator).map(x => x.trim()).filter(x => x != "");
        return words;
    }

    async loadFile(name, callback) {
        let response = await fetch(name);
        let data = await response.text();
        callback(data)
    }

    async loadContent() {
        await this.loadSvgs();
    }

    async loadLanguageDependentContent() {
        this.loadDictionaries();
        this.loadPages().then(() => {
            els("helpButton").forEach((it) => it.onclick = () => this.pages.$help.push());
            els("feedbackButton").forEach((it) => it.onclick = () => this.pages.$feedback.push());
            els("version").forEach((it) => it.innerText = VERSION);
        })
    }

    async loadHat() {
        let elem = el("gamePage_hatSvg");
        let response = await fetch(elem.getAttribute("src"));
        let svg = await response.text();
        el("gamePage_hatSvg").innerHTML = svg;
    }

    async loadSvgs() {
        const loaders = [...els("svg")].map(curEl => {
            return this.loadFile(curEl.getAttribute("src"),
                function(svg) {
                    curEl.innerHTML = svg;
            })
        })
        await Promise.all(loaders);
    }

    async loadPages() {
        let loadablePages = [
            {
                "pageFile": `rules.${this.lang}.html`,
                "pageId": "helpPage_rulesBox"
            },
            {
                "pageFile": `faq.${this.lang}.html`,
                "pageId": "helpPage_faqBox"
            },
            {
                "pageFile": `about.${this.lang}.html`,
                "pageId": "helpPage_aboutBox"
            },
            {
                "pageFile": `news.${this.lang}.html`,
                "pageId": "helpPage_newsBox"
            }
        ];
        const loaders = loadablePages.map(page => {
            return this.loadFile(page.pageFile, function(body) {
                el(page.pageId).innerHTML = body;
            })
        })
        await Promise.all(loaders);
    }

    async loadDictionaries() {
        let dictionaries = await (await fetch("api/getDictionaryList")).json();
        el("gameSettingsPage_dictionaryList").innerHTML = "";
        for (let opt of DICTIONARY_LIST_EXTRA_OPTIONS) {
            el("gameSettingsPage_dictionaryList").innerHTML += `<option>${opt.name}</option>`
        }
        for (let dict of dictionaries.dictionaries) {
            let dictname = `${dict.name[this.lang]}, ${dict.wordNumber} ${_("слово", dict.wordNumber)}`;
            el("gameSettingsPage_dictionaryList").innerHTML += `<option>${dictname}</option>`;
        }
    }

    async loadTranslations() {
        let langs = ["en", "ru"];
        for (let lang of langs) {
            let json = await (await fetch(`localization/${lang}.json`)).text();
            i18n.loadJSON(json, 'messages');
        }
    }
}
