import Vue from "vue";
import Vuex from "vuex";

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
        state: null,
        substate: null,
        players: null,
        host: null,
        speaker: null,
        listener: null,
        wordsCount: null,
        word: null,
        editWords: null,
        roundId: 0,
        results: null,
        settings: null
    },
    mutations: {
        leaveRoom(state) {
            state.connection = "offline";
            state.state = null;
            state.substate = null;
            state.players = null;
            state.host = null;
            state.speaker = null;
            state.listener = null;
            state.wordsCount = null;
            state.editWords = null;
            state.word = null;
            state.startTime = null;
            state.settings = null;
            state.roundId += 1;
        },
        connectRoom(state, payload) {
            set(["username", "key"])(state, payload);
            state.connection = "connection";
        },
        joinRoom(state, payload) {
            state.connection = "online";
            set(["state", "players", "host", "settings"])(state, payload);

            if (payload.state === "play") {
                set(["substate", "speaker", "listener", "wordsCount"])(state, payload);

                if (payload.substate === "explanation") {
                    set(["word", "startTime"])(state, payload);
                }

                if (payload.substate === "edit") {
                    set(["editWords"])(state, payload);
                }
            }
        },
        wordCollectionStarted(state) {
            state.state = "prepare";
        },
        gameStarted(state, payload) {
            state.state = "play";
            state.substate = "wait";
            set(["wordsCount", "speaker", "listener"])(state, payload);
        },
        explanationStarted(state, {startTime}) {
            state.startTime = startTime;
            state.substate = "explanation";
        },
        explanationEnded(state, {editWords}) {
            if (editWords) {
                state.editWords = editWords;
            }
            state.substate = "edit";
            state.startTime = null;
            state.word = null;
        },
        nextTurn(state, payload) {
            state.substate = "wait";
            set(["speaker", "listener", "wordsCount"])(state, payload);
            state.editWords = null;
            state.roundId += 1;
        },
        setResults(state, {results}) {
            state.results = results;
        },
        setPlayers: set("players"),
        setHost: set("host"),
        setSettings: set("settings"),
        setSpeakerListener: set(["speaker", "listener"]),
        setWordsCount: set("wordsCount"),
        setWord: set("word"),
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
        }
    }
};

export default new Vuex.Store({
    modules: {
        room: roomModule
    }
});
