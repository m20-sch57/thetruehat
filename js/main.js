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
    if (pageLog.length == 1) pageLog = ["mainPage"];
    document.getElementById(pageLog.last()).style.display = "";
}

function addUsers(users) {
    users.forEach(addUser);
}

function addUser(username) {
    document.getElementById("waitPage_users").appendChild(createUserHTML(username));
    playersCounter += 1;
    updatePlayersCnt();
    if (username == myUsername) {
        document.getElementById(`user_${username}`).classList.add("you")
    }
}

function createUserHTML(username) {
    let div = document.createElement("div");
    div.innerHTML = username;
    div.classList.add("user-item");
    div.setAttribute("id", `user_${username}`)
    return div
}

function updatePlayersCnt() {
    console.log(playersCounter) 
    if ([11, 12, 13, 14].indexOf(playersCounter % 100) != -1) {
        wordPlayers = "игроков";
    } else if (playersCounter % 10 == 1) {
        wordPlayers = "игрок";
    } else if ([2, 3, 4].indexOf(playersCounter % 10) != -1) {
        wordPlayers = "игрока";
    } else {
        wordPlayers = "игроков";
    }
    document.getElementById("waitPage_playersCnt").innerText = `${playersCounter} ${wordPlayers}`;
}

function getKey() {
    fetch("/getFreeKey")
        .then(response => response.json())
        .then(result => document.getElementById("createPage_key").innerHTML = result.key)
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
    fetch(`/${key}/getRoomInfo`)
        .then(response => {console.log(response);return response.json()})
        .then(result => {
            switch(result.status) {
                case "wait":
                    socket.emit("joinRoom", {"username": username, "key": key});
                    showPage("waitPage");
                    addUsers(result.playerList)
                    break; 
                case "play":
                    console.log("Ouups. It's taken.")
                    break;
                case "end":
                    console.log("Results in MVP-next.")
                    // showPage("resultsPage")
                    break;
            }
        })
}

function leaveRoom() {
    socket.emit("leaveRoom");
}

window.onload = function() {
    if (location.hash != "") {
        showPage('joinPage');
        document.getElementById("joinPage_inputKey").value = decodeURIComponent(location.hash.slice(1));
    } else {
        showPage('mainPage');
    }

    getKey();

    socket = io.connect(`http://${document.domain}:5000`);
    socket.on("playerJoined", function(data){
        addUser(data.username);
    })
    socket.on("playerLeft", function(data){
        // removeUser(data.username);
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

}
