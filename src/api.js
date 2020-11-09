export async function getFreeKey() {
	return (await (await fetch("api/getFreeKey")).json()).key
}
