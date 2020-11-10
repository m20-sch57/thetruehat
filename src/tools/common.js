export function debounce(func, delay) {
	let lastCallTime, lastCall;
	return function() {
		let now = performance.now();
		if (lastCallTime && now - lastCallTime < delay) {
			clearTimeout(lastCall);
		}
		lastCallTime = now;
		lastCall = setTimeout(() => func(...arguments), delay);
	}
}
