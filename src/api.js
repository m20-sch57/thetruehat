export async function getFreeKey() {
	return (await (await fetch("api/getFreeKey")).json()).key
}

export async function getRoomInfo(key) {
	return (await (await fetch("api/getRoomInfo?key=" + key)).json())
}
