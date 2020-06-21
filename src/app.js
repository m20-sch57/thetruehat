import Vue from "vue"

import store from "./store.js"
import router from "./router.js"
import { timeSync } from "./lib"
import { ERROR_TIMEOUT } from "./config.js"

const getTime = () => timeSync.getTime()

class App {
	constructor() {
		this.debug = false;
        this.applog = [];

        this.socket = io.connect(window.location.origin,
			{"path": window.location.pathname + "socket.io"});

		this.listen();
	}

	log({data, consoleData, level}) {
		consoleData = consoleData || [data];
		level = level || "info";
		this.applog.push({
			...data,
            time: getTime(),
            humanTime: (new Date(getTime()).toISOString())
		})
		if (this.debug) {
			console[level]("%c[App]", "color: green", ...consoleData);
		}
	}

	logSignal(event, data) {
		let level = event == "sFailure" ? "warn" : "info";
		let msg = "";
		if (event == "sFailure") {
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
		store.commit("connectRoom", {username, key});
		this.emit("cJoinRoom", {username, key});
	}

	leaveRoom() {
		store.commit("leaveRoom");
		this.emit("cLeaveRoom");
	}

	applySettings(settings) {
		store.commit("setSettings", {settings});
		this.emit("cApplySettings", {settings});
	}

	startGame() {
		this.emit("cStartGame");
	}

	getReady() {
		if (store.getters.myRole == "speaker") {
			this.emit("cSpeakerReady");
		}
		if (store.getters.myRole == "listener") {
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

	listen() {
        const events = [
			"sFailure", "sPlayerJoined", "sPlayerLeft",
			"sYouJoined", "sGameStarted", "sExplanationStarted",
			"sExplanationEnded", "sNextTurn", "sNewWord",
			"sWordExplanationEnded", "sWordsToEdit", "sGameEnded",
			"sNewSettings"
		];

        events.forEach(event => {
            this.socket.on(event, data => {
                this.logSignal(event, data);
            })
		})

		const handlers = {
			sYouJoined: data => {
				store.commit("joinRoom", {
					phase: data.state == "wait"
						? "preparation"
						: data.state == "play"
						? data.substate
						: "end",
					players: data.playerList,
					...data
				})
				router.push("/game");
			},

			sPlayerJoined: data => {
				store.commit("setPlayers", {
					players: data.playerList
				});
				store.commit("setHost", {
					host: data.host
				});
			},

			sPlayerLeft: data => {
				store.commit("setPlayers", {
					players: data.playerList
				});
				store.commit("setHost", {
					host: data.host
				});
			},

			sNewSettings: data => {
				store.commit("setSettings", data);
			},

			sGameStarted: data => {
				// store.commit("setPhase", {phase: "wait"});
				// store.commit("setSpeakerListener", data);
				// store.commit("setWordsCount", data)
				store.commit("gameStarted", data);
			},

			sExplanationStarted: data => {
				setTimeout(() => {
					store.commit("explanationStarted", data);
				}, data.startTime - getTime() - store.state.room.settings.delayTime);
			},

			sNewWord: data => {
				store.commit("setWord", data);
			},

			sWordExplanationEnded: data => {
				store.commit("setWordsCount", data);
			},

			sExplanationEnded: data => {
				if (store.getters.myRole != "speaker") {
					store.commit("explanationEnded", data);
				}
			},

			sWordsToEdit: data => {
				store.commit("explanationEnded", data);
			},

			sNextTurn: data => {
				store.commit("nextTurn", data);
			},

			sGameEnded: data => {
				store.commit("leaveRoom");
				store.commit("setResults", data);
				router.push("/results");
			},

			sFailure: data => {
				Vue.notify({
					msg: data.msg,
					duration: ERROR_TIMEOUT
				});
			}
		}

		for (let event of Object.keys(handlers)) {
			this.socket.on(event, handlers[event]);
		}
	}
}

export default new App()
