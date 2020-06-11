#!/usr/bin/node

const mysqlx = require("@mysql/xdevapi");
const dicts = require("./config.json").dicts;
const http = require("http");
const fs = require("fs");

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// This is a part of config
function getRepPos(list, field, pos) {
    for (let i = 0; i < list.length; ++i) {
        if (i === pos) {
            continue;
        }
        let first = list[pos][field].toLowerCase().replace(/ё/g, "е");
        let second = list[i][field].toLowerCase().replace(/ё/g, "е");
        if (first === second) {
            return i;
        }
    }
    return -1;
}
//----------------------------------------------------------

function rlAsync(question) {
    return new Promise(function(resolve, reject) {
        rl.question(question, function(input) {
            resolve(input);
        });
    });
}

let argv = process.argv;

let _WRITE_LOGS = true;
let _FORCE_REFRESH = false;

for (let i = 0; i < argv.length; ++i) {
    let arg = argv[i];
    let argDict = {};
    if (arg[0] === "-" && arg[1] === "-") {
        argDict[arg.slice(2, arg.length)] = true;
    } else if (arg[0] === "-" && arg[1] !== "-") {
        for (let j = 1; j < arg.length; ++j) {
            argDict[arg[j]] = true;
        }
    }
    if ("h" in argDict || "help" in argDict) {
        console.log("Usage:");
        console.log("\tloadWords.js [options]");
        console.log("Options:");
        console.log("\t--refresh\t\tdisable use of cached data")
        console.log("\t-q, --quiet\t\tprint only nessesary information (errors and questions)");
        console.log("\t-h, --help\t\tshow this help info and exit");
        process.exit(0);
    }
    if ("q" in argDict || "quiet" in argDict) {
        _WRITE_LOGS = false;
    }
    if ("refresh" in argDict) {
        _FORCE_REFRESH = true;
    }
}

const WRITE_LOGS = _WRITE_LOGS;
const FORCE_REFRESH = _FORCE_REFRESH;

function log(data) {
    if (WRITE_LOGS) {
        console.log(data);
    }
}

async function fetch(url) {
    return new Promise(function(resolve, reject) {
        http.get(url, function(res) {
            const statusCode = res.statusCode;
            const contentType = res.headers["content-type"];

            let error;
            if (statusCode !== 200) {
                error = new Error("Request Failed.\n" +
                    `Status Code: ${statusCode}`);
            }
            if (error) {
                console.error(error.message);
                res.resume();
                resolve(null);
            }

            res.setEncoding("utf8");
            let rawData = "";
            res.on("data", (chunk) => { rawData += chunk; });
            res.on("end", () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                } catch (e) {
                    console.error(e.message);
                    resolve(null);
                }
            });
        });
    });
}

async function main() { 
    log("Connecting to database...");
    const session = await mysqlx.getSession({
        user: "root",
        password: "root",
        host: "localhost",
        schema: "test"
    });
    log("Connected to database.");
    
    const dictIDs = Object.keys(dicts);
    let failed = false;
    for (let i = 0; i < dictIDs.length; ++i) {
        const dict = dicts[dictIDs[i]];
        log(`Working on "${dictIDs[i]}" dictionary...`);
        switch (dict.method) {
            case "url":
                try {
                    log("Updating Dictionaries table...");
                    await session.sql("replace into Dictionaries (DictionaryID, DictionaryName) values (?, ?);").bind(
                        [dictIDs[i], JSON.stringify(dict.name)]
                    ).execute();
                    log("Dictionary table updated.");
                    let expired = true;
                    if (!FORCE_REFRESH) {
                        log("Running data expiration check...");
                        if (fs.existsSync("./.loadCache/" + dictIDs[i] + "-lock.json")) {
                            const checkTime = require("./.loadCache/" + dictIDs[i] + "-lock.json").timestamp;
                            if ((new Date()).getTime() - checkTime <= dict.expirationTime) {
                                expired = false;
                            }
                            log("Data expiration check succeeded.");
                        }
                    }
                    let _data = null;
                    if (expired || FORCE_REFRESH) {
                        log("Downloading words...");
                        // downloading words
                        _data = await fetch(dict.url);
                        log("Words downloaded.");

                        log("Processing words...");
                        let processedData = [];
                        for (let j = 0; j < _data.length; ++j) {
                            const repPos = getRepPos(_data, "word", j);
                            if (repPos !== -1) {
                                console.log("Following records have equal words:");
                                console.log(_data[repPos]);
                                console.log(_data[j]);
                                let ans = await rlAsync("Use (F)irst or use (S)econd: ");
                                while (!(ans in {"F": null, "S": null})) {
                                    console.log("Bad answer: " + ans + ". Please, answer `F` or `S`.");
                                    ans = await rlAsync("Use (F)irst or use (S)econd: ");
                                }
                                if (ans === "F") {
                                    continue;
                                }
                                if (ans === "S") {
                                    processedData = processedData.splice(j, 1);
                                    processedData.push(_data[j]);
                                }
                            }
                            if (j % 100 === 0) {
                                console.log(j);
                            }
                        }
                        log("Words processed.");

                        log("Saving cache...");
                        // generating cache
                        const time = (new Date()).getTime();
                        // updating cache
                        fs.writeFile("./.loadCache/" + dictIDs[i] + ".json", JSON.stringify({"data": _data}), function(err, data) {
                            if (err) {
                                console.warn(err);
                            }
                        });
                        fs.writeFile("./.loadCache/" + dictIDs[i] + "-proc.json", JSON.stringify({"data": processedData}), function(err, data) {
                            if (err) {
                                console.warn(err);
                            }
                        });
                        fs.writeFile("./.loadCache/" + dictIDs[i] + "-lock.json", JSON.stringify({"timestamp": time}), function(err, data) {
                            if (err) {
                                cosnsole.warn(err);
                            }
                        });
                        _data = processedData;
                        log("Cache saved.");
                    } else {
                        log("Loading cached data...");
                        let ans = await rlAsync("Use (P)rocessed data or (R)aw data: ");
                        while (!(ans in {"P": null, "R": null})) {
                            console.log("Bad answer: " + ans + ". Please, answer `P` or `R`.");
                            ans = await rlAsync("Use (P)rocessed data or (R)aw data: ");
                        }
                        let dType = "";
                        if (ans === "P") {
                            dType = "proc";
                        }
                        _data = require("./.loadCache/" + dictIDs[i] + "-" + dType + ".json").data;
                        log("Loaded cached data.");
                    }
                    const data = _data;
                    log("Uploading words to tmp table...");
                    await session.sql("create table tmp(Word CHAR(32), Difficulty INTEGER, Used INTEGER, Tags TEXT, DictionaryID INTEGER);").bind().execute();
                    await session.sql("start transaction;").execute();
                    for (let j = 0; j < data.length; ++j) {
                        const word = data[j];
                        await session.sql("insert into tmp (Word, Difficulty, Used, Tags, DictionaryID) values (?, ?, ?, ?, ?);").bind(
                            [word.word, word.diff, word.used, word.tags, dictIDs[i]]
                        ).execute();
                    }
                    await session.sql("commit;").execute();
                    log("Words uploaded.");
                    log(`Updating words for "${dictIDs[i]}" dictionary...`);
                    log("Removing unchanged word records from tmp table...");
                    await session.sql("delete from tmp where exists (select (Word, Difficulty, Used, Tags, DictionaryID) from Words tmp.Word = Words.Word and tmp.Difficulty = Words.Difficulty and tmp.Used = Words.Used and tmp.Tags = Words.Tags and tmp.DictionaryID = Words.DictionaryID);").bind().execute();
                    log("Removed unchannged word records from tmp table.");
                    log("Updating word records...");
                    //TODO: rewrite
                    await session.sql("start transaction;").execute();
                    for (let j = 0; j < data.length; ++j) {
                        const word = data[j];
                        /*
                        await session.sql("replace into Words (Word, Difficulty, Used, Tags, DictionaryID) values (?, ?, ?, ?, ?);").bind(
                            [word.word, word.diff, word.used, word.tags, dictIDs[i]]
                        ).execute();
                        */
                    }
                    await session.sql("commit;").execute();
                    log("Updated word records.");
                    log(`Words for "${dictIDs[i]}" dictionary updated.`);
                } catch (err) {
                    log(err);
                    failed = 1;
                }
                break;
            case "file":
                break;
        }
        log(`"${dictIDs[i]}" dictionary done.`);
    }
    process.exit(failed ? 1 : 0);
}

main();
