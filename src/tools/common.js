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

export function removeByValue(array, value) {
    const ind = array.indexOf(value);
    if (ind === -1) return false;
    array.splice(ind, 1);
    return true;
}

export function removeByPredicat(array, p) {
    const ind = array.findIndex(p);
    if (ind === -1) return false;
    array.splice(ind, 1);
    return true;
}

export function concat(array) {
    let result = [];
    for (let elem of array) {
        result.concat(elem);
    }
    return result;
}
