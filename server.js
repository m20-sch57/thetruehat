#!/usr/bin/node

"use strict"

const PORT = 5000;

const express = require("express");
const app = express();
const server = new (require("http").Server)(app);
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

//----------------------------------------------------------
// Handy functions

function getPlayerList(room) {
    return room.users.map(el => {return {"username": el.username, "online": el.online};});
}

function findFirstPos(users, field, val) {
    for (let i = 0; i < users.length; ++i) {
        if (users[i][field] === val) {
            return i;
        }
    }
    return -1;
}

function getRoom(socket) {
    const sid = socket.id;
    const roomsList = Object.keys(socket.rooms);
    // Searching for the game room with the user
    for (let i = 0; i < roomsList.length; ++i) {
        if (roomsList[i] !== sid) {
            return roomsList[i]; // It's found and  returning
        }
    }
    return socket.id; // Nothing found. User's own room is returning
}

//----------------------------------------------------------
// HTTP functions

/**
 * Implementation of getFreeKey function
 * @see client_server_interaction.md
 */
app.get("/getFreeKey", function(req, res) {
    /*
    Temporary measures.
    TODO: qualitative key generator
     */
    res.json({"key": Math.floor(Math.random() * 899999999 + 100000000).toString()});
});

/**
 * Implementation of getRoomInfo function
 * @see client_server_interaction.md
 */
app.get("/:key/getRoomInfo", function(req, res) {
    const key = req.params.key; // The key of the room

    // Case of nonexistent room
    if (!(key in rooms)) {
        res.json({"status": "wait",
                  "playerList": []});
        return;
    }

    const room = rooms[key]; // The room
    switch (room.state) {
        case "wait":
            res.json({"status": "wait",
                      "playerList": getPlayerList(room)});
            break;

        case "play":
            res.json({"status": "play",
                      "playerList": getPlayerList(room),
                      "roomState": room.roomState});
            break;

        case "end":
            res.json({"status": "end"});
            console.log("WARN: getRoomInfo: You forgot to remove the room after the game ended!")
            break;

        default:
            console.log(room);
            break;
    }
});

//----------------------------------------------------------

/**
 * Dictionary of game rooms.
 * Its keys --- keys of rooms, its values --- rooms' infos.
 *
 * Room's info is an object that has fields:
 *     - state --- state of the room,
 *     - users --- list of users, each user has:
 *         - username --- no comments,
 *         - sids --- socket ids,
 *         - online --- whether the player is online,
 * if state === "play":
 *         - scoreExplained --- no comments,
 *         - scoreGuessed --- no comments,
 *     - substate --- substate of the room,
 *     - words --- list of words in hat,
 *     - wordState --- dictionsry of words, that aren't in hat, its keys --- words, each has:
 *         - status --- word status,
 *     - from --- username of speaker,
 *     - to --- username of listener.
 */
const rooms = {};

//----------------------------------------------------------
// Socket.IO functions

io.on("connection", function(socket) {

    /**
     * Implementation of cJoinRoom function
     * @see client_server_interaction.md
     */
    socket.on("cJoinRoom", function(ev) {
        // If user is not in his own room, it will be an error
        if (getRoom(socket) !== socket.id) {
            socket.emit("sFailure", {"request": "cJoinRoom", "msg": "You are in room now"});
            return;
        }
        // If key is "" or name is "", it will be an error
        if (ev.key === "") {
            socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Invalid key of room"});
            return;
        }
        if (ev.username === "") {
            socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Invalid username"});
            return;
        }

        const key = ev.key; // key of the room
        const name = ev.username; // name of the user

        // If username is used, it will be an error
        if (rooms[key] !== undefined && findFirstPos(rooms[key].users, "username", name) !== -1) {
            socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Username is already used"});
            return;
        }

        // Adding the user to the room
        socket.join(key, function(err) {
            // If any error happened
            if (err) {
                console.log(err);
                socket.emit("sFailure", {"request": "joinRoom", "msg": "Failed to join the room"});
                return;
            }
            // If user haven't joined the room
            if (getRoom(socket) !== key) {
                socket.emit("sFailure", {"request": "joinRoom", "msg": "Failed to join the room"});
                return;
            }

            // Logging the joining
            console.log("Player", name, "joined to", key);

            // If room isn't saved in main dictionary, let's save it and create info about it
            if (!(key in rooms)) {
                rooms[key] = {};
                rooms[key].state = "wait";
                rooms[key].users = [];
            }

            // If there is no other players in the room, the user will be the host of the room
            let hostChanged = false;
            if (findFirstPos(rooms[key].users, "online", true) === -1) {
                hostChanged = true;
            }
            // Adding the user to the room info
            rooms[key].users.push({"username": name, "sids": [socket.id], "online": true});

            /**
             * Implementation of sPlayerJoined signal
             * @see client_server_interaction.md
             */
            io.sockets.to(key).emit("sPlayerJoined", {"username": name, "playerList": getPlayerList(rooms[key])});

            /**
             * Implementation of sNewHost signal
             * @see client_server_interaction.md
             */
            if (hostChanged) {
                io.sockets.to(key).emit("sNewHost", {"username": name});
            }

            // TODO sYouJoined
        });
    });

    /**
     * Implementation of cLeaveRoom function
     * @see client_server_interaction.md
     */
    socket.on("cLeaveRoom", function() {
        const key = getRoom(socket); // Key of user's current room

        // If user is only in his own room
        if (key === socket.id) {
            socket.emit("sFailure", {"request": "cLeaveRoom", "msg": "you aren't in the room"});
            return;
        }

        // getting username
        const usernamePos = findFirstPos(room.users, "sids", [socket.id]);
        const username = room.users[usernamePos];

        // if username is ""
        if (username === "") {
            socket.emit("sFailure", {"request": "cLeaveRoom", "msg": "you aren't in the room"});
            return;
        }

        // Removing the user from the room
        socket.leave(key, function(err) {
            // If any error happened
            if (err) {
                socket.emit("sFailure", {"request": "cLeaveRoom", "msg": "failed to leave the room"});
                return;
            }

            // Logging the leaving
            console.log("Player", username, "left", key);

            /**
             * Implementation of sPlayerLeft signal
             * @see client_server_interaction.md
             */
            io.sockets.to(key).emit("sPlayerLeft", {"username": username, "playerList": getPlayerList(rooms[key])});
            socket.emit("sPlayerLeft", {"username": username, "playerList": getPlayerList(rooms[key])});

            // Removing the user from the room info
            rooms[key].users[usernamePos].online = false;
            rooms[key].users[usernamePos].sids = [];

            // If the user was the first player in the room, host will be changed
            if (usernamePos === 0 && findFirstPos(rooms[key].users, "online", true) !== -1) {
                io.sockets.to(key).emit("sNewHost", {"username": findFirstPos(rooms[key].users, "online", true)});
            }
        });
    });
});
