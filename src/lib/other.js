export function userWarning() {
	console.log("%c Не лезь сюда, оно сожрёт тебя !", `
		font-size: 100px;
		text-shadow: 2px 2px 0px red, -2px 2px 0px red, 2px -2px 0px red, -2px -2px 0px red;
	`);
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

Array.prototype.last = function() {
    console.assert(this.length >= 1,
        "Attempt to get last element of empty array");
    return this[this.length - 1];
}

export function el(id) {
    return document.getElementById(id);
}
