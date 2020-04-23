activePage = "mainPage"

function showPage(pageName) {
    document.querySelector('#'+activePage).style.display = "none";
    activePage = pageName;
    document.querySelector('#'+activePage).style.display = "";
}

function getKey() {
    fetch("/getFreeKey")
        .then(response => response.json())
        .then(result => document.querySelector("#createKey").innerHTML = result.key)
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
                    showUsers(result.playerList)
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
    navigator.clipboard.writeText(document.querySelector("#createKey").innerText);
}

window.onload = function() {
    getKey();
    socket = io.connect(`http://${document.domain}:5000`);
    document.querySelector("#joinGo").onclick = function() {
        enterRoom(socket, document.querySelector("#joinKey").value, document.querySelector("#joinName").value);
    }
    document.querySelector("#createGo").onclick = function() {
        enterRoom(socket, document.querySelector("#createKey").value, document.querySelector("#createName").value);
    }
}
