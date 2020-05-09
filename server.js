#!/home/adanni/bin/node

"use strict"

const process = require("process");
const fs = require("fs");
fs.writeFile("server.pid", process.pid.toString(), function(err, data) {
    if (err) {
        console.log(err);
    }
});

const config = require("./config.json");

const PORT = config.port;
const WORD_NUMBER = config.wordNumber;
const DELAY = config.transferTime; // given delay for client reaction
const EXPLANATION_LENGTH = config.explanationTime; // length of explanation
const PRE = config.delayTime; // delay for transfer
const POST = config.aftermathTime; // time for guess

const allWords = require(config.wordsPath).words;

const express = require("express");
const app = express();
const server = new (require("http").Server)(app);
const io = require("socket.io")(server);

server.listen(PORT);
console.log("Listening on port " + PORT);

//----------------------------------------------------------
// Handy functions

/**
 * Checks object with pattern
 *
 * @param object --- object
 * @param pattern --- pattern
 * @return if objects corresponds to the pattern
 */
function checkObject(object, pattern) {
    // checking object for undefined or null
    if (object === undefined) {
        return false;
    }
    if (object === null) {
        return false;
    }

    // comparing length
    const objKeys = Object.keys(object);
    if (objKeys.length !== Object.keys(pattern).length) {
        return false;
    }

    for (let i = 0; i < objKeys.length; ++i) {
        if (!(objKeys[i] in pattern)) {
            return false;
        }
        const typeStr = pattern[objKeys[i]];
        if (typeof(object[objKeys[i]]) !== typeStr) {
            return false;
        }
    }
    return true;
}

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
    let words = [];
    let used = {};
    const numberOfAllWords = allWords.length;
    while (words.length < WORD_NUMBER) {
        const pos = Math.floor(Math.random() * (numberOfAllWords - 1));
        if (!(pos in used)) {
            used[pos] = true;
            words.push(allWords[pos]);
        }
    }
    return words;
}

/**
 * get next pair of players
 * @param numberOfPlayers number of players
 * @param lastSpeaker index of previous speaker
 * @param lastListener index of precious listener
 * @return object with fields: speaker and listener --- indices of speaker and listener
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
    return {"speaker": speaker, "listener": listener};
}

/**
 * start an explanation
 *
 * @param key --- key of the room
 * @return null
 */
function startExplanation(key) {
    rooms[key].substate = "explanation";
    const date = new Date();
    const currentTime = date.getTime();
    rooms[key].startTime = currentTime + (PRE + DELAY) * 1000;
    rooms[key].word = rooms[key].freshWords.pop();
    const numberOfTurn = rooms[key].numberOfTurn;
    /*
    setTimeout(function() {
        // if explanation hasn't finished yet
        if (!( key in rooms)) {
            return;
        }
        if (rooms[key].numberOfTurn === numberOfTurn) {
            finishExplanation(key);
        }
    }, (PRE + EXPLANATION_LENGTH + POST + DELAY) * 1000);
    */
    setTimeout(function() {
        console.log(rooms[key].users[rooms[key].speaker].sids[0],
            "sNewWord", {"word": rooms[key].word});
        io.sockets.to(rooms[key].users[rooms[key].speaker].sids[0]).emit(
            "sNewWord", {"word": rooms[key].word});
    }, (PRE + DELAY) * 1000);
    console.log(key, "sExplanationStarted", {"startTime": rooms[key].startTime});
    io.sockets.to(key).emit("sExplanationStarted", {"startTime": rooms[key].startTime});
}

/**
 * finish an explanation
 *
 * @param key --- key of the room
 * @return null
 */
function finishExplanation(key) {
    // if game has ended
    if (!(key in rooms)) {
        return;
    }

    // if signal has been sent
    if (rooms[key].substate !== "explanation") {
        return;
    }
    rooms[key].substate = "edit";

    // returning word to the hat
    // no, see cWordsEdited
    /*
    if (rooms[key].word !== "") {
        rooms[key].freshWords.splice(
            Math.floor(Math.random() * Math.max(rooms[key].freshWords.length - 1, 0)),
            0, rooms[key].word);
    }
    */

    let flag = 0;
    if (rooms[key].word !== "") {
        flag = 1;
    }

    rooms[key].startTime = 0;
    rooms[key].word = "";

    /**
     * Implementation of sExplanationEnded signal
     * @see API.md
     */
    console.log(key, "sExplanationEnded", {
        "wordsCount": rooms[key].freshWords.length + flag});
    io.sockets.to(key).emit("sExplanationEnded", {
        "wordsCount": rooms[key].freshWords.length + flag});

    // generating editWords for client (without 'transport' flag)
    let editWords = [];
    for (let i = 0; i < rooms[key].editWords.length; ++i) {
        editWords.push({
            "word": rooms[key].editWords[i].word,
            "wordState": rooms[key].editWords[i].wordState});
    }

    /**
     * Implementation of sWordsToEdit signal
     * @see API.md
     */
    console.log(rooms[key].users[rooms[key].speaker].sids[0],
        "sWordsToEdit", {"editWords": editWords});
    io.sockets.to(rooms[key].users[rooms[key].speaker].sids[0]).emit(
        "sWordsToEdit", {"editWords": editWords});
}

/**
 * end the game
 * @param key --- key of the room
 * @return none
 */
function endGame(key) {
    // preapring results
    let results = [];
    for (let i = 0; i < rooms[key].users.length; ++i) {
        results.push({
            "username": rooms[key].users[i].username,
            "scoreExplained": rooms[key].users[i].scoreExplained,
            "scoreGuessed": rooms[key].users[i].scoreGuessed});
    }

    // sorting results
    results.sort(function(a, b) {
        return 0 - (a.scoreExplained + a.scoreGuessed - b.scoreExplained - b.scoreGuessed);
    });

    /**
     * Implementation of sGameEnded signal
     * @see API.md
     */
    console.log(key, "sGameEnded", {"results": results});
    io.sockets.to(key).emit("sGameEnded", {"results": results});

    // removing room
    delete rooms[key];

    // removing users from room
    io.sockets.in(key).clients(function(err, clients) {
        clients.forEach(function(sid) {
            let socket = io.sockets.connected[sid];
            console.log("Player", sid, "disconnected from", key);
            socket.leave(key);
        });
    });
}

//----------------------------------------------------------
// HTTP functions

/**
 * Implementation of getFreeKey function
 * @see API.md
 */
app.get("/getFreeKey", function(req, res) {
    // getting the setings
    const minKeyLength = config.minKeyLength;
    const maxKeyLength = config.maxKeyLength;
    const keyConsonant = config.keyConsonant;
    const keyVowels = config.keyVowels;
    // getting the key length
    const keyLength = Math.floor(minKeyLength + Math.random() * (maxKeyLength - minKeyLength));
    // generatin the key
    let key = "";
    for (let i = 0; i < keyLength; ++i) {
        const charList = (i % 2 === 0) ? keyConsonant : keyVowels;
        key += charList[Math.floor(Math.random() * charList.length)];
    }
    res.json({"key": key});
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
 *     - speaker --- position of speaker,
 *     - listener --- position of listener,
 *     - speakerReady --- bool,
 *     - listenerReady --- bool,
 *     - word --- current word,
 *     - startTime --- UTC time of start of explanation (in miliseconds).
 *     - editWords --- list of words to edit
 *     - numberOfTurn --- number of turn
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
        console.log(socket.id, "cJoinRoom", ev);

        // checking input
        if (!checkObject(ev, {"key": "string", "username": "string"})) {
            console.log(socket.id, "sFailure", {"request": "cJoinRoom", "msg": "Incorrect input"});
            socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Incorrect input"});
            return;
        }

        // If user is not in his own room, it will be an error
        if (getRoom(socket) !== socket.id) {
            console.log(socket.id, "sFailure", {"request": "cJoinRoom", "msg": "You are in room now"});
            socket.emit("sFailure", {"request": "cJoinRoom", "msg": "You are in room now"});
            return;
        }
        // If key is "" or name is "", it will be an error
        if (ev.key === "") {
            console.log(socket.id, "sFailure", {"request": "cJoinRoom", "msg": "Invalid key of room"});
            socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Invalid key of room"});
            return;
        }
        if (ev.username === "") {
            console.log(socket.id, "sFailure", {"request": "cJoinRoom", "msg": "Invalid username"});
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
                console.log(socket.id, "sFailure", {"request": "cJoinRoom", "msg": "Username is already used"});
                socket.emit("sFailure", {"request": "cJoinRoom", "msg": "Username is already used"});
                return;
            }

            // If game has started, only logging in can be perfomed
            if (rooms[key].state === "play" && pos === -1) {
                console.log(socket.id, "sFailure", {
                    "request": "cJoinRoom",
                    "msg": "Game have started, only logging in can be perfomed"});
                socket.emit("sFailure", {
                    "request": "cJoinRoom",
                    "msg": "Game have started, only logging in can be perfomed"});
                return;
            }
        }


        // Adding the user to the room
        socket.join(key, function(err) {
            // If any error happened
            if (err) {
                console.log(err);
                console.log(socket.id, "sFailure", {"request": "joinRoom", "msg": "Failed to join the room"});
                socket.emit("sFailure", {"request": "joinRoom", "msg": "Failed to join the room"});
                return;
            }
            // If user haven't joined the room
            if (getRoom(socket) !== key) {
                console.log(socket.id, "sFailure", {"request": "joinRoom", "msg": "Failed to join the room"});
                socket.emit("sFailure", {"request": "joinRoom", "msg": "Failed to join the room"});
                return;
            }

            // Logging the joining
            // console.log("Player", name, "joined to", key);

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
                rooms[key].users.push({
                    "username": name,
                    "sids": [socket.id],
                    "online": true,
                    "scoreExplained": 0,
                    "scoreGuessed": 0});
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
            console.log(key,
                "sPlayerJoined", {"username": name, "playerList": getPlayerList(rooms[key]),
                "host": rooms[key].users[findFirstPos(rooms[key].users, "online", true)].username});
            io.sockets.to(key).emit(
                "sPlayerJoined", {"username": name, "playerList": getPlayerList(rooms[key]),
                "host": rooms[key].users[findFirstPos(rooms[key].users, "online", true)].username});

            /**
             * Implementation of sYouJoined signal
             * @see API.md
             */
            let joinObj = {
                "key": key,
                "playerList": getPlayerList(rooms[key]),
                "host": rooms[key].users[findFirstPos(rooms[key].users, "online", true)].username};
            switch (rooms[key].state) {
                case "wait":
                    joinObj.state = "wait";
                    break;
                case "play":
                    joinObj.state = "play";
                    joinObj.wordsCount = rooms[key].freshWords.length;
                    switch (rooms[key].substate) {
                        case "wait":
                            joinObj.substate = "wait";
                            joinObj.speaker =  rooms[key].users[rooms[key].speaker].username;
                            joinObj.listener =  rooms[key].users[rooms[key].listener].username;
                            break;
                        case "explanation":
                            joinObj.substate = "explanation";
                            joinObj.speaker =  rooms[key].users[rooms[key].speaker].username;
                            joinObj.listener =  rooms[key].users[rooms[key].listener].username;
                            joinObj.startTime = rooms[key].startTime;
                            joinObj.wordsCount++;
                            if (joinObj.speaker === name) {
                                joinObj.word = rooms[key].word;
                            }
                            break;
                        case "edit":
                            joinObj.substate = "edit";
                            joinObj.editWords = [];
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
            console.log(socket.id, "sYouJoined", joinObj);
            socket.emit("sYouJoined", joinObj);
        });
    });

    /**
     * Implementation of cLeaveRoom function
     * @see API.md
     */
    socket.on("cLeaveRoom", function() {
        console.log(socket.id, "cLeaveRoom", undefined);

        const key = getRoom(socket); // Key of user's current room

        // If user is only in his own room
        if (key === socket.id) {
            console.log(socket.id, "sFailure", {"request": "cLeaveRoom", "msg": "you aren't in the room"});
            socket.emit("sFailure", {"request": "cLeaveRoom", "msg": "you aren't in the room"});
            return;
        }

        // checking if key is valid
        if (!(key in rooms)) {
            // when game ended
            console.log("Player", socket.id, "left", key);
            socket.leave(key);
            return;
        }

        // getting username
        const usernamePos = findFirstSidPos(rooms[key].users, socket.id);
        const username = rooms[key].users[usernamePos].username;

        // if username is ""
        if (username === "") {
            console.log(socket.id, "sFailure", {"request": "cLeaveRoom", "msg": "you aren't in the room"});
            socket.emit("sFailure", {"request": "cLeaveRoom", "msg": "you aren't in the room"});
            return;
        }

        // Removing the user from the room
        socket.leave(key, function(err) {
            // If any error happened
            if (err) {
                console.log(socket.id, "sFailure", {"request": "cLeaveRoom", "msg": "failed to leave the room"});
                socket.emit("sFailure", {"request": "cLeaveRoom", "msg": "failed to leave the room"});
                return;
            }

            // Logging the leaving
            // console.log("Player", username, "left", key);

            // Removing the user from the room info
            rooms[key].users[usernamePos].online = false;
            rooms[key].users[usernamePos].sids = [];

            /**
             * Implementation of sPlayerLeft signal
             * @see API.md
             */
            // Sending new state of the room.
            let host = "";
            const pos = findFirstPos(rooms[key].users, "online", true);
            if (pos !== -1) {
                host = rooms[key].users[pos].username;
            }
            console.log(key, "sPlayerLeft", {
                "username": username, "playerList": getPlayerList(rooms[key]),
                "host": host});
            io.sockets.to(key).emit("sPlayerLeft", {
                "username": username, "playerList": getPlayerList(rooms[key]),
                "host": host});
        });
    });

    /**
     * Implementation of cStartGame function
     * @see API.md
     */
    socket.on("cStartGame", function() {
        console.log(socket.id, "cStartGame", undefined);

        // acquiring the key
        const key = getRoom(socket);

        // if game ended
        if (!(key in rooms)) {
            console.log(socket.id, "sFailure", {"request": "cStartGame", "msg": "game ended"});
            socket.emit("sFailure", {"request": "cStartGame", "msg": "game ended"});
            return;
        }

        // if state isn't 'wait', something went wrong
        if (rooms[key].state !== "wait") {
            console.log(socket.id, "sFailure", {"request": "cStartGame", "msg": "Game have already started"});
            socket.emit("sFailure", {"request": "cStartGame", "msg": "Game have already started"});
            return;
        }

        // checking whether siganl owner is host
        const hostPos = findFirstPos(rooms[key].users, "online", true);
        if (hostPos === -1) {
            // very strange case, probably something went wrong, let's log it!
            console.log("cStartGame: Everyone is offline");
            socket.emit("sFailure", {"request": "cStartGame", "mgs": "Everyone is offline"});
            return;
        }
        if (rooms[key].users[hostPos].sids[0] !== socket.id) {
            console.log(socket.id, "sFailure", {"request": "cStartGame", "msg": "Only host can start the game"});
            socket.emit("sFailure", {"request": "cStartGame", "msg": "Only host can start the game"});
            return;
        }

        // Fail if only one user is online
        let cnt = 0
        for (let i = 0; i < rooms[key].users.length; ++i) {
            if (rooms[key].users[i].online) {
                cnt++;
            }
        }
        if (cnt < 2) {
            console.log(socket.id, "sFailure", {
                "request": "cStartGame",
                "msg": "Not enough online users to start the game (at least two required)"});
            socket.emit("sFailure", {
                "request": "cStartGame", 
                "msg": "Not enough online users to start the game (at least two required)"});
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

        // preparing storage for words to edit
        rooms[key].editWords = [];

        // preparing word container
        rooms[key].word = "";

        // preparing endTime container
        rooms[key].startTime = 0;

        // setting number of turn
        rooms[key].numberOfTurn = 0;

        // preparing flags for 'wait'
        rooms[key].speakerReady = false;
        rooms[key].listenerReady = false;

        // preparing 'speaker' and 'listener'
        const numberOfPlayers = rooms[key].users.length;
        const nextPair = getNextPair(numberOfPlayers, numberOfPlayers - 1, numberOfPlayers - 2);
        rooms[key].speaker = nextPair.speaker;
        rooms[key].listener = nextPair.listener;

        /**
         * Implementation of sGameStarted signal
         * @see API.md
         */
        console.log(key, "sGameStarted", {
            "speaker": rooms[key].users[rooms[key].speaker].username,
            "listener": rooms[key].users[rooms[key].listener].username,
            "wordsCount": rooms[key].freshWords.length});
        io.sockets.to(key).emit("sGameStarted", {
            "speaker": rooms[key].users[rooms[key].speaker].username,
            "listener": rooms[key].users[rooms[key].listener].username,
            "wordsCount": rooms[key].freshWords.length});
    });

    /**
     * Implementation of cSpeakerReady function
     * @see API.md
     */
    socket.on("cSpeakerReady", function() {
        console.log(socket.id, "cSpeakerReady", undefined);

        const key = getRoom(socket); // key of room

        // if game ended
        if (!(key in rooms)) {
            console.log(socket.id, "sFailure", {"request": "cStartGame", "msg": "game ended"});
            socket.emit("sFailure", {"request": "cStartGame", "msg": "game ended"});
            return;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            console.log(socket.id, "sFailure", {
                "request": "cListenerReady",
                "msg": "game state isn't 'play'"});
            socket.emit("sFailure", {
                "request": "cListenerReady",
                "msg": "game state isn't 'play'"});
            return;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            console.log(socket.id, "sFailure", {
                "request": "cSpeakerReady",
                "msg": "game substate isn't 'wait'"});
            socket.emit("sFailure", {
                "request": "cSpeakerReady",
                "msg": "game substate isn't 'wait'"});
            return;
        }

        // check whether the client is speaker
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            console.log(socket.id, "sFailure", {
                "request": "cSpeakerReady",
                "msg": "you aren't a speaker"});
            socket.emit("sFailure", {
                "request": "cSpeakerReady",
                "msg": "you aren't a speaker"});
            return;
        }

        // check if speaker isn't already ready
        if (rooms[key].speakerReady) {
            console.log(socket.id, "sFailure", {
                "request": "cSpeakerReady",
                "msg": "speaker is already ready"});
            socket.emit("sFailure", {
                "request": "cSpeakerReady",
                "msg": "speaker is already ready"});
            return;
        }

        // setting flag for speaker
        rooms[key].speakerReady = true;

        // if listener is ready --- let's start!
        if (rooms[key].listenerReady) {
            startExplanation(key);
        }
    });

    /**
     * Implementation of cListenerReady function
     * @see API.md
     */
    socket.on("cListenerReady", function() {
        console.log(socket.id, "cListenerReady", undefined);

        const key = getRoom(socket); // key of room

        // if game ended
        if (!(key in rooms)) {
            console.log(socket.id, "sFailure", {"request": "cStartGame", "msg": "game ended"});
            socket.emit("sFailure", {"request": "cStartGame", "msg": "game ended"});
            return;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            console.log(socket.id, "sFailure", {
                "request": "cListenerReady",
                "msg": "game state isn't 'play'"});
            socket.emit("sFailure", {
                "request": "cListenerReady",
                "msg": "game state isn't 'play'"});
            return;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            console.log(socket.id, "sFailure", {
                "request": "cListenerReady",
                "msg": "game substate isn't 'wait'"});
            socket.emit("sFailure", {
                "request": "cListenerReady",
                "msg": "game substate isn't 'wait'"});
            return;
        }

        // check whether the client is listener
        if (rooms[key].users[rooms[key].listener].sids[0] !== socket.id) {
            console.log(socket.id, "sFailure", {
                "request": "cListenerReady",
                "msg": "you aren't a listener"});
            socket.emit("sFailure", {
                "request": "cListenerReady",
                "msg": "you aren't a listener"});
            return;
        }

        // check if listener isn't already ready
        if (rooms[key].listenerReady) {
            console.log(socket.id, "sFailure", {
                "request": "cListenerReady",
                "msg": "listener is already ready"});
            socket.emit("sFailure", {
                "request": "cListenerReady",
                "msg": "listener is already ready"});
            return;
        }

        // setting flag for listener
        rooms[key].listenerReady = true;

        // if listener is ready --- let's start!
        if (rooms[key].speakerReady) {
            startExplanation(key);
        }
    });
    
    /**
     * Implementation of cEndWordExplanation function
     * @see API.md
     */
    socket.on("cEndWordExplanation", function(ev) {
        console.log(socket.id, "cEndWordExplanation", ev);

        const key = getRoom(socket); // key of the room

        // checking if room exists
        if (!(key in rooms)) {
            console.log(socket.id, "sFailure", {
                "request": "cEndWordExplanation",
                "msg": "game ended"});
            socket.emit("sFailure", {
                "request": "cEndWordExplanation",
                "msg": "game ended"});
            return;
        }
        
        // checking if proper state and substate
        if (rooms[key].state !== "play") {
            console.log(socket.id, "sFailure", {
                "request": "cEndWordExplanation",
                "msg": "game state isn't 'play'"});
            socket.emit("sFailure", {
                "request": "cEndWordExplanation",
                "msg": "game state isn't 'play'"});
            return;
        }
        if (rooms[key].substate !== "explanation") {
            console.log(socket.id, "sFailure", {
                "request": "cEndWordExplanation",
                "msg": "game substate isn't 'explanation'"});
            socket.emit("sFailure", {
                "request": "cEndWordExplanation",
                "msg": "game substate isn't 'explanation'"});
            return;
        }

        // checking if speaker send this
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            console.log(socket.id, "sFailure", {
                "request": "cEndWordExplanation",
                "msg": "you aren't a listener"});
            socket.emit("sFailure", {
                "request": "cEndWordExplanation",
                "msg": "you aren't a listener"});
            return;
        }

        // checking if time is correct
        const date = new Date();
        if (date.getTime() < rooms[key].startTime) {
            console.log(socket.id, "sFailure", {
                "request": "cEndWordExplanation",
                "msg": "to early"});
            socket.emit("sFailure", {
                "request": "cEndWordExplanation",
                "msg": "to early"});
            return;
        }

        // checking input
        if (!checkObject(ev, {"cause": "string"})) {
            console.log(socket.id, "sFailure", {
                "request": "cWordsEdited",
                "msg": "incorrect input"});
            socket.emit("sFailure", {
                "request": "cWordsEdited",
                "msg": "incorrect input"});
            return;
        }

        let cause = ev.cause;
        switch (cause) {
            case "explained":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "explained",
                    "transfer": true});

                // removing the word from the 'word' container
                rooms[key].word = "";

                /**
                 * Implementation of sWordExplanationEnded signal
                 * @see API.md
                 */
                console.log(key, "sWordExplanationEnded", {
                    "cause": cause,
                    "wordsCount": rooms[key].freshWords.length});
                io.sockets.to(key).emit("sWordExplanationEnded", {
                    "cause": cause,
                    "wordsCount": rooms[key].freshWords.length});

                // checking the time
                if (date.getTime() > rooms[key].startTime + 1000 * EXPLANATION_LENGTH) {
                    // finishing the explanation
                    finishExplanation(key);
                    return;
                }

                // if words left --- time to finish the explanation
                if (rooms[key].freshWords.length === 0) {
                    finishExplanation(key);
                    return;
                }

                // emmiting new word
                rooms[key].word = rooms[key].freshWords.pop();
                console.log(socket.id, "sNewWord", {"word": rooms[key].word});
                socket.emit("sNewWord", {"word": rooms[key].word});
                return;
            case "mistake":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "mistake",
                    "transfer": true});

                // word don't go to the hat
                rooms[key].word = "";

                /**
                 * Implementation of sWordExplanationEnded signal
                 * @see API.md
                 */
                console.log(key, "sWordExplanationEnded", {
                    "cause": cause,
                    "wordsCount": rooms[key].freshWords.length});
                io.sockets.to(key).emit("sWordExplanationEnded", {
                    "cause": cause,
                    "wordsCount": rooms[key].freshWords.length});

                // finishing the explanation
                finishExplanation(key);
                return;
            case "notExplained":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "notExplained",
                    "transfer": true});

                /**
                 * Implementation of sWordExplanationEnded signal
                 * @see API.md
                 */
                console.log(key, "sWordExplanationEnded", {
                    "cause": cause,
                    "wordsCount": rooms[key].freshWords.length + 1});
                io.sockets.to(key).emit("sWordExplanationEnded", {
                    "cause": cause,
                    "wordsCount": rooms[key].freshWords.length + 1});

                // finishing the explanation
                finishExplanation(key);
                return;
        }
    });

    /**
     * Implementation of cWordsEdited function
     * @see API.md
     */
    socket.on("cWordsEdited", function(ev) {
        console.log(socket.id, "cWordsEdited", ev);

        const key = getRoom(socket); // key of the room

        // if game ended
        if (!(key in rooms)) {
            console.log(socket.id, "sFailure", {"request": "cStartGame", "msg": "game ended"});
            socket.emit("sFailure", {"request": "cStartGame", "msg": "game ended"});
            return;
        }

        // check if game state is 'edit'
        if (rooms[key].state === "edit") {
            console.log(socket.id, "sFailure", {
                "request": "cWordsEdited",
                "msg": "game state isn't 'edit'"});
            socket.emit("sFailure", {
                "request": "cWordsEdited",
                "msg": "game state isn't 'edit'"});
            return;
        }

        // check if game substate is 'edit'
        if (rooms[key].substate !== "edit") {
            console.log(socket.id, "sFailure", {
                "request": "cWordsEdited",
                "msg": "game substate isn't 'edit'"});
            socket.emit("sFailure", {
                "request": "cWordsEdited",
                "msg": "game substate isn't 'edit'"});
            return;
        }

        // check if speaker send this signal
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            console.log(socket.id, "sFailure", {
                "request": "cWordsEdited",
                "msg": "only speaker can send this signal"});
            socket.emit("sFailure", {
                "request": "cWordsEdited",
                "msg": "only speaker can send this signal"});
            return;
        }

        // moving editWords
        const editWords = ev.editWords;

        // comparing the legth of serer editWords and client editWords
        if (editWords.length !== rooms[key].editWords.length) {
            console.log(socket.id, "sFailure", {
                "request": "cWordsEdited",
                "msg": "incorrect number of words"});
            socket.emit("sFailure", {
                "request": "cWordsEdited",
                "msg": "incorrect number of words"});
            return;
        }

        // applying changes and counting success explanations
        let cnt = 0;
        for (let i = 0; i < editWords.length; ++i) {
            let word = rooms[key].editWords[i];
            
            // checking matching of information
            if (word.word !== editWords[i].word) {
                console.log(socket.id, "sFailure", {
                    "request": "cWordsEdited",
                    "msg": `incorrect word at position ${i}`});
                socket.emit("sFailure", {
                    "request": "cWordsEdited",
                    "msg": `incorrect word at position ${i}`});
                return;
            }

            switch (editWords[i].wordState) {
                case "explained":
                    // counting explained words
                    cnt++;
                case "mistake":
                    // transferring data to serer structure
                    rooms[key].editWords[i].wordState = editWords[i].wordState;
                    break;
                case "notExplained":
                    // returning not explained words to the hat
                    rooms[key].editWords[i].transfer = false;
                    break;
            }
        }

        // transferring round info
        // changing the score
        rooms[key].users[rooms[key].speaker].scoreExplained += cnt;
        rooms[key].users[rooms[key].listener].scoreGuessed += cnt;

        // changing usedWords and creating words list
        let words = [];
        for (let i = 0; i < rooms[key].editWords.length; ++i) {
            if (rooms[key].editWords[i].transfer) {
                rooms[key].usedWords[rooms[key].editWords[i].word] = rooms[key].editWords[i].wordState;
                words.push({
                    "word": rooms[key].editWords[i].word,
                    "wordState": rooms[key].editWords[i].wordState});
            } else {
                rooms[key].freshWords.splice(
                    Math.floor(Math.random() * Math.max(rooms[key].freshWords.length - 1, 0)),
                    0, rooms[key].editWords[i].word);
            }
        }

        // if no words left it's time to finish the game
        if (rooms[key].freshWords.length === 0) {
            endGame(key);
            return;
        }

        // initializing next round
        rooms[key].substate = "wait";
        rooms[key].editWords = [];
        rooms[key].word = "";
        rooms[key].startTime = 0;
        rooms[key].speakerReady = false;
        rooms[key].listenerReady = false;
        rooms[key].numberOfTurn++;

        // choosing next pair
        const numberOfPlayers = rooms[key].users.length;
        const nextPair = getNextPair(numberOfPlayers, rooms[key].speaker, rooms[key].listener);
        rooms[key].speaker = nextPair.speaker;
        rooms[key].listener = nextPair.listener;

        /**
         * Implementation of sNextTurn signal
         * @see API.md
         */
        console.log(key, "sNextTurn", {
            "speaker": rooms[key].users[rooms[key].speaker].username,
            "listener": rooms[key].users[rooms[key].listener].username,
            "words": words});
        io.sockets.to(key).emit("sNextTurn", {
            "speaker": rooms[key].users[rooms[key].speaker].username,
            "listener": rooms[key].users[rooms[key].listener].username,
            "words": words});
    });

    socket.on("disconnect", function() {
        console.log(socket.id, "disconnect", undefined);

        /**
         * room key can't be acceessed via getRoom(socket)
         * findFirstSidPos must be used intead
         */

        let key = [];
        let username = [];
        let usernamePos = [];
        let keys = Object.keys(rooms);
        // searching for given sid within all rooms
        for (let i = 0; i < keys.length; ++i) {
            const users = rooms[keys[i]].users;

            const pos = findFirstSidPos(users, socket.id);
            if (pos !== -1) {
                key.push(keys[i]);
                usernamePos.push(pos);
                username.push(users[usernamePos].username);
            }
        }

        // users wasn't logged in
        if (key.length === 0) {
            return;
        }

        for (let i = 0; i < key.length; ++i) {
            let _key = key[i];
            let _username = username[i];
            let _usernamePos = usernamePos[i];
            
            // Logging the disconnection
            // console.log("Player", _username, "disconnected", _key);

            // Removing the user from the room info
            rooms[_key].users[_usernamePos].online = false;
            rooms[_key].users[_usernamePos].sids = [];

            /**
             * Implementation of sPlayerLeft signal
             * @see API.md
             */
            // Sending new state of the room.
            let host = "";
            const pos = findFirstPos(rooms[_key].users, "online", true);
            if (pos !== -1) {
                host = rooms[_key].users[pos].username;
            }
            console.log(_key, "sPlayerLeft", {
                "username": username, "playerList": getPlayerList(rooms[_key]),
                "host": host});
            io.sockets.to(_key).emit("sPlayerLeft", {
                "username": username, "playerList": getPlayerList(rooms[_key]),
                "host": host});
        }
    });
});
