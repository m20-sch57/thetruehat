#!/usr/bin/node

const mysqlx = require("@mysql/xdevapi");
const dicts = require("./config.json").dicts;
const http = require("http");

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
        console.log("\t-q, --quiet\t\tprint only errors");
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
                        //TODO: implement
                        log("Data expiration check succeeded.");
                    }
                    let _data = null;
                    if (expired || FORCE_REFRESH) {
                        log("Downloading words...");
                        // downloading words
                        _data = await fetch(dict.url);

                        // updating cache
                        //
                        log("Words downloaded.");
                    } else {
                        log("Loading cached data...");
                        //TODO: implement
                        log("Loaded cached data.");
                    }
                    const data = _data;
                    log("Processing words...");
                    //TODO: implement
                    log("Words processed.");
                    log("Uploading words to tmp table...");
                    //TODO: implement
                    log("Words uploaded.");
                    log(`Updating words for "${dictIDs[i]}" dictionary...`);
                    log("Removing unchanged word records from tmp table...");
                    //TODO: implement
                    log("Removed unchannged word records from tmp table.");
                    log("Updating word records...");
                    //TODO: rewrite
                    await session.sql("start transaction;").execute();
                    for (let j = 0; j < data.length; ++j) {
                        const word = data[j];
                        await session.sql("replace into Words (Word, Difficulty, Used, Tags, DictionaryID) values (?, ?, ?, ?, ?);").bind(
                            [word.word, word.diff, word.used, word.tags, dictIDs[i]]
                        ).execute();
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
