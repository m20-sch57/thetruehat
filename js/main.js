var name="abc";
var key="bhfvhbjfvbhjd";
function playerJoinedCallback(name) {
    document.querySelector("#log").innerHTML += name + " joined.</br>";
}

function playerLeftCallback(name) {
    document.querySelector("#log").innerHTML += name + " left.</br>";
}

function failureCallback(req, msg) {
    console.log("Failed to do " + req + ", occurred error: " + msg);
}

function newHostCallback(newHostName) {
    document.querySelector("#log").innerHTML += "New host " + newHostName + ".<br>";
}

window.onload = function() {
    // sockets

    socket = io.connect("http://localhost:5000");
    socket.on("playerJoined", function(ev) {
        playerJoinedCallback(ev.username);
    });
    socket.on("playerLeft", function(ev) {
        playerLeftCallback(ev.username);
    });
    socket.on("failure", function(ev) {
        failureCallback(ev.req, ev.msg);
    });
    socket.on("newHost", function(ev) {
        newHostCallback(ev.username);
    });

    // end of sockets
    
    document.querySelector("#setKey").onclick = function() {
        key = document.querySelector("#key").value;
        document.querySelector("#setKey").disabled = true;
        document.querySelector("#key").disabled = true;
    };

    document.querySelector("#setName").onclick = function() {
        name = document.querySelector("#name").value;
        document.querySelector("#setName").disabled = true;
        document.querySelector("#name").disabled = true;
        socket.emit("joinRoom", {"username": name, "key": key});
    };

    document.querySelector("#leave").onclick = function() {
        if (!document.querySelector("#name").disabled) {
            return;
        }
        document.querySelector("#leave").disabled = true;
        socket.emit("leaveRoom");
    };
};
