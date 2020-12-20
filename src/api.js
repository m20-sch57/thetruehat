import app from "src/app.js"
import { VERSION, HASH } from "./version.js"

export async function getFreeKey() {
	return (await (await fetch("api/getFreeKey")).json()).key
}

class RoomInfo {
	constructor(data) {
		if (!data) { this.success = false; return; }

		this.data = data;
		this.success = true;

		this.state = data.state;
		this.playersList = data.playerList;
		this.playersInfo = Object.fromEntries(this.playersList.map(u => [u.username, u.online]));
	}
}

export async function getRoomInfo(key) {
	if (key === "") return new RoomInfo();
	return new RoomInfo(await (await fetch("api/getRoomInfo?key=" + key)).json());
}

export async function sendFeedback(message, collectBrowserData) {
	let feedback = {};

	if (collectBrowserData) {
		feedback.appName = navigator.appName;
		feedback.appVersion = navigator.appVersion;
		feedback.cookieEnabled = navigator.cookieEnabled;
		feedback.platform = navigator.platform;
		feedback.product = navigator.product;
		feedback.userAgent = navigator.userAgent;
	}

	feedback.SID = app.socket.id;
	feedback.version = VERSION;
	feedback.hash = HASH;
	feedback.message = message;
	feedback.appLog = app.appLog;

	return await fetch("feedback", {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=utf-8"
		},
		body: JSON.stringify(feedback)
	});
}
