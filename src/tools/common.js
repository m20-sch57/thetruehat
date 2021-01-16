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

export function throttle(func, cooldownTime) {
    console.log("throttle");
    let callTime = performance.now() - cooldownTime;
    return function (...args) {
        let now = performance.now();
        if (now - callTime >= cooldownTime) {
            callTime = now;
            return func(...args);
        }
    };
}

export function minSec(sec) {
    let min = Math.floor(sec / 60);
    sec -= 60 * min;
    if (sec < 10) sec = "0" + String(sec);
    if (min < 10) min = "0" + String(min);
    return `${min}:${sec}`;
}

export function secMsec(msec) {
    let sec = Math.floor(msec / 10);
    msec -= 10 * sec;
    return `${sec}.${msec}`;
}
