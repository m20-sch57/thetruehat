export function playersInfo(playersList) {
	return Object.fromEntries(playersList.map(u => [u.username, u]));
}
