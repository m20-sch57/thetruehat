#!/usr/bin/node

const mysqlx = require("@mysql/xdevapi");
const dicts = require("./config.json").dicts;
const http = require("http");

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
    console.log("Connecting to database...");
    const session = await mysqlx.getSession({
        user: "root",
        password: "root",
        host: "localhost",
        schema: "test"
    });
    console.log("Connected to database.");
    
    const dictIDs = Object.keys(dicts);
    let failed = false;
    for (let i = 0; i < dictIDs.length; ++i) {
        const dict = dicts[dictIDs[i]];
        console.log(`Working on "${dictIDs[i]}" dictionary...`);
        switch (dict.method) {
            case "url":
                try {
                    console.log("Updating Dictionaries table...");
                    await session.sql("replace into Dictionaries (DictionaryID, DictionaryName) values (?, ?);").bind(
                        [dictIDs[i], JSON.stringify(dict.name)]
                    ).execute();
                    console.log("Dictionary table updated.");
                    console.log("Downloading words...");
                    const data = await fetch("http://the-hat.appspot.com/api/v2/dictionary/ru");
                    console.log("Words downloaded.");
                    console.log(`Updating words for "${dictIDs[i]}" dictionary...`);
                    await session.sql("start transaction;").execute();
                    for (let j = 0; j < data.length; ++j) {
                        const word = data[j];
                        await session.sql("replace into Words (Word, Difficulty, Used, Tags, DictionaryID) values (?, ?, ?, ?, ?);").bind(
                            [word.word, word.diff, word.used, word.tags, dictIDs[i]]
                        ).execute();
                        if (j % 1000 === 0) {
                            console.log(j);
                        }
                    }
                    await session.sql("commit;").execute();
                    console.log(`Words for "${dictIDs[i]}" dictionary updated.`);
                } catch (err) {
                    console.log(err);
                    failed = 1;
                }
                break;
            case "file":
                break;
        }
        console.log(`"${dictIDs[i]}" dictionary done.`);
    }
    process.exit(failed ? 1 : 0);
}

main();
