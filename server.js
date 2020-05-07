#!/usr/bin/node

"use strict"

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

// Serving static files
app.use(express.static("static"));

// Serving page of the game by default address
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

//----------------------------------------------------------
// Handy functions

/**
 * Checks object with the pattern
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
 * Returns playerList structure,
 * @see API.md
 *
 * @param room Room object
 * @return list of players
 */
function getPlayerList(room) {
    return room.users.map(el => {return {"username": el.username, "online": el.online};});
}

/**
 * Finds first position in users array where element has attribute with given value
 *
 * @param users The users array
 * @param field The attribute to check
 * @param val the value to find
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
 * Finds first position in users array where given socket ID is in list of socket IDs
 *
 * @param users The users array
 * @param sid Socket ID
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
 * Returns current player's room.
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
 * Generate word list
 *
 * @return list of words
 */
function generateWords() {
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
 * Get next speaker and listener
 *
 * @param numberOfPlayers Number of players
 * @param lastSpeaker Index of previous speaker
 * @param lastListener Index of previous listener
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
 * Start an explanation
 *
 * @param key --- key of the room
 */
function startExplanation(key) {
    rooms[key].substate = "explanation";
    const date = new Date();
    const currentTime = date.getTime();
    rooms[key].startTime = currentTime + (PRE + DELAY) * 1000;
    rooms[key].word = rooms[key].freshWords.pop();
    /*
    const numberOfTurn = rooms[key].numberOfTurn;
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
    setTimeout(() => Signals.sNewWord(key), (PRE + DELAY) * 1000);
    Signals.sExplanationStarted(key)
}

/**
 * Finish an explanation
 *
 * @param key --- key of the room
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

    rooms[key].startTime = 0;
    rooms[key].word = "";

    Signals.sExplanationEnded(key)

    // generating editWords for client (without 'transport' flag)
    let editWords = [];
    for (let i = 0; i < rooms[key].editWords.length; ++i) {
        editWords.push({
            "word": rooms[key].editWords[i].word,
            "wordState": rooms[key].editWords[i].wordState});
    }

    Signals.sWordsToEdit(key, editWords)
}

/**
 * End the game
 *
 * @param key --- key of the room
 */
function endGame(key) {
    // preparing results
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

    Signals.sGameEnded(key, results)

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

class Signals {
    static emit(socket, event, args) {
        socket.emit(event, args);
    }

    /**
     * Implementation of sPlayerJoined signal
     * @see API.md
     *
     * @param socket Socket to emit
     * @param room Room object
     * @param username User's name
     */
    static sPlayerJoined(socket, room, username) {
        socket.emit(
            "sPlayerJoined", {
                "username": username, "playerList": getPlayerList(room),
                "host": room.users[findFirstPos(room.users, "online", true)].username
            });
    }

    /**
     * Implementation of sPlayerLeft signal
     * @see API.md
     *
     * @param socket Socket to emit
     * @param room Room object
     * @param username User's name
     */
    static sPlayerLeft(socket, room, username) {
        // Sending new state of the room.
        let host = "";
        const pos = findFirstPos(room.users, "online", true);
        if (pos !== -1) {
            host = room.users[pos].username;
        }
        socket.emit("sPlayerLeft", {
            "username": username, "playerList": getPlayerList(room),
            "host": host
        });
    }

    /**
     * Implementation of sYouJoined signal
     * @see API.md
     *
     * @param socket Socket to emit
     * @param key Key of the room
     */
    static sYouJoined(socket, key) {
        const room = rooms[key];
        let joinObj = {
            "key": key,
            "playerList": getPlayerList(room),
            "host": room.users[findFirstPos(room.users, "online", true)].username
        };
        switch (room.state) {
            case "wait":
                joinObj.state = "wait";
                break;
            case "play":
                joinObj.state = "play";
                joinObj.wordsCount = room.freshWords.length;
                switch (room.substate) {
                    case "wait":
                        joinObj.substate = "wait";
                        joinObj.speaker = room.users[room.speaker].username;
                        joinObj.listener = room.users[room.listener].username;
                        break;
                    case "explanation":
                        joinObj.substate = "explanation";
                        joinObj.speaker = room.users[room.speaker].username;
                        joinObj.listener = room.users[room.listener].username;
                        joinObj.startTime = room.startTime;
                        joinObj.wordsCount++;
                        if (joinObj.speaker === name) {
                            joinObj.word = room.word;
                        }
                        break;
                    case "edit":
                        joinObj.substate = "edit";
                        joinObj.editWords = [];
                        break;
                    default:
                        console.log(room);
                        break;
                }
                break;
            default:
                console.log(rooms[key]);
                break;
        }
        socket.emit("sYouJoined", joinObj);
    }

    /**
     * Implementation of sFailure signal
     * @see API.md
     *
     *
     * @param socket Socket to emit
     * @param request Request that is failed
     * @param msg Message to send
     */
    static sFailure(socket, request, msg) {
        socket.emit("sFailure", {"request": request, "msg": msg});
    }

    /**
     * Implementation of sGameStarted signal
     * @see API.md
     *
     * @param key Key of the Room
     */
    static sGameStarted(key) {
        io.sockets.to(key).emit("sGameStarted", {
            "speaker": rooms[key].users[rooms[key].speaker].username,
            "listener": rooms[key].users[rooms[key].listener].username,
            "wordsCount": rooms[key].freshWords.length});
    }

    /**
     * Implementation of sNextTurn signal
     * @see API.md
     *
     * @param key Key of the room
     * @param words Words' statistic
     */
    static sNextTurn(key, words) {
        io.sockets.to(key).emit("sNextTurn", {
            "speaker": rooms[key].users[rooms[key].speaker].username,
            "listener": rooms[key].users[rooms[key].listener].username,
            "words": words});
    }

    /**
     * Implementation of sExplanationStarted signal
     * @see API.md
     *
     * @param key Key of the room
     */
    static sExplanationStarted(key) {
        io.sockets.to(key).emit("sExplanationStarted", {"startTime": rooms[key].startTime});
    }

    /**
     * Implementation of sNewWord signal
     * @see API.md
     *
     * @param key Key of the room
     */
    static sNewWord(key) {
        io.sockets.to(rooms[key].users[rooms[key].speaker].sids[0]).emit("sNewWord", {"word": rooms[key].word});
    }

    /**
     * Implementation of sWordExplanationEnded signal
     * @see API.md
     *
     * @param key Key of the room
     * @param cause Result of word explanation
     */
    static sWordExplanationEnded(key, cause) {
        io.sockets.to(key).emit("sWordExplanationEnded", {
            "cause": cause,
            "wordsCount": rooms[key].freshWords.length});
    }

    /**
     * Implementation of sExplanationEnded signal
     * @see API.md
     *
     * @param key Key of the room
     */
    static sExplanationEnded(key) {
        io.sockets.to(key).emit("sExplanationEnded", {
            "wordsCount": rooms[key].freshWords.length});
    }

    /**
     * Implementation of sWordsToEdit signal
     * @see API.md
     *
     * @param key Key of the room
     * @param editWords List of words to edit
     */
    static sWordsToEdit(key, editWords) {
        io.sockets.to(rooms[key].users[rooms[key].speaker].sids[0]).emit(
            "sWordsToEdit", {"editWords": editWords});
    }

    /**
     * Implementation of sGameEnded signal
     * @see API.md
     *
     * @param key Key of the room
     * @param results Results of the game
     */
    static sGameEnded(key, results) {
        io.sockets.to(key).emit("sGameEnded", {"results": results});
    }
}
//----------------------------------------------------------
// HTTP functions

/**
 * Implementation of getFreeKey function
 * @see API.md
 */
app.get("/getFreeKey", function(req, res) {
    // getting the settings
    const minKeyLength = config.minKeyLength;
    const maxKeyLength = config.maxKeyLength;
    const keyConsonant = config.keyConsonant;
    const keyVowels = config.keyVowels;
    // getting the key length
    const keyLength = Math.floor(minKeyLength + Math.random() * (maxKeyLength - minKeyLength));
    // generating the key
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
 * Room class
 *
 * Room's info is an object that has fields:
 *     - state --- state of the room,
 *     - users --- list of users (User objects)
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
 *     - startTime --- UTC time of start of explanation (in milliseconds).
 *     - editWords --- list of words to edit
 *     - numberOfTurn --- number of turn
 */
class Room {
    constructor() {
        this.state = "wait";
        this.users = [];
    }
}

/**
 * User class
 *
 * User is an object that has fields:
 *     - username --- no comments,
 *     - sids --- socket ids,
 *     - online --- whether the player is online,
 *     - scoreExplained --- no comments,
 *     - scoreGuessed --- no comments,
 */
class User {
    constructor(username, sids, online=true) {
        this.username = username;
        this.sids = sids;
        this.online = online;
        this.scoreExplained = 0;
        this.scoreGuessed = 0;
    }
}

/**
 * Dictionary of game rooms.
 * Its keys --- keys of rooms, its values --- rooms' infos.
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
        // checking input
        if (!checkObject(ev, {"key": "string", "username": "string"})) {
            Signals.sFailure(socket,"cJoinRoom", "Incorrect input");
            return;
        }

        // If user is not in his own room, it will be an error
        if (getRoom(socket) !== socket.id) {
            Signals.sFailure(socket,"cJoinRoom","You are in room now");
            return;
        }
        // If key is "" or name is "", it will be an error
        if (ev.key === "") {
            Signals.sFailure(socket,"cJoinRoom", "Invalid key of room");
            return;
        }
        if (ev.username === "") {
            Signals.sFailure(socket,"cJoinRoom", "Invalid username");
            return;
        }

        const key = ev.key.toLowerCase(); // key of the room
        const name = ev.username; // name of the user

        // if room and users exist, we should check the user
        if (rooms[key] !== undefined) {
            const pos = findFirstPos(rooms[key].users, "username", name);

            // If username is used, it will be an error
            if (pos !== -1 && rooms[key].users[pos].sids.length !== 0) {
                Signals.sFailure(socket,"cJoinRoom", "Username is already used");
                return;
            }

            // If game has started, only logging in can be performed
            if (rooms[key].state === "play" && pos === -1) {
                Signals.sFailure(socket,"cJoinRoom", "Game have started, only logging in can be performed");
                return;
            }
        }


        // Adding the user to the room
        socket.join(key, function(err) {
            // If any error happened
            if (err) {
                console.log(err);
                Signals.sFailure(socket,"joinRoom", "Failed to join the room");
                return;
            }
            // If user haven't joined the room
            if (getRoom(socket) !== key) {
                Signals.sFailure(socket,"joinRoom", "Failed to join the room");
                return;
            }

            // Logging the joining
            console.log("Player", name, "joined to", key);

            // If room isn't saved in main dictionary, let's save it and create info about it
            if (!(key in rooms)) {
                rooms[key] = new Room()
            }

            // Adding the user to the room info
            const pos = findFirstPos(rooms[key].users, "username", name);
            if (pos === -1) {
                // creating new one
                rooms[key].users.push(new User(name, [socket.id]));
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
            Signals.sPlayerJoined(io.sockets.to(key), rooms[key], name)

            Signals.sYouJoined(socket, key)
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
            Signals.sFailure(socket,"cLeaveRoom", "you aren't in the room");
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
            Signals.sFailure(socket,"cLeaveRoom", "you aren't in the room");
            return;
        }

        // Removing the user from the room
        socket.leave(key, function(err) {
            // If any error happened
            if (err) {
                Signals.sFailure(socket,"cLeaveRoom", "failed to leave the room");
                return;
            }

            // Logging the leaving
            console.log("Player", username, "left", key);

            // Removing the user from the room info
            rooms[key].users[usernamePos].online = false;
            rooms[key].users[usernamePos].sids = [];

            Signals.sPlayerLeft(io.sockets.to(key), rooms[key], username)
        });
    });

    /**
     * Implementation of cStartGame function
     * @see API.md
     */
    socket.on("cStartGame", function() {
        // acquiring the key
        const key = getRoom(socket);

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket,"cStartGame", "game ended");
            return;
        }

        // if state isn't 'wait', something went wrong
        if (rooms[key].state !== "wait") {
            Signals.sFailure(socket,"cStartGame", "Game have already started");
            return;
        }

        // checking whether signal owner is host
        const hostPos = findFirstPos(rooms[key].users, "online", true);
        if (hostPos === -1) {
            // very strange case, probably something went wrong, let's log it!
            console.log("cStartGame: Everyone is offline");
            Signals.sFailure(socket,"cStartGame", "Everyone is offline");
            return;
        }
        if (rooms[key].users[hostPos].sids[0] !== socket.id) {
            Signals.sFailure(socket,"cStartGame", "Only host can start the game");
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
            Signals.sFailure(socket,"cStartGame",
                "Not enough online users to start the game (at least two required)");
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

        Signals.sGameStarted(key)
    });

    /**
     * Implementation of cSpeakerReady function
     * @see API.md
     */
    socket.on("cSpeakerReady", function() {
        const key = getRoom(socket); // key of room

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket,"cSpeakerReady", "game ended");
            return;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket,"cSpeakerReady", "game state isn't 'play'");
            return;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            Signals.sFailure(socket,"cSpeakerReady", "game substate isn't 'wait'");
            return;
        }

        // check whether the client is speaker
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket,"cSpeakerReady", "you aren't a speaker");
            return;
        }

        // check if speaker isn't already ready
        if (rooms[key].speakerReady) {
            Signals.sFailure(socket,"cSpeakerReady","speaker is already ready");
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
        const key = getRoom(socket); // key of room

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket,"cListenerReady", "game ended");
            return;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket,"cListenerReady", "game state isn't 'play'");
            return;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            Signals.sFailure(socket,"cListenerReady", "game substate isn't 'wait'");
            return;
        }

        // check whether the client is listener
        if (rooms[key].users[rooms[key].listener].sids[0] !== socket.id) {
            Signals.sFailure(socket,"cListenerReady", "you aren't a listener");
            return;
        }

        // check if listener isn't already ready
        if (rooms[key].listenerReady) {
            Signals.sFailure(socket,"cListenerReady", "listener is already ready");
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
        const key = getRoom(socket); // key of the room

        // checking if room exists
        if (!(key in rooms)) {
            Signals.sFailure(socket,"cEndWordExplanation", "game ended");
            return;
        }
        
        // checking if proper state and substate
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket,"cEndWordExplanation","game state isn't 'play'");
            return;
        }
        if (rooms[key].substate !== "explanation") {
            Signals.sFailure(socket,"cEndWordExplanation", "game substate isn't 'explanation'");
            return;
        }

        // checking if speaker send this
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket,"cEndWordExplanation", "you aren't a listener");
            return;
        }

        // checking if time is correct
        const date = new Date();
        if (date.getTime() < rooms[key].startTime) {
            Signals.sFailure(socket,"cEndWordExplanation", "to early");
            return;
        }

        // checking input
        if (!checkObject(ev, {"cause": "string"})) {
            Signals.sFailure(socket,"cEndWordExplanation","incorrect input");
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

                Signals.sWordExplanationEnded(key, cause)

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

                // emitting new word
                rooms[key].word = rooms[key].freshWords.pop();
                Signals.sNewWord(key)
                return;
            case "mistake":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "mistake",
                    "transfer": true});

                // word don't go to the hat
                rooms[key].word = "";

                Signals.sWordExplanationEnded(key, cause)

                // finishing the explanation
                finishExplanation(key);
                return;
            case "notExplained":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "notExplained",
                    "transfer": true});

                Signals.sWordExplanationEnded(key, cause)

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
        const key = getRoom(socket); // key of the room

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket,"cWordsEdited", "game ended");
            return;
        }

        // check if game state is 'edit'
        if (rooms[key].state === "edit") {
            Signals.sFailure(socket, "cWordsEdited", "game state isn't 'edit'")
            return;
        }

        // check if game substate is 'edit'
        if (rooms[key].substate !== "edit") {
            Signals.sFailure(socket,"cWordsEdited","game substate isn't 'edit'")
            return;
        }

        // check if speaker send this signal
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket,"cWordsEdited", "only speaker can send this signal");
            return;
        }

        // moving editWords
        const editWords = ev.editWords;

        // comparing the length of serer editWords and client editWords
        if (editWords.length !== rooms[key].editWords.length) {
            Signals.sFailure(socket,"cWordsEdited", "incorrect number of words");
            return;
        }

        // applying changes and counting success explanations
        let cnt = 0;
        for (let i = 0; i < editWords.length; ++i) {
            let word = rooms[key].editWords[i];
            
            // checking matching of information
            if (word.word !== editWords[i].word) {
                Signals.sFailure(socket,"cWordsEdited", `incorrect word at position ${i}`);
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

        Signals.sNextTurn(key, words)
    });

    socket.on("disconnect", function() {
        /**
         * room key can't be accessed via getRoom(socket)
         * findFirstSidPos must be used instead
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
            console.log("Player", _username, "disconnected", _key);

            // Removing the user from the room info
            rooms[_key].users[_usernamePos].online = false;
            rooms[_key].users[_usernamePos].sids = [];

            Signals.sPlayerLeft(io.sockets.to(_key), rooms[_key], username)
        }
    });
});
