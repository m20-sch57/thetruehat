class TimeSync {
    constructor() {
        this.delta = 0;
        this.debug = false;
    }

    getTime() {
        return performance.now() + this.delta;
    }

    log(...msg) {
        console.log("%c[Time Sync]", "color: green", ...msg);
    }

    async getDelta() {
        let response = await fetch("getTime", {"headers": {"X-Client-Timestamp": performance.now()}});
        let now = performance.now();
        this.delta = response.headers.get("X-Server-Timestamp") / 1.0 + (now - response.headers.get("X-Client-Timestamp")) / 2 - now;
    }

    async maintainDelta(syncInterval) {
        setTimeout(() => this.maintainDelta(syncInterval), syncInterval);
        await this.getDelta();
        if (this.debug) {
            this.log("New time delta:", this.delta);
            this.log("Diff with local time:", this.getTime() - (new Date()).getTime());
        }
    }
}

export const timeSync = new TimeSync();
