import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex);

const roomModule = {
	state: {
		connection: "offline",
		key: null,
		username: null,
		phase: null,
		players: null,
		host: null,
	},
	mutations: {
		leaveRoom(state) {
			state.connection = "offline";
			state.phase = null;
			state.players = null;
			state.host = null;
		},
		connectRoom(state, {username, key}) {
			state.connection = "connection";
			state.username = username;
			state.key = key;
		},
		joinRoom(state, {phase, players, host, settings}) {
			state.connection = "online"
			state.phase = phase;
			state.players = players;
			state.host = host;
			state.settings = settings;
		},
		setPlayers(state, {players}) {
			state.players = players;
		},
		setHost(state, {host}) {
			state.host = host;
		}
	},
	getters: {
		onlinePlayers(state) {
			if (state.players) {
				return state.players.filter(user => user.online)
					.map(user => user.username)
			}
		},
		isHost(state) {
			return state.host == state.username
		}
	}
}

export default new Vuex.Store({
	modules: {
		room: roomModule
	}
})
