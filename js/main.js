Array.prototype.last = function() {
    return this[this.length - 1];
}

pageLog = ["mainPage"]

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
}

function createUserHTML(username) {
    let div = document.createElement("div");
    div.innerHTML = username;
    return div
}

function getKey() {
    fetch("/getFreeKey")
        .then(response => response.json())
        .then(result => document.getElementById("createPage_key").innerHTML = result.key)
}

function copyKey() {
    navigator.clipboard.writeText(document.getElementById("createPage_key").innerText);
}

function pasteKey() {
    console.log("kek")
    navigator.clipboard.readText().then(
        clipText => document.getElementById("joinPage_inputKey").value = clipText)
}


function enterRoom(socket, key, username) {
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
    getKey();

    socket = io.connect(`http://${document.domain}:5000`);
    socket.on("playerJoined", function(data){
        addUser(data.username);
    })
    socket.on("playerLeft", function(data){
        // removeUser(data.username);
    })

    document.getElementById("joinPage_go").onclick = function() {
        key = document.getElementById("joinPage_inputKey").value;
        username = document.getElementById("joinPage_inputName").value;
        enterRoom(socket, key, username);
    }
    document.getElementById("createPage_go").onclick = function() {
        key = document.getElementById("createPage_key").innerText;
        username = document.getElementById("createPage_inputName").value;
        enterRoom(socket, key, username);
    }
    document.getElementById("mainPage_createRoom").onclick = () => showPage('createPage');
    document.getElementById("mainPage_joinRoom").onclick = () => showPage('joinPage');
    document.getElementById("mainPage_viewRules").onclick = () => showPage('rulesPage');
    document.getElementById("createPage_goBack").onclick = () => goBack();
    document.getElementById("createPage_viewRules").onclick = () => showPage('rulesPage');
    document.getElementById("createPage_copyKey").onclick = () => copyKey();
    document.getElementById("joinPage_goBack").onclick = () => goBack();
    document.getElementById("joinPage_viewRules").onclick = () => showPage('rulesPage');
    document.getElementById("joinPage_pasteKey").onclick = () => pasteKey();
    document.getElementById("rulesPage_goBack").onclick = () => goBack();
    document.getElementById("waitPage_viewRules").onclick = () => showPage('rulesPage');
}
