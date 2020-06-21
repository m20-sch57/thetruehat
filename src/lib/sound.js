import { el, timeSync } from "__/lib"

class Sound {
    constructor () {
        this.currentSound = false;
    }

    killSound() {
        if (this.currentSound) {
            this.currentSound.pause();
            this.currentSound = false;
        }
    }

    playSound(sound, startTime, stopCondition) {
        startTime = startTime || timeSync.getTime();
		stopCondition = stopCondition || (() => false);
        let shift = el(sound).getAttribute("shift");
        if (shift) startTime += +shift;
        if (timeSync.getTime() < startTime) {
            setTimeout(() => {
                if (stopCondition()) return;
                this.killSound();
				this.currentSound = el(sound);
				console.log("play1")
                this.currentSound.play();
            }, startTime - timeSync.getTime());
        } else if (timeSync.getTime() - startTime <
                el(sound).duration * 1000){
            this.killSound();
            this.currentSound = el(sound);
            this.currentSound.currentTime = (timeSync.getTime() - startTime) /
                1000;
			this.currentSound.play();
			console.log("play2");
        }
    }
}

export const sound = new Sound()
