#!/usr/bin/node

var PORT = 5000;

var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(PORT);
console.log("Listening on port " + PORT);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/getFreeKey", function(req, res) {
    res.json({"key": Math.floor(Math.random() * 899999999 + 100000000).toString()});
});

app.get("/:key/getRoomInfo", function(req, res) {
    var key = req.params.key;
    if (!(key in rooms)) {
        res.json({"status": "wait", "playerList": []});
        return;
    }
    var room = rooms[key];
    if (room.status == "wait") {
        var users = [];
        for (var i = 0; i < room.users.length; ++i) {
            users.push(players[room.users[i]]);
        }
        res.json({"status": "wait", "playerList": users});
    } else if (room.status == "play") {
        var users = [];
        for (var i = 0; i < room.users.length; ++i) {
            users.push(players[room.users[i]]);
        }
        res.json({"status": "play", "playerList": users, "roomState": room.roomState})
    } else if (room.status == "end") {
        res.json({"status": "end"});
    } else {
        console.log(room);
    }
});

//----------------------------------------------------------

function getRoom(socket) {
    var rooms = Object.keys(socket.rooms);
    return rooms[rooms.length - 1];
}

players = {};
rooms = {};

//----------------------------------------------------------

io.on("connection", function(socket) {
    socket.on("joinRoom", function(ev) {
        if (getRoom(socket) != socket.id) {
            socket.emit("failure", {"req": "joinRoom", "msg": "you are in the room"});
            return;
        }
        var key = ev.key;
        var name = ev.username;
        socket.join(key, function(err) {
            if (!err) {
                if (getRoom(socket) != key) {
                    socket.emit("failure", {"req": "joinRoom", "msg": "failed to join the room"});
                    return;
                }
                console.log("Player", name, "joined to", key);
                io.sockets.to(key).emit("playerJoined", {"username": name});
                players[socket.id] = name;
                if (!(key in rooms)) {
                    rooms[key] = {};
                    rooms[key].users = new Array();
                    rooms[key].status = "wait";
                    // may be something else
                }
                if (rooms[key].users.length == 0) {
                    io.sockets.to(key).emit("newHost", {"username": name});
                }
                rooms[key].users.push(socket.id);
            } else {
                socket.emit("failure", {"req": "joinRoom", "msg": "failed to join the room"});
            }
        });
    });
    socket.on("leaveRoom", function() {
        key = getRoom(socket);
        if (key == socket.id) {
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
                if (pos == 0 && rooms[key].users.length > 0) {
                    io.sockets.to(key).emit("newHost", {"username": players[rooms[key].users[0]]});
                }
            } else {
                socket.emit("failure", {"req": "leaveRoom", "msg": "failed to leave the room"});
            }
        });
    });
});
