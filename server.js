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
                      "playerList": Object.keys(room.users).map(function(username, ) {
                          return {"username": username, "online": room.users[username].online}
                      })});
            break;

        case "play":
            res.json({"status": "play",
                      "playerList": room.players.map(id => players[id]),
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
 *     - users --- dictionary of users, its keys --- usernames, each user has:
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
     * Implementation of joinRoom function
     * @see client_server_interaction.md
     */
    socket.on("joinRoom", function(ev) {
        // If user is not in his own room, it will be an error
        if (getRoom(socket) !== socket.id) {
            socket.emit("failure", {"req": "joinRoom", "msg": "You are in room now"});
            return;
        }
        // If key is "", it will be an error
        if (ev.key === "") {
            socket.emit("failure", {"req": "joinRoom", "msg": "Invalid key of room"});
            return;
        }

        const key = ev.key; // key of the room
        const name = ev.username; // name of the user
        // Adding the user to the room
        socket.join(key, function(err) {
            // If any error happened
            if (err) {
                console.log(err);
                socket.emit("failure", {"req": "joinRoom", "msg": "Failed to join the room"});
                return;
            }
            // If user haven't joined the room
            if (getRoom(socket) !== key) {
                socket.emit("failure", {"req": "joinRoom", "msg": "Failed to join the room"});
                return;
            }

            // Logging the joining
            console.log("Player", name, "joined to", key);

            /**
             * Implementation of playerJoined signal
             * @see client_server_interaction.md
             */
            io.sockets.to(key).emit("playerJoined", {"username": name});

            // Adding the user to players
            players[socket.id] = name;
            // If room isn't saved in main dictionary, let's save it and create info about it
            if (!(key in rooms)) {
                rooms[key] = {};
                rooms[key].players = [];
                rooms[key].status = "wait";
                // may be something else
            }
            // If there is no other players in the room, the user will be the host of the room
            if (rooms[key].players.length === 0) {
                io.sockets.to(key).emit("newHost", {"username": name});
            }
            // Adding the user to the room info
            rooms[key].players.push(socket.id);
        });
    });

    /**
     * Implementation of leaveRoom function
     * @see client_server_interaction.md
     */
    socket.on("leaveRoom", function() {
        const key = getRoom(socket); // Key of user's current room

        // If user is in his own room
        if (key === socket.id) {
            socket.emit("failure", {"req": "leaveRoom", "msg": "you aren't in the room"});
            return;
        }

        // Removing the user from the room
        socket.leave(key, function(err) {
            // If any error happened
            if (err) {
                socket.emit("failure", {"req": "leaveRoom", "msg": "failed to leave the room"});
                return
            }

            // Logging the leaving
            console.log("Player", players[socket.id], "left", key);

            /**
             * Implementation of playerLeft signal
             * @see client_server_interaction.md
             */
            io.sockets.to(key).emit("playerLeft", {"username": players[socket.id]});
            socket.emit("playerLeft", {"username": players[socket.id]});

            // Removing the user from the players
            delete players[socket.id];

            // Removing the user from the room info
            const pos = rooms[key].players.indexOf(socket.id);
            rooms[key].players.splice(pos, 1);

            // If the user was the first player in the room, host will be changed
            if (pos === 0 && rooms[key].players.length > 0) {
                io.sockets.to(key).emit("newHost", {"username": players[rooms[key].players[0]]});
            }

            // If the room is empty, it will be deleted
            if (rooms[key].players.length === 0) {
                delete rooms[key]
            }
        });
    });

});
