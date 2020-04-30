Array.prototype.last = function() {
    return this[this.length - 1];
}

let pageLog = ["mainPage"];
let playersCounter = 0;
let myUsername;

function showPage(page) {
    document.getElementById(pageLog.last()).style.display = "none";
    document.getElementById(page).style.display = "";
    pageLog.push(page);
}

function goBack() {
    document.getElementById(pageLog.pop()).style.display = "none";
    if (pageLog.length === 1) pageLog = ["mainPage"];
    document.getElementById(pageLog.last()).style.display = "";
}

function leaveRoom(socket) {
    showPage("mainPage");
    pageLog = ["mainPage"];
    socket.emit("cLeaveRoom");
}

function setUsers(users) {
    document.getElementById("waitPage_users").innerHTML = "";
    playersCounter = 0;
    users.forEach(addUser);
}

function addUser(username) {
    console.log(playersCounter, username)
    document.getElementById("waitPage_users").appendChild(createUserHTML(username));
    playersCounter += 1;
    updatePlayersCnt();
    if (username === myUsername) {
        document.getElementById(`user_${username}`).classList.add("you")
    }
}

function removeUser(username) {
    playersCounter -= 1;
    updatePlayersCnt();
    const el = document.getElementById(`user_${username}`);
    el.parentNode.removeChild(el);
}

function createUserHTML(username) {
    let div = document.createElement("div");
    div.innerText = username;
    div.classList.add("user-item");
    div.setAttribute("id", `user_${username}`)
    return div
}

function updatePlayersCnt() {
    let wordPlayers;
    if (playersCounter % 100 in [11, 12, 13, 14]) {
        wordPlayers = "игроков";
    } else if (playersCounter % 10 === 1) {
        wordPlayers = "игрок";
    } else if (playersCounter % 10 in [2, 3, 4]) {
        wordPlayers = "игрока";
    } else {
        wordPlayers = "игроков";
    }
    document.getElementById("waitPage_playersCnt").innerText = `${playersCounter} ${wordPlayers}`;
}

function newHost(username) {
    if (username) {
        document.getElementById(`user_${username}`).classList.add("host");
    }
}

function getKey() {
    fetch("/getFreeKey")
        .then(response => response.json())
        .then(result => document.getElementById("createPage_key").innerText = result.key)
}

function copyKey() {
    navigator.clipboard.writeText(document.getElementById("createPage_key").innerText);
}

function copyLink() {
    navigator.clipboard.writeText(`http://${document.domain}:5000/#${
        document.getElementById("createPage_key").innerText}`)
}

function pasteKey() {
    navigator.clipboard.readText().then(clipText => {
        document.getElementById("joinPage_inputKey").value = clipText;
        location.hash = clipText;
    })
}


function enterRoom(socket, key, username) {
    document.getElementById("waitPage_title").innerText = key;
    fetch(`/getRoomInfo?key=${key}`)
        .then(response => {console.log(response);return response.json()})
        .then(result => {
            switch(result.state) {
                case "wait":
                    socket.emit("cJoinRoom", {"username": username, "key": key});
                    showPage("waitPage");
                    setUsers(result.playerList);
                    newHost(result.playerList[0]);
                    break; 
                case "play":
                    console.log("Oops. It's taken.")
                    break;
                case "end":
                    console.log("Results in MVP-next.")
                    // showPage("resultsPage")
                    break;
            }
        })
}

window.onload = function() {
    if (!(navigator.clipboard && navigator.clipboard.writeText)) {
        document.getElementById("createPage_copyKey").style.display = "none";
        document.getElementById("createPage_copyLink").style.display = "none";
    }
    if (!(navigator.clipboard && navigator.clipboard.readText && navigator.clipboard.writeText)) {
        document.getElementById("joinPage_pasteKey").style.display = "none";
    }

    if (location.hash !== "") {
        showPage('joinPage');
        document.getElementById("joinPage_inputKey").value = decodeURIComponent(location.hash.slice(1));
    } else {
        showPage('mainPage');
    }

    getKey();

    const socket = io.connect(`http://${document.domain}:5000`);
    socket.on("sPlayerJoined", function(data){
        addUser(data.username);
    })
    socket.on("sPlayerLeft", function(data){
        removeUser(data.username);
    })
    socket.on("sNewHost", function(data){
        newHost(data.username);
    })
    socket.on("sFailure", function(data){
        console.log(data.request, data.msg);
    })
    socket.on("sYouJoined", function(data){
        console.log(data);
    })

    document.getElementById("joinPage_go").onclick = function() {
        let key = document.getElementById("joinPage_inputKey").value;
        myUsername = document.getElementById("joinPage_inputName").value;
        enterRoom(socket, key, myUsername);
    }
    document.getElementById("createPage_go").onclick = function() {
        let key = document.getElementById("createPage_key").innerText;
        myUsername = document.getElementById("createPage_inputName").value;
        location.hash = key;
        enterRoom(socket, key, myUsername);
    }
    document.getElementById("joinPage_inputKey").onkeyup = () => {
        location.hash = '#' + document.getElementById("joinPage_inputKey").value.toUpperCase();
    }
    document.getElementById("mainPage_createRoom").onclick = () => showPage('createPage');
    document.getElementById("mainPage_joinRoom").onclick = () => showPage('joinPage');
    document.getElementById("mainPage_viewRules").onclick = () => showPage('rulesPage');
    document.getElementById("createPage_goBack").onclick = () => goBack();
    document.getElementById("createPage_viewRules").onclick = () => showPage('rulesPage');
    document.getElementById("createPage_copyKey").onclick = () => copyKey();
    document.getElementById("createPage_copyLink").onclick = () => copyLink();
    document.getElementById("joinPage_goBack").onclick = () => goBack();
    document.getElementById("joinPage_viewRules").onclick = () => showPage('rulesPage');
    document.getElementById("joinPage_pasteKey").onclick = () => pasteKey();
    document.getElementById("rulesPage_goBack").onclick = () => goBack();
    document.getElementById("waitPage_viewRules").onclick = () => showPage('rulesPage');
    document.getElementById("waitPage_goBack").onclick = () => leaveRoom(socket);
}
