import store from "./store.js"
import router from "./router.js"
import { timeSync } from "./lib"

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
            time: timeSync.getTime(),
            humanTime: (new Date(timeSync.getTime()).toISOString())
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

	listen() {
        let events = [
			"sFailure", "sPlayerJoined", "sPlayerLeft",
			"sYouJoined", "sGameStarted", "sExplanationStarted",
			"sExplanationEnded", "sNextTurn", "sNewWord",
			"sWordExplanationEnded", "sWordsToEdit", "sGameEnded",
			"sNewSettings"
		];
        events.forEach(event => {
            this.socket.on(event, data =>  {
                this.logSignal(event, data);
            })
		})

		this.socket.on("sYouJoined", data => {
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
		})

		this.socket.on("sPlayerJoined", data => {
			store.commit("setPlayers", {
				players: data.playerList
			});
			store.commit("setHost", {
				host: data.host
			});
		})

		this.socket.on("sPlayerLeft", data => {
			store.commit("setPlayers", {
				players: data.playerList
			});
			store.commit("setHost", {
				host: data.host
			});
		})
	}
}

export default new App()
