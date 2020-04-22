#!/usr/bin/node

const PORT = 5000;

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

server.listen(PORT);
console.log("Listening on port " + PORT);

// Serving static css and js files
app.use(express.static("css"));
app.use(express.static("js"));

// Serving page of the game by default address
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

// Realisation of getFreeKey request (see in client_server_interaction.md)
app.get("/getFreeKey", function(req, res) {
    res.json({"key": Math.floor(Math.random() * 899999999 + 100000000).toString()});
});

// Realisation of getRoomInfo request (see in client_server_interaction.md)
app.get("/:key/getRoomInfo", function(req, res) {
    const key = req.params.key; // The key of the room

    // Case of nonexistent room
    if (!(key in rooms)) {
        res.json({"status": "wait", "playerList": []});
        return;
    }

    const room = rooms[key]; // The room
    const users = []; // Users of the room

    switch (room.status) {
        case "wait":
            room.users.forEach(id => users.push(players[id]))
            res.json({"status": "wait",
                      "playerList": users});
            break;

        case "play":
            room.users.forEach(id => users.push(players[id]))
            res.json({"status": "play",
                      "playerList": users,
                      "roomState": room.roomState})
            break;

        case "end":
            res.json({"status": "end"});
            break;

        default:
            console.log(room);
            break;
    }

});

//----------------------------------------------------------

function getRoom(socket) {
    const rooms = Object.keys(socket.rooms);
    for (let i = 0; i < rooms.length; ++i) {
        if (rooms[i] !== socket.id) {
            return rooms[i];
        }
    }
    return socket.id;
}

players = {};
rooms = {};

//----------------------------------------------------------

io.on("connection", function(socket) {

    // Realisation of joinRoom request (see in client_server_interaction.md)
    socket.on("joinRoom", function(ev) {
        if (getRoom(socket) !== socket.id) {
            socket.emit("failure", {"req": "joinRoom", "msg": "you are in the room"});
            return;
        }
        if (ev.key === "") {
            socket.emit("failure", {"req": "joinRoom", "msg": "invalid key"});
            return;
        }
        var key = ev.key;
        var name = ev.username;
        socket.join(key, function(err) {
            if (!err) {
                if (getRoom(socket) !== key) {
                    socket.emit("failure", {"req": "joinRoom", "msg": "failed to join the room"});
                    return;
                }
                console.log("Player", name, "joined to", key);
                io.sockets.to(key).emit("playerJoined", {"username": name});
                players[socket.id] = name;
                if (!(key in rooms)) {
                    rooms[key] = {};
                    rooms[key].users = [];
                    rooms[key].status = "wait";
                    // may be something else
                }
                if (rooms[key].users.length === 0) {
                    io.sockets.to(key).emit("newHost", {"username": name});
                }
                rooms[key].users.push(socket.id);
            } else {
                console.log(err);
                socket.emit("failure", {"req": "joinRoom", "msg": "failed to join the room"});
            }
        });
    });

    // Realisation of leaveRoom request (see in client_server_interaction.md)
    socket.on("leaveRoom", function() {
        key = getRoom(socket);
        if (key === socket.id) {
            socket.emit("failure", {"req": "leaveRoom", "msg": "you aren't in the room"});
            return;
        }
        socket.leave(key, function(err) {
            if (!err) {
                console.log("Player", players[socket.id], "left", key);
                io.sockets.to(key).emit("playerLeft", {"username": players[socket.id]});
                socket.emit("playerLeft", {"username": players[socket.id]});
                delete players[socket.id];
                var pos = rooms[key].users.indexOf(socket.id);
                rooms[key].users.splice(pos, 1);
                if (pos === 0 && rooms[key].users.length > 0) {
                    io.sockets.to(key).emit("newHost", {"username": players[rooms[key].users[0]]});
                }
            } else {
                socket.emit("failure", {"req": "leaveRoom", "msg": "failed to leave the room"});
            }
        });
    });

});
