#!/usr/bin/node

"use strict"

const fetch = require("@lounres/flex_node_fetch").fetch;

const config = require("./config.json");
const version = require("./version.json");

const mapOutcome = config.mapOutcome;

const argv = require("yargs")
    .option('pidfile', {
        default: config.serverPIDPath
    })
    .argv;

const PORT = config.port;
const WRITE_LOGS = (config.env === config.DEVEL) ? false : true;
const TRANSFER_TIME = config.transferTime; // delay for transfer

const dictsConf = config.dicts;
let _dicts = [];
for (let i = 0; i < dictsConf.length; ++i) {
    let dict = {};
    dict["words"] = require(dictsConf[i].path).words;
    dict["name"] = dictsConf[i].name;
    dict["wordNumber"] = dict.words.length;
    _dicts.push(dict);
}
const dicts = _dicts;

const settingsRange = config.settingsRange;

const fs = require("fs");
fs.writeFile(argv.pidfile, process.pid.toString(), function(err, data) {
    if (err) {
        console.log(err);
    }
});

const express = require("express");
const app = express();
const server = new (require("http").Server)(app);
const io = require("socket.io")(server);

server.listen(PORT);
console.log("Listening on port " + PORT);

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
 * Generate free key
 *
 * @return free key (random one)
 */
function genFreeKey() {
    // getting the settings
    const minKeyLength = config.minKeyLength;
    const maxKeyLength = config.maxKeyLength;
    const keyConsonant = config.keyConsonant;
    const keyVowels = config.keyVowels;
    // getting the key length
    const keyLength = randrange(minKeyLength, maxKeyLength + 1);
    // generating the key
    let key = "";
    for (let i = 0; i < keyLength; ++i) {
        const charList = (i % 2 === 0) ? keyConsonant : keyVowels;
        key += charList[randrange(charList.length)];
    }
    return key;
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
 * Rerurns random number from interval [a, b)
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
 * Generate word list
 *
 * @param settings settings of the room
 * @return list of words
 */
function generateWords(settings) {
    let words = [];
    let used = {};
    let dict = dicts[settings.dictionaryId];
    const numberOfAllWords = dict.wordNumber;
    const wordNumber = ("wordNumber" in settings) ? settings["wordNumber"] : numberOfAllWords;
    while (words.length < wordNumber) {
        const pos = randrange(numberOfAllWords);
        if (!(pos in used)) {
            used[pos] = true;
            words.push(dict.words[pos]);
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
 * Get timetable for N turns
 *
 * @param key key of the room
 * @return array of speaker and listeners' names
 */
function getTimetable(key) {
    let timetable = [];
    let obj = {};
    obj.speaker = rooms[key].speaker;
    obj.listener = rooms[key].listener;
    for (let i = 0; i < config.timetableDepth; ++i) {
        timetable.push({
            "speaker": rooms[key].users[obj.speaker].username,
            "listener": rooms[key].users[obj.listener].username
        });
        obj = getNextPair(rooms[key].users.length, obj.speaker, obj.listener);
    }
    return timetable;
}

/**
 * Start an explanation
 *
 * @param key --- key of the room
 */
function startExplanation(key) {
    rooms[key].substate = "explanation";
    const currentTime = (new Date()).getTime();
    rooms[key].startTime = currentTime + (rooms[key].settings.delayTime + TRANSFER_TIME);
    rooms[key].word = rooms[key].freshWords.pop();

    if (rooms[key].settings.strictMode) {
        const numberOfTurn = rooms[key].numberOfTurn;
        setTimeout(function() {
            // if explanation hasn't finished yet
            if (!( key in rooms)) {
                return;
            }
            if (rooms[key].numberOfTurn === numberOfTurn) {
                finishExplanation(key);
            }
        }, (rooms[key].settings.delayTime + rooms[key].settings.explanationTime + rooms[key].settings.aftermathTime + TRANSFER_TIME));
    }
    setTimeout(() => Signals.sNewWord(key), TRANSFER_TIME);
    rooms[key].explStartMainTime = rooms[key].startTime;
    rooms[key].explStartExtraTime = rooms[key].startTime + rooms[key].settings.explanationTime;
    rooms[key].explanationRecords.push([]);
    Signals.sExplanationStarted(key);
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

    if (rooms[key].word !== "") {
        rooms[key].editWords.push({
            "word": rooms[key].word,
            "wordState": "notExplained",
            "transfer": true
        });
        const currentTime = (new Date()).getTime()
        rooms[key].explanationRecords[rooms[key].explanationRecords.length - 1].push({
            "from": rooms[key].speaker,
            "to": rooms[key].listener,
            "word": rooms[key].word,
            "time": currentTime - rooms[key].explStartMainTime,
            "extra_time": (currentTime >= rooms[key].explStartExtraTime) ? currentTime - rooms[key].explStartExtraTime : 0
        });
    }

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
    // recording time
    rooms[key].end_timestamp = (new Date()).getTime();

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

    // preparing key for next game
    const nextKey = genFreeKey();

    // copying users and settings to next room
    rooms[nextKey] = new Room();
    rooms[nextKey].settings = Object.assign({}, rooms[key].settings);
    rooms[nextKey].users = rooms[key].users;
    for (let i = 0; i < rooms[nextKey].users.length; ++i) {
        rooms[nextKey].users[i].sids = [];
        rooms[nextKey].users[i].online = false;
    }

    Signals.sGameEnded(key, results, nextKey);

    // sending statistics
    sendStat(Object.assign({}, rooms[key]));

    // removing room
    delete rooms[key];

    // removing users from room
    io.sockets.in(key).clients(function(err, clients) {
        clients.forEach(function(sid) {
            let socket = io.sockets.connected[sid];
            socket.leave(key);
        });
    });
}

/**
 * Send statistics
 *
 * @param room --- room object
 */
function sendStat(room) {
    let sendObject = {};
    sendObject.version = config.protocolVersion;
    sendObject.app = {
        "name": config.appName,
        "version": version.version
    };
    sendObject.mode = config.mode;
    sendObject.start_timestamp = room.start_timestamp;
    sendObject.end_timestamp = room.end_timestamp;
    sendObject.player_time_zone_offsets = room.users.map(el => el.time_zone_offset);
    sendObject.attempts = [];
    for (let i = 0; i < room.explanationRecords.length; ++i) {
        for (let j = 0; j < room.explanationRecords[i].length; ++j) {
            room.explanationRecords[i][j].time -= room.explanationRecords[i][j].extra_time;
            sendObject.attempts.push(room.explanationRecords[i][j]);
        }
    }
    
    // sending data
    console.log("Send:");
    console.log(sendObject);
    try {
        fetch(Object.assign({}, config.statSendConfig, {"data": sendObject}));
    } catch (err) {
        console.warn(err);
    }
}

//----------------------------------------------------------

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
        const pos = findFirstSidPos(room.users, sid);
        if (pos === -1) return;
        const name = room.users[pos].username;
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
                joinObj.timetable = getTimetable(key);
                if (room.settings.termCondition === "words") {
                    joinObj.wordsLeft = room.freshWords.length;
                } else if (room.settings.termCondition === "turns") {
                    joinObj.turnsLeft = room.settings.turnNumber - room.numberOfTurn;
                } else {
                    console.warn("Incorrect value of room's termCondition: " + JSON.stringify(room.settings.termCondition));
                }
                switch (room.substate) {
                    case "wait":
                        joinObj.substate = "wait";
                        break;
                    case "explanation":
                        joinObj.substate = "explanation";
                        joinObj.startTime = room.startTime;
                        if (room.settings.termCondition === "words") {
                            joinObj.wordsLeft++;
                        }
                        if (joinObj.speaker === name) {
                            joinObj.word = room.word;
                        }
                        break;
                    case "edit":
                        joinObj.substate = "edit";
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
     * Implementation of sNewSettings signal
     * @see API.md
     *
     * @param key Key of the Room
     */
    static sNewSettings(key) {
        Signals.emit(key, "sNewSettings", {"settings": rooms[key].settings});
    }

    /**
     * Implementation of sFailure signal
     * @see API.md
     *
     *
     * @param sid Id of socket to emit
     * @param request Request that is failed
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
        let leftObj = {};
        if (rooms[key].settings.termCondition === "words") {
            leftObj = {
                "wordsLeft": rooms[key].freshWords.length
            };
        } else if (rooms[key].settings.termCondition === "turns") {
            leftObj = {
                "turnsLeft": rooms[key].settings.turnNumber - rooms[key].numberOfTurn
            };
        } else {
            console.warn("Incorrect value of room's termCondition: " + JSON.stringify(room.settings.termCondition));
        }
        Signals.emit(key, "sGameStarted", Object.assign({
            "timetable": getTimetable(key)
        }, leftObj));
    }

    /**
     * Implementation of sNextTurn signal
     * @see API.md
     *
     * @param key Key of the room
     * @param words Words' statistic
     */
    static sNextTurn(key, words) {
        let leftObj = {};
        if (rooms[key].settings.termCondition === "words") {
            leftObj = {
                "wordsLeft": rooms[key].freshWords.length
            };
        } else if (rooms[key].settings.termCondition === "turns") {
            leftObj = {
                "turnsLeft": rooms[key].settings.turnNumber - rooms[key].numberOfTurn
            };
        } else {
            console.warn("Incorrect value of room's termCondition: " + JSON.stringify(room.settings.termCondition));
        }
        Signals.emit(key, "sNextTurn", Object.assign({
            "timetable": getTimetable(key),
            "words": words
        }, leftObj));
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
        let leftObj = {};
        if (rooms[key].settings.termCondition === "words") {
            leftObj = {
                "wordsLeft": rooms[key].freshWords.length +
                ((rooms[key].editWords[rooms[key].editWords.length - 1].wordState === "notExplained") ? 1 : 0)
            };
        } else if (rooms[key].settings.termCondition === "turns") {
            leftObj = {};
        } else {
            console.warn("Incorrect value of room's termCondition: " + JSON.stringify(room.settings.termCondition));
        }
        Signals.emit(key, "sWordExplanationEnded", Object.assign({
            "cause": cause
        }, leftObj));
    }

    /**
     * Implementation of sExplanationEnded signal
     * @see API.md
     *
     * @param key Key of the room
     */
    static sExplanationEnded(key) {
        let leftObj = {};
        if (rooms[key].settings.termCondition === "words") {
            leftObj = {
                "wordsLeft": rooms[key].freshWords.length +
                ((rooms[key].editWords[rooms[key].editWords.length - 1].wordState === "notExplained") ? 1 : 0)
            };
        } else if (rooms[key].settings.termCondition === "turns") {
            leftObj = {};
        } else {
            console.warn("Incorrect value of room's termCondition: " + JSON.stringify(room.settings.termCondition));
        }
        Signals.emit(key, "sExplanationEnded", leftObj);
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
     * @param nextKey key of next game
     */
    static sGameEnded(key, results, nextKey) {
        Signals.emit(key, "sGameEnded", {"results": results, "nextKey": nextKey});
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
 * Implementation of getDictionaryList function
 * @see API.md
 */
app.get("/getDictionaryList", function(req, res) {
    // preparing data
    let dictionaries = [];
    for (let i = 0; i < dicts.length; ++i) {
        dictionaries.push({
            "name": dicts[i].name,
            "wordNumber": dicts[i].wordNumber
        });
    }

    sendResponse(req, res, {"dictionaries": dictionaries});
});

/**
 * Implementation of getFreeKey function
 * @see API.md
 */
app.get("/getFreeKey", function(req, res) {
    const key = genFreeKey();
    sendResponse(req, res, {"key": key});
});

/**
 * Implementation of getRoomInfo function
 * @see API.md
 */
app.get("/getRoomInfo", function(req, res) {
    if (!("key" in req.query)) {
        sendResponse(req, res, {"success": false});
        return;
    }

    const key = req.query.key.toLowerCase().replace(/\s+/g, ""); // The key of the room

    if (key === "") {
        sendResponse(req, res, {"success": false});
        return;
    }

    // Case of nonexistent room
    if (!(key in rooms)) {
        sendResponse(req, res, {"success": true,
                  "state": "wait",
                  "playerList": [],
                  "settings": config.defaultSettings,
                  "host": ""});
        return;
    }

    const room = rooms[key]; // The room
    switch (room.state) {
        case "wait":
        case "play":
            sendResponse(req, res, {"success": true,
                      "state": room.state,
                      "playerList": getPlayerList(room.users),
                      "settings": room.settings,
                      "host": getHostUsername(room.users)});
            break;

        case "end":
            // TODO Implement
            sendResponse(req, res, {"success": true, "state": "end"});
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
 *     - settings --- room settings
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
 *     - explanationRecords --- array with explanation records (see https://sombreroapi.docs.apiary.io/#reference/1/gamelog for more info, but `time` is `time` plus `extra_time`)
 *     - start_timestamp --- start timestamp
 *     - end_timestamp --- end timestamp
 *     - explStartMainTime --- start timestamp of word explanation
 *     - explStartExtraTime --- start timestamp of extra time
 */
class Room {
    constructor() {
        this.state = "wait";
        this.users = [];
        this.settings = Object.assign({}, config.defaultSettings);
    }

    /**
     * Preparing room for the game
     */
    gamePrepare() {
        // changing state to 'play'
        this.state = "play";

        // generating word list
        this.freshWords = generateWords(this.settings);

        // preparing storage for explained words
        this.usedWords = {};

        // setting number of turn
        this.numberOfTurn = -1;

        const numberOfPlayers = this.users.length;
        this.speaker = numberOfPlayers - 1;
        this.listener = numberOfPlayers - 2;
        this.explanationRecords = [];

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
 *     - sids --- socket ids,
 *     - online --- whether the player is online,
 *     - scoreExplained --- no comments,
 *     - scoreGuessed --- no comments,
 *     - time_zone_offset --- no comments,
 */
class User {
    constructor(username, sids, time_zone_offset, online=true) {
        this.username = username;
        this.sids = sids;
        this.online = online;
        this.scoreExplained = 0;
        this.scoreGuessed = 0;
        this.time_zone_offset = time_zone_offset;
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
        Signals.sFailure(socket.id, signal, 0, "Неверный формат данных");
        return false;
    }
    return true;
}

class CheckConditions {
    static cJoinRoom(socket, data) {
        const key = data.key.toLowerCase().replace(/\s+/g, ""); // key of the room
        const name = (data.username).trim().replace(/\s+/g, ' '); // name of the user

        // If user is not in his own room, it will be an error
        if (getRoom(socket) !== socket.id) {
            Signals.sFailure(socket.id, "cJoinRoom", 100, "Вы уже находитесь в комнате");
            return false;
        }

        // If key is "" or name is "", it will be an error
        if (key === "") {
            Signals.sFailure(socket.id, "cJoinRoom", 101, "Неверный ключ комнаты");
            return false;
        }
        if (name === "") {
            Signals.sFailure(socket.id, "cJoinRoom", 102, "Неверное имя игрока");
            return false;
        }

        // if room and users exist, we should check the user
        if (rooms[key] !== undefined) {
            const pos = findFirstPos(rooms[key].users, "username", name);

            // If username is used, it will be an error
            if (pos !== -1 && rooms[key].users[pos].sids.length !== 0) {
                Signals.sFailure(socket.id, "cJoinRoom", 103, "Это имя уже использовано");
                return false;
            }

            // If game has started, only logging in can be performed
            if (rooms[key].state === "play" && pos === -1) {
                Signals.sFailure(socket.id, "cJoinRoom", 104, "Игра уже идёт, возможен только вход");
                return false;
            }
        }

        return true;
    }

    static cLeaveRoom(socket, key) {
        // If user is only in his own room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cLeaveRoom", 200, "Вы не в комнате");
            return false;
        }

        // checking if key is valid
        if (!(key in rooms)) {
            // when game ended
            socket.leave(key);
            return false;
        }

        // Getting username position
        const usernamePos = findFirstSidPos(rooms[key].users, socket.id);

        // if username position is -1
        if (usernamePos === -1) {
            Signals.sFailure(socket.id, "cLeaveRoom", 200, "Вы не в комнате");
            return false;
        }

        return true;
    }

    static cApplySettings(socket, key, settings) {
        // Checking if user is not in the room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cApplySettings", null, "Вы не в комнате");
            return false;
        }

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cApplySettings", null, "Игра закончена");
            return false;
        }

        // if state isn't 'wait', something went wrong
        if (rooms[key].state !== "wait") {
            Signals.sFailure(socket.id, "cApplySettings", null, "Игра уже начата");
            return false;
        }

        // checking whether signal owner is host
        const hostPos = findFirstPos(rooms[key].users, "online", true);
        if (hostPos === -1) {
            // very strange case, probably something went wrong, let's log it!
            Signals.sFailure(socket.id, "cApplySettings", null, "Все оффлайн");
            return false;
        }
        if (rooms[key].users[hostPos].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cApplySettings", null, "Только хост может изменить настройки");
            return false;
        }

        return true;
    }

    static cStartGame(socket, key) {
        // Checking if user is not in the room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cStartGame", 304, "Вы не в комнате");
            return false;
        }

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cStartGame", 300, "Игра закончена");
            return false;
        }

        // if state isn't 'wait', something went wrong
        if (rooms[key].state !== "wait") {
            Signals.sFailure(socket.id, "cStartGame", 301, "Игра уже начата");
            return false;
        }

        // checking whether signal owner is host
        const hostPos = findFirstPos(rooms[key].users, "online", true);
        if (hostPos === -1) {
            // very strange case, probably something went wrong, let's log it!
            Signals.sFailure(socket.id, "cStartGame", 302, "Все оффлайн");
            return false;
        }
        if (rooms[key].users[hostPos].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cStartGame", 303, "Только хост может начать игру");
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
                "Недостаточно игроков онлайн в комнате, чтобы начать игру (необходимо хотя бы два)");
            return false;
        }
        return true;
    }

    static cSpeakerReady(socket, key) {
        // Checking if user is not in the room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cSpeakerReady", 405, "Вы не в комнате");
            return false;
        }

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cSpeakerReady", 400, "Игра закончена");
            return false;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cSpeakerReady", 401, "Состояние игры - не 'play'");
            return false;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            Signals.sFailure(socket.id, "cSpeakerReady", 402, "Подсостояние игры - не 'wait'");
            return false;
        }

        // check whether the client is speaker
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cSpeakerReady", 403, "Вы не объясняющий");
            return false;
        }

        // check if speaker isn't already ready
        if (rooms[key].speakerReady) {
            Signals.sFailure(socket.id, "cSpeakerReady", 404, "Объясняющий уже и так готов");
            return false;
        }
        return true;
    }

    static cListenerReady(socket, key) {
        // Checking if user is not in the room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cListenerReady", 505, "Вы не в комнате");
            return false;
        }

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cListenerReady", 500, "Игра закончена");
            return false;
        }

        // the game must be in 'play' state
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cListenerReady", 501, "Состояние игры - не 'play'");
            return false;
        }

        // the game substate must be 'wait'
        if (rooms[key].substate !== "wait") {
            Signals.sFailure(socket.id, "cListenerReady", 502, "Подсостояние игры - не 'wait'");
            return false;
        }

        // check whether the client is listener
        if (rooms[key].users[rooms[key].listener].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cListenerReady", 503, "Вы не отгадывающий");
            return false;
        }

        // check if listener isn't already ready
        if (rooms[key].listenerReady) {
            Signals.sFailure(socket.id, "cListenerReady", 504, "Отгадывающий уже и так готов");
            return false;
        }
        return true;
    }

    static cEndWordExplanation(socket, key) {
        // Checking if user is not in the room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cEndWordExplanation", 605, "Вы не в комнате");
            return false;
        }

        // checking if room exists
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cEndWordExplanation", 600, "Игра закончена");
            return false;
        }

        // checking if proper state and substate
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cEndWordExplanation", 601, "Состояние игры - не 'play'");
            return false;
        }
        if (rooms[key].substate !== "explanation") {
            Signals.sFailure(socket.id, "cEndWordExplanation", 602, "Подсостояние игры - не 'explanation'");
            return false;
        }

        // checking if speaker send this
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cEndWordExplanation", 603, "Вы не объясняющий");
            return false;
        }

        // checking if time is correct
        if ((new Date).getTime() < rooms[key].startTime) {
            Signals.sFailure(socket.id, "cEndWordExplanation", 604, "Слишком рано");
            return false;
        }
        return true;
    }

    static cWordsEdited(socket, key, editWords) {
        // Checking if user is not in the room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cWordsEdited", 705, "Вы не в комнате");
            return false;
        }

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cWordsEdited", 700, "Игра закончена");
            return false;
        }

        // check if game state is 'edit'
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cWordsEdited", 701, "Состояние игры - не 'play'")
            return false;
        }

        // check if game substate is 'edit'
        if (rooms[key].substate !== "edit") {
            Signals.sFailure(socket.id, "cWordsEdited", 702, "Подсостояние игры - не 'edit'")
            return false;
        }

        // check if speaker send this signal
        if (rooms[key].users[rooms[key].speaker].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cWordsEdited", 703, "Только объясняющий может посылать этот сигнал");
            return false;
        }

        // comparing the length of serer editWords and client editWords
        if (editWords.length !== rooms[key].editWords.length) {
            Signals.sFailure(socket.id, "cWordsEdited", 704, "Неправильное количество слов");
            return false;
        }
        return true;
    }

    static cEndGame(socket, key) {
        // Checking if user is not in the room
        if (key === socket.id) {
            Signals.sFailure(socket.id, "cEndGame", null, "Вы не в комнате");
            return false;
        }

        // if game ended
        if (!(key in rooms)) {
            Signals.sFailure(socket.id, "cEndGame", null, "Игра закончена");
            return false;
        }

        // if state isn't 'play', something went wrong
        if (rooms[key].state !== "play") {
            Signals.sFailure(socket.id, "cEndGame", null, "Состояние игры не `play`");
            return false;
        }

        // works only in substate 'wait'
        if (rooms[key].substate !== "wait") {
            Signals.sFailure(socket.id, "cEndGame", null, "Подсостояние игры не `wait`");
            return false;
        }

        // checking whether signal owner is host
        const hostPos = findFirstPos(rooms[key].users, "online", true);
        if (hostPos === -1) {
            // very strange case, probably something went wrong, let's log it!
            Signals.sFailure(socket.id, "cEndGame", null, "Все оффлайн");
            return false;
        }
        if (rooms[key].users[hostPos].sids[0] !== socket.id) {
            Signals.sFailure(socket.id, "cEndGame", null, "Только хост может закончить игру");
            return false;
        }

        return true;
    }
}

class Callbacks {
    static joinRoomCallback(socket, data, err) {
        const key = data.key.toLowerCase().replace(/\s+/g, ""); // key of the room
        const name = data.username.trim().replace(/\s+/g, ' '); // name of the user
        const time_zone_offset = data.time_zone_offset;

        // If any error happened
        if (err) {
            Signals.sFailure(socket.id, "сJoinRoom", 105, "Не получилось войти в комнату");
            return;
        }

        // If user haven't joined the room
        if (getRoom(socket) !== key) {
            Signals.sFailure(socket.id, "сJoinRoom", 105, "Не получилось войти в комнату");
            return;
        }

        // If room isn't saved in main dictionary, let's save it and create info about it
        if (!(key in rooms)) {
            rooms[key] = new Room()
        }

        // Adding the user to the room info
        const pos = findFirstPos(rooms[key].users, "username", name);
        if (pos === -1) {
            // creating new one
            rooms[key].users.push(new User(name, [socket.id], time_zone_offset));
        } else {
            // logging in user
            rooms[key].users[pos].sids = [socket.id];
            rooms[key].users[pos].online = true;
        }

        Signals.sPlayerJoined(key, rooms[key], name);

        Signals.sYouJoined(socket.id, key);
    }

    static leaveRoomCallback(socket, key, err) {
        const usernamePos = findFirstSidPos(rooms[key].users, socket.id);
        if (usernamePos === -1) return;
        const username = rooms[key].users[usernamePos].username;

        // If any error happened
        if (err) {
            Signals.sFailure(socket.id, "cLeaveRoom", 201, "Не получилось выйти из комнаты");
            return;
        }

        // Removing the user from the room info
        rooms[key].users[usernamePos].online = false;
        rooms[key].users[usernamePos].sids = [];

        Signals.sPlayerLeft(key, rooms[key], username);
    }

    static cApplySettings(socket, key, settings) {
        // special case: "dictionaryId" (it changes ranges for other settings)
        let warnWordsDecrease = false;
        let warnTurnDefault = false;
        let warnWordsDefault = false;
        if ("termCondition" in settings) {
            if (typeof(rooms[key].settings["termCondition"]) !== typeof(settings["termCondition"])) {
                Signals.sFailure(socket.id, "cApplySettings", null,
                    "Неверный тип поля настроек termCondition: " +
                    typeof(settings["termCondition"]) + " вместо " +
                    typeof(rooms[key].settings["termCondition"]) + ", пропускаю");
            } else {
                if (!(settings["termCondition"] in {"words": null, "turns": null})) {
                    Signals.sFailure(socket.id, "cApplySettings", null, "Неверное значение termCondition");
                } else {
                    rooms[key].settings["termCondition"] = settings["termCondition"];
                    if (rooms[key].settings["termCondition"] === "words") {
                        rooms[key].settings["wordNumber"] = config.defaultWordNumber;
                        if ("turnNumber" in rooms[key].settings) {
                            delete rooms[key].settings["turnNumber"];
                        }
                        warnWordsDefault = true;
                    } else if (rooms[key].settings["termCondition"] === "turns") {
                        rooms[key].settings["turnNumber"] = config.defaultTurnNumber;
                        if ("wordNumber" in rooms[key].settings) {
                            delete rooms[key].settings["wordNumber"];
                        }
                        warnTurnDefault = true;
                    }
                }
            }
        }
        if ("dictionaryId" in settings) {
            if (typeof(rooms[key].settings["dictionaryId"]) !== typeof(settings["dictionaryId"])) {
                Signals.sFailure(socket.id, "cApplySettings", null,
                    "Неверный тип поля настроек dictionaryId: " +
                    typeof(settings["dictionaryId"]) + " вместо " +
                    typeof(rooms[key].settings["dictionaryId"]) + ", пропускаю");
            } else {
                if (settings["dictionaryId"] < 0 || settings["dictionaryId"] >= dicts.length) {
                    Signals.sFailure(socket.id, "cApplySettings", null, "Неверное значение dictionaryId");
                } else {
                    rooms[key].settings["dictionaryId"] = settings["dictionaryId"];
                    if (rooms[key].settings["wordNumber"] > dicts[rooms[key].settings["dictionaryId"]].wordNumber) {
                        rooms[key].settings["wordNumber"] = dicts[rooms[key].settings["dictionaryId"]].wordNumber;
                        warnWordsDecrease = true;
                    }
                }
            }
        }

        // setting settings
        const settingsKeys = Object.keys(settings);
        for (let i = 0; i < settingsKeys.length; ++i) {
            if (settingsKeys[i] === "dictionaryId") continue; // already done
            if (settingsKeys[i] === "termCondition") continue; // already done

            if (settingsKeys[i] in rooms[key].settings) {
                if (typeof(rooms[key].settings[settingsKeys[i]]) !== typeof(settings[settingsKeys[i]])) {
                    Signals.sFailure(socket.id, "cApplySettings", null,
                        "Неверный тип поля настроек " + settingsKeys[i] + ": " +
                        typeof(settings[settingsKeys[i]]) + " вместо " +
                        typeof(rooms[key].settings[settingsKeys[i]]) + ", пропускаю");
                    continue;
                }
                if (typeof(settings[settingsKeys[i]]) === typeof(0) &&
                    (settings[settingsKeys[i]] < settingsRange[settingsKeys[i]].min ||
                    settings[settingsKeys[i]] >= settingsRange[settingsKeys[i]].max)) {
                    Signals.sFailure(socket.id, "cApplySettings", null, "Неверное значение " + settingsKeys[i]);
                    continue;
                }
                if (settingsKeys[i] === "wordNumber") {
                    if (settings[settingsKeys[i]] > dicts[rooms[key].settings["dictionaryId"]].wordNumber) {
                        Signals.sFailure(socket.id, "cApplySettings", null, "Неверное значение " + settingsKeys[i]);
                        continue;
                    }
                    warnWordsDecrease = false;
                    warnWordsDefault = false;
                }
                if (settingsKeys[i] === "turnNumber") {
                    warnTurnDefault = false;
                }
                rooms[key].settings[settingsKeys[i]] = settings[settingsKeys[i]];
            } else {
                Signals.sFailure(socket.id, "cApplySettings", null,
                    "Неверное поле настроек: " + settingsKeys[i] + ", пропускаю");
            }
        }

        if (warnWordsDecrease) {
            Signals.sFailure(socket.id, "cApplySettings", null,
                "Количество слов уменьшено до максимально возможного для данного словаря");
        }
        if (warnWordsDefault) {
            Signals.sFailure(sockwet.id, "cApplySettings", null,
                "Использовано количество слов по умолчанию.")
        }
        if (warnTurnDefault) {
            Signals.sFailure(socket.id, "cApplySettings", null,
                "Использовано количество ходов по умолчанию.");
        }

        Signals.sNewSettings(key);
    }

    static cStartGame(socket, key) {
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

        // game preparation
        rooms[key].gamePrepare();

        // recording time
        rooms[key].start_timestamp = (new Date()).getTime();

        Signals.sGameStarted(key);
    }

    static cEndWordExplanation(socket, key, cause) {
        const currentTime = (new Date()).getTime();
        switch (cause) {
            case "explained":
                // logging the word
                rooms[key].editWords.push({
                    "word": rooms[key].word,
                    "wordState": "explained",
                    "transfer": true});
                rooms[key].explanationRecords[rooms[key].explanationRecords.length - 1].push({
                    "from": rooms[key].speaker,
                    "to": rooms[key].listener,
                    "word": rooms[key].word,
                    "time": currentTime - rooms[key].explStartMainTime,
                    "extra_time": (currentTime >= rooms[key].explStartExtraTime) ? currentTime - rooms[key].explStartExtraTime : 0
                });

                // removing the word from the 'word' container
                rooms[key].word = "";

                Signals.sWordExplanationEnded(key, cause);

                // checking the time
                if ((new Date()).getTime() > rooms[key].startTime + rooms[key].settings.explanationTime) {
                    // finishing the explanation
                    finishExplanation(key);
                    return;
                }

                // if words left --- time to finish the explanation
                if (rooms[key].freshWords.length === 0) {
                    finishExplanation(key);
                    return;
                }

                // getting time
                rooms[key].explStartMainTime = currentTime;

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
                rooms[key].explanationRecords[rooms[key].explanationRecords.length - 1].push({
                    "from": rooms[key].speaker,
                    "to": rooms[key].listener,
                    "word": rooms[key].word,
                    "time": currentTime - rooms[key].explStartMainTime,
                    "extra_time": (currentTime >= rooms[key].explStartExtraTime) ? currentTime - rooms[key].explStartExtraTime : 0
                });

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
                rooms[key].explanationRecords[rooms[key].explanationRecords.length - 1].push({
                    "from": rooms[key].speaker,
                    "to": rooms[key].listener,
                    "word": rooms[key].word,
                    "time": currentTime - rooms[key].explStartMainTime,
                    "extra_time": (currentTime >= rooms[key].explStartExtraTime) ? currentTime - rooms[key].explStartExtraTime : 0
                });

                rooms[key].word = "";

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
                Signals.sFailure(socket.id, "cWordsEdited", 704, `Неверное слово на позиции ${i}`);
                return;
            }

            switch (editWords[i].wordState) {
                case "explained":
                    // counting explained words
                    cnt++;
                case "mistake":
                    // transferring data to serer structure
                    rooms[key].editWords[i].wordState = editWords[i].wordState;
                    rooms[key].explanationRecords[rooms[key].explanationRecords.length - 1][findFirstPos(
                        rooms[key].explanationRecords[rooms[key].explanationRecords.length - 1], "word", editWords[i].word
                    )].outcome = mapOutcome[editWords[i].wordState];
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

        if ("turnNumber" in rooms[key].settings && rooms[key].numberOfTurn === rooms[key].settings["turnNumber"] * rooms[key].users.length * (rooms[key].users.length - 1)) {
            endGame(key);
            return;
        }

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
        if (!checkInputFormat(socket, data, {"key": "string", "username": "string", "time_zone_offset": typeof(0)}, "cJoinRoom")) {
            return;
        }

        // Checking signal conditions
        if (!CheckConditions.cJoinRoom(socket, data)) {
            return;
        }

        // Adding the user to the room
        socket.join(data.key.toLowerCase().replace(/\s+/g, ""), (err) => Callbacks.joinRoomCallback(socket, data, err));
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
     * Implementation of cApplySettings function
     * @see API.md
     */
    socket.on("cApplySettings", function(data) {
        if (WRITE_LOGS) {
            console.log(socket.id, "cApplySettings", data);
        }

        const key = getRoom(socket); // key of the room

        // checking input format
        if (!checkInputFormat(socket, data, {"settings": "object"}, "cApplySettings")) {
            return;
        }

        // checking signal conditions
        if (!CheckConditions.cApplySettings(socket, key, data.settings)) {
            return;
        }

        Callbacks.cApplySettings(socket, key, data.settings);
    });

    /**
     * Implementation of cStartGame function
     * @see API.md
     */
    socket.on("cStartGame", function() {
        if (WRITE_LOGS) {
            console.log(socket.id, "cStartGame", undefined);
        }

        const key = getRoom(socket); // key of the room

        // checking signal conditions
        if (!CheckConditions.cStartGame(socket, key)) {
            return;
        }

        Callbacks.cStartGame(socket, key);
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
            console.log(socket.id, "cWordsEdited", data);
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

    /**
     * Implementation of cEndGame function
     * @see API.md
     */
    socket.on("cEndGame", function() {
        if (WRITE_LOGS) {
            console.log(socket.id, "cEndGame");
        }

        const key = getRoom(socket); // key of the room

        // checking signal conditions
        if (!CheckConditions.cEndGame(socket, key)) {
            return;
        }

        endGame(key);
    });

    socket.on("disconnect", function() {
        if (WRITE_LOGS) {
            console.log(socket.id, "disconnect", undefined);
        }

        Callbacks.disconnect(socket)
    });
});
