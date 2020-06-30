import { el, timeSync } from "__/lib"

class Sound {
    constructor () {
        this.currentSound = false;
        this.isMuted = false;
        this.volume = 1;
        console.log(localStorage)
        if (localStorage.volume && localStorage.volume == "off") {
            this.toggleMute();
        }
    }

    killSound() {
        if (this.currentSound) {
            this.currentSound.pause();
            this.currentSound = false;
        }
    }

    updateVolume() {
        if (this.currentSound) {
            if (this.isMuted) {
                this.currentSound.volume = 0;
            } else {
                this.currentSound.volume = this.volume;
            }
        }
    }

    setVolume(volume) {
        this.volume = volume;
        this.updateVolume();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.volume = this.isMuted ? "off" : "on";
        this.updateVolume();
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
                this.updateVolume();
                this.currentSound.play();
            }, startTime - timeSync.getTime());
        } else if (timeSync.getTime() - startTime <
                el(sound).duration * 1000){
            this.killSound();
            this.currentSound = el(sound);
            this.updateVolume();
            this.currentSound.currentTime = (timeSync.getTime() - startTime) /
                1000;
            this.currentSound.play();
        }
    }
}

export const sound = new Sound()
