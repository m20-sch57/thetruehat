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
function getRepPos(list, field, pos, del) {
    for (let i = 0; i < pos; ++i) {
        if (i === pos) {
            continue;
        }
        if (i in del) {
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
let _PROCESS_OPTION = null;

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
        console.log("\t-p[variant]\t\tautomatically use given variant when processing words");
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
    if ("p" in argDict && arg.length === 3 && "p" === arg[1]) {
        if (arg[2] in {"F": null, "S": null, "U": null}) {
            _PROCESS_OPTION = arg[2];
        } else {
            console.log("Invalid variant for `p` option, ignoring...");
        }
    }
}

const WRITE_LOGS = _WRITE_LOGS;
const FORCE_REFRESH = _FORCE_REFRESH;
const PROCESS_OPTION = _PROCESS_OPTION;

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

async function processData(_data) {
    log("Processing words...");
    let processedData = [];
    let del = {};
    for (let j = 0; j < _data.length; ++j) {
        const repPos = getRepPos(_data, "word", j, del);
        if (repPos !== -1) {
            if (PROCESS_OPTION !== null) {
                ans = PROCESS_OPTION;
            } else {
                console.log("Following records have equal words:");
                console.log(_data[repPos]);
                console.log(_data[j]);
                let ans = await rlAsync("Use (F)irst, (S)econd, or with more (U)ses: ");
                while (!(ans in {"F": null, "S": null, "U": null})) {
                    console.log("Bad answer: " + ans + ". Please, answer `F`, `S`, or `U`.");
                    ans = await rlAsync("Use (F)irst, (S)econd, or with more (U)ses: ");
                }
            }
            if (ans === "U") {
                if (_data[j].used <= _data[repPos].used) {
                    continue;
                }
                ans = "S";
            }
            if (ans === "F") {
                continue;
            }
            if (ans === "S") {
                del[repPos] = true;
                processedData.push(_data[j]);
            }
        } else {
            processedData.push(_data[j]);
        }
    }
    let ansData = [];
    for (let i = 0; i < processedData.length; ++i) {
        if (!(i in del)) {
            ansData.push(processedData[i]);
        }
    }
    log(ansData);
    log("Words processed.");
    return ansData;
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
    let failed = 0;
    for (let i = 0; i < dictIDs.length; ++i) {
        const dict = dicts[dictIDs[i]];
        let _data = null;
        log(`Working on "${dictIDs[i]}" dictionary...`);
        switch (dict.method) {
            case "url":
                try {
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
                    if (expired || FORCE_REFRESH) {
                        log("Downloading words...");
                        // downloading words
                        _data = await fetch(dict.url);
                        log("Words downloaded.");

                        // Processing data
                        let processedData = await processData(_data);

                        log("Saving cache...");
                        // generating cache
                        const time = (new Date()).getTime();
                        // updating cache
                        fs.writeFile("./.loadCache/" + dictIDs[i] + ".json", JSON.stringify({"data": _data, "lehgth": _data.length}), function(err, data) {
                            if (err) {
                                console.warn(err);
                            }
                        });
                        fs.writeFile("./.loadCache/" + dictIDs[i] + "-proc.json", JSON.stringify({"data": processedData, "length": processedData.length}), function(err, data) {
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
                            dType = "-proc";
                        }
                        _data = require("./.loadCache/" + dictIDs[i] + dType + ".json").data;
                        if (ans === "R") {
                            _data = await processData(_data);
                            fs.writeFile("./.loadCache/" + dictIDs[i] + "-proc.json", JSON.stringify({"data": _data, "length": _data.length}), function(err, data) {
                                if (err) {
                                    console.warn(err);
                                }
                            });
                        }
                        log("Loaded cached data.");
                    }
                } catch (err) {
                    console.warn(err);
                    failed += 1;
                }
                break;
            case "file":
                let rawData = require(dict.file).words;
                _data = [];
                for (let j = 0; j < rawData.length; ++j) {
                    _data.push({"word": rawData[j], "tags": "", "diff": 0, "used": 0});
                }
                break;
            default:
                console.warn("Improper method " + dict.method + ". Skipping.");
                continue;
                break;
        }
        try {
            log("Updating Dictionaries table...");
            await session.sql("replace into Dictionaries (DictionaryID, DictionaryName) values (?, ?);").bind(
                [dictIDs[i], JSON.stringify(dict.name)]
            ).execute();
            log("Dictionary table updated.");
            const data = _data;
            log("Uploading words to tmp table...");
            await session.sql("create table if not exists tmp(Word CHAR(32), Difficulty INTEGER, Used INTEGER, Tags TEXT, DictionaryID INTEGER);").execute();
            await session.sql("truncate table tmp;").execute();
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
            //await rlAsync("Before removing. ");
            await session.sql("delete from tmp where exists (select * from Words where tmp.Word = Words.Word and tmp.Difficulty = Words.Difficulty and tmp.Used = Words.Used and tmp.Tags = Words.Tags and tmp.DictionaryID = Words.DictionaryID);").execute();
            log("Removed unchannged word records from tmp table.");
            //await rlAsync("After removing. ");
            log("Updating word records...");
            await session.sql("update Words w inner join tmp t on w.Word = t.Word and w.DictionaryID = t.DictionaryID set w.Word = t.Word, w.Used = t.Used, w.Tags = t.Tags, w.Difficulty = t.Difficulty;").execute();
            await session.sql("insert ignore into Words(Word, Used, Tags, Difficulty, DictionaryID) select Word, Used, Tags, Difficulty, DictionaryID from tmp;").execute();
            log("Updated word records.");
            log("Cleaning up...");
            await session.sql("drop table tmp;").execute();
            log("Cleaned up.")
            log(`Words for "${dictIDs[i]}" dictionary updated.`);
            log(`"${dictIDs[i]}" dictionary done.`);
        } catch (err) {
            console.warn(err);
            failed += 1;
        }
    }
    process.exit(failed);
}

main();
