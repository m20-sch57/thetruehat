import { timeSync } from "__/lib"

export function animate({startTime, timing, draw, duration, stopCondition}) {
    // Partially taken from https://learn.javascript.ru
    timing = timing || (time => time);
    stopCondition = stopCondition || (() => false)
    return new Promise(function(resolve) {
        let start = startTime;
        requestAnimationFrame(function animate() {
			let time = timeSync.getTime();
            let timeFraction = (time - start) / duration;
			if (timeFraction > 1) timeFraction = 1;

            let progress = timing(timeFraction);

            draw(progress);

            if (stopCondition()) return;

            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            } else {
                return resolve();
            }
        });
    })
}

function weightColor(color1, color2, weight) {
    let w1 = weight;
    let w2 = 1 - weight;
    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

export function colorGradientRGB(colors) {
    return function(x) {
        if (x == 1) {
            return colors.last();
        }
        let parts = colors.length - 1;
        let partIndex = Math.floor(x * parts);
        let colorLeft = colors[partIndex];
        let colorRight = colors[partIndex + 1];
		let weight = x * parts - partIndex;
        return weightColor(colorRight, colorLeft, weight);
    }
}

export function stairs(x, n) {
    return Math.floor(x * n);
}
