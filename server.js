#!/usr/bin/node

"use strict"

// Loading configuration file
const config = require("./config.json");

const argv = require("yargs")
    .option('pidfile', {
        default: config.serverPIDPath
    })
    .argv;

// Loading constants
const PORT = config.port;
const WRITE_LOGS = (config.env === config.DEVEL) ? false : true;
const TRANSFER_TIME = config.transferTime; // delay for transfer

// Saving PID
const fs = require("fs");
fs.writeFile(argv.pidfile, process.pid.toString(), function(err, data) {
    if (err) {
        console.log(err);
    }
});

// Setting up express
const express = require("express");
const app = express();
const server = new (require("http").Server)(app);
const io = require("socket.io")(server);

server.listen(PORT);
console.log("Listening on port " + PORT);

// Connecting DB
const sqlite3 = require('sqlite3').verbose();
const DB = new sqlite3.Database('DB.db');

DB.allAsync = function(sql, params) {
    let that = this;
    return new Promise(function(resolve, reject) {
        that.all(sql, params, function(err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve({"rows": rows});
            }
        });
    });
}

DB.runAsync = function(sql, params) {
    let that = this;
    return new Promise(function(resolve, reject) {
        that.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

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
 * @param users list of users
 * @return list of players
 */
function getPlayerList(users) {
    return users.map(el => {return {"username": el.username, "online": el.online};});
}

/**
 * Returns host username
 *
 * @param users list of users
 * @return host username
 */
function getHostUsername(users) {
    const pos = findFirstPos(users, "online", true);
    if (pos === -1) {
        return "";
    }
    return users[pos].username;
}

/**
 * Returns random number from interval [a, b)
 *
 * @param a lower bound
 * @param b upper bound
 * @return random integer from [a, b)
 */
function randrange(a = 0, b = 0) {
    if (arguments.length === 1) {
        b = a;
        a = 0;
    }
    return Math.floor(a + (b - a) * Math.random());
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
            return roomsList[i]; // It's found and returning
        }
    }
    return socket.id; // Nothing found. User's own room is returning
}

/**
 * Get all words from DB.
 *
 * @return All words in DB.
 * TODO: Rewrite using less segment. Feature.
 */
async function getAllWords() {
    const res = await DB.allAsync(`SELECT Word
                                   FROM Words
                                   WHERE Tags != ?;`, "-deleted");
    return res.rows.map((row) => (row["Word"]));
}

/**
 * Generate word list
 *
 * @return list of words
 * TODO: Rewrite using less segment. Feature.
 */
async function generateWords(word_number) {
    const allWords = await getAllWords();
    const words = [];
    const used = {};
    const numberOfAllWords = allWords.length;
    while (words.length < word_number) {
        const pos = randrange(numberOfAllWords);
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
    const settings = rooms[key].settings;
    const currentTime = Date.now();

    // Updating room info.
    rooms[key].substate = "explanation";
    rooms[key].startTime = currentTime + (settings.delayTime + TRANSFER_TIME);
    rooms[key].word = rooms[key].freshWords.pop();

    if (settings.strictMode) {
        const numberOfTurn = rooms[key].numberOfTurn;
        setTimeout(function () {
            // if explanation hasn't finished yet
            if (!(key in rooms)) {
                return;
            }
            if (rooms[key].numberOfTurn === numberOfTurn) {
                finishExplanation(key);
            }
        }, (settings.delayTime + settings.explanationTime + settings.aftermathTime + TRANSFER_TIME));
    }
    setTimeout(() => Signals.sNewWord(key), TRANSFER_TIME);
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
    DB.run(`UPDATE Games
            SET Results = $Results
            WHERE GameID = $GameID;`,
        {
            $Results: JSON.stringify(results),
            $GameID: rooms[key].gameID
        })

    // removing room
    delete rooms[key];
    if (config.cleanRooms) {
        DB.run(`DELETE
                FROM Rooms
                WHERE RoomKey = ?`, key)
    }

    // removing users from room
    io.sockets.in(key).clients(function(err, clients) {
        clients.forEach(function(sid) {
            let socket = io.sockets.connected[sid];
            socket.leave(key);
        });
    });
}


class Signals {
    /**
     * Send a signal to room
     *
     * @param roomId id of room
     * @param signal signal to send
     * @param data data to send
     */
    static emit(roomId, signal, data) {
        if (WRITE_LOGS) {
            console.log(roomId, signal, data);
        }
        io.sockets.to(roomId).emit(signal, data);
    }

    /**
     * Implementation of sPlayerJoined signal
     * @see API.md
     *
     * @param sid Id of socket to emit
     * @param room Room object
     * @param username User's name
     */
    static sPlayerJoined(sid, room, username) {
        Signals.emit(sid, "sPlayerJoined", {
                "username": username, "playerList": getPlayerList(room.users),
                "host": getHostUsername(room.users)
            });
    }

    /**
     * Implementation of sPlayerLeft signal
     * @see API.md
     *
     * @param sid Id of socket to emit
     * @param room Room object
     * @param username User's name
     */
    static sPlayerLeft(sid, room, username) {
        // Sending new state of the room.
        Signals.emit(sid, "sPlayerLeft", {
            "username": username, "playerList": getPlayerList(room.users),
            "host": getHostUsername(room.users)
        });
    }

    /**
     * Implementation of sYouJoined signal
     * @see API.md
     *
     * @param sid Id of socket to emit
     * @param key Key of the room
     */
    static sYouJoined(sid, key) {
        const room = rooms[key];
        const name = room.users[findFirstSidPos(room.users, sid)].username;
        let joinObj = {
            "key": key,
            "playerList": getPlayerList(room.users),
            "host": getHostUsername(room.users),
            "settings": room.settings
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
                        joinObj.speaker = room.users[room.speaker].username;
                        joinObj.listener = room.users[room.listener].username;
                        if (joinObj.speaker === name) {
                            joinObj.editWords = room.editWords;
                        }
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
        Signals.emit(sid, "sYouJoined", joinObj);
    }

    /**
     * Implementation of sFailure signal
     * @see API.md
     *
     *
     * @param sid Id of socket to emit
     * @param request Request that is failed
     * @param code Failure code. See errorsCodes.md
     * @param msg Message to send
     */
    static sFailure(sid, request, code, msg) {
        Signals.emit(sid, "sFailure", {"request": request, "msg": msg, "code": code});
    }

    /**
     * Implementation of sGameStarted signal
     * @see API.md
     *
     * @param key Key of the Room
     */
    static sGameStarted(key) {
        Signals.emit(key, "sGameStarted", {
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
        Signals.emit(key, "sNextTurn", {
            "speaker": rooms[key].users[rooms[key].speaker].username,
            "listener": rooms[key].users[rooms[key].listener].username,
            "words": words,
            "wordsCount": rooms[key].freshWords.length});
    }

    /**
     * Implementation of sExplanationStarted signal
     * @see API.md
     *
     * @param key Key of the room
     */
    static sExplanationStarted(key) {
        Signals.emit(key, "sExplanationStarted", {"startTime": rooms[key].startTime});
    }

    /**
     * Implementation of sNewWord signal
     * @see API.md
     *
     * @param key Key of the room
     */
    static sNewWord(key) {
        Signals.emit(rooms[key].users[rooms[key].speaker].sids[0], "sNewWord", {"word": rooms[key].word});
    }

    /**
     * Implementation of sWordExplanationEnded signal
     * @see API.md
     *
     * @param key Key of the room
     * @param cause Result of word explanation
     */
    static sWordExplanationEnded(key, cause) {
        Signals.emit(key, "sWordExplanationEnded", {
            "cause": cause,
            "wordsCount": rooms[key].freshWords.length +
            ((rooms[key].editWords[rooms[key].editWords.length - 1].wordState === "notExplained") ? 1 : 0)});
    }

    /**
     * Implementation of sExplanationEnded signal
     * @see API.md
     *
     * @param key Key of the room
     */
    static sExplanationEnded(key) {
        Signals.emit(key, "sExplanationEnded", {
            "wordsCount": rooms[key].freshWords.length +
            ((rooms[key].editWords[rooms[key].editWords.length - 1].wordState === "notExplained") ? 1 : 0)});
    }

    /**
     * Implementation of sWordsToEdit signal
     * @see API.md
     *
     * @param key Key of the room
     * @param editWords List of words to edit
     */
    static sWordsToEdit(key, editWords) {
        Signals.emit(rooms[key].users[rooms[key].speaker].sids[0],
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
        Signals.emit(key, "sGameEnded", {"results": results});
    }
}
//----------------------------------------------------------
// HTTP functions

/**
 * Send response
 *
 * @param req request object
 * @param res object to send response
 * @param data data
 */
function sendResponse(req, res, data) {
    if (WRITE_LOGS) {
        console.log(req.originalUrl, data);
    }
    res.json(data);
}

/**
 * Implementation of getFreeKey function
 * @see API.md
 */
app.get("/getFreeKey", async function(req, res) {
    // getting the settings
    const minKeyLength = config.minKeyLength;
    const maxKeyLength = config.maxKeyLength;
    const keyConsonant = config.keyConsonant;
    const keyVowels = config.keyVowels;

    while (true) {
        // getting the key length
        const keyLength = randrange(minKeyLength, maxKeyLength + 1);
        // generating the key
        let key = "";
        for (let i = 0; i < keyLength; ++i) {
            const charList = (i % 2 === 0) ? keyConsonant : keyVowels;
            key += charList[randrange(charList.length)];
        }
        const qRes = await DB.allAsync(`SELECT COUNT(RoomKey)
                                        FROM Rooms
                                        WHERE RoomKey = ?;`, key);
        if (qRes.rows[0]["COUNT(RoomKey)"] !== 0) {
            continue;
        }
        sendResponse(req, res, {"key": key});
        return;
    }
});

/**
 * Implementation of getRoomInfo function
 * @see API.md
 */
app.get("/getRoomInfo", async function(req, res) {
    const key = req.query.key.toLowerCase(); // The key of the room

    if (key === "") {
        sendResponse(req, res, {"success": false});
        return;
    }

    const qRes = await DB.allAsync(`SELECT *
                                    FROM Games
                                    WHERE GameID =
                                          (SELECT GameID
                                          FROM Rooms
                                          WHERE RoomKey = ?);`, key);
    const rows = qRes.rows;

    // Case of nonexistent room
    if (rows.length === 0) {
        sendResponse(req, res, {"success": true,
            "state": "wait",
            "playerList": [],
            "host": ""});
        return;
    }

    // If something goes wrong
    if (rows.length > 2) {
        console.warn("getRoomInfo: There are 2 or more games in room by the key.")
    }

    const game = rows[0]; // The room
    const players = JSON.parse(game["Players"]); // Players in the game
    switch (game["State"]) {
        case "wait":
        case "play":
            sendResponse(req, res, {"success": true,
                "state": game["State"],
                "playerList": getPlayerList(players), // TODO: Bug that caused by disparity of Web API and DB API.
                "host": game["Host"]});
            break;

        case "end":
            sendResponse(req, res, {"success": true, "state": "end"});
            console.warn("getRoomInfo: Ended game is not removed from the room.")
            break;

        default:
            console.warn("getRoomInfo: Game state is incorrect.")
            console.log(room);
            break;
    }
});

//----------------------------------------------------------

/**
 * Room class
 *
 * Room's info is an object that has fields:
 *     - gameID --- ID of game in the room
 *     - settings --- settings of the room:
 *         - delayTime --- delay for transfer
 *         - explanationTime --- length of explanation
 *         - aftermathTime --- time for guess
 *         - wordNumber --- number of words in game
*      - explCount --- last number of any explanation (from 1 to ...)
 *     - state --- state of the room,
 *     - users --- list of users (User objects)
 *
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
 *     - editWords --- list of words to edit TODO: description of content
 *     - numberOfTurn --- number of turn
 */
class Room {
    constructor(gameID) {
        this.gameID = gameID;
        this.settings = Object.assign({}, config.defaultSettings);
        this.explCount = 0;
        this.state = "wait";
        this.users = [];
    }

    /**
     * Preparing room for the game
     */
    async gamePrepare() {
        // changing state to 'play'
        this.state = "play";

        // generating word list (later key can affect word list)
        this.freshWords = await generateWords(this.settings.wordNumber);

        // preparing storage for explained words
        this.usedWords = {};

        // setting number of turn
        this.numberOfTurn = 0;

        const numberOfPlayers = this.users.length;
        this.speaker = numberOfPlayers - 1;
        this.listener = numberOfPlayers - 2;

        DB.run(`UPDATE Games
               SET Settings = $Settings,
                   WordsList = $WordsList,
                   State = $State,
                   Players = $Players,
                   Host = $Host,
                   StartTime = $StartTime,
                   TimeZoneOffSet = $TimeZoneOffSet
               WHERE GameID = $GameID;`,
            {
                $Settings: JSON.stringify(this.settings),
                $WordsList: JSON.stringify(this.freshWords),
                $State: this.state,
                $Players: JSON.stringify(getPlayerList(this.users)),
                $Host: getHostUsername(this),
                $StartTime: Date.now(),
                $TimeZoneOffSet: JSON.stringify([]), // TODO: implement
                $GameID: this.gameID
            })
        // TODO: Turn on when IDs will be ready
        /*
        this.users.forEach(function (user) {
            if (user.ID) {
                DB.run(`INSERT INTO Participating
                    VALUES ($GameID, $UserID)`,
                    {
                        $GameID: this.gameID,
                        $UserID: user.ID
                    }
                )
            }
        })
        */

        this.roundPrepare()
    }

    /**
     * Preparing room for new round
     */
    roundPrepare() {
        // setting substate to 'wait'
        this.substate = "wait";

        // preparing storage for words to edit
        this.editWords = [];

        // preparing word container
        this.word = "";

        // preparing startTime container
        this.startTime = 0;

        // preparing flags for 'wait'
        this.speakerReady = false;
        this.listenerReady = false;

        // updating number of the turn
        this.numberOfTurn++;

        // preparing 'speaker' and 'listener'
        const numberOfPlayers = this.users.length;
        const nextPair = getNextPair(numberOfPlayers, this.speaker, this.listener);
        this.speaker = nextPair.speaker;
        this.listener = nextPair.listener;
    }
}

/**
 * User class
 *
 * User is an object that has fields:
 *     - username --- no comments,
 *     - ID --- user's ID in the DB
 *     - TODO: login
 *     - sids --- socket ids,
 *     - online --- whether the player is online,
 *     - scoreExplained --- no comments,
 *     - scoreGuessed --- no comments,
 *     - TODO: timeZoneOffset
 */
class User {
    constructor(username, sids, online=true) {
        this.username = username;
        this.ID = null; // TODO: Enable when authorisation will be added.
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
// Checks for socket signals

function checkInputFormat(socket, data, format, signal) {
    if (!checkObject(data, format)) {
        Signals.sFailure(socket.id, signal, 0, "Invalid format");
        return false;
    }
    return true;
}

class CheckConditions {
    static cJoinRoom(socket, data) {
        const key = data.key.toLowerCase(); // key of the room
        const name = (data.username).trim().replace(/\s+/g, ' '); // name of the user

        // If user is not in his own room, it will be an error
        if (getRoom(socket) !== socket.id) {
            Signals.sFailure(socket.id, "cJoinRoom", 100, "You are in room now");
            return false;
        }

        // If key is "" or name is "", it will be an error
        if (key === "") {
            Signals.sFailure(socket.id, "cJoinRoom", 101, "Invalid key of room");
            return false;
        }
        if (name === "") {
            Signals.sFailure(socket.id, "cJoinRoom", 102, "Invalid username");
            return false;
        }

        // if room and users exist, we should check the user
        if (rooms[key] !== undefined) {
            const pos = findFirstPos(rooms[key].users, "username", name);

            // If username is used, it will be an error
            if (pos !== -1 && rooms[key].users[pos].sids.length !== 0) {
                Signals.sFailure(socket.id, "cJoinRoom", 103, "Username is already used");
                return false;
            }

            // If game has started, only logging in can be performed
            if (rooms[key].state === "play" && pos === -1) {
                Signals.sFailure(socket.id, "cJoinRoom", 104, "Game have started, only logging in can be performed");
                return false;
            }
        }

        return true;
    }

    static cLeaveRoom(socket, key) {
        // If user is only in his own room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cLeaveRoom", 200, "You aren't in the room");
            return false;
        }

        // checking if key is valid
        if (!(key in rooms)) {
            // when game ended
            socket.leave(key);
            return false;
        }

        // getting username
        const usernamePos = findFirstSidPos(rooms[key].users, socket.id);
        const username = rooms[key].users[usernamePos].username;

        // if username is ""
        if (username === "") {
            Signals.sFailure(socket.id, "cLeaveRoom", 200, "You aren't in the room");
            return false;
        }
        return true;
    }

    static cStartGame(socket, key) {
        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cStartGame", 300, "Game ended");
            return false;
        }

        // if state isn't 'wait', something went wrong
        if (rooms[key].state !== "wait") {
            Signals.sFailure(socket.id, "cStartGame", 301, "Game have already started");
            return false;
        }

        // checking whether signal owner is host
        const hostPos = findFirstPos(rooms[key].users, "online", true);
        if (hostPos === -1) {
            // very strange case, probably something went wrong, let's log it!
            Signals.sFailure(socket.id, "cStartGame", 302, "Everyone is offline");
            return false;
        }
        if (rooms[key].users[hostPos].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cStartGame", 303, "Only host can start the game");
            return false;
        }

        // Fail if only one user is online
        let cnt = 0
        for (let i = 0; i < rooms[key].users.length; ++i) {
            if (rooms[key].users[i].online) {
                cnt++;
            }
        }
        if (cnt < 2) {
            Signals.sFailure(socket.id,"cStartGame", 302,
                "Not enough online users to start the game (at least two required)");
            return false;
        }
        return true;
    }

    static cSpeakerReady(socket, key) {
        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cSpeakerReady", 400, "Game ended");
            return false;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cSpeakerReady", 401, "Game state isn't 'play'");
            return false;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            Signals.sFailure(socket.id, "cSpeakerReady", 402, "Game substate isn't 'wait'");
            return false;
        }

        // check whether the client is speaker
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cSpeakerReady", 403, "You aren't a speaker");
            return false;
        }

        // check if speaker isn't already ready
        if (rooms[key].speakerReady) {
            Signals.sFailure(socket.id, "cSpeakerReady", 404, "Speaker is already ready");
            return false;
        }
        return true;
    }

    static cListenerReady(socket, key) {
        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cListenerReady", 500, "Game ended");
            return false;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cListenerReady", 501, "Game state isn't 'play'");
            return false;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            Signals.sFailure(socket.id, "cListenerReady", 502, "Game substate isn't 'wait'");
            return false;
        }

        // check whether the client is listener
        if (rooms[key].users[rooms[key].listener].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cListenerReady", 503, "You aren't a listener");
            return false;
        }

        // check if listener isn't already ready
        if (rooms[key].listenerReady) {
            Signals.sFailure(socket.id, "cListenerReady", 504, "Listener is already ready");
            return false;
        }
        return true;
    }

    static cEndWordExplanation(socket, key) {
        // checking if room exists
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cEndWordExplanation", 600, "Game ended");
            return false;
        }

        // checking if proper state and substate
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cEndWordExplanation", 601, "Game state isn't 'play'");
            return false;
        }
        if (rooms[key].substate !== "explanation") {
            Signals.sFailure(socket.id, "cEndWordExplanation", 602, "Game substate isn't 'explanation'");
            return false;
        }

        // checking if speaker send this
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cEndWordExplanation", 603, "You aren't a speaker");
            return false;
        }

        // checking if time is correct
        if (Date.now() < rooms[key].startTime) {
            Signals.sFailure(socket.id, "cEndWordExplanation", 604, "Too early");
            return false;
        }
        return true;
    }

    static cWordsEdited(socket, key, editWords) {
        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cWordsEdited", 700, "Game ended");
            return false;
        }

        // check if game state is 'edit'
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cWordsEdited", 701, "Game state isn't 'play'")
            return false;
        }

        // check if game substate is 'edit'
        if (rooms[key].substate !== "edit") {
            Signals.sFailure(socket.id, "cWordsEdited", 702, "Game substate isn't 'edit'")
            return false;
        }

        // check if speaker send this signal
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cWordsEdited", 703, "Only speaker can send this signal");
            return false;
        }

        // comparing the length of serer editWords and client editWords
        if (editWords.length !== rooms[key].editWords.length) {
            Signals.sFailure(socket.id, "cWordsEdited", 704, "Incorrect number of words");
            return false;
        }
        return true;
    }
}

class Callbacks {
    static async joinRoomCallback(socket, data, err) {
        const key = data.key.toLowerCase(); // key of the room
        const name = data.username.trim().replace(/\s+/g, ' '); // name of the user

        // If any error happened
        if (err) {
            Signals.sFailure(socket.id, "сJoinRoom", 105, "Failed to join the room");
            return;
        }

        // If user haven't joined the room
        if (getRoom(socket) !== key) {
            Signals.sFailure(socket.id, "сJoinRoom", 105, "Failed to join the room");
            return;
        }

        // If room isn't saved in main dictionary, let's save it and create info about it
        let gameID = -1;
        if (!(key in rooms)) {
            // TODO: Возможны проблемы с асинхронностью.
            const resp = await DB.runAsync(`INSERT INTO Games DEFAULT VALUES;`);
            gameID = resp.lastID;
            rooms[key] = new Room(gameID)
            DB.run(`INSERT INTO Rooms
                        VALUES ($RoomKey, $GameID)`,
                {
                    $RoomKey: key,
                    $GameID: gameID
                })
        } else {
            gameID = rooms[key].gameID;
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

        // updating players and host
        await DB.runAsync(`UPDATE Games
                           SET Players = $Players,
                               Host = $Host
                           WHERE GameID = $GameID;`,
            {
                $Players: JSON.stringify(getPlayerList(rooms[key].users)),
                $Host: getHostUsername(rooms[key].users),
                $GameID: gameID
            });

        Signals.sPlayerJoined(key, rooms[key], name);

        Signals.sYouJoined(socket.id, key);
    }

    static async leaveRoomCallback(socket, key, err) {
        const usernamePos = findFirstSidPos(rooms[key].users, socket.id);
        const username = rooms[key].users[usernamePos].username;

        // If any error happened
        if (err) {
            Signals.sFailure(socket.id, "cLeaveRoom", 201, "Failed to leave the room");
            return;
        }

        // Removing the user from the room info
        rooms[key].users[usernamePos].online = false;
        rooms[key].users[usernamePos].sids = [];

        // updating players and host
        const resp = await DB.allAsync(`SELECT GameID
                                        FROM Rooms
                                        WHERE RoomKey = ?;`, key);
        if (resp.rows.length !== 1) {
            console.log("Incorrect number of rows!");
        }
        const gameID = resp.rows[0];
        await DB.runAsync(`UPDATE Games
                           SET Players = $Players,
                               Host = $Host
                           WHERE GameID = $GameID;`,
            {
                $Players: JSON.stringify(getPlayerList(rooms[key].users)),
                $Host: getHostUsername(rooms[key].users),
                $GameID: gameID
            });

        Signals.sPlayerLeft(key, rooms[key], username);
    }

    static async cStartGame(socket, key) {
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

        await rooms[key].gamePrepare();

        Signals.sGameStarted(key);

        console.log(rooms[key].freshWords); // TODO: What is this? Why is this?
    }

    static cEndWordExplanation(socket, key, cause) {
        switch (cause) {
            case "explained":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "explained",
                    "transfer": true});

                // removing the word from the 'word' container
                rooms[key].word = "";

                Signals.sWordExplanationEnded(key, cause);

                // checking the time
                if (Date.now() > rooms[key].startTime + rooms[key].settings.explanationTime) {
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

                Signals.sWordExplanationEnded(key, cause);

                // finishing the explanation
                finishExplanation(key);
                return;
            case "notExplained":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "notExplained",
                    "transfer": true});

                Signals.sWordExplanationEnded(key, cause);

                // finishing the explanation
                finishExplanation(key);
                return;
        }
    }

    static cWordsEdited(socket, key, editWords) {
        // applying changes and counting success explanations
        let cnt = 0;
        for (let i = 0; i < editWords.length; ++i) {
            let word = rooms[key].editWords[i];
            
            // checking matching of information
            if (word.word !== editWords[i].word) {
                Signals.sFailure(socket.id, "cWordsEdited", 704, `Incorrect word at position ${i}`);
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

            DB.run(`INSERT INTO ExplanationRecords(
                               GameID,
                               ExplNo,
                               Speaker,
                               SpeakerID,
                               Listener,
                               ListenerID,
                               Word,
                               Time,
                               ExtraTime,
                               Outcome
                    )
                    VALUES ($GameID,
                            $ExplNo,
                            $Speaker,
                            $SpeakerID,
                            $Listener,
                            $ListenerID,
                            $Word,
                            $Time,
                            $ExtraTime,
                            $Outcome);`,
                {
                    $GameID: rooms[key].gameID,
                    $ExplNo: ++ (rooms[key].explCount),
                    $Speaker: rooms[key].users[rooms[key].speaker].username,
                    $SpeakerID: rooms[key].users[rooms[key].speaker].ID,
                    $Listener: rooms[key].users[rooms[key].listener].username,
                    $ListenerID: rooms[key].users[rooms[key].listener].ID,
                    $Word: word.word,
                    $Time: 0, // TODO: implement
                    $ExtraTime: 0, // TODO: implement
                    $Outcome: editWords[i].wordState
                })
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
                    randrange(rooms[key].freshWords.length),
                    0, rooms[key].editWords[i].word);
            }
        }

        // if no words left it's time to finish the game
        if (rooms[key].freshWords.length === 0) {
            endGame(key);
            return;
        }

        rooms[key].roundPrepare();

        Signals.sNextTurn(key, words);
    }

    static disconnect(socket) {
        /**
         * room key can't be accessed via getRoom(socket)
         * findFirstSidPos must be used instead
         */

        let key = [];
        let username = [];
        let usernamePos = [];
        const keys = Object.keys(rooms);
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
            const _key = key[i];
            const _username = username[i];
            const _usernamePos = usernamePos[i];
            
            // Removing the user from the room info
            rooms[_key].users[_usernamePos].online = false;
            rooms[_key].users[_usernamePos].sids = [];

            Signals.sPlayerLeft(_key, rooms[_key], _username);
        }
    }
}

//----------------------------------------------------------
// Socket.IO functions

io.on("connection", function(socket) {
    if (WRITE_LOGS) {
        console.log(socket.id, "connection", undefined);
    }

    /**
     * Implementation of cJoinRoom function
     * @see API.md
     */
    socket.on("cJoinRoom", function(data) {
        if (WRITE_LOGS) {
            console.log(socket.id, "cJoinRoom", data);
        }

        // Checking input format
        if (!checkInputFormat(socket, data, {"key": "string", "username": "string"}, "cJoinRoom")) {
            return;
        }

        // Checking signal conditions
        if (!CheckConditions.cJoinRoom(socket, data)) {
            return;
        }

        // Adding the user to the room
        socket.join(data.key.toLowerCase(), (err) => Callbacks.joinRoomCallback(socket, data, err));
    });

    /**
     * Implementation of cLeaveRoom function
     * @see API.md
     */
    socket.on("cLeaveRoom", function() {
        if (WRITE_LOGS) {
            console.log(socket.id, "cLeaveRoom", undefined);
        }

        const key = getRoom(socket); // key of the room

        // Checking signal conditions
        if (!CheckConditions.cLeaveRoom(socket, key)) {
            return;
        }

        // Removing the user from the room
        socket.leave(key, (err) => Callbacks.leaveRoomCallback(socket, key, err));
    });

    /**
     * Implementation of cStartGame function
     * @see API.md
     */
    socket.on("cStartGame", async function() {
        if (WRITE_LOGS) {
            console.log(socket.id, "cStartGame", undefined);
        }
        const key = getRoom(socket); // key of the room

        // checking signal conditions
        if (!CheckConditions.cStartGame(socket, key)) {
            return;
        }

        await Callbacks.cStartGame(socket, key);
    });

    /**
     * Implementation of cSpeakerReady function
     * @see API.md
     */
    socket.on("cSpeakerReady", function() {
        if (WRITE_LOGS) {
            console.log(socket.id, "cSpeakerReady", undefined);
        }

        const key = getRoom(socket); // key of room

        if (!CheckConditions.cSpeakerReady(socket, key)) {
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
        if (WRITE_LOGS) {
            console.log(socket.id, "cListenerReady", undefined);
        }

        const key = getRoom(socket); // key of room

        if (!CheckConditions.cListenerReady(socket, key)) {
            return;
        }

        // setting flag for listener
        rooms[key].listenerReady = true;

        // if speaker is ready --- let's start!
        if (rooms[key].speakerReady) {
            startExplanation(key);
        }
    });
    
    /**
     * Implementation of cEndWordExplanation function
     * @see API.md
     */
    socket.on("cEndWordExplanation", function(data) {
        if (WRITE_LOGS) {
            console.log(socket.id, "cEndWordExplanation", data);
        }

        const key = getRoom(socket); // key of the room

        // checking input format
        if (!checkInputFormat(socket, data, {"cause": "string"}, "cEndWordExplanation")) {
            return;
        }

        // check signal conditions
        if (!CheckConditions.cEndWordExplanation(socket, key)) {
            return;
        }

        Callbacks.cEndWordExplanation(socket, key, data.cause);
    });

    /**
     * Implementation of cWordsEdited function
     * @see API.md
     */
    socket.on("cWordsEdited", function(data) {
        if (WRITE_LOGS) {
            console.log(socket.id, "cWordsEdited", data)
        }

        const key = getRoom(socket); // key of the room

        // checking input format
        if (!checkInputFormat(socket, data, {"editWords": "object"}, "cWordsEdited")) {
            return;
        }

        // checking signal conditions
        if (!CheckConditions.cWordsEdited(socket, key, data.editWords)) {
            return;
        }

        Callbacks.cWordsEdited(socket, key, data.editWords);
    });

    socket.on("disconnect", function() {
        if (WRITE_LOGS) {
            console.log(socket.id, "disconnect", undefined);
        }

        Callbacks.disconnect(socket)
    });
});
