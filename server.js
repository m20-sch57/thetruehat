#!/usr/bin/node

"use strict"

const PORT = 5000;
const WORD_NUMBER = 40;

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

/**
 * Return playerList structure,
 * @see API.md
 *
 * @param room room object
 * @return list of players
 */
function getPlayerList(room) {
    return room.users.map(el => {return {"username": el.username, "online": el.online};});
}

/**
 * Finds first position in users array where element has attribute with given value
 *
 * @param users users array
 * @param field attribute
 * @param val value
 * @return position if exists else -1
 */
function findFirstPos(users, field, val) {
    for (let i = 0; i < users.length; ++i) {
        if (users[i][field] === val) {
            return i;
        }
    }
    return -1;
}

/**
 * Finds first position in users array where given socket id is in list of socket ids
 *
 * @param users users array
 * @param sid socket id
 * @return position if exists else -1
 */
function findFirstSidPos(users, sid) {
    for (let i = 0; i < users.length; ++i) {
        if (users[i]["sids"][0] === sid) {
            return i;
        }
    }
    return -1;
}

/**
 * Return current player's room.
 *
 * @param socket The socket of the player
 * @return id of current player's room: his own socket room or game room with him
 */
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

/**
 * Generate word list by key
 *
 * @param key key of the room
 * @return list of words
 */
function generateWords(key) {
    /*
    Temporary measures.
    TODO: proper word generation
    */
    let words = [];
    for (let i = 0; i < WORD_NUMBER; ++i) {
        words.push(i);
    }
    return words;
}

/**
 * get next pair of players
 * @param numberOfPlayers number of players
 * @param lastSpeaker index of previous speaker
 * @param lastListener index of precious listener
 * @return object with fields: from and to --- indices of speaker and listener
 */
function getNextPair(numberOfPlayers, lastSpeaker, lastListener) {
    let speaker = (lastSpeaker + 1) % numberOfPlayers;
    let listener = (lastListener + 1) % numberOfPlayers;
    if (speaker === 0) {
        listener = (listener + 1) % numberOfPlayers;
        if (listener === speaker) {
            listener++;
        }
    }
    return {"from": speaker, "listener": listener};
}

//----------------------------------------------------------
// HTTP functions

/**
 * Implementation of getFreeKey function
 * @see API.md
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
 * @see API.md
 */
app.get("/getRoomInfo", function(req, res) {
    const key = req.query.key; // The key of the room

    if (key === "") {
        res.json({"success": false});
        return;
    }

    // Case of nonexistent room
    if (!(key in rooms)) {
        res.json({"success": true,
                  "state": "wait",
                  "playerList": [],
                  "host": ""});
        return;
    }

    const room = rooms[key]; // The room
    switch (room.state) {
        case "wait":
        case "play":
            res.json({"success": true,
                      "state": "wait",
                      "playerList": getPlayerList(room),
                      "host": room.users[findFirstPos(room.users, "online", true)]});
            break;

        case "end":
            // TODO Implement
            res.json({"success": true, "state": "end"});
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
 *         - scoreExplained --- no comments,
 *         - scoreGuessed --- no comments,
 * if state === "play":
 *     - substate --- substate of the room,
 *     - freshWords --- list of words in hat,
 *     - usedWords --- dictionary of words, that aren't in hat, its keys --- words, each has:
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
     * @see API.md
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

        const key = ev.key.toLowerCase(); // key of the room
        const name = ev.username; // name of the user

        // if room and usrs exist, we should check the user
        if (rooms[key] !== undefined) {
            const pos = findFirstPos(rooms[key].users, "username", name);

            // If username is used, it will be an error
            if (pos !== -1 && rooms[key].users[pos].sids.length !== 0) {
                socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Username is already used"});
                return;
            }

            // If game has started, only logging in can be perfomed
            if (rooms[key].state === "play" && pos === -1) {
                socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Game have started, only logging in can be perfomed"});
                return;
            }
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

            // Adding the user to the room info
            const pos = findFirstPos(rooms[key].users, "username", name);
            if (pos === -1) {
                // creating new one
                rooms[key].users.push({"username": name, "sids": [socket.id], "online": true, "scoreExplained": 0, "scoreGuessed": 0});
            } else {
                // logging in user
                rooms[key].users[pos].sids = [socket.id];
                rooms[key].users[pos].online = true;
            }

            // If this user is the first online user, the user will be the host of the room
            let hostChanged = false;
            if (findFirstPos(rooms[key].users, "online", true) === findFirstPos(rooms[key].users, "username", name)) {
                hostChanged = true;
            }

            /**
             * Implementation of sPlayerJoined signal
             * @see API.md
             */
            socket.broadcast.to(key).emit("sPlayerJoined", {"username": name, "playerList": getPlayerList(rooms[key])});

            /**
             * Implementation of sYouJoined signal
             * @see API.md
             */
            let joinObj = {"key": key, "playerList": getPlayerList(rooms[key]), "host": rooms[key].users[findFirstPos(rooms[key].users, "online", true)]};
            switch (rooms[key].state) {
                case "wait":
                    break;
                case "play":
                    switch (rooms[key].substate) {
                        case "wait":
                            break;
                        default:
                            console.log(rooms[key]);
                            break;
                    }
                    break;
                default:
                    console.log(rooms[key]);
                    break;
            }
            socket.emit("sYouJoined", joinObj);

            /**
             * Implementation of sNewHost signal
             * @see API.md
             */
            if (hostChanged) {
                io.sockets.to(key).emit("sNewHost", {"username": name});
            }
        });
    });

    /**
     * Implementation of cLeaveRoom function
     * @see API.md
     */
    socket.on("cLeaveRoom", function() {
        const key = getRoom(socket); // Key of user's current room

        // If user is only in his own room
        if (key === socket.id) {
            socket.emit("sFailure", {"request": "cLeaveRoom", "msg": "you aren't in the room"});
            return;
        }

        // getting username
        const usernamePos = findFirstSidPos(rooms[key].users, socket.id);
        const username = rooms[key].users[usernamePos].username;

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

            // Saving the position of the current host
            const pos = findFirstPos(rooms[key].users, "online", true)

            // Removing the user from the room info
            rooms[key].users[usernamePos].online = false;
            rooms[key].users[usernamePos].sids = [];

            // If the user was the first player in the room, host will be changed
            if (findFirstPos(rooms[key].users, "online", true) !== -1 && pos === usernamePos) {
                io.sockets.to(key).emit("sNewHost", {"username": rooms[key].users[findFirstPos(rooms[key].users, "online", true)].username});
            }

            /**
             * Implementation of sPlayerLeft signal
             * @see API.md
             */
            // Sending new state of the room.
            io.sockets.to(key).emit("sPlayerLeft", {"username": username, "playerList": getPlayerList(rooms[key])});
        });
    });

    /**
     * Implementation of cStartGame function
     * @see API.md
     */
    socket.on("cStartGame", function() {
        // acquiring the key
        const key = getRoom(socket);

        // checking whether siganl owner is host
        const hostPos = findFirstPos(rooms[key].users, "online", true);
        if (hostPos === -1) {
            // very strange case, probably something went wrong, let's log it!
            console.log("cStartGame: Everyone is offline");
            socket.emit("sFailure", {"request": "cStartGame", "mgs": "Everyone is offline"});
            return;
        }
        if (rooms[key].users[hostPos].sids[0] !== socket.id) {
            socket.emit("sFailure", {"request": "cStartGame", "msg": "Only host can start the game"});
            return;
        }
        
        // if state isn't 'wait', something went wrong
        if (rooms[key].state !== "wait") {
            socket.emit("sFailure", {"request": "cStartGame", "msg": "Game have already started"});
            return;
        }

        /**
         * kicking off offline users
         */
        // preparing containers
        let onlineUsers = [];

        // copying each user in proper container
        for (let i = 0; i < rooms[key].users.length; ++i) {
            if (rooms[key].users[i].online) {
                onlineUsers.push(rooms[key].users[i]);
            }
        }

        // removing offline users
        rooms[key].users = onlineUsers;

        /**
         * preparing room object for the game
         */
        // changing state to 'play'
        rooms[key].state = "play";

        // setting substate to 'wait'
        rooms[key].substate = "wait";

        // generating word list (later key can affect word list)
        rooms[key].freshWords = generateWords(key);

        // preparing storage for explained words
        rooms[key].usedWords = {};

        // preparing 'from' and 'to'
        const numberOfPlayers = rooms[key].users.length;
        const nextPair = getNextPair(numberOfPlayers, numberOfPlayers - 1, numberOfPlayers - 2);
        rooms[key].from = nextPair.from;
        rooms[key].to = nextPair.to;

        /**
         * Implementation of sGameStarted signal
         * @see API.md
         */
        io.sockets.to(key).emit("sGameStarted", {"from": rooms[key].users[rooms[key].from], "to": rooms[key].users[rooms[key].to]});
    });
});
