import Vue from "vue";
import Vuex from "vuex";

import {timeSync} from "./tools";

const getTime = () => timeSync.getTime();

Vue.use(Vuex);

function set(props) {
    if (typeof props === "string") props = [props];
    return function (state, payload) {
        for (let prop of props) {
            state[prop] = payload[prop];
        }
    };
}

const roomModule = {
    state: {
        connection: "offline",
        key: null,
        username: null,
        stage: null,
        explanationTimer: null,
        players: null,
        host: null,
        speaker: null,
        listener: null,
        wordsLeft: null,
        roundsLeft: null,
        timetable: null,
        word: null,
        editWords: null,
        startTime: null,
        results: null,
        settings: null,
        roundId: 0
    },
    mutations: {
        leaveRoom(state) {
            state.connection = "offline";
            state.stage = null;
            state.explanationTimer = null;
            state.players = null;
            state.host = null;
            state.speaker = null;
            state.listener = null;
            state.wordsLeft = null;
            state.roundsLeft = null;
            state.timetable = null;
            state.word = null;
            state.editWords = null;
            state.startTime = null;
            state.results = null;
            state.settings = null;
            state.roundId += 1;
        },
        connectRoom(state, payload) {
            set(["username", "key"])(state, payload);
            state.connection = "connection";
        },
        joinRoom(state, payload) {
            state.connection = "online";
            set(["stage", "players", "host", "settings"])(state, payload);

            if (payload.stage.startsWith("play")) {
                set(["speaker", "listener", "timetable"])(state, payload);

                if (state.settings.termCondition === "words") {
                    set("wordsLeft")(state, payload);
                }
                if (state.settings.termCondition === "rounds") {
                    set("roundsLeft")(state, payload);
                }
            }

            if (payload.stage === "play_explanation") {
                set(["word", "startTime"])(state, payload);
            }

            if (payload.stage === "play_edit") {
                set(["editWords"])(state, payload);
            }
        },
        wordCollectionStarted(state) {
            state.stage = "prepare_wordCollection";
        },
        gameStarted(state, payload) {
            state.stage = "play_wait";
            set(["speaker", "listener", "timetable"])(state, payload);
            if (state.settings.termCondition === "words") {
                set("wordsLeft")(state, payload);
            }
            if (state.settings.termCondition === "rounds") {
                set("roundsLeft")(state, payload);
            }
        },
        explanationStarted(state, {startTime}) {
            state.startTime = startTime;
            state.stage = "play_explanation";
        },
        explanationEnded(state, {editWords}) {
            if (editWords) {
                state.editWords = editWords;
            }
            state.stage = "play_edit";
            state.startTime = null;
            state.word = null;
            state.roundId += 1;
        },
        nextTurn(state, payload) {
            state.stage = "play_wait";
            set(["speaker", "listener", "timetable"])(state, payload);
            if (state.settings.termCondition === "words") {
                set("wordsLeft")(state, payload);
            }
            if (state.settings.termCondition === "rounds") {
                set("roundsLeft")(state, payload);
            }
            state.editWords = null;
            state.explanationTimer = null;
        },
        gameEnded(state, {results}) {
            state.stage = "end";
            state.results = results;
        },
        setPlayers: set("players"),
        setHost: set("host"),
        setSettings: set("settings"),
        setSpeakerListener: set(["speaker", "listener"]),
        setWordsLeft: set("wordsLeft"),
        setRoundsLeft: set("roundsLeft"),
        setWord: set("word"),
        setExplanationTimer: set("explanationTimer")
    },
    actions: {
        async explanationStarted({commit, state}, {startTime}) {
            const roundId = state.roundId;
            const until = (ms) => {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms - getTime());
                });
            };

            await until(startTime - state.settings.delayTime);
            if (state.roundId !== roundId) return;
            if (state.settings.delayTime !== 0) {
                commit("explanationStarted", {startTime});
                commit("setExplanationTimer", {explanationTimer: "delay"});
            }
            await until(startTime);
            if (state.roundId !== roundId) return;
            if (state.settings.delayTime === 0) {
                commit("explanationStarted", {startTime});
            }
            commit("setExplanationTimer", {explanationTimer: "explanation"});
            await until(startTime + state.settings.explanationTime);
            if (state.roundId !== roundId) return;
            commit("setExplanationTimer", {explanationTimer: "aftermath"});
        },
    },
    getters: {
        onlinePlayers(state) {
            if (state.players) {
                return state.players.filter(user => user.online)
                    .map(user => user.username);
            }
        },
        isHost(state) {
            return state.host === state.username;
        },
        myRole(state) {
            if (state.speaker && state.listener) {
                if (state.speaker === state.username) return "speaker";
                if (state.listener === state.username) return "listener";
                return "observer";
            }
        },
        timetableInfo(state) {
            if (state.timetable) {
                let res = {};
                for (let i = 0; i < state.timetable.length; i++) {
                    let pair = state.timetable[i];
                    if (pair.speaker === state.username) {
                        res.turnsCount = i - 1;
                        res.myNextRole = "speaker";
                        return res;
                    }
                    if (pair.listener === state.username) {
                        res.turnsCount = i - 1;
                        res.myNextRole = "listener";
                        return res;
                    }
                }
            }
        }
    }
};

export default new Vuex.Store({
    modules: {
        room: roomModule
    }
});
