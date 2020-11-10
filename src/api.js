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
	if (key == "") return new RoomInfo();
	return new RoomInfo(await (await fetch("api/getRoomInfo?key=" + key)).json())
}
