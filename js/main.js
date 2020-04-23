activePage = "mainPage"

function showPage(pageName) {
    document.querySelector('#'+activePage).style.display = "none";
    activePage = pageName;
    document.querySelector('#'+activePage).style.display = "";
}

function addUsers(users) {
    users.forEach(addUser);
}

function addUser(username) {
    console.log('add user', username)
    document.querySelector("#waitPage_users").appendChild(createUserHTML(username));
}

function createUserHTML(username) {
    let div = document.createElement("div");
    div.innerHTML = username;
    return div
}

function getKey() {
    fetch("/getFreeKey")
        .then(response => response.json())
        .then(result => document.querySelector("#createPage_key").innerHTML = result.key)
}

function enterRoom(socket, key, username) {
    fetch(`/${key}/getRoomInfo`)
        .then(response => {console.log(response);return response.json()})
        .then(result => {
            console.log(result)
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

function copyKey() {
    navigator.clipboard.writeText(document.querySelector("#createPage_key").innerText);
}

window.onload = function() {
    getKey();
    socket = io.connect(`http://${document.domain}:5000`);
    document.querySelector("#joinPage_go").onclick = function() {
        enterRoom(socket, document.querySelector("#joinPage_inputKey").value, document.querySelector("#joinPage_name").value);
    }
    document.querySelector("#createPage_go").onclick = function() {
        console.log(document.querySelector("#createKey").innerText);
        enterRoom(socket, document.querySelector("#createPage_key").innerText, document.querySelector("#createPage_name").value);
    }
}
