export function debounce(func, delay) {
    let lastCallTime, lastCall;
    return function (...args) {
        let now = performance.now();
        if (lastCallTime && now - lastCallTime < delay) {
            clearTimeout(lastCall);
        }
        lastCallTime = now;
        lastCall = setTimeout(() => func(...args), delay);
    };
}
