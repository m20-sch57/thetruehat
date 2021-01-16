import { timeSync } from "src/tools";

export function animate({startTime, timing, draw, duration, stopCondition}) {
    // Partially taken from https://learn.javascript.ru
    timing = timing || (time => time);
    stopCondition = stopCondition || (() => (false));
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
    });
}
