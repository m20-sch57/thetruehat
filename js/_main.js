Array.prototype.last = function() {
    console.assert(this.length >= 1, 
        "Try to get last element of empty array");
    return this[this.length - 1];
}

function el(id) {
    return document.getElementById(id);
}

function readLocationHash() {
    if (location.hash == "") {return ""};
    return decodeURIComponent(location.hash.slice(1));
}

class App {
    constructor() {
        this.socket = io.connect(`http://${document.domain}:5000`);

        this.pageLog = [];
        this.myUsername = "";
        this.myRoomKey = readLocationHash();

        if (!(navigator.clipboard && navigator.clipboard.writeText)) {
            el("createPage_copyKey").style.display = "none";
            el("createPage_copyLink").style.display = "none";
        }
        if (!(navigator.clipboard && navigator.clipboard.readText)) {
            el("joinPage_pasteKey").style.display = "none";
        }

        this.setEventListenersForPC();

        if (this.myRoomKey != "") {
            this.showPage("joinPage");
        } else {
            this.showPage("mainPage");
        }
    }

    setEventListenersForPC() {
        el("mainPage_createRoom").onclick = () => this.showPage('createPage');
        el("mainPage_joinRoom").onclick = () => this.showPage('joinPage');
        el("mainPage_viewRules").onclick = () => this.showPage('rulesPage');
        el("createPage_goBack").onclick = () => this.goBack();
        el("createPage_viewRules").onclick = () => this.showPage('rulesPage');
        // el("createPage_copyKey").onclick = () => this.copyKey();
        // el("createPage_copyLink").onclick = () => this.copyLink();
        el("joinPage_goBack").onclick = () => this.goBack();
        el("joinPage_viewRules").onclick = () => this.showPage('rulesPage');
        // el("joinPage_pasteKey").onclick = () => this.pasteKey();
        el("rulesPage_goBack").onclick = () => this.goBack();
        el("waitPage_viewRules").onclick = () => this.showPage('rulesPage');
        // el("waitPage_goBack").onclick = () => this.leaveRoom();
    }

    set myRoomKey(value) {
        this._myRoomKey = value;
        location.hash = value;
        el("joinPage_inputKey").value = this.myRoomKey;
        el("waitPage_title").value = this.myRoomKey;
    }

    get myRoomKey() {
        return this._myRoomKey;
    }

    showPage(page) {
        if (this.pageLog.length >= 1) {
            el(this.pageLog.last()).style.display = "none";
        }
        el(page).style.display = "";
        this.pageLog.push(page);
    }

    goBack() {
        el(this.pageLog.pop()).style.display = "none";
        if (this.pageLog.length == 0) this.pageLog = ["mainPage"];
        el(this.pageLog.last()).style.display = "";
    }

    goBackFromRoom() {
        this.socket.emit("leaveRoom");
        this.goBack();
    }
}

window.onload = function() {
    let app = new App();
}