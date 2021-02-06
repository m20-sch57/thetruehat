import store from "./store";
import {timeSync} from "./tools";
// import Vue from "vue";
// import {ERROR_TIMEOUT} from "./config.js";

const getTime = () => timeSync.getTime();

export class App {
    constructor(store) {
        this.debug = false;
        this.applog = [];

        // eslint-disable-next-line no-undef
        this.socket = io.connect(window.location.origin,
            {"path": window.location.pathname + "socket.io"});

        this.store = store;

        this.listen();
    }

    log({data, consoleData, level}) {
        consoleData = consoleData || [data];
        level = level || "info";
        this.applog.push({
            ...data,
            time: getTime(),
            humanTime: (new Date(getTime()).toISOString())
        });
        if (this.debug) {
            console[level]("%c[App]", "color: green", ...consoleData);
        }
    }

    logSignal(event, data) {
        let level = event === "sFailure" ? "warn" : "info";
        let msg = "";
        if (event === "sFailure") {
            msg = `on request ${data.request}. ${data.msg} (code: ${data.code})`;
        }
        this.log({
            data: {event, data},
            consoleData: [event, msg, data],
            level
        });
    }

    emit(event, data) {
        this.socket.emit(event, data);
        this.logSignal(event, data);
    }

    joinRoom({username, key}) {
        this.store.commit("connectRoom", {username, key});
        this.emit("cJoinRoom", {
            username, key,
            timeZoneOffset: (new Date()).getTimezoneOffset() * (-60000)
        });
    }

    leaveRoom() {
        this.store.commit("leaveRoom");
        this.emit("cLeaveRoom");
    }

    applySettings(settings) {
        this.store.commit("setSettings", {settings});
        this.emit("cApplySettings", {settings});
    }

    startGame() {
        this.emit("cStartGame");
    }

    getReady() {
        if (this.store.getters.myRole === "speaker") {
            this.emit("cSpeakerReady");
        }
        if (this.store.getters.myRole === "listener") {
            this.emit("cListenerReady");
        }
    }

    explained() {
        this.emit("cEndWordExplanation", {cause: "explained"});
    }

    notExplained() {
        this.emit("cEndWordExplanation", {cause: "notExplained"});
    }

    mistake() {
        this.emit("cEndWordExplanation", {cause: "mistake"});
    }

    editWords(editWords) {
        this.emit("cWordsEdited", {editWords});
    }

    finish() {
        this.emit("cEndGame");
    }

    listen() {
        const handlers = {
            sYouJoined: data => {
                this.store.commit("joinRoom", {
                    players: data.playersList,
                    ...data
                });
                if (this.store.state.room.stage === "play_explanation") {
                    this.store.dispatch("explanationStarted", {startTime: data.startTime});
                }
            },

            sPlayerJoined: data => {
                this.store.commit("setPlayers", {
                    players: data.playersList
                });
                this.store.commit("setHost", {
                    host: data.host
                });
            },

            sPlayerLeft: data => {
                this.store.commit("setPlayers", {
                    players: data.playersList
                });
                this.store.commit("setHost", {
                    host: data.host
                });
            },

            sNewSettings: data => {
                this.store.commit("setSettings", data);
            },

            sWordCollectionStarted: () => {
                this.store.commit("wordCollectionStarted");
            },

            sGameStarted: data => {
                this.store.commit("gameStarted", data);
            },

            sExplanationStarted: data => {
                this.store.dispatch("explanationStarted", data);
            },

            sNewWord: data => {
                this.store.commit("setWord", data);
            },

            sWordExplanationEnded: data => {
                if (this.store.state.room.settings.termCondition === "words") {
                    this.store.commit("setWordsLeft", data);
                }
                if (this.store.state.room.settings.termCondition === "rounds") {
                    this.store.commit("setRoundsLeft", data);
                }
            },

            sExplanationEnded: data => {
                if (this.store.getters.myRole !== "speaker") {
                    this.store.commit("explanationEnded", data);
                }
            },

            sWordsToEdit: data => {
                this.store.commit("explanationEnded", data);
            },

            sNextTurn: data => {
                this.store.commit("nextTurn", data);
            },

            sGameEnded: data => {
                this.store.commit("gameEnded", data);
            },

            // sFailure: data => {
            //     Vue.notify({
            //     	msg: data.msg,
            //     	duration: ERROR_TIMEOUT
            //     });
            // }
        };

        for (let event of Object.keys(handlers)) {
            this.socket.on(event, data => {
                this.logSignal(event, data);
            });
            this.socket.on(event, handlers[event]);
        }
    }
}

export default new App(store);
