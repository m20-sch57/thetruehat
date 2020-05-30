#!/usr/bin/node

const mysqlx = require("@mysql/xdevapi");
const request = require('request');

async function main() { 
    console.log("Connecting to database...");
    const session = await mysqlx.getSession({
        user: "root",
        password: "root",
        host: "localhost",
        schema: "test"
    });
    console.log("Connected to database.");
    
    console.log("Downloading words...");
    request('http://the-hat.appspot.com/api/v2/dictionary/ru', async function (error, response, body) {
        const all = JSON.parse(body);
        try {
            await session.sql("START TRANSACTION;").execute();
            console.log("Words downloaded.")
            console.log("Updating database...");
            for (let i = 0; i < all.length; ++i) {
                const word = all[i];
                await session.sql("REPLACE INTO Words VALUES (?,?,?,?);").bind(
                    word.word,
                    word.diff,
                    word.used,
                    word.tags).execute();
            }
            await session.sql("COMMIT;").execute();
            console.log("Database updated.");
            process.exit(0);
        } catch (err) {
            console.log(err);
            process.exit(1);
        }
    });
}

main();
