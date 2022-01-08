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

    parseTimestamp(dateStr) {
        let components = dateStr.split(" ");
        return new Date(`${components[0]}T${components[1]}${components[2]}`).getTime();
    }

    async getDelta() {
        let clientTimestampBefore = performance.now();
        let response = await fetch("getTime");
        let clientTimestampAfter = performance.now();
        let serverTimestamp = this.parseTimestamp(response.headers.get("X-Server-Timestamp"));
        this.delta = serverTimestamp - (clientTimestampAfter + clientTimestampBefore) / 2.0;
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
